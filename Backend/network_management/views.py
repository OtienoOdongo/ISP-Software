from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Router, BandwidthAllocation, IPAddress, NetworkDiagnostic, SecuritySetting
from .serializers import (
    RouterSerializer,
    BandwidthAllocationSerializer,
    IPAddressSerializer,
    NetworkDiagnosticSerializer,
    SecuritySettingSerializer,
)


class RouterManagementView(APIView):
    """
    Manages router configurations and settings.
    """

    def get(self, request):
        """
        Retrieve all routers.
        """
        routers = Router.objects.all()
        serializer = RouterSerializer(routers, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Add a new router.
        """
        serializer = RouterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BandwidthAllocationView(APIView):
    """
    Handles bandwidth allocation for users or groups.
    """

    def get(self, request):
        """
        Retrieve all bandwidth allocations.
        """
        allocations = BandwidthAllocation.objects.all()
        serializer = BandwidthAllocationSerializer(allocations, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Add a new bandwidth allocation.
        """
        serializer = BandwidthAllocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IPAddressManagementView(APIView):
    """
    Handles CRUD operations for IP address management.
    """

    def get(self, request):
        """
        Retrieve all managed IP addresses.
        """
        ip_addresses = IPAddress.objects.all()
        serializer = IPAddressSerializer(ip_addresses, many=True)
        return Response(serializer.data)


class NetworkDiagnosticsView(APIView):
    """
    Provides diagnostics for network health and performance.
    """

    def get(self, request):
        """
        Retrieve all network diagnostics reports.
        """
        diagnostics = NetworkDiagnostic.objects.all()
        serializer = NetworkDiagnosticSerializer(diagnostics, many=True)
        return Response(serializer.data)


class SecuritySettingsView(APIView):
    """
    Manages network security settings.
    """

    def get(self, request):
        """
        Retrieve all security settings.
        """
        settings = SecuritySetting.objects.all()
        serializer = SecuritySettingSerializer(settings, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Add or update security settings.
        """
        serializer = SecuritySettingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
