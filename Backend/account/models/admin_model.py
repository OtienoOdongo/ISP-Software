

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
import json

User = get_user_model()

class Client(models.Model):
    """
    Client model linked to User with additional fields for better management.
    Improved with metadata for custom data, better validation.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'client'},
        related_name='client_profile',
        null=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.user.phone_number}) - Created: {self.created_at.strftime('%Y-%m-%d')}"

    def clean(self):
        if self.user.user_type != 'client':
            raise ValidationError("Only 'client' users can be linked.")
        if User.objects.filter(phone_number=self.user.phone_number).exclude(id=self.user.id).exists():
            raise ValidationError("Phone number must be unique.")

    class Meta:
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['user'], name='unique_client_user')
        ]

@receiver(post_save, sender=Client)
def log_client_creation(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.user,
            action_type='signup',
            description=f"New client {instance.user.username} created.",
            is_critical=False
        )

class ActivityLog(models.Model):
    ACTION_TYPES = (
        ('access', 'Data Access'),
        ('modify', 'Data Modification'),
        ('delete', 'Data Deletion'),
        ('signup', 'New Client Signup'),
        ('outage', 'Network Outage'),
        ('payment', 'Payment Event'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('system_alert', 'System Alert'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    related_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='related_activity_logs',
        help_text="Affected user"
    )
    is_critical = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)  

    def __str__(self):
        return f"{self.get_action_type_display()} at {self.timestamp}: {self.description[:50]}..."

    class Meta:
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action_type', 'timestamp', 'is_critical']),
            models.Index(fields=['user', 'related_user']),
        ]

class LoginHistory(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_history'
    )
    timestamp = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField()
    device = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    user_agent = models.TextField(blank=True)
    is_suspicious = models.BooleanField(default=False)  # For anomaly detection

    def __str__(self):
        return f"Login by {self.user.username} at {self.timestamp} from {self.ip_address}"

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp', 'ip_address']),
            models.Index(fields=['is_suspicious']),
        ]

class Notification(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    related_id = models.UUIDField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.get_priority_display()} {self.type} for {self.user.username}: {self.title[:30]}..."

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'read', 'timestamp', 'priority']),
        ]