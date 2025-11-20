





# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from decimal import Decimal
# import decimal
# from django.utils import timezone
# import logging

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
# logger = logging.getLogger(__name__)

# class SafeDecimalField(serializers.DecimalField):
#     """Enhanced Decimal field that handles conversion errors gracefully"""
#     def to_representation(self, value):
#         try:
#             if value is None:
#                 return None
#             # Convert to string first to avoid Decimal conversion issues
#             return float(value)
#         except (TypeError, ValueError, decimal.InvalidOperation):
#             return 0.0

#     def to_internal_value(self, data):
#         try:
#             return Decimal(str(data))
#         except (TypeError, ValueError, decimal.InvalidOperation):
#             return Decimal('0')

# class TaxConfigurationSerializer(serializers.ModelSerializer):
#     """Production-ready serializer for tax configuration with enhanced features"""
    
#     # Display fields
#     access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
#     tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
#     applies_to_display = serializers.CharField(source='get_applies_to_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     # Enhanced decimal fields
#     rate = SafeDecimalField(
#         max_digits=7, 
#         decimal_places=4,
#         min_value=0,
#         max_value=100
#     )
    
#     # User information
#     created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
#     updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
#     # Computed properties
#     is_active = serializers.BooleanField(read_only=True)
#     days_effective = serializers.IntegerField(read_only=True)
    
#     # Date fields with proper formatting
#     effective_from = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')
#     effective_to = serializers.DateTimeField(
#         format='%Y-%m-%d %H:%M:%S', 
#         required=False, 
#         allow_null=True
#     )
#     created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
#     updated_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
#     last_audited_at = serializers.DateTimeField(
#         format='%Y-%m-%d %H:%M:%S', 
#         required=False, 
#         allow_null=True
#     )

#     class Meta:
#         model = TaxConfiguration
#         fields = [
#             # Core identifiers
#             'id', 'name', 'tax_code', 'tax_type', 'tax_type_display',
            
#             # Rate and calculation
#             'rate', 'description', 'applies_to', 'applies_to_display',
#             'access_type', 'access_type_display',
            
#             # Status and flags
#             'is_enabled', 'is_included_in_price', 'requires_approval',
#             'status', 'status_display',
            
#             # Effective date range
#             'effective_from', 'effective_to',
            
#             # Audit and metadata
#             'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
#             'version', 'revision_notes',
            
#             # Timestamps
#             'created_at', 'updated_at', 'last_audited_at',
            
#             # Computed properties
#             'is_active', 'days_effective'
#         ]
#         read_only_fields = [
#             'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
#             'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
#             'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
#         ]

#     def validate_name(self, value):
#         """Validate tax name uniqueness with case-insensitive check"""
#         if not value or not value.strip():
#             raise serializers.ValidationError("Tax name is required")
        
#         # Check for duplicates excluding current instance
#         queryset = TaxConfiguration.objects.filter(name__iexact=value.strip())
#         if self.instance:
#             queryset = queryset.exclude(pk=self.instance.pk)
            
#         if queryset.exists():
#             raise serializers.ValidationError("A tax configuration with this name already exists")
        
#         return value.strip()

#     def validate_rate(self, value):
#         """Validate tax rate with business rules"""
#         if value is None:
#             raise serializers.ValidationError("Tax rate is required")
        
#         if value < Decimal('0'):
#             raise serializers.ValidationError("Tax rate cannot be negative")
        
#         if value > Decimal('50') and not self.initial_data.get('requires_approval', False):
#             # High rate warning - still allowed but logged
#             logger.warning(f"High tax rate configured: {value}%")
            
#         return value

#     def validate_effective_from(self, value):
#         """Validate effective from date"""
#         if value and value < timezone.now():
#             raise serializers.ValidationError("Effective date cannot be in the past")
#         return value

#     def validate_effective_to(self, value):
#         """Validate effective to date"""
#         effective_from = self.initial_data.get('effective_from')
#         if value and effective_from:
#             try:
#                 effective_from = serializers.DateTimeField().to_internal_value(effective_from)
#                 if value < effective_from:
#                     raise serializers.ValidationError("End date cannot be before start date")
#             except (TypeError, ValueError):
#                 pass  # Let the main validation handle this
#         return value

#     def validate(self, data):
#         """Cross-field validation"""
#         effective_from = data.get('effective_from')
#         effective_to = data.get('effective_to')
        
#         if effective_to and effective_from and effective_to < effective_from:
#             raise serializers.ValidationError({
#                 'effective_to': 'End date cannot be before start date'
#             })
        
#         # Validate that archived taxes cannot be enabled
#         if data.get('status') == 'archived' and data.get('is_enabled', True):
#             raise serializers.ValidationError({
#                 'is_enabled': 'Archived taxes cannot be enabled'
#             })
        
#         return data

#     def create(self, validated_data):
#         """Create tax configuration with enhanced validation"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
            
#         # Set default effective_from if not provided
#         if 'effective_from' not in validated_data:
#             validated_data['effective_from'] = timezone.now()
            
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Update tax configuration with audit tracking"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['updated_by'] = request.user
            
#         # Add revision notes if this is a significant update
#         if 'rate' in validated_data or 'is_enabled' in validated_data:
#             old_rate = instance.rate
#             new_rate = validated_data.get('rate', old_rate)
#             old_enabled = instance.is_enabled
#             new_enabled = validated_data.get('is_enabled', old_enabled)
            
#             revision_notes = []
#             if old_rate != new_rate:
#                 revision_notes.append(f"Rate changed from {old_rate}% to {new_rate}%")
#             if old_enabled != new_enabled:
#                 revision_notes.append(f"Status changed from {'Enabled' if old_enabled else 'Disabled'} to {'Enabled' if new_enabled else 'Disabled'}")
                
#             if revision_notes:
#                 validated_data['revision_notes'] = '; '.join(revision_notes)
        
#         return super().update(instance, validated_data)

# class TaxConfigurationCreateSerializer(serializers.ModelSerializer):
#     """Serializer specifically for creating tax configurations"""
    
#     rate = SafeDecimalField(
#         max_digits=7, 
#         decimal_places=4,
#         min_value=0,
#         max_value=100
#     )

#     class Meta:
#         model = TaxConfiguration
#         fields = [
#             'name', 'tax_type', 'rate', 'description', 
#             'applies_to', 'access_type', 'is_enabled', 
#             'is_included_in_price', 'requires_approval',
#             'effective_from', 'effective_to', 'revision_notes'
#         ]

#     def create(self, validated_data):
#         """Create with current user"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
#         return super().create(validated_data)

# class TaxConfigurationListSerializer(serializers.ModelSerializer):
#     """Lightweight serializer for listing tax configurations"""
    
#     access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
#     tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
#     is_active = serializers.BooleanField(read_only=True)
    
#     class Meta:
#         model = TaxConfiguration
#         fields = [
#             'id', 'name', 'tax_code', 'tax_type', 'tax_type_display',
#             'rate', 'access_type', 'access_type_display', 
#             'is_enabled', 'is_active', 'status',
#             'effective_from', 'effective_to', 'created_at'
#         ]


# class ExpenseCategorySerializer(serializers.ModelSerializer):
#     """Enhanced serializer for expense categories with predefined support"""
#     class Meta:
#         model = ExpenseCategory
#         fields = [
#             'id', 'name', 'description', 'is_active', 'is_predefined',
#             'created_by', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'is_predefined']

#     def validate_name(self, value):
#         """Validate category name uniqueness"""
#         if self.instance and self.instance.name == value:
#             return value
            
#         if ExpenseCategory.objects.filter(name__iexact=value).exists():
#             raise serializers.ValidationError("A category with this name already exists.")
#         return value

# class ExpenseCategoryCreateSerializer(serializers.ModelSerializer):
#     """Serializer for creating expense categories"""
#     class Meta:
#         model = ExpenseCategory
#         fields = ['name', 'description', 'is_active']

#     def create(self, validated_data):
#         """Create expense category with current user"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
#         return super().create(validated_data)

# class ManualExpenseSerializer(serializers.ModelSerializer):
#     """Enhanced serializer for manual expenses with access type"""
#     category_name = serializers.CharField(source='category.name', read_only=True)
#     created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
#     access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
#     amount = SafeDecimalField(max_digits=12, decimal_places=2)

#     class Meta:
#         model = ManualExpense
#         fields = [
#             'id', 'expense_id', 'description', 'amount', 'category', 'category_name',
#             'access_type', 'access_type_display', 'date', 'reference_number', 'notes', 
#             'created_by', 'created_by_name', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'expense_id', 'created_by', 'created_at', 'updated_at']

#     def validate_amount(self, value):
#         """Validate expense amount"""
#         if value <= Decimal('0'):
#             raise serializers.ValidationError("Amount must be greater than 0.")
#         if value > Decimal('10000000'):  # 10 million KES limit
#             raise serializers.ValidationError("Amount seems unusually high. Please verify.")
#         return value

#     def validate_date(self, value):
#         """Validate expense date"""
#         from django.utils import timezone
#         if value > timezone.now().date():
#             raise serializers.ValidationError("Date cannot be in the future.")
#         return value

# class TransactionSummarySerializer(serializers.Serializer):
#     """Enhanced serializer for transaction summary with access type"""
#     transaction_id = serializers.CharField(source='transaction_id')
#     user_name = serializers.SerializerMethodField()
#     source = serializers.CharField(source='payment_method')
#     access_type = serializers.CharField()
#     access_type_display = serializers.CharField(source='get_access_type_display')
#     category = serializers.CharField(default='Revenue')
#     amount = SafeDecimalField(max_digits=12, decimal_places=2)
#     date = serializers.DateTimeField(source='created_at')
#     plan_name = serializers.CharField(source='plan_name', read_only=True)

#     def get_user_name(self, obj):
#         return obj.user_name

# class AccessTypeRevenueSerializer(serializers.Serializer):
#     """Flexible serializer for access type revenue breakdown"""
#     hotspot = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
#     pppoe = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
#     both = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
#     total = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)

#     def to_internal_value(self, data):
#         # Handle cases where data might be missing some fields
#         if isinstance(data, dict):
#             return {
#                 'hotspot': data.get('hotspot', 0),
#                 'pppoe': data.get('pppoe', 0),
#                 'both': data.get('both', 0),
#                 'total': data.get('total', 0)
#             }
#         return super().to_internal_value(data)

#     def to_representation(self, instance):
#         """Handle cases where instance might be a dict without all fields"""
#         if isinstance(instance, dict):
#             # Ensure all fields are present with defaults
#             data = {
#                 'hotspot': instance.get('hotspot', 0),
#                 'pppoe': instance.get('pppoe', 0),
#                 'both': instance.get('both', 0),
#                 'total': instance.get('total', 0)
#             }
#             return super().to_representation(data)
#         return super().to_representation(instance)

# class ReconciliationStatsSerializer(serializers.ModelSerializer):
#     """Enhanced serializer for reconciliation statistics"""
#     class Meta:
#         model = ReconciliationStats
#         fields = [
#             'date', 'total_revenue', 'hotspot_revenue', 'pppoe_revenue', 'both_revenue',
#             'total_expenses', 'hotspot_expenses', 'pppoe_expenses', 'both_expenses', 'general_expenses',
#             'total_tax', 'net_profit', 'transaction_count', 'expense_count',
#             'hotspot_count', 'pppoe_count', 'both_count'
#         ]

# class ReconciliationReportSerializer(serializers.ModelSerializer):
#     """Enhanced serializer for reconciliation reports"""
#     generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
#     revenue_breakdown = serializers.SerializerMethodField()  # Changed to SerializerMethodField
    
#     # Use SafeDecimalField for all decimal fields
#     total_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     hotspot_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     pppoe_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     both_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     hotspot_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     pppoe_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     both_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     general_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     hotspot_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     pppoe_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     both_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_profit = SafeDecimalField(max_digits=15, decimal_places=2)

#     class Meta:
#         model = ReconciliationReport
#         fields = [
#             'id', 'report_id', 'report_type', 'start_date', 'end_date',
#             'total_revenue', 'hotspot_revenue', 'pppoe_revenue', 'both_revenue',
#             'total_expenses', 'hotspot_expenses', 'pppoe_expenses', 'both_expenses', 'general_expenses',
#             'total_tax', 'hotspot_tax', 'pppoe_tax', 'both_tax', 'net_profit',
#             'revenue_breakdown', 'expense_breakdown', 'tax_breakdown',
#             'tax_configuration', 'generated_by', 'generated_by_name', 'created_at'
#         ]
#         read_only_fields = ['id', 'report_id', 'created_at']

#     def get_revenue_breakdown(self, obj):
#         """Custom method to handle revenue breakdown serialization"""
#         # Create a proper structure for the AccessTypeRevenueSerializer
#         breakdown_data = {
#             'hotspot': float(obj.hotspot_revenue) if obj.hotspot_revenue else 0,
#             'pppoe': float(obj.pppoe_revenue) if obj.pppoe_revenue else 0,
#             'both': float(obj.both_revenue) if obj.both_revenue else 0,
#             'total': float(obj.total_revenue) if obj.total_revenue else 0
#         }
#         return AccessTypeRevenueSerializer(breakdown_data).data

# class ReconciliationFilterSerializer(serializers.Serializer):
#     """Enhanced serializer for reconciliation filter parameters"""
#     start_date = serializers.DateField(required=True)
#     end_date = serializers.DateField(required=True)
#     view_mode = serializers.ChoiceField(
#         choices=[('all', 'All'), ('revenue', 'Revenue'), ('expenses', 'Expenses')],
#         default='all'
#     )
#     access_type = serializers.ChoiceField(
#         choices=[('all', 'All'), ('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')],
#         default='all'
#     )
#     search = serializers.CharField(required=False, allow_blank=True)
#     sort_by = serializers.ChoiceField(
#         choices=[
#             ('date_desc', 'Date Descending'),
#             ('date_asc', 'Date Ascending'),
#             ('amount_desc', 'Amount Descending'),
#             ('amount_asc', 'Amount Ascending'),
#             ('access_type', 'Access Type')
#         ],
#         default='date_desc'
#     )

# class TaxCalculationSerializer(serializers.Serializer):
#     """Enhanced serializer for tax calculation results"""
#     tax_id = serializers.CharField()
#     tax_name = serializers.CharField()
#     tax_rate = SafeDecimalField(max_digits=5, decimal_places=2)
#     tax_amount = SafeDecimalField(max_digits=12, decimal_places=2)
#     taxable_amount = SafeDecimalField(max_digits=12, decimal_places=2)
#     is_included = serializers.BooleanField()
#     access_type = serializers.CharField()

# class AccessTypeSummarySerializer(serializers.Serializer):
#     """Serializer for access type summary"""
#     hotspot = serializers.DictField()
#     pppoe = serializers.DictField()
#     both = serializers.DictField()
#     combined = serializers.DictField()

# class ReconciliationSummarySerializer(serializers.Serializer):
#     """Enhanced serializer for reconciliation summary"""
#     total_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_profit = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    
#     # Access type breakdown
#     access_type_breakdown = AccessTypeSummarySerializer()

#     # Tax breakdowns
#     revenue_tax_breakdown = TaxCalculationSerializer(many=True)
#     expense_tax_breakdown = TaxCalculationSerializer(many=True)

#     # Combined metrics
#     combined_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     combined_profit = SafeDecimalField(max_digits=15, decimal_places=2)
#     revenue_distribution = serializers.DictField()

# class ExpenseCategoryListSerializer(serializers.Serializer):
#     """Serializer for expense category list with enhanced data"""
#     id = serializers.UUIDField()
#     name = serializers.CharField()
#     description = serializers.CharField()
#     is_active = serializers.BooleanField()
#     is_predefined = serializers.BooleanField()
#     expense_count = serializers.IntegerField()
#     total_amount = SafeDecimalField(max_digits=15, decimal_places=2)

# class ReportGenerationSerializer(serializers.Serializer):
#     """Serializer for report generation requests"""
#     start_date = serializers.DateField(required=True)
#     end_date = serializers.DateField(required=True)
#     report_type = serializers.ChoiceField(
#         choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('custom', 'Custom')],
#         default='custom'
#     )
#     filters = serializers.DictField(required=False, default=dict)









# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from decimal import Decimal
# import decimal
# from django.utils import timezone
# import logging

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
# logger = logging.getLogger(__name__)

# class SafeDecimalField(serializers.DecimalField):
#     """Enhanced Decimal field that handles conversion errors gracefully"""
    
#     def __init__(self, *args, **kwargs):
#         # Ensure min_value and max_value are Decimal if provided
#         if 'min_value' in kwargs and not isinstance(kwargs['min_value'], Decimal):
#             kwargs['min_value'] = Decimal(str(kwargs['min_value']))
#         if 'max_value' in kwargs and not isinstance(kwargs['max_value'], Decimal):
#             kwargs['max_value'] = Decimal(str(kwargs['max_value']))
#         super().__init__(*args, **kwargs)
    
#     def to_representation(self, value):
#         try:
#             if value is None:
#                 return None
#             # Convert to string first to avoid Decimal conversion issues
#             return float(value)
#         except (TypeError, ValueError, decimal.InvalidOperation):
#             return 0.0

#     def to_internal_value(self, data):
#         try:
#             return Decimal(str(data))
#         except (TypeError, ValueError, decimal.InvalidOperation):
#             return Decimal('0')









        
# class TaxConfigurationSerializer(serializers.ModelSerializer):
#     """Production-ready serializer for tax configuration with enhanced features"""
    
#     # Display fields
#     access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
#     tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
#     applies_to_display = serializers.CharField(source='get_applies_to_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     # Enhanced decimal fields - FIXED: Use Decimal for min/max values
#     rate = SafeDecimalField(
#         max_digits=7, 
#         decimal_places=4,
#         min_value=Decimal('0.0000'),
#         max_value=Decimal('100.0000')
#     )
    
#     # User information
#     created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
#     updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
#     # Computed properties
#     is_active = serializers.BooleanField(read_only=True)
#     days_effective = serializers.IntegerField(read_only=True)
    
#     # Date fields with proper formatting
#     effective_from = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')
#     effective_to = serializers.DateTimeField(
#         format='%Y-%m-%d %H:%M:%S', 
#         required=False, 
#         allow_null=True
#     )
#     created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
#     updated_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
#     last_audited_at = serializers.DateTimeField(
#         format='%Y-%m-%d %H:%M:%S', 
#         required=False, 
#         allow_null=True
#     )

#     class Meta:
#         model = TaxConfiguration
#         fields = [
#             # Core identifiers
#             'id', 'name', 'tax_code', 'tax_type', 'tax_type_display',
            
#             # Rate and calculation
#             'rate', 'description', 'applies_to', 'applies_to_display',
#             'access_type', 'access_type_display',
            
#             # Status and flags
#             'is_enabled', 'is_included_in_price', 'requires_approval',
#             'status', 'status_display',
            
#             # Effective date range
#             'effective_from', 'effective_to',
            
#             # Audit and metadata
#             'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
#             'version', 'revision_notes',
            
#             # Timestamps
#             'created_at', 'updated_at', 'last_audited_at',
            
#             # Computed properties
#             'is_active', 'days_effective'
#         ]
#         read_only_fields = [
#             'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
#             'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
#             'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
#         ]

#     def validate_name(self, value):
#         """Validate tax name uniqueness with case-insensitive check"""
#         if not value or not value.strip():
#             raise serializers.ValidationError("Tax name is required")
        
#         # Check for duplicates excluding current instance
#         queryset = TaxConfiguration.objects.filter(name__iexact=value.strip())
#         if self.instance:
#             queryset = queryset.exclude(pk=self.instance.pk)
            
#         if queryset.exists():
#             raise serializers.ValidationError("A tax configuration with this name already exists")
        
#         return value.strip()

#     def validate_rate(self, value):
#         """Validate tax rate with business rules"""
#         if value is None:
#             raise serializers.ValidationError("Tax rate is required")
        
#         if value < Decimal('0'):
#             raise serializers.ValidationError("Tax rate cannot be negative")
        
#         if value > Decimal('50') and not self.initial_data.get('requires_approval', False):
#             # High rate warning - still allowed but logged
#             logger.warning(f"High tax rate configured: {value}%")
            
#         return value

#     def validate_effective_from(self, value):
#         """Validate effective from date - FIXED: Allow past dates for existing records"""
#         # For new records, ensure effective_from is not in the past
#         # For existing records, allow past dates (they might be historical records)
#         if not self.instance and value and value < timezone.now():
#             # For new tax configurations, set to current time if past date is provided
#             logger.warning(f"Effective date in past for new tax. Using current time instead.")
#             return timezone.now()
        
#         # For updates, allow past dates (they might be correcting historical data)
#         return value

#     def validate_effective_to(self, value):
#         """Validate effective to date"""
#         effective_from = self.initial_data.get('effective_from')
#         if value and effective_from:
#             try:
#                 effective_from = serializers.DateTimeField().to_internal_value(effective_from)
#                 if value < effective_from:
#                     raise serializers.ValidationError("End date cannot be before start date")
#             except (TypeError, ValueError):
#                 pass  # Let the main validation handle this
#         return value

#     def validate(self, data):
#         """Enhanced cross-field validation with better error handling"""
#         errors = {}
        
#         # Get existing values for partial updates
#         effective_from = data.get('effective_from', getattr(self.instance, 'effective_from', None))
#         effective_to = data.get('effective_to', getattr(self.instance, 'effective_to', None))
        
#         # Validate effective date range
#         if effective_to and effective_from and effective_to < effective_from:
#             errors['effective_to'] = 'End date cannot be before start date'
        
#         # Validate that archived taxes cannot be enabled
#         status = data.get('status', getattr(self.instance, 'status', 'active'))
#         is_enabled = data.get('is_enabled', getattr(self.instance, 'is_enabled', True))
        
#         if status == 'archived' and is_enabled:
#             errors['is_enabled'] = 'Archived taxes cannot be enabled'
        
#         # Validate rate and approval requirements
#         rate = data.get('rate', getattr(self.instance, 'rate', Decimal('0')))
#         requires_approval = data.get('requires_approval', getattr(self.instance, 'requires_approval', False))
        
#         if rate > Decimal('50') and not requires_approval:
#             # This is a warning, not an error - still allow but log it
#             logger.warning(f"High tax rate {rate}% configured without approval requirement")
        
#         # Handle datetime format issues
#         if 'effective_from' in data and isinstance(data['effective_from'], str):
#             try:
#                 # Try to parse the datetime string
#                 from django.utils.dateparse import parse_datetime
#                 parsed_dt = parse_datetime(data['effective_from'])
#                 if parsed_dt is None:
#                     errors['effective_from'] = 'Invalid datetime format for effective_from'
#                 else:
#                     # FIXED: Auto-correct past dates for new records
#                     if not self.instance and parsed_dt < timezone.now():
#                         logger.info(f"Auto-correcting past effective_from date to current time")
#                         data['effective_from'] = timezone.now()
#                     else:
#                         data['effective_from'] = parsed_dt
#             except (ValueError, TypeError):
#                 errors['effective_from'] = 'Invalid datetime format for effective_from'
        
#         if 'effective_to' in data and data['effective_to'] and isinstance(data['effective_to'], str):
#             try:
#                 from django.utils.dateparse import parse_datetime
#                 parsed_dt = parse_datetime(data['effective_to'])
#                 if parsed_dt is None:
#                     errors['effective_to'] = 'Invalid datetime format for effective_to'
#                 else:
#                     data['effective_to'] = parsed_dt
#             except (ValueError, TypeError):
#                 errors['effective_to'] = 'Invalid datetime format for effective_to'
        
#         if errors:
#             raise serializers.ValidationError(errors)
        
#         return data

#     def to_internal_value(self, data):
#         """Enhanced data parsing with better error handling"""
#         try:
#             # Handle empty strings for optional fields
#             if 'description' in data and data['description'] == '':
#                 data['description'] = None
#             if 'revision_notes' in data and data['revision_notes'] == '':
#                 data['revision_notes'] = None
#             if 'effective_to' in data and data['effective_to'] == '':
#                 data['effective_to'] = None
            
#             # Convert rate to Decimal if it's a string
#             if 'rate' in data and isinstance(data['rate'], str):
#                 try:
#                     data['rate'] = Decimal(data['rate'])
#                 except (ValueError, TypeError, decimal.InvalidOperation):
#                     raise serializers.ValidationError({
#                         'rate': 'Invalid rate format. Must be a number.'
#                     })
            
#             return super().to_internal_value(data)
#         except (ValueError, TypeError, decimal.InvalidOperation) as e:
#             logger.error(f"Data conversion error in tax serializer: {str(e)}")
#             raise serializers.ValidationError({
#                 'non_field_errors': 'Invalid data format in request'
#             })

#     def create(self, validated_data):
#         """Create tax configuration with enhanced validation"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
            
#         # FIXED: Ensure effective_from is set to current time if not provided or in past
#         if 'effective_from' not in validated_data:
#             validated_data['effective_from'] = timezone.now()
#         elif validated_data['effective_from'] < timezone.now():
#             logger.info(f"Auto-correcting past effective_from date during creation")
#             validated_data['effective_from'] = timezone.now()
            
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Update tax configuration with audit tracking"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['updated_by'] = request.user
            
#         # Add revision notes if this is a significant update
#         if 'rate' in validated_data or 'is_enabled' in validated_data:
#             old_rate = instance.rate
#             new_rate = validated_data.get('rate', old_rate)
#             old_enabled = instance.is_enabled
#             new_enabled = validated_data.get('is_enabled', old_enabled)
            
#             revision_notes = []
#             if old_rate != new_rate:
#                 revision_notes.append(f"Rate changed from {old_rate}% to {new_rate}%")
#             if old_enabled != new_enabled:
#                 revision_notes.append(f"Status changed from {'Enabled' if old_enabled else 'Disabled'} to {'Enabled' if new_enabled else 'Disabled'}")
                
#             if revision_notes:
#                 validated_data['revision_notes'] = '; '.join(revision_notes)
        
#         return super().update(instance, validated_data)

# class TaxConfigurationListSerializer(serializers.ModelSerializer):
#     """Lightweight serializer for listing tax configurations"""
    
#     access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
#     tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
#     is_active = serializers.BooleanField(read_only=True)
    
#     class Meta:
#         model = TaxConfiguration
#         fields = [
#             'id', 'name', 'tax_code', 'tax_type', 'tax_type_display',
#             'rate', 'access_type', 'access_type_display', 
#             'is_enabled', 'is_active', 'status',
#             'effective_from', 'effective_to', 'created_at'
#         ]


        


# class ExpenseCategorySerializer(serializers.ModelSerializer):
#     """Enhanced serializer for expense categories with predefined support"""
#     class Meta:
#         model = ExpenseCategory
#         fields = [
#             'id', 'name', 'description', 'is_active', 'is_predefined',
#             'created_by', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'is_predefined']

#     def validate_name(self, value):
#         """Validate category name uniqueness"""
#         if self.instance and self.instance.name == value:
#             return value
            
#         if ExpenseCategory.objects.filter(name__iexact=value).exists():
#             raise serializers.ValidationError("A category with this name already exists.")
#         return value

# class ExpenseCategoryCreateSerializer(serializers.ModelSerializer):
#     """Serializer for creating expense categories"""
#     class Meta:
#         model = ExpenseCategory
#         fields = ['name', 'description', 'is_active']

#     def create(self, validated_data):
#         """Create expense category with current user"""
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             validated_data['created_by'] = request.user
#         return super().create(validated_data)

# class ManualExpenseSerializer(serializers.ModelSerializer):
#     """Enhanced serializer for manual expenses with access type"""
#     category_name = serializers.CharField(source='category.name', read_only=True)
#     created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
#     access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
#     amount = SafeDecimalField(
#         max_digits=12, 
#         decimal_places=2,
#         min_value=Decimal('0.01')
#     )

#     class Meta:
#         model = ManualExpense
#         fields = [
#             'id', 'expense_id', 'description', 'amount', 'category', 'category_name',
#             'access_type', 'access_type_display', 'date', 'reference_number', 'notes', 
#             'created_by', 'created_by_name', 'created_at', 'updated_at'
#         ]
#         read_only_fields = ['id', 'expense_id', 'created_by', 'created_at', 'updated_at']

#     def validate_amount(self, value):
#         """Validate expense amount"""
#         if value <= Decimal('0'):
#             raise serializers.ValidationError("Amount must be greater than 0.")
#         if value > Decimal('10000000'):  # 10 million KES limit
#             raise serializers.ValidationError("Amount seems unusually high. Please verify.")
#         return value

#     def validate_date(self, value):
#         """Validate expense date"""
#         from django.utils import timezone
#         if value > timezone.now().date():
#             raise serializers.ValidationError("Date cannot be in the future.")
#         return value

# class TransactionSummarySerializer(serializers.Serializer):
#     """Enhanced serializer for transaction summary with access type"""
#     transaction_id = serializers.CharField(source='transaction_id')
#     user_name = serializers.SerializerMethodField()
#     source = serializers.CharField(source='payment_method')
#     access_type = serializers.CharField()
#     access_type_display = serializers.CharField(source='get_access_type_display')
#     category = serializers.CharField(default='Revenue')
#     amount = SafeDecimalField(max_digits=12, decimal_places=2)
#     date = serializers.DateTimeField(source='created_at')
#     plan_name = serializers.CharField(source='plan_name', read_only=True)

#     def get_user_name(self, obj):
#         return obj.user_name

# class AccessTypeRevenueSerializer(serializers.Serializer):
#     """Flexible serializer for access type revenue breakdown"""
#     hotspot = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
#     pppoe = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
#     both = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
#     total = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)

#     def to_internal_value(self, data):
#         # Handle cases where data might be missing some fields
#         if isinstance(data, dict):
#             return {
#                 'hotspot': data.get('hotspot', 0),
#                 'pppoe': data.get('pppoe', 0),
#                 'both': data.get('both', 0),
#                 'total': data.get('total', 0)
#             }
#         return super().to_internal_value(data)

#     def to_representation(self, instance):
#         """Handle cases where instance might be a dict without all fields"""
#         if isinstance(instance, dict):
#             # Ensure all fields are present with defaults
#             data = {
#                 'hotspot': instance.get('hotspot', 0),
#                 'pppoe': instance.get('pppoe', 0),
#                 'both': instance.get('both', 0),
#                 'total': instance.get('total', 0)
#             }
#             return super().to_representation(data)
#         return super().to_representation(instance)

# class ReconciliationStatsSerializer(serializers.ModelSerializer):
#     """Enhanced serializer for reconciliation statistics"""
#     class Meta:
#         model = ReconciliationStats
#         fields = [
#             'date', 'total_revenue', 'hotspot_revenue', 'pppoe_revenue', 'both_revenue',
#             'total_expenses', 'hotspot_expenses', 'pppoe_expenses', 'both_expenses', 'general_expenses',
#             'total_tax', 'net_profit', 'transaction_count', 'expense_count',
#             'hotspot_count', 'pppoe_count', 'both_count'
#         ]

# class ReconciliationReportSerializer(serializers.ModelSerializer):
#     """Enhanced serializer for reconciliation reports"""
#     generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
#     revenue_breakdown = serializers.SerializerMethodField()  # Changed to SerializerMethodField
    
#     # Use SafeDecimalField for all decimal fields with proper Decimal min/max values
#     total_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     hotspot_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     pppoe_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     both_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     hotspot_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     pppoe_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     both_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     general_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     hotspot_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     pppoe_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     both_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_profit = SafeDecimalField(max_digits=15, decimal_places=2)

#     class Meta:
#         model = ReconciliationReport
#         fields = [
#             'id', 'report_id', 'report_type', 'start_date', 'end_date',
#             'total_revenue', 'hotspot_revenue', 'pppoe_revenue', 'both_revenue',
#             'total_expenses', 'hotspot_expenses', 'pppoe_expenses', 'both_expenses', 'general_expenses',
#             'total_tax', 'hotspot_tax', 'pppoe_tax', 'both_tax', 'net_profit',
#             'revenue_breakdown', 'expense_breakdown', 'tax_breakdown',
#             'tax_configuration', 'generated_by', 'generated_by_name', 'created_at'
#         ]
#         read_only_fields = ['id', 'report_id', 'created_at']

#     def get_revenue_breakdown(self, obj):
#         """Custom method to handle revenue breakdown serialization"""
#         # Create a proper structure for the AccessTypeRevenueSerializer
#         breakdown_data = {
#             'hotspot': float(obj.hotspot_revenue) if obj.hotspot_revenue else 0,
#             'pppoe': float(obj.pppoe_revenue) if obj.pppoe_revenue else 0,
#             'both': float(obj.both_revenue) if obj.both_revenue else 0,
#             'total': float(obj.total_revenue) if obj.total_revenue else 0
#         }
#         return AccessTypeRevenueSerializer(breakdown_data).data

# class ReconciliationFilterSerializer(serializers.Serializer):
#     """Enhanced serializer for reconciliation filter parameters"""
#     start_date = serializers.DateField(required=True)
#     end_date = serializers.DateField(required=True)
#     view_mode = serializers.ChoiceField(
#         choices=[('all', 'All'), ('revenue', 'Revenue'), ('expenses', 'Expenses')],
#         default='all'
#     )
#     access_type = serializers.ChoiceField(
#         choices=[('all', 'All'), ('hotspot', 'Hotspot'), ('pppoe', 'PPPoE'), ('both', 'Both')],
#         default='all'
#     )
#     search = serializers.CharField(required=False, allow_blank=True)
#     sort_by = serializers.ChoiceField(
#         choices=[
#             ('date_desc', 'Date Descending'),
#             ('date_asc', 'Date Ascending'),
#             ('amount_desc', 'Amount Descending'),
#             ('amount_asc', 'Amount Ascending'),
#             ('access_type', 'Access Type')
#         ],
#         default='date_desc'
#     )

# class TaxCalculationSerializer(serializers.Serializer):
#     """Enhanced serializer for tax calculation results"""
#     tax_id = serializers.CharField()
#     tax_name = serializers.CharField()
#     tax_rate = SafeDecimalField(max_digits=5, decimal_places=2)
#     tax_amount = SafeDecimalField(max_digits=12, decimal_places=2)
#     taxable_amount = SafeDecimalField(max_digits=12, decimal_places=2)
#     is_included = serializers.BooleanField()
#     access_type = serializers.CharField()

# class AccessTypeSummarySerializer(serializers.Serializer):
#     """Serializer for access type summary"""
#     hotspot = serializers.DictField()
#     pppoe = serializers.DictField()
#     both = serializers.DictField()
#     combined = serializers.DictField()

# class ReconciliationSummarySerializer(serializers.Serializer):
#     """Enhanced serializer for reconciliation summary"""
#     total_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
#     total_tax = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_profit = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     net_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    
#     # Access type breakdown
#     access_type_breakdown = AccessTypeSummarySerializer()

#     # Tax breakdowns
#     revenue_tax_breakdown = TaxCalculationSerializer(many=True)
#     expense_tax_breakdown = TaxCalculationSerializer(many=True)

#     # Combined metrics
#     combined_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
#     combined_profit = SafeDecimalField(max_digits=15, decimal_places=2)
#     revenue_distribution = serializers.DictField()

# class ExpenseCategoryListSerializer(serializers.Serializer):
#     """Serializer for expense category list with enhanced data"""
#     id = serializers.UUIDField()
#     name = serializers.CharField()
#     description = serializers.CharField()
#     is_active = serializers.BooleanField()
#     is_predefined = serializers.BooleanField()
#     expense_count = serializers.IntegerField()
#     total_amount = SafeDecimalField(max_digits=15, decimal_places=2)

# class ReportGenerationSerializer(serializers.Serializer):
#     """Serializer for report generation requests"""
#     start_date = serializers.DateField(required=True)
#     end_date = serializers.DateField(required=True)
#     report_type = serializers.ChoiceField(
#         choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('custom', 'Custom')],
#         default='custom'
#     )
#     filters = serializers.DictField(required=False, default=dict)









from rest_framework import serializers
from django.contrib.auth import get_user_model
from decimal import Decimal
import decimal
from django.utils import timezone
import logging

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
logger = logging.getLogger(__name__)

class SafeDecimalField(serializers.DecimalField):
    """Enhanced Decimal field that handles conversion errors gracefully"""
    
    def __init__(self, *args, **kwargs):
        # Ensure min_value and max_value are Decimal if provided
        if 'min_value' in kwargs and not isinstance(kwargs['min_value'], Decimal):
            kwargs['min_value'] = Decimal(str(kwargs['min_value']))
        if 'max_value' in kwargs and not isinstance(kwargs['max_value'], Decimal):
            kwargs['max_value'] = Decimal(str(kwargs['max_value']))
        super().__init__(*args, **kwargs)
    
    def to_representation(self, value):
        try:
            if value is None:
                return None
            # Convert to string first to avoid Decimal conversion issues
            return float(value)
        except (TypeError, ValueError, decimal.InvalidOperation):
            return 0.0

    def to_internal_value(self, data):
        try:
            return Decimal(str(data))
        except (TypeError, ValueError, decimal.InvalidOperation):
            return Decimal('0')

class TaxConfigurationSerializer(serializers.ModelSerializer):
    """Production-ready serializer for tax configuration with enhanced timestamp handling"""
    
    # Display fields
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
    tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
    applies_to_display = serializers.CharField(source='get_applies_to_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Enhanced decimal fields
    rate = SafeDecimalField(
        max_digits=7, 
        decimal_places=4,
        min_value=Decimal('0.0000'),
        max_value=Decimal('100.0000')
    )
    
    # User information
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    
    # Computed properties
    is_active = serializers.BooleanField(read_only=True)
    days_effective = serializers.IntegerField(read_only=True)
    
    # Date fields with proper formatting
    effective_from = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')
    effective_to = serializers.DateTimeField(
        format='%Y-%m-%d %H:%M:%S', 
        required=False, 
        allow_null=True
    )
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    updated_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    last_audited_at = serializers.DateTimeField(
        format='%Y-%m-%d %H:%M:%S', 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = TaxConfiguration
        fields = [
            # Core identifiers
            'id', 'name', 'tax_code', 'tax_type', 'tax_type_display',
            
            # Rate and calculation
            'rate', 'description', 'applies_to', 'applies_to_display',
            'access_type', 'access_type_display',
            
            # Status and flags
            'is_enabled', 'is_included_in_price', 'requires_approval',
            'status', 'status_display',
            
            # Effective date range
            'effective_from', 'effective_to',
            
            # Audit and metadata
            'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'version', 'revision_notes',
            
            # Timestamps
            'created_at', 'updated_at', 'last_audited_at',
            
            # Computed properties
            'is_active', 'days_effective'
        ]
        read_only_fields = [
            'id', 'tax_code', 'created_by', 'created_at', 'updated_at', 
            'version', 'is_active', 'days_effective', 'created_by_name', 'updated_by_name',
            'access_type_display', 'tax_type_display', 'applies_to_display', 'status_display'
        ]

    def validate_name(self, value):
        """Validate tax name uniqueness with case-insensitive check"""
        if not value or not value.strip():
            raise serializers.ValidationError("Tax name is required")
        
        # Check for duplicates excluding current instance
        queryset = TaxConfiguration.objects.filter(name__iexact=value.strip())
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("A tax configuration with this name already exists")
        
        return value.strip()

    def validate_rate(self, value):
        """Validate tax rate with business rules"""
        if value is None:
            raise serializers.ValidationError("Tax rate is required")
        
        if value < Decimal('0'):
            raise serializers.ValidationError("Tax rate cannot be negative")
        
        if value > Decimal('50') and not self.initial_data.get('requires_approval', False):
            # High rate warning - still allowed but logged
            logger.warning(f"High tax rate configured: {value}%")
            
        return value

    def validate_effective_from(self, value):
        """Validate effective from date - ALLOW user to set any date including past"""
        # Allow any valid datetime - don't restrict to future dates
        # Frontend will default to current time, but backend respects user choice
        if value is None:
            raise serializers.ValidationError("Effective from date is required")
        
        return value

    def validate_effective_to(self, value):
        """Validate effective to date"""
        effective_from = self.initial_data.get('effective_from')
        if value and effective_from:
            try:
                effective_from = serializers.DateTimeField().to_internal_value(effective_from)
                if value < effective_from:
                    raise serializers.ValidationError("End date cannot be before start date")
            except (TypeError, ValueError):
                pass  # Let the main validation handle this
        return value

    def validate(self, data):
        """Enhanced cross-field validation with better error handling"""
        errors = {}
        
        # Get existing values for partial updates
        effective_from = data.get('effective_from', getattr(self.instance, 'effective_from', None))
        effective_to = data.get('effective_to', getattr(self.instance, 'effective_to', None))
        
        # Validate effective date range
        if effective_to and effective_from and effective_to < effective_from:
            errors['effective_to'] = 'End date cannot be before start date'
        
        # Validate that archived taxes cannot be enabled
        status = data.get('status', getattr(self.instance, 'status', 'active'))
        is_enabled = data.get('is_enabled', getattr(self.instance, 'is_enabled', True))
        
        if status == 'archived' and is_enabled:
            errors['is_enabled'] = 'Archived taxes cannot be enabled'
        
        # Validate rate and approval requirements
        rate = data.get('rate', getattr(self.instance, 'rate', Decimal('0')))
        requires_approval = data.get('requires_approval', getattr(self.instance, 'requires_approval', False))
        
        if rate > Decimal('50') and not requires_approval:
            # This is a warning, not an error - still allow but log it
            logger.warning(f"High tax rate {rate}% configured without approval requirement")
        
        # Handle datetime format issues
        if 'effective_from' in data and isinstance(data['effective_from'], str):
            try:
                # Try to parse the datetime string
                from django.utils.dateparse import parse_datetime
                parsed_dt = parse_datetime(data['effective_from'])
                if parsed_dt is None:
                    errors['effective_from'] = 'Invalid datetime format for effective_from'
                else:
                    data['effective_from'] = parsed_dt
            except (ValueError, TypeError):
                errors['effective_from'] = 'Invalid datetime format for effective_from'
        
        if 'effective_to' in data and data['effective_to'] and isinstance(data['effective_to'], str):
            try:
                from django.utils.dateparse import parse_datetime
                parsed_dt = parse_datetime(data['effective_to'])
                if parsed_dt is None:
                    errors['effective_to'] = 'Invalid datetime format for effective_to'
                else:
                    data['effective_to'] = parsed_dt
            except (ValueError, TypeError):
                errors['effective_to'] = 'Invalid datetime format for effective_to'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data

    def to_internal_value(self, data):
        """Enhanced data parsing with better error handling"""
        try:
            # Handle empty strings for optional fields
            if 'description' in data and data['description'] == '':
                data['description'] = None
            if 'revision_notes' in data and data['revision_notes'] == '':
                data['revision_notes'] = None
            if 'effective_to' in data and data['effective_to'] == '':
                data['effective_to'] = None
            
            # Convert rate to Decimal if it's a string
            if 'rate' in data and isinstance(data['rate'], str):
                try:
                    data['rate'] = Decimal(data['rate'])
                except (ValueError, TypeError, decimal.InvalidOperation):
                    raise serializers.ValidationError({
                        'rate': 'Invalid rate format. Must be a number.'
                    })
            
            return super().to_internal_value(data)
        except (ValueError, TypeError, decimal.InvalidOperation) as e:
            logger.error(f"Data conversion error in tax serializer: {str(e)}")
            raise serializers.ValidationError({
                'non_field_errors': 'Invalid data format in request'
            })

    def create(self, validated_data):
        """Create tax configuration with automatic timestamp handling"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
            
        # CRITICAL: Use current time for created_at, but respect user's effective_from choice
        # Don't override effective_from with current time - respect user's choice
        # The frontend will default to current time, but backend should respect user override
        
        # Create the instance - Django will automatically set created_at and updated_at
        instance = super().create(validated_data)
        
        logger.info(f"Tax configuration created - ID: {instance.id}, Name: {instance.name}, "
                   f"Effective From: {instance.effective_from}, Created At: {instance.created_at}")
        
        return instance

    def update(self, instance, validated_data):
        """Update tax configuration with automatic updated_at handling"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
            
        # Add revision notes if this is a significant update
        if 'rate' in validated_data or 'is_enabled' in validated_data:
            old_rate = instance.rate
            new_rate = validated_data.get('rate', old_rate)
            old_enabled = instance.is_enabled
            new_enabled = validated_data.get('is_enabled', old_enabled)
            
            revision_notes = []
            if old_rate != new_rate:
                revision_notes.append(f"Rate changed from {old_rate}% to {new_rate}%")
            if old_enabled != new_enabled:
                revision_notes.append(f"Status changed from {'Enabled' if old_enabled else 'Disabled'} to {'Enabled' if new_enabled else 'Disabled'}")
                
            if revision_notes:
                validated_data['revision_notes'] = '; '.join(revision_notes)
        
        # Update the instance - Django will automatically update updated_at
        updated_instance = super().update(instance, validated_data)
        
        logger.info(f"Tax configuration updated - ID: {updated_instance.id}, Name: {updated_instance.name}, "
                   f"Updated At: {updated_instance.updated_at}")
        
        return updated_instance

class TaxConfigurationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing tax configurations"""
    
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
    tax_type_display = serializers.CharField(source='get_tax_type_display', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TaxConfiguration
        fields = [
            'id', 'name', 'tax_code', 'tax_type', 'tax_type_display',
            'rate', 'access_type', 'access_type_display', 
            'is_enabled', 'is_active', 'status',
            'effective_from', 'effective_to', 'created_at'
        ]

class ExpenseCategorySerializer(serializers.ModelSerializer):
    """Enhanced serializer for expense categories with predefined support"""
    class Meta:
        model = ExpenseCategory
        fields = [
            'id', 'name', 'description', 'is_active', 'is_predefined',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'is_predefined']

    def validate_name(self, value):
        """Validate category name uniqueness"""
        if self.instance and self.instance.name == value:
            return value
            
        if ExpenseCategory.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return value

class ExpenseCategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating expense categories"""
    class Meta:
        model = ExpenseCategory
        fields = ['name', 'description', 'is_active']

    def create(self, validated_data):
        """Create expense category with current user"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class ManualExpenseSerializer(serializers.ModelSerializer):
    """Enhanced serializer for manual expenses with access type"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)
    amount = SafeDecimalField(
        max_digits=12, 
        decimal_places=2,
        min_value=Decimal('0.01')
    )

    class Meta:
        model = ManualExpense
        fields = [
            'id', 'expense_id', 'description', 'amount', 'category', 'category_name',
            'access_type', 'access_type_display', 'date', 'reference_number', 'notes', 
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'expense_id', 'created_by', 'created_at', 'updated_at']

    def validate_amount(self, value):
        """Validate expense amount"""
        if value <= Decimal('0'):
            raise serializers.ValidationError("Amount must be greater than 0.")
        if value > Decimal('10000000'):  # 10 million KES limit
            raise serializers.ValidationError("Amount seems unusually high. Please verify.")
        return value

    def validate_date(self, value):
        """Validate expense date"""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value

class TransactionSummarySerializer(serializers.Serializer):
    """Enhanced serializer for transaction summary with access type"""
    transaction_id = serializers.CharField(source='transaction_id')
    user_name = serializers.SerializerMethodField()
    source = serializers.CharField(source='payment_method')
    access_type = serializers.CharField()
    access_type_display = serializers.CharField(source='get_access_type_display')
    category = serializers.CharField(default='Revenue')
    amount = SafeDecimalField(max_digits=12, decimal_places=2)
    date = serializers.DateTimeField(source='created_at')
    plan_name = serializers.CharField(source='plan_name', read_only=True)

    def get_user_name(self, obj):
        return obj.user_name

class AccessTypeRevenueSerializer(serializers.Serializer):
    """Flexible serializer for access type revenue breakdown"""
    hotspot = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
    pppoe = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
    both = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)
    total = SafeDecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, default=0)

    def to_internal_value(self, data):
        # Handle cases where data might be missing some fields
        if isinstance(data, dict):
            return {
                'hotspot': data.get('hotspot', 0),
                'pppoe': data.get('pppoe', 0),
                'both': data.get('both', 0),
                'total': data.get('total', 0)
            }
        return super().to_internal_value(data)

    def to_representation(self, instance):
        """Handle cases where instance might be a dict without all fields"""
        if isinstance(instance, dict):
            # Ensure all fields are present with defaults
            data = {
                'hotspot': instance.get('hotspot', 0),
                'pppoe': instance.get('pppoe', 0),
                'both': instance.get('both', 0),
                'total': instance.get('total', 0)
            }
            return super().to_representation(data)
        return super().to_representation(instance)

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
    revenue_breakdown = serializers.SerializerMethodField()  # Changed to SerializerMethodField
    
    # Use SafeDecimalField for all decimal fields with proper Decimal min/max values
    total_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    hotspot_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    pppoe_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    both_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    total_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    hotspot_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    pppoe_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    both_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    general_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    total_tax = SafeDecimalField(max_digits=15, decimal_places=2)
    hotspot_tax = SafeDecimalField(max_digits=15, decimal_places=2)
    pppoe_tax = SafeDecimalField(max_digits=15, decimal_places=2)
    both_tax = SafeDecimalField(max_digits=15, decimal_places=2)
    net_profit = SafeDecimalField(max_digits=15, decimal_places=2)

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

    def get_revenue_breakdown(self, obj):
        """Custom method to handle revenue breakdown serialization"""
        # Create a proper structure for the AccessTypeRevenueSerializer
        breakdown_data = {
            'hotspot': float(obj.hotspot_revenue) if obj.hotspot_revenue else 0,
            'pppoe': float(obj.pppoe_revenue) if obj.pppoe_revenue else 0,
            'both': float(obj.both_revenue) if obj.both_revenue else 0,
            'total': float(obj.total_revenue) if obj.total_revenue else 0
        }
        return AccessTypeRevenueSerializer(breakdown_data).data

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
    tax_rate = SafeDecimalField(max_digits=5, decimal_places=2)
    tax_amount = SafeDecimalField(max_digits=12, decimal_places=2)
    taxable_amount = SafeDecimalField(max_digits=12, decimal_places=2)
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
    total_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    total_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    total_tax = SafeDecimalField(max_digits=15, decimal_places=2)
    net_profit = SafeDecimalField(max_digits=15, decimal_places=2)
    net_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    net_expenses = SafeDecimalField(max_digits=15, decimal_places=2)
    
    # Access type breakdown
    access_type_breakdown = AccessTypeSummarySerializer()

    # Tax breakdowns
    revenue_tax_breakdown = TaxCalculationSerializer(many=True)
    expense_tax_breakdown = TaxCalculationSerializer(many=True)

    # Combined metrics
    combined_revenue = SafeDecimalField(max_digits=15, decimal_places=2)
    combined_profit = SafeDecimalField(max_digits=15, decimal_places=2)
    revenue_distribution = serializers.DictField()

class ExpenseCategoryListSerializer(serializers.Serializer):
    """Serializer for expense category list with enhanced data"""
    id = serializers.UUIDField()
    name = serializers.CharField()
    description = serializers.CharField()
    is_active = serializers.BooleanField()
    is_predefined = serializers.BooleanField()
    expense_count = serializers.IntegerField()
    total_amount = SafeDecimalField(max_digits=15, decimal_places=2)

class ReportGenerationSerializer(serializers.Serializer):
    """Serializer for report generation requests"""
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    report_type = serializers.ChoiceField(
        choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('custom', 'Custom')],
        default='custom'
    )
    filters = serializers.DictField(required=False, default=dict)