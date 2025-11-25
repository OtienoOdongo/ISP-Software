# # """
# # ASGI config for interlink_logic project.

# # It exposes the ASGI callable as a module-level variable named ``application``.

# # For more information on this file, see
# # https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
# # """

# # import os

# # from django.core.asgi import get_asgi_application

# # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interlink_logic.settings')

# # application = get_asgi_application()





# """
# ASGI config for interlink_logic project.

# It exposes the ASGI callable as a module-level variable named ``application``.
# """

# import os
# import django
# from django.core.asgi import get_asgi_application

# # Set Django settings module
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interlink_logic.settings')

# # Initialize Django
# django.setup()

# # Get Django ASGI application
# django_asgi_app = get_asgi_application()

# # Import channels components after Django setup
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from channels.security.websocket import AllowedHostsOriginValidator

# # Import your WebSocket routing
# try:
#     from network_management.routing import websocket_urlpatterns
#     has_websocket_routing = True
#     print("✅ WebSocket routing loaded successfully")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found: {e}")
#     has_websocket_routing = False
#     websocket_urlpatterns = []

# # Define WebSocket application
# if has_websocket_routing:
#     websocket_application = AuthMiddlewareStack(
#         AllowedHostsOriginValidator(
#             URLRouter(websocket_urlpatterns)
#         )
#     )
# else:
#     # Fallback for development without WebSocket routes
#     websocket_application = URLRouter([])

# # Main ASGI application
# application = ProtocolTypeRouter({
#     # HTTP requests to Django
#     "http": django_asgi_app,
    
#     # WebSocket requests to Channels
#     "websocket": websocket_application,
# })






"""
FIXED ASGI config for interlink_logic project.

Enhanced with proper WebSocket support and error handling.
"""

import os
import django
from django.core.asgi import get_asgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interlink_logic.settings')

# Initialize Django
django.setup()

# Get Django ASGI application
django_asgi_app = get_asgi_application()

# Import channels components after Django setup
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

# Import WebSocket routing with enhanced error handling
try:
    # First try to import from main app routing
    from interlink_logic.routing import websocket_urlpatterns
    has_websocket_routing = True
    print("✅ WebSocket routing loaded successfully from interlink_logic")
except ImportError as e:
    print(f"⚠️ WebSocket routing not found in interlink_logic: {e}")
    # Fallback: try network_management routing
    try:
        from network_management.routing import websocket_urlpatterns
        has_websocket_routing = True
        print("✅ WebSocket routing loaded successfully from network_management")
    except ImportError as e:
        print(f"⚠️ WebSocket routing not found in network_management: {e}")
        has_websocket_routing = False
        websocket_urlpatterns = []

# Define WebSocket application with proper middleware
if has_websocket_routing and websocket_urlpatterns:
    print(f"✅ Configuring WebSocket with {len(websocket_urlpatterns)} URL patterns")
    
    # FIXED: Use AllowedHostsOriginValidator for security
    websocket_application = AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    )
else:
    print("⚠️ No WebSocket URL patterns found, WebSocket functionality disabled")
    # Fallback empty WebSocket application
    websocket_application = URLRouter([])

# Main ASGI application
application = ProtocolTypeRouter({
    # HTTP requests to Django
    "http": django_asgi_app,
    
    # WebSocket requests to Channels
    "websocket": websocket_application,
})

print("✅ ASGI application configured successfully")
print(f"✅ HTTP: Enabled")
print(f"✅ WebSocket: {'Enabled' if has_websocket_routing and websocket_urlpatterns else 'Disabled'}")