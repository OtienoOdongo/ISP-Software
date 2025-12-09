# """
# Utility functions for client analytics and calculations
# Business Logic Only - No Authentication Logic
# """
# from django.utils import timezone
# from django.db.models import Sum, Avg, Count, Q, F
# from decimal import Decimal
# import logging
# from datetime import timedelta

# logger = logging.getLogger(__name__)


# class ClientMetricsCalculator:
#     """Calculate comprehensive client metrics - Business Logic Only"""
    
#     def __init__(self, client_profile):
#         self.client = client_profile
    
#     def calculate_churn_risk(self):
#         """Calculate churn risk score (0-10) - Business Logic"""
#         score = Decimal('0.0')
        
#         # Payment history (40% weight)
#         if self.client.days_since_last_payment > 30:
#             score += 4.0
#         elif self.client.days_since_last_payment > 14:
#             score += 2.0
        
#         # Usage patterns (30% weight)
#         if self.client.avg_monthly_data_gb < 5:
#             score += 1.5
        
#         if self.client.engagement_score < 3:
#             score += 1.5
        
#         # Support interactions (20% weight)
#         recent_support = ClientInteraction.objects.filter(
#             client=self.client,
#             interaction_type__in=['support_ticket', 'payment_failed'],
#             started_at__gte=timezone.now() - timedelta(days=30)
#         ).count()
        
#         if recent_support > 3:
#             score += 2.0
        
#         # Hotspot specific (10% weight for hotspot users)
#         if self.client.connection_type == 'hotspot':
#             if self.client.payment_abandonment_rate > 50:
#                 score += 1.0
        
#         return min(Decimal('10.0'), score)
    
#     def calculate_engagement_score(self):
#         """Calculate engagement score (0-10) - Business Logic"""
#         score = Decimal('5.0')  # Base score
        
#         # Recent activity (30 days)
#         recent_days = 30
#         recent_interactions = ClientInteraction.objects.filter(
#             client=self.client,
#             started_at__gte=timezone.now() - timedelta(days=recent_days)
#         ).count()
        
#         if recent_interactions > 20:
#             score += 2.0
#         elif recent_interactions > 10:
#             score += 1.0
#         elif recent_interactions < 3:
#             score -= 1.0
        
#         # Usage consistency
#         if self.client.avg_monthly_data_gb > 50:
#             score += 1.0
        
#         # Payment consistency
#         if self.client.renewal_rate > 90:
#             score += 1.0
        
#         # Support interactions (negative impact)
#         support_tickets = ClientInteraction.objects.filter(
#             client=self.client,
#             interaction_type='support_ticket',
#             started_at__gte=timezone.now() - timedelta(days=30)
#         ).count()
        
#         if support_tickets > 5:
#             score -= 1.5
        
#         return max(Decimal('0.0'), min(Decimal('10.0'), score))
    
#     def calculate_satisfaction_score(self):
#         """Calculate satisfaction score based on various factors"""
#         score = Decimal('7.0')  # Base assumption
        
#         # Reduce for recent issues
#         recent_issues = ClientInteraction.objects.filter(
#             client=self.client,
#             outcome='failure',
#             started_at__gte=timezone.now() - timedelta(days=14)
#         ).count()
        
#         if recent_issues > 0:
#             score -= min(Decimal('3.0'), Decimal(recent_issues) * Decimal('0.5'))
        
#         # Increase for successful payments and low support
#         successful_payments = ClientInteraction.objects.filter(
#             client=self.client,
#             interaction_type='payment_success',
#             started_at__gte=timezone.now() - timedelta(days=30)
#         ).count()
        
#         if successful_payments >= 2:
#             score += Decimal('1.0')
        
#         return max(Decimal('0.0'), min(Decimal('10.0'), score))
    
#     def determine_revenue_segment(self):
#         """Determine revenue segment based on LTV - Business Logic"""
#         ltv = self.client.lifetime_value
        
#         if ltv >= Decimal('50000.00'):
#             return 'premium'
#         elif ltv >= Decimal('20000.00'):
#             return 'high'
#         elif ltv >= Decimal('5000.00'):
#             return 'medium'
#         else:
#             return 'low'
    
#     def determine_usage_pattern(self):
#         """Determine usage pattern based on data consumption"""
#         avg_monthly = self.client.avg_monthly_data_gb
        
#         if avg_monthly >= Decimal('200.00'):
#             return 'extreme'
#         elif avg_monthly >= Decimal('100.00'):
#             return 'heavy'
#         elif avg_monthly >= Decimal('30.00'):
#             return 'regular'
#         else:
#             return 'casual'
    
#     def generate_behavior_tags(self):
#         """Generate behavioral tags for the client - Business Logic"""
#         tags = []
        
#         # Revenue based tags
#         if self.client.lifetime_value >= Decimal('10000.00'):
#             tags.append('high_value')
#         elif self.client.lifetime_value < Decimal('1000.00'):
#             tags.append('low_value')
        
#         # Usage based tags
#         if self.client.avg_monthly_data_gb >= Decimal('100.00'):
#             tags.append('heavy_user')
#         elif self.client.avg_monthly_data_gb < Decimal('10.00'):
#             tags.append('light_user')
        
#         # Payment behavior
#         if self.client.days_since_last_payment > 14:
#             tags.append('late_payer')
#         if self.client.renewal_rate > 95:
#             tags.append('loyal')
        
#         # Hotspot specific
#         if self.client.connection_type == 'hotspot':
#             tags.append('hotspot_user')
#             if self.client.payment_abandonment_rate > 50:
#                 tags.append('payment_abandoner')
#             if self.client.hotspot_sessions > 10:
#                 tags.append('frequent_hotspot')
        
#         # PPPoE specific
#         if self.client.connection_type == 'pppoe':
#             tags.append('pppoe_user')
#             if self.client.days_active > 180:
#                 tags.append('long_term')
        
#         # Risk assessment
#         if self.client.churn_risk_score >= Decimal('7.0'):
#             tags.append('at_risk')
        
#         # Device usage
#         if self.client.devices_count > 3:
#             tags.append('multi_device')
        
#         return tags
    
#     def generate_insights(self):
#         """Generate automated insights about the client - Business Logic"""
#         insights = []
        
#         # Revenue insights
#         if self.client.lifetime_value >= Decimal('20000.00'):
#             insights.append({
#                 'type': 'revenue',
#                 'title': 'High Value Client',
#                 'description': f'Generated KES {self.client.lifetime_value:,.0f} in lifetime value',
#                 'priority': 'high'
#             })
        
#         # Usage insights
#         if self.client.avg_monthly_data_gb >= Decimal('150.00'):
#             insights.append({
#                 'type': 'usage',
#                 'title': 'Heavy Data User',
#                 'description': f'Uses {self.client.avg_monthly_data_gb:.0f} GB monthly on average',
#                 'priority': 'medium'
#             })
        
#         # Risk insights
#         if self.client.churn_risk_score >= Decimal('7.0'):
#             insights.append({
#                 'type': 'risk',
#                 'title': 'Churn Risk Detected',
#                 'description': 'High probability of churning soon',
#                 'priority': 'critical'
#             })
        
#         # Hotspot specific insights
#         if self.client.connection_type == 'hotspot':
#             if self.client.payment_abandonment_rate > 50:
#                 insights.append({
#                     'type': 'conversion',
#                     'title': 'Frequent Payment Abandonment',
#                     'description': f'{self.client.payment_abandonment_rate:.0f}% abandonment rate',
#                     'priority': 'high'
#                 })
            
#             if self.client.hotspot_sessions > 20:
#                 insights.append({
#                     'type': 'engagement',
#                     'title': 'Frequent Hotspot User',
#                     'description': f'Used hotspot {self.client.hotspot_sessions} times',
#                     'priority': 'medium'
#                 })
        
#         # Payment insights
#         if self.client.days_since_last_payment > 7:
#             insights.append({
#                 'type': 'payment',
#                 'title': 'Payment Overdue',
#                 'description': f'{self.client.days_since_last_payment} days since last payment',
#                 'priority': 'high'
#             })
        
#         return insights
    
#     def generate_recommendations(self):
#         """Generate actionable recommendations - Business Logic"""
#         recommendations = []
        
#         # Based on revenue segment
#         if self.client.revenue_segment == 'premium':
#             recommendations.append({
#                 'action': 'assign_account_manager',
#                 'title': 'Assign Dedicated Account Manager',
#                 'description': 'High-value client needs personalized service',
#                 'priority': 'high'
#             })
        
#         # Based on churn risk
#         if self.client.churn_risk_score >= Decimal('7.0'):
#             recommendations.append({
#                 'action': 'send_retention_offer',
#                 'title': 'Send Retention Offer',
#                 'description': 'Prevent churn with special discount or bonus',
#                 'priority': 'critical'
#             })
        
#         # Based on usage
#         if self.client.usage_pattern == 'extreme':
#             recommendations.append({
#                 'action': 'upsell_unlimited_plan',
#                 'title': 'Offer Unlimited Plan',
#                 'description': 'Heavy user would benefit from unlimited data',
#                 'priority': 'medium'
#             })
        
#         # Hotspot specific
#         if self.client.connection_type == 'hotspot' and self.client.payment_abandonment_rate > 50:
#             recommendations.append({
#                 'action': 'simplify_payment_flow',
#                 'title': 'Simplify Payment Process',
#                 'description': 'Reduce abandonment with easier payment flow',
#                 'priority': 'high'
#             })
        
#         # Based on payment history
#         if self.client.days_since_last_payment > 14:
#             recommendations.append({
#                 'action': 'send_payment_reminder',
#                 'title': 'Send Payment Reminder',
#                 'description': 'Follow up on overdue payment',
#                 'priority': 'high'
#             })
        
#         return recommendations
    
#     def suggest_next_best_offer(self):
#         """Suggest the next best offer for this client - Business Logic"""
#         # Logic to determine the best offer
#         if self.client.churn_risk_score >= Decimal('7.0'):
#             return {
#                 'type': 'retention_offer',
#                 'name': 'Stay With Us Discount',
#                 'description': '15% discount on next 3 months',
#                 'value': '15%',
#                 'priority': 'critical'
#             }
        
#         elif self.client.usage_pattern in ['heavy', 'extreme']:
#             return {
#                 'type': 'upsell_offer',
#                 'name': 'Unlimited Data Upgrade',
#                 'description': 'Upgrade to unlimited data for 25% more',
#                 'value': '25% increase',
#                 'priority': 'high'
#             }
        
#         elif self.client.revenue_segment in ['high', 'premium']:
#             return {
#                 'type': 'loyalty_reward',
#                 'name': 'VIP Bonus Data',
#                 'description': '50GB bonus data for loyalty',
#                 'value': '50GB',
#                 'priority': 'medium'
#             }
        
#         else:
#             return {
#                 'type': 'standard_offer',
#                 'name': 'Referral Bonus',
#                 'description': 'Get 10% commission for referrals',
#                 'value': '10%',
#                 'priority': 'low'
#             }






"""
Utility functions for client analytics and calculations
Business Logic Only - No Authentication Logic
"""
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q, F
from decimal import Decimal
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


class ClientMetricsCalculator:
    """Calculate comprehensive client metrics - Business Logic Only"""
    
    def __init__(self, client_profile):
        self.client = client_profile
    
    def calculate_churn_risk(self):
        """Calculate churn risk score (0-10) - Business Logic"""
        score = Decimal('0.0')
        
        # Payment history (40% weight)
        if self.client.days_since_last_payment > 30:
            score += 4.0
        elif self.client.days_since_last_payment > 14:
            score += 2.0
        
        # Usage patterns (30% weight)
        if self.client.avg_monthly_data_gb < 5:
            score += 1.5
        
        if self.client.engagement_score < 3:
            score += 1.5
        
        # Support interactions (20% weight)
        from user_management.models.client_model import ClientInteraction
        recent_support = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type__in=['support_ticket', 'payment_failed'],
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if recent_support > 3:
            score += 2.0
        
        # Hotspot specific (10% weight for hotspot users)
        if self.client.connection_type == 'hotspot':
            if self.client.payment_abandonment_rate > 50:
                score += 1.0
        
        return min(Decimal('10.0'), score)
    
    def calculate_engagement_score(self):
        """Calculate engagement score (0-10) - Business Logic"""
        score = Decimal('5.0')  # Base score
        
        # Recent activity (30 days)
        recent_days = 30
        from user_management.models.client_model import ClientInteraction
        recent_interactions = ClientInteraction.objects.filter(
            client=self.client,
            started_at__gte=timezone.now() - timedelta(days=recent_days)
        ).count()
        
        if recent_interactions > 20:
            score += 2.0
        elif recent_interactions > 10:
            score += 1.0
        elif recent_interactions < 3:
            score -= 1.0
        
        # Usage consistency
        if self.client.avg_monthly_data_gb > 50:
            score += 1.0
        
        # Payment consistency
        if self.client.renewal_rate > 90:
            score += 1.0
        
        # Support interactions (negative impact)
        support_tickets = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type='support_ticket',
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if support_tickets > 5:
            score -= 1.5
        
        return max(Decimal('0.0'), min(Decimal('10.0'), score))
    
    def calculate_satisfaction_score(self):
        """Calculate satisfaction score based on various factors"""
        score = Decimal('7.0')  # Base assumption
        
        # Reduce for recent issues
        from user_management.models.client_model import ClientInteraction
        recent_issues = ClientInteraction.objects.filter(
            client=self.client,
            outcome='failure',
            started_at__gte=timezone.now() - timedelta(days=14)
        ).count()
        
        if recent_issues > 0:
            score -= min(Decimal('3.0'), Decimal(recent_issues) * Decimal('0.5'))
        
        # Increase for successful payments and low support
        successful_payments = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type='payment_success',
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if successful_payments >= 2:
            score += Decimal('1.0')
        
        return max(Decimal('0.0'), min(Decimal('10.0'), score))
    
    def determine_revenue_segment(self):
        """Determine revenue segment based on LTV - Business Logic"""
        ltv = self.client.lifetime_value
        
        if ltv >= Decimal('50000.00'):
            return 'premium'
        elif ltv >= Decimal('20000.00'):
            return 'high'
        elif ltv >= Decimal('5000.00'):
            return 'medium'
        else:
            return 'low'
    
    def determine_usage_pattern(self):
        """Determine usage pattern based on data consumption"""
        avg_monthly = self.client.avg_monthly_data_gb
        
        if avg_monthly >= Decimal('200.00'):
            return 'extreme'
        elif avg_monthly >= Decimal('100.00'):
            return 'heavy'
        elif avg_monthly >= Decimal('30.00'):
            return 'regular'
        else:
            return 'casual'
    
    def generate_behavior_tags(self):
        """Generate behavioral tags for the client - Business Logic"""
        tags = []
        
        # Revenue based tags
        if self.client.lifetime_value >= Decimal('10000.00'):
            tags.append('high_value')
        elif self.client.lifetime_value < Decimal('1000.00'):
            tags.append('low_value')
        
        # Usage based tags
        if self.client.avg_monthly_data_gb >= Decimal('100.00'):
            tags.append('heavy_user')
        elif self.client.avg_monthly_data_gb < Decimal('10.00'):
            tags.append('light_user')
        
        # Payment behavior
        if self.client.days_since_last_payment > 14:
            tags.append('late_payer')
        if self.client.renewal_rate > 95:
            tags.append('loyal')
        
        # Hotspot specific
        if self.client.connection_type == 'hotspot':
            tags.append('hotspot_user')
            if self.client.payment_abandonment_rate > 50:
                tags.append('payment_abandoner')
            if self.client.hotspot_sessions > 10:
                tags.append('frequent_hotspot')
        
        # PPPoE specific
        if self.client.connection_type == 'pppoe':
            tags.append('pppoe_user')
            if self.client.days_active > 180:
                tags.append('long_term')
        
        # Risk assessment
        if self.client.churn_risk_score >= Decimal('7.0'):
            tags.append('at_risk')
        
        # Device usage
        if self.client.devices_count > 3:
            tags.append('multi_device')
        
        return tags
    
    def generate_insights(self):
        """Generate automated insights about the client - Business Logic"""
        insights = []
        
        # Revenue insights
        if self.client.lifetime_value >= Decimal('20000.00'):
            insights.append({
                'type': 'revenue',
                'title': 'High Value Client',
                'description': f'Generated KES {self.client.lifetime_value:,.0f} in lifetime value',
                'priority': 'high'
            })
        
        # Usage insights
        if self.client.avg_monthly_data_gb >= Decimal('150.00'):
            insights.append({
                'type': 'usage',
                'title': 'Heavy Data User',
                'description': f'Uses {self.client.avg_monthly_data_gb:.0f} GB monthly on average',
                'priority': 'medium'
            })
        
        # Risk insights
        if self.client.churn_risk_score >= Decimal('7.0'):
            insights.append({
                'type': 'risk',
                'title': 'Churn Risk Detected',
                'description': 'High probability of churning soon',
                'priority': 'critical'
            })
        
        # Hotspot specific insights
        if self.client.connection_type == 'hotspot':
            if self.client.payment_abandonment_rate > 50:
                insights.append({
                    'type': 'conversion',
                    'title': 'Frequent Payment Abandonment',
                    'description': f'{self.client.payment_abandonment_rate:.0f}% abandonment rate',
                    'priority': 'high'
                })
            
            if self.client.hotspot_sessions > 20:
                insights.append({
                    'type': 'engagement',
                    'title': 'Frequent Hotspot User',
                    'description': f'Used hotspot {self.client.hotspot_sessions} times',
                    'priority': 'medium'
                })
        
        # Payment insights
        if self.client.days_since_last_payment > 7:
            insights.append({
                'type': 'payment',
                'title': 'Payment Overdue',
                'description': f'{self.client.days_since_last_payment} days since last payment',
                'priority': 'high'
            })
        
        return insights
    
    def generate_recommendations(self):
        """Generate actionable recommendations - Business Logic"""
        recommendations = []
        
        # Based on revenue segment
        if self.client.revenue_segment == 'premium':
            recommendations.append({
                'action': 'assign_account_manager',
                'title': 'Assign Dedicated Account Manager',
                'description': 'High-value client needs personalized service',
                'priority': 'high'
            })
        
        # Based on churn risk
        if self.client.churn_risk_score >= Decimal('7.0'):
            recommendations.append({
                'action': 'send_retention_offer',
                'title': 'Send Retention Offer',
                'description': 'Prevent churn with special discount or bonus',
                'priority': 'critical'
            })
        
        # Based on usage
        if self.client.usage_pattern == 'extreme':
            recommendations.append({
                'action': 'upsell_unlimited_plan',
                'title': 'Offer Unlimited Plan',
                'description': 'Heavy user would benefit from unlimited data',
                'priority': 'medium'
            })
        
        # Hotspot specific
        if self.client.connection_type == 'hotspot' and self.client.payment_abandonment_rate > 50:
            recommendations.append({
                'action': 'simplify_payment_flow',
                'title': 'Simplify Payment Process',
                'description': 'Reduce abandonment with easier payment flow',
                'priority': 'high'
            })
        
        # Based on payment history
        if self.client.days_since_last_payment > 14:
            recommendations.append({
                'action': 'send_payment_reminder',
                'title': 'Send Payment Reminder',
                'description': 'Follow up on overdue payment',
                'priority': 'high'
            })
        
        return recommendations
    
    def suggest_next_best_offer(self):
        """Suggest the next best offer for this client - Business Logic"""
        # Logic to determine the best offer
        if self.client.churn_risk_score >= Decimal('7.0'):
            return {
                'type': 'retention_offer',
                'name': 'Stay With Us Discount',
                'description': '15% discount on next 3 months',
                'value': '15%',
                'priority': 'critical'
            }
        
        elif self.client.usage_pattern in ['heavy', 'extreme']:
            return {
                'type': 'upsell_offer',
                'name': 'Unlimited Data Upgrade',
                'description': 'Upgrade to unlimited data for 25% more',
                'value': '25% increase',
                'priority': 'high'
            }
        
        elif self.client.revenue_segment in ['high', 'premium']:
            return {
                'type': 'loyalty_reward',
                'name': 'VIP Bonus Data',
                'description': '50GB bonus data for loyalty',
                'value': '50GB',
                'priority': 'medium'
            }
        
        else:
            return {
                'type': 'standard_offer',
                'name': 'Referral Bonus',
                'description': 'Get 10% commission for referrals',
                'value': '10%',
                'priority': 'low'
            }