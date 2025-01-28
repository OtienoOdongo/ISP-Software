from django.contrib import admin
from payments.models.mpesa_callback_settings import MpesaCallback
from payments.models.mpesa_configuration import MpesaConfig
from payments.models.mpesa_transaction_log import MpesaTransaction
from payments.models.payment_reconciliation import PaymentTransaction

admin.site.register(MpesaCallback)
admin.site.register(MpesaConfig)
admin.site.register(MpesaTransaction)
admin.site.register(PaymentTransaction)