# interlink_logic/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse, HttpResponseNotFound
import os
import logging

logger = logging.getLogger(__name__)

def serve_frontend(request, subfolder='dashboard'):
    """Serve frontend SPA from either dashboard or landing folder"""
    index_path = os.path.join(settings.BASE_DIR, f'static/{subfolder}/index.html')
    
    if not os.path.exists(index_path):
        logger.error(f"Frontend index.html not found at: {index_path}")
        return HttpResponseNotFound("Frontend application not built")
    
    logger.debug(f"Serving frontend from: {index_path}")
    return serve(request, 'index.html', document_root=os.path.dirname(index_path))

def serve_static(request, path, document_root):
    """Custom static file serving with logging"""
    full_path = os.path.join(document_root, path)
    logger.debug(f"Attempting to serve static file: {full_path}")
    if not os.path.exists(full_path):
        logger.error(f"Static file not found: {full_path}")
        return HttpResponseNotFound(f"File not found: {path}")
    logger.info(f"Successfully serving static file: {full_path}")
    return serve(request, path, document_root=document_root)

def debug_request(request):
    """Debug route to catch unmatched requests"""
    logger.debug(f"Unmatched request: {request.path}")
    return HttpResponse(f"Unmatched request: {request.path}", status=404)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/auth/', include('authentication.urls')),
    path('api/user_management/', include('user_management.api.urls')),
    #path('api/support/', include('support.urls')),
    path('api/payments/', include('payments.api.urls')),
    path('api/network_management/', include('network_management.api.urls')),
    path('api/internet_plans/', include('internet_plans.api.urls')),
    # path('api/dashboard/', include('dashboard.urls')),
    path('api/account/', include('account.api.urls')),
    path('api/otp/', include('otp_auth.urls')),
    
    # Frontend Applications
    path('dashboard/', lambda r: serve_frontend(r, 'dashboard'), name='dashboard'),
    path('landing/', lambda r: serve_frontend(r, 'landing'), name='landing'),
]

# Static files handling
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^static/dashboard/(?P<path>.*)$', serve_static, {
            'document_root': os.path.join(settings.BASE_DIR, 'static/dashboard'),
        }),
        re_path(r'^static/landing/(?P<path>.*)$', serve_static, {
            'document_root': os.path.join(settings.BASE_DIR, 'static/landing'),
        }),
    ]

# Media files
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Debug endpoint
if settings.DEBUG:
    urlpatterns += [
        path('debug/paths/', lambda r: HttpResponse(
            f"<h1>Path Verification</h1>"
            f"<h2>Dashboard Paths:</h2>"
            f"<p>Index: {os.path.join(settings.BASE_DIR, 'static/dashboard/index.html')}</p>"
            f"<p>Assets: {os.path.join(settings.BASE_DIR, 'static/dashboard/assets/')}</p>"
            f"<h2>Landing Paths:</h2>"
            f"<p>Index: {os.path.join(settings.BASE_DIR, 'static/landing/index.html')}</p>"
            f"<p>Assets: {os.path.join(settings.BASE_DIR, 'static/landing/assets/')}</p>"
        ), name='debug-paths')
    ]

# Health check
urlpatterns += [
    path('health/', lambda r: HttpResponse('OK'), name='health-check'),
]

# SPA catch-all and debug route
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/|media/|dashboard/|landing/|health/|debug/).*$', 
            lambda r: serve_frontend(r)),
    re_path(r'^.*$', debug_request),  # Catch-all for unmatched requests
]

if settings.DEBUG:
    logger.info("Registered URL patterns:")
    for pattern in urlpatterns:
        logger.info(f"  {pattern}")