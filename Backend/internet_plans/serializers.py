from rest_framework import serializers
from .models import Plan, AnalyticsData, RenewalSettings


class PlanSerializer(serializers.ModelSerializer):
    """
    Serializer for the Plan model.
    """

    class Meta:
        model = Plan
        fields = "__all__"


class AnalyticsDataSerializer(serializers.ModelSerializer):
    """
    Serializer for the AnalyticsData model.
    """

    class Meta:
        model = AnalyticsData
        fields = "__all__"


class RenewalSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for the RenewalSettings model.
    """

    class Meta:
        model = RenewalSettings
        fields = "__all__"
