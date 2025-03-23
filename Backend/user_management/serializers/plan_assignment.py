from rest_framework import serializers
from user_management.models.plan_assignment import Plan, UserPlan

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'validity', 'data', 'price']

class UserPlanSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = UserPlan
        fields = ['id', 'user', 'plan', 'assigned_date', 'device_mac_address', 'payment_status', 'transaction_id']