from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
import json
from .models import AuditLog
from .middleware import get_current_user

# Models that we don't want to track to avoid infinite loops or unnecessary logs
EXCLUDED_MODELS = ['AuditLog', 'Session', 'LogEntry']

def get_serializable_dict(instance):
    try:
        data = model_to_dict(instance)
        # Convert it to a JSON serializable dict to avoid serialization issues with datetime, UUID, etc.
        return json.loads(json.dumps(data, cls=DjangoJSONEncoder))
    except Exception:
        return {}

@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender.__name__ in EXCLUDED_MODELS or sender._meta.app_label == 'admin':
        return

    action = 'CREATE' if created else 'UPDATE'
    user = get_current_user()

    # Sometimes user is an AnonymousUser, we only want to save actual Users
    if user and not user.is_authenticated:
        user = None

    try:
        AuditLog.objects.create(
            user=user,
            model_name=sender.__name__,
            object_id=instance.pk,
            action=action,
            new_data=get_serializable_dict(instance)
        )
    except Exception:
        # This can happen during migrations when the AuditLog table doesn't exist yet
        pass

@receiver(pre_delete)
def log_delete(sender, instance, **kwargs):
    if sender.__name__ in EXCLUDED_MODELS or sender._meta.app_label == 'admin':
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    try:
        AuditLog.objects.create(
            user=user,
            model_name=sender.__name__,
            object_id=instance.pk,
            action='DELETE',
            old_data=get_serializable_dict(instance)
        )
    except Exception:
        # This can happen during migrations when the AuditLog table doesn't exist yet
        pass
