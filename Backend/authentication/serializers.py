

# """
# AUTHENTICATION APP - Serializers for API endpoints
# Handles data validation and serialization for authentication operations only
# """

# from rest_framework import serializers
# from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
# from django.db import transaction
# from django.core.exceptions import ValidationError
# from django.utils.crypto import constant_time_compare
# from typing import Dict, Any, Optional
# import re
# import logging

# from authentication.models import (
#     UserAccount, 
#     PhoneValidation,
#     IDGenerator
# )

# logger = logging.getLogger(__name__)


# # ==================== VALIDATION UTILITIES ====================
# class ValidationAlgorithms:
#     """
#     Pure validation utilities - no business logic
#     Used by serializers for input validation
#     """
    
#     # Compiled regex for performance
#     _EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
#     @classmethod
#     def is_valid_email(cls, email: str) -> bool:
#         """Validate email format"""
#         if not email:
#             return False
#         return bool(cls._EMAIL_REGEX.match(email))
    
#     @classmethod
#     def is_valid_phone_number(cls, phone_number: str) -> bool:
#         """Validate phone number format"""
#         return PhoneValidation.is_valid_kenyan_phone(phone_number)
    
#     @classmethod
#     def normalize_phone(cls, phone_number: str) -> str:
#         """Normalize phone to +254 format"""
#         return PhoneValidation.normalize_kenyan_phone(phone_number)
    
#     @classmethod
#     def get_phone_display(cls, phone_number: str) -> str:
#         """Get display format for phone"""
#         return PhoneValidation.get_phone_display(phone_number)
    
#     @classmethod
#     def validate_pppoe_username(cls, username: str) -> Dict[str, Any]:
#         """Validate PPPoE username format"""
#         if not username:
#             return {'valid': False, 'message': 'Username is required'}
        
#         if len(username) < 3 or len(username) > 32:
#             return {'valid': False, 'message': 'Username must be 3-32 characters'}
        
#         if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
#             return {'valid': False, 'message': 'Username can only contain letters, numbers, dots, dashes, and underscores'}
        
#         return {'valid': True, 'message': 'Username is valid'}
    
#     @classmethod
#     def validate_password_strength(cls, password: str) -> Dict[str, Any]:
#         """Validate password strength for PPPoE credentials"""
#         if not password:
#             return {'valid': False, 'message': 'Password is required'}
        
#         checks = {
#             'length': len(password) >= 8,
#             'uppercase': any(c.isupper() for c in password),
#             'lowercase': any(c.islower() for c in password),
#             'digit': any(c.isdigit() for c in password),
#         }
        
#         valid = all(checks.values())
        
#         return {
#             'valid': valid,
#             'checks': checks,
#             'message': 'Password meets requirements' if valid else 'Password must be at least 8 characters with uppercase, lowercase, and digit'
#         }


# # ==================== AUTHENTICATED USER SERIALIZERS ====================
# class AuthenticatedUserCreateSerializer(BaseUserCreateSerializer):
#     """
#     Serializer for creating authenticated users (staff/admin)
#     Uses Djoser base with custom validation
#     Note: Authenticated users don't have usernames
#     """
    
#     user_type = serializers.ChoiceField(
#         choices=UserAccount.USER_TYPES[1:],  # Only staff/admin, not client
#         default='staff',
#         required=False
#     )
    
#     class Meta(BaseUserCreateSerializer.Meta):
#         model = UserAccount
#         fields = ['id', 'email', 'password', 'name', 'user_type']
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'name': {'required': True},
#         }
    
#     def validate(self, attrs):
#         """Validate authenticated user creation"""
#         email = attrs.get('email')
#         user_type = attrs.get('user_type', 'staff')
        
#         # Validate email
#         if not ValidationAlgorithms.is_valid_email(email):
#             raise serializers.ValidationError({
#                 "email": "Invalid email format"
#             })
        
#         # Check if email exists
#         if UserAccount.objects.filter(email=email).exists():
#             raise serializers.ValidationError({
#                 "email": "Email already exists"
#             })
        
#         # Validate user type
#         if user_type not in ['staff', 'admin']:
#             raise serializers.ValidationError({
#                 "user_type": "Invalid user type for authenticated user"
#             })
        
#         return super().validate(attrs)
    
#     def create(self, validated_data):
#         """Create authenticated user using manager"""
#         user_type = validated_data.pop('user_type', 'staff')
        
#         return UserAccount.objects.create_authenticated_user(
#             email=validated_data['email'],
#             password=validated_data['password'],
#             name=validated_data.get('name'),
#             user_type=user_type
#         )


# # ==================== CLIENT USER SERIALIZERS ====================
# class HotspotClientCreateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for creating hotspot clients
#     Hotspot clients: phone only, no authentication required
#     Username auto-generated from phone number
#     """
    
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         write_only=True,
#         help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
#     )
    
#     phone_number_display = serializers.SerializerMethodField(read_only=True)
#     username = serializers.CharField(read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = ['id', 'phone_number', 'phone_number_display', 'username']
#         read_only_fields = ['id', 'username']
    
#     def validate_phone_number(self, value):
#         """Validate and normalize phone number"""
#         if not ValidationAlgorithms.is_valid_phone_number(value):
#             raise serializers.ValidationError(
#                 "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
#             )
        
#         normalized = ValidationAlgorithms.normalize_phone(value)
        
#         # Check if phone already registered
#         if UserAccount.objects.filter(phone_number=normalized).exists():
#             raise serializers.ValidationError("Phone number already registered")
        
#         return normalized
    
#     def get_phone_number_display(self, obj):
#         """Get display format for phone"""
#         return obj.get_phone_display()
    
#     @transaction.atomic
#     def create(self, validated_data):
#         """Create hotspot client"""
#         try:
#             user = UserAccount.objects.create_client_user(
#                 phone_number=validated_data['phone_number'],
#                 connection_type='hotspot'
#             )
            
#             logger.info(f"Created hotspot client: {user.username}")
#             return user
            
#         except Exception as e:
#             logger.error(f"Failed to create hotspot client: {e}")
#             raise serializers.ValidationError(str(e))


# class PPPoEClientCreateSerializer(serializers.ModelSerializer):
#     """
#     Serializer for creating PPPoE clients
#     PPPoE clients: name + phone, credentials auto-generated
#     SMS sending handled by UserManagement app
#     """
    
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         write_only=True,
#         help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
#     )
    
#     name = serializers.CharField(
#         max_length=255,
#         required=True,
#         write_only=True,
#         help_text="Client's full name for PPPoE username generation"
#     )
    
#     phone_number_display = serializers.SerializerMethodField(read_only=True)
#     username = serializers.CharField(read_only=True)
#     pppoe_username = serializers.CharField(read_only=True)
#     pppoe_password = serializers.SerializerMethodField(read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'phone_number', 'name', 
#             'phone_number_display', 'username', 'pppoe_username', 'pppoe_password'
#         ]
#         read_only_fields = ['id', 'username', 'pppoe_username', 'pppoe_password']
    
#     def validate(self, data):
#         """Validate PPPoE client creation"""
#         phone_number = data['phone_number']
        
#         if not ValidationAlgorithms.is_valid_phone_number(phone_number):
#             raise serializers.ValidationError({
#                 'phone_number': 'Invalid phone number format'
#             })
        
#         normalized = ValidationAlgorithms.normalize_phone(phone_number)
        
#         # Check if phone exists
#         if UserAccount.objects.filter(phone_number=normalized).exists():
#             raise serializers.ValidationError({
#                 'phone_number': 'Phone number already registered'
#             })
        
#         return data
    
#     def get_phone_number_display(self, obj):
#         """Get display format for phone"""
#         return obj.get_phone_display()
    
#     def get_pppoe_password(self, obj):
#         """
#         Get PPPoE password with access control
#         Only authenticated users can see passwords
#         """
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             if request.user.user_type in ['staff', 'admin']:
#                 return obj.get_pppoe_password_decrypted()
#         return None
    
#     @transaction.atomic
#     def create(self, validated_data):
#         """Create PPPoE client and generate credentials"""
#         try:
#             user = UserAccount.objects.create_client_user(
#                 phone_number=validated_data['phone_number'],
#                 client_name=validated_data['name'],
#                 connection_type='pppoe'
#             )
            
#             # Generate PPPoE credentials
#             credentials = user.generate_pppoe_credentials()
            
#             # Store credentials in context for UserManagement app to send SMS
#             self.context['pppoe_credentials'] = credentials
            
#             logger.info(f"Created PPPoE client: {user.username}")
#             return user
            
#         except Exception as e:
#             logger.error(f"Failed to create PPPoE client: {e}")
#             raise serializers.ValidationError(str(e))


# # ==================== USER SERIALIZERS ====================
# class UserSerializer(serializers.ModelSerializer):
#     """
#     General user serializer for API responses
#     Respects privacy based on user type and context
#     """
    
#     user_type_display = serializers.CharField(
#         source='get_user_type_display',
#         read_only=True
#     )
    
#     connection_type_display = serializers.CharField(
#         source='get_connection_type_display',
#         read_only=True
#     )
    
#     phone_number_display = serializers.SerializerMethodField()
#     is_client = serializers.BooleanField(read_only=True)
#     is_authenticated_user = serializers.BooleanField(read_only=True)
#     is_pppoe_client = serializers.BooleanField(read_only=True)
#     is_hotspot_client = serializers.BooleanField(read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'username', 'email', 'name', 'phone_number', 'phone_number_display',
#             'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
#             'is_active', 'is_staff', 'date_joined', 'last_updated',
#             'is_client', 'is_authenticated_user', 'is_pppoe_client', 'is_hotspot_client',
#             'pppoe_username', 'pppoe_active', 'pppoe_credentials_generated', 'pppoe_credentials_generated_at'
#         ]
#         read_only_fields = [
#             'id', 'username', 'is_staff', 'date_joined', 'last_updated',
#             'is_client', 'is_authenticated_user'
#         ]
    
#     def get_phone_number_display(self, obj):
#         """Get display format for phone"""
#         return obj.get_phone_display()
    
#     def to_representation(self, instance):
#         """Custom representation based on user type and permissions"""
#         data = super().to_representation(instance)
#         request = self.context.get('request')
        
#         # Client users: hide email
#         if instance.is_client:
#             data.pop('email', None)
#             data.pop('is_staff', None)
        
#         # Authenticated users: hide client-specific fields
#         else:
#             data.pop('phone_number', None)
#             data.pop('phone_number_display', None)
#             data.pop('connection_type', None)
#             data.pop('pppoe_username', None)
#             data.pop('pppoe_active', None)
        
#         return data


# class UserMeSerializer(UserSerializer):
#     """
#     Serializer for current user's own profile
#     Includes all relevant data for the user themselves
#     """
    
#     class Meta(UserSerializer.Meta):
#         fields = UserSerializer.Meta.fields
    
#     def to_representation(self, instance):
#         """Include appropriate data for own profile"""
#         return instance.to_dict(include_sensitive=(instance == self.context.get('request').user))


# # ==================== AUTHENTICATION SERIALIZERS ====================
# class PPPoEAuthSerializer(serializers.Serializer):
#     """
#     Serializer for PPPoE authentication
#     Used by routers to authenticate PPPoE connections
#     """
    
#     username = serializers.CharField(max_length=50, required=True)
#     password = serializers.CharField(max_length=128, required=True)
    
#     class Meta:
#         fields = ['username', 'password']
    
#     def validate(self, data):
#         """Validate PPPoE credentials with constant-time comparison"""
#         username = data['username']
#         password = data['password']
        
#         user = UserAccount.get_pppoe_client_by_username(username)
        
#         if not user:
#             # Use constant-time dummy verification to prevent timing attacks
#             dummy_password = "dummy_hash_for_timing_attack_prevention"
#             constant_time_compare(password, dummy_password)
#             raise serializers.ValidationError("Invalid credentials")
        
#         # Verify password with constant-time comparison
#         if not user.verify_pppoe_password(password):
#             raise serializers.ValidationError("Invalid credentials")
        
#         self.context['user'] = user
#         return data


# # ==================== VALIDATION SERIALIZERS ====================
# class PhoneValidationSerializer(serializers.Serializer):
#     """
#     Serializer for phone validation endpoints
#     Used by frontend to validate phone numbers
#     """
    
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         help_text="Phone number to validate"
#     )
    
#     class Meta:
#         fields = ['phone_number']
    
#     def validate_phone_number(self, value):
#         """Validate phone number format and existence"""
#         if not ValidationAlgorithms.is_valid_phone_number(value):
#             raise serializers.ValidationError("Invalid phone number format")
        
#         normalized = ValidationAlgorithms.normalize_phone(value)
        
#         # Check if phone exists in system
#         exists = UserAccount.objects.filter(
#             phone_number=normalized,
#             is_active=True
#         ).exists()
        
#         self.context['normalized_phone'] = normalized
#         self.context['phone_exists'] = exists
#         self.context['display_phone'] = ValidationAlgorithms.get_phone_display(value)
        
#         return normalized
    
#     def to_representation(self, instance):
#         """Return comprehensive validation result"""
#         return {
#             'phone_number': self.context.get('normalized_phone'),
#             'phone_number_display': self.context.get('display_phone'),
#             'exists': self.context.get('phone_exists', False),
#             'is_valid': True,
#             'message': 'Phone number is valid'
#         }


# class UUIDValidationSerializer(serializers.Serializer):
#     """
#     Serializer for UUID validation endpoints
#     """
    
#     uuid = serializers.UUIDField(
#         required=True,
#         help_text="User UUID to validate"
#     )
    
#     class Meta:
#         fields = ['uuid']
    
#     def validate_uuid(self, value):
#         """Validate UUID format and existence"""
#         try:
#             user = UserAccount.objects.get(id=value, is_active=True)
#             self.context['user_exists'] = True
#             self.context['user'] = user
#             return value
#         except UserAccount.DoesNotExist:
#             self.context['user_exists'] = False
#             self.context['user'] = None
#             return value
#         except ValueError:
#             raise serializers.ValidationError("Invalid UUID format")
    
#     def to_representation(self, instance):
#         """Return validation result with user data if exists"""
#         user = self.context.get('user')
#         return {
#             'uuid': str(self.validated_data['uuid']),
#             'exists': self.context.get('user_exists', False),
#             'is_valid': True,
#             'user': user.to_dict() if user else None,
#             'message': 'User found' if user else 'User not found'
#         }


# # ==================== PPPOE CREDENTIAL UPDATE SERIALIZERS ====================
# class PPPoECredentialUpdateSerializer(serializers.Serializer):
#     """
#     Serializer for PPPoE clients to update their credentials
#     Used in PPPoE landing page after authentication
#     """
    
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
    
#     class Meta:
#         fields = ['username', 'password']
    
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











"""
AUTHENTICATION APP - Serializers for API endpoints
Handles data validation and serialization for authentication operations only
Supports both admin dashboard and captive portal workflows
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


# ==================== ADMIN CLIENT CREATION SERIALIZERS ====================
class HotspotClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating hotspot clients via admin dashboard
    Hotspot clients only need phone number, username auto-generated
    Requires authentication (admin/staff only)
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
        fields = ['id', 'phone_number', 'phone_number_display', 'username', 'source']
        read_only_fields = ['id', 'username', 'source']
    
    def validate_phone_number(self, value):
        """Validate and normalize phone number"""
        if not ValidationAlgorithms.is_valid_phone_number(value):
            raise serializers.ValidationError(
                "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
            )
        
        normalized = ValidationAlgorithms.normalize_phone(value)
        
        # Check if phone already exists and is active
        existing = UserAccount.objects.filter(phone_number=normalized, is_active=True).first()
        if existing:
            raise serializers.ValidationError("Phone number already registered with an active account")
        
        return normalized
    
    def get_phone_number_display(self, obj):
        """Get display format for phone"""
        return obj.get_phone_display()
    
    @transaction.atomic
    def create(self, validated_data):
        """Create hotspot client via admin dashboard"""
        try:
            user = UserAccount.objects.create_client_user(
                phone_number=validated_data['phone_number'],
                connection_type='hotspot',
                source='admin_dashboard'
            )
            
            logger.info(f"Created hotspot client via admin: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Failed to create hotspot client via admin: {e}")
            raise serializers.ValidationError(str(e))


class PPPoEClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating PPPoE clients via admin dashboard
    PPPoE clients need name + phone, credentials auto-generated
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
            'phone_number_display', 'username', 'pppoe_username', 'pppoe_password', 'source'
        ]
        read_only_fields = ['id', 'username', 'pppoe_username', 'pppoe_password', 'source']
    
    def validate(self, data):
        """Validate PPPoE client creation"""
        phone_number = data['phone_number']
        
        if not ValidationAlgorithms.is_valid_phone_number(phone_number):
            raise serializers.ValidationError({
                'phone_number': 'Invalid phone number format'
            })
        
        normalized = ValidationAlgorithms.normalize_phone(phone_number)
        
        # Check if phone exists with active account
        existing = UserAccount.objects.filter(phone_number=normalized, is_active=True).first()
        if existing:
            raise serializers.ValidationError({
                'phone_number': 'Phone number already registered with an active account'
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
        """Create PPPoE client and generate credentials via admin dashboard"""
        try:
            user = UserAccount.objects.create_client_user(
                phone_number=validated_data['phone_number'],
                client_name=validated_data['name'],
                connection_type='pppoe',
                source='admin_dashboard'
            )
            
            # Generate PPPoE credentials
            credentials = user.generate_pppoe_credentials()
            
            # Store credentials in context for UserManagement app to send SMS
            self.context['pppoe_credentials'] = credentials
            
            logger.info(f"Created PPPoE client via admin: {user.username}")
            return user
            
        except Exception as e:
            logger.error(f"Failed to create PPPoE client via admin: {e}")
            raise serializers.ValidationError(str(e))


# ==================== CAPTIVE PORTAL SERIALIZERS ====================
class CaptivePortalRegistrationSerializer(serializers.Serializer):
    """
    Serializer for captive portal registration (public endpoint)
    Used when user enters phone on hotspot landing page
    """
    
    phone_number = serializers.CharField(
        max_length=20,
        required=True,
        help_text="Phone number in 07XXXXXXXX or 01XXXXXXXX format"
    )
    
    class Meta:
        fields = ['phone_number']
    
    def validate_phone_number(self, value):
        """Validate and normalize phone number"""
        if not ValidationAlgorithms.is_valid_phone_number(value):
            raise serializers.ValidationError(
                "Invalid phone number format. Must be 07XXXXXXXX or 01XXXXXXXX"
            )
        
        normalized = ValidationAlgorithms.normalize_phone(value)
        return normalized
    
    @transaction.atomic
    def create(self, validated_data):
        """Get or create client user via captive portal"""
        try:
            phone_number = validated_data['phone_number']
            
            # Get or create user
            user, created = UserAccount.get_or_create_client_by_phone(
                phone_number=phone_number,
                connection_type='hotspot',
                source='captive_portal'
            )
            
            logger.info(f"Captive portal registration: user={user.username}, created={created}")
            
            # Store creation status in context
            self.context['user_created'] = created
            
            return user
            
        except Exception as e:
            logger.error(f"Captive portal registration failed: {e}")
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
    
    source_display = serializers.CharField(
        source='get_source_display',
        read_only=True
    )
    
    phone_number_display = serializers.SerializerMethodField()
    is_client = serializers.BooleanField(read_only=True)
    is_authenticated_user = serializers.BooleanField(read_only=True)
    is_pppoe_client = serializers.BooleanField(read_only=True)
    is_hotspot_client = serializers.BooleanField(read_only=True)
    is_captive_portal_user = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'id', 'username', 'email', 'name', 'phone_number', 'phone_number_display',
            'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
            'source', 'source_display', 'is_active', 'is_staff', 'date_joined', 'last_updated',
            'is_client', 'is_authenticated_user', 'is_pppoe_client', 'is_hotspot_client',
            'is_captive_portal_user', 'pppoe_username', 'pppoe_active', 
            'pppoe_credentials_generated', 'pppoe_credentials_generated_at'
        ]
        read_only_fields = [
            'id', 'username', 'is_staff', 'date_joined', 'last_updated',
            'is_client', 'is_authenticated_user', 'is_pppoe_client', 
            'is_hotspot_client', 'is_captive_portal_user'
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