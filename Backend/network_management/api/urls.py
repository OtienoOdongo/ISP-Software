from django.urls import path
from network_management.api.views.router_management_view import (
    RouterListCreateView, RouterDetailView, RouterConnectView, RouterDisconnectView,
    RouterStatusView, RouterFirmwareView, RouterShareInternetView, RouterExportView, RouterImportView
)

app_name = 'network_management'

urlpatterns = [
    path('routers/', RouterListCreateView.as_view(), name='router-list-create'),
    path('routers/<int:pk>/', RouterDetailView.as_view(), name='router-detail'),
    path('routers/<int:pk>/connect/', RouterConnectView.as_view(), name='router-connect'),
    path('routers/<int:pk>/disconnect/', RouterDisconnectView.as_view(), name='router-disconnect'),
    path('routers/<int:pk>/status/', RouterStatusView.as_view(), name='router-status'),
    path('routers/<int:pk>/firmware/', RouterFirmwareView.as_view(), name='router-firmware'),
    path('routers/<int:pk>/share-internet/', RouterShareInternetView.as_view(), name='router-share-internet'),
    path('routers/<int:pk>/export/', RouterExportView.as_view(), name='router-export'),
    path('routers/<int:pk>/import/', RouterImportView.as_view(), name='router-import'),
]