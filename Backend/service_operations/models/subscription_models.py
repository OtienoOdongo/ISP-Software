# """
# Production-ready Subscription Model with dynamic client types and access methods
# Integrated with MikroTik routers and multiple payment gateways
# """

# from django.db import models
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from django.core.cache import cache
# from django.db import transaction
# import uuid
# import logging
# from typing import Optional, Dict, Any, List
# from decimal import Decimal

# logger = logging.getLogger(__name__)


# class Subscription(models.Model):
#     """
#     Subscription linking clients to internet plans with dual client type support
#     Production-ready with comprehensive lifecycle management
#     """
    
#     STATUS_CHOICES = (
#         ('draft', 'Draft'),
#         ('pending_payment', 'Pending Payment'),
#         ('pending_activation', 'Pending Activation'),
#         ('active', 'Active'),
#         ('expired', 'Expired'),
#         ('suspended', 'Suspended'),
#         ('cancelled', 'Cancelled'),
#         ('failed', 'Activation Failed'),
#         ('processing', 'Processing'),
#     )
    
#     ACCESS_METHOD_CHOICES = (
#         ('hotspot', 'Hotspot (WiFi)'),
#         ('pppoe', 'PPPoE (Ethernet)'),
#     )
    
#     CLIENT_TYPE_CHOICES = (
#         ('hotspot_client', 'Hotspot Client'),
#         ('pppoe_client', 'PPPoE Client'),
#     )
    
#     # Core Identification
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
#     # Client References (UUID from auth app)
#     client_id = models.UUIDField(
#         db_index=True,
#         null=True,
#         blank=True,
#         help_text="Client ID from Authentication app"
#     )
    
#     # Plan Reference
#     internet_plan_id = models.UUIDField(
#         db_index=True,
#         help_text="Plan ID from Internet Plans app"
#     )
    
#     # Client Type & Access Method
#     client_type = models.CharField(
#         max_length=20,
#         choices=CLIENT_TYPE_CHOICES,
#         db_index=True,
#         help_text="Type of client (hotspot or pppoe)"
#     )
    
#     access_method = models.CharField(
#         max_length=10,
#         choices=ACCESS_METHOD_CHOICES,
#         default='hotspot',
#         db_index=True,
#         help_text="Access method for this subscription"
#     )
    
#     # Status Management
#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default='draft',
#         db_index=True,
#         help_text="Subscription status"
#     )
    
#     # Network Configuration (Router Integration)
#     router_id = models.IntegerField(
#         null=True,
#         blank=True,
#         db_index=True,
#         help_text="Router ID from Network Management app"
#     )
    
#     # Client-specific network credentials
#     hotspot_mac_address = models.CharField(
#         max_length=17,
#         blank=True,
#         null=True,
#         db_index=True,
#         help_text="MAC address for hotspot clients"
#     )
    
#     pppoe_username = models.CharField(
#         max_length=50,
#         blank=True,
#         null=True,
#         db_index=True,
#         help_text="PPPoE username (auto-generated)"
#     )
    
#     pppoe_password = models.CharField(
#         max_length=100,
#         blank=True,
#         null=True,
#         help_text="PPPoE password (auto-generated)"
#     )
    
#     # Payment Integration
#     payment_reference = models.CharField(
#         max_length=100,
#         db_index=True,
#         null=True,
#         blank=True,
#         help_text="Payment transaction reference"
#     )
    
#     payment_method = models.CharField(
#         max_length=50,
#         blank=True,
#         null=True,
#         help_text="Payment method used (mpesa_till, mpesa_paybill, paypal, bank)"
#     )
    
#     payment_confirmed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
#     # Time Management
#     start_date = models.DateTimeField(default=timezone.now, db_index=True)
#     end_date = models.DateTimeField(db_index=True, null=True, blank=True)
#     scheduled_activation = models.DateTimeField(null=True, blank=True, db_index=True)
    
#     # Usage Tracking
#     used_data_bytes = models.BigIntegerField(default=0)
#     used_time_seconds = models.BigIntegerField(default=0)
#     data_limit_bytes = models.BigIntegerField(default=0)
#     time_limit_seconds = models.BigIntegerField(default=0)
    
#     # Activation Tracking
#     activation_attempts = models.PositiveIntegerField(default=0)
#     activation_successful = models.BooleanField(default=False)
#     activation_error = models.TextField(blank=True, null=True)
#     activation_completed_at = models.DateTimeField(null=True, blank=True)
    
#     # Auto-renewal
#     auto_renew = models.BooleanField(default=False)
    
#     # Parent subscription for renewals
#     parent_subscription = models.ForeignKey(
#         'self',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='renewals'
#     )
    
#     # Metadata
#     metadata = models.JSONField(default=dict, blank=True)
    
#     # System tracking
#     is_active = models.BooleanField(default=True, db_index=True)
#     created_at = models.DateTimeField(auto_now_add=True, db_index=True)
#     updated_at = models.DateTimeField(auto_now=True, db_index=True)
#     last_usage_update = models.DateTimeField(null=True, blank=True)
    
#     class Meta:
#         verbose_name = 'Subscription'
#         verbose_name_plural = 'Subscriptions'
#         ordering = ['-created_at']
#         indexes = [
#             # Performance indexes
#             models.Index(fields=['client_id', 'is_active']),
#             models.Index(fields=['client_type', 'status']),
#             models.Index(fields=['access_method', 'status']),
#             models.Index(fields=['router_id', 'status']),
#             models.Index(fields=['payment_reference']),
#             models.Index(fields=['status', 'is_active']),
#             models.Index(fields=['end_date', 'status']),
#             models.Index(fields=['hotspot_mac_address', 'status']),
#             models.Index(fields=['pppoe_username', 'status']),
#             # Composite indexes for common queries
#             models.Index(fields=['client_id', 'status', 'is_active']),
#             models.Index(fields=['client_type', 'access_method', 'status']),
#         ]
    
#     def __str__(self):
#         return f"{self.get_client_type_display()}: {self.id} ({self.get_status_display()})"
    
#     def clean(self):
#         """Validate subscription data"""
#         errors = {}
        
#         # Validate client type and access method consistency
#         if self.client_type == 'hotspot_client' and self.access_method != 'hotspot':
#             errors['access_method'] = 'Hotspot clients must use hotspot access method'
#         if self.client_type == 'pppoe_client' and self.access_method != 'pppoe':
#             errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
#         # Validate MAC address for hotspot
#         if self.access_method == 'hotspot' and self.hotspot_mac_address:
#             if not self._validate_mac_address(self.hotspot_mac_address):
#                 errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
#         # Validate PPPoE credentials
#         if self.access_method == 'pppoe':
#             if not self.pppoe_username:
#                 errors['pppoe_username'] = 'PPPoE username is required for PPPoE subscriptions'
#             if not self.pppoe_password:
#                 errors['pppoe_password'] = 'PPPoE password is required for PPPoE subscriptions'
        
#         # Validate end date
#         if self.end_date and self.end_date <= self.start_date:
#             errors['end_date'] = 'End date must be after start date'
        
#         if errors:
#             raise ValidationError(errors)
    
#     def save(self, *args, **kwargs):
#         """Save with validation and cache invalidation"""
#         # Pre-save validation
#         self.full_clean()
        
#         # Auto-generate PPPoE credentials if needed
#         if self.access_method == 'pppoe' and not self.pppoe_username:
#             self.pppoe_username = f"pppoe_{self.client_id}_{uuid.uuid4().hex[:8]}"
#         if self.access_method == 'pppoe' and not self.pppoe_password:
#             self.pppoe_password = uuid.uuid4().hex[:12]
        
#         # Update cache
#         self._invalidate_cache()
        
#         super().save(*args, **kwargs)
    
#     def _invalidate_cache(self):
#         """Invalidate related cache entries"""
#         cache.delete(f"subscription:{self.id}")
#         cache.delete_pattern(f"subscriptions:client:{self.client_id}:*")
#         cache.delete_pattern(f"subscriptions:router:{self.router_id}:*" if self.router_id else "")
    
#     def _validate_mac_address(self, mac: str) -> bool:
#         """Validate MAC address format"""
#         import re
#         mac_pattern = r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'
#         return bool(re.match(mac_pattern, mac))
    
#     # Dynamic Properties
#     @property
#     def remaining_data_bytes(self) -> int:
#         """Calculate remaining data"""
#         if self.data_limit_bytes == 0:  # Unlimited
#             return float('inf')
#         return max(0, self.data_limit_bytes - self.used_data_bytes)
    
#     @property
#     def remaining_time_seconds(self) -> int:
#         """Calculate remaining time"""
#         if self.time_limit_seconds == 0:  # Unlimited
#             return float('inf')
#         return max(0, self.time_limit_seconds - self.used_time_seconds)
    
#     @property
#     def is_expired(self) -> bool:
#         """Check if subscription is expired"""
#         if not self.end_date:
#             return False
#         return timezone.now() > self.end_date
    
#     @property
#     def can_be_activated(self) -> bool:
#         """Check if subscription can be activated"""
#         return (
#             self.status in ['pending_activation', 'active', 'suspended'] and
#             self.is_active and
#             not self.is_expired and
#             self.remaining_data_bytes > 0 and
#             self.remaining_time_seconds > 0
#         )
    
#     @property
#     def is_hotspot_client(self) -> bool:
#         """Check if this is a hotspot client"""
#         return self.client_type == 'hotspot_client'
    
#     @property
#     def is_pppoe_client(self) -> bool:
#         """Check if this is a PPPoE client"""
#         return self.client_type == 'pppoe_client'
    
#     @property
#     def usage_percentage(self) -> Dict[str, float]:
#         """Calculate usage percentages"""
#         data_percent = 0.0
#         time_percent = 0.0
        
#         if self.data_limit_bytes > 0:
#             data_percent = min(100.0, (self.used_data_bytes / self.data_limit_bytes) * 100)
        
#         if self.time_limit_seconds > 0:
#             time_percent = min(100.0, (self.used_time_seconds / self.time_limit_seconds) * 100)
        
#         return {
#             'data': round(data_percent, 2),
#             'time': round(time_percent, 2)
#         }
    
#     # Business Logic Methods
#     def mark_payment_confirmed(self, payment_reference: str, payment_method: str):
#         """Mark payment as confirmed and ready for activation"""
#         self.payment_reference = payment_reference
#         self.payment_method = payment_method
#         self.payment_confirmed_at = timezone.now()
#         self.status = 'pending_activation'
        
#         with transaction.atomic():
#             self.save()
            
#             # Create activation request
#             from .activation_queue import ActivationQueue
#             ActivationQueue.objects.create(
#                 subscription=self,
#                 priority=3 if self.client_type == 'hotspot_client' else 2,
#                 metadata={
#                     'client_type': self.client_type,
#                     'access_method': self.access_method,
#                     'payment_method': payment_method
#                 }
#             )
        
#         logger.info(f"Payment confirmed for subscription {self.id}")
#         return self
    
#     def request_activation(self):
#         """Request activation for this subscription"""
#         if not self.can_be_activated:
#             raise ValidationError("Subscription cannot be activated")
        
#         from .activation_queue import ActivationQueue
#         ActivationQueue.objects.create(
#             subscription=self,
#             priority=3 if self.client_type == 'hotspot_client' else 2
#         )
        
#         logger.info(f"Activation requested for subscription {self.id}")
#         return self
    
#     def update_usage(self, data_used_bytes: int, time_used_seconds: int):
#         """Update usage statistics"""
#         with transaction.atomic():
#             self.used_data_bytes += data_used_bytes
#             self.used_time_seconds += time_used_seconds
#             self.last_usage_update = timezone.now()
            
#             # Check if limits exceeded
#             if (self.remaining_data_bytes <= 0 and self.data_limit_bytes > 0) or \
#                (self.remaining_time_seconds <= 0 and self.time_limit_seconds > 0):
#                 self.status = 'suspended'
            
#             self.save()
            
#             # Create usage tracking record
#             UsageTracking.objects.create(
#                 subscription=self,
#                 data_used_bytes=data_used_bytes,
#                 time_used_seconds=time_used_seconds
#             )
        
#         logger.info(f"Usage updated for subscription {self.id}")
#         return self
    
#     def renew(self, new_plan_id: Optional[uuid.UUID] = None):
#         """Renew subscription with optional plan upgrade"""
#         if not self.can_be_activated:
#             raise ValidationError("Subscription cannot be renewed")
        
#         with transaction.atomic():
#             # Create new subscription based on current
#             new_subscription = Subscription.objects.create(
#                 client_id=self.client_id,
#                 internet_plan_id=new_plan_id or self.internet_plan_id,
#                 client_type=self.client_type,
#                 access_method=self.access_method,
#                 router_id=self.router_id,
#                 hotspot_mac_address=self.hotspot_mac_address,
#                 pppoe_username=self.pppoe_username,
#                 pppoe_password=self.pppoe_password,
#                 status='draft',
#                 parent_subscription=self
#             )
            
#             # Mark current as expired or cancelled
#             self.status = 'expired'
#             self.save()
        
#         logger.info(f"Subscription {self.id} renewed as {new_subscription.id}")
#         return new_subscription
    
#     # Class Methods for Dynamic Queries
#     @classmethod
#     def get_active_for_client(cls, client_id: uuid.UUID, client_type: str = None):
#         """Get active subscriptions for a client"""
#         queryset = cls.objects.filter(
#             client_id=client_id,
#             is_active=True,
#             status='active'
#         )
        
#         if client_type:
#             queryset = queryset.filter(client_type=client_type)
        
#         return queryset
    
#     @classmethod
#     def get_by_hotspot_mac(cls, mac_address: str):
#         """Get active hotspot subscription by MAC address"""
#         return cls.objects.filter(
#             hotspot_mac_address=mac_address,
#             client_type='hotspot_client',
#             status='active',
#             is_active=True
#         ).first()
    
#     @classmethod
#     def get_by_pppoe_username(cls, username: str):
#         """Get active PPPoE subscription by username"""
#         return cls.objects.filter(
#             pppoe_username=username,
#             client_type='pppoe_client',
#             status='active',
#             is_active=True
#         ).first()
    
#     @classmethod
#     def get_expiring_soon(cls, hours: int = 24):
#         """Get subscriptions expiring soon"""
#         threshold = timezone.now() + timezone.timedelta(hours=hours)
#         return cls.objects.filter(
#             status='active',
#             is_active=True,
#             end_date__lte=threshold,
#             end_date__gt=timezone.now()
#         )
    
#     @classmethod
#     def get_needing_activation(cls):
#         """Get subscriptions needing activation"""
#         return cls.objects.filter(
#             status='pending_activation',
#             is_active=True,
#             payment_confirmed_at__isnull=False
#         )


# class UsageTracking(models.Model):
#     """
#     Detailed usage tracking for subscriptions
#     """
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     subscription = models.ForeignKey(
#         Subscription,
#         on_delete=models.CASCADE,
#         related_name='usage_records'
#     )
    
#     # Usage data
#     data_used_bytes = models.BigIntegerField(default=0)
#     time_used_seconds = models.BigIntegerField(default=0)
    
#     # Session info
#     session_start = models.DateTimeField(default=timezone.now)
#     session_end = models.DateTimeField(default=timezone.now)
    
#     # Network metrics
#     peak_data_rate = models.IntegerField(default=0)  # bps
#     avg_data_rate = models.IntegerField(default=0)   # bps
    
#     # Metadata
#     metadata = models.JSONField(default=dict, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = 'Usage Tracking'
#         verbose_name_plural = 'Usage Tracking Records'
#         ordering = ['-session_start']
#         indexes = [
#             models.Index(fields=['subscription', 'session_start']),
#             models.Index(fields=['session_start', 'session_end']),
#         ]
    
#     def __str__(self):
#         return f"Usage for {self.subscription.id}"
    
#     @property
#     def session_duration_seconds(self) -> int:
#         """Calculate session duration"""
#         return int((self.session_end - self.session_start).total_seconds())
    
#     @classmethod
#     def get_daily_summary(cls, subscription_id: uuid.UUID, date=None):
#         """Get daily usage summary for a subscription"""
#         if not date:
#             date = timezone.now().date()
        
#         day_start = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
#         day_end = day_start + timezone.timedelta(days=1)
        
#         records = cls.objects.filter(
#             subscription_id=subscription_id,
#             session_start__gte=day_start,
#             session_start__lt=day_end
#         )
        
#         total_data = sum(r.data_used_bytes for r in records)
#         total_time = sum(r.session_duration_seconds for r in records)
        
#         return {
#             'date': date.isoformat(),
#             'data_used_bytes': total_data,
#             'time_used_seconds': total_time,
#             'sessions': len(records),
#             'avg_data_rate': sum(r.avg_data_rate for r in records) / len(records) if records else 0
#         }







"""
Production-ready Subscription Models with dynamic client types and access methods
Integrated with MikroTik routers and multiple payment gateways
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
import uuid
import logging
import re
from typing import Optional, Dict, Any, List
from datetime import timedelta

logger = logging.getLogger(__name__)


class BaseModel(models.Model):
    """Base model with common fields and methods"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        abstract = True


class Subscription(BaseModel):
    """
    Subscription linking clients to internet plans with dual client type support
    Production-ready with comprehensive lifecycle management
    """
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending_payment', 'Pending Payment'),
        ('pending_activation', 'Pending Activation'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Activation Failed'),
        ('processing', 'Processing'),
    )
    
    ACCESS_METHOD_CHOICES = (
        ('hotspot', 'Hotspot (WiFi)'),
        ('pppoe', 'PPPoE (Ethernet)'),
    )
    
    CLIENT_TYPE_CHOICES = (
        ('hotspot_client', 'Hotspot Client'),
        ('pppoe_client', 'PPPoE Client'),
    )
    
    # Client References (UUID from auth app)
    client_id = models.UUIDField(
        db_index=True,
        null=False,
        blank=False,
        help_text="Client ID from Authentication app"
    )
    
    # Plan Reference
    internet_plan_id = models.UUIDField(
        db_index=True,
        null=False,
        blank=False,
        help_text="Plan ID from Internet Plans app"
    )
    
    # Client Type & Access Method
    client_type = models.CharField(
        max_length=20,
        choices=CLIENT_TYPE_CHOICES,
        db_index=True,
        null=False,
        blank=False,
        help_text="Type of client (hotspot or pppoe)"
    )
    
    access_method = models.CharField(
        max_length=10,
        choices=ACCESS_METHOD_CHOICES,
        default='hotspot',
        db_index=True,
        help_text="Access method for this subscription"
    )
    
    # Status Management
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True,
        help_text="Subscription status"
    )
    
    # Network Configuration (Router Integration)
    router_id = models.IntegerField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Router ID from Network Management app"
    )
    
    # Client-specific network credentials
    hotspot_mac_address = models.CharField(
        max_length=17,
        blank=True,
        null=True,
        db_index=True,
        help_text="MAC address for hotspot clients"
    )
    
    pppoe_username = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_index=True,
        help_text="PPPoE username (auto-generated)"
    )
    
    pppoe_password = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="PPPoE password (auto-generated)"
    )
    
    # Payment Integration
    payment_reference = models.CharField(
        max_length=100,
        db_index=True,
        null=True,
        blank=True,
        help_text="Payment transaction reference"
    )
    
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Payment method used (mpesa_till, mpesa_paybill, paypal, bank)"
    )
    
    payment_confirmed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Time Management
    start_date = models.DateTimeField(default=timezone.now, db_index=True)
    end_date = models.DateTimeField(db_index=True, null=True, blank=True)
    scheduled_activation = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Duration Management
    duration_hours = models.IntegerField(
        default=24,
        help_text="Subscription duration in hours"
    )
    
    # Usage Tracking
    used_data_bytes = models.BigIntegerField(default=0)
    used_time_seconds = models.BigIntegerField(default=0)
    data_limit_bytes = models.BigIntegerField(default=0)
    time_limit_seconds = models.BigIntegerField(default=0)
    
    # Activation Tracking
    activation_attempts = models.PositiveIntegerField(default=0)
    activation_successful = models.BooleanField(default=False)
    activation_error = models.TextField(blank=True, null=True)
    activation_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Auto-renewal
    auto_renew = models.BooleanField(default=False)
    
    # Parent subscription for renewals
    parent_subscription = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='renewals'
    )
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # System tracking
    last_usage_update = models.DateTimeField(null=True, blank=True)
    
    # Additional fields for suspension/extensions
    suspension_reason = models.TextField(blank=True, null=True)
    suspended_by = models.CharField(max_length=100, blank=True, null=True)
    suspended_at = models.DateTimeField(null=True, blank=True)
    scheduled_suspend = models.DateTimeField(null=True, blank=True)
    reactivation_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-created_at']
        indexes = [
            # Performance indexes
            models.Index(fields=['client_id', 'is_active']),
            models.Index(fields=['client_type', 'status']),
            models.Index(fields=['access_method', 'status']),
            models.Index(fields=['router_id', 'status']),
            models.Index(fields=['payment_reference']),
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['end_date', 'status']),
            models.Index(fields=['hotspot_mac_address', 'status']),
            models.Index(fields=['pppoe_username', 'status']),
            # Composite indexes for common queries
            models.Index(fields=['client_id', 'status', 'is_active']),
            models.Index(fields=['client_type', 'access_method', 'status']),
        ]
    
    def __str__(self):
        return f"{self.get_client_type_display()}: {self.id} ({self.get_status_display()})"
    
    def clean(self):
        """Validate subscription data"""
        errors = {}
        
        # Validate client type and access method consistency
        if self.client_type == 'hotspot_client' and self.access_method != 'hotspot':
            errors['access_method'] = 'Hotspot clients must use hotspot access method'
        if self.client_type == 'pppoe_client' and self.access_method != 'pppoe':
            errors['access_method'] = 'PPPoE clients must use PPPoE access method'
        
        # Validate MAC address for hotspot
        if self.access_method == 'hotspot' and self.hotspot_mac_address:
            if not self._validate_mac_address(self.hotspot_mac_address):
                errors['hotspot_mac_address'] = 'Invalid MAC address format'
        
        # Validate duration
        if self.duration_hours < 1 or self.duration_hours > 744:  # Max 31 days
            errors['duration_hours'] = 'Duration must be between 1 and 744 hours'
        
        # Validate end date
        if self.end_date and self.end_date <= self.start_date:
            errors['end_date'] = 'End date must be after start date'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation and cache invalidation"""
        # Pre-save validation
        self.full_clean()
        
        # Auto-generate PPPoE credentials if needed
        if self.access_method == 'pppoe':
            if not self.pppoe_username:
                self.pppoe_username = f"pppoe_{self.client_id}_{uuid.uuid4().hex[:8]}"
            if not self.pppoe_password:
                self.pppoe_password = uuid.uuid4().hex[:12]
        
        # Calculate end date if not set and duration is provided
        if self.end_date is None and self.duration_hours:
            self.end_date = self.start_date + timedelta(hours=self.duration_hours)
        
        # Update cache
        self._invalidate_cache()
        
        super().save(*args, **kwargs)
    
    def _invalidate_cache(self):
        """Invalidate related cache entries"""
        try:
            cache.delete(f"subscription:{self.id}")
            # Redis-specific pattern deletion
            if hasattr(cache, 'delete_pattern'):
                cache.delete_pattern(f"subscriptions:client:{self.client_id}:*")
                if self.router_id:
                    cache.delete_pattern(f"subscriptions:router:{self.router_id}:*")
        except Exception as e:
            logger.warning(f"Cache invalidation failed: {e}")
    
    def _validate_mac_address(self, mac: str) -> bool:
        """Validate MAC address format"""
        mac_pattern = r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'
        return bool(re.match(mac_pattern, mac))
    
    # Dynamic Properties
    @property
    def remaining_data_bytes(self) -> int:
        """Calculate remaining data"""
        if self.data_limit_bytes == 0:  # Unlimited
            return float('inf')
        return max(0, self.data_limit_bytes - self.used_data_bytes)
    
    @property
    def remaining_time_seconds(self) -> int:
        """Calculate remaining time"""
        if self.time_limit_seconds == 0:  # Unlimited
            return float('inf')
        return max(0, self.time_limit_seconds - self.used_time_seconds)
    
    @property
    def is_expired(self) -> bool:
        """Check if subscription is expired"""
        if not self.end_date:
            return False
        return timezone.now() > self.end_date
    
    @property
    def can_be_activated(self) -> bool:
        """Check if subscription can be activated"""
        return (
            self.status in ['pending_activation', 'active', 'suspended'] and
            self.is_active and
            not self.is_expired and
            self.remaining_data_bytes > 0 and
            self.remaining_time_seconds > 0
        )
    
    @property
    def is_hotspot_client(self) -> bool:
        """Check if this is a hotspot client"""
        return self.client_type == 'hotspot_client'
    
    @property
    def is_pppoe_client(self) -> bool:
        """Check if this is a PPPoE client"""
        return self.client_type == 'pppoe_client'
    
    @property
    def usage_percentage(self) -> Dict[str, float]:
        """Calculate usage percentages"""
        data_percent = 0.0
        time_percent = 0.0
        
        if self.data_limit_bytes > 0:
            data_percent = min(100.0, (self.used_data_bytes / self.data_limit_bytes) * 100)
        
        if self.time_limit_seconds > 0:
            time_percent = min(100.0, (self.used_time_seconds / self.time_limit_seconds) * 100)
        
        return {
            'data': round(data_percent, 2),
            'time': round(time_percent, 2)
        }
    
    # Business Logic Methods
    def mark_payment_confirmed(self, payment_reference: str, payment_method: str):
        """Mark payment as confirmed and ready for activation"""
        self.payment_reference = payment_reference
        self.payment_method = payment_method
        self.payment_confirmed_at = timezone.now()
        self.status = 'pending_activation'
        
        with transaction.atomic():
            self.save()
        
        logger.info(f"Payment confirmed for subscription {self.id}")
        return self
    
    def request_activation(self):
        """Request activation for this subscription"""
        if not self.can_be_activated:
            raise ValidationError("Subscription cannot be activated")
        
        self.status = 'processing'
        self.save()
        
        logger.info(f"Activation requested for subscription {self.id}")
        return self
    
    def update_usage(self, data_used_bytes: int, time_used_seconds: int):
        """Update usage statistics"""
        with transaction.atomic():
            self.used_data_bytes += data_used_bytes
            self.used_time_seconds += time_used_seconds
            self.last_usage_update = timezone.now()
            
            # Check if limits exceeded
            if (self.remaining_data_bytes <= 0 and self.data_limit_bytes > 0) or \
               (self.remaining_time_seconds <= 0 and self.time_limit_seconds > 0):
                self.status = 'suspended'
                self.suspension_reason = 'Usage limit exceeded'
                self.suspended_by = 'system'
                self.suspended_at = timezone.now()
            
            self.save()
        
        logger.info(f"Usage updated for subscription {self.id}")
        return self
    
    def renew(self, new_plan_id: Optional[uuid.UUID] = None, duration_hours: Optional[int] = None):
        """Renew subscription with optional plan upgrade"""
        if not self.can_be_activated:
            raise ValidationError("Subscription cannot be renewed")
        
        with transaction.atomic():
            # Create new subscription based on current
            new_subscription = Subscription.objects.create(
                client_id=self.client_id,
                internet_plan_id=new_plan_id or self.internet_plan_id,
                client_type=self.client_type,
                access_method=self.access_method,
                router_id=self.router_id,
                hotspot_mac_address=self.hotspot_mac_address,
                pppoe_username=self.pppoe_username,
                pppoe_password=self.pppoe_password,
                status='draft',
                parent_subscription=self,
                duration_hours=duration_hours or self.duration_hours,
                data_limit_bytes=self.data_limit_bytes,
                time_limit_seconds=self.time_limit_seconds,
                auto_renew=self.auto_renew
            )
            
            # Mark current as expired or cancelled
            self.status = 'expired'
            self.save()
        
        logger.info(f"Subscription {self.id} renewed as {new_subscription.id}")
        return new_subscription
    
    def suspend(self, reason: str, suspended_by: str, duration_days: Optional[int] = None):
        """Suspend subscription"""
        self.status = 'suspended'
        self.suspension_reason = reason
        self.suspended_by = suspended_by
        self.suspended_at = timezone.now()
        
        if duration_days:
            self.reactivation_date = timezone.now() + timedelta(days=duration_days)
        
        self.save()
        logger.info(f"Subscription {self.id} suspended by {suspended_by}")
        return self
    
    def extend(self, extension_days: Optional[int] = None, 
               extension_hours: Optional[int] = None,
               new_end_date: Optional[timezone.datetime] = None):
        """Extend subscription duration"""
        if new_end_date:
            self.end_date = new_end_date
        elif extension_days:
            self.end_date = self.end_date + timedelta(days=extension_days) if self.end_date else timezone.now() + timedelta(days=extension_days)
        elif extension_hours:
            self.end_date = self.end_date + timedelta(hours=extension_hours) if self.end_date else timezone.now() + timedelta(hours=extension_hours)
        
        self.save()
        logger.info(f"Subscription {self.id} extended")
        return self
    
    # Class Methods for Dynamic Queries
    @classmethod
    def get_active_for_client(cls, client_id: uuid.UUID, client_type: str = None):
        """Get active subscriptions for a client"""
        queryset = cls.objects.filter(
            client_id=client_id,
            is_active=True,
            status='active'
        )
        
        if client_type:
            queryset = queryset.filter(client_type=client_type)
        
        return queryset
    
    @classmethod
    def get_by_hotspot_mac(cls, mac_address: str):
        """Get active hotspot subscription by MAC address"""
        return cls.objects.filter(
            hotspot_mac_address=mac_address,
            client_type='hotspot_client',
            status='active',
            is_active=True
        ).first()
    
    @classmethod
    def get_by_pppoe_username(cls, username: str):
        """Get active PPPoE subscription by username"""
        return cls.objects.filter(
            pppoe_username=username,
            client_type='pppoe_client',
            status='active',
            is_active=True
        ).first()
    
    @classmethod
    def get_expiring_soon(cls, hours: int = 24):
        """Get subscriptions expiring soon"""
        threshold = timezone.now() + timedelta(hours=hours)
        return cls.objects.filter(
            status='active',
            is_active=True,
            end_date__lte=threshold,
            end_date__gt=timezone.now()
        )
    
    @classmethod
    def get_needing_activation(cls):
        """Get subscriptions needing activation"""
        return cls.objects.filter(
            status='pending_activation',
            is_active=True,
            payment_confirmed_at__isnull=False
        )


class UsageTracking(BaseModel):
    """
    Detailed usage tracking for subscriptions
    """
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='usage_records'
    )
    
    # Usage data
    data_used_bytes = models.BigIntegerField(default=0)
    time_used_seconds = models.BigIntegerField(default=0)
    
    # Session info
    session_start = models.DateTimeField(default=timezone.now)
    session_end = models.DateTimeField(default=timezone.now)
    
    # Network metrics
    peak_data_rate = models.IntegerField(default=0)  # bps
    avg_data_rate = models.IntegerField(default=0)   # bps
    
    # Session tracking
    session_id = models.CharField(max_length=100, blank=True, null=True)
    device_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    network_metrics = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Usage Tracking'
        verbose_name_plural = 'Usage Tracking Records'
        ordering = ['-session_start']
        indexes = [
            models.Index(fields=['subscription', 'session_start']),
            models.Index(fields=['session_start', 'session_end']),
            models.Index(fields=['session_id']),
            models.Index(fields=['device_id']),
        ]
    
    def __str__(self):
        return f"Usage for {self.subscription.id}"
    
    @property
    def session_duration_seconds(self) -> int:
        """Calculate session duration"""
        return int((self.session_end - self.session_start).total_seconds())
    
    @classmethod
    def get_daily_summary(cls, subscription_id: uuid.UUID, date=None):
        """Get daily usage summary for a subscription"""
        if not date:
            date = timezone.now().date()
        
        day_start = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
        day_end = day_start + timedelta(days=1)
        
        records = cls.objects.filter(
            subscription_id=subscription_id,
            session_start__gte=day_start,
            session_start__lt=day_end
        )
        
        total_data = sum(r.data_used_bytes for r in records)
        total_time = sum(r.session_duration_seconds for r in records)
        
        return {
            'date': date.isoformat(),
            'data_used_bytes': total_data,
            'time_used_seconds': total_time,
            'sessions': len(records),
            'avg_data_rate': sum(r.avg_data_rate for r in records) / len(records) if records else 0
        }


class ActivationQueue(BaseModel):
    """
    Queue for managing subscription activations
    """
    
    ACTIVATION_TYPES = (
        ('initial', 'Initial Activation'),
        ('renewal', 'Renewal Activation'),
        ('reactivation', 'Reactivation'),
        ('migration', 'Plan Migration'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('retrying', 'Retrying'),
        ('cancelled', 'Cancelled'),
    )
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='activation_requests'
    )
    
    activation_type = models.CharField(
        max_length=20,
        choices=ACTIVATION_TYPES,
        default='initial'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    priority = models.IntegerField(
        default=3,
        help_text="Priority level (1=highest, 5=lowest)"
    )
    
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    
    error_message = models.TextField(blank=True, null=True)
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Activation Queue'
        verbose_name_plural = 'Activation Queue'
        ordering = ['priority', 'created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['subscription', 'status']),
            models.Index(fields=['created_at', 'status']),
        ]
    
    def __str__(self):
        return f"Activation for {self.subscription.id} ({self.status})"
    
    @property
    def processing_duration_seconds(self) -> Optional[int]:
        """Calculate processing duration"""
        if self.processing_started_at and self.processing_completed_at:
            return int((self.processing_completed_at - self.processing_started_at).total_seconds())
        return None


class ClientOperation(BaseModel):
    """
    Client operation tracking for audit and history
    """
    
    OPERATION_TYPES = (
        ('subscription_create', 'Subscription Created'),
        ('subscription_update', 'Subscription Updated'),
        ('subscription_activate', 'Subscription Activated'),
        ('subscription_suspend', 'Subscription Suspended'),
        ('subscription_renew', 'Subscription Renewed'),
        ('subscription_extend', 'Subscription Extended'),
        ('subscription_cancel', 'Subscription Cancelled'),
        ('usage_update', 'Usage Updated'),
        ('payment_confirmed', 'Payment Confirmed'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    client_id = models.UUIDField(db_index=True)
    client_type = models.CharField(max_length=20, choices=Subscription.CLIENT_TYPE_CHOICES)
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='client_operations',
        null=True,
        blank=True
    )
    
    operation_type = models.CharField(max_length=30, choices=OPERATION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    priority = models.IntegerField(default=3)
    source_platform = models.CharField(max_length=50, default='dashboard')
    
    sla_hours = models.IntegerField(default=24, help_text="SLA in hours")
    
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = 'Client Operation'
        verbose_name_plural = 'Client Operations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['client_id', 'created_at']),
            models.Index(fields=['subscription', 'operation_type']),
            models.Index(fields=['status', 'priority']),
        ]
    
    def __str__(self):
        return f"{self.operation_type}: {self.title}"


class OperationLog(BaseModel):
    """
    System operation logging for monitoring and debugging
    """
    
    SEVERITY_CHOICES = (
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    )
    
    OPERATION_TYPES = (
        ('subscription_created', 'Subscription Created'),
        ('subscription_updated', 'Subscription Updated'),
        ('subscription_activated', 'Subscription Activated'),
        ('subscription_suspended', 'Subscription Suspended'),
        ('subscription_renewed', 'Subscription Renewed'),
        ('subscription_cancelled', 'Subscription Cancelled'),
        ('usage_updated', 'Usage Updated'),
        ('payment_processed', 'Payment Processed'),
        ('activation_queued', 'Activation Queued'),
        ('system_error', 'System Error'),
        ('view_exception', 'View Exception'),
    )
    
    operation_type = models.CharField(max_length=50, choices=OPERATION_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='info')
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='operation_logs'
    )
    
    client_id = models.UUIDField(null=True, blank=True, db_index=True)
    
    description = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    
    source_module = models.CharField(max_length=100)
    source_function = models.CharField(max_length=100)
    
    duration_ms = models.IntegerField(default=0, help_text="Operation duration in milliseconds")
    
    class Meta:
        verbose_name = 'Operation Log'
        verbose_name_plural = 'Operation Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['operation_type', 'created_at']),
            models.Index(fields=['severity', 'created_at']),
            models.Index(fields=['client_id', 'created_at']),
            models.Index(fields=['subscription', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.operation_type} - {self.severity}"
    
    @classmethod
    def log_operation(cls, **kwargs):
        """Convenience method to log operations"""
        try:
            return cls.objects.create(**kwargs)
        except Exception as e:
            logger.error(f"Failed to log operation: {e}")
            return None