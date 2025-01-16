from django.db import models

class AutomatedAlert(models.Model):
    type = models.CharField(max_length=100)
    message = models.TextField()
    status = models.CharField(max_length=50, choices=[('Sent', 'Sent'), ('Pending', 'Pending')])
    phone = models.CharField(max_length=15)
    timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.type} - {self.status}"


class ScheduledMaintenance(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    status = models.CharField(max_length=50, choices=[('Scheduled', 'Scheduled'), ('Pending', 'Pending')])
    notified = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class TaskAutomation(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Inactive', 'Inactive')])

    def __str__(self):
        return self.name
