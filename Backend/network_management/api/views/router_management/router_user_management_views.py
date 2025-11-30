
# # network_management/api/views/router_management/router_user_management_views.py
# """
# Router User Management Views for Network Management System

# This module provides API views for managing hotspot and PPPoE users.
# """

# import logging
# from django.utils import timezone
# from django.shortcuts import get_object_or_404
# from django.db import transaction

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from django.db.models import Q, Sum, Count, Avg, Min, Max

# from network_management.models.router_management_model import (
#     Router, HotspotUser, PPPoEUser, RouterSessionHistory, RouterAuditLog
# )
# from network_management.serializers.router_management_serializer import (
#     HotspotUserSerializer, PPPoEUserSerializer
# )
# from network_management.utils.websocket_utils import WebSocketManager

# logger = logging.getLogger(__name__)


# class HotspotUsersView(APIView):
#     """
#     API View for retrieving hotspot users for a router.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get_router(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         """Retrieve all hotspot users for a router."""
#         router = self.get_router(pk)
#         users = HotspotUser.objects.filter(router=router).order_by('-connected_at')
#         serializer = HotspotUserSerializer(users, many=True)
#         return Response(serializer.data)


# class HotspotUserDetailView(APIView):
#     """
#     API View for managing individual hotspot users.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get_user(self, pk):
#         return get_object_or_404(HotspotUser, pk=pk)

#     def delete(self, request, pk):
#         """Disconnect a hotspot user."""
#         user = self.get_user(pk)
#         try:
#             router = user.router

#             if router.type == "mikrotik":
#                 from routeros_api import RouterOsApiPool
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 active = api.get_resource("/ip/hotspot/active").get(mac_address=user.mac.lower())
#                 if active:
#                     api.get_resource("/ip/hotspot/active").remove(id=active[0].get('id'))
#                 api_pool.disconnect()

#             elif router.type == "ubiquiti":
#                 import requests
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
#                 data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
#                 try:
#                     requests.post(
#                         controller_url,
#                         json=data,
#                         auth=(router.username, router.password),
#                         verify=False,
#                         timeout=10
#                     )
#                 except Exception:
#                     logger.exception("Ubiquiti unauthorize request failed")

#             if user.active:
#                 session_duration = int((timezone.now() - user.connected_at).total_seconds())
#                 RouterSessionHistory.objects.create(
#                     hotspot_user=user,
#                     router=router,
#                     start_time=user.connected_at,
#                     end_time=timezone.now(),
#                     data_used=getattr(user, "data_used", 0),
#                     duration=session_duration,
#                     disconnected_reason="manual_disconnect",
#                     user_type="hotspot"
#                 )

#             user.active = False
#             user.disconnected_at = timezone.now()
#             user.save()

#             RouterAuditLog.objects.create(
#                 router=router,
#                 action='user_deactivation',
#                 description=f"Hotspot user {user.mac} disconnected",
#                 user=request.user,
#                 ip_address=request.META.get('REMOTE_ADDR'),
#                 user_agent=request.META.get('HTTP_USER_AGENT', '')
#             )

#             return Response(status=status.HTTP_204_NO_CONTENT)

#         except Exception as e:
#             logger.exception("Error disconnecting user")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PPPoEUsersView(APIView):
#     """
#     API View for retrieving PPPoE users for a router.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get_router(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         """Retrieve all PPPoE users for a router."""
#         router = self.get_router(pk)
#         users = PPPoEUser.objects.filter(router=router).order_by('-connected_at')
#         serializer = PPPoEUserSerializer(users, many=True)
#         return Response(serializer.data)


# class PPPoEUserDetailView(APIView):
#     """
#     API View for managing individual PPPoE users.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get_user(self, pk):
#         return get_object_or_404(PPPoEUser, pk=pk)

#     def delete(self, request, pk):
#         """Disconnect a PPPoE user."""
#         user = self.get_user(pk)
#         try:
#             router = user.router

#             if router.type == "mikrotik":
#                 from routeros_api import RouterOsApiPool
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 pppoe_secret = api.get_resource("/ppp/secret")
#                 secrets = pppoe_secret.get(name=user.username)
#                 if secrets:
#                     pppoe_secret.remove(id=secrets[0].get('id'))
#                 api_pool.disconnect()

#             if user.active:
#                 session_duration = int((timezone.now() - user.connected_at).total_seconds())
#                 RouterSessionHistory.objects.create(
#                     pppoe_user=user,
#                     router=router,
#                     start_time=user.connected_at,
#                     end_time=timezone.now(),
#                     data_used=getattr(user, "data_used", 0),
#                     duration=session_duration,
#                     disconnected_reason="manual_disconnect",
#                     user_type="pppoe"
#                 )

#             user.active = False
#             user.disconnected_at = timezone.now()
#             user.save()

#             RouterAuditLog.objects.create(
#                 router=router,
#                 action='user_deactivation',
#                 description=f"PPPoE user {user.username} disconnected",
#                 user=request.user,
#                 ip_address=request.META.get('REMOTE_ADDR'),
#                 user_agent=request.META.get('HTTP_USER_AGENT', '')
#             )

#             return Response(status=status.HTTP_204_NO_CONTENT)

#         except Exception as e:
#             logger.exception("Error disconnecting PPPoE user")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PPPoEUsersByClientView(APIView):
#     """
#     Production-ready PPPoE Users by Client View with comprehensive features
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """
#         Get PPPoE users for a specific client with advanced filtering and pagination
#         """
#         try:
#             client_id = request.query_params.get('client_id')
            
#             # Validate required parameter
#             if not client_id:
#                 return Response(
#                     {
#                         "error": "client_id parameter is required",
#                         "code": "MISSING_CLIENT_ID"
#                     }, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Validate client_id format
#             try:
#                 client_id_int = int(client_id)
#             except (ValueError, TypeError):
#                 return Response(
#                     {
#                         "error": "Invalid client_id format. Must be a valid integer.",
#                         "code": "INVALID_CLIENT_ID"
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Generate cache key
#             cache_key = f"pppoe_users_client_{client_id}_{request.GET.urlencode()}"
#             cached_data = cache.get(cache_key)
            
#             if cached_data:
#                 logger.info(f"Cache hit for PPPoE users - Client: {client_id}")
#                 return Response(cached_data)
            
#             # Build optimized query
#             queryset = PPPoEUser.objects.filter(
#                 client_id=client_id_int
#             ).select_related('router').order_by('-connected_at')
            
#             # Apply active status filter
#             active_only = request.query_params.get('active_only', 'false').lower() == 'true'
#             if active_only:
#                 queryset = queryset.filter(active=True)
            
#             # Apply router filter
#             router_id = request.query_params.get('router_id')
#             if router_id:
#                 try:
#                     router_id_int = int(router_id)
#                     queryset = queryset.filter(router_id=router_id_int)
#                 except (ValueError, TypeError):
#                     return Response(
#                         {
#                             "error": "Invalid router_id format",
#                             "code": "INVALID_ROUTER_ID"
#                         },
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             # Apply date range filter
#             start_date = request.query_params.get('start_date')
#             end_date = request.query_params.get('end_date')
#             if start_date and end_date:
#                 queryset = queryset.filter(
#                     connected_at__date__range=[start_date, end_date]
#                 )
            
#             # Apply search filter
#             search_query = request.query_params.get('search')
#             if search_query:
#                 queryset = queryset.filter(
#                     Q(username__icontains=search_query) |
#                     Q(service__icontains=search_query) |
#                     Q(router__name__icontains=search_query)
#                 )
            
#             # Enhanced pagination
#             page = int(request.query_params.get('page', 1))
#             page_size = min(int(request.query_params.get('page_size', 20)), 50)
            
#             paginator = Paginator(queryset, page_size)
            
#             try:
#                 page_obj = paginator.page(page)
#             except EmptyPage:
#                 page_obj = paginator.page(paginator.num_pages)
            
#             # Serialize data
#             serializer = PPPoEUserSerializer(page_obj, many=True)
            
#             # Calculate connection statistics
#             stats = self._calculate_connection_stats(queryset)
            
#             response_data = {
#                 "pppoe_users": serializer.data,
#                 "client_id": client_id_int,
#                 "pagination": {
#                     "current_page": page_obj.number,
#                     "total_pages": paginator.num_pages,
#                     "total_items": paginator.count,
#                     "page_size": page_size,
#                     "has_next": page_obj.has_next(),
#                     "has_previous": page_obj.has_previous()
#                 },
#                 "statistics": stats
#             }
            
#             # Cache for 2 minutes
#             cache.set(cache_key, response_data, 120)
            
#             logger.info(
#                 f"PPPoE users fetched successfully - "
#                 f"Client: {client_id}, "
#                 f"User: {request.user.id}, "
#                 f"Count: {paginator.count}"
#             )
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(
#                 f"Failed to fetch PPPoE users by client - "
#                 f"Client: {client_id}, "
#                 f"User: {request.user.id}, "
#                 f"Error: {str(e)}",
#                 exc_info=True
#             )
#             return Response(
#                 {
#                     "error": "Failed to fetch PPPoE users",
#                     "code": "PPPOE_USERS_FETCH_ERROR",
#                     "details": "Please try again or contact support"
#                 },
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _calculate_connection_stats(self, queryset):
#         """Calculate PPPoE connection statistics"""
#         try:
#             # Basic counts
#             counts = queryset.aggregate(
#                 total=Count('id'),
#                 active=Count('id', filter=Q(active=True)),
#                 inactive=Count('id', filter=Q(active=False))
#             )
            
#             # Router distribution
#             router_stats = list(queryset.values('router__name').annotate(
#                 count=Count('id'),
#                 active_count=Count('id', filter=Q(active=True))
#             ).order_by('-count'))
            
#             # Service type distribution
#             service_stats = list(queryset.values('service').annotate(
#                 count=Count('id'),
#                 active_count=Count('id', filter=Q(active=True))
#             ).order_by('-count'))
            
#             # Convert to structured format
#             router_dict = {}
#             for stat in router_stats:
#                 router_name = stat['router__name'] or 'Unknown'
#                 router_dict[router_name] = {
#                     'count': stat['count'],
#                     'active_count': stat['active_count'],
#                     'active_rate': (stat['active_count'] / stat['count'] * 100) if stat['count'] > 0 else 0
#                 }
            
#             service_dict = {}
#             for stat in service_stats:
#                 service_name = stat['service'] or 'Unknown'
#                 service_dict[service_name] = {
#                     'count': stat['count'],
#                     'active_count': stat['active_count']
#                 }
            
#             return {
#                 "total": counts['total'],
#                 "active": counts['active'],
#                 "inactive": counts['inactive'],
#                 "active_rate": (counts['active'] / counts['total'] * 100) if counts['total'] > 0 else 0,
#                 "by_router": router_dict,
#                 "by_service": service_dict
#             }
            
#         except Exception as e:
#             logger.error(f"Error calculating PPPoE connection statistics: {str(e)}")
#             return {
#                 "total": 0,
#                 "active": 0,
#                 "inactive": 0,
#                 "active_rate": 0,
#                 "by_router": {},
#                 "by_service": {}
#             }












# network_management/api/views/router_management/router_user_management_views.py
"""
Router User Management Views for Network Management System

This module provides API views for managing hotspot and PPPoE users.
"""

import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.paginator import Paginator, EmptyPage
from django.core.cache import cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.db.models import Q, Sum, Count, Avg, Min, Max

from network_management.models.router_management_model import (
    Router, HotspotUser, PPPoEUser, RouterSessionHistory, RouterAuditLog
)
from network_management.serializers.router_management_serializer import (
    HotspotUserSerializer, PPPoEUserSerializer
)
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class HotspotUsersView(APIView):
    """
    API View for retrieving hotspot users for a router.
    """
    
    permission_classes = [IsAuthenticated]

    def get_router(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """Retrieve all hotspot users for a router."""
        router = self.get_router(pk)
        users = HotspotUser.objects.filter(router=router).order_by('-connected_at')
        serializer = HotspotUserSerializer(users, many=True)
        return Response(serializer.data)


class HotspotUserDetailView(APIView):
    """
    API View for managing individual hotspot users.
    """
    
    permission_classes = [IsAuthenticated]

    def get_user(self, pk):
        return get_object_or_404(HotspotUser, pk=pk)

    def delete(self, request, pk):
        """Disconnect a hotspot user."""
        user = self.get_user(pk)
        try:
            router = user.router

            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                active = api.get_resource("/ip/hotspot/active").get(mac_address=user.mac.lower())
                if active:
                    api.get_resource("/ip/hotspot/active").remove(id=active[0].get('id'))
                api_pool.disconnect()

            elif router.type == "ubiquiti":
                import requests
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
                try:
                    requests.post(
                        controller_url,
                        json=data,
                        auth=(router.username, router.password),
                        verify=False,
                        timeout=10
                    )
                except Exception:
                    logger.exception("Ubiquiti unauthorize request failed")

            if user.active:
                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    hotspot_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="manual_disconnect",
                    user_type="hotspot"
                )

            user.active = False
            user.disconnected_at = timezone.now()
            user.save()

            RouterAuditLog.objects.create(
                router=router,
                action='user_deactivation',
                description=f"Hotspot user {user.mac} disconnected",
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.exception("Error disconnecting user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PPPoEUsersView(APIView):
    """
    API View for retrieving PPPoE users for a router.
    """
    
    permission_classes = [IsAuthenticated]

    def get_router(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """Retrieve all PPPoE users for a router."""
        router = self.get_router(pk)
        users = PPPoEUser.objects.filter(router=router).order_by('-connected_at')
        serializer = PPPoEUserSerializer(users, many=True)
        return Response(serializer.data)


class PPPoEUserDetailView(APIView):
    """
    API View for managing individual PPPoE users.
    """
    
    permission_classes = [IsAuthenticated]

    def get_user(self, pk):
        return get_object_or_404(PPPoEUser, pk=pk)

    def delete(self, request, pk):
        """Disconnect a PPPoE user."""
        user = self.get_user(pk)
        try:
            router = user.router

            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                pppoe_secret = api.get_resource("/ppp/secret")
                secrets = pppoe_secret.get(name=user.username)
                if secrets:
                    pppoe_secret.remove(id=secrets[0].get('id'))
                api_pool.disconnect()

            if user.active:
                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    pppoe_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="manual_disconnect",
                    user_type="pppoe"
                )

            user.active = False
            user.disconnected_at = timezone.now()
            user.save()

            RouterAuditLog.objects.create(
                router=router,
                action='user_deactivation',
                description=f"PPPoE user {user.username} disconnected",
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.exception("Error disconnecting PPPoE user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PPPoEUsersByClientView(APIView):
    """
    🔥 ENHANCED: PPPoE Users by Client View - Supports both clients and admins
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get PPPoE users with advanced filtering and support for both clients and admins
        """
        try:
            client_id = request.query_params.get('client_id')
            user_id = request.query_params.get('user_id')
            
            # 🔥 CRITICAL FIX: Support both client-based and user-based queries
            if client_id:
                # Client-based query (for client users)
                queryset = PPPoEUser.objects.filter(
                    client__user__client_id=client_id
                ).select_related('client__user', 'router')
            elif user_id:
                # User-based query (for admin users viewing specific users)
                queryset = PPPoEUser.objects.filter(
                    client__user_id=user_id
                ).select_related('client__user', 'router')
            else:
                # Default: current user's PPPoE sessions (for admin PPPoE usage)
                if request.user.user_type == 'client':
                    queryset = PPPoEUser.objects.filter(
                        client__user=request.user
                    ).select_related('client__user', 'router')
                else:
                    # Admin viewing all PPPoE users or their own if they have PPPoE
                    if request.query_params.get('my_sessions'):
                        # Admin viewing their own PPPoE sessions
                        queryset = PPPoEUser.objects.filter(
                            client__user=request.user
                        ).select_related('client__user', 'router')
                    else:
                        # Admin viewing all PPPoE users (requires admin permissions)
                        if not request.user.is_staff:
                            return Response(
                                {'error': 'Admin permissions required to view all PPPoE users'},
                                status=status.HTTP_403_FORBIDDEN
                            )
                        queryset = PPPoEUser.objects.all().select_related('client__user', 'router')
            
            # Generate cache key
            cache_key = f"pppoe_users_{client_id or user_id or request.user.id}_{request.GET.urlencode()}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                logger.info(f"Cache hit for PPPoE users - Client: {client_id}, User: {user_id}")
                return Response(cached_data)
            
            # Apply active status filter
            active_only = request.query_params.get('active_only', 'false').lower() == 'true'
            if active_only:
                queryset = queryset.filter(active=True)
            
            # Apply router filter
            router_id = request.query_params.get('router_id')
            if router_id:
                try:
                    router_id_int = int(router_id)
                    queryset = queryset.filter(router_id=router_id_int)
                except (ValueError, TypeError):
                    return Response(
                        {
                            "error": "Invalid router_id format",
                            "code": "INVALID_ROUTER_ID"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Apply date range filter
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date and end_date:
                queryset = queryset.filter(
                    connected_at__date__range=[start_date, end_date]
                )
            
            # Apply search filter
            search_query = request.query_params.get('search')
            if search_query:
                queryset = queryset.filter(
                    Q(username__icontains=search_query) |
                    Q(service_name__icontains=search_query) |
                    Q(router__name__icontains=search_query) |
                    Q(client__user__username__icontains=search_query) |
                    Q(client__user__phone_number__icontains=search_query)
                )
            
            # Enhanced pagination
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 50)
            
            paginator = Paginator(queryset, page_size)
            
            try:
                page_obj = paginator.page(page)
            except EmptyPage:
                page_obj = paginator.page(paginator.num_pages)
            
            # Serialize data
            serializer = PPPoEUserSerializer(page_obj, many=True)
            
            # Calculate connection statistics
            stats = self._calculate_connection_stats(queryset)
            
            response_data = {
                "pppoe_users": serializer.data,
                "client_id": client_id,
                "user_id": user_id,
                "pagination": {
                    "current_page": page_obj.number,
                    "total_pages": paginator.num_pages,
                    "total_items": paginator.count,
                    "page_size": page_size,
                    "has_next": page_obj.has_next(),
                    "has_previous": page_obj.has_previous()
                },
                "statistics": stats
            }
            
            # Cache for 2 minutes
            cache.set(cache_key, response_data, 120)
            
            logger.info(
                f"PPPoE users fetched successfully - "
                f"Client: {client_id}, "
                f"User: {request.user.id}, "
                f"Count: {paginator.count}"
            )
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(
                f"Failed to fetch PPPoE users - "
                f"User: {request.user.id}, "
                f"Error: {str(e)}",
                exc_info=True
            )
            return Response(
                {
                    "error": "Failed to fetch PPPoE users",
                    "code": "PPPOE_USERS_FETCH_ERROR",
                    "details": "Please try again or contact support"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _calculate_connection_stats(self, queryset):
        """Calculate PPPoE connection statistics"""
        try:
            # Basic counts
            counts = queryset.aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(active=True)),
                inactive=Count('id', filter=Q(active=False))
            )
            
            # Data usage statistics
            usage_stats = queryset.aggregate(
                total_data_used=Sum('data_used'),
                avg_data_used=Avg('data_used'),
                max_data_used=Max('data_used')
            )
            
            # Router distribution
            router_stats = list(queryset.values('router__name', 'router__id').annotate(
                count=Count('id'),
                active_count=Count('id', filter=Q(active=True)),
                total_data=Sum('data_used')
            ).order_by('-count'))
            
            # Convert to structured format
            router_dict = {}
            for stat in router_stats:
                router_name = stat['router__name'] or f"Router {stat['router__id']}"
                router_dict[router_name] = {
                    'count': stat['count'],
                    'active_count': stat['active_count'],
                    'active_rate': (stat['active_count'] / stat['count'] * 100) if stat['count'] > 0 else 0,
                    'total_data': stat['total_data'] or 0
                }
            
            # Session duration stats
            duration_stats = queryset.aggregate(
                avg_session_duration=Avg('total_session_time'),
                max_session_duration=Max('total_session_time')
            )
            
            return {
                "total": counts['total'] or 0,
                "active": counts['active'] or 0,
                "inactive": counts['inactive'] or 0,
                "active_rate": (counts['active'] / counts['total'] * 100) if counts['total'] > 0 else 0,
                "data_usage": {
                    "total_bytes": usage_stats['total_data_used'] or 0,
                    "average_bytes": usage_stats['avg_data_used'] or 0,
                    "max_bytes": usage_stats['max_data_used'] or 0,
                },
                "session_duration": {
                    "average_seconds": duration_stats['avg_session_duration'] or 0,
                    "max_seconds": duration_stats['max_session_duration'] or 0,
                },
                "by_router": router_dict,
            }
            
        except Exception as e:
            logger.error(f"Error calculating PPPoE connection statistics: {str(e)}")
            return {
                "total": 0,
                "active": 0,
                "inactive": 0,
                "active_rate": 0,
                "data_usage": {
                    "total_bytes": 0,
                    "average_bytes": 0,
                    "max_bytes": 0,
                },
                "session_duration": {
                    "average_seconds": 0,
                    "max_seconds": 0,
                },
                "by_router": {},
            }