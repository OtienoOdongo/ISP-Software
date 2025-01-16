from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AutomatedAlert, ScheduledMaintenance, TaskAutomation
from .serializers import AutomatedAlertSerializer, ScheduledMaintenanceSerializer, TaskAutomationSerializer
from django.shortcuts import get_object_or_404

class AutomatedAlertListView(APIView):
    def get(self, request):
        alerts = AutomatedAlert.objects.filter(user=request.user)  # Filter by logged-in user
        serializer = AutomatedAlertSerializer(alerts, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        data['user'] = request.user.id  # Automatically associate with the logged-in user
        serializer = AutomatedAlertSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AutomatedAlertDetailView(APIView):
    def get(self, request, pk):
        alert = get_object_or_404(AutomatedAlert, pk=pk, user=request.user)  # Ensure the alert belongs to the user
        serializer = AutomatedAlertSerializer(alert)
        return Response(serializer.data)


class ScheduledMaintenanceListView(APIView):
    def get(self, request):
        maintenances = ScheduledMaintenance.objects.filter(user=request.user)  # Filter by logged-in user
        serializer = ScheduledMaintenanceSerializer(maintenances, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        data['user'] = request.user.id  # Automatically associate with the logged-in user
        serializer = ScheduledMaintenanceSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ScheduledMaintenanceDetailView(APIView):
    def get(self, request, pk):
        maintenance = get_object_or_404(ScheduledMaintenance, pk=pk, user=request.user)  # Ensure the record belongs to the user
        serializer = ScheduledMaintenanceSerializer(maintenance)
        return Response(serializer.data)


class TaskAutomationListView(APIView):
    def get(self, request):
        tasks = TaskAutomation.objects.filter(user=request.user)  # Filter by logged-in user
        serializer = TaskAutomationSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        data['user'] = request.user.id  # Automatically associate with the logged-in user
        serializer = TaskAutomationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskAutomationDetailView(APIView):
    def get(self, request, pk):
        task = get_object_or_404(TaskAutomation, pk=pk, user=request.user)  # Ensure the record belongs to the user
        serializer = TaskAutomationSerializer(task)
        return Response(serializer.data)
