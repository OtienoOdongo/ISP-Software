from django.db import models

class MpesaTransaction(models.Model):
    """
    Model for storing M-Pesa transactions.

    Attributes:
        transaction_id (CharField): Unique identifier for the transaction.
        amount (DecimalField): Amount of the transaction in KES.
        status (CharField): Status of the transaction - 'Success', 'Pending', or 'Failed'.
        date (DateTimeField): Date and time when the transaction occurred.
        user (CharField): Name or identifier of the user associated with the transaction.
    """
    transaction_id = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('Success', 'Success'), 
                                                      ('Pending', 'Pending'), ('Failed', 'Failed')])
    date = models.DateTimeField()
    user = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.transaction_id} - {self.user}"