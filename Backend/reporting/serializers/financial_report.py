from rest_framework import serializers
from reporting.models import MonthlyFinancial

class MonthlyFinancialSerializer(serializers.ModelSerializer):
    """
    Serializer for the MonthlyFinancial model to convert model instances to/from native Python datatypes.
    """
    class Meta:
        model = MonthlyFinancial
        fields = ['month', 'targeted_revenue', 'projected_revenue', 'income', 'profit', 'expenses']