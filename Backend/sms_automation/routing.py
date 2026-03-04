# """
# SMS Automation WebSocket Routing
# """
# from django.urls import re_path
# from . import consumers

# websocket_urlpatterns = [
#     # SMS status updates for individual users
#     re_path(r'ws/sms/status/$', consumers.SMSStatusConsumer.as_asgi(), name='websocket-sms-status'),
    
#     # SMS broadcast for system-wide announcements (staff only)
#     re_path(r'ws/sms/broadcast/$', consumers.SMSBroadcastConsumer.as_asgi(), name='websocket-sms-broadcast'),
# ]

# print(f"✅ SMS Automation WebSocket routing configured with {len(websocket_urlpatterns)} patterns")

# __all__ = ['websocket_urlpatterns']







# """
# SMS Automation WebSocket Routing
# """
# from django.urls import re_path
# from . import consumers


# websocket_urlpatterns = [
#     # Root WebSocket handler for backward compatibility
#     re_path(r'ws/sms/$', consumers.SMSRootConsumer.as_asgi(), name='websocket-sms-root'),
    
#     # SMS status updates for individual users
#     re_path(r'ws/sms/status/$', consumers.SMSStatusConsumer.as_asgi(), name='websocket-sms-status'),
    
#     # SMS broadcast for system-wide announcements (staff only)
#     re_path(r'ws/sms/broadcast/$', consumers.SMSBroadcastConsumer.as_asgi(), name='websocket-sms-broadcast'),
# ]

# print(f"✅ SMS Automation WebSocket routing configured with {len(websocket_urlpatterns)} patterns")

# __all__ = ['websocket_urlpatterns']








"""
SMS Automation WebSocket Routing - FIXED
"""
from django.urls import re_path
from . import consumers

# Define WebSocket URL patterns - make sure these match exactly what frontend expects
websocket_urlpatterns = [
    # SMS status updates for individual users
    re_path(r'^ws/sms/status/$', consumers.SMSStatusConsumer.as_asgi()),
    
    # SMS broadcast for system-wide announcements (staff only)
    re_path(r'^ws/sms/broadcast/$', consumers.SMSBroadcastConsumer.as_asgi()),
    
    # Root endpoint for backward compatibility
    re_path(r'^ws/sms/$', consumers.SMSRootConsumer.as_asgi()),
]

# For debugging
print("🔌 SMS Automation WebSocket routes loaded:")
for pattern in websocket_urlpatterns:
    print(f"   - {pattern.pattern}")

__all__ = ['websocket_urlpatterns']