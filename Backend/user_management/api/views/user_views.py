





# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# from rest_framework.pagination import PageNumberPagination
# from django.utils import timezone
# from django.core.exceptions import ObjectDoesNotExist
# from django.db.models import Q
# from rest_framework.exceptions import ValidationError
# from account.models.admin_model import Client
# from user_management.models.user_model import CommunicationLog
# from user_management.serializers.user_serializer import ClientProfileSerializer, CommunicationLogSerializer
# from network_management.models.router_management_model import HotspotUser, Router
# from network_management.serializers.router_management_serializer import HotspotUserSerializer
# from routeros_api import RouterOsApiPool
# import requests

# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 50
#     page_size_query_param = 'page_size'
#     max_page_size = 100

# class ClientProfileListView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         """
#         Retrieve a paginated list of client profiles.
#         Supports filtering by active status, router, and search by username/phone.
#         """
#         clients = Client.objects.all().select_related('user').prefetch_related(
#             'subscriptions', 'transactions', 'communication_logs', 'hotspotuser_set'
#         )
        
#         # Apply filters
#         active_filter = request.query_params.get('active', None)
#         if active_filter == 'true':
#             clients = clients.filter(subscription__is_active=True)
#         elif active_filter == 'false':
#             clients = clients.filter(subscription__is_active=False)

#         router_id = request.query_params.get('router_id', None)
#         if router_id:
#             clients = clients.filter(hotspotuser__router_id=router_id, hotspotuser__active=True)

#         search_query = request.query_params.get('search', None)
#         if search_query:
#             clients = clients.filter(
#                 Q(user__username__icontains=search_query) |
#                 Q(user__phone_number__icontains=search_query)
#             )

#         paginator = StandardResultsSetPagination()
#         paginated_clients = paginator.paginate_queryset(clients.distinct(), request)
#         serializer = ClientProfileSerializer(paginated_clients, many=True)
#         return paginator.get_paginated_response(serializer.data)

# class ClientProfileDetailView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request, pk):
#         """
#         Retrieve a single client profile by ID.
#         """
#         try:
#             client = Client.objects.select_related('user').prefetch_related(
#                 'subscription_set', 'transaction_set', 'communication_logs', 'hotspotuser_set'
#             ).get(pk=pk)
#             serializer = ClientProfileSerializer(client)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#     def patch(self, request, pk):
#         """
#         Update a client's profile (username and phone number).
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             user = client.user
#             data = request.data

#             # Update user fields
#             if 'username' in data:
#                 user.username = data['username']
#             if 'phonenumber' in data:
#                 user.phone_number = data['phonenumber']
            
#             user.save()

#             # Return updated client profile
#             serializer = ClientProfileSerializer(client)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except ValidationError as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

# class SendMessageView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, pk):
#         """
#         Send a message (SMS, email, or system notification) to a client.
#         Optionally associate with a router.
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             data = request.data
#             router_id = data.get('router_id')
#             router = Router.objects.get(pk=router_id) if router_id else None
            
#             serializer = CommunicationLogSerializer(data={
#                 'client': client.id,
#                 'router': router.id if router else None,
#                 'message_type': data.get('message_type', 'sms'),
#                 'trigger_type': data.get('trigger_type', 'manual'),
#                 'subject': data.get('subject', ''),
#                 'message': data.get('message'),
#                 'status': 'delivered',  # Simulate successful delivery
#                 'sent_at': timezone.now()
#             })
            
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client or router not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

# class DisconnectHotspotUserView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, pk):
#         """
#         Disconnect a client from their active hotspot connection.
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             hotspot_user = HotspotUser.objects.filter(client=client, active=True).first()
#             if not hotspot_user:
#                 return Response(
#                     {"error": "No active hotspot connection found for this client"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#             router = hotspot_user.router
#             try:
#                 if router.type == "mikrotik":
#                     api_pool = RouterOsApiPool(
#                         router.ip, username=router.username, password=router.password, port=router.port
#                     )
#                     api = api_pool.get_api()
#                     api.get_resource("/ip/hotspot/active").remove(id=hotspot_user.mac)
#                     api_pool.disconnect()
#                 elif router.type == "ubiquiti":
#                     controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
#                     data = {"cmd": "unauthorize-guest", "mac": hotspot_user.mac.lower()}
#                     requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
#                 elif router.type == "cisco":
#                     # Placeholder for Cisco logic
#                     pass
#                 else:
#                     # Custom logic for 'other' router types
#                     pass
                
#                 hotspot_user.active = False
#                 hotspot_user.save()
                
#                 # Log disconnection in CommunicationLog
#                 CommunicationLog.objects.create(
#                     client=client,
#                     router=router,
#                     message_type='system',
#                     trigger_type='hotspot_limit_reached',
#                     message=f"Client disconnected from {router.name} hotspot",
#                     status='delivered',
#                     sent_at=timezone.now()
#                 )
                
#                 serializer = HotspotUserSerializer(hotspot_user)
#                 return Response(
#                     {"message": "Client disconnected from hotspot", "hotspot_user": serializer.data},
#                     status=status.HTTP_200_OK
#                 )
#             except Exception as e:
#                 return Response(
#                     {"error": f"Failed to disconnect from router: {str(e)}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
        




from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from account.models.admin_model import Client
from user_management.models.user_model import CommunicationLog
from user_management.serializers.user_serializer import ClientProfileSerializer, CommunicationLogSerializer
from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
from network_management.serializers.router_management_serializer import HotspotUserSerializer, PPPoEUserSerializer
from routeros_api import RouterOsApiPool
import requests

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class ClientProfileListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Retrieve a paginated list of client profiles.
        Supports filtering by active status, router, connection type, and search by username/phone.
        """
        clients = Client.objects.all().select_related('user').prefetch_related(
            'subscriptions', 'transactions', 'communication_logs', 'hotspotuser_set', 'pppoeuser_set'
        )
        
        # Apply filters
        active_filter = request.query_params.get('active', None)
        if active_filter == 'true':
            clients = clients.filter(
                Q(hotspotuser__active=True) | Q(pppoeuser__active=True)
            ).distinct()
        elif active_filter == 'false':
            clients = clients.filter(
                Q(hotspotuser__active=False) & Q(pppoeuser__active=False)
            ).distinct()

        connection_type = request.query_params.get('connection_type', None)
        if connection_type == 'hotspot':
            clients = clients.filter(hotspotuser__isnull=False).distinct()
        elif connection_type == 'pppoe':
            clients = clients.filter(pppoeuser__isnull=False).distinct()

        router_id = request.query_params.get('router_id', None)
        if router_id:
            clients = clients.filter(
                Q(hotspotuser__router_id=router_id) | Q(pppoeuser__router_id=router_id)
            ).distinct()

        search_query = request.query_params.get('search', None)
        if search_query:
            clients = clients.filter(
                Q(user__username__icontains=search_query) |
                Q(user__phone_number__icontains=search_query)
            )

        paginator = StandardResultsSetPagination()
        paginated_clients = paginator.paginate_queryset(clients.distinct(), request)
        serializer = ClientProfileSerializer(paginated_clients, many=True)
        return paginator.get_paginated_response(serializer.data)

class ClientProfileDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """
        Retrieve a single client profile by ID.
        """
        try:
            client = Client.objects.select_related('user').prefetch_related(
                'subscription_set', 'transaction_set', 'communication_logs', 
                'hotspotuser_set', 'pppoeuser_set'
            ).get(pk=pk)
            serializer = ClientProfileSerializer(client)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, pk):
        """
        Update a client's profile (username and phone number).
        """
        try:
            client = Client.objects.get(pk=pk)
            user = client.user
            data = request.data

            # Update user fields
            if 'username' in data:
                user.username = data['username']
            if 'phonenumber' in data:
                user.phone_number = data['phonenumber']
            
            user.save()

            # Return updated client profile
            serializer = ClientProfileSerializer(client)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        """
        Send a message (SMS, email, or system notification) to a client.
        Optionally associate with a router and connection type.
        """
        try:
            client = Client.objects.get(pk=pk)
            data = request.data
            router_id = data.get('router_id')
            connection_type = data.get('connection_type', 'hotspot')
            router = Router.objects.get(pk=router_id) if router_id else None
            
            serializer = CommunicationLogSerializer(data={
                'client': client.id,
                'router': router.id if router else None,
                'connection_type': connection_type,
                'message_type': data.get('message_type', 'sms'),
                'trigger_type': data.get('trigger_type', 'manual'),
                'subject': data.get('subject', ''),
                'message': data.get('message'),
                'status': 'delivered',  # Simulate successful delivery
                'sent_at': timezone.now()
            })
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client or router not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class DisconnectUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        """
        Disconnect a client from their active connection (Hotspot or PPPoE).
        """
        try:
            client = Client.objects.get(pk=pk)
            connection_type = request.data.get('connection_type')
            
            if connection_type == 'pppoe':
                return self.disconnect_pppoe_user(client, request)
            elif connection_type == 'hotspot':
                return self.disconnect_hotspot_user(client, request)
            else:
                # Auto-detect connection type
                pppoe_user = PPPoEUser.objects.filter(client=client, active=True).first()
                if pppoe_user:
                    return self.disconnect_pppoe_user(client, request)
                
                hotspot_user = HotspotUser.objects.filter(client=client, active=True).first()
                if hotspot_user:
                    return self.disconnect_hotspot_user(client, request)
                
                return Response(
                    {"error": "No active connection found for this client"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def disconnect_hotspot_user(self, client, request):
        """Disconnect hotspot user"""
        hotspot_user = HotspotUser.objects.filter(client=client, active=True).first()
        if not hotspot_user:
            return Response(
                {"error": "No active hotspot connection found for this client"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        router = hotspot_user.router
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip, username=router.username, password=router.password, port=router.port
                )
                api = api_pool.get_api()
                api.get_resource("/ip/hotspot/active").remove(id=hotspot_user.mac)
                api_pool.disconnect()
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                data = {"cmd": "unauthorize-guest", "mac": hotspot_user.mac.lower()}
                requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
            
            hotspot_user.active = False
            hotspot_user.disconnected_at = timezone.now()
            hotspot_user.save()
            
            # Log disconnection
            CommunicationLog.objects.create(
                client=client,
                router=router,
                connection_type='hotspot',
                message_type='system',
                trigger_type='manual_disconnect',
                message=f"Hotspot user disconnected from {router.name}",
                status='delivered',
                sent_at=timezone.now()
            )
            
            serializer = HotspotUserSerializer(hotspot_user)
            return Response(
                {"message": "Hotspot user disconnected successfully", "user": serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to disconnect hotspot user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def disconnect_pppoe_user(self, client, request):
        """Disconnect PPPoE user"""
        pppoe_user = PPPoEUser.objects.filter(client=client, active=True).first()
        if not pppoe_user:
            return Response(
                {"error": "No active PPPoE connection found for this client"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        router = pppoe_user.router
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip, username=router.username, password=router.password, port=router.port
                )
                api = api_pool.get_api()
                
                # Remove PPPoE secret
                pppoe_secret = api.get_resource("/ppp/secret")
                secrets = pppoe_secret.get(name=pppoe_user.username)
                if secrets:
                    pppoe_secret.remove(id=secrets[0].get('id'))
                
                # Remove active PPPoE session if exists
                pppoe_active = api.get_resource("/ppp/active")
                active_sessions = pppoe_active.get(name=pppoe_user.username)
                for session in active_sessions:
                    pppoe_active.remove(id=session.get('id'))
                
                api_pool.disconnect()
            
            pppoe_user.active = False
            pppoe_user.disconnected_at = timezone.now()
            pppoe_user.save()
            
            # Log disconnection
            CommunicationLog.objects.create(
                client=client,
                router=router,
                connection_type='pppoe',
                message_type='system',
                trigger_type='manual_disconnect',
                message=f"PPPoE user disconnected from {router.name}",
                status='delivered',
                sent_at=timezone.now()
            )
            
            serializer = PPPoEUserSerializer(pppoe_user)
            return Response(
                {"message": "PPPoE user disconnected successfully", "user": serializer.data},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to disconnect PPPoE user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ConnectionStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Get connection statistics for all clients.
        """
        total_clients = Client.objects.count()
        active_hotspot_users = HotspotUser.objects.filter(active=True).count()
        active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
        total_active_users = active_hotspot_users + active_pppoe_users
        
        stats = {
            'total_clients': total_clients,
            'active_connections': total_active_users,
            'hotspot_users': {
                'active': active_hotspot_users,
                'total': HotspotUser.objects.count(),
                'percentage': round((active_hotspot_users / total_clients) * 100, 2) if total_clients > 0 else 0
            },
            'pppoe_users': {
                'active': active_pppoe_users,
                'total': PPPoEUser.objects.count(),
                'percentage': round((active_pppoe_users / total_clients) * 100, 2) if total_clients > 0 else 0
            },
            'inactive_clients': total_clients - total_active_users
        }
        
        return Response(stats)