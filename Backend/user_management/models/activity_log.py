from django.db import models
from django.utils import timezone

class UserActivity(models.Model):
    """
    Represents an activity performed by a user. 
    Includes details like the type of activity,
    when it occurred, and additional information.

    Attributes:
        id (AutoField): Primary key for the activity.
        user (ForeignKey): The user associated with this activity.
        type (CharField): The type of activity (e.g., login, logout, data_usage).
        details (TextField): Additional details about the activity.
        timestamp (DateTimeField): When the activity occurred.
    """

    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('data_usage', 'Data Usage'),
        ('payment_success', 'Payment Success'),
        ('payment_failed', 'Payment Failed'),
    ]

    user = models.ForeignKey('user_management.UserProfile', on_delete=models.CASCADE,
                              related_name='activities')
    type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    details = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.name} - {self.type}"