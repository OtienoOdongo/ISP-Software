# from rest_framework import serializers
# from .models import OTP

# class OTPSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OTP
#         fields = ['phone_number', 'otp_code']
#         extra_kwargs = {'otp_code': {'write_only': True}}



# from rest_framework import serializers
# from .models import OTP
# from .utils import format_phone_number  

# class GenerateOTPSerializer(serializers.ModelSerializer):
#     """Serializer for generating OTPs - only requires phone_number"""
#     expires_at = serializers.DateTimeField(read_only=True)
#     is_verified = serializers.BooleanField(read_only=True)

#     def to_internal_value(self, data):
#         """Preprocess phone_number to ensure E.164 format"""
#         data = data.copy()  # Make mutable copy of QueryDict
#         phone = data.get('phone_number')
#         if phone:
#             try:
#                 data['phone_number'] = format_phone_number(phone)
#             except ValueError as e:
#                 raise serializers.ValidationError({"phone_number": str(e)})
#         return super().to_internal_value(data)

#     class Meta:
#         model = OTP
#         fields = ['phone_number', 'expires_at', 'is_verified']
#         extra_kwargs = {
#             'phone_number': {'validators': []}  # Disable default unique validator
#         }

# class VerifyOTPSerializer(serializers.ModelSerializer):
#     """Serializer for verifying OTPs - requires both phone_number and otp_code"""
#     expires_at = serializers.DateTimeField(read_only=True)
#     is_verified = serializers.BooleanField(read_only=True)

#     def to_internal_value(self, data):
#         """Preprocess phone_number to ensure E.164 format"""
#         data = data.copy()  # Make mutable copy of QueryDict
#         phone = data.get('phone_number')
#         if phone:
#             try:
#                 data['phone_number'] = format_phone_number(phone)
#             except ValueError as e:
#                 raise serializers.ValidationError({"phone_number": str(e)})
#         return super().to_internal_value(data)

#     class Meta:
#         model = OTP
#         fields = ['phone_number', 'otp_code', 'expires_at', 'is_verified']
#         extra_kwargs = {
#             'otp_code': {'write_only': True},  # Required for verification
#             'phone_number': {'validators': []}  # Disable default unique validator
#         }






from rest_framework import serializers
from .models import OTP
from .utils import format_phone_number

class GenerateOTPSerializer(serializers.ModelSerializer):
    """Serializer for generating OTPs - only requires phone_number"""
    expires_at = serializers.DateTimeField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    def to_internal_value(self, data):
        """Preprocess phone_number to ensure E.164 format"""
        data = data.copy()  # Make mutable copy of QueryDict
        phone = data.get('phone_number')
        if phone:
            try:
                data['phone_number'] = format_phone_number(phone)
            except ValueError as e:
                raise serializers.ValidationError({"phone_number": str(e)})
        return super().to_internal_value(data)

    class Meta:
        model = OTP
        fields = ['phone_number', 'expires_at', 'is_verified']
        extra_kwargs = {
            'phone_number': {'validators': []}  # Disable default unique validator
        }

class VerifyOTPSerializer(serializers.ModelSerializer):
    """Serializer for verifying OTPs - requires both phone_number and otp_code"""
    otp_code = serializers.CharField(write_only=True)
    expires_at = serializers.DateTimeField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    def to_internal_value(self, data):
        """Preprocess phone_number to ensure E.164 format"""
        data = data.copy()  # Make mutable copy of QueryDict
        phone = data.get('phone_number')
        if phone:
            try:
                data['phone_number'] = format_phone_number(phone)
            except ValueError as e:
                raise serializers.ValidationError({"phone_number": str(e)})
        return super().to_internal_value(data)

    class Meta:
        model = OTP
        fields = ['phone_number', 'otp_code', 'expires_at', 'is_verified']
        extra_kwargs = {
            'phone_number': {'validators': []}  # Disable default unique validator
        }