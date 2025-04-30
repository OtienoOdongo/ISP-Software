from django.urls import path
from account.api.views.admin_view import AdminProfileView, ClientListView, ClientDetailView
from account.api.views.settings_view import (
    AdminSettingsView, GenerateApiKeyView, TwoFactorSetupView,
    SessionLogoutView, SessionLogoutAllView, DataExportView, DeleteAccountView
)

app_name = 'account'

urlpatterns = [
    path('profile/', AdminProfileView.as_view(), name='admin-profile'),  
    path('clients/', ClientListView.as_view(), name='client-list'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('settings/', AdminSettingsView.as_view(), name='account-settings'),
    path('generate-api-key/', GenerateApiKeyView.as_view(), name='generate-api-key'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('sessions/logout/', SessionLogoutView.as_view(), name='session-logout'),
    path('sessions/logout-all/', SessionLogoutAllView.as_view(), name='session-logout-all'),
    path('data-export/', DataExportView.as_view(), name='data-export'),
    path('delete/', DeleteAccountView.as_view(), name='delete-account'),
]





