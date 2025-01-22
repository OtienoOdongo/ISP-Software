from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from network_management.models import Device
from network_management.serializers import DeviceSerializer

class DeviceViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing devices associated with user profiles for bandwidth allocation.
    """
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    lookup_field = 'device_id'

    def update_bandwidth(self, request, device_id=None):
        """
        Endpoint for updating bandwidth allocation for a specific device.
        """
        try:
            device = self.get_object()
        except Device.DoesNotExist:
            return Response({'error': 'Device not found'}, status=status.HTTP_404_NOT_FOUND)

        new_allocation = request.data.get('allocated')
        new_qos = request.data.get('qos')

        if new_allocation:
            device.allocated = new_allocation
        if new_qos:
            device.qos = new_qos

        if new_allocation == "Unlimited":
            device.quota = "Unlimited"
            device.unlimited = True
        else:
            device.quota = device.quota  # Keep as is or update logic here if needed
            device.unlimited = False

        device.save()
        return Response(DeviceSerializer(device).data, status=status.HTTP_200_OK)