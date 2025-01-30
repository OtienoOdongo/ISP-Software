from django.db import models

class GridItem(models.Model):
    """
    Model representing individual grid items displayed in the dashboard.
    Each item includes a label, value, rate of change, and associated icons.
    """
    label = models.CharField(
        max_length=100, 
        help_text="Descriptive name of the grid item (e.g., 'Active Users', 'Total Clients')."
    )
    value = models.CharField(
        max_length=20, 
        help_text="Displayed numeric or currency value (e.g., '12', 'KES 10,000')."
    )
    rate = models.FloatField(
        help_text="Percentage change for the item (e.g., 12.5 for 12.5%)."
    )
    icon = models.CharField(
        max_length=100, 
        help_text="Name of the associated icon file."
    )
    signal_icon = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        help_text="Optional secondary icon, such as a WiFi signal indicator."
    )

    def __str__(self):
        return self.label

    class Meta:
        verbose_name_plural = "Grid Items"

class SalesData(models.Model):
    """
    Model representing sales data for different internet plans.
    Tracks sales on a monthly basis for Basic, Plus, and Premium plans.
    """
    plan_choices = [
        ('basic', 'Basic Plan'),
        ('plus', 'Plus Plan'),
        ('premium', 'Premium Plan'),
    ]
    plan = models.CharField(
        max_length=10, 
        choices=plan_choices,
        help_text="Type of internet plan sold."
    )
    month = models.CharField(
        max_length=10, 
        help_text="Month of recorded sales (e.g., 'January', 'February')."
    )
    sales = models.PositiveIntegerField(
        help_text="Number of sales recorded for the selected plan and month."
    )

    def __str__(self):
        return f"{self.plan} - {self.month} - {self.sales}"

class RevenueData(models.Model):
    """
    Model storing revenue data, tracking targeted and projected revenue per month.
    """
    month = models.CharField(
        max_length=10, 
        help_text="Month for which revenue is recorded (e.g., 'January', 'February')."
    )
    targeted_revenue = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Planned revenue target for the given month."
    )
    projected_revenue = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Actual projected revenue for the given month."
    )

    def __str__(self):
        return f"{self.month} - Target: {self.targeted_revenue}, Projected: {self.projected_revenue}"

class FinancialData(models.Model):
    """
    Model storing financial records, including income, profit, and expenses per month.
    """
    month = models.CharField(
        max_length=10, 
        help_text="Month of financial record (e.g., 'January', 'February')."
    )
    income = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Total income for the month."
    )
    profit = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Net profit recorded for the month."
    )
    expenses = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Total expenses incurred during the month."
    )

    def __str__(self):
        return f"{self.month} - Income: {self.income}, Profit: {self.profit}, Expenses: {self.expenses}"

class VisitorAnalytics(models.Model):
    """
    Model tracking the number of visitors for different internet plans.
    Useful for analyzing customer engagement trends.
    """
    plan_choices = [
        ('basic', 'Basic Plan'),
        ('plus', 'Plus Plan'),
        ('premium', 'Premium Plan'),
    ]
    plan = models.CharField(
        max_length=10, 
        choices=plan_choices,
        help_text="Type of internet plan associated with the visitor analytics."
    )
    visitors = models.PositiveIntegerField(
        help_text="Number of unique visitors for the selected plan."
    )

    def __str__(self):
        return f"{self.plan} - {self.visitors} Visitors"
