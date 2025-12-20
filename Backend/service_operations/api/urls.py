






# # service_operations/api/views/urls.py

# """
# Service Operations - URL Configuration
# Production-ready URL routing with comprehensive API endpoints
# References external apps for user/purchase details - NO direct user creation or payment processing
# """

# from django.urls import path, include
# from service_operations.views.subscription_views import (
#     SubscriptionListView,
#     SubscriptionDetailView,
#     SubscriptionCreateView,
#     SubscriptionUpdateView,
#     SubscriptionRenewView,
#     SubscriptionCancelView,
#     SubscriptionUsageUpdateView,
#     SubscriptionStatisticsView,
# )
# from service_operations.views.activation_views import (
#     ActivationQueueListView,
#     ActivationQueueDetailView,
#     ActivationRequestView,
#     ActivationStatusView,
#     ActivationRetryView,
#     ActivationStatisticsView,
# )
# from service_operations.views.client_views import (
#     ClientPurchaseView,
#     ClientPaymentCallbackView,
#     ClientSubscriptionListView,
#     ClientSubscriptionDetailView,
#     ClientRenewalView,
#     ClientOperationsView,
#     ClientServiceAvailabilityView,
# )
# from service_operations.views.operation_views import (
#     OperationLogListView,
#     OperationLogDetailView,
#     OperationStatisticsView,
#     HealthCheckView,
#     ServiceStatusView,
# )

# app_name = 'service_operations'

# urlpatterns = [
#     # ==================== SUBSCRIPTION MANAGEMENT ENDPOINTS ====================
#     # Subscription CRUD operations
#     path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'), # List all subscriptions (GET) - STAFF ONLY
#     path('subscriptions/create/', SubscriptionCreateView.as_view(), name='subscription-create'), # Create new subscription - STAFF ONLY
#     path('subscriptions/<uuid:subscription_id>/', SubscriptionDetailView.as_view(), name='subscription-detail'), # Get subscription details - STAFF ONLY
#     path('subscriptions/<uuid:subscription_id>/update/', SubscriptionUpdateView.as_view(), name='subscription-update'), # Update subscription - STAFF ONLY
#     path('subscriptions/<uuid:subscription_id>/renew/', SubscriptionRenewView.as_view(), name='subscription-renew'), # Renew subscription (staff-initiated or free) - STAFF ONLY
#     path('subscriptions/<uuid:subscription_id>/cancel/', SubscriptionCancelView.as_view(), name='subscription-cancel'), # Cancel subscription - STAFF ONLY
#     path('subscriptions/<uuid:subscription_id>/usage/', SubscriptionUsageUpdateView.as_view(), name='subscription-usage-update'), # Update usage from network mgmt - STAFF ONLY (or trusted internal call)
#     path('subscriptions/statistics/', SubscriptionStatisticsView.as_view(), name='subscription-statistics'), # Get subscription statistics - STAFF ONLY

#     # ==================== ACTIVATION MANAGEMENT ENDPOINTS ====================
#     # Activation queue operations
#     path('activations/queue/', ActivationQueueListView.as_view(), name='activation-queue-list'), # List activation queue items - STAFF ONLY
#     path('activations/queue/<uuid:queue_item_id>/', ActivationQueueDetailView.as_view(), name='activation-queue-detail'), # Get activation queue item details - STAFF ONLY
#     path('activations/request/', ActivationRequestView.as_view(), name='activation-request'), # Request activation for a subscription - STAFF ONLY
#     path('activations/status/<uuid:subscription_id>/', ActivationStatusView.as_view(), name='activation-status'), # Check activation status - STAFF ONLY
#     path('activations/retry/<uuid:queue_item_id>/', ActivationRetryView.as_view(), name='activation-retry'), # Retry a failed activation - STAFF ONLY
#     path('activations/statistics/', ActivationStatisticsView.as_view(), name='activation-statistics'), # Get activation statistics - STAFF ONLY

#     # ==================== CLIENT-FACING ENDPOINTS ====================
#     # Client purchase and operations (referencing external apps)
#     path('client/purchase/', ClientPurchaseView.as_view(), name='client-purchase'), # Purchase plan request (public endpoint) - CLIENT AUTH REQUIRED
#     path('client/payment-callback/', ClientPaymentCallbackView.as_view(), name='client-payment-callback'), # Payment gateway callback - NO AUTH REQUIRED (but secured via signature/validation)
#     path('client/subscriptions/', ClientSubscriptionListView.as_view(), name='client-subscription-list'), # Get client's subscriptions - CLIENT AUTH REQUIRED
#     path('client/subscriptions/<uuid:subscription_id>/', ClientSubscriptionDetailView.as_view(), name='client-subscription-detail'), # Get client's subscription details - CLIENT AUTH REQUIRED
#     path('client/subscriptions/<uuid:subscription_id>/renew/', ClientRenewalView.as_view(), name='client-renewal'), # Renew subscription - CLIENT AUTH REQUIRED
#     path('client/operations/', ClientOperationsView.as_view(), name='client-operations'), # Manage client's operations (e.g., support tickets) - CLIENT AUTH REQUIRED
#     path('client/availability/', ClientServiceAvailabilityView.as_view(), name='client-service-availability'), # Check service availability - CLIENT AUTH REQUIRED

#     # ==================== OPERATION MANAGEMENT ENDPOINTS ====================
#     # Operation monitoring and system management
#     path('operations/logs/', OperationLogListView.as_view(), name='operation-log-list'), # List operation logs - STAFF ONLY
#     path('operations/logs/<uuid:log_id>/', OperationLogDetailView.as_view(), name='operation-log-detail'), # Get operation log details - STAFF ONLY
#     path('operations/statistics/', OperationStatisticsView.as_view(), name='operation-statistics'), # Get comprehensive operation statistics - STAFF ONLY
#     path('health/', HealthCheckView.as_view(), name='health-check'), # Health check endpoint - NO AUTH REQUIRED
#     path('status/', ServiceStatusView.as_view(), name='service-status'), # Get detailed service status - STAFF ONLY
# ]

# # API Documentation Info (example)
# api_info = {
#     'name': 'Service Operations API',
#     'version': '2.1.0',
#     'description': 'Execution and delivery system for internet plans, handling subscriptions, activations, and client operations. Integrates with Authentication, UserManagement, Payment, InternetPlans, and NetworkManagement apps.',
#     'base_path': '/api/service_operations/',
#     'authentication': 'JWT Token (via Authentication app)',
#     'permissions': {
#         'public': 'AllowAny (health check only)',
#         'client': 'JWT Token (Client scope)',
#         'staff': 'JWT Token (Staff scope)',
#     },
#     'external_dependencies': [
#         'Authentication App (User identity)',
#         'User Management App (Client profiles)',
#         'Payment App (Processing)',
#         'Internet Plans App (Plan definitions)',
#         'Network Management App (Router integration, Usage)'
#     ]
# }









"""
Service Operations URL Configuration
Production-ready with comprehensive API endpoints
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.utils import timezone
from rest_framework.response import Response
from service_operations.views.subscription_views import (
    SubscriptionListView,
    SubscriptionDetailView,
    SubscriptionCreateView,
    SubscriptionUpdateView,
    SubscriptionActivateView,
    SubscriptionRenewView,
    SubscriptionUsageView,
    SubscriptionStatsView,
    SubscriptionSearchView,
)

from service_operations.views.client_views import (
    ClientPortalSubscriptionView,
    ClientPortalPurchaseView,
    ClientPortalPaymentCallbackView,
    ClientPortalRenewalView,
    ClientPortalStatusView,
    ClientOperationsView,
    ClientOperationDetailView,
)

from service_operations.views.activation_views import (
    ActivationQueueView,
    ActivationQueueDetailView,
    ActivationProcessView,
    ActivationRetryView,
    ActivationStatsView,
)

from service_operations.views.operation_views import (
    OperationLogView,
    OperationLogDetailView,
    OperationStatsView,
    SystemHealthView,
    DashboardView,
)

# Initialize router
router = DefaultRouter()

urlpatterns = [
    # ==================== SUBSCRIPTION MANAGEMENT ====================
    # Subscription CRUD operations
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/create/', SubscriptionCreateView.as_view(), name='subscription-create'),
    path('subscriptions/<uuid:subscription_id>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('subscriptions/<uuid:subscription_id>/update/', SubscriptionUpdateView.as_view(), name='subscription-update'),
    path('subscriptions/<uuid:subscription_id>/activate/', SubscriptionActivateView.as_view(), name='subscription-activate'),
    path('subscriptions/<uuid:subscription_id>/renew/', SubscriptionRenewView.as_view(), name='subscription-renew'),
    path('subscriptions/<uuid:subscription_id>/usage/', SubscriptionUsageView.as_view(), name='subscription-usage'),
    
    # Subscription search and statistics
    path('subscriptions/search/', SubscriptionSearchView.as_view(), name='subscription-search'),
    path('subscriptions/stats/', SubscriptionStatsView.as_view(), name='subscription-stats'),
    
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
    
    # Health checks
    path('health/', SystemHealthView.as_view(), name='system-health'),
    
    # ==================== API DOCUMENTATION ====================
    # API info endpoint
    path('api-info/', lambda request: Response({
        'name': 'Service Operations API',
        'version': '2.0.0',
        'description': 'Execution and delivery system for internet plans',
        'base_path': '/api/service_operations/',
        'authentication': 'JWT Token',
        'client_types': ['hotspot_client', 'pppoe_client'],
        'timestamp': timezone.now().isoformat(),
    }), name='api-info'),
]

# API Documentation Info
api_info = {
    'name': 'Service Operations API',
    'version': '2.0.0',
    'description': 'Dynamic subscription management and activation system for WiFi ISP',
    'modules': {
        'subscription_management': {
            'description': 'Manage internet subscriptions for both hotspot and PPPoE clients',
            'endpoints': [
                {
                    'name': 'List Subscriptions',
                    'path': '/api/service_operations/subscriptions/',
                    'methods': ['GET', 'POST'],
                    'description': 'List all subscriptions or create new ones',
                    'client_types': ['hotspot_client', 'pppoe_client']
                },
                {
                    'name': 'Subscription Details',
                    'path': '/api/service_operations/subscriptions/{id}/',
                    'methods': ['GET', 'PUT', 'DELETE'],
                    'description': 'Get, update, or cancel a subscription'
                },
            ]
        },
        'client_portal': {
            'description': 'Endpoints for client self-service portal',
            'endpoints': [
                {
                    'name': 'Client Subscription Request',
                    'path': '/api/service_operations/client/portal/subscription/',
                    'methods': ['POST'],
                    'description': 'Create subscription request from client portal'
                },
                {
                    'name': 'Payment Callback',
                    'path': '/api/service_operations/client/payment/callback/',
                    'methods': ['POST'],
                    'description': 'Payment gateway callback endpoint'
                },
            ]
        },
        'activation_management': {
            'description': 'Activation queue and processing system',
            'endpoints': [
                {
                    'name': 'Activation Queue',
                    'path': '/api/service_operations/activations/queue/',
                    'methods': ['GET'],
                    'description': 'View and manage activation queue'
                },
                {
                    'name': 'Process Activation',
                    'path': '/api/service_operations/activations/queue/{id}/process/',
                    'methods': ['POST'],
                    'description': 'Process a specific activation'
                },
            ]
        }
    }
}