# """
# ASGI config for interlink_logic project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
# """

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interlink_logic.settings')

# application = get_asgi_application()





"""
ASGI config for interlink_logic project.

It exposes the ASGI callable as a module-level variable named ``application``.
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

# Import your WebSocket routing
try:
    from network_management.routing import websocket_urlpatterns
    has_websocket_routing = True
    print("✅ WebSocket routing loaded successfully")
except ImportError as e:
    print(f"⚠️ WebSocket routing not found: {e}")
    has_websocket_routing = False
    websocket_urlpatterns = []

# Define WebSocket application
if has_websocket_routing:
    websocket_application = AuthMiddlewareStack(
        AllowedHostsOriginValidator(
            URLRouter(websocket_urlpatterns)
        )
    )
else:
    # Fallback for development without WebSocket routes
    websocket_application = URLRouter([])

# Main ASGI application
application = ProtocolTypeRouter({
    # HTTP requests to Django
    "http": django_asgi_app,
    
    # WebSocket requests to Channels
    "websocket": websocket_application,
})