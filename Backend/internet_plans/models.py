from django.db import models


class Plan(models.Model):
    """
    Model representing an internet plan.
    """
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    data_limit = models.IntegerField(help_text="Data limit in GB")
    speed = models.CharField(max_length=50)
    is_auto_renewable = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AnalyticsData(models.Model):
    """
    Model representing analytics data for a plan.
    """
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name="analytics")
    month = models.CharField(max_length=20)
    sales_count = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return f"{self.plan.name} - {self.month}"


class RenewalSettings(models.Model):
    """
    Model representing auto-renewal settings for a plan.
    """
    plan = models.OneToOneField(Plan, on_delete=models.CASCADE, related_name="renewal_settings")
    renewal_period = models.CharField(max_length=50, help_text="e.g., Monthly, Weekly")
    notification_days = models.IntegerField(help_text="Days before renewal to notify users")

    def __str__(self):
        return f"{self.plan.name} - {self.renewal_period}"

