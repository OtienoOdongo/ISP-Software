from django.urls import path
from .views import (
    RouterManagementListCreateView,
    RouterManagementRetrieveUpdateDeleteView,
    BandwidthAllocationListCreateView,
    BandwidthAllocationRetrieveUpdateDeleteView,
    IPAddressManagementListCreateView,
    IPAddressManagementRetrieveUpdateDeleteView,
    NetworkDiagnosticsListCreateView,
    NetworkDiagnosticsRetrieveUpdateDeleteView,
    SecuritySettingsListCreateView,
    SecuritySettingsRetrieveUpdateDeleteView
)

app_name = 'network_management'

urlpatterns = [
    path('routers/', RouterManagementListCreateView.as_view(), name='router-list-create'),
    path('routers/<int:pk>/', RouterManagementRetrieveUpdateDeleteView.as_view(), name='router-detail'),

    path('bandwidth/', BandwidthAllocationListCreateView.as_view(), name='bandwidth-list-create'),
    path('bandwidth/<int:pk>/', BandwidthAllocationRetrieveUpdateDeleteView.as_view(), name='bandwidth-detail'),

    path('ip-management/', IPAddressManagementListCreateView.as_view(), name='ip-management-list-create'),
    path('ip-management/<int:pk>/', IPAddressManagementRetrieveUpdateDeleteView.as_view(), name='ip-management-detail'),

    path('diagnostics/', NetworkDiagnosticsListCreateView.as_view(), name='diagnostics-list-create'),
    path('diagnostics/<int:pk>/', NetworkDiagnosticsRetrieveUpdateDeleteView.as_view(), name='diagnostics-detail'),

    path('security/', SecuritySettingsListCreateView.as_view(), name='security-settings-list-create'),
    path('security/<int:pk>/', SecuritySettingsRetrieveUpdateDeleteView.as_view(), name='security-settings-detail'),
]
