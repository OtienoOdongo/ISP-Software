# import africastalking
# import logging
# import time
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta
# from django.db.models import F, ExpressionWrapper, FloatField, Q
# from user_management.models.plan_model import SMSNotification, DataUsageThreshold, ClientAnalytics
# from account.models.admin_model import Client, Subscription
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import Payment

# logger = logging.getLogger(__name__)

# class SMSService:
#     def __init__(self):
#         self.username = settings.AFRICAS_TALKING_USERNAME
#         self.api_key = settings.AFRICAS_TALKING_API_KEY
#         africastalking.initialize(self.username, self.api_key)
#         self.sms = africastalking.SMS
#         self.max_retries = 3
#         self.retry_delay = 2  # seconds between retries

#     def _send_single_sms(self, phone_number, message):
#         try:
#             response = self.sms.send(message, [str(phone_number)])
#             logger.info(f"SMS sent to {phone_number}: {response}")
            
#             # Check Africa's Talking response format
#             if (response.get('SMSMessageData', {}).get('Recipients', [{}])[0].get('statusCode') == '101'):
#                 return True, response
#             return False, response
#         except Exception as e:
#             logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
#             raise

#     def send_sms(self, client, message, trigger, plan=None):
#         """
#         Send SMS with retry logic and proper tracking
#         """
#         notification = SMSNotification.objects.create(
#             client=client,
#             message=message,
#             status='PENDING',
#             trigger=trigger
#         )

#         last_error = None
#         for attempt in range(1, self.max_retries + 1):
#             try:
#                 success, response = self._send_single_sms(client.phonenumber, message)
#                 if success:
#                     notification.status = 'SENT'
#                     notification.sent_at = timezone.now()
#                     notification.delivery_status = str(response)
#                     notification.save()
                    
#                     # Update client analytics
#                     self._update_client_analytics(client, trigger, plan)
#                     return True
                
#                 last_error = f"API returned failure: {response}"
#             except Exception as e:
#                 last_error = str(e)
#                 logger.error(f"Attempt {attempt} failed for {client.phonenumber}: {last_error}")
#                 if attempt < self.max_retries:
#                     time.sleep(self.retry_delay)
#                 continue

#         notification.status = 'FAILED'
#         notification.error = last_error
#         notification.save()
#         return False

#     def _update_client_analytics(self, client, trigger, plan=None):
#         """
#         Update client analytics based on SMS trigger
#         """
#         analytics_data = {
#             'client': client,
#             'payment_status': self._get_payment_status(client),
#             'timestamp': timezone.now(),
#         }

#         if plan:
#             analytics_data['plan'] = plan

#         if trigger.startswith('DATA_USAGE_'):
#             hotspot_user = HotspotUser.objects.filter(
#                 client=client,
#                 active=True
#             ).annotate(
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / 
#                     (F('plan__data_limit_value') * (1024 ** 3)),
#                     output_field=FloatField()
#                 )
#             ).first()

#             if hotspot_user:
#                 analytics_data.update({
#                     'hotspot_user': hotspot_user,
#                     'data_usage_percentage': hotspot_user.usage_percentage,
#                     'is_high_usage': True,
#                 })

#         elif trigger.startswith('EXPIRY_') or trigger == 'EXPIRED':
#             subscription = client.subscriptions.filter(is_active=True).first()
#             if subscription:
#                 analytics_data.update({
#                     'plan': subscription.internet_plan,
#                     'is_near_expiry': True,
#                 })

#         ClientAnalytics.objects.create(**analytics_data)

#     def _get_payment_status(self, client):
#         latest_payment = Payment.objects.filter(
#             client=client,
#             transaction__status='Success'
#         ).order_by('-timestamp').first()

#         if latest_payment:
#             subscription = client.subscriptions.filter(is_active=True).first()
#             if subscription and subscription.end_date >= timezone.now():
#                 return 'Paid'
#             return 'Expired'
#         return 'Due'

#     def check_and_notify_data_usage(self, threshold_percentage=None):
#         """
#         Check all active clients and send notifications if they reach specified threshold
#         """
#         if threshold_percentage is None:
#             thresholds = DataUsageThreshold.objects.filter(is_active=True)
#         else:
#             thresholds = DataUsageThreshold.objects.filter(
#                 threshold_percentage=threshold_percentage,
#                 is_active=True
#             )

#         for threshold in thresholds:
#             hotspot_users = HotspotUser.objects.filter(
#                 active=True,
#                 plan__data_limit_unit__in=['GB', 'TB']  # Skip unlimited plans
#             ).annotate(
#                 data_limit_bytes=ExpressionWrapper(
#                     F('plan__data_limit_value') * 
#                     (1024**3 if F('plan__data_limit_unit') == 'GB' else 1024**4),
#                     output_field=FloatField()
#                 ),
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / F('data_limit_bytes'),
#                     output_field=FloatField()
#                 )
#             ).filter(
#                 usage_percentage__gte=threshold.threshold_percentage
#             ).select_related('client', 'plan', 'router')

#             for hotspot_user in hotspot_users:
#                 # Check if notification was already sent recently
#                 recent_notification = SMSNotification.objects.filter(
#                     client=hotspot_user.client,
#                     trigger=f'DATA_USAGE_{int(threshold.threshold_percentage)}',
#                     sent_at__gte=timezone.now() - timedelta(hours=24)
#                 ).exists()

#                 if not recent_notification:
#                     message = threshold.message_template.format(
#                         client_name=hotspot_user.client.full_name,
#                         usage_percentage=hotspot_user.usage_percentage,
#                         used_gb=hotspot_user.data_used / (1024 ** 3),
#                         total_gb=float(hotspot_user.plan.data_limit_value),
#                         plan_name=hotspot_user.plan.name,
#                         threshold=threshold.threshold_percentage
#                     )
#                     self.send_sms(
#                         hotspot_user.client,
#                         message,
#                         f'DATA_USAGE_{int(threshold.threshold_percentage)}',
#                         hotspot_user.plan
#                     )

#     def check_and_notify_expiry(self, days_remaining=None):
#         """
#         Check for expiring subscriptions and send notifications
#         """
#         now = timezone.now()
#         expiry_conditions = []

#         if days_remaining is None:
#             expiry_conditions.extend([
#                 (3, 'EXPIRY_3_DAYS'),
#                 (1, 'EXPIRY_1_DAY'),
#             ])
#             # Also check for already expired
#             expiry_conditions.append((0, 'EXPIRED'))
#         else:
#             expiry_conditions.append((days_remaining, f'EXPIRY_{days_remaining}_DAYS'))

#         for days, trigger in expiry_conditions:
#             expiry_date = now + timedelta(days=days) if days > 0 else now

#             subscriptions = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__lte=expiry_date if days > 0 else now,
#                 end_date__gte=now - timedelta(days=1) if days == 0 else expiry_date - timedelta(days=1)
#             ).select_related('client', 'internet_plan')

#             for subscription in subscriptions:
#                 # Check if notification was already sent recently
#                 recent_notification = SMSNotification.objects.filter(
#                     client=subscription.client,
#                     trigger=trigger,
#                     sent_at__gte=timezone.now() - timedelta(hours=12 if days > 0 else 24)
#                 ).exists()

#                 if not recent_notification:
#                     if trigger == 'EXPIRED':
#                         message = (
#                             f"Dear {subscription.client.full_name}, your "
#                             f"{subscription.internet_plan.name} plan has expired. "
#                             "Please renew to restore your service."
#                         )
#                     else:
#                         message = (
#                             f"Dear {subscription.client.full_name}, your "
#                             f"{subscription.internet_plan.name} plan will expire in "
#                             f"{days} day{'s' if days > 1 else ''}. Renew now to avoid interruption."
#                         )

#                     self.send_sms(
#                         subscription.client,
#                         message,
#                         trigger,
#                         subscription.internet_plan
#                     )

#     def send_bulk_sms(self, client_ids, message_type, custom_message=None, threshold_percentage=None):
#         """
#         Send bulk SMS to selected clients with proper tracking
#         """
#         clients = Client.objects.filter(id__in=client_ids).prefetch_related(
#             'subscriptions', 'subscriptions__internet_plan'
#         )

#         results = []
#         for client in clients:
#             message = None
#             trigger = message_type
#             plan = None

#             if message_type.startswith('DATA_USAGE_'):
#                 hotspot_user = HotspotUser.objects.filter(
#                     client=client,
#                     active=True
#                 ).annotate(
#                     usage_percentage=ExpressionWrapper(
#                         F('data_used') * 100 / 
#                         (F('plan__data_limit_value') * (1024 ** 3)),
#                         output_field=FloatField()
#                     )
#                 ).first()

#                 if hotspot_user and hotspot_user.usage_percentage >= (threshold_percentage or 75):
#                     threshold = DataUsageThreshold.objects.filter(
#                         threshold_percentage=threshold_percentage or 75,
#                         is_active=True
#                     ).first()

#                     if threshold:
#                         message = threshold.message_template.format(
#                             client_name=client.full_name,
#                             usage_percentage=hotspot_user.usage_percentage,
#                             used_gb=hotspot_user.data_used / (1024 ** 3),
#                             total_gb=float(hotspot_user.plan.data_limit_value),
#                             plan_name=hotspot_user.plan.name,
#                             threshold=threshold.threshold_percentage
#                         )
#                         plan = hotspot_user.plan

#             elif message_type.startswith('EXPIRY_'):
#                 subscription = client.subscriptions.filter(
#                     is_active=True
#                 ).first()

#                 if subscription:
#                     days_left = (subscription.end_date - timezone.now()).days
#                     if (message_type == 'EXPIRY_3_DAYS' and days_left <= 3) or \
#                        (message_type == 'EXPIRY_1_DAY' and days_left <= 1) or \
#                        (message_type == 'EXPIRED' and days_left <= 0):
                        
#                         if message_type == 'EXPIRED':
#                             message = (
#                                 f"Dear {client.full_name}, your "
#                                 f"{subscription.internet_plan.name} plan has expired. "
#                                 "Please renew to restore your service."
#                             )
#                         else:
#                             message = (
#                                 f"Dear {client.full_name}, your "
#                                 f"{subscription.internet_plan.name} plan will expire in "
#                                 f"{days_left} day{'s' if days_left > 1 else ''}. Renew now!"
#                             )
#                         plan = subscription.internet_plan

#             elif message_type == 'MANUAL' and custom_message:
#                 message = custom_message
#                 subscription = client.subscriptions.filter(is_active=True).first()
#                 plan = subscription.internet_plan if subscription else None

#             elif message_type == 'PAYMENT_REMINDER':
#                 subscription = client.subscriptions.filter(is_active=True).first()
#                 if subscription:
#                     message = (
#                         f"Dear {client.full_name}, your payment for "
#                         f"{subscription.internet_plan.name} is due. "
#                         f"Amount: {subscription.internet_plan.price} KES. "
#                         "Please make payment to avoid service interruption."
#                     )
#                     plan = subscription.internet_plan

#             if message:
#                 success = self.send_sms(client, message, trigger, plan)
#                 results.append({
#                     'client_id': client.id,
#                     'client_name': client.full_name,
#                     'phone_number': str(client.phonenumber),
#                     'status': 'sent' if success else 'failed',
#                     'message': message,
#                     'trigger': trigger
#                 })

#         return results





# import africastalking
# import logging
# import time
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta
# from django.db.models import F, ExpressionWrapper, FloatField, Q
# from user_management.models.plan_model import SMSNotification, DataUsageThreshold, ClientAnalytics, ActionNotification
# from account.models.admin_model import Client, Subscription
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import Transaction

# logger = logging.getLogger(__name__)

# class SMSService:
#     def __init__(self):
#         self.username = settings.AFRICAS_TALKING_USERNAME
#         self.api_key = settings.AFRICAS_TALKING_API_KEY
#         africastalking.initialize(self.username, self.api_key)
#         self.sms = africastalking.SMS
#         self.max_retries = 3
#         self.retry_delay = 2  # seconds between retries

#     def _send_single_sms(self, phone_number, message):
#         try:
#             response = self.sms.send(message, [str(phone_number)])
#             logger.info(f"SMS sent to {phone_number}: {response}")
            
#             if response.get('SMSMessageData', {}).get('Recipients', [{}])[0].get('statusCode') == 101:
#                 return True, response
#             return False, response
#         except Exception as e:
#             logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
#             raise

#     def send_sms(self, client, message, trigger, plan=None):
#         notification = SMSNotification.objects.create(
#             client=client,
#             message=message,
#             status='PENDING',
#             trigger=trigger
#         )

#         last_error = None
#         for attempt in range(1, self.max_retries + 1):
#             try:
#                 success, response = self._send_single_sms(client.phonenumber, message)
#                 if success:
#                     notification.status = 'SENT'
#                     notification.sent_at = timezone.now()
#                     notification.delivery_status = str(response)
#                     notification.save()
                    
#                     self._update_client_analytics(client, trigger, plan)
#                     ActionNotification.objects.create(
#                         message=f"SMS sent to {client.full_name} ({trigger})",
#                         type='SUCCESS'
#                     )
#                     return True
                
#                 last_error = f"API returned failure: {response}"
#             except Exception as e:
#                 last_error = str(e)
#                 logger.error(f"Attempt {attempt} failed for {client.phonenumber}: {last_error}")
#                 if attempt < self.max_retries:
#                     time.sleep(self.retry_delay)
#                 continue

#         notification.status = 'FAILED'
#         notification.error = last_error
#         notification.save()
#         ActionNotification.objects.create(
#             message=f"Failed to send SMS to {client.full_name}: {last_error}",
#             type='ERROR'
#         )
#         return False

#     def _update_client_analytics(self, client, trigger, plan=None):
#         analytics_data = {
#             'client': client,
#             'payment_status': self._get_payment_status(client),
#             'timestamp': timezone.now(),
#         }

#         if plan:
#             analytics_data['plan'] = plan

#         if trigger.startswith('DATA_USAGE_'):
#             hotspot_user = HotspotUser.objects.filter(
#                 client=client,
#                 active=True
#             ).annotate(
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / 
#                     (F('plan__data_limit_value') * (1024 ** 3)),
#                     output_field=FloatField()
#                 )
#             ).first()

#             if hotspot_user:
#                 analytics_data.update({
#                     'hotspot_user': hotspot_user,
#                     'data_usage_percentage': hotspot_user.usage_percentage,
#                     'is_high_usage': hotspot_user.usage_percentage >= 75,
#                 })

#         elif trigger.startswith('EXPIRY_') or trigger == 'EXPIRED':
#             subscription = client.subscriptions.filter(is_active=True).first()
#             if subscription:
#                 analytics_data.update({
#                     'plan': subscription.internet_plan,
#                     'is_near_expiry': True,
#                 })

#         ClientAnalytics.objects.create(**analytics_data)

#     def _get_payment_status(self, client):
#         latest_payment = Payment.objects.filter(
#             client=client,
#             transaction__status='Success'
#         ).order_by('-timestamp').first()

#         if latest_payment:
#             subscription = client.subscriptions.filter(is_active=True).first()
#             if subscription and subscription.end_date >= timezone.now():
#                 return 'Paid'
#             return 'Expired'
#         return 'Due'

#     def check_and_notify_data_usage(self, threshold_percentage=None):
#         thresholds = DataUsageThreshold.objects.filter(
#             is_active=True,
#             threshold_percentage=threshold_percentage
#         ) if threshold_percentage else DataUsageThreshold.objects.filter(is_active=True)

#         for threshold in thresholds:
#             hotspot_users = HotspotUser.objects.filter(
#                 active=True,
#                 plan__data_limit_unit__in=['GB', 'TB']
#             ).annotate(
#                 data_limit_bytes=ExpressionWrapper(
#                     F('plan__data_limit_value') * 
#                     (1024**3 if F('plan__data_limit_unit') == 'GB' else 1024**4),
#                     output_field=FloatField()
#                 ),
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / F('data_limit_bytes'),
#                     output_field=FloatField()
#                 )
#             ).filter(
#                 usage_percentage__gte=threshold.threshold_percentage
#             ).select_related('client', 'plan', 'router')

#             for hotspot_user in hotspot_users:
#                 recent_notification = SMSNotification.objects.filter(
#                     client=hotspot_user.client,
#                     trigger=f'DATA_USAGE_{int(threshold.threshold_percentage)}',
#                     sent_at__gte=timezone.now() - timedelta(hours=24)
#                 ).exists()

#                 if not recent_notification:
#                     message = threshold.message_template.format(
#                         client_name=hotspot_user.client.full_name,
#                         usage_percentage=round(hotspot_user.usage_percentage, 1),
#                         used_gb=hotspot_user.data_used / (1024 ** 3),
#                         total_gb=float(hotspot_user.plan.data_limit_value),
#                         plan_name=hotspot_user.plan.name,
#                         threshold=threshold.threshold_percentage
#                     )
#                     self.send_sms(
#                         hotspot_user.client,
#                         message,
#                         f'DATA_USAGE_{int(threshold.threshold_percentage)}',
#                         hotspot_user.plan
#                     )

#     def check_and_notify_expiry(self, days_remaining=None):
#         now = timezone.now()
#         expiry_conditions = [
#             (3, 'EXPIRY_3_DAYS'),
#             (1, 'EXPIRY_1_DAY'),
#             (0, 'EXPIRED')
#         ] if days_remaining is None else [(days_remaining, f'EXPIRY_{days_remaining}_DAYS')]

#         for days, trigger in expiry_conditions:
#             expiry_date = now + timedelta(days=days) if days > 0 else now

#             subscriptions = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__lte=expiry_date if days > 0 else now,
#                 end_date__gte=now - timedelta(days=1) if days == 0 else expiry_date - timedelta(days=1)
#             ).select_related('client', 'internet_plan')

#             for subscription in subscriptions:
#                 recent_notification = SMSNotification.objects.filter(
#                     client=subscription.client,
#                     trigger=trigger,
#                     sent_at__gte=timezone.now() - timedelta(hours=12 if days > 0 else 24)
#                 ).exists()

#                 if not recent_notification:
#                     if trigger == 'EXPIRED':
#                         message = (
#                             f"Dear {subscription.client.full_name}, your "
#                             f"{subscription.internet_plan.name} plan has expired. "
#                             "Please renew to restore your service."
#                         )
#                     else:
#                         message = (
#                             f"Dear {subscription.client.full_name}, your "
#                             f"{subscription.internet_plan.name} plan will expire in "
#                             f"{days} day{'s' if days > 1 else ''}. Renew now to avoid interruption."
#                         )

#                     self.send_sms(
#                         subscription.client,
#                         message,
#                         trigger,
#                         subscription.internet_plan
#                     )

#     def send_bulk_sms(self, client_ids, message_type, custom_message=None, threshold_percentage=None):
#         clients = Client.objects.filter(id__in=client_ids).prefetch_related(
#             'subscriptions', 'subscriptions__internet_plan'
#         )

#         results = []
#         for client in clients:
#             message = None
#             trigger = message_type
#             plan = None

#             if message_type.startswith('DATA_USAGE_'):
#                 hotspot_user = HotspotUser.objects.filter(
#                     client=client,
#                     active=True
#                 ).annotate(
#                     usage_percentage=ExpressionWrapper(
#                         F('data_used') * 100 / 
#                         (F('plan__data_limit_value') * (1024 ** 3)),
#                         output_field=FloatField()
#                     )
#                 ).first()

#                 if hotspot_user and hotspot_user.usage_percentage >= (threshold_percentage or 75):
#                     threshold = DataUsageThreshold.objects.filter(
#                         threshold_percentage=threshold_percentage or 75,
#                         is_active=True
#                     ).first()

#                     if threshold:
#                         message = threshold.message_template.format(
#                             client_name=client.full_name,
#                             usage_percentage=round(hotspot_user.usage_percentage, 1),
#                             used_gb=hotspot_user.data_used / (1024 ** 3),
#                             total_gb=float(hotspot_user.plan.data_limit_value),
#                             plan_name=hotspot_user.plan.name,
#                             threshold=threshold.threshold_percentage
#                         )
#                         plan = hotspot_user.plan

#             elif message_type.startswith('EXPIRY_'):
#                 subscription = client.subscriptions.filter(
#                     is_active=True
#                 ).first()

#                 if subscription:
#                     days_left = (subscription.end_date - timezone.now()).days
#                     if (message_type == 'EXPIRY_3_DAYS' and days_left <= 3) or \
#                        (message_type == 'EXPIRY_1_DAY' and days_left <= 1) or \
#                        (message_type == 'EXPIRED' and days_left <= 0):
                        
#                         if message_type == 'EXPIRED':
#                             message = (
#                                 f"Dear {client.full_name}, your "
#                                 f"{subscription.internet_plan.name} plan has expired. "
#                                 "Please renew to restore your service."
#                             )
#                         else:
#                             message = (
#                                 f"Dear {client.full_name}, your "
#                                 f"{subscription.internet_plan.name} plan will expire in "
#                                 f"{days_left} day{'s' if days_left > 1 else ''}. Renew now!"
#                             )
#                         plan = subscription.internet_plan

#             elif message_type == 'MANUAL' and custom_message:
#                 message = custom_message
#                 subscription = client.subscriptions.filter(is_active=True).first()
#                 plan = subscription.internet_plan if subscription else None

#             elif message_type == 'PAYMENT_REMINDER':
#                 subscription = client.subscriptions.filter(is_active=True).first()
#                 if subscription:
#                     message = (
#                         f"Dear {client.full_name}, your payment for "
#                         f"{subscription.internet_plan.name} is due. "
#                         f"Amount: {subscription.internet_plan.price} KES. "
#                         "Please make payment to avoid service interruption."
#                     )
#                     plan = subscription.internet_plan

#             if message:
#                 success = self.send_sms(client, message, trigger, plan)
#                 results.append({
#                     'client_id': client.id,
#                     'client_name': client.full_name,
#                     'phone_number': str(client.phonenumber),
#                     'status': 'sent' if success else 'failed',
#                     'message': message,
#                     'trigger': trigger
#                 })

#         return results








import africastalking
import logging
import time
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.db.models import F, ExpressionWrapper, FloatField, Q
from user_management.models.plan_model import SMSNotification, DataUsageThreshold, ClientAnalytics, ActionNotification
from account.models.admin_model import Client, Subscription
from internet_plans.models.create_plan_models import InternetPlan
from network_management.models.router_management_model import HotspotUser
import requests

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.username = settings.AFRICAS_TALKING_USERNAME
        self.api_key = settings.AFRICAS_TALKING_API_KEY
        africastalking.initialize(self.username, self.api_key)
        self.sms = africastalking.SMS
        self.max_retries = 3
        self.retry_delay = 2  # seconds between retries

    def _send_single_sms(self, phone_number, message):
        try:
            response = self.sms.send(message, [str(phone_number)])
            logger.info(f"SMS sent to {phone_number}: {response}")
            
            if response.get('SMSMessageData', {}).get('Recipients', [{}])[0].get('statusCode') == 101:
                return True, response
            return False, response
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
            raise

    def send_sms(self, client, message, trigger, plan=None):
        notification = SMSNotification.objects.create(
            client=client,
            message=message,
            status='PENDING',
            trigger=trigger
        )

        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                success, response = self._send_single_sms(client.phonenumber, message)
                if success:
                    notification.status = 'SENT'
                    notification.sent_at = timezone.now()
                    notification.delivery_status = str(response)
                    notification.save()
                    
                    self._update_client_analytics(client, trigger, plan)
                    return True
                
                last_error = f"API returned failure: {response}"
            except Exception as e:
                last_error = str(e)
                logger.error(f"Attempt {attempt} failed for {client.phonenumber}: {last_error}")
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay)
                continue

        notification.status = 'FAILED'
        notification.error = last_error
        notification.save()
        return False

    def _update_client_analytics(self, client, trigger, plan=None):
        analytics_data = {
            'client': client,
            'payment_status': self._get_payment_status(client),
            'timestamp': timezone.now(),
        }

        if plan:
            analytics_data['plan'] = plan

        if trigger.startswith('DATA_USAGE_'):
            hotspot_user = HotspotUser.objects.filter(
                client=client,
                active=True
            ).annotate(
                usage_percentage=ExpressionWrapper(
                    F('data_used') * 100 / 
                    (F('plan__data_limit_value') * (1024 ** 3)),
                    output_field=FloatField()
                )
            ).first()

            if hotspot_user:
                analytics_data.update({
                    'hotspot_user': hotspot_user,
                    'data_usage_percentage': hotspot_user.usage_percentage,
                    'is_high_usage': hotspot_user.usage_percentage >= 75,
                })

        elif trigger.startswith('EXPIRY_') or trigger == 'EXPIRED':
            subscription = client.subscriptions.filter(is_active=True).first()
            if subscription:
                analytics_data.update({
                    'plan': subscription.internet_plan,
                    'is_near_expiry': True,
                })

        ClientAnalytics.objects.create(**analytics_data)

    def _get_payment_status(self, client):
        has_payment = client.payments.exists()
        subscription = client.subscriptions.filter(is_active=True).first()
        
        if not subscription:
            return 'Expired'
            
        if has_payment and subscription.end_date >= timezone.now():
            return 'Paid'
        elif subscription.end_date < timezone.now():
            return 'Expired'
        return 'Due'

    def check_and_notify_data_usage(self, threshold_percentage=75):
        try:
            threshold = DataUsageThreshold.objects.get(
                threshold_percentage=threshold_percentage,
                is_active=True
            )
        except DataUsageThreshold.DoesNotExist:
            logger.error(f"No active threshold found for {threshold_percentage}%")
            return

        hotspot_users = HotspotUser.objects.filter(
            active=True,
            plan__data_limit_unit__in=['GB', 'TB']
        ).annotate(
            data_limit_bytes=ExpressionWrapper(
                F('plan__data_limit_value') * (1024 ** 3),
                output_field=FloatField()
            ),
            usage_percentage=ExpressionWrapper(
                F('data_used') * 100 / F('data_limit_bytes'),
                output_field=FloatField()
            )
        ).filter(
            usage_percentage__gte=threshold.threshold_percentage,
            usage_percentage__lt=threshold.threshold_percentage + 5  # Prevent duplicate notifications
        ).select_related('client', 'plan', 'router')

        for hotspot_user in hotspot_users:
            recent_notification = SMSNotification.objects.filter(
                client=hotspot_user.client,
                trigger=f'DATA_USAGE_{int(threshold.threshold_percentage)}',
                sent_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()

            if not recent_notification:
                message = threshold.message_template.format(
                    client_name=hotspot_user.client.full_name,
                    usage_percentage=round(hotspot_user.usage_percentage, 1),
                    used_gb=hotspot_user.data_used / (1024 ** 3),
                    total_gb=float(hotspot_user.plan.data_limit_value),
                    plan_name=hotspot_user.plan.name,
                    threshold=threshold.threshold_percentage
                )
                self.send_sms(
                    hotspot_user.client,
                    message,
                    f'DATA_USAGE_{int(threshold.threshold_percentage)}',
                    hotspot_user.plan
                )

    def check_and_notify_expiry(self, days_remaining=None):
        now = timezone.now()
        expiry_conditions = [
            (3, 'EXPIRY_3_DAYS'),
            (1, 'EXPIRY_1_DAY'),
            (0, 'EXPIRED')
        ] if days_remaining is None else [(days_remaining, f'EXPIRY_{days_remaining}_DAYS')]

        for days, trigger in expiry_conditions:
            expiry_date = now + timedelta(days=days) if days > 0 else now

            subscriptions = Subscription.objects.filter(
                is_active=True,
                end_date__lte=expiry_date if days > 0 else now,
                end_date__gte=now - timedelta(days=1) if days == 0 else expiry_date - timedelta(days=1)
            ).select_related('client', 'internet_plan')

            for subscription in subscriptions:
                recent_notification = SMSNotification.objects.filter(
                    client=subscription.client,
                    trigger=trigger,
                    sent_at__gte=timezone.now() - timedelta(hours=12 if days > 0 else 24)
                ).exists()

                if not recent_notification:
                    if trigger == 'EXPIRED':
                        message = (
                            f"Dear {subscription.client.full_name}, your "
                            f"{subscription.internet_plan.name} plan has expired. "
                            "Please renew to restore your service."
                        )
                    else:
                        message = (
                            f"Dear {subscription.client.full_name}, your "
                            f"{subscription.internet_plan.name} plan will expire in "
                            f"{days} day{'s' if days > 1 else ''}. Renew now to avoid interruption."
                        )

                    self.send_sms(
                        subscription.client,
                        message,
                        trigger,
                        subscription.internet_plan
                    )

    def send_bulk_sms(self, client_ids, message_type, custom_message=None):
        clients = Client.objects.filter(id__in=client_ids).prefetch_related(
            'subscriptions', 'subscriptions__internet_plan'
        )

        results = []
        for client in clients:
            message = None
            trigger = message_type
            plan = None

            if message_type.startswith('DATA_USAGE_'):
                threshold_percentage = int(message_type.split('_')[-1])
                hotspot_user = HotspotUser.objects.filter(
                    client=client,
                    active=True
                ).annotate(
                    usage_percentage=ExpressionWrapper(
                        F('data_used') * 100 / 
                        (F('plan__data_limit_value') * (1024 ** 3)),
                        output_field=FloatField()
                    )
                ).first()

                if hotspot_user and hotspot_user.usage_percentage >= threshold_percentage:
                    threshold = DataUsageThreshold.objects.filter(
                        threshold_percentage=threshold_percentage,
                        is_active=True
                    ).first()

                    if threshold:
                        message = threshold.message_template.format(
                            client_name=client.full_name,
                            usage_percentage=round(hotspot_user.usage_percentage, 1),
                            used_gb=hotspot_user.data_used / (1024 ** 3),
                            total_gb=float(hotspot_user.plan.data_limit_value),
                            plan_name=hotspot_user.plan.name,
                            threshold=threshold.threshold_percentage
                        )
                        plan = hotspot_user.plan

            elif message_type.startswith('EXPIRY_'):
                subscription = client.subscriptions.filter(
                    is_active=True
                ).first()

                if subscription:
                    days_left = (subscription.end_date - timezone.now()).days
                    if (message_type == 'EXPIRY_3_DAYS' and days_left <= 3) or \
                       (message_type == 'EXPIRY_1_DAY' and days_left <= 1) or \
                       (message_type == 'EXPIRED' and days_left <= 0):
                        
                        if message_type == 'EXPIRED':
                            message = (
                                f"Dear {client.full_name}, your "
                                f"{subscription.internet_plan.name} plan has expired. "
                                "Please renew to restore your service."
                            )
                        else:
                            message = (
                                f"Dear {client.full_name}, your "
                                f"{subscription.internet_plan.name} plan will expire in "
                                f"{days_left} day{'s' if days_left > 1 else ''}. Renew now!"
                            )
                        plan = subscription.internet_plan

            elif message_type == 'MANUAL' and custom_message:
                message = custom_message
                subscription = client.subscriptions.filter(is_active=True).first()
                plan = subscription.internet_plan if subscription else None

            elif message_type == 'PAYMENT_REMINDER':
                subscription = client.subscriptions.filter(is_active=True).first()
                if subscription:
                    message = (
                        f"Dear {client.full_name}, your payment for "
                        f"{subscription.internet_plan.name} is due. "
                        f"Amount: {subscription.internet_plan.price} KES. "
                        "Please make payment to avoid service interruption."
                    )
                    plan = subscription.internet_plan

            if message:
                success = self.send_sms(client, message, trigger, plan)
                results.append({
                    'client_id': client.id,
                    'client_name': client.full_name,
                    'phone_number': str(client.phonenumber),
                    'status': 'sent' if success else 'failed',
                    'message': message,
                    'trigger': trigger
                })

        return results