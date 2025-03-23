# from rest_framework import viewsets
# from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics
# from .serializers import GridItemSerializer, SalesDataSerializer, RevenueDataSerializer, \
# FinancialDataSerializer, VisitorAnalyticsSerializer

# class GridItemViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing grid items.
#     """
#     queryset = GridItem.objects.all()
#     serializer_class = GridItemSerializer

# class SalesDataViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing sales data across different plans.
#     """
#     queryset = SalesData.objects.all()
#     serializer_class = SalesDataSerializer

# class RevenueDataViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing revenue data.
#     """
#     queryset = RevenueData.objects.all()
#     serializer_class = RevenueDataSerializer

# class FinancialDataViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing financial data.
#     """
#     queryset = FinancialData.objects.all()
#     serializer_class = FinancialDataSerializer

# class VisitorAnalyticsViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for managing visitor analytics data.
#     """
#     queryset = VisitorAnalytics.objects.all()
#     serializer_class = VisitorAnalyticsSerializer




# dashboard/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics
from .serializers import GridItemSerializer, SalesDataSerializer, RevenueDataSerializer, FinancialDataSerializer, \
    VisitorAnalyticsSerializer

class GridItemList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        grid_items = GridItem.objects.all()
        serializer = GridItemSerializer(grid_items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GridItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GridItemDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            grid_item = GridItem.objects.get(pk=pk)
            serializer = GridItemSerializer(grid_item)
            return Response(serializer.data)
        except GridItem.DoesNotExist:
            return Response({"detail": "Grid item not found"}, status=status.HTTP_404_NOT_FOUND)

class SalesDataList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sales_data = SalesData.objects.all()
        serializer = SalesDataSerializer(sales_data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SalesDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RevenueDataList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        revenue_data = RevenueData.objects.all()
        serializer = RevenueDataSerializer(revenue_data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RevenueDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FinancialDataList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        financial_data = FinancialData.objects.all()
        serializer = FinancialDataSerializer(financial_data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FinancialDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VisitorAnalyticsList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        visitor_analytics = VisitorAnalytics.objects.all()
        serializer = VisitorAnalyticsSerializer(visitor_analytics, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VisitorAnalyticsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)