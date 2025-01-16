from rest_framework import serializers
from .models import Stat, Chart

class StatSerializer(serializers.ModelSerializer):
    """
    Serializer for Stat model to handle JSON serialization/deserialization.
    """
    label = serializers.CharField(max_length=50)
    value = serializers.CharField(max_length=50)
    icon = serializers.ImageField(required=False)
    rate = serializers.FloatField()

    class Meta:
        model = Stat
        fields = ['id', 'label', 'value', 'icon', 'rate']


class ChartSerializer(serializers.ModelSerializer):
    """
    Serializer for Chart model to handle JSON serialization/deserialization.
    """
    title = serializers.CharField(max_length=100)
    data = serializers.JSONField()
    chart_type = serializers.CharField(max_length=50)

    class Meta:
        model = Chart
        fields = ['id', 'title', 'data', 'chart_type']
