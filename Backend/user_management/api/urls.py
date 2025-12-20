






# """
# Enhanced URL Configuration for User Management
# Leveraging network_management data without duplication
# """
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from user_management.api.views.user_views import (
#     ClientProfileListView,
#     ClientProfileDetailView,
#     SendMessageView,
#     ClientMessagesView,
#     ClientNotesView,
#     DisconnectUserView,
#     ConnectionStatsView,
#     ClientSearchView,
#     ClientAnalyticsView,
#     DebugConnectionStatsView,
#     ConnectionStatsView
# )
# from user_management.api.views.sms_automation_view import (
#     SMSTriggerListCreateView, SMSTriggerDetailView,
#     SMSAutomationSettingsView, SendTestMessageView,
#     SMSAnalyticsView, TriggerPerformanceView
# )
# from user_management.api.views.bulk_actions_view import (
#     MessageTemplateListCreateView, MessageTemplateDetailView,
#     BulkUserListView, BulkUserImportView, BulkActionView,
#     BulkActionHistoryView, DownloadTemplateView
# )



# urlpatterns = [
#     # Client profiles
#     path('profiles/', ClientProfileListView.as_view(), name='client-profiles-list'),
#     path('profiles/<int:pk>/', ClientProfileDetailView.as_view(), name='client-profile-detail'),
    
#     # Client communication
#     path('profiles/<int:pk>/send-message/', SendMessageView.as_view(), name='send-client-message'),
#     path('profiles/<int:pk>/messages/', ClientMessagesView.as_view(), name='client-messages'),
    
#     # Client notes
#     path('profiles/<int:pk>/notes/', ClientNotesView.as_view(), name='client-notes'),
    
#     # Client management actions
#     path('profiles/<int:pk>/disconnect/', DisconnectUserView.as_view(), name='disconnect-client'),
#     path('profiles/<int:pk>/analytics/', ClientAnalyticsView.as_view(), name='client-analytics'),
    
#     # Search and analytics
#     path('search/', ClientSearchView.as_view(), name='client-search'),
#     path('connection-stats/', ConnectionStatsView.as_view(), name='connection-stats'),
#     path('connection-stats-debug/', DebugConnectionStatsView.as_view(), name='connection-stats-debug'),
    
#     # SMS Automation URLs
#     path('sms-triggers/', SMSTriggerListCreateView.as_view(), name='sms-trigger-list-create'),
#     path('sms-triggers/<int:pk>/', SMSTriggerDetailView.as_view(), name='sms-trigger-detail'),
#     path('sms-settings/', SMSAutomationSettingsView.as_view(), name='sms-settings'),
#     path('sms-triggers/<int:pk>/test/', SendTestMessageView.as_view(), name='send-test-message'),
#     path('sms-analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
#     path('sms-performance/', TriggerPerformanceView.as_view(), name='trigger-performance'),

    # # Bulk Actions URLs
    # path('message-templates/', MessageTemplateListCreateView.as_view(), name='message-template-list-create'),
    # path('message-templates/<int:pk>/', MessageTemplateDetailView.as_view(), name='message-template-detail'),
    # path('bulk-users/', BulkUserListView.as_view(), name='bulk-user-list'),
    # path('bulk-import/', BulkUserImportView.as_view(), name='bulk-user-import'),
    # path('bulk-action/', BulkActionView.as_view(), name='bulk-action'),
    # path('bulk-history/', BulkActionHistoryView.as_view(), name='bulk-action-history'),
    # path('bulk-template/', DownloadTemplateView.as_view(), name='download-template'),
# ]

# # API versioning and metadata
# api_info = {
#     'name': 'User Management API',
#     'version': '1.0.0',
#     'description': 'Enhanced user management leveraging network_management data',
#     'endpoints': [
#         {
#             'name': 'Client Profiles',
#             'path': '/api/user_management/profiles/',
#             'methods': ['GET'],
#             'description': 'List and filter client profiles'
#         },
#         {
#             'name': 'Client Profile Detail',
#             'path': '/api/user_management/profiles/{id}/',
#             'methods': ['GET', 'PATCH'],
#             'description': 'Retrieve and update client profile details'
#         },
#         {
#             'name': 'Connection Statistics',
#             'path': '/api/user_management/connection-stats/',
#             'methods': ['GET'],
#             'description': 'Get connection statistics using network_management data'
#         },
#         {
#             'name': 'Client Search',
#             'path': '/api/user_management/search/',
#             'methods': ['GET'],
#             'description': 'Search clients by various criteria'
#         }
#     ]
# }

















"""
Combined URL Configuration for User Management with SMS Automation
Production-ready with all relevant endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user_management.api.views.client_views import (
    ClientProfileViewSet, 
    DashboardView,
    CreatePPPoEClientView,
    CreateHotspotClientView,
    CommissionDashboardView
)
from user_management.api.views.sms_automation_view import (
    SMSGatewayConfigViewSet,
    SMSTemplateViewSet,
    SMSMessageViewSet,
    SMSAutomationRuleViewSet,
    SMSAnalyticsView,
    SMSDashboardView,
    ProcessPendingMessagesView
)

# Initialize routers
router = DefaultRouter()

# User Management Routes
router.register(r'clients', ClientProfileViewSet, basename='client')

# SMS Automation Routes
router.register(r'sms/gateways', SMSGatewayConfigViewSet, basename='sms-gateway')
router.register(r'sms/templates', SMSTemplateViewSet, basename='sms-template')
router.register(r'sms/messages', SMSMessageViewSet, basename='sms-message')
router.register(r'sms/rules', SMSAutomationRuleViewSet, basename='sms-rule')

urlpatterns = [
    # Client Management (via router)
    path('', include(router.urls)),
    
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    
    # Client Creation
    path('clients/pppoe/create/', CreatePPPoEClientView.as_view(), name='create-pppoe-client'),
    path('clients/hotspot/create/', CreateHotspotClientView.as_view(), name='create-hotspot-client'),
    
    # Commission Management
    path('commissions/dashboard/', CommissionDashboardView.as_view(), name='commission-dashboard'),
    
    # SMS Automation - Analytics & Dashboard
    path('sms/analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
    path('sms/dashboard/', SMSDashboardView.as_view(), name='sms-dashboard'),
    path('sms/process-pending/', ProcessPendingMessagesView.as_view(), name='process-pending-messages'),
    
    # SMS Automation - Quick Actions (via router actions)
    # These are already available via SMSMessageViewSet actions
]

# API Documentation Info
api_info = {
    'name': 'User Management API with SMS Automation',
    'version': '2.0.0',
    'description': 'Complete business logic for client management, analytics, and SMS automation',
    'base_path': '/api/user-management/',
    'authentication': 'JWT Token (via Authentication app)',
    'permissions': 'IsAuthenticated',
    'modules': {
        'client_management': {
            'description': 'Client profiles, analytics, marketing, and referrals',
            'endpoints': [
                {
                    'name': 'Client Management',
                    'path': '/api/user-management/clients/',
                    'methods': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    'description': 'Full CRUD for client business profiles with advanced filtering',
                    'query_params': [
                        'connection_type', 'client_type', 'status', 'tier', 'revenue_segment',
                        'usage_pattern', 'is_marketer', 'at_risk', 'needs_attention',
                        'date_from', 'date_to', 'search', 'min_revenue', 'max_revenue',
                        'sort_by', 'sort_order'
                    ],
                    'actions': [
                        {'action': 'analytics', 'method': 'GET', 'path': '{id}/analytics/'},
                        {'action': 'update_metrics', 'method': 'POST', 'path': '{id}/update-metrics/'},
                        {'action': 'resend_credentials', 'method': 'POST', 'path': '{id}/resend-credentials/'},
                        {'action': 'update_tier', 'method': 'POST', 'path': '{id}/update-tier/'},
                        {'action': 'quick_stats', 'method': 'GET', 'path': 'quick_stats/'},
                        {'action': 'search_by_phone', 'method': 'GET', 'path': 'search_by_phone/'}
                    ]
                },
                {
                    'name': 'Create PPPoE Client',
                    'path': '/api/user-management/clients/pppoe/create/',
                    'methods': ['POST'],
                    'description': 'Create new PPPoE client with complete onboarding workflow',
                    'required_fields': ['name', 'phone_number'],
                    'optional_fields': ['referral_code', 'client_type', 'location', 'send_sms']
                },
                {
                    'name': 'Create Hotspot Client',
                    'path': '/api/user-management/clients/hotspot/create/',
                    'methods': ['POST'],
                    'description': 'Create new hotspot client',
                    'required_fields': ['phone_number']
                },
                {
                    'name': 'Dashboard Analytics',
                    'path': '/api/user-management/dashboard/',
                    'methods': ['GET'],
                    'description': 'Comprehensive business analytics dashboard',
                    'query_params': ['time_range', 'refresh'],
                    'time_range_options': ['7d', '30d', '90d', 'all']
                },
                {
                    'name': 'Commission Dashboard',
                    'path': '/api/user-management/commissions/dashboard/',
                    'methods': ['GET'],
                    'description': 'Commission tracking and marketer analytics',
                    'query_params': ['marketer_id']
                }
            ]
        },
        'sms_automation': {
            'description': 'Complete SMS sending, automation, and tracking system',
            'endpoints': [
                {
                    'name': 'SMS Gateway Management',
                    'path': '/api/user-management/sms/gateways/',
                    'methods': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    'description': 'Configure and manage SMS gateways',
                    'actions': [
                        {'action': 'test_connection', 'method': 'POST', 'path': '{id}/test-connection/'},
                        {'action': 'set_default', 'method': 'POST', 'path': '{id}/set-default/'},
                        {'action': 'status', 'method': 'GET', 'path': 'status/'}
                    ]
                },
                {
                    'name': 'SMS Templates',
                    'path': '/api/user-management/sms/templates/',
                    'methods': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    'description': 'Create and manage SMS templates',
                    'actions': [
                        {'action': 'test_render', 'method': 'POST', 'path': '{id}/test-render/'},
                        {'action': 'duplicate', 'method': 'POST', 'path': '{id}/duplicate/'}
                    ]
                },
                {
                    'name': 'SMS Messages',
                    'path': '/api/user-management/sms/messages/',
                    'methods': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    'description': 'Send and manage SMS messages',
                    'actions': [
                        {'action': 'retry', 'method': 'POST', 'path': '{id}/retry/'},
                        {'action': 'cancel', 'method': 'POST', 'path': '{id}/cancel/'},
                        {'action': 'send_test', 'method': 'POST', 'path': 'send-test/'},
                        {'action': 'bulk_send', 'method': 'POST', 'path': 'bulk-send/'},
                        {'action': 'statistics', 'method': 'GET', 'path': 'statistics/'}
                    ],
                    'query_params': [
                        'status', 'phone', 'client_id', 'date_from', 'date_to',
                        'gateway_id', 'source', 'priority', 'search', 'order_by'
                    ]
                },
                {
                    'name': 'SMS Automation Rules',
                    'path': '/api/user-management/sms/rules/',
                    'methods': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    'description': 'Create rules for automated SMS sending',
                    'actions': [
                        {'action': 'toggle_active', 'method': 'POST', 'path': '{id}/toggle-active/'},
                        {'action': 'test_trigger', 'method': 'POST', 'path': '{id}/test-trigger/'}
                    ]
                },
                {
                    'name': 'SMS Dashboard',
                    'path': '/api/user-management/sms/dashboard/',
                    'methods': ['GET'],
                    'description': 'SMS system dashboard with real-time statistics'
                },
                {
                    'name': 'SMS Analytics',
                    'path': '/api/user-management/sms/analytics/',
                    'methods': ['GET'],
                    'description': 'Comprehensive SMS analytics',
                    'query_params': ['start_date', 'end_date', 'gateway_id', 'status', 'group_by']
                },
                {
                    'name': 'Process Pending Messages',
                    'path': '/api/user-management/sms/process-pending/',
                    'methods': ['POST'],
                    'description': 'Process pending SMS messages',
                    'parameters': {'limit': 'Number of messages to process (default: 100)'}
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
            'error': 'Error message',
            'details': 'Additional error details (in debug mode)',
            'code': 'Error code'
        }
    },
    'rate_limits': {
        'default': '100 requests per minute',
        'client_creation': '10 requests per minute',
        'dashboard': '60 requests per minute',
        'sms_sending': '60 messages per minute per gateway',
        'bulk_sms': '1000 messages per day'
    }
}