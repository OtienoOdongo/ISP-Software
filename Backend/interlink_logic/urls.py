


# from django.contrib import admin
# from django.urls import path, include, re_path
# from django.conf import settings
# from django.conf.urls.static import static
# from django.views.static import serve
# from django.http import HttpResponse, HttpResponseNotFound
# import os
# import logging

# # Import for API documentation with drf-spectacular
# from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

# logger = logging.getLogger(__name__)

# def serve_frontend(request, subfolder='dashboard'):
#     """Serve frontend apps - development fallback"""
#     index_path = os.path.join(settings.BASE_DIR, f'static/{subfolder}/index.html')
#     if not os.path.exists(index_path):
#         return HttpResponseNotFound(f"Frontend not built yet. Looking for: {index_path}")
    
#     # Log for development debugging
#     if settings.DEBUG:
#         logger.debug(f"Serving frontend from: {index_path}")
    
#     return serve(request, 'index.html', document_root=os.path.dirname(index_path))

# # Base URL patterns
# urlpatterns = [
#     # Django Admin
#     path('admin/', admin.site.urls),

#     # API routes
#     path('api/auth/', include('authentication.urls')),
#     path('api/user_management/', include('user_management.api.urls')),
#     # path('api/support/', include('support.urls')),
#     path('api/payments/', include('payments.api.urls')),
#     path('api/network_management/', include('network_management.api.urls')),
#     path('api/internet_plans/', include('internet_plans.api.urls')),
#     path('api/dashboard/', include('dashboard.urls')),
#     path('api/account/', include('account.api.urls')),
#     path('api/otp/', include('otp_auth.urls')),

#     path('health/', include(('health_check.urls', 'health_check'), namespace='app_health_check')),

#     # API Documentation with drf-spectacular
#     path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
#     path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
#     path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

#     # Media files
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# # FIX: Ensure WebSocket URLs are loaded in production too
# # Remove the development-only condition

# # ADD WebSocket routing to main urlpatterns (not just in development)
# try:
#     from network_management.routing import websocket_urlpatterns
#     urlpatterns += [
#         path('ws/', include(websocket_urlpatterns)),
#     ]
#     logger.info("WebSocket URLs configured")
# except ImportError as e:
#     logger.warning(f"WebSocket routing not available: {e}")
# except Exception as e:
#     logger.error(f"Error configuring WebSocket URLs: {e}")

# # DEVELOPMENT-ONLY URL PATTERNS
# if settings.DEBUG:
#     logger.info("Loading development URL patterns...")
    
#     # Health Checks
#     try:
#         urlpatterns += [
#             path('health/', include('health_check.urls')),
#         ]
#     except Exception as e:
#         logger.warning(f"Health checks not available: {e}")

#     # Debug toolbar
#     try:
#         import debug_toolbar
#         urlpatterns = [
#             path('__debug__/', include(debug_toolbar.urls)),
#         ] + urlpatterns
#         logger.info("Django Debug Toolbar enabled")
#     except ImportError:
#         logger.warning("Django Debug Toolbar not installed")

#     # Development static file serving
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

#     # Development frontend serving (more flexible)
#     urlpatterns += [
#         # Frontend apps - development
#         path('dashboard/', lambda r: serve_frontend(r, 'dashboard')),
#         path('landing/', lambda r: serve_frontend(r, 'landing')),
#         path('', lambda r: serve_frontend(r, 'dashboard')),  # Root to dashboard

#         # Static files for frontend apps
#         re_path(r'^static/dashboard/(?P<path>.*)$', serve, {
#             'document_root': os.path.join(settings.BASE_DIR, 'static/dashboard'),
#         }),
#         re_path(r'^static/landing/(?P<path>.*)$', serve, {
#             'document_root': os.path.join(settings.BASE_DIR, 'static/landing'),
#         }),

#         # Catch-all for SPA routing in development
#         re_path(r'^(?!api/|admin/|media/|ws/|__debug__/|health/).*$', 
#                 lambda r: serve_frontend(r, 'dashboard')),
#     ]

#     # Development error pages
#     def development_404(request, exception=None):
#         return HttpResponse(f"""
#         <html>
#             <body>
#                 <h1>404 - Page Not Found (Development)</h1>
#                 <p>Requested path: {request.path}</p>
#                 <p>Available paths:</p>
#                 <ul>
#                     <li><a href="/admin/">Django Admin</a></li>
#                     <li><a href="/api/docs/">API Documentation</a></li>
#                     <li><a href="/dashboard/">Dashboard</a></li>
#                     <li><a href="/landing/">Landing Page</a></li>
#                     <li><a href="/health/">Health Checks</a></li>
#                 </ul>
#             </body>
#         </html>
#         """, status=404)

#     def development_500(request):
#         return HttpResponse("""
#         <html>
#             <body>
#                 <h1>500 - Server Error (Development)</h1>
#                 <p>Check the Django console for error details.</p>
#             </body>
#         </html>
#         """, status=500)

#     handler404 = development_404
#     handler500 = development_500

# else:
#     # PRODUCTION URL PATTERNS (minimal)
#     logger.info("Loading production URL patterns...")
    
#     urlpatterns += [
#         # Production: frontend apps
#         path('dashboard/', lambda r: serve_frontend(r, 'dashboard')),
#         path('landing/', lambda r: serve_frontend(r, 'landing')),

#         re_path(r'^static/dashboard/(?P<path>.*)$', serve, {
#             'document_root': os.path.join(settings.BASE_DIR, 'static/dashboard'),
#         }),
#         re_path(r'^static/landing/(?P<path>.*)$', serve, {
#             'document_root': os.path.join(settings.BASE_DIR, 'static/landing'),
#         }),

#         # Catch-all fallback to dashboard SPA
#         re_path(r'^(?!api/|admin/|media/).*$', lambda r: serve_frontend(r)),
#     ]

# # Custom error handlers
# handler400 = 'interlink_logic.views.error_handlers.bad_request'
# handler403 = 'interlink_logic.views.error_handlers.permission_denied'
# handler404 = 'interlink_logic.views.error_handlers.page_not_found'
# handler500 = 'interlink_logic.views.error_handlers.server_error'







from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse, HttpResponseNotFound
import os
import logging

# Import for API documentation with drf-spectacular
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

logger = logging.getLogger(__name__)

def serve_frontend(request, subfolder='dashboard'):
    """Serve frontend apps - development fallback"""
    index_path = os.path.join(settings.BASE_DIR, f'static/{subfolder}/index.html')
    if not os.path.exists(index_path):
        return HttpResponseNotFound(f"Frontend not built yet. Looking for: {index_path}")
    
    # Log for development debugging
    if settings.DEBUG:
        logger.debug(f"Serving frontend from: {index_path}")
    
    return serve(request, 'index.html', document_root=os.path.dirname(index_path))

# Base URL patterns
urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API routes
    path('api/auth/', include('authentication.urls')),
    path('api/user_management/', include('user_management.api.urls')),
    path('api/payments/', include('payments.api.urls')),
    path('api/network_management/', include('network_management.api.urls')),
    path('api/internet_plans/', include('internet_plans.api.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/account/', include('account.api.urls')),
    path('api/otp/', include('otp_auth.urls')),

    # Health checks
    path('health/', include(('health_check.urls', 'health_check'), namespace='app_health_check')),

    # API Documentation with drf-spectacular
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Media files
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# FIXED: WebSocket URL configuration - Load in all environments
try:
    # First try main app routing
    from interlink_logic.routing import websocket_urlpatterns
    logger.info("✅ WebSocket URLs configured from interlink_logic.routing")
except ImportError:
    # Fallback to network_management routing
    try:
        from network_management.routing import websocket_urlpatterns
        logger.info("✅ WebSocket URLs configured from network_management.routing")
    except ImportError as e:
        logger.warning(f"⚠️ WebSocket routing not available: {e}")
        websocket_urlpatterns = []

# Add WebSocket URLs if available
if websocket_urlpatterns:
    urlpatterns += [
        path('ws/', include(websocket_urlpatterns)),
    ]
    logger.info(f"✅ WebSocket URLs added with {len(websocket_urlpatterns)} patterns")
else:
    logger.warning("⚠️ No WebSocket URL patterns available")

# DEVELOPMENT-ONLY URL PATTERNS
if settings.DEBUG:
    logger.info("Loading development URL patterns...")
    
    # Debug toolbar
    try:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
        logger.info("✅ Django Debug Toolbar enabled")
    except ImportError:
        logger.warning("⚠️ Django Debug Toolbar not installed")

    # Development static file serving
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Development frontend serving (more flexible)
    urlpatterns += [
        # Frontend apps - development
        path('dashboard/', lambda r: serve_frontend(r, 'dashboard')),
        path('landing/', lambda r: serve_frontend(r, 'landing')),
        path('', lambda r: serve_frontend(r, 'dashboard')),  # Root to dashboard

        # Static files for frontend apps
        re_path(r'^static/dashboard/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'static/dashboard'),
        }),
        re_path(r'^static/landing/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'static/landing'),
        }),

        # Catch-all for SPA routing in development
        re_path(r'^(?!api/|admin/|media/|ws/|__debug__/|health/).*$', 
                lambda r: serve_frontend(r, 'dashboard')),
    ]

    # Development error pages
    def development_404(request, exception=None):
        return HttpResponse(f"""
        <html>
            <body>
                <h1>404 - Page Not Found (Development)</h1>
                <p>Requested path: {request.path}</p>
                <p>Available paths:</p>
                <ul>
                    <li><a href="/admin/">Django Admin</a></li>
                    <li><a href="/api/docs/">API Documentation</a></li>
                    <li><a href="/dashboard/">Dashboard</a></li>
                    <li><a href="/landing/">Landing Page</a></li>
                    <li><a href="/health/">Health Checks</a></li>
                    <li><a href="/ws/routers/">WebSocket Test</a></li>
                </ul>
            </body>
        </html>
        """, status=404)

    def development_500(request):
        return HttpResponse("""
        <html>
            <body>
                <h1>500 - Server Error (Development)</h1>
                <p>Check the Django console for error details.</p>
            </body>
        </html>
        """, status=500)

    handler404 = development_404
    handler500 = development_500

else:
    # PRODUCTION URL PATTERNS (minimal)
    logger.info("Loading production URL patterns...")
    
    urlpatterns += [
        # Production: frontend apps
        path('dashboard/', lambda r: serve_frontend(r, 'dashboard')),
        path('landing/', lambda r: serve_frontend(r, 'landing')),

        re_path(r'^static/dashboard/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'static/dashboard'),
        }),
        re_path(r'^static/landing/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'static/landing'),
        }),

        # Catch-all fallback to dashboard SPA
        re_path(r'^(?!api/|admin/|media/|ws/).*$', lambda r: serve_frontend(r)),
    ]

# FIXED: Use the correct error handler imports
handler400 = 'interlink_logic.views.error_handlers.bad_request'
handler403 = 'interlink_logic.views.error_handlers.permission_denied'
handler404 = 'interlink_logic.views.error_handlers.page_not_found'
handler500 = 'interlink_logic.views.error_handlers.server_error'

# Log final URL configuration
logger.info(f"✅ URL configuration complete - {len(urlpatterns)} total URL patterns")
logger.info(f"✅ WebSocket support: {'Enabled' if any('ws/' in str(pattern) for pattern in urlpatterns) else 'Disabled'}")