













# from django.db import models
# from django.core.validators import MinValueValidator, MaxValueValidator
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# import uuid
# from django.core.cache import cache
# import json
# from datetime import timedelta
# from decimal import Decimal
# import logging

# logger = logging.getLogger(__name__)
# User = get_user_model()

# class TaxConfiguration(models.Model):
#     """Production-ready tax configuration with enhanced features"""
    
#     TAX_TYPES = (
#         ('vat', 'VAT'),
#         ('withholding', 'Withholding Tax'),
#         ('custom', 'Custom Tax'),
#         ('sales', 'Sales Tax'),
#         ('service', 'Service Tax'),
#         ('excise', 'Excise Duty'),
#     )
    
#     APPLIES_TO_CHOICES = (
#         ('revenue', 'Revenue'),
#         ('expenses', 'Expenses'),
#         ('both', 'Both'),
#     )

#     ACCESS_TYPE_CHOICES = (
#         ('all', 'All Access Types'),
#         ('hotspot', 'Hotspot Only'),
#         ('pppoe', 'PPPoE Only'),
#         ('both', 'Both Access Types'),
#     )

#     STATUS_CHOICES = (
#         ('active', 'Active'),
#         ('inactive', 'Inactive'),
#         ('archived', 'Archived'),
#     )

#     # Primary identifier
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
#     # Core tax information
#     name = models.CharField(
#         max_length=100,
#         help_text="Unique name for the tax configuration"
#     )
#     tax_code = models.CharField(
#         max_length=20,
#         unique=True,
#         blank=True,
#         null=True,
#         help_text="Official tax code or identifier"
#     )
#     tax_type = models.CharField(
#         max_length=20, 
#         choices=TAX_TYPES, 
#         default='custom'
#     )
    
#     # Rate and calculation
#     rate = models.DecimalField(
#         max_digits=7,  # Increased for higher precision
#         decimal_places=4,  # Increased for fractional percentages
#         validators=[
#             MinValueValidator(Decimal('0')),
#             MaxValueValidator(Decimal('100'))
#         ],
#         help_text="Tax rate in percentage (0-100)"
#     )
    
#     # Configuration details
#     description = models.TextField(blank=True, null=True)
#     applies_to = models.CharField(
#         max_length=10, 
#         choices=APPLIES_TO_CHOICES, 
#         default='revenue'
#     )
#     access_type = models.CharField(
#         max_length=10, 
#         choices=ACCESS_TYPE_CHOICES, 
#         default='all'
#     )
    
#     # Status and flags
#     is_enabled = models.BooleanField(default=True)
#     is_included_in_price = models.BooleanField(default=False)
#     requires_approval = models.BooleanField(
#         default=False,
#         help_text="Whether this tax requires special approval"
#     )
#     status = models.CharField(
#         max_length=10,
#         choices=STATUS_CHOICES,
#         default='active'
#     )
    
#     # Effective date range
#     effective_from = models.DateTimeField(
#         default=timezone.now,
#         help_text="When this tax configuration becomes effective"
#     )
#     effective_to = models.DateTimeField(
#         blank=True,
#         null=True,
#         help_text="When this tax configuration expires (null means indefinite)"
#     )
    
#     # Audit and metadata
#     created_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='created_taxes'
#     )
#     updated_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='updated_taxes'
#     )
#     version = models.PositiveIntegerField(default=1)
#     revision_notes = models.TextField(blank=True, null=True)
    
#     # Timestamps
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     last_audited_at = models.DateTimeField(blank=True, null=True)

#     class Meta:
#         verbose_name = "Tax Configuration"
#         verbose_name_plural = "Tax Configurations"
#         ordering = ['name', '-created_at']
#         indexes = [
#             models.Index(fields=['access_type', 'is_enabled']),
#             models.Index(fields=['tax_type', 'status']),
#             models.Index(fields=['effective_from', 'effective_to']),
#             models.Index(fields=['created_at']),
#             models.Index(fields=['updated_at']),
#         ]
#         constraints = [
#             models.UniqueConstraint(
#                 fields=['name', 'tax_type', 'access_type'],
#                 name='unique_tax_configuration'
#             ),
#             models.CheckConstraint(
#                 check=models.Q(rate__gte=0) & models.Q(rate__lte=100),
#                 name='valid_tax_rate_range'
#             ),
#         ]

#     def __str__(self):
#         return f"{self.name} ({self.rate}%) - {self.get_access_type_display()}"

#     def save(self, *args, **kwargs):
#         """Enhanced save method with tax code generation and validation"""
#         # Generate tax code if not provided
#         if not self.tax_code:
#             self.tax_code = self._generate_tax_code()
        
#         # Validate effective date range
#         if self.effective_to and self.effective_to < self.effective_from:
#             raise ValueError("Effective end date cannot be before start date")
        
#         # Update version if this is an existing instance
#         if self.pk:
#             self.version += 1
        
#         super().save(*args, **kwargs)

#     def _generate_tax_code(self):
#         """Generate a unique tax code"""
#         base_code = f"TAX_{self.tax_type.upper()}_{self.name.upper().replace(' ', '_')}"
#         timestamp = timezone.now().strftime("%y%m%d%H%M")
#         return f"{base_code}_{timestamp}"

#     def clean(self):
#         """Enhanced model validation"""
#         from django.core.exceptions import ValidationError
        
#         # Validate rate
#         if self.rate < Decimal('0') or self.rate > Decimal('100'):
#             raise ValidationError({'rate': 'Tax rate must be between 0 and 100 percent'})
        
#         # Validate effective dates
#         if self.effective_to and self.effective_to < timezone.now():
#             raise ValidationError({'effective_to': 'End date cannot be in the past'})

#     def calculate_tax(self, amount, access_type='hotspot', date=None):
#         """
#         Enhanced tax calculation with date validation and access type consideration
        
#         Args:
#             amount (Decimal): The amount to calculate tax for
#             access_type (str): The access type to check against
#             date (datetime): The date to check tax effectiveness for
            
#         Returns:
#             Decimal: Calculated tax amount
#         """
#         if not self._is_effective(date):
#             return Decimal('0')
            
#         if not self._applies_to_access_type(access_type):
#             return Decimal('0')
            
#         if self.is_included_in_price:
#             # Calculate tax included in price
#             taxable_amount = amount / (1 + (self.rate / Decimal('100')))
#             return taxable_amount * (self.rate / Decimal('100'))
#         else:
#             # Calculate tax added to price
#             return amount * (self.rate / Decimal('100'))

#     def _is_effective(self, date=None):
#         """Check if tax is effective for the given date"""
#         check_date = date or timezone.now()
#         return (self.effective_from <= check_date and 
#                 (self.effective_to is None or self.effective_to >= check_date))

#     def _applies_to_access_type(self, access_type):
#         """Check if tax applies to specific access type"""
#         if self.access_type == 'all':
#             return True
#         elif self.access_type == 'both':
#             return access_type in ['hotspot', 'pppoe', 'both']
#         else:
#             return self.access_type == access_type

#     def clone(self, new_name=None, created_by=None):
#         """Create a copy of this tax configuration"""
#         clone = TaxConfiguration.objects.get(pk=self.pk)
#         clone.pk = None
#         clone.id = uuid.uuid4()
#         clone.version = 1
        
#         if new_name:
#             clone.name = new_name
#         else:
#             clone.name = f"{self.name} (Copy)"
            
#         if created_by:
#             clone.created_by = created_by
            
#         clone.tax_code = None  # Will be regenerated on save
#         clone.revision_notes = f"Cloned from {self.tax_code}"
        
#         clone.save()
#         return clone

#     def archive(self):
#         """Archive this tax configuration"""
#         self.status = 'archived'
#         self.is_enabled = False
#         self.save()

#     def activate(self):
#         """Activate this tax configuration"""
#         self.status = 'active'
#         self.is_enabled = True
#         self.save()

#     def deactivate(self):
#         """Deactivate this tax configuration"""
#         self.status = 'inactive'
#         self.is_enabled = False
#         self.save()

#     @property
#     def is_active(self):
#         """Check if tax is currently active and effective"""
#         return (self.status == 'active' and 
#                 self.is_enabled and 
#                 self._is_effective())

#     @property
#     def days_effective(self):
#         """Calculate how many days this tax has been effective"""
#         if not self._is_effective():
#             return 0
        
#         end_date = self.effective_to or timezone.now()
#         duration = end_date - self.effective_from
#         return duration.days

#     @classmethod
#     def get_active_taxes(cls, access_type=None, applies_to=None, date=None):
#         """Get all active and effective taxes with optional filtering"""
#         queryset = cls.objects.filter(
#             status='active',
#             is_enabled=True,
#             effective_from__lte=date or timezone.now()
#         ).filter(
#             models.Q(effective_to__isnull=True) | 
#             models.Q(effective_to__gte=date or timezone.now())
#         )
        
#         if access_type and access_type != 'all':
#             queryset = queryset.filter(
#                 models.Q(access_type='all') | 
#                 models.Q(access_type=access_type) |
#                 models.Q(access_type='both')
#             )
            
#         if applies_to:
#             queryset = queryset.filter(
#                 models.Q(applies_to='both') | 
#                 models.Q(applies_to=applies_to)
#             )
            
#         return queryset.order_by('name')

#     @classmethod
#     def get_tax_impact_summary(cls, access_type=None):
#         """Get summary of tax impact for active taxes"""
#         active_taxes = cls.get_active_taxes(access_type)
        
#         summary = {
#             'total_revenue_tax_rate': Decimal('0'),
#             'total_expense_tax_rate': Decimal('0'),
#             'tax_count': active_taxes.count(),
#             'by_access_type': {},
#             'by_tax_type': {}
#         }
        
#         for tax in active_taxes:
#             # Calculate total rates
#             if tax.applies_to in ['revenue', 'both']:
#                 summary['total_revenue_tax_rate'] += tax.rate
                
#             if tax.applies_to in ['expenses', 'both']:
#                 summary['total_expense_tax_rate'] += tax.rate
            
#             # Group by access type
#             if tax.access_type not in summary['by_access_type']:
#                 summary['by_access_type'][tax.access_type] = {
#                     'revenue_rate': Decimal('0'),
#                     'expense_rate': Decimal('0'),
#                     'count': 0
#                 }
            
#             if tax.applies_to in ['revenue', 'both']:
#                 summary['by_access_type'][tax.access_type]['revenue_rate'] += tax.rate
#             if tax.applies_to in ['expenses', 'both']:
#                 summary['by_access_type'][tax.access_type]['expense_rate'] += tax.rate
#             summary['by_access_type'][tax.access_type]['count'] += 1
            
#             # Group by tax type
#             if tax.tax_type not in summary['by_tax_type']:
#                 summary['by_tax_type'][tax.tax_type] = {
#                     'total_rate': Decimal('0'),
#                     'count': 0
#                 }
            
#             summary['by_tax_type'][tax.tax_type]['total_rate'] += tax.rate
#             summary['by_tax_type'][tax.tax_type]['count'] += 1
        
#         return summary

# class ExpenseCategory(models.Model):
#     """Enhanced categories for expenses with predefined support"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100, unique=True)
#     description = models.TextField(blank=True, null=True)
#     is_active = models.BooleanField(default=True)
#     is_predefined = models.BooleanField(default=False, help_text="Whether this is a system-defined category")
#     created_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='created_categories'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Expense Category"
#         verbose_name_plural = "Expense Categories"
#         ordering = ['name']
#         indexes = [
#             models.Index(fields=['is_active', 'is_predefined']),
#         ]

#     def __str__(self):
#         return self.name

#     @classmethod
#     def initialize_predefined_categories(cls, user):
#         """Initialize predefined ISP expense categories"""
#         predefined_categories = [
#             'Network Equipment',
#             'Internet Bandwidth',
#             'Server Maintenance',
#             'Staff Salaries',
#             'Office Rent',
#             'Utilities (Electricity, Water)',
#             'Marketing & Advertising',
#             'Software Licenses',
#             'Hardware Purchases',
#             'Vehicle Maintenance',
#             'Fuel & Transportation',
#             'Professional Services',
#             'Insurance',
#             'Taxes & Levies',
#             'Bank Charges',
#             'Travel & Accommodation',
#             'Training & Development',
#             'Repairs & Maintenance',
#             'Office Supplies',
#             'Customer Support',
#             'Security Services',
#             'Cleaning Services',
#             'Internet Service Provider Fees',
#             'Tower Rental',
#             'Fiber Installation',
#             'Wireless Equipment',
#             'Backup Power Systems',
#             'Network Monitoring Tools',
#             'Customer Premises Equipment',
#             'License Fees'
#         ]
        
#         for category_name in predefined_categories:
#             cls.objects.get_or_create(
#                 name=category_name,
#                 defaults={
#                     'description': f'Predefined category: {category_name}',
#                     'is_predefined': True,
#                     'is_active': True,
#                     'created_by': user
#                 }
#             )

# class ManualExpense(models.Model):
#     """Manually added expenses for reconciliation"""
#     ACCESS_TYPE_CHOICES = (
#         ('hotspot', 'Hotspot'),
#         ('pppoe', 'PPPoE'),
#         ('both', 'Both'),
#         ('general', 'General'),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     expense_id = models.CharField(max_length=20, unique=True, editable=False)
#     description = models.CharField(max_length=255)
#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         validators=[MinValueValidator(Decimal('0.01'))]
#     )
#     category = models.ForeignKey(
#         ExpenseCategory,
#         on_delete=models.PROTECT,
#         related_name='expenses'
#     )
#     access_type = models.CharField(max_length=10, choices=ACCESS_TYPE_CHOICES, default='general')
#     date = models.DateField()
#     reference_number = models.CharField(max_length=100, blank=True, null=True)
#     notes = models.TextField(blank=True, null=True)
#     created_by = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name='created_expenses'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Manual Expense"
#         verbose_name_plural = "Manual Expenses"
#         ordering = ['-date']
#         indexes = [
#             models.Index(fields=['expense_id']),
#             models.Index(fields=['date']),
#             models.Index(fields=['category']),
#             models.Index(fields=['access_type']),
#         ]

#     def __str__(self):
#         return f"{self.expense_id} - {self.description} ({self.amount})"

#     def save(self, *args, **kwargs):
#         if not self.expense_id:
#             self.expense_id = self._generate_expense_id()
#         super().save(*args, **kwargs)

#     def _generate_expense_id(self):
#         timestamp = timezone.now().strftime("%y%m%d")
#         random_part = str(uuid.uuid4().int)[:6]
#         return f"EX{timestamp}{random_part}"

#     def clean(self):
#         """Validate expense data"""
#         from django.core.exceptions import ValidationError
        
#         if self.amount <= Decimal('0'):
#             raise ValidationError({'amount': 'Amount must be greater than 0'})
        
#         if self.date > timezone.now().date():
#             raise ValidationError({'date': 'Date cannot be in the future'})

# class ReconciliationReport(models.Model):
#     """Enhanced reconciliation reports with access type breakdown"""
#     REPORT_TYPES = (
#         ('daily', 'Daily'),
#         ('weekly', 'Weekly'),
#         ('monthly', 'Monthly'),
#         ('custom', 'Custom'),
#     )

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     report_id = models.CharField(max_length=20, unique=True, editable=False)
#     report_type = models.CharField(max_length=10, choices=REPORT_TYPES, default='custom')
#     start_date = models.DateField()
#     end_date = models.DateField()

#     # Revenue breakdown by access type
#     total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     hotspot_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     pppoe_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     both_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     # Expense breakdown by access type
#     total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     hotspot_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     pppoe_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     both_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     general_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     # Tax breakdown
#     total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     hotspot_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     pppoe_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     both_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     # Detailed breakdown
#     revenue_breakdown = models.JSONField(default=dict)
#     expense_breakdown = models.JSONField(default=dict)
#     tax_breakdown = models.JSONField(default=dict)

#     tax_configuration = models.JSONField(default=dict)
#     generated_by = models.ForeignKey(
#         User,
#         on_delete=models.CASCADE,
#         related_name='generated_reports'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name = "Reconciliation Report"
#         verbose_name_plural = "Reconciliation Reports"
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"{self.report_id} - {self.start_date} to {self.end_date}"

#     def save(self, *args, **kwargs):
#         if not self.report_id:
#             self.report_id = self._generate_report_id()
#         super().save(*args, **kwargs)

#     def _generate_report_id(self):
#         timestamp = timezone.now().strftime("%y%m%d")
#         random_part = str(uuid.uuid4().int)[:6]
#         return f"RP{timestamp}{random_part}"

# class ReconciliationStats(models.Model):
#     """Enhanced daily statistics with access type breakdown"""
#     date = models.DateField(unique=True)

#     # Revenue statistics
#     total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     hotspot_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     pppoe_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     both_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     # Expense statistics
#     total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     hotspot_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     pppoe_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     both_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     general_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     # Tax statistics
#     total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
#     net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

#     transaction_count = models.PositiveIntegerField(default=0)
#     expense_count = models.PositiveIntegerField(default=0)

#     # Access type counts
#     hotspot_count = models.PositiveIntegerField(default=0)
#     pppoe_count = models.PositiveIntegerField(default=0)
#     both_count = models.PositiveIntegerField(default=0)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Reconciliation Statistic"
#         verbose_name_plural = "Reconciliation Statistics"
#         ordering = ['-date']
#         indexes = [
#             models.Index(fields=['date']),
#         ]

#     def __str__(self):
#         return f"Stats for {self.date}: Revenue: {self.total_revenue}, Profit: {self.net_profit}"

#     @classmethod
#     def get_cached_stats(cls, days=30):
#         """Get cached statistics for dashboard"""
#         cache_key = f"reconciliation_stats_{days}"
#         cached_data = cache.get(cache_key)
        
#         if cached_data:
#             return cached_data
        
#         end_date = timezone.now().date()
#         start_date = end_date - timedelta(days=days)
        
#         stats = cls.objects.filter(
#             date__range=[start_date, end_date]
#         ).order_by('date')
        
#         # Process and cache data
#         data = {
#             'dates': [stat.date.isoformat() for stat in stats],
#             'hotspot_revenue': [float(stat.hotspot_revenue) for stat in stats],
#             'pppoe_revenue': [float(stat.pppoe_revenue) for stat in stats],
#             'both_revenue': [float(stat.both_revenue) for stat in stats],
#             'total_revenue': [float(stat.total_revenue) for stat in stats],
#         }
        
#         cache.set(cache_key, data, 300)  # Cache for 5 minutes
#         return data









from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
from django.core.cache import cache
import json
from datetime import timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class TaxConfiguration(models.Model):
    """Production-ready tax configuration with enhanced features"""
    
    TAX_TYPES = (
        ('vat', 'VAT'),
        ('withholding', 'Withholding Tax'),
        ('custom', 'Custom Tax'),
        ('sales', 'Sales Tax'),
        ('service', 'Service Tax'),
        ('excise', 'Excise Duty'),
    )
    
    APPLIES_TO_CHOICES = (
        ('revenue', 'Revenue'),
        ('expenses', 'Expenses'),
        ('both', 'Both'),
    )

    ACCESS_TYPE_CHOICES = (
        ('all', 'All Access Types'),
        ('hotspot', 'Hotspot Only'),
        ('pppoe', 'PPPoE Only'),
        ('both', 'Both Access Types'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('archived', 'Archived'),
    )

    # Primary identifier
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core tax information
    name = models.CharField(
        max_length=100,
        help_text="Unique name for the tax configuration"
    )
    tax_code = models.CharField(
        max_length=50,  # INCREASED FROM 20 to 50 to prevent Data too long errors
        unique=True,
        blank=True,
        null=True,
        help_text="Official tax code or identifier"
    )
    tax_type = models.CharField(
        max_length=20, 
        choices=TAX_TYPES, 
        default='custom'
    )
    
    # Rate and calculation
    rate = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        validators=[
            MinValueValidator(Decimal('0.0000')),  # FIXED: Use Decimal for min/max
            MaxValueValidator(Decimal('100.0000'))
        ],
        help_text="Tax rate in percentage (0-100)"
    )
    
    # Configuration details
    description = models.TextField(blank=True, null=True)
    applies_to = models.CharField(
        max_length=10, 
        choices=APPLIES_TO_CHOICES, 
        default='revenue'
    )
    access_type = models.CharField(
        max_length=10, 
        choices=ACCESS_TYPE_CHOICES, 
        default='all'
    )
    
    # Status and flags
    is_enabled = models.BooleanField(default=True)
    is_included_in_price = models.BooleanField(default=False)
    requires_approval = models.BooleanField(
        default=False,
        help_text="Whether this tax requires special approval"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    # Effective date range
    effective_from = models.DateTimeField(
        default=timezone.now,
        help_text="When this tax configuration becomes effective"
    )
    effective_to = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When this tax configuration expires (null means indefinite)"
    )
    
    # Audit and metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_taxes'
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_taxes'
    )
    version = models.PositiveIntegerField(default=1)
    revision_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_audited_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Tax Configuration"
        verbose_name_plural = "Tax Configurations"
        ordering = ['name', '-created_at']
        indexes = [
            models.Index(fields=['access_type', 'is_enabled']),
            models.Index(fields=['tax_type', 'status']),
            models.Index(fields=['effective_from', 'effective_to']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'tax_type', 'access_type'],
                name='unique_tax_configuration'
            ),
            models.CheckConstraint(
                check=models.Q(rate__gte=0) & models.Q(rate__lte=100),
                name='valid_tax_rate_range'
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.rate}%) - {self.get_access_type_display()}"

    def save(self, *args, **kwargs):
        """Enhanced save method with tax code generation and validation"""
        # Generate tax code if not provided
        if not self.tax_code:
            self.tax_code = self._generate_tax_code()
        
        # Validate effective date range
        if self.effective_to and self.effective_to < self.effective_from:
            raise ValueError("Effective end date cannot be before start date")
        
        # Update version if this is an existing instance
        if self.pk:
            self.version += 1
        
        super().save(*args, **kwargs)

    def _generate_tax_code(self):
        """Generate a unique tax code with shorter length"""
        base_name = self.name.upper().replace(' ', '_')[:20]  # Limit name length
        tax_type = self.tax_type.upper()[:3]  # Limit tax type length
        timestamp = timezone.now().strftime("%y%m%d%H%M")
        return f"TX_{tax_type}_{base_name}_{timestamp}"[:50]  # Ensure it fits in 50 chars

    def clean(self):
        """Enhanced model validation"""
        from django.core.exceptions import ValidationError
        
        # Validate rate
        if self.rate < Decimal('0') or self.rate > Decimal('100'):
            raise ValidationError({'rate': 'Tax rate must be between 0 and 100 percent'})
        
        # Validate effective dates
        if self.effective_to and self.effective_to < timezone.now():
            raise ValidationError({'effective_to': 'End date cannot be in the past'})

    def calculate_tax(self, amount, access_type='hotspot', date=None):
        """
        Enhanced tax calculation with date validation and access type consideration
        
        Args:
            amount (Decimal): The amount to calculate tax for
            access_type (str): The access type to check against
            date (datetime): The date to check tax effectiveness for
            
        Returns:
            Decimal: Calculated tax amount
        """
        if not self._is_effective(date):
            return Decimal('0')
            
        if not self._applies_to_access_type(access_type):
            return Decimal('0')
            
        if self.is_included_in_price:
            # Calculate tax included in price
            taxable_amount = amount / (1 + (self.rate / Decimal('100')))
            return taxable_amount * (self.rate / Decimal('100'))
        else:
            # Calculate tax added to price
            return amount * (self.rate / Decimal('100'))

    def _is_effective(self, date=None):
        """Check if tax is effective for the given date"""
        check_date = date or timezone.now()
        return (self.effective_from <= check_date and 
                (self.effective_to is None or self.effective_to >= check_date))

    def _applies_to_access_type(self, access_type):
        """Check if tax applies to specific access type"""
        if self.access_type == 'all':
            return True
        elif self.access_type == 'both':
            return access_type in ['hotspot', 'pppoe', 'both']
        else:
            return self.access_type == access_type

    def clone(self, new_name=None, created_by=None):
        """Create a copy of this tax configuration"""
        clone = TaxConfiguration.objects.get(pk=self.pk)
        clone.pk = None
        clone.id = uuid.uuid4()
        clone.version = 1
        
        if new_name:
            clone.name = new_name
        else:
            clone.name = f"{self.name} (Copy)"
            
        if created_by:
            clone.created_by = created_by
            
        clone.tax_code = None  # Will be regenerated on save
        clone.revision_notes = f"Cloned from {self.tax_code}"
        
        clone.save()
        return clone

    def archive(self):
        """Archive this tax configuration"""
        self.status = 'archived'
        self.is_enabled = False
        self.save()

    def activate(self):
        """Activate this tax configuration"""
        self.status = 'active'
        self.is_enabled = True
        self.save()

    def deactivate(self):
        """Deactivate this tax configuration"""
        self.status = 'inactive'
        self.is_enabled = False
        self.save()

    @property
    def is_active(self):
        """Check if tax is currently active and effective"""
        return (self.status == 'active' and 
                self.is_enabled and 
                self._is_effective())

    @property
    def days_effective(self):
        """Calculate how many days this tax has been effective"""
        if not self._is_effective():
            return 0
        
        end_date = self.effective_to or timezone.now()
        duration = end_date - self.effective_from
        return duration.days

    @classmethod
    def get_active_taxes(cls, access_type=None, applies_to=None, date=None):
        """Get all active and effective taxes with optional filtering"""
        queryset = cls.objects.filter(
            status='active',
            is_enabled=True,
            effective_from__lte=date or timezone.now()
        ).filter(
            models.Q(effective_to__isnull=True) | 
            models.Q(effective_to__gte=date or timezone.now())
        )
        
        if access_type and access_type != 'all':
            queryset = queryset.filter(
                models.Q(access_type='all') | 
                models.Q(access_type=access_type) |
                models.Q(access_type='both')
            )
            
        if applies_to:
            queryset = queryset.filter(
                models.Q(applies_to='both') | 
                models.Q(applies_to=applies_to)
            )
            
        return queryset.order_by('name')

    @classmethod
    def get_tax_impact_summary(cls, access_type=None):
        """Get summary of tax impact for active taxes"""
        active_taxes = cls.get_active_taxes(access_type)
        
        summary = {
            'total_revenue_tax_rate': Decimal('0'),
            'total_expense_tax_rate': Decimal('0'),
            'tax_count': active_taxes.count(),
            'by_access_type': {},
            'by_tax_type': {}
        }
        
        for tax in active_taxes:
            # Calculate total rates
            if tax.applies_to in ['revenue', 'both']:
                summary['total_revenue_tax_rate'] += tax.rate
                
            if tax.applies_to in ['expenses', 'both']:
                summary['total_expense_tax_rate'] += tax.rate
            
            # Group by access type
            if tax.access_type not in summary['by_access_type']:
                summary['by_access_type'][tax.access_type] = {
                    'revenue_rate': Decimal('0'),
                    'expense_rate': Decimal('0'),
                    'count': 0
                }
            
            if tax.applies_to in ['revenue', 'both']:
                summary['by_access_type'][tax.access_type]['revenue_rate'] += tax.rate
            if tax.applies_to in ['expenses', 'both']:
                summary['by_access_type'][tax.access_type]['expense_rate'] += tax.rate
            summary['by_access_type'][tax.access_type]['count'] += 1
            
            # Group by tax type
            if tax.tax_type not in summary['by_tax_type']:
                summary['by_tax_type'][tax.tax_type] = {
                    'total_rate': Decimal('0'),
                    'count': 0
                }
            
            summary['by_tax_type'][tax.tax_type]['total_rate'] += tax.rate
            summary['by_tax_type'][tax.tax_type]['count'] += 1
        
        return summary

class ExpenseCategory(models.Model):
    """Enhanced categories for expenses with predefined support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_predefined = models.BooleanField(default=False, help_text="Whether this is a system-defined category")
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_categories'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Expense Category"
        verbose_name_plural = "Expense Categories"
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_active', 'is_predefined']),
        ]

    def __str__(self):
        return self.name

    @classmethod
    def initialize_predefined_categories(cls, user):
        """Initialize predefined ISP expense categories"""
        predefined_categories = [
            'Network Equipment',
            'Internet Bandwidth',
            'Server Maintenance',
            'Staff Salaries',
            'Office Rent',
            'Utilities (Electricity, Water)',
            'Marketing & Advertising',
            'Software Licenses',
            'Hardware Purchases',
            'Vehicle Maintenance',
            'Fuel & Transportation',
            'Professional Services',
            'Insurance',
            'Taxes & Levies',
            'Bank Charges',
            'Travel & Accommodation',
            'Training & Development',
            'Repairs & Maintenance',
            'Office Supplies',
            'Customer Support',
            'Security Services',
            'Cleaning Services',
            'Internet Service Provider Fees',
            'Tower Rental',
            'Fiber Installation',
            'Wireless Equipment',
            'Backup Power Systems',
            'Network Monitoring Tools',
            'Customer Premises Equipment',
            'License Fees'
        ]
        
        for category_name in predefined_categories:
            cls.objects.get_or_create(
                name=category_name,
                defaults={
                    'description': f'Predefined category: {category_name}',
                    'is_predefined': True,
                    'is_active': True,
                    'created_by': user
                }
            )

class ManualExpense(models.Model):
    """Manually added expenses for reconciliation"""
    ACCESS_TYPE_CHOICES = (
        ('hotspot', 'Hotspot'),
        ('pppoe', 'PPPoE'),
        ('both', 'Both'),
        ('general', 'General'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expense_id = models.CharField(max_length=20, unique=True, editable=False)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    access_type = models.CharField(max_length=10, choices=ACCESS_TYPE_CHOICES, default='general')
    date = models.DateField()
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_expenses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Manual Expense"
        verbose_name_plural = "Manual Expenses"
        ordering = ['-date']
        indexes = [
            models.Index(fields=['expense_id']),
            models.Index(fields=['date']),
            models.Index(fields=['category']),
            models.Index(fields=['access_type']),
        ]

    def __str__(self):
        return f"{self.expense_id} - {self.description} ({self.amount})"

    def save(self, *args, **kwargs):
        if not self.expense_id:
            self.expense_id = self._generate_expense_id()
        super().save(*args, **kwargs)

    def _generate_expense_id(self):
        timestamp = timezone.now().strftime("%y%m%d")
        random_part = str(uuid.uuid4().int)[:6]
        return f"EX{timestamp}{random_part}"

    def clean(self):
        """Validate expense data"""
        from django.core.exceptions import ValidationError
        
        if self.amount <= Decimal('0'):
            raise ValidationError({'amount': 'Amount must be greater than 0'})
        
        if self.date > timezone.now().date():
            raise ValidationError({'date': 'Date cannot be in the future'})

class ReconciliationReport(models.Model):
    """Enhanced reconciliation reports with access type breakdown"""
    REPORT_TYPES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('custom', 'Custom'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_id = models.CharField(max_length=20, unique=True, editable=False)
    report_type = models.CharField(max_length=10, choices=REPORT_TYPES, default='custom')
    start_date = models.DateField()
    end_date = models.DateField()

    # Revenue breakdown by access type
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    hotspot_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    pppoe_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    both_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    # Expense breakdown by access type
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    hotspot_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    pppoe_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    both_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    general_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    # Tax breakdown
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    hotspot_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    pppoe_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    both_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    # Detailed breakdown
    revenue_breakdown = models.JSONField(default=dict)
    expense_breakdown = models.JSONField(default=dict)
    tax_breakdown = models.JSONField(default=dict)

    tax_configuration = models.JSONField(default=dict)
    generated_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='generated_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reconciliation Report"
        verbose_name_plural = "Reconciliation Reports"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.report_id} - {self.start_date} to {self.end_date}"

    def save(self, *args, **kwargs):
        if not self.report_id:
            self.report_id = self._generate_report_id()
        super().save(*args, **kwargs)

    def _generate_report_id(self):
        timestamp = timezone.now().strftime("%y%m%d")
        random_part = str(uuid.uuid4().int)[:6]
        return f"RP{timestamp}{random_part}"

class ReconciliationStats(models.Model):
    """Enhanced daily statistics with access type breakdown"""
    date = models.DateField(unique=True)

    # Revenue statistics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    hotspot_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    pppoe_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    both_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    # Expense statistics
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    hotspot_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    pppoe_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    both_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    general_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    # Tax statistics
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0'))

    transaction_count = models.PositiveIntegerField(default=0)
    expense_count = models.PositiveIntegerField(default=0)

    # Access type counts
    hotspot_count = models.PositiveIntegerField(default=0)
    pppoe_count = models.PositiveIntegerField(default=0)
    both_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reconciliation Statistic"
        verbose_name_plural = "Reconciliation Statistics"
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Stats for {self.date}: Revenue: {self.total_revenue}, Profit: {self.net_profit}"

    @classmethod
    def get_cached_stats(cls, days=30):
        """Get cached statistics for dashboard"""
        cache_key = f"reconciliation_stats_{days}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        stats = cls.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')
        
        # Process and cache data
        data = {
            'dates': [stat.date.isoformat() for stat in stats],
            'hotspot_revenue': [float(stat.hotspot_revenue) for stat in stats],
            'pppoe_revenue': [float(stat.pppoe_revenue) for stat in stats],
            'both_revenue': [float(stat.both_revenue) for stat in stats],
            'total_revenue': [float(stat.total_revenue) for stat in stats],
        }
        
        cache.set(cache_key, data, 300)  # Cache for 5 minutes
        return data