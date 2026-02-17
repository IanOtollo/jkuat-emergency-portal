from django.db import models
from django.conf import settings
import uuid

class Incident(models.Model):
    INCIDENT_TYPES = [
        ('theft', 'Theft/Burglary'),
        ('suspicious', 'Suspicious Activity'),
        ('vandalism', 'Vandalism'),
        ('lost_found', 'Lost and Found'),
        ('noise', 'Noise Complaint'),
        ('facility', 'Facility Issue'),
        ('traffic', 'Traffic Incident'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    reference_number = models.CharField(max_length=20, unique=True, editable=False)
    incident_type = models.CharField(max_length=50, choices=INCIDENT_TYPES, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    location_building = models.CharField(max_length=100)
    location_floor = models.CharField(max_length=50, blank=True)
    location_details = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium', db_index=True)
    
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='reported_incidents')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_incidents')
    
    is_public_report = models.BooleanField(default=False)
    reporter_name = models.CharField(max_length=100, blank=True)
    reporter_email = models.EmailField(blank=True)
    reporter_phone = models.CharField(max_length=20, blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'incidents'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.reference_number:
            from datetime import datetime
            year = datetime.now().year
            count = Incident.objects.filter(reference_number__startswith=f'INC-{year}').count() + 1
            self.reference_number = f'INC-{year}-{count:05d}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference_number} - {self.title}"


class IncidentNote(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'incident_notes'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Note on {self.incident.reference_number}"


class Evidence(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='evidence')
    file = models.FileField(upload_to='evidence/%Y/%m/%d/')
    file_type = models.CharField(max_length=10)
    file_size = models.IntegerField()
    description = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'evidence'
        ordering = ['uploaded_at']
    
    def __str__(self):
        return f"Evidence for {self.incident.reference_number}"


class AuditLog(models.Model):
    ACTION_TYPES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('assign', 'Assign'),
        ('status_change', 'Status Change'),
        ('upload', 'File Upload'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_TYPES, db_index=True)
    entity_type = models.CharField(max_length=50, db_index=True)
    entity_id = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    changes = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.action} by {self.user} at {self.created_at}"


class PublicReport(models.Model):
    reference_number = models.CharField(max_length=20, unique=True, editable=False)
    incident = models.OneToOneField(Incident, on_delete=models.CASCADE, null=True, blank=True, related_name='public_report')
    
    incident_type = models.CharField(max_length=50)
    description = models.TextField()
    location_building = models.CharField(max_length=100)
    location_floor = models.CharField(max_length=50, blank=True)
    
    reporter_name = models.CharField(max_length=100, blank=True)
    reporter_email = models.EmailField(blank=True)
    reporter_phone = models.CharField(max_length=20, blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, default='received')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'public_reports'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.reference_number:
            from datetime import datetime
            year = datetime.now().year
            count = PublicReport.objects.filter(reference_number__startswith=f'PUB-{year}').count() + 1
            self.reference_number = f'PUB-{year}-{count:05d}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference_number}"
