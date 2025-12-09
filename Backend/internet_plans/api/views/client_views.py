# from django.shortcuts import get_object_or_404
# from django.db import transaction
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework import status
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from internet_plans.serializers.client_serializers import ClientPlanSerializer
# from account.models.admin_model import Client
# from network_management.models.router_management_model import Router
# from django.utils import timezone
# from datetime import timedelta
# import logging

# logger = logging.getLogger(__name__)

# class ClientPlanPurchaseView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         try:
#             plan_id = request.data.get('plan_id')
#             phone_number = request.data.get('phone_number')
#             payment_method = request.data.get('payment_method')
#             access_type = request.data.get('access_type', 'hotspot')
#             mac_address = request.data.get('mac_address')
#             router_id = request.data.get('router_id')

#             if not all([plan_id, phone_number, payment_method]):
#                 return Response({
#                     'error': 'Missing required fields: plan_id, phone_number, payment_method'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             plan = get_object_or_404(InternetPlan, pk=plan_id, active=True)
            
#             if access_type not in plan.get_enabled_access_methods():
#                 return Response({
#                     'error': f'Access type "{access_type}" is not enabled for this plan'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get or create client
#             client = self.get_or_create_client(phone_number)
#             if not client:
#                 return Response({
#                     'error': 'Failed to create client account'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create pending subscription (will be activated on payment callback)
#             subscription = self.create_pending_subscription(
#                 plan, client, access_type, mac_address, router_id
#             )
            
#             response_data = {
#                 'success': True,
#                 'message': 'Ready for payment processing',
#                 'subscription_id': subscription.id,
#                 'client_id': client.id,
#                 'plan_details': {
#                     'name': plan.name,
#                     'access_type': access_type,
#                     'price': float(plan.price),
#                     'duration': plan.access_methods.get(access_type, {}).get('usageLimit', {}).get('value', 'N/A'),
#                     'data_limit': plan.access_methods.get(access_type, {}).get('dataLimit', {}).get('value', 'N/A')
#                 },
#                 'next_steps': {
#                     'initiate_payment': f'Call Payment app API to initiate payment for subscription {subscription.id}',
#                     'payment_callback': f'Payment app should call back to activate subscription {subscription.id}'
#                 }
#             }
            
#             return Response(response_data, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Client plan purchase failed: {e}")
#             return Response({
#                 'error': 'Purchase failed',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def get_or_create_client(self, phone_number):
#         """Get or create client account"""
#         from django.contrib.auth import get_user_model
#         User = get_user_model()
        
#         try:
#             # Try to find existing client
#             client = Client.objects.filter(user__phonenumber=phone_number).first()
#             if client:
#                 return client
            
#             # Create new client user
#             username = f"client_{phone_number}"
#             user = User.objects.create_user(
#                 username=username,
#                 phonenumber=phone_number,
#                 user_type='client',
#                 is_active=True
#             )
            
#             # Create client profile
#             client = Client.objects.create(user=user)
#             return client
            
#         except Exception as e:
#             logger.error(f"Client creation failed: {e}")
#             return None
    
#     def create_pending_subscription(self, plan, client, access_type, mac_address, router_id):
#         """Create subscription in pending state (activated on payment callback)"""
        
#         method_config = plan.access_methods.get(access_type, {})
#         usage_limit = method_config.get('usageLimit', {})
#         duration_value = int(usage_limit.get('value', 24))
#         duration_unit = usage_limit.get('unit', 'Hours')
        
#         if duration_unit == 'Hours':
#             end_date = timezone.now() + timedelta(hours=duration_value)
#         elif duration_unit == 'Days':
#             end_date = timezone.now() + timedelta(days=duration_value)
#         else:
#             end_date = timezone.now() + timedelta(hours=24)

#         data_limit = method_config.get('dataLimit', {})
#         remaining_data = 0
#         if data_limit.get('value', '').lower() != 'unlimited':
#             try:
#                 data_value = data_limit['value']
#                 data_unit = data_limit['unit']
#                 multiplier = 1024 ** 3 if data_unit == "GB" else 1024 ** 2
#                 remaining_data = int(float(data_value) * multiplier)
#             except (ValueError, KeyError):
#                 remaining_data = 0

#         remaining_time = duration_value * 3600 if duration_unit == 'Hours' else duration_value * 86400

#         router = None
#         if router_id:
#             try:
#                 router = Router.objects.get(id=router_id, is_active=True, status='connected')
#             except Router.DoesNotExist:
#                 pass

#         if not router:
#             routers = Router.objects.filter(is_active=True, status='connected')
#             if routers.exists():
#                 router = routers.first()

#         subscription = Subscription.objects.create(
#             client=client,
#             internet_plan=plan,
#             access_method=access_type,
#             router=router,
#             mac_address=mac_address,
#             end_date=end_date,
#             status='pending',  # Will be activated on payment callback
#             remaining_data=remaining_data,
#             remaining_time=remaining_time
#         )
        
#         return subscription

# class PaymentCallbackView(APIView):
#     """Handle payment callbacks from payment app to activate subscriptions"""
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         try:
#             callback_data = request.data
#             transaction_reference = callback_data.get('reference')
#             payment_status = callback_data.get('status')
#             subscription_id = callback_data.get('subscription_id')
#             plan_id = callback_data.get('plan_id')
#             client_id = callback_data.get('client_id')
            
#             if not all([transaction_reference, payment_status, subscription_id]):
#                 return Response({'error': 'Missing required callback data'}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Find pending subscription
#             subscription = Subscription.objects.filter(
#                 id=subscription_id,
#                 status='pending'
#             ).first()
            
#             if not subscription:
#                 logger.warning(f"Subscription not found for callback: {subscription_id}")
#                 return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
            
#             if payment_status == 'completed':
#                 # Activate subscription
#                 subscription.status = 'active'
#                 subscription.transaction_reference = transaction_reference
#                 subscription.save()
                
#                 # Request activation on router
#                 activation_result = subscription.request_activation()
                
#                 # Increment plan purchases
#                 subscription.internet_plan.increment_purchases()
                
#                 logger.info(f"Subscription {subscription.id} activated via payment callback")
                
#                 return Response({
#                     'success': True,
#                     'message': 'Subscription activated successfully',
#                     'subscription_id': subscription.id,
#                     'activation_requested': activation_result['success']
#                 })
#             else:
#                 # Payment failed, mark subscription as failed
#                 subscription.status = 'cancelled'
#                 subscription.save()
                
#                 logger.warning(f"Subscription {subscription.id} cancelled due to payment failure")
                
#                 return Response({
#                     'success': False,
#                     'message': 'Subscription cancelled due to payment failure'
#                 })
                
#         except Exception as e:
#             logger.error(f"Payment callback processing failed: {e}")
#             return Response({
#                 'error': 'Callback processing failed',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









"""
Internet Plans - Client Views
API views for client-facing operations
"""

from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
import logging
from datetime import datetime, timedelta

from internet_plans.models.plan_models import InternetPlan
from internet_plans.models.subscription_models import Subscription
from internet_plans.serializers.client_serializers import (
    ClientPlanSerializer,
    ClientPurchaseRequestSerializer,
    PaymentCallbackSerializer
)
from internet_plans.services.integration_service import IntegrationService
from internet_plans.services.activation_service import ActivationService

logger = logging.getLogger(__name__)


class ClientPlanListView(APIView):
    """
    Public API for clients to browse plans
    No authentication required
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def get(self, request):
        """Get list of plans available for clients"""
        try:
            # Cache key
            cache_key = f"client_plans:{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Base queryset - only active plans
            queryset = InternetPlan.objects.filter(active=True)
            
            # Apply filters
            queryset = self._apply_filters(queryset, request)
            
            # Apply sorting
            queryset = self._apply_sorting(queryset, request)
            
            # Serialize
            serializer = ClientPlanSerializer(queryset, many=True)
            
            response_data = {
                'success': True,
                'count': len(serializer.data),
                'plans': serializer.data,
                'filters': {
                    'categories': list(queryset.values_list('category', flat=True).distinct()),
                    'plan_types': list(queryset.values_list('plan_type', flat=True).distinct()),
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 3 minutes
            cache.set(cache_key, response_data, 180)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get client plans: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load plans',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _apply_filters(self, queryset, request):
        """Apply filters to queryset"""
        # Category filter
        if category := request.query_params.get('category'):
            queryset = queryset.filter(category=category)
        
        # Plan type filter
        if plan_type := request.query_params.get('plan_type'):
            queryset = queryset.filter(plan_type=plan_type)
        
        # Access method filter
        if access_method := request.query_params.get('access_method'):
            if access_method == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif access_method == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
        
        # Price range filter
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except (ValueError, TypeError):
                pass
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except (ValueError, TypeError):
                pass
        
        # Free trial filter
        if free_trial := request.query_params.get('free_trial'):
            if free_trial.lower() == 'true':
                queryset = queryset.filter(plan_type='free_trial')
        
        return queryset
    
    def _apply_sorting(self, queryset, request):
        """Apply sorting to queryset"""
        sort_by = request.query_params.get('sort_by', 'name')
        sort_order = request.query_params.get('sort_order', 'asc')
        
        sort_map = {
            'name': 'name',
            'price': 'price',
            'popularity': 'purchases',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc':
            field = f'-{field}'
        
        return queryset.order_by(field)


class ClientPlanDetailView(APIView):
    """
    Public API for clients to view plan details
    No authentication required
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def get(self, request, plan_id):
        """Get plan details for clients"""
        try:
            # Cache key
            cache_key = f"client_plan:{plan_id}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get plan
            plan = get_object_or_404(
                InternetPlan.objects.filter(active=True),
                id=plan_id
            )
            
            # Serialize
            serializer = ClientPlanSerializer(plan)
            
            response_data = {
                'success': True,
                'plan': serializer.data,
                'compatible_access_methods': plan.get_enabled_access_methods(),
                'purchase_steps': [
                    'Select access method',
                    'Provide phone number',
                    'Complete payment',
                    'Activate on router'
                ],
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 5 minutes
            cache.set(cache_key, response_data, 300)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get client plan {plan_id}: {e}")
            return Response({
                'success': False,
                'error': 'Plan not found',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_404_NOT_FOUND)


class ClientPlanPurchaseView(APIView):
    """
    API for clients to purchase plans
    Handles plan purchase requests
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        """Handle plan purchase request"""
        try:
            # Validate request data
            serializer = ClientPurchaseRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Get plan
            plan_id = validated_data['planId']
            plan = get_object_or_404(
                InternetPlan.objects.filter(active=True),
                id=plan_id
            )
            
            # Validate access method
            access_method = validated_data['accessMethod']
            if access_method not in plan.get_enabled_access_methods():
                return Response({
                    'success': False,
                    'error': f'Access method "{access_method}" is not enabled for this plan'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create client using integration service
            phone_number = validated_data['phoneNumber']
            client = IntegrationService.get_or_create_client_by_phone(
                phone_number=phone_number,
                access_method=access_method,
                request=request
            )
            
            if not client:
                return Response({
                    'success': False,
                    'error': 'Failed to get or create client account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if client already has active subscription for this plan
            existing_subs = Subscription.objects.filter(
                client=client,
                internet_plan=plan,
                status='active',
                is_active=True
            ).exists()
            
            if existing_subs:
                return Response({
                    'success': False,
                    'error': 'You already have an active subscription for this plan'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check plan-client compatibility
            if not plan.is_compatible_with_client(client):
                return Response({
                    'success': False,
                    'error': f'Plan "{plan.name}" is not compatible with your connection type'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get router
            router_id = validated_data.get('routerId')
            router = None
            
            if router_id:
                from network_management.models import Router
                try:
                    router = Router.objects.get(id=router_id, is_active=True)
                except Router.DoesNotExist:
                    pass
            
            # Auto-select router if not specified
            if not router:
                from network_management.models import Router
                compatible_routers = Router.objects.filter(
                    is_active=True,
                    status='connected'
                )
                if compatible_routers.exists():
                    router = compatible_routers.first()
            
            # Create pending subscription
            with transaction.atomic():
                subscription = Subscription.create_pending_subscription(
                    client=client,
                    plan=plan,
                    access_method=access_method,
                    router=router,
                    mac_address=validated_data.get('macAddress'),
                    duration_hours=validated_data.get('durationHours', 24)
                )
                
                # Prepare response
                response_data = {
                    'success': True,
                    'message': 'Plan purchase request created successfully',
                    'subscription': {
                        'id': str(subscription.id),
                        'status': subscription.status,
                        'plan_name': plan.name,
                        'access_method': access_method,
                        'price': float(plan.price),
                        'duration_hours': validated_data.get('durationHours', 24),
                        'router': router.name if router else 'Auto-assigned',
                    },
                    'client': {
                        'id': str(client.id),
                        'phone_number': phone_number,
                        'connection_type': getattr(client, 'connection_type', 'hotspot'),
                    },
                    'payment_required': plan.plan_type == 'paid' and plan.price > 0,
                    'next_steps': {
                        'payment': f'Complete payment for subscription {subscription.id}',
                        'activation': f'Subscription will be activated upon payment confirmation',
                    }
                }
                
                # For free trials, auto-activate
                if plan.plan_type == 'free_trial':
                    response_data['next_steps']['note'] = 'Free trial - activation will be processed automatically'
                
                logger.info(f"Plan purchase request created: {subscription.id} for client {client.id}")
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Failed to process plan purchase: {e}")
            return Response({
                'success': False,
                'error': 'Failed to process purchase request',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentCallbackView(APIView):
    """
    Handle payment callbacks from payment gateway
    This endpoint is called by the payment app after payment processing
    """
    
    permission_classes = [AllowAny]  # Payment app will call this
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """Handle payment callback"""
        try:
            # Validate callback data
            serializer = PaymentCallbackSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"Invalid payment callback data: {serializer.errors}")
                return Response({
                    'success': False,
                    'error': 'Invalid callback data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            callback_data = serializer.validated_data
            
            # Get subscription
            subscription_id = callback_data['subscriptionId']
            
            try:
                subscription = Subscription.objects.select_related(
                    'client', 'internet_plan', 'router'
                ).get(
                    id=subscription_id,
                    is_active=True
                )
            except Subscription.DoesNotExist:
                logger.warning(f"Subscription not found: {subscription_id}")
                return Response({
                    'success': False,
                    'error': 'Subscription not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Handle payment status
            payment_status = callback_data['status']
            
            if payment_status == 'completed':
                # Activate subscription
                with transaction.atomic():
                    success = subscription.activate(callback_data['reference'])
                    
                    if not success:
                        return Response({
                            'success': False,
                            'error': 'Failed to activate subscription'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Clear cache
                    cache.delete_pattern(f"subscriptions:*")
                    
                    logger.info(f"Subscription activated via payment callback: {subscription_id}")
                    
                    return Response({
                        'success': True,
                        'message': 'Subscription activated successfully',
                        'subscription_id': str(subscription.id),
                        'status': subscription.status,
                        'activation_requested': subscription.activation_requested,
                    })
                    
            elif payment_status == 'failed':
                # Mark subscription as failed
                subscription.status = 'failed'
                subscription.save()
                
                logger.warning(f"Payment failed for subscription: {subscription_id}")
                
                return Response({
                    'success': False,
                    'message': 'Payment failed',
                    'subscription_id': str(subscription.id),
                    'status': subscription.status,
                })
                
            else:
                # Payment pending
                logger.info(f"Payment pending for subscription: {subscription_id}")
                
                return Response({
                    'success': True,
                    'message': 'Payment pending',
                    'subscription_id': str(subscription.id),
                    'status': subscription.status,
                })
                
        except Exception as e:
            logger.error(f"Failed to process payment callback: {e}")
            return Response({
                'success': False,
                'error': 'Failed to process payment callback',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientSubscriptionListView(APIView):
    """
    API for clients to view their subscriptions
    Requires client authentication
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """Get client's subscriptions"""
        try:
            # Get client
            client = request.user
            
            # Check if user is a client
            if not hasattr(client, 'is_client') or not client.is_client:
                return Response({
                    'success': False,
                    'error': 'Only clients can view subscriptions'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Cache key
            cache_key = f"client_subscriptions:{client.id}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)
            
            # Get subscriptions
            subscriptions = Subscription.objects.filter(
                client=client,
                is_active=True
            ).select_related(
                'internet_plan', 'router'
            ).order_by('-start_date')
            
            # Serialize
            from internet_plans.serializers.subscription_serializers import SubscriptionSerializer
            serializer = SubscriptionSerializer(subscriptions, many=True, context={'request': request})
            
            # Calculate statistics
            active_subs = subscriptions.filter(status='active').count()
            total_subs = subscriptions.count()
            
            response_data = {
                'success': True,
                'client': {
                    'id': str(client.id),
                    'username': client.username,
                    'phone_number': getattr(client, 'phone_number', ''),
                    'connection_type': getattr(client, 'connection_type', 'hotspot'),
                },
                'subscriptions': serializer.data,
                'statistics': {
                    'total': total_subs,
                    'active': active_subs,
                    'pending': subscriptions.filter(status='pending').count(),
                    'expired': subscriptions.filter(status='expired').count(),
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 1 minute
            cache.set(cache_key, response_data, 60)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get client subscriptions: {e}")
            return Response({
                'success': False,
                'error': 'Failed to load subscriptions',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientSubscriptionDetailView(APIView):
    """
    API for clients to view subscription details
    Requires client authentication
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, subscription_id):
        """Get client's subscription details"""
        try:
            # Get client
            client = request.user
            
            # Check if user is a client
            if not hasattr(client, 'is_client') or not client.is_client:
                return Response({
                    'success': False,
                    'error': 'Only clients can view subscriptions'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get subscription
            subscription = get_object_or_404(
                Subscription.objects.select_related('internet_plan', 'router'),
                id=subscription_id,
                client=client,
                is_active=True
            )
            
            # Serialize
            from internet_plans.serializers.subscription_serializers import SubscriptionSerializer
            serializer = SubscriptionSerializer(subscription, context={'request': request})
            
            # Get activation status
            activation_status = ActivationService.check_activation_status(subscription)
            
            response_data = {
                'success': True,
                'subscription': serializer.data,
                'activation_status': activation_status,
                'can_renew': subscription.can_renew(),
                'is_expired': subscription.is_expired(),
                'usage_summary': {
                    'data_used': subscription.data_used,
                    'data_used_display': f"{subscription.data_used / (1024**3):.2f} GB" if subscription.data_used else "0 GB",
                    'time_used': subscription.time_used,
                    'time_used_display': f"{subscription.time_used // 3600}h {(subscription.time_used % 3600) // 60}m",
                    'remaining_data': subscription.get_remaining_data_display(),
                    'remaining_time': subscription.get_remaining_time_display(),
                },
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to get client subscription {subscription_id}: {e}")
            return Response({
                'success': False,
                'error': 'Subscription not found',
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_404_NOT_FOUND)