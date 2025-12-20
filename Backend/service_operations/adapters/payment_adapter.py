"""
Service Operations - Payment Adapter
Production-ready adapter for Payment app integration
Handles payment initiation, verification, refunds, and health checks
"""

import logging
import requests
from typing import Dict, Optional, Any, Tuple
from django.conf import settings
from django.utils import timezone, time
from django.core.cache import cache
from decimal import Decimal
import hmac
import hashlib
import json

logger = logging.getLogger(__name__)


class PaymentAdapter:
    """
    Production-ready adapter for Payment app.
    Includes comprehensive error handling, retry logic, and security features.
    """
    
    # Configuration
    BASE_URL = getattr(settings, 'PAYMENT_BASE_URL', 'http://localhost:8000')
    API_TIMEOUT = 30
    CACHE_TIMEOUT = 300  # 5 minutes
    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 5, 30]  # seconds
    
    @staticmethod
    def initiate_payment(payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initiate payment with comprehensive validation and security.
        
        Args:
            payment_data: Payment data including amount, currency, reference, etc.
        
        Returns:
            Payment initiation result
        """
        try:
            # Validate required fields
            required_fields = ['amount', 'currency', 'reference', 'customer_id']
            for field in required_fields:
                if field not in payment_data:
                    return {
                        'success': False,
                        'error': f'Missing required field: {field}',
                        'timestamp': timezone.now().isoformat()
                    }
            
            # Generate request signature for security
            timestamp = str(int(timezone.now().timestamp()))
            signature = PaymentAdapter._generate_signature(
                payment_data['reference'],
                str(payment_data['amount']),
                timestamp
            )
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json',
                'X-Reference': payment_data['reference'],
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'X-Service': 'service_operations',
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            # Prepare request data
            request_data = {
                'amount': float(payment_data['amount']),
                'currency': payment_data['currency'],
                'reference': payment_data['reference'],
                'customer_id': payment_data['customer_id'],
                'description': payment_data.get('description', 'Internet Subscription'),
                'callback_url': payment_data.get('callback_url', ''),
                'metadata': payment_data.get('metadata', {}),
                'payment_method': payment_data.get('payment_method', 'mpesa')
            }
            
            # Make API call with retry logic
            for retry in range(PaymentAdapter.MAX_RETRIES):
                try:
                    response = requests.post(
                        f"{PaymentAdapter.BASE_URL}/api/payments/initiate/",
                        json=request_data,
                        headers=headers,
                        timeout=PaymentAdapter.API_TIMEOUT,
                        verify=True  # Enable SSL verification
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        # Validate response
                        if 'success' in result and result['success']:
                            logger.info(f"Payment initiated successfully: {payment_data['reference']}")
                            
                            # Cache payment initiation
                            cache_key = f"payment_init:{payment_data['reference']}"
                            cache.set(cache_key, result, PaymentAdapter.CACHE_TIMEOUT)
                            
                            return {
                                'success': True,
                                'payment_id': result.get('payment_id'),
                                'checkout_url': result.get('checkout_url'),
                                'reference': result.get('reference'),
                                'status': result.get('status', 'pending'),
                                'message': result.get('message', 'Payment initiated successfully'),
                                'timestamp': timezone.now().isoformat()
                            }
                        else:
                            error_msg = result.get('error', 'Payment initiation failed')
                            logger.error(f"Payment initiation failed for {payment_data['reference']}: {error_msg}")
                            return {
                                'success': False,
                                'error': error_msg,
                                'reference': payment_data['reference'],
                                'timestamp': timezone.now().isoformat()
                            }
                    
                    elif response.status_code == 400:
                        error_data = response.json()
                        logger.warning(f"Payment initiation validation failed: {error_data}")
                        return {
                            'success': False,
                            'error': 'Validation failed',
                            'details': error_data,
                            'reference': payment_data['reference'],
                            'timestamp': timezone.now().isoformat()
                        }
                    
                    elif response.status_code == 401:
                        logger.error(f"Payment API authentication failed for {payment_data['reference']}")
                        return {
                            'success': False,
                            'error': 'Authentication failed',
                            'reference': payment_data['reference'],
                            'timestamp': timezone.now().isoformat()
                        }
                    
                    else:
                        logger.warning(
                            f"Payment initiation failed for {payment_data['reference']}: "
                            f"HTTP {response.status_code}"
                        )
                        
                        if retry < PaymentAdapter.MAX_RETRIES - 1:
                            delay = PaymentAdapter.RETRY_DELAYS[retry]
                            logger.info(f"Retrying payment initiation in {delay} seconds...")
                            time.sleep(delay)
                            continue
                
                except requests.exceptions.Timeout:
                    logger.error(f"Payment initiation timeout for {payment_data['reference']}")
                    if retry < PaymentAdapter.MAX_RETRIES - 1:
                        delay = PaymentAdapter.RETRY_DELAYS[retry]
                        logger.info(f"Retrying after timeout in {delay} seconds...")
                        time.sleep(delay)
                        continue
                
                except requests.exceptions.ConnectionError:
                    logger.error(f"Payment service connection error for {payment_data['reference']}")
                    return {
                        'success': False,
                        'error': 'Payment service unavailable',
                        'reference': payment_data['reference'],
                        'timestamp': timezone.now().isoformat()
                    }
                
                except Exception as e:
                    logger.error(f"Payment initiation error for {payment_data['reference']}: {e}")
                    if retry < PaymentAdapter.MAX_RETRIES - 1:
                        delay = PaymentAdapter.RETRY_DELAYS[retry]
                        logger.info(f"Retrying after error in {delay} seconds...")
                        time.sleep(delay)
                        continue
            
            # All retries failed
            return {
                'success': False,
                'error': 'Payment initiation failed after retries',
                'reference': payment_data['reference'],
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Unexpected error in payment initiation: {e}", exc_info=True)
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'reference': payment_data.get('reference', 'unknown'),
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def verify_payment(reference: str) -> Dict[str, Any]:
        """
        Verify payment status with caching and security.
        
        Args:
            reference: Payment reference
        
        Returns:
            Payment verification result
        """
        try:
            # Check cache first
            cache_key = f"payment_verify:{reference}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                logger.debug(f"Returning cached payment verification for {reference}")
                return cached_result
            
            # Generate request signature
            timestamp = str(int(timezone.now().timestamp()))
            signature = PaymentAdapter._generate_signature(reference, timestamp, 'verify')
            
            headers = {
                'X-Reference': reference,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'X-Service': 'service_operations',
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            # Make API call
            response = requests.get(
                f"{PaymentAdapter.BASE_URL}/api/payments/verify/{reference}/",
                headers=headers,
                timeout=PaymentAdapter.API_TIMEOUT,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if 'success' in result and result['success']:
                    verification_result = {
                        'success': True,
                        'status': result.get('status', 'unknown'),
                        'amount': Decimal(str(result.get('amount', 0))),
                        'currency': result.get('currency', 'KES'),
                        'payment_method': result.get('payment_method'),
                        'paid_at': result.get('paid_at'),
                        'metadata': result.get('metadata', {}),
                        'reference': reference,
                        'timestamp': timezone.now().isoformat()
                    }
                    
                    # Cache successful verification
                    cache.set(cache_key, verification_result, PaymentAdapter.CACHE_TIMEOUT)
                    
                    logger.info(f"Payment verified successfully: {reference} - Status: {result.get('status')}")
                    return verification_result
                else:
                    error_msg = result.get('error', 'Verification failed')
                    logger.warning(f"Payment verification failed for {reference}: {error_msg}")
                    
                    result = {
                        'success': False,
                        'status': 'verification_failed',
                        'error': error_msg,
                        'reference': reference,
                        'timestamp': timezone.now().isoformat()
                    }
                    
                    # Cache failed verification briefly
                    cache.set(cache_key, result, 60)  # 1 minute
                    return result
            
            elif response.status_code == 404:
                logger.warning(f"Payment not found: {reference}")
                return {
                    'success': False,
                    'status': 'not_found',
                    'error': 'Payment not found',
                    'reference': reference,
                    'timestamp': timezone.now().isoformat()
                }
            
            else:
                logger.error(f"Payment verification failed for {reference}: HTTP {response.status_code}")
                return {
                    'success': False,
                    'status': 'verification_error',
                    'error': f'HTTP {response.status_code}',
                    'reference': reference,
                    'timestamp': timezone.now().isoformat()
                }
                
        except requests.exceptions.Timeout:
            logger.error(f"Payment verification timeout for {reference}")
            return {
                'success': False,
                'status': 'timeout',
                'error': 'Verification timeout',
                'reference': reference,
                'timestamp': timezone.now().isoformat()
            }
            
        except requests.exceptions.ConnectionError:
            logger.error(f"Payment service connection error for {reference}")
            return {
                'success': False,
                'status': 'connection_error',
                'error': 'Payment service unavailable',
                'reference': reference,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Payment verification error for {reference}: {e}", exc_info=True)
            return {
                'success': False,
                'status': 'error',
                'error': str(e),
                'reference': reference,
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def process_refund(payment_id: str, amount: Optional[float] = None, reason: str = "") -> Dict[str, Any]:
        """
        Process payment refund with comprehensive validation.
        
        Args:
            payment_id: Payment ID to refund
            amount: Amount to refund (full amount if None)
            reason: Refund reason
        
        Returns:
            Refund processing result
        """
        try:
            # Validate inputs
            if amount is not None and amount <= 0:
                return {
                    'success': False,
                    'error': 'Refund amount must be positive',
                    'payment_id': payment_id,
                    'timestamp': timezone.now().isoformat()
                }
            
            # Generate request signature
            timestamp = str(int(timezone.now().timestamp()))
            signature = PaymentAdapter._generate_signature(payment_id, timestamp, 'refund')
            
            headers = {
                'Content-Type': 'application/json',
                'X-Payment-ID': payment_id,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'X-Service': 'service_operations',
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            request_data = {
                'payment_id': payment_id,
                'reason': reason[:500]  # Limit reason length
            }
            
            if amount is not None:
                request_data['amount'] = float(amount)
            
            response = requests.post(
                f"{PaymentAdapter.BASE_URL}/api/payments/refund/",
                json=request_data,
                headers=headers,
                timeout=PaymentAdapter.API_TIMEOUT,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('success'):
                    logger.info(f"Refund processed successfully: {payment_id}")
                    return {
                        'success': True,
                        'refund_id': result.get('refund_id'),
                        'amount': Decimal(str(result.get('amount', 0))),
                        'status': result.get('status', 'processed'),
                        'message': result.get('message', 'Refund processed successfully'),
                        'payment_id': payment_id,
                        'timestamp': timezone.now().isoformat()
                    }
                else:
                    error_msg = result.get('error', 'Refund failed')
                    logger.error(f"Refund failed for {payment_id}: {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg,
                        'payment_id': payment_id,
                        'timestamp': timezone.now().isoformat()
                    }
            
            elif response.status_code == 400:
                error_data = response.json()
                logger.warning(f"Refund validation failed: {error_data}")
                return {
                    'success': False,
                    'error': 'Refund validation failed',
                    'details': error_data,
                    'payment_id': payment_id,
                    'timestamp': timezone.now().isoformat()
                }
            
            else:
                logger.error(f"Refund failed for {payment_id}: HTTP {response.status_code}")
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}',
                    'payment_id': payment_id,
                    'timestamp': timezone.now().isoformat()
                }
                
        except requests.exceptions.Timeout:
            logger.error(f"Refund processing timeout for {payment_id}")
            return {
                'success': False,
                'error': 'Refund processing timeout',
                'payment_id': payment_id,
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Refund processing error for {payment_id}: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'payment_id': payment_id,
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def get_payment_methods() -> Dict[str, Any]:
        """
        Get available payment methods with caching.
        
        Returns:
            Available payment methods
        """
        try:
            # Check cache
            cache_key = "payment_methods"
            cached_methods = cache.get(cache_key)
            
            if cached_methods:
                return cached_methods
            
            headers = {
                'X-Service': 'service_operations',
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            response = requests.get(
                f"{PaymentAdapter.BASE_URL}/api/payments/methods/",
                headers=headers,
                timeout=10,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                
                payment_methods = {
                    'success': True,
                    'methods': result.get('methods', []),
                    'default_method': result.get('default_method', 'mpesa'),
                    'timestamp': timezone.now().isoformat()
                }
                
                # Cache for 1 hour
                cache.set(cache_key, payment_methods, 3600)
                
                return payment_methods
            else:
                # Fallback methods if API fails
                fallback_methods = {
                    'success': False,
                    'methods': [
                        {'id': 'mpesa', 'name': 'M-Pesa', 'enabled': True},
                        {'id': 'card', 'name': 'Credit/Debit Card', 'enabled': True},
                        {'id': 'bank', 'name': 'Bank Transfer', 'enabled': True}
                    ],
                    'default_method': 'mpesa',
                    'error': 'Failed to fetch methods from API',
                    'timestamp': timezone.now().isoformat()
                }
                
                # Cache fallback briefly
                cache.set(cache_key, fallback_methods, 300)
                return fallback_methods
                
        except Exception as e:
            logger.error(f"Error getting payment methods: {e}")
            
            # Return fallback methods
            return {
                'success': False,
                'methods': [
                    {'id': 'mpesa', 'name': 'M-Pesa', 'enabled': True},
                    {'id': 'card', 'name': 'Credit/Debit Card', 'enabled': True},
                    {'id': 'bank', 'name': 'Bank Transfer', 'enabled': True}
                ],
                'default_method': 'mpesa',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    @staticmethod
    def health_check() -> Dict[str, Any]:
        """
        Comprehensive payment service health check.
        
        Returns:
            Health status with detailed information
        """
        try:
            start_time = timezone.now()
            
            response = requests.get(
                f"{PaymentAdapter.BASE_URL}/api/payments/health/",
                timeout=5,
                verify=True
            )
            
            duration = (timezone.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                data = response.json()
                
                # Determine health status
                status = data.get('status', 'unknown')
                is_healthy = status == 'healthy'
                
                health_status = {
                    'status': 'healthy' if is_healthy else 'degraded',
                    'service': 'payment',
                    'response_time_seconds': duration,
                    'details': data,
                    'timestamp': timezone.now().isoformat()
                }
                
                return health_status
            else:
                return {
                    'status': 'unavailable',
                    'service': 'payment',
                    'status_code': response.status_code,
                    'response_time_seconds': duration,
                    'timestamp': timezone.now().isoformat()
                }
                
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'service': 'payment',
                'message': 'Service timeout',
                'response_time_seconds': 5.0,
                'timestamp': timezone.now().isoformat()
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'unavailable',
                'service': 'payment',
                'message': 'Service connection failed',
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'service': 'payment',
                'message': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    # Security helper methods
    @staticmethod
    def _generate_signature(*args) -> str:
        """Generate HMAC signature for request security."""
        secret = getattr(settings, 'PAYMENT_API_SECRET', 'change-this-in-production')
        message = ':'.join(args)
        signature = hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    @staticmethod
    def _get_api_token() -> str:
        """Get API token from settings."""
        return getattr(settings, 'PAYMENT_API_TOKEN', '')
    
    @staticmethod
    def validate_webhook_signature(payload: str, signature: str) -> bool:
        """
        Validate webhook signature for security.
        
        Args:
            payload: Webhook payload
            signature: Received signature
        
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            secret = getattr(settings, 'PAYMENT_WEBHOOK_SECRET', '')
            if not secret:
                logger.warning("Webhook secret not configured")
                return False
            
            expected_signature = hmac.new(
                secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Webhook signature validation error: {e}")
            return False