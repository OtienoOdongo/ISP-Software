from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
import logging
from payments.models.payment_config_model import Transaction
from payments.models.transaction_log_model import TransactionLog

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Transaction)
def track_transaction_changes(sender, instance, **kwargs):
    """
    Track transaction changes for audit purposes
    """
    if instance.pk:
        try:
            old_instance = Transaction.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
            instance._old_gateway = old_instance.gateway
        except Transaction.DoesNotExist:
            instance._old_status = None
            instance._old_gateway = None

@receiver(post_save, sender=Transaction)
def handle_transaction_status_change(sender, instance, created, **kwargs):
    """
    Handle transaction status changes and sync with transaction logs
    COMPLETE version covering all payment methods
    """
    # Only process status changes for existing transactions
    if not created and hasattr(instance, '_old_status') and instance._old_status != instance.status:
        
        # If transaction completed, ensure transaction log exists and is synced
        if instance.status == 'completed':
            if not instance.logs.exists():
                # COMPLETE access type determination for ALL payment methods
                access_type = _determine_complete_access_type(instance)
                
                instance.create_transaction_log(status='success', access_type=access_type)
                logger.info(f"Created transaction log for completed payment {instance.reference}")
            else:
                # Update existing transaction log
                log = instance.logs.first()
                if log.status != 'success':
                    log.status = 'success'
                    log.save()
                    logger.info(f"Updated transaction log status for {instance.reference}")

        # If transaction failed, update transaction log if exists
        elif instance.status == 'failed' and instance.logs.exists():
            log = instance.logs.first()
            if log.status != 'failed':
                log.status = 'failed'
                log.save()
                logger.info(f"Updated transaction log to failed for {instance.reference}")

def _determine_complete_access_type(transaction_instance):
    """
    COMPLETE access type determination for ALL payment methods
    """
    if not transaction_instance.gateway:
        return 'hotspot'
    
    gateway_name = transaction_instance.gateway.name
    
    # COMPLETE mapping covering ALL your payment gateways
    access_type_mapping = {
        'mpesa_paybill': 'hotspot',    # M-Pesa Paybill → Typically for hotspot users
        'mpesa_till': 'hotspot',       # M-Pesa Till → Typically for hotspot users
        'bank_transfer': 'pppoe',      # Bank Transfer → Typically for PPPoE/business users  
        'paypal': 'both'               # PayPal → Available for both access types
    }
    
    return access_type_mapping.get(gateway_name, 'hotspot')