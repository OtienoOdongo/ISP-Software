

# # authentication/models.py
# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from django.db import models
# from django.core.exceptions import ValidationError
# from phonenumber_field.modelfields import PhoneNumberField
# import uuid
# import random
# import string


# class UserAccountManager(BaseUserManager):
#     def create_user(
#         self, name=None, email=None, phone_number=None,
#         password=None, user_type="admin", **extra_fields
#     ):
#         if user_type == "client":
#             if not phone_number:
#                 raise ValueError("Client users must have a phone number")
#             if email:
#                 raise ValueError("Client users must not have an email address")
#             if password:
#                 raise ValueError("Client users do not require a password")
#             if name:
#                 raise ValueError("Client users must not have a name")

#             # Generate unique username and client_id
#             username = f"client_{self.generate_random_string(6)}"
#             client_id = f"CLT-{uuid.uuid4().hex[:8].upper()}"

#             user = self.model(
#                 username=username,
#                 phone_number=phone_number,
#                 user_type=user_type,
#                 is_staff=False,
#                 client_id=client_id,
#                 **extra_fields,
#             )
#             user.set_unusable_password()
#         else:  # admin or superuser
#             if not email:
#                 raise ValueError("Admin users must have an email address")
#             if not name:
#                 raise ValueError("Admin users must have a name")
#             if phone_number:
#                 raise ValueError("Admin users must not have a phone number")
#             if not password:
#                 raise ValueError("Admin users must have a password")

#             email = self.normalize_email(email)
#             user = self.model(
#                 name=name,
#                 email=email,
#                 user_type=user_type,
#                 is_staff=True,
#                 **extra_fields,
#             )
#             user.set_password(password)

#         user.save(using=self._db)
#         return user

#     def generate_random_string(self, length=6):
#         """Generate a random alphanumeric string"""
#         characters = string.ascii_lowercase + string.digits
#         return "".join(random.choice(characters) for _ in range(length))

#     def create_client(self, phone_number, **extra_fields):
#         return self.create_user(
#             phone_number=phone_number,
#             user_type="client",
#             **extra_fields,
#         )


# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     USER_TYPES = (
#         ("client", "Client"),
#         ("admin", "Admin"),
#         ("superuser", "Superuser"),
#     )

#     username = models.CharField(max_length=255, unique=True, null=True, blank=True)
#     name = models.CharField(max_length=255, null=True, blank=True)
#     email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
#     phone_number = PhoneNumberField(unique=True, null=True, blank=True)
#     client_id = models.CharField(max_length=12, unique=True, null=True, blank=True)
#     profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)

#     user_type = models.CharField(max_length=20, choices=USER_TYPES, default="admin")
#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)
#     is_2fa_enabled = models.BooleanField(default=False)  

#     date_joined = models.DateTimeField(auto_now_add=True)
#     last_login = models.DateTimeField(null=True, blank=True)

#     objects = UserAccountManager()

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["name"]

#     def clean(self):
#         if self.user_type == "client":
#             if not self.phone_number:
#                 raise ValidationError("Client users must have a phone number")
#             if self.email:
#                 raise ValidationError("Client users must not have an email")
#             if self.name:
#                 raise ValidationError("Client users must not have a name")
#         else:  # admin or superuser
#             if not self.email:
#                 raise ValidationError("Admin users must have an email")
#             if not self.name:
#                 raise ValidationError("Admin users must have a name")
#             if self.phone_number:
#                 raise ValidationError("Admin users must not have a phone number")

#     def save(self, *args, **kwargs):
#         self.clean()
#         if self.user_type == "client":
#             if not self.client_id:
#                 self.client_id = f"CLT-{uuid.uuid4().hex[:8].upper()}"
#             if not self.username:
#                 self.username = f"client_{UserAccount.objects.generate_random_string(6)}"
#         super().save(*args, **kwargs)

#     def __str__(self):
#         if self.user_type == "client":
#             return f"{self.username} ({self.phone_number}) - {self.client_id}"
#         return f"{self.name} ({self.email}) - {self.get_user_type_display()}"








# # authentication/models.py
# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from django.db import models
# from django.core.exceptions import ValidationError
# from phonenumber_field.modelfields import PhoneNumberField
# import uuid
# import random
# import string
# from typing import Optional, Dict, Any


# class UserAccountManager(BaseUserManager):
#     # Cache for generated client IDs to avoid collisions
#     _generated_client_ids = set()
    
#     def create_user(
#         self, name: Optional[str] = None, email: Optional[str] = None, 
#         phone_number: Optional[str] = None, password: Optional[str] = None, 
#         user_type: str = "admin", **extra_fields
#     ) -> 'UserAccount':
#         """
#         Create a user with optimized validation and unique ID generation
#         """
#         validation_errors = self._validate_user_creation(
#             name, email, phone_number, password, user_type
#         )
#         if validation_errors:
#             raise ValueError(validation_errors[0])
        
#         if user_type == "client":
#             return self._create_client_user(phone_number, **extra_fields)
#         else:
#             return self._create_admin_user(name, email, password, user_type, **extra_fields)
    
#     def _validate_user_creation(self, name, email, phone_number, password, user_type):
#         """Optimized validation using early returns"""
#         errors = []
        
#         if user_type == "client":
#             if not phone_number:
#                 errors.append("Client users must have a phone number")
#             if email:
#                 errors.append("Client users must not have an email address")
#             if password:
#                 errors.append("Client users do not require a password")
#             if name:
#                 errors.append("Client users must not have a name")
#         else:
#             if not email:
#                 errors.append("Admin users must have an email address")
#             if not name:
#                 errors.append("Admin users must have a name")
#             if phone_number:
#                 errors.append("Admin users must not have a phone number")
#             if not password:
#                 errors.append("Admin users must have a password")
        
#         return errors
    
#     def _create_client_user(self, phone_number, **extra_fields):
#         """Optimized client creation with collision-resistant ID generation"""
#         username = self._generate_unique_username()
#         client_id = self._generate_unique_client_id()
        
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
#             is_staff=True,
#             **extra_fields,
#         )
#         user.set_password(password)
#         user.save(using=self._db)
#         return user
    
#     def _generate_unique_username(self, max_attempts: int = 10) -> str:
#         """Generate a unique username with collision detection"""
#         for _ in range(max_attempts):
#             username = f"client_{self._generate_random_string(6)}"
#             if not UserAccount.objects.filter(username=username).exists():
#                 return username
#         # Fallback to UUID if random generation fails
#         return f"client_{uuid.uuid4().hex[:12]}"
    
#     def _generate_unique_client_id(self, max_attempts: int = 5) -> str:
#         """Generate a unique client ID with collision detection"""
#         for _ in range(max_attempts):
#             client_id = f"CLT-{uuid.uuid4().hex[:8].upper()}"
#             if client_id not in self._generated_client_ids and \
#                not UserAccount.objects.filter(client_id=client_id).exists():
#                 self._generated_client_ids.add(client_id)
#                 return client_id
#         # Very unlikely fallback
#         return f"CLT-{uuid.uuid4().hex[:12].upper()}"
    
#     def _generate_random_string(self, length: int = 6) -> str:
#         """Generate a random alphanumeric string using secrets module for better security"""
#         import secrets
#         alphabet = string.ascii_lowercase + string.digits
#         return ''.join(secrets.choice(alphabet) for _ in range(length))
    
#     def create_client(self, phone_number, **extra_fields):
#         return self.create_user(
#             phone_number=phone_number,
#             user_type="client",
#             **extra_fields,
#         )


# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     USER_TYPES = (
#         ("client", "Client"),
#         ("admin", "Admin"),
#         ("superuser", "Superuser"),
#     )
    
#     # Field definitions
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

#     objects = UserAccountManager()

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["name"]

#     class Meta:
#         indexes = [
#             models.Index(fields=['user_type', 'is_active']),
#             models.Index(fields=['email', 'is_active']),
#             models.Index(fields=['phone_number', 'is_active']),
#         ]

#     def clean(self):
#         """Optimized validation using early returns"""
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

#     def save(self, *args, **kwargs):
#         """Optimized save with precomputation"""
#         self.clean()
        
#         if self.user_type == "client":
#             if not self.client_id:
#                 self.client_id = UserAccount.objects._generate_unique_client_id()
#             if not self.username:
#                 self.username = UserAccount.objects._generate_unique_username()
        
#         super().save(*args, **kwargs)

#     def __str__(self):
#         if self.user_type == "client":
#             return f"{self.username} ({self.phone_number}) - {self.client_id}"
#         return f"{self.name} ({self.email}) - {self.get_user_type_display()}"
    
#     def get_display_fields(self) -> Dict[str, Any]:
#         """Return a dictionary of display fields for API responses"""
#         base_fields = {
#             'id': self.id,
#             'user_type': self.user_type,
#             'user_type_display': self.get_user_type_display(),
#             'is_active': self.is_active,
#             'is_2fa_enabled': self.is_2fa_enabled,
#             'date_joined': self.date_joined,
#         }
        
#         if self.user_type == "client":
#             base_fields.update({
#                 'username': self.username,
#                 'phone_number': str(self.phone_number),
#                 'client_id': self.client_id,
#                 'profile_pic': self.profile_pic.url if self.profile_pic else None,
#             })
#         else:
#             base_fields.update({
#                 'name': self.name,
#                 'email': self.email,
#                 'profile_pic': self.profile_pic.url if self.profile_pic else None,
#             })
        
#         return base_fields





# authentication/models.py
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
from phonenumber_field.modelfields import PhoneNumberField
import uuid
import secrets
import string
from typing import Optional, Dict, Any, Set
from datetime import datetime, timedelta
from django.core.cache import cache
from django.utils import timezone

# Cache management class
class UserCacheManager:
    _CACHE_PREFIX = "user_account_"
    _CACHE_TIMEOUT = 300  # 5 minutes
    
    @classmethod
    def get_cache_key(cls, key):
        return f"{cls._CACHE_PREFIX}{key}"
    
    @classmethod
    def get_user(cls, identifier):
        """Get user from cache or None if not found"""
        cache_key = cls.get_cache_key(identifier)
        return cache.get(cache_key)
    
    @classmethod
    def set_user(cls, user, identifier=None):
        """Cache user object"""
        if identifier is None:
            identifier = user.id or user.email or user.phone_number
        
        cache_key = cls.get_cache_key(identifier)
        cache.set(cache_key, user, cls._CACHE_TIMEOUT)
    
    @classmethod
    def invalidate_user(cls, identifier):
        """Remove user from cache"""
        cache_key = cls.get_cache_key(identifier)
        cache.delete(cache_key)
    
    @classmethod
    def bulk_invalidate(cls, identifiers):
        """Bulk cache invalidation"""
        for identifier in identifiers:
            cls.invalidate_user(identifier)

# ID generation algorithms
class IDGenerator:
    _generated_ids: Set[str] = set()
    _MAX_ATTEMPTS = 10
    
    @classmethod
    def generate_unique_id(cls, prefix="", length=8, max_attempts=_MAX_ATTEMPTS):
        """Generate unique ID with collision detection"""
        for _ in range(max_attempts):
            unique_id = f"{prefix}{secrets.token_hex(length // 2)}".upper()
            if unique_id not in cls._generated_ids:
                cls._generated_ids.add(unique_id)
                return unique_id
        
        # Fallback to UUID if max attempts reached
        fallback_id = f"{prefix}{uuid.uuid4().hex[:length].upper()}"
        cls._generated_ids.add(fallback_id)
        return fallback_id
    
    @classmethod
    def generate_username(cls, prefix="client_", max_attempts=_MAX_ATTEMPTS):
        """Generate unique username"""
        for _ in range(max_attempts):
            username = f"{prefix}{secrets.token_hex(3)}"
            if username not in cls._generated_ids:
                cls._generated_ids.add(username)
                return username
        
        return f"{prefix}{uuid.uuid4().hex[:8]}"
    
    @classmethod
    def release_id(cls, identifier):
        """Release ID back to pool"""
        cls._generated_ids.discard(identifier)

class UserAccountManager(BaseUserManager):
    # Use Bloom filter for faster existence checks (conceptual)
    _phone_number_cache = set()
    _email_cache = set()
    
    def _preload_existence_cache(self):
        """Preload cache for faster validation"""
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
        user_type: str = "admin", **extra_fields
    ) -> 'UserAccount':
        """
        Create user with optimized validation and caching
        """
        self._preload_existence_cache()
        validation_errors = self._validate_user_creation(
            name, email, phone_number, password, user_type
        )
        
        if validation_errors:
            raise ValueError("; ".join(validation_errors))
        
        if user_type == "client":
            user = self._create_client_user(phone_number, **extra_fields)
        else:
            user = self._create_admin_user(name, email, password, user_type, **extra_fields)
        
        # Update cache
        if user.phone_number:
            self._phone_number_cache.add(str(user.phone_number))
        if user.email:
            self._email_cache.add(user.email)
        
        UserCacheManager.set_user(user)
        return user
    
    def _validate_user_creation(self, name, email, phone_number, password, user_type):
        """Optimized validation using cached data"""
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
    
    def _create_client_user(self, phone_number, **extra_fields):
        """Optimized client creation"""
        username = IDGenerator.generate_username()
        client_id = IDGenerator.generate_unique_id("CLT-", 8)
        
        user = self.model(
            username=username,
            phone_number=phone_number,
            user_type="client",
            is_staff=False,
            client_id=client_id,
            **extra_fields,
        )
        user.set_unusable_password()
        user.save(using=self._db)
        return user
    
    def _create_admin_user(self, name, email, password, user_type, **extra_fields):
        """Optimized admin user creation"""
        email = self.normalize_email(email)
        user = self.model(
            name=name,
            email=email,
            user_type=user_type,
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
    
    def create_client(self, phone_number, **extra_fields):
        return self.create_user(
            phone_number=phone_number,
            user_type="client",
            **extra_fields,
        )
    
    def get_by_natural_key(self, email):
        """Optimized natural key lookup with caching"""
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
    
    # Core fields with optimized indexing
    username = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    phone_number = PhoneNumberField(unique=True, null=True, blank=True, db_index=True)
    client_id = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", null=True, blank=True)

    user_type = models.CharField(max_length=20, choices=USER_TYPES, default="admin", db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    is_2fa_enabled = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
    last_login = models.DateTimeField(null=True, blank=True, db_index=True)
    last_updated = models.DateTimeField(auto_now=True)

    objects = UserAccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        indexes = [
            models.Index(fields=['user_type', 'is_active']),
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['phone_number', 'is_active']),
            models.Index(fields=['is_staff', 'is_active']),
            models.Index(fields=['date_joined']),
            models.Index(fields=['last_updated']),
        ]
        ordering = ['-date_joined']

    def clean(self):
        """Optimized validation with early returns"""
        if self.user_type == "client":
            if not self.phone_number:
                raise ValidationError("Client users must have a phone number")
            if self.email:
                raise ValidationError("Client users must not have an email")
            if self.name:
                raise ValidationError("Client users must not have a name")
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
        """Optimized save with caching"""
        self.clean()
        
        if self.user_type == "client":
            if not self.client_id:
                self.client_id = IDGenerator.generate_unique_id("CLT-", 8)
            if not self.username:
                self.username = IDGenerator.generate_username()
        
        # Ensure proper staff/superuser flags
        if self.user_type in ['admin', 'superadmin']:
            self.is_staff = True
            self.is_superuser = (self.user_type == 'superadmin')
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
        """Handle deletion with cache invalidation"""
        identifiers = [self.id, self.email]
        if self.phone_number:
            identifiers.append(str(self.phone_number))
        
        UserCacheManager.bulk_invalidate(identifiers)
        IDGenerator.release_id(self.client_id)
        IDGenerator.release_id(self.username)
        
        super().delete(*args, **kwargs)

    def __str__(self):
        if self.user_type == "client":
            return f"{self.username} ({self.phone_number}) - {self.client_id}"
        return f"{self.name} ({self.email}) - {self.get_user_type_display()}"
    
    def get_display_fields(self) -> Dict[str, Any]:
        """Optimized display fields with caching"""
        cache_key = f"user_display_{self.id}_{self.last_updated.timestamp() if self.last_updated else ''}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        base_fields = {
            'id': self.id,
            'user_type': self.user_type,
            'user_type_display': self.get_user_type_display(),
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
        else:
            base_fields.update({
                'name': self.name,
                'email': self.email,
                'profile_pic': self.profile_pic.url if self.profile_pic else None,
            })
        
        # Add computed fields
        base_fields['is_admin'] = self.user_type in ['admin', 'superadmin']
        base_fields['is_super_admin'] = self.user_type == 'superadmin'
        
        # Cache for 5 minutes
        cache.set(cache_key, base_fields, 300)
        return base_fields
    
    @property
    def is_admin(self):
        return self.user_type in ['admin', 'superadmin']
    
    @property
    def is_super_admin(self):
        return self.user_type == 'superadmin'
    
    @classmethod
    def get_active_users_count(cls):
        """Optimized count query"""
        return cls.objects.filter(is_active=True).count()
    
    @classmethod
    def get_recent_users(cls, days=7):
        """Get recent users with optimized query"""
        cutoff_date = timezone.now() - timedelta(days=days)
        return cls.objects.filter(
            date_joined__gte=cutoff_date, 
            is_active=True
        ).select_related().only('id', 'name', 'email', 'user_type', 'date_joined')