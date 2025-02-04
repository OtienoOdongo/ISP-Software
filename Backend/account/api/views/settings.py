from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from authentication.models import User
from account.models import UserProfile, SecuritySettings, NotificationSettings
from account.serializers import UserProfileSerializer, SecuritySettingsSerializer, \
NotificationSettingsSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user profiles.

    Permissions:
        - Only authenticated users can manage their own profile data.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    @action(detail=True, methods=['put'], name='Update User Profile')
    def update_profile(self, request, pk=None):
        """
        Update the user's profile, including the profile picture.

        Args:
            request (Request): Contains the updated profile data.
            pk (int): The primary key of the profile to update.

        Returns:
            Response: Serialized profile data if successful, error messages otherwise.
        """
        profile = self.get_object()
        if profile.user != request.user:
            return Response({"detail": "You do not have permission to update this profile."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            # Handle file upload for profile picture
            if 'profile_pic' in request.data:
                profile.profile_pic = request.data['profile_pic']
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SecuritySettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing security settings.

    Permissions:
        - Only authenticated users can manage their own security settings.
    """
    queryset = SecuritySettings.objects.all()
    serializer_class = SecuritySettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notification settings.

    Permissions:
        - Only authenticated users can manage their own notification settings.
    """
    queryset = NotificationSettings.objects.all()
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

class SettingsViewSet(viewsets.ViewSet):
    """
    A viewset for handling all settings related operations for a user.
    This is a custom ViewSet to manage multiple settings models at once.

    Permissions:
        - Only authenticated users can access their own settings.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        Retrieve all settings for the authenticated user.

        Returns:
            Response: A dictionary containing both security and notification settings.
        """
        user = request.user
        security_settings = SecuritySettings.objects.get(user=user)
        notification_settings = NotificationSettings.objects.get(user=user)

        return Response({
            'security': SecuritySettingsSerializer(security_settings).data,
            'notifications': NotificationSettingsSerializer(notification_settings).data
        })

    def partial_update(self, request):
        """
        Partially update settings for the authenticated user.

        Args:
            request (Request): Contains the data to update settings.

        Returns:
            Response: Updated settings data, or error messages.
        """
        user = request.user
        security_settings = SecuritySettings.objects.get(user=user)
        notification_settings = NotificationSettings.objects.get(user=user)

        # Update security settings if data is provided
        security_data = request.data.get('security', {})
        if security_data:
            for key, value in security_data.items():
                setattr(security_settings, key, value)
            security_settings.save()

        # Update notification settings if data is provided
        notification_data = request.data.get('notifications', {})
        if notification_data:
            for key, value in notification_data.items():
                setattr(notification_settings, key, value)
            notification_settings.save()

        return Response({
            'security': SecuritySettingsSerializer(security_settings).data,
            'notifications': NotificationSettingsSerializer(notification_settings).data
        })