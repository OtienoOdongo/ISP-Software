




# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from payments.models.payment_config_model import Transaction
# from payments.models.transaction_log_model import TransactionLog
# from payments.models.payment_reconciliation_model import (
#     TaxConfiguration,
#     ExpenseCategory,
#     ManualExpense,
#     ReconciliationReport,
#     ReconciliationStats
# )

# User = get_user_model()

# class TaxConfigurationSerializer(serializers.ModelSerializer):
#     """Serializer for tax configuration"""
#     class Meta:
#         model = TaxConfiguration
#         fields = [
#             'id', 'name', 'tax_type', 'rate', 'description', 
#             'applies_to', 'is_enabled', 'is_included_in_price',
#             'created_by', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

# class ExpenseCategorySerializer(serializers.ModelSerializer):
#     """Serializer for expense categories"""
#     class Meta:
#         model = ExpenseCategory
#         fields = ['id', 'name', 'description', 'is_active', 'created_by', 'created_at', 'updated_at']
#         read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

# class ManualExpenseSerializer(serializers.ModelSerializer):
#     """Serializer for manual expenses"""
#     category_name = serializers.CharField(source='category.name', read_only=True)
#     created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
#     class Meta:
#         model = ManualExpense
#         fields = [
#             'id', 'expense_id', 'description', 'amount', 'category', 'category_name',
#             'date', 'reference_number', 'notes', 'created_by', 'created_by_name',
#             'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'expense_id', 'created_by', 'created_at', 'updated_at']

# class TransactionSummarySerializer(serializers.Serializer):
#     """Serializer for transaction summary data"""
#     transaction_id = serializers.CharField(source='transaction_id')
#     user_name = serializers.SerializerMethodField()
#     source = serializers.CharField(source='payment_method')
#     category = serializers.CharField(default='Revenue')
#     amount = serializers.DecimalField(max_digits=12, decimal_places=2)
#     date = serializers.DateTimeField(source='created_at')
    
#     def get_user_name(self, obj):
#         return obj.user_name

# class ReconciliationStatsSerializer(serializers.ModelSerializer):
#     """Serializer for reconciliation statistics"""
#     class Meta:
#         model = ReconciliationStats
#         fields = [
#             'date', 'total_revenue', 'total_expenses', 'total_tax',
#             'net_profit', 'transaction_count', 'expense_count'
#         ]

# class ReconciliationReportSerializer(serializers.ModelSerializer):
#     """Serializer for reconciliation reports"""
#     generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
#     class Meta:
#         model = ReconciliationReport
#         fields = [
#             'id', 'report_id', 'report_type', 'start_date', 'end_date',
#             'total_revenue', 'total_expenses', 'total_tax', 'net_profit',
#             'tax_configuration', 'generated_by', 'generated_by_name', 'created_at'
#         ]
#         read_only_fields = ['id', 'report_id', 'created_at']

# class ReconciliationFilterSerializer(serializers.Serializer):
#     """Serializer for reconciliation filter parameters"""
#     start_date = serializers.DateField(required=True)
#     end_date = serializers.DateField(required=True)
#     view_mode = serializers.ChoiceField(
#         choices=[('all', 'All'), ('revenue', 'Revenue'), ('expenses', 'Expenses')],
#         default='all'
#     )
#     search = serializers.CharField(required=False, allow_blank=True)
#     sort_by = serializers.ChoiceField(
#         choices=[
#             ('date_desc', 'Date Descending'),
#             ('date_asc', 'Date Ascending'),
#             ('amount_desc', 'Amount Descending'),
#             ('amount_asc', 'Amount Ascending')
#         ],
#         default='date_desc'
#     )

# class TaxCalculationSerializer(serializers.Serializer):
#     """Serializer for tax calculation results"""
#     tax_id = serializers.CharField()
#     tax_name = serializers.CharField()
#     tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
#     tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
#     taxable_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
#     is_included = serializers.BooleanField()

# class ReconciliationSummarySerializer(serializers.Serializer):
#     """Serializer for reconciliation summary"""
#     total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
#     total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
#     total_tax = serializers.DecimalField(max_digits=15, decimal_places=2)
#     net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
#     net_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
#     net_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
#     revenue_tax_breakdown = TaxCalculationSerializer(many=True)
#     expense_tax_breakdown = TaxCalculationSerializer(many=True)









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
    """Enhanced serializer for tax configuration with access type"""
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
    
    class Meta:
        model = TaxConfiguration
        fields = [
            'id', 'name', 'tax_type', 'rate', 'description', 
            'applies_to', 'access_type', 'access_type_display',
            'is_enabled', 'is_included_in_price',
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
    """Enhanced serializer for manual expenses with access type"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
    
    class Meta:
        model = ManualExpense
        fields = [
            'id', 'expense_id', 'description', 'amount', 'category', 'category_name',
            'access_type', 'access_type_display', 'date', 'reference_number', 'notes', 
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'expense_id', 'created_by', 'created_at', 'updated_at']

class TransactionSummarySerializer(serializers.Serializer):
    """Enhanced serializer for transaction summary with access type"""
    transaction_id = serializers.CharField(source='transaction_id')
    user_name = serializers.SerializerMethodField()
    source = serializers.CharField(source='payment_method')
    access_type = serializers.CharField()
    access_type_display = serializers.CharField(source='get_access_type_display')
    category = serializers.CharField(default='Revenue')
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    date = serializers.DateTimeField(source='created_at')
    plan_name = serializers.CharField(source='plan_name', read_only=True)
    
    def get_user_name(self, obj):
        return obj.user_name

class AccessTypeRevenueSerializer(serializers.Serializer):
    """Serializer for access type revenue breakdown"""
    hotspot = serializers.DecimalField(max_digits=15, decimal_places=2)
    pppoe = serializers.DecimalField(max_digits=15, decimal_places=2)
    both = serializers.DecimalField(max_digits=15, decimal_places=2)
    total = serializers.DecimalField(max_digits=15, decimal_places=2)

class ReconciliationStatsSerializer(serializers.ModelSerializer):
    """Enhanced serializer for reconciliation statistics"""
    class Meta:
        model = ReconciliationStats
        fields = [
            'date', 'total_revenue', 'hotspot_revenue', 'pppoe_revenue', 'both_revenue',
            'total_expenses', 'hotspot_expenses', 'pppoe_expenses', 'both_expenses', 'general_expenses',
            'total_tax', 'net_profit', 'transaction_count', 'expense_count',
            'hotspot_count', 'pppoe_count', 'both_count'
        ]

class ReconciliationReportSerializer(serializers.ModelSerializer):
    """Enhanced serializer for reconciliation reports"""
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    revenue_breakdown = AccessTypeRevenueSerializer(read_only=True)
    
    class Meta:
        model = ReconciliationReport
        fields = [
            'id', 'report_id', 'report_type', 'start_date', 'end_date',
            'total_revenue', 'hotspot_revenue', 'pppoe_revenue', 'both_revenue',
            'total_expenses', 'hotspot_expenses', 'pppoe_expenses', 'both_expenses', 'general_expenses',
            'total_tax', 'hotspot_tax', 'pppoe_tax', 'both_tax', 'net_profit',
            'revenue_breakdown', 'expense_breakdown', 'tax_breakdown',
            'tax_configuration', 'generated_by', 'generated_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'report_id', 'created_at']

class ReconciliationFilterSerializer(serializers.Serializer):
    """Enhanced serializer for reconciliation filter parameters"""
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    view_mode = serializers.ChoiceField(
        choices=[('all', 'All'), ('revenue', 'Revenue'), ('expenses', 'Expenses')],
        default='all'
    )
    access_type = serializers.ChoiceField(
        choices=[('all', 'All'), ('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')],
        default='all'
    )
    search = serializers.CharField(required=False, allow_blank=True)
    sort_by = serializers.ChoiceField(
        choices=[
            ('date_desc', 'Date Descending'),
            ('date_asc', 'Date Ascending'),
            ('amount_desc', 'Amount Descending'),
            ('amount_asc', 'Amount Ascending'),
            ('access_type', 'Access Type')
        ],
        default='date_desc'
    )

class TaxCalculationSerializer(serializers.Serializer):
    """Enhanced serializer for tax calculation results"""
    tax_id = serializers.CharField()
    tax_name = serializers.CharField()
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    taxable_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    is_included = serializers.BooleanField()
    access_type = serializers.CharField()

class AccessTypeSummarySerializer(serializers.Serializer):
    """Serializer for access type summary"""
    hotspot = serializers.DictField()
    pppoe = serializers.DictField()
    both = serializers.DictField()
    combined = serializers.DictField()

class ReconciliationSummarySerializer(serializers.Serializer):
    """Enhanced serializer for reconciliation summary"""
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_tax = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_expenses = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Access type breakdown
    access_type_breakdown = AccessTypeSummarySerializer()
    
    # Tax breakdowns
    revenue_tax_breakdown = TaxCalculationSerializer(many=True)
    expense_tax_breakdown = TaxCalculationSerializer(many=True)
    
    # Combined metrics
    combined_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    combined_profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    revenue_distribution = serializers.DictField()