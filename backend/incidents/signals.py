from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import Incident, IncidentNote, Evidence, AuditLog
from django.contrib.auth import get_user_model
from incident_system.middleware import get_current_user, get_current_ip

User = get_user_model()

@receiver(pre_save, sender=Incident)
@receiver(pre_save, sender=User)
def capture_previous_state(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_instance = sender.objects.get(pk=instance.pk)
        except sender.DoesNotExist:
            instance._old_instance = None
    else:
        instance._old_instance = None

@receiver(post_save, sender=Incident)
@receiver(post_save, sender=User)
@receiver(post_save, sender=IncidentNote)
@receiver(post_save, sender=Evidence)
def log_save(sender, instance, created, **kwargs):
    action = 'create' if created else 'update'
    user = get_current_user()
    ip = get_current_ip()
    
    # Custom action name for uploads
    if sender == Evidence and created:
        action = 'upload'

    # Don't log if we can't identify the user (optional, depending on requirements)
    # if not user or user.is_anonymous:
    #     return

    changes = {}
    if not created and hasattr(instance, '_old_instance') and instance._old_instance:
        old_dict = model_to_dict(instance._old_instance)
        new_dict = model_to_dict(instance)
        
        for field, value in new_dict.items():
            if field in ['password', 'last_login']: # Ignore sensitive or noise fields
                continue
            old_value = old_dict.get(field)
            if value != old_value:
                changes[field] = {
                    'old': str(old_value),
                    'new': str(value)
                }
    
    # If update but no changes, skip logging
    if action == 'update' and not changes:
        return

    name = getattr(instance, 'username', getattr(instance, 'reference_number', str(instance.pk)))
    description = f"{action.capitalize()}d {sender.__name__}: {name}"

    AuditLog.objects.create(
        user=user if user and not user.is_anonymous else None,
        action=action,
        entity_type=sender.__name__.lower(),
        entity_id=instance.id,
        description=description,
        changes=changes if changes else None,
        ip_address=ip
    )

@receiver(post_delete, sender=Incident)
@receiver(post_delete, sender=User)
def log_delete(sender, instance, **kwargs):
    user = get_current_user()
    ip = get_current_ip()
    
    name = getattr(instance, 'username', getattr(instance, 'reference_number', str(instance.pk)))
    
    AuditLog.objects.create(
        user=user if user and not user.is_anonymous else None,
        action='delete',
        entity_type=sender.__name__.lower(),
        entity_id=instance.id,
        description=f"Deleted {sender.__name__}: {name}",
        ip_address=ip
    )
