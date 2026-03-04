




# """
# ASGI config for interlink_logic project.

# Enhanced with proper WebSocket support and error handling.
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

# # Import WebSocket routing with enhanced error handling
# try:
#     # First try to import from main app routing
#     from interlink_logic.routing import websocket_urlpatterns
#     has_websocket_routing = True
#     print("✅ WebSocket routing loaded successfully from interlink_logic")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in interlink_logic: {e}")
#     # Fallback: try network_management routing
#     try:
#         from network_management.routing import websocket_urlpatterns
#         has_websocket_routing = True
#         print("✅ WebSocket routing loaded successfully from network_management")
#     except ImportError as e:
#         print(f"⚠️ WebSocket routing not found in network_management: {e}")
#         has_websocket_routing = False
#         websocket_urlpatterns = []

# # Define WebSocket application with proper middleware
# if has_websocket_routing and websocket_urlpatterns:
#     print(f"✅ Configuring WebSocket with {len(websocket_urlpatterns)} URL patterns")
    
#     # FIXED: Use AllowedHostsOriginValidator for security
#     websocket_application = AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     )
# else:
#     print("⚠️ No WebSocket URL patterns found, WebSocket functionality disabled")
#     # Fallback empty WebSocket application
#     websocket_application = URLRouter([])

# # Main ASGI application
# application = ProtocolTypeRouter({
#     # HTTP requests to Django
#     "http": django_asgi_app,
    
#     # WebSocket requests to Channels
#     "websocket": websocket_application,
# })

# print("✅ ASGI application configured successfully")
# print(f"✅ HTTP: Enabled")
# print(f"✅ WebSocket: {'Enabled' if has_websocket_routing and websocket_urlpatterns else 'Disabled'}")





# """
# ASGI config for interlink_logic project.

# Enhanced with proper WebSocket support and error handling.
# Includes SMS Automation WebSocket consumers.
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

# # Import WebSocket routing from multiple apps
# websocket_urlpatterns = []

# # Try to import from main app routing
# try:
#     from interlink_logic.routing import websocket_urlpatterns as main_websocket_patterns
#     if main_websocket_patterns:
#         websocket_urlpatterns.extend(main_websocket_patterns)
#         print(f"✅ Loaded {len(main_websocket_patterns)} WebSocket patterns from interlink_logic")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in interlink_logic: {e}")

# # Try to import from network_management routing
# try:
#     from network_management.routing import websocket_urlpatterns as network_websocket_patterns
#     if network_websocket_patterns:
#         websocket_urlpatterns.extend(network_websocket_patterns)
#         print(f"✅ Loaded {len(network_websocket_patterns)} WebSocket patterns from network_management")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in network_management: {e}")

# # Try to import from sms_automation routing
# try:
#     from sms_automation.routing import websocket_urlpatterns as sms_websocket_patterns
#     if sms_websocket_patterns:
#         websocket_urlpatterns.extend(sms_websocket_patterns)
#         print(f"✅ Loaded {len(sms_websocket_patterns)} WebSocket patterns from sms_automation")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in sms_automation: {e}")

# # Define WebSocket application with proper middleware
# if websocket_urlpatterns:
#     print(f"✅ Configuring WebSocket with {len(websocket_urlpatterns)} total URL patterns")
    
#     # FIXED: Use AllowedHostsOriginValidator for security
#     websocket_application = AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     )
# else:
#     print("⚠️ No WebSocket URL patterns found, WebSocket functionality disabled")
#     # Fallback empty WebSocket application
#     websocket_application = URLRouter([])

# # Main ASGI application
# application = ProtocolTypeRouter({
#     # HTTP requests to Django
#     "http": django_asgi_app,
    
#     # WebSocket requests to Channels
#     "websocket": websocket_application,
# })

# print("=" * 50)
# print("✅ ASGI application configured successfully")
# print(f"✅ HTTP: Enabled")
# if websocket_urlpatterns:
#     print(f"✅ WebSocket: Enabled with {len(websocket_urlpatterns)} routes")
#     # Fixed: The line below had syntax issues with nested quotes and f-string formatting
#     print(f"✅ WebSocket routes: {[str(pattern.pattern) for pattern in websocket_urlpatterns[:5]]}...")
# else:
#     print("❌ WebSocket: Disabled")
# print("=" * 50)









# """
# ASGI config for interlink_logic project.

# Enhanced with proper WebSocket support and error handling.
# Includes SMS Automation WebSocket consumers.
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

# # Import WebSocket routing from multiple apps
# websocket_urlpatterns = []

# # Try to import from main app routing
# try:
#     from interlink_logic.routing import websocket_urlpatterns as main_websocket_patterns
#     if main_websocket_patterns:
#         websocket_urlpatterns.extend(main_websocket_patterns)
#         print(f"✅ Loaded {len(main_websocket_patterns)} WebSocket patterns from interlink_logic")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in interlink_logic: {e}")

# # Try to import from network_management routing
# try:
#     from network_management.routing import websocket_urlpatterns as network_websocket_patterns
#     if network_websocket_patterns:
#         websocket_urlpatterns.extend(network_websocket_patterns)
#         print(f"✅ Loaded {len(network_websocket_patterns)} WebSocket patterns from network_management")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in network_management: {e}")

# # Try to import from sms_automation routing
# try:
#     from sms_automation.routing import websocket_urlpatterns as sms_websocket_patterns
#     if sms_websocket_patterns:
#         websocket_urlpatterns.extend(sms_websocket_patterns)
#         print(f"✅ Loaded {len(sms_websocket_patterns)} WebSocket patterns from sms_automation")
# except ImportError as e:
#     print(f"⚠️ WebSocket routing not found in sms_automation: {e}")

# # Define WebSocket application with proper middleware
# if websocket_urlpatterns:
#     print(f"✅ Configuring WebSocket with {len(websocket_urlpatterns)} total URL patterns")
    
#     websocket_application = AllowedHostsOriginValidator(
#         AuthMiddlewareStack(
#             URLRouter(websocket_urlpatterns)
#         )
#     )
# else:
#     print("⚠️ No WebSocket URL patterns found, WebSocket functionality disabled")
#     websocket_application = URLRouter([])

# # Main ASGI application
# application = ProtocolTypeRouter({
#     # HTTP requests to Django
#     "http": django_asgi_app,
    
#     # WebSocket requests to Channels
#     "websocket": websocket_application,
# })

# print("=" * 50)
# print("✅ ASGI application configured successfully")
# print(f"✅ HTTP: Enabled")
# print(f"✅ WebSocket: {'Enabled' if websocket_urlpatterns else 'Disabled'}")
# if websocket_urlpatterns:
#     print(f"✅ WebSocket routes: {[str(pattern.pattern) for pattern in websocket_urlpatterns]}")
# print("=" * 50)






"""
ASGI config for interlink_logic project.

Enhanced with proper WebSocket support and error handling.
Includes SMS Automation WebSocket consumers.
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

# Import WebSocket routing from multiple apps
websocket_urlpatterns = []

# Try to import from main app routing
try:
    from interlink_logic.routing import websocket_urlpatterns as main_websocket_patterns
    if main_websocket_patterns:
        websocket_urlpatterns.extend(main_websocket_patterns)
        print(f"✅ Loaded {len(main_websocket_patterns)} WebSocket patterns from interlink_logic")
except ImportError as e:
    print(f"⚠️ WebSocket routing not found in interlink_logic: {e}")

# Try to import from network_management routing
try:
    from network_management.routing import websocket_urlpatterns as network_websocket_patterns
    if network_websocket_patterns:
        websocket_urlpatterns.extend(network_websocket_patterns)
        print(f"✅ Loaded {len(network_websocket_patterns)} WebSocket patterns from network_management")
except ImportError as e:
    print(f"⚠️ WebSocket routing not found in network_management: {e}")

# Try to import from sms_automation routing
try:
    from sms_automation.routing import websocket_urlpatterns as sms_websocket_patterns
    if sms_websocket_patterns:
        websocket_urlpatterns.extend(sms_websocket_patterns)
        print(f"✅ Loaded {len(sms_websocket_patterns)} WebSocket patterns from sms_automation")
        
        # Print the actual patterns for debugging
        print("📋 SMS Automation WebSocket patterns:")
        for pattern in sms_websocket_patterns:
            print(f"   - {pattern.pattern}")
except ImportError as e:
    print(f"⚠️ WebSocket routing not found in sms_automation: {e}")

# Define WebSocket application with simplified middleware for debugging
if websocket_urlpatterns:
    print(f"✅ Configuring WebSocket with {len(websocket_urlpatterns)} total URL patterns")
    
    # Temporarily remove AllowedHostsOriginValidator for debugging
    websocket_application = AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    )
else:
    print("⚠️ No WebSocket URL patterns found, WebSocket functionality disabled")
    websocket_application = URLRouter([])

# Main ASGI application
application = ProtocolTypeRouter({
    # HTTP requests to Django
    "http": django_asgi_app,
    
    # WebSocket requests to Channels
    "websocket": websocket_application,
})

print("=" * 50)
print("✅ ASGI application configured successfully")
print(f"✅ HTTP: Enabled")
print(f"✅ WebSocket: {'Enabled' if websocket_urlpatterns else 'Disabled'}")
if websocket_urlpatterns:
    print("📋 All WebSocket routes:")
    for i, pattern in enumerate(websocket_urlpatterns, 1):
        print(f"   {i}. {pattern.pattern}")
print("=" * 50)