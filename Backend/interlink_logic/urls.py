from django.contrib import admin
from django.urls import path, include

# Main URL configuration for the apps, linking to the API endpoints.
# Patterns:
# - /api/ : Includes all API routes defined in api/urls.py

urlpatterns = [
    path('admin/', admin.site.urls),
    path('user_management/', include([
        path('user_profile/', include('user_management.user_profile.urls')),
        path('activity_log/', include('user_management.user_activities.urls')),
        path('plan_assignment/', include('user_management.plan_assignment.urls')),
        path('billing_payment/', include('user_management.billing_payment.urls')),
       
    ])),
]
