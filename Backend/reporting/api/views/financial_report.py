from rest_framework import viewsets
from rest_framework.response import Response
from reporting.models import MonthlyFinancial
from reporting.serializers import MonthlyFinancialSerializer

class FinancialReportsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for handling financial report data, providing read-only operations.

    Attributes:
        queryset: All MonthlyFinancial instances.
        serializer_class: Serializer for MonthlyFinancial model.
    """
    queryset = MonthlyFinancial.objects.order_by('month')
    serializer_class = MonthlyFinancialSerializer

    def list(self, request, *args, **kwargs):
        """
        Override list method to provide structured data for both charts.

        Returns:
            A JSON response with data structured for the revenue and financial bar charts in the frontend.
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        response_data = {
            'revenue': {
                'months': [d['month'] for d in data],
                'targetedRevenue': [d['targeted_revenue'] for d in data],
                'projectedRevenue': [d['projected_revenue'] for d in data],
            },
            'financialBar': {
                'months': [d['month'] for d in data],
                'income': [d['income'] for d in data],
                'profit': [d['profit'] for d in data],
                'expenses': [d['expenses'] for d in data],
            }
        }
        
        return Response(response_data)