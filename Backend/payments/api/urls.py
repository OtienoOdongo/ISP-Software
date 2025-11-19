



# from django.urls import path
# from payments.api.views.payment_config_view import (
#     PaymentGatewayView,
#     MpesaConfigView,
#     PayPalConfigView,
#     BankConfigView,
#     AvailablePaymentMethodsView,
#     ClientPaymentMethodsView,
#     InitiatePaymentView,
#     TransactionStatusView,
#     LinkSubscriptionView,
#     PaymentAnalyticsView,
#     PaymentVerificationView,
#     SubscriptionCallbackView,
#     MpesaCallbackView,
#     PayPalCallbackView,
#     TestConnectionView,
#     ConfigurationHistoryView,
#     WebhookLogsView,
# )
# from payments.api.views.transaction_log_view import (
#     TransactionLogView,
#     TransactionLogStatsView,
#     TransactionLogDetailView,
# )
# from payments.api.views.payment_reconciliation_view import (
#     PaymentReconciliationView,
#     TaxConfigurationView,
#     ExpenseCategoryView,
#     ManualExpenseView,
#     ReconciliationReportView,
# )

# urlpatterns = [
#     # Payment Gateway Configuration
#     path('gateways/', PaymentGatewayView.as_view(), name='payment_gateways'),
#     path('gateways/<uuid:gateway_id>/', PaymentGatewayView.as_view(), name='payment_gateway_detail'),
    
#     # Gateway-specific configuration endpoints
#     path('gateways/<uuid:gateway_id>/mpesa/', MpesaConfigView.as_view(), name='mpesa_config'),
#     path('gateways/<uuid:gateway_id>/paypal/', PayPalConfigView.as_view(), name='paypal_config'),
#     path('gateways/<uuid:gateway_id>/bank/', BankConfigView.as_view(), name='bank_config'),
    
#     # Payment Methods
#     path('available-methods/', AvailablePaymentMethodsView.as_view(), name='available_payment_methods'),
#     path('client-methods/', ClientPaymentMethodsView.as_view(), name='client_payment_methods'),
    
#     # Payment Processing
#     path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
#     path('transaction-status/<str:reference>/', TransactionStatusView.as_view(), name='transaction_status'),
#     path('transactions/<uuid:transaction_id>/link-subscription/', LinkSubscriptionView.as_view(), name='link_subscription'),
    
#     # Analytics
#     path('analytics/revenue/', PaymentAnalyticsView.as_view(), name='payment_analytics_revenue'),
#     path('analytics/success-rate/', PaymentAnalyticsView.as_view(), name='payment_analytics_success_rate'),
    
#     # Verification
#     path('verify/', PaymentVerificationView.as_view(), name='payment_verification'),
    
#     # Callbacks
#     path('callback/subscription/', SubscriptionCallbackView.as_view(), name='subscription_callback'),
#     path('callback/mpesa/', MpesaCallbackView.as_view(), name='mpesa_callback'),
#     path('callback/paypal/', PayPalCallbackView.as_view(), name='paypal_callback'),
    
#     # Testing and Monitoring
#     path('gateways/<uuid:gateway_id>/test-connection/', TestConnectionView.as_view(), name='test_connection'),
#     path('configuration-history/', ConfigurationHistoryView.as_view(), name='configuration_history'),
#     path('webhook-logs/', WebhookLogsView.as_view(), name='webhook_logs'),
    
#     # Transaction Logs
#     path('transactions/', TransactionLogView.as_view(), name='transaction-log-list'),
#     path('transactions/stats/', TransactionLogStatsView.as_view(), name='transaction-log-stats'),
#     path('transactions/<str:transaction_id>/', TransactionLogDetailView.as_view(), name='transaction-log-detail'),
    
#     # Payment Reconciliation
#     path('reconciliation/', PaymentReconciliationView.as_view(), name='payment-reconciliation'),
#     path('taxes/', TaxConfigurationView.as_view(), name='tax-configuration'),
#     path('expense-categories/', ExpenseCategoryView.as_view(), name='expense-categories'),
#     path('manual-expenses/', ManualExpenseView.as_view(), name='manual-expenses'),
#     path('reports/', ReconciliationReportView.as_view(), name='reconciliation-reports'),
# ]





# from django.urls import path
# from payments.api.views.payment_config_view import (
#     PaymentGatewayView,
#     MpesaConfigView,
#     PayPalConfigView,
#     BankConfigView,
#     AvailablePaymentMethodsView,
#     ClientPaymentMethodsView,
#     InitiatePaymentView,
#     TransactionStatusView,
#     LinkSubscriptionView,
#     PaymentAnalyticsView,
#     PaymentVerificationView,
#     SubscriptionCallbackView,
#     MpesaCallbackView,
#     PayPalCallbackView,
#     TestConnectionView,
#     ConfigurationHistoryView,
#     WebhookLogsView,
# )
# from payments.api.views.transaction_log_view import (
#     TransactionLogView,
#     TransactionLogStatsView,
#     TransactionLogDetailView,
#     AccessTypeComparisonView,
# )
# from payments.api.views.payment_reconciliation_view import (
#     PaymentReconciliationView,
#     TaxConfigurationView,
#     ExpenseCategoryView,
#     ManualExpenseView,
#     ReconciliationReportView,
# )

# urlpatterns = [
#     # Payment Gateway Configuration
#     path('gateways/', PaymentGatewayView.as_view(), name='payment_gateways'),
#     path('gateways/<uuid:gateway_id>/', PaymentGatewayView.as_view(), name='payment_gateway_detail'),
    
#     # Gateway-specific configuration endpoints
#     path('gateways/<uuid:gateway_id>/mpesa/', MpesaConfigView.as_view(), name='mpesa_config'),
#     path('gateways/<uuid:gateway_id>/paypal/', PayPalConfigView.as_view(), name='paypal_config'),
#     path('gateways/<uuid:gateway_id>/bank/', BankConfigView.as_view(), name='bank_config'),
    
#     # Payment Methods
#     path('available-methods/', AvailablePaymentMethodsView.as_view(), name='available_payment_methods'),
#     path('client-methods/', ClientPaymentMethodsView.as_view(), name='client_payment_methods'),
    
#     # Payment Processing
#     path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
#     path('transaction-status/<str:reference>/', TransactionStatusView.as_view(), name='transaction_status'),
#     path('transactions/<uuid:transaction_id>/link-subscription/', LinkSubscriptionView.as_view(), name='link_subscription'),
    
#     # Analytics
#     path('analytics/revenue/', PaymentAnalyticsView.as_view(), name='payment_analytics_revenue'),
#     path('analytics/success-rate/', PaymentAnalyticsView.as_view(), name='payment_analytics_success_rate'),
    
#     # Verification
#     path('verify/', PaymentVerificationView.as_view(), name='payment_verification'),
    
#     # Callbacks
#     path('callback/subscription/', SubscriptionCallbackView.as_view(), name='subscription_callback'),
#     path('callback/mpesa/', MpesaCallbackView.as_view(), name='mpesa_callback'),
#     path('callback/paypal/', PayPalCallbackView.as_view(), name='paypal_callback'),
    
#     # Testing and Monitoring
#     path('gateways/<uuid:gateway_id>/test-connection/', TestConnectionView.as_view(), name='test_connection'),
#     path('configuration-history/', ConfigurationHistoryView.as_view(), name='configuration_history'),
#     path('webhook-logs/', WebhookLogsView.as_view(), name='webhook_logs'),
    
#     # Transaction Logs - Enhanced with PPPoE/Hotspot support
#     path('transactions/', TransactionLogView.as_view(), name='transaction-log-list'),
#     path('transactions/stats/', TransactionLogStatsView.as_view(), name='transaction-log-stats'),
#     path('transactions/<str:transaction_id>/', TransactionLogDetailView.as_view(), name='transaction-log-detail'),
#     path('transactions/analytics/access-type-comparison/', AccessTypeComparisonView.as_view(), name='access-type-comparison'),
    
#     # Payment Reconciliation
#     path('reconciliation/', PaymentReconciliationView.as_view(), name='payment-reconciliation'),
#     path('taxes/', TaxConfigurationView.as_view(), name='tax-configuration'),
#     path('expense-categories/', ExpenseCategoryView.as_view(), name='expense-categories'),
#     path('manual-expenses/', ManualExpenseView.as_view(), name='manual-expenses'),
#     path('reports/', ReconciliationReportView.as_view(), name='reconciliation-reports'),
# ]









from django.urls import path
from payments.api.views.payment_config_view import (
    PaymentGatewayView,
    MpesaConfigView,
    PayPalConfigView,
    BankConfigView,
    AvailablePaymentMethodsView,
    ClientPaymentMethodsView,
    InitiatePaymentView,
    TransactionStatusView,
    LinkSubscriptionView,
    PaymentAnalyticsView,
    PaymentVerificationView,
    SubscriptionCallbackView,
    MpesaCallbackView,
    PayPalCallbackView,
    TestConnectionView,
    ConfigurationHistoryView,
    WebhookLogsView,
)
from payments.api.views.transaction_log_view import (
    TransactionLogView,
    TransactionLogStatsView,
    TransactionLogDetailView,
    AccessTypeComparisonView,
)
from payments.api.views.payment_reconciliation_view import (
    PaymentReconciliationView,
    TaxConfigurationView,
    ExpenseCategoryView,
    ManualExpenseView,
    ReconciliationReportView,
    AccessTypeAnalyticsView,
)

urlpatterns = [
    # Payment Gateway Configuration
    path('gateways/', PaymentGatewayView.as_view(), name='payment_gateways'),
    path('gateways/<uuid:gateway_id>/', PaymentGatewayView.as_view(), name='payment_gateway_detail'),
    
    # Gateway-specific configuration endpoints
    path('gateways/<uuid:gateway_id>/mpesa/', MpesaConfigView.as_view(), name='mpesa_config'),
    path('gateways/<uuid:gateway_id>/paypal/', PayPalConfigView.as_view(), name='paypal_config'),
    path('gateways/<uuid:gateway_id>/bank/', BankConfigView.as_view(), name='bank_config'),
    
    # Payment Methods
    path('available-methods/', AvailablePaymentMethodsView.as_view(), name='available_payment_methods'),
    path('client-methods/', ClientPaymentMethodsView.as_view(), name='client_payment_methods'),
    
    # Payment Processing
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('transaction-status/<str:reference>/', TransactionStatusView.as_view(), name='transaction_status'),
    path('transactions/<uuid:transaction_id>/link-subscription/', LinkSubscriptionView.as_view(), name='link_subscription'),
    
    # Analytics
    path('analytics/revenue/', PaymentAnalyticsView.as_view(), name='payment_analytics_revenue'),
    path('analytics/success-rate/', PaymentAnalyticsView.as_view(), name='payment_analytics_success_rate'),
    
    # Verification
    path('verify/', PaymentVerificationView.as_view(), name='payment_verification'),
    
    # Callbacks
    path('callback/subscription/', SubscriptionCallbackView.as_view(), name='subscription_callback'),
    path('callback/mpesa/', MpesaCallbackView.as_view(), name='mpesa_callback'),
    path('callback/paypal/', PayPalCallbackView.as_view(), name='paypal_callback'),
    
    # Testing and Monitoring
    path('gateways/<uuid:gateway_id>/test-connection/', TestConnectionView.as_view(), name='test_connection'),
    path('configuration-history/', ConfigurationHistoryView.as_view(), name='configuration_history'),
    path('webhook-logs/', WebhookLogsView.as_view(), name='webhook_logs'),
    
    # Transaction Logs - Enhanced with PPPoE/Hotspot support
    path('transactions/', TransactionLogView.as_view(), name='transaction-log-list'),
    path('transactions/stats/', TransactionLogStatsView.as_view(), name='transaction-log-stats'),
    path('transactions/<str:transaction_id>/', TransactionLogDetailView.as_view(), name='transaction-log-detail'),
    path('transactions/analytics/access-type-comparison/', AccessTypeComparisonView.as_view(), name='access-type-comparison'),
    
    # Enhanced Payment Reconciliation with PPPoE/Hotspot support
    path('reconciliation/', PaymentReconciliationView.as_view(), name='payment-reconciliation'),
    path('reconciliation/analytics/access-type/', AccessTypeAnalyticsView.as_view(), name='access-type-analytics'),
    path('taxes/', TaxConfigurationView.as_view(), name='tax-configuration'),
    path('expense-categories/', ExpenseCategoryView.as_view(), name='expense-categories'),
    path('manual-expenses/', ManualExpenseView.as_view(), name='manual-expenses'),
    path('reports/', ReconciliationReportView.as_view(), name='reconciliation-reports'),
]