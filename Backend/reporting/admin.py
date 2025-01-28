from django.contrib import admin
from reporting.models.financial_report import MonthlyFinancial
from reporting.models.usage_report import UsageReport


admin.site.register(MonthlyFinancial)
admin.site.register(UsageReport)