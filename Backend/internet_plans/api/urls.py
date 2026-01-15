# """
# Internet Plans - URL Configuration
# Production-ready URL routing with comprehensive API endpoints
# """

# from django.urls import path
# from internet_plans.views.plan_views import (
#     InternetPlanListView,
#     InternetPlanDetailView,
#     InternetPlanCreateView,
#     InternetPlanUpdateView,
#     InternetPlanDeleteView,
#     PublicInternetPlanListView,
#     PlanStatisticsView,
#     PlanCompatibilityCheckView,
#     PlanRecommendationView
# )
# from internet_plans.views.template_views import (
#     PlanTemplateListView,
#     PlanTemplateDetailView,
#     PlanTemplateCreateView,
#     PlanTemplateUpdateView,
#     PlanTemplateDeleteView,
#     CreatePlanFromTemplateView
# )
# from internet_plans.views.pricing_views import (
#     PriceMatrixListView,
#     PriceMatrixDetailView,
#     DiscountRuleListView,
#     DiscountRuleDetailView,
#     PriceCalculationView,
#     BulkPriceCalculationView,
#     PricingStatisticsView
# )

# urlpatterns = [
#     # ==================== PLAN MANAGEMENT ENDPOINTS ====================
#     # Plan CRUD operations
#     path('plans/', InternetPlanListView.as_view(), name='plan-list'),
#     # List all internet plans (GET) or create new plan (POST) - AUTH REQUIRED
    
#     path('plans/create/', InternetPlanCreateView.as_view(), name='plan-create'),
#     # Create new plan (simplified) - STAFF ONLY
    
#     path('plans/<uuid:plan_id>/', InternetPlanDetailView.as_view(), name='plan-detail'),
#     # Get, update, or delete specific plan - AUTH REQUIRED
    
#     path('plans/<uuid:plan_id>/update/', InternetPlanUpdateView.as_view(), name='plan-update'),
#     # Update specific plan fields - STAFF ONLY
    
#     path('plans/<uuid:plan_id>/delete/', InternetPlanDeleteView.as_view(), name='plan-delete'),
#     # Hard delete plan (admin only) - ADMIN ONLY
    
#     path('plans/public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
#     # Public endpoint - list active plans (NO AUTH REQUIRED)
    
#     path('plans/statistics/', PlanStatisticsView.as_view(), name='plan-statistics'),
#     # Get plan statistics - AUTH REQUIRED
    
#     path('plans/compatibility/check/', PlanCompatibilityCheckView.as_view(), name='plan-compatibility-check'),
#     # Check plan compatibility - AUTH REQUIRED
    
#     path('plans/recommendations/', PlanRecommendationView.as_view(), name='plan-recommendations'),
#     # Get plan recommendations - AUTH REQUIRED
    
    
#     # ==================== TEMPLATE MANAGEMENT ENDPOINTS ====================
#     # Template CRUD operations
#     path('templates/', PlanTemplateListView.as_view(), name='template-list'),
#     # List all plan templates (GET) or create new template (POST) - AUTH REQUIRED
    
#     path('templates/create/', PlanTemplateCreateView.as_view(), name='template-create'),
#     # Create new template (simplified) - STAFF ONLY
    
#     path('templates/<uuid:template_id>/', PlanTemplateDetailView.as_view(), name='template-detail'),
#     # Get, update, or delete specific template - AUTH REQUIRED
    
#     path('templates/<uuid:template_id>/update/', PlanTemplateUpdateView.as_view(), name='template-update'),
#     # Update specific template fields - STAFF ONLY
    
#     path('templates/<uuid:template_id>/delete/', PlanTemplateDeleteView.as_view(), name='template-delete'),
#     # Hard delete template (admin only) - ADMIN ONLY
    
#     path('templates/<uuid:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
#     # Create new internet plan from existing template - AUTH REQUIRED
    
    
#     # ==================== PRICING MANAGEMENT ENDPOINTS ====================
#     # Price Matrix CRUD operations
#     path('pricing/matrices/', PriceMatrixListView.as_view(), name='price-matrix-list'),
#     # List all price matrices (GET) or create new matrix (POST) - AUTH REQUIRED
    
#     path('pricing/matrices/<uuid:price_matrix_id>/', PriceMatrixDetailView.as_view(), name='price-matrix-detail'),
#     # Get, update, or delete specific price matrix - AUTH REQUIRED
    
#     # Discount Rule CRUD operations
#     path('pricing/rules/', DiscountRuleListView.as_view(), name='discount-rule-list'),
#     # List all discount rules (GET) or create new rule (POST) - AUTH REQUIRED
    
#     path('pricing/rules/<uuid:discount_rule_id>/', DiscountRuleDetailView.as_view(), name='discount-rule-detail'),
#     # Get, update, or delete specific discount rule - AUTH REQUIRED
    
#     # Price Calculation endpoints
#     path('pricing/calculate/', PriceCalculationView.as_view(), name='price-calculation'),
#     # Calculate price for a plan - AUTH REQUIRED
    
#     path('pricing/calculate/bulk/', BulkPriceCalculationView.as_view(), name='bulk-price-calculation'),
#     # Calculate prices in bulk - AUTH REQUIRED
    
#     path('pricing/statistics/', PricingStatisticsView.as_view(), name='pricing-statistics'),
#     # Get pricing statistics - AUTH REQUIRED
# ]

# # API Documentation Info
# api_info = {
#     'name': 'Internet Plans API',
#     'version': '2.0.0',
#     'description': 'Core plan management system for defining internet plans, templates, and pricing',
#     'base_path': '/api/internet_plans/',
#     'authentication': 'JWT Token (via Authentication app)',
#     'permissions': {
#         'public': 'AllowAny (public endpoints only)',
#         'authenticated': 'IsAuthenticated',
#         'staff': 'IsAdminUser or user.is_staff = True',
#         'admin': 'IsAdminUser'
#     },
#     'modules': {
#         'plan_management': {
#             'description': 'Internet plan definition and management',
#             'endpoints': [
#                 {
#                     'name': 'Plan Management',
#                     'path': '/api/internet_plans/plans/',
#                     'methods': ['GET', 'POST'],
#                     'description': 'Full CRUD for internet plans with advanced filtering',
#                     'permissions': 'authenticated (GET), staff (POST)',
#                     'query_params': [
#                         'active', 'category', 'plan_type', 'access_method', 'search',
#                         'min_price', 'max_price', 'template_id', 'sort_by', 'sort_order'
#                     ]
#                 },
#                 {
#                     'name': 'Plan Detail',
#                     'path': '/api/internet_plans/plans/{plan_id}/',
#                     'methods': ['GET', 'PUT', 'DELETE'],
#                     'description': 'Get, update, or delete specific plan',
#                     'permissions': 'authenticated (GET), staff (PUT, DELETE)'
#                 },
#                 {
#                     'name': 'Public Plans',
#                     'path': '/api/internet_plans/plans/public/',
#                     'methods': ['GET'],
#                     'description': 'Public endpoint for browsing active plans',
#                     'permissions': 'public'
#                 },
#                 {
#                     'name': 'Plan Statistics',
#                     'path': '/api/internet_plans/plans/statistics/',
#                     'methods': ['GET'],
#                     'description': 'Comprehensive plan analytics and statistics',
#                     'permissions': 'authenticated'
#                 },
#                 {
#                     'name': 'Plan Compatibility Check',
#                     'path': '/api/internet_plans/plans/compatibility/check/',
#                     'methods': ['POST'],
#                     'description': 'Check plan compatibility for access methods and routers',
#                     'permissions': 'authenticated'
#                 },
#                 {
#                     'name': 'Plan Recommendations',
#                     'path': '/api/internet_plans/plans/recommendations/',
#                     'methods': ['GET'],
#                     'description': 'Get intelligent plan recommendations based on criteria',
#                     'permissions': 'authenticated',
#                     'query_params': ['client_type', 'budget', 'access_method', 'limit']
#                 }
#             ]
#         },
#         'template_management': {
#             'description': 'Plan template system for reusable plan configurations',
#             'endpoints': [
#                 {
#                     'name': 'Template Management',
#                     'path': '/api/internet_plans/templates/',
#                     'methods': ['GET', 'POST'],
#                     'description': 'Full CRUD for plan templates',
#                     'permissions': 'authenticated (GET), staff (POST)',
#                     'query_params': [
#                         'category', 'search', 'access_type', 'visibility',
#                         'min_price', 'max_price', 'sort_by', 'sort_order'
#                     ]
#                 },
#                 {
#                     'name': 'Template Detail',
#                     'path': '/api/internet_plans/templates/{template_id}/',
#                     'methods': ['GET', 'PUT', 'DELETE'],
#                     'description': 'Get, update, or delete specific template',
#                     'permissions': 'authenticated (GET), staff (PUT, DELETE)'
#                 },
#                 {
#                     'name': 'Create Plan from Template',
#                     'path': '/api/internet_plans/templates/{template_id}/create-plan/',
#                     'methods': ['POST'],
#                     'description': 'Create new internet plan from existing template',
#                     'permissions': 'authenticated'
#                 }
#             ]
#         },
#         'pricing_management': {
#             'description': 'Advanced pricing models, discounts, and price calculations',
#             'endpoints': [
#                 {
#                     'name': 'Price Matrix Management',
#                     'path': '/api/internet_plans/pricing/matrices/',
#                     'methods': ['GET', 'POST'],
#                     'description': 'Manage price matrices for advanced pricing',
#                     'permissions': 'authenticated (GET), staff (POST)',
#                     'query_params': [
#                         'is_active', 'discount_type', 'applies_to', 'target_plan_id',
#                         'valid_date', 'search', 'sort_by', 'sort_order'
#                     ]
#                 },
#                 {
#                     'name': 'Discount Rule Management',
#                     'path': '/api/internet_plans/pricing/rules/',
#                     'methods': ['GET', 'POST'],
#                     'description': 'Manage business rules for applying discounts',
#                     'permissions': 'authenticated (GET), staff (POST)',
#                     'query_params': ['is_active', 'rule_type', 'price_matrix_id', 'search']
#                 },
#                 {
#                     'name': 'Price Calculation',
#                     'path': '/api/internet_plans/pricing/calculate/',
#                     'methods': ['POST'],
#                     'description': 'Calculate final price with discounts and taxes',
#                     'permissions': 'authenticated',
#                     'required_fields': ['plan_id'],
#                     'optional_fields': ['quantity', 'discount_code', 'client_data']
#                 },
#                 {
#                     'name': 'Bulk Price Calculation',
#                     'path': '/api/internet_plans/pricing/calculate/bulk/',
#                     'methods': ['POST'],
#                     'description': 'Calculate prices for multiple plans in batch',
#                     'permissions': 'authenticated',
#                     'max_batch_size': 50
#                 },
#                 {
#                     'name': 'Pricing Statistics',
#                     'path': '/api/internet_plans/pricing/statistics/',
#                     'methods': ['GET'],
#                     'description': 'Pricing analytics and discount effectiveness',
#                     'permissions': 'authenticated'
#                 }
#             ]
#         }
#     },
#     'response_formats': {
#         'success': {
#             'success': True,
#             'data': {},
#             'message': 'Operation successful',
#             'timestamp': 'ISO 8601 timestamp'
#         },
#         'error': {
#             'success': False,
#             'error': 'Error message',
#             'details': 'Additional error details (in debug mode)',
#             'code': 'Error code (optional)',
#             'timestamp': 'ISO 8601 timestamp'
#         },
#         'paginated': {
#             'success': True,
#             'count': 'Total number of results',
#             'next': 'Next page URL (if exists)',
#             'previous': 'Previous page URL (if exists)',
#             'results': 'Array of results',
#             'page': 'Current page number',
#             'total_pages': 'Total number of pages'
#         }
#     },
#     'rate_limits': {
#         'public_endpoints': '100 requests per minute per IP',
#         'authenticated_endpoints': '200 requests per minute per user',
#         'staff_endpoints': '500 requests per minute per user',
#         'bulk_operations': '10 requests per minute per user'
#     },
#     'caching_strategy': {
#         'public_plans': '5 minutes',
#         'plan_details': '5 minutes',
#         'plan_statistics': '10 minutes',
#         'pricing_options': '5 minutes',
#         'price_calculations': '1 minute'
#     },
#     'dependencies': {
#         'required': ['django', 'djangorestframework'],
#         'recommended': ['django-redis', 'celery'],
#         'integration': [
#             'authentication (User authentication)',
#             'service_operations (Subscription management)',
#             'network_management (Network integration)'
#         ]
#     }
# }









"""
Internet Plans - URL Configuration (UPDATED VERSION)
Production-ready URL routing with comprehensive API endpoints
FIXED: Updated URL patterns to match existing view classes
"""

from django.urls import path
from internet_plans.api.plan_views import (
    InternetPlanListView,
    InternetPlanDetailView,
    TimeVariantConfigView,
    PlanAvailabilityCheckView,
    AvailablePlansView,
    PublicInternetPlanListView,
    PlanStatisticsView,
    PlanCompatibilityCheckView,
    PlanRecommendationView,
    TimeVariantTestView
)
from internet_plans.api.template_views import (
    PlanTemplateListView,
    PlanTemplateDetailView,
    CreatePlanFromTemplateView
)
from internet_plans.api.pricing_views import (
    PriceMatrixListView,
    PriceMatrixDetailView,
    DiscountRuleListView,
    DiscountRuleDetailView,
    PriceCalculationView,
    BulkPriceCalculationView,
    PricingStatisticsView,
    PriceMatrixExportView
)

urlpatterns = [
    # ==================== PLAN MANAGEMENT ENDPOINTS ====================
    # Plan CRUD operations
    path('plans/', InternetPlanListView.as_view(), name='plan-list'),
    # List all internet plans (GET) or create new plan (POST) - AUTH REQUIRED
    
    path('plans/<uuid:plan_id>/', InternetPlanDetailView.as_view(), name='plan-detail'),
    # Get, update, or delete specific plan - AUTH REQUIRED
    
    path('plans/public/', PublicInternetPlanListView.as_view(), name='public-plan-list'),
    # Public endpoint - list active plans (NO AUTH REQUIRED)
    
    path('plans/statistics/', PlanStatisticsView.as_view(), name='plan-statistics'),
    # Get plan statistics - AUTH REQUIRED
    
    path('plans/compatibility/check/', PlanCompatibilityCheckView.as_view(), name='plan-compatibility-check'),
    # Check plan compatibility - AUTH REQUIRED
    
    path('plans/recommendations/', PlanRecommendationView.as_view(), name='plan-recommendations'),
    # Get plan recommendations - AUTH REQUIRED
    
    path('plans/availability/check/', PlanAvailabilityCheckView.as_view(), name='plan-availability-check'),
    # Check plan availability (for captive portal) - ALLOW ANY
    
    path('plans/available/', AvailablePlansView.as_view(), name='available-plans'),
    # Get available plans for clients - ALLOW ANY
    
    
    # ==================== TIME VARIANT ENDPOINTS ====================
    path('time-variant/', TimeVariantConfigView.as_view(), name='time-variant-list'),
    # List or create time variant configurations - AUTH REQUIRED
    
    path('time-variant/<uuid:config_id>/', TimeVariantConfigView.as_view(), name='time-variant-detail'),
    # Get, update, or delete specific time variant config - AUTH REQUIRED
    
    path('time-variant/test/', TimeVariantTestView.as_view(), name='time-variant-test'),
    # Test time variant configurations - ADMIN ONLY
    
    
    # ==================== TEMPLATE MANAGEMENT ENDPOINTS ====================
    # Template CRUD operations
    path('templates/', PlanTemplateListView.as_view(), name='template-list'),
    # List all plan templates (GET) or create new template (POST) - AUTH REQUIRED
    
    path('templates/<uuid:template_id>/', PlanTemplateDetailView.as_view(), name='template-detail'),
    # Get, update, or delete specific template - AUTH REQUIRED
    
    path('templates/<uuid:template_id>/create-plan/', CreatePlanFromTemplateView.as_view(), name='create-plan-from-template'),
    # Create new internet plan from existing template - AUTH REQUIRED
    
    
    # ==================== PRICING MANAGEMENT ENDPOINTS ====================
    # Price Matrix CRUD operations
    path('pricing/matrices/', PriceMatrixListView.as_view(), name='price-matrix-list'),
    # List all price matrices (GET) or create new matrix (POST) - AUTH REQUIRED
    
    path('pricing/matrices/<uuid:price_matrix_id>/', PriceMatrixDetailView.as_view(), name='price-matrix-detail'),
    # Get, update, or delete specific price matrix - AUTH REQUIRED
    
    path('pricing/matrices/export/', PriceMatrixExportView.as_view(), name='price-matrix-export'),
    # Export price matrices - STAFF ONLY
    
    # Discount Rule CRUD operations
    path('pricing/rules/', DiscountRuleListView.as_view(), name='discount-rule-list'),
    # List all discount rules (GET) or create new rule (POST) - AUTH REQUIRED
    
    path('pricing/rules/<uuid:discount_rule_id>/', DiscountRuleDetailView.as_view(), name='discount-rule-detail'),
    # Get, update, or delete specific discount rule - AUTH REQUIRED
    
    # Price Calculation endpoints
    path('pricing/calculate/', PriceCalculationView.as_view(), name='price-calculation'),
    # Calculate price for a plan - AUTH REQUIRED
    
    path('pricing/calculate/bulk/', BulkPriceCalculationView.as_view(), name='bulk-price-calculation'),
    # Calculate prices in bulk - AUTH REQUIRED
    
    path('pricing/statistics/', PricingStatisticsView.as_view(), name='pricing-statistics'),
    # Get pricing statistics - AUTH REQUIRED
]

# API Documentation Info
api_info = {
    'name': 'Internet Plans API',
    'version': '2.0.0',
    'description': 'Core plan management system for defining internet plans, templates, pricing, and time-based availability',
    'base_path': '/api/internet_plans/',
    'authentication': 'JWT Token (via Authentication app)',
    'permissions': {
        'public': 'AllowAny (public endpoints only)',
        'authenticated': 'IsAuthenticated',
        'staff': 'IsAdminUser or user.is_staff = True',
        'admin': 'IsAdminUser'
    },
    'modules': {
        'plan_management': {
            'description': 'Internet plan definition and management',
            'endpoints': [
                {
                    'name': 'Plan Management',
                    'path': '/api/internet_plans/plans/',
                    'methods': ['GET', 'POST'],
                    'description': 'Full CRUD for internet plans with advanced filtering and time variant support',
                    'permissions': 'authenticated (GET), staff (POST)',
                    'query_params': [
                        'active', 'category', 'plan_type', 'access_method', 'search',
                        'min_price', 'max_price', 'template_id', 'sort_by', 'sort_order',
                        'time_variant', 'available_now'
                    ]
                },
                {
                    'name': 'Plan Detail',
                    'path': '/api/internet_plans/plans/{plan_id}/',
                    'methods': ['GET', 'PUT', 'DELETE'],
                    'description': 'Get, update, or delete specific plan with time variant info',
                    'permissions': 'authenticated (GET), staff (PUT, DELETE)'
                },
                {
                    'name': 'Public Plans',
                    'path': '/api/internet_plans/plans/public/',
                    'methods': ['GET'],
                    'description': 'Public endpoint for browsing active plans (for captive portal)',
                    'permissions': 'public',
                    'query_params': ['client_type', 'router_id', 'category', 'max_price']
                },
                {
                    'name': 'Available Plans',
                    'path': '/api/internet_plans/plans/available/',
                    'methods': ['GET', 'POST'],
                    'description': 'Get available plans for specific client types with time-based filtering',
                    'permissions': 'public',
                    'query_params': ['client_type', 'router_id', 'category', 'max_price', 'include_unavailable'],
                    'post_body': ['client_type', 'router_id', 'category', 'max_price', 'include_unavailable']
                },
                {
                    'name': 'Plan Availability Check',
                    'path': '/api/internet_plans/plans/availability/check/',
                    'methods': ['POST'],
                    'description': 'Check if a specific plan is available for purchase right now',
                    'permissions': 'public',
                    'required_fields': ['plan_id'],
                    'optional_fields': ['timestamp']
                },
                {
                    'name': 'Plan Statistics',
                    'path': '/api/internet_plans/plans/statistics/',
                    'methods': ['GET'],
                    'description': 'Comprehensive plan analytics and statistics including time variant usage',
                    'permissions': 'authenticated'
                },
                {
                    'name': 'Plan Compatibility Check',
                    'path': '/api/internet_plans/plans/compatibility/check/',
                    'methods': ['POST'],
                    'description': 'Check plan compatibility for access methods and routers',
                    'permissions': 'authenticated',
                    'required_fields': ['plan_id', 'access_method'],
                    'optional_fields': ['router_id', 'check_time_availability']
                },
                {
                    'name': 'Plan Recommendations',
                    'path': '/api/internet_plans/plans/recommendations/',
                    'methods': ['GET'],
                    'description': 'Get intelligent plan recommendations based on criteria including availability',
                    'permissions': 'authenticated',
                    'query_params': ['client_type', 'budget', 'access_method', 'limit']
                }
            ]
        },
        'time_variant_management': {
            'description': 'Time-based availability controls for plans',
            'endpoints': [
                {
                    'name': 'Time Variant Configurations',
                    'path': '/api/internet_plans/time-variant/',
                    'methods': ['GET', 'POST'],
                    'description': 'Manage time variant configurations for plans',
                    'permissions': 'staff',
                    'query_params': ['is_active', 'search']
                },
                {
                    'name': 'Time Variant Configuration Detail',
                    'path': '/api/internet_plans/time-variant/{config_id}/',
                    'methods': ['GET', 'PUT', 'DELETE'],
                    'description': 'Get, update, or delete specific time variant configuration',
                    'permissions': 'staff'
                },
                {
                    'name': 'Time Variant Test',
                    'path': '/api/internet_plans/time-variant/test/',
                    'methods': ['POST'],
                    'description': 'Test time variant configurations',
                    'permissions': 'admin'
                }
            ]
        },
        'template_management': {
            'description': 'Plan template system for reusable plan configurations',
            'endpoints': [
                {
                    'name': 'Template Management',
                    'path': '/api/internet_plans/templates/',
                    'methods': ['GET', 'POST'],
                    'description': 'Full CRUD for plan templates with time variant support',
                    'permissions': 'authenticated (GET), staff (POST)',
                    'query_params': [
                        'category', 'search', 'access_type', 'visibility',
                        'min_price', 'max_price', 'sort_by', 'sort_order'
                    ]
                },
                {
                    'name': 'Template Detail',
                    'path': '/api/internet_plans/templates/{template_id}/',
                    'methods': ['GET', 'PUT', 'DELETE'],
                    'description': 'Get, update, or delete specific template',
                    'permissions': 'authenticated (GET), staff (PUT, DELETE)'
                },
                {
                    'name': 'Create Plan from Template',
                    'path': '/api/internet_plans/templates/{template_id}/create-plan/',
                    'methods': ['POST'],
                    'description': 'Create new internet plan from existing template',
                    'permissions': 'authenticated',
                    'required_fields': ['plan_name'],
                    'optional_fields': ['custom_price', 'custom_description', 'enable_both_methods']
                }
            ]
        },
        'pricing_management': {
            'description': 'Advanced pricing models, discounts, and price calculations',
            'endpoints': [
                {
                    'name': 'Price Matrix Management',
                    'path': '/api/internet_plans/pricing/matrices/',
                    'methods': ['GET', 'POST'],
                    'description': 'Manage price matrices for advanced pricing (tiered, volume, etc.)',
                    'permissions': 'authenticated (GET), staff (POST)',
                    'query_params': [
                        'is_active', 'discount_type', 'applies_to', 'target_plan_id',
                        'valid_date', 'search', 'sort_by', 'sort_order'
                    ]
                },
                {
                    'name': 'Price Matrix Detail',
                    'path': '/api/internet_plans/pricing/matrices/{price_matrix_id}/',
                    'methods': ['GET', 'PUT', 'DELETE'],
                    'description': 'Get, update, or delete specific price matrix',
                    'permissions': 'authenticated (GET), staff (PUT, DELETE)'
                },
                {
                    'name': 'Price Matrix Export',
                    'path': '/api/internet_plans/pricing/matrices/export/',
                    'methods': ['GET'],
                    'description': 'Export price matrices to JSON/CSV/Excel',
                    'permissions': 'staff',
                    'query_params': ['format']
                },
                {
                    'name': 'Discount Rule Management',
                    'path': '/api/internet_plans/pricing/rules/',
                    'methods': ['GET', 'POST'],
                    'description': 'Manage business rules for applying discounts (loyalty, referral, etc.)',
                    'permissions': 'authenticated (GET), staff (POST)',
                    'query_params': ['is_active', 'rule_type', 'price_matrix_id', 'search']
                },
                {
                    'name': 'Discount Rule Detail',
                    'path': '/api/internet_plans/pricing/rules/{discount_rule_id}/',
                    'methods': ['GET', 'PUT', 'DELETE'],
                    'description': 'Get, update, or delete specific discount rule',
                    'permissions': 'authenticated (GET), staff (PUT, DELETE)'
                },
                {
                    'name': 'Price Calculation',
                    'path': '/api/internet_plans/pricing/calculate/',
                    'methods': ['POST'],
                    'description': 'Calculate final price with discounts and taxes',
                    'permissions': 'authenticated',
                    'required_fields': ['plan_id'],
                    'optional_fields': ['quantity', 'discount_code', 'client_data']
                },
                {
                    'name': 'Bulk Price Calculation',
                    'path': '/api/internet_plans/pricing/calculate/bulk/',
                    'methods': ['POST'],
                    'description': 'Calculate prices for multiple plans in batch',
                    'permissions': 'authenticated',
                    'max_batch_size': 50
                },
                {
                    'name': 'Pricing Statistics',
                    'path': '/api/internet_plans/pricing/statistics/',
                    'methods': ['GET'],
                    'description': 'Pricing analytics and discount effectiveness',
                    'permissions': 'authenticated'
                }
            ]
        }
    },
    'response_formats': {
        'success': {
            'success': True,
            'data': {},
            'message': 'Operation successful',
            'timestamp': 'ISO 8601 timestamp'
        },
        'error': {
            'success': False,
            'error': 'Error message',
            'details': 'Additional error details (in debug mode)',
            'code': 'Error code (optional)',
            'timestamp': 'ISO 8601 timestamp'
        },
        'paginated': {
            'success': True,
            'count': 'Total number of results',
            'next': 'Next page URL (if exists)',
            'previous': 'Previous page URL (if exists)',
            'results': 'Array of results',
            'page': 'Current page number',
            'total_pages': 'Total number of pages'
        }
    },
    'rate_limits': {
        'public_endpoints': '100 requests per minute per IP',
        'authenticated_endpoints': '200 requests per minute per user',
        'staff_endpoints': '500 requests per minute per user',
        'bulk_operations': '10 requests per minute per user'
    },
    'caching_strategy': {
        'public_plans': '5 minutes',
        'plan_details': '5 minutes',
        'plan_statistics': '10 minutes',
        'pricing_options': '5 minutes',
        'price_calculations': '1 minute',
        'availability_checks': '1 minute (time-sensitive)'
    },
    'dependencies': {
        'required': ['django', 'djangorestframework'],
        'recommended': ['django-redis', 'celery'],
        'integration': [
            'authentication (User authentication)',
            'service_operations (Subscription management)',
            'network_management (Network integration)',
            'payment (Payment processing)'
        ]
    },
    'important_notes': [
        'Time variant endpoints require staff permissions',
        'Public endpoints are designed for captive portal integration',
        'All plan endpoints support time-based availability filtering',
        'Pricing calculations include taxes and discounts automatically',
        'Templates can inherit time variant configurations'
    ]
}