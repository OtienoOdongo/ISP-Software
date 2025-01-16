from django.db import models

class UsageReport(models.Model):
    """Model for storing usage reports."""
    user = models.ForeignKey('user_management.UserProfile', on_delete=models.CASCADE, related_name='usage_reports')
    report_date = models.DateField()
    data_used = models.FloatField(help_text="Data used in GB")
    duration = models.DurationField(help_text="Duration of usage")

    def __str__(self):
        return f"Usage Report for {self.user} on {self.report_date}"


class FinancialReport(models.Model):
    """Model for storing financial reports."""
    report_date = models.DateField()
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    total_expenditure = models.DecimalField(max_digits=10, decimal_places=2)
    net_profit = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Financial Report on {self.report_date}"

