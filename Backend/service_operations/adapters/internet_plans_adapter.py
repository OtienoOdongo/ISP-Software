"""
Service Operations - Internet Plans Adapter
Production-ready adapter for internet_plans app integration
Fully integrated with existing subscription service logic
Optimized to avoid duplication of model logic
"""

import logging
import requests
from typing import Dict, List, Optional, Any, Tuple
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction
import uuid
import json

from service_operations.models.subscription_models import Subscription
from service_operations.services.subscription_service import SubscriptionService
from service_operations.utils.validators import validate_mac_address, validate_duration_hours

logger = logging.getLogger(__name__)


class InternetPlansAdapter:
    """
    Production-ready adapter for internet_plans app
    Fully implements ServiceOperationsInterface from internet_plans app
    Uses existing subscription service logic for database operations
    Avoids duplication of model logic (PPPoe credentials, MAC validation, etc.)
    """
    
    # ==================== Core Interface Methods ====================
    
    @staticmethod
    def create_subscription(
        plan_id: str,
        client_id: str,
        access_method: str,
        duration_hours: int = 24,
        router_id: Optional[int] = None,
        mac_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new subscription for a client
        Uses existing subscription_service.create_subscription logic
        Delegates PPPoE credential generation to Subscription model
        """
        try:
            # Determine client type based on access method
            if access_method == 'hotspot':
                client_type = 'hotspot_client'
            elif access_method == 'pppoe':
                client_type = 'pppoe_client'
            else:
                raise ValueError(f"Unsupported access method: {access_method}")
            
            # Validate duration
            if not validate_duration_hours(duration_hours):
                raise ValueError(f"Invalid duration: {duration_hours} hours")
            
            # Check plan compatibility
            compatibility = InternetPlansAdapter.check_plan_compatibility(
                plan_id=plan_id,
                client_type=client_type,
                access_method=access_method,
                router_id=router_id
            )
            
            if not compatibility.get('compatible', False):
                raise ValueError(f"Plan not compatible: {compatibility.get('errors', ['Unknown error'])}")
            
            # Get plan technical configuration
            technical_config = InternetPlansAdapter.get_plan_technical_config(plan_id, access_method)
            
            if not technical_config:
                raise ValueError(f"Could not get technical configuration for plan: {plan_id}")
            
            # Calculate data and time limits from technical config
            data_limit_bytes = technical_config.get('data_limit_bytes', 
                technical_config.get('data_limit', {}).get('bytes', 10 * 1024 * 1024 * 1024))  # 10GB default
            time_limit_seconds = technical_config.get('time_limit_seconds',
                technical_config.get('time_limit', {}).get('seconds', 24 * 3600))  # 24 hours default
            
            # Prepare metadata
            metadata = {
                'plan_id': plan_id,
                'access_method': access_method,
                'duration_hours': duration_hours,
                'router_id': router_id,
                'technical_config': technical_config,
                'created_by': 'internet_plans_adapter',
                'source': 'internet_plans_integration'
            }
            
            # Use existing subscription service to create subscription
            subscription_result = SubscriptionService.create_subscription(
                client_id=client_id,
                internet_plan_id=plan_id,
                client_type=client_type,
                access_method=access_method,
                duration_hours=duration_hours,
                router_id=router_id,
                hotspot_mac_address=mac_address,
                scheduled_activation=None,  # Immediate activation after payment
                auto_renew=False,  # Default for new subscriptions
                metadata=metadata,
                created_by='internet_plans_adapter'
            )
            
            if not subscription_result.get('success'):
                raise ValueError(f"Subscription creation failed: {subscription_result.get('error')}")
            
            subscription_id = subscription_result['subscription_id']
            
            # Get the created subscription for details
            subscription = Subscription.objects.get(id=subscription_id)
            
            logger.info(f"Subscription created via adapter: {subscription_id}")
            
            return {
                'subscription_id': subscription_id,
                'status': subscription.status,
                'plan_id': plan_id,
                'client_id': client_id,
                'access_method': access_method,
                'start_date': subscription.start_date.isoformat(),
                'end_date': subscription.end_date.isoformat(),
                'transaction_reference': None,  # Will be set after payment
                'client_type': client_type,
                'router_id': router_id,
                'technical_config': technical_config,
                # Include credentials if they were auto-generated by the model
                'hotspot_mac_address': subscription.hotspot_mac_address,
                'pppoe_username': subscription.pppoe_username,
                'pppoe_password': subscription.pppoe_password
            }
            
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}", exc_info=True)
            raise
    
    @staticmethod
    def activate_subscription(
        subscription_id: str,
        transaction_reference: str
    ) -> Dict[str, Any]:
        """
        Activate a subscription after payment
        Uses existing activation logic
        """
        try:
            # Get subscription
            subscription = Subscription.objects.get(id=subscription_id)
            
            if subscription.status != 'pending_activation':
                raise ValueError(f"Subscription cannot be activated in status: {subscription.status}")
            
            # Use existing subscription service for activation
            activation_result = SubscriptionService.activate_subscription(
                subscription_id=subscription_id,
                payment_reference=transaction_reference,
                payment_method='api_payment',  # Default for adapter calls
                activate_immediately=True,
                priority=4
            )
            
            if not activation_result.get('success'):
                raise ValueError(f"Activation failed: {activation_result.get('error')}")
            
            # Return activation details
            return {
                'success': True,
                'subscription_id': subscription_id,
                'status': 'active',
                'activation_id': f"act_{subscription_id}_{int(timezone.now().timestamp())}",
                'transaction_reference': transaction_reference,
                'activated_at': timezone.now().isoformat(),
                'message': 'Subscription activated successfully'
            }
            
        except Subscription.DoesNotExist:
            raise ValueError(f"Subscription not found: {subscription_id}")
        except Exception as e:
            logger.error(f"Failed to activate subscription: {e}", exc_info=True)
            raise
    
    @staticmethod
    def check_plan_compatibility(
        plan_id: str,
        client_type: str,
        access_method: str,
        router_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Check if a plan is compatible with client type and access method
        Calls internet_plans API for compatibility check
        """
        try:
            # Cache key for compatibility check
            cache_key = f"plan_compatibility:{plan_id}:{client_type}:{access_method}:{router_id}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                return cached_result
            
            # Get internet plans API configuration
            internet_plans_url = getattr(settings, 'INTERNET_PLANS_BASE_URL', 'http://localhost:8000')
            api_token = getattr(settings, 'INTERNAL_API_TOKEN', '')
            
            # Prepare request data
            request_data = {
                'plan_id': plan_id,
                'access_method': access_method,
                'router_id': router_id
            }
            
            # Make API call to internet_plans compatibility endpoint
            headers = {
                'Content-Type': 'application/json'
            }
            
            if api_token:
                headers['Authorization'] = f'Bearer {api_token}'
            
            try:
                response = requests.post(
                    f"{internet_plans_url}/api/internet_plans/plans/compatibility/check/",
                    json=request_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get('success'):
                        compatibility_data = result.get('compatibility', {})
                        
                        # Map to expected format
                        compatibility_result = {
                            'compatible': compatibility_data.get('compatible', False),
                            'plan_name': compatibility_data.get('plan_name', 'Unknown Plan'),
                            'plan_type': compatibility_data.get('plan_type', 'paid'),
                            'client_type': client_type,
                            'access_method': access_method,
                            'router_compatible': compatibility_data.get('router_compatible', True),
                            'technical_config': compatibility_data.get('technical_config', {}),
                            'errors': compatibility_data.get('errors', []),
                            'warnings': compatibility_data.get('warnings', [])
                        }
                        
                        # Cache for 5 minutes
                        cache.set(cache_key, compatibility_result, 300)
                        
                        return compatibility_result
                
                # If API call fails, use fallback logic
                return InternetPlansAdapter._fallback_compatibility_check(
                    plan_id, client_type, access_method, router_id
                )
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Internet Plans API call failed: {e}")
                return InternetPlansAdapter._fallback_compatibility_check(
                    plan_id, client_type, access_method, router_id
                )
            
        except Exception as e:
            logger.error(f"Compatibility check failed: {e}")
            return InternetPlansAdapter._fallback_compatibility_check(
                plan_id, client_type, access_method, router_id
            )
    
    @staticmethod
    def _fallback_compatibility_check(
        plan_id: str,
        client_type: str,
        access_method: str,
        router_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Fallback compatibility check when internet_plans API is unavailable
        """
        # Get basic plan details
        plan_details = InternetPlansAdapter.get_plan_details(plan_id)
        
        if not plan_details:
            return {
                'compatible': False,
                'plan_name': 'Unknown Plan',
                'plan_type': 'unknown',
                'client_type': client_type,
                'access_method': access_method,
                'router_compatible': False,
                'technical_config': {},
                'errors': ['Plan not found'],
                'warnings': ['Using fallback compatibility check']
            }
        
        # Basic compatibility logic
        enabled_methods = plan_details.get('enabledAccessMethods', [])
        router_specific = plan_details.get('router_specific', False)
        
        # Check access method compatibility
        access_compatible = access_method in enabled_methods
        
        # Check router compatibility
        router_compatible = True
        if router_specific and router_id:
            allowed_routers = plan_details.get('allowedRouters', [])
            router_compatible = any(r.get('id') == router_id for r in allowed_routers)
        
        compatible = access_compatible and router_compatible
        
        errors = []
        if not access_compatible:
            errors.append(f"Plan does not support {access_method} access method")
        if not router_compatible:
            errors.append(f"Plan cannot be used on specified router")
        
        return {
            'compatible': compatible,
            'plan_name': plan_details.get('name', 'Unknown Plan'),
            'plan_type': plan_details.get('planType', 'paid'),
            'client_type': client_type,
            'access_method': access_method,
            'router_compatible': router_compatible,
            'technical_config': plan_details.get('technicalConfig', {}).get(access_method, {}),
            'errors': errors,
            'warnings': ['Using fallback compatibility check']
        }
    
    @staticmethod
    def get_plan_technical_config(
        plan_id: str,
        access_method: str
    ) -> Dict[str, Any]:
        """
        Get technical configuration for network activation
        """
        try:
            # Cache key for technical config
            cache_key = f"plan_tech_config:{plan_id}:{access_method}"
            cached_config = cache.get(cache_key)
            
            if cached_config:
                return cached_config
            
            # Get plan details
            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
            
            if not plan_details:
                logger.warning(f"Plan not found: {plan_id}")
                return InternetPlansAdapter._get_default_config(access_method)
            
            # Extract technical config
            tech_config = plan_details.get('technicalConfig', {}).get(access_method)
            
            if not tech_config:
                # Try to get from plan details
                access_methods_config = plan_details.get('accessMethods', {})
                method_config = access_methods_config.get(access_method, {})
                
                if method_config and method_config.get('enabled', False):
                    tech_config = {
                        'download_speed': method_config.get('downloadSpeed', {}).get('value', '10'),
                        'upload_speed': method_config.get('uploadSpeed', {}).get('value', '5'),
                        'data_limit': {
                            'bytes': InternetPlansAdapter._convert_to_bytes(
                                method_config.get('dataLimit', {}).get('value', '10'),
                                method_config.get('dataLimit', {}).get('unit', 'GB')
                            ),
                            'value': method_config.get('dataLimit', {}).get('value', '10'),
                            'unit': method_config.get('dataLimit', {}).get('unit', 'GB')
                        },
                        'time_limit': {
                            'seconds': InternetPlansAdapter._convert_to_seconds(
                                method_config.get('usageLimit', {}).get('value', '24'),
                                method_config.get('usageLimit', {}).get('unit', 'Hours')
                            ),
                            'value': method_config.get('usageLimit', {}).get('value', '24'),
                            'unit': method_config.get('usageLimit', {}).get('unit', 'Hours')
                        },
                        'max_devices': method_config.get('maxDevices', 1),
                        'session_timeout': method_config.get('sessionTimeout', 86400),
                        'idle_timeout': method_config.get('idleTimeout', 300),
                        'validity_period': {
                            'value': method_config.get('validityPeriod', {}).get('value', '30'),
                            'unit': method_config.get('validityPeriod', {}).get('unit', 'Days')
                        },
                        'mac_binding': method_config.get('macBinding', False),
                        'access_method': access_method,
                        'plan_name': plan_details.get('name', 'Unknown Plan')
                    }
                    
                    # Add PPPoE specific config
                    if access_method == 'pppoe':
                        tech_config.update({
                            'ip_pool': method_config.get('ipPool', 'pppoe-pool-default'),
                            'service_name': method_config.get('serviceName', ''),
                            'mtu': method_config.get('mtu', 1492),
                            'dns_servers': method_config.get('dnsServers', ['8.8.8.8', '1.1.1.1'])
                        })
            
            if not tech_config:
                tech_config = InternetPlansAdapter._get_default_config(access_method)
            
            # Cache for 5 minutes
            cache.set(cache_key, tech_config, 300)
            
            return tech_config
            
        except Exception as e:
            logger.error(f"Failed to get technical config: {e}")
            return InternetPlansAdapter._get_default_config(access_method)
    
    @staticmethod
    def _convert_to_bytes(value: str, unit: str) -> int:
        """Convert data value to bytes"""
        try:
            numeric_value = float(value)
            
            unit_multipliers = {
                'KB': 1024,
                'MB': 1024 * 1024,
                'GB': 1024 * 1024 * 1024,
                'TB': 1024 * 1024 * 1024 * 1024
            }
            
            multiplier = unit_multipliers.get(unit.upper(), 1)
            return int(numeric_value * multiplier)
        except:
            return 10 * 1024 * 1024 * 1024  # 10GB default
    
    @staticmethod
    def _convert_to_seconds(value: str, unit: str) -> int:
        """Convert time value to seconds"""
        try:
            numeric_value = float(value)
            
            unit_multipliers = {
                'Seconds': 1,
                'Minutes': 60,
                'Hours': 60 * 60,
                'Days': 24 * 60 * 60,
                'Weeks': 7 * 24 * 60 * 60,
                'Months': 30 * 24 * 60 * 60
            }
            
            multiplier = unit_multipliers.get(unit, 3600)  # Default to hours
            return int(numeric_value * multiplier)
        except:
            return 24 * 3600  # 24 hours default
    
    @staticmethod
    def _get_default_config(access_method: str) -> Dict[str, Any]:
        """
        Get default technical configuration
        """
        if access_method == 'hotspot':
            return {
                'download_speed': '10',
                'upload_speed': '5',
                'data_limit': {
                    'bytes': 10 * 1024 * 1024 * 1024,
                    'value': '10',
                    'unit': 'GB'
                },
                'time_limit': {
                    'seconds': 24 * 3600,
                    'value': '24',
                    'unit': 'Hours'
                },
                'max_devices': 1,
                'session_timeout': 86400,
                'idle_timeout': 300,
                'validity_period': {
                    'value': '30',
                    'unit': 'Days'
                },
                'mac_binding': False,
                'access_method': 'hotspot',
                'plan_name': 'Default Hotspot Plan'
            }
        else:  # pppoe
            return {
                'download_speed': '10',
                'upload_speed': '5',
                'data_limit': {
                    'bytes': 10 * 1024 * 1024 * 1024,
                    'value': '10',
                    'unit': 'GB'
                },
                'time_limit': {
                    'seconds': 24 * 3600,
                    'value': '24',
                    'unit': 'Hours'
                },
                'max_devices': 1,
                'session_timeout': 86400,
                'idle_timeout': 300,
                'validity_period': {
                    'value': '30',
                    'unit': 'Days'
                },
                'mac_binding': False,
                'access_method': 'pppoe',
                'plan_name': 'Default PPPoE Plan',
                'ip_pool': 'pppoe-pool-default',
                'service_name': '',
                'mtu': 1492,
                'dns_servers': ['8.8.8.8', '1.1.1.1']
            }
    
    @staticmethod
    def get_subscription_details(subscription_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a subscription
        """
        try:
            subscription = Subscription.objects.get(id=subscription_id)
            
            # Get plan details
            plan_details = InternetPlansAdapter.get_plan_details(str(subscription.internet_plan_id))
            
            # Calculate remaining
            remaining_data_bytes = subscription.remaining_data_bytes
            remaining_time_seconds = subscription.remaining_time_seconds
            
            return {
                'subscription_id': str(subscription.id),
                'status': subscription.status,
                'plan_id': str(subscription.internet_plan_id),
                'client_id': str(subscription.client_id),
                'access_method': subscription.access_method,
                'start_date': subscription.start_date.isoformat(),
                'end_date': subscription.end_date.isoformat(),
                'remaining_data': remaining_data_bytes,
                'remaining_time': remaining_time_seconds,
                'data_used': subscription.used_data_bytes,
                'time_used': subscription.used_time_seconds,
                'activation_status': 'activated' if subscription.activation_successful else 'pending',
                'router_id': subscription.router_id,
                'mac_address': subscription.hotspot_mac_address,
                'pppoe_username': subscription.pppoe_username,
                'plan_details': plan_details,
                'auto_renew': subscription.auto_renew,
                'payment_reference': subscription.payment_reference,
                'payment_method': subscription.payment_method
            }
            
        except Subscription.DoesNotExist:
            raise ValueError(f"Subscription not found: {subscription_id}")
        except Exception as e:
            logger.error(f"Failed to get subscription details: {e}")
            raise
    
    @staticmethod
    def update_subscription_usage(
        subscription_id: str,
        data_used_bytes: int,
        time_used_seconds: int
    ) -> Dict[str, Any]:
        """
        Update subscription usage
        Uses existing subscription service
        """
        try:
            # Use subscription service for usage update
            usage_result = SubscriptionService.update_usage(
                subscription_id=subscription_id,
                data_used_bytes=data_used_bytes,
                time_used_seconds=time_used_seconds
            )
            
            if not usage_result.get('success'):
                raise ValueError(f"Usage update failed: {usage_result.get('error')}")
            
            # Return updated usage
            return {
                'success': True,
                'subscription_id': subscription_id,
                'remaining_data': usage_result.get('usage', {}).get('remaining_data_bytes', 0),
                'remaining_time': usage_result.get('usage', {}).get('remaining_time_seconds', 0),
                'data_used': usage_result.get('usage', {}).get('data_used_bytes', 0),
                'time_used': usage_result.get('usage', {}).get('time_used_seconds', 0),
                'status': usage_result.get('status', 'unknown')
            }
            
        except Exception as e:
            logger.error(f"Failed to update subscription usage: {e}")
            raise
    
    # ==================== Additional Interface Methods ====================
    
    @staticmethod
    def renew_subscription(
        subscription_id: str,
        duration_hours: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Renew an existing subscription
        Uses existing subscription service
        """
        try:
            # Use subscription service for renewal
            renewal_result = SubscriptionService.renew_subscription(
                subscription_id=subscription_id,
                duration_hours=duration_hours
            )
            
            if not renewal_result.get('success'):
                raise ValueError(f"Renewal failed: {renewal_result.get('error')}")
            
            return {
                'success': True,
                'subscription_id': subscription_id,
                'old_end_date': renewal_result.get('previous_subscription', {}).get('end_date'),
                'new_end_date': renewal_result.get('new_subscription', {}).get('end_date'),
                'duration_hours': duration_hours or 24,
                'status': 'renewed',
                'new_subscription_id': renewal_result.get('new_subscription_id')
            }
            
        except Exception as e:
            logger.error(f"Failed to renew subscription: {e}")
            raise
    
    @staticmethod
    def get_client_subscriptions(
        client_id: str,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get all subscriptions for a client
        """
        try:
            # Use subscription service for getting client subscriptions
            subscriptions_result = SubscriptionService.get_subscriptions_for_client(
                client_id=client_id,
                status_filter='active' if active_only else None,
                active_only=active_only
            )
            
            if not subscriptions_result.get('success'):
                return []
            
            subscriptions = subscriptions_result.get('subscriptions', [])
            
            # Enhance with plan details
            enhanced_subscriptions = []
            for sub in subscriptions:
                plan_details = InternetPlansAdapter.get_plan_details(sub.get('plan_id'))
                
                enhanced_sub = {
                    'subscription_id': sub.get('id'),
                    'plan_id': sub.get('plan_id'),
                    'plan_name': plan_details.get('name', 'Unknown Plan') if plan_details else 'Unknown Plan',
                    'status': sub.get('status'),
                    'access_method': sub.get('access_method'),
                    'start_date': sub.get('start_date'),
                    'end_date': sub.get('end_date'),
                    'data_used': sub.get('used_data_bytes', 0),
                    'data_limit': sub.get('data_limit_bytes', 0),
                    'time_used': sub.get('used_time_seconds', 0),
                    'time_limit': sub.get('time_limit_seconds', 0),
                    'payment_method': sub.get('payment_method'),
                    'payment_reference': sub.get('payment_reference'),
                    'auto_renew': sub.get('auto_renew', False),
                    'created_at': sub.get('created_at'),
                    'updated_at': sub.get('updated_at')
                }
                enhanced_subscriptions.append(enhanced_sub)
            
            return enhanced_subscriptions
            
        except Exception as e:
            logger.error(f"Failed to get client subscriptions: {e}")
            return []
    
    @staticmethod
    def validate_client_for_plan(
        client_id: str,
        plan_id: str
    ) -> Dict[str, Any]:
        """
        Validate if a client can subscribe to a plan
        Simplified - real validation would involve user management integration
        """
        try:
            # Get plan details
            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
            
            if not plan_details:
                return {
                    'valid': False,
                    'client_id': client_id,
                    'plan_id': plan_id,
                    'errors': ['Plan not found'],
                    'warnings': [],
                    'restrictions': []
                }
            
            # Basic checks
            errors = []
            warnings = []
            restrictions = []
            
            # Check if plan is active
            if not plan_details.get('active', False):
                errors.append('Plan is not active')
            
            # Check free trial restrictions
            if plan_details.get('planType') == 'free_trial':
                # Check if client already used free trial
                used_free_trial = Subscription.objects.filter(
                    client_id=client_id,
                    internet_plan_id=plan_id,
                    plan_details__planType='free_trial'
                ).exists()
                
                if used_free_trial:
                    restrictions.append('Free trial already used')
            
            # Check router-specific plans
            if plan_details.get('router_specific', False):
                warnings.append('Plan is router-specific')
            
            is_valid = len(errors) == 0
            
            return {
                'valid': is_valid,
                'client_id': client_id,
                'plan_id': plan_id,
                'errors': errors,
                'warnings': warnings,
                'restrictions': restrictions
            }
            
        except Exception as e:
            logger.error(f"Client validation failed: {e}")
            return {
                'valid': False,
                'client_id': client_id,
                'plan_id': plan_id,
                'errors': ['Validation error'],
                'warnings': [],
                'restrictions': []
            }
    
    @staticmethod
    def bulk_create_subscriptions(
        subscriptions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create multiple subscriptions in bulk
        """
        results = []
        errors = []
        
        for sub_data in subscriptions:
            try:
                subscription = InternetPlansAdapter.create_subscription(**sub_data)
                results.append({
                    'success': True,
                    'subscription_id': subscription['subscription_id'],
                    'plan_id': sub_data.get('plan_id')
                })
            except Exception as e:
                errors.append({
                    'error': str(e),
                    'data': sub_data
                })
        
        return {
            'total': len(subscriptions),
            'successful': len(results),
            'failed': len(errors),
            'results': results,
            'errors': errors
        }
    
    @staticmethod
    def get_plan_usage_statistics(
        plan_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get usage statistics for a plan
        """
        try:
            # Parse dates
            if start_date:
                start = timezone.make_aware(timezone.datetime.fromisoformat(start_date))
            else:
                start = timezone.now() - timezone.timedelta(days=30)
            
            if end_date:
                end = timezone.make_aware(timezone.datetime.fromisoformat(end_date))
            else:
                end = timezone.now()
            
            # Get subscriptions for this plan
            subscriptions = Subscription.objects.filter(
                internet_plan_id=plan_id,
                created_at__gte=start,
                created_at__lte=end,
                is_active=True
            )
            
            # Calculate statistics
            total_subs = subscriptions.count()
            active_subs = subscriptions.filter(status='active').count()
            
            # Calculate usage totals
            total_data_used = sum(sub.used_data_bytes for sub in subscriptions)
            total_time_used = sum(sub.used_time_seconds for sub in subscriptions)
            
            # Calculate averages
            avg_duration = 0
            avg_data_used = 0
            if total_subs > 0:
                # Calculate average duration
                durations = [(sub.end_date - sub.start_date).total_seconds() 
                           for sub in subscriptions if sub.end_date and sub.start_date]
                avg_duration = sum(durations) / len(durations) if durations else 0
                
                # Calculate average data used
                avg_data_used = total_data_used / total_subs if total_subs > 0 else 0
            
            # Get plan details
            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
            
            return {
                'plan_id': plan_id,
                'plan_name': plan_details.get('name', 'Unknown Plan') if plan_details else 'Unknown Plan',
                'total_subscriptions': total_subs,
                'active_subscriptions': active_subs,
                'total_data_used': total_data_used,
                'total_time_used': total_time_used,
                'average_duration': avg_duration,
                'average_data_used': avg_data_used,
                'period': {
                    'start': start.isoformat(),
                    'end': end.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get plan usage statistics: {e}")
            return {
                'plan_id': plan_id,
                'error': str(e)
            }
    
    @staticmethod
    def get_client_plan_history(
        client_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get plan history for a client
        """
        try:
            # Get all subscriptions for client
            subscriptions = Subscription.objects.filter(
                client_id=client_id,
                is_active=True
            ).order_by('-created_at')
            
            history = []
            for sub in subscriptions:
                # Get plan details
                plan_details = InternetPlansAdapter.get_plan_details(str(sub.internet_plan_id))
                
                # Calculate data used in GB
                data_used_gb = sub.used_data_bytes / (1024 * 1024 * 1024) if sub.used_data_bytes > 0 else 0
                
                history.append({
                    'subscription_id': str(sub.id),
                    'plan_id': str(sub.internet_plan_id),
                    'plan_name': plan_details.get('name', 'Unknown Plan') if plan_details else 'Unknown Plan',
                    'start_date': sub.start_date.isoformat(),
                    'end_date': sub.end_date.isoformat() if sub.end_date else None,
                    'status': sub.status,
                    'access_method': sub.access_method,
                    'total_paid': 0,  # Would need payment integration
                    'data_used': data_used_gb
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get client plan history: {e}")
            return []
    
    # ==================== Helper Methods ====================
    
    @staticmethod
    def get_plan_details(plan_id: str) -> Optional[Dict[str, Any]]:
        """
        Get basic plan details (name, price, etc.)
        Calls internet_plans API
        """
        try:
            # Cache key for plan details
            cache_key = f"plan_details:{plan_id}"
            cached_details = cache.get(cache_key)
            
            if cached_details:
                return cached_details
            
            # Get internet plans API configuration
            internet_plans_url = getattr(settings, 'INTERNET_PLANS_BASE_URL', 'http://localhost:8000')
            api_token = getattr(settings, 'INTERNAL_API_TOKEN', '')
            
            # Make API call
            headers = {}
            if api_token:
                headers['Authorization'] = f'Bearer {api_token}'
            
            try:
                response = requests.get(
                    f"{internet_plans_url}/api/internet_plans/plans/{plan_id}/",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get('success'):
                        plan_data = result.get('plan', {})
                        
                        # Cache for 10 minutes
                        cache.set(cache_key, plan_data, 600)
                        
                        return plan_data
                
                # If API call fails, return minimal details
                return {
                    'id': plan_id,
                    'name': 'Unknown Plan',
                    'planType': 'paid',
                    'price': 0,
                    'active': False,
                    'category': 'Unknown',
                    'description': 'Plan details unavailable'
                }
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Failed to get plan details from API: {e}")
                return {
                    'id': plan_id,
                    'name': 'Unknown Plan',
                    'planType': 'paid',
                    'price': 0,
                    'active': False,
                    'category': 'Unknown',
                    'description': 'Plan details unavailable'
                }
            
        except Exception as e:
            logger.error(f"Failed to get plan details: {e}")
            return None
    
    @staticmethod
    def health_check() -> Dict[str, Any]:
        """
        Check Internet Plans service health
        """
        try:
            internet_plans_url = getattr(settings, 'INTERNET_PLANS_BASE_URL', 'http://localhost:8000')
            
            # Try to access public endpoint
            response = requests.get(
                f"{internet_plans_url}/api/internet_plans/plans/public/",
                timeout=5
            )
            
            if response.status_code == 200:
                return {
                    'status': 'healthy',
                    'service': 'internet_plans',
                    'response_time': response.elapsed.total_seconds(),
                    'timestamp': timezone.now().isoformat()
                }
            else:
                return {
                    'status': 'degraded',
                    'service': 'internet_plans',
                    'status_code': response.status_code,
                    'timestamp': timezone.now().isoformat()
                }
                
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'service': 'internet_plans',
                'timestamp': timezone.now().isoformat()
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'unavailable',
                'service': 'internet_plans',
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'service': 'internet_plans',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def get_api_version() -> str:
        """
        Get the API version
        """
        return "2.0.0"