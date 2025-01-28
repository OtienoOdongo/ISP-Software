from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # User Management URLs
    path('user_management/', include('user_management.api.urls')),

    # Support URLs
    path('support/', include('support.urls')),

    # Reporting URLs
    path('reporting/', include('reporting.api.urls')),

    # Payments URLs
    path('payments/', include('payments.api.urls')),

    # Network Management URLs
    path('network_management/', include('network_management.api.urls')),

    # Internet Plans URLs
    path('internet_plans/', include('internet_plans.api.urls')),
]