# internet_plans/api/views/plan_analytics_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from internet_plans.models.create_plan_models import InternetPlan
from internet_plans.serializers.plan_analytics_serializers import PlanAnalyticsSerializer

class PlanAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve all internet plans for analytics purposes.
        Returns an empty list with a message if no plans exist.
        Only accessible to authenticated users.
        """
        plans = InternetPlan.objects.all()
        if not plans.exists():
            return Response(
                {
                    "message": "No internet plans available for analytics. Please create some plans first.",
                    "results": []
                },
                status=status.HTTP_200_OK
            )
        
        serializer = PlanAnalyticsSerializer(plans, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)