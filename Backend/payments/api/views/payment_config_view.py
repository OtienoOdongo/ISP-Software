
# # payments/api/views/payment_config_view.py
# import requests
# import base64
# import json
# import os
# import logging
# from datetime import datetime, timedelta
# from django.http import HttpResponseBadRequest, JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from payments.models.payment_config_model import (
#     PaymentGateway,
#     MpesaConfig,
#     PayPalConfig,
#     BankConfig,
#     ClientPaymentMethod,
#     Transaction,
#     ConfigurationHistory
# )
# from phonenumber_field.serializerfields import PhoneNumberField
# from payments.serializers.payment_config_serializer import (
#     PaymentGatewaySerializer,
#     MpesaConfigSerializer,
#     PayPalConfigSerializer,
#     BankConfigSerializer,
#     ClientPaymentMethodSerializer,
#     TransactionSerializer,
#     ConfigurationHistorySerializer
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from account.models.admin_model import Subscription
# from dotenv import load_dotenv
# from phonenumber_field.phonenumber import PhoneNumber
# from django.core.paginator import Paginator, EmptyPage
# from django.db.models import Q

# load_dotenv()
# logger = logging.getLogger(__name__)

# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
# PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")

# def format_phone_number(phone):
#     """Format phone number to M-Pesa compatible format (+254...)"""
#     if not phone:
#         raise ValueError("Phone number is required")
    
#     phone = ''.join(phone.split())
#     if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
#         return phone
#     elif phone.startswith("254") and len(phone) == 12 and phone.isdigit():
#         return f"+{phone}"
#     elif phone.startswith("07") and len(phone) == 10 and phone.isdigit():
#         return f"+254{phone[2:]}"
#     elif phone.startswith("0") and len(phone) == 10 and phone.isdigit():
#         return f"+254{phone[1:]}"
#     else:
#         raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX.")

# class PaymentGatewayView(APIView):
#     """
#     Main view for managing payment gateways configuration
#     Handles CRUD operations for all gateway types
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get all payment gateways with their configurations
#         Returns:
#          - List of gateways with their configs
#          - Configuration history
#          - System-wide settings
    
#         Permission:
#          - Only authenticated users can access (no Client record required)
#          - All authenticated dashboard users can view payment methods
#         """
#         try:
#             # Get all gateways with their configurations
#             gateways = PaymentGateway.objects.all().prefetch_related(
#                 'mpesa_config', 'paypal_config', 'bank_config'
#             )
#             serializer = PaymentGatewaySerializer(gateways, many=True)
            
#             # Get configuration history (last 10 entries)
#             history = ConfigurationHistory.objects.all().order_by('-timestamp')[:10]
#             history_serializer = ConfigurationHistorySerializer(history, many=True)
            
#             # Build base URL for callbacks
#             base_url = request.build_absolute_uri('/')[:-1]  # Remove trailing slash
            
#             return Response({
#                 "gateways": serializer.data,
#                 "history": history_serializer.data,
#                 "configuration": {
#                     "mpesa_callback_url": f"{base_url}/api/payments/callback/mpesa/",
#                     "paypal_callback_url": f"{base_url}/api/payments/callback/paypal/",
#                     "bank_callback_url": f"{base_url}/api/payments/callback/bank/"
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
#         Handles creation of gateway and its specific configuration
#         """
#         try:
#             client = Client.objects.get(user=request.user)
#             if not client.is_admin:
#                 return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

#             method = request.data.get('method')
#             if method not in dict(PaymentGateway.PAYMENT_METHODS).keys():
#                 return Response(
#                     {"error": "Invalid payment method"}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Create base gateway
#             gateway = PaymentGateway.objects.create(
#                 method=method,
#                 is_active=request.data.get('is_active', False),
#                 sandbox_mode=request.data.get('sandbox_mode', True)
#             )

#             # Create method-specific configuration
#             if method == 'mpesa':
#                 mpesa_config = MpesaConfig.objects.create(
#                     gateway=gateway,
#                     paybill_number=request.data.get('paybill_number'),
#                     till_number=request.data.get('till_number'),
#                     consumer_key=request.data.get('consumer_key'),
#                     consumer_secret=request.data.get('consumer_secret'),
#                     passkey=request.data.get('passkey'),
#                     callback_url=request.data.get('callback_url', '')
#                 )
#             elif method == 'paypal':
#                 paypal_config = PayPalConfig.objects.create(
#                     gateway=gateway,
#                     client_id=request.data.get('client_id'),
#                     secret=request.data.get('secret'),
#                     webhook_id=request.data.get('webhook_id', ''),
#                     callback_url=request.data.get('callback_url', '')
#                 )
#             elif method == 'bank':
#                 bank_config = BankConfig.objects.create(
#                     gateway=gateway,
#                     bank_name=request.data.get('bank_name'),
#                     account_name=request.data.get('account_name'),
#                     account_number=request.data.get('account_number'),
#                     branch_code=request.data.get('branch_code', ''),
#                     swift_code=request.data.get('swift_code', '')
#                 )

#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="CREATE",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=f"Created {method} gateway",
#                 user=client.user
#             )

#             return Response(
#                 PaymentGatewaySerializer(gateway).data,
#                 status=status.HTTP_201_CREATED
#             )
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to create payment gateway: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create payment gateway", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def put(self, request, gateway_id):
#         """
#         Update payment gateway configuration
#         Handles updates for both gateway and its specific configuration
#         """
#         try:
#             client = Client.objects.get(user=request.user)
#             if not client.is_admin:
#                 return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             original_status = gateway.is_active
            
#             # Update base gateway fields
#             gateway.is_active = request.data.get('is_active', gateway.is_active)
#             gateway.sandbox_mode = request.data.get('sandbox_mode', gateway.sandbox_mode)
#             gateway.save()

#             # Update method-specific configuration
#             if gateway.method == 'mpesa':
#                 config = gateway.mpesa_config
#                 config.paybill_number = request.data.get('paybill_number', config.paybill_number)
#                 config.till_number = request.data.get('till_number', config.till_number)
#                 config.consumer_key = request.data.get('consumer_key', config.consumer_key)
#                 config.consumer_secret = request.data.get('consumer_secret', config.consumer_secret)
#                 config.passkey = request.data.get('passkey', config.passkey)
#                 config.callback_url = request.data.get('callback_url', config.callback_url)
#                 config.save()
#             elif gateway.method == 'paypal':
#                 config = gateway.paypal_config
#                 config.client_id = request.data.get('client_id', config.client_id)
#                 config.secret = request.data.get('secret', config.secret)
#                 config.webhook_id = request.data.get('webhook_id', config.webhook_id)
#                 config.callback_url = request.data.get('callback_url', config.callback_url)
#                 config.save()
#             elif gateway.method == 'bank':
#                 config = gateway.bank_config
#                 config.bank_name = request.data.get('bank_name', config.bank_name)
#                 config.account_name = request.data.get('account_name', config.account_name)
#                 config.account_number = request.data.get('account_number', config.account_number)
#                 config.branch_code = request.data.get('branch_code', config.branch_code)
#                 config.swift_code = request.data.get('swift_code', config.swift_code)
#                 config.save()

#             # Log status changes
#             if original_status != gateway.is_active:
#                 status_change = "activated" if gateway.is_active else "deactivated"
#                 ConfigurationHistory.objects.create(
#                     action="UPDATE",
#                     model="PaymentGateway",
#                     object_id=gateway.id,
#                     changes=f"{status_change} {gateway.method} gateway",
#                     user=client.user
#                 )

#             # Log configuration update
#             ConfigurationHistory.objects.create(
#                 action="UPDATE",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=f"Updated {gateway.method} configuration",
#                 user=client.user
#             )

#             return Response(PaymentGatewaySerializer(gateway).data)
#         except PaymentGateway.DoesNotExist:
#             return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to update payment gateway: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to update payment gateway", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def delete(self, request, gateway_id):
#         """
#         Delete a payment gateway and its configuration
#         Ensures at least one gateway remains active
#         """
#         try:
#             client = Client.objects.get(user=request.user)
#             if not client.is_admin:
#                 return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

#             # Prevent deletion if it's the last gateway
#             active_gateways = PaymentGateway.objects.filter(is_active=True)
#             if active_gateways.count() <= 1 and active_gateways.filter(id=gateway_id).exists():
#                 return Response(
#                     {"error": "Cannot delete the last active payment gateway"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             method = gateway.method
#             gateway.delete()

#             # Log deletion
#             ConfigurationHistory.objects.create(
#                 action="DELETE",
#                 model="PaymentGateway",
#                 object_id=gateway_id,
#                 changes=f"Deleted {method} gateway",
#                 user=client.user
#             )

#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except PaymentGateway.DoesNotExist:
#             return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to delete payment gateway: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to delete payment gateway", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class TestConnectionView(APIView):
#     """
#     View for testing payment gateway connections
#     Performs live tests with payment providers
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, gateway_id):
#         """
#         Test connection to a specific payment gateway
#         Returns detailed connection status and response
#         """
#         try:
#             client = Client.objects.get(user=request.user)
#             if not client.is_admin:
#                 return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             if gateway.method == 'mpesa':
#                 return self.test_mpesa_connection(gateway.mpesa_config, gateway.sandbox_mode)
#             elif gateway.method == 'paypal':
#                 return self.test_paypal_connection(gateway.paypal_config, gateway.sandbox_mode)
#             elif gateway.method == 'bank':
#                 return Response({
#                     "success": True,
#                     "message": "Bank connection cannot be tested automatically",
#                     "status": "manual_verification_required"
#                 })
#             else:
#                 return Response(
#                     {"error": "Unsupported payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#         except PaymentGateway.DoesNotExist:
#             return Response({"error": "Gateway not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Connection test failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Connection test failed", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def test_mpesa_connection(self, config, sandbox_mode):
#         """Test M-Pesa API connection by generating an access token"""
#         try:
#             # Generate M-Pesa access token
#             credentials = f"{config.consumer_key}:{config.consumer_secret}"
#             encoded = base64.b64encode(credentials.encode()).decode()
            
#             base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.get(
#                 f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
#                 headers={"Authorization": f"Basic {encoded}"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 data = response.json()
#                 if 'access_token' in data:
#                     return Response({
#                         "success": True,
#                         "message": "M-Pesa connection successful",
#                         "status": "connected",
#                         "details": {
#                             "token_validity": data.get('expires_in', 0),
#                             "environment": "sandbox" if sandbox_mode else "production"
#                         }
#                     })
#                 else:
#                     return Response({
#                         "success": False,
#                         "message": data.get('errorMessage', 'Authentication failed'),
#                         "status": "authentication_failed",
#                         "details": data
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 return Response({
#                     "success": False,
#                     "message": "Failed to connect to M-Pesa API",
#                     "status": "connection_failed",
#                     "details": response.json()
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except requests.exceptions.RequestException as e:
#             logger.error(f"M-Pesa connection error: {str(e)}")
#             return Response({
#                 "success": False,
#                 "message": "Network error connecting to M-Pesa",
#                 "status": "network_error",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def test_paypal_connection(self, config, sandbox_mode):
#         """Test PayPal API connection by generating an access token"""
#         try:
#             base_url = "https://api-m.sandbox.paypal.com" if sandbox_mode else "https://api-m.paypal.com"
            
#             response = requests.post(
#                 f"{base_url}/v1/oauth2/token",
#                 headers={
#                     "Accept": "application/json",
#                     "Accept-Language": "en_US"
#                 },
#                 auth=(config.client_id, config.secret),
#                 data={"grant_type": "client_credentials"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 data = response.json()
#                 return Response({
#                     "success": True,
#                     "message": "PayPal connection successful",
#                     "status": "connected",
#                     "details": {
#                         "token_validity": data.get('expires_in', 0),
#                         "environment": "sandbox" if sandbox_mode else "production"
#                     }
#                 })
#             else:
#                 error = response.json()
#                 return Response({
#                     "success": False,
#                     "message": error.get('error_description', 'PayPal authentication failed'),
#                     "status": "authentication_failed",
#                     "details": error
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except requests.exceptions.RequestException as e:
#             logger.error(f"PayPal connection error: {str(e)}")
#             return Response({
#                 "success": False,
#                 "message": "Network error connecting to PayPal",
#                 "status": "network_error",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

# class ClientPaymentMethodsView(APIView):
#     """
#     Handles payment methods for:
#     - Authenticated dashboard users: Manage ALL payment methods
#     - Captive portal clients: View active methods via phone number
#     """
    
#     def get_permissions(self):
#         """
#         Only require authentication for POST/PUT/DELETE (dashboard actions)
#         Allow unauthenticated GET for captive portal
#         """
#         if self.request.method == 'GET':
#             return []
#         return [IsAuthenticated()]

#     def get(self, request):
#         """
#         GET endpoint behavior:
#         - Authenticated: Returns all payment methods (dashboard management)
#         - Unauthenticated + phone: Returns active methods for captive portal
#         """
#         try:
#             # Dashboard User Flow
#             if request.user.is_authenticated:
#                 gateways = PaymentGateway.objects.all().prefetch_related(
#                     'mpesa_config', 'paypal_config', 'bank_config'
#                 )
#                 serializer = PaymentGatewaySerializer(gateways, many=True)
#                 return Response({
#                     "system": "dashboard",
#                     "gateways": serializer.data
#                 })
            
#             # Captive Portal Client Flow
#             phone = request.query_params.get('phone')
#             if not phone:
#                 return Response(
#                     {"error": "Phone number is required for client access"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             try:
#                 phone = format_phone_number(phone)
#                 client, _ = Client.objects.get_or_create(
#                     phonenumber=phone,
#                     defaults={'full_name': "Internet Customer"}
#                 )
                
#                 active_methods = PaymentGateway.objects.filter(
#                     is_active=True
#                 ).prefetch_related(
#                     'mpesa_config', 'paypal_config', 'bank_config'
#                 )
                
#                 serializer = PaymentGatewaySerializer(active_methods, many=True)
#                 return Response({
#                     "system": "captive_portal",
#                     "client_id": client.id,
#                     "methods": serializer.data
#                 })
                
#             except ValueError as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Payment methods retrieval failed: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve payment methods"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         CREATE new payment method (Dashboard only)
#         Requires:
#         - gateway_id: ID of payment gateway to enable
#         """
#         try:
#             gateway_id = request.data.get('gateway_id')
#             if not gateway_id:
#                 return Response(
#                     {"error": "gateway_id is required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             # Create global activation (not client-specific)
#             gateway.is_active = True
#             gateway.save()
            
#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="ACTIVATE",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=f"Activated {gateway.get_method_display()} for all clients",
#                 user=request.user
#             )
            
#             return Response(
#                 PaymentGatewaySerializer(gateway).data,
#                 status=status.HTTP_201_CREATED
#             )
            
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to activate payment method: {str(e)}")
#             return Response(
#                 {"error": "Payment method activation failed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def put(self, request, gateway_id):
#         """
#         UPDATE payment method configuration (Dashboard only)
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             serializer = PaymentGatewaySerializer(gateway, data=request.data, partial=True)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
#             serializer.save()
            
#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="UPDATE",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=f"Updated {gateway.get_method_display()} configuration",
#                 user=request.user
#             )
            
#             return Response(serializer.data)
            
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to update payment gateway: {str(e)}")
#             return Response(
#                 {"error": "Payment gateway update failed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def delete(self, request, gateway_id):
#         """
#         DEACTIVATE payment method (Dashboard only)
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             # Don't allow deactivating if it's the last active method
#             if PaymentGateway.objects.filter(is_active=True).count() <= 1:
#                 return Response(
#                     {"error": "Cannot deactivate the last payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
                
#             gateway.is_active = False
#             gateway.save()
            
#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="DEACTIVATE",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=f"Deactivated {gateway.get_method_display()}",
#                 user=request.user
#             )
            
#             return Response(status=status.HTTP_204_NO_CONTENT)
            
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to deactivate payment method: {str(e)}")
#             return Response(
#                 {"error": "Payment method deactivation failed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
# class InitiatePaymentView(APIView):
#     """
#     View for initiating payments through different gateways
#     Handles payment initiation for M-Pesa, PayPal and Bank transfers
#     """
#     def post(self, request):
#         """
#         Initiate a payment based on the selected gateway
#         Validates all required fields before processing
#         """
#         try:
#             # Common required fields
#             gateway_id = request.data.get('gateway_id')
#             amount = request.data.get('amount')
#             plan_id = request.data.get('plan_id')
            
#             if not all([gateway_id, amount, plan_id]):
#                 return Response(
#                     {"error": "Missing required fields: gateway_id, amount, plan_id"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Get client based on authentication
#             if request.user.is_authenticated:
#                 try:
#                     client = Client.objects.get(user=request.user)
#                 except Client.DoesNotExist:
#                     return Response(
#                         {"error": "Client profile not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#             else:
#                 phone = request.data.get('phone_number')
#                 if not phone:
#                     return Response(
#                         {"error": "Phone number is required for unauthenticated payments"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
#                 try:
#                     phone = format_phone_number(phone)
#                     client = Client.objects.get(phonenumber=phone)
#                 except ValueError as e:
#                     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#                 except Client.DoesNotExist:
#                     return Response(
#                         {"error": "Client not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )

#             # Get gateway and plan
#             try:
#                 gateway = PaymentGateway.objects.get(id=gateway_id, is_active=True)
#                 plan = InternetPlan.objects.get(id=plan_id)
#             except PaymentGateway.DoesNotExist:
#                 return Response(
#                     {"error": "Payment gateway not found or inactive"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
#             except InternetPlan.DoesNotExist:
#                 return Response(
#                     {"error": "Internet plan not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )

#             # Verify client has access to this payment method
#             if not ClientPaymentMethod.objects.filter(
#                 client=client, 
#                 gateway=gateway, 
#                 is_active=True
#             ).exists():
#                 return Response(
#                     {"error": "Payment method not available for this client"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

#             # Gateway-specific payment initiation
#             if gateway.method == 'mpesa':
#                 return self.initiate_mpesa_payment(request, client, gateway, plan)
#             elif gateway.method == 'paypal':
#                 return self.initiate_paypal_payment(client, gateway, plan)
#             elif gateway.method == 'bank':
#                 return self.initiate_bank_payment(client, gateway, plan)
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

#     def initiate_mpesa_payment(self, request, client, gateway, plan):
#         """
#         Initiate M-Pesa STK push payment
#         Handles both paybill and till numbers
#         """
#         try:
#             phone = request.data.get('phone_number')
#             if not phone:
#                 return Response(
#                     {"error": "Phone number is required for M-Pesa"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Format phone number using the utility function
#             try:
#                 phone = format_phone_number(phone)
#             except ValueError as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get M-Pesa config
#             mpesa_config = gateway.mpesa_config
            
#             # Generate access token
#             token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
#             if not token:
#                 return Response(
#                     {"error": "Failed to authenticate with M-Pesa"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             # Prepare STK push request
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             business_short_code = mpesa_config.paybill_number or mpesa_config.till_number
#             passkey = mpesa_config.passkey
            
#             password = base64.b64encode(
#                 (business_short_code + passkey + timestamp).encode()
#             ).decode()
            
#             # Determine transaction type based on configuration
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
#                 "Amount": str(plan.price),  # Use plan price instead of arbitrary amount
#                 "PartyA": phone,
#                 "PartyB": party_b,
#                 "PhoneNumber": phone,
#                 "CallBackURL": mpesa_config.callback_url,
#                 "AccountReference": f"CLIENT{client.id}",
#                 "TransactionDesc": f"Internet Plan: {plan.name}"
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             # Determine API endpoint based on sandbox mode
#             base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
#             # Make STK push request
#             response = requests.post(
#                 f"{base_url}/mpesa/stkpush/v1/processrequest",
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             # Handle response
#             if response.get('ResponseCode') == '0':
#                 # Create transaction record
#                 transaction = Transaction.objects.create(
#                     client=client,
#                     gateway=gateway,
#                     plan=plan,
#                     amount=plan.price,
#                     reference=f"MPESA_{timestamp}_{client.id}",
#                     status='pending',
#                     metadata={
#                         'checkout_request_id': response['CheckoutRequestID'],
#                         'phone_number': phone,
#                         'mpesa_request': payload,
#                         'mpesa_response': response,
#                         'user_agent': request.META.get('HTTP_USER_AGENT', ''),
#                         'ip_address': request.META.get('REMOTE_ADDR', '')
#                     }
#                 )
                
#                 return Response({
#                     "status": "pending",
#                     "message": "Payment request sent to your phone",
#                     "transaction_id": transaction.id,
#                     "reference": transaction.reference,
#                     "checkout_request_id": response['CheckoutRequestID'],
#                     "gateway": "mpesa"
#                 })
#             else:
#                 return Response({
#                     "status": "failed",
#                     "error": response.get('errorMessage', 'Payment request failed'),
#                     "details": response
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"M-Pesa payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": str(e)},
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

#     def initiate_paypal_payment(self, client, gateway, plan):
#         """Initiate PayPal payment and return approval URL"""
#         try:
#             paypal_config = gateway.paypal_config
            
#             # Get PayPal access token
#             base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
#             auth_response = requests.post(
#                 f"{base_url}/v1/oauth2/token",
#                 auth=(paypal_config.client_id, paypal_config.secret),
#                 headers={"Accept": "application/json", "Accept-Language": "en_US"},
#                 data={"grant_type": "client_credentials"},
#                 timeout=10
#             ).json()
            
#             if 'access_token' not in auth_response:
#                 return Response({
#                     "error": "Failed to authenticate with PayPal",
#                     "details": auth_response
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             token = auth_response['access_token']
            
#             # Create PayPal order
#             order_payload = {
#                 "intent": "CAPTURE",
#                 "purchase_units": [{
#                     "amount": {
#                         "currency_code": "USD",
#                         "value": str(plan.price)
#                     },
#                     "description": f"Internet Plan: {plan.name}",
#                     "custom_id": f"CLIENT{client.id}",
#                     "invoice_id": f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}"
#                 }],
#                 "application_context": {
#                     "return_url": paypal_config.callback_url,
#                     "cancel_url": f"{paypal_config.callback_url}?cancel=true",
#                     "brand_name": "Your ISP",
#                     "user_action": "PAY_NOW"
#                 }
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             # Create order
#             response = requests.post(
#                 f"{base_url}/v2/checkout/orders",
#                 json=order_payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('status') in ['CREATED', 'APPROVED']:
#                 # Create transaction record
#                 transaction = Transaction.objects.create(
#                     client=client,
#                     gateway=gateway,
#                     plan=plan,
#                     amount=plan.price,
#                     reference=f"PAYPAL_{response['id']}",
#                     status='pending',
#                     metadata={
#                         'paypal_order_id': response['id'],
#                         'paypal_response': response
#                     }
#                 )
                
#                 # Get approval URL
#                 approve_url = next(
#                     (link['href'] for link in response['links'] if link['rel'] == 'approve'),
#                     None
#                 )
                
#                 return Response({
#                     "status": "pending",
#                     "message": "Redirect to PayPal for payment",
#                     "transaction_id": transaction.id,
#                     "reference": transaction.reference,
#                     "approve_url": approve_url,
#                     "gateway": "paypal"
#                 })
#             else:
#                 return Response({
#                     "status": "failed",
#                     "error": "Failed to create PayPal order",
#                     "details": response
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"PayPal payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def initiate_bank_payment(self, client, gateway, plan):
#         """Provide bank details for manual transfer"""
#         try:
#             bank_config = gateway.bank_config
            
#             # Create transaction record
#             transaction = Transaction.objects.create(
#                 client=client,
#                 gateway=gateway,
#                 plan=plan,
#                 amount=plan.price,
#                 reference=f"BANK_{timezone.now().strftime('%Y%m%d%H%M%S')}",
#                 status='pending',
#                 metadata={
#                     'bank_details': {
#                         'bank_name': bank_config.bank_name,
#                         'account_name': bank_config.account_name,
#                         'account_number': bank_config.account_number,
#                         'branch_code': bank_config.branch_code,
#                         'swift_code': bank_config.swift_code
#                     },
#                     'instructions': "Make payment to the provided bank account and upload proof"
#                 }
#             )
            
#             return Response({
#                 "status": "pending",
#                 "message": "Bank transfer instructions",
#                 "transaction_id": transaction.id,
#                 "reference": transaction.reference,
#                 "bank_details": transaction.metadata['bank_details'],
#                 "gateway": "bank"
#             })
#         except Exception as e:
#             logger.error(f"Bank payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class TransactionStatusView(APIView):
#     """
#     View for checking transaction status
#     Provides detailed status for any transaction
#     """
#     def get(self, request, reference):
#         """
#         Get transaction status by reference number
#         Returns complete transaction details
#         """
#         try:
#             transaction = Transaction.objects.get(reference=reference)
#             serializer = TransactionSerializer(transaction)
#             return Response(serializer.data)
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

# class ConfigurationHistoryView(APIView):
#     """
#     Tracks payment configuration changes
#     Accessible to all authenticated users
#     """
#     permission_classes = [IsAuthenticated]  # Only requirement is authentication

#     def get(self, request):
#         """
#         Get configuration history (All authenticated users)
#         """
#         try:
#             # Pagination setup
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 10)), 50)
            
#             # Filterable history (last 30 days by default)
#             history = ConfigurationHistory.objects.filter(
#                 timestamp__gte=timezone.now() - timedelta(days=30)
#             ).order_by('-timestamp')
            
#             # Apply search if provided
#             if search := request.query_params.get('search'):
#                 history = history.filter(
#                     Q(model__icontains=search) |
#                     Q(action__icontains=search) |
#                     Q(user__email__icontains=search)
#                 )
            
#             paginator = Paginator(history, page_size)
#             page_data = paginator.get_page(page)
            
#             return Response({
#                 "system": "dashboard",
#                 "history": ConfigurationHistorySerializer(page_data, many=True).data,
#                 "page": page_data.number,
#                 "total_pages": paginator.num_pages,
#                 "total_records": paginator.count
#             })
            
#         except ValueError:
#             return Response(
#                 {"error": "Invalid pagination parameters"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"History fetch failed: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve history"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
# @csrf_exempt
# def mpesa_callback(request):
#     """
#     M-Pesa payment callback handler
#     Processes STK push payment notifications
#     """
#     if request.method != 'POST':
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         data = json.loads(request.body)
#         callback = data.get('Body', {}).get('stkCallback', {})
#         result_code = callback.get('ResultCode')
#         checkout_id = callback.get('CheckoutRequestID')
        
#         if not checkout_id:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"},
#                 status=400
#             )

#         # Get transaction
#         try:
#             transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Transaction not found"},
#                 status=404
#             )
        
#         if result_code == 0:
#             # Successful payment
#             items = callback.get('CallbackMetadata', {}).get('Item', [])
#             metadata = {item['Name']: item.get('Value') for item in items}
            
#             # Update transaction
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                 'phone_number': metadata.get('PhoneNumber'),
#                 'amount': metadata.get('Amount'),
#                 'transaction_date': metadata.get('TransactionDate'),
#                 'callback_data': data
#             })
#             transaction.save()
            
#             # Activate subscription
#             plan = transaction.plan
#             client = transaction.client
            
#             # Calculate expiry based on plan
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:  # Months
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
#             # Create or update subscription
#             Subscription.objects.update_or_create(
#                 client=client,
#                 internet_plan=plan,
#                 defaults={
#                     'is_active': True,
#                     'start_date': timezone.now(),
#                     'end_date': expiry_date
#                 }
#             )
            
#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
#         else:
#             # Failed payment
#             transaction.status = 'failed'
#             transaction.metadata.update({
#                 'error': callback.get('ResultDesc', 'Payment failed'),
#                 'callback_data': data
#             })
#             transaction.save()
#             return JsonResponse(
#                 {"ResultCode": result_code, "ResultDesc": callback.get('ResultDesc', 'Payment failed')}
#             )
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"ResultCode": 1, "ResultDesc": "Invalid JSON payload"},
#             status=400
#         )
#     except Exception as e:
#         logger.error(f"M-Pesa callback processing failed: {str(e)}", exc_info=True)
#         return JsonResponse(
#             {"ResultCode": 1, "ResultDesc": f"Callback processing failed: {str(e)}"},
#             status=500
#         )

# @csrf_exempt
# def paypal_callback(request):
#     """
#     PayPal payment callback handler
#     Processes PayPal IPN notifications
#     """
#     if request.method != 'POST':
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         data = json.loads(request.body)
#         event_type = data.get('event_type')
#         resource = data.get('resource', {})
#         order_id = resource.get('id')
        
#         if not order_id:
#             return JsonResponse(
#                 {"status": "error", "message": "Missing order ID"},
#                 status=400
#             )

#         # Get transaction
#         try:
#             transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"status": "error", "message": "Transaction not found"},
#                 status=404
#             )
        
#         if event_type == 'PAYMENT.CAPTURE.COMPLETED':
#             # Successful payment
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'paypal_capture_id': resource.get('id'),
#                 'payer_email': resource.get('payer', {}).get('email_address'),
#                 'amount': resource.get('amount', {}).get('value'),
#                 'currency': resource.get('amount', {}).get('currency_code'),
#                 'callback_data': data
#             })
#             transaction.save()
            
#             # Activate subscription
#             plan = transaction.plan
#             client = transaction.client
            
#             # Calculate expiry based on plan
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:  # Months
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
#             # Create or update subscription
#             Subscription.objects.update_or_create(
#                 client=client,
#                 internet_plan=plan,
#                 defaults={
#                     'is_active': True,
#                     'start_date': timezone.now(),
#                     'end_date': expiry_date
#                 }
#             )
            
#             return JsonResponse({"status": "success", "message": "Payment completed"})
#         else:
#             # Other PayPal events
#             transaction.metadata.update({
#                 'paypal_event': event_type,
#                 'callback_data': data
#             })
#             transaction.save()
#             return JsonResponse({"status": "received", "message": f"Event {event_type} processed"})
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON payload"},
#             status=400
#         )
#     except Exception as e:
#         logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
#         return JsonResponse(
#             {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#             status=500
#         )

# @csrf_exempt
# def bank_callback(request):
#     """
#     Bank transfer callback handler
#     Processes manual bank payment confirmations
#     """
#     if request.method != 'POST':
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         data = json.loads(request.body)
#         reference = data.get('reference')
#         status = data.get('status')
#         proof_url = data.get('proof_url')
        
#         if not reference:
#             return JsonResponse(
#                 {"status": "error", "message": "Missing reference"},
#                 status=400
#             )

#         # Get transaction
#         try:
#             transaction = Transaction.objects.get(reference=reference)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"status": "error", "message": "Transaction not found"},
#                 status=404
#             )
        
#         if status == 'verified':
#             # Verified payment
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'verified_by': data.get('verified_by', 'admin'),
#                 'verified_at': timezone.now().isoformat(),
#                 'proof_url': proof_url,
#                 'callback_data': data
#             })
#             transaction.save()
            
#             # Activate subscription
#             plan = transaction.plan
#             client = transaction.client
            
#             # Calculate expiry based on plan
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:  # Months
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
#             # Create or update subscription
#             Subscription.objects.update_or_create(
#                 client=client,
#                 internet_plan=plan,
#                 defaults={
#                     'is_active': True,
#                     'start_date': timezone.now(),
#                     'end_date': expiry_date
#                 }
#             )
            
#             return JsonResponse({"status": "success", "message": "Payment verified"})
#         else:
#             # Rejected payment
#             transaction.status = 'failed'
#             transaction.metadata.update({
#                 'rejected_reason': data.get('reason', 'Payment rejected'),
#                 'rejected_by': data.get('rejected_by', 'admin'),
#                 'rejected_at': timezone.now().isoformat(),
#                 'callback_data': data
#             })
#             transaction.save()
#             return JsonResponse({"status": "failed", "message": "Payment rejected"})
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON payload"},
#             status=400
#         )
#     except Exception as e:
#         logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
#         return JsonResponse(
#             {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#             status=500
#         )
    









# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.http import HttpResponseBadRequest, JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils import timezone
# from django.db.models import Q
# from django.core.paginator import Paginator, EmptyPage
# from datetime import datetime, timedelta
# import requests
# import base64
# import json
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
#     WebhookLog
# )
# from payments.serializers.payment_config_serializer import (
#     PaymentGatewaySerializer,
#     MpesaConfigSerializer,
#     PayPalConfigSerializer,
#     BankConfigSerializer,
#     ClientPaymentMethodSerializer,
#     TransactionSerializer,
#     ConfigurationHistorySerializer,
#     WebhookSerializer
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from dotenv import load_dotenv
# from phonenumber_field.phonenumber import PhoneNumber

# load_dotenv()
# logger = logging.getLogger(__name__)

# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
# PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")

# def format_phone_number(phone):
#     """Format phone number to M-Pesa compatible format (+254...)"""
#     if not phone:
#         raise ValueError("Phone number is required")
    
#     phone = ''.join(phone.split())
#     if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
#         return phone
#     elif phone.startswith("254") and len(phone) == 12 and phone.isdigit():
#         return f"+{phone}"
#     elif phone.startswith("07") and len(phone) == 10 and phone.isdigit():
#         return f"+254{phone[2:]}"
#     elif phone.startswith("0") and len(phone) == 10 and phone.isdigit():
#         return f"+254{phone[1:]}"
#     else:
#         raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX.")

# class PaymentGatewayView(APIView):
#     """
#     Main view for managing payment gateways configuration
#     Handles CRUD operations for all gateway types
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get all payment gateways with their configurations
#         Returns:
#          - List of gateways with their configs
#          - Configuration history
#          - System-wide settings
#         """
#         try:
#             # Get all gateways with their configurations
#             gateways = PaymentGateway.objects.all().prefetch_related(
#                 'mpesaconfig', 'paypalconfig', 'bankconfig'
#             )
#             serializer = PaymentGatewaySerializer(gateways, many=True)
            
#             # Get configuration history (last 10 entries)
#             history = ConfigurationHistory.objects.all().order_by('-timestamp')[:10]
#             history_serializer = ConfigurationHistorySerializer(history, many=True)
            
#             # Build base URL for callbacks
#             base_url = request.build_absolute_uri('/')[:-1]  # Remove trailing slash
            
#             return Response({
#                 "gateways": serializer.data,
#                 "history": history_serializer.data,
#                 "configuration": {
#                     "mpesa_callback_url": f"{base_url}/api/payments/callback/mpesa/",
#                     "paypal_callback_url": f"{base_url}/api/payments/callback/paypal/",
#                     "bank_callback_url": f"{base_url}/api/payments/callback/bank/"
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
#         Handles creation of gateway and its specific configuration
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
#         Handles updates for both gateway and its specific configuration
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
#         Ensures at least one gateway remains active
#         """
#         try:
#             # Prevent deletion if it's the last gateway
#             active_gateways = PaymentGateway.objects.filter(is_active=True)
#             if active_gateways.count() <= 1 and active_gateways.filter(id=gateway_id).exists():
#                 return Response(
#                     {"error": "Cannot delete the last active payment gateway"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             method = gateway.name
#             gateway.delete()

#             # Log deletion
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

# class WebhookConfigurationView(APIView):
#     """
#     Handles webhook configuration and secret generation
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """
#         Generate webhook secret and callback URL
#         """
#         serializer = WebhookSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             result = serializer.generate_secret()
#             return Response(result)
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to generate webhook secret: {str(e)}")
#             return Response(
#                 {"error": "Webhook configuration failed", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class TestConnectionView(APIView):
#     """
#     View for testing payment gateway connections
#     Performs live tests with payment providers
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, gateway_id):
#         """
#         Test connection to a specific payment gateway
#         Returns detailed connection status and response
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             if gateway.name in ['mpesa_paybill', 'mpesa_till']:
#                 return self.test_mpesa_connection(gateway.mpesaconfig, gateway.sandbox_mode, gateway.security_level)
#             elif gateway.name == 'paypal':
#                 return self.test_paypal_connection(gateway.paypalconfig, gateway.sandbox_mode, gateway.security_level)
#             elif gateway.name == 'bank_transfer':
#                 return Response({
#                     "success": True,
#                     "message": "Bank connection cannot be tested automatically",
#                     "status": "manual_verification_required",
#                     "security": {
#                         "level": gateway.security_level,
#                         "recommendations": [
#                             "Verify account details manually",
#                             "Confirm transaction limits with bank"
#                         ]
#                     }
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

#     def test_mpesa_connection(self, config, sandbox_mode, security_level):
#         """Test M-Pesa API connection by generating an access token"""
#         try:
#             # Generate M-Pesa access token
#             credentials = f"{config.consumer_key}:{config.consumer_secret}"
#             encoded = base64.b64encode(credentials.encode()).decode()
            
#             base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.get(
#                 f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
#                 headers={"Authorization": f"Basic {encoded}"},
#                 timeout=10
#             )
            
#             if response.status_code == 200:
#                 data = response.json()
#                 if 'access_token' in data:
#                     return Response({
#                         "success": True,
#                         "message": "M-Pesa connection successful",
#                         "status": "connected",
#                         "details": {
#                             "token_validity": data.get('expires_in', 0),
#                             "environment": "sandbox" if sandbox_mode else "production"
#                         },
#                         "security": {
#                             "level": security_level,
#                             "recommendations": self.get_mpesa_security_recommendations(security_level)
#                         }
#                     })
#                 else:
#                     return Response({
#                         "success": False,
#                         "message": data.get('errorMessage', 'Authentication failed'),
#                         "status": "authentication_failed",
#                         "details": data
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 return Response({
#                     "success": False,
#                     "message": "Failed to connect to M-Pesa API",
#                     "status": "connection_failed",
#                     "details": response.json()
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except requests.exceptions.RequestException as e:
#             logger.error(f"M-Pesa connection error: {str(e)}")
#             return Response({
#                 "success": False,
#                 "message": "Network error connecting to M-Pesa",
#                 "status": "network_error",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def test_paypal_connection(self, config, sandbox_mode, security_level):
#         """Test PayPal API connection by generating an access token"""
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
#                 data = response.json()
#                 return Response({
#                     "success": True,
#                     "message": "PayPal connection successful",
#                     "status": "connected",
#                     "details": {
#                         "token_validity": data.get('expires_in', 0),
#                         "environment": "sandbox" if sandbox_mode else "production"
#                     },
#                     "security": {
#                         "level": security_level,
#                         "recommendations": self.get_paypal_security_recommendations(security_level)
#                     }
#                 })
#             else:
#                 error = response.json()
#                 return Response({
#                     "success": False,
#                     "message": error.get('error_description', 'PayPal authentication failed'),
#                     "status": "authentication_failed",
#                     "details": error
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except requests.exceptions.RequestException as e:
#             logger.error(f"PayPal connection error: {str(e)}")
#             return Response({
#                 "success": False,
#                 "message": "Network error connecting to PayPal",
#                 "status": "network_error",
#                 "details": str(e)
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def get_mpesa_security_recommendations(self, security_level):
#         recommendations = [
#             "Rotate API keys every 90 days",
#             "Enable IP whitelisting",
#             "Monitor transaction limits"
#         ]
#         if security_level in ['low', 'medium']:
#             recommendations.append("Consider increasing security level to 'high'")
#         return recommendations

#     def get_paypal_security_recommendations(self, security_level):
#         recommendations = [
#             "Enable two-factor authentication",
#             "Restrict IP access to PayPal endpoints",
#             "Monitor for suspicious activity"
#         ]
#         if security_level in ['low', 'medium']:
#             recommendations.append("Consider increasing security level to 'high'")
#         return recommendations

# class ClientPaymentMethodsView(APIView):
#     """
#     Handles payment methods for:
#     - Authenticated dashboard users: Manage ALL payment methods
#     - Captive portal clients: View active methods via phone number
#     """
    
#     def get_permissions(self):
#         """
#         Only require authentication for POST/PUT/DELETE (dashboard actions)
#         Allow unauthenticated GET for captive portal
#         """
#         if self.request.method == 'GET':
#             return []
#         return [IsAuthenticated()]

#     def get(self, request):
#         """
#         GET endpoint behavior:
#         - Authenticated: Returns all payment methods (dashboard management)
#         - Unauthenticated + phone: Returns active methods for captive portal
#         """
#         try:
#             # Dashboard User Flow
#             if request.user.is_authenticated:
#                 gateways = PaymentGateway.objects.all().prefetch_related(
#                     'mpesaconfig', 'paypalconfig', 'bankconfig'
#                 )
#                 serializer = PaymentGatewaySerializer(gateways, many=True)
#                 return Response({
#                     "system": "dashboard",
#                     "gateways": serializer.data
#                 })
            
#             # Captive Portal Client Flow
#             phone = request.query_params.get('phone')
#             if not phone:
#                 return Response(
#                     {"error": "Phone number is required for client access"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             try:
#                 phone = format_phone_number(phone)
#                 client, _ = Client.objects.get_or_create(
#                     user__phone_number=phone,
#                     defaults={'user__full_name': "Internet Customer"}
#                 )
                
#                 active_methods = PaymentGateway.objects.filter(
#                     is_active=True
#                 ).prefetch_related(
#                     'mpesaconfig', 'paypalconfig', 'bankconfig'
#                 )
                
#                 serializer = PaymentGatewaySerializer(active_methods, many=True)
#                 return Response({
#                     "system": "captive_portal",
#                     "client_id": client.id,
#                     "methods": serializer.data
#                 })
                
#             except ValueError as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Payment methods retrieval failed: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve payment methods"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         CREATE new payment method (Dashboard only)
#         Requires:
#         - gateway_id: ID of payment gateway to enable
#         """
#         try:
#             gateway_id = request.data.get('gateway_id')
#             if not gateway_id:
#                 return Response(
#                     {"error": "gateway_id is required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             # Create global activation (not client-specific)
#             gateway.is_active = True
#             gateway.save()
            
#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="activate",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=["Activated payment gateway"],
#                 new_values={"is_active": True},
#                 user=request.user
#             )
            
#             return Response(
#                 PaymentGatewaySerializer(gateway).data,
#                 status=status.HTTP_201_CREATED
#             )
            
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to activate payment method: {str(e)}")
#             return Response(
#                 {"error": "Payment method activation failed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def put(self, request, gateway_id):
#         """
#         UPDATE payment method configuration (Dashboard only)
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
#             serializer = PaymentGatewaySerializer(gateway, data=request.data, partial=True)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
#             gateway = serializer.save()
            
#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="update",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=list(request.data.keys()),
#                 new_values=request.data,
#                 user=request.user
#             )
            
#             return Response(serializer.data)
            
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to update payment gateway: {str(e)}")
#             return Response(
#                 {"error": "Payment gateway update failed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def delete(self, request, gateway_id):
#         """
#         DEACTIVATE payment method (Dashboard only)
#         """
#         try:
#             gateway = PaymentGateway.objects.get(id=gateway_id)
            
#             # Don't allow deactivating if it's the last active method
#             if PaymentGateway.objects.filter(is_active=True).count() <= 1:
#                 return Response(
#                     {"error": "Cannot deactivate the last payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
                
#             gateway.is_active = False
#             gateway.save()
            
#             # Log configuration change
#             ConfigurationHistory.objects.create(
#                 action="deactivate",
#                 model="PaymentGateway",
#                 object_id=gateway.id,
#                 changes=["Deactivated payment gateway"],
#                 new_values={"is_active": False},
#                 user=request.user
#             )
            
#             return Response(status=status.HTTP_204_NO_CONTENT)
            
#         except PaymentGateway.DoesNotExist:
#             return Response(
#                 {"error": "Payment gateway not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Failed to deactivate payment method: {str(e)}")
#             return Response(
#                 {"error": "Payment method deactivation failed"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class InitiatePaymentView(APIView):
#     """
#     View for initiating payments through different gateways
#     Handles payment initiation for M-Pesa, PayPal and Bank transfers
#     """
#     def post(self, request):
#         """
#         Initiate a payment based on the selected gateway
#         Validates all required fields before processing
#         """
#         try:
#             # Common required fields
#             gateway_id = request.data.get('gateway_id')
#             amount = request.data.get('amount')
#             plan_id = request.data.get('plan_id')
            
#             if not all([gateway_id, amount, plan_id]):
#                 return Response(
#                     {"error": "Missing required fields: gateway_id, amount, plan_id"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Get client based on authentication
#             if request.user.is_authenticated:
#                 try:
#                     client = Client.objects.get(user=request.user)
#                 except Client.DoesNotExist:
#                     return Response(
#                         {"error": "Client profile not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#             else:
#                 phone = request.data.get('phone_number')
#                 if not phone:
#                     return Response(
#                         {"error": "Phone number is required for unauthenticated payments"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
#                 try:
#                     phone = format_phone_number(phone)
#                     client = Client.objects.get(user__phone_number=phone)
#                 except ValueError as e:
#                     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#                 except Client.DoesNotExist:
#                     return Response(
#                         {"error": "Client not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )

#             # Get gateway and plan
#             try:
#                 gateway = PaymentGateway.objects.get(id=gateway_id, is_active=True)
#                 plan = InternetPlan.objects.get(id=plan_id)
#             except PaymentGateway.DoesNotExist:
#                 return Response(
#                     {"error": "Payment gateway not found or inactive"},
#                     status=status.HTTP_404_NOT_FOUND
#             )
#             except InternetPlan.DoesNotExist:
#                 return Response(
#                     {"error": "Internet plan not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )

#             # Verify client has access to this payment method
#             if not ClientPaymentMethod.objects.filter(
#                 client=client, 
#                 gateway=gateway, 
#                 is_active=True
#             ).exists():
#                 return Response(
#                     {"error": "Payment method not available for this client"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

#             # Gateway-specific payment initiation
#             if gateway.name in ['mpesa_paybill', 'mpesa_till']:
#                 return self.initiate_mpesa_payment(request, client, gateway, plan)
#             elif gateway.name == 'paypal':
#                 return self.initiate_paypal_payment(client, gateway, plan)
#             elif gateway.name == 'bank_transfer':
#                 return self.initiate_bank_payment(client, gateway, plan)
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

#     def initiate_mpesa_payment(self, request, client, gateway, plan):
#         """
#         Initiate M-Pesa STK push payment
#         Handles both paybill and till numbers
#         """
#         try:
#             phone = request.data.get('phone_number')
#             if not phone:
#                 return Response(
#                     {"error": "Phone number is required for M-Pesa"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Format phone number using the utility function
#             try:
#                 phone = format_phone_number(phone)
#             except ValueError as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get M-Pesa config
#             mpesa_config = gateway.mpesaconfig
            
#             # Generate access token
#             token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
#             if not token:
#                 return Response(
#                     {"error": "Failed to authenticate with M-Pesa"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             # Prepare STK push request
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             business_short_code = mpesa_config.paybill_number or mpesa_config.till_number
#             passkey = mpesa_config.passkey
            
#             password = base64.b64encode(
#                 (business_short_code + passkey + timestamp).encode()
#             ).decode()
            
#             # Determine transaction type based on configuration
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
#                 "Amount": str(plan.price),
#                 "PartyA": phone,
#                 "PartyB": party_b,
#                 "PhoneNumber": phone,
#                 "CallBackURL": mpesa_config.callback_url,
#                 "AccountReference": f"CLIENT{client.id}",
#                 "TransactionDesc": f"Internet Plan: {plan.name}"
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             # Determine API endpoint based on sandbox mode
#             base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
#             # Make STK push request
#             response = requests.post(
#                 f"{base_url}/mpesa/stkpush/v1/processrequest",
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             # Handle response
#             if response.get('ResponseCode') == '0':
#                 # Create transaction record
#                 transaction = Transaction.objects.create(
#                     client=client,
#                     gateway=gateway,
#                     plan=plan,
#                     amount=plan.price,
#                     reference=f"MPESA_{timestamp}_{client.id}",
#                     status='pending',
#                     metadata={
#                         'checkout_request_id': response['CheckoutRequestID'],
#                         'phone_number': phone,
#                         'mpesa_request': payload,
#                         'mpesa_response': response,
#                         'user_agent': request.META.get('HTTP_USER_AGENT', ''),
#                         'ip_address': request.META.get('REMOTE_ADDR', '')
#                     }
#                 )
                
#                 return Response({
#                     "status": "pending",
#                     "message": "Payment request sent to your phone",
#                     "transaction_id": transaction.id,
#                     "reference": transaction.reference,
#                     "checkout_request_id": response['CheckoutRequestID'],
#                     "gateway": "mpesa"
#                 })
#             else:
#                 return Response({
#                     "status": "failed",
#                     "error": response.get('errorMessage', 'Payment request failed'),
#                     "details": response
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"M-Pesa payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": str(e)},
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

#     def initiate_paypal_payment(self, client, gateway, plan):
#         """Initiate PayPal payment and return approval URL"""
#         try:
#             paypal_config = gateway.paypalconfig
            
#             # Get PayPal access token
#             base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
#             auth_response = requests.post(
#                 f"{base_url}/v1/oauth2/token",
#                 auth=(paypal_config.client_id, paypal_config.secret),
#                 headers={"Accept": "application/json", "Accept-Language": "en_US"},
#                 data={"grant_type": "client_credentials"},
#                 timeout=10
#             ).json()
            
#             if 'access_token' not in auth_response:
#                 return Response({
#                     "error": "Failed to authenticate with PayPal",
#                     "details": auth_response
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             token = auth_response['access_token']
            
#             # Create PayPal order
#             order_payload = {
#                 "intent": "CAPTURE",
#                 "purchase_units": [{
#                     "amount": {
#                         "currency_code": "USD",
#                         "value": str(plan.price)
#                     },
#                     "description": f"Internet Plan: {plan.name}",
#                     "custom_id": f"CLIENT{client.id}",
#                     "invoice_id": f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}"
#                 }],
#                 "application_context": {
#                     "return_url": paypal_config.callback_url,
#                     "cancel_url": f"{paypal_config.callback_url}?cancel=true",
#                     "brand_name": "Your ISP",
#                     "user_action": "PAY_NOW"
#                 }
#             }
            
#             headers = {
#                 "Authorization": f"Bearer {token}",
#                 "Content-Type": "application/json"
#             }
            
#             # Create order
#             response = requests.post(
#                 f"{base_url}/v2/checkout/orders",
#                 json=order_payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('status') in ['CREATED', 'APPROVED']:
#                 # Create transaction record
#                 transaction = Transaction.objects.create(
#                     client=client,
#                     gateway=gateway,
#                     plan=plan,
#                     amount=plan.price,
#                     reference=f"PAYPAL_{response['id']}",
#                     status='pending',
#                     metadata={
#                         'paypal_order_id': response['id'],
#                         'paypal_response': response
#                     }
#                 )
                
#                 # Get approval URL
#                 approve_url = next(
#                     (link['href'] for link in response['links'] if link['rel'] == 'approve'),
#                     None
#                 )
                
#                 return Response({
#                     "status": "pending",
#                     "message": "Redirect to PayPal for payment",
#                     "transaction_id": transaction.id,
#                     "reference": transaction.reference,
#                     "approve_url": approve_url,
#                     "gateway": "paypal"
#                 })
#             else:
#                 return Response({
#                     "status": "failed",
#                     "error": "Failed to create PayPal order",
#                     "details": response
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"PayPal payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def initiate_bank_payment(self, client, gateway, plan):
#         """Provide bank details for manual transfer"""
#         try:
#             bank_config = gateway.bankconfig
            
#             # Create transaction record
#             transaction = Transaction.objects.create(
#                 client=client,
#                 gateway=gateway,
#                 plan=plan,
#                 amount=plan.price,
#                 reference=f"BANK_{timezone.now().strftime('%Y%m%d%H%M%S')}",
#                 status='pending',
#                 metadata={
#                     'bank_details': {
#                         'bank_name': bank_config.bank_name,
#                         'account_name': bank_config.account_name,
#                         'account_number': bank_config.account_number,
#                         'branch_code': bank_config.branch_code,
#                         'swift_code': bank_config.swift_code
#                     },
#                     'instructions': "Make payment to the provided bank account and upload proof"
#                 }
#             )
            
#             return Response({
#                 "status": "pending",
#                 "message": "Bank transfer instructions",
#                 "transaction_id": transaction.id,
#                 "reference": transaction.reference,
#                 "bank_details": transaction.metadata['bank_details'],
#                 "gateway": "bank"
#             })
#         except Exception as e:
#             logger.error(f"Bank payment initiation failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class TransactionStatusView(APIView):
#     """
#     View for checking transaction status
#     Provides detailed status for any transaction
#     """
#     def get(self, request, reference):
#         """
#         Get transaction status by reference number
#         Returns complete transaction details
#         """
#         try:
#             transaction = Transaction.objects.get(reference=reference)
#             serializer = TransactionSerializer(transaction)
#             return Response(serializer.data)
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

# class ConfigurationHistoryView(APIView):
#     """
#     Tracks payment configuration changes
#     Accessible to all authenticated users
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Get configuration history (All authenticated users)
#         """
#         try:
#             # Pagination setup
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 10)), 50)
            
#             # Filterable history (last 30 days by default)
#             history = ConfigurationHistory.objects.filter(
#                 timestamp__gte=timezone.now() - timedelta(days=30)
#             ).order_by('-timestamp')
            
#             # Apply search if provided
#             if search := request.query_params.get('search'):
#                 history = history.filter(
#                     Q(model__icontains=search) |
#                     Q(action__icontains=search) |
#                     Q(user__email__icontains=search)
#                 )
            
#             paginator = Paginator(history, page_size)
#             page_data = paginator.get_page(page)
            
#             return Response({
#                 "system": "dashboard",
#                 "history": ConfigurationHistorySerializer(page_data, many=True).data,
#                 "page": page_data.number,
#                 "total_pages": paginator.num_pages,
#                 "total_records": paginator.count
#             })
            
#         except ValueError:
#             return Response(
#                 {"error": "Invalid pagination parameters"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"History fetch failed: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve history"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# @csrf_exempt
# def mpesa_callback(request):
#     """
#     M-Pesa payment callback handler
#     Processes STK push payment notifications
#     """
#     if request.method != 'POST':
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         data = json.loads(request.body)
#         callback = data.get('Body', {}).get('stkCallback', {})
#         result_code = callback.get('ResultCode')
#         checkout_id = callback.get('CheckoutRequestID')
        
#         if not checkout_id:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"},
#                 status=400
#             )

#         # Get transaction
#         try:
#             transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Transaction not found"},
#                 status=404
#             )
        
#         if result_code == 0:
#             # Successful payment
#             items = callback.get('CallbackMetadata', {}).get('Item', [])
#             metadata = {item['Name']: item.get('Value') for item in items}
            
#             # Update transaction
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                 'phone_number': metadata.get('PhoneNumber'),
#                 'amount': metadata.get('Amount'),
#                 'transaction_date': metadata.get('TransactionDate'),
#                 'callback_data': data
#             })
#             transaction.save()
            
#             # Activate subscription
#             plan = transaction.plan
#             client = transaction.client
            
#             # Calculate expiry based on plan
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:  # Months
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
#             # Create or update subscription
#             Subscription.objects.update_or_create(
#                 client=client,
#                 internet_plan=plan,
#                 defaults={
#                     'is_active': True,
#                     'start_date': timezone.now(),
#                     'end_date': expiry_date
#                 }
#             )
            
#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
#         else:
#             # Failed payment
#             transaction.status = 'failed'
#             transaction.metadata.update({
#                 'error': callback.get('ResultDesc', 'Payment failed'),
#                 'callback_data': data
#             })
#             transaction.save()
#             return JsonResponse(
#                 {"ResultCode": result_code, "ResultDesc": callback.get('ResultDesc', 'Payment failed')}
#             )
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"ResultCode": 1, "ResultDesc": "Invalid JSON payload"},
#             status=400
#         )
#     except Exception as e:
#         logger.error(f"M-Pesa callback processing failed: {str(e)}", exc_info=True)
#         return JsonResponse(
#             {"ResultCode": 1, "ResultDesc": f"Callback processing failed: {str(e)}"},
#             status=500
#         )

# @csrf_exempt
# def paypal_callback(request):
#     """
#     PayPal payment callback handler
#     Processes PayPal IPN notifications
#     """
#     if request.method != 'POST':
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         data = json.loads(request.body)
#         event_type = data.get('event_type')
#         resource = data.get('resource', {})
#         order_id = resource.get('id')
        
#         if not order_id:
#             return JsonResponse(
#                 {"status": "error", "message": "Missing order ID"},
#                 status=400
#             )

#         # Get transaction
#         try:
#             transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"status": "error", "message": "Transaction not found"},
#                 status=404
#             )
        
#         if event_type == 'PAYMENT.CAPTURE.COMPLETED':
#             # Successful payment
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'paypal_capture_id': resource.get('id'),
#                 'payer_email': resource.get('payer', {}).get('email_address'),
#                 'amount': resource.get('amount', {}).get('value'),
#                 'currency': resource.get('amount', {}).get('currency_code'),
#                 'callback_data': data
#             })
#             transaction.save()
            
#             # Activate subscription
#             plan = transaction.plan
#             client = transaction.client
            
#             # Calculate expiry based on plan
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:  # Months
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
#             # Create or update subscription
#             Subscription.objects.update_or_create(
#                 client=client,
#                 internet_plan=plan,
#                 defaults={
#                     'is_active': True,
#                     'start_date': timezone.now(),
#                     'end_date': expiry_date
#                 }
#             )
            
#             return JsonResponse({"status": "success", "message": "Payment completed"})
#         else:
#             # Other PayPal events
#             transaction.metadata.update({
#                 'paypal_event': event_type,
#                 'callback_data': data
#             })
#             transaction.save()
#             return JsonResponse({"status": "received", "message": f"Event {event_type} processed"})
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON payload"},
#             status=400
#         )
#     except Exception as e:
#         logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
#         return JsonResponse(
#             {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#             status=500
#         )

# @csrf_exempt
# def bank_callback(request):
#     """
#     Bank transfer callback handler
#     Processes manual bank payment confirmations
#     """
#     if request.method != 'POST':
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         data = json.loads(request.body)
#         reference = data.get('reference')
#         status = data.get('status')
#         proof_url = data.get('proof_url')
        
#         if not reference:
#             return JsonResponse(
#                 {"status": "error", "message": "Missing reference"},
#                 status=400
#             )

#         # Get transaction
#         try:
#             transaction = Transaction.objects.get(reference=reference)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"status": "error", "message": "Transaction not found"},
#                 status=404
#             )
        
#         if status == 'verified':
#             # Verified payment
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'verified_by': data.get('verified_by', 'admin'),
#                 'verified_at': timezone.now().isoformat(),
#                 'proof_url': proof_url,
#                 'callback_data': data
#             })
#             transaction.save()
            
#             # Activate subscription
#             plan = transaction.plan
#             client = transaction.client
            
#             # Calculate expiry based on plan
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:  # Months
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
#             # Create or update subscription
#             Subscription.objects.update_or_create(
#                 client=client,
#                 internet_plan=plan,
#                 defaults={
#                     'is_active': True,
#                     'start_date': timezone.now(),
#                     'end_date': expiry_date
#                 }
#             )
            
#             return JsonResponse({"status": "success", "message": "Payment verified"})
#         else:
#             # Rejected payment
#             transaction.status = 'failed'
#             transaction.metadata.update({
#                 'rejected_reason': data.get('reason', 'Payment rejected'),
#                 'rejected_by': data.get('rejected_by', 'admin'),
#                 'rejected_at': timezone.now().isoformat(),
#                 'callback_data': data
#             })
#             transaction.save()
#             return JsonResponse({"status": "failed", "message": "Payment rejected"})
#     except json.JSONDecodeError:
#         return JsonResponse(
#             {"status": "error", "message": "Invalid JSON payload"},
#             status=400
#         )
#     except Exception as e:
#         logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
#         return JsonResponse(
#             {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#             status=500
#         )








from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage
from datetime import datetime, timedelta
import requests
import base64
import json
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
    WebhookLog
)
from payments.serializers.payment_config_serializer import (
    PaymentGatewaySerializer,
    MpesaConfigSerializer,
    PayPalConfigSerializer,
    BankConfigSerializer,
    ClientPaymentMethodSerializer,
    TransactionSerializer,
    ConfigurationHistorySerializer,
    WebhookSerializer
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from dotenv import load_dotenv
from phonenumber_field.phonenumber import PhoneNumber

load_dotenv()
logger = logging.getLogger(__name__)

MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")

def format_phone_number(phone):
    """Format phone number to M-Pesa compatible format (+254...)"""
    if not phone:
        raise ValueError("Phone number is required")
    
    phone = ''.join(phone.split())
    if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
        return phone
    elif phone.startswith("254") and len(phone) == 12 and phone.isdigit():
        return f"+{phone}"
    elif phone.startswith("07") and len(phone) == 10 and phone.isdigit():
        return f"+254{phone[2:]}"
    elif phone.startswith("0") and len(phone) == 10 and phone.isdigit():
        return f"+254{phone[1:]}"
    else:
        raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX.")

class PaymentGatewayView(APIView):
    """
    Main view for managing payment gateways configuration
    Handles CRUD operations for all gateway types
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get all payment gateways with their configurations
        Returns:
         - List of gateways with their configs
         - Configuration history
         - System-wide settings
        """
        try:
            # Get all gateways with their configurations
            gateways = PaymentGateway.objects.all().prefetch_related(
                'mpesaconfig', 'paypalconfig', 'bankconfig'
            )
            serializer = PaymentGatewaySerializer(gateways, many=True)
            
            # Get configuration history (last 10 entries)
            history = ConfigurationHistory.objects.all().order_by('-timestamp')[:10]
            history_serializer = ConfigurationHistorySerializer(history, many=True)
            
            # Build base URL for callbacks
            base_url = request.build_absolute_uri('/')[:-1]  # Remove trailing slash
            
            return Response({
                "gateways": serializer.data,
                "history": history_serializer.data,
                "configuration": {
                    "mpesa_callback_url": f"{base_url}/api/payments/callback/mpesa/",
                    "paypal_callback_url": f"{base_url}/api/payments/callback/paypal/",
                    "bank_callback_url": f"{base_url}/api/payments/callback/bank/"
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
        Handles creation of gateway and its specific configuration
        """
        try:
            serializer = PaymentGatewaySerializer(data=request.data, context={'request': request})
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            gateway = serializer.save()
            return Response(
                PaymentGatewaySerializer(gateway).data,
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
        Handles updates for both gateway and its specific configuration
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
            return Response(PaymentGatewaySerializer(gateway).data)
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
        Ensures at least one gateway remains active
        """
        try:
            # Prevent deletion if it's the last gateway
            active_gateways = PaymentGateway.objects.filter(is_active=True)
            if active_gateways.count() <= 1 and active_gateways.filter(id=gateway_id).exists():
                return Response(
                    {"error": "Cannot delete the last active payment gateway"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            gateway = PaymentGateway.objects.get(id=gateway_id)
            method = gateway.name
            gateway.delete()

            # Log deletion
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

class WebhookConfigurationView(APIView):
    """
    Handles webhook configuration and secret generation
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Generate webhook secret and callback URL
        """
        serializer = WebhookSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = serializer.generate_secret()
            return Response(result)
        except PaymentGateway.DoesNotExist:
            return Response(
                {"error": "Payment gateway not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to generate webhook secret: {str(e)}")
            return Response(
                {"error": "Webhook configuration failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class TestConnectionView(APIView):
    """
    View for testing payment gateway connections
    Performs live tests with payment providers
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, gateway_id):
        """
        Test connection to a specific payment gateway
        Returns detailed connection status and response
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            
            if gateway.name in ['mpesa_paybill', 'mpesa_till']:
                return self.test_mpesa_connection(gateway.mpesaconfig, gateway.sandbox_mode, gateway.security_level)
            elif gateway.name == 'paypal':
                return self.test_paypal_connection(gateway.paypalconfig, gateway.sandbox_mode, gateway.security_level)
            elif gateway.name == 'bank_transfer':
                return Response({
                    "success": True,
                    "message": "Bank connection cannot be tested automatically",
                    "status": "manual_verification_required",
                    "security": {
                        "level": gateway.security_level,
                        "recommendations": [
                            "Verify account details manually",
                            "Confirm transaction limits with bank"
                        ]
                    }
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

    def test_mpesa_connection(self, config, sandbox_mode, security_level):
        """Test M-Pesa API connection by generating an access token"""
        try:
            # Generate M-Pesa access token
            credentials = f"{config.consumer_key}:{config.consumer_secret}"
            encoded = base64.b64encode(credentials.encode()).decode()
            
            base_url = "https://sandbox.safaricom.co.ke" if sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.get(
                f"{base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {encoded}"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    return Response({
                        "success": True,
                        "message": "M-Pesa connection successful",
                        "status": "connected",
                        "details": {
                            "token_validity": data.get('expires_in', 0),
                            "environment": "sandbox" if sandbox_mode else "production"
                        },
                        "security": {
                            "level": security_level,
                            "recommendations": self.get_mpesa_security_recommendations(security_level)
                        }
                    })
                else:
                    return Response({
                        "success": False,
                        "message": data.get('errorMessage', 'Authentication failed'),
                        "status": "authentication_failed",
                        "details": data
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "success": False,
                    "message": "Failed to connect to M-Pesa API",
                    "status": "connection_failed",
                    "details": response.json()
                }, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa connection error: {str(e)}")
            return Response({
                "success": False,
                "message": "Network error connecting to M-Pesa",
                "status": "network_error",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def test_paypal_connection(self, config, sandbox_mode, security_level):
        """Test PayPal API connection by generating an access token"""
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
                data = response.json()
                return Response({
                    "success": True,
                    "message": "PayPal connection successful",
                    "status": "connected",
                    "details": {
                        "token_validity": data.get('expires_in', 0),
                        "environment": "sandbox" if sandbox_mode else "production"
                    },
                    "security": {
                        "level": security_level,
                        "recommendations": self.get_paypal_security_recommendations(security_level)
                    }
                })
            else:
                error = response.json()
                return Response({
                    "success": False,
                    "message": error.get('error_description', 'PayPal authentication failed'),
                    "status": "authentication_failed",
                    "details": error
                }, status=status.HTTP_400_BAD_REQUEST)
        except requests.exceptions.RequestException as e:
            logger.error(f"PayPal connection error: {str(e)}")
            return Response({
                "success": False,
                "message": "Network error connecting to PayPal",
                "status": "network_error",
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def get_mpesa_security_recommendations(self, security_level):
        recommendations = [
            "Rotate API keys every 90 days",
            "Enable IP whitelisting",
            "Monitor transaction limits"
        ]
        if security_level in ['low', 'medium']:
            recommendations.append("Consider increasing security level to 'high'")
        return recommendations

    def get_paypal_security_recommendations(self, security_level):
        recommendations = [
            "Enable two-factor authentication",
            "Restrict IP access to PayPal endpoints",
            "Monitor for suspicious activity"
        ]
        if security_level in ['low', 'medium']:
            recommendations.append("Consider increasing security level to 'high'")
        return recommendations

class ClientPaymentMethodsView(APIView):
    """
    Handles payment methods for:
    - Authenticated dashboard users: Manage ALL payment methods
    - Captive portal clients: View active methods via phone number
    """
    
    def get_permissions(self):
        """
        Only require authentication for POST/PUT/DELETE (dashboard actions)
        Allow unauthenticated GET for captive portal
        """
        if self.request.method == 'GET':
            return []
        return [IsAuthenticated()]

    def get(self, request):
        """
        GET endpoint behavior:
        - Authenticated: Returns all payment methods (dashboard management)
        - Unauthenticated + phone: Returns active methods for captive portal
        """
        try:
            # Dashboard User Flow
            if request.user.is_authenticated:
                gateways = PaymentGateway.objects.all().prefetch_related(
                    'mpesaconfig', 'paypalconfig', 'bankconfig'
                )
                serializer = PaymentGatewaySerializer(gateways, many=True)
                return Response({
                    "system": "dashboard",
                    "gateways": serializer.data
                })
            
            # Captive Portal Client Flow
            phone = request.query_params.get('phone')
            if not phone:
                return Response(
                    {"error": "Phone number is required for client access"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                phone = format_phone_number(phone)
                
                # Get or create client by phone number only (no name needed)
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                if User.objects.filter(phone_number=phone).exists():
                    user = User.objects.get(phone_number=phone)
                    client, created = Client.objects.get_or_create(user=user)
                else:
                    # Create user with just phone number (no name)
                    user = User.objects.create_user(
                        phone_number=phone,
                        user_type='client'
                    )
                    client = Client.objects.create(user=user)
                
                active_methods = PaymentGateway.objects.filter(
                    is_active=True
                ).prefetch_related(
                    'mpesaconfig', 'paypalconfig', 'bankconfig'
                )
                
                serializer = PaymentGatewaySerializer(active_methods, many=True)
                return Response({
                    "system": "captive_portal",
                    "client_id": client.id,
                    "methods": serializer.data
                })
                
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Payment methods retrieval failed: {str(e)}")
            return Response(
                {"error": "Failed to retrieve payment methods"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        CREATE new payment method (Dashboard only)
        Requires:
        - gateway_id: ID of payment gateway to enable
        """
        try:
            gateway_id = request.data.get('gateway_id')
            if not gateway_id:
                return Response(
                    {"error": "gateway_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            gateway = PaymentGateway.objects.get(id=gateway_id)
            
            # Create global activation (not client-specific)
            gateway.is_active = True
            gateway.save()
            
            # Log configuration change
            ConfigurationHistory.objects.create(
                action="activate",
                model="PaymentGateway",
                object_id=gateway.id,
                changes=["Activated payment gateway"],
                new_values={"is_active": True},
                user=request.user
            )
            
            return Response(
                PaymentGatewaySerializer(gateway).data,
                status=status.HTTP_201_CREATED
            )
            
        except PaymentGateway.DoesNotExist:
            return Response(
                {"error": "Payment gateway not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to activate payment method: {str(e)}")
            return Response(
                {"error": "Payment method activation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def put(self, request, gateway_id):
        """
        UPDATE payment method configuration (Dashboard only)
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            serializer = PaymentGatewaySerializer(gateway, data=request.data, partial=True)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            gateway = serializer.save()
            
            # Log configuration change
            ConfigurationHistory.objects.create(
                action="update",
                model="PaymentGateway",
                object_id=gateway.id,
                changes=list(request.data.keys()),
                new_values=request.data,
                user=request.user
            )
            
            return Response(serializer.data)
            
        except PaymentGateway.DoesNotExist:
            return Response(
                {"error": "Payment gateway not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to update payment gateway: {str(e)}")
            return Response(
                {"error": "Payment gateway update failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def delete(self, request, gateway_id):
        """
        DEACTIVATE payment method (Dashboard only)
        """
        try:
            gateway = PaymentGateway.objects.get(id=gateway_id)
            
            # Don't allow deactivating if it's the last active method
            if PaymentGateway.objects.filter(is_active=True).count() <= 1:
                return Response(
                    {"error": "Cannot deactivate the last payment method"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            gateway.is_active = False
            gateway.save()
            
            # Log configuration change
            ConfigurationHistory.objects.create(
                action="deactivate",
                model="PaymentGateway",
                object_id=gateway.id,
                changes=["Deactivated payment gateway"],
                new_values={"is_active": False},
                user=request.user
            )
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except PaymentGateway.DoesNotExist:
            return Response(
                {"error": "Payment gateway not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Failed to deactivate payment method: {str(e)}")
            return Response(
                {"error": "Payment method deactivation failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

class InitiatePaymentView(APIView):
    """
    View for initiating payments through different gateways
    Handles payment initiation for M-Pesa, PayPal and Bank transfers
    """
    def post(self, request):
        """
        Initiate a payment based on the selected gateway
        Validates all required fields before processing
        """
        try:
            # Common required fields
            gateway_id = request.data.get('gateway_id')
            amount = request.data.get('amount')
            plan_id = request.data.get('plan_id')
            
            if not all([gateway_id, amount, plan_id]):
                return Response(
                    {"error": "Missing required fields: gateway_id, amount, plan_id"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get client based on authentication
            if request.user.is_authenticated:
                try:
                    client = Client.objects.get(user=request.user)
                except Client.DoesNotExist:
                    return Response(
                        {"error": "Client profile not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                phone = request.data.get('phone_number')
                if not phone:
                    return Response(
                        {"error": "Phone number is required for unauthenticated payments"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    phone = format_phone_number(phone)
                    
                    # Get or create client by phone number only (no name needed)
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    
                    if User.objects.filter(phone_number=phone).exists():
                        user = User.objects.get(phone_number=phone)
                        client, created = Client.objects.get_or_create(user=user)
                    else:
                        # Create user with just phone number (no name)
                        user = User.objects.create_user(
                            phone_number=phone,
                            user_type='client'
                        )
                        client = Client.objects.create(user=user)
                        
                except ValueError as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response(
                        {"error": "Client not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )

            # Get gateway and plan
            try:
                gateway = PaymentGateway.objects.get(id=gateway_id, is_active=True)
                plan = InternetPlan.objects.get(id=plan_id)
            except PaymentGateway.DoesNotExist:
                return Response(
                    {"error": "Payment gateway not found or inactive"},
                    status=status.HTTP_404_NOT_FOUND
            )
            except InternetPlan.DoesNotExist:
                return Response(
                    {"error": "Internet plan not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Verify client has access to this payment method
            if not ClientPaymentMethod.objects.filter(
                client=client, 
                gateway=gateway, 
                is_active=True
            ).exists():
                return Response(
                    {"error": "Payment method not available for this client"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Gateway-specific payment initiation
            if gateway.name in ['mpesa_paybill', 'mpesa_till']:
                return self.initiate_mpesa_payment(request, client, gateway, plan)
            elif gateway.name == 'paypal':
                return self.initiate_paypal_payment(client, gateway, plan)
            elif gateway.name == 'bank_transfer':
                return self.initiate_bank_payment(client, gateway, plan)
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

    def initiate_mpesa_payment(self, request, client, gateway, plan):
        """
        Initiate M-Pesa STK push payment
        Handles both paybill and till numbers
        """
        try:
            phone = request.data.get('phone_number')
            if not phone:
                return Response(
                    {"error": "Phone number is required for M-Pesa"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Format phone number using the utility function
            try:
                phone = format_phone_number(phone)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get M-Pesa config
            mpesa_config = gateway.mpesaconfig
            
            # Generate access token
            token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
            if not token:
                return Response(
                    {"error": "Failed to authenticate with M-Pesa"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Prepare STK push request
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            business_short_code = mpesa_config.paybill_number or mpesa_config.till_number
            passkey = mpesa_config.passkey
            
            password = base64.b64encode(
                (business_short_code + passkey + timestamp).encode()
            ).decode()
            
            # Determine transaction type based on configuration
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
                "Amount": str(plan.price),
                "PartyA": phone,
                "PartyB": party_b,
                "PhoneNumber": phone,
                "CallBackURL": mpesa_config.callback_url,
                "AccountReference": f"CLIENT{client.id}",
                "TransactionDesc": f"Internet Plan: {plan.name}"
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Determine API endpoint based on sandbox mode
            base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
            # Make STK push request
            response = requests.post(
                f"{base_url}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers=headers,
                timeout=30
            ).json()
            
            # Handle response
            if response.get('ResponseCode') == '0':
                # Create transaction record
                transaction = Transaction.objects.create(
                    client=client,
                    gateway=gateway,
                    plan=plan,
                    amount=plan.price,
                    reference=f"MPESA_{timestamp}_{client.id}",
                    status='pending',
                    metadata={
                        'checkout_request_id': response['CheckoutRequestID'],
                        'phone_number': phone,
                        'mpesa_request': payload,
                        'mpesa_response': response,
                        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                        'ip_address': request.META.get('REMOTE_ADDR', '')
                    }
                )
                
                return Response({
                    "status": "pending",
                    "message": "Payment request sent to your phone",
                    "transaction_id": transaction.id,
                    "reference": transaction.reference,
                    "checkout_request_id": response['CheckoutRequestID'],
                    "gateway": "mpesa"
                })
            else:
                return Response({
                    "status": "failed",
                    "error": response.get('errorMessage', 'Payment request failed'),
                    "details": response
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"M-Pesa payment initiation failed: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
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

    def initiate_paypal_payment(self, client, gateway, plan):
        """Initiate PayPal payment and return approval URL"""
        try:
            paypal_config = gateway.paypalconfig
            
            # Get PayPal access token
            base_url = "https://api-m.sandbox.paypal.com" if gateway.sandbox_mode else "https://api-m.paypal.com"
            
            auth_response = requests.post(
                f"{base_url}/v1/oauth2/token",
                auth=(paypal_config.client_id, paypal_config.secret),
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
                data={"grant_type": "client_credentials"},
                timeout=10
            ).json()
            
            if 'access_token' not in auth_response:
                return Response({
                    "error": "Failed to authenticate with PayPal",
                    "details": auth_response
                }, status=status.HTTP_400_BAD_REQUEST)
            
            token = auth_response['access_token']
            
            # Create PayPal order
            order_payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(plan.price)
                    },
                    "description": f"Internet Plan: {plan.name}",
                    "custom_id": f"CLIENT{client.id}",
                    "invoice_id": f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}"
                }],
                "application_context": {
                    "return_url": paypal_config.callback_url,
                    "cancel_url": f"{paypal_config.callback_url}?cancel=true",
                    "brand_name": "Your ISP",
                    "user_action": "PAY_NOW"
                }
            }
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Create order
            response = requests.post(
                f"{base_url}/v2/checkout/orders",
                json=order_payload,
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('status') in ['CREATED', 'APPROVED']:
                # Create transaction record
                transaction = Transaction.objects.create(
                    client=client,
                    gateway=gateway,
                    plan=plan,
                    amount=plan.price,
                    reference=f"PAYPAL_{response['id']}",
                    status='pending',
                    metadata={
                        'paypal_order_id': response['id'],
                        'paypal_response': response
                    }
                )
                
                # Get approval URL
                approve_url = next(
                    (link['href'] for link in response['links'] if link['rel'] == 'approve'),
                    None
                )
                
                return Response({
                    "status": "pending",
                    "message": "Redirect to PayPal for payment",
                    "transaction_id": transaction.id,
                    "reference": transaction.reference,
                    "approve_url": approve_url,
                    "gateway": "paypal"
                })
            else:
                return Response({
                    "status": "failed",
                    "error": "Failed to create PayPal order",
                    "details": response
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"PayPal payment initiation failed: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def initiate_bank_payment(self, client, gateway, plan):
        """Provide bank details for manual transfer"""
        try:
            bank_config = gateway.bankconfig
            
            # Create transaction record
            transaction = Transaction.objects.create(
                client=client,
                gateway=gateway,
                plan=plan,
                amount=plan.price,
                reference=f"BANK_{timezone.now().strftime('%Y%m%d%H%M%S')}",
                status='pending',
                metadata={
                    'bank_details': {
                        'bank_name': bank_config.bank_name,
                        'account_name': bank_config.account_name,
                        'account_number': bank_config.account_number,
                        'branch_code': bank_config.branch_code,
                        'swift_code': bank_config.swift_code
                    },
                    'instructions': "Make payment to the provided bank account and upload proof"
                }
            )
            
            return Response({
                "status": "pending",
                "message": "Bank transfer instructions",
                "transaction_id": transaction.id,
                "reference": transaction.reference,
                "bank_details": transaction.metadata['bank_details'],
                "gateway": "bank"
            })
        except Exception as e:
            logger.error(f"Bank payment initiation failed: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class TransactionStatusView(APIView):
    """
    View for checking transaction status
    Provides detailed status for any transaction
    """
    def get(self, request, reference):
        """
        Get transaction status by reference number
        Returns complete transaction details
        """
        try:
            transaction = Transaction.objects.get(reference=reference)
            serializer = TransactionSerializer(transaction)
            return Response(serializer.data)
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

class ConfigurationHistoryView(APIView):
    """
    Tracks payment configuration changes
    Accessible to all authenticated users
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get configuration history (All authenticated users)
        """
        try:
            # Pagination setup
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 10)), 50)
            
            # Filterable history (last 30 days by default)
            history = ConfigurationHistory.objects.filter(
                timestamp__gte=timezone.now() - timedelta(days=30)
            ).order_by('-timestamp')
            
            # Apply search if provided
            if search := request.query_params.get('search'):
                history = history.filter(
                    Q(model__icontains=search) |
                    Q(action__icontains=search) |
                    Q(user__username__icontains=search)  # Changed from email to username
                )
            
            paginator = Paginator(history, page_size)
            page_data = paginator.get_page(page)
            
            return Response({
                "system": "dashboard",
                "history": ConfigurationHistorySerializer(page_data, many=True).data,
                "page": page_data.number,
                "total_pages": paginator.num_pages,
                "total_records": paginator.count
            })
            
        except ValueError:
            return Response(
                {"error": "Invalid pagination parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"History fetch failed: {str(e)}")
            return Response(
                {"error": "Failed to retrieve history"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@csrf_exempt
def mpesa_callback(request):
    """
    M-Pesa payment callback handler
    Processes STK push payment notifications
    """
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        data = json.loads(request.body)
        callback = data.get('Body', {}).get('stkCallback', {})
        result_code = callback.get('ResultCode')
        checkout_id = callback.get('CheckoutRequestID')
        
        if not checkout_id:
            return JsonResponse(
                {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"},
                status=400
            )

        # Get transaction
        try:
            transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
        except Transaction.DoesNotExist:
            return JsonResponse(
                {"ResultCode": 1, "ResultDesc": "Transaction not found"},
                status=404
            )
        
        if result_code == 0:
            # Successful payment
            items = callback.get('CallbackMetadata', {}).get('Item', [])
            metadata = {item['Name']: item.get('Value') for item in items}
            
            # Update transaction
            transaction.status = 'completed'
            transaction.metadata.update({
                'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
                'phone_number': metadata.get('PhoneNumber'),
                'amount': metadata.get('Amount'),
                'transaction_date': metadata.get('TransactionDate'),
                'callback_data': data
            })
            transaction.save()
            
            # Activate subscription
            plan = transaction.plan
            client = transaction.client
            
            # Calculate expiry based on plan
            if plan.expiry_unit == 'Days':
                expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
            else:  # Months
                expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
            # Create or update subscription
            Subscription.objects.update_or_create(
                client=client,
                internet_plan=plan,
                defaults={
                    'is_active': True,
                    'start_date': timezone.now(),
                    'end_date': expiry_date
                }
            )
            
            return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
        else:
            # Failed payment
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

@csrf_exempt
def paypal_callback(request):
    """
    PayPal payment callback handler
    Processes PayPal IPN notifications
    """
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        data = json.loads(request.body)
        event_type = data.get('event_type')
        resource = data.get('resource', {})
        order_id = resource.get('id')
        
        if not order_id:
            return JsonResponse(
                {"status": "error", "message": "Missing order ID"},
                status=400
            )

        # Get transaction
        try:
            transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
        except Transaction.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Transaction not found"},
                status=404
            )
        
        if event_type == 'PAYMENT.CAPTURE.COCOMPLETED':
            # Successful payment
            transaction.status = 'completed'
            transaction.metadata.update({
                'paypal_capture_id': resource.get('id'),
                'payer_email': resource.get('payer', {}).get('email_address'),
                'amount': resource.get('amount', {}).get('value'),
                'currency': resource.get('amount', {}).get('currency_code'),
                'callback_data': data
            })
            transaction.save()
            
            # Activate subscription
            plan = transaction.plan
            client = transaction.client
            
            # Calculate expiry based on plan
            if plan.expiry_unit == 'Days':
                expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
            else:  # Months
                expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
            # Create or update subscription
            Subscription.objects.update_or_create(
                client=client,
                internet_plan=plan,
                defaults={
                    'is_active': True,
                    'start_date': timezone.now(),
                    'end_date': expiry_date
                }
            )
            
            return JsonResponse({"status": "success", "message": "Payment completed"})
        else:
            # Other PayPal events
            transaction.metadata.update({
                'paypal_event': event_type,
                'callback_data': data
            })
            transaction.save()
            return JsonResponse({"status": "received", "message": f"Event {event_type} processed"})
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON payload"},
            status=400
        )
    except Exception as e:
        logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
        return JsonResponse(
            {"status": "error", "message": f"Callback processing failed: {str(e)}"},
            status=500
        )

@csrf_exempt
def bank_callback(request):
    """
    Bank transfer callback handler
    Processes manual bank payment confirmations
    """
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        data = json.loads(request.body)
        reference = data.get('reference')
        status = data.get('status')
        proof_url = data.get('proof_url')
        
        if not reference:
            return JsonResponse(
                {"status": "error", "message": "Missing reference"},
                status=400
            )

        # Get transaction
        try:
            transaction = Transaction.objects.get(reference=reference)
        except Transaction.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Transaction not found"},
                status=404
            )
        
        if status == 'verified':
            # Verified payment
            transaction.status = 'completed'
            transaction.metadata.update({
                'verified_by': data.get('verified_by', 'admin'),
                'verified_at': timezone.now().isoformat(),
                'proof_url': proof_url,
                'callback_data': data
            })
            transaction.save()
            
            # Activate subscription
            plan = transaction.plan
            client = transaction.client
            
            # Calculate expiry based on plan
            if plan.expiry_unit == 'Days':
                expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
            else:  # Months
                expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
            # Create or update subscription
            Subscription.objects.update_or_create(
                client=client,
                internet_plan=plan,
                defaults={
                    'is_active': True,
                    'start_date': timezone.now(),
                    'end_date': expiry_date
                }
            )
            
            return JsonResponse({"status": "success", "message": "Payment verified"})
        else:
            # Rejected payment
            transaction.status = 'failed'
            transaction.metadata.update({
                'rejected_reason': data.get('reason', 'Payment rejected'),
                'rejected_by': data.get('rejected_by', 'admin'),
                'rejected_at': timezone.now().isoformat(),
                'callback_data': data
            })
            transaction.save()
            return JsonResponse({"status": "failed", "message": "Payment rejected"})
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": "error", "message": "Invalid JSON payload"},
            status=400
        )
    except Exception as e:
        logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
        return JsonResponse(
            {"status": "error", "message": f"Callback processing failed: {str(e)}"},
            status=500
        )