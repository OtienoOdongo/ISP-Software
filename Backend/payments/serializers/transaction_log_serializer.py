

# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory

# User = get_user_model()


# class TransactionLogSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(read_only=True)
#     phone = serializers.SerializerMethodField()
#     transaction_date = serializers.DateTimeField(source="created_at", read_only=True)
#     subscription_plan = serializers.SerializerMethodField()

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
#             "subscription_plan",
#         ]
#         read_only_fields = ["transaction_id", "created_at", "updated_at", "user_name"]

#     def get_phone(self, obj):
#         return obj.formatted_phone

#     def get_subscription_plan(self, obj):
#         """Get subscription plan name from metadata"""
#         return obj.metadata.get('plan_name', 'N/A')

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep["userName"] = rep.pop("user_name")
#         rep["transactionId"] = rep.pop("transaction_id")
#         rep["date"] = rep.pop("transaction_date")
#         rep["subscriptionPlan"] = rep.pop("subscription_plan")
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









# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory

# User = get_user_model()


# class TransactionLogSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(read_only=True)
#     phone = serializers.SerializerMethodField()
#     transaction_date = serializers.DateTimeField(source="created_at", read_only=True)
#     subscription_plan = serializers.SerializerMethodField()
#     access_type_display = serializers.CharField(read_only=True)
#     plan_name = serializers.CharField(read_only=True)
#     access_type = serializers.ChoiceField(choices=TransactionLog.ACCESS_TYPES, required=False)

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
#             "subscription_plan",
#             "access_type",
#             "access_type_display",
#             "plan_name",
#             "subscription",
#             "internet_plan",
#             "client",
#         ]
#         read_only_fields = [
#             "transaction_id", "created_at", "updated_at", "user_name",
#             "access_type_display", "plan_name"
#         ]

#     def get_phone(self, obj):
#         return obj.formatted_phone

#     def get_subscription_plan(self, obj):
#         """Get subscription plan name"""
#         return obj.plan_name

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep["userName"] = rep.pop("user_name")
#         rep["transactionId"] = rep.pop("transaction_id")
#         rep["date"] = rep.pop("transaction_date")
#         rep["subscriptionPlan"] = rep.pop("subscription_plan")
#         rep["accessType"] = rep.pop("access_type")
#         rep["accessTypeDisplay"] = rep.pop("access_type_display")
#         rep["planName"] = rep.pop("plan_name")
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
#             new_access_type=transaction_log.access_type,
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
#         old_access_type = instance.access_type

#         for attr, value in validated_data.items():
#             old_value = getattr(instance, attr)
#             if old_value != value:
#                 changes[attr] = {"old": old_value, "new": value}
#                 setattr(instance, attr, value)

#         instance.save()

#         # Record history only if something changed
#         if changes:
#             action_type = "status_change" if "status" in changes else "update"
#             if "access_type" in changes:
#                 action_type = "update"  # Access type change is also an update
            
#             TransactionLogHistory.objects.create(
#                 transaction_log=instance,
#                 action=action_type,
#                 old_status=old_status,
#                 new_status=instance.status,
#                 old_access_type=old_access_type,
#                 new_access_type=instance.access_type,
#                 performed_by=user,
#                 changes=changes,
#             )

#         return instance


# class TransactionLogHistorySerializer(serializers.ModelSerializer):
#     performed_by_name = serializers.SerializerMethodField()
#     access_type_changed = serializers.SerializerMethodField()

#     class Meta:
#         model = TransactionLogHistory
#         fields = [
#             "id",
#             "action",
#             "old_status",
#             "new_status",
#             "old_access_type",
#             "new_access_type",
#             "access_type_changed",
#             "changes",
#             "performed_by_name",
#             "notes",
#             "timestamp",
#         ]

#     def get_performed_by_name(self, obj):
#         if obj.performed_by:
#             return obj.performed_by.get_full_name() or obj.performed_by.username
#         return "System"

#     def get_access_type_changed(self, obj):
#         return obj.old_access_type != obj.new_access_type


# class TransactionLogFilterSerializer(serializers.Serializer):
#     """Serializer for transaction log filtering"""
#     start_date = serializers.DateField(required=False)
#     end_date = serializers.DateField(required=False)
#     status = serializers.CharField(required=False, default='all')
#     payment_method = serializers.CharField(required=False)
#     access_type = serializers.CharField(required=False)
#     plan_id = serializers.IntegerField(required=False)
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
#     by_access_type = serializers.DictField()


# class AccessTypeComparisonSerializer(serializers.Serializer):
#     """Serializer for access type comparison statistics"""
#     hotspot = serializers.DictField()
#     pppoe = serializers.DictField()
#     both = serializers.DictField()
#     comparison = serializers.DictField()










from rest_framework import serializers
from django.contrib.auth import get_user_model
from payments.models.transaction_log_model import TransactionLog, TransactionLogHistory

User = get_user_model()


class TransactionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(read_only=True)
    phone = serializers.SerializerMethodField()
    transaction_date = serializers.DateTimeField(source="created_at", read_only=True)
    subscription_plan = serializers.SerializerMethodField()
    access_type_display = serializers.CharField(read_only=True)
    plan_name = serializers.CharField(read_only=True)
    access_type = serializers.ChoiceField(choices=TransactionLog.ACCESS_TYPES, required=False)
    payment_gateway_details = serializers.SerializerMethodField()

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
            "access_type",
            "access_type_display",
            "plan_name",
            "subscription",
            "internet_plan",
            "client",
            "payment_gateway_details",
            "payment_transaction",
        ]
        read_only_fields = [
            "transaction_id", "created_at", "updated_at", "user_name",
            "access_type_display", "plan_name", "payment_gateway_details"
        ]

    def get_phone(self, obj):
        return obj.formatted_phone

    def get_subscription_plan(self, obj):
        """Get subscription plan name"""
        return obj.plan_name

    def get_payment_gateway_details(self, obj):
        """Get payment gateway details if available"""
        if obj.payment_transaction and obj.payment_transaction.gateway:
            return {
                "gateway_name": obj.payment_transaction.gateway.get_name_display(),
                "gateway_id": str(obj.payment_transaction.gateway.id),
                "security_level": obj.payment_transaction.gateway.security_level
            }
        return None

    def get_fields(self):
        """Dynamically adjust fields based on context"""
        fields = super().get_fields()
        
        # If creating from payment context, make some fields read-only
        if self.context.get('from_payment'):
            for field in ['status', 'amount', 'payment_method', 'client']:
                if field in fields:
                    fields[field].read_only = True
        
        return fields

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["userName"] = rep.pop("user_name")
        rep["transactionId"] = rep.pop("transaction_id")
        rep["date"] = rep.pop("transaction_date")
        rep["subscriptionPlan"] = rep.pop("subscription_plan")
        rep["accessType"] = rep.pop("access_type")
        rep["accessTypeDisplay"] = rep.pop("access_type_display")
        rep["planName"] = rep.pop("plan_name")
        rep["paymentGatewayDetails"] = rep.pop("payment_gateway_details")
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
            new_access_type=transaction_log.access_type,
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
        old_access_type = instance.access_type

        for attr, value in validated_data.items():
            old_value = getattr(instance, attr)
            if old_value != value:
                changes[attr] = {"old": old_value, "new": value}
                setattr(instance, attr, value)

        instance.save()

        # Record history only if something changed
        if changes:
            action_type = "status_change" if "status" in changes else "update"
            if "access_type" in changes:
                action_type = "update"  # Access type change is also an update
            
            TransactionLogHistory.objects.create(
                transaction_log=instance,
                action=action_type,
                old_status=old_status,
                new_status=instance.status,
                old_access_type=old_access_type,
                new_access_type=instance.access_type,
                performed_by=user,
                changes=changes,
            )

        return instance


class TransactionLogHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()
    access_type_changed = serializers.SerializerMethodField()
    status_changed = serializers.SerializerMethodField()

    class Meta:
        model = TransactionLogHistory
        fields = [
            "id",
            "action",
            "old_status",
            "new_status",
            "old_access_type",
            "new_access_type",
            "access_type_changed",
            "status_changed",
            "changes",
            "performed_by_name",
            "notes",
            "timestamp",
        ]

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return "System"

    def get_access_type_changed(self, obj):
        return obj.old_access_type != obj.new_access_type

    def get_status_changed(self, obj):
        return obj.old_status != obj.new_status


class TransactionLogFilterSerializer(serializers.Serializer):
    """Serializer for transaction log filtering"""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    status = serializers.CharField(required=False, default='all')
    payment_method = serializers.CharField(required=False)
    access_type = serializers.CharField(required=False)
    plan_id = serializers.IntegerField(required=False)
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
    by_access_type = serializers.DictField()
    by_payment_method = serializers.DictField()


class AccessTypeComparisonSerializer(serializers.Serializer):
    """Serializer for access type comparison statistics"""
    hotspot = serializers.DictField()
    pppoe = serializers.DictField()
    both = serializers.DictField()
    comparison = serializers.DictField()