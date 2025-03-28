# internet_plans/models/plan_analytics_models.py
from django.db import models
from internet_plans.models.create_plan_models import InternetPlan  

class PlanAnalytics(models.Model):
    plan = models.ForeignKey(InternetPlan, on_delete=models.CASCADE, related_name='analytics')
    uptime = models.FloatField(default=99.0, help_text="Percentage uptime (e.g., 99.5)")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Plan Analytic"
        verbose_name_plural = "Plan Analytics"

    def __str__(self):
        return f"Analytics for {self.plan.name}"