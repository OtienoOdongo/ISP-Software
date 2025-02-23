


# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from django.views.generic import TemplateView




# urlpatterns = [
#     path('admin/', admin.site.urls),
    
#     # Serve the frontend entry point for the root URL
#     path('', TemplateView.as_view(template_name='index.html')),
    
#     # Authentication URLs
#     path('api/auth/', include('authentication.urls')),

#     # User Management URLs
#     path('api/user_management/', include('user_management.api.urls')),

#     # Support URLs
#     path('api/support/', include('support.urls')),

#     # Reporting URLs
#     path('api/reporting/', include('reporting.api.urls')),

#     # Payments URLs
#     path('api/payments/', include('payments.api.urls')),

#     # Network Management URLs
#     path('api/network_management/', include('network_management.api.urls')),

#     # Internet Plans URLs
#     path('api/internet_plans/', include('internet_plans.api.urls')),

#     # Dashboard
#     path('api/dashboard/', include('dashboard.urls')),
# ]




# # Serve static files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)






from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),

    # Serve the frontend entry point
    path('', lambda request: serve(request, 'index.html', document_root=os.path.join(settings.BASE_DIR, 'static'))),

    # API routes
    path('api/auth/', include('authentication.urls')),
    path('api/user_management/', include('user_management.api.urls')),
    path('api/support/', include('support.urls')),
    path('api/reporting/', include('reporting.api.urls')),
    path('api/payments/', include('payments.api.urls')),
    path('api/network_management/', include('network_management.api.urls')),
    path('api/internet_plans/', include('internet_plans.api.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
