from django.db import models

class DiagnosticResult(models.Model):
    """
    Model to store results of different network diagnostics tests.

    Attributes:
        test_type (CharField): Type of the diagnostic test (e.g., 'ping', 'traceroute').
        target (CharField): The target address or domain for the diagnostic test.
        result (TextField): The outcome or data from the diagnostic test.
        status (CharField): Status of the test result ('success', 'error', 'idle').
        timestamp (DateTimeField): Time when the diagnostic was run.
    """
    TEST_CHOICES = [
        ('ping', 'Ping'),
        ('traceroute', 'Traceroute'),
        ('health_check', 'Health Check'),
        ('bandwidth', 'Bandwidth'),
        ('dns', 'DNS'),
    ]
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('idle', 'Idle'),
    ]

    test_type = models.CharField(max_length=20, choices=TEST_CHOICES)
    target = models.CharField(max_length=255)
    result = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='idle')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.test_type} to {self.target} - {self.status}"