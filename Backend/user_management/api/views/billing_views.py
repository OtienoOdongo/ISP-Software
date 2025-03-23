# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# import logging
# from user_management.models.billing_payment import UserBilling, Payment
# from user_management.serializers.billing_payment import UserBillingSerializer, PaymentSerializer

# logger = logging.getLogger(__name__)

# class UserBillingAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Only authenticated users

#     def get(self, request, pk=None):
#         """
#         Retrieve user billing information (list or detail).
#         Accessible to any authenticated user.
#         """
#         try:
#             if pk:
#                 user_billing = UserBilling.objects.get(pk=pk)
#                 serializer = UserBillingSerializer(user_billing)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             else:
#                 user_billings = UserBilling.objects.all()
#                 serializer = UserBillingSerializer(user_billings, many=True)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#         except UserBilling.DoesNotExist:
#             return Response(
#                 {"error": "User billing information not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error in UserBillingAPIView GET: {str(e)}")
#             return Response(
#                 {"error": "An error occurred while fetching user billing information."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class PaymentAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Only authenticated users

#     def get(self, request, pk=None):
#         """
#         Retrieve payments (list or detail).
#         Accessible to any authenticated user.
#         """
#         try:
#             if pk:
#                 payment = Payment.objects.get(pk=pk)
#                 serializer = PaymentSerializer(payment)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             else:
#                 user_id = request.query_params.get('user_id')
#                 status_filter = request.query_params.get('status')
#                 queryset = Payment.objects.all()

#                 if user_id:
#                     queryset = queryset.filter(user_id=user_id)
#                 if status_filter:
#                     queryset = queryset.filter(status=status_filter)

#                 serializer = PaymentSerializer(queryset, many=True)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#         except Payment.DoesNotExist:
#             return Response(
#                 {"message": "No payments found."},
#                 status=status.HTTP_200_OK  # Return 200 with empty list
#             )
#         except Exception as e:
#             logger.error(f"Error in PaymentAPIView GET: {str(e)}")
#             return Response(
#                 {"error": "An error occurred while fetching payments."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import logging
from user_management.models.billing_payment import UserBilling, Payment
from user_management.serializers.billing_payment import UserBillingSerializer, PaymentSerializer

logger = logging.getLogger(__name__)

class UserBillingAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        """
        Retrieve user billing information (list or detail).
        Accessible to any authenticated user.
        """
        try:
            if pk:
                user_billing = UserBilling.objects.get(pk=pk)
                serializer = UserBillingSerializer(user_billing)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                user_billings = UserBilling.objects.all()
                serializer = UserBillingSerializer(user_billings, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except UserBilling.DoesNotExist:
            return Response({"error": "User billing information not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in UserBillingAPIView GET: {str(e)}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        """
        Retrieve payments (list or detail).
        Accessible to any authenticated user.
        """
        try:
            if pk:
                payment = Payment.objects.get(pk=pk)
                serializer = PaymentSerializer(payment)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                user_id = request.query_params.get('user_id')
                status_filter = request.query_params.get('status')
                queryset = Payment.objects.all()

                if user_id:
                    queryset = queryset.filter(user_id=user_id)
                if status_filter:
                    queryset = queryset.filter(status=status_filter)

                serializer = PaymentSerializer(queryset, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({"error": "No payments found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in PaymentAPIView GET: {str(e)}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)