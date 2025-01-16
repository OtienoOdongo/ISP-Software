from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UsageReport, FinancialReport
from .serializers import UsageReportSerializer, FinancialReportSerializer


class UsageReportsView(APIView):
    """
    Handles generation and retrieval of usage reports.
    """

    def get(self, request):
        """
        Retrieve all usage reports.
        """
        reports = UsageReport.objects.all()
        serializer = UsageReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Generate a new usage report.
        """
        serializer = UsageReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FinancialReportsView(APIView):
    """
    Handles generation and retrieval of financial reports.
    """

    def get(self, request):
        """
        Retrieve all financial reports.
        """
        reports = FinancialReport.objects.all()
        serializer = FinancialReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Generate a new financial report.
        """
        serializer = FinancialReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
