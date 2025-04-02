from django.urls import path
from payments.api.views.mpesa_configuration import mpesa_configuration

urlpatterns = [
    path('', mpesa_configuration.payment_view, name='payment'),
    path('callback/', mpesa_configuration.payment_callback, name='payment_callback'),
    path('stk-status/', mpesa_configuration.StkStatusView.as_view(), name='stk_status'),
    path('initiate/', mpesa_configuration.InitiatePaymentView.as_view(), name='initiate_payment'),
    path('mpesa-config/', mpesa_configuration.MpesaConfigView.as_view(), name='mpesa_config'),
]