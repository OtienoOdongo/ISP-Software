from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from datetime import timedelta
import random
import string

class OTP(models.Model):
    phone_number = PhoneNumberField(unique=True)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def generate_otp(self):
        self.otp_code = ''.join(random.choices(string.digits, k=6))
        self.expires_at = self.created_at + timedelta(minutes=10)
        self.save()

    def is_valid(self):
        from django.utils import timezone
        return timezone.now() <= self.expires_at

    def __str__(self):
        return f"OTP for {self.phone_number}: {self.otp_code}"