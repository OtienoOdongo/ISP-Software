




# from django.urls import path
# from internet_plans.api.views.create_plan_views import (
#     PlanTemplateListCreateView,
#     PlanTemplateDetailView,
#     CreatePlanFromTemplateView,
#     InternetPlanListCreateView,
#     InternetPlanDetailView,
#     PublicInternetPlanListView,
# )
# from internet_plans.api.views.subscription_views import (
#     SubscriptionListView,
#     SubscriptionActivationView,
#     SubscriptionStatusView,
# )
# from internet_plans.api.views.client_views import (
#     ClientPlanPurchaseView,
#     PaymentCallbackView,
# )

# urlpatterns = [
#     # Template URLs
#     path('templates/', PlanTemplateListCreateView.as_view(), name='plan-template-list-create'),
#     path('templates/<int:pk>/', PlanTemplateDetailView.as_view(), name='plan-template-detail'),
#     path('templates/<int:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
    
#     # Plan URLs
#     path('', InternetPlanListCreateView.as_view(), name='internet-plan-list-create'),
#     path('<int:pk>/', InternetPlanDetailView.as_view(), name='internet-plan-detail'),
#     path('public/', PublicInternetPlanListView.as_view(), name='public-internet-plan-list'),
    
#     # Subscription URLs
#     path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
#     path('subscriptions/<int:subscription_id>/activate/', SubscriptionActivationView.as_view(), name='subscription-activate'),
#     path('subscriptions/<int:subscription_id>/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    
#     # Client Purchase URLs
#     path('client/purchase/', ClientPlanPurchaseView.as_view(), name='client-purchase-plan'),
#     path('payment-callback/', PaymentCallbackView.as_view(), name='payment-callback'),
# ]







"""
Internet Plans - URL Configuration
"""

from django.urls import path
from internet_plans.api.views.plan_views import (
    PlanTemplateListView,
    PlanTemplateDetailView,
    CreatePlanFromTemplateView,
    InternetPlanListView,
    InternetPlanDetailView,
    PublicInternetPlanListView,
    PlanStatisticsView
)
from internet_plans.api.views.subscription_views import (
    SubscriptionListView,
    SubscriptionDetailView,
    SubscriptionActivationView,
    SubscriptionRenewView,
    SubscriptionStatusView,
    SubscriptionStatisticsView
)
from internet_plans.api.views.client_views import (
    ClientPlanListView,
    ClientPlanDetailView,
    ClientPlanPurchaseView,
    PaymentCallbackView
)

urlpatterns = [
    # ==================== PLAN TEMPLATE ENDPOINTS ====================
    # Admin/Staff only - Manage plan templates
    path('templates/', PlanTemplateListView.as_view(), name='plan-template-list'),
    # List all plan templates (GET) or create new template (POST) - STAFF ONLY
    
    path('templates/<uuid:template_id>/', PlanTemplateDetailView.as_view(), name='plan-template-detail'),
    # Get, update, or delete specific template - STAFF ONLY
    
    path('templates/<uuid:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), 
         name='create-plan-from-template'),
    # Create new internet plan from existing template - STAFF ONLY
    
    
    # ==================== INTERNET PLAN ENDPOINTS ====================
    # Admin/Staff only - Manage internet plans
    path('plans/', InternetPlanListView.as_view(), name='internet-plan-list'),
    # List all internet plans (GET) or create new plan (POST) - STAFF ONLY
    
    path('plans/<uuid:plan_id>/', InternetPlanDetailView.as_view(), name='internet-plan-detail'),
    # Get, update, or delete specific plan - STAFF ONLY
    
    path('plans/public/', PublicInternetPlanListView.as_view(), name='public-internet-plan-list'),
    # Public endpoint - list active plans for clients to view (NO AUTH REQUIRED)
    
    path('plans/statistics/', PlanStatisticsView.as_view(), name='plan-statistics'),
    # Get statistics about plans - STAFF ONLY
    
    
    # ==================== SUBSCRIPTION ENDPOINTS ====================
    # Admin/Staff only - Manage all subscriptions
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    # List all subscriptions - STAFF ONLY (clients cannot access dashboard)
    
    path('subscriptions/<uuid:subscription_id>/', SubscriptionDetailView.as_view(), 
         name='subscription-detail'),
    # Get or update specific subscription - STAFF ONLY
    
    path('subscriptions/<uuid:subscription_id>/activate/', SubscriptionActivationView.as_view(), 
         name='subscription-activate'),
    # Activate subscription after payment - STAFF ONLY (or payment callback)
    
    path('subscriptions/<uuid:subscription_id>/renew/', SubscriptionRenewView.as_view(), 
         name='subscription-renew'),
    # Renew subscription - STAFF ONLY
    
    path('subscriptions/<uuid:subscription_id>/status/', SubscriptionStatusView.as_view(), 
         name='subscription-status'),
    # Get detailed status for subscription - STAFF ONLY
    
    path('subscriptions/statistics/', SubscriptionStatisticsView.as_view(), 
         name='subscription-statistics'),
    # Get subscription statistics - STAFF ONLY
    
    
    # ==================== CLIENT-FACING ENDPOINTS ====================
    # Public endpoints - no authentication required
    # Used by landing pages (hotspot/PPPoE clients)
    path('client/plans/', ClientPlanListView.as_view(), name='client-plan-list'),
    # Public endpoint - clients can browse available plans on landing page
    
    path('client/plans/<uuid:plan_id>/', ClientPlanDetailView.as_view(), 
         name='client-plan-detail'),
    # Public endpoint - get detailed plan info on landing page
    
    path('client/purchase/', ClientPlanPurchaseView.as_view(), name='client-plan-purchase'),
    # Public endpoint - initiate plan purchase from landing page
    
    path('client/payment-callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    # Public endpoint - payment gateway calls this after payment
    # Note: This is called by external payment service, not by clients directly
]