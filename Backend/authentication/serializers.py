



# """
# AUTHENTICATION APP - Production Ready Serializers
# Enhanced with caching, validation, and optimized performance
# """

# from rest_framework import serializers
# from rest_framework.validators import UniqueValidator
# from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
# from django.core.cache import cache
# from django.db import transaction
# from django.core.exceptions import ValidationError
# from django.contrib.auth import authenticate
# from typing import Dict, Any, Optional, Tuple
# import re
# import logging

# from authentication.models import (
#     UserAccount, 
#     CredentialEncryption, 
#     IDGenerator,
#     PhoneValidation
# )

# logger = logging.getLogger(__name__)


# # ==================== VALIDATION UTILITIES ====================
# class ValidationAlgorithms:
#     """Enhanced validation algorithms with caching"""
    
#     # Compiled regex patterns for better performance
#     _EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
#     _PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
    
#     @classmethod
#     def is_valid_email(cls, email: str) -> bool:
#         """Validate email format with caching"""
#         if not email or not isinstance(email, str):
#             return False
        
#         # Cache validation results
#         cache_key = f"email_valid_{hash(email)}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result is not None:
#             return cached_result
        
#         is_valid = bool(cls._EMAIL_REGEX.match(email))
#         cache.set(cache_key, is_valid, 300)  # Cache for 5 minutes
#         return is_valid
    
#     @classmethod
#     def is_valid_phone_number(cls, phone_number: str) -> bool:
#         """Validate phone number format with caching"""
#         return PhoneValidation.is_valid_kenyan_phone(phone_number)
    
#     @classmethod
#     def normalize_phone(cls, phone_number: str) -> str:
#         """Normalize phone to +254 format with caching"""
#         return PhoneValidation.normalize_kenyan_phone(phone_number)
    
#     @classmethod
#     def get_phone_display(cls, phone_number: str) -> str:
#         """Get display format for phone with caching"""
#         return PhoneValidation.get_phone_display(phone_number)
    
#     @classmethod
#     def validate_password_strength(cls, password: str) -> Dict[str, Any]:
#         """Validate password strength with comprehensive checks"""
#         if not password:
#             return {'valid': False, 'message': 'Password is required'}
        
#         # Cache validation for common passwords
#         cache_key = f"pw_strength_{hash(password)}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result:
#             return cached_result
        
#         checks = {
#             'length': len(password) >= 8,
#             'uppercase': any(c.isupper() for c in password),
#             'lowercase': any(c.islower() for c in password),
#             'digit': any(c.isdigit() for c in password),
#             'special': bool(re.search(r'[@$!%*?&#]', password)),
#             'no_common': password.lower() not in ['password', '12345678', 'admin123', 'qwerty'],
#         }
        
#         strength = sum(checks.values())
#         valid = strength >= 5
        
#         result = {
#             'valid': valid,
#             'strength': strength,
#             'checks': checks,
#             'message': 'Password meets requirements' if valid else 'Password too weak. Must include uppercase, lowercase, digit, and special character'
#         }
        
#         cache.set(cache_key, result, 300)  # Cache for 5 minutes
#         return result
    
#     @classmethod
#     def validate_pppoe_username(cls, username: str) -> Dict[str, Any]:
#         """Validate PPPoE username format"""
#         if not username or len(username) < 3:
#             return {'valid': False, 'message': 'Username must be at least 3 characters'}
        
#         # PPPoE username validation rules
#         if len(username) > 32:
#             return {'valid': False, 'message': 'Username must be 32 characters or less'}
        
#         if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
#             return {'valid': False, 'message': 'Username can only contain letters, numbers, dots, dashes, and underscores'}
        
#         return {'valid': True, 'message': 'Username is valid'}


# # ==================== CACHE VALIDATOR ====================
# class CachedFieldValidator:
#     """Enhanced cache-based field existence validation with TTL"""
    
#     @staticmethod
#     def email_exists(email: str) -> bool:
#         """Check if email exists in database with caching"""
#         if not email:
#             return False
        
#         email_key = email.lower().strip()
#         cache_key = f"email_exists_{email_key}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result is not None:
#             return cached_result
        
#         exists = UserAccount.objects.filter(
#             email__iexact=email_key,
#             is_active=True
#         ).exists()
        
#         cache.set(cache_key, exists, 300)  # Cache for 5 minutes
#         return exists
    
#     @staticmethod
#     def phone_number_exists(phone_number: str) -> bool:
#         """Check if phone number exists in database with caching"""
#         normalized = PhoneValidation.normalize_kenyan_phone(phone_number)
#         if not normalized:
#             return False
        
#         cache_key = f"phone_exists_{normalized}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result is not None:
#             return cached_result
        
#         exists = UserAccount.objects.filter(
#             phone_number=normalized,
#             is_active=True
#         ).exists()
        
#         cache.set(cache_key, exists, 300)  # Cache for 5 minutes
#         return exists
    
#     @staticmethod
#     def pppoe_username_exists(username: str) -> bool:
#         """Check if PPPoE username exists with caching"""
#         if not username:
#             return False
        
#         username_key = username.lower().strip()
#         cache_key = f"pppoe_exists_{username_key}"
#         cached_result = cache.get(cache_key)
        
#         if cached_result is not None:
#             return cached_result
        
#         exists = UserAccount.objects.filter(
#             pppoe_username__iexact=username_key
#         ).exists()
        
#         cache.set(cache_key, exists, 300)  # Cache for 5 minutes
#         return exists
    
#     @staticmethod
#     def invalidate_cache(**kwargs):
#         """Invalidate cache entries for specific fields"""
#         for key, value in kwargs.items():
#             if value:
#                 if key == 'email':
#                     cache.delete(f"email_exists_{value.lower()}")
#                     cache.delete(f"email_valid_{hash(value)}")
#                 elif key == 'phone_number':
#                     normalized = PhoneValidation.normalize_kenyan_phone(value)
#                     if normalized:
#                         cache.delete(f"phone_exists_{normalized}")
#                 elif key == 'pppoe_username':
#                     cache.delete(f"pppoe_exists_{value.lower()}")
    
#     @staticmethod
#     def bulk_invalidate_cache(field_type: str, values: list):
#         """Bulk invalidate cache entries efficiently"""
#         if not values:
#             return
        
#         keys_to_delete = []
#         for value in values:
#             if value:
#                 if field_type == 'email':
#                     keys_to_delete.append(f"email_exists_{value.lower()}")
#                 elif field_type == 'phone':
#                     normalized = PhoneValidation.normalize_kenyan_phone(value)
#                     if normalized:
#                         keys_to_delete.append(f"phone_exists_{normalized}")
#                 elif field_type == 'pppoe_username':
#                     keys_to_delete.append(f"pppoe_exists_{value.lower()}")
        
#         if keys_to_delete:
#             cache.delete_many(keys_to_delete)


# # ==================== CLIENT CREATION SERIALIZERS ====================
# class HotspotClientCreateSerializer(serializers.ModelSerializer):
#     """Serializer for creating hotspot clients - phone only, no password"""
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         write_only=True,
#         help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
#     )
#     phone_number_display = serializers.SerializerMethodField(read_only=True)
#     username = serializers.CharField(read_only=True)
#     created = serializers.BooleanField(read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = ['id', 'phone_number', 'phone_number_display', 'username', 'created']
#         read_only_fields = ['id', 'username', 'created']
    
#     def validate_phone_number(self, value):
#         """Validate and normalize phone number"""
#         if not ValidationAlgorithms.is_valid_phone_number(value):
#             raise serializers.ValidationError(
#                 "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
#             )
        
#         normalized = ValidationAlgorithms.normalize_phone(value)
        
#         # Check if phone already exists for a client
#         exists = UserAccount.objects.filter(
#             phone_number=normalized,
#             user_type="client"
#         ).exists()
        
#         if exists:
#             self.context['existing_user'] = True
#         else:
#             self.context['existing_user'] = False
        
#         return normalized
    
#     def get_phone_number_display(self, obj):
#         """Get display format for phone"""
#         return PhoneValidation.get_phone_display(obj.phone_number)
    
#     @transaction.atomic
#     def create(self, validated_data):
#         """Create or find hotspot client"""
#         phone_number = validated_data['phone_number']
#         existing_user = self.context.get('existing_user', False)
        
#         if existing_user:
#             # Return existing client
#             user = UserAccount.objects.get(
#                 phone_number=phone_number,
#                 user_type="client"
#             )
#             logger.info(f"Found existing hotspot client: {user.username}")
#             validated_data['created'] = False
#             return user
        
#         # Create new hotspot client
#         try:
#             user = UserAccount.objects.create_hotspot_client(
#                 phone_number=phone_number
#             )
            
#             # Invalidate cache
#             CachedFieldValidator.invalidate_cache(phone_number=phone_number)
            
#             logger.info(f"Created new hotspot client: {user.username}")
#             validated_data['created'] = True
#             return user
            
#         except Exception as e:
#             logger.error(f"Failed to create hotspot client: {e}")
#             raise serializers.ValidationError(
#                 {"error": "Failed to create client account", "details": str(e)}
#             )


# class PPPoEClientCreateSerializer(serializers.ModelSerializer):
#     """Serializer for creating PPPoE clients - with auto-generated credentials"""
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         write_only=True,
#         help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
#     )
#     client_name = serializers.CharField(
#         max_length=255,
#         required=True,
#         write_only=True,
#         help_text="Client's full name for PPPoE username generation"
#     )
#     custom_username = serializers.CharField(
#         max_length=50,
#         required=False,
#         write_only=True,
#         help_text="Custom PPPoE username (optional)"
#     )
#     phone_number_display = serializers.SerializerMethodField(read_only=True)
#     username = serializers.CharField(read_only=True)
#     pppoe_username = serializers.CharField(read_only=True)
#     pppoe_password = serializers.SerializerMethodField(read_only=True)
#     created = serializers.BooleanField(read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'phone_number', 'phone_number_display', 'client_name', 
#             'custom_username', 'username', 'pppoe_username', 'pppoe_password',
#             'created'
#         ]
#         read_only_fields = ['id', 'username', 'pppoe_username', 'pppoe_password', 'created']
    
#     def validate(self, data):
#         """Validate PPPoE client creation data"""
#         phone_number = data.get('phone_number')
#         custom_username = data.get('custom_username')
        
#         # Validate phone number
#         if not ValidationAlgorithms.is_valid_phone_number(phone_number):
#             raise serializers.ValidationError({
#                 'phone_number': 'Invalid phone number format'
#             })
        
#         normalized_phone = ValidationAlgorithms.normalize_phone(phone_number)
        
#         # Check if phone already exists
#         exists = UserAccount.objects.filter(
#             phone_number=normalized_phone,
#             user_type="client"
#         ).exists()
        
#         if exists:
#             self.context['existing_user'] = True
#         else:
#             self.context['existing_user'] = False
        
#         # Validate custom username if provided
#         if custom_username:
#             username_validation = ValidationAlgorithms.validate_pppoe_username(custom_username)
#             if not username_validation['valid']:
#                 raise serializers.ValidationError({
#                     'custom_username': username_validation['message']
#                 })
            
#             if CachedFieldValidator.pppoe_username_exists(custom_username):
#                 raise serializers.ValidationError({
#                     'custom_username': 'PPPoE username already taken'
#                 })
        
#         return data
    
#     def get_phone_number_display(self, obj):
#         """Get display format for phone"""
#         return PhoneValidation.get_phone_display(obj.phone_number)
    
#     def get_pppoe_password(self, obj):
#         """Get decrypted PPPoE password for new users only"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             # Only return password for the user themselves or admins
#             if request.user == obj or request.user.is_admin:
#                 return obj.get_pppoe_password_decrypted()
#         return None
    
#     @transaction.atomic
#     def create(self, validated_data):
#         """Create or find PPPoE client with credentials"""
#         phone_number = validated_data['phone_number']
#         client_name = validated_data['client_name']
#         custom_username = validated_data.pop('custom_username', None)
#         existing_user = self.context.get('existing_user', False)
        
#         if existing_user:
#             # Return existing client
#             user = UserAccount.objects.get(
#                 phone_number=phone_number,
#                 user_type="client"
#             )
#             logger.info(f"Found existing PPPoE client: {user.username}")
#             validated_data['created'] = False
#             return user
        
#         # Create new PPPoE client
#         try:
#             user = UserAccount.objects.create_pppoe_client(
#                 phone_number=phone_number,
#                 client_name=client_name
#             )
            
#             # Update with custom username if provided
#             if custom_username:
#                 if not UserAccount.objects.filter(pppoe_username=custom_username).exists():
#                     user.pppoe_username = custom_username
#                     user.save(update_fields=['pppoe_username'])
            
#             # Send credentials via SMS
#             send_sms = self.context.get('send_sms', True)
#             if send_sms:
#                 user.send_pppoe_credentials_sms()
            
#             # Invalidate cache
#             CachedFieldValidator.invalidate_cache(
#                 phone_number=phone_number,
#                 pppoe_username=user.pppoe_username
#             )
            
#             logger.info(f"Created new PPPoE client: {user.username}")
#             validated_data['created'] = True
#             return user
            
#         except Exception as e:
#             logger.error(f"Failed to create PPPoE client: {e}")
#             raise serializers.ValidationError(
#                 {"error": "Failed to create PPPoE client", "details": str(e)}
#             )


# # ==================== MISSING SERIALIZER (Add This) ====================
# class PPPoECredentialSerializer(serializers.ModelSerializer):
#     """Serializer for PPPoE credentials with enhanced security"""
#     pppoe_password_plain = serializers.SerializerMethodField()
#     can_access_pppoe = serializers.BooleanField(read_only=True)
#     effective_bandwidth = serializers.CharField(read_only=True)
#     credentials_sent = serializers.BooleanField(source='pppoe_credentials_sent', read_only=True)
#     credentials_sent_at = serializers.DateTimeField(source='pppoe_credentials_sent_at', read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = [
#             'pppoe_username',
#             'pppoe_password_plain',
#             'pppoe_active',
#             'last_pppoe_login',
#             'pppoe_ip_address',
#             'can_access_pppoe',
#             'effective_bandwidth',
#             'admin_pppoe_bandwidth',
#             'admin_pppoe_priority',
#             'credentials_sent',
#             'credentials_sent_at'
#         ]
#         read_only_fields = [
#             'pppoe_active',
#             'last_pppoe_login',
#             'pppoe_ip_address',
#             'can_access_pppoe',
#             'effective_bandwidth',
#             'credentials_sent',
#             'credentials_sent_at'
#         ]
    
#     def get_pppoe_password_plain(self, obj):
#         """Get decrypted PPPoE password with proper access control"""
#         request = self.context.get('request')
        
#         # Only show password to the user themselves or admins
#         if request and request.user.is_authenticated:
#             if request.user == obj or request.user.is_admin:
#                 # Check if password should be shown based on context
#                 show_password = self.context.get('show_password', False)
#                 if show_password:
#                     return obj.get_pppoe_password_decrypted()
        
#         return None
    
#     def to_representation(self, instance):
#         """Custom representation with security controls"""
#         data = super().to_representation(instance)
        
#         # Mask password in response unless explicitly shown
#         if 'pppoe_password_plain' in data and data['pppoe_password_plain']:
#             if not self.context.get('show_password', False):
#                 data['pppoe_password_plain'] = '********'
        
#         # Filter admin fields based on user type
#         request = self.context.get('request')
#         if request and request.user.user_type == 'client':
#             data.pop('admin_pppoe_bandwidth', None)
#             data.pop('admin_pppoe_priority', None)
        
#         return data
    
#     def validate_pppoe_username(self, value):
#         """Validate PPPoE username"""
#         if value:
#             validation = ValidationAlgorithms.validate_pppoe_username(value)
#             if not validation['valid']:
#                 raise serializers.ValidationError(validation['message'])
        
#         return value


# class AdminPPPoESetupSerializer(serializers.ModelSerializer):
#     """Serializer for admin PPPoE setup"""
#     username = serializers.CharField(
#         max_length=50,
#         required=True,
#         help_text="PPPoE username for admin"
#     )
#     password = serializers.CharField(
#         max_length=128,
#         required=False,
#         write_only=True,
#         help_text="PPPoE password (optional, will be generated if not provided)"
#     )
#     bandwidth = serializers.ChoiceField(
#         choices=['10M', '50M', '100M', '500M', '1G'],
#         default='100M',
#         required=False
#     )
#     priority = serializers.ChoiceField(
#         choices=UserAccount.PRIORITY_CHOICES,
#         default='high',
#         required=False
#     )
    
#     class Meta:
#         model = UserAccount
#         fields = ['username', 'password', 'bandwidth', 'priority']
    
#     def validate_username(self, value):
#         """Validate PPPoE username for admin"""
#         validation = ValidationAlgorithms.validate_pppoe_username(value)
#         if not validation['valid']:
#             raise serializers.ValidationError(validation['message'])
        
#         # Check if username is taken
#         request = self.context.get('request')
#         if request and request.user:
#             if CachedFieldValidator.pppoe_username_exists(value):
#                 # Allow if it's the current user's username
#                 if request.user.pppoe_username != value:
#                     raise serializers.ValidationError(
#                         "PPPoE username already taken"
#                     )
#         else:
#             if CachedFieldValidator.pppoe_username_exists(value):
#                 raise serializers.ValidationError(
#                     "PPPoE username already taken"
#                 )
        
#         return value
    
#     def validate_password(self, value):
#         """Validate PPPoE password strength"""
#         if value:
#             password_check = ValidationAlgorithms.validate_password_strength(value)
#             if not password_check['valid']:
#                 raise serializers.ValidationError(password_check['message'])
#         return value
    
#     def validate(self, attrs):
#         """Additional validation for admin PPPoE setup"""
#         request = self.context.get('request')
#         if request and request.user.user_type not in ['admin', 'superadmin']:
#             raise serializers.ValidationError(
#                 "Only admin users can setup PPPoE"
#             )
#         return attrs


# # ==================== USER SERIALIZERS ====================
# class DjoserUserCreateSerializer(BaseUserCreateSerializer):
#     """Extended Djoser serializer for user creation with PPPoE support"""
#     user_type = serializers.ChoiceField(
#         choices=UserAccount.USER_TYPES,
#         default='admin',
#         required=False
#     )
#     connection_type = serializers.ChoiceField(
#         choices=UserAccount.CONNECTION_TYPES,
#         default='admin',
#         required=False
#     )
#     setup_pppoe = serializers.BooleanField(
#         default=False,
#         required=False,
#         write_only=True,
#         help_text="Setup PPPoE credentials for admin user"
#     )
#     pppoe_username = serializers.CharField(
#         max_length=50,
#         required=False,
#         write_only=True,
#         help_text="Custom PPPoE username"
#     )
#     pppoe_password = serializers.CharField(
#         max_length=128,
#         required=False,
#         write_only=True,
#         help_text="Custom PPPoE password"
#     )
    
#     class Meta(BaseUserCreateSerializer.Meta):
#         model = UserAccount
#         fields = [
#             'id', 'email', 'password', 'user_type', 'connection_type',
#             'setup_pppoe', 'pppoe_username', 'pppoe_password'
#         ]
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'name': {'required': True},
#         }
    
#     def validate(self, attrs):
#         """Validate user creation data"""
#         user_type = attrs.get('user_type', 'admin')
        
#         # Admin user validation
#         if user_type in ['admin', 'superadmin']:
#             email = attrs.get('email')
#             if not email:
#                 raise serializers.ValidationError({
#                     "email": "Email is required for admin users"
#                 })
            
#             if not ValidationAlgorithms.is_valid_email(email):
#                 raise serializers.ValidationError({
#                     "email": "Invalid email format"
#                 })
            
#             if CachedFieldValidator.email_exists(email):
#                 raise serializers.ValidationError({
#                     "email": "Email already exists"
#                 })
            
#             # Validate password
#             password = attrs.get('password')
#             if password:
#                 password_check = ValidationAlgorithms.validate_password_strength(password)
#                 if not password_check['valid']:
#                     raise serializers.ValidationError({
#                         "password": password_check['message']
#                     })
        
#         # PPPoE setup validation
#         setup_pppoe = attrs.get('setup_pppoe', False)
#         if setup_pppoe:
#             pppoe_username = attrs.get('pppoe_username')
#             if not pppoe_username:
#                 raise serializers.ValidationError({
#                     "pppoe_username": "PPPoE username required when setup_pppoe is True"
#                 })
            
#             username_validation = ValidationAlgorithms.validate_pppoe_username(pppoe_username)
#             if not username_validation['valid']:
#                 raise serializers.ValidationError({
#                     "pppoe_username": username_validation['message']
#                 })
            
#             if CachedFieldValidator.pppoe_username_exists(pppoe_username):
#                 raise serializers.ValidationError({
#                     "pppoe_username": "PPPoE username already taken"
#                 })
            
#             pppoe_password = attrs.get('pppoe_password')
#             if pppoe_password:
#                 password_check = ValidationAlgorithms.validate_password_strength(pppoe_password)
#                 if not password_check['valid']:
#                     raise serializers.ValidationError({
#                         "pppoe_password": password_check['message']
#                     })
        
#         return super().validate(attrs)
    
#     @transaction.atomic
#     def create(self, validated_data):
#         """Create user with optional PPPoE setup"""
#         setup_pppoe = validated_data.pop('setup_pppoe', False)
#         pppoe_username = validated_data.pop('pppoe_username', None)
#         pppoe_password = validated_data.pop('pppoe_password', None)
        
#         # Create user
#         user = UserAccount.objects.create_user(**validated_data)
        
#         # Setup PPPoE if requested
#         if setup_pppoe and pppoe_username:
#             # Update PPPoE credentials
#             user.pppoe_username = pppoe_username
#             if pppoe_password:
#                 user.pppoe_password = CredentialEncryption.encrypt(pppoe_password)
#             else:
#                 # Generate password
#                 plain_password = IDGenerator.generate_pppoe_password()
#                 user.pppoe_password = CredentialEncryption.encrypt(plain_password)
            
#             user.connection_type = 'pppoe'
#             user.save()
        
#         # Invalidate caches
#         if 'email' in validated_data:
#             CachedFieldValidator.invalidate_cache(email=validated_data['email'])
#         if pppoe_username:
#             CachedFieldValidator.invalidate_cache(pppoe_username=pppoe_username)
        
#         return user


# class UserSerializer(serializers.ModelSerializer):
#     """Main user serializer with enhanced data representation"""
#     user_type_display = serializers.CharField(
#         source='get_user_type_display',
#         read_only=True
#     )
#     connection_type_display = serializers.CharField(
#         source='get_connection_type_display',
#         read_only=True
#     )
#     is_admin = serializers.BooleanField(read_only=True)
#     is_super_admin = serializers.BooleanField(read_only=True)
#     is_pppoe_user = serializers.BooleanField(read_only=True)
#     is_hotspot_user = serializers.BooleanField(read_only=True)
#     can_access_pppoe = serializers.BooleanField(read_only=True)
#     effective_bandwidth = serializers.CharField(read_only=True)
#     pppoe_credentials = PPPoECredentialSerializer(source='*', read_only=True)
#     phone_number_display = serializers.SerializerMethodField()
#     short_uuid = serializers.SerializerMethodField()
#     phone_operator = serializers.SerializerMethodField()
#     auth_methods = serializers.SerializerMethodField()
    
#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'uuid', 'short_uuid', 'username', 'email', 
#             'phone_number', 'phone_number_display', 'phone_operator', 'profile_pic',
#             'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
#             'is_active', 'is_staff', 'date_joined', 'is_2fa_enabled',
#             'is_admin', 'is_super_admin', 'is_pppoe_user', 'is_hotspot_user',
#             'last_updated', 'pppoe_credentials', 'can_access_pppoe', 'effective_bandwidth',
#             'admin_pppoe_bandwidth', 'admin_pppoe_priority', 'auth_methods'
#         ]
#         read_only_fields = [
#             'id', 'uuid', 'short_uuid', 'is_staff', 'date_joined', 'username', 'is_2fa_enabled',
#             'is_admin', 'is_super_admin', 'last_updated',
#             'can_access_pppoe', 'effective_bandwidth', 'phone_number_display',
#             'phone_operator', 'auth_methods'
#         ]
    
#     def get_phone_number_display(self, obj):
#         """Get display format for phone"""
#         return obj.get_phone_display()
    
#     def get_short_uuid(self, obj):
#         """Get short version of UUID"""
#         return obj.get_short_uuid(8)
    
#     def get_phone_operator(self, obj):
#         """Get mobile operator"""
#         return obj.get_phone_operator()
    
#     def get_auth_methods(self, obj):
#         """Get available authentication methods"""
#         return obj.get_auth_methods()
    
#     def to_representation(self, instance):
#         """Custom representation based on user type and permissions"""
#         data = super().to_representation(instance)
#         request = self.context.get('request')
        
#         # Ensure UUID fields are strings
#         if 'id' in data:
#             data['id'] = str(data['id'])
        
#         if request and request.user.is_authenticated:
#             # Hide sensitive fields based on permissions
#             if request.user.user_type == 'client':
#                 data.pop('email', None)
#                 data.pop('name', None)
#                 data.pop('admin_pppoe_bandwidth', None)
#                 data.pop('admin_pppoe_priority', None)
            
#             # Hide client fields for admin viewing other admins
#             if (request.user.user_type in ['admin', 'superadmin'] and 
#                 instance.user_type in ['admin', 'superadmin']):
#                 data.pop('phone_number', None)
#                 data.pop('phone_number_display', None)
#                 data.pop('phone_operator', None)
        
#         return data
    
#     def validate(self, attrs):
#         """Validate user update with enhanced rules"""
#         instance = self.instance
        
#         if not instance:
#             return attrs
        
#         user_type = instance.user_type
        
#         # Client validation rules
#         if user_type == "client":
#             if 'email' in attrs and attrs['email']:
#                 raise serializers.ValidationError({
#                     "email": "Clients should not have email"
#                 })
            
#             if 'connection_type' in attrs and attrs['connection_type'] not in ['hotspot', 'pppoe']:
#                 raise serializers.ValidationError({
#                     "connection_type": "Invalid connection type for client"
#                 })
            
#             # PPPoE clients require name
#             if instance.connection_type == 'pppoe' and 'name' in attrs and not attrs['name']:
#                 raise serializers.ValidationError({
#                     "name": "Name is required for PPPoE clients"
#                 })
        
#         # Admin validation rules
#         else:
#             if 'email' in attrs and not attrs['email']:
#                 raise serializers.ValidationError({
#                     "email": "Email is required for admins"
#                 })
#             if 'name' in attrs and not attrs['name']:
#                 raise serializers.ValidationError({
#                     "name": "Name is required for admins"
#                 })
        
#         # Phone number validation
#         if 'phone_number' in attrs:
#             phone = attrs['phone_number']
#             if not ValidationAlgorithms.is_valid_phone_number(phone):
#                 raise serializers.ValidationError({
#                     "phone_number": "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
#                 })
            
#             normalized = ValidationAlgorithms.normalize_phone(phone)
#             if CachedFieldValidator.phone_number_exists(normalized):
#                 if not instance or instance.phone_number != normalized:
#                     raise serializers.ValidationError({
#                         "phone_number": "Phone number already exists"
#                     })
        
#         # PPPoE username validation
#         if 'pppoe_username' in attrs:
#             username = attrs['pppoe_username']
#             if username:
#                 username_validation = ValidationAlgorithms.validate_pppoe_username(username)
#                 if not username_validation['valid']:
#                     raise serializers.ValidationError({
#                         "pppoe_username": username_validation['message']
#                     })
                
#                 if CachedFieldValidator.pppoe_username_exists(username):
#                     if not instance or instance.pppoe_username != username:
#                         raise serializers.ValidationError({
#                             "pppoe_username": "PPPoE username already taken"
#                         })
        
#         return attrs
    
#     @transaction.atomic
#     def update(self, instance, validated_data):
#         """Update user with cache invalidation"""
#         old_email = instance.email
#         old_phone = str(instance.phone_number) if instance.phone_number else None
#         old_pppoe_username = instance.pppoe_username
        
#         # Normalize phone number if provided
#         if 'phone_number' in validated_data:
#             validated_data['phone_number'] = ValidationAlgorithms.normalize_phone(
#                 validated_data['phone_number']
#             )
        
#         # Update fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
        
#         instance.save()
        
#         # Invalidate caches
#         if 'email' in validated_data and validated_data['email'] != old_email:
#             CachedFieldValidator.invalidate_cache(email=old_email)
#             CachedFieldValidator.invalidate_cache(email=validated_data['email'])
        
#         if 'phone_number' in validated_data and str(validated_data['phone_number']) != old_phone:
#             CachedFieldValidator.invalidate_cache(phone_number=old_phone)
#             CachedFieldValidator.invalidate_cache(phone_number=validated_data['phone_number'])
        
#         if 'pppoe_username' in validated_data and validated_data['pppoe_username'] != old_pppoe_username:
#             CachedFieldValidator.invalidate_cache(pppoe_username=old_pppoe_username)
#             CachedFieldValidator.invalidate_cache(pppoe_username=validated_data['pppoe_username'])
        
#         return instance


# class UserMeSerializer(UserSerializer):
#     """Serializer for current user profile with enhanced data"""
    
#     class Meta(UserSerializer.Meta):
#         fields = UserSerializer.Meta.fields
    
#     def to_representation(self, instance):
#         """Use enhanced display fields with sensitive data for own profile"""
#         include_sensitive = True  # User can see their own sensitive data
#         return instance.get_display_fields(include_sensitive=include_sensitive)


# # ==================== AUTHENTICATION SERIALIZERS ====================
# class PPPoEAuthRequestSerializer(serializers.Serializer):
#     """Serializer for PPPoE authentication requests"""
#     username = serializers.CharField(max_length=50, required=True)
#     password = serializers.CharField(max_length=128, required=True)
    
#     class Meta:
#         fields = ['username', 'password']


# class PPPoEAuthResponseSerializer(serializers.Serializer):
#     """Serializer for PPPoE authentication responses"""
#     authenticated = serializers.BooleanField()
#     message = serializers.CharField()
#     access_token = serializers.CharField(required=False)
#     refresh_token = serializers.CharField(required=False)
#     user = serializers.DictField()
    
#     class Meta:
#         fields = ['authenticated', 'message', 'access_token', 'refresh_token', 'user']


# class AdminPPPoEStatsSerializer(serializers.Serializer):
#     """Serializer for admin PPPoE statistics"""
#     total_admin_pppoe_users = serializers.IntegerField()
#     active_admin_pppoe_sessions = serializers.IntegerField()
#     bandwidth_distribution = serializers.DictField()
#     priority_distribution = serializers.DictField()
#     recent_pppoe_logins = serializers.ListField()
    
#     class Meta:
#         fields = [
#             'total_admin_pppoe_users',
#             'active_admin_pppoe_sessions',
#             'bandwidth_distribution',
#             'priority_distribution',
#             'recent_pppoe_logins'
#         ]


# # ==================== PHONE VALIDATION SERIALIZERS ====================
# class PhoneValidationSerializer(serializers.Serializer):
#     """Serializer for phone validation with enhanced response"""
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
#     )
    
#     class Meta:
#         fields = ['phone_number']
    
#     def validate_phone_number(self, value):
#         """Validate phone number"""
#         if not ValidationAlgorithms.is_valid_phone_number(value):
#             raise serializers.ValidationError(
#                 "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
#             )
        
#         normalized = ValidationAlgorithms.normalize_phone(value)
        
#         # Check if phone exists
#         exists = CachedFieldValidator.phone_number_exists(normalized)
#         self.context['phone_exists'] = exists
#         self.context['normalized_phone'] = normalized
#         self.context['display_phone'] = ValidationAlgorithms.get_phone_display(value)
#         self.context['operator'] = PhoneValidation.get_operator(value)
        
#         return normalized
    
#     def to_representation(self, instance):
#         """Return enhanced validation result"""
#         return {
#             'phone_number': self.context.get('normalized_phone'),
#             'phone_number_display': self.context.get('display_phone'),
#             'operator': self.context.get('operator'),
#             'exists': self.context.get('phone_exists', False),
#             'is_valid': True,
#             'message': 'Phone number is valid'
#         }


# # ==================== UUID VALIDATION SERIALIZERS ====================
# class UUIDValidationSerializer(serializers.Serializer):
#     """Serializer for UUID validation"""
#     uuid = serializers.UUIDField(
#         required=True,
#         help_text="User UUID to validate"
#     )
    
#     class Meta:
#         fields = ['uuid']
    
#     def validate_uuid(self, value):
#         """Validate UUID"""
#         try:
#             user = UserAccount.get_user_by_uuid(str(value))
#             self.context['user_exists'] = user is not None
#             self.context['user'] = user
#             return value
#         except ValueError:
#             raise serializers.ValidationError("Invalid UUID format")
    
#     def to_representation(self, instance):
#         """Return validation result"""
#         user = self.context.get('user')
#         return {
#             'uuid': str(self.validated_data['uuid']),
#             'exists': self.context.get('user_exists', False),
#             'is_valid': True,
#             'user': user.get_display_fields() if user else None,
#             'message': 'UUID is valid' if self.context.get('user_exists') else 'User not found'
#         }


# # ==================== PPPOE CREDENTIAL UPDATE SERIALIZERS ====================
# class PPPoECredentialUpdateSerializer(serializers.Serializer):
#     """Serializer for updating PPPoE credentials"""
#     username = serializers.CharField(
#         max_length=50,
#         required=False,
#         help_text="New PPPoE username (optional)"
#     )
#     password = serializers.CharField(
#         max_length=128,
#         required=False,
#         write_only=True,
#         help_text="New PPPoE password (optional)"
#     )
#     send_sms = serializers.BooleanField(
#         default=True,
#         required=False,
#         help_text="Send updated credentials via SMS"
#     )
    
#     class Meta:
#         fields = ['username', 'password', 'send_sms']
    
#     def validate_username(self, value):
#         """Validate new PPPoE username"""
#         if value:
#             validation = ValidationAlgorithms.validate_pppoe_username(value)
#             if not validation['valid']:
#                 raise serializers.ValidationError(validation['message'])
#         return value
    
#     def validate_password(self, value):
#         """Validate new PPPoE password"""
#         if value:
#             password_check = ValidationAlgorithms.validate_password_strength(value)
#             if not password_check['valid']:
#                 raise serializers.ValidationError(password_check['message'])
#         return value
    
#     def validate(self, attrs):
#         """Ensure at least one field is provided"""
#         if not attrs.get('username') and not attrs.get('password'):
#             raise serializers.ValidationError(
#                 "At least one of 'username' or 'password' must be provided"
#             )
#         return attrs


# # ==================== BULK OPERATION SERIALIZERS ====================
# class BulkUserOperationSerializer(serializers.Serializer):
#     """Serializer for bulk user operations"""
#     user_ids = serializers.ListField(
#         child=serializers.UUIDField(),
#         required=True,
#         help_text="List of user UUIDs to operate on"
#     )
#     operation = serializers.ChoiceField(
#         choices=['activate', 'deactivate', 'reset_pppoe', 'send_credentials'],
#         required=True,
#         help_text="Operation to perform"
#     )
    
#     class Meta:
#         fields = ['user_ids', 'operation']
    
#     def validate_user_ids(self, value):
#         """Validate user IDs"""
#         if len(value) > 100:
#             raise serializers.ValidationError("Maximum 100 users per operation")
#         return value


# class BulkUserResponseSerializer(serializers.Serializer):
#     """Serializer for bulk operation response"""
#     operation = serializers.CharField()
#     total_users = serializers.IntegerField()
#     success_count = serializers.IntegerField()
#     failed_count = serializers.IntegerField()
#     failed_users = serializers.ListField(child=serializers.DictField())
    
#     class Meta:
#         fields = ['operation', 'total_users', 'success_count', 'failed_count', 'failed_users']
            








"""
AUTHENTICATION APP - Serializers for API endpoints
Handles data validation and serialization for authentication operations only
"""

from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.crypto import constant_time_compare
from typing import Dict, Any, Optional
import re
import logging

from authentication.models import (
    UserAccount, 
    PhoneValidation,
    IDGenerator
)

logger = logging.getLogger(__name__)


# ==================== VALIDATION UTILITIES ====================
class ValidationAlgorithms:
    """
    Pure validation utilities - no business logic
    Used by serializers for input validation
    """
    
    # Compiled regex for performance
    _EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    @classmethod
    def is_valid_email(cls, email: str) -> bool:
        """Validate email format"""
        if not email:
            return False
        return bool(cls._EMAIL_REGEX.match(email))
    
    @classmethod
    def is_valid_phone_number(cls, phone_number: str) -> bool:
        """Validate phone number format"""
        return PhoneValidation.is_valid_kenyan_phone(phone_number)
    
    @classmethod
    def normalize_phone(cls, phone_number: str) -> str:
        """Normalize phone to +254 format"""
        return PhoneValidation.normalize_kenyan_phone(phone_number)
    
    @classmethod
    def get_phone_display(cls, phone_number: str) -> str:
        """Get display format for phone"""
        return PhoneValidation.get_phone_display(phone_number)
    
    @classmethod
    def validate_pppoe_username(cls, username: str) -> Dict[str, Any]:
        """Validate PPPoE username format"""
        if not username:
            return {'valid': False, 'message': 'Username is required'}
        
        if len(username) < 3 or len(username) > 32:
            return {'valid': False, 'message': 'Username must be 3-32 characters'}
        
        if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
            return {'valid': False, 'message': 'Username can only contain letters, numbers, dots, dashes, and underscores'}
        
        return {'valid': True, 'message': 'Username is valid'}
    
    @classmethod
    def validate_password_strength(cls, password: str) -> Dict[str, Any]:
        """Validate password strength for PPPoE credentials"""
        if not password:
            return {'valid': False, 'message': 'Password is required'}
        
        checks = {
            'length': len(password) >= 8,
            'uppercase': any(c.isupper() for c in password),
            'lowercase': any(c.islower() for c in password),
            'digit': any(c.isdigit() for c in password),
        }
        
        valid = all(checks.values())
        
        return {
            'valid': valid,
            'checks': checks,
            'message': 'Password meets requirements' if valid else 'Password must be at least 8 characters with uppercase, lowercase, and digit'
        }


# ==================== AUTHENTICATED USER SERIALIZERS ====================
class AuthenticatedUserCreateSerializer(BaseUserCreateSerializer):
    """
    Serializer for creating authenticated users (staff/admin)
    Uses Djoser base with custom validation
    Note: Authenticated users don't have usernames
    """
    
    user_type = serializers.ChoiceField(
        choices=UserAccount.USER_TYPES[1:],  # Only staff/admin, not client
        default='staff',
        required=False
    )
    
    class Meta(BaseUserCreateSerializer.Meta):
        model = UserAccount
        fields = ['id', 'email', 'password', 'name', 'user_type']
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate authenticated user creation"""
        email = attrs.get('email')
        user_type = attrs.get('user_type', 'staff')
        
        # Validate email
        if not ValidationAlgorithms.is_valid_email(email):
            raise serializers.ValidationError({
                "email": "Invalid email format"
            })
        
        # Check if email exists
        if UserAccount.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": "Email already exists"
            })
        
        # Validate user type
        if user_type not in ['staff', 'admin']:
            raise serializers.ValidationError({
                "user_type": "Invalid user type for authenticated user"
            })
        
        return super().validate(attrs)
    
    def create(self, validated_data):
        """Create authenticated user using manager"""
        user_type = validated_data.pop('user_type', 'staff')
        
        return UserAccount.objects.create_authenticated_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name'),
            user_type=user_type
        )


# ==================== CLIENT USER SERIALIZERS ====================
class HotspotClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating hotspot clients
    Hotspot clients: phone only, no authentication required
    Username auto-generated from phone number
    """
    
    phone_number = serializers.CharField(
        max_length=20,
        required=True,
        write_only=True,
        help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
    )
    
    phone_number_display = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(read_only=True)
    
    class Meta:
        model = UserAccount
        fields = ['id', 'phone_number', 'phone_number_display', 'username']
        read_only_fields = ['id', 'username']
    
    def validate_phone_number(self, value):
        """Validate and normalize phone number"""
        if not ValidationAlgorithms.is_valid_phone_number(value):
            raise serializers.ValidationError(
                "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
            )
        
        normalized = ValidationAlgorithms.normalize_phone(value)
        
        # Check if phone already registered
        if UserAccount.objects.filter(phone_number=normalized).exists():
            raise serializers.ValidationError("Phone number already registered")
        
        return normalized
    
    def get_phone_number_display(self, obj):
        """Get display format for phone"""
        return obj.get_phone_display()
    
    @transaction.atomic
    def create(self, validated_data):
        """Create hotspot client"""
        try:
            user = UserAccount.objects.create_client_user(
                phone_number=validated_data['phone_number'],
                connection_type='hotspot'
            )
            
            logger.info(f"Created hotspot client: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Failed to create hotspot client: {e}")
            raise serializers.ValidationError(str(e))


class PPPoEClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating PPPoE clients
    PPPoE clients: name + phone, credentials auto-generated
    SMS sending handled by UserManagement app
    """
    
    phone_number = serializers.CharField(
        max_length=20,
        required=True,
        write_only=True,
        help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
    )
    
    name = serializers.CharField(
        max_length=255,
        required=True,
        write_only=True,
        help_text="Client's full name for PPPoE username generation"
    )
    
    phone_number_display = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(read_only=True)
    pppoe_username = serializers.CharField(read_only=True)
    pppoe_password = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'id', 'phone_number', 'name', 
            'phone_number_display', 'username', 'pppoe_username', 'pppoe_password'
        ]
        read_only_fields = ['id', 'username', 'pppoe_username', 'pppoe_password']
    
    def validate(self, data):
        """Validate PPPoE client creation"""
        phone_number = data['phone_number']
        
        if not ValidationAlgorithms.is_valid_phone_number(phone_number):
            raise serializers.ValidationError({
                'phone_number': 'Invalid phone number format'
            })
        
        normalized = ValidationAlgorithms.normalize_phone(phone_number)
        
        # Check if phone exists
        if UserAccount.objects.filter(phone_number=normalized).exists():
            raise serializers.ValidationError({
                'phone_number': 'Phone number already registered'
            })
        
        return data
    
    def get_phone_number_display(self, obj):
        """Get display format for phone"""
        return obj.get_phone_display()
    
    def get_pppoe_password(self, obj):
        """
        Get PPPoE password with access control
        Only authenticated users can see passwords
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.user_type in ['staff', 'admin']:
                return obj.get_pppoe_password_decrypted()
        return None
    
    @transaction.atomic
    def create(self, validated_data):
        """Create PPPoE client and generate credentials"""
        try:
            user = UserAccount.objects.create_client_user(
                phone_number=validated_data['phone_number'],
                client_name=validated_data['name'],
                connection_type='pppoe'
            )
            
            # Generate PPPoE credentials
            credentials = user.generate_pppoe_credentials()
            
            # Store credentials in context for UserManagement app to send SMS
            self.context['pppoe_credentials'] = credentials
            
            logger.info(f"Created PPPoE client: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Failed to create PPPoE client: {e}")
            raise serializers.ValidationError(str(e))


# ==================== USER SERIALIZERS ====================
class UserSerializer(serializers.ModelSerializer):
    """
    General user serializer for API responses
    Respects privacy based on user type and context
    """
    
    user_type_display = serializers.CharField(
        source='get_user_type_display',
        read_only=True
    )
    
    connection_type_display = serializers.CharField(
        source='get_connection_type_display',
        read_only=True
    )
    
    phone_number_display = serializers.SerializerMethodField()
    is_client = serializers.BooleanField(read_only=True)
    is_authenticated_user = serializers.BooleanField(read_only=True)
    is_pppoe_client = serializers.BooleanField(read_only=True)
    is_hotspot_client = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'id', 'username', 'email', 'name', 'phone_number', 'phone_number_display',
            'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
            'is_active', 'is_staff', 'date_joined', 'last_updated',
            'is_client', 'is_authenticated_user', 'is_pppoe_client', 'is_hotspot_client',
            'pppoe_username', 'pppoe_active', 'pppoe_credentials_generated', 'pppoe_credentials_generated_at'
        ]
        read_only_fields = [
            'id', 'username', 'is_staff', 'date_joined', 'last_updated',
            'is_client', 'is_authenticated_user'
        ]
    
    def get_phone_number_display(self, obj):
        """Get display format for phone"""
        return obj.get_phone_display()
    
    def to_representation(self, instance):
        """Custom representation based on user type and permissions"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Client users: hide email
        if instance.is_client:
            data.pop('email', None)
            data.pop('is_staff', None)
        
        # Authenticated users: hide client-specific fields
        else:
            data.pop('phone_number', None)
            data.pop('phone_number_display', None)
            data.pop('connection_type', None)
            data.pop('pppoe_username', None)
            data.pop('pppoe_active', None)
        
        return data


class UserMeSerializer(UserSerializer):
    """
    Serializer for current user's own profile
    Includes all relevant data for the user themselves
    """
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields
    
    def to_representation(self, instance):
        """Include appropriate data for own profile"""
        return instance.to_dict(include_sensitive=(instance == self.context.get('request').user))


# ==================== AUTHENTICATION SERIALIZERS ====================
class PPPoEAuthSerializer(serializers.Serializer):
    """
    Serializer for PPPoE authentication
    Used by routers to authenticate PPPoE connections
    """
    
    username = serializers.CharField(max_length=50, required=True)
    password = serializers.CharField(max_length=128, required=True)
    
    class Meta:
        fields = ['username', 'password']
    
    def validate(self, data):
        """Validate PPPoE credentials with constant-time comparison"""
        username = data['username']
        password = data['password']
        
        user = UserAccount.get_pppoe_client_by_username(username)
        
        if not user:
            # Use constant-time dummy verification to prevent timing attacks
            dummy_password = "dummy_hash_for_timing_attack_prevention"
            constant_time_compare(password, dummy_password)
            raise serializers.ValidationError("Invalid credentials")
        
        # Verify password with constant-time comparison
        if not user.verify_pppoe_password(password):
            raise serializers.ValidationError("Invalid credentials")
        
        self.context['user'] = user
        return data


# ==================== VALIDATION SERIALIZERS ====================
class PhoneValidationSerializer(serializers.Serializer):
    """
    Serializer for phone validation endpoints
    Used by frontend to validate phone numbers
    """
    
    phone_number = serializers.CharField(
        max_length=20,
        required=True,
        help_text="Phone number to validate"
    )
    
    class Meta:
        fields = ['phone_number']
    
    def validate_phone_number(self, value):
        """Validate phone number format and existence"""
        if not ValidationAlgorithms.is_valid_phone_number(value):
            raise serializers.ValidationError("Invalid phone number format")
        
        normalized = ValidationAlgorithms.normalize_phone(value)
        
        # Check if phone exists in system
        exists = UserAccount.objects.filter(
            phone_number=normalized,
            is_active=True
        ).exists()
        
        self.context['normalized_phone'] = normalized
        self.context['phone_exists'] = exists
        self.context['display_phone'] = ValidationAlgorithms.get_phone_display(value)
        
        return normalized
    
    def to_representation(self, instance):
        """Return comprehensive validation result"""
        return {
            'phone_number': self.context.get('normalized_phone'),
            'phone_number_display': self.context.get('display_phone'),
            'exists': self.context.get('phone_exists', False),
            'is_valid': True,
            'message': 'Phone number is valid'
        }


class UUIDValidationSerializer(serializers.Serializer):
    """
    Serializer for UUID validation endpoints
    """
    
    uuid = serializers.UUIDField(
        required=True,
        help_text="User UUID to validate"
    )
    
    class Meta:
        fields = ['uuid']
    
    def validate_uuid(self, value):
        """Validate UUID format and existence"""
        try:
            user = UserAccount.objects.get(id=value, is_active=True)
            self.context['user_exists'] = True
            self.context['user'] = user
            return value
        except UserAccount.DoesNotExist:
            self.context['user_exists'] = False
            self.context['user'] = None
            return value
        except ValueError:
            raise serializers.ValidationError("Invalid UUID format")
    
    def to_representation(self, instance):
        """Return validation result with user data if exists"""
        user = self.context.get('user')
        return {
            'uuid': str(self.validated_data['uuid']),
            'exists': self.context.get('user_exists', False),
            'is_valid': True,
            'user': user.to_dict() if user else None,
            'message': 'User found' if user else 'User not found'
        }


# ==================== PPPOE CREDENTIAL UPDATE SERIALIZERS ====================
class PPPoECredentialUpdateSerializer(serializers.Serializer):
    """
    Serializer for PPPoE clients to update their credentials
    Used in PPPoE landing page after authentication
    """
    
    username = serializers.CharField(
        max_length=50,
        required=False,
        help_text="New PPPoE username (optional)"
    )
    
    password = serializers.CharField(
        max_length=128,
        required=False,
        write_only=True,
        help_text="New PPPoE password (optional)"
    )
    
    class Meta:
        fields = ['username', 'password']
    
    def validate_username(self, value):
        """Validate new PPPoE username"""
        if value:
            validation = ValidationAlgorithms.validate_pppoe_username(value)
            if not validation['valid']:
                raise serializers.ValidationError(validation['message'])
        return value
    
    def validate_password(self, value):
        """Validate new PPPoE password"""
        if value:
            password_check = ValidationAlgorithms.validate_password_strength(value)
            if not password_check['valid']:
                raise serializers.ValidationError(password_check['message'])
        return value
    
    def validate(self, attrs):
        """Ensure at least one field is provided"""
        if not attrs.get('username') and not attrs.get('password'):
            raise serializers.ValidationError(
                "At least one of 'username' or 'password' must be provided"
            )
        return attrs
