"""
Operation Log Model for comprehensive system logging
"""

from django.db import models
from django.utils import timezone
import uuid
import logging

logger = logging.getLogger(__name__)


class OperationLog(models.Model):
    """
    Comprehensive logging for all system operations
    """
    
    OPERATION_TYPES = (
        ('subscription_creation', 'Subscription Creation'),
        ('subscription_activation', 'Subscription Activation'),
        ('payment_processing', 'Payment Processing'),
        ('router_integration', 'Router Integration'),
        ('client_operation', 'Client Operation'),
        ('system_maintenance', 'System Maintenance'),
        ('error', 'Error'),
        ('warning', 'Warning'),
        ('info', 'Information'),
    )
    
    SEVERITY_LEVELS = (
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    )
    
    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Operation Details
    operation_type = models.CharField(max_length=50, choices=OPERATION_TYPES, db_index=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='info', db_index=True)
    
    # References
    subscription = models.ForeignKey(
        'Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='operation_logs'
    )
    
    client_operation = models.ForeignKey(
        'ClientOperation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='operation_logs'
    )
    
    # Log Content
    description = models.TextField(help_text="Log description")
    details = models.JSONField(default=dict, blank=True, help_text="Additional details")
    
    # Error Information
    error_message = models.TextField(blank=True, null=True)
    error_traceback = models.TextField(blank=True, null=True)
    error_code = models.CharField(max_length=100, blank=True, null=True)
    
    # Performance Metrics
    duration_ms = models.PositiveIntegerField(default=0, help_text="Duration in milliseconds")
    
    # Source Information
    source_module = models.CharField(max_length=100, db_index=True)
    source_function = models.CharField(max_length=100, db_index=True)
    source_ip = models.GenericIPAddressField(blank=True, null=True, db_index=True)
    
    # Request Tracking
    request_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    correlation_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = 'Operation Log'
        verbose_name_plural = 'Operation Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['operation_type', 'severity']),
            models.Index(fields=['subscription', 'created_at']),
            models.Index(fields=['source_module', 'created_at']),
            models.Index(fields=['request_id']),
            models.Index(fields=['correlation_id']),
        ]
    
    def __str__(self):
        return f"{self.get_operation_type_display()} - {self.description[:50]}"
    
    @classmethod
    def log_operation(cls, operation_type: str, severity: str, description: str, 
                     subscription=None, client_operation=None, details: dict = None,
                     source_module: str = 'unknown', source_function: str = 'unknown',
                     duration_ms: int = 0, error_message: str = None,
                     request_id: str = None, correlation_id: str = None,
                     source_ip: str = None):
        """Create an operation log entry"""
        try:
            log_entry = cls.objects.create(
                operation_type=operation_type,
                severity=severity,
                subscription=subscription,
                client_operation=client_operation,
                description=description,
                details=details or {},
                error_message=error_message,
                duration_ms=duration_ms,
                source_module=source_module,
                source_function=source_function,
                source_ip=source_ip,
                request_id=request_id,
                correlation_id=correlation_id,
                metadata={
                    'timestamp': timezone.now().isoformat(),
                    'module': source_module,
                    'function': source_function
                }
            )
            
            # Also log to Django's logging system
            log_level = {
                'debug': logger.debug,
                'info': logger.info,
                'warning': logger.warning,
                'error': logger.error,
                'critical': logger.critical,
            }.get(severity, logger.info)
            
            log_message = f"[{operation_type}] {description}"
            if error_message:
                log_message += f" | Error: {error_message}"
            
            log_level(log_message, extra={
                'operation_type': operation_type,
                'subscription_id': subscription.id if subscription else None,
                'client_operation_id': client_operation.id if client_operation else None,
                'duration_ms': duration_ms,
            })
            
            return log_entry
            
        except Exception as e:
            logger.error(f"Failed to create operation log: {e}")
            return None
    
    @classmethod
    def get_recent_logs(cls, hours: int = 24, severity: str = None, operation_type: str = None):
        """Get recent logs with filtering"""
        queryset = cls.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(hours=hours)
        )
        
        if severity:
            queryset = queryset.filter(severity=severity)
        
        if operation_type:
            queryset = queryset.filter(operation_type=operation_type)
        
        return queryset.order_by('-created_at')
    
    @classmethod
    def get_error_stats(cls, hours: int = 24):
        """Get error statistics"""
        since = timezone.now() - timezone.timedelta(hours=hours)
        
        stats = cls.objects.filter(
            created_at__gte=since,
            severity__in=['error', 'critical']
        ).aggregate(
            total_errors=models.Count('id'),
            by_module=models.Count('id', distinct=True, filter=models.Q(source_module__isnull=False)),
            avg_duration=models.Avg('duration_ms'),
        )
        
        # Get error distribution by module
        module_distribution = cls.objects.filter(
            created_at__gte=since,
            severity__in=['error', 'critical']
        ).values('source_module').annotate(
            error_count=models.Count('id')
        ).order_by('-error_count')
        
        return {
            'total_errors': stats['total_errors'] or 0,
            'unique_modules_with_errors': stats['by_module'] or 0,
            'average_duration_ms': round(stats['avg_duration'] or 0, 2),
            'module_distribution': list(module_distribution),
            'time_range_hours': hours,
            'timestamp': timezone.now().isoformat(),
        }

