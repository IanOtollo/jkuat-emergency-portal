from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('guard', 'Security Guard'),
        ('supervisor', 'Security Supervisor'),
        ('head', 'Head of Security'),
        ('admin', 'System Administrator'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='guard')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.full_name} ({self.role})"
