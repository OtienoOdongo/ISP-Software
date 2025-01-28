from rest_framework import viewsets
from rest_framework.response import Response
from reporting.models.usage_report import UsageReport
from reporting.serializers.usage_report import UsageReportSerializer

class UsageReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing usage reports, providing read-only operations.

    Attributes:
        queryset: All UsageReport instances.
        serializer_class: Serializer for UsageReport model.
    """
    queryset = UsageReport.objects.all().order_by('month')
    serializer_class = UsageReportSerializer

    def list(self, request, *args, **kwargs):
        """
        Override list method to provide structured data for charts.

        Returns:
            A JSON response with data structured for the charts in the frontend.
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        response_data = {
            'dataUsage': {
                'months': [d['month'] for d in data],
                'used': [d['used_data'] for d in data],
                'remaining': [d['remaining_data'] for d in data],
            },
            'stackedAreaData': {
                'months': [d['month'] for d in data],
                'activeUsers': [d['active_users'] for d in data],
                'inactiveUsers': [d['inactive_users'] for d in data],
            },
            'comboChartData': {
                'months': [d['month'] for d in data],
                'usage': [d['used_data'] for d in data],
                'performance': [d['network_performance'] for d in data],
            }
        }
        
        return Response(response_data)