from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'usage-reports', views.UsageReportViewSet)
router.register(r'financial-reports', views.FinancialReportsViewSet)


urlpatterns = [
    path('', include(router.urls)),
]