# from celery import shared_task
# from user_management.services import SMSService
# from user_management.serializers.plan_serializer import PlanAnalyticsSnapshot
# from django.utils import timezone
# from account.models.admin_model import Client, Subscription, Router
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import Payment
# from django.utils import timezone
# from django.db.models import (
#     Count, Sum, Q, F, ExpressionWrapper, FloatField,
#     Case, When, Value, CharField
# )
# from datetime import timedelta


# @shared_task
# def check_data_usage_and_notify():
#     sms_service = SMSService()
#     sms_service.check_and_notify_data_usage(75)
#     sms_service.check_and_notify_data_usage(90)
#     sms_service.check_and_notify_expiry()

# @shared_task
# def create_daily_analytics_snapshot():
#     # Get all clients with their current subscriptions
#     clients = Client.objects.prefetch_related(
#         'subscriptions', 
#         'subscriptions__internet_plan',
#         'payments'
#     ).annotate(
#         payment_status=Case(
#             When(payments__transaction__status='Success', then=Value('Paid')),
#             When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#             default=Value('Due'),
#             output_field=CharField()
#         )
#     ).distinct()
    
#     # Get network usage data with calculated percentage
#     hotspot_users = HotspotUser.objects.filter(
#         active=True,
#         plan__data_limit_unit__in=['GB', 'TB']  # Skip unlimited plans
#     ).annotate(
#         data_limit_bytes=ExpressionWrapper(
#             F('plan__data_limit_value') * 
#             (1024**3 if F('plan__data_limit_unit') == 'GB' else 1024**4),
#             output_field=FloatField()
#         ),
#         usage_percentage=ExpressionWrapper(
#             F('data_used') * 100 / F('data_limit_bytes'),
#             output_field=FloatField()
#         )
#     )
    
#     # Create snapshot
#     PlanAnalyticsSnapshot.objects.create(
#         total_clients=clients.count(),
#         active_clients=clients.filter(
#             subscriptions__is_active=True,
#             subscriptions__end_date__gte=timezone.now()
#         ).count(),
#         high_usage_clients=hotspot_users.filter(
#             usage_percentage__gte=75
#         ).values('client').distinct().count(),
#         collected_revenue=Payment.objects.filter(
#             transaction__status='Success'
#         ).aggregate(total=Sum('amount'))['total'] or 0,
#         active_devices=hotspot_users.values('mac').distinct().count(),
#         congested_routers=Router.objects.filter(
#             status='connected',
#             stats__cpu__gte=80
#         ).count()
#     )

# @shared_task
# def send_payment_reminders():
#     sms_service = SMSService()
    
#     # Clients with due payments and active subscriptions
#     clients = Client.objects.filter(
#         payments__transaction__status='Success',
#         subscriptions__is_active=True,
#         subscriptions__end_date__gte=timezone.now() - timedelta(days=3),
#         subscriptions__end_date__lte=timezone.now() + timedelta(days=3)
#     ).distinct()
    
#     for client in clients:
#         sms_service.send_bulk_sms(
#             [client.id],
#             'PAYMENT_REMINDER'
#         )





# from celery import shared_task
# from user_management.services import SMSService
# from django.utils import timezone
# from datetime import timedelta

# @shared_task
# def check_data_usage_and_notify():
#     sms_service = SMSService()
#     sms_service.check_and_notify_data_usage(threshold_percentage=75)  # Prioritize 75% threshold
#     sms_service.check_and_notify_data_usage()  # Check other thresholds

# @shared_task
# def check_expiry_and_notify():
#     sms_service = SMSService()
#     sms_service.check_and_notify_expiry()

# @shared_task
# def create_daily_analytics_snapshot():
#     from user_management.api.views.plan_views import PlanAnalyticsDashboardView
#     view = PlanAnalyticsDashboardView()
#     clients = Client.objects.prefetch_related('subscriptions', 'payments')
#     hotspot_users = HotspotUser.objects.filter(active=True)
#     view._create_analytics_snapshot(clients, hotspot_users)


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