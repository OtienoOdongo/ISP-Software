from rest_framework import serializers
from .models import SupportTicket, KnowledgeBase, FirmwareUpdate

class SupportTicketSerializer(serializers.ModelSerializer):
    """Serializer for SupportTicket model."""

    class Meta:
        model = SupportTicket
        fields = '__all__'


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    """Serializer for KnowledgeBase model."""

    class Meta:
        model = KnowledgeBase
        fields = '__all__'


class FirmwareUpdateSerializer(serializers.ModelSerializer):
    """Serializer for FirmwareUpdate model."""

    class Meta:
        model = FirmwareUpdate
        fields = '__all__'
