# """
# Business Logic Serializers - No Authentication Logic
# Production-ready with comprehensive serialization
# """
# from rest_framework import serializers
# from django.utils import timezone
# from django.db.models import Sum, Avg, Count, F, Q
# import logging
# from decimal import Decimal
# from datetime import datetime, timedelta

# from user_management.models.client_model import (
#     ClientProfile, ClientAnalyticsSnapshot,
#     CommissionTransaction, ClientInteraction
# )

# logger = logging.getLogger(__name__)


# class BaseSerializer(serializers.ModelSerializer):
#     """Base serializer with common functionality"""
    
#     def to_representation(self, instance):
#         """Add metadata to all serialized data"""
#         representation = super().to_representation(instance)
#         representation['_meta'] = {
#             'serializer': self.__class__.__name__,
#             'timestamp': timezone.now().isoformat(),
#             'version': '2.0.0'
#         }
#         return representation


# class ClientProfileSerializer(BaseSerializer):
#     """
#     Comprehensive client profile serializer with business insights
#     Production-ready with all fields needed for admin dashboard
#     """
    
#     # Basic Information from Authentication app
#     username = serializers.CharField(source='user.username', read_only=True)
#     phone_number = serializers.CharField(source='user.phone_number', read_only=True)
#     phone_display = serializers.SerializerMethodField()
#     is_active = serializers.BooleanField(source='user.is_active', read_only=True)
#     connection_type = serializers.CharField(source='user.connection_type', read_only=True)
#     is_pppoe_client = serializers.BooleanField(source='user.is_pppoe_client', read_only=True)
#     is_hotspot_client = serializers.BooleanField(source='user.is_hotspot_client', read_only=True)
#     client_name = serializers.CharField(source='user.name', read_only=True)
    
#     # PPPoE Credentials (only for admin view)
#     pppoe_username = serializers.SerializerMethodField()
#     pppoe_password = serializers.SerializerMethodField()
    
#     # Financial Information
#     lifetime_value_formatted = serializers.SerializerMethodField()
#     monthly_revenue_formatted = serializers.SerializerMethodField()
#     avg_monthly_spend_formatted = serializers.SerializerMethodField()
#     commission_balance_formatted = serializers.SerializerMethodField()
#     total_commission_formatted = serializers.SerializerMethodField()
    
#     # Usage Information
#     total_data_used_formatted = serializers.SerializerMethodField()
#     avg_monthly_data_formatted = serializers.SerializerMethodField()
    
#     # Classification & Tags
#     is_high_value = serializers.BooleanField(read_only=True)
#     is_frequent_user = serializers.BooleanField(read_only=True)
#     is_at_risk = serializers.BooleanField(read_only=True)
#     is_hotspot_abandoner = serializers.BooleanField(read_only=True)
#     needs_attention = serializers.SerializerMethodField()
#     risk_level = serializers.SerializerMethodField()
    
#     # Referral Information
#     referral_link = serializers.CharField(read_only=True)
#     referred_by_name = serializers.SerializerMethodField()
#     referral_count = serializers.SerializerMethodField()
    
#     # Timestamps
#     customer_since_formatted = serializers.SerializerMethodField()
#     days_active = serializers.IntegerField(read_only=True)
#     days_since_last_payment = serializers.IntegerField(read_only=True)
#     last_login_formatted = serializers.SerializerMethodField()
#     last_payment_formatted = serializers.SerializerMethodField()
    
#     # Dashboard Stats
#     quick_stats = serializers.SerializerMethodField()
#     recent_interactions = serializers.SerializerMethodField()
#     commission_history = serializers.SerializerMethodField()
    
#     # Actions available for this client
#     available_actions = serializers.SerializerMethodField()
    
#     class Meta:
#         model = ClientProfile
#         fields = [
#             # Basic Info from Authentication
#             'id', 'username', 'phone_number', 'phone_display', 'is_active',
#             'connection_type', 'is_pppoe_client', 'is_hotspot_client', 'client_name',
            
#             # PPPoE Credentials (admin only)
#             'pppoe_username', 'pppoe_password',
            
#             # Profile Info
#             'client_type', 'status', 'tier',
#             'referral_code', 'referred_by', 'referred_by_name',
#             'is_marketer', 'marketer_tier',
            
#             # Financial Details
#             'lifetime_value', 'lifetime_value_formatted',
#             'monthly_recurring_revenue', 'monthly_revenue_formatted',
#             'total_revenue', 'avg_monthly_spend', 'avg_monthly_spend_formatted',
#             'commission_rate', 'commission_balance', 'commission_balance_formatted',
#             'total_commission_earned', 'total_commission_formatted',
            
#             # Usage Details
#             'total_data_used_gb', 'total_data_used_formatted',
#             'avg_monthly_data_gb', 'avg_monthly_data_formatted',
#             'peak_usage_hour',
            
#             # Hotspot Specific
#             'hotspot_sessions', 'hotspot_conversion_rate',
#             'payment_abandonment_rate',
            
#             # Behavioral Metrics
#             'churn_risk_score', 'engagement_score', 'satisfaction_score',
#             'renewal_rate', 'days_since_last_payment',
#             'is_high_value', 'is_frequent_user', 'is_at_risk',
#             'is_hotspot_abandoner', 'needs_attention', 'risk_level',
            
#             # Classification
#             'behavior_tags', 'revenue_segment', 'usage_pattern',
            
#             # Preferences
#             'preferred_payment_method', 'notification_preferences',
#             'communication_preferences',
            
#             # Insights
#             'insights', 'recommendations', 'next_best_offer',
            
#             # Referral
#             'referral_link', 'referral_count',
            
#             # Timestamps
#             'customer_since', 'customer_since_formatted',
#             'last_payment_date', 'last_payment_formatted',
#             'last_usage_date', 'last_login_date', 'last_login_formatted',
#             'next_payment_due', 'tier_upgraded_at',
#             'days_active', 'days_since_last_payment',
#             'created_at', 'updated_at',
            
#             # Device Info
#             'primary_device', 'devices_count', 'location',
            
#             # Dashboard Data
#             'quick_stats', 'recent_interactions', 'commission_history',
            
#             # Actions
#             'available_actions',
            
#             # Metadata
#             'metadata', 'flags'
#         ]
#         read_only_fields = [
#             'created_at', 'updated_at', 'lifetime_value',
#             'total_revenue', 'commission_balance', 'total_commission_earned',
#             'total_data_used_gb', 'avg_monthly_data_gb',
#             'churn_risk_score', 'engagement_score', 'satisfaction_score',
#             'behavior_tags', 'insights', 'recommendations', 'next_best_offer',
#             'flags', 'referral_code'
#         ]
    
#     def get_phone_display(self, obj):
#         """Get phone in local display format"""
#         from authentication.models import PhoneValidation
#         return PhoneValidation.get_phone_display(obj.phone_number)
    
#     def get_pppoe_username(self, obj):
#         """Get PPPoE username if client is PPPoE"""
#         if obj.is_pppoe_client and hasattr(obj.user, 'pppoe_username'):
#             return obj.user.pppoe_username
#         return None
    
#     def get_pppoe_password(self, obj):
#         """Get PPPoE password (only for authenticated admin requests)"""
#         request = self.context.get('request')
        
#         # Only show password to authenticated users for PPPoE clients
#         if (request and request.user.is_authenticated and 
#             obj.is_pppoe_client and hasattr(obj.user, 'get_pppoe_password_decrypted')):
            
#             # Check if user is admin/staff
#             if hasattr(request.user, 'user_type'):
#                 if request.user.user_type in ['admin', 'staff']:
#                     return obj.user.get_pppoe_password_decrypted()
            
#             # Check if user is superuser
#             if request.user.is_superuser:
#                 return obj.user.get_pppoe_password_decrypted()
        
#         return None
    
#     def get_lifetime_value_formatted(self, obj):
#         return f"KES {obj.lifetime_value:,.2f}"
    
#     def get_monthly_revenue_formatted(self, obj):
#         return f"KES {obj.monthly_recurring_revenue:,.2f}"
    
#     def get_avg_monthly_spend_formatted(self, obj):
#         return f"KES {obj.avg_monthly_spend:,.2f}"
    
#     def get_commission_balance_formatted(self, obj):
#         return f"KES {obj.commission_balance:,.2f}"
    
#     def get_total_commission_formatted(self, obj):
#         return f"KES {obj.total_commission_earned:,.2f}"
    
#     def get_total_data_used_formatted(self, obj):
#         return f"{obj.total_data_used_gb:.1f} GB"
    
#     def get_avg_monthly_data_formatted(self, obj):
#         return f"{obj.avg_monthly_data_gb:.1f} GB"
    
#     def get_referred_by_name(self, obj):
#         if obj.referred_by and obj.referred_by.user:
#             return obj.referred_by.user.username
#         return None
    
#     def get_referral_count(self, obj):
#         """Get number of successful referrals"""
#         return ClientProfile.objects.filter(referred_by=obj).count()
    
#     def get_customer_since_formatted(self, obj):
#         return obj.customer_since.strftime('%b %d, %Y')
    
#     def get_last_login_formatted(self, obj):
#         if obj.last_login_date:
#             return obj.last_login_date.strftime('%b %d, %Y %I:%M %p')
#         return 'Never'
    
#     def get_last_payment_formatted(self, obj):
#         if obj.last_payment_date:
#             return obj.last_payment_date.strftime('%b %d, %Y')
#         return 'No payments'
    
#     def get_needs_attention(self, obj):
#         """Calculate if client needs attention"""
#         return (obj.is_at_risk or 
#                 obj.days_since_last_payment > 7 or 
#                 'payment_failed' in obj.flags)
    
#     def get_risk_level(self, obj):
#         """Get human-readable risk level"""
#         if obj.churn_risk_score >= Decimal('7.0'):
#             return 'High'
#         elif obj.churn_risk_score >= Decimal('4.0'):
#             return 'Medium'
#         else:
#             return 'Low'
    
#     def get_quick_stats(self, obj):
#         """Get quick stats for dashboard display"""
#         from datetime import date
        
#         # Calculate days since last activity
#         days_since_activity = 0
#         if obj.last_login_date:
#             days_since_activity = (date.today() - obj.last_login_date.date()).days
        
#         # Get recent interactions count
#         recent_interactions_count = ClientInteraction.objects.filter(
#             client=obj,
#             started_at__gte=timezone.now() - timedelta(days=7)
#         ).count()
        
#         return {
#             'days_since_activity': days_since_activity,
#             'recent_interactions': recent_interactions_count,
#             'data_usage_trend': self._get_data_usage_trend(obj),
#             'payment_consistency': self._get_payment_consistency(obj),
#             'engagement_trend': self._get_engagement_trend(obj)
#         }
    
#     def get_recent_interactions(self, obj):
#         """Get recent client interactions"""
#         interactions = ClientInteraction.objects.filter(
#             client=obj
#         ).order_by('-started_at')[:5]
        
#         return ClientInteractionSerializer(interactions, many=True).data
    
#     def get_commission_history(self, obj):
#         """Get commission history for marketers"""
#         if not obj.is_marketer:
#             return []
        
#         transactions = CommissionTransaction.objects.filter(
#             marketer=obj
#         ).order_by('-transaction_date')[:5]
        
#         return CommissionTransactionSerializer(transactions, many=True).data
    
#     def get_available_actions(self, obj):
#         """Get available actions for this client"""
#         actions = []
#         request = self.context.get('request')
        
#         if request and request.user.is_authenticated:
#             # Always available
#             actions.append({
#                 'action': 'view_profile',
#                 'label': 'View Profile',
#                 'url': f'/api/user-management/clients/{obj.id}/',
#                 'method': 'GET',
#                 'icon': '👤'
#             })
            
#             actions.append({
#                 'action': 'view_analytics',
#                 'label': 'View Analytics',
#                 'url': f'/api/user-management/clients/{obj.id}/analytics/',
#                 'method': 'GET',
#                 'icon': '📊'
#             })
            
#             # For PPPoE clients
#             if obj.is_pppoe_client:
#                 actions.append({
#                     'action': 'resend_credentials',
#                     'label': 'Resend Credentials',
#                     'url': f'/api/user-management/clients/{obj.id}/resend-credentials/',
#                     'method': 'POST',
#                     'icon': '📱'
#                 })
            
#             # For admin actions
#             if hasattr(request.user, 'user_type') and request.user.user_type in ['admin', 'staff']:
#                 actions.append({
#                     'action': 'update_tier',
#                     'label': 'Update Tier',
#                     'url': f'/api/user-management/clients/{obj.id}/update-tier/',
#                     'method': 'POST',
#                     'icon': '⭐'
#                 })
                
#                 actions.append({
#                     'action': 'update_metrics',
#                     'label': 'Update Metrics',
#                     'url': f'/api/user-management/clients/{obj.id}/update-metrics/',
#                     'method': 'POST',
#                     'icon': '🔄'
#                 })
            
#             # If client needs attention
#             if self.get_needs_attention(obj):
#                 actions.append({
#                     'action': 'send_retention_offer',
#                     'label': 'Send Retention Offer',
#                     'url': f'/api/user-management/clients/{obj.id}/send-offer/',
#                     'method': 'POST',
#                     'icon': '🎯',
#                     'priority': 'high'
#                 })
        
#         return actions
    
#     def _get_data_usage_trend(self, obj):
#         """Calculate data usage trend"""
#         # This would typically query historical data
#         # For now, return placeholder
#         if obj.avg_monthly_data_gb > Decimal('50'):
#             return 'increasing'
#         elif obj.avg_monthly_data_gb > Decimal('20'):
#             return 'stable'
#         else:
#             return 'decreasing'
    
#     def _get_payment_consistency(self, obj):
#         """Calculate payment consistency"""
#         if obj.renewal_rate > Decimal('90'):
#             return 'excellent'
#         elif obj.renewal_rate > Decimal('70'):
#             return 'good'
#         elif obj.renewal_rate > Decimal('50'):
#             return 'fair'
#         else:
#             return 'poor'
    
#     def _get_engagement_trend(self, obj):
#         """Calculate engagement trend"""
#         if obj.engagement_score >= Decimal('7.0'):
#             return 'high'
#         elif obj.engagement_score >= Decimal('4.0'):
#             return 'medium'
#         else:
#             return 'low'


# class ClientAnalyticsSnapshotSerializer(BaseSerializer):
#     """Serializer for client analytics snapshots"""
    
#     date_formatted = serializers.SerializerMethodField()
#     revenue_formatted = serializers.SerializerMethodField()
#     data_used_formatted = serializers.SerializerMethodField()
#     churn_risk_label = serializers.SerializerMethodField()
#     engagement_label = serializers.SerializerMethodField()
#     hotspot_conversion_rate = serializers.SerializerMethodField()
#     payment_abandonment_rate = serializers.SerializerMethodField()
#     percentile_rank_formatted = serializers.SerializerMethodField()
    
#     class Meta:
#         model = ClientAnalyticsSnapshot
#         fields = [
#             'id', 'date', 'date_formatted',
#             'daily_revenue', 'monthly_revenue_ytd', 'revenue_growth_rate', 'revenue_formatted',
#             'daily_data_gb', 'data_used_formatted', 'session_count',
#             'avg_session_duration_minutes', 'peak_usage_hour',
#             'churn_risk_score', 'churn_risk_label', 'engagement_score', 'engagement_label',
#             'hotspot_sessions', 'hotspot_conversions', 'hotspot_conversion_rate',
#             'payment_attempts', 'payment_abandonments', 'payment_abandonment_rate',
#             'top_categories', 'top_domains', 'device_distribution',
#             'percentile_rank', 'percentile_rank_formatted', 'segment_average',
#             'predicted_next_payment', 'predicted_churn_date', 'predicted_ltv',
#             'created_at'
#         ]
#         read_only_fields = ['created_at']
    
#     def get_date_formatted(self, obj):
#         return obj.date.strftime('%b %d, %Y')
    
#     def get_revenue_formatted(self, obj):
#         return f"KES {obj.daily_revenue:,.2f}"
    
#     def get_data_used_formatted(self, obj):
#         return f"{obj.daily_data_gb:.1f} GB"
    
#     def get_percentile_rank_formatted(self, obj):
#         return f"Top {100 - obj.percentile_rank:.0f}%"
    
#     def get_churn_risk_label(self, obj):
#         if obj.churn_risk_score >= 7:
#             return "High Risk"
#         elif obj.churn_risk_score >= 4:
#             return "Medium Risk"
#         return "Low Risk"
    
#     def get_engagement_label(self, obj):
#         if obj.engagement_score >= 8:
#             return "Highly Engaged"
#         elif obj.engagement_score >= 5:
#             return "Moderately Engaged"
#         return "Low Engagement"
    
#     def get_hotspot_conversion_rate(self, obj):
#         if obj.hotspot_sessions > 0:
#             return round((obj.hotspot_conversions / obj.hotspot_sessions) * 100, 1)
#         return 0.0
    
#     def get_payment_abandonment_rate(self, obj):
#         if obj.payment_attempts > 0:
#             return round((obj.payment_abandonments / obj.payment_attempts) * 100, 1)
#         return 0.0


# class CommissionTransactionSerializer(BaseSerializer):
#     """Serializer for commission transactions"""
    
#     marketer_name = serializers.CharField(source='marketer.user.username', read_only=True)
#     marketer_phone = serializers.CharField(source='marketer.user.phone_number', read_only=True)
#     marketer_tier = serializers.CharField(source='marketer.marketer_tier', read_only=True)
#     transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     amount_formatted = serializers.SerializerMethodField()
#     transaction_date_formatted = serializers.SerializerMethodField()
#     due_date_formatted = serializers.SerializerMethodField()
#     commission_rate_percentage = serializers.SerializerMethodField()
#     referred_client_name = serializers.SerializerMethodField()
    
#     class Meta:
#         model = CommissionTransaction
#         fields = [
#             'id', 'marketer', 'marketer_name', 'marketer_phone', 'marketer_tier',
#             'transaction_type', 'transaction_type_display',
#             'amount', 'amount_formatted', 'description',
#             'reference_id', 'referred_client', 'referred_client_name',
#             'purchase_amount', 'commission_rate', 'commission_rate_percentage',
#             'tier_bonus', 'total_commission',
#             'status', 'status_display', 'approved_by', 'notes',
#             'payment_method', 'payment_reference',
#             'transaction_date', 'transaction_date_formatted',
#             'approved_at', 'paid_at', 'due_date', 'due_date_formatted',
#             'created_at'
#         ]
#         read_only_fields = ['created_at']
    
#     def get_amount_formatted(self, obj):
#         return f"KES {obj.amount:,.2f}"
    
#     def get_transaction_date_formatted(self, obj):
#         return obj.transaction_date.strftime('%Y-%m-%d %H:%M')
    
#     def get_due_date_formatted(self, obj):
#         return obj.due_date.strftime('%Y-%m-%d') if obj.due_date else None
    
#     def get_commission_rate_percentage(self, obj):
#         return f"{obj.commission_rate}%"
    
#     def get_referred_client_name(self, obj):
#         if obj.referred_client and obj.referred_client.user:
#             return obj.referred_client.user.username
#         return None


# class ClientInteractionSerializer(BaseSerializer):
#     """Serializer for client interactions"""
    
#     interaction_type_display = serializers.CharField(source='get_interaction_type_display', read_only=True)
#     outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
#     client_name = serializers.CharField(source='client.user.username', read_only=True)
#     formatted_time = serializers.SerializerMethodField()
#     duration_formatted = serializers.SerializerMethodField()
#     data_used_gb = serializers.SerializerMethodField()
#     payment_amount_formatted = serializers.SerializerMethodField()
#     hotspot_insight = serializers.SerializerMethodField()
#     conversion_insight = serializers.SerializerMethodField()
#     time_ago = serializers.SerializerMethodField()
    
#     class Meta:
#         model = ClientInteraction
#         fields = [
#             'id', 'client', 'client_name',
#             'interaction_type', 'interaction_type_display',
#             'action', 'description', 'outcome', 'outcome_display',
#             'is_hotspot', 'hotspot_session_id', 'hotspot_plan_selected',
#             'payment_amount', 'payment_amount_formatted', 'payment_method', 'payment_reference',
#             'data_used_bytes', 'data_used_gb', 'session_duration_seconds', 'duration_formatted',
#             'device_type', 'user_agent', 'ip_address',
#             'started_at', 'formatted_time', 'time_ago', 'completed_at', 'duration_seconds',
#             'flow_stage', 'next_stage', 'flow_abandoned_at',
#             'error_code', 'error_message', 'error_details',
#             'converted_to_purchase', 'purchase_reference',
#             'hotspot_insight', 'conversion_insight', 'metadata',
#             'created_at'
#         ]
#         read_only_fields = ['created_at']
    
#     def get_formatted_time(self, obj):
#         return obj.started_at.strftime('%Y-%m-%d %H:%M:%S')
    
#     def get_time_ago(self, obj):
#         """Get human-readable time ago"""
#         delta = timezone.now() - obj.started_at
        
#         if delta.days > 365:
#             years = delta.days // 365
#             return f"{years} year{'s' if years > 1 else ''} ago"
#         elif delta.days > 30:
#             months = delta.days // 30
#             return f"{months} month{'s' if months > 1 else ''} ago"
#         elif delta.days > 0:
#             return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
#         elif delta.seconds >= 3600:
#             hours = delta.seconds // 3600
#             return f"{hours} hour{'s' if hours > 1 else ''} ago"
#         elif delta.seconds >= 60:
#             minutes = delta.seconds // 60
#             return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
#         else:
#             return "Just now"
    
#     def get_duration_formatted(self, obj):
#         if obj.duration_seconds:
#             hours = obj.duration_seconds // 3600
#             minutes = (obj.duration_seconds % 3600) // 60
#             seconds = obj.duration_seconds % 60
            
#             if hours > 0:
#                 return f"{hours}h {minutes}m"
#             elif minutes > 0:
#                 return f"{minutes}m {seconds}s"
#             else:
#                 return f"{seconds}s"
#         return "N/A"
    
#     def get_data_used_gb(self, obj):
#         if obj.data_used_bytes:
#             return round(obj.data_used_bytes / (1024 ** 3), 2)
#         return 0
    
#     def get_payment_amount_formatted(self, obj):
#         if obj.payment_amount:
#             return f"KES {obj.payment_amount:,.2f}"
#         return None
    
#     def get_hotspot_insight(self, obj):
#         if obj.is_hotspot:
#             if obj.interaction_type == 'hotspot_payment_page':
#                 return "Viewed payment page"
#             elif obj.interaction_type == 'payment_abandoned':
#                 return "Payment abandoned at checkout"
#             elif obj.interaction_type == 'hotspot_plan_selection':
#                 return f"Selected plan: {obj.hotspot_plan_selected}"
#         return None
    
#     def get_conversion_insight(self, obj):
#         if obj.converted_to_purchase:
#             return f"Converted to purchase: {obj.purchase_reference}"
#         elif obj.interaction_type == 'payment_abandoned':
#             return "Failed to convert"
#         return None


# class CreatePPPoEClientSerializer(serializers.Serializer):
#     """
#     Serializer for creating PPPoE clients via admin
#     Production-ready with comprehensive validation
#     """
    
#     name = serializers.CharField(
#         max_length=255,
#         required=True,
#         help_text="Client's full name"
#     )
    
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         help_text="Phone number in Kenyan format (07XXXXXXXX or 01XXXXXXXX)"
#     )
    
#     referral_code = serializers.CharField(
#         max_length=12,
#         required=False,
#         allow_blank=True,
#         help_text="Optional referral code from marketer"
#     )
    
#     client_type = serializers.ChoiceField(
#         choices=[
#             ('residential', 'Residential'),
#             ('business', 'Business'),
#             ('student', 'Student'),
#             ('tourist', 'Tourist'),
#             ('freelancer', 'Freelancer'),
#             ('corporate', 'Corporate')
#         ],
#         default='residential',
#         required=False
#     )
    
#     location = serializers.CharField(
#         max_length=500,
#         required=False,
#         allow_blank=True,
#         help_text="Client location/address"
#     )
    
#     send_sms = serializers.BooleanField(
#         default=True,
#         required=False,
#         help_text="Send PPPoE credentials via SMS"
#     )
    
#     assign_marketer = serializers.BooleanField(
#         default=False,
#         required=False,
#         help_text="Automatically assign as marketer"
#     )
    
#     class Meta:
#         fields = [
#             'name', 'phone_number', 'referral_code', 'client_type',
#             'location', 'send_sms', 'assign_marketer'
#         ]
    
#     def validate_phone_number(self, value):
#         """Validate Kenyan phone number"""
#         from authentication.models import PhoneValidation
        
#         if not PhoneValidation.is_valid_kenyan_phone(value):
#             raise serializers.ValidationError(
#                 "Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX"
#             )
        
#         # Normalize phone number
#         normalized = PhoneValidation.normalize_kenyan_phone(value)
#         return normalized
    
#     def validate_referral_code(self, value):
#         """Validate referral code"""
#         if not value:
#             return value
        
#         # Convert to uppercase
#         value = value.strip().upper()
        
#         # Check if referral code exists and belongs to a marketer
#         try:
#             referrer = ClientProfile.objects.get(
#                 referral_code=value,
#                 is_marketer=True
#             )
#             return value
#         except ClientProfile.DoesNotExist:
#             raise serializers.ValidationError(
#                 "Invalid referral code or marketer not found"
#             )
    
#     def validate(self, data):
#         """Validate overall data"""
#         phone_number = data.get('phone_number')
        
#         if phone_number:
#             # Check if client already exists
#             from authentication.models import UserAccount
            
#             try:
#                 existing_client = UserAccount.objects.get(phone_number=phone_number)
                
#                 if existing_client.connection_type == 'pppoe':
#                     raise serializers.ValidationError({
#                         'phone_number': f'PPPoE client already exists with phone: {phone_number}'
#                     })
                
#             except UserAccount.DoesNotExist:
#                 pass
        
#         return data


# class CreateHotspotClientSerializer(serializers.Serializer):
#     """
#     Serializer for creating hotspot clients
#     """
    
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         help_text="Phone number in Kenyan format"
#     )
    
#     client_type = serializers.ChoiceField(
#         choices=[
#             ('residential', 'Residential'),
#             ('business', 'Business'),
#             ('student', 'Student'),
#             ('tourist', 'Tourist')
#         ],
#         default='residential',
#         required=False
#     )
    
#     send_welcome_sms = serializers.BooleanField(
#         default=True,
#         required=False,
#         help_text="Send welcome SMS to client"
#     )
    
#     class Meta:
#         fields = ['phone_number', 'client_type', 'send_welcome_sms']
    
#     def validate_phone_number(self, value):
#         """Validate Kenyan phone number"""
#         from authentication.models import PhoneValidation
        
#         if not PhoneValidation.is_valid_kenyan_phone(value):
#             raise serializers.ValidationError(
#                 "Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX"
#             )
        
#         return PhoneValidation.normalize_kenyan_phone(value)


# class UpdateClientTierSerializer(serializers.Serializer):
#     """
#     Serializer for updating client tier
#     """
    
#     tier = serializers.ChoiceField(
#         choices=ClientProfile.ClientTier.choices,
#         required=True,
#         help_text="New tier for the client"
#     )
    
#     reason = serializers.CharField(
#         max_length=500,
#         required=False,
#         allow_blank=True,
#         help_text="Reason for tier change (for audit)"
#     )
    
#     send_notification = serializers.BooleanField(
#         default=True,
#         required=False,
#         help_text="Send notification to client about tier change"
#     )
    
#     class Meta:
#         fields = ['tier', 'reason', 'send_notification']


# class ClientSearchSerializer(serializers.Serializer):
#     """
#     Serializer for client search
#     """
    
#     phone_number = serializers.CharField(
#         max_length=20,
#         required=True,
#         help_text="Phone number to search"
#     )
    
#     class Meta:
#         fields = ['phone_number']


# class DashboardFilterSerializer(serializers.Serializer):
#     """
#     Serializer for dashboard filters
#     """
    
#     time_range = serializers.ChoiceField(
#         choices=[
#             ('7d', 'Last 7 Days'),
#             ('30d', 'Last 30 Days'),
#             ('90d', 'Last 90 Days'),
#             ('all', 'All Time')
#         ],
#         default='30d',
#         required=False
#     )
    
#     connection_type = serializers.ChoiceField(
#         choices=[
#             ('all', 'All'),
#             ('pppoe', 'PPPoE Only'),
#             ('hotspot', 'Hotspot Only')
#         ],
#         default='all',
#         required=False
#     )
    
#     refresh = serializers.BooleanField(
#         default=False,
#         required=False,
#         help_text="Force refresh cached data"
#     )
    
#     class Meta:
#         fields = ['time_range', 'connection_type', 'refresh']










"""
Business Logic Serializers - No Authentication Logic
Production-ready with comprehensive serialization
"""
from rest_framework import serializers
from django.utils import timezone
from django.db.models import Sum, Avg, Count, F, Q
import logging
from decimal import Decimal
from datetime import datetime, timedelta

from user_management.models.client_model import (
    ClientProfile, ClientAnalyticsSnapshot,
    CommissionTransaction, ClientInteraction
)

logger = logging.getLogger(__name__)


class BaseSerializer(serializers.ModelSerializer):
    """Base serializer with common functionality"""
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['_meta'] = {
            'serializer': self.__class__.__name__,
            'timestamp': timezone.now().isoformat(),
            'version': '2.0.0'
        }
        return representation


class ClientProfileSerializer(BaseSerializer):
    """
    Comprehensive client profile serializer with business insights
    Production-ready with all fields needed for admin dashboard
    """
    
    # Basic Information from Authentication app
    username = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    phone_display = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    connection_type = serializers.SerializerMethodField()
    is_pppoe_client = serializers.SerializerMethodField()
    is_hotspot_client = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    
    # PPPoE Credentials (only for admin view)
    pppoe_username = serializers.SerializerMethodField()
    pppoe_password = serializers.SerializerMethodField()
    
    # Financial Information
    lifetime_value_formatted = serializers.SerializerMethodField()
    monthly_revenue_formatted = serializers.SerializerMethodField()
    avg_monthly_spend_formatted = serializers.SerializerMethodField()
    commission_balance_formatted = serializers.SerializerMethodField()
    total_commission_formatted = serializers.SerializerMethodField()
    
    # Usage Information
    total_data_used_formatted = serializers.SerializerMethodField()
    avg_monthly_data_formatted = serializers.SerializerMethodField()
    
    # Classification & Tags
    is_high_value = serializers.BooleanField(read_only=True)
    is_frequent_user = serializers.BooleanField(read_only=True)
    is_at_risk = serializers.BooleanField(read_only=True)
    is_hotspot_abandoner = serializers.BooleanField(read_only=True)
    needs_attention = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()
    
    # Referral Information
    referral_link = serializers.CharField(read_only=True)
    referred_by_name = serializers.SerializerMethodField()
    referral_count = serializers.SerializerMethodField()
    
    # Timestamps
    customer_since_formatted = serializers.SerializerMethodField()
    days_active = serializers.IntegerField(read_only=True)
    days_since_last_payment = serializers.IntegerField(read_only=True)
    last_login_formatted = serializers.SerializerMethodField()
    last_payment_formatted = serializers.SerializerMethodField()
    
    # Dashboard Stats
    quick_stats = serializers.SerializerMethodField()
    recent_interactions = serializers.SerializerMethodField()
    commission_history = serializers.SerializerMethodField()
    
    # Actions available for this client
    available_actions = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientProfile
        fields = [
            # Basic Info from Authentication
            'id', 'username', 'phone_number', 'phone_display', 'is_active',
            'connection_type', 'is_pppoe_client', 'is_hotspot_client', 'client_name',
            
            # PPPoE Credentials (admin only)
            'pppoe_username', 'pppoe_password',
            
            # Profile Info
            'client_type', 'status', 'tier',
            'referral_code', 'referred_by', 'referred_by_name',
            'is_marketer', 'marketer_tier',
            
            # Financial Details
            'lifetime_value', 'lifetime_value_formatted',
            'monthly_recurring_revenue', 'monthly_revenue_formatted',
            'total_revenue', 'avg_monthly_spend', 'avg_monthly_spend_formatted',
            'commission_rate', 'commission_balance', 'commission_balance_formatted',
            'total_commission_earned', 'total_commission_formatted',
            
            # Usage Details
            'total_data_used_gb', 'total_data_used_formatted',
            'avg_monthly_data_gb', 'avg_monthly_data_formatted',
            'peak_usage_hour',
            
            # Hotspot Specific
            'hotspot_sessions', 'hotspot_conversion_rate',
            'payment_abandonment_rate',
            
            # Behavioral Metrics
            'churn_risk_score', 'engagement_score', 'satisfaction_score',
            'renewal_rate', 'days_since_last_payment',
            'is_high_value', 'is_frequent_user', 'is_at_risk',
            'is_hotspot_abandoner', 'needs_attention', 'risk_level',
            
            # Classification
            'behavior_tags', 'revenue_segment', 'usage_pattern',
            
            # Preferences
            'preferred_payment_method', 'notification_preferences',
            'communication_preferences',
            
            # Insights
            'insights', 'recommendations', 'next_best_offer',
            
            # Referral
            'referral_link', 'referral_count',
            
            # Timestamps
            'customer_since', 'customer_since_formatted',
            'last_payment_date', 'last_payment_formatted',
            'last_usage_date', 'last_login_date', 'last_login_formatted',
            'next_payment_due', 'tier_upgraded_at',
            'days_active', 'days_since_last_payment',
            'created_at', 'updated_at',
            
            # Device Info
            'primary_device', 'devices_count', 'location',
            
            # Dashboard Data
            'quick_stats', 'recent_interactions', 'commission_history',
            
            # Actions
            'available_actions',
            
            # Metadata
            'metadata', 'flags'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'lifetime_value',
            'total_revenue', 'commission_balance', 'total_commission_earned',
            'total_data_used_gb', 'avg_monthly_data_gb',
            'churn_risk_score', 'engagement_score', 'satisfaction_score',
            'behavior_tags', 'insights', 'recommendations', 'next_best_offer',
            'flags', 'referral_code'
        ]
    
    def get_username(self, obj):
        return obj.username
    
    def get_phone_number(self, obj):
        return obj.phone_number
    
    def get_phone_display(self, obj):
        """Get phone in local display format"""
        try:
            from authentication.models import PhoneValidation
            return PhoneValidation.get_phone_display(obj.phone_number)
        except ImportError:
            return obj.phone_number
    
    def get_is_active(self, obj):
        try:
            return obj.user.is_active
        except:
            return True
    
    def get_connection_type(self, obj):
        return obj.connection_type
    
    def get_is_pppoe_client(self, obj):
        return obj.is_pppoe_client
    
    def get_is_hotspot_client(self, obj):
        return obj.is_hotspot_client
    
    def get_client_name(self, obj):
        try:
            return obj.user.name
        except:
            return obj.username
    
    def get_pppoe_username(self, obj):
        """Get PPPoE username if client is PPPoE"""
        if obj.is_pppoe_client and hasattr(obj.user, 'pppoe_username'):
            return obj.user.pppoe_username
        return None
    
    def get_pppoe_password(self, obj):
        """Get PPPoE password (only for authenticated admin requests)"""
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            return None
        
        # Only show password to authenticated users for PPPoE clients
        if (obj.is_pppoe_client and hasattr(obj.user, 'get_pppoe_password_decrypted')):
            
            # Check if user is admin/staff
            if hasattr(request.user, 'user_type'):
                if request.user.user_type in ['admin', 'staff']:
                    return obj.user.get_pppoe_password_decrypted()
            
            # Check if user is superuser
            if request.user.is_superuser:
                return obj.user.get_pppoe_password_decrypted()
        
        return None
    
    def get_lifetime_value_formatted(self, obj):
        return f"KES {obj.lifetime_value:,.2f}"
    
    def get_monthly_revenue_formatted(self, obj):
        return f"KES {obj.monthly_recurring_revenue:,.2f}"
    
    def get_avg_monthly_spend_formatted(self, obj):
        return f"KES {obj.avg_monthly_spend:,.2f}"
    
    def get_commission_balance_formatted(self, obj):
        return f"KES {obj.commission_balance:,.2f}"
    
    def get_total_commission_formatted(self, obj):
        return f"KES {obj.total_commission_earned:,.2f}"
    
    def get_total_data_used_formatted(self, obj):
        return f"{obj.total_data_used_gb:.1f} GB"
    
    def get_avg_monthly_data_formatted(self, obj):
        return f"{obj.avg_monthly_data_gb:.1f} GB"
    
    def get_referred_by_name(self, obj):
        if obj.referred_by:
            return obj.referred_by.username
        return None
    
    def get_referral_count(self, obj):
        """Get number of successful referrals"""
        return ClientProfile.objects.filter(referred_by=obj).count()
    
    def get_customer_since_formatted(self, obj):
        return obj.customer_since.strftime('%b %d, %Y')
    
    def get_last_login_formatted(self, obj):
        if obj.last_login_date:
            return obj.last_login_date.strftime('%b %d, %Y %I:%M %p')
        return 'Never'
    
    def get_last_payment_formatted(self, obj):
        if obj.last_payment_date:
            return obj.last_payment_date.strftime('%b %d, %Y')
        return 'No payments'
    
    def get_needs_attention(self, obj):
        """Calculate if client needs attention"""
        return (obj.is_at_risk or 
                obj.days_since_last_payment > 7 or 
                'payment_failed' in obj.flags)
    
    def get_risk_level(self, obj):
        """Get human-readable risk level"""
        if obj.churn_risk_score >= Decimal('7.0'):
            return 'High'
        elif obj.churn_risk_score >= Decimal('4.0'):
            return 'Medium'
        else:
            return 'Low'
    
    def get_quick_stats(self, obj):
        """Get quick stats for dashboard display"""
        from datetime import date
        
        # Calculate days since last activity
        days_since_activity = 0
        if obj.last_login_date:
            days_since_activity = (date.today() - obj.last_login_date.date()).days
        
        # Get recent interactions count
        recent_interactions_count = ClientInteraction.objects.filter(
            client=obj,
            started_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        return {
            'days_since_activity': days_since_activity,
            'recent_interactions': recent_interactions_count,
            'data_usage_trend': self._get_data_usage_trend(obj),
            'payment_consistency': self._get_payment_consistency(obj),
            'engagement_trend': self._get_engagement_trend(obj)
        }
    
    def get_recent_interactions(self, obj):
        """Get recent client interactions"""
        interactions = ClientInteraction.objects.filter(
            client=obj
        ).order_by('-started_at')[:5]
        
        from user_management.serializers.client_serializers import ClientInteractionSerializer
        return ClientInteractionSerializer(interactions, many=True).data
    
    def get_commission_history(self, obj):
        """Get commission history for marketers"""
        if not obj.is_marketer:
            return []
        
        transactions = CommissionTransaction.objects.filter(
            marketer=obj
        ).order_by('-transaction_date')[:5]
        
        from user_management.serializers.client_serializers import CommissionTransactionSerializer
        return CommissionTransactionSerializer(transactions, many=True).data
    
    def get_available_actions(self, obj):
        """Get available actions for this client"""
        actions = []
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            # Always available
            actions.append({
                'action': 'view_profile',
                'label': 'View Profile',
                'url': f'/api/user-management/clients/{obj.id}/',
                'method': 'GET',
                'icon': '👤'
            })
            
            actions.append({
                'action': 'view_analytics',
                'label': 'View Analytics',
                'url': f'/api/user-management/clients/{obj.id}/analytics/',
                'method': 'GET',
                'icon': '📊'
            })
            
            # For PPPoE clients
            if obj.is_pppoe_client:
                actions.append({
                    'action': 'resend_credentials',
                    'label': 'Resend Credentials',
                    'url': f'/api/user-management/clients/{obj.id}/resend-credentials/',
                    'method': 'POST',
                    'icon': '📱'
                })
            
            # For admin actions
            if hasattr(request.user, 'user_type') and request.user.user_type in ['admin', 'staff']:
                actions.append({
                    'action': 'update_tier',
                    'label': 'Update Tier',
                    'url': f'/api/user-management/clients/{obj.id}/update-tier/',
                    'method': 'POST',
                    'icon': '⭐'
                })
                
                actions.append({
                    'action': 'update_metrics',
                    'label': 'Update Metrics',
                    'url': f'/api/user-management/clients/{obj.id}/update-metrics/',
                    'method': 'POST',
                    'icon': '🔄'
                })
            
            # If client needs attention
            if self.get_needs_attention(obj):
                actions.append({
                    'action': 'send_retention_offer',
                    'label': 'Send Retention Offer',
                    'url': f'/api/user-management/clients/{obj.id}/send-offer/',
                    'method': 'POST',
                    'icon': '🎯',
                    'priority': 'high'
                })
        
        return actions
    
    def _get_data_usage_trend(self, obj):
        """Calculate data usage trend"""
        if obj.avg_monthly_data_gb > Decimal('50'):
            return 'increasing'
        elif obj.avg_monthly_data_gb > Decimal('20'):
            return 'stable'
        else:
            return 'decreasing'
    
    def _get_payment_consistency(self, obj):
        """Calculate payment consistency"""
        if obj.renewal_rate > Decimal('90'):
            return 'excellent'
        elif obj.renewal_rate > Decimal('70'):
            return 'good'
        elif obj.renewal_rate > Decimal('50'):
            return 'fair'
        else:
            return 'poor'
    
    def _get_engagement_trend(self, obj):
        """Calculate engagement trend"""
        if obj.engagement_score >= Decimal('7.0'):
            return 'high'
        elif obj.engagement_score >= Decimal('4.0'):
            return 'medium'
        else:
            return 'low'


class ClientAnalyticsSnapshotSerializer(BaseSerializer):
    """Serializer for client analytics snapshots"""
    
    date_formatted = serializers.SerializerMethodField()
    revenue_formatted = serializers.SerializerMethodField()
    data_used_formatted = serializers.SerializerMethodField()
    churn_risk_label = serializers.SerializerMethodField()
    engagement_label = serializers.SerializerMethodField()
    hotspot_conversion_rate = serializers.SerializerMethodField()
    payment_abandonment_rate = serializers.SerializerMethodField()
    percentile_rank_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientAnalyticsSnapshot
        fields = [
            'id', 'date', 'date_formatted',
            'daily_revenue', 'monthly_revenue_ytd', 'revenue_growth_rate', 'revenue_formatted',
            'daily_data_gb', 'data_used_formatted', 'session_count',
            'avg_session_duration_minutes', 'peak_usage_hour',
            'churn_risk_score', 'churn_risk_label', 'engagement_score', 'engagement_label',
            'hotspot_sessions', 'hotspot_conversions', 'hotspot_conversion_rate',
            'payment_attempts', 'payment_abandonments', 'payment_abandonment_rate',
            'top_categories', 'top_domains', 'device_distribution',
            'percentile_rank', 'percentile_rank_formatted', 'segment_average',
            'predicted_next_payment', 'predicted_churn_date', 'predicted_ltv',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_date_formatted(self, obj):
        return obj.date.strftime('%b %d, %Y')
    
    def get_revenue_formatted(self, obj):
        return f"KES {obj.daily_revenue:,.2f}"
    
    def get_data_used_formatted(self, obj):
        return f"{obj.daily_data_gb:.1f} GB"
    
    def get_percentile_rank_formatted(self, obj):
        return f"Top {100 - obj.percentile_rank:.0f}%"
    
    def get_churn_risk_label(self, obj):
        if obj.churn_risk_score >= 7:
            return "High Risk"
        elif obj.churn_risk_score >= 4:
            return "Medium Risk"
        return "Low Risk"
    
    def get_engagement_label(self, obj):
        if obj.engagement_score >= 8:
            return "Highly Engaged"
        elif obj.engagement_score >= 5:
            return "Moderately Engaged"
        return "Low Engagement"
    
    def get_hotspot_conversion_rate(self, obj):
        if obj.hotspot_sessions > 0:
            return round((obj.hotspot_conversions / obj.hotspot_sessions) * 100, 1)
        return 0.0
    
    def get_payment_abandonment_rate(self, obj):
        if obj.payment_attempts > 0:
            return round((obj.payment_abandonments / obj.payment_attempts) * 100, 1)
        return 0.0


class CommissionTransactionSerializer(BaseSerializer):
    """Serializer for commission transactions"""
    
    marketer_name = serializers.SerializerMethodField()
    marketer_phone = serializers.SerializerMethodField()
    marketer_tier = serializers.CharField(source='marketer.marketer_tier', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    amount_formatted = serializers.SerializerMethodField()
    transaction_date_formatted = serializers.SerializerMethodField()
    due_date_formatted = serializers.SerializerMethodField()
    commission_rate_percentage = serializers.SerializerMethodField()
    referred_client_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CommissionTransaction
        fields = [
            'id', 'marketer', 'marketer_name', 'marketer_phone', 'marketer_tier',
            'transaction_type', 'transaction_type_display',
            'amount', 'amount_formatted', 'description',
            'reference_id', 'referred_client', 'referred_client_name',
            'purchase_amount', 'commission_rate', 'commission_rate_percentage',
            'tier_bonus', 'total_commission',
            'status', 'status_display', 'approved_by', 'notes',
            'payment_method', 'payment_reference',
            'transaction_date', 'transaction_date_formatted',
            'approved_at', 'paid_at', 'due_date', 'due_date_formatted',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_marketer_name(self, obj):
        return obj.marketer.username
    
    def get_marketer_phone(self, obj):
        return obj.marketer.phone_number
    
    def get_amount_formatted(self, obj):
        return f"KES {obj.amount:,.2f}"
    
    def get_transaction_date_formatted(self, obj):
        return obj.transaction_date.strftime('%Y-%m-%d %H:%M')
    
    def get_due_date_formatted(self, obj):
        return obj.due_date.strftime('%Y-%m-%d') if obj.due_date else None
    
    def get_commission_rate_percentage(self, obj):
        return f"{obj.commission_rate}%"
    
    def get_referred_client_name(self, obj):
        if obj.referred_client:
            return obj.referred_client.username
        return None


class ClientInteractionSerializer(BaseSerializer):
    """Serializer for client interactions"""
    
    interaction_type_display = serializers.CharField(source='get_interaction_type_display', read_only=True)
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    client_name = serializers.SerializerMethodField()
    formatted_time = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    data_used_gb = serializers.SerializerMethodField()
    payment_amount_formatted = serializers.SerializerMethodField()
    hotspot_insight = serializers.SerializerMethodField()
    conversion_insight = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = ClientInteraction
        fields = [
            'id', 'client', 'client_name',
            'interaction_type', 'interaction_type_display',
            'action', 'description', 'outcome', 'outcome_display',
            'is_hotspot', 'hotspot_session_id', 'hotspot_plan_selected',
            'payment_amount', 'payment_amount_formatted', 'payment_method', 'payment_reference',
            'data_used_bytes', 'data_used_gb', 'session_duration_seconds', 'duration_formatted',
            'device_type', 'user_agent', 'ip_address',
            'started_at', 'formatted_time', 'time_ago', 'completed_at', 'duration_seconds',
            'flow_stage', 'next_stage', 'flow_abandoned_at',
            'error_code', 'error_message', 'error_details',
            'converted_to_purchase', 'purchase_reference',
            'hotspot_insight', 'conversion_insight', 'metadata',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_client_name(self, obj):
        return obj.client.username
    
    def get_formatted_time(self, obj):
        return obj.started_at.strftime('%Y-%m-%d %H:%M:%S')
    
    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        delta = timezone.now() - obj.started_at
        
        if delta.days > 365:
            years = delta.days // 365
            return f"{years} year{'s' if years > 1 else ''} ago"
        elif delta.days > 30:
            months = delta.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
        elif delta.days > 0:
            return f"{delta.days} day{'s' if delta.days > 1 else ''} ago"
        elif delta.seconds >= 3600:
            hours = delta.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif delta.seconds >= 60:
            minutes = delta.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def get_duration_formatted(self, obj):
        if obj.duration_seconds:
            hours = obj.duration_seconds // 3600
            minutes = (obj.duration_seconds % 3600) // 60
            seconds = obj.duration_seconds % 60
            
            if hours > 0:
                return f"{hours}h {minutes}m"
            elif minutes > 0:
                return f"{minutes}m {seconds}s"
            else:
                return f"{seconds}s"
        return "N/A"
    
    def get_data_used_gb(self, obj):
        if obj.data_used_bytes:
            return round(obj.data_used_bytes / (1024 ** 3), 2)
        return 0
    
    def get_payment_amount_formatted(self, obj):
        if obj.payment_amount:
            return f"KES {obj.payment_amount:,.2f}"
        return None
    
    def get_hotspot_insight(self, obj):
        if obj.is_hotspot:
            if obj.interaction_type == 'hotspot_payment_page':
                return "Viewed payment page"
            elif obj.interaction_type == 'payment_abandoned':
                return "Payment abandoned at checkout"
            elif obj.interaction_type == 'hotspot_plan_selection':
                return f"Selected plan: {obj.hotspot_plan_selected}"
        return None
    
    def get_conversion_insight(self, obj):
        if obj.converted_to_purchase:
            return f"Converted to purchase: {obj.purchase_reference}"
        elif obj.interaction_type == 'payment_abandoned':
            return "Failed to convert"
        return None


class CreatePPPoEClientSerializer(serializers.Serializer):
    """Serializer for creating PPPoE clients via admin"""
    
    name = serializers.CharField(max_length=255, required=True, help_text="Client's full name")
    phone_number = serializers.CharField(max_length=20, required=True, help_text="Phone number")
    referral_code = serializers.CharField(max_length=12, required=False, allow_blank=True)
    client_type = serializers.ChoiceField(
        choices=[
            ('residential', 'Residential'),
            ('business', 'Business'),
            ('student', 'Student'),
            ('tourist', 'Tourist'),
            ('freelancer', 'Freelancer'),
            ('corporate', 'Corporate')
        ],
        default='residential',
        required=False
    )
    location = serializers.CharField(max_length=500, required=False, allow_blank=True)
    send_sms = serializers.BooleanField(default=True, required=False)
    assign_marketer = serializers.BooleanField(default=False, required=False)
    
    class Meta:
        fields = [
            'name', 'phone_number', 'referral_code', 'client_type',
            'location', 'send_sms', 'assign_marketer'
        ]
    
    def validate_phone_number(self, value):
        """Validate Kenyan phone number"""
        try:
            from authentication.models import PhoneValidation
            if not PhoneValidation.is_valid_kenyan_phone(value):
                raise serializers.ValidationError(
                    "Invalid phone number format. Use 07XXXXXXXX or 01XXXXXXXX"
                )
            return PhoneValidation.normalize_kenyan_phone(value)
        except ImportError:
            # Fallback validation
            import re
            if re.match(r'^(07\d{8}|01\d{8})$', value):
                return value
            raise serializers.ValidationError("Invalid phone number format")
    
    def validate_referral_code(self, value):
        """Validate referral code"""
        if not value:
            return value
        
        value = value.strip().upper()
        
        try:
            referrer = ClientProfile.objects.get(
                referral_code=value,
                is_marketer=True
            )
            return value
        except ClientProfile.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid referral code or marketer not found"
            )
    
    def validate(self, data):
        """Validate overall data"""
        phone_number = data.get('phone_number')
        
        if phone_number:
            try:
                from authentication.models import UserAccount
                existing_client = UserAccount.objects.get(phone_number=phone_number)
                
                if existing_client.connection_type == 'pppoe':
                    raise serializers.ValidationError({
                        'phone_number': f'PPPoE client already exists with phone: {phone_number}'
                    })
                
            except UserAccount.DoesNotExist:
                pass
        
        return data


class CreateHotspotClientSerializer(serializers.Serializer):
    """Serializer for creating hotspot clients"""
    
    phone_number = serializers.CharField(max_length=20, required=True)
    client_type = serializers.ChoiceField(
        choices=[
            ('residential', 'Residential'),
            ('business', 'Business'),
            ('student', 'Student'),
            ('tourist', 'Tourist')
        ],
        default='residential',
        required=False
    )
    send_welcome_sms = serializers.BooleanField(default=True, required=False)
    
    class Meta:
        fields = ['phone_number', 'client_type', 'send_welcome_sms']
    
    def validate_phone_number(self, value):
        """Validate Kenyan phone number"""
        try:
            from authentication.models import PhoneValidation
            if not PhoneValidation.is_valid_kenyan_phone(value):
                raise serializers.ValidationError("Invalid phone number format")
            return PhoneValidation.normalize_kenyan_phone(value)
        except ImportError:
            import re
            if re.match(r'^(07\d{8}|01\d{8})$', value):
                return value
            raise serializers.ValidationError("Invalid phone number format")


class UpdateClientTierSerializer(serializers.Serializer):
    """Serializer for updating client tier"""
    
    tier = serializers.ChoiceField(
        choices=ClientProfile.ClientTier.choices,
        required=True,
        help_text="New tier for the client"
    )
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    send_notification = serializers.BooleanField(default=True, required=False)
    
    class Meta:
        fields = ['tier', 'reason', 'send_notification']


class ClientSearchSerializer(serializers.Serializer):
    """Serializer for client search"""
    
    phone_number = serializers.CharField(max_length=20, required=True)
    
    class Meta:
        fields = ['phone_number']


class DashboardFilterSerializer(serializers.Serializer):
    """Serializer for dashboard filters"""
    
    time_range = serializers.ChoiceField(
        choices=[
            ('7d', 'Last 7 Days'),
            ('30d', 'Last 30 Days'),
            ('90d', 'Last 90 Days'),
            ('all', 'All Time')
        ],
        default='30d',
        required=False
    )
    connection_type = serializers.ChoiceField(
        choices=[
            ('all', 'All'),
            ('pppoe', 'PPPoE Only'),
            ('hotspot', 'Hotspot Only')
        ],
        default='all',
        required=False
    )
    refresh = serializers.BooleanField(default=False, required=False)
    
    class Meta:
        fields = ['time_range', 'connection_type', 'refresh']