from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from account.models.settings import Profile, SecuritySettings, NotificationSettings
from account.serializers.settings import ProfileSerializer, SecuritySettingsSerializer, \
NotificationSettingsSerializer
from django.contrib.auth.models import User

class ProfileViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing user profiles.

    Provides standard CRUD operations for profiles.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SecuritySettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling security settings.

    Includes methods to update or toggle security features like two-factor authentication.
    """
    queryset = SecuritySettings.objects.all()
    serializer_class = SecuritySettingsSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=True, methods=['put'])
    def toggle_two_factor_auth(self, request, pk=None):
        """
        Toggle two-factor authentication for the user.

        Args:
            request (Request): The request object.
            pk (int): The primary key of the security settings.

        Returns:
            Response: Updated security settings status.
        """
        settings = self.get_object()
        settings.two_factor_auth = not settings.two_factor_auth
        settings.save()
        return Response({'two_factor_auth': settings.two_factor_auth})

class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing notification settings.

    Includes methods to update or create new notification preferences.
    """
    queryset = NotificationSettings.objects.all()
    serializer_class = NotificationSettingsSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)