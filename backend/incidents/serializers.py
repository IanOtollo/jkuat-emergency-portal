from rest_framework import serializers
from .models import Incident, IncidentNote, Evidence, AuditLog, PublicReport
from users.serializers import UserSerializer

class EvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = Evidence
        fields = ['id', 'file', 'file_type', 'file_size', 'description', 
                  'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size', 'file_type']


class IncidentNoteSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = IncidentNote
        fields = ['id', 'note', 'user', 'user_name', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class IncidentListSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    evidence_count = serializers.SerializerMethodField()
    notes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = ['id', 'reference_number', 'incident_type', 'title', 'location_building', 
                  'status', 'severity', 'reported_by_name', 'assigned_to_name', 
                  'created_at', 'evidence_count', 'notes_count', 'is_public_report']
    
    def get_evidence_count(self, obj):
        return obj.evidence.count()
    
    def get_notes_count(self, obj):
        return obj.notes.count()


class IncidentDetailSerializer(serializers.ModelSerializer):
    reported_by_details = UserSerializer(source='reported_by', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    evidence = EvidenceSerializer(many=True, read_only=True)
    notes = IncidentNoteSerializer(many=True, read_only=True)
    response_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Incident
        fields = '__all__'
        read_only_fields = ['id', 'reference_number', 'reported_by', 'created_at', 'updated_at']
    
    def get_response_time(self, obj):
        if obj.resolved_at and obj.created_at:
            delta = obj.resolved_at - obj.created_at
            hours = delta.total_seconds() / 3600
            return round(hours, 2)
        return None


class IncidentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ['incident_type', 'title', 'description', 'location_building', 
                  'location_floor', 'location_details', 'latitude', 'longitude', 
                  'severity', 'assigned_to']
    
    def create(self, validated_data):
        validated_data['reported_by'] = self.context['request'].user
        return super().create(validated_data)


class IncidentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ['status', 'severity', 'assigned_to', 'title', 'description', 
                  'location_building', 'location_floor', 'location_details']


class PublicReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicReport
        fields = ['id', 'reference_number', 'incident_type', 'description', 
                  'location_building', 'location_floor', 'reporter_name', 
                  'reporter_email', 'reporter_phone', 'is_anonymous', 
                  'status', 'created_at']
        read_only_fields = ['id', 'reference_number', 'status', 'created_at']


class PublicReportStatusSerializer(serializers.ModelSerializer):
    incident_status = serializers.CharField(source='incident.status', read_only=True)
    incident_reference = serializers.CharField(source='incident.reference_number', read_only=True)
    
    class Meta:
        model = PublicReport
        fields = ['reference_number', 'status', 'incident_status', 'incident_reference', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
