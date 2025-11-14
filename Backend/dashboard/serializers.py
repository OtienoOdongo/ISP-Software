# from rest_framework import serializers
# from django.db.models import Sum, Count, Avg
# from django.utils import timezone
# from datetime import timedelta
# from payments.models.transaction_log_model import TransactionLog
# from payments.models.payment_reconciliation_model import ReconciliationStats
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from network_management.models.router_management_model import Router, RouterStats, HotspotUser, RouterHealthCheck

# class GridItemSerializer(serializers.Serializer):
#     id = serializers.IntegerField()
#     label = serializers.CharField()
#     value = serializers.CharField()
#     comparison = serializers.CharField()
#     icon = serializers.CharField()
#     rate = serializers.FloatField()
#     trend = serializers.CharField()
#     bgColor = serializers.CharField()
#     iconColor = serializers.CharField()
#     borderColor = serializers.CharField()
#     fontStyle = serializers.CharField()

# class SystemLoadSerializer(serializers.Serializer):
#     api_response_time = serializers.IntegerField()
#     api_comparison = serializers.CharField()
#     bandwidth_used = serializers.FloatField()
#     bandwidth_total = serializers.FloatField()
#     bandwidth_comparison = serializers.CharField()
#     cpu_load = serializers.FloatField()
#     cpu_comparison = serializers.CharField()
#     memory_load = serializers.FloatField()
#     memory_comparison = serializers.CharField()
#     router_status = serializers.CharField()
#     router_uptime = serializers.CharField()
#     upload_throughput = serializers.FloatField()
#     download_throughput = serializers.FloatField()
#     throughput_comparison = serializers.CharField()
#     router_temperature = serializers.FloatField()
#     temperature_comparison = serializers.CharField()
#     firmware_version = serializers.CharField()
#     firmware_comparison = serializers.CharField()
#     status = serializers.CharField()

# class MonthlyDataSerializer(serializers.Serializer):
#     month = serializers.CharField()
#     value = serializers.FloatField()

# class PlanDataSerializer(serializers.Serializer):
#     plan = serializers.CharField()
#     users = serializers.IntegerField()
#     revenue = serializers.FloatField()
#     avg_data_usage = serializers.FloatField()

# class SalesDataSerializer(serializers.Serializer):
#     month = serializers.CharField()
#     plan = serializers.CharField()
#     sales = serializers.IntegerField()

# class RevenueDataSerializer(serializers.Serializer):
#     month = serializers.CharField()
#     targeted_revenue = serializers.FloatField()
#     projected_revenue = serializers.FloatField()

# class FinancialDataSerializer(serializers.Serializer):
#     month = serializers.CharField()
#     income = serializers.FloatField()
#     profit = serializers.FloatField()
#     expenses = serializers.FloatField()

# class DashboardSerializer(serializers.Serializer):
#     grid_items = GridItemSerializer(many=True)
#     system_load = SystemLoadSerializer()
#     sales_data = SalesDataSerializer(many=True)
#     revenue_data = RevenueDataSerializer(many=True)
#     financial_data = FinancialDataSerializer(many=True)
#     visitor_data = serializers.DictField()
#     plan_performance = PlanDataSerializer(many=True)
#     new_subscriptions = MonthlyDataSerializer(many=True)








from rest_framework import serializers
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import ReconciliationStats
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.models.router_management_model import Router, RouterStats, HotspotUser, PPPoEUser, RouterHealthCheck

class GridItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    label = serializers.CharField()
    value = serializers.CharField()
    comparison = serializers.CharField()
    icon = serializers.CharField()
    rate = serializers.FloatField()
    trend = serializers.CharField()
    bgColor = serializers.CharField()
    iconColor = serializers.CharField()
    borderColor = serializers.CharField()
    fontStyle = serializers.CharField()

class SystemLoadSerializer(serializers.Serializer):
    api_response_time = serializers.IntegerField()
    api_comparison = serializers.CharField()
    bandwidth_used = serializers.FloatField()
    bandwidth_total = serializers.FloatField()
    bandwidth_comparison = serializers.CharField()
    cpu_load = serializers.FloatField()
    cpu_comparison = serializers.CharField()
    memory_load = serializers.FloatField()
    memory_comparison = serializers.CharField()
    router_status = serializers.CharField()
    router_uptime = serializers.CharField()
    upload_throughput = serializers.FloatField()
    download_throughput = serializers.FloatField()
    throughput_comparison = serializers.CharField()
    router_temperature = serializers.FloatField()
    temperature_comparison = serializers.CharField()
    firmware_version = serializers.CharField()
    firmware_comparison = serializers.CharField()
    status = serializers.CharField()

class MonthlyDataSerializer(serializers.Serializer):
    month = serializers.CharField()
    value = serializers.FloatField()

class PlanDataSerializer(serializers.Serializer):
    plan = serializers.CharField()
    users = serializers.IntegerField()
    revenue = serializers.FloatField()
    avg_data_usage = serializers.FloatField()

class SalesDataSerializer(serializers.Serializer):
    month = serializers.CharField()
    plan = serializers.CharField()
    sales = serializers.IntegerField()

class RevenueDataSerializer(serializers.Serializer):
    month = serializers.CharField()
    targeted_revenue = serializers.FloatField()
    projected_revenue = serializers.FloatField()

class FinancialDataSerializer(serializers.Serializer):
    month = serializers.CharField()
    income = serializers.FloatField()
    profit = serializers.FloatField()
    expenses = serializers.FloatField()

class DataUsageSerializer(serializers.Serializer):
    month = serializers.CharField()
    hotspot_data = serializers.FloatField()
    pppoe_data = serializers.FloatField()
    total_data = serializers.FloatField()

class ClientTypeSerializer(serializers.Serializer):
    type = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()

class RouterHealthSerializer(serializers.Serializer):
    router_name = serializers.CharField()
    ip = serializers.CharField()
    status = serializers.CharField()
    health_score = serializers.FloatField()
    active_users = serializers.IntegerField()
    last_seen = serializers.DateTimeField()

class DashboardSerializer(serializers.Serializer):
    grid_items = GridItemSerializer(many=True)
    system_load = SystemLoadSerializer()
    sales_data = SalesDataSerializer(many=True)
    revenue_data = RevenueDataSerializer(many=True)
    financial_data = FinancialDataSerializer(many=True)
    visitor_data = serializers.DictField()
    plan_performance = PlanDataSerializer(many=True)
    new_subscriptions = MonthlyDataSerializer(many=True)
    data_usage = DataUsageSerializer(many=True)
    client_types = ClientTypeSerializer(many=True)
    router_health = RouterHealthSerializer(many=True)

# Utility serializers for calculations
class CalculationUtils:
    @staticmethod
    def calculate_percentage_change(current, previous):
        """Calculate percentage change safely."""
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100.0

    @staticmethod
    def safe_divide(numerator, denominator):
        """Safe division to avoid division by zero."""
        return numerator / denominator if denominator else 0.0

    @staticmethod
    def format_currency(amount, currency='KES'):
        """Format currency for display."""
        return f"{currency} {amount:,.0f}"

    @staticmethod
    def format_data_size(bytes_size):
        """Format data size in appropriate units."""
        if bytes_size >= 1024**3:  # GB
            return f"{(bytes_size / (1024**3)):.1f} GB"
        elif bytes_size >= 1024**2:  # MB
            return f"{(bytes_size / (1024**2)):.1f} MB"
        elif bytes_size >= 1024:  # KB
            return f"{(bytes_size / 1024):.1f} KB"
        else:
            return f"{bytes_size} B"

    @staticmethod
    def get_trend_direction(current, previous):
        """Determine trend direction."""
        return "up" if current > previous else "down"