





# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import Q, Sum, Count
# from django.utils import timezone
# from django.core.paginator import Paginator, EmptyPage
# from datetime import datetime, timedelta
# import logging

# from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory
# from payments.serializers.transaction_log_serializer import (
#     TransactionLogSerializer,
#     TransactionLogStatsSerializer,
#     TransactionLogFilterSerializer,
#     TransactionLogHistorySerializer
# )

# logger = logging.getLogger(__name__)

# class TransactionLogView(APIView):
#     """
#     API endpoint for transaction log management
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get transaction logs with filtering and pagination
#         """
#         try:
#             # Validate filter parameters
#             filter_serializer = TransactionLogFilterSerializer(data=request.query_params)
#             if not filter_serializer.is_valid():
#                 return Response(
#                     {"error": "Invalid filter parameters", "details": filter_serializer.errors},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             filters = filter_serializer.validated_data
            
#             # Build base query
#             queryset = TransactionLog.objects.select_related(
#                 'client', 'client__user', 'user', 'payment_transaction'
#             ).all()
            
#             # Apply date filter with timezone awareness
#             start_date = filters.get('start_date')
#             end_date = filters.get('end_date')
            
#             if start_date and end_date:
#                 start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
#                 end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
#                 queryset = queryset.filter(created_at__range=[start_dt, end_dt])
#             elif start_date:
#                 start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
#                 queryset = queryset.filter(created_at__gte=start_dt)
#             elif end_date:
#                 end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
#                 queryset = queryset.filter(created_at__lte=end_dt)
#             else:
#                 # Default: last 7 days
#                 default_start = timezone.now() - timedelta(days=7)
#                 queryset = queryset.filter(created_at__gte=default_start)
            
#             # Apply status filter
#             status_filter = filters.get('status')
#             if status_filter and status_filter != 'all':
#                 queryset = queryset.filter(status=status_filter)
            
#             # Apply payment method filter
#             payment_method = filters.get('payment_method')
#             if payment_method:
#                 queryset = queryset.filter(payment_method=payment_method)
            
#             # Apply search filter
#             search_term = filters.get('search')
#             if search_term:
#                 queryset = queryset.filter(
#                     Q(transaction_id__icontains=search_term) |
#                     Q(phone_number__icontains=search_term) |
#                     Q(client__user__username__icontains=search_term) |
#                     Q(client__user__first_name__icontains=search_term) |
#                     Q(client__user__last_name__icontains=search_term) |
#                     Q(reference_number__icontains=search_term)
#                 )
            
#             # Apply sorting
#             sort_by = filters.get('sort_by', 'date_desc')
#             if sort_by == 'date_desc':
#                 queryset = queryset.order_by('-created_at')
#             elif sort_by == 'date_asc':
#                 queryset = queryset.order_by('created_at')
#             elif sort_by == 'amount_desc':
#                 queryset = queryset.order_by('-amount')
#             elif sort_by == 'amount_asc':
#                 queryset = queryset.order_by('amount')
            
#             # Pagination
#             page = filters.get('page', 1)
#             page_size = min(filters.get('page_size', 20), 100)
            
#             paginator = Paginator(queryset, page_size)
            
#             try:
#                 page_obj = paginator.page(page)
#             except EmptyPage:
#                 page_obj = paginator.page(paginator.num_pages)
            
#             # Serialize data
#             serializer = TransactionLogSerializer(page_obj, many=True)
            
#             # Calculate statistics
#             stats = self._calculate_statistics(queryset)
            
#             return Response({
#                 "transactions": serializer.data,
#                 "pagination": {
#                     "current_page": page_obj.number,
#                     "total_pages": paginator.num_pages,
#                     "total_items": paginator.count,
#                     "page_size": page_size,
#                     "has_next": page_obj.has_next(),
#                     "has_previous": page_obj.has_previous()
#                 },
#                 "stats": stats,
#                 "filters": filters
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch transaction logs: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch transaction logs", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _calculate_statistics(self, queryset):
#         """Calculate transaction statistics"""
#         total = queryset.count()
#         success = queryset.filter(status='success').count()
#         pending = queryset.filter(status='pending').count()
#         failed = queryset.filter(status='failed').count()
        
#         total_amount = queryset.aggregate(
#             total_amount=Sum('amount')
#         )['total_amount'] or 0
        
#         return {
#             "total": total,
#             "success": success,
#             "pending": pending,
#             "failed": failed,
#             "totalAmount": float(total_amount)
#         }

# class TransactionLogStatsView(APIView):
#     """
#     API endpoint for transaction statistics
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get comprehensive transaction statistics
#         """
#         try:
#             # Overall statistics
#             total_stats = TransactionLog.objects.aggregate(
#                 total=Count('id'),
#                 success=Count('id', filter=Q(status='success')),
#                 pending=Count('id', filter=Q(status='pending')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 total_amount=Sum('amount')
#             )
            
#             # Daily statistics for last 7 days
#             daily_stats = []
#             for i in range(6, -1, -1):
#                 date = timezone.now() - timedelta(days=i)
#                 start_of_day = timezone.make_aware(datetime.combine(date, datetime.min.time()))
#                 end_of_day = timezone.make_aware(datetime.combine(date, datetime.max.time()))
                
#                 day_stats = TransactionLog.objects.filter(
#                     created_at__range=[start_of_day, end_of_day]
#                 ).aggregate(
#                     total=Count('id'),
#                     success=Count('id', filter=Q(status='success')),
#                     pending=Count('id', filter=Q(status='pending')),
#                     failed=Count('id', filter=Q(status='failed')),
#                     total_amount=Sum('amount')
#                 )
                
#                 daily_stats.append({
#                     "date": date.date().isoformat(),
#                     "stats": day_stats
#                 })
            
#             # Payment method distribution
#             method_stats = TransactionLog.objects.values('payment_method').annotate(
#                 count=Count('id'),
#                 total_amount=Sum('amount')
#             ).order_by('-count')
            
#             return Response({
#                 "overall": total_stats,
#                 "daily": daily_stats,
#                 "by_method": list(method_stats)
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch transaction statistics: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch transaction statistics", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class TransactionLogDetailView(APIView):
#     """
#     API endpoint for individual transaction log details
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, transaction_id):
#         """
#         Get detailed information for a specific transaction
#         """
#         try:
#             transaction_log = TransactionLog.objects.select_related(
#                 'client', 'client__user', 'user', 'payment_transaction'
#             ).get(transaction_id=transaction_id)
            
#             serializer = TransactionLogSerializer(transaction_log)
            
#             # Get transaction history
#             history = TransactionLogHistory.objects.filter(
#                 transaction_log=transaction_log
#             ).order_by('-timestamp')
#             history_serializer = TransactionLogHistorySerializer(history, many=True)
            
#             return Response({
#                 "transaction": serializer.data,
#                 "history": history_serializer.data
#             })
            
#         except TransactionLog.DoesNotExist:
#             return Response(
#                 {"error": "Transaction not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch transaction details: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch transaction details", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )







# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import Q, Sum, Count, Avg
# from django.utils import timezone
# from django.core.paginator import Paginator, EmptyPage
# from datetime import datetime, timedelta
# import logging

# from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory
# from payments.serializers.transaction_log_serializer import (
#     TransactionLogSerializer,
#     TransactionLogStatsSerializer,
#     TransactionLogFilterSerializer,
#     TransactionLogHistorySerializer,
#     AccessTypeComparisonSerializer
# )

# logger = logging.getLogger(__name__)

# class TransactionLogView(APIView):
#     """
#     API endpoint for transaction log management with PPPoE/Hotspot support
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get transaction logs with filtering and pagination
#         """
#         try:
#             # Validate filter parameters
#             filter_serializer = TransactionLogFilterSerializer(data=request.query_params)
#             if not filter_serializer.is_valid():
#                 return Response(
#                     {"error": "Invalid filter parameters", "details": filter_serializer.errors},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             filters = filter_serializer.validated_data
            
#             # Build base query
#             queryset = TransactionLog.objects.select_related(
#                 'client', 'client__user', 'user', 'payment_transaction',
#                 'subscription', 'internet_plan'
#             ).all()
            
#             # Apply date filter with timezone awareness
#             start_date = filters.get('start_date')
#             end_date = filters.get('end_date')
            
#             if start_date and end_date:
#                 start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
#                 end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
#                 queryset = queryset.filter(created_at__range=[start_dt, end_dt])
#             elif start_date:
#                 start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
#                 queryset = queryset.filter(created_at__gte=start_dt)
#             elif end_date:
#                 end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
#                 queryset = queryset.filter(created_at__lte=end_dt)
#             else:
#                 # Default: last 7 days
#                 default_start = timezone.now() - timedelta(days=7)
#                 queryset = queryset.filter(created_at__gte=default_start)
            
#             # Apply status filter
#             status_filter = filters.get('status')
#             if status_filter and status_filter != 'all':
#                 queryset = queryset.filter(status=status_filter)
            
#             # Apply payment method filter
#             payment_method = filters.get('payment_method')
#             if payment_method:
#                 queryset = queryset.filter(payment_method=payment_method)
            
#             # Apply access type filter (PPPoE/Hotspot)
#             access_type = filters.get('access_type')
#             if access_type and access_type != 'all':
#                 queryset = queryset.filter(access_type=access_type)
            
#             # Apply plan filter
#             plan_id = filters.get('plan_id')
#             if plan_id:
#                 queryset = queryset.filter(internet_plan_id=plan_id)
            
#             # Apply search filter
#             search_term = filters.get('search')
#             if search_term:
#                 queryset = queryset.filter(
#                     Q(transaction_id__icontains=search_term) |
#                     Q(phone_number__icontains=search_term) |
#                     Q(client__user__username__icontains=search_term) |
#                     Q(client__user__first_name__icontains=search_term) |
#                     Q(client__user__last_name__icontains=search_term) |
#                     Q(reference_number__icontains=search_term) |
#                     Q(internet_plan__name__icontains=search_term) |
#                     Q(access_type__icontains=search_term)
#                 )
            
#             # Apply sorting
#             sort_by = filters.get('sort_by', 'date_desc')
#             if sort_by == 'date_desc':
#                 queryset = queryset.order_by('-created_at')
#             elif sort_by == 'date_asc':
#                 queryset = queryset.order_by('created_at')
#             elif sort_by == 'amount_desc':
#                 queryset = queryset.order_by('-amount')
#             elif sort_by == 'amount_asc':
#                 queryset = queryset.order_by('amount')
#             elif sort_by == 'access_type':
#                 queryset = queryset.order_by('access_type')
            
#             # Pagination
#             page = filters.get('page', 1)
#             page_size = min(filters.get('page_size', 20), 100)
            
#             paginator = Paginator(queryset, page_size)
            
#             try:
#                 page_obj = paginator.page(page)
#             except EmptyPage:
#                 page_obj = paginator.page(paginator.num_pages)
            
#             # Serialize data
#             serializer = TransactionLogSerializer(page_obj, many=True)
            
#             # Calculate statistics
#             stats = self._calculate_statistics(queryset)
            
#             return Response({
#                 "transactions": serializer.data,
#                 "pagination": {
#                     "current_page": page_obj.number,
#                     "total_pages": paginator.num_pages,
#                     "total_items": paginator.count,
#                     "page_size": page_size,
#                     "has_next": page_obj.has_next(),
#                     "has_previous": page_obj.has_previous()
#                 },
#                 "stats": stats,
#                 "filters": filters
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch transaction logs: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch transaction logs", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _calculate_statistics(self, queryset):
#         """Calculate transaction statistics with access type breakdown"""
#         total = queryset.count()
#         success = queryset.filter(status='success').count()
#         pending = queryset.filter(status='pending').count()
#         failed = queryset.filter(status='failed').count()
        
#         total_amount = queryset.aggregate(
#             total_amount=Sum('amount')
#         )['total_amount'] or 0
        
#         # Access type breakdown
#         by_access_type = queryset.values('access_type').annotate(
#             count=Count('id'),
#             total_amount=Sum('amount'),
#             success_count=Count('id', filter=Q(status='success')),
#             pending_count=Count('id', filter=Q(status='pending')),
#             failed_count=Count('id', filter=Q(status='failed'))
#         ).order_by('access_type')
        
#         access_type_stats = {}
#         for stat in by_access_type:
#             access_type_stats[stat['access_type']] = {
#                 'count': stat['count'],
#                 'total_amount': float(stat['total_amount'] or 0),
#                 'success_count': stat['success_count'],
#                 'pending_count': stat['pending_count'],
#                 'failed_count': stat['failed_count']
#             }
        
#         return {
#             "total": total,
#             "success": success,
#             "pending": pending,
#             "failed": failed,
#             "totalAmount": float(total_amount),
#             "byAccessType": access_type_stats
#         }

# class TransactionLogStatsView(APIView):
#     """
#     API endpoint for transaction statistics with PPPoE/Hotspot breakdown
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get comprehensive transaction statistics
#         """
#         try:
#             # Overall statistics
#             total_stats = TransactionLog.objects.aggregate(
#                 total=Count('id'),
#                 success=Count('id', filter=Q(status='success')),
#                 pending=Count('id', filter=Q(status='pending')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 total_amount=Sum('amount')
#             )
            
#             # Access type statistics
#             access_type_stats = TransactionLog.objects.values('access_type').annotate(
#                 count=Count('id'),
#                 success=Count('id', filter=Q(status='success')),
#                 pending=Count('id', filter=Q(status='pending')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 total_amount=Sum('amount'),
#                 avg_amount=Avg('amount')
#             ).order_by('access_type')
            
#             # Daily statistics for last 7 days with access type breakdown
#             daily_stats = []
#             for i in range(6, -1, -1):
#                 date = timezone.now() - timedelta(days=i)
#                 start_of_day = timezone.make_aware(datetime.combine(date, datetime.min.time()))
#                 end_of_day = timezone.make_aware(datetime.combine(date, datetime.max.time()))
                
#                 day_stats = TransactionLog.objects.filter(
#                     created_at__range=[start_of_day, end_of_day]
#                 ).aggregate(
#                     total=Count('id'),
#                     success=Count('id', filter=Q(status='success')),
#                     pending=Count('id', filter=Q(status='pending')),
#                     failed=Count('id', filter=Q(status='failed')),
#                     total_amount=Sum('amount')
#                 )
                
#                 # Access type breakdown for the day
#                 day_access_stats = TransactionLog.objects.filter(
#                     created_at__range=[start_of_day, end_of_day]
#                 ).values('access_type').annotate(
#                     count=Count('id'),
#                     total_amount=Sum('amount')
#                 )
                
#                 daily_stats.append({
#                     "date": date.date().isoformat(),
#                     "stats": day_stats,
#                     "access_types": list(day_access_stats)
#                 })
            
#             # Payment method distribution with access type
#             method_stats = TransactionLog.objects.values('payment_method', 'access_type').annotate(
#                 count=Count('id'),
#                 total_amount=Sum('amount')
#             ).order_by('-count')
            
#             # Plan distribution
#             plan_stats = TransactionLog.objects.filter(
#                 internet_plan__isnull=False
#             ).values(
#                 'internet_plan__name', 'access_type'
#             ).annotate(
#                 count=Count('id'),
#                 total_amount=Sum('amount')
#             ).order_by('-count')[:10]  # Top 10 plans
            
#             return Response({
#                 "overall": total_stats,
#                 "access_types": list(access_type_stats),
#                 "daily": daily_stats,
#                 "by_method": list(method_stats),
#                 "by_plan": list(plan_stats)
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch transaction statistics: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch transaction statistics", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class TransactionLogDetailView(APIView):
#     """
#     API endpoint for individual transaction log details
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, transaction_id):
#         """
#         Get detailed information for a specific transaction
#         """
#         try:
#             transaction_log = TransactionLog.objects.select_related(
#                 'client', 'client__user', 'user', 'payment_transaction',
#                 'subscription', 'internet_plan'
#             ).get(transaction_id=transaction_id)
            
#             serializer = TransactionLogSerializer(transaction_log)
            
#             # Get transaction history
#             history = TransactionLogHistory.objects.filter(
#                 transaction_log=transaction_log
#             ).order_by('-timestamp')
#             history_serializer = TransactionLogHistorySerializer(history, many=True)
            
#             return Response({
#                 "transaction": serializer.data,
#                 "history": history_serializer.data
#             })
            
#         except TransactionLog.DoesNotExist:
#             return Response(
#                 {"error": "Transaction not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch transaction details: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch transaction details", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class AccessTypeComparisonView(APIView):
#     """
#     API endpoint for PPPoE vs Hotspot transaction comparison
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get comparative statistics between PPPoE and Hotspot transactions
#         """
#         try:
#             # Time period for comparison (last 30 days)
#             start_date = timezone.now() - timedelta(days=30)
            
#             # Hotspot statistics
#             hotspot_stats = TransactionLog.objects.filter(
#                 access_type='hotspot',
#                 created_at__gte=start_date
#             ).aggregate(
#                 total=Count('id'),
#                 success=Count('id', filter=Q(status='success')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 total_amount=Sum('amount'),
#                 avg_amount=Avg('amount'),
#                 success_rate=Count('id', filter=Q(status='success')) * 100.0 / Count('id')
#             )
            
#             # PPPoE statistics
#             pppoe_stats = TransactionLog.objects.filter(
#                 access_type='pppoe',
#                 created_at__gte=start_date
#             ).aggregate(
#                 total=Count('id'),
#                 success=Count('id', filter=Q(status='success')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 total_amount=Sum('amount'),
#                 avg_amount=Avg('amount'),
#                 success_rate=Count('id', filter=Q(status='success')) * 100.0 / Count('id')
#             )
            
#             # Both statistics
#             both_stats = TransactionLog.objects.filter(
#                 access_type='both',
#                 created_at__gte=start_date
#             ).aggregate(
#                 total=Count('id'),
#                 success=Count('id', filter=Q(status='success')),
#                 failed=Count('id', filter=Q(status='failed')),
#                 total_amount=Sum('amount'),
#                 avg_amount=Avg('amount'),
#                 success_rate=Count('id', filter=Q(status='success')) * 100.0 / Count('id')
#             )
            
#             # Comparison metrics
#             total_hotspot = hotspot_stats['total'] or 0
#             total_pppoe = pppoe_stats['total'] or 0
#             total_both = both_stats['total'] or 0
#             total_all = total_hotspot + total_pppoe + total_both
            
#             comparison = {
#                 'hotspot_percentage': (total_hotspot / total_all * 100) if total_all > 0 else 0,
#                 'pppoe_percentage': (total_pppoe / total_all * 100) if total_all > 0 else 0,
#                 'both_percentage': (total_both / total_all * 100) if total_all > 0 else 0,
#                 'total_transactions': total_all,
#                 'hotspot_avg_amount': float(hotspot_stats['avg_amount'] or 0),
#                 'pppoe_avg_amount': float(pppoe_stats['avg_amount'] or 0),
#                 'both_avg_amount': float(both_stats['avg_amount'] or 0),
#             }
            
#             return Response({
#                 "hotspot": hotspot_stats,
#                 "pppoe": pppoe_stats,
#                 "both": both_stats,
#                 "comparison": comparison
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch access type comparison: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch access type comparison", "details": str(e)},
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

from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory
from payments.serializers.transaction_log_serializer import (
    TransactionLogSerializer,
    TransactionLogStatsSerializer,
    TransactionLogFilterSerializer,
    TransactionLogHistorySerializer,
    AccessTypeComparisonSerializer
)

logger = logging.getLogger(__name__)

class TransactionLogView(APIView):
    """
    API endpoint for transaction log management with PPPoE/Hotspot support
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get transaction logs with filtering and pagination
        """
        try:
            # Validate filter parameters
            filter_serializer = TransactionLogFilterSerializer(data=request.query_params)
            if not filter_serializer.is_valid():
                return Response(
                    {"error": "Invalid filter parameters", "details": filter_serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            filters = filter_serializer.validated_data
            
            # Build base query
            queryset = TransactionLog.objects.select_related(
                'client', 'client__user', 'user', 'payment_transaction',
                'subscription', 'internet_plan'
            ).all()
            
            # Apply date filter with timezone awareness
            start_date = filters.get('start_date')
            end_date = filters.get('end_date')
            
            if start_date and end_date:
                start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                queryset = queryset.filter(created_at__range=[start_dt, end_dt])
            elif start_date:
                start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                queryset = queryset.filter(created_at__gte=start_dt)
            elif end_date:
                end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
                queryset = queryset.filter(created_at__lte=end_dt)
            else:
                # Default: last 7 days
                default_start = timezone.now() - timedelta(days=7)
                queryset = queryset.filter(created_at__gte=default_start)
            
            # Apply status filter
            status_filter = filters.get('status')
            if status_filter and status_filter != 'all':
                queryset = queryset.filter(status=status_filter)
            
            # Apply payment method filter
            payment_method = filters.get('payment_method')
            if payment_method:
                queryset = queryset.filter(payment_method=payment_method)
            
            # Apply access type filter (PPPoE/Hotspot)
            access_type = filters.get('access_type')
            if access_type and access_type != 'all':
                queryset = queryset.filter(access_type=access_type)
            
            # Apply plan filter
            plan_id = filters.get('plan_id')
            if plan_id:
                queryset = queryset.filter(internet_plan_id=plan_id)
            
            # Apply search filter
            search_term = filters.get('search')
            if search_term:
                queryset = queryset.filter(
                    Q(transaction_id__icontains=search_term) |
                    Q(phone_number__icontains=search_term) |
                    Q(client__user__username__icontains=search_term) |
                    Q(client__user__first_name__icontains=search_term) |
                    Q(client__user__last_name__icontains=search_term) |
                    Q(reference_number__icontains=search_term) |
                    Q(internet_plan__name__icontains=search_term) |
                    Q(access_type__icontains=search_term) |
                    Q(payment_method__icontains=search_term)
                )
            
            # Apply sorting
            sort_by = filters.get('sort_by', 'date_desc')
            if sort_by == 'date_desc':
                queryset = queryset.order_by('-created_at')
            elif sort_by == 'date_asc':
                queryset = queryset.order_by('created_at')
            elif sort_by == 'amount_desc':
                queryset = queryset.order_by('-amount')
            elif sort_by == 'amount_asc':
                queryset = queryset.order_by('amount')
            elif sort_by == 'access_type':
                queryset = queryset.order_by('access_type')
            elif sort_by == 'payment_method':
                queryset = queryset.order_by('payment_method')
            
            # Pagination
            page = filters.get('page', 1)
            page_size = min(filters.get('page_size', 20), 100)
            
            paginator = Paginator(queryset, page_size)
            
            try:
                page_obj = paginator.page(page)
            except EmptyPage:
                page_obj = paginator.page(paginator.num_pages)
            
            # Serialize data
            serializer = TransactionLogSerializer(page_obj, many=True)
            
            # Calculate statistics
            stats = self._calculate_statistics(queryset)
            
            return Response({
                "transactions": serializer.data,
                "pagination": {
                    "current_page": page_obj.number,
                    "total_pages": paginator.num_pages,
                    "total_items": paginator.count,
                    "page_size": page_size,
                    "has_next": page_obj.has_next(),
                    "has_previous": page_obj.has_previous()
                },
                "stats": stats,
                "filters": filters
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch transaction logs: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch transaction logs", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_statistics(self, queryset):
        """Calculate transaction statistics with access type breakdown"""
        total = queryset.count()
        success = queryset.filter(status='success').count()
        pending = queryset.filter(status='pending').count()
        failed = queryset.filter(status='failed').count()
        
        total_amount = queryset.aggregate(
            total_amount=Sum('amount')
        )['total_amount'] or 0
        
        # Access type breakdown
        by_access_type = queryset.values('access_type').annotate(
            count=Count('id'),
            total_amount=Sum('amount'),
            success_count=Count('id', filter=Q(status='success')),
            pending_count=Count('id', filter=Q(status='pending')),
            failed_count=Count('id', filter=Q(status='failed'))
        ).order_by('access_type')
        
        # Payment method breakdown
        by_payment_method = queryset.values('payment_method').annotate(
            count=Count('id'),
            total_amount=Sum('amount'),
            success_count=Count('id', filter=Q(status='success')),
            pending_count=Count('id', filter=Q(status='pending')),
            failed_count=Count('id', filter=Q(status='failed'))
        ).order_by('payment_method')
        
        access_type_stats = {}
        for stat in by_access_type:
            access_type_stats[stat['access_type']] = {
                'count': stat['count'],
                'total_amount': float(stat['total_amount'] or 0),
                'success_count': stat['success_count'],
                'pending_count': stat['pending_count'],
                'failed_count': stat['failed_count']
            }
        
        payment_method_stats = {}
        for stat in by_payment_method:
            payment_method_stats[stat['payment_method']] = {
                'count': stat['count'],
                'total_amount': float(stat['total_amount'] or 0),
                'success_count': stat['success_count'],
                'pending_count': stat['pending_count'],
                'failed_count': stat['failed_count']
            }
        
        return {
            "total": total,
            "success": success,
            "pending": pending,
            "failed": failed,
            "totalAmount": float(total_amount),
            "byAccessType": access_type_stats,
            "byPaymentMethod": payment_method_stats
        }

class TransactionLogStatsView(APIView):
    """
    API endpoint for transaction statistics with PPPoE/Hotspot breakdown
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get comprehensive transaction statistics
        """
        try:
            # Overall statistics
            total_stats = TransactionLog.objects.aggregate(
                total=Count('id'),
                success=Count('id', filter=Q(status='success')),
                pending=Count('id', filter=Q(status='pending')),
                failed=Count('id', filter=Q(status='failed')),
                total_amount=Sum('amount')
            )
            
            # Access type statistics
            access_type_stats = TransactionLog.objects.values('access_type').annotate(
                count=Count('id'),
                success=Count('id', filter=Q(status='success')),
                pending=Count('id', filter=Q(status='pending')),
                failed=Count('id', filter=Q(status='failed')),
                total_amount=Sum('amount'),
                avg_amount=Avg('amount')
            ).order_by('access_type')
            
            # Payment method statistics
            payment_method_stats = TransactionLog.objects.values('payment_method').annotate(
                count=Count('id'),
                success=Count('id', filter=Q(status='success')),
                pending=Count('id', filter=Q(status='pending')),
                failed=Count('id', filter=Q(status='failed')),
                total_amount=Sum('amount'),
                avg_amount=Avg('amount')
            ).order_by('payment_method')
            
            # Daily statistics for last 7 days with access type breakdown
            daily_stats = []
            for i in range(6, -1, -1):
                date = timezone.now() - timedelta(days=i)
                start_of_day = timezone.make_aware(datetime.combine(date, datetime.min.time()))
                end_of_day = timezone.make_aware(datetime.combine(date, datetime.max.time()))
                
                day_stats = TransactionLog.objects.filter(
                    created_at__range=[start_of_day, end_of_day]
                ).aggregate(
                    total=Count('id'),
                    success=Count('id', filter=Q(status='success')),
                    pending=Count('id', filter=Q(status='pending')),
                    failed=Count('id', filter=Q(status='failed')),
                    total_amount=Sum('amount')
                )
                
                # Access type breakdown for the day
                day_access_stats = TransactionLog.objects.filter(
                    created_at__range=[start_of_day, end_of_day]
                ).values('access_type').annotate(
                    count=Count('id'),
                    total_amount=Sum('amount')
                )
                
                # Payment method breakdown for the day
                day_payment_stats = TransactionLog.objects.filter(
                    created_at__range=[start_of_day, end_of_day]
                ).values('payment_method').annotate(
                    count=Count('id'),
                    total_amount=Sum('amount')
                )
                
                daily_stats.append({
                    "date": date.date().isoformat(),
                    "stats": day_stats,
                    "access_types": list(day_access_stats),
                    "payment_methods": list(day_payment_stats)
                })
            
            # Payment method distribution with access type
            method_stats = TransactionLog.objects.values('payment_method', 'access_type').annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            ).order_by('-count')
            
            # Plan distribution
            plan_stats = TransactionLog.objects.filter(
                internet_plan__isnull=False
            ).values(
                'internet_plan__name', 'access_type'
            ).annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            ).order_by('-count')[:10]  # Top 10 plans
            
            return Response({
                "overall": total_stats,
                "access_types": list(access_type_stats),
                "payment_methods": list(payment_method_stats),
                "daily": daily_stats,
                "by_method": list(method_stats),
                "by_plan": list(plan_stats)
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch transaction statistics: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch transaction statistics", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TransactionLogDetailView(APIView):
    """
    API endpoint for individual transaction log details
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, transaction_id):
        """
        Get detailed information for a specific transaction
        """
        try:
            transaction_log = TransactionLog.objects.select_related(
                'client', 'client__user', 'user', 'payment_transaction',
                'subscription', 'internet_plan'
            ).get(transaction_id=transaction_id)
            
            serializer = TransactionLogSerializer(transaction_log)
            
            # Get transaction history
            history = TransactionLogHistory.objects.filter(
                transaction_log=transaction_log
            ).order_by('-timestamp')
            history_serializer = TransactionLogHistorySerializer(history, many=True)
            
            return Response({
                "transaction": serializer.data,
                "history": history_serializer.data
            })
            
        except TransactionLog.DoesNotExist:
            return Response(
                {"error": "Transaction not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to fetch transaction details: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch transaction details", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AccessTypeComparisonView(APIView):
    """
    API endpoint for PPPoE vs Hotspot transaction comparison
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get comparative statistics between PPPoE and Hotspot transactions
        """
        try:
            # Time period for comparison (last 30 days)
            start_date = timezone.now() - timedelta(days=30)
            
            # Hotspot statistics
            hotspot_stats = TransactionLog.objects.filter(
                access_type='hotspot',
                created_at__gte=start_date
            ).aggregate(
                total=Count('id'),
                success=Count('id', filter=Q(status='success')),
                failed=Count('id', filter=Q(status='failed')),
                total_amount=Sum('amount'),
                avg_amount=Avg('amount'),
                success_rate=Count('id', filter=Q(status='success')) * 100.0 / Count('id')
            )
            
            # PPPoE statistics
            pppoe_stats = TransactionLog.objects.filter(
                access_type='pppoe',
                created_at__gte=start_date
            ).aggregate(
                total=Count('id'),
                success=Count('id', filter=Q(status='success')),
                failed=Count('id', filter=Q(status='failed')),
                total_amount=Sum('amount'),
                avg_amount=Avg('amount'),
                success_rate=Count('id', filter=Q(status='success')) * 100.0 / Count('id')
            )
            
            # Both statistics
            both_stats = TransactionLog.objects.filter(
                access_type='both',
                created_at__gte=start_date
            ).aggregate(
                total=Count('id'),
                success=Count('id', filter=Q(status='success')),
                failed=Count('id', filter=Q(status='failed')),
                total_amount=Sum('amount'),
                avg_amount=Avg('amount'),
                success_rate=Count('id', filter=Q(status='success')) * 100.0 / Count('id')
            )
            
            # Comparison metrics
            total_hotspot = hotspot_stats['total'] or 0
            total_pppoe = pppoe_stats['total'] or 0
            total_both = both_stats['total'] or 0
            total_all = total_hotspot + total_pppoe + total_both
            
            comparison = {
                'hotspot_percentage': (total_hotspot / total_all * 100) if total_all > 0 else 0,
                'pppoe_percentage': (total_pppoe / total_all * 100) if total_all > 0 else 0,
                'both_percentage': (total_both / total_all * 100) if total_all > 0 else 0,
                'total_transactions': total_all,
                'hotspot_avg_amount': float(hotspot_stats['avg_amount'] or 0),
                'pppoe_avg_amount': float(pppoe_stats['avg_amount'] or 0),
                'both_avg_amount': float(both_stats['avg_amount'] or 0),
            }
            
            return Response({
                "hotspot": hotspot_stats,
                "pppoe": pppoe_stats,
                "both": both_stats,
                "comparison": comparison
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch access type comparison: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch access type comparison", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )