from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Sum, Count
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage
from datetime import datetime, timedelta
import logging

from payments.models.payment_config_model import Transaction
from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import (
    TaxConfiguration,
    ExpenseCategory,
    ManualExpense,
    ReconciliationReport,
    ReconciliationStats
)
from payments.serializers.payment_reconciliation_serializer import (
    TaxConfigurationSerializer,
    ExpenseCategorySerializer,
    ManualExpenseSerializer,
    ReconciliationFilterSerializer,
    ReconciliationSummarySerializer,
    TransactionSummarySerializer,
    ReconciliationReportSerializer
)

logger = logging.getLogger(__name__)

class PaymentReconciliationView(APIView):
    """
    Main view for payment reconciliation
    Combines transaction data with manual expenses and tax calculations
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get reconciliation data with filtering and tax calculations
        """
        try:
            # Validate filter parameters
            filter_serializer = ReconciliationFilterSerializer(data=request.query_params)
            if not filter_serializer.is_valid():
                return Response(
                    {"error": "Invalid filter parameters", "details": filter_serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            filters = filter_serializer.validated_data
            start_date = filters['start_date']
            end_date = filters['end_date']
            view_mode = filters['view_mode']
            search_term = filters.get('search', '')
            sort_by = filters.get('sort_by', 'date_desc')
            
            # Get active tax configurations
            active_taxes = TaxConfiguration.objects.filter(is_enabled=True)
            
            # Get transactions (revenue)
            transactions = TransactionLog.objects.filter(
                created_at__date__range=[start_date, end_date],
                status='success'  # Only successful transactions
            ).select_related('client', 'client__user')
            
            # Get manual expenses
            expenses = ManualExpense.objects.filter(
                date__range=[start_date, end_date]
            ).select_related('category', 'created_by')
            
            # Apply search filter if provided
            if search_term:
                transactions = transactions.filter(
                    Q(transaction_id__icontains=search_term) |
                    Q(client__user__username__icontains=search_term) |
                    Q(payment_method__icontains=search_term)
                )
                expenses = expenses.filter(
                    Q(expense_id__icontains=search_term) |
                    Q(description__icontains=search_term) |
                    Q(category__name__icontains=search_term)
                )
            
            # Apply sorting
            if sort_by == 'date_desc':
                transactions = transactions.order_by('-created_at')
                expenses = expenses.order_by('-date')
            elif sort_by == 'date_asc':
                transactions = transactions.order_by('created_at')
                expenses = expenses.order_by('date')
            elif sort_by == 'amount_desc':
                transactions = transactions.order_by('-amount')
                expenses = expenses.order_by('-amount')
            elif sort_by == 'amount_asc':
                transactions = transactions.order_by('amount')
                expenses = expenses.order_by('amount')
            
            # Calculate tax breakdowns
            revenue_summary = self._calculate_tax_breakdown(
                transactions, active_taxes.filter(applies_to__in=['revenue', 'both']), 'revenue'
            )
            
            expense_summary = self._calculate_tax_breakdown(
                expenses, active_taxes.filter(applies_to__in=['expenses', 'both']), 'expenses'
            )
            
            # Prepare response data
            response_data = {
                'revenue': {
                    'transactions': TransactionSummarySerializer(transactions, many=True).data,
                    'summary': revenue_summary
                },
                'expenses': {
                    'expenses': ManualExpenseSerializer(expenses, many=True).data,
                    'summary': expense_summary
                },
                'overall_summary': self._calculate_overall_summary(revenue_summary, expense_summary),
                'tax_configuration': TaxConfigurationSerializer(active_taxes, many=True).data,
                'filters': filters
            }
            
            # Filter by view mode if needed
            if view_mode == 'revenue':
                del response_data['expenses']
            elif view_mode == 'expenses':
                del response_data['revenue']
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to fetch reconciliation data: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch reconciliation data", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_tax_breakdown(self, queryset, taxes, record_type):
        """Calculate tax breakdown for transactions or expenses"""
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
        tax_breakdown = []
        for tax in taxes:
            tax_amount = sum(tax.calculate_tax(item.amount) for item in queryset)
            tax_breakdown.append({
                'tax_id': str(tax.id),
                'tax_name': tax.name,
                'tax_rate': float(tax.rate),
                'tax_amount': float(tax_amount),
                'taxable_amount': float(total_amount),
                'is_included': tax.is_included_in_price
            })
        
        net_amount = total_amount
        if record_type == 'revenue':
            # For revenue, subtract included taxes to get net
            included_taxes = [t for t in tax_breakdown if t['is_included']]
            for tax in included_taxes:
                net_amount -= tax['tax_amount']
        else:
            # For expenses, add excluded taxes to get gross
            excluded_taxes = [t for t in tax_breakdown if not t['is_included']]
            for tax in excluded_taxes:
                net_amount += tax['tax_amount']
        
        return {
            'total_amount': float(total_amount),
            'net_amount': float(net_amount),
            'tax_breakdown': tax_breakdown,
            'record_count': queryset.count()
        }
    
    def _calculate_overall_summary(self, revenue_summary, expense_summary):
        """Calculate overall reconciliation summary"""
        total_revenue_tax = sum(tax['tax_amount'] for tax in revenue_summary['tax_breakdown'])
        total_expense_tax = sum(tax['tax_amount'] for tax in expense_summary['tax_breakdown'])
        
        return {
            'total_revenue': revenue_summary['total_amount'],
            'total_expenses': expense_summary['total_amount'],
            'total_tax': total_revenue_tax + total_expense_tax,
            'net_revenue': revenue_summary['net_amount'],
            'net_expenses': expense_summary['net_amount'],
            'net_profit': revenue_summary['net_amount'] - expense_summary['net_amount'] - total_expense_tax
        }

class TaxConfigurationView(APIView):
    """View for managing tax configurations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all tax configurations"""
        try:
            taxes = TaxConfiguration.objects.all()
            serializer = TaxConfigurationSerializer(taxes, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch tax configurations: {str(e)}")
            return Response(
                {"error": "Failed to fetch tax configurations"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create new tax configuration"""
        try:
            serializer = TaxConfigurationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create tax configuration: {str(e)}")
            return Response(
                {"error": "Failed to create tax configuration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ExpenseCategoryView(APIView):
    """View for managing expense categories"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all expense categories"""
        try:
            categories = ExpenseCategory.objects.filter(is_active=True)
            serializer = ExpenseCategorySerializer(categories, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch expense categories: {str(e)}")
            return Response(
                {"error": "Failed to fetch expense categories"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create new expense category"""
        try:
            serializer = ExpenseCategorySerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create expense category: {str(e)}")
            return Response(
                {"error": "Failed to create expense category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ManualExpenseView(APIView):
    """View for managing manual expenses"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get manual expenses with filtering"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            expenses = ManualExpense.objects.all()
            
            if start_date and end_date:
                expenses = expenses.filter(date__range=[start_date, end_date])
            
            serializer = ManualExpenseSerializer(expenses, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch manual expenses: {str(e)}")
            return Response(
                {"error": "Failed to fetch manual expenses"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create new manual expense"""
        try:
            serializer = ManualExpenseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create manual expense: {str(e)}")
            return Response(
                {"error": "Failed to create manual expense"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReconciliationReportView(APIView):
    """View for generating and managing reconciliation reports"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate reconciliation report"""
        try:
            # Get filter parameters
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            report_type = request.data.get('report_type', 'custom')
            
            if not start_date or not end_date:
                return Response(
                    {"error": "Start date and end date are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate reconciliation data
            reconciliation_view = PaymentReconciliationView()
            filter_serializer = ReconciliationFilterSerializer(data={
                'start_date': start_date,
                'end_date': end_date,
                'view_mode': 'all'
            })
            
            if not filter_serializer.is_valid():
                return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # This would normally call the reconciliation logic
            # For now, we'll create a basic report
            report = ReconciliationReport.objects.create(
                report_type=report_type,
                start_date=start_date,
                end_date=end_date,
                generated_by=request.user
            )
            
            serializer = ReconciliationReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to generate reconciliation report: {str(e)}")
            return Response(
                {"error": "Failed to generate reconciliation report"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """Get generated reports"""
        try:
            reports = ReconciliationReport.objects.all().order_by('-created_at')[:10]
            serializer = ReconciliationReportSerializer(reports, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch reconciliation reports: {str(e)}")
            return Response(
                {"error": "Failed to fetch reconciliation reports"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )