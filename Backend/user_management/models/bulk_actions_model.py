from django.db import models
from django.utils import timezone
from account.models.admin_model import Client
from django.contrib.auth.models import User
import uuid
import os

class MessageTemplate(models.Model):
    name = models.CharField(max_length=100)
    message = models.TextField(max_length=160)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class BulkActionLog(models.Model):
    ACTION_TYPES = (
        ('import', 'User Import'),
        ('message', 'Bulk Message'),
        ('activate', 'Activate Users'),
        ('deactivate', 'Deactivate Users'),
        ('change_plan', 'Change Plan'),
        ('delete', 'Delete Users'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    )

    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    message_type = models.CharField(max_length=20, blank=True)
    total_users = models.PositiveIntegerField()
    success_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    errors = models.JSONField(default=list)
    scheduled_for = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_action_type_display()} - {self.created_at}"


def user_import_file_path(instance, filename):
    """Generate file path for user import files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('user_imports/', filename)


class UserImportFile(models.Model):
    file = models.FileField(upload_to=user_import_file_path)
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.original_filename} - {self.uploaded_at}"