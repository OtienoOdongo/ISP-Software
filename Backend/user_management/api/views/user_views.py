
        




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
# from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
# from network_management.serializers.router_management_serializer import HotspotUserSerializer, PPPoEUserSerializer
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
#         Supports filtering by active status, router, connection type, and search by username/phone.
#         """
#         clients = Client.objects.all().select_related('user').prefetch_related(
#             'subscriptions', 'transactions', 'communication_logs', 'hotspotuser_set', 'pppoeuser_set'
#         )
        
#         # Apply filters
#         active_filter = request.query_params.get('active', None)
#         if active_filter == 'true':
#             clients = clients.filter(
#                 Q(hotspotuser__active=True) | Q(pppoeuser__active=True)
#             ).distinct()
#         elif active_filter == 'false':
#             clients = clients.filter(
#                 Q(hotspotuser__active=False) & Q(pppoeuser__active=False)
#             ).distinct()

#         connection_type = request.query_params.get('connection_type', None)
#         if connection_type == 'hotspot':
#             clients = clients.filter(hotspotuser__isnull=False).distinct()
#         elif connection_type == 'pppoe':
#             clients = clients.filter(pppoeuser__isnull=False).distinct()

#         router_id = request.query_params.get('router_id', None)
#         if router_id:
#             clients = clients.filter(
#                 Q(hotspotuser__router_id=router_id) | Q(pppoeuser__router_id=router_id)
#             ).distinct()

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
#                 'subscription_set', 'transaction_set', 'communication_logs', 
#                 'hotspotuser_set', 'pppoeuser_set'
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
#         Optionally associate with a router and connection type.
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             data = request.data
#             router_id = data.get('router_id')
#             connection_type = data.get('connection_type', 'hotspot')
#             router = Router.objects.get(pk=router_id) if router_id else None
            
#             serializer = CommunicationLogSerializer(data={
#                 'client': client.id,
#                 'router': router.id if router else None,
#                 'connection_type': connection_type,
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

# class DisconnectUserView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def post(self, request, pk):
#         """
#         Disconnect a client from their active connection (Hotspot or PPPoE).
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             connection_type = request.data.get('connection_type')
            
#             if connection_type == 'pppoe':
#                 return self.disconnect_pppoe_user(client, request)
#             elif connection_type == 'hotspot':
#                 return self.disconnect_hotspot_user(client, request)
#             else:
#                 # Auto-detect connection type
#                 pppoe_user = PPPoEUser.objects.filter(client=client, active=True).first()
#                 if pppoe_user:
#                     return self.disconnect_pppoe_user(client, request)
                
#                 hotspot_user = HotspotUser.objects.filter(client=client, active=True).first()
#                 if hotspot_user:
#                     return self.disconnect_hotspot_user(client, request)
                
#                 return Response(
#                     {"error": "No active connection found for this client"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
    
#     def disconnect_hotspot_user(self, client, request):
#         """Disconnect hotspot user"""
#         hotspot_user = HotspotUser.objects.filter(client=client, active=True).first()
#         if not hotspot_user:
#             return Response(
#                 {"error": "No active hotspot connection found for this client"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         router = hotspot_user.router
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip, username=router.username, password=router.password, port=router.port
#                 )
#                 api = api_pool.get_api()
#                 api.get_resource("/ip/hotspot/active").remove(id=hotspot_user.mac)
#                 api_pool.disconnect()
#             elif router.type == "ubiquiti":
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
#                 data = {"cmd": "unauthorize-guest", "mac": hotspot_user.mac.lower()}
#                 requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
            
#             hotspot_user.active = False
#             hotspot_user.disconnected_at = timezone.now()
#             hotspot_user.save()
            
#             # Log disconnection
#             CommunicationLog.objects.create(
#                 client=client,
#                 router=router,
#                 connection_type='hotspot',
#                 message_type='system',
#                 trigger_type='manual_disconnect',
#                 message=f"Hotspot user disconnected from {router.name}",
#                 status='delivered',
#                 sent_at=timezone.now()
#             )
            
#             serializer = HotspotUserSerializer(hotspot_user)
#             return Response(
#                 {"message": "Hotspot user disconnected successfully", "user": serializer.data},
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             return Response(
#                 {"error": f"Failed to disconnect hotspot user: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def disconnect_pppoe_user(self, client, request):
#         """Disconnect PPPoE user"""
#         pppoe_user = PPPoEUser.objects.filter(client=client, active=True).first()
#         if not pppoe_user:
#             return Response(
#                 {"error": "No active PPPoE connection found for this client"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         router = pppoe_user.router
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip, username=router.username, password=router.password, port=router.port
#                 )
#                 api = api_pool.get_api()
                
#                 # Remove PPPoE secret
#                 pppoe_secret = api.get_resource("/ppp/secret")
#                 secrets = pppoe_secret.get(name=pppoe_user.username)
#                 if secrets:
#                     pppoe_secret.remove(id=secrets[0].get('id'))
                
#                 # Remove active PPPoE session if exists
#                 pppoe_active = api.get_resource("/ppp/active")
#                 active_sessions = pppoe_active.get(name=pppoe_user.username)
#                 for session in active_sessions:
#                     pppoe_active.remove(id=session.get('id'))
                
#                 api_pool.disconnect()
            
#             pppoe_user.active = False
#             pppoe_user.disconnected_at = timezone.now()
#             pppoe_user.save()
            
#             # Log disconnection
#             CommunicationLog.objects.create(
#                 client=client,
#                 router=router,
#                 connection_type='pppoe',
#                 message_type='system',
#                 trigger_type='manual_disconnect',
#                 message=f"PPPoE user disconnected from {router.name}",
#                 status='delivered',
#                 sent_at=timezone.now()
#             )
            
#             serializer = PPPoEUserSerializer(pppoe_user)
#             return Response(
#                 {"message": "PPPoE user disconnected successfully", "user": serializer.data},
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             return Response(
#                 {"error": f"Failed to disconnect PPPoE user: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ConnectionStatsView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         """
#         Get connection statistics for all clients.
#         """
#         total_clients = Client.objects.count()
#         active_hotspot_users = HotspotUser.objects.filter(active=True).count()
#         active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
#         total_active_users = active_hotspot_users + active_pppoe_users
        
#         stats = {
#             'total_clients': total_clients,
#             'active_connections': total_active_users,
#             'hotspot_users': {
#                 'active': active_hotspot_users,
#                 'total': HotspotUser.objects.count(),
#                 'percentage': round((active_hotspot_users / total_clients) * 100, 2) if total_clients > 0 else 0
#             },
#             'pppoe_users': {
#                 'active': active_pppoe_users,
#                 'total': PPPoEUser.objects.count(),
#                 'percentage': round((active_pppoe_users / total_clients) * 100, 2) if total_clients > 0 else 0
#             },
#             'inactive_clients': total_clients - total_active_users
#         }
        
#         return Response(stats)








# """
# Enhanced Views - Leveraging Network Management APIs
# Complete implementation without duplication
# """
# import logging
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# from rest_framework.pagination import PageNumberPagination
# from django.utils import timezone
# from django.core.exceptions import ObjectDoesNotExist
# from django.db.models import Q, Count, Sum, Avg
# from rest_framework.exceptions import ValidationError
# from django.contrib.auth import get_user_model

# # Import models
# from user_management.models.user_model import Client, CommunicationLog, ClientNote
# from user_management.serializers.user_serializer import (
#     ClientProfileSerializer, CommunicationLogSerializer, ClientNoteSerializer
# )

# # Import network management for stats
# from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
# from internet_plans.models.create_plan_models import Subscription
# from payments.models.payment_config_model import Transaction

# logger = logging.getLogger(__name__)
# User = get_user_model()

# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 50
#     page_size_query_param = 'page_size'
#     max_page_size = 100

# class ClientProfileListView(APIView):
#     """
#     List client profiles with enhanced filtering using network_management data
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         try:
#             clients = Client.objects.all().select_related('user').prefetch_related(
#                 'communication_logs', 'client_notes'
#             )
            
#             # Apply filters
#             active_filter = request.query_params.get('active', None)
#             if active_filter == 'true':
#                 # Use network_management data for active connections
#                 active_user_ids = list(HotspotUser.objects.filter(active=True).values_list('client_id', flat=True)) + \
#                                 list(PPPoEUser.objects.filter(active=True).values_list('client_id', flat=True))
#                 clients = clients.filter(user_id__in=active_user_ids)
#             elif active_filter == 'false':
#                 active_user_ids = list(HotspotUser.objects.filter(active=True).values_list('client_id', flat=True)) + \
#                                 list(PPPoEUser.objects.filter(active=True).values_list('client_id', flat=True))
#                 clients = clients.exclude(user_id__in=active_user_ids)
            
#             connection_type = request.query_params.get('connection_type', None)
#             if connection_type == 'hotspot':
#                 hotspot_user_ids = HotspotUser.objects.values_list('client_id', flat=True)
#                 clients = clients.filter(user_id__in=hotspot_user_ids)
#             elif connection_type == 'pppoe':
#                 pppoe_user_ids = PPPoEUser.objects.values_list('client_id', flat=True)
#                 clients = clients.filter(user_id__in=pppoe_user_ids)
            
#             router_id = request.query_params.get('router_id', None)
#             if router_id:
#                 # Use network_management router data
#                 router_user_ids = list(
#                     HotspotUser.objects.filter(router_id=router_id).values_list('client_id', flat=True)
#                 ) + list(
#                     PPPoEUser.objects.filter(router_id=router_id).values_list('client_id', flat=True)
#                 )
#                 clients = clients.filter(user_id__in=router_user_ids)
            
#             search_query = request.query_params.get('search', None)
#             if search_query:
#                 clients = clients.filter(
#                     Q(user__username__icontains=search_query) |
#                     Q(user__phone_number__icontains=search_query) |
#                     Q(user__client_id__icontains=search_query) |
#                     Q(user__email__icontains=search_query)
#                 )
            
#             # Loyalty tier filter
#             loyalty_tier = request.query_params.get('loyalty_tier', None)
#             if loyalty_tier:
#                 clients = clients.filter(loyalty_tier=loyalty_tier)
            
#             paginator = StandardResultsSetPagination()
#             paginated_clients = paginator.paginate_queryset(clients.distinct(), request)
#             serializer = ClientProfileSerializer(paginated_clients, many=True)
#             return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Error in ClientProfileListView: {str(e)}")
#             return Response(
#                 {"error": "Failed to load client profiles"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ClientProfileDetailView(APIView):
#     """
#     Retrieve and update client profile details
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request, pk):
#         """
#         Retrieve a single client profile by ID
#         """
#         try:
#             client = Client.objects.select_related('user').prefetch_related(
#                 'communication_logs', 'client_notes'
#             ).get(pk=pk)
#             serializer = ClientProfileSerializer(client)
#             return Response(serializer.data, status=status.HTTP_200_OK)
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error in ClientProfileDetailView: {str(e)}")
#             return Response(
#                 {"error": "Failed to load client profile"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def patch(self, request, pk):
#         """
#         Update client profile information
#         """
#         try:
#             client = Client.objects.select_related('user').get(pk=pk)
#             data = request.data
            
#             # Update client-specific fields
#             update_fields = []
#             if 'preferred_contact_method' in data:
#                 client.preferred_contact_method = data['preferred_contact_method']
#                 update_fields.append('preferred_contact_method')
            
#             if 'communication_preferences' in data:
#                 client.communication_preferences = data['communication_preferences']
#                 update_fields.append('communication_preferences')
            
#             if 'notes' in data:
#                 client.notes = data['notes']
#                 update_fields.append('notes')
            
#             if 'loyalty_tier' in data:
#                 client.loyalty_tier = data['loyalty_tier']
#                 update_fields.append('loyalty_tier')
            
#             if 'acquisition_source' in data:
#                 client.acquisition_source = data['acquisition_source']
#                 update_fields.append('acquisition_source')
            
#             if 'referral_code' in data:
#                 client.referral_code = data['referral_code']
#                 update_fields.append('referral_code')
            
#             if update_fields:
#                 client.save(update_fields=update_fields)
            
#             # Update last_contact timestamp
#             client.last_contact = timezone.now()
#             client.save(update_fields=['last_contact'])
            
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
#         except Exception as e:
#             logger.error(f"Error updating client profile: {str(e)}")
#             return Response(
#                 {"error": "Failed to update client profile"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class SendMessageView(APIView):
#     """
#     Send messages to clients with enhanced tracking
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def post(self, request, pk):
#         """
#         Send a message (SMS, email, or system notification) to a client
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             data = request.data
            
#             # Validate required fields
#             if not data.get('message'):
#                 return Response(
#                     {"error": "Message content is required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Create communication log
#             communication_log = CommunicationLog.objects.create(
#                 client=client,
#                 message_type=data.get('message_type', 'sms'),
#                 trigger_type=data.get('trigger_type', 'manual'),
#                 campaign_id=data.get('campaign_id'),
#                 subject=data.get('subject', ''),
#                 message=data.get('message'),
#                 template_name=data.get('template_name'),
#                 status='pending',
#                 sent_at=timezone.now() if data.get('send_immediately', True) else None
#             )
            
#             # TODO: Integrate with actual SMS/email service
#             # For now, simulate successful delivery
#             communication_log.status = 'delivered'
#             communication_log.sent_at = timezone.now()
#             communication_log.save()
            
#             # Update client's last_contact
#             client.last_contact = timezone.now()
#             client.save(update_fields=['last_contact'])
            
#             serializer = CommunicationLogSerializer(communication_log)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error sending message: {str(e)}")
#             return Response(
#                 {"error": "Failed to send message"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ClientMessagesView(APIView):
#     """
#     Get all messages for a specific client
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request, pk):
#         """
#         Get paginated messages for a client
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             messages = CommunicationLog.objects.filter(client=client).order_by('-timestamp')
            
#             paginator = StandardResultsSetPagination()
#             paginated_messages = paginator.paginate_queryset(messages, request)
#             serializer = CommunicationLogSerializer(paginated_messages, many=True)
#             return paginator.get_paginated_response(serializer.data)
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error getting client messages: {str(e)}")
#             return Response(
#                 {"error": "Failed to load messages"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ClientNotesView(APIView):
#     """
#     Manage client notes
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request, pk):
#         """
#         Get all notes for a specific client
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             notes = ClientNote.objects.filter(client=client).order_by('-created_at')
            
#             paginator = StandardResultsSetPagination()
#             paginated_notes = paginator.paginate_queryset(notes, request)
#             serializer = ClientNoteSerializer(paginated_notes, many=True)
#             return paginator.get_paginated_response(serializer.data)
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error getting client notes: {str(e)}")
#             return Response(
#                 {"error": "Failed to load notes"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request, pk):
#         """
#         Create a new note for a client
#         """
#         try:
#             client = Client.objects.get(pk=pk)
#             data = request.data
            
#             # Validate required fields
#             if not data.get('title') or not data.get('content'):
#                 return Response(
#                     {"error": "Title and content are required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             note = ClientNote.objects.create(
#                 client=client,
#                 note_type=data.get('note_type', 'general'),
#                 priority=data.get('priority', 'medium'),
#                 title=data.get('title'),
#                 content=data.get('content'),
#                 created_by=request.user,
#                 requires_follow_up=data.get('requires_follow_up', False),
#                 follow_up_date=data.get('follow_up_date'),
#                 internal_only=data.get('internal_only', False),
#                 tags=data.get('tags', [])
#             )
            
#             serializer = ClientNoteSerializer(note)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error creating client note: {str(e)}")
#             return Response(
#                 {"error": "Failed to create note"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DisconnectUserView(APIView):
#     """
#     Disconnect a client from their active connection using network_management
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def post(self, request, pk):
#         """
#         Disconnect a client from active connection (Hotspot or PPPoE)
#         """
#         try:
#             client = Client.objects.get(pk=pk)
            
#             # Try PPPoE first
#             pppoe_user = PPPoEUser.objects.filter(client=client.user, active=True).first()
#             if pppoe_user:
#                 return self._disconnect_pppoe_user(pppoe_user, client, request)
            
#             # Try Hotspot
#             hotspot_user = HotspotUser.objects.filter(client=client.user, active=True).first()
#             if hotspot_user:
#                 return self._disconnect_hotspot_user(hotspot_user, client, request)
            
#             return Response(
#                 {"error": "No active connection found for this client"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error disconnecting user: {str(e)}")
#             return Response(
#                 {"error": "Failed to disconnect user"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _disconnect_hotspot_user(self, hotspot_user, client, request):
#         """Disconnect hotspot user using network_management logic"""
#         try:
#             # Use network_management's disconnect logic
#             router = hotspot_user.router
            
#             # Simulate disconnection (in production, this would call router APIs)
#             hotspot_user.active = False
#             hotspot_user.disconnected_at = timezone.now()
#             hotspot_user.save()
            
#             # Log the disconnection
#             CommunicationLog.objects.create(
#                 client=client,
#                 message_type='system',
#                 trigger_type='manual_disconnect',
#                 subject='Connection Disconnected',
#                 message=f"Hotspot connection disconnected from {router.name if router else 'unknown router'}",
#                 status='delivered',
#                 sent_at=timezone.now()
#             )
            
#             return Response(
#                 {
#                     "message": "Hotspot user disconnected successfully",
#                     "connection_type": "hotspot",
#                     "disconnected_at": timezone.now().isoformat()
#                 },
#                 status=status.HTTP_200_OK
#             )
            
#         except Exception as e:
#             logger.error(f"Error disconnecting hotspot user: {str(e)}")
#             return Response(
#                 {"error": f"Failed to disconnect hotspot user: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _disconnect_pppoe_user(self, pppoe_user, client, request):
#         """Disconnect PPPoE user using network_management logic"""
#         try:
#             router = pppoe_user.router
            
#             # Simulate disconnection (in production, this would call router APIs)
#             pppoe_user.active = False
#             pppoe_user.disconnected_at = timezone.now()
#             pppoe_user.save()
            
#             # Log the disconnection
#             CommunicationLog.objects.create(
#                 client=client,
#                 message_type='system',
#                 trigger_type='manual_disconnect',
#                 subject='Connection Disconnected',
#                 message=f"PPPoE connection disconnected from {router.name if router else 'unknown router'}",
#                 status='delivered',
#                 sent_at=timezone.now()
#             )
            
#             return Response(
#                 {
#                     "message": "PPPoE user disconnected successfully",
#                     "connection_type": "pppoe",
#                     "disconnected_at": timezone.now().isoformat()
#                 },
#                 status=status.HTTP_200_OK
#             )
            
#         except Exception as e:
#             logger.error(f"Error disconnecting PPPoE user: {str(e)}")
#             return Response(
#                 {"error": f"Failed to disconnect PPPoE user: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ConnectionStatsView(APIView):
#     """
#     Enhanced connection stats using network_management data
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         try:
#             # Use network_management data for connection stats
#             total_hotspot_users = HotspotUser.objects.count()
#             active_hotspot_users = HotspotUser.objects.filter(active=True).count()
#             total_pppoe_users = PPPoEUser.objects.count()
#             active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
            
#             total_clients = Client.objects.count()
#             total_active_connections = active_hotspot_users + active_pppoe_users
            
#             # Subscription stats
#             clients_with_active_subs = Client.objects.filter(
#                 user__subscription__is_active=True
#             ).distinct().count()
            
#             # Revenue stats
#             revenue_data = Transaction.objects.aggregate(
#                 total_revenue=Sum('amount'),
#                 avg_transaction=Avg('amount'),
#                 total_transactions=Count('id')
#             )
            
#             stats = {
#                 'total_clients': total_clients,
#                 'active_connections': total_active_connections,
#                 'clients_with_active_subscriptions': clients_with_active_subs,
#                 'hotspot_users': {
#                     'active': active_hotspot_users,
#                     'total': total_hotspot_users,
#                     'percentage': round((active_hotspot_users / total_clients) * 100, 2) if total_clients > 0 else 0
#                 },
#                 'pppoe_users': {
#                     'active': active_pppoe_users,
#                     'total': total_pppoe_users,
#                     'percentage': round((active_pppoe_users / total_clients) * 100, 2) if total_clients > 0 else 0
#                 },
#                 'inactive_clients': total_clients - total_active_connections,
#                 'connection_ratio': round((total_active_connections / total_clients) * 100, 2) if total_clients > 0 else 0,
                
#                 # Additional stats from network_management
#                 'total_routers': Router.objects.filter(is_active=True).count(),
#                 'online_routers': Router.objects.filter(status='connected', is_active=True).count(),
                
#                 # Revenue stats
#                 'total_revenue': float(revenue_data['total_revenue']) if revenue_data['total_revenue'] else 0.0,
#                 'avg_transaction_value': float(revenue_data['avg_transaction']) if revenue_data['avg_transaction'] else 0.0,
#                 'total_transactions': revenue_data['total_transactions'] or 0,
                
#                 # Loyalty distribution
#                 'loyalty_distribution': self._get_loyalty_distribution()
#             }
            
#             return Response(stats)
            
#         except Exception as e:
#             logger.error(f"Error getting connection stats: {str(e)}")
#             return Response(
#                 {"error": "Failed to load connection statistics"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _get_loyalty_distribution(self):
#         """Get loyalty tier distribution"""
#         try:
#             distribution = Client.objects.values('loyalty_tier').annotate(
#                 count=Count('id'),
#                 percentage=Count('id') * 100.0 / Client.objects.count()
#             ).order_by('loyalty_tier')
            
#             return {
#                 item['loyalty_tier']: {
#                     'count': item['count'],
#                     'percentage': round(item['percentage'], 2)
#                 }
#                 for item in distribution
#             }
#         except Exception as e:
#             logger.error(f"Error getting loyalty distribution: {str(e)}")
#             return {}

# class ClientSearchView(APIView):
#     """
#     Search clients by various criteria
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         """
#         Search clients by username, phone number, client ID, or email
#         """
#         try:
#             search_query = request.query_params.get('q', '')
#             if not search_query:
#                 return Response(
#                     {"error": "Search query is required"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             clients = Client.objects.filter(
#                 Q(user__username__icontains=search_query) |
#                 Q(user__phone_number__icontains=search_query) |
#                 Q(user__client_id__icontains=search_query) |
#                 Q(user__email__icontains=search_query)
#             ).select_related('user')[:20]  # Limit results for performance
            
#             serializer = ClientProfileSerializer(clients, many=True)
#             return Response({
#                 'results': serializer.data,
#                 'count': len(clients),
#                 'query': search_query
#             })
            
#         except Exception as e:
#             logger.error(f"Error searching clients: {str(e)}")
#             return Response(
#                 {"error": "Failed to search clients"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class ClientAnalyticsView(APIView):
#     """
#     Get analytics data for clients
#     """
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request, pk):
#         """
#         Get detailed analytics for a specific client
#         """
#         try:
#             client = Client.objects.get(pk=pk)
            
#             # Connection analytics
#             hotspot_sessions = HotspotUser.objects.filter(client=client.user).count()
#             pppoe_sessions = PPPoEUser.objects.filter(client=client.user).count()
#             total_sessions = hotspot_sessions + pppoe_sessions
            
#             # Usage analytics
#             total_data_used = (
#                 HotspotUser.objects.filter(client=client.user).aggregate(
#                     total=Sum('data_used')
#                 )['total'] or 0
#             ) + (
#                 PPPoEUser.objects.filter(client=client.user).aggregate(
#                     total=Sum('data_used')
#                 )['total'] or 0
#             )
            
#             total_data_used_gb = total_data_used / (1024 ** 3)
            
#             # Transaction analytics
#             transactions = Transaction.objects.filter(client=client.user)
#             total_spent = transactions.aggregate(total=Sum('amount'))['total'] or 0
#             avg_transaction = transactions.aggregate(avg=Avg('amount'))['avg'] or 0
#             transaction_count = transactions.count()
            
#             # Subscription analytics
#             subscriptions = Subscription.objects.filter(client=client.user)
#             active_subscription = subscriptions.filter(is_active=True).first()
#             total_subscription_time = sum(
#                 (sub.end_date - sub.start_date).days 
#                 for sub in subscriptions 
#                 if sub.end_date and sub.start_date
#             )
            
#             analytics = {
#                 'connection_analytics': {
#                     'total_sessions': total_sessions,
#                     'hotspot_sessions': hotspot_sessions,
#                     'pppoe_sessions': pppoe_sessions,
#                     'preferred_connection': 'hotspot' if hotspot_sessions > pppoe_sessions else 'pppoe',
#                     'total_data_used_gb': round(total_data_used_gb, 2)
#                 },
#                 'financial_analytics': {
#                     'total_spent': float(total_spent),
#                     'avg_transaction_value': float(avg_transaction),
#                     'total_transactions': transaction_count,
#                     'customer_lifetime_value': float(total_spent)
#                 },
#                 'subscription_analytics': {
#                     'has_active_subscription': active_subscription is not None,
#                     'total_subscription_days': total_subscription_time,
#                     'subscription_count': subscriptions.count(),
#                     'current_plan': active_subscription.internet_plan.name if active_subscription else None
#                 },
#                 'engagement_analytics': {
#                     'days_since_first_transaction': self._get_days_since_first_transaction(client.user),
#                     'communication_count': CommunicationLog.objects.filter(client=client).count(),
#                     'last_contact_days': self._get_days_since_last_contact(client)
#                 }
#             }
            
#             return Response(analytics)
            
#         except ObjectDoesNotExist:
#             return Response(
#                 {"error": "Client not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error getting client analytics: {str(e)}")
#             return Response(
#                 {"error": "Failed to load client analytics"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _get_days_since_first_transaction(self, user):
#         """Calculate days since first transaction"""
#         try:
#             first_transaction = Transaction.objects.filter(client=user).order_by('created_at').first()
#             if not first_transaction:
#                 return 0
#             return (timezone.now() - first_transaction.created_at).days
#         except Exception:
#             return 0
    
#     def _get_days_since_last_contact(self, client):
#         """Calculate days since last contact"""
#         try:
#             if not client.last_contact:
#                 return 999  # Large number indicating no contact
#             return (timezone.now() - client.last_contact).days
#         except Exception:
#             return 999












"""
Enhanced Views - Leveraging Network Management APIs
Complete implementation without duplication
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, Count, Sum, Avg
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

# Import models
from user_management.models.user_model import Client, CommunicationLog, ClientNote
from user_management.serializers.user_serializer import (
    ClientProfileSerializer, CommunicationLogSerializer, ClientNoteSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100

class ClientProfileListView(APIView):
    """
    List client profiles with enhanced filtering using network_management data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Import inside method to avoid circular imports
            from network_management.models.router_management_model import HotspotUser, PPPoEUser
            
            clients = Client.objects.all().select_related('user').prefetch_related(
                'communication_logs', 'client_notes'
            )
            
            # Apply filters
            active_filter = request.query_params.get('active', None)
            if active_filter == 'true':
                # Use network_management data for active connections
                active_user_ids = list(HotspotUser.objects.filter(active=True).values_list('client_id', flat=True)) + \
                                list(PPPoEUser.objects.filter(active=True).values_list('client_id', flat=True))
                clients = clients.filter(user_id__in=active_user_ids)
            elif active_filter == 'false':
                active_user_ids = list(HotspotUser.objects.filter(active=True).values_list('client_id', flat=True)) + \
                                list(PPPoEUser.objects.filter(active=True).values_list('client_id', flat=True))
                clients = clients.exclude(user_id__in=active_user_ids)
            
            connection_type = request.query_params.get('connection_type', None)
            if connection_type == 'hotspot':
                hotspot_user_ids = HotspotUser.objects.values_list('client_id', flat=True)
                clients = clients.filter(user_id__in=hotspot_user_ids)
            elif connection_type == 'pppoe':
                pppoe_user_ids = PPPoEUser.objects.values_list('client_id', flat=True)
                clients = clients.filter(user_id__in=pppoe_user_ids)
            
            router_id = request.query_params.get('router_id', None)
            if router_id:
                # Use network_management router data
                router_user_ids = list(
                    HotspotUser.objects.filter(router_id=router_id).values_list('client_id', flat=True)
                ) + list(
                    PPPoEUser.objects.filter(router_id=router_id).values_list('client_id', flat=True)
                )
                clients = clients.filter(user_id__in=router_user_ids)
            
            search_query = request.query_params.get('search', None)
            if search_query:
                clients = clients.filter(
                    Q(user__username__icontains=search_query) |
                    Q(user__phone_number__icontains=search_query) |
                    Q(user__client_id__icontains=search_query) |
                    Q(user__email__icontains=search_query)
                )
            
            # Loyalty tier filter
            loyalty_tier = request.query_params.get('loyalty_tier', None)
            if loyalty_tier:
                clients = clients.filter(loyalty_tier=loyalty_tier)
            
            paginator = StandardResultsSetPagination()
            paginated_clients = paginator.paginate_queryset(clients.distinct(), request)
            serializer = ClientProfileSerializer(paginated_clients, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in ClientProfileListView: {str(e)}")
            return Response(
                {"error": "Failed to load client profiles"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientProfileDetailView(APIView):
    """
    Retrieve and update client profile details
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """
        Retrieve a single client profile by ID
        """
        try:
            client = Client.objects.select_related('user').prefetch_related(
                'communication_logs', 'client_notes'
            ).get(pk=pk)
            serializer = ClientProfileSerializer(client)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error in ClientProfileDetailView: {str(e)}")
            return Response(
                {"error": "Failed to load client profile"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def patch(self, request, pk):
        """
        Update client profile information
        """
        try:
            client = Client.objects.select_related('user').get(pk=pk)
            data = request.data
            
            # Update client-specific fields
            update_fields = []
            if 'preferred_contact_method' in data:
                client.preferred_contact_method = data['preferred_contact_method']
                update_fields.append('preferred_contact_method')
            
            if 'communication_preferences' in data:
                client.communication_preferences = data['communication_preferences']
                update_fields.append('communication_preferences')
            
            if 'notes' in data:
                client.notes = data['notes']
                update_fields.append('notes')
            
            if 'loyalty_tier' in data:
                client.loyalty_tier = data['loyalty_tier']
                update_fields.append('loyalty_tier')
            
            if 'acquisition_source' in data:
                client.acquisition_source = data['acquisition_source']
                update_fields.append('acquisition_source')
            
            if 'referral_code' in data:
                client.referral_code = data['referral_code']
                update_fields.append('referral_code')
            
            if update_fields:
                client.save(update_fields=update_fields)
            
            # Update last_contact timestamp
            client.last_contact = timezone.now()
            client.save(update_fields=['last_contact'])
            
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
        except Exception as e:
            logger.error(f"Error updating client profile: {str(e)}")
            return Response(
                {"error": "Failed to update client profile"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SendMessageView(APIView):
    """
    Send messages to clients with enhanced tracking
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """
        Send a message (SMS, email, or system notification) to a client
        """
        try:
            client = Client.objects.get(pk=pk)
            data = request.data
            
            # Validate required fields
            if not data.get('message'):
                return Response(
                    {"error": "Message content is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create communication log
            communication_log = CommunicationLog.objects.create(
                client=client,
                message_type=data.get('message_type', 'sms'),
                trigger_type=data.get('trigger_type', 'manual'),
                campaign_id=data.get('campaign_id'),
                subject=data.get('subject', ''),
                message=data.get('message'),
                template_name=data.get('template_name'),
                status='pending',
                sent_at=timezone.now() if data.get('send_immediately', True) else None
            )
            
            # TODO: Integrate with actual SMS/email service
            # For now, simulate successful delivery
            communication_log.status = 'delivered'
            communication_log.sent_at = timezone.now()
            communication_log.save()
            
            # Update client's last_contact
            client.last_contact = timezone.now()
            client.save(update_fields=['last_contact'])
            
            serializer = CommunicationLogSerializer(communication_log)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return Response(
                {"error": "Failed to send message"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientMessagesView(APIView):
    """
    Get all messages for a specific client
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """
        Get paginated messages for a client
        """
        try:
            client = Client.objects.get(pk=pk)
            messages = CommunicationLog.objects.filter(client=client).order_by('-timestamp')
            
            paginator = StandardResultsSetPagination()
            paginated_messages = paginator.paginate_queryset(messages, request)
            serializer = CommunicationLogSerializer(paginated_messages, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting client messages: {str(e)}")
            return Response(
                {"error": "Failed to load messages"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientNotesView(APIView):
    """
    Manage client notes
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """
        Get all notes for a specific client
        """
        try:
            client = Client.objects.get(pk=pk)
            notes = ClientNote.objects.filter(client=client).order_by('-created_at')
            
            paginator = StandardResultsSetPagination()
            paginated_notes = paginator.paginate_queryset(notes, request)
            serializer = ClientNoteSerializer(paginated_notes, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting client notes: {str(e)}")
            return Response(
                {"error": "Failed to load notes"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, pk):
        """
        Create a new note for a client
        """
        try:
            client = Client.objects.get(pk=pk)
            data = request.data
            
            # Validate required fields
            if not data.get('title') or not data.get('content'):
                return Response(
                    {"error": "Title and content are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            note = ClientNote.objects.create(
                client=client,
                note_type=data.get('note_type', 'general'),
                priority=data.get('priority', 'medium'),
                title=data.get('title'),
                content=data.get('content'),
                created_by=request.user,
                requires_follow_up=data.get('requires_follow_up', False),
                follow_up_date=data.get('follow_up_date'),
                internal_only=data.get('internal_only', False),
                tags=data.get('tags', [])
            )
            
            serializer = ClientNoteSerializer(note)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error creating client note: {str(e)}")
            return Response(
                {"error": "Failed to create note"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DisconnectUserView(APIView):
    """
    Disconnect a client from their active connection using network_management
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """
        Disconnect a client from active connection (Hotspot or PPPoE)
        """
        try:
            # Import inside method to avoid circular imports
            from network_management.models.router_management_model import HotspotUser, PPPoEUser
            
            client = Client.objects.get(pk=pk)
            
            # Try PPPoE first
            pppoe_user = PPPoEUser.objects.filter(client=client.user, active=True).first()
            if pppoe_user:
                return self._disconnect_pppoe_user(pppoe_user, client, request)
            
            # Try Hotspot
            hotspot_user = HotspotUser.objects.filter(client=client.user, active=True).first()
            if hotspot_user:
                return self._disconnect_hotspot_user(hotspot_user, client, request)
            
            return Response(
                {"error": "No active connection found for this client"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error disconnecting user: {str(e)}")
            return Response(
                {"error": "Failed to disconnect user"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _disconnect_hotspot_user(self, hotspot_user, client, request):
        """Disconnect hotspot user using network_management logic"""
        try:
            # Use network_management's disconnect logic
            router = hotspot_user.router
            
            # Simulate disconnection (in production, this would call router APIs)
            hotspot_user.active = False
            hotspot_user.disconnected_at = timezone.now()
            hotspot_user.save()
            
            # Log the disconnection
            CommunicationLog.objects.create(
                client=client,
                message_type='system',
                trigger_type='manual_disconnect',
                subject='Connection Disconnected',
                message=f"Hotspot connection disconnected from {router.name if router else 'unknown router'}",
                status='delivered',
                sent_at=timezone.now()
            )
            
            return Response(
                {
                    "message": "Hotspot user disconnected successfully",
                    "connection_type": "hotspot",
                    "disconnected_at": timezone.now().isoformat()
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error disconnecting hotspot user: {str(e)}")
            return Response(
                {"error": f"Failed to disconnect hotspot user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _disconnect_pppoe_user(self, pppoe_user, client, request):
        """Disconnect PPPoE user using network_management logic"""
        try:
            router = pppoe_user.router
            
            # Simulate disconnection (in production, this would call router APIs)
            pppoe_user.active = False
            pppoe_user.disconnected_at = timezone.now()
            pppoe_user.save()
            
            # Log the disconnection
            CommunicationLog.objects.create(
                client=client,
                message_type='system',
                trigger_type='manual_disconnect',
                subject='Connection Disconnected',
                message=f"PPPoE connection disconnected from {router.name if router else 'unknown router'}",
                status='delivered',
                sent_at=timezone.now()
            )
            
            return Response(
                {
                    "message": "PPPoE user disconnected successfully",
                    "connection_type": "pppoe",
                    "disconnected_at": timezone.now().isoformat()
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error disconnecting PPPoE user: {str(e)}")
            return Response(
                {"error": f"Failed to disconnect PPPoE user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ConnectionStatsView(APIView):
    """
    Enhanced connection stats using network_management data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            logger.info("Starting connection stats calculation")
            
            # Import models inside the method to avoid circular imports
            from user_management.models.user_model import Client
            from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
            
            # Initialize stats with safe defaults
            stats = {
                'total_clients': 0,
                'active_connections': 0,
                'clients_with_active_subscriptions': 0,
                'hotspot_users': {'active': 0, 'total': 0, 'percentage': 0},
                'pppoe_users': {'active': 0, 'total': 0, 'percentage': 0},
                'inactive_clients': 0,
                'connection_ratio': 0,
                'total_routers': 0,
                'online_routers': 0,
                'total_revenue': 0.0,
                'avg_transaction_value': 0.0,
                'total_transactions': 0,
                'loyalty_distribution': {}
            }
            
            try:
                # Get basic counts
                total_clients = Client.objects.count()
                stats['total_clients'] = total_clients
                logger.info(f"Total clients: {total_clients}")
            except Exception as e:
                logger.error(f"Error counting clients: {str(e)}")
                stats['total_clients'] = 0
            
            try:
                # Hotspot users
                total_hotspot_users = HotspotUser.objects.count()
                active_hotspot_users = HotspotUser.objects.filter(active=True).count()
                stats['hotspot_users']['total'] = total_hotspot_users
                stats['hotspot_users']['active'] = active_hotspot_users
                logger.info(f"Hotspot users - total: {total_hotspot_users}, active: {active_hotspot_users}")
            except Exception as e:
                logger.error(f"Error counting hotspot users: {str(e)}")
                stats['hotspot_users'] = {'active': 0, 'total': 0, 'percentage': 0}
            
            try:
                # PPPoE users
                total_pppoe_users = PPPoEUser.objects.count()
                active_pppoe_users = PPPoEUser.objects.filter(active=True).count()
                stats['pppoe_users']['total'] = total_pppoe_users
                stats['pppoe_users']['active'] = active_pppoe_users
                logger.info(f"PPPoE users - total: {total_pppoe_users}, active: {active_pppoe_users}")
            except Exception as e:
                logger.error(f"Error counting PPPoE users: {str(e)}")
                stats['pppoe_users'] = {'active': 0, 'total': 0, 'percentage': 0}
            
            # Calculate active connections
            total_active_connections = stats['hotspot_users']['active'] + stats['pppoe_users']['active']
            stats['active_connections'] = total_active_connections
            
            # Calculate percentages safely
            if stats['total_clients'] > 0:
                stats['hotspot_users']['percentage'] = round(
                    (stats['hotspot_users']['active'] / stats['total_clients']) * 100, 2
                )
                stats['pppoe_users']['percentage'] = round(
                    (stats['pppoe_users']['active'] / stats['total_clients']) * 100, 2
                )
                stats['connection_ratio'] = round(
                    (total_active_connections / stats['total_clients']) * 100, 2
                )
                stats['inactive_clients'] = stats['total_clients'] - total_active_connections
            
            try:
                # Subscription stats - try multiple approaches
                from internet_plans.models.create_plan_models import Subscription
                
                # Method 1: Try with subscriptions relation
                try:
                    clients_with_active_subs = Client.objects.filter(
                        user__subscriptions__is_active=True
                    ).distinct().count()
                    stats['clients_with_active_subscriptions'] = clients_with_active_subs
                except Exception as e:
                    logger.warning(f"Method 1 for subscriptions failed: {str(e)}")
                    
                    # Method 2: Try direct subscription query
                    try:
                        active_subscriptions_count = Subscription.objects.filter(
                            is_active=True
                        ).values('client').distinct().count()
                        stats['clients_with_active_subscriptions'] = active_subscriptions_count
                    except Exception as e:
                        logger.warning(f"Method 2 for subscriptions failed: {str(e)}")
                        stats['clients_with_active_subscriptions'] = 0
                        
                logger.info(f"Active subscriptions: {stats['clients_with_active_subscriptions']}")
            except Exception as e:
                logger.error(f"Error counting subscriptions: {str(e)}")
                stats['clients_with_active_subscriptions'] = 0
            
            try:
                # Router stats
                stats['total_routers'] = Router.objects.filter(is_active=True).count()
                stats['online_routers'] = Router.objects.filter(
                    status='connected', 
                    is_active=True
                ).count()
                logger.info(f"Routers - total: {stats['total_routers']}, online: {stats['online_routers']}")
            except Exception as e:
                logger.error(f"Error counting routers: {str(e)}")
                stats['total_routers'] = 0
                stats['online_routers'] = 0
            
            try:
                # Revenue stats
                from payments.models.payment_config_model import Transaction
                
                revenue_data = Transaction.objects.aggregate(
                    total_revenue=Sum('amount'),
                    avg_transaction=Avg('amount'),
                    total_transactions=Count('id')
                )
                
                stats['total_revenue'] = float(revenue_data['total_revenue'] or 0)
                stats['avg_transaction_value'] = float(revenue_data['avg_transaction'] or 0)
                stats['total_transactions'] = revenue_data['total_transactions'] or 0
                logger.info(f"Revenue data: {revenue_data}")
            except Exception as e:
                logger.error(f"Error calculating revenue: {str(e)}")
                stats['total_revenue'] = 0.0
                stats['avg_transaction_value'] = 0.0
                stats['total_transactions'] = 0
            
            try:
                # Loyalty distribution
                stats['loyalty_distribution'] = self._get_loyalty_distribution()
                logger.info(f"Loyalty distribution: {stats['loyalty_distribution']}")
            except Exception as e:
                logger.error(f"Error getting loyalty distribution: {str(e)}")
                stats['loyalty_distribution'] = {}
            
            logger.info("Connection stats calculation completed successfully")
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Critical error in ConnectionStatsView: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Failed to load connection statistics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_loyalty_distribution(self):
        """Get loyalty tier distribution"""
        try:
            from user_management.models.user_model import Client
            
            total_clients = Client.objects.count()
            if total_clients == 0:
                return {}
                
            distribution = Client.objects.values('loyalty_tier').annotate(
                count=Count('id')
            ).order_by('loyalty_tier')
            
            result = {}
            for item in distribution:
                tier = item['loyalty_tier']
                count = item['count']
                percentage = round((count / total_clients) * 100, 2) if total_clients > 0 else 0
                result[tier] = {
                    'count': count,
                    'percentage': percentage
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in _get_loyalty_distribution: {str(e)}")
            return {}
            
class DebugConnectionStatsView(APIView):
    """
    Debug view to identify the exact error in connection stats
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Test each component individually
            debug_info = {}
            
            # Test 1: Basic imports
            try:
                from network_management.models.router_management_model import HotspotUser, PPPoEUser, Router
                debug_info['imports'] = 'SUCCESS'
            except ImportError as e:
                debug_info['imports'] = f'FAILED: {str(e)}'
                return Response(debug_info, status=500)
            
            # Test 2: HotspotUser count
            try:
                debug_info['hotspot_users_count'] = HotspotUser.objects.count()
            except Exception as e:
                debug_info['hotspot_users_error'] = f'FAILED: {str(e)}'
            
            # Test 3: PPPoEUser count
            try:
                debug_info['pppoe_users_count'] = PPPoEUser.objects.count()
            except Exception as e:
                debug_info['pppoe_users_error'] = f'FAILED: {str(e)}'
            
            # Test 4: Router count
            try:
                debug_info['routers_count'] = Router.objects.filter(is_active=True).count()
            except Exception as e:
                debug_info['routers_error'] = f'FAILED: {str(e)}'
            
            # Test 5: Client count
            try:
                from user_management.models.user_model import Client
                debug_info['clients_count'] = Client.objects.count()
            except Exception as e:
                debug_info['clients_error'] = f'FAILED: {str(e)}'
            
            # Test 6: Subscription query
            try:
                from internet_plans.models.create_plan_models import Subscription
                debug_info['subscriptions_count'] = Subscription.objects.count()
                debug_info['active_subscriptions_count'] = Subscription.objects.filter(is_active=True).count()
            except Exception as e:
                debug_info['subscriptions_error'] = f'FAILED: {str(e)}'
            
            # Test 7: Transaction query
            try:
                from payments.models.payment_config_model import Transaction
                revenue_data = Transaction.objects.aggregate(
                    total_revenue=Sum('amount'),
                    avg_transaction=Avg('amount'),
                    total_transactions=Count('id')
                )
                debug_info['transactions'] = revenue_data
            except Exception as e:
                debug_info['transactions_error'] = f'FAILED: {str(e)}'
            
            return Response(debug_info)
            
        except Exception as e:
            import traceback
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=500)

class ClientSearchView(APIView):
    """
    Search clients by various criteria
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Search clients by username, phone number, client ID, or email
        """
        try:
            search_query = request.query_params.get('q', '')
            if not search_query:
                return Response(
                    {"error": "Search query is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            clients = Client.objects.filter(
                Q(user__username__icontains=search_query) |
                Q(user__phone_number__icontains=search_query) |
                Q(user__client_id__icontains=search_query) |
                Q(user__email__icontains=search_query)
            ).select_related('user')[:20]  # Limit results for performance
            
            serializer = ClientProfileSerializer(clients, many=True)
            return Response({
                'results': serializer.data,
                'count': len(clients),
                'query': search_query
            })
            
        except Exception as e:
            logger.error(f"Error searching clients: {str(e)}")
            return Response(
                {"error": "Failed to search clients"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ClientAnalyticsView(APIView):
    """
    Get analytics data for clients
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """
        Get detailed analytics for a specific client
        """
        try:
            # Import inside method to avoid circular imports
            from network_management.models.router_management_model import HotspotUser, PPPoEUser
            from internet_plans.models.create_plan_models import Subscription
            from payments.models.payment_config_model import Transaction
            
            client = Client.objects.get(pk=pk)
            
            # Connection analytics
            hotspot_sessions = HotspotUser.objects.filter(client=client.user).count()
            pppoe_sessions = PPPoEUser.objects.filter(client=client.user).count()
            total_sessions = hotspot_sessions + pppoe_sessions
            
            # Usage analytics
            total_data_used = (
                HotspotUser.objects.filter(client=client.user).aggregate(
                    total=Sum('data_used')
                )['total'] or 0
            ) + (
                PPPoEUser.objects.filter(client=client.user).aggregate(
                    total=Sum('data_used')
                )['total'] or 0
            )
            
            total_data_used_gb = total_data_used / (1024 ** 3)
            
            # Transaction analytics
            transactions = Transaction.objects.filter(client=client.user)
            total_spent = transactions.aggregate(total=Sum('amount'))['total'] or 0
            avg_transaction = transactions.aggregate(avg=Avg('amount'))['avg'] or 0
            transaction_count = transactions.count()
            
            # Subscription analytics
            subscriptions = Subscription.objects.filter(client=client.user)
            active_subscription = subscriptions.filter(is_active=True).first()
            total_subscription_time = sum(
                (sub.end_date - sub.start_date).days 
                for sub in subscriptions 
                if sub.end_date and sub.start_date
            )
            
            analytics = {
                'connection_analytics': {
                    'total_sessions': total_sessions,
                    'hotspot_sessions': hotspot_sessions,
                    'pppoe_sessions': pppoe_sessions,
                    'preferred_connection': 'hotspot' if hotspot_sessions > pppoe_sessions else 'pppoe',
                    'total_data_used_gb': round(total_data_used_gb, 2)
                },
                'financial_analytics': {
                    'total_spent': float(total_spent),
                    'avg_transaction_value': float(avg_transaction),
                    'total_transactions': transaction_count,
                    'customer_lifetime_value': float(total_spent)
                },
                'subscription_analytics': {
                    'has_active_subscription': active_subscription is not None,
                    'total_subscription_days': total_subscription_time,
                    'subscription_count': subscriptions.count(),
                    'current_plan': active_subscription.internet_plan.name if active_subscription else None
                },
                'engagement_analytics': {
                    'days_since_first_transaction': self._get_days_since_first_transaction(client.user),
                    'communication_count': CommunicationLog.objects.filter(client=client).count(),
                    'last_contact_days': self._get_days_since_last_contact(client)
                }
            }
            
            return Response(analytics)
            
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting client analytics: {str(e)}")
            return Response(
                {"error": "Failed to load client analytics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_days_since_first_transaction(self, user):
        """Calculate days since first transaction"""
        try:
            from payments.models.payment_config_model import Transaction
            first_transaction = Transaction.objects.filter(client=user).order_by('created_at').first()
            if not first_transaction:
                return 0
            return (timezone.now() - first_transaction.created_at).days
        except Exception:
            return 0
    
    def _get_days_since_last_contact(self, client):
        """Calculate days since last contact"""
        try:
            if not client.last_contact:
                return 999  # Large number indicating no contact
            return (timezone.now() - client.last_contact).days
        except Exception:
            return 999