from rest_framework import viewsets
from ...models import UserProfile
from ...serializers import UserProfileSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user profiles. Provides standard actions
    like list, create, retrieve, update, and destroy.

    Attributes:
        queryset (QuerySet): All UserProfile objects.
        serializer_class (UserProfileSerializer): Serializer to use for the data.

    Methods:
        update: Overrides the default update method to handle suspending/un-suspending users.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def update(self, request, *args, **kwargs):
        """
        Updates the user profile, specifically handling the suspend functionality
        by toggling the 'active' status of the user.

        Args:
            request: The HTTP request object.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments.

        Returns:
            Response: Serialized data of the updated user profile.
        """
        instance = self.get_object()
        # Toggle the active status
        instance.active = not instance.active
        instance.save()
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)