"""
Internet Plans - Service Operations Interface
Clean interface for service_operations app integration
Production-ready with comprehensive documentation
"""

from typing import Dict, List, Optional, Tuple, Any
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class ServiceOperationsInterface:
    """
    Interface for service operations app integration
    Defines WHAT operations are available without implementing HOW
    
    This interface should be implemented by service_operations app
    to provide actual functionality.
    """
    
    # Plan-related operations
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
        
        Args:
            plan_id: UUID of the internet plan
            client_id: UUID of the client
            access_method: 'hotspot' or 'pppoe'
            duration_hours: Subscription duration in hours
            router_id: Optional router ID for router-specific plans
            mac_address: Optional MAC address for hotspot
            
        Returns:
            Dictionary containing subscription details:
            {
                'subscription_id': str,
                'status': str,
                'plan_id': str,
                'client_id': str,
                'access_method': str,
                'start_date': datetime,
                'end_date': datetime,
                'transaction_reference': Optional[str]
            }
            
        Raises:
            ValueError: If validation fails
            PermissionError: If client cannot subscribe to plan
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def activate_subscription(
        subscription_id: str,
        transaction_reference: str
    ) -> Dict[str, Any]:
        """
        Activate a subscription after payment
        
        Args:
            subscription_id: UUID of the subscription
            transaction_reference: Payment transaction reference
            
        Returns:
            Dictionary containing activation details:
            {
                'success': bool,
                'subscription_id': str,
                'status': str,
                'activation_id': Optional[str],
                'message': str
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def check_plan_compatibility(
        plan_id: str,
        client_type: str,
        access_method: str,
        router_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Check if a plan is compatible with client type and access method
        
        Args:
            plan_id: UUID of the internet plan
            client_type: Type of client ('pppoe', 'hotspot', 'dual')
            access_method: Desired access method ('hotspot' or 'pppoe')
            router_id: Optional router ID for router-specific plans
            
        Returns:
            Dictionary containing compatibility results:
            {
                'compatible': bool,
                'plan_name': str,
                'plan_type': str,
                'client_type': str,
                'access_method': str,
                'router_compatible': bool,
                'technical_config': Dict,
                'errors': List[str]  # If not compatible
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def get_plan_technical_config(
        plan_id: str,
        access_method: str
    ) -> Dict[str, Any]:
        """
        Get technical configuration for network activation
        
        Args:
            plan_id: UUID of the internet plan
            access_method: 'hotspot' or 'pppoe'
            
        Returns:
            Dictionary containing technical configuration:
            {
                'download_speed': str,
                'upload_speed': str,
                'data_limit': str,
                'data_unit': str,
                'usage_limit': str,
                'usage_unit': str,
                'max_devices': int,
                'session_timeout': int,
                'idle_timeout': int,
                'validity_period': str,
                'validity_unit': str,
                'mac_binding': bool,
                'ip_pool': Optional[str],  # For PPPoE
                'dns_servers': List[str]   # For PPPoE
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    # Subscription management
    @staticmethod
    def get_subscription_details(subscription_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a subscription
        
        Args:
            subscription_id: UUID of the subscription
            
        Returns:
            Dictionary containing subscription details:
            {
                'subscription_id': str,
                'plan_id': str,
                'client_id': str,
                'status': str,
                'access_method': str,
                'start_date': datetime,
                'end_date': datetime,
                'remaining_data': int,
                'remaining_time': int,
                'data_used': int,
                'time_used': int,
                'activation_status': str,
                'router_id': Optional[int],
                'mac_address': Optional[str]
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def update_subscription_usage(
        subscription_id: str,
        data_used_bytes: int,
        time_used_seconds: int
    ) -> Dict[str, Any]:
        """
        Update subscription usage
        
        Args:
            subscription_id: UUID of the subscription
            data_used_bytes: Data used in bytes
            time_used_seconds: Time used in seconds
            
        Returns:
            Dictionary containing updated usage:
            {
                'success': bool,
                'subscription_id': str,
                'remaining_data': int,
                'remaining_time': int,
                'data_used': int,
                'time_used': int,
                'status': str
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def renew_subscription(
        subscription_id: str,
        duration_hours: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Renew an existing subscription
        
        Args:
            subscription_id: UUID of the subscription
            duration_hours: Optional new duration (uses plan default if not provided)
            
        Returns:
            Dictionary containing renewal details:
            {
                'success': bool,
                'subscription_id': str,
                'old_end_date': datetime,
                'new_end_date': datetime,
                'duration_hours': int,
                'status': str
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    # Client-related operations
    @staticmethod
    def get_client_subscriptions(
        client_id: str,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get all subscriptions for a client
        
        Args:
            client_id: UUID of the client
            active_only: If True, only return active subscriptions
            
        Returns:
            List of subscription dictionaries
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def validate_client_for_plan(
        client_id: str,
        plan_id: str
    ) -> Dict[str, Any]:
        """
        Validate if a client can subscribe to a plan
        
        Args:
            client_id: UUID of the client
            plan_id: UUID of the internet plan
            
        Returns:
            Dictionary containing validation results:
            {
                'valid': bool,
                'client_id': str,
                'plan_id': str,
                'errors': List[str],
                'warnings': List[str],
                'restrictions': List[str]
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    # Bulk operations
    @staticmethod
    def bulk_create_subscriptions(
        subscriptions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create multiple subscriptions in bulk
        
        Args:
            subscriptions: List of subscription dictionaries
            
        Returns:
            Dictionary containing bulk operation results:
            {
                'total': int,
                'successful': int,
                'failed': int,
                'results': List[Dict],
                'errors': List[Dict]
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    # Analytics and reporting
    @staticmethod
    def get_plan_usage_statistics(
        plan_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get usage statistics for a plan
        
        Args:
            plan_id: UUID of the internet plan
            start_date: Optional start date (ISO format)
            end_date: Optional end date (ISO format)
            
        Returns:
            Dictionary containing usage statistics:
            {
                'plan_id': str,
                'plan_name': str,
                'total_subscriptions': int,
                'active_subscriptions': int,
                'total_revenue': Decimal,
                'average_duration': float,
                'average_data_used': float,
                'peak_usage_times': List[Dict],
                'subscription_trends': Dict
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def get_client_plan_history(
        client_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get plan history for a client
        
        Args:
            client_id: UUID of the client
            
        Returns:
            List of plan history entries:
            [
                {
                    'subscription_id': str,
                    'plan_id': str,
                    'plan_name': str,
                    'start_date': datetime,
                    'end_date': datetime,
                    'status': str,
                    'access_method': str,
                    'total_paid': Decimal,
                    'data_used': int
                }
            ]
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    # Utility methods
    @staticmethod
    def health_check() -> Dict[str, Any]:
        """
        Check if service operations is available
        
        Returns:
            Dictionary containing health status:
            {
                'service': 'service_operations',
                'status': 'healthy' | 'degraded' | 'unavailable',
                'timestamp': datetime,
                'version': str,
                'dependencies': Dict
            }
        """
        raise NotImplementedError("This method should be implemented by service_operations app")
    
    @staticmethod
    def get_api_version() -> str:
        """
        Get the API version of service operations
        
        Returns:
            API version string (e.g., '1.0.0')
        """
        raise NotImplementedError("This method should be implemented by service_operations app")


# Fallback implementation for development/testing
class MockServiceOperationsInterface(ServiceOperationsInterface):
    """
    Mock implementation for development and testing
    Returns sample data without external dependencies
    """
    
    @staticmethod
    def create_subscription(
        plan_id: str,
        client_id: str,
        access_method: str,
        duration_hours: int = 24,
        router_id: Optional[int] = None,
        mac_address: Optional[str] = None
    ) -> Dict[str, Any]:
        logger.warning("Using mock service operations interface - subscription not actually created")
        
        from django.utils import timezone
        from datetime import timedelta
        
        return {
            'subscription_id': 'mock-subscription-id',
            'status': 'pending',
            'plan_id': plan_id,
            'client_id': client_id,
            'access_method': access_method,
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(hours=duration_hours),
            'transaction_reference': 'MOCK-TXN-001',
            'warning': 'Mock implementation - no actual subscription created'
        }
    
    @staticmethod
    def check_plan_compatibility(
        plan_id: str,
        client_type: str,
        access_method: str,
        router_id: Optional[int] = None
    ) -> Dict[str, Any]:
        logger.warning("Using mock service operations interface - compatibility check")
        
        return {
            'compatible': True,
            'plan_name': 'Mock Plan',
            'plan_type': 'paid',
            'client_type': client_type,
            'access_method': access_method,
            'router_compatible': True,
            'technical_config': {
                'download_speed': '10 Mbps',
                'upload_speed': '5 Mbps',
                'data_limit': '10 GB',
                'usage_limit': '24 Hours',
                'max_devices': 1
            },
            'warning': 'Mock implementation - actual compatibility not checked'
        }
    
    @staticmethod
    def get_plan_technical_config(
        plan_id: str,
        access_method: str
    ) -> Dict[str, Any]:
        logger.warning("Using mock service operations interface - technical config")
        
        return {
            'download_speed': '10',
            'upload_speed': '5',
            'data_limit': '10',
            'data_unit': 'GB',
            'usage_limit': '24',
            'usage_unit': 'Hours',
            'max_devices': 1,
            'session_timeout': 86400,
            'idle_timeout': 300,
            'validity_period': '30',
            'validity_unit': 'Days',
            'mac_binding': False,
            'warning': 'Mock implementation - actual config not retrieved'
        }
    
    @staticmethod
    def health_check() -> Dict[str, Any]:
        from django.utils import timezone
        
        return {
            'service': 'service_operations',
            'status': 'degraded',
            'timestamp': timezone.now(),
            'version': 'mock-1.0.0',
            'dependencies': {
                'database': 'mock',
                'cache': 'mock',
                'network_management': 'unavailable'
            },
            'warning': 'Using mock service operations interface'
        }


# Factory function to get the appropriate interface
def get_service_operations_interface() -> ServiceOperationsInterface:
    """
    Factory function to get service operations interface
    Automatically detects if service_operations app is available
    """
    try:
        # Try to import the real implementation
        from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
        
        # Return the real adapter if available
        class RealServiceOperationsInterface(ServiceOperationsInterface):
            """Real implementation using service_operations adapter"""
            
            @staticmethod
            def create_subscription(**kwargs):
                return InternetPlansAdapter.create_subscription(**kwargs)
            
            @staticmethod
            def activate_subscription(**kwargs):
                return InternetPlansAdapter.activate_subscription(**kwargs)
            
            @staticmethod
            def check_plan_compatibility(**kwargs):
                return InternetPlansAdapter.check_plan_compatibility(**kwargs)
            
            @staticmethod
            def get_plan_technical_config(**kwargs):
                return InternetPlansAdapter.get_plan_technical_config(**kwargs)
            
            @staticmethod
            def get_subscription_details(**kwargs):
                return InternetPlansAdapter.get_subscription_details(**kwargs)
            
            @staticmethod
            def update_subscription_usage(**kwargs):
                return InternetPlansAdapter.update_subscription_usage(**kwargs)
            
            @staticmethod
            def renew_subscription(**kwargs):
                return InternetPlansAdapter.renew_subscription(**kwargs)
            
            @staticmethod
            def get_client_subscriptions(**kwargs):
                return InternetPlansAdapter.get_client_subscriptions(**kwargs)
            
            @staticmethod
            def validate_client_for_plan(**kwargs):
                return InternetPlansAdapter.validate_client_for_plan(**kwargs)
            
            @staticmethod
            def bulk_create_subscriptions(**kwargs):
                return InternetPlansAdapter.bulk_create_subscriptions(**kwargs)
            
            @staticmethod
            def get_plan_usage_statistics(**kwargs):
                return InternetPlansAdapter.get_plan_usage_statistics(**kwargs)
            
            @staticmethod
            def get_client_plan_history(**kwargs):
                return InternetPlansAdapter.get_client_plan_history(**kwargs)
            
            @staticmethod
            def health_check():
                return InternetPlansAdapter.health_check()
            
            @staticmethod
            def get_api_version():
                return InternetPlansAdapter.get_api_version()
        
        logger.info("Using real service operations interface")
        return RealServiceOperationsInterface
        
    except ImportError:
        logger.warning("Service operations app not available, using mock interface")
        return MockServiceOperationsInterface


# Singleton instance for easy access
service_operations = get_service_operations_interface()