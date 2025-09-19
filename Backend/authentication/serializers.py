





# # authentication/serializers.py

# from rest_framework import serializers
# from phonenumber_field.serializerfields import PhoneNumberField
# from .models import UserAccount
# from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer

# class ClientCreateSerializer(serializers.ModelSerializer):
#     phone_number = PhoneNumberField(required=True)

#     class Meta:
#         model = UserAccount
#         fields = ['id', 'name', 'phone_number']
#         extra_kwargs = {
#             'name': {'required': True},
#         }

#     def validate(self, attrs):
#         attrs['user_type'] = 'client'
#         return attrs

#     def create(self, validated_data):
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
#         return UserAccount.objects.create_user(**validated_data)  # Changed to create_user for admin

# class UserSerializer(serializers.ModelSerializer):
#     user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)

#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'is_active', 'is_staff',
#             'date_joined'
#         ]
#         read_only_fields = ['is_staff', 'user_type', 'date_joined']

#     def validate(self, attrs):
#         instance = self.instance
#         if instance:
#             user_type = instance.user_type
#             if user_type == 'client':
#                 if 'email' in attrs:
#                     raise serializers.ValidationError("Clients must not have an email")
#                 if 'phone_number' in attrs and not attrs['phone_number']:
#                     raise serializers.ValidationError("Clients must have a phone number")
#             else:
#                 if 'phone_number' in attrs:
#                     raise serializers.ValidationError("Admins must not have a phone number")
#                 if 'email' in attrs and not attrs['email']:
#                     raise serializers.ValidationError("Admins must have an email")
#         return attrs

#     def update(self, instance, validated_data):
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
#         return instance






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

#     class Meta:
#         model = UserAccount
#         fields = [
#             'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
#             'user_type', 'user_type_display', 'is_active', 'is_staff',
#             'date_joined'
#         ]
#         read_only_fields = ['is_staff', 'user_type', 'date_joined', 'username']  # Added username as read-only

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






# authentication/serializers.py
from rest_framework import serializers
from phonenumber_field.serializerfields import PhoneNumberField
from .models import UserAccount
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer

class ClientCreateSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField(required=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'phone_number']  
        

    def validate(self, attrs):
        attrs['user_type'] = 'client'
        return attrs

    def create(self, validated_data):
        # Check if phone number already exists
        phone_number = validated_data['phone_number']
        if UserAccount.objects.filter(phone_number=phone_number).exists():
            raise serializers.ValidationError({"phone_number": "A client with this phone number already exists."})
        
        return UserAccount.objects.create_client(**validated_data)

class DjoserUserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = UserAccount
        fields = ['id', 'name', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
            'name': {'required': True},
        }

    def validate(self, attrs):
        attrs['user_type'] = 'admin'
        return super().validate(attrs)

    def create(self, validated_data):
        return UserAccount.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    is_2fa_enabled = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserAccount
        fields = [
            'id', 'username', 'name', 'email', 'phone_number', 'profile_pic',
            'user_type', 'user_type_display', 'is_active', 'is_staff',
            'date_joined', 'is_2fa_enabled'
        ]
        read_only_fields = ['is_staff', 'user_type', 'date_joined', 'username', 'is_2fa_enabled']

    def validate(self, attrs):
        instance = self.instance
        if instance:
            user_type = instance.user_type
            if user_type == 'client':
                if 'email' in attrs:
                    raise serializers.ValidationError("Clients must not have an email")
                if 'name' in attrs:
                    raise serializers.ValidationError("Clients must not have a name")
                if 'phone_number' in attrs and not attrs['phone_number']:
                    raise serializers.ValidationError("Clients must have a phone number")
            else:
                if 'phone_number' in attrs:
                    raise serializers.ValidationError("Admins must not have a phone number")
                if 'email' in attrs and not attrs['email']:
                    raise serializers.ValidationError("Admins must have an email")
                if 'name' in attrs and not attrs['name']:
                    raise serializers.ValidationError("Admins must have a name")
        return attrs

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance