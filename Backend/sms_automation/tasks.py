"""
SMS Automation Celery Tasks
Background tasks for SMS processing
"""
import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from django.core.cache import cache

from sms_automation.models.sms_automation_model import (
    SMSMessage, SMSQueue, SMSGatewayConfig,
    SMSAnalytics, SMSAutomationRule
)
from sms_automation.services.sms_service import SMSService, SMSDeliveryLog

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_sms_queue(self, batch_size=100):
    """Process SMS queue in background"""
    try:
        sms_service = SMSService()
        results = sms_service.process_queue_batch(batch_size)
        
        logger.info(
            f"Queue processing complete: {results['processed']} processed, "
            f"{results['failed']} failed"
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Queue processing failed: {str(e)}")
        self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def process_scheduled_messages(self, limit=50):
    """Process scheduled messages in background"""
    try:
        sms_service = SMSService()
        results = sms_service.process_scheduled_messages(limit)
        
        logger.info(
            f"Scheduled messages processed: {results['processed']}/{results['total']}"
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Scheduled messages processing failed: {str(e)}")
        self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def process_retry_messages(self, limit=50):
    """Process retry messages in background"""
    try:
        sms_service = SMSService()
        results = sms_service.process_retry_messages(limit)
        
        logger.info(
            f"Retry messages processed: {results['processed']}/{results['total']}"
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Retry messages processing failed: {str(e)}")
        self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def update_daily_analytics(self, date=None):
    """Update daily SMS analytics"""
    try:
        if not date:
            date = timezone.now().date() - timedelta(days=1)  # Yesterday
        
        analytics = SMSAnalytics.update_daily_analytics(date)
        
        logger.info(f"Analytics updated for {date}: {analytics.total_messages} messages")
        
        return {
            'date': date.isoformat(),
            'analytics_id': str(analytics.id),
            'total_messages': analytics.total_messages,
            'delivery_rate': analytics.delivery_rate
        }
        
    except Exception as e:
        logger.error(f"Analytics update failed for {date}: {str(e)}")
        self.retry(countdown=300, exc=e)  # Retry after 5 minutes


@shared_task(bind=True, max_retries=3)
def check_gateway_health(self):
    """Check health of all SMS gateways"""
    try:
        sms_service = SMSService()
        gateways = SMSGatewayConfig.objects.filter(is_active=True)
        
        results = []
        for gateway in gateways:
            try:
                status = sms_service.test_gateway_connection(gateway)
                results.append({
                    'gateway_id': gateway.id,
                    'gateway_name': gateway.name,
                    'success': status['success'],
                    'balance': status.get('balance', 0),
                    'error': status.get('error')
                })
                
                # Update gateway status
                if status['success']:
                    gateway.is_online = True
                    gateway.balance = status.get('balance', 0)
                    gateway.last_balance_check = timezone.now()
                else:
                    gateway.is_online = False
                
                gateway.last_online_check = timezone.now()
                gateway.save()
                
            except Exception as e:
                logger.error(f"Gateway health check failed for {gateway.name}: {str(e)}")
                results.append({
                    'gateway_id': gateway.id,
                    'gateway_name': gateway.name,
                    'success': False,
                    'error': str(e)
                })
        
        # Cache results
        cache.set('gateway_health_check', results, timeout=1800)  # 30 minutes
        
        logger.info(f"Gateway health check complete: {len([r for r in results if r['success']])}/{len(results)} healthy")
        
        return results
        
    except Exception as e:
        logger.error(f"Gateway health check failed: {str(e)}")
        self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def cleanup_old_messages(self, days_to_keep=90):
    """Clean up old SMS messages and logs"""
    try:
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        
        # Archive old messages (optional - implement based on your needs)
        # For now, just log the cleanup
        
        # Count messages to be archived
        old_messages = SMSMessage.objects.filter(
            created_at__lt=cutoff_date,
            status__in=['sent', 'delivered', 'failed', 'cancelled']
        )
        
        count = old_messages.count()
        
        # In production, you might want to archive instead of delete
        # old_messages.archive()  # Implement archive method
        
        logger.info(f"Found {count} old messages for cleanup (older than {days_to_keep} days)")
        
        # Clean up old delivery logs
        old_logs = SMSDeliveryLog.objects.filter(
            event_time__lt=cutoff_date
        )
        logs_count = old_logs.count()
        
        # In production, archive logs as well
        # old_logs.delete()  # Be careful with deletion
        
        logger.info(f"Found {logs_count} old delivery logs for cleanup")
        
        # Clean up old queue entries
        old_queue = SMSQueue.objects.filter(
            queued_at__lt=cutoff_date,
            status__in=['completed', 'failed']
        )
        queue_count = old_queue.count()
        
        # old_queue.delete()  # Be careful with deletion
        
        logger.info(f"Found {queue_count} old queue entries for cleanup")
        
        return {
            'messages': count,
            'logs': logs_count,
            'queue_entries': queue_count,
            'cutoff_date': cutoff_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        self.retry(countdown=3600, exc=e)  # Retry after 1 hour


@shared_task(bind=True, max_retries=3)
def send_bulk_sms(self, phone_numbers, message, template_id=None, **kwargs):
    """Send bulk SMS in background"""
    try:
        sms_service = SMSService()
        
        # Get template if provided
        template = None
        if template_id:
            from .models import SMSTemplate
            try:
                template = SMSTemplate.objects.get(id=template_id, is_active=True)
            except SMSTemplate.DoesNotExist:
                logger.error(f"Template {template_id} not found")
                return {'success': False, 'error': 'Template not found'}
        
        # Create messages
        results = []
        successful = []
        
        for phone in phone_numbers:
            try:
                message_data = {
                    'phone_number': phone,
                    'message': message,
                    'template': template,
                    'priority': kwargs.get('priority', 'normal'),
                    'source': 'bulk_task',
                    'metadata': {
                        'bulk_task_id': self.request.id,
                        'total_recipients': len(phone_numbers)
                    }
                }
                
                # Add gateway if specified
                if 'gateway_id' in kwargs:
                    from .models import SMSGatewayConfig
                    try:
                        gateway = SMSGatewayConfig.objects.get(id=kwargs['gateway_id'])
                        message_data['gateway'] = gateway
                    except SMSGatewayConfig.DoesNotExist:
                        pass
                
                # Create message
                sms = sms_service.create_sms_message(**message_data)
                
                results.append({
                    'phone': phone,
                    'success': True,
                    'message_id': str(sms.id),
                    'status': sms.status
                })
                successful.append(sms)
                
            except Exception as e:
                results.append({
                    'phone': phone,
                    'success': False,
                    'error': str(e)
                })
        
        logger.info(f"Bulk SMS task complete: {len(successful)}/{len(phone_numbers)} successful")
        
        return {
            'success': True,
            'total': len(phone_numbers),
            'successful': len(successful),
            'failed': len(phone_numbers) - len(successful),
            'results': results,
            'task_id': self.request.id
        }
        
    except Exception as e:
        logger.error(f"Bulk SMS task failed: {str(e)}")
        self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=3)
def execute_automation_rule(self, rule_id, context, client_id=None, trigger_event='scheduled'):
    """Execute automation rule in background"""
    try:
        from .models import SMSAutomationRule, ClientProfile
        
        # Get rule
        try:
            rule = SMSAutomationRule.objects.get(id=rule_id, is_active=True)
        except SMSAutomationRule.DoesNotExist:
            logger.error(f"Rule {rule_id} not found or inactive")
            return {'success': False, 'error': 'Rule not found'}
        
        # Get client if provided
        client = None
        if client_id:
            try:
                client = ClientProfile.objects.get(id=client_id)
            except ClientProfile.DoesNotExist:
                pass
        
        # Execute rule
        sms_service = SMSService()
        sms = rule.execute(context, client=client, trigger_event=trigger_event)
        
        if sms:
            logger.info(f"Rule {rule_id} executed successfully, SMS ID: {sms.id}")
            return {
                'success': True,
                'rule_id': rule_id,
                'rule_name': rule.name,
                'sms_id': str(sms.id),
                'status': sms.status
            }
        else:
            logger.warning(f"Rule {rule_id} execution failed")
            return {
                'success': False,
                'rule_id': rule_id,
                'error': 'Rule execution failed'
            }
        
    except Exception as e:
        logger.error(f"Rule execution task failed: {str(e)}")
        self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def process_scheduled_rules(self):
    """Process scheduled automation rules"""
    try:
        from django_crontab.models import CronJobLog
        
        now = timezone.now()
        scheduled_rules = SMSAutomationRule.objects.filter(
            is_active=True,
            schedule_cron__isnull=False,
            schedule_cron__ne=''
        )
        
        executed = 0
        
        for rule in scheduled_rules:
            try:
                # Check if rule should run based on cron schedule
                # This is simplified - you might want to use a proper cron parser
                if self._should_run_cron(rule.schedule_cron, now):
                    # Execute rule with default context
                    context = {
                        'scheduled_execution': True,
                        'execution_time': now.isoformat()
                    }
                    
                    sms = rule.execute(context, trigger_event='scheduled')
                    if sms:
                        executed += 1
                        logger.info(f"Scheduled rule {rule.id} executed, SMS ID: {sms.id}")
                        
            except Exception as e:
                logger.error(f"Failed to execute scheduled rule {rule.id}: {str(e)}")
        
        logger.info(f"Scheduled rules processed: {executed}/{scheduled_rules.count()}")
        
        return {
            'executed': executed,
            'total': scheduled_rules.count(),
            'timestamp': now.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Scheduled rules processing failed: {str(e)}")
        self.retry(countdown=300, exc=e)
    
    def _should_run_cron(self, cron_expression, now):
        """Check if cron expression matches current time"""
        # Simplified cron checker - in production use a proper cron parser
        # This is just a placeholder implementation
        try:
            from crontab import CronTab
            
            cron = CronTab(cron_expression)
            return cron.test(now)
        except ImportError:
            # Fallback simple check
            parts = cron_expression.split()
            if len(parts) == 5:
                minute, hour, day, month, weekday = parts
                
                # Very basic check - not production ready
                if minute != '*' and int(minute) != now.minute:
                    return False
                if hour != '*' and int(hour) != now.hour:
                    return False
                # ... add more checks as needed
                
            return True