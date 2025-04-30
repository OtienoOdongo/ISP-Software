# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .models import OTP
# from django.utils import timezone
# from datetime import timedelta
# import requests
# from decouple import config
# from payments.api.views.mpesa_configuration import format_phone_number;

# class GenerateOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         if not phone_number:
#             return Response({"error": "Phone number is required"}, status=400)

#         try:
#             phone_number = format_phone_number(phone_number)  # Reuse from payments
#             otp, created = OTP.objects.get_or_create(phone_number=phone_number)
#             if not created:
#                 otp.created_at = timezone.now()
#             otp.generate_otp()

#             # Send OTP via SMS (using a mock SMS API for now; replace with real provider)
#             sms_url = "https://api.example.com/sms/send"  # Replace with actual SMS API
#             sms_data = {
#                 "to": phone_number,
#                 "message": f"Your OTP is {otp.otp_code}. Valid for 10 minutes.",
#                 "api_key": config("SMS_API_KEY", default="your_sms_api_key"),
#             }
#             # requests.post(sms_url, json=sms_data)  # Uncomment with real API

#             return Response({"message": "OTP sent successfully"}, status=200)
#         except Exception as e:
#             return Response({"error": str(e)}, status=400)

# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         otp_code = request.data.get("otp_code")

#         if not all([phone_number, otp_code]):
#             return Response({"error": "Phone number and OTP code are required"}, status=400)

#         try:
#             phone_number = format_phone_number(phone_number)
#             otp = OTP.objects.get(phone_number=phone_number)
#             if otp.otp_code == otp_code and otp.is_valid():
#                 return Response({"message": "OTP verified successfully"}, status=200)
#             else:
#                 return Response({"error": "Invalid or expired OTP"}, status=400)
#         except OTP.DoesNotExist:
#             return Response({"error": "OTP not found"}, status=404)
#         except Exception as e:
#             return Response({"error": str(e)}, status=400)





# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .models import OTP
# from django.utils import timezone
# import requests
# import re
# import logging

# # Configure logging
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# # Infobip Configuration
# INFOBIP_API_KEY = "a75c79215e3471ed7112c8b3d3edf513-44181a17-db90-48c5-875a-1abdfbf9a334"
# INFOBIP_BASE_URL = "https://d9z3qr.api.infobip.com"
# INFOBIP_SMS_ENDPOINT = f"{INFOBIP_BASE_URL}/sms/2/text/advanced"
# SENDER_ID = "+447491163443"  

# def format_phone_number(phone):
#     """
#     Formats a phone number to E.164 standard (+254712345678).
#     Accepts: 0712345678, 254712345678, +254712345678
#     Raises ValueError for invalid formats.
#     """
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

# class GenerateOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         if not phone_number:
#             logger.warning("No phone number provided in request")
#             return Response({"error": "Phone number is required"}, status=400)

#         try:
#             # Format phone number to E.164 (+254XXXXXXXXX)
#             phone_number = format_phone_number(phone_number)
#             logger.debug(f"Formatted phone number: {phone_number}")

#             # Generate or update OTP
#             otp, created = OTP.objects.get_or_create(phone_number=phone_number)
#             if not created:
#                 otp.created_at = timezone.now()
#             otp.generate_otp()
#             logger.debug(f"Generated OTP: {otp.otp_code} for {phone_number}")

#             # Send OTP via Infobip SMS API
#             headers = {
#                 "Authorization": f"App {INFOBIP_API_KEY}",
#                 "Content-Type": "application/json",
#                 "Accept": "application/json"
#             }
#             payload = {
#                 "messages": [
#                     {
#                         "from": SENDER_ID,
#                         "destinations": [{"to": str(phone_number)}],
#                         "text": f"Your OTP is {otp.otp_code}. Valid for 10 minutes."
#                     }
#                 ]
#             }

#             response = requests.post(INFOBIP_SMS_ENDPOINT, json=payload, headers=headers)
#             logger.debug(f"Infobip response status: {response.status_code}, body: {response.text}")

#             if response.status_code == 200:
#                 return Response({"message": "OTP sent successfully"}, status=200)
#             else:
#                 error_detail = response.json().get("requestError", {}).get("serviceException", {}).get("text", "Unknown error")
#                 logger.error(f"Failed to send OTP via Infobip: {error_detail}")
#                 return Response({"error": f"Failed to send OTP: {error_detail}"}, status=response.status_code)

#         except ValueError as ve:
#             logger.error(f"Phone number validation error: {str(ve)}")
#             return Response({"error": str(ve)}, status=400)
#         except Exception as e:
#             logger.error(f"Error in GenerateOTPView: {str(e)}")
#             return Response({"error": f"Error: {str(e)}"}, status=400)

# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         otp_code = request.data.get("otp_code")

#         if not all([phone_number, otp_code]):
#             logger.warning("Missing phone_number or otp_code in request")
#             return Response({"error": "Phone number and OTP code are required"}, status=400)

#         try:
#             # Format phone number to E.164 (+254XXXXXXXXX)
#             phone_number = format_phone_number(phone_number)
#             logger.debug(f"Verifying OTP for: {phone_number}")

#             otp = OTP.objects.get(phone_number=phone_number)
#             if otp.otp_code == otp_code and otp.is_valid():
#                 logger.debug(f"OTP {otp_code} verified successfully for {phone_number}")
#                 return Response({"message": "OTP verified successfully"}, status=200)
#             else:
#                 logger.warning(f"Invalid or expired OTP for {phone_number}")
#                 return Response({"error": "Invalid or expired OTP"}, status=400)

#         except OTP.DoesNotExist:
#             logger.warning(f"OTP not found for {phone_number}")
#             return Response({"error": "OTP not found"}, status=404)
#         except ValueError as ve:
#             logger.error(f"Phone number validation error: {str(ve)}")
#             return Response({"error": str(ve)}, status=400)
#         except Exception as e:
#             logger.error(f"Error in VerifyOTPView: {str(e)}")
#             return Response({"error": str(e)}, status=400)



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .models import OTP
# from django.utils import timezone
# import requests
# import logging

# # Configure logging
# logger = logging.getLogger(__name__)

# # Infobip Configuration
# INFOBIP_API_KEY = "a75c79215e3471ed7112c8b3d3edf513-44181a17-db90-48c5-875a-1abdfbf9a334"
# INFOBIP_BASE_URL = "https://d9z3qr.api.infobip.com"
# INFOBIP_SMS_ENDPOINT = f"{INFOBIP_BASE_URL}/sms/2/text/advanced"
# SENDER_ID = "+447491163443"

# def format_phone_number(phone):
#     """
#     Formats a phone number to E.164 standard (+254XXXXXXXXX).
#     Accepts: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX
#     Returns: +254XXXXXXXXX (e.g., +254713524066)
#     Raises ValueError for invalid formats.
#     """
#     phone = ''.join(phone.split())  # Remove whitespace
#     logger.debug(f"Raw phone number received: '{phone}'")

#     # Handle pre-formatted E.164 numbers
#     if phone.startswith("+254") and len(phone) == 13 and phone[1:].isdigit():
#         prefix = phone[4]  # Check the digit after +254 (should be 7 or 1)
#         if prefix in ("7", "1"):
#             logger.debug(f"Valid pre-formatted number: {phone}")
#             return phone
#         else:
#             raise ValueError(f"Invalid prefix after +254: {prefix}. Must be 7 or 1.")

#     # Handle raw Kenyan numbers
#     if phone.startswith("0") and len(phone) == 10 and phone.isdigit():
#         prefix = phone[1]  # Check if it’s 07 or 01
#         if prefix in ("7", "1"):
#             formatted = f"+254{phone[2:]}"
#             logger.debug(f"Formatted {phone} to {formatted}")
#             return formatted
#         else:
#             raise ValueError(f"Invalid prefix {prefix}. Must be 07 or 01 for Kenyan numbers.")

#     # Handle 254-prefixed numbers without +
#     if phone.startswith("254") and len(phone) == 12 and phone.isdigit():
#         prefix = phone[3]  # Check if it’s 2547 or 2541
#         if prefix in ("7", "1"):
#             formatted = f"+{phone}"
#             logger.debug(f"Formatted {phone} to {formatted}")
#             return formatted
#         else:
#             raise ValueError(f"Invalid prefix after 254: {prefix}. Must be 7 or 1.")

#     raise ValueError("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +2547XXXXXXXX, or +2541XXXXXXXX.")

# class GenerateOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         if not phone_number:
#             logger.warning("No phone number provided in request")
#             return Response({"error": "Phone number is required"}, status=400)

#         try:
#             # Format phone number to E.164 (+254XXXXXXXXX)
#             formatted_phone = format_phone_number(phone_number)
#             logger.debug(f"Final formatted phone number: {formatted_phone}")

#             # Generate or update OTP
#             otp, created = OTP.objects.get_or_create(phone_number=formatted_phone)
#             if not created:
#                 otp.created_at = timezone.now()
#             otp.generate_otp()
#             logger.debug(f"Generated OTP: {otp.otp_code} for {formatted_phone}")

#             # Send OTP via Infobip SMS API
#             headers = {
#                 "Authorization": f"App {INFOBIP_API_KEY}",
#                 "Content-Type": "application/json",
#                 "Accept": "application/json"
#             }
#             payload = {
#                 "messages": [
#                     {
#                         "from": SENDER_ID,
#                         "destinations": [{"to": formatted_phone}],
#                         "text": f"Your OTP is {otp.otp_code}. Valid for 10 minutes."
#                     }
#                 ]
#             }

#             response = requests.post(INFOBIP_SMS_ENDPOINT, json=payload, headers=headers)
#             logger.debug(f"Infobip response status: {response.status_code}, body: {response.text}")

#             if response.status_code == 200:
#                 return Response({"message": "OTP sent successfully"}, status=200)
#             else:
#                 error_detail = response.json().get("requestError", {}).get("serviceException", {}).get("text", "Unknown error")
#                 logger.error(f"Failed to send OTP via Infobip: {error_detail}")
#                 return Response({"error": f"Failed to send OTP: {error_detail}"}, status=response.status_code)

#         except ValueError as ve:
#             logger.error(f"Phone number validation error: {str(ve)}")
#             return Response({"error": str(ve)}, status=400)
#         except Exception as e:
#             logger.error(f"Error in GenerateOTPView: {str(e)}")
#             return Response({"error": f"Error: {str(e)}"}, status=400)

# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         otp_code = request.data.get("otp_code")

#         if not all([phone_number, otp_code]):
#             logger.warning("Missing phone_number or otp_code in request")
#             return Response({"error": "Phone number and OTP code are required"}, status=400)

#         try:
#             # Format phone number to E.164 (+254XXXXXXXXX)
#             formatted_phone = format_phone_number(phone_number)
#             logger.debug(f"Verifying OTP for: {formatted_phone}")

#             otp = OTP.objects.get(phone_number=formatted_phone)
#             if otp.otp_code == otp_code and otp.is_valid():
#                 logger.debug(f"OTP {otp_code} verified successfully for {formatted_phone}")
#                 return Response({"message": "OTP verified successfully"}, status=200)
#             else:
#                 logger.warning(f"Invalid or expired OTP for {formatted_phone}")
#                 return Response({"error": "Invalid or expired OTP"}, status=400)

#         except OTP.DoesNotExist:
#             logger.warning(f"OTP not found for {formatted_phone}")
#             return Response({"error": "OTP not found"}, status=404)
#         except ValueError as ve:
#             logger.error(f"Phone number validation error: {str(ve)}")
#             return Response({"error": str(ve)}, status=400)
#         except Exception as e:
#             logger.error(f"Error in VerifyOTPView: {str(e)}")
#             return Response({"error": str(e)}, status=400)




# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .models import OTP
# from .serializers import GenerateOTPSerializer, VerifyOTPSerializer
# from django.utils import timezone
# import requests
# import logging

# logger = logging.getLogger(__name__)

# # Infobip Configuration
# INFOBIP_API_KEY = "a75c79215e3471ed7112c8b3d3edf513-44181a17-db90-48c5-875a-1abdfbf9a334"
# INFOBIP_BASE_URL = "https://d9z3qr.api.infobip.com"
# INFOBIP_SMS_ENDPOINT = f"{INFOBIP_BASE_URL}/sms/2/text/advanced"
# SENDER_ID = "+447491163443"
# OTP_EXPIRY_MINUTES = 10

# class GenerateOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.debug(f"Received POST data: {request.data}")
#         serializer = GenerateOTPSerializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Serializer validation failed: {serializer.errors}")
#             return Response(serializer.errors, status=400)

#         try:
#             phone_number = serializer.validated_data['phone_number']
#             otp = OTP.create_or_update(phone_number)
#             otp.generate_otp()
#             logger.info(f"Generated OTP for {otp.phone_number} (Expires: {otp.expires_at})")

#             # Send OTP via SMS
#             headers = {
#                 "Authorization": f"App {INFOBIP_API_KEY}",
#                 "Content-Type": "application/json",
#                 "Accept": "application/json"
#             }
#             payload = {
#                 "messages": [{
#                     "from": SENDER_ID,
#                     "destinations": [{"to": str(otp.phone_number)}],
#                     "text": f"Your OTP is {otp.otp_code}. Valid for {OTP_EXPIRY_MINUTES} minutes."
#                 }]
#             }

#             response = requests.post(INFOBIP_SMS_ENDPOINT, json=payload, headers=headers)
#             if response.status_code != 200:
#                 error_detail = response.json().get("requestError", {}).get("serviceException", {}).get("text", "Unknown error")
#                 logger.error(f"Failed to send OTP via Infobip: {error_detail}")
#                 return Response({"error": f"Failed to send OTP: {error_detail}"}, status=response.status_code)

#             return Response({
#                 "message": "OTP sent successfully",
#                 "expires_at": otp.expires_at
#             }, status=200)

#         except Exception as e:
#             logger.error(f"Error in GenerateOTPView: {str(e)}")
#             return Response({"error": "Internal server error"}, status=500)

# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.debug(f"Received POST data: {request.data}")
#         serializer = VerifyOTPSerializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Serializer validation failed: {serializer.errors}")
#             return Response(serializer.errors, status=400)

#         try:
#             phone_number = serializer.validated_data['phone_number']
#             otp = OTP.objects.get(phone_number=phone_number)
            
#             if not otp.is_valid():
#                 otp.increment_attempts()
#                 logger.warning(f"Expired OTP attempt for {otp.phone_number}")
#                 return Response({"error": "OTP has expired"}, status=400)
                
#             if otp.otp_code != serializer.validated_data['otp_code']:
#                 otp.increment_attempts()
#                 logger.warning(f"Invalid OTP attempt for {otp.phone_number}")
#                 return Response({"error": "Invalid OTP code"}, status=400)
                
#             otp.mark_verified()
#             logger.info(f"Successful OTP verification for {otp.phone_number}")
            
#             return Response({
#                 "message": "OTP verified successfully",
#                 "verified": True
#             }, status=200)

#         except OTP.DoesNotExist:
#             logger.warning(f"OTP not found for {phone_number}")
#             return Response({"error": "OTP not found. Please request a new OTP"}, status=404)
#         except Exception as e:
#             logger.error(f"Error in VerifyOTPView: {str(e)}")
#             return Response({"error": "Internal server error"}, status=500)





# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .models import OTP
# from .serializers import GenerateOTPSerializer, VerifyOTPSerializer
# from django.utils import timezone
# import requests
# import logging

# logger = logging.getLogger(__name__)

# INFOBIP_API_KEY = "a75c79215e3471ed7112c8b3d3edf513-44181a17-db90-48c5-875a-1abdfbf9a334"
# INFOBIP_BASE_URL = "https://d9z3qr.api.infobip.com"
# INFOBIP_SMS_ENDPOINT = f"{INFOBIP_BASE_URL}/sms/2/text/advanced"
# SENDER_ID = "+447491163443"
# OTP_EXPIRY_MINUTES = 10

# class GenerateOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.debug(f"Received POST data: {request.data}")
#         serializer = GenerateOTPSerializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Serializer validation failed: {serializer.errors}")
#             return Response(serializer.errors, status=400)

#         try:
#             phone_number = serializer.validated_data['phone_number']
#             otp = OTP.create_or_update(phone_number)
#             logger.info(f"Generated OTP for {otp.phone_number} (Expires: {otp.expires_at})")

#             headers = {
#                 "Authorization": f"App {INFOBIP_API_KEY}",
#                 "Content-Type": "application/json",
#                 "Accept": "application/json"
#             }
#             payload = {
#                 "messages": [{
#                     "from": SENDER_ID,
#                     "destinations": [{"to": str(otp.phone_number)}],
#                     "text": f"Your OTP is {otp.otp_code}. Valid for {OTP_EXPIRY_MINUTES} minutes."
#                 }]
#             }

#             response = requests.post(INFOBIP_SMS_ENDPOINT, json=payload, headers=headers)
#             if response.status_code != 200:
#                 error_detail = response.json().get("requestError", {}).get("serviceException", {}).get("text", "Unknown error")
#                 logger.error(f"Failed to send OTP via Infobip: {error_detail}")
#                 return Response({"error": f"Failed to send OTP: {error_detail}"}, status=response.status_code)

#             return Response({
#                 "message": "OTP sent successfully",
#                 "expires_at": otp.expires_at
#             }, status=200)

#         except Exception as e:
#             logger.error(f"Error in GenerateOTPView: {str(e)}")
#             return Response({"error": "Internal server error"}, status=500)


# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.debug(f"Received POST data: {request.data}")
#         serializer = VerifyOTPSerializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Serializer validation failed: {serializer.errors}")
#             return Response(serializer.errors, status=400)

#         try:
#             phone_number = serializer.validated_data['phone_number']
#             otp = OTP.objects.get(phone_number=phone_number)
            
#             if not otp.is_valid():
#                 otp.increment_attempts()
#                 logger.warning(f"Expired OTP attempt for {otp.phone_number}")
#                 return Response({"error": "OTP has expired"}, status=400)
                
#             if otp.otp_code != serializer.validated_data['otp_code']:
#                 otp.increment_attempts()
#                 logger.warning(f"Invalid OTP attempt for {otp.phone_number}")
#                 return Response({"error": "Invalid OTP code"}, status=400)
                
#             otp.mark_verified()
#             logger.info(f"Successful OTP verification for {otp.phone_number}")
            
#             return Response({
#                 "message": "OTP verified successfully",
#                 "verified": True
#             }, status=200)

#         except OTP.DoesNotExist:
#             logger.warning(f"OTP not found for {phone_number}")
#             return Response({"error": "OTP not found. Please request a new OTP"}, status=404)
#         except Exception as e:
#             logger.error(f"Error in VerifyOTPView: {str(e)}")
#             return Response({"error": "Internal server error"}, status=500)



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from .models import OTP
# from .serializers import GenerateOTPSerializer, VerifyOTPSerializer
# import logging
# import os
# from twilio.rest import Client
# from twilio.base.exceptions import TwilioRestException

# logger = logging.getLogger(__name__)

# # Twilio credentials from environment variables 
# TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
# TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")  
# OTP_EXPIRY_MINUTES = 10

# class GenerateOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.debug(f"Received POST data: {request.data}")
#         serializer = GenerateOTPSerializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Serializer validation failed: {serializer.errors}")
#             return Response(serializer.errors, status=400)

#         phone_number = serializer.validated_data['phone_number']
#         otp = OTP.create_or_update(phone_number)
#         logger.info(f"Generated OTP for {otp.phone_number} (Expires: {otp.expires_at})")

#         # Initialize Twilio client
#         try:
#             client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
#             message = client.messages.create(
#                 body=f"Your OTP is {otp.otp_code}. Valid for {OTP_EXPIRY_MINUTES} minutes.",
#                 from_=TWILIO_PHONE_NUMBER,
#                 to=phone_number
#             )
#             logger.info(f"OTP sent successfully to {otp.phone_number}. Twilio SID: {message.sid}")
#             return Response({
#                 "message": "OTP sent successfully",
#                 "expires_at": otp.expires_at
#             }, status=200)
#         except TwilioRestException as e:
#             logger.error(f"Failed to send OTP via Twilio: {str(e)}")
#             return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)
#         except Exception as e:
#             logger.error(f"Unexpected error in GenerateOTPView: {str(e)}")
#             return Response({"error": "Internal server error"}, status=500)

# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         logger.debug(f"Received POST data: {request.data}")
#         serializer = VerifyOTPSerializer(data=request.data)
#         if not serializer.is_valid():
#             logger.error(f"Serializer validation failed: {serializer.errors}")
#             return Response(serializer.errors, status=400)

#         phone_number = serializer.validated_data['phone_number']
#         try:
#             otp = OTP.objects.get(phone_number=phone_number)
            
#             if not otp.is_valid():
#                 otp.increment_attempts()
#                 logger.warning(f"Invalid OTP attempt for {otp.phone_number}: Expired or too many attempts")
#                 return Response({"error": "OTP has expired or maximum attempts exceeded"}, status=400)
                
#             if otp.otp_code != serializer.validated_data['otp_code']:
#                 otp.increment_attempts()
#                 logger.warning(f"Invalid OTP code attempt for {otp.phone_number}")
#                 return Response({"error": "Invalid OTP code"}, status=400)
                
#             otp.mark_verified()
#             logger.info(f"Successful OTP verification for {otp.phone_number}")
#             return Response({
#                 "message": "OTP verified successfully",
#                 "verified": True
#             }, status=200)

#         except OTP.DoesNotExist:
#             logger.warning(f"OTP not found for {phone_number}")
#             return Response({"error": "OTP not found. Please request a new OTP"}, status=404)
#         except Exception as e:
#             logger.error(f"Error in VerifyOTPView: {str(e)}")
#             return Response({"error": "Internal server error"}, status=500)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import OTP
from .serializers import GenerateOTPSerializer, VerifyOTPSerializer
import logging
import os
import requests
import base64

logger = logging.getLogger(__name__)

# SMSLeopard credentials from environment variables
SMSLEOPARD_API_KEY = os.getenv("SMSLEOPARD_API_KEY")
SMSLEOPARD_API_SECRET = os.getenv("SMSLEOPARD_API_SECRET")
SMSLEOPARD_ACCESS_TOKEN = os.getenv("SMSLEOPARD_ACCESS_TOKEN")  # Unused but kept
SMSLEOPARD_SMS_URL = "https://api.smsleopard.com/v1/sms/send"
OTP_EXPIRY_MINUTES = 10

class GenerateOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.debug(f"Received POST data: {request.data}")
        serializer = GenerateOTPSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer validation failed: {serializer.errors}")
            return Response(serializer.errors, status=400)

        phone_number = serializer.validated_data['phone_number']
        otp = OTP.create_or_update(phone_number)
        logger.info(f"Generated OTP for {otp.phone_number} (Expires: {otp.expires_at})")

        # Send OTP via SMSLeopard with Basic Auth (POST)
        try:
            # Create Base64-encoded credentials
            credentials = f"{SMSLEOPARD_API_KEY}:{SMSLEOPARD_API_SECRET}"
            base64_credentials = base64.b64encode(credentials.encode()).decode()

            headers = {
                "Authorization": f"Basic {base64_credentials}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            payload = {
                "message": f"Your OTP is {otp.otp_code}. Valid for {OTP_EXPIRY_MINUTES} minutes.",
                "source": "SMS_Leopard",
                "destination": [{"number": phone_number.replace('+', '')}]
            }
            logger.debug(f"Sending to SMSLeopard - Headers: {headers}")
            logger.debug(f"Sending to SMSLeopard - Payload: {payload}")
            response = requests.post(SMSLEOPARD_SMS_URL, json=payload, headers=headers)
            response.raise_for_status()
            response_data = response.json()
            logger.info(f"OTP sent successfully to {otp.phone_number}. SMSLeopard Response: {response_data}")
            return Response({
                "message": "OTP sent successfully",
                "expires_at": otp.expires_at
            }, status=200)
        except requests.RequestException as e:
            error_msg = e.response.text if e.response else str(e)
            logger.error(f"Failed to send OTP via SMSLeopard: {error_msg}")
            return Response({"error": f"Failed to send OTP: {error_msg}"}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in GenerateOTPView: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logger.debug(f"Received POST data: {request.data}")
        serializer = VerifyOTPSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer validation failed: {serializer.errors}")
            return Response(serializer.errors, status=400)

        phone_number = serializer.validated_data['phone_number']
        try:
            otp = OTP.objects.get(phone_number=phone_number)
            if not otp.is_valid():
                otp.increment_attempts()
                logger.warning(f"Invalid OTP attempt for {otp.phone_number}: Expired or too many attempts")
                return Response({"error": "OTP has expired or maximum attempts exceeded"}, status=400)
            if otp.otp_code != serializer.validated_data['otp_code']:
                otp.increment_attempts()
                logger.warning(f"Invalid OTP code attempt for {otp.phone_number}")
                return Response({"error": "Invalid OTP code"}, status=400)
            otp.mark_verified()
            logger.info(f"Successful OTP verification for {otp.phone_number}")
            return Response({
                "message": "OTP verified successfully",
                "verified": True
            }, status=200)
        except OTP.DoesNotExist:
            logger.warning(f"OTP not found for {phone_number}")
            return Response({"error": "OTP not found. Please request a new OTP"}, status=404)
        except Exception as e:
            logger.error(f"Error in VerifyOTPView: {str(e)}")
            return Response({"error": "Internal server error"}, status=500)