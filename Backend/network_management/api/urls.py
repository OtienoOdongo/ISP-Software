

# """
# Enhanced URL Configuration for Network Management System API - PRODUCTION READY

# This module provides comprehensive URL routing for all network management endpoints
# with proper organization, versioning support, and all connection management features.
# """

# from django.urls import path, include
# from network_management.api.views.router_management.router_configuration_views import (
#     ScriptBasedConfigurationView,
#     HotspotConfigView, 
#     PPPoEConfigView, 
#     BulkActionView
# )

# # Health and Session Views
# from network_management.api.views.router_management.router_health_views import (
#     RouterHealthCheckView,
#     RestoreSessionsView,
#     UserSessionRecoveryView
# )

# # Callback Configuration Views
# from network_management.api.views.router_management.router_callback_views import (
#     RouterCallbackConfigListView,
#     RouterCallbackConfigDetailView
# )

# from network_management.api.views.router_management.router_connection_views import (
#     TestRouterConnectionView, 
#     AutoConfigureRouterView, 
#     ConnectionTemplatesView,
#     BulkConnectionTestView, 
#     RouterConnectionHistoryView
# )

# from network_management.api.views.router_management.router_session_views import (
#     RouterActivateUserView,
#     SessionRecoveryView
# )

# from network_management.api.views.router_management.router_base_views import (
#     RouterListView, 
#     RouterDetailView
# )

# from network_management.api.views.router_management.router_monitoring_views import (
#     RouterStatsView, 
#     HealthMonitoringView, 
#     RouterRebootView
# )

# from network_management.api.views.router_management.router_user_management_views import (
#     HotspotUsersView, 
#     HotspotUserDetailView,
#     PPPoEUsersView, 
#     PPPoEUserDetailView
# )

# from network_management.api.views.router_management.router_bulk_operations_views import (
#     BulkOperationsView, 
#     BulkOperationStatusView, 
#     BulkOperationListView
# )

# from network_management.api.views.router_management.router_mac_detection_views import (
#     GetMacView
# )

# from network_management.api.views.router_management.router_audit_views import (
#     RouterAuditLogView, 
#     ComprehensiveAuditLogView, 
#     AuditLogExportView, 
#     AuditLogCleanupView
# )


# # Import views from other modules
# from network_management.api.views.bandwidth_allocation_view import (
#     BandwidthAllocationListView, BandwidthAllocationDetailView,
#     QoSProfileListView, BandwidthUsageStatsView
# )

# from network_management.api.views.ip_address_view import (
#     IPAddressListView, IPAddressDetailView,
#     SubnetListView, DHCPLeaseListView
# )

# from network_management.api.views.network_diagnostics_views import (
#     DiagnosticTestListView, DiagnosticTestBulkView, SpeedTestHistoryView
# )

# # API URL patterns organized by functionality
# urlpatterns = [
#     # =========================================================================
#     # ROUTER MANAGEMENT API ENDPOINTS
#     # =========================================================================
    
#     # Router CRUD Operations
#     path("routers/", RouterListView.as_view(), name="router-list"),
#     path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
    
#     # Router Connection Testing and Management
#     path("routers/test-connection/", TestRouterConnectionView.as_view(), name="test-router-connection"),
#     path("routers/<int:pk>/test-connection/", TestRouterConnectionView.as_view(), name="test-specific-router-connection"),
#     path("routers/<int:pk>/connection-history/", RouterConnectionHistoryView.as_view(), name="router-connection-history"),
#     path("routers/bulk-test-connection/", BulkConnectionTestView.as_view(), name="bulk-test-connection"),
    
#     # Automated Router Configuration
#     path("routers/auto-configure/", AutoConfigureRouterView.as_view(), name="auto-configure-router"),
#     path("routers/<int:pk>/auto-configure/", AutoConfigureRouterView.as_view(), name="auto-configure-specific-router"),
#     path("routers/configuration-templates/", ConnectionTemplatesView.as_view(), name="configuration-templates"),
    
#     # Script-Based Configuration
#     path("routers/<int:pk>/script-configuration/", ScriptBasedConfigurationView.as_view(), name="script-based-configuration"),
    
#     # Router Statistics and Monitoring
#     path("routers/<int:pk>/stats/", RouterStatsView.as_view(), name="router-stats"),
#     path("routers/<int:pk>/reboot/", RouterRebootView.as_view(), name="router-reboot"),
#     path("routers/<int:pk>/health-check/", RouterHealthCheckView.as_view(), name="router-health-check"),
#     path("routers/<int:pk>/system-metrics/", HealthMonitoringView.as_view(), name="router-system-metrics"),
#     path("health-monitoring/", HealthMonitoringView.as_view(), name="health-monitoring"),
    
#     # User Management
#     path("routers/<int:pk>/activate-user/", RouterActivateUserView.as_view(), name="router-activate-user"),
#     path("routers/<int:pk>/hotspot-users/", HotspotUsersView.as_view(), name="hotspot-users"),
#     path("routers/<int:pk>/pppoe-users/", PPPoEUsersView.as_view(), name="pppoe-users"),
#     path("hotspot-users/<int:pk>/", HotspotUserDetailView.as_view(), name="hotspot-user-detail"),
#     path("pppoe-users/<int:pk>/", PPPoEUserDetailView.as_view(), name="pppoe-user-detail"),
    
#     # Configuration Management
#     path("routers/<int:pk>/hotspot-config/", HotspotConfigView.as_view(), name="hotspot-config"),
#     path("routers/<int:pk>/pppoe-config/", PPPoEConfigView.as_view(), name="pppoe-config"),
#     path("routers/<int:pk>/callback-configs/", RouterCallbackConfigListView.as_view(), name="router-callback-configs"),
#     path("routers/<int:pk>/callback-configs/<int:callback_pk>/", RouterCallbackConfigDetailView.as_view(), name="router-callback-config-detail"),
    
#     # Session Management and Recovery
#     path("session-recovery/", SessionRecoveryView.as_view(), name="session-recovery"),
#     path("recover-session/", UserSessionRecoveryView.as_view(), name="user-session-recovery"),
#     path("routers/<int:pk>/restore-sessions/", RestoreSessionsView.as_view(), name="restore-sessions"),
#     path("recoverable-sessions/", SessionRecoveryView.as_view(), name="recoverable-sessions"),
    
#     # Bulk Operations
#     path("bulk-operations/", BulkOperationsView.as_view(), name="bulk-operations"),
#     path("bulk-operations/status/<uuid:operation_id>/", BulkOperationStatusView.as_view(), name="bulk-operation-status"),
#     path("bulk-operations/history/", BulkOperationListView.as_view(), name="bulk-operations-history"),
#     path("routers/bulk-action/", BulkActionView.as_view(), name="bulk-action"),
    
#     # MAC Address Detection
#     path("get-mac/", GetMacView.as_view(), name="get-mac"),
    
#     # Audit and Logging
#     path("audit-logs/", RouterAuditLogView.as_view(), name="router-audit-logs"),
#     path("audit-logs/comprehensive/", ComprehensiveAuditLogView.as_view(), name="comprehensive-audit-logs"),
#     path("audit-logs/export/", AuditLogExportView.as_view(), name="audit-logs-export"),
#     path("audit-logs/cleanup/", AuditLogCleanupView.as_view(), name="audit-logs-cleanup"),

#     # =========================================================================
#     # BANDWIDTH ALLOCATION API ENDPOINTS
#     # =========================================================================
#     path("allocations/", BandwidthAllocationListView.as_view(), name="bandwidth-allocation-list"),
#     path("allocations/<int:pk>/", BandwidthAllocationDetailView.as_view(), name="bandwidth-allocation-detail"),
#     path("qos-profiles/", QoSProfileListView.as_view(), name="qos-profile-list"),
#     path("usage-stats/", BandwidthUsageStatsView.as_view(), name="bandwidth-usage-stats"),

#     # =========================================================================
#     # IP ADDRESS MANAGEMENT API ENDPOINTS
#     # =========================================================================
#     path("ip-addresses/", IPAddressListView.as_view(), name="ip-address-list"),
#     path("ip-addresses/<int:pk>/", IPAddressDetailView.as_view(), name="ip-address-detail"),
#     path("subnets/", SubnetListView.as_view(), name="subnet-list"),
#     path("dhcp-leases/", DHCPLeaseListView.as_view(), name="dhcp-lease-list"),

#     # =========================================================================
#     # NETWORK DIAGNOSTICS API ENDPOINTS
#     # =========================================================================
#     path("tests/", DiagnosticTestListView.as_view(), name="diagnostic-test-list"),
#     path("tests/bulk/", DiagnosticTestBulkView.as_view(), name="diagnostic-test-bulk"),
#     path("speed-test-history/", SpeedTestHistoryView.as_view(), name="speed-test-history"),
# ]




# class URLConfigurationManager:
#     """
#     Enhanced Manager for URL configuration and validation with all endpoints.
#     """
    
#     @staticmethod
#     def get_url_patterns():
#         """
#         Get all URL patterns with metadata including all endpoints.
        
#         Returns:
#             list: URL patterns with metadata
#         """
#         url_metadata = []
        
#         for url_pattern in urlpatterns:
#             pattern_info = {
#                 'pattern': str(url_pattern.pattern),
#                 'name': getattr(url_pattern, 'name', 'Unnamed'),
#                 'view_class': getattr(url_pattern.callback, 'view_class', None).__name__ if hasattr(url_pattern.callback, 'view_class') else 'Unknown',
#                 'methods': getattr(url_pattern.callback, 'http_method_names', ['GET']),
#             }
#             url_metadata.append(pattern_info)
        
#         return url_metadata
    
#     @staticmethod
#     def validate_url_configuration():
#         """
#         Validate URL configuration for consistency and completeness with all endpoints.
        
#         Returns:
#             dict: Validation results
#         """
#         validation_results = {
#             'total_endpoints': len(urlpatterns),
#             'endpoints_by_category': {},
#             'missing_endpoints': [],
#             'duplicate_endpoints': [],
#             'validation_passed': True
#         }
        
#         # Categorize endpoints
#         categories = {
#             'router_management': 0,
#             'connection_management': 0,
#             'script_configuration': 0,
#             'bandwidth_management': 0,
#             'ip_management': 0,
#             'diagnostics': 0,
#             'audit_logs': 0,
#             'bulk_operations': 0,
#             'user_management': 0,
#             'configuration': 0,
#             'session_management': 0,
#         }
        
#         pattern_names = set()
        
#         for url_pattern in urlpatterns:
#             pattern_str = str(url_pattern.pattern)
#             pattern_name = getattr(url_pattern, 'name', 'Unnamed')
            
#             # Check for duplicate names
#             if pattern_name in pattern_names and pattern_name != 'Unnamed':
#                 validation_results['duplicate_endpoints'].append(pattern_name)
#             pattern_names.add(pattern_name)
            
#             # Categorize by URL pattern
#             if pattern_str.startswith('routers/') and not any(x in pattern_str for x in ['test-connection', 'auto-configure', 'script-configuration']):
#                 categories['router_management'] += 1
#             elif 'test-connection' in pattern_str or 'connection-history' in pattern_str or 'auto-configure' in pattern_str:
#                 categories['connection_management'] += 1
#             elif 'script-configuration' in pattern_str:
#                 categories['script_configuration'] += 1
#             elif pattern_str.startswith('allocations/') or pattern_str.startswith('qos-profiles/') or pattern_str.startswith('usage-stats/'):
#                 categories['bandwidth_management'] += 1
#             elif pattern_str.startswith('ip-addresses/') or pattern_str.startswith('subnets/') or pattern_str.startswith('dhcp-leases/'):
#                 categories['ip_management'] += 1
#             elif pattern_str.startswith('tests/') or pattern_str.startswith('speed-test-history/'):
#                 categories['diagnostics'] += 1
#             elif pattern_str.startswith('audit-logs/'):
#                 categories['audit_logs'] += 1
#             elif pattern_str.startswith('bulk-operations/'):
#                 categories['bulk_operations'] += 1
#             elif 'user' in pattern_str.lower() and 'activate' not in pattern_str.lower():
#                 categories['user_management'] += 1
#             elif pattern_str.startswith('get-mac/') or pattern_str.startswith('webhooks/') or 'config' in pattern_str.lower():
#                 categories['configuration'] += 1
#             elif 'session' in pattern_str.lower() or 'recovery' in pattern_str.lower():
#                 categories['session_management'] += 1
        
#         validation_results['endpoints_by_category'] = categories
        
#         # Check for missing essential endpoints
#         essential_endpoints = [
#             'router-list',
#             'router-detail', 
#             'router-stats',
#             'health-monitoring',
#             'test-router-connection',
#             'auto-configure-router',
#             'session-recovery',
#             'bulk-operations',
#             'audit-logs',
#             'hotspot-config',
#             'pppoe-config'
#         ]
        
#         for endpoint in essential_endpoints:
#             if endpoint not in pattern_names:
#                 validation_results['missing_endpoints'].append(endpoint)
#                 validation_results['validation_passed'] = False
        
#         return validation_results
    
#     @staticmethod
#     def get_api_version():
#         """
#         Get API version information with all features.
        
#         Returns:
#             dict: API version details
#         """
#         return {
#             'version': '2.0.0',
#             'base_path': '/api/network_management/',
#             'supported_versions': ['1.0.0', '2.0.0'],
#             'deprecated': False,
#             'documentation_url': '/api/docs/',
#             'new_features': [
#                 'MikroTik Connection Management',
#                 'Automated Router Configuration', 
#                 'Script-Based Setup',
#                 'Dynamic SSID Support',
#                 'Connection Testing & Diagnostics',
#                 'Bulk Connection Operations',
#                 'Enhanced Monitoring',
#                 'Comprehensive Audit Logging',
#                 'Session Recovery',
#                 'Bandwidth Management',
#                 'IP Address Management',
#                 'Network Diagnostics'
#             ]
#         }
    
#     @staticmethod
#     def get_endpoint_categories():
#         """
#         Get organized endpoint categories for documentation.
        
#         Returns:
#             dict: Categorized endpoints
#         """
#         categories = {
#             'router_management': {
#                 'name': 'Router Management',
#                 'description': 'CRUD operations for router management',
#                 'endpoints': [
#                     'router-list', 'router-detail', 'router-stats', 'router-reboot'
#                 ]
#             },
#             'connection_management': {
#                 'name': 'Connection Management', 
#                 'description': 'MikroTik router connection testing and management',
#                 'endpoints': [
#                     'test-router-connection', 'bulk-test-connection', 
#                     'router-connection-history', 'auto-configure-router',
#                     'configuration-templates'
#                 ]
#             },
#             'script_configuration': {
#                 'name': 'Script-Based Configuration',
#                 'description': 'Automated router setup using scripts',
#                 'endpoints': [
#                     'script-based-configuration'
#                 ]
#             },
#             'user_management': {
#                 'name': 'User Management',
#                 'description': 'Hotspot and PPPoE user management',
#                 'endpoints': [
#                     'router-activate-user', 'hotspot-users', 'pppoe-users',
#                     'hotspot-user-detail', 'pppoe-user-detail'
#                 ]
#             },
#             'configuration': {
#                 'name': 'Router Configuration',
#                 'description': 'Router configuration management',
#                 'endpoints': [
#                     'hotspot-config', 'pppoe-config', 'router-callback-configs'
#                 ]
#             },
#             'session_management': {
#                 'name': 'Session Management',
#                 'description': 'User session management and recovery',
#                 'endpoints': [
#                     'session-recovery', 'user-session-recovery', 'restore-sessions'
#                 ]
#             },
#             'bulk_operations': {
#                 'name': 'Bulk Operations',
#                 'description': 'Bulk operations on multiple routers',
#                 'endpoints': [
#                     'bulk-operations', 'bulk-operation-status', 'bulk-operations-history'
#                 ]
#             },
#             'audit_logs': {
#                 'name': 'Audit & Logging',
#                 'description': 'System audit and logging',
#                 'endpoints': [
#                     'router-audit-logs', 'comprehensive-audit-logs',
#                     'audit-logs-export', 'audit-logs-cleanup'
#                 ]
#             },
#             'diagnostics': {
#                 'name': 'Network Diagnostics',
#                 'description': 'Network testing and diagnostics',
#                 'endpoints': [
#                     'diagnostic-test-list', 'diagnostic-test-bulk', 'speed-test-history'
#                 ]
#             },
#             'bandwidth_management': {
#                 'name': 'Bandwidth Management',
#                 'description': 'Bandwidth allocation and QoS management',
#                 'endpoints': [
#                     'bandwidth-allocation-list', 'bandwidth-allocation-detail',
#                     'qos-profile-list', 'bandwidth-usage-stats'
#                 ]
#             },
#             'ip_management': {
#                 'name': 'IP Address Management',
#                 'description': 'IP address and subnet management',
#                 'endpoints': [
#                     'ip-address-list', 'ip-address-detail',
#                     'subnet-list', 'dhcp-lease-list'
#                 ]
#             },
#             'utilities': {
#                 'name': 'Utilities',
#                 'description': 'Utility endpoints and tools',
#                 'endpoints': [
#                     'get-mac'
#                 ]
#             }
#         }
        
#         return categories
    
#     @staticmethod
#     def generate_api_documentation():
#         """
#         Generate API documentation from URL patterns.
        
#         Returns:
#             dict: API documentation structure
#         """
#         documentation = {
#             'api_info': URLConfigurationManager.get_api_version(),
#             'categories': URLConfigurationManager.get_endpoint_categories(),
#             'validation': URLConfigurationManager.validate_url_configuration(),
#             'total_endpoints': len(urlpatterns)
#         }
        
#         return documentation


# # Export the URL patterns
# __all__ = ['urlpatterns', 'URLConfigurationManager']


# # URL Configuration for main project integration
# def get_network_management_urls():
#     """
#     Get network management URLs for inclusion in main project urls.py
    
#     Usage in main urls.py:
#         path('api/network_management/', include('network_management.urls')),
#     """
#     return urlpatterns


# # Health check endpoint for load balancers and monitoring
# def get_health_check_url():
#     """
#     Get health check URL pattern for monitoring
    
#     Returns:
#         URL pattern for health checks
#     """
#     from django.http import JsonResponse
#     from django.urls import path
    
#     def health_check(request):
#         return JsonResponse({
#             'status': 'healthy',
#             'timestamp': 'current_timestamp',  # You might want to use timezone.now()
#             'service': 'network_management',
#             'version': '2.0.0'
#         })
    
#     return path('health/', health_check, name='health-check')








"""
Enhanced URL Configuration for Network Management System API - PRODUCTION READY

This module provides comprehensive URL routing for all network management endpoints
with proper organization, versioning support, and all connection management features.
"""

from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone

# Router Management Views
from network_management.api.views.router_management.router_base_views import (
    RouterListView, 
    RouterDetailView
)

from network_management.api.views.router_management.router_connection_views import (
    TestRouterConnectionView, 
    AutoConfigureRouterView, 
    ConnectionTemplatesView,
    BulkConnectionTestView, 
    RouterConnectionHistoryView
)

from network_management.api.views.router_management.router_configuration_views import (
    ScriptBasedConfigurationView,
    HotspotConfigView, 
    PPPoEConfigView, 
    BulkActionView
)

from network_management.api.views.router_management.router_monitoring_views import (
    RouterStatsView, 
    HealthMonitoringView, 
    RouterRebootView
)

from network_management.api.views.router_management.router_health_views import (
    RouterHealthCheckView,
    RestoreSessionsView,
    UserSessionRecoveryView
)

from network_management.api.views.router_management.router_session_views import (
    RouterActivateUserView,
    SessionRecoveryView
)

from network_management.api.views.router_management.router_user_management_views import (
    HotspotUsersView, 
    HotspotUserDetailView,
    PPPoEUsersView, 
    PPPoEUserDetailView
)

from network_management.api.views.router_management.router_callback_views import (
    RouterCallbackConfigListView,
    RouterCallbackConfigDetailView
)

from network_management.api.views.router_management.router_bulk_operations_views import (
    BulkOperationsView, 
    BulkOperationStatusView, 
    BulkOperationListView
)

from network_management.api.views.router_management.router_mac_detection_views import (
    GetMacView
)

from network_management.api.views.router_management.router_audit_views import (
    RouterAuditLogView, 
    ComprehensiveAuditLogView, 
    AuditLogExportView, 
    AuditLogCleanupView
)

# Bandwidth Management Views
from network_management.api.views.bandwidth_allocation_view import (
    BandwidthAllocationListView, 
    BandwidthAllocationDetailView,
    QoSProfileListView, 
    BandwidthUsageStatsView
)

# IP Address Management Views
from network_management.api.views.ip_address_view import (
    IPAddressListView, 
    IPAddressDetailView,
    SubnetListView, 
    DHCPLeaseListView
)

# Network Diagnostics Views
from network_management.api.views.network_diagnostics_views import (
    DiagnosticTestListView, 
    DiagnosticTestBulkView, 
    SpeedTestHistoryView
)


# API URL patterns organized by functionality
urlpatterns = [
    # =========================================================================
    # ROUTER MANAGEMENT API ENDPOINTS
    # =========================================================================
    
    # Router CRUD Operations
    path("routers/", RouterListView.as_view(), name="router-list"),
    path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
    
    # Router Connection Testing and Management
    path("routers/test-connection/", TestRouterConnectionView.as_view(), name="test-router-connection"),
    path("routers/<int:pk>/test-connection/", TestRouterConnectionView.as_view(), name="test-specific-router-connection"),
    path("routers/<int:pk>/connection-history/", RouterConnectionHistoryView.as_view(), name="router-connection-history"),
    path("routers/bulk-test-connection/", BulkConnectionTestView.as_view(), name="bulk-test-connection"),
    
    # Automated Router Configuration
    path("routers/auto-configure/", AutoConfigureRouterView.as_view(), name="auto-configure-router"),
    path("routers/<int:pk>/auto-configure/", AutoConfigureRouterView.as_view(), name="auto-configure-specific-router"),
    path("routers/configuration-templates/", ConnectionTemplatesView.as_view(), name="configuration-templates"),
    
    # Script-Based Configuration
    path("routers/<int:pk>/script-configuration/", ScriptBasedConfigurationView.as_view(), name="script-based-configuration"),
    
    # Router Statistics and Monitoring
    path("routers/<int:pk>/stats/", RouterStatsView.as_view(), name="router-stats"),
    path("routers/<int:pk>/reboot/", RouterRebootView.as_view(), name="router-reboot"),
    path("routers/<int:pk>/health-check/", RouterHealthCheckView.as_view(), name="router-health-check"),
    path("routers/<int:pk>/system-metrics/", HealthMonitoringView.as_view(), name="router-system-metrics"),
    path("health-monitoring/", HealthMonitoringView.as_view(), name="health-monitoring"),
    
    # User Management
    path("routers/<int:pk>/activate-user/", RouterActivateUserView.as_view(), name="router-activate-user"),
    path("routers/<int:pk>/hotspot-users/", HotspotUsersView.as_view(), name="hotspot-users"),
    path("routers/<int:pk>/pppoe-users/", PPPoEUsersView.as_view(), name="pppoe-users"),
    path("hotspot-users/<int:pk>/", HotspotUserDetailView.as_view(), name="hotspot-user-detail"),
    path("pppoe-users/<int:pk>/", PPPoEUserDetailView.as_view(), name="pppoe-user-detail"),
    
    # Configuration Management
    path("routers/<int:pk>/hotspot-config/", HotspotConfigView.as_view(), name="hotspot-config"),
    path("routers/<int:pk>/pppoe-config/", PPPoEConfigView.as_view(), name="pppoe-config"),
    path("routers/<int:pk>/callback-configs/", RouterCallbackConfigListView.as_view(), name="router-callback-configs"),
    path("routers/<int:pk>/callback-configs/<int:callback_pk>/", RouterCallbackConfigDetailView.as_view(), name="router-callback-config-detail"),
    
    # Session Management and Recovery
    path("session-recovery/", SessionRecoveryView.as_view(), name="session-recovery"),
    path("recover-session/", UserSessionRecoveryView.as_view(), name="user-session-recovery"),
    path("routers/<int:pk>/restore-sessions/", RestoreSessionsView.as_view(), name="restore-sessions"),
    path("recoverable-sessions/", SessionRecoveryView.as_view(), name="recoverable-sessions"),
    
    # Bulk Operations
    path("bulk-operations/", BulkOperationsView.as_view(), name="bulk-operations"),
    path("bulk-operations/status/<uuid:operation_id>/", BulkOperationStatusView.as_view(), name="bulk-operation-status"),
    path("bulk-operations/history/", BulkOperationListView.as_view(), name="bulk-operations-history"),
    path("routers/bulk-action/", BulkActionView.as_view(), name="bulk-action"),
    
    # MAC Address Detection
    path("get-mac/", GetMacView.as_view(), name="get-mac"),
    
    # Audit and Logging
    path("audit-logs/", RouterAuditLogView.as_view(), name="router-audit-logs"),
    path("audit-logs/comprehensive/", ComprehensiveAuditLogView.as_view(), name="comprehensive-audit-logs"),
    path("audit-logs/export/", AuditLogExportView.as_view(), name="audit-logs-export"),
    path("audit-logs/cleanup/", AuditLogCleanupView.as_view(), name="audit-logs-cleanup"),

    # =========================================================================
    # BANDWIDTH ALLOCATION API ENDPOINTS
    # =========================================================================
    path("allocations/", BandwidthAllocationListView.as_view(), name="bandwidth-allocation-list"),
    path("allocations/<int:pk>/", BandwidthAllocationDetailView.as_view(), name="bandwidth-allocation-detail"),
    path("qos-profiles/", QoSProfileListView.as_view(), name="qos-profile-list"),
    path("usage-stats/", BandwidthUsageStatsView.as_view(), name="bandwidth-usage-stats"),

    # =========================================================================
    # IP ADDRESS MANAGEMENT API ENDPOINTS
    # =========================================================================
    path("ip-addresses/", IPAddressListView.as_view(), name="ip-address-list"),
    path("ip-addresses/<int:pk>/", IPAddressDetailView.as_view(), name="ip-address-detail"),
    path("subnets/", SubnetListView.as_view(), name="subnet-list"),
    path("dhcp-leases/", DHCPLeaseListView.as_view(), name="dhcp-lease-list"),

    # =========================================================================
    # NETWORK DIAGNOSTICS API ENDPOINTS
    # =========================================================================
    path("tests/", DiagnosticTestListView.as_view(), name="diagnostic-test-list"),
    path("tests/bulk/", DiagnosticTestBulkView.as_view(), name="diagnostic-test-bulk"),
    path("speed-test-history/", SpeedTestHistoryView.as_view(), name="speed-test-history"),
    
    # =========================================================================
    # SYSTEM HEALTH AND UTILITY ENDPOINTS
    # =========================================================================
    path("health/", lambda request: JsonResponse({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'service': 'network_management',
        'version': '2.1.0'
    }), name="health-check"),
]


class URLConfigurationManager:
    """
    Enhanced Manager for URL configuration and validation with all endpoints.
    """
    
    @staticmethod
    def get_url_patterns():
        """
        Get all URL patterns with metadata including all endpoints.
        
        Returns:
            list: URL patterns with metadata
        """
        url_metadata = []
        
        for url_pattern in urlpatterns:
            # Extract view class name safely
            view_class = 'Unknown'
            if hasattr(url_pattern.callback, 'view_class'):
                view_class = url_pattern.callback.view_class.__name__
            elif hasattr(url_pattern.callback, 'cls'):
                view_class = url_pattern.callback.cls.__name__
            
            pattern_info = {
                'pattern': str(url_pattern.pattern),
                'name': getattr(url_pattern, 'name', 'Unnamed'),
                'view_class': view_class,
                'methods': getattr(url_pattern.callback, 'http_method_names', ['GET']) if hasattr(url_pattern.callback, 'http_method_names') else ['GET'],
            }
            url_metadata.append(pattern_info)
        
        return url_metadata
    
    @staticmethod
    def validate_url_configuration():
        """
        Validate URL configuration for consistency and completeness with all endpoints.
        
        Returns:
            dict: Validation results
        """
        validation_results = {
            'total_endpoints': len(urlpatterns),
            'endpoints_by_category': {},
            'missing_endpoints': [],
            'duplicate_endpoints': [],
            'validation_passed': True,
            'timestamp': timezone.now().isoformat()
        }
        
        # Categorize endpoints
        categories = {
            'router_management': 0,
            'connection_management': 0,
            'script_configuration': 0,
            'bandwidth_management': 0,
            'ip_management': 0,
            'diagnostics': 0,
            'audit_logs': 0,
            'bulk_operations': 0,
            'user_management': 0,
            'configuration': 0,
            'session_management': 0,
            'system_health': 0,
        }
        
        pattern_names = set()
        
        for url_pattern in urlpatterns:
            pattern_str = str(url_pattern.pattern)
            pattern_name = getattr(url_pattern, 'name', 'Unnamed')
            
            # Check for duplicate names
            if pattern_name in pattern_names and pattern_name != 'Unnamed':
                validation_results['duplicate_endpoints'].append({
                    'name': pattern_name,
                    'pattern': pattern_str
                })
            pattern_names.add(pattern_name)
            
            # Categorize by URL pattern
            if pattern_str.startswith('routers/') and not any(x in pattern_str for x in ['test-connection', 'auto-configure', 'script-configuration']):
                categories['router_management'] += 1
            elif 'test-connection' in pattern_str or 'connection-history' in pattern_str or 'auto-configure' in pattern_str:
                categories['connection_management'] += 1
            elif 'script-configuration' in pattern_str:
                categories['script_configuration'] += 1
            elif pattern_str.startswith('allocations/') or pattern_str.startswith('qos-profiles/') or pattern_str.startswith('usage-stats/'):
                categories['bandwidth_management'] += 1
            elif pattern_str.startswith('ip-addresses/') or pattern_str.startswith('subnets/') or pattern_str.startswith('dhcp-leases/'):
                categories['ip_management'] += 1
            elif pattern_str.startswith('tests/') or pattern_str.startswith('speed-test-history/'):
                categories['diagnostics'] += 1
            elif pattern_str.startswith('audit-logs/'):
                categories['audit_logs'] += 1
            elif pattern_str.startswith('bulk-operations/'):
                categories['bulk_operations'] += 1
            elif 'user' in pattern_str.lower() and 'activate' not in pattern_str.lower():
                categories['user_management'] += 1
            elif pattern_str.startswith('get-mac/') or 'config' in pattern_str.lower():
                categories['configuration'] += 1
            elif 'session' in pattern_str.lower() or 'recovery' in pattern_str.lower():
                categories['session_management'] += 1
            elif pattern_str == 'health/':
                categories['system_health'] += 1
        
        validation_results['endpoints_by_category'] = categories
        
        # Check for missing essential endpoints
        essential_endpoints = [
            'router-list',
            'router-detail', 
            'router-stats',
            'health-monitoring',
            'test-router-connection',
            'auto-configure-router',
            'session-recovery',
            'bulk-operations',
            'audit-logs',
            'hotspot-config',
            'pppoe-config',
            'health-check'
        ]
        
        for endpoint in essential_endpoints:
            if endpoint not in pattern_names:
                validation_results['missing_endpoints'].append(endpoint)
                validation_results['validation_passed'] = False
        
        return validation_results
    
    @staticmethod
    def get_api_version():
        """
        Get API version information with all features.
        
        Returns:
            dict: API version details
        """
        return {
            'version': '2.1.0',
            'base_path': '/api/network_management/',
            'supported_versions': ['1.0.0', '2.0.0', '2.1.0'],
            'deprecated': False,
            'documentation_url': '/api/docs/',
            'timestamp': timezone.now().isoformat(),
            'new_features': [
                'Enhanced MikroTik Connection Management',
                'Automated Router Configuration with Dynamic SSID', 
                'Script-Based Setup with Templates',
                'Comprehensive Connection Testing & Diagnostics',
                'Bulk Connection Operations',
                'Enhanced Monitoring with WebSocket Support',
                'Comprehensive Audit Logging',
                'Session Recovery and Management',
                'Bandwidth Management with QoS',
                'IP Address Management',
                'Network Diagnostics and Speed Testing',
                'Health Monitoring and System Metrics'
            ],
            'security_features': [
                'JWT Authentication',
                'IP Address Validation',
                'SSL/TLS Support',
                'Credential Security Validation',
                'Audit Logging'
            ]
        }
    
    @staticmethod
    def get_endpoint_categories():
        """
        Get organized endpoint categories for documentation.
        
        Returns:
            dict: Categorized endpoints
        """
        categories = {
            'router_management': {
                'name': 'Router Management',
                'description': 'CRUD operations for router management with enhanced connection testing',
                'endpoints': [
                    'router-list', 'router-detail', 'router-stats', 'router-reboot',
                    'router-health-check', 'router-system-metrics'
                ]
            },
            'connection_management': {
                'name': 'Connection Management', 
                'description': 'MikroTik router connection testing, validation and management',
                'endpoints': [
                    'test-router-connection', 'bulk-test-connection', 
                    'router-connection-history', 'auto-configure-router',
                    'configuration-templates'
                ]
            },
            'script_configuration': {
                'name': 'Script-Based Configuration',
                'description': 'Automated router setup using scripts with template support',
                'endpoints': [
                    'script-based-configuration'
                ]
            },
            'user_management': {
                'name': 'User Management',
                'description': 'Hotspot and PPPoE user management with session control',
                'endpoints': [
                    'router-activate-user', 'hotspot-users', 'pppoe-users',
                    'hotspot-user-detail', 'pppoe-user-detail'
                ]
            },
            'configuration': {
                'name': 'Router Configuration',
                'description': 'Router configuration management with callback support',
                'endpoints': [
                    'hotspot-config', 'pppoe-config', 'router-callback-configs'
                ]
            },
            'session_management': {
                'name': 'Session Management',
                'description': 'User session management and recovery with automated restoration',
                'endpoints': [
                    'session-recovery', 'user-session-recovery', 'restore-sessions'
                ]
            },
            'bulk_operations': {
                'name': 'Bulk Operations',
                'description': 'Bulk operations on multiple routers with status tracking',
                'endpoints': [
                    'bulk-operations', 'bulk-operation-status', 'bulk-operations-history',
                    'bulk-action'
                ]
            },
            'audit_logs': {
                'name': 'Audit & Logging',
                'description': 'Comprehensive system audit and logging with export capabilities',
                'endpoints': [
                    'router-audit-logs', 'comprehensive-audit-logs',
                    'audit-logs-export', 'audit-logs-cleanup'
                ]
            },
            'diagnostics': {
                'name': 'Network Diagnostics',
                'description': 'Network testing, diagnostics and performance monitoring',
                'endpoints': [
                    'diagnostic-test-list', 'diagnostic-test-bulk', 'speed-test-history'
                ]
            },
            'bandwidth_management': {
                'name': 'Bandwidth Management',
                'description': 'Bandwidth allocation, QoS management and usage statistics',
                'endpoints': [
                    'bandwidth-allocation-list', 'bandwidth-allocation-detail',
                    'qos-profile-list', 'bandwidth-usage-stats'
                ]
            },
            'ip_management': {
                'name': 'IP Address Management',
                'description': 'IP address allocation, subnet management and DHCP lease tracking',
                'endpoints': [
                    'ip-address-list', 'ip-address-detail',
                    'subnet-list', 'dhcp-lease-list'
                ]
            },
            'utilities': {
                'name': 'Utilities',
                'description': 'Utility endpoints and tools for network operations',
                'endpoints': [
                    'get-mac'
                ]
            },
            'system_health': {
                'name': 'System Health',
                'description': 'System health monitoring and status endpoints',
                'endpoints': [
                    'health-check', 'health-monitoring'
                ]
            }
        }
        
        return categories
    
    @staticmethod
    def generate_api_documentation():
        """
        Generate API documentation from URL patterns.
        
        Returns:
            dict: API documentation structure
        """
        documentation = {
            'api_info': URLConfigurationManager.get_api_version(),
            'categories': URLConfigurationManager.get_endpoint_categories(),
            'validation': URLConfigurationManager.validate_url_configuration(),
            'total_endpoints': len(urlpatterns),
            'timestamp': timezone.now().isoformat()
        }
        
        return documentation
    
    @staticmethod
    def get_endpoint_statistics():
        """
        Get detailed statistics about API endpoints.
        
        Returns:
            dict: Endpoint statistics
        """
        url_metadata = URLConfigurationManager.get_url_patterns()
        
        statistics = {
            'total_endpoints': len(url_metadata),
            'endpoints_by_method': {},
            'endpoints_by_view_class': {},
            'most_common_patterns': {}
        }
        
        # Count by HTTP methods
        method_counts = {}
        view_class_counts = {}
        pattern_counts = {}
        
        for endpoint in url_metadata:
            # Methods count
            for method in endpoint.get('methods', []):
                method_counts[method.upper()] = method_counts.get(method.upper(), 0) + 1
            
            # View class count
            view_class = endpoint.get('view_class', 'Unknown')
            view_class_counts[view_class] = view_class_counts.get(view_class, 0) + 1
            
            # Pattern analysis
            pattern = endpoint.get('pattern', '')
            if 'pk' in pattern:
                pattern_type = 'detail'
            elif pattern.endswith('/'):
                pattern_type = 'list'
            else:
                pattern_type = 'action'
            
            pattern_counts[pattern_type] = pattern_counts.get(pattern_type, 0) + 1
        
        statistics['endpoints_by_method'] = method_counts
        statistics['endpoints_by_view_class'] = view_class_counts
        statistics['pattern_types'] = pattern_counts
        
        return statistics


# Export the URL patterns
__all__ = ['urlpatterns', 'URLConfigurationManager']


# URL Configuration for main project integration
def get_network_management_urls():
    """
    Get network management URLs for inclusion in main project urls.py
    
    Usage in main urls.py:
        path('api/network_management/', include('network_management.urls')),
    
    Returns:
        list: URL patterns for network management API
    """
    return urlpatterns


# Health check endpoint for load balancers and monitoring
def get_health_check_url():
    """
    Get health check URL pattern for monitoring
    
    Returns:
        URL pattern for health checks
    """
    def health_check(request):
        return JsonResponse({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'service': 'network_management',
            'version': '2.1.0',
            'endpoints_count': len(urlpatterns),
            'api_status': 'operational'
        })
    
    return path('health/', health_check, name='health-check')


# Utility function to get API information
def get_api_info(request):
    """
    API information endpoint for discovery and documentation
    
    Returns:
        JsonResponse: API information
    """
    return JsonResponse({
        'api_name': 'Network Management System API',
        'version': '2.1.0',
        'description': 'Comprehensive network management system with MikroTik router integration',
        'endpoints_count': len(urlpatterns),
        'documentation': '/api/docs/',
        'categories': URLConfigurationManager.get_endpoint_categories(),
        'timestamp': timezone.now().isoformat()
    })


# Add API info endpoint to urlpatterns if not already present
if 'api-info' not in [url.name for url in urlpatterns if hasattr(url, 'name')]:
    urlpatterns.append(path("api-info/", get_api_info, name="api-info"))