from django.db import models
from account.models.admin_model import Client

class BrowsingHistory(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='browsing_history')
    url = models.URLField(max_length=200)
    frequency = models.CharField(max_length=20)  # e.g., 'daily', 'weekly'
    data_used = models.CharField(max_length=20)  # e.g., '8GB', '500MB'
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.phonenumber} visited {self.url}"

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Browsing History'
        verbose_name_plural = 'Browsing Histories'