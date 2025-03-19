# account/models/settings_model.py
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from authentication.models import UserAccount
import uuid

def generate_api_key():
    return uuid.uuid4().hex[:30]

class AdminSettings(models.Model):
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name='settings')
    email_alerts = models.BooleanField(default=True)
    payment_alerts = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=False)
    security_alerts = models.BooleanField(default=True)
    priority_only = models.BooleanField(default=False)
    digest_frequency = models.CharField(
        max_length=10,
        choices=(("immediate", "Immediate"), ("hourly", "Hourly"), ("daily", "Daily"), ("weekly", "Weekly")),
        default="daily",
    )
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=100, blank=True, null=True)
    session_timeout = models.PositiveIntegerField(default=30)
    ip_whitelist = models.TextField(blank=True, default="")
    api_key = models.CharField(max_length=100, unique=True, default=generate_api_key)
    profile_visible = models.BooleanField(default=True)
    opt_out_analytics = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.user.email}"

class Session(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    device = models.CharField(max_length=255)
    last_active = models.DateTimeField(auto_now=True)
    session_key = models.CharField(max_length=40, unique=True)

    def __str__(self):
        return f"{self.device} - {self.user.email}"

@receiver(post_save, sender=UserAccount)
def create_admin_settings(sender, instance, created, **kwargs):
    if created:
        AdminSettings.objects.create(user=instance)