



from django.urls import path
from payments.api.views.payment_config_view import (
    PaymentGatewayView,
    WebhookConfigurationView,
    TestConnectionView,
    ClientPaymentMethodsView,
    InitiatePaymentView,
    TransactionStatusView,
    ConfigurationHistoryView,
    MpesaCallbackEventView,
    MpesaCallbackConfigurationView,
    MpesaCallbackConfigurationDetailView,
    MpesaCallbackBulkOperationsView,
    MpesaCallbackTestView,
    MpesaCallbackLogView,
    MpesaCallbackRuleView,
    MpesaCallbackSecurityProfileView,
    MpesaCallbackDispatcherView,
    MpesaCallbackAnalyticsView,
    PayPalCallbackView,
    BankCallbackView,
    mpesa_callback,
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

urlpatterns = [

    
    # Payment Gateway Configuration Endpoints


    path('gateways/', PaymentGatewayView.as_view(), name='payment_gateways'),
    path('gateways/<uuid:gateway_id>/', PaymentGatewayView.as_view(), name='payment_gateway_detail'),

    # Webhook Configuration
    path('webhooks/', WebhookConfigurationView.as_view(), name='webhook_configuration'),

    # Test Connection
    path('test-connection/<uuid:gateway_id>/', TestConnectionView.as_view(), name='test_connection'),

    # Client Payment Methods
    path('client-methods/', ClientPaymentMethodsView.as_view(), name='client_payment_methods'),
    path('client-methods/<uuid:gateway_id>/', ClientPaymentMethodsView.as_view(), name='client_payment_method_detail'),

    # Initiate Payment
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),

    # Transaction Status
    path('transaction-status/<str:reference>/', TransactionStatusView.as_view(), name='transaction_status'),

    # Configuration History
    path('history/', ConfigurationHistoryView.as_view(), name='configuration_history'),

    # M-Pesa Callback Events
    path('mpesa-callbacks/events/', MpesaCallbackEventView.as_view(), name='mpesa_callback_events'),

    # M-Pesa Callback Configurations
    path('mpesa-callbacks/configurations/', MpesaCallbackConfigurationView.as_view(), name='mpesa_callback_configurations'),
    path('mpesa-callbacks/configurations/<uuid:pk>/', MpesaCallbackConfigurationDetailView.as_view(), name='mpesa_callback_configuration_detail'),

    # M-Pesa Callback Bulk Operations
    path('mpesa-callbacks/bulk/', MpesaCallbackBulkOperationsView.as_view(), name='mpesa_callback_bulk'),

    # M-Pesa Callback Test
    path('mpesa-callbacks/test/', MpesaCallbackTestView.as_view(), name='mpesa_callback_test'),

    # M-Pesa Callback Logs
    path('mpesa-callbacks/logs/', MpesaCallbackLogView.as_view(), name='mpesa_callback_logs'),

    # M-Pesa Callback Rules
    path('mpesa-callbacks/rules/', MpesaCallbackRuleView.as_view(), name='mpesa_callback_rules'),

    # M-Pesa Callback Security Profiles
    path('mpesa-callbacks/security-profiles/', MpesaCallbackSecurityProfileView.as_view(), name='mpesa_callback_security_profiles'),

    # M-Pesa Callback Dispatcher
    path('mpesa-callbacks/dispatch/<uuid:router_id>/', MpesaCallbackDispatcherView.as_view(), name='mpesa_callback_dispatcher'),

    # M-Pesa Callback Analytics
    path('mpesa-callbacks/analytics/', MpesaCallbackAnalyticsView.as_view(), name='mpesa_callback_analytics'),

    # PayPal Callback
    path('callback/paypal/', PayPalCallbackView.as_view(), name='paypal_callback'),

    # Bank Callback
    path('callback/bank/', BankCallbackView.as_view(), name='bank_callback'),

    # Legacy M-Pesa Callback
    path('callback/mpesa/', mpesa_callback, name='mpesa_callback'),
    


    # transcation log api endpoints

    path('transactions/', TransactionLogView.as_view(), name='transaction-log-list'),
    path('transactions/stats/', TransactionLogStatsView.as_view(), name='transaction-log-stats'),
    path('transactions/<str:transaction_id>/', TransactionLogDetailView.as_view(), name='transaction-log-detail'),
    path('transactions/export/', TransactionLogExportView.as_view(), name='transaction-log-export'),


    # payment reconciliation api endpoints

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


    
]








