from django.urls import path
from . import views

app_name = "reporting_analytics"

urlpatterns = [
    path("usage-reports/", views.UsageReportsListCreateView.as_view(), name="usage-reports"),
    path("usage-reports/<int:pk>/", views.UsageReportsRetrieveUpdateDestroyView.as_view(), name="usage-reports-detail"),
    path("financial-reports/", views.FinancialReportsListCreateView.as_view(), name="financial-reports"),
    path("financial-reports/<int:pk>/", views.FinancialReportsRetrieveUpdateDestroyView.as_view(), name="financial-reports-detail"),
]
