from rest_framework import serializers
from django.contrib.auth import get_user_model
from payments.models.payment_config_model import Transaction
from payments.models.transaction_log_model import TransactionLog
from payments.models.payment_reconciliation_model import (
    TaxConfiguration,
    ExpenseCategory,
    ManualExpense,
    ReconciliationReport,
    ReconciliationStats
)

User = get_user_model()

class TaxConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for tax configuration"""
    class Meta:
        model = TaxConfiguration
        fields = [
            'id', 'name', 'tax_type', 'rate', 'description', 
            'applies_to', 'is_enabled', 'is_included_in_price',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class ExpenseCategorySerializer(serializers.ModelSerializer):
    """Serializer for expense categories"""
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'is_active', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class ManualExpenseSerializer(serializers.ModelSerializer):
    """Serializer for manual expenses"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ManualExpense
        fields = [
            'id', 'expense_id', 'description', 'amount', 'category', 'category_name',
            'date', 'reference_number', 'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'expense_id', 'created_by', 'created_at', 'updated_at']

class TransactionSummarySerializer(serializers.Serializer):
    """Serializer for transaction summary data"""
    transaction_id = serializers.CharField(source='transaction_id')
    user_name = serializers.SerializerMethodField()
    source = serializers.CharField(source='payment_method')
    category = serializers.CharField(default='Revenue')
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    date = serializers.DateTimeField(source='created_at')
    
    def get_user_name(self, obj):
        return obj.user_name

class ReconciliationStatsSerializer(serializers.ModelSerializer):
    """Serializer for reconciliation statistics"""
    class Meta:
        model = ReconciliationStats
        fields = [
            'date', 'total_revenue', 'total_expenses', 'total_tax',
            'net_profit', 'transaction_count', 'expense_count'
        ]

class ReconciliationReportSerializer(serializers.ModelSerializer):
    """Serializer for reconciliation reports"""
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReconciliationReport
        fields = [
            'id', 'report_id', 'report_type', 'start_date', 'end_date',
            'total_revenue', 'total_expenses', 'total_tax', 'net_profit',
            'tax_configuration', 'generated_by', 'generated_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'report_id', 'created_at']

class ReconciliationFilterSerializer(serializers.Serializer):
    """Serializer for reconciliation filter parameters"""
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    view_mode = serializers.ChoiceField(
        choices=[('all', 'All'), ('revenue', 'Revenue'), ('expenses', 'Expenses')],
        default='all'
    )
    search = serializers.CharField(required=False, allow_blank=True)
    sort_by = serializers.ChoiceField(
        choices=[
            ('date_desc', 'Date Descending'),
            ('date_asc', 'Date Ascending'),
            ('amount_desc', 'Amount Descending'),
            ('amount_asc', 'Amount Ascending')
        ],
        default='date_desc'
    )

class TaxCalculationSerializer(serializers.Serializer):
    """Serializer for tax calculation results"""
    tax_id = serializers.CharField()
    tax_name = serializers.CharField()
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    taxable_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    is_included = serializers.BooleanField()

class ReconciliationSummarySerializer(serializers.Serializer):
    """Serializer for reconciliation summary"""
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_tax = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    revenue_tax_breakdown = TaxCalculationSerializer(many=True)
    expense_tax_breakdown = TaxCalculationSerializer(many=True)