from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncMonth
from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import ReconciliationStats
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.models.router_management_model import Router, RouterStats, HotspotUser, RouterHealthCheck
from .serializers import DashboardSerializer
import logging

logger = logging.getLogger(__name__)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Use timezone-aware datetimes
            now = timezone.now()
            today = now.replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday = today - timedelta(days=1)
            last_month = today - timedelta(days=30)
            last_week = today - timedelta(days=7)
            last_quarter = today - timedelta(days=90)

            # Grid Items
            active_users = HotspotUser.objects.filter(active=True).count()
            active_users_yesterday = HotspotUser.objects.filter(
                active=True, last_activity__date=yesterday
            ).count()
            total_clients = Subscription.objects.values('client').distinct().count()
            total_clients_last_month = Subscription.objects.filter(
                start_date__lt=last_month
            ).values('client').distinct().count()
            total_revenue = TransactionLog.objects.filter(
                status='success'
            ).aggregate(total=Sum('amount'))['total'] or 0
            total_revenue_last_month = TransactionLog.objects.filter(
                status='success', created_at__lt=last_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            today_revenue = TransactionLog.objects.filter(
                status='success', created_at__gte=today, created_at__lt=today + timedelta(days=1)
            ).aggregate(total=Sum('amount'))['total'] or 0
            yesterday_revenue = TransactionLog.objects.filter(
                status='success', created_at__gte=yesterday, created_at__lt=today
            ).aggregate(total=Sum('amount'))['total'] or 0
            churn_rate = (
                Subscription.objects.filter(
                    status='cancelled', end_date__gte=last_quarter
                ).count() / (Subscription.objects.filter(end_date__gte=last_quarter).count() or 1)
            ) * 100
            churn_rate_last_quarter = (
                Subscription.objects.filter(
                    status='cancelled', end_date__gte=last_quarter - timedelta(days=90)
                ).count() / (
                    Subscription.objects.filter(end_date__gte=last_quarter - timedelta(days=90)).count() or 1
                )
            ) * 100
            arpu = total_revenue / (total_clients or 1)
            arpu_last_month = total_revenue_last_month / (total_clients_last_month or 1)
            routers = Router.objects.filter(is_active=True)
            online_routers = routers.filter(status='connected').count()
            bandwidth_used = RouterStats.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(total=Sum('throughput'))['total'] or 0
            bandwidth_used_last_week = RouterStats.objects.filter(
                timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
            ).aggregate(total=Sum('throughput'))['total'] or 0

            grid_items = [
                {
                    "id": 1,
                    "label": "Current Online Users",
                    "value": f"{active_users:,}",
                    "comparison": f"vs {active_users_yesterday:,} yesterday",
                    "icon": "FaUserCheck",
                    "rate": ((active_users - active_users_yesterday) / (active_users_yesterday or 1)) * 100,
                    "trend": "up" if active_users > active_users_yesterday else "down",
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
                    "rate": ((total_clients - total_clients_last_month) / (total_clients_last_month or 1)) * 100,
                    "trend": "up" if total_clients > total_clients_last_month else "down",
                    "bgColor": "bg-teal-100",
                    "iconColor": "text-teal-600",
                    "borderColor": "border-teal-200",
                    "fontStyle": "font-medium"
                },
                {
                    "id": 3,
                    "label": "Monthly Revenue",
                    "value": f"KES {total_revenue:,.0f}",
                    "comparison": f"vs KES {total_revenue_last_month:,.0f} last month",
                    "icon": "FiDollarSign",
                    "rate": ((total_revenue - total_revenue_last_month) / (total_revenue_last_month or 1)) * 100,
                    "trend": "up" if total_revenue > total_revenue_last_month else "down",
                    "bgColor": "bg-emerald-100",
                    "iconColor": "text-emerald-600",
                    "borderColor": "border-emerald-200",
                    "fontStyle": "font-bold"
                },
                {
                    "id": 4,
                    "label": "Today's Revenue",
                    "value": f"KES {today_revenue:,.0f}",
                    "comparison": f"vs KES {yesterday_revenue:,.0f} yesterday",
                    "icon": "FiActivity",
                    "rate": ((today_revenue - yesterday_revenue) / (yesterday_revenue or 1)) * 100,
                    "trend": "up" if today_revenue > yesterday_revenue else "down",
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
                    "value": f"KES {arpu:,.0f}",
                    "comparison": f"vs KES {arpu_last_month:,.0f} last month",
                    "icon": "FiBarChart2",
                    "rate": ((arpu - arpu_last_month) / (arpu_last_month or 1)) * 100,
                    "trend": "up" if arpu > arpu_last_month else "down",
                    "bgColor": "bg-violet-100",
                    "iconColor": "text-violet-600",
                    "borderColor": "border-violet-200",
                    "fontStyle": "font-medium"
                },
                {
                    "id": 7,
                    "label": "Network Uptime",
                    "value": f"{(online_routers / (routers.count() or 1)) * 100:.1f}%",
                    "comparison": "vs 99.8% last month",
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
                    "rate": ((bandwidth_used - bandwidth_used_last_week) / (bandwidth_used_last_week or 1)) * 100,
                    "trend": "up" if bandwidth_used > bandwidth_used_last_week else "down",
                    "bgColor": "bg-blue-100",
                    "iconColor": "text-blue-600",
                    "borderColor": "border-blue-200",
                    "fontStyle": "font-semibold"
                }
            ]

            # System Load
            avg_cpu = RouterStats.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(Avg('cpu'))['cpu__avg'] or 0
            avg_cpu_last_week = RouterStats.objects.filter(
                timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
            ).aggregate(Avg('cpu'))['cpu__avg'] or 0
            avg_memory = RouterStats.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(Avg('memory'))['memory__avg'] or 0
            avg_memory_last_week = RouterStats.objects.filter(
                timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
            ).aggregate(Avg('memory'))['memory__avg'] or 0
            avg_response = RouterHealthCheck.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(Avg('response_time'))['response_time__avg'] or 0
            avg_response_yesterday = RouterHealthCheck.objects.filter(
                timestamp__gte=yesterday, timestamp__lt=today
            ).aggregate(Avg('response_time'))['response_time__avg'] or 0
            avg_temp = RouterStats.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(Avg('temperature'))['temperature__avg'] or 0
            avg_temp_last_week = RouterStats.objects.filter(
                timestamp__gte=last_week - timedelta(hours=1), timestamp__lt=last_week
            ).aggregate(Avg('temperature'))['temperature__avg'] or 0
            upload_throughput = RouterStats.objects.filter(
                timestamp__gte=now - timedelta(hours=1)
            ).aggregate(Avg('throughput'))['throughput__avg'] or 0
            download_throughput = upload_throughput  # Placeholder split
            throughput_yesterday = RouterStats.objects.filter(
                timestamp__gte=yesterday, timestamp__lt=today
            ).aggregate(Avg('throughput'))['throughput__avg'] or 0

            system_load = {
                "api_response_time": int(avg_response),
                "api_comparison": f"vs {int(avg_response_yesterday)}ms yesterday",
                "bandwidth_used": float(bandwidth_used),
                "bandwidth_total": 100.0,  # Configurable
                "bandwidth_comparison": f"vs {bandwidth_used_last_week:.1f} Mbps last week",
                "cpu_load": float(avg_cpu),
                "cpu_comparison": f"vs {avg_cpu_last_week:.0f}% last week",
                "memory_load": float(avg_memory),
                "memory_comparison": f"vs {avg_memory_last_week:.0f}% last week",
                "router_status": "online" if online_routers > 0 else "offline",
                "router_uptime": "3 days 12:45:23",  # Placeholder from Router
                "upload_throughput": float(upload_throughput),
                "download_throughput": float(download_throughput),
                "throughput_comparison": f"vs {throughput_yesterday:.1f}/{throughput_yesterday:.1f} Mbps yesterday",
                "router_temperature": float(avg_temp),
                "temperature_comparison": f"vs {avg_temp_last_week:.1f}°C last week",
                "firmware_version": "v6.49.6",  # Placeholder
                "firmware_comparison": "Latest stable",
                "status": "operational" if online_routers == routers.count() else "degraded"
            }

            # Sales Data
            sales_data = []
            for plan in InternetPlan.objects.all():
                monthly_sales = Subscription.objects.filter(
                    internet_plan=plan
                ).annotate(month=TruncMonth('start_date')).values('month').annotate(
                    sales=Count('id')
                ).order_by('month')
                for entry in monthly_sales:
                    sales_data.append({
                        "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
                        "plan": plan.name,
                        "sales": entry['sales']
                    })

            # Revenue Data
            revenue_data = []
            monthly_revenue = TransactionLog.objects.filter(
                status='success'
            ).annotate(month=TruncMonth('created_at')).values('month').annotate(
                total=Sum('amount')
            ).order_by('month')
            for entry in monthly_revenue:
                revenue_data.append({
                    "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
                    "targeted_revenue": float(entry['total'] * 1.1),  # Mock 10% above
                    "projected_revenue": float(entry['total'] or 0)
                })

            # Financial Data
            financial_data = []
            monthly_financial = ReconciliationStats.objects.annotate(
                month=TruncMonth('date')
            ).values('month').annotate(
                revenue=Sum('total_revenue'),
                expenses=Sum('total_expenses'),
                profit=Sum('net_profit')
            ).order_by('month')
            for entry in monthly_financial:
                financial_data.append({
                    "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
                    "income": float(entry['revenue'] or 0),
                    "profit": float(entry['profit'] or 0),
                    "expenses": float(entry['expenses'] or 0)
                })

            # Visitor Data
            visitor_data = {
                plan.name: Subscription.objects.filter(
                    internet_plan=plan, status='active'
                ).count() for plan in InternetPlan.objects.all()
            }

            # Plan Performance
            plan_performance = []
            for plan in InternetPlan.objects.all():
                plan_performance.append({
                    "plan": plan.name,
                    "users": Subscription.objects.filter(internet_plan=plan, status='active').count(),
                    "revenue": float(TransactionLog.objects.filter(
                        subscription__internet_plan=plan, status='success'
                    ).aggregate(total=Sum('amount'))['total'] or 0),
                    "avg_data_usage": float(Subscription.objects.filter(
                        internet_plan=plan
                    ).aggregate(avg=Avg('data_used'))['avg'] or 0)
                })

            # New Subscriptions
            new_subscriptions = []
            monthly_subs = Subscription.objects.annotate(
                month=TruncMonth('start_date')
            ).values('month').annotate(
                count=Count('id')
            ).order_by('month')
            for entry in monthly_subs:
                new_subscriptions.append({
                    "month": entry['month'].strftime("%b") if entry['month'] else "Unknown",
                    "subscriptions": entry['count']
                })

            # Combine all data
            data = {
                "grid_items": grid_items,
                "system_load": system_load,
                "sales_data": sales_data,
                "revenue_data": revenue_data,
                "financial_data": financial_data,
                "visitor_data": visitor_data,
                "plan_performance": plan_performance,
                "new_subscriptions": new_subscriptions
            }

            serializer = DashboardSerializer(data)
            return Response(serializer.data)

        except Exception as e:
            logger.exception("Error fetching dashboard data")
            return Response({"error": str(e)}, status=500)