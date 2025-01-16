from rest_framework import viewsets
from ...models import UserBilling
from ...serializers import UserBillingSerializer

class UserBillingViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing user billing information. Provides standard actions
    like list, create, retrieve, update, and destroy.

    Attributes:
        queryset (QuerySet): All UserBilling objects.
        serializer_class (UserBillingSerializer): Serializer to use for the data.

    Methods:
        None specific, uses default ModelViewSet methods.
    """
    queryset = UserBilling.objects.all()
    serializer_class = UserBillingSerializer



from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from ...models import Payment
from ...serializers import PaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing payments. Provides actions for listing, creating, retrieving, 
    updating, and deleting payments, along with custom actions.

    Attributes:
        queryset (QuerySet): All Payment objects.
        serializer_class (PaymentSerializer): Serializer to use for the data.

    Methods:
        get_user_payments: Custom action to fetch payments for a specific user.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    @action(detail=False, methods=['get'])
    def get_user_payments(self, request):
        """
        Fetch all payments for a given user.

        Query Parameters:
            user_id (int): The ID of the user whose payments are to be retrieved.

        Returns:
            Response: Serialized data of all payments for the specified user.
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "User ID is required"}, status=400)

        payments = Payment.objects.filter(user_id=user_id)
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)