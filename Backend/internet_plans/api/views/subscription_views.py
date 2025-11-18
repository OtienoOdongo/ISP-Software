from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from internet_plans.models.create_plan_models import Subscription
from internet_plans.serializers.create_plan_serializers import SubscriptionSerializer
import logging

logger = logging.getLogger(__name__)

class SubscriptionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Subscription.objects.select_related(
            'client', 'internet_plan', 'router'
        ).order_by('-start_date')
        
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        plan_filter = request.query_params.get('plan')
        if plan_filter:
            queryset = queryset.filter(internet_plan_id=plan_filter)
            
        router_filter = request.query_params.get('router')
        if router_filter:
            queryset = queryset.filter(router_id=router_filter)
            
        access_method_filter = request.query_params.get('access_method')
        if access_method_filter:
            queryset = queryset.filter(access_method=access_method_filter)
            
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(
                start_date__gte=start_date,
                start_date__lte=end_date
            )
            
        serializer = SubscriptionSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SubscriptionActivationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, subscription_id):
        subscription = get_object_or_404(
            Subscription.objects.select_related('client', 'internet_plan', 'router'),
            pk=subscription_id
        )
        
        if subscription.status != 'active':
            return Response({
                'error': 'Subscription is not active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if subscription.activation_requested:
            return Response({
                'error': 'Activation already requested'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Request activation via service
        activation_result = subscription.request_activation()
        
        if activation_result['success']:
            return Response({
                'success': True,
                'message': 'Activation request submitted successfully',
                'activation_id': activation_result.get('activation_id')
            }, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({
                'success': False,
                'error': activation_result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, subscription_id):
        subscription = get_object_or_404(Subscription, pk=subscription_id)
        
        from internet_plans.services.activation_service import ActivationService
        
        activation_status = ActivationService.check_activation_status(subscription)
        
        return Response({
            'subscription_id': subscription.id,
            'status': subscription.status,
            'activation_status': activation_status,
            'remaining_data': subscription.get_remaining_data_display(),
            'remaining_time': subscription.get_remaining_time_display()
        })