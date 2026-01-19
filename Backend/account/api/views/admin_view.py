



# # account/api/views/admin_view.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.pagination import PageNumberPagination
# from django.utils.decorators import method_decorator
# from django.views.decorators.cache import cache_page
# from django.db.models import Count, Sum, Q
# from django.utils import timezone
# from rest_framework import status
# import logging
# from drf_spectacular.utils import extend_schema
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, ActivityLogSerializer, 
#     ClientSerializer, LoginHistorySerializer, NotificationSerializer
# )
# from account.models.admin_model import Client, ActivityLog, LoginHistory, Notification
# from payments.models.transaction_log_model import TransactionLog
# from internet_plans.models.create_plan_models import Subscription
# from network_management.models.router_management_model import Router, RouterHealthCheck

# logger = logging.getLogger(__name__)

# class StandardPagination(PageNumberPagination):
#     page_size = 20
#     page_size_query_param = 'page_size'
#     max_page_size = 100

# class AdminProfileView(APIView):
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     @extend_schema(summary="Get admin profile with stats and activities")
#     def get(self, request):
#         user = request.user
#         try:
#             profile_data = {
#                 "name": user.name,
#                 "email": user.email,
#                 "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else "",
#                 "user_type": user.user_type,
#                 "is_2fa_enabled": getattr(user, 'is_2fa_enabled', False),
#                 "metadata": getattr(user, 'metadata', {}),
#             }

#             # Optimized stats query with fixed uptime calculation
#             stats = {
#                 "clients": Client.objects.count(),
#                 "active_clients": Client.objects.filter(user__is_active=True).count(),
#                 "revenue": TransactionLog.objects.filter(status='success').aggregate(total=Sum('amount'))['total'] or 0,
#                 "uptime": f"{RouterHealthCheck.objects.filter(is_online=True).count() / max(Router.objects.count(), 1) * 100:.1f}%",
#                 "total_subscriptions": Subscription.objects.count(),
#                 "successful_transactions": TransactionLog.objects.filter(status='success').count()
#             }

#             # Filtered activities with prefetch
#             action_type = request.query_params.get('type')
#             activities_qs = ActivityLog.objects.filter(
#                 Q(user=user) | Q(related_user=user)
#             ).select_related('user', 'related_user').order_by('-timestamp')
#             if action_type:
#                 activities_qs = activities_qs.filter(action_type=action_type)
#             paginator = StandardPagination()
#             activities_page = paginator.paginate_queryset(activities_qs, request)
#             activities_serializer = ActivityLogSerializer(activities_page, many=True)

#             return Response({
#                 "profile": profile_data,
#                 "stats": stats,
#                 "activities": activities_serializer.data
#             })
#         except Exception as e:
#             logger.error(f"Profile error: {str(e)}", exc_info=True)
#             return Response({"detail": "Failed to load profile data", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @extend_schema(summary="Update admin profile")
#     def put(self, request):
#         user = request.user
#         if not hasattr(user, 'is_2fa_enabled'):
#             user.is_2fa_enabled = False
#         if not hasattr(user, 'metadata'):
#             user.metadata = {}

#         serializer = AdminProfileSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             # Filter out non-serializable fields (e.g., profile_pic) from metadata
#             changes = {k: v for k, v in serializer.validated_data.items() if k != 'profile_pic'}
#             ActivityLog.objects.create(
#                 user=user,
#                 action_type='modify',
#                 description="Updated profile",
#                 metadata={"changes": changes},
#                 is_critical=False
#             )
#             # Return the updated profile data with absolute URL for profile_pic
#             response_data = {
#                 "name": user.name,
#                 "email": user.email,
#                 "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else "",
#                 "user_type": user.user_type,
#                 "is_2fa_enabled": user.is_2fa_enabled,
#                 "metadata": user.metadata,
#             }
#             return Response(response_data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class ClientListView(APIView):
#     permission_classes = [IsAuthenticated, IsAdminUser]

#     @method_decorator(cache_page(60 * 5))  # Cache for 5 min
#     def get(self, request):
#         try:
#             clients = Client.objects.select_related('user').all()
#             serializer = ClientSerializer(clients, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Client list error: {str(e)}")
#             return Response({"detail": "Failed to retrieve clients"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class LoginHistoryView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             history_qs = LoginHistory.objects.filter(user=request.user).order_by('-timestamp')
#             paginator = StandardPagination()
#             page = paginator.paginate_queryset(history_qs, request)
#             serializer = LoginHistorySerializer(page, many=True)
#             return paginator.get_paginated_response(serializer.data)
#         except Exception as e:
#             logger.error(f"Login history error: {str(e)}")
#             return Response({"detail": "Failed to fetch login history"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class NotificationView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             notifications_qs = Notification.objects.filter(user=request.user).order_by('-timestamp')
#             priority = request.query_params.get('priority')
#             if priority:
#                 notifications_qs = notifications_qs.filter(priority=priority)
#             paginator = StandardPagination()
#             page = paginator.paginate_queryset(notifications_qs, request)
#             serializer = NotificationSerializer(page, many=True)
#             return paginator.get_paginated_response(serializer.data)
#         except Exception as e:
#             logger.error(f"Notifications error: {str(e)}")
#             return Response({"detail": "Failed to fetch notifications"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def patch(self, request, pk):
#         try:
#             notification = Notification.objects.get(pk=pk, user=request.user)
#             notification.read = True
#             notification.save()
#             ActivityLog.objects.create(
#                 user=request.user,
#                 action_type='modify',
#                 description=f"Marked notification {pk} as read",
#                 metadata={"notification_id": pk},
#                 is_critical=False
#             )
#             return Response({"message": "Notification marked as read"})
#         except Notification.DoesNotExist:
#             return Response({"detail": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Update notification error: {str(e)}")
#             return Response({"detail": "Failed to update notification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def delete(self, request):
#         try:
#             Notification.objects.filter(user=request.user).delete()
#             ActivityLog.objects.create(
#                 user=request.user,
#                 action_type='delete',
#                 description="Cleared all notifications",
#                 is_critical=False
#             )
#             return Response({"message": "All notifications cleared"})
#         except Exception as e:
#             logger.error(f"Clear notifications error: {str(e)}")
#             return Response({"detail": "Failed to clear notifications"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class TwoFAView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             enable = request.data.get('enable', False)
#             user = request.user
#             if not hasattr(user, 'is_2fa_enabled'):
#                 return Response({"detail": "2FA not supported for this user"}, status=status.HTTP_400_BAD_REQUEST)
                
#             user.is_2fa_enabled = enable
#             user.save()
#             ActivityLog.objects.create(
#                 user=user,
#                 action_type='modify',
#                 description=f"{'Enabled' if enable else 'Disabled'} 2FA",
#                 is_critical=True
#             )
#             return Response({"message": "2FA settings updated", "is_2fa_enabled": enable})
#         except Exception as e:
#             logger.error(f"2FA update error: {str(e)}")
#             return Response({"detail": "2FA update failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)







from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics, status
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from django.db import transaction
import logging
from drf_spectacular.utils import extend_schema

from account.models.admin_model import (
    Client, ActivityLog, LoginHistory, Notification, 
    PPPoEConnectionLog, HotspotSessionLog
)
from account.serializers.admin_serializer import (
    AdminProfileSerializer, StatsSerializer, ActivityLogSerializer, 
    ClientSerializer, ClientDetailSerializer, LoginHistorySerializer, 
    NotificationSerializer, ClientCreateSerializer,
    PPPoEConnectionLogSerializer, HotspotSessionLogSerializer,
    ClientConnectionStatsSerializer
)
from payments.models.transaction_log_model import TransactionLog
from service_operations.models.subscription_models import Subscription
from network_management.models.router_management_model import Router, RouterHealthCheck

logger = logging.getLogger(__name__)

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(summary="Get admin profile with enhanced stats")
    def get(self, request):
        user = request.user
        try:
            profile_data = {
                "name": user.name,
                "email": user.email,
                "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else "",
                "user_type": user.user_type,
                "is_2fa_enabled": getattr(user, 'is_2fa_enabled', False),
                "metadata": getattr(user, 'metadata', {}),
            }

            # Enhanced stats with connection-specific data
            total_data_used = Client.objects.aggregate(
                total=Sum('data_used')
            )['total'] or 0
            
            # Format total data used for display
            if total_data_used >= 1024 ** 3:  # GB
                total_data_display = f"{(total_data_used / (1024 ** 3)):.2f} GB"
            elif total_data_used >= 1024 ** 2:  # MB
                total_data_display = f"{(total_data_used / (1024 ** 2)):.2f} MB"
            else:
                total_data_display = f"{(total_data_used / 1024):.2f} KB"

            # Calculate average session duration
            pppoe_avg = PPPoEConnectionLog.objects.filter(
                duration__isnull=False
            ).aggregate(avg=Avg('duration'))['avg']
            hotspot_avg = HotspotSessionLog.objects.filter(
                duration__isnull=False
            ).aggregate(avg=Avg('duration'))['avg']

            avg_duration = pppoe_avg or hotspot_avg or timezone.timedelta(0)
            avg_duration_display = f"{int(avg_duration.total_seconds() // 3600)}h {int((avg_duration.total_seconds() % 3600) // 60)}m"

            stats = {
                # General stats
                "clients": Client.objects.count(),
                "active_clients": Client.objects.filter(user__is_active=True).count(),
                "revenue": TransactionLog.objects.filter(status='success').aggregate(total=Sum('amount'))['total'] or 0,
                "uptime": f"{RouterHealthCheck.objects.filter(is_online=True).count() / max(Router.objects.count(), 1) * 100:.1f}%",
                "total_subscriptions": Subscription.objects.count(),
                "successful_transactions": TransactionLog.objects.filter(status='success').count(),
                
                # Connection specific stats
                "hotspot_clients": Client.objects.filter(user__connection_type='hotspot').count(),
                "pppoe_clients": Client.objects.filter(user__connection_type='pppoe').count(),
                "online_clients": Client.objects.filter(connection_status='online').count(),
                "offline_clients": Client.objects.filter(connection_status='offline').count(),
                
                # Usage stats
                "total_data_used": total_data_display,
                "average_session_duration": avg_duration_display,
            }

            # Filtered activities with prefetch
            action_type = request.query_params.get('type')
            activities_qs = ActivityLog.objects.filter(
                Q(user=user) | Q(related_user=user)
            ).select_related('user', 'related_user', 'related_client').order_by('-timestamp')
            
            if action_type:
                activities_qs = activities_qs.filter(action_type=action_type)
            
            paginator = StandardPagination()
            activities_page = paginator.paginate_queryset(activities_qs, request)
            activities_serializer = ActivityLogSerializer(activities_page, many=True)

            return Response({
                "profile": profile_data,
                "stats": stats,
                "activities": activities_serializer.data
            })
        except Exception as e:
            logger.error(f"Profile error: {str(e)}", exc_info=True)
            return Response({"detail": "Failed to load profile data", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @extend_schema(summary="Update admin profile")
    def put(self, request):
        user = request.user
        if not hasattr(user, 'is_2fa_enabled'):
            user.is_2fa_enabled = False
        if not hasattr(user, 'metadata'):
            user.metadata = {}

        serializer = AdminProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            changes = {k: v for k, v in serializer.validated_data.items() if k != 'profile_pic'}
            ActivityLog.objects.create(
                user=user,
                action_type='modify',
                description="Updated profile",
                metadata={"changes": changes},
                is_critical=False
            )
            response_data = {
                "name": user.name,
                "email": user.email,
                "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else "",
                "user_type": user.user_type,
                "is_2fa_enabled": user.is_2fa_enabled,
                "metadata": user.metadata,
            }
            return Response(response_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClientListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ClientSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = Client.objects.select_related('user').all()
        
        # Filter by connection type
        connection_type = self.request.query_params.get('connection_type')
        if connection_type in ['hotspot', 'pppoe']:
            queryset = queryset.filter(user__connection_type=connection_type)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status in ['online', 'offline', 'suspended', 'expired']:
            queryset = queryset.filter(connection_status=status)
        
        # Search by username, phone, or client ID
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(user__phone_number__icontains=search) |
                Q(user__client_id__icontains=search) |
                Q(user__pppoe_username__icontains=search)
            )
        
        return queryset.order_by('-created_at')

class ClientDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ClientDetailSerializer
    queryset = Client.objects.select_related('user').prefetch_related(
        'pppoe_connection_logs', 'hotspot_session_logs'
    )

    @extend_schema(summary="Get client details with connection logs and stats")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(summary="Update client information")
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(summary="Partially update client information")
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

class ClientCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ClientCreateSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        client = serializer.save()
        
        # Log the activity
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='signup',
            description=f"Admin created new {client.user.connection_type} client {client.user.username}",
            related_client=client,
            metadata={
                'connection_type': client.user.connection_type,
                'client_id': client.user.client_id,
                'admin_action': True
            },
            is_critical=False
        )

class ClientConnectionStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(summary="Get connection statistics for a client")
    def get(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            
            if client.is_pppoe:
                logs = client.pppoe_connection_logs.all()
                total_connections = logs.count()
                total_duration = sum(
                    (log.duration or timezone.timedelta(0) for log in logs),
                    timezone.timedelta(0)
                )
                total_data = sum(log.data_sent + log.data_received for log in logs)
            else:
                logs = client.hotspot_session_logs.all()
                total_connections = logs.count()
                total_duration = sum(
                    (log.duration or timezone.timedelta(0) for log in logs),
                    timezone.timedelta(0)
                )
                total_data = sum(log.data_used for log in logs)
            
            avg_duration = total_duration / total_connections if total_connections > 0 else timezone.timedelta(0)
            
            stats = {
                'total_connections': total_connections,
                'total_duration': total_duration,
                'average_duration': avg_duration,
                'total_data_used': total_data,
            }
            
            serializer = ClientConnectionStatsSerializer(stats)
            return Response(serializer.data)
            
        except Client.DoesNotExist:
            return Response({"detail": "Client not found"}, status=status.HTTP_404_NOT_FOUND)

class ClientBulkActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(summary="Perform bulk actions on clients")
    def post(self, request):
        client_ids = request.data.get('client_ids', [])
        action = request.data.get('action')
        
        if not client_ids or not action:
            return Response(
                {"detail": "client_ids and action are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        clients = Client.objects.filter(id__in=client_ids)
        
        if action == 'suspend':
            updated = clients.update(connection_status='suspended')
            message = f"Suspended {updated} clients"
        elif action == 'activate':
            updated = clients.update(connection_status='offline')
            message = f"Activated {updated} clients"
        elif action == 'reset_data':
            updated = 0
            for client in clients:
                client.reset_data_usage()
                updated += 1
            message = f"Reset data usage for {updated} clients"
        elif action == 'generate_pppoe_credentials':
            updated = 0
            for client in clients.filter(user__connection_type='pppoe'):
                client.user.reset_pppoe_credentials()
                updated += 1
            message = f"Generated new PPPoE credentials for {updated} clients"
        else:
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Log the bulk action
        ActivityLog.objects.create(
            user=request.user,
            action_type='modify',
            description=message,
            metadata={
                'action': action,
                'client_count': updated,
                'client_ids': client_ids
            },
            is_critical=True
        )
        
        return Response({"message": message, "updated": updated})

class LoginHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            history_qs = LoginHistory.objects.filter(user=request.user).order_by('-timestamp')
            paginator = StandardPagination()
            page = paginator.paginate_queryset(history_qs, request)
            serializer = LoginHistorySerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Login history error: {str(e)}")
            return Response({"detail": "Failed to fetch login history"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            notifications_qs = Notification.objects.filter(user=request.user).order_by('-timestamp')
            
            priority = request.query_params.get('priority')
            if priority:
                notifications_qs = notifications_qs.filter(priority=priority)
            
            notification_type = request.query_params.get('type')
            if notification_type:
                notifications_qs = notifications_qs.filter(type=notification_type)
            
            paginator = StandardPagination()
            page = paginator.paginate_queryset(notifications_qs, request)
            serializer = NotificationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Notifications error: {str(e)}")
            return Response({"detail": "Failed to fetch notifications"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.read = True
            notification.save()
            ActivityLog.objects.create(
                user=request.user,
                action_type='modify',
                description=f"Marked notification {pk} as read",
                metadata={"notification_id": pk},
                is_critical=False
            )
            return Response({"message": "Notification marked as read"})
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Update notification error: {str(e)}")
            return Response({"detail": "Failed to update notification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        try:
            deleted_count, _ = Notification.objects.filter(user=request.user).delete()
            ActivityLog.objects.create(
                user=request.user,
                action_type='delete',
                description=f"Cleared {deleted_count} notifications",
                is_critical=False
            )
            return Response({"message": f"Cleared {deleted_count} notifications"})
        except Exception as e:
            logger.error(f"Clear notifications error: {str(e)}")
            return Response({"detail": "Failed to clear notifications"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TwoFAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            enable = request.data.get('enable', False)
            user = request.user
            if not hasattr(user, 'is_2fa_enabled'):
                return Response({"detail": "2FA not supported for this user"}, status=status.HTTP_400_BAD_REQUEST)
                
            user.is_2fa_enabled = enable
            user.save()
            ActivityLog.objects.create(
                user=user,
                action_type='modify',
                description=f"{'Enabled' if enable else 'Disabled'} 2FA",
                is_critical=True
            )
            return Response({"message": "2FA settings updated", "is_2fa_enabled": enable})
        except Exception as e:
            logger.error(f"2FA update error: {str(e)}")
            return Response({"detail": "2FA update failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)