



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import Q, Sum, Count
# from django.utils import timezone
# from django.core.paginator import Paginator, EmptyPage
# from datetime import datetime, timedelta
# import logging

# from payments.models.payment_config_model import Transaction
# from payments.models.transaction_log_model import TransactionLog
# from payments.models.payment_reconciliation_model import (
#     TaxConfiguration,
#     ExpenseCategory,
#     ManualExpense,
#     ReconciliationReport,
#     ReconciliationStats
# )
# from payments.serializers.payment_reconciliation_serializer import (
#     TaxConfigurationSerializer,
#     ExpenseCategorySerializer,
#     ManualExpenseSerializer,
#     ReconciliationFilterSerializer,
#     ReconciliationSummarySerializer,
#     TransactionSummarySerializer,
#     ReconciliationReportSerializer
# )

# logger = logging.getLogger(__name__)

# class PaymentReconciliationView(APIView):
#     """
#     Main view for payment reconciliation
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get reconciliation data with filtering and tax calculations
#         """
#         try:
#             # Validate filter parameters
#             filter_serializer = ReconciliationFilterSerializer(data=request.query_params)
#             if not filter_serializer.is_valid():
#                 return Response(
#                     {"error": "Invalid filter parameters", "details": filter_serializer.errors},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             filters = filter_serializer.validated_data
#             start_date = filters['start_date']
#             end_date = filters['end_date']
#             view_mode = filters['view_mode']
#             search_term = filters.get('search', '')
#             sort_by = filters.get('sort_by', 'date_desc')
            
#             # Get active tax configurations
#             active_taxes = TaxConfiguration.objects.filter(is_enabled=True)
            
#             # Get transactions (revenue)
#             transactions = TransactionLog.objects.filter(
#                 created_at__date__range=[start_date, end_date],
#                 status='success'
#             ).select_related('client', 'client__user')
            
#             # Get manual expenses
#             expenses = ManualExpense.objects.filter(
#                 date__range=[start_date, end_date]
#             ).select_related('category', 'created_by')
            
#             # Apply search filter if provided
#             if search_term:
#                 transactions = transactions.filter(
#                     Q(transaction_id__icontains=search_term) |
#                     Q(client__user__username__icontains=search_term) |
#                     Q(payment_method__icontains=search_term)
#                 )
#                 expenses = expenses.filter(
#                     Q(expense_id__icontains=search_term) |
#                     Q(description__icontains=search_term) |
#                     Q(category__name__icontains=search_term)
#                 )
            
#             # Apply sorting
#             if sort_by == 'date_desc':
#                 transactions = transactions.order_by('-created_at')
#                 expenses = expenses.order_by('-date')
#             elif sort_by == 'date_asc':
#                 transactions = transactions.order_by('created_at')
#                 expenses = expenses.order_by('date')
#             elif sort_by == 'amount_desc':
#                 transactions = transactions.order_by('-amount')
#                 expenses = expenses.order_by('-amount')
#             elif sort_by == 'amount_asc':
#                 transactions = transactions.order_by('amount')
#                 expenses = expenses.order_by('amount')
            
#             # Calculate tax breakdowns
#             revenue_summary = self._calculate_tax_breakdown(
#                 transactions, active_taxes.filter(applies_to__in=['revenue', 'both']), 'revenue'
#             )
            
#             expense_summary = self._calculate_tax_breakdown(
#                 expenses, active_taxes.filter(applies_to__in=['expenses', 'both']), 'expenses'
#             )
            
#             # Prepare response data
#             response_data = {
#                 'revenue': {
#                     'transactions': TransactionSummarySerializer(transactions, many=True).data,
#                     'summary': revenue_summary
#                 },
#                 'expenses': {
#                     'expenses': ManualExpenseSerializer(expenses, many=True).data,
#                     'summary': expense_summary
#                 },
#                 'overall_summary': self._calculate_overall_summary(revenue_summary, expense_summary),
#                 'tax_configuration': TaxConfigurationSerializer(active_taxes, many=True).data,
#                 'filters': filters
#             }
            
#             # Filter by view mode if needed
#             if view_mode == 'revenue':
#                 del response_data['expenses']
#             elif view_mode == 'expenses':
#                 del response_data['revenue']
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to fetch reconciliation data: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch reconciliation data", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _calculate_tax_breakdown(self, queryset, taxes, record_type):
#         """Calculate tax breakdown for transactions or expenses"""
#         total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
#         tax_breakdown = []
#         for tax in taxes:
#             tax_amount = sum(tax.calculate_tax(item.amount) for item in queryset)
#             tax_breakdown.append({
#                 'tax_id': str(tax.id),
#                 'tax_name': tax.name,
#                 'tax_rate': float(tax.rate),
#                 'tax_amount': float(tax_amount),
#                 'taxable_amount': float(total_amount),
#                 'is_included': tax.is_included_in_price
#             })
        
#         net_amount = total_amount
#         if record_type == 'revenue':
#             # For revenue, subtract included taxes to get net
#             included_taxes = [t for t in tax_breakdown if t['is_included']]
#             for tax in included_taxes:
#                 net_amount -= tax['tax_amount']
#         else:
#             # For expenses, add excluded taxes to get gross
#             excluded_taxes = [t for t in tax_breakdown if not t['is_included']]
#             for tax in excluded_taxes:
#                 net_amount += tax['tax_amount']
        
#         return {
#             'total_amount': float(total_amount),
#             'net_amount': float(net_amount),
#             'tax_breakdown': tax_breakdown,
#             'record_count': queryset.count()
#         }
    
#     def _calculate_overall_summary(self, revenue_summary, expense_summary):
#         """Calculate overall reconciliation summary"""
#         total_revenue_tax = sum(tax['tax_amount'] for tax in revenue_summary['tax_breakdown'])
#         total_expense_tax = sum(tax['tax_amount'] for tax in expense_summary['tax_breakdown'])
        
#         return {
#             'total_revenue': revenue_summary['total_amount'],
#             'total_expenses': expense_summary['total_amount'],
#             'total_tax': total_revenue_tax + total_expense_tax,
#             'net_revenue': revenue_summary['net_amount'],
#             'net_expenses': expense_summary['net_amount'],
#             'net_profit': revenue_summary['net_amount'] - expense_summary['net_amount'] - total_expense_tax
#         }

# class TaxConfigurationView(APIView):
#     """View for managing tax configurations"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get all tax configurations"""
#         try:
#             taxes = TaxConfiguration.objects.all()
#             serializer = TaxConfigurationSerializer(taxes, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch tax configurations: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch tax configurations"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request):
#         """Create new tax configuration"""
#         try:
#             serializer = TaxConfigurationSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save(created_by=request.user)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create tax configuration: {str(e)}")
#             return Response(
#                 {"error": "Failed to create tax configuration"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ExpenseCategoryView(APIView):
#     """View for managing expense categories"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get all expense categories"""
#         try:
#             categories = ExpenseCategory.objects.filter(is_active=True)
#             serializer = ExpenseCategorySerializer(categories, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch expense categories: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch expense categories"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request):
#         """Create new expense category"""
#         try:
#             serializer = ExpenseCategorySerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save(created_by=request.user)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create expense category: {str(e)}")
#             return Response(
#                 {"error": "Failed to create expense category"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ManualExpenseView(APIView):
#     """View for managing manual expenses"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get manual expenses with filtering"""
#         try:
#             start_date = request.query_params.get('start_date')
#             end_date = request.query_params.get('end_date')
            
#             expenses = ManualExpense.objects.all()
            
#             if start_date and end_date:
#                 expenses = expenses.filter(date__range=[start_date, end_date])
            
#             serializer = ManualExpenseSerializer(expenses, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch manual expenses: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch manual expenses"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request):
#         """Create new manual expense"""
#         try:
#             serializer = ManualExpenseSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save(created_by=request.user)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create manual expense: {str(e)}")
#             return Response(
#                 {"error": "Failed to create manual expense"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ReconciliationReportView(APIView):
#     """View for generating and managing reconciliation reports"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         """Generate reconciliation report"""
#         try:
#             start_date = request.data.get('start_date')
#             end_date = request.data.get('end_date')
#             report_type = request.data.get('report_type', 'custom')
            
#             if not start_date or not end_date:
#                 return Response(
#                     {"error": "Start date and end date are required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Calculate reconciliation data
#             reconciliation_view = PaymentReconciliationView()
#             filter_serializer = ReconciliationFilterSerializer(data={
#                 'start_date': start_date,
#                 'end_date': end_date,
#                 'view_mode': 'all'
#             })
            
#             if not filter_serializer.is_valid():
#                 return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create report
#             report = ReconciliationReport.objects.create(
#                 report_type=report_type,
#                 start_date=start_date,
#                 end_date=end_date,
#                 generated_by=request.user
#             )
            
#             serializer = ReconciliationReportSerializer(report)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to generate reconciliation report: {str(e)}")
#             return Response(
#                 {"error": "Failed to generate reconciliation report"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def get(self, request):
#         """Get generated reports"""
#         try:
#             reports = ReconciliationReport.objects.all().order_by('-created_at')[:10]
#             serializer = ReconciliationReportSerializer(reports, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch reconciliation reports: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch reconciliation reports"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )







from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from django.core.paginator import Paginator, EmptyPage
from datetime import datetime, timedelta
import logging
from django.core.cache import cache
from django.db import transaction as db_transaction

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
    ReconciliationReportSerializer,
    AccessTypeRevenueSerializer
)

logger = logging.getLogger(__name__)

class PaymentReconciliationView(APIView):
    """
    Enhanced payment reconciliation with PPPoE/Hotspot support
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get enhanced reconciliation data with access type breakdown
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
            access_type_filter = filters['access_type']
            search_term = filters.get('search', '')
            sort_by = filters.get('sort_by', 'date_desc')
            
            # Generate cache key
            cache_key = f"reconciliation_{start_date}_{end_date}_{view_mode}_{access_type_filter}_{search_term}_{sort_by}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get active tax configurations
            active_taxes = TaxConfiguration.objects.filter(is_enabled=True)
            
            # Get transactions with access type filtering
            transactions = TransactionLog.objects.filter(
                created_at__date__range=[start_date, end_date],
                status='success'
            ).select_related('client', 'client__user')
            
            # Apply access type filter
            if access_type_filter != 'all':
                transactions = transactions.filter(access_type=access_type_filter)
            
            # Get manual expenses with access type filtering
            expenses = ManualExpense.objects.filter(
                date__range=[start_date, end_date]
            ).select_related('category', 'created_by')
            
            # Apply access type filter to expenses
            if access_type_filter != 'all':
                expenses = expenses.filter(access_type=access_type_filter)
            
            # Apply search filter if provided
            if search_term:
                transactions = transactions.filter(
                    Q(transaction_id__icontains=search_term) |
                    Q(client__user__username__icontains=search_term) |
                    Q(payment_method__icontains=search_term) |
                    Q(access_type__icontains=search_term)
                )
                expenses = expenses.filter(
                    Q(expense_id__icontains=search_term) |
                    Q(description__icontains=search_term) |
                    Q(category__name__icontains=search_term) |
                    Q(access_type__icontains=search_term)
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
            elif sort_by == 'access_type':
                transactions = transactions.order_by('access_type')
                expenses = expenses.order_by('access_type')
            
            # Calculate enhanced tax breakdowns with access type
            revenue_summary = self._calculate_enhanced_tax_breakdown(
                transactions, active_taxes.filter(applies_to__in=['revenue', 'both']), 'revenue'
            )
            
            expense_summary = self._calculate_enhanced_tax_breakdown(
                expenses, active_taxes.filter(applies_to__in=['expenses', 'both']), 'expenses'
            )
            
            # Calculate access type breakdown
            access_type_breakdown = self._calculate_access_type_breakdown(transactions, expenses)
            
            # Prepare enhanced response data
            response_data = {
                'revenue': {
                    'transactions': TransactionSummarySerializer(transactions, many=True).data,
                    'summary': revenue_summary
                },
                'expenses': {
                    'expenses': ManualExpenseSerializer(expenses, many=True).data,
                    'summary': expense_summary
                },
                'overall_summary': self._calculate_enhanced_overall_summary(
                    revenue_summary, expense_summary, access_type_breakdown
                ),
                'access_type_breakdown': access_type_breakdown,
                'tax_configuration': TaxConfigurationSerializer(active_taxes, many=True).data,
                'filters': filters
            }
            
            # Filter by view mode if needed
            if view_mode == 'revenue':
                del response_data['expenses']
            elif view_mode == 'expenses':
                del response_data['revenue']
            
            # Cache the response for 2 minutes
            cache.set(cache_key, response_data, 120)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to fetch enhanced reconciliation data: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch reconciliation data", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_enhanced_tax_breakdown(self, queryset, taxes, record_type):
        """Calculate enhanced tax breakdown with access type support"""
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate amounts by access type
        access_type_totals = {}
        for item in queryset:
            access_type = getattr(item, 'access_type', 'general')
            if access_type not in access_type_totals:
                access_type_totals[access_type] = 0
            access_type_totals[access_type] += float(item.amount)
        
        tax_breakdown = []
        for tax in taxes:
            total_tax_amount = 0
            access_type_tax = {}
            
            for access_type, amount in access_type_totals.items():
                if tax._applies_to_access_type(access_type):
                    tax_amount = tax.calculate_tax(amount, access_type)
                    total_tax_amount += tax_amount
                    access_type_tax[access_type] = float(tax_amount)
            
            tax_breakdown.append({
                'tax_id': str(tax.id),
                'tax_name': tax.name,
                'tax_rate': float(tax.rate),
                'tax_amount': float(total_tax_amount),
                'taxable_amount': float(total_amount),
                'is_included': tax.is_included_in_price,
                'access_type_tax': access_type_tax
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
            'record_count': queryset.count(),
            'access_type_totals': access_type_totals
        }
    
    def _calculate_access_type_breakdown(self, transactions, expenses):
        """Calculate detailed access type breakdown"""
        # Revenue by access type
        revenue_by_access = transactions.values('access_type').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        )
        
        # Expenses by access type
        expense_by_access = expenses.values('access_type').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        )
        
        # Initialize breakdown
        breakdown = {
            'hotspot': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0},
            'pppoe': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0},
            'both': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0},
            'combined': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0}
        }
        
        # Populate revenue data
        for item in revenue_by_access:
            access_type = item['access_type']
            if access_type in breakdown:
                breakdown[access_type]['revenue'] = float(item['total_amount'] or 0)
                breakdown[access_type]['count'] = item['count']
                breakdown['combined']['revenue'] += float(item['total_amount'] or 0)
                breakdown['combined']['count'] += item['count']
        
        # Populate expense data
        for item in expense_by_access:
            access_type = item['access_type']
            if access_type in breakdown:
                breakdown[access_type]['expenses'] = float(item['total_amount'] or 0)
                breakdown['combined']['expenses'] += float(item['total_amount'] or 0)
        
        # Calculate profits
        for access_type in ['hotspot', 'pppoe', 'both', 'combined']:
            breakdown[access_type]['profit'] = (
                breakdown[access_type]['revenue'] - breakdown[access_type]['expenses']
            )
        
        return breakdown
    
    def _calculate_enhanced_overall_summary(self, revenue_summary, expense_summary, access_type_breakdown):
        """Calculate enhanced overall summary with combined metrics"""
        total_revenue_tax = sum(tax['tax_amount'] for tax in revenue_summary['tax_breakdown'])
        total_expense_tax = sum(tax['tax_amount'] for tax in expense_summary['tax_breakdown'])
        
        combined_revenue = access_type_breakdown['combined']['revenue']
        combined_expenses = access_type_breakdown['combined']['expenses']
        combined_profit = combined_revenue - combined_expenses - total_expense_tax
        
        # Calculate revenue distribution
        total_revenue = access_type_breakdown['combined']['revenue']
        revenue_distribution = {}
        if total_revenue > 0:
            for access_type in ['hotspot', 'pppoe', 'both']:
                percentage = (access_type_breakdown[access_type]['revenue'] / total_revenue) * 100
                revenue_distribution[access_type] = round(percentage, 2)
        
        return {
            'total_revenue': revenue_summary['total_amount'],
            'total_expenses': expense_summary['total_amount'],
            'total_tax': total_revenue_tax + total_expense_tax,
            'net_revenue': revenue_summary['net_amount'],
            'net_expenses': expense_summary['net_amount'],
            'net_profit': revenue_summary['net_amount'] - expense_summary['net_amount'] - total_expense_tax,
            'combined_revenue': combined_revenue,
            'combined_profit': combined_profit,
            'revenue_distribution': revenue_distribution
        }


class AccessTypeAnalyticsView(APIView):
    """
    Analytics view for PPPoE vs Hotspot comparison
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get comprehensive access type analytics
        """
        try:
            days = int(request.query_params.get('days', 30))
            cache_key = f"access_type_analytics_{days}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Get revenue by access type over time
            daily_revenue = TransactionLog.objects.filter(
                created_at__date__range=[start_date, end_date],
                status='success'
            ).extra({
                'date': "DATE(created_at)"
            }).values('date', 'access_type').annotate(
                total_amount=Sum('amount'),
                count=Count('id')
            ).order_by('date')
            
            # Get expense by access type over time
            daily_expenses = ManualExpense.objects.filter(
                date__range=[start_date, end_date]
            ).values('date', 'access_type').annotate(
                total_amount=Sum('amount'),
                count=Count('id')
            ).order_by('date')
            
            # Process revenue data
            revenue_data = self._process_daily_data(daily_revenue, 'revenue')
            expense_data = self._process_daily_data(daily_expenses, 'expenses')
            
            # Calculate summary statistics
            summary = self._calculate_analytics_summary(start_date, end_date)
            
            analytics_data = {
                'revenue_trends': revenue_data,
                'expense_trends': expense_data,
                'summary': summary,
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                }
            }
            
            cache.set(cache_key, analytics_data, 300)  # Cache for 5 minutes
            return Response(analytics_data)
            
        except Exception as e:
            logger.error(f"Failed to fetch access type analytics: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch analytics data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _process_daily_data(self, queryset, data_type):
        """Process daily data for charts"""
        dates = []
        hotspot_data = []
        pppoe_data = []
        both_data = []
        
        current_date = None
        daily_totals = {'hotspot': 0, 'pppoe': 0, 'both': 0}
        
        for item in queryset:
            date_str = item['date'].isoformat() if hasattr(item['date'], 'isoformat') else str(item['date'])
            
            if date_str != current_date and current_date is not None:
                dates.append(current_date)
                hotspot_data.append(daily_totals['hotspot'])
                pppoe_data.append(daily_totals['both_data'])
                both_data.append(daily_totals['both'])
                daily_totals = {'hotspot': 0, 'pppoe': 0, 'both': 0}
            
            current_date = date_str
            access_type = item['access_type']
            amount = float(item['total_amount'] or 0)
            
            if access_type in daily_totals:
                daily_totals[access_type] = amount
        
        # Add the last day
        if current_date:
            dates.append(current_date)
            hotspot_data.append(daily_totals['hotspot'])
            pppoe_data.append(daily_totals['pppoe'])
            both_data.append(daily_totals['both'])
        
        return {
            'dates': dates,
            'hotspot': hotspot_data,
            'pppoe': pppoe_data,
            'both': both_data
        }
    
    def _calculate_analytics_summary(self, start_date, end_date):
        """Calculate comprehensive analytics summary"""
        # Revenue statistics
        revenue_stats = TransactionLog.objects.filter(
            created_at__date__range=[start_date, end_date],
            status='success'
        ).values('access_type').annotate(
            total_amount=Sum('amount'),
            avg_amount=Avg('amount'),
            count=Count('id')
        )
        
        # Expense statistics
        expense_stats = ManualExpense.objects.filter(
            date__range=[start_date, end_date]
        ).values('access_type').annotate(
            total_amount=Sum('amount'),
            avg_amount=Avg('amount'),
            count=Count('id')
        )
        
        summary = {
            'revenue': {},
            'expenses': {},
            'profitability': {}
        }
        
        # Process revenue stats
        for stat in revenue_stats:
            access_type = stat['access_type']
            summary['revenue'][access_type] = {
                'total': float(stat['total_amount'] or 0),
                'average': float(stat['avg_amount'] or 0),
                'count': stat['count']
            }
        
        # Process expense stats
        for stat in expense_stats:
            access_type = stat['access_type']
            summary['expenses'][access_type] = {
                'total': float(stat['total_amount'] or 0),
                'average': float(stat['avg_amount'] or 0),
                'count': stat['count']
            }
        
        # Calculate profitability
        for access_type in ['hotspot', 'pppoe', 'both']:
            revenue = summary['revenue'].get(access_type, {}).get('total', 0)
            expenses = summary['expenses'].get(access_type, {}).get('total', 0)
            profit = revenue - expenses
            
            summary['profitability'][access_type] = {
                'revenue': revenue,
                'expenses': expenses,
                'profit': profit,
                'margin': (profit / revenue * 100) if revenue > 0 else 0
            }
        
        return summary


class TaxConfigurationView(APIView):
    """Enhanced view for managing tax configurations with access type support"""
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
                # Clear relevant caches
                cache.delete_pattern('reconciliation_*')
                cache.delete_pattern('access_type_analytics_*')
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
    """Enhanced view for managing manual expenses with access type"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get manual expenses with filtering"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            access_type = request.query_params.get('access_type', 'all')
            
            expenses = ManualExpense.objects.all()
            
            if start_date and end_date:
                expenses = expenses.filter(date__range=[start_date, end_date])
            
            if access_type != 'all':
                expenses = expenses.filter(access_type=access_type)
            
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
                # Clear relevant caches
                cache.delete_pattern('reconciliation_*')
                cache.delete_pattern('access_type_analytics_*')
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create manual expense: {str(e)}")
            return Response(
                {"error": "Failed to create manual expense"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReconciliationReportView(APIView):
    """Enhanced view for generating and managing reconciliation reports"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate enhanced reconciliation report"""
        try:
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            report_type = request.data.get('report_type', 'custom')
            
            if not start_date or not end_date:
                return Response(
                    {"error": "Start date and end date are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use the enhanced reconciliation view to get data
            reconciliation_view = PaymentReconciliationView()
            filter_serializer = ReconciliationFilterSerializer(data={
                'start_date': start_date,
                'end_date': end_date,
                'view_mode': 'all',
                'access_type': 'all'
            })
            
            if not filter_serializer.is_valid():
                return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Get reconciliation data
            reconciliation_data = reconciliation_view.get(request).data
            
            # Create enhanced report
            report = ReconciliationReport.objects.create(
                report_type=report_type,
                start_date=start_date,
                end_date=end_date,
                generated_by=request.user,
                # Populate access type specific fields
                hotspot_revenue=reconciliation_data['access_type_breakdown']['hotspot']['revenue'],
                pppoe_revenue=reconciliation_data['access_type_breakdown']['pppoe']['revenue'],
                both_revenue=reconciliation_data['access_type_breakdown']['both']['revenue'],
                total_revenue=reconciliation_data['overall_summary']['total_revenue'],
                # Add other fields as needed
                revenue_breakdown=reconciliation_data['access_type_breakdown'],
                expense_breakdown={},  # Populate similarly
                tax_breakdown={}       # Populate similarly
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