"""
SMS Automation URLs - Production Ready
Fully integrated with User Management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from sms_automation.api.views.sms_automation_views import (
    SMSGatewayConfigViewSet, SMSTemplateViewSet,
    SMSMessageViewSet, SMSAutomationRuleViewSet,
    SMSDeliveryLogViewSet, SMSQueueViewSet,
    SMSAnalyticsView, SMSDashboardView,
    ProcessScheduledMessagesView, ProcessRetryMessagesView,
    SMSWebhookView, UpdateMessageStatusView,
    SendPPPoECredentialsView
)

# Initialize router
router = DefaultRouter()

# SMS Gateway Routes
router.register(r'gateways', SMSGatewayConfigViewSet, basename='sms-gateway')

# SMS Template Routes
router.register(r'templates', SMSTemplateViewSet, basename='sms-template')

# SMS Message Routes
router.register(r'messages', SMSMessageViewSet, basename='sms-message')

# SMS Automation Rules Routes
router.register(r'rules', SMSAutomationRuleViewSet, basename='sms-rule')

# SMS Delivery Logs Routes
router.register(r'delivery-logs', SMSDeliveryLogViewSet, basename='sms-delivery-log')

# SMS Queue Routes
router.register(r'queue', SMSQueueViewSet, basename='sms-queue')

# URL Patterns
urlpatterns = [
    
    
    # Analytics & Dashboard
    path('api/sms/analytics/', SMSAnalyticsView.as_view(), name='sms-analytics'),
    path('api/sms/dashboard/', SMSDashboardView.as_view(), name='sms-dashboard'),
    
    # Processing endpoints
    path('api/sms/process-scheduled/', ProcessScheduledMessagesView.as_view(), name='process-scheduled-messages'),
    path('api/sms/process-retry/', ProcessRetryMessagesView.as_view(), name='process-retry-messages'),
    
    # Webhook endpoints
    path('api/sms/webhook/<str:gateway_type>/', SMSWebhookView.as_view(), name='sms-webhook'),
    path('api/sms/webhook/', SMSWebhookView.as_view(), name='sms-webhook-generic'),
    
    # Message status updates
    path('api/sms/messages/<uuid:message_id>/status/', UpdateMessageStatusView.as_view(), name='update-message-status'),
    
    # Specialized sending
    path('api/sms/send-pppoe-credentials/', SendPPPoECredentialsView.as_view(), name='send-pppoe-credentials'),
    
    # Health check
    path('api/sms/health/', SMSDashboardView.as_view(), name='sms-health'),
]

