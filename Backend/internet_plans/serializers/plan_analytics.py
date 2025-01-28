from rest_framework import serializers
from internet_plans.models.plan_analytics import PlanAnalytics, UserFeedback

class UserFeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for UserFeedback model to convert model instance to JSON.
    """
    class Meta:
        model = UserFeedback
        fields = ['positive', 'neutral', 'negative']

class PlanAnalyticsSerializer(serializers.ModelSerializer):
    """
    Serializer for PlanAnalytics model, including nested UserFeedback:
    
    - Customizes the representation of user feedback for frontend compatibility.
    """
    user_feedback = UserFeedbackSerializer(many=False, read_only=True)

    class Meta:
        model = PlanAnalytics
        fields = ['plan_name', 'sales', 'active_users', 'bandwidth_usage', 'uptime', 'user_feedback']

    def to_representation(self, instance):
        """
        Custom method to format UserFeedback in a dictionary for frontend consumption.
        """
        ret = super().to_representation(instance)
        feedback = UserFeedback.objects.filter(plan=instance).first()
        if feedback:
            ret['user_feedback'] = {
                'Positive': feedback.positive,
                'Neutral': feedback.neutral,
                'Negative': feedback.negative
            }
        return ret