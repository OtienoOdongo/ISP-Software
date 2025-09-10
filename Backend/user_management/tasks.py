


from celery import shared_task
from user_management.services import SMSService
from django.utils import timezone
from datetime import timedelta
from account.models.admin_model import Client
from network_management.models.router_management_model import HotspotUser

@shared_task
def check_data_usage_and_notify():
    sms_service = SMSService()
    sms_service.check_and_notify_data_usage(threshold_percentage=75)
    sms_service.check_and_notify_data_usage(threshold_percentage=90)

@shared_task
def check_expiry_and_notify():
    sms_service = SMSService()
    sms_service.check_and_notify_expiry()

@shared_task
def create_daily_analytics_snapshot():
    from user_management.api.views.plan_views import PlanAnalyticsDashboardView
    view = PlanAnalyticsDashboardView()
    clients = Client.objects.prefetch_related('subscriptions', 'payments')
    hotspot_users = HotspotUser.objects.filter(active=True)
    view._create_analytics_snapshot(clients, hotspot_users)