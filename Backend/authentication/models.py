


# """
# AUTHENTICATION APP - Core User Identity Management
# Handles only authentication-related functionality for two user types:
# 1. Authenticated Users (Admins/Staff): Email + Password (Django Admin/Dashboard)
# 2. Client Users: Phone-based (Hotspot) or PPPoE credentials

# SUPPORTS:
# - Captive Portal Registration (Hotspot users self-register)
# - Admin Dashboard Registration (Manual client creation)
# - PPPoE clients with auto-generated credentials
# """

# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.core.cache import cache
# from django.utils import timezone
# from django.utils.crypto import constant_time_compare
# from cryptography.fernet import Fernet
# from cryptography.hazmat.primitives.kdf.hkdf import HKDF
# from cryptography.hazmat.primitives import hashes
# from django.conf import settings
# import uuid
# import secrets
# import string
# import base64
# from typing import Optional, Dict, Any
# from datetime import datetime
# import logging
# import re

# logger = logging.getLogger(__name__)

# # ==================== ENCRYPTION SERVICE ====================
# class CredentialEncryption:
#     """
#     Service for encrypting sensitive credentials (PPPoE passwords)
#     Uses production-grade HKDF for key derivation from Django secret key
#     """
#     _fernet = None
    
#     @classmethod
#     def _get_encryption_key(cls) -> bytes:
#         """
#         Derive encryption key from Django secret key using HKDF
#         This ensures secure, deterministic key derivation
#         """
#         secret_key = settings.SECRET_KEY.encode()
        
#         # Use proper HKDF for secure key derivation
#         hkdf = HKDF(
#             algorithm=hashes.SHA256(),
#             length=32,  # 32 bytes required for Fernet
#             salt=b'authentication_encryption_salt',
#             info=b'pppoe_credential_encryption',
#         )
        
#         derived_key = hkdf.derive(secret_key)
#         return base64.urlsafe_b64encode(derived_key)
    
#     @classmethod
#     def get_fernet(cls):
#         """Get singleton Fernet instance with lazy initialization"""
#         if cls._fernet is None:
#             try:
#                 key = cls._get_encryption_key()
#                 cls._fernet = Fernet(key)
#                 logger.debug("Fernet encryption initialized")
#             except Exception as e:
#                 logger.error(f"Failed to initialize Fernet: {e}")
#                 raise
#         return cls._fernet
    
#     @classmethod
#     def encrypt(cls, data: str) -> str:
#         """Encrypt sensitive data (PPPoE passwords)"""
#         try:
#             if not data:
#                 return ""
#             encrypted = cls.get_fernet().encrypt(data.encode())
#             return encrypted.decode()
#         except Exception as e:
#             logger.error(f"Encryption failed: {e}")
#             raise ValueError("Failed to encrypt sensitive data")
    
#     @classmethod
#     def decrypt(cls, encrypted_data: str) -> str:
#         """Decrypt encrypted data with proper error handling"""
#         try:
#             if not encrypted_data:
#                 return ""
#             return cls.get_fernet().decrypt(encrypted_data.encode()).decode()
#         except Exception as e:
#             logger.error(f"Decryption failed: {e}")
#             raise ValueError("Failed to decrypt data")


# # ==================== PHONE VALIDATION UTILITIES ====================
# class PhoneValidation:
#     """
#     Phone number validation and normalization for Kenyan numbers
#     Pure validation utility - no business logic
#     """
    
#     # Compiled regex patterns for Kenyan phone formats
#     _PHONE_PATTERNS = [
#         re.compile(r'^\+2547\d{8}$'),      # +254712345678 (Safaricom)
#         re.compile(r'^\+2541\d{8}$'),      # +254112345678 (Telkom/Airtel)
#         re.compile(r'^07\d{8}$'),          # 0712345678 (Safaricom)
#         re.compile(r'^01\d{8}$'),          # 0112345678 (Telkom/Airtel)
#     ]
    
#     @classmethod
#     def is_valid_kenyan_phone(cls, phone: str) -> bool:
#         """Validate if phone number matches Kenyan formats"""
#         if not phone:
#             return False
        
#         clean_number = re.sub(r'[^\d+]', '', str(phone))
#         return any(pattern.match(clean_number) for pattern in cls._PHONE_PATTERNS)
    
#     @classmethod
#     def normalize_kenyan_phone(cls, phone: str) -> str:
#         """Normalize Kenyan phone to +254 international format"""
#         if not phone:
#             return ""
        
#         clean_number = re.sub(r'[^\d+]', '', str(phone))
        
#         # Convert to +254 format
#         if clean_number.startswith('0') and len(clean_number) == 10:
#             # 0712345678 → +254712345678
#             return f"+254{clean_number[1:]}"
#         elif (clean_number.startswith('7') or clean_number.startswith('1')) and len(clean_number) == 9:
#             # 712345678 → +254712345678
#             return f"+254{clean_number}"
#         elif clean_number.startswith('254') and len(clean_number) == 12:
#             # 254712345678 → +254712345678
#             return f"+{clean_number}"
#         elif clean_number.startswith('+254') and len(clean_number) == 13:
#             # Already in correct format
#             return clean_number
        
#         # Return cleaned version if can't normalize
#         return clean_number
    
#     @classmethod
#     def get_phone_display(cls, phone: str) -> str:
#         """Convert +254 format to local display format (0XXXXXXXXX)"""
#         normalized = cls.normalize_kenyan_phone(phone)
        
#         if normalized.startswith('+254'):
#             return f"0{normalized[4:]}"
        
#         return normalized


# # ==================== ID GENERATOR ====================
# class IDGenerator:
#     """
#     Generates unique identifiers for clients
#     Pure generation utility - no business logic
#     """
    
#     @staticmethod
#     def generate_client_username(phone_number: str) -> str:
#         """
#         Generate unique username for hotspot clients from phone number
#         Example: +254712345678 → client_712345678_abc123
#         """
#         if not phone_number:
#             return f"client_{secrets.token_hex(6)}"
        
#         # Extract last 8 digits of phone for username
#         clean_phone = re.sub(r'[^\d]', '', phone_number)
#         phone_part = clean_phone[-8:] if len(clean_phone) >= 8 else clean_phone
        
#         # Add random suffix for uniqueness
#         random_suffix = secrets.token_hex(3).lower()
#         username = f"client_{phone_part}_{random_suffix}"
        
#         return username
    
#     @staticmethod
#     def generate_pppoe_username(client_name: str, phone_number: str) -> str:
#         """
#         Generate PPPoE username from client name and phone number
#         Example: "John Doe", "+254712345678" → johndoe_5678
#         """
#         # Clean and extract name part
#         name_part = re.sub(r'[^a-z]', '', client_name.lower())
#         if len(name_part) > 8:
#             name_part = name_part[:8]
        
#         # Extract last 4 digits of phone
#         clean_phone = re.sub(r'[^\d]', '', phone_number)
#         phone_part = clean_phone[-4:] if len(clean_phone) >= 4 else clean_phone
        
#         # Combine
#         username = f"{name_part}_{phone_part}"
        
#         # Ensure uniqueness
#         from .models import UserAccount
#         max_attempts = 5
#         for attempt in range(max_attempts):
#             if attempt > 0:
#                 random_suffix = secrets.token_hex(2)
#                 username = f"{name_part}_{phone_part}_{random_suffix}"
            
#             if not UserAccount.objects.filter(pppoe_username=username).exists():
#                 return username
        
#         # Fallback with timestamp
#         timestamp = str(int(timezone.now().timestamp()))[-4:]
#         return f"{name_part}_{timestamp}"
    
#     @staticmethod
#     def generate_pppoe_password(phone_number: str) -> str:
#         """
#         Generate secure PPPoE password using phone number as seed
#         Ensures password can be regenerated if needed
#         """
#         if not phone_number:
#             return secrets.token_urlsafe(12)
        
#         # Clean phone number for seed
#         clean_phone = re.sub(r'[^\d]', '', phone_number)
        
#         # Use phone as seed for deterministic generation
#         import hashlib
#         seed = hashlib.sha256(clean_phone.encode()).digest()
        
#         # Define character sets (avoid confusing characters)
#         uppercase = string.ascii_uppercase.replace('O', '').replace('I', '')
#         lowercase = string.ascii_lowercase.replace('o', '').replace('l', '')
#         digits = string.digits.replace('0', '').replace('1', '')
#         special = "@#$%&"
        
#         # Create password with required character types
#         password_chars = [
#             secrets.choice(uppercase),
#             secrets.choice(lowercase),
#             secrets.choice(digits),
#             secrets.choice(special)
#         ]
        
#         # Fill remaining characters using seeded generation
#         all_chars = uppercase + lowercase + digits + special
        
#         # Use seed for deterministic but secure generation
#         import struct
#         if len(seed) >= 8:
#             seed_int = struct.unpack('Q', seed[:8])[0]
#         else:
#             seed_int = int.from_bytes(seed, byteorder='big')
        
#         for i in range(8):  # Total length 12 characters
#             seed_int = (seed_int * 1103515245 + 12345) & 0x7fffffff
#             idx = seed_int % len(all_chars)
#             password_chars.append(all_chars[idx])
        
#         # Shuffle for additional security
#         secrets.SystemRandom().shuffle(password_chars)
        
#         return ''.join(password_chars)


# # ==================== USER MANAGER ====================
# class UserAccountManager(BaseUserManager):
#     """
#     Custom User Manager with clear separation of concerns:
#     - Creates authenticated users (email + password)
#     - Creates client users (phone-based or PPPoE)
#     - Supports both admin dashboard and captive portal registration
#     """
    
#     # ADD THIS METHOD - Required by Djoser
#     def create_user(self, email, password=None, **extra_fields):
#         """
#         Create and save a user with the given email and password.
#         This method is required by Djoser for user registration.
#         """
#         if not email:
#             raise ValueError('Users must have an email address')
        
#         email = self.normalize_email(email)
        
#         # Check for existing email
#         if self.model.objects.filter(email=email).exists():
#             raise ValueError(f"Email {email} already exists")
        
#         # Create user - authenticated users don't have usernames
#         user = self.model(
#             id=uuid.uuid4(),
#             email=email,
#             name=extra_fields.pop('name', email.split('@')[0]),
#             user_type=extra_fields.pop('user_type', 'staff'),
#             is_staff=True,
#             is_active=True,
#             source='admin_dashboard',
#             **extra_fields,
#         )
        
#         user.set_password(password)
#         user.save(using=self._db)
        
#         logger.info(f"Created user via Djoser: {user.email}")
#         return user
    
#     def create_authenticated_user(
#         self, 
#         email: str, 
#         password: str, 
#         name: str = None,
#         **extra_fields
#     ) -> 'UserAccount':
#         """
#         Create authenticated user (admin/staff) for dashboard access
#         Uses email + password authentication (handled by Djoser)
#         """
#         if not email:
#             raise ValueError("Email is required for authenticated users")
        
#         if not password:
#             raise ValueError("Password is required for authenticated users")
        
#         email = self.normalize_email(email)
        
#         # Check for existing email
#         if self.model.objects.filter(email=email).exists():
#             raise ValueError(f"Email {email} already exists")
        
#         # Create user - authenticated users don't have usernames
#         user = self.model(
#             id=uuid.uuid4(),
#             email=email,
#             name=name or email.split('@')[0],
#             user_type=extra_fields.pop('user_type', 'staff'),
#             is_staff=True,
#             is_active=True,
#             source='admin_dashboard',
#             **extra_fields,
#         )
        
#         user.set_password(password)
#         user.save(using=self._db)
        
#         logger.info(f"Created authenticated user: {user.email}")
#         return user
    
#     def create_client_user(
#         self,
#         phone_number: str,
#         client_name: str = None,
#         connection_type: str = "hotspot",
#         source: str = "admin_dashboard",  # 'admin_dashboard' or 'captive_portal'
#         **extra_fields
#     ) -> 'UserAccount':
#         """
#         Create client user (hotspot or PPPoE)
#         Hotspot clients: phone only, no password
#         PPPoE clients: phone + name, with generated credentials
#         Supports both admin dashboard and captive portal registration
#         """
#         # Validate and normalize phone
#         if not PhoneValidation.is_valid_kenyan_phone(phone_number):
#             raise ValueError(f"Invalid phone number: {phone_number}")
        
#         normalized_phone = PhoneValidation.normalize_kenyan_phone(phone_number)
        
#         # Check for existing phone (clients must have unique phones)
#         existing_user = self.model.objects.filter(phone_number=normalized_phone).first()
#         if existing_user:
#             # If user exists and is active, return existing user
#             if existing_user.is_active:
#                 logger.info(f"User with phone {normalized_phone} already exists, returning existing user")
#                 return existing_user
#             else:
#                 # If user exists but is inactive, reactivate
#                 existing_user.is_active = True
#                 existing_user.source = source
#                 existing_user.save()
#                 logger.info(f"Reactivated inactive user: {existing_user.username}")
#                 return existing_user
        
#         # Generate username from phone
#         username = IDGenerator.generate_client_username(normalized_phone)
        
#         # Create user object
#         user = self.model(
#             id=uuid.uuid4(),
#             username=username,
#             name=client_name or "",
#             phone_number=normalized_phone,
#             user_type="client",
#             connection_type=connection_type,
#             is_staff=False,
#             is_superuser=False,
#             is_active=True,
#             source=source,
#             **extra_fields,
#         )
        
#         # Set unusable password (clients don't use password auth)
#         user.set_unusable_password()
#         user.save(using=self._db)
        
#         logger.info(f"Created client user: {username} ({connection_type}) via {source}")
#         return user
    
#     def create_superuser(self, email: str, password: str, **extra_fields):
#         """Create superuser for Django admin"""
#         extra_fields.setdefault('user_type', 'admin')
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('source', 'system')
        
#         return self.create_authenticated_user(
#             email=email,
#             password=password,
#             **extra_fields
#         )


# # ==================== USER MODEL ====================
# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     """
#     Core User Model with clear separation:
#     - Authenticated Users: Email + Password (for Dashboard)
#     - Client Users: Phone-based (Hotspot) or PPPoE credentials
#     - Supports captive portal self-registration
#     """
    
#     # ========== UUID PRIMARY KEY ==========
#     id = models.UUIDField(
#         primary_key=True,
#         default=uuid.uuid4,
#         editable=False,
#         unique=True,
#         help_text="Unique identifier for the user"
#     )
    
#     # User type choices - clear separation
#     USER_TYPES = (
#         ("client", "Client"),        # End users (hotspot/PPPoE)
#         ("staff", "Staff"),          # Dashboard users with limited access
#         ("admin", "Admin"),          # Full dashboard access
#     )
    
#     # Connection type choices for clients only
#     CONNECTION_TYPES = (
#         ("hotspot", "Hotspot"),      # WiFi users (captive portal)
#         ("pppoe", "PPPoE"),  
#         ("admin", "Admin"), 
                
#     )
    
#     # Source of user creation
#     SOURCE_CHOICES = (
#         ("admin_dashboard", "Admin Dashboard"),
#         ("captive_portal", "Captive Portal"),
#         ("api", "API"),
#         ("system", "System"),
#     )
    
#     # ========== IDENTITY FIELDS ==========
#     # Note: Authenticated users don't have usernames, only clients do
#     username = models.CharField(
#         max_length=255, 
#         unique=True, 
#         null=True, 
#         blank=True,
#         db_index=True,
#         help_text="Auto-generated username for client users only"
#     )
    
#     name = models.CharField(
#         max_length=255, 
#         null=True, 
#         blank=True,
#         db_index=True,
#         help_text="Full name (optional for clients, required for PPPoE)"
#     )
    
#     email = models.EmailField(
#         max_length=255, 
#         unique=True, 
#         null=True, 
#         blank=True,
#         db_index=True,
#         help_text="Email address for authenticated users only"
#     )
    
#     phone_number = models.CharField(
#         max_length=20,
#         unique=True, 
#         null=True, 
#         blank=True,
#         db_index=True,
#         help_text="Phone number for client users only (+254 format)"
#     )
    
#     # ========== AUTHENTICATION & TYPE FIELDS ==========
#     user_type = models.CharField(
#         max_length=20, 
#         choices=USER_TYPES, 
#         default="client",
#         db_index=True
#     )
    
#     connection_type = models.CharField(
#         max_length=20, 
#         choices=CONNECTION_TYPES, 
#         default="hotspot",
#         db_index=True,
#         help_text="Connection type for client users only"
#     )
    
#     source = models.CharField(
#         max_length=20,
#         choices=SOURCE_CHOICES,
#         default="admin_dashboard",
#         db_index=True,
#         help_text="Source of user creation"
#     )
    
#     is_active = models.BooleanField(default=True, db_index=True)
#     is_staff = models.BooleanField(default=False)
    
#     # ========== PPPOE FIELDS (for PPPoE clients only) ==========
#     pppoe_username = models.CharField(
#         max_length=50, 
#         unique=True, 
#         null=True, 
#         blank=True,
#         db_index=True,
#         help_text="PPPoE username (auto-generated for PPPoE clients)"
#     )
    
#     pppoe_password = models.TextField(
#         null=True, 
#         blank=True,
#         help_text="Encrypted PPPoE password"
#     )
    
#     pppoe_active = models.BooleanField(default=False, db_index=True)
#     pppoe_credentials_generated = models.BooleanField(default=False, db_index=True)
#     pppoe_credentials_generated_at = models.DateTimeField(null=True, blank=True)
    
#     # ========== TIMESTAMPS ==========
#     date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
#     last_login = models.DateTimeField(null=True, blank=True, db_index=True)
#     last_updated = models.DateTimeField(auto_now=True)
    
#     objects = UserAccountManager()
    
#     # ✅ Authenticated users login with email (handled by Djoser)
#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["name"]  # For createsuperuser command
    
#     class Meta:
#         verbose_name = "User Account"
#         verbose_name_plural = "User Accounts"
#         indexes = [
#             # Optimized for common queries
#             models.Index(fields=['user_type', 'is_active']),
#             models.Index(fields=['email', 'is_active']),
#             models.Index(fields=['phone_number', 'is_active']),
#             models.Index(fields=['pppoe_username', 'pppoe_active']),
#             models.Index(fields=['date_joined']),
#             models.Index(fields=['source']),
            
#             # Partial indexes for better performance
#             models.Index(fields=['user_type'], condition=models.Q(user_type='client'), name='idx_client_users'),
#             models.Index(fields=['connection_type'], condition=models.Q(connection_type='pppoe'), name='idx_pppoe_users'),
#             models.Index(fields=['is_active'], condition=models.Q(is_active=True), name='idx_active_users'),
#             models.Index(fields=['source'], condition=models.Q(source='captive_portal'), name='idx_captive_users'),
#         ]
#         ordering = ['-date_joined']
    
#     def __str__(self) -> str:
#         """String representation based on user type"""
#         if self.user_type == "client":
#             if self.connection_type == "pppoe" and self.pppoe_username:
#                 return f"{self.pppoe_username} ({self.get_phone_display()})"
#             return f"{self.username} ({self.get_phone_display()})"
#         return f"{self.email} ({self.name})"
    
#     # ========== PROPERTIES ==========
#     @property
#     def uuid(self) -> str:
#         """Get UUID as string for API responses"""
#         return str(self.id)
    
#     @property
#     def is_client(self) -> bool:
#         """Check if user is a client (hotspot or PPPoE)"""
#         return self.user_type == 'client'
    
#     @property
#     def is_authenticated_user(self) -> bool:
#         """Check if user is authenticated user (staff/admin)"""
#         return self.user_type in ['staff', 'admin']
    
#     @property
#     def is_pppoe_client(self) -> bool:
#         """Check if user is a PPPoE client"""
#         return self.is_client and self.connection_type == 'pppoe'
    
#     @property
#     def is_hotspot_client(self) -> bool:
#         """Check if user is a hotspot client"""
#         return self.is_client and self.connection_type == 'hotspot'
    
#     @property
#     def is_captive_portal_user(self) -> bool:
#         """Check if user was created via captive portal"""
#         return self.source == 'captive_portal'
    
#     @property
#     def is_admin_created_user(self) -> bool:
#         """Check if user was created by admin"""
#         return self.source == 'admin_dashboard'
    
#     # ========== PHONE METHODS ==========
#     def get_phone_display(self) -> str:
#         """Get phone number in local display format"""
#         return PhoneValidation.get_phone_display(self.phone_number)
    
#     def get_phone_normalized(self) -> str:
#         """Get phone number in normalized +254 format"""
#         return PhoneValidation.normalize_kenyan_phone(self.phone_number)
    
#     # ========== VALIDATION & CLEANING ==========
#     def clean(self):
#         """
#         Validate model before saving
#         Ensures data integrity and clear separation of user types
#         """
#         errors = {}
        
#         # Client validation rules
#         if self.user_type == "client":
#             if not self.phone_number:
#                 errors['phone_number'] = "Phone number is required for clients"
#             elif not PhoneValidation.is_valid_kenyan_phone(self.phone_number):
#                 errors['phone_number'] = "Invalid phone number format"
            
#             # Clients should not have email for authentication
#             if self.email:
#                 errors['email'] = "Clients should not have email addresses"
            
#             # PPPoE-specific validation
#             if self.connection_type == 'pppoe':
#                 if not self.name:
#                     errors['name'] = "Name is required for PPPoE clients"
        
#         # Authenticated user validation rules
#         else:
#             if not self.email:
#                 errors['email'] = "Email is required for authenticated users"
            
#             if self.phone_number:
#                 errors['phone_number'] = "Authenticated users should not have phone numbers"
            
#             if self.connection_type != 'admin':
#                 errors['connection_type'] = "Invalid connection type for authenticated user"
            
#             if self.username:
#                 errors['username'] = "Authenticated users should not have usernames"
        
#         if errors:
#             raise ValidationError(errors)
    
#     # ========== SAVE METHOD ==========
#     def save(self, *args, **kwargs):
#         """
#         Custom save with auto-generation and validation
#         Maintains data integrity across user types
#         """
#         # Generate UUID if not provided
#         if not self.id:
#             self.id = uuid.uuid4()
        
#         # Normalize phone number for clients
#         if self.phone_number:
#             self.phone_number = PhoneValidation.normalize_kenyan_phone(self.phone_number)
        
#         # Auto-generate username for clients
#         if self.is_client and not self.username:
#             self.username = IDGenerator.generate_client_username(self.phone_number)
        
#         # Set staff flags for authenticated users
#         if self.is_authenticated_user:
#             self.is_staff = True
#             self.connection_type = 'admin'
        
#         # Validate and save
#         self.full_clean()
#         super().save(*args, **kwargs)
    
#     # ========== PPPOE METHODS ==========
#     def generate_pppoe_credentials(self) -> Dict[str, str]:
#         """
#         Generate PPPoE credentials for PPPoE clients
#         Returns plaintext credentials for SMS sending (handled by UserManagement app)
#         """
#         if not self.is_pppoe_client:
#             raise ValueError("Only PPPoE clients can generate credentials")
        
#         if not self.name or not self.phone_number:
#             raise ValueError("Name and phone number required for PPPoE credentials")
        
#         # Generate username and password
#         username = IDGenerator.generate_pppoe_username(self.name, self.phone_number)
#         password = IDGenerator.generate_pppoe_password(self.phone_number)
        
#         # Store encrypted password
#         self.pppoe_username = username
#         self.pppoe_password = CredentialEncryption.encrypt(password)
#         self.pppoe_credentials_generated = True
#         self.pppoe_credentials_generated_at = timezone.now()
        
#         self.save(update_fields=[
#             'pppoe_username', 
#             'pppoe_password',
#             'pppoe_credentials_generated',
#             'pppoe_credentials_generated_at',
#             'last_updated'
#         ])
        
#         logger.info(f"Generated PPPoE credentials for {self.username}")
        
#         return {
#             'username': username,
#             'password': password,
#             'phone_number': self.phone_number,
#             'phone_display': self.get_phone_display(),
#             'client_name': self.name
#         }
    
#     def get_pppoe_password_decrypted(self) -> Optional[str]:
#         """
#         Get decrypted PPPoE password
#         Used only by authenticated users to view credentials
#         """
#         if not self.pppoe_password:
#             return None
        
#         try:
#             return CredentialEncryption.decrypt(self.pppoe_password)
#         except Exception as e:
#             logger.error(f"Failed to decrypt PPPoE password for {self.uuid}: {e}")
#             return None
    
#     def verify_pppoe_password(self, password: str) -> bool:
#         """
#         Verify PPPoE password with constant-time comparison
#         Prevents timing attacks on password verification
#         """
#         if not self.pppoe_password:
#             return False
        
#         decrypted = self.get_pppoe_password_decrypted()
#         if not decrypted:
#             return False
        
#         # Use constant-time comparison to prevent timing attacks
#         return constant_time_compare(password, decrypted)
    
#     def update_pppoe_credentials(self, username: str = None, password: str = None) -> Dict[str, Any]:
#         """
#         Update PPPoE credentials (for PPPoE client self-service)
#         Can be called from PPPoE landing page after client login
#         """
#         if not self.is_pppoe_client:
#             raise ValueError("Only PPPoE clients can update credentials")
        
#         updates = {}
        
#         if username:
#             # Validate username format
#             if len(username) < 3 or len(username) > 32:
#                 raise ValueError("Username must be 3-32 characters")
#             if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
#                 raise ValueError("Username can only contain letters, numbers, dots, dashes, and underscores")
            
#             # Check if username is available
#             if UserAccount.objects.filter(pppoe_username=username).exclude(id=self.id).exists():
#                 raise ValueError("PPPoE username already taken")
            
#             self.pppoe_username = username
#             updates['username'] = username
        
#         if password:
#             # Validate password strength
#             if len(password) < 8:
#                 raise ValueError("Password must be at least 8 characters")
            
#             # Encrypt and store new password
#             self.pppoe_password = CredentialEncryption.encrypt(password)
#             updates['password_updated'] = True
        
#         if updates:
#             self.save(update_fields=['pppoe_username', 'pppoe_password', 'last_updated'])
#             logger.info(f"Updated PPPoE credentials for {self.username}")
        
#         return {
#             'success': True,
#             'message': 'PPPoE credentials updated successfully',
#             'updates': updates
#         }
    
#     # ========== SERIALIZATION METHODS ==========
#     def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
#         """
#         Convert user to dictionary for API responses
#         Includes/excludes sensitive data based on context
#         """
#         base_data = {
#             'id': self.uuid,
#             'user_type': self.user_type,
#             'user_type_display': self.get_user_type_display(),
#             'is_active': self.is_active,
#             'source': self.source,
#             'source_display': self.get_source_display(),
#             'date_joined': self.date_joined.isoformat() if self.date_joined else None,
#         }
        
#         if self.is_client:
#             base_data.update({
#                 'username': self.username,
#                 'name': self.name,
#                 'phone_number': self.phone_number,
#                 'phone_number_display': self.get_phone_display(),
#                 'connection_type': self.connection_type,
#                 'connection_type_display': self.get_connection_type_display(),
#                 'is_pppoe_client': self.is_pppoe_client,
#                 'is_hotspot_client': self.is_hotspot_client,
#                 'is_captive_portal_user': self.is_captive_portal_user,
#             })
            
#             if self.is_pppoe_client:
#                 base_data.update({
#                     'pppoe_username': self.pppoe_username,
#                     'pppoe_active': self.pppoe_active,
#                     'pppoe_credentials_generated': self.pppoe_credentials_generated,
#                     'pppoe_credentials_generated_at': self.pppoe_credentials_generated_at.isoformat() if self.pppoe_credentials_generated_at else None,
#                 })
                
#                 # Only include password for authenticated users viewing
#                 if include_sensitive:
#                     base_data['pppoe_password'] = self.get_pppoe_password_decrypted()
#         else:
#             base_data.update({
#                 'email': self.email,
#                 'name': self.name,
#                 'is_staff': self.is_staff,
#                 'is_superuser': self.is_superuser,
#             })
        
#         return base_data
    
#     # ========== CLASS METHODS ==========
#     @classmethod
#     def get_client_by_phone(cls, phone_number: str, active_only: bool = True) -> Optional['UserAccount']:
#         """
#         Get client user by phone number
#         Used by hotspot landing page to find/create clients
#         """
#         normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
        
#         if not normalized:
#             return None
        
#         try:
#             query = cls.objects.filter(
#                 phone_number=normalized,
#                 user_type='client'
#             )
            
#             if active_only:
#                 query = query.filter(is_active=True)
            
#             return query.first()
#         except cls.DoesNotExist:
#             return None
#         except cls.MultipleObjectsReturned:
#             # Handle duplicates by returning first active client
#             query = cls.objects.filter(
#                 phone_number=normalized,
#                 user_type='client'
#             )
            
#             if active_only:
#                 query = query.filter(is_active=True)
            
#             return query.first()
    
#     @classmethod
#     def get_or_create_client_by_phone(
#         cls, 
#         phone_number: str, 
#         connection_type: str = "hotspot",
#         source: str = "captive_portal"
#     ) -> tuple['UserAccount', bool]:
#         """
#         Get existing client by phone or create new one
#         Returns (user, created) tuple
#         """
#         normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
        
#         if not normalized:
#             raise ValueError("Invalid phone number")
        
#         # Try to get existing client
#         user = cls.get_client_by_phone(normalized, active_only=False)
        
#         if user:
#             # If user exists but is inactive, reactivate
#             if not user.is_active:
#                 user.is_active = True
#                 user.source = source
#                 user.save()
#                 logger.info(f"Reactivated inactive user: {user.username}")
#                 return user, False
#             return user, False
        
#         # Create new client
#         try:
#             user = cls.objects.create_client_user(
#                 phone_number=normalized,
#                 connection_type=connection_type,
#                 source=source
#             )
#             return user, True
#         except Exception as e:
#             logger.error(f"Failed to create client user: {e}")
#             raise
    
#     @classmethod
#     def get_pppoe_client_by_username(cls, username: str) -> Optional['UserAccount']:
#         """
#         Get PPPoE client by username for authentication
#         Used by router PPPoE authentication
#         """
#         try:
#             return cls.objects.get(
#                 pppoe_username=username,
#                 user_type='client',
#                 connection_type='pppoe',
#                 is_active=True
#             )
#         except cls.DoesNotExist:
#             return None







"""
AUTHENTICATION APP - Core User Identity Management
Enhanced version with clear separation for Djoser compatibility and client users.

TWO USER TYPES:
1. Authenticated Users (Admins/Staff): Email + Password (Djoser-based, for Dashboard)
2. Client Users: Phone-based (Hotspot) or PPPoE credentials

FIXES IMPLEMENTED:
- Djoser compatibility for email registration
- Clear separation of user types in validation
- Fixed email validation conflicts
- Proper UUID primary key for all users
- Production-ready encryption for PPPoE passwords
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.core.exceptions import ValidationError
from django.core.cache import cache
from django.utils import timezone
from django.utils.crypto import constant_time_compare
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from django.conf import settings
import uuid
import secrets
import string
import base64
from typing import Optional, Dict, Any, Tuple
from datetime import datetime
import logging
import re

logger = logging.getLogger(__name__)

# ==================== ENCRYPTION SERVICE ====================
class CredentialEncryption:
    """
    Service for encrypting sensitive credentials (PPPoE passwords)
    Uses production-grade HKDF for key derivation from Django secret key
    """
    _fernet = None
    
    @classmethod
    def _get_encryption_key(cls) -> bytes:
        """
        Derive encryption key from Django secret key using HKDF
        This ensures secure, deterministic key derivation
        """
        secret_key = settings.SECRET_KEY.encode()
        
        # Use proper HKDF for secure key derivation
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,  # 32 bytes required for Fernet
            salt=b'authentication_encryption_salt',
            info=b'pppoe_credential_encryption',
        )
        
        derived_key = hkdf.derive(secret_key)
        return base64.urlsafe_b64encode(derived_key)
    
    @classmethod
    def get_fernet(cls):
        """Get singleton Fernet instance with lazy initialization"""
        if cls._fernet is None:
            try:
                key = cls._get_encryption_key()
                cls._fernet = Fernet(key)
                logger.debug("Fernet encryption initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Fernet: {e}")
                raise
        return cls._fernet
    
    @classmethod
    def encrypt(cls, data: str) -> str:
        """Encrypt sensitive data (PPPoE passwords)"""
        try:
            if not data:
                return ""
            encrypted = cls.get_fernet().encrypt(data.encode())
            return encrypted.decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise ValueError("Failed to encrypt sensitive data")
    
    @classmethod
    def decrypt(cls, encrypted_data: str) -> str:
        """Decrypt encrypted data with proper error handling"""
        try:
            if not encrypted_data:
                return ""
            return cls.get_fernet().decrypt(encrypted_data.encode()).decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise ValueError("Failed to decrypt data")


# ==================== PHONE VALIDATION UTILITIES ====================
class PhoneValidation:
    """
    Phone number validation and normalization for Kenyan numbers
    Pure validation utility - no business logic
    """
    
    # Compiled regex patterns for Kenyan phone formats
    _PHONE_PATTERNS = [
        re.compile(r'^\+2547\d{8}$'),      # +254712345678 (Safaricom)
        re.compile(r'^\+2541\d{8}$'),      # +254112345678 (Telkom/Airtel)
        re.compile(r'^07\d{8}$'),          # 0712345678 (Safaricom)
        re.compile(r'^01\d{8}$'),          # 0112345678 (Telkom/Airtel)
    ]
    
    @classmethod
    def is_valid_kenyan_phone(cls, phone: str) -> bool:
        """Validate if phone number matches Kenyan formats"""
        if not phone:
            return False
        
        clean_number = re.sub(r'[^\d+]', '', str(phone))
        return any(pattern.match(clean_number) for pattern in cls._PHONE_PATTERNS)
    
    @classmethod
    def normalize_kenyan_phone(cls, phone: str) -> str:
        """Normalize Kenyan phone to +254 international format"""
        if not phone:
            return ""
        
        clean_number = re.sub(r'[^\d+]', '', str(phone))
        
        # Convert to +254 format
        if clean_number.startswith('0') and len(clean_number) == 10:
            # 0712345678 → +254712345678
            return f"+254{clean_number[1:]}"
        elif (clean_number.startswith('7') or clean_number.startswith('1')) and len(clean_number) == 9:
            # 712345678 → +254712345678
            return f"+254{clean_number}"
        elif clean_number.startswith('254') and len(clean_number) == 12:
            # 254712345678 → +254712345678
            return f"+{clean_number}"
        elif clean_number.startswith('+254') and len(clean_number) == 13:
            # Already in correct format
            return clean_number
        
        # Return cleaned version if can't normalize
        return clean_number
    
    @classmethod
    def get_phone_display(cls, phone: str) -> str:
        """Convert +254 format to local display format (0XXXXXXXXX)"""
        normalized = cls.normalize_kenyan_phone(phone)
        
        if normalized.startswith('+254'):
            return f"0{normalized[4:]}"
        
        return normalized


# ==================== ID GENERATOR ====================
class IDGenerator:
    """
    Generates unique identifiers for clients
    Pure generation utility - no business logic
    """
    
    @staticmethod
    def generate_client_username(phone_number: str) -> str:
        """
        Generate unique username for hotspot clients from phone number
        Example: +254712345678 → client_712345678_abc123
        """
        if not phone_number:
            return f"client_{secrets.token_hex(6)}"
        
        # Extract last 8 digits of phone for username
        clean_phone = re.sub(r'[^\d]', '', phone_number)
        phone_part = clean_phone[-8:] if len(clean_phone) >= 8 else clean_phone
        
        # Add random suffix for uniqueness
        random_suffix = secrets.token_hex(3).lower()
        username = f"client_{phone_part}_{random_suffix}"
        
        return username
    
    @staticmethod
    def generate_pppoe_username(client_name: str, phone_number: str) -> str:
        """
        Generate PPPoE username from client name and phone number
        Example: "John Doe", "+254712345678" → johndoe_5678
        """
        # Clean and extract name part
        name_part = re.sub(r'[^a-z]', '', client_name.lower())
        if len(name_part) > 8:
            name_part = name_part[:8]
        
        # Extract last 4 digits of phone
        clean_phone = re.sub(r'[^\d]', '', phone_number)
        phone_part = clean_phone[-4:] if len(clean_phone) >= 4 else clean_phone
        
        # Combine
        username = f"{name_part}_{phone_part}"
        
        # Ensure uniqueness
        from .models import UserAccount
        max_attempts = 5
        for attempt in range(max_attempts):
            if attempt > 0:
                random_suffix = secrets.token_hex(2)
                username = f"{name_part}_{phone_part}_{random_suffix}"
            
            if not UserAccount.objects.filter(pppoe_username=username).exists():
                return username
        
        # Fallback with timestamp
        timestamp = str(int(timezone.now().timestamp()))[-4:]
        return f"{name_part}_{timestamp}"
    
    @staticmethod
    def generate_pppoe_password(phone_number: str) -> str:
        """
        Generate secure PPPoE password using phone number as seed
        Ensures password can be regenerated if needed
        """
        if not phone_number:
            return secrets.token_urlsafe(12)
        
        # Clean phone number for seed
        clean_phone = re.sub(r'[^\d]', '', phone_number)
        
        # Use phone as seed for deterministic generation
        import hashlib
        seed = hashlib.sha256(clean_phone.encode()).digest()
        
        # Define character sets (avoid confusing characters)
        uppercase = string.ascii_uppercase.replace('O', '').replace('I', '')
        lowercase = string.ascii_lowercase.replace('o', '').replace('l', '')
        digits = string.digits.replace('0', '').replace('1', '')
        special = "@#$%&"
        
        # Create password with required character types
        password_chars = [
            secrets.choice(uppercase),
            secrets.choice(lowercase),
            secrets.choice(digits),
            secrets.choice(special)
        ]
        
        # Fill remaining characters using seeded generation
        all_chars = uppercase + lowercase + digits + special
        
        # Use seed for deterministic but secure generation
        import struct
        if len(seed) >= 8:
            seed_int = struct.unpack('Q', seed[:8])[0]
        else:
            seed_int = int.from_bytes(seed, byteorder='big')
        
        for i in range(8):  # Total length 12 characters
            seed_int = (seed_int * 1103515245 + 12345) & 0x7fffffff
            idx = seed_int % len(all_chars)
            password_chars.append(all_chars[idx])
        
        # Shuffle for additional security
        secrets.SystemRandom().shuffle(password_chars)
        
        return ''.join(password_chars)


# ==================== USER MANAGER ====================
class UserAccountManager(BaseUserManager):
    """
    Enhanced User Manager with Djoser compatibility
    Supports both Djoser registration and client creation workflows
    """
    
    def create_user(self, email=None, password=None, **extra_fields):
        """
        Create and save a user with the given email and password.
        This method is REQUIRED by Djoser and Django.
        
        IMPORTANT: This is for AUTHENTICATED users only (dashboard access)
        For client users, use create_client_user() method instead.
        """
        if not email:
            raise ValueError('Authenticated users must have an email address')
        
        email = self.normalize_email(email)
        
        # Check for existing email
        if self.model.objects.filter(email=email).exists():
            raise ValueError(f"Email {email} already exists")
        
        # Set default values for authenticated users
        extra_fields.setdefault('user_type', 'staff')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', False)  # Djoser will activate via email
        extra_fields.setdefault('source', 'djoser_registration')
        
        # Create user - authenticated users don't have usernames
        user = self.model(
            id=uuid.uuid4(),
            email=email,
            name=extra_fields.pop('name', email.split('@')[0]),
            **extra_fields,
        )
        
        user.set_password(password)
        user.save(using=self._db)
        
        logger.info(f"Created authenticated user via Djoser: {user.email}")
        return user
    
    def create_superuser(self, email, password, **extra_fields):
        """Create superuser for Django admin"""
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('source', 'system')
        
        return self.create_user(email, password, **extra_fields)
    
    def create_authenticated_user(
        self, 
        email: str, 
        password: str, 
        name: str = None,
        user_type: str = "staff",
        **extra_fields
    ) -> 'UserAccount':
        """
        Create authenticated user (admin/staff) programmatically
        For manual creation via admin dashboard, not Djoser registration
        """
        if not email:
            raise ValueError("Email is required for authenticated users")
        
        if not password:
            raise ValueError("Password is required for authenticated users")
        
        if user_type not in ['staff', 'admin']:
            raise ValueError("Invalid user type for authenticated user")
        
        email = self.normalize_email(email)
        
        # Check for existing email
        if self.model.objects.filter(email=email).exists():
            raise ValueError(f"Email {email} already exists")
        
        # Create user
        user = self.model(
            id=uuid.uuid4(),
            email=email,
            name=name or email.split('@')[0],
            user_type=user_type,
            is_staff=True,
            is_active=True,
            source='admin_dashboard',
            **extra_fields,
        )
        
        user.set_password(password)
        user.save(using=self._db)
        
        logger.info(f"Created authenticated user: {user.email}")
        return user
    
    def create_client_user(
        self,
        phone_number: str,
        client_name: str = None,
        connection_type: str = "hotspot",
        source: str = "admin_dashboard",  # 'admin_dashboard', 'captive_portal', 'api'
        **extra_fields
    ) -> 'UserAccount':
        """
        Create client user (hotspot or PPPoE)
        Hotspot clients: phone only, no password
        PPPoE clients: phone + name, with generated credentials
        Supports both admin dashboard and captive portal registration
        """
        # Validate and normalize phone
        if not PhoneValidation.is_valid_kenyan_phone(phone_number):
            raise ValueError(f"Invalid phone number: {phone_number}")
        
        normalized_phone = PhoneValidation.normalize_kenyan_phone(phone_number)
        
        # Check for existing phone (clients must have unique phones)
        existing_user = self.model.objects.filter(phone_number=normalized_phone).first()
        if existing_user:
            # If user exists and is active, return existing user
            if existing_user.is_active:
                logger.info(f"User with phone {normalized_phone} already exists, returning existing user")
                return existing_user
            else:
                # If user exists but is inactive, reactivate
                existing_user.is_active = True
                existing_user.source = source
                existing_user.save()
                logger.info(f"Reactivated inactive user: {existing_user.username}")
                return existing_user
        
        # Generate username from phone
        username = IDGenerator.generate_client_username(normalized_phone)
        
        # Create user object
        user = self.model(
            id=uuid.uuid4(),
            username=username,
            name=client_name or "",
            phone_number=normalized_phone,
            user_type="client",
            connection_type=connection_type,
            is_staff=False,
            is_superuser=False,
            is_active=True,
            source=source,
            **extra_fields,
        )
        
        # Set unusable password (clients don't use password auth)
        user.set_unusable_password()
        user.save(using=self._db)
        
        logger.info(f"Created client user: {username} ({connection_type}) via {source}")
        return user


# ==================== USER MODEL ====================
class UserAccount(AbstractBaseUser, PermissionsMixin):
    """
    Enhanced User Model with clear separation:
    - Authenticated Users: Email + Password (Djoser for Dashboard)
    - Client Users: Phone-based (Hotspot) or PPPoE credentials
    
    KEY CHANGES:
    - Fixed Djoser compatibility for authenticated user registration
    - Clear separation of user types with proper validation
    - Email is optional for client users (not used by them)
    - Supports captive portal self-registration
    """
    
    # ========== UUID PRIMARY KEY ==========
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique identifier for the user"
    )
    
    # User type choices - clear separation
    USER_TYPES = (
        ("client", "Client"),        # End users (hotspot/PPPoE)
        ("staff", "Staff"),          # Dashboard users with limited access
        ("admin", "Admin"),          # Full dashboard access
    )
    
    # Connection type choices for clients only
    CONNECTION_TYPES = (
        ("hotspot", "Hotspot"),      # WiFi users (captive portal)
        ("pppoe", "PPPoE"),  
        ("admin", "Admin"),          # Admin/dashboard access
    )
    
    # Source of user creation
    SOURCE_CHOICES = (
        ("djoser_registration", "Djoser Registration"),  # Email signup
        ("admin_dashboard", "Admin Dashboard"),
        ("captive_portal", "Captive Portal"),
        ("api", "API"),
        ("system", "System"),
    )
    
    # ========== IDENTITY FIELDS ==========
    # Note: Authenticated users don't have usernames, only clients do
    username = models.CharField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Auto-generated username for client users only"
    )
    
    name = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Full name (optional for clients, required for PPPoE)"
    )
    
    email = models.EmailField(
        max_length=255, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Email address for authenticated users only (optional for clients)"
    )
    
    phone_number = models.CharField(
        max_length=20,
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="Phone number for client users only (+254 format)"
    )
    
    # ========== AUTHENTICATION & TYPE FIELDS ==========
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPES, 
        default="client",
        db_index=True
    )
    
    connection_type = models.CharField(
        max_length=20, 
        choices=CONNECTION_TYPES, 
        default="hotspot",
        db_index=True,
        help_text="Connection type for client users only"
    )
    
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="djoser_registration",
        db_index=True,
        help_text="Source of user creation"
    )
    
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    
    # ========== PPPOE FIELDS (for PPPoE clients only) ==========
    pppoe_username = models.CharField(
        max_length=50, 
        unique=True, 
        null=True, 
        blank=True,
        db_index=True,
        help_text="PPPoE username (auto-generated for PPPoE clients)"
    )
    
    pppoe_password = models.TextField(
        null=True, 
        blank=True,
        help_text="Encrypted PPPoE password"
    )
    
    pppoe_active = models.BooleanField(default=False, db_index=True)
    pppoe_credentials_generated = models.BooleanField(default=False, db_index=True)
    pppoe_credentials_generated_at = models.DateTimeField(null=True, blank=True)
    
    # ========== TIMESTAMPS ==========
    date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
    last_login = models.DateTimeField(null=True, blank=True, db_index=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    objects = UserAccountManager()
    
    # ✅ Djoser compatibility: Authenticated users login with email
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # For createsuperuser command (email already in USERNAME_FIELD)
    
    class Meta:
        verbose_name = "User Account"
        verbose_name_plural = "User Accounts"
        indexes = [
            # Optimized for common queries
            models.Index(fields=['user_type', 'is_active']),
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['phone_number', 'is_active']),
            models.Index(fields=['pppoe_username', 'pppoe_active']),
            models.Index(fields=['date_joined']),
            models.Index(fields=['source']),
            
            # Partial indexes for better performance
            models.Index(fields=['user_type'], condition=models.Q(user_type='client'), name='idx_client_users'),
            models.Index(fields=['connection_type'], condition=models.Q(connection_type='pppoe'), name='idx_pppoe_users'),
            models.Index(fields=['is_active'], condition=models.Q(is_active=True), name='idx_active_users'),
            models.Index(fields=['source'], condition=models.Q(source='captive_portal'), name='idx_captive_users'),
        ]
        ordering = ['-date_joined']
    
    def __str__(self) -> str:
        """String representation based on user type"""
        if self.user_type == "client":
            if self.connection_type == "pppoe" and self.pppoe_username:
                return f"{self.pppoe_username} ({self.get_phone_display()})"
            return f"{self.username} ({self.get_phone_display()})"
        return f"{self.email} ({self.name})"
    
    # ========== PROPERTIES ==========
    @property
    def uuid(self) -> str:
        """Get UUID as string for API responses"""
        return str(self.id)
    
    @property
    def is_client(self) -> bool:
        """Check if user is a client (hotspot or PPPoE)"""
        return self.user_type == 'client'
    
    @property
    def is_authenticated_user(self) -> bool:
        """Check if user is authenticated user (staff/admin)"""
        return self.user_type in ['staff', 'admin']
    
    @property
    def is_pppoe_client(self) -> bool:
        """Check if user is a PPPoE client"""
        return self.is_client and self.connection_type == 'pppoe'
    
    @property
    def is_hotspot_client(self) -> bool:
        """Check if user is a hotspot client"""
        return self.is_client and self.connection_type == 'hotspot'
    
    @property
    def is_captive_portal_user(self) -> bool:
        """Check if user was created via captive portal"""
        return self.source == 'captive_portal'
    
    @property
    def is_admin_created_user(self) -> bool:
        """Check if user was created by admin"""
        return self.source == 'admin_dashboard'
    
    @property
    def is_djoser_user(self) -> bool:
        """Check if user was created via Djoser registration"""
        return self.source == 'djoser_registration'
    
    # ========== PHONE METHODS ==========
    def get_phone_display(self) -> str:
        """Get phone number in local display format"""
        return PhoneValidation.get_phone_display(self.phone_number)
    
    def get_phone_normalized(self) -> str:
        """Get phone number in normalized +254 format"""
        return PhoneValidation.normalize_kenyan_phone(self.phone_number)
    
    # ========== VALIDATION & CLEANING ==========
    def clean(self):
        """
        Validate model before saving
        Ensures data integrity and clear separation of user types
        """
        errors = {}
        
        # Client validation rules
        if self.user_type == "client":
            if not self.phone_number:
                errors['phone_number'] = "Phone number is required for clients"
            elif not PhoneValidation.is_valid_kenyan_phone(self.phone_number):
                errors['phone_number'] = "Invalid phone number format"
            
            # Clients may have email (for contact purposes) but it's not used for auth
            # So we don't validate email for clients
            
            # PPPoE-specific validation
            if self.connection_type == 'pppoe':
                if not self.name:
                    errors['name'] = "Name is required for PPPoE clients"
        
        # Authenticated user validation rules
        elif self.user_type in ['staff', 'admin']:
            if not self.email:
                errors['email'] = "Email is required for authenticated users"
            
            # Authenticated users should not have phone numbers (for authentication)
            if self.phone_number and self.source == 'djoser_registration':
                # Allow phone for contact info if manually created by admin
                logger.warning(f"Authenticated user {self.email} has phone number")
            
            # Authenticated users use 'admin' connection type
            if self.connection_type != 'admin':
                self.connection_type = 'admin'  # Auto-correct
        
        # Email uniqueness check (only for authenticated users)
        if self.email and self.user_type in ['staff', 'admin']:
            # Check if email exists for another user
            existing = UserAccount.objects.filter(email=self.email).exclude(id=self.id).first()
            if existing:
                if existing.user_type in ['staff', 'admin']:
                    errors['email'] = "Email already registered for an authenticated user"
        
        if errors:
            raise ValidationError(errors)
    
    # ========== SAVE METHOD ==========
    def save(self, *args, **kwargs):
        """
        Custom save with auto-generation and validation
        Maintains data integrity across user types
        """
        # Generate UUID if not provided
        if not self.id:
            self.id = uuid.uuid4()
        
        # Normalize phone number for clients
        if self.phone_number:
            self.phone_number = PhoneValidation.normalize_kenyan_phone(self.phone_number)
        
        # Auto-generate username for clients
        if self.is_client and not self.username:
            self.username = IDGenerator.generate_client_username(self.phone_number)
        
        # Set connection_type for authenticated users
        if self.is_authenticated_user:
            self.connection_type = 'admin'
            # Ensure staff flag is set
            if not self.is_staff:
                self.is_staff = True
        
        # Validate and save
        self.full_clean()
        super().save(*args, **kwargs)
    
    # ========== PPPOE METHODS ==========
    def generate_pppoe_credentials(self) -> Dict[str, str]:
        """
        Generate PPPoE credentials for PPPoE clients
        Returns plaintext credentials for SMS sending (handled by UserManagement app)
        """
        if not self.is_pppoe_client:
            raise ValueError("Only PPPoE clients can generate credentials")
        
        if not self.name or not self.phone_number:
            raise ValueError("Name and phone number required for PPPoE credentials")
        
        # Generate username and password
        username = IDGenerator.generate_pppoe_username(self.name, self.phone_number)
        password = IDGenerator.generate_pppoe_password(self.phone_number)
        
        # Store encrypted password
        self.pppoe_username = username
        self.pppoe_password = CredentialEncryption.encrypt(password)
        self.pppoe_credentials_generated = True
        self.pppoe_credentials_generated_at = timezone.now()
        
        self.save(update_fields=[
            'pppoe_username', 
            'pppoe_password',
            'pppoe_credentials_generated',
            'pppoe_credentials_generated_at',
            'last_updated'
        ])
        
        logger.info(f"Generated PPPoE credentials for {self.username}")
        
        return {
            'username': username,
            'password': password,
            'phone_number': self.phone_number,
            'phone_display': self.get_phone_display(),
            'client_name': self.name
        }
    
    def get_pppoe_password_decrypted(self) -> Optional[str]:
        """
        Get decrypted PPPoE password
        Used only by authenticated users to view credentials
        """
        if not self.pppoe_password:
            return None
        
        try:
            return CredentialEncryption.decrypt(self.pppoe_password)
        except Exception as e:
            logger.error(f"Failed to decrypt PPPoE password for {self.uuid}: {e}")
            return None
    
    def verify_pppoe_password(self, password: str) -> bool:
        """
        Verify PPPoE password with constant-time comparison
        Prevents timing attacks on password verification
        """
        if not self.pppoe_password:
            return False
        
        decrypted = self.get_pppoe_password_decrypted()
        if not decrypted:
            return False
        
        # Use constant-time comparison to prevent timing attacks
        return constant_time_compare(password, decrypted)
    
    def update_pppoe_credentials(self, username: str = None, password: str = None) -> Dict[str, Any]:
        """
        Update PPPoE credentials (for PPPoE client self-service)
        Can be called from PPPoE landing page after client login
        """
        if not self.is_pppoe_client:
            raise ValueError("Only PPPoE clients can update credentials")
        
        updates = {}
        
        if username:
            # Validate username format
            if len(username) < 3 or len(username) > 32:
                raise ValueError("Username must be 3-32 characters")
            if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
                raise ValueError("Username can only contain letters, numbers, dots, dashes, and underscores")
            
            # Check if username is available
            if UserAccount.objects.filter(pppoe_username=username).exclude(id=self.id).exists():
                raise ValueError("PPPoE username already taken")
            
            self.pppoe_username = username
            updates['username'] = username
        
        if password:
            # Validate password strength
            if len(password) < 8:
                raise ValueError("Password must be at least 8 characters")
            
            # Encrypt and store new password
            self.pppoe_password = CredentialEncryption.encrypt(password)
            updates['password_updated'] = True
        
        if updates:
            self.save(update_fields=['pppoe_username', 'pppoe_password', 'last_updated'])
            logger.info(f"Updated PPPoE credentials for {self.username}")
        
        return {
            'success': True,
            'message': 'PPPoE credentials updated successfully',
            'updates': updates
        }
    
    # ========== SERIALIZATION METHODS ==========
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """
        Convert user to dictionary for API responses
        Includes/excludes sensitive data based on context
        """
        base_data = {
            'id': self.uuid,
            'user_type': self.user_type,
            'user_type_display': self.get_user_type_display(),
            'is_active': self.is_active,
            'source': self.source,
            'source_display': self.get_source_display(),
            'date_joined': self.date_joined.isoformat() if self.date_joined else None,
        }
        
        if self.is_client:
            base_data.update({
                'username': self.username,
                'name': self.name,
                'phone_number': self.phone_number,
                'phone_number_display': self.get_phone_display(),
                'connection_type': self.connection_type,
                'connection_type_display': self.get_connection_type_display(),
                'is_pppoe_client': self.is_pppoe_client,
                'is_hotspot_client': self.is_hotspot_client,
                'is_captive_portal_user': self.is_captive_portal_user,
            })
            
            if self.is_pppoe_client:
                base_data.update({
                    'pppoe_username': self.pppoe_username,
                    'pppoe_active': self.pppoe_active,
                    'pppoe_credentials_generated': self.pppoe_credentials_generated,
                    'pppoe_credentials_generated_at': self.pppoe_credentials_generated_at.isoformat() if self.pppoe_credentials_generated_at else None,
                })
                
                # Only include password for authenticated users viewing
                if include_sensitive:
                    base_data['pppoe_password'] = self.get_pppoe_password_decrypted()
        else:
            base_data.update({
                'email': self.email,
                'name': self.name,
                'is_staff': self.is_staff,
                'is_superuser': self.is_superuser,
                'is_djoser_user': self.is_djoser_user,
            })
        
        return base_data
    
    # ========== CLASS METHODS ==========
    @classmethod
    def get_client_by_phone(cls, phone_number: str, active_only: bool = True) -> Optional['UserAccount']:
        """
        Get client user by phone number
        Used by hotspot landing page to find/create clients
        """
        normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
        
        if not normalized:
            return None
        
        try:
            query = cls.objects.filter(
                phone_number=normalized,
                user_type='client'
            )
            
            if active_only:
                query = query.filter(is_active=True)
            
            return query.first()
        except cls.DoesNotExist:
            return None
        except cls.MultipleObjectsReturned:
            # Handle duplicates by returning first active client
            query = cls.objects.filter(
                phone_number=normalized,
                user_type='client'
            )
            
            if active_only:
                query = query.filter(is_active=True)
            
            return query.first()
    
    @classmethod
    def get_or_create_client_by_phone(
        cls, 
        phone_number: str, 
        connection_type: str = "hotspot",
        source: str = "captive_portal"
    ) -> tuple['UserAccount', bool]:
        """
        Get existing client by phone or create new one
        Returns (user, created) tuple
        """
        normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
        
        if not normalized:
            raise ValueError("Invalid phone number")
        
        # Try to get existing client
        user = cls.get_client_by_phone(normalized, active_only=False)
        
        if user:
            # If user exists but is inactive, reactivate
            if not user.is_active:
                user.is_active = True
                user.source = source
                user.save()
                logger.info(f"Reactivated inactive user: {user.username}")
                return user, False
            return user, False
        
        # Create new client
        try:
            user = cls.objects.create_client_user(
                phone_number=normalized,
                connection_type=connection_type,
                source=source
            )
            return user, True
        except Exception as e:
            logger.error(f"Failed to create client user: {e}")
            raise
    
    @classmethod
    def get_pppoe_client_by_username(cls, username: str) -> Optional['UserAccount']:
        """
        Get PPPoE client by username for authentication
        Used by router PPPoE authentication
        """
        try:
            return cls.objects.get(
                pppoe_username=username,
                user_type='client',
                connection_type='pppoe',
                is_active=True
            )
        except cls.DoesNotExist:
            return None