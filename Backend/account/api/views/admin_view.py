# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, SubscriptionSerializer, 
#     PaymentSerializer, ActivityLogSerializer, NetworkHealthSerializer, 
#     RouterSerializer, ClientSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from payments.models.mpesa_config_model import Transaction
# from django.db.models import Sum, Q, Avg
# import logging
# import traceback
# from django.utils.timezone import now
# from rest_framework import status
# from django.contrib.auth import get_user_model
# from phonenumber_field.phonenumber import PhoneNumber

# # Configure logging to output to console
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# User = get_user_model()

# class AdminProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def dispatch(self, request, *args, **kwargs):
#         logger.debug(f"Dispatching request: Method={request.method}, User={request.user}, Authenticated={request.user.is_authenticated}")
#         return super().dispatch(request, *args, **kwargs)

#     def get(self, request):
#         user = request.user
#         logger.debug(f"GET request - User: {user}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

#         if not user.is_authenticated:
#             logger.warning(f"User not authenticated: {user}")
#             return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

#         profile_pic_url = self._get_profile_pic_url(request, user)
#         response_data = {
#             "profile": {
#                 "name": user.name or "Unknown",
#                 "email": user.email or "",
#                 "profile_pic": profile_pic_url
#             },
#             "stats": {
#                 "clients": 0,
#                 "active_clients": 0,
#                 "revenue": 0.0,
#                 "uptime": "0%",
#                 "total_subscriptions": 0,
#                 "successful_transactions": 0
#             },
#             "subscriptions": [],
#             "payments": [],
#             "activities": [{"description": "No activities yet", "timestamp": now().isoformat()}],
#             "network": {"latency": "0ms", "bandwidth": "0%"},
#             "routers": [{"name": "No routers", "status": "Offline", "color": "red", "latency": 0, "bandwidth_usage": 0}]
#         }

#         try:
#             # Stats
#             total_clients = Client.objects.count()
#             active_clients = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__gte=now()
#             ).values('client').distinct().count()
#             total_revenue = Payment.objects.filter(
#                 transaction__status='Success'
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             total_subscriptions = Subscription.objects.count()
#             successful_transactions = Transaction.objects.filter(status='Success').count()
#             uptime = self.calculate_uptime()
#             stats_data = {
#                 'clients': total_clients,
#                 'active_clients': active_clients,
#                 'revenue': float(total_revenue) if total_revenue else 0.0,
#                 'uptime': uptime,
#                 'total_subscriptions': total_subscriptions,
#                 'successful_transactions': successful_transactions
#             }
#             response_data["stats"] = StatsSerializer(stats_data).data

#             # Subscriptions
#             recent_subscriptions = Subscription.objects.select_related(
#                 'client', 'internet_plan'
#             ).order_by('-start_date')[:5]
#             response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

#             # Payments
#             recent_payments = Payment.objects.select_related(
#                 'client', 'transaction', 'subscription', 'subscription__internet_plan'
#             ).order_by('-timestamp')[:5]
#             response_data["payments"] = PaymentSerializer(recent_payments, many=True).data

#             # Activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=user) | Q(user__isnull=True)
#             ).order_by('-timestamp')[:4]
#             serialized_activities = ActivityLogSerializer(activities, many=True).data
#             response_data["activities"] = serialized_activities if serialized_activities else [
#                 {"description": "No activities yet", "timestamp": now().isoformat()}
#             ]

#             # Network and Routers
#             routers = Router.objects.all()
#             avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
#             avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
#             network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
#             response_data["network"] = NetworkHealthSerializer(network_data).data

#             router_data = RouterSerializer(routers, many=True).data
#             response_data["routers"] = router_data if router_data else [
#                 {"name": "No routers", "status": "Offline", "color": "red", "latency": 0, "bandwidth_usage": 0}
#             ]

#             logger.debug(f"Response data prepared: {response_data}")
#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_msg = "Failed to load profile data. Please try again later."
#             logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def put(self, request):
#         user = request.user
#         logger.debug(f"PUT request - User: {user}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

#         if not user.is_authenticated:
#             logger.warning(f"User not authenticated: {user}")
#             return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

#         try:
#             serializer = AdminProfileSerializer(user, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"User {user.name} updated their profile",
#                     user=user
#                 )
#                 response_data = serializer.data
#                 response_data['profile_pic'] = self._get_profile_pic_url(request, user)
#                 logger.debug(f"Profile updated successfully: {response_data}")
#                 return Response(response_data, status=status.HTTP_200_OK)

#             logger.error(f"Profile update failed: {serializer.errors}")
#             return Response(
#                 {"error": "Profile update failed. Please check your input.", "details": serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         except Exception as e:
#             error_msg = "Failed to update profile. Please try again later."
#             logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def _get_profile_pic_url(self, request, user):
#         try:
#             return request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else ""
#         except Exception as e:
#             logger.warning(f"Failed to build profile_pic URL for {user}: {str(e)}")
#             return ""

#     def calculate_uptime(self):
#         total_routers = Router.objects.count()
#         online_routers = Router.objects.filter(status="Online").count()
#         if total_routers > 0:
#             uptime = (online_routers / total_routers) * 100
#             return f"{uptime:.1f}%"
#         return "0%"

# class ClientListView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         phonenumber = request.query_params.get("phonenumber", None)
#         logger.debug(f"GET request to ClientListView: phonenumber={phonenumber}, User={request.user}")

#         if phonenumber:
#             try:
#                 phonenumber = phonenumber.strip()
#                 if not phonenumber.startswith('+'):
#                     phonenumber = f"+{phonenumber}"
#                 phone_obj = PhoneNumber.from_string(phonenumber)
#                 logger.debug(f"Normalized phonenumber for query: '{phone_obj.as_e164}'")
#                 clients = Client.objects.filter(phonenumber=phone_obj)
#                 logger.debug(f"Found {clients.count()} clients for phonenumber={phone_obj.as_e164}, Clients: {list(clients.values())}")
#                 serializer = ClientSerializer(clients, many=True)
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             except Exception as e:
#                 logger.error(f"Error in ClientListView GET with phonenumber: {str(e)}\n{traceback.format_exc()}")
#                 return Response({"error": "Failed to retrieve client."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#         if not request.user.is_authenticated:
#             logger.warning(f"Unauthorized full list GET request to ClientListView by {request.user}")
#             return Response({"detail": "Authentication required to list all clients."}, status=status.HTTP_401_UNAUTHORIZED)
        
#         try:
#             clients = Client.objects.all()
#             serializer = ClientSerializer(clients, many=True)
#             logger.debug(f"Retrieved {clients.count()} clients")
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in ClientListView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": "Failed to retrieve clients."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def post(self, request):
#         logger.debug(f"POST request to ClientListView: Data={request.data}")
#         try:
#             serializer = ClientSerializer(data=request.data)
#             if serializer.is_valid():
#                 phonenumber = serializer.validated_data['phonenumber']
#                 existing_client = Client.objects.filter(phonenumber=phonenumber).first()
#                 if existing_client:
#                     logger.debug(f"Client with phonenumber {phonenumber} already exists, returning existing data")
#                     return Response(ClientSerializer(existing_client).data, status=status.HTTP_200_OK)
                
#                 client = serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"New client signed up: {client.full_name} ({client.phonenumber})",
#                     user=None
#                 )
#                 logger.debug(f"Client created successfully: {serializer.data}")
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
            
#             logger.error(f"Client creation failed: {serializer.errors}")
#             return Response(
#                 {"error": "Failed to create client.", "details": serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Error in ClientListView POST: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": "Failed to process signup request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class ClientDetailView(APIView):
#     permission_classes = [AllowAny]

#     def get_object(self, pk):
#         try:
#             return Client.objects.get(pk=pk)
#         except Client.DoesNotExist:
#             logger.error(f"Client with pk={pk} not found")
#             return None

#     def get(self, request, pk):
#         logger.debug(f"GET request to ClientDetailView: pk={pk}, User={request.user}")
#         client = self.get_object(pk)
#         if not client:
#             return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)
        
#         serializer = ClientSerializer(client)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def patch(self, request, pk):
#         logger.debug(f"PATCH request to ClientDetailView: pk={pk}, Data={request.data}")
#         client = self.get_object(pk)
#         if not client:
#             return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

#         try:
#             serializer = ClientSerializer(client, data=request.data, partial=True)
#             if serializer.is_valid():
#                 new_phonenumber = serializer.validated_data.get('phonenumber', client.phonenumber)
#                 if new_phonenumber != client.phonenumber and Client.objects.filter(phonenumber=new_phonenumber).exists():
#                     logger.debug(f"Phone number {new_phonenumber} already in use by another client")
#                     return Response({"error": "Phone number already in use."}, status=status.HTTP_400_BAD_REQUEST)
                
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"Client updated: {client.full_name} ({client.phonenumber})",
#                     user=request.user if request.user.is_authenticated else None
#                 )
#                 logger.debug(f"Client updated successfully: {serializer.data}")
#                 return Response(serializer.data, status=status.HTTP_200_OK)
            
#             logger.error(f"Client update failed: {serializer.errors}")
#             return Response(
#                 {"error": "Failed to update client.", "details": serializer.errors},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.error(f"Error in ClientDetailView PATCH: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": "Failed to process update request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def delete(self, request, pk):
#         logger.debug(f"DELETE request to ClientDetailView: pk={pk}, User={request.user}")
#         if not request.user.is_authenticated:
#             logger.warning(f"Unauthorized DELETE request to ClientDetailView by {request.user}")
#             return Response({"detail": "Authentication required for this action."}, status=status.HTTP_401_UNAUTHORIZED)

#         client = self.get_object(pk)
#         if not client:
#             return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

#         client.delete()
#         ActivityLog.objects.create(
#             description=f"Client deleted: {client.full_name} ({client.phonenumber})",
#             user=request.user
#         )
#         logger.debug(f"Client pk={pk} deleted successfully")
#         return Response(status=status.HTTP_204_NO_CONTENT)








from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from account.serializers.admin_serializer import (
    AdminProfileSerializer, StatsSerializer, SubscriptionSerializer, 
    ActivityLogSerializer, NetworkHealthSerializer, ClientSerializer
)
from network_management.serializers.router_management_serializer import RouterSerializer
from account.models.admin_model import Client, Subscription, ActivityLog
from network_management.models.router_management_model import Router
from payments.models.mpesa_config_model import Transaction
from django.db.models import Sum, Q, Avg
import logging
import traceback
from django.utils.timezone import now
from rest_framework import status
from django.contrib.auth import get_user_model
from phonenumber_field.phonenumber import PhoneNumber

# Configure logging to output to console
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

User = get_user_model()

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Dispatching request: Method={request.method}, User={request.user}, Authenticated={request.user.is_authenticated}")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        user = request.user
        logger.debug(f"GET request - User: {user}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

        if not user.is_authenticated:
            logger.warning(f"User not authenticated: {user}")
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        profile_pic_url = self._get_profile_pic_url(request, user)
        response_data = {
            "profile": {
                "name": user.name or "Unknown",
                "email": user.email or "",
                "profile_pic": profile_pic_url
            },
            "stats": {
                "clients": 0,
                "active_clients": 0,
                "revenue": 0.0,
                "uptime": "0%",
                "total_subscriptions": 0,
                "successful_transactions": 0
            },
            "subscriptions": [],
            "payments": [],
            "activities": [{"description": "No activities yet", "timestamp": now().isoformat()}],
            "network": {"latency": "0ms", "bandwidth": "0%"},
            "routers": [{"name": "No routers", "status": "Offline", "color": "red", "latency": 0, "bandwidth_usage": 0}]
        }

        try:
            # Stats
            total_clients = Client.objects.count()
            active_clients = Subscription.objects.filter(
                is_active=True,
                end_date__gte=now()
            ).values('client').distinct().count()
            total_revenue = Transaction.objects.filter(
                status='Success'
            ).aggregate(total=Sum('amount'))['total'] or 0
            total_subscriptions = Subscription.objects.count()
            successful_transactions = Transaction.objects.filter(status='Success').count()
            uptime = self.calculate_uptime()
            stats_data = {
                'clients': total_clients,
                'active_clients': active_clients,
                'revenue': float(total_revenue) if total_revenue else 0.0,
                'uptime': uptime,
                'total_subscriptions': total_subscriptions,
                'successful_transactions': successful_transactions
            }
            response_data["stats"] = StatsSerializer(stats_data).data

            # Subscriptions
            recent_subscriptions = Subscription.objects.select_related(
                'client', 'internet_plan'
            ).order_by('-start_date')[:5]
            response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

            # Payments
            response_data["payments"] = []

            # Activities
            activities = ActivityLog.objects.filter(
                Q(user=user) | Q(user__isnull=True)
            ).order_by('-timestamp')[:4]
            serialized_activities = ActivityLogSerializer(activities, many=True).data
            response_data["activities"] = serialized_activities if serialized_activities else [
                {"description": "No activities yet", "timestamp": now().isoformat()}
            ]

            # Network and Routers
            routers = Router.objects.all()
            avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
            avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
            network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
            response_data["network"] = NetworkHealthSerializer(network_data).data

            router_data = RouterSerializer(routers, many=True).data
            response_data["routers"] = router_data if router_data else [
                {"name": "No routers", "status": "Offline", "color": "red", "latency": 0, "bandwidth_usage": 0}
            ]

            logger.debug(f"Response data prepared: {response_data}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            error_msg = "Failed to load profile data. Please try again later."
            logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        user = request.user
        logger.debug(f"PUT request - User: {user}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

        if not user.is_authenticated:
            logger.warning(f"User not authenticated: {user}")
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            serializer = AdminProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                ActivityLog.objects.create(
                    description=f"User {user.name} updated their profile",
                    user=user
                )
                response_data = serializer.data
                response_data['profile_pic'] = self._get_profile_pic_url(request, user)
                logger.debug(f"Profile updated successfully: {response_data}")
                return Response(response_data, status=status.HTTP_200_OK)

            logger.error(f"Profile update failed: {serializer.errors}")
            return Response(
                {"error": "Profile update failed. Please check your input.", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            error_msg = "Failed to update profile. Please try again later."
            logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_profile_pic_url(self, request, user):
        try:
            return request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else ""
        except Exception as e:
            logger.warning(f"Failed to build profile_pic URL for {user}: {str(e)}")
            return ""

    def calculate_uptime(self):
        total_routers = Router.objects.count()
        online_routers = Router.objects.filter(status="Online").count()
        if total_routers > 0:
            uptime = (online_routers / total_routers) * 100
            return f"{uptime:.1f}%"
        return "0%"

class ClientListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        phonenumber = request.query_params.get("phonenumber", None)
        logger.debug(f"GET request to ClientListView: phonenumber={phonenumber}, User={request.user}")

        if phonenumber:
            try:
                phonenumber = phonenumber.strip()
                if not phonenumber.startswith('+'):
                    phonenumber = f"+{phonenumber}"
                phone_obj = PhoneNumber.from_string(phonenumber)
                logger.debug(f"Normalized phonenumber for query: '{phone_obj.as_e164}'")
                clients = Client.objects.filter(phonenumber=phone_obj)
                logger.debug(f"Found {clients.count()} clients for phonenumber={phone_obj.as_e164}, Clients: {list(clients.values())}")
                serializer = ClientSerializer(clients, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error in ClientListView GET with phonenumber: {str(e)}\n{traceback.format_exc()}")
                return Response({"error": "Failed to retrieve client."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if not request.user.is_authenticated:
            logger.warning(f"Unauthorized full list GET request to ClientListView by {request.user}")
            return Response({"detail": "Authentication required to list all clients."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            clients = Client.objects.all()
            serializer = ClientSerializer(clients, many=True)
            logger.debug(f"Retrieved {clients.count()} clients")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in ClientListView GET: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": "Failed to retrieve clients."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        logger.debug(f"POST request to ClientListView: Data={request.data}")
        try:
            serializer = ClientSerializer(data=request.data)
            if serializer.is_valid():
                phonenumber = serializer.validated_data['phonenumber']
                existing_client = Client.objects.filter(phonenumber=phonenumber).first()
                if existing_client:
                    logger.debug(f"Client with phonenumber {phonenumber} already exists, returning existing data")
                    return Response(ClientSerializer(existing_client).data, status=status.HTTP_200_OK)
                
                client = serializer.save()
                ActivityLog.objects.create(
                    description=f"New client signed up: {client.full_name} ({client.phonenumber})",
                    user=None
                )
                logger.debug(f"Client created successfully: {serializer.data}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            logger.error(f"Client creation failed: {serializer.errors}")
            return Response(
                {"error": "Failed to create client.", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in ClientListView POST: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": "Failed to process signup request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClientDetailView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Client.objects.get(pk=pk)
        except Client.DoesNotExist:
            logger.error(f"Client with pk={pk} not found")
            return None

    def get(self, request, pk):
        logger.debug(f"GET request to ClientDetailView: pk={pk}, User={request.user}")
        client = self.get_object(pk)
        if not client:
            return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClientSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        logger.debug(f"PATCH request to ClientDetailView: pk={pk}, Data={request.data}")
        client = self.get_object(pk)
        if not client:
            return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            serializer = ClientSerializer(client, data=request.data, partial=True)
            if serializer.is_valid():
                new_phonenumber = serializer.validated_data.get('phonenumber', client.phonenumber)
                if new_phonenumber != client.phonenumber and Client.objects.filter(phonenumber=new_phonenumber).exists():
                    logger.debug(f"Phone number {new_phonenumber} already in use by another client")
                    return Response({"error": "Phone number already in use."}, status=status.HTTP_400_BAD_REQUEST)
                
                serializer.save()
                ActivityLog.objects.create(
                    description=f"Client updated: {client.full_name} ({client.phonenumber})",
                    user=request.user if request.user.is_authenticated else None
                )
                logger.debug(f"Client updated successfully: {serializer.data}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            logger.error(f"Client update failed: {serializer.errors}")
            return Response(
                {"error": "Failed to update client.", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in ClientDetailView PATCH: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": "Failed to process update request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        logger.debug(f"DELETE request to ClientDetailView: pk={pk}, User={request.user}")
        if not request.user.is_authenticated:
            logger.warning(f"Unauthorized DELETE request to ClientDetailView by {request.user}")
            return Response({"detail": "Authentication required for this action."}, status=status.HTTP_401_UNAUTHORIZED)

        client = self.get_object(pk)
        if not client:
            return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

        client.delete()
        ActivityLog.objects.create(
            description=f"Client deleted: {client.full_name} ({client.phonenumber})",
            user=request.user
        )
        logger.debug(f"Client pk={pk} deleted successfully")
        return Response(status=status.HTTP_204_NO_CONTENT)