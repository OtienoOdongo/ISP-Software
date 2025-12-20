"""
Service Operations - Formatters
Formatting utilities for display and reporting
"""

from typing import Dict, Any, List, Optional
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from service_operations.utils.calculators import format_bytes_human_readable, format_seconds_human_readable


def format_subscription_summary(subscription) -> Dict[str, Any]:
    """
    Format subscription data for summary display
    """
    # Calculate usage percentages
    data_percentage = 0.0
    time_percentage = 0.0
    
    if subscription.data_limit_bytes > 0:
        data_percentage = min(100.0, (subscription.used_data_bytes / subscription.data_limit_bytes) * 100)
    
    if subscription.time_limit_seconds > 0:
        time_percentage = min(100.0, (subscription.used_time_seconds / subscription.time_limit_seconds) * 100)
    
    # Calculate time remaining
    time_remaining = "Expired"
    if subscription.end_date and subscription.end_date > timezone.now():
        delta = subscription.end_date - timezone.now()
        if delta.days > 0:
            time_remaining = f"{delta.days} days"
        else:
            hours = delta.seconds // 3600
            minutes = (delta.seconds % 3600) // 60
            time_remaining = f"{hours}h {minutes}m"
    
    # Check if near expiry
    is_near_expiry = False
    if subscription.end_date and subscription.status == 'active':
        hours_to_expiry = (subscription.end_date - timezone.now()).total_seconds() / 3600
        is_near_expiry = 0 < hours_to_expiry <= 24
    
    return {
        'id': str(subscription.id),
        'client_id': str(subscription.client_id),
        'internet_plan_id': str(subscription.internet_plan_id),
        'status': subscription.status,
        'status_display': subscription.get_status_display(),
        'client_type': subscription.client_type,
        'client_type_display': subscription.get_client_type_display(),
        'access_method': subscription.access_method,
        'access_method_display': subscription.get_access_method_display(),
        'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
        'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
        'time_remaining': time_remaining,
        'is_near_expiry': is_near_expiry,
        'is_active': subscription.is_active,
        'is_expired': subscription.is_expired,
        'usage': {
            'data': {
                'used': format_bytes_human_readable(subscription.used_data_bytes),
                'remaining': format_bytes_human_readable(subscription.remaining_data_bytes),
                'limit': format_bytes_human_readable(subscription.data_limit_bytes),
                'percentage': round(data_percentage, 1)
            },
            'time': {
                'used': format_seconds_human_readable(subscription.used_time_seconds),
                'remaining': format_seconds_human_readable(subscription.remaining_time_seconds),
                'limit': format_seconds_human_readable(subscription.time_limit_seconds),
                'percentage': round(time_percentage, 1)
            }
        },
        'activation': {
            'attempts': subscription.activation_attempts,
            'successful': subscription.activation_successful,
            'error': subscription.activation_error,
        },
        'auto_renew': subscription.auto_renew,
        'payment_reference': subscription.payment_reference,
        'payment_method': subscription.payment_method,
        'created_at': subscription.created_at.isoformat()
    }


def format_activation_queue_summary(queue_item) -> Dict[str, Any]:
    """
    Format activation queue item for summary display
    """
    status_colors = {
        'pending': 'warning',
        'processing': 'info',
        'completed': 'success',
        'failed': 'danger',
        'retrying': 'warning',
        'cancelled': 'secondary'
    }
    
    priority_labels = {
        1: {'label': 'Lowest', 'color': 'secondary'},
        2: {'label': 'Low', 'color': 'info'},
        3: {'label': 'Normal', 'color': 'primary'},
        4: {'label': 'High', 'color': 'warning'},
        5: {'label': 'Highest', 'color': 'danger'},
        6: {'label': 'Critical', 'color': 'dark'}
    }
    
    # Calculate processing time
    processing_time = None
    if queue_item.started_at:
        if queue_item.completed_at:
            processing_time = int((queue_item.completed_at - queue_item.started_at).total_seconds())
        else:
            processing_time = int((timezone.now() - queue_item.started_at).total_seconds())
    
    return {
        'id': str(queue_item.id),
        'subscription_id': str(queue_item.subscription.id),
        'client_id': str(queue_item.subscription.client_id),
        'client_type': queue_item.subscription.client_type,
        'status': {
            'value': queue_item.status,
            'label': queue_item.get_status_display(),
            'color': status_colors.get(queue_item.status, 'secondary')
        },
        'priority': {
            'value': queue_item.priority,
            'label': priority_labels.get(queue_item.priority, {'label': 'Normal', 'color': 'primary'})['label'],
            'color': priority_labels.get(queue_item.priority, {'label': 'Normal', 'color': 'primary'})['color']
        },
        'activation_type': queue_item.get_activation_type_display(),
        'retry_count': queue_item.retry_count,
        'max_retries': queue_item.max_retries,
        'processing_time_seconds': processing_time,
        'next_retry_at': queue_item.next_retry_at.isoformat() if queue_item.next_retry_at else None,
        'error_message': queue_item.error_message,
        'created_at': queue_item.created_at.isoformat(),
        'updated_at': queue_item.updated_at.isoformat()
    }


def format_operation_log_summary(log_entry) -> Dict[str, Any]:
    """
    Format operation log for summary display
    """
    severity_colors = {
        'debug': 'secondary',
        'info': 'info',
        'warning': 'warning',
        'error': 'danger',
        'critical': 'dark'
    }
    
    return {
        'id': str(log_entry.id),
        'operation_type': log_entry.get_operation_type_display(),
        'severity': {
            'value': log_entry.severity,
            'label': log_entry.get_severity_display(),
            'color': severity_colors.get(log_entry.severity, 'secondary')
        },
        'description': log_entry.description,
        'subscription_id': str(log_entry.subscription.id) if log_entry.subscription else None,
        'client_id': log_entry.client_id,
        'error_message': log_entry.error_message,
        'duration_ms': log_entry.duration_ms,
        'source': f"{log_entry.source_module}.{log_entry.source_function}",
        'created_at': log_entry.created_at.isoformat()
    }


def format_client_operation_summary(operation) -> Dict[str, Any]:
    """
    Format client operation for summary display
    """
    status_colors = {
        'pending': 'warning',
        'in_progress': 'info',
        'completed': 'success',
        'failed': 'danger',
        'cancelled': 'secondary',
        'requires_approval': 'warning'
    }
    
    # Calculate SLA status
    sla_status = 'ok'
    if operation.sla_due_at:
        now = timezone.now()
        if operation.sla_breached:
            sla_status = 'breached'
        elif operation.sla_due_at <= now:
            sla_status = 'overdue'
        elif operation.sla_due_at <= now + timedelta(hours=1):
            sla_status = 'critical'
        elif operation.sla_due_at <= now + timedelta(hours=4):
            sla_status = 'warning'
    
    # Calculate durations
    duration_seconds = None
    response_time_seconds = None
    
    if operation.started_at and operation.completed_at:
        duration_seconds = int((operation.completed_at - operation.started_at).total_seconds())
    
    if operation.started_at:
        response_time_seconds = int((operation.started_at - operation.requested_at).total_seconds())
    
    return {
        'id': str(operation.id),
        'client_id': str(operation.client_id),
        'client_type': operation.client_type,
        'subscription_id': str(operation.subscription.id) if operation.subscription else None,
        'operation_type': operation.get_operation_type_display(),
        'status': {
            'value': operation.status,
            'label': operation.get_status_display(),
            'color': status_colors.get(operation.status, 'secondary')
        },
        'title': operation.title,
        'description': operation.description,
        'source_platform': operation.get_source_platform_display(),
        'requested_at': operation.requested_at.isoformat(),
        'sla': {
            'due_at': operation.sla_due_at.isoformat() if operation.sla_due_at else None,
            'breached': operation.sla_breached,
            'status': sla_status,
        },
        'result_data': operation.result_data,
        'error_message': operation.error_message,
        'created_at': operation.created_at.isoformat(),
        'duration_seconds': duration_seconds,
        'response_time_seconds': response_time_seconds,
        'is_completed': operation.status == 'completed'
    }


def format_usage_summary(usage_record) -> Dict[str, Any]:
    """
    Format usage tracking record for summary display
    """
    # Calculate period duration
    period_seconds = (usage_record.session_end - usage_record.session_start).total_seconds()
    
    # Calculate data rate (bytes per second)
    data_rate = usage_record.data_used_bytes / period_seconds if period_seconds > 0 else 0
    
    return {
        'id': str(usage_record.id),
        'subscription_id': str(usage_record.subscription.id),
        'session_id': usage_record.session_id,
        'period': {
            'start': usage_record.session_start.isoformat(),
            'end': usage_record.session_end.isoformat(),
            'duration_hours': round(period_seconds / 3600, 2)
        },
        'usage': {
            'data': {
                'bytes': usage_record.data_used_bytes,
                'formatted': format_bytes_human_readable(usage_record.data_used_bytes),
                'rate_bps': data_rate * 8  # Convert to bits per second
            },
            'time': {
                'seconds': usage_record.session_duration_seconds,
                'formatted': format_seconds_human_readable(usage_record.session_duration_seconds)
            }
        },
        'created_at': usage_record.created_at.isoformat()
    }