"""
Internet Plans - Integration Service
Handles integration with Authentication app
"""

import logging
from typing import Optional, Dict, Any
from django.http import HttpRequest

logger = logging.getLogger(__name__)


class IntegrationService:
    """Service to handle integration with Authentication app"""
    
    @staticmethod
    def get_or_create_client_by_phone(
        phone_number: str,
        access_method: str = 'hotspot',
        request: Optional[HttpRequest] = None
    ):
        """
        Get or create client using Authentication app
        Returns client object or None
        """
        try:
            # Try to import Authentication app
            from authentication.models import UserAccount
            from authentication.models.validators import PhoneValidation
            
            # Validate phone number
            normalized_phone = PhoneValidation.normalize_kenyan_phone(phone_number)
            
            if not PhoneValidation.is_valid_kenyan_phone(normalized_phone):
                logger.error(f"Invalid phone number: {phone_number}")
                return None
            
            # Try to find existing client
            client = UserAccount.get_client_by_phone(normalized_phone)
            
            if client:
                logger.info(f"Found existing client: {client.id} - {normalized_phone}")
                return client
            
            # Create new client
            connection_type = 'hotspot' if access_method == 'hotspot' else 'pppoe'
            
            try:
                client = UserAccount.objects.create_client_user(
                    phone_number=normalized_phone,
                    connection_type=connection_type,
                    client_name='',  # Name can be added later
                )
                
                logger.info(f"Created new client: {client.id} - {normalized_phone}")
                
                # For PPPoE clients, generate credentials
                if access_method == 'pppoe' and client.is_pppoe_client:
                    try:
                        credentials = client.generate_pppoe_credentials()
                        logger.info(f"Generated PPPoE credentials for client: {client.id}")
                    except Exception as e:
                        logger.error(f"Failed to generate PPPoE credentials: {e}")
                
                return client
                
            except Exception as e:
                logger.error(f"Failed to create client: {e}")
                return None
                
        except ImportError as e:
            logger.error(f"Authentication app not available: {e}")
            
            # Fallback: Use Django's User model
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                # Generate username
                username = f"client_{phone_number.replace('+', '').replace(' ', '')}"
                
                # Create user
                user = User.objects.create_user(
                    username=username,
                    is_active=True
                )
                
                # Add phone number if field exists
                if hasattr(user, 'phone_number'):
                    user.phone_number = phone_number
                    user.save(update_fields=['phone_number'])
                
                logger.warning(f"Created fallback client (no Authentication app): {user.id}")
                
                return user
                
            except Exception as fallback_error:
                logger.error(f"Fallback client creation failed: {fallback_error}")
                return None
    
    @staticmethod
    def validate_client_for_plan(client, plan) -> Dict[str, Any]:
        """
        Validate if client can purchase plan
        """
        result = {
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        try:
            # Check if client exists
            if not client:
                result['valid'] = False
                result['errors'].append('Client not found')
                return result
            
            # Check if plan exists and is active
            if not plan or not plan.active:
                result['valid'] = False
                result['errors'].append('Plan not available')
                return result
            
            # Check plan-client compatibility
            if hasattr(plan, 'is_compatible_with_client'):
                if not plan.is_compatible_with_client(client):
                    result['valid'] = False
                    result['errors'].append('Plan not compatible with client connection type')
            
            # Check if client already has active subscription for this plan
            from internet_plans.models.subscription_models import Subscription
            
            existing_active = Subscription.objects.filter(
                client=client,
                internet_plan=plan,
                status='active',
                is_active=True
            ).exists()
            
            if existing_active:
                result['warnings'].append('Client already has active subscription for this plan')
            
            # Check free trial limits
            if plan.plan_type == 'free_trial':
                free_trial_count = Subscription.objects.filter(
                    client=client,
                    internet_plan__plan_type='free_trial',
                    status__in=['active', 'expired']
                ).count()
                
                if free_trial_count >= 1:  # Limit to 1 free trial per client
                    result['valid'] = False
                    result['errors'].append('Free trial limit reached')
            
            return result
            
        except Exception as e:
            logger.error(f"Client validation error: {e}")
            result['valid'] = False
            result['errors'].append('Validation error')
            return result
    
    @staticmethod
    def emit_plan_purchased_signal(subscription, payment_data: Dict[str, Any] = None):
        """
        Emit signal when plan is purchased
        """
        try:
            from internet_plans.signals.plan_signals import plan_purchased
            
            signal_data = {
                'subscription_id': str(subscription.id),
                'client_id': str(subscription.client.id),
                'plan_id': str(subscription.internet_plan.id) if subscription.internet_plan else None,
                'plan_name': subscription.internet_plan.name if subscription.internet_plan else None,
                'access_method': subscription.access_method,
                'amount': float(subscription.internet_plan.price) if subscription.internet_plan else 0,
                'status': subscription.status,
                'payment_data': payment_data or {},
            }
            
            plan_purchased.send(
                sender=IntegrationService,
                **signal_data
            )
            
            logger.info(f"Plan purchased signal emitted: {subscription.id}")
            
        except ImportError:
            logger.warning("Plan signals not available")
        except Exception as e:
            logger.error(f"Failed to emit plan purchased signal: {e}")