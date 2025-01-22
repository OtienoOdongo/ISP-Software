# models.py
from django.db import models
from django.utils import timezone

class PlanAnalytics(models.Model):
    """
    Model to store analytics data for internet plans:
    
    - Popularity metrics (sales, active users)
    - Network performance metrics (bandwidth usage, uptime)
    """
    plan_name = models.CharField(max_length=50)
    sales = models.IntegerField()
    active_users = models.IntegerField()
    bandwidth_usage = models.FloatField()  # Mbps
    uptime = models.FloatField()  # percentage
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        """
        Return a string representation of the PlanAnalytics instance.
        """
        return self.plan_name

class UserFeedback(models.Model):
    """
    Model to store user feedback for each internet plan, capturing:
    
    - Positive, neutral, and negative feedback counts
    """
    plan = models.ForeignKey(PlanAnalytics, on_delete=models.CASCADE)
    positive = models.IntegerField(default=0)
    neutral = models.IntegerField(default=0)
    negative = models.IntegerField(default=0)

    def __str__(self):
        """
        Return a string representation of the UserFeedback instance.
        """
        return f"Feedback for {self.plan.plan_name}"