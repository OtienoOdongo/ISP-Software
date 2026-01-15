"""
Management command to process scheduled SMS messages
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
import logging
from sms_automation.services.sms_service import SMSService, SMSMessage

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Process scheduled SMS messages"""
    
    help = 'Process scheduled SMS messages that are due for sending'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Maximum number of messages to process'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without actually sending'
        )
    
    def handle(self, *args, **options):
        """Execute the command"""
        limit = options['limit']
        dry_run = options['dry_run']
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Processing scheduled SMS messages (limit: {limit}, dry-run: {dry_run})"
            )
        )
        
        sms_service = SMSService()
        
        try:
            if dry_run:
                # Just show what would be processed
                scheduled_messages = SMSMessage.objects.filter(
                    status='pending',
                    scheduled_for__lte=timezone.now(),
                    scheduled_for__isnull=False
                )[:limit]
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Found {scheduled_messages.count()} scheduled messages to process:"
                    )
                )
                
                for message in scheduled_messages:
                    self.stdout.write(
                        f"  - ID: {message.id}, Phone: {message.phone_number}, "
                        f"Scheduled: {message.scheduled_for}, Priority: {message.priority}"
                    )
                
            else:
                # Actually process the messages
                results = sms_service.process_scheduled_messages(limit)
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Processed {results['processed']} scheduled messages"
                    )
                )
                
                # Show details
                self.stdout.write("Summary:")
                self.stdout.write(f"  - Total found: {results['total']}")
                self.stdout.write(f"  - Processed: {results['processed']}")
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error processing scheduled messages: {str(e)}")
            )
            logger.error(f"Command error: {str(e)}")