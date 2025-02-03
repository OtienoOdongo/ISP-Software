from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.auth import authenticate, login
from django.contrib.sessions.models import Session
from account.models.settings import UserProfile, SecuritySettings, NotificationSettings
from account.serializers.settings import UserSerializer, UserProfileSerializer, \
SecuritySettingsSerializer, NotificationSettingsSerializer

User = get_user_model()

class AccountSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing account settings including profile, security, and notifications.
    Uses JWT and session authentication for consistency with admin views.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]  
    permission_classes = [IsAuthenticated]  # Ensures only authenticated users can access

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['put'], name='Update Profile')
    def update_profile(self, request):
        user = self.get_object()
        profile = user.userprofile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], name='Change Password')
    def change_password(self, request):
        user = self.get_object()
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, 
                            status=status.HTTP_401_UNAUTHORIZED)
        user.set_password(new_password)
        user.save()
        # Update last changed date in SecuritySettings
        security = SecuritySettings.objects.get(user=user)
        security.password_last_changed = timezone.now().date()
        security.save()
        # Invalidate all previous sessions for security
        Session.objects.filter(expire_date__gte=timezone.now()).delete()
        return Response({"detail": "Password updated successfully."})

    @action(detail=False, methods=['put'], name='Update Security')
    def update_security(self, request):
        user = self.get_object()
        security = SecuritySettings.objects.get(user=user)
        serializer = SecuritySettingsSerializer(security, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], name='Update Notifications')
    def update_notifications(self, request):
        user = self.get_object()
        notifications = NotificationSettings.objects.get(user=user)
        serializer = NotificationSettingsSerializer(notifications, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)