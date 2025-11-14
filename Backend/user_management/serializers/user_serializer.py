



# from rest_framework import serializers
# from user_management.models.user_model import BrowsingHistory, CommunicationLog
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
# from network_management.serializers.router_management_serializer import HotspotUserSerializer, PPPoEUserSerializer, RouterSerializer
# from payments.models.payment_config_model import Transaction
# from payments.serializers.payment_config_serializer import TransactionSerializer
# from django.utils import timezone
# from django.db import models

# class BrowsingHistorySerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     hotspot_user = HotspotUserSerializer(read_only=True)
#     pppoe_user = PPPoEUserSerializer(read_only=True)
#     data_used = serializers.SerializerMethodField()
#     connection_type = serializers.SerializerMethodField()
    
#     class Meta:
#         model = BrowsingHistory
#         fields = ('url', 'frequency', 'data_used', 'router', 'hotspot_user', 'pppoe_user', 'timestamp', 'connection_type')

#     def get_data_used(self, obj):
#         if obj.hotspot_user:
#             return f"{obj.hotspot_user.data_used / (1024 ** 3):.1f}GB"
#         elif obj.pppoe_user:
#             return f"{obj.pppoe_user.data_used / (1024 ** 3):.1f}GB"
#         return "0GB"

#     def get_connection_type(self, obj):
#         if obj.hotspot_user:
#             return 'hotspot'
#         elif obj.pppoe_user:
#             return 'pppoe'
#         return 'unknown'

# class CommunicationLogSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     formatted_timestamp = serializers.SerializerMethodField()
#     trigger_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
#     connection_type_display = serializers.CharField(source='get_connection_type_display', read_only=True)
    
#     class Meta:
#         model = CommunicationLog
#         fields = ('id', 'message_type', 'trigger_type', 'trigger_display', 'connection_type', 'connection_type_display', 'subject', 'message', 'status', 'formatted_timestamp', 'sent_at', 'router')
    
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

# class EnhancedSubscriptionSerializer(serializers.ModelSerializer):
#     plan = InternetPlanSerializer(read_only=True, source='internet_plan')
#     start_date = serializers.DateTimeField(format='%Y-%m-%d')
#     expiry_date = serializers.DateTimeField(source='end_date', format='%Y-%m-%d')
#     data_usage = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()
#     router = serializers.SerializerMethodField()
#     connection_type = serializers.SerializerMethodField()

#     class Meta:
#         model = Subscription
#         fields = ('id', 'client', 'plan', 'is_active', 'start_date', 'expiry_date', 'data_usage', 'device', 'router', 'connection_type')

#     def get_data_usage(self, obj):
#         # Check for PPPoE user first
#         pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#         if pppoe_user:
#             used_gb = pppoe_user.data_used / (1024 ** 3) if pppoe_user.data_used else 0
#             return {'used': round(used_gb, 1), 'total': 'unlimited', 'unit': 'GB'}
        
#         # Fall back to hotspot user
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
#         # Check for PPPoE user first
#         pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#         if pppoe_user:
#             return f"PPPoE: {pppoe_user.username}"
        
#         # Fall back to hotspot user
#         hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#         return hotspot_user.mac if hotspot_user else "Unknown"

#     def get_router(self, obj):
#         # Check for PPPoE user first
#         pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#         if pppoe_user and pppoe_user.router:
#             return RouterSerializer(pppoe_user.router).data
        
#         # Fall back to hotspot user
#         hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#         return RouterSerializer(hotspot_user.router).data if hotspot_user and hotspot_user.router else None

#     def get_connection_type(self, obj):
#         pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#         if pppoe_user:
#             return 'pppoe'
        
#         hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#         if hotspot_user:
#             return 'hotspot'
        
#         return 'none'

# class ClientConnectionInfoSerializer(serializers.Serializer):
#     connection_type = serializers.CharField()
#     is_active = serializers.BooleanField()
#     username = serializers.CharField(required=False)
#     mac_address = serializers.CharField(required=False)
#     router = RouterSerializer(required=False)
#     connected_at = serializers.DateTimeField(required=False)
#     data_used = serializers.FloatField(required=False)

# class ClientProfileSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username', read_only=True)
#     phonenumber = serializers.CharField(source='user.phone_number', read_only=True)
#     last_login = serializers.DateTimeField(source='user.last_login', read_only=True, default=None)
#     data_usage = serializers.SerializerMethodField()
#     subscription = serializers.SerializerMethodField()
#     location = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()
#     router = serializers.SerializerMethodField()
#     history = serializers.SerializerMethodField()
#     communication_logs = serializers.SerializerMethodField()
#     payment_status = serializers.SerializerMethodField()
#     active = serializers.SerializerMethodField()
#     is_unlimited = serializers.SerializerMethodField()
#     total_revenue = serializers.SerializerMethodField()
#     renewal_frequency = serializers.SerializerMethodField()
#     avg_monthly_spend = serializers.SerializerMethodField()
#     loyalty_duration = serializers.SerializerMethodField()
#     connection_info = serializers.SerializerMethodField()
#     hotspot_user = serializers.SerializerMethodField()
#     pppoe_user = serializers.SerializerMethodField()

#     class Meta:
#         model = Client
#         fields = (
#             'id', 'username', 'phonenumber', 'last_login',
#             'data_usage', 'subscription', 'location', 'device', 'router', 'history',
#             'communication_logs', 'payment_status', 'active', 'is_unlimited', 
#             'total_revenue', 'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration',
#             'connection_info', 'hotspot_user', 'pppoe_user'
#         )

#     def get_data_usage(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription:
#             return EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#         return {'used': 0, 'total': '0', 'unit': 'GB'}

#     def get_subscription(self, obj):
#         active_subscription = Subscription.objects.filter(client=obj, is_active=True).first()
#         if active_subscription and active_subscription.internet_plan:
#             return EnhancedSubscriptionSerializer(active_subscription).data
#         return None

#     def get_location(self, obj):
#         # Check PPPoE first
#         pppoe_user = PPPoEUser.objects.filter(client=obj, active=True).first()
#         if pppoe_user and pppoe_user.router and pppoe_user.router.location:
#             return pppoe_user.router.location
        
#         # Check hotspot
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         return hotspot_user.router.location if hotspot_user and hotspot_user.router and hotspot_user.router.location else "Unknown"

#     def get_device(self, obj):
#         pppoe_user = PPPoEUser.objects.filter(client=obj, active=True).first()
#         if pppoe_user:
#             return f"PPPoE: {pppoe_user.username}"
        
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         return hotspot_user.mac if hotspot_user else "Unknown"

#     def get_router(self, obj):
#         pppoe_user = PPPoEUser.objects.filter(client=obj, active=True).first()
#         if pppoe_user and pppoe_user.router:
#             return RouterSerializer(pppoe_user.router).data
        
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         return RouterSerializer(hotspot_user.router).data if hotspot_user and hotspot_user.router else None

#     def get_communication_logs(self, obj):
#         logs = CommunicationLog.objects.filter(client=obj).order_by('-timestamp')[:50]
#         return CommunicationLogSerializer(logs, many=True).data

#     def get_history(self, obj):
#         """
#         Enhanced history method that includes both Hotspot and PPPoE session history
#         along with existing data usage, browsing history, and purchase information.
#         """
#         # Purchase history
#         transactions = Transaction.objects.filter(client=obj).order_by('-created_at')
#         purchase_serializer = EnhancedTransactionSerializer(transactions, many=True)

#         # Get both Hotspot and PPPoE sessions for comprehensive connection history
#         hotspot_sessions = HotspotUser.objects.filter(client=obj).order_by('-connected_at')
#         pppoe_sessions = PPPoEUser.objects.filter(client=obj).order_by('-connected_at')
        
#         session_history = []
        
#         # Add hotspot sessions with detailed information
#         for session in hotspot_sessions:
#             session_history.append({
#                 'type': 'hotspot',
#                 'mac': session.mac,
#                 'router': session.router.name if session.router else 'Unknown',
#                 'router_ip': session.router.ip if session.router else None,
#                 'connected_at': session.connected_at,
#                 'disconnected_at': session.disconnected_at,
#                 'active': session.active,
#                 'data_used': session.data_used,
#                 'data_used_gb': session.data_used / (1024 ** 3) if session.data_used else 0,
#                 'duration': session.total_session_time,
#                 'duration_formatted': self._format_duration(session.total_session_time),
#                 'ip_address': session.ip,
#                 'quality_of_service': session.quality_of_service,
#                 'session_id': str(session.session_id)
#             })
        
#         # Add PPPoE sessions with detailed information  
#         for session in pppoe_sessions:
#             session_history.append({
#                 'type': 'pppoe',
#                 'username': session.username,
#                 'router': session.router.name if session.router else 'Unknown',
#                 'router_ip': session.router.ip if session.router else None,
#                 'connected_at': session.connected_at,
#                 'disconnected_at': session.disconnected_at,
#                 'active': session.active,
#                 'data_used': session.data_used,
#                 'data_used_gb': session.data_used / (1024 ** 3) if session.data_used else 0,
#                 'duration': session.total_session_time,
#                 'duration_formatted': self._format_duration(session.total_session_time),
#                 'ip_address': session.ip_address,
#                 'service_type': session.pppoe_service_type,
#                 'session_id': str(session.session_id)
#             })
        
#         # Sort by connection time (most recent first)
#         session_history.sort(key=lambda x: x['connected_at'], reverse=True)

#         # Data usage history by subscription period
#         data_usage_history = []
#         subscriptions = Subscription.objects.filter(client=obj)
#         for sub in subscriptions:
#             data_usage = EnhancedSubscriptionSerializer(sub).data.get('data_usage')
#             if data_usage:
#                 data_usage_history.append({
#                     'month': sub.start_date.strftime('%b %Y'),
#                     'used': data_usage['used'],
#                     'total': data_usage['total'],
#                     'unit': data_usage['unit'],
#                     'subscription_id': sub.id,
#                     'plan_name': sub.internet_plan.name if sub.internet_plan else 'Unknown'
#                 })

#         # Browsing history
#         visited_sites = BrowsingHistory.objects.filter(client=obj).order_by('-timestamp')
#         visited_sites_serializer = BrowsingHistorySerializer(visited_sites, many=True)

#         # Preferred plans analysis
#         preferred_plans = list(set(
#             Transaction.objects.filter(client=obj, plan__isnull=False)
#             .values_list('plan__name', flat=True)
#         ))

#         # Last upgrade detection
#         last_upgrade = None
#         transactions_list = list(Transaction.objects.filter(client=obj).order_by('-created_at'))
#         for i in range(1, len(transactions_list)):
#             if transactions_list[i].amount > transactions_list[i-1].amount:
#                 last_upgrade = transactions_list[i].created_at.strftime('%Y-%m-%d')
#                 break

#         # Average monthly usage calculation
#         avg_monthly_usage = 0.0
#         try:
#             total_usage = sum(
#                 float(EnhancedSubscriptionSerializer(sub).data.get('data_usage', {}).get('used', 0))
#                 for sub in subscriptions
#             )
#             avg_monthly_usage = total_usage / max(1, subscriptions.count())
#         except (ValueError, TypeError):
#             pass

#         return {
#             'dataUsage': data_usage_history,
#             'visitedSites': visited_sites_serializer.data,
#             'sessionHistory': session_history,  # New comprehensive session history
#             'preferredPlans': preferred_plans,
#             'lastUpgrade': last_upgrade,
#             'averageMonthlyUsage': f"{avg_monthly_usage:.1f}GB",
#             'purchaseHistory': purchase_serializer.data,
#             'summary': {
#                 'totalSessions': len(session_history),
#                 'activeSessions': len([s for s in session_history if s['active']]),
#                 'totalDataUsedGB': sum(s.get('data_used_gb', 0) for s in session_history),
#                 'frequentRouter': self._get_most_frequent_router(session_history)
#             }
#         }

#     def _format_duration(self, seconds):
#         """Helper method to format duration in seconds to human readable format"""
#         if not seconds:
#             return "0s"
        
#         hours = seconds // 3600
#         minutes = (seconds % 3600) // 60
#         secs = seconds % 60
        
#         if hours > 0:
#             return f"{hours}h {minutes}m {secs}s"
#         elif minutes > 0:
#             return f"{minutes}m {secs}s"
#         else:
#             return f"{secs}s"

#     def _get_most_frequent_router(self, session_history):
#         """Helper method to find the most frequently used router"""
#         if not session_history:
#             return None
        
#         router_count = {}
#         for session in session_history:
#             router = session.get('router')
#             if router:
#                 router_count[router] = router_count.get(router, 0) + 1
        
#         return max(router_count, key=router_count.get) if router_count else None

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
#         return "No Plan"

#     def get_active(self, obj):
#         pppoe_user = PPPoEUser.objects.filter(client=obj, active=True).first()
#         if pppoe_user:
#             return True
        
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         if hotspot_user:
#             return True
            
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
#         first_transaction = Transaction.objects.filter(client=obj).order_by('created_at').first()
#         if not first_transaction:
#             return 0.0
#         months_active = (
#             (timezone.now().year - first_transaction.created_at.year) * 12 +
#             (timezone.now().month - first_transaction.created_at.month) + 1
#         )
#         return round(total_revenue / max(1, months_active), 2)

#     def get_loyalty_duration(self, obj):
#         first_transaction = Transaction.objects.filter(client=obj).order_by('created_at').first()
#         if not first_transaction:
#             return 0
#         months_active = (
#             (timezone.now().year - first_transaction.created_at.year) * 12 +
#             (timezone.now().month - first_transaction.created_at.month)
#         )
#         return max(0, months_active)

#     def get_connection_info(self, obj):
#         pppoe_user = PPPoEUser.objects.filter(client=obj, active=True).first()
#         if pppoe_user:
#             return {
#                 'connection_type': 'pppoe',
#                 'is_active': pppoe_user.active,
#                 'username': pppoe_user.username,
#                 'router': RouterSerializer(pppoe_user.router).data if pppoe_user.router else None,
#                 'connected_at': pppoe_user.connected_at,
#                 'data_used': pppoe_user.data_used / (1024 ** 3) if pppoe_user.data_used else 0
#             }
        
#         hotspot_user = HotspotUser.objects.filter(client=obj, active=True).first()
#         if hotspot_user:
#             return {
#                 'connection_type': 'hotspot',
#                 'is_active': hotspot_user.active,
#                 'mac_address': hotspot_user.mac,
#                 'router': RouterSerializer(hotspot_user.router).data if hotspot_user.router else None,
#                 'connected_at': hotspot_user.connected_at,
#                 'data_used': hotspot_user.data_used / (1024 ** 3) if hotspot_user.data_used else 0
#             }
        
#         return {
#             'connection_type': 'none',
#             'is_active': False
#         }

#     def get_hotspot_user(self, obj):
#         hotspot_user = HotspotUser.objects.filter(client=obj).order_by('-connected_at').first()
#         return HotspotUserSerializer(hotspot_user).data if hotspot_user else None

#     def get_pppoe_user(self, obj):
#         pppoe_user = PPPoEUser.objects.filter(client=obj).order_by('-connected_at').first()
#         return PPPoEUserSerializer(pppoe_user).data if pppoe_user else None














# # serializers.py 
# from rest_framework import serializers
# from user_management.models.user_model import BrowsingHistory, CommunicationLog, Client
# from django.contrib.auth import get_user_model
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
# from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
# from network_management.serializers.router_management_serializer import HotspotUserSerializer, PPPoEUserSerializer, RouterSerializer
# from payments.models.payment_config_model import Transaction
# from payments.serializers.payment_config_serializer import TransactionSerializer
# from django.utils import timezone
# from django.db import models
# from django.db.models import Sum, Count, Avg, Q
# import logging

# logger = logging.getLogger(__name__)

# User = get_user_model()

# class BrowsingHistorySerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     hotspot_user = HotspotUserSerializer(read_only=True)
#     pppoe_user = PPPoEUserSerializer(read_only=True)
#     data_used = serializers.SerializerMethodField()
#     connection_type = serializers.SerializerMethodField()
    
#     class Meta:
#         model = BrowsingHistory
#         fields = ('id', 'url', 'frequency', 'data_used', 'router', 'hotspot_user', 'pppoe_user', 'timestamp', 'connection_type')
    
#     def get_data_used(self, obj):
#         if obj.data_used_bytes:
#             return f"{obj.data_used_bytes / (1024 ** 3):.2f}GB"
#         return "0GB"
    
#     def get_connection_type(self, obj):
#         if obj.hotspot_user:
#             return 'hotspot'
#         elif obj.pppoe_user:
#             return 'pppoe'
#         return 'unknown'

# class CommunicationLogSerializer(serializers.ModelSerializer):
#     router = RouterSerializer(read_only=True)
#     formatted_timestamp = serializers.SerializerMethodField()
#     trigger_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
#     connection_type_display = serializers.CharField(source='get_connection_type_display', read_only=True)
#     message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)
    
#     class Meta:
#         model = CommunicationLog
#         fields = ('id', 'message_type', 'message_type_display', 'trigger_type', 'trigger_display', 
#                  'connection_type', 'connection_type_display', 'subject', 'message', 'status', 
#                  'formatted_timestamp', 'sent_at', 'router', 'delivery_confirmations')
    
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
#             if obj.plan and hasattr(obj.plan, 'expiry'):
#                 expiry = obj.plan.expiry
#                 return f"{expiry.get('value', 1)} {expiry.get('unit', 'month').lower()}"
#         except (AttributeError, KeyError, TypeError):
#             pass
#         return "1 month"
    
#     def get_status(self, obj):
#         if hasattr(obj, 'subscription') and obj.subscription:
#             today = timezone.now().date()
#             expiry = obj.subscription.end_date.date()
#             return "Active" if today < expiry else "Expired"
#         return "Expired"
    
#     def get_payment_method(self, obj):
#         return "M-Pesa" if hasattr(obj, 'mpesa_code') and obj.mpesa_code else "Unknown"
    
#     def get_invoice_number(self, obj):
#         created_str = obj.created_at.strftime('%Y%m%d%H%M%S')
#         return f"INV-{created_str}-{obj.client.id}"

# class EnhancedSubscriptionSerializer(serializers.ModelSerializer):
#     plan = InternetPlanSerializer(read_only=True, source='internet_plan')
#     start_date = serializers.DateTimeField(format='%Y-%m-%d')
#     expiry_date = serializers.DateTimeField(source='end_date', format='%Y-%m-%d')
#     data_usage = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()
#     router = serializers.SerializerMethodField()
#     connection_type = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Subscription
#         fields = ('id', 'client', 'plan', 'is_active', 'start_date', 'expiry_date', 
#                  'data_usage', 'device', 'router', 'connection_type')
    
#     def get_data_usage(self, obj):
#         try:
#             # Check for PPPoE user first
#             pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#             if pppoe_user:
#                 used_gb = pppoe_user.data_used / (1024 ** 3) if pppoe_user.data_used else 0
#                 return {'used': round(used_gb, 1), 'total': 'unlimited', 'unit': 'GB'}
            
#             # Fall back to hotspot user
#             hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#             if hotspot_user and hasattr(hotspot_user, 'plan') and hotspot_user.plan:
#                 try:
#                     data_limit = hotspot_user.plan.data_limit
#                     used_bytes = hotspot_user.data_used
#                     used_gb = used_bytes / (1024 ** 3)
#                     total = data_limit.get('value', 0) if data_limit.get('unit') != 'Unlimited' else 'unlimited'
#                     return {'used': round(used_gb, 1), 'total': total, 'unit': 'GB'}
#                 except (AttributeError, KeyError, TypeError):
#                     pass
#         except Exception as e:
#             logger.error(f"Error getting data usage: {str(e)}")
        
#         return {'used': 0, 'total': '0', 'unit': 'GB'}
    
#     def get_device(self, obj):
#         try:
#             # Check for PPPoE user first
#             pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#             if pppoe_user:
#                 return f"PPPoE: {pppoe_user.username}"
            
#             # Fall back to hotspot user
#             hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#             return hotspot_user.mac if hotspot_user else "Unknown"
#         except Exception as e:
#             logger.error(f"Error getting device: {str(e)}")
#             return "Unknown"
    
#     def get_router(self, obj):
#         try:
#             # Check for PPPoE user first
#             pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#             if pppoe_user and pppoe_user.router:
#                 return RouterSerializer(pppoe_user.router).data
            
#             # Fall back to hotspot user
#             hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#             if hotspot_user and hotspot_user.router:
#                 return RouterSerializer(hotspot_user.router).data
#         except Exception as e:
#             logger.error(f"Error getting router: {str(e)}")
        
#         return None
    
#     def get_connection_type(self, obj):
#         try:
#             pppoe_user = PPPoEUser.objects.filter(client=obj.client, active=True).first()
#             if pppoe_user:
#                 return 'pppoe'
            
#             hotspot_user = HotspotUser.objects.filter(client=obj.client, active=True).first()
#             if hotspot_user:
#                 return 'hotspot'
#         except Exception as e:
#             logger.error(f"Error getting connection type: {str(e)}")
        
#         return 'none'

# class ClientProfileSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username', read_only=True)
#     client_id = serializers.CharField(source='user.client_id', read_only=True)
#     phonenumber = serializers.CharField(source='user.phone_number', read_only=True)
#     last_login = serializers.DateTimeField(source='user.last_login', read_only=True, default=None)
#     data_usage = serializers.SerializerMethodField()
#     subscription = serializers.SerializerMethodField()
#     location = serializers.SerializerMethodField()
#     device = serializers.SerializerMethodField()
#     router = serializers.SerializerMethodField()
#     history = serializers.SerializerMethodField()
#     communication_logs = serializers.SerializerMethodField()
#     payment_status = serializers.SerializerMethodField()
#     active = serializers.SerializerMethodField()
#     is_unlimited = serializers.SerializerMethodField()
#     total_revenue = serializers.SerializerMethodField()
#     renewal_frequency = serializers.SerializerMethodField()
#     avg_monthly_spend = serializers.SerializerMethodField()
#     loyalty_duration = serializers.SerializerMethodField()
#     connection_info = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Client
#         fields = (
#             'id', 'username', 'client_id', 'phonenumber', 'last_login',
#             'data_usage', 'subscription', 'location', 'device', 'router', 'history',
#             'communication_logs', 'payment_status', 'active', 'is_unlimited',
#             'total_revenue', 'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration',
#             'connection_info', 'created_at', 'updated_at'
#         )
#         read_only_fields = ('created_at', 'updated_at')
    
#     def get_data_usage(self, obj):
#         try:
#             active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
#             if active_subscription:
#                 return EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#         except Exception as e:
#             logger.error(f"Error getting data usage: {str(e)}")
        
#         return {'used': 0, 'total': '0', 'unit': 'GB'}
    
#     def get_subscription(self, obj):
#         try:
#             active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
#             if active_subscription and active_subscription.internet_plan:
#                 return EnhancedSubscriptionSerializer(active_subscription).data
#         except Exception as e:
#             logger.error(f"Error getting subscription: {str(e)}")
        
#         return None
    
#     def get_location(self, obj):
#         try:
#             # Check PPPoE first
#             pppoe_user = PPPoEUser.objects.filter(client=obj.user, active=True).first()
#             if pppoe_user and pppoe_user.router and pppoe_user.router.location:
#                 return pppoe_user.router.location
            
#             # Check hotspot
#             hotspot_user = HotspotUser.objects.filter(client=obj.user, active=True).first()
#             if hotspot_user and hotspot_user.router and hotspot_user.router.location:
#                 return hotspot_user.router.location
#         except Exception as e:
#             logger.error(f"Error getting location: {str(e)}")
        
#         return "Unknown"
    
#     def get_device(self, obj):
#         try:
#             pppoe_user = PPPoEUser.objects.filter(client=obj.user, active=True).first()
#             if pppoe_user:
#                 return f"PPPoE: {pppoe_user.username}"
            
#             hotspot_user = HotspotUser.objects.filter(client=obj.user, active=True).first()
#             return hotspot_user.mac if hotspot_user else "Unknown"
#         except Exception as e:
#             logger.error(f"Error getting device: {str(e)}")
#             return "Unknown"
    
#     def get_router(self, obj):
#         try:
#             pppoe_user = PPPoEUser.objects.filter(client=obj.user, active=True).first()
#             if pppoe_user and pppoe_user.router:
#                 return RouterSerializer(pppoe_user.router).data
            
#             hotspot_user = HotspotUser.objects.filter(client=obj.user, active=True).first()
#             if hotspot_user and hotspot_user.router:
#                 return RouterSerializer(hotspot_user.router).data
#         except Exception as e:
#             logger.error(f"Error getting router: {str(e)}")
        
#         return None
    
#     def get_communication_logs(self, obj):
#         try:
#             logs = CommunicationLog.objects.filter(client=obj).order_by('-timestamp')[:50]
#             return CommunicationLogSerializer(logs, many=True).data
#         except Exception as e:
#             logger.error(f"Error getting communication logs: {str(e)}")
#             return []
    
#     def get_history(self, obj):
#         """
#         Enhanced history method that includes both Hotspot and PPPoE session history
#         along with existing data usage, browsing history, and purchase information.
#         """
#         try:
#             # Purchase history
#             transactions = Transaction.objects.filter(client=obj.user).order_by('-created_at')
#             purchase_serializer = EnhancedTransactionSerializer(transactions, many=True)
            
#             # Get both Hotspot and PPPoE sessions for comprehensive connection history
#             hotspot_sessions = HotspotUser.objects.filter(client=obj.user).order_by('-connected_at')
#             pppoe_sessions = PPPoEUser.objects.filter(client=obj.user).order_by('-connected_at')
            
#             session_history = []
            
#             # Add hotspot sessions with detailed information
#             for session in hotspot_sessions:
#                 session_history.append({
#                     'type': 'hotspot',
#                     'mac': session.mac,
#                     'router': session.router.name if session.router else 'Unknown',
#                     'router_ip': session.router.ip if session.router else None,
#                     'connected_at': session.connected_at,
#                     'disconnected_at': session.disconnected_at,
#                     'active': session.active,
#                     'data_used': session.data_used,
#                     'data_used_gb': session.data_used / (1024 ** 3) if session.data_used else 0,
#                     'duration': getattr(session, 'total_session_time', 0),
#                     'duration_formatted': self._format_duration(getattr(session, 'total_session_time', 0)),
#                     'ip_address': getattr(session, 'ip', None),
#                     'quality_of_service': getattr(session, 'quality_of_service', None),
#                     'session_id': str(getattr(session, 'session_id', session.id))
#                 })
            
#             # Add PPPoE sessions with detailed information
#             for session in pppoe_sessions:
#                 session_history.append({
#                     'type': 'pppoe',
#                     'username': session.username,
#                     'router': session.router.name if session.router else 'Unknown',
#                     'router_ip': session.router.ip if session.router else None,
#                     'connected_at': session.connected_at,
#                     'disconnected_at': session.disconnected_at,
#                     'active': session.active,
#                     'data_used': session.data_used,
#                     'data_used_gb': session.data_used / (1024 ** 3) if session.data_used else 0,
#                     'duration': getattr(session, 'total_session_time', 0),
#                     'duration_formatted': self._format_duration(getattr(session, 'total_session_time', 0)),
#                     'ip_address': getattr(session, 'ip_address', None),
#                     'service_type': getattr(session, 'pppoe_service_type', None),
#                     'session_id': str(getattr(session, 'session_id', session.id))
#                 })
            
#             # Sort by connection time (most recent first)
#             session_history.sort(key=lambda x: x['connected_at'] or timezone.now(), reverse=True)
            
#             # Data usage history by subscription period
#             data_usage_history = []
#             subscriptions = Subscription.objects.filter(client=obj.user)
#             for sub in subscriptions:
#                 data_usage = EnhancedSubscriptionSerializer(sub).data.get('data_usage')
#                 if data_usage:
#                     data_usage_history.append({
#                         'month': sub.start_date.strftime('%b %Y'),
#                         'used': data_usage['used'],
#                         'total': data_usage['total'],
#                         'unit': data_usage['unit'],
#                         'subscription_id': sub.id,
#                         'plan_name': sub.internet_plan.name if sub.internet_plan else 'Unknown'
#                     })
            
#             # Browsing history
#             visited_sites = BrowsingHistory.objects.filter(client=obj).order_by('-timestamp')
#             visited_sites_serializer = BrowsingHistorySerializer(visited_sites, many=True)
            
#             # Preferred plans analysis
#             preferred_plans = list(set(
#                 Transaction.objects.filter(client=obj.user, plan__isnull=False)
#                 .values_list('plan__name', flat=True)
#             ))
            
#             # Last upgrade detection
#             last_upgrade = None
#             transactions_list = list(Transaction.objects.filter(client=obj.user).order_by('-created_at'))
#             for i in range(1, len(transactions_list)):
#                 if transactions_list[i].amount > transactions_list[i-1].amount:
#                     last_upgrade = transactions_list[i].created_at.strftime('%Y-%m-%d')
#                     break
            
#             # Average monthly usage calculation
#             avg_monthly_usage = 0.0
#             try:
#                 total_usage = sum(
#                     float(EnhancedSubscriptionSerializer(sub).data.get('data_usage', {}).get('used', 0))
#                     for sub in subscriptions
#                 )
#                 avg_monthly_usage = total_usage / max(1, subscriptions.count())
#             except (ValueError, TypeError):
#                 pass
            
#             return {
#                 'dataUsage': data_usage_history,
#                 'visitedSites': visited_sites_serializer.data,
#                 'sessionHistory': session_history,
#                 'preferredPlans': preferred_plans,
#                 'lastUpgrade': last_upgrade,
#                 'averageMonthlyUsage': f"{avg_monthly_usage:.1f}GB",
#                 'purchaseHistory': purchase_serializer.data,
#                 'summary': {
#                     'totalSessions': len(session_history),
#                     'activeSessions': len([s for s in session_history if s.get('active', False)]),
#                     'totalDataUsedGB': sum(s.get('data_used_gb', 0) for s in session_history),
#                     'frequentRouter': self._get_most_frequent_router(session_history)
#                 }
#             }
            
#         except Exception as e:
#             logger.error(f"Error getting history: {str(e)}")
#             return {
#                 'dataUsage': [],
#                 'visitedSites': [],
#                 'sessionHistory': [],
#                 'preferredPlans': [],
#                 'lastUpgrade': None,
#                 'averageMonthlyUsage': "0.0GB",
#                 'purchaseHistory': [],
#                 'summary': {
#                     'totalSessions': 0,
#                     'activeSessions': 0,
#                     'totalDataUsedGB': 0,
#                     'frequentRouter': None
#                 }
#             }
    
#     def _format_duration(self, seconds):
#         """Helper method to format duration in seconds to human readable format"""
#         if not seconds:
#             return "0s"
        
#         hours = seconds // 3600
#         minutes = (seconds % 3600) // 60
#         secs = seconds % 60
        
#         if hours > 0:
#             return f"{hours}h {minutes}m {secs}s"
#         elif minutes > 0:
#             return f"{minutes}m {secs}s"
#         else:
#             return f"{secs}s"
    
#     def _get_most_frequent_router(self, session_history):
#         """Helper method to find the most frequently used router"""
#         if not session_history:
#             return None
        
#         router_count = {}
#         for session in session_history:
#             router = session.get('router')
#             if router:
#                 router_count[router] = router_count.get(router, 0) + 1
        
#         return max(router_count, key=router_count.get) if router_count else None
    
#     def get_payment_status(self, obj):
#         try:
#             active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
#             if active_subscription:
#                 today = timezone.now().date()
#                 expiry = active_subscription.end_date.date()
#                 if today < expiry:
#                     return "Paid"
#                 elif today == expiry:
#                     return "Due"
#                 return "Expired"
#         except Exception as e:
#             logger.error(f"Error getting payment status: {str(e)}")
        
#         return "No Plan"
    
#     def get_active(self, obj):
#         try:
#             pppoe_user = PPPoEUser.objects.filter(client=obj.user, active=True).first()
#             if pppoe_user:
#                 return True
            
#             hotspot_user = HotspotUser.objects.filter(client=obj.user, active=True).first()
#             if hotspot_user:
#                 return True
                
#             active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
#             if active_subscription:
#                 data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#                 if data_usage and data_usage.get('total') == 'unlimited':
#                     return True
#                 try:
#                     used = float(data_usage.get('used', 0))
#                     total = float(data_usage.get('total', 0)) if data_usage.get('total', '0').isdigit() else 0
#                     return used < total
#                 except (ValueError, TypeError):
#                     return False
#         except Exception as e:
#             logger.error(f"Error getting active status: {str(e)}")
        
#         return False
    
#     def get_is_unlimited(self, obj):
#         try:
#             active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
#             if active_subscription:
#                 data_usage = EnhancedSubscriptionSerializer(active_subscription).data.get('data_usage')
#                 return data_usage and data_usage.get('total') == 'unlimited'
#         except Exception as e:
#             logger.error(f"Error getting unlimited status: {str(e)}")
        
#         return False
    
#     def get_total_revenue(self, obj):
#         try:
#             total = Transaction.objects.filter(client=obj.user).aggregate(total=models.Sum('amount'))['total']
#             return float(total) if total else 0.0
#         except Exception as e:
#             logger.error(f"Error getting total revenue: {str(e)}")
#             return 0.0
    
#     def get_renewal_frequency(self, obj):
#         try:
#             transaction_count = Transaction.objects.filter(client=obj.user).count()
#             return f"{transaction_count} renewals" if transaction_count > 1 else "No renewals"
#         except Exception as e:
#             logger.error(f"Error getting renewal frequency: {str(e)}")
#             return "No renewals"
    
#     def get_avg_monthly_spend(self, obj):
#         try:
#             total_revenue = self.get_total_revenue(obj)
#             first_transaction = Transaction.objects.filter(client=obj.user).order_by('created_at').first()
#             if not first_transaction:
#                 return 0.0
            
#             months_active = (
#                 (timezone.now().year - first_transaction.created_at.year) * 12 +
#                 (timezone.now().month - first_transaction.created_at.month) + 1
#             )
#             return round(total_revenue / max(1, months_active), 2)
#         except Exception as e:
#             logger.error(f"Error getting avg monthly spend: {str(e)}")
#             return 0.0
    
#     def get_loyalty_duration(self, obj):
#         try:
#             first_transaction = Transaction.objects.filter(client=obj.user).order_by('created_at').first()
#             if not first_transaction:
#                 return 0
            
#             months_active = (
#                 (timezone.now().year - first_transaction.created_at.year) * 12 +
#                 (timezone.now().month - first_transaction.created_at.month)
#             )
#             return max(0, months_active)
#         except Exception as e:
#             logger.error(f"Error getting loyalty duration: {str(e)}")
#             return 0
    
#     def get_connection_info(self, obj):
#         try:
#             pppoe_user = PPPoEUser.objects.filter(client=obj.user, active=True).first()
#             if pppoe_user:
#                 return {
#                     'connection_type': 'pppoe',
#                     'is_active': pppoe_user.active,
#                     'username': pppoe_user.username,
#                     'router': RouterSerializer(pppoe_user.router).data if pppoe_user.router else None,
#                     'connected_at': pppoe_user.connected_at,
#                     'data_used': pppoe_user.data_used / (1024 ** 3) if pppoe_user.data_used else 0
#                 }
            
#             hotspot_user = HotspotUser.objects.filter(client=obj.user, active=True).first()
#             if hotspot_user:
#                 return {
#                     'connection_type': 'hotspot',
#                     'is_active': hotspot_user.active,
#                     'mac_address': hotspot_user.mac,
#                     'router': RouterSerializer(hotspot_user.router).data if hotspot_user.router else None,
#                     'connected_at': hotspot_user.connected_at,
#                     'data_used': hotspot_user.data_used / (1024 ** 3) if hotspot_user.data_used else 0
#                 }
#         except Exception as e:
#             logger.error(f"Error getting connection info: {str(e)}")
        
#         return {
#             'connection_type': 'none',
#             'is_active': False
#         }










"""
Enhanced Serializers - Leveraging Network Management Data
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q, Max, Min
import logging

# Import from correct locations
from user_management.models.user_model import Client, CommunicationLog, ClientNote
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from internet_plans.serializers.create_plan_serializers import InternetPlanSerializer
from payments.models.payment_config_model import Transaction
from payments.serializers.payment_config_serializer import TransactionSerializer

# Import network management data
from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router, RouterSessionHistory
from network_management.serializers.router_management_serializer import (
    HotspotUserSerializer, PPPoEUserSerializer, RouterSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()

class CommunicationLogSerializer(serializers.ModelSerializer):
    """Serializer for communication logs"""
    formatted_timestamp = serializers.SerializerMethodField()
    trigger_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
    message_type_display = serializers.CharField(source='get_message_type_display', read_only=True)
    
    class Meta:
        model = CommunicationLog
        fields = (
            'id', 'message_type', 'message_type_display', 'trigger_type', 'trigger_display',
            'campaign_id', 'subject', 'message', 'template_name', 'status',
            'formatted_timestamp', 'sent_at', 'delivered_at', 'read_at',
            'response_received', 'response_content', 'open_count', 'click_count'
        )
    
    def get_formatted_timestamp(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S') if obj.timestamp else None

class ClientNoteSerializer(serializers.ModelSerializer):
    """Serializer for client notes"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    note_type_display = serializers.CharField(source='get_note_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    formatted_created_at = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientNote
        fields = (
            'id', 'note_type', 'note_type_display', 'priority', 'priority_display',
            'title', 'content', 'created_by', 'created_by_username',
            'requires_follow_up', 'follow_up_date', 'follow_up_completed',
            'internal_only', 'tags', 'formatted_created_at'
        )
    
    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if obj.created_at else None

class NetworkManagementDataMixin:
    """
    Mixin to provide network management data without duplication
    """
    
    def get_connection_data(self, obj):
        """Get connection data from network_management"""
        try:
            # Get active connections
            hotspot_user = HotspotUser.objects.filter(client=obj.user, active=True).first()
            pppoe_user = PPPoEUser.objects.filter(client=obj.user, active=True).first()
            
            if pppoe_user:
                return {
                    'connection_type': 'pppoe',
                    'is_active': True,
                    'username': pppoe_user.username,
                    'router': RouterSerializer(pppoe_user.router).data if pppoe_user.router else None,
                    'connected_at': pppoe_user.connected_at,
                    'data_used_gb': pppoe_user.data_used / (1024 ** 3) if pppoe_user.data_used else 0,
                    'remaining_time': getattr(pppoe_user, 'remaining_time', 0),
                    'session_id': str(getattr(pppoe_user, 'session_id', ''))
                }
            elif hotspot_user:
                return {
                    'connection_type': 'hotspot',
                    'is_active': True,
                    'mac_address': hotspot_user.mac,
                    'router': RouterSerializer(hotspot_user.router).data if hotspot_user.router else None,
                    'connected_at': hotspot_user.connected_at,
                    'data_used_gb': hotspot_user.data_used / (1024 ** 3) if hotspot_user.data_used else 0,
                    'remaining_time': getattr(hotspot_user, 'remaining_time', 0),
                    'quality_of_service': getattr(hotspot_user, 'quality_of_service', 'standard'),
                    'session_id': str(getattr(hotspot_user, 'session_id', ''))
                }
            
            return {'connection_type': 'none', 'is_active': False}
            
        except Exception as e:
            logger.error(f"Error getting connection data: {str(e)}")
            return {'connection_type': 'none', 'is_active': False}
    
    def get_session_history(self, obj):
        """Get session history from network_management"""
        try:
            # Get both hotspot and PPPoE session history
            hotspot_sessions = HotspotUser.objects.filter(client=obj.user).order_by('-connected_at')
            pppoe_sessions = PPPoEUser.objects.filter(client=obj.user).order_by('-connected_at')
            
            session_history = []
            
            # Process hotspot sessions
            for session in hotspot_sessions:
                session_history.append({
                    'type': 'hotspot',
                    'mac': session.mac,
                    'router': session.router.name if session.router else 'Unknown',
                    'router_ip': session.router.ip if session.router else None,
                    'connected_at': session.connected_at,
                    'disconnected_at': session.disconnected_at,
                    'active': session.active,
                    'data_used_gb': session.data_used / (1024 ** 3) if session.data_used else 0,
                    'duration': getattr(session, 'total_session_time', 0),
                    'ip_address': getattr(session, 'ip', None),
                    'quality_of_service': getattr(session, 'quality_of_service', 'standard')
                })
            
            # Process PPPoE sessions
            for session in pppoe_sessions:
                session_history.append({
                    'type': 'pppoe',
                    'username': session.username,
                    'router': session.router.name if session.router else 'Unknown',
                    'router_ip': session.router.ip if session.router else None,
                    'connected_at': session.connected_at,
                    'disconnected_at': session.disconnected_at,
                    'active': session.active,
                    'data_used_gb': session.data_used / (1024 ** 3) if session.data_used else 0,
                    'duration': getattr(session, 'total_session_time', 0),
                    'ip_address': getattr(session, 'ip_address', None),
                    'service_type': getattr(session, 'pppoe_service_type', 'standard')
                })
            
            # Sort by connection time
            session_history.sort(key=lambda x: x['connected_at'] or timezone.now(), reverse=True)
            
            return session_history
            
        except Exception as e:
            logger.error(f"Error getting session history: {str(e)}")
            return []
    
    def get_current_usage(self, obj):
        """Get current data usage from active connection"""
        try:
            connection_data = self.get_connection_data(obj)
            if connection_data.get('is_active'):
                return {
                    'used_gb': connection_data.get('data_used_gb', 0),
                    'remaining_time': connection_data.get('remaining_time', 0),
                    'connection_type': connection_data.get('connection_type')
                }
            
            # Check subscription for data limits
            active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
            if active_subscription and hasattr(active_subscription.internet_plan, 'data_limit'):
                data_limit = active_subscription.internet_plan.data_limit
                return {
                    'used_gb': 0,
                    'total_gb': data_limit.get('value', 0) if data_limit.get('unit') != 'Unlimited' else 'unlimited',
                    'is_unlimited': data_limit.get('unit') == 'Unlimited'
                }
            
            return {'used_gb': 0, 'total_gb': 0, 'is_unlimited': False}
            
        except Exception as e:
            logger.error(f"Error getting current usage: {str(e)}")
            return {'used_gb': 0, 'total_gb': 0, 'is_unlimited': False}

class ClientProfileSerializer(serializers.ModelSerializer, NetworkManagementDataMixin):
    """
    Enhanced client profile serializer that leverages network_management data
    instead of duplicating it
    """
    # Basic user info
    username = serializers.CharField(source='user.username', read_only=True)
    client_id = serializers.CharField(source='user.client_id', read_only=True)
    phonenumber = serializers.CharField(source='user.phone_number', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True, default=None)
    
    # Client profile info
    preferred_contact_method_display = serializers.CharField(source='get_preferred_contact_method_display', read_only=True)
    loyalty_tier_display = serializers.CharField(source='get_loyalty_tier_display', read_only=True)
    
    # Network management data (non-duplicated)
    connection_info = serializers.SerializerMethodField()
    current_usage = serializers.SerializerMethodField()
    session_history = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()
    
    # Subscription and billing data
    subscription = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    
    # Communication data
    communication_logs = serializers.SerializerMethodField()
    client_notes = serializers.SerializerMethodField()
    
    # Analytics
    renewal_frequency = serializers.SerializerMethodField()
    avg_monthly_spend = serializers.SerializerMethodField()
    loyalty_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = (
            # Basic info
            'id', 'username', 'client_id', 'phonenumber', 'email', 'last_login',
            
            # Profile info
            'preferred_contact_method', 'preferred_contact_method_display',
            'communication_preferences', 'notes', 'customer_since', 'last_contact',
            'acquisition_source', 'referral_code', 'loyalty_tier', 'loyalty_tier_display',
            
            # Network management data
            'connection_info', 'current_usage', 'session_history', 'active',
            
            # Subscription data
            'subscription', 'payment_status', 'total_revenue',
            
            # Communication data
            'communication_logs', 'client_notes',
            
            # Analytics
            'renewal_frequency', 'avg_monthly_spend', 'loyalty_duration',
            
            # Timestamps
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')
    
    def get_subscription(self, obj):
        """Get current subscription info"""
        try:
            active_subscription = Subscription.objects.filter(
                client=obj.user, is_active=True
            ).select_related('internet_plan').first()
            
            if active_subscription:
                return {
                    'id': active_subscription.id,
                    'plan': InternetPlanSerializer(active_subscription.internet_plan).data,
                    'start_date': active_subscription.start_date,
                    'end_date': active_subscription.end_date,
                    'is_active': active_subscription.is_active,
                    'auto_renew': getattr(active_subscription, 'auto_renew', False)
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting subscription: {str(e)}")
            return None
    
    def get_payment_status(self, obj):
        """Get payment status based on subscription"""
        try:
            active_subscription = Subscription.objects.filter(client=obj.user, is_active=True).first()
            if active_subscription:
                today = timezone.now().date()
                expiry = active_subscription.end_date.date()
                if today < expiry:
                    return "Paid"
                elif today == expiry:
                    return "Due"
                return "Expired"
            return "No Active Plan"
            
        except Exception as e:
            logger.error(f"Error getting payment status: {str(e)}")
            return "Unknown"
    
    def get_total_revenue(self, obj):
        """Calculate total revenue from transactions"""
        try:
            total = Transaction.objects.filter(client=obj.user).aggregate(
                total=models.Sum('amount')
            )['total']
            return float(total) if total else 0.0
        except Exception as e:
            logger.error(f"Error getting total revenue: {str(e)}")
            return 0.0
    
    def get_communication_logs(self, obj):
        """Get recent communication logs"""
        try:
            logs = CommunicationLog.objects.filter(client=obj).order_by('-timestamp')[:10]
            return CommunicationLogSerializer(logs, many=True).data
        except Exception as e:
            logger.error(f"Error getting communication logs: {str(e)}")
            return []
    
    def get_client_notes(self, obj):
        """Get recent client notes"""
        try:
            notes = ClientNote.objects.filter(client=obj).order_by('-created_at')[:5]
            return ClientNoteSerializer(notes, many=True).data
        except Exception as e:
            logger.error(f"Error getting client notes: {str(e)}")
            return []
    
    def get_renewal_frequency(self, obj):
        """Calculate renewal frequency"""
        try:
            transaction_count = Transaction.objects.filter(client=obj.user).count()
            if transaction_count == 0:
                return "New Customer"
            elif transaction_count == 1:
                return "First Purchase"
            else:
                return f"{transaction_count} Renewals"
        except Exception as e:
            logger.error(f"Error getting renewal frequency: {str(e)}")
            return "Unknown"
    
    def get_avg_monthly_spend(self, obj):
        """Calculate average monthly spend"""
        try:
            total_revenue = self.get_total_revenue(obj)
            first_transaction = Transaction.objects.filter(client=obj.user).order_by('created_at').first()
            
            if not first_transaction:
                return 0.0
            
            months_active = max(1, (
                (timezone.now().year - first_transaction.created_at.year) * 12 +
                (timezone.now().month - first_transaction.created_at.month)
            ))
            
            return round(total_revenue / months_active, 2)
        except Exception as e:
            logger.error(f"Error getting avg monthly spend: {str(e)}")
            return 0.0
    
    def get_loyalty_duration(self, obj):
        """Calculate loyalty duration in months"""
        try:
            first_transaction = Transaction.objects.filter(client=obj.user).order_by('created_at').first()
            if not first_transaction:
                return 0
            
            months_active = (
                (timezone.now().year - first_transaction.created_at.year) * 12 +
                (timezone.now().month - first_transaction.created_at.month)
            )
            return max(0, months_active)
        except Exception as e:
            logger.error(f"Error getting loyalty duration: {str(e)}")
            return 0
    
    def get_active(self, obj):
        """Check if client has active connection"""
        return obj.is_active_connection