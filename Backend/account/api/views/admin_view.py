






# # account/api/view/admin_view.py


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, ActivityLogSerializer, ClientSerializer
# )
# from account.models.admin_model import Client, ActivityLog
# from django.db.models import Count, Q
# import logging
# import traceback
# from django.utils.timezone import now
# from rest_framework import status
# from django.contrib.auth import get_user_model
# from phonenumber_field.phonenumber import PhoneNumber

# # Configure logging
# logger = logging.getLogger(__name__)

# User = get_user_model()

# class AdminProfileView(APIView):
#     """View for admin user profile management"""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """Get admin profile with stats and activities"""
#         user = request.user
        
#         try:
#             # Basic profile info
#             profile_data = {
#                 "name": user.name,
#                 "email": user.email,
#                 "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else ""
#             }
            
#             # Statistics
#             stats = {
#                 "clients": Client.objects.count(),
#                 "active_clients": Client.objects.filter(user__is_active=True).count()
#             }
            
#             # Recent activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=user) | Q(related_user=user)
#             ).order_by('-timestamp')[:5]
            
#             return Response({
#                 "profile": profile_data,
#                 "stats": StatsSerializer(stats).data,
#                 "activities": ActivityLogSerializer(activities, many=True).data
#             })
            
#         except Exception as e:
#             logger.error(f"Error in AdminProfileView: {str(e)}")
#             return Response(
#                 {"error": "Failed to load profile data"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def put(self, request):
#         """Update admin profile"""
#         try:
#             serializer = AdminProfileSerializer(
#                 request.user, 
#                 data=request.data, 
#                 partial=True
#             )
            
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     user=request.user,
#                     action_type='modify',
#                     description="Updated profile information"
#                 )
#                 return Response(serializer.data)
                
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         except Exception as e:
#             logger.error(f"Error updating profile: {str(e)}")
#             return Response(
#                 {"error": "Profile update failed"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ClientListView(APIView):
#     """View for listing and creating clients"""
#     permission_classes = [AllowAny]

#     def get_permissions(self):
#         """
#         Dynamically set permissions based on method and query params.
#         - POST: AllowAny (for client self-creation from landing page)
#         - GET with phonenumber query param: AllowAny (for checking existence by phone)
#         - GET without phonenumber: IsAuthenticated (admin listing all clients)
#         """
#         if self.request.method == 'POST' or (self.request.method == 'GET' and self.request.query_params.get('phonenumber')):
#             return [AllowAny()]
#         return [IsAuthenticated()]

#     def get(self, request):
#         """List all clients or filter by phone number"""
#         phone_number = request.query_params.get('phonenumber')
        
#         try:
#             if phone_number:
#                 clients = Client.objects.filter(
#                     user__phone_number=phone_number
#                 )
#             else:
#                 clients = Client.objects.all()
                
#             serializer = ClientSerializer(clients, many=True)
#             return Response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Error listing clients: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve clients"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         """Create a new client"""
#         try:
#             serializer = ClientSerializer(data=request.data)
            
#             if serializer.is_valid():
#                 # Check for existing client
#                 phone_number = serializer.validated_data['user']['phone_number']
#                 if User.objects.filter(phone_number=phone_number).exists():
#                     user = User.objects.get(phone_number=phone_number)
#                     if hasattr(user, 'client_profile'):
#                         return Response(
#                             ClientSerializer(user.client_profile).data,
#                             status=status.HTTP_200_OK
#                         )
#                     # Convert existing user to client
#                     user.user_type = 'client'
#                     user.save()
#                     client = Client.objects.create(user=user)
#                     # Log the conversion (handle anonymous)
#                     log_user = request.user if request.user.is_authenticated else None
#                     ActivityLog.objects.create(
#                         user=log_user,
#                         action_type='create',
#                         description=f"Converted existing user to client: {client.user.name}",
#                         related_user=client.user
#                     )
#                     return Response(
#                         ClientSerializer(client).data,
#                         status=status.HTTP_200_OK
#                     )
                
#                 # Create new client
#                 client = serializer.save()
#                 # Log the creation (handle anonymous)
#                 log_user = request.user if request.user.is_authenticated else None
#                 ActivityLog.objects.create(
#                     user=log_user,
#                     action_type='create',
#                     description=f"Created new client: {client.user.name}",
#                     related_user=client.user
#                 )
#                 return Response(
#                     serializer.data,
#                     status=status.HTTP_201_CREATED
#                 )
                
#             return Response(
#                 serializer.errors,
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         except Exception as e:
#             logger.error(f"Error creating client: {str(e)}")
#             return Response(
#                 {"error": "Client creation failed"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ClientDetailView(APIView):
#     """View for client detail operations"""
#     permission_classes = [IsAuthenticated]  # Restrict to authenticated users (admins/superusers) for detail ops

#     def get_client(self, pk):
#         """Helper method to get client or return 404"""
#         try:
#             return Client.objects.get(pk=pk)
#         except Client.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         """Get client details"""
#         client = self.get_client(pk)
#         if not client:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         serializer = ClientSerializer(client)
#         return Response(serializer.data)

#     def patch(self, request, pk):
#         """Update client details"""
#         client = self.get_client(pk)
#         if not client:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         try:
#             serializer = ClientSerializer(
#                 client,
#                 data=request.data,
#                 partial=True
#             )
            
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     user=request.user,
#                     action_type='modify',
#                     description=f"Updated client: {client.user.name}",
#                     related_user=client.user
#                 )
#                 return Response(serializer.data)
                
#             return Response(
#                 serializer.errors,
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         except Exception as e:
#             logger.error(f"Error updating client: {str(e)}")
#             return Response(
#                 {"error": "Client update failed"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def delete(self, request, pk):
#         """Delete a client"""
#         client = self.get_client(pk)
#         if not client:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         try:
#             client.delete_personal_data()
#             ActivityLog.objects.create(
#                 user=request.user,
#                 action_type='delete',
#                 description=f"Deleted client: {client.user.name}"
#             )
#             return Response(status=status.HTTP_204_NO_CONTENT)
            
#         except Exception as e:
#             logger.error(f"Error deleting client: {str(e)}")
#             return Response(
#                 {"error": "Client deletion failed"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )






from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from account.serializers.admin_serializer import (
    AdminProfileSerializer, StatsSerializer, ActivityLogSerializer, ClientSerializer
)
from account.models.admin_model import Client, ActivityLog
from django.db.models import Count, Q
import logging
import traceback
from django.utils.timezone import now
from rest_framework import status
from django.contrib.auth import get_user_model
from phonenumber_field.phonenumber import PhoneNumber

# Configure logging
logger = logging.getLogger(__name__)

User = get_user_model()

class AdminProfileView(APIView):
    """View for admin user profile management"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get admin profile with stats and activities"""
        user = request.user
        
        try:
            # Basic profile info
            profile_data = {
                "name": user.name,
                "email": user.email,
                "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else ""
            }
            
            # Statistics
            stats = {
                "clients": Client.objects.count(),
                "active_clients": Client.objects.filter(user__is_active=True).count()
            }
            
            # Recent activities
            activities = ActivityLog.objects.filter(
                Q(user=user) | Q(related_user=user)
            ).order_by('-timestamp')[:5]
            
            return Response({
                "profile": profile_data,
                "stats": StatsSerializer(stats).data,
                "activities": ActivityLogSerializer(activities, many=True).data
            })
            
        except Exception as e:
            logger.error(f"Error in AdminProfileView: {str(e)}")
            return Response(
                {"error": "Failed to load profile data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request):
        """Update admin profile"""
        try:
            serializer = AdminProfileSerializer(
                request.user, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                ActivityLog.objects.create(
                    user=request.user,
                    action_type='modify',
                    description="Updated profile information"
                )
                return Response(serializer.data)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}")
            return Response(
                {"error": "Profile update failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientListView(APIView):
    """View for listing and creating clients"""
    permission_classes = [AllowAny]

    def get_permissions(self):
        """
        Dynamically set permissions based on method and query params.
        - POST: AllowAny (for client self-creation from landing page)
        - GET with phonenumber query param: AllowAny (for checking existence by phone)
        - GET without phonenumber: IsAuthenticated (admin listing all clients)
        """
        if self.request.method == 'POST' or (self.request.method == 'GET' and self.request.query_params.get('phonenumber')):
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        """List all clients or filter by phone number"""
        phone_number = request.query_params.get('phonenumber')
        
        try:
            if phone_number:
                clients = Client.objects.filter(
                    user__phone_number=phone_number
                )
            else:
                clients = Client.objects.all()
                
            serializer = ClientSerializer(clients, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error listing clients: {str(e)}")
            return Response(
                {"error": "Failed to retrieve clients"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Create a new client"""
        try:
            serializer = ClientSerializer(data=request.data)
            
            if serializer.is_valid():
                # Check for existing client with this phone number
                phone_number = serializer.validated_data['user']['phone_number']
                
                if User.objects.filter(phone_number=phone_number).exists():
                    user = User.objects.get(phone_number=phone_number)
                    
                    if hasattr(user, 'client_profile'):
                        # Client already exists, return existing data
                        return Response(
                            ClientSerializer(user.client_profile).data,
                            status=status.HTTP_200_OK
                        )
                    else:
                        # User exists but not as client, convert to client
                        user.user_type = 'client'
                        user.save()
                        client = Client.objects.create(user=user)
                        
                        # Log the conversion (handle anonymous)
                        log_user = request.user if request.user.is_authenticated else None
                        ActivityLog.objects.create(
                            user=log_user,
                            action_type='create',
                            description=f"Converted existing user to client: {client.user.username}",
                            related_user=client.user
                        )
                        return Response(
                            ClientSerializer(client).data,
                            status=status.HTTP_200_OK
                        )
                
                # Create new client
                client = serializer.save()
                
                # Log the creation (handle anonymous)
                log_user = request.user if request.user.is_authenticated else None
                ActivityLog.objects.create(
                    user=log_user,
                    action_type='create',
                    description=f"Created new client: {client.user.username}",
                    related_user=client.user
                )
                
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )
                
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Error creating client: {str(e)}")
            return Response(
                {"error": "Client creation failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientDetailView(APIView):
    """View for client detail operations"""
    permission_classes = [IsAuthenticated]  # Restrict to authenticated users (admins/superusers) for detail ops

    def get_client(self, pk):
        """Helper method to get client or return 404"""
        try:
            return Client.objects.get(pk=pk)
        except Client.DoesNotExist:
            return None

    def get(self, request, pk):
        """Get client details"""
        client = self.get_client(pk)
        if not client:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = ClientSerializer(client)
        return Response(serializer.data)

    def patch(self, request, pk):
        """Update client details"""
        client = self.get_client(pk)
        if not client:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            serializer = ClientSerializer(
                client,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                ActivityLog.objects.create(
                    user=request.user,
                    action_type='modify',
                    description=f"Updated client: {client.user.username}",
                    related_user=client.user
                )
                return Response(serializer.data)
                
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Error updating client: {str(e)}")
            return Response(
                {"error": "Client update failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        """Delete a client"""
        client = self.get_client(pk)
        if not client:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            username = client.user.username
            client.delete_personal_data()
            ActivityLog.objects.create(
                user=request.user,
                action_type='delete',
                description=f"Deleted client: {username}"
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(f"Error deleting client: {str(e)}")
            return Response(
                {"error": "Client deletion failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )