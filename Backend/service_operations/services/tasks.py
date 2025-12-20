"""
Celery tasks for asynchronous operations in service operations
Production-ready with comprehensive error handling, retry logic, and monitoring
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from celery import Celery, Task
from celery.exceptions import MaxRetriesExceededError
from django.conf import settings
from django.utils import timezone
from kombu import Exchange, Queue
from django.db.models import Count, Avg, F

from service_operations.models import OperationLog, Subscription, ActivationQueue
from service_operations.services.subscription_service import SubscriptionService
from service_operations.services.integration_service import IntegrationService
from service_operations.services.activation_service import ActivationService
from service_operations.services.monitoring_service import MonitoringService
from service_operations.models.subscription_models import UsageTracking
from service_operations.utils.metrics import record_metric, increment_counter, measure_time

logger = logging.getLogger(__name__)

# Configure Celery
app = Celery('service_operations')

# Using Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Custom task base class
class ServiceOperationsTask(Task):
    """
    Custom Celery task base class with enhanced error handling and monitoring
    """
    
    autoretry_for = (Exception,)
    max_retries = 3
    retry_backoff = True
    retry_backoff_max = 600  # 10 minutes
    retry_jitter = True
    
    # Default queue
    queue = 'default'
    
    # Time limits (in seconds)
    soft_time_limit = 300  # 5 minutes
    time_limit = 600       # 10 minutes
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure with comprehensive logging"""
        logger.error(
            f"Task {self.name} failed: {exc}",
            extra={
                'task_id': task_id,
                'task_name': self.name,
                'args': args,
                'kwargs': kwargs,
                'exception': str(exc),
                'traceback': einfo.traceback
            },
            exc_info=True
        )
        
        # Log operation
        OperationLog.log_operation(
            operation_type=f'task_failed_{self.name}',
            severity='error',
            description=f'Task {self.name} failed: {exc}',
            details={
                'task_id': task_id,
                'task_name': self.name,
                'args': args,
                'kwargs': kwargs,
                'exception': str(exc),
                'retry_count': self.request.retries if hasattr(self.request, 'retries') else 0
            },
            source_module='tasks',
            source_function='on_failure'
        )
        
        # Record metrics
        increment_counter('task_failure', tags={
            'task_name': self.name,
            'exception_type': type(exc).__name__
        })
        
        super().on_failure(exc, task_id, args, kwargs, einfo)
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Handle task retry"""
        logger.warning(
            f"Task {self.name} retrying (attempt {self.request.retries + 1}/{self.max_retries})",
            extra={
                'task_id': task_id,
                'task_name': self.name,
                'retry_count': self.request.retries + 1,
                'max_retries': self.max_retries,
                'exception': str(exc)
            }
        )
        
        increment_counter('task_retry', tags={
            'task_name': self.name,
            'retry_count': self.request.retries + 1
        })
        
        super().on_retry(exc, task_id, args, kwargs, einfo)
    
    def on_success(self, retval, task_id, args, kwargs):
        """Handle task success"""
        logger.info(
            f"Task {self.name} completed successfully",
            extra={
                'task_id': task_id,
                'task_name': self.name,
                'result': retval
            }
        )
        
        increment_counter('task_success', tags={'task_name': self.name})
        
        super().on_success(retval, task_id, args, kwargs)
    
    def run(self, *args, **kwargs):
        """Main task execution with monitoring"""
        task_start = timezone.now()
        
        try:
            with measure_time(f'task.{self.name}.duration'):
                result = super().run(*args, **kwargs)
            
            # Record success metrics
            execution_time = (timezone.now() - task_start).total_seconds() * 1000
            record_metric(f'task.{self.name}.execution_time', value=execution_time)
            
            return result
            
        except Exception as e:
            # Record failure metrics
            execution_time = (timezone.now() - task_start).total_seconds() * 1000
            record_metric(f'task.{self.name}.execution_time', value=execution_time, tags={'status': 'error'})
            raise


# Configure task routes and queues
app.conf.task_routes = {
    'service_operations.tasks.async_process_subscription_activation': {'queue': 'activation'},
    'service_operations.tasks.async_notify_external_systems': {'queue': 'notifications'},
    'service_operations.tasks.async_generate_subscription_report': {'queue': 'reports'},
    'service_operations.tasks.*': {'queue': 'default'},
}

# Define custom queues
app.conf.task_queues = (
    Queue('default', Exchange('default'), routing_key='default'),
    Queue('activation', Exchange('activation'), routing_key='activation'),
    Queue('notifications', Exchange('notifications'), routing_key='notifications'),
    Queue('reports', Exchange('reports'), routing_key='reports'),
    Queue('monitoring', Exchange('monitoring'), routing_key='monitoring'),
)

# Task result settings
app.conf.task_track_started = True
app.conf.task_serializer = 'json'
app.conf.result_serializer = 'json'
app.conf.accept_content = ['json']
app.conf.result_expires = 3600  # 1 hour
app.conf.worker_prefetch_multiplier = 1
app.conf.worker_concurrency = 4


@app.task(base=ServiceOperationsTask, bind=True)
def async_process_subscription_activation(self, 
                                         subscription_id: str,
                                         priority: int = 4,
                                         initiated_by: str = 'system'):
    """
    Asynchronously process subscription activation
    
    This task handles the activation of a subscription, including:
    1. Network configuration via NetworkAdapter
    2. External system notifications
    3. Status updates and error handling
    4. Retry logic for transient failures
    
    Args:
        subscription_id: The subscription ID to activate
        priority: Activation priority (1-5, where 1 is highest)
        initiated_by: Who initiated the activation
    """
    logger.info(f"Starting async activation for subscription {subscription_id}")
    
    # Record task start
    increment_counter('activation_task_started', tags={
        'subscription_id': subscription_id,
        'priority': priority,
        'initiated_by': initiated_by
    })
    
    try:
        # Get subscription
        subscription = Subscription.objects.get(id=subscription_id, is_active=True)
        
        # Check if already activated
        if subscription.status == 'active':
            logger.warning(f"Subscription {subscription_id} is already active")
            return {
                'success': True,
                'message': 'Subscription already active',
                'subscription_id': subscription_id,
                'status': 'already_active'
            }
        
        # Verify subscription can be activated
        if not subscription.can_be_activated:
            error_msg = f"Cannot activate subscription {subscription_id} (status: {subscription.status})"
            logger.error(error_msg)
            
            # Create activation failure record
            ActivationQueue.objects.create(
                subscription=subscription,
                activation_type='async_activation',
                priority=priority,
                status='failed',
                error_message=error_msg,
                metadata={
                    'initiated_by': initiated_by,
                    'task_id': self.request.id,
                    'retry_count': self.request.retries if hasattr(self.request, 'retries') else 0
                }
            )
            
            raise ValueError(error_msg)
        
        # Update activation status
        activation_record = ActivationQueue.objects.create(
            subscription=subscription,
            activation_type='async_activation',
            priority=priority,
            status='processing',
            metadata={
                'initiated_by': initiated_by,
                'task_id': self.request.id,
                'started_at': timezone.now().isoformat()
            }
        )
        
        # Process activation using ActivationService
        with measure_time('activation_service.process'):
            activation_result = ActivationService.process_subscription_activation(
                subscription_id=subscription_id,
                activation_id=str(activation_record.id),
                priority=priority
            )
        
        # Update activation record
        activation_record.status = 'completed' if activation_result.get('success') else 'failed'
        activation_record.error_message = activation_result.get('error')
        activation_record.completed_at = timezone.now()
        activation_record.metadata = {
            **activation_record.metadata,
            'activation_result': activation_result,
            'completed_at': timezone.now().isoformat()
        }
        activation_record.save()
        
        # Update subscription if activation successful
        if activation_result.get('success'):
            subscription.status = 'active'
            subscription.activation_successful = True
            subscription.activation_completed_at = timezone.now()
            subscription.save(update_fields=['status', 'activation_successful', 'activation_completed_at', 'updated_at'])
            
            logger.info(f"Successfully activated subscription {subscription_id}")
            
            # Record success metrics
            increment_counter('subscription_activated_async', tags={
                'subscription_id': subscription_id,
                'client_type': subscription.client_type,
                'access_method': subscription.access_method
            })
            
            # Notify external systems
            async_notify_external_systems.delay(
                event_type='subscription_activated_async',
                data={
                    'subscription_id': subscription_id,
                    'client_id': str(subscription.client_id),
                    'activation_id': str(activation_record.id),
                    'activated_at': timezone.now().isoformat(),
                    'initiated_by': initiated_by
                },
                systems=['network_management', 'user_management']
            )
            
            return {
                'success': True,
                'message': 'Subscription activated successfully',
                'subscription_id': subscription_id,
                'activation_id': str(activation_record.id),
                'activation_result': activation_result,
                'initiated_by': initiated_by
            }
        else:
            # Activation failed
            error_msg = activation_result.get('error', 'Activation failed')
            logger.error(f"Activation failed for subscription {subscription_id}: {error_msg}")
            
            subscription.activation_error = error_msg
            subscription.save(update_fields=['activation_error', 'updated_at'])
            
            # Record failure metrics
            increment_counter('activation_failed', tags={
                'subscription_id': subscription_id,
                'error': error_msg
            })
            
            raise Exception(f"Activation failed: {error_msg}")
            
    except Subscription.DoesNotExist:
        error_msg = f"Subscription {subscription_id} not found"
        logger.error(error_msg)
        
        increment_counter('activation_subscription_not_found', tags={'subscription_id': subscription_id})
        
        raise ValueError(error_msg)
        
    except Exception as e:
        logger.error(f"Failed to process activation for subscription {subscription_id}: {e}", exc_info=True)
        
        # Log operation failure
        OperationLog.log_operation(
            operation_type='async_activation_failed',
            severity='error',
            subscription_id=subscription_id,
            description=f'Async activation failed: {str(e)}',
            details={
                'subscription_id': subscription_id,
                'priority': priority,
                'initiated_by': initiated_by,
                'task_id': self.request.id,
                'retry_count': self.request.retries if hasattr(self.request, 'retries') else 0,
                'error': str(e)
            },
            source_module='tasks',
            source_function='async_process_subscription_activation'
        )
        
        raise


@app.task(base=ServiceOperationsTask, bind=True)
def async_notify_external_systems(self,
                                 event_type: str,
                                 data: Dict[str, Any],
                                 systems: Optional[List[str]] = None,
                                 priority: int = 3):
    """
    Asynchronously notify external systems about service operations events
    
    Features:
    1. Selective notification to specific systems
    2. Retry logic for failed notifications
    3. Comprehensive error handling
    4. Notification tracking and auditing
    
    Args:
        event_type: Type of event (e.g., 'subscription_created', 'payment_received')
        data: Event data containing relevant information
        systems: List of systems to notify (default: all)
        priority: Notification priority (1-5)
    """
    logger.info(f"Starting async notification for event: {event_type}")
    
    # Record notification start
    increment_counter('notification_task_started', tags={
        'event_type': event_type,
        'priority': priority
    })
    
    try:
        # Use IntegrationService for notifications
        with measure_time('integration_service.notify'):
            notification_result = IntegrationService.notify_external_systems(
                event_type=event_type,
                data=data,
                systems=systems
            )
        
        # Log notification result
        OperationLog.log_operation(
            operation_type=f'async_notification_{event_type}',
            severity='info',
            description=f'Async notification sent for {event_type}',
            details={
                'event_type': event_type,
                'data': data,
                'systems': systems,
                'notification_result': notification_result,
                'task_id': self.request.id
            },
            source_module='tasks',
            source_function='async_notify_external_systems'
        )
        
        # Record metrics based on result
        if notification_result.get('success'):
            increment_counter('notification_success', tags={'event_type': event_type})
            
            success_count = notification_result.get('success_count', 0)
            failure_count = notification_result.get('failure_count', 0)
            
            if failure_count == 0:
                record_metric('notification.all_systems_successful', tags={'event_type': event_type})
            elif success_count > 0:
                record_metric('notification.partial_success', tags={'event_type': event_type})
            
            logger.info(f"Notification completed for {event_type}: {success_count} successful, {failure_count} failed")
            
        else:
            increment_counter('notification_failed', tags={'event_type': event_type})
            logger.error(f"Notification failed for {event_type}: {notification_result.get('error')}")
        
        return notification_result
        
    except Exception as e:
        logger.error(f"Failed to send notification for event {event_type}: {e}", exc_info=True)
        
        increment_counter('notification_task_failed', tags={
            'event_type': event_type,
            'exception_type': type(e).__name__
        })
        
        # Log failure
        OperationLog.log_operation(
            operation_type='async_notification_failed',
            severity='error',
            description=f'Async notification failed: {str(e)}',
            details={
                'event_type': event_type,
                'data': data,
                'systems': systems,
                'error': str(e),
                'task_id': self.request.id
            },
            source_module='tasks',
            source_function='async_notify_external_systems'
        )
        
        raise


@app.task(base=ServiceOperationsTask, bind=True)
def async_generate_subscription_report(self,
                                      report_type: str,
                                      parameters: Dict[str, Any],
                                      requested_by: str = 'system',
                                      format: str = 'pdf'):
    """
    Asynchronously generate subscription reports
    
    Supported report types:
    1. daily_activations: Daily activation statistics
    2. subscription_summary: Overall subscription statistics
    3. client_activity: Client subscription activity
    4. revenue_report: Subscription revenue report
    5. usage_analytics: Subscription usage analytics
    
    Args:
        report_type: Type of report to generate
        parameters: Report parameters (date ranges, filters, etc.)
        requested_by: Who requested the report
        format: Output format (pdf, csv, excel, html)
    """
    logger.info(f"Starting async report generation: {report_type}")
    
    # Record report generation start
    increment_counter('report_generation_started', tags={
        'report_type': report_type,
        'format': format,
        'requested_by': requested_by
    })
    
    try:
        report_data = {}
        
        # Generate report based on type
        if report_type == 'daily_activations':
            report_data = _generate_daily_activations_report(parameters)
            
        elif report_type == 'subscription_summary':
            report_data = _generate_subscription_summary_report(parameters)
            
        elif report_type == 'client_activity':
            report_data = _generate_client_activity_report(parameters)
            
        elif report_type == 'revenue_report':
            report_data = _generate_revenue_report(parameters)
            
        elif report_type == 'usage_analytics':
            report_data = _generate_usage_analytics_report(parameters)
            
        else:
            error_msg = f"Unknown report type: {report_type}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Format the report
        formatted_report = _format_report(report_data, format)
        
        # Store report result (in production, would save to storage)
        report_id = f"report_{int(timezone.now().timestamp())}_{hash(str(report_data))}"
        
        # Log report generation
        OperationLog.log_operation(
            operation_type='report_generated',
            severity='info',
            description=f'Report {report_type} generated successfully',
            details={
                'report_type': report_type,
                'report_id': report_id,
                'parameters': parameters,
                'requested_by': requested_by,
                'format': format,
                'data_size': len(str(report_data)),
                'generated_at': timezone.now().isoformat()
            },
            source_module='tasks',
            source_function='async_generate_subscription_report'
        )
        
        # Record success metrics
        increment_counter('report_generated', tags={
            'report_type': report_type,
            'format': format
        })
        
        logger.info(f"Report {report_type} generated successfully (ID: {report_id})")
        
        return {
            'success': True,
            'report_id': report_id,
            'report_type': report_type,
            'generated_at': timezone.now().isoformat(),
            'format': format,
            'data_preview': report_data.get('summary', {}),
            'download_url': f"/api/reports/download/{report_id}"  # Placeholder
        }
        
    except Exception as e:
        logger.error(f"Failed to generate report {report_type}: {e}", exc_info=True)
        
        increment_counter('report_generation_failed', tags={
            'report_type': report_type,
            'exception_type': type(e).__name__
        })
        
        # Log failure
        OperationLog.log_operation(
            operation_type='report_generation_failed',
            severity='error',
            description=f'Report generation failed: {str(e)}',
            details={
                'report_type': report_type,
                'parameters': parameters,
                'requested_by': requested_by,
                'format': format,
                'error': str(e)
            },
            source_module='tasks',
            source_function='async_generate_subscription_report'
        )
        
        raise


def _generate_daily_activations_report(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate daily activations report"""
    start_date = parameters.get('start_date', timezone.now() - timedelta(days=30))
    end_date = parameters.get('end_date', timezone.now())
    
    activations = ActivationQueue.objects.filter(
        status='completed',
        completed_at__gte=start_date,
        completed_at__lte=end_date
    ).values('completed_at__date').annotate(
        count=Count('id'),
        avg_duration=Avg(F('completed_at') - F('created_at'))
    ).order_by('completed_at__date')
    
    return {
        'report_type': 'daily_activations',
        'period': {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        },
        'summary': {
            'total_activations': sum(item['count'] for item in activations),
            'average_daily_activations': sum(item['count'] for item in activations) / max(len(activations), 1),
            'date_range_days': (end_date - start_date).days
        },
        'daily_data': list(activations)
    }


def _generate_subscription_summary_report(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate subscription summary report"""
    stats_result = SubscriptionService.get_statistics(
        period_days=parameters.get('period_days', 30)
    )
    
    return {
        'report_type': 'subscription_summary',
        'generated_at': timezone.now().isoformat(),
        'statistics': stats_result if stats_result.get('success') else {},
        'parameters': parameters
    }


def _generate_client_activity_report(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate client activity report"""
    # This would include client subscription history, usage patterns, etc.
    return {
        'report_type': 'client_activity',
        'generated_at': timezone.now().isoformat(),
        'parameters': parameters,
        'data': {}  # Placeholder for actual data
    }


def _generate_revenue_report(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate revenue report"""
    # This would integrate with PaymentAdapter for revenue data
    return {
        'report_type': 'revenue_report',
        'generated_at': timezone.now().isoformat(),
        'parameters': parameters,
        'data': {}  # Placeholder for actual data
    }


def _generate_usage_analytics_report(parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate usage analytics report"""
    # This would analyze subscription usage patterns
    return {
        'report_type': 'usage_analytics',
        'generated_at': timezone.now().isoformat(),
        'parameters': parameters,
        'data': {}  # Placeholder for actual data
    }


def _format_report(report_data: Dict[str, Any], format: str) -> Dict[str, Any]:
    """Format report data for output"""
    if format == 'pdf':
        # PDF formatting logic (would use a library like ReportLab)
        return {
            'content_type': 'application/pdf',
            'content': f"PDF Report: {report_data['report_type']}",
            'filename': f"{report_data['report_type']}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        }
    
    elif format == 'csv':
        # CSV formatting logic
        return {
            'content_type': 'text/csv',
            'content': f"CSV Report: {report_data['report_type']}",
            'filename': f"{report_data['report_type']}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    
    elif format == 'excel':
        # Excel formatting logic
        return {
            'content_type': 'application/vnd.ms-excel',
            'content': f"Excel Report: {report_data['report_type']}",
            'filename': f"{report_data['report_type']}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        }
    
    else:  # html or default
        return {
            'content_type': 'text/html',
            'content': report_data,
            'filename': f"{report_data['report_type']}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.html"
        }


@app.task(base=ServiceOperationsTask, bind=True)
def async_process_expired_subscriptions(self):
    """
    Process expired subscriptions (scheduled task)
    
    This task should be scheduled to run daily to:
    1. Mark expired subscriptions
    2. Notify clients about expiration
    3. Process auto-renewals
    4. Clean up expired data
    """
    logger.info("Starting expired subscription processing")
    
    try:
        # Process expired subscriptions using SubscriptionService
        with measure_time('subscription_service.process_expired'):
            result = SubscriptionService.process_expired_subscriptions()
        
        # Record metrics
        processed_count = result.get('processed_count', 0)
        failed_count = result.get('failed_count', 0)
        
        increment_counter('expired_subscriptions_processed', value=processed_count)
        
        if failed_count > 0:
            increment_counter('expired_subscriptions_failed', value=failed_count)
        
        logger.info(f"Processed {processed_count} expired subscriptions ({failed_count} failed)")
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to process expired subscriptions: {e}", exc_info=True)
        
        increment_counter('expired_subscriptions_task_failed')
        
        raise


@app.task(base=ServiceOperationsTask, bind=True)
def async_auto_renew_subscriptions(self):
    """
    Auto-renew subscriptions (scheduled task)
    
    This task should be scheduled to run daily to:
    1. Find subscriptions due for renewal
    2. Process auto-renewals
    3. Handle payment processing
    4. Create new subscriptions
    """
    logger.info("Starting auto-renew subscription processing")
    
    try:
        # Process auto-renewals using SubscriptionService
        with measure_time('subscription_service.auto_renew'):
            result = SubscriptionService.auto_renew_subscriptions()
        
        # Record metrics
        renewed_count = result.get('renewed_count', 0)
        failed_count = result.get('failed_count', 0)
        
        increment_counter('subscriptions_auto_renewed', value=renewed_count)
        
        if failed_count > 0:
            increment_counter('subscriptions_auto_renew_failed', value=failed_count)
        
        logger.info(f"Auto-renewed {renewed_count} subscriptions ({failed_count} failed)")
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to auto-renew subscriptions: {e}", exc_info=True)
        
        increment_counter('auto_renew_task_failed')
        
        raise


@app.task(base=ServiceOperationsTask, bind=True)
def async_health_check(self, services: List[str] = None):
    """
    Perform comprehensive health checks (scheduled task)
    
    This task should be scheduled to run periodically to:
    1. Check service health
    2. Monitor external dependencies
    3. Alert on issues
    4. Generate health reports
    """
    logger.info("Starting comprehensive health check")
    
    try:
        health_results = {}
        
        # Check SubscriptionService health
        if not services or 'subscription_service' in services:
            with measure_time('health_check.subscription_service'):
                subscription_health = SubscriptionService.health_check()
                health_results['subscription_service'] = subscription_health
        
        # Check IntegrationService health
        if not services or 'integration_service' in services:
            with measure_time('health_check.integration_service'):
                integration_health = IntegrationService.health_check()
                health_results['integration_service'] = integration_health
        
        # Check external systems health
        if not services or 'external_systems' in services:
            with measure_time('health_check.external_systems'):
                external_health = IntegrationService.check_external_system_health()
                health_results['external_systems'] = external_health
        
        # Determine overall health
        all_healthy = all(
            result.get('status') == 'healthy' 
            for result in health_results.values() 
            if isinstance(result, dict)
        )
        
        overall_health = {
            'status': 'healthy' if all_healthy else 'degraded',
            'services': health_results,
            'checked_at': timezone.now().isoformat(),
            'task_id': self.request.id
        }
        
        # Log health check
        OperationLog.log_operation(
            operation_type='async_health_check',
            severity='info' if all_healthy else 'warning',
            description=f'Health check completed: {"healthy" if all_healthy else "degraded"}',
            details=overall_health,
            source_module='tasks',
            source_function='async_health_check'
        )
        
        # Record metrics
        increment_counter('health_check_completed', tags={'status': 'healthy' if all_healthy else 'degraded'})
        
        # Alert if unhealthy
        if not all_healthy:
            logger.warning("Health check detected issues", extra={'health_results': health_results})
            
            # In production, would trigger alerts (email, Slack, PagerDuty, etc.)
            async_notify_external_systems.delay(
                event_type='health_check_failed',
                data={
                    'health_results': health_results,
                    'overall_status': 'degraded',
                    'checked_at': timezone.now().isoformat()
                },
                systems=['monitoring']
            )
        
        logger.info(f"Health check completed: {'healthy' if all_healthy else 'degraded'}")
        
        return overall_health
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        
        increment_counter('health_check_failed')
        
        # Log failure
        OperationLog.log_operation(
            operation_type='health_check_failed',
            severity='error',
            description=f'Health check failed: {str(e)}',
            details={
                'error': str(e),
                'task_id': self.request.id
            },
            source_module='tasks',
            source_function='async_health_check'
        )
        
        raise


@app.task(base=ServiceOperationsTask, bind=True)
def async_cleanup_old_data(self, days_to_keep: int = 90):
    """
    Clean up old data (scheduled task)
    
    This task should be scheduled to run weekly to:
    1. Archive old records
    2. Delete expired data
    3. Optimize database performance
    4. Maintain data retention policies
    
    Args:
        days_to_keep: Number of days to keep data
    """
    logger.info(f"Starting data cleanup (keeping {days_to_keep} days)")
    
    try:
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        cleanup_stats = {}
        
        # Clean up old activation records
        with measure_time('cleanup.activation_records'):
            activation_count = ActivationQueue.objects.filter(
                status__in=['completed', 'failed', 'cancelled'],
                created_at__lt=cutoff_date
            ).count()
            
            deleted_activations = ActivationQueue.objects.filter(
                status__in=['completed', 'failed', 'cancelled'],
                created_at__lt=cutoff_date
            ).delete()
            
            cleanup_stats['activation_records'] = {
                'deleted': deleted_activations[0] if deleted_activations else 0,
                'total_found': activation_count
            }
        
        # Clean up old usage tracking records
        with measure_time('cleanup.usage_records'):
            usage_count = UsageTracking.objects.filter(
                session_end__lt=cutoff_date
            ).count()
            
            deleted_usage = UsageTracking.objects.filter(
                session_end__lt=cutoff_date
            ).delete()
            
            cleanup_stats['usage_records'] = {
                'deleted': deleted_usage[0] if deleted_usage else 0,
                'total_found': usage_count
            }
        
        # Clean up old operation logs
        with measure_time('cleanup.operation_logs'):
            log_count = OperationLog.objects.filter(
                created_at__lt=cutoff_date,
                severity__in=['info', 'debug']
            ).count()
            
            deleted_logs = OperationLog.objects.filter(
                created_at__lt=cutoff_date,
                severity__in=['info', 'debug']
            ).delete()
            
            cleanup_stats['operation_logs'] = {
                'deleted': deleted_logs[0] if deleted_logs else 0,
                'total_found': log_count
            }
        
        # Log cleanup
        OperationLog.log_operation(
            operation_type='data_cleanup',
            severity='info',
            description=f'Data cleanup completed (kept {days_to_keep} days)',
            details={
                'cutoff_date': cutoff_date.isoformat(),
                'days_to_keep': days_to_keep,
                'cleanup_stats': cleanup_stats,
                'task_id': self.request.id
            },
            source_module='tasks',
            source_function='async_cleanup_old_data'
        )
        
        # Record metrics
        total_deleted = sum(stats['deleted'] for stats in cleanup_stats.values())
        increment_counter('data_cleaned_up', value=total_deleted)
        
        logger.info(f"Data cleanup completed: {total_deleted} records deleted")
        
        return {
            'success': True,
            'cutoff_date': cutoff_date.isoformat(),
            'days_to_keep': days_to_keep,
            'cleanup_stats': cleanup_stats,
            'total_deleted': total_deleted
        }
        
    except Exception as e:
        logger.error(f"Data cleanup failed: {e}", exc_info=True)
        
        increment_counter('data_cleanup_failed')
        
        raise


# Task scheduling configuration
app.conf.beat_schedule = {
    'process-expired-subscriptions-daily': {
        'task': 'service_operations.tasks.async_process_expired_subscriptions',
        'schedule': timedelta(days=1),
        'options': {
            'queue': 'monitoring',
            'priority': 3
        }
    },
    'auto-renew-subscriptions-daily': {
        'task': 'service_operations.tasks.async_auto_renew_subscriptions',
        'schedule': timedelta(days=1),
        'options': {
            'queue': 'activation',
            'priority': 2
        }
    },
    'health-check-hourly': {
        'task': 'service_operations.tasks.async_health_check',
        'schedule': timedelta(hours=1),
        'options': {
            'queue': 'monitoring',
            'priority': 4
        }
    },
    'cleanup-old-data-weekly': {
        'task': 'service_operations.tasks.async_cleanup_old_data',
        'schedule': timedelta(days=7),
        'args': (90,),  # Keep 90 days of data
        'options': {
            'queue': 'default',
            'priority': 5
        }
    },
}


def init_celery():
    """Initialize Celery application"""
    # This function can be called from Django's __init__.py to ensure
    # Celery is properly configured when Django starts
    
    # Import tasks to ensure they're registered
    import service_operations.tasks
    
    logger.info("Celery tasks initialized")
    
    return app


# Convenience functions for common task operations
def schedule_subscription_activation(subscription_id: str, priority: int = 4, initiated_by: str = 'system'):
    """Schedule subscription activation task"""
    return async_process_subscription_activation.apply_async(
        args=[subscription_id, priority, initiated_by],
        queue='activation',
        priority=priority,
        retry=True,
        retry_policy={
            'max_retries': 3,
            'interval_start': 5,
            'interval_step': 10,
            'interval_max': 30,
        }
    )


def schedule_notification(event_type: str, data: Dict[str, Any], systems: List[str] = None):
    """Schedule external system notification"""
    return async_notify_external_systems.apply_async(
        args=[event_type, data, systems],
        queue='notifications',
        priority=3,
        retry=True
    )


def schedule_report_generation(report_type: str, parameters: Dict[str, Any], requested_by: str = 'system'):
    """Schedule report generation"""
    return async_generate_subscription_report.apply_async(
        args=[report_type, parameters, requested_by],
        queue='reports',
        priority=2,
        countdown=60  # Delay 1 minute to allow batching
    )