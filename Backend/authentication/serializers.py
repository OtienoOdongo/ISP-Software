




# # authentication/serializers.py
# from rest_framework import serializers
# from phonenumber_field.serializerfields import PhoneNumberField
# from .models import UserAccount
# from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer

# class ClientCreateSerializer(serializers.ModelSerializer):
#     phone_number = PhoneNumberField(required=True)

#     class Meta:
#         model = UserAccount
#         fields = ['id', 'phone_number']  
        

#     def validate(self, attrs):
#         attrs['user_type'] = 'client'
#         return attrs

#     def create(self, validated_data):
#         # Check if phone number already exists
#         phone_number = validated_data['phone_number']
#         if UserAccount.objects.filter(phone_number=phone_number).exists():
#             raise serializers.ValidationError({"phone_number": "A client with this phone number already exists."})
        
#         return UserAccount.objects.create_client(**validated_data)

# class DjoserUserCreateSerializer(BaseUserCreateSerializer):
#     class Meta(BaseUserCreateSerializer.Meta):
#         model = UserAccount
#         fields = ['id', 'name', 'email', 'password']
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'name': {'required': True},
#         }

#     def validate(self, attrs):
#         attrs['user_type'] = 'admin'
#         return super().validate(attrs)

#     def create(self, validated_data):
#         return UserAccount.objects.create_user(**validated_data)

# class UserSerializer(serializers.ModelSerializer):
#     user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
#     is_2fa_enabled = serializers.BooleanField(read_only=True)

#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'is_active', 'is_staff',
#             'date_joined', 'is_2fa_enabled'
#         ]
#         read_only_fields = ['is_staff', 'user_type', 'date_joined', 'username', 'is_2fa_enabled']

#     def validate(self, attrs):
#         instance = self.instance
#         if instance:
#             user_type = instance.user_type
#             if user_type == 'client':
#                 if 'email' in attrs:
#                     raise serializers.ValidationError("Clients must not have an email")
#                 if 'name' in attrs:
#                     raise serializers.ValidationError("Clients must not have a name")
#                 if 'phone_number' in attrs and not attrs['phone_number']:
#                     raise serializers.ValidationError("Clients must have a phone number")
#             else:
#                 if 'phone_number' in attrs:
#                     raise serializers.ValidationError("Admins must not have a phone number")
#                 if 'email' in attrs and not attrs['email']:
#                     raise serializers.ValidationError("Admins must have an email")
#                 if 'name' in attrs and not attrs['name']:
#                     raise serializers.ValidationError("Admins must have a name")
#         return attrs

#     def update(self, instance, validated_data):
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         return instance







# # authentication/serializers.py
# from rest_framework import serializers
# from phonenumber_field.serializerfields import PhoneNumberField
# from .models import UserAccount
# from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
# from typing import Dict, Any


# class ClientCreateSerializer(serializers.ModelSerializer):
#     phone_number = PhoneNumberField(required=True)

#     class Meta:
#         model = UserAccount
#         fields = ['id', 'phone_number']  
        
#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         """Optimized validation with early returns"""
#         phone_number = attrs.get('phone_number')
        
#         # Check for existing phone number using exists() for better performance
#         if UserAccount.objects.filter(phone_number=phone_number).exists():
#             raise serializers.ValidationError({
#                 "phone_number": "A client with this phone number already exists."
#             })
        
#         attrs['user_type'] = 'client'
#         return attrs

#     def create(self, validated_data: Dict[str, Any]) -> UserAccount:
#         """Optimized creation with bulk operation readiness"""
#         return UserAccount.objects.create_client(**validated_data)


# class DjoserUserCreateSerializer(BaseUserCreateSerializer):
#     class Meta(BaseUserCreateSerializer.Meta):
#         model = UserAccount
#         fields = ['id', 'name', 'email', 'password']
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'name': {'required': True},
#         }

#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         attrs['user_type'] = 'admin'
#         return super().validate(attrs)

#     def create(self, validated_data: Dict[str, Any]) -> UserAccount:
#         return UserAccount.objects.create_user(**validated_data)


# class UserSerializer(serializers.ModelSerializer):
#     user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
#     is_2fa_enabled = serializers.BooleanField(read_only=True)

#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'is_active', 'is_staff',
#             'date_joined', 'is_2fa_enabled'
#         ]
#         read_only_fields = ['is_staff', 'date_joined', 'username', 'is_2fa_enabled']

#     def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
#         """Optimized validation with early returns"""
#         instance = self.instance
        
#         if not instance:
#             return attrs
        
#         user_type = instance.user_type
        
#         if user_type == 'client':
#             if 'email' in attrs:
#                 raise serializers.ValidationError("Clients must not have an email")
#             if 'name' in attrs:
#                 raise serializers.ValidationError("Clients must not have a name")
#             if 'phone_number' in attrs and not attrs['phone_number']:
#                 raise serializers.ValidationError("Clients must have a phone number")
#         else:
#             if 'phone_number' in attrs:
#                 raise serializers.ValidationError("Admins must not have a phone number")
#             if 'email' in attrs and not attrs['email']:
#                 raise serializers.ValidationError("Admins must have an email")
#             if 'name' in attrs and not attrs['name']:
#                 raise serializers.ValidationError("Admins must have a name")
        
#         return attrs

#     def update(self, instance: UserAccount, validated_data: Dict[str, Any]) -> UserAccount:
#         """Optimized update with selective field setting"""
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         return instance


# class UserMeSerializer(UserSerializer):
#     """Specialized serializer for /users/me/ endpoint with optimized data structure"""
    
#     class Meta(UserSerializer.Meta):
#         fields = [
#             'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'is_active', 'is_staff',
#             'date_joined', 'is_2fa_enabled', 'client_id'
#         ]
    
#     def to_representation(self, instance: UserAccount) -> Dict[str, Any]:
#         """Optimized representation using the model's built-in method"""
#         return instance.get_display_fields()








# authentication/serializers.py
from rest_framework import serializers
from phonenumber_field.serializerfields import PhoneNumberField
from .models import UserAccount
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from typing import Dict, Any, Optional
from django.core.cache import cache
from django.db import transaction
import re

# Validation algorithms
class ValidationAlgorithms:
    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Optimized email validation"""
        if not email or not isinstance(email, str):
            return False
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_regex, email))
    
    @staticmethod
    def is_valid_phone_number(phone_number: str) -> bool:
        """Basic phone number validation"""
        if not phone_number:
            return False
        
        # Remove common separators and check length
        clean_number = re.sub(r'[\s\-\(\)\.]', '', str(phone_number))
        return len(clean_number) >= 10 and clean_number.isdigit()
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, bool]:
        """Password strength validation algorithm"""
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
        valid = strength >= 4  # At least 4 out of 5 criteria
        
        return {
            'valid': valid,
            'strength': strength,
            'checks': checks,
            'message': 'Password meets requirements' if valid else 'Password too weak'
        }

# Cached field validation
class CachedFieldValidator:
    _email_cache = set()
    _phone_cache = set()
    
    @classmethod
    def email_exists(cls, email: str) -> bool:
        """Cached email existence check"""
        if email in cls._email_cache:
            return True
        
        exists = UserAccount.objects.filter(email=email).exists()
        if exists:
            cls._email_cache.add(email)
        return exists
    
    @classmethod
    def phone_number_exists(cls, phone_number: str) -> bool:
        """Cached phone number existence check"""
        phone_str = str(phone_number)
        if phone_str in cls._phone_cache:
            return True
        
        exists = UserAccount.objects.filter(phone_number=phone_number).exists()
        if exists:
            cls._phone_cache.add(phone_str)
        return exists
    
    @classmethod
    def invalidate_cache(cls, email: Optional[str] = None, phone_number: Optional[str] = None):
        """Invalidate cache entries"""
        if email and email in cls._email_cache:
            cls._email_cache.remove(email)
        if phone_number and str(phone_number) in cls._phone_cache:
            cls._phone_cache.remove(str(phone_number))

class ClientCreateSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'phone_number']  
        
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        phone_number = attrs.get('phone_number')
        
        # Use cached validation
        if CachedFieldValidator.phone_number_exists(phone_number):
            raise serializers.ValidationError({
                "phone_number": "A client with this phone number already exists."
            })
        
        # Additional validation
        if not ValidationAlgorithms.is_valid_phone_number(phone_number):
            raise serializers.ValidationError({
                "phone_number": "Invalid phone number format."
            })
        
        attrs['user_type'] = 'client'
        return attrs

    @transaction.atomic
    def create(self, validated_data: Dict[str, Any]) -> UserAccount:
        user = UserAccount.objects.create_client(**validated_data)
        CachedFieldValidator.invalidate_cache(phone_number=validated_data['phone_number'])
        return user

class DjoserUserCreateSerializer(BaseUserCreateSerializer):
    user_type = serializers.ChoiceField(
        choices=UserAccount.USER_TYPES, 
        default='admin',
        required=False
    )
    
    class Meta(BaseUserCreateSerializer.Meta):
        model = UserAccount
        fields = ['id', 'name', 'email', 'password', 'user_type']
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
            'user_type': {'read_only': False},
        }

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        user_type = attrs.get('user_type', 'admin')
        email = attrs.get('email')
        
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
        
        return super().validate(attrs)

    @transaction.atomic
    def create(self, validated_data: Dict[str, Any]) -> UserAccount:
        user = UserAccount.objects.create_user(**validated_data)
        CachedFieldValidator.invalidate_cache(email=validated_data.get('email'))
        return user

class UserSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    is_2fa_enabled = serializers.BooleanField(read_only=True)
    is_admin = serializers.BooleanField(read_only=True)
    is_super_admin = serializers.BooleanField(read_only=True)
    last_updated = serializers.DateTimeField(read_only=True)

    class Meta:
        model = UserAccount
        fields = [
            'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
            'user_type', 'user_type_display', 'is_active', 'is_staff',
            'date_joined', 'is_2fa_enabled', 'is_admin', 'is_super_admin', 'last_updated'
        ]
        read_only_fields = ['is_staff', 'date_joined', 'username', 'is_2fa_enabled', 
                          'is_admin', 'is_super_admin', 'last_updated']

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        instance = self.instance
        
        if not instance:
            return attrs
        
        user_type = instance.user_type
        
        # Use efficient validation patterns
        validation_rules = {
            'client': [
                ('email', lambda x: x is None, "Clients must not have an email"),
                ('name', lambda x: x is None, "Clients must not have a name"),
                ('phone_number', lambda x: x is not None, "Clients must have a phone number"),
            ],
            'admin': [
                ('phone_number', lambda x: x is None, "Admins must not have a phone number"),
                ('email', lambda x: x is not None, "Admins must have an email"),
                ('name', lambda x: x is not None, "Admins must have a name"),
            ]
        }
        
        for field_name, validation_func, error_message in validation_rules.get(user_type, []):
            if field_name in attrs and not validation_func(attrs[field_name]):
                raise serializers.ValidationError({field_name: error_message})
        
        if 'user_type' in attrs and attrs['user_type'] not in ['admin', 'superadmin']:
            raise serializers.ValidationError("Invalid user type for admin user")
        
        return attrs

    @transaction.atomic
    def update(self, instance: UserAccount, validated_data: Dict[str, Any]) -> UserAccount:
        old_email = instance.email
        old_phone = instance.phone_number
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Invalidate cache if email or phone changed
        if 'email' in validated_data and validated_data['email'] != old_email:
            CachedFieldValidator.invalidate_cache(email=old_email)
        
        if 'phone_number' in validated_data and validated_data['phone_number'] != old_phone:
            CachedFieldValidator.invalidate_cache(phone_number=old_phone)
        
        return instance

class UserMeSerializer(UserSerializer):
    """Optimized serializer for /users/me/ endpoint"""
    
    class Meta(UserSerializer.Meta):
        fields = [
            'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
            'user_type', 'user_type_display', 'is_active', 'is_staff',
            'date_joined', 'is_2fa_enabled', 'is_admin', 'is_super_admin', 
            'client_id', 'last_updated'
        ]
    
    def to_representation(self, instance: UserAccount) -> Dict[str, Any]:
        # Use model's optimized method
        return instance.get_display_fields()