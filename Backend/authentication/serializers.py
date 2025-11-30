


# from rest_framework import serializers
# from phonenumber_field.serializerfields import PhoneNumberField
# from .models import UserAccount, CredentialEncryption, IDGenerator
# from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
# from typing import Dict, Any, Optional
# from django.core.cache import cache
# from django.db import transaction
# import re

# class ValidationAlgorithms:
#     @staticmethod
#     def is_valid_email(email: str) -> bool:
#         if not email or not isinstance(email, str):
#             return False
#         email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
#         return bool(re.match(email_regex, email))
    
#     @staticmethod
#     def is_valid_phone_number(phone_number: str) -> bool:
#         if not phone_number:
#             return False
#         clean_number = re.sub(r'[\s\-\(\)\.]', '', str(phone_number))
#         return len(clean_number) >= 10 and clean_number.isdigit()
    
#     @staticmethod
#     def validate_password_strength(password: str) -> Dict[str, bool]:
#         if not password:
#             return {'valid': False, 'message': 'Password is required'}
        
#         checks = {
#             'length': len(password) >= 8,
#             'uppercase': any(c.isupper() for c in password),
#             'lowercase': any(c.islower() for c in password),
#             'digit': any(c.isdigit() for c in password),
#             'special': any(not c.isalnum() for c in password),
#         }
        
#         strength = sum(checks.values())
#         valid = strength >= 4
        
#         return {
#             'valid': valid,
#             'strength': strength,
#             'checks': checks,
#             'message': 'Password meets requirements' if valid else 'Password too weak'
#         }

# class CachedFieldValidator:
#     _email_cache = set()
#     _phone_cache = set()
#     _pppoe_username_cache = set()
    
#     @classmethod
#     def email_exists(cls, email: str) -> bool:
#         if email in cls._email_cache:
#             return True
#         exists = UserAccount.objects.filter(email=email).exists()
#         if exists:
#             cls._email_cache.add(email)
#         return exists
    
#     @classmethod
#     def phone_number_exists(cls, phone_number: str) -> bool:
#         phone_str = str(phone_number)
#         if phone_str in cls._phone_cache:
#             return True
#         exists = UserAccount.objects.filter(phone_number=phone_number).exists()
#         if exists:
#             cls._phone_cache.add(phone_str)
#         return exists
    
#     @classmethod
#     def pppoe_username_exists(cls, username: str) -> bool:
#         if username in cls._pppoe_username_cache:
#             return True
#         exists = UserAccount.objects.filter(pppoe_username=username).exists()
#         if exists:
#             cls._pppoe_username_cache.add(username)
#         return exists
    
#     @classmethod
#     def invalidate_cache(cls, email: Optional[str] = None, phone_number: Optional[str] = None, pppoe_username: Optional[str] = None):
#         if email and email in cls._email_cache:
#             cls._email_cache.remove(email)
#         if phone_number and str(phone_number) in cls._phone_cache:
#             cls._phone_cache.remove(str(phone_number))
#         if pppoe_username and pppoe_username in cls._pppoe_username_cache:
#             cls._pppoe_username_cache.remove(pppoe_username)

# class HotspotClientCreateSerializer(serializers.ModelSerializer):
#     phone_number = PhoneNumberField(required=True)

#     class Meta:
#         model = UserAccount
#         fields = ['id', 'phone_number']  
        
#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         phone_number = attrs.get('phone_number')
        
#         if CachedFieldValidator.phone_number_exists(phone_number):
#             raise serializers.ValidationError({
#                 "phone_number": "A client with this phone number already exists."
#             })
        
#         if not ValidationAlgorithms.is_valid_phone_number(phone_number):
#             raise serializers.ValidationError({
#                 "phone_number": "Invalid phone number format."
#             })
        
#         attrs['user_type'] = 'client'
#         attrs['connection_type'] = 'hotspot'
#         return attrs

#     @transaction.atomic
#     def create(self, validated_data: Dict[str, Any]) -> UserAccount:
#         user = UserAccount.objects.create_hotspot_client(**validated_data)
#         CachedFieldValidator.invalidate_cache(phone_number=validated_data['phone_number'])
#         return user

# class PPPoEClientCreateSerializer(serializers.ModelSerializer):
#     phone_number = PhoneNumberField(required=True)
#     generate_credentials = serializers.BooleanField(default=True, write_only=True)

#     class Meta:
#         model = UserAccount
#         fields = ['id', 'phone_number', 'generate_credentials']
        
#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         phone_number = attrs.get('phone_number')
        
#         if CachedFieldValidator.phone_number_exists(phone_number):
#             raise serializers.ValidationError({
#                 "phone_number": "A client with this phone number already exists."
#             })
        
#         if not ValidationAlgorithms.is_valid_phone_number(phone_number):
#             raise serializers.ValidationError({
#                 "phone_number": "Invalid phone number format."
#             })
        
#         attrs['user_type'] = 'client'
#         attrs['connection_type'] = 'pppoe'
#         return attrs

#     @transaction.atomic
#     def create(self, validated_data: Dict[str, Any]) -> UserAccount:
#         generate_credentials = validated_data.pop('generate_credentials', True)
#         user = UserAccount.objects.create_pppoe_client(**validated_data)
        
#         if not generate_credentials:
#             user.pppoe_username = None
#             user.pppoe_password = None
#             user.save()
        
#         CachedFieldValidator.invalidate_cache(phone_number=validated_data['phone_number'])
#         return user

# class PPPoECredentialSerializer(serializers.ModelSerializer):
#     pppoe_password_plain = serializers.CharField(read_only=True)
    
#     class Meta:
#         model = UserAccount
#         fields = ['pppoe_username', 'pppoe_password_plain', 'pppoe_active', 'last_pppoe_login', 'pppoe_ip_address']
#         read_only_fields = ['pppoe_active', 'last_pppoe_login', 'pppoe_ip_address']

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         # Only show plain password when explicitly requested (e.g., during creation)
#         if 'pppoe_password_plain' in data and not self.context.get('show_password', False):
#             data['pppoe_password_plain'] = '********'
#         return data

# class DjoserUserCreateSerializer(BaseUserCreateSerializer):
#     user_type = serializers.ChoiceField(
#         choices=UserAccount.USER_TYPES, 
#         default='admin',
#         required=False
#     )
    
#     class Meta(BaseUserCreateSerializer.Meta):
#         model = UserAccount
#         fields = ['id', 'name', 'email', 'password', 'user_type']
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'name': {'required': True},
#             'user_type': {'read_only': False},
#         }

#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         user_type = attrs.get('user_type', 'admin')
#         email = attrs.get('email')
        
#         if user_type not in ['admin', 'superadmin']:
#             raise serializers.ValidationError({
#                 "user_type": "Only admin or superadmin users can be created via this endpoint"
#             })
        
#         if email and CachedFieldValidator.email_exists(email):
#             raise serializers.ValidationError({
#                 "email": "A user with this email already exists."
#             })
        
#         if email and not ValidationAlgorithms.is_valid_email(email):
#             raise serializers.ValidationError({
#                 "email": "Invalid email format."
#             })
        
#         password = attrs.get('password')
#         if password:
#             password_check = ValidationAlgorithms.validate_password_strength(password)
#             if not password_check['valid']:
#                 raise serializers.ValidationError({
#                     "password": password_check['message']
#                 })
        
#         return super().validate(attrs)

#     @transaction.atomic
#     def create(self, validated_data: Dict[str, Any]) -> UserAccount:
#         user = UserAccount.objects.create_user(**validated_data)
#         CachedFieldValidator.invalidate_cache(email=validated_data.get('email'))
#         return user

# class UserSerializer(serializers.ModelSerializer):
#     user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
#     connection_type_display = serializers.CharField(source='get_connection_type_display', read_only=True)
#     is_2fa_enabled = serializers.BooleanField(read_only=True)
#     is_admin = serializers.BooleanField(read_only=True)
#     is_super_admin = serializers.BooleanField(read_only=True)
#     is_pppoe_client = serializers.BooleanField(read_only=True)
#     is_hotspot_client = serializers.BooleanField(read_only=True)
#     last_updated = serializers.DateTimeField(read_only=True)
#     pppoe_credentials = PPPoECredentialSerializer(source='*', read_only=True)

#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
#             'is_active', 'is_staff', 'date_joined', 'is_2fa_enabled', 
#             'is_admin', 'is_super_admin', 'is_pppoe_client', 'is_hotspot_client',
#             'last_updated', 'pppoe_credentials'
#         ]
#         read_only_fields = ['is_staff', 'date_joined', 'username', 'is_2fa_enabled', 
#                           'is_admin', 'is_super_admin', 'last_updated']

#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         instance = self.instance
        
#         if not instance:
#             return attrs
        
#         user_type = instance.user_type
        
#         validation_rules = {
#             'client': [
#                 ('email', lambda x: x is None, "Clients must not have an email"),
#                 ('name', lambda x: x is None, "Clients must not have a name"),
#                 ('phone_number', lambda x: x is not None, "Clients must have a phone number"),
#             ],
#             'admin': [
#                 ('phone_number', lambda x: x is None, "Admins must not have a phone number"),
#                 ('email', lambda x: x is not None, "Admins must have an email"),
#                 ('name', lambda x: x is not None, "Admins must have a name"),
#             ]
#         }
        
#         for field_name, validation_func, error_message in validation_rules.get(user_type, []):
#             if field_name in attrs and not validation_func(attrs[field_name]):
#                 raise serializers.ValidationError({field_name: error_message})
        
#         if 'user_type' in attrs and attrs['user_type'] not in ['admin', 'superadmin']:
#             raise serializers.ValidationError("Invalid user type for admin user")
        
#         return attrs

#     @transaction.atomic
#     def update(self, instance: UserAccount, validated_data: Dict[str, Any]) -> UserAccount:
#         old_email = instance.email
#         old_phone = instance.phone_number
#         old_pppoe_username = instance.pppoe_username
        
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
        
#         instance.save()
        
#         if 'email' in validated_data and validated_data['email'] != old_email:
#             CachedFieldValidator.invalidate_cache(email=old_email)
        
#         if 'phone_number' in validated_data and validated_data['phone_number'] != old_phone:
#             CachedFieldValidator.invalidate_cache(phone_number=old_phone)
        
#         if 'pppoe_username' in validated_data and validated_data['pppoe_username'] != old_pppoe_username:
#             CachedFieldValidator.invalidate_cache(pppoe_username=old_pppoe_username)
        
#         return instance

# class UserMeSerializer(UserSerializer):
#     class Meta(UserSerializer.Meta):
#         fields = [
#             'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
#             'is_active', 'is_staff', 'date_joined', 'is_2fa_enabled', 
#             'is_admin', 'is_super_admin', 'is_pppoe_client', 'is_hotspot_client',
#             'client_id', 'last_updated', 'pppoe_credentials'
#         ]
    
#     def to_representation(self, instance: UserAccount) -> Dict[str, Any]:
#         return instance.get_display_fields()











from rest_framework import serializers
from phonenumber_field.serializerfields import PhoneNumberField
from authentication.models import UserAccount, CredentialEncryption, IDGenerator
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from typing import Dict, Any, Optional
from django.core.cache import cache
from django.db import transaction
import re

class ValidationAlgorithms:
    @staticmethod
    def is_valid_email(email: str) -> bool:
        if not email or not isinstance(email, str):
            return False
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_regex, email))
    
    @staticmethod
    def is_valid_phone_number(phone_number: str) -> bool:
        if not phone_number:
            return False
        clean_number = re.sub(r'[\s\-\(\)\.]', '', str(phone_number))
        return len(clean_number) >= 10 and clean_number.isdigit()
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, bool]:
        if not password:
            return {'valid': False, 'message': 'Password is required'}
        
        checks = {
            'length': len(password) >= 8,
            'uppercase': any(c.isupper() for c in password),
            'lowercase': any(c.islower() for c in password),
            'digit': any(c.isdigit() for c in password),
            'special': any(not c.isalnum() for c in password),
        }
        
        strength = sum(checks.values())
        valid = strength >= 4
        
        return {
            'valid': valid,
            'strength': strength,
            'checks': checks,
            'message': 'Password meets requirements' if valid else 'Password too weak'
        }

class CachedFieldValidator:
    _email_cache = set()
    _phone_cache = set()
    _pppoe_username_cache = set()
    
    @classmethod
    def email_exists(cls, email: str) -> bool:
        if email in cls._email_cache:
            return True
        exists = UserAccount.objects.filter(email=email).exists()
        if exists:
            cls._email_cache.add(email)
        return exists
    
    @classmethod
    def phone_number_exists(cls, phone_number: str) -> bool:
        phone_str = str(phone_number)
        if phone_str in cls._phone_cache:
            return True
        exists = UserAccount.objects.filter(phone_number=phone_number).exists()
        if exists:
            cls._phone_cache.add(phone_str)
        return exists
    
    @classmethod
    def pppoe_username_exists(cls, username: str) -> bool:
        if username in cls._pppoe_username_cache:
            return True
        exists = UserAccount.objects.filter(pppoe_username=username).exists()
        if exists:
            cls._pppoe_username_cache.add(username)
        return exists
    
    @classmethod
    def invalidate_cache(cls, email: Optional[str] = None, phone_number: Optional[str] = None, pppoe_username: Optional[str] = None):
        if email and email in cls._email_cache:
            cls._email_cache.remove(email)
        if phone_number and str(phone_number) in cls._phone_cache:
            cls._phone_cache.remove(str(phone_number))
        if pppoe_username and pppoe_username in cls._pppoe_username_cache:
            cls._pppoe_username_cache.remove(pppoe_username)

class HotspotClientCreateSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'phone_number']  
        
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        phone_number = attrs.get('phone_number')
        
        if CachedFieldValidator.phone_number_exists(phone_number):
            raise serializers.ValidationError({
                "phone_number": "A client with this phone number already exists."
            })
        
        if not ValidationAlgorithms.is_valid_phone_number(phone_number):
            raise serializers.ValidationError({
                "phone_number": "Invalid phone number format."
            })
        
        attrs['user_type'] = 'client'
        attrs['connection_type'] = 'hotspot'
        return attrs

    @transaction.atomic
    def create(self, validated_data: Dict[str, Any]) -> UserAccount:
        user = UserAccount.objects.create_hotspot_client(**validated_data)
        CachedFieldValidator.invalidate_cache(phone_number=validated_data['phone_number'])
        return user

class PPPoEClientCreateSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)
    generate_credentials = serializers.BooleanField(default=True, write_only=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'phone_number', 'generate_credentials']
        
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        phone_number = attrs.get('phone_number')
        
        if CachedFieldValidator.phone_number_exists(phone_number):
            raise serializers.ValidationError({
                "phone_number": "A client with this phone number already exists."
            })
        
        if not ValidationAlgorithms.is_valid_phone_number(phone_number):
            raise serializers.ValidationError({
                "phone_number": "Invalid phone number format."
            })
        
        attrs['user_type'] = 'client'
        attrs['connection_type'] = 'pppoe'
        return attrs

    @transaction.atomic
    def create(self, validated_data: Dict[str, Any]) -> UserAccount:
        generate_credentials = validated_data.pop('generate_credentials', True)
        user = UserAccount.objects.create_pppoe_client(**validated_data)
        
        if not generate_credentials:
            user.pppoe_username = None
            user.pppoe_password = None
            user.save()
        
        CachedFieldValidator.invalidate_cache(phone_number=validated_data['phone_number'])
        return user

class PPPoECredentialSerializer(serializers.ModelSerializer):
    pppoe_password_plain = serializers.CharField(read_only=True)
    can_access_pppoe = serializers.BooleanField(read_only=True)
    effective_bandwidth = serializers.CharField(read_only=True)
    
    class Meta:
        model = UserAccount
        fields = [
            'pppoe_username', 
            'pppoe_password_plain', 
            'pppoe_active', 
            'last_pppoe_login', 
            'pppoe_ip_address',
            'can_access_pppoe',
            'effective_bandwidth',
            'admin_pppoe_bandwidth',  # 🔥 NEW: Admin PPPoE fields
            'admin_pppoe_priority',   # 🔥 NEW: Admin PPPoE fields
        ]
        read_only_fields = [
            'pppoe_active', 
            'last_pppoe_login', 
            'pppoe_ip_address',
            'can_access_pppoe',
            'effective_bandwidth',
            'admin_pppoe_bandwidth',  # 🔥 NEW: Read-only for clients
            'admin_pppoe_priority',   # 🔥 NEW: Read-only for clients
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Only show plain password when explicitly requested
        if 'pppoe_password_plain' in data and not self.context.get('show_password', False):
            data['pppoe_password_plain'] = '********'
        
        # Hide admin-specific fields for non-admin users
        request = self.context.get('request')
        if request and request.user.user_type == 'client':
            data.pop('admin_pppoe_bandwidth', None)
            data.pop('admin_pppoe_priority', None)
        
        return data

class AdminPPPoESetupSerializer(serializers.ModelSerializer):
    """🔥 NEW: Serializer for admin PPPoE setup"""
    username = serializers.CharField(
        max_length=50,
        required=True,
        help_text="PPPoE username for admin access"
    )
    password = serializers.CharField(
        max_length=128,
        required=False,
        write_only=True,
        help_text="PPPoE password (optional - will auto-generate if not provided)"
    )
    bandwidth = serializers.ChoiceField(
        choices=['10M', '50M', '100M', '500M', '1G'],
        default='100M',
        required=False
    )
    priority = serializers.ChoiceField(
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')],
        default='high',
        required=False
    )

    class Meta:
        model = UserAccount
        fields = ['username', 'password', 'bandwidth', 'priority']

    def validate_username(self, value):
        """Validate PPPoE username"""
        if not value or len(value) < 3:
            raise serializers.ValidationError("PPPoE username must be at least 3 characters long")
        
        # Check if username is already taken
        if CachedFieldValidator.pppoe_username_exists(value):
            raise serializers.ValidationError("PPPoE username already taken")
        
        return value

    def validate_password(self, value):
        """Validate PPPoE password strength"""
        if value:
            password_check = ValidationAlgorithms.validate_password_strength(value)
            if not password_check['valid']:
                raise serializers.ValidationError(password_check['message'])
        return value

    def validate(self, attrs):
        """Ensure user is admin"""
        request = self.context.get('request')
        if request and request.user.user_type not in ['admin', 'superadmin']:
            raise serializers.ValidationError("Only admin users can setup PPPoE credentials")
        return attrs

    def create(self, validated_data):
        """Setup PPPoE credentials for admin user"""
        user = self.context['request'].user
        
        # Extract setup parameters
        username = validated_data['username']
        password = validated_data.get('password')
        bandwidth = validated_data.get('bandwidth', '100M')
        priority = validated_data.get('priority', 'high')
        
        # Setup PPPoE credentials
        result = user.setup_admin_pppoe(username=username, password=password)
        
        # Update admin-specific settings
        user.admin_pppoe_bandwidth = bandwidth
        user.admin_pppoe_priority = priority
        user.save()
        
        # Invalidate cache
        CachedFieldValidator.invalidate_cache(pppoe_username=username)
        
        return {
            'user': user,
            'setup_result': result,
            'bandwidth': bandwidth,
            'priority': priority
        }

class DjoserUserCreateSerializer(BaseUserCreateSerializer):
    user_type = serializers.ChoiceField(
        choices=UserAccount.USER_TYPES, 
        default='admin',
        required=False
    )
    connection_type = serializers.ChoiceField(
        choices=UserAccount.CONNECTION_TYPES,
        default='admin',
        required=False,
        help_text="Connection type for the user"
    )
    setup_pppoe = serializers.BooleanField(
        default=False,
        required=False,
        write_only=True,
        help_text="Setup PPPoE credentials for admin user"
    )
    pppoe_username = serializers.CharField(
        max_length=50,
        required=False,
        write_only=True,
        help_text="PPPoE username (required if setup_pppoe is True)"
    )
    pppoe_password = serializers.CharField(
        max_length=128,
        required=False,
        write_only=True,
        help_text="PPPoE password (optional - will auto-generate if not provided)"
    )
    
    class Meta(BaseUserCreateSerializer.Meta):
        model = UserAccount
        fields = [
            'id', 'name', 'email', 'password', 'user_type', 'connection_type',
            'setup_pppoe', 'pppoe_username', 'pppoe_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
            'user_type': {'read_only': False},
        }

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        user_type = attrs.get('user_type', 'admin')
        email = attrs.get('email')
        connection_type = attrs.get('connection_type', 'admin')
        setup_pppoe = attrs.get('setup_pppoe', False)
        pppoe_username = attrs.get('pppoe_username')
        
        # Validate user type
        if user_type not in ['admin', 'superadmin']:
            raise serializers.ValidationError({
                "user_type": "Only admin or superadmin users can be created via this endpoint"
            })
        
        # Validate email
        if email and CachedFieldValidator.email_exists(email):
            raise serializers.ValidationError({
                "email": "A user with this email already exists."
            })
        
        if email and not ValidationAlgorithms.is_valid_email(email):
            raise serializers.ValidationError({
                "email": "Invalid email format."
            })
        
        # Validate password strength
        password = attrs.get('password')
        if password:
            password_check = ValidationAlgorithms.validate_password_strength(password)
            if not password_check['valid']:
                raise serializers.ValidationError({
                    "password": password_check['message']
                })
        
        # Validate PPPoE setup
        if setup_pppoe:
            if not pppoe_username:
                raise serializers.ValidationError({
                    "pppoe_username": "PPPoE username is required when setup_pppoe is True"
                })
            
            if CachedFieldValidator.pppoe_username_exists(pppoe_username):
                raise serializers.ValidationError({
                    "pppoe_username": "PPPoE username already taken"
                })
            
            # Validate connection type compatibility
            if connection_type not in ['pppoe', 'mixed']:
                attrs['connection_type'] = 'pppoe'
        
        return super().validate(attrs)

    @transaction.atomic
    def create(self, validated_data: Dict[str, Any]) -> UserAccount:
        # Extract PPPoE setup parameters
        setup_pppoe = validated_data.pop('setup_pppoe', False)
        pppoe_username = validated_data.pop('pppoe_username', None)
        pppoe_password = validated_data.pop('pppoe_password', None)
        
        # Create user
        if setup_pppoe and pppoe_username:
            # Use the new pppoe_admin creation method
            user = UserAccount.objects.create_pppoe_admin(
                name=validated_data['name'],
                email=validated_data['email'],
                password=validated_data['password'],
                pppoe_username=pppoe_username,
                user_type=validated_data.get('user_type', 'admin'),
                connection_type=validated_data.get('connection_type', 'pppoe'),
            )
            
            # Set custom password if provided
            if pppoe_password:
                user.pppoe_password = CredentialEncryption.encrypt(pppoe_password)
                user.save()
        else:
            # Regular admin creation
            user = UserAccount.objects.create_user(**validated_data)
        
        # Invalidate caches
        CachedFieldValidator.invalidate_cache(
            email=validated_data.get('email'),
            pppoe_username=pppoe_username
        )
        
        return user

class UserSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    connection_type_display = serializers.CharField(source='get_connection_type_display', read_only=True)
    is_2fa_enabled = serializers.BooleanField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    is_super_admin = serializers.BooleanField(read_only=True)
    is_pppoe_user = serializers.BooleanField(read_only=True)
    is_hotspot_user = serializers.BooleanField(read_only=True)
    last_updated = serializers.DateTimeField(read_only=True)
    can_access_pppoe = serializers.BooleanField(read_only=True)
    effective_bandwidth = serializers.CharField(read_only=True)
    pppoe_credentials = PPPoECredentialSerializer(source='*', read_only=True)

    class Meta:
        model = UserAccount
        fields = [
            'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
            'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
            'is_active', 'is_staff', 'date_joined', 'is_2fa_enabled', 
            'is_admin', 'is_super_admin', 'is_pppoe_user', 'is_hotspot_user',
            'last_updated', 'pppoe_credentials', 'can_access_pppoe', 'effective_bandwidth',
            'client_id',  # 🔥 NEW: Include client_id for all users
            'admin_pppoe_bandwidth',  # 🔥 NEW: Admin PPPoE fields
            'admin_pppoe_priority',   # 🔥 NEW: Admin PPPoE fields
        ]
        read_only_fields = [
            'is_staff', 'date_joined', 'username', 'is_2fa_enabled', 
            'is_admin', 'is_super_admin', 'last_updated', 'client_id',
            'can_access_pppoe', 'effective_bandwidth'
        ]

    def to_representation(self, instance):
        """Custom representation to handle different user types"""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # Hide admin-specific fields for non-admin users
        if request and request.user.user_type == 'client':
            data.pop('admin_pppoe_bandwidth', None)
            data.pop('admin_pppoe_priority', None)
            data.pop('email', None)  # Clients shouldn't see emails
            data.pop('name', None)   # Clients shouldn't see names
        
        # Hide client-specific fields for admin users viewing other admins
        if (request and request.user.user_type in ['admin', 'superadmin'] and 
            instance.user_type in ['admin', 'superadmin']):
            data.pop('client_id', None)
            data.pop('phone_number', None)
        
        return data

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        instance = self.instance
        
        if not instance:
            return attrs
        
        user_type = instance.user_type
        
        # 🔥 ENHANCED: More flexible validation for admin PPPoE
        validation_rules = {
            'client': [
                ('email', lambda x: x is None, "Clients must not have an email"),
                ('name', lambda x: x is None, "Clients must not have a name"),
                ('phone_number', lambda x: x is not None, "Clients must have a phone number"),
                ('connection_type', lambda x: x in ['hotspot', 'pppoe'], "Invalid connection type for client"),
            ],
            'admin': [
                # 🔥 RELAXED: Allow admin to have phone number for PPPoE
                # ('phone_number', lambda x: x is None, "Admins must not have a phone number"),
                ('email', lambda x: x is not None, "Admins must have an email"),
                ('name', lambda x: x is not None, "Admins must have a name"),
                ('connection_type', lambda x: x in ['admin', 'hotspot', 'pppoe', 'mixed'], 
                 "Invalid connection type for admin"),
            ],
            'superadmin': [
                ('email', lambda x: x is not None, "Super admins must have an email"),
                ('name', lambda x: x is not None, "Super admins must have a name"),
                ('connection_type', lambda x: x in ['admin', 'hotspot', 'pppoe', 'mixed'], 
                 "Invalid connection type for super admin"),
            ]
        }
        
        for field_name, validation_func, error_message in validation_rules.get(user_type, []):
            if field_name in attrs and not validation_func(attrs[field_name]):
                raise serializers.ValidationError({field_name: error_message})
        
        # Validate PPPoE username if provided
        if 'pppoe_username' in attrs:
            pppoe_username = attrs['pppoe_username']
            if pppoe_username and CachedFieldValidator.pppoe_username_exists(pppoe_username):
                # Allow updating own PPPoE username
                if not instance or instance.pppoe_username != pppoe_username:
                    raise serializers.ValidationError({
                        "pppoe_username": "PPPoE username already taken"
                    })
        
        return attrs

    @transaction.atomic
    def update(self, instance: UserAccount, validated_data: Dict[str, Any]) -> UserAccount:
        old_email = instance.email
        old_phone = instance.phone_number
        old_pppoe_username = instance.pppoe_username
        
        # Handle PPPoE password update separately
        pppoe_password = validated_data.pop('pppoe_password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update PPPoE password if provided
        if pppoe_password:
            instance.pppoe_password = CredentialEncryption.encrypt(pppoe_password)
        
        instance.save()
        
        # Invalidate caches for changed fields
        if 'email' in validated_data and validated_data['email'] != old_email:
            CachedFieldValidator.invalidate_cache(email=old_email)
        
        if 'phone_number' in validated_data and validated_data['phone_number'] != old_phone:
            CachedFieldValidator.invalidate_cache(phone_number=old_phone)
        
        if 'pppoe_username' in validated_data and validated_data['pppoe_username'] != old_pppoe_username:
            CachedFieldValidator.invalidate_cache(pppoe_username=old_pppoe_username)
        
        return instance

class UserMeSerializer(UserSerializer):
    """Serializer for current user profile with enhanced PPPoE support"""
    
    class Meta(UserSerializer.Meta):
        fields = [
            'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
            'user_type', 'user_type_display', 'connection_type', 'connection_type_display',
            'is_active', 'is_staff', 'date_joined', 'is_2fa_enabled', 
            'is_admin', 'is_super_admin', 'is_pppoe_user', 'is_hotspot_user',
            'client_id', 'last_updated', 'pppoe_credentials', 'can_access_pppoe', 
            'effective_bandwidth', 'admin_pppoe_bandwidth', 'admin_pppoe_priority'
        ]
    
    def to_representation(self, instance: UserAccount) -> Dict[str, Any]:
        """Use the enhanced display fields from the model"""
        return instance.get_display_fields()

class PPPoEAuthResponseSerializer(serializers.Serializer):
    """🔥 NEW: Serializer for PPPoE authentication response"""
    authenticated = serializers.BooleanField()
    message = serializers.CharField()
    access_token = serializers.CharField(required=False)
    refresh_token = serializers.CharField(required=False)
    client = serializers.DictField()

    class Meta:
        fields = ['authenticated', 'message', 'access_token', 'refresh_token', 'client']

class AdminPPPoEStatsSerializer(serializers.Serializer):
    """🔥 NEW: Serializer for admin PPPoE statistics"""
    total_admin_pppoe_users = serializers.IntegerField()
    active_admin_pppoe_sessions = serializers.IntegerField()
    bandwidth_distribution = serializers.DictField()
    priority_distribution = serializers.DictField()
    recent_pppoe_logins = serializers.ListField()

    class Meta:
        fields = [
            'total_admin_pppoe_users',
            'active_admin_pppoe_sessions', 
            'bandwidth_distribution',
            'priority_distribution',
            'recent_pppoe_logins'
        ]