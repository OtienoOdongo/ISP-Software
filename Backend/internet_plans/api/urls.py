from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InternetPlanViewSet, PlanAnalyticsViewSet

router = DefaultRouter()
router.register(r'plans', InternetPlanViewSet, basename='plans')  # For creating and managing plans
router.register(r'plan_analytics', PlanAnalyticsViewSet, basename='plan-analytics')  # For plan analytics

# URL patterns for internet plans API endpoints.
# Uses a DefaultRouter to automatically generate RESTful URL routes for the ViewSets.
# Patterns:
# - /plans/ : Create and manage internet plans
# - /plan_analytics/ : Retrieve analytics for plans
urlpatterns = [
    path('', include(router.urls)),
]