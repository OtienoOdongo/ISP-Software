



# from django.db import models
# from django.utils import timezone
# from account.models.admin_model import Client
# from network_management.models.router_management_model import Router
# from internet_plans.models.create_plan_models import Subscription
# from payments.models.payment_config_model import Transaction

# class SMSTrigger(models.Model):
#     TRIGGER_TYPES = (
#         ('data_usage', 'Data Usage'),
#         ('plan_expiry', 'Plan Expiry'),
#         ('onboarding', 'Onboarding'),
#     )

#     ONBOARDING_EVENTS = (
#         ('signup', 'After Signup'),
#         ('first_payment', 'After First Payment'),
#         ('plan_activation', 'After Plan Activation'),
#     )

#     name = models.CharField(max_length=100)
#     trigger_type = models.CharField(max_length=20, choices=TRIGGER_TYPES)
#     threshold = models.PositiveIntegerField(null=True, blank=True)
#     days_before = models.PositiveIntegerField(null=True, blank=True)
#     event = models.CharField(max_length=20, choices=ONBOARDING_EVENTS, null=True, blank=True)
#     message = models.TextField(max_length=160)
#     enabled = models.BooleanField(default=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     last_triggered = models.DateTimeField(null=True, blank=True)
#     sent_count = models.PositiveIntegerField(default=0)
#     success_count = models.PositiveIntegerField(default=0)

#     class Meta:
#         ordering = ['-created_at']

#     def __str__(self):
#         return self.name

#     @property
#     def success_rate(self):
#         return round((self.success_count / self.sent_count * 100), 1) if self.sent_count > 0 else 0


# class SMSAutomationSettings(models.Model):
#     SMS_GATEWAY_CHOICES = (
#         ('africas_talking', "Africa's Talking"),
#         ('twilio', 'Twilio'),
#         ('smpp', 'SMPP'),
#         ('nexmo', 'Vonage (Nexmo)'),
#     )

#     enabled = models.BooleanField(default=True)
#     sms_gateway = models.CharField(max_length=20, choices=SMS_GATEWAY_CHOICES, default='africas_talking')
#     api_key = models.CharField(max_length=200, blank=True)
#     username = models.CharField(max_length=100, blank=True)
#     sender_id = models.CharField(max_length=50, blank=True)
#     send_time_start = models.TimeField(default='08:00')
#     send_time_end = models.TimeField(default='20:00')
#     max_messages_per_day = models.PositiveIntegerField(default=1000)
#     low_balance_alert = models.BooleanField(default=True)
#     balance_threshold = models.PositiveIntegerField(default=100)
#     sms_balance = models.PositiveIntegerField(default=1000)
#     last_updated = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name_plural = 'SMS Automation Settings'

#     def __str__(self):
#         return 'SMS Automation Settings'


# class SMSAnalytics(models.Model):
#     date = models.DateField(unique=True)
#     total_messages = models.PositiveIntegerField(default=0)
#     successful_messages = models.PositiveIntegerField(default=0)
#     failed_messages = models.PositiveIntegerField(default=0)
#     active_triggers = models.PositiveIntegerField(default=0)

#     class Meta:
#         ordering = ['-date']
#         verbose_name_plural = 'SMS Analytics'

#     def __str__(self):
#         return f"SMS Analytics for {self.date}"

#     @property
#     def success_rate(self):
#         return round((self.successful_messages / self.total_messages * 100), 2) if self.total_messages > 0 else 0







# sms_automation_models.py 
from django.db import models
from django.utils import timezone
from account.models.admin_model import Client
from network_management.models.router_management_model import Router
from internet_plans.models.create_plan_models import Subscription
from payments.models.payment_config_model import Transaction
import uuid

class SMSTrigger(models.Model):
    TRIGGER_TYPES = (
        ('data_usage', 'Data Usage Alert'),
        ('plan_expiry', 'Plan Expiry Warning'),
        ('onboarding', 'Onboarding Message'),
        ('payment', 'Payment Confirmation'),
        ('system', 'System Notification'),
    )

    ONBOARDING_EVENTS = (
        ('signup', 'After Signup'),
        ('first_payment', 'After First Payment'),
        ('plan_activation', 'After Plan Activation'),
    )

    name = models.CharField(max_length=100)
    trigger_type = models.CharField(max_length=20, choices=TRIGGER_TYPES)
    threshold = models.PositiveIntegerField(null=True, blank=True, help_text="Percentage for data usage alerts")
    days_before = models.PositiveIntegerField(null=True, blank=True, help_text="Days before plan expiry")
    event = models.CharField(max_length=20, choices=ONBOARDING_EVENTS, null=True, blank=True)
    message = models.TextField(max_length=160)
    enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_triggered = models.DateTimeField(null=True, blank=True)
    sent_count = models.PositiveIntegerField(default=0)
    success_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'SMS Trigger'
        verbose_name_plural = 'SMS Triggers'

    def __str__(self):
        return self.name

    @property
    def success_rate(self):
        if self.sent_count == 0:
            return 0
        return round((self.success_count / self.sent_count) * 100, 1)


class SMSAutomationSettings(models.Model):
    SMS_GATEWAY_CHOICES = (
        ('africas_talking', "Africa's Talking"),
        ('twilio', 'Twilio'),
        ('smpp', 'SMPP'),
        ('nexmo', 'Vonage (Nexmo)'),
    )

    enabled = models.BooleanField(default=True)
    sms_gateway = models.CharField(max_length=20, choices=SMS_GATEWAY_CHOICES, default='africas_talking')
    api_key = models.CharField(max_length=200, blank=True)
    username = models.CharField(max_length=100, blank=True)
    sender_id = models.CharField(max_length=50, blank=True)
    send_time_start = models.TimeField(default='08:00')
    send_time_end = models.TimeField(default='20:00')
    max_messages_per_day = models.PositiveIntegerField(default=1000)
    low_balance_alert = models.BooleanField(default=True)
    balance_threshold = models.PositiveIntegerField(default=100)
    sms_balance = models.PositiveIntegerField(default=1000)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'SMS Automation Settings'

    def __str__(self):
        return 'SMS Automation Settings'

    def can_send_message(self):
        """Check if we can send messages based on time and balance"""
        current_time = timezone.now().time()
        return (self.enabled and 
                self.send_time_start <= current_time <= self.send_time_end and
                self.sms_balance > 0)


class SMSAnalytics(models.Model):
    date = models.DateField(unique=True)
    total_messages = models.PositiveIntegerField(default=0)
    successful_messages = models.PositiveIntegerField(default=0)
    failed_messages = models.PositiveIntegerField(default=0)
    active_triggers = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'SMS Analytics'

    def __str__(self):
        return f"SMS Analytics for {self.date}"

    @property
    def success_rate(self):
        if self.total_messages == 0:
            return 0
        return round((self.successful_messages / self.total_messages) * 100, 2)


class ScheduledMessage(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )

    trigger = models.ForeignKey(SMSTrigger, on_delete=models.CASCADE, related_name='scheduled_messages')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='scheduled_messages')
    message = models.TextField()
    scheduled_for = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    created_at = models.DateTimeField(default=timezone.now)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['scheduled_for']

    def __str__(self):
        return f"Scheduled message for {self.client.user.username} at {self.scheduled_for}"