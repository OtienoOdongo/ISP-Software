"""
Service Operations - Client Service
Production-ready client-facing business logic with complete method implementations
Handles client operations, subscriptions, and service availability
"""

import logging
from typing import Dict, Any, Optional, List, Tuple
from django.utils import timezone
from django.db import transaction
from django.core.cache import cache
from django.conf import settings
from django.core.exceptions import ValidationError
from decimal import Decimal

from service_operations.models import Subscription, UsageTracking, ClientOperation
from service_operations.models import OperationLog, ActivationQueue
from service_operations.services.integration_service import IntegrationService
from service_operations.services.subscription_service import SubscriptionService
from service_operations.services.activation_service import ActivationService
from service_operations.services.queue_service import QueueService
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.network_adapter import NetworkAdapter
from service_operations.adapters.user_management_adapter import UserManagementAdapter
from service_operations.utils.validators import validate_mac_address
from service_operations.utils.calculators import calculate_usage_percentage, format_bytes_human_readable, format_seconds_human_readable
from service_operations.utils.calculators import calculate_estimated_cost, calculate_data_usage_trend

logger = logging.getLogger(__name__)


class ClientService:
    """
    Production-ready service containing comprehensive business logic 
    for client-facing operations managed by Service Operations app.
    """
    
    # Service constants
    MIN_DURATION_HOURS = 1
    MAX_DURATION_HOURS = 744  # 31 days
    DEFAULT_DURATION_HOURS = 24
    NEAR_EXPIRY_HOURS = 24
    MAX_ACTIVE_SUBSCRIPTIONS = 5
    
    @staticmethod
    def prepare_subscription_data_for_purchase(
        validated_data: Dict[str, Any], 
        client_id: str
    ) -> Dict[str, Any]:
        """
        Prepare internal subscription data dictionary for purchase.
        
        Args:
            validated_data: Validated purchase request data
            client_id: Client ID from authentication
        
        Returns:
            Dictionary ready for subscription creation
        
        Raises:
            ValidationError: If data is invalid
            ValueError: If plan is not available
        """
        try:
            # Extract data
            plan_id = validated_data['internet_plan_id']
            client_type = validated_data['client_type']
            access_method = 'hotspot' if client_type == 'hotspot_client' else 'pppoe'
            hotspot_mac_address = validated_data.get('hotspot_mac_address')
            duration_hours = validated_data.get('duration_hours', ClientService.DEFAULT_DURATION_HOURS)
            
            # Validate duration
            if not (ClientService.MIN_DURATION_HOURS <= duration_hours <= ClientService.MAX_DURATION_HOURS):
                raise ValidationError({
                    'duration_hours': f'Duration must be between {ClientService.MIN_DURATION_HOURS} and {ClientService.MAX_DURATION_HOURS} hours'
                })
            
            # Validate MAC address if provided for hotspot
            if client_type == 'hotspot_client' and hotspot_mac_address:
                if not validate_mac_address(hotspot_mac_address):
                    raise ValidationError({
                        'hotspot_mac_address': 'Invalid MAC address format. Use format: 00:11:22:33:44:55 or 00-11-22-33-44-55'
                    })
            
            # Fetch plan details from external adapter
            plan_details = InternetPlansAdapter.get_plan_details(str(plan_id))
            if not plan_details:
                raise ValueError(f"Plan {plan_id} not found")
            
            if not plan_details.get('is_active', False):
                raise ValueError(f"Plan {plan_id} is not active")
            
            # Check plan compatibility with access method
            compatibility = InternetPlansAdapter.check_plan_compatibility(
                plan_id=str(plan_id),
                access_method=access_method
            )
            
            if not compatibility.get('compatible', True):
                raise ValidationError({
                    'access_method': f"Plan {plan_id} is not compatible with {access_method} access method"
                })
            
            # Calculate dates
            start_date = validated_data.get('start_date') or timezone.now()
            duration_seconds = duration_hours * 3600
            
            # Get plan duration if not specified
            plan_duration = plan_details.get('duration_seconds', duration_seconds)
            if 'duration_hours' not in validated_data and plan_duration:
                duration_seconds = plan_duration
            
            end_date = start_date + timezone.timedelta(seconds=duration_seconds)
            
            # Prepare subscription data with correct field names
            subscription_data = {
                'client_id': client_id,
                'internet_plan_id': plan_id,
                'client_type': client_type,
                'access_method': access_method,
                'hotspot_mac_address': hotspot_mac_address if client_type == 'hotspot_client' else None,
                'router_id': validated_data.get('router_id'),
                'start_date': start_date,
                'end_date': end_date,
                'status': 'draft',
                'data_limit_bytes': plan_details.get('data_limit_bytes', 0),
                'time_limit_seconds': plan_details.get('time_limit_seconds', 0),
                'used_data_bytes': 0,
                'used_time_seconds': 0,
                'auto_renew': validated_data.get('auto_renew', False),
                'metadata': {
                    'purchase_source': validated_data.get('purchase_source', 'web'),
                    'duration_hours': duration_hours,
                    'plan_name': plan_details.get('name', 'Unknown'),
                    'plan_price': str(plan_details.get('price', '0')),
                    'client_timezone': validated_data.get('client_timezone', 'UTC')
                }
            }
            
            logger.info(f"Prepared subscription data for client {client_id}, plan {plan_id}")
            return subscription_data
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Failed to prepare subscription data: {e}", exc_info=True)
            raise ValueError(f"Failed to prepare subscription: {str(e)}")
    
    @staticmethod
    def prepare_subscription_data_for_renewal(
        current_subscription: Subscription,
        validated_data: Dict[str, Any],
        client_id: str
    ) -> Dict[str, Any]:
        """
        Prepare subscription data for renewal.
        
        Args:
            current_subscription: Current subscription being renewed
            validated_data: Validated renewal data
            client_id: Client ID
        
        Returns:
            Dictionary for new subscription creation
        """
        try:
            # Determine new plan ID (default to current plan)
            new_plan_id = validated_data.get('internet_plan_id', current_subscription.internet_plan_id)
            
            # Fetch new plan details
            new_plan_details = InternetPlansAdapter.get_plan_details(str(new_plan_id))
            if not new_plan_details or not new_plan_details.get('is_active', False):
                raise ValueError(f"Renewal plan {new_plan_id} is not available or inactive")
            
            # Calculate new dates
            # Start renewal immediately or after current expires
            renewal_strategy = validated_data.get('renewal_strategy', 'immediate')
            
            if renewal_strategy == 'immediate' or current_subscription.is_expired:
                new_start_date = timezone.now()
            else:
                new_start_date = current_subscription.end_date or timezone.now()
            
            # Calculate duration
            duration_hours = validated_data.get('duration_hours')
            if not duration_hours:
                # Use plan default duration
                plan_duration = new_plan_details.get('duration_seconds', 24 * 3600)
                duration_hours = plan_duration // 3600
            
            new_end_date = new_start_date + timezone.timedelta(hours=duration_hours)
            
            # Prepare new subscription data with correct field names
            new_subscription_data = {
                'client_id': client_id,
                'internet_plan_id': new_plan_id,
                'client_type': current_subscription.client_type,
                'access_method': current_subscription.access_method,
                'hotspot_mac_address': current_subscription.hotspot_mac_address,
                'router_id': current_subscription.router_id,
                'start_date': new_start_date,
                'end_date': new_end_date,
                'status': 'draft',
                'data_limit_bytes': new_plan_details.get('data_limit_bytes', 0),
                'time_limit_seconds': new_plan_details.get('time_limit_seconds', 0),
                'used_data_bytes': 0,
                'used_time_seconds': 0,
                'auto_renew': validated_data.get('auto_renew', current_subscription.auto_renew),
                'parent_subscription': current_subscription,
                'metadata': {
                    'renewal_from': str(current_subscription.id),
                    'renewal_strategy': renewal_strategy,
                    'duration_hours': duration_hours,
                    'plan_name': new_plan_details.get('name', 'Unknown'),
                    'plan_price': str(new_plan_details.get('price', '0'))
                }
            }
            
            logger.info(
                f"Prepared renewal data for client {client_id}, "
                f"from subscription {current_subscription.id} to plan {new_plan_id}"
            )
            return new_subscription_data
            
        except Exception as e:
            logger.error(f"Failed to prepare renewal data: {e}", exc_info=True)
            raise ValueError(f"Failed to prepare renewal: {str(e)}")
    
    @staticmethod
    def get_client_subscription_summary(subscription: Subscription) -> Dict[str, Any]:
        """
        Get comprehensive subscription summary for client display.
        
        Args:
            subscription: Subscription to summarize
        
        Returns:
            Detailed summary dictionary
        """
        try:
            # Fetch plan details
            plan_details = InternetPlansAdapter.get_plan_details(str(subscription.internet_plan_id))
            
            # Calculate usage metrics
            usage_percentage = subscription.usage_percentage
            
            # Calculate time remaining
            time_remaining_display = "Expired"
            if subscription.end_date and subscription.end_date > timezone.now():
                delta = subscription.end_date - timezone.now()
                if delta.days > 0:
                    time_remaining_display = f"{delta.days} day{'s' if delta.days != 1 else ''}"
                else:
                    hours = delta.seconds // 3600
                    minutes = (delta.seconds % 3600) // 60
                    time_remaining_display = f"{hours}h {minutes}m"
            
            # Check if near expiry (within 24 hours)
            is_near_expiry = False
            if subscription.end_date and subscription.status == 'active':
                hours_to_expiry = (subscription.end_date - timezone.now()).total_seconds() / 3600
                is_near_expiry = 0 < hours_to_expiry <= 24
            
            # Check if can be renewed (active and not expired)
            can_be_renewed = subscription.status == 'active' and not subscription.is_expired
            
            # Prepare comprehensive summary
            summary = {
                'subscription_id': str(subscription.id),
                'status': subscription.status,
                'status_display': subscription.get_status_display(),
                'is_active': subscription.is_active,
                'is_expired': subscription.is_expired,
                'is_near_expiry': is_near_expiry,
                'can_be_activated': subscription.can_be_activated,
                'can_be_renewed': can_be_renewed,
                
                # Dates
                'start_date': subscription.start_date.isoformat() if subscription.start_date else None,
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                'time_remaining_display': time_remaining_display,
                'days_remaining': (
                    (subscription.end_date - timezone.now()).days 
                    if subscription.end_date and not subscription.is_expired 
                    else 0
                ),
                
                # Technical details
                'client_type': subscription.client_type,
                'client_type_display': subscription.get_client_type_display(),
                'access_method': subscription.access_method,
                'access_method_display': subscription.get_access_method_display(),
                'hotspot_mac_address': subscription.hotspot_mac_address,
                'router_id': subscription.router_id,
                
                # Plan information
                'plan': plan_details or {},
                
                # Usage details
                'usage': {
                    'data': {
                        'used_bytes': subscription.used_data_bytes,
                        'used_display': format_bytes_human_readable(subscription.used_data_bytes),
                        'remaining_bytes': subscription.remaining_data_bytes,
                        'remaining_display': format_bytes_human_readable(subscription.remaining_data_bytes),
                        'limit_bytes': subscription.data_limit_bytes,
                        'limit_display': format_bytes_human_readable(subscription.data_limit_bytes),
                        'percentage': usage_percentage['data'],
                        'unlimited': subscription.data_limit_bytes == 0
                    },
                    'time': {
                        'used_seconds': subscription.used_time_seconds,
                        'used_display': format_seconds_human_readable(subscription.used_time_seconds),
                        'remaining_seconds': subscription.remaining_time_seconds,
                        'remaining_display': format_seconds_human_readable(subscription.remaining_time_seconds),
                        'limit_seconds': subscription.time_limit_seconds,
                        'limit_display': format_seconds_human_readable(subscription.time_limit_seconds),
                        'percentage': usage_percentage['time'],
                        'unlimited': subscription.time_limit_seconds == 0
                    }
                },
                
                # Activation status
                'activation': {
                    'attempts': subscription.activation_attempts,
                    'successful': subscription.activation_successful,
                    'completed_at': (
                        subscription.activation_completed_at.isoformat() 
                        if subscription.activation_completed_at else None
                    ),
                    'error': subscription.activation_error,
                },
                
                # Renewal settings
                'auto_renew': subscription.auto_renew,
                
                # Payment reference
                'payment_reference': subscription.payment_reference,
                'payment_method': subscription.payment_method,
                'payment_confirmed_at': (
                    subscription.payment_confirmed_at.isoformat()
                    if subscription.payment_confirmed_at else None
                ),
                
                # Parent subscription for renewals
                'parent_subscription_id': (
                    str(subscription.parent_subscription.id) 
                    if subscription.parent_subscription else None
                ),
                
                # Timestamps
                'created_at': subscription.created_at.isoformat(),
                'updated_at': subscription.updated_at.isoformat(),
                'last_usage_update': (
                    subscription.last_usage_update.isoformat() 
                    if subscription.last_usage_update else None
                )
            }
            
            # Add daily usage summary if available
            try:
                today = timezone.now().date()
                usage_records = UsageTracking.objects.filter(
                    subscription=subscription,
                    session_start__date=today
                )
                
                if usage_records.exists():
                    daily_data = sum(r.data_used_bytes for r in usage_records)
                    daily_time = sum(r.session_duration_seconds for r in usage_records)
                    
                    summary['usage']['today'] = {
                        'data_used_bytes': daily_data,
                        'data_used_display': format_bytes_human_readable(daily_data),
                        'time_used_seconds': daily_time,
                        'time_used_display': format_seconds_human_readable(daily_time),
                        'sessions': usage_records.count()
                    }
            except Exception:
                pass  # Don't fail if usage data is unavailable
            
            logger.debug(f"Generated client summary for subscription {subscription.id}")
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate subscription summary: {e}", exc_info=True)
            # Return basic summary even if some data fails
            return {
                'subscription_id': str(subscription.id),
                'status': subscription.status,
                'status_display': subscription.get_status_display(),
                'error': 'Failed to load complete details'
            }
    
    @staticmethod
    def get_client_operation_summary(operation: ClientOperation) -> Dict[str, Any]:
        """
        Get comprehensive operation summary for client display.
        
        Args:
            operation: Client operation to summarize
        
        Returns:
            Detailed operation summary
        """
        try:
            # Calculate SLA status
            sla_status = 'ok'
            if operation.sla_due_at:
                now = timezone.now()
                if operation.sla_breached:
                    sla_status = 'breached'
                elif operation.sla_due_at <= now:
                    sla_status = 'overdue'
                elif operation.sla_due_at <= now + timezone.timedelta(hours=1):
                    sla_status = 'urgent'
                elif operation.sla_due_at <= now + timezone.timedelta(hours=4):
                    sla_status = 'warning'
            
            # Calculate progress if applicable
            progress_percentage = 0
            if operation.current_step and operation.total_steps:
                progress_percentage = min(100, (operation.current_step / operation.total_steps) * 100)
            
            # Calculate durations
            duration_seconds = None
            response_time_seconds = None
            
            if operation.started_at and operation.completed_at:
                duration_seconds = int((operation.completed_at - operation.started_at).total_seconds())
            
            if operation.started_at:
                response_time_seconds = int((operation.started_at - operation.requested_at).total_seconds())
            
            summary = {
                'operation_id': str(operation.id),
                'client_id': str(operation.client_id),
                'client_type': operation.client_type,
                'operation_type': operation.operation_type,
                'operation_type_display': operation.get_operation_type_display(),
                'status': operation.status,
                'status_display': operation.get_status_display(),
                'priority': operation.priority,
                'priority_display': operation.get_priority_display(),
                
                # Operation details
                'title': operation.title,
                'description': operation.description,
                'source_platform': operation.source_platform,
                'source_platform_display': operation.get_source_platform_display(),
                
                # Timestamps
                'requested_at': operation.requested_at.isoformat(),
                'started_at': operation.started_at.isoformat() if operation.started_at else None,
                'completed_at': operation.completed_at.isoformat() if operation.completed_at else None,
                'created_at': operation.created_at.isoformat(),
                'updated_at': operation.updated_at.isoformat(),
                
                # SLA information
                'sla': {
                    'due_at': operation.sla_due_at.isoformat() if operation.sla_due_at else None,
                    'breached': operation.sla_breached,
                    'status': sla_status,
                },
                
                # Results and outcomes
                'result_data': operation.result_data,
                'error_message': operation.error_message,
                'error_details': operation.error_details,
                
                # Progress tracking
                'current_step': operation.current_step,
                'total_steps': operation.total_steps,
                'progress_percentage': progress_percentage,
                
                # Related subscription
                'subscription_id': (
                    str(operation.subscription.id) 
                    if operation.subscription else None
                ),
                
                # Metadata and tags
                'metadata': operation.metadata,
                'tags': operation.tags,
                
                # Calculated fields
                'duration_seconds': duration_seconds,
                'response_time_seconds': response_time_seconds,
                'is_completed': operation.status == 'completed'
            }
            
            logger.debug(f"Generated operation summary for operation {operation.id}")
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate operation summary: {e}", exc_info=True)
            return {
                'operation_id': str(operation.id),
                'status': operation.status,
                'error': 'Failed to load complete details'
            }
    
    @staticmethod
    def check_service_availability(
        client_id: str, 
        client_type: str, 
        plan_id: Optional[str] = None,
        hotspot_mac_address: Optional[str] = None,
        router_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive service availability check.
        
        Args:
            client_id: Client ID
            client_type: Client type (hotspot_client or pppoe_client)
            plan_id: Optional plan ID for compatibility check
            hotspot_mac_address: Optional MAC address for hotspot validation
            router_id: Optional router ID for compatibility
        
        Returns:
            Availability status with detailed checks
        """
        logger.info(
            f"Checking service availability for client {client_id}, "
            f"type {client_type}, plan {plan_id}"
        )
        
        checks = {
            'client_exists': False,
            'client_active': False,
            'client_type_valid': False,
            'plan_compatible': False,
            'network_available': False,
            'mac_address_valid': True,
            'max_subscriptions': False,
        }
        
        reasons = []
        warnings = []
        
        try:
            # 1. Check client exists and is active via User Management adapter
            try:
                client_details = UserManagementAdapter.get_client_details(client_id)
                if client_details:
                    checks['client_exists'] = True
                    checks['client_active'] = client_details.get('is_active', False)
                    
                    if not checks['client_active']:
                        reasons.append("Client account is not active")
            except Exception as e:
                logger.warning(f"Could not verify client {client_id}: {e}")
                reasons.append("Could not verify client status")
            
            # 2. Validate client type
            valid_client_types = ['hotspot_client', 'pppoe_client']
            if client_type in valid_client_types:
                checks['client_type_valid'] = True
            else:
                reasons.append(f"Client type '{client_type}' is not supported")
            
            # 3. Validate MAC address if provided for hotspot
            if hotspot_mac_address and client_type == 'hotspot_client':
                if not validate_mac_address(hotspot_mac_address):
                    checks['mac_address_valid'] = False
                    reasons.append("Invalid MAC address format for hotspot")
            
            # 4. Check plan compatibility if plan_id provided
            if plan_id:
                try:
                    # Determine access method from client type
                    access_method = 'hotspot' if client_type == 'hotspot_client' else 'pppoe'
                    
                    compatibility = InternetPlansAdapter.check_plan_compatibility(
                        plan_id=str(plan_id),
                        access_method=access_method,
                        router_id=router_id
                    )
                    checks['plan_compatible'] = compatibility.get('compatible', False)
                    
                    if not checks['plan_compatible']:
                        reasons.append(f"Plan {plan_id} is not compatible with {client_type}")
                        if 'errors' in compatibility:
                            reasons.extend(compatibility['errors'])
                except Exception as e:
                    logger.warning(f"Plan compatibility check failed: {e}")
                    reasons.append("Could not verify plan compatibility")
            
            # 5. Check network management service health
            try:
                network_health = NetworkAdapter.health_check()
                checks['network_available'] = network_health.get('status') == 'healthy'
                
                if not checks['network_available']:
                    reasons.append("Network management system is unavailable")
            except Exception as e:
                logger.warning(f"Network health check failed: {e}")
                reasons.append("Network service health check failed")
            
            # 6. Check maximum active subscriptions
            try:
                active_count = Subscription.objects.filter(
                    client_id=client_id,
                    status='active',
                    is_active=True
                ).count()
                
                if active_count >= ClientService.MAX_ACTIVE_SUBSCRIPTIONS:
                    checks['max_subscriptions'] = True
                    reasons.append(f"Maximum {ClientService.MAX_ACTIVE_SUBSCRIPTIONS} active subscriptions reached")
            except Exception as e:
                logger.warning(f"Subscription count check failed: {e}")
                warnings.append("Could not verify subscription limit")
            
            # 7. Check for conflicting subscriptions (same MAC for hotspot)
            if hotspot_mac_address and client_type == 'hotspot_client':
                conflicting = Subscription.objects.filter(
                    hotspot_mac_address=hotspot_mac_address,
                    status='active',
                    is_active=True
                ).exclude(client_id=client_id).exists()
                
                if conflicting:
                    warnings.append("MAC address is associated with another active subscription")
            
            # Determine overall availability
            all_checks_passed = all(checks.values())
            is_available = all_checks_passed and not reasons
            
            response = {
                'success': True,
                'available': is_available,
                'checks': checks,
                'reasons': reasons if not is_available else [],
                'warnings': warnings,
                'recommendations': [],
                'timestamp': timezone.now().isoformat()
            }
            
            # Add recommendations if not available
            if not is_available:
                if not checks['client_exists']:
                    response['recommendations'].append("Contact support to verify your account")
                if not checks['client_type_valid']:
                    response['recommendations'].append(f"Try a different client type: {', '.join(valid_client_types)}")
                if not checks['plan_compatible'] and plan_id:
                    response['recommendations'].append("Choose a different plan or contact support")
            
            logger.info(f"Service availability check for client {client_id}: available={is_available}")
            return response
            
        except Exception as e:
            logger.error(f"Service availability check failed: {e}", exc_info=True)
            return {
                'success': False,
                'available': False,
                'error': 'Service availability check failed',
                'checks': checks,
                'reasons': ['Internal service error'],
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    @transaction.atomic
    def create_client_operation_record(
        client_id: str,
        operation_type: str,
        title: str,
        description: str,
        client_type: str,
        subscription_id: Optional[str] = None,
        priority: int = 2,
        source_platform: str = 'dashboard',
        sla_hours: int = 24,
        **kwargs
    ) -> Optional[ClientOperation]:
        """
        Create a comprehensive client operation record.
        
        Args:
            client_id: Client ID
            operation_type: Type of operation
            title: Operation title
            description: Operation description
            client_type: Client type (hotspot_client or pppoe_client)
            subscription_id: Optional related subscription ID
            priority: Priority level (1-5)
            source_platform: How the request was made
            sla_hours: SLA in hours
            **kwargs: Additional operation fields
        
        Returns:
            Created ClientOperation instance or None
        """
        try:
            # Validate priority
            if not 1 <= priority <= 5:
                priority = 2
            
            # Get subscription if provided
            subscription = None
            if subscription_id:
                try:
                    subscription = Subscription.objects.get(id=subscription_id, is_active=True)
                except Subscription.DoesNotExist:
                    logger.warning(f"Subscription {subscription_id} not found for operation")
            
            # Calculate SLA due date
            sla_due_at = timezone.now() + timezone.timedelta(hours=sla_hours)
            
            # Create operation
            operation = ClientOperation.objects.create(
                client_id=client_id,
                client_type=client_type,
                subscription=subscription,
                operation_type=operation_type,
                title=title,
                description=description,
                priority=priority,
                source_platform=source_platform,
                sla_due_at=sla_due_at,
                metadata={
                    'created_by_service': 'client_service',
                    'sla_hours': sla_hours,
                    **kwargs.get('metadata', {})
                },
                **{k: v for k, v in kwargs.items() if k not in ['metadata']}
            )
            
            # Log the operation creation
            OperationLog.log_operation(
                operation_type='client_operation_created',
                severity='info',
                subscription=subscription,
                description=f"Client operation created: {title}",
                details={
                    'operation_id': str(operation.id),
                    'client_id': client_id,
                    'client_type': client_type,
                    'operation_type': operation_type,
                    'priority': priority,
                    'sla_due_at': sla_due_at.isoformat()
                },
                source_module='client_service',
                source_function='create_client_operation_record'
            )
            
            logger.info(f"Created client operation {operation.id} for client {client_id}")
            return operation
            
        except Exception as e:
            logger.error(f"Failed to create client operation for client {client_id}: {e}", exc_info=True)
            
            # Log error but don't fail the main operation
            OperationLog.log_operation(
                operation_type='client_operation_error',
                severity='error',
                subscription=None,
                description=f"Failed to create client operation: {e}",
                details={
                    'client_id': client_id,
                    'operation_type': operation_type,
                    'title': title
                },
                source_module='client_service',
                source_function='create_client_operation_record'
            )
            return None
    
    @staticmethod
    def get_client_dashboard_summary(client_id: str) -> Dict[str, Any]:
        """
        Get comprehensive dashboard summary for a client.
        
        Args:
            client_id: Client ID
        
        Returns:
            Dashboard summary with subscriptions, usage, and operations
        """
        try:
            # Get all active subscriptions
            subscriptions = Subscription.objects.filter(
                client_id=client_id,
                is_active=True
            ).order_by('-created_at')
            
            # Get active subscriptions
            active_subscriptions = subscriptions.filter(status='active')
            
            # Get recent operations
            recent_operations = ClientOperation.objects.filter(
                client_id=client_id
            ).order_by('-created_at')[:10]
            
            # Calculate usage totals
            total_data_used = sum(sub.used_data_bytes for sub in active_subscriptions)
            total_time_used = sum(sub.used_time_seconds for sub in active_subscriptions)
            
            # Get expiring soon subscriptions (within 24 hours)
            expiring_soon = []
            for sub in active_subscriptions:
                if sub.end_date:
                    hours_to_expiry = (sub.end_date - timezone.now()).total_seconds() / 3600
                    if 0 < hours_to_expiry <= 24:
                        expiring_soon.append(sub)
            
            # Get pending operations
            pending_operations = ClientOperation.objects.filter(
                client_id=client_id,
                status__in=['pending', 'in_progress']
            ).count()
            
            summary = {
                'client_id': client_id,
                'timestamp': timezone.now().isoformat(),
                
                # Subscription overview
                'subscriptions': {
                    'total': subscriptions.count(),
                    'active': active_subscriptions.count(),
                    'expiring_soon': len(expiring_soon),
                    'total_data_used': format_bytes_human_readable(total_data_used),
                    'total_time_used': format_seconds_human_readable(total_time_used),
                    'list': [
                        ClientService.get_client_subscription_summary(sub) 
                        for sub in subscriptions[:5]  # Limit to 5
                    ]
                },
                
                # Operations overview
                'operations': {
                    'total_pending': pending_operations,
                    'recent': [
                        ClientService.get_client_operation_summary(op) 
                        for op in recent_operations
                    ]
                },
                
                # Recommendations
                'recommendations': []
            }
            
            # Generate recommendations
            if expiring_soon:
                summary['recommendations'].append(
                    f"You have {len(expiring_soon)} subscription(s) expiring soon. Consider renewing them."
                )
            
            if pending_operations > 0:
                summary['recommendations'].append(
                    f"You have {pending_operations} pending operation(s) that require attention."
                )
            
            logger.info(f"Generated dashboard summary for client {client_id}")
            return summary
            
        except Exception as e:
            logger.error(f"Failed to generate dashboard for client {client_id}: {e}", exc_info=True)
            return {
                'client_id': client_id,
                'error': 'Failed to load dashboard',
                'timestamp': timezone.now().isoformat()
            }