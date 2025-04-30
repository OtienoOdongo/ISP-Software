from django.urls import path
from user_management.api.views.user_views import UserProfileListView, UserProfileDetailView
from user_management.api.views.plan_views import (
    PlanAnalyticsDashboardView,
    SMSServiceView,
    SMSHistoryView,
    DataUsageThresholdView,
    ExportReportView,
    UpdatePaymentStatusView,
    MarkNotificationReadView
)

app_name = 'user_management'

urlpatterns = [
    path('profiles/', UserProfileListView.as_view(), name='user-profile-list'),
    path('profiles/<int:pk>/', UserProfileDetailView.as_view(), name='user-profile-detail'),
    path('dashboard/', PlanAnalyticsDashboardView.as_view(), name='plan-analytics-dashboard'),
    path('send-sms/', SMSServiceView.as_view(), name='send-sms'),
    path('sms-history/', SMSHistoryView.as_view(), name='sms-history'),
    path('thresholds/', DataUsageThresholdView.as_view(), name='data-usage-thresholds'),
    path('thresholds/<int:pk>/', DataUsageThresholdView.as_view(), name='data-usage-threshold-detail'),
    path('export-report/', ExportReportView.as_view(), name='export-report'),
    path('update-payment-status/<int:client_id>/', UpdatePaymentStatusView.as_view(), name='update-payment-status'),
    path('mark-notification-read/<int:notification_id>/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]