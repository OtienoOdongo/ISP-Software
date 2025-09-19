
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, ActivityLogSerializer, 
#     ClientSerializer, LoginHistorySerializer, NotificationSerializer
# )
# from account.models.admin_model import Client, ActivityLog, LoginHistory, Notification
# from payments.models.transaction_log_model import TransactionLog
# from payments.models.payment_reconciliation_model import ReconciliationStats
# from internet_plans.models.create_plan_models import Subscription
# from network_management.models.router_management_model import Router, RouterHealthCheck
# from django.db.models import Count, Sum, Q
# from django.utils import timezone
# from rest_framework import status
# import logging

# logger = logging.getLogger(__name__)

# class AdminProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         try:
#             profile_data = {
#                 "name": user.name,
#                 "email": user.email,
#                 "profile_pic": request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else "",
#                 "user_type": user.user_type,
#                 "is_2fa_enabled": getattr(user, 'is_2fa_enabled', False),
#             }

#             # Calculate stats
#             stats = {
#                 "clients": Client.objects.count(),
#                 "active_clients": Client.objects.filter(user__is_active=True).count(),
#                 "revenue": TransactionLog.objects.filter(status='success').aggregate(total=Sum('amount'))['total'] or 0,
#                 "uptime": f"{RouterHealthCheck.objects.filter(status='online').count() / max(Router.objects.count(), 1) * 100:.1f}%",
#                 "total_subscriptions": Subscription.objects.count(),
#                 "successful_transactions": TransactionLog.objects.filter(status='success').count()
#             }

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
#             return Response({"error": "Failed to load profile data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def put(self, request):
#         try:
#             # Add is_2fa_enabled to UserAccount if not already present
#             user = request.user
#             if not hasattr(user, 'is_2fa_enabled'):
#                 user.is_2fa_enabled = False
#                 user.save()

#             serializer = AdminProfileSerializer(user, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     user=user,
#                     action_type='modify',
#                     description="Updated profile information",
#                     is_critical=False
#                 )
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Error updating profile: {str(e)}")
#             return Response({"error": "Profile update failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class ClientListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             clients = Client.objects.all()
#             serializer = ClientSerializer(clients, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Error listing clients: {str(e)}")
#             return Response({"error": "Failed to retrieve clients"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class LoginHistoryView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             history = LoginHistory.objects.filter(user=request.user).order_by('-timestamp')[:10]
#             serializer = LoginHistorySerializer(history, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Error fetching login history: {str(e)}")
#             return Response({"error": "Failed to fetch login history"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class NotificationView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         try:
#             notifications = Notification.objects.filter(user=request.user).order_by('-timestamp')[:20]
#             serializer = NotificationSerializer(notifications, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             logger.error(f"Error fetching notifications: {str(e)}")
#             return Response({"error": "Failed to fetch notifications"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def patch(self, request, pk):
#         try:
#             notification = Notification.objects.get(pk=pk, user=request.user)
#             notification.read = True
#             notification.save()
#             ActivityLog.objects.create(
#                 user=request.user,
#                 action_type='modify',
#                 description=f"Marked notification {pk} as read",
#                 is_critical=False
#             )
#             return Response({"message": "Notification marked as read"})
#         except Notification.DoesNotExist:
#             return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error updating notification: {str(e)}")
#             return Response({"error": "Failed to update notification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
#             logger.error(f"Error clearing notifications: {str(e)}")
#             return Response({"error": "Failed to clear notifications"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class TwoFAView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         try:
#             enable = request.data.get('enable', False)
#             user = request.user
#             if not hasattr(user, 'is_2fa_enabled'):
#                 user.is_2fa_enabled = False
#             user.is_2fa_enabled = enable
#             user.save()
#             ActivityLog.objects.create(
#                 user=user,
#                 action_type='modify',
#                 description=f"{'Enabled' if enable else 'Disabled'} 2FA",
#                 is_critical=True
#             )
#             return Response({"message": "2FA settings updated"})
#         except Exception as e:
#             logger.error(f"Error updating 2FA: {str(e)}")
#             return Response({"error": "2FA update failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
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

#     def put(self, request):
#         user = request.user
#         if not hasattr(user, 'is_2fa_enabled'):
#             user.is_2fa_enabled = False
#         if not hasattr(user, 'metadata'):
#             user.metadata = {}

#         serializer = AdminProfileSerializer(user, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             ActivityLog.objects.create(
#                 user=user,
#                 action_type='modify',
#                 description="Updated profile",
#                 metadata={"changes": serializer.validated_data},
#                 is_critical=False
#             )
#             return Response(serializer.data)
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






# account/api/views/admin_view.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import status
import logging
from drf_spectacular.utils import extend_schema
from account.serializers.admin_serializer import (
    AdminProfileSerializer, StatsSerializer, ActivityLogSerializer, 
    ClientSerializer, LoginHistorySerializer, NotificationSerializer
)
from account.models.admin_model import Client, ActivityLog, LoginHistory, Notification
from payments.models.transaction_log_model import TransactionLog
from internet_plans.models.create_plan_models import Subscription
from network_management.models.router_management_model import Router, RouterHealthCheck

logger = logging.getLogger(__name__)

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(summary="Get admin profile with stats and activities")
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

            # Optimized stats query with fixed uptime calculation
            stats = {
                "clients": Client.objects.count(),
                "active_clients": Client.objects.filter(user__is_active=True).count(),
                "revenue": TransactionLog.objects.filter(status='success').aggregate(total=Sum('amount'))['total'] or 0,
                "uptime": f"{RouterHealthCheck.objects.filter(is_online=True).count() / max(Router.objects.count(), 1) * 100:.1f}%",
                "total_subscriptions": Subscription.objects.count(),
                "successful_transactions": TransactionLog.objects.filter(status='success').count()
            }

            # Filtered activities with prefetch
            action_type = request.query_params.get('type')
            activities_qs = ActivityLog.objects.filter(
                Q(user=user) | Q(related_user=user)
            ).select_related('user', 'related_user').order_by('-timestamp')
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
            # Filter out non-serializable fields (e.g., profile_pic) from metadata
            changes = {k: v for k, v in serializer.validated_data.items() if k != 'profile_pic'}
            ActivityLog.objects.create(
                user=user,
                action_type='modify',
                description="Updated profile",
                metadata={"changes": changes},
                is_critical=False
            )
            # Return the updated profile data with absolute URL for profile_pic
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

class ClientListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    @method_decorator(cache_page(60 * 5))  # Cache for 5 min
    def get(self, request):
        try:
            clients = Client.objects.select_related('user').all()
            serializer = ClientSerializer(clients, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Client list error: {str(e)}")
            return Response({"detail": "Failed to retrieve clients"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            Notification.objects.filter(user=request.user).delete()
            ActivityLog.objects.create(
                user=request.user,
                action_type='delete',
                description="Cleared all notifications",
                is_critical=False
            )
            return Response({"message": "All notifications cleared"})
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