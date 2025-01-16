from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Transaction, PaymentGateway
from .serializers import TransactionSerializer, PaymentGatewaySerializer


class TransactionMonitoringView(APIView):
    """
    Monitors payment transactions made by clients.
    """

    def get(self, request):
        """
        Retrieve all transactions.
        """
        transactions = Transaction.objects.all()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class PaymentGatewaySettingsView(APIView):
    """
    Manages settings for the payment gateway.
    """

    def get(self, request):
        """
        Retrieve payment gateway settings.
        """
        settings = PaymentGateway.objects.all()
        serializer = PaymentGatewaySerializer(settings, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Update or add payment gateway settings.
        """
        serializer = PaymentGatewaySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

