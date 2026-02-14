from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Count
from django.utils import timezone
from .models import Incident, IncidentNote, Evidence, AuditLog, PublicReport
from .serializers import (
    IncidentListSerializer, IncidentDetailSerializer, 
    IncidentCreateSerializer, IncidentUpdateSerializer,
    IncidentNoteSerializer, EvidenceSerializer,
    PublicReportSerializer, PublicReportStatusSerializer,
    AuditLogSerializer
)


class IncidentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
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
        assigned_to = self.request.query_params.get('assigned_to', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if incident_type:
            queryset = queryset.filter(incident_type=incident_type)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        if search:
            queryset = queryset.filter(
                Q(reference_number__icontains=search) |
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.select_related('reported_by', 'assigned_to')
    
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
        incidents = Incident.objects.filter(assigned_to=request.user)
        serializer = IncidentListSerializer(incidents, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def advanced_analytics(self, request):
        """Get detailed analytics for security analysis"""
        user = request.user
        if user.role in ['supervisor', 'head', 'admin']:
            incidents = Incident.objects.all()
        else:
            incidents = Incident.objects.filter(Q(assigned_to=user) | Q(reported_by=user))

        # Frequency by hour of day (0-23)
        # Using __hour lookup on created_at
        by_hour = incidents.values('created_at__hour').annotate(count=Count('id')).order_by('created_at__hour')
        
        # Convert to list of 24 hours
        hour_stats = {h: 0 for h in range(24)}
        for entry in by_hour:
            hour_stats[entry['created_at__hour']] = entry['count']
        
        # Group by Location Building
        by_location = incidents.values('location_building').annotate(count=Count('id')).order_by('-count')

        return Response({
            'by_hour': [{'hour': k, 'count': v} for k, v in hour_stats.items()],
            'by_location': [{'location': entry['location_building'], 'count': entry['count']} for entry in by_location],
        })

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
    permission_classes = [permissions.IsAuthenticated]
    
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
