"""
Activation Queue Model for dynamic activation processing
"""

from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from typing import Optional
import uuid
import logging

logger = logging.getLogger(__name__)


class ActivationQueue(models.Model):
    """
    Queue for subscription activations with dynamic prioritization
    """
    
    ACTIVATION_TYPES = (
        ('initial', 'Initial Activation'),
        ('renewal', 'Renewal Activation'),
        ('reactivation', 'Reactivation'),
        ('upgrade', 'Upgrade Activation'),
        ('emergency', 'Emergency Activation'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('retrying', 'Retrying'),
        ('cancelled', 'Cancelled'),
    )
    
    PRIORITY_LEVELS = (
        (1, 'Lowest'),
        (2, 'Low'),
        (3, 'Normal'),
        (4, 'High'),
        (5, 'Highest'),
        (6, 'Emergency'),
    )
    
    # Core Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Subscription Reference
    subscription = models.ForeignKey(
        'Subscription',
        on_delete=models.CASCADE,
        related_name='activation_requests'
    )
    
    # Queue Management
    priority = models.IntegerField(choices=PRIORITY_LEVELS, default=3, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    activation_type = models.CharField(max_length=20, choices=ACTIVATION_TYPES, default='initial')
    
    # Processing Information
    processor_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    started_at = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Retry Management
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    next_retry_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_error_at = models.DateTimeField(null=True, blank=True)
    
    # Error Handling
    error_message = models.TextField(blank=True, null=True)
    error_details = models.JSONField(default=dict, blank=True)
    
    # Performance Tracking
    estimated_duration_seconds = models.PositiveIntegerField(default=60)
    actual_duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    
    # Dynamic Configuration
    router_id = models.IntegerField(null=True, blank=True, db_index=True)
    network_config = models.JSONField(default=dict, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Activation Queue'
        verbose_name_plural = 'Activation Queue'
        ordering = ['-priority', 'created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['subscription', 'status']),
            models.Index(fields=['router_id', 'status']),
            models.Index(fields=['next_retry_at', 'status']),
            models.Index(fields=['created_at', 'status']),
        ]
    
    def __str__(self):
        return f"Activation {self.id} - {self.get_status_display()}"
    
    def clean(self):
        """Validate activation queue data"""
        errors = {}
        
        # Validate retry configuration
        if self.retry_count > self.max_retries:
            errors['retry_count'] = 'Retry count exceeds maximum retries'
        
        # Validate next retry time
        if self.next_retry_at and self.next_retry_at <= timezone.now():
            errors['next_retry_at'] = 'Next retry time must be in the future'
        
        if errors:
            raise ValidationError(errors)
    
    @property
    def can_process(self) -> bool:
        """Check if this activation can be processed"""
        return self.status in ['pending', 'retrying'] and (
            not self.next_retry_at or self.next_retry_at <= timezone.now()
        )
    
    @property
    def can_retry(self) -> bool:
        """Check if this activation can be retried"""
        return self.retry_count < self.max_retries
    
    @property
    def is_urgent(self) -> bool:
        """Check if this is an urgent activation"""
        return self.priority >= 5
    
    @property
    def processing_time_seconds(self) -> Optional[int]:
        """Calculate processing time in seconds"""
        if self.started_at and self.completed_at:
            return int((self.completed_at - self.started_at).total_seconds())
        elif self.started_at:
            return int((timezone.now() - self.started_at).total_seconds())
        return None
    
    def mark_processing(self, processor_id: str):
        """Mark activation as processing"""
        self.status = 'processing'
        self.processor_id = processor_id
        self.started_at = timezone.now()
        self.save()
        logger.info(f"Activation {self.id} marked as processing by {processor_id}")
    
    def mark_completed(self):
        """Mark activation as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        
        if self.started_at:
            self.actual_duration_seconds = int((self.completed_at - self.started_at).total_seconds())
        
        # Update subscription
        self.subscription.status = 'active'
        self.subscription.activation_successful = True
        self.subscription.activation_completed_at = timezone.now()
        self.subscription.save()
        
        self.save()
        logger.info(f"Activation {self.id} marked as completed")
    
    def mark_failed(self, error_message: str, error_details: dict = None, retry: bool = True):
        """Mark activation as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.error_details = error_details or {}
        self.last_error_at = timezone.now()
        
        if retry and self.can_retry:
            self.status = 'retrying'
            self.retry_count += 1
            # Exponential backoff: 5, 15, 45, 135 seconds
            delay = 5 * (3 ** (self.retry_count - 1))
            self.next_retry_at = timezone.now() + timezone.timedelta(seconds=delay)
            
            # Update subscription
            self.subscription.activation_attempts += 1
            self.subscription.activation_error = error_message
            self.subscription.save()
            
            logger.warning(f"Activation {self.id} failed, will retry in {delay}s: {error_message}")
        else:
            # Update subscription
            self.subscription.status = 'failed'
            self.subscription.activation_error = error_message
            self.subscription.save()
            
            logger.error(f"Activation {self.id} failed permanently: {error_message}")
        
        self.save()
    
    def schedule_retry(self, delay_seconds: int = 300):
        """Schedule a retry for this activation"""
        if not self.can_retry:
            raise ValidationError("Maximum retries exceeded")
        
        self.status = 'retrying'
        self.retry_count += 1
        self.next_retry_at = timezone.now() + timezone.timedelta(seconds=delay_seconds)
        self.save()
        logger.info(f"Activation {self.id} scheduled for retry in {delay_seconds}s")
    
    @classmethod
    def get_next_activation(cls, processor_id: str = None, priority_threshold: int = None):
        """Get next activation to process"""
        queryset = cls.objects.filter(status='pending').order_by('-priority', 'created_at')
        
        if priority_threshold:
            queryset = queryset.filter(priority__gte=priority_threshold)
        
        activation = queryset.first()
        
        if activation and processor_id:
            activation.mark_processing(processor_id)
        
        return activation
    
    @classmethod
    def get_retry_candidates(cls):
        """Get activations that need retrying"""
        return cls.objects.filter(
            status='retrying',
            next_retry_at__lte=timezone.now()
        ).order_by('-priority', 'next_retry_at')
    
    @classmethod
    def get_queue_stats(cls):
        """Get queue statistics"""
        stats = cls.objects.aggregate(
            total=models.Count('id'),
            pending=models.Count('id', filter=models.Q(status='pending')),
            processing=models.Count('id', filter=models.Q(status='processing')),
            failed=models.Count('id', filter=models.Q(status='failed')),
            retrying=models.Count('id', filter=models.Q(status='retrying')),
            avg_priority=models.Avg('priority', filter=models.Q(status='pending')),
        )
        
        return {
            'total': stats['total'] or 0,
            'pending': stats['pending'] or 0,
            'processing': stats['processing'] or 0,
            'failed': stats['failed'] or 0,
            'retrying': stats['retrying'] or 0,
            'avg_priority': round(stats['avg_priority'] or 0, 2),
            'timestamp': timezone.now().isoformat(),
        }