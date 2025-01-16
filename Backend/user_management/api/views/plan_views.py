from datetime import timezone
from rest_framework import viewsets

from Backend.user_management.models.user_profile import UserProfile
from ...models import Plan
from ...serializers import PlanSerializer

class PlanViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing plans. Provides standard actions like list,
      create, retrieve, update, and destroy.

    Attributes:
        queryset (QuerySet): All Plan objects.
        serializer_class (PlanSerializer): Serializer to use for the data.

    Methods:
        None specific, uses default ModelViewSet methods.
    """
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer


from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from ...models import UserPlan
from ...serializers import UserPlanSerializer
import mpesa_integration  # Assuming you have this module for M-Pesa interactions

class UserPlanViewSet(viewsets.ModelViewSet):
    queryset = UserPlan.objects.all()
    serializer_class = UserPlanSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can interact

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def initiate_payment(self, request):
        """
        Initiate payment process for plan assignment. This method:
        - Requires user ID, plan ID, and device MAC address from the frontend
        - Starts M-Pesa payment process
        - Returns a transaction ID for frontend tracking

        Note: This assumes the frontend sends secure, validated data.
        """
        user_id = request.user.id  # Use authenticated user's ID
        plan_id = request.data.get('plan_id')
        device_mac_address = request.data.get('device_mac_address')

        if not all([plan_id, device_mac_address]):
            return Response({"error": "Missing required data"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # Mock M-Pesa payment initiation
        transaction_id = mpesa_integration.initiate_payment(user_id, plan_id, plan.price, device_mac_address)

        return Response({'transaction_id': transaction_id}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm_payment(self, request):
        """
        Confirm payment after M-Pesa callback. This method:
        - Checks payment status from M-Pesa
        - Assigns plan if payment is confirmed
        - Updates payment status in UserPlan
        """
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({'error': 'Transaction ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        payment_status = mpesa_integration.check_payment_status(transaction_id)

        if payment_status == 'Completed':
            user_id = request.user.id
            plan_id = request.data.get('plan_id')
            device_mac_address = request.data.get('device_mac_address')

            try:
                plan = Plan.objects.get(id=plan_id)
                user = UserProfile.objects.get(id=user_id)
                
                # Create or update UserPlan
                user_plan, created = UserPlan.objects.update_or_create(
                    user=user,
                    device_mac_address=device_mac_address,
                    defaults={
                        'plan': plan,
                        'assigned_date': timezone.now(),
                        'payment_status': 'Completed',
                        'transaction_id': transaction_id
                    }
                )
                return Response({'status': 'Plan assigned successfully', 
                                 'user_plan': UserPlanSerializer(user_plan).data}, 
                                 status=status.HTTP_200_OK)
            except (Plan.DoesNotExist, UserProfile.DoesNotExist):
                return Response({'error': 'Plan or User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'status': 'Payment confirmation failed'}, status=status.HTTP_400_BAD_REQUEST)