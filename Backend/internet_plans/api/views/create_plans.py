from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import IntegrityError
from internet_plans.models.create_plans import InternetPlan
from internet_plans.serializers.create_plans import InternetPlanSerializer
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class for setting default page size and max page size.
    """
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 1000

class InternetPlanViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing InternetPlan instances.
    
    Attributes:
        queryset: All instances of InternetPlan.
        serializer_class: The serializer to use for serialization/deserialization.
        pagination_class: Handles pagination for list view.
    
    Methods:
        create: Handles the creation of a new InternetPlan, with error handling for duplicate names.
    """
    queryset = InternetPlan.objects.all()
    serializer_class = InternetPlanSerializer
    pagination_class = StandardResultsSetPagination

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError:
            # Handle the case where a plan name is not unique
            return Response(
                {"error": "A plan with this name already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)