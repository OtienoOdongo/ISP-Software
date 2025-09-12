# from django.urls import path
# from internet_plans.api.views.create_plan_views import (
#     InternetPlanListCreateView,
#     InternetPlanDetailView,
#     PublicInternetPlanListView
# )
# from internet_plans.api.views.plan_analytics_views import PlanAnalyticsView  
# app_name = 'internet_plans'

# urlpatterns = [
#     path('', InternetPlanListCreateView.as_view(), name='plan-list-create'),
#     path('<int:pk>/', InternetPlanDetailView.as_view(), name='plan-detail'),
#     path('public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
#     path('plan_analytics/', PlanAnalyticsView.as_view(), name='plan_analytics'),
# ]



from django.urls import path
from internet_plans.api.views.create_plan_views import (
    InternetPlanListCreateView,
    InternetPlanDetailView,
    PublicInternetPlanListView,
    SubscriptionListView,
    SubscriptionAnalyticsView,
    RouterCompatibilityView,
    ActivatePlanOnRouterView
)

from internet_plans.api.views.plan_analytics_views import PlanAnalyticsView  
app_name = 'internet_plans'

urlpatterns = [
    # List and create plans (authenticated)
    path('', InternetPlanListCreateView.as_view(), name='plan-list-create'),
    
    # Detail view for a specific plan (get, put, delete)
    path('<int:pk>/', InternetPlanDetailView.as_view(), name='plan-detail'),
    
    # Public list of active plans (no auth)
    path('public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
    
    # List subscriptions with filters
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    
    # Analytics dashboard
    path('subscription-analytics/', PlanAnalyticsView.as_view(), name='subscription_analytics'),
    
    # Compatible routers for a plan
    path('<int:plan_id>/compatible-routers/', RouterCompatibilityView.as_view(), name='router-compatibility'),
    
    # Activate plan on specific router
    path('<int:plan_id>/activate-on-router/<int:router_id>/', ActivatePlanOnRouterView.as_view(), name='activate-on-router'),

    # plan analysis
    path('plan_analytics/', PlanAnalyticsView.as_view(), name='plan_analytics'),
]



