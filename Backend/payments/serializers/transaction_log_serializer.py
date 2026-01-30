

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
#     payment_gateway_details = serializers.SerializerMethodField()

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
#             "payment_gateway_details",
#             "payment_transaction",
#         ]
#         read_only_fields = [
#             "transaction_id", "created_at", "updated_at", "user_name",
#             "access_type_display", "plan_name", "payment_gateway_details"
#         ]

#     def get_phone(self, obj):
#         return obj.formatted_phone

#     def get_subscription_plan(self, obj):
#         """Get subscription plan name"""
#         return obj.plan_name

#     def get_payment_gateway_details(self, obj):
#         """Get payment gateway details if available"""
#         if obj.payment_transaction and obj.payment_transaction.gateway:
#             return {
#                 "gateway_name": obj.payment_transaction.gateway.get_name_display(),
#                 "gateway_id": str(obj.payment_transaction.gateway.id),
#                 "security_level": obj.payment_transaction.gateway.security_level
#             }
#         return None

#     def get_fields(self):
#         """Dynamically adjust fields based on context"""
#         fields = super().get_fields()
        
#         # If creating from payment context, make some fields read-only
#         if self.context.get('from_payment'):
#             for field in ['status', 'amount', 'payment_method', 'client']:
#                 if field in fields:
#                     fields[field].read_only = True
        
#         return fields

#     def to_representation(self, instance):
#         rep = super().to_representation(instance)
#         rep["userName"] = rep.pop("user_name")
#         rep["transactionId"] = rep.pop("transaction_id")
#         rep["date"] = rep.pop("transaction_date")
#         rep["subscriptionPlan"] = rep.pop("subscription_plan")
#         rep["accessType"] = rep.pop("access_type")
#         rep["accessTypeDisplay"] = rep.pop("access_type_display")
#         rep["planName"] = rep.pop("plan_name")
#         rep["paymentGatewayDetails"] = rep.pop("payment_gateway_details")
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
#     status_changed = serializers.SerializerMethodField()

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
#             "status_changed",
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

#     def get_status_changed(self, obj):
#         return obj.old_status != obj.new_status


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
#     by_payment_method = serializers.DictField()


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
    """Serializer for TransactionLog model - for client transactions only"""
    
    # Display fields
    client_display_name = serializers.CharField(read_only=True, source='client_display_name')
    client_username = serializers.CharField(read_only=True, source='client_username')
    client_connection_type = serializers.CharField(read_only=True, source='client_connection_type')
    client_connection_type_display = serializers.CharField(read_only=True, source='client_connection_type_display')
    formatted_phone = serializers.SerializerMethodField(read_only=True)
    transaction_date = serializers.DateTimeField(source="created_at", read_only=True)
    plan_name = serializers.CharField(read_only=True, source='plan_name')
    access_type_display = serializers.CharField(read_only=True, source='access_type_display')
    status_display = serializers.CharField(read_only=True, source='status_display')
    payment_method_display = serializers.CharField(read_only=True, source='payment_method_display')
    payment_gateway_details = serializers.SerializerMethodField()
    
    # Client-specific fields
    is_pppoe_client = serializers.BooleanField(read_only=True, source='is_pppoe_client')
    is_hotspot_client = serializers.BooleanField(read_only=True, source='is_hotspot_client')
    client_pppoe_username = serializers.CharField(read_only=True, source='client_pppoe_username')
    
    # Editable fields
    access_type = serializers.ChoiceField(choices=TransactionLog.ACCESS_TYPES, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = TransactionLog
        fields = [
            "id",
            "transaction_id",
            "client_display_name",
            "client_username",
            "client_connection_type",
            "client_connection_type_display",
            "formatted_phone",
            "amount",
            "status",
            "status_display",
            "payment_method",
            "payment_method_display",
            "reference_number",
            "description",
            "metadata",
            "transaction_date",
            "created_at",
            "updated_at",
            "plan_name",
            "access_type",
            "access_type_display",
            "subscription",
            "internet_plan",
            "client",
            "payment_gateway_details",
            "payment_transaction",
            "is_pppoe_client",
            "is_hotspot_client",
            "client_pppoe_username",
            "phone_number",
        ]
        read_only_fields = [
            "id", "transaction_id", "created_at", "updated_at",
            "client_display_name", "client_username", "client_connection_type",
            "client_connection_type_display", "formatted_phone", "plan_name",
            "access_type_display", "status_display", "payment_method_display",
            "payment_gateway_details", "is_pppoe_client", "is_hotspot_client",
            "client_pppoe_username"
        ]
    
    def get_formatted_phone(self, obj):
        """Get formatted phone number for display"""
        return obj.formatted_phone
    
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
            for field in ['status', 'amount', 'payment_method', 'client', 'access_type']:
                if field in fields:
                    fields[field].read_only = True
        
        # For admin users, allow more fields to be editable
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.user_type in ['staff', 'admin']:
                # Admin can edit description and phone number
                fields['description'].read_only = False
                fields['phone_number'].read_only = False
                fields['access_type'].read_only = False
                fields['status'].read_only = False
        
        return fields
    
    def validate_client(self, value):
        """Validate that client is actually a client user"""
        if value.user_type != 'client':
            raise serializers.ValidationError("Only client users can have transaction logs")
        return value
    
    def validate_access_type(self, value):
        """Validate access type based on client's connection type"""
        client = self.initial_data.get('client') or self.instance.client if self.instance else None
        
        if client and value:
            if client.connection_type == 'hotspot' and value not in ['hotspot', 'both']:
                raise serializers.ValidationError(
                    f"Hotspot client cannot have {value} access type"
                )
            elif client.connection_type == 'pppoe' and value not in ['pppoe', 'both']:
                raise serializers.ValidationError(
                    f"PPPoE client cannot have {value} access type"
                )
        
        return value
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        if value:
            # Import phone validation utility
            try:
                from authentication.models import PhoneValidation
                if not PhoneValidation.is_valid_kenyan_phone(value):
                    raise serializers.ValidationError("Invalid phone number format")
            except ImportError:
                # Basic validation
                import re
                clean_number = re.sub(r'[^\d+]', '', value)
                patterns = [
                    r'^\+2547\d{8}$',
                    r'^\+2541\d{8}$',
                    r'^07\d{8}$',
                    r'^01\d{8}$',
                ]
                if not any(re.match(pattern, clean_number) for pattern in patterns):
                    raise serializers.ValidationError("Invalid phone number format")
        
        return value
    
    def to_representation(self, instance):
        """Custom representation with camelCase for frontend"""
        rep = super().to_representation(instance)
        
        # Convert to camelCase for frontend
        camel_case_mapping = {
            'transaction_id': 'transactionId',
            'client_display_name': 'clientDisplayName',
            'client_username': 'clientUsername',
            'client_connection_type': 'clientConnectionType',
            'client_connection_type_display': 'clientConnectionTypeDisplay',
            'formatted_phone': 'formattedPhone',
            'status_display': 'statusDisplay',
            'payment_method_display': 'paymentMethodDisplay',
            'transaction_date': 'transactionDate',
            'plan_name': 'planName',
            'access_type_display': 'accessTypeDisplay',
            'payment_gateway_details': 'paymentGatewayDetails',
            'is_pppoe_client': 'isPppoeClient',
            'is_hotspot_client': 'isHotspotClient',
            'client_pppoe_username': 'clientPppoeUsername',
            'reference_number': 'referenceNumber',
            'created_at': 'createdAt',
            'updated_at': 'updatedAt',
            'access_type': 'accessType',
            'payment_method': 'paymentMethod',
            'internet_plan': 'internetPlan',
            'payment_transaction': 'paymentTransaction',
        }
        
        # Apply camelCase conversion
        for old_key, new_key in camel_case_mapping.items():
            if old_key in rep:
                rep[new_key] = rep.pop(old_key)
        
        return rep
    
    def create(self, validated_data):
        """
        Create a new transaction log and store history entry.
        """
        user = self.context.get("request").user if "request" in self.context else None
        
        # Auto-generate description if not provided
        if 'description' not in validated_data or not validated_data['description']:
            client = validated_data.get('client')
            if client:
                if client.is_pppoe_client:
                    validated_data['description'] = f"Transaction for PPPoE client {client.name or client.username}"
                else:
                    validated_data['description'] = f"Transaction for Hotspot client {client.username}"
        
        transaction_log = TransactionLog.objects.create(**validated_data)
        
        # Log creation
        TransactionLogHistory.objects.create(
            transaction_log=transaction_log,
            action="create",
            new_status=transaction_log.status,
            new_access_type=transaction_log.access_type,
            performed_by=user,
            changes={"created": True},
            notes=f"Transaction log created for {transaction_log.client_display_name}"
        )
        
        return transaction_log
    
    def update(self, instance, validated_data):
        """
        Update a transaction log and record changes in history.
        """
        user = self.context.get("request").user if "request" in self.context else None
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
            
            TransactionLogHistory.objects.create(
                transaction_log=instance,
                action=action_type,
                old_status=old_status,
                new_status=instance.status,
                old_access_type=old_access_type,
                new_access_type=instance.access_type,
                performed_by=user,
                changes=changes,
                notes=f"Transaction log updated by {user.email if user else 'System'}"
            )
        
        return instance


class TransactionLogHistorySerializer(serializers.ModelSerializer):
    """Serializer for TransactionLogHistory"""
    performed_by_display = serializers.CharField(source='performed_by_display', read_only=True)
    access_type_changed = serializers.SerializerMethodField()
    status_changed = serializers.SerializerMethodField()
    transaction_id = serializers.CharField(source='transaction_log.transaction_id', read_only=True)
    client_display_name = serializers.CharField(source='transaction_log.client_display_name', read_only=True)

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
            "performed_by_display",
            "transaction_id",
            "client_display_name",
            "notes",
            "timestamp",
        ]
        read_only_fields = all_fields = [
            "id", "action", "old_status", "new_status", "old_access_type", 
            "new_access_type", "access_type_changed", "status_changed", 
            "changes", "performed_by_display", "transaction_id", 
            "client_display_name", "notes", "timestamp"
        ]
    
    def get_access_type_changed(self, obj):
        return obj.old_access_type != obj.new_access_type
    
    def get_status_changed(self, obj):
        return obj.old_status != obj.new_status
    
    def to_representation(self, instance):
        """Custom representation with camelCase for frontend"""
        rep = super().to_representation(instance)
        
        # Convert to camelCase for frontend
        camel_case_mapping = {
            'performed_by_display': 'performedByDisplay',
            'access_type_changed': 'accessTypeChanged',
            'status_changed': 'statusChanged',
            'transaction_id': 'transactionId',
            'client_display_name': 'clientDisplayName',
            'old_status': 'oldStatus',
            'new_status': 'newStatus',
            'old_access_type': 'oldAccessType',
            'new_access_type': 'newAccessType',
        }
        
        # Apply camelCase conversion
        for old_key, new_key in camel_case_mapping.items():
            if old_key in rep:
                rep[new_key] = rep.pop(old_key)
        
        return rep


class TransactionLogFilterSerializer(serializers.Serializer):
    """Serializer for transaction log filtering"""
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    status = serializers.CharField(required=False, default='all')
    payment_method = serializers.CharField(required=False)
    access_type = serializers.CharField(required=False)
    client_type = serializers.ChoiceField(
        choices=[('all', 'All'), ('hotspot', 'Hotspot'), ('pppoe', 'PPPoE')],
        required=False,
        default='all'
    )
    plan_id = serializers.IntegerField(required=False)
    search = serializers.CharField(required=False)
    sort_by = serializers.ChoiceField(
        choices=[
            ('date_desc', 'Date Descending'),
            ('date_asc', 'Date Ascending'),
            ('amount_desc', 'Amount Descending'),
            ('amount_asc', 'Amount Ascending'),
        ],
        required=False,
        default='date_desc'
    )
    page = serializers.IntegerField(required=False, default=1)
    page_size = serializers.IntegerField(required=False, default=20)


class TransactionLogStatsSerializer(serializers.Serializer):
    """Serializer for transaction statistics"""
    total = serializers.IntegerField()
    success = serializers.IntegerField()
    pending = serializers.IntegerField()
    failed = serializers.IntegerField()
    refunded = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    by_access_type = serializers.DictField()
    by_payment_method = serializers.DictField()
    by_client_type = serializers.DictField()  # Hotspot vs PPPoE


class AccessTypeComparisonSerializer(serializers.Serializer):
    """Serializer for access type comparison statistics"""
    hotspot = serializers.DictField()
    pppoe = serializers.DictField()
    both = serializers.DictField()
    comparison = serializers.DictField()


class ClientTransactionSummarySerializer(serializers.Serializer):
    """Serializer for client transaction summary"""
    client_id = serializers.UUIDField()
    client_display_name = serializers.CharField()
    client_username = serializers.CharField()
    client_connection_type = serializers.CharField()
    total_transactions = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    last_transaction_date = serializers.DateTimeField()
    active_subscription = serializers.BooleanField()