# # payments/api/urls.py
# from django.urls import path
# from payments.api.views.payment_config_view import (
#     PaymentGatewayView,
#     TestConnectionView,
#     ClientPaymentMethodsView,
#     InitiatePaymentView,
#     TransactionStatusView,
#     ConfigurationHistoryView,
#     mpesa_callback,
#     paypal_callback,
#     bank_callback
# )

# urlpatterns = [
#     # Payment Gateway Configuration Endpoints
#     path('gateways/', PaymentGatewayView.as_view(), name='payment-gateways-list'),
#     path('gateways/<uuid:gateway_id>/', PaymentGatewayView.as_view(), name='payment-gateway-detail'),
    
#     # Connection Testing
#     path('gateways/<uuid:gateway_id>/test/', TestConnectionView.as_view(), name='test-connection'),
    
#     # Client Payment Methods
#     path('client-methods/', ClientPaymentMethodsView.as_view(), name='client-payment-methods'),
#     path('client-methods/<uuid:gateway_id>/', ClientPaymentMethodsView.as_view(), name='client-payment-method-detail'),
    
#     # Payment Processing
#     path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
#     path('transactions/<str:reference>/', TransactionStatusView.as_view(), name='transaction-status'),
    
#     # Configuration History
#     path('history/', ConfigurationHistoryView.as_view(), name='configuration-history'),
    
#     # Payment Callbacks (CSRF exempt)
#     path('callback/mpesa/', mpesa_callback, name='mpesa-callback'),
#     path('callback/paypal/', paypal_callback, name='paypal-callback'),
#     path('callback/bank/', bank_callback, name='bank-callback'),
# ]




from django.urls import path
from payments.api.views.payment_config_view import (
    PaymentGatewayView,
    WebhookConfigurationView,
    TestConnectionView,
    ClientPaymentMethodsView,
    InitiatePaymentView,
    TransactionStatusView,
    ConfigurationHistoryView,
    mpesa_callback,
    paypal_callback,
    bank_callback
)

urlpatterns = [
    # Payment Gateway Configuration Endpoints
    path('gateways/', PaymentGatewayView.as_view(), name='payment-gateways-list'),
    path('gateways/<uuid:gateway_id>/', PaymentGatewayView.as_view(), name='payment-gateway-detail'),
    
    # Webhook Configuration
    path('webhooks/generate/', WebhookConfigurationView.as_view(), name='generate-webhook'),
    
    # Connection Testing
    path('gateways/<uuid:gateway_id>/test/', TestConnectionView.as_view(), name='test-connection'),
    
    # Client Payment Methods
    path('client-methods/', ClientPaymentMethodsView.as_view(), name='client-payment-methods'),
    path('client-methods/<uuid:gateway_id>/', ClientPaymentMethodsView.as_view(), name='client-payment-method-detail'),
    
    # Payment Processing
    path('initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('transactions/<str:reference>/', TransactionStatusView.as_view(), name='transaction-status'),
    
    # Configuration History
    path('history/', ConfigurationHistoryView.as_view(), name='configuration-history'),
    
    # Payment Callbacks (CSRF exempt)
    path('callback/mpesa/', mpesa_callback, name='mpesa-callback'),
    path('callback/paypal/', paypal_callback, name='paypal-callback'),
    path('callback/bank/', bank_callback, name='bank-callback'),
]