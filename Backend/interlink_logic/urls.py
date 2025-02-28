

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

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

# Fallback to index.html for all unmatched routes (SPA support)
urlpatterns += [
    re_path(r'^.*$', lambda request: serve(request, 'index.html', document_root=os.path.join(settings.BASE_DIR, 'static'))),
]