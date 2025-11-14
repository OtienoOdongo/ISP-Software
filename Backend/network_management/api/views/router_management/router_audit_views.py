





# network_management/api/views/router_management/router_audit_views.py
"""
Router Audit Log Views for Network Management System

This module provides API views for router audit logs and analytics.
"""

import logging
import csv
from django.utils import timezone
from django.db.models import Q, Count, Max
from django.http import HttpResponse, JsonResponse
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import RouterAuditLog
from network_management.serializers.router_management_serializer import RouterAuditLogSerializer

logger = logging.getLogger(__name__)


class RouterAuditLogView(APIView):
    """
    API View for retrieving router audit logs.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve filtered audit logs for routers."""
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        days = int(request.query_params.get('days', 7))
        
        start_date = timezone.now() - timedelta(days=days)
        
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        # FIX: Return consistent array format
        serializer = RouterAuditLogSerializer(logs, many=True)
        return Response({
            'logs': serializer.data,
            'count': len(serializer.data),
            'timeframe_days': days
        })


class ComprehensiveAuditLogView(APIView):
    """
    COMPREHENSIVE API View for router audit logs with advanced filtering and analytics.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve filtered audit logs with advanced analytics."""
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        user_id = request.query_params.get('user_id')
        days = int(request.query_params.get('days', 7))
        include_analytics = request.query_params.get('include_analytics', 'false').lower() == 'true'
        
        start_date = timezone.now() - timedelta(days=days)
        
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
        if user_id:
            logs = logs.filter(user_id=user_id)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        # FIX: Return consistent format
        serializer = RouterAuditLogSerializer(logs, many=True)
        response_data = {
            'logs': serializer.data,
            'count': len(serializer.data),
            'timeframe_days': days
        }
        
        if include_analytics:
            response_data['analytics'] = self.get_analytics(logs)
            
        return Response(response_data)

    def get_analytics(self, queryset):
        """Generate comprehensive analytics from audit logs."""
        analytics = {
            'summary': {
                'total_actions': queryset.count(),
                'time_period': 'Last 7 days',
                'unique_users': queryset.values('user').distinct().count(),
                'unique_routers': queryset.values('router').distinct().count(),
            },
            'action_breakdown': self.get_action_breakdown(queryset),
            'user_activity': self.get_user_activity(queryset),
            'router_activity': self.get_router_activity(queryset),
            'hourly_distribution': self.get_hourly_distribution(queryset),
        }
        
        return analytics

    def get_action_breakdown(self, queryset):
        """Break down actions by type."""
        from django.db.models import Count, Max
        breakdown = queryset.values('action').annotate(
            count=Count('id'),
            last_performed=Max('timestamp')
        ).order_by('-count')
        
        return list(breakdown)

    def get_user_activity(self, queryset):
        """Get user activity statistics."""
        user_activity = queryset.filter(user__isnull=False).values(
            'user__username', 'user__email'
        ).annotate(
            action_count=Count('id'),
            last_activity=Max('timestamp')
        ).order_by('-action_count')[:10]
        
        return list(user_activity)

    def get_router_activity(self, queryset):
        """Get router activity statistics."""
        router_activity = queryset.filter(router__isnull=False).values(
            'router__name', 'router__ip'
        ).annotate(
            action_count=Count('id'),
            last_activity=Max('timestamp')
        ).order_by('-action_count')[:10]
        
        return list(router_activity)

    def get_hourly_distribution(self, queryset):
        """Get action distribution by hour of day."""
        from django.db.models.functions import ExtractHour
        
        hourly_dist = queryset.annotate(
            hour=ExtractHour('timestamp')
        ).values('hour').annotate(
            count=Count('id')
        ).order_by('hour')
        
        return list(hourly_dist)


class AuditLogExportView(APIView):
    """
    API View for exporting audit logs in various formats.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Export audit logs in CSV or JSON format.
        
        Query Parameters:
            format: 'csv' or 'json' (default: 'json')
            days: Number of days to include (default: 30)
            router_id: Filter by specific router
            action: Filter by specific action
        """
        format_type = request.query_params.get('format', 'json')
        days = int(request.query_params.get('days', 30))
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        
        start_date = timezone.now() - timedelta(days=days)
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        # Apply filters
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        if format_type == 'csv':
            return self.export_csv(logs)
        else:
            return self.export_json(logs)

    def export_csv(self, queryset):
        """Export logs as CSV."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="audit_logs.csv"'
        
        writer = csv.writer(response)
        
        # Write header row
        writer.writerow([
            'Timestamp', 
            'Router Name', 
            'Router IP', 
            'Action', 
            'Username', 
            'Email', 
            'IP Address', 
            'Description',
            'Status Code'
        ])
        
        for log in queryset:
            writer.writerow([
                log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                log.router.name if log.router else 'N/A',
                log.router.ip if log.router else 'N/A',
                log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
                log.user.username if log.user else 'System',
                log.user.email if log.user and hasattr(log.user, 'email') else 'N/A',
                log.ip_address or 'N/A',
                log.description,
                getattr(log, 'status_code', 'N/A')
            ])
            
        return response

    def export_json(self, queryset):
        """Export logs as JSON."""
        logs_data = []
        for log in queryset:
            log_data = {
                'timestamp': log.timestamp.isoformat(),
                'router': {
                    'id': log.router.id if log.router else None,
                    'name': log.router.name if log.router else None,
                    'ip': log.router.ip if log.router else None,
                } if log.router else None,
                'action': log.action,
                'action_display': log.get_action_display() if hasattr(log, 'get_action_display') else log.action,
                'user': {
                    'id': log.user.id if log.user else None,
                    'username': log.user.username if log.user else None,
                    'email': log.user.email if log.user and hasattr(log.user, 'email') else None,
                } if log.user else None,
                'ip_address': log.ip_address,
                'description': log.description,
                'changes': log.changes,
                'status_code': getattr(log, 'status_code', None)
            }
            logs_data.append(log_data)
            
        return JsonResponse({
            'export_info': {
                'exported_at': timezone.now().isoformat(),
                'total_records': len(logs_data),
                'format': 'json'
            },
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
            include_changes: Whether to include changes in export (boolean)
        """
        try:
            format_type = request.data.get('format', 'json')
            start_date_str = request.data.get('start_date')
            end_date_str = request.data.get('end_date')
            router_ids = request.data.get('router_ids', [])
            actions = request.data.get('actions', [])
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
                
            logs = logs.select_related('router', 'user').order_by('-timestamp')
            
            if format_type == 'csv':
                return self.export_csv(logs)
            else:
                return self.export_json(logs)
                
        except Exception as e:
            logger.error(f"Audit log export failed: {str(e)}")
            return Response(
                {"error": f"Export failed: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class AuditLogCleanupView(APIView):
    """
    API View for managing audit log cleanup and retention.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get audit log cleanup statistics and retention policy.
        """
        try:
            # Calculate statistics
            total_logs = RouterAuditLog.objects.count()
            oldest_log = RouterAuditLog.objects.order_by('timestamp').first()
            newest_log = RouterAuditLog.objects.order_by('-timestamp').first()
            
            # Default retention policy
            retention_days = 365
            cutoff_date = timezone.now() - timedelta(days=retention_days)
            logs_to_delete = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date).count()
            
            statistics = {
                'total_logs': total_logs,
                'oldest_log_date': oldest_log.timestamp.isoformat() if oldest_log else None,
                'newest_log_date': newest_log.timestamp.isoformat() if newest_log else None,
                'retention_policy': {
                    'retention_days': retention_days,
                    'cutoff_date': cutoff_date.isoformat(),
                    'logs_to_delete': logs_to_delete
                },
                'database_size_estimate': self.estimate_database_size(total_logs)
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
        """
        try:
            retention_days = int(request.data.get('retention_days', 365))
            dry_run = request.data.get('dry_run', True)
            max_deletion = request.data.get('max_deletion')
            
            if retention_days < 30:
                return Response(
                    {"error": "Retention period must be at least 30 days"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cutoff_date = timezone.now() - timedelta(days=retention_days)
            old_logs = RouterAuditLog.objects.filter(timestamp__lt=cutoff_date)
            
            if max_deletion:
                old_logs = old_logs[:int(max_deletion)]
            
            if dry_run:
                return Response({
                    'message': 'Dry run completed',
                    'logs_to_delete': old_logs.count(),
                    'cutoff_date': cutoff_date.isoformat(),
                    'retention_days': retention_days,
                    'max_deletion': max_deletion,
                    'actual_deletion': 0
                })
            else:
                # Perform actual deletion
                deleted_count = old_logs.count()
                
                # Log the cleanup action before deletion
                from network_management.models.router_management_model import RouterAuditLog
                RouterAuditLog.objects.create(
                    router=None,
                    action='audit_cleanup',
                    description=f"Audit logs cleanup: {deleted_count} records deleted",
                    user=request.user,
                    ip_address=self.get_client_ip(request),
                    changes={
                        'deleted_count': deleted_count,
                        'retention_days': retention_days,
                        'cutoff_date': cutoff_date.isoformat(),
                        'max_deletion': max_deletion
                    }
                )
                
                # Delete the old logs
                old_logs.delete()
                
                return Response({
                    'message': 'Audit logs cleanup completed',
                    'deleted_count': deleted_count,
                    'retention_days': retention_days,
                    'cutoff_date': cutoff_date.isoformat(),
                    'max_deletion': max_deletion
                })

        except Exception as e:
            logger.error(f"Audit log cleanup failed: {str(e)}")
            return Response(
                {"error": f"Cleanup failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def estimate_database_size(self, log_count):
        """
        Estimate the database size based on log count.
        
        This is a rough estimation - actual size may vary.
        """
        # Average size per audit log record in bytes (estimated)
        avg_record_size = 1024  # 1KB per record
        
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

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')

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
            if not confirm:
                return Response({
                    'warning': 'This will delete ALL audit logs. This action cannot be undone.',
                    'total_logs': RouterAuditLog.objects.count(),
                    'instructions': 'Set confirm=true in the request body to proceed.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            total_logs = RouterAuditLog.objects.count()
            RouterAuditLog.objects.all().delete()
            
            # Log the complete cleanup
            from network_management.models.router_management_model import RouterAuditLog
            RouterAuditLog.objects.create(
                router=None,
                action='audit_cleanup_complete',
                description=f"COMPLETE audit logs cleanup: {total_logs} records deleted",
                user=request.user,
                ip_address=self.get_client_ip(request),
                changes={
                    'deleted_count': total_logs,
                    'type': 'complete_cleanup'
                }
            )
            
            return Response({
                'message': 'All audit logs have been deleted',
                'deleted_count': total_logs
            })
            
        except Exception as e:
            logger.error(f"Complete audit log cleanup failed: {str(e)}")
            return Response(
                {"error": f"Complete cleanup failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )