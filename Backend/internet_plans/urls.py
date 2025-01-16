from django.urls import path
from .views import (
    CreatePlanView,
    PlanAnalyticsView,
    AutoRenewalSettingsView,
)

app_name = "internet_plans"

urlpatterns = [
    path('create/', CreatePlanView.as_view(), name='create-plan'),
    path('analytics/', PlanAnalyticsView.as_view(), name='plan-analytics'),
    path('auto-renewal/', AutoRenewalSettingsView.as_view(), name='auto-renewal-settings'),
]
