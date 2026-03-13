



"""
Business Logic Views - Client Management
Production-ready with comprehensive client lifecycle management
Fully integrated with Service Operations
"""
import logging
import io
import csv
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models import Q, Count, Sum, Avg, F
from django.db import transaction
from django.core.cache import cache
from decimal import Decimal
from datetime import timedelta
from django.conf import settings
from django.shortcuts import get_object_or_404

from user_management.models.client_model import (
    ClientProfile, ClientAnalyticsSnapshot,
    CommissionTransaction, ClientInteraction
)
from user_management.serializers.client_serializer import (
    ClientProfileSerializer, CreatePPPoEClientSerializer,
    CreateHotspotClientSerializer, UpdateClientTierSerializer,
    ClientAnalyticsSnapshotSerializer, ClientInteractionSerializer,
    CommissionTransactionSerializer, SendMessageSerializer,
    AssignPlanSerializer, UpdateSubscriptionSerializer,
    DataUsageSerializer, ChangePlanSerializer, PlanRenewalSerializer,
    ClientSearchSerializer, DashboardFilterSerializer,
    ExportRequestSerializer
)

# Import Service Operations components only if available
try:
    from service_operations.services.subscription_service import SubscriptionService
    from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
    from service_operations.services.usage_service import UsageService
    SERVICE_OPS_AVAILABLE = True
except ImportError:
    logger = logging.getLogger(__name__)
    logger.warning("Service Operations not available. Some features will be limited.")
    SERVICE_OPS_AVAILABLE = False
    
    # Create dummy classes
    class SubscriptionService:
        @staticmethod
        def get_subscriptions_for_client(*args, **kwargs):
            return {'success': False, 'subscriptions': [], 'error': 'Service not available'}
        
        @staticmethod
        def get_all_active_subscriptions():
            return {'success': False, 'subscriptions': []}
        
        @staticmethod
        def create_subscription(*args, **kwargs):
            return {'success': False, 'error': 'Service not available'}
        
        @staticmethod
        def update_subscription(*args, **kwargs):
            return {'success': False}
        
        @staticmethod
        def cancel_subscription(*args, **kwargs):
            return {'success': False}
        
        @staticmethod
        def extend_subscription(*args, **kwargs):
            return {'success': False}
        
        @staticmethod
        def suspend_subscription(*args, **kwargs):
            return {'success': False}
        
        @staticmethod
        def get_subscription_details(*args, **kwargs):
            return {'success': False}
        
        @staticmethod
        def get_expiring_subscriptions(*args, **kwargs):
            return {'success': False, 'count': 0}
        
        @staticmethod
        def get_exceeded_data_limits():
            return {'success': False, 'count': 0}
        
        @staticmethod
        def get_plan_distribution():
            return {'success': False, 'distribution': []}
        
        @staticmethod
        def activate_subscription(*args, **kwargs):
            return {'success': False}
        
        @staticmethod
        def change_subscription_plan(*args, **kwargs):
            return {'success': False}
    
    class InternetPlansAdapter:
        @staticmethod
        def get_plan_details(plan_id):
            return None
        
        @staticmethod
        def get_plans_by_filters(**kwargs):
            return {'plans': []}
        
        @staticmethod
        def get_all_plans():
            return {'success': False, 'plans': []}
    
    class UsageService:
        @staticmethod
        def get_client_usage_summary(*args, **kwargs):
            return {'success': False, 'summary': {}}
        
        @staticmethod
        def get_client_usage_details(*args, **kwargs):
            return {'success': False, 'daily_usage': []}

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for API responses"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    page_query_param = 'page'


class ClientProfileViewSet(viewsets.ModelViewSet):
    """
    Client Profile Management ViewSet
    Production-ready with comprehensive client lifecycle management
    """
    queryset = ClientProfile.objects.all().select_related('user')
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Filter queryset based on user permissions and query params"""
        queryset = super().get_queryset()
        params = self.request.query_params
        
        # Connection type filter
        connection_type = params.get('connection_type')
        if connection_type:
            queryset = queryset.filter(user__connection_type=connection_type)
        
        # Client type filter
        client_type = params.get('client_type')
        if client_type:
            queryset = queryset.filter(client_type=client_type)
        
        # Status filter
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Tier filter
        tier_filter = params.get('tier')
        if tier_filter:
            queryset = queryset.filter(tier=tier_filter)
        
        # Revenue segment filter
        revenue_segment = params.get('revenue_segment')
        if revenue_segment:
            queryset = queryset.filter(revenue_segment=revenue_segment)
        
        # Usage pattern filter
        usage_pattern = params.get('usage_pattern')
        if usage_pattern:
            queryset = queryset.filter(usage_pattern=usage_pattern)
        
        # Marketer filter
        is_marketer = params.get('is_marketer')
        if is_marketer is not None:
            queryset = queryset.filter(is_marketer=(is_marketer.lower() == 'true'))
        
        # At-risk filter
        at_risk = params.get('at_risk')
        if at_risk is not None:
            if at_risk.lower() == 'true':
                queryset = queryset.filter(churn_risk_score__gte=Decimal('7.0'))
            else:
                queryset = queryset.filter(churn_risk_score__lt=Decimal('7.0'))
        
        # Needs attention filter
        needs_attention = params.get('needs_attention')
        if needs_attention is not None:
            if needs_attention.lower() == 'true':
                queryset = queryset.filter(
                    Q(churn_risk_score__gte=Decimal('7.0')) |
                    Q(days_since_last_payment__gt=7) |
                    Q(flags__contains=['payment_failed'])
                )
        
        # Date range filters
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Search filter
        search_query = params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(user__username__icontains=search_query) |
                Q(user__phone_number__icontains=search_query)
            )
        
        # Revenue range filter
        min_revenue = params.get('min_revenue')
        max_revenue = params.get('max_revenue')
        if min_revenue:
            queryset = queryset.filter(lifetime_value__gte=Decimal(min_revenue))
        if max_revenue:
            queryset = queryset.filter(lifetime_value__lte=Decimal(max_revenue))
        
        # Sort by parameter
        sort_by = params.get('sort_by', '-created_at')
        sort_order = params.get('sort_order', 'desc')
        
        sort_map = {
            'username': 'user__username',
            'phone': 'user__phone_number',
            'revenue': 'lifetime_value',
            'data_usage': 'total_data_used_gb',
            'churn_risk': 'churn_risk_score',
            'engagement': 'engagement_score',
            'last_payment': 'last_payment_date',
            'created': 'created_at',
            'updated': 'updated_at',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)
    
    def _filter_clients_with_plans(self, queryset):
        """Filter clients with active plans via Service Operations"""
        if not SERVICE_OPS_AVAILABLE:
            return queryset.none()
        
        client_ids_with_plans = []
        try:
            subscriptions = SubscriptionService.get_all_active_subscriptions()
            if subscriptions.get('success'):
                for sub in subscriptions.get('subscriptions', []):
                    if sub.get('client_id'):
                        client_ids_with_plans.append(sub['client_id'])
        except Exception as e:
            logger.error(f"Error filtering clients with plans: {e}")
        
        return queryset.filter(client_id__in=client_ids_with_plans)
    
    def _filter_clients_without_plans(self, queryset):
        """Filter clients without active plans via Service Operations"""
        if not SERVICE_OPS_AVAILABLE:
            return queryset.all()
        
        client_ids_with_plans = []
        try:
            subscriptions = SubscriptionService.get_all_active_subscriptions()
            if subscriptions.get('success'):
                for sub in subscriptions.get('subscriptions', []):
                    if sub.get('client_id'):
                        client_ids_with_plans.append(sub['client_id'])
        except Exception as e:
            logger.error(f"Error filtering clients without plans: {e}")
        
        return queryset.exclude(client_id__in=client_ids_with_plans)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get detailed analytics for a client"""
        try:
            client = self.get_object()
            
            # Get analytics snapshots
            snapshots = ClientAnalyticsSnapshot.objects.filter(
                client=client
            ).order_by('-date')[:30]
            
            # Get recent interactions
            recent_interactions = ClientInteraction.objects.filter(
                client=client
            ).order_by('-started_at')[:20]
            
            # Get commission history if marketer
            commission_history = None
            if client.is_marketer:
                commission_history = CommissionTransaction.objects.filter(
                    marketer=client
                ).order_by('-transaction_date')[:10]
            
            # Get Service Operations data if available
            so_data = self._get_service_operations_data(client)
            
            return Response({
                'success': True,
                'client': ClientProfileSerializer(client, context={'request': request}).data,
                'analytics': ClientAnalyticsSnapshotSerializer(snapshots, many=True).data,
                'recent_interactions': ClientInteractionSerializer(recent_interactions, many=True).data,
                'commission_history': CommissionTransactionSerializer(commission_history, many=True).data if commission_history else [],
                'service_operations': so_data,
                'timestamp': timezone.now().isoformat()
            })
            
        except ObjectDoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error getting client analytics: {str(e)}")
            return Response({"error": "Failed to load client analytics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_metrics(self, request, pk=None):
        """Update client metrics manually"""
        try:
            client = self.get_object()
            
            # Update metrics using synchronous method
            client._update_calculated_fields_sync()
            client.refresh_from_db()
            
            return Response({
                'success': True,
                'message': 'Client metrics updated successfully',
                'client': ClientProfileSerializer(client, context={'request': request}).data
            })
            
        except ObjectDoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating client metrics: {str(e)}")
            return Response({"error": "Failed to update client metrics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def assign_plan(self, request, pk=None):
        """Assign an internet plan to client via Service Operations"""
        try:
            client = self.get_object()
            serializer = AssignPlanSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response(
                    {'error': 'Service Operations not available'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            data = serializer.validated_data
            plan_id = data['plan_id']
            auto_renew = data['auto_renew']
            duration_hours = data['duration_hours']
            router_id = data.get('router_id')
            hotspot_mac_address = data.get('hotspot_mac_address')
            
            # Get plan details via Service Operations
            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
            if not plan_details or not plan_details.get('is_active'):
                return Response(
                    {'error': 'Plan not available or inactive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check compatibility
            if not self._is_plan_compatible(client, plan_details):
                return Response({
                    'error': f'Plan "{plan_details.get("name")}" is not compatible with {client.connection_type} connection'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with transaction.atomic():
                # Create new subscription via Service Operations
                result = SubscriptionService.create_subscription(
                    client_id=str(client.client_id),
                    internet_plan_id=plan_id,
                    client_type=client.client_type,
                    access_method='pppoe' if client.is_pppoe_client else 'hotspot',
                    duration_hours=duration_hours,
                    router_id=router_id,
                    hotspot_mac_address=hotspot_mac_address if client.is_hotspot_client else None,
                    auto_renew=auto_renew,
                    metadata={
                        'assigned_by': request.user.username,
                        'plan_name': plan_details.get('name')
                    },
                    created_by=request.user.username
                )
                
                if not result['success']:
                    return Response(
                        {'error': result.get('error', 'Failed to create subscription')},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                subscription_id = result['subscription_id']
                action_type = 'plan_assigned'
                
                # Update client's last interaction
                client.last_usage_date = timezone.now()
                client.save()
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client,
                    interaction_type='plan_purchase',
                    action=f'Plan {action_type.replace("_", " ").title()} by Admin',
                    description=f'Plan "{plan_details.get("name")}" {action_type.replace("_", " ")} by {request.user.username}',
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={
                        'subscription_id': subscription_id,
                        'plan_id': plan_id,
                        'plan_name': plan_details.get('name'),
                        'assigned_by': request.user.username,
                        'auto_renew': auto_renew,
                        'duration_hours': duration_hours,
                        'action_type': action_type
                    }
                )
            
            return Response({
                'success': True,
                'message': f'Plan "{plan_details.get("name")}" assigned successfully',
                'subscription_id': subscription_id,
                'plan_details': plan_details,
                'action_type': action_type,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error assigning plan: {str(e)}")
            return Response({
                'error': 'Failed to assign plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def change_plan(self, request, pk=None):
        """Change client's current plan"""
        try:
            client = self.get_object()
            serializer = ChangePlanSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response(
                    {'error': 'Service Operations not available'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            data = serializer.validated_data
            new_plan_id = data['plan_id']
            subscription_id = data['subscription_id']
            immediate = data['immediate']
            prorate = data['prorate']
            notes = data.get('notes', '')
            
            # Get new plan details
            new_plan_details = InternetPlansAdapter.get_plan_details(new_plan_id)
            if not new_plan_details or not new_plan_details.get('is_active'):
                return Response({'error': 'New plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check compatibility
            if not self._is_plan_compatible(client, new_plan_details):
                return Response({
                    'error': f'Plan "{new_plan_details.get("name")}" is not compatible with {client.connection_type} connection'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get current subscription details
            subscription_details = SubscriptionService.get_subscription_details(subscription_id)
            if not subscription_details.get('success'):
                return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
            
            current_subscription = subscription_details.get('subscription', {})
            
            # Update subscription via Service Operations
            update_result = SubscriptionService.update_subscription(
                subscription_id=subscription_id,
                internet_plan_id=new_plan_id,
                immediate_change=immediate,
                prorate=prorate,
                change_notes=notes
            )
            
            if not update_result['success']:
                return Response({
                    'error': update_result.get('error', 'Failed to update subscription')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='plan_change',
                action='Plan Changed' + (' (Immediate)' if immediate else ' (Scheduled)'),
                description=f'Changed from "{current_subscription.get("plan_name")}" to "{new_plan_details.get("name")}": {notes}',
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'old_plan': current_subscription.get('plan_name'),
                    'new_plan': new_plan_details.get('name'),
                    'immediate': immediate,
                    'prorate': prorate,
                    'notes': notes,
                    'changed_by': request.user.username,
                    'subscription_id': subscription_id
                }
            )
            
            return Response({
                'success': True,
                'message': f'Plan changed from "{current_subscription.get("plan_name")}" to "{new_plan_details.get("name")}"',
                'details': {
                    'old_plan': current_subscription.get('plan_name'),
                    'new_plan': new_plan_details.get('name'),
                    'change_type': 'immediate' if immediate else 'scheduled',
                    'effective_date': timezone.now().isoformat() if immediate else update_result.get('effective_date')
                }
            })
            
        except Exception as e:
            logger.error(f"Error changing plan: {str(e)}")
            return Response({
                'error': 'Failed to change plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def renew_plan(self, request, pk=None):
        """Renew client's current plan"""
        try:
            client = self.get_object()
            serializer = PlanRenewalSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response(
                    {'error': 'Service Operations not available'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            data = serializer.validated_data
            subscription_id = data['subscription_id']
            duration_hours = data['duration_hours']
            auto_renew = data['auto_renew']
            payment_method = data.get('payment_method')
            notes = data.get('notes', '')
            
            # Extend subscription via Service Operations
            extend_result = SubscriptionService.extend_subscription(
                subscription_id=subscription_id,
                duration_hours=duration_hours
            )
            
            if not extend_result['success']:
                return Response({
                    'error': 'Failed to renew plan',
                    'details': extend_result.get('error')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update auto-renew if different
            subscription_details = SubscriptionService.get_subscription_details(subscription_id)
            current_subscription = subscription_details.get('subscription', {})
            
            if current_subscription.get('auto_renew') != auto_renew:
                update_result = SubscriptionService.update_subscription(
                    subscription_id=subscription_id,
                    auto_renew=auto_renew
                )
            
            # Get updated subscription details
            updated_subscription = SubscriptionService.get_subscription_details(subscription_id)
            
            # Update client
            client.plan_updated_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='plan_renewal',
                action='Plan Renewed',
                description=f'Plan renewed for {duration_hours} hours',
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'duration_hours': duration_hours,
                    'auto_renew': auto_renew,
                    'payment_method': payment_method,
                    'notes': notes,
                    'renewed_by': request.user.username,
                    'subscription_id': subscription_id
                }
            )
            
            return Response({
                'success': True,
                'message': f'Plan renewed successfully',
                'details': {
                    'plan_name': updated_subscription.get('subscription', {}).get('plan_name'),
                    'duration_hours': duration_hours,
                    'new_end_date': updated_subscription.get('subscription', {}).get('end_date'),
                    'auto_renew': auto_renew
                }
            })
            
        except Exception as e:
            logger.error(f"Error renewing plan: {str(e)}")
            return Response({
                'error': 'Failed to renew plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_subscription(self, request, pk=None):
        """Update client subscription via Service Operations"""
        try:
            client = self.get_object()
            serializer = UpdateSubscriptionSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response(
                    {'error': 'Service Operations not available'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            data = serializer.validated_data
            subscription_id = data['subscription_id']
            action = data['action']
            plan_id = data.get('plan_id')
            duration_hours = data.get('duration_hours')
            notes = data.get('notes', '')
            
            # Perform action via Service Operations
            result = None
            if action == 'activate':
                result = SubscriptionService.update_subscription(
                    subscription_id=subscription_id,
                    status='active',
                    notes=notes
                )
            elif action == 'suspend':
                result = SubscriptionService.suspend_subscription(
                    subscription_id=subscription_id,
                    notes=notes
                )
            elif action == 'cancel':
                result = SubscriptionService.cancel_subscription(
                    subscription_id=subscription_id,
                    notes=notes
                )
            elif action == 'extend':
                if not duration_hours:
                    return Response({'error': 'Duration required for extension'}, status=status.HTTP_400_BAD_REQUEST)
                result = SubscriptionService.extend_subscription(subscription_id, duration_hours)
            elif action == 'change_plan':
                if not plan_id:
                    return Response({'error': 'Plan ID required for change'}, status=status.HTTP_400_BAD_REQUEST)
                result = SubscriptionService.change_subscription_plan(subscription_id, plan_id, notes)
            
            if not result or not result.get('success'):
                error_msg = result.get('error', 'Failed to update subscription') if result else 'Action failed'
                return Response({'error': error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='profile_update',
                action=f'Subscription {action.title()}',
                description=f"Subscription {action}: {notes}",
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'subscription_id': subscription_id,
                    'action': action,
                    'notes': notes,
                    'updated_by': request.user.username
                }
            )
            
            return Response({
                'success': True,
                'message': f'Subscription {action} successful',
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error updating subscription: {str(e)}")
            return Response({
                'error': 'Failed to update subscription',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def resend_credentials(self, request, pk=None):
        """Resend PPPoE credentials to client"""
        try:
            client = self.get_object()
            
            if not client.is_pppoe_client:
                return Response(
                    {"error": "Only PPPoE clients can have credentials resent"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get PPPoE credentials from Authentication app
            user = client.user
            
            # Check if user has pppoe_username attribute
            if not hasattr(user, 'pppoe_username'):
                return Response(
                    {"error": "User does not have PPPoE credentials"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            pppoe_username = user.pppoe_username
            
            # Try to get password (this method should exist in authentication app)
            pppoe_password = None
            if hasattr(user, 'get_pppoe_password_decrypted'):
                pppoe_password = user.get_pppoe_password_decrypted()
            elif hasattr(user, 'pppoe_password'):
                pppoe_password = user.pppoe_password
            
            if not pppoe_password:
                return Response(
                    {"error": "PPPoE password not available"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get current subscription for plan info
            plan_name = ""
            if SERVICE_OPS_AVAILABLE:
                subscriptions = SubscriptionService.get_subscriptions_for_client(
                    client_id=str(client.client_id),
                    status_filter='active'
                )
                if subscriptions.get('success') and subscriptions['subscriptions']:
                    plan_name = subscriptions['subscriptions'][0].get('plan_name', '')
            
            # Send SMS via available service
            sms_sent = False
            try:
                # Try to import SMS service
                from user_management.services.sms_services import SMSService
                sms_service = SMSService()
                
                message = (
                    f"Hello {client.username}! Your PPPoE credentials:\n"
                    f"Username: {pppoe_username}\n"
                    f"Password: {pppoe_password}"
                )
                
                if plan_name:
                    message += f"\nCurrent Plan: {plan_name}"
                
                # This assumes SMSService has a send_sms method
                sms_sent = sms_service.send_sms(
                    phone_number=client.phone_number,
                    message=message
                )
                
            except ImportError:
                logger.warning("SMS service not available")
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='sms_sent',
                action='PPPoE Credentials Resent',
                description='PPPoE credentials resent to client',
                outcome='success' if sms_sent else 'partial',
                started_at=timezone.now(),
                metadata={
                    'sms_sent': sms_sent,
                    'plan_name': plan_name
                }
            )
            
            return Response({
                'success': True,
                'message': 'Credentials sent successfully' if sms_sent else 'Credentials prepared (SMS service unavailable)',
                'sms_sent': sms_sent,
                'credentials': {
                    'username': pppoe_username,
                    'password': pppoe_password,
                    'plan': plan_name
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error resending credentials: {str(e)}")
            return Response({"error": f"Failed to resend credentials: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_tier(self, request, pk=None):
        """Update client tier"""
        try:
            client = self.get_object()
            serializer = UpdateClientTierSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            new_tier = data['tier']
            reason = data.get('reason', '')
            send_notification = data.get('send_notification', True)
            
            old_tier = client.tier
            client.tier = new_tier
            client.tier_upgraded_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='profile_update',
                action='Tier Updated',
                description=f"Tier changed from {old_tier} to {new_tier}: {reason}",
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'old_tier': old_tier,
                    'new_tier': new_tier,
                    'updated_by': request.user.username,
                    'reason': reason
                }
            )
            
            # Send notification via SMS if requested and available
            if send_notification and client.phone_number:
                try:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    
                    message = (
                        f"Hello {client.username}! Your account tier has been "
                        f"upgraded from {old_tier} to {new_tier}. "
                        f"Thank you for being a valued customer!"
                    )
                    
                    sms_service.send_sms(
                        phone_number=client.phone_number,
                        message=message
                    )
                    
                except ImportError:
                    logger.warning("SMS service not available for tier notification")
            
            return Response({
                'success': True,
                'message': f'Tier updated from {old_tier} to {new_tier}',
                'old_tier': old_tier,
                'new_tier': new_tier,
                'updated_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error updating tier: {str(e)}")
            return Response({"error": f"Failed to update tier: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def quick_stats(self, request):
        """Get quick stats for dashboard"""
        try:
            total_clients = ClientProfile.objects.count()
            pppoe_clients = ClientProfile.objects.filter(user__connection_type='pppoe').count()
            hotspot_clients = ClientProfile.objects.filter(user__connection_type='hotspot').count()
            active_clients = ClientProfile.objects.filter(status='active').count()
            at_risk_clients = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
            
            # Get clients with active plans via Service Operations
            clients_with_plans = 0
            if SERVICE_OPS_AVAILABLE:
                try:
                    subscriptions = SubscriptionService.get_all_active_subscriptions()
                    if subscriptions.get('success'):
                        client_ids_with_plans = set()
                        for sub in subscriptions.get('subscriptions', []):
                            if sub.get('client_id'):
                                client_ids_with_plans.add(sub['client_id'])
                        clients_with_plans = len(client_ids_with_plans)
                except Exception:
                    pass
            
            # Get today's new clients
            today = timezone.now().date()
            new_today = ClientProfile.objects.filter(created_at__date=today).count()
            
            # Get revenue stats
            revenue_stats = ClientProfile.objects.aggregate(
                total_revenue=Sum('lifetime_value'),
                avg_monthly_revenue=Avg('monthly_recurring_revenue')
            )
            
            return Response({
                'total_clients': total_clients,
                'pppoe_clients': pppoe_clients,
                'hotspot_clients': hotspot_clients,
                'active_clients': active_clients,
                'at_risk_clients': at_risk_clients,
                'clients_with_plans': clients_with_plans,
                'clients_without_plans': total_clients - clients_with_plans,
                'new_today': new_today,
                'revenue': {
                    'total': float(revenue_stats['total_revenue'] or 0),
                    'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0)
                },
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting quick stats: {str(e)}")
            return Response({"error": "Failed to load quick stats"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def search_by_phone(self, request):
        """Search client by phone number"""
        phone = request.query_params.get('phone')
        
        if not phone:
            return Response({"error": "Phone parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use Authentication app's phone validation if available
            normalized = phone
            try:
                from authentication.models import PhoneValidation
                if PhoneValidation.is_valid_kenyan_phone(phone):
                    normalized = PhoneValidation.normalize_kenyan_phone(phone)
            except ImportError:
                pass
            
            # Search in Authentication app
            user = None
            try:
                from authentication.models import UserAccount
                user = UserAccount.objects.filter(phone_number=normalized).first()
            except ImportError:
                pass
            
            if not user:
                return Response({
                    'success': True,
                    'exists': False,
                    'is_valid': True,
                    'phone': normalized,
                    'message': 'Client not found'
                })
            
            # Get business profile
            try:
                client_profile = ClientProfile.objects.get(user=user)
                serializer = ClientProfileSerializer(client_profile, context={'request': request})
                client_data = serializer.data
            except ClientProfile.DoesNotExist:
                client_data = None
            
            return Response({
                'success': True,
                'exists': True,
                'is_valid': True,
                'phone': normalized,
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'phone': user.phone_number,
                    'connection_type': user.connection_type if hasattr(user, 'connection_type') else '',
                    'is_active': user.is_active
                },
                'business_profile': client_data,
                'message': 'Client found'
            })
            
        except Exception as e:
            logger.error(f"Error searching by phone: {str(e)}")
            return Response({"error": "Failed to search client"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get real-time client statistics"""
        try:
            # Calculate real-time stats
            total_clients = ClientProfile.objects.count()
            
            # Active in last 15 minutes
            active_now = ClientProfile.objects.filter(
                last_login_date__gte=timezone.now() - timedelta(minutes=15)
            ).count()
            
            # Revenue today
            today = timezone.now().date()
            revenue_today = ClientAnalyticsSnapshot.objects.filter(
                date=today
            ).aggregate(total=Sum('daily_revenue'))['total'] or Decimal('0.00')
            
            # At-risk clients
            at_risk = ClientProfile.objects.filter(
                churn_risk_score__gte=Decimal('7.0')
            ).count()
            
            # New clients today
            new_today = ClientProfile.objects.filter(
                created_at__date=today
            ).count()
            
            # Average metrics
            avg_churn_risk = ClientProfile.objects.aggregate(
                avg=Avg('churn_risk_score')
            )['avg'] or Decimal('0.00')
            
            avg_engagement = ClientProfile.objects.aggregate(
                avg=Avg('engagement_score')
            )['avg'] or Decimal('0.00')
            
            # Connection distribution
            connection_dist = ClientProfile.objects.values(
                'user__connection_type'
            ).annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Tier distribution
            tier_dist = ClientProfile.objects.values('tier').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Plan distribution via Service Operations
            clients_with_plans = 0
            plan_dist = []
            if SERVICE_OPS_AVAILABLE:
                try:
                    plan_dist_result = SubscriptionService.get_plan_distribution()
                    if plan_dist_result.get('success'):
                        plan_dist = plan_dist_result.get('distribution', [])
                    
                    # Get unique clients with plans
                    subscriptions = SubscriptionService.get_all_active_subscriptions()
                    if subscriptions.get('success'):
                        client_ids_with_plans = set()
                        for sub in subscriptions.get('subscriptions', []):
                            if sub.get('client_id'):
                                client_ids_with_plans.add(sub['client_id'])
                        clients_with_plans = len(client_ids_with_plans)
                except Exception:
                    pass
            
            return Response({
                'success': True,
                'timestamp': timezone.now().isoformat(),
                'stats': {
                    'total_clients': total_clients,
                    'active_now': active_now,
                    'revenue_today': float(revenue_today),
                    'at_risk_clients': at_risk,
                    'new_today': new_today,
                    'clients_with_plans': clients_with_plans,
                    'clients_without_plans': total_clients - clients_with_plans,
                    'avg_churn_risk': float(avg_churn_risk),
                    'avg_engagement': float(avg_engagement)
                },
                'distribution': {
                    'connection': [
                        {
                            'type': item['user__connection_type'] or 'unknown',
                            'count': item['count'],
                            'percentage': round((item['count'] / total_clients * 100), 1) if total_clients > 0 else 0
                        }
                        for item in connection_dist
                    ],
                    'tier': [
                        {
                            'tier': item['tier'],
                            'count': item['count'],
                            'percentage': round((item['count'] / total_clients * 100), 1) if total_clients > 0 else 0
                        }
                        for item in tier_dist
                    ],
                    'plan': plan_dist[:5]  # Top 5 plans
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting client stats: {str(e)}")
            return Response({
                'error': 'Failed to get client statistics',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Get client activity log"""
        try:
            client = self.get_object()
            limit = int(request.query_params.get('limit', 50))
            
            # Get client interactions
            interactions = ClientInteraction.objects.filter(
                client=client
            ).order_by('-started_at')[:limit]
            
            return Response({
                'success': True,
                'client_id': str(client.id),
                'client_name': client.username,
                'activities': ClientInteractionSerializer(interactions, many=True).data,
                'activity_summary': {
                    'total_activities': ClientInteraction.objects.filter(client=client).count(),
                    'last_activity': interactions[0].started_at.isoformat() if interactions else None,
                    'activity_types': ClientInteraction.objects.filter(
                        client=client
                    ).values('interaction_type').annotate(
                        count=Count('id')
                    ).order_by('-count')
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting client activity: {str(e)}")
            return Response({
                'error': 'Failed to get client activity',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send message to client"""
        try:
            client = self.get_object()
            serializer = SendMessageSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            message = data['message']
            channel = data['channel']
            priority = data['priority']
            
            # Log the message sending interaction
            interaction = ClientInteraction.objects.create(
                client=client,
                interaction_type='notification',
                action=f'Send {channel} message',
                description=f"Message sent via {channel}: {message[:100]}...",
                outcome='success',
                started_at=timezone.now(),
                completed_at=timezone.now(),
                metadata={
                    'message': message,
                    'channel': channel,
                    'priority': priority,
                    'sent_by': request.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            logger.info(f"Message logged for client {client.id} via {channel}: {message[:50]}...")
            
            return Response({
                'success': True,
                'message': 'Message logged successfully',
                'message_id': str(interaction.id),
                'channel': channel,
                'timestamp': timezone.now().isoformat(),
                'details': {
                    'client': client.username,
                    'phone': client.phone_number,
                    'message_preview': message[:50] + '...' if len(message) > 50 else message
                }
            })
            
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return Response({
                'error': 'Failed to send message',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export clients data"""
        try:
            format = request.query_params.get('format', 'csv')
            
            # Get filtered clients
            clients = self.get_queryset()
            
            # Apply filters from query params
            filters = request.query_params.dict()
            clients = self._apply_filters(clients, filters)
            
            # Export data
            export_data = self._prepare_export_data(clients, format)
            
            # Return file response
            from django.http import HttpResponse
            response = HttpResponse(export_data, content_type=self._get_content_type(format))
            response['Content-Disposition'] = f'attachment; filename="clients_export_{timezone.now().date()}.{format}"'
            
            return response
            
        except Exception as e:
            logger.error(f"Error exporting clients: {str(e)}")
            return Response({
                'error': 'Failed to export clients',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Helper Methods
    def _is_plan_compatible(self, client, plan_details):
        """Check if plan is compatible with client's connection type"""
        if client.is_pppoe_client:
            return plan_details.get('available_for_pppoe', False)
        elif client.is_hotspot_client:
            return plan_details.get('available_for_hotspot', False)
        return True
    
    def _get_service_operations_data(self, client):
        """Get Service Operations data for client"""
        if not SERVICE_OPS_AVAILABLE:
            return {
                'subscriptions': {'subscriptions': []},
                'usage_summary': {'summary': {}},
                'available': False
            }
        
        try:
            # Get subscription details
            subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id)
            )
            
            # Get usage summary
            usage_summary = UsageService.get_client_usage_summary(
                client_id=str(client.client_id),
                period='current_month'
            )
            
            return {
                'subscriptions': subscriptions if subscriptions.get('success') else {'subscriptions': []},
                'usage_summary': usage_summary if usage_summary.get('success') else {'summary': {}},
                'available': True
            }
        except Exception as e:
            logger.error(f"Error fetching Service Operations data: {str(e)}")
            return {
                'subscriptions': {'subscriptions': []},
                'usage_summary': {'summary': {}},
                'available': False,
                'error': str(e)
            }
    
    def _apply_filters(self, queryset, filters):
        """Apply filters to queryset"""
        # Remove export-specific parameters
        export_params = ['format', 'page', 'page_size']
        for param in export_params:
            filters.pop(param, None)
        
        # Apply filters
        if 'search' in filters:
            queryset = queryset.filter(
                Q(user__username__icontains=filters['search']) |
                Q(user__phone_number__icontains=filters['search'])
            )
        
        if 'connection_type' in filters and filters['connection_type'] != 'all':
            queryset = queryset.filter(user__connection_type=filters['connection_type'])
        
        if 'status' in filters and filters['status'] != 'all':
            queryset = queryset.filter(status=filters['status'])
        
        if 'plan_status' in filters:
            if filters['plan_status'] == 'with_plan':
                queryset = self._filter_clients_with_plans(queryset)
            elif filters['plan_status'] == 'without_plan':
                queryset = self._filter_clients_without_plans(queryset)
        
        return queryset
    
    def _prepare_export_data(self, clients, format):
        """Prepare data for export"""
        # Prepare data rows
        data = []
        headers = [
            'ID', 'Client ID', 'Username', 'Phone', 'Connection Type',
            'Client Type', 'Tier', 'Status', 'Lifetime Value', 
            'Monthly Revenue', 'Churn Risk', 'Engagement Score',
            'Customer Since', 'Last Login', 'Last Payment', 'Days Active',
            'Total Data Used (GB)', 'Avg Monthly Data (GB)'
        ]
        
        for client in clients:
            row = [
                client.id,
                client.client_id,
                client.username,
                client.phone_number,
                client.connection_type,
                client.client_type,
                client.tier,
                client.status,
                float(client.lifetime_value),
                float(client.monthly_recurring_revenue),
                float(client.churn_risk_score),
                float(client.engagement_score),
                client.customer_since.strftime('%Y-%m-%d') if client.customer_since else '',
                client.last_login_date.strftime('%Y-%m-%d %H:%M') if client.last_login_date else '',
                client.last_payment_date.strftime('%Y-%m-%d') if client.last_payment_date else '',
                client.days_active,
                float(client.total_data_used_gb),
                float(client.avg_monthly_data_gb)
            ]
            data.append(row)
        
        # Format based on requested format
        if format == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(headers)
            writer.writerows(data)
            return output.getvalue()
        elif format == 'json':
            import json
            result = []
            for i, row in enumerate(data):
                item = {}
                for j, header in enumerate(headers):
                    item[header] = row[j]
                result.append(item)
            return json.dumps(result, indent=2)
        else:
            # Default to CSV for unsupported formats
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(headers)
            writer.writerows(data)
            return output.getvalue()
    
    def _get_content_type(self, format):
        """Get content type for export format"""
        content_types = {
            'csv': 'text/csv',
            'json': 'application/json',
            'excel': 'application/vnd.ms-excel'
        }
        return content_types.get(format, 'text/plain')


# Add the missing views that are imported in urls.py
class ClientPlanManagementView(APIView):
    """Dedicated view for client plan management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, client_id):
        """Get comprehensive plan information for client"""
        try:
            client = get_object_or_404(ClientProfile, id=client_id)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response({
                    'success': True,
                    'has_active_plan': False,
                    'message': 'Service Operations not available',
                    'available_plans': [],
                    'actions': []
                })
            
            # Get detailed plan information via Service Operations
            subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            if not subscriptions.get('success') or not subscriptions['subscriptions']:
                return Response({
                    'success': True,
                    'has_active_plan': False,
                    'message': 'Client has no active plan',
                    'available_plans': self._get_available_plans(client),
                    'actions': ['assign_plan']
                })
            
            subscription = subscriptions['subscriptions'][0]
            
            # Get plan details
            plan_details = InternetPlansAdapter.get_plan_details(subscription.get('internet_plan_id'))
            
            # Get usage analytics
            usage_data = UsageService.get_client_usage_details(
                client_id=str(client.client_id),
                period='last_30_days',
                detailed=True
            )
            
            # Get payment history
            payments = ClientInteraction.objects.filter(
                client=client,
                interaction_type__in=['payment_success', 'plan_purchase', 'plan_renewal']
            ).order_by('-started_at')[:10]
            
            return Response({
                'success': True,
                'has_active_plan': True,
                'plan': plan_details,
                'subscription': subscription,
                'usage_analytics': usage_data if usage_data.get('success') else {},
                'payment_history': [
                    {
                        'date': payment.started_at.isoformat(),
                        'type': payment.get_interaction_type_display(),
                        'amount': float(payment.payment_amount) if payment.payment_amount else 0,
                        'method': payment.payment_method,
                        'reference': payment.payment_reference
                    }
                    for payment in payments
                ],
                'available_plans': self._get_available_plans(client),
                'actions': ['change_plan', 'renew_plan', 'toggle_auto_renew', 'suspend_plan'],
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting plan management info: {str(e)}")
            return Response({
                'error': 'Failed to get plan information',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_available_plans(self, client):
        """Get available plans for client"""
        if not SERVICE_OPS_AVAILABLE:
            return []
        
        try:
            # Get all active plans
            all_plans = InternetPlansAdapter.get_all_plans()
            if not all_plans.get('success'):
                return []
            
            available_plans = []
            for plan in all_plans.get('plans', []):
                # Check compatibility
                if client.is_pppoe_client and not plan.get('available_for_pppoe', False):
                    continue
                if client.is_hotspot_client and not plan.get('available_for_hotspot', False):
                    continue
                
                available_plans.append({
                    'id': plan.get('id'),
                    'name': plan.get('name'),
                    'description': plan.get('description'),
                    'price': plan.get('price'),
                    'data_limit_gb': plan.get('data_limit_gb'),
                    'duration_days': plan.get('duration_days'),
                    'features': plan.get('features', [])
                })
            
            return available_plans
            
        except Exception as e:
            logger.error(f"Error getting available plans: {str(e)}")
            return []


class ClientPlanHistoryView(APIView):
    """View for client plan history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, client_id):
        """Get complete plan history for client"""
        try:
            client = get_object_or_404(ClientProfile, id=client_id)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response({
                    'success': True,
                    'client_id': str(client.id),
                    'client_name': client.username,
                    'total_subscriptions': 0,
                    'history': []
                })
            
            # Get all subscriptions via Service Operations
            all_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='all'
            )
            
            if not all_subscriptions.get('success'):
                return Response({
                    'success': True,
                    'client_id': str(client.id),
                    'client_name': client.username,
                    'total_subscriptions': 0,
                    'history': []
                })
            
            history = []
            for subscription in all_subscriptions.get('subscriptions', []):
                # Get plan details
                plan_details = InternetPlansAdapter.get_plan_details(subscription.get('internet_plan_id'))
                
                history.append({
                    'plan_name': plan_details.get('name') if plan_details else 'Unknown Plan',
                    'plan_id': subscription.get('internet_plan_id'),
                    'status': subscription.get('status'),
                    'start_date': subscription.get('start_date'),
                    'end_date': subscription.get('end_date'),
                    'data_used': float(subscription.get('data_used_gb', 0)),
                    'data_limit': float(subscription.get('data_limit_gb', 0)),
                    'auto_renew': subscription.get('auto_renew', False),
                    'reason': subscription.get('metadata', {}).get('reason', ''),
                    'assigned_by': subscription.get('metadata', {}).get('assigned_by', '')
                })
            
            return Response({
                'success': True,
                'client_id': str(client.id),
                'client_name': client.username,
                'total_subscriptions': len(history),
                'history': sorted(history, key=lambda x: x.get('start_date', ''), reverse=True)
            })
            
        except Exception as e:
            logger.error(f"Error getting plan history: {str(e)}")
            return Response({
                'error': 'Failed to get plan history',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPlanRecommendationsView(APIView):
    """View for plan recommendations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, client_id):
        """Get personalized plan recommendations for client"""
        try:
            client = get_object_or_404(ClientProfile, id=client_id)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response({
                    'success': True,
                    'client_id': str(client.id),
                    'client_name': client.username,
                    'current_plan': None,
                    'current_utilization': 0,
                    'usage_pattern': client.usage_pattern,
                    'recommendations': []
                })
            
            # Get current subscription
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            # Get available plans
            all_plans = InternetPlansAdapter.get_all_plans()
            if not all_plans.get('success'):
                return Response({
                    'success': True,
                    'client_id': str(client.id),
                    'client_name': client.username,
                    'current_plan': None,
                    'current_utilization': 0,
                    'usage_pattern': client.usage_pattern,
                    'recommendations': []
                })
            
            recommendations = []
            available_plans = all_plans.get('plans', [])
            
            # If no current plan, recommend based on client type and tier
            if not current_subscriptions.get('success') or not current_subscriptions['subscriptions']:
                for plan in available_plans:
                    if client.is_pppoe_client and plan.get('available_for_pppoe'):
                        recommendations.append({
                            'plan_id': plan.get('id'),
                            'plan_name': plan.get('name'),
                            'reason': 'Recommended for PPPoE clients',
                            'match_score': 85,
                            'estimated_monthly_cost': float(plan.get('price', 0)),
                            'features': plan.get('features', [])
                        })
                    elif client.is_hotspot_client and plan.get('available_for_hotspot'):
                        recommendations.append({
                            'plan_id': plan.get('id'),
                            'plan_name': plan.get('name'),
                            'reason': 'Recommended for Hotspot clients',
                            'match_score': 85,
                            'estimated_monthly_cost': float(plan.get('price', 0)),
                            'features': plan.get('features', [])
                        })
            else:
                # If has current plan, recommend based on usage
                current_subscription = current_subscriptions['subscriptions'][0]
                current_plan_id = current_subscription.get('internet_plan_id')
                
                # Get usage data for utilization
                usage_data = UsageService.get_client_usage_summary(
                    client_id=str(client.client_id),
                    period='current_month'
                )
                
                utilization = 0
                if usage_data.get('success'):
                    utilization = usage_data.get('summary', {}).get('utilization_percentage', 0)
                
                for plan in available_plans:
                    # Skip current plan
                    if plan.get('id') == current_plan_id:
                        continue
                    
                    # Check compatibility
                    if client.is_pppoe_client and not plan.get('available_for_pppoe', False):
                        continue
                    if client.is_hotspot_client and not plan.get('available_for_hotspot', False):
                        continue
                    
                    match_score = 0
                    reason = ''
                    
                    # Get current plan price for comparison
                    current_plan_details = InternetPlansAdapter.get_plan_details(current_plan_id)
                    current_plan_price = current_plan_details.get('price', 0) if current_plan_details else 0
                    
                    # Check if plan is better match for usage
                    if utilization >= 80 and plan.get('data_limit_gb', 0) > current_subscription.get('data_limit_gb', 0):
                        match_score = 90
                        reason = 'Higher data limit for heavy usage'
                    elif utilization <= 30 and plan.get('price', 0) < current_plan_price:
                        match_score = 80
                        reason = 'Cost savings for light usage'
                    elif 'unlimited' in str(plan.get('features', [])).lower() and client.usage_pattern in ['heavy', 'extreme']:
                        match_score = 95
                        reason = 'Unlimited data for heavy user'
                    
                    if match_score > 0:
                        recommendations.append({
                            'plan_id': plan.get('id'),
                            'plan_name': plan.get('name'),
                            'reason': reason,
                            'match_score': match_score,
                            'estimated_monthly_cost': float(plan.get('price', 0)),
                            'current_plan_cost': float(current_plan_price),
                            'cost_difference': float(plan.get('price', 0) - current_plan_price),
                            'features': plan.get('features', [])
                        })
            
            # Sort by match score
            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            
            return Response({
                'success': True,
                'client_id': str(client.id),
                'client_name': client.username,
                'current_plan': current_subscriptions['subscriptions'][0].get('plan_name') if current_subscriptions.get('subscriptions') else None,
                'current_utilization': float(utilization),
                'usage_pattern': client.usage_pattern,
                'recommendations': recommendations[:5]  # Top 5 recommendations
            })
            
        except Exception as e:
            logger.error(f"Error getting plan recommendations: {str(e)}")
            return Response({
                'error': 'Failed to get plan recommendations',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPlanBulkActionsView(APIView):
    """View for bulk plan actions"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Perform bulk plan actions"""
        try:
            action = request.data.get('action')
            client_ids = request.data.get('client_ids', [])
            plan_id = request.data.get('plan_id')
            
            if not action:
                return Response({'error': 'Action is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not client_ids:
                return Response({'error': 'Client IDs are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not SERVICE_OPS_AVAILABLE:
                return Response({
                    'error': 'Service Operations not available for bulk actions'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            results = []
            successful = 0
            failed = 0
            
            if action == 'assign_plan':
                if not plan_id:
                    return Response({'error': 'Plan ID is required for assign action'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Get plan details
                plan_details = InternetPlansAdapter.get_plan_details(plan_id)
                if not plan_details or not plan_details.get('is_active'):
                    return Response({'error': 'Plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
                
                for client_id in client_ids:
                    try:
                        client = ClientProfile.objects.get(id=client_id)
                        
                        # Check compatibility
                        if client.is_pppoe_client and not plan_details.get('available_for_pppoe', False):
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'Plan not available for PPPoE'
                            })
                            failed += 1
                            continue
                        
                        if client.is_hotspot_client and not plan_details.get('available_for_hotspot', False):
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'Plan not available for hotspot'
                            })
                            failed += 1
                            continue
                        
                        # Create subscription via Service Operations
                        result = SubscriptionService.create_subscription(
                            client_id=str(client.client_id),
                            internet_plan_id=plan_id,
                            client_type=client.client_type,
                            access_method='pppoe' if client.is_pppoe_client else 'hotspot',
                            duration_hours=720,  # 30 days
                            auto_renew=True,
                            metadata={
                                'bulk_assigned_by': request.user.username,
                                'bulk_action': True
                            },
                            created_by=request.user.username
                        )
                        
                        if not result['success']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': result.get('error', 'Failed to create subscription')
                            })
                            failed += 1
                            continue
                        
                        # Update client
                        client.plan_updated_at = timezone.now()
                        client.save()
                        
                        results.append({
                            'client_id': client_id,
                            'client_name': client.username,
                            'success': True,
                            'subscription_id': result['subscription_id'],
                            'plan_name': plan_details.get('name')
                        })
                        successful += 1
                        
                    except ClientProfile.DoesNotExist:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': 'Client not found'
                        })
                        failed += 1
                    except Exception as e:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': str(e)
                        })
                        failed += 1
            
            elif action == 'renew_plans':
                duration_hours = request.data.get('duration_hours', 720)  # Default 30 days
                
                for client_id in client_ids:
                    try:
                        client = ClientProfile.objects.get(id=client_id)
                        
                        # Get active subscriptions
                        subscriptions = SubscriptionService.get_subscriptions_for_client(
                            client_id=str(client.client_id),
                            status_filter='active'
                        )
                        
                        if not subscriptions.get('success') or not subscriptions['subscriptions']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'No active plan'
                            })
                            failed += 1
                            continue
                        
                        subscription = subscriptions['subscriptions'][0]
                        
                        # Extend subscription
                        extend_result = SubscriptionService.extend_subscription(
                            subscription_id=subscription['id'],
                            duration_hours=duration_hours
                        )
                        
                        if not extend_result['success']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': extend_result.get('error', 'Failed to extend subscription')
                            })
                            failed += 1
                            continue
                        
                        # Update client
                        client.plan_updated_at = timezone.now()
                        client.save()
                        
                        results.append({
                            'client_id': client_id,
                            'client_name': client.username,
                            'success': True,
                            'new_end_date': extend_result.get('new_end_date'),
                            'plan_name': subscription.get('plan_name')
                        })
                        successful += 1
                        
                    except Exception as e:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': str(e)
                        })
                        failed += 1
            
            elif action == 'toggle_auto_renew':
                enable = request.data.get('enable', True)
                
                for client_id in client_ids:
                    try:
                        client = ClientProfile.objects.get(id=client_id)
                        
                        # Get active subscriptions
                        subscriptions = SubscriptionService.get_subscriptions_for_client(
                            client_id=str(client.client_id),
                            status_filter='active'
                        )
                        
                        if not subscriptions.get('success') or not subscriptions['subscriptions']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'No active plan'
                            })
                            failed += 1
                            continue
                        
                        subscription = subscriptions['subscriptions'][0]
                        
                        # Update auto-renew
                        update_result = SubscriptionService.update_subscription(
                            subscription_id=subscription['id'],
                            auto_renew=enable
                        )
                        
                        if not update_result.get('success'):
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': update_result.get('error', 'Failed to update auto-renew')
                            })
                            failed += 1
                            continue
                        
                        # Update client
                        client.plan_auto_renew = enable
                        client.save()
                        
                        results.append({
                            'client_id': client_id,
                            'client_name': client.username,
                            'success': True,
                            'auto_renew': enable,
                            'plan_name': subscription.get('plan_name')
                        })
                        successful += 1
                        
                    except Exception as e:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': str(e)
                        })
                        failed += 1
            
            else:
                return Response({'error': f'Unsupported action: {action}'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'action': action,
                'total_clients': len(client_ids),
                'successful': successful,
                'failed': failed,
                'results': results
            })
            
        except Exception as e:
            logger.error(f"Error performing bulk plan action: {str(e)}")
            return Response({
                'error': 'Failed to perform bulk action',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardView(APIView):
    """Business Dashboard - Integrated with Service Operations Analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get complete dashboard data with plan analytics"""
        try:
            # Get time range
            time_range = request.query_params.get('time_range', '30d')
            
            # Calculate date range
            end_date = timezone.now()
            if time_range == '7d':
                start_date = end_date - timedelta(days=7)
            elif time_range == '30d':
                start_date = end_date - timedelta(days=30)
            elif time_range == '90d':
                start_date = end_date - timedelta(days=90)
            else:  # 'all'
                start_date = None
            
            # Get all data
            data = {
                'summary': self._get_summary_stats(start_date, end_date),
                'financial': self._get_financial_analytics(start_date, end_date),
                'usage': self._get_usage_analytics(start_date, end_date),
                'client_analytics': self._get_client_analytics(start_date, end_date),
                'plan_analytics': self._get_plan_analytics(start_date, end_date),
                'timestamp': timezone.now().isoformat(),
                'time_range': time_range
            }
            
            return Response(data)
            
        except Exception as e:
            logger.error(f"Error loading dashboard: {str(e)}")
            return Response({"error": "Failed to load dashboard data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_summary_stats(self, start_date, end_date):
        """Get summary statistics with plan data"""
        total_clients = ClientProfile.objects.count()
        
        # Active clients (last 30 days)
        active_clients = ClientProfile.objects.filter(
            last_login_date__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # New clients (time range)
        if start_date:
            new_clients = ClientProfile.objects.filter(
                created_at__range=[start_date, end_date]
            ).count()
        else:
            new_clients = total_clients
        
        # Clients with active plans via Service Operations
        clients_with_plans = 0
        if SERVICE_OPS_AVAILABLE:
            try:
                subscriptions = SubscriptionService.get_all_active_subscriptions()
                if subscriptions.get('success'):
                    client_ids_with_plans = set()
                    for sub in subscriptions.get('subscriptions', []):
                        if sub.get('client_id'):
                            client_ids_with_plans.add(sub['client_id'])
                    clients_with_plans = len(client_ids_with_plans)
            except Exception:
                pass
        
        # Revenue stats
        revenue_stats = ClientProfile.objects.aggregate(
            total_revenue=Sum('lifetime_value'),
            avg_monthly_revenue=Avg('monthly_recurring_revenue'),
            total_commission=Sum('commission_balance')
        )
        
        # Churn risk
        at_risk_clients = ClientProfile.objects.filter(
            churn_risk_score__gte=Decimal('7.0')
        ).count()
        
        # Marketers count
        marketers_count = ClientProfile.objects.filter(is_marketer=True).count()
        
        return {
            'total_clients': total_clients,
            'active_clients': active_clients,
            'new_clients': new_clients,
            'at_risk_clients': at_risk_clients,
            'marketers_count': marketers_count,
            'clients_with_plans': clients_with_plans,
            'clients_without_plans': total_clients - clients_with_plans,
            'plan_coverage': round((clients_with_plans / total_clients * 100), 1) if total_clients > 0 else 0,
            'revenue': {
                'total': float(revenue_stats['total_revenue'] or 0),
                'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0),
                'commission_pool': float(revenue_stats['total_commission'] or 0)
            },
            'growth_rate': self._calculate_growth_rate(start_date, end_date)
        }
    
    def _get_plan_analytics(self, start_date, end_date):
        """Get plan analytics via Service Operations"""
        if not SERVICE_OPS_AVAILABLE:
            return {}
        
        try:
            # Active subscriptions
            active_subscriptions = SubscriptionService.get_all_active_subscriptions()
            if active_subscriptions.get('success'):
                active_count = len(active_subscriptions.get('subscriptions', []))
            else:
                active_count = 0
            
            # Expiring soon (next 7 days)
            expiring_subscriptions = SubscriptionService.get_expiring_subscriptions(hours=168)  # 7 days
            if expiring_subscriptions.get('success'):
                expiring_soon = expiring_subscriptions.get('count', 0)
            else:
                expiring_soon = 0
            
            # Exceeded data limits
            exceeded_limits = SubscriptionService.get_exceeded_data_limits()
            if exceeded_limits.get('success'):
                exceeded_count = exceeded_limits.get('count', 0)
            else:
                exceeded_count = 0
            
            # Popular plans
            plan_distribution = SubscriptionService.get_plan_distribution()
            if plan_distribution.get('success'):
                popular_plans = plan_distribution.get('distribution', [])[:5]
            else:
                popular_plans = []
            
            return {
                'active_subscriptions': active_count,
                'expiring_soon': expiring_soon,
                'exceeded_limits': exceeded_count,
                'popular_plans': popular_plans
            }
            
        except Exception as e:
            logger.error(f"Error getting plan analytics: {e}")
            return {}
    
    def _get_financial_analytics(self, start_date, end_date):
        """Get financial analytics"""
        revenue_segments = ClientProfile.objects.values('revenue_segment').annotate(
            count=Count('id'),
            total_revenue=Sum('lifetime_value'),
            avg_revenue=Avg('lifetime_value')
        ).order_by('-total_revenue')
        
        top_clients = ClientProfile.objects.order_by('-lifetime_value')[:10].values(
            'id', 'user__username', 'lifetime_value', 'revenue_segment'
        )
        
        return {
            'revenue_segments': list(revenue_segments),
            'top_clients': list(top_clients),
            'metrics': {
                'avg_client_value': float(ClientProfile.objects.aggregate(avg=Avg('lifetime_value'))['avg'] or Decimal('0.0')),
            }
        }
    
    def _get_usage_analytics(self, start_date, end_date):
        """Get usage analytics"""
        usage_patterns = ClientProfile.objects.values('usage_pattern').annotate(
            count=Count('id'),
            avg_data=Avg('avg_monthly_data_gb')
        ).order_by('-avg_data')
        
        top_users = ClientProfile.objects.order_by('-total_data_used_gb')[:10].values(
            'id', 'user__username', 'total_data_used_gb', 'usage_pattern'
        )
        
        return {
            'usage_patterns': list(usage_patterns),
            'top_users': list(top_users),
            'metrics': {
                'total_data_used': float(ClientProfile.objects.aggregate(total=Sum('total_data_used_gb'))['total'] or Decimal('0.0')),
                'avg_monthly_data': float(ClientProfile.objects.aggregate(avg=Avg('avg_monthly_data_gb'))['avg'] or Decimal('0.0')),
            }
        }
    
    def _get_client_analytics(self, start_date, end_date):
        """Get client behavior analytics"""
        connection_dist = ClientProfile.objects.values('user__connection_type').annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / ClientProfile.objects.count()
        ).order_by('-count')
        
        tier_dist = ClientProfile.objects.values('tier').annotate(
            count=Count('id'),
            avg_revenue=Avg('lifetime_value')
        ).order_by('-avg_revenue')
        
        client_type_dist = ClientProfile.objects.values('client_type').annotate(
            count=Count('id'),
            avg_ltv=Avg('lifetime_value')
        ).order_by('-avg_ltv')
        
        return {
            'connection_distribution': list(connection_dist),
            'tier_distribution': list(tier_dist),
            'client_type_distribution': list(client_type_dist),
            'retention_metrics': self._calculate_retention_metrics(start_date, end_date)
        }
    
    def _calculate_growth_rate(self, start_date, end_date):
        """Calculate overall growth rate"""
        if not start_date:
            return 0
        
        start_count = ClientProfile.objects.filter(created_at__lt=start_date).count()
        end_count = ClientProfile.objects.filter(created_at__lte=end_date).count()
        
        if start_count == 0:
            return 100
        
        growth = ((end_count - start_count) / start_count) * 100
        return round(growth, 1)
    
    def _calculate_retention_metrics(self, start_date, end_date):
        """Calculate retention metrics"""
        # Simplified retention calculation
        total_clients = ClientProfile.objects.count()
        active_clients = ClientProfile.objects.filter(status='active').count()
        
        if total_clients == 0:
            return {
                'retention_rate': 0,
                'avg_client_lifetime': '0 months',
                'churn_rate': 0
            }
        
        retention_rate = (active_clients / total_clients) * 100
        
        return {
            'retention_rate': round(retention_rate, 1),
            'avg_client_lifetime': '14.3 months',  # Placeholder
            'churn_rate': round(100 - retention_rate, 1)
        }


class CommissionDashboardView(APIView):
    """Commission Dashboard for Marketers with Plan Sales"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get commission dashboard data"""
        try:
            marketer_id = request.query_params.get('marketer_id')
            
            if marketer_id:
                # Get specific marketer data
                try:
                    marketer = ClientProfile.objects.get(id=marketer_id, is_marketer=True)
                    marketer_data = self._get_marketer_stats(marketer)
                    return Response(marketer_data)
                except ClientProfile.DoesNotExist:
                    return Response({"error": "Marketer not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Get all marketers summary
                marketers = ClientProfile.objects.filter(is_marketer=True)
                
                total_marketers = marketers.count()
                total_commission = marketers.aggregate(
                    total=Sum('commission_balance'),
                    earned=Sum('total_commission_earned')
                )
                
                top_marketers = marketers.order_by('-total_commission_earned')[:10].values(
                    'id', 'user__username', 'total_commission_earned', 
                    'commission_balance', 'marketer_tier'
                )
                
                pending_commissions = CommissionTransaction.objects.filter(status='pending').count()
                
                # Plan sales statistics
                plan_sales = CommissionTransaction.objects.filter(
                    transaction_type='plan_sale'
                ).aggregate(
                    total=Sum('amount'),
                    count=Count('id')
                )
                
                return Response({
                    'total_marketers': total_marketers,
                    'commission_stats': {
                        'total_balance': float(total_commission['total'] or 0),
                        'total_earned': float(total_commission['earned'] or 0),
                        'pending_approvals': pending_commissions,
                        'plan_sales_total': float(plan_sales['total'] or 0),
                        'plan_sales_count': plan_sales['count'] or 0
                    },
                    'top_marketers': list(top_marketers),
                    'timestamp': timezone.now().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error loading commission dashboard: {str(e)}")
            return Response({"error": "Failed to load commission dashboard"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_marketer_stats(self, marketer):
        """Get detailed stats for a marketer"""
        transactions = CommissionTransaction.objects.filter(marketer=marketer).order_by('-transaction_date')[:20]
        referrals = ClientProfile.objects.filter(referred_by=marketer).count()
        
        recent_referrals = ClientProfile.objects.filter(
            referred_by=marketer
        ).select_related('user').order_by('-created_at')[:10]
        
        # Plan sales statistics
        plan_sales = CommissionTransaction.objects.filter(
            marketer=marketer,
            transaction_type='plan_sale'
        ).aggregate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        return {
            'marketer': {
                'id': marketer.id,
                'username': marketer.username,
                'name': marketer.username,  # Using username as name
                'tier': marketer.marketer_tier,
                'referral_code': marketer.referral_code,
                'commission_rate': float(marketer.commission_rate)
            },
            'stats': {
                'total_earned': float(marketer.total_commission_earned),
                'current_balance': float(marketer.commission_balance),
                'total_referrals': referrals,
                'lifetime_value': float(marketer.lifetime_value),
                'plan_sales_total': float(plan_sales['total'] or 0),
                'plan_sales_count': plan_sales['count'] or 0
            },
            'transactions': CommissionTransactionSerializer(transactions, many=True).data,
            'recent_referrals': [
                {
                    'id': ref.id,
                    'username': ref.username,
                    'phone': ref.phone_number,
                    'created_at': ref.created_at.isoformat(),
                    'connection_type': ref.connection_type
                }
                for ref in recent_referrals
            ]
        }


class CreatePPPoEClientView(APIView):
    """Create PPPoE Client with complete workflow"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create new PPPoE client with complete onboarding"""
        try:
            serializer = CreatePPPoEClientSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            name = data['name']
            phone = data['phone_number']
            referral_code = data.get('referral_code', '')
            client_type = data.get('client_type', 'residential')
            location = data.get('location', '')
            send_sms = data.get('send_sms', True)
            assign_marketer = data.get('assign_marketer', False)
            
            logger.info(f"Creating PPPoE client: {name} ({phone})")
            
            with transaction.atomic():
                # Step 1: Validate phone number
                try:
                    from authentication.models import PhoneValidation
                    normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
                except ImportError:
                    normalized_phone = phone
                
                # Step 2: Check if client already exists
                try:
                    from authentication.models import UserAccount
                    existing_user = UserAccount.objects.filter(phone_number=normalized_phone).first()
                    
                    if existing_user:
                        if hasattr(existing_user, 'connection_type') and existing_user.connection_type == 'pppoe':
                            return Response({
                                "error": "PPPoE client already exists",
                                "client": {
                                    "id": str(existing_user.id),
                                    "username": existing_user.username,
                                    "name": existing_user.name if hasattr(existing_user, 'name') else '',
                                    "phone": existing_user.phone_number
                                }
                            }, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            # Convert existing user to PPPoE
                            existing_user.connection_type = 'pppoe'
                            if hasattr(existing_user, 'name'):
                                existing_user.name = name
                            existing_user.save()
                            user_account = existing_user
                    else:
                        # Create new PPPoE client
                        # This assumes UserAccount has a create method
                        user_account = UserAccount.objects.create(
                            phone_number=normalized_phone,
                            username=f"client_{normalized_phone}",
                            connection_type='pppoe'
                        )
                        if hasattr(user_account, 'name'):
                            user_account.name = name
                            user_account.save()
                        
                except Exception as e:
                    logger.error(f"Error creating user account: {str(e)}")
                    return Response(
                        {"error": "Failed to create user account"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                # Step 3: Generate PPPoE credentials if method exists
                credentials = {'username': '', 'password': ''}
                if hasattr(user_account, 'generate_pppoe_credentials'):
                    credentials = user_account.generate_pppoe_credentials()
                else:
                    # Generate basic credentials
                    import secrets
                    import string
                    credentials['username'] = f"pppoe_{user_account.id}"
                    credentials['password'] = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
                
                # Step 4: Create business profile
                client_profile, created = ClientProfile.objects.get_or_create(
                    user=user_account,
                    defaults={
                        'client_id': uuid.uuid4(),
                        'client_type': client_type,
                        'location': {'address': location} if location else {},
                        'customer_since': timezone.now()
                    }
                )
                
                if not created:
                    client_profile.client_type = client_type
                    if location:
                        client_profile.location = {'address': location}
                    client_profile.save()
                
                # Step 5: Handle referral
                if referral_code:
                    try:
                        referrer = ClientProfile.objects.get(
                            referral_code=referral_code,
                            is_marketer=True
                        )
                        if referrer != client_profile:
                            client_profile.referred_by = referrer
                            client_profile.save()
                            
                            # Create commission transaction
                            CommissionTransaction.objects.create(
                                marketer=referrer,
                                transaction_type='referral',
                                amount=Decimal('500.00'),
                                description=f"Referral commission for {user_account.username}",
                                reference_id=f"REF-{user_account.id}",
                                referred_client=client_profile,
                                commission_rate=referrer.commission_rate,
                                total_commission=Decimal('500.00')
                            )
                    except ClientProfile.DoesNotExist:
                        logger.warning(f"Invalid referral code: {referral_code}")
                
                # Step 6: Send SMS if requested
                sms_sent = False
                if send_sms:
                    try:
                        from user_management.services.sms_services import SMSService
                        sms_service = SMSService()
                        
                        message = f"Hello {name}! Your PPPoE account has been created. Username: {credentials['username']}"
                        
                        sms_sent = sms_service.send_sms(
                            phone_number=normalized_phone,
                            message=message
                        )
                    except ImportError:
                        logger.warning("SMS service not available")
                
                # Step 7: Log interaction
                ClientInteraction.objects.create(
                    client=client_profile,
                    interaction_type='profile_update',
                    action='Admin Created PPPoE Client',
                    description=f"PPPoE client created by {request.user.username}",
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={
                        'created_by': request.user.username,
                        'referral_code': referral_code,
                        'sms_sent': sms_sent,
                        'credentials_generated': bool(credentials['username'])
                    }
                )
                
                # Prepare response
                response_data = {
                    'success': True,
                    'message': 'PPPoE client created successfully',
                    'timestamp': timezone.now().isoformat(),
                    'client': {
                        'id': str(user_account.id),
                        'client_id': str(client_profile.client_id),
                        'username': user_account.username,
                        'name': name,
                        'phone': phone,
                        'normalized_phone': normalized_phone,
                        'business_profile_id': str(client_profile.id),
                        'referral_code': client_profile.referral_code,
                        'connection_type': 'pppoe',
                        'status': 'active'
                    },
                    'credentials': {
                        'pppoe_username': credentials['username'],
                        'pppoe_password': credentials.get('password', ''),
                        'generated_at': credentials.get('timestamp', timezone.now().isoformat())
                    },
                    'actions': {
                        'user_created': True,
                        'credentials_generated': bool(credentials['username']),
                        'business_profile_created': True,
                        'referral_processed': bool(referral_code),
                        'sms_sent': sms_sent,
                        'interaction_logged': True
                    }
                }
                
                logger.info(f"PPPoE client created successfully: {user_account.username}")
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except ValidationError as e:
            logger.error(f"Validation error creating PPPoE client: {str(e)}")
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating PPPoE client: {str(e)}", exc_info=True)
            return Response({"error": f"Failed to create PPPoE client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateHotspotClientView(APIView):
    """Create Hotspot Client"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create new hotspot client"""
        try:
            serializer = CreateHotspotClientSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            phone = data['phone_number']
            client_type = data.get('client_type', 'residential')
            send_welcome_sms = data.get('send_welcome_sms', True)
            
            # Validate phone
            try:
                from authentication.models import PhoneValidation
                normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
            except ImportError:
                normalized_phone = phone
            
            # Check if client exists
            try:
                from authentication.models import UserAccount
                existing_user = UserAccount.objects.filter(phone_number=normalized_phone).first()
                
                if existing_user:
                    return Response({
                        "error": "Client already exists",
                        "client": {
                            "id": str(existing_user.id),
                            "username": existing_user.username,
                            "phone": existing_user.phone_number,
                            "connection_type": existing_user.connection_type if hasattr(existing_user, 'connection_type') else ''
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create hotspot client
                user_account = UserAccount.objects.create(
                    phone_number=normalized_phone,
                    username=f"hotspot_{normalized_phone}",
                    connection_type='hotspot'
                )
                
            except Exception as e:
                logger.error(f"Error creating hotspot user: {str(e)}")
                return Response(
                    {"error": "Failed to create user account"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Create business profile
            client_profile = ClientProfile.objects.create(
                user=user_account,
                client_id=uuid.uuid4(),
                client_type=client_type,
                customer_since=timezone.now()
            )
            
            # Send welcome SMS if requested
            if send_welcome_sms:
                try:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    
                    message = (
                        f"Welcome to our hotspot service! "
                        f"Your account has been created successfully. "
                        f"Username: {user_account.username}"
                    )
                    
                    sms_service.send_sms(
                        phone_number=normalized_phone,
                        message=message
                    )
                    
                except ImportError:
                    logger.warning("SMS service not available")
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client_profile,
                interaction_type='profile_update',
                action='Hotspot Client Created',
                description='Hotspot client created via admin',
                outcome='success',
                started_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'message': 'Hotspot client created successfully',
                'client': {
                    'id': str(user_account.id),
                    'client_id': str(client_profile.client_id),
                    'username': user_account.username,
                    'phone': phone,
                    'normalized_phone': normalized_phone,
                    'business_profile_id': str(client_profile.id),
                    'referral_code': client_profile.referral_code,
                    'connection_type': 'hotspot'
                },
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating hotspot client: {str(e)}")
            return Response({"error": f"Failed to create hotspot client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)







