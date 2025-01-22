from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Set up the DefaultRouter to handle standard CRUD operations for RouterViewSet
router = DefaultRouter()
router.register(r'routers', views.RouterViewSet)
router.register(r'devices', views.DeviceViewSet)
router.register(r'ip-addresses', views.IPAddressViewSet)
router.register(r'subnets', views.SubnetViewSet)
router.register(r'network-diagnostics', views.NetworkDiagnosticsViewSet)
router.register(r'security-settings', views.SecuritySettingsViewSet)


# Define additional custom routes for specific actions
urlpatterns = [
    path('', include(router.urls)),  # Include all routes from the DefaultRouter
    path('routers/<int:pk>/fetch-status/', views.RouterViewSet.
         as_view({'get': 'fetch_status'}), name='fetch-status'),
    path('routers/<int:pk>/update-firmware/', views.RouterViewSet.
         as_view({'post': 'update_firmware'}), name='update-firmware'),
    path('routers/<int:pk>/share-internet/', views.RouterViewSet.
         as_view({'post': 'share_internet'}), name='share-internet'),
    path('routers/<int:pk>/update-status/', views.RouterViewSet.
         as_view({'post': 'update_router_status'}), name='update-status'),
    path('devices/<int:device_id>/update-bandwidth/', views.DeviceViewSet.
         as_view({'post': 'update_bandwidth'}), name='update-bandwidth'),
    
]
