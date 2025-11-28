

# # authentication/models.py
# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from django.db import models
# from django.core.exceptions import ValidationError
# from phonenumber_field.modelfields import PhoneNumberField
# import uuid
# import secrets
# import string
# from typing import Optional, Dict, Any, Set
# from datetime import datetime, timedelta
# from django.core.cache import cache
# from django.utils import timezone

# # Cache management class
# class UserCacheManager:
#     _CACHE_PREFIX = "user_account_"
#     _CACHE_TIMEOUT = 300  # 5 minutes
    
#     @classmethod
#     def get_cache_key(cls, key):
#         return f"{cls._CACHE_PREFIX}{key}"
    
#     @classmethod
#     def get_user(cls, identifier):
#         """Get user from cache or None if not found"""
#         cache_key = cls.get_cache_key(identifier)
#         return cache.get(cache_key)
    
#     @classmethod
#     def set_user(cls, user, identifier=None):
#         """Cache user object"""
#         if identifier is None:
#             identifier = user.id or user.email or user.phone_number
        
#         cache_key = cls.get_cache_key(identifier)
#         cache.set(cache_key, user, cls._CACHE_TIMEOUT)
    
#     @classmethod
#     def invalidate_user(cls, identifier):
#         """Remove user from cache"""
#         cache_key = cls.get_cache_key(identifier)
#         cache.delete(cache_key)
    
#     @classmethod
#     def bulk_invalidate(cls, identifiers):
#         """Bulk cache invalidation"""
#         for identifier in identifiers:
#             cls.invalidate_user(identifier)

# # ID generation algorithms
# class IDGenerator:
#     _generated_ids: Set[str] = set()
#     _MAX_ATTEMPTS = 10
    
#     @classmethod
#     def generate_unique_id(cls, prefix="", length=8, max_attempts=_MAX_ATTEMPTS):
#         """Generate unique ID with collision detection"""
#         for _ in range(max_attempts):
#             unique_id = f"{prefix}{secrets.token_hex(length // 2)}".upper()
#             if unique_id not in cls._generated_ids:
#                 cls._generated_ids.add(unique_id)
#                 return unique_id
        
#         # Fallback to UUID if max attempts reached
#         fallback_id = f"{prefix}{uuid.uuid4().hex[:length].upper()}"
#         cls._generated_ids.add(fallback_id)
#         return fallback_id
    
#     @classmethod
#     def generate_username(cls, prefix="client_", max_attempts=_MAX_ATTEMPTS):
#         """Generate unique username"""
#         for _ in range(max_attempts):
#             username = f"{prefix}{secrets.token_hex(3)}"
#             if username not in cls._generated_ids:
#                 cls._generated_ids.add(username)
#                 return username
        
#         return f"{prefix}{uuid.uuid4().hex[:8]}"
    
#     @classmethod
#     def release_id(cls, identifier):
#         """Release ID back to pool"""
#         cls._generated_ids.discard(identifier)

# class UserAccountManager(BaseUserManager):
#     # Use Bloom filter for faster existence checks (conceptual)
#     _phone_number_cache = set()
#     _email_cache = set()
    
#     def _preload_existence_cache(self):
#         """Preload cache for faster validation"""
#         if not hasattr(self, '_cache_loaded'):
#             self._phone_number_cache = set(UserAccount.objects.filter(
#                 phone_number__isnull=False
#             ).values_list('phone_number', flat=True))
            
#             self._email_cache = set(UserAccount.objects.filter(
#                 email__isnull=False
#             ).values_list('email', flat=True))
            
#             self._cache_loaded = True
    
#     def create_user(
#         self, name: Optional[str] = None, email: Optional[str] = None, 
#         phone_number: Optional[str] = None, password: Optional[str] = None, 
#         user_type: str = "admin", **extra_fields
#     ) -> 'UserAccount':
#         """
#         Create user with optimized validation and caching
#         """
#         self._preload_existence_cache()
#         validation_errors = self._validate_user_creation(
#             name, email, phone_number, password, user_type
#         )
        
#         if validation_errors:
#             raise ValueError("; ".join(validation_errors))
        
#         if user_type == "client":
#             user = self._create_client_user(phone_number, **extra_fields)
#         else:
#             user = self._create_admin_user(name, email, password, user_type, **extra_fields)
        
#         # Update cache
#         if user.phone_number:
#             self._phone_number_cache.add(str(user.phone_number))
#         if user.email:
#             self._email_cache.add(user.email)
        
#         UserCacheManager.set_user(user)
#         return user
    
#     def _validate_user_creation(self, name, email, phone_number, password, user_type):
#         """Optimized validation using cached data"""
#         errors = []
        
#         if user_type == "client":
#             if not phone_number:
#                 errors.append("Client users must have a phone number")
#             elif str(phone_number) in self._phone_number_cache:
#                 errors.append("Phone number already exists")
            
#             if email:
#                 errors.append("Client users must not have an email address")
#             if password:
#                 errors.append("Client users do not require a password")
#             if name:
#                 errors.append("Client users must not have a name")
#         else:
#             if not email:
#                 errors.append("Admin users must have an email address")
#             elif email in self._email_cache:
#                 errors.append("Email already exists")
            
#             if not name:
#                 errors.append("Admin users must have a name")
#             if phone_number:
#                 errors.append("Admin users must not have a phone number")
#             if not password:
#                 errors.append("Admin users must have a password")
            
#             if user_type not in ['admin', 'superadmin']:
#                 errors.append(f"Invalid user type: {user_type}")
        
#         return errors
    
#     def _create_client_user(self, phone_number, **extra_fields):
#         """Optimized client creation"""
#         username = IDGenerator.generate_username()
#         client_id = IDGenerator.generate_unique_id("CLT-", 8)
        
#         user = self.model(
#             username=username,
#             phone_number=phone_number,
#             user_type="client",
#             is_staff=False,
#             client_id=client_id,
#             **extra_fields,
#         )
#         user.set_unusable_password()
#         user.save(using=self._db)
#         return user
    
#     def _create_admin_user(self, name, email, password, user_type, **extra_fields):
#         """Optimized admin user creation"""
#         email = self.normalize_email(email)
#         user = self.model(
#             name=name,
#             email=email,
#             user_type=user_type,
#             is_staff=user_type in ['admin', 'superadmin'],
#             is_superuser=user_type == 'superadmin',
#             **extra_fields,
#         )
#         user.set_password(password)
#         user.save(using=self._db)
#         return user
    
#     def create_superuser(self, name, email, password, **extra_fields):
#         return self.create_user(
#             name=name,
#             email=email,
#             password=password,
#             user_type="superadmin",
#             **extra_fields
#         )
    
#     def create_client(self, phone_number, **extra_fields):
#         return self.create_user(
#             phone_number=phone_number,
#             user_type="client",
#             **extra_fields,
#         )
    
#     def get_by_natural_key(self, email):
#         """Optimized natural key lookup with caching"""
#         cached_user = UserCacheManager.get_user(email)
#         if cached_user:
#             return cached_user
        
#         user = super().get_by_natural_key(email)
#         UserCacheManager.set_user(user, email)
#         return user

# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     USER_TYPES = (
#         ("client", "Client"),
#         ("admin", "Admin"),
#         ("superadmin", "Super Admin"),
#     )
    
#     # Core fields with optimized indexing
#     username = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
#     name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
#     email = models.EmailField(max_length=255, unique=True, null=True, blank=True, db_index=True)
#     phone_number = PhoneNumberField(unique=True, null=True, blank=True, db_index=True)
#     client_id = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
#     profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)

#     user_type = models.CharField(max_length=20, choices=USER_TYPES, default="admin", db_index=True)
#     is_active = models.BooleanField(default=True, db_index=True)
#     is_staff = models.BooleanField(default=False)
#     is_2fa_enabled = models.BooleanField(default=False)

#     date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
#     last_login = models.DateTimeField(null=True, blank=True, db_index=True)
#     last_updated = models.DateTimeField(auto_now=True)

#     objects = UserAccountManager()

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["name"]

#     class Meta:
#         indexes = [
#             models.Index(fields=['user_type', 'is_active']),
#             models.Index(fields=['email', 'is_active']),
#             models.Index(fields=['phone_number', 'is_active']),
#             models.Index(fields=['is_staff', 'is_active']),
#             models.Index(fields=['date_joined']),
#             models.Index(fields=['last_updated']),
#         ]
#         ordering = ['-date_joined']

#     def clean(self):
#         """Optimized validation with early returns"""
#         if self.user_type == "client":
#             if not self.phone_number:
#                 raise ValidationError("Client users must have a phone number")
#             if self.email:
#                 raise ValidationError("Client users must not have an email")
#             if self.name:
#                 raise ValidationError("Client users must not have a name")
#         else:
#             if not self.email:
#                 raise ValidationError("Admin users must have an email")
#             if not self.name:
#                 raise ValidationError("Admin users must have a name")
#             if self.phone_number:
#                 raise ValidationError("Admin users must not have a phone number")
#             if self.user_type not in ['admin', 'superadmin']:
#                 raise ValidationError(f"Invalid user type for admin user: {self.user_type}")

#     def save(self, *args, **kwargs):
#         """Optimized save with caching"""
#         self.clean()
        
#         if self.user_type == "client":
#             if not self.client_id:
#                 self.client_id = IDGenerator.generate_unique_id("CLT-", 8)
#             if not self.username:
#                 self.username = IDGenerator.generate_username()
        
#         # Ensure proper staff/superuser flags
#         if self.user_type in ['admin', 'superadmin']:
#             self.is_staff = True
#             self.is_superuser = (self.user_type == 'superadmin')
#         else:
#             self.is_staff = False
#             self.is_superuser = False
        
#         super().save(*args, **kwargs)
        
#         # Update cache
#         UserCacheManager.set_user(self)
#         UserCacheManager.set_user(self, self.email)
#         if self.phone_number:
#             UserCacheManager.set_user(self, str(self.phone_number))

#     def delete(self, *args, **kwargs):
#         """Handle deletion with cache invalidation"""
#         identifiers = [self.id, self.email]
#         if self.phone_number:
#             identifiers.append(str(self.phone_number))
        
#         UserCacheManager.bulk_invalidate(identifiers)
#         IDGenerator.release_id(self.client_id)
#         IDGenerator.release_id(self.username)
        
#         super().delete(*args, **kwargs)

#     def __str__(self):
#         if self.user_type == "client":
#             return f"{self.username} ({self.phone_number}) - {self.client_id}"
#         return f"{self.name} ({self.email}) - {self.get_user_type_display()}"
    
#     def get_display_fields(self) -> Dict[str, Any]:
#         """Optimized display fields with caching"""
#         cache_key = f"user_display_{self.id}_{self.last_updated.timestamp() if self.last_updated else ''}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return cached_data
        
#         base_fields = {
#             'id': self.id,
#             'user_type': self.user_type,
#             'user_type_display': self.get_user_type_display(),
#             'is_active': self.is_active,
#             'is_2fa_enabled': self.is_2fa_enabled,
#             'date_joined': self.date_joined.isoformat() if self.date_joined else None,
#             'last_updated': self.last_updated.isoformat() if self.last_updated else None,
#             'is_staff': self.is_staff,
#             'is_superuser': self.is_superuser,
#         }
        
#         if self.user_type == "client":
#             base_fields.update({
#                 'username': self.username,
#                 'phone_number': str(self.phone_number),
#                 'client_id': self.client_id,
#             })
#         else:
#             base_fields.update({
#                 'name': self.name,
#                 'email': self.email,
#                 'profile_pic': self.profile_pic.url if self.profile_pic else None,
#             })
        
#         # Add computed fields
#         base_fields['is_admin'] = self.user_type in ['admin', 'superadmin']
#         base_fields['is_super_admin'] = self.user_type == 'superadmin'
        
#         # Cache for 5 minutes
#         cache.set(cache_key, base_fields, 300)
#         return base_fields
    
#     @property
#     def is_admin(self):
#         return self.user_type in ['admin', 'superadmin']
    
#     @property
#     def is_super_admin(self):
#         return self.user_type == 'superadmin'
    
#     @classmethod
#     def get_active_users_count(cls):
#         """Optimized count query"""
#         return cls.objects.filter(is_active=True).count()
    
#     @classmethod
#     def get_recent_users(cls, days=7):
#         """Get recent users with optimized query"""
#         cutoff_date = timezone.now() - timedelta(days=days)
#         return cls.objects.filter(
#             date_joined__gte=cutoff_date, 
#             is_active=True
#         ).select_related().only('id', 'name', 'email', 'user_type', 'date_joined')








from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
from phonenumber_field.modelfields import PhoneNumberField
from django.core.cache import cache
from django.utils import timezone
from cryptography.fernet import Fernet
from django.conf import settings
import uuid
import secrets
import string
import base64
from typing import Optional, Dict, Any, Set
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Encryption for PPPoE credentials
class CredentialEncryption:
    _fernet = None
    
    @classmethod
    def get_fernet(cls):
        if cls._fernet is None:
            key = base64.urlsafe_b64encode(settings.SECRET_KEY[:32].encode())
            cls._fernet = Fernet(key)
        return cls._fernet
    
    @classmethod
    def encrypt(cls, data: str) -> str:
        return cls.get_fernet().encrypt(data.encode()).decode()
    
    @classmethod
    def decrypt(cls, encrypted_data: str) -> str:
        return cls.get_fernet().decrypt(encrypted_data.encode()).decode()

class UserCacheManager:
    _CACHE_PREFIX = "user_account_"
    _CACHE_TIMEOUT = 300
    
    @classmethod
    def get_cache_key(cls, key):
        return f"{cls._CACHE_PREFIX}{key}"
    
    @classmethod
    def get_user(cls, identifier):
        cache_key = cls.get_cache_key(identifier)
        return cache.get(cache_key)
    
    @classmethod
    def set_user(cls, user, identifier=None):
        if identifier is None:
            identifier = user.id or user.email or user.phone_number
        cache_key = cls.get_cache_key(identifier)
        cache.set(cache_key, user, cls._CACHE_TIMEOUT)
    
    @classmethod
    def invalidate_user(cls, identifier):
        cache_key = cls.get_cache_key(identifier)
        cache.delete(cache_key)
    
    @classmethod
    def bulk_invalidate(cls, identifiers):
        for identifier in identifiers:
            cls.invalidate_user(identifier)

class IDGenerator:
    _generated_ids: Set[str] = set()
    _MAX_ATTEMPTS = 10
    
    @classmethod
    def generate_unique_id(cls, prefix="", length=8, max_attempts=_MAX_ATTEMPTS):
        for _ in range(max_attempts):
            unique_id = f"{prefix}{secrets.token_hex(length // 2)}".upper()
            if unique_id not in cls._generated_ids:
                cls._generated_ids.add(unique_id)
                return unique_id
        fallback_id = f"{prefix}{uuid.uuid4().hex[:length].upper()}"
        cls._generated_ids.add(fallback_id)
        return fallback_id
    
    @classmethod
    def generate_username(cls, prefix="client_", max_attempts=_MAX_ATTEMPTS):
        for _ in range(max_attempts):
            username = f"{prefix}{secrets.token_hex(3)}"
            if username not in cls._generated_ids:
                cls._generated_ids.add(username)
                return username
        return f"{prefix}{uuid.uuid4().hex[:8]}"
    
    @classmethod
    def generate_pppoe_username(cls, client_id=None):
        prefix = "pppoe"
        if client_id:
            return f"{prefix}{client_id[-6:].lower()}"
        return f"{prefix}{secrets.token_hex(3)}"
    
    @classmethod
    def generate_pppoe_password(cls, length=12):
        chars = string.ascii_letters + string.digits + "!@#$%"
        return ''.join(secrets.choice(chars) for _ in range(length))
    
    @classmethod
    def release_id(cls, identifier):
        cls._generated_ids.discard(identifier)

class UserAccountManager(BaseUserManager):
    _phone_number_cache = set()
    _email_cache = set()
    
    def _preload_existence_cache(self):
        if not hasattr(self, '_cache_loaded'):
            self._phone_number_cache = set(UserAccount.objects.filter(
                phone_number__isnull=False
            ).values_list('phone_number', flat=True))
            self._email_cache = set(UserAccount.objects.filter(
                email__isnull=False
            ).values_list('email', flat=True))
            self._cache_loaded = True
    
    def create_user(
        self, name: Optional[str] = None, email: Optional[str] = None, 
        phone_number: Optional[str] = None, password: Optional[str] = None, 
        user_type: str = "admin", connection_type: str = "hotspot", **extra_fields
    ) -> 'UserAccount':
        self._preload_existence_cache()
        validation_errors = self._validate_user_creation(
            name, email, phone_number, password, user_type, connection_type
        )
        
        if validation_errors:
            raise ValueError("; ".join(validation_errors))
        
        if user_type == "client":
            user = self._create_client_user(phone_number, connection_type, **extra_fields)
        else:
            user = self._create_admin_user(name, email, password, user_type, **extra_fields)
        
        if user.phone_number:
            self._phone_number_cache.add(str(user.phone_number))
        if user.email:
            self._email_cache.add(user.email)
        
        UserCacheManager.set_user(user)
        return user
    
    def _validate_user_creation(self, name, email, phone_number, password, user_type, connection_type):
        errors = []
        
        if user_type == "client":
            if not phone_number:
                errors.append("Client users must have a phone number")
            elif str(phone_number) in self._phone_number_cache:
                errors.append("Phone number already exists")
            
            if email:
                errors.append("Client users must not have an email address")
            if password:
                errors.append("Client users do not require a password")
            if name:
                errors.append("Client users must not have a name")
            
            if connection_type not in ['hotspot', 'pppoe']:
                errors.append("Invalid connection type for client")
        else:
            if not email:
                errors.append("Admin users must have an email address")
            elif email in self._email_cache:
                errors.append("Email already exists")
            
            if not name:
                errors.append("Admin users must have a name")
            if phone_number:
                errors.append("Admin users must not have a phone number")
            if not password:
                errors.append("Admin users must have a password")
            
            if user_type not in ['admin', 'superadmin']:
                errors.append(f"Invalid user type: {user_type}")
        
        return errors
    
    def _create_client_user(self, phone_number, connection_type, **extra_fields):
        username = IDGenerator.generate_username()
        client_id = IDGenerator.generate_unique_id("CLT-", 8)
        
        user = self.model(
            username=username,
            phone_number=phone_number,
            user_type="client",
            connection_type=connection_type,
            is_staff=False,
            client_id=client_id,
            **extra_fields,
        )
        
        # Generate PPPoE credentials if needed
        if connection_type == 'pppoe':
            user.pppoe_username = IDGenerator.generate_pppoe_username(client_id)
            user.pppoe_password = CredentialEncryption.encrypt(
                IDGenerator.generate_pppoe_password()
            )
        
        user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def _create_admin_user(self, name, email, password, user_type, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(
            name=name,
            email=email,
            user_type=user_type,
            connection_type='admin',  # Admin connection type
            is_staff=user_type in ['admin', 'superadmin'],
            is_superuser=user_type == 'superadmin',
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, name, email, password, **extra_fields):
        return self.create_user(
            name=name,
            email=email,
            password=password,
            user_type="superadmin",
            **extra_fields
        )
    
    def create_hotspot_client(self, phone_number, **extra_fields):
        return self.create_user(
            phone_number=phone_number,
            user_type="client",
            connection_type="hotspot",
            **extra_fields,
        )
    
    def create_pppoe_client(self, phone_number, **extra_fields):
        return self.create_user(
            phone_number=phone_number,
            user_type="client",
            connection_type="pppoe",
            **extra_fields,
        )
    
    def get_by_natural_key(self, email):
        cached_user = UserCacheManager.get_user(email)
        if cached_user:
            return cached_user
        
        user = super().get_by_natural_key(email)
        UserCacheManager.set_user(user, email)
        return user

class UserAccount(AbstractBaseUser, PermissionsMixin):
    USER_TYPES = (
        ("client", "Client"),
        ("admin", "Admin"),
        ("superadmin", "Super Admin"),
    )
    
    CONNECTION_TYPES = (
        ("hotspot", "Hotspot"),
        ("pppoe", "PPPoE"),
        ("admin", "Admin Portal"),
    )
    
    # Core fields
    username = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    phone_number = PhoneNumberField(unique=True, null=True, blank=True, db_index=True)
    client_id = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)

    # Authentication and type fields
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default="admin", db_index=True)
    connection_type = models.CharField(max_length=20, choices=CONNECTION_TYPES, default="hotspot", db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    is_2fa_enabled = models.BooleanField(default=False)

    # PPPoE specific fields
    pppoe_username = models.CharField(max_length=50, unique=True, null=True, blank=True, db_index=True)
    pppoe_password = models.TextField(null=True, blank=True)  # Encrypted
    pppoe_active = models.BooleanField(default=False, db_index=True)
    last_pppoe_login = models.DateTimeField(null=True, blank=True)
    pppoe_ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Timestamps
    date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
    last_login = models.DateTimeField(null=True, blank=True, db_index=True)
    last_updated = models.DateTimeField(auto_now=True)

    objects = UserAccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        indexes = [
            models.Index(fields=['user_type', 'connection_type', 'is_active']),
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['phone_number', 'is_active']),
            models.Index(fields=['pppoe_username', 'pppoe_active']),
            models.Index(fields=['connection_type', 'is_active']),
            models.Index(fields=['is_staff', 'is_active']),
            models.Index(fields=['date_joined']),
            models.Index(fields=['last_updated']),
        ]
        ordering = ['-date_joined']

    def clean(self):
        if self.user_type == "client":
            if not self.phone_number:
                raise ValidationError("Client users must have a phone number")
            if self.email:
                raise ValidationError("Client users must not have an email")
            if self.name:
                raise ValidationError("Client users must not have a name")
            
            if self.connection_type not in ['hotspot', 'pppoe']:
                raise ValidationError("Invalid connection type for client user")
                
            # PPPoE validation
            if self.connection_type == 'pppoe':
                if not self.pppoe_username:
                    raise ValidationError("PPPoE clients must have a username")
                if not self.pppoe_password:
                    raise ValidationError("PPPoE clients must have a password")
        else:
            if not self.email:
                raise ValidationError("Admin users must have an email")
            if not self.name:
                raise ValidationError("Admin users must have a name")
            if self.phone_number:
                raise ValidationError("Admin users must not have a phone number")
            if self.user_type not in ['admin', 'superadmin']:
                raise ValidationError(f"Invalid user type for admin user: {self.user_type}")

    def save(self, *args, **kwargs):
        self.clean()
        
        if self.user_type == "client":
            if not self.client_id:
                self.client_id = IDGenerator.generate_unique_id("CLT-", 8)
            if not self.username:
                self.username = IDGenerator.generate_username()
            
            # Auto-generate PPPoE credentials if needed
            if self.connection_type == 'pppoe' and not self.pppoe_username:
                self.pppoe_username = IDGenerator.generate_pppoe_username(self.client_id)
            if self.connection_type == 'pppoe' and not self.pppoe_password:
                self.pppoe_password = CredentialEncryption.encrypt(
                    IDGenerator.generate_pppoe_password()
                )
        
        # Ensure proper staff/superuser flags
        if self.user_type in ['admin', 'superadmin']:
            self.is_staff = True
            self.is_superuser = (self.user_type == 'superadmin')
            self.connection_type = 'admin'
        else:
            self.is_staff = False
            self.is_superuser = False
        
        super().save(*args, **kwargs)
        
        # Update cache
        UserCacheManager.set_user(self)
        UserCacheManager.set_user(self, self.email)
        if self.phone_number:
            UserCacheManager.set_user(self, str(self.phone_number))

    def delete(self, *args, **kwargs):
        identifiers = [self.id, self.email]
        if self.phone_number:
            identifiers.append(str(self.phone_number))
        
        UserCacheManager.bulk_invalidate(identifiers)
        IDGenerator.release_id(self.client_id)
        IDGenerator.release_id(self.username)
        IDGenerator.release_id(self.pppoe_username)
        
        super().delete(*args, **kwargs)

    def get_pppoe_password_decrypted(self):
        """Get decrypted PPPoE password"""
        if not self.pppoe_password:
            return None
        try:
            return CredentialEncryption.decrypt(self.pppoe_password)
        except Exception as e:
            logger.error(f"Failed to decrypt PPPoE password for user {self.id}: {e}")
            return None

    def reset_pppoe_credentials(self):
        """Reset PPPoE credentials"""
        if self.connection_type == 'pppoe':
            self.pppoe_username = IDGenerator.generate_pppoe_username(self.client_id)
            self.pppoe_password = CredentialEncryption.encrypt(
                IDGenerator.generate_pppoe_password()
            )
            self.pppoe_active = False
            self.pppoe_ip_address = None
            self.save()

    def __str__(self):
        if self.user_type == "client":
            conn_type = f" ({self.connection_type})" if self.connection_type else ""
            return f"{self.username}{conn_type} - {self.phone_number}"
        return f"{self.name} ({self.email}) - {self.get_user_type_display()}"
    
    def get_display_fields(self) -> Dict[str, Any]:
        cache_key = f"user_display_{self.id}_{self.last_updated.timestamp() if self.last_updated else ''}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        base_fields = {
            'id': self.id,
            'user_type': self.user_type,
            'user_type_display': self.get_user_type_display(),
            'connection_type': self.connection_type,
            'connection_type_display': self.get_connection_type_display(),
            'is_active': self.is_active,
            'is_2fa_enabled': self.is_2fa_enabled,
            'date_joined': self.date_joined.isoformat() if self.date_joined else None,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'is_staff': self.is_staff,
            'is_superuser': self.is_superuser,
        }
        
        if self.user_type == "client":
            base_fields.update({
                'username': self.username,
                'phone_number': str(self.phone_number),
                'client_id': self.client_id,
            })
            
            if self.connection_type == 'pppoe':
                base_fields.update({
                    'pppoe_username': self.pppoe_username,
                    'pppoe_active': self.pppoe_active,
                    'last_pppoe_login': self.last_pppoe_login.isoformat() if self.last_pppoe_login else None,
                    'pppoe_ip_address': self.pppoe_ip_address,
                })
        else:
            base_fields.update({
                'name': self.name,
                'email': self.email,
                'profile_pic': self.profile_pic.url if self.profile_pic else None,
            })
        
        # Add computed fields
        base_fields['is_admin'] = self.user_type in ['admin', 'superadmin']
        base_fields['is_super_admin'] = self.user_type == 'superadmin'
        base_fields['is_pppoe_client'] = self.connection_type == 'pppoe'
        base_fields['is_hotspot_client'] = self.connection_type == 'hotspot'
        
        # Cache for 5 minutes
        cache.set(cache_key, base_fields, 300)
        return base_fields
    
    @property
    def is_admin(self):
        return self.user_type in ['admin', 'superadmin']
    
    @property
    def is_super_admin(self):
        return self.user_type == 'superadmin'
    
    @property
    def is_pppoe_client(self):
        return self.connection_type == 'pppoe'
    
    @property
    def is_hotspot_client(self):
        return self.connection_type == 'hotspot'
    
    @classmethod
    def get_active_users_count(cls):
        return cls.objects.filter(is_active=True).count()
    
    @classmethod
    def get_recent_users(cls, days=7):
        cutoff_date = timezone.now() - timedelta(days=days)
        return cls.objects.filter(
            date_joined__gte=cutoff_date, 
            is_active=True
        ).select_related().only('id', 'name', 'email', 'user_type', 'connection_type', 'date_joined')
    
    @classmethod
    def get_pppoe_clients(cls):
        return cls.objects.filter(
            user_type='client', 
            connection_type='pppoe', 
            is_active=True
        )
    
    @classmethod
    def get_hotspot_clients(cls):
        return cls.objects.filter(
            user_type='client', 
            connection_type='hotspot', 
            is_active=True
        )