




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from user_management.serializers.user_serializer import ClientProfileSerializer
from account.models.admin_model import Client, ActivityLog
from account.serializers.admin_serializer import ClientSerializer
from django.db.models import Q
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class FlexibleResultsSetPagination(PageNumberPagination):
    page_size_query_param = 'page_size'  # Allow frontend to specify page_size
    max_page_size = None  # Remove maximum page size limit

    def get_page_size(self, request):
        # Use page_size from query params if provided, otherwise fetch all (no default limit)
        page_size = request.query_params.get(self.page_size_query_param)
        if page_size and page_size.isdigit():
            return int(page_size)
        return None  # None means no pagination limit (fetch all if requested)

class UserProfileListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = FlexibleResultsSetPagination

    def get(self, request):
        try:
            queryset = Client.objects.all()
            # Apply filters
            search = request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(full_name__icontains=search) | Q(phonenumber__icontains=search)
                )

            # Apply sorting
            sort_by = request.query_params.get('sort_by', 'created_at')
            sort_order = request.query_params.get('sort_order', 'desc')
            if sort_order == 'desc':
                sort_by = f'-{sort_by}'
            queryset = queryset.order_by(sort_by)

            # Paginate
            paginator = self.pagination_class()
            # If page_size is None, return all results without pagination
            if paginator.get_page_size(request) is None:
                serializer = ClientProfileSerializer(queryset, many=True, context={'request': request})
                return Response({
                    'count': queryset.count(),
                    'next': None,
                    'previous': None,
                    'results': serializer.data
                })
            else:
                page = paginator.paginate_queryset(queryset, request)
                serializer = ClientProfileSerializer(page, many=True, context={'request': request})
                return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Error in UserProfileListView: {str(e)}")
            return Response({"error": "Failed to retrieve user profiles."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Client.objects.get(pk=pk)
        except Client.DoesNotExist:
            return None

    def get(self, request, pk):
        client = self.get_object(pk)
        if not client:
            logger.error(f"Client with pk={pk} not found")
            return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ClientProfileSerializer(client, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        client = self.get_object(pk)
        if not client:
            logger.error(f"Client with pk={pk} not found")
            return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClientSerializer(client, data=request.data, partial=True)
        if serializer.is_valid():
            # Check for unique phonenumber
            new_phonenumber = serializer.validated_data.get('phonenumber', client.phonenumber)
            if new_phonenumber != client.phonenumber and Client.objects.filter(phonenumber=new_phonenumber).exclude(pk=pk).exists():
                logger.debug(f"Phone number {new_phonenumber} already in use")
                return Response({"error": "Phone number already in use."}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save()
            # Log the update activity
            ActivityLog.objects.create(
                description=f"Client updated: {client.full_name} ({client.phonenumber}) by {request.user.name}",
                user=request.user
            )
            logger.debug(f"Client pk={pk} updated successfully")
            # Return updated profile
            updated_serializer = ClientProfileSerializer(client, context={'request': request})
            return Response(updated_serializer.data, status=status.HTTP_200_OK)
        
        logger.error(f"Client update failed: {serializer.errors}")
        return Response({"error": "Failed to update user.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)