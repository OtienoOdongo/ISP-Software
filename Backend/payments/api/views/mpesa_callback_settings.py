from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from payments.models import MpesaCallback
from payments.serializers import MpesaCallbackSerializer
from django.db.models import Q

class MpesaCallbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing M-Pesa callbacks, providing CRUD operations and custom actions.

    Attributes:
        queryset: All MpesaCallback instances.
        serializer_class: Serializer for MpesaCallback model.
    """
    queryset = MpesaCallback.objects.all()
    serializer_class = MpesaCallbackSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Custom action for searching callbacks by event.

        :param request: HTTP request object with query parameters for search.
        :return: Filtered queryset of callbacks.
        """
        search_term = request.query_params.get('search', '')
        filter_term = request.query_params.get('filter', 'all')
        
        queryset = self.queryset

        if search_term:
            queryset = queryset.filter(event__icontains=search_term)

        if filter_term != 'all':
            queryset = queryset.filter(event=filter_term)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_or_update(self, request):
        """
        Custom action for adding or updating a callback.

        :param request: HTTP request object with callback data in the body.
        :return: Response with the serialized callback data or error message.
        """
        data = request.data
        if 'id' in data:
            try:
                instance = MpesaCallback.objects.get(id=data['id'])
                serializer = self.get_serializer(instance, data=data, partial=True)
            except MpesaCallback.DoesNotExist:
                return Response({'error': 'Callback not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED if 'id' not in data else status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        """
        Custom action for deleting a specific callback.

        :param request: HTTP request object.
        :param pk: Primary key of the callback to delete.
        :return: Response indicating success or failure.
        """
        try:
            callback = self.get_object()
            callback.delete()
            return Response({"message": "Callback deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except MpesaCallback.DoesNotExist:
            return Response({"error": "Callback not found."}, status=status.HTTP_404_NOT_FOUND)