

# """
# Combined URL Configuration for User Management with SMS Automation
# Production-ready with all relevant endpoints
# """
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter

# from user_management.api.views.sms_automation_view import (
#     SMSGatewayConfigViewSet,
#     SMSTemplateViewSet,
#     SMSMessageViewSet,
#     SMSAutomationRuleViewSet,
#     SMSAnalyticsView,
#     SMSDashboardView,
#     ProcessPendingMessagesView
# )

# # Initialize routers
# router = DefaultRouter()


# # SMS Automation Routes
# router.register(r'sms/gateways', SMSGatewayConfigViewSet, basename='sms-gateway')
# router.register(r'sms/templates', SMSTemplateViewSet, basename='sms-template')
# router.register(r'sms/messages', SMSMessageViewSet, basename='sms-message')
# router.register(r'sms/rules', SMSAutomationRuleViewSet, basename='sms-rule')

# urlpatterns = [
   
#     # SMS Automation - Analytics & Dashboard
#     path('sms/analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
#     path('sms/dashboard/', SMSDashboardView.as_view(), name='sms-dashboard'),
#     path('sms/process-pending/', ProcessPendingMessagesView.as_view(), name='process-pending-messages'),

# ]





"""
URL Configuration for Integrated Client Management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user_management.views.client_views import (
    ClientProfileViewSet,
    CreatePPPoEClientView,
    CreateHotspotClientView,
    DashboardView,
    CommissionDashboardView,
    ClientPlanManagementView,
    ClientPlanHistoryView,
    ClientPlanRecommendationsView,
    ClientPlanBulkActionsView
)
from user_management.views.analytics_views import (
    FinancialAnalyticsView,
    UsageAnalyticsView,
    BehavioralAnalyticsView,
    HotspotAnalyticsView,
    TrendAnalyticsView
)
from user_management.views.commissions_views import (
    CommissionTransactionViewSet,
    CommissionPayoutView,
    MarketerPerformanceView
)

# Initialize router
router = DefaultRouter()
router.register(r'clients', ClientProfileViewSet, basename='client')
router.register(r'commissions', CommissionTransactionViewSet, basename='commission')

# Client Plan Management URLs
client_plan_urls = [
    # Plan management for specific client
    path('<uuid:client_id>/plans/', ClientPlanManagementView.as_view(), name='client-plan-management'),
    path('<uuid:client_id>/plans/history/', ClientPlanHistoryView.as_view(), name='client-plan-history'),
    path('<uuid:client_id>/plans/recommendations/', ClientPlanRecommendationsView.as_view(), name='client-plan-recommendations'),
    
    # Plan actions (these are also available via ClientProfileViewSet actions)
    path('<uuid:client_id>/plans/assign/', ClientProfileViewSet.as_view({'post': 'assign_plan'}), name='client-plan-assign'),
    path('<uuid:client_id>/plans/change/', ClientProfileViewSet.as_view({'post': 'change_plan'}), name='client-plan-change'),
    path('<uuid:client_id>/plans/renew/', ClientProfileViewSet.as_view({'post': 'renew_plan'}), name='client-plan-renew'),
    path('<uuid:client_id>/plans/suspend/', ClientProfileViewSet.as_view({'post': 'suspend_plan'}), name='client-plan-suspend'),
    path('<uuid:client_id>/plans/auto-renew/', ClientProfileViewSet.as_view({'post': 'toggle_auto_renew'}), name='client-plan-auto-renew'),
    
    # Dashboard with plan info
    path('<uuid:client_id>/dashboard/', ClientProfileViewSet.as_view({'get': 'plan_dashboard'}), name='client-plan-dashboard'),
]

urlpatterns = [
    # Client Management
    path('', include(router.urls)),
    
    # Client Creation
    path('clients/pppoe/create/', CreatePPPoEClientView.as_view(), name='create-pppoe-client'),
    path('clients/hotspot/create/', CreateHotspotClientView.as_view(), name='create-hotspot-client'),
    
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('commission-dashboard/', CommissionDashboardView.as_view(), name='commission-dashboard'),
    
    # Analytics
    path('analytics/financial/', FinancialAnalyticsView.as_view(), name='financial-analytics'),
    path('analytics/usage/', UsageAnalyticsView.as_view(), name='usage-analytics'),
    path('analytics/behavioral/', BehavioralAnalyticsView.as_view(), name='behavioral-analytics'),
    path('analytics/hotspot/', HotspotAnalyticsView.as_view(), name='hotspot-analytics'),
    path('analytics/trends/', TrendAnalyticsView.as_view(), name='trend-analytics'),
    
    # Commission Management
    path('commissions/payout/', CommissionPayoutView.as_view(), name='commission-payout'),
    path('marketers/performance/', MarketerPerformanceView.as_view(), name='marketer-performance'),
    path('marketers/performance/<uuid:marketer_id>/', MarketerPerformanceView.as_view(), name='marketer-performance-detail'),
    
    # Plan Management
    path('clients/', include(client_plan_urls)),
    path('plans/bulk-actions/', ClientPlanBulkActionsView.as_view(), name='plan-bulk-actions'),
    
    # Search and Export
    path('clients/search/phone/', ClientProfileViewSet.as_view({'get': 'search_by_phone'}), name='client-search-phone'),
    path('clients/quick-stats/', ClientProfileViewSet.as_view({'get': 'quick_stats'}), name='client-quick-stats'),
    path('clients/export/', ClientProfileViewSet.as_view({'get': 'export'}), name='client-export'),
    
    # Client specific actions (via viewset)
    path('clients/<uuid:pk>/analytics/', ClientProfileViewSet.as_view({'get': 'analytics'}), name='client-analytics'),
    path('clients/<uuid:pk>/activity/', ClientProfileViewSet.as_view({'get': 'activity'}), name='client-activity'),
    path('clients/<uuid:pk>/update-metrics/', ClientProfileViewSet.as_view({'post': 'update_metrics'}), name='client-update-metrics'),
    path('clients/<uuid:pk>/resend-credentials/', ClientProfileViewSet.as_view({'post': 'resend_credentials'}), name='client-resend-credentials'),
    path('clients/<uuid:pk>/update-tier/', ClientProfileViewSet.as_view({'post': 'update_tier'}), name='client-update-tier'),
    path('clients/<uuid:pk>/send-message/', ClientProfileViewSet.as_view({'post': 'send_message'}), name='client-send-message'),
]




