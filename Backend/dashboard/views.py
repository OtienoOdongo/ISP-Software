# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from datetime import timedelta
# from django.db.models import Sum, Count, Avg, Q
# from django.db.models.functions import TruncMonth
# from payments.models.transaction_log_model import TransactionLog
# from payments.models.payment_reconciliation_model import ReconciliationStats
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from network_management.models.router_management_model import Router, RouterStats, HotspotUser, RouterHealthCheck
# from .serializers import DashboardSerializer
# import logging

# logger = logging.getLogger(__name__)

# class DashboardView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             # Use timezone-aware datetimes
#             now = timezone.now()
#             today = now.replace(hour=0, minute=0, second=0, microsecond=0)
#             yesterday = today - timedelta(days=1)
#             last_month = today - timedelta(days=30)
#             last_week = today - timedelta(days=7)
#             last_quarter = today - timedelta(days=90)

#             # Grid Items
#             active_users = HotspotUser.objects.filter(active=True).count()
#             active_users_yesterday = HotspotUser.objects.filter(
#                 active=True, last_activity__date=yesterday
#             ).count()
#             total_clients = Subscription.objects.values('client').distinct().count()
#             total_clients_last_month = Subscription.objects.filter(
#                 start_date__lt=last_month
#             ).values('client').distinct().count()
#             total_revenue = TransactionLog.objects.filter(
#                 status='success'
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             total_revenue_last_month = TransactionLog.objects.filter(
#                 status='success', created_at__lt=last_month
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             today_revenue = TransactionLog.objects.filter(
#                 status='success', created_at__gte=today, created_at__lt=today + timedelta(days=1)
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             yesterday_revenue = TransactionLog.objects.filter(
#                 status='success', created_at__gte=yesterday, created_at__lt=today
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             churn_rate = (
#                 Subscription.objects.filter(
#                     status='cancelled', end_date__gte=last_quarter
#                 ).count() / (Subscription.objects.filter(end_date__gte=last_quarter).count() or 1)
#             ) * 100
#             churn_rate_last_quarter = (
#                 Subscription.objects.filter(
#                     status='cancelled', end_date__gte=last_quarter - timedelta(days=90)
#                 ).count() / (
#                     Subscription.objects.filter(end_date__gte=last_quarter - timedelta(days=90)).count() or 1
#                 )
#             ) * 100
#             arpu = total_revenue / (total_clients or 1)
#             arpu_last_month = total_revenue_last_month / (total_clients_last_month or 1)
#             routers = Router.objects.filter(is_active=True)
#             online_routers = routers.filter(status='connected').count()
#             bandwidth_used = RouterStats.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(total=Sum('throughput'))['total'] or 0
#             bandwidth_used_last_week = RouterStats.objects.filter(
#                 timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
#             ).aggregate(total=Sum('throughput'))['total'] or 0

#             grid_items = [
#                 {
#                     "id": 1,
#                     "label": "Current Online Users",
#                     "value": f"{active_users:,}",
#                     "comparison": f"vs {active_users_yesterday:,} yesterday",
#                     "icon": "FaUserCheck",
#                     "rate": ((active_users - active_users_yesterday) / (active_users_yesterday or 1)) * 100,
#                     "trend": "up" if active_users > active_users_yesterday else "down",
#                     "bgColor": "bg-indigo-100",
#                     "iconColor": "text-indigo-600",
#                     "borderColor": "border-indigo-200",
#                     "fontStyle": "font-semibold italic"
#                 },
#                 {
#                     "id": 2,
#                     "label": "Total Clients",
#                     "value": f"{total_clients:,}",
#                     "comparison": f"vs {total_clients_last_month:,} last month",
#                     "icon": "FiUserPlus",
#                     "rate": ((total_clients - total_clients_last_month) / (total_clients_last_month or 1)) * 100,
#                     "trend": "up" if total_clients > total_clients_last_month else "down",
#                     "bgColor": "bg-teal-100",
#                     "iconColor": "text-teal-600",
#                     "borderColor": "border-teal-200",
#                     "fontStyle": "font-medium"
#                 },
#                 {
#                     "id": 3,
#                     "label": "Monthly Revenue",
#                     "value": f"KES {total_revenue:,.0f}",
#                     "comparison": f"vs KES {total_revenue_last_month:,.0f} last month",
#                     "icon": "FiDollarSign",
#                     "rate": ((total_revenue - total_revenue_last_month) / (total_revenue_last_month or 1)) * 100,
#                     "trend": "up" if total_revenue > total_revenue_last_month else "down",
#                     "bgColor": "bg-emerald-100",
#                     "iconColor": "text-emerald-600",
#                     "borderColor": "border-emerald-200",
#                     "fontStyle": "font-bold"
#                 },
#                 {
#                     "id": 4,
#                     "label": "Today's Revenue",
#                     "value": f"KES {today_revenue:,.0f}",
#                     "comparison": f"vs KES {yesterday_revenue:,.0f} yesterday",
#                     "icon": "FiActivity",
#                     "rate": ((today_revenue - yesterday_revenue) / (yesterday_revenue or 1)) * 100,
#                     "trend": "up" if today_revenue > yesterday_revenue else "down",
#                     "bgColor": "bg-amber-100",
#                     "iconColor": "text-amber-600",
#                     "borderColor": "border-amber-200",
#                     "fontStyle": "font-medium italic"
#                 },
#                 {
#                     "id": 5,
#                     "label": "Churn Rate",
#                     "value": f"{churn_rate:.1f}%",
#                     "comparison": f"vs {churn_rate_last_quarter:.1f}% last quarter",
#                     "icon": "FiTrendingDown",
#                     "rate": churn_rate - churn_rate_last_quarter,
#                     "trend": "down" if churn_rate < churn_rate_last_quarter else "up",
#                     "bgColor": "bg-rose-100",
#                     "iconColor": "text-rose-600",
#                     "borderColor": "border-rose-200",
#                     "fontStyle": "font-semibold"
#                 },
#                 {
#                     "id": 6,
#                     "label": "Average Revenue Per User",
#                     "value": f"KES {arpu:,.0f}",
#                     "comparison": f"vs KES {arpu_last_month:,.0f} last month",
#                     "icon": "FiBarChart2",
#                     "rate": ((arpu - arpu_last_month) / (arpu_last_month or 1)) * 100,
#                     "trend": "up" if arpu > arpu_last_month else "down",
#                     "bgColor": "bg-violet-100",
#                     "iconColor": "text-violet-600",
#                     "borderColor": "border-violet-200",
#                     "fontStyle": "font-medium"
#                 },
#                 {
#                     "id": 7,
#                     "label": "Network Uptime",
#                     "value": f"{(online_routers / (routers.count() or 1)) * 100:.1f}%",
#                     "comparison": "vs 99.8% last month",
#                     "icon": "FiWifi",
#                     "rate": 0.1,  # Placeholder
#                     "trend": "up",
#                     "bgColor": "bg-sky-100",
#                     "iconColor": "text-sky-600",
#                     "borderColor": "border-sky-200",
#                     "fontStyle": "font-bold italic"
#                 },
#                 {
#                     "id": 8,
#                     "label": "Bandwidth Usage",
#                     "value": f"{bandwidth_used:.1f} Mbps",
#                     "comparison": f"vs {bandwidth_used_last_week:.1f} Mbps last week",
#                     "icon": "FiServer",
#                     "rate": ((bandwidth_used - bandwidth_used_last_week) / (bandwidth_used_last_week or 1)) * 100,
#                     "trend": "up" if bandwidth_used > bandwidth_used_last_week else "down",
#                     "bgColor": "bg-blue-100",
#                     "iconColor": "text-blue-600",
#                     "borderColor": "border-blue-200",
#                     "fontStyle": "font-semibold"
#                 }
#             ]

#             # System Load
#             avg_cpu = RouterStats.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(Avg('cpu'))['cpu__avg'] or 0
#             avg_cpu_last_week = RouterStats.objects.filter(
#                 timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
#             ).aggregate(Avg('cpu'))['cpu__avg'] or 0
#             avg_memory = RouterStats.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(Avg('memory'))['memory__avg'] or 0
#             avg_memory_last_week = RouterStats.objects.filter(
#                 timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
#             ).aggregate(Avg('memory'))['memory__avg'] or 0
#             avg_response = RouterHealthCheck.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(Avg('response_time'))['response_time__avg'] or 0
#             avg_response_yesterday = RouterHealthCheck.objects.filter(
#                 timestamp__gte=yesterday, timestamp__lt=today
#             ).aggregate(Avg('response_time'))['response_time__avg'] or 0
#             avg_temp = RouterStats.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(Avg('temperature'))['temperature__avg'] or 0
#             avg_temp_last_week = RouterStats.objects.filter(
#                 timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
#             ).aggregate(Avg('temperature'))['temperature__avg'] or 0
#             upload_throughput = RouterStats.objects.filter(
#                 timestamp__gte=now - timedelta(hours=1)
#             ).aggregate(Avg('throughput'))['throughput__avg'] or 0
#             download_throughput = upload_throughput  # Placeholder split
#             throughput_yesterday = RouterStats.objects.filter(
#                 timestamp__gte=yesterday, timestamp__lt=today
#             ).aggregate(Avg('throughput'))['throughput__avg'] or 0

#             system_load = {
#                 "api_response_time": int(avg_response),
#                 "api_comparison": f"vs {int(avg_response_yesterday)}ms yesterday",
#                 "bandwidth_used": float(bandwidth_used),
#                 "bandwidth_total": 100.0,  # Configurable
#                 "bandwidth_comparison": f"vs {bandwidth_used_last_week:.1f} Mbps last week",
#                 "cpu_load": float(avg_cpu),
#                 "cpu_comparison": f"vs {avg_cpu_last_week:.0f}% last week",
#                 "memory_load": float(avg_memory),
#                 "memory_comparison": f"vs {avg_memory_last_week:.0f}% last week",
#                 "router_status": "online" if online_routers > 0 else "offline",
#                 "router_uptime": "3 days 12:45:23",  # Placeholder from Router
#                 "upload_throughput": float(upload_throughput),
#                 "download_throughput": float(download_throughput),
#                 "throughput_comparison": f"vs {throughput_yesterday:.1f}/{throughput_yesterday:.1f} Mbps yesterday",
#                 "router_temperature": float(avg_temp),
#                 "temperature_comparison": f"vs {avg_temp_last_week:.1f}°C last week",
#                 "firmware_version": "v6.49.6",  # Placeholder
#                 "firmware_comparison": "Latest stable",
#                 "status": "operational" if online_routers == routers.count() else "degraded"
#             }

#             # Sales Data
#             sales_data = []
#             for plan in InternetPlan.objects.all():
#                 monthly_sales = Subscription.objects.filter(
#                     internet_plan=plan
#                 ).annotate(month=TruncMonth('start_date')).values('month').annotate(
#                     sales=Count('id')
#                 ).order_by('month')
#                 for entry in monthly_sales:
#                     sales_data.append({
#                         "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
#                         "plan": plan.name,
#                         "sales": entry['sales']
#                     })

#             # Revenue Data
#             revenue_data = []
#             monthly_revenue = TransactionLog.objects.filter(
#                 status='success'
#             ).annotate(month=TruncMonth('created_at')).values('month').annotate(
#                 total=Sum('amount')
#             ).order_by('month')
#             for entry in monthly_revenue:
#                 revenue_data.append({
#                     "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
#                     "targeted_revenue": float(entry['total'] * 1.1),  # Mock 10% above
#                     "projected_revenue": float(entry['total'] or 0)
#                 })

#             # Financial Data
#             financial_data = []
#             monthly_financial = ReconciliationStats.objects.annotate(
#                 month=TruncMonth('date')
#             ).values('month').annotate(
#                 revenue=Sum('total_revenue'),
#                 expenses=Sum('total_expenses'),
#                 profit=Sum('net_profit')
#             ).order_by('month')
#             for entry in monthly_financial:
#                 financial_data.append({
#                     "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
#                     "income": float(entry['revenue'] or 0),
#                     "profit": float(entry['profit'] or 0),
#                     "expenses": float(entry['expenses'] or 0)
#                 })

#             # Visitor Data
#             visitor_data = {
#                 plan.name: Subscription.objects.filter(
#                     internet_plan=plan, status='active'
#                 ).count() for plan in InternetPlan.objects.all()
#             }

#             # Plan Performance
#             plan_performance = []
#             for plan in InternetPlan.objects.all():
#                 plan_performance.append({
#                     "plan": plan.name,
#                     "users": Subscription.objects.filter(internet_plan=plan, status='active').count(),
#                     "revenue": float(TransactionLog.objects.filter(
#                         subscription__internet_plan=plan, status='success'
#                     ).aggregate(total=Sum('amount'))['total'] or 0),
#                     "avg_data_usage": float(Subscription.objects.filter(
#                         internet_plan=plan
#                     ).aggregate(avg=Avg('data_used'))['avg'] or 0)
#                 })

#             # New Subscriptions
#             new_subscriptions = []
#             monthly_subs = Subscription.objects.annotate(
#                 month=TruncMonth('start_date')
#             ).values('month').annotate(
#                 count=Count('id')
#             ).order_by('month')
#             for entry in monthly_subs:
#                 new_subscriptions.append({
#                     "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
#                     "subscriptions": entry['count']
#                 })

#             # Combine all data
#             data = {
#                 "grid_items": grid_items,
#                 "system_load": system_load,
#                 "sales_data": sales_data,
#                 "revenue_data": revenue_data,
#                 "financial_data": financial_data,
#                 "visitor_data": visitor_data,
#                 "plan_performance": plan_performance,
#                 "new_subscriptions": new_subscriptions
#             }

#             serializer = DashboardSerializer(data)
#             return Response(serializer.data)

#         except Exception as e:
#             logger.exception("Error fetching dashboard data")
#             return Response({"error": str(e)}, status=500)











from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth, TruncDay
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import ReconciliationStats
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.models.router_management_model import Router, RouterStats, HotspotUser, PPPoEUser, RouterHealthCheck
from .serializers import DashboardSerializer, CalculationUtils
import logging

logger = logging.getLogger(__name__)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 5))  # Cache for 5 minutes
    def get(self, request):
        """
        Enhanced Dashboard View with comprehensive data aggregation
        for both Hotspot and PPPoE clients.
        """
        try:
            # Use timezone-aware datetimes
            now = timezone.now()
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            last_month = today - timedelta(days=30)
            last_week = today - timedelta(days=7)
            last_quarter = today - timedelta(days=90)

            # Optimized database queries with select_related and prefetch_related
            subscriptions = Subscription.objects.select_related('internet_plan', 'client')
            transactions = TransactionLog.objects.select_related('subscription')
            router_stats = RouterStats.objects.select_related('router')
            hotspot_users = HotspotUser.objects.select_related('client', 'plan', 'router')
            pppoe_users = PPPoEUser.objects.select_related('client', 'plan', 'router')

            # =========================================================================
            # GRID ITEMS CALCULATIONS
            # =========================================================================

            # Active Users Calculations
            active_hotspot_users = hotspot_users.filter(active=True).count()
            active_hotspot_yesterday = hotspot_users.filter(
                active=True, last_activity__date=yesterday
            ).count()
            
            active_pppoe_users = pppoe_users.filter(active=True).count()
            active_pppoe_yesterday = pppoe_users.filter(
                active=True, last_activity__date=yesterday
            ).count()
            
            total_active_users = active_hotspot_users + active_pppoe_users
            total_active_yesterday = active_hotspot_yesterday + active_pppoe_yesterday

            # Client Count Calculations
            total_hotspot_clients = hotspot_users.values('client').distinct().count()
            total_hotspot_last_month = hotspot_users.filter(
                connected_at__lt=last_month
            ).values('client').distinct().count()
            
            total_pppoe_clients = pppoe_users.values('client').distinct().count()
            total_pppoe_last_month = pppoe_users.filter(
                connected_at__lt=last_month
            ).values('client').distinct().count()
            
            total_clients = total_hotspot_clients + total_pppoe_clients
            total_clients_last_month = total_hotspot_last_month + total_pppoe_last_month

            # Revenue Calculations (combined query for efficiency)
            revenue_data = transactions.filter(status='success').aggregate(
                total_revenue=Sum('amount'),
                today_revenue=Sum('amount', filter=Q(created_at__gte=today)),
                yesterday_revenue=Sum('amount', filter=Q(created_at__gte=yesterday, created_at__lt=today)),
                last_month_revenue=Sum('amount', filter=Q(created_at__lt=last_month))
            )

            total_revenue = revenue_data['total_revenue'] or 0
            today_revenue = revenue_data['today_revenue'] or 0
            yesterday_revenue = revenue_data['yesterday_revenue'] or 0
            total_revenue_last_month = revenue_data['last_month_revenue'] or 0

            # Churn Rate Calculations
            cancelled_subscriptions = subscriptions.filter(
                status='cancelled', end_date__gte=last_quarter
            ).count()
            total_subscriptions_quarter = subscriptions.filter(
                end_date__gte=last_quarter
            ).count()
            
            churn_rate = CalculationUtils.safe_divide(
                cancelled_subscriptions, total_subscriptions_quarter
            ) * 100

            cancelled_subscriptions_last = subscriptions.filter(
                status='cancelled', 
                end_date__gte=last_quarter - timedelta(days=90),
                end_date__lt=last_quarter
            ).count()
            total_subscriptions_last_quarter = subscriptions.filter(
                end_date__gte=last_quarter - timedelta(days=90),
                end_date__lt=last_quarter
            ).count()
            
            churn_rate_last_quarter = CalculationUtils.safe_divide(
                cancelled_subscriptions_last, total_subscriptions_last_quarter
            ) * 100

            # ARPU Calculations
            arpu = CalculationUtils.safe_divide(total_revenue, total_clients)
            arpu_last_month = CalculationUtils.safe_divide(total_revenue_last_month, total_clients_last_month)

            # Router and Bandwidth Calculations
            routers = Router.objects.filter(is_active=True)
            online_routers = routers.filter(status='connected').count()
            
            bandwidth_data = router_stats.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(
                total_throughput=Sum('throughput'),
                total_upload=Sum('upload_speed'),
                total_download=Sum('download_speed')
            )
            
            bandwidth_used = bandwidth_data['total_throughput'] or 0
            bandwidth_used_last_week = router_stats.filter(
                timestamp__gte=last_week - timedelta(hours=1), 
                timestamp__lt=last_week
            ).aggregate(total=Sum('throughput'))['total'] or 0

            # Data Usage Calculations
            data_usage_current = hotspot_users.aggregate(
                total_data=Sum('data_used')
            )['total_data'] or 0
            data_usage_current += pppoe_users.aggregate(
                total_data=Sum('data_used')
            )['total_data'] or 0
            
            data_usage_last_month = hotspot_users.filter(
                connected_at__lt=last_month
            ).aggregate(total_data=Sum('data_used'))['total_data'] or 0
            data_usage_last_month += pppoe_users.filter(
                connected_at__lt=last_month
            ).aggregate(total_data=Sum('data_used'))['total_data'] or 0

            # Router Health Calculations
            router_health_data = RouterHealthCheck.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(
                avg_health_score=Avg('health_score'),
                online_count=Count('id', filter=Q(is_online=True))
            )
            router_health_score = router_health_data['avg_health_score'] or 0
            online_routers_health = router_health_data['online_count'] or 0

            # Build Grid Items
            grid_items = [
                # Original 8 grid items
                {
                    "id": 1,
                    "label": "Current Online Users",
                    "value": f"{total_active_users:,}",
                    "comparison": f"vs {total_active_yesterday:,} yesterday",
                    "icon": "FaUserCheck",
                    "rate": CalculationUtils.calculate_percentage_change(total_active_users, total_active_yesterday),
                    "trend": CalculationUtils.get_trend_direction(total_active_users, total_active_yesterday),
                    "bgColor": "bg-indigo-100",
                    "iconColor": "text-indigo-600",
                    "borderColor": "border-indigo-200",
                    "fontStyle": "font-semibold italic"
                },
                {
                    "id": 2,
                    "label": "Total Clients",
                    "value": f"{total_clients:,}",
                    "comparison": f"vs {total_clients_last_month:,} last month",
                    "icon": "FiUserPlus",
                    "rate": CalculationUtils.calculate_percentage_change(total_clients, total_clients_last_month),
                    "trend": CalculationUtils.get_trend_direction(total_clients, total_clients_last_month),
                    "bgColor": "bg-teal-100",
                    "iconColor": "text-teal-600",
                    "borderColor": "border-teal-200",
                    "fontStyle": "font-medium"
                },
                {
                    "id": 3,
                    "label": "Monthly Revenue",
                    "value": CalculationUtils.format_currency(total_revenue),
                    "comparison": f"vs {CalculationUtils.format_currency(total_revenue_last_month)} last month",
                    "icon": "FiDollarSign",
                    "rate": CalculationUtils.calculate_percentage_change(total_revenue, total_revenue_last_month),
                    "trend": CalculationUtils.get_trend_direction(total_revenue, total_revenue_last_month),
                    "bgColor": "bg-emerald-100",
                    "iconColor": "text-emerald-600",
                    "borderColor": "border-emerald-200",
                    "fontStyle": "font-bold"
                },
                {
                    "id": 4,
                    "label": "Today's Revenue",
                    "value": CalculationUtils.format_currency(today_revenue),
                    "comparison": f"vs {CalculationUtils.format_currency(yesterday_revenue)} yesterday",
                    "icon": "FiActivity",
                    "rate": CalculationUtils.calculate_percentage_change(today_revenue, yesterday_revenue),
                    "trend": CalculationUtils.get_trend_direction(today_revenue, yesterday_revenue),
                    "bgColor": "bg-amber-100",
                    "iconColor": "text-amber-600",
                    "borderColor": "border-amber-200",
                    "fontStyle": "font-medium italic"
                },
                {
                    "id": 5,
                    "label": "Churn Rate",
                    "value": f"{churn_rate:.1f}%",
                    "comparison": f"vs {churn_rate_last_quarter:.1f}% last quarter",
                    "icon": "FiTrendingDown",
                    "rate": churn_rate - churn_rate_last_quarter,
                    "trend": "down" if churn_rate < churn_rate_last_quarter else "up",
                    "bgColor": "bg-rose-100",
                    "iconColor": "text-rose-600",
                    "borderColor": "border-rose-200",
                    "fontStyle": "font-semibold"
                },
                {
                    "id": 6,
                    "label": "Average Revenue Per User",
                    "value": CalculationUtils.format_currency(arpu),
                    "comparison": f"vs {CalculationUtils.format_currency(arpu_last_month)} last month",
                    "icon": "FiBarChart2",
                    "rate": CalculationUtils.calculate_percentage_change(arpu, arpu_last_month),
                    "trend": CalculationUtils.get_trend_direction(arpu, arpu_last_month),
                    "bgColor": "bg-violet-100",
                    "iconColor": "text-violet-600",
                    "borderColor": "border-violet-200",
                    "fontStyle": "font-medium"
                },
                {
                    "id": 7,
                    "label": "Network Uptime",
                    "value": f"{(online_routers / (routers.count() or 1)) * 100:.1f}%",
                    "comparison": f"{online_routers}/{routers.count()} routers online",
                    "icon": "FiWifi",
                    "rate": 0.1,  # Placeholder
                    "trend": "up",
                    "bgColor": "bg-sky-100",
                    "iconColor": "text-sky-600",
                    "borderColor": "border-sky-200",
                    "fontStyle": "font-bold italic"
                },
                {
                    "id": 8,
                    "label": "Bandwidth Usage",
                    "value": f"{bandwidth_used:.1f} Mbps",
                    "comparison": f"vs {bandwidth_used_last_week:.1f} Mbps last week",
                    "icon": "FiServer",
                    "rate": CalculationUtils.calculate_percentage_change(bandwidth_used, bandwidth_used_last_week),
                    "trend": CalculationUtils.get_trend_direction(bandwidth_used, bandwidth_used_last_week),
                    "bgColor": "bg-blue-100",
                    "iconColor": "text-blue-600",
                    "borderColor": "border-blue-200",
                    "fontStyle": "font-semibold"
                },
                # NEW: 4 Individual Client Type Grids
                {
                    "id": 9,
                    "label": "Active Hotspot Users",
                    "value": f"{active_hotspot_users:,}",
                    "comparison": f"vs {active_hotspot_yesterday:,} yesterday",
                    "icon": "FiWifi",
                    "rate": CalculationUtils.calculate_percentage_change(active_hotspot_users, active_hotspot_yesterday),
                    "trend": CalculationUtils.get_trend_direction(active_hotspot_users, active_hotspot_yesterday),
                    "bgColor": "bg-blue-100",
                    "iconColor": "text-blue-600",
                    "borderColor": "border-blue-200",
                    "fontStyle": "font-semibold"
                },
                {
                    "id": 10,
                    "label": "Active PPPoE Users",
                    "value": f"{active_pppoe_users:,}",
                    "comparison": f"vs {active_pppoe_yesterday:,} yesterday",
                    "icon": "FiServer",
                    "rate": CalculationUtils.calculate_percentage_change(active_pppoe_users, active_pppoe_yesterday),
                    "trend": CalculationUtils.get_trend_direction(active_pppoe_users, active_pppoe_yesterday),
                    "bgColor": "bg-purple-100",
                    "iconColor": "text-purple-600",
                    "borderColor": "border-purple-200",
                    "fontStyle": "font-semibold"
                },
                {
                    "id": 11,
                    "label": "Hotspot Clients",
                    "value": f"{total_hotspot_clients:,}",
                    "comparison": f"vs {total_hotspot_last_month:,} last month",
                    "icon": "FiUserPlus",
                    "rate": CalculationUtils.calculate_percentage_change(total_hotspot_clients, total_hotspot_last_month),
                    "trend": CalculationUtils.get_trend_direction(total_hotspot_clients, total_hotspot_last_month),
                    "bgColor": "bg-cyan-100",
                    "iconColor": "text-cyan-600",
                    "borderColor": "border-cyan-200",
                    "fontStyle": "font-medium"
                },
                {
                    "id": 12,
                    "label": "PPPoE Clients",
                    "value": f"{total_pppoe_clients:,}",
                    "comparison": f"vs {total_pppoe_last_month:,} last month",
                    "icon": "FiUserCheck",
                    "rate": CalculationUtils.calculate_percentage_change(total_pppoe_clients, total_pppoe_last_month),
                    "trend": CalculationUtils.get_trend_direction(total_pppoe_clients, total_pppoe_last_month),
                    "bgColor": "bg-indigo-100",
                    "iconColor": "text-indigo-600",
                    "borderColor": "border-indigo-200",
                    "fontStyle": "font-medium"
                },
                # NEW: 2 Additional Features
                {
                    "id": 13,
                    "label": "Data Usage",
                    "value": CalculationUtils.format_data_size(data_usage_current),
                    "comparison": f"vs {CalculationUtils.format_data_size(data_usage_last_month)} last month",
                    "icon": "FiActivity",
                    "rate": CalculationUtils.calculate_percentage_change(data_usage_current, data_usage_last_month),
                    "trend": CalculationUtils.get_trend_direction(data_usage_current, data_usage_last_month),
                    "bgColor": "bg-green-100",
                    "iconColor": "text-green-600",
                    "borderColor": "border-green-200",
                    "fontStyle": "font-bold"
                },
                {
                    "id": 14,
                    "label": "Router Health",
                    "value": f"{router_health_score:.0f}%",
                    "comparison": f"{online_routers_health}/{routers.count()} routers healthy",
                    "icon": "FiTrendingUp",
                    "rate": 0,  # Placeholder
                    "trend": "up" if router_health_score > 80 else "down",
                    "bgColor": "bg-emerald-100",
                    "iconColor": "text-emerald-600",
                    "borderColor": "border-emerald-200",
                    "fontStyle": "font-bold italic"
                }
            ]

            # =========================================================================
            # SYSTEM LOAD DATA
            # =========================================================================

            # Enhanced system load calculations with error handling
            try:
                avg_cpu_data = router_stats.filter(
                    timestamp__gte=now - timedelta(hours=1)
                ).aggregate(
                    avg_cpu=Avg('cpu'),
                    avg_cpu_last_week=Avg('cpu', filter=Q(
                        timestamp__gte=last_week - timedelta(hours=1), 
                        timestamp__lt=last_week
                    ))
                )
                avg_cpu = avg_cpu_data['avg_cpu'] or 0
                avg_cpu_last_week = avg_cpu_data['avg_cpu_last_week'] or 0

                avg_memory_data = router_stats.filter(
                    timestamp__gte=now - timedelta(hours=1)
                ).aggregate(
                    avg_memory=Avg('memory'),
                    avg_memory_last_week=Avg('memory', filter=Q(
                        timestamp__gte=last_week - timedelta(hours=1), 
                        timestamp__lt=last_week
                    ))
                )
                avg_memory = avg_memory_data['avg_memory'] or 0
                avg_memory_last_week = avg_memory_data['avg_memory_last_week'] or 0

                avg_response_data = RouterHealthCheck.objects.filter(
                    timestamp__gte=now - timedelta(hours=1)
                ).aggregate(
                    avg_response=Avg('response_time'),
                    avg_response_yesterday=Avg('response_time', filter=Q(
                        timestamp__gte=yesterday, timestamp__lt=today
                    ))
                )
                avg_response = avg_response_data['avg_response'] or 0
                avg_response_yesterday = avg_response_data['avg_response_yesterday'] or 0

                avg_temp_data = router_stats.filter(
                    timestamp__gte=now - timedelta(hours=1)
                ).aggregate(
                    avg_temp=Avg('temperature'),
                    avg_temp_last_week=Avg('temperature', filter=Q(
                        timestamp__gte=last_week - timedelta(hours=1), 
                        timestamp__lt=last_week
                    ))
                )
                avg_temp = avg_temp_data['avg_temp'] or 0
                avg_temp_last_week = avg_temp_data['avg_temp_last_week'] or 0

                throughput_data = router_stats.filter(
                    timestamp__gte=now - timedelta(hours=1)
                ).aggregate(
                    upload_throughput=Avg('upload_speed'),
                    download_throughput=Avg('download_speed'),
                    throughput_yesterday=Avg('throughput', filter=Q(
                        timestamp__gte=yesterday, timestamp__lt=today
                    ))
                )
                upload_throughput = throughput_data['upload_throughput'] or 0
                download_throughput = throughput_data['download_throughput'] or 0
                throughput_yesterday = throughput_data['throughput_yesterday'] or 0

            except Exception as e:
                logger.error(f"Error calculating system load metrics: {str(e)}")
                # Set default values on error
                avg_cpu = avg_cpu_last_week = avg_memory = avg_memory_last_week = 0
                avg_response = avg_response_yesterday = avg_temp = avg_temp_last_week = 0
                upload_throughput = download_throughput = throughput_yesterday = 0

            system_load = {
                "api_response_time": int(avg_response),
                "api_comparison": f"vs {int(avg_response_yesterday)}ms yesterday",
                "bandwidth_used": float(bandwidth_used),
                "bandwidth_total": 1000.0,  # Configurable total bandwidth
                "bandwidth_comparison": f"vs {bandwidth_used_last_week:.1f} Mbps last week",
                "cpu_load": float(avg_cpu),
                "cpu_comparison": f"vs {avg_cpu_last_week:.0f}% last week",
                "memory_load": float(avg_memory),
                "memory_comparison": f"vs {avg_memory_last_week:.0f}% last week",
                "router_status": "online" if online_routers > 0 else "offline",
                "router_uptime": "3 days 12:45:23",  # Placeholder - could be calculated from RouterStats
                "upload_throughput": float(upload_throughput),
                "download_throughput": float(download_throughput),
                "throughput_comparison": f"vs {throughput_yesterday:.1f} Mbps yesterday",
                "router_temperature": float(avg_temp),
                "temperature_comparison": f"vs {avg_temp_last_week:.1f}°C last week",
                "firmware_version": "v6.49.6",  # Placeholder - could be from Router model
                "firmware_comparison": "Latest stable",
                "status": "operational" if online_routers == routers.count() else "degraded"
            }

            # =========================================================================
            # CHART DATA CALCULATIONS
            # =========================================================================

            # Sales Data
            sales_data = []
            try:
                for plan in InternetPlan.objects.all()[:10]:  # Limit to prevent too many series
                    monthly_sales = subscriptions.filter(
                        internet_plan=plan
                    ).annotate(month=TruncMonth('start_date')).values('month').annotate(
                        sales=Count('id')
                    ).order_by('month')[:12]  # Last 12 months
                    
                    for entry in monthly_sales:
                        sales_data.append({
                            "month": entry['month'].strftime("%b %Y") if entry['month'] else "Unknown",
                            "plan": plan.name,
                            "sales": entry['sales']
                        })
            except Exception as e:
                logger.error(f"Error generating sales data: {str(e)}")

            # Revenue Data
            revenue_data = []
            try:
                monthly_revenue = transactions.filter(
                    status='success'
                ).annotate(month=TruncMonth('created_at')).values('month').annotate(
                    total=Sum('amount')
                ).order_by('month')[:12]  # Last 12 months
                
                for entry in monthly_revenue:
                    revenue_data.append({
                        "month": entry['month'].strftime("%b %Y") if entry['month'] else "Unknown",
                        "targeted_revenue": float((entry['total'] or 0) * 1.1),  # Mock 10% above
                        "projected_revenue": float(entry['total'] or 0)
                    })
            except Exception as e:
                logger.error(f"Error generating revenue data: {str(e)}")

            # Financial Data
            financial_data = []
            try:
                monthly_financial = ReconciliationStats.objects.annotate(
                    month=TruncMonth('date')
                ).values('month').annotate(
                    revenue=Sum('total_revenue'),
                    expenses=Sum('total_expenses'),
                    profit=Sum('net_profit')
                ).order_by('month')[:12]  # Last 12 months
                
                for entry in monthly_financial:
                    financial_data.append({
                        "month": entry['month'].strftime("%b %Y") if entry['month'] else "Unknown",
                        "income": float(entry['revenue'] or 0),
                        "profit": float(entry['profit'] or 0),
                        "expenses": float(entry['expenses'] or 0)
                    })
            except Exception as e:
                logger.error(f"Error generating financial data: {str(e)}")

            # Visitor Data (Plan Popularity)
            visitor_data = {}
            try:
                for plan in InternetPlan.objects.all()[:8]:  # Limit to top 8 plans
                    active_count = subscriptions.filter(
                        internet_plan=plan, status='active'
                    ).count()
                    if active_count > 0:
                        visitor_data[plan.name] = active_count
            except Exception as e:
                logger.error(f"Error generating visitor data: {str(e)}")

            # Plan Performance
            plan_performance = []
            try:
                for plan in InternetPlan.objects.all()[:6]:  # Limit to top 6 plans
                    plan_users = subscriptions.filter(internet_plan=plan, status='active').count()
                    plan_revenue = transactions.filter(
                        subscription__internet_plan=plan, status='success'
                    ).aggregate(total=Sum('amount'))['total'] or 0
                    
                    # Calculate average data usage from both Hotspot and PPPoE users
                    hotspot_avg = hotspot_users.filter(plan=plan).aggregate(avg=Avg('data_used'))['avg'] or 0
                    pppoe_avg = pppoe_users.filter(plan=plan).aggregate(avg=Avg('data_used'))['avg'] or 0
                    avg_data_usage = (hotspot_avg + pppoe_avg) / 2 if hotspot_avg and pppoe_avg else max(hotspot_avg, pppoe_avg)
                    
                    plan_performance.append({
                        "plan": plan.name,
                        "users": plan_users,
                        "revenue": float(plan_revenue),
                        "avg_data_usage": float(avg_data_usage)
                    })
            except Exception as e:
                logger.error(f"Error generating plan performance data: {str(e)}")

            # New Subscriptions
            new_subscriptions = []
            try:
                monthly_subs = subscriptions.annotate(
                    month=TruncMonth('start_date')
                ).values('month').annotate(
                    count=Count('id')
                ).order_by('month')[:12]  # Last 12 months
                
                for entry in monthly_subs:
                    new_subscriptions.append({
                        "month": entry['month'].strftime("%b %Y") if entry['month'] else "Unknown",
                        "subscriptions": entry['count']
                    })
            except Exception as e:
                logger.error(f"Error generating subscription data: {str(e)}")

            # =========================================================================
            # NEW DATA USAGE ANALYTICS
            # =========================================================================

            data_usage = []
            try:
                # Get data usage for last 6 months
                six_months_ago = today - timedelta(days=180)
                
                # Hotspot data usage by month
                hotspot_monthly = hotspot_users.filter(
                    connected_at__gte=six_months_ago
                ).annotate(
                    month=TruncMonth('connected_at')
                ).values('month').annotate(
                    total_data=Sum('data_used')
                ).order_by('month')
                
                # PPPoE data usage by month
                pppoe_monthly = pppoe_users.filter(
                    connected_at__gte=six_months_ago
                ).annotate(
                    month=TruncMonth('connected_at')
                ).values('month').annotate(
                    total_data=Sum('data_used')
                ).order_by('month')
                
                # Combine data
                usage_by_month = {}
                for entry in hotspot_monthly:
                    month = entry['month'].strftime("%b %Y") if entry['month'] else "Unknown"
                    if month not in usage_by_month:
                        usage_by_month[month] = {'hotspot_data': 0, 'pppoe_data': 0, 'total_data': 0}
                    usage_by_month[month]['hotspot_data'] += (entry['total_data'] or 0) / (1024**3)  # Convert to GB
                    usage_by_month[month]['total_data'] += (entry['total_data'] or 0) / (1024**3)
                
                for entry in pppoe_monthly:
                    month = entry['month'].strftime("%b %Y") if entry['month'] else "Unknown"
                    if month not in usage_by_month:
                        usage_by_month[month] = {'hotspot_data': 0, 'pppoe_data': 0, 'total_data': 0}
                    usage_by_month[month]['pppoe_data'] += (entry['total_data'] or 0) / (1024**3)  # Convert to GB
                    usage_by_month[month]['total_data'] += (entry['total_data'] or 0) / (1024**3)
                
                for month, usage in usage_by_month.items():
                    data_usage.append({
                        "month": month,
                        "hotspot_data": usage['hotspot_data'],
                        "pppoe_data": usage['pppoe_data'],
                        "total_data": usage['total_data']
                    })
            except Exception as e:
                logger.error(f"Error generating data usage analytics: {str(e)}")

            # =========================================================================
            # CLIENT TYPE BREAKDOWN
            # =========================================================================

            client_types = []
            try:
                total_all_clients = total_clients
                client_types = [
                    {
                        "type": "Hotspot",
                        "count": total_hotspot_clients,
                        "percentage": CalculationUtils.safe_divide(total_hotspot_clients, total_all_clients) * 100
                    },
                    {
                        "type": "PPPoE", 
                        "count": total_pppoe_clients,
                        "percentage": CalculationUtils.safe_divide(total_pppoe_clients, total_all_clients) * 100
                    }
                ]
            except Exception as e:
                logger.error(f"Error generating client type breakdown: {str(e)}")

            # =========================================================================
            # ROUTER HEALTH OVERVIEW
            # =========================================================================

            router_health = []
            try:
                healthy_routers = RouterHealthCheck.objects.filter(
                    timestamp__gte=now - timedelta(hours=1),
                    is_online=True
                ).select_related('router')[:10]  # Limit to 10 routers
                
                for health_check in healthy_routers:
                    active_users_count = health_check.router.get_active_users_count()
                    router_health.append({
                        "router_name": health_check.router.name,
                        "ip": health_check.router.ip,
                        "status": health_check.router.status,
                        "health_score": health_check.health_score,
                        "active_users": active_users_count,
                        "last_seen": health_check.timestamp
                    })
            except Exception as e:
                logger.error(f"Error generating router health data: {str(e)}")

            # =========================================================================
            # FINAL DATA ASSEMBLY
            # =========================================================================

            dashboard_data = {
                "grid_items": grid_items,
                "system_load": system_load,
                "sales_data": sales_data,
                "revenue_data": revenue_data,
                "financial_data": financial_data,
                "visitor_data": visitor_data,
                "plan_performance": plan_performance,
                "new_subscriptions": new_subscriptions,
                "data_usage": data_usage,
                "client_types": client_types,
                "router_health": router_health
            }

            # Validate and serialize data
            serializer = DashboardSerializer(data=dashboard_data)
            if serializer.is_valid():
                return Response(serializer.data)
            else:
                logger.error(f"Dashboard serialization errors: {serializer.errors}")
                return Response(
                    {"error": "Data validation failed", "details": serializer.errors},
                    status=500
                )

        except Exception as e:
            logger.exception("Critical error fetching dashboard data")
            return Response(
                {"error": "Failed to load dashboard data", "details": str(e)},
                status=500
            )


class DashboardHealthCheck(APIView):
    """
    Health check endpoint for dashboard data sources
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check health of all dashboard data sources"""
        health_status = {
            "status": "healthy",
            "timestamp": timezone.now().isoformat(),
            "checks": {}
        }

        try:
            # Check database connectivity
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status["checks"]["database"] = "connected"
        except Exception as e:
            health_status["checks"]["database"] = f"error: {str(e)}"
            health_status["status"] = "degraded"

        # Check model accessibility
        models_to_check = [
            ("TransactionLog", TransactionLog),
            ("Subscription", Subscription),
            ("Router", Router),
            ("HotspotUser", HotspotUser),
            ("PPPoEUser", PPPoEUser)
        ]

        for model_name, model in models_to_check:
            try:
                count = model.objects.count()
                health_status["checks"][f"model_{model_name}"] = f"accessible ({count} records)"
            except Exception as e:
                health_status["checks"][f"model_{model_name}"] = f"error: {str(e)}"
                health_status["status"] = "degraded"

        # Check cache
        try:
            cache.set('dashboard_health_check', 'ok', 60)
            if cache.get('dashboard_health_check') == 'ok':
                health_status["checks"]["cache"] = "working"
            else:
                health_status["checks"]["cache"] = "error"
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["checks"]["cache"] = f"error: {str(e)}"
            health_status["status"] = "degraded"

        return Response(health_status)