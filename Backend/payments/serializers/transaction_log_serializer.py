from rest_framework import serializers
from django.contrib.auth import get_user_model
from payments.models.payment_config_model import Transaction
from account.models.admin_model import Client
from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory

User = get_user_model()

class TransactionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(read_only=True)
    phone = serializers.SerializerMethodField()
    transaction_date = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = TransactionLog
        fields = [
            'id',
            'transaction_id',
            'user_name',
            'phone',
            'amount',
            'status',
            'payment_method',
            'reference_number',
            'description',
            'transaction_date',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['transaction_id', 'created_at', 'updated_at']
    
    def get_phone(self, obj):
        return obj.formatted_phone
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Format for frontend compatibility
        representation['userName'] = representation.pop('user_name')
        representation['transactionId'] = representation.pop('transaction_id')
        representation['date'] = representation.pop('transaction_date')
        representation['phone'] = representation.pop('phone')
        return representation

class TransactionLogHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = TransactionLogHistory
        fields = [
            'id',
            'action',
            'old_status',
            'new_status',
            'changes',
            'performed_by_name',
            'notes',
            'timestamp'
        ]

class TransactionLogStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    success = serializers.IntegerField()
    pending = serializers.IntegerField()
    failed = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    def to_representation(self, instance):
        return {
            'total': instance['total'],
            'success': instance['success'],
            'pending': instance['pending'],
            'failed': instance['failed'],
            'totalAmount': float(instance['total_amount'])
        }

class TransactionLogFilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    status = serializers.ChoiceField(
        choices=[('all', 'All')] + list(TransactionLog.STATUS_CHOICES),
        required=False,
        default='all'
    )
    search = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=TransactionLog.PAYMENT_METHODS,
        required=False
    )
    sort_by = serializers.ChoiceField(
        choices=[
            ('date_desc', 'Date Descending'),
            ('date_asc', 'Date Ascending'),
            ('amount_desc', 'Amount Descending'),
            ('amount_asc', 'Amount Ascending')
        ],
        required=False,
        default='date_desc'
    )
    page = serializers.IntegerField(required=False, default=1)
    page_size = serializers.IntegerField(required=False, default=20)