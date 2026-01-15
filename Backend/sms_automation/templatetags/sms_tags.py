"""
Template tags for SMS automation
"""
from django import template
from django.db.models import Count, Q
from django.utils.html import format_html
from django.utils import timezone
from datetime import timedelta

register = template.Library()


@register.filter
def sms_status_badge(status):
    """Create a badge for SMS status"""
    status_colors = {
        'pending': 'bg-blue-100 text-blue-800',
        'queued': 'bg-cyan-100 text-cyan-800',
        'sending': 'bg-orange-100 text-orange-800',
        'sent': 'bg-green-100 text-green-800',
        'delivered': 'bg-darkgreen-100 text-darkgreen-800',
        'failed': 'bg-red-100 text-red-800',
        'cancelled': 'bg-gray-100 text-gray-800',
        'expired': 'bg-brown-100 text-brown-800',
        'rejected': 'bg-darkred-100 text-darkred-800'
    }
    
    status_display = {
        'pending': 'Pending',
        'queued': 'Queued',
        'sending': 'Sending',
        'sent': 'Sent',
        'delivered': 'Delivered',
        'failed': 'Failed',
        'cancelled': 'Cancelled',
        'expired': 'Expired',
        'rejected': 'Rejected'
    }
    
    color_class = status_colors.get(status, 'bg-gray-100 text-gray-800')
    display_text = status_display.get(status, status.capitalize())
    
    return format_html(
        '<span class="px-2 py-1 text-xs font-medium rounded-full {}">{}</span>',
        color_class, display_text
    )


@register.filter
def sms_priority_badge(priority):
    """Create a badge for SMS priority"""
    priority_colors = {
        'low': 'bg-gray-100 text-gray-800',
        'normal': 'bg-blue-100 text-blue-800',
        'high': 'bg-orange-100 text-orange-800',
        'urgent': 'bg-red-100 text-red-800'
    }
    
    priority_display = {
        'low': 'Low',
        'normal': 'Normal',
        'high': 'High',
        'urgent': 'Urgent'
    }
    
    color_class = priority_colors.get(priority, 'bg-gray-100 text-gray-800')
    display_text = priority_display.get(priority, priority.capitalize())
    
    return format_html(
        '<span class="px-2 py-1 text-xs font-medium rounded-full {}">{}</span>',
        color_class, display_text
    )


@register.filter
def gateway_health_badge(health_status):
    """Create a badge for gateway health status"""
    health_colors = {
        'healthy': 'bg-green-100 text-green-800',
        'inactive': 'bg-gray-100 text-gray-800',
        'offline': 'bg-orange-100 text-orange-800',
        'no_balance': 'bg-red-100 text-red-800',
        'poor_performance': 'bg-yellow-100 text-yellow-800'
    }
    
    health_display = {
        'healthy': 'Healthy',
        'inactive': 'Inactive',
        'offline': 'Offline',
        'no_balance': 'No Balance',
        'poor_performance': 'Poor Performance'
    }
    
    color_class = health_colors.get(health_status, 'bg-gray-100 text-gray-800')
    display_text = health_display.get(health_status, health_status.replace('_', ' ').title())
    
    return format_html(
        '<span class="px-2 py-1 text-xs font-medium rounded-full {}">{}</span>',
        color_class, display_text
    )


@register.filter
def format_phone_number(phone):
    """Format phone number for display"""
    if not phone:
        return ''
    
    # Remove all non-digit characters
    import re
    cleaned = re.sub(r'\D', '', str(phone))
    
    if cleaned.startswith('254') and len(cleaned) == 12:
        return f"+{cleaned}"
    elif cleaned.startswith('0') and len(cleaned) == 10:
        return f"+254{cleaned[1:]}"
    else:
        return phone


@register.filter
def message_preview(message, length=50):
    """Get message preview"""
    if not message:
        return ''
    
    if len(message) <= length:
        return message
    
    return f"{message[:length]}..."


@register.filter
def time_ago(datetime_obj):
    """Get human-readable time ago"""
    if not datetime_obj:
        return ''
    
    delta = timezone.now() - datetime_obj
    
    if delta.days > 365:
        years = delta.days // 365
        return f"{years} year{'s' if years > 1 else ''} ago"
    elif delta.days > 30:
        months = delta.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
    elif delta.days > 0:
        return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
    elif delta.seconds >= 3600:
        hours = delta.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif delta.seconds >= 60:
        minutes = delta.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"


@register.filter
def delivery_time(duration):
    """Format delivery time"""
    if not duration:
        return 'N/A'
    
    seconds = duration.total_seconds()
    
    if seconds < 60:
        return f"{seconds:.0f} seconds"
    elif seconds < 3600:
        return f"{seconds/60:.1f} minutes"
    else:
        return f"{seconds/3600:.1f} hours"


@register.filter
def cost_display(cost, currency='KES'):
    """Format cost for display"""
    if cost is None:
        return 'N/A'
    
    return f"{currency} {cost:,.4f}"


@register.filter
def success_rate_display(rate):
    """Format success rate for display"""
    if rate is None:
        return 'N/A'
    
    return f"{rate:.1f}%"


@register.filter
def message_parts_info(parts, characters):
    """Get message parts information"""
    if parts == 1:
        return f"1 part ({characters}/160 chars)"
    else:
        total_capacity = 306 + (parts - 2) * 153
        return f"{parts} parts ({characters}/{total_capacity} chars)"


@register.simple_tag
def get_sms_statistics(days=30):
    """Get SMS statistics for template"""
    from sms_automation.models import SMSMessage
    from django.db.models import Count, Q
    
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    stats = SMSMessage.objects.filter(
        created_at__date__range=[start_date, end_date]
    ).aggregate(
        total=Count('id'),
        sent=Count('id', filter=Q(status='sent')),
        delivered=Count('id', filter=Q(status='delivered')),
        failed=Count('id', filter=Q(status='failed'))
    )
    
    return {
        'total': stats['total'] or 0,
        'sent': stats['sent'] or 0,
        'delivered': stats['delivered'] or 0,
        'failed': stats['failed'] or 0,
        'period': f"Last {days} days"
    }


@register.inclusion_tag('sms_automation/includes/gateway_status.html')
def show_gateway_status():
    """Show gateway status in template"""
    from sms_automation.models import SMSGatewayConfig
    from sms_automation.services import SMSService
    
    gateways = SMSGatewayConfig.objects.filter(is_active=True)
    sms_service = SMSService()
    
    gateway_status = []
    for gateway in gateways:
        status = sms_service.get_gateway_status(gateway)
        gateway_status.append({
            'id': gateway.id,
            'name': gateway.name,
            'type': gateway.gateway_type,
            'status': status.get('status', 'unknown'),
            'balance': status.get('balance', 0),
            'is_online': gateway.is_online,
            'messages_today': status.get('messages_today', 0)
        })
    
    return {
        'gateways': gateway_status,
        'total': len(gateway_status),
        'online': len([g for g in gateway_status if g['is_online']])
    }


@register.inclusion_tag('sms_automation/includes/queue_status.html')
def show_queue_status():
    """Show queue status in template"""
    from sms_automation.models import SMSQueue
    
    queue_stats = SMSQueue.objects.aggregate(
        pending=Count('id', filter=Q(status='pending')),
        processing=Count('id', filter=Q(status='processing')),
        failed=Count('id', filter=Q(status='failed'))
    )
    
    return {
        'pending': queue_stats['pending'] or 0,
        'processing': queue_stats['processing'] or 0,
        'failed': queue_stats['failed'] or 0,
        'total': (queue_stats['pending'] or 0) + 
                (queue_stats['processing'] or 0) + 
                (queue_stats['failed'] or 0)
    }