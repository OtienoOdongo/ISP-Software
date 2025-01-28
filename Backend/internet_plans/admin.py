from django.contrib import admin
from internet_plans.models.create_plans import InternetPlan
from internet_plans.models.plan_analytics import PlanAnalytics


admin.site.register(InternetPlan)
admin.site.register(PlanAnalytics)