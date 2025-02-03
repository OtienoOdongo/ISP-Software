from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from account.models.admin_profile import AdminProfile, RecentActivity, NetworkHealth, ServerStatus
from account.serializers.admin_profile import UserSerializer, AdminProfileSerializer, \
RecentActivitySerializer, NetworkHealthSerializer, ServerStatusSerializer

class AdminProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admin profiles, including profile picture uploads and updates.

    Permissions:
        - Only authenticated users with admin privileges can access these endpoints.
    """
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=True, methods=['put'], name='Update Profile')
    def update_profile(self, request, pk=None):
        """
        Update the admin's profile, including the profile picture.

        Args:
            request (Request): Contains the updated profile data.
            pk (int): The primary key of the profile to update.

        Returns:
            Response: Serialized profile data if successful, error messages otherwise.
        """
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            # Handle file upload for profile picture
            if 'profile_pic' in request.data:
                profile.profile_pic = request.data['profile_pic']
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecentActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recent activities.

    Permissions:
        - Only authenticated admin users can manage activities.
    """
    queryset = RecentActivity.objects.all()
    serializer_class = RecentActivitySerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class NetworkHealthViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing network health metrics.

    Permissions:
        - Only authenticated admin users can manage network health data.
    """
    queryset = NetworkHealth.objects.all()
    serializer_class = NetworkHealthSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class ServerStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing server status.

    Permissions:
        - Only authenticated admin users can manage server status data.
    """
    queryset = ServerStatus.objects.all()
    serializer_class = ServerStatusSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing basic user profile data like name and email.

    Permissions:
        - Only authenticated admin users can manage their profile data.
    """
    queryset = User.objects.filter(is_staff=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=True, methods=['put'], name='Update User Profile')
    def update_user_profile(self, request, pk=None):
        """
        Update the user's profile details like name and email.

        Args:
            request (Request): Contains the updated user data.
            pk (int): The primary key of the user to update.

        Returns:
            Response: Serialized user data if successful, error messages otherwise.
        """
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)