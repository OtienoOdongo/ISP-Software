from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
import uuid
from account.serializers.settings_serializer import AccountSettingsSerializer
from account.models.setting_model import AdminSettings

class AccountSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        admin = request.user
        settings, created = AdminSettings.objects.get_or_create(user=admin)
        serializer = AccountSettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        admin = request.user
        settings, created = AdminSettings.objects.get_or_create(user=admin)
        serializer = AccountSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        admin = request.user
        settings, created = AdminSettings.objects.get_or_create(user=admin)
        action = request.data.get('action')
        if action == 'generate_api_key':
            new_key = uuid.uuid4().hex[:30]
            settings.api_key = new_key
            settings.save()
            return Response({"api_key": new_key}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)