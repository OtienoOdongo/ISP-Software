from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import( MpesaTransactionViewSet, MpesaConfigViewSet, 
MpesaCallbackViewSet, PaymentReconciliationViewSet)

router = DefaultRouter()
router.register(r'mpesa-transactions', MpesaTransactionViewSet)
router.register(r'mpesa-config', MpesaConfigViewSet)
router.register(r'mpesa-callbacks', MpesaCallbackViewSet)
router.register(r'payment-transactions', PaymentReconciliationViewSet)


urlpatterns = [
    path('', include(router.urls)),  
    path('mpesa-transactions/<int:pk>/update_status/', MpesaTransactionViewSet.as_view({'post': 'update_status'})),
    path('mpesa-transactions/generate_report/', MpesaTransactionViewSet.as_view({'post': 'generate_report_action'})),
    path('mpesa-config/get/', MpesaConfigViewSet.as_view({'get': 'get_config'})),
    path('payment-transactions/download-csv/', PaymentReconciliationViewSet.as_view({'get': 'download_csv'})),
    path('payment-transactions/total-earnings/', PaymentReconciliationViewSet.as_view({'get': 'total_earnings'})),

]
