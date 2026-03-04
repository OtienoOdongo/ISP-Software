# """
# WebSocket Routing Configuration for Interlink Logic

# This file provides WebSocket URL routing for the main application.
# Since WebSocket routes are typically app-specific, this serves as a fallback
# and can include global WebSocket routes if needed.
# """

# from django.urls import re_path

# # Import WebSocket consumers from your apps
# try:
#     from network_management.consumers import RouterConsumer, NotificationConsumer
#     has_network_consumers = True
# except ImportError as e:
#     print(f"⚠️ Network management consumers not available: {e}")
#     has_network_consumers = False

# # Define WebSocket URL patterns
# websocket_urlpatterns = []

# # Add network management WebSocket routes if available
# if has_network_consumers:
#     websocket_urlpatterns += [
#         # Global router updates
#         re_path(r'ws/routers/$', RouterConsumer.as_asgi(), name='websocket-routers'),
        
#         # Global notifications
#         re_path(r'ws/notifications/$', NotificationConsumer.as_asgi(), name='websocket-notifications'),
#     ]
# else:
#     print("⚠️ No WebSocket consumers found - WebSocket functionality will be limited")

# # Add any main app WebSocket routes here
# # websocket_urlpatterns += [
# #     re_path(r'ws/system/$', SystemConsumer.as_asgi(), name='websocket-system'),
# # ]

# print(f"✅ WebSocket routing configured with {len(websocket_urlpatterns)} URL patterns")

# # Export for ASGI configuration
# __all__ = ['websocket_urlpatterns']











"""
WebSocket Routing Configuration for Interlink Logic

This file provides WebSocket URL routing for the main application.
Includes SMS Automation WebSocket consumers.
"""

from django.urls import re_path

# Import WebSocket consumers from your apps
websocket_urlpatterns = []

# Try to import network management consumers
try:
    from network_management.consumers import RouterConsumer, NotificationConsumer
    
    # Add network management WebSocket routes
    websocket_urlpatterns += [
        # Global router updates
        re_path(r'ws/routers/$', RouterConsumer.as_asgi(), name='websocket-routers'),
        
        # Global notifications
        re_path(r'ws/notifications/$', NotificationConsumer.as_asgi(), name='websocket-notifications'),
    ]
    print("✅ Network management consumers loaded successfully")
except ImportError as e:
    print(f"⚠️ Network management consumers not available: {e}")

# Try to import SMS automation consumers
try:
    from sms_automation.consumers import SMSStatusConsumer, SMSBroadcastConsumer
    
    # Add SMS automation WebSocket routes
    websocket_urlpatterns += [
        # SMS status updates for individual users
        re_path(r'ws/sms/status/$', SMSStatusConsumer.as_asgi(), name='websocket-sms-status'),
        
        # SMS broadcast for system-wide announcements (staff only)
        re_path(r'ws/sms/broadcast/$', SMSBroadcastConsumer.as_asgi(), name='websocket-sms-broadcast'),
    ]
    print("✅ SMS automation consumers loaded successfully")
except ImportError as e:
    print(f"⚠️ SMS automation consumers not available: {e}")

# Add any main app WebSocket routes here
# Example:
# try:
#     from system.consumers import SystemConsumer
#     websocket_urlpatterns += [
#         re_path(r'ws/system/$', SystemConsumer.as_asgi(), name='websocket-system'),
#     ]
# except ImportError:
#     pass

print(f"✅ WebSocket routing configured with {len(websocket_urlpatterns)} total URL patterns")

# Export for ASGI configuration
__all__ = ['websocket_urlpatterns']