from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import OTP
from django.utils import timezone
from datetime import timedelta
import requests
from decouple import config
from payments.api.views.mpesa_configuration import format_phone_number;

class GenerateOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return Response({"error": "Phone number is required"}, status=400)

        try:
            phone_number = format_phone_number(phone_number)  # Reuse from payments
            otp, created = OTP.objects.get_or_create(phone_number=phone_number)
            if not created:
                otp.created_at = timezone.now()
            otp.generate_otp()

            # Send OTP via SMS (using a mock SMS API for now; replace with real provider)
            sms_url = "https://api.example.com/sms/send"  # Replace with actual SMS API
            sms_data = {
                "to": phone_number,
                "message": f"Your OTP is {otp.otp_code}. Valid for 10 minutes.",
                "api_key": config("SMS_API_KEY", default="your_sms_api_key"),
            }
            # requests.post(sms_url, json=sms_data)  # Uncomment with real API

            return Response({"message": "OTP sent successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get("phone_number")
        otp_code = request.data.get("otp_code")

        if not all([phone_number, otp_code]):
            return Response({"error": "Phone number and OTP code are required"}, status=400)

        try:
            phone_number = format_phone_number(phone_number)
            otp = OTP.objects.get(phone_number=phone_number)
            if otp.otp_code == otp_code and otp.is_valid():
                return Response({"message": "OTP verified successfully"}, status=200)
            else:
                return Response({"error": "Invalid or expired OTP"}, status=400)
        except OTP.DoesNotExist:
            return Response({"error": "OTP not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)