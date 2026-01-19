








# from rest_framework import serializers
# from django.db.models import Sum, Count, Avg, Q
# from django.utils import timezone
# from datetime import timedelta
# import logging

# logger = logging.getLogger(__name__)

# # Import existing models to avoid duplication
# from payments.models.transaction_log_model import TransactionLog
# from payments.models.payment_reconciliation_model import ReconciliationStats
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from network_management.models.router_management_model import (
#     Router, RouterStats, HotspotUser, PPPoEUser, RouterHealthCheck,
#     RouterConnectionTest
# )
# from account.models.admin_model import Client

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

# class DataUsageSerializer(serializers.Serializer):
#     month = serializers.CharField()
#     hotspot_data = serializers.FloatField()
#     pppoe_data = serializers.FloatField()
#     total_data = serializers.FloatField()

# class ClientTypeSerializer(serializers.Serializer):
#     type = serializers.CharField()
#     count = serializers.IntegerField()
#     percentage = serializers.FloatField()

# class RouterHealthSerializer(serializers.Serializer):
#     router_name = serializers.CharField()
#     ip = serializers.CharField()
#     status = serializers.CharField()
#     health_score = serializers.FloatField()
#     active_users = serializers.IntegerField()
#     last_seen = serializers.DateTimeField()

# class DashboardSerializer(serializers.Serializer):
#     grid_items = GridItemSerializer(many=True)
#     system_load = SystemLoadSerializer()
#     sales_data = SalesDataSerializer(many=True)
#     revenue_data = RevenueDataSerializer(many=True)
#     financial_data = FinancialDataSerializer(many=True)
#     visitor_data = serializers.DictField()
#     plan_performance = PlanDataSerializer(many=True)
#     new_subscriptions = MonthlyDataSerializer(many=True)
#     data_usage = DataUsageSerializer(many=True)
#     client_types = ClientTypeSerializer(many=True)
#     router_health = RouterHealthSerializer(many=True)

# class DashboardDataService:
#     """Enhanced data service that integrates all existing apps"""
    
#     @staticmethod
#     def calculate_percentage_change(current, previous):
#         """Calculate percentage change safely."""
#         if previous == 0:
#             return 100.0 if current > 0 else 0.0
#         return ((current - previous) / previous) * 100.0

#     @staticmethod
#     def get_trend_direction(current, previous):
#         """Determine trend direction."""
#         return "up" if current > previous else "down"

#     @staticmethod
#     def format_currency(amount, currency='KES'):
#         """Format currency for display."""
#         if amount is None:
#             amount = 0
#         return f"{currency} {amount:,.0f}"

#     @staticmethod
#     def get_client_metrics():
#         """Get comprehensive client and user metrics."""
#         try:
#             # Active users from network management
#             active_hotspot_users = HotspotUser.objects.filter(active=True).count()
#             active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
#             total_active_users = active_hotspot_users + active_pppoe_users
            
#             # Client counts
#             hotspot_clients = HotspotUser.objects.values('client').distinct().count()
#             pppoe_clients = PPPoEUser.objects.values('client').distinct().count()
#             total_clients = hotspot_clients + pppoe_clients
            
#             # Registered clients
#             total_registered_clients = Client.objects.count()
            
#             return {
#                 'active_hotspot_users': active_hotspot_users,
#                 'active_pppoe_users': active_pppoe_users,
#                 'total_active_users': total_active_users,
#                 'hotspot_clients': hotspot_clients,
#                 'pppoe_clients': pppoe_clients,
#                 'total_clients': total_clients,
#                 'registered_clients': total_registered_clients
#             }
#         except Exception as e:
#             logger.error(f"Error getting client metrics: {e}")
#             return {
#                 'active_hotspot_users': 0, 'active_pppoe_users': 0, 'total_active_users': 0,
#                 'hotspot_clients': 0, 'pppoe_clients': 0, 'total_clients': 0, 'registered_clients': 0
#             }

#     @staticmethod
#     def get_payment_metrics():
#         """Get payment and revenue metrics from payment reconciliation."""
#         try:
#             now = timezone.now()
#             today = now.replace(hour=0, minute=0, second=0, microsecond=0)
#             yesterday = today - timedelta(days=1)
#             last_month = today - timedelta(days=30)
            
#             # Transaction data
#             transactions = TransactionLog.objects.filter(status='success')
            
#             revenue_data = transactions.aggregate(
#                 total_revenue=Sum('amount'),
#                 today_revenue=Sum('amount', filter=Q(created_at__gte=today)),
#                 yesterday_revenue=Sum('amount', filter=Q(created_at__gte=yesterday, created_at__lt=today)),
#                 last_month_revenue=Sum('amount', filter=Q(created_at__gte=last_month, created_at__lt=today))
#             )
            
#             # Reconciliation stats
#             reconciliation_stats = ReconciliationStats.objects.filter(
#                 date__gte=last_month
#             ).aggregate(
#                 total_profit=Sum('net_profit'),
#                 total_expenses=Sum('total_expenses')
#             )
            
#             return {
#                 'total_revenue': revenue_data['total_revenue'] or 0,
#                 'today_revenue': revenue_data['today_revenue'] or 0,
#                 'yesterday_revenue': revenue_data['yesterday_revenue'] or 0,
#                 'last_month_revenue': revenue_data['last_month_revenue'] or 0,
#                 'total_profit': reconciliation_stats['total_profit'] or 0,
#                 'total_expenses': reconciliation_stats['total_expenses'] or 0
#             }
#         except Exception as e:
#             logger.error(f"Error getting payment metrics: {e}")
#             return {
#                 'total_revenue': 0, 'today_revenue': 0, 'yesterday_revenue': 0,
#                 'last_month_revenue': 0, 'total_profit': 0, 'total_expenses': 0
#             }

#     @staticmethod
#     def get_router_metrics():
#         """Get comprehensive router health metrics."""
#         try:
#             routers = Router.objects.filter(is_active=True)
#             online_routers = routers.filter(connection_status='connected').count()
            
#             # Recent health checks
#             recent_health_checks = RouterHealthCheck.objects.filter(
#                 timestamp__gte=timezone.now() - timedelta(hours=1)
#             )
            
#             avg_health_score = recent_health_checks.aggregate(
#                 avg_score=Avg('health_score')
#             )['avg_score'] or 0
            
#             return {
#                 'total_routers': routers.count(),
#                 'online_routers': online_routers,
#                 'avg_health_score': avg_health_score,
#                 'online_percentage': (online_routers / routers.count() * 100) if routers.count() > 0 else 0
#             }
#         except Exception as e:
#             logger.error(f"Error getting router metrics: {e}")
#             return {'total_routers': 0, 'online_routers': 0, 'avg_health_score': 0, 'online_percentage': 0}

#     @staticmethod
#     def get_connection_metrics():
#         """Get connection quality metrics."""
#         try:
#             recent_tests = RouterConnectionTest.objects.filter(
#                 tested_at__gte=timezone.now() - timedelta(days=7)
#             )
            
#             if recent_tests.exists():
#                 total_tests = recent_tests.count()
#                 successful_tests = recent_tests.filter(success=True).count()
#                 success_rate = (successful_tests / total_tests) * 100
                
#                 successful_response_times = recent_tests.filter(
#                     success=True, response_time__isnull=False
#                 ).values_list('response_time', flat=True)
                
#                 avg_response_time = sum(successful_response_times) / len(successful_response_times) if successful_response_times else 0
                
#                 return {
#                     'success_rate': success_rate,
#                     'avg_response_time': avg_response_time,
#                     'total_tests': total_tests
#                 }
#         except Exception as e:
#             logger.error(f"Error getting connection metrics: {e}")
        
#         return {'success_rate': 0, 'avg_response_time': 0, 'total_tests': 0}

#     @staticmethod
#     def get_plan_metrics():
#         """Get internet plan performance metrics."""
#         try:
#             subscriptions = Subscription.objects.select_related('internet_plan')
#             active_subscriptions = subscriptions.filter(status='active')
            
#             plan_performance = []
#             for plan in InternetPlan.objects.all()[:6]:  # Limit to top 6 plans
#                 plan_subs = active_subscriptions.filter(internet_plan=plan)
#                 plan_revenue = TransactionLog.objects.filter(
#                     subscription__internet_plan=plan, status='success'
#                 ).aggregate(total=Sum('amount'))['total'] or 0
                
#                 plan_performance.append({
#                     'plan': plan.name,
#                     'users': plan_subs.count(),
#                     'revenue': float(plan_revenue),
#                     'avg_data_usage': float(plan.data_limit_value or 0)
#                 })
            
#             return plan_performance
#         except Exception as e:
#             logger.error(f"Error getting plan metrics: {e}")
#             return []

#     @staticmethod
#     def get_system_load_metrics():
#         """Get real system load metrics from routers."""
#         try:
#             now = timezone.now()
            
#             # Router statistics
#             router_stats = RouterStats.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(
#                 avg_cpu=Avg('cpu'),
#                 avg_memory=Avg('memory'),
#                 avg_upload=Avg('upload_speed'),
#                 avg_download=Avg('download_speed'),
#                 avg_throughput=Avg('throughput')
#             )

#             # API response times
#             api_response_data = RouterConnectionTest.objects.filter(
#                 tested_at__gte=now - timedelta(hours=1),
#                 success=True
#             ).aggregate(
#                 avg_response=Avg('response_time')
#             )

#             router_metrics = DashboardDataService.get_router_metrics()

#             return {
#                 "api_response_time": int((api_response_data['avg_response'] or 0) * 1000),
#                 "api_comparison": "Real-time API monitoring",
#                 "bandwidth_used": float(router_stats['avg_throughput'] or 0),
#                 "bandwidth_total": 1000.0,
#                 "bandwidth_comparison": "Total network capacity",
#                 "cpu_load": float(router_stats['avg_cpu'] or 0),
#                 "cpu_comparison": "Average across all routers",
#                 "memory_load": float(router_stats['avg_memory'] or 0),
#                 "memory_comparison": "Average across all routers",
#                 "router_status": "online" if router_metrics['online_routers'] > 0 else "offline",
#                 "router_uptime": "Real-time monitoring",
#                 "upload_throughput": float(router_stats['avg_upload'] or 0),
#                 "download_throughput": float(router_stats['avg_download'] or 0),
#                 "throughput_comparison": "Current network traffic",
#                 "router_temperature": 45.0,  # Could be enhanced with actual temperature data
#                 "temperature_comparison": "Normal operating range",
#                 "firmware_version": "v6.49.6",
#                 "firmware_comparison": "Latest stable",
#                 "status": "operational" if router_metrics['online_percentage'] > 90 else "degraded"
#             }
#         except Exception as e:
#             logger.error(f"Error getting system load metrics: {e}")
#             return {
#                 "api_response_time": 0, "api_comparison": "N/A", "bandwidth_used": 0,
#                 "bandwidth_total": 0, "bandwidth_comparison": "N/A", "cpu_load": 0,
#                 "cpu_comparison": "N/A", "memory_load": 0, "memory_comparison": "N/A",
#                 "router_status": "unknown", "router_uptime": "N/A", "upload_throughput": 0,
#                 "download_throughput": 0, "throughput_comparison": "N/A", "router_temperature": 0,
#                 "temperature_comparison": "N/A", "firmware_version": "Unknown",
#                 "firmware_comparison": "N/A", "status": "unknown"
#             }






from rest_framework import serializers
from django.db.models import Sum, Count, Avg, Q, Max
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

# Import existing models to avoid duplication
from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import ReconciliationStats
from internet_plans.models.plan_models import InternetPlan, PlanTemplate
from service_operations.models.subscription_models import Subscription
from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, PPPoEUser, RouterHealthCheck,
    RouterConnectionTest
)
from account.models.admin_model import Client

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
    grid_items = GridItemSerializer(many=True, default=[])
    system_load = SystemLoadSerializer(default=dict)
    sales_data = SalesDataSerializer(many=True, default=[])
    revenue_data = RevenueDataSerializer(many=True, default=[])
    financial_data = FinancialDataSerializer(many=True, default=[])
    visitor_data = serializers.DictField(default=dict)
    plan_performance = PlanDataSerializer(many=True, default=[])
    new_subscriptions = MonthlyDataSerializer(many=True, default=[])
    data_usage = DataUsageSerializer(many=True, default=[])
    client_types = ClientTypeSerializer(many=True, default=[])
    router_health = RouterHealthSerializer(many=True, default=[])

class DashboardDataService:
    """Enhanced data service that integrates all existing apps with real dynamic data"""
    
    @staticmethod
    def calculate_percentage_change(current, previous):
        """Calculate percentage change safely."""
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return ((current - previous) / previous) * 100.0

    @staticmethod
    def get_trend_direction(current, previous):
        """Determine trend direction."""
        return "up" if current > previous else "down"

    @staticmethod
    def format_currency(amount, currency='KES'):
        """Format currency for display."""
        if amount is None:
            amount = 0
        return f"{currency} {amount:,.0f}"

    @staticmethod
    def get_client_metrics():
        """Get comprehensive client and user metrics with real data."""
        try:
            # Active users from network management
            active_hotspot_users = HotspotUser.objects.filter(active=True).count()
            active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
            total_active_users = active_hotspot_users + active_pppoe_users
            
            # Client counts from subscriptions
            unique_hotspot_clients = Subscription.objects.filter(
                access_method='hotspot', 
                status='active',
                is_active=True
            ).values('client').distinct().count()
            
            unique_pppoe_clients = Subscription.objects.filter(
                access_method='pppoe', 
                status='active',
                is_active=True
            ).values('client').distinct().count()
            
            total_clients = unique_hotspot_clients + unique_pppoe_clients
            
            # Registered clients
            total_registered_clients = Client.objects.count()
            
            return {
                'active_hotspot_users': active_hotspot_users,
                'active_pppoe_users': active_pppoe_users,
                'total_active_users': total_active_users,
                'hotspot_clients': unique_hotspot_clients,
                'pppoe_clients': unique_pppoe_clients,
                'total_clients': total_clients,
                'registered_clients': total_registered_clients
            }
        except Exception as e:
            logger.error(f"Error getting client metrics: {e}")
            return {
                'active_hotspot_users': 0, 'active_pppoe_users': 0, 'total_active_users': 0,
                'hotspot_clients': 0, 'pppoe_clients': 0, 'total_clients': 0, 'registered_clients': 0
            }

    @staticmethod
    def get_payment_metrics():
        """Get payment and revenue metrics from payment reconciliation with real transaction data."""
        try:
            now = timezone.now()
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            last_month = today - timedelta(days=30)
            last_week = today - timedelta(days=7)
            
            # Transaction data with access type breakdown
            transactions = TransactionLog.objects.filter(status='success')
            
            revenue_data = transactions.aggregate(
                total_revenue=Sum('amount'),
                today_revenue=Sum('amount', filter=Q(created_at__gte=today)),
                yesterday_revenue=Sum('amount', filter=Q(created_at__gte=yesterday, created_at__lt=today)),
                last_month_revenue=Sum('amount', filter=Q(created_at__gte=last_month, created_at__lt=today)),
                last_week_revenue=Sum('amount', filter=Q(created_at__gte=last_week, created_at__lt=today))
            )
            
            # Access type revenue breakdown
            hotspot_revenue = transactions.filter(
                access_type='hotspot'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            pppoe_revenue = transactions.filter(
                access_type='pppoe'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            both_revenue = transactions.filter(
                access_type='both'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Reconciliation stats
            reconciliation_stats = ReconciliationStats.objects.filter(
                date__gte=last_month
            ).aggregate(
                total_profit=Sum('net_profit'),
                total_expenses=Sum('total_expenses')
            )
            
            return {
                'total_revenue': revenue_data['total_revenue'] or 0,
                'today_revenue': revenue_data['today_revenue'] or 0,
                'yesterday_revenue': revenue_data['yesterday_revenue'] or 0,
                'last_month_revenue': revenue_data['last_month_revenue'] or 0,
                'last_week_revenue': revenue_data['last_week_revenue'] or 0,
                'total_profit': reconciliation_stats['total_profit'] or 0,
                'total_expenses': reconciliation_stats['total_expenses'] or 0,
                'hotspot_revenue': hotspot_revenue,
                'pppoe_revenue': pppoe_revenue,
                'both_revenue': both_revenue
            }
        except Exception as e:
            logger.error(f"Error getting payment metrics: {e}")
            return {
                'total_revenue': 0, 'today_revenue': 0, 'yesterday_revenue': 0,
                'last_month_revenue': 0, 'last_week_revenue': 0, 'total_profit': 0, 
                'total_expenses': 0, 'hotspot_revenue': 0, 'pppoe_revenue': 0, 'both_revenue': 0
            }

    @staticmethod
    def get_router_metrics():
        """Get comprehensive router health metrics with real data."""
        try:
            routers = Router.objects.filter(is_active=True)
            online_routers = routers.filter(connection_status='connected').count()
            
            # Recent health checks
            recent_health_checks = RouterHealthCheck.objects.filter(
                timestamp__gte=timezone.now() - timedelta(hours=1)
            )
            
            avg_health_score = recent_health_checks.aggregate(
                avg_score=Avg('health_score')
            )['avg_score'] or 0
            
            # Router capacity and load
            total_capacity = routers.aggregate(
                total_capacity=Sum('max_clients')
            )['total_capacity'] or 0
            
            current_load = routers.aggregate(
                current_load=Sum('current_clients')
            )['current_load'] or 0
            
            load_percentage = (current_load / total_capacity * 100) if total_capacity > 0 else 0
            
            return {
                'total_routers': routers.count(),
                'online_routers': online_routers,
                'avg_health_score': avg_health_score,
                'online_percentage': (online_routers / routers.count() * 100) if routers.count() > 0 else 0,
                'total_capacity': total_capacity,
                'current_load': current_load,
                'load_percentage': load_percentage
            }
        except Exception as e:
            logger.error(f"Error getting router metrics: {e}")
            return {
                'total_routers': 0, 'online_routers': 0, 'avg_health_score': 0, 
                'online_percentage': 0, 'total_capacity': 0, 'current_load': 0, 'load_percentage': 0
            }

    @staticmethod
    def get_connection_metrics():
        """Get connection quality metrics with real test data."""
        try:
            recent_tests = RouterConnectionTest.objects.filter(
                tested_at__gte=timezone.now() - timedelta(days=7)
            )
            
            if recent_tests.exists():
                total_tests = recent_tests.count()
                successful_tests = recent_tests.filter(success=True).count()
                success_rate = (successful_tests / total_tests) * 100
                
                successful_response_times = recent_tests.filter(
                    success=True, response_time__isnull=False
                ).values_list('response_time', flat=True)
                
                avg_response_time = sum(successful_response_times) / len(successful_response_times) if successful_response_times else 0
                
                # Connection type breakdown
                hotspot_tests = recent_tests.filter(connection_type='hotspot')
                pppoe_tests = recent_tests.filter(connection_type='pppoe')
                
                return {
                    'success_rate': success_rate,
                    'avg_response_time': avg_response_time,
                    'total_tests': total_tests,
                    'hotspot_success_rate': (hotspot_tests.filter(success=True).count() / hotspot_tests.count() * 100) if hotspot_tests.count() > 0 else 0,
                    'pppoe_success_rate': (pppoe_tests.filter(success=True).count() / pppoe_tests.count() * 100) if pppoe_tests.count() > 0 else 0
                }
        except Exception as e:
            logger.error(f"Error getting connection metrics: {e}")
        
        return {
            'success_rate': 0, 'avg_response_time': 0, 'total_tests': 0,
            'hotspot_success_rate': 0, 'pppoe_success_rate': 0
        }

    @staticmethod
    def get_plan_metrics():
        """Get internet plan performance metrics with real subscription data."""
        try:
            subscriptions = Subscription.objects.select_related('internet_plan')
            active_subscriptions = subscriptions.filter(status='active', is_active=True)
            
            plan_performance = []
            for plan in InternetPlan.objects.filter(active=True)[:8]:  # Top 8 active plans
                plan_subs = active_subscriptions.filter(internet_plan=plan)
                
                # Revenue from successful transactions for this plan
                plan_revenue = TransactionLog.objects.filter(
                    subscription__internet_plan=plan, 
                    status='success'
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                # Access type breakdown
                hotspot_subs = plan_subs.filter(access_method='hotspot').count()
                pppoe_subs = plan_subs.filter(access_method='pppoe').count()
                
                # Average data usage (placeholder - would integrate with actual usage data)
                avg_data_usage = plan.purchases * 1024 * 1024 * 1024  # 1GB per purchase as example
                
                plan_performance.append({
                    'plan': plan.name,
                    'users': plan_subs.count(),
                    'revenue': float(plan_revenue),
                    'avg_data_usage': float(avg_data_usage / (1024**3)),  # Convert to GB
                    'hotspot_users': hotspot_subs,
                    'pppoe_users': pppoe_subs,
                    'purchases': plan.purchases,
                    'price': float(plan.price),
                    'category': plan.category
                })
            
            return plan_performance
        except Exception as e:
            logger.error(f"Error getting plan metrics: {e}")
            return []

    @staticmethod
    def get_system_load_metrics():
        """Get real system load metrics from routers and network data."""
        try:
            now = timezone.now()
            
            # Router statistics
            router_stats = RouterStats.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(
                avg_cpu=Avg('cpu'),
                avg_memory=Avg('memory'),
                avg_upload=Avg('upload_speed'),
                avg_download=Avg('download_speed'),
                avg_throughput=Avg('throughput'),
                max_cpu=Max('cpu'),
                max_memory=Max('memory')
            )

            # API response times from connection tests
            api_response_data = RouterConnectionTest.objects.filter(
                tested_at__gte=now - timedelta(hours=1),
                success=True
            ).aggregate(
                avg_response=Avg('response_time'),
                max_response=Max('response_time')
            )

            router_metrics = DashboardDataService.get_router_metrics()
            connection_metrics = DashboardDataService.get_connection_metrics()

            # Calculate bandwidth usage from active subscriptions
            active_subscriptions = Subscription.objects.filter(status='active', is_active=True)
            estimated_bandwidth_usage = active_subscriptions.count() * 5  # 5 Mbps per active user estimate

            return {
                "api_response_time": int((api_response_data['avg_response'] or 0) * 1000),
                "api_comparison": f"Max: {int((api_response_data['max_response'] or 0) * 1000)}ms",
                "bandwidth_used": float(estimated_bandwidth_usage),
                "bandwidth_total": float(router_metrics['total_capacity'] * 10),  # Estimate 10 Mbps per client capacity
                "bandwidth_comparison": f"{router_metrics['load_percentage']:.1f}% capacity used",
                "cpu_load": float(router_stats['avg_cpu'] or 0),
                "cpu_comparison": f"Peak: {router_stats['max_cpu'] or 0}%",
                "memory_load": float(router_stats['avg_memory'] or 0),
                "memory_comparison": f"Peak: {router_stats['max_memory'] or 0}%",
                "router_status": "online" if router_metrics['online_routers'] > 0 else "offline",
                "router_uptime": f"{router_metrics['online_routers']}/{router_metrics['total_routers']} online",
                "upload_throughput": float(router_stats['avg_upload'] or 0),
                "download_throughput": float(router_stats['avg_download'] or 0),
                "throughput_comparison": f"Total: {router_stats['avg_throughput'] or 0:.1f} Mbps",
                "router_temperature": 45.0,  # Could be enhanced with actual temperature data
                "temperature_comparison": "Normal operating range",
                "firmware_version": "v6.49.6",
                "firmware_comparison": "Latest stable",
                "status": "operational" if router_metrics['online_percentage'] > 90 else "degraded"
            }
        except Exception as e:
            logger.error(f"Error getting system load metrics: {e}")
            return {
                "api_response_time": 0, "api_comparison": "N/A", "bandwidth_used": 0,
                "bandwidth_total": 0, "bandwidth_comparison": "N/A", "cpu_load": 0,
                "cpu_comparison": "N/A", "memory_load": 0, "memory_comparison": "N/A",
                "router_status": "unknown", "router_uptime": "N/A", "upload_throughput": 0,
                "download_throughput": 0, "throughput_comparison": "N/A", "router_temperature": 0,
                "temperature_comparison": "N/A", "firmware_version": "Unknown",
                "firmware_comparison": "N/A", "status": "unknown"
            }

    @staticmethod
    def get_subscription_metrics():
        """Get comprehensive subscription metrics."""
        try:
            now = timezone.now()
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            last_week = today - timedelta(days=7)
            last_month = today - timedelta(days=30)
            
            subscriptions = Subscription.objects.all()
            active_subscriptions = subscriptions.filter(status='active', is_active=True)
            
            metrics = {
                'total_subscriptions': subscriptions.count(),
                'active_subscriptions': active_subscriptions.count(),
                'pending_subscriptions': subscriptions.filter(status='pending').count(),
                'expired_subscriptions': subscriptions.filter(status='expired').count(),
                
                'today_subscriptions': subscriptions.filter(start_date__gte=today).count(),
                'week_subscriptions': subscriptions.filter(start_date__gte=last_week).count(),
                'month_subscriptions': subscriptions.filter(start_date__gte=last_month).count(),
                
                'hotspot_subscriptions': active_subscriptions.filter(access_method='hotspot').count(),
                'pppoe_subscriptions': active_subscriptions.filter(access_method='pppoe').count(),
                
                'subscription_growth_rate': DashboardDataService.calculate_percentage_change(
                    subscriptions.filter(start_date__gte=last_week).count(),
                    subscriptions.filter(start_date__range=[last_week - timedelta(days=7), last_week]).count()
                )
            }
            
            return metrics
        except Exception as e:
            logger.error(f"Error getting subscription metrics: {e}")
            return {}

    @staticmethod
    def get_plan_categories_metrics():
        """Get metrics by plan categories."""
        try:
            categories = {}
            for plan in InternetPlan.objects.filter(active=True):
                if plan.category not in categories:
                    categories[plan.category] = {
                        'plan_count': 0,
                        'active_subscriptions': 0,
                        'total_revenue': 0,
                        'avg_price': 0
                    }
                
                categories[plan.category]['plan_count'] += 1
                categories[plan.category]['active_subscriptions'] += plan.subscriptions.filter(
                    status='active', is_active=True
                ).count()
                
                # Revenue for this plan category
                plan_revenue = TransactionLog.objects.filter(
                    subscription__internet_plan=plan,
                    status='success'
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                categories[plan.category]['total_revenue'] += float(plan_revenue)
            
            # Calculate average price per category
            for category in categories:
                if categories[category]['plan_count'] > 0:
                    categories[category]['avg_price'] = categories[category]['total_revenue'] / categories[category]['active_subscriptions'] if categories[category]['active_subscriptions'] > 0 else 0
            
            return categories
        except Exception as e:
            logger.error(f"Error getting plan categories metrics: {e}")
            return {}