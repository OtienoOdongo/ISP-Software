






# # user_management/serializers/user_serializer.py
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
# from django.db import models

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




from rest_framework import serializers
from user_management.models.user_model import BrowsingHistory
from account.models.admin_model import Client, Subscription
from account.serializers.admin_serializer import ClientSerializer, SubscriptionSerializer
from internet_plans.models.create_plan_models import InternetPlan
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from network_management.models.router_management_model import HotspotUser
from network_management.serializers.router_management_serializer import HotspotUserSerializer
from payments.models.mpesa_config_model import Transaction
from payments.serializers.mpesa_config_serializer import TransactionSerializer
from django.utils import timezone
from django.db import models

class BrowsingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BrowsingHistory
        fields = ('url', 'frequency', 'data_used')

class EnhancedTransactionSerializer(TransactionSerializer):
    plan = InternetPlanSerializer(read_only=True)
    purchase_date = serializers.DateTimeField(source='timestamp')
    duration = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()

    class Meta(TransactionSerializer.Meta):
        fields = ('id', 'client', 'amount', 'plan', 'purchase_date', 'duration', 'status', 'payment_method', 'invoice_number')

    def get_duration(self, obj):
        try:
            if obj.plan and obj.plan.expiry:
                expiry = obj.plan.expiry
                return f"{expiry['value']} {expiry['unit'].lower()}"
        except (AttributeError, KeyError, TypeError):
            pass
        return "1 month"

    def get_status(self, obj):
        if obj.subscription:
            today = timezone.now().date()
            expiry = obj.subscription.end_date.date()
            return "Active" if today < expiry else "Expired"
        return "Expired"

    def get_payment_method(self, obj):
        return "M-Pesa" if obj.mpesa_code else "Unknown"

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
            try:
                data_limit = hotspot_user.plan.data_limit
                used_bytes = hotspot_user.data_used
                used_gb = used_bytes / (1024 ** 3)  # Convert bytes to GB
                total = data_limit['value'] if data_limit.get('unit') != 'Unlimited' else 'unlimited'
                return {'used': round(used_gb, 1), 'total': total, 'unit': 'GB'}
            except (AttributeError, KeyError, TypeError):
                pass
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
        transactions = Transaction.objects.filter(client=obj).order_by('-timestamp')
        purchase_serializer = EnhancedTransactionSerializer(transactions, many=True)

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
            Transaction.objects.filter(client=obj, plan__isnull=False)
            .values_list('plan__name', flat=True)
        ))

        # Last upgrade
        last_upgrade = None
        transactions = Transaction.objects.filter(client=obj).order_by('timestamp')
        for i in range(1, len(transactions)):
            if transactions[i].amount > transactions[i-1].amount:
                last_upgrade = transactions[i].timestamp.strftime('%Y-%m-%d')
                break

        # Average monthly usage
        avg_monthly_usage = 0.0
        try:
            avg_monthly_usage = (
                sum(float(EnhancedSubscriptionSerializer(sub).data.get('data_usage', {}).get('used', 0))
                    for sub in subscriptions)
                / max(1, subscriptions.count())
            )
        except (ValueError, TypeError):
            pass

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
            try:
                used = float(data_usage['used'])
                total = float(data_usage['total']) if data_usage['total'].isdigit() else 0
                return used < total
            except (ValueError, TypeError):
                return False
        return False

    def get_is_unlimited(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription:
            data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
            return data_usage['total'] == 'unlimited'
        return False

    def get_total_revenue(self, obj):
        total = Transaction.objects.filter(client=obj).aggregate(total=models.Sum('amount'))['total']
        return float(total) if total else 0.0

    def get_renewal_frequency(self, obj):
        transaction_count = Transaction.objects.filter(client=obj).count()
        return f"{transaction_count} renewals" if transaction_count > 1 else "No renewals"

    def get_avg_monthly_spend(self, obj):
        total_revenue = self.get_total_revenue(obj)
        first_transaction = Transaction.objects.filter(client=obj).order_by('timestamp').first()
        if not first_transaction:
            return 0.0
        months_active = (
            (timezone.now().year - first_transaction.timestamp.year) * 12 +
            (timezone.now().month - first_transaction.timestamp.month) + 1
        )
        return round(total_revenue / max(months_active, 1), 2)

    def get_loyalty_duration(self, obj):
        first_transaction = Transaction.objects.filter(client=obj).order_by('timestamp').first()
        if not first_transaction:
            return 0
        duration_days = (timezone.now() - first_transaction.timestamp).days
        return duration_days // 30  # Approximate months