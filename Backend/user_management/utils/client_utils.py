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
Updated Utility functions with Internet Plan Integration
Business Logic Only - No Authentication Logic
"""
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q, F
from decimal import Decimal
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


class ClientMetricsCalculator:
    """Calculate comprehensive client metrics with Plan Integration"""
    
    def __init__(self, client_profile):
        self.client = client_profile
    
    def calculate_churn_risk(self):
        """Calculate churn risk score (0-10) with plan considerations"""
        score = Decimal('0.0')
        
        # Payment history (30% weight)
        if self.client.days_since_last_payment > 30:
            score += 3.0
        elif self.client.days_since_last_payment > 14:
            score += 1.5
        
        # Plan status (25% weight)
        subscription = self.client.active_plan_subscription()
        if subscription:
            # Check plan expiration
            days_until_expiry = (subscription.end_date - timezone.now()).days
            if days_until_expiry <= 3:
                score += 2.5
            elif days_until_expiry <= 7:
                score += 1.5
            
            # Check data utilization
            if subscription.data_limit_gb > 0:
                utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100
                if utilization >= 90:
                    score += 1.0
                elif utilization >= 110:  # Over limit
                    score += 1.5
        else:
            # No active plan - higher churn risk
            score += 2.0
        
        # Usage patterns (20% weight)
        if self.client.avg_monthly_data_gb < 5:
            score += 1.0
        
        if self.client.engagement_score < 3:
            score += 1.0
        
        # Support interactions (15% weight)
        from user_management.models.client_model import ClientInteraction
        recent_support = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type__in=['support_ticket', 'payment_failed'],
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if recent_support > 3:
            score += 1.5
        
        # Hotspot specific (10% weight for hotspot users)
        if self.client.connection_type == 'hotspot':
            if self.client.payment_abandonment_rate > 50:
                score += 1.0
        
        return min(Decimal('10.0'), score)
    
    def calculate_engagement_score(self):
        """Calculate engagement score (0-10) with plan usage"""
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
        
        # Plan usage consistency (25% weight)
        subscription = self.client.active_plan_subscription()
        if subscription:
            # Regular usage of plan
            days_active = (timezone.now().date() - subscription.start_date.date()).days + 1
            if days_active > 7:
                avg_daily_usage = subscription.data_used_gb / Decimal(str(days_active))
                if avg_daily_usage > Decimal('0.5'):  # More than 0.5GB daily
                    score += 1.5
                
                # Consistent usage pattern
                from user_management.models.client_model import ClientAnalyticsSnapshot
                recent_snapshots = ClientAnalyticsSnapshot.objects.filter(
                    client=self.client,
                    date__gte=timezone.now().date() - timedelta(days=7)
                ).count()
                
                if recent_snapshots >= 5:
                    score += 1.0
        else:
            # No active plan - lower engagement
            score -= 1.0
        
        # Usage consistency (20% weight)
        if self.client.avg_monthly_data_gb > 50:
            score += 1.0
        
        # Payment consistency (15% weight)
        if self.client.renewal_rate > 90:
            score += 1.0
        
        # Support interactions (10% weight, negative impact)
        support_tickets = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type='support_ticket',
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if support_tickets > 5:
            score -= 1.0
        
        return max(Decimal('0.0'), min(Decimal('10.0'), score))
    
    def calculate_satisfaction_score(self):
        """Calculate satisfaction score based on various factors including plan"""
        score = Decimal('7.0')  # Base assumption
        
        # Plan satisfaction (30% weight)
        subscription = self.client.active_plan_subscription()
        if subscription:
            # Check if plan meets needs
            utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100 if subscription.data_limit_gb > 0 else 0
            
            if 20 <= utilization <= 80:  # Optimal utilization
                score += Decimal('1.0')
            elif utilization > 95:  # Constantly hitting limit
                score -= Decimal('1.5')
            elif utilization < 10:  # Underutilizing
                score -= Decimal('0.5')
            
            # Check plan value for money
            if hasattr(subscription.internet_plan, 'price'):
                price_per_gb = subscription.internet_plan.price / subscription.data_limit_gb if subscription.data_limit_gb > 0 else 0
                if price_per_gb < Decimal('10.00'):  # Good value
                    score += Decimal('0.5')
        
        # Reduce for recent issues (25% weight)
        from user_management.models.client_model import ClientInteraction
        recent_issues = ClientInteraction.objects.filter(
            client=self.client,
            outcome='failure',
            started_at__gte=timezone.now() - timedelta(days=14)
        ).count()
        
        if recent_issues > 0:
            score -= min(Decimal('3.0'), Decimal(recent_issues) * Decimal('0.5'))
        
        # Increase for successful payments (20% weight)
        successful_payments = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type='payment_success',
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if successful_payments >= 2:
            score += Decimal('1.0')
        
        # Speed and reliability (15% weight)
        # This would come from network monitoring data
        # For now, we'll use a placeholder
        
        # Support responsiveness (10% weight)
        resolved_tickets = ClientInteraction.objects.filter(
            client=self.client,
            interaction_type='support_resolved',
            started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        if resolved_tickets > 0:
            score += Decimal('0.5')
        
        return max(Decimal('0.0'), min(Decimal('10.0'), score))
    
    def determine_revenue_segment(self):
        """Determine revenue segment based on LTV and plan value"""
        ltv = self.client.lifetime_value
        
        # Adjust for current plan value
        subscription = self.client.active_plan_subscription()
        if subscription and hasattr(subscription.internet_plan, 'price'):
            plan_value = subscription.internet_plan.price
            adjusted_ltv = ltv + (plan_value * Decimal('3'))  # Assume 3 months of current plan value
        else:
            adjusted_ltv = ltv
        
        if adjusted_ltv >= Decimal('50000.00'):
            return 'premium'
        elif adjusted_ltv >= Decimal('20000.00'):
            return 'high'
        elif adjusted_ltv >= Decimal('5000.00'):
            return 'medium'
        else:
            return 'low'
    
    def determine_usage_pattern(self):
        """Determine usage pattern based on data consumption and plan limits"""
        avg_monthly = self.client.avg_monthly_data_gb
        
        # Adjust based on plan limits
        subscription = self.client.active_plan_subscription()
        if subscription and subscription.data_limit_gb > 0:
            utilization = (avg_monthly / subscription.data_limit_gb) * 100
            
            if utilization >= 150:
                return 'extreme'
            elif utilization >= 100:
                return 'heavy'
            elif utilization >= 50:
                return 'regular'
            else:
                return 'casual'
        else:
            # No plan or unlimited plan
            if avg_monthly >= Decimal('200.00'):
                return 'extreme'
            elif avg_monthly >= Decimal('100.00'):
                return 'heavy'
            elif avg_monthly >= Decimal('30.00'):
                return 'regular'
            else:
                return 'casual'
    
    def generate_behavior_tags(self):
        """Generate behavioral tags for the client with plan context"""
        tags = []
        
        # Revenue based tags
        if self.client.lifetime_value >= Decimal('10000.00'):
            tags.append('high_value')
        elif self.client.lifetime_value < Decimal('1000.00'):
            tags.append('low_value')
        
        # Plan based tags
        subscription = self.client.active_plan_subscription()
        if subscription:
            tags.append('has_active_plan')
            
            # Plan utilization tags
            if subscription.data_limit_gb > 0:
                utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100
                
                if utilization >= 90:
                    tags.append('high_utilization')
                elif utilization <= 20:
                    tags.append('low_utilization')
                
                if subscription.data_used_gb >= subscription.data_limit_gb:
                    tags.append('exceeded_limit')
            
            # Plan value tags
            if hasattr(subscription.internet_plan, 'price'):
                if subscription.internet_plan.price >= Decimal('5000.00'):
                    tags.append('premium_plan')
                elif subscription.internet_plan.price <= Decimal('1000.00'):
                    tags.append('budget_plan')
        else:
            tags.append('no_active_plan')
        
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
        
        # Connection type tags
        if self.client.connection_type == 'hotspot':
            tags.append('hotspot_user')
            if self.client.payment_abandonment_rate > 50:
                tags.append('payment_abandoner')
            if self.client.hotspot_sessions > 10:
                tags.append('frequent_hotspot')
        
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
        """Generate automated insights about the client with plan focus"""
        insights = []
        
        # Plan insights
        subscription = self.client.active_plan_subscription()
        
        if subscription:
            # Utilization insights
            if subscription.data_limit_gb > 0:
                utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100
                
                if utilization >= 90:
                    insights.append({
                        'type': 'plan_utilization',
                        'title': 'High Plan Utilization',
                        'description': f'Using {utilization:.1f}% of {subscription.data_limit_gb}GB data limit',
                        'priority': 'high',
                        'action': 'consider_upgrade'
                    })
                elif utilization <= 20:
                    insights.append({
                        'type': 'plan_utilization',
                        'title': 'Low Plan Utilization',
                        'description': f'Only using {utilization:.1f}% of data limit',
                        'priority': 'medium',
                        'action': 'consider_downgrade'
                    })
            
            # Expiry insights
            days_remaining = (subscription.end_date - timezone.now()).days
            if days_remaining <= 7:
                insights.append({
                    'type': 'plan_expiry',
                    'title': 'Plan Expiring Soon',
                    'description': f'Plan expires in {days_remaining} days',
                    'priority': 'high' if days_remaining <= 3 else 'medium',
                    'action': 'renew_plan'
                })
        
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
                'priority': 'high'
            })
        
        # Referral insights
        if self.client.is_marketer and self.client.total_commission_earned >= Decimal('10000.00'):
            insights.append({
                'type': 'marketing',
                'title': 'Top Performer',
                'description': f'Earned KES {self.client.total_commission_earned:,.0f} in commissions',
                'priority': 'medium'
            })
        
        # Add more insights as needed...
        
        return insights
    
    def generate_recommendations(self):
        """Generate recommended actions for the client based on insights and plan status"""
        recommendations = []
        
        subscription = self.client.active_plan_subscription()
        
        # Plan-related recommendations
        if not subscription:
            recommendations.append({
                'type': 'plan_assignment',
                'title': 'Assign Plan',
                'description': 'Client has no active plan. Recommend assigning based on client type.',
                'priority': 'high',
                'suggested_actions': ['view_available_plans', 'assign_plan']
            })
        else:
            utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100 if subscription.data_limit_gb > 0 else 0
            
            if utilization >= 90:
                recommendations.append({
                    'type': 'plan_upgrade',
                    'title': 'Upgrade Plan',
                    'description': 'High utilization detected. Suggest upgrading to avoid overage.',
                    'priority': 'high',
                    'suggested_actions': ['view_upgrade_options', 'change_plan']
                })
            elif utilization <= 20:
                recommendations.append({
                    'type': 'plan_downgrade',
                    'title': 'Downgrade Plan',
                    'description': 'Low utilization. Consider downgrading to save costs.',
                    'priority': 'medium',
                    'suggested_actions': ['view_downgrade_options', 'change_plan']
                })
            
            days_remaining = (subscription.end_date - timezone.now()).days
            if days_remaining <= 7:
                recommendations.append({
                    'type': 'plan_renewal',
                    'title': 'Renew Plan',
                    'description': f'Plan expires in {days_remaining} days. Recommend renewal.',
                    'priority': 'high' if days_remaining <= 3 else 'medium',
                    'suggested_actions': ['renew_plan']
                })
        
        # Risk-related recommendations
        if self.client.churn_risk_score >= Decimal('7.0'):
            recommendations.append({
                'type': 'retention',
                'title': 'Retention Action',
                'description': 'High churn risk. Send retention offer or contact client.',
                'priority': 'high',
                'suggested_actions': ['send_retention_offer', 'contact_client']
            })
        
        # Marketing recommendations
        if self.client.is_marketer and self.client.total_commission_earned < Decimal('5000.00'):
            recommendations.append({
                'type': 'marketing_training',
                'title': 'Marketing Training',
                'description': 'Low commission earned. Suggest marketing training resources.',
                'priority': 'low',
                'suggested_actions': ['send_marketing_tips']
            })
        
        # General recommendations
        if self.client.days_since_last_payment > 14:
            recommendations.append({
                'type': 'payment_reminder',
                'title': 'Payment Reminder',
                'description': 'Overdue payment. Send reminder notification.',
                'priority': 'medium',
                'suggested_actions': ['send_payment_reminder']
            })
        
        return recommendations
    
    def suggest_next_best_offer(self):
        """Suggest next best offer/plan based on client usage and profile"""
        subscription = self.client.active_plan_subscription()
        
        if not subscription:
            # Suggest starter plan based on client type
            suggested_plan = self._get_starter_plan_for_type(self.client.client_type)
            if suggested_plan:
                return {
                    'type': 'starter_plan',
                    'plan_id': str(suggested_plan.id),
                    'plan_name': suggested_plan.name,
                    'message': f'Recommended starter plan for {self.client.client_type} clients',
                    'estimated_cost': float(suggested_plan.price),
                    'features': suggested_plan.features if hasattr(suggested_plan, 'features') else []
                }
            return {}
        
        # Calculate current utilization
        utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100 if subscription.data_limit_gb > 0 else 0
        
        # Find better plan
        try:
            from internet_plans.models import InternetPlan
            available_plans = InternetPlan.objects.filter(active=True)
            
            if self.client.is_pppoe_client:
                available_plans = available_plans.filter(available_for_pppoe=True)
            elif self.client.is_hotspot_client:
                available_plans = available_plans.filter(available_for_hotspot=True)
            
            suggested_plan = None
            if utilization >= 80:
                # Suggest higher plan
                suggested_plan = available_plans.filter(
                    data_limit_gb__gt=subscription.data_limit_gb,
                    price__lte=subscription.internet_plan.price * Decimal('1.5')  # Up to 50% more expensive
                ).order_by('price').first()
                
                if suggested_plan:
                    return {
                        'type': 'upgrade',
                        'plan_id': str(suggested_plan.id),
                        'plan_name': suggested_plan.name,
                        'message': 'Upgrade to higher data limit plan',
                        'estimated_cost': float(suggested_plan.price),
                        'cost_difference': float(suggested_plan.price - subscription.internet_plan.price),
                        'data_increase': float(suggested_plan.data_limit_gb - subscription.data_limit_gb),
                        'features': suggested_plan.features if hasattr(suggested_plan, 'features') else []
                    }
            elif utilization <= 30:
                # Suggest cheaper plan
                suggested_plan = available_plans.filter(
                    data_limit_gb__gte=subscription.data_limit_gb * Decimal('0.5'),  # At least half the data
                    price__lt=subscription.internet_plan.price
                ).order_by('-price').first()  # Highest price under current
                
                if suggested_plan:
                    return {
                        'type': 'downgrade',
                        'plan_id': str(suggested_plan.id),
                        'plan_name': suggested_plan.name,
                        'message': 'Downgrade to more cost-effective plan',
                        'estimated_cost': float(suggested_plan.price),
                        'savings': float(subscription.internet_plan.price - suggested_plan.price),
                        'data_difference': float(suggested_plan.data_limit_gb - subscription.data_limit_gb),
                        'features': suggested_plan.features if hasattr(suggested_plan, 'features') else []
                    }
            
            # Default: Suggest similar premium plan or add-on
            if not suggested_plan:
                return {
                    'type': 'maintain',
                    'message': 'Current plan is optimal. Consider add-ons for extra features.',
                    'add_ons': []  # Would fetch from service/models
                }
            
        except ImportError:
            logger.warning("InternetPlans app not available for next best offer")
            return {}
        
        return {}
    
    def _get_starter_plan_for_type(self, client_type):
        """Get starter plan recommendation for client type (placeholder logic)"""
        try:
            from internet_plans.models import InternetPlan
            # Example logic - customize based on your plans
            if client_type == 'residential':
                return InternetPlan.objects.filter(active=True, category='Residential', price__lte=Decimal('2000.00')).order_by('price').first()
            elif client_type == 'business':
                return InternetPlan.objects.filter(active=True, category='Business', price__gte=Decimal('5000.00')).order_by('price').first()
            # Add more types...
            return None
        except ImportError:
            return None