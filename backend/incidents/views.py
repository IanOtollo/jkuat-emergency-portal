from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from datetime import timedelta
from users.permissions import IsAdminUser, IsSupervisorUser, IsHeadOfSecurity, IsSecurityGuard
from .models import Incident, IncidentNote, Evidence, AuditLog, PublicReport
from .serializers import (
    IncidentListSerializer, IncidentDetailSerializer, 
    IncidentCreateSerializer, IncidentUpdateSerializer,
    IncidentNoteSerializer, EvidenceSerializer,
    PublicReportSerializer, PublicReportStatusSerializer,
    AuditLogSerializer
)
import csv
from django.http import HttpResponse


class IncidentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['advanced_analytics', 'dashboard_stats']:
            return [IsSupervisorUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return IncidentListSerializer
        elif self.action == 'create':
            return IncidentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return IncidentUpdateSerializer
        return IncidentDetailSerializer
    
    def get_queryset(self):
        queryset = Incident.objects.all()
        user = self.request.user
        
        # Only supervisors, heads, and admins see all incidents
        if user.role not in ['supervisor', 'head', 'admin']:
            queryset = queryset.filter(
                Q(assigned_to=user) | Q(reported_by=user)
            )
        
        # Filter by query params
        status_filter = self.request.query_params.get('status', None)
        incident_type = self.request.query_params.get('type', None)
        severity = self.request.query_params.get('severity', None)
        assigned_to = self.request.query_params.get('assigned_to', None)
        search = self.request.query_params.get('search', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if incident_type:
            queryset = queryset.filter(incident_type=incident_type)
        if severity:
            queryset = queryset.filter(severity=severity)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        if search:
            queryset = queryset.filter(
                Q(reference_number__icontains=search) |
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        return queryset.select_related('reported_by', 'assigned_to')

    @action(detail=True, methods=['post'], permission_classes=[IsSupervisorUser])
    def assign(self, request, pk=None):
        """Dedicated action to assign an officer to an incident"""
        incident = self.get_object()
        officer_id = request.data.get('officer_id')
        
        if not officer_id:
            return Response({'error': 'officer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            officer = User.objects.get(id=officer_id)
        except User.DoesNotExist:
            return Response({'error': 'Officer not found'}, status=status.HTTP_404_NOT_FOUND)
            
        incident.assigned_to = officer
        incident.status = 'assigned'
        incident.save()
        
        # Log assignment
        AuditLog.objects.create(
            user=request.user,
            action='assign',
            entity_type='incident',
            entity_id=incident.id,
            description=f'Assigned incident {incident.reference_number} to {officer.full_name}'
        )
        
        return Response(IncidentDetailSerializer(incident).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Dedicated action to close an incident"""
        incident = self.get_object()
        note_text = request.data.get('resolution_note', 'Incident closed.')
        
        # Check permissions: Assigned officer or Supervisor+
        user = request.user
        if incident.assigned_to != user and user.role not in ['supervisor', 'head', 'admin']:
             return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
             
        incident.status = 'closed'
        incident.resolved_at = timezone.now()
        incident.save()
        
        # Add a final note
        IncidentNote.objects.create(
            incident=incident,
            user=user,
            note=f"RESOLUTION: {note_text}"
        )
        
        # Log closure
        AuditLog.objects.create(
            user=user,
            action='status_change',
            entity_type='incident',
            entity_id=incident.id,
            description=f'Closed incident {incident.reference_number}'
        )
        
        return Response(IncidentDetailSerializer(incident).data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        incident = serializer.save()
        
        # Log creation
        AuditLog.objects.create(
            user=request.user,
            action='create',
            entity_type='incident',
            entity_id=incident.id,
            description=f'Created incident {incident.reference_number}'
        )
        
        return Response(
            IncidentDetailSerializer(incident).data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        incident = serializer.save()
        
        # If status changed to resolved, set resolved_at
        if 'status' in request.data and request.data['status'] == 'resolved' and old_status != 'resolved':
            incident.resolved_at = timezone.now()
            incident.save()
        
        # Log update
        changes = ', '.join([f"{k}: {v}" for k, v in request.data.items()])
        AuditLog.objects.create(
            user=request.user,
            action='status_change' if 'status' in request.data else 'update',
            entity_type='incident',
            entity_id=incident.id,
            description=f'Updated incident {incident.reference_number}: {changes}'
        )
        
        return Response(IncidentDetailSerializer(incident).data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        incident = self.get_object()
        serializer = IncidentNoteSerializer(data=request.data)
        
        if serializer.is_valid():
            note = serializer.save(incident=incident, user=request.user)
            
            # Log note addition
            AuditLog.objects.create(
                user=request.user,
                action='update',
                entity_type='incident',
                entity_id=incident.id,
                description=f'Added note to incident {incident.reference_number}'
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_evidence(self, request, pk=None):
        incident = self.get_object()
        file = request.FILES.get('file')
        
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (10MB)
        if file.size > 10485760:
            return Response({'error': 'File too large (max 10MB)'}, status=status.HTTP_400_BAD_REQUEST)
        
        evidence = Evidence.objects.create(
            incident=incident,
            file=file,
            file_type=file.content_type.split('/')[-1],
            file_size=file.size,
            description=request.data.get('description', ''),
            uploaded_by=request.user
        )
        
        # Log upload
        AuditLog.objects.create(
            user=request.user,
            action='upload',
            entity_type='evidence',
            entity_id=evidence.id,
            description=f'Uploaded evidence to incident {incident.reference_number}'
        )
        
        return Response(EvidenceSerializer(evidence).data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_incidents(self, request):
        """Get incidents assigned to current user"""
        incidents = Incident.objects.filter(assigned_to=request.user).select_related('reported_by', 'assigned_to')
        serializer = IncidentListSerializer(incidents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def advanced_analytics(self, request):
        """Get detailed analytics for security analysis"""
        from django.core.cache import cache
        cache_key = f"analytics_{request.user.id}_{request.user.role}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        user = request.user
        if user.role in ['supervisor', 'head', 'admin']:
            incidents = Incident.objects.all()
        else:
            incidents = Incident.objects.filter(Q(assigned_to=user) | Q(reported_by=user))

        # Trends - Last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        trends = incidents.filter(created_at__gte=thirty_days_ago)\
            .extra(select={'date': "DATE(created_at)"})\
            .values('date')\
            .annotate(count=Count('id'))\
            .order_by('date')

        # Frequency by hour of day (0-23)
        by_hour = incidents.values('created_at__hour').annotate(count=Count('id')).order_by('created_at__hour')
        hour_stats = {h: 0 for h in range(24)}
        for entry in by_hour:
            hour_stats[entry['created_at__hour']] = entry['count']
        
        # Group by Location Building
        by_location = incidents.values('location_building').annotate(count=Count('id')).order_by('-count')

        # Severity distribution
        by_severity = incidents.values('severity').annotate(count=Count('id'))

        # Resolution Time (Avg in hours)
        resolved_incidents = incidents.filter(status__in=['resolved', 'closed'], resolved_at__isnull=False)
        duration_expr = ExpressionWrapper(
            F('resolved_at') - F('created_at'),
            output_field=fields.DurationField()
        )
        avg_resolution = resolved_incidents.annotate(duration=duration_expr).aggregate(Avg('duration'))['duration__avg']
        
        avg_res_hours = 0
        if avg_resolution:
            avg_res_hours = round(avg_resolution.total_seconds() / 3600, 1)

        # Officer Performance (Resolved counts per officer)
        officer_performance = resolved_incidents.values('assigned_to__full_name')\
            .annotate(count=Count('id'))\
            .order_by('-count')

        # Efficiency by Category (Avg resolution time per incident type)
        efficiency_by_type = resolved_incidents.annotate(duration=duration_expr)\
            .values('incident_type')\
            .annotate(avg_hours=Avg('duration'))
        
        type_efficiency = []
        for entry in efficiency_by_type:
            hours = entry['avg_hours'].total_seconds() / 3600 if entry['avg_hours'] else 0
            type_efficiency.append({
                'type': entry['incident_type'],
                'avg_hours': round(hours, 1)
            })

        result = {
            'trends': list(trends),
            'by_hour': [{'hour': k, 'count': v} for k, v in hour_stats.items()],
            'by_location': [{'location': entry['location_building'], 'count': entry['count']} for entry in by_location],
            'by_severity': {entry['severity']: entry['count'] for entry in by_severity},
            'avg_resolution_hours': avg_res_hours,
            'resolved_count': resolved_incidents.count(),
            'officer_performance': list(officer_performance),
            'type_efficiency': type_efficiency
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, result, 300)
        return Response(result)

    @action(detail=False, methods=['get'], permission_classes=[IsSupervisorUser])
    def export_incidents(self, request):
        """Export incidents as CSV"""
        queryset = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="incidents_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Ref Number', 'Title', 'Type', 'Status', 'Severity', 'Location', 'Reported By', 'Assigned To', 'Created At', 'Resolved At'])
        
        for incident in queryset:
            writer.writerow([
                incident.reference_number,
                incident.title,
                incident.incident_type,
                incident.status,
                incident.severity,
                f"{incident.location_building} - {incident.location_floor}",
                incident.reported_by.full_name if incident.reported_by else 'System/Public',
                incident.assigned_to.full_name if incident.assigned_to else 'Unassigned',
                incident.created_at.strftime('%Y-%m-%d %H:%M'),
                incident.resolved_at.strftime('%Y-%m-%d %H:%M') if incident.resolved_at else ''
            ])
        
        return response

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        user = request.user
        
        if user.role in ['supervisor', 'head', 'admin']:
            incidents = Incident.objects.all()
        else:
            incidents = Incident.objects.filter(Q(assigned_to=user) | Q(reported_by=user))
        
        stats = {
            'total': incidents.count(),
            'pending': incidents.filter(status='pending').count(),
            'assigned': incidents.filter(status='assigned').count(),
            'in_progress': incidents.filter(status='in_progress').count(),
            'resolved': incidents.filter(status='resolved').count(),
            'by_type': dict(incidents.values('incident_type').annotate(count=Count('id')).values_list('incident_type', 'count')),
            'by_severity': dict(incidents.values('severity').annotate(count=Count('id')).values_list('severity', 'count')),
        }
        
        return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def public_report_submit(request):
    """Public endpoint for submitting reports"""
    serializer = PublicReportSerializer(data=request.data)
    
    if serializer.is_valid():
        report = serializer.save()
        
        # Create corresponding incident
        incident = Incident.objects.create(
            incident_type=report.incident_type,
            title=f"Public Report: {report.incident_type}",
            description=report.description,
            location_building=report.location_building,
            location_floor=report.location_floor,
            reporter_name=report.reporter_name,
            reporter_email=report.reporter_email,
            reporter_phone=report.reporter_phone,
            is_anonymous=report.is_anonymous,
            is_public_report=True,
            status='pending'
        )
        
        report.incident = incident
        report.save()
        
        # Log public submission
        AuditLog.objects.create(
            action='create',
            entity_type='public_report',
            entity_id=report.id,
            description=f'Anonymous public report submitted: {report.reference_number}'
        )
        
        return Response({
            'reference_number': report.reference_number,
            'message': 'Report submitted successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_report_status(request, reference_number):
    """Check status of public report"""
    try:
        report = PublicReport.objects.get(reference_number=reference_number)
        serializer = PublicReportStatusSerializer(report)
        return Response(serializer.data)
    except PublicReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsSupervisorUser]
    
    def get_queryset(self):
        # Only supervisors and above can view audit logs
        if self.request.user.role not in ['supervisor', 'head', 'admin']:
            return AuditLog.objects.none()
        
        queryset = AuditLog.objects.all()
        
        # Filter by query params
        user_id = self.request.query_params.get('user', None)
        action = self.request.query_params.get('action', None)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if action:
            queryset = queryset.filter(action=action)
        
        return queryset.select_related('user')
