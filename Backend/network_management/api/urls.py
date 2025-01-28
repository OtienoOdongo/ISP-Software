from django.urls import path, include
from rest_framework.routers import DefaultRouter
from network_management.api.views.Bandwidth_Allocation import DeviceViewSet
from network_management.api.views.IP_Address_Management import IPAddressViewSet, SubnetViewSet
from network_management.api.views.Network_Diagnostic import NetworkDiagnosticsViewSet
from network_management.api.views.Router_Management import RouterViewSet
from network_management.api.views.Security_Settings import SecuritySettingsViewSet

# Set up the DefaultRouter to handle standard CRUD operations for RouterViewSet
router = DefaultRouter()
router.register(r'routers', RouterViewSet)
router.register(r'devices', DeviceViewSet)
router.register(r'ip-addresses', IPAddressViewSet)
router.register(r'subnets', SubnetViewSet)
router.register(r'network-diagnostics', NetworkDiagnosticsViewSet)
router.register(r'security-settings', SecuritySettingsViewSet, basename='security-settings')


# Define additional custom routes for specific actions
urlpatterns = [
    path('', include(router.urls)),  # Include all routes from the DefaultRouter
    path('routers/<int:pk>/fetch-status/', RouterViewSet.
         as_view({'get': 'fetch_status'}), name='fetch-status'),
    path('routers/<int:pk>/update-firmware/', RouterViewSet.
         as_view({'post': 'update_firmware'}), name='update-firmware'),
    path('routers/<int:pk>/share-internet/', RouterViewSet.
         as_view({'post': 'share_internet'}), name='share-internet'),
    path('routers/<int:pk>/update-status/', RouterViewSet.
         as_view({'post': 'update_router_status'}), name='update-status'),
    path('devices/<int:device_id>/update-bandwidth/', DeviceViewSet.
         as_view({'post': 'update_bandwidth'}), name='update-bandwidth'),
    
]
