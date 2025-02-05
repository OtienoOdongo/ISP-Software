from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    This model includes additional fields to enhance user management:
    - fullname: Stores the user's full name.
    - email: Unique email address used as the username.
    - is_verified: Flag to check if the user's email has been verified.
    - last_login: Timestamp of the user's last login.
    - created_at: Automatically set when the user account is created.
    - updated_at: Automatically updated when the user record is modified.

    Attributes:
        fullname (CharField): User's full name.
        email (EmailField): User's email address, set as unique.
        is_verified (BooleanField): Indicates if the user's email has been verified.
        last_login (DateTimeField): Timestamp of the last login.
        created_at (DateTimeField): Date and time when the user was created.
        updated_at (DateTimeField): Date and time when the user was last updated.

    Methods:
        __str__: Returns the user's full name as a string representation.
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

    # Custom related names to avoid clash with default User model
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',  # Custom related name to avoid clash
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',  # Custom related name to avoid clash
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'

    def __str__(self):
        return self.fullname
   