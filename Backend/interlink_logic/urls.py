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
    index_path = os.path.join(settings.BASE_DIR, f'static/{subfolder}/index.html')
    if not os.path.exists(index_path):
        return HttpResponseNotFound("Frontend not built yet.")
    return serve(request, 'index.html', document_root=os.path.dirname(index_path))


urlpatterns = [
    path('admin/', admin.site.urls),

    # API routes
    path('api/auth/', include('authentication.urls')),
    path('api/user_management/', include('user_management.api.urls')),
    # path('api/support/', include('support.urls')),
    path('api/payments/', include('payments.api.urls')),
    path('api/network_management/', include('network_management.api.urls')),
    path('api/internet_plans/', include('internet_plans.api.urls')),
    # path('api/dashboard/', include('dashboard.urls')),
    path('api/account/', include('account.api.urls')),
    path('api/otp/', include('otp_auth.urls')),

    # Media files
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# Serve static-built frontend apps ONLY in production
if not settings.DEBUG:
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
        re_path(r'^(?!api/|admin/|media/).*$', lambda r: serve_frontend(r)),
    ]







