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
from account.models.admin_model import Client
from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory
from payments.serializers.transaction_log_serializer import (
    TransactionLogSerializer,
    TransactionLogStatsSerializer,
    TransactionLogFilterSerializer,
    TransactionLogHistorySerializer
)

logger = logging.getLogger(__name__)

class TransactionLogView(APIView):
    """
    API endpoint for transaction log management
    Supports filtering, sorting, and pagination
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
                'client', 'client__user', 'user'
            ).all()
            
            # Apply date filter
            start_date = filters.get('start_date')
            end_date = filters.get('end_date')
            
            if start_date and end_date:
                # Convert to datetime with time components
                start_dt = datetime.combine(start_date, datetime.min.time())
                end_dt = datetime.combine(end_date, datetime.max.time())
                queryset = queryset.filter(created_at__range=[start_dt, end_dt])
            elif start_date:
                start_dt = datetime.combine(start_date, datetime.min.time())
                queryset = queryset.filter(created_at__gte=start_dt)
            elif end_date:
                end_dt = datetime.combine(end_date, datetime.max.time())
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
            
            # Apply search filter
            search_term = filters.get('search')
            if search_term:
                queryset = queryset.filter(
                    Q(transaction_id__icontains=search_term) |
                    Q(phone_number__icontains=search_term) |
                    Q(client__user__username__icontains=search_term) |
                    Q(client__user__first_name__icontains=search_term) |
                    Q(client__user__last_name__icontains=search_term) |
                    Q(reference_number__icontains=search_term)
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
            
            # Pagination
            page = filters.get('page', 1)
            page_size = min(filters.get('page_size', 20), 100)  # Cap at 100 per page
            
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
        """Calculate transaction statistics"""
        total = queryset.count()
        success = queryset.filter(status='success').count()
        pending = queryset.filter(status='pending').count()
        failed = queryset.filter(status='failed').count()
        
        total_amount = queryset.aggregate(
            total_amount=Sum('amount')
        )['total_amount'] or 0
        
        return {
            "total": total,
            "success": success,
            "pending": pending,
            "failed": failed,
            "total_amount": total_amount
        }

class TransactionLogStatsView(APIView):
    """
    API endpoint for transaction statistics
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
            
            # Daily statistics for last 7 days
            daily_stats = []
            for i in range(6, -1, -1):
                date = timezone.now() - timedelta(days=i)
                start_of_day = datetime.combine(date, datetime.min.time())
                end_of_day = datetime.combine(date, datetime.max.time())
                
                day_stats = TransactionLog.objects.filter(
                    created_at__range=[start_of_day, end_of_day]
                ).aggregate(
                    total=Count('id'),
                    success=Count('id', filter=Q(status='success')),
                    pending=Count('id', filter=Q(status='pending')),
                    failed=Count('id', filter=Q(status='failed')),
                    total_amount=Sum('amount')
                )
                
                daily_stats.append({
                    "date": date.date().isoformat(),
                    "stats": day_stats
                })
            
            # Payment method distribution
            method_stats = TransactionLog.objects.values('payment_method').annotate(
                count=Count('id'),
                total_amount=Sum('amount')
            ).order_by('-count')
            
            return Response({
                "overall": total_stats,
                "daily": daily_stats,
                "by_method": list(method_stats)
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
                'client', 'client__user', 'user', 'transaction'
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

class TransactionLogExportView(APIView):
    """
    API endpoint for exporting transaction logs
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Export transaction logs in various formats
        """
        try:
            # Apply same filters as main view
            filter_serializer = TransactionLogFilterSerializer(data=request.query_params)
            if not filter_serializer.is_valid():
                return Response(
                    {"error": "Invalid filter parameters", "details": filter_serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            filters = filter_serializer.validated_data
            
            # Build query (same as TransactionLogView)
            queryset = self._build_filtered_queryset(filters)
            
            # Get all results (no pagination for export)
            transactions = list(queryset)
            
            if not transactions:
                return Response(
                    {"error": "No transactions found for export"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Prepare export data
            export_data = []
            for transaction in transactions:
                export_data.append({
                    "transaction_id": transaction.transaction_id,
                    "user_name": transaction.user_name,
                    "phone": transaction.formatted_phone,
                    "amount": float(transaction.amount),
                    "status": transaction.get_status_display(),
                    "payment_method": transaction.get_payment_method_display(),
                    "reference_number": transaction.reference_number,
                    "description": transaction.description,
                    "date_time": transaction.created_at.strftime("%Y-%m-%d %H:%M:%S")
                })
            
            return Response({
                "format": "json",
                "count": len(export_data),
                "data": export_data,
                "filters": filters,
                "exported_at": timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to export transaction logs: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to export transaction logs", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _build_filtered_queryset(self, filters):
        """Build filtered queryset (same logic as TransactionLogView)"""
        queryset = TransactionLog.objects.select_related(
            'client', 'client__user', 'user'
        ).all()
        
        # Date filter
        start_date = filters.get('start_date')
        end_date = filters.get('end_date')
        
        if start_date and end_date:
            start_dt = datetime.combine(start_date, datetime.min.time())
            end_dt = datetime.combine(end_date, datetime.max.time())
            queryset = queryset.filter(created_at__range=[start_dt, end_dt])
        elif start_date:
            start_dt = datetime.combine(start_date, datetime.min.time())
            queryset = queryset.filter(created_at__gte=start_dt)
        elif end_date:
            end_dt = datetime.combine(end_date, datetime.max.time())
            queryset = queryset.filter(created_at__lte=end_dt)
        
        # Status filter
        status_filter = filters.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Search filter
        search_term = filters.get('search')
        if search_term:
            queryset = queryset.filter(
                Q(transaction_id__icontains=search_term) |
                Q(phone_number__icontains=search_term) |
                Q(client__user__username__icontains=search_term) |
                Q(client__user__first_name__icontains=search_term) |
                Q(client__user__last_name__icontains=search_term) |
                Q(reference_number__icontains=search_term)
            )
        
        return queryset.order_by('-created_at')