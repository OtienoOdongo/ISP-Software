# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# import logging
# from user_management.models.activity_log import UserActivity
# from user_management.serializers.activity_log import UserActivitySerializer

# logger = logging.getLogger(__name__)

# class UserActivityAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Only authenticated users

#     def get(self, request, pk=None):
#         """
#         Retrieve user activities.
#         Accessible to any authenticated user.
#         """
#         try:
#             user_id = request.query_params.get('user_id')
#             if not user_id:
#                 return Response(
#                     {"error": "User ID is required to fetch activities."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Filter activities by user_id
#             queryset = UserActivity.objects.filter(user_id=user_id)

#             # Optional filter by activity type
#             activity_type = request.query_params.get('type')
#             if activity_type:
#                 queryset = queryset.filter(type=activity_type)

#             serializer = UserActivitySerializer(queryset, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         except UserActivity.DoesNotExist:
#             return Response(
#                 {"message": "No activities found for this user."},
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             logger.error(f"Error in UserActivityAPIView GET: {str(e)}")
#             return Response(
#                 {"error": "An error occurred while fetching user activities."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import logging
from user_management.models.activity_log import UserActivity
from user_management.serializers.activity_log import UserActivitySerializer

logger = logging.getLogger(__name__)

class UserActivityAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        """
        Retrieve user activities.
        Accessible to any authenticated user.
        """
        try:
            user_id = request.query_params.get('user_id', None)
            if not user_id or user_id == "undefined":
                logger.warning("Missing or invalid user_id parameter")
                return Response({"error": "User ID is required to fetch activities."}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure user_id is an integer
            try:
                user_id = int(user_id)
            except ValueError:
                logger.warning(f"Invalid user_id format: {user_id}")
                return Response({"error": "User ID must be a valid integer."}, status=status.HTTP_400_BAD_REQUEST)

            # Filter activities by user_id
            queryset = UserActivity.objects.filter(user_id=user_id)
            logger.info(f"Fetching activities for user_id={user_id}")

            # Optional filter by activity type
            activity_type = request.query_params.get('type', None)
            if activity_type:
                queryset = queryset.filter(type=activity_type)
                logger.info(f"Applied type filter: {activity_type}")

            serializer = UserActivitySerializer(queryset, many=True)
            logger.info(f"Returning {queryset.count()} activities for user_id={user_id}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in UserActivityAPIView GET: {str(e)}", exc_info=True)
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)