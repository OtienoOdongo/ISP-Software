# from django.urls import path
# from network_management.api.views.router_management_view import (
#     RouterDetailView,
#     RouterListView,
#     RouterStatsView,
#     RouterRebootView,
#     HotspotConfigView,
#     HotspotUserDetailView,
#     HotspotUsersView,
#     BulkActionView
# )
# from network_management.api.views.bandwidth_allocation_view import (
#     BandwidthAllocationListView,
#     BandwidthAllocationDetailView,
#     QoSProfileListView,
#     BandwidthUsageStatsView
# )
# from network_management.api.views.ip_address_view import (
#     IPAddressListView,
#     IPAddressDetailView,
#     SubnetListView,
#     DHCPLeaseListView
# )
# from network_management.api.views.network_diagnostics_views import (
#     DiagnosticTestListView, DiagnosticTestBulkView, SpeedTestHistoryView
# )

# urlpatterns = [
#     # router management api endpoints
#     path("routers/", RouterListView.as_view(), name="router-list"),
#     path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
#     path("routers/<int:pk>/stats/", RouterStatsView.as_view(), name="router-stats"),
#     path("routers/<int:pk>/reboot/", RouterRebootView.as_view(), name="router-reboot"),
#     path("routers/<int:pk>/hotspot-users/", HotspotUsersView.as_view(), name="hotspot-users"),
#     path("hotspot-users/<int:pk>/", HotspotUserDetailView.as_view(), name="hotspot-user-detail"),
#     path("routers/<int:pk>/hotspot-config/", HotspotConfigView.as_view(), name="hotspot-config"),
#     path("routers/bulk-action/", BulkActionView.as_view(), name="bulk-action"),

#     # bandwidth allocation api endpoints
#     path('allocations/', BandwidthAllocationListView.as_view(), name='bandwidth-allocation-list'),
#     path('allocations/<int:pk>/', BandwidthAllocationDetailView.as_view(), name='bandwidth-allocation-detail'),
#     path('qos-profiles/', QoSProfileListView.as_view(), name='qos-profile-list'),
#     path('usage-stats/', BandwidthUsageStatsView.as_view(), name='bandwidth-usage-stats'),

#     # ip address management api enpoints
#     path('ip-addresses/', IPAddressListView.as_view(), name='ip-address-list'),
#     path('ip-addresses/<int:pk>/', IPAddressDetailView.as_view(), name='ip-address-detail'),
#     path('subnets/', SubnetListView.as_view(), name='subnet-list'),
#     path('dhcp-leases/', DHCPLeaseListView.as_view(), name='dhcp-lease-list'),

#     # network diagnostics api endpoints
#     path('tests/', DiagnosticTestListView.as_view(), name='diagnostic-test-list'),
#     path('tests/bulk/', DiagnosticTestBulkView.as_view(), name='diagnostic-test-bulk'),
#     path('speed-test-history/', SpeedTestHistoryView.as_view(), name='speed-test-history'),
# ]





from django.urls import path
from network_management.api.views.router_management_view import (
    RouterDetailView,
    RouterListView,
    RouterStatsView,
    RouterRebootView,
    HotspotConfigView,
    HotspotUserDetailView,
    HotspotUsersView,
    BulkActionView,
    RouterActivateUserView,
    GetMacView  # Added
)
from network_management.api.views.bandwidth_allocation_view import (
    BandwidthAllocationListView,
    BandwidthAllocationDetailView,
    QoSProfileListView,
    BandwidthUsageStatsView
)
from network_management.api.views.ip_address_view import (
    IPAddressListView,
    IPAddressDetailView,
    SubnetListView,
    DHCPLeaseListView
)
from network_management.api.views.network_diagnostics_views import (
    DiagnosticTestListView, DiagnosticTestBulkView, SpeedTestHistoryView
)

urlpatterns = [
    # router management api endpoints
    path("routers/", RouterListView.as_view(), name="router-list"),
    path("routers/<int:pk>/", RouterDetailView.as_view(), name="router-detail"),
    path("routers/<int:pk>/stats/", RouterStatsView.as_view(), name="router-stats"),
    path("routers/<int:pk>/reboot/", RouterRebootView.as_view(), name="router-reboot"),
    path("routers/<int:pk>/hotspot-users/", HotspotUsersView.as_view(), name="hotspot-users"),
    path("hotspot-users/<int:pk>/", HotspotUserDetailView.as_view(), name="hotspot-user-detail"),
    path("routers/<int:pk>/hotspot-config/", HotspotConfigView.as_view(), name="hotspot-config"),
    path("routers/<int:pk>/activate-user/", RouterActivateUserView.as_view(), name="router-activate-user"),
    path("routers/bulk-action/", BulkActionView.as_view(), name="bulk-action"),
    path("get-mac/", GetMacView.as_view(), name="get-mac"),  

    # bandwidth allocation api endpoints
    path('allocations/', BandwidthAllocationListView.as_view(), name='bandwidth-allocation-list'),
    path('allocations/<int:pk>/', BandwidthAllocationDetailView.as_view(), name='bandwidth-allocation-detail'),
    path('qos-profiles/', QoSProfileListView.as_view(), name='qos-profile-list'),
    path('usage-stats/', BandwidthUsageStatsView.as_view(), name='bandwidth-usage-stats'),

    # ip address management api enpoints
    path('ip-addresses/', IPAddressListView.as_view(), name='ip-address-list'),
    path('ip-addresses/<int:pk>/', IPAddressDetailView.as_view(), name='ip-address-detail'),
    path('subnets/', SubnetListView.as_view(), name='subnet-list'),
    path('dhcp-leases/', DHCPLeaseListView.as_view(), name='dhcp-lease-list'),

    # network diagnostics api endpoints
    path('tests/', DiagnosticTestListView.as_view(), name='diagnostic-test-list'),
    path('tests/bulk/', DiagnosticTestBulkView.as_view(), name='diagnostic-test-bulk'),
    path('speed-test-history/', SpeedTestHistoryView.as_view(), name='speed-test-history'),
]