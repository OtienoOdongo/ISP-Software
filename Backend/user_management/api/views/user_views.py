# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# from django.db.models import Q
# import logging
# from user_management.models.user_profile import UserProfile
# from user_management.serializers.user_profile import UserProfileSerializer
# from account.models.admin_model import ActivityLog

# logger = logging.getLogger(__name__)

# class UserProfileAPIView(APIView):
#     permission_classes = [permissions.IsAuthenticated]  # Only authenticated users

#     def get(self, request, pk=None):
#         """
#         Retrieve user profiles (list or detail).
#         Accessible to any authenticated user.
#         """
#         try:
#             if pk:
#                 profile = UserProfile.objects.get(pk=pk)
#                 serializer = UserProfileSerializer(profile)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             else:
#                 search_query = request.query_params.get('search', None)
#                 queryset = UserProfile.objects.all()
#                 if search_query:
#                     queryset = queryset.filter(Q(client__full_name__icontains=search_query))
#                 serializer = UserProfileSerializer(queryset, many=True)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#         except UserProfile.DoesNotExist:
#             return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error in UserProfileAPIView GET: {str(e)}")
#             return Response({"error": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def post(self, request, pk=None):
#         """
#         Toggle user profile status.
#         Accessible to any authenticated user (no admin restriction).
#         """
#         try:
#             if not pk or 'toggle-status' not in request.path:
#                 return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)

#             profile = UserProfile.objects.get(pk=pk)
#             profile.active = not profile.active
#             profile.save()
#             ActivityLog.objects.create(
#                 user=request.user,
#                 description=f"User {request.user.username} toggled status of client {profile.client.full_name} to {'active' if profile.active else 'suspended'}"
#             )
#             serializer = UserProfileSerializer(profile)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         except UserProfile.DoesNotExist:
#             return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error in UserProfileAPIView POST: {str(e)}")
#             return Response({"error": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
import logging
from user_management.models.user_profile import UserProfile
from user_management.serializers.user_profile import UserProfileSerializer
from account.models.admin_model import ActivityLog

logger = logging.getLogger(__name__)

class UserProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        """
        Retrieve user profiles (list or detail).
        - Without pk: Returns a list of profiles, optionally filtered by search query.
        - With pk: Returns a single profile.
        Accessible to any authenticated user.
        """
        try:
            if pk:
                if not pk or str(pk).lower() == "undefined":
                    logger.warning(f"Invalid user profile ID received: {pk}")
                    return Response(
                        {"error": "Invalid user profile ID."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                profile = UserProfile.objects.get(pk=pk)
                serializer = UserProfileSerializer(profile)
                logger.info(f"Successfully retrieved profile for pk={pk}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                search_query = request.query_params.get('search', '')
                logger.info(f"Received search query: '{search_query}'")
                queryset = UserProfile.objects.select_related('client').all()
                if search_query.strip():
                    queryset = queryset.filter(Q(client__full_name__icontains=search_query))
                    logger.info(f"Applied search filter: '{search_query}', found {queryset.count()} profiles")
                serializer = UserProfileSerializer(queryset, many=True)
                logger.info(f"Returning {len(serializer.data)} profiles")
                return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            logger.warning(f"User profile not found for pk={pk}")
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in UserProfileAPIView GET: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, pk=None):
        """
        Toggle user profile status via POST to /<pk>/toggle-status/.
        Accessible to any authenticated user.
        """
        try:
            if not pk or 'toggle-status' not in request.path:
                logger.warning("Invalid toggle-status request: missing pk or incorrect path")
                return Response(
                    {"error": "Invalid request. Use POST to /<pk>/toggle-status/."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile = UserProfile.objects.get(pk=pk)
            profile.active = not profile.active
            profile.save()

            # Handle case where client might be None
            client_name = profile.client.full_name if profile.client else "Unknown Client"
            ActivityLog.objects.create(
                user=request.user,
                description=f"User {request.user.username} toggled status of client {client_name} to {'active' if profile.active else 'suspended'}"
            )
            serializer = UserProfileSerializer(profile)
            logger.info(f"Toggled status for profile pk={pk} to {profile.active}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            logger.warning(f"User profile not found for pk={pk}")
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in UserProfileAPIView POST: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, pk=None):
        """
        Update a user profile's details.
        Requires pk and accessible to authenticated users.
        """
        try:
            if not pk:
                logger.warning("Missing pk for PUT request")
                return Response(
                    {"error": "User profile ID is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile = UserProfile.objects.get(pk=pk)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # Log the update action
                client_name = profile.client.full_name if profile.client else "Unknown Client"
                ActivityLog.objects.create(
                    user=request.user,
                    description=f"User {request.user.username} updated profile of client {client_name}"
                )
                logger.info(f"Updated profile for pk={pk}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            logger.warning(f"Invalid data for profile pk={pk}: {serializer.errors}")
            return Response(
                {"error": "Invalid data provided.", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except UserProfile.DoesNotExist:
            logger.warning(f"User profile not found for pk={pk}")
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in UserProfileAPIView PUT: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk=None):
        """
        Delete a user profile.
        Requires pk and accessible to authenticated users.
        """
        try:
            if not pk:
                logger.warning("Missing pk for DELETE request")
                return Response(
                    {"error": "User profile ID is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile = UserProfile.objects.get(pk=pk)
            client_name = profile.client.full_name if profile.client else "Unknown Client"
            profile.delete()
            ActivityLog.objects.create(
                user=request.user,
                description=f"User {request.user.username} deleted profile of client {client_name}"
            )
            logger.info(f"Deleted profile for pk={pk}")
            return Response(
                {"message": "User profile deleted successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except UserProfile.DoesNotExist:
            logger.warning(f"User profile not found for pk={pk}")
            return Response(
                {"error": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in UserProfileAPIView DELETE: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )