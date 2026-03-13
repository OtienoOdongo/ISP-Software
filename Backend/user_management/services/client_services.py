




# """
# Service Layer for Business Logic Operations
# Handles communication with Authentication app via signals
# """
# import logging
# from django.utils import timezone
# from django.db import transaction
# from django.core.cache import cache
# from decimal import Decimal

# from user_management.models.client_model import ClientProfile, ClientInteraction
# from user_management.utils.client_utils import ClientMetricsCalculator

# logger = logging.getLogger(__name__)


# class ClientOnboardingService:
#     """Service for client onboarding business logic"""
    
#     @staticmethod
#     def onboard_pppoe_client(user_account, client_data):
#         """Onboard PPPoE client - Business Logic Only"""
#         try:
#             with transaction.atomic():
#                 # Create business profile
#                 client_profile = ClientProfile.objects.create(
#                     user=user_account,
#                     client_type=client_data.get('client_type', 'residential'),
#                     location=client_data.get('location', {}),
#                     customer_since=timezone.now()
#                 )
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client_profile,
#                     interaction_type='profile_update',
#                     action='PPPoE Client Onboarded',
#                     description=f"PPPoE client onboarded via {client_data.get('source', 'system')}",
#                     outcome='success',
#                     started_at=timezone.now(),
#                     completed_at=timezone.now()
#                 )
                
#                 logger.info(f"PPPoE client onboarded: {user_account.username}")
#                 return client_profile
                
#         except Exception as e:
#             logger.error(f"Error onboarding PPPoE client: {e}")
#             raise
    
#     @staticmethod
#     def onboard_hotspot_client(user_account):
#         """Onboard Hotspot client - Business Logic Only"""
#         try:
#             with transaction.atomic():
#                 # Create business profile
#                 client_profile = ClientProfile.objects.create(
#                     user=user_account,
#                     client_type='residential',
#                     customer_since=timezone.now()
#                 )
                
#                 logger.info(f"Hotspot client onboarded: {user_account.username}")
#                 return client_profile
                
#         except Exception as e:
#             logger.error(f"Error onboarding hotspot client: {e}")
#             raise


# class AnalyticsService:
#     """Service for analytics operations - Business Logic Only"""
    
#     @staticmethod
#     def update_client_metrics(client_profile):
#         """Update all metrics for a client"""
#         calculator = ClientMetricsCalculator(client_profile)
        
#         client_profile.churn_risk_score = calculator.calculate_churn_risk()
#         client_profile.engagement_score = calculator.calculate_engagement_score()
#         client_profile.satisfaction_score = calculator.calculate_satisfaction_score()
#         client_profile.revenue_segment = calculator.determine_revenue_segment()
#         client_profile.usage_pattern = calculator.determine_usage_pattern()
#         client_profile.behavior_tags = calculator.generate_behavior_tags()
#         client_profile.insights = calculator.generate_insights()
#         client_profile.recommendations = calculator.generate_recommendations()
#         client_profile.next_best_offer = calculator.suggest_next_best_offer()
        
#         client_profile.save()
#         return client_profile
    
#     @staticmethod
#     def get_client_insights(client_profile):
#         """Get comprehensive insights for a client"""
#         calculator = ClientMetricsCalculator(client_profile)
        
#         return {
#             'metrics': {
#                 'churn_risk': float(client_profile.churn_risk_score),
#                 'engagement': float(client_profile.engagement_score),
#                 'satisfaction': float(client_profile.satisfaction_score),
#                 'revenue_segment': client_profile.revenue_segment,
#                 'usage_pattern': client_profile.usage_pattern
#             },
#             'insights': calculator.generate_insights(),
#             'recommendations': calculator.generate_recommendations(),
#             'next_best_offer': calculator.suggest_next_best_offer()
#         }









"""
Service Layer for Business Logic Operations
Handles communication with Authentication app via signals
"""
import logging
from django.utils import timezone
from django.db import transaction
from decimal import Decimal

from user_management.models.client_model import ClientProfile, ClientInteraction
from user_management.utils.client_utils import ClientMetricsCalculator

logger = logging.getLogger(__name__)


class ClientOnboardingService:
    """Service for client onboarding business logic"""
    
    @staticmethod
    def onboard_pppoe_client(user_account, client_data):
        """Onboard PPPoE client - Business Logic Only"""
        try:
            with transaction.atomic():
                # Create business profile
                client_profile = ClientProfile.objects.create(
                    user=user_account,
                    client_type=client_data.get('client_type', 'residential'),
                    location=client_data.get('location', {}),
                    customer_since=timezone.now()
                )
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client_profile,
                    interaction_type='profile_update',
                    action='PPPoE Client Onboarded',
                    description=f"PPPoE client onboarded via {client_data.get('source', 'system')}",
                    outcome='success',
                    started_at=timezone.now(),
                    completed_at=timezone.now()
                )
                
                logger.info(f"PPPoE client onboarded: {user_account.username}")
                return client_profile
                
        except Exception as e:
            logger.error(f"Error onboarding PPPoE client: {e}")
            raise
    
    @staticmethod
    def onboard_hotspot_client(user_account):
        """Onboard Hotspot client - Business Logic Only"""
        try:
            with transaction.atomic():
                # Create business profile
                client_profile = ClientProfile.objects.create(
                    user=user_account,
                    client_type='residential',
                    customer_since=timezone.now()
                )
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client_profile,
                    interaction_type='profile_update',
                    action='Hotspot Client Onboarded',
                    description='Hotspot client onboarded via signal',
                    outcome='success',
                    started_at=timezone.now(),
                    completed_at=timezone.now()
                )
                
                logger.info(f"Hotspot client onboarded: {user_account.username}")
                return client_profile
                
        except Exception as e:
            logger.error(f"Error onboarding hotspot client: {e}")
            raise


class AnalyticsService:
    """Service for analytics operations - Business Logic Only"""
    
    @staticmethod
    def update_client_metrics(client_profile):
        """Update all metrics for a client"""
        calculator = ClientMetricsCalculator(client_profile)
        
        client_profile.churn_risk_score = calculator.calculate_churn_risk()
        client_profile.engagement_score = calculator.calculate_engagement_score()
        client_profile.satisfaction_score = calculator.calculate_satisfaction_score()
        client_profile.revenue_segment = calculator.determine_revenue_segment()
        client_profile.usage_pattern = calculator.determine_usage_pattern()
        client_profile.behavior_tags = calculator.generate_behavior_tags()
        client_profile.insights = calculator.generate_insights()
        client_profile.recommendations = calculator.generate_recommendations()
        client_profile.next_best_offer = calculator.suggest_next_best_offer()
        
        client_profile.save()
        return client_profile
    
    @staticmethod
    def get_client_insights(client_profile):
        """Get comprehensive insights for a client"""
        calculator = ClientMetricsCalculator(client_profile)
        
        return {
            'metrics': {
                'churn_risk': float(client_profile.churn_risk_score),
                'engagement': float(client_profile.engagement_score),
                'satisfaction': float(client_profile.satisfaction_score),
                'revenue_segment': client_profile.revenue_segment,
                'usage_pattern': client_profile.usage_pattern
            },
            'insights': calculator.generate_insights(),
            'recommendations': calculator.generate_recommendations(),
            'next_best_offer': calculator.suggest_next_best_offer()
        }