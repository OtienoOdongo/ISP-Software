# account/api/views/settings_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from account.serializers.settings_serializer import AdminSettingsSerializer, SessionSerializer
from account.models.setting_model import AdminSettings, Session, generate_api_key
from django.contrib.sessions.models import Session as DjangoSession
from django.http import HttpResponse
from django.contrib.auth import logout as django_logout
import pyotp
import qrcode
from io import BytesIO
import base64
import zipfile
import json

class AdminSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        settings, _ = AdminSettings.objects.get_or_create(user=request.user)
        sessions = Session.objects.filter(user=request.user)
        serializer = AdminSettingsSerializer(settings)
        session_serializer = SessionSerializer(sessions, many=True)
        data = {
            **serializer.data,
            "active_sessions": session_serializer.data,
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request):
        settings, _ = AdminSettings.objects.get_or_create(user=request.user)
        serializer = AdminSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class GenerateApiKeyView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        settings, _ = AdminSettings.objects.get_or_create(user=request.user)
        new_api_key = generate_api_key()
        settings.api_key = new_api_key
        settings.save()
        return Response({"api_key": new_api_key}, status=status.HTTP_200_OK)

class TwoFactorSetupView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        settings, _ = AdminSettings.objects.get_or_create(user=request.user)
        if not settings.two_factor_secret:
            secret = pyotp.random_base32()
            settings.two_factor_secret = secret
            settings.save()
        totp_uri = pyotp.TOTP(settings.two_factor_secret).provisioning_uri(
            request.user.email, issuer_name="YourApp"
        )
        qr = qrcode.make(totp_uri)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        buffer.close()
        backup_codes = [pyotp.TOTP(settings.two_factor_secret).at(i) for i in range(1, 6)]
        return Response({"qr_code_url": f"data:image/png;base64,{qr_code_base64}", "backup_codes": backup_codes})

class SessionLogoutView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        session_id = request.data.get("session_id")
        if not session_id:
            return Response({"error": "Session ID required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            session = Session.objects.get(id=session_id, user=request.user)
            DjangoSession.objects.filter(session_key=session.session_key).delete()
            session.delete()
            return Response({"message": "Session logged out"}, status=status.HTTP_200_OK)
        except Session.DoesNotExist:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

class SessionLogoutAllView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        sessions = Session.objects.filter(user=request.user)
        for session in sessions:
            DjangoSession.objects.filter(session_key=session.session_key).delete()
        sessions.delete()
        django_logout(request)
        return Response({"message": "All sessions logged out"}, status=status.HTTP_200_OK)

class DataExportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        buffer = BytesIO()
        with zipfile.ZipFile(buffer, "w") as zip_file:
            settings, _ = AdminSettings.objects.get_or_create(user=request.user)
            settings_data = json.dumps(AdminSettingsSerializer(settings).data, indent=2)
            zip_file.writestr("settings.json", settings_data)
            sessions = Session.objects.filter(user=request.user)
            sessions_data = json.dumps(SessionSerializer(sessions, many=True).data, indent=2)
            zip_file.writestr("sessions.json", sessions_data)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/zip")
        response["Content-Disposition"] = "attachment; filename=account_data.zip"
        return response

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "Account deleted"}, status=status.HTTP_204_NO_CONTENT)