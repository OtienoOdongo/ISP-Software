from rest_framework import viewsets
from internet_plans.models.plan_analytics import PlanAnalytics
from internet_plans.serializers.plan_analytics import PlanAnalyticsSerializer

class PlanAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A ViewSet that provides read-only access to internet plan analytics:
    
    - Popularity metrics (sales, active users)
    - Network performance metrics (bandwidth usage, uptime)
    - User feedback analysis
    """
    queryset = PlanAnalytics.objects.all()
    serializer_class = PlanAnalyticsSerializer

    def get_queryset(self):
        """
        Override if filtering of the queryset is needed, like time-based analytics.
        """
        return super().get_queryset()