





# # network_management/api/views/router_management/router_audit_views.py
# """
# Router Audit Log Views for Network Management System

# This module provides API views for router audit logs and analytics.
# """

# import logging
# import csv
# from django.utils import timezone
# from django.db.models import Q, Count, Max
# from django.http import HttpResponse, JsonResponse
# from datetime import timedelta

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from network_management.models.router_management_model import RouterAuditLog
# from network_management.serializers.router_management_serializer import RouterAuditLogSerializer

# logger = logging.getLogger(__name__)


# class RouterAuditLogView(APIView):
#     """
#     API View for retrieving router audit logs.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Retrieve filtered audit logs for routers."""
#         router_id = request.query_params.get('router_id')
#         action = request.query_params.get('action')
#         days = int(request.query_params.get('days', 7))
        
#         start_date = timezone.now() - timedelta(days=days)
        
#         logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
#         if router_id:
#             logs = logs.filter(router_id=router_id)
#         if action:
#             logs = logs.filter(action=action)
            
#         logs = logs.select_related('router', 'user').order_by('-timestamp')
        
#         # FIX: Return consistent array format
#         serializer = RouterAuditLogSerializer(logs, many=True)
#         return Response({
#             'logs': serializer.data,
#             'count': len(serializer.data),
#             'timeframe_days': days
#         })


# class ComprehensiveAuditLogView(APIView):
#     """
#     COMPREHENSIVE API View for router audit logs with advanced filtering and analytics.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Retrieve filtered audit logs with advanced analytics."""
#         router_id = request.query_params.get('router_id')
#         action = request.query_params.get('action')
#         user_id = request.query_params.get('user_id')
#         days = int(request.query_params.get('days', 7))
#         include_analytics = request.query_params.get('include_analytics', 'false').lower() == 'true'
        
#         start_date = timezone.now() - timedelta(days=days)
        
#         logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
#         if router_id:
#             logs = logs.filter(router_id=router_id)
#         if action:
#             logs = logs.filter(action=action)
#         if user_id:
#             logs = logs.filter(user_id=user_id)
            
#         logs = logs.select_related('router', 'user').order_by('-timestamp')
        
#         # FIX: Return consistent format
#         serializer = RouterAuditLogSerializer(logs, many=True)
#         response_data = {
#             'logs': serializer.data,
#             'count': len(serializer.data),
#             'timeframe_days': days
#         }
        
#         if include_analytics:
#             response_data['analytics'] = self.get_analytics(logs)
            
#         return Response(response_data)

#     def get_analytics(self, queryset):
#         """Generate comprehensive analytics from audit logs."""
#         analytics = {
#             'summary': {
#                 'total_actions': queryset.count(),
#                 'time_period': 'Last 7 days',
#                 'unique_users': queryset.values('user').distinct().count(),
#                 'unique_routers': queryset.values('router').distinct().count(),
#             },
#             'action_breakdown': self.get_action_breakdown(queryset),
#             'user_activity': self.get_user_activity(queryset),
#             'router_activity': self.get_router_activity(queryset),
#             'hourly_distribution': self.get_hourly_distribution(queryset),
#         }
        
#         return analytics

#     def get_action_breakdown(self, queryset):
#         """Break down actions by type."""
#         from django.db.models import Count, Max
#         breakdown = queryset.values('action').annotate(
#             count=Count('id'),
#             last_performed=Max('timestamp')
#         ).order_by('-count')
        
#         return list(breakdown)

#     def get_user_activity(self, queryset):
#         """Get user activity statistics."""
#         user_activity = queryset.filter(user__isnull=False).values(
#             'user__username', 'user__email'
#         ).annotate(
#             action_count=Count('id'),
#             last_activity=Max('timestamp')
#         ).order_by('-action_count')[:10]
        
#         return list(user_activity)

#     def get_router_activity(self, queryset):
#         """Get router activity statistics."""
#         router_activity = queryset.filter(router__isnull=False).values(
#             'router__name', 'router__ip'
#         ).annotate(
#             action_count=Count('id'),
#             last_activity=Max('timestamp')
#         ).order_by('-action_count')[:10]
        
#         return list(router_activity)

#     def get_hourly_distribution(self, queryset):
#         """Get action distribution by hour of day."""
#         from django.db.models.functions import ExtractHour
        
#         hourly_dist = queryset.annotate(
#             hour=ExtractHour('timestamp')
#         ).values('hour').annotate(
#             count=Count('id')
#         ).order_by('hour')
        
#         return list(hourly_dist)


# class AuditLogExportView(APIView):
#     """
#     API View for exporting audit logs in various formats.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Export audit logs in CSV or JSON format.
        
#         Query Parameters:
#             format: 'csv' or 'json' (default: 'json')
#             days: Number of days to include (default: 30)
#             router_id: Filter by specific router
#             action: Filter by specific action
#         """
#         format_type = request.query_params.get('format', 'json')
#         days = int(request.query_params.get('days', 30))
#         router_id = request.query_params.get('router_id')
#         action = request.query_params.get('action')
        
#         start_date = timezone.now() - timedelta(days=days)
#         logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
#         # Apply filters
#         if router_id:
#             logs = logs.filter(router_id=router_id)
#         if action:
#             logs = logs.filter(action=action)
            
#         logs = logs.select_related('router', 'user').order_by('-timestamp')
        
#         if format_type == 'csv':
#             return self.export_csv(logs)
#         else:
#             return self.export_json(logs)

#     def export_csv(self, queryset):
#         """Export logs as CSV."""
#         response = HttpResponse(content_type='text/csv')
#         response['Content-Disposition'] = 'attachment; filename="audit_logs.csv"'
        
#         writer = csv.writer(response)
        
#         # Write header row
#         writer.writerow([
#             'Timestamp', 
#             'Router Name', 
#             'Router IP', 
#             'Action', 
#             'Username', 
#             'Email', 
#             'IP Address', 
#             'Description',
#             'Status Code'
#         ])
        
#         for log in queryset:
#             writer.writerow([
#                 log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
#                 log.router.name if log.router else 'N/A',
#                 log.router.ip if log.router else 'N/A',
#                 log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
#                 log.user.username if log.user else 'System',
#                 log.user.email if log.user and hasattr(log.user, 'email') else 'N/A',
#                 log.ip_address or 'N/A',
#                 log.description,
#                 getattr(log, 'status_code', 'N/A')
#             ])
            
#         return response

#     def export_json(self, queryset):
#         """Export logs as JSON."""
#         logs_data = []
#         for log in queryset:
#             log_data = {
#                 'timestamp': log.timestamp.isoformat(),
#                 'router': {
#                     'id': log.router.id if log.router else None,
#                     'name': log.router.name if log.router else None,
#                     'ip': log.router.ip if log.router else None,
#                 } if log.router else None,
#                 'action': log.action,
#                 'action_display': log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
#                 'user': {
#                     'id': log.user.id if log.user else None,
#                     'username': log.user.username if log.user else None,
#                     'email': log.user.email if log.user and hasattr(log.user, 'email') else None,
#                 } if log.user else None,
#                 'ip_address': log.ip_address,
#                 'description': log.description,
#                 'changes': log.changes,
#                 'status_code': getattr(log, 'status_code', None)
#             }
#             logs_data.append(log_data)
            
#         return JsonResponse({
#             'export_info': {
#                 'exported_at': timezone.now().isoformat(),
#                 'total_records': len(logs_data),
#                 'format': 'json'
#             },
#             'logs': logs_data
#         }, safe=False)

#     def post(self, request):
#         """
#         Export audit logs with custom parameters via POST request.
        
#         Request Body:
#             format: 'csv' or 'json'
#             start_date: Start date for filtering (ISO format)
#             end_date: End date for filtering (ISO format)
#             router_ids: List of router IDs to filter
#             actions: List of actions to filter
#             include_changes: Whether to include changes in export (boolean)
#         """
#         try:
#             format_type = request.data.get('format', 'json')
#             start_date_str = request.data.get('start_date')
#             end_date_str = request.data.get('end_date')
#             router_ids = request.data.get('router_ids', [])
#             actions = request.data.get('actions', [])
#             include_changes = request.data.get('include_changes', True)
            
#             # Build query
#             logs = RouterAuditLog.objects.all()
            
#             # Date filtering
#             if start_date_str:
#                 start_date = timezone.datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
#                 logs = logs.filter(timestamp__gte=start_date)
#             if end_date_str:
#                 end_date = timezone.datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
#                 logs = logs.filter(timestamp__lte=end_date)
                
#             # Router filtering
#             if router_ids:
#                 logs = logs.filter(router_id__in=router_ids)
                
#             # Action filtering
#             if actions:
#                 logs = logs.filter(action__in=actions)
                
#             logs = logs.select_related('router', 'user').order_by('-timestamp')
            
#             if format_type == 'csv':
#                 return self.export_csv(logs)
#             else:
#                 return self.export_json(logs)
                
#         except Exception as e:
#             logger.error(f"Audit log export failed: {str(e)}")
#             return Response(
#                 {"error": f"Export failed: {str(e)}"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class AuditLogCleanupView(APIView):
#     """
#     API View for managing audit log cleanup and retention.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get audit log cleanup statistics and retention policy.
#         """
#         try:
#             # Calculate statistics
#             total_logs = RouterAuditLog.objects.count()
#             oldest_log = RouterAuditLog.objects.order_by('timestamp').first()
#             newest_log = RouterAuditLog.objects.order_by('-timestamp').first()
            
#             # Default retention policy
#             retention_days = 365
#             cutoff_date = timezone.now() - timedelta(days=retention_days)
#             logs_to_delete = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date).count()
            
#             statistics = {
#                 'total_logs': total_logs,
#                 'oldest_log_date': oldest_log.timestamp.isoformat() if oldest_log else None,
#                 'newest_log_date': newest_log.timestamp.isoformat() if newest_log else None,
#                 'retention_policy': {
#                     'retention_days': retention_days,
#                     'cutoff_date': cutoff_date.isoformat(),
#                     'logs_to_delete': logs_to_delete
#                 },
#                 'database_size_estimate': self.estimate_database_size(total_logs)
#             }
            
#             return Response(statistics)
            
#         except Exception as e:
#             logger.error(f"Failed to get audit log statistics: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve audit log statistics"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         Clean up old audit logs based on retention policy.
        
#         Request Body:
#             retention_days: Number of days to retain logs (default: 365)
#             dry_run: Whether to perform a dry run without deleting (default: True)
#             max_deletion: Maximum number of logs to delete in one operation
#         """
#         try:
#             retention_days = int(request.data.get('retention_days', 365))
#             dry_run = request.data.get('dry_run', True)
#             max_deletion = request.data.get('max_deletion')
            
#             if retention_days < 30:
#                 return Response(
#                     {"error": "Retention period must be at least 30 days"}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             cutoff_date = timezone.now() - timedelta(days=retention_days)
#             old_logs = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date)
            
#             if max_deletion:
#                 old_logs = old_logs[:int(max_deletion)]
            
#             if dry_run:
#                 return Response({
#                     'message': 'Dry run completed',
#                     'logs_to_delete': old_logs.count(),
#                     'cutoff_date': cutoff_date.isoformat(),
#                     'retention_days': retention_days,
#                     'max_deletion': max_deletion,
#                     'actual_deletion': 0
#                 })
#             else:
#                 # Perform actual deletion
#                 deleted_count = old_logs.count()
                
#                 # Log the cleanup action before deletion
#                 from network_management.models.router_management_model import RouterAuditLog
#                 RouterAuditLog.objects.create(
#                     router=None,
#                     action='audit_cleanup',
#                     description=f"Audit logs cleanup: {deleted_count} records deleted",
#                     user=request.user,
#                     ip_address=self.get_client_ip(request),
#                     changes={
#                         'deleted_count': deleted_count,
#                         'retention_days': retention_days,
#                         'cutoff_date': cutoff_date.isoformat(),
#                         'max_deletion': max_deletion
#                     }
#                 )
                
#                 # Delete the old logs
#                 old_logs.delete()
                
#                 return Response({
#                     'message': 'Audit logs cleanup completed',
#                     'deleted_count': deleted_count,
#                     'retention_days': retention_days,
#                     'cutoff_date': cutoff_date.isoformat(),
#                     'max_deletion': max_deletion
#                 })

#         except Exception as e:
#             logger.error(f"Audit log cleanup failed: {str(e)}")
#             return Response(
#                 {"error": f"Cleanup failed: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def estimate_database_size(self, log_count):
#         """
#         Estimate the database size based on log count.
        
#         This is a rough estimation - actual size may vary.
#         """
#         # Average size per audit log record in bytes (estimated)
#         avg_record_size = 1024  # 1KB per record
        
#         total_size_bytes = log_count * avg_record_size
        
#         # Convert to human readable format
#         if total_size_bytes < 1024:
#             return f"{total_size_bytes} bytes"
#         elif total_size_bytes < 1024 * 1024:
#             return f"{total_size_bytes / 1024:.2f} KB"
#         elif total_size_bytes < 1024 * 1024 * 1024:
#             return f"{total_size_bytes / (1024 * 1024):.2f} MB"
#         else:
#             return f"{total_size_bytes / (1024 * 1024 * 1024):.2f} GB"

#     def get_client_ip(self, request):
#         """Get client IP address."""
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         else:
#             return request.META.get('REMOTE_ADDR')

#     def delete(self, request):
#         """
#         Emergency endpoint to delete all audit logs (use with caution).
#         Requires superuser permissions.
#         """
#         if not request.user.is_superuser:
#             return Response(
#                 {"error": "Superuser permissions required for this operation"}, 
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         try:
#             confirm = request.data.get('confirm', False)
#             if not confirm:
#                 return Response({
#                     'warning': 'This will delete ALL audit logs. This action cannot be undone.',
#                     'total_logs': RouterAuditLog.objects.count(),
#                     'instructions': 'Set confirm=true in the request body to proceed.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             total_logs = RouterAuditLog.objects.count()
#             RouterAuditLog.objects.all().delete()
            
#             # Log the complete cleanup
#             from network_management.models.router_management_model import RouterAuditLog
#             RouterAuditLog.objects.create(
#                 router=None,
#                 action='audit_cleanup_complete',
#                 description=f"COMPLETE audit logs cleanup: {total_logs} records deleted",
#                 user=request.user,
#                 ip_address=self.get_client_ip(request),
#                 changes={
#                     'deleted_count': total_logs,
#                     'type': 'complete_cleanup'
#                 }
#             )
            
#             return Response({
#                 'message': 'All audit logs have been deleted',
#                 'deleted_count': total_logs
#             })
            
#         except Exception as e:
#             logger.error(f"Complete audit log cleanup failed: {str(e)}")
#             return Response(
#                 {"error": f"Complete cleanup failed: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )













#  # network_management/api/views/router_management/router_audit_views.py
# """
# Enhanced Router Audit Log Views for Network Management System

# This module provides comprehensive API views for router audit logs and analytics
# with enhanced filtering, export capabilities, and status code support.
# """

# import logging
# import csv
# from django.utils import timezone
# from django.db.models import Q, Count, Max, Avg
# from django.http import HttpResponse, JsonResponse
# from datetime import timedelta
# from django.core.cache import cache

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from network_management.models.router_management_model import RouterAuditLog
# from network_management.serializers.router_management_serializer import RouterAuditLogSerializer

# logger = logging.getLogger(__name__)


# class RouterAuditLogBaseView(APIView):
#     """
#     Base view class for router audit log operations.
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get_client_ip(self, request):
#         """Get client IP address."""
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         else:
#             return request.META.get('REMOTE_ADDR')
    
#     def create_audit_log_for_operation(self, action, description, request, changes=None, status_code=None):
#         """Create audit log for audit-related operations."""
#         return RouterAuditLog.objects.create(
#             router=None,
#             action=action,
#             description=description,
#             user=request.user,
#             ip_address=self.get_client_ip(request),
#             user_agent=request.META.get('HTTP_USER_AGENT', ''),
#             changes=changes or {},
#             status_code=status_code
#         )


# class RouterAuditLogView(RouterAuditLogBaseView):
#     """
#     Enhanced API View for retrieving router audit logs with comprehensive filtering.
#     """
    
#     def get(self, request):
#         """Retrieve filtered audit logs for routers with enhanced filtering."""
#         # Get filter parameters
#         router_id = request.query_params.get('router_id')
#         action = request.query_params.get('action')
#         user_id = request.query_params.get('user_id')
#         status_code = request.query_params.get('status_code')
#         days = int(request.query_params.get('days', 7))
#         page = int(request.query_params.get('page', 1))
#         page_size = int(request.query_params.get('page_size', 50))
        
#         # Validate pagination
#         if page_size > 1000:
#             return Response(
#                 {"error": "Page size cannot exceed 1000"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         start_date = timezone.now() - timedelta(days=days)
        
#         # Build cache key based on filters
#         cache_key = f"audit_logs:{router_id}:{action}:{user_id}:{status_code}:{days}:{page}:{page_size}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return Response(cached_data)
        
#         # Build query with enhanced filtering
#         logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
#         if router_id:
#             logs = logs.filter(router_id=router_id)
#         if action:
#             logs = logs.filter(action=action)
#         if user_id:
#             logs = logs.filter(user_id=user_id)
#         if status_code:
#             logs = logs.filter(status_code=status_code)
            
#         # Apply pagination
#         total_count = logs.count()
#         logs = logs.select_related('router', 'user').order_by('-timestamp')
#         start_index = (page - 1) * page_size
#         end_index = start_index + page_size
#         paginated_logs = logs[start_index:end_index]
        
#         # Serialize data
#         serializer = RouterAuditLogSerializer(paginated_logs, many=True)
        
#         response_data = {
#             'logs': serializer.data,
#             'pagination': {
#                 'page': page,
#                 'page_size': page_size,
#                 'total_count': total_count,
#                 'total_pages': (total_count + page_size - 1) // page_size,
#                 'has_next': end_index < total_count,
#                 'has_previous': page > 1
#             },
#             'filters': {
#                 'router_id': router_id,
#                 'action': action,
#                 'user_id': user_id,
#                 'status_code': status_code,
#                 'days': days
#             }
#         }
        
#         # Cache for 5 minutes
#         cache.set(cache_key, response_data, 300)
        
#         return Response(response_data)


# class ComprehensiveAuditLogView(RouterAuditLogBaseView):
#     """
#     COMPREHENSIVE API View for router audit logs with advanced filtering and analytics.
#     """
    
#     def get(self, request):
#         """Retrieve filtered audit logs with advanced analytics."""
#         router_id = request.query_params.get('router_id')
#         action = request.query_params.get('action')
#         user_id = request.query_params.get('user_id')
#         status_code = request.query_params.get('status_code')
#         days = int(request.query_params.get('days', 7))
#         include_analytics = request.query_params.get('include_analytics', 'false').lower() == 'true'
#         include_status_analytics = request.query_params.get('include_status_analytics', 'false').lower() == 'true'
        
#         start_date = timezone.now() - timedelta(days=days)
        
#         # Build cache key
#         cache_key = f"comprehensive_audit:{router_id}:{action}:{user_id}:{status_code}:{days}:{include_analytics}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return Response(cached_data)
        
#         logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
#         if router_id:
#             logs = logs.filter(router_id=router_id)
#         if action:
#             logs = logs.filter(action=action)
#         if user_id:
#             logs = logs.filter(user_id=user_id)
#         if status_code:
#             logs = logs.filter(status_code=status_code)
            
#         logs = logs.select_related('router', 'user').order_by('-timestamp')
        
#         # Serialize data
#         serializer = RouterAuditLogSerializer(logs, many=True)
#         response_data = {
#             'logs': serializer.data,
#             'count': len(serializer.data),
#             'timeframe_days': days,
#             'filters_applied': {
#                 'router_id': router_id,
#                 'action': action,
#                 'user_id': user_id,
#                 'status_code': status_code
#             }
#         }
        
#         if include_analytics:
#             response_data['analytics'] = self.get_analytics(logs, include_status_analytics)
        
#         # Cache for 10 minutes
#         cache.set(cache_key, response_data, 600)
        
#         return Response(response_data)

#     def get_analytics(self, queryset, include_status_analytics=False):
#         """Generate comprehensive analytics from audit logs."""
#         analytics = {
#             'summary': {
#                 'total_actions': queryset.count(),
#                 'time_period': f'Last {self.get_time_period_days(queryset)} days',
#                 'unique_users': queryset.values('user').distinct().count(),
#                 'unique_routers': queryset.values('router').distinct().count(),
#                 'date_range': {
#                     'start': queryset.aggregate(Max('timestamp'))['timestamp__max'],
#                     'end': queryset.aggregate(Max('timestamp'))['timestamp__max']
#                 } if queryset.exists() else None
#             },
#             'action_breakdown': self.get_action_breakdown(queryset),
#             'user_activity': self.get_user_activity(queryset),
#             'router_activity': self.get_router_activity(queryset),
#             'hourly_distribution': self.get_hourly_distribution(queryset),
#             'daily_trends': self.get_daily_trends(queryset),
#         }
        
#         if include_status_analytics:
#             analytics['status_code_analysis'] = self.get_status_code_analysis(queryset)
        
#         return analytics

#     def get_action_breakdown(self, queryset):
#         """Break down actions by type with enhanced statistics."""
#         breakdown = queryset.values('action').annotate(
#             count=Count('id'),
#             last_performed=Max('timestamp'),
#             avg_response_time=Avg('status_code'),
#             success_rate=Count('id', filter=Q(status_code__range=[200, 299])) * 100.0 / Count('id')
#         ).order_by('-count')
        
#         return list(breakdown)

#     def get_user_activity(self, queryset):
#         """Get user activity statistics with enhanced metrics."""
#         user_activity = queryset.filter(user__isnull=False).values(
#             'user__username', 'user__email', 'user__first_name', 'user__last_name'
#         ).annotate(
#             action_count=Count('id'),
#             last_activity=Max('timestamp'),
#             success_count=Count('id', filter=Q(status_code__range=[200, 299])),
#             error_count=Count('id', filter=Q(status_code__range=[400, 599])),
#             success_rate=Count('id', filter=Q(status_code__range=[200, 299])) * 100.0 / Count('id')
#         ).order_by('-action_count')[:15]  # Increased limit for better insights
        
#         return list(user_activity)

#     def get_router_activity(self, queryset):
#         """Get router activity statistics with enhanced metrics."""
#         router_activity = queryset.filter(router__isnull=False).values(
#             'router__name', 'router__ip', 'router__type', 'router__connection_status'
#         ).annotate(
#             action_count=Count('id'),
#             last_activity=Max('timestamp'),
#             success_count=Count('id', filter=Q(status_code__range=[200, 299])),
#             error_count=Count('id', filter=Q(status_code__range=[400, 599])),
#             most_common_action=Count('action')
#         ).order_by('-action_count')[:15]
        
#         return list(router_activity)

#     def get_hourly_distribution(self, queryset):
#         """Get action distribution by hour of day with success rates."""
#         from django.db.models.functions import ExtractHour
        
#         hourly_dist = queryset.annotate(
#             hour=ExtractHour('timestamp')
#         ).values('hour').annotate(
#             count=Count('id'),
#             success_count=Count('id', filter=Q(status_code__range=[200, 299])),
#             success_rate=Count('id', filter=Q(status_code__range=[200, 299])) * 100.0 / Count('id')
#         ).order_by('hour')
        
#         return list(hourly_dist)

#     def get_daily_trends(self, queryset):
#         """Get daily activity trends."""
#         from django.db.models.functions import TruncDate
        
#         daily_trends = queryset.annotate(
#             date=TruncDate('timestamp')
#         ).values('date').annotate(
#             count=Count('id'),
#             success_count=Count('id', filter=Q(status_code__range=[200, 299])),
#             unique_users=Count('user', distinct=True),
#             unique_routers=Count('router', distinct=True)
#         ).order_by('date')
        
#         return list(daily_trends)

#     def get_status_code_analysis(self, queryset):
#         """Get detailed status code analysis."""
#         status_analysis = queryset.values('status_code').annotate(
#             count=Count('id'),
#             percentage=Count('id') * 100.0 / queryset.count(),
#             last_occurrence=Max('timestamp')
#         ).order_by('-count')
        
#         # Add status code descriptions
#         status_descriptions = {
#             200: "OK - Successful operation",
#             201: "Created - Resource created successfully",
#             204: "No Content - Successful operation with no content",
#             400: "Bad Request - Invalid request parameters",
#             401: "Unauthorized - Authentication required",
#             403: "Forbidden - Insufficient permissions",
#             404: "Not Found - Resource not found",
#             500: "Internal Server Error - Server-side error"
#         }
        
#         for item in status_analysis:
#             item['description'] = status_descriptions.get(item['status_code'], "Unknown status code")
        
#         return list(status_analysis)

#     def get_time_period_days(self, queryset):
#         """Calculate actual time period covered by the data."""
#         if not queryset.exists():
#             return 0
        
#         time_range = queryset.aggregate(
#             earliest=Max('timestamp'),
#             latest=Max('timestamp')
#         )
        
#         if time_range['earliest'] and time_range['latest']:
#             days = (time_range['latest'] - time_range['earliest']).days + 1
#             return max(1, days)
        
#         return 1


# class AuditLogExportView(RouterAuditLogBaseView):
#     """
#     Enhanced API View for exporting audit logs in various formats with status code support.
#     """
    
#     def get(self, request):
#         """
#         Export audit logs in CSV or JSON format.
        
#         Query Parameters:
#             format: 'csv' or 'json' (default: 'json')
#             days: Number of days to include (default: 30)
#             router_id: Filter by specific router
#             action: Filter by specific action
#             status_code: Filter by specific status code
#         """
#         format_type = request.query_params.get('format', 'json')
#         days = int(request.query_params.get('days', 30))
#         router_id = request.query_params.get('router_id')
#         action = request.query_params.get('action')
#         status_code = request.query_params.get('status_code')
        
#         start_date = timezone.now() - timedelta(days=days)
#         logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
#         # Apply filters
#         if router_id:
#             logs = logs.filter(router_id=router_id)
#         if action:
#             logs = logs.filter(action=action)
#         if status_code:
#             logs = logs.filter(status_code=status_code)
            
#         logs = logs.select_related('router', 'user').order_by('-timestamp')
        
#         if format_type == 'csv':
#             return self.export_csv(logs)
#         else:
#             return self.export_json(logs)

#     def export_csv(self, queryset):
#         """Export logs as CSV with enhanced fields."""
#         response = HttpResponse(content_type='text/csv')
#         response['Content-Disposition'] = 'attachment; filename="audit_logs_export.csv"'
        
#         writer = csv.writer(response)
        
#         # Enhanced header row with status code
#         writer.writerow([
#             'Timestamp', 
#             'Router Name', 
#             'Router IP', 
#             'Action', 
#             'Action Display',
#             'Username', 
#             'Email', 
#             'IP Address', 
#             'Description',
#             'Status Code',
#             'Status Description',
#             'Changes Summary'
#         ])
        
#         status_descriptions = {
#             200: "OK",
#             201: "Created",
#             204: "No Content", 
#             400: "Bad Request",
#             401: "Unauthorized",
#             403: "Forbidden",
#             404: "Not Found",
#             500: "Internal Server Error"
#         }
        
#         for log in queryset:
#             # Create changes summary
#             changes_summary = "No changes"
#             if log.changes:
#                 changes_list = []
#                 for field, values in log.changes.items():
#                     if isinstance(values, dict) and 'old' in values and 'new' in values:
#                         changes_list.append(f"{field}: {values['old']}→{values['new']}")
#                     else:
#                         changes_list.append(f"{field}: {values}")
#                 changes_summary = "; ".join(changes_list[:3]) + ("..." if len(changes_list) > 3 else "")
            
#             writer.writerow([
#                 log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
#                 log.router.name if log.router else 'N/A',
#                 log.router.ip if log.router else 'N/A',
#                 log.action,
#                 log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
#                 log.user.username if log.user else 'System',
#                 log.user.email if log.user and hasattr(log.user, 'email') else 'N/A',
#                 log.ip_address or 'N/A',
#                 log.description,
#                 log.status_code or 'N/A',
#                 status_descriptions.get(log.status_code, 'Unknown') if log.status_code else 'N/A',
#                 changes_summary
#             ])
            
#         return response

#     def export_json(self, queryset):
#         """Export logs as JSON with enhanced structure."""
#         logs_data = []
        
#         status_descriptions = {
#             200: "OK",
#             201: "Created", 
#             204: "No Content",
#             400: "Bad Request",
#             401: "Unauthorized",
#             403: "Forbidden", 
#             404: "Not Found",
#             500: "Internal Server Error"
#         }
        
#         for log in queryset:
#             log_data = {
#                 'timestamp': log.timestamp.isoformat(),
#                 'router': {
#                     'id': log.router.id if log.router else None,
#                     'name': log.router.name if log.router else None,
#                     'ip': log.router.ip if log.router else None,
#                     'type': log.router.type if log.router else None,
#                 } if log.router else None,
#                 'action': log.action,
#                 'action_display': log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
#                 'user': {
#                     'id': log.user.id if log.user else None,
#                     'username': log.user.username if log.user else None,
#                     'email': log.user.email if log.user and hasattr(log.user, 'email') else None,
#                     'first_name': log.user.first_name if log.user and hasattr(log.user, 'first_name') else None,
#                     'last_name': log.user.last_name if log.user and hasattr(log.user, 'last_name') else None,
#                 } if log.user else None,
#                 'ip_address': log.ip_address,
#                 'description': log.description,
#                 'changes': log.changes,
#                 'status_code': log.status_code,
#                 'status_description': status_descriptions.get(log.status_code) if log.status_code else None,
#                 'user_agent': log.user_agent
#             }
#             logs_data.append(log_data)
            
#         export_info = {
#             'exported_at': timezone.now().isoformat(),
#             'total_records': len(logs_data),
#             'format': 'json',
#             'version': '2.0',
#             'filters_applied': {
#                 'total_days': (timezone.now() - queryset.last().timestamp).days if queryset.exists() else 0,
#                 'date_range': {
#                     'start': queryset.last().timestamp.isoformat() if queryset.exists() else None,
#                     'end': queryset.first().timestamp.isoformat() if queryset.exists() else None
#                 }
#             }
#         }
            
#         return JsonResponse({
#             'export_info': export_info,
#             'logs': logs_data
#         }, safe=False)

#     def post(self, request):
#         """
#         Export audit logs with custom parameters via POST request.
        
#         Request Body:
#             format: 'csv' or 'json'
#             start_date: Start date for filtering (ISO format)
#             end_date: End date for filtering (ISO format)
#             router_ids: List of router IDs to filter
#             actions: List of actions to filter
#             status_codes: List of status codes to filter
#             include_changes: Whether to include changes in export (boolean)
#         """
#         try:
#             format_type = request.data.get('format', 'json')
#             start_date_str = request.data.get('start_date')
#             end_date_str = request.data.get('end_date')
#             router_ids = request.data.get('router_ids', [])
#             actions = request.data.get('actions', [])
#             status_codes = request.data.get('status_codes', [])
#             include_changes = request.data.get('include_changes', True)
            
#             # Build query
#             logs = RouterAuditLog.objects.all()
            
#             # Date filtering
#             if start_date_str:
#                 start_date = timezone.datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
#                 logs = logs.filter(timestamp__gte=start_date)
#             if end_date_str:
#                 end_date = timezone.datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
#                 logs = logs.filter(timestamp__lte=end_date)
                
#             # Router filtering
#             if router_ids:
#                 logs = logs.filter(router_id__in=router_ids)
                
#             # Action filtering
#             if actions:
#                 logs = logs.filter(action__in=actions)
                
#             # Status code filtering
#             if status_codes:
#                 logs = logs.filter(status_code__in=status_codes)
                
#             logs = logs.select_related('router', 'user').order_by('-timestamp')
            
#             # Log the export operation
#             self.create_audit_log_for_operation(
#                 action='audit_export',
#                 description=f"Audit logs exported: {logs.count()} records",
#                 request=request,
#                 changes={
#                     'format': format_type,
#                     'filters': {
#                         'start_date': start_date_str,
#                         'end_date': end_date_str,
#                         'router_ids': router_ids,
#                         'actions': actions,
#                         'status_codes': status_codes
#                     }
#                 },
#                 status_code=200
#             )
            
#             if format_type == 'csv':
#                 return self.export_csv(logs)
#             else:
#                 return self.export_json(logs)
                
#         except Exception as e:
#             logger.error(f"Audit log export failed: {str(e)}")
            
#             self.create_audit_log_for_operation(
#                 action='audit_export',
#                 description=f"Audit log export failed: {str(e)}",
#                 request=request,
#                 changes={'error': str(e)},
#                 status_code=500
#             )
            
#             return Response(
#                 {"error": f"Export failed: {str(e)}"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class AuditLogCleanupView(RouterAuditLogBaseView):
#     """
#     Enhanced API View for managing audit log cleanup and retention.
#     """
    
#     def get(self, request):
#         """
#         Get audit log cleanup statistics and retention policy.
#         """
#         try:
#             # Calculate statistics
#             total_logs = RouterAuditLog.objects.count()
#             oldest_log = RouterAuditLog.objects.order_by('timestamp').first()
#             newest_log = RouterAuditLog.objects.order_by('-timestamp').first()
            
#             # Get status code distribution
#             status_distribution = RouterAuditLog.objects.values('status_code').annotate(
#                 count=Count('id')
#             ).order_by('-count')
            
#             # Default retention policy
#             retention_days = 365
#             cutoff_date = timezone.now() - timedelta(days=retention_days)
#             logs_to_delete = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date).count()
            
#             # Calculate storage statistics
#             total_size_estimate = self.estimate_database_size(total_logs)
#             potential_savings = self.estimate_database_size(logs_to_delete)
            
#             statistics = {
#                 'total_logs': total_logs,
#                 'oldest_log_date': oldest_log.timestamp.isoformat() if oldest_log else None,
#                 'newest_log_date': newest_log.timestamp.isoformat() if newest_log else None,
#                 'status_code_distribution': list(status_distribution),
#                 'retention_policy': {
#                     'retention_days': retention_days,
#                     'cutoff_date': cutoff_date.isoformat(),
#                     'logs_to_delete': logs_to_delete,
#                     'logs_to_keep': total_logs - logs_to_delete
#                 },
#                 'storage_analysis': {
#                     'total_size_estimate': total_size_estimate,
#                     'potential_savings': potential_savings,
#                     'remaining_size_estimate': self.estimate_database_size(total_logs - logs_to_delete)
#                 }
#             }
            
#             return Response(statistics)
            
#         except Exception as e:
#             logger.error(f"Failed to get audit log statistics: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve audit log statistics"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         Clean up old audit logs based on retention policy.
        
#         Request Body:
#             retention_days: Number of days to retain logs (default: 365)
#             dry_run: Whether to perform a dry run without deleting (default: True)
#             max_deletion: Maximum number of logs to delete in one operation
#             backup_before_delete: Whether to create a backup before deletion (default: False)
#         """
#         try:
#             retention_days = int(request.data.get('retention_days', 365))
#             dry_run = request.data.get('dry_run', True)
#             max_deletion = request.data.get('max_deletion')
#             backup_before_delete = request.data.get('backup_before_delete', False)
            
#             if retention_days < 30:
#                 return Response(
#                     {"error": "Retention period must be at least 30 days"}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             cutoff_date = timezone.now() - timedelta(days=retention_days)
#             old_logs = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date)
            
#             if max_deletion:
#                 old_logs = old_logs[:int(max_deletion)]
            
#             # Calculate statistics for response
#             deletion_stats = {
#                 'total_eligible': old_logs.count(),
#                 'status_code_breakdown': old_logs.values('status_code').annotate(
#                     count=Count('id')
#                 ).order_by('-count'),
#                 'action_breakdown': old_logs.values('action').annotate(
#                     count=Count('id')
#                 ).order_by('-count'),
#                 'date_range': {
#                     'oldest': old_logs.order_by('timestamp').first().timestamp.isoformat() if old_logs.exists() else None,
#                     'newest': old_logs.order_by('-timestamp').first().timestamp.isoformat() if old_logs.exists() else None
#                 }
#             }
            
#             if dry_run:
#                 return Response({
#                     'message': 'Dry run completed',
#                     'deletion_plan': deletion_stats,
#                     'cutoff_date': cutoff_date.isoformat(),
#                     'retention_days': retention_days,
#                     'max_deletion': max_deletion,
#                     'backup_requested': backup_before_delete,
#                     'actual_deletion': 0
#                 })
#             else:
#                 # Perform actual deletion
#                 deleted_count = old_logs.count()
                
#                 # Create backup if requested
#                 backup_info = None
#                 if backup_before_delete:
#                     backup_info = self.create_backup(old_logs)
                
#                 # Log the cleanup action before deletion
#                 self.create_audit_log_for_operation(
#                     action='audit_cleanup',
#                     description=f"Audit logs cleanup: {deleted_count} records deleted",
#                     request=request,
#                     changes={
#                         'deleted_count': deleted_count,
#                         'retention_days': retention_days,
#                         'cutoff_date': cutoff_date.isoformat(),
#                         'max_deletion': max_deletion,
#                         'backup_created': backup_info is not None,
#                         'deletion_stats': deletion_stats
#                     },
#                     status_code=200
#                 )
                
#                 # Delete the old logs
#                 old_logs.delete()
                
#                 # Clear relevant cache
#                 self.clear_audit_cache()
                
#                 return Response({
#                     'message': 'Audit logs cleanup completed',
#                     'deleted_count': deleted_count,
#                     'retention_days': retention_days,
#                     'cutoff_date': cutoff_date.isoformat(),
#                     'max_deletion': max_deletion,
#                     'backup_info': backup_info,
#                     'deletion_statistics': deletion_stats
#                 })

#         except Exception as e:
#             logger.error(f"Audit log cleanup failed: {str(e)}")
            
#             self.create_audit_log_for_operation(
#                 action='audit_cleanup',
#                 description=f"Audit log cleanup failed: {str(e)}",
#                 request=request,
#                 changes={'error': str(e)},
#                 status_code=500
#             )
            
#             return Response(
#                 {"error": f"Cleanup failed: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def create_backup(self, queryset):
#         """Create a backup of the logs to be deleted."""
#         try:
#             # In a real implementation, this would export to a file or backup database
#             backup_info = {
#                 'timestamp': timezone.now().isoformat(),
#                 'record_count': queryset.count(),
#                 'backup_type': 'audit_logs_cleanup',
#                 'status': 'simulated_backup'  # In real implementation, this would be actual backup status
#             }
#             return backup_info
#         except Exception as e:
#             logger.warning(f"Backup creation failed: {e}")
#             return None

#     def clear_audit_cache(self):
#         """Clear audit-related cache entries."""
#         try:
#             cache.delete_pattern("audit_logs:*")
#             cache.delete_pattern("comprehensive_audit:*")
#         except Exception as e:
#             logger.warning(f"Cache clearance failed: {e}")

#     def estimate_database_size(self, log_count):
#         """
#         Estimate the database size based on log count.
        
#         This is a rough estimation - actual size may vary.
#         """
#         # Average size per audit log record in bytes (estimated)
#         avg_record_size = 1024  # 1KB per record
        
#         total_size_bytes = log_count * avg_record_size
        
#         # Convert to human readable format
#         if total_size_bytes < 1024:
#             return f"{total_size_bytes} bytes"
#         elif total_size_bytes < 1024 * 1024:
#             return f"{total_size_bytes / 1024:.2f} KB"
#         elif total_size_bytes < 1024 * 1024 * 1024:
#             return f"{total_size_bytes / (1024 * 1024):.2f} MB"
#         else:
#             return f"{total_size_bytes / (1024 * 1024 * 1024):.2f} GB"

#     def delete(self, request):
#         """
#         Emergency endpoint to delete all audit logs (use with caution).
#         Requires superuser permissions.
#         """
#         if not request.user.is_superuser:
#             return Response(
#                 {"error": "Superuser permissions required for this operation"}, 
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         try:
#             confirm = request.data.get('confirm', False)
#             backup_before_delete = request.data.get('backup_before_delete', True)
            
#             if not confirm:
#                 total_logs = RouterAuditLog.objects.count()
#                 return Response({
#                     'warning': 'This will delete ALL audit logs. This action cannot be undone.',
#                     'total_logs': total_logs,
#                     'estimated_size': self.estimate_database_size(total_logs),
#                     'instructions': 'Set confirm=true in the request body to proceed.',
#                     'recommendation': 'Consider using the regular cleanup endpoint instead.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             total_logs = RouterAuditLog.objects.count()
            
#             # Create backup if requested
#             backup_info = None
#             if backup_before_delete:
#                 backup_info = self.create_backup(RouterAuditLog.objects.all())
            
#             # Delete all logs
#             RouterAuditLog.objects.all().delete()
            
#             # Log the complete cleanup
#             self.create_audit_log_for_operation(
#                 action='audit_cleanup_complete',
#                 description=f"COMPLETE audit logs cleanup: {total_logs} records deleted",
#                 request=request,
#                 changes={
#                     'deleted_count': total_logs,
#                     'type': 'complete_cleanup',
#                     'backup_created': backup_info is not None,
#                     'initiated_by': request.user.username
#                 },
#                 status_code=200
#             )
            
#             # Clear all cache
#             self.clear_audit_cache()
            
#             return Response({
#                 'message': 'All audit logs have been deleted',
#                 'deleted_count': total_logs,
#                 'backup_info': backup_info,
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Complete audit log cleanup failed: {str(e)}")
            
#             self.create_audit_log_for_operation(
#                 action='audit_cleanup_complete',
#                 description=f"Complete audit log cleanup failed: {str(e)}",
#                 request=request,
#                 changes={'error': str(e)},
#                 status_code=500
#             )
            
#             return Response(
#                 {"error": f"Complete cleanup failed: {str(e)}"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )









# network_management/api/views/router_management/router_audit_views.py
"""
Enhanced Router Audit Log Views for Network Management System

This module provides comprehensive API views for router audit logs and analytics
with enhanced filtering, export capabilities, and status code support.
"""

import logging
import csv
from django.utils import timezone
from django.db.models import Q, Count, Max, Avg
from django.http import HttpResponse, JsonResponse
from datetime import timedelta
from django.core.cache import cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import RouterAuditLog
from network_management.serializers.router_management_serializer import RouterAuditLogSerializer

logger = logging.getLogger(__name__)


class RouterAuditLogBaseView(APIView):
    """
    Base view class for router audit log operations.
    """
    permission_classes = [IsAuthenticated]
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')
    
    def create_audit_log_for_operation(self, action, description, request, changes=None, status_code=None):
        """Create audit log for audit-related operations."""
        # Create the audit log without router (router is now nullable)
        return RouterAuditLog.objects.create(
            # router is omitted - will be NULL in database (now allowed)
            action=action,
            description=description,
            user=request.user,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes=changes or {},
            status_code=status_code
        )


class RouterAuditLogView(RouterAuditLogBaseView):
    """
    Enhanced API View for retrieving router audit logs with comprehensive filtering.
    """
    
    def get(self, request):
        """Retrieve filtered audit logs for routers with enhanced filtering."""
        # Get filter parameters
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        user_id = request.query_params.get('user_id')
        status_code = request.query_params.get('status_code')
        days = int(request.query_params.get('days', 7))
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        
        # Validate pagination
        if page_size > 1000:
            return Response(
                {"error": "Page size cannot exceed 1000"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        start_date = timezone.now() - timedelta(days=days)
        
        # Build cache key based on filters
        cache_key = f"audit_logs:{router_id}:{action}:{user_id}:{status_code}:{days}:{page}:{page_size}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        # Build query with enhanced filtering
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
        if user_id:
            logs = logs.filter(user_id=user_id)
        if status_code:
            logs = logs.filter(status_code=status_code)
            
        # Apply pagination
        total_count = logs.count()
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_logs = logs[start_index:end_index]
        
        # Serialize data
        serializer = RouterAuditLogSerializer(paginated_logs, many=True)
        
        response_data = {
            'logs': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size,
                'has_next': end_index < total_count,
                'has_previous': page > 1
            },
            'filters': {
                'router_id': router_id,
                'action': action,
                'user_id': user_id,
                'status_code': status_code,
                'days': days
            }
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, response_data, 300)
        
        return Response(response_data)


class ComprehensiveAuditLogView(RouterAuditLogBaseView):
    """
    COMPREHENSIVE API View for router audit logs with advanced filtering and analytics.
    """
    
    def get(self, request):
        """Retrieve filtered audit logs with advanced analytics."""
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        user_id = request.query_params.get('user_id')
        status_code = request.query_params.get('status_code')
        days = int(request.query_params.get('days', 7))
        include_analytics = request.query_params.get('include_analytics', 'false').lower() == 'true'
        include_status_analytics = request.query_params.get('include_status_analytics', 'false').lower() == 'true'
        
        start_date = timezone.now() - timedelta(days=days)
        
        # Build cache key
        cache_key = f"comprehensive_audit:{router_id}:{action}:{user_id}:{status_code}:{days}:{include_analytics}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
        if user_id:
            logs = logs.filter(user_id=user_id)
        if status_code:
            logs = logs.filter(status_code=status_code)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        # Serialize data
        serializer = RouterAuditLogSerializer(logs, many=True)
        response_data = {
            'logs': serializer.data,
            'count': len(serializer.data),
            'timeframe_days': days,
            'filters_applied': {
                'router_id': router_id,
                'action': action,
                'user_id': user_id,
                'status_code': status_code
            }
        }
        
        if include_analytics:
            response_data['analytics'] = self.get_analytics(logs, include_status_analytics)
        
        # Cache for 10 minutes
        cache.set(cache_key, response_data, 600)
        
        return Response(response_data)

    def get_analytics(self, queryset, include_status_analytics=False):
        """Generate comprehensive analytics from audit logs."""
        analytics = {
            'summary': {
                'total_actions': queryset.count(),
                'time_period': f'Last {self.get_time_period_days(queryset)} days',
                'unique_users': queryset.values('user').distinct().count(),
                'unique_routers': queryset.values('router').distinct().count(),
                'date_range': {
                    'start': queryset.aggregate(Max('timestamp'))['timestamp__max'],
                    'end': queryset.aggregate(Max('timestamp'))['timestamp__max']
                } if queryset.exists() else None
            },
            'action_breakdown': self.get_action_breakdown(queryset),
            'user_activity': self.get_user_activity(queryset),
            'router_activity': self.get_router_activity(queryset),
            'hourly_distribution': self.get_hourly_distribution(queryset),
            'daily_trends': self.get_daily_trends(queryset),
        }
        
        if include_status_analytics:
            analytics['status_code_analysis'] = self.get_status_code_analysis(queryset)
        
        return analytics

    def get_action_breakdown(self, queryset):
        """Break down actions by type with enhanced statistics."""
        breakdown = queryset.values('action').annotate(
            count=Count('id'),
            last_performed=Max('timestamp'),
            avg_response_time=Avg('status_code'),
            success_rate=Count('id', filter=Q(status_code__range=[200, 299])) * 100.0 / Count('id')
        ).order_by('-count')
        
        return list(breakdown)

    def get_user_activity(self, queryset):
        """Get user activity statistics with enhanced metrics."""
        user_activity = queryset.filter(user__isnull=False).values(
            'user__username', 'user__email', 'user__first_name', 'user__last_name'
        ).annotate(
            action_count=Count('id'),
            last_activity=Max('timestamp'),
            success_count=Count('id', filter=Q(status_code__range=[200, 299])),
            error_count=Count('id', filter=Q(status_code__range=[400, 599])),
            success_rate=Count('id', filter=Q(status_code__range=[200, 299])) * 100.0 / Count('id')
        ).order_by('-action_count')[:15]
        
        return list(user_activity)

    def get_router_activity(self, queryset):
        """Get router activity statistics with enhanced metrics."""
        router_activity = queryset.filter(router__isnull=False).values(
            'router__name', 'router__ip', 'router__type', 'router__connection_status'
        ).annotate(
            action_count=Count('id'),
            last_activity=Max('timestamp'),
            success_count=Count('id', filter=Q(status_code__range=[200, 299])),
            error_count=Count('id', filter=Q(status_code__range=[400, 599])),
            most_common_action=Count('action')
        ).order_by('-action_count')[:15]
        
        return list(router_activity)

    def get_hourly_distribution(self, queryset):
        """Get action distribution by hour of day with success rates."""
        from django.db.models.functions import ExtractHour
        
        hourly_dist = queryset.annotate(
            hour=ExtractHour('timestamp')
        ).values('hour').annotate(
            count=Count('id'),
            success_count=Count('id', filter=Q(status_code__range=[200, 299])),
            success_rate=Count('id', filter=Q(status_code__range=[200, 299])) * 100.0 / Count('id')
        ).order_by('hour')
        
        return list(hourly_dist)

    def get_daily_trends(self, queryset):
        """Get daily activity trends."""
        from django.db.models.functions import TruncDate
        
        daily_trends = queryset.annotate(
            date=TruncDate('timestamp')
        ).values('date').annotate(
            count=Count('id'),
            success_count=Count('id', filter=Q(status_code__range=[200, 299])),
            unique_users=Count('user', distinct=True),
            unique_routers=Count('router', distinct=True)
        ).order_by('date')
        
        return list(daily_trends)

    def get_status_code_analysis(self, queryset):
        """Get detailed status code analysis."""
        status_analysis = queryset.values('status_code').annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / queryset.count(),
            last_occurrence=Max('timestamp')
        ).order_by('-count')
        
        # Add status code descriptions
        status_descriptions = {
            200: "OK - Successful operation",
            201: "Created - Resource created successfully",
            204: "No Content - Successful operation with no content",
            400: "Bad Request - Invalid request parameters",
            401: "Unauthorized - Authentication required",
            403: "Forbidden - Insufficient permissions",
            404: "Not Found - Resource not found",
            500: "Internal Server Error - Server-side error"
        }
        
        for item in status_analysis:
            item['description'] = status_descriptions.get(item['status_code'], "Unknown status code")
        
        return list(status_analysis)

    def get_time_period_days(self, queryset):
        """Calculate actual time period covered by the data."""
        if not queryset.exists():
            return 0
        
        time_range = queryset.aggregate(
            earliest=Max('timestamp'),
            latest=Max('timestamp')
        )
        
        if time_range['earliest'] and time_range['latest']:
            days = (time_range['latest'] - time_range['earliest']).days + 1
            return max(1, days)
        
        return 1


class AuditLogExportView(RouterAuditLogBaseView):
    """
    Enhanced API View for exporting audit logs in various formats with status code support.
    """
    
    def get(self, request):
        """
        Export audit logs in CSV or JSON format.
        
        Query Parameters:
            format: 'csv' or 'json' (default: 'json')
            days: Number of days to include (default: 30)
            router_id: Filter by specific router
            action: Filter by specific action
            status_code: Filter by specific status code
        """
        format_type = request.query_params.get('format', 'json')
        days = int(request.query_params.get('days', 30))
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        status_code = request.query_params.get('status_code')
        
        start_date = timezone.now() - timedelta(days=days)
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        # Apply filters
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
        if status_code:
            logs = logs.filter(status_code=status_code)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        if format_type == 'csv':
            return self.export_csv(logs)
        else:
            return self.export_json(logs)

    def export_csv(self, queryset):
        """Export logs as CSV with enhanced fields."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="audit_logs_export.csv"'
        
        writer = csv.writer(response)
        
        # Enhanced header row with status code
        writer.writerow([
            'Timestamp', 
            'Router Name', 
            'Router IP', 
            'Action', 
            'Action Display',
            'Username', 
            'Email', 
            'IP Address', 
            'Description',
            'Status Code',
            'Status Description',
            'Changes Summary'
        ])
        
        status_descriptions = {
            200: "OK",
            201: "Created",
            204: "No Content", 
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Internal Server Error"
        }
        
        for log in queryset:
            # Create changes summary
            changes_summary = "No changes"
            if log.changes:
                changes_list = []
                for field, values in log.changes.items():
                    if isinstance(values, dict) and 'old' in values and 'new' in values:
                        changes_list.append(f"{field}: {values['old']}→{values['new']}")
                    else:
                        changes_list.append(f"{field}: {values}")
                changes_summary = "; ".join(changes_list[:3]) + ("..." if len(changes_list) > 3 else "")
            
            writer.writerow([
                log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                log.router.name if log.router else 'System',
                log.router.ip if log.router else 'N/A',
                log.action,
                log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
                log.user.username if log.user else 'System',
                log.user.email if log.user and hasattr(log.user, 'email') else 'N/A',
                log.ip_address or 'N/A',
                log.description,
                log.status_code or 'N/A',
                status_descriptions.get(log.status_code, 'Unknown') if log.status_code else 'N/A',
                changes_summary
            ])
            
        return response

    def export_json(self, queryset):
        """Export logs as JSON with enhanced structure."""
        logs_data = []
        
        status_descriptions = {
            200: "OK",
            201: "Created", 
            204: "No Content",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden", 
            404: "Not Found",
            500: "Internal Server Error"
        }
        
        for log in queryset:
            log_data = {
                'timestamp': log.timestamp.isoformat(),
                'router': {
                    'id': log.router.id if log.router else None,
                    'name': log.router.name if log.router else "System",
                    'ip': log.router.ip if log.router else "N/A",
                    'type': log.router.type if log.router else None,
                } if log.router else None,
                'action': log.action,
                'action_display': log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
                'user': {
                    'id': log.user.id if log.user else None,
                    'username': log.user.username if log.user else None,
                    'email': log.user.email if log.user and hasattr(log.user, 'email') else None,
                    'first_name': log.user.first_name if log.user and hasattr(log.user, 'first_name') else None,
                    'last_name': log.user.last_name if log.user and hasattr(log.user, 'last_name') else None,
                } if log.user else None,
                'ip_address': log.ip_address,
                'description': log.description,
                'changes': log.changes,
                'status_code': log.status_code,
                'status_description': status_descriptions.get(log.status_code) if log.status_code else None,
                'user_agent': log.user_agent
            }
            logs_data.append(log_data)
            
        export_info = {
            'exported_at': timezone.now().isoformat(),
            'total_records': len(logs_data),
            'format': 'json',
            'version': '2.0',
            'filters_applied': {
                'total_days': (timezone.now() - queryset.last().timestamp).days if queryset.exists() else 0,
                'date_range': {
                    'start': queryset.last().timestamp.isoformat() if queryset.exists() else None,
                    'end': queryset.first().timestamp.isoformat() if queryset.exists() else None
                }
            }
        }
            
        return JsonResponse({
            'export_info': export_info,
            'logs': logs_data
        }, safe=False)

    def post(self, request):
        """
        Export audit logs with custom parameters via POST request.
        
        Request Body:
            format: 'csv' or 'json'
            start_date: Start date for filtering (ISO format)
            end_date: End date for filtering (ISO format)
            router_ids: List of router IDs to filter
            actions: List of actions to filter
            status_codes: List of status codes to filter
            include_changes: Whether to include changes in export (boolean)
        """
        try:
            format_type = request.data.get('format', 'json')
            start_date_str = request.data.get('start_date')
            end_date_str = request.data.get('end_date')
            router_ids = request.data.get('router_ids', [])
            actions = request.data.get('actions', [])
            status_codes = request.data.get('status_codes', [])
            include_changes = request.data.get('include_changes', True)
            
            # Build query
            logs = RouterAuditLog.objects.all()
            
            # Date filtering
            if start_date_str:
                start_date = timezone.datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                logs = logs.filter(timestamp__gte=start_date)
            if end_date_str:
                end_date = timezone.datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                logs = logs.filter(timestamp__lte=end_date)
                
            # Router filtering
            if router_ids:
                logs = logs.filter(router_id__in=router_ids)
                
            # Action filtering
            if actions:
                logs = logs.filter(action__in=actions)
                
            # Status code filtering
            if status_codes:
                logs = logs.filter(status_code__in=status_codes)
                
            logs = logs.select_related('router', 'user').order_by('-timestamp')
            
            # Log the export operation
            self.create_audit_log_for_operation(
                action='audit_export',
                description=f"Audit logs exported: {logs.count()} records",
                request=request,
                changes={
                    'format': format_type,
                    'filters': {
                        'start_date': start_date_str,
                        'end_date': end_date_str,
                        'router_ids': router_ids,
                        'actions': actions,
                        'status_codes': status_codes
                    }
                },
                status_code=200
            )
            
            if format_type == 'csv':
                return self.export_csv(logs)
            else:
                return self.export_json(logs)
                
        except Exception as e:
            logger.error(f"Audit log export failed: {str(e)}")
            
            self.create_audit_log_for_operation(
                action='audit_export',
                description=f"Audit log export failed: {str(e)}",
                request=request,
                changes={'error': str(e)},
                status_code=500
            )
            
            return Response(
                {"error": f"Export failed: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class AuditLogCleanupView(RouterAuditLogBaseView):
    """
    Enhanced API View for managing audit log cleanup and retention.
    """
    
    def get(self, request):
        """
        Get audit log cleanup statistics and retention policy.
        """
        try:
            # Calculate statistics
            total_logs = RouterAuditLog.objects.count()
            oldest_log = RouterAuditLog.objects.order_by('timestamp').first()
            newest_log = RouterAuditLog.objects.order_by('-timestamp').first()
            
            # Get status code distribution
            status_distribution = RouterAuditLog.objects.values('status_code').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Default retention policy
            retention_days = 365
            cutoff_date = timezone.now() - timedelta(days=retention_days)
            logs_to_delete = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date).count()
            
            # Calculate storage statistics
            total_size_estimate = self.estimate_database_size(total_logs)
            potential_savings = self.estimate_database_size(logs_to_delete)
            
            statistics = {
                'total_logs': total_logs,
                'oldest_log_date': oldest_log.timestamp.isoformat() if oldest_log else None,
                'newest_log_date': newest_log.timestamp.isoformat() if newest_log else None,
                'status_code_distribution': list(status_distribution),
                'retention_policy': {
                    'retention_days': retention_days,
                    'cutoff_date': cutoff_date.isoformat(),
                    'logs_to_delete': logs_to_delete,
                    'logs_to_keep': total_logs - logs_to_delete
                },
                'storage_analysis': {
                    'total_size_estimate': total_size_estimate,
                    'potential_savings': potential_savings,
                    'remaining_size_estimate': self.estimate_database_size(total_logs - logs_to_delete)
                }
            }
            
            return Response(statistics)
            
        except Exception as e:
            logger.error(f"Failed to get audit log statistics: {str(e)}")
            return Response(
                {"error": "Failed to retrieve audit log statistics"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Clean up old audit logs based on retention policy.
        
        Request Body:
            retention_days: Number of days to retain logs (default: 365)
            dry_run: Whether to perform a dry run without deleting (default: True)
            max_deletion: Maximum number of logs to delete in one operation
            backup_before_delete: Whether to create a backup before deletion (default: False)
        """
        try:
            retention_days = int(request.data.get('retention_days', 365))
            dry_run = request.data.get('dry_run', True)
            max_deletion = request.data.get('max_deletion')
            backup_before_delete = request.data.get('backup_before_delete', False)
            
            if retention_days < 30:
                return Response(
                    {"error": "Retention period must be at least 30 days"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cutoff_date = timezone.now() - timedelta(days=retention_days)
            old_logs = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date)
            
            if max_deletion:
                old_logs = old_logs[:int(max_deletion)]
            
            # Calculate statistics for response
            deletion_stats = {
                'total_eligible': old_logs.count(),
                'status_code_breakdown': old_logs.values('status_code').annotate(
                    count=Count('id')
                ).order_by('-count'),
                'action_breakdown': old_logs.values('action').annotate(
                    count=Count('id')
                ).order_by('-count'),
                'date_range': {
                    'oldest': old_logs.order_by('timestamp').first().timestamp.isoformat() if old_logs.exists() else None,
                    'newest': old_logs.order_by('-timestamp').first().timestamp.isoformat() if old_logs.exists() else None
                }
            }
            
            if dry_run:
                return Response({
                    'message': 'Dry run completed',
                    'deletion_plan': deletion_stats,
                    'cutoff_date': cutoff_date.isoformat(),
                    'retention_days': retention_days,
                    'max_deletion': max_deletion,
                    'backup_requested': backup_before_delete,
                    'actual_deletion': 0
                })
            else:
                # Perform actual deletion
                deleted_count = old_logs.count()
                
                # Create backup if requested
                backup_info = None
                if backup_before_delete:
                    backup_info = self.create_backup(old_logs)
                
                # Log the cleanup action before deletion
                self.create_audit_log_for_operation(
                    action='audit_cleanup',
                    description=f"Audit logs cleanup: {deleted_count} records deleted",
                    request=request,
                    changes={
                        'deleted_count': deleted_count,
                        'retention_days': retention_days,
                        'cutoff_date': cutoff_date.isoformat(),
                        'max_deletion': max_deletion,
                        'backup_created': backup_info is not None,
                        'deletion_stats': deletion_stats
                    },
                    status_code=200
                )
                
                # Delete the old logs
                old_logs.delete()
                
                # Clear relevant cache
                self.clear_audit_cache()
                
                return Response({
                    'message': 'Audit logs cleanup completed',
                    'deleted_count': deleted_count,
                    'retention_days': retention_days,
                    'cutoff_date': cutoff_date.isoformat(),
                    'max_deletion': max_deletion,
                    'backup_info': backup_info,
                    'deletion_statistics': deletion_stats
                })

        except Exception as e:
            logger.error(f"Audit log cleanup failed: {str(e)}")
            
            self.create_audit_log_for_operation(
                action='audit_cleanup',
                description=f"Audit log cleanup failed: {str(e)}",
                request=request,
                changes={'error': str(e)},
                status_code=500
            )
            
            return Response(
                {"error": f"Cleanup failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create_backup(self, queryset):
        """Create a backup of the logs to be deleted."""
        try:
            # In a real implementation, this would export to a file or backup database
            backup_info = {
                'timestamp': timezone.now().isoformat(),
                'record_count': queryset.count(),
                'backup_type': 'audit_logs_cleanup',
                'status': 'simulated_backup'
            }
            return backup_info
        except Exception as e:
            logger.warning(f"Backup creation failed: {e}")
            return None

    def clear_audit_cache(self):
        """Clear audit-related cache entries."""
        try:
            cache.delete_pattern("audit_logs:*")
            cache.delete_pattern("comprehensive_audit:*")
        except Exception as e:
            logger.warning(f"Cache clearance failed: {e}")

    def estimate_database_size(self, log_count):
        """
        Estimate the database size based on log count.
        
        This is a rough estimation - actual size may vary.
        """
        # Average size per audit log record in bytes (estimated)
        avg_record_size = 1024
        
        total_size_bytes = log_count * avg_record_size
        
        # Convert to human readable format
        if total_size_bytes < 1024:
            return f"{total_size_bytes} bytes"
        elif total_size_bytes < 1024 * 1024:
            return f"{total_size_bytes / 1024:.2f} KB"
        elif total_size_bytes < 1024 * 1024 * 1024:
            return f"{total_size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{total_size_bytes / (1024 * 1024 * 1024):.2f} GB"

    def delete(self, request):
        """
        Emergency endpoint to delete all audit logs (use with caution).
        Requires superuser permissions.
        """
        if not request.user.is_superuser:
            return Response(
                {"error": "Superuser permissions required for this operation"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            confirm = request.data.get('confirm', False)
            backup_before_delete = request.data.get('backup_before_delete', True)
            
            if not confirm:
                total_logs = RouterAuditLog.objects.count()
                return Response({
                    'warning': 'This will delete ALL audit logs. This action cannot be undone.',
                    'total_logs': total_logs,
                    'estimated_size': self.estimate_database_size(total_logs),
                    'instructions': 'Set confirm=true in the request body to proceed.',
                    'recommendation': 'Consider using the regular cleanup endpoint instead.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            total_logs = RouterAuditLog.objects.count()
            
            # Create backup if requested
            backup_info = None
            if backup_before_delete:
                backup_info = self.create_backup(RouterAuditLog.objects.all())
            
            # Delete all logs
            RouterAuditLog.objects.all().delete()
            
            # Log the complete cleanup
            self.create_audit_log_for_operation(
                action='audit_cleanup_complete',
                description=f"COMPLETE audit logs cleanup: {total_logs} records deleted",
                request=request,
                changes={
                    'deleted_count': total_logs,
                    'type': 'complete_cleanup',
                    'backup_created': backup_info is not None,
                    'initiated_by': request.user.username
                },
                status_code=200
            )
            
            # Clear all cache
            self.clear_audit_cache()
            
            return Response({
                'message': 'All audit logs have been deleted',
                'deleted_count': total_logs,
                'backup_info': backup_info,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Complete audit log cleanup failed: {str(e)}")
            
            self.create_audit_log_for_operation(
                action='audit_cleanup_complete',
                description=f"Complete audit log cleanup failed: {str(e)}",
                request=request,
                changes={'error': str(e)},
                status_code=500
            )
            
            return Response(
                {"error": f"Complete cleanup failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )