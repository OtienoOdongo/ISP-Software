from django.urls import path, include
from rest_framework.routers import DefaultRouter
from reporting.api.views.usage_report import   UsageReportViewSet
from reporting.api.views.financial_report import FinancialReportsViewSet

router = DefaultRouter()
router.register(r'usage-reports', UsageReportViewSet, basename='usage-report')
router.register(r'financial-reports', FinancialReportsViewSet, basename='financial-report')


urlpatterns = [
    path('', include(router.urls)),
]