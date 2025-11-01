





from django.db import models
from account.models.admin_model import Client
from network_management.models.router_management_model import Router, HotspotUser

class BrowsingHistory(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='browsing_history')
    router = models.ForeignKey(Router, on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
    hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='browsing_history')
    url = models.URLField(max_length=200)
    frequency = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.phonenumber} visited {self.url} on {self.router.name if self.router else 'Unknown'}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Browsing History'
        verbose_name_plural = 'Browsing Histories'

class CommunicationLog(models.Model):
    MESSAGE_TYPES = (
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('system', 'System Notification'),
    )
    
    TRIGGER_TYPES = (
        ('data_usage', 'Data Usage Alert'),
        ('plan_expiry', 'Plan Expiry Warning'),
        ('payment', 'Payment Confirmation'),
        ('manual', 'Manual Send'),
        ('system', 'System Alert'),
        ('router_disconnect', 'Router Disconnected'),
        ('hotspot_limit_reached', 'Hotspot Data Limit Reached'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
    )
    
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='communication_logs')
    router = models.ForeignKey(Router, on_delete=models.SET_NULL, null=True, blank=True, related_name='communication_logs')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='sms')
    trigger_type = models.CharField(max_length=30, choices=TRIGGER_TYPES, default='manual')
    subject = models.CharField(max_length=200, blank=True, null=True)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    timestamp = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Communication Log'
        verbose_name_plural = 'Communication Logs'
    
    def __str__(self):
        return f"{self.get_message_type_display()} to {self.client.user.username} - {self.get_trigger_type_display()}"