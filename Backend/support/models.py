from django.db import models
from user_management.models.user_profile import UserProfile

class FAQ(models.Model):
    """
    Model for storing FAQ entries in the Knowledge Base.

    Attributes:
        question (CharField): The question being asked.
        answer (TextField): The answer to the question.
    """
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question

class SupportTicket(models.Model):
    """
    Model for managing user support tickets.

    Attributes:
        user (ForeignKey): Reference to the UserProfile model for the user who submitted the ticket.
        issue (TextField): Description of the issue or problem.
        status (CharField): Current status of the ticket.
        date_created (DateTimeField): Date and time when the ticket was created.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    issue = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.issue[:50]}..."