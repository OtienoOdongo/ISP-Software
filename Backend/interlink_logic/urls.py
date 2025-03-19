

# from django.contrib import admin
# from django.urls import path, include, re_path
# from django.conf import settings
# from django.conf.urls.static import static
# from django.views.static import serve
# import os

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/auth/', include('authentication.urls')),
#     path('api/user_management/', include('user_management.api.urls')),
#     path('api/support/', include('support.urls')),
#     path('api/reporting/', include('reporting.api.urls')),
#     path('api/payments/', include('payments.api.urls')),
#     path('api/network_management/', include('network_management.api.urls')),
#     path('api/internet_plans/', include('internet_plans.api.urls')),
#     path('api/dashboard/', include('dashboard.urls')),
#     path('api/account/', include('account.api.urls')),
# ]

# # Serve static files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# # Fallback to index.html for all unmatched routes (SPA support)
# urlpatterns += [
#     re_path(r'^.*$', lambda request: serve(request, 'index.html', document_root=os.path.join(settings.BASE_DIR, 'static'))),
# ]




# from django.contrib import admin
# from django.urls import path, include, re_path
# from django.conf import settings
# from django.conf.urls.static import static
# from django.views.static import serve
# import os

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/auth/', include('authentication.urls')),
#     path('api/user_management/', include('user_management.api.urls')),
#     path('api/support/', include('support.urls')),
#     path('api/reporting/', include('reporting.api.urls')),
#     path('api/payments/', include('payments.api.urls')),
#     path('api/network_management/', include('network_management.api.urls')),
#     path('api/internet_plans/', include('internet_plans.api.urls')),
#     path('api/dashboard/', include('dashboard.urls')),
#     path('api/account/', include('account.api.urls')),
  
# ]

# # Serve static files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# # Fallback to index.html for all unmatched routes (SPA support), but only after API routes
# urlpatterns += [
#     re_path(r'^.*$', lambda request: serve(request, 'index.html', document_root=os.path.join(settings.BASE_DIR, 'static'))),
# ]




from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os
import logging

# Set up logging to debug URL resolution
logger = logging.getLogger(__name__)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/user_management/', include('user_management.api.urls')),
    path('api/support/', include('support.urls')),
    path('api/reporting/', include('reporting.api.urls')),
    path('api/payments/', include('payments.api.urls')),
    path('api/network_management/', include('network_management.api.urls')),
    path('api/internet_plans/', include('internet_plans.api.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/account/', include('account.api.urls')),
    
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Fallback to index.html for non-API routes only
def serve_spa(request):
    logger.debug(f"Request path: {request.path}")
    if request.path.startswith('/api/'):
        logger.warning(f"API route {request.path} incorrectly caught by catch-all")
        from django.http import HttpResponseNotFound
        return HttpResponseNotFound("API endpoint not found")
    return serve(request, 'index.html', document_root=os.path.join(settings.BASE_DIR, 'static'))

urlpatterns += [
    re_path(r'^(?!api/).*$', serve_spa),
]