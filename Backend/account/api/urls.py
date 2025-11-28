


# # account/api/urls


# from django.urls import path
# from account.api.views.admin_view import (
#     AdminProfileView, ClientListView, LoginHistoryView, NotificationView, TwoFAView
# )

# app_name = 'account'

# urlpatterns = [
#     path('profile/', AdminProfileView.as_view(), name='admin-profile'),
#     path('clients/', ClientListView.as_view(), name='client-list'),
#     path('login-history/', LoginHistoryView.as_view(), name='login-history'),
#     path('notifications/', NotificationView.as_view(), name='notifications'),
#     path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
#     path('twofa/', TwoFAView.as_view(), name='twofa'),
# ]


from django.urls import path
from account.api.views.admin_view import (
    AdminProfileView, ClientListView, ClientDetailView, ClientCreateView,
    ClientConnectionStatsView, ClientBulkActionView, LoginHistoryView, 
    NotificationView, TwoFAView
)

app_name = 'account'

urlpatterns = [
    # Profile
    path('profile/', AdminProfileView.as_view(), name='admin-profile'),
    
    # Client management
    path('clients/', ClientListView.as_view(), name='client-list'),
    path('clients/create/', ClientCreateView.as_view(), name='client-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('clients/<int:client_id>/connection-stats/', ClientConnectionStatsView.as_view(), name='client-connection-stats'),
    path('clients/bulk-action/', ClientBulkActionView.as_view(), name='client-bulk-action'),
    
    # User management
    path('login-history/', LoginHistoryView.as_view(), name='login-history'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
    path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
    path('twofa/', TwoFAView.as_view(), name='twofa'),
]