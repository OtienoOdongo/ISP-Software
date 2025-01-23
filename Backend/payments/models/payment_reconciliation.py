from django.db import models

class PaymentTransaction(models.Model):
    """
    Model for storing payment transactions.

    Attributes:
        id (AutoField): Automatically generated unique identifier.
        date (DateField): Date of the transaction.
        amount (DecimalField): Amount of the transaction in KES.
        status (CharField): Current status of the transaction.
        type (CharField): Type of transaction, e.g., 'Payment'.
        reference (CharField): Unique reference for the transaction.
    """
    STATUS_CHOICES = [
        ('Matched', 'Matched'),
        ('Pending', 'Pending'),
        ('Discrepancy', 'Discrepancy')
    ]
    TYPE_CHOICES = [
        ('Payment', 'Payment')
    ]

    date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Payment')
    reference = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.reference} - {self.amount} KES on {self.date}"