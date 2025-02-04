from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # User Management URLs
    path('api/user_management/', include('user_management.api.urls')),

    # Support URLs
    path('api/support/', include('support.urls')),

    # Reporting URLs
    path('/apireporting/', include('reporting.api.urls')),

    # Payments URLs
    path('api/payments/', include('payments.api.urls')),

    # Network Management URLs
    path('api/network_management/', include('network_management.api.urls')),

    # Internet Plans URLs
    path('api/internet_plans/', include('internet_plans.api.urls')),

    # account
    path('api/account/', include('account.api.urls')),

    path('api/dashboard/', include('dashboard.urls')),

    path('api/auth/', include('authentication.urls')),
]