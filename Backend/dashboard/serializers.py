from rest_framework import serializers
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import ReconciliationStats
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.models.router_management_model import Router, RouterStats, HotspotUser, RouterHealthCheck

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

class DashboardSerializer(serializers.Serializer):
    grid_items = GridItemSerializer(many=True)
    system_load = SystemLoadSerializer()
    sales_data = SalesDataSerializer(many=True)
    revenue_data = RevenueDataSerializer(many=True)
    financial_data = FinancialDataSerializer(many=True)
    visitor_data = serializers.DictField()
    plan_performance = PlanDataSerializer(many=True)
    new_subscriptions = MonthlyDataSerializer(many=True)