# dashboard/models.py
from django.db import models

class GridItem(models.Model):
    label = models.CharField(max_length=100, help_text="Descriptive name of the grid item.")
    value = models.CharField(max_length=20, help_text="Displayed numeric or currency value.")
    rate = models.FloatField(help_text="Percentage change for the item.")
    icon = models.CharField(max_length=100, help_text="Name of the associated icon file.")
    signal_icon = models.CharField(max_length=100, blank=True, null=True, help_text="Optional secondary icon.")

    def __str__(self):
        return self.label

    class Meta:
        verbose_name_plural = "Grid Items"

class SalesData(models.Model):
    plan_choices = [('basic', 'Basic Plan'), ('plus', 'Plus Plan'), ('premium', 'Premium Plan')]
    plan = models.CharField(max_length=10, choices=plan_choices, help_text="Type of internet plan sold.")
    month = models.CharField(max_length=10, help_text="Month of recorded sales.")
    sales = models.PositiveIntegerField(help_text="Number of sales recorded.")

    def __str__(self):
        return f"{self.plan} - {self.month} - {self.sales}"

class RevenueData(models.Model):
    month = models.CharField(max_length=10, help_text="Month for which revenue is recorded.")
    targeted_revenue = models.DecimalField(max_digits=10, decimal_places=2, help_text="Planned revenue target.")
    projected_revenue = models.DecimalField(max_digits=10, decimal_places=2, help_text="Actual projected revenue.")

    def __str__(self):
        return f"{self.month} - Target: {self.targeted_revenue}, Projected: {self.projected_revenue}"

class FinancialData(models.Model):
    month = models.CharField(max_length=10, help_text="Month of financial record.")
    income = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total income.")
    profit = models.DecimalField(max_digits=10, decimal_places=2, help_text="Net profit.")
    expenses = models.DecimalField(max_digits=10, decimal_places=2, help_text="Total expenses.")

    def __str__(self):
        return f"{self.month} - Income: {self.income}, Profit: {self.profit}, Expenses: {self.expenses}"

class VisitorAnalytics(models.Model):
    plan_choices = [('basic', 'Basic Plan'), ('plus', 'Plus Plan'), ('premium', 'Premium Plan')]
    plan = models.CharField(max_length=10, choices=plan_choices, help_text="Type of internet plan.")
    visitors = models.PositiveIntegerField(help_text="Number of unique visitors.")

    def __str__(self):
        return f"{self.plan} - {self.visitors} Visitors"