from django.contrib import admin
from account.models.admin_profile import AdminProfile, RecentActivity, NetworkHealth, ServerStatus
from account.models.settings import UserProfile, SecuritySettings, NotificationSettings

admin.site.register(AdminProfile)
admin.site.register(RecentActivity)
admin.site.register(NetworkHealth)
admin.site.register(ServerStatus)
admin.site.register(UserProfile)
admin.site.register(SecuritySettings)
admin.site.register(NotificationSettings)