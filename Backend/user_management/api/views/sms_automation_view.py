

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from user_management.models.sms_automation_model import SMSTrigger, SMSAutomationSettings, SMSAnalytics
# from user_management.models.user_model import CommunicationLog
# from user_management.serializers.sms_automation_serializer import (
#     SMSTriggerSerializer, SMSAutomationSettingsSerializer, 
#     SMSAnalyticsSerializer, TriggerPerformanceSerializer,
#     MessageTypeAnalyticsSerializer
# )
# from account.models.admin_model import Client
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# import africastalking
# from django.conf import settings
# from celery import shared_task
# from datetime import datetime, time, date, timedelta
# import re
# import django.db.models as models
# from django.db.models import Count, Q, Avg, Case, When, FloatField, F, ExpressionWrapper
# from django.db import transaction
# import logging

# logger = logging.getLogger(__name__)

# class SMSTriggerListCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         triggers = SMSTrigger.objects.all()
#         serializer = SMSTriggerSerializer(triggers, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = SMSTriggerSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class SMSTriggerDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return SMSTrigger.objects.get(pk=pk)
#         except SMSTrigger.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         trigger = self.get_object(pk)
#         if not trigger:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         serializer = SMSTriggerSerializer(trigger)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         trigger = self.get_object(pk)
#         if not trigger:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         serializer = SMSTriggerSerializer(trigger, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         trigger = self.get_object(pk)
#         if not trigger:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         trigger.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class SMSAutomationSettingsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         settings_obj, created = SMSAutomationSettings.objects.get_or_create(id=1)
#         serializer = SMSAutomationSettingsSerializer(settings_obj)
#         return Response(serializer.data)

#     def put(self, request):
#         settings_obj, created = SMSAutomationSettings.objects.get_or_create(id=1)
#         serializer = SMSAutomationSettingsSerializer(settings_obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class SendTestMessageView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         trigger = SMSTrigger.objects.filter(pk=pk).first()
#         if not trigger:
#             return Response({'error': 'Trigger not found'}, status=status.HTTP_404_NOT_FOUND)

#         recipient = request.data.get('recipient')
#         if not recipient or not re.match(r'^\+\d{10,15}$', recipient):
#             return Response({'error': 'Valid phone number required'}, status=status.HTTP_400_BAD_REQUEST)

#         settings_obj = SMSAutomationSettings.objects.first()
#         if not settings_obj or not settings_obj.enabled:
#             return Response({'error': 'SMS Automation disabled'}, status=status.HTTP_400_BAD_REQUEST)

#         # Create test client data for variable substitution
#         client_data = {
#             'client_id': 'CLT-TEST123',
#             'username': 'test_user',
#             'phone_number': recipient,
#             'plan_name': 'Business 10GB',
#             'data_used': '8.5',
#             'data_total': '10',
#             'expiry_date': '2023-12-31',
#             'renewal_link': 'https://myisp.com/renew'
#         }

#         # Replace variables in message template
#         message = trigger.message
#         for key, value in client_data.items():
#             message = message.replace(f'{{{key}}}', value)

#         try:
#             # Initialize Africa's Talking (or other gateway)
#             africastalking.initialize(settings_obj.username, settings_obj.api_key)
#             sms = africastalking.SMS
            
#             # Send test message
#             response = sms.send(message, [recipient], settings_obj.sender_id)
            
#             # Log the communication
#             CommunicationLog.objects.create(
#                 client=None,
#                 message_type='sms',
#                 trigger_type='test',
#                 subject=f"Test: {trigger.name}",
#                 message=message,
#                 status='delivered' if response['SMSMessageData']['Recipients'][0]['status'] == 'Success' else 'failed',
#                 sent_at=timezone.now()
#             )

#             # Update trigger stats
#             SMSTrigger.objects.filter(pk=pk).update(
#                 sent_count=models.F('sent_count') + 1,
#                 success_count=models.F('success_count') + 1 if response['SMSMessageData']['Recipients'][0]['status'] == 'Success' else models.F('success_count'),
#                 last_triggered=timezone.now()
#             )

#             return Response({
#                 'success': True,
#                 'message': 'Test message sent successfully!',
#                 'recipient': recipient,
#                 'test_message': message,
#                 'timestamp': timezone.now().isoformat()
#             })
#         except Exception as e:
#             logger.error(f"Failed to send test message: {str(e)}")
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class SMSAnalyticsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         # Get analytics for the last 30 days
#         thirty_days_ago = timezone.now() - timedelta(days=30)
        
#         # Get total messages
#         total_messages = CommunicationLog.objects.filter(
#             timestamp__gte=thirty_days_ago
#         ).count()
        
#         # Get successful messages
#         successful_messages = CommunicationLog.objects.filter(
#             timestamp__gte=thirty_days_ago,
#             status='delivered'
#         ).count()
        
#         # Get failed messages
#         failed_messages = CommunicationLog.objects.filter(
#             timestamp__gte=thirty_days_ago,
#             status='failed'
#         ).count()
        
#         # Get active triggers
#         active_triggers = SMSTrigger.objects.filter(enabled=True).count()
#         total_triggers = SMSTrigger.objects.count()
        
#         # Get messages by type
#         messages_by_type = CommunicationLog.objects.filter(
#             timestamp__gte=thirty_days_ago
#         ).values('message_type').annotate(
#             count=Count('id'),
#             success_rate=Avg(
#                 Case(
#                     When(status='delivered', then=1),
#                     default=0,
#                     output_field=FloatField()
#                 )
#             ) * 100
#         )
        
#         # Get daily message counts for chart
#         daily_messages = CommunicationLog.objects.filter(
#             timestamp__gte=thirty_days_ago
#         ).extra(
#             select={'day': "date(timestamp)"}
#         ).values('day').annotate(
#             count=Count('id'),
#             success_count=Count('id', filter=Q(status='delivered'))
#         ).order_by('day')
        
#         return Response({
#             "total_messages": total_messages,
#             "successful_messages": successful_messages,
#             "failed_messages": failed_messages,
#             "active_triggers": f"{active_triggers}/{total_triggers}",
#             "success_rate": round((successful_messages / total_messages * 100), 2) if total_messages > 0 else 0,
#             "messages_by_type": messages_by_type,
#             "daily_messages": daily_messages
#         }, status=status.HTTP_200_OK)


# class TriggerPerformanceView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         triggers = SMSTrigger.objects.all()
#         performance_data = []
        
#         for trigger in triggers:
#             # Get messages for this trigger (approximate match)
#             messages = CommunicationLog.objects.filter(
#                 trigger_type=trigger.trigger_type,
#                 message__icontains=trigger.message[:50]  # Partial match
#             )
            
#             sent_count = messages.count()
#             success_count = messages.filter(status='delivered').count()
#             success_rate = round((success_count / sent_count * 100), 1) if sent_count > 0 else 0
#             last_triggered = messages.order_by('-timestamp').first()
            
#             performance_data.append({
#                 "id": trigger.id,
#                 "name": trigger.name,
#                 "type": trigger.trigger_type,
#                 "sent": sent_count,
#                 "success_rate": success_rate,
#                 "last_triggered": last_triggered.timestamp if last_triggered else None
#             })
        
#         return Response(performance_data, status=status.HTTP_200_OK)


# @shared_task
# def check_and_trigger_sms():
#     settings_obj = SMSAutomationSettings.objects.first()
#     if not settings_obj or not settings_obj.enabled:
#         return

#     current_time = timezone.now().time()
#     if not (settings_obj.send_time_start <= current_time <= settings_obj.send_time_end):
#         return

#     if settings_obj.sms_balance <= settings_obj.balance_threshold and settings_obj.low_balance_alert:
#         # TODO: Send admin notification
#         logger.warning(f"SMS balance low: {settings_obj.sms_balance}")

#     triggers = SMSTrigger.objects.filter(enabled=True)
#     for trigger in triggers:
#         clients = []
        
#         if trigger.trigger_type == 'data_usage':
#             # Find clients who have reached the data usage threshold
#             clients = Client.objects.annotate(
#                 usage_percentage=ExpressionWrapper(
#                     F('data_usage__used') / F('data_usage__total') * 100,
#                     output_field=FloatField()
#                 )
#             ).filter(
#                 usage_percentage__gte=trigger.threshold,
#                 subscription__is_active=True
#             )
            
#         elif trigger.trigger_type == 'plan_expiry':
#             # Find clients with plans expiring soon
#             target_date = timezone.now().date() + timedelta(days=trigger.days_before)
#             clients = Client.objects.filter(
#                 subscription__end_date=target_date,
#                 subscription__is_active=True
#             )
            
#         elif trigger.trigger_type == 'onboarding':
#             if trigger.event == 'signup':
#                 # Clients created in the last hour
#                 time_threshold = timezone.now() - timedelta(hours=1)
#                 clients = Client.objects.filter(created_at__gte=time_threshold)
                
#             elif trigger.event == 'first_payment':
#                 # Clients with their first transaction in the last hour
#                 time_threshold = timezone.now() - timedelta(hours=1)
#                 clients = Client.objects.filter(
#                     transaction__created_at__gte=time_threshold,
#                     transaction__is_first=True
#                 ).distinct()
                
#             elif trigger.event == 'plan_activation':
#                 # Clients with newly activated plans
#                 time_threshold = timezone.now() - timedelta(hours=1)
#                 clients = Client.objects.filter(
#                     subscription__start_date__gte=time_threshold,
#                     subscription__is_active=True
#                 )

#         for client in clients:
#             if settings_obj.sms_balance <= 0:
#                 break
                
#             # Check if we've already sent this trigger to this client recently
#             recent_messages = CommunicationLog.objects.filter(
#                 client=client,
#                 trigger_type=trigger.trigger_type,
#                 timestamp__gte=timezone.now() - timedelta(hours=24)
#             )
            
#             if recent_messages.exists():
#                 continue

#             # Prepare client data for variable substitution
#             client_data = {
#                 'client_id': f"CLT-{client.id:08d}",
#                 'username': client.user.username,
#                 'phone_number': client.user.phone_number,
#                 'plan_name': client.subscription.internet_plan.name if client.subscription else 'No Plan',
#                 'data_used': f"{client.data_usage['used']:.1f}" if client.data_usage and 'used' in client.data_usage else '0',
#                 'data_total': client.data_usage['total'] if client.data_usage and 'total' in client.data_usage else '0',
#                 'expiry_date': client.subscription.end_date.strftime('%Y-%m-%d') if client.subscription else 'N/A',
#                 'renewal_link': f'https://myisp.com/renew/{client.id}'
#             }

#             # Replace variables in message template
#             message = trigger.message
#             for key, value in client_data.items():
#                 message = message.replace(f'{{{key}}}', str(value))

#             try:
#                 # Initialize SMS gateway
#                 africastalking.initialize(settings_obj.username, settings_obj.api_key)
#                 sms = africastalking.SMS
                
#                 # Send message
#                 response = sms.send(message, [client.user.phone_number], settings_obj.sender_id)
                
#                 # Log the communication
#                 CommunicationLog.objects.create(
#                     client=client,
#                     message_type='sms',
#                     trigger_type=trigger.trigger_type,
#                     subject=f"Automated: {trigger.name}",
#                     message=message,
#                     status='delivered' if response['SMSMessageData']['Recipients'][0]['status'] == 'Success' else 'failed',
#                     sent_at=timezone.now()
#                 )

#                 # Update trigger statistics
#                 with transaction.atomic():
#                     trigger.sent_count += 1
#                     if response['SMSMessageData']['Recipients'][0]['status'] == 'Success':
#                         trigger.success_count += 1
#                     trigger.last_triggered = timezone.now()
#                     trigger.save()

#                     # Update SMS balance
#                     settings_obj.sms_balance -= 1
#                     settings_obj.save()

#             except Exception as e:
#                 logger.error(f"Failed to send automated message to client {client.id}: {str(e)}")
#                 # Log the failure
#                 CommunicationLog.objects.create(
#                     client=client,
#                     message_type='sms',
#                     trigger_type=trigger.trigger_type,
#                     subject=f"Failed: {trigger.name}",
#                     message=message,
#                     status='failed',
#                     sent_at=timezone.now()
#                 )

#     # Update daily analytics
#     today = timezone.now().date()
#     analytics, created = SMSAnalytics.objects.get_or_create(date=today)
    
#     today_messages = CommunicationLog.objects.filter(
#         timestamp__date=today
#     )
    
#     analytics.total_messages = today_messages.count()
#     analytics.successful_messages = today_messages.filter(status='delivered').count()
#     analytics.failed_messages = today_messages.filter(status='failed').count()
#     analytics.active_triggers = SMSTrigger.objects.filter(enabled=True).count()
#     analytics.save()










# sms_automation_views.py - ENHANCED VERSION
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user_management.models.sms_automation_model import (
    SMSTrigger, SMSAutomationSettings, SMSAnalytics, ScheduledMessage
)
from user_management.models.user_model import CommunicationLog
from user_management.serializers.sms_automation_serializer import (
    SMSTriggerSerializer, SMSAutomationSettingsSerializer, 
    SMSAnalyticsSerializer, TriggerPerformanceSerializer,
    MessageTypeAnalyticsSerializer
)
from account.models.admin_model import Client
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.conf import settings
from celery import shared_task
from datetime import datetime, time, date, timedelta
import re
import django.db.models as models
from django.db.models import Count, Q, Avg, Case, When, FloatField, F, ExpressionWrapper
from django.db import transaction
import logging
import africastalking
import requests

logger = logging.getLogger(__name__)

class SMSTriggerListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        triggers = SMSTrigger.objects.all()
        serializer = SMSTriggerSerializer(triggers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SMSTriggerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SMSTriggerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return SMSTrigger.objects.get(pk=pk)
        except SMSTrigger.DoesNotExist:
            return None

    def get(self, request, pk):
        trigger = self.get_object(pk)
        if not trigger:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = SMSTriggerSerializer(trigger)
        return Response(serializer.data)

    def put(self, request, pk):
        trigger = self.get_object(pk)
        if not trigger:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = SMSTriggerSerializer(trigger, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        trigger = self.get_object(pk)
        if not trigger:
            return Response(status=status.HTTP_404_NOT_FOUND)
        trigger.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SMSAutomationSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings_obj, created = SMSAutomationSettings.objects.get_or_create(id=1)
        serializer = SMSAutomationSettingsSerializer(settings_obj)
        return Response(serializer.data)

    def put(self, request):
        settings_obj, created = SMSAutomationSettings.objects.get_or_create(id=1)
        serializer = SMSAutomationSettingsSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendTestMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        trigger = SMSTrigger.objects.filter(pk=pk).first()
        if not trigger:
            return Response({'error': 'Trigger not found'}, status=status.HTTP_404_NOT_FOUND)

        recipient = request.data.get('recipient')
        if not recipient or not re.match(r'^\+\d{10,15}$', recipient):
            return Response({'error': 'Valid phone number required'}, status=status.HTTP_400_BAD_REQUEST)

        settings_obj = SMSAutomationSettings.objects.first()
        if not settings_obj or not settings_obj.enabled:
            return Response({'error': 'SMS Automation disabled'}, status=status.HTTP_400_BAD_REQUEST)

        # Create test client data for variable substitution
        client_data = {
            'client_id': 'CLT-TEST123',
            'username': 'test_user',
            'phone_number': recipient,
            'plan_name': 'Business 10GB',
            'data_used': '8.5',
            'data_total': '10',
            'expiry_date': '2023-12-31',
            'renewal_link': 'https://myisp.com/renew',
            'remaining_days': '5',
            'usage_percentage': '85'
        }

        # Replace variables in message template
        message = trigger.message
        for key, value in client_data.items():
            message = message.replace(f'{{{key}}}', str(value))

        try:
            # Simulate SMS sending (replace with actual gateway integration)
            logger.info(f"TEST SMS: Sending to {recipient}: {message}")
            
            # Simulate successful delivery for testing
            is_success = True
            
            # Update trigger statistics
            with transaction.atomic():
                trigger.sent_count += 1
                if is_success:
                    trigger.success_count += 1
                trigger.last_triggered = timezone.now()
                trigger.save()

            return Response({
                'success': True,
                'message': 'Test message sent successfully!',
                'recipient': recipient,
                'test_message': message,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to send test message: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get analytics for the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Get total messages
        total_messages = CommunicationLog.objects.filter(
            timestamp__gte=thirty_days_ago,
            message_type='sms'
        ).count()
        
        # Get successful messages
        successful_messages = CommunicationLog.objects.filter(
            timestamp__gte=thirty_days_ago,
            message_type='sms',
            status='delivered'
        ).count()
        
        # Get failed messages
        failed_messages = CommunicationLog.objects.filter(
            timestamp__gte=thirty_days_ago,
            message_type='sms',
            status='failed'
        ).count()
        
        # Get active triggers
        active_triggers = SMSTrigger.objects.filter(enabled=True).count()
        total_triggers = SMSTrigger.objects.count()
        
        # Get messages by type
        messages_by_type = CommunicationLog.objects.filter(
            timestamp__gte=thirty_days_ago,
            message_type='sms'
        ).values('trigger_type').annotate(
            count=Count('id'),
            success_rate=Avg(
                Case(
                    When(status='delivered', then=1),
                    default=0,
                    output_field=FloatField()
                )
            ) * 100
        )
        
        # Get daily message counts for chart
        daily_messages = []
        for i in range(30):
            day = timezone.now().date() - timedelta(days=i)
            day_messages = CommunicationLog.objects.filter(
                timestamp__date=day,
                message_type='sms'
            ).count()
            daily_messages.append({
                'day': day.isoformat(),
                'count': day_messages
            })
        
        daily_messages.reverse()
        
        return Response({
            "total_messages": total_messages,
            "successful_messages": successful_messages,
            "failed_messages": failed_messages,
            "active_triggers": f"{active_triggers}/{total_triggers}",
            "success_rate": round((successful_messages / total_messages * 100), 2) if total_messages > 0 else 0,
            "messages_by_type": list(messages_by_type),
            "daily_messages": daily_messages
        }, status=status.HTTP_200_OK)


class TriggerPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        triggers = SMSTrigger.objects.all()
        performance_data = []
        
        for trigger in triggers:
            # Get messages for this trigger
            messages = CommunicationLog.objects.filter(
                trigger_type=trigger.trigger_type
            )
            
            sent_count = messages.count()
            success_count = messages.filter(status='delivered').count()
            success_rate = round((success_count / sent_count * 100), 1) if sent_count > 0 else 0
            last_triggered = messages.order_by('-timestamp').first()
            
            performance_data.append({
                "id": trigger.id,
                "name": trigger.name,
                "type": trigger.trigger_type,
                "sent": sent_count,
                "success_rate": success_rate,
                "last_triggered": last_triggered.timestamp if last_triggered else None
            })
        
        return Response(performance_data, status=status.HTTP_200_OK)


@shared_task
def check_and_trigger_sms():
    """Background task to check and trigger SMS messages"""
    settings_obj = SMSAutomationSettings.objects.first()
    if not settings_obj or not settings_obj.enabled:
        return

    if not settings_obj.can_send_message():
        return

    triggers = SMSTrigger.objects.filter(enabled=True)
    for trigger in triggers:
        try:
            clients_to_notify = get_clients_for_trigger(trigger)
            
            for client in clients_to_notify:
                if settings_obj.sms_balance <= 0:
                    break
                    
                # Check if we've already sent this trigger to this client recently
                recent_messages = CommunicationLog.objects.filter(
                    client=client,
                    trigger_type=trigger.trigger_type,
                    timestamp__gte=timezone.now() - timedelta(hours=24)
                )
                
                if recent_messages.exists():
                    continue

                # Send message
                send_automated_message(client, trigger, settings_obj)
                
        except Exception as e:
            logger.error(f"Error processing trigger {trigger.name}: {str(e)}")
            continue

    # Update daily analytics
    update_sms_analytics()


def get_clients_for_trigger(trigger):
    """Get clients that match the trigger conditions"""
    clients = Client.objects.filter(user__is_active=True)
    
    if trigger.trigger_type == 'data_usage':
        # This would need integration with actual data usage monitoring
        # For now, return empty queryset
        return Client.objects.none()
        
    elif trigger.trigger_type == 'plan_expiry':
        # Clients with plans expiring soon
        target_date = timezone.now().date() + timedelta(days=trigger.days_before)
        from internet_plans.models.create_plan_models import Subscription
        return Client.objects.filter(
            subscription__end_date=target_date,
            subscription__is_active=True
        )
        
    elif trigger.trigger_type == 'onboarding':
        if trigger.event == 'signup':
            # Clients created in the last hour
            time_threshold = timezone.now() - timedelta(hours=1)
            return Client.objects.filter(created_at__gte=time_threshold)
            
        elif trigger.event == 'first_payment':
            # Clients with their first transaction in the last hour
            time_threshold = timezone.now() - timedelta(hours=1)
            from payments.models.payment_config_model import Transaction
            return Client.objects.filter(
                transaction__created_at__gte=time_threshold
            ).distinct()
            
        elif trigger.event == 'plan_activation':
            # Clients with newly activated plans
            time_threshold = timezone.now() - timedelta(hours=1)
            from internet_plans.models.create_plan_models import Subscription
            return Client.objects.filter(
                subscription__start_date__gte=time_threshold,
                subscription__is_active=True
            )
    
    return Client.objects.none()


def send_automated_message(client, trigger, settings):
    """Send an automated message to a client"""
    try:
        # Prepare client data for variable substitution
        client_data = prepare_client_data(client)
        
        # Replace variables in message template
        message = trigger.message
        for key, value in client_data.items():
            message = message.replace(f'{{{key}}}', str(value))

        # Send via SMS gateway (simulated)
        logger.info(f"AUTOMATED SMS: Sending to {client.user.phone_number}: {message}")
        
        # Simulate sending (replace with actual gateway integration)
        is_success = True
        
        # Create communication log
        CommunicationLog.objects.create(
            client=client,
            message_type='sms',
            trigger_type=trigger.trigger_type,
            subject=f"Automated: {trigger.name}",
            message=message,
            status='delivered' if is_success else 'failed',
            sent_at=timezone.now()
        )

        # Update trigger statistics
        with transaction.atomic():
            trigger.sent_count += 1
            if is_success:
                trigger.success_count += 1
            trigger.last_triggered = timezone.now()
            trigger.save()

            # Update SMS balance
            if is_success:
                settings.sms_balance -= 1
                settings.save()
                
    except Exception as e:
        logger.error(f"Failed to send automated message to client {client.id}: {str(e)}")
        # Log the failure
        CommunicationLog.objects.create(
            client=client,
            message_type='sms',
            trigger_type=trigger.trigger_type,
            subject=f"Failed: {trigger.name}",
            message=trigger.message,
            status='failed',
            sent_at=timezone.now()
        )


def prepare_client_data(client):
    """Prepare client data for message template substitution"""
    from internet_plans.models.create_plan_models import Subscription
    from payments.models.payment_config_model import Transaction
    
    active_subscription = Subscription.objects.filter(client=client, is_active=True).first()
    
    data = {
        'client_id': f"CLT-{client.id:08d}",
        'username': client.user.username,
        'phone_number': client.user.phone_number,
        'plan_name': active_subscription.internet_plan.name if active_subscription else 'No Plan',
        'data_used': '0',  # Would come from actual data usage monitoring
        'data_total': '0',  # Would come from actual data usage monitoring
        'expiry_date': active_subscription.end_date.strftime('%Y-%m-%d') if active_subscription else 'N/A',
        'renewal_link': f'https://myisp.com/renew/{client.id}',
        'remaining_days': '0',  # Calculate days until expiry
        'usage_percentage': '0'  # Calculate usage percentage
    }
    
    if active_subscription:
        remaining_days = (active_subscription.end_date - timezone.now().date()).days
        data['remaining_days'] = str(max(0, remaining_days))
    
    return data


def update_sms_analytics():
    """Update daily SMS analytics"""
    today = timezone.now().date()
    analytics, created = SMSAnalytics.objects.get_or_create(date=today)
    
    today_messages = CommunicationLog.objects.filter(
        timestamp__date=today,
        message_type='sms'
    )
    
    analytics.total_messages = today_messages.count()
    analytics.successful_messages = today_messages.filter(status='delivered').count()
    analytics.failed_messages = today_messages.filter(status='failed').count()
    analytics.active_triggers = SMSTrigger.objects.filter(enabled=True).count()
    analytics.save()