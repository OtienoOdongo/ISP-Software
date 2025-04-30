from django.urls import path
from network_management.api.views.router_management_view import (
    RouterDetailView,
    RouterListView,
    RouterStatsView,
    RouterRebootView,
    HotspotConfigView,
    HotspotUserDetailView,
    HotspotUsersView,
    BulkActionView
)

urlpatterns = [
    path("routers/", RouterListView.as_view(), name="router-list"),
    path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
    path("routers/<int:pk>/stats/", RouterStatsView.as_view(), name="router-stats"),
    path("routers/<int:pk>/reboot/", RouterRebootView.as_view(), name="router-reboot"),
    path("routers/<int:pk>/hotspot-users/", HotspotUsersView.as_view(), name="hotspot-users"),
    path("hotspot-users/<int:pk>/", HotspotUserDetailView.as_view(), name="hotspot-user-detail"),
    path("routers/<int:pk>/hotspot-config/", HotspotConfigView.as_view(), name="hotspot-config"),
    path("routers/bulk-action/", BulkActionView.as_view(), name="bulk-action"),
]