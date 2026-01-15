"""
Production Payment Adapter
Integrated with actual payment configuration, reconciliation, and transaction systems
"""

import logging
import requests
import time
import hmac
import hashlib
import json
import uuid
from typing import Dict, Optional, Any, Tuple, List
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import transaction as db_transaction
from django.db.models import Sum, Count, Q

logger = logging.getLogger(__name__)


class PaymentAdapter:
    """
    Production Payment Adapter
    Integrates with your payment configuration, reconciliation, and transaction systems
    """
    
    # Configuration from your actual payment system
    BASE_URL = getattr(settings, 'PAYMENT_SERVICE_URL', 'http://localhost:8000')
    INTERNETPLANS_BASE_URL = getattr(settings, 'INTERNETPLANS_BASE_URL', 'http://localhost:8001')
    
    # Timeouts and retries
    API_TIMEOUT = 30
    CACHE_TIMEOUT = 300  # 5 minutes
    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 3, 10]  # seconds
    
    # Payment method mappings from your system
    PAYMENT_METHOD_MAPPING = {
        'mpesa_paybill': 'mpesa',
        'mpesa_till': 'mpesa',
        'bank_transfer': 'bank',
        'paypal': 'paypal',
        'card': 'card'
    }

    @staticmethod
    def initiate_payment(payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initiate payment using your actual payment configuration
        Integrates with: PaymentGateway, Transaction, and TransactionLog
        """
        try:
            # Extract data from your payment configuration structure
            client_id = payment_data.get('client_id')
            plan_id = payment_data.get('plan_id')
            gateway_id = payment_data.get('gateway_id')
            access_type = payment_data.get('access_type', 'hotspot')
            
            # Validate required fields from your model structure
            required_fields = ['amount', 'client_id', 'plan_id', 'gateway_id']
            for field in required_fields:
                if field not in payment_data:
                    logger.error(f"Missing required field: {field}")
                    return PaymentAdapter._error_response(
                        f"Missing required field: {field}",
                        payment_data.get('reference', 'unknown')
                    )
            
            # Get gateway from your PaymentGateway model
            from payments.models.payment_config_model import PaymentGateway
            try:
                gateway = PaymentGateway.objects.get(
                    id=gateway_id,
                    is_active=True,
                    health_status='healthy'
                )
            except PaymentGateway.DoesNotExist:
                return PaymentAdapter._error_response(
                    "Invalid or inactive payment gateway",
                    payment_data.get('reference', 'unknown')
                )
            
            # Generate secure reference
            reference = payment_data.get('reference') or PaymentAdapter._generate_reference()
            
            # Generate idempotency key
            idempotency_key = str(uuid.uuid4())
            
            # Prepare request for your actual InitiatePaymentView
            request_data = {
                'gateway_id': str(gateway_id),
                'amount': float(payment_data['amount']),
                'plan_id': plan_id,
                'idempotency_key': idempotency_key,
                'access_type': access_type,
                'metadata': {
                    'client_id': client_id,
                    'plan_id': plan_id,
                    'access_type': access_type,
                    'initiated_from': 'service_operations',
                    'original_reference': payment_data.get('original_reference', '')
                }
            }
            
            # Add phone number for M-Pesa if available
            if gateway.name in ['mpesa_paybill', 'mpesa_till']:
                phone = payment_data.get('phone_number')
                if phone:
                    request_data['phone'] = phone
            
            # Generate signature for security
            timestamp = str(int(timezone.now().timestamp()))
            signature = PaymentAdapter._generate_signature(
                reference,
                str(payment_data['amount']),
                str(gateway_id),
                timestamp
            )
            
            # Prepare headers
            headers = {
                'Content-Type': 'application/json',
                'X-Reference': reference,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'X-Idempotency-Key': idempotency_key,
                'X-Gateway-Type': gateway.name,
                'X-Access-Type': access_type,
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            # Make API call with retry logic
            for retry in range(PaymentAdapter.MAX_RETRIES):
                try:
                    response = requests.post(
                        f"{PaymentAdapter.BASE_URL}/api/payments/initiate/",
                        json=request_data,
                        headers=headers,
                        timeout=PaymentAdapter.API_TIMEOUT,
                        verify=True
                    )
                    
                    if response.status_code in [200, 201]:
                        result = response.json()
                        
                        # Cache the payment initiation
                        cache_key = f"payment_init:{reference}"
                        cache.set(cache_key, {
                            'request': request_data,
                            'response': result,
                            'timestamp': timezone.now().isoformat()
                        }, PaymentAdapter.CACHE_TIMEOUT)
                        
                        # Log transaction initiation
                        PaymentAdapter._log_payment_initiation(reference, gateway, payment_data)
                        
                        return {
                            'success': True,
                            'payment_reference': reference,
                            'gateway_type': gateway.name,
                            'gateway_display': gateway.get_name_display(),
                            'access_type': access_type,
                            'next_steps': result.get('next_steps', {}),
                            'transaction_id': result.get('transaction_id'),
                            'checkout_request_id': result.get('checkout_request_id'),
                            'checkout_url': result.get('checkout_url'),
                            'timestamp': timezone.now().isoformat(),
                            'metadata': {
                                'idempotency_key': idempotency_key,
                                'gateway_security': gateway.security_level,
                                'sandbox_mode': gateway.sandbox_mode
                            }
                        }
                    
                    elif response.status_code == 400:
                        error_data = response.json()
                        logger.warning(f"Payment initiation validation failed: {error_data}")
                        
                        return {
                            'success': False,
                            'error': 'Validation failed',
                            'details': error_data,
                            'reference': reference,
                            'timestamp': timezone.now().isoformat()
                        }
                    
                    elif response.status_code == 403:
                        return PaymentAdapter._error_response(
                            "Payment gateway not available or client not authorized",
                            reference
                        )
                    
                    else:
                        logger.warning(
                            f"Payment initiation failed: HTTP {response.status_code}"
                        )
                        
                        if retry < PaymentAdapter.MAX_RETRIES - 1:
                            delay = PaymentAdapter.RETRY_DELAYS[retry]
                            logger.info(f"Retrying in {delay} seconds...")
                            time.sleep(delay)
                            continue
                
                except requests.exceptions.Timeout:
                    logger.error(f"Payment initiation timeout for {reference}")
                    if retry < PaymentAdapter.MAX_RETRIES - 1:
                        delay = PaymentAdapter.RETRY_DELAYS[retry]
                        time.sleep(delay)
                        continue
                
                except requests.exceptions.ConnectionError as e:
                    logger.error(f"Payment service connection error: {e}")
                    if retry < PaymentAdapter.MAX_RETRIES - 1:
                        delay = PaymentAdapter.RETRY_DELAYS[retry]
                        time.sleep(delay)
                        continue
                
                except Exception as e:
                    logger.error(f"Payment initiation error: {e}")
                    if retry < PaymentAdapter.MAX_RETRIES - 1:
                        delay = PaymentAdapter.RETRY_DELAYS[retry]
                        time.sleep(delay)
                        continue
            
            return PaymentAdapter._error_response(
                "Payment initiation failed after retries",
                reference
            )
            
        except Exception as e:
            logger.error(f"Unexpected error in payment initiation: {e}", exc_info=True)
            return PaymentAdapter._error_response(
                f"Unexpected error: {str(e)}",
                payment_data.get('reference', 'unknown')
            )

    @staticmethod
    def verify_payment(reference: str, gateway_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Verify payment status using your Transaction and TransactionLog models
        """
        try:
            # Check cache first
            cache_key = f"payment_verify:{reference}"
            cached_result = cache.get(cache_key)
            
            if cached_result:
                if timezone.now() - datetime.fromisoformat(cached_result['timestamp']) < timedelta(minutes=5):
                    logger.debug(f"Returning cached verification for {reference}")
                    return cached_result
            
            # Get transaction from your Transaction model
            from payments.models.payment_config_model import Transaction
            try:
                transaction = Transaction.objects.select_related(
                    'gateway', 'client', 'client__user', 'plan', 'subscription'
                ).get(reference=reference)
            except Transaction.DoesNotExist:
                logger.warning(f"Transaction not found: {reference}")
                return PaymentAdapter._error_response(
                    "Transaction not found",
                    reference,
                    status='not_found'
                )
            
            # Get transaction logs
            from payments.models.transaction_log_model import TransactionLog
            transaction_logs = TransactionLog.objects.filter(
                Q(payment_transaction=transaction) | Q(reference_number=reference)
            ).order_by('-created_at')
            
            # Get latest callback delivery status
            from payments.models.payment_config_model import CallbackDeliveryLog
            callback_delivery = CallbackDeliveryLog.objects.filter(
                transaction=transaction
            ).order_by('-created_at').first()
            
            # Prepare verification result based on your actual data structure
            verification_data = {
                'success': True,
                'reference': reference,
                'transaction_id': str(transaction.id),
                'status': transaction.status,
                'status_display': transaction.get_status_display(),
                'amount': float(transaction.amount),
                'client_id': str(transaction.client.id),
                'client_name': transaction.client.user.get_full_name() or transaction.client.user.username,
                'gateway_type': transaction.gateway.name if transaction.gateway else 'unknown',
                'gateway_display': transaction.gateway.get_name_display() if transaction.gateway else 'Unknown',
                'plan_id': str(transaction.plan.id) if transaction.plan else None,
                'plan_name': transaction.plan.name if transaction.plan else None,
                'subscription_linked': bool(transaction.subscription_id),
                'subscription_id': str(transaction.subscription_id) if transaction.subscription_id else None,
                'created_at': transaction.created_at.isoformat(),
                'updated_at': transaction.updated_at.isoformat(),
                'callback_attempts': transaction.callback_attempts,
                'last_callback_attempt': transaction.last_callback_attempt.isoformat() if transaction.last_callback_attempt else None,
                'metadata': transaction.metadata,
                'timestamp': timezone.now().isoformat()
            }
            
            # Add transaction logs information
            if transaction_logs.exists():
                verification_data['transaction_logs'] = [
                    {
                        'log_id': str(log.id),
                        'status': log.status,
                        'access_type': log.access_type,
                        'payment_method': log.payment_method,
                        'created_at': log.created_at.isoformat()
                    }
                    for log in transaction_logs[:5]  # Last 5 logs
                ]
            
            # Add callback delivery status
            if callback_delivery:
                verification_data['callback_delivery'] = {
                    'status': callback_delivery.status,
                    'attempt_count': callback_delivery.attempt_count,
                    'delivered_at': callback_delivery.delivered_at.isoformat() if callback_delivery.delivered_at else None,
                    'error_message': callback_delivery.error_message
                }
            
            # Add payment method specific data
            if transaction.gateway:
                if transaction.gateway.name.startswith('mpesa'):
                    verification_data['mpesa_details'] = {
                        'checkout_request_id': transaction.metadata.get('checkout_request_id'),
                        'receipt_number': transaction.metadata.get('mpesa_receipt'),
                        'phone_number': transaction.metadata.get('phone_number')
                    }
                elif transaction.gateway.name == 'paypal':
                    verification_data['paypal_details'] = {
                        'order_id': transaction.metadata.get('paypal_order_id'),
                        'capture_id': transaction.metadata.get('paypal_capture_id')
                    }
                elif transaction.gateway.name == 'bank_transfer':
                    verification_data['bank_details'] = transaction.metadata.get('bank_details', {})
            
            # Cache the verification result
            cache.set(cache_key, verification_data, 300)  # 5 minutes
            
            logger.info(f"Payment verified: {reference} - Status: {transaction.status}")
            return verification_data
            
        except Exception as e:
            logger.error(f"Payment verification error for {reference}: {e}", exc_info=True)
            return PaymentAdapter._error_response(
                f"Verification error: {str(e)}",
                reference,
                status='verification_error'
            )

    @staticmethod
    def manual_payment_verification(verification_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Manual payment verification using your PaymentVerificationView
        """
        try:
            reference = verification_data.get('reference')
            phone_number = verification_data.get('phone_number')
            amount = verification_data.get('amount')
            gateway = verification_data.get('gateway', 'mpesa')
            access_type = verification_data.get('access_type', 'hotspot')
            
            if not reference and not (phone_number and amount):
                return PaymentAdapter._error_response(
                    "Either reference or phone_number+amount must be provided",
                    reference or 'unknown'
                )
            
            # Prepare verification request
            request_data = {
                'reference': reference,
                'phone_number': phone_number,
                'amount': float(amount) if amount else None,
                'gateway': gateway,
                'access_type': access_type
            }
            
            # Remove None values
            request_data = {k: v for k, v in request_data.items() if v is not None}
            
            # Generate signature
            timestamp = str(int(timezone.now().timestamp()))
            signature = PaymentAdapter._generate_signature(
                reference or phone_number,
                timestamp,
                'manual_verify'
            )
            
            headers = {
                'Content-Type': 'application/json',
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'X-Verification-Type': 'manual',
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            response = requests.post(
                f"{PaymentAdapter.BASE_URL}/api/payments/verify/",
                json=request_data,
                headers=headers,
                timeout=PaymentAdapter.API_TIMEOUT,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Manual verification completed: {reference or phone_number}")
                return result
            else:
                logger.error(f"Manual verification failed: HTTP {response.status_code}")
                return PaymentAdapter._error_response(
                    f"Manual verification failed: HTTP {response.status_code}",
                    reference or 'unknown'
                )
                
        except Exception as e:
            logger.error(f"Manual verification error: {e}", exc_info=True)
            return PaymentAdapter._error_response(
                f"Manual verification error: {str(e)}",
                verification_data.get('reference', 'unknown')
            )

    @staticmethod
    def get_payment_methods(client_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get available payment methods from your PaymentGateway model
        """
        try:
            cache_key = f"payment_methods:{client_id or 'all'}"
            cached_methods = cache.get(cache_key)
            
            if cached_methods:
                return cached_methods
            
            from payments.models.payment_config_model import PaymentGateway, ClientPaymentMethod
            
            # Get all active gateways
            gateways = PaymentGateway.objects.filter(
                is_active=True,
                health_status='healthy'
            ).prefetch_related('mpesaconfig', 'paypalconfig', 'bankconfig')
            
            # Get client's payment methods if client_id provided
            client_methods = []
            if client_id:
                try:
                    from account.models.admin_model import Client
                    client = Client.objects.get(id=client_id)
                    client_methods = ClientPaymentMethod.objects.filter(
                        client=client,
                        gateway__is_active=True
                    ).select_related('gateway')
                except (Client.DoesNotExist, Exception) as e:
                    logger.warning(f"Client payment methods not available: {e}")
            
            # Format gateway data according to your serializer structure
            methods_data = []
            for gateway in gateways:
                gateway_data = {
                    'id': str(gateway.id),
                    'name': gateway.name,
                    'display_name': gateway.get_name_display(),
                    'security_level': gateway.security_level,
                    'security_level_display': gateway.get_security_level_display(),
                    'sandbox_mode': gateway.sandbox_mode,
                    'transaction_limit': float(gateway.transaction_limit) if gateway.transaction_limit else None,
                    'auto_settle': gateway.auto_settle,
                    'health_status': gateway.health_status,
                    'last_health_check': gateway.last_health_check.isoformat() if gateway.last_health_check else None,
                    'is_client_method': any(cm.gateway.id == gateway.id for cm in client_methods),
                    'is_default_method': any(cm.gateway.id == gateway.id and cm.is_default for cm in client_methods)
                }
                
                # Add gateway-specific configuration
                if gateway.name in ['mpesa_paybill', 'mpesa_till'] and hasattr(gateway, 'mpesaconfig'):
                    config = gateway.mpesaconfig
                    gateway_data['config'] = {
                        'type': 'mpesa',
                        'paybill_number': config.paybill_number,
                        'till_number': config.till_number,
                        'short_code': config.short_code,
                        'is_paybill': bool(config.paybill_number),
                        'is_till': bool(config.till_number)
                    }
                elif gateway.name == 'paypal' and hasattr(gateway, 'paypalconfig'):
                    config = gateway.paypalconfig
                    gateway_data['config'] = {
                        'type': 'paypal',
                        'environment': 'sandbox' if gateway.sandbox_mode else 'production',
                        'callback_url': config.callback_url
                    }
                elif gateway.name == 'bank_transfer' and hasattr(gateway, 'bankconfig'):
                    config = gateway.bankconfig
                    gateway_data['config'] = {
                        'type': 'bank',
                        'bank_name': config.bank_name,
                        'account_name': config.account_name,
                        'account_number': config.account_number,
                        'currency': config.currency,
                        'currency_display': dict(config._meta.get_field('currency').choices).get(config.currency, config.currency)
                    }
                
                methods_data.append(gateway_data)
            
            result = {
                'success': True,
                'methods': methods_data,
                'default_method': 'mpesa' if any(m['name'].startswith('mpesa') for m in methods_data) else methods_data[0]['name'] if methods_data else 'unknown',
                'client_has_methods': len(client_methods) > 0,
                'timestamp': timezone.now().isoformat()
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting payment methods: {e}")
            return {
                'success': False,
                'error': str(e),
                'methods': [
                    {
                        'id': 'mpesa_fallback',
                        'name': 'mpesa_paybill',
                        'display_name': 'M-Pesa Paybill',
                        'security_level': 'medium',
                        'sandbox_mode': True,
                        'is_client_method': False,
                        'is_default_method': True,
                        'config': {'type': 'mpesa', 'is_paybill': True}
                    }
                ],
                'default_method': 'mpesa',
                'timestamp': timezone.now().isoformat()
            }

    @staticmethod
    def get_transaction_history(
        client_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: Optional[str] = None,
        gateway: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Get transaction history from your Transaction and TransactionLog models
        """
        try:
            from payments.models.payment_config_model import Transaction
            from payments.models.transaction_log_model import TransactionLog
            
            # Build query based on parameters
            transaction_qs = Transaction.objects.all()
            log_qs = TransactionLog.objects.all()
            
            if client_id:
                transaction_qs = transaction_qs.filter(client_id=client_id)
                log_qs = log_qs.filter(client_id=client_id)
            
            if start_date:
                transaction_qs = transaction_qs.filter(created_at__gte=start_date)
                log_qs = log_qs.filter(created_at__gte=start_date)
            
            if end_date:
                transaction_qs = transaction_qs.filter(created_at__lte=end_date)
                log_qs = log_qs.filter(created_at__lte=end_date)
            
            if status and status != 'all':
                transaction_qs = transaction_qs.filter(status=status)
                log_qs = log_qs.filter(status=status)
            
            if gateway:
                transaction_qs = transaction_qs.filter(gateway__name=gateway)
                log_qs = log_qs.filter(payment_method=PaymentAdapter.PAYMENT_METHOD_MAPPING.get(gateway, gateway))
            
            # Get counts
            transaction_count = transaction_qs.count()
            log_count = log_qs.count()
            
            # Paginate transactions
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            
            transactions = list(transaction_qs.select_related(
                'gateway', 'client', 'client__user', 'plan'
            ).order_by('-created_at')[start_idx:end_idx])
            
            # Format transaction data
            transactions_data = []
            for tx in transactions:
                tx_data = {
                    'id': str(tx.id),
                    'reference': tx.reference,
                    'amount': float(tx.amount),
                    'status': tx.status,
                    'status_display': tx.get_status_display(),
                    'gateway_type': tx.gateway.name if tx.gateway else 'unknown',
                    'gateway_display': tx.gateway.get_name_display() if tx.gateway else 'Unknown',
                    'client_name': tx.client.user.get_full_name() or tx.client.user.username,
                    'plan_name': tx.plan.name if tx.plan else None,
                    'created_at': tx.created_at.isoformat(),
                    'updated_at': tx.updated_at.isoformat(),
                    'metadata': tx.metadata
                }
                transactions_data.append(tx_data)
            
            # Get recent transaction logs
            recent_logs = log_qs.select_related(
                'client', 'client__user', 'internet_plan'
            ).order_by('-created_at')[:10]
            
            logs_data = []
            for log in recent_logs:
                log_data = {
                    'id': str(log.id),
                    'transaction_id': log.transaction_id,
                    'amount': float(log.amount),
                    'status': log.status,
                    'payment_method': log.payment_method,
                    'access_type': log.access_type,
                    'access_type_display': log.get_access_type_display(),
                    'user_name': log.user_name,
                    'plan_name': log.plan_name,
                    'created_at': log.created_at.isoformat()
                }
                logs_data.append(log_data)
            
            # Calculate summary statistics
            success_amount = transaction_qs.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0')
            
            pending_amount = transaction_qs.filter(status='pending').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0')
            
            return {
                'success': True,
                'transactions': {
                    'data': transactions_data,
                    'total': transaction_count,
                    'page': page,
                    'page_size': page_size,
                    'total_pages': (transaction_count + page_size - 1) // page_size
                },
                'recent_logs': logs_data,
                'summary': {
                    'total_transactions': transaction_count,
                    'total_logs': log_count,
                    'successful_amount': float(success_amount),
                    'pending_amount': float(pending_amount),
                    'success_rate': (transaction_qs.filter(status='completed').count() / transaction_count * 100) if transaction_count > 0 else 0
                },
                'filters': {
                    'client_id': client_id,
                    'start_date': start_date.isoformat() if start_date else None,
                    'end_date': end_date.isoformat() if end_date else None,
                    'status': status,
                    'gateway': gateway
                },
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting transaction history: {e}", exc_info=True)
            return PaymentAdapter._error_response(
                f"Failed to get transaction history: {str(e)}",
                'transaction_history'
            )

    @staticmethod
    def get_reconciliation_data(
        start_date: datetime,
        end_date: datetime,
        access_type: str = 'all'
    ) -> Dict[str, Any]:
        """
        Get payment reconciliation data using your PaymentReconciliationView
        """
        try:
            cache_key = f"reconciliation:{start_date.date()}:{end_date.date()}:{access_type}"
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return cached_data
            
            # Prepare request to your reconciliation endpoint
            params = {
                'start_date': start_date.date().isoformat(),
                'end_date': end_date.date().isoformat(),
                'access_type': access_type,
                'view_mode': 'all'
            }
            
            headers = {
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}',
                'X-Service': 'payment_adapter'
            }
            
            response = requests.get(
                f"{PaymentAdapter.BASE_URL}/api/payments/reconciliation/",
                params=params,
                headers=headers,
                timeout=PaymentAdapter.API_TIMEOUT,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Cache for 15 minutes
                cache.set(cache_key, result, 900)
                
                return {
                    'success': True,
                    'data': result,
                    'timestamp': timezone.now().isoformat()
                }
            else:
                logger.error(f"Reconciliation data fetch failed: HTTP {response.status_code}")
                return PaymentAdapter._error_response(
                    f"Failed to fetch reconciliation data: HTTP {response.status_code}",
                    'reconciliation'
                )
                
        except Exception as e:
            logger.error(f"Error getting reconciliation data: {e}", exc_info=True)
            return PaymentAdapter._error_response(
                f"Reconciliation error: {str(e)}",
                'reconciliation'
            )

    @staticmethod
    def link_subscription(transaction_id: str, subscription_id: str) -> Dict[str, Any]:
        """
        Link transaction to subscription using your LinkSubscriptionView
        """
        try:
            request_data = {
                'subscription_id': subscription_id
            }
            
            timestamp = str(int(timezone.now().timestamp()))
            signature = PaymentAdapter._generate_signature(
                transaction_id,
                subscription_id,
                timestamp,
                'link_subscription'
            )
            
            headers = {
                'Content-Type': 'application/json',
                'X-Transaction-ID': transaction_id,
                'X-Subscription-ID': subscription_id,
                'X-Timestamp': timestamp,
                'X-Signature': signature,
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}'
            }
            
            response = requests.patch(
                f"{PaymentAdapter.BASE_URL}/api/payments/transactions/{transaction_id}/link-subscription/",
                json=request_data,
                headers=headers,
                timeout=PaymentAdapter.API_TIMEOUT,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Subscription linked: Transaction {transaction_id} -> Subscription {subscription_id}")
                return {
                    'success': True,
                    'message': result.get('message', 'Subscription linked successfully'),
                    'transaction_reference': result.get('transaction', {}).get('reference'),
                    'subscription_id': subscription_id,
                    'timestamp': timezone.now().isoformat()
                }
            else:
                logger.error(f"Subscription linking failed: HTTP {response.status_code}")
                return PaymentAdapter._error_response(
                    f"Subscription linking failed: HTTP {response.status_code}",
                    transaction_id
                )
                
        except Exception as e:
            logger.error(f"Subscription linking error: {e}", exc_info=True)
            return PaymentAdapter._error_response(
                f"Subscription linking error: {str(e)}",
                transaction_id
            )

    @staticmethod
    def health_check() -> Dict[str, Any]:
        """
        Comprehensive health check for payment system
        """
        try:
            start_time = timezone.now()
            
            # Check API endpoint
            api_response = requests.get(
                f"{PaymentAdapter.BASE_URL}/api/payments/available-methods/",
                timeout=5,
                verify=True
            )
            
            # Check database connectivity via model
            from payments.models.payment_config_model import PaymentGateway
            db_check = PaymentGateway.objects.filter(is_active=True).exists()
            
            # Check cache
            cache_check = cache.set('health_check', 'ok', 10)
            
            duration = (timezone.now() - start_time).total_seconds()
            
            # Determine overall status
            api_ok = api_response.status_code == 200
            overall_status = 'healthy' if (api_ok and db_check and cache_check) else 'degraded'
            
            health_data = {
                'status': overall_status,
                'service': 'payment_adapter',
                'checks': {
                    'api_endpoint': {
                        'status': 'healthy' if api_ok else 'unhealthy',
                        'status_code': api_response.status_code,
                        'response_time': duration
                    },
                    'database': {
                        'status': 'healthy' if db_check else 'unhealthy',
                        'has_active_gateways': db_check
                    },
                    'cache': {
                        'status': 'healthy' if cache_check else 'unhealthy'
                    }
                },
                'timestamp': timezone.now().isoformat()
            }
            
            # Add gateway-specific health if API is up
            if api_ok:
                try:
                    from payments.models.payment_config_model import PaymentGateway
                    gateway_health = PaymentGateway.objects.filter(is_active=True).values(
                        'name', 'health_status', 'last_health_check'
                    )
                    health_data['gateway_health'] = list(gateway_health)
                except Exception as e:
                    logger.warning(f"Could not fetch gateway health: {e}")
                    health_data['gateway_health'] = 'unavailable'
            
            return health_data
            
        except requests.exceptions.Timeout:
            return {
                'status': 'timeout',
                'service': 'payment_adapter',
                'message': 'Payment service timeout',
                'timestamp': timezone.now().isoformat()
            }
        except requests.exceptions.ConnectionError:
            return {
                'status': 'unavailable',
                'service': 'payment_adapter',
                'message': 'Payment service connection failed',
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'service': 'payment_adapter',
                'message': str(e),
                'timestamp': timezone.now().isoformat()
            }

    @staticmethod
    def test_gateway_connection(gateway_id: str) -> Dict[str, Any]:
        """
        Test connection to specific payment gateway using your TestConnectionView
        """
        try:
            headers = {
                'Authorization': f'Bearer {PaymentAdapter._get_api_token()}',
                'X-Service': 'payment_adapter'
            }
            
            response = requests.post(
                f"{PaymentAdapter.BASE_URL}/api/payments/gateways/{gateway_id}/test-connection/",
                headers=headers,
                timeout=10,
                verify=True
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'gateway_id': gateway_id,
                    'test_result': result,
                    'timestamp': timezone.now().isoformat()
                }
            else:
                logger.error(f"Gateway connection test failed: HTTP {response.status_code}")
                return PaymentAdapter._error_response(
                    f"Gateway connection test failed: HTTP {response.status_code}",
                    gateway_id
                )
                
        except Exception as e:
            logger.error(f"Gateway connection test error: {e}")
            return PaymentAdapter._error_response(
                f"Gateway connection test error: {str(e)}",
                gateway_id
            )

    @staticmethod
    def _generate_reference() -> str:
        """Generate secure payment reference"""
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_part = str(uuid.uuid4().int)[:8]
        return f"PAY-{timestamp}-{random_part}"

    @staticmethod
    def _generate_signature(*args) -> str:
        """Generate HMAC signature for security"""
        secret = getattr(settings, 'PAYMENT_API_SECRET', 'change-this-in-production')
        message = ':'.join(str(arg) for arg in args)
        return hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    def _get_api_token() -> str:
        """Get API token"""
        return getattr(settings, 'PAYMENT_API_TOKEN', '')

    @staticmethod
    def _error_response(error: str, reference: str, status: str = 'error') -> Dict[str, Any]:
        """Standard error response format"""
        return {
            'success': False,
            'error': error,
            'reference': reference,
            'status': status,
            'timestamp': timezone.now().isoformat()
        }

    @staticmethod
    def _log_payment_initiation(reference: str, gateway, payment_data: Dict[str, Any]):
        """Log payment initiation for audit"""
        logger.info(
            f"Payment initiated - Reference: {reference}, "
            f"Gateway: {gateway.name}, "
            f"Amount: {payment_data.get('amount')}, "
            f"Client: {payment_data.get('client_id')}"
        )

    @staticmethod
    def validate_webhook_signature(payload: str, signature: str, webhook_type: str = 'payment') -> bool:
        """
        Validate webhook signature based on webhook type
        """
        try:
            if webhook_type == 'payment':
                secret = getattr(settings, 'PAYMENT_WEBHOOK_SECRET', '')
            elif webhook_type == 'subscription':
                secret = getattr(settings, 'SUBSCRIPTION_WEBHOOK_SECRET', '')
            else:
                secret = getattr(settings, 'WEBHOOK_SECRET', '')
            
            if not secret:
                logger.warning(f"{webhook_type} webhook secret not configured")
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