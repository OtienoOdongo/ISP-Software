"""
SMS Automation Views - Production Ready
Fully integrated with User Management
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework import serializers
from django.db.models import (
    Count, Sum, Avg, Max, Min, StdDev, Variance,
    Q, F, Case, When, Value, CharField,
    ExpressionWrapper, DurationField, IntegerField
)
from django.db import transaction, models
from django.core.cache import cache
from django.conf import settings
from datetime import datetime, timedelta
import json
from decimal import Decimal
import re

from sms_automation.models.sms_automation_model import (
    SMSGatewayConfig, SMSTemplate, SMSMessage,
    SMSDeliveryLog, SMSAutomationRule, SMSQueue, SMSAnalytics
)
from user_management.models.client_model import ClientProfile
from sms_automation.serializers.sms_automation_serializer import (
    SMSGatewayConfigSerializer, SMSTemplateSerializer,
    SMSMessageSerializer, SMSMessageCreateSerializer,
    SMSDeliveryLogSerializer, SMSAutomationRuleSerializer,
    SMSBulkSendSerializer, SMSDashboardSerializer,
    SMSQueueSerializer, SMSAnalyticsSerializer,
    SMSStatusUpdateSerializer
)
from sms_automation.services.sms_service import SMSService
from sms_automation.services.sms_campaign_service import SMSCampaignService
from sms_automation.services.sms_automation_service import SMSAutomationService

logger = logging.getLogger(__name__)


class SMSPagination(PageNumberPagination):
    """Custom pagination for SMS views"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_size': self.page_size,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })


class SMSGatewayConfigViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Gateway Configuration"""
    
    queryset = SMSGatewayConfig.objects.all()
    serializer_class = SMSGatewayConfigSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['gateway_type', 'is_active', 'is_default', 'is_online']
    search_fields = ['name', 'sender_id', 'smpp_host']
    ordering_fields = ['name', 'created_at', 'updated_at', 'success_rate', 'balance']
    ordering = ['-is_default', '-weight', 'name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by health status
        health_status = self.request.query_params.get('health_status')
        if health_status:
            if health_status == 'healthy':
                queryset = queryset.filter(
                    is_active=True, is_online=True, balance__gt=0, success_rate__gte=80
                )
            elif health_status == 'unhealthy':
                queryset = queryset.filter(
                    Q(is_active=False) | Q(is_online=False) | Q(balance__lte=0) | Q(success_rate__lt=80)
                )
        
        return queryset
    
    def perform_create(self, serializer):
        """Create gateway with created_by user"""
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        """Update gateway with audit"""
        instance = self.get_object()
        old_data = SMSGatewayConfigSerializer(instance).data
        serializer.save()
        
        # Log configuration change
        logger.info(f"SMS Gateway {instance.id} updated by {self.request.user}")
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test gateway connection and get balance"""
        try:
            gateway = self.get_object()
            sms_service = SMSService()
            
            # Test connection
            result = sms_service.test_gateway_connection(gateway)
            
            if result['success']:
                # Update gateway status
                gateway.is_online = True
                gateway.last_online_check = timezone.now()
                gateway.balance = result.get('balance', 0)
                gateway.last_balance_check = timezone.now()
                gateway.save()
                
                return Response({
                    'success': True,
                    'message': 'Connection test successful',
                    'balance': float(result.get('balance', 0)),
                    'gateway_status': 'online',
                    'timestamp': timezone.now().isoformat()
                })
            else:
                gateway.is_online = False
                gateway.last_online_check = timezone.now()
                gateway.save()
                
                return Response({
                    'success': False,
                    'message': f'Connection test failed: {result.get("error", "Unknown error")}',
                    'gateway_status': 'offline',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Gateway connection test failed: {str(e)}")
            return Response({
                'success': False,
                'message': f'Connection test failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set gateway as default"""
        try:
            gateway = self.get_object()
            
            if not gateway.is_active:
                return Response({
                    'success': False,
                    'message': 'Cannot set inactive gateway as default'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set this gateway as default
            gateway.is_default = True
            gateway.save()
            
            # Clear gateway cache
            cache.delete('sms_gateways')
            cache.delete('default_sms_gateway')
            
            return Response({
                'success': True,
                'message': f'{gateway.name} set as default gateway',
                'gateway': SMSGatewayConfigSerializer(gateway).data
            })
            
        except Exception as e:
            logger.error(f"Failed to set default gateway: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to set default: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle gateway active status"""
        try:
            gateway = self.get_object()
            
            # Cannot deactivate default gateway
            if gateway.is_default and not request.data.get('force', False):
                return Response({
                    'success': False,
                    'message': 'Cannot deactivate default gateway. Set another gateway as default first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            gateway.is_active = not gateway.is_active
            gateway.save()
            
            # Clear cache
            cache.delete('sms_gateways')
            
            return Response({
                'success': True,
                'message': f'Gateway {"activated" if gateway.is_active else "deactivated"}',
                'is_active': gateway.is_active,
                'gateway': SMSGatewayConfigSerializer(gateway).data
            })
            
        except Exception as e:
            logger.error(f"Failed to toggle gateway active status: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to toggle: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get status of all gateways"""
        try:
            gateways = self.get_queryset()
            
            status_data = []
            for gateway in gateways:
                gateway_data = SMSGatewayConfigSerializer(gateway).data
                
                # Add real-time status
                sms_service = SMSService()
                real_time_status = sms_service.get_gateway_status(gateway)
                
                gateway_data.update({
                    'real_time_status': real_time_status,
                    'can_send': gateway.is_active and gateway.is_online and gateway.balance > 0,
                    'estimated_capacity_today': gateway.max_messages_per_day - gateway.messages.filter(
                        created_at__date=timezone.now().date()
                    ).count()
                })
                
                status_data.append(gateway_data)
            
            return Response({
                'success': True,
                'gateways': status_data,
                'summary': {
                    'total': len(status_data),
                    'active': len([g for g in status_data if g['is_active']]),
                    'online': len([g for g in status_data if g['is_online']]),
                    'with_balance': len([g for g in status_data if g['balance'] > 0]),
                    'healthy': len([g for g in status_data if g['health_status'] == 'healthy'])
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to get gateway status: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to get gateway status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Templates"""
    
    queryset = SMSTemplate.objects.all()
    serializer_class = SMSTemplateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['template_type', 'is_active', 'is_system', 'language']
    search_fields = ['name', 'subject', 'description', 'message_template']
    ordering_fields = ['name', 'usage_count', 'created_at', 'updated_at']
    ordering = ['template_type', 'name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by tags
        tags = self.request.query_params.getlist('tags')
        if tags:
            for tag in tags:
                queryset = queryset.filter(tags__contains=tag)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create template with created_by user"""
        serializer.save(created_by=self.request.user)
    
    def perform_destroy(self, instance):
        """Prevent deletion of system templates"""
        if instance.is_system:
            raise serializers.ValidationError({
                'detail': 'System templates cannot be deleted'
            })
        super().perform_destroy(instance)
    
    @action(detail=True, methods=['post'])
    def test_render(self, request, pk=None):
        """Test template rendering with sample data"""
        try:
            template = self.get_object()
            
            # Get test data from request or use defaults
            test_data = request.data.get('test_data', {})
            
            # Default test data
            defaults = {
                'client_name': 'John Doe',
                'username': 'johndoe123',
                'password': 'securepass123',
                'phone_number': '0712345678',
                'plan_name': 'Business 10GB',
                'expiry_date': (timezone.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                'remaining_days': '7',
                'data_used': '8.5',
                'data_limit': '10',
                'renewal_date': (timezone.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
                'amount': '1,500',
                'commission_amount': '150',
                'referral_code': 'REF12345',
                'support_contact': '0700123456'
            }
            
            # Merge with defaults
            merged_data = {**defaults, **test_data}
            
            # Render template
            try:
                rendered_message = template.render(merged_data, strict=True)
                
                return Response({
                    'success': True,
                    'template': {
                        'id': template.id,
                        'name': template.name,
                        'type': template.get_template_type_display()
                    },
                    'test_data': merged_data,
                    'rendered_message': rendered_message,
                    'analysis': {
                        'message_length': len(rendered_message),
                        'character_count': template.character_count,
                        'estimated_parts': template._calculate_message_parts(),
                        'variables_used': list(set(re.findall(r'{{(\w+)}}', template.message_template))),
                        'missing_variables': [var for var in template.required_variables if var not in merged_data]
                    }
                })
                
            except ValueError as e:
                return Response({
                    'success': False,
                    'message': f'Template render failed: {str(e)}',
                    'missing_variables': str(e).split(':')[-1].strip() if 'Missing required' in str(e) else []
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Template render test failed: {str(e)}")
            return Response({
                'success': False,
                'message': f'Render test failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a template"""
        try:
            template = self.get_object()
            
            # Generate unique name
            base_name = template.name
            counter = 1
            new_name = f"{base_name} - Copy"
            
            while SMSTemplate.objects.filter(name=new_name).exists():
                counter += 1
                new_name = f"{base_name} - Copy {counter}"
            
            # Create duplicate
            duplicate = SMSTemplate.objects.create(
                name=new_name,
                template_type=template.template_type,
                language=template.language,
                subject=template.subject,
                message_template=template.message_template,
                variables=template.variables,
                required_variables=template.required_variables,
                is_active=template.is_active,
                is_system=False,  # Duplicates are not system templates
                max_length=template.max_length,
                allow_unicode=template.allow_unicode,
                description=f"Duplicate of {template.name}\n{template.description}",
                category=template.category,
                tags=template.tags,
                created_by=request.user
            )
            
            return Response({
                'success': True,
                'message': 'Template duplicated successfully',
                'duplicate': SMSTemplateSerializer(duplicate).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to duplicate template: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to duplicate: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def variables(self, request):
        """Get all available variables across templates"""
        try:
            templates = self.get_queryset()
            
            variables = {}
            for template in templates:
                for var_name, var_info in template.variables.items():
                    if var_name not in variables:
                        variables[var_name] = {
                            'name': var_name,
                            'description': var_info.get('description', ''),
                            'required_in_templates': [],
                            'example': var_info.get('example', ''),
                            'type': var_info.get('type', 'string')
                        }
                    
                    variables[var_name]['required_in_templates'].append({
                        'template_id': template.id,
                        'template_name': template.name,
                        'template_type': template.template_type,
                        'required': var_name in template.required_variables
                    })
            
            return Response({
                'success': True,
                'total_variables': len(variables),
                'variables': list(variables.values()),
                'common_variables': [
                    'client_name', 'phone_number', 'username', 'password',
                    'plan_name', 'expiry_date', 'remaining_days', 'amount'
                ]
            })
            
        except Exception as e:
            logger.error(f"Failed to get template variables: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to get variables'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Messages"""
    
    queryset = SMSMessage.objects.all().select_related(
        'gateway', 'template', 'client', 'created_by', 'sent_by'
    ).prefetch_related('delivery_logs')
    serializer_class = SMSMessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'gateway', 'template', 'client', 'source']
    search_fields = ['phone_number', 'recipient_name', 'message', 'reference_id']
    ordering_fields = ['created_at', 'sent_at', 'delivered_at', 'scheduled_for', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Date range filters
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Sent date filters
        sent_from = self.request.query_params.get('sent_from')
        sent_to = self.request.query_params.get('sent_to')
        if sent_from:
            queryset = queryset.filter(sent_at__date__gte=sent_from)
        if sent_to:
            queryset = queryset.filter(sent_at__date__lte=sent_to)
        
        # Cost filters
        min_cost = self.request.query_params.get('min_cost')
        max_cost = self.request.query_params.get('max_cost')
        if min_cost:
            queryset = queryset.filter(cost__gte=Decimal(min_cost))
        if max_cost:
            queryset = queryset.filter(cost__lte=Decimal(max_cost))
        
        # Message parts filter
        min_parts = self.request.query_params.get('min_parts')
        max_parts = self.request.query_params.get('max_parts')
        if min_parts:
            queryset = queryset.filter(message_parts__gte=int(min_parts))
        if max_parts:
            queryset = queryset.filter(message_parts__lte=int(max_parts))
        
        # Failed messages only
        show_failed = self.request.query_params.get('show_failed')
        if show_failed == 'true':
            queryset = queryset.filter(status='failed')
        
        # Pending messages only
        show_pending = self.request.query_params.get('show_pending')
        if show_pending == 'true':
            queryset = queryset.filter(status__in=['pending', 'scheduled'])
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializer for creation"""
        if self.action == 'create':
            return SMSMessageCreateSerializer
        return super().get_serializer_class()
    
    def perform_create(self, serializer):
        """Create message with created_by user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry sending a failed SMS"""
        try:
            message = self.get_object()
            
            if message.status != 'failed':
                return Response({
                    'success': False,
                    'message': 'Only failed messages can be retried'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if message.retry_count >= message.max_retries:
                return Response({
                    'success': False,
                    'message': 'Maximum retry attempts reached'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sms_service = SMSService()
            success = sms_service.retry_message(message)
            
            return Response({
                'success': success,
                'message': 'SMS retry initiated' if success else 'Failed to retry SMS',
                'new_status': message.status,
                'retry_count': message.retry_count,
                'max_retries': message.max_retries
            })
            
        except Exception as e:
            logger.error(f"Failed to retry SMS: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to retry: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a scheduled SMS"""
        try:
            message = self.get_object()
            
            if message.status not in ['pending', 'scheduled']:
                return Response({
                    'success': False,
                    'message': 'Only pending or scheduled messages can be cancelled'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sms_service = SMSService()
            success = sms_service.cancel_message(message)
            
            return Response({
                'success': success,
                'message': 'SMS cancelled successfully' if success else 'Failed to cancel SMS',
                'new_status': message.status
            })
            
        except Exception as e:
            logger.error(f"Failed to cancel SMS: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to cancel: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def delivery_logs(self, request, pk=None):
        """Get delivery logs for a message"""
        try:
            message = self.get_object()
            logs = message.delivery_logs.all().order_by('-event_time')
            
            return Response({
                'success': True,
                'message_id': str(message.id),
                'phone_number': message.phone_number,
                'total_logs': logs.count(),
                'logs': SMSDeliveryLogSerializer(logs, many=True).data
            })
            
        except Exception as e:
            logger.error(f"Failed to get delivery logs: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to get delivery logs'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def send_test(self, request):
        """Send test SMS"""
        try:
            # Validate required fields
            phone_number = request.data.get('phone_number')
            message_text = request.data.get('message')
            
            if not phone_number or not message_text:
                return Response({
                    'error': 'Phone number and message are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sms_service = SMSService()
            
            # Create test message
            test_message = sms_service.create_test_message(
                phone_number=phone_number,
                message=message_text,
                gateway_id=request.data.get('gateway_id'),
                sender_id=request.data.get('sender_id'),
                user=request.user
            )
            
            # Send immediately
            success = sms_service.send_sms(test_message)
            
            return Response({
                'success': success,
                'message': 'Test SMS sent successfully' if success else 'Failed to send test SMS',
                'sms': SMSMessageSerializer(test_message).data,
                'gateway_used': test_message.gateway.name if test_message.gateway else 'Default'
            })
            
        except Exception as e:
            logger.error(f"Failed to send test SMS: {str(e)}")
            return Response({
                'error': f'Failed to send test SMS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_send(self, request):
        """Send bulk SMS to multiple recipients"""
        try:
            # Use serializer for validation
            serializer = SMSBulkSendSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            sms_service = SMSService()
            
            # Create messages for each phone number
            results = []
            successful_messages = []
            
            for phone in data['phone_numbers']:
                try:
                    # Create message
                    message_data = {
                        'phone_number': phone,
                        'message': data.get('message'),
                        'template': data.get('template'),
                        'gateway': data.get('gateway'),
                        'priority': data.get('priority', 'normal'),
                        'scheduled_for': data.get('scheduled_for'),
                        'source': 'bulk_send',
                        'created_by': request.user,
                        'context_data': data.get('context_data', {}),
                        'metadata': {
                            'bulk_send': True,
                            'total_recipients': len(data['phone_numbers'])
                        }
                    }
                    
                    # Create message
                    message = sms_service.create_sms_message(**message_data)
                    
                    # Queue for sending if not scheduled
                    if not message.scheduled_for:
                        sms_service.queue_message(message)
                    
                    results.append({
                        'phone': phone,
                        'success': True,
                        'message_id': str(message.id),
                        'status': message.status
                    })
                    successful_messages.append(message)
                    
                except Exception as e:
                    results.append({
                        'phone': phone,
                        'success': False,
                        'error': str(e)
                    })
            
            return Response({
                'success': True,
                'message': f'Bulk SMS processing complete. {len(successful_messages)}/{len(data["phone_numbers"])} queued successfully.',
                'results': results,
                'summary': {
                    'total': len(data['phone_numbers']),
                    'successful': len(successful_messages),
                    'failed': len(data['phone_numbers']) - len(successful_messages)
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to send bulk SMS: {str(e)}")
            return Response({
                'error': f'Failed to send bulk SMS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get SMS statistics with various aggregations"""
        try:
            # Get date range
            days = int(request.query_params.get('days', 30))
            group_by = request.query_params.get('group_by', 'day')
            
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=days)
            
            # Base queryset
            messages = SMSMessage.objects.filter(
                created_at__date__range=[start_date, end_date]
            )
            
            statistics = {}
            
            if group_by == 'day':
                # Daily statistics
                daily_stats = messages.extra(
                    select={'date': "DATE(created_at)"}
                ).values('date').annotate(
                    total=Count('id'),
                    sent=Count('id', filter=Q(status='sent')),
                    delivered=Count('id', filter=Q(status='delivered')),
                    failed=Count('id', filter=Q(status='failed')),
                    pending=Count('id', filter=Q(status__in=['pending', 'scheduled'])),
                    avg_cost=Avg('cost'),
                    total_cost=Sum('cost')
                ).order_by('date')
                
                statistics['daily'] = list(daily_stats)
            
            elif group_by == 'gateway':
                # Gateway statistics
                gateway_stats = messages.filter(gateway__isnull=False).values(
                    'gateway__name', 'gateway__gateway_type'
                ).annotate(
                    total=Count('id'),
                    sent=Count('id', filter=Q(status='sent')),
                    delivered=Count('id', filter=Q(status='delivered')),
                    failed=Count('id', filter=Q(status='failed')),
                    success_rate=Avg(
                        Case(
                            When(status__in=['sent', 'delivered'], then=1.0),
                            default=0.0,
                            output_field=models.FloatField()
                        )
                    ) * 100,
                    avg_delivery_time=Avg('delivery_latency'),
                    total_cost=Sum('cost'),
                    avg_cost=Avg('cost')
                ).order_by('-total')
                
                statistics['gateway'] = list(gateway_stats)
            
            elif group_by == 'template':
                # Template statistics
                template_stats = messages.filter(template__isnull=False).values(
                    'template__name', 'template__template_type'
                ).annotate(
                    total=Count('id'),
                    sent=Count('id', filter=Q(status='sent')),
                    delivered=Count('id', filter=Q(status='delivered')),
                    success_rate=Avg(
                        Case(
                            When(status__in=['sent', 'delivered'], then=1.0),
                            default=0.0,
                            output_field=models.FloatField()
                        )
                    ) * 100
                ).order_by('-total')
                
                statistics['template'] = list(template_stats)
            
            elif group_by == 'client':
                # Client statistics (top 20)
                client_stats = messages.filter(client__isnull=False).values(
                    'client__username', 'client__client_type'
                ).annotate(
                    total=Count('id'),
                    sent=Count('id', filter=Q(status='sent')),
                    delivered=Count('id', filter=Q(status='delivered')),
                    last_message=Max('created_at')
                ).order_by('-total')[:20]
                
                statistics['client'] = list(client_stats)
            
            # Overall summary
            summary = messages.aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed')),
                pending=Count('id', filter=Q(status__in=['pending', 'scheduled'])),
                total_cost=Sum('cost'),
                avg_cost=Avg('cost'),
                avg_delivery_time=Avg('delivery_latency', filter=Q(status='delivered'))
            )
            
            # Calculate delivery rate
            total_sent = (summary['sent'] or 0) + (summary['delivered'] or 0)
            delivery_rate = 0
            if total_sent > 0:
                delivery_rate = ((summary['delivered'] or 0) / total_sent) * 100
            
            return Response({
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                },
                'summary': {
                    'total_messages': summary['total'] or 0,
                    'sent_messages': summary['sent'] or 0,
                    'delivered_messages': summary['delivered'] or 0,
                    'failed_messages': summary['failed'] or 0,
                    'pending_messages': summary['pending'] or 0,
                    'total_cost': float(summary['total_cost'] or 0),
                    'avg_cost': float(summary['avg_cost'] or 0),
                    'avg_delivery_time_seconds': summary['avg_delivery_time'].total_seconds() if summary['avg_delivery_time'] else 0,
                    'delivery_rate': round(delivery_rate, 2)
                },
                'statistics': statistics,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get SMS statistics: {str(e)}")
            return Response({
                'error': 'Failed to get statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export SMS messages to CSV"""
        try:
            import csv
            from django.http import HttpResponse
            from io import StringIO
            
            # Get filtered queryset
            queryset = self.filter_queryset(self.get_queryset())
            
            # Create CSV response
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="sms_messages.csv"'
            
            writer = csv.writer(response)
            
            # Write headers
            headers = [
                'ID', 'Phone Number', 'Recipient Name', 'Message',
                'Status', 'Created At', 'Sent At', 'Delivered At',
                'Gateway', 'Cost', 'Template', 'Client'
            ]
            writer.writerow(headers)
            
            # Write data
            for message in queryset[:10000]:  # Limit to 10,000 rows
                writer.writerow([
                    str(message.id),
                    message.phone_number,
                    message.recipient_name,
                    message.message[:100],  # First 100 chars
                    message.get_status_display(),
                    message.created_at.strftime('%Y-%m-%d %H:%M:%S') if message.created_at else '',
                    message.sent_at.strftime('%Y-%m-%d %H:%M:%S') if message.sent_at else '',
                    message.delivered_at.strftime('%Y-%m-%d %H:%M:%S') if message.delivered_at else '',
                    message.gateway.name if message.gateway else '',
                    str(message.cost) if message.cost else '',
                    message.template.name if message.template else '',
                    message.client.username if message.client else ''
                ])
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to export SMS messages: {str(e)}")
            return Response({
                'error': 'Failed to export messages'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSAutomationRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Automation Rules"""
    
    queryset = SMSAutomationRule.objects.all().select_related(
        'template', 'gateway_override', 'created_by'
    )
    serializer_class = SMSAutomationRuleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['rule_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at', 'execution_count']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by tags
        tags = self.request.query_params.getlist('tags')
        if tags:
            for tag in tags:
                queryset = queryset.filter(tags__contains=tag)
        
        # Filter by template type
        template_type = self.request.query_params.get('template_type')
        if template_type:
            queryset = queryset.filter(template__template_type=template_type)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create rule with created_by user"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle rule active status"""
        try:
            rule = self.get_object()
            rule.is_active = not rule.is_active
            rule.save()
            
            # Clear cache
            cache.delete(f'sms_rule_{rule.id}_status')
            
            return Response({
                'success': True,
                'message': f'Rule {"activated" if rule.is_active else "deactivated"}',
                'is_active': rule.is_active
            })
            
        except Exception as e:
            logger.error(f"Failed to toggle rule: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to toggle: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def test_trigger(self, request, pk=None):
        """Test rule trigger with sample data"""
        try:
            rule = self.get_object()
            
            # Get sample data
            sample_data = request.data.get('test_data', {})
            
            # Add defaults
            defaults = {
                'client_name': 'Test Client',
                'username': 'testuser123',
                'phone_number': '0712345678',
                'plan_name': 'Business 10GB',
                'amount': '1,500',
                'expiry_date': (timezone.now() + timedelta(days=7)).strftime('%Y-%m-%d')
            }
            
            test_context = {**defaults, **sample_data}
            
            # Render template
            rendered_message = rule.template.render(test_context, strict=True)
            
            return Response({
                'success': True,
                'rule': rule.name,
                'template': rule.template.name,
                'test_context': test_context,
                'rendered_message': rendered_message,
                'analysis': {
                    'message_length': len(rendered_message),
                    'character_count': rule.template.character_count,
                    'estimated_parts': rule.template._calculate_message_parts(),
                    'variables_matched': [var for var in test_context if var in rule.template.required_variables]
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to test rule trigger: {str(e)}")
            return Response({
                'success': False,
                'message': f'Test failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """Manually execute rule"""
        try:
            rule = self.get_object()
            
            # Get context from request
            context = request.data.get('context', {})
            client_id = request.data.get('client_id')
            
            # Get client if provided
            client = None
            if client_id:
                try:
                    client = ClientProfile.objects.get(id=client_id)
                except ClientProfile.DoesNotExist:
                    pass
            
            # Execute rule
            sms_service = SMSService()
            result = sms_service.execute_automation_rule(
                rule=rule,
                context=context,
                client=client,
                trigger_event='manual_execution'
            )
            
            if result:
                return Response({
                    'success': True,
                    'message': 'Rule executed successfully',
                    'sms_message': SMSMessageSerializer(result).data
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Rule execution failed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Failed to execute rule: {str(e)}")
            return Response({
                'success': False,
                'message': f'Execution failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get automation rules statistics"""
        try:
            rules = self.get_queryset()
            
            stats = rules.aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(is_active=True)),
                executed_today=Sum('execution_count', filter=Q(last_executed__date=timezone.now().date())),
                total_executions=Sum('execution_count'),
                success_rate=Avg(
                    Case(
                        When(execution_count__gt=0, then=(F('success_count') * 100.0) / F('execution_count')),
                        default=0,
                        output_field=models.FloatField()
                    )
                )
            )
            
            # Group by rule type
            type_stats = rules.values('rule_type').annotate(
                count=Count('id'),
                active=Count('id', filter=Q(is_active=True)),
                executions=Sum('execution_count')
            ).order_by('-count')
            
            return Response({
                'success': True,
                'statistics': stats,
                'type_distribution': list(type_stats),
                'top_rules': SMSAutomationRuleSerializer(
                    rules.order_by('-execution_count')[:5], many=True
                ).data
            })
            
        except Exception as e:
            logger.error(f"Failed to get automation statistics: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to get statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSDeliveryLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for SMS Delivery Logs"""
    
    queryset = SMSDeliveryLog.objects.all().select_related(
        'message', 'gateway'
    )
    serializer_class = SMSDeliveryLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['new_status', 'error_type', 'gateway']
    search_fields = ['message__phone_number', 'error_message', 'gateway_status_message']
    ordering_fields = ['event_time', 'created_at', 'response_time_ms']
    ordering = ['-event_time']


class SMSQueueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for SMS Queue"""
    
    queryset = SMSQueue.objects.all().select_related('message')
    serializer_class = SMSQueueSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'priority']
    ordering_fields = ['priority', 'queued_at', 'processing_started']
    ordering = ['-priority', 'queued_at']
    
    @action(detail=False, methods=['post'])
    def process_batch(self, request):
        """Process a batch of queued messages"""
        try:
            batch_size = int(request.data.get('batch_size', 100))
            
            sms_service = SMSService()
            results = sms_service.process_queue_batch(batch_size)
            
            return Response({
                'success': True,
                'message': f'Processed {len(results["processed"])} messages',
                'results': results
            })
            
        except Exception as e:
            logger.error(f"Failed to process queue batch: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to process batch: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def clear_failed(self, request):
        """Clear failed queue entries"""
        try:
            age_hours = int(request.data.get('age_hours', 24))
            
            cutoff_time = timezone.now() - timedelta(hours=age_hours)
            failed_entries = SMSQueue.objects.filter(
                status='failed',
                last_error_at__lte=cutoff_time
            )
            
            count = failed_entries.count()
            failed_entries.delete()
            
            return Response({
                'success': True,
                'message': f'Cleared {count} failed queue entries'
            })
            
        except Exception as e:
            logger.error(f"Failed to clear failed queue entries: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to clear: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSAnalyticsView(APIView):
    """View for SMS Analytics"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive SMS analytics"""
        try:
            # Get date range
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).date()
            else:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
            if not end_date:
                end_date = timezone.now().date()
            else:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # Get analytics data
            analytics_data = SMSAnalytics.objects.filter(
                date__range=[start_date, end_date]
            ).order_by('date')
            
            # If no analytics exist for date range, create them
            if not analytics_data.exists():
                for single_date in self._date_range(start_date, end_date):
                    SMSAnalytics.update_daily_analytics(single_date)
                analytics_data = SMSAnalytics.objects.filter(
                    date__range=[start_date, end_date]
                ).order_by('date')
            
            # Calculate cumulative statistics
            cumulative = analytics_data.aggregate(
                total_messages=Sum('total_messages'),
                delivered_messages=Sum('delivered_messages'),
                total_cost=Sum('total_cost')
            )
            
            # Calculate trends
            first_day = analytics_data.first()
            last_day = analytics_data.last()
            
            if first_day and last_day:
                trend = {
                    'messages_change': last_day.total_messages - first_day.total_messages,
                    'delivery_rate_change': last_day.delivery_rate - first_day.delivery_rate,
                    'cost_change': float(last_day.total_cost - first_day.total_cost)
                }
            else:
                trend = {}
            
            return Response({
                'period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': (end_date - start_date).days
                },
                'analytics': SMSAnalyticsSerializer(analytics_data, many=True).data,
                'cumulative': cumulative,
                'trends': trend,
                'summary': self._get_analytics_summary(analytics_data)
            })
            
        except Exception as e:
            logger.error(f"Failed to get SMS analytics: {str(e)}")
            return Response({
                'error': 'Failed to get analytics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _date_range(self, start_date, end_date):
        """Generate date range"""
        for n in range(int((end_date - start_date).days) + 1):
            yield start_date + timedelta(n)
    
    def _get_analytics_summary(self, analytics_data):
        """Get summary from analytics data"""
        if not analytics_data.exists():
            return {}
        
        # Calculate averages
        avg_delivery_rate = analytics_data.aggregate(
            avg=Avg('delivery_rate')
        )['avg'] or 0
        
        avg_success_rate = analytics_data.aggregate(
            avg=Avg('success_rate')
        )['avg'] or 0
        
        avg_cost_per_message = analytics_data.aggregate(
            avg=Avg('avg_cost_per_message')
        )['avg'] or 0
        
        # Find best and worst days
        best_day = analytics_data.order_by('-delivery_rate').first()
        worst_day = analytics_data.order_by('delivery_rate').first()
        busiest_day = analytics_data.order_by('-total_messages').first()
        
        return {
            'avg_delivery_rate': round(avg_delivery_rate, 2),
            'avg_success_rate': round(avg_success_rate, 2),
            'avg_cost_per_message': float(avg_cost_per_message),
            'best_day': {
                'date': best_day.date if best_day else None,
                'delivery_rate': best_day.delivery_rate if best_day else 0
            },
            'worst_day': {
                'date': worst_day.date if worst_day else None,
                'delivery_rate': worst_day.delivery_rate if worst_day else 0
            },
            'busiest_day': {
                'date': busiest_day.date if busiest_day else None,
                'messages': busiest_day.total_messages if busiest_day else 0
            }
        }


class SMSDashboardView(APIView):
    """View for SMS Dashboard"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get SMS dashboard data"""
        try:
            today = timezone.now().date()
            
            # Today's statistics
            today_stats = SMSMessage.objects.filter(
                created_at__date=today
            ).aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed')),
                cost=Sum('cost')
            )
            
            # Yesterday's statistics
            yesterday = today - timedelta(days=1)
            yesterday_stats = SMSMessage.objects.filter(
                created_at__date=yesterday
            ).aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed')),
                cost=Sum('cost')
            )
            
            # This month statistics
            first_day = today.replace(day=1)
            month_stats = SMSMessage.objects.filter(
                created_at__date__gte=first_day
            ).aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed')),
                cost=Sum('cost')
            )
            
            # Gateway status
            gateways = SMSGatewayConfig.objects.filter(is_active=True)
            gateway_stats = []
            for gateway in gateways:
                today_gateway = gateway.messages.filter(created_at__date=today)
                gateway_stats.append({
                    'id': gateway.id,
                    'name': gateway.name,
                    'type': gateway.gateway_type,
                    'balance': float(gateway.balance),
                    'messages_today': today_gateway.count(),
                    'success_rate_today': self._calculate_success_rate(today_gateway),
                    'status': gateway.get_health_status()
                })
            
            # Queue status
            queue_stats = SMSQueue.objects.aggregate(
                pending=Count('id', filter=Q(status='pending')),
                processing=Count('id', filter=Q(status='processing')),
                failed=Count('id', filter=Q(status='failed'))
            )
            
            # Automation rules status
            rules_stats = SMSAutomationRule.objects.aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(is_active=True)),
                executed_today=Sum('execution_count', filter=Q(last_executed__date=today))
            )
            
            # Recent messages
            recent_messages = SMSMessage.objects.select_related(
                'gateway', 'template', 'client'
            ).order_by('-created_at')[:10]
            
            # Top templates today
            top_templates = SMSTemplate.objects.annotate(
                today_usage=Count('messages', filter=Q(messages__created_at__date=today))
            ).filter(today_usage__gt=0).order_by('-today_usage')[:5]
            
            # Issues and alerts
            issues = self._get_system_issues()
            
            # Prepare response
            dashboard_data = {
                'today': {
                    'total': today_stats['total'] or 0,
                    'sent': today_stats['sent'] or 0,
                    'delivered': today_stats['delivered'] or 0,
                    'failed': today_stats['failed'] or 0,
                    'cost': float(today_stats['cost'] or 0)
                },
                'yesterday': {
                    'total': yesterday_stats['total'] or 0,
                    'sent': yesterday_stats['sent'] or 0,
                    'delivered': yesterday_stats['delivered'] or 0,
                    'failed': yesterday_stats['failed'] or 0,
                    'cost': float(yesterday_stats['cost'] or 0)
                },
                'month': {
                    'total': month_stats['total'] or 0,
                    'sent': month_stats['sent'] or 0,
                    'delivered': month_stats['delivered'] or 0,
                    'failed': month_stats['failed'] or 0,
                    'cost': float(month_stats['cost'] or 0)
                },
                'gateways': gateway_stats,
                'queue': queue_stats,
                'automation': rules_stats,
                'recent_messages': SMSMessageSerializer(recent_messages, many=True).data,
                'top_templates': [
                    {
                        'id': template.id,
                        'name': template.name,
                        'type': template.template_type,
                        'usage_today': template.today_usage
                    }
                    for template in top_templates
                ],
                'issues': issues,
                'critical_alerts': len([issue for issue in issues if issue.get('severity') == 'critical']),
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(dashboard_data)
            
        except Exception as e:
            logger.error(f"Failed to get SMS dashboard: {str(e)}")
            return Response({
                'error': 'Failed to get dashboard data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_success_rate(self, queryset):
        """Calculate success rate from queryset"""
        if not queryset.exists():
            return 0
        
        successful = queryset.filter(status__in=['sent', 'delivered']).count()
        return (successful / queryset.count()) * 100
    
    def _get_system_issues(self):
        """Get system issues and alerts"""
        issues = []
        today = timezone.now().date()
        
        # Check for gateways with low balance
        low_balance_gateways = SMSGatewayConfig.objects.filter(
            is_active=True, balance__lt=100
        )
        
        for gateway in low_balance_gateways:
            issues.append({
                'type': 'low_balance',
                'title': f'Low Balance Alert: {gateway.name}',
                'message': f'Balance is {gateway.currency} {gateway.balance:,.2f}',
                'severity': 'high' if gateway.balance < 50 else 'medium',
                'gateway_id': gateway.id,
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for high failure rate today
        failed_today = SMSMessage.objects.filter(
            status='failed',
            created_at__date=today
        ).count()
        
        if failed_today > 10:
            issues.append({
                'type': 'high_failure_rate',
                'title': 'High SMS Failure Rate Today',
                'message': f'{failed_today} messages failed today',
                'severity': 'high',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for offline gateways
        offline_gateways = SMSGatewayConfig.objects.filter(
            is_active=True, is_online=False
        )
        
        for gateway in offline_gateways:
            issues.append({
                'type': 'gateway_offline',
                'title': f'Gateway Offline: {gateway.name}',
                'message': 'Gateway is not responding',
                'severity': 'critical',
                'gateway_id': gateway.id,
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for stuck queue
        stuck_queue = SMSQueue.objects.filter(
            status='processing',
            processing_started__lt=timezone.now() - timedelta(minutes=5)
        ).count()
        
        if stuck_queue > 0:
            issues.append({
                'type': 'stuck_queue',
                'title': 'Stuck Queue Items',
                'message': f'{stuck_queue} messages stuck in processing for more than 5 minutes',
                'severity': 'medium',
                'timestamp': timezone.now().isoformat()
            })
        
        return issues


class ProcessScheduledMessagesView(APIView):
    """View to process scheduled SMS messages"""
    
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Process scheduled messages"""
        try:
            limit = int(request.data.get('limit', 100))
            
            sms_service = SMSService()
            results = sms_service.process_scheduled_messages(limit)
            
            return Response({
                'success': True,
                'message': f'Processed {results["processed"]} scheduled messages',
                'results': results,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to process scheduled messages: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to process: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProcessRetryMessagesView(APIView):
    """View to process retry SMS messages"""
    
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        """Process retry messages"""
        try:
            limit = int(request.data.get('limit', 100))
            
            sms_service = SMSService()
            results = sms_service.process_retry_messages(limit)
            
            return Response({
                'success': True,
                'message': f'Processed {results["processed"]} retry messages',
                'results': results,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to process retry messages: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to process: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSWebhookView(APIView):
    """View for SMS gateway webhooks"""
    
    authentication_classes = []
    permission_classes = []
    
    def post(self, request, gateway_type=None):
        """Handle incoming webhook from SMS gateway"""
        try:
            gateway_type = gateway_type or request.data.get('gateway_type')
            
            if not gateway_type:
                return Response({
                    'error': 'Gateway type is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sms_service = SMSService()
            
            # Process webhook based on gateway type
            result = sms_service.process_webhook(
                gateway_type=gateway_type,
                data=request.data,
                headers=request.headers
            )
            
            if result['success']:
                return Response({
                    'success': True,
                    'message': 'Webhook processed successfully',
                    'updates': result.get('updates', [])
                })
            else:
                return Response({
                    'success': False,
                    'message': result.get('error', 'Webhook processing failed')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Failed to process webhook: {str(e)}")
            return Response({
                'error': 'Failed to process webhook'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request, gateway_type=None):
        """Handle webhook verification (for some gateways)"""
        try:
            # Return success for verification
            return Response({
                'success': True,
                'message': 'Webhook endpoint is active'
            })
        except Exception as e:
            logger.error(f"Webhook verification failed: {str(e)}")
            return Response({
                'error': 'Verification failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateMessageStatusView(APIView):
    """View to update SMS message status"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, message_id):
        """Update message status"""
        try:
            # Get message
            try:
                message = SMSMessage.objects.get(id=message_id)
            except SMSMessage.DoesNotExist:
                return Response({
                    'error': 'Message not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Validate data
            serializer = SMSStatusUpdateSerializer(
                data=request.data,
                context={'instance': message}
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # Update message status
            old_status = message.status
            message.status = data['status']
            
            if data.get('status_message'):
                message.status_message = data['status_message']
            
            if data.get('gateway_message_id'):
                message.gateway_message_id = data['gateway_message_id']
            
            if data.get('gateway_response'):
                if not message.gateway_response:
                    message.gateway_response = {}
                message.gateway_response.update(data['gateway_response'])
            
            if data.get('cost'):
                message.cost = data['cost']
            
            # Set timestamps
            now = timezone.now()
            if data['status'] == 'sent' and not message.sent_at:
                message.sent_at = now
            elif data['status'] == 'delivered' and not message.delivered_at:
                message.delivered_at = now
                if message.sent_at:
                    message.delivery_latency = now - message.sent_at
            
            # Add to status history
            message.status_history.append({
                'timestamp': now.isoformat(),
                'old_status': old_status,
                'new_status': data['status'],
                'updated_by': request.user.username,
                'note': data.get('status_message', '')
            })
            
            message.save()
            
            # Create delivery log
            SMSDeliveryLog.log_status_change(
                message=message,
                old_status=old_status,
                new_status=data['status'],
                gateway_data={
                    'status_message': data.get('status_message', ''),
                    'updated_by': request.user.username
                }
            )
            
            return Response({
                'success': True,
                'message': 'Status updated successfully',
                'sms': SMSMessageSerializer(message).data
            })
            
        except Exception as e:
            logger.error(f"Failed to update message status: {str(e)}")
            return Response({
                'error': f'Failed to update status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendPPPoECredentialsView(APIView):
    """View to send PPPoE credentials via SMS"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Send PPPoE credentials"""
        try:
            # Validate request data
            phone_number = request.data.get('phone_number')
            client_name = request.data.get('client_name')
            pppoe_username = request.data.get('pppoe_username')
            password = request.data.get('password')
            
            if not all([phone_number, client_name, pppoe_username, password]):
                return Response({
                    'error': 'All fields are required: phone_number, client_name, pppoe_username, password'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sms_service = SMSService()
            
            # Send PPPoE credentials
            sms_message = sms_service.send_pppoe_credentials(
                phone_number=phone_number,
                client_name=client_name,
                pppoe_username=pppoe_username,
                password=password,
                client_id=request.data.get('client_id'),
                gateway_id=request.data.get('gateway_id'),
                user=request.user
            )
            
            return Response({
                'success': True,
                'message': 'PPPoE credentials sent successfully',
                'sms': SMSMessageSerializer(sms_message).data
            })
            
        except Exception as e:
            logger.error(f"Failed to send PPPoE credentials: {str(e)}")
            return Response({
                'error': f'Failed to send credentials: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)