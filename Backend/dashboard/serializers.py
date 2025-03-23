# from rest_framework import serializers
# from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics
# from .utils import get_rate_color

# class GridItemSerializer(serializers.ModelSerializer):
#     """
#     Serializer for GridItem model, adding a custom field for rate color representation.
#     """
#     rate_color = serializers.SerializerMethodField()

#     class Meta:
#         model = GridItem
#         fields = ['id', 'label', 'value', 'rate', 'icon', 'signal_icon', 'rate_color']

#     def get_rate_color(self, obj):
#         return get_rate_color(obj.rate)

# class SalesDataSerializer(serializers.ModelSerializer):
#     """
#     Serializer for SalesData model.
#     """
#     class Meta:
#         model = SalesData
#         fields = ['id', 'plan', 'month', 'sales']

# class RevenueDataSerializer(serializers.ModelSerializer):
#     """
#     Serializer for RevenueData model.
#     """
#     class Meta:
#         model = RevenueData
#         fields = ['id', 'month', 'targeted_revenue', 'projected_revenue']

# class FinancialDataSerializer(serializers.ModelSerializer):
#     """
#     Serializer for FinancialData model.
#     """
#     class Meta:
#         model = FinancialData
#         fields = ['id', 'month', 'income', 'profit', 'expenses']

# class VisitorAnalyticsSerializer(serializers.ModelSerializer):
#     """
#     Serializer for VisitorAnalytics model.
#     """
#     class Meta:
#         model = VisitorAnalytics
#         fields = ['id', 'plan', 'visitors']



# dashboard/serializers.py
from rest_framework import serializers
from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics
from .utils import get_rate_color

class GridItemSerializer(serializers.ModelSerializer):
    rate_color = serializers.SerializerMethodField()

    class Meta:
        model = GridItem
        fields = ['id', 'label', 'value', 'rate', 'icon', 'signal_icon', 'rate_color']

    def get_rate_color(self, obj):
        return get_rate_color(obj.rate)

class SalesDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesData
        fields = ['id', 'plan', 'month', 'sales']

class RevenueDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevenueData
        fields = ['id', 'month', 'targeted_revenue', 'projected_revenue']

class FinancialDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialData
        fields = ['id', 'month', 'income', 'profit', 'expenses']

class VisitorAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitorAnalytics
        fields = ['id', 'plan', 'visitors']