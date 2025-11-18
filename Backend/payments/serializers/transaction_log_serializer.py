

# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory

# User = get_user_model()


# class TransactionLogSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(read_only=True)
#     phone = serializers.SerializerMethodField()
#     transaction_date = serializers.DateTimeField(source="created_at", read_only=True)
#     subscription_plan = serializers.SerializerMethodField()  # ✅ NEW: Subscription plan field

#     class Meta:
#         model = TransactionLog
#         fields = [
#             "id",
#             "transaction_id",
#             "user_name",
#             "phone",
#             "amount",
#             "status",
#             "payment_method",
#             "reference_number",
#             "description",
#             "metadata",
#             "transaction_date",
#             "created_at",
#             "updated_at",
#             "subscription_plan",  # ✅ NEW: Added subscription plan
#         ]
#         read_only_fields = ["transaction_id", "created_at", "updated_at", "user_name"]

#     def get_phone(self, obj):
#         return obj.formatted_phone

#     def get_subscription_plan(self, obj):
#         """Get subscription plan name with fallback"""
#         return obj.subscription_plan_name

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep["userName"] = rep.pop("user_name")
#         rep["transactionId"] = rep.pop("transaction_id")
#         rep["date"] = rep.pop("transaction_date")
#         rep["subscriptionPlan"] = rep.pop("subscription_plan")  # ✅ NEW: Add to frontend response
#         return rep

#     def create(self, validated_data):
#         """
#         Create a new transaction log and store history entry.
#         """
#         user = self.context["request"].user if "request" in self.context else None
#         transaction_log = TransactionLog.objects.create(**validated_data)

#         # Log creation
#         TransactionLogHistory.objects.create(
#             transaction_log=transaction_log,
#             action="create",
#             new_status=transaction_log.status,
#             performed_by=user,
#             changes={"created": True},
#         )
#         return transaction_log

#     def update(self, instance, validated_data):
#         """
#         Update a transaction log and record changes in history.
#         """
#         user = self.context["request"].user if "request" in self.context else None
#         changes = {}
#         old_status = instance.status

#         for attr, value in validated_data.items():
#             old_value = getattr(instance, attr)
#             if old_value != value:
#                 changes[attr] = {"old": old_value, "new": value}
#                 setattr(instance, attr, value)

#         instance.save()

#         # Record history only if something changed
#         if changes:
#             TransactionLogHistory.objects.create(
#                 transaction_log=instance,
#                 action="status_change" if "status" in changes else "update",
#                 old_status=old_status,
#                 new_status=instance.status,
#                 performed_by=user,
#                 changes=changes,
#             )

#         return instance


# class TransactionLogHistorySerializer(serializers.ModelSerializer):
#     performed_by_name = serializers.SerializerMethodField()

#     class Meta:
#         model = TransactionLogHistory
#         fields = [
#             "id",
#             "action",
#             "old_status",
#             "new_status",
#             "changes",
#             "performed_by_name",
#             "notes",
#             "timestamp",
#         ]

#     def get_performed_by_name(self, obj):
#         if obj.performed_by:
#             return obj.performed_by.get_full_name() or obj.performed_by.username
#         return "System"


# class TransactionLogFilterSerializer(serializers.Serializer):
#     """Serializer for transaction log filtering"""
#     start_date = serializers.DateField(required=False)
#     end_date = serializers.DateField(required=False)
#     status = serializers.CharField(required=False, default='all')
#     payment_method = serializers.CharField(required=False)
#     search = serializers.CharField(required=False)
#     sort_by = serializers.CharField(required=False, default='date_desc')
#     page = serializers.IntegerField(required=False, default=1)
#     page_size = serializers.IntegerField(required=False, default=20)


# class TransactionLogStatsSerializer(serializers.Serializer):
#     """Serializer for transaction statistics"""
#     total = serializers.IntegerField()
#     success = serializers.IntegerField()
#     pending = serializers.IntegerField()
#     failed = serializers.IntegerField()
#     total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)










from rest_framework import serializers
from django.contrib.auth import get_user_model
from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory

User = get_user_model()


class TransactionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(read_only=True)
    phone = serializers.SerializerMethodField()
    transaction_date = serializers.DateTimeField(source="created_at", read_only=True)
    subscription_plan = serializers.SerializerMethodField()

    class Meta:
        model = TransactionLog
        fields = [
            "id",
            "transaction_id",
            "user_name",
            "phone",
            "amount",
            "status",
            "payment_method",
            "reference_number",
            "description",
            "metadata",
            "transaction_date",
            "created_at",
            "updated_at",
            "subscription_plan",
        ]
        read_only_fields = ["transaction_id", "created_at", "updated_at", "user_name"]

    def get_phone(self, obj):
        return obj.formatted_phone

    def get_subscription_plan(self, obj):
        """Get subscription plan name from metadata"""
        return obj.metadata.get('plan_name', 'N/A')

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["userName"] = rep.pop("user_name")
        rep["transactionId"] = rep.pop("transaction_id")
        rep["date"] = rep.pop("transaction_date")
        rep["subscriptionPlan"] = rep.pop("subscription_plan")
        return rep

    def create(self, validated_data):
        """
        Create a new transaction log and store history entry.
        """
        user = self.context["request"].user if "request" in self.context else None
        transaction_log = TransactionLog.objects.create(**validated_data)

        # Log creation
        TransactionLogHistory.objects.create(
            transaction_log=transaction_log,
            action="create",
            new_status=transaction_log.status,
            performed_by=user,
            changes={"created": True},
        )
        return transaction_log

    def update(self, instance, validated_data):
        """
        Update a transaction log and record changes in history.
        """
        user = self.context["request"].user if "request" in self.context else None
        changes = {}
        old_status = instance.status

        for attr, value in validated_data.items():
            old_value = getattr(instance, attr)
            if old_value != value:
                changes[attr] = {"old": old_value, "new": value}
                setattr(instance, attr, value)

        instance.save()

        # Record history only if something changed
        if changes:
            TransactionLogHistory.objects.create(
                transaction_log=instance,
                action="status_change" if "status" in changes else "update",
                old_status=old_status,
                new_status=instance.status,
                performed_by=user,
                changes=changes,
            )

        return instance


class TransactionLogHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TransactionLogHistory
        fields = [
            "id",
            "action",
            "old_status",
            "new_status",
            "changes",
            "performed_by_name",
            "notes",
            "timestamp",
        ]

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return "System"


class TransactionLogFilterSerializer(serializers.Serializer):
    """Serializer for transaction log filtering"""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    status = serializers.CharField(required=False, default='all')
    payment_method = serializers.CharField(required=False)
    search = serializers.CharField(required=False)
    sort_by = serializers.CharField(required=False, default='date_desc')
    page = serializers.IntegerField(required=False, default=1)
    page_size = serializers.IntegerField(required=False, default=20)


class TransactionLogStatsSerializer(serializers.Serializer):
    """Serializer for transaction statistics"""
    total = serializers.IntegerField()
    success = serializers.IntegerField()
    pending = serializers.IntegerField()
    failed = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)