from django.core.management.base import BaseCommand
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Manage the queue service with various operations'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['start', 'stop', 'status', 'restart', 'health'],
            help='Action to perform on the queue service'
        )
        parser.add_argument(
            '--workers',
            type=int,
            default=None,
            help='Number of workers to start (for start/restart actions)'
        )
    
    def handle(self, *args, **options):
        action = options['action']
        worker_count = options['workers']
        
        try:
            from service_operations.services.queue_service import QueueService
            
            if action == 'start':
                self.stdout.write(f"Starting queue service at {timezone.now()}...")
                if worker_count:
                    QueueService.start_workers(worker_count)
                else:
                    QueueService.initialize()
                self.stdout.write(self.style.SUCCESS("Queue service started successfully"))
                
            elif action == 'stop':
                self.stdout.write(f"Stopping queue service at {timezone.now()}...")
                QueueService.stop_workers()
                self.stdout.write(self.style.SUCCESS("Queue service stopped successfully"))
                
            elif action == 'status':
                status = QueueService.get_queue_status()
                self.stdout.write(f"Queue Service Status at {timezone.now()}:")
                self.stdout.write(f"  Service: {status.get('status', 'unknown')}")
                self.stdout.write(f"  Uptime: {status.get('uptime_seconds', 0):.0f} seconds")
                self.stdout.write(f"  Workers: {status.get('workers', {}).get('total', 0)} total, {status.get('workers', {}).get('alive', 0)} alive")
                self.stdout.write(f"  Queue: {status.get('queue_stats', {}).get('pending', 0)} pending items")
                self.stdout.write(f"  Throttle factor: {QueueService._throttle_factor}")
                
            elif action == 'restart':
                self.stdout.write(f"Restarting queue service at {timezone.now()}...")
                QueueService.stop_workers()
                import time
                time.sleep(2)
                if worker_count:
                    QueueService.start_workers(worker_count)
                else:
                    QueueService.initialize()
                self.stdout.write(self.style.SUCCESS("Queue service restarted successfully"))
                
            elif action == 'health':
                health = QueueService.health_check()
                self.stdout.write(f"Queue Service Health Check at {timezone.now()}:")
                self.stdout.write(f"  Overall: {health.get('status', 'unknown')}")
                self.stdout.write(f"  System CPU: {health.get('system_resources', {}).get('cpu_percent', 0)}%")
                self.stdout.write(f"  System Memory: {health.get('system_resources', {}).get('memory_percent', 0)}%")
                self.stdout.write(f"  Recommendations: {health.get('recommendations', [])}")
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error performing {action}: {e}"))