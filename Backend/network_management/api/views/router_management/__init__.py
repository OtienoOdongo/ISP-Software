

# # network_management/api/views/router_management/__init__.py
# """
# Router Management Views Package

# This package contains all router management views organized by functionality.
# """

# from .router_base_views import RouterListView, RouterDetailView
# from .router_monitoring_views import RouterStatsView, HealthMonitoringView, RouterRebootView
# from .router_user_management_views import (
#     HotspotUsersView, HotspotUserDetailView, 
#     PPPoEUsersView, PPPoEUserDetailView
# )
# from .router_session_views import RouterActivateUserView, SessionRecoveryView
# from .router_bulk_operations_views import BulkOperationsView, BulkOperationStatusView, BulkOperationListView
# from .router_mac_detection_views import GetMacView
# from .router_audit_views import (
#     RouterAuditLogView, 
#     ComprehensiveAuditLogView, 
#     AuditLogExportView, 
#     AuditLogCleanupView
# )
# from .router_configuration_views import (
#     HotspotConfigView, PPPoEConfigView, BulkActionView,
#     RouterHealthCheckView, RestoreSessionsView, UserSessionRecoveryView,
#     RouterCallbackConfigListView, RouterCallbackConfigDetailView
# )

# __all__ = [
#     # Base Views
#     'RouterListView', 'RouterDetailView',
    
#     # Monitoring Views
#     'RouterStatsView', 'HealthMonitoringView', 'RouterRebootView',
    
#     # User Management Views
#     'HotspotUsersView', 'HotspotUserDetailView',
#     'PPPoEUsersView', 'PPPoEUserDetailView',
    
#     # Session Management Views
#     'RouterActivateUserView', 'SessionRecoveryView',
    
#     # Bulk Operations Views
#     'BulkOperationsView', 'BulkOperationStatusView', 'BulkOperationListView',
    
#     # MAC Detection Views
#     'GetMacView',
    
#     # Audit Views
#     'RouterAuditLogView', 'ComprehensiveAuditLogView', 'AuditLogExportView', 'AuditLogCleanupView',
    
#     # Configuration Views
#     'HotspotConfigView', 'PPPoEConfigView', 'BulkActionView',
#     'RouterHealthCheckView', 'RestoreSessionsView', 'UserSessionRecoveryView',
#     'RouterCallbackConfigListView', 'RouterCallbackConfigDetailView'
# ]




# # network_management/api/views/router_management/__init__.py
# """
# Router Management Views Package

# This package contains all router management views organized by functionality.
# """

# from .router_base_views import RouterListView, RouterDetailView
# from .router_monitoring_views import RouterStatsView, HealthMonitoringView, RouterRebootView
# from .router_user_management_views import (
#     HotspotUsersView, HotspotUserDetailView, 
#     PPPoEUsersView, PPPoEUserDetailView
# )
# from .router_session_views import RouterActivateUserView, SessionRecoveryView
# from .router_bulk_operations_views import BulkOperationsView, BulkOperationStatusView, BulkOperationListView
# from .router_mac_detection_views import GetMacView
# from .router_audit_views import (
#     RouterAuditLogView, 
#     ComprehensiveAuditLogView, 
#     AuditLogExportView, 
#     AuditLogCleanupView
# )

# # Import configuration views (without health views)
# from .router_configuration_views import (
#     HotspotConfigView, PPPoEConfigView, BulkActionView,
#     ScriptBasedConfigurationView,
#     RouterCallbackConfigListView, RouterCallbackConfigDetailView
# )

# # Import health views from the correct file
# from .router_health_views import (
#     RouterHealthCheckView,
#     RestoreSessionsView,
#     UserSessionRecoveryView
# )

# # Import connection views
# from .router_connection_views import (
#     TestRouterConnectionView,
#     AutoConfigureRouterView,
#     ConnectionTemplatesView,
#     BulkConnectionTestView,
#     RouterConnectionHistoryView
# )

# __all__ = [
#     # Base Views
#     'RouterListView', 'RouterDetailView',
    
#     # Monitoring Views
#     'RouterStatsView', 'HealthMonitoringView', 'RouterRebootView',
    
#     # User Management Views
#     'HotspotUsersView', 'HotspotUserDetailView',
#     'PPPoEUsersView', 'PPPoEUserDetailView',
    
#     # Session Management Views
#     'RouterActivateUserView', 'SessionRecoveryView',
    
#     # Bulk Operations Views
#     'BulkOperationsView', 'BulkOperationStatusView', 'BulkOperationListView',
    
#     # MAC Detection Views
#     'GetMacView',
    
#     # Audit Views
#     'RouterAuditLogView', 'ComprehensiveAuditLogView', 'AuditLogExportView', 'AuditLogCleanupView',
    
#     # Configuration Views
#     'HotspotConfigView', 'PPPoEConfigView', 'BulkActionView', 'ScriptBasedConfigurationView',
#     'RouterCallbackConfigListView', 'RouterCallbackConfigDetailView',
    
#     # Health Views (imported from router_health_views.py)
#     'RouterHealthCheckView', 'RestoreSessionsView', 'UserSessionRecoveryView',
    
#     # Connection Views
#     'TestRouterConnectionView', 'AutoConfigureRouterView', 'ConnectionTemplatesView',
#     'BulkConnectionTestView', 'RouterConnectionHistoryView'
# ]