



# # network_management/urls.py
# from django.urls import path
# from network_management.api.views.router_management_view import (
#     RouterDetailView,
#     RouterListView,
#     RouterStatsView,
#     RouterRebootView,
#     HotspotConfigView,
#     PPPoEConfigView,
#     HotspotUserDetailView,
#     PPPoEUserDetailView,
#     HotspotUsersView,
#     PPPoEUsersView,
#     BulkActionView,
#     RouterActivateUserView,
#     GetMacView,
#     RouterHealthCheckView,
#     RestoreSessionsView,
#     UserSessionRecoveryView,
#     RouterCallbackConfigListView,
#     RouterCallbackConfigDetailView,
#     SessionRecoveryView,
#     BulkOperationsView,
#     HealthMonitoringView,
#     RouterAuditLogView,
# )
# from network_management.api.views.bandwidth_allocation_view import (
#     BandwidthAllocationListView,
#     BandwidthAllocationDetailView,
#     QoSProfileListView,
#     BandwidthUsageStatsView
# )
# from network_management.api.views.ip_address_view import (
#     IPAddressListView,
#     IPAddressDetailView,
#     SubnetListView,
#     DHCPLeaseListView
# )
# from network_management.api.views.network_diagnostics_views import (
#     DiagnosticTestListView, DiagnosticTestBulkView, SpeedTestHistoryView
# )

# urlpatterns = [
#     # =========================================================================
#     # ROUTER MANAGEMENT API ENDPOINTS
#     # =========================================================================
    
#     # Router CRUD Operations
#     path("routers/", RouterListView.as_view(), name="router-list"),
#     path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
    
#     # Router Statistics and Monitoring
#     path("routers/<int:pk>/stats/", RouterStatsView.as_view(), name="router-stats"),
#     path("routers/<int:pk>/reboot/", RouterRebootView.as_view(), name="router-reboot"),
#     path("health-monitoring/", HealthMonitoringView.as_view(), name="health-monitoring"),
#     path("health-check/", RouterHealthCheckView.as_view(), name="router-health-check"),
    
#     # User Management
#     path("routers/<int:pk>/activate-user/", RouterActivateUserView.as_view(), name="router-activate-user"),
#     path("routers/<int:pk>/hotspot-users/", HotspotUsersView.as_view(), name="hotspot-users"),
#     path("routers/<int:pk>/pppoe-users/", PPPoEUsersView.as_view(), name="pppoe-users"),
#     path("hotspot-users/<int:pk>/", HotspotUserDetailView.as_view(), name="hotspot-user-detail"),
#     path("pppoe-users/<int:pk>/", PPPoEUserDetailView.as_view(), name="pppoe-user-detail"),
    
#     # Configuration Management
#     path("routers/<int:pk>/hotspot-config/", HotspotConfigView.as_view(), name="hotspot-config"),
#     path("routers/<int:pk>/pppoe-config/", PPPoEConfigView.as_view(), name="pppoe-config"),
    
#     # Session Management and Recovery
#     path("session-recovery/", SessionRecoveryView.as_view(), name="session-recovery"),
#     path("recover-session/", UserSessionRecoveryView.as_view(), name="user-session-recovery"),
#     path("routers/<int:pk>/restore-sessions/", RestoreSessionsView.as_view(), name="restore-sessions"),
    
#     # Bulk Operations
#     path("bulk-operations/", BulkOperationsView.as_view(), name="bulk-operations"),
#     path("routers/bulk-action/", BulkActionView.as_view(), name="bulk-action"),
    
#     # MAC Address Detection
#     path("get-mac/", GetMacView.as_view(), name="get-mac"),
    
#     # Audit and Logging
#     path("audit-logs/", RouterAuditLogView.as_view(), name="router-audit-logs"),
    
#     # Callback Configuration Management
#     path("routers/<int:pk>/callback-configs/", RouterCallbackConfigListView.as_view(), name="router-callback-configs"),
#     path("routers/<int:pk>/callback-configs/<int:callback_pk>/", RouterCallbackConfigDetailView.as_view(), name="router-callback-config-detail"),

#     # =========================================================================
#     # BANDWIDTH ALLOCATION API ENDPOINTS
#     # =========================================================================
#     path('allocations/', BandwidthAllocationListView.as_view(), name='bandwidth-allocation-list'),
#     path('allocations/<int:pk>/', BandwidthAllocationDetailView.as_view(), name='bandwidth-allocation-detail'),
#     path('qos-profiles/', QoSProfileListView.as_view(), name='qos-profile-list'),
#     path('usage-stats/', BandwidthUsageStatsView.as_view(), name='bandwidth-usage-stats'),

#     # =========================================================================
#     # IP ADDRESS MANAGEMENT API ENDPOINTS
#     # =========================================================================
#     path('ip-addresses/', IPAddressListView.as_view(), name='ip-address-list'),
#     path('ip-addresses/<int:pk>/', IPAddressDetailView.as_view(), name='ip-address-detail'),
#     path('subnets/', SubnetListView.as_view(), name='subnet-list'),
#     path('dhcp-leases/', DHCPLeaseListView.as_view(), name='dhcp-lease-list'),

#     # =========================================================================
#     # NETWORK DIAGNOSTICS API ENDPOINTS
#     # =========================================================================
#     path('tests/', DiagnosticTestListView.as_view(), name='diagnostic-test-list'),
#     path('tests/bulk/', DiagnosticTestBulkView.as_view(), name='diagnostic-test-bulk'),
#     path('speed-test-history/', SpeedTestHistoryView.as_view(), name='speed-test-history'),
# ]










"""
Enhanced URL Configuration for Network Management System API

This module provides comprehensive URL routing for all network management endpoints
with proper organization and versioning support.
"""

from django.urls import path, include
from network_management.api.views.router_management import (
    # Base Router Views
    RouterListView, RouterDetailView,
    
    # Monitoring Views
    RouterStatsView, HealthMonitoringView, RouterRebootView,
    
    # User Management Views
    HotspotUsersView, HotspotUserDetailView,
    PPPoEUsersView, PPPoEUserDetailView,
    
    # Session Management Views
    RouterActivateUserView, SessionRecoveryView,
    
    # Bulk Operations Views
    BulkOperationsView, BulkOperationStatusView, BulkOperationListView,
    
    # MAC Detection Views
    GetMacView,
    
    # Audit Views
    RouterAuditLogView, ComprehensiveAuditLogView,
    
    # Configuration Views
    HotspotConfigView, PPPoEConfigView, BulkActionView,
    RouterHealthCheckView, RestoreSessionsView, UserSessionRecoveryView,
    RouterCallbackConfigListView, RouterCallbackConfigDetailView,
    
    # Export Views
    AuditLogExportView, AuditLogCleanupView,
)

# Import views from other modules
from network_management.api.views.bandwidth_allocation_view import (
    BandwidthAllocationListView, BandwidthAllocationDetailView,
    QoSProfileListView, BandwidthUsageStatsView
)

from network_management.api.views.ip_address_view import (
    IPAddressListView, IPAddressDetailView,
    SubnetListView, DHCPLeaseListView
)

from network_management.api.views.network_diagnostics_views import (
    DiagnosticTestListView, DiagnosticTestBulkView, SpeedTestHistoryView
)

# API URL patterns organized by functionality
urlpatterns = [
    # =========================================================================
    # ROUTER MANAGEMENT API ENDPOINTS
    # =========================================================================
    
    # Router CRUD Operations
    path("routers/", RouterListView.as_view(), name="router-list"),
    path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
    
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
    
    # Callback Configuration Management
    path("routers/<int:pk>/callback-configs/", RouterCallbackConfigListView.as_view(), name="router-callback-configs"),
    path("routers/<int:pk>/callback-configs/<int:callback_pk>/", RouterCallbackConfigDetailView.as_view(), name="router-callback-config-detail"),

    # =========================================================================
    # BANDWIDTH ALLOCATION API ENDPOINTS
    # =========================================================================
    path('allocations/', BandwidthAllocationListView.as_view(), name='bandwidth-allocation-list'),
    path('allocations/<int:pk>/', BandwidthAllocationDetailView.as_view(), name='bandwidth-allocation-detail'),
    path('qos-profiles/', QoSProfileListView.as_view(), name='qos-profile-list'),
    path('usage-stats/', BandwidthUsageStatsView.as_view(), name='bandwidth-usage-stats'),

    # =========================================================================
    # IP ADDRESS MANAGEMENT API ENDPOINTS
    # =========================================================================
    path('ip-addresses/', IPAddressListView.as_view(), name='ip-address-list'),
    path('ip-addresses/<int:pk>/', IPAddressDetailView.as_view(), name='ip-address-detail'),
    path('subnets/', SubnetListView.as_view(), name='subnet-list'),
    path('dhcp-leases/', DHCPLeaseListView.as_view(), name='dhcp-lease-list'),

    # =========================================================================
    # NETWORK DIAGNOSTICS API ENDPOINTS
    # =========================================================================
    path('tests/', DiagnosticTestListView.as_view(), name='diagnostic-test-list'),
    path('tests/bulk/', DiagnosticTestBulkView.as_view(), name='diagnostic-test-bulk'),
    path('speed-test-history/', SpeedTestHistoryView.as_view(), name='speed-test-history'),
    
  
    
]


class URLConfigurationManager:
    """
    Manager for URL configuration and validation.
    """
    
    @staticmethod
    def get_url_patterns():
        """
        Get all URL patterns with metadata.
        
        Returns:
            list: URL patterns with metadata
        """
        url_metadata = []
        
        for url_pattern in urlpatterns:
            pattern_info = {
                'pattern': str(url_pattern.pattern),
                'name': getattr(url_pattern, 'name', 'Unnamed'),
                'view_class': getattr(url_pattern.callback, 'view_class', None).__name__ if hasattr(url_pattern.callback, 'view_class') else 'Unknown',
                'methods': getattr(url_pattern.callback, 'http_method_names', ['GET']),
            }
            url_metadata.append(pattern_info)
        
        return url_metadata
    
    @staticmethod
    def validate_url_configuration():
        """
        Validate URL configuration for consistency and completeness.
        
        Returns:
            dict: Validation results
        """
        validation_results = {
            'total_endpoints': len(urlpatterns),
            'endpoints_by_category': {},
            'missing_endpoints': [],
            'duplicate_endpoints': [],
            'validation_passed': True
        }
        
        # Categorize endpoints
        categories = {
            'router_management': 0,
            'bandwidth_management': 0,
            'ip_management': 0,
            'diagnostics': 0,
            'audit_logs': 0,
            'bulk_operations': 0,
            'user_management': 0,
            'configuration': 0,
        }
        
        pattern_names = set()
        
        for url_pattern in urlpatterns:
            pattern_str = str(url_pattern.pattern)
            pattern_name = getattr(url_pattern, 'name', 'Unnamed')
            
            # Check for duplicate names
            if pattern_name in pattern_names and pattern_name != 'Unnamed':
                validation_results['duplicate_endpoints'].append(pattern_name)
            pattern_names.add(pattern_name)
            
            # Categorize by URL pattern
            if pattern_str.startswith('routers/') or pattern_str.startswith('health-monitoring/'):
                categories['router_management'] += 1
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
            elif 'user' in pattern_str.lower():
                categories['user_management'] += 1
            elif pattern_str.startswith('get-mac/') or pattern_str.startswith('webhooks/'):
                categories['configuration'] += 1
        
        validation_results['endpoints_by_category'] = categories
        
        # Check for missing essential endpoints
        essential_endpoints = [
            'router-list',
            'router-detail', 
            'router-stats',
            'health-monitoring',
            'session-recovery',
            'bulk-operations',
            'audit-logs'
        ]
        
        for endpoint in essential_endpoints:
            if endpoint not in pattern_names:
                validation_results['missing_endpoints'].append(endpoint)
                validation_results['validation_passed'] = False
        
        return validation_results
    
    @staticmethod
    def get_api_version():
        """
        Get API version information.
        
        Returns:
            dict: API version details
        """
        return {
            'version': '1.0.0',
            'base_path': '/api/network_management/',
            'supported_versions': ['1.0.0'],
            'deprecated': False,
            'documentation_url': '/api/docs/'
        }







