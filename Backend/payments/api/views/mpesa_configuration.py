from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from payments.models.mpesa_configuration import MpesaConfig
from payments.serializers.mpesa_configuration import MpesaConfigSerializer
from django.core.exceptions import ObjectDoesNotExist

class MpesaConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing M-Pesa configurations, providing CRUD operations and custom actions.

    Attributes:
        queryset: All MpesaConfig instances.
        serializer_class: Serializer for MpesaConfig model.
    """
    queryset = MpesaConfig.objects.all()
    serializer_class = MpesaConfigSerializer

    def get_queryset(self):
        """
        Override to ensure only one configuration can exist. 
        Returns the single configuration if it exists, otherwise an empty queryset.
        """
        return MpesaConfig.objects.all()[:1]  # Only one configuration should exist

    def create(self, request, *args, **kwargs):
        """
        Custom create method to ensure only one configuration can be saved.
        If a configuration already exists, it updates it instead of creating a new one.
        """
        try:
            obj = self.queryset.first()
            if obj:
                # Update existing configuration
                serializer = self.get_serializer(obj, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                # Create new configuration
                return super().create(request, *args, **kwargs)
        except ObjectDoesNotExist:
            return Response({"error": "No configuration found."}, 
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def get_config(self, request):
        """
        Custom action to fetch the current M-Pesa configuration.
        """
        config = self.get_queryset().first()
        if config:
            return Response(MpesaConfigSerializer(config).data)
        else:
            return Response({"error": "No configuration found."}, 
                            status=status.HTTP_404_NOT_FOUND)
