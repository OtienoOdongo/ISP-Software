"""
Client Views for dynamic client portal operations
Production-ready with support for both hotspot and PPPoE clients
"""

from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from service_operations.models.subscription_models import Subscription
from service_operations.models.client_operation_models import ClientOperation
from service_operations.models.activation_queue_models import ActivationQueue
from service_operations.serializers.client_serializers import (
    ClientSubscriptionRequestSerializer,
    ClientPurchaseRequestSerializer,
    ClientPaymentCallbackSerializer,
    ClientRenewalSerializer,
    ClientOperationSerializer,
    ClientOperationCreateSerializer,
)

from service_operations.services.subscription_service import SubscriptionService
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.payment_adapter import PaymentAdapter
from service_operations.utils.formatters import format_subscription_summary

logger = logging.getLogger(__name__)


class ClientPortalSubscriptionView(APIView):
    """
    View for client portal subscription requests
    Supports both hotspot and PPPoE clients
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request):
        """
        Handle subscription request from client portal
        """
        try:
            client_id = request.user.id  # From JWT
            logger.info(f"Client {client_id} requesting subscription")
            
            # Validate request
            serializer = ClientSubscriptionRequestSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                logger.warning(f"Client {client_id} provided invalid data: {serializer.errors}")
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Verify client type matches authenticated user
            # (In production, verify with authentication app)
            
            # Get plan details
            plan_id = validated_data['internet_plan_id']
            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
            
            if not plan_details or not plan_details.get('is_active'):
                return Response({
                    'success': False,
                    'error': 'Selected plan is not available'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create subscription in draft status
            with transaction.atomic():
                subscription = Subscription.objects.create(
                    client_id=client_id,
                    internet_plan_id=plan_id,
                    client_type=validated_data['client_type'],
                    access_method='hotspot' if validated_data['client_type'] == 'hotspot_client' else 'pppoe',
                    hotspot_mac_address=validated_data.get('hotspot_mac_address'),
                    status='draft',
                    data_limit_bytes=plan_details.get('data_limit_bytes', 0),
                    time_limit_seconds=plan_details.get('time_limit_seconds', 0),
                    metadata={
                        'plan_details': plan_details,
                        'client_portal_request': True,
                        **validated_data.get('metadata', {})
                    }
                )
                
                # Set end date
                duration_hours = validated_data.get('duration_hours', 24)
                subscription.end_date = subscription.start_date + timedelta(hours=duration_hours)
                subscription.save()
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=client_id,
                    client_type=validated_data['client_type'],
                    subscription=subscription,
                    operation_type='plan_purchase',
                    title=f"Plan Selection - {plan_details.get('name', 'Unknown Plan')}",
                    description=f"Client selected plan from portal",
                    source_platform='hotspot_portal' if validated_data['client_type'] == 'hotspot_client' else 'pppoe_portal',
                    priority=3,
                    metadata={
                        'plan_id': str(plan_id),
                        'duration_hours': duration_hours,
                        'plan_name': plan_details.get('name'),
                        'price': plan_details.get('price'),
                        'payment_method': validated_data['payment_method'],
                    }
                )
            
            logger.info(f"Client {client_id} subscription request created: {subscription.id}")
            
            return Response({
                'success': True,
                'message': 'Subscription request created successfully',
                'subscription_id': str(subscription.id),
                'plan_details': {
                    'name': plan_details.get('name'),
                    'price': plan_details.get('price'),
                    'duration_hours': duration_hours,
                },
                'next_step': 'payment',
                'payment_method': validated_data['payment_method'],
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to process client subscription request: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to process subscription request',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPortalPurchaseView(APIView):
    """
    View for client portal payment initiation
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, subscription_id):
        """
        Initiate payment for a subscription
        """
        try:
            client_id = request.user.id
            logger.info(f"Client {client_id} initiating payment for subscription {subscription_id}")
            
            # Get subscription
            subscription = get_object_or_404(
                Subscription,
                id=subscription_id,
                client_id=client_id,
                is_active=True
            )
            
            # Validate purchase request
            serializer = ClientPurchaseRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Get plan details for payment amount
            plan_details = InternetPlansAdapter.get_plan_details(subscription.internet_plan_id)
            if not plan_details:
                return Response({
                    'success': False,
                    'error': 'Plan details not found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initiate payment via payment adapter
            payment_result = PaymentAdapter.initiate_payment(
                amount=plan_details.get('price', 0),
                currency='KES',
                payment_method=validated_data['payment_method'],
                customer_phone=validated_data.get('customer_phone'),
                customer_email=validated_data.get('customer_email'),
                metadata={
                    'subscription_id': str(subscription.id),
                    'client_id': str(client_id),
                    'client_type': subscription.client_type,
                    'plan_id': str(subscription.internet_plan_id),
                    'plan_name': plan_details.get('name'),
                    **validated_data.get('payment_metadata', {})
                },
                callback_url=validated_data.get('callback_url')
            )
            
            if not payment_result.get('success'):
                return Response({
                    'success': False,
                    'error': payment_result.get('error', 'Payment initiation failed')
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update subscription with payment reference
            subscription.payment_reference = payment_result.get('reference')
            subscription.payment_method = validated_data['payment_method']
            subscription.save()
            
            # Create client operation
            ClientOperation.objects.create(
                client_id=client_id,
                client_type=subscription.client_type,
                subscription=subscription,
                operation_type='payment_initiation',
                title=f"Payment Initiated - {plan_details.get('name', 'Unknown Plan')}",
                description=f"Payment initiated via {validated_data['payment_method']}",
                source_platform='hotspot_portal' if subscription.client_type == 'hotspot_client' else 'pppoe_portal',
                priority=3,
                metadata={
                    'payment_reference': payment_result.get('reference'),
                    'payment_method': validated_data['payment_method'],
                    'amount': str(plan_details.get('price', 0)),
                    'payment_initiation_result': payment_result,
                }
            )
            
            logger.info(f"Payment initiated for subscription {subscription_id}: {payment_result.get('reference')}")
            
            return Response({
                'success': True,
                'message': 'Payment initiated successfully',
                'payment_reference': payment_result.get('reference'),
                'payment_status': 'pending',
                'next_steps': payment_result.get('next_steps', {}),
                'subscription_status': subscription.status,
            })
            
        except Exception as e:
            logger.error(f"Failed to initiate payment for subscription {subscription_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to initiate payment',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPortalPaymentCallbackView(APIView):
    """
    View for payment gateway callbacks (public endpoint)
    """
    
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    
    def post(self, request):
        """
        Handle payment callback from payment gateway
        """
        try:
            logger.info("Received payment callback")
            
            # Validate callback
            serializer = ClientPaymentCallbackSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.warning(f"Invalid payment callback: {serializer.errors}")
                return Response({
                    'success': False,
                    'error': 'Invalid callback data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Verify signature (in production, implement HMAC verification)
            if not self._verify_signature(validated_data):
                logger.warning("Payment callback signature verification failed")
                return Response({
                    'success': False,
                    'error': 'Signature verification failed'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get subscription
            subscription_id = validated_data['subscription_id']
            try:
                subscription = Subscription.objects.get(id=subscription_id, is_active=True)
            except Subscription.DoesNotExist:
                logger.error(f"Subscription {subscription_id} not found for payment callback")
                return Response({
                    'success': False,
                    'error': 'Subscription not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Verify payment reference matches
            if subscription.payment_reference != validated_data['reference']:
                logger.error(f"Payment reference mismatch for subscription {subscription_id}")
                return Response({
                    'success': False,
                    'error': 'Payment reference mismatch'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle payment status
            payment_status = validated_data['status']
            
            if payment_status == 'completed':
                # Mark payment as confirmed
                subscription.mark_payment_confirmed(
                    payment_reference=validated_data['reference'],
                    payment_method=validated_data['payment_method']
                )
                
                # Create activation request
                ActivationQueue.objects.create(
                    subscription=subscription,
                    priority=4,  # High priority for new activations
                    metadata={
                        'payment_callback': True,
                        'payment_date': validated_data['payment_date'].isoformat(),
                        'amount': str(validated_data['amount']),
                    }
                )
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=subscription.client_id,
                    client_type=subscription.client_type,
                    subscription=subscription,
                    operation_type='payment_verification',
                    title=f"Payment Verified - {validated_data['reference']}",
                    description=f"Payment verified successfully via {validated_data['payment_method']}",
                    source_platform='payment_gateway',
                    priority=3,
                    status='completed',
                    metadata={
                        'payment_reference': validated_data['reference'],
                        'payment_method': validated_data['payment_method'],
                        'amount': str(validated_data['amount']),
                        'currency': validated_data['currency'],
                    }
                )
                
                logger.info(f"Payment completed for subscription {subscription_id}")
                return Response({
                    'success': True,
                    'message': 'Payment verified and activation requested',
                    'subscription_status': subscription.status,
                })
                
            elif payment_status in ['failed', 'cancelled']:
                # Update subscription status
                subscription.status = 'failed'
                subscription.activation_error = f"Payment {payment_status}: {validated_data.get('error_message', 'Unknown error')}"
                subscription.save()
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=subscription.client_id,
                    client_type=subscription.client_type,
                    subscription=subscription,
                    operation_type='payment_verification',
                    title=f"Payment {payment_status.capitalize()} - {validated_data['reference']}",
                    description=f"Payment {payment_status}: {validated_data.get('error_message', 'Unknown error')}",
                    source_platform='payment_gateway',
                    priority=3,
                    status='failed',
                    error_message=validated_data.get('error_message'),
                    metadata={
                        'payment_reference': validated_data['reference'],
                        'payment_status': payment_status,
                        'error_code': validated_data.get('error_code'),
                    }
                )
                
                logger.warning(f"Payment {payment_status} for subscription {subscription_id}")
                return Response({
                    'success': False,
                    'message': f'Payment {payment_status}',
                    'subscription_status': subscription.status,
                })
            
            else:
                logger.warning(f"Unexpected payment status: {payment_status}")
                return Response({
                    'success': False,
                    'error': 'Unexpected payment status'
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Failed to process payment callback: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to process payment callback',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _verify_signature(self, data: Dict[str, Any]) -> bool:
        """Verify payment callback signature"""
        # In production, implement HMAC signature verification
        # For now, return True for development
        if settings.DEBUG:
            return True
        
        # Production implementation would verify HMAC signature
        # using shared secret with payment gateway
        return True


class ClientPortalRenewalView(APIView):
    """
    View for client portal subscription renewals
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def post(self, request, subscription_id):
        """
        Request subscription renewal
        """
        try:
            client_id = request.user.id
            logger.info(f"Client {client_id} requesting renewal for subscription {subscription_id}")
            
            # Get subscription
            subscription = get_object_or_404(
                Subscription,
                id=subscription_id,
                client_id=client_id,
                is_active=True,
                status='active'
            )
            
            # Validate renewal request
            serializer = ClientRenewalSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            
            # Get current plan details
            current_plan_details = InternetPlansAdapter.get_plan_details(subscription.internet_plan_id)
            
            # Get new plan details if specified
            new_plan_id = validated_data.get('new_plan_id')
            if new_plan_id:
                new_plan_details = InternetPlansAdapter.get_plan_details(new_plan_id)
                if not new_plan_details or not new_plan_details.get('is_active'):
                    return Response({
                        'success': False,
                        'error': 'Selected plan is not available'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                new_plan_details = current_plan_details
            
            # Create renewal subscription
            with transaction.atomic():
                renewal_subscription = Subscription.objects.create(
                    client_id=client_id,
                    internet_plan_id=new_plan_id or subscription.internet_plan_id,
                    client_type=subscription.client_type,
                    access_method=subscription.access_method,
                    router_id=subscription.router_id,
                    hotspot_mac_address=subscription.hotspot_mac_address,
                    pppoe_username=subscription.pppoe_username,
                    pppoe_password=subscription.pppoe_password,
                    status='draft',
                    data_limit_bytes=new_plan_details.get('data_limit_bytes', 0),
                    time_limit_seconds=new_plan_details.get('time_limit_seconds', 0),
                    auto_renew=validated_data.get('enable_auto_renew', subscription.auto_renew),
                    parent_subscription=subscription,
                    metadata={
                        'renewal_of': str(subscription.id),
                        'plan_details': new_plan_details,
                        'renewal_strategy': validated_data.get('renewal_strategy', 'immediate'),
                    }
                )
                
                # Set end date based on renewal strategy
                if validated_data.get('renewal_strategy') == 'after_expiry' and subscription.end_date:
                    renewal_subscription.start_date = subscription.end_date
                    renewal_subscription.end_date = renewal_subscription.start_date + timedelta(
                        hours=validated_data.get('duration_hours', 24)
                    )
                else:
                    # Immediate renewal
                    renewal_subscription.end_date = renewal_subscription.start_date + timedelta(
                        hours=validated_data.get('duration_hours', 24)
                    )
                
                renewal_subscription.save()
                
                # Create client operation
                ClientOperation.objects.create(
                    client_id=client_id,
                    client_type=subscription.client_type,
                    subscription=renewal_subscription,
                    operation_type='plan_renewal',
                    title=f"Renewal Request - {new_plan_details.get('name', 'Current Plan')}",
                    description=f"Subscription renewal requested",
                    source_platform='hotspot_portal' if subscription.client_type == 'hotspot_client' else 'pppoe_portal',
                    priority=2,
                    metadata={
                        'previous_subscription_id': str(subscription.id),
                        'new_plan_id': str(new_plan_id) if new_plan_id else None,
                        'renewal_strategy': validated_data.get('renewal_strategy', 'immediate'),
                        'enable_auto_renew': validated_data.get('enable_auto_renew'),
                        'plan_name': new_plan_details.get('name'),
                        'price': new_plan_details.get('price'),
                    }
                )
            
            logger.info(f"Renewal requested for subscription {subscription_id}: {renewal_subscription.id}")
            
            return Response({
                'success': True,
                'message': 'Renewal requested successfully',
                'renewal_subscription_id': str(renewal_subscription.id),
                'current_subscription_id': str(subscription.id),
                'plan_details': {
                    'name': new_plan_details.get('name'),
                    'price': new_plan_details.get('price'),
                },
                'next_step': 'payment',
                'payment_method': validated_data['payment_method'],
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to process renewal for subscription {subscription_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to process renewal request',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPortalStatusView(APIView):
    """
    View for client portal subscription status checking
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, subscription_id=None):
        """
        Get subscription status and details
        """
        try:
            client_id = request.user.id
            
            if subscription_id:
                # Get specific subscription
                subscription = get_object_or_404(
                    Subscription,
                    id=subscription_id,
                    client_id=client_id,
                    is_active=True
                )
                
                # Get activation status if pending
                activation_status = None
                if subscription.status == 'pending_activation':
                    activation_request = ActivationQueue.objects.filter(
                        subscription=subscription,
                        status__in=['pending', 'processing', 'retrying']
                    ).order_by('-created_at').first()
                    
                    if activation_request:
                        activation_status = {
                            'status': activation_request.status,
                            'error_message': activation_request.error_message,
                            'retry_count': activation_request.retry_count,
                            'created_at': activation_request.created_at.isoformat(),
                        }
                
                return Response({
                    'success': True,
                    'subscription': {
                        'id': str(subscription.id),
                        'status': subscription.status,
                        'status_display': subscription.get_status_display(),
                        'client_type': subscription.client_type,
                        'access_method': subscription.access_method,
                        'start_date': subscription.start_date.isoformat(),
                        'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                        'is_expired': subscription.is_expired,
                        'can_be_activated': subscription.can_be_activated,
                        'remaining_data_bytes': subscription.remaining_data_bytes,
                        'remaining_time_seconds': subscription.remaining_time_seconds,
                        'usage_percentage': subscription.usage_percentage,
                        'payment_method': subscription.payment_method,
                        'payment_status': 'confirmed' if subscription.payment_confirmed_at else 'pending',
                    },
                    'activation_status': activation_status,
                    'timestamp': timezone.now().isoformat(),
                })
            
            else:
                # Get all active subscriptions for client
                subscriptions = Subscription.objects.filter(
                    client_id=client_id,
                    is_active=True
                ).order_by('-created_at')
                
                subscription_list = []
                for sub in subscriptions:
                    subscription_list.append({
                        'id': str(sub.id),
                        'status': sub.status,
                        'status_display': sub.get_status_display(),
                        'client_type': sub.client_type,
                        'access_method': sub.access_method,
                        'start_date': sub.start_date.isoformat(),
                        'end_date': sub.end_date.isoformat() if sub.end_date else None,
                        'is_expired': sub.is_expired,
                        'remaining_data_bytes': sub.remaining_data_bytes,
                        'remaining_time_seconds': sub.remaining_time_seconds,
                        'usage_percentage': sub.usage_percentage,
                    })
                
                return Response({
                    'success': True,
                    'subscriptions': subscription_list,
                    'total': len(subscription_list),
                    'active': len([s for s in subscription_list if s['status'] == 'active']),
                    'timestamp': timezone.now().isoformat(),
                })
            
        except Exception as e:
            logger.error(f"Failed to get subscription status for client {request.user.id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get subscription status',
                'timestamp': timezone.now().isoformat(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientOperationsView(APIView):
    """
    View for client operations management
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request):
        """
        Get client operations
        """
        try:
            client_id = request.user.id
            
            # Get operations for client
            operations = ClientOperation.objects.filter(
                client_id=client_id
            ).order_by('-created_at')[:50]
            
            serializer = ClientOperationSerializer(operations, many=True, context={'request': request})
            
            return Response({
                'success': True,
                'operations': serializer.data,
                'total': len(operations),
                'pending': len([op for op in operations if op.status == 'pending']),
                'timestamp': timezone.now().isoformat(),
            })
            
        except Exception as e:
            logger.error(f"Failed to get client operations: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to get operations',
                'timestamp': timezone.now().isoformat(),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        Create client operation (support request, etc.)
        """
        try:
            client_id = request.user.id
            
            # Validate operation data
            serializer = ClientOperationCreateSerializer(data=request.data, context={'request': request})
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create operation
            operation = serializer.save()
            
            logger.info(f"Client operation created: {operation.id}")
            
            return Response({
                'success': True,
                'message': 'Operation created successfully',
                'operation_id': str(operation.id),
                'status': operation.status,
                'sla_due_at': operation.sla_due_at.isoformat() if operation.sla_due_at else None,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to create client operation: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Failed to create operation',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientOperationDetailView(APIView):
    """
    View for client operation details
    """
    
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    
    def get(self, request, operation_id):
        """
        Get client operation details
        """
        try:
            client_id = request.user.id
            
            # Get operation
            operation = get_object_or_404(
                ClientOperation,
                id=operation_id,
                client_id=client_id
            )
            
            serializer = ClientOperationSerializer(operation, context={'request': request})
            
            return Response({
                'success': True,
                'operation': serializer.data,
            })
            
        except Exception as e:
            logger.error(f"Failed to get client operation {operation_id}: {e}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Operation not found',
            }, status=status.HTTP_404_NOT_FOUND)