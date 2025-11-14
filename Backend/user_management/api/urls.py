


# from django.urls import path
# from user_management.api.views.user_views import (
#     ClientProfileListView,
#     ClientProfileDetailView,
#     SendMessageView,
#     DisconnectUserView,
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

# app_name = 'user_management'

# urlpatterns = [
#     path('profiles/', ClientProfileListView.as_view(), name='client-profile-list'),
#     path('profiles/<int:pk>/', ClientProfileDetailView.as_view(), name='client-profile-detail'),
#     path('profiles/<int:pk>/send-message/', SendMessageView.as_view(), name='send-message'),
#     path('profiles/<int:pk>/disconnect/', DisconnectUserView.as_view(), name='disconnect-user'),
#     path('connection-stats/', ConnectionStatsView.as_view(), name='connection-stats'),


#     # SMS Automation URLs
#     path('sms-triggers/', SMSTriggerListCreateView.as_view(), name='sms-trigger-list-create'),
#     path('sms-triggers/<int:pk>/', SMSTriggerDetailView.as_view(), name='sms-trigger-detail'),
#     path('sms-settings/', SMSAutomationSettingsView.as_view(), name='sms-settings'),
#     path('sms-triggers/<int:pk>/test/', SendTestMessageView.as_view(), name='send-test-message'),
#     path('sms-analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
#     path('sms-performance/', TriggerPerformanceView.as_view(), name='trigger-performance'),

#     # Bulk Actions URLs
#     path('message-templates/', MessageTemplateListCreateView.as_view(), name='message-template-list-create'),
#     path('message-templates/<int:pk>/', MessageTemplateDetailView.as_view(), name='message-template-detail'),
#     path('bulk-users/', BulkUserListView.as_view(), name='bulk-user-list'),
#     path('bulk-import/', BulkUserImportView.as_view(), name='bulk-user-import'),
#     path('bulk-action/', BulkActionView.as_view(), name='bulk-action'),
#     path('bulk-history/', BulkActionHistoryView.as_view(), name='bulk-action-history'),
#     path('bulk-template/', DownloadTemplateView.as_view(), name='download-template'),
# ]










# """
# Enhanced URL Configuration for User Management
# Leveraging network_management data without duplication
# """
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views.user_views import (
#     ClientProfileListView,
#     ClientProfileDetailView,
#     SendMessageView,
#     ClientMessagesView,
#     ClientNotesView,
#     DisconnectUserView,
#     ConnectionStatsView,
#     ClientSearchView,
#     ClientAnalyticsView,
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



    
#     # SMS Automation URLs
#     path('sms-triggers/', SMSTriggerListCreateView.as_view(), name='sms-trigger-list-create'),
#     path('sms-triggers/<int:pk>/', SMSTriggerDetailView.as_view(), name='sms-trigger-detail'),
#     path('sms-settings/', SMSAutomationSettingsView.as_view(), name='sms-settings'),
#     path('sms-triggers/<int:pk>/test/', SendTestMessageView.as_view(), name='send-test-message'),
#     path('sms-analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
#     path('sms-performance/', TriggerPerformanceView.as_view(), name='trigger-performance'),

#     # Bulk Actions URLs
#     path('message-templates/', MessageTemplateListCreateView.as_view(), name='message-template-list-create'),
#     path('message-templates/<int:pk>/', MessageTemplateDetailView.as_view(), name='message-template-detail'),
#     path('bulk-users/', BulkUserListView.as_view(), name='bulk-user-list'),
#     path('bulk-import/', BulkUserImportView.as_view(), name='bulk-user-import'),
#     path('bulk-action/', BulkActionView.as_view(), name='bulk-action'),
#     path('bulk-history/', BulkActionHistoryView.as_view(), name='bulk-action-history'),
#     path('bulk-template/', DownloadTemplateView.as_view(), name='download-template'),
    
 
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
Enhanced URL Configuration for User Management
Leveraging network_management data without duplication
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from user_management.api.views.user_views import (
    ClientProfileListView,
    ClientProfileDetailView,
    SendMessageView,
    ClientMessagesView,
    ClientNotesView,
    DisconnectUserView,
    ConnectionStatsView,
    ClientSearchView,
    ClientAnalyticsView,
    DebugConnectionStatsView,
    ConnectionStatsView
)
from user_management.api.views.sms_automation_view import (
    SMSTriggerListCreateView, SMSTriggerDetailView,
    SMSAutomationSettingsView, SendTestMessageView,
    SMSAnalyticsView, TriggerPerformanceView
)
from user_management.api.views.bulk_actions_view import (
    MessageTemplateListCreateView, MessageTemplateDetailView,
    BulkUserListView, BulkUserImportView, BulkActionView,
    BulkActionHistoryView, DownloadTemplateView
)



urlpatterns = [
    # Client profiles
    path('profiles/', ClientProfileListView.as_view(), name='client-profiles-list'),
    path('profiles/<int:pk>/', ClientProfileDetailView.as_view(), name='client-profile-detail'),
    
    # Client communication
    path('profiles/<int:pk>/send-message/', SendMessageView.as_view(), name='send-client-message'),
    path('profiles/<int:pk>/messages/', ClientMessagesView.as_view(), name='client-messages'),
    
    # Client notes
    path('profiles/<int:pk>/notes/', ClientNotesView.as_view(), name='client-notes'),
    
    # Client management actions
    path('profiles/<int:pk>/disconnect/', DisconnectUserView.as_view(), name='disconnect-client'),
    path('profiles/<int:pk>/analytics/', ClientAnalyticsView.as_view(), name='client-analytics'),
    
    # Search and analytics
    path('search/', ClientSearchView.as_view(), name='client-search'),
    path('connection-stats/', ConnectionStatsView.as_view(), name='connection-stats'),
    path('connection-stats-debug/', DebugConnectionStatsView.as_view(), name='connection-stats-debug'),
    
    # SMS Automation URLs
    path('sms-triggers/', SMSTriggerListCreateView.as_view(), name='sms-trigger-list-create'),
    path('sms-triggers/<int:pk>/', SMSTriggerDetailView.as_view(), name='sms-trigger-detail'),
    path('sms-settings/', SMSAutomationSettingsView.as_view(), name='sms-settings'),
    path('sms-triggers/<int:pk>/test/', SendTestMessageView.as_view(), name='send-test-message'),
    path('sms-analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
    path('sms-performance/', TriggerPerformanceView.as_view(), name='trigger-performance'),

    # Bulk Actions URLs
    path('message-templates/', MessageTemplateListCreateView.as_view(), name='message-template-list-create'),
    path('message-templates/<int:pk>/', MessageTemplateDetailView.as_view(), name='message-template-detail'),
    path('bulk-users/', BulkUserListView.as_view(), name='bulk-user-list'),
    path('bulk-import/', BulkUserImportView.as_view(), name='bulk-user-import'),
    path('bulk-action/', BulkActionView.as_view(), name='bulk-action'),
    path('bulk-history/', BulkActionHistoryView.as_view(), name='bulk-action-history'),
    path('bulk-template/', DownloadTemplateView.as_view(), name='download-template'),
]

# API versioning and metadata
api_info = {
    'name': 'User Management API',
    'version': '1.0.0',
    'description': 'Enhanced user management leveraging network_management data',
    'endpoints': [
        {
            'name': 'Client Profiles',
            'path': '/api/user_management/profiles/',
            'methods': ['GET'],
            'description': 'List and filter client profiles'
        },
        {
            'name': 'Client Profile Detail',
            'path': '/api/user_management/profiles/{id}/',
            'methods': ['GET', 'PATCH'],
            'description': 'Retrieve and update client profile details'
        },
        {
            'name': 'Connection Statistics',
            'path': '/api/user_management/connection-stats/',
            'methods': ['GET'],
            'description': 'Get connection statistics using network_management data'
        },
        {
            'name': 'Client Search',
            'path': '/api/user_management/search/',
            'methods': ['GET'],
            'description': 'Search clients by various criteria'
        }
    ]
}