# from django.db import models
# from phonenumber_field.modelfields import PhoneNumberField
# from datetime import timedelta
# import random
# import string

# class OTP(models.Model):
#     phone_number = PhoneNumberField(unique=True)
#     otp_code = models.CharField(max_length=6)
#     created_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField()

#     def generate_otp(self):
#         self.otp_code = ''.join(random.choices(string.digits, k=6))
#         self.expires_at = self.created_at + timedelta(minutes=10)
#         self.save()

#     def is_valid(self):
#         from django.utils import timezone
#         return timezone.now() <= self.expires_at

#     def __str__(self):
#         return f"OTP for {self.phone_number}: {self.otp_code}"



# from django.db import models
# from django.utils import timezone
# from datetime import timedelta
# import random


# class OTP(models.Model):
#     phone_number = models.CharField(max_length=20, unique=True)
#     otp = models.CharField(max_length=6)
#     is_verified = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField()
#     attempts = models.IntegerField(default=0)

#     def __str__(self):
#         return f"{self.phone_number} - {self.otp}"

#     def generate_otp(self):
#         self.otp = str(random.randint(100000, 999999))
#         self.expires_at = timezone.now() + timedelta(minutes=10)

#     def save(self, *args, **kwargs):
#         if not self.expires_at:
#             self.expires_at = timezone.now() + timedelta(minutes=10)
#         super().save(*args, **kwargs)

#     @classmethod
#     def create_or_update(cls, phone_number):
#         try:
#             obj = cls.objects.get(phone_number=phone_number)
#         except cls.DoesNotExist:
#             obj = cls(phone_number=phone_number)

#         obj.generate_otp()
#         obj.is_verified = False
#         obj.attempts = 0
#         obj.save()
#         return obj






from django.db import models
from django.utils import timezone
from datetime import timedelta
import random

class OTP(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    otp_code = models.CharField(max_length=6)  # Renamed from 'otp' for consistency
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)

    MAX_ATTEMPTS = 5  # Added maximum attempts limit

    def __str__(self):
        return f"{self.phone_number} - {self.otp_code}"

    def generate_otp(self):
        self.otp_code = str(random.randint(100000, 999999))
        self.expires_at = timezone.now() + timedelta(minutes=10)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.generate_otp()  # Ensure OTP and expiry are set on first save
        super().save(*args, **kwargs)

    def is_valid(self):
        return (timezone.now() <= self.expires_at and 
                self.attempts < self.MAX_ATTEMPTS and 
                not self.is_verified)

    def increment_attempts(self):
        self.attempts += 1
        self.save()

    def mark_verified(self):
        self.is_verified = True
        self.save()

    @classmethod
    def create_or_update(cls, phone_number):
        try:
            obj = cls.objects.get(phone_number=phone_number)
        except cls.DoesNotExist:
            obj = cls(phone_number=phone_number)

        obj.generate_otp()
        obj.is_verified = False
        obj.attempts = 0
        obj.save()
        return obj

    class Meta:
        indexes = [
            models.Index(fields=['phone_number']),
        ]