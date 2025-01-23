from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from payments.models import PaymentTransaction
from payments.serializers import PaymentTransactionSerializer
from django.db.models import Q
from django.utils import timezone
import csv
from io import StringIO

class PaymentReconciliationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing payment transaction reconciliation.

    Attributes:
        queryset: All PaymentTransaction instances.
        serializer_class: Serializer for PaymentTransaction model.
    """
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer

    def get_queryset(self):
        """
        Custom queryset method to filter transactions based on query parameters.
        """
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', '')
        start_date = self.request.query_params.get('start_date', '')
        end_date = self.request.query_params.get('end_date', '')
        status = self.request.query_params.get('status', 'all')

        if search_term:
            queryset = queryset.filter(reference__icontains=search_term)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)

        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        if status and status != 'all':
            queryset = queryset.filter(status__iexact=status)

        sort_column = self.request.query_params.get('sort_column', 'date')
        sort_direction = self.request.query_params.get('sort_direction', 'asc')
        queryset = queryset.order_by(f"{'' if sort_direction == 'asc' else '-'}{sort_column}")

        return queryset

    @action(detail=False, methods=['get'])
    def download_csv(self, request):
        """
        Custom action to generate and download a CSV report of filtered transactions.

        :param request: HTTP request object with query parameters for filtering.
        :return: CSV response with transaction data.
        """
        queryset = self.filter_queryset(self.get_queryset())
        if not queryset.exists():
            return Response({'error': 'No transactions match the criteria.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        csv_file = StringIO()
        csv_writer = csv.writer(csv_file)

        # Write headers
        csv_writer.writerow(['ID', 'Date', 'Amount', 'Status', 'Type', 'Reference'])

        # Write data
        for transaction in queryset:
            csv_writer.writerow([
                transaction.id, 
                transaction.date.isoformat(), 
                transaction.amount, 
                transaction.status, 
                transaction.type, 
                transaction.reference
            ])

        csv_file.seek(0)
        response = Response(csv_file.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="reconciliation_report.csv"'
        return response

    @action(detail=False, methods=['get'])
    def total_earnings(self, request):
        """
        Custom action to calculate and return total earnings from filtered transactions.

        :param request: HTTP request object with query parameters for filtering.
        :return: Total earnings in KES.
        """
        queryset = self.filter_queryset(self.get_queryset())
        total = sum(float(transaction.amount) for transaction in queryset)
        return Response({"total_earnings": f"{total:.2f}"})