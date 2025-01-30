from django.contrib import admin
from .models import GridItem, SalesData, RevenueData, FinancialData, VisitorAnalytics

admin.site.register(SalesData)
admin.site.register(RevenueData)
admin.site.register(FinancialData)
admin.site.register(VisitorAnalytics)
admin.site.register(GridItem)