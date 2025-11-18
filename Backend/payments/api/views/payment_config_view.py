




# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework import status
# from django.http import HttpResponseBadRequest, JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from django.utils import timezone
# from django.db.models import Q, Count, Avg, Max, Min, Sum, F, ExpressionWrapper, DurationField
# from django.shortcuts import get_object_or_404
# from datetime import datetime, timedelta
# import requests
# import base64
# import json
# import hmac
# import hashlib
# import os
# import logging
# from payments.models.payment_config_model import (
#     PaymentGateway,
#     MpesaConfig,
#     PayPalConfig,
#     BankConfig,
#     ClientPaymentMethod,
#     Transaction,
#     ConfigurationHistory,
#     WebhookLog,
#     PaymentAnalytics,
#     CallbackDeliveryLog,
# )
# from payments.serializers.payment_config_serializer import (
#     PaymentGatewaySerializer,
#     MpesaConfigSerializer,
#     PayPalConfigSerializer,
#     BankConfigSerializer,
#     ClientPaymentMethodSerializer,
#     TransactionSerializer,
#     TransactionCreateSerializer,
#     LinkSubscriptionSerializer,
#     ConfigurationHistorySerializer,
#     WebhookLogSerializer,
#     PaymentAnalyticsSerializer,
#     CallbackDeliveryLogSerializer,
#     SubscriptionCallbackSerializer,
#     PaymentVerificationSerializer,
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from django.conf import settings
# from django.core.paginator import Paginator
# from django.contrib.auth import get_user_model

# logger = logging.getLogger(__name__)

# class PaymentGatewayView(APIView):
#     """
#     Main view for managing payment gateways configuration
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get all payment gateways with their configurations
#         """
#         try:
#             gateways = PaymentGateway.objects.all().prefetch_related(
#                 'mpesaconfig', 'paypalconfig', 'bankconfig'
#             )
#             serializer = PaymentGatewaySerializer(gateways, many=True)
            
#             return Response({
#                 "gateways": serializer.data,
#                 "configuration": {
#                     "base_url": request.build_absolute_uri('/')[:-1],
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch payment configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch payment configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def post(self, request):
#         """
#         Create a new payment gateway
#         """
#         try:
#             serializer = PaymentGatewaySerializer(data=request.data, context={'request': request})
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             gateway = serializer.save()
#             return Response(
#                 PaymentGatewaySerializer(gateway).data,
#                 status=status.HTTP_201_CREATED
#             )
#         except Exception as e:
#             logger.error(f"Failed to create payment gateway: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create payment gateway", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def put(self, request, gateway_id):
#         """
#         Update payment gateway configuration
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             serializer = PaymentGatewaySerializer(
#                 gateway, 
#                 data=request.data, 
#                 partial=True,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
#             gateway = serializer.save()
#             return Response(PaymentGatewaySerializer(gateway).data)
#         except PaymentGateway.DoesNotExist:
#             return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update payment gateway: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to update payment gateway", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def delete(self, request, gateway_id):
#         """
#         Delete a payment gateway and its configuration
#         """
#         try:
#             active_gateways = PaymentGateway.objects.filter(is_active=True)
#             if active_gateways.count() <= 1 and active_gateways.filter(id=gateway_id).exists():
#                 return Response(
#                     {"error": "Cannot delete the last active payment gateway"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             gateway.delete()

#             ConfigurationHistory.objects.create(
#                 action="delete",
#                 model="PaymentGateway",
#                 object_id=str(gateway_id),
#                 changes=["Deleted payment gateway"],
#                 user=request.user
#             )

#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except PaymentGateway.DoesNotExist:
#             return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to delete payment gateway: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to delete payment gateway", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class AvailablePaymentMethodsView(APIView):
#     """
#     Get available payment methods for clients
#     Clean version for client portal
#     """
#     permission_classes = [AllowAny]

#     def get(self, request):
#         """
#         Get all active payment methods available for clients
#         """
#         try:
#             methods = PaymentGateway.objects.filter(
#                 is_active=True,
#                 health_status='healthy'
#             ).prefetch_related(
#                 'mpesaconfig', 'paypalconfig', 'bankconfig'
#             )
            
#             serializer = PaymentGatewaySerializer(methods, many=True)
            
#             return Response({
#                 "available_methods": serializer.data,
#                 "timestamp": timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch available payment methods: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch available payment methods"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class ClientPaymentMethodsView(APIView):
#     """
#     Handles payment methods for authenticated clients
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get payment methods for authenticated client
#         """
#         try:
#             client = get_object_or_404(Client, user=request.user)
#             methods = ClientPaymentMethod.objects.filter(client=client)
#             serializer = ClientPaymentMethodSerializer(methods, many=True)
            
#             return Response({
#                 "client_id": client.id,
#                 "methods": serializer.data
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch payment methods: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch payment methods"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         Add a payment method for client
#         """
#         try:
#             client = get_object_or_404(Client, user=request.user)
#             gateway_id = request.data.get('gateway_id')
            
#             if not gateway_id:
#                 return Response(
#                     {"error": "gateway_id is required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             gateway = get_object_or_404(PaymentGateway, id=gateway_id, is_active=True)
            
#             # Check if method already exists
#             if ClientPaymentMethod.objects.filter(client=client, gateway=gateway).exists():
#                 return Response(
#                     {"error": "Payment method already exists for this client"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             method = ClientPaymentMethod.objects.create(
#                 client=client,
#                 gateway=gateway,
#                 is_default=request.data.get('is_default', False)
#             )
            
#             serializer = ClientPaymentMethodSerializer(method)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Failed to add payment method: {str(e)}")
#             return Response(
#                 {"error": "Failed to add payment method"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class InitiatePaymentView(APIView):
#     """
#     View for initiating payments through different gateways
#     Returns standardized response format for internetplans
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """
#         Initiate a payment based on the selected gateway
#         Returns standardized response for internetplans integration
#         """
#         try:
#             gateway_id = request.data.get('gateway_id')
#             amount = request.data.get('amount')
#             plan_id = request.data.get('plan_id')
#             idempotency_key = request.data.get('idempotency_key')
            
#             if not all([gateway_id, amount, plan_id]):
#                 return Response(
#                     {"error": "Missing required fields: gateway_id, amount, plan_id"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             client = get_object_or_404(Client, user=request.user)
#             gateway = get_object_or_404(PaymentGateway, id=gateway_id, is_active=True)

#             # Check if client has this payment method
#             if not ClientPaymentMethod.objects.filter(client=client, gateway=gateway).exists():
#                 return Response(
#                     {"error": "Payment method not available for this client"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

#             # Create transaction record
#             transaction_data = {
#                 'client': client.id,
#                 'gateway': gateway.id,
#                 'plan_id': plan_id,
#                 'amount': amount,
#                 'idempotency_key': idempotency_key,
#                 'metadata': {
#                     'user_agent': request.META.get('HTTP_USER_AGENT', ''),
#                     'ip_address': request.META.get('REMOTE_ADDR', ''),
#                     'plan_id': plan_id,
#                     'client_id': str(client.id)
#                 }
#             }

#             serializer = TransactionCreateSerializer(
#                 data=transaction_data,
#                 context={'request': request}
#             )
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             transaction = serializer.save()

#             # Initiate payment based on gateway type
#             if gateway.name in ['mpesa_paybill', 'mpesa_till']:
#                 return self.initiate_mpesa_payment(request, transaction, gateway)
#             elif gateway.name == 'paypal':
#                 return self.initiate_paypal_payment(transaction, gateway)
#             elif gateway.name == 'bank_transfer':
#                 return self.initiate_bank_payment(transaction, gateway)
#             else:
#                 return Response(
#                     {"error": "Unsupported payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#         except Exception as e:
#             logger.error(f"Payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Payment initiation failed", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def initiate_mpesa_payment(self, request, transaction, gateway):
#         """
#         Initiate M-Pesa STK push payment
#         """
#         try:
#             mpesa_config = gateway.mpesaconfig
            
#             # Generate access token
#             token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
#             if not token:
#                 return Response(
#                     {"error": "Failed to authenticate with M-Pesa"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             business_short_code = mpesa_config.short_code
#             passkey = mpesa_config.passkey
            
#             password = base64.b64encode(
#                 (business_short_code + passkey + timestamp).encode()
#             ).decode()
            
#             if mpesa_config.paybill_number:
#                 transaction_type = "CustomerPayBillOnline"
#                 party_b = mpesa_config.paybill_number
#             else:
#                 transaction_type = "CustomerBuyGoodsOnline"
#                 party_b = mpesa_config.till_number

#             payload = {
#                 "BusinessShortCode": business_short_code,
#                 "Password": password,
#                 "Timestamp": timestamp,
#                 "TransactionType": transaction_type,
#                 "Amount": str(transaction.amount),
#                 "PartyA": transaction.client.user.phone_number,
#                 "PartyB": party_b,
#                 "PhoneNumber": transaction.client.user.phone_number,
#                 "CallBackURL": f"{settings.BASE_URL}/api/payments/callback/mpesa/",
#                 "AccountReference": f"CLIENT{transaction.client.id}",
#                 "TransactionDesc": f"Payment for plan {transaction.plan_id}"
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.post(
#                 f"{base_url}/mpesa/stkpush/v1/processrequest",
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('ResponseCode') == '0':
#                 transaction.metadata.update({
#                     'checkout_request_id': response['CheckoutRequestID'],
#                     'mpesa_request': payload,
#                     'mpesa_response': response,
#                 })
#                 transaction.save()
                
#                 # Standardized response for internetplans
#                 return Response({
#                     "success": True,
#                     "payment_reference": transaction.reference,
#                     "next_steps": {
#                         "type": "mpesa_stk_push",
#                         "instructions": "Check your phone to complete M-Pesa payment",
#                         "estimated_completion_time": "2-5 minutes"
#                     },
#                     "transaction_id": str(transaction.id),
#                     "gateway": "mpesa",
#                     "checkout_request_id": response['CheckoutRequestID']
#                 })
#             else:
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'error': response.get('errorMessage', 'Payment request failed'),
#                     'mpesa_response': response
#                 })
#                 transaction.save()
                
#                 return Response({
#                     "success": False,
#                     "error": response.get('errorMessage', 'Payment request failed'),
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"M-Pesa payment initiation failed: {str(e)}", exc_info=True)
#             transaction.status = 'failed'
#             transaction.metadata['error'] = str(e)
#             transaction.save()
#             return Response(
#                 {"success": False, "error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def generate_mpesa_token(self, config, sandbox_mode):
#         """Generate M-Pesa API access token"""
#         try:
#             credentials = f"{config.consumer_key}:{config.consumer_secret}"
#             encoded = base64.b64encode(credentials.encode()).decode()
            
#             base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.get(
#                 f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
#                 headers={"Authorization": f"Basic {encoded}"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return response.json().get('access_token')
#             else:
#                 logger.error(f"M-Pesa token generation failed: {response.text}")
#                 return None
#         except requests.exceptions.RequestException as e:
#             logger.error(f"M-Pesa token request failed: {str(e)}")
#             return None

#     def initiate_paypal_payment(self, transaction, gateway):
#         """Initiate PayPal payment"""
#         try:
#             paypal_config = gateway.paypalconfig
            
#             base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
#             # Get access token
#             auth_response = requests.post(
#                 f"{base_url}/v1/oauth2/token",
#                 auth=(paypal_config.client_id, paypal_config.secret),
#                 headers={"Accept": "application/json", "Accept-Language": "en_US"},
#                 data={"grant_type": "client_credentials"},
#                 timeout=10
#             ).json()
            
#             if 'access_token' not in auth_response:
#                 return Response({
#                     "success": False,
#                     "error": "Failed to authenticate with PayPal",
#                     "details": auth_response
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             token = auth_response['access_token']
            
#             # Create order
#             order_payload = {
#                 "intent": "CAPTURE",
#                 "purchase_units": [{
#                     "amount": {
#                         "currency_code": "USD",
#                         "value": str(transaction.amount)
#                     },
#                     "description": f"Payment for plan {transaction.plan_id}",
#                     "custom_id": f"CLIENT{transaction.client.id}",
#                     "invoice_id": f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}"
#                 }],
#                 "application_context": {
#                     "return_url": paypal_config.callback_url,
#                     "cancel_url": f"{paypal_config.callback_url}?cancel=true",
#                     "brand_name": "Internet Service",
#                     "user_action": "PAY_NOW"
#                 }
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             response = requests.post(
#                 f"{base_url}/v2/checkout/orders",
#                 json=order_payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('status') in ['CREATED', 'APPROVED']:
#                 transaction.metadata.update({
#                     'paypal_order_id': response['id'],
#                     'paypal_response': response
#                 })
#                 transaction.save()
                
#                 approve_url = next(
#                     (link['href'] for link in response['links'] if link['rel'] == 'approve'),
#                     None
#                 )
                
#                 # Standardized response for internetplans
#                 return Response({
#                     "success": True,
#                     "payment_reference": transaction.reference,
#                     "next_steps": {
#                         "type": "paypal_redirect",
#                         "url": approve_url,
#                         "instructions": "Redirect to PayPal to complete payment",
#                         "estimated_completion_time": "1-3 minutes"
#                     },
#                     "transaction_id": str(transaction.id),
#                     "gateway": "paypal",
#                     "approve_url": approve_url
#                 })
#             else:
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'error': "Failed to create PayPal order",
#                     'paypal_response': response
#                 })
#                 transaction.save()
                
#                 return Response({
#                     "success": False,
#                     "error": "Failed to create PayPal order",
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"PayPal payment initiation failed: {str(e)}", exc_info=True)
#             transaction.status = 'failed'
#             transaction.metadata['error'] = str(e)
#             transaction.save()
#             return Response(
#                 {"success": False, "error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def initiate_bank_payment(self, transaction, gateway):
#         """Provide bank details for manual transfer"""
#         try:
#             bank_config = gateway.bankconfig
            
#             transaction.metadata.update({
#                 'bank_details': {
#                     'bank_name': bank_config.bank_name,
#                     'account_name': bank_config.account_name,
#                     'account_number': bank_config.account_number,
#                     'branch_code': bank_config.branch_code,
#                     'swift_code': bank_config.swift_code
#                 },
#                 'instructions': "Make payment to the provided bank account and upload proof of payment"
#             })
#             transaction.save()
            
#             # Standardized response for internetplans
#             return Response({
#                 "success": True,
#                 "payment_reference": transaction.reference,
#                 "next_steps": {
#                     "type": "bank_transfer",
#                     "instructions": "Transfer funds to the provided bank account and upload proof",
#                     "estimated_completion_time": "1-24 hours"
#                 },
#                 "transaction_id": str(transaction.id),
#                 "gateway": "bank",
#                 "bank_details": transaction.metadata['bank_details']
#             })
#         except Exception as e:
#             logger.error(f"Bank payment initiation failed: {str(e)}", exc_info=True)
#             transaction.status = 'failed'
#             transaction.metadata['error'] = str(e)
#             transaction.save()
#             return Response(
#                 {"success": False, "error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class TransactionStatusView(APIView):
#     """
#     View for checking transaction status with enhanced details for internetplans
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request, reference):
#         """
#         Get transaction status by reference number with enhanced details
#         """
#         try:
#             transaction = get_object_or_404(Transaction, reference=reference)
            
#             # Ensure user can only see their own transactions
#             if transaction.client.user != request.user and not request.user.is_staff:
#                 return Response(
#                     {"error": "Access denied"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )
            
#             serializer = TransactionSerializer(transaction)
            
#             # Enhanced response for internetplans
#             response_data = serializer.data
#             response_data.update({
#                 "subscription_ready": transaction.status == 'completed' and not transaction.subscription_id,
#                 "payment_gateway_status": self.get_gateway_status(transaction),
#                 "callback_delivery_status": self.get_callback_status(transaction),
#                 "can_retry_callback": transaction.status == 'completed' and transaction.callback_attempts < 3
#             })
            
#             return Response(response_data)
#         except Transaction.DoesNotExist:
#             return Response(
#                 {"error": "Transaction not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to get transaction status: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to get transaction status", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def get_gateway_status(self, transaction):
#         """Get gateway-specific status details"""
#         if transaction.gateway and transaction.gateway.name.startswith('mpesa'):
#             return {
#                 "type": "mpesa",
#                 "checkout_request_id": transaction.metadata.get('checkout_request_id'),
#                 "receipt_number": transaction.metadata.get('mpesa_receipt')
#             }
#         elif transaction.gateway and transaction.gateway.name == 'paypal':
#             return {
#                 "type": "paypal",
#                 "order_id": transaction.metadata.get('paypal_order_id'),
#                 "capture_id": transaction.metadata.get('paypal_capture_id')
#             }
#         return {"type": "unknown"}

#     def get_callback_status(self, transaction):
#         """Get callback delivery status"""
#         latest_delivery = CallbackDeliveryLog.objects.filter(
#             transaction=transaction
#         ).order_by('-created_at').first()
        
#         if latest_delivery:
#             return {
#                 "status": latest_delivery.status,
#                 "last_attempt": latest_delivery.updated_at,
#                 "attempt_count": latest_delivery.attempt_count,
#                 "error": latest_delivery.error_message
#             }
#         return {"status": "not_attempted", "attempt_count": 0}


# class LinkSubscriptionView(APIView):
#     """
#     API to link transactions with subscriptions
#     """
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, transaction_id):
#         """
#         Link a transaction with a subscription
#         """
#         try:
#             transaction = get_object_or_404(Transaction, id=transaction_id)
            
#             # Verify user owns the transaction or is staff
#             if transaction.client.user != request.user and not request.user.is_staff:
#                 return Response(
#                     {"error": "Access denied"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )
            
#             serializer = LinkSubscriptionSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             subscription_id = serializer.validated_data['subscription_id']
            
#             # Check if subscription is already linked to another transaction
#             existing_link = Transaction.objects.filter(
#                 subscription_id=subscription_id
#             ).exclude(id=transaction_id).first()
            
#             if existing_link:
#                 return Response({
#                     "error": f"Subscription already linked to transaction {existing_link.reference}"
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             transaction.subscription_id = subscription_id
#             transaction.save()
            
#             # Log the linking
#             transaction.metadata['subscription_linked_at'] = timezone.now().isoformat()
#             transaction.metadata['linked_by'] = request.user.username
#             transaction.save()
            
#             return Response({
#                 "success": True,
#                 "message": f"Transaction {transaction.reference} linked to subscription {subscription_id}",
#                 "transaction": TransactionSerializer(transaction).data
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to link subscription: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to link subscription", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )


# class PaymentAnalyticsView(APIView):
#     """
#     Analytics endpoints for internetplans dashboard
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get payment analytics data
#         Supports time_range parameter: 7d, 30d, 90d, 1y
#         """
#         try:
#             time_range = request.query_params.get('time_range', '30d')
#             access_type = request.query_params.get('access_type')
            
#             end_date = timezone.now()
#             if time_range == '7d':
#                 start_date = end_date - timedelta(days=7)
#             elif time_range == '90d':
#                 start_date = end_date - timedelta(days=90)
#             elif time_range == '1y':
#                 start_date = end_date - timedelta(days=365)
#             else:
#                 start_date = end_date - timedelta(days=30)

#             # Calculate revenue data
#             transactions = Transaction.objects.filter(
#                 created_at__gte=start_date,
#                 status='completed'
#             )
            
#             if access_type:
#                 # Filter by gateway type if access_type specified
#                 if access_type == 'hotspot':
#                     transactions = transactions.filter(gateway__name__in=['mpesa_paybill', 'mpesa_till'])
#                 elif access_type == 'pppoe':
#                     transactions = transactions.filter(gateway__name='bank_transfer')
            
#             total_revenue = transactions.aggregate(
#                 total=Sum('amount')
#             )['total'] or 0
            
#             revenue_by_plan = transactions.values('plan_id').annotate(
#                 total_revenue=Sum('amount'),
#                 transaction_count=Count('id')
#             ).order_by('-total_revenue')
            
#             # Calculate success rate
#             total_transactions = Transaction.objects.filter(
#                 created_at__gte=start_date
#             ).count()
            
#             successful_transactions = transactions.count()
#             success_rate = (successful_transactions / total_transactions * 100) if total_transactions > 0 else 0
            
#             return Response({
#                 "time_range": time_range,
#                 "access_type": access_type,
#                 "total_revenue": float(total_revenue),
#                 "success_rate": round(success_rate, 2),
#                 "total_transactions": total_transactions,
#                 "successful_transactions": successful_transactions,
#                 "revenue_by_plan": list(revenue_by_plan),
#                 "date_range": {
#                     "start_date": start_date,
#                     "end_date": end_date
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch payment analytics: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch payment analytics", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class PaymentVerificationView(APIView):
#     """
#     API for manual payment verification
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """
#         Verify a payment manually
#         """
#         try:
#             serializer = PaymentVerificationSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             reference = data.get('reference')
#             phone_number = data.get('phone_number')
#             amount = data.get('amount')
#             gateway = data.get('gateway', 'mpesa')
            
#             # Find transaction
#             if reference:
#                 transaction = get_object_or_404(Transaction, reference=reference)
#             elif phone_number and amount:
#                 # Look for recent transactions matching phone and amount
#                 recent_transactions = Transaction.objects.filter(
#                     client__user__phone_number=phone_number,
#                     amount=amount,
#                     created_at__gte=timezone.now() - timedelta(hours=24)
#                 ).order_by('-created_at')
                
#                 if not recent_transactions.exists():
#                     return Response({
#                         "success": False,
#                         "error": "No recent transactions found for this phone number and amount"
#                     }, status=status.HTTP_404_NOT_FOUND)
                
#                 transaction = recent_transactions.first()
#             else:
#                 return Response({
#                     "success": False,
#                     "error": "Insufficient search criteria"
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Verify transaction
#             if transaction.status == 'completed':
#                 return Response({
#                     "success": True,
#                     "verified": True,
#                     "transaction": TransactionSerializer(transaction).data,
#                     "message": "Payment already verified and completed"
#                 })
            
#             # Mark as verifying
#             transaction.status = 'verifying'
#             transaction.metadata['verification_attempt'] = {
#                 'attempted_by': request.user.username,
#                 'attempted_at': timezone.now().isoformat(),
#                 'verification_method': 'manual'
#             }
#             transaction.save()
            
#             # For M-Pesa, verify using transaction query API
#             if gateway == 'mpesa' and transaction.gateway and transaction.gateway.name.startswith('mpesa'):
#                 verification_result = self.verify_mpesa_payment(transaction)
#             elif gateway == 'paypal' and transaction.gateway and transaction.gateway.name == 'paypal':
#                 verification_result = self.verify_paypal_payment(transaction)
#             else:
#                 verification_result = {"verified": False, "reason": "Manual verification required"}
            
#             if verification_result.get('verified'):
#                 transaction.status = 'completed'
#                 transaction.metadata['manual_verification'] = verification_result
#                 transaction.save()
            
#             return Response({
#                 "success": True,
#                 "verified": verification_result.get('verified', False),
#                 "transaction": TransactionSerializer(transaction).data,
#                 "verification_details": verification_result
#             })
            
#         except Exception as e:
#             logger.error(f"Payment verification failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"success": False, "error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def verify_mpesa_payment(self, transaction):
#         """Verify M-Pesa payment using transaction query API"""
#         try:
#             gateway = transaction.gateway
#             mpesa_config = gateway.mpesaconfig
            
#             token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
#             if not token:
#                 return {"verified": False, "reason": "Failed to authenticate with M-Pesa"}
            
#             checkout_request_id = transaction.metadata.get('checkout_request_id')
#             if not checkout_request_id:
#                 return {"verified": False, "reason": "Missing checkout request ID"}
            
#             payload = {
#                 "BusinessShortCode": mpesa_config.short_code,
#                 "Password": self.generate_mpesa_password(mpesa_config),
#                 "Timestamp": datetime.now().strftime('%Y%m%d%H%M%S'),
#                 "CheckoutRequestID": checkout_request_id
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.post(
#                 f"{base_url}/mpesa/stkpushquery/v1/query",
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('ResultCode') == '0':
#                 return {
#                     "verified": True,
#                     "method": "mpesa_query",
#                     "receipt_number": response.get('MpesaReceiptNumber'),
#                     "verified_at": timezone.now().isoformat(),
#                     "response": response
#                 }
#             else:
#                 return {
#                     "verified": False,
#                     "reason": response.get('ResultDesc', 'Payment verification failed'),
#                     "response": response
#                 }
                
#         except Exception as e:
#             logger.error(f"M-Pesa verification failed: {str(e)}")
#             return {"verified": False, "reason": str(e)}

#     def verify_paypal_payment(self, transaction):
#         """Verify PayPal payment using order details API"""
#         try:
#             gateway = transaction.gateway
#             paypal_config = gateway.paypalconfig
            
#             base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
#             # Get access token
#             auth_response = requests.post(
#                 f"{base_url}/v1/oauth2/token",
#                 auth=(paypal_config.client_id, paypal_config.secret),
#                 headers={"Accept": "application/json", "Accept-Language": "en_US"},
#                 data={"grant_type": "client_credentials"},
#                 timeout=10
#             ).json()
            
#             if 'access_token' not in auth_response:
#                 return {"verified": False, "reason": "Failed to authenticate with PayPal"}
            
#             token = auth_response['access_token']
#             order_id = transaction.metadata.get('paypal_order_id')
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             response = requests.get(
#                 f"{base_url}/v2/checkout/orders/{order_id}",
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('status') == 'COMPLETED':
#                 return {
#                     "verified": True,
#                     "method": "paypal_order_check",
#                     "verified_at": timezone.now().isoformat(),
#                     "response": response
#                 }
#             else:
#                 return {
#                     "verified": False,
#                     "reason": f"Order status: {response.get('status')}",
#                     "response": response
#                 }
                
#         except Exception as e:
#             logger.error(f"PayPal verification failed: {str(e)}")
#             return {"verified": False, "reason": str(e)}

#     def generate_mpesa_token(self, config, sandbox_mode):
#         """Generate M-Pesa API access token"""
#         try:
#             credentials = f"{config.consumer_key}:{config.consumer_secret}"
#             encoded = base64.b64encode(credentials.encode()).decode()
            
#             base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.get(
#                 f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
#                 headers={"Authorization": f"Basic {encoded}"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return response.json().get('access_token')
#             else:
#                 logger.error(f"M-Pesa token generation failed: {response.text}")
#                 return None
#         except requests.exceptions.RequestException as e:
#             logger.error(f"M-Pesa token request failed: {str(e)}")
#             return None

#     def generate_mpesa_password(self, config):
#         """Generate M-Pesa API password"""
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         password = base64.b64encode(
#             (config.short_code + config.passkey + timestamp).encode()
#         ).decode()
#         return password


# @method_decorator(csrf_exempt, name='dispatch')
# class SubscriptionCallbackView(APIView):
#     """
#     Callback endpoint for internetplans to notify about subscription status
#     """
#     permission_classes = [AllowAny]

#     def post(self, request):
#         """
#         Receive subscription activation status from internetplans
#         """
#         try:
#             serializer = SubscriptionCallbackSerializer(data=request.data)
#             if not serializer.is_valid():
#                 logger.error(f"Invalid subscription callback: {serializer.errors}")
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             reference = data['reference']
#             status = data['status']
#             subscription_id = data['subscription_id']
#             plan_id = data['plan_id']
#             client_id = data['client_id']
            
#             # Find transaction
#             try:
#                 transaction = Transaction.objects.get(reference=reference)
#             except Transaction.DoesNotExist:
#                 logger.error(f"Transaction not found for callback: {reference}")
#                 return Response(
#                     {"error": "Transaction not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#             # Update transaction with subscription info
#             transaction.subscription_id = subscription_id
#             transaction.metadata['subscription_callback'] = {
#                 'received_at': timezone.now().isoformat(),
#                 'status': status,
#                 'plan_id': plan_id,
#                 'client_id': client_id,
#                 'activation_result': data.get('activation_result'),
#                 'error_message': data.get('error_message')
#             }
            
#             if status == 'activated':
#                 transaction.metadata['subscription_activated_at'] = timezone.now().isoformat()
#                 logger.info(f"Subscription activated for transaction {reference}")
#             elif status == 'failed':
#                 transaction.metadata['subscription_activation_failed'] = True
#                 logger.error(f"Subscription activation failed for transaction {reference}: {data.get('error_message')}")
            
#             transaction.save()
            
#             return Response({
#                 "success": True,
#                 "message": f"Subscription callback processed for {reference}",
#                 "transaction_reference": reference,
#                 "subscription_id": subscription_id
#             })
            
#         except Exception as e:
#             logger.error(f"Subscription callback processing failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Callback processing failed", "details": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# @method_decorator(csrf_exempt, name='dispatch')
# class MpesaCallbackView(APIView):
#     """
#     M-Pesa payment callback handler
#     """
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         Process M-Pesa STK push callback
#         """
#         try:
#             data = request.data
#             callback = data.get('Body', {}).get('stkCallback', {})
#             result_code = callback.get('ResultCode')
#             checkout_id = callback.get('CheckoutRequestID')
            
#             if not checkout_id:
#                 return JsonResponse(
#                     {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"},
#                     status=400
#                 )

#             try:
#                 transaction = Transaction.objects.get(
#                     metadata__checkout_request_id=checkout_id
#                 )
#             except Transaction.DoesNotExist:
#                 logger.warning(f"Transaction not found for checkout ID: {checkout_id}")
#                 return JsonResponse(
#                     {"ResultCode": 1, "ResultDesc": "Transaction not found"},
#                     status=404
#                 )
            
#             # Log webhook
#             WebhookLog.objects.create(
#                 gateway=transaction.gateway,
#                 event_type='mpesa_callback',
#                 payload=data,
#                 headers=dict(request.headers),
#                 ip_address=request.META.get('REMOTE_ADDR'),
#                 status_code=200,
#                 response="Processing",
#                 signature_valid=True
#             )
            
#             if result_code == '0':
#                 items = callback.get('CallbackMetadata', {}).get('Item', [])
#                 metadata = {item['Name']: item.get('Value') for item in items}
                
#                 transaction.status = 'completed'
#                 transaction.metadata.update({
#                     'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                     'phone_number': metadata.get('PhoneNumber'),
#                     'amount': metadata.get('Amount'),
#                     'transaction_date': metadata.get('TransactionDate'),
#                     'callback_data': data
#                 })
#                 transaction.save()
                
#                 # Deliver callback to internetplans
#                 self.deliver_subscription_callback(transaction)
                
#                 return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
#             else:
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'error': callback.get('ResultDesc', 'Payment failed'),
#                     'callback_data': data
#                 })
#                 transaction.save()
#                 return JsonResponse(
#                     {"ResultCode": result_code, "ResultDesc": callback.get('ResultDesc', 'Payment failed')}
#                 )
#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Invalid JSON payload"},
#                 status=400
#             )
#         except Exception as e:
#             logger.error(f"M-Pesa callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

#     def deliver_subscription_callback(self, transaction):
#         """
#         Deliver payment completion callback to internetplans app
#         """
#         try:
#             callback_url = f"{settings.INTERNETPLANS_BASE_URL}/api/payments/callback/subscription/"
            
#             payload = {
#                 'reference': transaction.reference,
#                 'status': 'completed',
#                 'plan_id': transaction.plan_id,
#                 'client_id': str(transaction.client.id),
#                 'amount': str(transaction.amount),
#                 'payment_method': 'mpesa',
#                 'metadata': {
#                     'mpesa_receipt': transaction.metadata.get('mpesa_receipt'),
#                     'phone_number': transaction.metadata.get('phone_number')
#                 }
#             }
            
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': 'Payment-Service/1.0',
#                 'X-Callback-Signature': self.generate_callback_signature(payload)
#             }
            
#             response = requests.post(
#                 callback_url,
#                 json=payload,
#                 headers=headers,
#                 timeout=10
#             )
            
#             # Log callback delivery attempt
#             CallbackDeliveryLog.objects.create(
#                 transaction=transaction,
#                 payload=payload,
#                 status='delivered' if response.status_code == 200 else 'failed',
#                 response_status=response.status_code,
#                 response_body=response.text[:1000],
#                 attempt_count=1,
#                 error_message=response.text if response.status_code != 200 else '',
#                 delivered_at=timezone.now() if response.status_code == 200 else None
#             )
            
#             transaction.mark_callback_attempt()
            
#             if response.status_code == 200:
#                 logger.info(f"Callback delivered successfully for transaction {transaction.reference}")
#             else:
#                 logger.warning(f"Callback delivery failed for transaction {transaction.reference}: {response.status_code}")
                
#         except Exception as e:
#             logger.error(f"Callback delivery failed: {str(e)}")
#             CallbackDeliveryLog.objects.create(
#                 transaction=transaction,
#                 payload=payload,
#                 status='failed',
#                 attempt_count=1,
#                 error_message=str(e)
#             )
#             transaction.mark_callback_attempt()

#     def generate_callback_signature(self, payload):
#         """Generate signature for callback verification"""
#         secret = getattr(settings, 'CALLBACK_SECRET', 'default-secret')
#         message = json.dumps(payload, sort_keys=True)
#         return hmac.new(
#             secret.encode(),
#             message.encode(),
#             hashlib.sha256
#         ).hexdigest()


# @method_decorator(csrf_exempt, name='dispatch')
# class PayPalCallbackView(APIView):
#     """
#     PayPal payment callback handler
#     """
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         Process PayPal IPN notifications and webhooks
#         """
#         try:
#             data = request.data
#             event_type = data.get('event_type')
#             resource = data.get('resource', {})
            
#             # Handle different PayPal webhook types
#             if event_type == 'PAYMENT.CAPTURE.COMPLETED':
#                 return self.handle_payment_capture(data, resource)
#             elif event_type == 'CHECKOUT.ORDER.APPROVED':
#                 return self.handle_order_approval(data, resource)
#             elif event_type == 'PAYMENT.CAPTURE.DENIED':
#                 return self.handle_payment_denial(data, resource)
#             else:
#                 logger.info(f"Received unhandled PayPal event: {event_type}")
#                 return JsonResponse({"status": "received"})
                
#         except Exception as e:
#             logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

#     def handle_payment_capture(self, data, resource):
#         """Handle completed PayPal payment capture"""
#         capture_id = resource.get('id')
#         order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        
#         if not order_id:
#             logger.error("Missing order ID in PayPal capture")
#             return JsonResponse({"status": "error", "message": "Missing order ID"}, status=400)

#         try:
#             transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#         except Transaction.DoesNotExist:
#             logger.warning(f"Transaction not found for PayPal order: {order_id}")
#             return JsonResponse({"status": "error", "message": "Transaction not found"}, status=404)

#         # Update transaction
#         transaction.status = 'completed'
#         transaction.metadata.update({
#             'paypal_capture_id': capture_id,
#             'payer_email': resource.get('payer', {}).get('email_address'),
#             'amount': resource.get('amount', {}).get('value'),
#             'currency': resource.get('amount', {}).get('currency_code'),
#             'paypal_callback_data': data
#         })
#         transaction.save()

#         # Deliver subscription callback
#         self.deliver_subscription_callback(transaction)
        
#         return JsonResponse({"status": "success"})

#     def handle_order_approval(self, data, resource):
#         """Handle approved PayPal order"""
#         order_id = resource.get('id')
        
#         try:
#             transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#             # Update transaction metadata with approval details
#             transaction.metadata['order_approved_at'] = timezone.now().isoformat()
#             transaction.metadata['paypal_order_approval'] = data
#             transaction.save()
            
#             return JsonResponse({"status": "received"})
#         except Transaction.DoesNotExist:
#             return JsonResponse({"status": "error", "message": "Transaction not found"}, status=404)

#     def handle_payment_denial(self, data, resource):
#         """Handle denied PayPal payment"""
#         order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        
#         if order_id:
#             try:
#                 transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'paypal_denial_reason': resource.get('reason'),
#                     'paypal_callback_data': data
#                 })
#                 transaction.save()
#             except Transaction.DoesNotExist:
#                 pass

#         return JsonResponse({"status": "received"})

#     def deliver_subscription_callback(self, transaction):
#         """Deliver callback to internetplans for PayPal payments"""
#         try:
#             callback_url = f"{settings.INTERNETPLANS_BASE_URL}/api/payments/callback/subscription/"
            
#             payload = {
#                 'reference': transaction.reference,
#                 'status': 'completed',
#                 'plan_id': transaction.plan_id,
#                 'client_id': str(transaction.client.id),
#                 'amount': str(transaction.amount),
#                 'payment_method': 'paypal',
#                 'metadata': {
#                     'paypal_order_id': transaction.metadata.get('paypal_order_id'),
#                     'paypal_capture_id': transaction.metadata.get('paypal_capture_id')
#                 }
#             }
            
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': 'Payment-Service/1.0',
#                 'X-Callback-Signature': self.generate_callback_signature(payload)
#             }
            
#             response = requests.post(
#                 callback_url,
#                 json=payload,
#                 headers=headers,
#                 timeout=10
#             )
            
#             # Log callback delivery
#             CallbackDeliveryLog.objects.create(
#                 transaction=transaction,
#                 payload=payload,
#                 status='delivered' if response.status_code == 200 else 'failed',
#                 response_status=response.status_code,
#                 response_body=response.text[:1000],
#                 attempt_count=1
#             )
            
#             transaction.mark_callback_attempt()
            
#         except Exception as e:
#             logger.error(f"PayPal callback delivery failed: {str(e)}")
#             CallbackDeliveryLog.objects.create(
#                 transaction=transaction,
#                 payload=payload,
#                 status='failed',
#                 attempt_count=1,
#                 error_message=str(e)
#             )

#     def generate_callback_signature(self, payload):
#         """Generate signature for callback verification"""
#         secret = getattr(settings, 'CALLBACK_SECRET', 'default-secret')
#         message = json.dumps(payload, sort_keys=True)
#         return hmac.new(
#             secret.encode(),
#             message.encode(),
#             hashlib.sha256
#         ).hexdigest()


# @method_decorator(csrf_exempt, name='dispatch')
# class BankCallbackView(APIView):
#     """
#     Bank transfer callback handler
#     """
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         Process bank transfer payment confirmations
#         """
#         try:
#             data = request.data
#             reference = data.get('reference')
#             status = data.get('status')
#             proof_url = data.get('proof_url')
#             verified_by = data.get('verified_by', 'admin')
            
#             if not reference:
#                 return JsonResponse(
#                     {"status": "error", "message": "Missing reference"},
#                     status=400
#                 )

#             try:
#                 transaction = Transaction.objects.get(reference=reference)
#             except Transaction.DoesNotExist:
#                 return JsonResponse(
#                     {"status": "error", "message": "Transaction not found"},
#                     status=404
#                 )
            
#             if status == 'verified':
#                 transaction.status = 'completed'
#                 transaction.metadata.update({
#                     'verified_by': verified_by,
#                     'verified_at': timezone.now().isoformat(),
#                     'proof_url': proof_url,
#                     'bank_callback_data': data
#                 })
#                 transaction.save()
                
#                 # Deliver callback to internetplans
#                 self.deliver_subscription_callback(transaction)
                
#                 return JsonResponse({"status": "success", "message": "Payment verified"})
#             elif status == 'rejected':
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'rejected_reason': data.get('reason', 'Payment rejected'),
#                     'rejected_by': verified_by,
#                     'rejected_at': timezone.now().isoformat(),
#                     'bank_callback_data': data
#                 })
#                 transaction.save()
#                 return JsonResponse({"status": "failed", "message": "Payment rejected"})
#             else:
#                 return JsonResponse(
#                     {"status": "error", "message": "Invalid status"},
#                     status=400
#                 )
                
#         except Exception as e:
#             logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

#     def deliver_subscription_callback(self, transaction):
#         """Deliver callback to internetplans for bank transfers"""
#         try:
#             callback_url = f"{settings.INTERNETPLANS_BASE_URL}/api/payments/callback/subscription/"
            
#             payload = {
#                 'reference': transaction.reference,
#                 'status': 'completed',
#                 'plan_id': transaction.plan_id,
#                 'client_id': str(transaction.client.id),
#                 'amount': str(transaction.amount),
#                 'payment_method': 'bank_transfer',
#                 'metadata': {
#                     'verified_by': transaction.metadata.get('verified_by'),
#                     'verified_at': transaction.metadata.get('verified_at'),
#                     'proof_url': transaction.metadata.get('proof_url')
#                 }
#             }
            
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': 'Payment-Service/1.0',
#                 'X-Callback-Signature': self.generate_callback_signature(payload)
#             }
            
#             response = requests.post(
#                 callback_url,
#                 json=payload,
#                 headers=headers,
#                 timeout=10
#             )
            
#             # Log callback delivery
#             CallbackDeliveryLog.objects.create(
#                 transaction=transaction,
#                 payload=payload,
#                 status='delivered' if response.status_code == 200 else 'failed',
#                 response_status=response.status_code,
#                 response_body=response.text[:1000],
#                 attempt_count=1
#             )
            
#             transaction.mark_callback_attempt()
            
#         except Exception as e:
#             logger.error(f"Bank callback delivery failed: {str(e)}")
#             CallbackDeliveryLog.objects.create(
#                 transaction=transaction,
#                 payload=payload,
#                 status='failed',
#                 attempt_count=1,
#                 error_message=str(e)
#             )

#     def generate_callback_signature(self, payload):
#         """Generate signature for callback verification"""
#         secret = getattr(settings, 'CALLBACK_SECRET', 'default-secret')
#         message = json.dumps(payload, sort_keys=True)
#         return hmac.new(
#             secret.encode(),
#             message.encode(),
#             hashlib.sha256
#         ).hexdigest()


# class TestConnectionView(APIView):
#     """
#     View for testing payment gateway connections
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, gateway_id):
#         """
#         Test connection to a specific payment gateway
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             if gateway.name in ['mpesa_paybill', 'mpesa_till']:
#                 return self.test_mpesa_connection(gateway.mpesaconfig, gateway.sandbox_mode)
#             elif gateway.name == 'paypal':
#                 return self.test_paypal_connection(gateway.paypalconfig, gateway.sandbox_mode)
#             elif gateway.name == 'bank_transfer':
#                 return Response({
#                     "success": True,
#                     "message": "Bank connection verified (manual configuration)",
#                     "status": "manual_verification"
#                 })
#             else:
#                 return Response(
#                     {"error": "Unsupported payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#         except PaymentGateway.DoesNotExist:
#             return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Connection test failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Connection test failed", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def test_mpesa_connection(self, config, sandbox_mode):
#         """Test M-Pesa API connection"""
#         try:
#             token = self.generate_mpesa_token(config, sandbox_mode)
#             if token:
#                 return Response({
#                     "success": True,
#                     "message": "M-Pesa connection successful",
#                     "status": "connected",
#                     "environment": "sandbox" if sandbox_mode else "production"
#                 })
#             else:
#                 return Response({
#                     "success": False,
#                     "message": "M-Pesa authentication failed",
#                     "status": "authentication_failed"
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({
#                 "success": False,
#                 "message": "M-Pesa connection test failed",
#                 "status": "connection_failed",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def test_paypal_connection(self, config, sandbox_mode):
#         """Test PayPal API connection"""
#         try:
#             base_url = "https://api-m.sandbox.paypal.com" if sandbox_mode else "https://api-m.paypal.com"
            
#             response = requests.post(
#                 f"{base_url}/v1/oauth2/token",
#                 auth=(config.client_id, config.secret),
#                 headers={"Accept": "application/json", "Accept-Language": "en_US"},
#                 data={"grant_type": "client_credentials"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return Response({
#                     "success": True,
#                     "message": "PayPal connection successful",
#                     "status": "connected",
#                     "environment": "sandbox" if sandbox_mode else "production"
#                 })
#             else:
#                 return Response({
#                     "success": False,
#                     "message": "PayPal authentication failed",
#                     "status": "authentication_failed",
#                     "details": response.json()
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({
#                 "success": False,
#                 "message": "PayPal connection test failed",
#                 "status": "connection_failed",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def generate_mpesa_token(self, config, sandbox_mode):
#         """Generate M-Pesa API access token"""
#         try:
#             credentials = f"{config.consumer_key}:{config.consumer_secret}"
#             encoded = base64.b64encode(credentials.encode()).decode()
            
#             base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.get(
#                 f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
#                 headers={"Authorization": f"Basic {encoded}"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 return response.json().get('access_token')
#             return None
#         except:
#             return None


# class ConfigurationHistoryView(APIView):
#     """
#     View for accessing configuration history
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get configuration history with pagination
#         """
#         try:
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
#             history = ConfigurationHistory.objects.all().order_by('-timestamp')
            
#             paginator = Paginator(history, page_size)
#             page_data = paginator.get_page(page)
            
#             serializer = ConfigurationHistorySerializer(page_data, many=True)
            
#             return Response({
#                 "history": serializer.data,
#                 "pagination": {
#                     "page": page_data.number,
#                     "pages": paginator.num_pages,
#                     "total": paginator.count,
#                     "has_next": page_data.has_next(),
#                     "has_previous": page_data.has_previous()
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch configuration history: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch configuration history"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class WebhookLogsView(APIView):
#     """
#     View for accessing webhook logs
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get webhook logs with filtering and pagination
#         """
#         try:
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 20)), 100)
#             gateway_id = request.query_params.get('gateway_id')
#             status_code = request.query_params.get('status_code')
            
#             logs = WebhookLog.objects.all().order_by('-created_at')
            
#             if gateway_id:
#                 logs = logs.filter(gateway_id=gateway_id)
#             if status_code:
#                 logs = logs.filter(status_code=status_code)
            
#             paginator = Paginator(logs, page_size)
#             page_data = paginator.get_page(page)
            
#             serializer = WebhookLogSerializer(page_data, many=True)
            
#             return Response({
#                 "logs": serializer.data,
#                 "pagination": {
#                     "page": page_data.number,
#                     "pages": paginator.num_pages,
#                     "total": paginator.count,
#                     "has_next": page_data.has_next(),
#                     "has_previous": page_data.has_previous()
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to fetch webhook logs: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch webhook logs"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )











from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db.models import Q, Count, Avg, Max, Min, Sum, F, ExpressionWrapper, DurationField
from django.shortcuts import get_object_or_404
from datetime import datetime, timedelta
import requests
import base64
import json
import hmac
import hashlib
import os
import logging
from payments.models.payment_config_model import (
    PaymentGateway,
    MpesaConfig,
    PayPalConfig,
    BankConfig,
    ClientPaymentMethod,
    Transaction,
    ConfigurationHistory,
    WebhookLog,
    PaymentAnalytics,
    CallbackDeliveryLog,
)
from payments.serializers.payment_config_serializer import (
    PaymentGatewaySerializer,
    MpesaConfigSerializer,
    PayPalConfigSerializer,
    BankConfigSerializer,
    ClientPaymentMethodSerializer,
    TransactionSerializer,
    TransactionCreateSerializer,
    LinkSubscriptionSerializer,
    ConfigurationHistorySerializer,
    WebhookLogSerializer,
    PaymentAnalyticsSerializer,
    CallbackDeliveryLogSerializer,
    SubscriptionCallbackSerializer,
    PaymentVerificationSerializer,
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from django.conf import settings
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

class PaymentGatewayView(APIView):
    """
    Main view for managing payment gateways configuration
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get all payment gateways with their configurations
        """
        try:
            gateways = PaymentGateway.objects.all().prefetch_related(
                'mpesaconfig', 'paypalconfig', 'bankconfig'
            )
            serializer = PaymentGatewaySerializer(gateways, many=True, context={'request': request})
            
            return Response({
                "gateways": serializer.data,
                "configuration": {
                    "base_url": request.build_absolute_uri('/')[:-1],
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch payment configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch payment configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        """
        Create a new payment gateway
        """
        try:
            serializer = PaymentGatewaySerializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            gateway = serializer.save()
            return Response(
                PaymentGatewaySerializer(gateway, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Failed to create payment gateway: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create payment gateway", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def put(self, request, gateway_id):
        """
        Update payment gateway configuration
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            serializer = PaymentGatewaySerializer(
                gateway, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            gateway = serializer.save()
            return Response(PaymentGatewaySerializer(gateway, context={'request': request}).data)
        except PaymentGateway.DoesNotExist:
            return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to update payment gateway: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to update payment gateway", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, gateway_id):
        """
        Delete a payment gateway and its configuration
        """
        try:
            active_gateways = PaymentGateway.objects.filter(is_active=True)
            if active_gateways.count() <= 1 and active_gateways.filter(id=gateway_id).exists():
                return Response(
                    {"error": "Cannot delete the last active payment gateway"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            gateway = PaymentGateway.objects.get(id=gateway_id)
            gateway.delete()

            ConfigurationHistory.objects.create(
                action="delete",
                model="PaymentGateway",
                object_id=str(gateway_id),
                changes=["Deleted payment gateway"],
                user=request.user
            )

            return Response(status=status.HTTP_204_NO_CONTENT)
        except PaymentGateway.DoesNotExist:
            return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to delete payment gateway: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to delete payment gateway", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class MpesaConfigView(APIView):
    """
    View for managing M-Pesa configuration
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, gateway_id):
        """
        Update M-Pesa configuration
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            if gateway.name not in ['mpesa_paybill', 'mpesa_till']:
                return Response(
                    {"error": "Gateway is not an M-Pesa gateway"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            mpesa_config = gateway.mpesaconfig
            serializer = MpesaConfigSerializer(
                mpesa_config, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            mpesa_config = serializer.save()
            return Response(MpesaConfigSerializer(mpesa_config).data)
        except PaymentGateway.DoesNotExist:
            return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
        except MpesaConfig.DoesNotExist:
            return Response({"error": "M-Pesa configuration not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to update M-Pesa configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to update M-Pesa configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PayPalConfigView(APIView):
    """
    View for managing PayPal configuration
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, gateway_id):
        """
        Update PayPal configuration
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            if gateway.name != 'paypal':
                return Response(
                    {"error": "Gateway is not a PayPal gateway"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            paypal_config = gateway.paypalconfig
            serializer = PayPalConfigSerializer(
                paypal_config, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            paypal_config = serializer.save()
            return Response(PayPalConfigSerializer(paypal_config).data)
        except PaymentGateway.DoesNotExist:
            return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
        except PayPalConfig.DoesNotExist:
            return Response({"error": "PayPal configuration not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to update PayPal configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to update PayPal configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class BankConfigView(APIView):
    """
    View for managing Bank Transfer configuration
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, gateway_id):
        """
        Update Bank Transfer configuration
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            if gateway.name != 'bank_transfer':
                return Response(
                    {"error": "Gateway is not a Bank Transfer gateway"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            bank_config = gateway.bankconfig
            serializer = BankConfigSerializer(
                bank_config, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            bank_config = serializer.save()
            return Response(BankConfigSerializer(bank_config).data)
        except PaymentGateway.DoesNotExist:
            return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
        except BankConfig.DoesNotExist:
            return Response({"error": "Bank configuration not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to update Bank configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to update Bank configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AvailablePaymentMethodsView(APIView):
    """
    Get available payment methods for clients
    Clean version for client portal
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """
        Get all active payment methods available for clients
        """
        try:
            methods = PaymentGateway.objects.filter(
                is_active=True,
                health_status='healthy'
            ).prefetch_related(
                'mpesaconfig', 'paypalconfig', 'bankconfig'
            )
            
            serializer = PaymentGatewaySerializer(methods, many=True, context={'request': request})
            
            return Response({
                "available_methods": serializer.data,
                "timestamp": timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch available payment methods: {str(e)}")
            return Response(
                {"error": "Failed to fetch available payment methods"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ClientPaymentMethodsView(APIView):
    """
    Handles payment methods for authenticated clients
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get payment methods for authenticated client
        """
        try:
            client = get_object_or_404(Client, user=request.user)
            methods = ClientPaymentMethod.objects.filter(client=client)
            serializer = ClientPaymentMethodSerializer(methods, many=True)
            
            return Response({
                "client_id": client.id,
                "methods": serializer.data
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch payment methods: {str(e)}")
            return Response(
                {"error": "Failed to fetch payment methods"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Add a payment method for client
        """
        try:
            client = get_object_or_404(Client, user=request.user)
            gateway_id = request.data.get('gateway_id')
            
            if not gateway_id:
                return Response(
                    {"error": "gateway_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            gateway = get_object_or_404(PaymentGateway, id=gateway_id, is_active=True)
            
            # Check if method already exists
            if ClientPaymentMethod.objects.filter(client=client, gateway=gateway).exists():
                return Response(
                    {"error": "Payment method already exists for this client"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            method = ClientPaymentMethod.objects.create(
                client=client,
                gateway=gateway,
                is_default=request.data.get('is_default', False)
            )
            
            serializer = ClientPaymentMethodSerializer(method)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Failed to add payment method: {str(e)}")
            return Response(
                {"error": "Failed to add payment method"},
                status=status.HTTP_400_BAD_REQUEST
            )


class InitiatePaymentView(APIView):
    """
    View for initiating payments through different gateways
    Returns standardized response format for internetplans
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Initiate a payment based on the selected gateway
        Returns standardized response for internetplans integration
        """
        try:
            gateway_id = request.data.get('gateway_id')
            amount = request.data.get('amount')
            plan_id = request.data.get('plan_id')
            idempotency_key = request.data.get('idempotency_key')
            
            if not all([gateway_id, amount, plan_id]):
                return Response(
                    {"error": "Missing required fields: gateway_id, amount, plan_id"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            client = get_object_or_404(Client, user=request.user)
            gateway = get_object_or_404(PaymentGateway, id=gateway_id, is_active=True)

            # Check if client has this payment method
            if not ClientPaymentMethod.objects.filter(client=client, gateway=gateway).exists():
                return Response(
                    {"error": "Payment method not available for this client"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Create transaction record
            transaction_data = {
                'client': client.id,
                'gateway': gateway.id,
                'plan_id': plan_id,
                'amount': amount,
                'idempotency_key': idempotency_key,
                'metadata': {
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'ip_address': request.META.get('REMOTE_ADDR', ''),
                    'plan_id': plan_id,
                    'client_id': str(client.id)
                }
            }

            serializer = TransactionCreateSerializer(
                data=transaction_data,
                context={'request': request}
            )
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            transaction = serializer.save()

            # Initiate payment based on gateway type
            if gateway.name in ['mpesa_paybill', 'mpesa_till']:
                return self.initiate_mpesa_payment(request, transaction, gateway)
            elif gateway.name == 'paypal':
                return self.initiate_paypal_payment(transaction, gateway)
            elif gateway.name == 'bank_transfer':
                return self.initiate_bank_payment(transaction, gateway)
            else:
                return Response(
                    {"error": "Unsupported payment method"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Payment initiation failed: {str(e)}", exc_info=True)
            return Response(
                {"error": "Payment initiation failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def initiate_mpesa_payment(self, request, transaction, gateway):
        """
        Initiate M-Pesa STK push payment
        """
        try:
            mpesa_config = gateway.mpesaconfig
            
            # Generate access token
            token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
            if not token:
                return Response(
                    {"error": "Failed to authenticate with M-Pesa"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            business_short_code = mpesa_config.short_code
            passkey = mpesa_config.passkey
            
            password = base64.b64encode(
                (business_short_code + passkey + timestamp).encode()
            ).decode()
            
            if mpesa_config.paybill_number:
                transaction_type = "CustomerPayBillOnline"
                party_b = mpesa_config.paybill_number
            else:
                transaction_type = "CustomerBuyGoodsOnline"
                party_b = mpesa_config.till_number

            payload = {
                "BusinessShortCode": business_short_code,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": transaction_type,
                "Amount": str(transaction.amount),
                "PartyA": transaction.client.user.phone_number,
                "PartyB": party_b,
                "PhoneNumber": transaction.client.user.phone_number,
                "CallBackURL": f"{settings.BASE_URL}/api/payments/callback/mpesa/",
                "AccountReference": f"CLIENT{transaction.client.id}",
                "TransactionDesc": f"Payment for plan {transaction.plan_id}"
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.post(
                f"{base_url}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('ResponseCode') == '0':
                transaction.metadata.update({
                    'checkout_request_id': response['CheckoutRequestID'],
                    'mpesa_request': payload,
                    'mpesa_response': response,
                })
                transaction.save()
                
                # Standardized response for internetplans
                return Response({
                    "success": True,
                    "payment_reference": transaction.reference,
                    "next_steps": {
                        "type": "mpesa_stk_push",
                        "instructions": "Check your phone to complete M-Pesa payment",
                        "estimated_completion_time": "2-5 minutes"
                    },
                    "transaction_id": str(transaction.id),
                    "gateway": "mpesa",
                    "checkout_request_id": response['CheckoutRequestID']
                })
            else:
                transaction.status = 'failed'
                transaction.metadata.update({
                    'error': response.get('errorMessage', 'Payment request failed'),
                    'mpesa_response': response
                })
                transaction.save()
                
                return Response({
                    "success": False,
                    "error": response.get('errorMessage', 'Payment request failed'),
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"M-Pesa payment initiation failed: {str(e)}", exc_info=True)
            transaction.status = 'failed'
            transaction.metadata['error'] = str(e)
            transaction.save()
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def generate_mpesa_token(self, config, sandbox_mode):
        """Generate M-Pesa API access token"""
        try:
            credentials = f"{config.consumer_key}:{config.consumer_secret}"
            encoded = base64.b64encode(credentials.encode()).decode()
            
            base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.get(
                f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {encoded}"},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                logger.error(f"M-Pesa token generation failed: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa token request failed: {str(e)}")
            return None

    def initiate_paypal_payment(self, transaction, gateway):
        """Initiate PayPal payment"""
        try:
            paypal_config = gateway.paypalconfig
            
            base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
            # Get access token
            auth_response = requests.post(
                f"{base_url}/v1/oauth2/token",
                auth=(paypal_config.client_id, paypal_config.secret),
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
                data={"grant_type": "client_credentials"},
                timeout=10
            ).json()
            
            if 'access_token' not in auth_response:
                return Response({
                    "success": False,
                    "error": "Failed to authenticate with PayPal",
                    "details": auth_response
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = auth_response['access_token']
            
            # Create order
            order_payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(transaction.amount)
                    },
                    "description": f"Payment for plan {transaction.plan_id}",
                    "custom_id": f"CLIENT{transaction.client.id}",
                    "invoice_id": f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}"
                }],
                "application_context": {
                    "return_url": paypal_config.callback_url,
                    "cancel_url": f"{paypal_config.callback_url}?cancel=true",
                    "brand_name": "Internet Service",
                    "user_action": "PAY_NOW"
                }
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{base_url}/v2/checkout/orders",
                json=order_payload,
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('status') in ['CREATED', 'APPROVED']:
                transaction.metadata.update({
                    'paypal_order_id': response['id'],
                    'paypal_response': response
                })
                transaction.save()
                
                approve_url = next(
                    (link['href'] for link in response['links'] if link['rel'] == 'approve'),
                    None
                )
                
                # Standardized response for internetplans
                return Response({
                    "success": True,
                    "payment_reference": transaction.reference,
                    "next_steps": {
                        "type": "paypal_redirect",
                        "url": approve_url,
                        "instructions": "Redirect to PayPal to complete payment",
                        "estimated_completion_time": "1-3 minutes"
                    },
                    "transaction_id": str(transaction.id),
                    "gateway": "paypal",
                    "approve_url": approve_url
                })
            else:
                transaction.status = 'failed'
                transaction.metadata.update({
                    'error': "Failed to create PayPal order",
                    'paypal_response': response
                })
                transaction.save()
                
                return Response({
                    "success": False,
                    "error": "Failed to create PayPal order",
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"PayPal payment initiation failed: {str(e)}", exc_info=True)
            transaction.status = 'failed'
            transaction.metadata['error'] = str(e)
            transaction.save()
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def initiate_bank_payment(self, transaction, gateway):
        """Provide bank details for manual transfer"""
        try:
            bank_config = gateway.bankconfig
            
            transaction.metadata.update({
                'bank_details': {
                    'bank_name': bank_config.bank_name,
                    'account_name': bank_config.account_name,
                    'account_number': bank_config.account_number,
                    'branch_code': bank_config.branch_code,
                    'swift_code': bank_config.swift_code,
                    'routing_number': bank_config.routing_number,
                    'bank_address': bank_config.bank_address,
                    'account_type': bank_config.account_type,
                    'currency': bank_config.currency
                },
                'instructions': "Make payment to the provided bank account and upload proof of payment"
            })
            transaction.save()
            
            # Standardized response for internetplans
            return Response({
                "success": True,
                "payment_reference": transaction.reference,
                "next_steps": {
                    "type": "bank_transfer",
                    "instructions": "Transfer funds to the provided bank account and upload proof",
                    "estimated_completion_time": "1-24 hours"
                },
                "transaction_id": str(transaction.id),
                "gateway": "bank",
                "bank_details": transaction.metadata['bank_details']
            })
        except Exception as e:
            logger.error(f"Bank payment initiation failed: {str(e)}", exc_info=True)
            transaction.status = 'failed'
            transaction.metadata['error'] = str(e)
            transaction.save()
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class TransactionStatusView(APIView):
    """
    View for checking transaction status with enhanced details for internetplans
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, reference):
        """
        Get transaction status by reference number with enhanced details
        """
        try:
            transaction = get_object_or_404(Transaction, reference=reference)
            
            # Ensure user can only see their own transactions
            if transaction.client.user != request.user and not request.user.is_staff:
                return Response(
                    {"error": "Access denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = TransactionSerializer(transaction)
            
            # Enhanced response for internetplans
            response_data = serializer.data
            response_data.update({
                "subscription_ready": transaction.status == 'completed' and not transaction.subscription_id,
                "payment_gateway_status": self.get_gateway_status(transaction),
                "callback_delivery_status": self.get_callback_status(transaction),
                "can_retry_callback": transaction.status == 'completed' and transaction.callback_attempts < 3
            })
            
            return Response(response_data)
        except Transaction.DoesNotExist:
            return Response(
                {"error": "Transaction not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to get transaction status: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to get transaction status", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_gateway_status(self, transaction):
        """Get gateway-specific status details"""
        if transaction.gateway and transaction.gateway.name.startswith('mpesa'):
            return {
                "type": "mpesa",
                "checkout_request_id": transaction.metadata.get('checkout_request_id'),
                "receipt_number": transaction.metadata.get('mpesa_receipt')
            }
        elif transaction.gateway and transaction.gateway.name == 'paypal':
            return {
                "type": "paypal",
                "order_id": transaction.metadata.get('paypal_order_id'),
                "capture_id": transaction.metadata.get('paypal_capture_id')
            }
        elif transaction.gateway and transaction.gateway.name == 'bank_transfer':
            return {
                "type": "bank_transfer",
                "bank_details": transaction.metadata.get('bank_details', {})
            }
        return {"type": "unknown"}

    def get_callback_status(self, transaction):
        """Get callback delivery status"""
        latest_delivery = CallbackDeliveryLog.objects.filter(
            transaction=transaction
        ).order_by('-created_at').first()
        
        if latest_delivery:
            return {
                "status": latest_delivery.status,
                "last_attempt": latest_delivery.updated_at,
                "attempt_count": latest_delivery.attempt_count,
                "error": latest_delivery.error_message
            }
        return {"status": "not_attempted", "attempt_count": 0}


class LinkSubscriptionView(APIView):
    """
    API to link transactions with subscriptions
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, transaction_id):
        """
        Link a transaction with a subscription
        """
        try:
            transaction = get_object_or_404(Transaction, id=transaction_id)
            
            # Verify user owns the transaction or is staff
            if transaction.client.user != request.user and not request.user.is_staff:
                return Response(
                    {"error": "Access denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = LinkSubscriptionSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            subscription_id = serializer.validated_data['subscription_id']
            
            # Check if subscription is already linked to another transaction
            existing_link = Transaction.objects.filter(
                subscription_id=subscription_id
            ).exclude(id=transaction_id).first()
            
            if existing_link:
                return Response({
                    "error": f"Subscription already linked to transaction {existing_link.reference}"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            transaction.subscription_id = subscription_id
            transaction.save()
            
            # Log the linking
            transaction.metadata['subscription_linked_at'] = timezone.now().isoformat()
            transaction.metadata['linked_by'] = request.user.username
            transaction.save()
            
            return Response({
                "success": True,
                "message": f"Transaction {transaction.reference} linked to subscription {subscription_id}",
                "transaction": TransactionSerializer(transaction).data
            })
            
        except Exception as e:
            logger.error(f"Failed to link subscription: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to link subscription", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PaymentAnalyticsView(APIView):
    """
    Analytics endpoints for internetplans dashboard
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get payment analytics data
        Supports time_range parameter: 7d, 30d, 90d, 1y
        """
        try:
            time_range = request.query_params.get('time_range', '30d')
            access_type = request.query_params.get('access_type')
            
            end_date = timezone.now()
            if time_range == '7d':
                start_date = end_date - timedelta(days=7)
            elif time_range == '90d':
                start_date = end_date - timedelta(days=90)
            elif time_range == '1y':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)

            # Calculate revenue data
            transactions = Transaction.objects.filter(
                created_at__gte=start_date,
                status='completed'
            )
            
            if access_type:
                # Filter by gateway type if access_type specified
                if access_type == 'hotspot':
                    transactions = transactions.filter(gateway__name__in=['mpesa_paybill', 'mpesa_till'])
                elif access_type == 'pppoe':
                    transactions = transactions.filter(gateway__name='bank_transfer')
            
            total_revenue = transactions.aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            revenue_by_plan = transactions.values('plan_id').annotate(
                total_revenue=Sum('amount'),
                transaction_count=Count('id')
            ).order_by('-total_revenue')
            
            # Calculate success rate
            total_transactions = Transaction.objects.filter(
                created_at__gte=start_date
            ).count()
            
            successful_transactions = transactions.count()
            success_rate = (successful_transactions / total_transactions * 100) if total_transactions > 0 else 0
            
            return Response({
                "time_range": time_range,
                "access_type": access_type,
                "total_revenue": float(total_revenue),
                "success_rate": round(success_rate, 2),
                "total_transactions": total_transactions,
                "successful_transactions": successful_transactions,
                "revenue_by_plan": list(revenue_by_plan),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch payment analytics: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch payment analytics", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentVerificationView(APIView):
    """
    API for manual payment verification
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Verify a payment manually
        """
        try:
            serializer = PaymentVerificationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            reference = data.get('reference')
            phone_number = data.get('phone_number')
            amount = data.get('amount')
            gateway = data.get('gateway', 'mpesa')
            
            # Find transaction
            if reference:
                transaction = get_object_or_404(Transaction, reference=reference)
            elif phone_number and amount:
                # Look for recent transactions matching phone and amount
                recent_transactions = Transaction.objects.filter(
                    client__user__phone_number=phone_number,
                    amount=amount,
                    created_at__gte=timezone.now() - timedelta(hours=24)
                ).order_by('-created_at')
                
                if not recent_transactions.exists():
                    return Response({
                        "success": False,
                        "error": "No recent transactions found for this phone number and amount"
                    }, status=status.HTTP_404_NOT_FOUND)
                
                transaction = recent_transactions.first()
            else:
                return Response({
                    "success": False,
                    "error": "Insufficient search criteria"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify transaction
            if transaction.status == 'completed':
                return Response({
                    "success": True,
                    "verified": True,
                    "transaction": TransactionSerializer(transaction).data,
                    "message": "Payment already verified and completed"
                })
            
            # Mark as verifying
            transaction.status = 'verifying'
            transaction.metadata['verification_attempt'] = {
                'attempted_by': request.user.username,
                'attempted_at': timezone.now().isoformat(),
                'verification_method': 'manual'
            }
            transaction.save()
            
            # For M-Pesa, verify using transaction query API
            if gateway == 'mpesa' and transaction.gateway and transaction.gateway.name.startswith('mpesa'):
                verification_result = self.verify_mpesa_payment(transaction)
            elif gateway == 'paypal' and transaction.gateway and transaction.gateway.name == 'paypal':
                verification_result = self.verify_paypal_payment(transaction)
            else:
                verification_result = {"verified": False, "reason": "Manual verification required"}
            
            if verification_result.get('verified'):
                transaction.status = 'completed'
                transaction.metadata['manual_verification'] = verification_result
                transaction.save()
            
            return Response({
                "success": True,
                "verified": verification_result.get('verified', False),
                "transaction": TransactionSerializer(transaction).data,
                "verification_details": verification_result
            })
            
        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}", exc_info=True)
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def verify_mpesa_payment(self, transaction):
        """Verify M-Pesa payment using transaction query API"""
        try:
            gateway = transaction.gateway
            mpesa_config = gateway.mpesaconfig
            
            token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
            if not token:
                return {"verified": False, "reason": "Failed to authenticate with M-Pesa"}
            
            checkout_request_id = transaction.metadata.get('checkout_request_id')
            if not checkout_request_id:
                return {"verified": False, "reason": "Missing checkout request ID"}
            
            payload = {
                "BusinessShortCode": mpesa_config.short_code,
                "Password": self.generate_mpesa_password(mpesa_config),
                "Timestamp": datetime.now().strftime('%Y%m%d%H%M%S'),
                "CheckoutRequestID": checkout_request_id
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.post(
                f"{base_url}/mpesa/stkpushquery/v1/query",
                json=payload,
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('ResultCode') == '0':
                return {
                    "verified": True,
                    "method": "mpesa_query",
                    "receipt_number": response.get('MpesaReceiptNumber'),
                    "verified_at": timezone.now().isoformat(),
                    "response": response
                }
            else:
                return {
                    "verified": False,
                    "reason": response.get('ResultDesc', 'Payment verification failed'),
                    "response": response
                }
                
        except Exception as e:
            logger.error(f"M-Pesa verification failed: {str(e)}")
            return {"verified": False, "reason": str(e)}

    def verify_paypal_payment(self, transaction):
        """Verify PayPal payment using order details API"""
        try:
            gateway = transaction.gateway
            paypal_config = gateway.paypalconfig
            
            base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
            # Get access token
            auth_response = requests.post(
                f"{base_url}/v1/oauth2/token",
                auth=(paypal_config.client_id, paypal_config.secret),
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
                data={"grant_type": "client_credentials"},
                timeout=10
            ).json()
            
            if 'access_token' not in auth_response:
                return {"verified": False, "reason": "Failed to authenticate with PayPal"}
            
            token = auth_response['access_token']
            order_id = transaction.metadata.get('paypal_order_id')
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(
                f"{base_url}/v2/checkout/orders/{order_id}",
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('status') == 'COMPLETED':
                return {
                    "verified": True,
                    "method": "paypal_order_check",
                    "verified_at": timezone.now().isoformat(),
                    "response": response
                }
            else:
                return {
                    "verified": False,
                    "reason": f"Order status: {response.get('status')}",
                    "response": response
                }
                
        except Exception as e:
            logger.error(f"PayPal verification failed: {str(e)}")
            return {"verified": False, "reason": str(e)}

    def generate_mpesa_token(self, config, sandbox_mode):
        """Generate M-Pesa API access token"""
        try:
            credentials = f"{config.consumer_key}:{config.consumer_secret}"
            encoded = base64.b64encode(credentials.encode()).decode()
            
            base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.get(
                f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {encoded}"},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                logger.error(f"M-Pesa token generation failed: {response.text}")
                return None
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa token request failed: {str(e)}")
            return None

    def generate_mpesa_password(self, config):
        """Generate M-Pesa API password"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            (config.short_code + config.passkey + timestamp).encode()
        ).decode()
        return password


@method_decorator(csrf_exempt, name='dispatch')
class SubscriptionCallbackView(APIView):
    """
    Callback endpoint for internetplans to notify about subscription status
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Receive subscription activation status from internetplans
        """
        try:
            serializer = SubscriptionCallbackSerializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Invalid subscription callback: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            reference = data['reference']
            status = data['status']
            subscription_id = data['subscription_id']
            plan_id = data['plan_id']
            client_id = data['client_id']
            
            # Find transaction
            try:
                transaction = Transaction.objects.get(reference=reference)
            except Transaction.DoesNotExist:
                logger.error(f"Transaction not found for callback: {reference}")
                return Response(
                    {"error": "Transaction not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Update transaction with subscription info
            transaction.subscription_id = subscription_id
            transaction.metadata['subscription_callback'] = {
                'received_at': timezone.now().isoformat(),
                'status': status,
                'plan_id': plan_id,
                'client_id': client_id,
                'activation_result': data.get('activation_result'),
                'error_message': data.get('error_message')
            }
            
            if status == 'activated':
                transaction.metadata['subscription_activated_at'] = timezone.now().isoformat()
                logger.info(f"Subscription activated for transaction {reference}")
            elif status == 'failed':
                transaction.metadata['subscription_activation_failed'] = True
                logger.error(f"Subscription activation failed for transaction {reference}: {data.get('error_message')}")
            
            transaction.save()
            
            return Response({
                "success": True,
                "message": f"Subscription callback processed for {reference}",
                "transaction_reference": reference,
                "subscription_id": subscription_id
            })
            
        except Exception as e:
            logger.error(f"Subscription callback processing failed: {str(e)}", exc_info=True)
            return Response(
                {"error": "Callback processing failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    """
    M-Pesa payment callback handler
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Process M-Pesa STK push callback
        """
        try:
            data = request.data
            callback = data.get('Body', {}).get('stkCallback', {})
            result_code = callback.get('ResultCode')
            checkout_id = callback.get('CheckoutRequestID')
            
            if not checkout_id:
                return JsonResponse(
                    {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"},
                    status=400
                )

            try:
                transaction = Transaction.objects.get(
                    metadata__checkout_request_id=checkout_id
                )
            except Transaction.DoesNotExist:
                logger.warning(f"Transaction not found for checkout ID: {checkout_id}")
                return JsonResponse(
                    {"ResultCode": 1, "ResultDesc": "Transaction not found"},
                    status=404
                )
            
            # Log webhook
            WebhookLog.objects.create(
                gateway=transaction.gateway,
                event_type='mpesa_callback',
                payload=data,
                headers=dict(request.headers),
                ip_address=request.META.get('REMOTE_ADDR'),
                status_code=200,
                response="Processing",
                signature_valid=True
            )
            
            if result_code == '0':
                items = callback.get('CallbackMetadata', {}).get('Item', [])
                metadata = {item['Name']: item.get('Value') for item in items}
                
                transaction.status = 'completed'
                transaction.metadata.update({
                    'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
                    'phone_number': metadata.get('PhoneNumber'),
                    'amount': metadata.get('Amount'),
                    'transaction_date': metadata.get('TransactionDate'),
                    'callback_data': data
                })
                transaction.save()
                
                # Deliver callback to internetplans
                self.deliver_subscription_callback(transaction)
                
                return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
            else:
                transaction.status = 'failed'
                transaction.metadata.update({
                    'error': callback.get('ResultDesc', 'Payment failed'),
                    'callback_data': data
                })
                transaction.save()
                return JsonResponse(
                    {"ResultCode": result_code, "ResultDesc": callback.get('ResultDesc', 'Payment failed')}
                )
        except json.JSONDecodeError:
            return JsonResponse(
                {"ResultCode": 1, "ResultDesc": "Invalid JSON payload"},
                status=400
            )
        except Exception as e:
            logger.error(f"M-Pesa callback processing failed: {str(e)}", exc_info=True)
            return JsonResponse(
                {"ResultCode": 1, "ResultDesc": f"Callback processing failed: {str(e)}"},
                status=500
            )

    def deliver_subscription_callback(self, transaction):
        """
        Deliver payment completion callback to internetplans app
        """
        try:
            callback_url = f"{settings.INTERNETPLANS_BASE_URL}/api/payments/callback/subscription/"
            
            payload = {
                'reference': transaction.reference,
                'status': 'completed',
                'plan_id': transaction.plan_id,
                'client_id': str(transaction.client.id),
                'amount': str(transaction.amount),
                'payment_method': 'mpesa',
                'metadata': {
                    'mpesa_receipt': transaction.metadata.get('mpesa_receipt'),
                    'phone_number': transaction.metadata.get('phone_number')
                }
            }
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Payment-Service/1.0',
                'X-Callback-Signature': self.generate_callback_signature(payload)
            }
            
            response = requests.post(
                callback_url,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            # Log callback delivery attempt
            CallbackDeliveryLog.objects.create(
                transaction=transaction,
                payload=payload,
                status='delivered' if response.status_code == 200 else 'failed',
                response_status=response.status_code,
                response_body=response.text[:1000],
                attempt_count=1,
                error_message=response.text if response.status_code != 200 else '',
                delivered_at=timezone.now() if response.status_code == 200 else None
            )
            
            transaction.mark_callback_attempt()
            
            if response.status_code == 200:
                logger.info(f"Callback delivered successfully for transaction {transaction.reference}")
            else:
                logger.warning(f"Callback delivery failed for transaction {transaction.reference}: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Callback delivery failed: {str(e)}")
            CallbackDeliveryLog.objects.create(
                transaction=transaction,
                payload=payload,
                status='failed',
                attempt_count=1,
                error_message=str(e)
            )
            transaction.mark_callback_attempt()

    def generate_callback_signature(self, payload):
        """Generate signature for callback verification"""
        secret = getattr(settings, 'CALLBACK_SECRET', 'default-secret')
        message = json.dumps(payload, sort_keys=True)
        return hmac.new(
            secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()


@method_decorator(csrf_exempt, name='dispatch')
class PayPalCallbackView(APIView):
    """
    PayPal payment callback handler
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Process PayPal IPN notifications and webhooks
        """
        try:
            data = request.data
            event_type = data.get('event_type')
            resource = data.get('resource', {})
            
            # Handle different PayPal webhook types
            if event_type == 'PAYMENT.CAPTURE.COMPLETED':
                return self.handle_payment_capture(data, resource)
            elif event_type == 'CHECKOUT.ORDER.APPROVED':
                return self.handle_order_approval(data, resource)
            elif event_type == 'PAYMENT.CAPTURE.DENIED':
                return self.handle_payment_denial(data, resource)
            else:
                logger.info(f"Received unhandled PayPal event: {event_type}")
                return JsonResponse({"status": "received"})
                
        except Exception as e:
            logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
            return JsonResponse(
                {"status": "error", "message": f"Callback processing failed: {str(e)}"},
                status=500
            )

    def handle_payment_capture(self, data, resource):
        """Handle completed PayPal payment capture"""
        capture_id = resource.get('id')
        order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        
        if not order_id:
            logger.error("Missing order ID in PayPal capture")
            return JsonResponse({"status": "error", "message": "Missing order ID"}, status=400)

        try:
            transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
        except Transaction.DoesNotExist:
            logger.warning(f"Transaction not found for PayPal order: {order_id}")
            return JsonResponse({"status": "error", "message": "Transaction not found"}, status=404)

        # Update transaction
        transaction.status = 'completed'
        transaction.metadata.update({
            'paypal_capture_id': capture_id,
            'payer_email': resource.get('payer', {}).get('email_address'),
            'amount': resource.get('amount', {}).get('value'),
            'currency': resource.get('amount', {}).get('currency_code'),
            'paypal_callback_data': data
        })
        transaction.save()

        # Deliver subscription callback
        self.deliver_subscription_callback(transaction)
        
        return JsonResponse({"status": "success"})

    def handle_order_approval(self, data, resource):
        """Handle approved PayPal order"""
        order_id = resource.get('id')
        
        try:
            transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
            # Update transaction metadata with approval details
            transaction.metadata['order_approved_at'] = timezone.now().isoformat()
            transaction.metadata['paypal_order_approval'] = data
            transaction.save()
            
            return JsonResponse({"status": "received"})
        except Transaction.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Transaction not found"}, status=404)

    def handle_payment_denial(self, data, resource):
        """Handle denied PayPal payment"""
        order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
        
        if order_id:
            try:
                transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
                transaction.status = 'failed'
                transaction.metadata.update({
                    'paypal_denial_reason': resource.get('reason'),
                    'paypal_callback_data': data
                })
                transaction.save()
            except Transaction.DoesNotExist:
                pass

        return JsonResponse({"status": "received"})

    def deliver_subscription_callback(self, transaction):
        """Deliver callback to internetplans for PayPal payments"""
        try:
            callback_url = f"{settings.INTERNETPLANS_BASE_URL}/api/payments/callback/subscription/"
            
            payload = {
                'reference': transaction.reference,
                'status': 'completed',
                'plan_id': transaction.plan_id,
                'client_id': str(transaction.client.id),
                'amount': str(transaction.amount),
                'payment_method': 'paypal',
                'metadata': {
                    'paypal_order_id': transaction.metadata.get('paypal_order_id'),
                    'paypal_capture_id': transaction.metadata.get('paypal_capture_id')
                }
            }
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Payment-Service/1.0',
                'X-Callback-Signature': self.generate_callback_signature(payload)
            }
            
            response = requests.post(
                callback_url,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            # Log callback delivery
            CallbackDeliveryLog.objects.create(
                transaction=transaction,
                payload=payload,
                status='delivered' if response.status_code == 200 else 'failed',
                response_status=response.status_code,
                response_body=response.text[:1000],
                attempt_count=1
            )
            
            transaction.mark_callback_attempt()
            
        except Exception as e:
            logger.error(f"PayPal callback delivery failed: {str(e)}")
            CallbackDeliveryLog.objects.create(
                transaction=transaction,
                payload=payload,
                status='failed',
                attempt_count=1,
                error_message=str(e)
            )

    def generate_callback_signature(self, payload):
        """Generate signature for callback verification"""
        secret = getattr(settings, 'CALLBACK_SECRET', 'default-secret')
        message = json.dumps(payload, sort_keys=True)
        return hmac.new(
            secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()


@method_decorator(csrf_exempt, name='dispatch')
class BankCallbackView(APIView):
    """
    Bank transfer callback handler
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Process bank transfer payment confirmations
        """
        try:
            data = request.data
            reference = data.get('reference')
            status = data.get('status')
            proof_url = data.get('proof_url')
            verified_by = data.get('verified_by', 'admin')
            
            if not reference:
                return JsonResponse(
                    {"status": "error", "message": "Missing reference"},
                    status=400
                )

            try:
                transaction = Transaction.objects.get(reference=reference)
            except Transaction.DoesNotExist:
                return JsonResponse(
                    {"status": "error", "message": "Transaction not found"},
                    status=404
                )
            
            if status == 'verified':
                transaction.status = 'completed'
                transaction.metadata.update({
                    'verified_by': verified_by,
                    'verified_at': timezone.now().isoformat(),
                    'proof_url': proof_url,
                    'bank_callback_data': data
                })
                transaction.save()
                
                # Deliver callback to internetplans
                self.deliver_subscription_callback(transaction)
                
                return JsonResponse({"status": "success", "message": "Payment verified"})
            elif status == 'rejected':
                transaction.status = 'failed'
                transaction.metadata.update({
                    'rejected_reason': data.get('reason', 'Payment rejected'),
                    'rejected_by': verified_by,
                    'rejected_at': timezone.now().isoformat(),
                    'bank_callback_data': data
                })
                transaction.save()
                return JsonResponse({"status": "failed", "message": "Payment rejected"})
            else:
                return JsonResponse(
                    {"status": "error", "message": "Invalid status"},
                    status=400
                )
                
        except Exception as e:
            logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
            return JsonResponse(
                {"status": "error", "message": f"Callback processing failed: {str(e)}"},
                status=500
            )

    def deliver_subscription_callback(self, transaction):
        """Deliver callback to internetplans for bank transfers"""
        try:
            callback_url = f"{settings.INTERNETPLANS_BASE_URL}/api/payments/callback/subscription/"
            
            payload = {
                'reference': transaction.reference,
                'status': 'completed',
                'plan_id': transaction.plan_id,
                'client_id': str(transaction.client.id),
                'amount': str(transaction.amount),
                'payment_method': 'bank_transfer',
                'metadata': {
                    'verified_by': transaction.metadata.get('verified_by'),
                    'verified_at': transaction.metadata.get('verified_at'),
                    'proof_url': transaction.metadata.get('proof_url')
                }
            }
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'Payment-Service/1.0',
                'X-Callback-Signature': self.generate_callback_signature(payload)
            }
            
            response = requests.post(
                callback_url,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            # Log callback delivery
            CallbackDeliveryLog.objects.create(
                transaction=transaction,
                payload=payload,
                status='delivered' if response.status_code == 200 else 'failed',
                response_status=response.status_code,
                response_body=response.text[:1000],
                attempt_count=1
            )
            
            transaction.mark_callback_attempt()
            
        except Exception as e:
            logger.error(f"Bank callback delivery failed: {str(e)}")
            CallbackDeliveryLog.objects.create(
                transaction=transaction,
                payload=payload,
                status='failed',
                attempt_count=1,
                error_message=str(e)
            )

    def generate_callback_signature(self, payload):
        """Generate signature for callback verification"""
        secret = getattr(settings, 'CALLBACK_SECRET', 'default-secret')
        message = json.dumps(payload, sort_keys=True)
        return hmac.new(
            secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()


class TestConnectionView(APIView):
    """
    View for testing payment gateway connections
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, gateway_id):
        """
        Test connection to a specific payment gateway
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            
            if gateway.name in ['mpesa_paybill', 'mpesa_till']:
                return self.test_mpesa_connection(gateway.mpesaconfig, gateway.sandbox_mode)
            elif gateway.name == 'paypal':
                return self.test_paypal_connection(gateway.paypalconfig, gateway.sandbox_mode)
            elif gateway.name == 'bank_transfer':
                return Response({
                    "success": True,
                    "message": "Bank connection verified (manual configuration)",
                    "status": "manual_verification"
                })
            else:
                return Response(
                    {"error": "Unsupported payment method"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except PaymentGateway.DoesNotExist:
            return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}", exc_info=True)
            return Response(
                {"error": "Connection test failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def test_mpesa_connection(self, config, sandbox_mode):
        """Test M-Pesa API connection"""
        try:
            token = self.generate_mpesa_token(config, sandbox_mode)
            if token:
                return Response({
                    "success": True,
                    "message": "M-Pesa connection successful",
                    "status": "connected",
                    "environment": "sandbox" if sandbox_mode else "production"
                })
            else:
                return Response({
                    "success": False,
                    "message": "M-Pesa authentication failed",
                    "status": "authentication_failed"
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": "M-Pesa connection test failed",
                "status": "connection_failed",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def test_paypal_connection(self, config, sandbox_mode):
        """Test PayPal API connection"""
        try:
            base_url = "https://api-m.sandbox.paypal.com" if sandbox_mode else "https://api-m.paypal.com"
            
            response = requests.post(
                f"{base_url}/v1/oauth2/token",
                auth=(config.client_id, config.secret),
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
                data={"grant_type": "client_credentials"},
                timeout=10
            )
            
            if response.status_code == 200:
                return Response({
                    "success": True,
                    "message": "PayPal connection successful",
                    "status": "connected",
                    "environment": "sandbox" if sandbox_mode else "production"
                })
            else:
                return Response({
                    "success": False,
                    "message": "PayPal authentication failed",
                    "status": "authentication_failed",
                    "details": response.json()
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": "PayPal connection test failed",
                "status": "connection_failed",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def generate_mpesa_token(self, config, sandbox_mode):
        """Generate M-Pesa API access token"""
        try:
            credentials = f"{config.consumer_key}:{config.consumer_secret}"
            encoded = base64.b64encode(credentials.encode()).decode()
            
            base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.get(
                f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {encoded}"},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json().get('access_token')
            return None
        except:
            return None


class ConfigurationHistoryView(APIView):
    """
    View for accessing configuration history
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get configuration history with pagination
        """
        try:
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            history = ConfigurationHistory.objects.all().order_by('-timestamp')
            
            paginator = Paginator(history, page_size)
            page_data = paginator.get_page(page)
            
            serializer = ConfigurationHistorySerializer(page_data, many=True)
            
            return Response({
                "history": serializer.data,
                "pagination": {
                    "page": page_data.number,
                    "pages": paginator.num_pages,
                    "total": paginator.count,
                    "has_next": page_data.has_next(),
                    "has_previous": page_data.has_previous()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch configuration history: {str(e)}")
            return Response(
                {"error": "Failed to fetch configuration history"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WebhookLogsView(APIView):
    """
    View for accessing webhook logs
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get webhook logs with filtering and pagination
        """
        try:
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            gateway_id = request.query_params.get('gateway_id')
            status_code = request.query_params.get('status_code')
            
            logs = WebhookLog.objects.all().order_by('-timestamp')
            
            if gateway_id:
                logs = logs.filter(gateway_id=gateway_id)
            if status_code:
                logs = logs.filter(status_code=status_code)
            
            paginator = Paginator(logs, page_size)
            page_data = paginator.get_page(page)
            
            serializer = WebhookLogSerializer(page_data, many=True)
            
            return Response({
                "logs": serializer.data,
                "pagination": {
                    "page": page_data.number,
                    "pages": paginator.num_pages,
                    "total": paginator.count,
                    "has_next": page_data.has_next(),
                    "has_previous": page_data.has_previous()
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch webhook logs: {str(e)}")
            return Response(
                {"error": "Failed to fetch webhook logs"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )