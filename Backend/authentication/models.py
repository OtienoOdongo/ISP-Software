
# """
# AUTHENTICATION APP - Optimized Production Version
# Core identity and access management with enhanced security and efficiency
# """

# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
# from django.db import models
# from django.core.exceptions import ValidationError
# from django.core.cache import cache
# from django.utils import timezone
# from cryptography.fernet import Fernet
# from django.conf import settings
# import uuid
# import secrets
# import string
# import base64
# from typing import Optional, Dict, Any, Set, Tuple, List
# from datetime import datetime, timedelta
# import logging
# import re

# logger = logging.getLogger(__name__)

# # ==================== ENCRYPTION SERVICE ====================
# class CredentialEncryption:
#     """Service for encrypting sensitive credentials with improved security"""
#     _fernet = None
    
#     @classmethod
#     def _get_encryption_key(cls) -> bytes:
#         """Derive encryption key from Django secret key"""
#         # Use HKDF (HMAC-based Key Derivation Function) for better key derivation
#         import hashlib
#         import hmac
        
#         secret_key = settings.SECRET_KEY.encode()
#         # Create a deterministic but secure key
#         salt = b'authentication_service_salt'
#         info = b'pppoe_credential_encryption'
        
#         # HKDF-like key derivation
#         prk = hmac.new(salt, secret_key, hashlib.sha256).digest()
#         key = b''
#         key_block = b''
#         block_index = 1
        
#         while len(key) < 32:
#             key_block = hmac.new(prk, key_block + info + bytes([block_index]), hashlib.sha256).digest()
#             key += key_block
#             block_index += 1
        
#         return base64.urlsafe_b64encode(key[:32])
    
#     @classmethod
#     def get_fernet(cls):
#         """Get singleton Fernet instance with lazy initialization"""
#         if cls._fernet is None:
#             try:
#                 key = cls._get_encryption_key()
#                 cls._fernet = Fernet(key)
#                 logger.info("Fernet encryption initialized successfully")
#             except Exception as e:
#                 logger.error(f"Failed to initialize Fernet encryption: {e}")
#                 raise
#         return cls._fernet
    
#     @classmethod
#     def encrypt(cls, data: str) -> str:
#         """Encrypt sensitive data with timestamp for rotation"""
#         try:
#             if not data:
#                 return ""
#             encrypted = cls.get_fernet().encrypt(data.encode())
#             return encrypted.decode()
#         except Exception as e:
#             logger.error(f"Encryption failed: {e}")
#             raise ValueError(f"Failed to encrypt data: {e}")
    
#     @classmethod
#     def decrypt(cls, encrypted_data: str) -> str:
#         """Decrypt encrypted data with error handling"""
#         try:
#             if not encrypted_data:
#                 return ""
#             return cls.get_fernet().decrypt(encrypted_data.encode()).decode()
#         except Exception as e:
#             logger.error(f"Decryption failed: {e}")
#             raise ValueError(f"Failed to decrypt data: {e}")


# # ==================== CACHE MANAGER ====================
# class UserCacheManager:
#     """
#     Enhanced cache management with Redis
#     Uses LRU caching pattern with TTL and cache invalidation
#     """
#     _CACHE_PREFIX = "user_auth_"
#     _CACHE_TIMEOUT = 300  # 5 minutes
#     _BULK_CACHE_THRESHOLD = 100  # Threshold for bulk operations
    
#     @classmethod
#     def get_cache_key(cls, identifier: str, data_type: str = "user") -> str:
#         """Generate cache key with namespace"""
#         return f"{cls._CACHE_PREFIX}{data_type}_{identifier}"
    
#     @classmethod
#     def get_user(cls, identifier: str) -> Optional['UserAccount']:
#         """
#         Get user from cache using multiple lookup strategies
#         Returns cached user or None if not found
#         """
#         cache_key = cls.get_cache_key(identifier)
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             logger.debug(f"Cache hit for user: {identifier}")
            
#             # Check if data is still valid (not expired)
#             if isinstance(cached_data, dict) and 'expires_at' in cached_data:
#                 expires_at = datetime.fromisoformat(cached_data['expires_at'])
#                 if timezone.now() > expires_at:
#                     cache.delete(cache_key)
#                     return None
                
#                 # Extract user data from cached structure
#                 user_data = cached_data.get('user_data')
#                 if user_data:
#                     # Reconstruct user object from cache
#                     from .models import UserAccount
#                     user = UserAccount()
#                     for key, value in user_data.items():
#                         setattr(user, key, value)
#                     return user
            
#         return None
    
#     @classmethod
#     def set_user(cls, user: 'UserAccount', identifier: str = None):
#         """Store user in cache with optimized structure"""
#         if identifier is None:
#             identifier = user.uuid
        
#         # Create cache-friendly data structure
#         user_data = {
#             'id': str(user.id),
#             'uuid': user.uuid,
#             'username': user.username,
#             'email': user.email,
#             'phone_number': user.phone_number,
#             'user_type': user.user_type,
#             'connection_type': user.connection_type,
#             'is_active': user.is_active,
#             'is_staff': user.is_staff,
#             'is_superuser': user.is_superuser,
#             'pppoe_username': user.pppoe_username,
#             'date_joined': user.date_joined.isoformat() if user.date_joined else None,
#             'last_login': user.last_login.isoformat() if user.last_login else None,
#         }
        
#         cache_data = {
#             'user_data': user_data,
#             'expires_at': (timezone.now() + timedelta(seconds=cls._CACHE_TIMEOUT)).isoformat(),
#             'cached_at': timezone.now().isoformat()
#         }
        
#         cache_key = cls.get_cache_key(identifier)
#         cache.set(cache_key, cache_data, cls._CACHE_TIMEOUT)
        
#         # Also cache by other identifiers for faster lookups
#         if user.email:
#             email_key = cls.get_cache_key(user.email)
#             cache.set(email_key, cache_data, cls._CACHE_TIMEOUT)
        
#         if user.phone_number:
#             phone_key = cls.get_cache_key(user.phone_number)
#             cache.set(phone_key, cache_data, cls._CACHE_TIMEOUT)
        
#         logger.debug(f"Cached user with UUID: {user.uuid}")
    
#     @classmethod
#     def invalidate_user(cls, identifier: str):
#         """Remove user from cache using pattern matching"""
#         # Invalidate all cache entries for this user
#         patterns = [
#             cls.get_cache_key(identifier),
#             cls.get_cache_key(f"*{identifier}*"),
#         ]
        
#         for pattern in patterns:
#             keys = cache.keys(pattern)
#             if keys:
#                 cache.delete_many(keys)
#                 logger.debug(f"Invalidated {len(keys)} cache entries for: {identifier}")
    
#     @classmethod
#     def bulk_invalidate(cls, identifiers: list):
#         """Remove multiple users from cache efficiently"""
#         if len(identifiers) > cls._BULK_CACHE_THRESHOLD:
#             # For large batches, clear entire user cache
#             keys = cache.keys(f"{cls._CACHE_PREFIX}user_*")
#             if keys:
#                 cache.delete_many(keys)
#                 logger.info(f"Cleared entire user cache for bulk operation")
#         else:
#             # For small batches, invalidate individual users
#             for identifier in identifiers:
#                 if identifier:
#                     cls.invalidate_user(identifier)


# # ==================== ID GENERATOR ====================
# class IDGenerator:
#     """
#     Generates unique identifiers with improved collision resistance
#     Uses deterministic algorithms for better performance
#     """
    
#     @staticmethod
#     def generate_client_username(prefix: str = "client_", length: int = 8) -> str:
#         """
#         Generate unique username for clients
#         Uses hex format for better readability and uniqueness
#         """
#         max_attempts = 5
        
#         for attempt in range(max_attempts):
#             # Use combination of timestamp and random data for uniqueness
#             timestamp = int(timezone.now().timestamp() * 1000)
#             random_bytes = secrets.token_bytes(length // 2)
            
#             # Create deterministic hash
#             import hashlib
#             combined = f"{timestamp}{random_bytes.hex()}".encode()
#             unique_part = hashlib.sha256(combined).hexdigest()[:length].lower()
            
#             username = f"{prefix}{unique_part}"
            
#             # Check if username exists in database
#             from .models import UserAccount
#             if not UserAccount.objects.filter(username=username).exists():
#                 return username
        
#         # Fallback to UUID if no unique username found
#         return f"{prefix}{uuid.uuid4().hex[:length].lower()}"
    
#     @staticmethod
#     def generate_admin_username(email: str) -> str:
#         """
#         Generate admin username from email
#         Example: admin@example.com -> admin_example
#         """
#         if not email:
#             return IDGenerator.generate_client_username(prefix="admin_", length=6)
        
#         # Extract username part from email
#         username_part = email.split('@')[0].lower()
#         # Clean the username
#         username_part = re.sub(r'[^a-z0-9]', '_', username_part)
#         username = f"admin_{username_part}"
        
#         # Ensure uniqueness
#         max_attempts = 5
#         for attempt in range(max_attempts):
#             if attempt > 0:
#                 unique_username = f"{username}_{secrets.token_hex(2)}"
#             else:
#                 unique_username = username
            
#             from .models import UserAccount
#             if not UserAccount.objects.filter(username=unique_username).exists():
#                 return unique_username
        
#         # Fallback to random username
#         return f"admin_{secrets.token_hex(4)}"
    
#     @staticmethod
#     def generate_pppoe_username(client_name: str = None, phone_number: str = None) -> str:
#         """
#         Generate PPPoE username using client name or phone number
#         Ensures uniqueness while maintaining readability
#         """
#         base_name = "pppoe"
        
#         if client_name:
#             # Use client name for personalization
#             # Clean and normalize name
#             clean_name = re.sub(r'[^a-zA-Z0-9]', '', client_name.lower())
#             if len(clean_name) > 6:
#                 base_name = clean_name[:6]
        
#         max_attempts = 5
        
#         for attempt in range(max_attempts):
#             if phone_number:
#                 # Use last 4 digits of phone for uniqueness
#                 phone_part = re.sub(r'[^\d]', '', phone_number)[-4:]
#                 username = f"{base_name}{phone_part}"
#             else:
#                 # Generate random suffix
#                 random_part = secrets.token_hex(2)
#                 username = f"{base_name}{random_part}"
            
#             # Check uniqueness
#             from .models import UserAccount
#             if not UserAccount.objects.filter(pppoe_username=username).exists():
#                 return username
        
#         # Fallback with timestamp
#         timestamp = int(timezone.now().timestamp() % 10000)
#         return f"{base_name}{timestamp}"
    
#     @staticmethod
#     def generate_pppoe_password(phone_number: str = None, length: int = 12) -> str:
#         """
#         Generate secure PPPoE password using phone number for determinism
#         Ensures security while allowing recovery if needed
#         """
#         # Define character sets with better distribution
#         uppercase = string.ascii_uppercase.replace('O', '').replace('I', '')
#         lowercase = string.ascii_lowercase.replace('o', '').replace('i', '').replace('l', '')
#         digits = string.digits.replace('0', '').replace('1', '')
#         special = "@#$%&"
        
#         # Ensure at least one character from each set
#         password_chars = [
#             secrets.choice(uppercase),
#             secrets.choice(lowercase),
#             secrets.choice(digits),
#             secrets.choice(special)
#         ]
        
#         # Create seed from phone number if available
#         seed_str = phone_number or secrets.token_hex(8)
#         import hashlib
#         seed = hashlib.sha256(seed_str.encode()).digest()
#         random_generator = secrets.SystemRandom(seed)
        
#         # Fill remaining characters
#         all_chars = uppercase + lowercase + digits + special
#         for _ in range(length - 4):
#             password_chars.append(random_generator.choice(all_chars))
        
#         # Shuffle using seeded random for reproducibility
#         random_generator.shuffle(password_chars)
        
#         return ''.join(password_chars)
    
#     @staticmethod
#     def generate_phone_based_password(phone_number: str) -> str:
#         """
#         Generate password based on phone number for easier client recall
#         Uses deterministic algorithm for recovery
#         """
#         if not phone_number:
#             return IDGenerator.generate_pppoe_password()
        
#         # Normalize phone number
#         clean_phone = re.sub(r'[^\d]', '', phone_number)
        
#         # Use last 8 digits for password generation
#         phone_digits = clean_phone[-8:]
        
#         # Map digits to characters for readability
#         char_map = {
#             '0': 'a', '1': 'b', '2': 'c', '3': 'd', '4': 'e',
#             '5': 'f', '6': 'g', '7': 'h', '8': 'i', '9': 'j'
#         }
        
#         # Convert digits to characters
#         base_password = ''.join(char_map.get(d, d) for d in phone_digits)
        
#         # Add uppercase and special characters
#         password = base_password[:4].upper() + base_password[4:6] + "@" + base_password[6:]
        
#         return password
    
#     @staticmethod
#     def generate_admin_pppoe_username(email: str) -> str:
#         """Generate PPPoE username for admin based on email"""
#         if not email:
#             return f"admin_{secrets.token_hex(4)}"
        
#         # Extract username from email
#         username_part = email.split('@')[0].lower()
#         # Clean and shorten
#         username_part = re.sub(r'[^a-z0-9]', '', username_part)
#         if len(username_part) > 8:
#             username_part = username_part[:8]
        
#         return f"admin_{username_part}"


# # ==================== PHONE VALIDATION UTILITIES ====================
# class PhoneValidation:
#     """
#     Enhanced phone validation for Kenyan numbers
#     Supports both Safaricom (07) and Telkom/Airtel (01) formats
#     """
    
#     # Compiled regex patterns for better performance
#     _PHONE_PATTERNS = [
#         re.compile(r'^\+2547\d{8}$'),      # +254712345678 (Safaricom)
#         re.compile(r'^\+2541\d{8}$'),      # +254112345678 (Telkom/Airtel)
#         re.compile(r'^2547\d{8}$'),        # 254712345678
#         re.compile(r'^2541\d{8}$'),        # 254112345678
#         re.compile(r'^07\d{8}$'),          # 0712345678 (Safaricom)
#         re.compile(r'^01\d{8}$'),          # 0112345678 (Telkom/Airtel)
#         re.compile(r'^7\d{8}$'),           # 712345678
#         re.compile(r'^1\d{8}$'),           # 112345678
#     ]
    
#     # Operator prefixes for validation
#     _OPERATOR_PREFIXES = {
#         'safaricom': ['+2547', '2547', '07', '7'],
#         'telkom_airtel': ['+2541', '2541', '01', '1'],
#     }
    
#     @classmethod
#     def is_valid_kenyan_phone(cls, phone: str) -> bool:
#         """Validate Kenyan phone number with caching for performance"""
#         if not phone:
#             return False
        
#         # Cache validation results for frequently checked numbers
#         cache_key = f"phone_valid_{hash(phone)}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result is not None:
#             return cached_result
        
#         # Clean the number
#         clean_number = re.sub(r'[^\d+]', '', str(phone))
        
#         # Check against patterns
#         is_valid = any(pattern.match(clean_number) for pattern in cls._PHONE_PATTERNS)
        
#         # Cache result for 5 minutes
#         cache.set(cache_key, is_valid, 300)
        
#         return is_valid
    
#     @classmethod
#     def normalize_kenyan_phone(cls, phone: str) -> str:
#         """Normalize Kenyan phone to +254 format with improved error handling"""
#         if not phone:
#             return ""
        
#         # Remove all non-digit characters except +
#         clean_number = re.sub(r'[^\d+]', '', str(phone))
        
#         # Cache normalized results
#         cache_key = f"phone_norm_{hash(phone)}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result:
#             return cached_result
        
#         normalized = cls._normalize_phone_logic(clean_number)
        
#         # Cache for 1 hour (phone numbers don't change frequently)
#         cache.set(cache_key, normalized, 3600)
        
#         return normalized
    
#     @staticmethod
#     def _normalize_phone_logic(clean_number: str) -> str:
#         """Core phone normalization logic"""
#         # Convert to +254 format
#         if clean_number.startswith('0') and len(clean_number) == 10:
#             # 0712345678 → +254712345678
#             # 0112345678 → +254112345678
#             return f"+254{clean_number[1:]}"
#         elif (clean_number.startswith('7') or clean_number.startswith('1')) and len(clean_number) == 9:
#             # 712345678 → +254712345678
#             # 112345678 → +254112345678
#             return f"+254{clean_number}"
#         elif clean_number.startswith('254') and len(clean_number) == 12:
#             # 254712345678 → +254712345678
#             # 254112345678 → +254112345678
#             return f"+{clean_number}"
#         elif clean_number.startswith('+254') and len(clean_number) == 13:
#             # Already in correct format
#             return clean_number
        
#         # Return original if can't normalize
#         return clean_number
    
#     @classmethod
#     def get_phone_display(cls, phone: str) -> str:
#         """Get display format for Kenyan phone with caching"""
#         normalized = cls.normalize_kenyan_phone(phone)
        
#         # Cache display format
#         cache_key = f"phone_display_{hash(normalized)}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result:
#             return cached_result
        
#         display_format = cls._get_display_format(normalized)
        
#         # Cache for 1 hour
#         cache.set(cache_key, display_format, 3600)
        
#         return display_format
    
#     @staticmethod
#     def _get_display_format(normalized: str) -> str:
#         """Get display format for normalized phone"""
#         if normalized.startswith('+2547'):
#             return f"0{normalized[4:]}"
#         elif normalized.startswith('+2541'):
#             return f"0{normalized[4:]}"
#         elif normalized.startswith('+254'):
#             return f"0{normalized[4:]}"
        
#         return normalized
    
#     @classmethod
#     def get_operator(cls, phone: str) -> str:
#         """Get mobile operator for Kenyan phone number"""
#         normalized = cls.normalize_kenyan_phone(phone)
        
#         if normalized.startswith('+2547'):
#             return 'safaricom'
#         elif normalized.startswith('+2541'):
#             return 'telkom_airtel'
        
#         return 'unknown'


# # ==================== USER MANAGER ====================
# class UserAccountManager(BaseUserManager):
#     """
#     Enhanced User Manager with optimized queries and caching
#     Supports email-based authentication for admins
#     """
    
#     def _validate_phone_format(self, phone_number: str) -> bool:
#         """Validate phone number format with caching"""
#         return PhoneValidation.is_valid_kenyan_phone(phone_number)
    
#     def normalize_phone(self, phone_number: str) -> str:
#         """Normalize phone number with caching"""
#         return PhoneValidation.normalize_kenyan_phone(phone_number)
    
#     def get_phone_display(self, phone_number: str) -> str:
#         """Get display format for phone with caching"""
#         return PhoneValidation.get_phone_display(phone_number)
    
#     def find_or_create_client(
#         self, 
#         phone_number: str, 
#         connection_type: str = "hotspot",
#         client_name: str = None
#     ) -> Tuple['UserAccount', bool]:
#         """
#         Find existing client or create new one with optimized queries
#         Uses caching and atomic transactions
#         """
#         normalized_phone = self.normalize_phone(phone_number)
        
#         if not self._validate_phone_format(phone_number):
#             raise ValueError(f"Invalid phone number format: {phone_number}. Must be 07XXXXXXXX or 01XXXXXXXX")
        
#         # Try cache first
#         cache_key = f"client_by_phone_{normalized_phone}"
#         cached_user = cache.get(cache_key)
        
#         if cached_user:
#             logger.info(f"Cache hit for client with phone: {normalized_phone}")
#             return cached_user, False
        
#         # Try to find existing client in database
#         try:
#             user = UserAccount.objects.only(
#                 'id', 'username', 'phone_number', 'user_type', 
#                 'connection_type', 'pppoe_username'
#             ).get(
#                 phone_number=normalized_phone,
#                 user_type="client"
#             )
            
#             # Update cache
#             cache.set(cache_key, user, 300)
#             logger.info(f"Found existing client: {user.username}")
#             return user, False
            
#         except UserAccount.DoesNotExist:
#             # Create new client
#             logger.info(f"Creating new client with phone: {normalized_phone}")
            
#             try:
#                 if connection_type == "hotspot":
#                     user = self.create_hotspot_client(
#                         phone_number=normalized_phone,
#                         client_name=client_name
#                     )
#                 elif connection_type == "pppoe":
#                     user = self.create_pppoe_client(
#                         phone_number=normalized_phone,
#                         client_name=client_name
#                     )
#                 else:
#                     raise ValueError(f"Invalid connection type: {connection_type}")
                
#                 # Update cache
#                 cache.set(cache_key, user, 300)
                
#                 return user, True
                
#             except Exception as e:
#                 logger.error(f"Failed to create client: {e}")
#                 raise
                
#         except UserAccount.MultipleObjectsReturned:
#             # Handle rare case of duplicates
#             user = UserAccount.objects.filter(
#                 phone_number=normalized_phone,
#                 user_type="client"
#             ).first()
            
#             logger.warning(f"Multiple clients found for {normalized_phone}, using first")
            
#             # Update cache
#             cache.set(cache_key, user, 300)
            
#             return user, False
    
#     def create_user(
#         self, 
#         name: Optional[str] = None, 
#         email: Optional[str] = None, 
#         phone_number: Optional[str] = None, 
#         password: Optional[str] = None, 
#         user_type: str = "admin", 
#         connection_type: str = "admin",
#         client_name: str = None,
#         **extra_fields
#     ) -> 'UserAccount':
#         """
#         Create any type of user with optimized validation and caching
#         """
#         logger.info(f"Creating user: type={user_type}, connection={connection_type}")
        
#         # Validate based on user type
#         if user_type == "client":
#             return self._create_client_user(
#                 phone_number=phone_number,
#                 client_name=client_name,
#                 connection_type=connection_type,
#                 **extra_fields
#             )
#         else:
#             return self._create_admin_user(
#                 name=name,
#                 email=email,
#                 password=password,
#                 user_type=user_type,
#                 connection_type=connection_type,
#                 **extra_fields
#             )
    
#     def _create_client_user(
#         self, 
#         phone_number: str, 
#         client_name: str = None,
#         connection_type: str = "hotspot",
#         **extra_fields
#     ) -> 'UserAccount':
#         """Create a client user with optimized field generation"""
#         # Normalize phone number
#         normalized_phone = self.normalize_phone(phone_number)
        
#         if not normalized_phone:
#             raise ValueError("Phone number is required for client users")
        
#         # Validate phone format
#         if not self._validate_phone_format(phone_number):
#             raise ValueError(f"Invalid phone number format: {phone_number}. Must be 07XXXXXXXX or 01XXXXXXXX")
        
#         # Check if phone already exists (cached check)
#         cache_key = f"phone_exists_{normalized_phone}"
#         phone_exists = cache.get(cache_key)
        
#         if phone_exists is None:
#             phone_exists = UserAccount.objects.filter(phone_number=normalized_phone).exists()
#             cache.set(cache_key, phone_exists, 300)
        
#         if phone_exists:
#             raise ValueError(f"Phone number {normalized_phone} already exists")
        
#         # Generate unique identifiers
#         username = IDGenerator.generate_client_username()
        
#         # Create user object with UUID
#         user = self.model(
#             id=uuid.uuid4(),
#             username=username,
#             phone_number=normalized_phone,
#             user_type="client",
#             connection_type=connection_type,
#             is_staff=False,
#             is_superuser=False,
#             **extra_fields,
#         )
        
#         # Set unusable password (clients authenticate via phone/PPPoE)
#         user.set_unusable_password()
#         user.save(using=self._db)
        
#         # Generate PPPoE credentials if needed
#         if connection_type == "pppoe":
#             self._setup_pppoe_credentials(user, client_name, normalized_phone)
        
#         logger.info(f"Created client user: {user.username}")
        
#         # Invalidate relevant caches
#         cache.delete(f"phone_exists_{normalized_phone}")
        
#         return user
    
#     def _create_admin_user(
#         self,
#         name: str,
#         email: str,
#         password: str,
#         user_type: str = "admin",
#         connection_type: str = "admin",
#         **extra_fields
#     ) -> 'UserAccount':
#         """Create an admin user with enhanced validation"""
#         if not email:
#             raise ValueError("Email is required for admin users")
        
#         if not password:
#             raise ValueError("Password is required for admin users")
        
#         email = self.normalize_email(email)
        
#         # Check if email already exists (cached check)
#         cache_key = f"email_exists_{email}"
#         email_exists = cache.get(cache_key)
        
#         if email_exists is None:
#             email_exists = UserAccount.objects.filter(email=email).exists()
#             cache.set(cache_key, email_exists, 300)
        
#         if email_exists:
#             raise ValueError(f"Email {email} already exists")
        
#         # Generate username from email for admin
#         username = IDGenerator.generate_admin_username(email)
        
#         # Create user object with UUID
#         user = self.model(
#             id=uuid.uuid4(),
#             username=username,
#             name=name,
#             email=email,
#             user_type=user_type,
#             connection_type=connection_type,
#             is_staff=user_type in ["admin", "superadmin"],
#             is_superuser=user_type == "superadmin",
#             **extra_fields,
#         )
        
#         user.set_password(password)
#         user.save(using=self._db)
        
#         logger.info(f"Created admin user: {name} ({email}) with username: {username}")
        
#         # Invalidate relevant caches
#         cache.delete(f"email_exists_{email}")
        
#         return user
    
#     def _setup_pppoe_credentials(self, user: 'UserAccount', client_name: str = None, phone_number: str = None):
#         """Setup PPPoE credentials for a user"""
#         if not user.pppoe_username:
#             user.pppoe_username = IDGenerator.generate_pppoe_username(client_name, phone_number)
        
#         if not user.pppoe_password:
#             plain_password = IDGenerator.generate_phone_based_password(phone_number)
#             user.pppoe_password = CredentialEncryption.encrypt(plain_password)
        
#         user.save(update_fields=['pppoe_username', 'pppoe_password'])
        
#         # TODO: Trigger SMS sending via SMS automation service
#         logger.info(f"PPPoE credentials generated for user: {user.username}")
    
#     def create_superuser(self, email: str, password: str, **extra_fields):
#         """Create superuser (for Django admin) - Uses email for authentication"""
#         extra_fields.setdefault('user_type', 'superadmin')
#         extra_fields.setdefault('connection_type', 'admin')
#         extra_fields.setdefault('name', 'Super Admin')
        
#         return self.create_user(
#             name=extra_fields.pop('name', 'Super Admin'),
#             email=email,
#             password=password,
#             **extra_fields
#         )
    
#     def create_hotspot_client(self, phone_number: str, client_name: str = None, **extra_fields) -> 'UserAccount':
#         """Create hotspot client (public API) - No password"""
#         return self.create_user(
#             phone_number=phone_number,
#             client_name=client_name,
#             user_type="client",
#             connection_type="hotspot",
#             **extra_fields
#         )
    
#     def create_pppoe_client(self, phone_number: str, client_name: str = None, **extra_fields) -> 'UserAccount':
#         """Create PPPoE client (public API) - With generated credentials"""
#         return self.create_user(
#             phone_number=phone_number,
#             client_name=client_name,
#             user_type="client",
#             connection_type="pppoe",
#             **extra_fields
#         )
    
#     def create_admin_manually(
#         self,
#         name: str,
#         email: str,
#         password: str,
#         user_type: str = "admin",
#         **extra_fields
#     ) -> 'UserAccount':
#         """Create admin user manually (for system setup)"""
#         return self.create_user(
#             name=name,
#             email=email,
#             password=password,
#             user_type=user_type,
#             connection_type="admin",
#             **extra_fields
#         )
    
#     def create_pppoe_user_manually(
#         self,
#         phone_number: str,
#         client_name: str,
#         pppoe_username: str = None,
#         **extra_fields
#     ) -> 'UserAccount':
#         """
#         Manual PPPoE user creation by admin
#         Generates credentials and sends SMS
#         """
#         # Create the user
#         user = self.create_pppoe_client(
#             phone_number=phone_number,
#             client_name=client_name,
#             **extra_fields
#         )
        
#         # If custom username provided, update it
#         if pppoe_username:
#             if UserAccount.objects.filter(pppoe_username=pppoe_username).exists():
#                 raise ValueError(f"PPPoE username {pppoe_username} already exists")
            
#             user.pppoe_username = pppoe_username
#             user.save(update_fields=['pppoe_username'])
        
#         # Get decrypted password for SMS
#         decrypted_password = user.get_pppoe_password_decrypted()
        
#         # TODO: Trigger SMS sending with credentials
#         logger.info(f"Manual PPPoE user created: {user.username}")
#         logger.info(f"Credentials - Username: {user.pppoe_username}, Password: {decrypted_password}")
        
#         return user
    
#     def get_by_natural_key(self, username):
#         """Get user by email (for Django admin) or username"""
#         # First try email (for admin login)
#         try:
#             return UserAccount.objects.get(email=username, is_active=True)
#         except UserAccount.DoesNotExist:
#             # Fallback to username
#             return super().get_by_natural_key(username)


# # ==================== USER MODEL ====================
# class UserAccount(AbstractBaseUser, PermissionsMixin):
#     """
#     Core User Model - Optimized with proper indexing and caching
#     ADMIN AUTHENTICATION: Email + Password
#     PPPoE AUTHENTICATION: Username + Password (for both clients and admins)
#     """
    
#     # ========== UUID PRIMARY KEY ==========
#     id = models.UUIDField(
#         primary_key=True,
#         default=uuid.uuid4,
#         editable=False,
#         unique=True,
#         help_text="Unique identifier for the user"
#     )
    
#     # User type choices
#     USER_TYPES = (
#         ("client", "Client"),
#         ("admin", "Admin"),
#         ("superadmin", "Super Admin"),
#     )
    
#     # Connection type choices
#     CONNECTION_TYPES = (
#         ("hotspot", "Hotspot"),
#         ("pppoe", "PPPoE"),
#         ("admin", "Admin Portal"),
#         ("mixed", "Mixed Access"),
#     )
    
#     # Priority choices for admin PPPoE
#     PRIORITY_CHOICES = (
#         ('low', 'Low'),
#         ('medium', 'Medium'),
#         ('high', 'High'),
#         ('critical', 'Critical'),
#     )
    
#     # ========== CORE IDENTITY FIELDS ==========
#     username = models.CharField(
#         max_length=255, 
#         unique=True, 
#         null=True, 
#         blank=True, 
#         db_index=True,
#         help_text="Auto-generated unique username"
#     )
#     name = models.CharField(
#         max_length=255, 
#         null=True, 
#         blank=True, 
#         db_index=True,
#         help_text="Full name (for admins and PPPoE clients)"
#     )
#     email = models.EmailField(
#         max_length=255, 
#         unique=True, 
#         null=True, 
#         blank=True, 
#         db_index=True,
#         help_text="Email address (for admins only)"
#     )
#     phone_number = models.CharField(
#         max_length=20,
#         unique=True, 
#         null=True, 
#         blank=True, 
#         db_index=True,
#         help_text="Phone number in +254 format (for clients)"
#     )
    
#     profile_pic = models.ImageField(
#         upload_to="profile_pics/", 
#         null=True, 
#         blank=True,
#         help_text="Profile picture (for admins)"
#     )
    
#     # ========== AUTHENTICATION & TYPE FIELDS ==========
#     user_type = models.CharField(
#         max_length=20, 
#         choices=USER_TYPES, 
#         default="admin", 
#         db_index=True
#     )
#     connection_type = models.CharField(
#         max_length=20, 
#         choices=CONNECTION_TYPES, 
#         default="hotspot", 
#         db_index=True
#     )
#     is_active = models.BooleanField(default=True, db_index=True)
#     is_staff = models.BooleanField(default=False)
#     is_2fa_enabled = models.BooleanField(default=False)
    
#     # ========== PPPOE FIELDS ==========
#     pppoe_username = models.CharField(
#         max_length=50, 
#         unique=True, 
#         null=True, 
#         blank=True, 
#         db_index=True,
#         help_text="PPPoE username"
#     )
#     pppoe_password = models.TextField(
#         null=True, 
#         blank=True,
#         help_text="Encrypted PPPoE password"
#     )
#     pppoe_active = models.BooleanField(default=False, db_index=True)
#     last_pppoe_login = models.DateTimeField(null=True, blank=True)
#     pppoe_ip_address = models.GenericIPAddressField(null=True, blank=True)
#     pppoe_credentials_sent = models.BooleanField(default=False, db_index=True)
#     pppoe_credentials_sent_at = models.DateTimeField(null=True, blank=True)
    
#     # ========== ADMIN PPPOE SETTINGS ==========
#     admin_pppoe_bandwidth = models.CharField(
#         max_length=20, 
#         default="100M",
#         help_text="Bandwidth limit for admin PPPoE"
#     )
#     admin_pppoe_priority = models.CharField(
#         max_length=20, 
#         choices=PRIORITY_CHOICES,
#         default="high",
#         help_text="QoS priority for admin PPPoE"
#     )
    
#     # ========== TIMESTAMPS ==========
#     date_joined = models.DateTimeField(auto_now_add=True, db_index=True)
#     last_login = models.DateTimeField(null=True, blank=True, db_index=True)
#     last_updated = models.DateTimeField(auto_now=True)
    
#     objects = UserAccountManager()
    
#     USERNAME_FIELD = "email"  # ✅ Admin login uses email
#     REQUIRED_FIELDS = ["username", "name"]  # ✅ Username required but not for login
    
#     class Meta:
#         verbose_name = "User Account"
#         verbose_name_plural = "User Accounts"
#         indexes = [
#             # Composite indexes for common queries
#             models.Index(fields=['user_type', 'connection_type', 'is_active']),
#             models.Index(fields=['email', 'is_active']),
#             models.Index(fields=['phone_number', 'is_active']),
#             models.Index(fields=['pppoe_username', 'pppoe_active']),
#             models.Index(fields=['date_joined']),
#             models.Index(fields=['last_updated']),
#             # Partial indexes for better performance
#             models.Index(fields=['user_type'], condition=models.Q(user_type='client'), name='idx_client_users'),
#             models.Index(fields=['connection_type'], condition=models.Q(connection_type='pppoe'), name='idx_pppoe_users'),
#             models.Index(fields=['is_active'], condition=models.Q(is_active=True), name='idx_active_users'),
#             # Index for admin email authentication
#             models.Index(fields=['email', 'user_type'], condition=models.Q(user_type__in=['admin', 'superadmin']), name='idx_admin_auth'),
#         ]
#         ordering = ['-date_joined']
    
#     def __str__(self) -> str:
#         """String representation"""
#         if self.user_type == "client":
#             return f"{self.username} ({self.get_phone_display()})"
#         return f"{self.email}"
    
#     # ========== PROPERTIES ==========
#     @property
#     def uuid(self) -> str:
#         """Get UUID as string"""
#         return str(self.id)
    
#     @property
#     def is_admin(self) -> bool:
#         return self.user_type in ['admin', 'superadmin']
    
#     @property
#     def is_super_admin(self) -> bool:
#         return self.user_type == 'superadmin'
    
#     @property
#     def is_pppoe_user(self) -> bool:
#         return bool(self.pppoe_username)
    
#     @property
#     def is_hotspot_user(self) -> bool:
#         return self.connection_type == 'hotspot'
    
#     @property
#     def client_identifier(self) -> str:
#         """Get client identifier for display"""
#         if self.user_type == "client":
#             return self.username
#         return self.email
    
#     # ========== PHONE METHODS ==========
#     def get_phone_display(self) -> str:
#         """Get display format for phone"""
#         return PhoneValidation.get_phone_display(self.phone_number)
    
#     def get_phone_normalized(self) -> str:
#         """Get normalized phone format"""
#         return PhoneValidation.normalize_kenyan_phone(self.phone_number)
    
#     def get_phone_operator(self) -> str:
#         """Get mobile operator"""
#         return PhoneValidation.get_operator(self.phone_number)
    
#     # ========== VALIDATION & CLEANING ==========
#     def clean(self):
#         """Enhanced validation before saving"""
#         errors = {}
        
#         # Client validation
#         if self.user_type == "client":
#             if not self.phone_number:
#                 errors['phone_number'] = "Phone number is required for clients"
#             elif not PhoneValidation.is_valid_kenyan_phone(self.phone_number):
#                 errors['phone_number'] = "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
            
#             if self.email:
#                 errors['email'] = "Clients should not have email"
            
#             if self.connection_type not in ['hotspot', 'pppoe']:
#                 errors['connection_type'] = "Invalid connection type for client"
            
#             # PPPoE-specific validation
#             if self.connection_type == 'pppoe':
#                 if not self.pppoe_username:
#                     errors['pppoe_username'] = "PPPoE username required"
#                 if not self.name:
#                     errors['name'] = "Name is required for PPPoE clients"
        
#         # Admin validation
#         else:
#             if not self.email:
#                 errors['email'] = "Email is required for admins"
#             if not self.name:
#                 errors['name'] = "Name is required for admins"
#             if self.user_type not in ['admin', 'superadmin']:
#                 errors['user_type'] = "Invalid user type for admin"
            
#             # Admins should not have phone number for authentication
#             if self.phone_number:
#                 errors['phone_number'] = "Admins should not have phone number for authentication"
        
#         if errors:
#             raise ValidationError(errors)
    
#     # ========== SAVE & DELETE METHODS ==========
#     def save(self, *args, **kwargs):
#         """Custom save with auto-generation and caching"""
#         # Generate UUID if not provided
#         if not self.id:
#             self.id = uuid.uuid4()
        
#         # Normalize phone number before saving
#         if self.phone_number:
#             self.phone_number = PhoneValidation.normalize_kenyan_phone(self.phone_number)
        
#         # Auto-generate fields before validation
#         if self.user_type == "client":
#             if not self.username:
#                 self.username = IDGenerator.generate_client_username()
            
#             # Auto-generate PPPoE credentials if needed
#             if self.connection_type == 'pppoe':
#                 if not self.pppoe_username:
#                     self.pppoe_username = IDGenerator.generate_pppoe_username(
#                         self.name, 
#                         self.phone_number
#                     )
#                 if not self.pppoe_password:
#                     plain_password = IDGenerator.generate_phone_based_password(self.phone_number)
#                     self.pppoe_password = CredentialEncryption.encrypt(plain_password)
#         else:
#             # Admin users - generate username from email if not provided
#             if not self.username and self.email:
#                 self.username = IDGenerator.generate_admin_username(self.email)
        
#         # Set admin flags
#         if self.user_type in ['admin', 'superadmin']:
#             self.is_staff = True
#             self.is_superuser = (self.user_type == 'superadmin')
        
#         # Validate and save
#         self.full_clean()
#         is_new = self._state.adding
        
#         super().save(*args, **kwargs)
        
#         # Update cache
#         UserCacheManager.set_user(self, self.uuid)
        
#         if is_new:
#             # Invalidate user counts cache
#             cache.delete('user_counts')
#             cache.delete('active_user_counts')
    
#     def delete(self, *args, **kwargs):
#         """Custom delete with cache invalidation"""
#         # Get identifiers for cache invalidation
#         identifiers = [self.uuid, self.email, str(self.phone_number)]
#         identifiers = [id for id in identifiers if id]
        
#         UserCacheManager.bulk_invalidate(identifiers)
        
#         # Invalidate user counts cache
#         cache.delete('user_counts')
#         cache.delete('active_user_counts')
        
#         super().delete(*args, **kwargs)
    
#     # ========== HELPER METHODS ==========
#     def get_short_uuid(self, length: int = 8) -> str:
#         """Get short version of UUID for display"""
#         return str(self.id).replace('-', '')[:length].upper()
    
#     # ========== PPPOE METHODS ==========
#     def get_pppoe_password_decrypted(self) -> Optional[str]:
#         """Get decrypted PPPoE password with caching"""
#         if not self.pppoe_password:
#             return None
        
#         cache_key = f"pppoe_pw_{self.uuid}"
#         cached_password = cache.get(cache_key)
        
#         if cached_password:
#             return cached_password
        
#         try:
#             decrypted = CredentialEncryption.decrypt(self.pppoe_password)
#             # Cache for 5 minutes (passwords don't change frequently)
#             cache.set(cache_key, decrypted, 300)
#             return decrypted
#         except Exception as e:
#             logger.error(f"Failed to decrypt PPPoE password for user {self.uuid}: {e}")
#             return None
    
#     def setup_admin_pppoe(self, username: str = None, password: str = None) -> Dict[str, Any]:
#         """Setup PPPoE credentials for admin user"""
#         if not self.is_admin:
#             raise ValueError("Only admin users can setup PPPoE")
        
#         if not username:
#             username = IDGenerator.generate_admin_pppoe_username(self.email)
        
#         if not password:
#             password = IDGenerator.generate_pppoe_password()
        
#         # Check if username is taken
#         if UserAccount.objects.filter(pppoe_username=username).exclude(id=self.id).exists():
#             raise ValueError("PPPoE username already taken")
        
#         self.pppoe_username = username
#         self.pppoe_password = CredentialEncryption.encrypt(password)
#         self.connection_type = 'pppoe'
        
#         self.save()
        
#         # Clear password cache
#         cache.delete(f"pppoe_pw_{self.uuid}")
        
#         return {
#             'username': username,
#             'password': password,
#             'message': 'Admin PPPoE credentials setup successfully'
#         }
    
#     def reset_pppoe_credentials(self, send_sms: bool = True) -> Dict[str, Any]:
#         """Reset PPPoE credentials and return new ones"""
#         # Generate new credentials
#         if self.user_type == "client":
#             self.pppoe_username = IDGenerator.generate_pppoe_username(self.name, self.phone_number)
#             plain_password = IDGenerator.generate_phone_based_password(self.phone_number)
#         else:
#             self.pppoe_username = IDGenerator.generate_admin_pppoe_username(self.email)
#             plain_password = IDGenerator.generate_pppoe_password()
        
#         self.pppoe_password = CredentialEncryption.encrypt(plain_password)
#         self.pppoe_active = False
#         self.pppoe_ip_address = None
#         self.pppoe_credentials_sent = False
#         self.pppoe_credentials_sent_at = None
        
#         self.save()
        
#         # Clear password cache
#         cache.delete(f"pppoe_pw_{self.uuid}")
        
#         result = {
#             'username': self.pppoe_username,
#             'password': plain_password,
#             'message': 'PPPoE credentials reset successfully'
#         }
        
#         if send_sms and self.user_type == "client":
#             # TODO: Trigger SMS sending for clients
#             logger.info(f"PPPoE credentials reset for {self.username}, SMS should be sent")
        
#         return result
    
#     def update_pppoe_credentials(
#         self, 
#         username: str = None, 
#         password: str = None
#     ) -> Dict[str, Any]:
#         """Update PPPoE credentials (for client customization)"""
#         if not self.is_pppoe_user:
#             raise ValueError("User is not a PPPoE user")
        
#         updates = {}
        
#         if username:
#             # Check if username is available
#             if UserAccount.objects.filter(pppoe_username=username).exclude(id=self.id).exists():
#                 raise ValueError("PPPoE username already taken")
#             self.pppoe_username = username
#             updates['username'] = username
        
#         if password:
#             # Validate password strength
#             if len(password) < 8:
#                 raise ValueError("Password must be at least 8 characters")
#             self.pppoe_password = CredentialEncryption.encrypt(password)
#             updates['password'] = password
        
#         self.save()
        
#         # Clear password cache
#         cache.delete(f"pppoe_pw_{self.uuid}")
        
#         return {
#             'success': True,
#             'message': 'PPPoE credentials updated successfully',
#             'updates': updates
#         }
    
#     def send_pppoe_credentials_sms(self) -> bool:
#         """Send PPPoE credentials via SMS (for clients only)"""
#         if not self.is_pppoe_user or self.user_type != "client":
#             return False
        
#         decrypted_password = self.get_pppoe_password_decrypted()
#         if not decrypted_password:
#             return False
        
#         # TODO: Integrate with SMS automation service
#         # This would call the SMS automation app to send credentials
        
#         self.pppoe_credentials_sent = True
#         self.pppoe_credentials_sent_at = timezone.now()
#         self.save(update_fields=['pppoe_credentials_sent', 'pppoe_credentials_sent_at'])
        
#         logger.info(f"PPPoE credentials sent via SMS to {self.phone_number}")
#         return True
    
#     # ========== PERMISSION & ACCESS METHODS ==========
#     def can_access_pppoe(self) -> bool:
#         """Check if user can access PPPoE services"""
#         if self.user_type == 'client':
#             return self.connection_type == 'pppoe' and self.is_active
#         else:
#             return bool(self.pppoe_username) and self.is_active
    
#     def get_effective_bandwidth(self) -> str:
#         """Get effective bandwidth based on user type"""
#         if self.user_type in ['admin', 'superadmin']:
#             return self.admin_pppoe_bandwidth or "100M"
#         return "10M"  # Default for clients
    
#     def get_auth_methods(self) -> List[str]:
#         """Get available authentication methods"""
#         methods = []
        
#         if self.user_type == 'client':
#             if self.connection_type == 'hotspot':
#                 methods.append('phone')
#             elif self.connection_type == 'pppoe':
#                 methods.append('pppoe')
#         else:
#             methods.append('email_password')  # ✅ Admin uses email + password
#             if self.pppoe_username:
#                 methods.append('pppoe')  # Admin can also use PPPoE
        
#         return methods
    
#     # ========== SERIALIZATION METHODS ==========
#     def get_display_fields(self, include_sensitive: bool = False) -> Dict[str, Any]:
#         """Get user data for API responses with caching"""
#         cache_key = f"user_display_{self.uuid}_{self.last_updated.timestamp()}_{include_sensitive}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return cached_data
        
#         base_data = {
#             'id': self.uuid,
#             'user_type': self.user_type,
#             'user_type_display': self.get_user_type_display(),
#             'connection_type': self.connection_type,
#             'connection_type_display': self.get_connection_type_display(),
#             'is_active': self.is_active,
#             'is_2fa_enabled': self.is_2fa_enabled,
#             'date_joined': self.date_joined.isoformat() if self.date_joined else None,
#             'last_updated': self.last_updated.isoformat() if self.last_updated else None,
#             'can_access_pppoe': self.can_access_pppoe(),
#             'effective_bandwidth': self.get_effective_bandwidth(),
#             'auth_methods': self.get_auth_methods(),
#             'is_staff': self.is_staff,
#             'is_superuser': self.is_superuser,
#         }
        
#         # Add type-specific fields
#         if self.user_type == "client":
#             base_data.update({
#                 'username': self.username,
#                 'phone_number': self.phone_number,
#                 'phone_number_display': self.get_phone_display(),
#                 'phone_operator': self.get_phone_operator(),
#                 'short_uuid': self.get_short_uuid(8),
#                 'is_pppoe_user': self.is_pppoe_user,
#                 'is_hotspot_user': self.is_hotspot_user,
#             })
            
#             if self.connection_type == 'pppoe':
#                 base_data.update({
#                     'pppoe_username': self.pppoe_username,
#                     'pppoe_active': self.pppoe_active,
#                     'last_pppoe_login': self.last_pppoe_login.isoformat() if self.last_pppoe_login else None,
#                     'pppoe_ip_address': self.pppoe_ip_address,
#                     'pppoe_credentials_sent': self.pppoe_credentials_sent,
#                     'pppoe_credentials_sent_at': self.pppoe_credentials_sent_at.isoformat() if self.pppoe_credentials_sent_at else None,
#                 })
                
#                 if include_sensitive:
#                     base_data['pppoe_password'] = self.get_pppoe_password_decrypted()
#         else:
#             base_data.update({
#                 'username': self.username,
#                 'name': self.name,
#                 'email': self.email,
#                 'profile_pic': self.profile_pic.url if self.profile_pic else None,
#                 'is_admin': True,
#                 'is_super_admin': self.is_super_admin,
#                 'short_uuid': self.get_short_uuid(6),
#             })
            
#             if self.pppoe_username:
#                 base_data.update({
#                     'pppoe_username': self.pppoe_username,
#                     'pppoe_active': self.pppoe_active,
#                     'admin_pppoe_bandwidth': self.admin_pppoe_bandwidth,
#                     'admin_pppoe_priority': self.admin_pppoe_priority,
#                     'last_pppoe_login': self.last_pppoe_login.isoformat() if self.last_pppoe_login else None,
#                 })
                
#                 if include_sensitive:
#                     base_data['pppoe_password'] = self.get_pppoe_password_decrypted()
        
#         # Cache for 5 minutes
#         cache.set(cache_key, base_data, 300)
#         return base_data
    
#     # ========== CLASS METHODS ==========
#     @classmethod
#     def get_active_users_count(cls) -> int:
#         """Get count of active users with caching"""
#         cache_key = 'active_user_counts'
#         cached_count = cache.get(cache_key)
        
#         if cached_count is not None:
#             return cached_count
        
#         count = cls.objects.filter(is_active=True).count()
#         cache.set(cache_key, count, 300)  # Cache for 5 minutes
#         return count
    
#     @classmethod
#     def get_user_counts(cls) -> Dict[str, int]:
#         """Get user counts by type with caching"""
#         cache_key = 'user_counts'
#         cached_counts = cache.get(cache_key)
        
#         if cached_counts:
#             return cached_counts
        
#         counts = cls.objects.aggregate(
#             total=models.Count('id'),
#             clients=models.Count('id', filter=models.Q(user_type='client')),
#             admins=models.Count('id', filter=models.Q(user_type='admin')),
#             superadmins=models.Count('id', filter=models.Q(user_type='superadmin')),
#             hotspot_clients=models.Count('id', filter=models.Q(user_type='client', connection_type='hotspot')),
#             pppoe_clients=models.Count('id', filter=models.Q(user_type='client', connection_type='pppoe')),
#             active_users=models.Count('id', filter=models.Q(is_active=True)),
#         )
        
#         cache.set(cache_key, counts, 300)  # Cache for 5 minutes
#         return counts
    
#     @classmethod
#     def get_recent_users(cls, days: int = 7) -> models.QuerySet:
#         """Get users who joined recently with optimized query"""
#         cutoff_date = timezone.now() - timedelta(days=days)
#         return cls.objects.filter(
#             date_joined__gte=cutoff_date,
#             is_active=True
#         ).only(
#             'id', 'username', 'email', 'phone_number', 
#             'user_type', 'connection_type', 'date_joined'
#         ).order_by('-date_joined')
    
#     @classmethod
#     def get_pppoe_users(cls) -> models.QuerySet:
#         """Get all users with PPPoE credentials with optimized query"""
#         return cls.objects.filter(
#             pppoe_username__isnull=False,
#             is_active=True
#         ).only(
#             'id', 'username', 'pppoe_username', 
#             'pppoe_active', 'connection_type', 'user_type'
#         )
    
#     @classmethod
#     def get_user_by_phone(cls, phone_number: str) -> Optional['UserAccount']:
#         """Get user by phone number with caching"""
#         normalized_phone = PhoneValidation.normalize_kenyan_phone(phone_number)
        
#         if not normalized_phone:
#             return None
        
#         # Try cache first
#         cache_key = f"user_by_phone_{normalized_phone}"
#         cached_user = cache.get(cache_key)
        
#         if cached_user:
#             return cached_user
        
#         try:
#             user = cls.objects.get(
#                 phone_number=normalized_phone,
#                 is_active=True
#             )
#             # Cache the user
#             cache.set(cache_key, user, 300)
#             return user
#         except cls.DoesNotExist:
#             # Cache negative result for 5 minutes
#             cache.set(cache_key, None, 300)
#             return None
#         except cls.MultipleObjectsReturned:
#             # Handle duplicates by returning first active user
#             user = cls.objects.filter(
#                 phone_number=normalized_phone,
#                 is_active=True
#             ).first()
#             if user:
#                 cache.set(cache_key, user, 300)
#             return user
    
#     @classmethod
#     def get_user_by_uuid(cls, user_uuid: str) -> Optional['UserAccount']:
#         """Get user by UUID with caching"""
#         # Try cache first
#         cache_key = f"user_by_uuid_{user_uuid}"
#         cached_user = cache.get(cache_key)
        
#         if cached_user:
#             return cached_user
        
#         try:
#             user = cls.objects.get(id=user_uuid, is_active=True)
#             # Cache the user
#             cache.set(cache_key, user, 300)
#             return user
#         except (cls.DoesNotExist, ValueError):
#             # Cache negative result for 5 minutes
#             cache.set(cache_key, None, 300)
#             return None
    
#     @classmethod
#     def get_user_by_email(cls, email: str) -> Optional['UserAccount']:
#         """Get user by email with caching"""
#         # Try cache first
#         cache_key = f"user_by_email_{email.lower()}"
#         cached_user = cache.get(cache_key)
        
#         if cached_user:
#             return cached_user
        
#         try:
#             user = cls.objects.get(email__iexact=email, is_active=True)
#             # Cache the user
#             cache.set(cache_key, user, 300)
#             return user
#         except cls.DoesNotExist:
#             # Cache negative result for 5 minutes
#             cache.set(cache_key, None, 300)
#             return None
    
#     @classmethod
#     def bulk_update_status(cls, user_ids: List[str], is_active: bool) -> int:
#         """Bulk update user status with cache invalidation"""
#         if not user_ids:
#             return 0
        
#         # Convert string UUIDs to UUID objects
#         uuids = []
#         for user_id in user_ids:
#             try:
#                 uuids.append(uuid.UUID(user_id))
#             except ValueError:
#                 continue
        
#         if not uuids:
#             return 0
        
#         # Perform bulk update
#         updated_count = cls.objects.filter(id__in=uuids).update(
#             is_active=is_active,
#             last_updated=timezone.now()
#         )
        
#         # Invalidate cache for updated users
#         for user_id in user_ids:
#             UserCacheManager.invalidate_user(user_id)
        
#         # Invalidate user counts cache
#         cache.delete('user_counts')
#         cache.delete('active_user_counts')
        
#         return updated_count












"""
AUTHENTICATION APP - Core User Identity Management
Handles only authentication-related functionality for two user types:
1. Authenticated Users (Admins/Staff): Email + Password (Django Admin/Dashboard)
2. Client Users: Phone-based (Hotspot) or PPPoE credentials

Architecture Principles:
- Authentication app ONLY handles identity and authentication
- No SMS functionality - that's handled by UserManagement app
- No internet plans - that's handled by InternetPlans app
- No statistics/health checks - those are separate concerns
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
from typing import Optional, Dict, Any
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
    Custom User Manager with clear separation of concerns:
    - Creates authenticated users (email + password)
    - Creates client users (phone-based or PPPoE)
    - No SMS functionality - that's handled by UserManagement app
    """
    
    def create_authenticated_user(
        self, 
        email: str, 
        password: str, 
        name: str = None,
        **extra_fields
    ) -> 'UserAccount':
        """
        Create authenticated user (admin/staff) for dashboard access
        Uses email + password authentication (handled by Djoser)
        """
        if not email:
            raise ValueError("Email is required for authenticated users")
        
        if not password:
            raise ValueError("Password is required for authenticated users")
        
        email = self.normalize_email(email)
        
        # Check for existing email
        if self.model.objects.filter(email=email).exists():
            raise ValueError(f"Email {email} already exists")
        
        # Create user - authenticated users don't have usernames
        user = self.model(
            id=uuid.uuid4(),
            email=email,
            name=name or email.split('@')[0],
            user_type=extra_fields.pop('user_type', 'staff'),
            is_staff=True,
            is_active=True,
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
        **extra_fields
    ) -> 'UserAccount':
        """
        Create client user (hotspot or PPPoE)
        Hotspot clients: phone only, no password
        PPPoE clients: phone + name, with generated credentials
        """
        # Validate and normalize phone
        if not PhoneValidation.is_valid_kenyan_phone(phone_number):
            raise ValueError(f"Invalid phone number: {phone_number}")
        
        normalized_phone = PhoneValidation.normalize_kenyan_phone(phone_number)
        
        # Check for existing phone (clients must have unique phones)
        if self.model.objects.filter(phone_number=normalized_phone).exists():
            raise ValueError(f"Phone number {normalized_phone} already registered")
        
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
            **extra_fields,
        )
        
        # Set unusable password (clients don't use password auth)
        user.set_unusable_password()
        user.save(using=self._db)
        
        logger.info(f"Created client user: {username} ({connection_type})")
        return user
    
    def create_superuser(self, email: str, password: str, **extra_fields):
        """Create superuser for Django admin"""
        extra_fields.setdefault('user_type', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_authenticated_user(
            email=email,
            password=password,
            **extra_fields
        )


# ==================== USER MODEL ====================
class UserAccount(AbstractBaseUser, PermissionsMixin):
    """
    Core User Model with clear separation:
    - Authenticated Users: Email + Password (for Dashboard)
    - Client Users: Phone-based (Hotspot) or PPPoE credentials
    
    Architectural Boundaries:
    - No SMS functionality - UserManagement app handles that
    - No plan management - InternetPlans app handles that
    - Only authentication and identity management
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
        ("pppoe", "PPPoE"),          # Ethernet users (PPPoE auth)
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
        help_text="Email address for authenticated users only"
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
    
    # ✅ Authenticated users login with email (handled by Djoser)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]  # For createsuperuser command
    
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
            
            # Partial indexes for better performance
            models.Index(fields=['user_type'], condition=models.Q(user_type='client'), name='idx_client_users'),
            models.Index(fields=['connection_type'], condition=models.Q(connection_type='pppoe'), name='idx_pppoe_users'),
            models.Index(fields=['is_active'], condition=models.Q(is_active=True), name='idx_active_users'),
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
            
            # Clients should not have email for authentication
            if self.email:
                errors['email'] = "Clients should not have email addresses"
            
            # PPPoE-specific validation
            if self.connection_type == 'pppoe':
                if not self.name:
                    errors['name'] = "Name is required for PPPoE clients"
        
        # Authenticated user validation rules
        else:
            if not self.email:
                errors['email'] = "Email is required for authenticated users"
            
            if self.phone_number:
                errors['phone_number'] = "Authenticated users should not have phone numbers"
            
            if self.connection_type != 'admin':
                errors['connection_type'] = "Invalid connection type for authenticated user"
            
            if self.username:
                errors['username'] = "Authenticated users should not have usernames"
        
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
        
        # Set staff flags for authenticated users
        if self.is_authenticated_user:
            self.is_staff = True
            self.connection_type = 'admin'
        
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
            })
        
        return base_data
    
    # ========== CLASS METHODS ==========
    @classmethod
    def get_client_by_phone(cls, phone_number: str) -> Optional['UserAccount']:
        """
        Get client user by phone number
        Used by hotspot landing page to find/create clients
        """
        normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
        
        if not normalized:
            return None
        
        try:
            return cls.objects.get(
                phone_number=normalized,
                user_type='client',
                is_active=True
            )
        except cls.DoesNotExist:
            return None
        except cls.MultipleObjectsReturned:
            # Handle duplicates by returning first active client
            return cls.objects.filter(
                phone_number=normalized,
                user_type='client',
                is_active=True
            ).first()
    
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


















