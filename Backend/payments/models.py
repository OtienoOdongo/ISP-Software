from django.db import models


class Transaction(models.Model):
    """
    Model representing a payment transaction.
    """
    transaction_id = models.CharField(max_length=100, unique=True)
    user_id = models.CharField(max_length=50)
    plan_name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=[("Pending", "Pending"), ("Success", "Success"), ("Failed", "Failed")])
    transaction_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.transaction_id


class PaymentGateway(models.Model):
    """
    Model representing payment gateway settings.
    """
    gateway_name = models.CharField(max_length=100)
    api_key = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.gateway_name
