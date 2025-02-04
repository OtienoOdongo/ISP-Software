from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    This model includes:
    - fullname: For storing the user's full name
    - email: Email address of the user, set as unique
    - is_verified: Indicates if the user's email has been verified
    - last_login: Timestamp of the user's last login
    - created_at: Timestamp for when the user account was created
    - updated_at: Timestamp for when the user account was last updated
    """
    
    fullname = models.CharField(max_length=255, help_text="User's full name")
    email = models.EmailField(unique=True, help_text="User's email address")
    is_verified = models.BooleanField(default=False, help_text="Has this user's email been verified?")
    last_login = models.DateTimeField(null=True, blank=True, help_text="Timestamp of the last login")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Date and time when user was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="Date and time of the last update to the user")

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return self.fullname

   