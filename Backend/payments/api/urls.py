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
from payments.api.views.transaction_log_view import (
    TransactionLogView,
    TransactionLogStatsView,
    TransactionLogDetailView,
    TransactionLogExportView
)
from payments.api.views.payment_reconciliation_view import (
    PaymentReconciliationView,
    TaxConfigurationView,
    ExpenseCategoryView,
    ManualExpenseView,
    ReconciliationReportView

)
from payments.api.views.mpesa_callback_settings import (
    MpesaCallbackEventView,
    MpesaCallbackConfigurationView,
    MpesaCallbackConfigurationDetailView,
    MpesaCallbackBulkOperationsView,
    MpesaCallbackTestView,
    MpesaCallbackLogView,
    MpesaCallbackRuleView,
    MpesaCallbackSecurityProfileView,
    mpesa_callback_dispatcher,
    MpesaCallbackAnalyticsView
)
urlpatterns = [

    ## Payment configuration api endpoints
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


    ## transcation log api endpoints

    path('transactions/', TransactionLogView.as_view(), name='transaction-log-list'),
    path('transactions/stats/', TransactionLogStatsView.as_view(), name='transaction-log-stats'),
    path('transactions/<str:transaction_id>/', TransactionLogDetailView.as_view(), name='transaction-log-detail'),
    path('transactions/export/', TransactionLogExportView.as_view(), name='transaction-log-export'),

    ## payment reconciliation api endpoints

    # Main reconciliation endpoint
    path('reconciliation/', PaymentReconciliationView.as_view(), name='payment-reconciliation'),
    # Tax configuration endpoints
    path('taxes/', TaxConfigurationView.as_view(), name='tax-configuration'),
    # Expense category endpoints
    path('expense-categories/', ExpenseCategoryView.as_view(), name='expense-categories'),
    # Manual expense endpoints
    path('manual-expenses/', ManualExpenseView.as_view(), name='manual-expenses'),
    # Report generation endpoints
    path('reports/', ReconciliationReportView.as_view(), name='reconciliation-reports'),
    path('reconciliation/', PaymentReconciliationView.as_view(), name='payment-reconciliation'),
    # Tax configuration endpoints
    path('taxes/', TaxConfigurationView.as_view(), name='tax-configuration'),
    # Expense category endpoints
    path('expense-categories/', ExpenseCategoryView.as_view(), name='expense-categories'),
    # Manual expense endpoints
    path('manual-expenses/', ManualExpenseView.as_view(), name='manual-expenses'),
    # Report generation endpoints
    path('reports/', ReconciliationReportView.as_view(), name='reconciliation-reports'),


    ## mpesa callback settings

      # Event management
    path('events/', MpesaCallbackEventView.as_view(), name='mpesa-callback-events'),
    
    # Configuration management
    path('configurations/', MpesaCallbackConfigurationView.as_view(), name='mpesa-callback-configurations'),
    path('configurations/<uuid:pk>/', MpesaCallbackConfigurationDetailView.as_view(), name='mpesa-callback-configuration-detail'),
    path('configurations/bulk/', MpesaCallbackBulkOperationsView.as_view(), name='mpesa-callback-bulk'),
    
    # Testing and validation
    path('test/', MpesaCallbackTestView.as_view(), name='mpesa-callback-test'),
    
    # Logs and monitoring
    path('logs/', MpesaCallbackLogView.as_view(), name='mpesa-callback-logs'),
    path('analytics/', MpesaCallbackAnalyticsView.as_view(), name='mpesa-callback-analytics'),
    
    # Rules and routing
    path('rules/', MpesaCallbackRuleView.as_view(), name='mpesa-callback-rules'),
    
    # Security profiles
    path('security-profiles/', MpesaCallbackSecurityProfileView.as_view(), name='mpesa-callback-security-profiles'),
    
    # Callback dispatcher (no authentication)
    path('dispatch/<uuid:router_id>/', mpesa_callback_dispatcher, name='mpesa-callback-dispatcher'),
]