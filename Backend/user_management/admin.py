from django.contrib import admin
from user_management.models.activity_log import UserActivity
from user_management.models.billing_payment import UserBilling, Payment
from user_management.models.plan_assignment import Plan, UserPlan
from user_management.models.user_profile import UserProfile


admin.site.register(UserProfile)
admin.site.register(UserActivity)
admin.site.register(UserBilling)
admin.site.register(Plan)
admin.site.register(Payment)
admin.site.register(UserPlan)