"""
Internet Plans - Subscription Models
Manages client subscriptions to internet plans
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
import logging
from typing import Optional, Dict, Any
from django.db import transaction

logger = logging.getLogger(__name__)

# Import from Authentication app
try:
    from authentication.models import UserAccount
    AUTH_APP_AVAILABLE = True
except ImportError:
    logger.warning("Authentication app not available - limited functionality")
    AUTH_APP_AVAILABLE = False


class Subscription(models.Model):
    """
    Subscription linking clients to internet plans
    Each subscription represents a purchase of a plan by a client
    """
    
    STATUS_CHOICES = (
        ('pending', 'Pending Payment'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Activation Failed'),
    )
    
    ACCESS_METHOD_CHOICES = (
        ('hotspot', 'Hotspot'),
        ('pppoe', 'PPPoE'),
    )
    
    # Core Subscription Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Foreign Keys
    client = models.ForeignKey(
        'authentication.UserAccount' if AUTH_APP_AVAILABLE else 'auth.User',
        on_delete=models.CASCADE,
        related_name='subscriptions',
        help_text="Client who purchased the subscription"
    )
    
    internet_plan = models.ForeignKey(
        'InternetPlan',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions',
        help_text="Internet plan associated with this subscription"
    )
    
    router = models.ForeignKey(
        'network_management.Router',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subscriptions',
        help_text="Router where subscription is active"
    )
    
    # Subscription Details
    transaction_reference = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        help_text="Payment transaction reference"
    )
    
    access_method = models.CharField(
        max_length=10,
        choices=ACCESS_METHOD_CHOICES,
        default='hotspot',
        db_index=True,
        help_text="Access method for this subscription"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True,
        help_text="Subscription status"
    )
    
    mac_address = models.CharField(
        max_length=17,
        blank=True,
        null=True,
        db_index=True,
        help_text="Client MAC address (for hotspot)"
    )
    
    # Time Management
    start_date = models.DateTimeField(auto_now_add=True, db_index=True)
    end_date = models.DateTimeField(db_index=True)
    
    # Usage Tracking
    remaining_data = models.BigIntegerField(default=0, help_text="Remaining data in bytes")
    remaining_time = models.PositiveIntegerField(default=0, help_text="Remaining time in seconds")
    data_used = models.BigIntegerField(default=0, help_text="Data used in bytes")
    time_used = models.PositiveIntegerField(default=0, help_text="Time used in seconds")
    
    last_activity = models.DateTimeField(auto_now=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    # Activation Tracking
    activation_requested = models.BooleanField(default=False, db_index=True)
    activation_successful = models.BooleanField(default=False, db_index=True)
    activation_error = models.TextField(blank=True, null=True)
    activation_requested_at = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # Metadata
    notes = models.TextField(blank=True, default="", help_text="Admin notes")
    auto_renew = models.BooleanField(default=False, help_text="Auto-renew subscription")
    
    class Meta:
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['client', 'is_active']),
            models.Index(fields=['internet_plan', 'is_active']),
            models.Index(fields=['router', 'is_active']),
            models.Index(fields=['status', 'is_active']),
            models.Index(fields=['access_method', 'is_active']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['end_date']),
        ]
    
    def __str__(self):
        plan_name = self.internet_plan.name if self.internet_plan else "No Plan"
        return f"Subscription: {plan_name} - {self.client}"
    
    def clean(self):
        """Validate subscription data"""
        errors = {}
        
        # End date validation
        if self.end_date <= timezone.now():
            errors['end_date'] = 'End date must be in the future'
        
        # Access method validation
        if self.internet_plan:
            enabled_methods = self.internet_plan.get_enabled_access_methods()
            if self.access_method not in enabled_methods:
                errors['access_method'] = (
                    f"Selected access method '{self.access_method}' "
                    f"is not enabled for this plan"
                )
        
        # MAC address validation for hotspot
        if self.access_method == 'hotspot' and self.mac_address:
            import re
            mac_pattern = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
            if not mac_pattern.match(self.mac_address):
                errors['mac_address'] = 'Invalid MAC address format'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    @classmethod
    def create_pending_subscription(
        cls,
        client,
        plan,
        access_method: str = 'hotspot',
        router=None,
        mac_address: Optional[str] = None,
        duration_hours: int = 24
    ):
        """
        Create a new pending subscription
        Returns subscription object
        """
        if not plan.is_compatible_with_client(client):
            raise ValidationError(f"Plan {plan.name} is not compatible with client")
        
        # Calculate end date
        end_date = timezone.now() + timezone.timedelta(hours=duration_hours)
        
        # Calculate initial limits
        method_config = plan.get_config_for_method(access_method)
        
        # Data limit
        remaining_data = 0
        data_limit = method_config.get('dataLimit', {})
        if data_limit.get('value', '').lower() != 'unlimited':
            try:
                data_value = float(data_limit['value'])
                data_unit = data_limit.get('unit', 'GB').upper()
                
                if data_unit == 'GB':
                    remaining_data = int(data_value * 1024 * 1024 * 1024)
                elif data_unit == 'MB':
                    remaining_data = int(data_value * 1024 * 1024)
                elif data_unit == 'KB':
                    remaining_data = int(data_value * 1024)
                else:
                    remaining_data = int(data_value)
            except (ValueError, TypeError):
                remaining_data = 0
        
        # Time limit
        remaining_time = duration_hours * 3600
        
        # Create subscription
        subscription = cls(
            client=client,
            internet_plan=plan,
            router=router,
            access_method=access_method,
            mac_address=mac_address,
            end_date=end_date,
            remaining_data=remaining_data,
            remaining_time=remaining_time,
            status='pending'
        )
        
        subscription.save()
        return subscription
    
    def activate(self, transaction_reference: str = None):
        """Activate subscription after successful payment"""
        if self.status != 'pending':
            raise ValidationError(f"Cannot activate subscription with status: {self.status}")
        
        if transaction_reference:
            self.transaction_reference = transaction_reference
        
        self.status = 'active'
        self.save()
        
        # Request network activation
        self.request_activation()
        
        # Increment plan purchases
        if self.internet_plan:
            self.internet_plan.increment_purchases()
        
        return True
    
    def request_activation(self):
        """Request activation via NetworkManagement service"""
        from ..services.activation_service import ActivationService
        
        return ActivationService.request_subscription_activation(self)
    
    def update_usage(self, data_used: int, time_used: int):
        """
        Update subscription usage
        data_used: bytes
        time_used: seconds
        """
        with transaction.atomic():
            # Refresh to avoid race conditions
            self.refresh_from_db()
            
            self.data_used += data_used
            self.time_used += time_used
            
            # Update remaining limits
            if self.remaining_data > 0:
                self.remaining_data -= data_used
                if self.remaining_data < 0:
                    self.remaining_data = 0
            
            if self.remaining_time > 0:
                self.remaining_time -= time_used
                if self.remaining_time < 0:
                    self.remaining_time = 0
            
            # Check if limits exceeded
            if (self.remaining_data == 0 and self.internet_plan and 
                self.internet_plan.get_config_for_method(self.access_method)
                .get('dataLimit', {}).get('value', '').lower() != 'unlimited'):
                self.status = 'suspended'
            
            if (self.remaining_time == 0 and self.internet_plan and 
                self.internet_plan.get_config_for_method(self.access_method)
                .get('usageLimit', {}).get('value', '').lower() != 'unlimited'):
                self.status = 'suspended'
            
            self.last_activity = timezone.now()
            self.save()
    
    def get_remaining_data_display(self) -> str:
        """Get human-readable remaining data"""
        if not self.internet_plan:
            return "Unknown"
        
        method_config = self.internet_plan.get_config_for_method(self.access_method)
        data_limit = method_config.get('dataLimit', {})
        
        if data_limit.get('value', '').lower() == 'unlimited':
            return "Unlimited"
        
        bytes_val = self.remaining_data
        
        if bytes_val >= 1024 ** 3:  # GB
            return f"{(bytes_val / (1024 ** 3)):.2f} GB"
        elif bytes_val >= 1024 ** 2:  # MB
            return f"{(bytes_val / (1024 ** 2)):.2f} MB"
        elif bytes_val >= 1024:  # KB
            return f"{(bytes_val / 1024):.2f} KB"
        else:
            return f"{bytes_val} B"
    
    def get_remaining_time_display(self) -> str:
        """Get human-readable remaining time"""
        if not self.internet_plan:
            return "Unknown"
        
        method_config = self.internet_plan.get_config_for_method(self.access_method)
        usage_limit = method_config.get('usageLimit', {})
        
        if usage_limit.get('value', '').lower() == 'unlimited':
            return "Unlimited"
        
        seconds = self.remaining_time
        
        if seconds >= 86400:  # Days
            days = seconds // 86400
            hours = (seconds % 86400) // 3600
            return f"{days}d {hours}h"
        elif seconds >= 3600:  # Hours
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        elif seconds >= 60:  # Minutes
            minutes = seconds // 60
            return f"{minutes}m"
        else:
            return f"{seconds}s"
    
    def get_summary(self) -> Dict[str, Any]:
        """Get subscription summary"""
        return {
            'id': str(self.id),
            'client_id': str(self.client.id) if AUTH_APP_AVAILABLE else None,
            'plan_name': self.internet_plan.name if self.internet_plan else None,
            'access_method': self.access_method,
            'status': self.status,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'remaining_data': self.get_remaining_data_display(),
            'remaining_time': self.get_remaining_time_display(),
            'data_used': self.data_used,
            'time_used': self.time_used,
            'activation_status': 'requested' if self.activation_requested else 'not_requested',
            'activation_successful': self.activation_successful,
        }
    
    def is_expired(self) -> bool:
        """Check if subscription is expired"""
        return timezone.now() > self.end_date
    
    def can_renew(self) -> bool:
        """Check if subscription can be renewed"""
        return self.status in ['active', 'expired', 'suspended'] and self.is_active
    
    def renew(self, duration_hours: int = None):
        """Renew subscription"""
        if not self.can_renew():
            raise ValidationError("Subscription cannot be renewed")
        
        if duration_hours is None and self.internet_plan:
            method_config = self.internet_plan.get_config_for_method(self.access_method)
            usage_limit = method_config.get('usageLimit', {})
            if usage_limit.get('value', '').lower() != 'unlimited':
                try:
                    duration_hours = int(usage_limit['value'])
                except (ValueError, TypeError):
                    duration_hours = 24
        
        self.end_date = timezone.now() + timezone.timedelta(hours=duration_hours or 24)
        
        # Reset usage if renewing active subscription
        if self.status == 'active':
            method_config = self.internet_plan.get_config_for_method(self.access_method)
            data_limit = method_config.get('dataLimit', {})
            
            if data_limit.get('value', '').lower() != 'unlimited':
                try:
                    data_value = float(data_limit['value'])
                    data_unit = data_limit.get('unit', 'GB').upper()
                    
                    if data_unit == 'GB':
                        self.remaining_data = int(data_value * 1024 * 1024 * 1024)
                    elif data_unit == 'MB':
                        self.remaining_data = int(data_value * 1024 * 1024)
                    elif data_unit == 'KB':
                        self.remaining_data = int(data_value * 1024)
                    else:
                        self.remaining_data = int(data_value)
                except (ValueError, TypeError):
                    self.remaining_data = 0
            
            usage_limit = method_config.get('usageLimit', {})
            if usage_limit.get('value', '').lower() != 'unlimited':
                try:
                    duration_value = int(usage_limit['value'])
                    duration_unit = usage_limit.get('unit', 'Hours')
                    
                    if duration_unit == 'Hours':
                        self.remaining_time = duration_value * 3600
                    elif duration_unit == 'Days':
                        self.remaining_time = duration_value * 86400
                    else:
                        self.remaining_time = duration_value * 3600
                except (ValueError, TypeError):
                    self.remaining_time = 24 * 3600
            
            self.data_used = 0
            self.time_used = 0
        
        self.status = 'active'
        self.save()
        
        # Request re-activation
        self.request_activation()
        
        return True