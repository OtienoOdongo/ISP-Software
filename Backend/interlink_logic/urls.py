from django.contrib import admin
from django.urls import path, include

# Main URL configuration for the apps, linking to the API endpoints.
# Patterns:
# - /api/ : Includes all API routes
#   - /api/user_management/ : Includes various user management related endpoints
#   - /api/plans/ : Includes endpoints for managing internet plans

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('user_management/', include('user_management.api.urls')),
        path('plans/', include('internet_plans.api.urls')),
    ])),
]