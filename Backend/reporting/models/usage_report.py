from django.db import models

class UsageReport(models.Model):
    """
    Model for storing monthly usage reports.

    Attributes:
        month (CharField): The name of the month.
        used_data (DecimalField): Amount of data used in GB.
        remaining_data (DecimalField): Amount of data remaining in GB.
        active_users (PositiveIntegerField): Number of active users.
        inactive_users (PositiveIntegerField): Number of inactive users.
        network_performance (IntegerField): A metric for network performance.
    """
    month = models.CharField(max_length=3)  
    used_data = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_data = models.DecimalField(max_digits=10, decimal_places=2)
    active_users = models.PositiveIntegerField()
    inactive_users = models.PositiveIntegerField()
    network_performance = models.IntegerField()

    def __str__(self):
        return f"{self.month} Report"