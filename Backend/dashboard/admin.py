# dashboard/admin.py
from django.contrib import admin
from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics

@admin.register(GridItem)
class GridItemAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'rate', 'icon', 'signal_icon')

@admin.register(SalesData)
class SalesDataAdmin(admin.ModelAdmin):
    list_display = ('plan', 'month', 'sales')
    list_filter = ('plan', 'month')

@admin.register(RevenueData)
class RevenueDataAdmin(admin.ModelAdmin):
    list_display = ('month', 'targeted_revenue', 'projected_revenue')

@admin.register(FinancialData)
class FinancialDataAdmin(admin.ModelAdmin):
    list_display = ('month', 'income', 'profit', 'expenses')

@admin.register(VisitorAnalytics)
class VisitorAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('plan', 'visitors')
    list_filter = ('plan',)