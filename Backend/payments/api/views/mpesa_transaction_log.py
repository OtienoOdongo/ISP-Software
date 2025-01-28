from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from payments.models.mpesa_transaction_log import MpesaTransaction
from payments.serializers.mpesa_transaction_log import MpesaTransactionSerializer
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class MpesaTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing M-Pesa transactions, providing CRUD operations and custom actions.

    Attributes:
        queryset: All MpesaTransaction instances.
        serializer_class: Serializer for MpesaTransaction model.
        permission_classes: Only authenticated users can access this viewset.
    """
    queryset = MpesaTransaction.objects.all()
    serializer_class = MpesaTransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """
        Custom queryset method to filter transactions based on query parameters.
        """
        queryset = MpesaTransaction.objects.all()
        search_term = self.request.query_params.get('search', '')
        status = self.request.query_params.get('status', '')
        time_range = self.request.query_params.get('time', 'Daily').capitalize()

        if search_term:
            queryset = queryset.filter(
                Q(transaction_id__icontains=search_term) | Q(user__username__icontains=search_term)
            )

        if status and status != 'all':
            queryset = queryset.filter(status__iexact=status)

        now = timezone.now()
        valid_ranges = {'Daily': timedelta(days=1), 'Weekly': timedelta(weeks=1), 'Monthly': timedelta(days=30)}
        if time_range in valid_ranges:
            queryset = queryset.filter(date__gte=now - valid_ranges[time_range])

        return queryset.order_by('-date')

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Custom action to update the status of a transaction.

        :param request: HTTP request containing the new status.
        :param pk: Primary key of the transaction to update.
        :return: Response with updated transaction or error message.
        """
        try:
            transaction = self.get_object()
        except MpesaTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status in ['Success', 'Pending', 'Failed']:
            transaction.status = new_status
            transaction.save()
            return Response(MpesaTransactionSerializer(transaction).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def generate_report(self, request):
        """
        Custom action to generate a report of transactions based on user and time range.

        :param request: HTTP request containing user and time range parameters.
        :return: Response indicating successful generation of report or error.
        """
        user = request.query_params.get('user', 'All Users')
        time_range = request.query_params.get('time', 'Daily').capitalize()

        queryset = self.get_queryset()
        if user != 'All Users':
            queryset = queryset.filter(user__username=user)

        # Example response for report generation
        return Response({'message': f'Report for {user} generated for {time_range} period.'})
