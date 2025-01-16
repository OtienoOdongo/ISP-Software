from django.urls import path
from . import views

app_name = "payment_processing"

urlpatterns = [
    path("transactions/", views.TransactionListCreateView.as_view(), name="transaction-list-create"),
    path("transactions/<int:pk>/", views.TransactionRetrieveUpdateDestroyView.as_view(), name="transaction-detail"),
    path("payment-gateways/", views.PaymentGatewayListCreateView.as_view(), name="gateway-list-create"),
    path("payment-gateways/<int:pk>/", views.PaymentGatewayRetrieveUpdateDestroyView.as_view(), name="gateway-detail"),
]
