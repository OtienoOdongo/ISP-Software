from rest_framework import serializers
from network_management.models.Network_Diagnostic import DiagnosticResult

class DiagnosticResultSerializer(serializers.ModelSerializer):
    """
    Serializer for the DiagnosticResult model.
    """
    class Meta:
        model = DiagnosticResult
        fields = '__all__'