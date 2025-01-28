from rest_framework import viewsets
from user_management.models.activity_log import UserActivity
from user_management.serializers.activity_log import UserActivitySerializer

class UserActivityViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and managing user activities. 
    Provides standard actions
    like list, create, retrieve, update, and destroy.

    Attributes:
        queryset (QuerySet): All UserActivity objects.
        serializer_class (UserActivitySerializer): Serializer to use for the data.

    Methods:
        None specific, uses default ModelViewSet methods.
    """
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer

    def get_queryset(self):
        """
        Overrides the default queryset to filter activities based on the user ID
        provided in the URL.

        Returns:
            QuerySet: Filtered by user if a user ID is provided in the query parameters.
        """
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return self.queryset.filter(user_id=user_id)
        return self.queryset