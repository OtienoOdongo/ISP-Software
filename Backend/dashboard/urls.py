# dashboard/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('grid-items/', views.GridItemList.as_view(), name='grid-item-list'),
    path('grid-items/<int:pk>/', views.GridItemDetail.as_view(), name='grid-item-detail'),
    path('sales-data/', views.SalesDataList.as_view(), name='sales-data-list'),
    path('revenue-data/', views.RevenueDataList.as_view(), name='revenue-data-list'),
    path('financial-data/', views.FinancialDataList.as_view(), name='financial-data-list'),
    path('visitor-analytics/', views.VisitorAnalyticsList.as_view(), name='visitor-analytics-list'),
    
    
]