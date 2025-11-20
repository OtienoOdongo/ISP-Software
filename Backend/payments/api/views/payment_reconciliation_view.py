








# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import Q, Sum, Count, Avg
# from django.utils import timezone
# from django.core.paginator import Paginator, EmptyPage
# from datetime import datetime, timedelta
# import logging
# from django.core.cache import cache
# from django.db import transaction as db_transaction
# from django.http import Http404
# import json
# from decimal import Decimal  
# import decimal  
# from django.http import Http404
# from django.db import transaction
# import uuid

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
#     ExpenseCategoryCreateSerializer,
#     ExpenseCategoryListSerializer,
#     ManualExpenseSerializer,
#     ReconciliationFilterSerializer,
#     ReconciliationSummarySerializer,
#     TransactionSummarySerializer,
#     ReconciliationReportSerializer,
#     AccessTypeRevenueSerializer,
#     ReportGenerationSerializer
# )

# logger = logging.getLogger(__name__)

# class PaymentReconciliationView(APIView):
#     """
#     Enhanced payment reconciliation with PPPoE/Hotspot support
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get enhanced reconciliation data with access type breakdown
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
#             access_type_filter = filters['access_type']
#             search_term = filters.get('search', '')
#             sort_by = filters.get('sort_by', 'date_desc')
            
#             # Generate cache key
#             cache_key = f"reconciliation_{start_date}_{end_date}_{view_mode}_{access_type_filter}_{search_term}_{sort_by}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             # Get active tax configurations
#             active_taxes = TaxConfiguration.objects.filter(is_enabled=True)
            
#             # Get transactions with access type filtering
#             transactions = TransactionLog.objects.filter(
#                 created_at__date__range=[start_date, end_date],
#                 status='success'
#             ).select_related('client', 'client__user')
            
#             # Apply access type filter
#             if access_type_filter != 'all':
#                 transactions = transactions.filter(access_type=access_type_filter)
            
#             # Get manual expenses with access type filtering
#             expenses = ManualExpense.objects.filter(
#                 date__range=[start_date, end_date]
#             ).select_related('category', 'created_by')
            
#             # Apply access type filter to expenses
#             if access_type_filter != 'all':
#                 expenses = expenses.filter(access_type=access_type_filter)
            
#             # Apply search filter if provided
#             if search_term:
#                 transactions = transactions.filter(
#                     Q(transaction_id__icontains=search_term) |
#                     Q(client__user__username__icontains=search_term) |
#                     Q(payment_method__icontains=search_term) |
#                     Q(access_type__icontains=search_term)
#                 )
#                 expenses = expenses.filter(
#                     Q(expense_id__icontains=search_term) |
#                     Q(description__icontains=search_term) |
#                     Q(category__name__icontains=search_term) |
#                     Q(access_type__icontains=search_term)
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
#             elif sort_by == 'access_type':
#                 transactions = transactions.order_by('access_type')
#                 expenses = expenses.order_by('access_type')
            
#             # Calculate enhanced tax breakdowns with access type
#             revenue_summary = self._calculate_enhanced_tax_breakdown(
#                 transactions, active_taxes.filter(applies_to__in=['revenue', 'both']), 'revenue'
#             )
            
#             expense_summary = self._calculate_enhanced_tax_breakdown(
#                 expenses, active_taxes.filter(applies_to__in=['expenses', 'both']), 'expenses'
#             )
            
#             # Calculate access type breakdown
#             access_type_breakdown = self._calculate_access_type_breakdown(transactions, expenses)
            
#             # Prepare enhanced response data
#             response_data = {
#                 'revenue': {
#                     'transactions': TransactionSummarySerializer(transactions, many=True).data,
#                     'summary': revenue_summary
#                 },
#                 'expenses': {
#                     'expenses': ManualExpenseSerializer(expenses, many=True).data,
#                     'summary': expense_summary
#                 },
#                 'overall_summary': self._calculate_enhanced_overall_summary(
#                     revenue_summary, expense_summary, access_type_breakdown
#                 ),
#                 'access_type_breakdown': access_type_breakdown,
#                 'tax_configuration': TaxConfigurationSerializer(active_taxes, many=True).data,
#                 'filters': filters
#             }
            
#             # Filter by view mode if needed
#             if view_mode == 'revenue':
#                 del response_data['expenses']
#             elif view_mode == 'expenses':
#                 del response_data['revenue']
            
#             # Cache the response for 2 minutes
#             cache.set(cache_key, response_data, 120)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Failed to fetch enhanced reconciliation data: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch reconciliation data", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def _calculate_enhanced_tax_breakdown(self, queryset, taxes, record_type):
#         """Calculate enhanced tax breakdown with access type support"""
#         total_amount = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
#         # Calculate amounts by access type
#         access_type_totals = {}
#         for item in queryset:
#             access_type = getattr(item, 'access_type', 'general')
#             if access_type not in access_type_totals:
#                 access_type_totals[access_type] = 0
#             access_type_totals[access_type] += float(item.amount)
        
#         tax_breakdown = []
#         for tax in taxes:
#             total_tax_amount = 0
#             access_type_tax = {}
            
#             for access_type, amount in access_type_totals.items():
#                 if tax._applies_to_access_type(access_type):
#                     tax_amount = tax.calculate_tax(amount, access_type)
#                     total_tax_amount += tax_amount
#                     access_type_tax[access_type] = float(tax_amount)
            
#             tax_breakdown.append({
#                 'tax_id': str(tax.id),
#                 'tax_name': tax.name,
#                 'tax_rate': float(tax.rate),
#                 'tax_amount': float(total_tax_amount),
#                 'taxable_amount': float(total_amount),
#                 'is_included': tax.is_included_in_price,
#                 'access_type_tax': access_type_tax
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
#             'record_count': queryset.count(),
#             'access_type_totals': access_type_totals
#         }

#     def _calculate_access_type_breakdown(self, transactions, expenses):
#         """Calculate detailed access type breakdown"""
#         # Revenue by access type
#         revenue_by_access = transactions.values('access_type').annotate(
#             total_amount=Sum('amount'),
#             count=Count('id')
#         )
        
#         # Expenses by access type
#         expense_by_access = expenses.values('access_type').annotate(
#             total_amount=Sum('amount'),
#             count=Count('id')
#         )
        
#         # Initialize breakdown
#         breakdown = {
#             'hotspot': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0},
#             'pppoe': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0},
#             'both': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0},
#             'combined': {'revenue': 0, 'expenses': 0, 'count': 0, 'profit': 0}
#         }
        
#         # Populate revenue data
#         for item in revenue_by_access:
#             access_type = item['access_type']
#             if access_type in breakdown:
#                 breakdown[access_type]['revenue'] = float(item['total_amount'] or 0)
#                 breakdown[access_type]['count'] = item['count']
#                 breakdown['combined']['revenue'] += float(item['total_amount'] or 0)
#                 breakdown['combined']['count'] += item['count']
        
#         # Populate expense data
#         for item in expense_by_access:
#             access_type = item['access_type']
#             if access_type in breakdown:
#                 breakdown[access_type]['expenses'] = float(item['total_amount'] or 0)
#                 breakdown['combined']['expenses'] += float(item['total_amount'] or 0)
        
#         # Calculate profits
#         for access_type in ['hotspot', 'pppoe', 'both', 'combined']:
#             breakdown[access_type]['profit'] = (
#                 breakdown[access_type]['revenue'] - breakdown[access_type]['expenses']
#             )
        
#         return breakdown

#     def _calculate_enhanced_overall_summary(self, revenue_summary, expense_summary, access_type_breakdown):
#         """Calculate enhanced overall summary with combined metrics"""
#         total_revenue_tax = sum(tax['tax_amount'] for tax in revenue_summary['tax_breakdown'])
#         total_expense_tax = sum(tax['tax_amount'] for tax in expense_summary['tax_breakdown'])
        
#         combined_revenue = access_type_breakdown['combined']['revenue']
#         combined_expenses = access_type_breakdown['combined']['expenses']
#         combined_profit = combined_revenue - combined_expenses - total_expense_tax
        
#         # Calculate revenue distribution
#         total_revenue = access_type_breakdown['combined']['revenue']
#         revenue_distribution = {}
#         if total_revenue > 0:
#             for access_type in ['hotspot', 'pppoe', 'both']:
#                 percentage = (access_type_breakdown[access_type]['revenue'] / total_revenue) * 100
#                 revenue_distribution[access_type] = round(percentage, 2)
        
#         return {
#             'total_revenue': revenue_summary['total_amount'],
#             'total_expenses': expense_summary['total_amount'],
#             'total_tax': total_revenue_tax + total_expense_tax,
#             'net_revenue': revenue_summary['net_amount'],
#             'net_expenses': expense_summary['net_amount'],
#             'net_profit': revenue_summary['net_amount'] - expense_summary['net_amount'] - total_expense_tax,
#             'combined_revenue': combined_revenue,
#             'combined_profit': combined_profit,
#             'revenue_distribution': revenue_distribution
#         }

# class AccessTypeAnalyticsView(APIView):
#     """
#     Analytics view for PPPoE vs Hotspot comparison
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get comprehensive access type analytics
#         """
#         try:
#             days = int(request.query_params.get('days', 30))
#             cache_key = f"access_type_analytics_{days}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 return Response(cached_data)
            
#             end_date = timezone.now().date()
#             start_date = end_date - timedelta(days=days)
            
#             # Get revenue by access type over time
#             daily_revenue = TransactionLog.objects.filter(
#                 created_at__date__range=[start_date, end_date],
#                 status='success'
#             ).extra({
#                 'date': "DATE(created_at)"
#             }).values('date', 'access_type').annotate(
#                 total_amount=Sum('amount'),
#                 count=Count('id')
#             ).order_by('date')
            
#             # Get expense by access type over time
#             daily_expenses = ManualExpense.objects.filter(
#                 date__range=[start_date, end_date]
#             ).values('date', 'access_type').annotate(
#                 total_amount=Sum('amount'),
#                 count=Count('id')
#             ).order_by('date')
            
#             # Process revenue data
#             revenue_data = self._process_daily_data(daily_revenue, 'revenue')
#             expense_data = self._process_daily_data(daily_expenses, 'expenses')
            
#             # Calculate summary statistics
#             summary = self._calculate_analytics_summary(start_date, end_date)
            
#             analytics_data = {
#                 'revenue_trends': revenue_data,
#                 'expense_trends': expense_data,
#                 'summary': summary,
#                 'date_range': {
#                     'start_date': start_date.isoformat(),
#                     'end_date': end_date.isoformat(),
#                     'days': days
#                 }
#             }
            
#             cache.set(cache_key, analytics_data, 300)  # Cache for 5 minutes
#             return Response(analytics_data)
            
#         except Exception as e:
#             logger.error(f"Failed to fetch access type analytics: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch analytics data"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def _process_daily_data(self, queryset, data_type):
#         """Process daily data for charts"""
#         dates = []
#         hotspot_data = []
#         pppoe_data = []
#         both_data = []
        
#         current_date = None
#         daily_totals = {'hotspot': 0, 'pppoe': 0, 'both': 0}
        
#         for item in queryset:
#             date_str = item['date'].isoformat() if hasattr(item['date'], 'isoformat') else str(item['date'])
            
#             if date_str != current_date and current_date is not None:
#                 dates.append(current_date)
#                 hotspot_data.append(daily_totals['hotspot'])
#                 pppoe_data.append(daily_totals['pppoe'])
#                 both_data.append(daily_totals['both'])
#                 daily_totals = {'hotspot': 0, 'pppoe': 0, 'both': 0}
            
#             current_date = date_str
#             access_type = item['access_type']
#             amount = float(item['total_amount'] or 0)
            
#             if access_type in daily_totals:
#                 daily_totals[access_type] = amount
        
#         # Add the last day
#         if current_date:
#             dates.append(current_date)
#             hotspot_data.append(daily_totals['hotspot'])
#             pppoe_data.append(daily_totals['pppoe'])
#             both_data.append(daily_totals['both'])
        
#         return {
#             'dates': dates,
#             'hotspot': hotspot_data,
#             'pppoe': pppoe_data,
#             'both': both_data
#         }

#     def _calculate_analytics_summary(self, start_date, end_date):
#         """Calculate comprehensive analytics summary"""
#         # Revenue statistics
#         revenue_stats = TransactionLog.objects.filter(
#             created_at__date__range=[start_date, end_date],
#             status='success'
#         ).values('access_type').annotate(
#             total_amount=Sum('amount'),
#             avg_amount=Avg('amount'),
#             count=Count('id')
#         )
        
#         # Expense statistics
#         expense_stats = ManualExpense.objects.filter(
#             date__range=[start_date, end_date]
#         ).values('access_type').annotate(
#             total_amount=Sum('amount'),
#             avg_amount=Avg('amount'),
#             count=Count('id')
#         )
        
#         summary = {
#             'revenue': {},
#             'expenses': {},
#             'profitability': {}
#         }
        
#         # Process revenue stats
#         for stat in revenue_stats:
#             access_type = stat['access_type']
#             summary['revenue'][access_type] = {
#                 'total': float(stat['total_amount'] or 0),
#                 'average': float(stat['avg_amount'] or 0),
#                 'count': stat['count']
#             }
        
#         # Process expense stats
#         for stat in expense_stats:
#             access_type = stat['access_type']
#             summary['expenses'][access_type] = {
#                 'total': float(stat['total_amount'] or 0),
#                 'average': float(stat['avg_amount'] or 0),
#                 'count': stat['count']
#             }
        
#         # Calculate profitability
#         for access_type in ['hotspot', 'pppoe', 'both']:
#             revenue = summary['revenue'].get(access_type, {}).get('total', 0)
#             expenses = summary['expenses'].get(access_type, {}).get('total', 0)
#             profit = revenue - expenses
            
#             summary['profitability'][access_type] = {
#                 'revenue': revenue,
#                 'expenses': expenses,
#                 'profit': profit,
#                 'margin': (profit / revenue * 100) if revenue > 0 else 0
#             }
        
#         return summary




# class TaxConfigurationView(APIView):
#     """
#     Enterprise Tax Configuration Management System
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get all tax configurations with advanced filtering and caching
#         """
#         try:
#             # Generate cache key based on request parameters
#             cache_key = f"tax_configurations_{request.user.id}_{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 logger.info(f"Cache hit for tax configurations - User: {request.user.id}")
#                 return Response(cached_data)
            
#             # Start performance monitoring
#             start_time = timezone.now()
            
#             # Base queryset with select_related for performance
#             taxes = TaxConfiguration.objects.all().select_related('created_by').order_by('name')
            
#             # Apply filters from query parameters
#             filters = self._apply_filters(taxes, request)
#             taxes = filters['queryset']
            
#             # Apply pagination for large datasets
#             paginated_data = self._apply_pagination(taxes, request)
            
#             # Serialize data
#             serializer = TaxConfigurationSerializer(paginated_data['data'], many=True)
            
#             # Prepare response with metadata
#             response_data = {
#                 'data': serializer.data,
#                 'meta': {
#                     'total_count': filters['total_count'],
#                     'filtered_count': paginated_data['count'],
#                     'page': paginated_data['page'],
#                     'page_size': paginated_data['page_size'],
#                     'total_pages': paginated_data['total_pages'],
#                     'has_next': paginated_data['has_next'],
#                     'has_previous': paginated_data['has_previous'],
#                 },
#                 'filters': filters['applied_filters']
#             }
            
#             # Cache the response for 5 minutes (300 seconds)
#             cache.set(cache_key, response_data, 300)
            
#             # Log performance metrics
#             processing_time = (timezone.now() - start_time).total_seconds()
#             logger.info(
#                 f"Tax configurations fetched successfully - "
#                 f"User: {request.user.id}, "
#                 f"Count: {paginated_data['count']}, "
#                 f"Time: {processing_time:.3f}s"
#             )
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(
#                 f"Failed to fetch tax configurations - "
#                 f"User: {request.user.id}, "
#                 f"Error: {str(e)}",
#                 exc_info=True
#             )
#             return Response(
#                 {
#                     "error": "Unable to retrieve tax configurations",
#                     "code": "TAX_FETCH_ERROR",
#                     "details": "Please try again or contact support if the problem persists"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         Create new tax configuration with comprehensive validation
#         """
#         try:
#             # Rate limiting check
#             if self._is_rate_limited(request):
#                 return Response(
#                     {
#                         "error": "Too many requests",
#                         "code": "RATE_LIMITED",
#                         "details": "Please wait before creating more tax configurations"
#                     },
#                     status=status.HTTP_429_TOO_MANY_REQUESTS
#                 )
            
#             # Clean the data - remove read-only fields that might be sent from frontend
#             cleaned_data = self._clean_request_data(request.data)
            
#             # Business logic validation
#             validation_errors = self._validate_business_rules(cleaned_data)
#             if validation_errors:
#                 return Response(
#                     {
#                         "error": "Business rule validation failed",
#                         "code": "BUSINESS_RULE_VIOLATION",
#                         "details": validation_errors
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Check for duplicate tax configurations
#             duplicate_check = self._check_duplicate_tax(cleaned_data)
#             if duplicate_check['is_duplicate']:
#                 return Response(
#                     {
#                         "error": "Duplicate tax configuration detected",
#                         "code": "DUPLICATE_TAX",
#                         "details": duplicate_check['message'],
#                         "existing_tax": duplicate_check['existing_tax']
#                     },
#                     status=status.HTTP_409_CONFLICT
#                 )
            
#             # Use atomic transaction to ensure data consistency
#             with transaction.atomic():
#                 serializer = TaxConfigurationSerializer(data=cleaned_data, context={'request': request})
                
#                 if serializer.is_valid():
#                     # Save with audit information
#                     tax_instance = serializer.save()
                    
#                     # Create audit log
#                     self._create_audit_log(
#                         request.user,
#                         'CREATE',
#                         f"Created tax configuration: {tax_instance.name}",
#                         tax_instance.id
#                     )
                    
#                     # Clear relevant caches
#                     self._invalidate_related_caches(request.user.id)
                    
#                     # Prepare success response
#                     response_data = {
#                         "data": serializer.data,
#                         "message": f"Tax configuration '{tax_instance.name}' created successfully",
#                         "audit_id": str(uuid.uuid4())
#                     }
                    
#                     logger.info(
#                         f"Tax configuration created successfully - "
#                         f"User: {request.user.id}, "
#                         f"Tax ID: {tax_instance.id}, "
#                         f"Name: {tax_instance.name}"
#                     )
                    
#                     return Response(response_data, status=status.HTTP_201_CREATED)
#                 else:
#                     # Return detailed validation errors
#                     return Response(
#                         {
#                             "error": "Validation failed",
#                             "code": "VALIDATION_ERROR",
#                             "details": serializer.errors
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
                    
#         except Exception as e:
#             logger.error(
#                 f"Failed to create tax configuration - "
#                 f"User: {request.user.id}, "
#                 f"Error: {str(e)}",
#                 exc_info=True
#             )
            
#             # Check for specific database errors
#             if 'unique' in str(e).lower():
#                 return Response(
#                     {
#                         "error": "Duplicate tax configuration",
#                         "code": "DUPLICATE_ENTRY",
#                         "details": "A tax configuration with similar parameters already exists"
#                     },
#                     status=status.HTTP_409_CONFLICT
#                 )
            
#             return Response(
#                 {
#                     "error": "Failed to create tax configuration",
#                     "code": "TAX_CREATION_ERROR",
#                     "details": "Please check your input and try again"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def _clean_request_data(self, data):
#         """Clean request data by removing read-only and invalid fields"""
#         cleaned_data = data.copy()
        
#         # Remove read-only fields that should not be sent in requests
#         read_only_fields = [
#             'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
#             'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
#             'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
#         ]
        
#         for field in read_only_fields:
#             if field in cleaned_data:
#                 del cleaned_data[field]
        
#         # Handle empty strings for optional fields
#         if 'description' in cleaned_data and cleaned_data['description'] == '':
#             cleaned_data['description'] = None
            
#         if 'revision_notes' in cleaned_data and cleaned_data['revision_notes'] == '':
#             cleaned_data['revision_notes'] = None
            
#         if 'effective_to' in cleaned_data and cleaned_data['effective_to'] == '':
#             cleaned_data['effective_to'] = None
        
#         return cleaned_data

#     def _apply_filters(self, queryset, request):
#         """Apply advanced filtering to tax configurations"""
#         applied_filters = {}
#         total_count = queryset.count()
        
#         # Filter by tax type
#         tax_type = request.GET.get('tax_type')
#         if tax_type:
#             queryset = queryset.filter(tax_type=tax_type)
#             applied_filters['tax_type'] = tax_type
        
#         # Filter by access type
#         access_type = request.GET.get('access_type')
#         if access_type:
#             queryset = queryset.filter(access_type=access_type)
#             applied_filters['access_type'] = access_type
        
#         # Filter by status (enabled/disabled)
#         is_enabled = request.GET.get('is_enabled')
#         if is_enabled is not None:
#             is_enabled_bool = is_enabled.lower() == 'true'
#             queryset = queryset.filter(is_enabled=is_enabled_bool)
#             applied_filters['is_enabled'] = is_enabled_bool
        
#         # Search by name
#         search = request.GET.get('search')
#         if search:
#             queryset = queryset.filter(name__icontains=search)
#             applied_filters['search'] = search
        
#         return {
#             'queryset': queryset,
#             'total_count': total_count,
#             'applied_filters': applied_filters
#         }

#     def _apply_pagination(self, queryset, request):
#         """Apply pagination to large datasets"""
#         page = int(request.GET.get('page', 1))
#         page_size = min(int(request.GET.get('page_size', 50)), 100)  # Max 100 per page
        
#         start = (page - 1) * page_size
#         end = start + page_size
        
#         data = list(queryset[start:end])
#         total_count = queryset.count()
#         total_pages = (total_count + page_size - 1) // page_size
        
#         return {
#             'data': data,
#             'count': len(data),
#             'page': page,
#             'page_size': page_size,
#             'total_pages': total_pages,
#             'has_next': page < total_pages,
#             'has_previous': page > 1
#         }

#     def _validate_business_rules(self, data):
#         """Validate business rules for tax configuration"""
#         errors = []
        
#         # Rate validation
#         if 'rate' in data:
#             try:
#                 rate = float(data['rate'])
#                 if rate > 50 and not data.get('requires_approval', False):
#                     errors.append("Tax rates above 50% require special approval")
#                 if rate <= 0:
#                     errors.append("Tax rate must be greater than 0")
#             except (ValueError, TypeError):
#                 errors.append("Invalid tax rate format")
        
#         # Name validation
#         if 'name' in data and len(data['name']) > 100:
#             errors.append("Tax name cannot exceed 100 characters")
        
#         # Access type validation
#         valid_access_types = ['all', 'hotspot', 'pppoe', 'both']
#         if 'access_type' in data and data['access_type'] not in valid_access_types:
#             errors.append(f"Invalid access type. Must be one of: {', '.join(valid_access_types)}")
        
#         return errors

#     def _check_duplicate_tax(self, data):
#         """Check for duplicate tax configurations"""
#         try:
#             # Check for exact duplicates
#             duplicate_taxes = TaxConfiguration.objects.filter(
#                 name=data.get('name'),
#                 tax_type=data.get('tax_type', 'custom'),
#                 access_type=data.get('access_type', 'all')
#             )
            
#             if duplicate_taxes.exists():
#                 existing_tax = duplicate_taxes.first()
#                 return {
#                     'is_duplicate': True,
#                     'message': f"A tax configuration with name '{data['name']}' already exists",
#                     'existing_tax': TaxConfigurationSerializer(existing_tax).data
#                 }
            
#             return {'is_duplicate': False}
            
#         except Exception as e:
#             logger.warning(f"Duplicate check failed: {str(e)}")
#             return {'is_duplicate': False}

#     def _is_rate_limited(self, request):
#         """Simple rate limiting check"""
#         cache_key = f"tax_creation_rate_{request.user.id}"
#         recent_creations = cache.get(cache_key, 0)
        
#         if recent_creations >= 10:  # Limit to 10 creations per minute
#             return True
        
#         cache.set(cache_key, recent_creations + 1, 60)  # 1 minute window
#         return False

#     def _create_audit_log(self, user, action, description, tax_id):
#         """Create audit log entry"""
#         audit_data = {
#             'user_id': user.id,
#             'action': action,
#             'description': description,
#             'tax_id': tax_id,
#             'timestamp': timezone.now(),
#             'ip_address': self._get_client_ip(request)
#         }
        
#         # Store in cache or database-based audit log
#         audit_key = f"audit_tax_{tax_id}_{uuid.uuid4()}"
#         cache.set(audit_key, audit_data, 86400)  # Store for 24 hours

#     def _invalidate_related_caches(self, user_id):
#         """Invalidate all related caches"""
#         cache.delete_pattern(f"tax_configurations_{user_id}_*")
#         cache.delete_pattern('reconciliation_*')
#         cache.delete_pattern('access_type_analytics_*')
#         cache.delete_pattern('dashboard_stats_*')

#     def _get_client_ip(self, request):
#         """Get client IP address for audit logging"""
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             ip = x_forwarded_for.split(',')[0]
#         else:
#             ip = request.META.get('REMOTE_ADDR')
#         return ip


# class TaxConfigurationDetailView(APIView):
#     """
#     Enterprise Tax Configuration Detail Management
#     """
#     permission_classes = [IsAuthenticated]

#     def get_object(self, tax_id):
#         """
#         Get tax object with enhanced error handling and performance optimization
#         """
#         try:
#             # Use select_related for performance
#             return TaxConfiguration.objects.select_related('created_by').get(id=tax_id)
#         except TaxConfiguration.DoesNotExist:
#             logger.warning(f"Tax configuration not found - Tax ID: {tax_id}")
#             raise Http404({
#                 "error": "Tax configuration not found",
#                 "code": "TAX_NOT_FOUND",
#                 "details": "The requested tax configuration does not exist or has been deleted"
#             })
#         except Exception as e:
#             logger.error(f"Error retrieving tax configuration - Tax ID: {tax_id}, Error: {str(e)}")
#             raise Http404({
#                 "error": "Error retrieving tax configuration",
#                 "code": "TAX_RETRIEVAL_ERROR",
#                 "details": "Unable to retrieve the requested tax configuration"
#             })

#     def get(self, request, tax_id):
#         """
#         Get specific tax configuration details with full autonomy
#         """
#         try:
#             tax = self.get_object(tax_id)
#             serializer = TaxConfigurationSerializer(tax)
            
#             # Add audit information
#             response_data = {
#                 "data": serializer.data,
#                 "permissions": {
#                     "can_edit": True,
#                     "can_delete": True,
#                     "can_toggle": True
#                 },
#                 "audit_trail": self._get_audit_trail(tax_id)
#             }
            
#             logger.info(f"Tax configuration retrieved - Tax ID: {tax_id}, User: {request.user.id}")
#             return Response(response_data)
            
#         except Http404 as e:
#             return Response(e.args[0], status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(
#                 f"Failed to fetch tax configuration - "
#                 f"Tax ID: {tax_id}, User: {request.user.id}, Error: {str(e)}",
#                 exc_info=True
#             )
#             return Response(
#                 {
#                     "error": "Failed to retrieve tax configuration",
#                     "code": "TAX_FETCH_DETAIL_ERROR",
#                     "details": "Please try again or contact support"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def put(self, request, tax_id):
#         """
#         Full update of tax configuration with comprehensive validation
#         """
#         return self._update_tax_configuration(request, tax_id, partial=False)

#     def patch(self, request, tax_id):
#         """
#         Partial update of tax configuration with comprehensive validation
#         """
#         return self._update_tax_configuration(request, tax_id, partial=True)

#     def _update_tax_configuration(self, request, tax_id, partial=False):
#         """
#         Unified update method for PUT and PATCH requests
#         """
#         try:
#             tax = self.get_object(tax_id)
            
#             # Clean the data - remove read-only fields
#             cleaned_data = self._clean_request_data(request.data)
            
#             # Business rule validation
#             validation_errors = self._validate_business_rules(cleaned_data)
#             if validation_errors:
#                 return Response(
#                     {
#                         "error": "Business rule validation failed",
#                         "code": "BUSINESS_RULE_VIOLATION",
#                         "details": validation_errors
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Use atomic transaction for data consistency
#             with transaction.atomic():
#                 serializer = TaxConfigurationSerializer(
#                     tax, 
#                     data=cleaned_data, 
#                     partial=partial,
#                     context={'request': request}
#                 )
                
#                 if serializer.is_valid():
#                     # Save with audit information
#                     updated_tax = serializer.save()
                    
#                     # Create audit log
#                     action = 'UPDATE' if partial else 'FULL_UPDATE'
#                     self._create_audit_log(
#                         request.user,
#                         action,
#                         f"Updated tax configuration: {updated_tax.name}",
#                         tax_id
#                     )
                    
#                     # Clear relevant caches
#                     self._invalidate_related_caches(request.user.id)
                    
#                     # Prepare success response
#                     response_data = {
#                         "data": serializer.data,
#                         "message": f"Tax configuration '{updated_tax.name}' updated successfully",
#                         "audit_id": str(uuid.uuid4()),
#                         "changes": self._get_changes(tax, updated_tax) if not partial else None
#                     }
                    
#                     logger.info(
#                         f"Tax configuration updated successfully - "
#                         f"Tax ID: {tax_id}, User: {request.user.id}, "
#                         f"Name: {updated_tax.name}"
#                     )
                    
#                     return Response(response_data)
#                 else:
#                     return Response(
#                         {
#                             "error": "Validation failed",
#                             "code": "VALIDATION_ERROR",
#                             "details": serializer.errors
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
                    
#         except Http404 as e:
#             return Response(e.args[0], status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(
#                 f"Failed to update tax configuration - "
#                 f"Tax ID: {tax_id}, User: {request.user.id}, Error: {str(e)}",
#                 exc_info=True
#             )
#             return Response(
#                 {
#                     "error": "Failed to update tax configuration",
#                     "code": "TAX_UPDATE_ERROR",
#                     "details": "Please check your input and try again"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def delete(self, request, tax_id):
#         """
#         Delete tax configuration with FULL AUTONOMY
#         """
#         try:
#             tax = self.get_object(tax_id)
#             tax_name = tax.name
            
#             # Use atomic transaction for data consistency
#             with transaction.atomic():
#                 # Create comprehensive audit log before deletion
#                 self._create_audit_log(
#                     request.user,
#                     'DELETE',
#                     f"Deleted tax configuration: {tax_name} (Rate: {tax.rate}%, Type: {tax.tax_type})",
#                     tax_id
#                 )
                
#                 # Capture tax details for response
#                 tax_details = {
#                     'id': str(tax.id),
#                     'name': tax_name,
#                     'rate': float(tax.rate),
#                     'tax_type': tax.tax_type,
#                     'access_type': tax.access_type,
#                     'was_enabled': tax.is_enabled
#                 }
                
#                 # Perform deletion
#                 tax.delete()
                
#                 # Clear all related caches
#                 self._invalidate_related_caches(request.user.id)
                
#                 # Prepare success response with detailed information
#                 response_data = {
#                     "message": f"Tax configuration '{tax_name}' deleted successfully",
#                     "deleted_tax": tax_details,
#                     "audit_id": str(uuid.uuid4()),
#                     "timestamp": timezone.now().isoformat(),
#                     "remaining_taxes_count": TaxConfiguration.objects.count()
#                 }
                
#                 logger.info(
#                     f"Tax configuration deleted with full autonomy - "
#                     f"Tax ID: {tax_id}, User: {request.user.id}, "
#                     f"Name: {tax_name}, Was Enabled: {tax_details['was_enabled']}"
#                 )
                
#                 return Response(response_data, status=status.HTTP_200_OK)
                
#         except Http404 as e:
#             return Response(e.args[0], status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(
#                 f"Failed to delete tax configuration - "
#                 f"Tax ID: {tax_id}, User: {request.user.id}, Error: {str(e)}",
#                 exc_info=True
#             )
#             return Response(
#                 {
#                     "error": "Failed to delete tax configuration",
#                     "code": "TAX_DELETION_ERROR",
#                     "details": "Please try again or contact support"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def _clean_request_data(self, data):
#         """Clean request data by removing read-only and invalid fields"""
#         cleaned_data = data.copy()
        
#         # Remove read-only fields that should not be sent in requests
#         read_only_fields = [
#             'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
#             'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
#             'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
#         ]
        
#         for field in read_only_fields:
#             if field in cleaned_data:
#                 del cleaned_data[field]
        
#         # Handle empty strings for optional fields
#         if 'description' in cleaned_data and cleaned_data['description'] == '':
#             cleaned_data['description'] = None
            
#         if 'revision_notes' in cleaned_data and cleaned_data['revision_notes'] == '':
#             cleaned_data['revision_notes'] = None
            
#         if 'effective_to' in cleaned_data and cleaned_data['effective_to'] == '':
#             cleaned_data['effective_to'] = None
        
#         return cleaned_data

#     def _get_audit_trail(self, tax_id):
#         """Get audit trail for tax configuration"""
#         audit_pattern = f"audit_tax_{tax_id}_*"
#         audit_keys = cache.keys(audit_pattern)
#         audit_entries = [cache.get(key) for key in audit_keys if cache.get(key)]
        
#         return sorted(audit_entries, key=lambda x: x['timestamp'], reverse=True)[:10]

#     def _get_changes(self, old_tax, new_tax):
#         """Detect changes between old and new tax configuration"""
#         changes = {}
        
#         fields_to_check = ['name', 'rate', 'tax_type', 'access_type', 'applies_to', 'is_enabled', 'is_included_in_price']
        
#         for field in fields_to_check:
#             old_value = getattr(old_tax, field)
#             new_value = getattr(new_tax, field)
            
#             if old_value != new_value:
#                 changes[field] = {
#                     'from': old_value,
#                     'to': new_value
#                 }
        
#         return changes

#     # Reuse helper methods from TaxConfigurationView
#     def _validate_business_rules(self, data):
#         return TaxConfigurationView()._validate_business_rules(data)
    
#     def _create_audit_log(self, user, action, description, tax_id):
#         return TaxConfigurationView()._create_audit_log(user, action, description, tax_id)
    
#     def _invalidate_related_caches(self, user_id):
#         return TaxConfigurationView()._invalidate_related_caches(user_id)



# class ExpenseCategoryView(APIView):
#     """Enhanced view for managing expense categories with full CRUD"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Get all expense categories with optional filtering"""
#         try:
#             # Check if we need to initialize predefined categories
#             if not ExpenseCategory.objects.filter(is_predefined=True).exists():
#                 ExpenseCategory.initialize_predefined_categories(request.user)
            
#             # Get query parameters for filtering
#             is_active = request.query_params.get('is_active', 'true').lower() == 'true'
#             include_predefined = request.query_params.get('include_predefined', 'true').lower() == 'true'
            
#             categories = ExpenseCategory.objects.all()
            
#             # Apply filters
#             if is_active:
#                 categories = categories.filter(is_active=True)
            
#             if not include_predefined:
#                 categories = categories.filter(is_predefined=False)
            
#             # Annotate with expense counts and totals
#             categories = categories.annotate(
#                 expense_count=Count('expenses'),
#                 total_amount=Sum('expenses__amount')
#             ).order_by('name')
            
#             # Use enhanced serializer that includes expense stats
#             serializer = ExpenseCategoryListSerializer(categories, many=True)
#             return Response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Failed to fetch expense categories: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch expense categories", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """Create new expense category"""
#         try:
#             name = request.data.get('name', '').strip()
#             description = request.data.get('description', '').strip()
            
#             # Validate required fields
#             if not name:
#                 return Response(
#                     {"error": "Category name is required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Check for duplicate category names (case-insensitive)
#             if ExpenseCategory.objects.filter(
#                 name__iexact=name,
#                 is_active=True
#             ).exists():
#                 return Response(
#                     {"error": f"Category '{name}' already exists"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Use serializer for validation and creation
#             serializer = ExpenseCategoryCreateSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
            
#             if serializer.is_valid():
#                 # Save with the current user as creator
#                 category = serializer.save(created_by=request.user)
                
#                 # Return full category data with success message
#                 full_serializer = ExpenseCategorySerializer(category)
#                 response_data = full_serializer.data
#                 response_data['message'] = f"Category '{name}' created successfully"
                
#                 return Response(response_data, status=status.HTTP_201_CREATED)
            
#             # Return validation errors
#             return Response(
#                 {"error": "Invalid category data", "details": serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         except Exception as e:
#             logger.error(f"Failed to create expense category: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create expense category", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ExpenseCategoryDetailView(APIView):
#     """Enhanced view for managing individual expense categories with deletion support"""
#     permission_classes = [IsAuthenticated]

#     def get_object(self, category_id):
#         """Helper method to get category object or return 404"""
#         try:
#             return ExpenseCategory.objects.get(id=category_id)
#         except ExpenseCategory.DoesNotExist:
#             raise Http404("Expense category not found")

#     def get(self, request, category_id):
#         """Get specific expense category details"""
#         try:
#             category = self.get_object(category_id)
#             serializer = ExpenseCategorySerializer(category)
#             return Response(serializer.data)
#         except Http404 as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch expense category {category_id}: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch expense category"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def patch(self, request, category_id):
#         """Update expense category"""
#         try:
#             category = self.get_object(category_id)
            
#             # Prevent modifying predefined categories
#             if category.is_predefined:
#                 return Response(
#                     {"error": "Cannot modify predefined categories"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Use serializer for validation
#             serializer = ExpenseCategorySerializer(
#                 category, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
            
#             return Response(
#                 {"error": "Invalid update data", "details": serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         except Http404 as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to update expense category {category_id}: {str(e)}")
#             return Response(
#                 {"error": "Failed to update expense category"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def delete(self, request, category_id):
#         """Delete custom expense category with enhanced validation"""
#         try:
#             category = self.get_object(category_id)
            
#             # Prevent deleting predefined categories
#             if category.is_predefined:
#                 return Response(
#                     {"error": "Cannot delete predefined categories"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Check if category is used in any expenses
#             expense_count = ManualExpense.objects.filter(category=category).count()
            
#             if expense_count > 0:
#                 return Response(
#                     {
#                         "error": f"Cannot delete category. It is used in {expense_count} expense(s).",
#                         "expense_count": expense_count,
#                         "can_delete": False
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Get category name for response before deletion
#             category_name = category.name
            
#             # Delete the category (hard delete for custom categories)
#             category.delete()
            
#             # Clear relevant caches
#             cache.delete_pattern('reconciliation_*')
#             cache.delete_pattern('access_type_analytics_*')
            
#             return Response(
#                 {
#                     "message": f"Category '{category_name}' deleted successfully",
#                     "deleted_category": category_name
#                 },
#                 status=status.HTTP_200_OK
#             )
            
#         except Http404 as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to delete expense category {category_id}: {str(e)}")
#             return Response(
#                 {"error": "Failed to delete expense category"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ManualExpenseView(APIView):
#     """Enhanced view for managing manual expenses with access type"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Get manual expenses with enhanced filtering"""
#         try:
#             start_date = request.query_params.get('start_date')
#             end_date = request.query_params.get('end_date')
#             access_type = request.query_params.get('access_type', 'all')
#             category = request.query_params.get('category', 'all')
            
#             expenses = ManualExpense.objects.select_related('category', 'created_by')
            
#             if start_date and end_date:
#                 expenses = expenses.filter(date__range=[start_date, end_date])
            
#             if access_type != 'all':
#                 expenses = expenses.filter(access_type=access_type)
            
#             if category != 'all':
#                 expenses = expenses.filter(category_id=category)
            
#             # Sort by date descending by default
#             expenses = expenses.order_by('-date', '-created_at')
            
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
#                 expense = serializer.save(created_by=request.user)
                
#                 # Clear relevant caches
#                 cache.delete_pattern('reconciliation_*')
#                 cache.delete_pattern('access_type_analytics_*')
                
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create manual expense: {str(e)}")
#             return Response(
#                 {"error": "Failed to create manual expense"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def patch(self, request, expense_id):
#         """Update existing manual expense"""
#         try:
#             expense = ManualExpense.objects.get(id=expense_id, created_by=request.user)
#             serializer = ManualExpenseSerializer(
#                 expense, 
#                 data=request.data, 
#                 partial=True
#             )
            
#             if serializer.is_valid():
#                 serializer.save()
                
#                 # Clear relevant caches
#                 cache.delete_pattern('reconciliation_*')
#                 cache.delete_pattern('access_type_analytics_*')
                
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         except ManualExpense.DoesNotExist:
#             return Response(
#                 {"error": "Expense not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to update manual expense: {str(e)}")
#             return Response(
#                 {"error": "Failed to update manual expense"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def delete(self, request, expense_id):
#         """Delete manual expense"""
#         try:
#             expense = ManualExpense.objects.get(id=expense_id, created_by=request.user)
#             expense.delete()
            
#             # Clear relevant caches
#             cache.delete_pattern('reconciliation_*')
#             cache.delete_pattern('access_type_analytics_*')
            
#             return Response(status=status.HTTP_204_NO_CONTENT)
            
#         except ManualExpense.DoesNotExist:
#             return Response(
#                 {"error": "Expense not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to delete manual expense: {str(e)}")
#             return Response(
#                 {"error": "Failed to delete manual expense"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class ReconciliationReportView(APIView):
#     """Enhanced view for generating and managing reconciliation reports"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """Generate enhanced reconciliation report"""
#         try:
#             # Validate request data
#             serializer = ReportGenerationSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(
#                     {"error": "Invalid report parameters", "details": serializer.errors},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             data = serializer.validated_data
#             start_date = data['start_date']
#             end_date = data['end_date']
#             report_type = data['report_type']
#             filters = data.get('filters', {})
            
#             # Get reconciliation data using existing view
#             reconciliation_view = PaymentReconciliationView()
#             reconciliation_request = type('Request', (), {
#                 'query_params': {
#                     'start_date': start_date,
#                     'end_date': end_date,
#                     'view_mode': filters.get('view_mode', 'all'),
#                     'access_type': filters.get('access_type', 'all'),
#                     'search': filters.get('search', ''),
#                     'sort_by': filters.get('sort_by', 'date_desc')
#                 },
#                 'user': request.user
#             })()
            
#             reconciliation_response = reconciliation_view.get(reconciliation_request)
            
#             if reconciliation_response.status_code != 200:
#                 return Response(
#                     {"error": "Failed to generate report data", "details": reconciliation_response.data},
#                     status=reconciliation_response.status_code
#                 )
            
#             reconciliation_data = reconciliation_response.data
            
#             # Safely extract data with proper Decimal conversion
#             def safe_decimal(value, default=Decimal('0')):
#                 """Safely convert value to Decimal"""
#                 try:
#                     if value is None:
#                         return default
#                     if isinstance(value, (int, float)):
#                         return Decimal(str(value))
#                     return Decimal(str(value))  # Convert to string first
#                 except (TypeError, ValueError, decimal.InvalidOperation):
#                     return default

#             # Extract access type breakdown safely
#             access_type_breakdown = reconciliation_data.get('access_type_breakdown', {})
#             overall_summary = reconciliation_data.get('overall_summary', {})
            
#             # Create comprehensive report
#             with db_transaction.atomic():
#                 report = ReconciliationReport.objects.create(
#                     report_type=report_type,
#                     start_date=start_date,
#                     end_date=end_date,
#                     generated_by=request.user,
#                     # Revenue data with safe decimal conversion
#                     total_revenue=safe_decimal(overall_summary.get('total_revenue')),
#                     hotspot_revenue=safe_decimal(access_type_breakdown.get('hotspot', {}).get('revenue')),
#                     pppoe_revenue=safe_decimal(access_type_breakdown.get('pppoe', {}).get('revenue')),
#                     both_revenue=safe_decimal(access_type_breakdown.get('both', {}).get('revenue')),
#                     # Expense data with safe decimal conversion
#                     total_expenses=safe_decimal(overall_summary.get('total_expenses')),
#                     hotspot_expenses=safe_decimal(access_type_breakdown.get('hotspot', {}).get('expenses')),
#                     pppoe_expenses=safe_decimal(access_type_breakdown.get('pppoe', {}).get('expenses')),
#                     both_expenses=safe_decimal(access_type_breakdown.get('both', {}).get('expenses')),
#                     general_expenses=Decimal('0'),
#                     # Tax data with safe decimal conversion
#                     total_tax=safe_decimal(overall_summary.get('total_tax')),
#                     # Profit data with safe decimal conversion
#                     net_profit=safe_decimal(overall_summary.get('net_profit')),
#                     # Detailed breakdowns
#                     revenue_breakdown=access_type_breakdown,
#                     expense_breakdown={},
#                     tax_breakdown={
#                         'revenue': reconciliation_data.get('revenue', {}).get('summary', {}).get('tax_breakdown', []),
#                         'expenses': reconciliation_data.get('expenses', {}).get('summary', {}).get('tax_breakdown', [])
#                     },
#                     tax_configuration=reconciliation_data.get('tax_configuration', [])
#                 )
            
#             # Return the created report
#             report_serializer = ReconciliationReportSerializer(report)
            
#             # Clear relevant caches
#             cache.delete_pattern('reconciliation_*')
            
#             return Response(report_serializer.data, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to generate reconciliation report: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to generate reconciliation report", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def get(self, request):
#         """Get generated reports with pagination"""
#         try:
#             page = int(request.query_params.get('page', 1))
#             page_size = int(request.query_params.get('page_size', 10))
            
#             reports = ReconciliationReport.objects.all().order_by('-created_at')
            
#             # Paginate results
#             paginator = Paginator(reports, page_size)
            
#             try:
#                 page_obj = paginator.page(page)
#             except EmptyPage:
#                 return Response(
#                     {"error": "Page not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#             serializer = ReconciliationReportSerializer(page_obj, many=True)
            
#             return Response({
#                 'results': serializer.data,
#                 'pagination': {
#                     'page': page,
#                     'page_size': page_size,
#                     'total_pages': paginator.num_pages,
#                     'total_count': paginator.count,
#                     'has_next': page_obj.has_next(),
#                     'has_previous': page_obj.has_previous()
#                 }
#             })
            
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
from django.http import Http404
import json
from decimal import Decimal  
import decimal  
from django.http import Http404
from django.db import transaction
import uuid

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
    ExpenseCategoryCreateSerializer,
    ExpenseCategoryListSerializer,
    ManualExpenseSerializer,
    ReconciliationFilterSerializer,
    ReconciliationSummarySerializer,
    TransactionSummarySerializer,
    ReconciliationReportSerializer,
    AccessTypeRevenueSerializer,
    ReportGenerationSerializer
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
                pppoe_data.append(daily_totals['pppoe'])
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
    """
    Enterprise Tax Configuration Management System
    """
    permission_classes = [IsAuthenticated]

    def _get_client_ip(self, request):
        """Get client IP address for audit logging - FIXED: Made instance method"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _create_audit_log(self, user, action, description, tax_id, request=None):
        """Create audit log entry - FIXED: Added request parameter"""
        audit_data = {
            'user_id': user.id,
            'action': action,
            'description': description,
            'tax_id': tax_id,
            'timestamp': timezone.now(),
            'ip_address': self._get_client_ip(request) if request else 'Unknown'
        }
        
        # Store in cache or database-based audit log
        audit_key = f"audit_tax_{tax_id}_{uuid.uuid4()}"
        cache.set(audit_key, audit_data, 86400)  # Store for 24 hours

    def get(self, request):
        """
        Get all tax configurations with advanced filtering and caching
        """
        try:
            # Generate cache key based on request parameters
            cache_key = f"tax_configurations_{request.user.id}_{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.info(f"Cache hit for tax configurations - User: {request.user.id}")
                return Response(cached_data)
            
            # Start performance monitoring
            start_time = timezone.now()
            
            # Base queryset with select_related for performance
            taxes = TaxConfiguration.objects.all().select_related('created_by').order_by('name')
            
            # Apply filters from query parameters
            filters = self._apply_filters(taxes, request)
            taxes = filters['queryset']
            
            # Apply pagination for large datasets
            paginated_data = self._apply_pagination(taxes, request)
            
            # Serialize data
            serializer = TaxConfigurationSerializer(paginated_data['data'], many=True)
            
            # Prepare response with metadata
            response_data = {
                'data': serializer.data,
                'meta': {
                    'total_count': filters['total_count'],
                    'filtered_count': paginated_data['count'],
                    'page': paginated_data['page'],
                    'page_size': paginated_data['page_size'],
                    'total_pages': paginated_data['total_pages'],
                    'has_next': paginated_data['has_next'],
                    'has_previous': paginated_data['has_previous'],
                },
                'filters': filters['applied_filters']
            }
            
            # Cache the response for 5 minutes (300 seconds)
            cache.set(cache_key, response_data, 300)
            
            # Log performance metrics
            processing_time = (timezone.now() - start_time).total_seconds()
            logger.info(
                f"Tax configurations fetched successfully - "
                f"User: {request.user.id}, "
                f"Count: {paginated_data['count']}, "
                f"Time: {processing_time:.3f}s"
            )
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(
                f"Failed to fetch tax configurations - "
                f"User: {request.user.id}, "
                f"Error: {str(e)}",
                exc_info=True
            )
            return Response(
                {
                    "error": "Unable to retrieve tax configurations",
                    "code": "TAX_FETCH_ERROR",
                    "details": "Please try again or contact support if the problem persists"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Create new tax configuration with comprehensive validation
        """
        try:
            # Rate limiting check
            if self._is_rate_limited(request):
                return Response(
                    {
                        "error": "Too many requests",
                        "code": "RATE_LIMITED",
                        "details": "Please wait before creating more tax configurations"
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Clean the data - remove read-only fields that might be sent from frontend
            cleaned_data = self._clean_request_data(request.data)
            
            # Business logic validation
            validation_errors = self._validate_business_rules(cleaned_data)
            if validation_errors:
                return Response(
                    {
                        "error": "Business rule validation failed",
                        "code": "BUSINESS_RULE_VIOLATION",
                        "details": validation_errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for duplicate tax configurations
            duplicate_check = self._check_duplicate_tax(cleaned_data)
            if duplicate_check['is_duplicate']:
                return Response(
                    {
                        "error": "Duplicate tax configuration detected",
                        "code": "DUPLICATE_TAX",
                        "details": duplicate_check['message'],
                        "existing_tax": duplicate_check['existing_tax']
                    },
                    status=status.HTTP_409_CONFLICT
                )
            
            # Use atomic transaction to ensure data consistency
            with transaction.atomic():
                serializer = TaxConfigurationSerializer(data=cleaned_data, context={'request': request})
                
                if serializer.is_valid():
                    # Save with audit information
                    tax_instance = serializer.save()
                    
                    # Create audit log - FIXED: Pass request parameter
                    self._create_audit_log(
                        request.user,
                        'CREATE',
                        f"Created tax configuration: {tax_instance.name}",
                        tax_instance.id,
                        request
                    )
                    
                    # Clear relevant caches
                    self._invalidate_related_caches(request.user.id)
                    
                    # Prepare success response
                    response_data = {
                        "data": serializer.data,
                        "message": f"Tax configuration '{tax_instance.name}' created successfully",
                        "audit_id": str(uuid.uuid4())
                    }
                    
                    logger.info(
                        f"Tax configuration created successfully - "
                        f"User: {request.user.id}, "
                        f"Tax ID: {tax_instance.id}, "
                        f"Name: {tax_instance.name}"
                    )
                    
                    return Response(response_data, status=status.HTTP_201_CREATED)
                else:
                    # Return detailed validation errors
                    return Response(
                        {
                            "error": "Validation failed",
                            "code": "VALIDATION_ERROR",
                            "details": serializer.errors
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
        except Exception as e:
            logger.error(
                f"Failed to create tax configuration - "
                f"User: {request.user.id}, "
                f"Error: {str(e)}",
                exc_info=True
            )
            
            # Check for specific database errors
            if 'unique' in str(e).lower():
                return Response(
                    {
                        "error": "Duplicate tax configuration",
                        "code": "DUPLICATE_ENTRY",
                        "details": "A tax configuration with similar parameters already exists"
                    },
                    status=status.HTTP_409_CONFLICT
                )
            
            return Response(
                {
                    "error": "Failed to create tax configuration",
                    "code": "TAX_CREATION_ERROR",
                    "details": "Please check your input and try again"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _clean_request_data(self, data):
        """Clean request data by removing read-only and invalid fields"""
        cleaned_data = data.copy()
        
        # Remove read-only fields that should not be sent in requests
        read_only_fields = [
            'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
            'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
            'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
        ]
        
        for field in read_only_fields:
            if field in cleaned_data:
                del cleaned_data[field]
        
        # Handle empty strings for optional fields
        if 'description' in cleaned_data and cleaned_data['description'] == '':
            cleaned_data['description'] = None
            
        if 'revision_notes' in cleaned_data and cleaned_data['revision_notes'] == '':
            cleaned_data['revision_notes'] = None
            
        if 'effective_to' in cleaned_data and cleaned_data['effective_to'] == '':
            cleaned_data['effective_to'] = None
        
        return cleaned_data

    def _apply_filters(self, queryset, request):
        """Apply advanced filtering to tax configurations"""
        applied_filters = {}
        total_count = queryset.count()
        
        # Filter by tax type
        tax_type = request.GET.get('tax_type')
        if tax_type:
            queryset = queryset.filter(tax_type=tax_type)
            applied_filters['tax_type'] = tax_type
        
        # Filter by access type
        access_type = request.GET.get('access_type')
        if access_type:
            queryset = queryset.filter(access_type=access_type)
            applied_filters['access_type'] = access_type
        
        # Filter by status (enabled/disabled)
        is_enabled = request.GET.get('is_enabled')
        if is_enabled is not None:
            is_enabled_bool = is_enabled.lower() == 'true'
            queryset = queryset.filter(is_enabled=is_enabled_bool)
            applied_filters['is_enabled'] = is_enabled_bool
        
        # Search by name
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
            applied_filters['search'] = search
        
        return {
            'queryset': queryset,
            'total_count': total_count,
            'applied_filters': applied_filters
        }

    def _apply_pagination(self, queryset, request):
        """Apply pagination to large datasets"""
        page = int(request.GET.get('page', 1))
        page_size = min(int(request.GET.get('page_size', 50)), 100)  # Max 100 per page
        
        start = (page - 1) * page_size
        end = start + page_size
        
        data = list(queryset[start:end])
        total_count = queryset.count()
        total_pages = (total_count + page_size - 1) // page_size
        
        return {
            'data': data,
            'count': len(data),
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'has_next': page < total_pages,
            'has_previous': page > 1
        }

    def _validate_business_rules(self, data):
        """Validate business rules for tax configuration"""
        errors = []
        
        # Rate validation
        if 'rate' in data:
            try:
                rate = float(data['rate'])
                if rate > 50 and not data.get('requires_approval', False):
                    errors.append("Tax rates above 50% require special approval")
                if rate <= 0:
                    errors.append("Tax rate must be greater than 0")
            except (ValueError, TypeError):
                errors.append("Invalid tax rate format")
        
        # Name validation
        if 'name' in data and len(data['name']) > 100:
            errors.append("Tax name cannot exceed 100 characters")
        
        # Access type validation
        valid_access_types = ['all', 'hotspot', 'pppoe', 'both']
        if 'access_type' in data and data['access_type'] not in valid_access_types:
            errors.append(f"Invalid access type. Must be one of: {', '.join(valid_access_types)}")
        
        return errors

    def _check_duplicate_tax(self, data):
        """Check for duplicate tax configurations"""
        try:
            # Check for exact duplicates
            duplicate_taxes = TaxConfiguration.objects.filter(
                name=data.get('name'),
                tax_type=data.get('tax_type', 'custom'),
                access_type=data.get('access_type', 'all')
            )
            
            if duplicate_taxes.exists():
                existing_tax = duplicate_taxes.first()
                return {
                    'is_duplicate': True,
                    'message': f"A tax configuration with name '{data['name']}' already exists",
                    'existing_tax': TaxConfigurationSerializer(existing_tax).data
                }
            
            return {'is_duplicate': False}
            
        except Exception as e:
            logger.warning(f"Duplicate check failed: {str(e)}")
            return {'is_duplicate': False}

    def _is_rate_limited(self, request):
        """Simple rate limiting check"""
        cache_key = f"tax_creation_rate_{request.user.id}"
        recent_creations = cache.get(cache_key, 0)
        
        if recent_creations >= 10:  # Limit to 10 creations per minute
            return True
        
        cache.set(cache_key, recent_creations + 1, 60)  # 1 minute window
        return False

    def _invalidate_related_caches(self, user_id):
        """Invalidate all related caches"""
        cache.delete_pattern(f"tax_configurations_{user_id}_*")
        cache.delete_pattern('reconciliation_*')
        cache.delete_pattern('access_type_analytics_*')
        cache.delete_pattern('dashboard_stats_*')


class TaxConfigurationDetailView(APIView):
    """
    Enterprise Tax Configuration Detail Management
    """
    permission_classes = [IsAuthenticated]

    def _get_client_ip(self, request):
        """Get client IP address for audit logging"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _create_audit_log(self, user, action, description, tax_id, request=None):
        """Create audit log entry"""
        audit_data = {
            'user_id': user.id,
            'action': action,
            'description': description,
            'tax_id': tax_id,
            'timestamp': timezone.now(),
            'ip_address': self._get_client_ip(request) if request else 'Unknown'
        }
        
        # Store in cache or database-based audit log
        audit_key = f"audit_tax_{tax_id}_{uuid.uuid4()}"
        cache.set(audit_key, audit_data, 86400)  # Store for 24 hours

    def get_object(self, tax_id):
        """
        Get tax object with enhanced error handling and performance optimization
        """
        try:
            # Use select_related for performance
            return TaxConfiguration.objects.select_related('created_by', 'updated_by').get(id=tax_id)
        except TaxConfiguration.DoesNotExist:
            logger.warning(f"Tax configuration not found - Tax ID: {tax_id}")
            raise Http404({
                "error": "Tax configuration not found",
                "code": "TAX_NOT_FOUND",
                "details": "The requested tax configuration does not exist or has been deleted"
            })
        except Exception as e:
            logger.error(f"Error retrieving tax configuration - Tax ID: {tax_id}, Error: {str(e)}")
            raise Http404({
                "error": "Error retrieving tax configuration",
                "code": "TAX_RETRIEVAL_ERROR",
                "details": "Unable to retrieve the requested tax configuration"
            })

    def get(self, request, tax_id):
        """
        Get specific tax configuration details with full autonomy
        """
        try:
            tax = self.get_object(tax_id)
            serializer = TaxConfigurationSerializer(tax)
            
            # Add audit information
            response_data = {
                "data": serializer.data,
                "permissions": {
                    "can_edit": True,
                    "can_delete": True,
                    "can_toggle": True
                },
                "audit_trail": self._get_audit_trail(tax_id)
            }
            
            logger.info(f"Tax configuration retrieved - Tax ID: {tax_id}, User: {request.user.id}")
            return Response(response_data)
            
        except Http404 as e:
            return Response(e.args[0], status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(
                f"Failed to fetch tax configuration - "
                f"Tax ID: {tax_id}, User: {request.user.id}, Error: {str(e)}",
                exc_info=True
            )
            return Response(
                {
                    "error": "Failed to retrieve tax configuration",
                    "code": "TAX_FETCH_DETAIL_ERROR",
                    "details": "Please try again or contact support"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, tax_id):
        """
        Full update of tax configuration with comprehensive validation
        """
        return self._update_tax_configuration(request, tax_id, partial=False)

    def patch(self, request, tax_id):
        """
        Partial update of tax configuration with comprehensive validation
        """
        return self._update_tax_configuration(request, tax_id, partial=True)

    def _update_tax_configuration(self, request, tax_id, partial=False):
        """
        Unified update method for PUT and PATCH requests with enhanced error handling
        """
        try:
            tax = self.get_object(tax_id)
            
            # Enhanced data cleaning with logging
            cleaned_data = self._clean_request_data(request.data)
            logger.info(f"Tax update request - Tax ID: {tax_id}, Data: {cleaned_data}")
            
            # Business rule validation
            validation_errors = self._validate_business_rules(cleaned_data)
            if validation_errors:
                logger.warning(f"Business rule validation failed for tax {tax_id}: {validation_errors}")
                return Response(
                    {
                        "error": "Business rule validation failed",
                        "code": "BUSINESS_RULE_VIOLATION",
                        "details": validation_errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use atomic transaction for data consistency
            with transaction.atomic():
                try:
                    serializer = TaxConfigurationSerializer(
                        tax, 
                        data=cleaned_data, 
                        partial=partial,
                        context={'request': request}
                    )
                    
                    if serializer.is_valid():
                        # Save with audit information - updated_by will be set automatically in serializer
                        updated_tax = serializer.save()
                        
                        # Create audit log
                        action = 'UPDATE' if partial else 'FULL_UPDATE'
                        self._create_audit_log(
                            request.user,
                            action,
                            f"Updated tax configuration: {updated_tax.name}",
                            tax_id,
                            request
                        )
                        
                        # Clear relevant caches
                        self._invalidate_related_caches(request.user.id)
                        
                        # Prepare success response
                        response_data = {
                            "data": serializer.data,
                            "message": f"Tax configuration '{updated_tax.name}' updated successfully",
                            "audit_id": str(uuid.uuid4()),
                            "changes": self._get_changes(tax, updated_tax) if not partial else None
                        }
                        
                        logger.info(
                            f"Tax configuration updated successfully - "
                            f"Tax ID: {tax_id}, User: {request.user.id}, "
                            f"Name: {updated_tax.name}"
                        )
                        
                        return Response(response_data)
                    else:
                        logger.warning(f"Serializer validation failed for tax {tax_id}: {serializer.errors}")
                        return Response(
                            {
                                "error": "Validation failed",
                                "code": "VALIDATION_ERROR",
                                "details": serializer.errors
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
                        
                except Exception as serializer_error:
                    logger.error(f"Serializer error for tax {tax_id}: {str(serializer_error)}")
                    raise serializer_error
                    
        except Http404 as e:
            return Response(e.args[0], status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(
                f"Failed to update tax configuration - "
                f"Tax ID: {tax_id}, User: {request.user.id}, Error: {str(e)}",
                exc_info=True
            )
            
            # Provide more specific error messages
            error_message = "Failed to update tax configuration"
            error_details = "Please check your input and try again"
            
            if "datetime" in str(e).lower():
                error_message = "Invalid date format"
                error_details = "Please check the effective date formats"
            elif "decimal" in str(e).lower():
                error_message = "Invalid rate format"
                error_details = "Tax rate must be a valid number"
            
            return Response(
                {
                    "error": error_message,
                    "code": "TAX_UPDATE_ERROR",
                    "details": error_details
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, tax_id):
        """
        Delete tax configuration with FULL AUTONOMY
        """
        try:
            tax = self.get_object(tax_id)
            tax_name = tax.name
            
            # Use atomic transaction for data consistency
            with transaction.atomic():
                # Create comprehensive audit log before deletion
                self._create_audit_log(
                    request.user,
                    'DELETE',
                    f"Deleted tax configuration: {tax_name} (Rate: {tax.rate}%, Type: {tax.tax_type})",
                    tax_id,
                    request
                )
                
                # Capture tax details for response
                tax_details = {
                    'id': str(tax.id),
                    'name': tax_name,
                    'rate': float(tax.rate),
                    'tax_type': tax.tax_type,
                    'access_type': tax.access_type,
                    'was_enabled': tax.is_enabled
                }
                
                # Perform deletion
                tax.delete()
                
                # Clear all related caches
                self._invalidate_related_caches(request.user.id)
                
                # Prepare success response with detailed information
                response_data = {
                    "message": f"Tax configuration '{tax_name}' deleted successfully",
                    "deleted_tax": tax_details,
                    "audit_id": str(uuid.uuid4()),
                    "timestamp": timezone.now().isoformat(),
                    "remaining_taxes_count": TaxConfiguration.objects.count()
                }
                
                logger.info(
                    f"Tax configuration deleted with full autonomy - "
                    f"Tax ID: {tax_id}, User: {request.user.id}, "
                    f"Name: {tax_name}, Was Enabled: {tax_details['was_enabled']}"
                )
                
                return Response(response_data, status=status.HTTP_200_OK)
                
        except Http404 as e:
            return Response(e.args[0], status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(
                f"Failed to delete tax configuration - "
                f"Tax ID: {tax_id}, User: {request.user.id}, Error: {str(e)}",
                exc_info=True
            )
            return Response(
                {
                    "error": "Failed to delete tax configuration",
                    "code": "TAX_DELETION_ERROR",
                    "details": "Please try again or contact support"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _clean_request_data(self, data):
        """Enhanced data cleaning with better handling of different data types"""
        if not isinstance(data, dict):
            return data
            
        cleaned_data = data.copy()
        
        # Remove read-only fields that should not be sent in requests
        read_only_fields = [
            'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
            'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
            'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
        ]
        
        for field in read_only_fields:
            if field in cleaned_data:
                del cleaned_data[field]
        
        # Handle empty strings for optional fields - convert to None
        optional_fields = ['description', 'revision_notes', 'effective_to']
        for field in optional_fields:
            if field in cleaned_data and cleaned_data[field] == '':
                cleaned_data[field] = None
        
        # Handle boolean fields - ensure they are proper booleans
        boolean_fields = ['is_enabled', 'is_included_in_price', 'requires_approval']
        for field in boolean_fields:
            if field in cleaned_data:
                if isinstance(cleaned_data[field], str):
                    cleaned_data[field] = cleaned_data[field].lower() in ['true', '1', 'yes']
        
        # Handle rate field - ensure it's properly formatted
        if 'rate' in cleaned_data:
            try:
                if isinstance(cleaned_data['rate'], str):
                    # Remove any non-numeric characters except decimal point
                    cleaned_data['rate'] = ''.join(c for c in cleaned_data['rate'] if c.isdigit() or c == '.')
                cleaned_data['rate'] = Decimal(str(cleaned_data['rate']))
            except (ValueError, TypeError, decimal.InvalidOperation):
                # If rate conversion fails, remove it and let validation handle it
                del cleaned_data['rate']
        
        # IMPORTANT: Don't auto-correct effective_from - let user set their own date
        # The frontend will default to current time, but backend respects user's choice
        if 'effective_from' in cleaned_data and isinstance(cleaned_data['effective_from'], str):
            try:
                from django.utils.dateparse import parse_datetime
                parsed_dt = parse_datetime(cleaned_data['effective_from'])
                # Allow past dates for historical records and user flexibility
                if parsed_dt:
                    # Just ensure it's a valid datetime, don't auto-correct
                    cleaned_data['effective_from'] = parsed_dt.strftime('%Y-%m-%d %H:%M:%S')
            except (ValueError, TypeError):
                # If parsing fails, let the serializer handle the error
                pass
        
        # Log the cleaned data for debugging
        logger.debug(f"Cleaned tax data: {cleaned_data}")
        
        return cleaned_data

    def _get_audit_trail(self, tax_id):
        """Get audit trail for tax configuration"""
        audit_pattern = f"audit_tax_{tax_id}_*"
        audit_keys = cache.keys(audit_pattern)
        audit_entries = [cache.get(key) for key in audit_keys if cache.get(key)]
        
        return sorted(audit_entries, key=lambda x: x['timestamp'], reverse=True)[:10]

    def _get_changes(self, old_tax, new_tax):
        """Detect changes between old and new tax configuration"""
        changes = {}
        
        fields_to_check = ['name', 'rate', 'tax_type', 'access_type', 'applies_to', 'is_enabled', 'is_included_in_price']
        
        for field in fields_to_check:
            old_value = getattr(old_tax, field)
            new_value = getattr(new_tax, field)
            
            if old_value != new_value:
                changes[field] = {
                    'from': old_value,
                    'to': new_value
                }
        
        return changes

    def _validate_business_rules(self, data):
        """Validate business rules for tax configuration"""
        errors = []
        
        # Rate validation
        if 'rate' in data:
            try:
                rate = float(data['rate'])
                if rate > 50 and not data.get('requires_approval', False):
                    errors.append("Tax rates above 50% require special approval")
                if rate <= 0:
                    errors.append("Tax rate must be greater than 0")
            except (ValueError, TypeError):
                errors.append("Invalid tax rate format")
        
        # Name validation
        if 'name' in data and len(data['name']) > 100:
            errors.append("Tax name cannot exceed 100 characters")
        
        # Access type validation
        valid_access_types = ['all', 'hotspot', 'pppoe', 'both']
        if 'access_type' in data and data['access_type'] not in valid_access_types:
            errors.append(f"Invalid access type. Must be one of: {', '.join(valid_access_types)}")
        
        return errors
    
    def _invalidate_related_caches(self, user_id):
        """Invalidate all related caches"""
        cache.delete_pattern(f"tax_configurations_{user_id}_*")
        cache.delete_pattern('reconciliation_*')
        cache.delete_pattern('access_type_analytics_*')
        cache.delete_pattern('dashboard_stats_*')



class ExpenseCategoryView(APIView):
    """Enhanced view for managing expense categories with full CRUD"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all expense categories with optional filtering"""
        try:
            # Check if we need to initialize predefined categories
            if not ExpenseCategory.objects.filter(is_predefined=True).exists():
                ExpenseCategory.initialize_predefined_categories(request.user)
            
            # Get query parameters for filtering
            is_active = request.query_params.get('is_active', 'true').lower() == 'true'
            include_predefined = request.query_params.get('include_predefined', 'true').lower() == 'true'
            
            categories = ExpenseCategory.objects.all()
            
            # Apply filters
            if is_active:
                categories = categories.filter(is_active=True)
            
            if not include_predefined:
                categories = categories.filter(is_predefined=False)
            
            # Annotate with expense counts and totals
            categories = categories.annotate(
                expense_count=Count('expenses'),
                total_amount=Sum('expenses__amount')
            ).order_by('name')
            
            # Use enhanced serializer that includes expense stats
            serializer = ExpenseCategoryListSerializer(categories, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Failed to fetch expense categories: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch expense categories", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Create new expense category"""
        try:
            name = request.data.get('name', '').strip()
            description = request.data.get('description', '').strip()
            
            # Validate required fields
            if not name:
                return Response(
                    {"error": "Category name is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for duplicate category names (case-insensitive)
            if ExpenseCategory.objects.filter(
                name__iexact=name,
                is_active=True
            ).exists():
                return Response(
                    {"error": f"Category '{name}' already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use serializer for validation and creation
            serializer = ExpenseCategoryCreateSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                # Save with the current user as creator
                category = serializer.save(created_by=request.user)
                
                # Return full category data with success message
                full_serializer = ExpenseCategorySerializer(category)
                response_data = full_serializer.data
                response_data['message'] = f"Category '{name}' created successfully"
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            # Return validation errors
            return Response(
                {"error": "Invalid category data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Failed to create expense category: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create expense category", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExpenseCategoryDetailView(APIView):
    """Enhanced view for managing individual expense categories with deletion support"""
    permission_classes = [IsAuthenticated]

    def get_object(self, category_id):
        """Helper method to get category object or return 404"""
        try:
            return ExpenseCategory.objects.get(id=category_id)
        except ExpenseCategory.DoesNotExist:
            raise Http404("Expense category not found")

    def get(self, request, category_id):
        """Get specific expense category details"""
        try:
            category = self.get_object(category_id)
            serializer = ExpenseCategorySerializer(category)
            return Response(serializer.data)
        except Http404 as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to fetch expense category {category_id}: {str(e)}")
            return Response(
                {"error": "Failed to fetch expense category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, category_id):
        """Update expense category"""
        try:
            category = self.get_object(category_id)
            
            # Prevent modifying predefined categories
            if category.is_predefined:
                return Response(
                    {"error": "Cannot modify predefined categories"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use serializer for validation
            serializer = ExpenseCategorySerializer(
                category, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(
                {"error": "Invalid update data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Http404 as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to update expense category {category_id}: {str(e)}")
            return Response(
                {"error": "Failed to update expense category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, category_id):
        """Delete custom expense category with enhanced validation"""
        try:
            category = self.get_object(category_id)
            
            # Prevent deleting predefined categories
            if category.is_predefined:
                return Response(
                    {"error": "Cannot delete predefined categories"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if category is used in any expenses
            expense_count = ManualExpense.objects.filter(category=category).count()
            
            if expense_count > 0:
                return Response(
                    {
                        "error": f"Cannot delete category. It is used in {expense_count} expense(s).",
                        "expense_count": expense_count,
                        "can_delete": False
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get category name for response before deletion
            category_name = category.name
            
            # Delete the category (hard delete for custom categories)
            category.delete()
            
            # Clear relevant caches
            cache.delete_pattern('reconciliation_*')
            cache.delete_pattern('access_type_analytics_*')
            
            return Response(
                {
                    "message": f"Category '{category_name}' deleted successfully",
                    "deleted_category": category_name
                },
                status=status.HTTP_200_OK
            )
            
        except Http404 as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to delete expense category {category_id}: {str(e)}")
            return Response(
                {"error": "Failed to delete expense category"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ManualExpenseView(APIView):
    """Enhanced view for managing manual expenses with access type"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get manual expenses with enhanced filtering"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            access_type = request.query_params.get('access_type', 'all')
            category = request.query_params.get('category', 'all')
            
            expenses = ManualExpense.objects.select_related('category', 'created_by')
            
            if start_date and end_date:
                expenses = expenses.filter(date__range=[start_date, end_date])
            
            if access_type != 'all':
                expenses = expenses.filter(access_type=access_type)
            
            if category != 'all':
                expenses = expenses.filter(category_id=category)
            
            # Sort by date descending by default
            expenses = expenses.order_by('-date', '-created_at')
            
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
                expense = serializer.save(created_by=request.user)
                
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

    def patch(self, request, expense_id):
        """Update existing manual expense"""
        try:
            expense = ManualExpense.objects.get(id=expense_id, created_by=request.user)
            serializer = ManualExpenseSerializer(
                expense, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                
                # Clear relevant caches
                cache.delete_pattern('reconciliation_*')
                cache.delete_pattern('access_type_analytics_*')
                
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except ManualExpense.DoesNotExist:
            return Response(
                {"error": "Expense not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to update manual expense: {str(e)}")
            return Response(
                {"error": "Failed to update manual expense"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, expense_id):
        """Delete manual expense"""
        try:
            expense = ManualExpense.objects.get(id=expense_id, created_by=request.user)
            expense.delete()
            
            # Clear relevant caches
            cache.delete_pattern('reconciliation_*')
            cache.delete_pattern('access_type_analytics_*')
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except ManualExpense.DoesNotExist:
            return Response(
                {"error": "Expense not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to delete manual expense: {str(e)}")
            return Response(
                {"error": "Failed to delete manual expense"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReconciliationReportView(APIView):
    """Enhanced view for generating and managing reconciliation reports"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Generate enhanced reconciliation report"""
        try:
            # Validate request data
            serializer = ReportGenerationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {"error": "Invalid report parameters", "details": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            data = serializer.validated_data
            start_date = data['start_date']
            end_date = data['end_date']
            report_type = data['report_type']
            filters = data.get('filters', {})
            
            # Get reconciliation data using existing view
            reconciliation_view = PaymentReconciliationView()
            reconciliation_request = type('Request', (), {
                'query_params': {
                    'start_date': start_date,
                    'end_date': end_date,
                    'view_mode': filters.get('view_mode', 'all'),
                    'access_type': filters.get('access_type', 'all'),
                    'search': filters.get('search', ''),
                    'sort_by': filters.get('sort_by', 'date_desc')
                },
                'user': request.user
            })()
            
            reconciliation_response = reconciliation_view.get(reconciliation_request)
            
            if reconciliation_response.status_code != 200:
                return Response(
                    {"error": "Failed to generate report data", "details": reconciliation_response.data},
                    status=reconciliation_response.status_code
                )
            
            reconciliation_data = reconciliation_response.data
            
            # Safely extract data with proper Decimal conversion
            def safe_decimal(value, default=Decimal('0')):
                """Safely convert value to Decimal"""
                try:
                    if value is None:
                        return default
                    if isinstance(value, (int, float)):
                        return Decimal(str(value))
                    return Decimal(str(value))  # Convert to string first
                except (TypeError, ValueError, decimal.InvalidOperation):
                    return default

            # Extract access type breakdown safely
            access_type_breakdown = reconciliation_data.get('access_type_breakdown', {})
            overall_summary = reconciliation_data.get('overall_summary', {})
            
            # Create comprehensive report
            with db_transaction.atomic():
                report = ReconciliationReport.objects.create(
                    report_type=report_type,
                    start_date=start_date,
                    end_date=end_date,
                    generated_by=request.user,
                    # Revenue data with safe decimal conversion
                    total_revenue=safe_decimal(overall_summary.get('total_revenue')),
                    hotspot_revenue=safe_decimal(access_type_breakdown.get('hotspot', {}).get('revenue')),
                    pppoe_revenue=safe_decimal(access_type_breakdown.get('pppoe', {}).get('revenue')),
                    both_revenue=safe_decimal(access_type_breakdown.get('both', {}).get('revenue')),
                    # Expense data with safe decimal conversion
                    total_expenses=safe_decimal(overall_summary.get('total_expenses')),
                    hotspot_expenses=safe_decimal(access_type_breakdown.get('hotspot', {}).get('expenses')),
                    pppoe_expenses=safe_decimal(access_type_breakdown.get('pppoe', {}).get('expenses')),
                    both_expenses=safe_decimal(access_type_breakdown.get('both', {}).get('expenses')),
                    general_expenses=Decimal('0'),
                    # Tax data with safe decimal conversion
                    total_tax=safe_decimal(overall_summary.get('total_tax')),
                    # Profit data with safe decimal conversion
                    net_profit=safe_decimal(overall_summary.get('net_profit')),
                    # Detailed breakdowns
                    revenue_breakdown=access_type_breakdown,
                    expense_breakdown={},
                    tax_breakdown={
                        'revenue': reconciliation_data.get('revenue', {}).get('summary', {}).get('tax_breakdown', []),
                        'expenses': reconciliation_data.get('expenses', {}).get('summary', {}).get('tax_breakdown', [])
                    },
                    tax_configuration=reconciliation_data.get('tax_configuration', [])
                )
            
            # Return the created report
            report_serializer = ReconciliationReportSerializer(report)
            
            # Clear relevant caches
            cache.delete_pattern('reconciliation_*')
            
            return Response(report_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to generate reconciliation report: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to generate reconciliation report", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """Get generated reports with pagination"""
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            reports = ReconciliationReport.objects.all().order_by('-created_at')
            
            # Paginate results
            paginator = Paginator(reports, page_size)
            
            try:
                page_obj = paginator.page(page)
            except EmptyPage:
                return Response(
                    {"error": "Page not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = ReconciliationReportSerializer(page_obj, many=True)
            
            return Response({
                'results': serializer.data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_pages': paginator.num_pages,
                    'total_count': paginator.count,
                    'has_next': page_obj.has_next(),
                    'has_previous': page_obj.has_previous()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch reconciliation reports: {str(e)}")
            return Response(
                {"error": "Failed to fetch reconciliation reports"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )