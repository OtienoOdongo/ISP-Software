# from django.urls import path
# from internet_plans.api.views.create_plan_views import (
#     # Plan Templates
#     PlanTemplateListCreateView,
#     PlanTemplateDetailView,
#     PublicPlanTemplateListView,
#     CreatePlanFromTemplateView,
    
#     # Internet Plans
#     InternetPlanListCreateView,
#     InternetPlanDetailView,
#     PublicInternetPlanListView,
    
#     # Subscriptions
#     SubscriptionListView,
    
#     # Analytics
#     PlanAnalyticsView,
#     PlanAccessTypeAnalyticsView,
    
#     # Router Management
#     RouterCompatibilityView,
#     ActivatePlanOnRouterView
# )

# app_name = 'internet_plans'

# urlpatterns = [
#     # Plan Templates
#     path('templates/', PlanTemplateListCreateView.as_view(), name='template-list-create'),
#     path('templates/<int:pk>/', PlanTemplateDetailView.as_view(), name='template-detail'),
#     path('templates/public/', PublicPlanTemplateListView.as_view(), name='public-template-list'),
#     path('templates/<int:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
    
#     # Internet Plans
#     path('', InternetPlanListCreateView.as_view(), name='plan-list-create'),
#     path('<int:pk>/', InternetPlanDetailView.as_view(), name='plan-detail'),
#     path('public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
    
#     # Subscriptions
#     path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    
#     # Analytics
#     path('analytics/', PlanAnalyticsView.as_view(), name='plan-analytics'),
#     path('analytics/access-types/', PlanAccessTypeAnalyticsView.as_view(), name='access-type-analytics'),
    
#     # Router Management
#     path('<int:plan_id>/compatible-routers/', RouterCompatibilityView.as_view(), name='router-compatibility'),
#     path('<int:plan_id>/activate-on-router/<int:router_id>/', ActivatePlanOnRouterView.as_view(), name='activate-on-router'),
# ]







from django.urls import path
from internet_plans.api.views.create_plan_views import (
    # Plan Templates
    PlanTemplateListCreateView,
    PlanTemplateDetailView,
    TemplateIncrementUsageView,
    PublicPlanTemplateListView,
    CreatePlanFromTemplateView,
    
    # Internet Plans
    InternetPlanListCreateView,
    InternetPlanDetailView,
    PublicInternetPlanListView,
    
    # Subscriptions
    SubscriptionListView,
    
    # Analytics
    PlanAnalyticsView,
    PlanAccessTypeAnalyticsView,
    
    # Router Management
    RouterCompatibilityView,
    ActivatePlanOnRouterView
)

app_name = 'internet_plans'

urlpatterns = [
    # Plan Templates
    path('templates/', PlanTemplateListCreateView.as_view(), name='template-list-create'),
    path('templates/<int:pk>/', PlanTemplateDetailView.as_view(), name='template-detail'),
    path('templates/<int:pk>/increment-usage/', TemplateIncrementUsageView.as_view(), name='template-increment-usage'),
    path('templates/public/', PublicPlanTemplateListView.as_view(), name='public-template-list'),
    path('templates/<int:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
    
    # Internet Plans
    path('', InternetPlanListCreateView.as_view(), name='plan-list-create'),
    path('<int:pk>/', InternetPlanDetailView.as_view(), name='plan-detail'),
    path('public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
    
    # Subscriptions
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    
    # Analytics
    path('analytics/', PlanAnalyticsView.as_view(), name='plan-analytics'),
    path('analytics/access-types/', PlanAccessTypeAnalyticsView.as_view(), name='access-type-analytics'),
    
    # Router Management
    path('<int:plan_id>/compatible-routers/', RouterCompatibilityView.as_view(), name='router-compatibility'),
    path('<int:plan_id>/activate-on-router/<int:router_id>/', ActivatePlanOnRouterView.as_view(), name='activate-on-router'),
]