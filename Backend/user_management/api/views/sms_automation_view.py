"""
SMS Automation Views
Production-ready views for SMS automation
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q, F, Case, When
from django.db import transaction, models
from django.core.cache import cache
from datetime import datetime, timedelta
import json

from user_management.models.sms_automation_model import (
    SMSGatewayConfig, SMSTemplate, SMSMessage,
    SMSDeliveryLog, SMSAutomationRule
)
from user_management.serializers.sms_automation_serializer import (
    SMSGatewayConfigSerializer, SMSTemplateSerializer,
    SMSMessageSerializer, SMSMessageCreateSerializer,
    SMSDeliveryLogSerializer, SMSAutomationRuleSerializer,
    SMSSendTestSerializer, SMSBulkSendSerializer,
    SMSAnalyticsFilterSerializer, SMSDashboardSerializer
)
from sms_automation.services.sms_services import SMSService

logger = logging.getLogger(__name__)


class SMSPagination(PageNumberPagination):
    """Custom pagination for SMS views"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    page_query_param = 'page'


class SMSGatewayConfigViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Gateway Configuration"""
    
    queryset = SMSGatewayConfig.objects.all()
    serializer_class = SMSGatewayConfigSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        
        # Filter by gateway type
        gateway_type = self.request.query_params.get('gateway_type')
        if gateway_type:
            queryset = queryset.filter(gateway_type=gateway_type)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test gateway connection"""
        try:
            gateway = self.get_object()
            sms_service = SMSService()
            
            # Get gateway instance
            if gateway.id in sms_service.gateways:
                sms_gateway = sms_service.gateways[gateway.id]
                
                # Test by getting balance
                balance = sms_gateway.get_balance()
                
                # Update gateway last checked
                gateway.last_checked = timezone.now()
                gateway.balance = balance
                gateway.save()
                
                return Response({
                    'success': True,
                    'message': 'Connection test successful',
                    'balance': float(balance),
                    'last_checked': gateway.last_checked.isoformat()
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Gateway not initialized'
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
            
            # Set this gateway as default
            gateway.is_default = True
            gateway.save()
            
            return Response({
                'success': True,
                'message': f'{gateway.name} set as default gateway'
            })
            
        except Exception as e:
            logger.error(f"Failed to set default gateway: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to set default: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get status of all gateways"""
        try:
            gateways = self.get_queryset()
            
            status_data = []
            for gateway in gateways:
                gateway_data = SMSGatewayConfigSerializer(gateway).data
                
                # Add connection status
                gateway_data['connection_status'] = 'unknown'
                if gateway.last_checked:
                    if (timezone.now() - gateway.last_checked) < timedelta(hours=1):
                        gateway_data['connection_status'] = 'online'
                    else:
                        gateway_data['connection_status'] = 'stale'
                
                status_data.append(gateway_data)
            
            return Response(status_data)
            
        except Exception as e:
            logger.error(f"Failed to get gateway status: {str(e)}")
            return Response({
                'error': 'Failed to get gateway status'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Templates"""
    
    queryset = SMSTemplate.objects.all()
    serializer_class = SMSTemplateSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by template type
        template_type = self.request.query_params.get('template_type')
        if template_type:
            queryset = queryset.filter(template_type=template_type)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def test_render(self, request, pk=None):
        """Test template rendering with sample data"""
        try:
            template = self.get_object()
            
            # Get test data from request
            test_data = request.data.get('test_data', {})
            
            # Add default test data if not provided
            if 'client_name' not in test_data:
                test_data['client_name'] = 'Test Client'
            if 'username' not in test_data:
                test_data['username'] = 'testuser123'
            if 'password' not in test_data:
                test_data['password'] = 'testpass123'
            if 'phone' not in test_data:
                test_data['phone'] = '0712345678'
            
            # Render template
            rendered_message = template.render(test_data)
            
            return Response({
                'success': True,
                'template': template.name,
                'test_data': test_data,
                'rendered_message': rendered_message,
                'message_length': len(rendered_message)
            })
            
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
            
            # Create duplicate
            duplicate = SMSTemplate.objects.create(
                name=f"{template.name} (Copy)",
                template_type=template.template_type,
                subject=template.subject,
                message_template=template.message_template,
                variables=template.variables,
                is_active=template.is_active
            )
            
            return Response({
                'success': True,
                'message': 'Template duplicated successfully',
                'duplicate_id': duplicate.id,
                'duplicate_name': duplicate.name
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to duplicate template: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to duplicate: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Messages"""
    
    queryset = SMSMessage.objects.all().select_related('gateway', 'template', 'client')
    serializer_class = SMSMessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by phone number
        phone = self.request.query_params.get('phone')
        if phone:
            queryset = queryset.filter(phone_number__icontains=phone)
        
        # Filter by client
        client_id = self.request.query_params.get('client_id')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Filter by gateway
        gateway_id = self.request.query_params.get('gateway_id')
        if gateway_id:
            queryset = queryset.filter(gateway_id=gateway_id)
        
        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(phone_number__icontains=search) |
                Q(recipient_name__icontains=search) |
                Q(message__icontains=search)
            )
        
        # Order by
        order_by = self.request.query_params.get('order_by', '-created_at')
        return queryset.order_by(order_by)
    
    def create(self, request, *args, **kwargs):
        """Create and send SMS message"""
        try:
            serializer = SMSMessageCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # Create SMS message
            sms = SMSMessage.objects.create(**data)
            
            # Send SMS immediately if not scheduled
            if not sms.scheduled_for or sms.scheduled_for <= timezone.now():
                sms_service = SMSService()
                sms_service.send_sms(sms)
            
            return Response(
                SMSMessageSerializer(sms, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Failed to create SMS message: {str(e)}")
            return Response({
                'error': f'Failed to create SMS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry sending a failed SMS"""
        try:
            sms = self.get_object()
            
            if sms.status != 'failed':
                return Response({
                    'success': False,
                    'message': 'Only failed messages can be retried'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if sms.retry_count >= sms.max_retries:
                return Response({
                    'success': False,
                    'message': 'Maximum retry attempts reached'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset status and send
            sms.status = 'pending'
            sms.save()
            
            sms_service = SMSService()
            success = sms_service.send_sms(sms)
            
            return Response({
                'success': True,
                'message': 'SMS retry initiated',
                'new_status': sms.status,
                'sent_successfully': success
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
            sms = self.get_object()
            
            if sms.status not in ['pending', 'scheduled']:
                return Response({
                    'success': False,
                    'message': 'Only pending or scheduled messages can be cancelled'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            sms.status = 'cancelled'
            sms.save()
            
            return Response({
                'success': True,
                'message': 'SMS cancelled successfully',
                'new_status': sms.status
            })
            
        except Exception as e:
            logger.error(f"Failed to cancel SMS: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to cancel: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def send_test(self, request):
        """Send test SMS"""
        try:
            serializer = SMSSendTestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # Create test SMS
            sms_service = SMSService()
            
            # Use specified gateway or default
            gateway = None
            if data.get('gateway_id'):
                try:
                    gateway = SMSGatewayConfig.objects.get(id=data['gateway_id'], is_active=True)
                except SMSGatewayConfig.DoesNotExist:
                    return Response({
                        'error': 'Specified gateway not found or inactive'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            sms = sms_service.create_sms_message(
                phone_number=data['phone_number'],
                message=data['message'],
                source='test',
                reference_id=f"test_{timezone.now().timestamp()}"
            )
            
            if gateway:
                sms.gateway = gateway
                sms.save()
            
            # Send SMS
            success = sms_service.send_sms(sms)
            
            return Response({
                'success': success,
                'message': 'Test SMS sent' if success else 'Test SMS failed',
                'sms_id': str(sms.id),
                'status': sms.status,
                'gateway_used': sms.gateway.name if sms.gateway else 'Default'
            })
            
        except Exception as e:
            logger.error(f"Failed to send test SMS: {str(e)}")
            return Response({
                'error': f'Failed to send test SMS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_send(self, request):
        """Send bulk SMS"""
        try:
            serializer = SMSBulkSendSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            phone_numbers = data['phone_numbers']
            message = data['message']
            
            # Get template if provided
            template = None
            if data.get('template_id'):
                try:
                    template = SMSTemplate.objects.get(id=data['template_id'], is_active=True)
                except SMSTemplate.DoesNotExist:
                    return Response({
                        'error': 'Template not found or inactive'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            sms_service = SMSService()
            results = []
            
            for phone in phone_numbers:
                try:
                    # Create SMS for each phone number
                    sms = sms_service.create_sms_message(
                        phone_number=phone,
                        message=message,
                        template=template,
                        source='bulk_send',
                        scheduled_for=data.get('scheduled_for'),
                        reference_id=f"bulk_{timezone.now().timestamp()}"
                    )
                    
                    # Send immediately if not scheduled
                    if not sms.scheduled_for:
                        sms_service.send_sms(sms)
                    
                    results.append({
                        'phone': phone,
                        'success': True,
                        'sms_id': str(sms.id),
                        'status': sms.status
                    })
                    
                except Exception as e:
                    results.append({
                        'phone': phone,
                        'success': False,
                        'error': str(e)
                    })
            
            return Response({
                'success': True,
                'message': f'Bulk SMS sent to {len(phone_numbers)} numbers',
                'results': results,
                'summary': {
                    'total': len(phone_numbers),
                    'successful': len([r for r in results if r['success']]),
                    'failed': len([r for r in results if not r['success']])
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to send bulk SMS: {str(e)}")
            return Response({
                'error': f'Failed to send bulk SMS: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get SMS statistics"""
        try:
            # Get date range from query params
            days = int(request.query_params.get('days', 30))
            start_date = timezone.now() - timedelta(days=days)
            
            # Get basic statistics
            stats = SMSMessage.objects.filter(
                created_at__gte=start_date
            ).aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed')),
                pending=Count('id', filter=Q(status__in=['pending', 'scheduled']))
            )
            
            # Get delivery rate
            total_sent = stats['sent'] + stats['delivered']
            delivery_rate = 0
            if total_sent > 0:
                delivery_rate = (stats['delivered'] / total_sent) * 100
            
            # Get messages by status
            status_distribution = SMSMessage.objects.filter(
                created_at__gte=start_date
            ).values('status').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Get messages by gateway
            gateway_distribution = SMSMessage.objects.filter(
                created_at__gte=start_date,
                gateway__isnull=False
            ).values('gateway__name', 'gateway__gateway_type').annotate(
                count=Count('id'),
                success_rate=Avg(
                    Case(
                        When(status='delivered', then=1),
                        default=0,
                        output_field=models.FloatField()
                    )
                ) * 100
            ).order_by('-count')
            
            # Get messages by day for chart
            daily_messages = []
            for i in range(days):
                day = timezone.now().date() - timedelta(days=i)
                day_count = SMSMessage.objects.filter(
                    created_at__date=day
                ).count()
                daily_messages.append({
                    'date': day.isoformat(),
                    'count': day_count
                })
            daily_messages.reverse()
            
            return Response({
                'period': f'Last {days} days',
                'start_date': start_date.date().isoformat(),
                'end_date': timezone.now().date().isoformat(),
                'overview': {
                    'total_messages': stats['total'],
                    'sent': stats['sent'],
                    'delivered': stats['delivered'],
                    'failed': stats['failed'],
                    'pending': stats['pending'],
                    'delivery_rate': round(delivery_rate, 2)
                },
                'status_distribution': list(status_distribution),
                'gateway_distribution': list(gateway_distribution),
                'daily_messages': daily_messages,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get SMS statistics: {str(e)}")
            return Response({
                'error': 'Failed to get statistics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSAutomationRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for SMS Automation Rules"""
    
    queryset = SMSAutomationRule.objects.all().select_related('template')
    serializer_class = SMSAutomationRuleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SMSPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by rule type
        rule_type = self.request.query_params.get('rule_type')
        if rule_type:
            queryset = queryset.filter(rule_type=rule_type)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle rule active status"""
        try:
            rule = self.get_object()
            rule.is_active = not rule.is_active
            rule.save()
            
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
            
            # Get sample client data
            sample_client = {
                'client_name': 'Test Client',
                'username': 'testuser123',
                'phone': '0712345678',
                'plan_name': 'Business 10GB',
                'expiry_date': '2023-12-31',
                'remaining_days': '5'
            }
            
            # Merge with request data
            test_data = {**sample_client, **request.data.get('test_data', {})}
            
            # Render template
            message = rule.template.render(test_data)
            
            return Response({
                'success': True,
                'rule': rule.name,
                'template': rule.template.name,
                'test_data': test_data,
                'rendered_message': message,
                'message_length': len(message)
            })
            
        except Exception as e:
            logger.error(f"Failed to test rule trigger: {str(e)}")
            return Response({
                'success': False,
                'message': f'Test failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSAnalyticsView(APIView):
    """View for SMS Analytics"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive SMS analytics"""
        try:
            # Parse filters
            serializer = SMSAnalyticsFilterSerializer(data=request.query_params)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            filters = serializer.validated_data
            
            # Set default date range
            start_date = filters.get('start_date') or (timezone.now() - timedelta(days=30)).date()
            end_date = filters.get('end_date') or timezone.now().date()
            
            # Base queryset
            queryset = SMSMessage.objects.filter(
                created_at__date__range=[start_date, end_date]
            )
            
            # Apply additional filters
            if filters.get('gateway_id'):
                queryset = queryset.filter(gateway_id=filters['gateway_id'])
            
            if filters.get('status'):
                queryset = queryset.filter(status=filters['status'])
            
            # Group by based on parameter
            group_by = filters.get('group_by', 'day')
            
            if group_by == 'day':
                analytics = queryset.extra(
                    select={'date': "DATE(created_at)"}
                ).values('date').annotate(
                    total=Count('id'),
                    sent=Count('id', filter=Q(status='sent')),
                    delivered=Count('id', filter=Q(status='delivered')),
                    failed=Count('id', filter=Q(status='failed')),
                    delivery_rate=Avg(
                        Case(
                            When(status='delivered', then=1.0),
                            default=0.0,
                            output_field=models.FloatField()
                        )
                    ) * 100
                ).order_by('date')
            
            elif group_by == 'gateway':
                analytics = queryset.filter(gateway__isnull=False).values(
                    'gateway__name', 'gateway__gateway_type'
                ).annotate(
                    total=Count('id'),
                    sent=Count('id', filter=Q(status='sent')),
                    delivered=Count('id', filter=Q(status='delivered')),
                    delivery_rate=Avg(
                        Case(
                            When(status='delivered', then=1.0),
                            default=0.0,
                            output_field=models.FloatField()
                        )
                    ) * 100
                ).order_by('-total')
            
            elif group_by == 'status':
                analytics = queryset.values('status').annotate(
                    count=Count('id')
                ).order_by('-count')
            
            elif group_by == 'source':
                analytics = queryset.values('source').annotate(
                    total=Count('id'),
                    success_rate=Avg(
                        Case(
                            When(status='delivered', then=1.0),
                            default=0.0,
                            output_field=models.FloatField()
                        )
                    ) * 100
                ).order_by('-total')
            
            else:
                analytics = []
            
            # Get summary statistics
            summary = queryset.aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed')),
                pending=Count('id', filter=Q(status__in=['pending', 'scheduled'])),
                avg_delivery_time=Avg(
                    Case(
                        When(delivered_at__isnull=False, then=F('delivered_at') - F('sent_at')),
                        output_field=models.DurationField()
                    )
                )
            )
            
            # Calculate delivery rate
            total_sent = summary['sent'] + summary['delivered']
            delivery_rate = 0
            if total_sent > 0:
                delivery_rate = (summary['delivered'] / total_sent) * 100
            
            return Response({
                'filters': filters,
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'summary': {
                    'total_messages': summary['total'],
                    'sent': summary['sent'],
                    'delivered': summary['delivered'],
                    'failed': summary['failed'],
                    'pending': summary['pending'],
                    'delivery_rate': round(delivery_rate, 2),
                    'avg_delivery_time': str(summary['avg_delivery_time']) if summary['avg_delivery_time'] else None
                },
                'analytics': list(analytics),
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to get SMS analytics: {str(e)}")
            return Response({
                'error': 'Failed to get analytics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SMSDashboardView(APIView):
    """View for SMS Dashboard"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get SMS dashboard data"""
        try:
            # Today's date
            today = timezone.now().date()
            yesterday = today - timedelta(days=1)
            
            # Get today's messages
            today_messages = SMSMessage.objects.filter(created_at__date=today)
            yesterday_messages = SMSMessage.objects.filter(created_at__date=yesterday)
            
            # Today's statistics
            today_stats = today_messages.aggregate(
                total=Count('id'),
                sent=Count('id', filter=Q(status='sent')),
                delivered=Count('id', filter=Q(status='delivered')),
                failed=Count('id', filter=Q(status='failed'))
            )
            
            # Yesterday's statistics for comparison
            yesterday_stats = yesterday_messages.aggregate(
                total=Count('id')
            )
            
            # Calculate delivery rate
            today_sent = today_stats['sent'] + today_stats['delivered']
            today_delivery_rate = 0
            if today_sent > 0:
                today_delivery_rate = (today_stats['delivered'] / today_sent) * 100
            
            # Gateway status
            active_gateways = SMSGatewayConfig.objects.filter(is_active=True).count()
            low_balance_gateways = SMSGatewayConfig.objects.filter(
                is_active=True, balance__lt=100
            ).count()
            
            # Pending messages
            pending_messages = SMSMessage.objects.filter(
                status__in=['pending', 'scheduled']
            ).count()
            
            # Top templates
            top_templates = SMSTemplate.objects.annotate(
                usage_count=Count('messages')
            ).filter(usage_count__gt=0).order_by('-usage_count')[:5]
            
            # Recent messages
            recent_messages = SMSMessage.objects.select_related(
                'gateway', 'template', 'client'
            ).order_by('-created_at')[:10]
            
            # Prepare response
            dashboard_data = {
                'total_messages': today_stats['total'],
                'sent_today': today_stats['sent'],
                'delivery_rate': round(today_delivery_rate, 2),
                'active_gateways': active_gateways,
                'low_balance_gateways': low_balance_gateways,
                'pending_messages': pending_messages,
                'comparison': {
                    'today': today_stats['total'],
                    'yesterday': yesterday_stats['total'] or 0,
                    'change': today_stats['total'] - (yesterday_stats['total'] or 0)
                },
                'top_templates': [
                    {
                        'id': template.id,
                        'name': template.name,
                        'type': template.get_template_type_display(),
                        'usage_count': template.usage_count
                    }
                    for template in top_templates
                ],
                'recent_messages': SMSMessageSerializer(recent_messages, many=True).data,
                'alerts': self._get_alerts(),
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(dashboard_data)
            
        except Exception as e:
            logger.error(f"Failed to get SMS dashboard: {str(e)}")
            return Response({
                'error': 'Failed to get dashboard data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_alerts(self):
        """Get system alerts"""
        alerts = []
        
        # Check for gateways with low balance
        low_balance_gateways = SMSGatewayConfig.objects.filter(
            is_active=True, balance__lt=50
        )
        
        for gateway in low_balance_gateways:
            alerts.append({
                'type': 'low_balance',
                'title': f'Low Balance Alert: {gateway.name}',
                'message': f'Balance is KES {gateway.balance:,.2f}',
                'severity': 'high',
                'gateway_id': gateway.id
            })
        
        # Check for many failed messages
        failed_count = SMSMessage.objects.filter(
            status='failed',
            created_at__gte=timezone.now() - timedelta(hours=1)
        ).count()
        
        if failed_count > 10:
            alerts.append({
                'type': 'high_failure_rate',
                'title': 'High SMS Failure Rate',
                'message': f'{failed_count} messages failed in the last hour',
                'severity': 'medium'
            })
        
        return alerts


class ProcessPendingMessagesView(APIView):
    """View to process pending SMS messages"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Process pending messages"""
        try:
            limit = int(request.data.get('limit', 100))
            
            sms_service = SMSService()
            results = sms_service.process_pending_messages(limit)
            
            return Response({
                'success': True,
                'message': 'Pending messages processed',
                'results': results,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to process pending messages: {str(e)}")
            return Response({
                'success': False,
                'message': f'Failed to process: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)