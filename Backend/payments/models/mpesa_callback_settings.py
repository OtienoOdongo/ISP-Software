from django.db import models

class MpesaCallback(models.Model):
    """
    Model for storing M-Pesa callback configurations.

    Attributes:
        id (AutoField): Automatically generated unique identifier for each callback.
        event (CharField): The event type for which the callback is configured.
        url (URLField): The URL where the callback should send notifications.
    """
    EVENT_CHOICES = [
        ('Payment Success', 'Payment Success'),
        ('Payment Failure', 'Payment Failure'),
        ('Transaction Cancellation', 'Transaction Cancellation')
    ]

    event = models.CharField(max_length=50, choices=EVENT_CHOICES)
    url = models.URLField()

    def __str__(self):
        return f"{self.event} - {self.url}"