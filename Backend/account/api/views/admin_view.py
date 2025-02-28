from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.db.models import Sum, Q, Avg
from datetime import date, datetime
import logging
from account.serializers.admin_serializer import (
    AdminProfileSerializer, StatsSerializer, ActivityLogSerializer,
    NetworkHealthSerializer, RouterSerializer
)
from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router

logger = logging.getLogger(__name__)

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """Retrieve admin profile and dashboard data for AdminProfile.jsx"""
        admin = request.user
        logger.debug(f"Authenticated user: {admin}, Name: {admin.name}, Email: {admin.email}")

        profile_serializer = AdminProfileSerializer(admin)
        logger.debug(f"Profile serializer data: {profile_serializer.data}")

        total_clients = Client.objects.count()
        active_clients = Subscription.objects.filter(
            is_active=True,
            end_date__gte=datetime.now()
        ).values('client').distinct().count()
        today = date.today()
        daily_revenue = Payment.objects.filter(
            timestamp__date=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        uptime = "99.8%"  # Mocked; replace with real data if needed
        stats_data = {
            'clients': total_clients,
            'active_clients': active_clients,
            'revenue': float(daily_revenue),  # Convert Decimal to float
            'uptime': uptime,
        }
        stats_serializer = StatsSerializer(stats_data)

        activities = ActivityLog.objects.filter(
            Q(user=admin) | Q(user__isnull=True)
        ).order_by('-timestamp')[:4]
        activity_serializer = ActivityLogSerializer(activities, many=True)

        routers = Router.objects.all()
        avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 42.0
        avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 68.0
        network_data = {'latency': f"{avg_latency}ms", 'bandwidth': f"{avg_bandwidth}%"}
        network_serializer = NetworkHealthSerializer(network_data)
        router_serializer = RouterSerializer(routers, many=True)

        response_data = {
            'profile': profile_serializer.data,
            'stats': stats_serializer.data,
            'activities': activity_serializer.data,
            'network': network_serializer.data,
            'routers': router_serializer.data,
        }
        logger.debug(f"Response data: {response_data}")
        return Response(response_data, status=status.HTTP_200_OK)

    def put(self, request):
        admin = request.user
        serializer = AdminProfileSerializer(admin, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            ActivityLog.objects.create(
                description=f"Admin {admin.name} updated their profile",
                user=admin
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


