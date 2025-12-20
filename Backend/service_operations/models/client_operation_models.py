"""
Client Operation Model for audit trail and dynamic operation tracking
"""

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from typing import Optional
import uuid
import logging

logger = logging.getLogger(__name__)


class ClientOperation(models.Model):
    """
    Tracks all client operations with dynamic categorization
    """
    
    OPERATION_TYPES = (
        ('plan_purchase', 'Plan Purchase'),
        ('plan_renewal', 'Plan Renewal'),
        ('plan_upgrade', 'Plan Upgrade'),
        ('payment_verification', 'Payment Verification'),
        ('activation_request', 'Activation Request'),
        ('usage_update', 'Usage Update'),
        ('client_support', 'Client Support'),
        ('profile_update', 'Profile Update'),
        ('credentials_reset', 'Credentials Reset'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    
    PRIORITY_LEVELS = (
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Urgent'),
        (5, 'Critical'),
    )
    
    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Client Reference
    client_id = models.UUIDField(db_index=True, help_text="Client ID from Authentication app")
    client_type = models.CharField(max_length=20, db_index=True, help_text="Client type (hotspot/pppoe)")
    
    # Related Objects
    subscription = models.ForeignKey(
        'Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='client_operations'
    )
    
    # Operation Details
    operation_type = models.CharField(max_length=50, choices=OPERATION_TYPES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    priority = models.IntegerField(choices=PRIORITY_LEVELS, default=2, db_index=True)
    
    # Operation Content
    title = models.CharField(max_length=200, help_text="Operation title")
    description = models.TextField(blank=True, help_text="Detailed description")
    
    # Source Information
    source_platform = models.CharField(
        max_length=50,
        choices=[
            ('hotspot_portal', 'Hotspot Captive Portal'),
            ('pppoe_portal', 'PPPoE Client Portal'),
            ('dashboard', 'Admin Dashboard'),
            ('api', 'API Integration'),
            ('router', 'Router Integration'),
        ],
        db_index=True,
        help_text="Platform where operation originated"
    )
    
    requested_at = models.DateTimeField(default=timezone.now, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Results
    result_data = models.JSONField(default=dict, blank=True, help_text="Operation result data")
    error_message = models.TextField(blank=True, null=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    # SLA Tracking
    sla_due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    sla_breached = models.BooleanField(default=False, db_index=True)
    
    # Dynamic Fields
    current_step = models.PositiveIntegerField(default=1)
    total_steps = models.PositiveIntegerField(default=1)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Client Operation'
        verbose_name_plural = 'Client Operations'
        ordering = ['-priority', '-requested_at']
        indexes = [
            models.Index(fields=['client_id', 'status']),
            models.Index(fields=['client_type', 'operation_type']),
            models.Index(fields=['source_platform', 'status']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['sla_due_at', 'sla_breached']),
        ]
    
    def __str__(self):
        return f"{self.get_operation_type_display()} - {self.title}"
    
    def clean(self):
        """Validate operation data"""
        errors = {}
        
        # Validate SLA date
        if self.sla_due_at and self.sla_due_at < self.requested_at:
            errors['sla_due_at'] = 'SLA due date cannot be before requested date'
        
        # Validate steps
        if self.current_step > self.total_steps:
            errors['current_step'] = 'Current step cannot exceed total steps'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation and SLA calculation"""
        self.full_clean()
        
        # Calculate SLA breach
        if self.sla_due_at and not self.sla_breached:
            if timezone.now() > self.sla_due_at and self.status not in ['completed', 'cancelled']:
                self.sla_breached = True
        
        super().save(*args, **kwargs)
    
    @property
    def is_completed(self) -> bool:
        """Check if operation is completed"""
        return self.status == 'completed'
    
    @property
    def duration_seconds(self) -> Optional[int]:
        """Calculate operation duration in seconds"""
        if self.started_at and self.completed_at:
            return int((self.completed_at - self.started_at).total_seconds())
        elif self.started_at:
            return int((timezone.now() - self.started_at).total_seconds())
        return None
    
    @property
    def progress_percentage(self) -> int:
        """Calculate progress percentage"""
        return min(100, int((self.current_step / max(1, self.total_steps)) * 100))
    
    def mark_in_progress(self):
        """Mark operation as in progress"""
        self.status = 'in_progress'
        self.started_at = timezone.now()
        self.save()
        logger.info(f"Operation {self.id} marked as in progress")
    
    def mark_completed(self, result_data: dict = None, error: str = None):
        """Mark operation as completed"""
        self.status = 'completed' if not error else 'failed'
        self.completed_at = timezone.now()
        
        if result_data:
            self.result_data = result_data
        
        if error:
            self.error_message = error
        
        self.save()
        logger.info(f"Operation {self.id} marked as {self.status}")
    
    def update_progress(self, current_step: int, total_steps: int = None):
        """Update operation progress"""
        self.current_step = current_step
        if total_steps:
            self.total_steps = total_steps
        self.save()
        logger.debug(f"Operation {self.id} progress: {self.current_step}/{self.total_steps}")
    
    @classmethod
    def create_plan_purchase_operation(cls, client_id: uuid.UUID, client_type: str, 
                                       subscription, payment_method: str, source: str):
        """Create plan purchase operation"""
        operation = cls.objects.create(
            client_id=client_id,
            client_type=client_type,
            subscription=subscription,
            operation_type='plan_purchase',
            title=f"Plan Purchase - {subscription.id}",
            description=f"Purchase via {payment_method} for {client_type} client",
            source_platform=source,
            priority=3,
            sla_due_at=timezone.now() + timezone.timedelta(minutes=30),
            metadata={
                'payment_method': payment_method,
                'plan_id': str(subscription.internet_plan_id),
                'client_type': client_type
            }
        )
        
        logger.info(f"Created plan purchase operation {operation.id}")
        return operation
    
    @classmethod
    def get_pending_operations(cls, client_type: str = None, limit: int = 50):
        """Get pending operations"""
        queryset = cls.objects.filter(status='pending').order_by('-priority')
        
        if client_type:
            queryset = queryset.filter(client_type=client_type)
        
        return queryset[:limit]