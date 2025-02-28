from rest_framework import serializers
from authentication.models import UserAccount
from account.models.setting_model import AdminSettings

class AccountSettingsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name')
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AdminSettings
        fields = ['name', 'email', 'profile_pic', 'email_alerts', 'payment_alerts', 'system_alerts', 'api_key']
        read_only_fields = ['email', 'api_key']

    profile_pic = serializers.ImageField(source='user.profile_pic', required=False, allow_null=True)

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'name' in user_data:
            user.name = user_data['name']
        if 'profile_pic' in user_data:
            user.profile_pic = user_data['profile_pic']
        user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance