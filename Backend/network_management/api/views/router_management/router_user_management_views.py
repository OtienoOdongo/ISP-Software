
# network_management/api/views/router_management/router_user_management_views.py
"""
Router User Management Views for Network Management System

This module provides API views for managing hotspot and PPPoE users.
"""

import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

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