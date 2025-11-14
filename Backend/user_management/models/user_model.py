

# from django.db import models
# from account.models.admin_model import Client
# from network_management.models.router_management_model import Router, HotspotUser, PPPoEUser

# class BrowsingHistory(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='browsing_history')
#     router = models.ForeignKey(Router, on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
#     hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
#     pppoe_user = models.ForeignKey(PPPoEUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
#     url = models.URLField(max_length=200)
#     frequency = models.CharField(max_length=20)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.client.user.phone_number} visited {self.url} on {self.router.name if self.router else 'Unknown'}"

#     class Meta:
#         ordering = ['-timestamp']
#         verbose_name = 'Browsing History'
#         verbose_name_plural = 'Browsing Histories'

# class CommunicationLog(models.Model):
#     MESSAGE_TYPES = (
#         ('sms', 'SMS'),
#         ('email', 'Email'),
#         ('system', 'System Notification'),
#     )
    
#     TRIGGER_TYPES = (
#         ('data_usage', 'Data Usage Alert'),
#         ('plan_expiry', 'Plan Expiry Warning'),
#         ('payment', 'Payment Confirmation'),
#         ('manual', 'Manual Send'),
#         ('system', 'System Alert'),
#         ('router_disconnect', 'Router Disconnected'),
#         ('hotspot_limit_reached', 'Hotspot Data Limit Reached'),
#         ('pppoe_limit_reached', 'PPPoE Data Limit Reached'),
#     )
    
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('delivered', 'Delivered'),
#         ('failed', 'Failed'),
#     )
    
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='communication_logs')
#     router = models.ForeignKey(Router, on_delete=models.SET_NULL, null=True, blank=True, related_name='communication_logs')
#     connection_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
#     message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='sms')
#     trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPES, default='manual')
#     subject = models.CharField(max_length=200, blank=True, null=True)
#     message = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     timestamp = models.DateTimeField(auto_now_add=True)
#     sent_at = models.DateTimeField(blank=True, null=True)
    
#     class Meta:
#         ordering = ['-timestamp']
#         verbose_name = 'Communication Log'
#         verbose_name_plural = 'Communication Logs'
    
#     def __str__(self):
#         return f"{self.get_message_type_display()} to {self.client.user.username} - {self.get_trigger_type_display()}"









# # models.py 
# from django.db import models
# from django.utils import timezone
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class Client(models.Model):
#     """
#     Client profile model that extends the authentication app's UserAccount
#     This serves as a profile extension for client users with subscriber-specific data
#     """
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         limit_choices_to={'user_type': 'client'},
#         related_name='subscriber_profile',
#         null=False
#     )
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         ordering = ['-created_at']
    
#     def __str__(self):
#         return f"{self.user.username} ({self.user.client_id})"

#     def save(self, *args, **kwargs):
#         # Ensure we're only creating profiles for client users
#         if self.user.user_type != 'client':
#             raise ValueError("Only client users can have subscriber profiles")
#         super().save(*args, **kwargs)

# class BrowsingHistory(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='browsing_history')
#     router = models.ForeignKey('network_management.Router', on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
#     hotspot_user = models.ForeignKey('network_management.HotspotUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
#     pppoe_user = models.ForeignKey('network_management.PPPoEUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
#     url = models.URLField(max_length=500)
#     frequency = models.CharField(max_length=20, default='Once')
#     data_used_bytes = models.BigIntegerField(default=0)
#     timestamp = models.DateTimeField(default=timezone.now)
    
#     class Meta:
#         ordering = ['-timestamp']
#         verbose_name = 'Browsing History'
#         verbose_name_plural = 'Browsing Histories'
    
#     def __str__(self):
#         return f"{self.client.user.username} visited {self.url}"

# class CommunicationLog(models.Model):
#     MESSAGE_TYPES = (
#         ('sms', 'SMS'),
#         ('email', 'Email'),
#         ('system', 'System Notification'),
#     )
    
#     TRIGGER_TYPES = (
#         ('data_usage', 'Data Usage Alert'),
#         ('plan_expiry', 'Plan Expiry Warning'),
#         ('payment', 'Payment Confirmation'),
#         ('manual', 'Manual Send'),
#         ('system', 'System Alert'),
#         ('router_disconnect', 'Router Disconnected'),
#         ('hotspot_limit_reached', 'Hotspot Data Limit Reached'),
#         ('pppoe_limit_reached', 'PPPoE Data Limit Reached'),
#         ('onboarding', 'Onboarding Message'),
#         ('test', 'Test Message'),
#     )
    
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('delivered', 'Delivered'),
#         ('failed', 'Failed'),
#     )
    
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='communication_logs')
#     router = models.ForeignKey('network_management.Router', on_delete=models.SET_NULL, null=True, blank=True, related_name='communication_logs')
#     connection_type = models.CharField(max_length=10, choices=[('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')], default='hotspot')
#     message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='sms')
#     trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPES, default='manual')
#     subject = models.CharField(max_length=200, blank=True, null=True)
#     message = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     timestamp = models.DateTimeField(default=timezone.now)
#     sent_at = models.DateTimeField(null=True, blank=True)
#     delivery_confirmations = models.JSONField(default=dict, blank=True)
    
#     class Meta:
#         ordering = ['-timestamp']
#         verbose_name = 'Communication Log'
#         verbose_name_plural = 'Communication Logs'
    
#     def __str__(self):
#         return f"{self.get_message_type_display()} to {self.client.user.username} - {self.get_trigger_type_display()}"






# """
# Enhanced User Management Models - Eliminating Duplication with Network Management
# """
# from django.db import models
# from django.utils import timezone
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class Client(models.Model):
#     """
#     Lightweight client profile that leverages network_management data
#     This serves as a profile extension without duplicating connection data
#     """
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         limit_choices_to={'user_type': 'client'},
#         related_name='subscriber_profile',
#         null=False
#     )
    
#     # Client-specific fields not covered by network_management
#     preferred_contact_method = models.CharField(
#         max_length=10,
#         choices=[('sms', 'SMS'), ('email', 'Email'), ('both', 'Both')],
#         default='sms'
#     )
#     communication_preferences = models.JSONField(
#         default=dict,
#         help_text="Client communication preferences and settings"
#     )
#     notes = models.TextField(blank=True, null=True, help_text="Internal notes about the client")
#     customer_since = models.DateTimeField(default=timezone.now)
#     last_contact = models.DateTimeField(null=True, blank=True)
    
#     # Marketing and business fields
#     acquisition_source = models.CharField(max_length=50, blank=True, null=True)
#     referral_code = models.CharField(max_length=20, blank=True, null=True)
#     loyalty_tier = models.CharField(
#         max_length=20,
#         choices=[('new', 'New'), ('regular', 'Regular'), ('premium', 'Premium'), ('vip', 'VIP')],
#         default='new'
#     )
    
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['loyalty_tier']),
#             models.Index(fields=['customer_since']),
#             models.Index(fields=['preferred_contact_method']),
#         ]
    
#     def __str__(self):
#         return f"{self.user.username} ({self.user.client_id})"

#     def save(self, *args, **kwargs):
#         if self.user.user_type != 'client':
#             raise ValueError("Only client users can have subscriber profiles")
#         super().save(*args, **kwargs)
    
#     @property
#     def is_active_connection(self):
#         """Check if client has active connection using network_management data"""
#         from network_management.models.router_management_model import HotspotUser, PPPoEUser
#         return (
#             HotspotUser.objects.filter(client=self.user, active=True).exists() or
#             PPPoEUser.objects.filter(client=self.user, active=True).exists()
#         )
    
#     @property
#     def current_connection_type(self):
#         """Get current connection type from network_management"""
#         from network_management.models.router_management_model import HotspotUser, PPPoEUser
        
#         if PPPoEUser.objects.filter(client=self.user, active=True).exists():
#             return 'pppoe'
#         elif HotspotUser.objects.filter(client=self.user, active=True).exists():
#             return 'hotspot'
#         return 'none'

# class CommunicationLog(models.Model):
#     """
#     Dedicated communication logging - No duplication with network_management
#     """
#     MESSAGE_TYPES = (
#         ('sms', 'SMS'),
#         ('email', 'Email'),
#         ('system', 'System Notification'),
#     )
    
#     TRIGGER_TYPES = (
#         ('marketing', 'Marketing Campaign'),
#         ('support', 'Support Response'),
#         ('billing', 'Billing Notification'),
#         ('manual', 'Manual Send'),
#         ('onboarding', 'Onboarding Message'),
#         ('retention', 'Retention Campaign'),
#     )
    
#     STATUS_CHOICES = (
#         ('pending', 'Pending'),
#         ('delivered', 'Delivered'),
#         ('failed', 'Failed'),
#         ('read', 'Read'),
#     )
    
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='communication_logs')
#     message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='sms')
#     trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPES, default='manual')
#     campaign_id = models.CharField(max_length=50, blank=True, null=True, help_text="Marketing campaign identifier")
    
#     # Message content
#     subject = models.CharField(max_length=200, blank=True, null=True)
#     message = models.TextField()
#     template_name = models.CharField(max_length=100, blank=True, null=True)
    
#     # Delivery tracking
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
#     timestamp = models.DateTimeField(default=timezone.now)
#     sent_at = models.DateTimeField(null=True, blank=True)
#     delivered_at = models.DateTimeField(null=True, blank=True)
#     read_at = models.DateTimeField(null=True, blank=True)
    
#     # Response tracking
#     response_received = models.BooleanField(default=False)
#     response_content = models.TextField(blank=True, null=True)
#     response_timestamp = models.DateTimeField(null=True, blank=True)
    
#     # Analytics - using engagement_data only (no delivery_confirmations)
#     open_count = models.IntegerField(default=0)
#     click_count = models.IntegerField(default=0)
#     engagement_data = models.JSONField(default=dict, blank=True, help_text="Additional engagement metrics and data")
    
#     class Meta:
#         ordering = ['-timestamp']
#         verbose_name = 'Communication Log'
#         verbose_name_plural = 'Communication Logs'
#         indexes = [
#             models.Index(fields=['client', 'timestamp']),
#             models.Index(fields=['message_type', 'status']),
#             models.Index(fields=['campaign_id']),
#         ]
    
#     def __str__(self):
#         return f"{self.get_message_type_display()} to {self.client.user.username} - {self.get_trigger_type_display()}"
    
# class ClientNote(models.Model):
#     """
#     Internal notes and follow-ups for client management
#     """
#     NOTE_TYPES = (
#         ('general', 'General Note'),
#         ('support', 'Support Ticket'),
#         ('billing', 'Billing Issue'),
#         ('technical', 'Technical Issue'),
#         ('follow_up', 'Follow Up Required'),
#     )
    
#     PRIORITY_CHOICES = (
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('urgent', 'Urgent'),
#     )
    
#     client = models.ForeignKey(
#         Client, 
#         on_delete=models.CASCADE, 
#         related_name='client_notes'  # FIX: Changed from default 'notes'
#     )
#     note_type = models.CharField(max_length=20, choices=NOTE_TYPES, default='general')
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
#     title = models.CharField(max_length=200)
#     content = models.TextField()
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='client_notes')
    
#     # Follow-up tracking
#     requires_follow_up = models.BooleanField(default=False)
#     follow_up_date = models.DateTimeField(null=True, blank=True)
#     follow_up_completed = models.BooleanField(default=False)
    
#     # Internal tracking
#     internal_only = models.BooleanField(default=False)
#     tags = models.JSONField(default=list, blank=True, help_text="Tags for categorization")
    
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         ordering = ['-created_at']
#         verbose_name = 'Client Note'
#         verbose_name_plural = 'Client Notes'
#         indexes = [
#             models.Index(fields=['client', 'note_type']),
#             models.Index(fields=['requires_follow_up', 'follow_up_date']),
#             models.Index(fields=['priority']),
#         ]
    
#     def __str__(self):
#         return f"{self.note_type} - {self.client.user.username} - {self.title}"








"""
Enhanced User Management Models - Eliminating Duplication with Network Management
"""
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

class Client(models.Model):
    """
    Lightweight client profile that leverages network_management data
    This serves as a profile extension without duplicating connection data
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'user_type': 'client'},
        related_name='subscriber_profile',
        null=False
    )
    
    # Client-specific fields not covered by network_management
    preferred_contact_method = models.CharField(
        max_length=10,
        choices=[('sms', 'SMS'), ('email', 'Email'), ('both', 'Both')],
        default='sms'
    )
    communication_preferences = models.JSONField(
        default=dict,
        help_text="Client communication preferences and settings"
    )
    notes = models.TextField(blank=True, null=True, help_text="Internal notes about the client")
    customer_since = models.DateTimeField(default=timezone.now)
    last_contact = models.DateTimeField(null=True, blank=True)
    
    # Marketing and business fields
    acquisition_source = models.CharField(max_length=50, blank=True, null=True)
    referral_code = models.CharField(max_length=20, blank=True, null=True)
    loyalty_tier = models.CharField(
        max_length=20,
        choices=[('new', 'New'), ('regular', 'Regular'), ('premium', 'Premium'), ('vip', 'VIP')],
        default='new'
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['loyalty_tier']),
            models.Index(fields=['customer_since']),
            models.Index(fields=['preferred_contact_method']),
        ]
    
    def __str__(self):
        return f"{self.user.username} ({self.user.client_id})"

    def save(self, *args, **kwargs):
        if self.user.user_type != 'client':
            raise ValueError("Only client users can have subscriber profiles")
        super().save(*args, **kwargs)
    
    @property
    def is_active_connection(self):
        """Check if client has active connection using network_management data"""
        try:
            from network_management.models.router_management_model import HotspotUser, PPPoEUser
            return (
                HotspotUser.objects.filter(client=self.user, active=True).exists() or
                PPPoEUser.objects.filter(client=self.user, active=True).exists()
            )
        except Exception:
            return False
    
    @property
    def current_connection_type(self):
        """Get current connection type from network_management"""
        try:
            from network_management.models.router_management_model import HotspotUser, PPPoEUser
            
            if PPPoEUser.objects.filter(client=self.user, active=True).exists():
                return 'pppoe'
            elif HotspotUser.objects.filter(client=self.user, active=True).exists():
                return 'hotspot'
            return 'none'
        except Exception:
            return 'none'

class CommunicationLog(models.Model):
    """
    Dedicated communication logging - No duplication with network_management
    """
    MESSAGE_TYPES = (
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('system', 'System Notification'),
    )
    
    TRIGGER_TYPES = (
        ('marketing', 'Marketing Campaign'),
        ('support', 'Support Response'),
        ('billing', 'Billing Notification'),
        ('manual', 'Manual Send'),
        ('onboarding', 'Onboarding Message'),
        ('retention', 'Retention Campaign'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    )
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='communication_logs')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='sms')
    trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPES, default='manual')
    campaign_id = models.CharField(max_length=50, blank=True, null=True, help_text="Marketing campaign identifier")
    
    # Message content
    subject = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField()
    template_name = models.CharField(max_length=100, blank=True, null=True)
    
    # Delivery tracking
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Response tracking
    response_received = models.BooleanField(default=False)
    response_content = models.TextField(blank=True, null=True)
    response_timestamp = models.DateTimeField(null=True, blank=True)
    
    # Analytics
    open_count = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)
    engagement_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Communication Log'
        verbose_name_plural = 'Communication Logs'
        indexes = [
            models.Index(fields=['client', 'timestamp']),
            models.Index(fields=['message_type', 'status']),
            models.Index(fields=['campaign_id']),
        ]
    
    def __str__(self):
        return f"{self.get_message_type_display()} to {self.client.user.username} - {self.get_trigger_type_display()}"

class ClientNote(models.Model):
    """
    Internal notes and follow-ups for client management
    """
    NOTE_TYPES = (
        ('general', 'General Note'),
        ('support', 'Support Ticket'),
        ('billing', 'Billing Issue'),
        ('technical', 'Technical Issue'),
        ('follow_up', 'Follow Up Required'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    client = models.ForeignKey(
        Client, 
        on_delete=models.CASCADE, 
        related_name='client_notes'  # Fixed: Changed from default 'notes'
    )
    note_type = models.CharField(max_length=20, choices=NOTE_TYPES, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='client_notes')
    
    # Follow-up tracking
    requires_follow_up = models.BooleanField(default=False)
    follow_up_date = models.DateTimeField(null=True, blank=True)
    follow_up_completed = models.BooleanField(default=False)
    
    # Internal tracking
    internal_only = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True, help_text="Tags for categorization")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Client Note'
        verbose_name_plural = 'Client Notes'
        indexes = [
            models.Index(fields=['client', 'note_type']),
            models.Index(fields=['requires_follow_up', 'follow_up_date']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.note_type} - {self.client.user.username} - {self.title}"