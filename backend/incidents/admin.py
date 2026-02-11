from django.contrib import admin
from .models import Incident, IncidentNote, Evidence, AuditLog, PublicReport

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'incident_type', 'title', 'status', 'severity', 'assigned_to', 'created_at']
    list_filter = ['status', 'incident_type', 'severity', 'is_public_report', 'created_at']
    search_fields = ['reference_number', 'title', 'description', 'location_building']
    readonly_fields = ['reference_number', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Incident Information', {
            'fields': ('reference_number', 'incident_type', 'title', 'description', 'severity')
        }),
        ('Location', {
            'fields': ('location_building', 'location_floor', 'location_details', 'latitude', 'longitude')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'reported_by', 'assigned_to')
        }),
        ('Public Report', {
            'fields': ('is_public_report', 'reporter_name', 'reporter_email', 'reporter_phone', 'is_anonymous')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )

@admin.register(IncidentNote)
class IncidentNoteAdmin(admin.ModelAdmin):
    list_display = ['incident', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['incident__reference_number', 'note']
    readonly_fields = ['created_at']

@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ['incident', 'file_type', 'file_size', 'uploaded_by', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    search_fields = ['incident__reference_number', 'description']
    readonly_fields = ['uploaded_at', 'file_size', 'file_type']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'entity_type', 'entity_id', 'created_at']
    list_filter = ['action', 'entity_type', 'created_at']
    search_fields = ['description', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'

@admin.register(PublicReport)
class PublicReportAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'incident_type', 'status', 'is_anonymous', 'created_at']
    list_filter = ['status', 'incident_type', 'is_anonymous', 'created_at']
    search_fields = ['reference_number', 'description']
    readonly_fields = ['reference_number', 'created_at']
