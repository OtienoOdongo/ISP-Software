from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from authentication.models import User
from account.models.admin_profile import AdminProfile, RecentActivity, NetworkHealth, ServerStatus  # Updated import path
from account.serializers.admin_profile import AdminProfileSerializer, RecentActivitySerializer, NetworkHealthSerializer, ServerStatusSerializer  # Assuming these serializers exist

class AdminProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admin profiles, including profile picture uploads and updates.

    Permissions:
        - Only authenticated users can access their own profile.
    """
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['put'], name='Update Admin Profile')
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
            return Response({"detail": "You do not have permission to update this profile."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            if 'profile_pic' in request.data:
                profile.profile_pic = request.data['profile_pic']
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

class RecentActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recent activities for the authenticated user.

    Permissions:
        - Only authenticated users can manage their own activities.
    """
    queryset = RecentActivity.objects.all()
    serializer_class = RecentActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

class NetworkHealthViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing network health metrics for the authenticated user.

    Permissions:
        - Only authenticated users can manage their own network health data.
    """
    queryset = NetworkHealth.objects.all()
    serializer_class = NetworkHealthSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

class ServerStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing server status for the authenticated user.

    Permissions:
        - Only authenticated users can manage their own server status data.
    """
    queryset = ServerStatus.objects.all()
    serializer_class = ServerStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)