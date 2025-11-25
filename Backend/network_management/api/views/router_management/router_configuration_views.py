

# # network_management/api/views/router_management/router_configuration_views.py

# """
# ENHANCED Router Configuration Views for Network Management System - PRODUCTION READY

# This module provides COMPLETE API views for router configuration management
# with MikroTik script integration, automated setup, and comprehensive error handling.
# """

# import logging
# import os
# import tempfile
# from django.conf import settings
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from django.core.files.storage import FileSystemStorage

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.parsers import MultiPartParser, FormParser

# from network_management.models.router_management_model import (
#     Router, RouterCallbackConfig, HotspotConfiguration, PPPoEConfiguration, RouterAuditLog
# )
# from network_management.serializers.router_management_serializer import (
#     RouterCallbackConfigSerializer, 
#     HotspotConfigurationSerializer,
#     PPPoEConfigurationSerializer,
#     AutoConfigurationRequestSerializer
# )
# from network_management.utils.mikrotik_connector import MikroTikConnector, MikroTikConnectionManager
# from network_management.utils.websocket_utils import WebSocketManager
# from network_management.scripts.mikrotik_auto_config import MikroTikAutoConfig

# logger = logging.getLogger(__name__)


# class HotspotConfigView(APIView):
#     """
#     ENHANCED API View for managing hotspot configuration on routers with script integration and comprehensive error handling.
#     """
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def get_router(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         """Get current hotspot configuration for a router."""
#         router = self.get_router(pk)
        
#         try:
#             config = HotspotConfiguration.objects.get(router=router)
#             serializer = HotspotConfigurationSerializer(config)
#             return Response(serializer.data)
#         except HotspotConfiguration.DoesNotExist:
#             # Return default configuration with dynamic SSID
#             default_config = {
#                 'router': router.id,
#                 'ssid': router.ssid or f"{router.name}-WiFi",
#                 'redirect_url': 'http://captive.surfzone.local',
#                 'bandwidth_limit': '10M',
#                 'session_timeout': 60,
#                 'auth_method': 'universal',
#                 'enable_splash_page': True,
#                 'allow_social_login': False,
#                 'enable_bandwidth_shaping': True,
#                 'log_user_activity': True,
#                 'max_users': 50
#             }
#             return Response(default_config)

#     def post(self, request, pk):
#         """Create or update hotspot configuration with script automation and comprehensive error handling."""
#         router = self.get_router(pk)
        
#         try:
#             # Handle file upload with validation
#             landing_page_file = request.FILES.get('landing_page_file')
#             if landing_page_file:
#                 # Validate file type
#                 allowed_extensions = ['.html', '.htm', '.js', '.css']
#                 file_extension = os.path.splitext(landing_page_file.name)[1].lower()
#                 if file_extension not in allowed_extensions:
#                     return Response(
#                         {"error": f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
                
#                 # Validate file size (max 5MB)
#                 if landing_page_file.size > 5 * 1024 * 1024:
#                     return Response(
#                         {"error": "File size too large. Maximum size is 5MB."},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

#             # Get or create configuration
#             config, created = HotspotConfiguration.objects.get_or_create(router=router)
            
#             # Update configuration data
#             update_data = request.data.copy()
            
#             # Use dynamic SSID if not provided
#             if not update_data.get('ssid') and router.ssid:
#                 update_data['ssid'] = router.ssid
            
#             if landing_page_file:
#                 try:
#                     # Delete old file if exists
#                     if config.landing_page_file:
#                         old_file_path = config.landing_page_file.path
#                         if os.path.exists(old_file_path):
#                             os.remove(old_file_path)
#                     config.landing_page_file = landing_page_file
#                 except Exception as e:
#                     logger.error(f"Failed to handle landing page file: {str(e)}")
#                     return Response(
#                         {"error": f"File handling failed: {str(e)}"},
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
            
#             # Update other fields
#             for field, value in update_data.items():
#                 if hasattr(config, field) and field != 'landing_page_file':
#                     try:
#                         setattr(config, field, value)
#                     except Exception as e:
#                         logger.error(f"Failed to set field {field}: {str(e)}")
#                         return Response(
#                             {"error": f"Invalid value for field {field}: {str(e)}"},
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
            
#             config.save()
            
#             # Apply configuration using script if auto_apply is enabled
#             auto_apply = request.data.get('auto_apply', True)
#             if auto_apply:
#                 try:
#                     success, message = config.apply_configuration()
                    
#                     if success:
#                         # Update router configuration status
#                         router.configuration_status = 'configured'
#                         router.configuration_type = 'hotspot'
#                         router.last_configuration_update = timezone.now()
#                         router.save()
#                     else:
#                         # Partial configuration
#                         router.configuration_status = 'partially_configured'
#                         router.save()
#                         logger.warning(f"Hotspot configuration partially applied for router {router.id}: {message}")
                        
#                 except Exception as e:
#                     logger.error(f"Failed to apply hotspot configuration for router {router.id}: {str(e)}")
#                     return Response(
#                         {"error": f"Configuration application failed: {str(e)}"},
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
            
#             # Create audit log
#             action = 'created' if created else 'updated'
#             RouterAuditLog.objects.create(
#                 router=router,
#                 action='hotspot_config',
#                 description=f"Hotspot configuration {action} for {router.name}",
#                 user=request.user,
#                 ip_address=self.get_client_ip(request),
#                 user_agent=request.META.get('HTTP_USER_AGENT', ''),
#                 changes={'action': action, 'config_data': update_data, 'auto_applied': auto_apply}
#             )
            
#             # Send WebSocket update
#             WebSocketManager.send_router_update(
#                 router.id, 
#                 'hotspot_config_updated', 
#                 {
#                     'ssid': config.ssid, 
#                     'auth_method': config.auth_method,
#                     'configuration_applied': auto_apply
#                 }
#             )
            
#             serializer = HotspotConfigurationSerializer(config)
#             return Response(serializer.data, 
#                          status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"Hotspot configuration failed for router {router.id}: {str(e)}")
#             return Response(
#                 {"error": f"Configuration failed: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class PPPoEConfigView(APIView):
#     """
#     ENHANCED API View for managing PPPoE configuration on routers with script integration and comprehensive error handling.
#     """
#     permission_classes = [IsAuthenticated]

#     def get_router(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         """Get current PPPoE configuration for a router."""
#         router = self.get_router(pk)
        
#         try:
#             config = PPPoEConfiguration.objects.get(router=router)
#             serializer = PPPoEConfigurationSerializer(config)
#             return Response(serializer.data)
#         except PPPoEConfiguration.DoesNotExist:
#             # Return default configuration with dynamic service name
#             default_config = {
#                 'router': router.id,
#                 'ip_pool_name': 'pppoe-pool-1',
#                 'service_name': f"{router.name}-PPPoE",
#                 'mtu': 1492,
#                 'dns_servers': '8.8.8.8,1.1.1.1',
#                 'bandwidth_limit': '10M',
#                 'auth_methods': 'all',
#                 'enable_pap': True,
#                 'enable_chap': True,
#                 'enable_mschap': True,
#                 'idle_timeout': 300,
#                 'session_timeout': 0,
#                 'default_profile': 'default',
#                 'interface': 'bridge',
#                 'ip_range_start': '192.168.100.10',
#                 'ip_range_end': '192.168.100.200',
#                 'service_type': 'standard'
#             }
#             return Response(default_config)

#     def post(self, request, pk):
#         """Create or update PPPoE configuration with script automation and comprehensive error handling."""
#         router = self.get_router(pk)
        
#         try:
#             # Get or create configuration
#             config, created = PPPoEConfiguration.objects.get_or_create(router=router)
            
#             # Update configuration data with validation
#             for field, value in request.data.items():
#                 if hasattr(config, field):
#                     try:
#                         # Convert numeric fields with validation
#                         if field in ['mtu', 'idle_timeout', 'session_timeout']:
#                             try:
#                                 value = int(value)
#                                 # Validate ranges
#                                 if field == 'mtu' and (value < 576 or value > 1500):
#                                     return Response(
#                                         {"error": "MTU must be between 576 and 1500"},
#                                         status=status.HTTP_400_BAD_REQUEST
#                                     )
#                                 elif field in ['idle_timeout', 'session_timeout'] and value < 0:
#                                     return Response(
#                                         {"error": f"{field} cannot be negative"},
#                                         status=status.HTTP_400_BAD_REQUEST
#                                     )
#                             except (ValueError, TypeError):
#                                 return Response(
#                                     {"error": f"Invalid value for {field}. Must be a number."},
#                                     status=status.HTTP_400_BAD_REQUEST
#                                 )
#                         setattr(config, field, value)
#                     except Exception as e:
#                         logger.error(f"Failed to set field {field}: {str(e)}")
#                         return Response(
#                             {"error": f"Invalid value for field {field}: {str(e)}"},
#                             status=status.HTTP_400_BAD_REQUEST
#                         )
            
#             # Use dynamic service name if not provided
#             if not config.service_name and router.name:
#                 config.service_name = f"{router.name}-PPPoE"
            
#             config.save()
            
#             # Apply configuration using script if auto_apply is enabled
#             auto_apply = request.data.get('auto_apply', True)
#             if auto_apply:
#                 try:
#                     success, message = config.apply_configuration()
                    
#                     if success:
#                         # Update router configuration status
#                         router.configuration_status = 'configured'
#                         router.configuration_type = 'pppoe'
#                         router.last_configuration_update = timezone.now()
#                         router.save()
#                     else:
#                         # Partial configuration
#                         router.configuration_status = 'partially_configured'
#                         router.save()
#                         logger.warning(f"PPPoE configuration partially applied for router {router.id}: {message}")
                        
#                 except Exception as e:
#                     logger.error(f"Failed to apply PPPoE configuration for router {router.id}: {str(e)}")
#                     return Response(
#                         {"error": f"Configuration application failed: {str(e)}"},
#                         status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                     )
            
#             # Create audit log
#             action = 'created' if created else 'updated'
#             RouterAuditLog.objects.create(
#                 router=router,
#                 action='pppoe_config',
#                 description=f"PPPoE configuration {action} for {router.name}",
#                 user=request.user,
#                 ip_address=self.get_client_ip(request),
#                 user_agent=request.META.get('HTTP_USER_AGENT', ''),
#                 changes={'action': action, 'config_data': request.data, 'auto_applied': auto_apply}
#             )
            
#             # Send WebSocket update
#             WebSocketManager.send_router_update(
#                 router.id, 
#                 'pppoe_config_updated', 
#                 {
#                     'service_name': config.service_name, 
#                     'service_type': config.service_type,
#                     'configuration_applied': auto_apply
#                 }
#             )
            
#             serializer = PPPoEConfigurationSerializer(config)
#             return Response(serializer.data, 
#                          status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"PPPoE configuration failed for router {router.id}: {str(e)}")
#             return Response(
#                 {"error": f"Configuration failed: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class ScriptBasedConfigurationView(APIView):
#     """
#     PRODUCTION-READY API View for script-based router configuration and setup.
#     Provides endpoints for automated MikroTik router setup using scripts with comprehensive error handling.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         """
#         Execute script-based configuration on a router with comprehensive error handling.
        
#         Request Body:
#             script_type: 'basic_setup', 'hotspot_setup', 'pppoe_setup', 'full_setup'
#             parameters: Custom parameters for the script
#             dry_run: Whether to simulate without applying (default: false)
#         """
#         router = get_object_or_404(Router, pk=pk, is_active=True)
        
#         script_type = request.data.get('script_type', 'basic_setup')
#         parameters = request.data.get('parameters', {})
#         dry_run = request.data.get('dry_run', False)
        
#         # Validate script type
#         valid_script_types = ['basic_setup', 'hotspot_setup', 'pppoe_setup', 'full_setup']
#         if script_type not in valid_script_types:
#             return Response(
#                 {"error": f"Invalid script type. Must be one of: {', '.join(valid_script_types)}"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             # Initialize auto config with error handling
#             try:
#                 auto_config = MikroTikAutoConfig(
#                     router.ip,
#                     router.username,
#                     router.password,
#                     router.port
#                 )
#             except Exception as e:
#                 logger.error(f"Failed to initialize MikroTikAutoConfig for router {router.id}: {str(e)}")
#                 return Response(
#                     {"error": f"Failed to initialize configuration tool: {str(e)}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             # Execute script based on type
#             try:
#                 if script_type == 'basic_setup':
#                     success, message, details = auto_config.basic_router_setup(
#                         router_name=router.name,
#                         dry_run=dry_run
#                     )
#                 elif script_type == 'hotspot_setup':
#                     success, message, details = auto_config.setup_hotspot_only(
#                         ssid=parameters.get('ssid', router.ssid),
#                         dry_run=dry_run
#                     )
#                 elif script_type == 'pppoe_setup':
#                     success, message, details = auto_config.setup_pppoe_only(
#                         service_name=parameters.get('service_name', f"{router.name}-PPPoE"),
#                         dry_run=dry_run
#                     )
#                 elif script_type == 'full_setup':
#                     success, message, details = auto_config.auto_setup_router(
#                         setup_type='both',
#                         router_name=router.name,
#                         dry_run=dry_run
#                     )
                
#             except Exception as e:
#                 logger.error(f"Script execution failed for router {router.id}: {str(e)}")
#                 return Response(
#                     {"error": f"Script execution failed: {str(e)}"},
#                     status=status.HTTP_500_INTERNAL_SERVER_ERROR
#                 )
            
#             # Create audit log
#             RouterAuditLog.objects.create(
#                 router=router,
#                 action='script_configuration',
#                 description=f"Script-based {script_type} executed on {router.name}",
#                 user=request.user,
#                 ip_address=self.get_client_ip(request),
#                 user_agent=request.META.get('HTTP_USER_AGENT', ''),
#                 changes={
#                     'script_type': script_type,
#                     'parameters': parameters,
#                     'dry_run': dry_run,
#                     'success': success,
#                     'message': message,
#                     'details': details
#                 }
#             )
            
#             response_data = {
#                 'success': success,
#                 'message': message,
#                 'script_type': script_type,
#                 'dry_run': dry_run,
#                 'details': details
#             }
            
#             if success and not dry_run:
#                 try:
#                     # Update router configuration status
#                     router.configuration_status = 'configured'
#                     if script_type in ['hotspot_setup', 'full_setup']:
#                         router.configuration_type = 'hotspot' if script_type == 'hotspot_setup' else 'both'
#                         if 'ssid' in details:
#                             router.ssid = details['ssid']
#                     elif script_type == 'pppoe_setup':
#                         router.configuration_type = 'pppoe'
                    
#                     router.last_configuration_update = timezone.now()
#                     router.save()
                    
#                     response_data['router_updated'] = True
                    
#                 except Exception as e:
#                     logger.error(f"Failed to update router status after script execution: {str(e)}")
#                     response_data['router_update_error'] = str(e)
            
#             return Response(response_data)
            
#         except Exception as e:
#             logger.error(f"Script configuration failed for router {router.id}: {str(e)}")
#             return Response(
#                 {"error": f"Script configuration failed: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def get(self, request, pk):
#         """Get available scripts and their parameters for a router with error handling."""
#         router = get_object_or_404(Router, pk=pk, is_active=True)
        
#         try:
#             available_scripts = {
#                 'basic_setup': {
#                     'name': 'Basic Router Setup',
#                     'description': 'Configure basic router settings and enable API access',
#                     'parameters': {
#                         'router_name': 'string (optional) - Name for the router'
#                     },
#                     'estimated_duration': '2-5 minutes'
#                 },
#                 'hotspot_setup': {
#                     'name': 'Hotspot Setup',
#                     'description': 'Configure wireless hotspot with captive portal',
#                     'parameters': {
#                         'ssid': 'string (optional) - WiFi network name',
#                         'bandwidth_limit': 'string (optional) - Default: 10M/10M',
#                         'session_timeout': 'integer (optional) - Default: 60 minutes'
#                     },
#                     'estimated_duration': '5-10 minutes'
#                 },
#                 'pppoe_setup': {
#                     'name': 'PPPoE Server Setup',
#                     'description': 'Configure PPPoE server for user authentication',
#                     'parameters': {
#                         'service_name': 'string (optional) - PPPoE service name',
#                         'bandwidth_limit': 'string (optional) - Default: 10M/10M'
#                     },
#                     'estimated_duration': '3-7 minutes'
#                 },
#                 'full_setup': {
#                     'name': 'Full Setup',
#                     'description': 'Complete setup with both hotspot and PPPoE',
#                     'parameters': {
#                         'router_name': 'string (optional) - Name for the router',
#                         'ssid': 'string (optional) - WiFi network name',
#                         'service_name': 'string (optional) - PPPoE service name'
#                     },
#                     'estimated_duration': '10-15 minutes'
#                 }
#             }
            
#             return Response({
#                 'router': {
#                     'id': router.id,
#                     'name': router.name,
#                     'ip': router.ip,
#                     'connection_status': router.connection_status
#                 },
#                 'available_scripts': available_scripts,
#                 'prerequisites': self.get_prerequisites()
#             })
            
#         except Exception as e:
#             logger.error(f"Failed to get script information for router {router.id}: {str(e)}")
#             return Response(
#                 {"error": "Failed to retrieve script information"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def get_prerequisites(self):
#         """Get prerequisites for script execution."""
#         return {
#             'api_access': 'RouterOS API must be enabled on port 8728',
#             'credentials': 'Valid admin credentials required',
#             'network_connectivity': 'Router must be accessible from this server',
#             'permissions': 'User must have full API permissions',
#             'backup_recommended': 'Always backup router configuration before scripts'
#         }

#     def get_client_ip(self, request):
#         """Get client IP address."""
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         else:
#             return request.META.get('REMOTE_ADDR')


# class BulkActionView(APIView):
#     """
#     ENHANCED API View for performing bulk actions on routers with script integration and comprehensive error handling.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """Enhanced bulk actions with script automation support and error handling."""
#         action = request.data.get('action')
#         router_ids = request.data.get('router_ids', [])
        
#         if not router_ids:
#             return Response(
#                 {"error": "router_ids array is required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if action == 'health_check':
#             from network_management.api.views.router_management.router_connection_views import BulkConnectionTestView
#             bulk_view = BulkConnectionTestView()
#             return bulk_view.post(request)
#         elif action == 'configure_hotspot':
#             return self.bulk_configure_hotspot(request)
#         elif action == 'configure_pppoe':
#             return self.bulk_configure_pppoe(request)
#         elif action == 'auto_setup_routers':
#             return self.bulk_auto_setup(request)
#         else:
#             return Response(
#                 {"error": "Unsupported bulk action"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#     def bulk_configure_hotspot(self, request):
#         """Apply hotspot configuration to multiple routers using scripts with comprehensive error handling."""
#         router_ids = request.data.get('router_ids', [])
#         config_data = request.data.get('config_data', {})
        
#         routers = Router.objects.filter(id__in=router_ids, is_active=True)
#         results = {
#             'total': routers.count(),
#             'successful': 0,
#             'failed': 0,
#             'details': {}
#         }
        
#         for router in routers:
#             try:
#                 # Use script-based configuration with error handling
#                 try:
#                     auto_config = MikroTikAutoConfig(
#                         router.ip,
#                         router.username,
#                         router.password,
#                         router.port
#                     )
#                 except Exception as e:
#                     logger.error(f"Failed to initialize auto config for router {router.id}: {str(e)}")
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed', 
#                         'message': f"Configuration tool initialization failed: {str(e)}"
#                     }
#                     continue
                
#                 # Apply hotspot configuration
#                 ssid = config_data.get('ssid') or router.ssid or f"{router.name}-WiFi"
#                 try:
#                     success, message, details = auto_config.configure_hotspot(
#                         ssid=ssid,
#                         bandwidth_limit=config_data.get('bandwidth_limit', '10M'),
#                         session_timeout=config_data.get('session_timeout', 60),
#                         max_users=config_data.get('max_users', 50)
#                     )
                    
#                     if success:
#                         results['successful'] += 1
#                         results['details'][router.id] = {
#                             'status': 'success', 
#                             'message': message,
#                             'ssid': ssid
#                         }
                        
#                         # Update router configuration
#                         router.configuration_status = 'configured'
#                         router.configuration_type = 'hotspot'
#                         router.ssid = ssid
#                         router.last_configuration_update = timezone.now()
#                         router.save()
#                     else:
#                         results['failed'] += 1
#                         results['details'][router.id] = {
#                             'status': 'failed', 
#                             'message': message
#                         }
                        
#                 except Exception as e:
#                     logger.error(f"Hotspot configuration failed for router {router.id}: {str(e)}")
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed', 
#                         'message': f"Configuration execution failed: {str(e)}"
#                     }
                    
#             except Exception as e:
#                 results['failed'] += 1
#                 results['details'][router.id] = {
#                     'status': 'failed', 
#                     'message': f"Unexpected error: {str(e)}"
#                 }
        
#         return Response(results)

#     def bulk_configure_pppoe(self, request):
#         """Apply PPPoE configuration to multiple routers using scripts with comprehensive error handling."""
#         router_ids = request.data.get('router_ids', [])
#         config_data = request.data.get('config_data', {})
        
#         routers = Router.objects.filter(id__in=router_ids, is_active=True)
#         results = {
#             'total': routers.count(),
#             'successful': 0,
#             'failed': 0,
#             'details': {}
#         }
        
#         for router in routers:
#             try:
#                 # Use script-based configuration with error handling
#                 try:
#                     auto_config = MikroTikAutoConfig(
#                         router.ip,
#                         router.username,
#                         router.password,
#                         router.port
#                     )
#                 except Exception as e:
#                     logger.error(f"Failed to initialize auto config for router {router.id}: {str(e)}")
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed', 
#                         'message': f"Configuration tool initialization failed: {str(e)}"
#                     }
#                     continue
                
#                 # Apply PPPoE configuration
#                 service_name = config_data.get('service_name') or f"{router.name}-PPPoE"
#                 try:
#                     success, message, details = auto_config.configure_pppoe(
#                         service_name=service_name,
#                         bandwidth_limit=config_data.get('bandwidth_limit', '10M'),
#                         mtu=config_data.get('mtu', 1492)
#                     )
                    
#                     if success:
#                         results['successful'] += 1
#                         results['details'][router.id] = {
#                             'status': 'success', 
#                             'message': message,
#                             'service_name': service_name
#                         }
                        
#                         # Update router configuration
#                         router.configuration_status = 'configured'
#                         router.configuration_type = 'pppoe'
#                         router.last_configuration_update = timezone.now()
#                         router.save()
#                     else:
#                         results['failed'] += 1
#                         results['details'][router.id] = {
#                             'status': 'failed', 
#                             'message': message
#                         }
                        
#                 except Exception as e:
#                     logger.error(f"PPPoE configuration failed for router {router.id}: {str(e)}")
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed', 
#                         'message': f"Configuration execution failed: {str(e)}"
#                     }
                    
#             except Exception as e:
#                 results['failed'] += 1
#                 results['details'][router.id] = {
#                     'status': 'failed', 
#                     'message': f"Unexpected error: {str(e)}"
#                 }
        
#         return Response(results)

#     def bulk_auto_setup(self, request):
#         """Perform automated setup on multiple routers using scripts with comprehensive error handling."""
#         router_ids = request.data.get('router_ids', [])
#         setup_type = request.data.get('setup_type', 'hotspot')  # 'hotspot', 'pppoe', or 'both'
        
#         routers = Router.objects.filter(id__in=router_ids, is_active=True)
#         results = {
#             'total': routers.count(),
#             'successful': 0,
#             'failed': 0,
#             'details': {}
#         }
        
#         for router in routers:
#             try:
#                 # Use the automated setup script with error handling
#                 try:
#                     auto_config = MikroTikAutoConfig(
#                         router.ip,
#                         router.username,
#                         router.password,
#                         router.port
#                     )
#                 except Exception as e:
#                     logger.error(f"Failed to initialize auto config for router {router.id}: {str(e)}")
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed', 
#                         'message': f"Configuration tool initialization failed: {str(e)}"
#                     }
#                     continue
                
#                 # Perform automated setup
#                 try:
#                     success, message, setup_details = auto_config.auto_setup_router(
#                         setup_type=setup_type,
#                         router_name=router.name
#                     )
                    
#                     if success:
#                         results['successful'] += 1
#                         results['details'][router.id] = {
#                             'status': 'success', 
#                             'message': message,
#                             'setup_details': setup_details
#                         }
                        
#                         # Update router configuration
#                         router.configuration_status = 'configured'
#                         router.configuration_type = setup_type
#                         router.last_configuration_update = timezone.now()
                        
#                         if setup_type == 'hotspot' and 'ssid' in setup_details:
#                             router.ssid = setup_details['ssid']
                        
#                         router.save()
#                     else:
#                         results['failed'] += 1
#                         results['details'][router.id] = {
#                             'status': 'failed', 
#                             'message': message
#                         }
                        
#                 except Exception as e:
#                     logger.error(f"Auto setup failed for router {router.id}: {str(e)}")
#                     results['failed'] += 1
#                     results['details'][router.id] = {
#                         'status': 'failed', 
#                         'message': f"Setup execution failed: {str(e)}"
#                     }
                    
#             except Exception as e:
#                 results['failed'] += 1
#                 results['details'][router.id] = {
#                     'status': 'failed', 
#                     'message': f"Unexpected error: {str(e)}"
#                 }
        
#         return Response(results)







# network_management/api/views/router_management/router_configuration_views.py

"""
ENHANCED Router Configuration Views for Network Management System - PRODUCTION READY

This module provides COMPLETE API views for router configuration management
with MikroTik script integration, automated setup, and comprehensive error handling.
"""

import logging
import os
import tempfile
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
    PPPoEConfigurationSerializer,
    AutoConfigurationRequestSerializer
)
from network_management.utils.mikrotik_connector import MikroTikConnector, MikroTikConnectionManager
from network_management.utils.websocket_utils import WebSocketManager
from network_management.scripts.mikrotik_auto_config import MikroTikAutoConfig

logger = logging.getLogger(__name__)


class ConfigurationTemplatesView(APIView):
    """
    ENHANCED API View for retrieving configuration templates with comprehensive error handling.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get available configuration templates for routers.
        
        Returns comprehensive template data for hotspot, PPPoE, VPN, and system configurations.
        """
        try:
            templates = {
                'hotspot_basic': {
                    'name': 'Basic Hotspot',
                    'description': 'Standard hotspot configuration with universal authentication',
                    'category': 'hotspot',
                    'parameters': {
                        'ssid': {
                            'type': 'string',
                            'required': True,
                            'default': 'SurfZone-WiFi',
                            'description': 'Wireless network name'
                        },
                        'bandwidth_limit': {
                            'type': 'string', 
                            'required': False,
                            'default': '10M/10M',
                            'description': 'Upload/download bandwidth limit'
                        },
                        'session_timeout': {
                            'type': 'integer',
                            'required': False,
                            'default': 60,
                            'description': 'Session timeout in minutes'
                        },
                        'max_users': {
                            'type': 'integer',
                            'required': False,
                            'default': 50,
                            'description': 'Maximum concurrent users'
                        }
                    },
                    'estimated_duration': '5-10 minutes',
                    'compatibility': ['mikrotik'],
                    'prerequisites': ['api_access', 'wireless_interface']
                },
                'hotspot_advanced': {
                    'name': 'Advanced Hotspot',
                    'description': 'Hotspot with social login, bandwidth shaping, and advanced features',
                    'category': 'hotspot',
                    'parameters': {
                        'ssid': {
                            'type': 'string',
                            'required': True,
                            'default': 'SurfZone-Premium',
                            'description': 'Wireless network name'
                        },
                        'bandwidth_limit': {
                            'type': 'string',
                            'required': False,
                            'default': '20M/10M',
                            'description': 'Upload/download bandwidth limit'
                        },
                        'allow_social_login': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable social media authentication'
                        },
                        'enable_bandwidth_shaping': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable traffic shaping'
                        },
                        'enable_splash_page': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Show custom landing page'
                        },
                        'welcome_message': {
                            'type': 'string',
                            'required': False,
                            'default': 'Welcome to our WiFi service',
                            'description': 'Welcome message for users'
                        }
                    },
                    'estimated_duration': '10-15 minutes',
                    'compatibility': ['mikrotik'],
                    'prerequisites': ['api_access', 'wireless_interface', 'internet_connectivity']
                },
                'pppoe_standard': {
                    'name': 'Standard PPPoE',
                    'description': 'Basic PPPoE server configuration for user authentication',
                    'category': 'pppoe',
                    'parameters': {
                        'service_name': {
                            'type': 'string',
                            'required': True,
                            'default': 'PPPoE-Service',
                            'description': 'PPPoE service name'
                        },
                        'ip_pool_name': {
                            'type': 'string',
                            'required': False,
                            'default': 'pppoe-pool-1',
                            'description': 'IP address pool name'
                        },
                        'mtu': {
                            'type': 'integer',
                            'required': False,
                            'default': 1492,
                            'description': 'Maximum transmission unit',
                            'min': 576,
                            'max': 1500
                        },
                        'bandwidth_limit': {
                            'type': 'string',
                            'required': False,
                            'default': '10M/10M',
                            'description': 'Upload/download bandwidth limit'
                        },
                        'dns_servers': {
                            'type': 'string',
                            'required': False,
                            'default': '8.8.8.8,1.1.1.1',
                            'description': 'DNS servers for clients'
                        }
                    },
                    'estimated_duration': '5-8 minutes',
                    'compatibility': ['mikrotik'],
                    'prerequisites': ['api_access', 'ethernet_interface']
                },
                'pppoe_business': {
                    'name': 'Business PPPoE',
                    'description': 'Advanced PPPoE configuration with multiple IP pools and QoS',
                    'category': 'pppoe',
                    'parameters': {
                        'service_name': {
                            'type': 'string',
                            'required': True,
                            'default': 'Business-PPPoE',
                            'description': 'PPPoE service name'
                        },
                        'ip_pools': {
                            'type': 'array',
                            'required': False,
                            'default': ['pppoe-pool-1', 'pppoe-pool-2'],
                            'description': 'IP address pools'
                        },
                        'service_types': {
                            'type': 'array',
                            'required': False,
                            'default': ['standard', 'premium', 'business'],
                            'description': 'Available service tiers'
                        },
                        'enable_qos': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable quality of service'
                        },
                        'enable_radius': {
                            'type': 'boolean',
                            'required': False,
                            'default': False,
                            'description': 'Enable RADIUS authentication'
                        }
                    },
                    'estimated_duration': '10-12 minutes',
                    'compatibility': ['mikrotik'],
                    'prerequisites': ['api_access', 'ethernet_interface', 'advanced_skills']
                },
                'vpn_openvpn': {
                    'name': 'OpenVPN Server',
                    'description': 'OpenVPN server configuration for secure remote access',
                    'category': 'vpn',
                    'parameters': {
                        'vpn_type': {
                            'type': 'string',
                            'required': True,
                            'default': 'openvpn',
                            'description': 'VPN protocol type'
                        },
                        'generate_certificates': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Generate SSL certificates automatically'
                        },
                        'port': {
                            'type': 'integer',
                            'required': False,
                            'default': 1194,
                            'description': 'VPN server port'
                        },
                        'protocol': {
                            'type': 'string',
                            'required': False,
                            'default': 'udp',
                            'description': 'Transport protocol',
                            'options': ['udp', 'tcp']
                        },
                        'encryption': {
                            'type': 'string',
                            'required': False,
                            'default': 'aes-256-cbc',
                            'description': 'Encryption algorithm'
                        },
                        'max_clients': {
                            'type': 'integer',
                            'required': False,
                            'default': 10,
                            'description': 'Maximum VPN clients'
                        }
                    },
                    'estimated_duration': '15-20 minutes',
                    'compatibility': ['mikrotik'],
                    'prerequisites': ['api_access', 'public_ip', 'ssl_support']
                },
                'vpn_wireguard': {
                    'name': 'WireGuard VPN',
                    'description': 'Modern WireGuard VPN configuration for high-performance tunneling',
                    'category': 'vpn',
                    'parameters': {
                        'vpn_type': {
                            'type': 'string',
                            'required': True,
                            'default': 'wireguard',
                            'description': 'VPN protocol type'
                        },
                        'port': {
                            'type': 'integer',
                            'required': False,
                            'default': 51820,
                            'description': 'VPN server port'
                        },
                        'generate_keys': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Generate cryptographic keys automatically'
                        },
                        'allowed_ips': {
                            'type': 'string',
                            'required': False,
                            'default': '0.0.0.0/0',
                            'description': 'Allowed IP ranges for clients'
                        },
                        'persistent_keepalive': {
                            'type': 'integer',
                            'required': False,
                            'default': 25,
                            'description': 'Keepalive interval in seconds'
                        }
                    },
                    'estimated_duration': '10-15 minutes',
                    'compatibility': ['mikrotik'],
                    'prerequisites': ['api_access', 'public_ip', 'routeros_v7']
                },
                'system_basic': {
                    'name': 'Basic System Setup',
                    'description': 'Essential router system configuration and security hardening',
                    'category': 'system',
                    'parameters': {
                        'router_name': {
                            'type': 'string',
                            'required': True,
                            'default': 'Router-01',
                            'description': 'Router identification name'
                        },
                        'admin_password': {
                            'type': 'string',
                            'required': False,
                            'default': '',
                            'description': 'New admin password (leave empty to keep current)'
                        },
                        'timezone': {
                            'type': 'string',
                            'required': False,
                            'default': 'UTC',
                            'description': 'System timezone'
                        },
                        'enable_firewall': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable basic firewall rules'
                        },
                        'enable_ssh': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable SSH access'
                        },
                        'ssh_port': {
                            'type': 'integer',
                            'required': False,
                            'default': 22,
                            'description': 'SSH service port'
                        }
                    },
                    'estimated_duration': '3-5 minutes',
                    'compatibility': ['mikrotik', 'ubiquiti', 'cisco'],
                    'prerequisites': ['api_access', 'admin_credentials']
                },
                'system_advanced': {
                    'name': 'Advanced System Configuration',
                    'description': 'Comprehensive system configuration with advanced features',
                    'category': 'system',
                    'parameters': {
                        'router_name': {
                            'type': 'string',
                            'required': True,
                            'default': 'Advanced-Router',
                            'description': 'Router identification name'
                        },
                        'enable_logging': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable system logging'
                        },
                        'enable_ntp': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable NTP time synchronization'
                        },
                        'enable_snmp': {
                            'type': 'boolean',
                            'required': False,
                            'default': False,
                            'description': 'Enable SNMP monitoring'
                        },
                        'enable_ipv6': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable IPv6 support'
                        },
                        'enable_qos': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Enable quality of service'
                        },
                        'backup_config': {
                            'type': 'boolean',
                            'required': False,
                            'default': True,
                            'description': 'Create configuration backup'
                        }
                    },
                    'estimated_duration': '8-12 minutes',
                    'compatibility': ['mikrotik', 'ubiquiti'],
                    'prerequisites': ['api_access', 'admin_credentials', 'advanced_skills']
                }
            }
            
            # Get request parameters for filtering
            category_filter = request.GET.get('category')
            compatibility_filter = request.GET.get('compatibility')
            
            filtered_templates = templates
            
            # Apply filters if provided
            if category_filter:
                filtered_templates = {
                    key: value for key, value in filtered_templates.items() 
                    if value.get('category') == category_filter
                }
            
            if compatibility_filter:
                filtered_templates = {
                    key: value for key, value in filtered_templates.items() 
                    if compatibility_filter in value.get('compatibility', [])
                }
            
            response_data = {
                'templates': filtered_templates,
                'total_templates': len(filtered_templates),
                'categories': list(set(template['category'] for template in templates.values())),
                'compatibility_options': ['mikrotik', 'ubiquiti', 'cisco'],
                'filters_applied': {
                    'category': category_filter,
                    'compatibility': compatibility_filter
                },
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Failed to retrieve configuration templates: {str(e)}")
            return Response(
                {
                    'error': 'Failed to retrieve configuration templates',
                    'message': str(e),
                    'templates': {},
                    'total_templates': 0,
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Validate configuration template parameters.
        
        This endpoint validates template parameters before applying them to a router.
        """
        try:
            template_name = request.data.get('template_name')
            parameters = request.data.get('parameters', {})
            
            if not template_name:
                return Response(
                    {'error': 'Template name is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Define template validation rules
            validation_rules = {
                'hotspot_basic': self.validate_hotspot_basic,
                'hotspot_advanced': self.validate_hotspot_advanced,
                'pppoe_standard': self.validate_pppoe_standard,
                'pppoe_business': self.validate_pppoe_business,
                'vpn_openvpn': self.validate_vpn_openvpn,
                'vpn_wireguard': self.validate_vpn_wireguard,
                'system_basic': self.validate_system_basic,
                'system_advanced': self.validate_system_advanced
            }
            
            if template_name not in validation_rules:
                return Response(
                    {'error': f'Unknown template: {template_name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate parameters
            validation_result = validation_rules[template_name](parameters)
            
            if validation_result['valid']:
                return Response({
                    'valid': True,
                    'template_name': template_name,
                    'parameters': parameters,
                    'message': 'Parameters validated successfully',
                    'timestamp': timezone.now().isoformat()
                })
            else:
                return Response({
                    'valid': False,
                    'template_name': template_name,
                    'parameters': parameters,
                    'errors': validation_result['errors'],
                    'message': 'Parameter validation failed',
                    'timestamp': timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Template validation failed: {str(e)}")
            return Response(
                {
                    'error': 'Template validation failed',
                    'message': str(e),
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Validation methods for each template type
    def validate_hotspot_basic(self, parameters):
        """Validate basic hotspot template parameters."""
        errors = []
        
        if not parameters.get('ssid'):
            errors.append('SSID is required for basic hotspot configuration')
        
        bandwidth_limit = parameters.get('bandwidth_limit', '10M/10M')
        if not self.is_valid_bandwidth_format(bandwidth_limit):
            errors.append('Invalid bandwidth limit format. Use format like "10M/10M"')
        
        session_timeout = parameters.get('session_timeout', 60)
        if not isinstance(session_timeout, int) or session_timeout < 1:
            errors.append('Session timeout must be a positive integer')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_hotspot_advanced(self, parameters):
        """Validate advanced hotspot template parameters."""
        errors = self.validate_hotspot_basic(parameters)['errors']
        
        welcome_message = parameters.get('welcome_message', '')
        if welcome_message and len(welcome_message) > 200:
            errors.append('Welcome message must be less than 200 characters')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_pppoe_standard(self, parameters):
        """Validate standard PPPoE template parameters."""
        errors = []
        
        if not parameters.get('service_name'):
            errors.append('Service name is required for PPPoE configuration')
        
        mtu = parameters.get('mtu', 1492)
        if not isinstance(mtu, int) or mtu < 576 or mtu > 1500:
            errors.append('MTU must be between 576 and 1500')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_pppoe_business(self, parameters):
        """Validate business PPPoE template parameters."""
        errors = self.validate_pppoe_standard(parameters)['errors']
        
        ip_pools = parameters.get('ip_pools', [])
        if not isinstance(ip_pools, list) or len(ip_pools) == 0:
            errors.append('At least one IP pool is required for business PPPoE')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_vpn_openvpn(self, parameters):
        """Validate OpenVPN template parameters."""
        errors = []
        
        port = parameters.get('port', 1194)
        if not isinstance(port, int) or port < 1 or port > 65535:
            errors.append('Port must be between 1 and 65535')
        
        protocol = parameters.get('protocol', 'udp')
        if protocol not in ['udp', 'tcp']:
            errors.append('Protocol must be either "udp" or "tcp"')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_vpn_wireguard(self, parameters):
        """Validate WireGuard template parameters."""
        errors = []
        
        port = parameters.get('port', 51820)
        if not isinstance(port, int) or port < 1 or port > 65535:
            errors.append('Port must be between 1 and 65535')
        
        persistent_keepalive = parameters.get('persistent_keepalive', 25)
        if not isinstance(persistent_keepalive, int) or persistent_keepalive < 0:
            errors.append('Persistent keepalive must be a non-negative integer')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_system_basic(self, parameters):
        """Validate basic system template parameters."""
        errors = []
        
        if not parameters.get('router_name'):
            errors.append('Router name is required for system configuration')
        
        ssh_port = parameters.get('ssh_port', 22)
        if not isinstance(ssh_port, int) or ssh_port < 1 or ssh_port > 65535:
            errors.append('SSH port must be between 1 and 65535')
        
        return {'valid': len(errors) == 0, 'errors': errors}

    def validate_system_advanced(self, parameters):
        """Validate advanced system template parameters."""
        return self.validate_system_basic(parameters)

    def is_valid_bandwidth_format(self, bandwidth_str):
        """Validate bandwidth limit format."""
        import re
        pattern = r'^\d+[KMGT]?/\d+[KMGT]?$'
        return bool(re.match(pattern, bandwidth_str))


class HotspotConfigView(APIView):
    """
    ENHANCED API View for managing hotspot configuration on routers with script integration and comprehensive error handling.
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
            # Return default configuration with dynamic SSID
            default_config = {
                'router': router.id,
                'ssid': router.ssid or f"{router.name}-WiFi",
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
        """Create or update hotspot configuration with script automation and comprehensive error handling."""
        router = self.get_router(pk)
        
        try:
            # Handle file upload with validation
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
            
            # Use dynamic SSID if not provided
            if not update_data.get('ssid') and router.ssid:
                update_data['ssid'] = router.ssid
            
            if landing_page_file:
                try:
                    # Delete old file if exists
                    if config.landing_page_file:
                        old_file_path = config.landing_page_file.path
                        if os.path.exists(old_file_path):
                            os.remove(old_file_path)
                    config.landing_page_file = landing_page_file
                except Exception as e:
                    logger.error(f"Failed to handle landing page file: {str(e)}")
                    return Response(
                        {"error": f"File handling failed: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            # Update other fields
            for field, value in update_data.items():
                if hasattr(config, field) and field != 'landing_page_file':
                    try:
                        setattr(config, field, value)
                    except Exception as e:
                        logger.error(f"Failed to set field {field}: {str(e)}")
                        return Response(
                            {"error": f"Invalid value for field {field}: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            config.save()
            
            # Apply configuration using script if auto_apply is enabled
            auto_apply = request.data.get('auto_apply', True)
            if auto_apply:
                try:
                    success, message = config.apply_configuration()
                    
                    if success:
                        # Update router configuration status
                        router.configuration_status = 'configured'
                        router.configuration_type = 'hotspot'
                        router.last_configuration_update = timezone.now()
                        router.save()
                    else:
                        # Partial configuration
                        router.configuration_status = 'partially_configured'
                        router.save()
                        logger.warning(f"Hotspot configuration partially applied for router {router.id}: {message}")
                        
                except Exception as e:
                    logger.error(f"Failed to apply hotspot configuration for router {router.id}: {str(e)}")
                    return Response(
                        {"error": f"Configuration application failed: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            # Create audit log
            action = 'created' if created else 'updated'
            RouterAuditLog.objects.create(
                router=router,
                action='hotspot_config',
                description=f"Hotspot configuration {action} for {router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={'action': action, 'config_data': update_data, 'auto_applied': auto_apply}
            )
            
            # Send WebSocket update
            WebSocketManager.send_router_update(
                router.id, 
                'hotspot_config_updated', 
                {
                    'ssid': config.ssid, 
                    'auth_method': config.auth_method,
                    'configuration_applied': auto_apply
                }
            )
            
            serializer = HotspotConfigurationSerializer(config)
            return Response(serializer.data, 
                         status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Hotspot configuration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Configuration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PPPoEConfigView(APIView):
    """
    ENHANCED API View for managing PPPoE configuration on routers with script integration and comprehensive error handling.
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
            # Return default configuration with dynamic service name
            default_config = {
                'router': router.id,
                'ip_pool_name': 'pppoe-pool-1',
                'service_name': f"{router.name}-PPPoE",
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
        """Create or update PPPoE configuration with script automation and comprehensive error handling."""
        router = self.get_router(pk)
        
        try:
            # Get or create configuration
            config, created = PPPoEConfiguration.objects.get_or_create(router=router)
            
            # Update configuration data with validation
            for field, value in request.data.items():
                if hasattr(config, field):
                    try:
                        # Convert numeric fields with validation
                        if field in ['mtu', 'idle_timeout', 'session_timeout']:
                            try:
                                value = int(value)
                                # Validate ranges
                                if field == 'mtu' and (value < 576 or value > 1500):
                                    return Response(
                                        {"error": "MTU must be between 576 and 1500"},
                                        status=status.HTTP_400_BAD_REQUEST
                                    )
                                elif field in ['idle_timeout', 'session_timeout'] and value < 0:
                                    return Response(
                                        {"error": f"{field} cannot be negative"},
                                        status=status.HTTP_400_BAD_REQUEST
                                    )
                            except (ValueError, TypeError):
                                return Response(
                                    {"error": f"Invalid value for {field}. Must be a number."},
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                        setattr(config, field, value)
                    except Exception as e:
                        logger.error(f"Failed to set field {field}: {str(e)}")
                        return Response(
                            {"error": f"Invalid value for field {field}: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
            
            # Use dynamic service name if not provided
            if not config.service_name and router.name:
                config.service_name = f"{router.name}-PPPoE"
            
            config.save()
            
            # Apply configuration using script if auto_apply is enabled
            auto_apply = request.data.get('auto_apply', True)
            if auto_apply:
                try:
                    success, message = config.apply_configuration()
                    
                    if success:
                        # Update router configuration status
                        router.configuration_status = 'configured'
                        router.configuration_type = 'pppoe'
                        router.last_configuration_update = timezone.now()
                        router.save()
                    else:
                        # Partial configuration
                        router.configuration_status = 'partially_configured'
                        router.save()
                        logger.warning(f"PPPoE configuration partially applied for router {router.id}: {message}")
                        
                except Exception as e:
                    logger.error(f"Failed to apply PPPoE configuration for router {router.id}: {str(e)}")
                    return Response(
                        {"error": f"Configuration application failed: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
            # Create audit log
            action = 'created' if created else 'updated'
            RouterAuditLog.objects.create(
                router=router,
                action='pppoe_config',
                description=f"PPPoE configuration {action} for {router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={'action': action, 'config_data': request.data, 'auto_applied': auto_apply}
            )
            
            # Send WebSocket update
            WebSocketManager.send_router_update(
                router.id, 
                'pppoe_config_updated', 
                {
                    'service_name': config.service_name, 
                    'service_type': config.service_type,
                    'configuration_applied': auto_apply
                }
            )
            
            serializer = PPPoEConfigurationSerializer(config)
            return Response(serializer.data, 
                         status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"PPPoE configuration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Configuration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ScriptBasedConfigurationView(APIView):
    """
    PRODUCTION-READY API View for script-based router configuration and setup.
    Provides endpoints for automated MikroTik router setup using scripts with comprehensive error handling.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Execute script-based configuration on a router with comprehensive error handling.
        
        Request Body:
            script_type: 'basic_setup', 'hotspot_setup', 'pppoe_setup', 'full_setup'
            parameters: Custom parameters for the script
            dry_run: Whether to simulate without applying (default: false)
        """
        router = get_object_or_404(Router, pk=pk, is_active=True)
        
        script_type = request.data.get('script_type', 'basic_setup')
        parameters = request.data.get('parameters', {})
        dry_run = request.data.get('dry_run', False)
        
        # Validate script type
        valid_script_types = ['basic_setup', 'hotspot_setup', 'pppoe_setup', 'full_setup']
        if script_type not in valid_script_types:
            return Response(
                {"error": f"Invalid script type. Must be one of: {', '.join(valid_script_types)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Initialize auto config with error handling
            try:
                auto_config = MikroTikAutoConfig(
                    router.ip,
                    router.username,
                    router.password,
                    router.port
                )
            except Exception as e:
                logger.error(f"Failed to initialize MikroTikAutoConfig for router {router.id}: {str(e)}")
                return Response(
                    {"error": f"Failed to initialize configuration tool: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Execute script based on type
            try:
                if script_type == 'basic_setup':
                    success, message, details = auto_config.basic_router_setup(
                        router_name=router.name,
                        dry_run=dry_run
                    )
                elif script_type == 'hotspot_setup':
                    success, message, details = auto_config.setup_hotspot_only(
                        ssid=parameters.get('ssid', router.ssid),
                        dry_run=dry_run
                    )
                elif script_type == 'pppoe_setup':
                    success, message, details = auto_config.setup_pppoe_only(
                        service_name=parameters.get('service_name', f"{router.name}-PPPoE"),
                        dry_run=dry_run
                    )
                elif script_type == 'full_setup':
                    success, message, details = auto_config.auto_setup_router(
                        setup_type='both',
                        router_name=router.name,
                        dry_run=dry_run
                    )
                
            except Exception as e:
                logger.error(f"Script execution failed for router {router.id}: {str(e)}")
                return Response(
                    {"error": f"Script execution failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create audit log
            RouterAuditLog.objects.create(
                router=router,
                action='script_configuration',
                description=f"Script-based {script_type} executed on {router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                changes={
                    'script_type': script_type,
                    'parameters': parameters,
                    'dry_run': dry_run,
                    'success': success,
                    'message': message,
                    'details': details
                }
            )
            
            response_data = {
                'success': success,
                'message': message,
                'script_type': script_type,
                'dry_run': dry_run,
                'details': details
            }
            
            if success and not dry_run:
                try:
                    # Update router configuration status
                    router.configuration_status = 'configured'
                    if script_type in ['hotspot_setup', 'full_setup']:
                        router.configuration_type = 'hotspot' if script_type == 'hotspot_setup' else 'both'
                        if 'ssid' in details:
                            router.ssid = details['ssid']
                    elif script_type == 'pppoe_setup':
                        router.configuration_type = 'pppoe'
                    
                    router.last_configuration_update = timezone.now()
                    router.save()
                    
                    response_data['router_updated'] = True
                    
                except Exception as e:
                    logger.error(f"Failed to update router status after script execution: {str(e)}")
                    response_data['router_update_error'] = str(e)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Script configuration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Script configuration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request, pk):
        """Get available scripts and their parameters for a router with error handling."""
        router = get_object_or_404(Router, pk=pk, is_active=True)
        
        try:
            available_scripts = {
                'basic_setup': {
                    'name': 'Basic Router Setup',
                    'description': 'Configure basic router settings and enable API access',
                    'parameters': {
                        'router_name': 'string (optional) - Name for the router'
                    },
                    'estimated_duration': '2-5 minutes'
                },
                'hotspot_setup': {
                    'name': 'Hotspot Setup',
                    'description': 'Configure wireless hotspot with captive portal',
                    'parameters': {
                        'ssid': 'string (optional) - WiFi network name',
                        'bandwidth_limit': 'string (optional) - Default: 10M/10M',
                        'session_timeout': 'integer (optional) - Default: 60 minutes'
                    },
                    'estimated_duration': '5-10 minutes'
                },
                'pppoe_setup': {
                    'name': 'PPPoE Server Setup',
                    'description': 'Configure PPPoE server for user authentication',
                    'parameters': {
                        'service_name': 'string (optional) - PPPoE service name',
                        'bandwidth_limit': 'string (optional) - Default: 10M/10M'
                    },
                    'estimated_duration': '3-7 minutes'
                },
                'full_setup': {
                    'name': 'Full Setup',
                    'description': 'Complete setup with both hotspot and PPPoE',
                    'parameters': {
                        'router_name': 'string (optional) - Name for the router',
                        'ssid': 'string (optional) - WiFi network name',
                        'service_name': 'string (optional) - PPPoE service name'
                    },
                    'estimated_duration': '10-15 minutes'
                }
            }
            
            return Response({
                'router': {
                    'id': router.id,
                    'name': router.name,
                    'ip': router.ip,
                    'connection_status': router.connection_status
                },
                'available_scripts': available_scripts,
                'prerequisites': self.get_prerequisites()
            })
            
        except Exception as e:
            logger.error(f"Failed to get script information for router {router.id}: {str(e)}")
            return Response(
                {"error": "Failed to retrieve script information"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_prerequisites(self):
        """Get prerequisites for script execution."""
        return {
            'api_access': 'RouterOS API must be enabled on port 8728',
            'credentials': 'Valid admin credentials required',
            'network_connectivity': 'Router must be accessible from this server',
            'permissions': 'User must have full API permissions',
            'backup_recommended': 'Always backup router configuration before scripts'
        }

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')


class BulkActionView(APIView):
    """
    ENHANCED API View for performing bulk actions on routers with script integration and comprehensive error handling.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Enhanced bulk actions with script automation support and error handling."""
        action = request.data.get('action')
        router_ids = request.data.get('router_ids', [])
        
        if not router_ids:
            return Response(
                {"error": "router_ids array is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action == 'health_check':
            from network_management.api.views.router_management.router_connection_views import BulkConnectionTestView
            bulk_view = BulkConnectionTestView()
            return bulk_view.post(request)
        elif action == 'configure_hotspot':
            return self.bulk_configure_hotspot(request)
        elif action == 'configure_pppoe':
            return self.bulk_configure_pppoe(request)
        elif action == 'auto_setup_routers':
            return self.bulk_auto_setup(request)
        else:
            return Response(
                {"error": "Unsupported bulk action"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def bulk_configure_hotspot(self, request):
        """Apply hotspot configuration to multiple routers using scripts with comprehensive error handling."""
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
                # Use script-based configuration with error handling
                try:
                    auto_config = MikroTikAutoConfig(
                        router.ip,
                        router.username,
                        router.password,
                        router.port
                    )
                except Exception as e:
                    logger.error(f"Failed to initialize auto config for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'][router.id] = {
                        'status': 'failed', 
                        'message': f"Configuration tool initialization failed: {str(e)}"
                    }
                    continue
                
                # Apply hotspot configuration
                ssid = config_data.get('ssid') or router.ssid or f"{router.name}-WiFi"
                try:
                    success, message, details = auto_config.configure_hotspot(
                        ssid=ssid,
                        bandwidth_limit=config_data.get('bandwidth_limit', '10M'),
                        session_timeout=config_data.get('session_timeout', 60),
                        max_users=config_data.get('max_users', 50)
                    )
                    
                    if success:
                        results['successful'] += 1
                        results['details'][router.id] = {
                            'status': 'success', 
                            'message': message,
                            'ssid': ssid
                        }
                        
                        # Update router configuration
                        router.configuration_status = 'configured'
                        router.configuration_type = 'hotspot'
                        router.ssid = ssid
                        router.last_configuration_update = timezone.now()
                        router.save()
                    else:
                        results['failed'] += 1
                        results['details'][router.id] = {
                            'status': 'failed', 
                            'message': message
                        }
                        
                except Exception as e:
                    logger.error(f"Hotspot configuration failed for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'][router.id] = {
                        'status': 'failed', 
                        'message': f"Configuration execution failed: {str(e)}"
                    }
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][router.id] = {
                    'status': 'failed', 
                    'message': f"Unexpected error: {str(e)}"
                }
        
        return Response(results)

    def bulk_configure_pppoe(self, request):
        """Apply PPPoE configuration to multiple routers using scripts with comprehensive error handling."""
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
                # Use script-based configuration with error handling
                try:
                    auto_config = MikroTikAutoConfig(
                        router.ip,
                        router.username,
                        router.password,
                        router.port
                    )
                except Exception as e:
                    logger.error(f"Failed to initialize auto config for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'][router.id] = {
                        'status': 'failed', 
                        'message': f"Configuration tool initialization failed: {str(e)}"
                    }
                    continue
                
                # Apply PPPoE configuration
                service_name = config_data.get('service_name') or f"{router.name}-PPPoE"
                try:
                    success, message, details = auto_config.configure_pppoe(
                        service_name=service_name,
                        bandwidth_limit=config_data.get('bandwidth_limit', '10M'),
                        mtu=config_data.get('mtu', 1492)
                    )
                    
                    if success:
                        results['successful'] += 1
                        results['details'][router.id] = {
                            'status': 'success', 
                            'message': message,
                            'service_name': service_name
                        }
                        
                        # Update router configuration
                        router.configuration_status = 'configured'
                        router.configuration_type = 'pppoe'
                        router.last_configuration_update = timezone.now()
                        router.save()
                    else:
                        results['failed'] += 1
                        results['details'][router.id] = {
                            'status': 'failed', 
                            'message': message
                        }
                        
                except Exception as e:
                    logger.error(f"PPPoE configuration failed for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'][router.id] = {
                        'status': 'failed', 
                        'message': f"Configuration execution failed: {str(e)}"
                    }
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][router.id] = {
                    'status': 'failed', 
                    'message': f"Unexpected error: {str(e)}"
                }
        
        return Response(results)

    def bulk_auto_setup(self, request):
        """Perform automated setup on multiple routers using scripts with comprehensive error handling."""
        router_ids = request.data.get('router_ids', [])
        setup_type = request.data.get('setup_type', 'hotspot')  # 'hotspot', 'pppoe', or 'both'
        
        routers = Router.objects.filter(id__in=router_ids, is_active=True)
        results = {
            'total': routers.count(),
            'successful': 0,
            'failed': 0,
            'details': {}
        }
        
        for router in routers:
            try:
                # Use the automated setup script with error handling
                try:
                    auto_config = MikroTikAutoConfig(
                        router.ip,
                        router.username,
                        router.password,
                        router.port
                    )
                except Exception as e:
                    logger.error(f"Failed to initialize auto config for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'][router.id] = {
                        'status': 'failed', 
                        'message': f"Configuration tool initialization failed: {str(e)}"
                    }
                    continue
                
                # Perform automated setup
                try:
                    success, message, setup_details = auto_config.auto_setup_router(
                        setup_type=setup_type,
                        router_name=router.name
                    )
                    
                    if success:
                        results['successful'] += 1
                        results['details'][router.id] = {
                            'status': 'success', 
                            'message': message,
                            'setup_details': setup_details
                        }
                        
                        # Update router configuration
                        router.configuration_status = 'configured'
                        router.configuration_type = setup_type
                        router.last_configuration_update = timezone.now()
                        
                        if setup_type == 'hotspot' and 'ssid' in setup_details:
                            router.ssid = setup_details['ssid']
                        
                        router.save()
                    else:
                        results['failed'] += 1
                        results['details'][router.id] = {
                            'status': 'failed', 
                            'message': message
                        }
                        
                except Exception as e:
                    logger.error(f"Auto setup failed for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['details'][router.id] = {
                        'status': 'failed', 
                        'message': f"Setup execution failed: {str(e)}"
                    }
                    
            except Exception as e:
                results['failed'] += 1
                results['details'][router.id] = {
                    'status': 'failed', 
                    'message': f"Unexpected error: {str(e)}"
                }
        
        return Response(results)

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')