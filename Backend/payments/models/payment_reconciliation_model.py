from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class TaxConfiguration(models.Model):
    """Tax configuration for payment reconciliation"""
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
    
    def __str__(self):
        return f"{self.name} ({self.rate}%)"
    
    def calculate_tax(self, amount):
        """Calculate tax amount for given base amount"""
        if self.is_included_in_price:
            # Tax is included in the price, so we need to extract it
            taxable_amount = amount / (1 + (self.rate / 100))
            return taxable_amount * (self.rate / 100)
        else:
            # Tax is added on top of the price
            return amount * (self.rate / 100)

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
    """Generated reconciliation reports"""
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
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_configuration = models.JSONField(default=dict)  # Snapshot of tax config at report time
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
    """Daily statistics for reconciliation dashboard"""
    date = models.DateField(unique=True)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_tax = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    transaction_count = models.PositiveIntegerField(default=0)
    expense_count = models.PositiveIntegerField(default=0)
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