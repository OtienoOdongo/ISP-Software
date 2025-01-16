from django.urls import path
from .views import StatListCreateView, StatDetailView, ChartListCreateView, ChartDetailView

urlpatterns = [
    path('stats/', StatListCreateView.as_view(), name='stat-list-create'),
    path('stats/<int:pk>/', StatDetailView.as_view(), name='stat-detail'),
    path('charts/', ChartListCreateView.as_view(), name='chart-list-create'),
    path('charts/<int:pk>/', ChartDetailView.as_view(), name='chart-detail'),
]
