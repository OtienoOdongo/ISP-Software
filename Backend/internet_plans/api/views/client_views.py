from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from internet_plans.serializers.client_serializers import ClientPlanSerializer
from account.models.admin_model import Client
from network_management.models.router_management_model import Router
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class ClientPlanPurchaseView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            plan_id = request.data.get('plan_id')
            phone_number = request.data.get('phone_number')
            payment_method = request.data.get('payment_method')
            access_type = request.data.get('access_type', 'hotspot')
            mac_address = request.data.get('mac_address')
            router_id = request.data.get('router_id')

            if not all([plan_id, phone_number, payment_method]):
                return Response({
                    'error': 'Missing required fields: plan_id, phone_number, payment_method'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            plan = get_object_or_404(InternetPlan, pk=plan_id, active=True)
            
            if access_type not in plan.get_enabled_access_methods():
                return Response({
                    'error': f'Access type "{access_type}" is not enabled for this plan'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create client
            client = self.get_or_create_client(phone_number)
            if not client:
                return Response({
                    'error': 'Failed to create client account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create pending subscription (will be activated on payment callback)
            subscription = self.create_pending_subscription(
                plan, client, access_type, mac_address, router_id
            )
            
            response_data = {
                'success': True,
                'message': 'Ready for payment processing',
                'subscription_id': subscription.id,
                'client_id': client.id,
                'plan_details': {
                    'name': plan.name,
                    'access_type': access_type,
                    'price': float(plan.price),
                    'duration': plan.access_methods.get(access_type, {}).get('usageLimit', {}).get('value', 'N/A'),
                    'data_limit': plan.access_methods.get(access_type, {}).get('dataLimit', {}).get('value', 'N/A')
                },
                'next_steps': {
                    'initiate_payment': f'Call Payment app API to initiate payment for subscription {subscription.id}',
                    'payment_callback': f'Payment app should call back to activate subscription {subscription.id}'
                }
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Client plan purchase failed: {e}")
            return Response({
                'error': 'Purchase failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_or_create_client(self, phone_number):
        """Get or create client account"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            # Try to find existing client
            client = Client.objects.filter(user__phonenumber=phone_number).first()
            if client:
                return client
            
            # Create new client user
            username = f"client_{phone_number}"
            user = User.objects.create_user(
                username=username,
                phonenumber=phone_number,
                user_type='client',
                is_active=True
            )
            
            # Create client profile
            client = Client.objects.create(user=user)
            return client
            
        except Exception as e:
            logger.error(f"Client creation failed: {e}")
            return None
    
    def create_pending_subscription(self, plan, client, access_type, mac_address, router_id):
        """Create subscription in pending state (activated on payment callback)"""
        
        method_config = plan.access_methods.get(access_type, {})
        usage_limit = method_config.get('usageLimit', {})
        duration_value = int(usage_limit.get('value', 24))
        duration_unit = usage_limit.get('unit', 'Hours')
        
        if duration_unit == 'Hours':
            end_date = timezone.now() + timedelta(hours=duration_value)
        elif duration_unit == 'Days':
            end_date = timezone.now() + timedelta(days=duration_value)
        else:
            end_date = timezone.now() + timedelta(hours=24)

        data_limit = method_config.get('dataLimit', {})
        remaining_data = 0
        if data_limit.get('value', '').lower() != 'unlimited':
            try:
                data_value = data_limit['value']
                data_unit = data_limit['unit']
                multiplier = 1024 ** 3 if data_unit == "GB" else 1024 ** 2
                remaining_data = int(float(data_value) * multiplier)
            except (ValueError, KeyError):
                remaining_data = 0

        remaining_time = duration_value * 3600 if duration_unit == 'Hours' else duration_value * 86400

        router = None
        if router_id:
            try:
                router = Router.objects.get(id=router_id, is_active=True, status='connected')
            except Router.DoesNotExist:
                pass

        if not router:
            routers = Router.objects.filter(is_active=True, status='connected')
            if routers.exists():
                router = routers.first()

        subscription = Subscription.objects.create(
            client=client,
            internet_plan=plan,
            access_method=access_type,
            router=router,
            mac_address=mac_address,
            end_date=end_date,
            status='pending',  # Will be activated on payment callback
            remaining_data=remaining_data,
            remaining_time=remaining_time
        )
        
        return subscription

class PaymentCallbackView(APIView):
    """Handle payment callbacks from payment app to activate subscriptions"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            callback_data = request.data
            transaction_reference = callback_data.get('reference')
            payment_status = callback_data.get('status')
            subscription_id = callback_data.get('subscription_id')
            plan_id = callback_data.get('plan_id')
            client_id = callback_data.get('client_id')
            
            if not all([transaction_reference, payment_status, subscription_id]):
                return Response({'error': 'Missing required callback data'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Find pending subscription
            subscription = Subscription.objects.filter(
                id=subscription_id,
                status='pending'
            ).first()
            
            if not subscription:
                logger.warning(f"Subscription not found for callback: {subscription_id}")
                return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if payment_status == 'completed':
                # Activate subscription
                subscription.status = 'active'
                subscription.transaction_reference = transaction_reference
                subscription.save()
                
                # Request activation on router
                activation_result = subscription.request_activation()
                
                # Increment plan purchases
                subscription.internet_plan.increment_purchases()
                
                logger.info(f"Subscription {subscription.id} activated via payment callback")
                
                return Response({
                    'success': True,
                    'message': 'Subscription activated successfully',
                    'subscription_id': subscription.id,
                    'activation_requested': activation_result['success']
                })
            else:
                # Payment failed, mark subscription as failed
                subscription.status = 'cancelled'
                subscription.save()
                
                logger.warning(f"Subscription {subscription.id} cancelled due to payment failure")
                
                return Response({
                    'success': False,
                    'message': 'Subscription cancelled due to payment failure'
                })
                
        except Exception as e:
            logger.error(f"Payment callback processing failed: {e}")
            return Response({
                'error': 'Callback processing failed',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)