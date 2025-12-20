"""
Service Operations - Calculators
Calculation utilities for service operations
"""

import math
from typing import Dict, Any, Optional
from decimal import Decimal, ROUND_HALF_UP


def calculate_remaining_balance(original_amount: Decimal, used_amount: Decimal) -> Decimal:
    """
    Calculate remaining balance
    """
    remaining = original_amount - used_amount
    return max(Decimal('0'), remaining)


def calculate_usage_percentage(used: int, total: int) -> float:
    """
    Calculate usage percentage
    """
    if total == 0:
        return 0.0
    
    percentage = (used / total) * 100
    return min(100.0, percentage)


def calculate_renewal_cost(plan_price: Decimal, renewal_discount: Decimal = Decimal('0')) -> Decimal:
    """
    Calculate renewal cost with discount
    """
    discounted_price = plan_price - renewal_discount
    return max(Decimal('0'), discounted_price)


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


def format_seconds_human_readable(seconds: int) -> str:
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


def calculate_estimated_cost(data_used: int, price_per_gb: Decimal) -> Decimal:
    """
    Calculate estimated cost based on data usage
    """
    # Convert bytes to GB
    data_gb = data_used / (1024 ** 3)
    cost = Decimal(str(data_gb)) * price_per_gb
    return cost.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate_peak_usage_rate(data_points: list, time_window_seconds: int) -> Dict[str, Any]:
    """
    Calculate peak usage rate from data points
    """
    if not data_points or time_window_seconds <= 0:
        return {'rate_bps': 0, 'time': None}
    
    # Find peak rate
    peak_rate = 0
    peak_time = None
    
    for i in range(len(data_points) - 1):
        current = data_points[i]
        next_point = data_points[i + 1]
        
        time_diff = (next_point['timestamp'] - current['timestamp']).total_seconds()
        if time_diff == 0:
            continue
        
        data_diff = next_point['bytes'] - current['bytes']
        rate = (data_diff * 8) / time_diff  # Convert to bits per second
        
        if rate > peak_rate:
            peak_rate = rate
            peak_time = current['timestamp']
    
    return {
        'rate_bps': peak_rate,
        'time': peak_time,
        'rate_mbps': peak_rate / 1000000
    }


def calculate_average_session_duration(sessions: list) -> float:
    """
    Calculate average session duration
    """
    if not sessions:
        return 0.0
    
    total_duration = sum(session.get('duration_seconds', 0) for session in sessions)
    return total_duration / len(sessions)


def calculate_data_usage_trend(usage_history: list, days: int = 7) -> Dict[str, Any]:
    """
    Calculate data usage trend over time
    """
    if not usage_history or len(usage_history) < 2:
        return {'trend': 'stable', 'percentage_change': 0.0}
    
    # Get recent usage
    recent_usage = usage_history[-min(days, len(usage_history)):]
    previous_usage = usage_history[-min(days * 2, len(usage_history)):-days]
    
    if not previous_usage:
        return {'trend': 'stable', 'percentage_change': 0.0}
    
    # Calculate averages
    recent_avg = sum(day['data_used'] for day in recent_usage) / len(recent_usage)
    previous_avg = sum(day['data_used'] for day in previous_usage) / len(previous_usage)
    
    if previous_avg == 0:
        percentage_change = 100.0 if recent_avg > 0 else 0.0
    else:
        percentage_change = ((recent_avg - previous_avg) / previous_avg) * 100
    
    # Determine trend
    if percentage_change > 10:
        trend = 'increasing'
    elif percentage_change < -10:
        trend = 'decreasing'
    else:
        trend = 'stable'
    
    return {
        'trend': trend,
        'percentage_change': percentage_change,
        'recent_average': recent_avg,
        'previous_average': previous_avg
    }