





# """
# Internet Plans - Core Plan Models with Time Variant Feature
# UPDATED: Production-ready with consistent snake_case, optimized queries, and proper validation
# FIXED: Access methods initialization and validation
# """

# from django.db import models
# from django.core.validators import MinValueValidator, MaxValueValidator
# from django.core.exceptions import ValidationError
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# from datetime import datetime, timedelta
# from decimal import Decimal
# import uuid
# import logging
# import json
# from typing import Dict, List, Optional, Tuple, Any
# from django.db import transaction
# from django.core.cache import cache

# logger = logging.getLogger(__name__)


# class TimeVariantConfig(models.Model):
#     """
#     Time Variant Configuration for Internet Plans
#     Controls when plans are available for purchase in captive portal
#     """
    
#     # Days of week for availability
#     DAYS_OF_WEEK = (
#         ('mon', 'Monday'),
#         ('tue', 'Tuesday'),
#         ('wed', 'Wednesday'),
#         ('thu', 'Thursday'),
#         ('fri', 'Friday'),
#         ('sat', 'Saturday'),
#         ('sun', 'Sunday'),
#     )
    
#     # Time units for duration
#     TIME_UNITS = (
#         ('hours', 'Hours'),
#         ('days', 'Days'),
#         ('weeks', 'Weeks'),
#         ('months', 'Months'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
#     # Core time variant settings
#     is_active = models.BooleanField(
#         default=False,
#         db_index=True,
#         help_text="Enable time variant controls for this plan"
#     )
    
#     # 1. Time of day availability (for captive portal visibility)
#     start_time = models.TimeField(
#         null=True,
#         blank=True,
#         help_text="Start time when plan becomes visible in captive portal (24-hour format)"
#     )
#     end_time = models.TimeField(
#         null=True,
#         blank=True,
#         help_text="End time when plan disappears from captive portal (24-hour format)"
#     )
    
#     # 2. Days of week availability
#     available_days = models.JSONField(
#         default=list,
#         blank=True,
#         help_text="Days of week when plan is available (e.g., ['mon', 'wed', 'fri'])"
#     )
    
#     # 3. Scheduled availability (specific date ranges)
#     schedule_active = models.BooleanField(
#         default=False,
#         help_text="Enable scheduled availability"
#     )
#     schedule_start_date = models.DateTimeField(
#         null=True,
#         blank=True,
#         help_text="Start date/time for scheduled availability"
#     )
#     schedule_end_date = models.DateTimeField(
#         null=True,
#         blank=True,
#         help_text="End date/time for scheduled availability"
#     )
    
#     # 4. Duration-based availability
#     duration_active = models.BooleanField(
#         default=False,
#         help_text="Enable duration-based availability"
#     )
#     duration_value = models.PositiveIntegerField(
#         default=0,
#         help_text="Duration value (e.g., 7 for 7 days)"
#     )
#     duration_unit = models.CharField(
#         max_length=10,
#         choices=TIME_UNITS,
#         default='days',
#         help_text="Duration unit"
#     )
#     duration_start_date = models.DateTimeField(
#         null=True,
#         blank=True,
#         help_text="Start date for duration-based availability"
#     )
    
#     # Exclusion dates (dates when plan is NOT available)
#     exclusion_dates = models.JSONField(
#         default=list,
#         blank=True,
#         help_text="Specific dates when plan is NOT available (YYYY-MM-DD format)"
#     )
    
#     # Timezone for time calculations
#     timezone = models.CharField(
#         max_length=50,
#         default='Africa/Nairobi',
#         help_text="Timezone for time calculations (IANA format)"
#     )
    
#     # Override flag for immediate availability
#     force_available = models.BooleanField(
#         default=False,
#         help_text="Override all time restrictions and make plan available"
#     )
    
#     # Metadata
#     created_at = models.DateTimeField(auto_now_add=True, db_index=True)
#     updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
#     class Meta:
#         verbose_name = 'Time Variant Configuration'
#         verbose_name_plural = 'Time Variant Configurations'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['is_active', 'created_at']),
#             models.Index(fields=['schedule_active', 'schedule_end_date']),
#         ]
    
#     def __str__(self):
#         status = "Active" if self.is_active else "Inactive"
#         return f"Time Variant Config ({status})"
    
#     def clean(self):
#         """Validate time variant configuration"""
#         errors = {}
        
#         if not self.is_active:
#             # If not active, no further validation needed
#             return
        
#         # Validate time range
#         if self.start_time and self.end_time:
#             if self.start_time >= self.end_time:
#                 errors['end_time'] = 'End time must be after start time'
        
#         # Validate available days
#         if self.available_days:
#             if not isinstance(self.available_days, list):
#                 errors['available_days'] = 'Available days must be a list'
#             else:
#                 valid_days = [day[0] for day in self.DAYS_OF_WEEK]
#                 invalid_days = []
#                 for day in self.available_days:
#                     if day not in valid_days:
#                         invalid_days.append(day)
#                 if invalid_days:
#                     errors['available_days'] = f'Invalid day(s): {", ".join(invalid_days)}. Must be one of {valid_days}'
        
#         # Validate schedule dates
#         if self.schedule_active:
#             if not self.schedule_start_date:
#                 errors['schedule_start_date'] = 'Schedule start date is required when schedule is active'
#             if not self.schedule_end_date:
#                 errors['schedule_end_date'] = 'Schedule end date is required when schedule is active'
#             elif self.schedule_start_date and self.schedule_end_date:
#                 if self.schedule_start_date >= self.schedule_end_date:
#                     errors['schedule_end_date'] = 'Schedule end date must be after start date'
        
#         # Validate duration
#         if self.duration_active:
#             if self.duration_value <= 0:
#                 errors['duration_value'] = 'Duration value must be greater than 0'
#             if not self.duration_start_date:
#                 errors['duration_start_date'] = 'Duration start date is required when duration is active'
        
#         # Validate exclusion dates
#         if self.exclusion_dates:
#             if not isinstance(self.exclusion_dates, list):
#                 errors['exclusion_dates'] = 'Exclusion dates must be a list'
#             else:
#                 for date_str in self.exclusion_dates:
#                     try:
#                         datetime.strptime(date_str, '%Y-%m-%d')
#                     except ValueError:
#                         errors['exclusion_dates'] = f'Invalid date format: {date_str}. Use YYYY-MM-DD'
#                         break
        
#         if errors:
#             raise ValidationError(errors)
    
#     def save(self, *args, **kwargs):
#         """Save with validation"""
#         self.full_clean()
#         super().save(*args, **kwargs)
    
#     def is_available_now(self) -> bool:
#         """
#         Check if plan is available for purchase right now
#         """
#         if not self.is_active:
#             return True  # Time variant not active, always available
        
#         if self.force_available:
#             return True  # Override enabled
        
#         now = timezone.now()
        
#         # 1. Check time of day availability
#         if self.start_time and self.end_time:
#             current_time = now.time()
#             if not (self.start_time <= current_time <= self.end_time):
#                 return False
        
#         # 2. Check day of week availability
#         if self.available_days:
#             current_day = now.strftime('%a').lower()[:3]  # 'mon', 'tue', etc.
#             if current_day not in self.available_days:
#                 return False
        
#         # 3. Check scheduled availability
#         if self.schedule_active and self.schedule_start_date and self.schedule_end_date:
#             if not (self.schedule_start_date <= now <= self.schedule_end_date):
#                 return False
        
#         # 4. Check duration-based availability
#         if self.duration_active and self.duration_start_date:
#             duration_end = self.calculate_duration_end()
#             if now > duration_end:
#                 return False
        
#         # 5. Check exclusion dates
#         if self.exclusion_dates:
#             current_date_str = now.date().isoformat()
#             if current_date_str in self.exclusion_dates:
#                 return False
        
#         return True
    
#     def calculate_duration_end(self):
#         """Calculate end date based on duration settings"""
#         if not self.duration_active or not self.duration_start_date:
#             return None
        
#         duration_end = self.duration_start_date
        
#         if self.duration_unit == 'hours':
#             duration_end += timedelta(hours=self.duration_value)
#         elif self.duration_unit == 'days':
#             duration_end += timedelta(days=self.duration_value)
#         elif self.duration_unit == 'weeks':
#             duration_end += timedelta(weeks=self.duration_value)
#         elif self.duration_unit == 'months':
#             # Approximate month as 30 days
#             duration_end += timedelta(days=self.duration_value * 30)
        
#         return duration_end
    
#     def get_availability_summary(self) -> Dict[str, Any]:
#         """Get human-readable availability summary"""
#         if not self.is_active:
#             return {'status': 'always_available', 'message': 'Available at all times'}
        
#         summary = {
#             'status': 'time_restricted',
#             'is_available_now': self.is_available_now(),
#             'restrictions': []
#         }
        
#         if self.start_time and self.end_time:
#             summary['restrictions'].append({
#                 'type': 'time_of_day',
#                 'start': self.start_time.strftime('%H:%M'),
#                 'end': self.end_time.strftime('%H:%M'),
#                 'description': f'Available from {self.start_time.strftime("%H:%M")} to {self.end_time.strftime("%H:%M")}'
#             })
        
#         if self.available_days:
#             day_names = [dict(self.DAYS_OF_WEEK).get(day, day) for day in self.available_days]
#             summary['restrictions'].append({
#                 'type': 'days_of_week',
#                 'days': self.available_days,
#                 'day_names': day_names,
#                 'description': f'Available on {", ".join(day_names)}'
#             })
        
#         if self.schedule_active and self.schedule_start_date and self.schedule_end_date:
#             summary['restrictions'].append({
#                 'type': 'scheduled',
#                 'start': self.schedule_start_date.isoformat(),
#                 'end': self.schedule_end_date.isoformat(),
#                 'description': f'Scheduled from {self.schedule_start_date.strftime("%Y-%m-%d %H:%M")} to {self.schedule_end_date.strftime("%Y-%m-%d %H:%M")}'
#             })
        
#         if self.duration_active and self.duration_start_date:
#             duration_end = self.calculate_duration_end()
#             summary['restrictions'].append({
#                 'type': 'duration',
#                 'value': self.duration_value,
#                 'unit': self.duration_unit,
#                 'start': self.duration_start_date.isoformat(),
#                 'end': duration_end.isoformat() if duration_end else None,
#                 'description': f'Available for {self.duration_value} {self.duration_unit} from {self.duration_start_date.strftime("%Y-%m-%d %H:%M")}'
#             })
        
#         if self.exclusion_dates:
#             summary['restrictions'].append({
#                 'type': 'exclusions',
#                 'dates': self.exclusion_dates,
#                 'count': len(self.exclusion_dates),
#                 'description': f'Not available on {len(self.exclusion_dates)} specific dates'
#             })
        
#         return summary
    
#     def get_next_available_time(self) -> Optional[Dict[str, Any]]:
#         """
#         Calculate next available time if currently unavailable
#         """
#         if not self.is_active or self.is_available_now():
#             return None
        
#         now = timezone.now()
#         next_available = None
        
#         # Check time of day restrictions
#         if self.start_time and self.end_time:
#             current_time = now.time()
#             if current_time < self.start_time:
#                 # Available later today
#                 next_available = {
#                     'type': 'time_of_day',
#                     'time': self.start_time.strftime('%H:%M'),
#                     'datetime': datetime.combine(now.date(), self.start_time).isoformat(),
#                     'message': f'Available today at {self.start_time.strftime("%H:%M")}'
#                 }
#             elif current_time > self.end_time:
#                 # Available tomorrow
#                 tomorrow = now + timedelta(days=1)
#                 tomorrow_date = tomorrow.date()
#                 next_available_time = datetime.combine(tomorrow_date, self.start_time)
#                 next_available = {
#                     'type': 'time_of_day',
#                     'time': self.start_time.strftime('%H:%M'),
#                     'datetime': next_available_time.isoformat(),
#                     'message': f'Available tomorrow at {self.start_time.strftime("%H:%M")}'
#                 }
        
#         # Check day of week restrictions
#         if self.available_days and not next_available:
#             current_day = now.strftime('%a').lower()[:3]
#             days_ahead = 0
            
#             # Find next available day
#             for i in range(1, 8):  # Check next 7 days
#                 next_day = (now + timedelta(days=i)).strftime('%a').lower()[:3]
#                 if next_day in self.available_days:
#                     days_ahead = i
#                     break
            
#             if days_ahead > 0:
#                 next_date = now + timedelta(days=days_ahead)
#                 day_name = dict(self.DAYS_OF_WEEK).get(next_day, next_day)
#                 next_available = {
#                     'type': 'day_of_week',
#                     'date': next_date.date().isoformat(),
#                     'datetime': next_date.isoformat(),
#                     'days_ahead': days_ahead,
#                     'day_name': day_name,
#                     'message': f'Available on {day_name} ({next_date.strftime("%Y-%m-%d")})'
#                 }
        
#         # Check schedule restrictions
#         if self.schedule_active and self.schedule_start_date and not next_available:
#             if now < self.schedule_start_date:
#                 next_available = {
#                     'type': 'scheduled',
#                     'datetime': self.schedule_start_date.isoformat(),
#                     'message': f'Available starting {self.schedule_start_date.strftime("%Y-%m-%d %H:%M")}'
#                 }
        
#         return next_available


# class PlanTemplate(models.Model):
#     """
#     Template for creating Internet Plans
#     Templates define the structure that can be reused for multiple plans
#     """
    
#     CATEGORIES = (
#         ('Residential', 'Residential'),
#         ('Business', 'Business'),
#         ('Promotional', 'Promotional'),
#         ('Enterprise', 'Enterprise'),
#     )
    
#     # Core Template Fields
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100, unique=True, db_index=True)
#     description = models.TextField(blank=True, default="")
#     category = models.CharField(max_length=20, choices=CATEGORIES, default='Residential', db_index=True)
#     base_price = models.DecimalField(
#         max_digits=10, 
#         decimal_places=2, 
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Base price in KSH"
#     )
    
#     # Access Methods Configuration
#     access_methods = models.JSONField(
#         default=dict,
#         help_text="Configuration for hotspot and PPPoE access methods"
#     )
    
#     # Time Variant Configuration
#     time_variant = models.OneToOneField(
#         TimeVariantConfig,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='plan_template',
#         help_text="Time variant configuration for this template"
#     )
    
#     # Template Management
#     is_public = models.BooleanField(default=True, db_index=True)
#     is_active = models.BooleanField(default=True, db_index=True)
#     usage_count = models.PositiveIntegerField(default=0, db_index=True)
    
#     # Ownership
#     created_by = models.ForeignKey(
#         get_user_model(),
#         on_delete=models.CASCADE,
#         related_name='created_templates',
#         null=True,
#         blank=True,
#         help_text="Admin who created this template"
#     )
    
#     # Timestamps
#     created_at = models.DateTimeField(auto_now_add=True, db_index=True)
#     updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
#     class Meta:
#         verbose_name = 'Plan Template'
#         verbose_name_plural = 'Plan Templates'
#         ordering = ['name']
#         indexes = [
#             models.Index(fields=['name', 'is_active']),
#             models.Index(fields=['category', 'is_active']),
#             models.Index(fields=['is_public', 'is_active']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['usage_count']),
#         ]
    
#     def __str__(self):
#         return f"{self.name} ({self.category})"
    
#     def clean(self):
#         """Validate template configuration"""
#         errors = {}
        
#         # Validate JSON structure
#         if not isinstance(self.access_methods, dict):
#             errors['access_methods'] = 'Access methods must be a dictionary'
        
#         # Validate access method configurations
#         required_methods = ['hotspot', 'pppoe']
#         for method in required_methods:
#             if method not in self.access_methods:
#                 errors['access_methods'] = f'Missing {method} configuration'
#                 continue
            
#             config = self.access_methods[method]
#             if not isinstance(config, dict):
#                 errors['access_methods'] = f'{method} configuration must be a dictionary'
#                 continue
            
#             if config.get('enabled', False):
#                 # Validate required fields for enabled methods
#                 required_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit']
#                 for field in required_fields:
#                     if field not in config:
#                         errors['access_methods'] = f'Missing {field} for enabled {method}'
#                         continue
                    
#                     field_config = config[field]
#                     if not isinstance(field_config, dict):
#                         errors['access_methods'] = f'{method}.{field} must be a dictionary'
#                         continue
                    
#                     if 'value' not in field_config:
#                         errors['access_methods'] = f'{method}.{field}.value is required'
        
#         if not self.has_enabled_access_methods():
#             errors['access_methods'] = 'At least one access method must be enabled'
        
#         # Validate time variant if exists
#         if self.time_variant:
#             try:
#                 self.time_variant.full_clean()
#             except ValidationError as e:
#                 errors['time_variant'] = e.message_dict
        
#         if errors:
#             raise ValidationError(errors)
    
#     def save(self, *args, **kwargs):
#         """Save with validation and default configuration"""
#         # Ensure access methods are properly initialized
#         if not self.access_methods or not isinstance(self.access_methods, dict):
#             self.set_default_access_methods()
#         else:
#             # Ensure both methods exist with proper structure
#             self._ensure_access_methods_structure()
        
#         self.full_clean()
        
#         # Clear template cache
#         cache_key = f"plan_template:{self.id}"
#         cache.delete(cache_key)
#         # Use appropriate cache clear method
#         try:
#             cache.delete_pattern("plan_templates:*")
#         except AttributeError:
#             # Fallback for cache backends that don't support delete_pattern
#             pass
        
#         super().save(*args, **kwargs)
    
#     def _ensure_access_methods_structure(self):
#         """Ensure access methods have proper structure"""
#         # Ensure both methods exist
#         if 'hotspot' not in self.access_methods:
#             self.access_methods['hotspot'] = {}
#         if 'pppoe' not in self.access_methods:
#             self.access_methods['pppoe'] = {}
        
#         # Ensure each method has required fields with proper defaults
#         for method in ['hotspot', 'pppoe']:
#             config = self.access_methods[method]
#             if not isinstance(config, dict):
#                 config = {}
            
#             # Ensure enabled is boolean
#             if 'enabled' not in config:
#                 config['enabled'] = False
#             elif isinstance(config['enabled'], str):
#                 config['enabled'] = config['enabled'].lower() == 'true'
            
#             # Ensure required nested fields exist
#             nested_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']
#             for field in nested_fields:
#                 if field not in config or not isinstance(config[field], dict):
#                     config[field] = {'value': '', 'unit': self._get_default_unit(field)}
#                 elif 'value' not in config[field]:
#                     config[field]['value'] = ''
#                 elif 'unit' not in config[field]:
#                     config[field]['unit'] = self._get_default_unit(field)
            
#             # Ensure numeric fields exist
#             numeric_fields = ['bandwidth_limit', 'max_devices', 'session_timeout', 'idle_timeout']
#             for field in numeric_fields:
#                 if field not in config:
#                     config[field] = ''
            
#             # PPPoE specific fields
#             if method == 'pppoe':
#                 pppoe_fields = ['ip_pool', 'service_name', 'mtu']
#                 for field in pppoe_fields:
#                     if field not in config:
#                         config[field] = ''
            
#             # MAC binding
#             if 'mac_binding' not in config:
#                 config['mac_binding'] = False
#             elif isinstance(config['mac_binding'], str):
#                 config['mac_binding'] = config['mac_binding'].lower() == 'true'
            
#             self.access_methods[method] = config
    
#     def _get_default_unit(self, field):
#         """Get default unit for a field"""
#         units = {
#             'download_speed': 'mbps',
#             'upload_speed': 'mbps',
#             'data_limit': 'gb',
#             'usage_limit': 'hours',
#             'validity_period': 'days'
#         }
#         return units.get(field, '')
    
#     def set_default_access_methods(self):
#         """Set default access method configurations"""
#         self.access_methods = {
#             'hotspot': {
#                 'enabled': True,
#                 'download_speed': {'value': '10', 'unit': 'mbps'},
#                 'upload_speed': {'value': '5', 'unit': 'mbps'},
#                 'data_limit': {'value': '10', 'unit': 'gb'},
#                 'usage_limit': {'value': '24', 'unit': 'hours'},
#                 'bandwidth_limit': '',
#                 'max_devices': '',
#                 'session_timeout': '',
#                 'idle_timeout': '',
#                 'validity_period': {'value': '30', 'unit': 'days'},
#                 'mac_binding': False,
#             },
#             'pppoe': {
#                 'enabled': False,
#                 'download_speed': {'value': '10', 'unit': 'mbps'},
#                 'upload_speed': {'value': '5', 'unit': 'mbps'},
#                 'data_limit': {'value': '10', 'unit': 'gb'},
#                 'usage_limit': {'value': '24', 'unit': 'hours'},
#                 'bandwidth_limit': '',
#                 'max_devices': '',
#                 'session_timeout': '',
#                 'idle_timeout': '',
#                 'validity_period': {'value': '30', 'unit': 'days'},
#                 'mac_binding': False,
#                 'ip_pool': '',
#                 'service_name': '',
#                 'mtu': '',
#             }
#         }
    
#     def increment_usage(self):
#         """Atomically increment usage count"""
#         with transaction.atomic():
#             PlanTemplate.objects.filter(pk=self.pk).update(
#                 usage_count=models.F('usage_count') + 1
#             )
#             self.refresh_from_db()
    
#     def has_enabled_access_methods(self) -> bool:
#         """Check if any access method is enabled"""
#         return any(
#             method_config.get('enabled', False) 
#             for method_config in self.access_methods.values()
#         )
    
#     def get_enabled_access_methods(self) -> List[str]:
#         """Get list of enabled access methods"""
#         return [
#             method for method, config in self.access_methods.items() 
#             if config.get('enabled', False)
#         ]
    
#     def get_access_type(self) -> str:
#         """Get access type category"""
#         enabled_methods = self.get_enabled_access_methods()
#         if 'hotspot' in enabled_methods and 'pppoe' in enabled_methods:
#             return 'dual'
#         elif 'hotspot' in enabled_methods:
#             return 'hotspot'
#         elif 'pppoe' in enabled_methods:
#             return 'pppoe'
#         return 'none'
    
#     def get_config_for_method(self, method: str) -> Dict[str, Any]:
#         """Get configuration for specific access method"""
#         return self.access_methods.get(method, {})
    
#     def has_time_variant(self) -> bool:
#         """Check if template has time variant configuration"""
#         return self.time_variant is not None and self.time_variant.is_active
    
#     def is_available_for_purchase(self, client_type='hotspot') -> Dict[str, Any]:
#         """
#         Check if template/plan is available for purchase
#         """
#         if not self.has_time_variant():
#             return {
#                 'available': True,
#                 'reason': 'No time restrictions',
#                 'next_available': None
#             }
        
#         time_variant = self.time_variant
#         is_available = time_variant.is_available_now()
        
#         response = {
#             'available': is_available,
#             'time_variant_active': True,
#             'summary': time_variant.get_availability_summary()
#         }
        
#         if not is_available:
#             response['next_available'] = time_variant.get_next_available_time()
        
#         return response
    
#     @classmethod
#     def get_cached_template(cls, template_id):
#         """Get template from cache or database"""
#         cache_key = f"plan_template:{template_id}"
#         template = cache.get(cache_key)
        
#         if template is None:
#             try:
#                 template = cls.objects.select_related('time_variant').get(id=template_id, is_active=True)
#                 cache.set(cache_key, template, 300)  # Cache for 5 minutes
#             except cls.DoesNotExist:
#                 return None
        
#         return template
    
#     # Property for serializer compatibility
#     @property
#     def time_variant_id(self):
#         """Property to get time variant ID for serializer"""
#         return self.time_variant.id if self.time_variant else None


# class InternetPlan(models.Model):
#     """
#     Internet Plan that can be purchased by clients
#     Each plan is created from a template or custom configuration
#     """
    
#     PLAN_TYPES = (
#         ('Paid', 'Paid'),
#         ('Free_trial', 'Free Trial'),
#         ('Promotional', 'Promotional'),
#     )
    
#     CATEGORIES = (
#         ('Residential', 'Residential'),
#         ('Business', 'Business'),
#         ('Promotional', 'Promotional'),
#         ('Enterprise', 'Enterprise'),
#     )
    
#     PRIORITY_LEVELS = (
#         (1, 'Lowest'),
#         (2, 'Low'),
#         (3, 'Medium'),
#         (4, 'High'),
#         (5, 'Highest'),
#         (6, 'Critical'),
#         (7, 'Premium'),
#         (8, 'VIP'),
#     )
    
#     # Core Plan Fields
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='Paid', db_index=True)
#     name = models.CharField(max_length=100, unique=True, db_index=True)
#     price = models.DecimalField(
#         max_digits=10, 
#         decimal_places=2, 
#         default=Decimal('0.00'),
#         validators=[MinValueValidator(Decimal('0'))],
#         help_text="Price in KSH"
#     )
#     active = models.BooleanField(default=True, db_index=True)
#     category = models.CharField(max_length=20, choices=CATEGORIES, default='Residential', db_index=True)
#     description = models.TextField(blank=True, default="")
    
#     # Template Reference
#     template = models.ForeignKey(
#         PlanTemplate, 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True, 
#         related_name='created_plans',
#         help_text="Template used to create this plan"
#     )
    
#     # Access Methods
#     access_methods = models.JSONField(
#         default=dict,
#         help_text="Configuration for hotspot and PPPoE access methods"
#     )
    
#     # Time Variant Configuration
#     time_variant = models.OneToOneField(
#         TimeVariantConfig,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='internet_plan',
#         help_text="Time variant configuration for this plan"
#     )
    
#     # Plan Configuration
#     priority_level = models.IntegerField(choices=PRIORITY_LEVELS, default=4)
#     router_specific = models.BooleanField(default=False)
#     allowed_routers = models.ManyToManyField(
#         'network_management.Router',
#         blank=True,
#         related_name='allowed_plans',
#         help_text="Routers where this plan can be used (if router_specific)"
#     )
    
#     # FUP (Fair Usage Policy)
#     fup_policy = models.TextField(blank=True, default="")
#     fup_threshold = models.PositiveIntegerField(
#         default=80,
#         validators=[MinValueValidator(1), MaxValueValidator(100)],
#         help_text="Usage threshold percentage for FUP"
#     )
    
#     # Usage Tracking
#     purchases = models.PositiveIntegerField(default=0, db_index=True)
    
#     # Session Tracking
#     client_sessions = models.JSONField(default=dict, blank=True)
    
#     # Timestamps
#     created_at = models.DateTimeField(auto_now_add=True, db_index=True)
#     updated_at = models.DateTimeField(auto_now=True, db_index=True)
#     created_by = models.ForeignKey(
#         get_user_model(),
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='created_plans',
#         help_text="Admin who created this plan"
#     )
    
#     class Meta:
#         verbose_name = 'Internet Plan'
#         verbose_name_plural = 'Internet Plans'
#         ordering = ['-priority_level', 'name']
#         indexes = [
#             models.Index(fields=['name', 'active']),
#             models.Index(fields=['plan_type', 'active']),
#             models.Index(fields=['category', 'active']),
#             models.Index(fields=['price']),
#             models.Index(fields=['purchases']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['priority_level', 'active']),
#         ]
    
#     def __str__(self):
#         plan_type = self.get_plan_type_display()
#         return f"{self.name} ({plan_type}) - KSH {self.price}"
    
#     def clean(self):
#         """Validate plan configuration"""
#         errors = {}
        
#         # Free Trial validation
#         if self.plan_type == 'Free_trial':
#             if self.price != Decimal('0'):
#                 errors['price'] = 'Free Trial plans must have price set to 0'
#             if self.router_specific:
#                 errors['router_specific'] = 'Free Trial plans cannot be router-specific'
#             if self.priority_level > 4:
#                 errors['priority_level'] = 'Free Trial plans cannot have premium priority levels'
        
#         # Access Methods validation
#         if not isinstance(self.access_methods, dict):
#             errors['access_methods'] = 'Access methods must be a dictionary'
#         else:
#             required_methods = ['hotspot', 'pppoe']
#             for method in required_methods:
#                 if method not in self.access_methods:
#                     errors['access_methods'] = f'Missing {method} configuration'
#                     continue
                
#                 config = self.access_methods[method]
#                 if not isinstance(config, dict):
#                     errors['access_methods'] = f'{method} configuration must be a dictionary'
#                     continue
                
#                 if config.get('enabled', False):
#                     required_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit']
#                     for field in required_fields:
#                         if field not in config:
#                             errors['access_methods'] = f'Missing {field} for enabled {method}'
#                             continue
                        
#                         field_config = config[field]
#                         if not isinstance(field_config, dict):
#                             errors['access_methods'] = f'{method}.{field} must be a dictionary'
#                             continue
                        
#                         if 'value' not in field_config:
#                             errors['access_methods'] = f'{method}.{field}.value is required'
        
#         if not self.has_enabled_access_methods():
#             errors['access_methods'] = 'At least one access method must be enabled'
        
#         # Validate time variant if exists
#         if self.time_variant:
#             try:
#                 self.time_variant.full_clean()
#             except ValidationError as e:
#                 errors['time_variant'] = e.message_dict
        
#         # Validate FUP threshold
#         if self.fup_threshold and (self.fup_threshold < 1 or self.fup_threshold > 100):
#             errors['fup_threshold'] = 'FUP threshold must be between 1% and 100%'
        
#         if errors:
#             raise ValidationError(errors)
    
#     def save(self, *args, **kwargs):
#         """Save with validation and ensure access methods are properly structured"""
#         # Ensure access methods are properly initialized
#         if not self.access_methods or not isinstance(self.access_methods, dict):
#             self.set_default_access_methods()
#         else:
#             # Ensure both methods exist with proper structure
#             self._ensure_access_methods_structure()
        
#         self.full_clean()
        
#         # Clear plan cache
#         cache.delete(f"internet_plan:{self.id}")
#         # Use appropriate cache clear method
#         try:
#             cache.delete_pattern("internet_plans:*")
#         except AttributeError:
#             # Fallback for cache backends that don't support delete_pattern
#             pass
        
#         super().save(*args, **kwargs)
    
#     def _ensure_access_methods_structure(self):
#         """Ensure access methods have proper structure"""
#         # Ensure both methods exist
#         if 'hotspot' not in self.access_methods:
#             self.access_methods['hotspot'] = {}
#         if 'pppoe' not in self.access_methods:
#             self.access_methods['pppoe'] = {}
        
#         # Ensure each method has required fields with proper defaults
#         for method in ['hotspot', 'pppoe']:
#             config = self.access_methods[method]
#             if not isinstance(config, dict):
#                 config = {}
            
#             # Ensure enabled is boolean
#             if 'enabled' not in config:
#                 config['enabled'] = method == 'hotspot'  # Default hotspot enabled
#             elif isinstance(config['enabled'], str):
#                 config['enabled'] = config['enabled'].lower() == 'true'
            
#             # Ensure required nested fields exist with proper structure
#             nested_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']
#             for field in nested_fields:
#                 if field not in config or not isinstance(config[field], dict):
#                     config[field] = {'value': '', 'unit': self._get_default_unit(field)}
#                 elif 'value' not in config[field]:
#                     config[field]['value'] = ''
#                 elif 'unit' not in config[field]:
#                     config[field]['unit'] = self._get_default_unit(field)
            
#             # Ensure numeric fields exist
#             numeric_fields = ['bandwidth_limit', 'max_devices', 'session_timeout', 'idle_timeout']
#             for field in numeric_fields:
#                 if field not in config:
#                     config[field] = ''
            
#             # PPPoE specific fields
#             if method == 'pppoe':
#                 pppoe_fields = ['ip_pool', 'service_name', 'mtu']
#                 for field in pppoe_fields:
#                     if field not in config:
#                         config[field] = ''
            
#             # MAC binding
#             if 'mac_binding' not in config:
#                 config['mac_binding'] = False
#             elif isinstance(config['mac_binding'], str):
#                 config['mac_binding'] = config['mac_binding'].lower() == 'true'
            
#             self.access_methods[method] = config
    
#     def _get_default_unit(self, field):
#         """Get default unit for a field"""
#         units = {
#             'download_speed': 'mbps',
#             'upload_speed': 'mbps',
#             'data_limit': 'gb',
#             'usage_limit': 'hours',
#             'validity_period': 'days'
#         }
#         return units.get(field, '')
    
#     def set_default_access_methods(self):
#         """Set default access method configurations"""
#         self.access_methods = {
#             'hotspot': {
#                 'enabled': True,
#                 'download_speed': {'value': '10', 'unit': 'mbps'},
#                 'upload_speed': {'value': '5', 'unit': 'mbps'},
#                 'data_limit': {'value': '10', 'unit': 'gb'},
#                 'usage_limit': {'value': '24', 'unit': 'hours'},
#                 'bandwidth_limit': '',
#                 'max_devices': '',
#                 'session_timeout': '',
#                 'idle_timeout': '',
#                 'validity_period': {'value': '30', 'unit': 'days'},
#                 'mac_binding': False,
#             },
#             'pppoe': {
#                 'enabled': False,
#                 'download_speed': {'value': '10', 'unit': 'mbps'},
#                 'upload_speed': {'value': '5', 'unit': 'mbps'},
#                 'data_limit': {'value': '10', 'unit': 'gb'},
#                 'usage_limit': {'value': '24', 'unit': 'hours'},
#                 'bandwidth_limit': '',
#                 'max_devices': '',
#                 'session_timeout': '',
#                 'idle_timeout': '',
#                 'validity_period': {'value': '30', 'unit': 'days'},
#                 'mac_binding': False,
#                 'ip_pool': '',
#                 'service_name': '',
#                 'mtu': '',
#             }
#         }
    
#     def create_from_template(self, template: PlanTemplate):
#         """Create plan from template"""
#         self.name = template.name
#         self.category = template.category
#         self.price = template.base_price
#         self.description = template.description
#         # Deep copy access methods to ensure proper structure
#         self.access_methods = {}
#         for method, config in template.access_methods.items():
#             if isinstance(config, dict):
#                 self.access_methods[method] = config.copy()
#             else:
#                 self.access_methods[method] = config
#         self.template = template
        
#         # Copy time variant from template if exists
#         if template.time_variant:
#             # Create a copy of time variant
#             time_variant_copy = TimeVariantConfig.objects.create(
#                 is_active=template.time_variant.is_active,
#                 start_time=template.time_variant.start_time,
#                 end_time=template.time_variant.end_time,
#                 available_days=template.time_variant.available_days.copy() if template.time_variant.available_days else [],
#                 schedule_active=template.time_variant.schedule_active,
#                 schedule_start_date=template.time_variant.schedule_start_date,
#                 schedule_end_date=template.time_variant.schedule_end_date,
#                 duration_active=template.time_variant.duration_active,
#                 duration_value=template.time_variant.duration_value,
#                 duration_unit=template.time_variant.duration_unit,
#                 duration_start_date=template.time_variant.duration_start_date,
#                 exclusion_dates=template.time_variant.exclusion_dates.copy() if template.time_variant.exclusion_dates else [],
#                 timezone=template.time_variant.timezone,
#                 force_available=template.time_variant.force_available
#             )
#             self.time_variant = time_variant_copy
        
#         if template.base_price > 0:
#             self.plan_type = 'Paid'
#         else:
#             self.plan_type = 'Free_trial'
        
#         # Ensure access methods are properly structured after template copy
#         self._ensure_access_methods_structure()
        
#         template.increment_usage()
#         self.save()
    
#     def has_enabled_access_methods(self) -> bool:
#         """Check if any access method is enabled"""
#         return any(
#             method_config.get('enabled', False) 
#             for method_config in self.access_methods.values()
#         )
    
#     def get_enabled_access_methods(self) -> List[str]:
#         """Get list of enabled access methods"""
#         return [
#             method for method, config in self.access_methods.items() 
#             if config.get('enabled', False)
#         ]
    
#     def get_access_type(self) -> str:
#         """Get access type category"""
#         enabled_methods = self.get_enabled_access_methods()
#         if 'hotspot' in enabled_methods and 'pppoe' in enabled_methods:
#             return 'dual'
#         elif 'hotspot' in enabled_methods:
#             return 'hotspot'
#         elif 'pppoe' in enabled_methods:
#             return 'pppoe'
#         return 'none'
    
#     def can_be_used_on_router(self, router_id: int) -> bool:
#         """Check if plan can be used on specific router"""
#         if not self.router_specific:
#             return True
        
#         try:
#             from network_management.models.router_management_model import Router
#             return self.allowed_routers.filter(id=router_id).exists()
#         except ImportError:
#             # Network management app not installed
#             logger.warning("Network management app not installed, skipping router check")
#             return True
    
#     def increment_purchases(self):
#         """Increment purchase count"""
#         self.purchases = models.F('purchases') + 1
#         self.save(update_fields=['purchases', 'updated_at'])
    
#     def get_router_compatibility(self) -> List[Dict[str, Any]]:
#         """Get router compatibility information"""
#         try:
#             from network_management.models.router_management_model import Router
#             routers = Router.objects.filter(is_active=True, status='connected')
#         except ImportError:
#             # Network management app not installed
#             logger.warning("Network management app not installed, skipping router compatibility")
#             return []
        
#         compatibility_data = []
        
#         for router in routers:
#             compatible = self.can_be_used_on_router(router.id)
#             compatibility_data.append({
#                 'router_id': router.id,
#                 'router_name': router.name,
#                 'compatible': compatible,
#                 'access_methods': self.get_enabled_access_methods() if compatible else []
#             })
        
#         return compatibility_data
    
#     def supports_access_method(self, access_method: str) -> bool:
#         """
#         Check if plan supports specific access method
#         """
#         return access_method in self.get_enabled_access_methods()
    
#     def get_config_for_method(self, method: str) -> Dict[str, Any]:
#         """Get configuration for specific access method"""
#         return self.access_methods.get(method, {})
    
#     def has_time_variant(self) -> bool:
#         """Check if plan has time variant configuration"""
#         return self.time_variant is not None and self.time_variant.is_active
    
#     def is_available_for_client(self, check_time=True) -> Dict[str, Any]:
#         """
#         Check if plan is available for purchase
#         """
#         # Check if plan is active
#         if not self.active:
#             return {
#                 'available': False,
#                 'reason': 'Plan is inactive',
#                 'code': 'plan_inactive'
#             }
        
#         # Check time variant availability if enabled
#         if check_time and self.has_time_variant():
#             time_variant = self.time_variant
#             is_available = time_variant.is_available_now()
            
#             response = {
#                 'available': is_available,
#                 'time_variant_active': True,
#                 'summary': time_variant.get_availability_summary(),
#                 'code': 'time_restricted' if not is_available else 'available'
#             }
            
#             if not is_available:
#                 response['reason'] = 'Plan is not available at this time'
#                 response['next_available'] = time_variant.get_next_available_time()
            
#             return response
        
#         return {
#             'available': True,
#             'reason': 'Plan is available',
#             'code': 'available',
#             'time_variant_active': False
#         }
    
#     def get_time_variant_summary(self) -> Dict[str, Any]:
#         """Get time variant summary"""
#         if not self.has_time_variant():
#             return {
#                 'has_time_variant': False,
#                 'message': 'No time restrictions'
#             }
        
#         return {
#             'has_time_variant': True,
#             'is_available_now': self.time_variant.is_available_now(),
#             'summary': self.time_variant.get_availability_summary(),
#             'next_available': self.time_variant.get_next_available_time() if not self.time_variant.is_available_now() else None
#         }
    
#     @classmethod
#     def get_cached_plan(cls, plan_id):
#         """Get plan from cache or database"""
#         cache_key = f"internet_plan:{plan_id}"
#         plan = cache.get(cache_key)
        
#         if plan is None:
#             try:
#                 plan = cls.objects.select_related('time_variant').get(id=plan_id, active=True)
#                 cache.set(cache_key, plan, 300)  # Cache for 5 minutes
#             except cls.DoesNotExist:
#                 return None
        
#         return plan
    
#     @classmethod
#     def get_available_plans_for_client(cls, client_type='hotspot', router_id=None):
#         """
#         Get all plans available for a specific client type
#         """
#         cache_key = f"available_plans:{client_type}:{router_id or 'all'}"
#         plans = cache.get(cache_key)
        
#         if plans is None:
#             # Start with active plans
#             queryset = cls.objects.filter(active=True).select_related('time_variant')
            
#             # Filter by client type
#             if client_type == 'hotspot':
#                 queryset = queryset.filter(access_methods__hotspot__enabled=True)
#             elif client_type == 'pppoe':
#                 queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
#             # Filter by router compatibility if router_id provided
#             if router_id:
#                 queryset = queryset.filter(
#                     models.Q(router_specific=False) |
#                     models.Q(router_specific=True, allowed_routers__id=router_id)
#                 ).distinct()
            
#             # Get all plans and filter by time availability
#             all_plans = list(queryset.order_by('-priority_level', 'price'))
            
#             # Filter by time variant availability
#             available_plans = []
#             for plan in all_plans:
#                 availability = plan.is_available_for_client()
#                 if availability['available']:
#                     plan.availability_info = availability  # Attach availability info
#                     available_plans.append(plan)
            
#             plans = available_plans
#             cache.set(cache_key, plans, 60)  # Cache for 1 minute (time-sensitive)
        
#         return plans
    
#     @classmethod
#     def get_plans_by_category(cls, category, limit=10):
#         """Get plans by category with caching"""
#         cache_key = f"plans_by_category:{category}:{limit}"
#         plans = cache.get(cache_key)
        
#         if plans is None:
#             plans = list(cls.objects.filter(
#                 category=category, 
#                 active=True
#             ).select_related('time_variant').order_by('priority_level', 'price')[:limit])
#             cache.set(cache_key, plans, 300)  # Cache for 5 minutes
        
#         return plans
    
#     def calculate_effective_price(self, quantity=1, discount_code=None):
#         """
#         Calculate effective price with quantity and discounts
#         """
#         from internet_plans.services.pricing_service import PricingService
#         return PricingService.calculate_effective_price(
#             plan=self,
#             quantity=quantity,
#             discount_code=discount_code
#         )
    
#     def get_technical_config(self, access_method: str) -> Dict[str, Any]:
#         """
#         Get technical configuration for network activation
#         """
#         config = self.get_config_for_method(access_method)
        
#         # Return only technical configuration
#         return {
#             'download_speed': config.get('download_speed', {}).get('value', '10'),
#             'upload_speed': config.get('upload_speed', {}).get('value', '5'),
#             'data_limit': config.get('data_limit', {}).get('value', '10'),
#             'data_unit': config.get('data_limit', {}).get('unit', 'gb'),
#             'usage_limit': config.get('usage_limit', {}).get('value', '24'),
#             'usage_unit': config.get('usage_limit', {}).get('unit', 'hours'),
#             'max_devices': config.get('max_devices', 1),
#             'session_timeout': config.get('session_timeout', 86400),
#             'idle_timeout': config.get('idle_timeout', 300),
#             'validity_period': config.get('validity_period', {}).get('value', '30'),
#             'validity_unit': config.get('validity_period', {}).get('unit', 'days'),
#             'mac_binding': config.get('mac_binding', False),
#         }
    
#     # Properties for serializer compatibility
#     @property
#     def time_variant_id(self):
#         """Property to get time variant ID for serializer"""
#         return self.time_variant.id if self.time_variant else None
    
#     @property
#     def template_id(self):
#         """Property to get template ID for serializer"""
#         return self.template.id if self.template else None









"""
Internet Plans - Core Plan Models with Time Variant Feature
UPDATED: Production-ready with consistent snake_case, optimized queries, and proper validation
FIXED: Added subscription integration properties and methods
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import logging
import json
from typing import Dict, List, Optional, Tuple, Any
from django.db import transaction
from django.core.cache import cache

logger = logging.getLogger(__name__)


class TimeVariantConfig(models.Model):
    """
    Time Variant Configuration for Internet Plans
    Controls when plans are available for purchase in captive portal
    """
    
    # Days of week for availability
    DAYS_OF_WEEK = (
        ('mon', 'Monday'),
        ('tue', 'Tuesday'),
        ('wed', 'Wednesday'),
        ('thu', 'Thursday'),
        ('fri', 'Friday'),
        ('sat', 'Saturday'),
        ('sun', 'Sunday'),
    )
    
    # Time units for duration
    TIME_UNITS = (
        ('hours', 'Hours'),
        ('days', 'Days'),
        ('weeks', 'Weeks'),
        ('months', 'Months'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core time variant settings
    is_active = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Enable time variant controls for this plan"
    )
    
    # 1. Time of day availability (for captive portal visibility)
    start_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Start time when plan becomes visible in captive portal (24-hour format)"
    )
    end_time = models.TimeField(
        null=True,
        blank=True,
        help_text="End time when plan disappears from captive portal (24-hour format)"
    )
    
    # 2. Days of week availability
    available_days = models.JSONField(
        default=list,
        blank=True,
        help_text="Days of week when plan is available (e.g., ['mon', 'wed', 'fri'])"
    )
    
    # 3. Scheduled availability (specific date ranges)
    schedule_active = models.BooleanField(
        default=False,
        help_text="Enable scheduled availability"
    )
    schedule_start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Start date/time for scheduled availability"
    )
    schedule_end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="End date/time for scheduled availability"
    )
    
    # 4. Duration-based availability
    duration_active = models.BooleanField(
        default=False,
        help_text="Enable duration-based availability"
    )
    duration_value = models.PositiveIntegerField(
        default=0,
        help_text="Duration value (e.g., 7 for 7 days)"
    )
    duration_unit = models.CharField(
        max_length=10,
        choices=TIME_UNITS,
        default='days',
        help_text="Duration unit"
    )
    duration_start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Start date for duration-based availability"
    )
    
    # Exclusion dates (dates when plan is NOT available)
    exclusion_dates = models.JSONField(
        default=list,
        blank=True,
        help_text="Specific dates when plan is NOT available (YYYY-MM-DD format)"
    )
    
    # Timezone for time calculations
    timezone = models.CharField(
        max_length=50,
        default='Africa/Nairobi',
        help_text="Timezone for time calculations (IANA format)"
    )
    
    # Override flag for immediate availability
    force_available = models.BooleanField(
        default=False,
        help_text="Override all time restrictions and make plan available"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Time Variant Configuration'
        verbose_name_plural = 'Time Variant Configurations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'created_at']),
            models.Index(fields=['schedule_active', 'schedule_end_date']),
        ]
    
    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"Time Variant Config ({status})"
    
    def clean(self):
        """Validate time variant configuration"""
        errors = {}
        
        if not self.is_active:
            # If not active, no further validation needed
            return
        
        # Validate time range
        if self.start_time and self.end_time:
            if self.start_time >= self.end_time:
                errors['end_time'] = 'End time must be after start time'
        
        # Validate available days
        if self.available_days:
            if not isinstance(self.available_days, list):
                errors['available_days'] = 'Available days must be a list'
            else:
                valid_days = [day[0] for day in self.DAYS_OF_WEEK]
                invalid_days = []
                for day in self.available_days:
                    if day not in valid_days:
                        invalid_days.append(day)
                if invalid_days:
                    errors['available_days'] = f'Invalid day(s): {", ".join(invalid_days)}. Must be one of {valid_days}'
        
        # Validate schedule dates
        if self.schedule_active:
            if not self.schedule_start_date:
                errors['schedule_start_date'] = 'Schedule start date is required when schedule is active'
            if not self.schedule_end_date:
                errors['schedule_end_date'] = 'Schedule end date is required when schedule is active'
            elif self.schedule_start_date and self.schedule_end_date:
                if self.schedule_start_date >= self.schedule_end_date:
                    errors['schedule_end_date'] = 'Schedule end date must be after start date'
        
        # Validate duration
        if self.duration_active:
            if self.duration_value <= 0:
                errors['duration_value'] = 'Duration value must be greater than 0'
            if not self.duration_start_date:
                errors['duration_start_date'] = 'Duration start date is required when duration is active'
        
        # Validate exclusion dates
        if self.exclusion_dates:
            if not isinstance(self.exclusion_dates, list):
                errors['exclusion_dates'] = 'Exclusion dates must be a list'
            else:
                for date_str in self.exclusion_dates:
                    try:
                        datetime.strptime(date_str, '%Y-%m-%d')
                    except ValueError:
                        errors['exclusion_dates'] = f'Invalid date format: {date_str}. Use YYYY-MM-DD'
                        break
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    def is_available_now(self) -> bool:
        """
        Check if plan is available for purchase right now
        """
        if not self.is_active:
            return True  # Time variant not active, always available
        
        if self.force_available:
            return True  # Override enabled
        
        now = timezone.now()
        
        # 1. Check time of day availability
        if self.start_time and self.end_time:
            current_time = now.time()
            if not (self.start_time <= current_time <= self.end_time):
                return False
        
        # 2. Check day of week availability
        if self.available_days:
            current_day = now.strftime('%a').lower()[:3]  # 'mon', 'tue', etc.
            if current_day not in self.available_days:
                return False
        
        # 3. Check scheduled availability
        if self.schedule_active and self.schedule_start_date and self.schedule_end_date:
            if not (self.schedule_start_date <= now <= self.schedule_end_date):
                return False
        
        # 4. Check duration-based availability
        if self.duration_active and self.duration_start_date:
            duration_end = self.calculate_duration_end()
            if now > duration_end:
                return False
        
        # 5. Check exclusion dates
        if self.exclusion_dates:
            current_date_str = now.date().isoformat()
            if current_date_str in self.exclusion_dates:
                return False
        
        return True
    
    def calculate_duration_end(self):
        """Calculate end date based on duration settings"""
        if not self.duration_active or not self.duration_start_date:
            return None
        
        duration_end = self.duration_start_date
        
        if self.duration_unit == 'hours':
            duration_end += timedelta(hours=self.duration_value)
        elif self.duration_unit == 'days':
            duration_end += timedelta(days=self.duration_value)
        elif self.duration_unit == 'weeks':
            duration_end += timedelta(weeks=self.duration_value)
        elif self.duration_unit == 'months':
            # Approximate month as 30 days
            duration_end += timedelta(days=self.duration_value * 30)
        
        return duration_end
    
    def get_availability_summary(self) -> Dict[str, Any]:
        """Get human-readable availability summary"""
        if not self.is_active:
            return {'status': 'always_available', 'message': 'Available at all times'}
        
        summary = {
            'status': 'time_restricted',
            'is_available_now': self.is_available_now(),
            'restrictions': []
        }
        
        if self.start_time and self.end_time:
            summary['restrictions'].append({
                'type': 'time_of_day',
                'start': self.start_time.strftime('%H:%M'),
                'end': self.end_time.strftime('%H:%M'),
                'description': f'Available from {self.start_time.strftime("%H:%M")} to {self.end_time.strftime("%H:%M")}'
            })
        
        if self.available_days:
            day_names = [dict(self.DAYS_OF_WEEK).get(day, day) for day in self.available_days]
            summary['restrictions'].append({
                'type': 'days_of_week',
                'days': self.available_days,
                'day_names': day_names,
                'description': f'Available on {", ".join(day_names)}'
            })
        
        if self.schedule_active and self.schedule_start_date and self.schedule_end_date:
            summary['restrictions'].append({
                'type': 'scheduled',
                'start': self.schedule_start_date.isoformat(),
                'end': self.schedule_end_date.isoformat(),
                'description': f'Scheduled from {self.schedule_start_date.strftime("%Y-%m-%d %H:%M")} to {self.schedule_end_date.strftime("%Y-%m-%d %H:%M")}'
            })
        
        if self.duration_active and self.duration_start_date:
            duration_end = self.calculate_duration_end()
            summary['restrictions'].append({
                'type': 'duration',
                'value': self.duration_value,
                'unit': self.duration_unit,
                'start': self.duration_start_date.isoformat(),
                'end': duration_end.isoformat() if duration_end else None,
                'description': f'Available for {self.duration_value} {self.duration_unit} from {self.duration_start_date.strftime("%Y-%m-%d %H:%M")}'
            })
        
        if self.exclusion_dates:
            summary['restrictions'].append({
                'type': 'exclusions',
                'dates': self.exclusion_dates,
                'count': len(self.exclusion_dates),
                'description': f'Not available on {len(self.exclusion_dates)} specific dates'
            })
        
        return summary
    
    def get_next_available_time(self) -> Optional[Dict[str, Any]]:
        """
        Calculate next available time if currently unavailable
        """
        if not self.is_active or self.is_available_now():
            return None
        
        now = timezone.now()
        next_available = None
        
        # Check time of day restrictions
        if self.start_time and self.end_time:
            current_time = now.time()
            if current_time < self.start_time:
                # Available later today
                next_available = {
                    'type': 'time_of_day',
                    'time': self.start_time.strftime('%H:%M'),
                    'datetime': datetime.combine(now.date(), self.start_time).isoformat(),
                    'message': f'Available today at {self.start_time.strftime("%H:%M")}'
                }
            elif current_time > self.end_time:
                # Available tomorrow
                tomorrow = now + timedelta(days=1)
                tomorrow_date = tomorrow.date()
                next_available_time = datetime.combine(tomorrow_date, self.start_time)
                next_available = {
                    'type': 'time_of_day',
                    'time': self.start_time.strftime('%H:%M'),
                    'datetime': next_available_time.isoformat(),
                    'message': f'Available tomorrow at {self.start_time.strftime("%H:%M")}'
                }
        
        # Check day of week restrictions
        if self.available_days and not next_available:
            current_day = now.strftime('%a').lower()[:3]
            days_ahead = 0
            
            # Find next available day
            for i in range(1, 8):  # Check next 7 days
                next_day = (now + timedelta(days=i)).strftime('%a').lower()[:3]
                if next_day in self.available_days:
                    days_ahead = i
                    break
            
            if days_ahead > 0:
                next_date = now + timedelta(days=days_ahead)
                day_name = dict(self.DAYS_OF_WEEK).get(next_day, next_day)
                next_available = {
                    'type': 'day_of_week',
                    'date': next_date.date().isoformat(),
                    'datetime': next_date.isoformat(),
                    'days_ahead': days_ahead,
                    'day_name': day_name,
                    'message': f'Available on {day_name} ({next_date.strftime("%Y-%m-%d")})'
                }
        
        # Check schedule restrictions
        if self.schedule_active and self.schedule_start_date and not next_available:
            if now < self.schedule_start_date:
                next_available = {
                    'type': 'scheduled',
                    'datetime': self.schedule_start_date.isoformat(),
                    'message': f'Available starting {self.schedule_start_date.strftime("%Y-%m-%d %H:%M")}'
                }
        
        return next_available


class PlanTemplate(models.Model):
    """
    Template for creating Internet Plans
    Templates define the structure that can be reused for multiple plans
    """
    
    CATEGORIES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'),
        ('Enterprise', 'Enterprise'),
    )
    
    # Core Template Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=20, choices=CATEGORIES, default='Residential', db_index=True)
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Base price in KSH"
    )
    
    # Access Methods Configuration
    access_methods = models.JSONField(
        default=dict,
        help_text="Configuration for hotspot and PPPoE access methods"
    )
    
    # Time Variant Configuration
    time_variant = models.OneToOneField(
        TimeVariantConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plan_template',
        help_text="Time variant configuration for this template"
    )
    
    # Template Management
    is_public = models.BooleanField(default=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    usage_count = models.PositiveIntegerField(default=0, db_index=True)
    
    # Ownership
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='created_templates',
        null=True,
        blank=True,
        help_text="Admin who created this template"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        verbose_name = 'Plan Template'
        verbose_name_plural = 'Plan Templates'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_public', 'is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['usage_count']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category})"
    
    def clean(self):
        """Validate template configuration"""
        errors = {}
        
        # Validate JSON structure
        if not isinstance(self.access_methods, dict):
            errors['access_methods'] = 'Access methods must be a dictionary'
        
        # Validate access method configurations
        required_methods = ['hotspot', 'pppoe']
        for method in required_methods:
            if method not in self.access_methods:
                errors['access_methods'] = f'Missing {method} configuration'
                continue
            
            config = self.access_methods[method]
            if not isinstance(config, dict):
                errors['access_methods'] = f'{method} configuration must be a dictionary'
                continue
            
            if config.get('enabled', False):
                # Validate required fields for enabled methods
                required_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit']
                for field in required_fields:
                    if field not in config:
                        errors['access_methods'] = f'Missing {field} for enabled {method}'
                        continue
                    
                    field_config = config[field]
                    if not isinstance(field_config, dict):
                        errors['access_methods'] = f'{method}.{field} must be a dictionary'
                        continue
                    
                    if 'value' not in field_config:
                        errors['access_methods'] = f'{method}.{field}.value is required'
        
        if not self.has_enabled_access_methods():
            errors['access_methods'] = 'At least one access method must be enabled'
        
        # Validate time variant if exists
        if self.time_variant:
            try:
                self.time_variant.full_clean()
            except ValidationError as e:
                errors['time_variant'] = e.message_dict
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation and default configuration"""
        # Ensure access methods are properly initialized
        if not self.access_methods or not isinstance(self.access_methods, dict):
            self.set_default_access_methods()
        else:
            # Ensure both methods exist with proper structure
            self._ensure_access_methods_structure()
        
        self.full_clean()
        
        # Clear template cache
        cache_key = f"plan_template:{self.id}"
        cache.delete(cache_key)
        # Use appropriate cache clear method
        try:
            cache.delete_pattern("plan_templates:*")
        except AttributeError:
            # Fallback for cache backends that don't support delete_pattern
            pass
        
        super().save(*args, **kwargs)
    
    def _ensure_access_methods_structure(self):
        """Ensure access methods have proper structure"""
        # Ensure both methods exist
        if 'hotspot' not in self.access_methods:
            self.access_methods['hotspot'] = {}
        if 'pppoe' not in self.access_methods:
            self.access_methods['pppoe'] = {}
        
        # Ensure each method has required fields with proper defaults
        for method in ['hotspot', 'pppoe']:
            config = self.access_methods[method]
            if not isinstance(config, dict):
                config = {}
            
            # Ensure enabled is boolean
            if 'enabled' not in config:
                config['enabled'] = False
            elif isinstance(config['enabled'], str):
                config['enabled'] = config['enabled'].lower() == 'true'
            
            # Ensure required nested fields exist
            nested_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']
            for field in nested_fields:
                if field not in config or not isinstance(config[field], dict):
                    config[field] = {'value': '', 'unit': self._get_default_unit(field)}
                elif 'value' not in config[field]:
                    config[field]['value'] = ''
                elif 'unit' not in config[field]:
                    config[field]['unit'] = self._get_default_unit(field)
            
            # Ensure numeric fields exist
            numeric_fields = ['bandwidth_limit', 'max_devices', 'session_timeout', 'idle_timeout']
            for field in numeric_fields:
                if field not in config:
                    config[field] = ''
            
            # PPPoE specific fields
            if method == 'pppoe':
                pppoe_fields = ['ip_pool', 'service_name', 'mtu']
                for field in pppoe_fields:
                    if field not in config:
                        config[field] = ''
            
            # MAC binding
            if 'mac_binding' not in config:
                config['mac_binding'] = False
            elif isinstance(config['mac_binding'], str):
                config['mac_binding'] = config['mac_binding'].lower() == 'true'
            
            self.access_methods[method] = config
    
    def _get_default_unit(self, field):
        """Get default unit for a field"""
        units = {
            'download_speed': 'mbps',
            'upload_speed': 'mbps',
            'data_limit': 'gb',
            'usage_limit': 'hours',
            'validity_period': 'days'
        }
        return units.get(field, '')
    
    def set_default_access_methods(self):
        """Set default access method configurations"""
        self.access_methods = {
            'hotspot': {
                'enabled': True,
                'download_speed': {'value': '10', 'unit': 'mbps'},
                'upload_speed': {'value': '5', 'unit': 'mbps'},
                'data_limit': {'value': '10', 'unit': 'gb'},
                'usage_limit': {'value': '24', 'unit': 'hours'},
                'bandwidth_limit': '',
                'max_devices': '',
                'session_timeout': '',
                'idle_timeout': '',
                'validity_period': {'value': '30', 'unit': 'days'},
                'mac_binding': False,
            },
            'pppoe': {
                'enabled': False,
                'download_speed': {'value': '10', 'unit': 'mbps'},
                'upload_speed': {'value': '5', 'unit': 'mbps'},
                'data_limit': {'value': '10', 'unit': 'gb'},
                'usage_limit': {'value': '24', 'unit': 'hours'},
                'bandwidth_limit': '',
                'max_devices': '',
                'session_timeout': '',
                'idle_timeout': '',
                'validity_period': {'value': '30', 'unit': 'days'},
                'mac_binding': False,
                'ip_pool': '',
                'service_name': '',
                'mtu': '',
            }
        }
    
    def increment_usage(self):
        """Atomically increment usage count"""
        with transaction.atomic():
            PlanTemplate.objects.filter(pk=self.pk).update(
                usage_count=models.F('usage_count') + 1
            )
            self.refresh_from_db()
    
    def has_enabled_access_methods(self) -> bool:
        """Check if any access method is enabled"""
        return any(
            method_config.get('enabled', False) 
            for method_config in self.access_methods.values()
        )
    
    def get_enabled_access_methods(self) -> List[str]:
        """Get list of enabled access methods"""
        return [
            method for method, config in self.access_methods.items() 
            if config.get('enabled', False)
        ]
    
    def get_access_type(self) -> str:
        """Get access type category"""
        enabled_methods = self.get_enabled_access_methods()
        if 'hotspot' in enabled_methods and 'pppoe' in enabled_methods:
            return 'dual'
        elif 'hotspot' in enabled_methods:
            return 'hotspot'
        elif 'pppoe' in enabled_methods:
            return 'pppoe'
        return 'none'
    
    def get_config_for_method(self, method: str) -> Dict[str, Any]:
        """Get configuration for specific access method"""
        return self.access_methods.get(method, {})
    
    def has_time_variant(self) -> bool:
        """Check if template has time variant configuration"""
        return self.time_variant is not None and self.time_variant.is_active
    
    def is_available_for_purchase(self, client_type='hotspot') -> Dict[str, Any]:
        """
        Check if template/plan is available for purchase
        """
        if not self.has_time_variant():
            return {
                'available': True,
                'reason': 'No time restrictions',
                'next_available': None
            }
        
        time_variant = self.time_variant
        is_available = time_variant.is_available_now()
        
        response = {
            'available': is_available,
            'time_variant_active': True,
            'summary': time_variant.get_availability_summary()
        }
        
        if not is_available:
            response['next_available'] = time_variant.get_next_available_time()
        
        return response
    
    @classmethod
    def get_cached_template(cls, template_id):
        """Get template from cache or database"""
        cache_key = f"plan_template:{template_id}"
        template = cache.get(cache_key)
        
        if template is None:
            try:
                template = cls.objects.select_related('time_variant').get(id=template_id, is_active=True)
                cache.set(cache_key, template, 300)  # Cache for 5 minutes
            except cls.DoesNotExist:
                return None
        
        return template
    
    # Property for serializer compatibility
    @property
    def time_variant_id(self):
        """Property to get time variant ID for serializer"""
        return self.time_variant.id if self.time_variant else None


class InternetPlan(models.Model):
    """
    Internet Plan that can be purchased by clients
    Each plan is created from a template or custom configuration
    UPDATED: Added subscription integration properties
    """
    
    PLAN_TYPES = (
        ('Paid', 'Paid'),
        ('Free_trial', 'Free Trial'),
        ('Promotional', 'Promotional'),
    )
    
    CATEGORIES = (
        ('Residential', 'Residential'),
        ('Business', 'Business'),
        ('Promotional', 'Promotional'),
        ('Enterprise', 'Enterprise'),
    )
    
    PRIORITY_LEVELS = (
        (1, 'Lowest'),
        (2, 'Low'),
        (3, 'Medium'),
        (4, 'High'),
        (5, 'Highest'),
        (6, 'Critical'),
        (7, 'Premium'),
        (8, 'VIP'),
    )
    
    # Core Plan Fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, default='Paid', db_index=True)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0'))],
        help_text="Price in KSH"
    )
    active = models.BooleanField(default=True, db_index=True)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='Residential', db_index=True)
    description = models.TextField(blank=True, default="")
    
    # Template Reference
    template = models.ForeignKey(
        PlanTemplate, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='created_plans',
        help_text="Template used to create this plan"
    )
    
    # Access Methods
    access_methods = models.JSONField(
        default=dict,
        help_text="Configuration for hotspot and PPPoE access methods"
    )
    
    # Time Variant Configuration
    time_variant = models.OneToOneField(
        TimeVariantConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='internet_plan',
        help_text="Time variant configuration for this plan"
    )
    
    # Plan Configuration
    priority_level = models.IntegerField(choices=PRIORITY_LEVELS, default=4)
    router_specific = models.BooleanField(default=False)
    allowed_routers = models.ManyToManyField(
        'network_management.Router',
        blank=True,
        related_name='allowed_plans',
        help_text="Routers where this plan can be used (if router_specific)"
    )
    
    # FUP (Fair Usage Policy)
    fup_policy = models.TextField(blank=True, default="")
    fup_threshold = models.PositiveIntegerField(
        default=80,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Usage threshold percentage for FUP"
    )
    
    # Usage Tracking
    purchases = models.PositiveIntegerField(default=0, db_index=True)
    
    # Session Tracking
    client_sessions = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_plans',
        help_text="Admin who created this plan"
    )
    
    class Meta:
        verbose_name = 'Internet Plan'
        verbose_name_plural = 'Internet Plans'
        ordering = ['-priority_level', 'name']
        indexes = [
            models.Index(fields=['name', 'active']),
            models.Index(fields=['plan_type', 'active']),
            models.Index(fields=['category', 'active']),
            models.Index(fields=['price']),
            models.Index(fields=['purchases']),
            models.Index(fields=['created_at']),
            models.Index(fields=['priority_level', 'active']),
        ]
    
    def __str__(self):
        plan_type = self.get_plan_type_display()
        return f"{self.name} ({plan_type}) - KSH {self.price}"
    
    # ==================== SUBSCRIPTION INTEGRATION PROPERTIES ====================
    
    @property
    def subscriptions(self):
        """
        Get all subscriptions for this plan from service_operations
        Returns empty list if service_operations not available
        """
        try:
            from service_operations.models import Subscription
            return Subscription.objects.filter(internet_plan_id=self.id)
        except (ImportError, LookupError, Exception) as e:
            logger.debug(f"Could not get subscriptions for plan {self.id}: {e}")
            return []
    
    @property
    def subscription_count(self):
        """Get total number of subscriptions for this plan"""
        try:
            return self.subscriptions.count()
        except Exception:
            return 0
    
    @property
    def active_subscriptions(self):
        """Get active subscriptions for this plan"""
        try:
            return self.subscriptions.filter(status='active', is_active=True)
        except Exception:
            return []
    
    @property
    def active_subscription_count(self):
        """Get count of active subscriptions for this plan"""
        try:
            return self.active_subscriptions.count()
        except Exception:
            return 0
    
    @property
    def pending_subscriptions(self):
        """Get pending subscriptions for this plan"""
        try:
            return self.subscriptions.filter(status='pending_activation')
        except Exception:
            return []
    
    @property
    def pending_subscription_count(self):
        """Get count of pending subscriptions for this plan"""
        try:
            return self.pending_subscriptions.count()
        except Exception:
            return 0
    
    @property
    def expired_subscriptions(self):
        """Get expired subscriptions for this plan"""
        try:
            return self.subscriptions.filter(status='expired')
        except Exception:
            return []
    
    @property
    def expired_subscription_count(self):
        """Get count of expired subscriptions for this plan"""
        try:
            return self.expired_subscriptions.count()
        except Exception:
            return 0
    
    @property
    def cancelled_subscriptions(self):
        """Get cancelled subscriptions for this plan"""
        try:
            return self.subscriptions.filter(status='cancelled')
        except Exception:
            return []
    
    @property
    def cancelled_subscription_count(self):
        """Get count of cancelled subscriptions for this plan"""
        try:
            return self.cancelled_subscriptions.count()
        except Exception:
            return 0
    
    @property
    def suspended_subscriptions(self):
        """Get suspended subscriptions for this plan"""
        try:
            return self.subscriptions.filter(status='suspended')
        except Exception:
            return []
    
    @property
    def suspended_subscription_count(self):
        """Get count of suspended subscriptions for this plan"""
        try:
            return self.suspended_subscriptions.count()
        except Exception:
            return 0
    
    @property
    def total_data_used(self):
        """Get total data used across all subscriptions for this plan (in bytes)"""
        try:
            active_subs = self.active_subscriptions
            if active_subs.exists():
                return sum(sub.used_data_bytes for sub in active_subs)
            return 0
        except Exception:
            return 0
    
    @property
    def total_data_used_gb(self):
        """Get total data used in GB"""
        return self.total_data_used / (1024**3)
    
    @property
    def total_time_used(self):
        """Get total time used across all subscriptions (in seconds)"""
        try:
            active_subs = self.active_subscriptions
            if active_subs.exists():
                return sum(sub.used_time_seconds for sub in active_subs)
            return 0
        except Exception:
            return 0
    
    @property
    def total_time_used_hours(self):
        """Get total time used in hours"""
        return self.total_time_used / 3600
    
    @property
    def estimated_revenue(self):
        """Calculate estimated revenue from this plan"""
        try:
            return self.active_subscription_count * float(self.price)
        except Exception:
            return 0.0
    
    @property
    def subscription_stats(self):
        """Get comprehensive subscription statistics"""
        try:
            subs = self.subscriptions
            return {
                'total': subs.count(),
                'active': self.active_subscription_count,
                'pending': self.pending_subscription_count,
                'expired': self.expired_subscription_count,
                'cancelled': self.cancelled_subscription_count,
                'suspended': self.suspended_subscription_count,
                'total_data_used_gb': round(self.total_data_used_gb, 2),
                'total_time_used_hours': round(self.total_time_used_hours, 2),
                'estimated_revenue': round(self.estimated_revenue, 2),
            }
        except Exception as e:
            logger.error(f"Error getting subscription stats for plan {self.id}: {e}")
            return {
                'total': 0, 'active': 0, 'pending': 0, 'expired': 0,
                'cancelled': 0, 'suspended': 0, 'total_data_used_gb': 0,
                'total_time_used_hours': 0, 'estimated_revenue': 0,
            }
    
    # ==================== END SUBSCRIPTION INTEGRATION ====================
    
    def clean(self):
        """Validate plan configuration"""
        errors = {}
        
        # Free Trial validation
        if self.plan_type == 'Free_trial':
            if self.price != Decimal('0'):
                errors['price'] = 'Free Trial plans must have price set to 0'
            if self.router_specific:
                errors['router_specific'] = 'Free Trial plans cannot be router-specific'
            if self.priority_level > 4:
                errors['priority_level'] = 'Free Trial plans cannot have premium priority levels'
        
        # Access Methods validation
        if not isinstance(self.access_methods, dict):
            errors['access_methods'] = 'Access methods must be a dictionary'
        else:
            required_methods = ['hotspot', 'pppoe']
            for method in required_methods:
                if method not in self.access_methods:
                    errors['access_methods'] = f'Missing {method} configuration'
                    continue
                
                config = self.access_methods[method]
                if not isinstance(config, dict):
                    errors['access_methods'] = f'{method} configuration must be a dictionary'
                    continue
                
                if config.get('enabled', False):
                    required_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit']
                    for field in required_fields:
                        if field not in config:
                            errors['access_methods'] = f'Missing {field} for enabled {method}'
                            continue
                        
                        field_config = config[field]
                        if not isinstance(field_config, dict):
                            errors['access_methods'] = f'{method}.{field} must be a dictionary'
                            continue
                        
                        if 'value' not in field_config:
                            errors['access_methods'] = f'{method}.{field}.value is required'
        
        if not self.has_enabled_access_methods():
            errors['access_methods'] = 'At least one access method must be enabled'
        
        # Validate time variant if exists
        if self.time_variant:
            try:
                self.time_variant.full_clean()
            except ValidationError as e:
                errors['time_variant'] = e.message_dict
        
        # Validate FUP threshold
        if self.fup_threshold and (self.fup_threshold < 1 or self.fup_threshold > 100):
            errors['fup_threshold'] = 'FUP threshold must be between 1% and 100%'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Save with validation and ensure access methods are properly structured"""
        # Ensure access methods are properly initialized
        if not self.access_methods or not isinstance(self.access_methods, dict):
            self.set_default_access_methods()
        else:
            # Ensure both methods exist with proper structure
            self._ensure_access_methods_structure()
        
        self.full_clean()
        
        # Clear plan cache
        cache.delete(f"internet_plan:{self.id}")
        # Use appropriate cache clear method
        try:
            cache.delete_pattern("internet_plans:*")
        except AttributeError:
            # Fallback for cache backends that don't support delete_pattern
            pass
        
        super().save(*args, **kwargs)
    
    def _ensure_access_methods_structure(self):
        """Ensure access methods have proper structure"""
        # Ensure both methods exist
        if 'hotspot' not in self.access_methods:
            self.access_methods['hotspot'] = {}
        if 'pppoe' not in self.access_methods:
            self.access_methods['pppoe'] = {}
        
        # Ensure each method has required fields with proper defaults
        for method in ['hotspot', 'pppoe']:
            config = self.access_methods[method]
            if not isinstance(config, dict):
                config = {}
            
            # Ensure enabled is boolean
            if 'enabled' not in config:
                config['enabled'] = method == 'hotspot'  # Default hotspot enabled
            elif isinstance(config['enabled'], str):
                config['enabled'] = config['enabled'].lower() == 'true'
            
            # Ensure required nested fields exist with proper structure
            nested_fields = ['download_speed', 'upload_speed', 'data_limit', 'usage_limit', 'validity_period']
            for field in nested_fields:
                if field not in config or not isinstance(config[field], dict):
                    config[field] = {'value': '', 'unit': self._get_default_unit(field)}
                elif 'value' not in config[field]:
                    config[field]['value'] = ''
                elif 'unit' not in config[field]:
                    config[field]['unit'] = self._get_default_unit(field)
            
            # Ensure numeric fields exist
            numeric_fields = ['bandwidth_limit', 'max_devices', 'session_timeout', 'idle_timeout']
            for field in numeric_fields:
                if field not in config:
                    config[field] = ''
            
            # PPPoE specific fields
            if method == 'pppoe':
                pppoe_fields = ['ip_pool', 'service_name', 'mtu']
                for field in pppoe_fields:
                    if field not in config:
                        config[field] = ''
            
            # MAC binding
            if 'mac_binding' not in config:
                config['mac_binding'] = False
            elif isinstance(config['mac_binding'], str):
                config['mac_binding'] = config['mac_binding'].lower() == 'true'
            
            self.access_methods[method] = config
    
    def _get_default_unit(self, field):
        """Get default unit for a field"""
        units = {
            'download_speed': 'mbps',
            'upload_speed': 'mbps',
            'data_limit': 'gb',
            'usage_limit': 'hours',
            'validity_period': 'days'
        }
        return units.get(field, '')
    
    def set_default_access_methods(self):
        """Set default access method configurations"""
        self.access_methods = {
            'hotspot': {
                'enabled': True,
                'download_speed': {'value': '10', 'unit': 'mbps'},
                'upload_speed': {'value': '5', 'unit': 'mbps'},
                'data_limit': {'value': '10', 'unit': 'gb'},
                'usage_limit': {'value': '24', 'unit': 'hours'},
                'bandwidth_limit': '',
                'max_devices': '',
                'session_timeout': '',
                'idle_timeout': '',
                'validity_period': {'value': '30', 'unit': 'days'},
                'mac_binding': False,
            },
            'pppoe': {
                'enabled': False,
                'download_speed': {'value': '10', 'unit': 'mbps'},
                'upload_speed': {'value': '5', 'unit': 'mbps'},
                'data_limit': {'value': '10', 'unit': 'gb'},
                'usage_limit': {'value': '24', 'unit': 'hours'},
                'bandwidth_limit': '',
                'max_devices': '',
                'session_timeout': '',
                'idle_timeout': '',
                'validity_period': {'value': '30', 'unit': 'days'},
                'mac_binding': False,
                'ip_pool': '',
                'service_name': '',
                'mtu': '',
            }
        }
    
    def create_from_template(self, template: PlanTemplate):
        """Create plan from template"""
        self.name = template.name
        self.category = template.category
        self.price = template.base_price
        self.description = template.description
        # Deep copy access methods to ensure proper structure
        self.access_methods = {}
        for method, config in template.access_methods.items():
            if isinstance(config, dict):
                self.access_methods[method] = config.copy()
            else:
                self.access_methods[method] = config
        self.template = template
        
        # Copy time variant from template if exists
        if template.time_variant:
            # Create a copy of time variant
            time_variant_copy = TimeVariantConfig.objects.create(
                is_active=template.time_variant.is_active,
                start_time=template.time_variant.start_time,
                end_time=template.time_variant.end_time,
                available_days=template.time_variant.available_days.copy() if template.time_variant.available_days else [],
                schedule_active=template.time_variant.schedule_active,
                schedule_start_date=template.time_variant.schedule_start_date,
                schedule_end_date=template.time_variant.schedule_end_date,
                duration_active=template.time_variant.duration_active,
                duration_value=template.time_variant.duration_value,
                duration_unit=template.time_variant.duration_unit,
                duration_start_date=template.time_variant.duration_start_date,
                exclusion_dates=template.time_variant.exclusion_dates.copy() if template.time_variant.exclusion_dates else [],
                timezone=template.time_variant.timezone,
                force_available=template.time_variant.force_available
            )
            self.time_variant = time_variant_copy
        
        if template.base_price > 0:
            self.plan_type = 'Paid'
        else:
            self.plan_type = 'Free_trial'
        
        # Ensure access methods are properly structured after template copy
        self._ensure_access_methods_structure()
        
        template.increment_usage()
        self.save()
    
    def has_enabled_access_methods(self) -> bool:
        """Check if any access method is enabled"""
        return any(
            method_config.get('enabled', False) 
            for method_config in self.access_methods.values()
        )
    
    def get_enabled_access_methods(self) -> List[str]:
        """Get list of enabled access methods"""
        return [
            method for method, config in self.access_methods.items() 
            if config.get('enabled', False)
        ]
    
    def get_access_type(self) -> str:
        """Get access type category"""
        enabled_methods = self.get_enabled_access_methods()
        if 'hotspot' in enabled_methods and 'pppoe' in enabled_methods:
            return 'dual'
        elif 'hotspot' in enabled_methods:
            return 'hotspot'
        elif 'pppoe' in enabled_methods:
            return 'pppoe'
        return 'none'
    
    def can_be_used_on_router(self, router_id: int) -> bool:
        """Check if plan can be used on specific router"""
        if not self.router_specific:
            return True
        
        try:
            from network_management.models.router_management_model import Router
            return self.allowed_routers.filter(id=router_id).exists()
        except ImportError:
            # Network management app not installed
            logger.warning("Network management app not installed, skipping router check")
            return True
    
    def increment_purchases(self):
        """Increment purchase count"""
        self.purchases = models.F('purchases') + 1
        self.save(update_fields=['purchases', 'updated_at'])
    
    def get_router_compatibility(self) -> List[Dict[str, Any]]:
        """Get router compatibility information"""
        try:
            from network_management.models.router_management_model import Router
            routers = Router.objects.filter(is_active=True, status='connected')
        except ImportError:
            # Network management app not installed
            logger.warning("Network management app not installed, skipping router compatibility")
            return []
        
        compatibility_data = []
        
        for router in routers:
            compatible = self.can_be_used_on_router(router.id)
            compatibility_data.append({
                'router_id': router.id,
                'router_name': router.name,
                'compatible': compatible,
                'access_methods': self.get_enabled_access_methods() if compatible else []
            })
        
        return compatibility_data
    
    def supports_access_method(self, access_method: str) -> bool:
        """
        Check if plan supports specific access method
        """
        return access_method in self.get_enabled_access_methods()
    
    def get_config_for_method(self, method: str) -> Dict[str, Any]:
        """Get configuration for specific access method"""
        return self.access_methods.get(method, {})
    
    def has_time_variant(self) -> bool:
        """Check if plan has time variant configuration"""
        return self.time_variant is not None and self.time_variant.is_active
    
    def is_available_for_client(self, check_time=True) -> Dict[str, Any]:
        """
        Check if plan is available for purchase
        """
        # Check if plan is active
        if not self.active:
            return {
                'available': False,
                'reason': 'Plan is inactive',
                'code': 'plan_inactive'
            }
        
        # Check time variant availability if enabled
        if check_time and self.has_time_variant():
            time_variant = self.time_variant
            is_available = time_variant.is_available_now()
            
            response = {
                'available': is_available,
                'time_variant_active': True,
                'summary': time_variant.get_availability_summary(),
                'code': 'time_restricted' if not is_available else 'available'
            }
            
            if not is_available:
                response['reason'] = 'Plan is not available at this time'
                response['next_available'] = time_variant.get_next_available_time()
            
            return response
        
        return {
            'available': True,
            'reason': 'Plan is available',
            'code': 'available',
            'time_variant_active': False
        }
    
    def get_time_variant_summary(self) -> Dict[str, Any]:
        """Get time variant summary"""
        if not self.has_time_variant():
            return {
                'has_time_variant': False,
                'message': 'No time restrictions'
            }
        
        return {
            'has_time_variant': True,
            'is_available_now': self.time_variant.is_available_now(),
            'summary': self.time_variant.get_availability_summary(),
            'next_available': self.time_variant.get_next_available_time() if not self.time_variant.is_available_now() else None
        }
    
    @classmethod
    def get_cached_plan(cls, plan_id):
        """Get plan from cache or database"""
        cache_key = f"internet_plan:{plan_id}"
        plan = cache.get(cache_key)
        
        if plan is None:
            try:
                plan = cls.objects.select_related('time_variant').get(id=plan_id, active=True)
                cache.set(cache_key, plan, 300)  # Cache for 5 minutes
            except cls.DoesNotExist:
                return None
        
        return plan
    
    @classmethod
    def get_available_plans_for_client(cls, client_type='hotspot', router_id=None):
        """
        Get all plans available for a specific client type
        """
        cache_key = f"available_plans:{client_type}:{router_id or 'all'}"
        plans = cache.get(cache_key)
        
        if plans is None:
            # Start with active plans
            queryset = cls.objects.filter(active=True).select_related('time_variant')
            
            # Filter by client type
            if client_type == 'hotspot':
                queryset = queryset.filter(access_methods__hotspot__enabled=True)
            elif client_type == 'pppoe':
                queryset = queryset.filter(access_methods__pppoe__enabled=True)
            
            # Filter by router compatibility if router_id provided
            if router_id:
                queryset = queryset.filter(
                    models.Q(router_specific=False) |
                    models.Q(router_specific=True, allowed_routers__id=router_id)
                ).distinct()
            
            # Get all plans and filter by time availability
            all_plans = list(queryset.order_by('-priority_level', 'price'))
            
            # Filter by time variant availability
            available_plans = []
            for plan in all_plans:
                availability = plan.is_available_for_client()
                if availability['available']:
                    plan.availability_info = availability  # Attach availability info
                    available_plans.append(plan)
            
            plans = available_plans
            cache.set(cache_key, plans, 60)  # Cache for 1 minute (time-sensitive)
        
        return plans
    
    @classmethod
    def get_plans_by_category(cls, category, limit=10):
        """Get plans by category with caching"""
        cache_key = f"plans_by_category:{category}:{limit}"
        plans = cache.get(cache_key)
        
        if plans is None:
            plans = list(cls.objects.filter(
                category=category, 
                active=True
            ).select_related('time_variant').order_by('priority_level', 'price')[:limit])
            cache.set(cache_key, plans, 300)  # Cache for 5 minutes
        
        return plans
    
    def calculate_effective_price(self, quantity=1, discount_code=None):
        """
        Calculate effective price with quantity and discounts
        """
        from internet_plans.services.pricing_service import PricingService
        return PricingService.calculate_effective_price(
            plan=self,
            quantity=quantity,
            discount_code=discount_code
        )
    
    def get_technical_config(self, access_method: str) -> Dict[str, Any]:
        """
        Get technical configuration for network activation
        """
        config = self.get_config_for_method(access_method)
        
        # Return only technical configuration
        return {
            'download_speed': config.get('download_speed', {}).get('value', '10'),
            'upload_speed': config.get('upload_speed', {}).get('value', '5'),
            'data_limit': config.get('data_limit', {}).get('value', '10'),
            'data_unit': config.get('data_limit', {}).get('unit', 'gb'),
            'usage_limit': config.get('usage_limit', {}).get('value', '24'),
            'usage_unit': config.get('usage_limit', {}).get('unit', 'hours'),
            'max_devices': config.get('max_devices', 1),
            'session_timeout': config.get('session_timeout', 86400),
            'idle_timeout': config.get('idle_timeout', 300),
            'validity_period': config.get('validity_period', {}).get('value', '30'),
            'validity_unit': config.get('validity_period', {}).get('unit', 'days'),
            'mac_binding': config.get('mac_binding', False),
        }
    
    # Properties for serializer compatibility
    @property
    def time_variant_id(self):
        """Property to get time variant ID for serializer"""
        return self.time_variant.id if self.time_variant else None
    
    @property
    def template_id(self):
        """Property to get template ID for serializer"""
        return self.template.id if self.template else None