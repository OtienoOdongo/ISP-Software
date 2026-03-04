




"""
Internet Plans - URL Configuration (UPDATED VERSION)
Production-ready URL routing with comprehensive API endpoints
FIXED: Updated URL patterns to match existing view classes
"""

from django.urls import path
from internet_plans.api.views.plan_views import (
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
from internet_plans.api.views.template_views import (
    PlanTemplateListView,
    PlanTemplateDetailView,
    PlanTemplateCreateView,
    PlanTemplateUpdateView,
    PlanTemplateDeleteView,
    CreatePlanFromTemplateView
)
from internet_plans.api.views.pricing_views import (
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
    
    path('templates/create/', PlanTemplateCreateView.as_view(), name='template-create'),
    # Create template with minimal parameters - AUTH REQUIRED
    
    path('templates/<uuid:template_id>/update/', PlanTemplateUpdateView.as_view(), name='template-update'),
    # Update specific template fields - AUTH REQUIRED
    
    path('templates/<uuid:template_id>/delete/', PlanTemplateDeleteView.as_view(), name='template-delete'),
    # Hard delete template (super admin only) - ADMIN ONLY
    
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