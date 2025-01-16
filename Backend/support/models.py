from django.db import models

class SupportTicket(models.Model):
    """Model for tracking user support tickets."""
    user = models.ForeignKey('user_management.UserProfile', on_delete=models.CASCADE, related_name='support_tickets')
    issue_description = models.TextField()
    status = models.CharField(max_length=50, choices=[('open', 'Open'), ('resolved', 'Resolved')], default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Support Ticket {self.id} ({self.status})"


class KnowledgeBase(models.Model):
    """Model for maintaining knowledge base articles."""
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class FirmwareUpdate(models.Model):
    """Model for managing firmware updates."""
    version = models.CharField(max_length=50)
    release_date = models.DateField()
    description = models.TextField()

    def __str__(self):
        return f"Firmware {self.version} (Released: {self.release_date})"
