# from django.urls import path
# from payments.api.views.mpesa_config_view import (
#     MpesaConfigView,
#     InitiatePaymentView,
#     StkStatusView,
#     payment_callback
# )

# urlpatterns = [
#     path('', InitiatePaymentView.as_view(), name='payment'),  
#     path('callback/', payment_callback, name='payment_callback'),
#     path('stk-status/', StkStatusView.as_view(), name='stk_status'),
#     path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
#     path('mpesa-config/', MpesaConfigView.as_view(), name='mpesa_config'),
# ]





from django.urls import path
from payments.api.views.mpesa_config_view import (
    PaymentConfigView,
    ConfigurationHistoryView,
    InitiatePaymentView,
    StkStatusView,
    payment_callback,
    TestConnectionView,
    paypal_callback,
    bank_callback
)

app_name = 'payments'

urlpatterns = [
    path('config/', PaymentConfigView.as_view(), name='payment_config'),
    path('config/<int:pk>/', PaymentConfigView.as_view(), name='payment_config_detail'),
    path('config/<int:pk>/test/', TestConnectionView.as_view(), name='test_connection'),
    path('history/', ConfigurationHistoryView.as_view(), name='configuration_history'),
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('stk-status/', StkStatusView.as_view(), name='stk_status'),
    path('callback/mpesa/', payment_callback, name='payment_callback'),
    path('callback/paypal/', paypal_callback, name='paypal_callback'),
    path('callback/bank/', bank_callback, name='bank_callback'),
]