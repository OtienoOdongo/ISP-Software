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





import requests
import base64
import json
import re
import os
from datetime import datetime, timedelta
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from payments.models.mpesa_config_model import Transaction
from payments.serializers.mpesa_config_serializer import TransactionSerializer
from account.models.admin_model import Client, Subscription, Payment
from account.serializers.admin_serializer import PaymentSerializer
from internet_plans.models.create_plan_models import InternetPlan
from django.utils import timezone
from dotenv import load_dotenv

load_dotenv()

# M-Pesa credentials
CONSUMER_KEY = os.getenv("CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY")
MPESA_SHORTCODE_TILL = os.getenv("MPESA_SHORTCODE_TILL")  # Till Number
MPESA_SHORTCODE_STORE = os.getenv("MPESA_SHORTCODE_STORE")  # Store/Head Office Number
CALLBACK_URL = os.getenv("CALLBACK_URL")
MPESA_BASE_URL = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")

def format_phone_number(phone):
    phone = ''.join(phone.split())  # Remove whitespace
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

def generate_access_token():
    try:
        credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        headers = {"Authorization": f"Basic {encoded_credentials}", "Content-Type": "application/json"}
        response = requests.get(
            f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
            headers=headers,
        ).json()
        return response["access_token"]
    except requests.RequestException as e:
        raise Exception(f"Failed to generate access token: {str(e)}")

def initiate_stk_push(phone, amount, plan_id):
    try:
        token = generate_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        stk_password = base64.b64encode(
            (MPESA_SHORTCODE_STORE + MPESA_PASSKEY + timestamp).encode()
        ).decode()

        request_body = {
            "BusinessShortCode": MPESA_SHORTCODE_STORE,  # Store/Head Office Number
            "Password": stk_password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerBuyGoodsOnline",  # Changed to Till Number transaction
            "Amount": str(amount),
            "PartyA": phone,  # Customer's phone number
            "PartyB": MPESA_SHORTCODE_TILL,  # Till Number
            "PhoneNumber": phone,  # Customer's phone number (for STK prompt)
            "CallBackURL": CALLBACK_URL,
            "AccountReference": f"Plan_{plan_id}",
            "TransactionDesc": "Internet Plan Purchase",
        }

        response = requests.post(
            f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
            json=request_body,
            headers=headers,
        ).json()

        if "ResponseCode" in response and response["ResponseCode"] == "0":
            return response
        else:
            raise Exception(response.get("errorMessage", "Unknown error from M-Pesa"))
    except Exception as e:
        raise Exception(f"Failed to initiate STK Push: {str(e)}")

def query_stk_push(checkout_request_id):
    try:
        token = generate_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            (MPESA_SHORTCODE_STORE + MPESA_PASSKEY + timestamp).encode()
        ).decode()

        request_body = {
            "BusinessShortCode": MPESA_SHORTCODE_STORE,  # Use Store Number for query
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }

        response = requests.post(
            f"{MPESA_BASE_URL}/mpesa/stkpushquery/v1/query",
            json=request_body,
            headers=headers,
        ).json()
        return response
    except requests.RequestException as e:
        return {"error": f"Failed to query STK Push: {str(e)}"}

class MpesaConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        config = {
            "apiKey": CONSUMER_KEY,
            "secretKey": CONSUMER_SECRET,
            "shortCodeTill": MPESA_SHORTCODE_TILL,  # Updated to reflect Till Number
            "shortCodeStore": MPESA_SHORTCODE_STORE,  # Added Store Number
            "passKey": MPESA_PASSKEY,
            "callbackURL": CALLBACK_URL,
        }
        return Response(config)

    def post(self, request):
        return Response(request.data, status=200)

class InitiatePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone_number")
        amount = request.data.get("amount")
        plan_id = request.data.get("plan_id")

        if not all([phone, amount, plan_id]):
            return Response({"error": "Missing required fields: phone_number, amount, and plan_id are required"}, status=400)

        try:
            phone = format_phone_number(phone)
            plan = InternetPlan.objects.get(id=plan_id)
            response = initiate_stk_push(phone, amount, plan_id)

            transaction_data = {
                "amount": float(amount),
                "checkout_id": response["CheckoutRequestID"],
                "phone_number": phone,
                "status": "Pending",
                "plan": plan.id
            }
            transaction_serializer = TransactionSerializer(data=transaction_data)
            if transaction_serializer.is_valid():
                transaction_serializer.save()
                return Response({"checkout_request_id": response["CheckoutRequestID"]}, status=200)
            else:
                return Response({"error": "Transaction validation failed", "details": transaction_serializer.errors}, status=400)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=400)
        except InternetPlan.DoesNotExist:
            return Response({"error": f"Plan with id {plan_id} not found"}, status=404)
        except Exception as e:
            return Response({"error": f"Payment initiation failed: {str(e)}"}, status=400)

class StkStatusView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        checkout_request_id = request.data.get("checkout_request_id")
        if not checkout_request_id:
            return Response({"error": "CheckoutRequestID is required"}, status=400)

        status = query_stk_push(checkout_request_id)
        if "error" in status:
            return Response({"error": status["error"]}, status=400)
        return Response({"status": status})

@csrf_exempt
def payment_callback(request):
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST requests are allowed")

    try:
        callback_data = json.loads(request.body)
        result_code = callback_data["Body"]["stkCallback"]["ResultCode"]
        checkout_id = callback_data["Body"]["stkCallback"]["CheckoutRequestID"]

        transaction = Transaction.objects.get(checkout_id=checkout_id)

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
                "plan": transaction.plan.id
            }
            transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
            if transaction_serializer.is_valid():
                transaction_serializer.save()
            else:
                return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

            client, created = Client.objects.get_or_create(
                phonenumber=phone,
                defaults={"full_name": "New Client"}
            )

            payment_data = {
                "client": client.id,
                "amount": amount
            }
            payment_serializer = PaymentSerializer(data=payment_data)
            if payment_serializer.is_valid():
                payment_serializer.save()
            else:
                return HttpResponseBadRequest(f"Payment creation failed: {payment_serializer.errors}")

            plan = transaction.plan
            expiry_days = int(plan.expiry.value) if plan.expiry.unit == "Days" else int(plan.expiry.value) * 30
            Subscription.objects.create(
                client=client,
                is_active=True,
                end_date=timezone.now() + timedelta(days=expiry_days)
            )

            plan.purchases += 1
            plan.save()

            return JsonResponse({"ResultCode": 0, "ResultDesc": "Payment successful"})
        else:
            transaction_data = {
                "amount": transaction.amount,
                "checkout_id": checkout_id,
                "phone_number": transaction.phone_number,
                "status": "Failed",
                "plan": transaction.plan.id
            }
            transaction_serializer = TransactionSerializer(transaction, data=transaction_data, partial=True)
            if transaction_serializer.is_valid():
                transaction_serializer.save()
            else:
                return HttpResponseBadRequest(f"Transaction update failed: {transaction_serializer.errors}")

            return JsonResponse({"ResultCode": result_code, "ResultDesc": "Payment failed"})
    except Transaction.DoesNotExist:
        return HttpResponseBadRequest(f"Transaction with checkout_id {checkout_id} not found")
    except Exception as e:
        return HttpResponseBadRequest(f"Callback processing failed: {str(e)}")