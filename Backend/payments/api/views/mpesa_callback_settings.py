import requests
import json
import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import (
    MpesaCallbackEvent, MpesaCallbackConfiguration, 
    MpesaCallbackLog, MpesaCallbackRule, MpesaCallbackSecurityProfile
)
from .serializers import (
    MpesaCallbackEventSerializer, MpesaCallbackConfigurationSerializer,
    MpesaCallbackLogSerializer, MpesaCallbackRuleSerializer,
    MpesaCallbackSecurityProfileSerializer, MpesaCallbackTestSerializer,
    MpesaCallbackBulkUpdateSerializer
)
from network_management.models.router_management_model import Router
from payments.models.payment_config_model import Transaction

logger = logging.getLogger(__name__)

class MpesaCallbackEventView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        events = MpesaCallbackEvent.objects.filter(is_active=True)
        serializer = MpesaCallbackEventSerializer(events, many=True)
        return Response(serializer.data)

class MpesaCallbackConfigurationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        router_id = request.query_params.get('router_id')
        event_type = request.query_params.get('event_type')
        
        queryset = MpesaCallbackConfiguration.objects.select_related('router', 'event')
        
        if router_id:
            queryset = queryset.filter(router_id=router_id)
        if event_type:
            queryset = queryset.filter(event__name=event_type)
        
        serializer = MpesaCallbackConfigurationSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = MpesaCallbackConfigurationSerializer(data=request.data)
        if serializer.is_valid():
            configuration = serializer.save()
            
            # Generate webhook secret if not provided
            if not configuration.webhook_secret:
                configuration.generate_webhook_secret()
                configuration.save()
            
            return Response(
                MpesaCallbackConfigurationSerializer(configuration).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MpesaCallbackConfigurationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(MpesaCallbackConfiguration, pk=pk)
    
    def get(self, request, pk):
        configuration = self.get_object(pk)
        serializer = MpesaCallbackConfigurationSerializer(configuration)
        return Response(serializer.data)
    
    def put(self, request, pk):
        configuration = self.get_object(pk)
        serializer = MpesaCallbackConfigurationSerializer(
            configuration, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        configuration = self.get_object(pk)
        configuration.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MpesaCallbackBulkOperationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = MpesaCallbackBulkUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        configurations = MpesaCallbackConfiguration.objects.filter(
            id__in=data['configuration_ids']
        )
        
        update_fields = {}
        if 'is_active' in data:
            update_fields['is_active'] = data['is_active']
        if 'security_level' in data:
            update_fields['security_level'] = data['security_level']
        
        if update_fields:
            configurations.update(**update_fields)
        
        return Response({
            "message": f"Updated {configurations.count()} configurations",
            "updated_count": configurations.count()
        })

class MpesaCallbackTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = MpesaCallbackTestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        configuration = get_object_or_404(
            MpesaCallbackConfiguration, 
            id=data['configuration_id']
        )
        
        # Test the callback configuration
        test_result = self.test_callback_configuration(
            configuration, 
            data['test_payload'],
            data['validate_security']
        )
        
        return Response(test_result)
    
    def test_callback_configuration(self, configuration, test_payload, validate_security):
        """Test callback configuration by sending a test request"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'SurfZone-Callback-Tester/1.0'
            }
            
            # Add security headers if configured
            if validate_security and configuration.security_level != 'low':
                headers.update(self.generate_security_headers(configuration))
            
            # Add custom headers
            headers.update(configuration.custom_headers or {})
            
            # Send test request
            response = requests.post(
                configuration.callback_url,
                json=test_payload,
                headers=headers,
                timeout=configuration.timeout_seconds
            )
            
            # Log the test
            MpesaCallbackLog.objects.create(
                configuration=configuration,
                payload=test_payload,
                response_status=response.status_code,
                response_body=response.text[:1000],  # Limit response size
                status='success' if response.ok else 'failed',
                processed_at=timezone.now()
            )
            
            return {
                "success": response.ok,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "configuration_id": str(configuration.id),
                "message": "Test completed successfully" if response.ok else "Test failed"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Callback test failed: {str(e)}")
            
            MpesaCallbackLog.objects.create(
                configuration=configuration,
                payload=test_payload,
                status='failed',
                error_message=str(e)
            )
            
            return {
                "success": False,
                "error": str(e),
                "configuration_id": str(configuration.id),
                "message": "Test failed with network error"
            }
    
    def generate_security_headers(self, configuration):
        """Generate security headers for callback testing"""
        headers = {}
        
        if configuration.webhook_secret:
            # Add signature header (simplified example)
            headers['X-Callback-Signature'] = f"test-signature-{configuration.webhook_secret[:8]}"
        
        if configuration.security_level in ['high', 'critical']:
            headers['X-Security-Level'] = configuration.security_level
        
        return headers

class MpesaCallbackLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        configuration_id = request.query_params.get('configuration_id')
        status_filter = request.query_params.get('status')
        days = int(request.query_params.get('days', 7))
        
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        queryset = MpesaCallbackLog.objects.filter(
            created_at__gte=start_date
        ).select_related('configuration', 'configuration__router', 'configuration__event')
        
        if configuration_id:
            queryset = queryset.filter(configuration_id=configuration_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MpesaCallbackLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = MpesaCallbackLogSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def paginate_queryset(self, queryset):
        # Simple pagination implementation
        page_size = 50
        page = int(self.request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size
        return queryset[start:end]
    
    def get_paginated_response(self, data):
        return Response({
            'results': data,
            'count': len(data),
            'next_page': None,  # Implement proper pagination if needed
            'previous_page': None
        })

class MpesaCallbackRuleView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        rules = MpesaCallbackRule.objects.filter(is_active=True)
        serializer = MpesaCallbackRuleSerializer(rules, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = MpesaCallbackRuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MpesaCallbackSecurityProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        profiles = MpesaCallbackSecurityProfile.objects.all()
        serializer = MpesaCallbackSecurityProfileSerializer(profiles, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = MpesaCallbackSecurityProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([])  # No authentication for callbacks
def mpesa_callback_dispatcher(request, router_id):
    """
    Main callback dispatcher that routes M-Pesa callbacks to appropriate endpoints
    based on router-specific configurations
    """
    try:
        router = get_object_or_404(Router, id=router_id, is_active=True)
        payload = request.data
        
        # Determine event type from payload
        event_type = self.detect_event_type(payload)
        
        # Find appropriate callback configuration
        configuration = MpesaCallbackConfiguration.objects.filter(
            router=router,
            event__name=event_type,
            is_active=True
        ).first()
        
        if not configuration:
            logger.warning(f"No callback configuration found for {event_type} on router {router.name}")
            return JsonResponse({"status": "no_configuration"}, status=404)
        
        # Apply routing rules
        final_configuration = self.apply_routing_rules(configuration, payload, request)
        
        # Deliver callback
        delivery_result = self.deliver_callback(final_configuration, payload, request)
        
        # Log the callback delivery
        callback_log = MpesaCallbackLog.objects.create(
            configuration=final_configuration,
            payload=payload,
            response_status=delivery_result.get('status_code'),
            response_body=delivery_result.get('response_body', '')[:1000],
            status=delivery_result.get('status', 'failed'),
            error_message=delivery_result.get('error_message', '')
        )
        
        if delivery_result['success']:
            return JsonResponse({"status": "success"})
        else:
            return JsonResponse(
                {"status": "error", "message": delivery_result['error_message']},
                status=500
            )
            
    except Exception as e:
        logger.error(f"Callback dispatcher error: {str(e)}")
        return JsonResponse(
            {"status": "error", "message": "Internal server error"},
            status=500
        )
    
    def detect_event_type(self, payload):
        """Detect M-Pesa event type from payload"""
        # Implement M-Pesa specific event detection logic
        if payload.get('ResultCode') == '0':
            return 'payment_success'
        elif payload.get('ResultCode') and payload.get('ResultCode') != '0':
            return 'payment_failure'
        elif payload.get('TransactionType') == 'Reversal':
            return 'reversal'
        else:
            return 'confirmation'  # Default
    
    def apply_routing_rules(self, configuration, payload, request):
        """Apply routing rules to determine final callback destination"""
        rules = MpesaCallbackRule.objects.filter(
            is_active=True
        ).order_by('priority')
        
        for rule in rules:
            if self.evaluate_rule(rule, payload, request):
                return rule.target_configuration
        
        return configuration  # Return original if no rules match
    
    def evaluate_rule(self, rule, payload, request):
        """Evaluate if a routing rule matches"""
        if rule.rule_type == 'header_based':
            return self.evaluate_header_rule(rule, request)
        elif rule.rule_type == 'payload_based':
            return self.evaluate_payload_rule(rule, payload)
        elif rule.rule_type == 'ip_based':
            return self.evaluate_ip_rule(rule, request)
        elif rule.rule_type == 'geo_based':
            return self.evaluate_geo_rule(rule, request)
        return False
    
    def deliver_callback(self, configuration, payload, request):
        """Deliver callback to the configured endpoint"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': f"SurfZone-Router-{configuration.router.name}"
            }
            
            # Add security headers
            if configuration.webhook_secret:
                headers['X-Callback-Signature'] = self.generate_signature(
                    payload, configuration.webhook_secret
                )
            
            # Add custom headers
            headers.update(configuration.custom_headers or {})
            
            # Add original IP for tracking
            headers['X-Forwarded-For'] = request.META.get('REMOTE_ADDR', '')
            
            response = requests.post(
                configuration.callback_url,
                json=payload,
                headers=headers,
                timeout=configuration.timeout_seconds
            )
            
            return {
                'success': response.ok,
                'status_code': response.status_code,
                'response_body': response.text,
                'status': 'success' if response.ok else 'failed'
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Callback delivery failed: {str(e)}")
            return {
                'success': False,
                'error_message': str(e),
                'status': 'failed'
            }
    
    def generate_signature(self, payload, secret):
        """Generate signature for callback verification"""
        import hashlib
        import hmac
        
        # Sort payload and create signature
        sorted_payload = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            secret.encode(),
            sorted_payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature

class MpesaCallbackAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        days = int(request.query_params.get('days', 30))
        router_id = request.query_params.get('router_id')
        
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        # Base queryset
        logs = MpesaCallbackLog.objects.filter(created_at__gte=start_date)
        
        if router_id:
            logs = logs.filter(configuration__router_id=router_id)
        
        # Success rate calculation
        total = logs.count()
        successful = logs.filter(status='success').count()
        success_rate = (successful / total * 100) if total > 0 else 0
        
        # Status distribution
        status_distribution = logs.values('status').annotate(count=models.Count('id'))
        
        # Response time analysis (if available)
        response_times = logs.exclude(processed_at=None).annotate(
            duration=models.F('processed_at') - models.F('created_at')
        ).aggregate(
            avg_duration=models.Avg('duration'),
            max_duration=models.Max('duration'),
            min_duration=models.Min('duration')
        )
        
        # Router performance
        router_performance = logs.values(
            'configuration__router__name'
        ).annotate(
            total=models.Count('id'),
            success=models.Count('id', filter=models.Q(status='success')),
            avg_response_time=models.Avg(
                models.F('processed_at') - models.F('created_at')
            )
        )
        
        return Response({
            'success_rate': round(success_rate, 2),
            'total_callbacks': total,
            'successful_callbacks': successful,
            'status_distribution': list(status_distribution),
            'response_times': response_times,
            'router_performance': list(router_performance),
            'time_period': f"Last {days} days"
        })