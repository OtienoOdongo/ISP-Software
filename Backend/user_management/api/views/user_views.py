

# # user_management/api/views/user_views.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.pagination import PageNumberPagination
# from rest_framework import status
# from django.db.models import Q, Sum, Max, F
# from django.utils import timezone
# from decimal import Decimal
# import logging

# from user_management.serializers.user_serializer import ClientProfileSerializer, CommunicationLogSerializer
# from account.models.admin_model import Client, ActivityLog
# from account.serializers.admin_serializer import ClientSerializer
# from payments.models.payment_config_model import Transaction
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from user_management.models.user_model import CommunicationLog

# logger = logging.getLogger(__name__)

# class FlexibleResultsSetPagination(PageNumberPagination):
#     page_size_query_param = 'page_size'
#     max_page_size = 1000

#     def get_paginated_response(self, data):
#         return Response({
#             'count': self.page.paginator.count,
#             'next': self.get_next_link(),
#             'previous': self.get_previous_link(),
#             'results': data,
#             'page_size': self.get_page_size(self.request)
#         })

# class UserProfileListView(APIView):
#     permission_classes = [IsAuthenticated]
#     pagination_class = FlexibleResultsSetPagination

#     def get(self, request):
#         try:
#             queryset = Client.objects.all().prefetch_related(
#                 'user',
#                 'subscriptions',
#                 'subscriptions__internet_plan',
#                 'transactions'
#             ).annotate(
#                 total_spent=Sum('transactions__amount'),
#                 last_payment_date=Max('transactions__created_at'),
#                 active_plan=F('subscriptions__internet_plan__name'),
#                 plan_expiry=F('subscriptions__end_date')
#             )
            
#             # Apply filters
#             search = request.query_params.get('search')
#             if search:
#                 queryset = queryset.filter(
#                     Q(user__username__icontains=search) |
#                     Q(user__phone_number__icontains=search)
#                 )

#             # Apply status filter
#             status_filter = request.query_params.get('status')
#             if status_filter:
#                 if status_filter == 'active':
#                     queryset = queryset.filter(
#                         subscriptions__is_active=True,
#                         subscriptions__end_date__gte=timezone.now()
#                     )
#                 elif status_filter == 'expired':
#                     queryset = queryset.filter(
#                         subscriptions__end_date__lt=timezone.now()
#                     )
#                 elif status_filter == 'paid':
#                     queryset = queryset.filter(
#                         transactions__status='success'
#                     ).distinct()
#                 elif status_filter == 'unpaid':
#                     queryset = queryset.exclude(
#                         transactions__status='success'
#                     ).distinct()

#             # Apply sorting
#             sort_by = request.query_params.get('sort_by', '-created_at')
#             if sort_by.lstrip('-') in ['user__username', 'user__phone_number', 'created_at', 'last_payment_date', 'total_spent']:
#                 queryset = queryset.order_by(sort_by)

#             # Paginate
#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(queryset, request)
#             serializer = ClientProfileSerializer(page, many=True, context={'request': request})
#             return paginator.get_paginated_response(serializer.data)
            
#         except Exception as e:
#             logger.error(f"Error in UserProfileListView: {str(e)}", exc_info=True)
#             return Response(
#                 {"error": "Failed to retrieve user profiles."}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class UserProfileDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Client.objects.prefetch_related(
#                 'user',
#                 'subscriptions',
#                 'subscriptions__internet_plan',
#                 'transactions'
#             ).annotate(
#                 total_spent=Sum('transactions__amount'),
#                 last_payment_date=Max('transactions__created_at')
#             ).get(pk=pk)
#         except Client.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         client = self.get_object(pk)
#         if not client:
#             logger.error(f"Client with pk={pk} not found")
#             return Response(
#                 {"error": "Client not found."}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
            
#         serializer = ClientProfileSerializer(client, context={'request': request})
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def patch(self, request, pk):
#         client = self.get_object(pk)
#         if not client:
#             logger.error(f"Client with pk={pk} not found")
#             return Response(
#                 {"error": "Client not found."}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         # For clients, only allow updating phone number, not username or name
#         if client.user.user_type == 'client':
#             if 'full_name' in request.data:
#                 return Response(
#                     {"error": "Cannot update name for client users."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
        
#         serializer = ClientSerializer(
#             client, 
#             data=request.data, 
#             partial=True,
#             context={'request': request}
#         )
        
#         if serializer.is_valid():
#             # Check for phone number uniqueness if updating
#             if 'phonenumber' in serializer.validated_data:
#                 new_phonenumber = serializer.validated_data['phonenumber']
#                 if (new_phonenumber and 
#                     new_phonenumber != client.user.phone_number and 
#                     Client.objects.filter(user__phone_number=new_phonenumber).exists()):
#                     logger.error(f"Phone number {new_phonenumber} already in use")
#                     return Response(
#                         {"error": "Phone number already in use."}, 
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             serializer.save()
            
#             ActivityLog.objects.create(
#                 user=request.user,
#                 action=f"Updated client {client.user.username}",
#                 details=serializer.validated_data
#             )
            
#             logger.info(f"Client {client.id} updated successfully")
#             return Response(
#                 ClientProfileSerializer(client, context={'request': request}).data,
#                 status=status.HTTP_200_OK
#             )
        
#         logger.error(f"Client update failed: {serializer.errors}")
#         return Response(
#             {"error": "Invalid data", "details": serializer.errors},
#             status=status.HTTP_400_BAD_REQUEST
#         )

# class SendManualMessageView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, pk):
#         try:
#             client = Client.objects.get(pk=pk)
#             message_type = request.data.get('message_type', 'sms')
#             message = request.data.get('message', '')
#             subject = request.data.get('subject', '')
            
#             if not message:
#                 return Response(
#                     {"error": "Message content is required."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Create communication log entry
#             communication_log = CommunicationLog.objects.create(
#                 client=client,
#                 message_type=message_type,
#                 trigger_type='manual',
#                 subject=subject,
#                 message=message,
#                 status='pending'
#             )
            
#             # Here you would integrate with your SMS/email service
#             # For now, we'll just simulate sending
#             # In a real implementation, you would call your SMS gateway API here
            
#             # Simulate sending (replace with actual API call)
#             communication_log.status = 'delivered'
#             communication_log.sent_at = timezone.now()
#             communication_log.save()
            
#             # Log the activity
#             ActivityLog.objects.create(
#                 user=request.user,
#                 action=f"Sent {message_type} to {client.user.username}",
#                 details={"message": message, "subject": subject}
#             )
            
#             return Response(
#                 {"success": True, "message": "Message sent successfully."},
#                 status=status.HTTP_200_OK
#             )
            
#         except Client.DoesNotExist:
#             return Response(
#                 {"error": "Client not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             logger.error(f"Error sending message: {str(e)}")
#             return Response(
#                 {"error": "Failed to send message."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
from network_management.models.router_management_model import HotspotUser, Router
from network_management.serializers.router_management_serializer import HotspotUserSerializer
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
        Supports filtering by active status, router, and search by username/phone.
        """
        clients = Client.objects.all().select_related('user').prefetch_related(
            'subscriptions', 'transactions', 'communication_logs', 'hotspotuser_set'
        )
        
        # Apply filters
        active_filter = request.query_params.get('active', None)
        if active_filter == 'true':
            clients = clients.filter(subscription__is_active=True)
        elif active_filter == 'false':
            clients = clients.filter(subscription__is_active=False)

        router_id = request.query_params.get('router_id', None)
        if router_id:
            clients = clients.filter(hotspotuser__router_id=router_id, hotspotuser__active=True)

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
                'subscription_set', 'transaction_set', 'communication_logs', 'hotspotuser_set'
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
        Optionally associate with a router.
        """
        try:
            client = Client.objects.get(pk=pk)
            data = request.data
            router_id = data.get('router_id')
            router = Router.objects.get(pk=router_id) if router_id else None
            
            serializer = CommunicationLogSerializer(data={
                'client': client.id,
                'router': router.id if router else None,
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

class DisconnectHotspotUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        """
        Disconnect a client from their active hotspot connection.
        """
        try:
            client = Client.objects.get(pk=pk)
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
                elif router.type == "cisco":
                    # Placeholder for Cisco logic
                    pass
                else:
                    # Custom logic for 'other' router types
                    pass
                
                hotspot_user.active = False
                hotspot_user.save()
                
                # Log disconnection in CommunicationLog
                CommunicationLog.objects.create(
                    client=client,
                    router=router,
                    message_type='system',
                    trigger_type='hotspot_limit_reached',
                    message=f"Client disconnected from {router.name} hotspot",
                    status='delivered',
                    sent_at=timezone.now()
                )
                
                serializer = HotspotUserSerializer(hotspot_user)
                return Response(
                    {"message": "Client disconnected from hotspot", "hotspot_user": serializer.data},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": f"Failed to disconnect from router: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except ObjectDoesNotExist:
            return Response(
                {"error": "Client not found"},
                status=status.HTTP_404_NOT_FOUND
            )