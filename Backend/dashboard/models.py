from django.db import models

class Stat(models.Model):
    """
    Model to represent statistical metrics displayed on the dashboard.
    """
    label = models.CharField(max_length=50, help_text="Label for the metric (e.g., 'Active Users').")
    value = models.CharField(max_length=50, help_text="Value for the metric (e.g., '12', 'KES 10,000').")
    icon = models.ImageField(upload_to="stat_icons/", null=True, blank=True, help_text="Icon for the metric.")
    rate = models.FloatField(help_text="Rate of change (positive or negative) in percentage.")

    def __str__(self):
        return self.label


class Chart(models.Model):
    """
    Model to represent charts for dashboard visualization.
    """
    title = models.CharField(max_length=100, help_text="Title of the chart (e.g., 'Revenue Chart').")
    data = models.JSONField(help_text="Data for rendering the chart in JSON format.")
    chart_type = models.CharField(max_length=50, help_text="Type of the chart (e.g., 'bar', 'line', 'pie').")

    def __str__(self):
        return self.title
