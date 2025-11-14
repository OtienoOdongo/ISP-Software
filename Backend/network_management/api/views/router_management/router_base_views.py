









# network_management/api/views/router_management/router_base_views.py
"""
Base Router Management Views for Network Management System

This module provides core API views for router CRUD operations and basic management.
"""

import logging
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.cache import cache
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)


class RouterBaseView(APIView):
    """
    Base view class for router operations with common functionality.
    """
    permission_classes = [IsAuthenticated]
    
    def get_router_model(self):
        """Import Router model locally to avoid circular imports."""
        from network_management.models.router_management_model import Router
        return Router
    
    def get_router_audit_log_model(self):
        """Import RouterAuditLog model locally to avoid circular imports."""
        from network_management.models.router_management_model import RouterAuditLog
        return RouterAuditLog
    
    def get_router_serializer(self):
        """Import RouterSerializer locally to avoid circular imports."""
        from network_management.serializers.router_management_serializer import RouterSerializer
        return RouterSerializer
    
    def get_websocket_manager(self):
        """Import WebSocketManager locally to avoid circular imports."""
        from network_management.utils.websocket_utils import WebSocketManager
        return WebSocketManager
    
    def get_router(self, pk):
        """Retrieve router instance with common checks."""
        Router = self.get_router_model()
        return get_object_or_404(Router, pk=pk, is_active=True)
    
    def clear_router_cache(self, router_id):
        """Clear cache for specific router."""
        try:
            cache.delete_pattern(f"router:{router_id}:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")
            cache_keys = [
                f"router:{router_id}:detail",
                f"router:{router_id}:stats",
                f"router:{router_id}:health_comprehensive"
            ]
            cache.delete_many(cache_keys)
    
    def clear_routers_cache(self):
        """Clear all routers list cache."""
        try:
            cache.delete_pattern("routers:list:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")
            cache_keys = [
                "routers:list",
                "routers:list:all",
                "routers:list:connected",
                "routers:list:disconnected"
            ]
            cache.delete_many(cache_keys)
    
    def create_audit_log(self, router, action, description, user, request, changes=None):
        """Create standardized audit log entry."""
        RouterAuditLog = self.get_router_audit_log_model()
        return RouterAuditLog.objects.create(
            router=router,
            action=action,
            description=description,
            user=user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes=changes or {}
        )


class RouterListView(RouterBaseView):
    """
    API View for listing and creating routers.
    """
    
    def get(self, request):
        """Retrieve a list of routers with optional filtering and search."""
        Router = self.get_router_model()
        RouterSerializer = self.get_router_serializer()
        
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', 'all')
        router_type = request.query_params.get('type', '')
        
        cache_key = f"routers:list:{search}:{status_filter}:{router_type}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        routers = Router.objects.filter(is_active=True)
        
        if search:
            routers = routers.filter(
                Q(name__icontains=search) |
                Q(ip__icontains=search) |
                Q(location__icontains=search) |
                Q(ssid__icontains=search) |
                Q(description__icontains=search)
            )
        
        if status_filter != 'all':
            routers = routers.filter(status=status_filter)
            
        if router_type:
            routers = routers.filter(type=router_type)

        serializer = RouterSerializer(routers, many=True)
        cache.set(cache_key, serializer.data, 120)
        
        return Response(serializer.data)

    def post(self, request):
        """Create a new router instance."""
        RouterSerializer = self.get_router_serializer()
        WebSocketManager = self.get_websocket_manager()
        
        serializer = RouterSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save(status="disconnected")
                router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
                router.save()
                
                self.create_audit_log(
                    router=router,
                    action='create',
                    description=f"Router {router.name} created",
                    user=request.user,
                    request=request,
                    changes=request.data
                )
                
                self.clear_routers_cache()
                WebSocketManager.send_router_update(router.id, 'router_created', {'name': router.name})
                
            return Response(RouterSerializer(router).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RouterDetailView(RouterBaseView):
    """
    API View for retrieving, updating, and deleting individual routers.
    """
    
    def get(self, request, pk):
        """Retrieve detailed information about a specific router."""
        RouterSerializer = self.get_router_serializer()
        
        cache_key = f"router:{pk}:detail"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        router = self.get_router(pk)
        serializer = RouterSerializer(router)
        cache.set(cache_key, serializer.data, 300)
        
        return Response(serializer.data)

    def put(self, request, pk):
        """Update a router instance."""
        RouterSerializer = self.get_router_serializer()
        WebSocketManager = self.get_websocket_manager()
        
        router = self.get_router(pk)
        old_data = RouterSerializer(router).data
        
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save()
                
                changes = self.get_changes(old_data, request.data)
                self.create_audit_log(
                    router=router,
                    action='update',
                    description=f"Router {router.name} updated",
                    user=request.user,
                    request=request,
                    changes=changes
                )
                
                self.clear_router_cache(pk)
                self.clear_routers_cache()
                WebSocketManager.send_router_update(pk, 'router_updated', {'name': router.name, 'changes': changes})
                
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Soft delete a router instance."""
        WebSocketManager = self.get_websocket_manager()
        
        router = self.get_router(pk)
        
        with transaction.atomic():
            router.is_active = False
            router.save()
            
            self.create_audit_log(
                router=router,
                action='delete',
                description=f"Router {router.name} deleted",
                user=request.user,
                request=request
            )
            
            self.clear_router_cache(pk)
            self.clear_routers_cache()
            WebSocketManager.send_router_update(pk, 'router_deleted', {'name': router.name})
            
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_changes(self, old_data, new_data):
        """Detect changes between old and new data."""
        changes = {}
        for key, new_value in new_data.items():
            old_value = old_data.get(key)
            if old_value != new_value:
                changes[key] = {'old': old_value, 'new': new_value}
        return changes