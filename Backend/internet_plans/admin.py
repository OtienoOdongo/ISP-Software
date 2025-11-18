# from django.contrib import admin
# from internet_plans.models.create_plan_models import InternetPlan, Subscription, PlanTemplate

# @admin.register(PlanTemplate)
# class PlanTemplateAdmin(admin.ModelAdmin):
#     list_display = ['name', 'category', 'base_price', 'is_public', 'is_active', 'usage_count', 'created_by', 'created_at']
#     list_filter = ['category', 'is_public', 'is_active', 'created_at']
#     search_fields = ['name', 'description']
#     readonly_fields = ['usage_count', 'created_at', 'updated_at']
    
#     def save_model(self, request, obj, form, change):
#         if not obj.pk:
#             obj.created_by = request.user
#         super().save_model(request, obj, form, change)

# @admin.register(InternetPlan)
# class InternetPlanAdmin(admin.ModelAdmin):
#     list_display = ['name', 'plan_type', 'price', 'category', 'active', 'router_specific', 'purchases', 'created_at']
#     list_filter = ['plan_type', 'category', 'active', 'router_specific', 'created_at']
#     search_fields = ['name', 'description']
#     readonly_fields = ['purchases', 'created_at', 'updated_at']
#     filter_horizontal = ['allowed_routers']

# @admin.register(Subscription)
# class SubscriptionAdmin(admin.ModelAdmin):
#     list_display = ['id', 'client', 'internet_plan', 'router', 'access_method', 'status', 'is_active', 'activation_successful', 'start_date']
#     list_filter = ['access_method', 'status', 'is_active', 'activation_successful', 'start_date']
#     search_fields = ['client__user__username', 'internet_plan__name', 'mac_address']
#     readonly_fields = ['start_date', 'last_activity', 'activation_attempts', 'last_activation_attempt']