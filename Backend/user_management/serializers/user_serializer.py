






# # user_management/serializers/user_serializer.py
# from rest_framework import serializers
# from user_management.models.user_model import BrowsingHistory, CommunicationLog
# from account.models.admin_model import Client
# from account.serializers.admin_serializer import ClientSerializer
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer, SubscriptionSerializer
# from network_management.models.router_management_model import HotspotUser
# from network_management.serializers.router_management_serializer import HotspotUserSerializer
# from payments.models.payment_config_model import Transaction
# from payments.serializers.payment_config_serializer import TransactionSerializer
# from django.utils import timezone
# from django.db import models

# class BrowsingHistorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BrowsingHistory
#         fields = ('url', 'frequency', 'data_used')

# class CommunicationLogSerializer(serializers.ModelSerializer):
#     formatted_timestamp = serializers.SerializerMethodField()
#     trigger_display = serializers.CharField(source='get_trigger_type_display', read_only=True)  # Added for human-readable trigger
    
#     class Meta:
#         model = CommunicationLog
#         fields = ('id', 'message_type', 'trigger_type', 'trigger_display', 'subject', 'message', 'status', 'formatted_timestamp', 'sent_at')
    
#     def get_formatted_timestamp(self, obj):
#         return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S') if obj.timestamp else None

# class EnhancedTransactionSerializer(TransactionSerializer):
#     plan = InternetPlanSerializer(read_only=True)
#     purchase_date = serializers.DateTimeField(source='created_at')
#     duration = serializers.SerializerMethodField()
#     status = serializers.SerializerMethodField()
#     payment_method = serializers.SerializerMethodField()
#     invoice_number = serializers.SerializerMethodField()

#     class Meta(TransactionSerializer.Meta):
#         fields = ('id', 'client', 'amount', 'plan', 'purchase_date', 'duration', 'status', 'payment_method', 'invoice_number')

#     def get_duration(self, obj):
#         try:
#             if obj.plan and obj.plan.expiry:
#                 expiry = obj.plan.expiry
#                 return f"{expiry['value']} {expiry['unit'].lower()}"
#         except (AttributeError, KeyError, TypeError):
#             pass
#         return "1 month"

#     def get_status(self, obj):
#         if obj.subscription:
#             today = timezone.now().date()
#             expiry = obj.subscription.end_date.date()
#             return "Active" if today < expiry else "Expired"
#         return "Expired"

#     def get_payment_method(self, obj):
#         return "M-Pesa" if obj.mpesa_code else "Unknown"

#     def get_invoice_number(self, obj):
#         created_str = obj.created_at.strftime('%Y%m%d%H%M%S')
#         return f"INV-{created_str}-{obj.client.id}"

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
#             try:
#                 data_limit = hotspot_user.plan.data_limit
#                 used_bytes = hotspot_user.data_used
#                 used_gb = used_bytes / (1024 ** 3)
#                 total = data_limit['value'] if data_limit.get('unit') != 'Unlimited' else 'unlimited'
#                 return {'used': round(used_gb, 1), 'total': total, 'unit': 'GB'}
#             except (AttributeError, KeyError, TypeError):
#                 pass
#         return {'used': 0, 'total': '0', 'unit': 'GB'}

#     def get_device(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#         return hotspot_user.mac if hotspot_user else "Unknown"

# class ClientProfileSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username', read_only=True)
#     phonenumber = serializers.CharField(source='user.phone_number', read_only=True)
#     last_login = serializers.DateTimeField(source='user.last_login', read_only=True, default=None)
#     data_usage = serializers.SerializerMethodField()
#     subscription = serializers.SerializerMethodField()
#     location = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()
#     history = serializers.SerializerMethodField()
#     communication_logs = serializers.SerializerMethodField()
#     payment_status = serializers.SerializerMethodField()
#     active = serializers.SerializerMethodField()
#     is_unlimited = serializers.SerializerMethodField()
#     total_revenue = serializers.SerializerMethodField()
#     renewal_frequency = serializers.SerializerMethodField()
#     avg_monthly_spend = serializers.SerializerMethodField()
#     loyalty_duration = serializers.SerializerMethodField()

#     class Meta:
#         model = Client
#         fields = (
#             'id', 'username', 'phonenumber', 'last_login',
#             'data_usage', 'subscription', 'location', 'device', 'history',
#             'communication_logs', 'payment_status', 'active', 'is_unlimited', 
#             'total_revenue', 'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration'
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

#     def get_communication_logs(self, obj):
#         logs = CommunicationLog.objects.filter(client=obj).order_by('-timestamp')[:50]  # Last 50 messages
#         return CommunicationLogSerializer(logs, many=True).data

#     def get_history(self, obj):
#         # Purchase history
#         transactions = Transaction.objects.filter(client=obj).order_by('-created_at')
#         purchase_serializer = EnhancedTransactionSerializer(transactions, many=True)

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
#             Transaction.objects.filter(client=obj, plan__isnull=False)
#             .values_list('plan__name', flat=True)
#         ))

#         # Last upgrade
#         last_upgrade = None
#         transactions = Transaction.objects.filter(client=obj).order_by('-created_at')
#         for i in range(1, len(transactions)):
#             if transactions[i].amount > transactions[i-1].amount:
#                 last_upgrade = transactions[i].created_at.strftime('%Y-%m-%d')
#                 break

#         # Average monthly usage
#         avg_monthly_usage = 0.0
#         try:
#             avg_monthly_usage = (
#                 sum(float(EnhancedSubscriptionSerializer(sub).data.get('data_usage', {}).get('used', 0))
#                     for sub in subscriptions)
#                 / max(1, subscriptions.count())
#             )
#         except (ValueError, TypeError):
#             pass

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
#             try:
#                 used = float(data_usage['used'])
#                 total = float(data_usage['total']) if data_usage['total'].isdigit() else 0
#                 return used < total
#             except (ValueError, TypeError):
#                 return False
#         return False

#     def get_is_unlimited(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription:
#             data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#             return data_usage['total'] == 'unlimited'
#         return False

#     def get_total_revenue(self, obj):
#         total = Transaction.objects.filter(client=obj).aggregate(total=models.Sum('amount'))['total']
#         return float(total) if total else 0.0

#     def get_renewal_frequency(self, obj):
#         transaction_count = Transaction.objects.filter(client=obj).count()
#         return f"{transaction_count} renewals" if transaction_count > 1 else "No renewals"

#     def get_avg_monthly_spend(self, obj):
#         total_revenue = self.get_total_revenue(obj)
#         first_transaction = Transaction.objects.filter(client=obj).order_by('-created_at').first()
#         if not first_transaction:
#             return 0.0
#         months_active = (
#             (timezone.now().year - first_transaction.created_at.year) * 12 +
#             (timezone.now().month - first_transaction.created_at.month) + 1
#         )
#         return round(total_revenue / max(months_active, 1), 2)

#     def get_loyalty_duration(self, obj):
#         first_transaction = Transaction.objects.filter(client=obj).order_by('-created_at').first()
#         if not first_transaction:
#             return 0
#         duration_days = (timezone.now() - first_transaction.created_at).days
#         return duration_days // 30







from rest_framework import serializers
from user_management.models.user_model import BrowsingHistory, CommunicationLog
from account.models.admin_model import Client
from account.serializers.admin_serializer import ClientSerializer
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer, SubscriptionSerializer
from network_management.models.router_management_model import HotspotUser, Router
from network_management.serializers.router_management_serializer import HotspotUserSerializer, RouterSerializer
from payments.models.payment_config_model import Transaction
from payments.serializers.payment_config_serializer import TransactionSerializer
from django.utils import timezone
from django.db import models

class BrowsingHistorySerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    hotspot_user = HotspotUserSerializer(read_only=True)
    data_used = serializers.SerializerMethodField()
    
    class Meta:
        model = BrowsingHistory
        fields = ('url', 'frequency', 'data_used', 'router', 'hotspot_user', 'timestamp')

    def get_data_used(self, obj):
        if obj.hotspot_user:
            return f"{obj.hotspot_user.data_used / (1024 ** 3):.1f}GB"
        return "0GB"

class CommunicationLogSerializer(serializers.ModelSerializer):
    router = RouterSerializer(read_only=True)
    formatted_timestamp = serializers.SerializerMethodField()
    trigger_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
    
    class Meta:
        model = CommunicationLog
        fields = ('id', 'message_type', 'trigger_type', 'trigger_display', 'subject', 'message', 'status', 'formatted_timestamp', 'sent_at', 'router')
    
    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S') if obj.timestamp else None

class EnhancedTransactionSerializer(TransactionSerializer):
    plan = InternetPlanSerializer(read_only=True)
    purchase_date = serializers.DateTimeField(source='created_at')
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
        created_str = obj.created_at.strftime('%Y%m%d%H%M%S')
        return f"INV-{created_str}-{obj.client.id}"

class EnhancedSubscriptionSerializer(SubscriptionSerializer):
    plan = InternetPlanSerializer(read_only=True, source='internet_plan')
    start_date = serializers.DateTimeField(format='%Y-%m-%d')
    expiry_date = serializers.DateTimeField(source='end_date', format='%Y-%m-%d')
    data_usage = serializers.SerializerMethodField()
    device = serializers.SerializerMethodField()
    router = serializers.SerializerMethodField()

    class Meta(SubscriptionSerializer.Meta):
        fields = ('id', 'client', 'plan', 'is_active', 'start_date', 'expiry_date', 'data_usage', 'device', 'router')

    def get_data_usage(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
        if hotspot_user and hotspot_user.plan:
            try:
                data_limit = hotspot_user.plan.data_limit
                used_bytes = hotspot_user.data_used
                used_gb = used_bytes / (1024 ** 3)
                total = data_limit['value'] if data_limit.get('unit') != 'Unlimited' else 'unlimited'
                return {'used': round(used_gb, 1), 'total': total, 'unit': 'GB'}
            except (AttributeError, KeyError, TypeError):
                pass
        return {'used': 0, 'total': '0', 'unit': 'GB'}

    def get_device(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
        return hotspot_user.mac if hotspot_user else "Unknown"

    def get_router(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
        return RouterSerializer(hotspot_user.router).data if hotspot_user and hotspot_user.router else None

class ClientProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    phonenumber = serializers.CharField(source='user.phone_number', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True, default=None)
    data_usage = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    device = serializers.SerializerMethodField()
    router = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()
    communication_logs = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()
    is_unlimited = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    renewal_frequency = serializers.SerializerMethodField()
    avg_monthly_spend = serializers.SerializerMethodField()
    loyalty_duration = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = (
            'id', 'username', 'phonenumber', 'last_login',
            'data_usage', 'subscription', 'location', 'device', 'router', 'history',
            'communication_logs', 'payment_status', 'active', 'is_unlimited', 
            'total_revenue', 'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration'
        )

    def get_data_usage(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription:
            return EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
        return {'used': 0, 'total': '0', 'unit': 'GB'}

    def get_subscription(self, obj):
        active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
        if active_subscription and active_subscription.internet_plan:
            return EnhancedSubscriptionSerializer(active_subscription).data
        return None

    def get_location(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
        return hotspot_user.router.location if hotspot_user and hotspot_user.router and hotspot_user.router.location else "Unknown"

    def get_device(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
        return hotspot_user.mac if hotspot_user else "Unknown"

    def get_router(self, obj):
        hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
        return RouterSerializer(hotspot_user.router).data if hotspot_user and hotspot_user.router else None

    def get_communication_logs(self, obj):
        logs = CommunicationLog.objects.filter(client=obj).order_by('-timestamp')[:50]
        return CommunicationLogSerializer(logs, many=True).data

    def get_history(self, obj):
        transactions = Transaction.objects.filter(client=obj).order_by('-created_at')
        purchase_serializer = EnhancedTransactionSerializer(transactions, many=True)

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

        visited_sites = BrowsingHistory.objects.filter(client=obj).order_by('-timestamp')
        visited_sites_serializer = BrowsingHistorySerializer(visited_sites, many=True)

        preferred_plans = list(set(
            Transaction.objects.filter(client=obj, plan__isnull=False)
            .values_list('plan__name', flat=True)
        ))

        last_upgrade = None
        transactions = Transaction.objects.filter(client=obj).order_by('-created_at')
        for i in range(1, len(transactions)):
            if transactions[i].amount > transactions[i-1].amount:
                last_upgrade = transactions[i].created_at.strftime('%Y-%m-%d')
                break

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
        return "No Plan"

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
        first_transaction = Transaction.objects.filter(client=obj).order_by('created_at').first()
        if not first_transaction:
            return 0.0
        months_active = (
            (timezone.now().year - first_transaction.created_at.year) * 12 +
            (timezone.now().month - first_transaction.created_at.month) + 1
        )
        return round(total_revenue / max(1, months_active), 2)

    def get_loyalty_duration(self, obj):
        first_transaction = Transaction.objects.filter(client=obj).order_by('created_at').first()
        if not first_transaction:
            return 0
        months_active = (
            (timezone.now().year - first_transaction.created_at.year) * 12 +
            (timezone.now().month - first_transaction.created_at.month)
        )
        return max(0, months_active)