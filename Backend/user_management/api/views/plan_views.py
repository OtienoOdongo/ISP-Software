# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# from django.utils import timezone
# import logging
# import uuid
# from user_management.models.plan_assignment import Plan, UserPlan
# from user_management.models.user_profile import UserProfile
# from user_management.serializers.plan_assignment import PlanSerializer, UserPlanSerializer

# logger = logging.getLogger(__name__)

# class PlanAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Only authenticated users

#     def get(self, request):
#         """
#         Retrieve all plans.
#         Accessible to any authenticated user.
#         """
#         try:
#             plans = Plan.objects.all()
#             serializer = PlanSerializer(plans, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in PlanAPIView GET: {str(e)}")
#             return Response(
#                 {"error": "An error occurred while fetching plans."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class UserPlanAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Only authenticated users

#     def get(self, request):
#         """
#         Retrieve all user plans.
#         Accessible to any authenticated user.
#         """
#         try:
#             user_plans = UserPlan.objects.all()
#             serializer = UserPlanSerializer(user_plans, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in UserPlanAPIView GET: {str(e)}")
#             return Response(
#                 {"error": "An error occurred while fetching user plans."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """
#         Assign or update a user plan.
#         Accessible to any authenticated user.
#         """
#         try:
#             user_id = request.data.get('user_id')
#             plan_id = request.data.get('plan_id')
#             device_mac_address = request.data.get('device_mac_address')

#             if not all([user_id, plan_id]):
#                 return Response(
#                     {"error": "User ID and Plan ID are required."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             user = UserProfile.objects.get(pk=user_id)
#             plan = Plan.objects.get(pk=plan_id)

#             if not device_mac_address:
#                 device_mac_address = str(uuid.uuid4())[:17]  # Fit max_length=17

#             user_plan, created = UserPlan.objects.update_or_create(
#                 user=user,
#                 device_mac_address=device_mac_address,
#                 defaults={
#                     'plan': plan,
#                     'assigned_date': timezone.now(),
#                     'payment_status': 'Pending',
#                     'transaction_id': f"TXN-{int(timezone.now().timestamp())}"
#                 }
#             )

#             # Update UserProfile subscription_plan
#             user.subscription_plan = plan.name
#             user.save()

#             serializer = UserPlanSerializer(user_plan)
#             return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
#         except UserProfile.DoesNotExist:
#             return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Plan.DoesNotExist:
#             return Response({"error": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error in UserPlanAPIView POST: {str(e)}")
#             return Response(
#                 {"error": "An error occurred while assigning the plan."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
import logging
import uuid
from user_management.models.plan_assignment import Plan, UserPlan
from user_management.models.user_profile import UserProfile
from user_management.serializers.plan_assignment import PlanSerializer, UserPlanSerializer

logger = logging.getLogger(__name__)

class PlanAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Retrieve all plans.
        Accessible to any authenticated user.
        """
        try:
            plans = Plan.objects.all()
            serializer = PlanSerializer(plans, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in PlanAPIView GET: {str(e)}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserPlanAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Retrieve all user plans.
        Accessible to any authenticated user.
        """
        try:
            user_plans = UserPlan.objects.all()
            serializer = UserPlanSerializer(user_plans, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in UserPlanAPIView GET: {str(e)}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """
        Assign or update a user plan.
        Accessible to any authenticated user.
        """
        try:
            user_id = request.data.get('user_id')
            plan_id = request.data.get('plan_id')
            device_mac_address = request.data.get('device_mac_address')

            if not all([user_id, plan_id]):
                return Response({"error": "User ID and Plan ID are required."}, status=status.HTTP_400_BAD_REQUEST)

            user = UserProfile.objects.get(pk=user_id)
            plan = Plan.objects.get(pk=plan_id)

            if not device_mac_address:
                device_mac_address = str(uuid.uuid4())[:17]  # Fit max_length=17

            user_plan, created = UserPlan.objects.update_or_create(
                user=user,
                device_mac_address=device_mac_address,
                defaults={
                    'plan': plan,
                    'assigned_date': timezone.now(),
                    'payment_status': 'Pending',
                    'transaction_id': f"TXN-{int(timezone.now().timestamp())}"
                }
            )

            # Update UserProfile subscription_plan
            user.subscription_plan = plan.name
            user.save()

            serializer = UserPlanSerializer(user_plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except Plan.DoesNotExist:
            return Response({"error": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in UserPlanAPIView POST: {str(e)}")
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)