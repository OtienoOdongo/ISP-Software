from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from account.models.admin_profile import AdminProfile, RecentActivity, NetworkHealth, ServerStatus
from account.serializers.admin_profile import AdminProfileSerializer, RecentActivitySerializer, \
NetworkHealthSerializer, ServerStatusSerializer
from django.contrib.auth.models import User

class AdminProfileViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing admin profiles.

    Provides standard actions for list, create, retrieve, update, and delete, 
    plus custom actions for profile updates and password changes.
    """
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    
    @action(detail=True, methods=['put'], name='Update Profile')
    def update_profile(self, request, pk=None):
        """
        Update the profile details including phone and profile picture.

        Args:
            request (Request): The request containing the new profile data.
            pk (int): The primary key of the profile to update.

        Returns:
            Response: Serialized profile data if successful, error messages otherwise.
        """
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'], name='Change Password')
    def change_password(self, request, pk=None):
        """
        Change the user's password if the current password is correct.

        Args:
            request (Request): Contains current password, new password, and confirmation.
            pk (int): The primary key of the profile associated with the user.

        Returns:
            Response: Success message if password changed, error if current password is incorrect.
        """
        user = self.get_object().user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not user.check_password(current_password):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password updated successfully."})

class RecentActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recent activities logged in the system.
    """
    queryset = RecentActivity.objects.all()
    serializer_class = RecentActivitySerializer

class NetworkHealthViewSet(viewsets.ModelViewSet):
    """
    ViewSet for monitoring and updating network health metrics.
    """
    queryset = NetworkHealth.objects.all()
    serializer_class = NetworkHealthSerializer

class ServerStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for server status management, allowing to view and update server statuses.
    """
    queryset = ServerStatus.objects.all()
    serializer_class = ServerStatusSerializer