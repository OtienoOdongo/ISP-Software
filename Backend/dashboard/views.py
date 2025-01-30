from rest_framework import viewsets
from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics
from .serializers import GridItemSerializer, SalesDataSerializer, RevenueDataSerializer, \
FinancialDataSerializer, VisitorAnalyticsSerializer

class GridItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing grid items.
    """
    queryset = GridItem.objects.all()
    serializer_class = GridItemSerializer

class SalesDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sales data across different plans.
    """
    queryset = SalesData.objects.all()
    serializer_class = SalesDataSerializer

class RevenueDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing revenue data.
    """
    queryset = RevenueData.objects.all()
    serializer_class = RevenueDataSerializer

class FinancialDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing financial data.
    """
    queryset = FinancialData.objects.all()
    serializer_class = FinancialDataSerializer

class VisitorAnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visitor analytics data.
    """
    queryset = VisitorAnalytics.objects.all()
    serializer_class = VisitorAnalyticsSerializer