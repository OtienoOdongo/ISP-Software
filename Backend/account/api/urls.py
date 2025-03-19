from django.urls import path
from account.api.views.admin_view import AdminProfileView
from account.api.views.settings_view import (
    AdminSettingsView, GenerateApiKeyView, TwoFactorSetupView,
    SessionLogoutView, SessionLogoutAllView, DataExportView, DeleteAccountView
)

app_name = 'account'

urlpatterns = [
    path('profile/', AdminProfileView.as_view(), name='admin-profile'),  
    path('settings/', AdminSettingsView.as_view(), name='account-settings'),
    path('generate-api-key/', GenerateApiKeyView.as_view(), name='generate-api-key'),
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('sessions/logout/', SessionLogoutView.as_view(), name='session-logout'),
    path('sessions/logout-all/', SessionLogoutAllView.as_view(), name='session-logout-all'),
    path('data-export/', DataExportView.as_view(), name='data-export'),
    path('delete/', DeleteAccountView.as_view(), name='delete-account'),
]