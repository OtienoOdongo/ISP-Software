# import requests, base64, json, re, os
# from datetime import datetime, timedelta
# from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse, HttpResponseBadRequest
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from payments.models.mpesa_configuration import Transaction
# from account.models.admin_model import Client, Subscription, Payment
# from internet_plans.models.create_plan_models import InternetPlan
# from django.utils import timezone
# from dotenv import load_dotenv

# load_dotenv()

# # M-Pesa credentials
# CONSUMER_KEY = os.getenv("CONSUMER_KEY")
# CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
# MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
# MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
# CALLBACK_URL = os.getenv("CALLBACK_URL")
# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL")

# def format_phone_number(phone):
#     phone = phone.replace("+", "")
#     if re.match(r"^254\d{9}$", phone):
#         return phone
#     elif phone.startswith("0") and len(phone) == 10:
#         return "254" + phone[1:]
#     else:
#         raise ValueError("Invalid phone number format")

# def generate_access_token():
#     try:
#         credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
#         encoded_credentials = base64.b64encode(credentials.encode()).decode()
#         headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
#         response = requests.get(
#             f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
#             headers=headers,
#         ).json()
#         return response["access_token"]
#     except requests.RequestException as e:
#         raise Exception(f"Failed to connect to M-Pesa: {str(e)}")

# def initiate_stk_push(phone, amount, plan_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         stk_password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE,
#             "Password": stk_password,
#             "Timestamp": timestamp,
#             "TransactionType": "CustomerPayBillOnline",
#             "Amount": str(amount),
#             "PartyA": phone,
#             "PartyB": MPESA_SHORTCODE,
#             "PhoneNumber": phone,
#             "CallBackURL": CALLBACK_URL,
#             "AccountReference": f"Plan_{plan_id}",
#             "TransactionDesc": "Internet Plan Purchase",
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
#             json=request_body,
#             headers=headers,
#         ).json()

#         if "ResponseCode" in response and response["ResponseCode"] == "0":
#             return response
#         else:
#             raise Exception(response.get("errorMessage", "Unknown error"))
#     except Exception as e:
#         raise Exception(f"Failed to initiate STK Push: {str(e)}")

# def query_stk_push(checkout_request_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE,
#             "Password": password,
#             "Timestamp": timestamp,
#             "CheckoutRequestID": checkout_request_id
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
#             json=request_body,
#             headers=headers,
#         ).json()
#         return response
#     except requests.RequestException as e:
#         return {"error": str(e)}

# class MpesaConfigView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         config = {
#             "apiKey": CONSUMER_KEY,
#             "secretKey": CONSUMER_SECRET,
#             "shortCode": MPESA_SHORTCODE,
#             "passKey": MPESA_PASSKEY,
#             "callbackURL": CALLBACK_URL,
#             "validationURL": os.getenv("VALIDATION_URL", ""),
#         }
#         return Response(config)

#     def post(self, request):
#         # For security, don’t store in DB; update environment variables or a secure vault in production
#         return Response(request.data, status=200)

# class InitiatePaymentView(APIView):
#     permission_classes = [AllowAny]  # Public endpoint for landing page

#     def post(self, request):
#         phone = request.data.get("phone_number")
#         amount = request.data.get("amount")
#         plan_id = request.data.get("plan_id")

#         if not all([phone, amount, plan_id]):
#             return Response({"error": "Missing required fields"}, status=400)

#         try:
#             phone = format_phone_number(phone)
#             plan = InternetPlan.objects.get(id=plan_id)
#             response = initiate_stk_push(phone, amount, plan_id)

#             # Create a pending transaction
#             transaction = Transaction.objects.create(
#                 amount=amount,
#                 checkout_id=response["CheckoutRequestID"],
#                 phone_number=phone,
#                 status="Pending",
#                 plan=plan
#             )
#             return Response({"checkout_request_id": response["CheckoutRequestID"]}, status=200)
#         except Exception as e:
#             return Response({"error": str(e)}, status=400)

# class StkStatusView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         checkout_request_id = request.data.get("checkout_request_id")
#         if not checkout_request_id:
#             return Response({"error": "CheckoutRequestID required"}, status=400)

#         status = query_stk_push(checkout_request_id)
#         return Response({"status": status})

# @csrf_exempt
# def payment_callback(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         callback_data = json.loads(request.body)
#         result_code = callback_data["Body"]["stkCallback"]["ResultCode"]

#         checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]
#         transaction = Transaction.objects.get(checkout_id=checkout_id)

#         if result_code == 0:
#             metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
#             amount = next(item["Value"] for item in metadata if item["Name"] == "Amount")
#             mpesa_code = next(item["Value"] for item in metadata if item["Name"] == "MpesaReceiptNumber")
#             phone = next(item["Value"] for item in metadata if item["Name"] == "PhoneNumber"])

#             transaction.mpesa_code = mpesa_code
#             transaction.status = "Success"
#             transaction.save()

#             client, created = Client.objects.get_or_create(
#                 phonenumber=phone,
#                 defaults={"full_name": "New Client"}
#             )
#             Payment.objects.create(client=client, amount=amount)

#             plan = transaction.plan
#             expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
#             Subscription.objects.create(
#                 client=client,
#                 is_active=True,
#                 end_date=timezone.now() + timedelta(days=expiry_days)
#             )
#             plan.purchases += 1
#             plan.save()

#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
#         else:
#             transaction.status = "Failed"
#             transaction.save()
#             return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
#     except Exception as e:
#         return HttpResponseBadRequest(f"Invalid request data: {str(e)}")







# import requests, base64, json, re, os
# from datetime import datetime, timedelta
# from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse, HttpResponseBadRequest
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from payments.models.mpesa_config_model import Transaction
# from payments.serializers.mpesa_config_serializer import TransactionSerializer
# from account.models.admin_model import Client, Subscription, Payment
# from account.serializers.admin_serializer import PaymentSerializer
# from internet_plans.models.create_plan_models import InternetPlan
# from django.utils import timezone
# from dotenv import load_dotenv

# load_dotenv()

# # M-Pesa credentials
# CONSUMER_KEY = os.getenv("CONSUMER_KEY")
# CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
# MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
# MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
# CALLBACK_URL = os.getenv("CALLBACK_URL")
# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")  # Default to sandbox

# def format_phone_number(phone):
#     phone = phone.replace("+", "")
#     if re.match(r"^254\d{9}$", phone):
#         return phone
#     elif phone.startswith("0") and len(phone) == 10:
#         return "254" + phone[1:]
#     else:
#         raise ValueError("Invalid phone number format. Use 2547XXXXXXXX or 07XXXXXXXX.")

# def generate_access_token():
#     try:
#         credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
#         encoded_credentials = base64.b64encode(credentials.encode()).decode()
#         headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
#         response = requests.get(
#             f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
#             headers=headers,
#         ).json()
#         return response["access_token"]
#     except requests.RequestException as e:
#         raise Exception(f"Failed to generate access token: {str(e)}")

# def initiate_stk_push(phone, amount, plan_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         stk_password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE,
#             "Password": stk_password,
#             "Timestamp": timestamp,
#             "TransactionType": "CustomerPayBillOnline",
#             "Amount": str(amount),
#             "PartyA": phone,
#             "PartyB": MPESA_SHORTCODE,
#             "PhoneNumber": phone,
#             "CallBackURL": CALLBACK_URL,
#             "AccountReference": f"Plan_{plan_id}",
#             "TransactionDesc": "Internet Plan Purchase",
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
#             json=request_body,
#             headers=headers,
#         ).json()

#         if "ResponseCode" in response and response["ResponseCode"] == "0":
#             return response
#         else:
#             raise Exception(response.get("errorMessage", "Unknown error from M-Pesa"))
#     except Exception as e:
#         raise Exception(f"Failed to initiate STK Push: {str(e)}")

# def query_stk_push(checkout_request_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE,
#             "Password": password,
#             "Timestamp": timestamp,
#             "CheckoutRequestID": checkout_request_id
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
#             json=request_body,
#             headers=headers,
#         ).json()
#         return response
#     except requests.RequestException as e:
#         return {"error": f"Failed to query STK Push: {str(e)}"}

# class MpesaConfigView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         config = {
#             "apiKey": CONSUMER_KEY,
#             "secretKey": CONSUMER_SECRET,
#             "shortCode": MPESA_SHORTCODE,
#             "passKey": MPESA_PASSKEY,
#             "callbackURL": CALLBACK_URL,
#             "validationURL": os.getenv("VALIDATION_URL", ""),
#         }
#         return Response(config)

#     def post(self, request):
#         # For security, don’t store in DB; update environment variables or a secure vault in production
#         return Response(request.data, status=200)

# class InitiatePaymentView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone = request.data.get("phone_number")
#         amount = request.data.get("amount")
#         plan_id = request.data.get("plan_id")

#         if not all([phone, amount, plan_id]):
#             return Response({"error": "Missing required fields: phone_number, amount, and plan_id are required"}, status=400)

#         try:
#             phone = format_phone_number(phone)
#             plan = InternetPlan.objects.get(id=plan_id)
#             response = initiate_stk_push(phone, amount, plan_id)

#             # Create a pending transaction using TransactionSerializer
#             transaction_data = {
#                 "amount": float(amount),
#                 "checkout_id": response["CheckoutRequestID"],
#                 "phone_number": phone,
#                 "status": "Pending",
#                 "plan": plan.id
#             }
#             transaction_serializer = TransactionSerializer(data=transaction_data)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#                 return Response({"checkout_request_id": response["CheckoutRequestID"]}, status=200)
#             else:
#                 return Response({"error": "Transaction validation failed", "details": transaction_serializer.errors}, status=400)
#         except ValueError as ve:
#             return Response({"error": str(ve)}, status=400)
#         except InternetPlan.DoesNotExist:
#             return Response({"error": f"Plan with id {plan_id} not found"}, status=404)
#         except Exception as e:
#             return Response({"error": f"Payment initiation failed: {str(e)}"}, status=400)

# class StkStatusView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         checkout_request_id = request.data.get("checkout_request_id")
#         if not checkout_request_id:
#             return Response({"error": "CheckoutRequestID is required"}, status=400)

#         status = query_stk_push(checkout_request_id)
#         if "error" in status:
#             return Response({"error": status["error"]}, status=400)
#         return Response({"status": status})

# @csrf_exempt
# def payment_callback(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         callback_data = json.loads(request.body)
#         result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
#         checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

#         # Fetch the transaction
#         transaction = Transaction.objects.get(checkout_id=checkout_id)

#         if result_code == 0:
#             metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
#             # Safely extract metadata values with defaults
#             metadata_dict = {item["Name"]: item["Value"] for item in metadata}
#             amount = float(metadata_dict.get("Amount", 0))
#             mpesa_code = metadata_dict.get("MpesaReceiptNumber", "")
#             phone = metadata_dict.get("PhoneNumber", transaction.phone_number)  # Fallback to transaction phone if missing

#             # Update transaction using TransactionSerializer
#             transaction_data = {
#                 "amount": amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": phone,
#                 "mpesa_code": mpesa_code,
#                 "status": "Success",
#                 "plan": transaction.plan.id
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             # Create or get client
#             client, created = Client.objects.get_or_create(
#                 phonenumber=phone,
#                 defaults={"full_name": "New Client"}
#             )

#             # Explicitly create Payment instance using PaymentSerializer
#             payment_data = {
#                 "client": client.id,
#                 "amount": amount
#             }
#             payment_serializer = PaymentSerializer(data=payment_data)
#             if payment_serializer.is_valid():
#                 payment = payment_serializer.save()  # Save the Payment instance
#             else:
#                 return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

#             # Create subscription
#             plan = transaction.plan
#             expiry_days = int(plan.expiry.value) if plan.expiry.unit == "Days" else int(plan.expiry.value) * 30
#             Subscription.objects.create(
#                 client=client,
#                 is_active=True,
#                 end_date=timezone.now() + timedelta(days=expiry_days)
#             )

#             # Update plan purchases
#             plan.purchases += 1
#             plan.save()

#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
#         else:
#             # Update transaction status to Failed
#             transaction_data = {
#                 "amount": transaction.amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": transaction.phone_number,
#                 "status": "Failed",
#                 "plan": transaction.plan.id
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
#     except Transaction.DoesNotExist:
#         return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
#     except Exception as e:
#         return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")





# import requests
# import base64
# import json
# import re
# import os
# from datetime import datetime, timedelta
# from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse, HttpResponseBadRequest
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from payments.models.mpesa_config_model import Transaction
# from payments.serializers.mpesa_config_serializer import TransactionSerializer  # Corrected import
# from account.models.admin_model import Client, Subscription, Payment
# from account.serializers.admin_serializer import PaymentSerializer
# from internet_plans.models.create_plan_models import InternetPlan
# from django.utils import timezone
# from dotenv import load_dotenv

# load_dotenv()

# # M-Pesa credentials
# CONSUMER_KEY = os.getenv("CONSUMER_KEY")
# CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
# MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
# MPESA_SHORTCODE_TILL = os.getenv("MPESA_SHORTCODE_TILL")
# MPESA_SHORTCODE_STORE = os.getenv("MPESA_SHORTCODE_STORE")
# PHONE_NUMBER= os.getenv("PHONE_NUMBER")
# CALLBACK_URL = os.getenv("CALLBACK_URL")
# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")  # Default to sandbox

# def format_phone_number(phone):
#     phone = phone.replace("+", "")
#     if re.match(r"^254\d{9}$", phone):
#         return phone
#     elif phone.startswith("0") and len(phone) == 10:
#         return "254" + phone[1:]
#     else:
#         raise ValueError("Invalid phone number format. Use 2547XXXXXXXX or 07XXXXXXXX.")

# def generate_access_token():
#     try:
#         credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
#         encoded_credentials = base64.b64encode(credentials.encode()).decode()
#         headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
#         response = requests.get(
#             f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
#             headers=headers,
#         ).json()
#         return response["access_token"]
#     except requests.RequestException as e:
#         raise Exception(f"Failed to generate access token: {str(e)}")

# def initiate_stk_push(phone, amount, plan_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         stk_password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE_STORE,
#             "Password": stk_password,
#             "Timestamp": timestamp,
#             "TransactionType": "CustomerBuyGoodsOnline",
#             "Amount": str(amount),
#             "PartyA": PHONE_NUMBER,
#             "PartyB": MPESA_SHORTCODE_TILL,
#             "PhoneNumber": PHONE_NUMBER,
#             "CallBackURL": CALLBACK_URL,
#             "AccountReference": f"Plan_{plan_id}",
#             "TransactionDesc": "Internet Plan Purchase",
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
#             json=request_body,
#             headers=headers,
#         ).json()

#         if "ResponseCode" in response and response["ResponseCode"] == "0":
#             return response
#         else:
#             raise Exception(response.get("errorMessage", "Unknown error from M-Pesa"))
#     except Exception as e:
#         raise Exception(f"Failed to initiate STK Push: {str(e)}")

# def query_stk_push(checkout_request_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE,
#             "Password": password,
#             "Timestamp": timestamp,
#             "CheckoutRequestID": checkout_request_id
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
#             json=request_body,
#             headers=headers,
#         ).json()
#         return response
#     except requests.RequestException as e:
#         return {"error": f"Failed to query STK Push: {str(e)}"}

# class MpesaConfigView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         config = {
#             "apiKey": CONSUMER_KEY,
#             "secretKey": CONSUMER_SECRET,
#             "shortCode": MPESA_SHORTCODE,
#             "passKey": MPESA_PASSKEY,
#             "callbackURL": CALLBACK_URL,
#             "validationURL": os.getenv("VALIDATION_URL", ""),
#         }
#         return Response(config)

#     def post(self, request):
#         return Response(request.data, status=200)

# class InitiatePaymentView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone = request.data.get("phone_number")
#         amount = request.data.get("amount")
#         plan_id = request.data.get("plan_id")

#         if not all([phone, amount, plan_id]):
#             return Response({"error": "Missing required fields: phone_number, amount, and plan_id are required"}, status=400)

#         try:
#             phone = format_phone_number(phone)
#             plan = InternetPlan.objects.get(id=plan_id)
#             response = initiate_stk_push(phone, amount, plan_id)

#             transaction_data = {
#                 "amount": float(amount),
#                 "checkout_id": response["CheckoutRequestID"],
#                 "phone_number": phone,
#                 "status": "Pending",
#                 "plan": plan.id
#             }
#             transaction_serializer = TransactionSerializer(data=transaction_data)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#                 return Response({"checkout_request_id": response["CheckoutRequestID"]}, status=200)
#             else:
#                 return Response({"error": "Transaction validation failed", "details": transaction_serializer.errors}, status=400)
#         except ValueError as ve:
#             return Response({"error": str(ve)}, status=400)
#         except InternetPlan.DoesNotExist:
#             return Response({"error": f"Plan with id {plan_id} not found"}, status=404)
#         except Exception as e:
#             return Response({"error": f"Payment initiation failed: {str(e)}"}, status=400)

# class StkStatusView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         checkout_request_id = request.data.get("checkout_request_id")
#         if not checkout_request_id:
#             return Response({"error": "CheckoutRequestID is required"}, status=400)

#         status = query_stk_push(checkout_request_id)
#         if "error" in status:
#             return Response({"error": status["error"]}, status=400)
#         return Response({"status": status})

# @csrf_exempt
# def payment_callback(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         callback_data = json.loads(request.body)
#         result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
#         checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

#         transaction = Transaction.objects.get(checkout_id=checkout_id)

#         if result_code == 0:
#             metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
#             metadata_dict = {item["Name"]: item["Value"] for item in metadata}
#             amount = float(metadata_dict.get("Amount", 0))
#             mpesa_code = metadata_dict.get("MpesaReceiptNumber", "")
#             phone = metadata_dict.get("PhoneNumber", transaction.phone_number)

#             transaction_data = {
#                 "amount": amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": phone,
#                 "mpesa_code": mpesa_code,
#                 "status": "Success",
#                 "plan": transaction.plan.id
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             client, created = Client.objects.get_or_create(
#                 phonenumber=phone,
#                 defaults={"full_name": "New Client"}
#             )

#             payment_data = {
#                 "client": client.id,
#                 "amount": amount
#             }
#             payment_serializer = PaymentSerializer(data=payment_data)
#             if payment_serializer.is_valid():
#                 payment_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

#             plan = transaction.plan
#             expiry_days = int(plan.expiry.value) if plan.expiry.unit == "Days" else int(plan.expiry.value) * 30
#             Subscription.objects.create(
#                 client=client,
#                 is_active=True,
#                 end_date=timezone.now() + timedelta(days=expiry_days)
#             )

#             plan.purchases += 1
#             plan.save()

#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
#         else:
#             transaction_data = {
#                 "amount": transaction.amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": transaction.phone_number,
#                 "status": "Failed",
#                 "plan": transaction.plan.id
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
#     except Transaction.DoesNotExist:
#         return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
#     except Exception as e:
#         return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")





# import requests
# import base64
# import json
# import re
# import os
# from datetime import datetime, timedelta
# from django.shortcuts import render
# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse, HttpResponseBadRequest
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from payments.models.mpesa_config_model import Transaction
# from payments.serializers.mpesa_config_serializer import TransactionSerializer
# from account.models.admin_model import Client, Subscription, Payment
# from account.serializers.admin_serializer import PaymentSerializer
# from internet_plans.models.create_plan_models import InternetPlan
# from django.utils import timezone
# from dotenv import load_dotenv

# load_dotenv()

# # M-Pesa credentials
# CONSUMER_KEY = os.getenv("CONSUMER_KEY")
# CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
# MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
# MPESA_SHORTCODE_TILL = os.getenv("MPESA_SHORTCODE_TILL")  # Till Number
# MPESA_SHORTCODE_STORE = os.getenv("MPESA_SHORTCODE_STORE")  # Store/Head Office Number
# MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE")
# CALLBACK_URL = os.getenv("CALLBACK_URL")
# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")

# def format_phone_number(phone):
#     phone = ''.join(phone.split())  # Remove whitespace
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

# def generate_access_token():
#     try:
#         credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
#         encoded_credentials = base64.b64encode(credentials.encode()).decode()
#         headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
#         response = requests.get(
#             f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
#             headers=headers,
#         ).json()
#         return response["access_token"]
#     except requests.RequestException as e:
#         raise Exception(f"Failed to generate access token: {str(e)}")

# def initiate_stk_push(phone, amount, plan_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         stk_password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE_STORE,  
#             "Password": stk_password,
#             "Timestamp": timestamp,
#             "TransactionType": "CustomerBuyGoodsOnline",  
#             "Amount": str(amount),
#             "PartyA": phone, 
#             "PartyB": MPESA_SHORTCODE_TILL,  
#             "PhoneNumber": phone, 
#             "CallBackURL": CALLBACK_URL,
#             "AccountReference": f"Plan_{plan_id}",
#             "TransactionDesc": "Internet Plan Purchase",
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
#             json=request_body,
#             headers=headers,
#         ).json()

#         if "ResponseCode" in response and response["ResponseCode"] == "0":
#             return response
#         else:
#             raise Exception(response.get("errorMessage", "Unknown error from M-Pesa"))
#     except Exception as e:
#         raise Exception(f"Failed to initiate STK Push: {str(e)}")

# def query_stk_push(checkout_request_id):
#     try:
#         token = generate_access_token()
#         headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#         timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#         password = base64.b64encode(
#             (MPESA_SHORTCODE + MPESA_PASSKEY + timestamp).encode()
#         ).decode()

#         request_body = {
#             "BusinessShortCode": MPESA_SHORTCODE_STORE,  # Use Store Number for query
#             "Password": password,
#             "Timestamp": timestamp,
#             "CheckoutRequestID": checkout_request_id
#         }

#         response = requests.post(
#             f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
#             json=request_body,
#             headers=headers,
#         ).json()
#         return response
#     except requests.RequestException as e:
#         return {"error": f"Failed to query STK Push: {str(e)}"}

# class MpesaConfigView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         config = {
#             "apiKey": CONSUMER_KEY,
#             "secretKey": CONSUMER_SECRET,
#             "shortCodeTill": MPESA_SHORTCODE_TILL,  # Updated to reflect Till Number
#             "shortCodeStore": MPESA_SHORTCODE_STORE,  # Added Store Number
#             "passKey": MPESA_PASSKEY,
#             "callbackURL": CALLBACK_URL,
#         }
#         return Response(config)

#     def post(self, request):
#         return Response(request.data, status=200)

# class InitiatePaymentView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone = request.data.get("phone_number")
#         amount = request.data.get("amount")
#         plan_id = request.data.get("plan_id")

#         if not all([phone, amount, plan_id]):
#             return Response({"error": "Missing required fields: phone_number, amount, and plan_id are required"}, status=400)

#         try:
#             phone = format_phone_number(phone)
#             plan = InternetPlan.objects.get(id=plan_id)
#             response = initiate_stk_push(phone, amount, plan_id)

#             transaction_data = {
#                 "amount": float(amount),
#                 "checkout_id": response["CheckoutRequestID"],
#                 "phone_number": phone,
#                 "status": "Pending",
#                 "plan": plan.id
#             }
#             transaction_serializer = TransactionSerializer(data=transaction_data)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#                 return Response({"checkout_request_id": response["CheckoutRequestID"]}, status=200)
#             else:
#                 return Response({"error": "Transaction validation failed", "details": transaction_serializer.errors}, status=400)
#         except ValueError as ve:
#             return Response({"error": str(ve)}, status=400)
#         except InternetPlan.DoesNotExist:
#             return Response({"error": f"Plan with id {plan_id} not found"}, status=404)
#         except Exception as e:
#             return Response({"error": f"Payment initiation failed: {str(e)}"}, status=400)

# class StkStatusView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         checkout_request_id = request.data.get("checkout_request_id")
#         if not checkout_request_id:
#             return Response({"error": "CheckoutRequestID is required"}, status=400)

#         status = query_stk_push(checkout_request_id)
#         if "error" in status:
#             return Response({"error": status["error"]}, status=400)
#         return Response({"status": status})

# @csrf_exempt
# def payment_callback(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         callback_data = json.loads(request.body)
#         result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
#         checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

#         transaction = Transaction.objects.get(checkout_id=checkout_id)

#         if result_code == 0:
#             metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
#             metadata_dict = {item["Name"]: item["Value"] for item in metadata}
#             amount = float(metadata_dict.get("Amount", 0))
#             mpesa_code = metadata_dict.get("MpesaReceiptNumber", "")
#             phone = metadata_dict.get("PhoneNumber", transaction.phone_number)

#             transaction_data = {
#                 "amount": amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": phone,
#                 "mpesa_code": mpesa_code,
#                 "status": "Success",
#                 "plan": transaction.plan.id
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             client, created = Client.objects.get_or_create(
#                 phonenumber=phone,
#                 defaults={"full_name": "New Client"}
#             )

#             payment_data = {
#                 "client": client.id,
#                 "amount": amount
#             }
#             payment_serializer = PaymentSerializer(data=payment_data)
#             if payment_serializer.is_valid():
#                 payment_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

#             plan = transaction.plan
#             expiry_days = int(plan.expiry.value) if plan.expiry.unit == "Days" else int(plan.expiry.value) * 30
#             Subscription.objects.create(
#                 client=client,
#                 is_active=True,
#                 end_date=timezone.now() + timedelta(days=expiry_days)
#             )

#             plan.purchases += 1
#             plan.save()

#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
#         else:
#             transaction_data = {
#                 "amount": transaction.amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": transaction.phone_number,
#                 "status": "Failed",
#                 "plan": transaction.plan.id
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
#     except Transaction.DoesNotExist:
#         return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
#     except Exception as e:
#         return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")







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
# from rest_framework.permissions import AllowAny
# from rest_framework import status
# from payments.models.mpesa_config_model import (
#     PaymentMethodConfig, 
#     ConfigurationHistory, 
#     Transaction
# )
# from payments.serializers.mpesa_config_serializer import (
#     PaymentMethodConfigSerializer, 
#     ConfigurationHistorySerializer, 
#     TransactionSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment
# from account.serializers.admin_serializer import PaymentSerializer
# from internet_plans.models.create_plan_models import InternetPlan
# from dotenv import load_dotenv
# from phonenumber_field.phonenumber import PhoneNumber

# load_dotenv()
# logger = logging.getLogger(__name__)

# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")

# def format_phone_number(phone):
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

# class PaymentConfigView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             configs = PaymentMethodConfig.objects.filter(client=client)
#             serializer = PaymentMethodConfigSerializer(
#                 configs, 
#                 many=True,
#                 context={'request': request}
#             )
            
#             return Response({
#                 "paymentMethods": serializer.data,
#                 "configurationVersion": "1.2.0",
#                 "lastUpdated": max(
#                     (config.updated_at for config in configs), 
#                     default=timezone.now()
#                 ).isoformat(),
#                 "kenyanBanks": PaymentMethodConfig.KENYAN_BANKS,
#                 "securityLevels": dict(PaymentMethodConfig.SECURITY_LEVELS)
#             })
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to fetch payment configs: {str(e)}")
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#     def post(self, request):
#         phonenumber = request.data.get('phonenumber')
#         if not phonenumber:
#             return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

#         data = request.data.get('paymentMethods', [])
#         if not isinstance(data, list):
#             return Response({"error": "paymentMethods must be a list"}, status=status.HTTP_400_BAD_REQUEST)

#         saved_configs = []
#         changes = []
#         for method_data in data:
#             method_data['client'] = client.id
#             serializer = PaymentMethodConfigSerializer(
#                 data=method_data,
#                 context={'request': request}
#             )
            
#             if serializer.is_valid():
#                 instance = serializer.save()
#                 saved_configs.append(serializer.data)
#                 changes.append(f"Updated {method_data.get('method_type')} configuration")
#             else:
#                 return Response({
#                     "error": "Invalid configuration", 
#                     "details": serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)

#         # Log configuration changes
#         history_data = {
#             "client": client.id,
#             "action": "updated",
#             "changes": changes,
#             "status": "success",
#             "user": request.user.username if request.user.is_authenticated else "system"
#         }
#         history_serializer = ConfigurationHistorySerializer(data=history_data)
#         if history_serializer.is_valid():
#             history_serializer.save()

#         return Response({
#             "paymentMethods": saved_configs,
#             "configurationVersion": "1.2.0",
#             "lastUpdated": timezone.now().isoformat()
#         }, status=status.HTTP_201_CREATED)

#     def put(self, request, pk):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             config = PaymentMethodConfig.objects.get(pk=pk, client=client)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except PaymentMethodConfig.DoesNotExist:
#             return Response({"error": "Payment method configuration not found"}, status=status.HTTP_404_NOT_FOUND)

#         serializer = PaymentMethodConfigSerializer(
#             config, 
#             data=request.data, 
#             partial=True,
#             context={'request': request}
#         )
        
#         if serializer.is_valid():
#             instance = serializer.save()
#             # Log update
#             history_data = {
#                 "client": client.id,
#                 "action": "updated",
#                 "changes": [f"Modified fields: {', '.join(request.data.keys())}"],
#                 "status": "success",
#                 "user": request.user.username if request.user.is_authenticated else "system"
#             }
#             history_serializer = ConfigurationHistorySerializer(data=history_data)
#             if history_serializer.is_valid():
#                 history_serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
        
#         return Response({
#             "error": "Invalid data", 
#             "details": serializer.errors
#         }, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             config = PaymentMethodConfig.objects.get(pk=pk, client=client)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except PaymentMethodConfig.DoesNotExist:
#             return Response({"error": "Payment method configuration not found"}, status=status.HTTP_404_NOT_FOUND)

#         method_type = config.get_method_type_display()
#         config.delete()
#         # Log deletion
#         history_data = {
#             "client": client.id,
#             "action": "deleted",
#             "changes": [f"Removed {method_type} configuration"],
#             "status": "success",
#             "user": request.user.username if request.user.is_authenticated else "system"
#         }
#         history_serializer = ConfigurationHistorySerializer(data=history_data)
#         if history_serializer.is_valid():
#             history_serializer.save()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class TestConnectionView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request, pk):
#         """Enhanced test connection to payment provider"""
#         try:
#             config = PaymentMethodConfig.objects.get(pk=pk)
#             result = config.test_connection()
            
#             # Log the test with detailed status
#             ConfigurationHistory.objects.create(
#                 client=config.client,
#                 action="tested",
#                 status=result.get('status', 'pending'),
#                 changes=[f"Tested {config.method_type} connection: {result.get('message')}"],
#                 user=request.user.username if request.user.is_authenticated else "system"
#             )
            
#             return Response({
#                 "success": result.get('success', False),
#                 "message": result.get('message'),
#                 "status": result.get('status'),
#                 "method": config.method_type,
#                 "details": result.get('details', {}),
#                 "security_level": config.security_level
#             })
#         except PaymentMethodConfig.DoesNotExist:
#             return Response({
#                 "error": "Payment method configuration not found"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Connection test failed: {str(e)}")
#             return Response({
#                 "error": str(e),
#                 "status": "error"
#             }, status=status.HTTP_400_BAD_REQUEST)

# class ConfigurationHistoryView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             history = ConfigurationHistory.objects.filter(client=client).order_by('-timestamp')
#             serializer = ConfigurationHistorySerializer(history, many=True)
#             return Response({
#                 "history": serializer.data,
#                 "actions": dict(ConfigurationHistory.ACTIONS),
#                 "statuses": dict(ConfigurationHistory.STATUSES)
#             })
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to fetch config history: {str(e)}")
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class InitiatePaymentView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone = request.data.get("phone_number")
#         amount = request.data.get("amount")
#         plan_id = request.data.get("plan_id")
#         method_type = request.data.get("method_type")

#         if not all([phone, amount, plan_id, method_type]):
#             return Response({
#                 "error": "Missing required fields: phone_number, amount, plan_id, and method_type are required"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone = format_phone_number(phone)
#             phone_obj = PhoneNumber.from_string(phone)
#             client = Client.objects.get(phonenumber=phone_obj)
#             plan = InternetPlan.objects.get(id=plan_id)
#             config = PaymentMethodConfig.objects.filter(
#                 client=client, 
#                 method_type=method_type, 
#                 is_active=True
#             ).first()
            
#             if not config:
#                 return Response({
#                     "error": f"No active {method_type} configuration found for client"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             if method_type in ['mpesa_paybill', 'mpesa_till']:
#                 return self.initiate_mpesa_payment(phone, amount, plan, config, client)
#             else:
#                 return Response({
#                     "error": f"Payment method {method_type} not supported yet"
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except ValueError as ve:
#             return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 "error": f"Plan with id {plan_id} not found"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Payment initiation failed: {str(e)}")
#             return Response({
#                 "error": f"Payment initiation failed: {str(e)}"
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def initiate_mpesa_payment(self, phone, amount, plan, config, client):
#         try:
#             token = self.generate_access_token(config)
#             headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             stk_password = base64.b64encode(
#                 (config.short_code + config.pass_key + timestamp).encode()
#             ).decode()

#             request_body = {
#                 "BusinessShortCode": config.short_code if config.method_type == 'mpesa_paybill' else config.store_number,
#                 "Password": stk_password,
#                 "Timestamp": timestamp,
#                 "TransactionType": "CustomerPayBillOnline" if config.method_type == 'mpesa_paybill' else "CustomerBuyGoodsOnline",
#                 "Amount": str(amount),
#                 "PartyA": phone,
#                 "PartyB": config.short_code if config.method_type == 'mpesa_paybill' else config.till_number,
#                 "PhoneNumber": phone,
#                 "CallBackURL": config.callback_url,
#                 "AccountReference": f"Plan_{plan.id}",
#                 "TransactionDesc": "Internet Plan Purchase",
#             }

#             response = requests.post(
#                 f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
#                 json=request_body,
#                 headers=headers,
#             ).json()

#             if "ResponseCode" in response and response["ResponseCode"] == "0":
#                 transaction_data = {
#                     "amount": float(amount),
#                     "checkout_id": response["CheckoutRequestID"],
#                     "phone_number": phone,
#                     "status": "Pending",
#                     "plan": plan.id,
#                     "payment_method": config.id,
#                     "security_level": config.security_level
#                 }
#                 transaction_serializer = TransactionSerializer(data=transaction_data)
#                 if transaction_serializer.is_valid():
#                     transaction = transaction_serializer.save()
#                     return Response({
#                         "checkout_request_id": response["CheckoutRequestID"],
#                         "transaction_id": transaction.id,
#                         "security_level": config.security_level
#                     }, status=status.HTTP_200_OK)
#                 else:
#                     return Response({
#                         "error": "Transaction validation failed",
#                         "details": transaction_serializer.errors
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 return Response({
#                     "error": response.get("errorMessage", "Unknown error from M-Pesa"),
#                     "status": "failed"
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to initiate STK Push: {str(e)}")
#             return Response({
#                 "error": f"Failed to initiate STK Push: {str(e)}",
#                 "status": "error"
#             }, status=status.HTTP_400_BAD_REQUEST)

#     def generate_access_token(self, config):
#         try:
#             credentials = f"{config.api_key}:{config.secret_key}"
#             encoded_credentials = base64.b64encode(credentials.encode()).decode()
#             headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
#             response = requests.get(
#                 f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
#                 headers=headers,
#             ).json()
#             return response["access_token"]
#         except requests.RequestException as e:
#             raise Exception(f"Failed to generate access token: {str(e)}")

# class StkStatusView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         checkout_request_id = request.data.get("checkout_request_id")
#         if not checkout_request_id:
#             return Response({
#                 "error": "CheckoutRequestID is required"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             transaction = Transaction.objects.get(checkout_id=checkout_request_id)
#             config = transaction.payment_method
#             if not config or config.method_type not in ['mpesa_paybill', 'mpesa_till']:
#                 return Response({
#                     "error": "Invalid or unsupported payment method"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             token = self.generate_access_token(config)
#             headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             password = base64.b64encode(
#                 (config.short_code + config.pass_key + timestamp).encode()
#             ).decode()

#             request_body = {
#                 "BusinessShortCode": config.short_code if config.method_type == 'mpesa_paybill' else config.store_number,
#                 "Password": password,
#                 "Timestamp": timestamp,
#                 "CheckoutRequestID": checkout_request_id
#             }

#             response = requests.post(
#                 f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
#                 json=request_body,
#                 headers=headers,
#             ).json()
#             return Response({
#                 "status": response,
#                 "security_level": transaction.security_level
#             })
#         except Transaction.DoesNotExist:
#             return Response({
#                 "error": f"Transaction with checkout_id {checkout_request_id} not found"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to query STK Push: {str(e)}")
#             return Response({
#                 "error": f"Failed to query STK Push: {str(e)}"
#             }, status=status.HTTP_400_BAD_REQUEST)

# @csrf_exempt
# def payment_callback(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         callback_data = json.loads(request.body)
#         result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
#         checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

#         transaction = Transaction.objects.get(checkout_id=checkout_id)
#         config = transaction.payment_method
#         phone = PhoneNumber.from_string(transaction.phone_number)
#         client = Client.objects.get(phonenumber=phone)

#         if result_code == 0:
#             metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
#             metadata_dict = {item["Name"]: item["Value"] for item in metadata}
#             amount = float(metadata_dict.get("Amount", 0))
#             mpesa_code = metadata_dict.get("MpesaReceiptNumber", "")
#             phone = metadata_dict.get("PhoneNumber", transaction.phone_number)

#             transaction_data = {
#                 "amount": amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": phone,
#                 "mpesa_code": mpesa_code,
#                 "status": "Success",
#                 "plan": transaction.plan.id,
#                 "payment_method": config.id,
#                 "security_level": config.security_level
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             payment_data = {
#                 "client": client.id,
#                 "amount": amount,
#                 "transaction": transaction.id
#             }
#             payment_serializer = PaymentSerializer(data=payment_data)
#             if payment_serializer.is_valid():
#                 payment = payment_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

#             plan = transaction.plan
#             expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
#             subscription = Subscription.objects.create(
#                 client=client,
#                 internet_plan=plan,
#                 is_active=True,
#                 end_date=timezone.now() + timedelta(days=expiry_days)
#             )

#             payment.subscription = subscription
#             payment.save()

#             plan.purchases += 1
#             plan.save()

#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
#         else:
#             transaction_data = {
#                 "amount": transaction.amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": transaction.phone_number,
#                 "status": "Failed",
#                 "plan": transaction.plan.id,
#                 "payment_method": config.id,
#                 "security_level": "low"  # Mark failed transactions as low security
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
#     except Transaction.DoesNotExist:
#         return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
#     except Client.DoesNotExist:
#         return HttpResponseBadRequest("Client not found")
#     except Exception as e:
#         logger.error(f"Callback processing failed: {str(e)}")
#         return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")






import requests
import base64
import json
import os
import logging
from datetime import datetime, timedelta
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from payments.models.mpesa_config_model import PaymentMethodConfig, ConfigurationHistory, Transaction
from payments.serializers.mpesa_config_serializer import PaymentMethodConfigSerializer, ConfigurationHistorySerializer, TransactionSerializer
from account.models.admin_model import Client, Subscription, Payment
from account.serializers.admin_serializer import PaymentSerializer
from internet_plans.models.create_plan_models import InternetPlan
from dotenv import load_dotenv
from phonenumber_field.phonenumber import PhoneNumber

load_dotenv()
logger = logging.getLogger(__name__)

MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
PAYPAL_BASE_URL = os.getenv("PAYPAL_BASE_URL", "https://api-m.sandbox.paypal.com")

def format_phone_number(phone):
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

class PaymentConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            client = Client.objects.get(id=request.user.id)
            configs = PaymentMethodConfig.objects.filter(client=client)
            serializer = PaymentMethodConfigSerializer(
                configs, 
                many=True,
                context={'request': request}
            )
            
            return Response({
                "paymentMethods": serializer.data,
                "configurationVersion": "1.2.0",
                "lastUpdated": max(
                    (config.updated_at for config in configs), 
                    default=timezone.now()
                ).isoformat(),
                "kenyanBanks": PaymentMethodConfig.KENYAN_BANKS,
                "securityLevels": dict(PaymentMethodConfig.SECURITY_LEVELS)
            })
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to fetch payment configs: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            client = Client.objects.get(id=request.user.id)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.get('paymentMethods', [])
        if not isinstance(data, list):
            return Response({"error": "paymentMethods must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        saved_configs = []
        changes = []
        for method_data in data:
            method_data['client'] = client.id
            serializer = PaymentMethodConfigSerializer(
                data=method_data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                instance = serializer.save()
                saved_configs.append(serializer.data)
                changes.append(f"Created {method_data.get('method_type')} configuration")
            else:
                return Response({
                    "error": "Invalid configuration", 
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        # Log configuration changes
        history_data = {
            "client": client.id,
            "action": "created",
            "changes": changes,
            "status": "success",
            "user": request.user.username
        }
        history_serializer = ConfigurationHistorySerializer(data=history_data)
        if history_serializer.is_valid():
            history_serializer.save()

        return Response({
            "paymentMethods": saved_configs,
            "configurationVersion": "1.2.0",
            "lastUpdated": timezone.now().isoformat()
        }, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        try:
            client = Client.objects.get(id=request.user.id)
            config = PaymentMethodConfig.objects.get(pk=pk, client=client)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except PaymentMethodConfig.DoesNotExist:
            return Response({"error": "Payment method configuration not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentMethodConfigSerializer(
            config, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            instance = serializer.save()
            # Log update
            history_data = {
                "client": client.id,
                "action": "updated",
                "changes": [f"Modified fields: {', '.join(request.data.keys())}"],
                "status": "success",
                "user": request.user.username
            }
            history_serializer = ConfigurationHistorySerializer(data=history_data)
            if history_serializer.is_valid():
                history_serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({
            "error": "Invalid data", 
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            client = Client.objects.get(id=request.user.id)
            config = PaymentMethodConfig.objects.get(pk=pk, client=client)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except PaymentMethodConfig.DoesNotExist:
            return Response({"error": "Payment method configuration not found"}, status=status.HTTP_404_NOT_FOUND)

        method_type = config.get_method_type_display()
        config.delete()
        # Log deletion
        history_data = {
            "client": client.id,
            "action": "deleted",
            "changes": [f"Removed {method_type} configuration"],
            "status": "success",
            "user": request.user.username
        }
        history_serializer = ConfigurationHistorySerializer(data=history_data)
        if history_serializer.is_valid():
            history_serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TestConnectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Enhanced test connection to payment provider"""
        try:
            config = PaymentMethodConfig.objects.get(pk=pk, client__id=request.user.id)
            result = config.test_connection()
            
            # Log the test with detailed status
            ConfigurationHistory.objects.create(
                client=config.client,
                action="tested",
                status=result.get('status', 'pending'),
                changes=[f"Tested {config.method_type} connection: {result.get('message')}"],
                user=request.user.username
            )
            
            return Response({
                "success": result.get('success', False),
                "message": result.get('message'),
                "status": result.get('status'),
                "method": config.method_type,
                "details": result.get('details', {}),
                "security_level": config.security_level
            })
        except PaymentMethodConfig.DoesNotExist:
            return Response({
                "error": "Payment method configuration not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Connection test failed: {str(e)}")
            return Response({
                "error": str(e),
                "status": "error"
            }, status=status.HTTP_400_BAD_REQUEST)

class ConfigurationHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            client = Client.objects.get(id=request.user.id)
            history = ConfigurationHistory.objects.filter(client=client).order_by('-timestamp')
            serializer = ConfigurationHistorySerializer(history, many=True)
            return Response({
                "history": serializer.data,
                "actions": dict(ConfigurationHistory.ACTIONS),
                "statuses": dict(ConfigurationHistory.STATUSES)
            })
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to fetch config history: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone = request.data.get("phone_number")
        amount = request.data.get("amount")
        plan_id = request.data.get("plan_id")
        method_type = request.data.get("method_type")

        if not all([amount, plan_id, method_type]):
            return Response({
                "error": "Missing required fields: amount, plan_id, and method_type are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = Client.objects.get(id=request.user.id)
            plan = InternetPlan.objects.get(id=plan_id)
            config = PaymentMethodConfig.objects.filter(
                client=client, 
                method_type=method_type, 
                is_active=True
            ).first()
            
            if not config:
                return Response({
                    "error": f"No active {method_type} configuration found for client"
                }, status=status.HTTP_400_BAD_REQUEST)

            # --- M-Pesa Payment Initiation ---
            if method_type in ['mpesa_paybill', 'mpesa_till']:
                if not phone:
                    return Response({"error": "Phone number is required for M-Pesa"}, status=status.HTTP_400_BAD_REQUEST)
                phone = format_phone_number(phone)
                return self.initiate_mpesa_payment(phone, amount, plan, config, client)
            
            # --- PayPal Payment Initiation ---
            elif method_type == 'paypal':
                return self.initiate_paypal_payment(amount, plan, config, client)
            
            # --- Bank Payment Initiation ---
            elif method_type == 'bank':
                return self.initiate_bank_payment(amount, plan, config, client)
            
            else:
                return Response({
                    "error": f"Payment method {method_type} not supported"
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except InternetPlan.DoesNotExist:
            return Response({
                "error": f"Plan with id {plan_id} not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Payment initiation failed: {str(e)}")
            return Response({
                "error": f"Payment initiation failed: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

    def initiate_mpesa_payment(self, phone, amount, plan, config, client):
        try:
            token = self.generate_access_token(config)
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            stk_password = base64.b64encode(
                (config.short_code + config.pass_key + timestamp).encode()
            ).decode()

            request_body = {
                "BusinessShortCode": config.short_code if config.method_type == 'mpesa_paybill' else config.store_number,
                "Password": stk_password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline" if config.method_type == 'mpesa_paybill' else "CustomerBuyGoodsOnline",
                "Amount": str(amount),
                "PartyA": phone,
                "PartyB": config.short_code if config.method_type == 'mpesa_paybill' else config.till_number,
                "PhoneNumber": phone,
                "CallBackURL": config.callback_url,
                "AccountReference": f"Plan_{plan.id}",
                "TransactionDesc": "Internet Plan Purchase",
            }

            response = requests.post(
                f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
                json=request_body,
                headers=headers,
            ).json()

            if "ResponseCode" in response and response["ResponseCode"] == "0":
                transaction_data = {
                    "amount": float(amount),
                    "checkout_id": response["CheckoutRequestID"],
                    "phone_number": phone,
                    "status": "Pending",
                    "plan": plan.id,
                    "payment_method": config.id,
                    "security_level": config.security_level
                }
                transaction_serializer = TransactionSerializer(data=transaction_data)
                if transaction_serializer.is_valid():
                    transaction = transaction_serializer.save()
                    return Response({
                        "checkout_request_id": response["CheckoutRequestID"],
                        "transaction_id": transaction.id,
                        "security_level": config.security_level
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "error": "Transaction validation failed",
                        "details": transaction_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "error": response.get("errorMessage", "Unknown error from M-Pesa"),
                    "status": "failed"
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to initiate STK Push: {str(e)}")
            return Response({
                "error": f"Failed to initiate STK Push: {str(e)}",
                "status": "error"
            }, status=status.HTTP_400_BAD_REQUEST)

    def generate_access_token(self, config):
        try:
            credentials = f"{config.api_key}:{config.secret_key}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
            response = requests.get(
                f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
                headers=headers,
            ).json()
            return response["access_token"]
        except requests.RequestException as e:
            raise Exception(f"Failed to generate access token: {str(e)}")

    def initiate_paypal_payment(self, amount, plan, config, client):
        try:
            # Get PayPal access token
            auth_response = requests.post(
                f"{PAYPAL_BASE_URL}/v1/oauth2/token",
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
                auth=(config.paypal_client_id, config.secret),
                data={"grant_type": "client_credentials"}
            ).json()

            if 'access_token' not in auth_response:
                return Response({
                    "error": "Failed to authenticate with PayPal",
                    "details": auth_response.get('error_description', 'Unknown error')
                }, status=status.HTTP_400_BAD_REQUEST)

            token = auth_response['access_token']
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            # Create PayPal order
            order_body = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(amount)
                    },
                    "description": f"Internet Plan {plan.name}"
                }],
                "application_context": {
                    "return_url": config.callback_url,
                    "cancel_url": f"{config.callback_url}/cancel"
                }
            }

            order_response = requests.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders",
                headers=headers,
                json=order_body
            ).json()

            if order_response.get('status') == 'CREATED':
                transaction_data = {
                    "amount": float(amount),
                    "checkout_id": order_response['id'],
                    "status": "Pending",
                    "plan": plan.id,
                    "payment_method": config.id,
                    "security_level": config.security_level,
                    "paypal_transaction_id": order_response['id']
                }
                transaction_serializer = TransactionSerializer(data=transaction_data)
                if transaction_serializer.is_valid():
                    transaction = transaction_serializer.save()
                    approve_link = next(
                        (link['href'] for link in order_response['links'] if link['rel'] == 'approve'),
                        None
                    )
                    return Response({
                        "order_id": order_response['id'],
                        "transaction_id": transaction.id,
                        "approve_url": approve_link,
                        "security_level": config.security_level
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        "error": "Transaction validation failed",
                        "details": transaction_serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "error": "Failed to create PayPal order",
                    "details": order_response
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to initiate PayPal payment: {str(e)}")
            return Response({
                "error": f"Failed to initiate PayPal payment: {str(e)}",
                "status": "error"
            }, status=status.HTTP_400_BAD_REQUEST)

    def initiate_bank_payment(self, amount, plan, config, client):
        try:
            # Simulate bank transfer initiation (replace with actual bank API)
            reference = f"BANK_{timezone.now().strftime('%Y%m%d%H%M%S')}_{client.id}"
            transaction_data = {
                "amount": float(amount),
                "checkout_id": reference,
                "status": "Pending",
                "plan": plan.id,
                "payment_method": config.id,
                "security_level": config.security_level,
                "bank_reference": reference
            }
            transaction_serializer = TransactionSerializer(data=transaction_data)
            if transaction_serializer.is_valid():
                transaction = transaction_serializer.save()
                return Response({
                    "reference": reference,
                    "transaction_id": transaction.id,
                    "bank_details": {
                        "bank_name": config.bank_name,
                        "account_number": config.account_number,
                        "account_name": config.account_name,
                        "branch_code": config.branch_code,
                        "swift_code": config.swift_code
                    },
                    "security_level": config.security_level
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Transaction validation failed",
                    "details": transaction_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Failed to initiate bank payment: {str(e)}")
            return Response({
                "error": f"Failed to initiate bank payment: {str(e)}",
                "status": "error"
            }, status=status.HTTP_400_BAD_REQUEST)

class StkStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        checkout_request_id = request.data.get("checkout_request_id")
        if not checkout_request_id:
            return Response({
                "error": "CheckoutRequestID is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            transaction = Transaction.objects.get(checkout_id=checkout_request_id)
            config = transaction.payment_method
            if not config or config.method_type not in ['mpesa_paybill', 'mpesa_till']:
                return Response({
                    "error": "Invalid or unsupported payment method"
                }, status=status.HTTP_400_BAD_REQUEST)

            token = self.generate_access_token(config)
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = base64.b64encode(
                (config.short_code + config.pass_key + timestamp).encode()
            ).decode()

            request_body = {
                "BusinessShortCode": config.short_code if config.method_type == 'mpesa_paybill' else config.store_number,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id
            }

            response = requests.post(
                f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
                json=request_body,
                headers=headers,
            ).json()
            return Response({
                "status": response,
                "security_level": transaction.security_level
            })
        except Transaction.DoesNotExist:
            return Response({
                "error": f"Transaction with checkout_id {checkout_request_id} not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Failed to query STK Push: {str(e)}")
            return Response({
                "error": f"Failed to query STK Push: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
def payment_callback(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        callback_data = json.loads(request.body)
        # --- M-Pesa Callback ---
        if "Body" in callback_data and "stkCallback" in callback_data["Body"]:
            result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
            checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

            transaction = Transaction.objects.get(checkout_id=checkout_id)
            config = transaction.payment_method
            phone = PhoneNumber.from_string(transaction.phone_number)
            client = Client.objects.get(phonenumber=phone)

            if result_code == 0:
                metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
                metadata_dict = {item["Name"]: item["Value"] for item in metadata}
                amount = float(metadata_dict.get("Amount", 0))
                mpesa_code = metadata_dict.get("MpesaReceiptNumber", "")
                phone = metadata_dict.get("PhoneNumber", transaction.phone_number)

                transaction_data = {
                    "amount": amount,
                    "checkout_id": checkout_id,
                    "phone_number": phone,
                    "mpesa_code": mpesa_code,
                    "status": "Success",
                    "plan": transaction.plan.id,
                    "payment_method": config.id,
                    "security_level": config.security_level
                }
                transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
                if transaction_serializer.is_valid():
                    transaction_serializer.save()
                else:
                    return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

                payment_data = {
                    "client": client.id,
                    "amount": amount,
                    "transaction": transaction.id
                }
                payment_serializer = PaymentSerializer(data=payment_data)
                if payment_serializer.is_valid():
                    payment = payment_serializer.save()
                else:
                    return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

                plan = transaction.plan
                expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
                subscription = Subscription.objects.create(
                    client=client,
                    internet_plan=plan,
                    is_active=True,
                    end_date=timezone.now() + timedelta(days=expiry_days)
                )

                payment.subscription = subscription
                payment.save()

                plan.purchases += 1
                plan.save()

                return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
            else:
                transaction_data = {
                    "amount": transaction.amount,
                    "checkout_id": checkout_id,
                    "phone_number": transaction.phone_number,
                    "status": "Failed",
                    "plan": transaction.plan.id,
                    "payment_method": config.id,
                    "security_level": "low"
                }
                transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
                if transaction_serializer.is_valid():
                    transaction_serializer.save()
                else:
                    return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

                return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
        else:
            return HttpResponseBadRequest("Invalid callback format")
    except Transaction.DoesNotExist:
        return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
    except Client.DoesNotExist:
        return HttpResponseBadRequest("Client not found")
    except Exception as e:
        logger.error(f"Callback processing failed: {str(e)}")
        return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")

@csrf_exempt
def paypal_callback(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        callback_data = json.loads(request.body)
        # --- PayPal Callback ---
        if callback_data.get('event_type') == 'CHECKOUT.ORDER.APPROVED':
            order_id = callback_data['resource']['id']
            transaction = Transaction.objects.get(paypal_transaction_id=order_id)
            config = transaction.payment_method
            client = config.client

            # Capture the order
            auth_response = requests.post(
                f"{PAYPAL_BASE_URL}/v1/oauth2/token",
                headers={"Accept": "application/json", "Accept-Language": "en_US"},
                auth=(config.paypal_client_id, config.secret),
                data={"grant_type": "client_credentials"}
            ).json()
            token = auth_response['access_token']

            capture_response = requests.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            ).json()

            if capture_response.get('status') == 'COMPLETED':
                transaction_data = {
                    "amount": float(capture_response['purchase_units'][0]['amount']['value']),
                    "checkout_id": order_id,
                    "status": "Success",
                    "plan": transaction.plan.id,
                    "payment_method": config.id,
                    "security_level": config.security_level,
                    "paypal_transaction_id": order_id
                }
                transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
                if transaction_serializer.is_valid():
                    transaction_serializer.save()
                else:
                    return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

                payment_data = {
                    "client": client.id,
                    "amount": transaction.amount,
                    "transaction": transaction.id
                }
                payment_serializer = PaymentSerializer(data=payment_data)
                if payment_serializer.is_valid():
                    payment = payment_serializer.save()
                else:
                    return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

                plan = transaction.plan
                expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
                subscription = Subscription.objects.create(
                    client=client,
                    internet_plan=plan,
                    is_active=True,
                    end_date=timezone.now() + timedelta(days=expiry_days)
                )

                payment.subscription = subscription
                payment.save()

                plan.purchases += 1
                plan.save()

                return JsonResponse({"status": "success", "message": "PayPal payment completed"})
            else:
                transaction_data = {
                    "amount": transaction.amount,
                    "checkout_id": order_id,
                    "status": "Failed",
                    "plan": transaction.plan.id,
                    "payment_method": config.id,
                    "security_level": "low"
                }
                transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
                if transaction_serializer.is_valid():
                    transaction_serializer.save()
                return JsonResponse({"status": "failed", "message": "PayPal payment failed"})
        else:
            return HttpResponseBadRequest("Invalid PayPal callback event")
    except Transaction.DoesNotExist:
        return HttpResponseBadRequest(f"Transaction with order_id {order_id} not found")
    except Exception as e:
        logger.error(f"PayPal callback processing failed: {str(e)}")
        return HttpResponseBadRequest(f"PayPal callback processing failed: {str(e)}")

@csrf_exempt
def bank_callback(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        callback_data = json.loads(request.body)
        # --- Bank Callback ---
        reference = callback_data.get('reference')
        status = callback_data.get('status')  # 'success' or 'failed'

        transaction = Transaction.objects.get(bank_reference=reference)
        config = transaction.payment_method
        client = config.client

        if status == 'success':
            transaction_data = {
                "amount": transaction.amount,
                "checkout_id": reference,
                "status": "Success",
                "plan": transaction.plan.id,
                "payment_method": config.id,
                "security_level": config.security_level,
                "bank_reference": reference
            }
            transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
            if transaction_serializer.is_valid():
                transaction_serializer.save()
            else:
                return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

            payment_data = {
                "client": client.id,
                "amount": transaction.amount,
                "transaction": transaction.id
            }
            payment_serializer = PaymentSerializer(data=payment_data)
            if payment_serializer.is_valid():
                payment = payment_serializer.save()
            else:
                return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

            plan = transaction.plan
            expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
            subscription = Subscription.objects.create(
                client=client,
                internet_plan=plan,
                is_active=True,
                end_date=timezone.now() + timedelta(days=expiry_days)
            )

            payment.subscription = subscription
            payment.save()

            plan.purchases += 1
            plan.save()

            return JsonResponse({"status": "success", "message": "Bank payment completed"})
        else:
            transaction_data = {
                "amount": transaction.amount,
                "checkout_id": reference,
                "status": "Failed",
                "plan": transaction.plan.id,
                "payment_method": config.id,
                "security_level": "low"
            }
            transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
            if transaction_serializer.is_valid():
                transaction_serializer.save()
            return JsonResponse({"status": "failed", "message": "Bank payment failed"})
    except Transaction.DoesNotExist:
        return HttpResponseBadRequest(f"Transaction with reference {reference} not found")
    except Exception as e:
        logger.error(f"Bank callback processing failed: {str(e)}")
        return HttpResponseBadRequest(f"Bank callback processing failed: {str(e)}")











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
# from rest_framework.permissions import AllowAny
# from rest_framework import status
# from payments.models.mpesa_config_model import (
#     PaymentMethodConfig, 
#     ConfigurationHistory, 
#     Transaction
# )
# from payments.serializers.mpesa_config_serializer import (
#     PaymentMethodConfigSerializer, 
#     ConfigurationHistorySerializer, 
#     TransactionSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment
# from account.serializers.admin_serializer import PaymentSerializer
# from internet_plans.models.create_plan_models import InternetPlan
# from dotenv import load_dotenv
# from phonenumber_field.phonenumber import PhoneNumber

# load_dotenv()
# logger = logging.getLogger(__name__)

# MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")

# def format_phone_number(phone):
#     if not phone:
#         raise ValueError("Phone number cannot be empty")
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

# class PaymentConfigView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({
#                 "error": "Phone number is required",
#                 "details": "Please provide a valid phonenumber query parameter"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             configs = PaymentMethodConfig.objects.filter(client=client)
#             serializer = PaymentMethodConfigSerializer(
#                 configs, 
#                 many=True,
#                 context={'request': request}
#             )
            
#             return Response({
#                 "paymentMethods": serializer.data,
#                 "configurationVersion": "1.2.0",
#                 "lastUpdated": max(
#                     (config.updated_at for config in configs), 
#                     default=timezone.now()
#                 ).isoformat(),
#                 "kenyanBanks": PaymentMethodConfig.KENYAN_BANKS,
#                 "securityLevels": dict(PaymentMethodConfig.SECURITY_LEVELS)
#             })
#         except Client.DoesNotExist:
#             return Response({
#                 "error": "Client not found",
#                 "details": f"No client found with phone number {phonenumber}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except ValueError as ve:
#             return Response({
#                 "error": "Invalid phone number",
#                 "details": str(ve)
#             }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to fetch payment configs: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to fetch payment configurations",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def post(self, request):
#         phonenumber = request.data.get('phonenumber')
#         if not phonenumber:
#             return Response({
#                 "error": "Phone number is required",
#                 "details": "Please provide a valid phonenumber in the request body"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#         except Client.DoesNotExist:
#             return Response({
#                 "error": "Client not found",
#                 "details": f"No client found with phone number {phonenumber}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except ValueError as ve:
#             return Response({
#                 "error": "Invalid phone number",
#                 "details": str(ve)
#             }, status=status.HTTP_400_BAD_REQUEST)

#         data = request.data.get('paymentMethods', [])
#         if not isinstance(data, list):
#             return Response({
#                 "error": "Invalid data format",
#                 "details": "paymentMethods must be a list"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         saved_configs = []
#         changes = []
#         for method_data in data:
#             method_data['client'] = client.id
#             serializer = PaymentMethodConfigSerializer(
#                 data=method_data,
#                 context={'request': request}
#             )
            
#             if serializer.is_valid():
#                 instance = serializer.save()
#                 saved_configs.append(serializer.data)
#                 changes.append(f"Created {method_data.get('method_type')} configuration")
#             else:
#                 return Response({
#                     "error": "Invalid configuration",
#                     "details": serializer.errors
#                 }, status=status.HTTP_400_BAD_REQUEST)

#         # Log configuration changes
#         history_data = {
#             "client": client.id,
#             "action": "created",
#             "changes": changes,
#             "status": "success",
#             "user_id": request.user.username if request.user.is_authenticated else "system"
#         }
#         history_serializer = ConfigurationHistorySerializer(data=history_data)
#         if history_serializer.is_valid():
#             history_serializer.save()
#         else:
#             logger.warning(f"Failed to log history: {history_serializer.errors}")

#         return Response({
#             "paymentMethods": saved_configs,
#             "configurationVersion": "1.2.0",
#             "lastUpdated": timezone.now().isoformat()
#         }, status=status.HTTP_201_CREATED)

#     def put(self, request, pk=None):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({
#                 "error": "Phone number is required",
#                 "details": "Please provide a valid phonenumber query parameter"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             data = request.data.get('paymentMethods', [])
#             if not isinstance(data, list):
#                 return Response({
#                     "error": "Invalid data format",
#                     "details": "paymentMethods must be a list"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             saved_configs = []
#             changes = []
#             for method_data in data:
#                 method_id = method_data.get('id')
#                 if not method_id:
#                     return Response({
#                         "error": "Missing method ID",
#                         "details": "Each payment method must include an 'id' field"
#                     }, status=status.HTTP_400_BAD_REQUEST)

#                 try:
#                     config = PaymentMethodConfig.objects.get(pk=method_id, client=client)
#                 except PaymentMethodConfig.DoesNotExist:
#                     return Response({
#                         "error": "Payment method configuration not found",
#                         "details": f"No configuration found with ID {method_id}"
#                     }, status=status.HTTP_404_NOT_FOUND)

#                 serializer = PaymentMethodConfigSerializer(
#                     config, 
#                     data=method_data, 
#                     partial=True,
#                     context={'request': request}
#                 )
                
#                 if serializer.is_valid():
#                     instance = serializer.save()
#                     saved_configs.append(serializer.data)
#                     changes.append(f"Modified {method_data.get('method_type')} configuration: {', '.join(method_data.keys())}")
#                 else:
#                     return Response({
#                         "error": "Invalid data",
#                         "details": serializer.errors
#                     }, status=status.HTTP_400_BAD_REQUEST)

#             # Log update
#             history_data = {
#                 "client": client.id,
#                 "action": "updated",
#                 "changes": changes,
#                 "status": "success",
#                 "user_id": request.user.username if request.user.is_authenticated else "system"
#             }
#             history_serializer = ConfigurationHistorySerializer(data=history_data)
#             if history_serializer.is_valid():
#                 history_serializer.save()
#             else:
#                 logger.warning(f"Failed to log history: {history_serializer.errors}")

#             return Response({
#                 "paymentMethods": saved_configs,
#                 "configurationVersion": "1.2.0",
#                 "lastUpdated": timezone.now().isoformat()
#             }, status=status.HTTP_200_OK)
#         except Client.DoesNotExist:
#             return Response({
#                 "error": "Client not found",
#                 "details": f"No client found with phone number {phonenumber}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except ValueError as ve:
#             return Response({
#                 "error": "Invalid phone number",
#                 "details": str(ve)
#             }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to update payment configs: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to update payment configurations",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def delete(self, request, pk):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({
#                 "error": "Phone number is required",
#                 "details": "Please provide a valid phonenumber query parameter"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             config = PaymentMethodConfig.objects.get(pk=pk, client=client)
#         except Client.DoesNotExist:
#             return Response({
#                 "error": "Client not found",
#                 "details": f"No client found with phone number {phonenumber}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except PaymentMethodConfig.DoesNotExist:
#             return Response({
#                 "error": "Payment method configuration not found",
#                 "details": f"No configuration found with ID {pk}"
#             }, status=status.HTTP_404_NOT_FOUND)

#         method_type = config.get_method_type_display()
#         config.delete()
#         # Log deletion
#         history_data = {
#             "client": client.id,
#             "action": "deleted",
#             "changes": [f"Removed {method_type} configuration"],
#             "status": "success",
#             "user_id": request.user.username if request.user.is_authenticated else "system"
#         }
#         history_serializer = ConfigurationHistorySerializer(data=history_data)
#         if history_serializer.is_valid():
#             history_serializer.save()
#         else:
#             logger.warning(f"Failed to log history: {history_serializer.errors}")

#         return Response(status=status.HTTP_204_NO_CONTENT)

# class TestConnectionView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request, pk):
#         try:
#             config = PaymentMethodConfig.objects.get(pk=pk)
#             result = config.test_connection()
            
#             # Log the test
#             history_data = {
#                 "client": config.client.id,
#                 "action": "tested",
#                 "status": result.get('status', 'pending'),
#                 "changes": [f"Tested {config.method_type} connection: {result.get('message')}"],
#                 "user_id": request.user.username if request.user.is_authenticated else "system"
#             }
#             history_serializer = ConfigurationHistorySerializer(data=history_data)
#             if history_serializer.is_valid():
#                 history_serializer.save()
#             else:
#                 logger.warning(f"Failed to log history: {history_serializer.errors}")
            
#             return Response({
#                 "success": result.get('success', False),
#                 "message": result.get('message'),
#                 "status": result.get('status'),
#                 "method": config.method_type,
#                 "details": result.get('details', {}),
#                 "security_level": config.security_level
#             })
#         except PaymentMethodConfig.DoesNotExist:
#             return Response({
#                 "error": "Payment method configuration not found",
#                 "details": f"No configuration found with ID {pk}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Connection test failed: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to test connection",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class ConfigurationHistoryView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         phonenumber = request.query_params.get('phonenumber')
#         if not phonenumber:
#             return Response({
#                 "error": "Phone number is required",
#                 "details": "Please provide a valid phonenumber query parameter"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone_obj = PhoneNumber.from_string(phonenumber)
#             client = Client.objects.get(phonenumber=phone_obj)
#             history = ConfigurationHistory.objects.filter(client=client).order_by('-created_at')
#             serializer = ConfigurationHistorySerializer(history, many=True)
#             return Response({
#                 "history": serializer.data,
#                 "actions": dict(ConfigurationHistory.ACTIONS),
#                 "statuses": dict(ConfigurationHistory.STATUSES)
#             })
#         except Client.DoesNotExist:
#             return Response({
#                 "error": "Client not found",
#                 "details": f"No client found with phone number {phonenumber}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except ValueError as ve:
#             return Response({
#                 "error": "Invalid phone number",
#                 "details": str(ve)
#             }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to fetch config history: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to fetch configuration history",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class InitiatePaymentView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone = request.data.get("phone_number")
#         amount = request.data.get("amount")
#         plan_id = request.data.get("plan_id")
#         method_type = request.data.get("method_type")

#         if not all([phone, amount, plan_id, method_type]):
#             return Response({
#                 "error": "Missing required fields",
#                 "details": "phone_number, amount, plan_id, and method_type are required"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             phone = format_phone_number(phone)
#             phone_obj = PhoneNumber.from_string(phone)
#             client = Client.objects.get(phonenumber=phone_obj)
#             plan = InternetPlan.objects.get(id=plan_id)
#             config = PaymentMethodConfig.objects.filter(
#                 client=client, 
#                 method_type=method_type, 
#                 is_active=True
#             ).first()
            
#             if not config:
#                 return Response({
#                     "error": f"No active {method_type} configuration found for client",
#                     "details": f"Ensure an active {method_type} payment method is configured"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             if method_type in ['mpesa_paybill', 'mpesa_till']:
#                 return self.initiate_mpesa_payment(phone, amount, plan, config, client)
#             else:
#                 return Response({
#                     "error": f"Payment method {method_type} not supported",
#                     "details": "Only M-Pesa Paybill and Till are currently supported"
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except ValueError as ve:
#             return Response({
#                 "error": "Invalid phone number",
#                 "details": str(ve)
#             }, status=status.HTTP_400_BAD_REQUEST)
#         except Client.DoesNotExist:
#             return Response({
#                 "error": "Client not found",
#                 "details": f"No client found with phone number {phone}"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except InternetPlan.DoesNotExist:
#             return Response({
#                 "error": "Plan not found",
#                 "details": f"Plan with ID {plan_id} not found"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Payment initiation failed: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to initiate payment",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def initiate_mpesa_payment(self, phone, amount, plan, config, client):
#         try:
#             token = self.generate_access_token(config)
#             headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             stk_password = base64.b64encode(
#                 (config.short_code + config.pass_key + timestamp).encode()
#             ).decode()

#             request_body = {
#                 "BusinessShortCode": config.short_code if config.method_type == 'mpesa_paybill' else config.store_number,
#                 "Password": stk_password,
#                 "Timestamp": timestamp,
#                 "TransactionType": "CustomerPayBillOnline" if config.method_type == 'mpesa_paybill' else "CustomerBuyGoodsOnline",
#                 "Amount": str(amount),
#                 "PartyA": phone,
#                 "PartyB": config.short_code if config.method_type == 'mpesa_paybill' else config.till_number,
#                 "PhoneNumber": phone,
#                 "CallBackURL": config.callback_url,
#                 "AccountReference": f"Plan_{plan.id}",
#                 "TransactionDesc": "Internet Plan Purchase",
#             }

#             response = requests.post(
#                 f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
#                 json=request_body,
#                 headers=headers,
#             ).json()

#             if "ResponseCode" in response and response["ResponseCode"] == "0":
#                 transaction_data = {
#                     "amount": float(amount),
#                     "checkout_id": response["CheckoutRequestID"],
#                     "phone_number": phone,
#                     "status": "Pending",
#                     "plan": plan.id,
#                     "payment_method": config.id,
#                     "security_level": config.security_level
#                 }
#                 transaction_serializer = TransactionSerializer(data=transaction_data)
#                 if transaction_serializer.is_valid():
#                     transaction = transaction_serializer.save()
#                     return Response({
#                         "checkout_request_id": response["CheckoutRequestID"],
#                         "transaction_id": transaction.id,
#                         "security_level": config.security_level
#                     }, status=status.HTTP_200_OK)
#                 else:
#                     return Response({
#                         "error": "Transaction validation failed",
#                         "details": transaction_serializer.errors
#                     }, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 return Response({
#                     "error": response.get("errorMessage", "Unknown error from M-Pesa"),
#                     "details": response.get("errorCode", "Unknown"),
#                     "status": "failed"
#                 }, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Failed to initiate STK Push: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to initiate STK Push",
#                 "details": str(e),
#                 "status": "error"
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def generate_access_token(self, config):
#         try:
#             credentials = f"{config.api_key}:{config.secret_key}"
#             encoded_credentials = base64.b64encode(credentials.encode()).decode()
#             headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
#             response = requests.get(
#                 f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
#                 headers=headers,
#             ).json()
#             return response["access_token"]
#         except requests.RequestException as e:
#             logger.error(f"Failed to generate access token: {str(e)}", exc_info=True)
#             raise Exception(f"Failed to generate access token: {str(e)}")

# class StkStatusView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         checkout_request_id = request.data.get("checkout_request_id")
#         if not checkout_request_id:
#             return Response({
#                 "error": "CheckoutRequestID is required",
#                 "details": "Please provide a valid checkout_request_id"
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             transaction = Transaction.objects.get(checkout_id=checkout_request_id)
#             config = transaction.payment_method
#             if not config or config.method_type not in ['mpesa_paybill', 'mpesa_till']:
#                 return Response({
#                     "error": "Invalid or unsupported payment method",
#                     "details": "Only M-Pesa Paybill and Till are supported"
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             token = self.generate_access_token(config)
#             headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
#             timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
#             password = base64.b64encode(
#                 (config.short_code + config.pass_key + timestamp).encode()
#             ).decode()

#             request_body = {
#                 "BusinessShortCode": config.short_code if config.method_type == 'mpesa_paybill' else config.store_number,
#                 "Password": password,
#                 "Timestamp": timestamp,
#                 "CheckoutRequestID": checkout_request_id
#             }

#             response = requests.post(
#                 f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
#                 json=request_body,
#                 headers=headers,
#             ).json()
#             return Response({
#                 "status": response,
#                 "security_level": transaction.security_level
#             })
#         except Transaction.DoesNotExist:
#             return Response({
#                 "error": "Transaction not found",
#                 "details": f"Transaction with checkout_id {checkout_request_id} not found"
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Failed to query STK Push: {str(e)}", exc_info=True)
#             return Response({
#                 "error": "Failed to query STK Push",
#                 "details": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @csrf_exempt
# def payment_callback(request):
#     if request.method != "POST":
#         return HttpResponseBadRequest("Only POST requests are allowed")

#     try:
#         callback_data = json.loads(request.body)
#         result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
#         checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

#         transaction = Transaction.objects.get(checkout_id=checkout_id)
#         config = transaction.payment_method
#         phone = PhoneNumber.from_string(transaction.phone_number)
#         client = Client.objects.get(phonenumber=phone)

#         if result_code == 0:
#             metadata = callback_data["Body"]["stkCallback"]["CallbackMetadata"]["Item"]
#             metadata_dict = {item["Name"]: item["Value"] for item in metadata}
#             amount = float(metadata_dict.get("Amount", 0))
#             mpesa_code = metadata_dict.get("MpesaReceiptNumber", "")
#             phone = metadata_dict.get("PhoneNumber", transaction.phone_number)

#             transaction_data = {
#                 "amount": amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": phone,
#                 "mpesa_code": mpesa_code,
#                 "status": "Success",
#                 "plan": transaction.plan.id,
#                 "payment_method": config.id,
#                 "security_level": config.security_level
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 logger.error(f"Transaction update failed: {transaction_serializer.errors}")
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             payment_data = {
#                 "client": client.id,
#                 "amount": amount,
#                 "transaction": transaction.id
#             }
#             payment_serializer = PaymentSerializer(data=payment_data)
#             if payment_serializer.is_valid():
#                 payment = payment_serializer.save()
#             else:
#                 logger.error(f"Payment creation failed: {payment_serializer.errors}")
#                 return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

#             plan = transaction.plan
#             expiry_days = int(plan.expiry_value) if plan.expiry_unit == "Days" else int(plan.expiry_value) * 30
#             subscription = Subscription.objects.create(
#                 client=client,
#                 internet_plan=plan,
#                 is_active=True,
#                 end_date=timezone.now() + timedelta(days=expiry_days)
#             )

#             payment.subscription = subscription
#             payment.save()

#             plan.purchases += 1
#             plan.save()

#             return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
#         else:
#             transaction_data = {
#                 "amount": transaction.amount,
#                 "checkout_id": checkout_id,
#                 "phone_number": transaction.phone_number,
#                 "status": "Failed",
#                 "plan": transaction.plan.id,
#                 "payment_method": config.id,
#                 "security_level": "low"
#             }
#             transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
#             if transaction_serializer.is_valid():
#                 transaction_serializer.save()
#             else:
#                 logger.error(f"Transaction update failed: {transaction_serializer.errors}")
#                 return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

#             return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
#     except Transaction.DoesNotExist:
#         logger.error(f"Transaction with checkout_id {checkout_id} not found")
#         return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
#     except Client.DoesNotExist:
#         logger.error("Client not found")
#         return HttpResponseBadRequest("Client not found")
#     except Exception as e:
#         logger.error(f"Callback processing failed: {str(e)}", exc_info=True)
#         return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")