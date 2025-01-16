from rest_framework import serializers
from .models import UsageReport, FinancialReport

class UsageReportSerializer(serializers.ModelSerializer):
    """Serializer for UsageReport model."""

    class Meta:
        model = UsageReport
        fields = '__all__'


class FinancialReportSerializer(serializers.ModelSerializer):
    """Serializer for FinancialReport model."""

    class Meta:
        model = FinancialReport
        fields = '__all__'
