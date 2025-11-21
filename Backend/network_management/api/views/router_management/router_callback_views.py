
# network_management/api/views/router_management/router_callback_views.py

"""
Router Callback Configuration Views for Network Management System
"""

import logging
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import (
    Router, RouterCallbackConfig, RouterAuditLog
)
from network_management.serializers.router_management_serializer import (
    RouterCallbackConfigSerializer
)

logger = logging.getLogger(__name__)


class RouterCallbackConfigListView(APIView):
    """
    API View for managing router callback configurations.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get all callback configurations for a router."""
        router = get_object_or_404(Router, pk=pk, is_active=True)
        configs = RouterCallbackConfig.objects.filter(router=router)
        serializer = RouterCallbackConfigSerializer(configs, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        """Create a new callback configuration for a router."""
        router = get_object_or_404(Router, pk=pk, is_active=True)
        serializer = RouterCallbackConfigSerializer(data=request.data)
        
        if serializer.is_valid():
            callback_config = serializer.save(router=router)
            
            # Create audit log
            RouterAuditLog.objects.create(
                router=router,
                action='callback_config_create',
                description=f"Callback configuration created for {router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={
                    'event': callback_config.event,
                    'callback_url': callback_config.callback_url,
                    'security_level': callback_config.security_level
                }
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RouterCallbackConfigDetailView(APIView):
    """
    API View for managing individual callback configurations.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, callback_pk):
        """Get callback configuration object."""
        router = get_object_or_404(Router, pk=pk, is_active=True)
        return get_object_or_404(RouterCallbackConfig, pk=callback_pk, router=router)

    def get(self, request, pk, callback_pk):
        """Get specific callback configuration."""
        config = self.get_object(pk, callback_pk)
        serializer = RouterCallbackConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request, pk, callback_pk):
        """Update callback configuration."""
        config = self.get_object(pk, callback_pk)
        old_data = RouterCallbackConfigSerializer(config).data
        
        serializer = RouterCallbackConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            callback_config = serializer.save()
            
            # Create audit log
            RouterAuditLog.objects.create(
                router=config.router,
                action='callback_config_update',
                description=f"Callback configuration updated for {config.router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes=self.get_changes(old_data, request.data)
            )
            
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, callback_pk):
        """Delete callback configuration."""
        config = self.get_object(pk, callback_pk)
        router_name = config.router.name
        event_type = config.event
        
        config.delete()
        
        # Create audit log
        RouterAuditLog.objects.create(
            router=config.router,
            action='callback_config_delete',
            description=f"Callback configuration deleted for {router_name}",
            user=request.user,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes={
                'deleted_event': event_type,
                'router': router_name
            }
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_changes(self, old_data, new_data):
        """Detect changes between old and new data."""
        changes = {}
        for key, new_value in new_data.items():
            old_value = old_data.get(key)
            if old_value != new_value:
                changes[key] = {'old': old_value, 'new': new_value}
        return changes

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')