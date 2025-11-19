






# from django.db import models
# from django.core.validators import MinValueValidator
# from django.utils import timezone
# from django.contrib.auth import get_user_model
# import uuid

# User = get_user_model()

# class TaxConfiguration(models.Model):
#     """Tax configuration for payment reconciliation"""
#     TAX_TYPES = (
#         ('vat', 'VAT'),
#         ('withholding', 'Withholding Tax'),
#         ('custom', 'Custom Tax'),
#     )
    
#     APPLIES_TO_CHOICES = (
#         ('revenue', 'Revenue'),
#         ('expenses', 'Expenses'),
#         ('both', 'Both'),
#     )
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100)
#     tax_type = models.CharField(max_length=20, choices=TAX_TYPES, default='custom')
#     rate = models.DecimalField(
#         max_digits=5,
#         decimal_places=2,
#         validators=[MinValueValidator(0)],
#         help_text="Tax rate in percentage"
#     )
#     description = models.TextField(blank=True, null=True)
#     applies_to = models.CharField(max_length=10, choices=APPLIES_TO_CHOICES, default='revenue')
#     is_enabled = models.BooleanField(default=True)
#     is_included_in_price = models.BooleanField(default=False)
#     created_by = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         related_name='created_taxes'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Tax Configuration"
#         verbose_name_plural = "Tax Configurations"
#         ordering = ['name']
    
#     def __str__(self):
#         return f"{self.name} ({self.rate}%)"
    
#     def calculate_tax(self, amount):
#         """Calculate tax amount for given base amount"""
#         if self.is_included_in_price:
#             # Tax is included in the price, so we need to extract it
#             taxable_amount = amount / (1 + (self.rate / 100))
#             return taxable_amount * (self.rate / 100)
#         else:
#             # Tax is added on top of the price
#             return amount * (self.rate / 100)


# class ExpenseCategory(models.Model):
#     """Categories for expenses"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     name = models.CharField(max_length=100, unique=True)
#     description = models.TextField(blank=True, null=True)
#     is_active = models.BooleanField(default=True)
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
    
#     def __str__(self):
#         return self.name


# class ManualExpense(models.Model):
#     """Manually added expenses for reconciliation"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     expense_id = models.CharField(max_length=20, unique=True, editable=False)
#     description = models.CharField(max_length=255)
#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         validators=[MinValueValidator(0)]
#     )
#     category = models.ForeignKey(
#         ExpenseCategory,
#         on_delete=models.PROTECT,
#         related_name='expenses'
#     )
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


# class ReconciliationReport(models.Model):
#     """Generated reconciliation reports"""
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
#     total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     tax_configuration = models.JSONField(default=dict)  # Snapshot of tax config at report time
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
#     """Daily statistics for reconciliation dashboard"""
#     date = models.DateField(unique=True)
#     total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
#     transaction_count = models.PositiveIntegerField(default=0)
#     expense_count = models.PositiveIntegerField(default=0)
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










from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid
from django.core.cache import cache
import json

User = get_user_model()

class TaxConfiguration(models.Model):
    """Enhanced tax configuration with access type support"""
    TAX_TYPES = (
        ('vat', 'VAT'),
        ('withholding', 'Withholding Tax'),
        ('custom', 'Custom Tax'),
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
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    tax_type = models.CharField(max_length=20, choices=TAX_TYPES, default='custom')
    rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Tax rate in percentage"
    )
    description = models.TextField(blank=True, null=True)
    applies_to = models.CharField(max_length=10, choices=APPLIES_TO_CHOICES, default='revenue')
    access_type = models.CharField(max_length=10, choices=ACCESS_TYPE_CHOICES, default='all')
    is_enabled = models.BooleanField(default=True)
    is_included_in_price = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_taxes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Tax Configuration"
        verbose_name_plural = "Tax Configurations"
        ordering = ['name']
        indexes = [
            models.Index(fields=['access_type', 'is_enabled']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.rate}%) - {self.get_access_type_display()}"
    
    def calculate_tax(self, amount, access_type='hotspot'):
        """Calculate tax amount with access type consideration"""
        if not self._applies_to_access_type(access_type):
            return 0
            
        if self.is_included_in_price:
            taxable_amount = amount / (1 + (self.rate / 100))
            return taxable_amount * (self.rate / 100)
        else:
            return amount * (self.rate / 100)
    
    def _applies_to_access_type(self, access_type):
        """Check if tax applies to specific access type"""
        if self.access_type == 'all':
            return True
        elif self.access_type == 'both':
            return access_type in ['hotspot', 'pppoe', 'both']
        else:
            return self.access_type == access_type


class ExpenseCategory(models.Model):
    """Categories for expenses"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
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
    
    def __str__(self):
        return self.name


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
        validators=[MinValueValidator(0)]
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
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hotspot_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    pppoe_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    both_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Expense breakdown by access type
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hotspot_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    pppoe_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    both_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    general_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Tax breakdown
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hotspot_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    pppoe_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    both_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
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
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hotspot_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    pppoe_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    both_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Expense statistics
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    hotspot_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    pppoe_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    both_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    general_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Tax statistics
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
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