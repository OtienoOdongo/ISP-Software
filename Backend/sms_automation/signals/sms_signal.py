"""
SMS Automation Signals - Production Ready
Listens to User Management events and triggers SMS automation
"""
import logging
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete, pre_save
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from user_management.models.client_model import ClientProfile
from payments.models.transaction_log_model import PaymentTransaction
from service_operations.models.subscription_models import Subscription
from sms_automation.models.sms_automation_model import SMSAutomationRule, SMSMessage, SMSTemplate
from sms_automation.services.sms_service import SMSService

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ClientProfile)
def handle_client_profile_changes(sender, instance, created, **kwargs):
    """Handle client profile changes and trigger SMS automation"""
    try:
        if created:
            # Client created
            trigger_welcome_sms(instance)
        else:
            # Client updated - check for specific changes
            check_client_updates(instance)
            
    except Exception as e:
        logger.error(f"Failed to handle client profile changes: {str(e)}")


@receiver(post_save, sender=PaymentTransaction)
def handle_payment_transaction(sender, instance, created, **kwargs):
    """Handle payment transactions and trigger SMS automation"""
    try:
        if not created:
            return
        
        # Payment created
        if instance.status == 'completed':
            trigger_payment_success_sms(instance)
        elif instance.status == 'failed':
            trigger_payment_failed_sms(instance)
            
    except Exception as e:
        logger.error(f"Failed to handle payment transaction: {str(e)}")


@receiver(post_save, sender=Subscription)
def handle_subscription_changes(sender, instance, created, **kwargs):
    """Handle subscription changes and trigger SMS automation"""
    try:
        if created:
            # New subscription
            trigger_subscription_created_sms(instance)
        else:
            # Subscription updated
            check_subscription_updates(instance)
            
    except Exception as e:
        logger.error(f"Failed to handle subscription changes: {str(e)}")


def trigger_welcome_sms(client):
    """Trigger welcome SMS for new client"""
    try:
        # Check if client has phone number
        if not client.phone_number:
            logger.warning(f"Client {client.id} has no phone number for welcome SMS")
            return
        
        # Find welcome automation rules
        rules = SMSAutomationRule.objects.filter(
            rule_type__in=['welcome', 'pppoe_creation', 'hotspot_creation'],
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies to this client
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'username': client.username,
                'email': client.email,
                'client_id': str(client.id),
                'created_date': client.created_at.strftime('%Y-%m-%d'),
                'connection_type': 'PPPoE' if client.is_pppoe_client else 'Hotspot'
            }
            
            # Add plan information if available
            if hasattr(client, 'current_plan'):
                context.update({
                    'plan_name': client.current_plan.name,
                    'plan_price': client.current_plan.price,
                    'data_limit': client.current_plan.data_limit,
                    'speed_limit': client.current_plan.speed_limit
                })
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='client_creation')
            
            if sms:
                logger.info(f"Welcome SMS triggered for client {client.id} via rule {rule.name}")
                
    except Exception as e:
        logger.error(f"Failed to trigger welcome SMS for client {client.id}: {str(e)}")


def trigger_payment_success_sms(payment):
    """Trigger SMS for successful payment"""
    try:
        client = payment.client
        if not client or not client.phone_number:
            return
        
        # Find payment success rules
        rules = SMSAutomationRule.objects.filter(
            rule_type='payment_success',
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'amount': f"{payment.amount:,.2f}",
                'currency': payment.currency,
                'payment_date': payment.created_at.strftime('%Y-%m-%d'),
                'payment_method': payment.payment_method,
                'transaction_id': payment.transaction_id,
                'invoice_number': payment.invoice_number or '',
                'balance_after': f"{payment.balance_after:,.2f}" if payment.balance_after else ''
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='payment_success')
            
            if sms:
                logger.info(f"Payment success SMS triggered for payment {payment.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger payment success SMS: {str(e)}")


def trigger_payment_failed_sms(payment):
    """Trigger SMS for failed payment"""
    try:
        client = payment.client
        if not client or not client.phone_number:
            return
        
        # Find payment failed rules
        rules = SMSAutomationRule.objects.filter(
            rule_type='payment_failed',
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'amount': f"{payment.amount:,.2f}",
                'currency': payment.currency,
                'payment_date': payment.created_at.strftime('%Y-%m-%d'),
                'payment_method': payment.payment_method,
                'failure_reason': payment.failure_reason or 'Unknown',
                'retry_url': f"{settings.SITE_URL}/payments/retry/{payment.id}" if hasattr(settings, 'SITE_URL') else ''
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='payment_failed')
            
            if sms:
                logger.info(f"Payment failed SMS triggered for payment {payment.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger payment failed SMS: {str(e)}")


def trigger_subscription_created_sms(subscription):
    """Trigger SMS for new subscription"""
    try:
        client = subscription.client
        if not client or not client.phone_number:
            return
        
        # Find subscription rules
        rules = SMSAutomationRule.objects.filter(
            rule_type__in=['plan_expiry', 'auto_renewal_reminder'],
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'plan_name': subscription.plan.name if subscription.plan else '',
                'subscription_start': subscription.start_date.strftime('%Y-%m-%d'),
                'subscription_end': subscription.end_date.strftime('%Y-%m-%d'),
                'amount': f"{subscription.amount:,.2f}" if subscription.amount else '',
                'renewal_date': subscription.renewal_date.strftime('%Y-%m-%d') if subscription.renewal_date else '',
                'remaining_days': (subscription.end_date - timezone.now().date()).days if subscription.end_date else 0
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='subscription_created')
            
            if sms:
                logger.info(f"Subscription SMS triggered for subscription {subscription.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger subscription SMS: {str(e)}")


def check_client_updates(client):
    """Check for specific client updates that should trigger SMS"""
    try:
        # Check if tier changed
        if 'tier' in client.get_dirty_fields():
            old_tier = client.get_dirty_fields().get('tier')
            new_tier = client.tier
            
            if old_tier != new_tier:
                trigger_tier_change_sms(client, old_tier, new_tier)
        
        # Check if status changed
        if 'status' in client.get_dirty_fields():
            old_status = client.get_dirty_fields().get('status')
            new_status = client.status
            
            if old_status != new_status:
                if new_status == 'suspended':
                    trigger_account_suspended_sms(client)
                elif new_status == 'active' and old_status == 'suspended':
                    trigger_account_reactivated_sms(client)
                    
    except Exception as e:
        logger.error(f"Failed to check client updates: {str(e)}")


def check_subscription_updates(subscription):
    """Check for subscription updates that should trigger SMS"""
    try:
        # Check if expiry date is approaching
        if subscription.end_date:
            days_until_expiry = (subscription.end_date - timezone.now().date()).days
            
            if 0 < days_until_expiry <= 3:
                trigger_plan_expiry_warning(subscription, days_until_expiry)
        
        # Check auto-renewal
        if subscription.auto_renew:
            if subscription.renewal_date:
                days_until_renewal = (subscription.renewal_date - timezone.now().date()).days
                
                if 0 < days_until_renewal <= 2:
                    trigger_auto_renewal_reminder(subscription, days_until_renewal)
                    
    except Exception as e:
        logger.error(f"Failed to check subscription updates: {str(e)}")


def trigger_tier_change_sms(client, old_tier, new_tier):
    """Trigger SMS for tier change"""
    try:
        if not client.phone_number:
            return
        
        # Find tier change rules
        rules = SMSAutomationRule.objects.filter(
            rule_type__in=['tier_upgrade', 'tier_downgrade'],
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule type matches change direction
            if (new_tier > old_tier and rule.rule_type != 'tier_upgrade') or \
               (new_tier < old_tier and rule.rule_type != 'tier_downgrade'):
                continue
            
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'old_tier': old_tier,
                'new_tier': new_tier,
                'change_date': timezone.now().strftime('%Y-%m-%d'),
                'change_type': 'upgrade' if new_tier > old_tier else 'downgrade'
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='tier_change')
            
            if sms:
                logger.info(f"Tier change SMS triggered for client {client.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger tier change SMS: {str(e)}")


def trigger_account_suspended_sms(client):
    """Trigger SMS for account suspension"""
    try:
        if not client.phone_number:
            return
        
        # Find account suspended rules
        rules = SMSAutomationRule.objects.filter(
            rule_type='account_suspended',
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'suspension_date': timezone.now().strftime('%Y-%m-%d'),
                'suspension_reason': client.suspension_reason or 'Policy violation',
                'support_contact': getattr(settings, 'SUPPORT_CONTACT', '0700123456'),
                'reactivation_url': f"{settings.SITE_URL}/account/reactivate" if hasattr(settings, 'SITE_URL') else ''
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='account_suspended')
            
            if sms:
                logger.info(f"Account suspension SMS triggered for client {client.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger account suspension SMS: {str(e)}")


def trigger_account_reactivated_sms(client):
    """Trigger SMS for account reactivation"""
    try:
        if not client.phone_number:
            return
        
        # Find account reactivated rules
        rules = SMSAutomationRule.objects.filter(
            rule_type='account_reactivated',
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'reactivation_date': timezone.now().strftime('%Y-%m-%d'),
                'support_contact': getattr(settings, 'SUPPORT_CONTACT', '0700123456')
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='account_reactivated')
            
            if sms:
                logger.info(f"Account reactivation SMS triggered for client {client.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger account reactivation SMS: {str(e)}")


def trigger_plan_expiry_warning(subscription, days_remaining):
    """Trigger SMS for plan expiry warning"""
    try:
        client = subscription.client
        if not client or not client.phone_number:
            return
        
        # Find plan expiry rules
        rules = SMSAutomationRule.objects.filter(
            rule_type='plan_expiry',
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'plan_name': subscription.plan.name if subscription.plan else '',
                'expiry_date': subscription.end_date.strftime('%Y-%m-%d'),
                'remaining_days': days_remaining,
                'renewal_amount': f"{subscription.amount:,.2f}" if subscription.amount else '',
                'renewal_url': f"{settings.SITE_URL}/subscriptions/renew/{subscription.id}" if hasattr(settings, 'SITE_URL') else ''
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='plan_expiry_warning')
            
            if sms:
                logger.info(f"Plan expiry warning SMS triggered for subscription {subscription.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger plan expiry warning SMS: {str(e)}")


def trigger_auto_renewal_reminder(subscription, days_until_renewal):
    """Trigger SMS for auto-renewal reminder"""
    try:
        client = subscription.client
        if not client or not client.phone_number:
            return
        
        # Find auto-renewal reminder rules
        rules = SMSAutomationRule.objects.filter(
            rule_type='auto_renewal_reminder',
            is_active=True
        ).select_related('template')
        
        sms_service = SMSService()
        
        for rule in rules:
            # Check if rule applies
            if not rule._passes_filters(client):
                continue
            
            # Prepare context
            context = {
                'client_name': client.username or client.first_name,
                'phone_number': client.phone_number,
                'plan_name': subscription.plan.name if subscription.plan else '',
                'renewal_date': subscription.renewal_date.strftime('%Y-%m-%d'),
                'days_until_renewal': days_until_renewal,
                'renewal_amount': f"{subscription.amount:,.2f}" if subscription.amount else '',
                'payment_method': subscription.payment_method or 'Default',
                'cancel_url': f"{settings.SITE_URL}/subscriptions/cancel-auto-renew/{subscription.id}" if hasattr(settings, 'SITE_URL') else ''
            }
            
            # Execute rule
            sms = rule.execute(context, client=client, trigger_event='auto_renewal_reminder')
            
            if sms:
                logger.info(f"Auto-renewal reminder SMS triggered for subscription {subscription.id}")
                
    except Exception as e:
        logger.error(f"Failed to trigger auto-renewal reminder SMS: {str(e)}")


# Connect signals
def ready(self):
    """Connect signals when app is ready"""
    from django.apps import AppConfig
    import django
    
    if django.apps.apps.ready:
        # Connect signals
        post_save.connect(handle_client_profile_changes, sender=ClientProfile)
        post_save.connect(handle_payment_transaction, sender=PaymentTransaction)
        post_save.connect(handle_subscription_changes, sender=Subscription)