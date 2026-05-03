from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('model_name', 'action', 'user', 'object_id', 'timestamp')
    list_filter = ('action', 'model_name', 'timestamp')
    search_fields = ('model_name', 'user__username', 'object_id')
    readonly_fields = ('user', 'model_name', 'object_id', 'action', 'old_data', 'new_data', 'timestamp')
