from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
import logging

from user_management.models.user_profile import UserProfile
from user_management.serializers.user_profile import UserProfileSerializer

logger = logging.getLogger(__name__)

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user profiles. Provides standard actions
    like list, create, retrieve, update, and destroy.

    Attributes:
        queryset (QuerySet): All UserProfile objects.
        serializer_class (UserProfileSerializer): Serializer to use for the data.
        permission_classes (list): List of permission classes for this viewset.

    Methods:
        update: Overrides the default update method to handle suspending/un-suspending users.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Updates the user profile, specifically handling the suspend functionality
        by toggling the 'active' status of the user.

        Args:
            request: The HTTP request object.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments.

        Returns:
            Response: Serialized data of the updated user profile with updated status message.
        """
        instance = self.get_object()
        original_status = instance.active
        instance.active = not instance.active

        try:
            instance.save()
            logger.info(f"User {instance.id}'s status changed from {original_status} to {instance.active}")

            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response({
                "message": f"User status updated to {'active' if instance.active else 'suspended'}",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)