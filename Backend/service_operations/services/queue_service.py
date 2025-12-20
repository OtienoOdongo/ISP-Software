"""
Service Operations - Queue Service
Production-ready background queue processing service with complete method implementations
Manages activation queues with worker management, monitoring, and comprehensive error handling
"""

import logging
import threading
import time
import signal
import sys
from typing import Dict, List, Optional, Any, Tuple
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.db.models import Count, Max, Avg, Q, F
from datetime import timedelta
import psutil
import os

from Backend.service_operations.models.activation_queue_models import ActivationQueue, OperationLog
from service_operations.services.activation_service import ActivationService
from service_operations.utils.calculators import format_seconds_human_readable

logger = logging.getLogger(__name__)


class QueueService:
    """
    Production-ready queue processing service.
    Manages background workers, queue processing, monitoring, and maintenance.
    """
    
    # Worker configuration
    MAX_WORKERS = 3
    MIN_WORKERS = 1
    POLL_INTERVAL = 5  # seconds
    PROCESS_TIMEOUT = 300  # seconds
    HEALTH_CHECK_INTERVAL = 60  # seconds
    
    # Queue configuration
    MAX_QUEUE_SIZE = 1000
    RETRY_DELAY_MULTIPLIER = 2
    PRIORITY_WEIGHTS = {
        1: 0.5,   # Lowest
        2: 0.75,  # Low
        3: 1.0,   # Normal
        4: 1.5,   # High
        5: 2.0,   # Highest
        6: 3.0    # Critical
    }
    
    # Service state (thread-safe)
    _workers = []
    _running = False
    _worker_id_counter = 0
    _shutdown_requested = False
    _health_check_thread = None
    _lock = threading.Lock()
    
    # Statistics
    _processed_count = 0
    _failed_count = 0
    _total_processing_time = 0
    _start_time = None
    
    @classmethod
    def initialize(cls):
        """Initialize queue service with proper signal handling."""
        try:
            if cls._running:
                logger.warning("Queue service already running")
                return
            
            # Set up signal handlers for graceful shutdown
            signal.signal(signal.SIGINT, cls._signal_handler)
            signal.signal(signal.SIGTERM, cls._signal_handler)
            
            # Start workers
            cls.start_workers()
            
            # Start health check thread
            cls._start_health_check_thread()
            
            cls._start_time = timezone.now()
            logger.info("Queue service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize queue service: {e}", exc_info=True)
            raise
    
    @classmethod
    def _signal_handler(cls, signum, frame):
        """Handle shutdown signals gracefully."""
        logger.info(f"Received shutdown signal {signum}")
        cls._shutdown_requested = True
        cls.stop_workers()
        sys.exit(0)
    
    @classmethod
    def start_workers(cls, worker_count: Optional[int] = None):
        """Start queue processing workers."""
        with cls._lock:
            if cls._running:
                logger.warning("Workers already running")
                return
            
            if worker_count is None:
                # Auto-scale based on queue size
                pending_count = ActivationQueue.objects.filter(status='pending').count()
                worker_count = max(
                    cls.MIN_WORKERS,
                    min(cls.MAX_WORKERS, pending_count // 10 + 1)
                )
            
            cls._running = True
            cls._shutdown_requested = False
            
            for i in range(worker_count):
                worker_id = f"worker-{cls._worker_id_counter}"
                cls._worker_id_counter += 1
                
                worker = threading.Thread(
                    target=cls._worker_loop,
                    args=(worker_id,),
                    daemon=True,
                    name=f"QueueWorker-{worker_id}"
                )
                
                worker.start()
                cls._workers.append({
                    'thread': worker,
                    'id': worker_id,
                    'started_at': timezone.now(),
                    'processed_items': 0,
                    'last_activity': timezone.now()
                })
                
                logger.info(f"Started queue worker: {worker_id}")
            
            logger.info(f"Started {worker_count} queue workers")
    
    @classmethod
    def _start_health_check_thread(cls):
        """Start health check monitoring thread."""
        cls._health_check_thread = threading.Thread(
            target=cls._health_check_loop,
            daemon=True,
            name="QueueHealthCheck"
        )
        cls._health_check_thread.start()
        logger.info("Started health check thread")
    
    @classmethod
    def _health_check_loop(cls):
        """Health check monitoring loop."""
        while cls._running and not cls._shutdown_requested:
            try:
                # Check worker health
                with cls._lock:
                    for worker_info in cls._workers:
                        worker = worker_info['thread']
                        if not worker.is_alive():
                            logger.error(f"Worker {worker_info['id']} died, restarting...")
                            cls._restart_worker(worker_info['id'])
                
                # Cleanup old items periodically
                if int(time.time()) % 300 == 0:  # Every 5 minutes
                    cls.cleanup_old_queue_items()
                
                # Check system resources
                cpu_percent = psutil.cpu_percent(interval=1)
                memory_percent = psutil.virtual_memory().percent
                
                if cpu_percent > 90 or memory_percent > 90:
                    logger.warning(f"High system load: CPU={cpu_percent}%, Memory={memory_percent}%")
                
                time.sleep(cls.HEALTH_CHECK_INTERVAL)
                
            except Exception as e:
                logger.error(f"Health check loop error: {e}")
                time.sleep(cls.HEALTH_CHECK_INTERVAL)
    
    @classmethod
    def _restart_worker(cls, worker_id: str):
        """Restart a dead worker."""
        try:
            # Remove old worker
            cls._workers = [w for w in cls._workers if w['id'] != worker_id]
            
            # Start new worker
            new_worker_id = f"worker-{cls._worker_id_counter}"
            cls._worker_id_counter += 1
            
            worker = threading.Thread(
                target=cls._worker_loop,
                args=(new_worker_id,),
                daemon=True,
                name=f"QueueWorker-{new_worker_id}"
            )
            
            worker.start()
            cls._workers.append({
                'thread': worker,
                'id': new_worker_id,
                'started_at': timezone.now(),
                'processed_items': 0,
                'last_activity': timezone.now()
            })
            
            logger.info(f"Restarted worker {worker_id} as {new_worker_id}")
            
        except Exception as e:
            logger.error(f"Failed to restart worker {worker_id}: {e}")
    
    @classmethod
    def _worker_loop(cls, worker_id: str):
        """Worker processing loop with comprehensive error handling."""
        logger.info(f"Worker {worker_id} started")
        
        worker_info = None
        with cls._lock:
            for w in cls._workers:
                if w['id'] == worker_id:
                    worker_info = w
                    break
        
        if not worker_info:
            logger.error(f"Worker info not found for {worker_id}")
            return
        
        while cls._running and not cls._shutdown_requested:
            try:
                # Get next item from queue
                queue_item = cls._get_next_queue_item(worker_id)
                
                if queue_item:
                    # Update worker activity
                    worker_info['last_activity'] = timezone.now()
                    
                    # Process the item
                    success = cls._process_queue_item(queue_item, worker_id)
                    
                    # Update statistics
                    with cls._lock:
                        worker_info['processed_items'] += 1
                        if success:
                            cls._processed_count += 1
                        else:
                            cls._failed_count += 1
                    
                else:
                    # No items to process, wait
                    time.sleep(cls.POLL_INTERVAL)
                
            except Exception as e:
                logger.error(f"Worker {worker_id} error: {e}", exc_info=True)
                time.sleep(cls.POLL_INTERVAL)
        
        logger.info(f"Worker {worker_id} stopped")
    
    @classmethod
    def _get_next_queue_item(cls, worker_id: str) -> Optional[ActivationQueue]:
        """
        Get next item from queue for processing with priority weighting.
        Uses database-level locking to prevent race conditions.
        """
        try:
            with transaction.atomic():
                # Find items that can be processed
                now = timezone.now()
                
                # Calculate priority score
                items = ActivationQueue.objects.select_for_update(skip_locked=True).filter(
                    Q(status__in=['pending', 'retrying']) &
                    (
                        Q(next_retry_at__isnull=True) |
                        Q(next_retry_at__lte=now)
                    )
                ).annotate(
                    priority_score=F('priority') * cls.PRIORITY_WEIGHTS[3],  # Default weight
                    age_seconds=(now - F('created_at')).seconds,
                    weighted_score=F('priority_score') * (1 + F('age_seconds') / 3600)  # Age bonus
                ).order_by('-weighted_score', 'created_at')[:1]
                
                if not items:
                    return None
                
                # Take the first item
                item = items[0]
                item.mark_as_processing(worker_id)
                
                return item
                
        except Exception as e:
            logger.error(f"Failed to get next queue item: {e}")
            return None
    
    @classmethod
    def _process_queue_item(cls, queue_item: ActivationQueue, worker_id: str) -> bool:
        """
        Process a queue item with timeout and comprehensive error handling.
        
        Returns:
            True if processing succeeded, False otherwise
        """
        logger.info(f"Worker {worker_id} processing queue item {queue_item.id}")
        
        processing_start = timezone.now()
        
        try:
            # Set processing timeout
            processing_thread = threading.Thread(
                target=cls._process_item_with_timeout,
                args=(queue_item, worker_id),
                daemon=True
            )
            
            processing_thread.start()
            processing_thread.join(timeout=cls.PROCESS_TIMEOUT)
            
            if processing_thread.is_alive():
                # Processing timed out
                logger.error(f"Queue item {queue_item.id} processing timeout after {cls.PROCESS_TIMEOUT}s")
                
                # Mark as failed with timeout
                queue_item.mark_as_failed(
                    f"Processing timeout after {cls.PROCESS_TIMEOUT} seconds"
                )
                
                # Log timeout
                OperationLog.log_error(
                    subscription=queue_item.subscription,
                    error=Exception(f"Processing timeout after {cls.PROCESS_TIMEOUT}s"),
                    source_module='queue_service',
                    source_function='_process_queue_item',
                    details={
                        'queue_item_id': str(queue_item.id),
                        'worker_id': worker_id,
                        'timeout_seconds': cls.PROCESS_TIMEOUT
                    }
                )
                
                return False
            
            # Check processing result
            queue_item.refresh_from_db()
            
            processing_duration = (timezone.now() - processing_start).total_seconds()
            with cls._lock:
                cls._total_processing_time += processing_duration
            
            if queue_item.status == 'completed':
                logger.info(f"Queue item {queue_item.id} processed successfully in {processing_duration:.2f}s")
                return True
            else:
                logger.warning(f"Queue item {queue_item.id} processing failed after {processing_duration:.2f}s")
                return False
                
        except Exception as e:
            logger.error(f"Error processing queue item {queue_item.id}: {e}", exc_info=True)
            
            # Mark as failed
            try:
                queue_item.mark_as_failed(str(e))
            except:
                pass
            
            return False
    
    @classmethod
    def _process_item_with_timeout(cls, queue_item: ActivationQueue, worker_id: str):
        """Process item in a separate thread for timeout control."""
        try:
            # Process based on activation type
            if queue_item.activation_type == 'initial':
                result = ActivationService.process_activation_queue_item(
                    str(queue_item.id),
                    processor_id=worker_id
                )
                success = result.get('success', False)
                
            elif queue_item.activation_type == 'renewal':
                result = ActivationService.process_activation_queue_item(
                    str(queue_item.id),
                    processor_id=worker_id
                )
                success = result.get('success', False)
                
            elif queue_item.activation_type == 'reactivation':
                result = ActivationService.process_activation_queue_item(
                    str(queue_item.id),
                    processor_id=worker_id
                )
                success = result.get('success', False)
                
            else:
                logger.error(f"Unknown activation type: {queue_item.activation_type}")
                queue_item.mark_as_failed(f"Unknown activation type: {queue_item.activation_type}")
                success = False
            
            if not success and queue_item.status != 'completed':
                # Check if retry should be scheduled
                if queue_item.retry_count < queue_item.max_retries:
                    delay_minutes = queue_item.retry_delay_minutes * (
                        cls.RETRY_DELAY_MULTIPLIER ** queue_item.retry_count
                    )
                    queue_item.next_retry_at = timezone.now() + timedelta(minutes=delay_minutes)
                    queue_item.status = 'retrying'
                    queue_item.save()
                    logger.info(f"Queue item {queue_item.id} scheduled for retry {queue_item.retry_count + 1}")
                    
        except Exception as e:
            logger.error(f"Error in processing thread for queue item {queue_item.id}: {e}")
            queue_item.mark_as_failed(str(e))
    
    @classmethod
    def stop_workers(cls):
        """Stop all queue workers gracefully."""
        with cls._lock:
            if not cls._running:
                return
            
            logger.info("Stopping queue workers...")
            cls._running = False
            cls._shutdown_requested = True
            
            # Wait for workers to stop
            for worker_info in cls._workers:
                worker = worker_info['thread']
                if worker.is_alive():
                    worker.join(timeout=10)
                    if worker.is_alive():
                        logger.warning(f"Worker {worker_info['id']} did not stop gracefully")
            
            cls._workers.clear()
            logger.info("Stopped all queue workers")
    
    @classmethod
    def add_activation_request(cls, subscription) -> str:
        """
        Add activation request to queue.
        
        Args:
            subscription: Subscription to activate
        
        Returns:
            Queue item ID
        """
        try:
            # Check if already in queue
            existing = ActivationQueue.objects.filter(
                subscription=subscription,
                status__in=['pending', 'processing', 'retrying']
            ).first()
            
            if existing:
                logger.info(f"Activation already in queue for subscription {subscription.id}")
                return str(existing.id)
            
            # Create new queue item
            queue_item = ActivationQueue.objects.create(
                subscription=subscription,
                activation_type='initial',
                priority=4,  # High priority for new activations
                metadata={
                    'added_by': 'queue_service',
                    'subscription_status': subscription.status,
                    'client_id': str(subscription.client_id)
                }
            )
            
            logger.info(f"Added activation request to queue: {queue_item.id} for subscription {subscription.id}")
            return str(queue_item.id)
            
        except Exception as e:
            logger.error(f"Failed to add activation request to queue: {e}")
            raise
    
    @classmethod
    def get_queue_status(cls) -> Dict[str, Any]:
        """
        Get comprehensive queue status.
        
        Returns:
            Queue status with statistics and health information
        """
        try:
            # Get queue statistics
            stats = ActivationQueue.objects.aggregate(
                total=Count('id'),
                pending=Count('id', filter=Q(status='pending')),
                processing=Count('id', filter=Q(status='processing')),
                retrying=Count('id', filter=Q(status='retrying')),
                failed=Count('id', filter=Q(status='failed')),
                completed=Count('id', filter=Q(status='completed')),
                cancelled=Count('id', filter=Q(status='cancelled')),
                avg_processing_time=Avg('actual_duration_seconds', filter=Q(status='completed')),
                max_retry_count=Max('retry_count'),
                avg_retry_count=Avg('retry_count', filter=Q(status__in=['failed', 'retrying']))
            )
            
            # Get worker status
            worker_status = []
            with cls._lock:
                for worker_info in cls._workers:
                    worker = worker_info['thread']
                    worker_status.append({
                        'id': worker_info['id'],
                        'alive': worker.is_alive(),
                        'started_at': worker_info['started_at'].isoformat(),
                        'last_activity': worker_info['last_activity'].isoformat(),
                        'processed_items': worker_info['processed_items'],
                        'uptime_seconds': (
                            timezone.now() - worker_info['started_at']
                        ).total_seconds() if worker_info['started_at'] else 0
                    })
            
            # Calculate performance metrics
            avg_processing_time = stats['avg_processing_time'] or 0
            success_rate = 0
            if stats['total'] > 0:
                success_rate = (stats['completed'] or 0) / stats['total'] * 100
            
            # Get pending items by priority
            priority_distribution = {}
            for priority in range(1, 7):
                count = ActivationQueue.objects.filter(
                    status='pending',
                    priority=priority
                ).count()
                priority_distribution[priority] = count
            
            return {
                'service': 'queue_service',
                'status': 'running' if cls._running else 'stopped',
                'uptime_seconds': (
                    (timezone.now() - cls._start_time).total_seconds() 
                    if cls._start_time else 0
                ),
                'workers': {
                    'total': len(cls._workers),
                    'alive': sum(1 for w in cls._workers if w['thread'].is_alive()),
                    'details': worker_status
                },
                'queue_stats': {
                    'total': stats['total'] or 0,
                    'pending': stats['pending'] or 0,
                    'processing': stats['processing'] or 0,
                    'retrying': stats['retrying'] or 0,
                    'failed': stats['failed'] or 0,
                    'completed': stats['completed'] or 0,
                    'cancelled': stats['cancelled'] or 0,
                    'priority_distribution': priority_distribution,
                    'estimated_wait_time_seconds': cls._estimate_wait_time()
                },
                'performance': {
                    'average_processing_time_seconds': avg_processing_time,
                    'success_rate_percentage': round(success_rate, 2),
                    'max_retry_count': stats['max_retry_count'] or 0,
                    'average_retry_count': round(stats['avg_retry_count'] or 0, 2),
                    'items_processed': cls._processed_count,
                    'items_failed': cls._failed_count,
                    'average_throughput_per_hour': cls._calculate_throughput()
                },
                'health': {
                    'running': cls._running,
                    'shutdown_requested': cls._shutdown_requested,
                    'queue_size_healthy': (stats['pending'] or 0) < cls.MAX_QUEUE_SIZE,
                    'workers_healthy': all(w['thread'].is_alive() for w in cls._workers)
                },
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get queue status: {e}")
            return {
                'service': 'queue_service',
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _estimate_wait_time(cls) -> float:
        """Estimate average wait time for pending items."""
        try:
            pending_items = ActivationQueue.objects.filter(status='pending')
            if not pending_items.exists():
                return 0.0
            
            # Get average processing time
            avg_time = ActivationQueue.objects.filter(
                status='completed',
                actual_duration_seconds__gt=0
            ).aggregate(
                avg=Avg('actual_duration_seconds')
            )['avg'] or 30.0  # Default 30 seconds
            
            # Estimate based on queue size and worker count
            active_workers = sum(1 for w in cls._workers if w['thread'].is_alive())
            if active_workers == 0:
                active_workers = 1
            
            estimated_time = (pending_items.count() * avg_time) / active_workers
            return min(estimated_time, 3600)  # Cap at 1 hour
            
        except Exception:
            return 0.0
    
    @classmethod
    def _calculate_throughput(cls) -> float:
        """Calculate items processed per hour."""
        if not cls._start_time:
            return 0.0
        
        uptime_hours = (timezone.now() - cls._start_time).total_seconds() / 3600
        if uptime_hours == 0:
            return 0.0
        
        return cls._processed_count / uptime_hours
    
    @classmethod
    def cleanup_old_queue_items(cls, days: int = 7) -> int:
        """Clean up old completed/failed/cancelled items."""
        try:
            cutoff_date = timezone.now() - timedelta(days=days)
            
            deleted_count = ActivationQueue.objects.filter(
                status__in=['completed', 'failed', 'cancelled'],
                created_at__lt=cutoff_date
            ).delete()[0]
            
            logger.info(f"Cleaned up {deleted_count} old activation queue items")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old queue items: {e}")
            return 0
    
    @classmethod
    def get_queue_stats(cls) -> Dict[str, Any]:
        """
        Get queue statistics (alias for get_queue_status for compatibility).
        """
        return cls.get_queue_status()
    
    @classmethod
    def requeue_failed_items(cls, max_retries: int = 3) -> int:
        """Requeue failed items for retry."""
        try:
            failed_items = ActivationQueue.objects.filter(
                status='failed',
                retry_count__lt=max_retries
            )
            
            requeued_count = 0
            for item in failed_items:
                item.status = 'pending'
                item.next_retry_at = timezone.now()
                item.error_message = ''
                item.error_details = {}
                item.save()
                requeued_count += 1
            
            logger.info(f"Requeued {requeued_count} failed items")
            return requeued_count
            
        except Exception as e:
            logger.error(f"Failed to requeue failed items: {e}")
            return 0
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Comprehensive health check for queue service.
        
        Returns:
            Health status with all components
        """
        try:
            # Get queue status
            queue_status = cls.get_queue_status()
            
            # Check system resources
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_percent = psutil.virtual_memory().percent
            disk_percent = psutil.disk_usage('/').percent
            
            # Determine overall health
            is_healthy = (
                queue_status.get('status') == 'running' and
                queue_status['health']['workers_healthy'] and
                queue_status['health']['queue_size_healthy'] and
                cpu_percent < 90 and
                memory_percent < 90 and
                disk_percent < 90
            )
            
            health_status = {
                'service': 'queue_service',
                'status': 'healthy' if is_healthy else 'unhealthy',
                'queue_service': queue_status,
                'system_resources': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory_percent,
                    'disk_percent': disk_percent,
                    'healthy': cpu_percent < 90 and memory_percent < 90 and disk_percent < 90
                },
                'recommendations': [],
                'timestamp': timezone.now().isoformat()
            }
            
            # Generate recommendations
            if not queue_status['health']['workers_healthy']:
                health_status['recommendations'].append("Some workers are not alive. Consider restarting the queue service.")
            
            if not queue_status['health']['queue_size_healthy']:
                health_status['recommendations'].append(f"Queue size ({queue_status['queue_stats']['pending']}) is large. Consider adding more workers.")
            
            if cpu_percent > 80:
                health_status['recommendations'].append(f"High CPU usage ({cpu_percent}%). Consider optimizing processing logic.")
            
            if memory_percent > 80:
                health_status['recommendations'].append(f"High memory usage ({memory_percent}%). Consider monitoring for memory leaks.")
            
            return health_status
            
        except Exception as e:
            logger.error(f"Queue service health check failed: {e}")
            return {
                'service': 'queue_service',
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }