"""
Celery tasks for async processing in User Management
"""
import logging
from celery import shared_task
from django.utils import timezone

from user_management.models.client_model import ClientProfile
from user_management.utils.client_utils import ClientMetricsCalculator

logger = logging.getLogger(__name__)


@shared_task
def update_client_metrics_task(client_id):
    """Async task to update client metrics"""
    try:
        client = ClientProfile.objects.get(id=client_id)
        calculator = ClientMetricsCalculator(client)
        
        # Update all calculated fields
        updates = {
            'churn_risk_score': calculator.calculate_churn_risk(),
            'engagement_score': calculator.calculate_engagement_score(),
            'satisfaction_score': calculator.calculate_satisfaction_score(),
            'revenue_segment': calculator.determine_revenue_segment(),
            'usage_pattern': calculator.determine_usage_pattern(),
            'behavior_tags': calculator.generate_behavior_tags(),
            'insights': calculator.generate_insights(),
            'recommendations': calculator.generate_recommendations(),
            'next_best_offer': calculator.suggest_next_best_offer(),
            'updated_at': timezone.now()
        }
        
        ClientProfile.objects.filter(id=client_id).update(**updates)
        logger.info(f"Async metrics updated for client {client_id}")
        
    except ClientProfile.DoesNotExist:
        logger.error(f"Client not found for metrics update: {client_id}")
    except Exception as e:
        logger.error(f"Error updating client metrics async: {str(e)}")


@shared_task
def batch_update_client_metrics():
    """Batch update metrics for all clients"""
    try:
        client_ids = ClientProfile.objects.values_list('id', flat=True)
        
        for client_id in client_ids:
            update_client_metrics_task.delay(client_id)
        
        logger.info(f"Batch metrics update queued for {len(client_ids)} clients")
        
    except Exception as e:
        logger.error(f"Error queueing batch metrics update: {str(e)}")