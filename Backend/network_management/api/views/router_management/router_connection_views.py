
# network_management/api/views/router_management/router_connection_views.py
"""
Enhanced Router Connection Management API Views - PRODUCTION READY

This module provides comprehensive API endpoints for MikroTik router connection testing,
automated configuration, and connection management with proper imports and error handling.
"""

import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.db import models

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.utils.mikrotik_connector import (
    MikroTikConnector, 
    MikroTikConnectionManager
)
from network_management.models.router_management_model import (
    Router, RouterAuditLog, RouterConnectionTest
)
from network_management.serializers.router_management_serializer import (
    RouterConnectionTestSerializer,
    ConnectionTestRequestSerializer,
    AutoConfigurationRequestSerializer
)
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class TestRouterConnectionView(APIView):
    """
    COMPREHENSIVE API View for testing router connections with detailed diagnostics.
    Supports both existing routers and new connection testing.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Test router connection with comprehensive diagnostics.
        
        Request Body:
            - For existing router: {"router_id": 123}
            - For new connection: {"ip": "192.168.1.1", "username": "admin", "password": "password", "port": 8728}
        """
        serializer = ConnectionTestRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        router_id = data.get('router_id')
        
        if router_id:
            # Test connection for existing router
            return self.test_existing_router(request, router_id)
        else:
            # Test connection with provided credentials
            return self.test_new_connection(request, data)

    def test_existing_router(self, request, router_id):
        """Test connection for an existing router in the system."""
        try:
            router = get_object_or_404(Router, id=router_id, is_active=True)
            
            # Test connection using router's stored credentials
            connector = MikroTikConnector(
                ip=router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            )
            
            test_results = connector.test_connection()
            
            # Save connection test results
            connection_test = RouterConnectionTest.objects.create(
                router=router,
                success=test_results.get('system_access', False),
                response_time=test_results.get('response_time'),
                system_info=test_results.get('system_info', {}),
                error_messages=test_results.get('error_messages', []),
                tested_by=request.user
            )
            
            # Update router connection status
            if test_results.get('system_access'):
                router.connection_status = 'connected'
                router.last_connection_test = timezone.now()
                # Update system info if available
                if test_results.get('system_info'):
                    router.firmware_version = test_results['system_info'].get('version', router.firmware_version)
            else:
                router.connection_status = 'disconnected'
            
            router.save()
            
            # Create audit log
            RouterAuditLog.objects.create(
                router=router,
                action='connection_test',
                description=f"Connection test {'succeeded' if test_results.get('system_access') else 'failed'}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={
                    'success': test_results.get('system_access', False),
                    'response_time': test_results.get('response_time'),
                    'error_messages': test_results.get('error_messages', [])
                }
            )
            
            # Send WebSocket update
            WebSocketManager.send_router_update(
                router.id, 
                'connection_test_completed', 
                {
                    'success': test_results.get('system_access', False),
                    'response_time': test_results.get('response_time'),
                    'router_status': router.connection_status
                }
            )
            
            serializer = RouterConnectionTestSerializer(connection_test)
            return Response({
                'router': {
                    'id': router.id,
                    'name': router.name,
                    'ip': router.ip
                },
                'test_results': test_results,
                'connection_test': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Connection test failed for router {router_id}: {str(e)}")
            return Response(
                {"error": f"Connection test failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def test_new_connection(self, request, data):
        """Test connection with provided credentials for a new router."""
        try:
            ip = data.get('ip')
            username = data.get('username')
            password = data.get('password')
            port = data.get('port', 8728)
            
            # Test connection using provided credentials
            test_results = MikroTikConnectionManager.test_router_connection(
                ip, username, password, port
            )
            
            # Validate credentials and get capabilities
            validation_results = MikroTikConnectionManager.validate_router_credentials(
                ip, username, password, port
            )
            
            response_data = {
                'connection_test': test_results,
                'credential_validation': validation_results,
                'recommended_configuration': self.get_recommended_configuration(validation_results)
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"New connection test failed for {data.get('ip')}: {str(e)}")
            return Response(
                {"error": f"Connection test failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_recommended_configuration(self, validation_results):
        """Get recommended configuration based on router capabilities."""
        if not validation_results.get('valid'):
            return {}
        
        capabilities = validation_results.get('capabilities', {})
        templates = MikroTikConnectionManager.get_connection_templates()
        
        recommendations = []
        
        if capabilities.get('wireless_support'):
            recommendations.append({
                'type': 'hotspot',
                'template': templates['public_wifi'],
                'reason': 'Router has wireless capabilities suitable for public WiFi'
            })
        
        if capabilities.get('pppoe_support'):
            recommendations.append({
                'type': 'pppoe', 
                'template': templates['isp_pppoe'],
                'reason': 'Router supports PPPoE server configuration'
            })
        
        if capabilities.get('advanced_qos'):
            recommendations.append({
                'type': 'enterprise',
                'template': templates['enterprise_hotspot'],
                'reason': 'Router has advanced capabilities suitable for enterprise use'
            })
        
        return {
            'recommendations': recommendations,
            'capabilities': capabilities
        }

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')


class AutoConfigureRouterView(APIView):
    """
    COMPREHENSIVE API View for automated router configuration with dynamic SSID support.
    Supports both hotspot and PPPoE configuration with template-based setup.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        """
        Automatically configure a router with the specified configuration.
        
        Request Body:
            - configuration_type: "hotspot" or "pppoe"
            - ssid: (for hotspot) Dynamic SSID name
            - configuration_template: Template name or custom configuration
            - auto_detect: Whether to auto-detect optimal configuration
        """
        serializer = AutoConfigurationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        router_id = pk or data.get('router_id')
        
        if not router_id:
            return Response(
                {"error": "router_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            router = get_object_or_404(Router, id=router_id, is_active=True)
            configuration_type = data.get('configuration_type', 'hotspot')
            
            # Test connection first
            connector = MikroTikConnector(
                ip=router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            )
            
            connection_test = connector.test_connection()
            if not connection_test.get('system_access'):
                return Response(
                    {"error": "Router is not accessible. Please check connection."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get configuration parameters
            config_params = self.get_configuration_parameters(data, router, configuration_type)
            
            # Execute configuration
            if configuration_type == 'hotspot':
                success, message, configuration = connector.configure_hotspot(**config_params)
            elif configuration_type == 'pppoe':
                success, message, configuration = connector.configure_pppoe(**config_params)
            else:
                return Response(
                    {"error": "Invalid configuration type. Use 'hotspot' or 'pppoe'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update router configuration
            self.update_router_configuration(router, configuration_type, config_params, configuration)
            
            # Create audit log
            RouterAuditLog.objects.create(
                router=router,
                action='auto_configure',
                description=f"Auto-configured {configuration_type} on {router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={
                    'configuration_type': configuration_type,
                    'parameters': config_params,
                    'success': success,
                    'message': message,
                    'configuration_details': configuration
                }
            )
            
            # Send WebSocket notification
            WebSocketManager.send_router_update(
                router.id, 
                'auto_configuration_completed', 
                {
                    'configuration_type': configuration_type,
                    'success': success,
                    'message': message,
                    'ssid': config_params.get('ssid') if configuration_type == 'hotspot' else None
                }
            )
            
            return Response({
                'success': success,
                'message': message,
                'router': {
                    'id': router.id,
                    'name': router.name,
                    'ip': router.ip
                },
                'configuration_type': configuration_type,
                'configuration_details': configuration,
                'parameters_used': config_params
            })
            
        except Exception as e:
            logger.error(f"Auto-configuration failed for router {router_id}: {str(e)}")
            return Response(
                {"error": f"Auto-configuration failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_configuration_parameters(self, data, router, configuration_type):
        """Extract and validate configuration parameters."""
        config_params = {}
        
        if configuration_type == 'hotspot':
            # Dynamic SSID configuration
            ssid = data.get('ssid') or f"{router.name}-WiFi"
            config_params = {
                'ssid': ssid,
                'welcome_message': data.get('welcome_message', f"Welcome to {ssid}"),
                'bandwidth_limit': data.get('bandwidth_limit', '10M'),
                'session_timeout': data.get('session_timeout', 60),
                'max_users': data.get('max_users', 50),
                'redirect_url': data.get('redirect_url')
            }
            
            # Apply template if specified
            template_name = data.get('configuration_template')
            if template_name:
                template_config = self.get_template_configuration(template_name, 'hotspot')
                config_params.update(template_config)
                
        elif configuration_type == 'pppoe':
            config_params = {
                'ip_pool_name': data.get('ip_pool_name', 'pppoe-pool'),
                'service_name': data.get('service_name', f"{router.name}-PPPoE"),
                'bandwidth_limit': data.get('bandwidth_limit', '10M'),
                'mtu': data.get('mtu', 1492),
                'dns_servers': data.get('dns_servers', '8.8.8.8,1.1.1.1')
            }
            
            # Apply template if specified
            template_name = data.get('configuration_template')
            if template_name:
                template_config = self.get_template_configuration(template_name, 'pppoe')
                config_params.update(template_config)
        
        return config_params

    def get_template_configuration(self, template_name, config_type):
        """Get configuration parameters from template."""
        templates = MikroTikConnectionManager.get_connection_templates()
        
        if template_name in templates:
            template = templates[template_name]
            if config_type == 'hotspot' and 'hotspot_config' in template:
                return template['hotspot_config']
            elif config_type == 'pppoe' and 'pppoe_config' in template:
                return template['pppoe_config']
        
        return {}

    def update_router_configuration(self, router, configuration_type, config_params, configuration):
        """Update router model with configuration details."""
        if configuration_type == 'hotspot':
            router.ssid = config_params.get('ssid', router.ssid)
            router.captive_portal_enabled = True
            
            # Create or update hotspot configuration
            from network_management.models.router_management_model import HotspotConfiguration
            hotspot_config, created = HotspotConfiguration.objects.get_or_create(router=router)
            hotspot_config.ssid = config_params.get('ssid')
            hotspot_config.bandwidth_limit = config_params.get('bandwidth_limit', '10M')
            hotspot_config.session_timeout = config_params.get('session_timeout', 60)
            hotspot_config.max_users = config_params.get('max_users', 50)
            hotspot_config.welcome_message = config_params.get('welcome_message', '')
            hotspot_config.save()
            
        elif configuration_type == 'pppoe':
            # Create or update PPPoE configuration
            from network_management.models.router_management_model import PPPoEConfiguration
            pppoe_config, created = PPPoEConfiguration.objects.get_or_create(router=router)
            pppoe_config.ip_pool_name = config_params.get('ip_pool_name', 'pppoe-pool')
            pppoe_config.service_name = config_params.get('service_name', '')
            pppoe_config.bandwidth_limit = config_params.get('bandwidth_limit', '10M')
            pppoe_config.mtu = config_params.get('mtu', 1492)
            pppoe_config.dns_servers = config_params.get('dns_servers', '8.8.8.8,1.1.1.1')
            pppoe_config.save()
        
        router.configuration_status = 'configured'
        router.configuration_type = configuration_type
        router.configuration_template = config_params
        router.last_configuration_update = timezone.now()
        router.save()

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')


class ConnectionTemplatesView(APIView):
    """
    API View for retrieving and managing connection configuration templates.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all available configuration templates."""
        templates = MikroTikConnectionManager.get_connection_templates()
        
        # Serialize templates
        serialized_templates = []
        for name, template in templates.items():
            serialized_templates.append({
                'name': name,
                'display_name': template.get('name', name),
                'description': template.get('description', ''),
                'configuration': template,
                'recommended_for': template.get('recommended_for', [])
            })
        
        return Response({
            'templates': serialized_templates,
            'total_templates': len(serialized_templates)
        })


class BulkConnectionTestView(APIView):
    """
    API View for testing connections to multiple routers simultaneously.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Test connections for multiple routers."""
        router_ids = request.data.get('router_ids', [])
        
        if not router_ids:
            return Response(
                {"error": "router_ids array is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        routers = Router.objects.filter(id__in=router_ids, is_active=True)
        results = {
            'total_routers': len(routers),
            'successful_tests': 0,
            'failed_tests': 0,
            'details': {}
        }
        
        for router in routers:
            try:
                connector = MikroTikConnector(
                    ip=router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                
                test_results = connector.test_connection()
                
                # Save connection test
                connection_test = RouterConnectionTest.objects.create(
                    router=router,
                    success=test_results.get('system_access', False),
                    response_time=test_results.get('response_time'),
                    system_info=test_results.get('system_info', {}),
                    error_messages=test_results.get('error_messages', []),
                    tested_by=request.user
                )
                
                # Update router status
                if test_results.get('system_access'):
                    router.connection_status = 'connected'
                    router.last_connection_test = timezone.now()
                    results['successful_tests'] += 1
                else:
                    router.connection_status = 'disconnected'
                    results['failed_tests'] += 1
                
                router.save()
                
                results['details'][router.id] = {
                    'router_name': router.name,
                    'router_ip': router.ip,
                    'success': test_results.get('system_access', False),
                    'response_time': test_results.get('response_time'),
                    'error_messages': test_results.get('error_messages', [])
                }
                
            except Exception as e:
                logger.error(f"Bulk connection test failed for router {router.id}: {str(e)}")
                results['failed_tests'] += 1
                results['details'][router.id] = {
                    'router_name': router.name,
                    'router_ip': router.ip,
                    'success': False,
                    'error_messages': [f"Test failed: {str(e)}"]
                }
        
        # Create audit log for bulk operation
        RouterAuditLog.objects.create(
            router=None,
            action='bulk_connection_test',
            description=f"Bulk connection test completed: {results['successful_tests']} successful, {results['failed_tests']} failed",
            user=request.user,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes=results
        )
        
        return Response(results)

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')


class RouterConnectionHistoryView(APIView):
    """
    API View for retrieving connection test history for a router.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get connection test history for a specific router."""
        router = get_object_or_404(Router, id=pk, is_active=True)
        
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        connection_tests = RouterConnectionTest.objects.filter(
            router=router,
            tested_at__gte=start_date
        ).order_by('-tested_at')
        
        serializer = RouterConnectionTestSerializer(connection_tests, many=True)
        
        # Calculate connection statistics
        total_tests = connection_tests.count()
        successful_tests = connection_tests.filter(success=True).count()
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        statistics = {
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': round(success_rate, 2),
            'average_response_time': connection_tests.aggregate(
                avg_response_time=models.Avg('response_time')
            )['avg_response_time'] or 0,
            'time_period_days': days
        }
        
        return Response({
            'router': {
                'id': router.id,
                'name': router.name,
                'ip': router.ip,
                'connection_status': router.connection_status
            },
            'connection_tests': serializer.data,
            'statistics': statistics
        })