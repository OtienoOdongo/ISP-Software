from django.urls import path
from payments.api.views.mpesa_config_view import (
    MpesaConfigView,
    InitiatePaymentView,
    StkStatusView,
    payment_callback
)

urlpatterns = [
    path('', InitiatePaymentView.as_view(), name='payment'),  
    path('callback/', payment_callback, name='payment_callback'),
    path('stk-status/', StkStatusView.as_view(), name='stk_status'),
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('mpesa-config/', MpesaConfigView.as_view(), name='mpesa_config'),
]