from django.db import models

class MpesaConfig(models.Model):
    """
    Model to store M-Pesa configuration details.

    Attributes:
        apiKey (CharField): API key for M-Pesa services.
        secretKey (CharField): Secret key for secure authentication.
        shortCode (CharField): The business short code used for transactions.
        passKey (CharField): Pass key used for generating security credentials.
        callbackURL (URLField): URL where M-Pesa sends transaction status notifications.
        validationURL (URLField): URL where M-Pesa sends transaction validation requests.
    """
    apiKey = models.CharField(max_length=255)
    secretKey = models.CharField(max_length=255)
    shortCode = models.CharField(max_length=10)
    passKey = models.CharField(max_length=255)
    callbackURL = models.URLField()
    validationURL = models.URLField()

    def __str__(self):
        return f"M-Pesa Configuration - Short Code: {self.shortCode}"