"""
Management command to cleanup old SMS messages and logs
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging
from sms_automation.models import SMSMessage, SMSDeliveryLog, SMSQueue

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Cleanup old SMS messages and logs"""
    
    help = 'Cleanup old SMS messages, delivery logs, and queue entries'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Delete records older than this many days (default: 90)'
        )
        parser.add_argument(
            '--archive',
            action='store_true',
            help='Archive instead of delete (not implemented)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt'
        )
    
    def handle(self, *args, **options):
        """Execute the command"""
        days = options['days']
        archive = options['archive']
        dry_run = options['dry_run']
        confirm = options['confirm']
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        self.stdout.write(
            self.style.WARNING(
                f"Cleaning up SMS records older than {days} days (before {cutoff_date.date()})"
            )
        )
        
        # Count records to be cleaned up
        old_messages = SMSMessage.objects.filter(
            created_at__lt=cutoff_date,
            status__in=['sent', 'delivered', 'failed', 'cancelled']
        )
        
        old_logs = SMSDeliveryLog.objects.filter(
            event_time__lt=cutoff_date
        )
        
        old_queue = SMSQueue.objects.filter(
            queued_at__lt=cutoff_date,
            status__in=['completed', 'failed']
        )
        
        message_count = old_messages.count()
        log_count = old_logs.count()
        queue_count = old_queue.count()
        total_count = message_count + log_count + queue_count
        
        self.stdout.write("Records to be cleaned up:")
        self.stdout.write(f"  - SMS Messages: {message_count}")
        self.stdout.write(f"  - Delivery Logs: {log_count}")
        self.stdout.write(f"  - Queue Entries: {queue_count}")
        self.stdout.write(f"  - Total: {total_count}")
        
        if total_count == 0:
            self.stdout.write(self.style.SUCCESS("No records to clean up"))
            return
        
        if dry_run:
            self.stdout.write(self.style.SUCCESS("Dry run completed. No records were deleted."))
            return
        
        if not confirm:
            confirm_input = input(
                f"Are you sure you want to delete {total_count} records? [y/N]: "
            )
            if confirm_input.lower() != 'y':
                self.stdout.write(self.style.WARNING("Cleanup cancelled"))
                return
        
        try:
            with transaction.atomic():
                # Delete records
                if archive:
                    # In production, implement archiving
                    self.stdout.write(self.style.WARNING("Archiving not implemented, deleting instead"))
                
                messages_deleted, _ = old_messages.delete()
                logs_deleted, _ = old_logs.delete()
                queue_deleted, _ = old_queue.delete()
                
                self.stdout.write(self.style.SUCCESS("Cleanup completed:"))
                self.stdout.write(f"  - SMS Messages deleted: {messages_deleted}")
                self.stdout.write(f"  - Delivery Logs deleted: {logs_deleted}")
                self.stdout.write(f"  - Queue Entries deleted: {queue_deleted}")
                self.stdout.write(f"  - Total deleted: {messages_deleted + logs_deleted + queue_deleted}")
                
                logger.info(
                    f"Cleanup completed: {messages_deleted} messages, "
                    f"{logs_deleted} logs, {queue_deleted} queue entries"
                )
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Cleanup failed: {str(e)}"))
            logger.error(f"Cleanup command error: {str(e)}")