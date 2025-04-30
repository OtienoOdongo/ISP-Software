from django.db.models.signals import post_save
from django.dispatch import receiver
from user_management.models.plan_model import ClientAnalytics
from user_management.tasks import check_data_usage_and_notify

@receiver(post_save, sender=ClientAnalytics)
def check_for_notifications(sender, instance, created, **kwargs):
    if created and (instance.is_high_usage or instance.is_near_expiry):
        check_data_usage_and_notify.delay()