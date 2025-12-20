"""
Internet Plans - Formatters
Formatting utilities for plan data
NEW: Production-ready data formatting
"""

from decimal import Decimal
from typing import Dict, Any, Optional
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
        if unit.upper() == 'KB':
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'MB'
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'GB'
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'TB'
        
        elif unit.upper() == 'MB':
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'GB'
            if data_value >= 1024:
                data_value = data_value / 1024
                unit = 'TB'
        
        elif unit.upper() == 'GB':
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
    unit = duration_config.get('unit', 'Hours')
    
    if str(value).lower() == 'unlimited':
        return "Unlimited"
    
    try:
        duration_value = int(value)
        
        # Convert to appropriate unit
        if unit == 'Seconds':
            if duration_value >= 60:
                duration_value = duration_value // 60
                unit = 'Minutes'
            if duration_value >= 60:
                duration_value = duration_value // 60
                unit = 'Hours'
            if duration_value >= 24:
                duration_value = duration_value // 24
                unit = 'Days'
        
        elif unit == 'Minutes':
            if duration_value >= 60:
                duration_value = duration_value // 60
                unit = 'Hours'
            if duration_value >= 24:
                duration_value = duration_value // 24
                unit = 'Days'
        
        elif unit == 'Hours':
            if duration_value >= 24:
                duration_value = duration_value // 24
                unit = 'Days'
            if duration_value >= 30:
                duration_value = duration_value // 30
                unit = 'Months'
        
        elif unit == 'Days':
            if duration_value >= 30:
                duration_value = duration_value // 30
                unit = 'Months'
        
        return f"{duration_value} {unit}"
    except:
        return f"{value} {unit}"


def format_price_display(price: Decimal, currency: str = 'KES') -> str:
    """
    Format price for display
    """
    try:
        if price == 0:
            return "Free"
        
        # Format with thousands separators
        formatted = f"{price:,.2f}"
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
    
    # Format speed
    if 'downloadSpeed' in config:
        formatted['download_speed'] = format_speed_display(config['downloadSpeed'])
    
    if 'uploadSpeed' in config:
        formatted['upload_speed'] = format_speed_display(config['uploadSpeed'])
    
    # Format limits
    if 'dataLimit' in config:
        formatted['data_limit'] = format_data_display(config['dataLimit'])
    
    if 'usageLimit' in config:
        formatted['usage_limit'] = format_duration_display(config['usageLimit'])
    
    # Format validity
    if 'validityPeriod' in config:
        formatted['validity_period'] = format_duration_display(config['validityPeriod'])
    
    # Add other fields
    other_fields = ['maxDevices', 'sessionTimeout', 'idleTimeout', 
                   'bandwidthLimit', 'macBinding', 'ipPool']
    
    for field in other_fields:
        if field in config:
            formatted[field.lower()] = config[field]
    
    return formatted


def format_plan_summary(plan) -> Dict[str, Any]:
    """
    Format plan summary for API responses
    """
    if not plan:
        return {}
    
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
        'purchases': plan.purchases,
        'active': plan.active,
        'created_at': plan.created_at.isoformat() if plan.created_at else None,
        'technical_config': {}
    }
    
    # Add technical configuration for each access method
    for method in plan.get_enabled_access_methods():
        config = plan.get_config_for_method(method)
        summary['technical_config'][method] = format_technical_config(config)
    
    return summary


def format_discount_summary(discount) -> Dict[str, Any]:
    """
    Format discount summary for display
    """
    if not discount:
        return {}
    
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
            result.append(f"{value} {name}")
        
        if len(result) == 2:  # Show max 2 units
            break
    
    return ", ".join(result) if result else "0 seconds"