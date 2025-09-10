




from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
from phonenumber_field.modelfields import PhoneNumberField
import uuid
import random
import string

class UserAccountManager(BaseUserManager):
    def create_user(self, name=None, email=None, phone_number=None, password=None, user_type='admin', **extra_fields):
        if user_type == 'client':
            if not phone_number:
                raise ValueError('Client users must have a phone number')
            if email:
                raise ValueError('Client users must not have an email address')
            if password:
                raise ValueError('Client users do not require a password')
            if name:
                raise ValueError('Client users must not have a name')

            # Generate unique username and client_id
            username = f"client_{self.generate_random_string(6)}"
            client_id = f"CLT-{uuid.uuid4().hex[:8].upper()}"
            
            user = self.model(
                username=username,  # Use auto-generated username instead of name
                phone_number=phone_number,
                user_type=user_type,
                is_staff=False,
                client_id=client_id,
                **extra_fields
            )
            user.set_unusable_password()
        else:  # admin or superuser
            if not email:
                raise ValueError('Admin users must have an email address')
            if not name:
                raise ValueError('Admin users must have a name')
            if phone_number:
                raise ValueError('Admin users must not have a phone number')
            if not password:
                raise ValueError('Admin users must have a password')

            email = self.normalize_email(email)
            user = self.model(
                name=name,
                email=email,
                user_type=user_type,
                is_staff=True,
                **extra_fields
            )
            user.set_password(password)

        user.save(using=self._db)
        return user

    def generate_random_string(self, length=6):
        """Generate a random alphanumeric string"""
        characters = string.ascii_lowercase + string.digits
        return ''.join(random.choice(characters) for _ in range(length))

    def create_client(self, phone_number, **extra_fields):
        return self.create_user(
            phone_number=phone_number,
            user_type='client',
            **extra_fields
        )

class UserAccount(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ('client', 'Client'),
        ('admin', 'Admin'),
        ('superuser', 'Superuser'),
    )

    username = models.CharField(max_length=255, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)  # Now optional for clients
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    phone_number = PhoneNumberField(unique=True, null=True, blank=True)
    client_id = models.CharField(max_length=12, unique=True, null=True, blank=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='admin')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']  # Still required for admin users

    def clean(self):
        if self.user_type == 'client':
            if not self.phone_number:
                raise ValidationError("Client users must have a phone number")
            if self.email:
                raise ValidationError("Client users must not have an email")
            if self.name:
                raise ValidationError("Client users must not have a name")
        else:  # admin or superuser
            if not self.email:
                raise ValidationError("Admin users must have an email")
            if not self.name:
                raise ValidationError("Admin users must have a name")
            if self.phone_number:
                raise ValidationError("Admin users must not have a phone number")

    def save(self, *args, **kwargs):
        self.clean()
        if self.user_type == 'client':
            if not self.client_id:
                self.client_id = f"CLT-{uuid.uuid4().hex[:8].upper()}"
            if not self.username:
                # Generate username if not set
                self.username = f"client_{UserAccount.objects.generate_random_string(6)}"
        super().save(*args, **kwargs)

    def __str__(self):
        if self.user_type == 'client':
            return f"{self.username} ({self.phone_number}) - {self.client_id}"
        return f"{self.name} ({self.email}) - {self.get_user_type_display()}"