# from rest_framework import serializers
# from user_management.models.user_model import ClientProfile, ClientDataUsage, ClientSiteVisit, SMSNotification
# from account.models.admin_model import Client, Subscription
# from account.serializers.admin_serializer import ClientSerializer, SubscriptionSerializer
# from payments.models.mpesa_config_model import Transaction
# from payments.serializers.mpesa_config_serializer import TransactionSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.serializers.router_management_serializer import HotspotUserSerializer

# class ClientProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ClientProfile
#         fields = ['device', 'device_id', 'location', 'last_login']

# class ClientDataUsageSerializer(serializers.ModelSerializer):
#     usage_percentage = serializers.FloatField(read_only=True)

#     class Meta:
#         model = ClientDataUsage
#         fields = ['used', 'total', 'unit', 'month', 'created_at', 'usage_percentage']

# class ClientSiteVisitSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ClientSiteVisit
#         fields = ['url', 'frequency', 'data_used', 'last_visited']

# class SMSNotificationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SMSNotification
#         fields = ['message', 'sent_at', 'status', 'reason', 'trigger']

# class ClientDetailSerializer(serializers.ModelSerializer):
#     profile = ClientProfileSerializer(read_only=True)
#     current_subscription = serializers.SerializerMethodField()
#     payment_history = serializers.SerializerMethodField()
#     data_usage = serializers.SerializerMethodField()
#     visited_sites = serializers.SerializerMethodField()
#     preferred_plans = serializers.SerializerMethodField()
#     last_upgrade = serializers.SerializerMethodField()
#     average_monthly_usage = serializers.SerializerMethodField()
#     sms_notifications = serializers.SerializerMethodField()
#     hotspot_user = serializers.SerializerMethodField()

#     class Meta:
#         model = Client
#         fields = [
#             'id', 'full_name', 'phonenumber', 'created_at', 'profile',
#             'current_subscription', 'payment_history', 'data_usage',
#             'visited_sites', 'preferred_plans', 'last_upgrade',
#             'average_monthly_usage', 'sms_notifications', 'hotspot_user'
#         ]

#     def get_current_subscription(self, obj):
#         subscription = obj.subscriptions.filter(is_active=True).first()
#         if subscription:
#             data = SubscriptionSerializer(subscription).data
#             plan = subscription.plan if hasattr(subscription, 'plan') else None
#             if plan:
#                 data['plan'] = InternetPlanSerializer(plan).data
#             return data
#         return None

#     def get_payment_history(self, obj):
#         transactions = Transaction.objects.filter(
#             phone_number=obj.phonenumber,
#             status='Success'
#         ).order_by('-timestamp')[:10]
#         return TransactionSerializer(transactions, many=True).data

#     def get_data_usage(self, obj):
#         usage = obj.data_usage.all().order_by('-created_at')[:12]
#         return ClientDataUsageSerializer(usage, many=True).data

#     def get_visited_sites(self, obj):
#         sites = obj.visited_sites.all().order_by('-last_visited')[:10]
#         return ClientSiteVisitSerializer(sites, many=True).data

#     def get_preferred_plans(self, obj):
#         plans = Transaction.objects.filter(
#             phone_number=obj.phonenumber,
#             status='Success'
#         ).values('plan__name').annotate(count=Count('plan')).order_by('-count')[:2]
#         return [plan['plan__name'] for plan in plans]

#     def get_last_upgrade(self, obj):
#         transactions = Transaction.objects.filter(
#             phone_number=obj.phonenumber,
#             status='Success'
#         ).order_by('-timestamp')
#         if len(transactions) > 1:
#             for i in range(len(transactions) - 1):
#                 if transactions[i].plan.price > transactions[i + 1].plan.price:
#                     return transactions[i].timestamp.strftime('%Y-%m-%d')
#         return None

#     def get_average_monthly_usage(self, obj):
#         usage = obj.data_usage.all()
#         if not usage:
#             return '0 GB'
#         total_used = sum(float(u.used) for u in usage if u.unit == 'GB')
#         months = len(set(u.month for u in usage))
#         avg = total_used / max(months, 1)
#         return f'{avg:.1f} GB'

#     def get_sms_notifications(self, obj):
#         notifications = obj.sms_notifications.filter(trigger='DataUsage80').order_by('-sent_at')[:5]
#         return SMSNotificationSerializer(notifications, many=True).data

#     def get_hotspot_user(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         if hotspot_user:
#             return HotspotUserSerializer(hotspot_user).data
#         return None





# from rest_framework import serializers
# from user_profile.models.user_profile_models import UserProfile, DataUsage, VisitedSite
# from account.serializers.admin_serializer import ClientSerializer, SubscriptionSerializer
# from payments.serializers.mpesa_config_serializer import TransactionSerializer
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from account.models.admin_model import Client, Subscription
# from payments.models.mpesa_config_model import Transaction
# from django.utils import timezone

# class DataUsageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DataUsage
#         fields = ['month', 'used', 'total', 'unit']
    
#     def to_representation(self, instance):
#         return {
#             'month': instance.timestamp.strftime('%b %Y'),
#             'used': instance.used,
#             'total': instance.total,
#             'unit': instance.unit
#         }

# class VisitedSiteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = VisitedSite
#         fields = ['url', 'frequency', 'data_used']

# class PurchaseHistorySerializer(serializers.ModelSerializer):
#     plan = InternetPlanSerializer(read_only=True)
    
#     class Meta:
#         model = Transaction
#         fields = ['plan', 'purchase_date', 'duration', 'price', 'status', 'payment_method', 'invoice_number']
    
#     def to_representation(self, instance):
#         plan = instance.plan
#         expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
#         return {
#             'plan': plan.name,
#             'purchase_date': instance.timestamp,
#             'duration': f"{expiry_days} {'day' if expiry_days == 1 else 'days'}",
#             'price': float(instance.amount),
#             'status': instance.status,
#             'payment_method': 'M-Pesa',  # Assuming M-Pesa for now
#             'invoice_number': instance.mpesa_code or f"INV-{instance.id}"
#         }

# class UserProfileSerializer(serializers.ModelSerializer):
#     client = ClientSerializer(read_only=True)
#     data_usage = DataUsageSerializer(source='data_usage_history', many=True, read_only=True)
#     visited_sites = VisitedSiteSerializer(many=True, read_only=True)
#     subscription = serializers.SerializerMethodField()
#     purchase_history = serializers.SerializerMethodField()
#     preferred_plans = serializers.SerializerMethodField()
#     last_upgrade = serializers.SerializerMethodField()
#     average_monthly_usage = serializers.SerializerMethodField()

#     class Meta:
#         model = UserProfile
#         fields = [
#             'id', 'client', 'full_name', 'email', 'phone', 'last_login', 'data_usage',
#             'subscription', 'location', 'device', 'history', 'visited_sites',
#             'preferred_plans', 'last_upgrade', 'average_monthly_usage', 'purchase_history'
#         ]

#     def get_full_name(self, obj):
#         return obj.client.full_name

#     def get_email(self, obj):
#         return obj.client.email if hasattr(obj.client, 'email') else ''

#     def get_phone(self, obj):
#         return str(obj.client.phonenumber)

#     def get_subscription(self, obj):
#         subscription = Subscription.objects.filter(client=obj.client, is_active=True).first()
#         if subscription:
#             return {
#                 'plan': subscription.plan.name if hasattr(subscription, 'plan') else 'Unknown',
#                 'start_date': subscription.start_date,
#                 'expiry_date': subscription.end_date
#             }
#         return None

#     def get_purchase_history(self, obj):
#         transactions = Transaction.objects.filter(phone_number=obj.client.phonenumber, status='Success')
#         return PurchaseHistorySerializer(transactions, many=True).data

#     def get_preferred_plans(self, obj):
#         transactions = Transaction.objects.filter(phone_number=obj.client.phonenumber, status='Success')
#         plans = [t.plan.name for t in transactions if t.plan]
#         return list(set(plans))[:2]  # Return top 2 unique plans

#     def get_last_upgrade(self, obj):
#         transactions = Transaction.objects.filter(phone_number=obj.client.phonenumber, status='Success').order_by('-timestamp')
#         if len(transactions) > 1:
#             for i in range(len(transactions) - 1):
#                 if transactions[i].amount > transactions[i + 1].amount:
#                     return transactions[i].timestamp
#         return None

#     def get_average_monthly_usage(self, obj):
#         data_usages = obj.data_usage_history.all()
#         if not data_usages:
#             return '0 GB'
#         total_used = sum(usage.used for usage in data_usages if usage.unit == 'GB')
#         months = len(set(usage.timestamp.strftime('%Y-%m') for usage in data_usages))
#         return f"{total_used / max(months, 1):.1f} GB"

#     def to_representation(self, instance):
#         data = super().to_representation(instance)
#         data['history'] = {
#             'dataUsage': data.pop('data_usage'),
#             'visitedSites': data.pop('visited_sites'),
#             'preferredPlans': data.pop('preferred_plans'),
#             'lastUpgrade': data.pop('last_upgrade'),
#             'averageMonthlyUsage': data.pop('average_monthly_usage'),
#             'purchaseHistory': data.pop('purchase_history')
#         }
#         return data





# from rest_framework import serializers
# from user_management.models.user_model import BrowsingHistory
# from account.models.admin_model import Client, Subscription, Payment
# from account.serializers.admin_serializer import ClientSerializer, SubscriptionSerializer, PaymentSerializer
# from internet_plans.models.create_plan_models import InternetPlan
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.models.router_management_model import HotspotUser
# from network_management.serializers.router_management_serializer import HotspotUserSerializer
# from payments.models.mpesa_config_model import Transaction
# from payments.serializers.mpesa_config_serializer import TransactionSerializer
# from django.utils import timezone
# from datetime import datetime
# import re

# class BrowsingHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BrowsingHistory
#         fields = ('url', 'frequency', 'data_used')

# class EnhancedPaymentSerializer(PaymentSerializer):
#     plan = InternetPlanSerializer(read_only=True, source='transaction.plan')
#     purchase_date = serializers.DateTimeField(source='timestamp')
#     duration = serializers.SerializerMethodField()
#     status = serializers.SerializerMethodField()
#     payment_method = serializers.SerializerMethodField()
#     invoice_number = serializers.SerializerMethodField()

#     class Meta(PaymentSerializer.Meta):
#         fields = ('id', 'client', 'amount', 'plan', 'purchase_date', 'duration', 'status', 'payment_method', 'invoice_number')

#     def get_duration(self, obj):
#         if obj.transaction and obj.transaction.plan:
#             expiry = obj.transaction.plan.expiry
#             return f"{expiry['value']} {expiry['unit'].lower()}"
#         return "1 month"

#     def get_status(self, obj):
#         if obj.subscription:
#             today = timezone.now().date()
#             expiry = obj.subscription.end_date.date()
#             return "Active" if today < expiry else "Expired"
#         return "Expired"

#     def get_payment_method(self, obj):
#         return "M-Pesa" if obj.transaction and obj.transaction.mpesa_code else "Unknown"

#     def get_invoice_number(self, obj):
#         timestamp_str = obj.timestamp.strftime('%Y%m%d%H%M%S')
#         return f"INV-{timestamp_str}-{obj.client.id}"

# class EnhancedSubscriptionSerializer(SubscriptionSerializer):
#     plan = InternetPlanSerializer(read_only=True, source='internet_plan')
#     start_date = serializers.DateTimeField(format='%Y-%m-%d')
#     expiry_date = serializers.DateTimeField(source='end_date', format='%Y-%m-%d')
#     data_usage = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()

#     class Meta(SubscriptionSerializer.Meta):
#         fields = ('id', 'client', 'plan', 'is_active', 'start_date', 'expiry_date', 'data_usage', 'device')

#     def get_data_usage(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#         if hotspot_user and hotspot_user.plan:
#             data_limit = hotspot_user.plan.data_limit
#             used_bytes = hotspot_user.data_used
#             used_gb = used_bytes / (1024 ** 3)  # Convert bytes to GB
#             total = data_limit['value'] if data_limit['unit'] != 'Unlimited' else 'unlimited'
#             return {'used': round(used_gb, 1), 'total': total, 'unit': 'GB'}
#         return {'used': 0, 'total': '0', 'unit': 'GB'}

#     def get_device(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#         return hotspot_user.mac if hotspot_user else "Unknown"

# class ClientProfileSerializer(ClientSerializer):
#     last_login = serializers.DateTimeField(read_only=True, default=None)
#     data_usage = serializers.SerializerMethodField()
#     subscription = serializers.SerializerMethodField()
#     location = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()
#     history = serializers.SerializerMethodField()
#     payment_status = serializers.SerializerMethodField()
#     active = serializers.SerializerMethodField()
#     is_unlimited = serializers.SerializerMethodField()
#     total_revenue = serializers.SerializerMethodField()
#     renewal_frequency = serializers.SerializerMethodField()
#     avg_monthly_spend = serializers.SerializerMethodField()
#     loyalty_duration = serializers.SerializerMethodField()

#     class Meta(ClientSerializer.Meta):
#         fields = (
#             'id', 'full_name', 'phonenumber', 'last_login',
#             'data_usage', 'subscription', 'location', 'device', 'history',
#             'payment_status', 'active', 'is_unlimited', 'total_revenue',
#             'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration'
#         )

#     def get_data_usage(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription:
#             return EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#         return {'used': 0, 'total': '0', 'unit': 'GB'}

#     def get_subscription(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription and active_subscription.internet_plan:
#             return {
#                 'plan': active_subscription.internet_plan.name,
#                 'startDate': active_subscription.start_date.strftime('%Y-%m-%d'),
#                 'expiryDate': active_subscription.end_date.strftime('%Y-%m-%d')
#             }
#         return None

#     def get_location(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         return hotspot_user.router.location if hotspot_user and hotspot_user.router.location else "Unknown"

#     def get_device(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         return hotspot_user.mac if hotspot_user else "Unknown"

#     def get_history(self, obj):
#         # Purchase history
#         payments = Payment.objects.filter(client=obj).order_by('-timestamp')
#         purchase_serializer = EnhancedPaymentSerializer(payments, many=True)

#         # Data usage history
#         data_usage_history = []
#         subscriptions = Subscription.objects.filter(client=obj)
#         for sub in subscriptions:
#             data_usage = EnhancedSubscriptionSerializer(sub).data.get('data_usage')
#             if data_usage:
#                 data_usage_history.append({
#                     'month': sub.start_date.strftime('%b %Y'),
#                     'used': data_usage['used'],
#                     'total': data_usage['total'],
#                     'unit': data_usage['unit']
#                 })

#         # Browsing history
#         visited_sites = BrowsingHistory.objects.filter(client=obj).order_by('-timestamp')
#         visited_sites_serializer = BrowsingHistorySerializer(visited_sites, many=True)

#         # Preferred plans
#         preferred_plans = list(set(
#             Payment.objects.filter(client=obj, transaction__plan__isnull=False)
#             .values_list('transaction__plan__name', flat=True)
#         ))

#         # Last upgrade
#         last_upgrade = None
#         payments = Payment.objects.filter(client=obj).order_by('timestamp')
#         for i in range(1, len(payments)):
#             if payments[i].amount > payments[i-1].amount:
#                 last_upgrade = payments[i].timestamp.strftime('%Y-%m-%d')
#                 break

#         # Average monthly usage
#         avg_monthly_usage = (
#             sum(float(EnhancedSubscriptionSerializer(sub).data.get('data_usage', {}).get('used', 0))
#                 for sub in subscriptions)
#             / max(1, subscriptions.count())
#         )

#         return {
#             'dataUsage': data_usage_history,
#             'visitedSites': visited_sites_serializer.data,
#             'preferredPlans': preferred_plans,
#             'lastUpgrade': last_upgrade,
#             'averageMonthlyUsage': f"{avg_monthly_usage:.1f}GB",
#             'purchaseHistory': purchase_serializer.data
#         }

#     def get_payment_status(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription:
#             today = timezone.now().date()
#             expiry = active_subscription.end_date.date()
#             if today < expiry:
#                 return "Paid"
#             elif today == expiry:
#                 return "Due"
#             return "Expired"
#         return "Expired"

#     def get_active(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription:
#             data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#             if data_usage['total'] == 'unlimited':
#                 return True
#             used = float(data_usage['used'])
#             total = float(data_usage['total']) if data_usage['total'].isdigit() else 0
#             return used < total
#         return False

#     def get_is_unlimited(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription:
#             data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#             return data_usage['total'] == 'unlimited'
#         return False

#     def get_total_revenue(self, obj):
#         total = Payment.objects.filter(client=obj).aggregate(total=models.Sum('amount'))['total']
#         return float(total) if total else 0.0

#     def get_renewal_frequency(self, obj):
#         payment_count = Payment.objects.filter(client=obj).count()
#         return f"{payment_count} renewals" if payment_count > 1 else "No renewals"

#     def get_avg_monthly_spend(self, obj):
#         total_revenue = self.get_total_revenue(obj)
#         first_payment = Payment.objects.filter(client=obj).order_by('timestamp').first()
#         if not first_payment:
#             return 0.0
#         months_active = (
#             (timezone.now().year - first_payment.timestamp.year) * 12 +
#             (timezone.now().month - first_payment.timestamp.month) + 1
#         )
#         return round(total_revenue / max(months_active, 1), 2)

#     def get_loyalty_duration(self, obj):
#         first_payment = Payment.objects.filter(client=obj).order_by('timestamp').first()
#         if not first_payment:
#             return 0
#         duration_days = (timezone.now() - first_payment.timestamp).days
#         return duration_days // 30  # Approximate months






# user_management/serializers/user_serializer.py
from rest_framework import serializers
from user_management.models.user_model import BrowsingHistory
from account.models.admin_model import Client, Subscription, Payment
from account.serializers.admin_serializer import ClientSerializer, SubscriptionSerializer, PaymentSerializer
from internet_plans.models.create_plan_models import InternetPlan
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from network_management.models.router_management_model import HotspotUser
from network_management.serializers.router_management_serializer import HotspotUserSerializer
from payments.models.mpesa_config_model import Transaction
from payments.serializers.mpesa_config_serializer import TransactionSerializer
from django.utils import timezone
from datetime import datetime
import re
from django.db import models

class BrowsingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BrowsingHistory
        fields = ('url', 'frequency', 'data_used')

class EnhancedPaymentSerializer(PaymentSerializer):
    plan = InternetPlanSerializer(read_only=True, source='transaction.plan')
    purchase_date = serializers.DateTimeField(source='timestamp')
    duration = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()

    class Meta(PaymentSerializer.Meta):
        fields = ('id', 'client', 'amount', 'plan', 'purchase_date', 'duration', 'status', 'payment_method', 'invoice_number')

    def get_duration(self, obj):
        if obj.transaction and obj.transaction.plan:
            expiry = obj.transaction.plan.expiry
            return f"{expiry['value']} {expiry['unit'].lower()}"
        return "1 month"

    def get_status(self, obj):
        if obj.subscription:
            today = timezone.now().date()
            expiry = obj.subscription.end_date.date()
            return "Active" if today < expiry else "Expired"
        return "Expired"

    def get_payment_method(self, obj):
        return "M-Pesa" if obj.transaction and obj.transaction.mpesa_code else "Unknown"

    def get_invoice_number(self, obj):
        timestamp_str = obj.timestamp.strftime('%Y%m%d%H%M%S')
        return f"INV-{timestamp_str}-{obj.client.id}"

class EnhancedSubscriptionSerializer(SubscriptionSerializer):
    plan = InternetPlanSerializer(read_only=True, source='internet_plan')
    start_date = serializers.DateTimeField(format='%Y-%m-%d')
    expiry_date = serializers.DateTimeField(source='end_date', format='%Y-%m-%d')
    data_usage = serializers.SerializerMethodField()
    device = serializers.SerializerMethodField()

    class Meta(SubscriptionSerializer.Meta):
        fields = ('id', 'client', 'plan', 'is_active', 'start_date', 'expiry_date', 'data_usage', 'device')

    def get_data_usage(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
        if hotspot_user and hotspot_user.plan:
            data_limit = hotspot_user.plan.data_limit
            used_bytes = hotspot_user.data_used
            used_gb = used_bytes / (1024 ** 3)  # Convert bytes to GB
            total = data_limit['value'] if data_limit['unit'] != 'Unlimited' else 'unlimited'
            return {'used': round(used_gb, 1), 'total': total, 'unit': 'GB'}
        return {'used': 0, 'total': '0', 'unit': 'GB'}

    def get_device(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
        return hotspot_user.mac if hotspot_user else "Unknown"

class ClientProfileSerializer(ClientSerializer):
    last_login = serializers.DateTimeField(read_only=True, default=None)
    data_usage = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    device = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()
    is_unlimited = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    renewal_frequency = serializers.SerializerMethodField()
    avg_monthly_spend = serializers.SerializerMethodField()
    loyalty_duration = serializers.SerializerMethodField()

    class Meta(ClientSerializer.Meta):
        fields = (
            'id', 'full_name', 'phonenumber', 'last_login',
            'data_usage', 'subscription', 'location', 'device', 'history',
            'payment_status', 'active', 'is_unlimited', 'total_revenue',
            'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration'
        )

    def get_data_usage(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription:
            return EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
        return {'used': 0, 'total': '0', 'unit': 'GB'}

    def get_subscription(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription and active_subscription.internet_plan:
            return {
                'plan': active_subscription.internet_plan.name,
                'startDate': active_subscription.start_date.strftime('%Y-%m-%d'),
                'expiryDate': active_subscription.end_date.strftime('%Y-%m-%d')
            }
        return None

    def get_location(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
        return hotspot_user.router.location if hotspot_user and hotspot_user.router.location else "Unknown"

    def get_device(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
        return hotspot_user.mac if hotspot_user else "Unknown"

    def get_history(self, obj):
        # Purchase history
        payments = Payment.objects.filter(client=obj).order_by('-timestamp')
        purchase_serializer = EnhancedPaymentSerializer(payments, many=True)

        # Data usage history
        data_usage_history = []
        subscriptions = Subscription.objects.filter(client=obj)
        for sub in subscriptions:
            data_usage = EnhancedSubscriptionSerializer(sub).data.get('data_usage')
            if data_usage:
                data_usage_history.append({
                    'month': sub.start_date.strftime('%b %Y'),
                    'used': data_usage['used'],
                    'total': data_usage['total'],
                    'unit': data_usage['unit']
                })

        # Browsing history
        visited_sites = BrowsingHistory.objects.filter(client=obj).order_by('-timestamp')
        visited_sites_serializer = BrowsingHistorySerializer(visited_sites, many=True)

        # Preferred plans
        preferred_plans = list(set(
            Payment.objects.filter(client=obj, transaction__plan__isnull=False)
            .values_list('transaction__plan__name', flat=True)
        ))

        # Last upgrade
        last_upgrade = None
        payments = Payment.objects.filter(client=obj).order_by('timestamp')
        for i in range(1, len(payments)):
            if payments[i].amount > payments[i-1].amount:
                last_upgrade = payments[i].timestamp.strftime('%Y-%m-%d')
                break

        # Average monthly usage
        avg_monthly_usage = (
            sum(float(EnhancedSubscriptionSerializer(sub).data.get('data_usage', {}).get('used', 0))
                for sub in subscriptions)
            / max(1, subscriptions.count())
        )

        return {
            'dataUsage': data_usage_history,
            'visitedSites': visited_sites_serializer.data,
            'preferredPlans': preferred_plans,
            'lastUpgrade': last_upgrade,
            'averageMonthlyUsage': f"{avg_monthly_usage:.1f}GB",
            'purchaseHistory': purchase_serializer.data
        }

    def get_payment_status(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription:
            today = timezone.now().date()
            expiry = active_subscription.end_date.date()
            if today < expiry:
                return "Paid"
            elif today == expiry:
                return "Due"
            return "Expired"
        return "Expired"

    def get_active(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription:
            data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
            if data_usage['total'] == 'unlimited':
                return True
            used = float(data_usage['used'])
            total = float(data_usage['total']) if data_usage['total'].isdigit() else 0
            return used < total
        return False

    def get_is_unlimited(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription:
            data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
            return data_usage['total'] == 'unlimited'
        return False

    def get_total_revenue(self, obj):
        total = Payment.objects.filter(client=obj).aggregate(total=models.Sum('amount'))['total']
        return float(total) if total else 0.0

    def get_renewal_frequency(self, obj):
        payment_count = Payment.objects.filter(client=obj).count()
        return f"{payment_count} renewals" if payment_count > 1 else "No renewals"

    def get_avg_monthly_spend(self, obj):
        total_revenue = self.get_total_revenue(obj)
        first_payment = Payment.objects.filter(client=obj).order_by('timestamp').first()
        if not first_payment:
            return 0.0
        months_active = (
            (timezone.now().year - first_payment.timestamp.year) * 12 +
            (timezone.now().month - first_payment.timestamp.month) + 1
        )
        return round(total_revenue / max(months_active, 1), 2)

    def get_loyalty_duration(self, obj):
        first_payment = Payment.objects.filter(client=obj).order_by('timestamp').first()
        if not first_payment:
            return 0
        duration_days = (timezone.now() - first_payment.timestamp).days
        return duration_days // 30  # Approximate months