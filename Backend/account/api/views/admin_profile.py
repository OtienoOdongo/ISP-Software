from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from authentication.models import User
from account.models.admin_profile import AdminProfile, RecentActivity, \
NetworkHealth, ServerStatus
from account.serializers.admin_profile import AdminProfileSerializer, RecentActivitySerializer, \
NetworkHealthSerializer, ServerStatusSerializer

class AdminProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing admin profiles, including profile picture uploads and updates.

    Attributes:
        queryset (QuerySet): Contains all AdminProfile instances.
        serializer_class (Serializer): AdminProfileSerializer for serialization.
        permission_classes (list): List of permission classes, here only authenticated users are allowed.

    Methods:
        update_profile: Action for updating an admin's profile.
        get_queryset: Overrides to ensure only the user's own profile is accessible.
    """
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['put'], name='Update Admin Profile')
    def update_profile(self, request, pk=None):
        """
        Update the user's profile, including the profile picture.

        Args:
            request (Request): Contains the updated profile data in the request body.
            pk (int): The primary key of the profile to update.

        Returns:
            Response: Serialized profile data if successful, or error messages if validation fails.

        Raises:
            HTTP_403_FORBIDDEN: If the user tries to update another user's profile.
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
        """
        Override to filter the queryset to only include the profile of the authenticated user.

        Returns:
            QuerySet: Filtered queryset containing only the current user's admin profile.
        """
        return super().get_queryset().filter(user=self.request.user)

class RecentActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recent activities for the authenticated user.

    Attributes:
        queryset (QuerySet): Contains all RecentActivity instances.
        serializer_class (Serializer): RecentActivitySerializer for serialization.
        permission_classes (list): Only authenticated users can manage their activities.
    """
    queryset = RecentActivity.objects.all()
    serializer_class = RecentActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter the queryset to only show activities of the current user.

        Returns:
            QuerySet: Filtered queryset of activities belonging to the authenticated user.
        """
        return super().get_queryset().filter(user=self.request.user)

class NetworkHealthViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing network health metrics for the authenticated user.

    Attributes:
        queryset (QuerySet): Contains all NetworkHealth instances.
        serializer_class (Serializer): NetworkHealthSerializer for serialization.
        permission_classes (list): Authentication required for managing network health data.
    """
    queryset = NetworkHealth.objects.all()
    serializer_class = NetworkHealthSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter the queryset to only show network health data of the current user.

        Returns:
            QuerySet: Filtered queryset of network health metrics for the authenticated user.
        """
        return super().get_queryset().filter(user=self.request.user)

class ServerStatusViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing server status for the authenticated user.

    Attributes:
        queryset (QuerySet): Contains all ServerStatus instances.
        serializer_class (Serializer): ServerStatusSerializer for serialization.
        permission_classes (list): Only authenticated users can manage server status data.
    """
    queryset = ServerStatus.objects.all()
    serializer_class = ServerStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter the queryset to only show server status data of the current user.

        Returns:
            QuerySet: Filtered queryset of server statuses for the authenticated user.
        """
        return super().get_queryset().filter(user=self.request.user)