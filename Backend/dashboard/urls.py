from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'grid-items', views.GridItemViewSet)
router.register(r'sales-data', views.SalesDataViewSet)
router.register(r'revenue-data', views.RevenueDataViewSet)
router.register(r'financial-data', views.FinancialDataViewSet)
router.register(r'visitor-analytics', views.VisitorAnalyticsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]