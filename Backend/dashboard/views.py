from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Stat, Chart
from .serializers import StatSerializer, ChartSerializer

class StatListCreateView(APIView):
    """
    API view to list all stats or create a new stat.
    """
    def get(self, request):
        stats = Stat.objects.all()
        serializer = StatSerializer(stats, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StatDetailView(APIView):
    """
    API view to retrieve, update, or delete a specific stat.
    """
    def get(self, request, pk):
        try:
            stat = Stat.objects.get(pk=pk)
            serializer = StatSerializer(stat)
            return Response(serializer.data)
        except Stat.DoesNotExist:
            return Response({"error": "Stat not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            stat = Stat.objects.get(pk=pk)
            serializer = StatSerializer(stat, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Stat.DoesNotExist:
            return Response({"error": "Stat not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            stat = Stat.objects.get(pk=pk)
            stat.delete()
            return Response({"message": "Stat deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Stat.DoesNotExist:
            return Response({"error": "Stat not found"}, status=status.HTTP_404_NOT_FOUND)


class ChartListCreateView(APIView):
    """
    API view to list all charts or create a new chart.
    """
    def get(self, request):
        charts = Chart.objects.all()
        serializer = ChartSerializer(charts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ChartSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChartDetailView(APIView):
    """
    API view to retrieve, update, or delete a specific chart.
    """
    def get(self, request, pk):
        try:
            chart = Chart.objects.get(pk=pk)
            serializer = ChartSerializer(chart)
            return Response(serializer.data)
        except Chart.DoesNotExist:
            return Response({"error": "Chart not found"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            chart = Chart.objects.get(pk=pk)
            serializer = ChartSerializer(chart, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Chart.DoesNotExist:
            return Response({"error": "Chart not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            chart = Chart.objects.get(pk=pk)
            chart.delete()
            return Response({"message": "Chart deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Chart.DoesNotExist:
            return Response({"error": "Chart not found"}, status=status.HTTP_404_NOT_FOUND)


