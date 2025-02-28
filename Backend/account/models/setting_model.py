from django.db import models
from authentication.models import UserAccount
import uuid

class AdminSettings(models.Model):
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name='settings')
    email_alerts = models.BooleanField(default=True)
    payment_alerts = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=False)
    api_key = models.CharField(max_length=100, unique=True, default=lambda: uuid.uuid4().hex[:30])

    def __str__(self):
        return f"Settings for {self.user.email}"