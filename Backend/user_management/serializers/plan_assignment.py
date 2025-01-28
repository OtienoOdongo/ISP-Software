from rest_framework import serializers
from user_management.models.plan_assignment import Plan
from user_management.models.plan_assignment import UserPlan


class PlanSerializer(serializers.ModelSerializer):
    """
    Serializer for the Plan model. Converts model instance data to native Python datatypes for JSON responses.

    Attributes:
        Meta.model (Plan): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    class Meta:
        model = Plan
        fields = ['id', 'name', 'validity', 'data', 'price']


class UserPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserPlan model. Includes nested serialization of the Plan.

    Attributes:
        Meta.model (UserPlan): The model class to serialize.
        Meta.fields (list): List of fields to include in serialization.
    """
    plan = PlanSerializer()

    class Meta:
        model = UserPlan
        fields = ['id', 'user', 'plan', 'assigned_date', 'device_mac_address',
                   'payment_status', 'transaction_id']