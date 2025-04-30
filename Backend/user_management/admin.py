# from django.contrib import admin
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold
# )

# @admin.register(PlanAnalyticsSnapshot)
# class PlanAnalyticsSnapshotAdmin(admin.ModelAdmin):
#     list_display = ('timestamp', 'total_clients', 'active_clients', 'high_usage_clients', 
#                    'collected_revenue', 'active_devices', 'congested_routers')
#     list_filter = ('timestamp',)
#     date_hierarchy = 'timestamp'
#     readonly_fields = ('timestamp',)

# @admin.register(ClientAnalytics)
# class ClientAnalyticsAdmin(admin.ModelAdmin):
#     list_display = ('client', 'timestamp', 'data_usage_percentage', 'payment_status', 
#                    'is_high_usage', 'is_near_expiry')
#     list_filter = ('timestamp', 'payment_status', 'is_high_usage', 'is_near_expiry')
#     search_fields = ('client__full_name', 'client__phonenumber')
#     date_hierarchy = 'timestamp'
#     readonly_fields = ('timestamp',)

# @admin.register(SMSNotification)
# class SMSNotificationAdmin(admin.ModelAdmin):
#     list_display = ('client', 'trigger', 'status', 'sent_at', 'created_at')
#     list_filter = ('status', 'trigger', 'sent_at')
#     search_fields = ('client__full_name', 'client__phonenumber', 'message')
#     date_hierarchy = 'sent_at'
#     readonly_fields = ('created_at',)

# @admin.register(DataUsageThreshold)
# class DataUsageThresholdAdmin(admin.ModelAdmin):
#     list_display = ('threshold_percentage', 'is_active', 'created_at', 'updated_at')
#     list_editable = ('is_active',)
#     list_filter = ('is_active',)
#     search_fields = ('message_template',)
#     readonly_fields = ('created_at', 'updated_at')






from django.contrib import admin
from user_management.models.plan_model import (
    PlanAnalyticsSnapshot,
    ClientAnalytics,
    SMSNotification,
    DataUsageThreshold,
    ActionNotification
)

@admin.register(PlanAnalyticsSnapshot)
class PlanAnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'total_clients', 'active_clients', 'high_usage_clients', 
                   'collected_revenue', 'active_devices', 'congested_routers')
    list_filter = ('timestamp',)
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)

@admin.register(ClientAnalytics)
class ClientAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('client', 'timestamp', 'data_usage_percentage', 'payment_status', 
                   'is_high_usage', 'is_near_expiry')
    list_filter = ('timestamp', 'payment_status', 'is_high_usage', 'is_near_expiry')
    search_fields = ('client__full_name', 'client__phonenumber')
    date_hierarchy = 'timestamp'
    readonly_fields = ('timestamp',)

@admin.register(SMSNotification)
class SMSNotificationAdmin(admin.ModelAdmin):
    list_display = ('client', 'trigger', 'status', 'sent_at', 'created_at')
    list_filter = ('status', 'trigger', 'sent_at')
    search_fields = ('client__full_name', 'client__phonenumber', 'message')
    date_hierarchy = 'sent_at'
    readonly_fields = ('created_at', 'sent_at', 'delivery_status', 'error')

@admin.register(DataUsageThreshold)
class DataUsageThresholdAdmin(admin.ModelAdmin):
    list_display = ('threshold_percentage', 'is_active', 'created_at', 'updated_at')
    list_editable = ('is_active',)
    list_filter = ('is_active',)
    search_fields = ('message_template',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(ActionNotification)
class ActionNotificationAdmin(admin.ModelAdmin):
    list_display = ('type', 'message', 'created_at', 'is_read')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('message',)
    readonly_fields = ('created_at',)
    actions = ['mark_as_read']

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, "Selected notifications marked as read.")
    mark_as_read.short_description = "Mark selected notifications as read"