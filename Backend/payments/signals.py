# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from payments.models.payment_config_model import Transaction
# from payments.models.transaction_log_model import TransactionLog

# @receiver(post_save, sender=Transaction)
# def create_transaction_log(sender, instance, created, **kwargs):
#     """
#     Automatically create transaction log when a payment transaction is created
#     """
#     if created and instance.client:
#         try:
#             # Determine payment method from gateway
#             payment_method = 'mpesa'  # Default
#             if instance.gateway:
#                 gateway_name = instance.gateway.name.lower()
#                 if 'paypal' in gateway_name:
#                     payment_method = 'paypal'
#                 elif 'bank' in gateway_name:
#                     payment_method = 'bank_transfer'
            
#             TransactionLog.objects.create(
#                 payment_transaction=instance,
#                 client=instance.client,
#                 amount=instance.amount,
#                 status=instance.status,
#                 payment_method=payment_method,
#                 phone_number=instance.metadata.get('phone_number'),
#                 reference_number=instance.reference,
#                 description=f"Payment for {instance.plan.name if instance.plan else 'unknown plan'}",
#                 metadata=instance.metadata
#             )
#         except Exception as e:
#             # Log error but don't break the transaction creation
#             import logging
#             logger = logging.getLogger(__name__)
#             logger.error(f"Failed to create transaction log: {str(e)}")








from django.db.models.signals import post_save
from django.dispatch import receiver
from payments.models.payment_config_model import Transaction
from payments.models.transaction_log_model import TransactionLog

@receiver(post_save, sender=Transaction)
def create_transaction_log(sender, instance, created, **kwargs):
    """
    Automatically create transaction log when a payment transaction is created
    """
    if created and instance.client:
        try:
            # Determine payment method from gateway
            payment_method = 'mpesa'  # Default
            if instance.gateway:
                gateway_name = instance.gateway.name.lower()
                if 'paypal' in gateway_name:
                    payment_method = 'paypal'
                elif 'bank' in gateway_name:
                    payment_method = 'bank_transfer'
            
            TransactionLog.objects.create(
                payment_transaction=instance,
                client=instance.client,
                amount=instance.amount,
                status=instance.status,
                payment_method=payment_method,
                phone_number=instance.client.user.phone_number,
                reference_number=instance.reference,
                description=f"Payment for plan {instance.plan_id}",
                metadata=instance.metadata
            )
        except Exception as e:
            # Log error but don't break the transaction creation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create transaction log: {str(e)}")