


# """
# Service Operations URL Configuration
# Production-ready with comprehensive API endpoints
# """

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from django.utils import timezone
# from rest_framework.response import Response
# from service_operations.api.views.subscription_views import (
#     SubscriptionListView,
#     SubscriptionDetailView,
#     SubscriptionSuspendView,
#     SubscriptionActivateView,
#     SubscriptionRenewView,
#     SubscriptionUsageView,
#     SubscriptionSearchView,
#     SubscriptionStatisticsView,
#     SubscriptionHealthView,
# )

# from service_operations.api.views.client_views import (
#     ClientPortalSubscriptionView,
#     ClientPortalPurchaseView,
#     ClientPortalPaymentCallbackView,
#     ClientPortalRenewalView,
#     ClientPortalStatusView,
#     ClientOperationsView,
#     ClientOperationDetailView,
# )

# from service_operations.api.views.activation_views import (
#     ActivationQueueView,
#     ActivationQueueDetailView,
#     ActivationProcessView,
#     ActivationRetryView,
#     ActivationStatsView,
# )

# from service_operations.api.views.operation_views import (
#     OperationLogView,
#     OperationLogDetailView,
#     OperationStatsView,
#     SystemHealthView,
#     DashboardView,
# )

# # Initialize router
# router = DefaultRouter()

# urlpatterns = [
#     # ==================== SUBSCRIPTION MANAGEMENT ====================
#     # Subscription CRUD operations
#     path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
#     path('subscriptions/<uuid:subscription_id>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
#     path('subscriptions/<uuid:subscription_id>/activate/', SubscriptionActivateView.as_view(), name='subscription-activate'),
#     path('subscriptions/<uuid:subscription_id>/renew/', SubscriptionRenewView.as_view(), name='subscription-renew'),
#     path('subscriptions/<uuid:subscription_id>/usage/', SubscriptionUsageView.as_view(), name='subscription-usage'),
#     path('subscriptions/<uuid:subscription_id>/suspend/', SubscriptionSuspendView.as_view(), name='subscription-suspend'),
    
#     # Subscription search and statistics
#     path('subscriptions/search/', SubscriptionSearchView.as_view(), name='subscription-search'),
#      path('subscriptions/stats/', SubscriptionStatisticsView.as_view(), name='subscription-stats'),
    
#     # ==================== CLIENT PORTAL ENDPOINTS ====================
#     # Client portal subscription management
#     path('client/portal/subscription/', ClientPortalSubscriptionView.as_view(), name='client-portal-subscription'),
#     path('client/portal/subscription/<uuid:subscription_id>/purchase/', ClientPortalPurchaseView.as_view(), name='client-portal-purchase'),
#     path('client/portal/subscription/<uuid:subscription_id>/renew/', ClientPortalRenewalView.as_view(), name='client-portal-renewal'),
#     path('client/portal/subscription/<uuid:subscription_id>/status/', ClientPortalStatusView.as_view(), name='client-portal-status'),
#     path('client/portal/status/', ClientPortalStatusView.as_view(), name='client-portal-status-all'),
    
#     # Client operations
#     path('client/operations/', ClientOperationsView.as_view(), name='client-operations'),
#     path('client/operations/<uuid:operation_id>/', ClientOperationDetailView.as_view(), name='client-operation-detail'),
    
#     # Payment callback (public endpoint)
#     path('client/payment/callback/', ClientPortalPaymentCallbackView.as_view(), name='client-payment-callback'),
    
#     # ==================== ACTIVATION MANAGEMENT ====================
#     # Activation queue management
#     path('activations/queue/', ActivationQueueView.as_view(), name='activation-queue'),
#     path('activations/queue/<uuid:activation_id>/', ActivationQueueDetailView.as_view(), name='activation-queue-detail'),
#     path('activations/queue/<uuid:activation_id>/process/', ActivationProcessView.as_view(), name='activation-process'),
#     path('activations/queue/<uuid:activation_id>/retry/', ActivationRetryView.as_view(), name='activation-retry'),
    
#     # Activation statistics
#     path('activations/stats/', ActivationStatsView.as_view(), name='activation-stats'),
    
#     # ==================== SYSTEM OPERATIONS ====================
#     # Operation logs
#     path('operations/logs/', OperationLogView.as_view(), name='operation-logs'),
#     path('operations/logs/<uuid:log_id>/', OperationLogDetailView.as_view(), name='operation-log-detail'),
    
#     # System statistics and monitoring
#     path('operations/stats/', OperationStatsView.as_view(), name='operation-stats'),
#     path('dashboard/', DashboardView.as_view(), name='dashboard'),
    
#     # Health
#     path('subscriptions/health/', SubscriptionHealthView.as_view(), name='subscription-health'),
    

# ]







"""
Service Operations URL Configuration
Production-ready with comprehensive API endpoints
FIXED: Added health endpoint for external service checks
FIXED: Ensured all URLs follow consistent pattern
"""

from django.urls import path, include
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.routers import DefaultRouter

from service_operations.api.views.subscription_views import (
    SubscriptionListView,
    SubscriptionDetailView,
    SubscriptionSuspendView,
    SubscriptionActivateView,
    SubscriptionRenewView,
    SubscriptionUsageView,
    SubscriptionSearchView,
    SubscriptionStatisticsView,
    SubscriptionHealthView,
)

from service_operations.api.views.client_views import (
    ClientPortalSubscriptionView,
    ClientPortalPurchaseView,
    ClientPortalPaymentCallbackView,
    ClientPortalRenewalView,
    ClientPortalStatusView,
    ClientOperationsView,
    ClientOperationDetailView,
)

from service_operations.api.views.activation_views import (
    ActivationQueueView,
    ActivationQueueDetailView,
    ActivationProcessView,
    ActivationRetryView,
    ActivationStatsView,
)

from service_operations.api.views.operation_views import (
    OperationLogView,
    OperationLogDetailView,
    OperationStatsView,
    SystemHealthView,
    DashboardView,
)

# Simple health check endpoint
def health_check(request):
    """Simple health check for service discovery"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'service_operations',
        'timestamp': timezone.now().isoformat()
    })

# Initialize router (if using ViewSets)
router = DefaultRouter()

urlpatterns = [
    # ==================== HEALTH CHECK ====================
    path('health/', health_check, name='service-operations-health'),
    
    # ==================== SUBSCRIPTION MANAGEMENT ====================
    # Subscription CRUD operations
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/<uuid:subscription_id>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('subscriptions/<uuid:subscription_id>/activate/', SubscriptionActivateView.as_view(), name='subscription-activate'),
    path('subscriptions/<uuid:subscription_id>/renew/', SubscriptionRenewView.as_view(), name='subscription-renew'),
    path('subscriptions/<uuid:subscription_id>/usage/', SubscriptionUsageView.as_view(), name='subscription-usage'),
    path('subscriptions/<uuid:subscription_id>/suspend/', SubscriptionSuspendView.as_view(), name='subscription-suspend'),
    
    # Subscription search and statistics
    path('subscriptions/search/', SubscriptionSearchView.as_view(), name='subscription-search'),
    path('subscriptions/stats/', SubscriptionStatisticsView.as_view(), name='subscription-stats'),
    path('subscriptions/health/', SubscriptionHealthView.as_view(), name='subscription-health'),
    
    # ==================== CLIENT PORTAL ENDPOINTS ====================
    # Client portal subscription management
    path('client/portal/subscription/', ClientPortalSubscriptionView.as_view(), name='client-portal-subscription'),
    path('client/portal/subscription/<uuid:subscription_id>/purchase/', ClientPortalPurchaseView.as_view(), name='client-portal-purchase'),
    path('client/portal/subscription/<uuid:subscription_id>/renew/', ClientPortalRenewalView.as_view(), name='client-portal-renewal'),
    path('client/portal/subscription/<uuid:subscription_id>/status/', ClientPortalStatusView.as_view(), name='client-portal-status'),
    path('client/portal/status/', ClientPortalStatusView.as_view(), name='client-portal-status-all'),
    
    # Client operations
    path('client/operations/', ClientOperationsView.as_view(), name='client-operations'),
    path('client/operations/<uuid:operation_id>/', ClientOperationDetailView.as_view(), name='client-operation-detail'),
    
    # Payment callback (public endpoint)
    path('client/payment/callback/', ClientPortalPaymentCallbackView.as_view(), name='client-payment-callback'),
    
    # ==================== ACTIVATION MANAGEMENT ====================
    # Activation queue management
    path('activations/queue/', ActivationQueueView.as_view(), name='activation-queue'),
    path('activations/queue/<uuid:activation_id>/', ActivationQueueDetailView.as_view(), name='activation-queue-detail'),
    path('activations/queue/<uuid:activation_id>/process/', ActivationProcessView.as_view(), name='activation-process'),
    path('activations/queue/<uuid:activation_id>/retry/', ActivationRetryView.as_view(), name='activation-retry'),
    
    # Activation statistics
    path('activations/stats/', ActivationStatsView.as_view(), name='activation-stats'),
    
    # ==================== SYSTEM OPERATIONS ====================
    # Operation logs
    path('operations/logs/', OperationLogView.as_view(), name='operation-logs'),
    path('operations/logs/<uuid:log_id>/', OperationLogDetailView.as_view(), name='operation-log-detail'),
    
    # System statistics and monitoring
    path('operations/stats/', OperationStatsView.as_view(), name='operation-stats'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    
    # ==================== SYSTEM HEALTH ====================
    path('system/health/', SystemHealthView.as_view(), name='system-health'),
]