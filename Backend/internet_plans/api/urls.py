





# from django.urls import path
# from internet_plans.api.views.create_plan_views import (
#     PlanTemplateListCreateView,
#     PlanTemplateDetailView,
#     TemplateIncrementUsageView,
#     CreatePlanFromTemplateView,
#     PublicPlanTemplateListView,
#     InternetPlanListCreateView,
#     InternetPlanDetailView,
#     PublicInternetPlanListView,
#     SubscriptionListView,
#     PlanAnalyticsView,
#     PlanAccessTypeAnalyticsView,
#     RouterCompatibilityView,
#     ActivatePlanOnRouterView,
#     TemplateUsageAnalyticsView
# )
# from internet_plans.api.views.integration_views import (
#     PlanRouterIntegrationView,
#     BulkPlanActivationView,
#     ClientAccessTypeDetectionView,
#     ClientPlanPurchaseView,
#     PPPoEClientDashboardView,
#     HotspotClientLandingView
# )

# urlpatterns = [
#     # Template URLs
#     path('templates/', PlanTemplateListCreateView.as_view(), name='plan-template-list-create'),
#     path('templates/<int:pk>/', PlanTemplateDetailView.as_view(), name='plan-template-detail'),
#     path('templates/<int:pk>/increment-usage/', TemplateIncrementUsageView.as_view(), name='increment-template-usage'),
#     path('templates/<int:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
#     path('templates/public/', PublicPlanTemplateListView.as_view(), name='public-plan-template-list'),
    
#     # Plan URLs
#     path('', InternetPlanListCreateView.as_view(), name='internet-plan-list-create'),
#     path('<int:pk>/', InternetPlanDetailView.as_view(), name='internet-plan-detail'),
#     path('public/', PublicInternetPlanListView.as_view(), name='public-internet-plan-list'),
    
#     # Subscription URLs
#     path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    
#     # Analytics URLs
#     path('analytics/', PlanAnalyticsView.as_view(), name='plan-analytics'),
#     path('analytics/access-types/', PlanAccessTypeAnalyticsView.as_view(), name='plan-access-type-analytics'),
#     path('analytics/template-usage/', TemplateUsageAnalyticsView.as_view(), name='template-usage-analytics'),
    
#     # Router Compatibility URLs
#     path('<int:plan_id>/router-compatibility/', RouterCompatibilityView.as_view(), name='router-compatibility'),
#     path('<int:plan_id>/activate-on-router/<int:router_id>/', ActivatePlanOnRouterView.as_view(), name='activate-plan-on-router'),
    
#     # Integration URLs
#     path('<int:plan_id>/router-integration/', PlanRouterIntegrationView.as_view(), name='plan-router-integration'),
#     path('<int:plan_id>/bulk-activate/', BulkPlanActivationView.as_view(), name='bulk-plan-activation'),
    
#     # Client URLs (for both Hotspot and PPPoE)
#     path('client/detect-access-type/', ClientAccessTypeDetectionView.as_view(), name='client-detect-access-type'),
#     path('client/purchase-plan/', ClientPlanPurchaseView.as_view(), name='client-purchase-plan'),
    
#     # PPPoE Client URLs
#     path('client/pppoe/dashboard/', PPPoEClientDashboardView.as_view(), name='pppoe-client-dashboard'),
    
#     # Hotspot Client URLs
#     path('client/hotspot/landing/', HotspotClientLandingView.as_view(), name='hotspot-client-landing'),
# ]












from django.urls import path
from internet_plans.api.views.create_plan_views import (
    PlanTemplateListCreateView,
    PlanTemplateDetailView,
    CreatePlanFromTemplateView,
    InternetPlanListCreateView,
    InternetPlanDetailView,
    PublicInternetPlanListView,
)
from internet_plans.api.views.subscription_views import (
    SubscriptionListView,
    SubscriptionActivationView,
    SubscriptionStatusView,
)
from internet_plans.api.views.client_views import (
    ClientPlanPurchaseView,
    PaymentCallbackView,
)

urlpatterns = [
    # Template URLs
    path('templates/', PlanTemplateListCreateView.as_view(), name='plan-template-list-create'),
    path('templates/<int:pk>/', PlanTemplateDetailView.as_view(), name='plan-template-detail'),
    path('templates/<int:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
    
    # Plan URLs
    path('', InternetPlanListCreateView.as_view(), name='internet-plan-list-create'),
    path('<int:pk>/', InternetPlanDetailView.as_view(), name='internet-plan-detail'),
    path('public/', PublicInternetPlanListView.as_view(), name='public-internet-plan-list'),
    
    # Subscription URLs
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/<int:subscription_id>/activate/', SubscriptionActivationView.as_view(), name='subscription-activate'),
    path('subscriptions/<int:subscription_id>/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    
    # Client Purchase URLs
    path('client/purchase/', ClientPlanPurchaseView.as_view(), name='client-purchase-plan'),
    path('payment-callback/', PaymentCallbackView.as_view(), name='payment-callback'),
]