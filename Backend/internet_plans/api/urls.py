from django.urls import path
from internet_plans.api.views.create_plan_views import (
    InternetPlanListCreateView,
    InternetPlanDetailView,
    PublicInternetPlanListView
)
from internet_plans.api.views.plan_analytics_views import PlanAnalyticsView  
app_name = 'internet_plans'

urlpatterns = [
    path('', InternetPlanListCreateView.as_view(), name='plan-list-create'),
    path('<int:pk>/', InternetPlanDetailView.as_view(), name='plan-detail'),
    path('public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
    path('plan_analytics/', PlanAnalyticsView.as_view(), name='plan_analytics'),
]