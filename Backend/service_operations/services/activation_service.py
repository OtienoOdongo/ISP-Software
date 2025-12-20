"""
Service Operations - Activation Service
Production-ready subscription activation service with complete method implementations
Handles subscription activation via NetworkManagement API with retry logic, circuit breaker, and health checks
"""

import logging
import requests
from django.conf import settings
from django.utils import timezone
from typing import Dict, Any, Optional, List, Tuple
from django.db import transaction
import json
from datetime import timedelta
from decimal import Decimal
import threading
import time

from service_operations.models import ActivationQueue, OperationLog, Subscription
from service_operations.adapters.network_adapter import NetworkAdapter
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter

logger = logging.getLogger(__name__)


class ActivationService:
    """
    Production-ready service for subscription activation.
    Includes circuit breaker, retry logic, health checks, and comprehensive error handling.
    """
    
    # Circuit breaker configuration
    CIRCUIT_BREAKER_THRESHOLD = 5  # Failures before opening circuit
    CIRCUIT_BREAKER_TIMEOUT = 300  # 5 minutes in seconds
    CIRCUIT_BREAKER_HALF_OPEN_TIMEOUT = 60  # 1 minute in half-open state
    
    # Retry configuration
    MAX_RETRIES = 3
    RETRY_DELAYS = [5, 30, 300]  # seconds for exponential backoff
    
    # Timeout configuration
    ACTIVATION_TIMEOUT = 30  # seconds
    STATUS_CHECK_TIMEOUT = 10  # seconds
    HEALTH_CHECK_TIMEOUT = 5  # seconds
    
    # Queue processing configuration
    MAX_CONCURRENT_ACTIVATIONS = 5
    
    # Class-level state (thread-safe with locks)
    _circuit_state = 'closed'  # 'closed', 'open', 'half-open'
    _failure_count = 0
    _circuit_opened_at = None
    _circuit_lock = threading.Lock()
    _active_activations = 0
    _activation_lock = threading.Lock()
    
    @classmethod
    def request_subscription_activation(cls, subscription: Subscription) -> Dict[str, Any]:
        """
        Request activation of a subscription via NetworkManagement API.
        
        Args:
            subscription: Subscription to activate
        
        Returns:
            Dictionary with activation result
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            logger.warning(f"Circuit breaker {circuit_status}, activation blocked for subscription {subscription.id}")
            return cls._handle_circuit_blocked(subscription.id, circuit_status)
        
        # Check concurrent activation limit
        if not cls._can_start_activation():
            logger.warning(f"Maximum concurrent activations reached, queuing subscription {subscription.id}")
            return cls._queue_activation(subscription)
        
        try:
            # Prepare activation data
            activation_data = cls._prepare_activation_data(subscription)
            
            # Call NetworkManagement via adapter with timeout
            start_time = timezone.now()
            response = NetworkAdapter.activate_subscription(
                activation_data, 
                timeout=cls.ACTIVATION_TIMEOUT
            )
            duration = (timezone.now() - start_time).total_seconds()
            
            if response.get('success'):
                # Success - update subscription and reset circuit
                with transaction.atomic():
                    subscription.status = 'processing'
                    subscription.save(update_fields=['status', 'updated_at'])
                
                # Reset circuit breaker on success
                cls._reset_circuit_breaker()
                
                # Create activation queue item for tracking
                queue_item = ActivationQueue.objects.create(
                    subscription=subscription,
                    activation_type='initial',
                    priority=4,
                    metadata={
                        'activation_data': activation_data,
                        'response': response,
                        'duration_seconds': duration,
                        'requested_at': timezone.now().isoformat()
                    }
                )
                
                # Log successful request
                OperationLog.log_operation(
                    operation_type='activation_request',
                    severity='info',
                    subscription=subscription,
                    description=f"Activation request submitted successfully",
                    details={
                        'activation_response': response,
                        'queue_item_id': str(queue_item.id),
                        'duration_seconds': duration,
                    },
                    source_module='activation_service',
                    source_function='request_subscription_activation',
                    duration_ms=int(duration * 1000)
                )
                
                logger.info(
                    f"Activation request successful for subscription {subscription.id}: "
                    f"queue_item_id={queue_item.id}, "
                    f"duration={duration:.2f}s"
                )
                
                return {
                    'success': True,
                    'queue_item_id': str(queue_item.id),
                    'subscription_id': str(subscription.id),
                    'message': 'Activation request submitted successfully',
                    'estimated_completion': 'within 5 minutes',
                    'timestamp': timezone.now().isoformat(),
                    'duration_seconds': duration
                }
            else:
                # Handle API error
                return cls._handle_activation_error(subscription, response, duration)
                
        except requests.exceptions.Timeout:
            logger.error(f"Activation timeout for subscription {subscription.id}")
            return cls._handle_timeout_error(subscription)
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error for subscription {subscription.id}")
            return cls._handle_connection_error(subscription)
            
        except Exception as e:
            logger.error(f"Unexpected error activating subscription {subscription.id}: {e}", exc_info=True)
            return cls._handle_unexpected_error(subscription, e)
            
        finally:
            # Release activation slot
            cls._release_activation_slot()
    
    @classmethod
    def _prepare_activation_data(cls, subscription: Subscription) -> Dict[str, Any]:
        """Prepare comprehensive activation data for network management."""
        try:
            # Get plan technical configuration
            technical_config = InternetPlansAdapter.get_plan_technical_config(
                plan_id=str(subscription.internet_plan_id),
                access_method=subscription.access_method
            )
        except Exception as e:
            logger.warning(f"Could not get plan technical config for subscription {subscription.id}: {e}")
            technical_config = {}
        
        # Build activation data based on client type
        activation_data = {
            'subscription_id': str(subscription.id),
            'client_id': str(subscription.client_id),
            'plan_id': str(subscription.internet_plan_id),
            'access_method': subscription.access_method,
            'client_type': subscription.client_type,
            'router_id': subscription.router_id,
            'technical_config': technical_config,
            'duration_seconds': subscription.remaining_time_seconds,
            'data_limit_bytes': subscription.remaining_data_bytes,
            'billing_info': {
                'payment_reference': subscription.payment_reference,
                'plan_name': technical_config.get('name', 'Unknown'),
            },
            'request_timestamp': timezone.now().isoformat(),
            'request_id': f"act-req-{subscription.id}-{int(timezone.now().timestamp())}"
        }
        
        # Add client-specific data
        if subscription.client_type == 'hotspot_client':
            activation_data['hotspot_mac_address'] = subscription.hotspot_mac_address
            activation_data['activation_type'] = 'hotspot'
        elif subscription.client_type == 'pppoe_client':
            activation_data['pppoe_username'] = subscription.pppoe_username
            activation_data['pppoe_password'] = subscription.pppoe_password
            activation_data['activation_type'] = 'pppoe'
        
        return activation_data
    
    @classmethod
    def check_activation_status(cls, queue_item_id: str) -> Dict[str, Any]:
        """
        Check activation status for a queue item.
        
        Args:
            queue_item_id: Activation queue item ID
        
        Returns:
            Status information
        """
        # Check circuit breaker
        circuit_status = cls._check_circuit_breaker()
        if circuit_status != 'closed':
            return {
                'success': False,
                'status': 'service_unavailable',
                'circuit_state': circuit_status,
                'message': f'Activation service unavailable (circuit {circuit_status})',
                'timestamp': timezone.now().isoformat()
            }
        
        try:
            # Get queue item
            queue_item = ActivationQueue.objects.get(id=queue_item_id)
            
            # Check via network adapter
            start_time = timezone.now()
            status_result = NetworkAdapter.check_activation_status(
                str(queue_item.subscription.id), 
                timeout=cls.STATUS_CHECK_TIMEOUT
            )
            duration = (timezone.now() - start_time).total_seconds()
            
            if status_result.get('success'):
                # Reset circuit breaker on success
                cls._reset_circuit_breaker()
                
                return {
                    'success': True,
                    'status': status_result.get('status', 'unknown'),
                    'details': status_result.get('details', {}),
                    'last_updated': status_result.get('last_updated'),
                    'duration_seconds': duration,
                    'timestamp': timezone.now().isoformat()
                }
            else:
                # Record failure
                cls._record_failure()
                
                return {
                    'success': False,
                    'status': 'check_failed',
                    'error': status_result.get('error', 'Failed to check status'),
                    'duration_seconds': duration,
                    'timestamp': timezone.now().isoformat()
                }
                
        except ActivationQueue.DoesNotExist:
            logger.error(f"Queue item {queue_item_id} not found")
            return {
                'success': False,
                'status': 'not_found',
                'error': 'Queue item not found',
                'timestamp': timezone.now().isoformat()
            }
            
        except requests.exceptions.Timeout:
            logger.error(f"Status check timeout for queue item {queue_item_id}")
            cls._record_failure()
            
            return {
                'success': False,
                'status': 'timeout',
                'error': 'Status check timeout',
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Status check error for queue item {queue_item_id}: {e}")
            cls._record_failure()
            
            return {
                'success': False,
                'status': 'error',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def process_activation_queue_item(cls, queue_item_id: str, processor_id: str = "system") -> Dict[str, Any]:
        """
        Process a specific activation queue item.
        Called by queue service workers.
        
        Args:
            queue_item_id: Activation queue item ID
            processor_id: ID of the processor
        
        Returns:
            Processing result
        """
        try:
            # Get queue item with subscription
            queue_item = ActivationQueue.objects.select_related('subscription').get(id=queue_item_id)
            subscription = queue_item.subscription
            
            logger.info(f"Processing activation queue item {queue_item_id} for subscription {subscription.id}")
            
            # Mark as processing
            queue_item.processor_id = processor_id
            queue_item.started_at = timezone.now()
            queue_item.status = 'processing'
            queue_item.save(update_fields=['processor_id', 'started_at', 'status', 'updated_at'])
            
            # Prepare activation data
            activation_data = cls._prepare_activation_data(subscription)
            
            # Call NetworkManagement via adapter
            start_time = timezone.now()
            response = NetworkAdapter.activate_subscription(activation_data)
            duration = (timezone.now() - start_time).total_seconds()
            
            if response.get('success'):
                # Update subscription
                subscription.status = 'active'
                subscription.activation_successful = True
                subscription.activation_completed_at = timezone.now()
                subscription.save()
                
                # Mark queue item as completed
                queue_item.status = 'completed'
                queue_item.completed_at = timezone.now()
                queue_item.actual_duration_seconds = int(duration)
                queue_item.save(update_fields=['status', 'completed_at', 'actual_duration_seconds', 'updated_at'])
                
                # Log successful activation
                OperationLog.log_operation(
                    operation_type='subscription_activation',
                    severity='info',
                    subscription=subscription,
                    description=f"Activation completed successfully for {subscription.client_type}",
                    details={
                        'queue_item_id': str(queue_item.id),
                        'processor_id': processor_id,
                        'client_type': subscription.client_type,
                        'access_method': subscription.access_method,
                        'duration_seconds': duration,
                        'network_response': response
                    },
                    source_module='activation_service',
                    source_function='process_activation_queue_item',
                    duration_ms=int(duration * 1000)
                )
                
                logger.info(f"Activation queue item {queue_item_id} processed successfully in {duration:.2f}s")
                
                return {
                    'success': True,
                    'queue_item_id': queue_item_id,
                    'subscription_id': str(subscription.id),
                    'status': 'activated',
                    'duration_seconds': duration,
                    'timestamp': timezone.now().isoformat()
                }
            else:
                # Schedule retry
                retry_scheduled = cls._schedule_queue_item_retry(queue_item, response)
                
                # Update subscription with error
                subscription.activation_error = response.get('error', 'Activation failed')
                subscription.activation_attempts += 1
                subscription.save()
                
                # Log failed activation
                OperationLog.log_operation(
                    operation_type='subscription_activation',
                    severity='error',
                    subscription=subscription,
                    description=f"Activation failed for {subscription.client_type}",
                    details={
                        'queue_item_id': str(queue_item.id),
                        'processor_id': processor_id,
                        'error': response.get('error'),
                        'duration_seconds': duration,
                        'retry_scheduled': retry_scheduled,
                        'retry_count': queue_item.retry_count
                    },
                    source_module='activation_service',
                    source_function='process_activation_queue_item',
                    duration_ms=int(duration * 1000)
                )
                
                logger.warning(f"Activation queue item {queue_item_id} failed, retry scheduled: {retry_scheduled}")
                
                return {
                    'success': False,
                    'queue_item_id': queue_item_id,
                    'subscription_id': str(subscription.id),
                    'status': 'failed',
                    'retry_scheduled': retry_scheduled,
                    'error': response.get('error', 'Activation failed'),
                    'duration_seconds': duration,
                    'timestamp': timezone.now().isoformat()
                }
                
        except ActivationQueue.DoesNotExist:
            logger.error(f"Activation queue item {queue_item_id} not found")
            return {
                'success': False,
                'error': 'Queue item not found',
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to process activation queue item {queue_item_id}: {e}", exc_info=True)
            
            # Mark as failed
            try:
                queue_item = ActivationQueue.objects.get(id=queue_item_id)
                queue_item.status = 'failed'
                queue_item.error_message = str(e)
                queue_item.save()
            except:
                pass
            
            return {
                'success': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _schedule_queue_item_retry(cls, queue_item: ActivationQueue, response: Dict[str, Any]) -> bool:
        """Schedule retry for failed queue item."""
        if queue_item.retry_count < queue_item.max_retries:
            # Calculate delay with exponential backoff
            delay_seconds = 5 * (3 ** queue_item.retry_count)  # 5, 15, 45, 135 seconds
            
            queue_item.status = 'retrying'
            queue_item.retry_count += 1
            queue_item.next_retry_at = timezone.now() + timedelta(seconds=delay_seconds)
            queue_item.error_message = response.get('error', 'Activation failed')
            queue_item.error_details = response
            queue_item.save()
            
            logger.info(f"Scheduled retry {queue_item.retry_count} for queue item {queue_item.id} in {delay_seconds}s")
            return True
        else:
            # Max retries reached, mark as failed
            queue_item.status = 'failed'
            queue_item.error_message = response.get('error', 'Activation failed')
            queue_item.error_details = response
            queue_item.save()
            return False
    
    @classmethod
    def cancel_activation(cls, subscription_id: str, reason: str = "Cancelled by user") -> Dict[str, Any]:
        """
        Cancel an in-progress activation.
        
        Args:
            subscription_id: Subscription ID to cancel
            reason: Cancellation reason
        
        Returns:
            Cancellation result
        """
        try:
            # Check if activation is in progress
            queue_items = ActivationQueue.objects.filter(
                subscription_id=subscription_id,
                status__in=['pending', 'processing', 'retrying']
            )
            
            if not queue_items.exists():
                return {
                    'success': False,
                    'error': 'No active activation found',
                    'timestamp': timezone.now().isoformat()
                }
            
            cancelled_count = 0
            for queue_item in queue_items:
                queue_item.status = 'cancelled'
                queue_item.error_message = f"Cancelled: {reason}"
                queue_item.save()
                cancelled_count += 1
            
            # Also cancel via network adapter if possible
            try:
                NetworkAdapter.deactivate_subscription(subscription_id)
            except Exception as e:
                logger.warning(f"Failed to cancel activation on network for {subscription_id}: {e}")
            
            logger.info(f"Cancelled {cancelled_count} activation(s) for subscription {subscription_id}: {reason}")
            
            return {
                'success': True,
                'cancelled_count': cancelled_count,
                'message': f'Cancelled {cancelled_count} activation(s)',
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel activation for subscription {subscription_id}: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    # Circuit Breaker Methods
    @classmethod
    def _check_circuit_breaker(cls) -> str:
        """Check and update circuit breaker state."""
        with cls._circuit_lock:
            if cls._circuit_state == 'open':
                # Check if we should move to half-open
                if cls._circuit_opened_at:
                    time_open = (timezone.now() - cls._circuit_opened_at).total_seconds()
                    if time_open > cls.CIRCUIT_BREAKER_TIMEOUT:
                        cls._circuit_state = 'half-open'
                        cls._circuit_opened_at = None
                        logger.info("Circuit breaker moved to half-open state")
            
            return cls._circuit_state
    
    @classmethod
    def _record_failure(cls):
        """Record a failure for circuit breaker."""
        with cls._circuit_lock:
            cls._failure_count += 1
            
            if cls._failure_count >= cls.CIRCUIT_BREAKER_THRESHOLD:
                cls._circuit_state = 'open'
                cls._circuit_opened_at = timezone.now()
                logger.error(
                    f"Circuit breaker opened after {cls._failure_count} failures. "
                    f"Will reset in {cls.CIRCUIT_BREAKER_TIMEOUT} seconds."
                )
    
    @classmethod
    def _reset_circuit_breaker(cls):
        """Reset circuit breaker on success."""
        with cls._circuit_lock:
            cls._failure_count = 0
            if cls._circuit_state != 'closed':
                cls._circuit_state = 'closed'
                cls._circuit_opened_at = None
                logger.info("Circuit breaker reset to closed state")
    
    @classmethod
    def _can_start_activation(cls) -> bool:
        """Check if we can start a new activation (concurrency limit)."""
        with cls._activation_lock:
            if cls._active_activations < cls.MAX_CONCURRENT_ACTIVATIONS:
                cls._active_activations += 1
                return True
            return False
    
    @classmethod
    def _release_activation_slot(cls):
        """Release an activation slot."""
        with cls._activation_lock:
            if cls._active_activations > 0:
                cls._active_activations -= 1
    
    # Error Handling Methods
    @classmethod
    def _handle_circuit_blocked(cls, subscription_id: str, circuit_state: str) -> Dict[str, Any]:
        """Handle circuit blocked state."""
        return {
            'success': False,
            'subscription_id': subscription_id,
            'status': 'service_unavailable',
            'circuit_state': circuit_state,
            'message': 'Activation service temporarily unavailable. Please try again later.',
            'retry_after': cls.CIRCUIT_BREAKER_TIMEOUT,
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def _queue_activation(cls, subscription: Subscription) -> Dict[str, Any]:
        """Queue activation for later processing."""
        queue_item = ActivationQueue.objects.create(
            subscription=subscription,
            activation_type='initial',
            priority=3,  # Lower priority for queued items
            metadata={'queued_reason': 'max_concurrent_reached'}
        )
        
        return {
            'success': True,
            'status': 'queued',
            'queue_item_id': str(queue_item.id),
            'message': 'Activation queued due to high load. Will be processed shortly.',
            'queue_position': ActivationQueue.objects.filter(
                status='pending'
            ).count(),
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def _handle_activation_error(cls, subscription: Subscription, response: Dict, duration: float) -> Dict[str, Any]:
        """Handle activation API error."""
        error_msg = response.get('error', 'Unknown activation error')
        error_code = response.get('error_code', 'UNKNOWN')
        
        logger.error(f"Activation failed for subscription {subscription.id}: {error_msg}")
        
        # Update subscription
        subscription.status = 'failed'
        subscription.activation_error = f'Activation error: {error_msg}'
        subscription.activation_attempts += 1
        subscription.save()
        
        # Record failure for circuit breaker
        cls._record_failure()
        
        # Log the error
        OperationLog.log_operation(
            operation_type='subscription_activation',
            severity='error',
            subscription=subscription,
            description=f"Activation request failed for {subscription.client_type}",
            details={
                'error_code': error_code,
                'response': response,
                'duration_seconds': duration
            },
            source_module='activation_service',
            source_function='request_subscription_activation',
            duration_ms=int(duration * 1000)
        )
        
        return {
            'success': False,
            'subscription_id': str(subscription.id),
            'status': 'activation_failed',
            'error': error_msg,
            'error_code': error_code,
            'activation_attempts': subscription.activation_attempts,
            'duration_seconds': duration,
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def _handle_timeout_error(cls, subscription: Subscription) -> Dict[str, Any]:
        """Handle timeout error."""
        logger.error(f"Activation timeout for subscription {subscription.id}")
        
        # Record failure
        cls._record_failure()
        
        # Create queued activation for retry
        queue_item = ActivationQueue.objects.create(
            subscription=subscription,
            activation_type='initial',
            priority=4,  # Higher priority for timeout retry
            metadata={'failure_reason': 'timeout', 'retry_count': 0}
        )
        
        return {
            'success': False,
            'subscription_id': str(subscription.id),
            'status': 'timeout',
            'message': 'Activation request timed out. Queued for retry.',
            'queue_item_id': str(queue_item.id),
            'retry_scheduled': True,
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def _handle_connection_error(cls, subscription: Subscription) -> Dict[str, Any]:
        """Handle connection error."""
        logger.error(f"Connection error for subscription {subscription.id}")
        
        # Record failure
        cls._record_failure()
        
        return {
            'success': False,
            'subscription_id': str(subscription.id),
            'status': 'connection_error',
            'message': 'Cannot connect to network service. Please check your connection.',
            'retry_recommended': True,
            'timestamp': timezone.now().isoformat()
        }
    
    @classmethod
    def _handle_unexpected_error(cls, subscription: Subscription, error: Exception) -> Dict[str, Any]:
        """Handle unexpected error."""
        error_msg = str(error)
        logger.error(f"Unexpected error for subscription {subscription.id}: {error_msg}")
        
        # Record failure
        cls._record_failure()
        
        # Log the error
        OperationLog.log_operation(
            operation_type='subscription_activation',
            severity='error',
            subscription=subscription,
            description=f"Unexpected error during activation",
            details={
                'error': error_msg,
                'subscription_id': str(subscription.id),
                'client_type': subscription.client_type
            },
            source_module='activation_service',
            source_function='request_subscription_activation'
        )
        
        return {
            'success': False,
            'subscription_id': str(subscription.id),
            'status': 'unexpected_error',
            'error': error_msg,
            'message': 'An unexpected error occurred. Please contact support.',
            'timestamp': timezone.now().isoformat()
        }
    
    # Health Check Methods
    @classmethod
    def check_network_management_health(cls) -> Dict[str, Any]:
        """
        Check network management service health.
        
        Returns:
            Health status
        """
        try:
            health = NetworkAdapter.health_check()
            
            # Check if healthy
            is_healthy = health.get('status') == 'healthy'
            
            return {
                'success': True,
                'healthy': is_healthy,
                'status': health.get('status', 'unknown'),
                'details': health,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Network management health check failed: {e}")
            return {
                'success': False,
                'healthy': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def get_network_management_status(cls) -> Dict[str, Any]:
        """
        Get detailed network management status.
        
        Returns:
            Detailed status information
        """
        try:
            # Check health
            health = cls.check_network_management_health()
            
            # Get activation statistics
            recent_activations = ActivationQueue.objects.filter(
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).count()
            
            successful_activations = ActivationQueue.objects.filter(
                created_at__gte=timezone.now() - timedelta(hours=24),
                status='completed'
            ).count()
            
            success_rate = (
                (successful_activations / recent_activations * 100) 
                if recent_activations > 0 else 0
            )
            
            return {
                'success': True,
                'health': health,
                'performance': {
                    'recent_activations_24h': recent_activations,
                    'successful_activations_24h': successful_activations,
                    'success_rate_percentage': round(success_rate, 2),
                    'average_activation_time_seconds': cls._get_average_activation_time(),
                    'active_connections': cls._active_activations
                },
                'circuit_breaker': {
                    'state': cls._circuit_state,
                    'failure_count': cls._failure_count,
                    'threshold': cls.CIRCUIT_BREAKER_THRESHOLD,
                    'opened_at': cls._circuit_opened_at.isoformat() if cls._circuit_opened_at else None
                },
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get network management status: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _get_average_activation_time(cls) -> float:
        """Get average activation time from recent successful activations."""
        try:
            recent_completed = ActivationQueue.objects.filter(
                status='completed',
                completed_at__gte=timezone.now() - timedelta(hours=24),
                actual_duration_seconds__gt=0
            )
            
            if not recent_completed.exists():
                return 0.0
            
            total_time = sum(item.actual_duration_seconds for item in recent_completed)
            return total_time / recent_completed.count()
            
        except Exception:
            return 0.0
    
    @classmethod
    def health_check(cls) -> Dict[str, Any]:
        """
        Comprehensive health check for activation service.
        
        Returns:
            Health status with all components
        """
        try:
            # Check network adapter health
            network_health = NetworkAdapter.health_check()
            
            # Check circuit breaker
            circuit_state = cls._check_circuit_breaker()
            
            # Check queue status
            queue_status = {
                'pending': ActivationQueue.objects.filter(status='pending').count(),
                'processing': ActivationQueue.objects.filter(status='processing').count(),
                'failed': ActivationQueue.objects.filter(status='failed').count(),
                'retrying': ActivationQueue.objects.filter(status='retrying').count()
            }
            
            # Determine overall status
            network_status = network_health.get('status', 'unknown')
            
            if network_status == 'healthy' and circuit_state == 'closed':
                overall_status = 'healthy'
            elif network_status == 'unavailable' or circuit_state == 'open':
                overall_status = 'unavailable'
            else:
                overall_status = 'degraded'
            
            health_status = {
                'service': 'activation_service',
                'status': overall_status,
                'network_adapter': network_health,
                'circuit_breaker': {
                    'state': circuit_state,
                    'failure_count': cls._failure_count,
                    'threshold': cls.CIRCUIT_BREAKER_THRESHOLD,
                    'active_connections': cls._active_activations,
                    'max_concurrent': cls.MAX_CONCURRENT_ACTIVATIONS
                },
                'queue_status': queue_status,
                'performance': {
                    'average_activation_time': cls._get_average_activation_time(),
                    'success_rate_24h': cls._calculate_success_rate()
                },
                'timestamp': timezone.now().isoformat()
            }
            
            return health_status
            
        except Exception as e:
            logger.error(f"Activation service health check failed: {e}")
            
            return {
                'service': 'activation_service',
                'status': 'unavailable',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @classmethod
    def _calculate_success_rate(cls) -> float:
        """Calculate activation success rate for last 24 hours."""
        try:
            total_activations = ActivationQueue.objects.filter(
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).count()
            
            successful_activations = ActivationQueue.objects.filter(
                created_at__gte=timezone.now() - timedelta(hours=24),
                status='completed'
            ).count()
            
            if total_activations == 0:
                return 100.0  # No activations means no failures
            
            return (successful_activations / total_activations) * 100
            
        except Exception:
            return 0.0