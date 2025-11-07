






"""
Router Management Views for Network Management System

This module provides API views for managing routers, users, sessions, and monitoring
in a network management system. It supports multiple router types (MikroTik, Ubiquiti, Cisco)
and includes features for user activation, session recovery, health monitoring, and bulk operations.
"""

import subprocess
import logging
import warnings
from datetime import timedelta
import json
import socket
import struct
import fcntl
import array
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, F, ExpressionWrapper, DurationField
from django.core.cache import cache  
from django.conf import settings
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

import requests
from routeros_api import RouterOsApiPool

import warnings
from urllib3.exceptions import InsecureRequestWarning

from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt,
    RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
    RouterAuditLog, BulkOperation
)
from network_management.serializers.router_management_serializer import (
    RouterSerializer, RouterStatsSerializer, HotspotUserSerializer,
    PPPoEUserSerializer, ActivationAttemptSerializer, RouterSessionHistorySerializer,
    RouterHealthCheckSerializer, RouterCallbackConfigSerializer,
    RouterAuditLogSerializer, BulkOperationSerializer,
    SessionRecoverySerializer, BulkActionSerializer, PaymentVerificationSerializer
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from payments.models.payment_config_model import Transaction
from django.contrib.auth import get_user_model

# Initialize user model and logger
User = get_user_model()
logger = logging.getLogger(__name__)


# Suppress InsecureRequestWarning for self-signed / internal controllers 
warnings.simplefilter('ignore', InsecureRequestWarning)


class RouterListView(APIView):
    """
    API View for listing and creating routers.
    
    Provides endpoints to:
    - List all routers with filtering and search capabilities
    - Create new router instances
    - Clear router cache and send WebSocket updates
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve a list of routers with optional filtering and search.
        
        Args:
            request: HTTP request object containing query parameters
            
        Returns:
            Response: Serialized router data with caching support
        """
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', 'all')
        router_type = request.query_params.get('type', '')
        
        #  Use Django cache instead of direct Redis
        cache_key = f"routers:list:{search}:{status_filter}:{router_type}"
        cached_data = cache.get(cache_key)  # No JSON parsing needed
        
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
        
        #  Use Django cache with proper timeout
        cache.set(cache_key, serializer.data, 120)  # 2 minutes
        
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new router instance.
        
        Args:
            request: HTTP request object containing router data
            
        Returns:
            Response: Created router data or validation errors
        """
        serializer = RouterSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save(status="disconnected")
                # Conform callback URL
                router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
                router.save()
                
                # Log the action
                RouterAuditLog.objects.create(
                    router=router,
                    action='create',
                    description=f"Router {router.name} created",
                    user=request.user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    changes=request.data
                )
                
                # Clear cache
                self.clear_routers_cache()
                
                # Send WebSocket update with proper group name
                self.send_websocket_update('router_created', router.id, {'name': router.name})
                
            return Response(RouterSerializer(router).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def clear_routers_cache(self):
        """
        Clear all routers list cache.
        
        Uses pattern deletion if available, otherwise falls back to specific key deletion.
        """
        #  Use Django cache pattern deletion (requires django-redis)
        try:
            cache.delete_pattern("routers:list:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")
            # Fallback: clear all router cache if pattern deletion not supported
            cache_keys = [
                "routers:list",
                "routers:list:all",
                "routers:list:connected",
                "routers:list:disconnected"
            ]
            cache.delete_many(cache_keys)

    def send_websocket_update(self, action, router_id, data=None):
        """
        Send WebSocket update for real-time notifications.
        
        Args:
            action: Type of action performed (created, updated, deleted)
            router_id: ID of the affected router
            data: Additional data to send with the update
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "routers_global",  # Use consistent group name
                {
                    "type": "router_update",  # This matches consumer method name
                    "action": action,
                    "router_id": router_id,
                    "timestamp": timezone.now().isoformat(),
                    "data": data or {}
                }
            )
        except Exception as e:
            logger.error(f"WebSocket update failed: {str(e)}")


class RouterDetailView(APIView):
    """
    API View for retrieving, updating, and deleting individual routers.
    
    Provides detailed operations on specific router instances including
    full CRUD operations with audit logging and cache management.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a router instance by primary key.
        
        Args:
            pk: Primary key of the router to retrieve
            
        Returns:
            Router: Router instance or 404 if not found
        """
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """
        Retrieve detailed information about a specific router.
        
        Args:
            request: HTTP request object
            pk: Primary key of the router
            
        Returns:
            Response: Serialized router data with caching
        """
        #  Use Django cache
        cache_key = f"router:{pk}:detail"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        router = self.get_object(pk)
        serializer = RouterSerializer(router)
        
        # Cache for 5 minutes
        cache.set(cache_key, serializer.data, 300)
        
        return Response(serializer.data)

    def put(self, request, pk):
        """
        Update a router instance.
        
        Args:
            request: HTTP request object with update data
            pk: Primary key of the router to update
            
        Returns:
            Response: Updated router data or validation errors
        """
        router = self.get_object(pk)
        old_data = RouterSerializer(router).data
        
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save()
                
                # Log changes
                changes = self.get_changes(old_data, request.data)
                RouterAuditLog.objects.create(
                    router=router,
                    action='update',
                    description=f"Router {router.name} updated",
                    user=request.user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    changes=changes
                )
                
                # Clear cache
                self.clear_router_cache(pk)
                self.clear_routers_cache()
                
                # ✅ UPDATED: Send WebSocket update
                self.send_websocket_update('router_updated', pk, {'name': router.name, 'changes': changes})
                
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """
        Soft delete a router instance.
        
        Args:
            request: HTTP request object
            pk: Primary key of the router to delete
            
        Returns:
            Response: 204 No Content on success
        """
        router = self.get_object(pk)
        
        with transaction.atomic():
            router.is_active = False
            router.save()
            
            # Log deletion
            RouterAuditLog.objects.create(
                router=router,
                action='delete',
                description=f"Router {router.name} deleted",
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Clear cache
            self.clear_router_cache(pk)
            self.clear_routers_cache()
            
            # Send WebSocket update
            self.send_websocket_update('router_deleted', pk, {'name': router.name})
            
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_changes(self, old_data, new_data):
        """
        Detect changes between old and new data.
        
        Args:
            old_data: Original data before changes
            new_data: New data after changes
            
        Returns:
            dict: Dictionary of changed fields with old and new values
        """
        changes = {}
        for key, new_value in new_data.items():
            old_value = old_data.get(key)
            if old_value != new_value:
                changes[key] = {'old': old_value, 'new': new_value}
        return changes

    def clear_router_cache(self, router_id):
        """
        Clear cache for specific router.
        
        Args:
            router_id: ID of the router whose cache should be cleared
        """
        try:
            cache.delete_pattern(f"router:{router_id}:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")
            # Fallback
            cache_keys = [
                f"router:{router_id}:detail",
                f"router:{router_id}:stats",
                f"router:{router_id}:health_comprehensive"
            ]
            cache.delete_many(cache_keys)

    def send_websocket_update(self, action, router_id, data=None):
        """
        Send WebSocket update for router changes.
        
        Args:
            action: Type of action performed
            router_id: ID of the affected router
            data: Additional data to send
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "routers_global",  # Use consistent group name
                {
                    "type": "router_update",
                    "action": action,
                    "router_id": router_id,
                    "timestamp": timezone.now().isoformat(),
                    "data": data or {}
                }
            )
        except Exception as e:
            logger.error(f"WebSocket update failed: {str(e)}")


# Enhanced RouterActivateUserView with Payment Verification
class RouterActivateUserView(APIView):
    """
    API View for activating users on routers with payment verification.
    
    Supports both Hotspot and PPPoE user activation with comprehensive
    payment verification, session management, and router integration.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Activate a user on a router after payment verification.
        
        Args:
            request: HTTP request object with activation data
            pk: Primary key of the target router
            
        Returns:
            Response: Activation result or error message
        """
        router = Router.objects.filter(id=pk, status="connected", is_active=True).first()
        if not router:
            return Response({"error": "Router not found or not connected"}, status=status.HTTP_404_NOT_FOUND)

        # Verify payment before activation
        payment_verified = self.verify_payment(request.data)
        if not payment_verified:
            return Response({"error": "Payment verification failed"}, status=status.HTTP_402_PAYMENT_REQUIRED)

        connection_type = request.data.get("connection_type", "hotspot")
        mac = (request.data.get("mac") or "").lower()
        username = request.data.get("username")
        password = request.data.get("password")
        plan_id = request.data.get("plan_id")
        client_id = request.data.get("client_id")
        transaction_id = request.data.get("transaction_id")

        if connection_type == "hotspot" and not all([mac, plan_id, client_id]):
            return Response({"error": "Missing required fields for hotspot"}, status=status.HTTP_400_BAD_REQUEST)
        elif connection_type == "pppoe" and not all([username, password, plan_id, client_id]):
            return Response({"error": "Missing required fields for PPPoE"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = Client.objects.get(id=client_id)
            plan = InternetPlan.objects.get(id=plan_id)
            transaction = None
            if transaction_id:
                try:
                    transaction = Transaction.objects.get(id=transaction_id)
                except Transaction.DoesNotExist:
                    transaction = None

            if connection_type == "hotspot":
                return self.activate_hotspot_user(router, client, plan, transaction, mac, request)
            elif connection_type == "pppoe":
                return self.activate_pppoe_user(router, client, plan, transaction, username, password, request)
            else:
                return Response({"error": "Invalid connection type"}, status=status.HTTP_400_BAD_REQUEST)

        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except InternetPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error activating user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def verify_payment(self, data):
        """
        Enhanced payment verification with multiple checks.
        
        Args:
            data: Dictionary containing payment verification data
            
        Returns:
            bool: True if payment is verified, False otherwise
        """
        try:
            client_id = data.get('client_id')
            plan_id = data.get('plan_id')
            transaction_id = data.get('transaction_id')
            
            if not all([client_id, plan_id]):
                return False

            # Check if client has active subscription
            active_subscription = Subscription.objects.filter(
                client_id=client_id,
                internet_plan_id=plan_id,
                is_active=True,
                end_date__gt=timezone.now()
            ).exists()
            
            if active_subscription:
                return True

            # Check transaction status
            if transaction_id:
                try:
                    transaction = Transaction.objects.get(
                        id=transaction_id,
                        status='completed'
                    )
                    return True
                except Transaction.DoesNotExist:
                    pass

            # Check for recent successful payment
            recent_payment = Transaction.objects.filter(
                client_id=client_id,
                plan_id=plan_id,
                status='completed',
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
            
            return recent_payment

        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}")
            return False

    def activate_hotspot_user(self, router, client, plan, transaction, mac, request):
        """
        Activate a hotspot user on the router.
        
        Args:
            router: Router instance to activate user on
            client: Client instance being activated
            plan: Internet plan for the user
            transaction: Payment transaction record
            mac: MAC address of the user device
            request: HTTP request object
            
        Returns:
            Response: Activation result or error
        """
        # End any existing active session for the client
        existing_session = HotspotUser.objects.filter(client=client, active=True).first()
        if existing_session:
            existing_session.active = False
            existing_session.disconnected_at = timezone.now()
            existing_session.save()

            session_duration = int((timezone.now() - existing_session.connected_at).total_seconds())
            RouterSessionHistory.objects.create(
                hotspot_user=existing_session,
                router=existing_session.router,
                start_time=existing_session.connected_at,
                end_time=timezone.now(),
                data_used=getattr(existing_session, "data_used", 0),
                duration=session_duration,
                disconnected_reason="router_switch",
                user_type="hotspot"
            )

        remaining_time = self.calculate_remaining_time(client, plan)

        hotspot_user = HotspotUser.objects.create(
            router=router,
            client=client,
            plan=plan,
            transaction=transaction,
            mac=mac,
            ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
            active=True,
            remaining_time=remaining_time
        )

        success, error = self.activate_hotspot_on_router(router, hotspot_user)

        # Ensure a Subscription record exists
        try:
            subscription, _ = Subscription.objects.get_or_create(client=client, internet_plan=plan)
        except Exception:
            subscription = None

        ActivationAttempt.objects.create(
            subscription=subscription,
            router=router,
            success=bool(success),
            error_message=error if error else "",
            retry_count=0,
            user_type="hotspot"
        )

        # Log the activation
        RouterAuditLog.objects.create(
            router=router,
            action='user_activation',
            description=f"Hotspot user activated for {client.user.username}",
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes={'mac': mac, 'plan': plan.name, 'client': client.user.username}
        )

        if success:
            #  Send WebSocket notification for user activation
            self.send_activation_notification(router.id, 'hotspot_user_activated', {
                'client': client.user.username,
                'mac': mac,
                'plan': plan.name
            })
            
            serializer = HotspotUserSerializer(hotspot_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # remove db row if activation on router failed
            hotspot_user.delete()
            return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def activate_pppoe_user(self, router, client, plan, transaction, username, password, request):
        """
        Activate a PPPoE user on the router.
        
        Args:
            router: Router instance to activate user on
            client: Client instance being activated
            plan: Internet plan for the user
            transaction: Payment transaction record
            username: PPPoE username
            password: PPPoE password
            request: HTTP request object
            
        Returns:
            Response: Activation result or error
        """
        # End any existing active session for the client
        existing_session = PPPoEUser.objects.filter(client=client, active=True).first()
        if existing_session:
            existing_session.active = False
            existing_session.disconnected_at = timezone.now()
            existing_session.save()

            session_duration = int((timezone.now() - existing_session.connected_at).total_seconds())
            RouterSessionHistory.objects.create(
                pppoe_user=existing_session,
                router=existing_session.router,
                start_time=existing_session.connected_at,
                end_time=timezone.now(),
                data_used=getattr(existing_session, "data_used", 0),
                duration=session_duration,
                disconnected_reason="router_switch",
                user_type="pppoe"
            )

        remaining_time = self.calculate_remaining_time(client, plan)

        pppoe_user = PPPoEUser.objects.create(
            router=router,
            client=client,
            plan=plan,
            transaction=transaction,
            username=username,
            password=password,
            ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
            active=True,
            remaining_time=remaining_time
        )

        success, error = self.activate_pppoe_on_router(router, pppoe_user)

        # Ensure a Subscription record exists
        try:
            subscription, _ = Subscription.objects.get_or_create(client=client, internet_plan=plan)
        except Exception:
            subscription = None

        ActivationAttempt.objects.create(
            subscription=subscription,
            router=router,
            success=bool(success),
            error_message=error if error else "",
            retry_count=0,
            user_type="pppoe"
        )

        # Log the activation
        RouterAuditLog.objects.create(
            router=router,
            action='user_activation',
            description=f"PPPoE user activated for {client.user.username}",
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes={'username': username, 'plan': plan.name, 'client': client.user.username}
        )

        if success:
            #  Send WebSocket notification for user activation
            self.send_activation_notification(router.id, 'pppoe_user_activated', {
                'client': client.user.username,
                'username': username,
                'plan': plan.name
            })
            
            serializer = PPPoEUserSerializer(pppoe_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # remove db row if activation on router failed
            pppoe_user.delete()
            return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def send_activation_notification(self, router_id, action, data):
        """
        Send WebSocket notification for user activation.
        
        Args:
            router_id: ID of the router where activation occurred
            action: Type of activation action
            data: Activation data to send
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "routers_global",
                {
                    "type": "router_update",
                    "action": action,
                    "router_id": router_id,
                    "timestamp": timezone.now().isoformat(),
                    "data": data
                }
            )
        except Exception as e:
            logger.error(f"Activation WebSocket notification failed: {str(e)}")

    def calculate_remaining_time(self, client, plan):
        """
        Calculate remaining time for a client's plan.
        
        Args:
            client: Client instance
            plan: Internet plan instance
            
        Returns:
            int: Remaining time in seconds
        """
        # Calculate total used time from both hotspot and PPPoE sessions
        hotspot_sessions = HotspotUser.objects.filter(client=client, plan=plan, active=False)
        pppoe_sessions = PPPoEUser.objects.filter(client=client, plan=plan, active=False)

        total_used_time = 0
        for session in hotspot_sessions:
            total_used_time += getattr(session, "total_session_time", 0) or 0
        for session in pppoe_sessions:
            total_used_time += getattr(session, "total_session_time", 0) or 0

        if getattr(plan, "expiry_unit", None) == 'Hours':
            plan_duration = int(getattr(plan, "expiry_value", 0)) * 3600
        elif getattr(plan, "expiry_unit", None) == 'Days':
            plan_duration = int(getattr(plan, "expiry_value", 0)) * 86400
        else:  # Unlimited or other
            plan_duration = 0

        remaining_time = max(0, plan_duration - total_used_time) if plan_duration > 0 else 0
        return remaining_time

    def activate_hotspot_on_router(self, router, hotspot_user):
        """
        Activate hotspot user on the physical router.
        
        Args:
            router: Router instance
            hotspot_user: HotspotUser instance to activate
            
        Returns:
            tuple: (success, error_message)
        """
        # Existing hotspot activation logic (keep as is)
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                hotspot = api.get_resource("/ip/hotspot/user")

                data_limit = 0
                if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
                    try:
                        multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                        data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
                    except Exception:
                        data_limit = 0

                username = getattr(hotspot_user.client, "user", None)
                username_str = username.username if username else f"user_{hotspot_user.client.id}"

                hotspot.add(
                    name=username_str,
                    password=str(hotspot_user.client.id),
                    profile=getattr(hotspot_user.plan, "name", ""),
                    mac_address=hotspot_user.mac.lower(),
                    limit_bytes_total=data_limit
                )

                if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
                    active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
                    if active:
                        api.get_resource("/ip/hotspot/active").set(
                            id=active[0].get('id'),
                            idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
                        )

                api_pool.disconnect()
                return True, None

            elif router.type == "ubiquiti":
                # Ubiquiti hotspot activation logic
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                auth_minutes = max(1, hotspot_user.remaining_time // 60) if hotspot_user.remaining_time and hotspot_user.remaining_time > 0 else 1440

                def to_int_if_numeric(val):
                    try:
                        return int(float(val))
                    except Exception:
                        return 0

                bytes_limit = 0
                if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
                    try:
                        mul = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                        bytes_limit = int(float(hotspot_user.plan.data_limit_value) * mul)
                    except Exception:
                        bytes_limit = 0

                data = {
                    "cmd": "authorize-guest",
                    "mac": hotspot_user.mac.lower(),
                    "minutes": auth_minutes,
                    "up": to_int_if_numeric(getattr(hotspot_user.plan, "upload_speed_value", 0)),
                    "down": to_int_if_numeric(getattr(hotspot_user.plan, "download_speed_value", 0)),
                    "bytes": bytes_limit
                }

                response = requests.post(
                    controller_url,
                    json=data,
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=10
                )

                if response.status_code == 200:
                    return True, None
                else:
                    return False, f"Ubiquiti API error: {response.status_code}"

            elif router.type == "cisco":
                # Placeholder for Cisco
                return True, None

            else:
                return False, f"Unsupported router type: {router.type}"

        except Exception as e:
            logger.exception(f"Error activating hotspot on router {getattr(router, 'id', 'unknown')}")
            return False, str(e)

    def activate_pppoe_on_router(self, router, pppoe_user):
        """
        Activate PPPoE user on the physical router.
        
        Args:
            router: Router instance
            pppoe_user: PPPoEUser instance to activate
            
        Returns:
            tuple: (success, error_message)
        """
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                pppoe_secret = api.get_resource("/ppp/secret")

                # Configure PPPoE secret
                pppoe_secret.add(
                    name=pppoe_user.username,
                    password=pppoe_user.password,
                    service="pppoe",
                    profile=getattr(pppoe_user.plan, "name", "default"),
                    remote_address=pppoe_user.ip_address or "dynamic"
                )

                # Set session timeout if remaining time is specified
                if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
                    profile_resource = api.get_resource("/ppp/profile")
                    profile_resource.set(
                        name=getattr(pppoe_user.plan, "name", "default"),
                        session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
                    )

                api_pool.disconnect()
                return True, None

            elif router.type == "ubiquiti":
                # Ubiquiti PPPoE configuration would go here
                # This is a placeholder as Ubiquiti typically doesn't handle PPPoE servers
                return True, "PPPoE configuration not supported on Ubiquiti routers"

            elif router.type == "cisco":
                # Placeholder for Cisco PPPoE
                return True, None

            else:
                return False, f"Unsupported router type for PPPoE: {router.type}"

        except Exception as e:
            logger.exception(f"Error activating PPPoE on router {getattr(router, 'id', 'unknown')}")
            return False, str(e)


#  Session Recovery Views 
class SessionRecoveryView(APIView):
    """
    API View for recovering lost user sessions.
    
    Provides functionality to recover sessions that were disconnected
    due to router reboots, power outages, or other temporary issues.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Recover lost sessions for a user.
        
        Args:
            request: HTTP request object with recovery parameters
            
        Returns:
            Response: Recovery results or error message
        """
        serializer = SessionRecoverySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        phone_number = data['phone_number']
        mac_address = data.get('mac_address', '')
        username = data.get('username', '')
        recovery_method = data['recovery_method']

        try:
            # Find recoverable sessions
            recoverable_sessions = self.find_recoverable_sessions(phone_number, mac_address, username)
            
            if not recoverable_sessions:
                return Response({"error": "No recoverable sessions found"}, status=status.HTTP_404_NOT_FOUND)

            recovered_sessions = []
            for session in recoverable_sessions:
                if self.recover_session(session, recovery_method):
                    recovered_sessions.append(session.id)

            # Send WebSocket notification for recovery
            self.send_recovery_notification(len(recovered_sessions))
            
            return Response({
                "message": f"Recovered {len(recovered_sessions)} sessions",
                "recovered_count": len(recovered_sessions),
                "recovered_sessions": recovered_sessions
            })

        except Exception as e:
            logger.error(f"Session recovery failed: {str(e)}")
            return Response({"error": "Session recovery failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def send_recovery_notification(self, recovered_count):
        """
        Send WebSocket notification for session recovery.
        
        Args:
            recovered_count: Number of sessions successfully recovered
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "notifications",
                {
                    "type": "send_notification",
                    "title": "Session Recovery",
                    "message": f"Successfully recovered {recovered_count} sessions",
                    "level": "success",
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"Recovery WebSocket notification failed: {str(e)}")

    def find_recoverable_sessions(self, phone_number, mac_address, username):
        """
        Find sessions that can be recovered.
        
        Args:
            phone_number: User's phone number
            mac_address: MAC address (optional)
            username: PPPoE username (optional)
            
        Returns:
            QuerySet: Recoverable session records
        """
        cutoff_time = timezone.now() - timedelta(hours=24)
        
        sessions = RouterSessionHistory.objects.filter(
            Q(start_time__gte=cutoff_time),
            Q(recoverable=True),
            Q(recovery_attempted=False),
            Q(disconnected_reason__in=['router_reboot', 'power_outage', 'router_switch'])
        )

        if mac_address:
            sessions = sessions.filter(
                Q(hotspot_user__mac=mac_address) | 
                Q(hotspot_user__client__user__phone_number=phone_number)
            )
        elif username:
            sessions = sessions.filter(
                Q(pppoe_user__username=username) |
                Q(pppoe_user__client__user__phone_number=phone_number)
            )
        else:
            sessions = sessions.filter(
                Q(hotspot_user__client__user__phone_number=phone_number) |
                Q(pppoe_user__client__user__phone_number=phone_number)
            )

        return sessions

    def recover_session(self, session, recovery_method):
        """
        Recover a single session.
        
        Args:
            session: Session record to recover
            recovery_method: Method to use for recovery
            
        Returns:
            bool: True if recovery successful, False otherwise
        """
        try:
            if session.user_type == 'hotspot' and session.hotspot_user:
                return self.recover_hotspot_session(session.hotspot_user, recovery_method)
            elif session.user_type == 'pppoe' and session.pppoe_user:
                return self.recover_pppoe_session(session.pppoe_user, recovery_method)
            return False
        except Exception as e:
            logger.error(f"Session recovery failed for {session.id}: {str(e)}")
            session.recovery_attempted = True
            session.save()
            return False

    def recover_hotspot_session(self, hotspot_user, recovery_method):
        """
        Recover hotspot session.
        
        Args:
            hotspot_user: HotspotUser instance to recover
            recovery_method: Method to use for recovery
            
        Returns:
            bool: True if recovery successful, False otherwise
        """
        try:
            # Create new hotspot user with same parameters
            new_hotspot_user = HotspotUser.objects.create(
                router=hotspot_user.router,
                client=hotspot_user.client,
                plan=hotspot_user.plan,
                transaction=hotspot_user.transaction,
                mac=hotspot_user.mac,
                ip=hotspot_user.ip,
                active=True,
                remaining_time=hotspot_user.remaining_time
            )

            # Activate on router
            success, error = self.activate_hotspot_on_router(hotspot_user.router, new_hotspot_user)
            
            if success:
                # Mark original session as recovered
                hotspot_user.recovery_attempted = True
                hotspot_user.save()
                return True
            else:
                new_hotspot_user.delete()
                return False
        except Exception as e:
            logger.error(f"Hotspot session recovery failed: {str(e)}")
            return False

    def recover_pppoe_session(self, pppoe_user, recovery_method):
        """
        Recover PPPoE session.
        
        Args:
            pppoe_user: PPPoEUser instance to recover
            recovery_method: Method to use for recovery
            
        Returns:
            bool: True if recovery successful, False otherwise
        """
        try:
            # Create new PPPoE user with same parameters
            new_pppoe_user = PPPoEUser.objects.create(
                router=pppoe_user.router,
                client=pppoe_user.client,
                plan=pppoe_user.plan,
                transaction=pppoe_user.transaction,
                username=pppoe_user.username,
                password=pppoe_user.password,
                ip_address=pppoe_user.ip_address,
                active=True,
                remaining_time=pppoe_user.remaining_time
            )

            # Activate on router
            success, error = self.activate_pppoe_on_router(pppoe_user.router, new_pppoe_user)
            
            if success:
                # Mark original session as recovered
                pppoe_user.recovery_attempted = True
                pppoe_user.save()
                return True
            else:
                new_pppoe_user.delete()
                return False
        except Exception as e:
            logger.error(f"PPPoE session recovery failed: {str(e)}")
            return False

    def activate_hotspot_on_router(self, router, hotspot_user):
        """
        Reuse activation logic from RouterActivateUserView.
        
        Args:
            router: Router instance
            hotspot_user: HotspotUser instance to activate
            
        Returns:
            tuple: (success, error_message)
        """
        # This method should contain the same implementation as RouterActivateUserView.activate_hotspot_on_router
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                hotspot = api.get_resource("/ip/hotspot/user")

                data_limit = 0
                if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
                    try:
                        multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                        data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
                    except Exception:
                        data_limit = 0

                username = getattr(hotspot_user.client, "user", None)
                username_str = username.username if username else f"user_{hotspot_user.client.id}"

                hotspot.add(
                    name=username_str,
                    password=str(hotspot_user.client.id),
                    profile=getattr(hotspot_user.plan, "name", ""),
                    mac_address=hotspot_user.mac.lower(),
                    limit_bytes_total=data_limit
                )

                if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
                    active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
                    if active:
                        api.get_resource("/ip/hotspot/active").set(
                            id=active[0].get('id'),
                            idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
                        )

                api_pool.disconnect()
                return True, None
            return False, "Router type not supported for hotspot recovery"
        except Exception as e:
            return False, str(e)

    def activate_pppoe_on_router(self, router, pppoe_user):
        """
        Reuse activation logic from RouterActivateUserView.
        
        Args:
            router: Router instance
            pppoe_user: PPPoEUser instance to activate
            
        Returns:
            tuple: (success, error_message)
        """
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                pppoe_secret = api.get_resource("/ppp/secret")

                # Configure PPPoE secret
                pppoe_secret.add(
                    name=pppoe_user.username,
                    password=pppoe_user.password,
                    service="pppoe",
                    profile=getattr(pppoe_user.plan, "name", "default"),
                    remote_address=pppoe_user.ip_address or "dynamic"
                )

                # Set session timeout if remaining time is specified
                if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
                    profile_resource = api.get_resource("/ppp/profile")
                    profile_resource.set(
                        name=getattr(pppoe_user.plan, "name", "default"),
                        session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
                    )

                api_pool.disconnect()
                return True, None
            return False, "Router type not supported for PPPoE recovery"
        except Exception as e:
            return False, str(e)


# NEW: Bulk Operations View 
class BulkOperationsView(APIView):
    """
    API View for performing bulk operations on multiple routers.
    
    Supports operations like health checks, restarts, and status updates
    across multiple routers with asynchronous execution and progress tracking.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Initiate a bulk operation on multiple routers.
        
        Args:
            request: HTTP request object with bulk operation parameters
            
        Returns:
            Response: Operation ID and status
        """
        serializer = BulkActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        router_ids = data['router_ids']
        action = data['action']
        parameters = data.get('parameters', {})

        # Create bulk operation record
        bulk_operation = BulkOperation.objects.create(
            operation_type=action,
            initiated_by=request.user,
            status='running'
        )
        bulk_operation.routers.set(router_ids)

        # Execute bulk operation asynchronously
        self.execute_bulk_operation.delay(bulk_operation.operation_id, parameters)

        return Response({
            "operation_id": str(bulk_operation.operation_id),
            "message": "Bulk operation started",
            "status": "running"
        })

    @staticmethod
    @async_to_sync
    async def execute_bulk_operation(operation_id, parameters):
        """
        Execute bulk operation asynchronously.
        
        Args:
            operation_id: ID of the bulk operation to execute
            parameters: Additional parameters for the operation
        """
        try:
            bulk_operation = BulkOperation.objects.get(operation_id=operation_id)
            routers = bulk_operation.routers.all()
            
            results = {
                'completed': [],
                'failed': [],
                'details': {}
            }

            for router in routers:
                try:
                    if bulk_operation.operation_type == 'health_check':
                        success = await perform_router_health_check(router)
                    elif bulk_operation.operation_type == 'restart':
                        success = await restart_router(router)
                    elif bulk_operation.operation_type == 'update_status':
                        success = await update_router_status(router, parameters.get('status'))
                    else:
                        success = False

                    if success:
                        results['completed'].append(router.id)
                    else:
                        results['failed'].append(router.id)

                    results['details'][router.id] = {
                        'success': success,
                        'timestamp': timezone.now().isoformat()
                    }

                except Exception as e:
                    logger.error(f"Bulk operation failed for router {router.id}: {str(e)}")
                    results['failed'].append(router.id)
                    results['details'][router.id] = {
                        'success': False,
                        'error': str(e)
                    }

            # Update operation status
            bulk_operation.results = results
            if results['failed'] and results['completed']:
                bulk_operation.status = 'partial'
            elif results['failed']:
                bulk_operation.status = 'failed'
            else:
                bulk_operation.status = 'completed'
            
            bulk_operation.completed_at = timezone.now()
            bulk_operation.save()

            # Send WebSocket notification with proper group name
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                "bulk_operations",
                {
                    "type": "bulk_operation_complete",
                    "operation_id": str(operation_id),
                    "status": bulk_operation.status,
                    "results": results,
                    "timestamp": timezone.now().isoformat()
                }
            )

        except Exception as e:
            logger.error(f"Bulk operation execution failed: {str(e)}")


# Helper functions for bulk operations 
async def perform_router_health_check(router):
    """
    Perform health check for a router.
    
    Args:
        router: Router instance to check
        
    Returns:
        bool: True if router is healthy, False otherwise
    """
    try:
        if router.type == "mikrotik":
            api_pool = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port,
                plaintext_login=True
            )
            api = api_pool.get_api()
            system_list = api.get_resource("/system/resource").get()
            api_pool.disconnect()
            return bool(system_list)
        elif router.type == "ubiquiti":
            response = requests.get(
                f"https://{router.ip}:{router.port}/api/self",
                auth=(router.username, router.password),
                verify=False,
                timeout=10
            )
            return response.status_code == 200
        return False
    except Exception:
        return False

async def restart_router(router):
    """
    Restart a router.
    
    Args:
        router: Router instance to restart
        
    Returns:
        bool: True if restart initiated successfully, False otherwise
    """
    try:
        if router.type == "mikrotik":
            api_pool = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            )
            api = api_pool.get_api()
            api.get_resource("/system").call("reboot")
            api_pool.disconnect()
            return True
        elif router.type == "ubiquiti":
            controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
            data = {"cmd": "restart", "mac": "all"}
            response = requests.post(
                controller_url,
                json=data,
                auth=(router.username, router.password),
                verify=False,
                timeout=10
            )
            return response.status_code == 200
        return False
    except Exception:
        return False

async def update_router_status(router, status):
    """
    Update router status.
    
    Args:
        router: Router instance to update
        status: New status value
        
    Returns:
        bool: True if update successful, False otherwise
    """
    try:
        router.status = status
        router.save()
        return True
    except Exception:
        return False


# NEW: Enhanced Health Monitoring with WebSockets
class HealthMonitoringView(APIView):
    """
    API View for comprehensive router health monitoring.
    
    Provides real-time health monitoring with WebSocket updates,
    performance metrics, and health scoring for all routers.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve health information for all routers.
        
        Args:
            request: HTTP request object
            
        Returns:
            Response: Comprehensive health data for all routers
        """
        routers = Router.objects.filter(is_active=True)
        health_data = []

        for router in routers:
            try:
                health_info = self.get_router_health(router)
                health_data.append(health_info)

                # Send real-time update via WebSocket
                self.send_health_update(router, health_info)

            except Exception as e:
                logger.error(f"Health check failed for router {router.id}: {str(e)}")
                health_data.append({
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "error",
                    "error": str(e)
                })

        return Response(health_data)

    def get_router_health(self, router):
        """
        Get comprehensive health information for a router.
        
        Args:
            router: Router instance to check
            
        Returns:
            dict: Comprehensive health information
        """
        # Use Django cache
        cache_key = f"router:{router.id}:health_comprehensive"
        cached_health = cache.get(cache_key)
        
        if cached_health:
            return cached_health

        # Perform health check
        health_info = self.perform_health_check(router)
        
        # Cache for 2 minutes
        cache.set(cache_key, health_info, 120)
        
        return health_info

    def perform_health_check(self, router):
        """
        Perform detailed health check on a router.
        
        Args:
            router: Router instance to check
            
        Returns:
            dict: Detailed health information
        """
        start_time = timezone.now()
        
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    plaintext_login=True
                )
                api = api_pool.get_api()
                
                # Get comprehensive system metrics
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}
                
                # Get active sessions
                hotspot_active = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []
                
                # Get interface statistics
                interfaces = api.get_resource("/interface").get() or []
                
                api_pool.disconnect()
                response_time = (timezone.now() - start_time).total_seconds()

                # Calculate health score
                health_score = self.calculate_health_score(system, len(hotspot_active) + len(pppoe_active))
                
                system_metrics = {
                    "cpu_load": float(system.get("cpu-load", 0)),
                    "free_memory": float(system.get("free-memory", 0)),
                    "total_memory": float(system.get("total-memory", 0)),
                    "uptime": system.get("uptime", "0"),
                    "hotspot_sessions": len(hotspot_active),
                    "pppoe_sessions": len(pppoe_active),
                    "total_sessions": len(hotspot_active) + len(pppoe_active),
                    "interface_count": len(interfaces),
                    "board_name": system.get("board-name", "Unknown"),
                    "version": system.get("version", "Unknown")
                }

                # Create health check record
                health_check = RouterHealthCheck.objects.create(
                    router=router,
                    is_online=True,
                    response_time=response_time,
                    system_metrics=system_metrics,
                    health_score=health_score,
                    performance_metrics=self.get_performance_metrics(system)
                )

                return {
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "online",
                    "response_time": response_time,
                    "health_score": health_score,
                    "system_metrics": system_metrics,
                    "timestamp": start_time.isoformat()
                }

            elif router.type == "ubiquiti":
                try:
                    response = requests.get(
                        f"https://{router.ip}:{router.port}/api/self",
                        auth=(router.username, router.password),
                        verify=False,
                        timeout=10
                    )
                    ok = response.status_code == 200
                    response_time = (timezone.now() - start_time).total_seconds()

                    RouterHealthCheck.objects.create(
                        router=router,
                        is_online=ok,
                        response_time=response_time
                    )

                    return {
                        "router": router.name,
                        "router_ip": router.ip,
                        "status": "online" if ok else "offline",
                        "response_time": response_time,
                        "health_score": 100 if ok else 0,
                        "system_metrics": {},
                        "timestamp": start_time.isoformat()
                    }

                except Exception as e:
                    RouterHealthCheck.objects.create(
                        router=router,
                        is_online=False,
                        error_message=str(e)
                    )
                    return {
                        "router": router.name,
                        "router_ip": router.ip,
                        "status": "offline",
                        "error": str(e),
                        "health_score": 0,
                        "timestamp": start_time.isoformat()
                    }
            
        except Exception as e:
            # Create failed health check record
            RouterHealthCheck.objects.create(
                router=router,
                is_online=False,
                error_message=str(e),
                health_score=0
            )
            
            return {
                "router": router.name,
                "router_ip": router.ip,
                "status": "offline",
                "error": str(e),
                "health_score": 0,
                "timestamp": start_time.isoformat()
            }

    def calculate_health_score(self, system_metrics, active_sessions):
        """
        Calculate comprehensive health score (0-100).
        
        Args:
            system_metrics: System performance metrics
            active_sessions: Number of active sessions
            
        Returns:
            int: Health score between 0-100
        """
        score = 100
        
        # CPU impact (up to -30 points)
        cpu_load = float(system_metrics.get("cpu-load", 0))
        if cpu_load > 80:
            score -= 30
        elif cpu_load > 60:
            score -= 15
        elif cpu_load > 40:
            score -= 5
            
        # Memory impact (up to -20 points)
        free_memory = float(system_metrics.get("free-memory", 0))
        total_memory = float(system_metrics.get("total-memory", 1))
        memory_usage = ((total_memory - free_memory) / total_memory) * 100
        
        if memory_usage > 90:
            score -= 20
        elif memory_usage > 80:
            score -= 10
        elif memory_usage > 70:
            score -= 5
            
        # Session load impact (up to -10 points)
        if active_sessions > 100:
            score -= 10
        elif active_sessions > 50:
            score -= 5
            
        return max(0, score)

    def get_performance_metrics(self, system_metrics):
        """
        Extract performance metrics from system data.
        
        Args:
            system_metrics: Raw system metrics from router
            
        Returns:
            dict: Processed performance metrics
        """
        return {
            "cpu_usage": float(system_metrics.get("cpu-load", 0)),
            "memory_usage": self.calculate_memory_usage(system_metrics),
            "load_average": system_metrics.get("load-average", "0,0,0"),
            "architecture": system_metrics.get("architecture", "Unknown"),
            "platform": system_metrics.get("platform", "Unknown")
        }

    def calculate_memory_usage(self, system_metrics):
        """
        Calculate memory usage percentage.
        
        Args:
            system_metrics: System metrics containing memory information
            
        Returns:
            float: Memory usage percentage
        """
        free_memory = float(system_metrics.get("free-memory", 0))
        total_memory = float(system_metrics.get("total-memory", 1))
        return ((total_memory - free_memory) / total_memory) * 100

    def send_health_update(self, router, health_info):
        """
        Send real-time health update via WebSocket.
        
        Args:
            router: Router instance
            health_info: Health information to send
        """
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"router_{router.id}_health",
                {
                    "type": "health_update",
                    "router_id": router.id,
                    "health_info": health_info,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"Health WebSocket update failed: {str(e)}")


# NEW: Audit Log View (keep as is)
class RouterAuditLogView(APIView):
    """
    API View for retrieving router audit logs.
    
    Provides filtered access to router audit logs with pagination
    support for tracking all router-related activities.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve filtered audit logs for routers.
        
        Args:
            request: HTTP request object with filter parameters
            
        Returns:
            Response: Paginated audit log data
        """
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        days = int(request.query_params.get('days', 7))
        
        start_date = timezone.now() - timedelta(days=days)
        
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        page = self.paginate_queryset(logs, request)
        if page is not None:
            serializer = RouterAuditLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = RouterAuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    def paginate_queryset(self, queryset, request):
        """
        Simple pagination implementation.
        
        Args:
            queryset: QuerySet to paginate
            request: HTTP request object with pagination parameters
            
        Returns:
            list: Paginated results or None if page out of range
        """
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        if start >= len(queryset):
            return None
            
        return list(queryset[start:end])

    def get_paginated_response(self, data):
        """
        Create paginated response format.
        
        Args:
            data: Paginated data to include in response
            
        Returns:
            Response: Formatted paginated response
        """
        return Response({
            'count': len(data),
            'results': data
        })


# Keep existing views with enhancements 
class RouterStatsView(APIView):
    """
    API View for retrieving router statistics.
    
    Provides real-time and historical statistics for router performance,
    including CPU, memory, client counts, and network throughput.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a router instance by primary key.
        
        Args:
            pk: Primary key of the router
            
        Returns:
            Router: Router instance or 404 if not found
        """
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """
        Retrieve statistics for a specific router.
        
        Args:
            request: HTTP request object
            pk: Primary key of the router
            
        Returns:
            Response: Router statistics with caching
        """
        # Use Django cache
        cache_key = f"router:{pk}:stats"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        router = self.get_object(pk)
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()

                # system resource may return a list with single item
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}

                hotspot = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []  # NEW: Get PPPoE active sessions

                stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]

                # Safe numeric parsing
                def safe_float(x, default=0.0):
                    try:
                        return float(x)
                    except Exception:
                        return default

                cpu = safe_float(system.get("cpu-load", 0))
                free_mem = safe_float(system.get("free-memory", 0))
                memory_mb = free_mem / 1024 / 1024 if free_mem else 0
                uptime = system.get("uptime", "0")
                temperature = safe_float(system.get("cpu-temperature", 0))
                interfaces = api.get_resource("/interface").get() or [{}]
                rx = safe_float(interfaces[0].get("rx-byte", 0))
                throughput_mb = rx / 1024 / 1024 if rx else 0
                total_hdd = safe_float(system.get("total-hdd-space", 1))
                free_hdd = safe_float(system.get("free-hdd-space", 0))
                disk_percent = (free_hdd / total_hdd * 100) if total_hdd else 0

                # Calculate total clients (hotspot + PPPoE)
                total_clients = len(hotspot) + len(pppoe_active)

                latest_stats = {
                    "cpu": cpu,
                    "memory": memory_mb,
                    "clients": total_clients,  # UPDATED: Include PPPoE clients
                    "hotspot_clients": len(hotspot),
                    "pppoe_clients": len(pppoe_active),
                    "uptime": uptime,
                    "signal": -60,  # Placeholder; you can compute if available
                    "temperature": temperature,
                    "throughput": throughput_mb,
                    "disk": disk_percent,
                    "timestamp": timezone.now()
                }

                RouterStats.objects.create(router=router, **latest_stats)
                serializer = RouterStatsSerializer(stats, many=True)

                history = {key: [getattr(s, key) for s in stats] for key in latest_stats if key != "timestamp"}
                history["timestamps"] = [s.timestamp.strftime("%H:%M:%S") for s in stats]

                api_pool.disconnect()
                
                response_data = {"latest": latest_stats, "history": history}
                # Cache for 1 minute
                cache.set(cache_key, response_data, 60)
                
                return Response(response_data)

            elif router.type == "ubiquiti":
                response = requests.get(
                    f"https://{router.ip}:{router.port}/api/s/default/stat/sta",
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=10
                )

                data = response.json().get('data', []) if response and response.status_code == 200 else []
                clients = len(data)
                signal = sum([sta.get('signal', 0) for sta in data]) / clients if clients else 0
                throughput = sum([sta.get('rx_rate', 0) + sta.get('tx_rate', 0) for sta in data]) / 1024 / 1024 if data else 0

                latest_stats = {
                    "cpu": 0,
                    "memory": 0,
                    "clients": clients,
                    "hotspot_clients": clients,
                    "pppoe_clients": 0,
                    "uptime": "N/A",
                    "signal": signal,
                    "temperature": 0,
                    "throughput": throughput,
                    "disk": 0,
                    "timestamp": timezone.now()
                }

                RouterStats.objects.create(router=router, **latest_stats)
                
                response_data = {"latest": latest_stats, "history": {}}
                # Cache for 1 minute
                cache.set(cache_key, response_data, 60)
                
                return Response(response_data)

            return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("Error getting router stats")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RouterRebootView(APIView):
    """
    API View for rebooting routers.
    
    Provides safe router reboot functionality with proper session
    management, cache clearing, and WebSocket notifications.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a router instance by primary key.
        
        Args:
            pk: Primary key of the router
            
        Returns:
            Router: Router instance or 404 if not found
        """
        return get_object_or_404(Router, pk=pk, is_active=True)

    def post(self, request, pk):
        """
        Reboot a specific router.
        
        Args:
            request: HTTP request object
            pk: Primary key of the router to reboot
            
        Returns:
            Response: Reboot status or error message
        """
        router = self.get_object(pk)
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                api.get_resource("/system").call("reboot")
                api_pool.disconnect()

            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
                data = {"cmd": "restart", "mac": "all"}
                try:
                    requests.post(
                        controller_url,
                        json=data,
                        auth=(router.username, router.password),
                        verify=False,
                        timeout=10
                    )
                except Exception:
                    logger.exception("Ubiquiti reboot request failed")

            # Disconnect both hotspot and PPPoE users
            active_hotspot_users = HotspotUser.objects.filter(router=router, active=True)
            active_pppoe_users = PPPoEUser.objects.filter(router=router, active=True)
            
            for user in active_hotspot_users:
                user.active = False
                user.disconnected_at = timezone.now()
                user.save()

                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    hotspot_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="router_reboot",
                    user_type="hotspot"
                )

            for user in active_pppoe_users:
                user.active = False
                user.disconnected_at = timezone.now()
                user.save()

                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    pppoe_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="router_reboot",
                    user_type="pppoe"
                )

            router.status = "updating"
            router.save()

            # Clear cache using Django cache
            try:
                cache.delete_pattern(f"router:{pk}:*")
                cache.delete_pattern("routers:list:*")
            except Exception as e:
                logger.warning(f"Cache pattern deletion failed: {e}")

            # Send WebSocket update with proper group name
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "routers_global",
                    {
                        "type": "router_update",
                        "action": "router_rebooted",
                        "router_id": pk,
                        "timestamp": timezone.now().isoformat(),
                        "data": {"name": router.name}
                    }
                )
            except Exception as e:
                logger.error(f"WebSocket update failed: {str(e)}")

            return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error rebooting router")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HotspotUsersView(APIView):
    """
    API View for retrieving hotspot users for a router.
    
    Provides access to all hotspot users connected to a specific router.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a router instance by primary key.
        
        Args:
            pk: Primary key of the router
            
        Returns:
            Router: Router instance or 404 if not found
        """
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """
        Retrieve all hotspot users for a router.
        
        Args:
            request: HTTP request object
            pk: Primary key of the router
            
        Returns:
            Response: List of hotspot users
        """
        router = self.get_object(pk)
        users = HotspotUser.objects.filter(router=router).order_by('-connected_at')
        serializer = HotspotUserSerializer(users, many=True)
        return Response(serializer.data)


class HotspotUserDetailView(APIView):
    """
    API View for managing individual hotspot users.
    
    Provides operations for disconnecting specific hotspot users
    with proper session logging and router integration.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a hotspot user instance by primary key.
        
        Args:
            pk: Primary key of the hotspot user
            
        Returns:
            HotspotUser: Hotspot user instance or 404 if not found
        """
        return get_object_or_404(HotspotUser, pk=pk)

    def delete(self, request, pk):
        """
        Disconnect a hotspot user.
        
        Args:
            request: HTTP request object
            pk: Primary key of the hotspot user to disconnect
            
        Returns:
            Response: 204 No Content on success or error message
        """
        user = self.get_object(pk)
        try:
            router = user.router

            if router.type == "mikrotik":
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

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.exception("Error disconnecting user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PPPoEUsersView(APIView):
    """
    API View for retrieving PPPoE users for a router.
    
    Provides access to all PPPoE users connected to a specific router.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a router instance by primary key.
        
        Args:
            pk: Primary key of the router
            
        Returns:
            Router: Router instance or 404 if not found
        """
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """
        Retrieve all PPPoE users for a router.
        
        Args:
            request: HTTP request object
            pk: Primary key of the router
            
        Returns:
            Response: List of PPPoE users
        """
        router = self.get_object(pk)
        users = PPPoEUser.objects.filter(router=router).order_by('-connected_at')
        serializer = PPPoEUserSerializer(users, many=True)
        return Response(serializer.data)


class PPPoEUserDetailView(APIView):
    """
    API View for managing individual PPPoE users.
    
    Provides operations for disconnecting specific PPPoE users
    with proper session logging and router integration.
    """
    
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        """
        Retrieve a PPPoE user instance by primary key.
        
        Args:
            pk: Primary key of the PPPoE user
            
        Returns:
            PPPoEUser: PPPoE user instance or 404 if not found
        """
        return get_object_or_404(PPPoEUser, pk=pk)

    def delete(self, request, pk):
        """
        Disconnect a PPPoE user.
        
        Args:
            request: HTTP request object
            pk: Primary key of the PPPoE user to disconnect
            
        Returns:
            Response: 204 No Content on success or error message
        """
        user = self.get_object(pk)
        try:
            router = user.router

            if router.type == "mikrotik":
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

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.exception("Error disconnecting PPPoE user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# NEW: Get MAC Address View with Comprehensive MAC Retrieval Methods
class GetMacView(APIView):
    """
    API View for retrieving MAC addresses from various device types.
    
    Provides multiple methods for MAC address detection including:
    - ARP table lookup
    - Network interface scanning
    - Client-side JavaScript detection
    - DHCP lease analysis
    - Router API queries
    """
    
    permission_classes = [AllowAny]  # Allow access for device detection

    def get(self, request):
        """
        Retrieve MAC address using multiple detection methods.
        
        Args:
            request: HTTP request object with detection parameters
            
        Returns:
            Response: MAC address information or error
        """
        client_ip = self.get_client_ip(request)
        method = request.query_params.get('method', 'auto')
        
        try:
            mac_address = None
            detection_method = "unknown"
            
            if method == 'arp' or method == 'auto':
                mac_address, detection_method = self.get_mac_via_arp(client_ip)
                
            if not mac_address and (method == 'interface' or method == 'auto'):
                mac_address, detection_method = self.get_mac_via_interface()
                
            if not mac_address and (method == 'router_api' or method == 'auto'):
                mac_address, detection_method = self.get_mac_via_router_api(client_ip)
                
            if not mac_address and (method == 'dhcp' or method == 'auto'):
                mac_address, detection_method = self.get_mac_via_dhcp(client_ip)
            
            if mac_address:
                return Response({
                    'mac_address': mac_address,
                    'client_ip': client_ip,
                    'detection_method': detection_method,
                    'timestamp': timezone.now().isoformat()
                })
            else:
                return Response({
                    'error': 'Could not detect MAC address',
                    'client_ip': client_ip,
                    'available_methods': self.get_available_methods(),
                    'suggestions': self.get_detection_suggestions()
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"MAC address detection failed: {str(e)}")
            return Response({
                'error': 'MAC address detection failed',
                'client_ip': client_ip,
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_client_ip(self, request):
        """
        Extract client IP address from request.
        
        Args:
            request: HTTP request object
            
        Returns:
            str: Client IP address
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_mac_via_arp(self, ip_address):
        """
        Retrieve MAC address using ARP table lookup.
        
        Args:
            ip_address: Client IP address to look up
            
        Returns:
            tuple: (mac_address, method) or (None, 'arp_failed')
        """
        try:
            # Method 1: Using system ARP table
            import subprocess
            result = subprocess.run(['arp', '-a', ip_address], 
                                  capture_output=True, text=True, timeout=5)
            
            if result.returncode == 0 and result.stdout:
                # Parse ARP output for MAC address
                lines = result.stdout.split('\n')
                for line in lines:
                    if ip_address in line:
                        parts = line.split()
                        for part in parts:
                            if ':' in part and len(part) == 17:  # MAC format
                                return part.lower(), 'arp_table'
            
            # Method 2: Using /proc/net/arp on Linux
            try:
                with open('/proc/net/arp', 'r') as f:
                    for line in f.readlines()[1:]:  # Skip header
                        parts = line.split()
                        if len(parts) >= 4 and parts[0] == ip_address:
                            return parts[3].lower(), 'proc_arp'
            except (FileNotFoundError, PermissionError):
                pass
                
            return None, 'arp_failed'
            
        except Exception as e:
            logger.warning(f"ARP method failed for {ip_address}: {str(e)}")
            return None, 'arp_failed'

    def get_mac_via_interface(self):
        """
        Retrieve MAC address from network interfaces.
        
        Returns:
            tuple: (mac_address, method) or (None, 'interface_failed')
        """
        try:
            import uuid
            # Get MAC address of the machine
            mac = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                           for elements in range(0, 8*6, 8)][::-1])
            return mac, 'system_interface'
        except Exception as e:
            logger.warning(f"Interface method failed: {str(e)}")
            return None, 'interface_failed'

    def get_mac_via_router_api(self, ip_address):
        """
        Retrieve MAC address via router API queries.
        
        Args:
            ip_address: Client IP address to look up
            
        Returns:
            tuple: (mac_address, method) or (None, 'router_api_failed')
        """
        try:
            # Try to find MAC in connected routers
            routers = Router.objects.filter(is_active=True, status='connected')
            
            for router in routers:
                try:
                    if router.type == "mikrotik":
                        api_pool = RouterOsApiPool(
                            router.ip,
                            username=router.username,
                            password=router.password,
                            port=router.port
                        )
                        api = api_pool.get_api()
                        
                        # Check ARP table
                        arp_entries = api.get_resource("/ip/arp").get()
                        for entry in arp_entries:
                            if entry.get('address') == ip_address:
                                mac = entry.get('mac-address', '').lower()
                                api_pool.disconnect()
                                if mac:
                                    return mac, f'router_{router.id}_arp'
                        
                        # Check DHCP leases
                        dhcp_leases = api.get_resource("/ip/dhcp-server/lease").get()
                        for lease in dhcp_leases:
                            if lease.get('address') == ip_address:
                                mac = lease.get('mac-address', '').lower()
                                api_pool.disconnect()
                                if mac:
                                    return mac, f'router_{router.id}_dhcp'
                        
                        api_pool.disconnect()
                        
                    elif router.type == "ubiquiti":
                        # Ubiquiti API for client MAC lookup
                        controller_url = f"https://{router.ip}:{router.port}/api/s/default/stat/sta"
                        response = requests.get(
                            controller_url,
                            auth=(router.username, router.password),
                            verify=False,
                            timeout=10
                        )
                        
                        if response.status_code == 200:
                            clients = response.json().get('data', [])
                            for client in clients:
                                if client.get('ip') == ip_address:
                                    mac = client.get('mac', '').lower()
                                    if mac:
                                        return mac, f'router_{router.id}_clients'
                                        
                except Exception as e:
                    logger.warning(f"Router {router.id} API query failed: {str(e)}")
                    continue
                    
            return None, 'router_api_failed'
            
        except Exception as e:
            logger.warning(f"Router API method failed: {str(e)}")
            return None, 'router_api_failed'

    def get_mac_via_dhcp(self, ip_address):
        """
        Retrieve MAC address from DHCP server logs/leases.
        
        Args:
            ip_address: Client IP address to look up
            
        Returns:
            tuple: (mac_address, method) or (None, 'dhcp_failed')
        """
        try:
            # Common DHCP lease file locations
            dhcp_files = [
                '/var/lib/dhcp/dhcpd.leases',
                '/var/lib/dhcpd/dhcpd.leases',
                '/var/db/dhcpd.leases',
                '/var/lib/misc/dnsmasq.leases',
                '/tmp/dhcp.leases'
            ]
            
            for dhcp_file in dhcp_files:
                try:
                    with open(dhcp_file, 'r') as f:
                        content = f.read()
                        # Simple parsing for IP-MAC mapping
                        import re
                        pattern = rf'lease {re.escape(ip_address)}.*?hardware ethernet ([0-9a-fA-F:]{{17}})'
                        match = re.search(pattern, content, re.DOTALL)
                        if match:
                            return match.group(1).lower(), f'dhcp_file_{dhcp_file}'
                except (FileNotFoundError, PermissionError):
                    continue
                    
            return None, 'dhcp_failed'
            
        except Exception as e:
            logger.warning(f"DHCP method failed: {str(e)}")
            return None, 'dhcp_failed'

    def get_available_methods(self):
        """
        Get list of available MAC detection methods.
        
        Returns:
            list: Available detection methods
        """
        methods = [
            {'name': 'arp', 'description': 'System ARP table lookup'},
            {'name': 'interface', 'description': 'Network interface scanning'},
            {'name': 'router_api', 'description': 'Router API queries'},
            {'name': 'dhcp', 'description': 'DHCP lease analysis'},
            {'name': 'client_js', 'description': 'Client-side JavaScript detection'}
        ]
        return methods

    def get_detection_suggestions(self):
        """
        Get suggestions for MAC address detection.
        
        Returns:
            dict: Detection suggestions
        """
        return {
            'client_side': 'Use JavaScript to detect MAC address from browser',
            'network_admin': 'Check router administration interface',
            'mobile_app': 'Use device-specific APIs in mobile applications',
            'manual_entry': 'Allow manual MAC address entry by user'
        }

    def post(self, request):
        """
        Handle client-side MAC address submission.
        
        Args:
            request: HTTP request object with MAC address data
            
        Returns:
            Response: Submission result
        """
        mac_address = request.data.get('mac_address', '').lower().strip()
        client_ip = self.get_client_ip(request)
        
        if not self.is_valid_mac(mac_address):
            return Response({
                'error': 'Invalid MAC address format',
                'valid_format': 'XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store the MAC address with client IP and timestamp
        cache_key = f"mac_detection:{client_ip}"
        cache.set(cache_key, {
            'mac_address': mac_address,
            'detection_method': 'client_submission',
            'timestamp': timezone.now().isoformat()
        }, 3600)  # Cache for 1 hour
        
        return Response({
            'message': 'MAC address received successfully',
            'mac_address': mac_address,
            'client_ip': client_ip,
            'timestamp': timezone.now().isoformat()
        })

    def is_valid_mac(self, mac_address):
        """
        Validate MAC address format.
        
        Args:
            mac_address: MAC address to validate
            
        Returns:
            bool: True if valid MAC format
        """
        import re
        patterns = [
            r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
            r'^([0-9A-Fa-f]{12})$'
        ]
        return any(re.match(pattern, mac_address) for pattern in patterns)


# NEW: Missing Views from Original Code
class HotspotConfigView(APIView):
    """
    API View for managing hotspot configuration on routers.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        router = self.get_object(pk)
        # Implementation for getting hotspot configuration
        return Response({"message": "Hotspot config endpoint", "router": router.name})

    def post(self, request, pk):
        router = self.get_object(pk)
        # Implementation for updating hotspot configuration
        return Response({"message": "Hotspot config updated", "router": router.name})


class PPPoEConfigView(APIView):
    """
    API View for managing PPPoE configuration on routers.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        router = self.get_object(pk)
        # Implementation for getting PPPoE configuration
        return Response({"message": "PPPoE config endpoint", "router": router.name})

    def post(self, request, pk):
        router = self.get_object(pk)
        # Implementation for updating PPPoE configuration
        return Response({"message": "PPPoE config updated", "router": router.name})


class BulkActionView(APIView):
    """
    API View for performing bulk actions on routers.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Implementation for bulk actions
        return Response({"message": "Bulk action processed"})


class RouterHealthCheckView(APIView):
    """
    API View for router health checks.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Implementation for health checks
        return Response({"message": "Health check endpoint"})


class RestoreSessionsView(APIView):
    """
    API View for restoring user sessions.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        router = get_object_or_404(Router, pk=pk, is_active=True)
        # Implementation for session restoration
        return Response({"message": "Sessions restored", "router": router.name})


class UserSessionRecoveryView(APIView):
    """
    API View for user session recovery.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Implementation for user session recovery
        return Response({"message": "User session recovery endpoint"})


class RouterCallbackConfigListView(APIView):
    """
    API View for listing router callback configurations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        router = get_object_or_404(Router, pk=pk, is_active=True)
        configs = RouterCallbackConfig.objects.filter(router=router)
        serializer = RouterCallbackConfigSerializer(configs, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        router = get_object_or_404(Router, pk=pk, is_active=True)
        serializer = RouterCallbackConfigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(router=router)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RouterCallbackConfigDetailView(APIView):
    """
    API View for managing individual router callback configurations.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, callback_pk):
        router = get_object_or_404(Router, pk=pk, is_active=True)
        return get_object_or_404(RouterCallbackConfig, pk=callback_pk, router=router)

    def get(self, request, pk, callback_pk):
        config = self.get_object(pk, callback_pk)
        serializer = RouterCallbackConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request, pk, callback_pk):
        config = self.get_object(pk, callback_pk)
        serializer = RouterCallbackConfigSerializer(config, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, callback_pk):
        config = self.get_object(pk, callback_pk)
        config.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

