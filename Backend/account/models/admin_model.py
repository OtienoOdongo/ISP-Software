

# from django.db import models
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from django.core.exceptions import ValidationError
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# import json

# User = get_user_model()

# class Client(models.Model):
#     """
#     Client model linked to User with additional fields for better management.
#     Improved with metadata for custom data, better validation.
#     """
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         limit_choices_to={'user_type': 'client'},
#         related_name='client_profile',
#         null=False
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     metadata = models.JSONField(default=dict, blank=True)

#     def __str__(self):
#         return f"{self.user.username} ({self.user.phone_number}) - Created: {self.created_at.strftime('%Y-%m-%d')}"

#     def clean(self):
#         if self.user.user_type != 'client':
#             raise ValidationError("Only 'client' users can be linked.")
#         if User.objects.filter(phone_number=self.user.phone_number).exclude(id=self.user.id).exists():
#             raise ValidationError("Phone number must be unique.")

#     class Meta:
#         verbose_name = 'Client'
#         verbose_name_plural = 'Clients'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['user', 'created_at']),
#         ]
#         constraints = [
#             models.UniqueConstraint(fields=['user'], name='unique_client_user')
#         ]

# @receiver(post_save, sender=Client)
# def log_client_creation(sender, instance, created, **kwargs):
#     if created:
#         ActivityLog.objects.create(
#             user=instance.user,
#             action_type='signup',
#             description=f"New client {instance.user.username} created.",
#             is_critical=False
#         )

# class ActivityLog(models.Model):
#     ACTION_TYPES = (
#         ('access', 'Data Access'),
#         ('modify', 'Data Modification'),
#         ('delete', 'Data Deletion'),
#         ('signup', 'New Client Signup'),
#         ('outage', 'Network Outage'),
#         ('payment', 'Payment Event'),
#         ('login', 'Login'),
#         ('logout', 'Logout'),
#         ('system_alert', 'System Alert'),
#     )

#     user = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='activity_logs'
#     )
#     action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
#     description = models.TextField()
#     timestamp = models.DateTimeField(default=timezone.now)
#     related_user = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='related_activity_logs',
#         help_text="Affected user"
#     )
#     is_critical = models.BooleanField(default=False)
#     metadata = models.JSONField(default=dict, blank=True)  

#     def __str__(self):
#         return f"{self.get_action_type_display()} at {self.timestamp}: {self.description[:50]}..."

#     class Meta:
#         verbose_name = 'Activity Log'
#         verbose_name_plural = 'Activity Logs'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['action_type', 'timestamp', 'is_critical']),
#             models.Index(fields=['user', 'related_user']),
#         ]

# class LoginHistory(models.Model):
#     user = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name='login_history'
#     )
#     timestamp = models.DateTimeField(default=timezone.now)
#     ip_address = models.GenericIPAddressField()
#     device = models.CharField(max_length=255)
#     location = models.CharField(max_length=255, blank=True)
#     user_agent = models.TextField(blank=True)
#     is_suspicious = models.BooleanField(default=False)  # For anomaly detection

#     def __str__(self):
#         return f"Login by {self.user.username} at {self.timestamp} from {self.ip_address}"

#     class Meta:
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['user', 'timestamp', 'ip_address']),
#             models.Index(fields=['is_suspicious']),
#         ]

# class Notification(models.Model):
#     PRIORITY_CHOICES = (
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#     )

#     user = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name='notifications'
#     )
#     type = models.CharField(max_length=50)
#     title = models.CharField(max_length=255)
#     message = models.TextField()
#     timestamp = models.DateTimeField(default=timezone.now)
#     read = models.BooleanField(default=False)
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
#     related_id = models.UUIDField(null=True, blank=True)
#     metadata = models.JSONField(default=dict, blank=True)

#     def __str__(self):
#         return f"{self.get_priority_display()} {self.type} for {self.user.username}: {self.title[:30]}..."

#     class Meta:
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['user', 'read', 'timestamp', 'priority']),
#         ]








from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
import json
from datetime import timedelta

User = get_user_model()

class Client(models.Model):
    """
    Enhanced Client model with PPPoE and Hotspot specific fields
    """
    CONNECTION_STATUS = (
        ('offline', 'Offline'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'client'},
        related_name='client_profile',
        null=False
    )
    
    # Connection specific fields
    connection_status = models.CharField(
        max_length=20, 
        choices=CONNECTION_STATUS, 
        default='offline',
        db_index=True
    )
    last_connection = models.DateTimeField(null=True, blank=True)
    total_connection_time = models.DurationField(default=timedelta)
    
    # Usage tracking
    data_used = models.BigIntegerField(default=0)  # in bytes
    data_capacity = models.BigIntegerField(default=0)  # in bytes
    
    # PPPoE specific fields
    pppoe_service_name = models.CharField(max_length=100, blank=True, null=True)
    pppoe_local_ip = models.GenericIPAddressField(null=True, blank=True)
    pppoe_remote_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Hotspot specific fields
    hotspot_mac_address = models.CharField(max_length=17, blank=True, null=True)
    hotspot_session_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Administrative fields
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        connection_info = f" ({self.user.connection_type})" if self.user.connection_type else ""
        status_info = f" - {self.connection_status}"
        return f"{self.user.username}{connection_info}{status_info}"

    def clean(self):
        if self.user.user_type != 'client':
            raise ValidationError("Only 'client' users can be linked.")
        
        # Validate connection-specific fields
        if self.user.connection_type == 'pppoe':
            if self.hotspot_mac_address or self.hotspot_session_id:
                raise ValidationError("Hotspot fields should not be set for PPPoE clients")
        elif self.user.connection_type == 'hotspot':
            if self.pppoe_service_name or self.pppoe_local_ip or self.pppoe_remote_ip:
                raise ValidationError("PPPoE fields should not be set for Hotspot clients")

    @property
    def is_pppoe(self):
        return self.user.connection_type == 'pppoe'

    @property
    def is_hotspot(self):
        return self.user.connection_type == 'hotspot'

    @property
    def is_online(self):
        return self.connection_status == 'online'

    @property
    def data_usage_percentage(self):
        if self.data_capacity == 0:
            return 0
        return (self.data_used / self.data_capacity) * 100

    @property
    def data_remaining(self):
        return max(0, self.data_capacity - self.data_used)

    @property
    def data_remaining_display(self):
        """Human readable data remaining"""
        bytes_val = self.data_remaining
        if bytes_val >= 1024 ** 3:  # GB
            return f"{(bytes_val / (1024 ** 3)):.2f} GB"
        elif bytes_val >= 1024 ** 2:  # MB
            return f"{(bytes_val / (1024 ** 2)):.2f} MB"
        elif bytes_val >= 1024:  # KB
            return f"{(bytes_val / 1024):.2f} KB"
        else:
            return f"{bytes_val} B"

    @property
    def data_used_display(self):
        """Human readable data usage"""
        bytes_val = self.data_used
        if bytes_val >= 1024 ** 3:  # GB
            return f"{(bytes_val / (1024 ** 3)):.2f} GB"
        elif bytes_val >= 1024 ** 2:  # MB
            return f"{(bytes_val / (1024 ** 2)):.2f} MB"
        elif bytes_val >= 1024:  # KB
            return f"{(bytes_val / 1024):.2f} KB"
        else:
            return f"{bytes_val} B"

    @property
    def data_capacity_display(self):
        """Human readable data capacity"""
        bytes_val = self.data_capacity
        if bytes_val >= 1024 ** 3:  # GB
            return f"{(bytes_val / (1024 ** 3)):.2f} GB"
        elif bytes_val >= 1024 ** 2:  # MB
            return f"{(bytes_val / (1024 ** 2)):.2f} MB"
        elif bytes_val >= 1024:  # KB
            return f"{(bytes_val / 1024):.2f} KB"
        else:
            return f"{bytes_val} B"

    def update_connection_status(self, status, ip_address=None):
        """Update connection status and track connection time"""
        old_status = self.connection_status
        self.connection_status = status
        
        if status == 'online':
            self.last_connection = timezone.now()
            if self.is_pppoe and ip_address:
                self.pppoe_remote_ip = ip_address
        elif status == 'offline' and old_status == 'online':
            # Calculate connection duration and add to total
            if self.last_connection:
                duration = timezone.now() - self.last_connection
                self.total_connection_time += duration
        
        self.save()

    def add_data_usage(self, bytes_used):
        """Add data usage and check if capacity exceeded"""
        self.data_used += bytes_used
        if self.data_used >= self.data_capacity:
            self.connection_status = 'suspended'
        self.save()

    def reset_data_usage(self):
        """Reset data usage for new billing cycle"""
        self.data_used = 0
        if self.connection_status == 'suspended':
            self.connection_status = 'offline'
        self.save()

    class Meta:
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['connection_status', 'created_at']),
            models.Index(fields=['last_connection']),
            
        ]
        constraints = [
            models.UniqueConstraint(fields=['user'], name='unique_client_user')
        ]

@receiver(post_save, sender=Client)
def log_client_creation(sender, instance, created, **kwargs):
    if created:
        # Import here to avoid circular imports
        from account.models.admin_model import ActivityLog
        ActivityLog.objects.create(
            user=instance.user,
            action_type='signup',
            description=f"New {instance.user.connection_type} client {instance.user.username} created.",
            metadata={
                'connection_type': instance.user.connection_type,
                'client_id': instance.user.client_id
            },
            is_critical=False
        )

class PPPoEConnectionLog(models.Model):
    """
    Track PPPoE connection sessions
    """
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='pppoe_connection_logs'
    )
    session_start = models.DateTimeField(default=timezone.now)
    session_end = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    local_ip = models.GenericIPAddressField(null=True, blank=True)
    remote_ip = models.GenericIPAddressField(null=True, blank=True)
    data_sent = models.BigIntegerField(default=0)  # bytes
    data_received = models.BigIntegerField(default=0)  # bytes
    termination_reason = models.CharField(max_length=100, blank=True, null=True)
    router_identifier = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.session_end and self.session_start:
            self.duration = self.session_end - self.session_start
        super().save(*args, **kwargs)

    def __str__(self):
        return f"PPPoE Session {self.client.user.username} - {self.session_start}"

    class Meta:
        ordering = ['-session_start']
        indexes = [
            models.Index(fields=['client', 'session_start']),
            models.Index(fields=['session_start', 'session_end']),
        ]

class HotspotSessionLog(models.Model):
    """
    Track Hotspot connection sessions
    """
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='hotspot_session_logs'
    )
    session_start = models.DateTimeField(default=timezone.now)
    session_end = models.DateTimeField(null=True, blank=True)
    duration = models.DurationField(null=True, blank=True)
    mac_address = models.CharField(max_length=17)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    data_used = models.BigIntegerField(default=0)  # bytes
    router_identifier = models.CharField(max_length=100, blank=True, null=True)
    session_id = models.CharField(max_length=100, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.session_end and self.session_start:
            self.duration = self.session_end - self.session_start
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Hotspot Session {self.client.user.username} - {self.session_start}"

    class Meta:
        ordering = ['-session_start']
        indexes = [
            models.Index(fields=['client', 'session_start']),
            models.Index(fields=['mac_address', 'session_start']),
        ]

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
        ('pppoe_connect', 'PPPoE Connection'),
        ('pppoe_disconnect', 'PPPoE Disconnection'),
        ('hotspot_connect', 'Hotspot Connection'),
        ('hotspot_disconnect', 'Hotspot Disconnection'),
        ('data_usage', 'Data Usage Update'),
        ('plan_change', 'Plan Change'),
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
    related_client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
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
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['related_client', 'timestamp']),
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
    login_type = models.CharField(
        max_length=20,
        choices=[('dashboard', 'Dashboard'), ('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        default='dashboard'
    )
    is_suspicious = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.login_type.title()} Login by {self.user.username} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp', 'login_type']),
            models.Index(fields=['is_suspicious', 'timestamp']),
            models.Index(fields=['login_type', 'timestamp']),
        ]

class Notification(models.Model):
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    NOTIFICATION_TYPES = (
        ('system', 'System Notification'),
        ('billing', 'Billing Notification'),
        ('usage', 'Usage Alert'),
        ('security', 'Security Alert'),
        ('maintenance', 'Maintenance Notification'),
        ('pppoe', 'PPPoE Status'),
        ('hotspot', 'Hotspot Status'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    related_client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    related_id = models.UUIDField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.get_priority_display()} {self.type} for {self.user.username}: {self.title[:30]}..."

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'read', 'timestamp', 'priority']),
            models.Index(fields=['type', 'timestamp']),
            models.Index(fields=['related_client', 'timestamp']),
        ]