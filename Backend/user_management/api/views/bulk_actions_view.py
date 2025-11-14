




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user_management.models.bulk_actions_model import MessageTemplate, BulkActionLog, UserImportFile
from user_management.models.sms_automation_model import SMSAutomationSettings
from user_management.models.user_model import Client, CommunicationLog
from user_management.serializers.bulk_actions_serializer import (
    MessageTemplateSerializer, BulkActionLogSerializer, 
    BulkUserSerializer, UserImportFileSerializer
)
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import africastalking
import time
import pandas as pd
from django.conf import settings
from celery import shared_task
from datetime import datetime, timedelta
import re
import django.db.models as models
from django.db import transaction
from django.contrib.auth import get_user_model
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from payments.models.payment_config_model import Transaction
import logging
import os
from django.http import HttpResponse
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

User = get_user_model()

class MessageTemplateListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = MessageTemplate.objects.all()
        serializer = MessageTemplateSerializer(templates, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MessageTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageTemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return MessageTemplate.objects.get(pk=pk)
        except MessageTemplate.DoesNotExist:
            return None

    def get(self, request, pk):
        template = self.get_object(pk)
        if not template:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = MessageTemplateSerializer(template)
        return Response(serializer.data)

    def put(self, request, pk):
        template = self.get_object(pk)
        if not template:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = MessageTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        template = self.get_object(pk)
        if not template:
            return Response(status=status.HTTP_404_NOT_FOUND)
        template.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BulkUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', 'all')
        plan_filter = request.query_params.get('plan', 'all')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))

        clients = Client.objects.select_related('user').prefetch_related('subscriptions__internet_plan')
        
        if search:
            clients = clients.filter(
                models.Q(user__username__icontains=search) |
                models.Q(user__phone_number__icontains=search) |
                models.Q(subscriptions__internet_plan__name__icontains=search)
            )
        
        if status_filter != 'all':
            clients = clients.filter(user__is_active=(status_filter == 'active'))
        
        if plan_filter != 'all':
            clients = clients.filter(subscriptions__internet_plan__name=plan_filter, subscriptions__is_active=True)

        total_count = clients.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        clients = clients[start_index:end_index]
        
        serializer = BulkUserSerializer(clients, many=True)
        
        return Response({
            'users': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })


class BulkUserImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Save the uploaded file
            import_file = UserImportFile.objects.create(
                file=file,
                original_filename=file.name
            )

            # Process the file asynchronously
            process_user_import.delay(import_file.id)
            
            return Response({
                'message': 'File uploaded successfully. Processing started.',
                'file_id': import_file.id
            }, status=status.HTTP_202_ACCEPTED)
            
        except Exception as e:
            logger.error(f"Failed to process import file: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@shared_task
def process_user_import(import_file_id):
    try:
        import_file = UserImportFile.objects.get(id=import_file_id)
        
        # Read the file
        if import_file.file.name.endswith('.csv'):
            df = pd.read_csv(import_file.file)
        else:
            df = pd.read_excel(import_file.file)
        
        total_users = len(df)
        success_count = 0
        errors = []

        for index, row in df.iterrows():
            try:
                with transaction.atomic():
                    phone_number = str(row.get('phone_number', '')).strip()
                    username = str(row.get('username', '')).strip()
                    plan_name = str(row.get('plan_name', '')).strip()

                    # Validate required fields
                    if not re.match(r'^\+\d{10,15}$', phone_number):
                        errors.append({'row': index + 2, 'error': 'Invalid phone number format'})
                        continue
                    
                    if not username:
                        errors.append({'row': index + 2, 'error': 'Username is required'})
                        continue

                    # Check for duplicates
                    if User.objects.filter(username=username).exists():
                        errors.append({'row': index + 2, 'error': 'Username already exists'})
                        continue
                    
                    if User.objects.filter(phone_number=phone_number).exists():
                        errors.append({'row': index + 2, 'error': 'Phone number already exists'})
                        continue

                    # Create user account
                    user = User.objects.create_client(
                        phone_number=phone_number,
                        username=username
                    )

                    # Create client
                    client = Client.objects.create(
                        user=user
                    )

                    # Create subscription if plan provided
                    if plan_name:
                        plan = InternetPlan.objects.filter(name=plan_name).first()
                        if plan:
                            Subscription.objects.create(
                                client=client,
                                internet_plan=plan,
                                is_active=True,
                                start_date=timezone.now(),
                                end_date=timezone.now() + timedelta(days=30)
                            )

                    success_count += 1

            except Exception as e:
                errors.append({'row': index + 2, 'error': str(e)})
                continue

        # Create bulk action log
        status = 'completed' if not errors else 'partial' if success_count > 0 else 'failed'
        
        BulkActionLog.objects.create(
            action_type='import',
            total_users=total_users,
            success_count=success_count,
            failed_count=total_users - success_count,
            status=status,
            errors=errors
        )

        # Mark file as processed
        import_file.processed = True
        import_file.save()

    except Exception as e:
        logger.error(f"Failed to process user import: {str(e)}")
        BulkActionLog.objects.create(
            action_type='import',
            total_users=0,
            success_count=0,
            failed_count=0,
            status='failed',
            errors=[{'error': str(e)}]
        )


class BulkActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action_type = request.data.get('action_type')
        user_ids = request.data.get('user_ids', [])
        message = request.data.get('message')
        message_type = request.data.get('message_type', 'sms')
        subject = request.data.get('subject', '')
        plan_name = request.data.get('plan_name')
        schedule_time = request.data.get('schedule_time')

        if not user_ids:
            return Response({'error': 'No users selected'}, status=status.HTTP_400_BAD_REQUEST)

        if action_type == 'message' and not message:
            return Response({'error': 'Message required'}, status=status.HTTP_400_BAD_REQUEST)

        if action_type == 'change_plan' and not plan_name:
            return Response({'error': 'Plan name required'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle scheduled actions
        if schedule_time:
            try:
                schedule_dt = datetime.fromisoformat(schedule_time.replace('Z', '+00:00'))
                if schedule_dt <= timezone.now():
                    return Response({'error': 'Schedule time must be in the future'}, status=status.HTTP_400_BAD_REQUEST)
                
                schedule_bulk_action.delay(
                    action_type, user_ids, message, message_type, subject, plan_name, schedule_time
                )
                
                log = BulkActionLog.objects.create(
                    action_type=action_type,
                    message_type=message_type,
                    total_users=len(user_ids),
                    status='pending',
                    scheduled_for=schedule_dt
                )
                
                return Response(BulkActionLogSerializer(log).data, status=status.HTTP_202_ACCEPTED)
                
            except ValueError:
                return Response({'error': 'Invalid schedule time format'}, status=status.HTTP_400_BAD_REQUEST)

        # Execute immediate action
        clients = Client.objects.filter(id__in=user_ids).prefetch_related('subscriptions__internet_plan')
        success_count = 0
        errors = []

        if action_type == 'message':
            success_count, errors = self._send_bulk_message(clients, message, message_type, subject)
            
        elif action_type in ['activate', 'deactivate']:
            success_count, errors = self._toggle_user_status(clients, action_type)
            
        elif action_type == 'change_plan':
            success_count, errors = self._change_user_plan(clients, plan_name)
            
        elif action_type == 'delete':
            success_count, errors = self._delete_users(clients)

        # Create action log
        status = 'completed' if not errors else 'partial' if success_count > 0 else 'failed'
        
        log = BulkActionLog.objects.create(
            action_type=action_type,
            message_type=message_type if action_type == 'message' else '',
            total_users=len(user_ids),
            success_count=success_count,
            failed_count=len(user_ids) - success_count,
            status=status,
            errors=errors,
            completed_at=timezone.now()
        )

        return Response(BulkActionLogSerializer(log).data, status=status.HTTP_200_OK)

    def _send_bulk_message(self, clients, message, message_type, subject):
        settings_obj = SMSAutomationSettings.objects.first()
        if not settings_obj or not settings_obj.enabled:
            return 0, [{'error': 'SMS Automation disabled'}]

        success_count = 0
        errors = []

        africastalking.initialize(settings_obj.username, settings_obj.api_key)
        sms = africastalking.SMS

        for client in clients:
            try:
                active_subscription = client.subscriptions.filter(is_active=True).first()
                # Prepare client data for variable substitution
                client_data = {
                    'client_id': client.user.client_id,
                    'username': client.user.username,
                    'phone_number': str(client.user.phone_number),
                    'plan_name': active_subscription.internet_plan.name if active_subscription and active_subscription.internet_plan else 'No Plan',
                    'data_used': '0',  # Placeholder, as Client has no data_usage field
                    'data_total': '0',  # Placeholder, as Client has no data_usage field
                    'expiry_date': active_subscription.end_date.strftime('%Y-%m-%d') if active_subscription else 'N/A',
                    'renewal_link': f'https://myisp.com/renew/{client.id}'
                }

                # Replace variables in message
                formatted_message = message
                for key, value in client_data.items():
                    formatted_message = formatted_message.replace(f'{{{key}}}', str(value))

                # Send message
                response = sms.send(formatted_message, [str(client.user.phone_number)], settings_obj.sender_id)
                
                # Log communication
                CommunicationLog.objects.create(
                    client=client,
                    message_type=message_type,
                    trigger_type='manual',
                    subject=subject,
                    message=formatted_message,
                    status='delivered' if response['SMSMessageData']['Recipients'][0]['status'] == 'Success' else 'failed',
                    sent_at=timezone.now()
                )

                # Update SMS balance
                if response['SMSMessageData']['Recipients'][0]['status'] == 'Success':
                    settings_obj.sms_balance -= 1
                    settings_obj.save()

                success_count += 1

            except Exception as e:
                errors.append({'user_id': client.id, 'error': str(e)})
                continue

        return success_count, errors

    def _toggle_user_status(self, clients, action_type):
        success_count = 0
        errors = []

        for client in clients:
            try:
                if action_type == 'activate':
                    client.user.is_active = True
                    active_subscription = client.subscriptions.filter(is_active=True).first()
                    if active_subscription:
                        active_subscription.is_active = True
                        active_subscription.save()
                else:  # deactivate
                    client.user.is_active = False
                    active_subscription = client.subscriptions.filter(is_active=True).first()
                    if active_subscription:
                        active_subscription.is_active = False
                        active_subscription.save()
                
                client.user.save()
                success_count += 1

            except Exception as e:
                errors.append({'user_id': client.id, 'error': str(e)})
                continue

        return success_count, errors

    def _change_user_plan(self, clients, plan_name):
        success_count = 0
        errors = []

        plan = InternetPlan.objects.filter(name=plan_name).first()
        if not plan:
            return 0, [{'error': f'Plan "{plan_name}" not found'}]

        for client in clients:
            try:
                # Deactivate current active subscription if exists
                active_subscription = client.subscriptions.filter(is_active=True).first()
                if active_subscription:
                    active_subscription.is_active = False
                    active_subscription.save()

                # Create new subscription
                Subscription.objects.create(
                    client=client,
                    internet_plan=plan,
                    is_active=True,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timedelta(days=30)
                )

                success_count += 1

            except Exception as e:
                errors.append({'user_id': client.id, 'error': str(e)})
                continue

        return success_count, errors

    def _delete_users(self, clients):
        success_count = 0
        errors = []

        for client in clients:
            try:
                # Soft delete - deactivate user and subscriptions
                client.user.is_active = False
                client.user.save()
                
                active_subscription = client.subscriptions.filter(is_active=True).first()
                if active_subscription:
                    active_subscription.is_active = False
                    active_subscription.save()
                
                success_count += 1

            except Exception as e:
                errors.append({'user_id': client.id, 'error': str(e)})
                continue

        return success_count, errors


@shared_task
def schedule_bulk_action(action_type, user_ids, message, message_type, subject, plan_name, schedule_time):
    try:
        schedule_dt = datetime.fromisoformat(schedule_time.replace('Z', '+00:00'))
        
        # Wait until scheduled time
        while timezone.now() < schedule_dt:
            time.sleep(1)

        # Execute the action
        clients = Client.objects.filter(id__in=user_ids).prefetch_related('subscriptions__internet_plan')
        success_count = 0
        errors = []

        if action_type == 'message':
            success_count, errors = BulkActionView()._send_bulk_message(clients, message, message_type, subject)
        elif action_type in ['activate', 'deactivate']:
            success_count, errors = BulkActionView()._toggle_user_status(clients, action_type)
        elif action_type == 'change_plan':
            success_count, errors = BulkActionView()._change_user_plan(clients, plan_name)
        elif action_type == 'delete':
            success_count, errors = BulkActionView()._delete_users(clients)

        # Create action log
        status = 'completed' if not errors else 'partial' if success_count > 0 else 'failed'
        
        BulkActionLog.objects.create(
            action_type=action_type,
            message_type=message_type if action_type == 'message' else '',
            total_users=len(user_ids),
            success_count=success_count,
            failed_count=len(user_ids) - success_count,
            status=status,
            errors=errors,
            completed_at=timezone.now()
        )

    except Exception as e:
        logger.error(f"Failed to execute scheduled bulk action: {str(e)}")
        BulkActionLog.objects.create(
            action_type=action_type,
            total_users=len(user_ids),
            success_count=0,
            failed_count=len(user_ids),
            status='failed',
            errors=[{'error': str(e)}],
            completed_at=timezone.now()
        )


class BulkActionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        actions = BulkActionLog.objects.all().order_by('-created_at')
        
        total_count = actions.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        actions = actions[start_index:end_index]
        
        serializer = BulkActionLogSerializer(actions, many=True)
        
        return Response({
            'actions': serializer.data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })


class DownloadTemplateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Create CSV template
        template_data = {
            'username': ['john_doe', 'jane_smith'],
            'phone_number': ['+254712345678', '+254723456789'],
            'plan_name': ['Business 10GB', 'Residential 5GB'],
        }
        
        df = pd.DataFrame(template_data)
        
        # Create HTTP response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="bulk_import_template.csv"'
        
        df.to_csv(response, index=False)
        return response