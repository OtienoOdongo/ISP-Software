from rest_framework import serializers
from .models import FAQ, SupportTicket

class FAQSerializer(serializers.ModelSerializer):
    """
    Serializer for the FAQ model to handle API serialization.
    """
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer']

class SupportTicketSerializer(serializers.ModelSerializer):
    """
    Serializer for the SupportTicket model to handle API serialization.
    """
    class Meta:
        model = SupportTicket
        fields = ['id', 'user', 'issue', 'status', 'date_created']