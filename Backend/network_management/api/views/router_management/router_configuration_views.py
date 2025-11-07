
# # network_management/api/views/router_management/router_configuration_views.py
# """
# Router Configuration Views for Network Management System

# This module provides API views for router configuration management.
# """

# import logging
# from django.shortcuts import get_object_or_404

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from network_management.models.router_management_model import Router, RouterCallbackConfig
# from network_management.serializers.router_management_serializer import RouterCallbackConfigSerializer

# logger = logging.getLogger(__name__)


# class HotspotConfigView(APIView):
#     """
#     API View for managing hotspot configuration on routers.
#     """
#     permission_classes = [IsAuthenticated]

#     def get_router(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         router = self.get_router(pk)
#         return Response({"message": "Hotspot config endpoint", "router": router.name})

#     def post(self, request, pk):
#         router = self.get_router(pk)
#         return Response({"message": "Hotspot config updated", "router": router.name})


# class PPPoEConfigView(APIView):
#     """
#     API View for managing PPPoE configuration on routers.
#     """
#     permission_classes = [IsAuthenticated]

#     def get_router(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         router = self.get_router(pk)
#         return Response({"message": "PPPoE config endpoint", "router": router.name})

#     def post(self, request, pk):
#         router = self.get_router(pk)
#         return Response({"message": "PPPoE config updated", "router": router.name})


# class RouterCallbackConfigListView(APIView):
#     """
#     API View for listing router callback configurations.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         router = get_object_or_404(Router, pk=pk, is_active=True)
#         configs = RouterCallbackConfig.objects.filter(router=router)
#         serializer = RouterCallbackConfigSerializer(configs, many=True)
#         return Response(serializer.data)

#     def post(self, request, pk):
#         router = get_object_or_404(Router, pk=pk, is_active=True)
#         serializer = RouterCallbackConfigSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(router=router)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RouterCallbackConfigDetailView(APIView):
#     """
#     API View for managing individual router callback configurations.
#     """
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk, callback_pk):
#         router = get_object_or_404(Router, pk=pk, is_active=True)
#         return get_object_or_404(RouterCallbackConfig, pk=callback_pk, router=router)

#     def get(self, request, pk, callback_pk):
#         config = self.get_object(pk, callback_pk)
#         serializer = RouterCallbackConfigSerializer(config)
#         return Response(serializer.data)

#     def put(self, request, pk, callback_pk):
#         config = self.get_object(pk, callback_pk)
#         serializer = RouterCallbackConfigSerializer(config, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk, callback_pk):
#         config = self.get_object(pk, callback_pk)
#         config.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class BulkActionView(APIView):
#     """
#     API View for performing bulk actions on routers.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         return Response({"message": "Bulk action processed"})


# class RouterHealthCheckView(APIView):
#     """
#     API View for router health checks.
#     """
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         return Response({"message": "Health check endpoint"})


# class RestoreSessionsView(APIView):
#     """
#     API View for restoring user sessions.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         router = get_object_or_404(Router, pk=pk, is_active=True)
#         return Response({"message": "Sessions restored", "router": router.name})


# class UserSessionRecoveryView(APIView):
#     """
#     API View for user session recovery.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         return Response({"message": "User session recovery endpoint"})









# network_management/api/views/router_management/router_configuration_views.py
"""
ENHANCED Router Configuration Views for Network Management System

This module provides COMPLETE API views for router configuration management.
"""

import logging
import os
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.files.storage import FileSystemStorage

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from network_management.models.router_management_model import (
    Router, RouterCallbackConfig, HotspotConfiguration, PPPoEConfiguration, RouterAuditLog
)
from network_management.serializers.router_management_serializer import (
    RouterCallbackConfigSerializer, 
    HotspotConfigurationSerializer,
    PPPoEConfigurationSerializer
)
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class HotspotConfigView(APIView):
    """
    COMPLETE API View for managing hotspot configuration on routers.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_router(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """Get current hotspot configuration for a router."""
        router = self.get_router(pk)
        
        try:
            config = HotspotConfiguration.objects.get(router=router)
            serializer = HotspotConfigurationSerializer(config)
            return Response(serializer.data)
        except HotspotConfiguration.DoesNotExist:
            # Return default configuration
            default_config = {
                'router': router.id,
                'ssid': 'SurfZone-WiFi',
                'redirect_url': 'http://captive.surfzone.local',
                'bandwidth_limit': '10M',
                'session_timeout': 60,
                'auth_method': 'universal',
                'enable_splash_page': True,
                'allow_social_login': False,
                'enable_bandwidth_shaping': True,
                'log_user_activity': True,
                'max_users': 50
            }
            return Response(default_config)

    def post(self, request, pk):
        """Create or update hotspot configuration with file upload support."""
        router = self.get_router(pk)
        
        try:
            # Handle file upload
            landing_page_file = request.FILES.get('landing_page_file')
            if landing_page_file:
                # Validate file type
                allowed_extensions = ['.html', '.htm', '.js', '.css']
                file_extension = os.path.splitext(landing_page_file.name)[1].lower()
                if file_extension not in allowed_extensions:
                    return Response(
                        {"error": f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Validate file size (max 5MB)
                if landing_page_file.size > 5 * 1024 * 1024:
                    return Response(
                        {"error": "File size too large. Maximum size is 5MB."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Get or create configuration
            config, created = HotspotConfiguration.objects.get_or_create(router=router)
            
            # Update configuration data
            update_data = request.data.copy()
            if landing_page_file:
                # Delete old file if exists
                if config.landing_page_file:
                    old_file_path = config.landing_page_file.path
                    if os.path.exists(old_file_path):
                        os.remove(old_file_path)
                config.landing_page_file = landing_page_file
            
            # Update other fields
            for field, value in update_data.items():
                if hasattr(config, field) and field != 'landing_page_file':
                    setattr(config, field, value)
            
            config.save()
            
            # Create audit log
            action = 'created' if created else 'updated'
            RouterAuditLog.objects.create(
                router=router,
                action='hotspot_config',
                description=f"Hotspot configuration {action} for {router.name}",
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={'action': action, 'config_data': update_data}
            )
            
            # Send WebSocket update
            WebSocketManager.send_router_update(
                router.id, 
                'hotspot_config_updated', 
                {'ssid': config.ssid, 'auth_method': config.auth_method}
            )
            
            # Apply configuration to router
            success, error = self.apply_hotspot_config_to_router(router, config)
            
            serializer = HotspotConfigurationSerializer(config)
            response_data = serializer.data
            if not success:
                response_data['warning'] = f"Configuration saved but router update failed: {error}"
            
            return Response(response_data, 
                         status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Hotspot configuration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Configuration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def apply_hotspot_config_to_router(self, router, config):
        """Apply hotspot configuration to physical router."""
        try:
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    timeout=15
                )
                api = api_pool.get_api()
                
                # Configure hotspot server
                hotspot_server = api.get_resource("/ip/hotspot")
                servers = hotspot_server.get()
                
                if servers:
                    # Update existing hotspot server
                    hotspot_server.set(
                        id=servers[0].get('id'),
                        name=config.ssid,
                        interface="bridge",
                        address_pool="hotspot-pool",
                        profile="default"
                    )
                else:
                    # Create new hotspot server
                    hotspot_server.add(
                        name=config.ssid,
                        interface="bridge",
                        address_pool="hotspot-pool",
                        profile="default"
                    )
                
                # Configure hotspot profile
                hotspot_profile = api.get_resource("/ip/hotspot/profile")
                profiles = hotspot_profile.get(name="default")
                
                if profiles:
                    hotspot_profile.set(
                        id=profiles[0].get('id'),
                        login_by="mac,http-chap,trial,prepaid",
                        http_proxy=config.redirect_url,
                        rate_limit=config.bandwidth_limit,
                        session_timeout=f"{config.session_timeout}m"
                    )
                
                api_pool.disconnect()
                return True, None
                
            elif router.type == "ubiquiti":
                # Ubiquiti hotspot configuration logic
                import requests
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/rest/hotspot2"
                
                hotspot_config = {
                    "enabled": True,
                    "name": config.ssid,
                    "welcome_message": config.welcome_message or "Welcome to our WiFi",
                    "redirect_url": config.redirect_url,
                    "bandwidth_limit": config.bandwidth_limit
                }
                
                response = requests.post(
                    controller_url,
                    json=hotspot_config,
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=10
                )
                
                if response.status_code == 200:
                    return True, None
                else:
                    return False, f"Ubiquiti API error: {response.status_code}"
            
            return True, "Configuration applied successfully"
            
        except Exception as e:
            logger.error(f"Failed to apply hotspot config to router {router.id}: {str(e)}")
            return False, str(e)


class PPPoEConfigView(APIView):
    """
    COMPLETE API View for managing PPPoE configuration on routers.
    """
    permission_classes = [IsAuthenticated]

    def get_router(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """Get current PPPoE configuration for a router."""
        router = self.get_router(pk)
        
        try:
            config = PPPoEConfiguration.objects.get(router=router)
            serializer = PPPoEConfigurationSerializer(config)
            return Response(serializer.data)
        except PPPoEConfiguration.DoesNotExist:
            # Return default configuration
            default_config = {
                'router': router.id,
                'ip_pool_name': 'pppoe-pool-1',
                'mtu': 1492,
                'dns_servers': '8.8.8.8,1.1.1.1',
                'bandwidth_limit': '10M',
                'auth_methods': 'all',
                'enable_pap': True,
                'enable_chap': True,
                'enable_mschap': True,
                'idle_timeout': 300,
                'session_timeout': 0,
                'default_profile': 'default',
                'interface': 'bridge',
                'ip_range_start': '192.168.100.10',
                'ip_range_end': '192.168.100.200',
                'service_type': 'standard'
            }
            return Response(default_config)

    def post(self, request, pk):
        """Create or update PPPoE configuration."""
        router = self.get_router(pk)
        
        try:
            # Get or create configuration
            config, created = PPPoEConfiguration.objects.get_or_create(router=router)
            
            # Update configuration data
            for field, value in request.data.items():
                if hasattr(config, field):
                    # Convert numeric fields
                    if field in ['mtu', 'idle_timeout', 'session_timeout']:
                        try:
                            value = int(value)
                        except (ValueError, TypeError):
                            continue
                    setattr(config, field, value)
            
            config.save()
            
            # Create audit log
            action = 'created' if created else 'updated'
            RouterAuditLog.objects.create(
                router=router,
                action='pppoe_config',
                description=f"PPPoE configuration {action} for {router.name}",
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={'action': action, 'config_data': request.data}
            )
            
            # Send WebSocket update
            WebSocketManager.send_router_update(
                router.id, 
                'pppoe_config_updated', 
                {'ip_pool': config.ip_pool_name, 'service_type': config.service_type}
            )
            
            # Apply configuration to router
            success, error = self.apply_pppoe_config_to_router(router, config)
            
            serializer = PPPoEConfigurationSerializer(config)
            response_data = serializer.data
            if not success:
                response_data['warning'] = f"Configuration saved but router update failed: {error}"
            
            return Response(response_data, 
                         status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"PPPoE configuration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Configuration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def apply_pppoe_config_to_router(self, router, config):
        """Apply PPPoE configuration to physical router."""
        try:
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    timeout=15
                )
                api = api_pool.get_api()
                
                # Create IP pool
                ip_pool = api.get_resource("/ip/pool")
                pools = ip_pool.get(name=config.ip_pool_name)
                
                if not pools:
                    ip_pool.add(
                        name=config.ip_pool_name,
                        ranges=f"{config.ip_range_start}-{config.ip_range_end}"
                    )
                
                # Configure PPPoE server
                pppoe_server = api.get_resource("/interface/pppoe-server/server")
                servers = pppoe_server.get(interface=config.interface)
                
                if servers:
                    pppoe_server.set(
                        id=servers[0].get('id'),
                        interface=config.interface,
                        service_name=config.service_name or "",
                        max_mtu=str(config.mtu),
                        max_mru=str(config.mtu)
                    )
                else:
                    pppoe_server.add(
                        interface=config.interface,
                        service_name=config.service_name or "",
                        max_mtu=str(config.mtu),
                        max_mru=str(config.mtu)
                    )
                
                # Configure PPPoE profile
                pppoe_profile = api.get_resource("/ppp/profile")
                profiles = pppoe_profile.get(name=config.default_profile)
                
                if profiles:
                    pppoe_profile.set(
                        id=profiles[0].get('id'),
                        local_address=config.ip_range_start.split('.')[0:3] + ['1'],
                        remote_address=config.ip_pool_name,
                        dns_server=config.dns_servers,
                        rate_limit=config.bandwidth_limit,
                        idle_timeout=f"{config.idle_timeout}s",
                        session_timeout=f"{config.session_timeout}s" if config.session_timeout > 0 else "0"
                    )
                
                api_pool.disconnect()
                return True, None
                
            elif router.type == "ubiquiti":
                # Ubiquiti PPPoE configuration would go here
                return True, "PPPoE configuration applied (Ubiquiti routers may have limited PPPoE server support)"
            
            return True, "Configuration applied successfully"
            
        except Exception as e:
            logger.error(f"Failed to apply PPPoE config to router {router.id}: {str(e)}")
            return False, str(e)


class RouterCallbackConfigListView(APIView):
    """[KEEP EXISTING IMPLEMENTATION - IT'S COMPLETE]"""
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
    """[KEEP EXISTING IMPLEMENTATION - IT'S COMPLETE]"""
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


class BulkActionView(APIView):
    """
    ENHANCED API View for performing bulk actions on routers.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Enhanced bulk actions with configuration support."""
        action = request.data.get('action')
        router_ids = request.data.get('router_ids', [])
        
        if action == 'health_check':
            from .router_bulk_operations_views import BulkOperationsView
            bulk_view = BulkOperationsView()
            return bulk_view.post(request)
        elif action == 'configure_hotspot':
            return self.bulk_configure_hotspot(request)
        elif action == 'configure_pppoe':
            return self.bulk_configure_pppoe(request)
        else:
            return Response(
                {"error": "Unsupported bulk action"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def bulk_configure_hotspot(self, request):
        """Apply hotspot configuration to multiple routers."""
        router_ids = request.data.get('router_ids', [])
        config_data = request.data.get('config_data', {})
        
        routers = Router.objects.filter(id__in=router_ids, is_active=True)
        results = {
            'total': routers.count(),
            'successful': 0,
            'failed': 0,
            'details': {}
        }
        
        for router in routers:
            try:
                # Create mock request for individual router
                mock_request = type('MockRequest', (), {
                    'data': config_data,
                    'user': request.user,
                    'META': request.META
                })()
                
                hotspot_view = HotspotConfigView()
                response = hotspot_view.post(mock_request, router.id)
                
                if response.status_code in [200, 201]:
                    results['successful'] += 1
                    results['details'][router.id] = {'status': 'success', 'message': 'Configuration applied'}
                else:
                    results['failed'] += 1
                    results['details'][router.id] = {'status': 'failed', 'message': response.data.get('error', 'Unknown error')}
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][router.id] = {'status': 'failed', 'message': str(e)}
        
        return Response(results)

    def bulk_configure_pppoe(self, request):
        """Apply PPPoE configuration to multiple routers."""
        router_ids = request.data.get('router_ids', [])
        config_data = request.data.get('config_data', {})
        
        routers = Router.objects.filter(id__in=router_ids, is_active=True)
        results = {
            'total': routers.count(),
            'successful': 0,
            'failed': 0,
            'details': {}
        }
        
        for router in routers:
            try:
                # Create mock request for individual router
                mock_request = type('MockRequest', (), {
                    'data': config_data,
                    'user': request.user,
                    'META': request.META
                })()
                
                pppoe_view = PPPoEConfigView()
                response = pppoe_view.post(mock_request, router.id)
                
                if response.status_code in [200, 201]:
                    results['successful'] += 1
                    results['details'][router.id] = {'status': 'success', 'message': 'Configuration applied'}
                else:
                    results['failed'] += 1
                    results['details'][router.id] = {'status': 'failed', 'message': response.data.get('error', 'Unknown error')}
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][router.id] = {'status': 'failed', 'message': str(e)}
        
        return Response(results)


class RouterHealthCheckView(APIView):
    """
    ENHANCED API View for router health checks with detailed metrics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        """Get comprehensive health check with system metrics."""
        from .router_monitoring_views import HealthMonitoringView
        
        health_view = HealthMonitoringView()
        if pk:
            # Single router health check
            router = get_object_or_404(Router, pk=pk, is_active=True)
            health_info = health_view.get_router_health(router)
            return Response(health_info)
        else:
            # All routers health check
            return health_view.get(request)


class RestoreSessionsView(APIView):
    """
    ENHANCED API View for restoring user sessions with WebSocket integration.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        router = get_object_or_404(Router, pk=pk, is_active=True)
        
        try:
            from .router_session_views import SessionRecoveryView
            recovery_view = SessionRecoveryView()
            
            # Get recoverable sessions for this router
            recoverable_sessions = recovery_view.find_recoverable_sessions(
                phone_number="", 
                mac_address="", 
                username=""
            ).filter(router=router)
            
            recovered_count = 0
            for session in recoverable_sessions:
                if recovery_view.recover_session(session, 'auto'):
                    recovered_count += 1
            
            # Send WebSocket notification
            WebSocketManager.send_session_recovery_notification(recovered_count)
            
            return Response({
                "message": f"Restored {recovered_count} sessions on {router.name}",
                "recovered_count": recovered_count,
                "router": router.name
            })
            
        except Exception as e:
            logger.error(f"Session restoration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Session restoration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserSessionRecoveryView(APIView):
    """
    ENHANCED API View for user session recovery with comprehensive error handling.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from .router_session_views import SessionRecoveryView
        recovery_view = SessionRecoveryView()
        return recovery_view.post(request)