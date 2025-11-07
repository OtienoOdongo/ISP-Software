
#  network_management/api/views/router_management/router_mac_detection_views.py
"""
MAC Address Detection Views for Network Management System

This module provides API views for MAC address detection and management.
"""

import logging
from django.utils import timezone
from django.core.cache import cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from network_management.utils.mac_detection import ProductionMACDetector

logger = logging.getLogger(__name__)


class GetMacView(APIView):
    """
    ENHANCED API View for production-ready MAC address detection.
    """
    
    permission_classes = [AllowAny]

    def __init__(self):
        super().__init__()
        self.detector = ProductionMACDetector()

    def get(self, request):
        """Enhanced MAC address detection with comprehensive client information."""
        client_ip = self.get_client_ip(request)
        method = request.query_params.get('method', 'auto')
        include_statistics = request.query_params.get('include_stats', 'false').lower() == 'true'

        try:
            client_info = {
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'accept_language': request.META.get('HTTP_ACCEPT_LANGUAGE', ''),
                'referer': request.META.get('HTTP_REFERER', ''),
                'method': method
            }

            detection_result = self.detector.detect_mac_address(client_ip, client_info)

            response_data = {
                'mac_address': detection_result['mac_address'],
                'client_ip': client_ip,
                'detection_method': detection_result['detection_method'],
                'confidence': detection_result['confidence'],
                'timestamp': detection_result['timestamp'],
                'attempted_methods': detection_result['attempted_methods']
            }

            if include_statistics:
                response_data['statistics'] = self.detector.get_detection_statistics()

            if not detection_result['mac_address']:
                response_data['suggestions'] = self.get_detection_suggestions(client_info)
                response_data['alternative_methods'] = self.get_alternative_methods()

            return Response(response_data)

        except Exception as e:
            logger.error(f"MAC address detection failed: {str(e)}")
            return Response({
                'error': 'MAC address detection failed',
                'client_ip': client_ip,
                'details': str(e),
                'suggestions': self.get_error_suggestions()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Handle client-side MAC address submission with validation."""
        client_ip = self.get_client_ip(request)
        mac_address = request.data.get('mac_address', '').lower().strip()
        source = request.data.get('source', 'manual')

        if not self.detector._validate_mac_format(mac_address):
            return Response({
                'error': 'Invalid MAC address format',
                'valid_formats': [
                    'XX:XX:XX:XX:XX:XX',
                    'XX-XX-XX-XX-XX-XX', 
                    'XXXX.XXXX.XXXX (Cisco)',
                    'XXXXXXXXXXXX (continuous)'
                ],
                'provided_mac': mac_address
            }, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"mac_detection:{client_ip}"
        cache.set(cache_key, {
            'mac_address': mac_address,
            'detection_method': f'client_{source}',
            'confidence': 'high',
            'timestamp': timezone.now().isoformat(),
            'client_validated': True
        }, 3600)

        logger.info(f"Client MAC address submitted: {mac_address} from {client_ip} via {source}")

        return Response({
            'message': 'MAC address received and validated successfully',
            'mac_address': mac_address,
            'client_ip': client_ip,
            'source': source,
            'timestamp': timezone.now().isoformat()
        })

    def get_detection_suggestions(self, client_info):
        """Get tailored suggestions for MAC detection."""
        user_agent = client_info.get('user_agent', '').lower()
        
        suggestions = []

        if 'chrome' in user_agent:
            suggestions.append("Chrome: Enable '#enable-network-logging' flag for enhanced detection")
        elif 'firefox' in user_agent:
            suggestions.append("Firefox: Network information API may be limited")
        elif 'safari' in user_agent:
            suggestions.append("Safari: Consider using a different browser for better MAC detection")

        suggestions.extend([
            "Ensure you're connected to the local network",
            "Try refreshing the page and detecting again",
            "Use the mobile app for more reliable detection",
            "Contact network administrator for manual MAC entry"
        ])

        return suggestions

    def get_alternative_methods(self):
        """Get alternative MAC detection methods."""
        return [
            {
                'name': 'mobile_app',
                'description': 'Use our mobile app for reliable MAC detection',
                'url': '/mobile-app-download'
            },
            {
                'name': 'manual_entry', 
                'description': 'Enter MAC address manually from device settings',
                'instructions': 'Go to device network settings to find MAC address'
            },
            {
                'name': 'router_admin',
                'description': 'Check router administration interface',
                'instructions': 'Login to router and check connected devices list'
            }
        ]

    def get_error_suggestions(self):
        """Get suggestions for system errors."""
        return [
            "System temporarily unavailable, please try again in a few moments",
            "Check your network connection and try again",
            "Contact support if the problem persists",
            "Use manual MAC address entry as alternative"
        ]

    def get_client_ip(self, request):
        """Enhanced client IP detection."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ips = [ip.strip() for ip in x_forwarded_for.split(',')]
            return ips[0] if ips else request.META.get('REMOTE_ADDR')
        else:
            return request.META.get('REMOTE_ADDR')