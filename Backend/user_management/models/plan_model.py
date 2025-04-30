# from django.db import models
# from django.db.models import Case, When, Value, CharField
# from account.models.admin_model import Client, Router
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import Payment, Transaction

# class PlanAnalyticsSnapshot(models.Model):
#     timestamp = models.DateTimeField(auto_now_add=True)
#     total_clients = models.IntegerField()
#     active_clients = models.IntegerField()
#     high_usage_clients = models.IntegerField()
#     collected_revenue = models.DecimalField(max_digits=12, decimal_places=2)
#     active_devices = models.IntegerField()
#     congested_routers = models.IntegerField()
    
#     class Meta:
#         verbose_name = 'Plan Analytics Snapshot'
#         verbose_name_plural = 'Plan Analytics Snapshots'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['timestamp']),
#         ]

# class ClientAnalytics(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='analytics')
#     timestamp = models.DateTimeField(auto_now_add=True)
#     data_usage_percentage = models.FloatField(null=True, blank=True)
#     payment_status = models.CharField(max_length=20)
#     plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True, blank=True)
#     hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.SET_NULL, null=True, blank=True)
#     is_high_usage = models.BooleanField(default=False)
#     is_near_expiry = models.BooleanField(default=False)
    
#     class Meta:
#         verbose_name = 'Client Analytics'
#         verbose_name_plural = 'Client Analytics'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['client', 'timestamp']),
#             models.Index(fields=['is_high_usage']),
#             models.Index(fields=['is_near_expiry']),
#         ]

# class SMSNotification(models.Model):
#     TRIGGER_CHOICES = [
#         ('DATA_USAGE_75', 'Data Usage 75%'),
#         ('DATA_USAGE_90', 'Data Usage 90%'),
#         ('EXPIRY_3_DAYS', 'Plan Expiry in 3 Days'),
#         ('EXPIRY_1_DAY', 'Plan Expiry in 1 Day'),
#         ('EXPIRED', 'Plan Expired'),
#         ('MANUAL', 'Manual'),
#         ('PAYMENT_REMINDER', 'Payment Reminder'),
#     ]
    
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('SENT', 'Sent'),
#         ('FAILED', 'Failed'),
#     ]

#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sms_notifications')
#     message = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
#     trigger = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
#     sent_at = models.DateTimeField(null=True, blank=True)
#     error = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     delivery_status = models.CharField(max_length=50, null=True, blank=True)
    
#     class Meta:
#         verbose_name = 'SMS Notification'
#         verbose_name_plural = 'SMS Notifications'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['client', 'status']),
#             models.Index(fields=['trigger', 'sent_at']),
#         ]

# class DataUsageThreshold(models.Model):
#     threshold_percentage = models.FloatField(unique=True)
#     message_template = models.TextField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = 'Data Usage Threshold'
#         verbose_name_plural = 'Data Usage Thresholds'
#         ordering = ['threshold_percentage']

#     def __str__(self):
#         return f"{self.threshold_percentage}% Usage Alert"




# from django.db import models
# from account.models.admin_model import Client, Router
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import  Transaction

# class PlanAnalyticsSnapshot(models.Model):
#     timestamp = models.DateTimeField(auto_now_add=True)
#     total_clients = models.IntegerField()
#     active_clients = models.IntegerField()
#     high_usage_clients = models.IntegerField()
#     collected_revenue = models.DecimalField(max_digits=12, decimal_places=2)
#     active_devices = models.IntegerField()
#     congested_routers = models.IntegerField()
    
#     class Meta:
#         verbose_name = 'Plan Analytics Snapshot'
#         verbose_name_plural = 'Plan Analytics Snapshots'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['timestamp']),
#         ]

#     def __str__(self):
#         return f"Snapshot at {self.timestamp}"

# class ClientAnalytics(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='analytics')
#     timestamp = models.DateTimeField(auto_now_add=True)
#     data_usage_percentage = models.FloatField(null=True, blank=True)
#     payment_status = models.CharField(max_length=20)
#     plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True, blank=True)
#     hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.SET_NULL, null=True, blank=True)
#     is_high_usage = models.BooleanField(default=False)
#     is_near_expiry = models.BooleanField(default=False)
    
#     class Meta:
#         verbose_name = 'Client Analytics'
#         verbose_name_plural = 'Client Analytics'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['client', 'timestamp']),
#             models.Index(fields=['is_high_usage']),
#             models.Index(fields=['is_near_expiry']),
#         ]

#     def __str__(self):
#         return f"Analytics for {self.client} at {self.timestamp}"

# class SMSNotification(models.Model):
#     TRIGGER_CHOICES = [
#         ('DATA_USAGE_75', 'Data Usage 75%'),
#         ('DATA_USAGE_90', 'Data Usage 90%'),
#         ('EXPIRY_3_DAYS', 'Plan Expiry in 3 Days'),
#         ('EXPIRY_1_DAY', 'Plan Expiry in 1 Day'),
#         ('EXPIRED', 'Plan Expired'),
#         ('MANUAL', 'Manual'),
#         ('PAYMENT_REMINDER', 'Payment Reminder'),
#     ]
    
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('SENT', 'Sent'),
#         ('FAILED', 'Failed'),
#     ]

#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sms_notifications')
#     message = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
#     trigger = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
#     sent_at = models.DateTimeField(null=True, blank=True)
#     error = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     delivery_status = models.CharField(max_length=50, null=True, blank=True)
    
#     class Meta:
#         verbose_name = 'SMS Notification'
#         verbose_name_plural = 'SMS Notifications'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['client', 'status']),
#             models.Index(fields=['trigger', 'sent_at']),
#         ]

#     def __str__(self):
#         return f"SMS to {self.client} ({self.trigger})"

# class DataUsageThreshold(models.Model):
#     threshold_percentage = models.FloatField(unique=True)
#     message_template = models.TextField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = 'Data Usage Threshold'
#         verbose_name_plural = 'Data Usage Thresholds'
#         ordering = ['threshold_percentage']

#     def __str__(self):
#         return f"{self.threshold_percentage}% Usage Alert"

# class ActionNotification(models.Model):
#     TYPE_CHOICES = [
#         ('INFO', 'Information'),
#         ('SUCCESS', 'Success'),
#         ('WARNING', 'Warning'),
#         ('ERROR', 'Error'),
#     ]

#     message = models.TextField()
#     type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='INFO')
#     created_at = models.DateTimeField(auto_now_add=True)
#     is_read = models.BooleanField(default=False)
    
#     class Meta:
#         verbose_name = 'Action Notification'
#         verbose_name_plural = 'Action Notifications'
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.get_type_display()}: {self.message}"






# from django.db import models
# from account.models.admin_model import Client, Subscription
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import Transaction

# class PlanAnalyticsSnapshot(models.Model):
#     timestamp = models.DateTimeField(auto_now_add=True)
#     total_clients = models.IntegerField()
#     active_clients = models.IntegerField()
#     high_usage_clients = models.IntegerField()
#     collected_revenue = models.DecimalField(max_digits=12, decimal_places=2)
#     active_devices = models.IntegerField()
#     congested_routers = models.IntegerField()
    
#     class Meta:
#         verbose_name = 'Plan Analytics Snapshot'
#         verbose_name_plural = 'Plan Analytics Snapshots'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['timestamp']),
#         ]

#     def __str__(self):
#         return f"Snapshot at {self.timestamp}"

# class ClientAnalytics(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='analytics')
#     timestamp = models.DateTimeField(auto_now_add=True)
#     data_usage_percentage = models.FloatField(null=True, blank=True)
#     payment_status = models.CharField(max_length=20, choices=[
#         ('Paid', 'Paid'),
#         ('Due', 'Due'),
#         ('Expired', 'Expired')
#     ])
#     plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True, blank=True)
#     hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.SET_NULL, null=True, blank=True)
#     is_high_usage = models.BooleanField(default=False)
#     is_near_expiry = models.BooleanField(default=False)
    
#     class Meta:
#         verbose_name = 'Client Analytics'
#         verbose_name_plural = 'Client Analytics'
#         ordering = ['-timestamp']
#         indexes = [
#             models.Index(fields=['client', 'timestamp']),
#             models.Index(fields=['is_high_usage']),
#             models.Index(fields=['is_near_expiry']),
#         ]

#     def __str__(self):
#         return f"Analytics for {self.client} at {self.timestamp}"

# class SMSNotification(models.Model):
#     TRIGGER_CHOICES = [
#         ('DATA_USAGE_75', 'Data Usage 75%'),
#         ('DATA_USAGE_90', 'Data Usage 90%'),
#         ('EXPIRY_3_DAYS', 'Plan Expiry in 3 Days'),
#         ('EXPIRY_1_DAY', 'Plan Expiry in 1 Day'),
#         ('EXPIRED', 'Plan Expired'),
#         ('MANUAL', 'Manual'),
#         ('PAYMENT_REMINDER', 'Payment Reminder'),
#     ]
    
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('SENT', 'Sent'),
#         ('FAILED', 'Failed'),
#     ]

#     client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sms_notifications')
#     message = models.TextField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
#     trigger = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
#     sent_at = models.DateTimeField(null=True, blank=True)
#     error = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     delivery_status = models.CharField(max_length=50, null=True, blank=True)
    
#     class Meta:
#         verbose_name = 'SMS Notification'
#         verbose_name_plural = 'SMS Notifications'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['client', 'status']),
#             models.Index(fields=['trigger', 'sent_at']),
#         ]

#     def __str__(self):
#         return f"SMS to {self.client} ({self.trigger})"

# class DataUsageThreshold(models.Model):
#     threshold_percentage = models.FloatField(unique=True)
#     message_template = models.TextField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = 'Data Usage Threshold'
#         verbose_name_plural = 'Data Usage Thresholds'
#         ordering = ['threshold_percentage']

#     def __str__(self):
#         return f"{self.threshold_percentage}% Usage Alert"

# class ActionNotification(models.Model):
#     TYPE_CHOICES = [
#         ('INFO', 'Information'),
#         ('SUCCESS', 'Success'),
#         ('WARNING', 'Warning'),
#         ('ERROR', 'Error'),
#     ]

#     message = models.TextField()
#     type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='INFO')
#     created_at = models.DateTimeField(auto_now_add=True)
#     is_read = models.BooleanField(default=False)
#     client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    
#     class Meta:
#         verbose_name = 'Action Notification'
#         verbose_name_plural = 'Action Notifications'
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.get_type_display()}: {self.message}"







from django.db import models
from account.models.admin_model import Client, Subscription
from internet_plans.models.create_plan_models import InternetPlan
from network_management.models.router_management_model import HotspotUser
from payments.models.mpesa_config_model import Transaction

class PlanAnalyticsSnapshot(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    total_clients = models.IntegerField()
    active_clients = models.IntegerField()
    high_usage_clients = models.IntegerField()
    collected_revenue = models.DecimalField(max_digits=12, decimal_places=2)
    active_devices = models.IntegerField()
    congested_routers = models.IntegerField()
    
    class Meta:
        verbose_name = 'Plan Analytics Snapshot'
        verbose_name_plural = 'Plan Analytics Snapshots'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
        ]

    def __str__(self):
        return f"Snapshot at {self.timestamp}"

class ClientAnalytics(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='analytics')
    timestamp = models.DateTimeField(auto_now_add=True)
    data_usage_percentage = models.FloatField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=[
        ('Paid', 'Paid'),
        ('Due', 'Due'),
        ('Expired', 'Expired')
    ])
    plan = models.ForeignKey(InternetPlan, on_delete=models.SET_NULL, null=True, blank=True)
    hotspot_user = models.ForeignKey(HotspotUser, on_delete=models.SET_NULL, null=True, blank=True)
    is_high_usage = models.BooleanField(default=False)
    is_near_expiry = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Client Analytics'
        verbose_name_plural = 'Client Analytics'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['client', 'timestamp']),
            models.Index(fields=['is_high_usage']),
            models.Index(fields=['is_near_expiry']),
        ]

    def __str__(self):
        return f"Analytics for {self.client} at {self.timestamp}"

class SMSNotification(models.Model):
    TRIGGER_CHOICES = [
        ('DATA_USAGE_75', 'Data Usage 75%'),
        ('DATA_USAGE_90', 'Data Usage 90%'),
        ('EXPIRY_3_DAYS', 'Plan Expiry in 3 Days'),
        ('EXPIRY_1_DAY', 'Plan Expiry in 1 Day'),
        ('EXPIRED', 'Plan Expired'),
        ('MANUAL', 'Manual'),
        ('PAYMENT_REMINDER', 'Payment Reminder'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='sms_notifications')
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    trigger = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
    sent_at = models.DateTimeField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    delivery_status = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        verbose_name = 'SMS Notification'
        verbose_name_plural = 'SMS Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client', 'status']),
            models.Index(fields=['trigger', 'sent_at']),
        ]

    def __str__(self):
        return f"SMS to {self.client} ({self.trigger})"

class DataUsageThreshold(models.Model):
    threshold_percentage = models.FloatField(unique=True)
    message_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Data Usage Threshold'
        verbose_name_plural = 'Data Usage Thresholds'
        ordering = ['threshold_percentage']

    def __str__(self):
        return f"{self.threshold_percentage}% Usage Alert"

class ActionNotification(models.Model):
    TYPE_CHOICES = [
        ('INFO', 'Information'),
        ('SUCCESS', 'Success'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
    ]

    message = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='INFO')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    client = models.ForeignKey(
        Client, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='action_notifications'
    )
    
    class Meta:
        verbose_name = 'Action Notification'
        verbose_name_plural = 'Action Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client', 'is_read']),
            models.Index(fields=['type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.get_type_display()}: {self.message}"