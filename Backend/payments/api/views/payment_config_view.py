

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
                
#                 # Get or create client by phone number only (no name needed)
#                 from django.contrib.auth import get_user_model
#                 User = get_user_model()
                
#                 if User.objects.filter(phone_number=phone).exists():
#                     user = User.objects.get(phone_number=phone)
#                     client, created = Client.objects.get_or_create(user=user)
#                 else:
#                     # Create user with just phone number (no name)
#                     user = User.objects.create_user(
#                         phone_number=phone,
#                         user_type='client'
#                     )
#                     client = Client.objects.create(user=user)
                
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
                    
#                     # Get or create client by phone number only (no name needed)
#                     from django.contrib.auth import get_user_model
#                     User = get_user_model()
                    
#                     if User.objects.filter(phone_number=phone).exists():
#                         user = User.objects.get(phone_number=phone)
#                         client, created = Client.objects.get_or_create(user=user)
#                     else:
#                         # Create user with just phone number (no name)
#                         user = User.objects.create_user(
#                             phone_number=phone,
#                             user_type='client'
#                         )
#                         client = Client.objects.create(user=user)
                        
#                 except ValueError as e:
#                     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#                 except Exception as e:
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
#                     Q(user__username__icontains=search)  # Changed from email to username
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
        
#         if event_type == 'PAYMENT.CAPTURE.COCOMPLETED':
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







## second best original


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework import status
# from rest_framework import serializers
# from rest_framework.serializers import Serializer, UUIDField, JSONField, BooleanField, CharField
# from django.http import HttpResponseBadRequest, JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from django.utils import timezone
# from django.db.models import Q
# from django.db import models
# from django.core.paginator import Paginator, EmptyPage
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
#     MpesaCallbackEvent,
#     MpesaCallbackConfiguration,
#     MpesaCallbackLog,
#     MpesaCallbackRule,
#     MpesaCallbackSecurityProfile,
# )
# from payments.serializers.payment_config_serializer import (
#     PaymentGatewaySerializer,
#     MpesaConfigSerializer,
#     PayPalConfigSerializer,
#     BankConfigSerializer,
#     ClientPaymentMethodSerializer,
#     TransactionSerializer,
#     ConfigurationHistorySerializer,
#     WebhookLogSerializer,
#     WebhookSerializer,
#     MpesaCallbackEventSerializer,
#     MpesaCallbackConfigurationSerializer,
#     MpesaCallbackLogSerializer,
#     MpesaCallbackRuleSerializer,
#     MpesaCallbackSecurityProfileSerializer,
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from network_management.models.router_management_model import Router
# from rest_framework.pagination import PageNumberPagination
# from dotenv import load_dotenv
# from phonenumber_field.phonenumber import PhoneNumber
# from django.contrib.auth import get_user_model

# load_dotenv()
# logger = logging.getLogger(__name__)

# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
# PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")


# class MpesaCallbackTestSerializer(Serializer):
#     configuration_id = UUIDField()
#     test_payload = JSONField()
#     validate_security = BooleanField(default=True)

# class MpesaCallbackBulkUpdateSerializer(Serializer):
#     configuration_ids = UUIDField(many=True)
#     is_active = BooleanField(required=False)
#     security_level = CharField(required=False, max_length=10)

#     def validate_security_level(self, value):
#         if value and value not in dict(MpesaCallbackConfiguration.SECURITY_LEVELS).keys():
#             raise serializers.ValidationError("Invalid security level")
#         return value

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
#             gateways = PaymentGateway.objects.all().prefetch_related(
#                 'mpesaconfig', 'paypalconfig', 'bankconfig'
#             )
#             serializer = PaymentGatewaySerializer(gateways, many=True)
            
#             history = ConfigurationHistory.objects.all().order_by('-timestamp')[:10]
#             history_serializer = ConfigurationHistorySerializer(history, many=True)
            
#             base_url = request.build_absolute_uri('/')[:-1]
            
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
#             if request.user.is_authenticated:
#                 gateways = PaymentGateway.objects.all().prefetch_related(
#                     'mpesaconfig', 'paypalconfig', 'bankconfig'
#                 )
#                 serializer = PaymentGatewaySerializer(gateways, many=True)
#                 return Response({
#                     "system": "dashboard",
#                     "gateways": serializer.data
#                 })
            
#             phone = request.query_params.get('phone')
#             if not phone:
#                 return Response(
#                     {"error": "Phone number is required for client access"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             try:
#                 phone = format_phone_number(phone)
                
#                 User = get_user_model()
                
#                 if User.objects.filter(phone_number=phone).exists():
#                     user = User.objects.get(phone_number=phone)
#                     client, created = Client.objects.get_or_create(user=user)
#                 else:
#                     user = User.objects.create_user(
#                         phone_number=phone,
#                         user_type='client'
#                     )
#                     client = Client.objects.create(user=user)
                
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
            
#             gateway.is_active = True
#             gateway.save()
            
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
            
#             if PaymentGateway.objects.filter(is_active=True).count() <= 1:
#                 return Response(
#                     {"error": "Cannot deactivate the last payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
                
#             gateway.is_active = False
#             gateway.save()
            
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
#     Handles payment initiation for M-Pesa, PayPal, and Bank transfers
#     """
#     def post(self, request):
#         """
#         Initiate a payment based on the selected gateway
#         Validates all required fields before processing
#         """
#         try:
#             gateway_id = request.data.get('gateway_id')
#             amount = request.data.get('amount')
#             plan_id = request.data.get('plan_id')
            
#             if not all([gateway_id, amount, plan_id]):
#                 return Response(
#                     {"error": "Missing required fields: gateway_id, amount, plan_id"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

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
                    
#                     User = get_user_model()
                    
#                     if User.objects.filter(phone_number=phone).exists():
#                         user = User.objects.get(phone_number=phone)
#                         client, created = Client.objects.get_or_create(user=user)
#                     else:
#                         user = User.objects.create_user(
#                             phone_number=phone,
#                             user_type='client'
#                         )
#                         client = Client.objects.create(user=user)
                        
#                 except ValueError as e:
#                     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#                 except Exception as e:
#                     return Response(
#                         {"error": "Client creation failed"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

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

#             if not ClientPaymentMethod.objects.filter(
#                 client=client, 
#                 gateway=gateway, 
#                 is_active=True
#             ).exists():
#                 return Response(
#                     {"error": "Payment method not available for this client"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

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
            
#             try:
#                 phone = format_phone_number(phone)
#             except ValueError as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
#             mpesa_config = gateway.mpesaconfig
            
#             token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
#             if not token:
#                 return Response(
#                     {"error": "Failed to authenticate with M-Pesa"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             business_short_code = mpesa_config.paybill_number or mpesa_config.till_number
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
            
#             base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.post(
#                 f"{base_url}/mpesa/stkpush/v1/processrequest",
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('ResponseCode') == '0':
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
            
#             response = requests.post(
#                 f"{base_url}/v2/checkout/orders",
#                 json=order_payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('status') in ['CREATED', 'APPROVED']:
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
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 10)), 50)
            
#             history = ConfigurationHistory.objects.filter(
#                 timestamp__gte=timezone.now() - timedelta(days=30)
#             ).order_by('-timestamp')
            
#             if search := request.query_params.get('search'):
#                 history = history.filter(
#                     Q(model__icontains=search) |
#                     Q(action__icontains=search) |
#                     Q(user__username__icontains=search)
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

# class MpesaCallbackEventView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             events = MpesaCallbackEvent.objects.filter(is_active=True)
#             serializer = MpesaCallbackEventSerializer(events, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback events: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback events", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def post(self, request):
#         try:
#             serializer = MpesaCallbackEventSerializer(data=request.data)
#             if serializer.is_valid():
#                 event = serializer.save()
#                 ConfigurationHistory.objects.create(
#                     action="create",
#                     model="MpesaCallbackEvent",
#                     object_id=str(event.id),
#                     changes=list(request.data.keys()),
#                     new_values=request.data,
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create callback event: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create callback event", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackConfigurationView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             router_id = request.query_params.get('router_id')
#             event_type = request.query_params.get('event_type')
            
#             queryset = MpesaCallbackConfiguration.objects.select_related('router', 'event')
            
#             if router_id:
#                 queryset = queryset.filter(router_id=router_id)
#             if event_type:
#                 queryset = queryset.filter(event__name=event_type)
            
#             serializer = MpesaCallbackConfigurationSerializer(queryset, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback configurations: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback configurations", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackConfigurationSerializer(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 configuration = serializer.save()
                
#                 if not configuration.webhook_secret:
#                     configuration.generate_webhook_secret()
                
#                 return Response(
#                     MpesaCallbackConfigurationSerializer(configuration).data,
#                     status=status.HTTP_201_CREATED
#                 )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackConfigurationDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(MpesaCallbackConfiguration, pk=pk)
    
#     def get(self, request, pk):
#         try:
#             configuration = self.get_object(pk)
#             serializer = MpesaCallbackConfigurationSerializer(configuration)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def put(self, request, pk):
#         try:
#             configuration = self.get_object(pk)
#             serializer = MpesaCallbackConfigurationSerializer(
#                 configuration, data=request.data, partial=True, context={'request': request}
#             )
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to update callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to update callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def delete(self, request, pk):
#         try:
#             configuration = self.get_object(pk)
#             configuration_id = str(configuration.id)
#             configuration.delete()
#             ConfigurationHistory.objects.create(
#                 action="delete",
#                 model="MpesaCallbackConfiguration",
#                 object_id=configuration_id,
#                 changes=["Deleted callback configuration"],
#                 user=request.user
#             )
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except Exception as e:
#             logger.error(f"Failed to delete callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to delete callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackBulkOperationsView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackBulkUpdateSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             configurations = MpesaCallbackConfiguration.objects.filter(
#                 id__in=data['configuration_ids']
#             )
            
#             update_fields = {}
#             if 'is_active' in data:
#                 update_fields['is_active'] = data['is_active']
#             if 'security_level' in data:
#                 update_fields['security_level'] = data['security_level']
            
#             if update_fields:
#                 configurations.update(**update_fields)
#                 ConfigurationHistory.objects.create(
#                     action="update",
#                     model="MpesaCallbackConfiguration",
#                     object_id="bulk_update",
#                     changes=list(update_fields.keys()),
#                     new_values=update_fields,
#                     user=request.user
#                 )
            
#             return Response({
#                 "message": f"Updated {configurations.count()} configurations",
#                 "updated_count": configurations.count()
#             })
#         except Exception as e:
#             logger.error(f"Failed to perform bulk update: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to perform bulk update", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackTestView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackTestSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             configuration = get_object_or_404(
#                 MpesaCallbackConfiguration, 
#                 id=data['configuration_id']
#             )
            
#             test_result = self.test_callback_configuration(
#                 configuration, 
#                 data['test_payload'],
#                 data['validate_security']
#             )
            
#             return Response(test_result)
#         except Exception as e:
#             logger.error(f"Callback test failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Callback test failed", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def test_callback_configuration(self, configuration, test_payload, validate_security):
#         try:
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': 'SurfZone-Callback-Tester/1.0'
#             }
            
#             if validate_security and configuration.security_level != 'low':
#                 headers.update(self.generate_security_headers(configuration))
            
#             headers.update(configuration.custom_headers or {})
            
#             response = requests.post(
#                 configuration.callback_url,
#                 json=test_payload,
#                 headers=headers,
#                 timeout=configuration.timeout_seconds
#             )
            
#             MpesaCallbackLog.objects.create(
#                 configuration=configuration,
#                 payload=test_payload,
#                 response_status=response.status_code,
#                 response_body=response.text[:1000],
#                 status='success' if response.ok else 'failed',
#                 is_test=True,
#                 processed_at=timezone.now()
#             )
            
#             return {
#                 "success": response.ok,
#                 "status_code": response.status_code,
#                 "response_time": response.elapsed.total_seconds(),
#                 "configuration_id": str(configuration.id),
#                 "message": "Test completed successfully" if response.ok else "Test failed"
#             }
            
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Callback test failed: {str(e)}")
#             MpesaCallbackLog.objects.create(
#                 configuration=configuration,
#                 payload=test_payload,
#                 status='failed',
#                 is_test=True,
#                 error_message=str(e)
#             )
#             return {
#                 "success": False,
#                 "error": str(e),
#                 "configuration_id": str(configuration.id),
#                 "message": "Test failed with network error"
#             }
    
#     def generate_security_headers(self, configuration):
#         headers = {}
#         if configuration.webhook_secret:
#             headers['X-Callback-Signature'] = f"test-signature-{configuration.webhook_secret[:8]}"
#         if configuration.security_level in ['high', 'critical']:
#             headers['X-Security-Level'] = configuration.security_level
#         return headers

# class MpesaCallbackLogView(APIView):
#     permission_classes = [IsAuthenticated]
#     pagination_class = PageNumberPagination
    
#     def get(self, request):
#         try:
#             configuration_id = request.query_params.get('configuration_id')
#             status_filter = request.query_params.get('status')
#             days = int(request.query_params.get('days', 7))
            
#             start_date = timezone.now() - timedelta(days=days)
            
#             queryset = MpesaCallbackLog.objects.filter(
#                 created_at__gte=start_date
#             ).select_related('configuration', 'configuration__router', 'configuration__event')
            
#             if configuration_id:
#                 queryset = queryset.filter(configuration_id=configuration_id)
#             if status_filter:
#                 queryset = queryset.filter(status=status_filter)
            
#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(queryset, request)
#             serializer = MpesaCallbackLogSerializer(page, many=True)
#             return paginator.get_paginated_response(serializer.data)
#         except ValueError:
#             return Response(
#                 {"error": "Invalid query parameters"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch callback logs: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback logs", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackRuleView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             rules = MpesaCallbackRule.objects.filter(is_active=True)
#             serializer = MpesaCallbackRuleSerializer(rules, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback rules: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback rules", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackRuleSerializer(data=request.data)
#             if serializer.is_valid():
#                 rule = serializer.save()
#                 ConfigurationHistory.objects.create(
#                     action="create",
#                     model="MpesaCallbackRule",
#                     object_id=str(rule.id),
#                     changes=list(request.data.keys()),
#                     new_values=request.data,
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create callback rule: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create callback rule", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackSecurityProfileView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             profiles = MpesaCallbackSecurityProfile.objects.all()
#             serializer = MpesaCallbackSecurityProfileSerializer(profiles, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch security profiles: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch security profiles", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackSecurityProfileSerializer(data=request.data)
#             if serializer.is_valid():
#                 profile = serializer.save()
#                 ConfigurationHistory.objects.create(
#                     action="create",
#                     model="MpesaCallbackSecurityProfile",
#                     object_id=str(profile.id),
#                     changes=list(request.data.keys()),
#                     new_values=request.data,
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create security profile: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create security profile", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackDispatcherView(APIView):
#     permission_classes = [AllowAny]
#     authentication_classes = []

#     def post(self, request, router_id):
#         try:
#             router = get_object_or_404(Router, id=router_id, is_active=True)
#             payload = request.data

#             event_type = self.detect_event_type(payload)

#             configuration = MpesaCallbackConfiguration.objects.filter(
#                 router=router,
#                 event__name=event_type,
#                 is_active=True
#             ).first()

#             if not configuration:
#                 logger.warning(f"No callback configuration found for {event_type} on router {router.name}")
#                 return JsonResponse({"status": "no_configuration"}, status=404)

#             final_configuration = self.apply_routing_rules(configuration, payload, request)
#             delivery_result = self.deliver_callback(final_configuration, payload, request)

#             transaction = None
#             if event_type in ['payment_success', 'payment_failure', 'reversal']:
#                 checkout_id = payload.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
#                 if checkout_id:
#                     try:
#                         transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
#                     except Transaction.DoesNotExist:
#                         pass

#             MpesaCallbackLog.objects.create(
#                 configuration=final_configuration,
#                 transaction=transaction,
#                 payload=payload,
#                 response_status=delivery_result.get('status_code'),
#                 response_body=delivery_result.get('response_body', '')[:1000],
#                 status=delivery_result.get('status', 'failed'),
#                 error_message=delivery_result.get('error_message', '')
#             )

#             if delivery_result['success']:
#                 if event_type == 'payment_success' and transaction:
#                     items = payload.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
#                     metadata = {item['Name']: item.get('Value') for item in items}
#                     transaction.status = 'completed'
#                     transaction.metadata.update({
#                         'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                         'phone_number': metadata.get('PhoneNumber'),
#                         'amount': metadata.get('Amount'),
#                         'transaction_date': metadata.get('TransactionDate'),
#                         'callback_data': payload
#                     })
#                     transaction.save()

#                     plan = transaction.plan
#                     client = transaction.client
#                     if plan.expiry_unit == 'Days':
#                         expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#                     else:
#                         expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                    
#                     Subscription.objects.update_or_create(
#                         client=client,
#                         internet_plan=plan,
#                         defaults={
#                             'is_active': True,
#                             'start_date': timezone.now(),
#                             'end_date': expiry_date
#                         }
#                     )
#                 elif event_type == 'payment_failure' and transaction:
#                     transaction.status = 'failed'
#                     transaction.metadata.update({
#                         'error': payload.get('Body', {}).get('stkCallback', {}).get('ResultDesc', 'Payment failed'),
#                         'callback_data': payload
#                     })
#                     transaction.save()

#                 return JsonResponse({"status": "success"})
#             return JsonResponse(
#                 {"status": "error", "message": delivery_result.get('error_message')},
#                 status=500
#             )

#         except Exception as e:
#             logger.error(f"Callback dispatcher error: {str(e)}", exc_info=True)
#             return JsonResponse({"status": "error", "message": "Internal server error"}, status=500)

#     def detect_event_type(self, payload):
#         if payload.get('ResultCode') == '0':
#             return 'payment_success'
#         elif payload.get('ResultCode') and payload.get('ResultCode') != '0':
#             return 'payment_failure'
#         elif payload.get('TransactionType') == 'Reversal':
#             return 'reversal'
#         else:
#             return 'confirmation'

#     def apply_routing_rules(self, configuration, payload, request):
#         rules = MpesaCallbackRule.objects.filter(is_active=True).order_by('priority')
#         for rule in rules:
#             if self.evaluate_rule(rule, payload, request):
#                 return rule.target_configuration
#         return configuration

#     def evaluate_rule(self, rule, payload, request):
#         if rule.rule_type == 'header_based':
#             return self.evaluate_header_rule(rule, request)
#         elif rule.rule_type == 'payload_based':
#             return self.evaluate_payload_rule(rule, payload)
#         elif rule.rule_type == 'ip_based':
#             return self.evaluate_ip_rule(rule, request)
#         elif rule.rule_type == 'geo_based':
#             return self.evaluate_geo_rule(rule, request)
#         return False

#     def evaluate_header_rule(self, rule, request):
#         for key, value in rule.condition.items():
#             if request.headers.get(key) != value:
#                 return False
#         return True

#     def evaluate_payload_rule(self, rule, payload):
#         for key, value in rule.condition.items():
#             if payload.get(key) != value:
#                 return False
#         return True

#     def evaluate_ip_rule(self, rule, request):
#         ip = request.META.get('REMOTE_ADDR')
#         allowed_ips = rule.condition.get('allowed_ips', [])
#         return ip in allowed_ips

#     def evaluate_geo_rule(self, rule, request):
#         logger.warning("Geo rule evaluation not fully implemented.")
#         return True

#     def deliver_callback(self, configuration, payload, request):
#         try:
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': f"SurfZone-Router-{configuration.router.name}"
#             }

#             if configuration.webhook_secret:
#                 headers['X-Callback-Signature'] = self.generate_signature(payload, configuration.webhook_secret)

#             headers.update(configuration.custom_headers or {})
#             headers['X-Forwarded-For'] = request.META.get('REMOTE_ADDR', '')

#             response = requests.post(
#                 configuration.callback_url,
#                 json=payload,
#                 headers=headers,
#                 timeout=configuration.timeout_seconds
#             )

#             return {
#                 'success': response.ok,
#                 'status_code': response.status_code,
#                 'response_body': response.text,
#                 'status': 'success' if response.ok else 'failed'
#             }

#         except requests.exceptions.RequestException as e:
#             logger.error(f"Callback delivery failed: {str(e)}", exc_info=True)
#             return {'success': False, 'error_message': str(e), 'status': 'failed'}

#     def generate_signature(self, payload, secret):
#         sorted_payload = json.dumps(payload, sort_keys=True)
#         return hmac.new(secret.encode(), sorted_payload.encode(), hashlib.sha256).hexdigest()

# class MpesaCallbackAnalyticsView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             days = int(request.query_params.get('days', 30))
#             router_id = request.query_params.get('router_id')
            
#             start_date = timezone.now() - timedelta(days=days)
            
#             logs = MpesaCallbackLog.objects.filter(created_at__gte=start_date)
#             if router_id:
#                 logs = logs.filter(configuration__router_id=router_id)
            
#             total = logs.count()
#             successful = logs.filter(status='success').count()
#             success_rate = (successful / total * 100) if total > 0 else 0
            
#             status_distribution = logs.values('status').annotate(count=models.Count('id'))
            
#             response_times = logs.exclude(processed_at=None).annotate(
#                 duration=models.ExpressionWrapper(
#                     models.F('processed_at') - models.F('created_at'),
#                     output_field=models.DurationField()
#                 )
#             ).aggregate(
#                 avg_duration=models.Avg('duration'),
#                 max_duration=models.Max('duration'),
#                 min_duration=models.Min('duration')
#             )
            
#             router_performance = logs.values(
#                 'configuration__router__name'
#             ).annotate(
#                 total=models.Count('id'),
#                 success=models.Count('id', filter=models.Q(status='success')),
#                 avg_response_time=models.Avg(
#                     models.ExpressionWrapper(
#                         models.F('processed_at') - models.F('created_at'),
#                         output_field=models.DurationField()
#                     )
#                 )
#             )
            
#             return Response({
#                 'success_rate': round(success_rate, 2),
#                 'total_callbacks': total,
#                 'successful_callbacks': successful,
#                 'status_distribution': list(status_distribution),
#                 'response_times': {
#                     'avg_duration': response_times['avg_duration'].total_seconds() if response_times['avg_duration'] else None,
#                     'max_duration': response_times['max_duration'].total_seconds() if response_times['max_duration'] else None,
#                     'min_duration': response_times['min_duration'].total_seconds() if response_times['min_duration'] else None,
#                 },
#                 'router_performance': list(router_performance),
#                 'time_period': f"Last {days} days"
#             })
#         except ValueError:
#             return Response(
#                 {"error": "Invalid query parameters"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch callback analytics: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback analytics", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# @method_decorator(csrf_exempt, name='dispatch')
# class PayPalCallbackView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         PayPal payment callback handler
#         Processes PayPal IPN notifications
#         """
#         try:
#             data = request.data
#             event_type = data.get('event_type')
#             resource = data.get('resource', {})
#             order_id = resource.get('id')
            
#             if not order_id:
#                 return JsonResponse(
#                     {"status": "error", "message": "Missing order ID"},
#                     status=400
#                 )

#             try:
#                 transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#             except Transaction.DoesNotExist:
#                 return JsonResponse(
#                     {"status": "error", "message": "Transaction not found"},
#                     status=404
#                 )
            
#             if event_type == 'PAYMENT.CAPTURE.COMPLETED':
#                 transaction.status = 'completed'
#                 transaction.metadata.update({
#                     'paypal_capture_id': resource.get('id'),
#                     'payer_email': resource.get('payer', {}).get('email_address'),
#                     'amount': resource.get('amount', {}).get('value'),
#                     'currency': resource.get('amount', {}).get('currency_code'),
#                     'callback_data': data
#                 })
#                 transaction.save()
                
#                 plan = transaction.plan
#                 client = transaction.client
                
#                 if plan.expiry_unit == 'Days':
#                     expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#                 else:
#                     expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                
#                 Subscription.objects.update_or_create(
#                     client=client,
#                     internet_plan=plan,
#                     defaults={
#                         'is_active': True,
#                         'start_date': timezone.now(),
#                         'end_date': expiry_date
#                     }
#                 )
                
#                 return JsonResponse({"status": "success", "message": "Payment completed"})
#             else:
#                 transaction.metadata.update({
#                     'paypal_event': event_type,
#                     'callback_data': data
#                 })
#                 transaction.save()
#                 return JsonResponse({"status": "received", "message": f"Event {event_type} processed"})
#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"status": "error", "message": "Invalid JSON payload"},
#                 status=400
#             )
#         except Exception as e:
#             logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

# @method_decorator(csrf_exempt, name='dispatch')
# class BankCallbackView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         Bank transfer callback handler
#         Processes manual bank payment confirmations
#         """
#         try:
#             data = request.data
#             reference = data.get('reference')
#             status = data.get('status')
#             proof_url = data.get('proof_url')
            
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
#                     'verified_by': data.get('verified_by', 'admin'),
#                     'verified_at': timezone.now().isoformat(),
#                     'proof_url': proof_url,
#                     'callback_data': data
#                 })
#                 transaction.save()
                
#                 plan = transaction.plan
#                 client = transaction.client
                
#                 if plan.expiry_unit == 'Days':
#                     expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#                 else:
#                     expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                
#                 Subscription.objects.update_or_create(
#                     client=client,
#                     internet_plan=plan,
#                     defaults={
#                         'is_active': True,
#                         'start_date': timezone.now(),
#                         'end_date': expiry_date
#                     }
#                 )
                
#                 return JsonResponse({"status": "success", "message": "Payment verified"})
#             else:
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'rejected_reason': data.get('reason', 'Payment rejected'),
#                     'rejected_by': data.get('rejected_by', 'admin'),
#                     'rejected_at': timezone.now().isoformat(),
#                     'callback_data': data
#                 })
#                 transaction.save()
#                 return JsonResponse({"status": "failed", "message": "Payment rejected"})
#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"status": "error", "message": "Invalid JSON payload"},
#                 status=400
#             )
#         except Exception as e:
#             logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

# @csrf_exempt
# def mpesa_callback(request):
#     """
#     Legacy M-Pesa payment callback handler
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

#         try:
#             transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Transaction not found"},
#                 status=404
#             )
        
#         if result_code == '0':
#             items = callback.get('CallbackMetadata', {}).get('Item', [])
#             metadata = {item['Name']: item.get('Value') for item in items}
            
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                 'phone_number': metadata.get('PhoneNumber'),
#                 'amount': metadata.get('Amount'),
#                 'transaction_date': metadata.get('TransactionDate'),
#                 'callback_data': data
#             })
#             transaction.save()
            
#             plan = transaction.plan
#             client = transaction.client
            
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
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













# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework import status
# from django.http import HttpResponseBadRequest, JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from django.utils import timezone
# from django.db.models import Q, Count, Avg, Max, Min, F, ExpressionWrapper, DurationField  
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
#     MpesaCallbackEvent,
#     MpesaCallbackConfiguration,
#     MpesaCallbackLog,
#     MpesaCallbackRule,
#     MpesaCallbackSecurityProfile,
# )
# from payments.serializers.payment_config_serializer import (
#     PaymentGatewaySerializer,
#     MpesaConfigSerializer,
#     PayPalConfigSerializer,
#     BankConfigSerializer,
#     ClientPaymentMethodSerializer,
#     TransactionSerializer,
#     ConfigurationHistorySerializer,
#     WebhookLogSerializer,
#     WebhookSerializer,
#     MpesaCallbackEventSerializer,
#     MpesaCallbackConfigurationSerializer,
#     MpesaCallbackLogSerializer,
#     MpesaCallbackRuleSerializer,
#     MpesaCallbackSecurityProfileSerializer,
#     MpesaCallbackTestSerializer,
#     MpesaCallbackBulkUpdateSerializer,
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from network_management.models.router_management_model import Router
# from dotenv import load_dotenv
# from django.contrib.auth import get_user_model

# load_dotenv()
# logger = logging.getLogger(__name__)

# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
# PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")


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
#             gateways = PaymentGateway.objects.all().prefetch_related(
#                 'mpesaconfig', 'paypalconfig', 'bankconfig'
#             )
#             serializer = PaymentGatewaySerializer(gateways, many=True)
            
#             history = ConfigurationHistory.objects.all().order_by('-timestamp')[:10]
#             history_serializer = ConfigurationHistorySerializer(history, many=True)
            
#             base_url = request.build_absolute_uri('/')[:-1]
            
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
#             if request.user.is_authenticated:
#                 gateways = PaymentGateway.objects.all().prefetch_related(
#                     'mpesaconfig', 'paypalconfig', 'bankconfig'
#                 )
#                 serializer = PaymentGatewaySerializer(gateways, many=True)
#                 return Response({
#                     "system": "dashboard",
#                     "gateways": serializer.data
#                 })
            
#             phone = request.query_params.get('phone')
#             if not phone:
#                 return Response(
#                     {"error": "Phone number is required for client access"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             try:
#                 phone = Client.format_phone_number(phone)
                
#                 User = get_user_model()
                
#                 if User.objects.filter(phone_number=phone).exists():
#                     user = User.objects.get(phone_number=phone)
#                     client, created = Client.objects.get_or_create(user=user)
#                 else:
#                     user = User.objects.create_user(
#                         phone_number=phone,
#                         user_type='client'
#                     )
#                     client = Client.objects.create(user=user)
                
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
            
#             gateway.is_active = True
#             gateway.save()
            
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
            
#             if PaymentGateway.objects.filter(is_active=True).count() <= 1:
#                 return Response(
#                     {"error": "Cannot deactivate the last payment method"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
                
#             gateway.is_active = False
#             gateway.save()
            
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
#     Handles payment initiation for M-Pesa, PayPal, and Bank transfers
#     """
#     def post(self, request):
#         """
#         Initiate a payment based on the selected gateway
#         Validates all required fields before processing
#         """
#         try:
#             gateway_id = request.data.get('gateway_id')
#             amount = request.data.get('amount')
#             plan_id = request.data.get('plan_id')
            
#             if not all([gateway_id, amount, plan_id]):
#                 return Response(
#                     {"error": "Missing required fields: gateway_id, amount, plan_id"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

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
#                     phone = Client.format_phone_number(phone)
                    
#                     User = get_user_model()
                    
#                     if User.objects.filter(phone_number=phone).exists():
#                         user = User.objects.get(phone_number=phone)
#                         client, created = Client.objects.get_or_create(user=user)
#                     else:
#                         user = User.objects.create_user(
#                             phone_number=phone,
#                             user_type='client'
#                         )
#                         client = Client.objects.create(user=user)
                        
#                 except ValueError as e:
#                     return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#                 except Exception as e:
#                     return Response(
#                         {"error": "Client creation failed"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

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

#             if not ClientPaymentMethod.objects.filter(
#                 client=client, 
#                 gateway=gateway, 
#                 is_active=True
#             ).exists():
#                 return Response(
#                     {"error": "Payment method not available for this client"},
#                     status=status.HTTP_403_FORBIDDEN
#                 )

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
            
#             try:
#                 phone = Client.format_phone_number(phone)
#             except ValueError as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
#             mpesa_config = gateway.mpesaconfig
            
#             token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
#             if not token:
#                 return Response(
#                     {"error": "Failed to authenticate with M-Pesa"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             business_short_code = mpesa_config.paybill_number or mpesa_config.till_number
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
            
#             base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
#             response = requests.post(
#                 f"{base_url}/mpesa/stkpush/v1/processrequest",
#                 json=payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('ResponseCode') == '0':
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
            
#             response = requests.post(
#                 f"{base_url}/v2/checkout/orders",
#                 json=order_payload,
#                 headers=headers,
#                 timeout=30
#             ).json()
            
#             if response.get('status') in ['CREATED', 'APPROVED']:
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
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 10)), 50)
            
#             history = ConfigurationHistory.objects.filter(
#                 timestamp__gte=timezone.now() - timedelta(days=30)
#             ).order_by('-timestamp')
            
#             if search := request.query_params.get('search'):
#                 history = history.filter(
#                     Q(model__icontains=search) |
#                     Q(action__icontains=search) |
#                     Q(user__username__icontains=search)
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

# class MpesaCallbackEventView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             events = MpesaCallbackEvent.objects.filter(is_active=True)
#             serializer = MpesaCallbackEventSerializer(events, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback events: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback events", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def post(self, request):
#         try:
#             serializer = MpesaCallbackEventSerializer(data=request.data)
#             if serializer.is_valid():
#                 event = serializer.save()
#                 ConfigurationHistory.objects.create(
#                     action="create",
#                     model="MpesaCallbackEvent",
#                     object_id=str(event.id),
#                     changes=list(request.data.keys()),
#                     new_values=request.data,
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create callback event: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create callback event", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackConfigurationView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             router_id = request.query_params.get('router_id')
#             event_type = request.query_params.get('event_type')
            
#             queryset = MpesaCallbackConfiguration.objects.select_related('router', 'event')
            
#             if router_id:
#                 queryset = queryset.filter(router_id=router_id)
#             if event_type:
#                 queryset = queryset.filter(event__name=event_type)
            
#             serializer = MpesaCallbackConfigurationSerializer(queryset, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback configurations: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback configurations", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackConfigurationSerializer(data=request.data, context={'request': request})
#             if serializer.is_valid():
#                 configuration = serializer.save()
                
#                 if not configuration.webhook_secret:
#                     configuration.generate_webhook_secret()
                
#                 return Response(
#                     MpesaCallbackConfigurationSerializer(configuration).data,
#                     status=status.HTTP_201_CREATED
#                 )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackConfigurationDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(MpesaCallbackConfiguration, pk=pk)
    
#     def get(self, request, pk):
#         try:
#             configuration = self.get_object(pk)
#             serializer = MpesaCallbackConfigurationSerializer(configuration)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def put(self, request, pk):
#         try:
#             configuration = self.get_object(pk)
#             serializer = MpesaCallbackConfigurationSerializer(
#                 configuration, data=request.data, partial=True, context={'request': request}
#             )
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to update callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to update callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def delete(self, request, pk):
#         try:
#             configuration = self.get_object(pk)
#             configuration_id = str(configuration.id)
#             configuration.delete()
#             ConfigurationHistory.objects.create(
#                 action="delete",
#                 model="MpesaCallbackConfiguration",
#                 object_id=configuration_id,
#                 changes=["Deleted callback configuration"],
#                 user=request.user
#             )
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except Exception as e:
#             logger.error(f"Failed to delete callback configuration: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to delete callback configuration", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackBulkOperationsView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackBulkUpdateSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             configurations = MpesaCallbackConfiguration.objects.filter(
#                 id__in=data['configuration_ids']
#             )
            
#             update_fields = {}
#             if 'is_active' in data:
#                 update_fields['is_active'] = data['is_active']
#             if 'security_level' in data:
#                 update_fields['security_level'] = data['security_level']
            
#             if update_fields:
#                 configurations.update(**update_fields)
#                 ConfigurationHistory.objects.create(
#                     action="update",
#                     model="MpesaCallbackConfiguration",
#                     object_id="bulk_update",
#                     changes=list(update_fields.keys()),
#                     new_values=update_fields,
#                     user=request.user
#                 )
            
#             return Response({
#                 "message": f"Updated {configurations.count()} configurations",
#                 "updated_count": configurations.count()
#             })
#         except Exception as e:
#             logger.error(f"Failed to perform bulk update: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to perform bulk update", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackTestView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackTestSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             configuration = get_object_or_404(
#                 MpesaCallbackConfiguration, 
#                 id=data['configuration_id']
#             )
            
#             test_result = self.test_callback_configuration(
#                 configuration, 
#                 data['test_payload'],
#                 data['validate_security']
#             )
            
#             return Response(test_result)
#         except Exception as e:
#             logger.error(f"Callback test failed: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Callback test failed", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def test_callback_configuration(self, configuration, test_payload, validate_security):
#         try:
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': 'SurfZone-Callback-Tester/1.0'
#             }
            
#             if validate_security and configuration.security_level != 'low':
#                 headers.update(self.generate_security_headers(configuration))
            
#             headers.update(configuration.custom_headers or {})
            
#             response = requests.post(
#                 configuration.callback_url,
#                 json=test_payload,
#                 headers=headers,
#                 timeout=configuration.timeout_seconds
#             )
            
#             MpesaCallbackLog.objects.create(
#                 configuration=configuration,
#                 payload=test_payload,
#                 response_status=response.status_code,
#                 response_body=response.text[:1000],
#                 status='success' if response.ok else 'failed',
#                 is_test=True,
#                 processed_at=timezone.now()
#             )
            
#             return {
#                 "success": response.ok,
#                 "status_code": response.status_code,
#                 "response_time": response.elapsed.total_seconds(),
#                 "configuration_id": str(configuration.id),
#                 "message": "Test completed successfully" if response.ok else "Test failed"
#             }
            
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Callback test failed: {str(e)}")
#             MpesaCallbackLog.objects.create(
#                 configuration=configuration,
#                 payload=test_payload,
#                 status='failed',
#                 is_test=True,
#                 error_message=str(e)
#             )
#             return {
#                 "success": False,
#                 "error": str(e),
#                 "configuration_id": str(configuration.id),
#                 "message": "Test failed with network error"
#             }
    
#     def generate_security_headers(self, configuration):
#         headers = {}
#         if configuration.webhook_secret:
#             headers['X-Callback-Signature'] = f"test-signature-{configuration.webhook_secret[:8]}"
#         if configuration.security_level in ['high', 'critical']:
#             headers['X-Security-Level'] = configuration.security_level
#         return headers

# class MpesaCallbackLogView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             configuration_id = request.query_params.get('configuration_id')
#             status_filter = request.query_params.get('status')
#             days = int(request.query_params.get('days', 7))
            
#             start_date = timezone.now() - timedelta(days=days)
            
#             queryset = MpesaCallbackLog.objects.filter(
#                 created_at__gte=start_date
#             ).select_related('configuration', 'configuration__router', 'configuration__event')
            
#             if configuration_id:
#                 queryset = queryset.filter(configuration_id=configuration_id)
#             if status_filter:
#                 queryset = queryset.filter(status=status_filter)
            
#             serializer = MpesaCallbackLogSerializer(queryset, many=True)
#             return Response(serializer.data)
#         except ValueError:
#             return Response(
#                 {"error": "Invalid query parameters"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch callback logs: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback logs", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackRuleView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             rules = MpesaCallbackRule.objects.filter(is_active=True)
#             serializer = MpesaCallbackRuleSerializer(rules, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch callback rules: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback rules", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackRuleSerializer(data=request.data)
#             if serializer.is_valid():
#                 rule = serializer.save()
#                 ConfigurationHistory.objects.create(
#                     action="create",
#                     model="MpesaCallbackRule",
#                     object_id=str(rule.id),
#                     changes=list(request.data.keys()),
#                     new_values=request.data,
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create callback rule: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create callback rule", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackSecurityProfileView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             profiles = MpesaCallbackSecurityProfile.objects.all()
#             serializer = MpesaCallbackSecurityProfileSerializer(profiles, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Failed to fetch security profiles: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch security profiles", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
    
#     def post(self, request):
#         try:
#             serializer = MpesaCallbackSecurityProfileSerializer(data=request.data)
#             if serializer.is_valid():
#                 profile = serializer.save()
#                 ConfigurationHistory.objects.create(
#                     action="create",
#                     model="MpesaCallbackSecurityProfile",
#                     object_id=str(profile.id),
#                     changes=list(request.data.keys()),
#                     new_values=request.data,
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to create security profile: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to create security profile", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class MpesaCallbackDispatcherView(APIView):
#     permission_classes = [AllowAny]
#     authentication_classes = []

#     def post(self, request, router_id):
#         try:
#             router = get_object_or_404(Router, id=router_id, is_active=True)
#             payload = request.data

#             event_type = self.detect_event_type(payload)

#             configuration = MpesaCallbackConfiguration.objects.filter(
#                 router=router,
#                 event__name=event_type,
#                 is_active=True
#             ).first()

#             if not configuration:
#                 logger.warning(f"No callback configuration found for {event_type} on router {router.name}")
#                 return JsonResponse({"status": "no_configuration"}, status=404)

#             final_configuration = self.apply_routing_rules(configuration, payload, request)
#             delivery_result = self.deliver_callback(final_configuration, payload, request)

#             transaction = None
#             if event_type in ['payment_success', 'payment_failure', 'reversal']:
#                 checkout_id = payload.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
#                 if checkout_id:
#                     try:
#                         transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
#                     except Transaction.DoesNotExist:
#                         pass

#             MpesaCallbackLog.objects.create(
#                 configuration=final_configuration,
#                 transaction=transaction,
#                 payload=payload,
#                 response_status=delivery_result.get('status_code'),
#                 response_body=delivery_result.get('response_body', '')[:1000],
#                 status=delivery_result.get('status', 'failed'),
#                 error_message=delivery_result.get('error_message', '')
#             )

#             if delivery_result['success']:
#                 if event_type == 'payment_success' and transaction:
#                     items = payload.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
#                     metadata = {item['Name']: item.get('Value') for item in items}
#                     transaction.status = 'completed'
#                     transaction.metadata.update({
#                         'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                         'phone_number': metadata.get('PhoneNumber'),
#                         'amount': metadata.get('Amount'),
#                         'transaction_date': metadata.get('TransactionDate'),
#                         'callback_data': payload
#                     })
#                     transaction.save()

#                     plan = transaction.plan
#                     client = transaction.client
#                     if plan.expiry_unit == 'Days':
#                         expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#                     else:
#                         expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                    
#                     Subscription.objects.update_or_create(
#                         client=client,
#                         internet_plan=plan,
#                         defaults={
#                             'is_active': True,
#                             'start_date': timezone.now(),
#                             'end_date': expiry_date
#                         }
#                     )
#                 elif event_type == 'payment_failure' and transaction:
#                     transaction.status = 'failed'
#                     transaction.metadata.update({
#                         'error': payload.get('Body', {}).get('stkCallback', {}).get('ResultDesc', 'Payment failed'),
#                         'callback_data': payload
#                     })
#                     transaction.save()

#                 return JsonResponse({"status": "success"})
#             return JsonResponse(
#                 {"status": "error", "message": delivery_result.get('error_message')},
#                 status=500
#             )

#         except Exception as e:
#             logger.error(f"Callback dispatcher error: {str(e)}", exc_info=True)
#             return JsonResponse({"status": "error", "message": "Internal server error"}, status=500)

#     def detect_event_type(self, payload):
#         if payload.get('ResultCode') == '0':
#             return 'payment_success'
#         elif payload.get('ResultCode') and payload.get('ResultCode') != '0':
#             return 'payment_failure'
#         elif payload.get('TransactionType') == 'Reversal':
#             return 'reversal'
#         else:
#             return 'confirmation'

#     def apply_routing_rules(self, configuration, payload, request):
#         rules = MpesaCallbackRule.objects.filter(is_active=True).order_by('priority')
#         for rule in rules:
#             if self.evaluate_rule(rule, payload, request):
#                 return rule.target_configuration
#         return configuration

#     def evaluate_rule(self, rule, payload, request):
#         if rule.rule_type == 'header_based':
#             return self.evaluate_header_rule(rule, request)
#         elif rule.rule_type == 'payload_based':
#             return self.evaluate_payload_rule(rule, payload)
#         elif rule.rule_type == 'ip_based':
#             return self.evaluate_ip_rule(rule, request)
#         elif rule.rule_type == 'geo_based':
#             return self.evaluate_geo_rule(rule, request)
#         return False

#     def evaluate_header_rule(self, rule, request):
#         for key, value in rule.condition.items():
#             if request.headers.get(key) != value:
#                 return False
#         return True

#     def evaluate_payload_rule(self, rule, payload):
#         for key, value in rule.condition.items():
#             if payload.get(key) != value:
#                 return False
#         return True

#     def evaluate_ip_rule(self, rule, request):
#         ip = request.META.get('REMOTE_ADDR')
#         allowed_ips = rule.condition.get('allowed_ips', [])
#         return ip in allowed_ips

#     def evaluate_geo_rule(self, rule, request):
#         logger.warning("Geo rule evaluation not fully implemented.")
#         return True

#     def deliver_callback(self, configuration, payload, request):
#         try:
#             headers = {
#                 'Content-Type': 'application/json',
#                 'User-Agent': f"SurfZone-Router-{configuration.router.name}"
#             }

#             if configuration.webhook_secret:
#                 headers['X-Callback-Signature'] = self.generate_signature(payload, configuration.webhook_secret)

#             headers.update(configuration.custom_headers or {})
#             headers['X-Forwarded-For'] = request.META.get('REMOTE_ADDR', '')

#             response = requests.post(
#                 configuration.callback_url,
#                 json=payload,
#                 headers=headers,
#                 timeout=configuration.timeout_seconds
#             )

#             return {
#                 'success': response.ok,
#                 'status_code': response.status_code,
#                 'response_body': response.text,
#                 'status': 'success' if response.ok else 'failed'
#             }

#         except requests.exceptions.RequestException as e:
#             logger.error(f"Callback delivery failed: {str(e)}", exc_info=True)
#             return {'success': False, 'error_message': str(e), 'status': 'failed'}

#     def generate_signature(self, payload, secret):
#         sorted_payload = json.dumps(payload, sort_keys=True)
#         return hmac.new(secret.encode(), sorted_payload.encode(), hashlib.sha256).hexdigest()

# class MpesaCallbackAnalyticsView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             days = int(request.query_params.get('days', 30))
#             router_id = request.query_params.get('router_id')
            
#             start_date = timezone.now() - timedelta(days=days)
            
#             logs = MpesaCallbackLog.objects.filter(created_at__gte=start_date)
#             if router_id:
#                 logs = logs.filter(configuration__router_id=router_id)
            
#             total = logs.count()
#             successful = logs.filter(status='success').count()
#             success_rate = (successful / total * 100) if total > 0 else 0
            
#             status_distribution = logs.values('status').annotate(count=Count('id'))  # Updated: models.Count → Count
            
#             response_times = logs.exclude(processed_at=None).annotate(
#                 duration=ExpressionWrapper(  # Updated: models.ExpressionWrapper → ExpressionWrapper
#                     F('processed_at') - F('created_at'),  # Updated: models.F → F
#                     output_field=DurationField()  # Updated: models.DurationField → DurationField
#                 )
#             ).aggregate(
#                 avg_duration=Avg('duration'),  # Updated: models.Avg → Avg
#                 max_duration=Max('duration'),  # Updated: models.Max → Max
#                 min_duration=Min('duration')   # Updated: models.Min → Min
#             )
            
#             router_performance = logs.values(
#                 'configuration__router__name'
#             ).annotate(
#                 total=Count('id'),  # Updated: models.Count → Count
#                 success=Count('id', filter=Q(status='success')),  # Updated: models.Count → Count, models.Q → Q
#                 avg_response_time=Avg(  # Updated: models.Avg → Avg
#                     ExpressionWrapper(  # Updated: models.ExpressionWrapper → ExpressionWrapper
#                         F('processed_at') - F('created_at'),  # Updated: models.F → F
#                         output_field=DurationField()  # Updated: models.DurationField → DurationField
#                     )
#                 )
#             )
            
#             return Response({
#                 'success_rate': round(success_rate, 2),
#                 'total_callbacks': total,
#                 'successful_callbacks': successful,
#                 'status_distribution': list(status_distribution),
#                 'response_times': {
#                     'avg_duration': response_times['avg_duration'].total_seconds() if response_times['avg_duration'] else None,
#                     'max_duration': response_times['max_duration'].total_seconds() if response_times['max_duration'] else None,
#                     'min_duration': response_times['min_duration'].total_seconds() if response_times['min_duration'] else None,
#                 },
#                 'router_performance': list(router_performance),
#                 'time_period': f"Last {days} days"
#             })
#         except ValueError:
#             return Response(
#                 {"error": "Invalid query parameters"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Failed to fetch callback analytics: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to fetch callback analytics", "details": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# @method_decorator(csrf_exempt, name='dispatch')
# class PayPalCallbackView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         PayPal payment callback handler
#         Processes PayPal IPN notifications
#         """
#         try:
#             data = request.data
#             event_type = data.get('event_type')
#             resource = data.get('resource', {})
#             order_id = resource.get('id')
            
#             if not order_id:
#                 return JsonResponse(
#                     {"status": "error", "message": "Missing order ID"},
#                     status=400
#                 )

#             try:
#                 transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
#             except Transaction.DoesNotExist:
#                 return JsonResponse(
#                     {"status": "error", "message": "Transaction not found"},
#                     status=404
#                 )
            
#             if event_type == 'PAYMENT.CAPTURE.COMPLETED':
#                 transaction.status = 'completed'
#                 transaction.metadata.update({
#                     'paypal_capture_id': resource.get('id'),
#                     'payer_email': resource.get('payer', {}).get('email_address'),
#                     'amount': resource.get('amount', {}).get('value'),
#                     'currency': resource.get('amount', {}).get('currency_code'),
#                     'callback_data': data
#                 })
#                 transaction.save()
                
#                 plan = transaction.plan
#                 client = transaction.client
                
#                 if plan.expiry_unit == 'Days':
#                     expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#                 else:
#                     expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                
#                 Subscription.objects.update_or_create(
#                     client=client,
#                     internet_plan=plan,
#                     defaults={
#                         'is_active': True,
#                         'start_date': timezone.now(),
#                         'end_date': expiry_date
#                     }
#                 )
                
#                 return JsonResponse({"status": "success", "message": "Payment completed"})
#             else:
#                 transaction.metadata.update({
#                     'paypal_event': event_type,
#                     'callback_data': data
#                 })
#                 transaction.save()
#                 return JsonResponse({"status": "received", "message": f"Event {event_type} processed"})
#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"status": "error", "message": "Invalid JSON payload"},
#                 status=400
#             )
#         except Exception as e:
#             logger.error(f"PayPal callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

# @method_decorator(csrf_exempt, name='dispatch')
# class BankCallbackView(APIView):
#     permission_classes = [AllowAny]
    
#     def post(self, request):
#         """
#         Bank transfer callback handler
#         Processes manual bank payment confirmations
#         """
#         try:
#             data = request.data
#             reference = data.get('reference')
#             status = data.get('status')
#             proof_url = data.get('proof_url')
            
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
#                     'verified_by': data.get('verified_by', 'admin'),
#                     'verified_at': timezone.now().isoformat(),
#                     'proof_url': proof_url,
#                     'callback_data': data
#                 })
#                 transaction.save()
                
#                 plan = transaction.plan
#                 client = transaction.client
                
#                 if plan.expiry_unit == 'Days':
#                     expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#                 else:
#                     expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                
#                 Subscription.objects.update_or_create(
#                     client=client,
#                     internet_plan=plan,
#                     defaults={
#                         'is_active': True,
#                         'start_date': timezone.now(),
#                         'end_date': expiry_date
#                     }
#                 )
                
#                 return JsonResponse({"status": "success", "message": "Payment verified"})
#             else:
#                 transaction.status = 'failed'
#                 transaction.metadata.update({
#                     'rejected_reason': data.get('reason', 'Payment rejected'),
#                     'rejected_by': data.get('rejected_by', 'admin'),
#                     'rejected_at': timezone.now().isoformat(),
#                     'callback_data': data
#                 })
#                 transaction.save()
#                 return JsonResponse({"status": "failed", "message": "Payment rejected"})
#         except json.JSONDecodeError:
#             return JsonResponse(
#                 {"status": "error", "message": "Invalid JSON payload"},
#                 status=400
#             )
#         except Exception as e:
#             logger.error(f"Bank callback processing failed: {str(e)}", exc_info=True)
#             return JsonResponse(
#                 {"status": "error", "message": f"Callback processing failed: {str(e)}"},
#                 status=500
#             )

# @csrf_exempt
# def mpesa_callback(request):
#     """
#     Legacy M-Pesa payment callback handler
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

#         try:
#             transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
#         except Transaction.DoesNotExist:
#             return JsonResponse(
#                 {"ResultCode": 1, "ResultDesc": "Transaction not found"},
#                 status=404
#             )
        
#         if result_code == '0':
#             items = callback.get('CallbackMetadata', {}).get('Item', [])
#             metadata = {item['Name']: item.get('Value') for item in items}
            
#             transaction.status = 'completed'
#             transaction.metadata.update({
#                 'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
#                 'phone_number': metadata.get('PhoneNumber'),
#                 'amount': metadata.get('Amount'),
#                 'transaction_date': metadata.get('TransactionDate'),
#                 'callback_data': data
#             })
#             transaction.save()
            
#             plan = transaction.plan
#             client = transaction.client
            
#             if plan.expiry_unit == 'Days':
#                 expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
#             else:
#                 expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
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















from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db.models import Q, Count, Avg, Max, Min, F, ExpressionWrapper, DurationField  
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
    MpesaCallbackEvent,
    MpesaCallbackConfiguration,
    MpesaCallbackLog,
    MpesaCallbackRule,
    MpesaCallbackSecurityProfile,
)
from payments.serializers.payment_config_serializer import (
    PaymentGatewaySerializer,
    MpesaConfigSerializer,
    PayPalConfigSerializer,
    BankConfigSerializer,
    ClientPaymentMethodSerializer,
    TransactionSerializer,
    ConfigurationHistorySerializer,
    WebhookLogSerializer,
    WebhookSerializer,
    MpesaCallbackEventSerializer,
    MpesaCallbackConfigurationSerializer,
    MpesaCallbackLogSerializer,
    MpesaCallbackRuleSerializer,
    MpesaCallbackSecurityProfileSerializer,
    MpesaCallbackTestSerializer,
    MpesaCallbackBulkUpdateSerializer,
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from network_management.models.router_management_model import Router
from dotenv import load_dotenv
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator

load_dotenv()
logger = logging.getLogger(__name__)

MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")


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
            gateways = PaymentGateway.objects.all().prefetch_related(
                'mpesaconfig', 'paypalconfig', 'bankconfig'
            )
            serializer = PaymentGatewaySerializer(gateways, many=True)
            
            history = ConfigurationHistory.objects.all().order_by('-timestamp')[:10]
            history_serializer = ConfigurationHistorySerializer(history, many=True)
            
            base_url = request.build_absolute_uri('/')[:-1]
            
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
            if request.user.is_authenticated:
                gateways = PaymentGateway.objects.all().prefetch_related(
                    'mpesaconfig', 'paypalconfig', 'bankconfig'
                )
                serializer = PaymentGatewaySerializer(gateways, many=True)
                return Response({
                    "system": "dashboard",
                    "gateways": serializer.data
                })
            
            phone = request.query_params.get('phone')
            if not phone:
                return Response(
                    {"error": "Phone number is required for client access"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                phone = Client.format_phone_number(phone)
                
                User = get_user_model()
                
                if User.objects.filter(phone_number=phone).exists():
                    user = User.objects.get(phone_number=phone)
                    client, created = Client.objects.get_or_create(user=user)
                else:
                    user = User.objects.create_user(
                        phone_number=phone,
                        user_type='client',
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
            
            gateway.is_active = True
            gateway.save()
            
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
            
            if PaymentGateway.objects.filter(is_active=True).count() <= 1:
                return Response(
                    {"error": "Cannot deactivate the last payment method"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            gateway.is_active = False
            gateway.save()
            
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
    Handles payment initiation for M-Pesa, PayPal, and Bank transfers
    """
    def post(self, request):
        """
        Initiate a payment based on the selected gateway
        Validates all required fields before processing
        """
        try:
            gateway_id = request.data.get('gateway_id')
            amount = request.data.get('amount')
            plan_id = request.data.get('plan_id')
            
            if not all([gateway_id, amount, plan_id]):
                return Response(
                    {"error": "Missing required fields: gateway_id, amount, plan_id"},
                    status=status.HTTP_400_BAD_REQUEST
                )

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
                    phone = Client.format_phone_number(phone)
                    
                    User = get_user_model()
                    
                    if User.objects.filter(phone_number=phone).exists():
                        user = User.objects.get(phone_number=phone)
                        client, created = Client.objects.get_or_create(user=user)
                    else:
                        user = User.objects.create_user(
                            phone_number=phone,
                            user_type='client'
                        )
                        client = Client.objects.create(user=user)
                        
                except ValueError as e:
                    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response(
                        {"error": "Client creation failed"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

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

            if not ClientPaymentMethod.objects.filter(
                client=client, 
                gateway=gateway, 
                is_active=True
            ).exists():
                return Response(
                    {"error": "Payment method not available for this client"},
                    status=status.HTTP_403_FORBIDDEN
                )

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
            
            try:
                phone = Client.format_phone_number(phone)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
            mpesa_config = gateway.mpesaconfig
            
            token = self.generate_mpesa_token(mpesa_config, gateway.sandbox_mode)
            if not token:
                return Response(
                    {"error": "Failed to authenticate with M-Pesa"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            business_short_code = mpesa_config.paybill_number or mpesa_config.till_number
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
            
            base_url = "https://sandbox.safaricom.co.ke" if gateway.sandbox_mode else "https://api.safaricom.co.ke"
            
            response = requests.post(
                f"{base_url}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('ResponseCode') == '0':
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
            
            response = requests.post(
                f"{base_url}/v2/checkout/orders",
                json=order_payload,
                headers=headers,
                timeout=30
            ).json()
            
            if response.get('status') in ['CREATED', 'APPROVED']:
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
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 10)), 50)
            
            history = ConfigurationHistory.objects.filter(
                timestamp__gte=timezone.now() - timedelta(days=30)
            ).order_by('-timestamp')
            
            if search := request.query_params.get('search'):
                history = history.filter(
                    Q(model__icontains=search) |
                    Q(action__icontains=search) |
                    Q(user__username__icontains=search)
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

class MpesaCallbackEventView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            events = MpesaCallbackEvent.objects.filter(is_active=True)
            serializer = MpesaCallbackEventSerializer(events, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch callback events: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch callback events", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def post(self, request):
        try:
            serializer = MpesaCallbackEventSerializer(data=request.data)
            if serializer.is_valid():
                event = serializer.save()
                ConfigurationHistory.objects.create(
                    action="create",
                    model="MpesaCallbackEvent",
                    object_id=str(event.id),
                    changes=list(request.data.keys()),
                    new_values=request.data,
                    user=request.user
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create callback event: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create callback event", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackConfigurationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            router_id = request.query_params.get('router_id')
            event_type = request.query_params.get('event_type')
            
            queryset = MpesaCallbackConfiguration.objects.select_related('router', 'event')
            
            if router_id:
                queryset = queryset.filter(router_id=router_id)
            if event_type:
                queryset = queryset.filter(event__name=event_type)
            
            serializer = MpesaCallbackConfigurationSerializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch callback configurations: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch callback configurations", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def post(self, request):
        try:
            serializer = MpesaCallbackConfigurationSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                configuration = serializer.save()
                
                if not configuration.webhook_secret:
                    configuration.generate_webhook_secret()
                
                return Response(
                    MpesaCallbackConfigurationSerializer(configuration).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create callback configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create callback configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackConfigurationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(MpesaCallbackConfiguration, pk=pk)
    
    def get(self, request, pk):
        try:
            configuration = self.get_object(pk)
            serializer = MpesaCallbackConfigurationSerializer(configuration)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch callback configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch callback configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def put(self, request, pk):
        try:
            configuration = self.get_object(pk)
            serializer = MpesaCallbackConfigurationSerializer(
                configuration, data=request.data, partial=True, context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to update callback configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to update callback configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request, pk):
        try:
            configuration = self.get_object(pk)
            configuration_id = str(configuration.id)
            configuration.delete()
            ConfigurationHistory.objects.create(
                action="delete",
                model="MpesaCallbackConfiguration",
                object_id=configuration_id,
                changes=["Deleted callback configuration"],
                user=request.user
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Failed to delete callback configuration: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to delete callback configuration", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackBulkOperationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            serializer = MpesaCallbackBulkUpdateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            configurations = MpesaCallbackConfiguration.objects.filter(
                id__in=data['configuration_ids']
            )
            
            update_fields = {}
            if 'is_active' in data:
                update_fields['is_active'] = data['is_active']
            if 'security_level' in data:
                update_fields['security_level'] = data['security_level']
            
            if update_fields:
                configurations.update(**update_fields)
                ConfigurationHistory.objects.create(
                    action="update",
                    model="MpesaCallbackConfiguration",
                    object_id="bulk_update",
                    changes=list(update_fields.keys()),
                    new_values=update_fields,
                    user=request.user
                )
            
            return Response({
                "message": f"Updated {configurations.count()} configurations",
                "updated_count": configurations.count()
            })
        except Exception as e:
            logger.error(f"Failed to perform bulk update: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to perform bulk update", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            serializer = MpesaCallbackTestSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            configuration = get_object_or_404(
                MpesaCallbackConfiguration, 
                id=data['configuration_id']
            )
            
            test_result = self.test_callback_configuration(
                configuration, 
                data['test_payload'],
                data['validate_security']
            )
            
            return Response(test_result)
        except Exception as e:
            logger.error(f"Callback test failed: {str(e)}", exc_info=True)
            return Response(
                {"error": "Callback test failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def test_callback_configuration(self, configuration, test_payload, validate_security):
        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'SurfZone-Callback-Tester/1.0'
            }
            
            if validate_security and configuration.security_level != 'low':
                headers.update(self.generate_security_headers(configuration))
            
            headers.update(configuration.custom_headers or {})
            
            response = requests.post(
                configuration.callback_url,
                json=test_payload,
                headers=headers,
                timeout=configuration.timeout_seconds
            )
            
            MpesaCallbackLog.objects.create(
                configuration=configuration,
                payload=test_payload,
                response_status=response.status_code,
                response_body=response.text[:1000],
                status='success' if response.ok else 'failed',
                is_test=True,
                processed_at=timezone.now()
            )
            
            return {
                "success": response.ok,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "configuration_id": str(configuration.id),
                "message": "Test completed successfully" if response.ok else "Test failed"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Callback test failed: {str(e)}")
            MpesaCallbackLog.objects.create(
                configuration=configuration,
                payload=test_payload,
                status='failed',
                is_test=True,
                error_message=str(e)
            )
            return {
                "success": False,
                "error": str(e),
                "configuration_id": str(configuration.id),
                "message": "Test failed with network error"
            }
    
    def generate_security_headers(self, configuration):
        headers = {}
        if configuration.webhook_secret:
            headers['X-Callback-Signature'] = f"test-signature-{configuration.webhook_secret[:8]}"
        if configuration.security_level in ['high', 'critical']:
            headers['X-Security-Level'] = configuration.security_level
        return headers

class MpesaCallbackLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            configuration_id = request.query_params.get('configuration_id')
            status_filter = request.query_params.get('status')
            days = int(request.query_params.get('days', 7))
            
            start_date = timezone.now() - timedelta(days=days)
            
            queryset = MpesaCallbackLog.objects.filter(
                created_at__gte=start_date
            ).select_related('configuration', 'configuration__router', 'configuration__event')
            
            if configuration_id:
                queryset = queryset.filter(configuration_id=configuration_id)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            serializer = MpesaCallbackLogSerializer(queryset, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {"error": "Invalid query parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Failed to fetch callback logs: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch callback logs", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackRuleView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            rules = MpesaCallbackRule.objects.filter(is_active=True)
            serializer = MpesaCallbackRuleSerializer(rules, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch callback rules: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch callback rules", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def post(self, request):
        try:
            serializer = MpesaCallbackRuleSerializer(data=request.data)
            if serializer.is_valid():
                rule = serializer.save()
                ConfigurationHistory.objects.create(
                    action="create",
                    model="MpesaCallbackRule",
                    object_id=str(rule.id),
                    changes=list(request.data.keys()),
                    new_values=request.data,
                    user=request.user
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create callback rule: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create callback rule", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackSecurityProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profiles = MpesaCallbackSecurityProfile.objects.all()
            serializer = MpesaCallbackSecurityProfileSerializer(profiles, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Failed to fetch security profiles: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch security profiles", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def post(self, request):
        try:
            serializer = MpesaCallbackSecurityProfileSerializer(data=request.data)
            if serializer.is_valid():
                profile = serializer.save()
                ConfigurationHistory.objects.create(
                    action="create",
                    model="MpesaCallbackSecurityProfile",
                    object_id=str(profile.id),
                    changes=list(request.data.keys()),
                    new_values=request.data,
                    user=request.user
                )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to create security profile: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to create security profile", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class MpesaCallbackDispatcherView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, router_id):
        try:
            router = get_object_or_404(Router, id=router_id, is_active=True)
            payload = request.data

            event_type = self.detect_event_type(payload)

            configuration = MpesaCallbackConfiguration.objects.filter(
                router=router,
                event__name=event_type,
                is_active=True
            ).first()

            if not configuration:
                logger.warning(f"No callback configuration found for {event_type} on router {router.name}")
                return JsonResponse({"status": "no_configuration"}, status=404)

            final_configuration = self.apply_routing_rules(configuration, payload, request)
            delivery_result = self.deliver_callback(final_configuration, payload, request)

            transaction = None
            if event_type in ['payment_success', 'payment_failure', 'reversal']:
                checkout_id = payload.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
                if checkout_id:
                    try:
                        transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
                    except Transaction.DoesNotExist:
                        pass

            MpesaCallbackLog.objects.create(
                configuration=final_configuration,
                transaction=transaction,
                payload=payload,
                response_status=delivery_result.get('status_code'),
                response_body=delivery_result.get('response_body', '')[:1000],
                status=delivery_result.get('status', 'failed'),
                error_message=delivery_result.get('error_message', '')
            )

            if delivery_result['success']:
                if event_type == 'payment_success' and transaction:
                    items = payload.get('Body', {}).get('stkCallback', {}).get('CallbackMetadata', {}).get('Item', [])
                    metadata = {item['Name']: item.get('Value') for item in items}
                    transaction.status = 'completed'
                    transaction.metadata.update({
                        'mpesa_receipt': metadata.get('MpesaReceiptNumber'),
                        'phone_number': metadata.get('PhoneNumber'),
                        'amount': metadata.get('Amount'),
                        'transaction_date': metadata.get('TransactionDate'),
                        'callback_data': payload
                    })
                    transaction.save()

                    plan = transaction.plan
                    client = transaction.client
                    if plan.expiry_unit == 'Days':
                        expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
                    else:
                        expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                    
                    Subscription.objects.update_or_create(
                        client=client,
                        internet_plan=plan,
                        defaults={
                            'is_active': True,
                            'start_date': timezone.now(),
                            'end_date': expiry_date
                        }
                    )
                elif event_type == 'payment_failure' and transaction:
                    transaction.status = 'failed'
                    transaction.metadata.update({
                        'error': payload.get('Body', {}).get('stkCallback', {}).get('ResultDesc', 'Payment failed'),
                        'callback_data': payload
                    })
                    transaction.save()

                return JsonResponse({"status": "success"})
            return JsonResponse(
                {"status": "error", "message": delivery_result.get('error_message')},
                status=500
            )

        except Exception as e:
            logger.error(f"Callback dispatcher error: {str(e)}", exc_info=True)
            return JsonResponse({"status": "error", "message": "Internal server error"}, status=500)

    def detect_event_type(self, payload):
        if payload.get('ResultCode') == '0':
            return 'payment_success'
        elif payload.get('ResultCode') and payload.get('ResultCode') != '0':
            return 'payment_failure'
        elif payload.get('TransactionType') == 'Reversal':
            return 'reversal'
        else:
            return 'confirmation'

    def apply_routing_rules(self, configuration, payload, request):
        rules = MpesaCallbackRule.objects.filter(is_active=True).order_by('priority')
        for rule in rules:
            if self.evaluate_rule(rule, payload, request):
                return rule.target_configuration
        return configuration

    def evaluate_rule(self, rule, payload, request):
        if rule.rule_type == 'header_based':
            return self.evaluate_header_rule(rule, request)
        elif rule.rule_type == 'payload_based':
            return self.evaluate_payload_rule(rule, payload)
        elif rule.rule_type == 'ip_based':
            return self.evaluate_ip_rule(rule, request)
        elif rule.rule_type == 'geo_based':
            return self.evaluate_geo_rule(rule, request)
        return False

    def evaluate_header_rule(self, rule, request):
        for key, value in rule.condition.items():
            if request.headers.get(key) != value:
                return False
        return True

    def evaluate_payload_rule(self, rule, payload):
        for key, value in rule.condition.items():
            if payload.get(key) != value:
                return False
        return True

    def evaluate_ip_rule(self, rule, request):
        ip = request.META.get('REMOTE_ADDR')
        allowed_ips = rule.condition.get('allowed_ips', [])
        return ip in allowed_ips

    def evaluate_geo_rule(self, rule, request):
        logger.warning("Geo rule evaluation not fully implemented.")
        return True

    def deliver_callback(self, configuration, payload, request):
        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': f"SurfZone-Router-{configuration.router.name}"
            }

            if configuration.webhook_secret:
                headers['X-Callback-Signature'] = self.generate_signature(payload, configuration.webhook_secret)

            headers.update(configuration.custom_headers or {})
            headers['X-Forwarded-For'] = request.META.get('REMOTE_ADDR', '')

            response = requests.post(
                configuration.callback_url,
                json=payload,
                headers=headers,
                timeout=configuration.timeout_seconds
            )

            return {
                'success': response.ok,
                'status_code': response.status_code,
                'response_body': response.text,
                'status': 'success' if response.ok else 'failed'
            }

        except requests.exceptions.RequestException as e:
            logger.error(f"Callback delivery failed: {str(e)}", exc_info=True)
            return {'success': False, 'error_message': str(e), 'status': 'failed'}

    def generate_signature(self, payload, secret):
        sorted_payload = json.dumps(payload, sort_keys=True)
        return hmac.new(secret.encode(), sorted_payload.encode(), hashlib.sha256).hexdigest()

class MpesaCallbackAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
            router_id = request.query_params.get('router_id')
            
            start_date = timezone.now() - timedelta(days=days)
            
            logs = MpesaCallbackLog.objects.filter(created_at__gte=start_date)
            if router_id:
                logs = logs.filter(configuration__router_id=router_id)
            
            total = logs.count()
            successful = logs.filter(status='success').count()
            success_rate = (successful / total * 100) if total > 0 else 0
            
            status_distribution = logs.values('status').annotate(count=Count('id'))  # Updated: models.Count → Count
            
            response_times = logs.exclude(processed_at=None).annotate(
                duration=ExpressionWrapper(  # Updated: models.ExpressionWrapper → ExpressionWrapper
                    F('processed_at') - F('created_at'),  # Updated: models.F → F
                    output_field=DurationField()  # Updated: models.DurationField → DurationField
                )
            ).aggregate(
                avg_duration=Avg('duration'),  # Updated: models.Avg → Avg
                max_duration=Max('duration'),  # Updated: models.Max → Max
                min_duration=Min('duration')   # Updated: models.Min → Min
            )
            
            router_performance = logs.values(
                'configuration__router__name'
            ).annotate(
                total=Count('id'),  # Updated: models.Count → Count
                success=Count('id', filter=Q(status='success')),  # Updated: models.Count → Count, models.Q → Q
                avg_response_time=Avg(  # Updated: models.Avg → Avg
                    ExpressionWrapper(  # Updated: models.ExpressionWrapper → ExpressionWrapper
                        F('processed_at') - F('created_at'),  # Updated: models.F → F
                        output_field=DurationField()  # Updated: models.DurationField → DurationField
                    )
                )
            )
            
            return Response({
                'success_rate': round(success_rate, 2),
                'total_callbacks': total,
                'successful_callbacks': successful,
                'status_distribution': list(status_distribution),
                'response_times': {
                    'avg_duration': response_times['avg_duration'].total_seconds() if response_times['avg_duration'] else None,
                    'max_duration': response_times['max_duration'].total_seconds() if response_times['max_duration'] else None,
                    'min_duration': response_times['min_duration'].total_seconds() if response_times['min_duration'] else None,
                },
                'router_performance': list(router_performance),
                'time_period': f"Last {days} days"
            })
        except ValueError:
            return Response(
                {"error": "Invalid query parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Failed to fetch callback analytics: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to fetch callback analytics", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@method_decorator(csrf_exempt, name='dispatch')
class PayPalCallbackView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        PayPal payment callback handler
        Processes PayPal IPN notifications
        """
        try:
            data = request.data
            event_type = data.get('event_type')
            resource = data.get('resource', {})
            order_id = resource.get('id')
            
            if not order_id:
                return JsonResponse(
                    {"status": "error", "message": "Missing order ID"},
                    status=400
                )

            try:
                transaction = Transaction.objects.get(metadata__paypal_order_id=order_id)
            except Transaction.DoesNotExist:
                return JsonResponse(
                    {"status": "error", "message": "Transaction not found"},
                    status=404
                )
            
            if event_type == 'PAYMENT.CAPTURE.COMPLETED':
                transaction.status = 'completed'
                transaction.metadata.update({
                    'paypal_capture_id': resource.get('id'),
                    'payer_email': resource.get('payer', {}).get('email_address'),
                    'amount': resource.get('amount', {}).get('value'),
                    'currency': resource.get('amount', {}).get('currency_code'),
                    'callback_data': data
                })
                transaction.save()
                
                plan = transaction.plan
                client = transaction.client
                
                if plan.expiry_unit == 'Days':
                    expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
                else:
                    expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                
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

@method_decorator(csrf_exempt, name='dispatch')
class BankCallbackView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Bank transfer callback handler
        Processes manual bank payment confirmations
        """
        try:
            data = request.data
            reference = data.get('reference')
            status = data.get('status')
            proof_url = data.get('proof_url')
            
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
                    'verified_by': data.get('verified_by', 'admin'),
                    'verified_at': timezone.now().isoformat(),
                    'proof_url': proof_url,
                    'callback_data': data
                })
                transaction.save()
                
                plan = transaction.plan
                client = transaction.client
                
                if plan.expiry_unit == 'Days':
                    expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
                else:
                    expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
                
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

@csrf_exempt
def mpesa_callback(request):
    """
    Legacy M-Pesa payment callback handler
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

        try:
            transaction = Transaction.objects.get(metadata__checkout_request_id=checkout_id)
        except Transaction.DoesNotExist:
            return JsonResponse(
                {"ResultCode": 1, "ResultDesc": "Transaction not found"},
                status=404
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
            
            plan = transaction.plan
            client = transaction.client
            
            if plan.expiry_unit == 'Days':
                expiry_date = timezone.now() + timedelta(days=plan.expiry_value)
            else:
                expiry_date = timezone.now() + timedelta(days=30 * plan.expiry_value)
            
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