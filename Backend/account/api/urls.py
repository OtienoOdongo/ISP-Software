from django.urls import path
from account.api.views.admin_view import AdminProfileView
from account.api.views.settings_view import AccountSettingsView


app_name = 'account'  

urlpatterns = [
    path('profile', AdminProfileView.as_view(), name='admin-profile'),
    path('settings', AccountSettingsView.as_view(), name='account-settings'),
    
]