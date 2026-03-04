







"""
Internet Plans - Formatters
Formatting utilities for plan data
UPDATED: Consistent snake_case naming throughout
"""

from decimal import Decimal
from typing import Dict, Any, Optional, Union
from datetime import datetime, timedelta
import re


def format_speed_display(speed_config: Dict) -> str:
    """
    Format speed for display
    """
    if not speed_config or 'value' not in speed_config:
        return "N/A"
    
    value = speed_config['value']
    unit = speed_config.get('unit', 'Mbps')
    
    if str(value).lower() == 'unlimited':
        return "Unlimited"
    
    try:
        speed_value = Decimal(str(value))
        return f"{speed_value} {unit}"
    except:
        return f"{value} {unit}"


def format_data_display(data_config: Dict) -> str:
    """
    Format data limit for display
    """
    if not data_config or 'value' not in data_config:
        return "N/A"
    
    value = data_config['value']
    unit = data_config.get('unit', 'GB')
    
    if str(value).lower() == 'unlimited':
        return "Unlimited"
    
    try:
        data_value = Decimal(str(value))
        
        # Convert to appropriate unit
        unit_upper = unit.upper()
        if unit_upper == 'KB':
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'MB'
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'GB'
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'TB'
        
        elif unit_upper == 'MB':
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'GB'
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'TB'
        
        elif unit_upper == 'GB':
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'TB'
        
        return f"{data_value:.1f} {unit}"
    except:
        return f"{value} {unit}"


def format_duration_display(duration_config: Dict) -> str:
    """
    Format duration for display
    """
    if not duration_config or 'value' not in duration_config:
        return "N/A"
    
    value = duration_config['value']
    unit = duration_config.get('unit', 'hours')
    
    if str(value).lower() == 'unlimited':
        return "Unlimited"
    
    try:
        duration_value = int(value)
        unit_lower = unit.lower()
        
        # Convert to appropriate unit
        if unit_lower == 'seconds':
            if duration_value >= 60:
                duration_value = duration_value // 60
                unit = 'minutes'
            if duration_value >= 60:
                duration_value = duration_value // 60
                unit = 'hours'
            if duration_value >= 24:
                duration_value = duration_value // 24
                unit = 'days'
        
        elif unit_lower == 'minutes':
            if duration_value >= 60:
                duration_value = duration_value // 60
                unit = 'hours'
            if duration_value >= 24:
                duration_value = duration_value // 24
                unit = 'days'
        
        elif unit_lower == 'hours':
            if duration_value >= 24:
                duration_value = duration_value // 24
                unit = 'days'
            if duration_value >= 30:
                duration_value = duration_value // 30
                unit = 'months'
        
        elif unit_lower == 'days':
            if duration_value >= 30:
                duration_value = duration_value // 30
                unit = 'months'
        
        return f"{duration_value} {unit}"
    except:
        return f"{value} {unit}"


def format_price_display(price: Union[Decimal, float, str], currency: str = 'KES') -> str:
    """
    Format price for display
    """
    try:
        price_decimal = Decimal(str(price))
        
        if price_decimal == 0:
            return "Free"
        
        # Format with thousands separators
        formatted = f"{price_decimal:,.2f}"
        return f"{currency} {formatted}"
    except:
        return f"{currency} {price}"


def format_technical_config(config: Dict) -> Dict[str, Any]:
    """
    Format technical configuration for display
    """
    if not config:
        return {}
    
    formatted = {}
    
    # Format speed - handle both snake_case and camelCase
    download_speed_key = 'download_speed' if 'download_speed' in config else 'downloadSpeed'
    upload_speed_key = 'upload_speed' if 'upload_speed' in config else 'uploadSpeed'
    
    if download_speed_key in config:
        formatted['download_speed'] = format_speed_display(config[download_speed_key])
    
    if upload_speed_key in config:
        formatted['upload_speed'] = format_speed_display(config[upload_speed_key])
    
    # Format limits
    data_limit_key = 'data_limit' if 'data_limit' in config else 'dataLimit'
    usage_limit_key = 'usage_limit' if 'usage_limit' in config else 'usageLimit'
    
    if data_limit_key in config:
        formatted['data_limit'] = format_data_display(config[data_limit_key])
    
    if usage_limit_key in config:
        formatted['usage_limit'] = format_duration_display(config[usage_limit_key])
    
    # Format validity
    validity_key = 'validity_period' if 'validity_period' in config else 'validityPeriod'
    if validity_key in config:
        formatted['validity_period'] = format_duration_display(config[validity_key])
    
    # Add other fields with snake_case normalization
    field_mappings = {
        'max_devices': ['max_devices', 'maxDevices'],
        'session_timeout': ['session_timeout', 'sessionTimeout'],
        'idle_timeout': ['idle_timeout', 'idleTimeout'],
        'bandwidth_limit': ['bandwidth_limit', 'bandwidthLimit'],
        'mac_binding': ['mac_binding', 'macBinding'],
        'ip_pool': ['ip_pool', 'ipPool'],
        'service_name': ['service_name', 'serviceName'],
        'mtu': ['mtu']
    }
    
    for snake_field, possible_keys in field_mappings.items():
        for key in possible_keys:
            if key in config:
                formatted[snake_field] = config[key]
                break
    
    return formatted


def format_plan_summary(plan) -> Dict[str, Any]:
    """
    Format plan summary for API responses
    """
    if not plan:
        return {}
    
    try:
        summary = {
            'id': str(plan.id),
            'name': plan.name,
            'category': plan.category,
            'plan_type': plan.plan_type,
            'price': format_price_display(plan.price),
            'price_value': float(plan.price),
            'description': plan.description,
            'access_methods': plan.get_enabled_access_methods(),
            'access_type': plan.get_access_type(),
            'priority_level': plan.priority_level,
            'router_specific': plan.router_specific,
            'fup_policy': plan.fup_policy,
            'fup_threshold': plan.fup_threshold,
            'purchases': plan.purchases,
            'active': plan.active,
            'created_at': plan.created_at.isoformat() if plan.created_at else None,
            'updated_at': plan.updated_at.isoformat() if plan.updated_at else None,
            'technical_config': {}
        }
        
        # Add technical configuration for each access method
        for method in plan.get_enabled_access_methods():
            config = plan.get_config_for_method(method)
            summary['technical_config'][method] = format_technical_config(config)
        
        return summary
    except Exception as e:
        return {
            'id': str(plan.id) if hasattr(plan, 'id') else 'unknown',
            'name': getattr(plan, 'name', 'Unknown Plan'),
            'error': str(e)
        }


def format_discount_summary(discount) -> Dict[str, Any]:
    """
    Format discount summary for display
    """
    if not discount:
        return {}
    
    try:
        summary = {
            'id': str(discount.id),
            'name': discount.name,
            'type': discount.discount_type,
            'description': discount.description,
            'is_active': discount.is_active,
            'valid_from': discount.valid_from.isoformat() if discount.valid_from else None,
            'valid_to': discount.valid_to.isoformat() if discount.valid_to else None,
            'usage_count': discount.usage_count,
            'total_discount': float(discount.total_discount_amount),
            'applies_to': discount.applies_to
        }
        
        # Add discount-specific details
        if discount.discount_type == 'percentage':
            summary['percentage'] = float(discount.percentage)
        elif discount.discount_type == 'fixed':
            summary['fixed_amount'] = float(discount.fixed_amount)
        elif discount.discount_type == 'tiered':
            summary['tiers'] = discount.tier_config
        
        return summary
    except Exception as e:
        return {
            'id': str(discount.id) if hasattr(discount, 'id') else 'unknown',
            'name': getattr(discount, 'name', 'Unknown Discount'),
            'error': str(e)
        }


def format_bytes_human_readable(bytes_value: int) -> str:
    """
    Format bytes to human readable format
    """
    if bytes_value == 0:
        return "0 B"
    
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    for unit in units:
        if bytes_value < 1024.0:
            return f"{bytes_value:.2f} {unit}"
        bytes_value /= 1024.0
    
    return f"{bytes_value:.2f} {units[-1]}"


def format_duration_human_readable(seconds: int) -> str:
    """
    Format seconds to human readable duration
    """
    if seconds == 0:
        return "0 seconds"
    
    intervals = [
        ('years', 31536000),
        ('months', 2592000),
        ('weeks', 604800),
        ('days', 86400),
        ('hours', 3600),
        ('minutes', 60),
        ('seconds', 1)
    ]
    
    result = []
    
    for name, count in intervals:
        value = seconds // count
        if value:
            seconds -= value * count
            if value == 1:
                name = name.rstrip('s')  # Remove 's' for singular
            result.append(f"{value} {name}")
        
        if len(result) == 2:  # Show max 2 units
            break
    
    return ", ".join(result) if result else "0 seconds"


def format_time_display(time_value: Optional[str]) -> str:
    """
    Format time for display (HH:MM)
    """
    if not time_value:
        return "N/A"
    
    try:
        # Handle various time formats
        if isinstance(time_value, str):
            if ':' in time_value:
                parts = time_value.split(':')
                hours = parts[0].zfill(2)
                minutes = parts[1].zfill(2)
                return f"{hours}:{minutes}"
        
        return str(time_value)
    except:
        return str(time_value)


def format_date_display(date_value) -> str:
    """
    Format date for display
    """
    if not date_value:
        return "N/A"
    
    try:
        if isinstance(date_value, str):
            date_obj = datetime.fromisoformat(date_value.replace('Z', '+00:00'))
        else:
            date_obj = date_value
        
        return date_obj.strftime("%Y-%m-%d")
    except:
        return str(date_value)


def format_datetime_display(datetime_value) -> str:
    """
    Format datetime for display
    """
    if not datetime_value:
        return "N/A"
    
    try:
        if isinstance(datetime_value, str):
            dt_obj = datetime.fromisoformat(datetime_value.replace('Z', '+00:00'))
        else:
            dt_obj = datetime_value
        
        return dt_obj.strftime("%Y-%m-%d %H:%M")
    except:
        return str(datetime_value)


def format_access_methods_display(access_methods: Dict) -> str:
    """
    Format enabled access methods for display
    """
    if not access_methods:
        return "None"
    
    enabled_methods = []
    
    if access_methods.get('hotspot', {}).get('enabled', False):
        enabled_methods.append('Hotspot')
    
    if access_methods.get('pppoe', {}).get('enabled', False):
        enabled_methods.append('PPPoE')
    
    if not enabled_methods:
        return "None"
    
    return ", ".join(enabled_methods)


def format_priority_display(priority_level: int) -> str:
    """
    Format priority level for display
    """
    priority_map = {
        1: 'Lowest',
        2: 'Low',
        3: 'Medium',
        4: 'High',
        5: 'Highest',
        6: 'Critical',
        7: 'Premium',
        8: 'VIP'
    }
    
    return priority_map.get(priority_level, f"Level {priority_level}")


def format_fup_threshold_display(threshold: int) -> str:
    """
    Format FUP threshold for display
    """
    if not threshold:
        return "N/A"
    
    return f"{threshold}%"


def format_availability_status(is_available: bool, time_variant=None) -> Dict[str, Any]:
    """
    Format availability status for display
    """
    status = {
        'available': is_available,
        'status': 'Available' if is_available else 'Unavailable',
        'color': 'green' if is_available else 'red',
        'icon': 'check-circle' if is_available else 'x-circle'
    }
    
    if time_variant and time_variant.get('is_active', False) and not is_available:
        status['reason'] = 'Time restricted'
        status['color'] = 'yellow'
        status['icon'] = 'clock'
    
    return status


def format_number_with_commas(number: Union[int, float, Decimal]) -> str:
    """
    Format number with comma separators
    """
    try:
        num = int(number) if isinstance(number, (int, float, Decimal)) else int(str(number))
        return f"{num:,}"
    except:
        return str(number)


def format_percentage_display(value: Union[int, float, Decimal]) -> str:
    """
    Format percentage for display
    """
    try:
        dec_value = Decimal(str(value))
        return f"{dec_value:.1f}%"
    except:
        return f"{value}%"


def format_template_summary(template) -> Dict[str, Any]:
    """
    Format template summary for display
    """
    if not template:
        return {}
    
    try:
        summary = {
            'id': str(template.id),
            'name': template.name,
            'category': template.category,
            'description': template.description,
            'base_price': format_price_display(template.base_price),
            'base_price_value': float(template.base_price),
            'is_public': template.is_public,
            'is_active': template.is_active,
            'usage_count': template.usage_count,
            'created_at': template.created_at.isoformat() if template.created_at else None,
            'access_methods': format_access_methods_display(template.access_methods),
            'enabled_access_methods': template.get_enabled_access_methods(),
            'access_type': template.get_access_type()
        }
        
        return summary
    except Exception as e:
        return {
            'id': str(template.id) if hasattr(template, 'id') else 'unknown',
            'name': getattr(template, 'name', 'Unknown Template'),
            'error': str(e)
        }


def format_time_variant_summary(time_variant) -> Dict[str, Any]:
    """
    Format time variant summary for display
    """
    if not time_variant:
        return {
            'is_active': False,
            'status': 'Not configured',
            'summary': 'No time restrictions'
        }
    
    try:
        summary = {
            'id': str(time_variant.id) if hasattr(time_variant, 'id') else None,
            'is_active': time_variant.is_active,
            'status': 'Active' if time_variant.is_active else 'Inactive',
            'force_available': time_variant.force_available,
            'timezone': time_variant.timezone,
            'summary': time_variant.get_availability_summary() if hasattr(time_variant, 'get_availability_summary') else {}
        }
        
        # Format times if available
        if time_variant.start_time:
            summary['start_time'] = time_variant.start_time.strftime("%H:%M") if hasattr(time_variant.start_time, 'strftime') else str(time_variant.start_time)
        
        if time_variant.end_time:
            summary['end_time'] = time_variant.end_time.strftime("%H:%M") if hasattr(time_variant.end_time, 'strftime') else str(time_variant.end_time)
        
        # Format dates if available
        if time_variant.schedule_start_date:
            summary['schedule_start_date'] = format_datetime_display(time_variant.schedule_start_date)
        
        if time_variant.schedule_end_date:
            summary['schedule_end_date'] = format_datetime_display(time_variant.schedule_end_date)
        
        return summary
    except Exception as e:
        return {
            'is_active': False,
            'status': 'Error',
            'error': str(e)
        }