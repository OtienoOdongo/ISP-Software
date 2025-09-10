



# # user_management/api/urls.py
# from django.urls import path
# from user_management.api.views.user_views import UserProfileListView, UserProfileDetailView, SendManualMessageView

# app_name = 'user_management'

# urlpatterns = [
#     path('profiles/', UserProfileListView.as_view(), name='user-profile-list'),
#     path('profiles/<int:pk>/', UserProfileDetailView.as_view(), name='user-profile-detail'),
#     path('profiles/<int:pk>/send-message/', SendManualMessageView.as_view(), name='send-message'),
# ]



from django.urls import path
from user_management.api.views.user_views import (
    ClientProfileListView,
    ClientProfileDetailView,
    SendMessageView,
    DisconnectHotspotUserView
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

app_name = 'user_management'

urlpatterns = [
    path('profiles/', ClientProfileListView.as_view(), name='client-profile-list'),
    path('profiles/<int:pk>/', ClientProfileDetailView.as_view(), name='client-profile-detail'),
    path('profiles/<int:pk>/send-message/', SendMessageView.as_view(), name='send-message'),
    path('profiles/<int:pk>/disconnect-hotspot/', DisconnectHotspotUserView.as_view(), name='disconnect-hotspot'),


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