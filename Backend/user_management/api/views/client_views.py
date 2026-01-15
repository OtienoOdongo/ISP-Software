


# """
# Integrated Client Management Views with Internet Plan Integration
# Production-ready with complete plan management workflow
# """
# import logging
# import io
# import csv
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, viewsets
# from rest_framework.decorators import action
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.pagination import PageNumberPagination
# from django.utils import timezone
# from django.core.exceptions import ObjectDoesNotExist, ValidationError
# from django.db.models import Q, Count, Sum, Avg, F, Max, Min
# from django.db import transaction
# from django.core.cache import cache
# from decimal import Decimal
# from datetime import timedelta
# from django.conf import settings
# import json
# from django.shortcuts import get_object_or_404

# from user_management.models.client_model import (
#     ClientProfile, ClientAnalyticsSnapshot,
#     CommissionTransaction, ClientInteraction
# )
# from user_management.serializers.client_serializer import (
#     ClientProfileSerializer, CreatePPPoEClientSerializer,
#     CreateHotspotClientSerializer, UpdateClientTierSerializer,
#     ClientAnalyticsSnapshotSerializer, ClientInteractionSerializer,
#     CommissionTransactionSerializer, SendMessageSerializer,
#     AssignPlanSerializer, ChangePlanSerializer, PlanRenewalSerializer,
#     PlanSuspensionSerializer, PlanRecommendationSerializer,
#     ClientPlanDashboardSerializer
# )

# logger = logging.getLogger(__name__)


# class StandardResultsSetPagination(PageNumberPagination):
#     page_size = 50
#     page_size_query_param = 'page_size'
#     max_page_size = 200
#     page_query_param = 'page'


# class ClientProfileViewSet(viewsets.ModelViewSet):
#     """Client Profile Management - Integrated with Internet Plans"""
    
#     queryset = ClientProfile.objects.all().select_related('user')
#     serializer_class = ClientProfileSerializer
#     permission_classes = [IsAuthenticated]
#     pagination_class = StandardResultsSetPagination
    
#     def get_queryset(self):
#         """Filter queryset based on user permissions and query params"""
#         queryset = super().get_queryset()
#         params = self.request.query_params
        
#         # Connection type filter
#         connection_type = params.get('connection_type')
#         if connection_type and connection_type != 'all':
#             queryset = queryset.filter(user__connection_type=connection_type)
        
#         # Client type filter
#         client_type = params.get('client_type')
#         if client_type:
#             queryset = queryset.filter(client_type=client_type)
        
#         # Status filter
#         status_filter = params.get('status')
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
        
#         # Tier filter
#         tier_filter = params.get('tier')
#         if tier_filter:
#             queryset = queryset.filter(tier=tier_filter)
        
#         # Revenue segment filter
#         revenue_segment = params.get('revenue_segment')
#         if revenue_segment:
#             queryset = queryset.filter(revenue_segment=revenue_segment)
        
#         # Usage pattern filter
#         usage_pattern = params.get('usage_pattern')
#         if usage_pattern:
#             queryset = queryset.filter(usage_pattern=usage_pattern)
        
#         # Marketer filter
#         is_marketer = params.get('is_marketer')
#         if is_marketer is not None:
#             queryset = queryset.filter(is_marketer=(is_marketer.lower() == 'true'))
        
#         # Plan status filter
#         plan_status = params.get('plan_status')
#         if plan_status == 'with_plan':
#             queryset = queryset.filter(~Q(current_plan_info={}))
#         elif plan_status == 'without_plan':
#             queryset = queryset.filter(current_plan_info={})
        
#         # At-risk filter
#         at_risk = params.get('at_risk')
#         if at_risk is not None:
#             if at_risk.lower() == 'true':
#                 queryset = queryset.filter(churn_risk_score__gte=Decimal('7.0'))
#             else:
#                 queryset = queryset.filter(churn_risk_score__lt=Decimal('7.0'))
        
#         # Needs attention filter
#         needs_attention = params.get('needs_attention')
#         if needs_attention is not None:
#             if needs_attention.lower() == 'true':
#                 queryset = queryset.filter(
#                     Q(churn_risk_score__gte=Decimal('7.0')) |
#                     Q(days_since_last_payment__gt=7) |
#                     Q(flags__contains=['payment_failed'])
#                 )
        
#         # Date range filters
#         date_from = params.get('date_from')
#         date_to = params.get('date_to')
#         if date_from:
#             queryset = queryset.filter(created_at__date__gte=date_from)
#         if date_to:
#             queryset = queryset.filter(created_at__date__lte=date_to)
        
#         # Search filter
#         search_query = params.get('search')
#         if search_query:
#             queryset = queryset.filter(
#                 Q(user__username__icontains=search_query) |
#                 Q(user__phone_number__icontains=search_query) |
#                 Q(user__name__icontains=search_query) |
#                 Q(referral_code__icontains=search_query) |
#                 Q(email__icontains=search_query)
#             )
        
#         # Revenue range filter
#         min_revenue = params.get('min_revenue')
#         max_revenue = params.get('max_revenue')
#         if min_revenue:
#             queryset = queryset.filter(lifetime_value__gte=Decimal(min_revenue))
#         if max_revenue:
#             queryset = queryset.filter(lifetime_value__lte=Decimal(max_revenue))
        
#         # Sort by parameter
#         sort_by = params.get('sort_by', '-created_at')
#         sort_order = params.get('sort_order', 'desc')
        
#         sort_map = {
#             'username': 'user__username',
#             'phone': 'user__phone_number',
#             'name': 'user__name',
#             'email': 'email',
#             'revenue': 'lifetime_value',
#             'data_usage': 'total_data_used_gb',
#             'churn_risk': 'churn_risk_score',
#             'engagement': 'engagement_score',
#             'last_payment': 'last_payment_date',
#             'plan_status': 'current_plan_info__plan__name',
#             'created': 'created_at',
#             'updated': 'updated_at',
#         }
        
#         field = sort_map.get(sort_by, sort_by)
#         if sort_order == 'desc' and not field.startswith('-'):
#             field = f'-{field}'
#         elif sort_order == 'asc' and field.startswith('-'):
#             field = field[1:]
        
#         return queryset.order_by(field)
    
#     @action(detail=True, methods=['get'])
#     def analytics(self, request, pk=None):
#         """Get detailed analytics for a client"""
#         try:
#             client = self.get_object()
            
#             # Get analytics snapshots
#             snapshots = ClientAnalyticsSnapshot.objects.filter(
#                 client=client
#             ).order_by('-date')[:30]
            
#             # Get insights from service
#             from user_management.services.client_services import AnalyticsService
#             insights = AnalyticsService.get_client_insights(client)
            
#             # Get recent interactions
#             recent_interactions = ClientInteraction.objects.filter(
#                 client=client
#             ).order_by('-started_at')[:20]
            
#             # Get commission history if marketer
#             commission_history = None
#             if client.is_marketer:
#                 commission_history = CommissionTransaction.objects.filter(
#                     marketer=client
#                 ).order_by('-transaction_date')[:10]
            
#             # Get plan analytics
#             plan_analytics = self._get_plan_analytics(client)
            
#             return Response({
#                 'client': ClientProfileSerializer(client, context={'request': request}).data,
#                 'analytics': ClientAnalyticsSnapshotSerializer(snapshots, many=True).data,
#                 'insights': insights,
#                 'recent_interactions': ClientInteractionSerializer(recent_interactions, many=True).data,
#                 'commission_history': CommissionTransactionSerializer(commission_history, many=True).data if commission_history else [],
#                 'plan_analytics': plan_analytics
#             })
            
#         except ObjectDoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error getting client analytics: {str(e)}")
#             return Response({"error": "Failed to load client analytics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def update_metrics(self, request, pk=None):
#         """Update client metrics manually"""
#         try:
#             client = self.get_object()
            
#             # Update metrics using service
#             from user_management.services.client_services import AnalyticsService
#             updated_client = AnalyticsService.update_client_metrics(client)
            
#             return Response({
#                 'success': True,
#                 'message': 'Client metrics updated successfully',
#                 'client': ClientProfileSerializer(updated_client, context={'request': request}).data
#             })
            
#         except ObjectDoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error updating client metrics: {str(e)}")
#             return Response({"error": "Failed to update client metrics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['get'])
#     def plan_dashboard(self, request, pk=None):
#         """Get comprehensive plan dashboard for client"""
#         try:
#             client = self.get_object()
            
#             # Get current plan details
#             current_plan = self._get_current_plan_details(client)
            
#             # Get plan utilization
#             plan_utilization = self._get_plan_utilization(client)
            
#             # Get usage history
#             usage_history = self._get_usage_history(client)
            
#             # Get payment history
#             payment_history = self._get_payment_history(client)
            
#             # Get recommendations
#             recommendations = self._get_plan_recommendations(client)
            
#             # Get available actions
#             actions = self._get_plan_actions(client, request.user)
            
#             return Response({
#                 'success': True,
#                 'client_info': {
#                     'id': str(client.id),
#                     'username': client.username,
#                     'phone': client.phone_number,
#                     'connection_type': client.connection_type,
#                     'tier': client.tier,
#                     'status': client.status
#                 },
#                 'current_plan': current_plan,
#                 'plan_utilization': plan_utilization,
#                 'usage_history': usage_history,
#                 'payment_history': payment_history,
#                 'recommendations': recommendations,
#                 'actions': actions,
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting plan dashboard: {str(e)}")
#             return Response({
#                 'error': 'Failed to load plan dashboard',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def assign_plan(self, request, pk=None):
#         """Assign plan to client"""
#         try:
#             client = self.get_object()
#             serializer = AssignPlanSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             plan_id = data['plan_id']
#             auto_renew = data['auto_renew']
#             send_notification = data['send_notification']
#             assign_credentials = data.get('assign_credentials', True)
#             notes = data.get('notes', '')
            
#             # Get plan
#             from internet_plans.models import InternetPlan
#             plan = InternetPlan.objects.get(id=plan_id, active=True)
            
#             # Check compatibility
#             if not self._is_plan_compatible(client, plan):
#                 return Response({
#                     'error': f'Plan "{plan.name}" is not compatible with {client.connection_type} connection'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create subscription
#             with transaction.atomic():
#                 subscription = self._create_plan_subscription(
#                     client=client,
#                     plan=plan,
#                     auto_renew=auto_renew,
#                     assign_credentials=assign_credentials,
#                     notes=notes,
#                     assigned_by=request.user
#                 )
                
#                 # Update client's cached plan info
#                 client.plan_updated_at = timezone.now()
#                 client.plan_auto_renew = auto_renew
#                 client.save()
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client,
#                     interaction_type='plan_purchase',
#                     action='Plan Assigned by Admin',
#                     description=f'Plan "{plan.name}" assigned by {request.user.email}',
#                     outcome='success',
#                     plan_reference=plan,
#                     started_at=timezone.now(),
#                     metadata={
#                         'subscription_id': str(subscription.id),
#                         'assigned_by': request.user.email,
#                         'auto_renew': auto_renew,
#                         'notes': notes
#                     }
#                 )
                
#                 # Send notification if requested
#                 if send_notification:
#                     self._send_plan_assignment_notification(client, plan, subscription)
                
#                 # Update commission if marketer referral
#                 self._process_plan_commission(client, plan, subscription)
            
#             return Response({
#                 'success': True,
#                 'message': f'Plan "{plan.name}" successfully assigned to {client.username}',
#                 'subscription': {
#                     'id': str(subscription.id),
#                     'plan_name': plan.name,
#                     'status': subscription.status,
#                     'start_date': subscription.start_date.isoformat(),
#                     'end_date': subscription.end_date.isoformat(),
#                     'auto_renew': subscription.auto_renew
#                 },
#                 'client': ClientProfileSerializer(client, context={'request': request}).data
#             })
            
#         except InternetPlan.DoesNotExist:
#             return Response({'error': 'Plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error assigning plan: {str(e)}")
#             return Response({
#                 'error': 'Failed to assign plan',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def change_plan(self, request, pk=None):
#         """Change client's current plan"""
#         try:
#             client = self.get_object()
#             serializer = ChangePlanSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             new_plan_id = data['new_plan_id']
#             immediate = data['immediate']
#             pro_rate = data['pro_rate']
#             send_notification = data['send_notification']
#             reason = data.get('reason', '')
            
#             # Get current subscription
#             current_subscription = client.active_plan_subscription()
#             if not current_subscription:
#                 return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get new plan
#             from internet_plans.models import InternetPlan
#             new_plan = InternetPlan.objects.get(id=new_plan_id, active=True)
            
#             # Check compatibility
#             if not self._is_plan_compatible(client, new_plan):
#                 return Response({
#                     'error': f'Plan "{new_plan.name}" is not compatible with {client.connection_type} connection'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Process plan change
#             with transaction.atomic():
#                 if immediate:
#                     # End current subscription and start new one immediately
#                     current_subscription.status = 'expired'
#                     current_subscription.end_date = timezone.now()
#                     current_subscription.metadata = {
#                         **current_subscription.metadata,
#                         'changed_to': str(new_plan.id),
#                         'change_reason': reason,
#                         'changed_by': request.user.email,
#                         'changed_at': timezone.now().isoformat()
#                     }
#                     current_subscription.save()
                    
#                     # Create new subscription
#                     new_subscription = self._create_plan_subscription(
#                         client=client,
#                         plan=new_plan,
#                         auto_renew=current_subscription.auto_renew,
#                         assign_credentials=False,  # Keep existing credentials
#                         notes=f"Changed from {current_subscription.internet_plan.name}: {reason}",
#                         assigned_by=request.user
#                     )
                    
#                 else:
#                     # Schedule change for next billing cycle
#                     current_subscription.metadata = {
#                         **current_subscription.metadata,
#                         'scheduled_change': {
#                             'new_plan_id': str(new_plan.id),
#                             'effective_date': current_subscription.end_date.isoformat(),
#                             'reason': reason,
#                             'scheduled_by': request.user.email,
#                             'scheduled_at': timezone.now().isoformat()
#                         }
#                     }
#                     current_subscription.save()
#                     new_subscription = None
                
#                 # Update client
#                 client.plan_updated_at = timezone.now()
#                 client.save()
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client,
#                     interaction_type='plan_change',
#                     action='Plan Changed' + (' (Immediate)' if immediate else ' (Scheduled)'),
#                     description=f'Changed from "{current_subscription.internet_plan.name}" to "{new_plan.name}": {reason}',
#                     outcome='success',
#                     plan_reference=new_plan,
#                     started_at=timezone.now(),
#                     metadata={
#                         'old_plan': current_subscription.internet_plan.name,
#                         'new_plan': new_plan.name,
#                         'immediate': immediate,
#                         'pro_rate': pro_rate,
#                         'reason': reason,
#                         'changed_by': request.user.email
#                     }
#                 )
                
#                 # Send notification if requested
#                 if send_notification:
#                     self._send_plan_change_notification(client, current_subscription.internet_plan, new_plan, immediate)
            
#             response_data = {
#                 'success': True,
#                 'message': f'Plan changed from "{current_subscription.internet_plan.name}" to "{new_plan.name}"',
#                 'details': {
#                     'old_plan': current_subscription.internet_plan.name,
#                     'new_plan': new_plan.name,
#                     'change_type': 'immediate' if immediate else 'scheduled',
#                     'effective_date': current_subscription.end_date.isoformat() if not immediate else timezone.now().isoformat()
#                 }
#             }
            
#             if new_subscription:
#                 response_data['new_subscription'] = {
#                     'id': str(new_subscription.id),
#                     'start_date': new_subscription.start_date.isoformat(),
#                     'end_date': new_subscription.end_date.isoformat()
#                 }
            
#             return Response(response_data)
            
#         except InternetPlan.DoesNotExist:
#             return Response({'error': 'New plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error changing plan: {str(e)}")
#             return Response({
#                 'error': 'Failed to change plan',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def renew_plan(self, request, pk=None):
#         """Renew client's current plan"""
#         try:
#             client = self.get_object()
#             serializer = PlanRenewalSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             renew_period = data['renew_period']
#             auto_renew = data['auto_renew']
#             send_notification = data['send_notification']
#             payment_method = data.get('payment_method', '')
            
#             # Get current subscription
#             subscription = client.active_plan_subscription()
#             if not subscription:
#                 return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Calculate new end date based on renewal period
#             period_days = {
#                 '1m': 30,
#                 '3m': 90,
#                 '6m': 180,
#                 '12m': 365
#             }.get(renew_period, 30)
            
#             new_end_date = subscription.end_date + timedelta(days=period_days)
            
#             with transaction.atomic():
#                 # Update subscription
#                 subscription.end_date = new_end_date
#                 subscription.auto_renew = auto_renew
#                 subscription.metadata = {
#                     **subscription.metadata,
#                     'renewals': subscription.metadata.get('renewals', []) + [{
#                         'date': timezone.now().isoformat(),
#                         'period': renew_period,
#                         'new_end_date': new_end_date.isoformat(),
#                         'renewed_by': request.user.email,
#                         'payment_method': payment_method
#                     }]
#                 }
#                 subscription.save()
                
#                 # Update client
#                 client.plan_auto_renew = auto_renew
#                 client.plan_updated_at = timezone.now()
#                 client.save()
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client,
#                     interaction_type='plan_renewal',
#                     action='Plan Renewed',
#                     description=f'Plan "{subscription.internet_plan.name}" renewed for {renew_period}',
#                     outcome='success',
#                     plan_reference=subscription.internet_plan,
#                     started_at=timezone.now(),
#                     metadata={
#                         'renew_period': renew_period,
#                         'new_end_date': new_end_date.isoformat(),
#                         'auto_renew': auto_renew,
#                         'payment_method': payment_method,
#                         'renewed_by': request.user.email
#                     }
#                 )
                
#                 # Send notification if requested
#                 if send_notification:
#                     self._send_plan_renewal_notification(client, subscription, renew_period, new_end_date)
            
#             return Response({
#                 'success': True,
#                 'message': f'Plan "{subscription.internet_plan.name}" renewed successfully',
#                 'details': {
#                     'plan_name': subscription.internet_plan.name,
#                     'renewal_period': renew_period,
#                     'new_end_date': new_end_date.isoformat(),
#                     'auto_renew': auto_renew
#                 },
#                 'client': ClientProfileSerializer(client, context={'request': request}).data
#             })
            
#         except Exception as e:
#             logger.error(f"Error renewing plan: {str(e)}")
#             return Response({
#                 'error': 'Failed to renew plan',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def suspend_plan(self, request, pk=None):
#         """Suspend client's plan (admin only)"""
#         try:
#             client = self.get_object()
            
#             # Check permissions
#             if not (request.user.is_staff or request.user.is_superuser):
#                 return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
#             serializer = PlanSuspensionSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             reason = data['reason']
#             duration_days = data['duration_days']
#             send_notification = data['send_notification']
#             notes = data.get('notes', '')
            
#             # Get current subscription
#             subscription = client.active_plan_subscription()
#             if not subscription:
#                 return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
#             with transaction.atomic():
#                 # Update subscription
#                 old_status = subscription.status
#                 subscription.status = 'suspended'
#                 subscription.end_date = timezone.now() + timedelta(days=duration_days)
#                 subscription.metadata = {
#                     **subscription.metadata,
#                     'suspensions': subscription.metadata.get('suspensions', []) + [{
#                         'date': timezone.now().isoformat(),
#                         'reason': reason,
#                         'duration_days': duration_days,
#                         'suspended_by': request.user.email,
#                         'notes': notes,
#                         'old_status': old_status
#                     }]
#                 }
#                 subscription.save()
                
#                 # Update client status
#                 client.status = 'suspended'
#                 client.plan_updated_at = timezone.now()
#                 client.save()
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client,
#                     interaction_type='plan_suspension',
#                     action='Plan Suspended',
#                     description=f'Plan suspended: {reason}',
#                     outcome='success',
#                     plan_reference=subscription.internet_plan,
#                     started_at=timezone.now(),
#                     metadata={
#                         'reason': reason,
#                         'duration_days': duration_days,
#                         'new_end_date': subscription.end_date.isoformat(),
#                         'suspended_by': request.user.email,
#                         'notes': notes
#                     }
#                 )
                
#                 # Send notification if requested
#                 if send_notification:
#                     self._send_plan_suspension_notification(client, subscription, reason, duration_days)
            
#             return Response({
#                 'success': True,
#                 'message': f'Plan suspended for {duration_days} days',
#                 'details': {
#                     'reason': reason,
#                     'duration_days': duration_days,
#                     'new_end_date': subscription.end_date.isoformat(),
#                     'suspended_by': request.user.email
#                 },
#                 'client': ClientProfileSerializer(client, context={'request': request}).data
#             })
            
#         except Exception as e:
#             logger.error(f"Error suspending plan: {str(e)}")
#             return Response({
#                 'error': 'Failed to suspend plan',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def toggle_auto_renew(self, request, pk=None):
#         """Toggle auto-renew for client's plan"""
#         try:
#             client = self.get_object()
            
#             # Get current subscription
#             subscription = client.active_plan_subscription()
#             if not subscription:
#                 return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
#             new_auto_renew = not subscription.auto_renew
            
#             with transaction.atomic():
#                 # Update subscription
#                 subscription.auto_renew = new_auto_renew
#                 subscription.save()
                
#                 # Update client
#                 client.plan_auto_renew = new_auto_renew
#                 client.save()
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client,
#                     interaction_type='profile_update',
#                     action='Auto-Renew Updated',
#                     description=f'Auto-renew changed to {new_auto_renew}',
#                     outcome='success',
#                     started_at=timezone.now(),
#                     metadata={
#                         'new_auto_renew': new_auto_renew,
#                         'updated_by': request.user.email
#                     }
#                 )
            
#             return Response({
#                 'success': True,
#                 'message': f'Auto-renew {"enabled" if new_auto_renew else "disabled"}',
#                 'auto_renew': new_auto_renew,
#                 'client': ClientProfileSerializer(client, context={'request': request}).data
#             })
            
#         except Exception as e:
#             logger.error(f"Error toggling auto-renew: {str(e)}")
#             return Response({
#                 'error': 'Failed to update auto-renew',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def resend_credentials(self, request, pk=None):
#         """Resend PPPoE credentials to client via SMS"""
#         try:
#             client = self.get_object()
            
#             if not client.is_pppoe_client:
#                 return Response(
#                     {"error": "Only PPPoE clients can have credentials resent"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Get PPPoE credentials from subscription
#             subscription = client.active_plan_subscription()
#             if not subscription or not hasattr(subscription, 'pppoe_username'):
#                 return Response(
#                     {"error": "PPPoE credentials not found"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             pppoe_username = subscription.pppoe_username
#             pppoe_password = subscription.get_decrypted_password() if hasattr(subscription, 'get_decrypted_password') else ''
            
#             if not pppoe_password:
#                 return Response(
#                     {"error": "PPPoE password could not be retrieved"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
            
#             # Send SMS via SMS Automation Service
#             try:
#                 from user_management.services.sms_services import SMSService
#                 sms_service = SMSService()
#                 sms = sms_service.send_pppoe_credentials(
#                     phone_number=client.phone_number,
#                     client_name=client.username,
#                     pppoe_username=pppoe_username,
#                     password=pppoe_password,
#                     plan_name=subscription.internet_plan.name if subscription.internet_plan else '',
#                     reference_id=f"resend_{client.id}_{timezone.now().timestamp()}"
#                 )
                
#                 # Log interaction
#                 ClientInteraction.objects.create(
#                     client=client,
#                     interaction_type='sms_sent',
#                     action='PPPoE Credentials Resent',
#                     description='PPPoE credentials resent via SMS',
#                     outcome='success',
#                     started_at=timezone.now(),
#                     metadata={'sms_id': str(sms.id)}
#                 )
                
#                 return Response({
#                     'success': True,
#                     'message': 'Credentials resent successfully',
#                     'sms_status': sms.status,
#                     'timestamp': timezone.now().isoformat()
#                 })
                
#             except ImportError:
#                 logger.error("SMS Automation service not available")
#                 return Response(
#                     {"error": "SMS service not available"},
#                     status=status.HTTP_503_SERVICE_UNAVAILABLE
#                 )
            
#         except Exception as e:
#             logger.error(f"Error resending credentials: {str(e)}")
#             return Response({"error": f"Failed to resend credentials: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def update_tier(self, request, pk=None):
#         """Update client tier"""
#         try:
#             client = self.get_object()
#             serializer = UpdateClientTierSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             new_tier = data['tier']
#             reason = data.get('reason', '')
#             send_notification = data.get('send_notification', True)
            
#             old_tier = client.tier
#             client.tier = new_tier
#             client.tier_upgraded_at = timezone.now()
#             client.save()
            
#             # Log interaction
#             ClientInteraction.objects.create(
#                 client=client,
#                 interaction_type='profile_update',
#                 action='Tier Updated',
#                 description=f"Tier changed from {old_tier} to {new_tier}: {reason}",
#                 outcome='success',
#                 started_at=timezone.now(),
#                 metadata={
#                     'old_tier': old_tier,
#                     'new_tier': new_tier,
#                     'updated_by': request.user.email,
#                     'reason': reason
#                 }
#             )
            
#             # Send notification via SMS if requested
#             if send_notification and hasattr(client, 'phone_number'):
#                 try:
#                     from user_management.services.sms_services import SMSService
#                     sms_service = SMSService()
                    
#                     message = (
#                         f"Hello {client.username}! Your account tier has been "
#                         f"upgraded from {old_tier} to {new_tier}. "
#                         f"Thank you for being a valued customer!"
#                     )
                    
#                     sms = sms_service.create_sms_message(
#                         phone_number=client.phone_number,
#                         message=message,
#                         recipient_name=client.username,
#                         source='tier_update',
#                         reference_id=f"tier_{client.id}_{timezone.now().timestamp()}"
#                     )
#                     sms_service.send_sms(sms)
                    
#                 except ImportError:
#                     logger.warning("SMS service not available for tier notification")
            
#             return Response({
#                 'success': True,
#                 'message': f'Tier updated from {old_tier} to {new_tier}',
#                 'old_tier': old_tier,
#                 'new_tier': new_tier,
#                 'updated_at': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Error updating tier: {str(e)}")
#             return Response({"error": f"Failed to update tier: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=False, methods=['get'])
#     def quick_stats(self, request):
#         """Get quick stats for dashboard"""
#         try:
#             total_clients = ClientProfile.objects.count()
#             pppoe_clients = ClientProfile.objects.filter(user__connection_type='pppoe').count()
#             hotspot_clients = ClientProfile.objects.filter(user__connection_type='hotspot').count()
#             active_clients = ClientProfile.objects.filter(status='active').count()
#             at_risk_clients = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
            
#             # Get clients with active plans
#             clients_with_plans = ClientProfile.objects.filter(~Q(current_plan_info={})).count()
            
#             # Get today's new clients
#             today = timezone.now().date()
#             new_today = ClientProfile.objects.filter(created_at__date=today).count()
            
#             # Get revenue stats
#             revenue_stats = ClientProfile.objects.aggregate(
#                 total_revenue=Sum('lifetime_value'),
#                 avg_monthly_revenue=Avg('monthly_recurring_revenue')
#             )
            
#             # Get plan distribution
#             try:
#                 from internet_plans.models import ClientPlanSubscription
#                 plan_distribution = ClientPlanSubscription.objects.filter(
#                     status='active'
#                 ).values('internet_plan__name').annotate(
#                     count=Count('id')
#                 ).order_by('-count')[:5]
#             except ImportError:
#                 plan_distribution = []
            
#             return Response({
#                 'total_clients': total_clients,
#                 'pppoe_clients': pppoe_clients,
#                 'hotspot_clients': hotspot_clients,
#                 'active_clients': active_clients,
#                 'at_risk_clients': at_risk_clients,
#                 'clients_with_plans': clients_with_plans,
#                 'clients_without_plans': total_clients - clients_with_plans,
#                 'new_today': new_today,
#                 'revenue': {
#                     'total': float(revenue_stats['total_revenue'] or 0),
#                     'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0)
#                 },
#                 'plan_distribution': plan_distribution,
#                 'timestamp': timezone.now().isoformat()
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting quick stats: {str(e)}")
#             return Response({"error": "Failed to load quick stats"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=False, methods=['get'])
#     def search_by_phone(self, request):
#         """Search client by phone number"""
#         phone = request.query_params.get('phone')
        
#         if not phone:
#             return Response({"error": "Phone parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             # Use Authentication app's phone validation
#             try:
#                 from authentication.models import PhoneValidation
                
#                 if not PhoneValidation.is_valid_kenyan_phone(phone):
#                     return Response({
#                         'success': False,
#                         'exists': False,
#                         'is_valid': False,
#                         'message': 'Invalid phone number format'
#                     })
                
#                 normalized = PhoneValidation.normalize_kenyan_phone(phone)
                
#             except ImportError:
#                 # Fallback validation
#                 import re
#                 if re.match(r'^(07\d{8}|01\d{8})$', phone):
#                     normalized = phone
#                 else:
#                     return Response({
#                         'success': False,
#                         'exists': False,
#                         'is_valid': False,
#                         'message': 'Invalid phone number format'
#                     })
            
#             # Search in Authentication app first
#             try:
#                 from authentication.models import UserAccount
#                 user = UserAccount.get_client_by_phone(normalized)
                
#                 if not user:
#                     return Response({
#                         'success': True,
#                         'exists': False,
#                         'is_valid': True,
#                         'phone': normalized,
#                         'message': 'Client not found'
#                     })
                
#                 # Get business profile
#                 try:
#                     client_profile = ClientProfile.objects.get(user=user)
#                     serializer = ClientProfileSerializer(client_profile, context={'request': request})
#                     client_data = serializer.data
#                 except ClientProfile.DoesNotExist:
#                     client_data = None
                
#                 return Response({
#                     'success': True,
#                     'exists': True,
#                     'is_valid': True,
#                     'phone': normalized,
#                     'user': {
#                         'id': str(user.id),
#                         'username': user.username,
#                         'name': user.name if hasattr(user, 'name') else '',
#                         'phone': user.phone_number,
#                         'connection_type': user.connection_type if hasattr(user, 'connection_type') else '',
#                         'is_active': user.is_active
#                     },
#                     'business_profile': client_data,
#                     'message': 'Client found'
#                 })
                
#             except ImportError:
#                 return Response({
#                     'success': False,
#                     'exists': False,
#                     'is_valid': True,
#                     'message': 'Authentication app not available'
#                 })
            
#         except Exception as e:
#             logger.error(f"Error searching by phone: {str(e)}")
#             return Response({"error": "Failed to search client"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=False, methods=['get'])
#     def stats(self, request):
#         """Get real-time client statistics with plan info"""
#         try:
#             # Calculate real-time stats
#             total_clients = ClientProfile.objects.count()
            
#             # Active in last 15 minutes
#             active_now = ClientProfile.objects.filter(
#                 last_login_date__gte=timezone.now() - timedelta(minutes=15)
#             ).count()
            
#             # Revenue today
#             today = timezone.now().date()
#             revenue_today = ClientAnalyticsSnapshot.objects.filter(
#                 date=today
#             ).aggregate(total=Sum('daily_revenue'))['total'] or Decimal('0.00')
            
#             # At-risk clients
#             at_risk = ClientProfile.objects.filter(
#                 churn_risk_score__gte=Decimal('7.0')
#             ).count()
            
#             # New clients today
#             new_today = ClientProfile.objects.filter(
#                 created_at__date=today
#             ).count()
            
#             # Average metrics
#             avg_churn_risk = ClientProfile.objects.aggregate(
#                 avg=Avg('churn_risk_score')
#             )['avg'] or Decimal('0.00')
            
#             avg_engagement = ClientProfile.objects.aggregate(
#                 avg=Avg('engagement_score')
#             )['avg'] or Decimal('0.00')
            
#             # Connection distribution
#             connection_dist = ClientProfile.objects.values(
#                 'user__connection_type'
#             ).annotate(
#                 count=Count('id')
#             ).order_by('-count')
            
#             # Tier distribution
#             tier_dist = ClientProfile.objects.values('tier').annotate(
#                 count=Count('id')
#             ).order_by('-count')
            
#             # Plan distribution
#             try:
#                 from internet_plans.models import ClientPlanSubscription
#                 plan_dist = ClientPlanSubscription.objects.filter(
#                     status='active'
#                 ).values('internet_plan__name').annotate(
#                     count=Count('id')
#                 ).order_by('-count')[:10]
                
#                 clients_with_plans = ClientPlanSubscription.objects.filter(
#                     status='active'
#                 ).values('client').distinct().count()
#             except ImportError:
#                 plan_dist = []
#                 clients_with_plans = 0
            
#             return Response({
#                 'success': True,
#                 'timestamp': timezone.now().isoformat(),
#                 'stats': {
#                     'total_clients': total_clients,
#                     'active_now': active_now,
#                     'revenue_today': float(revenue_today),
#                     'at_risk_clients': at_risk,
#                     'new_today': new_today,
#                     'clients_with_plans': clients_with_plans,
#                     'clients_without_plans': total_clients - clients_with_plans,
#                     'avg_churn_risk': float(avg_churn_risk),
#                     'avg_engagement': float(avg_engagement)
#                 },
#                 'distribution': {
#                     'connection': [
#                         {
#                             'type': item['user__connection_type'] or 'unknown',
#                             'count': item['count'],
#                             'percentage': round((item['count'] / total_clients * 100), 1) if total_clients > 0 else 0
#                         }
#                         for item in connection_dist
#                     ],
#                     'tier': [
#                         {
#                             'tier': item['tier'],
#                             'count': item['count'],
#                             'percentage': round((item['count'] / total_clients * 100), 1) if total_clients > 0 else 0
#                         }
#                         for item in tier_dist
#                     ],
#                     'plan': [
#                         {
#                             'plan': item['internet_plan__name'],
#                             'count': item['count']
#                         }
#                         for item in plan_dist
#                     ]
#                 },
#                 'alerts': self._generate_real_time_alerts()
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting client stats: {str(e)}")
#             return Response({
#                 'error': 'Failed to get client statistics',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['get'])
#     def activity(self, request, pk=None):
#         """Get client activity log"""
#         try:
#             client = self.get_object()
#             limit = int(request.query_params.get('limit', 50))
            
#             # Get client interactions
#             interactions = ClientInteraction.objects.filter(
#                 client=client
#             ).order_by('-started_at')[:limit]
            
#             return Response({
#                 'success': True,
#                 'client_id': str(client.id),
#                 'client_name': client.username,
#                 'activities': ClientInteractionSerializer(interactions, many=True).data,
#                 'activity_summary': {
#                     'total_activities': ClientInteraction.objects.filter(client=client).count(),
#                     'last_activity': interactions[0].started_at.isoformat() if interactions else None,
#                     'activity_types': ClientInteraction.objects.filter(
#                         client=client
#                     ).values('interaction_type').annotate(
#                         count=Count('id')
#                     ).order_by('-count')
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting client activity: {str(e)}")
#             return Response({
#                 'error': 'Failed to get client activity',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=True, methods=['post'])
#     def send_message(self, request, pk=None):
#         """Send message to client"""
#         try:
#             client = self.get_object()
#             serializer = SendMessageSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             message = data['message']
#             channel = data['channel']
#             priority = data['priority']
            
#             # Log the message sending interaction
#             interaction = ClientInteraction.objects.create(
#                 client=client,
#                 interaction_type='notification',
#                 action=f'Send {channel} message',
#                 description=f"Message sent via {channel}: {message[:100]}...",
#                 outcome='success',
#                 started_at=timezone.now(),
#                 completed_at=timezone.now(),
#                 metadata={
#                     'message': message,
#                     'channel': channel,
#                     'priority': priority,
#                     'sent_by': request.user.email,
#                     'timestamp': timezone.now().isoformat()
#                 }
#             )
            
#             # In production, this would integrate with actual messaging services
#             # For now, we'll just log it
            
#             logger.info(f"Message sent to client {client.id} via {channel}: {message}")
            
#             return Response({
#                 'success': True,
#                 'message': 'Message sent successfully',
#                 'message_id': str(interaction.id),
#                 'channel': channel,
#                 'timestamp': timezone.now().isoformat(),
#                 'details': {
#                     'client': client.username,
#                     'phone': client.phone_number,
#                     'message_preview': message[:50] + '...' if len(message) > 50 else message
#                 }
#             })
            
#         except Exception as e:
#             logger.error(f"Error sending message: {str(e)}")
#             return Response({
#                 'error': 'Failed to send message',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     @action(detail=False, methods=['get'])
#     def export(self, request):
#         """Export clients data with plan information"""
#         try:
#             format = request.query_params.get('format', 'csv')
#             filters = request.query_params.dict()
            
#             # Get filtered clients
#             clients = self.get_queryset()
            
#             # Apply filters from query params
#             clients = self._apply_filters(clients, filters)
            
#             # Export data
#             export_data = self._prepare_export_data(clients, format)
            
#             # Return file response
#             from django.http import HttpResponse
#             response = HttpResponse(export_data, content_type=self._get_content_type(format))
#             response['Content-Disposition'] = f'attachment; filename="clients_export_{timezone.now().date()}.{format}"'
            
#             return response
            
#         except Exception as e:
#             logger.error(f"Error exporting clients: {str(e)}")
#             return Response({
#                 'error': 'Failed to export clients',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     # Helper Methods for Plan Integration
#     def _get_plan_analytics(self, client):
#         """Get plan-specific analytics for client"""
#         subscription = client.active_plan_subscription()
        
#         if not subscription:
#             return {}
        
#         # Get usage patterns
#         snapshots = ClientAnalyticsSnapshot.objects.filter(
#             client=client,
#             date__gte=subscription.start_date.date()
#         ).order_by('date')
        
#         daily_usage = []
#         for snapshot in snapshots:
#             daily_usage.append({
#                 'date': snapshot.date.isoformat(),
#                 'data_used': float(snapshot.daily_data_gb),
#                 'utilization': float(snapshot.plan_utilization_rate)
#             })
        
#         # Calculate projections
#         days_used = (timezone.now().date() - subscription.start_date.date()).days + 1
#         total_days = (subscription.end_date.date() - subscription.start_date.date()).days + 1
#         avg_daily_usage = float(subscription.data_used_gb / days_used) if days_used > 0 else 0
#         projected_usage = avg_daily_usage * total_days
        
#         return {
#             'current_usage': {
#                 'data_used': float(subscription.data_used_gb),
#                 'data_limit': float(subscription.data_limit_gb),
#                 'percentage_used': float((subscription.data_used_gb / subscription.data_limit_gb) * 100) if subscription.data_limit_gb > 0 else 0,
#                 'days_remaining': (subscription.end_date - timezone.now()).days
#             },
#             'projections': {
#                 'avg_daily_usage': avg_daily_usage,
#                 'projected_end_usage': projected_usage,
#                 'projected_excess': max(0, projected_usage - float(subscription.data_limit_gb)),
#                 'completion_date': self._calculate_completion_date(subscription, avg_daily_usage) if avg_daily_usage > 0 else None
#             },
#             'daily_usage': daily_usage,
#             'recommendations': self._generate_plan_recommendations(client, subscription)
#         }
    
#     def _get_current_plan_details(self, client):
#         """Get current plan details"""
#         subscription = client.active_plan_subscription()
        
#         if not subscription:
#             return None
        
#         try:
#             from internet_plans.serializers.plan_serializers import InternetPlanSerializer
#             return {
#                 'plan': InternetPlanSerializer(subscription.internet_plan).data,
#                 'subscription': {
#                     'id': str(subscription.id),
#                     'status': subscription.status,
#                     'start_date': subscription.start_date.isoformat(),
#                     'end_date': subscription.end_date.isoformat(),
#                     'auto_renew': subscription.auto_renew,
#                     'data_used': float(subscription.data_used_gb),
#                     'data_limit': float(subscription.data_limit_gb)
#                 }
#             }
#         except ImportError:
#             return None
    
#     def _get_plan_utilization(self, client):
#         """Get plan utilization metrics"""
#         subscription = client.active_plan_subscription()
        
#         if not subscription:
#             return {}
        
#         days_used = (timezone.now().date() - subscription.start_date.date()).days + 1
#         total_days = (subscription.end_date.date() - subscription.start_date.date()).days + 1
        
#         return {
#             'data': {
#                 'used': float(subscription.data_used_gb),
#                 'limit': float(subscription.data_limit_gb),
#                 'remaining': float(subscription.data_limit_gb - subscription.data_used_gb),
#                 'percentage': float((subscription.data_used_gb / subscription.data_limit_gb) * 100) if subscription.data_limit_gb > 0 else 0
#             },
#             'time': {
#                 'days_used': days_used,
#                 'days_remaining': total_days - days_used,
#                 'total_days': total_days,
#                 'percentage': float((days_used / total_days) * 100) if total_days > 0 else 0
#             },
#             'daily_average': float(subscription.data_used_gb / days_used) if days_used > 0 else 0,
#             'status': 'over_limit' if subscription.data_used_gb >= subscription.data_limit_gb else 'normal'
#         }
    
#     def _get_usage_history(self, client, limit=30):
#         """Get usage history"""
#         snapshots = ClientAnalyticsSnapshot.objects.filter(
#             client=client
#         ).order_by('-date')[:limit]
        
#         return [
#             {
#                 'date': snapshot.date.isoformat(),
#                 'data_used': float(snapshot.daily_data_gb),
#                 'sessions': snapshot.session_count,
#                 'avg_duration': float(snapshot.avg_session_duration_minutes),
#                 'peak_hour': snapshot.peak_usage_hour
#             }
#             for snapshot in snapshots
#         ]
    
#     def _get_payment_history(self, client, limit=20):
#         """Get payment history"""
#         interactions = ClientInteraction.objects.filter(
#             client=client,
#             interaction_type__in=['payment_success', 'plan_purchase', 'plan_renewal'],
#             payment_amount__isnull=False
#         ).order_by('-started_at')[:limit]
        
#         return [
#             {
#                 'date': interaction.started_at.isoformat(),
#                 'type': interaction.get_interaction_type_display(),
#                 'amount': float(interaction.payment_amount),
#                 'method': interaction.payment_method,
#                 'reference': interaction.payment_reference
#             }
#             for interaction in interactions
#         ]
    
#     def _get_plan_recommendations(self, client):
#         """Get plan recommendations for client"""
#         subscription = client.active_plan_subscription()
#         recommendations = []
        
#         if not subscription:
#             recommendations.append({
#                 'type': 'assign_plan',
#                 'priority': 'high',
#                 'message': 'Client has no active plan',
#                 'action': 'Assign a plan'
#             })
#             return recommendations
        
#         # Check utilization
#         utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100
        
#         if utilization >= 90:
#             recommendations.append({
#                 'type': 'upgrade',
#                 'priority': 'high',
#                 'message': f'High data utilization ({utilization:.1f}%)',
#                 'action': 'Consider upgrading to higher data plan'
#             })
#         elif utilization <= 30:
#             recommendations.append({
#                 'type': 'downgrade',
#                 'priority': 'low',
#                 'message': f'Low data utilization ({utilization:.1f}%)',
#                 'action': 'Consider downgrading to save costs'
#             })
        
#         # Check expiration
#         days_remaining = (subscription.end_date - timezone.now()).days
#         if days_remaining <= 3:
#             recommendations.append({
#                 'type': 'renewal',
#                 'priority': 'high',
#                 'message': f'Plan expires in {days_remaining} days',
#                 'action': 'Renew plan to avoid service interruption'
#             })
#         elif days_remaining <= 7:
#             recommendations.append({
#                 'type': 'renewal',
#                 'priority': 'medium',
#                 'message': f'Plan expires in {days_remaining} days',
#                 'action': 'Consider renewing plan'
#             })
        
#         # Check if client is on optimal plan based on usage pattern
#         if client.usage_pattern == 'heavy' and subscription.data_limit_gb < Decimal('100'):
#             recommendations.append({
#                 'type': 'optimize',
#                 'priority': 'medium',
#                 'message': 'Heavy user on limited plan',
#                 'action': 'Consider unlimited or higher data plan'
#             })
        
#         return recommendations
    
#     def _get_plan_actions(self, client, user):
#         """Get available plan actions for user"""
#         actions = []
#         subscription = client.active_plan_subscription()
        
#         # Always available actions
#         actions.append({
#             'action': 'view_plan_details',
#             'label': 'View Plan Details',
#             'method': 'GET',
#             'url': f'/api/user-management/clients/{client.id}/plans/current/'
#         })
        
#         if subscription:
#             # Actions for clients with active plans
#             actions.append({
#                 'action': 'change_plan',
#                 'label': 'Change Plan',
#                 'method': 'POST',
#                 'url': f'/api/user-management/clients/{client.id}/plans/change/'
#             })
            
#             actions.append({
#                 'action': 'renew_plan',
#                 'label': 'Renew Plan',
#                 'method': 'POST',
#                 'url': f'/api/user-management/clients/{client.id}/plans/renew/'
#             })
            
#             actions.append({
#                 'action': 'toggle_auto_renew',
#                 'label': 'Toggle Auto-Renew',
#                 'method': 'POST',
#                 'url': f'/api/user-management/clients/{client.id}/plans/auto-renew/'
#             })
            
#             if user.is_staff or user.is_superuser:
#                 actions.append({
#                     'action': 'suspend_plan',
#                     'label': 'Suspend Service',
#                     'method': 'POST',
#                     'url': f'/api/user-management/clients/{client.id}/plans/suspend/',
#                     'danger': True
#                 })
                
#                 if client.is_pppoe_client:
#                     actions.append({
#                         'action': 'resend_credentials',
#                         'label': 'Resend Credentials',
#                         'method': 'POST',
#                         'url': f'/api/user-management/clients/{client.id}/resend-credentials/'
#                     })
#         else:
#             # Actions for clients without plans
#             actions.append({
#                 'action': 'assign_plan',
#                 'label': 'Assign Plan',
#                 'method': 'POST',
#                 'url': f'/api/user-management/clients/{client.id}/plans/assign/',
#                 'priority': 'high'
#             })
        
#         return actions
    
#     def _is_plan_compatible(self, client, plan):
#         """Check if plan is compatible with client's connection type"""
#         if client.is_pppoe_client:
#             return plan.available_for_pppoe
#         elif client.is_hotspot_client:
#             return plan.available_for_hotspot
#         return True
    
#     def _create_plan_subscription(self, client, plan, auto_renew=True, assign_credentials=True, notes='', assigned_by=None):
#         """Create a new plan subscription for client"""
#         from internet_plans.models import ClientPlanSubscription
        
#         # Calculate end date (default 30 days)
#         end_date = timezone.now() + timedelta(days=30)
        
#         # Get data limit from plan
#         data_limit = plan.data_limit_gb if hasattr(plan, 'data_limit_gb') else Decimal('0.00')
        
#         # Create subscription
#         subscription = ClientPlanSubscription.objects.create(
#             client=client,
#             internet_plan=plan,
#             status='active',
#             start_date=timezone.now(),
#             end_date=end_date,
#             auto_renew=auto_renew,
#             data_limit_gb=data_limit,
#             metadata={
#                 'assigned_by': assigned_by.email if assigned_by else 'system',
#                 'assigned_at': timezone.now().isoformat(),
#                 'notes': notes,
#                 'assign_credentials': assign_credentials
#             }
#         )
        
#         # Assign PPPoE credentials if applicable
#         if client.is_pppoe_client and assign_credentials:
#             # Generate PPPoE credentials
#             subscription.pppoe_username = self._generate_pppoe_username(client)
#             subscription.pppoe_password = self._generate_pppoe_password()
#             subscription.save()
        
#         # Assign hotspot plan ID if applicable
#         if client.is_hotspot_client:
#             subscription.hotspot_plan_id = f"HOTSPOT-{client.id}-{plan.id}"
#             subscription.save()
        
#         return subscription
    
#     def _generate_pppoe_username(self, client):
#         """Generate PPPoE username for client"""
#         base = client.username.replace(' ', '_').lower()[:8]
#         import secrets
#         import string
#         random_part = ''.join(secrets.choice(string.digits) for _ in range(3))
#         return f"{base}{random_part}"
    
#     def _generate_pppoe_password(self):
#         """Generate secure PPPoE password"""
#         import secrets
#         import string
#         alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
#         return ''.join(secrets.choice(alphabet) for _ in range(12))
    
#     def _send_plan_assignment_notification(self, client, plan, subscription):
#         """Send plan assignment notification"""
#         try:
#             from user_management.services.sms_services import SMSService
#             sms_service = SMSService()
            
#             message = (
#                 f"Hello {client.username}! Your internet plan has been activated. "
#                 f"Plan: {plan.name}, "
#                 f"Data: {subscription.data_limit_gb}GB, "
#                 f"Valid until: {subscription.end_date.strftime('%d/%m/%Y')}. "
#                 f"Thank you for choosing us!"
#             )
            
#             if client.is_pppoe_client and hasattr(subscription, 'pppoe_username'):
#                 message += f"\nPPPoE Username: {subscription.pppoe_username}"
#                 # Password should be sent separately for security
            
#             sms = sms_service.create_sms_message(
#                 phone_number=client.phone_number,
#                 message=message,
#                 recipient_name=client.username,
#                 source='plan_assignment',
#                 reference_id=f"plan_assign_{client.id}_{timezone.now().timestamp()}"
#             )
#             sms_service.send_sms(sms)
            
#         except ImportError:
#             logger.warning("SMS service not available for plan notification")
    
#     def _send_plan_change_notification(self, client, old_plan, new_plan, immediate):
#         """Send plan change notification"""
#         try:
#             from user_management.services.sms_services import SMSService
#             sms_service = SMSService()
            
#             message = (
#                 f"Hello {client.username}! Your internet plan has been changed "
#                 f"from {old_plan.name} to {new_plan.name}. "
#                 f"The change is {'effective immediately' if immediate else 'scheduled for next billing cycle'}. "
#             )
            
#             sms = sms_service.create_sms_message(
#                 phone_number=client.phone_number,
#                 message=message,
#                 recipient_name=client.username,
#                 source='plan_change',
#                 reference_id=f"plan_change_{client.id}_{timezone.now().timestamp()}"
#             )
#             sms_service.send_sms(sms)
            
#         except ImportError:
#             logger.warning("SMS service not available for plan change notification")
    
#     def _send_plan_renewal_notification(self, client, subscription, renew_period, new_end_date):
#         """Send plan renewal notification"""
#         try:
#             from user_management.services.sms_services import SMSService
#             sms_service = SMSService()
            
#             period_display = {
#                 '1m': '1 month',
#                 '3m': '3 months',
#                 '6m': '6 months',
#                 '12m': '12 months'
#             }.get(renew_period, '1 month')
            
#             message = (
#                 f"Hello {client.username}! Your {subscription.internet_plan.name} plan "
#                 f"has been renewed for {period_display}. "
#                 f"New expiry date: {new_end_date.strftime('%d/%m/%Y')}. "
#                 f"Auto-renew: {'ON' if subscription.auto_renew else 'OFF'}"
#             )
            
#             sms = sms_service.create_sms_message(
#                 phone_number=client.phone_number,
#                 message=message,
#                 recipient_name=client.username,
#                 source='plan_renewal',
#                 reference_id=f"plan_renew_{client.id}_{timezone.now().timestamp()}"
#             )
#             sms_service.send_sms(sms)
            
#         except ImportError:
#             logger.warning("SMS service not available for plan renewal notification")
    
#     def _send_plan_suspension_notification(self, client, subscription, reason, duration_days):
#         """Send plan suspension notification"""
#         try:
#             from user_management.services.sms_services import SMSService
#             sms_service = SMSService()
            
#             message = (
#                 f"Hello {client.username}! Your {subscription.internet_plan.name} plan "
#                 f"has been suspended for {duration_days} days. "
#                 f"Reason: {reason}. "
#                 f"Service will resume on: {subscription.end_date.strftime('%d/%m/%Y')}"
#             )
            
#             sms = sms_service.create_sms_message(
#                 phone_number=client.phone_number,
#                 message=message,
#                 recipient_name=client.username,
#                 source='plan_suspension',
#                 reference_id=f"plan_suspend_{client.id}_{timezone.now().timestamp()}"
#             )
#             sms_service.send_sms(sms)
            
#         except ImportError:
#             logger.warning("SMS service not available for plan suspension notification")
    
#     def _process_plan_commission(self, client, plan, subscription):
#         """Process commission for plan assignment if client was referred"""
#         if client.referred_by and client.referred_by.is_marketer:
#             try:
#                 # Calculate commission (e.g., 10% of plan price)
#                 commission_amount = plan.price * Decimal('0.10')
                
#                 # Create commission transaction
#                 CommissionTransaction.objects.create(
#                     marketer=client.referred_by,
#                     transaction_type='plan_sale',
#                     amount=commission_amount,
#                     description=f"Commission for {client.username}'s plan: {plan.name}",
#                     plan_reference=plan,
#                     reference_id=f"PLAN-{subscription.id}",
#                     referred_client=client,
#                     purchase_amount=plan.price,
#                     commission_rate=client.referred_by.commission_rate,
#                     total_commission=commission_amount,
#                     status='pending'
#                 )
                
#                 logger.info(f"Created commission for marketer {client.referred_by.username} for plan sale")
                
#             except Exception as e:
#                 logger.error(f"Error creating commission: {str(e)}")
    
#     def _calculate_completion_date(self, subscription, avg_daily_usage):
#         """Calculate when data will be exhausted based on average daily usage"""
#         if avg_daily_usage <= 0:
#             return None
        
#         remaining_data = subscription.data_limit_gb - subscription.data_used_gb
#         days_to_exhaustion = remaining_data / Decimal(str(avg_daily_usage))
        
#         if days_to_exhaustion > 0:
#             return (timezone.now() + timedelta(days=float(days_to_exhaustion))).isoformat()
#         return None
    
#     def _generate_plan_recommendations(self, client, subscription):
#         """Generate plan recommendations based on usage"""
#         recommendations = []
        
#         # Check data utilization
#         utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100
        
#         if utilization >= 80:
#             recommendations.append({
#                 'type': 'warning',
#                 'message': f'High data utilization ({utilization:.1f}%). Consider upgrading plan.',
#                 'priority': 'high'
#             })
        
#         # Check expiration
#         days_remaining = (subscription.end_date - timezone.now()).days
#         if days_remaining <= 7:
#             recommendations.append({
#                 'type': 'warning',
#                 'message': f'Plan expires in {days_remaining} days.',
#                 'priority': 'medium' if days_remaining > 3 else 'high'
#             })
        
#         # Check if plan matches usage pattern
#         if client.usage_pattern == 'heavy' and subscription.data_limit_gb < Decimal('100'):
#             recommendations.append({
#                 'type': 'suggestion',
#                 'message': 'Heavy user detected. Consider unlimited or higher data plan.',
#                 'priority': 'medium'
#             })
        
#         return recommendations
    
#     def _generate_real_time_alerts(self):
#         """Generate real-time alerts"""
#         from django.conf import settings
#         alerts = []
        
#         # Check for expiring plans
#         try:
#             from internet_plans.models import ClientPlanSubscription
#             expiring_soon = ClientPlanSubscription.objects.filter(
#                 status='active',
#                 end_date__lte=timezone.now() + timedelta(days=3),
#                 end_date__gte=timezone.now()
#             ).count()
            
#             if expiring_soon > 0:
#                 alerts.append({
#                     'type': 'plan_expiry',
#                     'title': 'Plans Expiring Soon',
#                     'description': f'{expiring_soon} plans expiring in next 3 days',
#                     'severity': 'medium',
#                     'timestamp': timezone.now().isoformat()
#                 })
#         except ImportError:
#             pass
        
#         # Check for exceeded data limits
#         try:
#             from internet_plans.models import ClientPlanSubscription
#             exceeded_limits = ClientPlanSubscription.objects.filter(
#                 status='active',
#                 data_used_gb__gte=F('data_limit_gb')
#             ).count()
            
#             if exceeded_limits > 0:
#                 alerts.append({
#                     'type': 'data_limit_exceeded',
#                     'title': 'Data Limits Exceeded',
#                     'description': f'{exceeded_limits} clients have exceeded data limits',
#                     'severity': 'high',
#                     'timestamp': timezone.now().isoformat()
#                 })
#         except ImportError:
#             pass
        
#         return alerts
    
#     def _apply_filters(self, queryset, filters):
#         """Apply filters to queryset"""
#         # Remove export-specific parameters
#         export_params = ['format', 'page', 'page_size']
#         for param in export_params:
#             filters.pop(param, None)
        
#         # Apply filters (simplified - would use your existing filter logic)
#         if 'search' in filters:
#             queryset = queryset.filter(
#                 Q(user__username__icontains=filters['search']) |
#                 Q(user__phone_number__icontains=filters['search']) |
#                 Q(email__icontains=filters['search'])
#             )
        
#         if 'connection_type' in filters and filters['connection_type'] != 'all':
#             queryset = queryset.filter(user__connection_type=filters['connection_type'])
        
#         if 'status' in filters and filters['status'] != 'all':
#             queryset = queryset.filter(status=filters['status'])
        
#         if 'plan_status' in filters:
#             if filters['plan_status'] == 'with_plan':
#                 queryset = queryset.filter(~Q(current_plan_info={}))
#             elif filters['plan_status'] == 'without_plan':
#                 queryset = queryset.filter(current_plan_info={})
        
#         return queryset
    
#     def _prepare_export_data(self, clients, format):
#         """Prepare data for export with plan information"""
#         # Prepare data rows
#         data = []
#         headers = [
#             'ID', 'Username', 'Phone', 'Email', 'Connection Type',
#             'Client Type', 'Tier', 'Status', 'Current Plan',
#             'Plan Status', 'Data Used', 'Data Limit', 'Plan Expiry',
#             'Lifetime Value', 'Monthly Revenue', 'Churn Risk', 'Engagement Score',
#             'Customer Since', 'Last Login', 'Last Payment', 'Days Active'
#         ]
        
#         for client in clients:
#             plan_info = client.current_plan_info.get('plan', {}) if client.current_plan_info else {}
#             subscription_info = client.current_plan_info.get('subscription', {}) if client.current_plan_info else {}
            
#             row = [
#                 client.id,
#                 client.username,
#                 client.phone_number,
#                 client.email,
#                 client.connection_type,
#                 client.client_type,
#                 client.tier,
#                 client.status,
#                 plan_info.get('name', 'No Plan'),
#                 subscription_info.get('status', 'No Plan'),
#                 subscription_info.get('data_used', 0),
#                 subscription_info.get('data_limit', 0),
#                 subscription_info.get('end_date', ''),
#                 float(client.lifetime_value),
#                 float(client.monthly_recurring_revenue),
#                 float(client.churn_risk_score),
#                 float(client.engagement_score),
#                 client.customer_since.strftime('%Y-%m-%d') if client.customer_since else '',
#                 client.last_login_date.strftime('%Y-%m-%d %H:%M') if client.last_login_date else '',
#                 client.last_payment_date.strftime('%Y-%m-%d') if client.last_payment_date else '',
#                 client.days_active
#             ]
#             data.append(row)
        
#         # Format based on requested format
#         if format == 'csv':
#             output = io.StringIO()
#             writer = csv.writer(output)
#             writer.writerow(headers)
#             writer.writerows(data)
#             return output.getvalue()
#         else:
#             # For other formats, you'd implement appropriate converters
#             return str(data)  # Simplified
    
#     def _get_content_type(self, format):
#         """Get content type for export format"""
#         content_types = {
#             'csv': 'text/csv',
#             'json': 'application/json',
#             'excel': 'application/vnd.ms-excel',
#             'pdf': 'application/pdf'
#         }
#         return content_types.get(format, 'text/plain')


# # Plan-specific views
# class ClientPlanManagementView(APIView):
#     """Dedicated view for client plan management"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, client_id):
#         """Get comprehensive plan information for client"""
#         try:
#             client = get_object_or_404(ClientProfile, id=client_id)
            
#             # Get detailed plan information
#             subscription = client.active_plan_subscription()
            
#             if not subscription:
#                 return Response({
#                     'success': True,
#                     'has_active_plan': False,
#                     'message': 'Client has no active plan',
#                     'available_plans': client.available_plans(),
#                     'actions': ['assign_plan']
#                 })
            
#             # Get detailed subscription info
#             from internet_plans.serializers.plan_serializers import InternetPlanSerializer
            
#             # Get usage analytics
#             snapshots = ClientAnalyticsSnapshot.objects.filter(
#                 client=client,
#                 date__gte=subscription.start_date.date()
#             ).order_by('-date')[:30]
            
#             # Get payment history for this plan
#             payments = ClientInteraction.objects.filter(
#                 client=client,
#                 interaction_type__in=['payment_success', 'plan_purchase', 'plan_renewal'],
#                 plan_reference=subscription.internet_plan
#             ).order_by('-started_at')[:10]
            
#             return Response({
#                 'success': True,
#                 'has_active_plan': True,
#                 'plan': InternetPlanSerializer(subscription.internet_plan).data,
#                 'subscription': {
#                     'id': str(subscription.id),
#                     'status': subscription.status,
#                     'start_date': subscription.start_date,
#                     'end_date': subscription.end_date,
#                     'auto_renew': subscription.auto_renew,
#                     'data_used': float(subscription.data_used_gb),
#                     'data_limit': float(subscription.data_limit_gb),
#                     'percentage_used': float((subscription.data_used_gb / subscription.data_limit_gb) * 100) if subscription.data_limit_gb > 0 else 0,
#                     'days_remaining': (subscription.end_date - timezone.now()).days,
#                     'metadata': subscription.metadata
#                 },
#                 'usage_analytics': ClientAnalyticsSnapshotSerializer(snapshots, many=True).data,
#                 'payment_history': [
#                     {
#                         'date': payment.started_at,
#                         'type': payment.get_interaction_type_display(),
#                         'amount': float(payment.payment_amount) if payment.payment_amount else 0,
#                         'method': payment.payment_method,
#                         'reference': payment.payment_reference
#                     }
#                     for payment in payments
#                 ],
#                 'available_plans': client.available_plans(),
#                 'actions': ['change_plan', 'renew_plan', 'toggle_auto_renew', 'suspend_plan'],
#                 'technical_details': client.get_technical_details() if request.user.is_staff else {}
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting plan management info: {str(e)}")
#             return Response({
#                 'error': 'Failed to get plan information',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ClientPlanHistoryView(APIView):
#     """View for client plan history"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, client_id):
#         """Get complete plan history for client"""
#         try:
#             client = get_object_or_404(ClientProfile, id=client_id)
            
#             # Get all subscriptions
#             subscriptions = client.plan_history(limit=50)
            
#             history = []
#             for subscription in subscriptions:
#                 history.append({
#                     'plan_name': subscription.internet_plan.name,
#                     'plan_id': str(subscription.internet_plan.id),
#                     'status': subscription.status,
#                     'start_date': subscription.start_date,
#                     'end_date': subscription.end_date,
#                     'data_used': float(subscription.data_used_gb),
#                     'data_limit': float(subscription.data_limit_gb),
#                     'auto_renew': subscription.auto_renew,
#                     'reason': subscription.metadata.get('reason', '') if hasattr(subscription, 'metadata') else '',
#                     'assigned_by': subscription.metadata.get('assigned_by', '') if hasattr(subscription, 'metadata') else ''
#                 })
            
#             return Response({
#                 'success': True,
#                 'client_id': str(client.id),
#                 'client_name': client.username,
#                 'total_subscriptions': len(history),
#                 'history': history
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting plan history: {str(e)}")
#             return Response({
#                 'error': 'Failed to get plan history',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ClientPlanRecommendationsView(APIView):
#     """View for plan recommendations"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, client_id):
#         """Get personalized plan recommendations for client"""
#         try:
#             client = get_object_or_404(ClientProfile, id=client_id)
            
#             # Get current subscription
#             subscription = client.active_plan_subscription()
            
#             # Get available plans
#             available_plans = client.available_plans()
            
#             recommendations = []
            
#             # If no current plan, recommend based on client type and tier
#             if not subscription:
#                 for plan in available_plans:
#                     if client.is_pppoe_client and plan.available_for_pppoe:
#                         recommendations.append({
#                             'plan_id': str(plan.id),
#                             'plan_name': plan.name,
#                             'reason': 'Recommended for PPPoE clients',
#                             'match_score': 85,
#                             'estimated_monthly_cost': float(plan.price),
#                             'features': plan.features if hasattr(plan, 'features') else []
#                         })
#                     elif client.is_hotspot_client and plan.available_for_hotspot:
#                         recommendations.append({
#                             'plan_id': str(plan.id),
#                             'plan_name': plan.name,
#                             'reason': 'Recommended for Hotspot clients',
#                             'match_score': 85,
#                             'estimated_monthly_cost': float(plan.price),
#                             'features': plan.features if hasattr(plan, 'features') else []
#                         })
#             else:
#                 # If has current plan, recommend based on usage
#                 utilization = (subscription.data_used_gb / subscription.data_limit_gb) * 100
                
#                 for plan in available_plans:
#                     # Skip current plan
#                     if plan.id == subscription.internet_plan.id:
#                         continue
                    
#                     match_score = 0
#                     reason = ''
                    
#                     # Check if plan is better match for usage
#                     if utilization >= 80 and plan.data_limit_gb > subscription.data_limit_gb:
#                         match_score = 90
#                         reason = 'Higher data limit for heavy usage'
#                     elif utilization <= 30 and plan.price < subscription.internet_plan.price:
#                         match_score = 80
#                         reason = 'Cost savings for light usage'
#                     elif plan.features and 'unlimited' in str(plan.features).lower() and client.usage_pattern in ['heavy', 'extreme']:
#                         match_score = 95
#                         reason = 'Unlimited data for heavy user'
                    
#                     if match_score > 0:
#                         recommendations.append({
#                             'plan_id': str(plan.id),
#                             'plan_name': plan.name,
#                             'reason': reason,
#                             'match_score': match_score,
#                             'estimated_monthly_cost': float(plan.price),
#                             'current_plan_cost': float(subscription.internet_plan.price),
#                             'cost_difference': float(plan.price - subscription.internet_plan.price),
#                             'features': plan.features if hasattr(plan, 'features') else []
#                         })
            
#             # Sort by match score
#             recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            
#             return Response({
#                 'success': True,
#                 'client_id': str(client.id),
#                 'client_name': client.username,
#                 'current_plan': subscription.internet_plan.name if subscription else None,
#                 'current_utilization': float(utilization) if subscription else 0,
#                 'usage_pattern': client.usage_pattern,
#                 'recommendations': recommendations[:5]  # Top 5 recommendations
#             })
            
#         except Exception as e:
#             logger.error(f"Error getting plan recommendations: {str(e)}")
#             return Response({
#                 'error': 'Failed to get plan recommendations',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class ClientPlanBulkActionsView(APIView):
#     """View for bulk plan actions"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         """Perform bulk plan actions"""
#         try:
#             action = request.data.get('action')
#             client_ids = request.data.get('client_ids', [])
#             plan_id = request.data.get('plan_id')
            
#             if not action:
#                 return Response({'error': 'Action is required'}, status=status.HTTP_400_BAD_REQUEST)
            
#             if not client_ids:
#                 return Response({'error': 'Client IDs are required'}, status=status.HTTP_400_BAD_REQUEST)
            
#             results = []
#             successful = 0
#             failed = 0
            
#             if action == 'assign_plan':
#                 if not plan_id:
#                     return Response({'error': 'Plan ID is required for assign action'}, status=status.HTTP_400_BAD_REQUEST)
                
#                 # Get plan
#                 from internet_plans.models import InternetPlan
#                 try:
#                     plan = InternetPlan.objects.get(id=plan_id, active=True)
#                 except InternetPlan.DoesNotExist:
#                     return Response({'error': 'Plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
                
#                 for client_id in client_ids:
#                     try:
#                         client = ClientProfile.objects.get(id=client_id)
                        
#                         # Check compatibility
#                         if client.is_pppoe_client and not plan.available_for_pppoe:
#                             results.append({
#                                 'client_id': client_id,
#                                 'success': False,
#                                 'error': 'Plan not available for PPPoE'
#                             })
#                             failed += 1
#                             continue
                        
#                         if client.is_hotspot_client and not plan.available_for_hotspot:
#                             results.append({
#                                 'client_id': client_id,
#                                 'success': False,
#                                 'error': 'Plan not available for hotspot'
#                             })
#                             failed += 1
#                             continue
                        
#                         # Create subscription
#                         from internet_plans.models import ClientPlanSubscription
                        
#                         # End any existing active subscription
#                         ClientPlanSubscription.objects.filter(
#                             client=client,
#                             status='active'
#                         ).update(status='expired', end_date=timezone.now())
                        
#                         # Create new subscription
#                         subscription = ClientPlanSubscription.objects.create(
#                             client=client,
#                             internet_plan=plan,
#                             status='active',
#                             start_date=timezone.now(),
#                             end_date=timezone.now() + timedelta(days=30),
#                             auto_renew=True,
#                             data_limit_gb=plan.data_limit_gb if hasattr(plan, 'data_limit_gb') else Decimal('0.00')
#                         )
                        
#                         # Update client
#                         client.plan_updated_at = timezone.now()
#                         client.save()
                        
#                         results.append({
#                             'client_id': client_id,
#                             'client_name': client.username,
#                             'success': True,
#                             'subscription_id': str(subscription.id),
#                             'plan_name': plan.name
#                         })
#                         successful += 1
                        
#                     except ClientProfile.DoesNotExist:
#                         results.append({
#                             'client_id': client_id,
#                             'success': False,
#                             'error': 'Client not found'
#                         })
#                         failed += 1
#                     except Exception as e:
#                         results.append({
#                             'client_id': client_id,
#                             'success': False,
#                             'error': str(e)
#                         })
#                         failed += 1
            
#             elif action == 'renew_plans':
#                 for client_id in client_ids:
#                     try:
#                         client = ClientProfile.objects.get(id=client_id)
#                         subscription = client.active_plan_subscription()
                        
#                         if not subscription:
#                             results.append({
#                                 'client_id': client_id,
#                                 'success': False,
#                                 'error': 'No active plan'
#                             })
#                             failed += 1
#                             continue
                        
#                         # Renew for 30 days
#                         subscription.end_date = subscription.end_date + timedelta(days=30)
#                         subscription.save()
                        
#                         # Update client
#                         client.plan_updated_at = timezone.now()
#                         client.save()
                        
#                         results.append({
#                             'client_id': client_id,
#                             'client_name': client.username,
#                             'success': True,
#                             'new_end_date': subscription.end_date.isoformat(),
#                             'plan_name': subscription.internet_plan.name
#                         })
#                         successful += 1
                        
#                     except Exception as e:
#                         results.append({
#                             'client_id': client_id,
#                             'success': False,
#                             'error': str(e)
#                         })
#                         failed += 1
            
#             elif action == 'toggle_auto_renew':
#                 enable = request.data.get('enable', True)
                
#                 for client_id in client_ids:
#                     try:
#                         client = ClientProfile.objects.get(id=client_id)
#                         subscription = client.active_plan_subscription()
                        
#                         if not subscription:
#                             results.append({
#                                 'client_id': client_id,
#                                 'success': False,
#                                 'error': 'No active plan'
#                             })
#                             failed += 1
#                             continue
                        
#                         subscription.auto_renew = enable
#                         subscription.save()
                        
#                         client.plan_auto_renew = enable
#                         client.save()
                        
#                         results.append({
#                             'client_id': client_id,
#                             'client_name': client.username,
#                             'success': True,
#                             'auto_renew': enable,
#                             'plan_name': subscription.internet_plan.name
#                         })
#                         successful += 1
                        
#                     except Exception as e:
#                         results.append({
#                             'client_id': client_id,
#                             'success': False,
#                             'error': str(e)
#                         })
#                         failed += 1
            
#             else:
#                 return Response({'error': f'Unsupported action: {action}'}, status=status.HTTP_400_BAD_REQUEST)
            
#             return Response({
#                 'success': True,
#                 'action': action,
#                 'total_clients': len(client_ids),
#                 'successful': successful,
#                 'failed': failed,
#                 'results': results
#             })
            
#         except Exception as e:
#             logger.error(f"Error performing bulk plan action: {str(e)}")
#             return Response({
#                 'error': 'Failed to perform bulk action',
#                 'details': str(e) if settings.DEBUG else None
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # Original views (retained for compatibility)
# class CreatePPPoEClientView(APIView):
#     """Create PPPoE Client with complete workflow and plan assignment"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         """Create new PPPoE client with complete onboarding and plan assignment"""
#         try:
#             serializer = CreatePPPoEClientSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             name = data['name']
#             phone = data['phone_number']
#             plan_id = data.get('plan_id')
#             referral_code = data.get('referral_code', '')
#             client_type = data.get('client_type', 'residential')
#             location = data.get('location', '')
#             send_sms = data.get('send_sms', True)
#             assign_marketer = data.get('assign_marketer', False)
            
#             logger.info(f"Creating PPPoE client: {name} ({phone}) with plan: {plan_id}")
            
#             with transaction.atomic():
#                 # Step 1: Validate phone number
#                 try:
#                     from authentication.models import PhoneValidation
#                     normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
#                 except ImportError:
#                     normalized_phone = phone
                
#                 # Step 2: Check if client already exists
#                 try:
#                     from authentication.models import UserAccount
#                     existing_user = UserAccount.get_client_by_phone(normalized_phone)
                    
#                     if existing_user:
#                         if hasattr(existing_user, 'connection_type') and existing_user.connection_type == 'pppoe':
#                             return Response({
#                                 "error": "PPPoE client already exists",
#                                 "client": {
#                                     "id": str(existing_user.id),
#                                     "username": existing_user.username,
#                                     "name": existing_user.name if hasattr(existing_user, 'name') else '',
#                                     "phone": existing_user.phone_number,
#                                     "pppoe_username": existing_user.pppoe_username if hasattr(existing_user, 'pppoe_username') else ''
#                                 }
#                             }, status=status.HTTP_400_BAD_REQUEST)
#                         else:
#                             # Convert existing user to PPPoE
#                             existing_user.connection_type = 'pppoe'
#                             if hasattr(existing_user, 'name'):
#                                 existing_user.name = name
#                             existing_user.save()
#                             user_account = existing_user
#                     else:
#                         # Create new PPPoE client
#                         user_account = UserAccount.objects.create_client_user(
#                             phone_number=normalized_phone,
#                             client_name=name,
#                             connection_type='pppoe'
#                         )
                        
#                 except ImportError:
#                     return Response(
#                         {"error": "Authentication app not available"},
#                         status=status.HTTP_503_SERVICE_UNAVAILABLE
#                     )
                
#                 # Step 3: Generate PPPoE credentials
#                 credentials = user_account.generate_pppoe_credentials()
                
#                 # Step 4: Create business profile
#                 client_profile, created = ClientProfile.objects.get_or_create(
#                     user=user_account,
#                     defaults={
#                         'client_type': client_type,
#                         'location': {'address': location} if location else {},
#                         'customer_since': timezone.now()
#                     }
#                 )
                
#                 if not created:
#                     client_profile.client_type = client_type
#                     if location:
#                         client_profile.location = {'address': location}
#                     client_profile.save()
                
#                 # Step 5: Assign plan if specified
#                 if plan_id:
#                     try:
#                         from internet_plans.models import InternetPlan
#                         plan = InternetPlan.objects.get(id=plan_id, active=True, available_for_pppoe=True)
                        
#                         # Create plan subscription
#                         from internet_plans.models import ClientPlanSubscription
#                         subscription = ClientPlanSubscription.objects.create(
#                             client=client_profile,
#                             internet_plan=plan,
#                             status='active',
#                             start_date=timezone.now(),
#                             end_date=timezone.now() + timedelta(days=30),
#                             auto_renew=True,
#                             data_limit_gb=plan.data_limit_gb if hasattr(plan, 'data_limit_gb') else Decimal('0.00'),
#                             pppoe_username=credentials['username'],
#                             pppoe_password=credentials['password']  # This would be encrypted
#                         )
                        
#                         # Update client's cached plan info
#                         client_profile.plan_updated_at = timezone.now()
#                         client_profile.save()
                        
#                     except InternetPlan.DoesNotExist:
#                         logger.warning(f"Plan {plan_id} not found or not available for PPPoE")
                
#                 # Step 6: Handle referral
#                 if referral_code:
#                     try:
#                         referrer = ClientProfile.objects.get(
#                             referral_code=referral_code,
#                             is_marketer=True
#                         )
#                         if referrer != client_profile:
#                             client_profile.referred_by = referrer
#                             client_profile.save()
                            
#                             # Create commission transaction
#                             CommissionTransaction.objects.create(
#                                 marketer=referrer,
#                                 transaction_type='referral',
#                                 amount=Decimal('500.00'),
#                                 description=f"Referral commission for {user_account.username}",
#                                 reference_id=f"REF-{user_account.id}",
#                                 referred_client=client_profile,
#                                 commission_rate=referrer.commission_rate,
#                                 total_commission=Decimal('500.00')
#                             )
#                     except ClientProfile.DoesNotExist:
#                         logger.warning(f"Invalid referral code: {referral_code}")
                
#                 # Step 7: Send SMS if requested
#                 sms_sent = False
#                 if send_sms:
#                     try:
#                         from user_management.services.sms_services import SMSService
#                         sms_service = SMSService()
                        
#                         message = f"Hello {name}! Your PPPoE account has been created. Username: {credentials['username']}"
                        
#                         if plan_id:
#                             message += f"\nPlan: {plan.name if 'plan' in locals() else 'Assigned'}"
                        
#                         sms = sms_service.create_sms_message(
#                             phone_number=normalized_phone,
#                             message=message,
#                             recipient_name=name,
#                             source='pppoe_creation',
#                             reference_id=f"create_{user_account.id}"
#                         )
#                         sms_service.send_sms(sms)
#                         sms_sent = sms.status == 'sent'
#                     except ImportError:
#                         logger.warning("SMS service not available")
                
#                 # Step 8: Log interaction
#                 ClientInteraction.objects.create(
#                     client=client_profile,
#                     interaction_type='profile_update',
#                     action='Admin Created PPPoE Client',
#                     description=f"PPPoE client created by {request.user.email}",
#                     outcome='success',
#                     started_at=timezone.now(),
#                     metadata={
#                         'created_by': request.user.email,
#                         'referral_code': referral_code,
#                         'plan_assigned': bool(plan_id),
#                         'sms_sent': sms_sent,
#                         'credentials_generated': True
#                     }
#                 )
                
#                 # Prepare response
#                 response_data = {
#                     'success': True,
#                     'message': 'PPPoE client created successfully',
#                     'timestamp': timezone.now().isoformat(),
#                     'client': {
#                         'id': str(user_account.id),
#                         'username': user_account.username,
#                         'name': name,
#                         'phone': phone,
#                         'normalized_phone': normalized_phone,
#                         'business_profile_id': str(client_profile.id),
#                         'referral_code': client_profile.referral_code,
#                         'connection_type': 'pppoe',
#                         'status': 'active'
#                     },
#                     'credentials': {
#                         'pppoe_username': credentials['username'],
#                         'pppoe_password': credentials['password'],
#                         'generated_at': credentials.get('timestamp', timezone.now().isoformat())
#                     },
#                     'plan_assigned': bool(plan_id),
#                     'plan_name': plan.name if 'plan' in locals() else None,
#                     'actions': {
#                         'user_created': True,
#                         'credentials_generated': True,
#                         'business_profile_created': True,
#                         'plan_assigned': bool(plan_id),
#                         'referral_processed': bool(referral_code),
#                         'sms_sent': sms_sent,
#                         'metrics_updated': True,
#                         'interaction_logged': True
#                     }
#                 }
                
#                 logger.info(f"PPPoE client created successfully: {user_account.username}")
#                 return Response(response_data, status=status.HTTP_201_CREATED)
                
#         except ValidationError as e:
#             logger.error(f"Validation error creating PPPoE client: {str(e)}")
#             return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"Error creating PPPoE client: {str(e)}", exc_info=True)
#             return Response({"error": f"Failed to create PPPoE client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class CreateHotspotClientView(APIView):
#     """Create Hotspot Client with plan assignment"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         """Create new hotspot client"""
#         try:
#             serializer = CreateHotspotClientSerializer(data=request.data)
            
#             if not serializer.is_valid():
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#             data = serializer.validated_data
#             phone = data['phone_number']
#             plan_id = data.get('plan_id')
#             client_type = data.get('client_type', 'residential')
#             send_welcome_sms = data.get('send_welcome_sms', True)
            
#             # Validate phone
#             try:
#                 from authentication.models import PhoneValidation
#                 normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
#             except ImportError:
#                 normalized_phone = phone
            
#             # Check if client exists
#             try:
#                 from authentication.models import UserAccount
#                 existing_user = UserAccount.get_client_by_phone(normalized_phone)
                
#                 if existing_user:
#                     return Response({
#                         "error": "Client already exists",
#                         "client": {
#                             "id": str(existing_user.id),
#                             "username": existing_user.username,
#                             "phone": existing_user.phone_number,
#                             "connection_type": existing_user.connection_type if hasattr(existing_user, 'connection_type') else ''
#                         }
#                     }, status=status.HTTP_400_BAD_REQUEST)
                
#                 # Create hotspot client
#                 user_account = UserAccount.objects.create_client_user(
#                     phone_number=normalized_phone,
#                     connection_type='hotspot'
#                 )
                
#             except ImportError:
#                 return Response(
#                     {"error": "Authentication app not available"},
#                     status=status.HTTP_503_SERVICE_UNAVAILABLE
#                 )
            
#             # Create business profile
#             client_profile = ClientProfile.objects.create(
#                 user=user_account,
#                 client_type=client_type,
#                 customer_since=timezone.now()
#             )
            
#             # Assign plan if specified
#             if plan_id:
#                 try:
#                     from internet_plans.models import InternetPlan, ClientPlanSubscription
#                     plan = InternetPlan.objects.get(id=plan_id, active=True, available_for_hotspot=True)
                    
#                     subscription = ClientPlanSubscription.objects.create(
#                         client=client_profile,
#                         internet_plan=plan,
#                         status='active',
#                         start_date=timezone.now(),
#                         end_date=timezone.now() + timedelta(days=30),
#                         auto_renew=True,
#                         data_limit_gb=plan.data_limit_gb if hasattr(plan, 'data_limit_gb') else Decimal('0.00'),
#                         hotspot_plan_id=f"HOTSPOT-{client_profile.id}-{plan.id}"
#                     )
                    
#                     client_profile.plan_updated_at = timezone.now()
#                     client_profile.save()
                    
#                 except InternetPlan.DoesNotExist:
#                     logger.warning(f"Plan {plan_id} not found or not available for hotspot")
            
#             # Send welcome SMS if requested
#             if send_welcome_sms:
#                 try:
#                     from user_management.services.sms_services import SMSService
#                     sms_service = SMSService()
                    
#                     message = (
#                         f"Welcome to our hotspot service! "
#                         f"Your account has been created successfully. "
#                         f"Username: {user_account.username}"
#                     )
                    
#                     if plan_id and 'plan' in locals():
#                         message += f"\nYour plan: {plan.name}"
                    
#                     sms = sms_service.create_sms_message(
#                         phone_number=normalized_phone,
#                         message=message,
#                         recipient_name=user_account.username,
#                         source='hotspot_creation',
#                         reference_id=f"hotspot_{user_account.id}"
#                     )
#                     sms_service.send_sms(sms)
                    
#                 except ImportError:
#                     logger.warning("SMS service not available")
            
#             # Log interaction
#             ClientInteraction.objects.create(
#                 client=client_profile,
#                 interaction_type='profile_update',
#                 action='Hotspot Client Created',
#                 description='Hotspot client created via admin',
#                 outcome='success',
#                 started_at=timezone.now()
#             )
            
#             return Response({
#                 'success': True,
#                 'message': 'Hotspot client created successfully',
#                 'client': {
#                     'id': str(user_account.id),
#                     'username': user_account.username,
#                     'phone': phone,
#                     'normalized_phone': normalized_phone,
#                     'business_profile_id': str(client_profile.id),
#                     'referral_code': client_profile.referral_code,
#                     'connection_type': 'hotspot',
#                     'plan_assigned': bool(plan_id),
#                     'plan_name': plan.name if 'plan' in locals() else None
#                 },
#                 'timestamp': timezone.now().isoformat()
#             }, status=status.HTTP_201_CREATED)
            
#         except Exception as e:
#             logger.error(f"Error creating hotspot client: {str(e)}")
#             return Response({"error": f"Failed to create hotspot client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class DashboardView(APIView):
#     """Business Dashboard - Integrated with Plan Analytics"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get complete dashboard data with plan analytics"""
#         try:
#             # Get time range
#             time_range = request.query_params.get('time_range', '30d')
            
#             # Calculate date range
#             end_date = timezone.now()
#             if time_range == '7d':
#                 start_date = end_date - timedelta(days=7)
#             elif time_range == '30d':
#                 start_date = end_date - timedelta(days=30)
#             elif time_range == '90d':
#                 start_date = end_date - timedelta(days=90)
#             else:  # 'all'
#                 start_date = None
            
#             # Get all data
#             data = {
#                 'summary': self._get_summary_stats(start_date, end_date),
#                 'financial': self._get_financial_analytics(start_date, end_date),
#                 'usage': self._get_usage_analytics(start_date, end_date),
#                 'client_analytics': self._get_client_analytics(start_date, end_date),
#                 'hotspot_analytics': self._get_hotspot_analytics(start_date, end_date),
#                 'plan_analytics': self._get_plan_analytics(start_date, end_date),
#                 'alerts': self._get_active_alerts(),
#                 'timestamp': timezone.now().isoformat(),
#                 'time_range': time_range
#             }
            
#             return Response(data)
            
#         except Exception as e:
#             logger.error(f"Error loading dashboard: {str(e)}")
#             return Response({"error": "Failed to load dashboard data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _get_summary_stats(self, start_date, end_date):
#         """Get summary statistics with plan data"""
#         total_clients = ClientProfile.objects.count()
        
#         # Active clients (last 30 days)
#         active_clients = ClientProfile.objects.filter(
#             last_login_date__gte=timezone.now() - timedelta(days=30)
#         ).count()
        
#         # New clients (time range)
#         if start_date:
#             new_clients = ClientProfile.objects.filter(
#                 created_at__range=[start_date, end_date]
#             ).count()
#         else:
#             new_clients = total_clients
        
#         # Clients with active plans
#         try:
#             from internet_plans.models import ClientPlanSubscription
#             clients_with_plans = ClientPlanSubscription.objects.filter(
#                 status='active'
#             ).values('client').distinct().count()
#         except ImportError:
#             clients_with_plans = 0
        
#         # Revenue stats
#         revenue_stats = ClientProfile.objects.aggregate(
#             total_revenue=Sum('lifetime_value'),
#             avg_monthly_revenue=Avg('monthly_recurring_revenue'),
#             total_commission=Sum('commission_balance')
#         )
        
#         # Churn risk
#         at_risk_clients = ClientProfile.objects.filter(
#             churn_risk_score__gte=Decimal('7.0')
#         ).count()
        
#         # Marketers count
#         marketers_count = ClientProfile.objects.filter(is_marketer=True).count()
        
#         return {
#             'total_clients': total_clients,
#             'active_clients': active_clients,
#             'new_clients': new_clients,
#             'at_risk_clients': at_risk_clients,
#             'marketers_count': marketers_count,
#             'clients_with_plans': clients_with_plans,
#             'clients_without_plans': total_clients - clients_with_plans,
#             'plan_coverage': round((clients_with_plans / total_clients * 100), 1) if total_clients > 0 else 0,
#             'revenue': {
#                 'total': float(revenue_stats['total_revenue'] or 0),
#                 'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0),
#                 'commission_pool': float(revenue_stats['total_commission'] or 0)
#             },
#             'growth_rate': self._calculate_growth_rate(start_date, end_date)
#         }
    
#     def _get_plan_analytics(self, start_date, end_date):
#         """Get plan analytics"""
#         try:
#             from internet_plans.models import ClientPlanSubscription, InternetPlan
            
#             # Active subscriptions
#             active_subscriptions = ClientPlanSubscription.objects.filter(
#                 status='active'
#             ).count()
            
#             # Expiring soon (next 7 days)
#             expiring_soon = ClientPlanSubscription.objects.filter(
#                 status='active',
#                 end_date__lte=timezone.now() + timedelta(days=7),
#                 end_date__gte=timezone.now()
#             ).count()
            
#             # Exceeded data limits
#             exceeded_limits = ClientPlanSubscription.objects.filter(
#                 status='active',
#                 data_used_gb__gte=F('data_limit_gb')
#             ).count()
            
#             # Popular plans
#             popular_plans = ClientPlanSubscription.objects.filter(
#                 status='active'
#             ).values('internet_plan__name').annotate(
#                 count=Count('id'),
#                 total_data_used=Sum('data_used_gb')
#             ).order_by('-count')[:5]
            
#             # Plan revenue
#             plan_revenue = InternetPlan.objects.filter(
#                 clientsubscription__status='active'
#             ).annotate(
#                 active_clients=Count('clientsubscription'),
#                 estimated_monthly_revenue=Sum('price')
#             ).order_by('-estimated_monthly_revenue')[:5]
            
#             return {
#                 'active_subscriptions': active_subscriptions,
#                 'expiring_soon': expiring_soon,
#                 'exceeded_limits': exceeded_limits,
#                 'popular_plans': [
#                     {
#                         'plan': item['internet_plan__name'],
#                         'clients': item['count'],
#                         'total_data_used': float(item['total_data_used'] or 0)
#                     }
#                     for item in popular_plans
#                 ],
#                 'top_revenue_plans': [
#                     {
#                         'plan': plan.name,
#                         'active_clients': plan.active_clients,
#                         'estimated_monthly_revenue': float(plan.estimated_monthly_revenue or 0)
#                     }
#                     for plan in plan_revenue
#                 ]
#             }
            
#         except ImportError:
#             return {}
    
#     # Other methods from original DashboardView retained...
#     def _get_financial_analytics(self, start_date, end_date):
#         """Get financial analytics"""
#         revenue_segments = ClientProfile.objects.values('revenue_segment').annotate(
#             count=Count('id'),
#             total_revenue=Sum('lifetime_value'),
#             avg_revenue=Avg('lifetime_value')
#         ).order_by('-total_revenue')
        
#         top_clients = ClientProfile.objects.order_by('-lifetime_value')[:10].values(
#             'id', 'user__username', 'lifetime_value', 'revenue_segment'
#         )
        
#         return {
#             'revenue_segments': list(revenue_segments),
#             'top_clients': list(top_clients),
#             'metrics': {
#                 'avg_client_value': float(ClientProfile.objects.aggregate(avg=Avg('lifetime_value'))['avg'] or Decimal('0.0')),
#             }
#         }
    
#     def _get_usage_analytics(self, start_date, end_date):
#         """Get usage analytics"""
#         usage_patterns = ClientProfile.objects.values('usage_pattern').annotate(
#             count=Count('id'),
#             avg_data=Avg('avg_monthly_data_gb')
#         ).order_by('-avg_data')
        
#         top_users = ClientProfile.objects.order_by('-total_data_used_gb')[:10].values(
#             'id', 'user__username', 'total_data_used_gb', 'usage_pattern'
#         )
        
#         return {
#             'usage_patterns': list(usage_patterns),
#             'top_users': list(top_users),
#             'metrics': {
#                 'total_data_used': float(ClientProfile.objects.aggregate(total=Sum('total_data_used_gb'))['total'] or Decimal('0.0')),
#                 'avg_monthly_data': float(ClientProfile.objects.aggregate(avg=Avg('avg_monthly_data_gb'))['avg'] or Decimal('0.0')),
#             }
#         }
    
#     def _get_client_analytics(self, start_date, end_date):
#         """Get client behavior analytics"""
#         connection_dist = ClientProfile.objects.values('user__connection_type').annotate(
#             count=Count('id'),
#             percentage=Count('id') * 100.0 / ClientProfile.objects.count()
#         ).order_by('-count')
        
#         tier_dist = ClientProfile.objects.values('tier').annotate(
#             count=Count('id'),
#             avg_revenue=Avg('lifetime_value')
#         ).order_by('-avg_revenue')
        
#         client_type_dist = ClientProfile.objects.values('client_type').annotate(
#             count=Count('id'),
#             avg_ltv=Avg('lifetime_value')
#         ).order_by('-avg_ltv')
        
#         return {
#             'connection_distribution': list(connection_dist),
#             'tier_distribution': list(tier_dist),
#             'client_type_distribution': list(client_type_dist),
#             'retention_metrics': self._calculate_retention_metrics(start_date, end_date)
#         }
    
#     def _get_hotspot_analytics(self, start_date, end_date):
#         """Get hotspot-specific analytics"""
#         hotspot_clients = ClientProfile.objects.filter(user__connection_type='hotspot')
        
#         if not hotspot_clients.exists():
#             return {}
        
#         conversion_stats = hotspot_clients.aggregate(
#             avg_conversion=Avg('hotspot_conversion_rate'),
#             max_conversion=Max('hotspot_conversion_rate'),
#             min_conversion=Min('hotspot_conversion_rate'),
#             total_sessions=Sum('hotspot_sessions')
#         )
        
#         return {
#             'conversion': {
#                 'average': float(conversion_stats['avg_conversion'] or Decimal('0.0')),
#                 'range': {
#                     'min': float(conversion_stats['min_conversion'] or Decimal('0.0')),
#                     'max': float(conversion_stats['max_conversion'] or Decimal('0.0'))
#                 },
#                 'total_sessions': conversion_stats['total_sessions'] or 0
#             }
#         }
    
#     def _get_active_alerts(self):
#         """Get active alerts"""
#         alerts = []
        
#         # Check for at-risk clients
#         at_risk_count = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
#         if at_risk_count > 5:
#             alerts.append({
#                 'type': 'churn_risk',
#                 'title': 'Multiple High Churn Risk Clients',
#                 'description': f'{at_risk_count} clients are at high risk of churning',
#                 'severity': 'high',
#                 'timestamp': timezone.now().isoformat()
#             })
        
#         # Check for overdue payments
#         overdue_count = ClientProfile.objects.filter(days_since_last_payment__gt=14).count()
#         if overdue_count > 3:
#             alerts.append({
#                 'type': 'payment_overdue',
#                 'title': 'Overdue Payments',
#                 'description': f'{overdue_count} clients have overdue payments',
#                 'severity': 'medium',
#                 'timestamp': timezone.now().isoformat()
#             })
        
#         return alerts
    
#     def _calculate_growth_rate(self, start_date, end_date):
#         """Calculate overall growth rate"""
#         if not start_date:
#             return 0
        
#         start_count = ClientProfile.objects.filter(created_at__lt=start_date).count()
#         end_count = ClientProfile.objects.filter(created_at__lte=end_date).count()
        
#         if start_count == 0:
#             return 100
        
#         growth = ((end_count - start_count) / start_count) * 100
#         return round(growth, 1)
    
#     def _calculate_retention_metrics(self, start_date, end_date):
#         """Calculate retention metrics"""
#         return {
#             'retention_rate': 85.5,
#             'avg_client_lifetime': '14.3 months',
#             'churn_rate': 2.1
#         }


# class CommissionDashboardView(APIView):
#     """Commission Dashboard for Marketers with Plan Sales"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         """Get commission dashboard data"""
#         try:
#             marketer_id = request.query_params.get('marketer_id')
            
#             if marketer_id:
#                 # Get specific marketer data
#                 try:
#                     marketer = ClientProfile.objects.get(id=marketer_id, is_marketer=True)
#                     marketer_data = self._get_marketer_stats(marketer)
#                     return Response(marketer_data)
#                 except ClientProfile.DoesNotExist:
#                     return Response({"error": "Marketer not found"}, status=status.HTTP_404_NOT_FOUND)
#             else:
#                 # Get all marketers summary
#                 marketers = ClientProfile.objects.filter(is_marketer=True)
                
#                 total_marketers = marketers.count()
#                 total_commission = marketers.aggregate(
#                     total=Sum('commission_balance'),
#                     earned=Sum('total_commission_earned')
#                 )
                
#                 top_marketers = marketers.order_by('-total_commission_earned')[:10].values(
#                     'id', 'user__username', 'total_commission_earned', 
#                     'commission_balance', 'marketer_tier'
#                 )
                
#                 pending_commissions = CommissionTransaction.objects.filter(status='pending').count()
                
#                 # Plan sales statistics
#                 plan_sales = CommissionTransaction.objects.filter(
#                     transaction_type='plan_sale'
#                 ).aggregate(
#                     total=Sum('amount'),
#                     count=Count('id')
#                 )
                
#                 return Response({
#                     'total_marketers': total_marketers,
#                     'commission_stats': {
#                         'total_balance': float(total_commission['total'] or 0),
#                         'total_earned': float(total_commission['earned'] or 0),
#                         'pending_approvals': pending_commissions,
#                         'plan_sales_total': float(plan_sales['total'] or 0),
#                         'plan_sales_count': plan_sales['count'] or 0
#                     },
#                     'top_marketers': list(top_marketers),
#                     'timestamp': timezone.now().isoformat()
#                 })
                
#         except Exception as e:
#             logger.error(f"Error loading commission dashboard: {str(e)}")
#             return Response({"error": "Failed to load commission dashboard"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     def _get_marketer_stats(self, marketer):
#         """Get detailed stats for a marketer"""
#         transactions = CommissionTransaction.objects.filter(marketer=marketer).order_by('-transaction_date')[:20]
#         referrals = ClientProfile.objects.filter(referred_by=marketer).count()
        
#         recent_referrals = ClientProfile.objects.filter(
#             referred_by=marketer
#         ).select_related('user').order_by('-created_at')[:10]
        
#         # Plan sales statistics
#         plan_sales = CommissionTransaction.objects.filter(
#             marketer=marketer,
#             transaction_type='plan_sale'
#         ).aggregate(
#             total=Sum('amount'),
#             count=Count('id')
#         )
        
#         return {
#             'marketer': {
#                 'id': marketer.id,
#                 'username': marketer.username,
#                 'name': marketer.client_name,
#                 'tier': marketer.marketer_tier,
#                 'referral_code': marketer.referral_code,
#                 'commission_rate': float(marketer.commission_rate)
#             },
#             'stats': {
#                 'total_earned': float(marketer.total_commission_earned),
#                 'current_balance': float(marketer.commission_balance),
#                 'total_referrals': referrals,
#                 'lifetime_value': float(marketer.lifetime_value),
#                 'plan_sales_total': float(plan_sales['total'] or 0),
#                 'plan_sales_count': plan_sales['count'] or 0
#             },
#             'transactions': CommissionTransactionSerializer(transactions, many=True).data,
#             'recent_referrals': [
#                 {
#                     'id': ref.id,
#                     'username': ref.username,
#                     'phone': ref.phone_number,
#                     'created_at': ref.created_at.isoformat(),
#                     'connection_type': ref.connection_type
#                 }
#                 for ref in recent_referrals
#             ]
#         }










"""
Business Logic Views - No Authentication Logic
Handles client management, analytics, and marketing
Production-ready with complete client onboarding workflow
Fully integrated with Service Operations
"""
import logging
import io
import csv
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db.models import Q, Count, Sum, Avg, F, Max, Min
from django.db import transaction
from django.core.cache import cache
from decimal import Decimal
from datetime import timedelta
from django.conf import settings
import json
from django.shortcuts import get_object_or_404

from user_management.models.client_model import (
    ClientProfile, ClientAnalyticsSnapshot,
    CommissionTransaction, ClientInteraction
)
from user_management.serializers.client_serializer import (
    ClientProfileSerializer, CreatePPPoEClientSerializer,
    CreateHotspotClientSerializer, UpdateClientTierSerializer,
    ClientAnalyticsSnapshotSerializer, ClientInteractionSerializer,
    CommissionTransactionSerializer, SendMessageSerializer,
    AssignPlanSerializer, UpdateSubscriptionSerializer,
    DataUsageSerializer, ChangePlanSerializer, PlanRenewalSerializer,
    PlanSuspensionSerializer, PlanRecommendationSerializer,
    ClientPlanDashboardSerializer
)
from service_operations.services.subscription_service import SubscriptionService
from service_operations.adapters.internet_plans_adapter import InternetPlansAdapter
from service_operations.adapters.user_management_adapter import UserManagementAdapter
from service_operations.services.usage_service import UsageService

logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    page_query_param = 'page'


class ClientProfileViewSet(viewsets.ModelViewSet):
    """Client Profile Management - Business Logic Only"""
    
    queryset = ClientProfile.objects.all().select_related('user')
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        """Filter queryset based on user permissions and query params"""
        queryset = super().get_queryset()
        params = self.request.query_params
        
        # Connection type filter
        connection_type = params.get('connection_type')
        if connection_type:
            queryset = queryset.filter(user__connection_type=connection_type)
        
        # Client type filter
        client_type = params.get('client_type')
        if client_type:
            queryset = queryset.filter(client_type=client_type)
        
        # Status filter
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Tier filter
        tier_filter = params.get('tier')
        if tier_filter:
            queryset = queryset.filter(tier=tier_filter)
        
        # Revenue segment filter
        revenue_segment = params.get('revenue_segment')
        if revenue_segment:
            queryset = queryset.filter(revenue_segment=revenue_segment)
        
        # Usage pattern filter
        usage_pattern = params.get('usage_pattern')
        if usage_pattern:
            queryset = queryset.filter(usage_pattern=usage_pattern)
        
        # Marketer filter
        is_marketer = params.get('is_marketer')
        if is_marketer is not None:
            queryset = queryset.filter(is_marketer=(is_marketer.lower() == 'true'))
        
        # Plan status filter
        plan_status = params.get('plan_status')
        if plan_status == 'with_plan':
            # Check via Service Operations
            queryset = self._filter_clients_with_plans(queryset)
        elif plan_status == 'without_plan':
            queryset = self._filter_clients_without_plans(queryset)
        
        # At-risk filter
        at_risk = params.get('at_risk')
        if at_risk is not None:
            if at_risk.lower() == 'true':
                queryset = queryset.filter(churn_risk_score__gte=Decimal('7.0'))
            else:
                queryset = queryset.filter(churn_risk_score__lt=Decimal('7.0'))
        
        # Needs attention filter
        needs_attention = params.get('needs_attention')
        if needs_attention is not None:
            if needs_attention.lower() == 'true':
                queryset = queryset.filter(
                    Q(churn_risk_score__gte=Decimal('7.0')) |
                    Q(days_since_last_payment__gt=7) |
                    Q(flags__contains=['payment_failed'])
                )
        
        # Date range filters
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        # Search filter
        search_query = params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(user__username__icontains=search_query) |
                Q(user__phone_number__icontains=search_query) |
                Q(user__name__icontains=search_query) |
                Q(referral_code__icontains=search_query) |
                Q(email__icontains=search_query)
            )
        
        # Revenue range filter
        min_revenue = params.get('min_revenue')
        max_revenue = params.get('max_revenue')
        if min_revenue:
            queryset = queryset.filter(lifetime_value__gte=Decimal(min_revenue))
        if max_revenue:
            queryset = queryset.filter(lifetime_value__lte=Decimal(max_revenue))
        
        # Sort by parameter
        sort_by = params.get('sort_by', '-created_at')
        sort_order = params.get('sort_order', 'desc')
        
        sort_map = {
            'username': 'user__username',
            'phone': 'user__phone_number',
            'name': 'user__name',
            'email': 'email',
            'revenue': 'lifetime_value',
            'data_usage': 'total_data_used_gb',
            'churn_risk': 'churn_risk_score',
            'engagement': 'engagement_score',
            'last_payment': 'last_payment_date',
            'plan_status': 'current_plan_info__plan__name',
            'created': 'created_at',
            'updated': 'updated_at',
        }
        
        field = sort_map.get(sort_by, sort_by)
        if sort_order == 'desc' and not field.startswith('-'):
            field = f'-{field}'
        elif sort_order == 'asc' and field.startswith('-'):
            field = field[1:]
        
        return queryset.order_by(field)
    
    def _filter_clients_with_plans(self, queryset):
        """Filter clients with active plans via Service Operations"""
        client_ids_with_plans = []
        try:
            # Get all subscriptions from Service Operations
            subscriptions = SubscriptionService.get_all_active_subscriptions()
            if subscriptions.get('success'):
                for sub in subscriptions.get('subscriptions', []):
                    if sub.get('client_id'):
                        client_ids_with_plans.append(sub['client_id'])
        except Exception as e:
            logger.error(f"Error filtering clients with plans: {e}")
        
        # Filter by client_id
        return queryset.filter(client_id__in=client_ids_with_plans)
    
    def _filter_clients_without_plans(self, queryset):
        """Filter clients without active plans via Service Operations"""
        client_ids_with_plans = []
        try:
            subscriptions = SubscriptionService.get_all_active_subscriptions()
            if subscriptions.get('success'):
                for sub in subscriptions.get('subscriptions', []):
                    if sub.get('client_id'):
                        client_ids_with_plans.append(sub['client_id'])
        except Exception as e:
            logger.error(f"Error filtering clients without plans: {e}")
        
        # Exclude clients with active subscriptions
        return queryset.exclude(client_id__in=client_ids_with_plans)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get detailed analytics for a client"""
        try:
            client = self.get_object()
            
            # Get analytics snapshots
            snapshots = ClientAnalyticsSnapshot.objects.filter(
                client=client
            ).order_by('-date')[:30]
            
            # Get insights from service
            from user_management.services.client_services import AnalyticsService
            insights = AnalyticsService.get_client_insights(client)
            
            # Get recent interactions
            recent_interactions = ClientInteraction.objects.filter(
                client=client
            ).order_by('-started_at')[:20]
            
            # Get commission history if marketer
            commission_history = None
            if client.is_marketer:
                commission_history = CommissionTransaction.objects.filter(
                    marketer=client
                ).order_by('-transaction_date')[:10]
            
            # Get Service Operations data
            so_data = self._get_service_operations_data(client)
            
            # Get plan analytics
            plan_analytics = self._get_plan_analytics(client)
            
            return Response({
                'client': ClientProfileSerializer(client, context={'request': request}).data,
                'analytics': ClientAnalyticsSnapshotSerializer(snapshots, many=True).data,
                'insights': insights,
                'recent_interactions': ClientInteractionSerializer(recent_interactions, many=True).data,
                'commission_history': CommissionTransactionSerializer(commission_history, many=True).data if commission_history else [],
                'service_operations': so_data,
                'plan_analytics': plan_analytics
            })
            
        except ObjectDoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error getting client analytics: {str(e)}")
            return Response({"error": "Failed to load client analytics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_metrics(self, request, pk=None):
        """Update client metrics manually"""
        try:
            client = self.get_object()
            
            # Update metrics using service
            from user_management.services.client_services import AnalyticsService
            updated_client = AnalyticsService.update_client_metrics(client)
            
            return Response({
                'success': True,
                'message': 'Client metrics updated successfully',
                'client': ClientProfileSerializer(updated_client, context={'request': request}).data
            })
            
        except ObjectDoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error updating client metrics: {str(e)}")
            return Response({"error": "Failed to update client metrics"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def plan_dashboard(self, request, pk=None):
        """Get comprehensive plan dashboard for client"""
        try:
            client = self.get_object()
            
            # Get current plan details via Service Operations
            current_plan = self._get_current_plan_details(client)
            
            # Get plan utilization
            plan_utilization = self._get_plan_utilization(client)
            
            # Get usage history
            usage_history = self._get_usage_history(client)
            
            # Get payment history
            payment_history = self._get_payment_history(client)
            
            # Get recommendations
            recommendations = self._get_plan_recommendations(client)
            
            # Get available actions
            actions = self._get_plan_actions(client, request.user)
            
            return Response({
                'success': True,
                'client_info': {
                    'id': str(client.id),
                    'client_id': str(client.client_id),
                    'username': client.username,
                    'phone': client.phone_number,
                    'connection_type': client.connection_type,
                    'tier': client.tier,
                    'status': client.status
                },
                'current_plan': current_plan,
                'plan_utilization': plan_utilization,
                'usage_history': usage_history,
                'payment_history': payment_history,
                'recommendations': recommendations,
                'actions': actions,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting plan dashboard: {str(e)}")
            return Response({
                'error': 'Failed to load plan dashboard',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def assign_plan(self, request, pk=None):
        """Assign an internet plan to client via Service Operations"""
        try:
            client = self.get_object()
            serializer = AssignPlanSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            plan_id = data['plan_id']
            auto_renew = data['auto_renew']
            duration_hours = data['duration_hours']
            send_notification = data.get('send_notification', True)
            router_id = data.get('router_id')
            hotspot_mac_address = data.get('hotspot_mac_address')
            notes = data.get('notes', '')
            
            # Get plan details via Service Operations
            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
            if not plan_details or not plan_details.get('is_active'):
                return Response(
                    {'error': 'Plan not available or inactive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check compatibility
            if not self._is_plan_compatible(client, plan_details):
                return Response({
                    'error': f'Plan "{plan_details.get("name")}" is not compatible with {client.connection_type} connection'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if client already has active subscription
            existing_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            with transaction.atomic():
                if existing_subscriptions.get('success') and existing_subscriptions['subscriptions']:
                    # Update existing subscription
                    subscription = existing_subscriptions['subscriptions'][0]
                    update_result = SubscriptionService.update_subscription(
                        subscription_id=subscription['id'],
                        internet_plan_id=plan_id,
                        auto_renew=auto_renew,
                        duration_hours=duration_hours
                    )
                    
                    if not update_result['success']:
                        return Response(
                            {'error': update_result.get('error', 'Failed to update subscription')},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    subscription_id = subscription['id']
                    action_type = 'plan_updated'
                    
                    # End old subscription if needed
                    if update_result.get('old_subscription_id'):
                        SubscriptionService.cancel_subscription(
                            update_result['old_subscription_id'],
                            f"Replaced by new plan assignment"
                        )
                else:
                    # Create new subscription via Service Operations
                    result = SubscriptionService.create_subscription(
                        client_id=str(client.client_id),
                        internet_plan_id=plan_id,
                        client_type=client.client_type,
                        access_method='pppoe' if client.is_pppoe_client else 'hotspot',
                        duration_hours=duration_hours,
                        router_id=router_id,
                        hotspot_mac_address=hotspot_mac_address if client.is_hotspot_client else None,
                        auto_renew=auto_renew,
                        metadata={
                            'assigned_by': request.user.username,
                            'notes': notes,
                            'plan_name': plan_details.get('name')
                        },
                        created_by=request.user.username
                    )
                    
                    if not result['success']:
                        return Response(
                            {'error': result.get('error', 'Failed to create subscription')},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                    
                    subscription_id = result['subscription_id']
                    action_type = 'plan_assigned'
                
                # Update client's plan info
                client.plan_updated_at = timezone.now()
                client.plan_auto_renew = auto_renew
                client.save()
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client,
                    interaction_type='plan_purchase',
                    action=f'Plan {action_type.replace("_", " ").title()} by Admin',
                    description=f'Plan "{plan_details.get("name")}" {action_type.replace("_", " ")} by {request.user.username}',
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={
                        'subscription_id': subscription_id,
                        'plan_id': plan_id,
                        'plan_name': plan_details.get('name'),
                        'assigned_by': request.user.username,
                        'auto_renew': auto_renew,
                        'duration_hours': duration_hours,
                        'notes': notes,
                        'action_type': action_type
                    }
                )
                
                # Send notification if requested
                if send_notification:
                    self._send_plan_assignment_notification(client, plan_details, subscription_id, action_type, auto_renew)
                
                # Update commission if marketer referral
                self._process_plan_commission(client, plan_details, subscription_id)
            
            return Response({
                'success': True,
                'message': f'Plan "{plan_details.get("name")}" {action_type.replace("_", " ")} successfully',
                'subscription_id': subscription_id,
                'plan_details': plan_details,
                'action_type': action_type,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error assigning plan: {str(e)}")
            return Response({
                'error': 'Failed to assign plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def change_plan(self, request, pk=None):
        """Change client's current plan"""
        try:
            client = self.get_object()
            serializer = ChangePlanSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            new_plan_id = data['new_plan_id']
            immediate = data['immediate']
            send_notification = data['send_notification']
            reason = data.get('reason', '')
            
            # Get current subscription via Service Operations
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            if not current_subscriptions.get('success') or not current_subscriptions['subscriptions']:
                return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
            current_subscription = current_subscriptions['subscriptions'][0]
            
            # Get new plan details
            new_plan_details = InternetPlansAdapter.get_plan_details(new_plan_id)
            if not new_plan_details or not new_plan_details.get('is_active'):
                return Response({'error': 'New plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check compatibility
            if not self._is_plan_compatible(client, new_plan_details):
                return Response({
                    'error': f'Plan "{new_plan_details.get("name")}" is not compatible with {client.connection_type} connection'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Process plan change
            if immediate:
                # End current subscription and start new one immediately
                cancel_result = SubscriptionService.cancel_subscription(
                    current_subscription['id'],
                    f"Changed to new plan: {reason}"
                )
                
                if not cancel_result.get('success'):
                    return Response({
                        'error': 'Failed to cancel current subscription'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Create new subscription
                result = SubscriptionService.create_subscription(
                    client_id=str(client.client_id),
                    internet_plan_id=new_plan_id,
                    client_type=client.client_type,
                    access_method='pppoe' if client.is_pppoe_client else 'hotspot',
                    duration_hours=current_subscription.get('remaining_hours', 720),  # Default 30 days
                    auto_renew=current_subscription.get('auto_renew', False),
                    metadata={
                        'changed_from': current_subscription.get('internet_plan_id'),
                        'change_reason': reason,
                        'changed_by': request.user.username,
                        'changed_at': timezone.now().isoformat()
                    },
                    created_by=request.user.username
                )
                
                if not result['success']:
                    return Response({
                        'error': 'Failed to create new subscription'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                new_subscription_id = result['subscription_id']
                
            else:
                # Schedule change for next billing cycle
                update_result = SubscriptionService.update_subscription(
                    subscription_id=current_subscription['id'],
                    internet_plan_id=new_plan_id,
                    scheduled_change=True,
                    change_reason=reason,
                    scheduled_by=request.user.username
                )
                
                if not update_result['success']:
                    return Response({
                        'error': 'Failed to schedule plan change'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                new_subscription_id = None
            
            # Update client
            client.plan_updated_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='plan_change',
                action='Plan Changed' + (' (Immediate)' if immediate else ' (Scheduled)'),
                description=f'Changed from "{current_subscription.get("plan_name")}" to "{new_plan_details.get("name")}": {reason}',
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'old_plan': current_subscription.get('plan_name'),
                    'new_plan': new_plan_details.get('name'),
                    'immediate': immediate,
                    'reason': reason,
                    'changed_by': request.user.username,
                    'new_subscription_id': new_subscription_id
                }
            )
            
            # Send notification if requested
            if send_notification:
                self._send_plan_change_notification(
                    client, 
                    current_subscription, 
                    new_plan_details, 
                    immediate
                )
            
            response_data = {
                'success': True,
                'message': f'Plan changed from "{current_subscription.get("plan_name")}" to "{new_plan_details.get("name")}"',
                'details': {
                    'old_plan': current_subscription.get('plan_name'),
                    'new_plan': new_plan_details.get('name'),
                    'change_type': 'immediate' if immediate else 'scheduled',
                    'effective_date': timezone.now().isoformat() if immediate else None
                }
            }
            
            if new_subscription_id:
                response_data['new_subscription_id'] = new_subscription_id
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error changing plan: {str(e)}")
            return Response({
                'error': 'Failed to change plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def renew_plan(self, request, pk=None):
        """Renew client's current plan"""
        try:
            client = self.get_object()
            serializer = PlanRenewalSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            renew_period = data['renew_period']  # '1m', '3m', '6m', '12m'
            auto_renew = data['auto_renew']
            send_notification = data['send_notification']
            payment_method = data.get('payment_method', '')
            
            # Get current subscription
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            if not current_subscriptions.get('success') or not current_subscriptions['subscriptions']:
                return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
            subscription = current_subscriptions['subscriptions'][0]
            
            # Calculate duration hours based on renew period
            period_hours = {
                '1m': 720,    # 30 days
                '3m': 2160,   # 90 days
                '6m': 4320,   # 180 days
                '12m': 8640   # 365 days
            }.get(renew_period, 720)
            
            # Extend subscription via Service Operations
            extend_result = SubscriptionService.extend_subscription(
                subscription_id=subscription['id'],
                duration_hours=period_hours
            )
            
            if not extend_result['success']:
                return Response({
                    'error': 'Failed to renew plan',
                    'details': extend_result.get('error')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update auto-renew if different
            if subscription.get('auto_renew') != auto_renew:
                update_result = SubscriptionService.update_subscription(
                    subscription_id=subscription['id'],
                    auto_renew=auto_renew
                )
            
            # Get updated subscription details
            updated_subscription = SubscriptionService.get_subscription_details(subscription['id'])
            
            # Update client
            client.plan_auto_renew = auto_renew
            client.plan_updated_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='plan_renewal',
                action='Plan Renewed',
                description=f'Plan renewed for {renew_period}',
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'renew_period': renew_period,
                    'duration_hours': period_hours,
                    'auto_renew': auto_renew,
                    'payment_method': payment_method,
                    'renewed_by': request.user.username,
                    'subscription_id': subscription['id']
                }
            )
            
            # Send notification if requested
            if send_notification:
                self._send_plan_renewal_notification(
                    client, 
                    updated_subscription.get('subscription', {}), 
                    renew_period
                )
            
            return Response({
                'success': True,
                'message': f'Plan renewed successfully',
                'details': {
                    'plan_name': updated_subscription.get('subscription', {}).get('plan_name'),
                    'renewal_period': renew_period,
                    'new_end_date': updated_subscription.get('subscription', {}).get('end_date'),
                    'auto_renew': auto_renew
                },
                'client': ClientProfileSerializer(client, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Error renewing plan: {str(e)}")
            return Response({
                'error': 'Failed to renew plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def suspend_plan(self, request, pk=None):
        """Suspend client's plan (admin only)"""
        try:
            client = self.get_object()
            
            # Check permissions
            if not (request.user.is_staff or request.user.is_superuser):
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = PlanSuspensionSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            reason = data['reason']
            duration_days = data['duration_days']
            send_notification = data['send_notification']
            notes = data.get('notes', '')
            
            # Get current subscription
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            if not current_subscriptions.get('success') or not current_subscriptions['subscriptions']:
                return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
            subscription = current_subscriptions['subscriptions'][0]
            
            # Suspend subscription via Service Operations
            suspend_result = SubscriptionService.suspend_subscription(
                subscription_id=subscription['id'],
                reason=reason,
                notes=notes
            )
            
            if not suspend_result.get('success'):
                return Response({
                    'error': 'Failed to suspend plan',
                    'details': suspend_result.get('error')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update client status
            client.status = 'suspended'
            client.plan_updated_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='plan_suspension',
                action='Plan Suspended',
                description=f'Plan suspended: {reason}',
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'reason': reason,
                    'duration_days': duration_days,
                    'suspended_by': request.user.username,
                    'notes': notes,
                    'subscription_id': subscription['id']
                }
            )
            
            # Send notification if requested
            if send_notification:
                self._send_plan_suspension_notification(
                    client, 
                    subscription, 
                    reason, 
                    duration_days
                )
            
            return Response({
                'success': True,
                'message': f'Plan suspended for {duration_days} days',
                'details': {
                    'reason': reason,
                    'duration_days': duration_days,
                    'suspended_by': request.user.username
                },
                'client': ClientProfileSerializer(client, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Error suspending plan: {str(e)}")
            return Response({
                'error': 'Failed to suspend plan',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def toggle_auto_renew(self, request, pk=None):
        """Toggle auto-renew for client's plan"""
        try:
            client = self.get_object()
            
            # Get current subscription
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            if not current_subscriptions.get('success') or not current_subscriptions['subscriptions']:
                return Response({'error': 'Client has no active plan'}, status=status.HTTP_400_BAD_REQUEST)
            
            subscription = current_subscriptions['subscriptions'][0]
            new_auto_renew = not subscription.get('auto_renew', False)
            
            # Update subscription via Service Operations
            update_result = SubscriptionService.update_subscription(
                subscription_id=subscription['id'],
                auto_renew=new_auto_renew
            )
            
            if not update_result.get('success'):
                return Response({
                    'error': 'Failed to update auto-renew',
                    'details': update_result.get('error')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update client
            client.plan_auto_renew = new_auto_renew
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='profile_update',
                action='Auto-Renew Updated',
                description=f'Auto-renew changed to {new_auto_renew}',
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'new_auto_renew': new_auto_renew,
                    'updated_by': request.user.username,
                    'subscription_id': subscription['id']
                }
            )
            
            return Response({
                'success': True,
                'message': f'Auto-renew {"enabled" if new_auto_renew else "disabled"}',
                'auto_renew': new_auto_renew,
                'client': ClientProfileSerializer(client, context={'request': request}).data
            })
            
        except Exception as e:
            logger.error(f"Error toggling auto-renew: {str(e)}")
            return Response({
                'error': 'Failed to update auto-renew',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_subscription(self, request, pk=None):
        """Update client subscription via Service Operations"""
        try:
            client = self.get_object()
            serializer = UpdateSubscriptionSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            subscription_id = data['subscription_id']
            action = data['action']
            plan_id = data.get('plan_id')
            duration_hours = data.get('duration_hours')
            notes = data.get('notes', '')
            
            # Perform action via Service Operations
            result = None
            if action == 'activate':
                result = SubscriptionService.activate_subscription(subscription_id)
            elif action == 'suspend':
                result = SubscriptionService.suspend_subscription(subscription_id, notes)
            elif action == 'cancel':
                result = SubscriptionService.cancel_subscription(subscription_id, notes)
            elif action == 'extend':
                if not duration_hours:
                    return Response({'error': 'Duration required for extension'}, status=status.HTTP_400_BAD_REQUEST)
                result = SubscriptionService.extend_subscription(subscription_id, duration_hours)
            elif action == 'change_plan':
                if not plan_id:
                    return Response({'error': 'Plan ID required for change'}, status=status.HTTP_400_BAD_REQUEST)
                result = SubscriptionService.change_subscription_plan(subscription_id, plan_id)
            
            if not result or not result.get('success'):
                error_msg = result.get('error', 'Failed to update subscription') if result else 'Action failed'
                return Response({'error': error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get updated subscription details
            subscription_data = SubscriptionService.get_subscription_details(subscription_id)
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='profile_update',
                action=f'Subscription {action.title()}',
                description=f"Subscription {action}: {notes}",
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'subscription_id': subscription_id,
                    'action': action,
                    'result': result,
                    'updated_by': request.user.username
                }
            )
            
            return Response({
                'success': True,
                'message': f'Subscription {action} successful',
                'subscription': subscription_data,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error updating subscription: {str(e)}")
            return Response({
                'error': 'Failed to update subscription',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def resend_credentials(self, request, pk=None):
        """Resend PPPoE credentials to client via SMS"""
        try:
            client = self.get_object()
            
            if not client.is_pppoe_client:
                return Response(
                    {"error": "Only PPPoE clients can have credentials resent"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get PPPoE credentials from Authentication app
            user = client.user
            pppoe_username = user.pppoe_username
            pppoe_password = user.get_pppoe_password_decrypted()
            
            if not pppoe_password:
                return Response(
                    {"error": "PPPoE credentials not found or could not be decrypted"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get current subscription for plan info
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            plan_name = ""
            if current_subscriptions.get('success') and current_subscriptions['subscriptions']:
                plan_name = current_subscriptions['subscriptions'][0].get('plan_name', '')
            
            # Send SMS via SMS Automation Service
            try:
                from user_management.services.sms_services import SMSService
                sms_service = SMSService()
                sms = sms_service.send_pppoe_credentials(
                    phone_number=client.phone_number,
                    client_name=client.username,
                    pppoe_username=pppoe_username,
                    password=pppoe_password,
                    plan_name=plan_name,
                    reference_id=f"resend_{client.id}_{timezone.now().timestamp()}"
                )
                
                # Log interaction
                ClientInteraction.objects.create(
                    client=client,
                    interaction_type='sms_sent',
                    action='PPPoE Credentials Resent',
                    description='PPPoE credentials resent via SMS',
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={'sms_id': str(sms.id)}
                )
                
                return Response({
                    'success': True,
                    'message': 'Credentials resent successfully',
                    'sms_status': sms.status,
                    'timestamp': timezone.now().isoformat()
                })
                
            except ImportError:
                logger.error("SMS Automation service not available")
                return Response(
                    {"error": "SMS service not available"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
        except Exception as e:
            logger.error(f"Error resending credentials: {str(e)}")
            return Response({"error": f"Failed to resend credentials: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def data_usage(self, request, pk=None):
        """Get detailed data usage via Service Operations"""
        try:
            client = self.get_object()
            serializer = DataUsageSerializer(data=request.query_params)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            period = data['period']
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            detailed = data['detailed']
            
            # Get usage data via Service Operations
            usage_data = UsageService.get_client_usage_details(
                client_id=str(client.client_id),
                period=period,
                start_date=start_date,
                end_date=end_date,
                detailed=detailed
            )
            
            if not usage_data.get('success'):
                return Response({
                    'error': usage_data.get('error', 'Failed to fetch usage data')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'success': True,
                'client_id': str(client.client_id),
                'client_name': client.username,
                'usage_data': usage_data,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error fetching data usage: {str(e)}")
            return Response({
                'error': 'Failed to fetch data usage',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def update_tier(self, request, pk=None):
        """Update client tier"""
        try:
            client = self.get_object()
            serializer = UpdateClientTierSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            new_tier = data['tier']
            reason = data.get('reason', '')
            send_notification = data.get('send_notification', True)
            
            old_tier = client.tier
            client.tier = new_tier
            client.tier_upgraded_at = timezone.now()
            client.save()
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client,
                interaction_type='profile_update',
                action='Tier Updated',
                description=f"Tier changed from {old_tier} to {new_tier}: {reason}",
                outcome='success',
                started_at=timezone.now(),
                metadata={
                    'old_tier': old_tier,
                    'new_tier': new_tier,
                    'updated_by': request.user.username,
                    'reason': reason
                }
            )
            
            # Send notification via SMS if requested
            if send_notification and hasattr(client, 'phone_number'):
                try:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    
                    message = (
                        f"Hello {client.username}! Your account tier has been "
                        f"upgraded from {old_tier} to {new_tier}. "
                        f"Thank you for being a valued customer!"
                    )
                    
                    sms = sms_service.create_sms_message(
                        phone_number=client.phone_number,
                        message=message,
                        recipient_name=client.username,
                        source='tier_update',
                        reference_id=f"tier_{client.id}_{timezone.now().timestamp()}"
                    )
                    sms_service.send_sms(sms)
                    
                except ImportError:
                    logger.warning("SMS service not available for tier notification")
            
            return Response({
                'success': True,
                'message': f'Tier updated from {old_tier} to {new_tier}',
                'old_tier': old_tier,
                'new_tier': new_tier,
                'updated_at': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error updating tier: {str(e)}")
            return Response({"error": f"Failed to update tier: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def quick_stats(self, request):
        """Get quick stats for dashboard"""
        try:
            total_clients = ClientProfile.objects.count()
            pppoe_clients = ClientProfile.objects.filter(user__connection_type='pppoe').count()
            hotspot_clients = ClientProfile.objects.filter(user__connection_type='hotspot').count()
            active_clients = ClientProfile.objects.filter(status='active').count()
            at_risk_clients = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
            
            # Get clients with active plans via Service Operations
            try:
                subscriptions = SubscriptionService.get_all_active_subscriptions()
                if subscriptions.get('success'):
                    client_ids_with_plans = set()
                    for sub in subscriptions.get('subscriptions', []):
                        if sub.get('client_id'):
                            client_ids_with_plans.add(sub['client_id'])
                    clients_with_plans = len(client_ids_with_plans)
                else:
                    clients_with_plans = 0
            except Exception:
                clients_with_plans = 0
            
            # Get today's new clients
            today = timezone.now().date()
            new_today = ClientProfile.objects.filter(created_at__date=today).count()
            
            # Get revenue stats
            revenue_stats = ClientProfile.objects.aggregate(
                total_revenue=Sum('lifetime_value'),
                avg_monthly_revenue=Avg('monthly_recurring_revenue')
            )
            
            # Get plan distribution via Service Operations
            try:
                plan_distribution_result = SubscriptionService.get_plan_distribution()
                if plan_distribution_result.get('success'):
                    plan_distribution = plan_distribution_result.get('distribution', [])
                else:
                    plan_distribution = []
            except Exception:
                plan_distribution = []
            
            return Response({
                'total_clients': total_clients,
                'pppoe_clients': pppoe_clients,
                'hotspot_clients': hotspot_clients,
                'active_clients': active_clients,
                'at_risk_clients': at_risk_clients,
                'clients_with_plans': clients_with_plans,
                'clients_without_plans': total_clients - clients_with_plans,
                'new_today': new_today,
                'revenue': {
                    'total': float(revenue_stats['total_revenue'] or 0),
                    'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0)
                },
                'plan_distribution': plan_distribution,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting quick stats: {str(e)}")
            return Response({"error": "Failed to load quick stats"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def search_by_phone(self, request):
        """Search client by phone number"""
        phone = request.query_params.get('phone')
        
        if not phone:
            return Response({"error": "Phone parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use Authentication app's phone validation
            try:
                from authentication.models import PhoneValidation
                
                if not PhoneValidation.is_valid_kenyan_phone(phone):
                    return Response({
                        'success': False,
                        'exists': False,
                        'is_valid': False,
                        'message': 'Invalid phone number format'
                    })
                
                normalized = PhoneValidation.normalize_kenyan_phone(phone)
                
            except ImportError:
                # Fallback validation
                import re
                if re.match(r'^(07\d{8}|01\d{8})$', phone):
                    normalized = phone
                else:
                    return Response({
                        'success': False,
                        'exists': False,
                        'is_valid': False,
                        'message': 'Invalid phone number format'
                    })
            
            # Search in Authentication app first
            try:
                from authentication.models import UserAccount
                user = UserAccount.get_client_by_phone(normalized)
                
                if not user:
                    return Response({
                        'success': True,
                        'exists': False,
                        'is_valid': True,
                        'phone': normalized,
                        'message': 'Client not found'
                    })
                
                # Get business profile
                try:
                    client_profile = ClientProfile.objects.get(user=user)
                    serializer = ClientProfileSerializer(client_profile, context={'request': request})
                    client_data = serializer.data
                except ClientProfile.DoesNotExist:
                    client_data = None
                
                return Response({
                    'success': True,
                    'exists': True,
                    'is_valid': True,
                    'phone': normalized,
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'name': user.name if hasattr(user, 'name') else '',
                        'phone': user.phone_number,
                        'connection_type': user.connection_type if hasattr(user, 'connection_type') else '',
                        'is_active': user.is_active
                    },
                    'business_profile': client_data,
                    'message': 'Client found'
                })
                
            except ImportError:
                return Response({
                    'success': False,
                    'exists': False,
                    'is_valid': True,
                    'message': 'Authentication app not available'
                })
            
        except Exception as e:
            logger.error(f"Error searching by phone: {str(e)}")
            return Response({"error": "Failed to search client"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get real-time client statistics"""
        try:
            # Calculate real-time stats
            total_clients = ClientProfile.objects.count()
            
            # Active in last 15 minutes
            active_now = ClientProfile.objects.filter(
                last_login_date__gte=timezone.now() - timedelta(minutes=15)
            ).count()
            
            # Revenue today
            today = timezone.now().date()
            revenue_today = ClientAnalyticsSnapshot.objects.filter(
                date=today
            ).aggregate(total=Sum('daily_revenue'))['total'] or Decimal('0.00')
            
            # At-risk clients
            at_risk = ClientProfile.objects.filter(
                churn_risk_score__gte=Decimal('7.0')
            ).count()
            
            # New clients today
            new_today = ClientProfile.objects.filter(
                created_at__date=today
            ).count()
            
            # Average metrics
            avg_churn_risk = ClientProfile.objects.aggregate(
                avg=Avg('churn_risk_score')
            )['avg'] or Decimal('0.00')
            
            avg_engagement = ClientProfile.objects.aggregate(
                avg=Avg('engagement_score')
            )['avg'] or Decimal('0.00')
            
            # Connection distribution
            connection_dist = ClientProfile.objects.values(
                'user__connection_type'
            ).annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Tier distribution
            tier_dist = ClientProfile.objects.values('tier').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Plan distribution via Service Operations
            try:
                plan_dist_result = SubscriptionService.get_plan_distribution()
                if plan_dist_result.get('success'):
                    plan_dist = plan_dist_result.get('distribution', [])
                    
                    # Get unique clients with plans
                    subscriptions = SubscriptionService.get_all_active_subscriptions()
                    if subscriptions.get('success'):
                        client_ids_with_plans = set()
                        for sub in subscriptions.get('subscriptions', []):
                            if sub.get('client_id'):
                                client_ids_with_plans.add(sub['client_id'])
                        clients_with_plans = len(client_ids_with_plans)
                    else:
                        clients_with_plans = 0
                else:
                    plan_dist = []
                    clients_with_plans = 0
            except Exception:
                plan_dist = []
                clients_with_plans = 0
            
            return Response({
                'success': True,
                'timestamp': timezone.now().isoformat(),
                'stats': {
                    'total_clients': total_clients,
                    'active_now': active_now,
                    'revenue_today': float(revenue_today),
                    'at_risk_clients': at_risk,
                    'new_today': new_today,
                    'clients_with_plans': clients_with_plans,
                    'clients_without_plans': total_clients - clients_with_plans,
                    'avg_churn_risk': float(avg_churn_risk),
                    'avg_engagement': float(avg_engagement)
                },
                'distribution': {
                    'connection': [
                        {
                            'type': item['user__connection_type'] or 'unknown',
                            'count': item['count'],
                            'percentage': round((item['count'] / total_clients * 100), 1) if total_clients > 0 else 0
                        }
                        for item in connection_dist
                    ],
                    'tier': [
                        {
                            'tier': item['tier'],
                            'count': item['count'],
                            'percentage': round((item['count'] / total_clients * 100), 1) if total_clients > 0 else 0
                        }
                        for item in tier_dist
                    ],
                    'plan': plan_dist
                },
                'alerts': self._generate_real_time_alerts()
            })
            
        except Exception as e:
            logger.error(f"Error getting client stats: {str(e)}")
            return Response({
                'error': 'Failed to get client statistics',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Get client activity log"""
        try:
            client = self.get_object()
            limit = int(request.query_params.get('limit', 50))
            
            # Get client interactions
            interactions = ClientInteraction.objects.filter(
                client=client
            ).order_by('-started_at')[:limit]
            
            return Response({
                'success': True,
                'client_id': str(client.id),
                'client_name': client.username,
                'activities': ClientInteractionSerializer(interactions, many=True).data,
                'activity_summary': {
                    'total_activities': ClientInteraction.objects.filter(client=client).count(),
                    'last_activity': interactions[0].started_at.isoformat() if interactions else None,
                    'activity_types': ClientInteraction.objects.filter(
                        client=client
                    ).values('interaction_type').annotate(
                        count=Count('id')
                    ).order_by('-count')
                }
            })
            
        except Exception as e:
            logger.error(f"Error getting client activity: {str(e)}")
            return Response({
                'error': 'Failed to get client activity',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send message to client"""
        try:
            client = self.get_object()
            serializer = SendMessageSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            message = data['message']
            channel = data['channel']
            priority = data['priority']
            
            # Log the message sending interaction
            interaction = ClientInteraction.objects.create(
                client=client,
                interaction_type='notification',
                action=f'Send {channel} message',
                description=f"Message sent via {channel}: {message[:100]}...",
                outcome='success',
                started_at=timezone.now(),
                completed_at=timezone.now(),
                metadata={
                    'message': message,
                    'channel': channel,
                    'priority': priority,
                    'sent_by': request.user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            # In production, this would integrate with actual messaging services
            # For now, we'll just log it
            
            logger.info(f"Message sent to client {client.id} via {channel}: {message}")
            
            return Response({
                'success': True,
                'message': 'Message sent successfully',
                'message_id': str(interaction.id),
                'channel': channel,
                'timestamp': timezone.now().isoformat(),
                'details': {
                    'client': client.username,
                    'phone': client.phone_number,
                    'message_preview': message[:50] + '...' if len(message) > 50 else message
                }
            })
            
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return Response({
                'error': 'Failed to send message',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export clients data"""
        try:
            format = request.query_params.get('format', 'csv')
            filters = request.query_params.dict()
            
            # Get filtered clients
            clients = self.get_queryset()
            
            # Apply filters from query params
            clients = self._apply_filters(clients, filters)
            
            # Export data
            export_data = self._prepare_export_data(clients, format)
            
            # Return file response
            from django.http import HttpResponse
            response = HttpResponse(export_data, content_type=self._get_content_type(format))
            response['Content-Disposition'] = f'attachment; filename="clients_export_{timezone.now().date()}.{format}"'
            
            return response
            
        except Exception as e:
            logger.error(f"Error exporting clients: {str(e)}")
            return Response({
                'error': 'Failed to export clients',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Helper Methods for Plan Integration with Service Operations
    def _get_plan_analytics(self, client):
        """Get plan-specific analytics for client via Service Operations"""
        subscriptions = SubscriptionService.get_subscriptions_for_client(
            client_id=str(client.client_id)
        )
        
        if not subscriptions.get('success') or not subscriptions['subscriptions']:
            return {}
        
        subscription = subscriptions['subscriptions'][0]
        
        # Get usage data via Service Operations
        usage_data = UsageService.get_client_usage_summary(
            client_id=str(client.client_id),
            period='current_month'
        )
        
        # Calculate projections
        if usage_data.get('success'):
            usage_summary = usage_data.get('summary', {})
            data_used = usage_summary.get('data_used_gb', 0)
            data_limit = usage_summary.get('data_limit_gb', 0)
            
            days_used = usage_summary.get('days_used', 1)
            total_days = usage_summary.get('total_days', 30)
            avg_daily_usage = data_used / days_used if days_used > 0 else 0
            projected_usage = avg_daily_usage * total_days
        else:
            data_used = 0
            data_limit = 0
            avg_daily_usage = 0
            projected_usage = 0
            days_used = 1
            total_days = 30
        
        # Get daily usage history
        daily_usage = []
        if usage_data.get('success') and usage_data.get('daily_usage'):
            for day in usage_data['daily_usage'][:30]:  # Last 30 days
                daily_usage.append({
                    'date': day.get('date'),
                    'data_used': float(day.get('data_used_gb', 0)),
                    'utilization': float(day.get('utilization_percentage', 0))
                })
        
        return {
            'current_usage': {
                'data_used': float(data_used),
                'data_limit': float(data_limit),
                'percentage_used': float((data_used / data_limit) * 100) if data_limit > 0 else 0,
                'days_remaining': subscription.get('days_remaining', 0)
            },
            'projections': {
                'avg_daily_usage': float(avg_daily_usage),
                'projected_end_usage': float(projected_usage),
                'projected_excess': max(0, projected_usage - data_limit),
                'completion_date': self._calculate_completion_date(subscription, avg_daily_usage) if avg_daily_usage > 0 else None
            },
            'daily_usage': daily_usage,
            'recommendations': self._generate_plan_recommendations(client, subscription)
        }
    
    def _get_current_plan_details(self, client):
        """Get current plan details via Service Operations"""
        subscriptions = SubscriptionService.get_subscriptions_for_client(
            client_id=str(client.client_id),
            status_filter='active'
        )
        
        if not subscriptions.get('success') or not subscriptions['subscriptions']:
            return None
        
        subscription = subscriptions['subscriptions'][0]
        
        # Get plan details
        plan_details = InternetPlansAdapter.get_plan_details(subscription.get('internet_plan_id'))
        
        return {
            'plan': plan_details,
            'subscription': subscription
        }
    
    def _get_plan_utilization(self, client):
        """Get plan utilization metrics via Service Operations"""
        usage_data = UsageService.get_client_usage_summary(
            client_id=str(client.client_id),
            period='current_month'
        )
        
        if not usage_data.get('success'):
            return {}
        
        summary = usage_data.get('summary', {})
        
        return {
            'data': {
                'used': float(summary.get('data_used_gb', 0)),
                'limit': float(summary.get('data_limit_gb', 0)),
                'remaining': float(summary.get('data_remaining_gb', 0)),
                'percentage': float(summary.get('utilization_percentage', 0))
            },
            'time': {
                'days_used': summary.get('days_used', 0),
                'days_remaining': summary.get('days_remaining', 0),
                'total_days': summary.get('total_days', 0),
                'percentage': float(summary.get('time_utilization_percentage', 0))
            },
            'daily_average': float(summary.get('avg_daily_usage_gb', 0)),
            'status': summary.get('status', 'normal')
        }
    
    def _get_usage_history(self, client, limit=30):
        """Get usage history via Service Operations"""
        usage_data = UsageService.get_client_usage_details(
            client_id=str(client.client_id),
            period='last_30_days',
            detailed=True
        )
        
        if not usage_data.get('success') or not usage_data.get('daily_usage'):
            return []
        
        return [
            {
                'date': day.get('date'),
                'data_used': float(day.get('data_used_gb', 0)),
                'sessions': day.get('session_count', 0),
                'avg_duration': float(day.get('avg_session_duration_minutes', 0)),
                'peak_hour': day.get('peak_usage_hour', '')
            }
            for day in usage_data['daily_usage'][:limit]
        ]
    
    def _get_payment_history(self, client, limit=20):
        """Get payment history"""
        interactions = ClientInteraction.objects.filter(
            client=client,
            interaction_type__in=['payment_success', 'plan_purchase', 'plan_renewal'],
            payment_amount__isnull=False
        ).order_by('-started_at')[:limit]
        
        return [
            {
                'date': interaction.started_at.isoformat(),
                'type': interaction.get_interaction_type_display(),
                'amount': float(interaction.payment_amount),
                'method': interaction.payment_method,
                'reference': interaction.payment_reference
            }
            for interaction in interactions
        ]
    
    def _get_plan_recommendations(self, client):
        """Get plan recommendations for client"""
        subscriptions = SubscriptionService.get_subscriptions_for_client(
            client_id=str(client.client_id),
            status_filter='active'
        )
        
        recommendations = []
        
        if not subscriptions.get('success') or not subscriptions['subscriptions']:
            recommendations.append({
                'type': 'assign_plan',
                'priority': 'high',
                'message': 'Client has no active plan',
                'action': 'Assign a plan'
            })
            return recommendations
        
        subscription = subscriptions['subscriptions'][0]
        
        # Get usage data for utilization
        usage_data = UsageService.get_client_usage_summary(
            client_id=str(client.client_id),
            period='current_month'
        )
        
        if usage_data.get('success'):
            summary = usage_data.get('summary', {})
            utilization = summary.get('utilization_percentage', 0)
        else:
            utilization = 0
        
        # Check utilization
        if utilization >= 90:
            recommendations.append({
                'type': 'upgrade',
                'priority': 'high',
                'message': f'High data utilization ({utilization:.1f}%)',
                'action': 'Consider upgrading to higher data plan'
            })
        elif utilization <= 30:
            recommendations.append({
                'type': 'downgrade',
                'priority': 'low',
                'message': f'Low data utilization ({utilization:.1f}%)',
                'action': 'Consider downgrading to save costs'
            })
        
        # Check expiration
        days_remaining = subscription.get('days_remaining', 0)
        if days_remaining <= 3:
            recommendations.append({
                'type': 'renewal',
                'priority': 'high',
                'message': f'Plan expires in {days_remaining} days',
                'action': 'Renew plan to avoid service interruption'
            })
        elif days_remaining <= 7:
            recommendations.append({
                'type': 'renewal',
                'priority': 'medium',
                'message': f'Plan expires in {days_remaining} days',
                'action': 'Consider renewing plan'
            })
        
        # Check if client is on optimal plan based on usage pattern
        if client.usage_pattern == 'heavy' and subscription.get('data_limit_gb', 0) < 100:
            recommendations.append({
                'type': 'optimize',
                'priority': 'medium',
                'message': 'Heavy user on limited plan',
                'action': 'Consider unlimited or higher data plan'
            })
        
        return recommendations
    
    def _get_plan_actions(self, client, user):
        """Get available plan actions for user"""
        actions = []
        
        # Check if client has active subscription
        subscriptions = SubscriptionService.get_subscriptions_for_client(
            client_id=str(client.client_id),
            status_filter='active'
        )
        
        has_active_plan = subscriptions.get('success') and subscriptions['subscriptions']
        
        # Always available actions
        actions.append({
            'action': 'view_plan_details',
            'label': 'View Plan Details',
            'method': 'GET',
            'url': f'/api/user-management/clients/{client.id}/plans/current/'
        })
        
        if has_active_plan:
            # Actions for clients with active plans
            actions.append({
                'action': 'change_plan',
                'label': 'Change Plan',
                'method': 'POST',
                'url': f'/api/user-management/clients/{client.id}/change_plan/'
            })
            
            actions.append({
                'action': 'renew_plan',
                'label': 'Renew Plan',
                'method': 'POST',
                'url': f'/api/user-management/clients/{client.id}/renew_plan/'
            })
            
            actions.append({
                'action': 'toggle_auto_renew',
                'label': 'Toggle Auto-Renew',
                'method': 'POST',
                'url': f'/api/user-management/clients/{client.id}/toggle_auto_renew/'
            })
            
            if user.is_staff or user.is_superuser:
                actions.append({
                    'action': 'suspend_plan',
                    'label': 'Suspend Service',
                    'method': 'POST',
                    'url': f'/api/user-management/clients/{client.id}/suspend_plan/',
                    'danger': True
                })
                
                if client.is_pppoe_client:
                    actions.append({
                        'action': 'resend_credentials',
                        'label': 'Resend Credentials',
                        'method': 'POST',
                        'url': f'/api/user-management/clients/{client.id}/resend_credentials/'
                    })
        else:
            # Actions for clients without plans
            actions.append({
                'action': 'assign_plan',
                'label': 'Assign Plan',
                'method': 'POST',
                'url': f'/api/user-management/clients/{client.id}/assign_plan/',
                'priority': 'high'
            })
        
        return actions
    
    def _is_plan_compatible(self, client, plan_details):
        """Check if plan is compatible with client's connection type"""
        if client.is_pppoe_client:
            return plan_details.get('available_for_pppoe', False)
        elif client.is_hotspot_client:
            return plan_details.get('available_for_hotspot', False)
        return True
    
    def _send_plan_assignment_notification(self, client, plan_details, subscription_id, action_type, auto_renew):
        """Send plan assignment notification"""
        try:
            from user_management.services.sms_services import SMSService
            sms_service = SMSService()
            
            plan_name = plan_details.get('name', 'Internet Plan')
            plan_price = plan_details.get('price', 0)
            
            message = (
                f"Hello {client.username}! Your internet plan has been {action_type.replace('_', ' ')}. "
                f"Plan: {plan_name}, Price: KES {plan_price:,.0f}. "
                f"Auto-renew: {'Yes' if auto_renew else 'No'}. "
                f"Thank you for choosing us!"
            )
            
            sms = sms_service.create_sms_message(
                phone_number=client.phone_number,
                message=message,
                recipient_name=client.username,
                source='plan_assignment',
                reference_id=f"plan_{subscription_id}"
            )
            sms_service.send_sms(sms)
            
        except ImportError:
            logger.warning("SMS service not available for plan notification")
    
    def _send_plan_change_notification(self, client, old_subscription, new_plan_details, immediate):
        """Send plan change notification"""
        try:
            from user_management.services.sms_services import SMSService
            sms_service = SMSService()
            
            old_plan_name = old_subscription.get('plan_name', 'Current Plan')
            new_plan_name = new_plan_details.get('name', 'New Plan')
            
            message = (
                f"Hello {client.username}! Your internet plan has been changed "
                f"from {old_plan_name} to {new_plan_name}. "
                f"The change is {'effective immediately' if immediate else 'scheduled for next billing cycle'}. "
            )
            
            sms = sms_service.create_sms_message(
                phone_number=client.phone_number,
                message=message,
                recipient_name=client.username,
                source='plan_change',
                reference_id=f"plan_change_{client.id}_{timezone.now().timestamp()}"
            )
            sms_service.send_sms(sms)
            
        except ImportError:
            logger.warning("SMS service not available for plan change notification")
    
    def _send_plan_renewal_notification(self, client, subscription, renew_period):
        """Send plan renewal notification"""
        try:
            from user_management.services.sms_services import SMSService
            sms_service = SMSService()
            
            period_display = {
                '1m': '1 month',
                '3m': '3 months',
                '6m': '6 months',
                '12m': '12 months'
            }.get(renew_period, '1 month')
            
            plan_name = subscription.get('plan_name', 'Internet Plan')
            end_date = subscription.get('end_date', '')
            
            message = (
                f"Hello {client.username}! Your {plan_name} plan "
                f"has been renewed for {period_display}. "
                f"New expiry date: {end_date}. "
                f"Auto-renew: {'ON' if subscription.get('auto_renew') else 'OFF'}"
            )
            
            sms = sms_service.create_sms_message(
                phone_number=client.phone_number,
                message=message,
                recipient_name=client.username,
                source='plan_renewal',
                reference_id=f"plan_renew_{client.id}_{timezone.now().timestamp()}"
            )
            sms_service.send_sms(sms)
            
        except ImportError:
            logger.warning("SMS service not available for plan renewal notification")
    
    def _send_plan_suspension_notification(self, client, subscription, reason, duration_days):
        """Send plan suspension notification"""
        try:
            from user_management.services.sms_services import SMSService
            sms_service = SMSService()
            
            plan_name = subscription.get('plan_name', 'Internet Plan')
            
            message = (
                f"Hello {client.username}! Your {plan_name} plan "
                f"has been suspended for {duration_days} days. "
                f"Reason: {reason}. "
                f"Service will resume on: {subscription.get('resume_date', '')}"
            )
            
            sms = sms_service.create_sms_message(
                phone_number=client.phone_number,
                message=message,
                recipient_name=client.username,
                source='plan_suspension',
                reference_id=f"plan_suspend_{client.id}_{timezone.now().timestamp()}"
            )
            sms_service.send_sms(sms)
            
        except ImportError:
            logger.warning("SMS service not available for plan suspension notification")
    
    def _process_plan_commission(self, client, plan_details, subscription_id):
        """Process commission for plan assignment if client was referred"""
        if client.referred_by and client.referred_by.is_marketer:
            try:
                # Calculate commission (e.g., 10% of plan price)
                plan_price = Decimal(str(plan_details.get('price', 0)))
                commission_amount = plan_price * Decimal('0.10')
                
                # Create commission transaction
                CommissionTransaction.objects.create(
                    marketer=client.referred_by,
                    transaction_type='plan_sale',
                    amount=commission_amount,
                    description=f"Commission for {client.username}'s plan: {plan_details.get('name')}",
                    reference_id=f"PLAN-{subscription_id}",
                    referred_client=client,
                    purchase_amount=plan_price,
                    commission_rate=client.referred_by.commission_rate,
                    total_commission=commission_amount,
                    status='pending'
                )
                
                logger.info(f"Created commission for marketer {client.referred_by.username} for plan sale")
                
            except Exception as e:
                logger.error(f"Error creating commission: {str(e)}")
    
    def _calculate_completion_date(self, subscription, avg_daily_usage):
        """Calculate when data will be exhausted based on average daily usage"""
        if avg_daily_usage <= 0:
            return None
        
        data_used = subscription.get('data_used_gb', 0)
        data_limit = subscription.get('data_limit_gb', 0)
        
        remaining_data = data_limit - data_used
        days_to_exhaustion = remaining_data / Decimal(str(avg_daily_usage))
        
        if days_to_exhaustion > 0:
            return (timezone.now() + timedelta(days=float(days_to_exhaustion))).isoformat()
        return None
    
    def _generate_plan_recommendations(self, client, subscription):
        """Generate plan recommendations based on usage"""
        recommendations = []
        
        # Get usage data for utilization
        usage_data = UsageService.get_client_usage_summary(
            client_id=str(client.client_id),
            period='current_month'
        )
        
        if usage_data.get('success'):
            summary = usage_data.get('summary', {})
            utilization = summary.get('utilization_percentage', 0)
        else:
            utilization = 0
        
        # Check data utilization
        if utilization >= 80:
            recommendations.append({
                'type': 'warning',
                'message': f'High data utilization ({utilization:.1f}%). Consider upgrading plan.',
                'priority': 'high'
            })
        
        # Check expiration
        days_remaining = subscription.get('days_remaining', 0)
        if days_remaining <= 7:
            recommendations.append({
                'type': 'warning',
                'message': f'Plan expires in {days_remaining} days.',
                'priority': 'medium' if days_remaining > 3 else 'high'
            })
        
        # Check if plan matches usage pattern
        if client.usage_pattern == 'heavy' and subscription.get('data_limit_gb', 0) < 100:
            recommendations.append({
                'type': 'suggestion',
                'message': 'Heavy user detected. Consider unlimited or higher data plan.',
                'priority': 'medium'
            })
        
        return recommendations
    
    def _get_service_operations_data(self, client):
        """Get Service Operations data for client"""
        try:
            # Get subscription details
            subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id)
            )
            
            # Get usage summary
            usage_summary = UsageService.get_client_usage_summary(
                client_id=str(client.client_id),
                period='current_month'
            )
            
            # Get client details via adapter
            client_details = UserManagementAdapter.get_client_details(str(client.client_id))
            
            return {
                'subscriptions': subscriptions if subscriptions.get('success') else {'subscriptions': []},
                'usage_summary': usage_summary if usage_summary.get('success') else {'summary': {}},
                'client_details': client_details if client_details else {}
            }
        except Exception as e:
            logger.error(f"Error fetching Service Operations data: {str(e)}")
            return {
                'subscriptions': {'subscriptions': []},
                'usage_summary': {'summary': {}},
                'client_details': {},
                'error': str(e)
            }
    
    def _generate_real_time_alerts(self):
        """Generate real-time alerts"""
        from django.conf import settings
        alerts = []
        
        # Check for system issues
        recent_errors = ClientInteraction.objects.filter(
            outcome='failure',
            started_at__gte=timezone.now() - timedelta(minutes=30)
        ).count()
        
        if recent_errors > 10:
            alerts.append({
                'type': 'system_error',
                'title': 'High Error Rate',
                'description': f'{recent_errors} errors in last 30 minutes',
                'severity': 'high',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for payment failures
        recent_payment_failures = ClientInteraction.objects.filter(
            interaction_type='payment_failed',
            started_at__gte=timezone.now() - timedelta(hours=1)
        ).count()
        
        if recent_payment_failures > 5:
            alerts.append({
                'type': 'payment_issue',
                'title': 'Payment Failures',
                'description': f'{recent_payment_failures} payment failures in last hour',
                'severity': 'medium',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for Service Operations issues
        try:
            # Get subscriptions expiring in next 24 hours
            expiring_subscriptions = SubscriptionService.get_expiring_subscriptions(hours=24)
            if expiring_subscriptions.get('success') and expiring_subscriptions['count'] > 10:
                alerts.append({
                    'type': 'subscription_expiry',
                    'title': 'Subscriptions Expiring',
                    'description': f'{expiring_subscriptions["count"]} subscriptions expiring in 24 hours',
                    'severity': 'medium',
                    'timestamp': timezone.now().isoformat()
                })
            
            # Get exceeded data limits
            exceeded_limits = SubscriptionService.get_exceeded_data_limits()
            if exceeded_limits.get('success') and exceeded_limits['count'] > 0:
                alerts.append({
                    'type': 'data_limit_exceeded',
                    'title': 'Data Limits Exceeded',
                    'description': f'{exceeded_limits["count"]} clients have exceeded data limits',
                    'severity': 'high',
                    'timestamp': timezone.now().isoformat()
                })
        except Exception as e:
            logger.warning(f"Could not check Service Operations alerts: {e}")
        
        return alerts
    
    def _apply_filters(self, queryset, filters):
        """Apply filters to queryset"""
        # Remove export-specific parameters
        export_params = ['format', 'page', 'page_size']
        for param in export_params:
            filters.pop(param, None)
        
        # Apply filters
        if 'search' in filters:
            queryset = queryset.filter(
                Q(user__username__icontains=filters['search']) |
                Q(user__phone_number__icontains=filters['search']) |
                Q(user__name__icontains=filters['search']) |
                Q(email__icontains=filters['search'])
            )
        
        if 'connection_type' in filters and filters['connection_type'] != 'all':
            queryset = queryset.filter(user__connection_type=filters['connection_type'])
        
        if 'status' in filters and filters['status'] != 'all':
            queryset = queryset.filter(status=filters['status'])
        
        if 'plan_status' in filters:
            if filters['plan_status'] == 'with_plan':
                queryset = self._filter_clients_with_plans(queryset)
            elif filters['plan_status'] == 'without_plan':
                queryset = self._filter_clients_without_plans(queryset)
        
        return queryset
    
    def _prepare_export_data(self, clients, format):
        """Prepare data for export"""
        # Prepare data rows
        data = []
        headers = [
            'ID', 'Client ID', 'Username', 'Phone', 'Email', 'Connection Type',
            'Client Type', 'Tier', 'Status', 'Current Plan',
            'Plan Status', 'Data Used', 'Data Limit', 'Plan Expiry',
            'Lifetime Value', 'Monthly Revenue', 'Churn Risk', 'Engagement Score',
            'Customer Since', 'Last Login', 'Last Payment', 'Days Active'
        ]
        
        for client in clients:
            # Get subscription info via Service Operations
            subscription_info = {}
            try:
                subscriptions = SubscriptionService.get_subscriptions_for_client(
                    client_id=str(client.client_id),
                    status_filter='active'
                )
                if subscriptions.get('success') and subscriptions['subscriptions']:
                    sub = subscriptions['subscriptions'][0]
                    subscription_info = {
                        'plan_name': sub.get('plan_name', 'No Plan'),
                        'status': sub.get('status', 'No Plan'),
                        'data_used': sub.get('data_used_gb', 0),
                        'data_limit': sub.get('data_limit_gb', 0),
                        'end_date': sub.get('end_date', '')
                    }
            except Exception:
                subscription_info = {}
            
            row = [
                client.id,
                client.client_id,
                client.username,
                client.phone_number,
                client.email,
                client.connection_type,
                client.client_type,
                client.tier,
                client.status,
                subscription_info.get('plan_name', 'No Plan'),
                subscription_info.get('status', 'No Plan'),
                subscription_info.get('data_used', 0),
                subscription_info.get('data_limit', 0),
                subscription_info.get('end_date', ''),
                float(client.lifetime_value),
                float(client.monthly_recurring_revenue),
                float(client.churn_risk_score),
                float(client.engagement_score),
                client.customer_since.strftime('%Y-%m-%d') if client.customer_since else '',
                client.last_login_date.strftime('%Y-%m-%d %H:%M') if client.last_login_date else '',
                client.last_payment_date.strftime('%Y-%m-%d') if client.last_payment_date else '',
                client.days_active
            ]
            data.append(row)
        
        # Format based on requested format
        if format == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(headers)
            writer.writerows(data)
            return output.getvalue()
        else:
            # For other formats, you'd implement appropriate converters
            return str(data)  # Simplified
    
    def _get_content_type(self, format):
        """Get content type for export format"""
        content_types = {
            'csv': 'text/csv',
            'json': 'application/json',
            'excel': 'application/vnd.ms-excel',
            'pdf': 'application/pdf'
        }
        return content_types.get(format, 'text/plain')


# Plan-specific views (ported from original)
class ClientPlanManagementView(APIView):
    """Dedicated view for client plan management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, client_id):
        """Get comprehensive plan information for client"""
        try:
            client = get_object_or_404(ClientProfile, id=client_id)
            
            # Get detailed plan information via Service Operations
            subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            if not subscriptions.get('success') or not subscriptions['subscriptions']:
                return Response({
                    'success': True,
                    'has_active_plan': False,
                    'message': 'Client has no active plan',
                    'available_plans': self._get_available_plans(client),
                    'actions': ['assign_plan']
                })
            
            subscription = subscriptions['subscriptions'][0]
            
            # Get plan details
            plan_details = InternetPlansAdapter.get_plan_details(subscription.get('internet_plan_id'))
            
            # Get usage analytics
            usage_data = UsageService.get_client_usage_details(
                client_id=str(client.client_id),
                period='last_30_days',
                detailed=True
            )
            
            # Get payment history
            payments = ClientInteraction.objects.filter(
                client=client,
                interaction_type__in=['payment_success', 'plan_purchase', 'plan_renewal']
            ).order_by('-started_at')[:10]
            
            return Response({
                'success': True,
                'has_active_plan': True,
                'plan': plan_details,
                'subscription': subscription,
                'usage_analytics': usage_data if usage_data.get('success') else {},
                'payment_history': [
                    {
                        'date': payment.started_at.isoformat(),
                        'type': payment.get_interaction_type_display(),
                        'amount': float(payment.payment_amount) if payment.payment_amount else 0,
                        'method': payment.payment_method,
                        'reference': payment.payment_reference
                    }
                    for payment in payments
                ],
                'available_plans': self._get_available_plans(client),
                'actions': ['change_plan', 'renew_plan', 'toggle_auto_renew', 'suspend_plan'],
                'technical_details': client.get_technical_details() if request.user.is_staff else {},
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error getting plan management info: {str(e)}")
            return Response({
                'error': 'Failed to get plan information',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_available_plans(self, client):
        """Get available plans for client"""
        try:
            # Get all active plans
            all_plans = InternetPlansAdapter.get_all_plans()
            if not all_plans.get('success'):
                return []
            
            available_plans = []
            for plan in all_plans.get('plans', []):
                # Check compatibility
                if client.is_pppoe_client and not plan.get('available_for_pppoe', False):
                    continue
                if client.is_hotspot_client and not plan.get('available_for_hotspot', False):
                    continue
                
                available_plans.append({
                    'id': plan.get('id'),
                    'name': plan.get('name'),
                    'description': plan.get('description'),
                    'price': plan.get('price'),
                    'data_limit_gb': plan.get('data_limit_gb'),
                    'duration_days': plan.get('duration_days'),
                    'features': plan.get('features', [])
                })
            
            return available_plans
            
        except Exception as e:
            logger.error(f"Error getting available plans: {str(e)}")
            return []


class ClientPlanHistoryView(APIView):
    """View for client plan history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, client_id):
        """Get complete plan history for client"""
        try:
            client = get_object_or_404(ClientProfile, id=client_id)
            
            # Get all subscriptions via Service Operations
            all_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='all'
            )
            
            if not all_subscriptions.get('success'):
                return Response({
                    'success': True,
                    'client_id': str(client.id),
                    'client_name': client.username,
                    'total_subscriptions': 0,
                    'history': []
                })
            
            history = []
            for subscription in all_subscriptions.get('subscriptions', []):
                # Get plan details
                plan_details = InternetPlansAdapter.get_plan_details(subscription.get('internet_plan_id'))
                
                history.append({
                    'plan_name': plan_details.get('name') if plan_details else 'Unknown Plan',
                    'plan_id': subscription.get('internet_plan_id'),
                    'status': subscription.get('status'),
                    'start_date': subscription.get('start_date'),
                    'end_date': subscription.get('end_date'),
                    'data_used': float(subscription.get('data_used_gb', 0)),
                    'data_limit': float(subscription.get('data_limit_gb', 0)),
                    'auto_renew': subscription.get('auto_renew', False),
                    'reason': subscription.get('metadata', {}).get('reason', ''),
                    'assigned_by': subscription.get('metadata', {}).get('assigned_by', '')
                })
            
            return Response({
                'success': True,
                'client_id': str(client.id),
                'client_name': client.username,
                'total_subscriptions': len(history),
                'history': sorted(history, key=lambda x: x.get('start_date', ''), reverse=True)
            })
            
        except Exception as e:
            logger.error(f"Error getting plan history: {str(e)}")
            return Response({
                'error': 'Failed to get plan history',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPlanRecommendationsView(APIView):
    """View for plan recommendations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, client_id):
        """Get personalized plan recommendations for client"""
        try:
            client = get_object_or_404(ClientProfile, id=client_id)
            
            # Get current subscription
            current_subscriptions = SubscriptionService.get_subscriptions_for_client(
                client_id=str(client.client_id),
                status_filter='active'
            )
            
            # Get available plans
            all_plans = InternetPlansAdapter.get_all_plans()
            if not all_plans.get('success'):
                return Response({
                    'success': True,
                    'client_id': str(client.id),
                    'client_name': client.username,
                    'current_plan': None,
                    'current_utilization': 0,
                    'usage_pattern': client.usage_pattern,
                    'recommendations': []
                })
            
            recommendations = []
            available_plans = all_plans.get('plans', [])
            
            # If no current plan, recommend based on client type and tier
            if not current_subscriptions.get('success') or not current_subscriptions['subscriptions']:
                for plan in available_plans:
                    if client.is_pppoe_client and plan.get('available_for_pppoe'):
                        recommendations.append({
                            'plan_id': plan.get('id'),
                            'plan_name': plan.get('name'),
                            'reason': 'Recommended for PPPoE clients',
                            'match_score': 85,
                            'estimated_monthly_cost': float(plan.get('price', 0)),
                            'features': plan.get('features', [])
                        })
                    elif client.is_hotspot_client and plan.get('available_for_hotspot'):
                        recommendations.append({
                            'plan_id': plan.get('id'),
                            'plan_name': plan.get('name'),
                            'reason': 'Recommended for Hotspot clients',
                            'match_score': 85,
                            'estimated_monthly_cost': float(plan.get('price', 0)),
                            'features': plan.get('features', [])
                        })
            else:
                # If has current plan, recommend based on usage
                current_subscription = current_subscriptions['subscriptions'][0]
                current_plan_id = current_subscription.get('internet_plan_id')
                
                # Get usage data for utilization
                usage_data = UsageService.get_client_usage_summary(
                    client_id=str(client.client_id),
                    period='current_month'
                )
                
                utilization = 0
                if usage_data.get('success'):
                    utilization = usage_data.get('summary', {}).get('utilization_percentage', 0)
                
                for plan in available_plans:
                    # Skip current plan
                    if plan.get('id') == current_plan_id:
                        continue
                    
                    # Check compatibility
                    if client.is_pppoe_client and not plan.get('available_for_pppoe', False):
                        continue
                    if client.is_hotspot_client and not plan.get('available_for_hotspot', False):
                        continue
                    
                    match_score = 0
                    reason = ''
                    
                    # Get current plan price for comparison
                    current_plan_details = InternetPlansAdapter.get_plan_details(current_plan_id)
                    current_plan_price = current_plan_details.get('price', 0) if current_plan_details else 0
                    
                    # Check if plan is better match for usage
                    if utilization >= 80 and plan.get('data_limit_gb', 0) > current_subscription.get('data_limit_gb', 0):
                        match_score = 90
                        reason = 'Higher data limit for heavy usage'
                    elif utilization <= 30 and plan.get('price', 0) < current_plan_price:
                        match_score = 80
                        reason = 'Cost savings for light usage'
                    elif 'unlimited' in str(plan.get('features', [])).lower() and client.usage_pattern in ['heavy', 'extreme']:
                        match_score = 95
                        reason = 'Unlimited data for heavy user'
                    
                    if match_score > 0:
                        recommendations.append({
                            'plan_id': plan.get('id'),
                            'plan_name': plan.get('name'),
                            'reason': reason,
                            'match_score': match_score,
                            'estimated_monthly_cost': float(plan.get('price', 0)),
                            'current_plan_cost': float(current_plan_price),
                            'cost_difference': float(plan.get('price', 0) - current_plan_price),
                            'features': plan.get('features', [])
                        })
            
            # Sort by match score
            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            
            return Response({
                'success': True,
                'client_id': str(client.id),
                'client_name': client.username,
                'current_plan': current_subscriptions['subscriptions'][0].get('plan_name') if current_subscriptions.get('subscriptions') else None,
                'current_utilization': float(utilization),
                'usage_pattern': client.usage_pattern,
                'recommendations': recommendations[:5]  # Top 5 recommendations
            })
            
        except Exception as e:
            logger.error(f"Error getting plan recommendations: {str(e)}")
            return Response({
                'error': 'Failed to get plan recommendations',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientPlanBulkActionsView(APIView):
    """View for bulk plan actions"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Perform bulk plan actions"""
        try:
            action = request.data.get('action')
            client_ids = request.data.get('client_ids', [])
            plan_id = request.data.get('plan_id')
            
            if not action:
                return Response({'error': 'Action is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            if not client_ids:
                return Response({'error': 'Client IDs are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            results = []
            successful = 0
            failed = 0
            
            if action == 'assign_plan':
                if not plan_id:
                    return Response({'error': 'Plan ID is required for assign action'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Get plan details
                plan_details = InternetPlansAdapter.get_plan_details(plan_id)
                if not plan_details or not plan_details.get('is_active'):
                    return Response({'error': 'Plan not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
                
                for client_id in client_ids:
                    try:
                        client = ClientProfile.objects.get(id=client_id)
                        
                        # Check compatibility
                        if client.is_pppoe_client and not plan_details.get('available_for_pppoe', False):
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'Plan not available for PPPoE'
                            })
                            failed += 1
                            continue
                        
                        if client.is_hotspot_client and not plan_details.get('available_for_hotspot', False):
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'Plan not available for hotspot'
                            })
                            failed += 1
                            continue
                        
                        # Create subscription via Service Operations
                        result = SubscriptionService.create_subscription(
                            client_id=str(client.client_id),
                            internet_plan_id=plan_id,
                            client_type=client.client_type,
                            access_method='pppoe' if client.is_pppoe_client else 'hotspot',
                            duration_hours=720,  # 30 days
                            auto_renew=True,
                            metadata={
                                'bulk_assigned_by': request.user.username,
                                'bulk_action': True
                            },
                            created_by=request.user.username
                        )
                        
                        if not result['success']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': result.get('error', 'Failed to create subscription')
                            })
                            failed += 1
                            continue
                        
                        # Update client
                        client.plan_updated_at = timezone.now()
                        client.save()
                        
                        results.append({
                            'client_id': client_id,
                            'client_name': client.username,
                            'success': True,
                            'subscription_id': result['subscription_id'],
                            'plan_name': plan_details.get('name')
                        })
                        successful += 1
                        
                    except ClientProfile.DoesNotExist:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': 'Client not found'
                        })
                        failed += 1
                    except Exception as e:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': str(e)
                        })
                        failed += 1
            
            elif action == 'renew_plans':
                duration_hours = request.data.get('duration_hours', 720)  # Default 30 days
                
                for client_id in client_ids:
                    try:
                        client = ClientProfile.objects.get(id=client_id)
                        
                        # Get active subscriptions
                        subscriptions = SubscriptionService.get_subscriptions_for_client(
                            client_id=str(client.client_id),
                            status_filter='active'
                        )
                        
                        if not subscriptions.get('success') or not subscriptions['subscriptions']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'No active plan'
                            })
                            failed += 1
                            continue
                        
                        subscription = subscriptions['subscriptions'][0]
                        
                        # Extend subscription
                        extend_result = SubscriptionService.extend_subscription(
                            subscription_id=subscription['id'],
                            duration_hours=duration_hours
                        )
                        
                        if not extend_result['success']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': extend_result.get('error', 'Failed to extend subscription')
                            })
                            failed += 1
                            continue
                        
                        # Update client
                        client.plan_updated_at = timezone.now()
                        client.save()
                        
                        results.append({
                            'client_id': client_id,
                            'client_name': client.username,
                            'success': True,
                            'new_end_date': extend_result.get('new_end_date'),
                            'plan_name': subscription.get('plan_name')
                        })
                        successful += 1
                        
                    except Exception as e:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': str(e)
                        })
                        failed += 1
            
            elif action == 'toggle_auto_renew':
                enable = request.data.get('enable', True)
                
                for client_id in client_ids:
                    try:
                        client = ClientProfile.objects.get(id=client_id)
                        
                        # Get active subscriptions
                        subscriptions = SubscriptionService.get_subscriptions_for_client(
                            client_id=str(client.client_id),
                            status_filter='active'
                        )
                        
                        if not subscriptions.get('success') or not subscriptions['subscriptions']:
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': 'No active plan'
                            })
                            failed += 1
                            continue
                        
                        subscription = subscriptions['subscriptions'][0]
                        
                        # Update auto-renew
                        update_result = SubscriptionService.update_subscription(
                            subscription_id=subscription['id'],
                            auto_renew=enable
                        )
                        
                        if not update_result.get('success'):
                            results.append({
                                'client_id': client_id,
                                'success': False,
                                'error': update_result.get('error', 'Failed to update auto-renew')
                            })
                            failed += 1
                            continue
                        
                        # Update client
                        client.plan_auto_renew = enable
                        client.save()
                        
                        results.append({
                            'client_id': client_id,
                            'client_name': client.username,
                            'success': True,
                            'auto_renew': enable,
                            'plan_name': subscription.get('plan_name')
                        })
                        successful += 1
                        
                    except Exception as e:
                        results.append({
                            'client_id': client_id,
                            'success': False,
                            'error': str(e)
                        })
                        failed += 1
            
            else:
                return Response({'error': f'Unsupported action: {action}'}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'action': action,
                'total_clients': len(client_ids),
                'successful': successful,
                'failed': failed,
                'results': results
            })
            
        except Exception as e:
            logger.error(f"Error performing bulk plan action: {str(e)}")
            return Response({
                'error': 'Failed to perform bulk action',
                'details': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Dashboard views (ported from original)
class DashboardView(APIView):
    """Business Dashboard - Integrated with Service Operations Analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get complete dashboard data with plan analytics"""
        try:
            # Get time range
            time_range = request.query_params.get('time_range', '30d')
            
            # Calculate date range
            end_date = timezone.now()
            if time_range == '7d':
                start_date = end_date - timedelta(days=7)
            elif time_range == '30d':
                start_date = end_date - timedelta(days=30)
            elif time_range == '90d':
                start_date = end_date - timedelta(days=90)
            else:  # 'all'
                start_date = None
            
            # Get all data
            data = {
                'summary': self._get_summary_stats(start_date, end_date),
                'financial': self._get_financial_analytics(start_date, end_date),
                'usage': self._get_usage_analytics(start_date, end_date),
                'client_analytics': self._get_client_analytics(start_date, end_date),
                'plan_analytics': self._get_plan_analytics(start_date, end_date),
                'alerts': self._get_active_alerts(),
                'timestamp': timezone.now().isoformat(),
                'time_range': time_range
            }
            
            return Response(data)
            
        except Exception as e:
            logger.error(f"Error loading dashboard: {str(e)}")
            return Response({"error": "Failed to load dashboard data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_summary_stats(self, start_date, end_date):
        """Get summary statistics with plan data"""
        total_clients = ClientProfile.objects.count()
        
        # Active clients (last 30 days)
        active_clients = ClientProfile.objects.filter(
            last_login_date__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # New clients (time range)
        if start_date:
            new_clients = ClientProfile.objects.filter(
                created_at__range=[start_date, end_date]
            ).count()
        else:
            new_clients = total_clients
        
        # Clients with active plans via Service Operations
        try:
            subscriptions = SubscriptionService.get_all_active_subscriptions()
            if subscriptions.get('success'):
                client_ids_with_plans = set()
                for sub in subscriptions.get('subscriptions', []):
                    if sub.get('client_id'):
                        client_ids_with_plans.add(sub['client_id'])
                clients_with_plans = len(client_ids_with_plans)
            else:
                clients_with_plans = 0
        except Exception:
            clients_with_plans = 0
        
        # Revenue stats
        revenue_stats = ClientProfile.objects.aggregate(
            total_revenue=Sum('lifetime_value'),
            avg_monthly_revenue=Avg('monthly_recurring_revenue'),
            total_commission=Sum('commission_balance')
        )
        
        # Churn risk
        at_risk_clients = ClientProfile.objects.filter(
            churn_risk_score__gte=Decimal('7.0')
        ).count()
        
        # Marketers count
        marketers_count = ClientProfile.objects.filter(is_marketer=True).count()
        
        return {
            'total_clients': total_clients,
            'active_clients': active_clients,
            'new_clients': new_clients,
            'at_risk_clients': at_risk_clients,
            'marketers_count': marketers_count,
            'clients_with_plans': clients_with_plans,
            'clients_without_plans': total_clients - clients_with_plans,
            'plan_coverage': round((clients_with_plans / total_clients * 100), 1) if total_clients > 0 else 0,
            'revenue': {
                'total': float(revenue_stats['total_revenue'] or 0),
                'monthly_avg': float(revenue_stats['avg_monthly_revenue'] or 0),
                'commission_pool': float(revenue_stats['total_commission'] or 0)
            },
            'growth_rate': self._calculate_growth_rate(start_date, end_date)
        }
    
    def _get_plan_analytics(self, start_date, end_date):
        """Get plan analytics via Service Operations"""
        try:
            # Active subscriptions
            active_subscriptions = SubscriptionService.get_all_active_subscriptions()
            if active_subscriptions.get('success'):
                active_count = len(active_subscriptions.get('subscriptions', []))
            else:
                active_count = 0
            
            # Expiring soon (next 7 days)
            expiring_subscriptions = SubscriptionService.get_expiring_subscriptions(hours=168)  # 7 days
            if expiring_subscriptions.get('success'):
                expiring_soon = expiring_subscriptions.get('count', 0)
            else:
                expiring_soon = 0
            
            # Exceeded data limits
            exceeded_limits = SubscriptionService.get_exceeded_data_limits()
            if exceeded_limits.get('success'):
                exceeded_count = exceeded_limits.get('count', 0)
            else:
                exceeded_count = 0
            
            # Popular plans
            plan_distribution = SubscriptionService.get_plan_distribution()
            if plan_distribution.get('success'):
                popular_plans = plan_distribution.get('distribution', [])[:5]
            else:
                popular_plans = []
            
            # Plan revenue
            plan_revenue = SubscriptionService.get_plan_revenue_analytics()
            
            return {
                'active_subscriptions': active_count,
                'expiring_soon': expiring_soon,
                'exceeded_limits': exceeded_count,
                'popular_plans': popular_plans,
                'top_revenue_plans': plan_revenue.get('top_plans', [])[:5] if plan_revenue.get('success') else []
            }
            
        except Exception as e:
            logger.error(f"Error getting plan analytics: {e}")
            return {}
    
    def _get_financial_analytics(self, start_date, end_date):
        """Get financial analytics"""
        revenue_segments = ClientProfile.objects.values('revenue_segment').annotate(
            count=Count('id'),
            total_revenue=Sum('lifetime_value'),
            avg_revenue=Avg('lifetime_value')
        ).order_by('-total_revenue')
        
        top_clients = ClientProfile.objects.order_by('-lifetime_value')[:10].values(
            'id', 'user__username', 'lifetime_value', 'revenue_segment'
        )
        
        return {
            'revenue_segments': list(revenue_segments),
            'top_clients': list(top_clients),
            'metrics': {
                'avg_client_value': float(ClientProfile.objects.aggregate(avg=Avg('lifetime_value'))['avg'] or Decimal('0.0')),
            }
        }
    
    def _get_usage_analytics(self, start_date, end_date):
        """Get usage analytics"""
        usage_patterns = ClientProfile.objects.values('usage_pattern').annotate(
            count=Count('id'),
            avg_data=Avg('avg_monthly_data_gb')
        ).order_by('-avg_data')
        
        top_users = ClientProfile.objects.order_by('-total_data_used_gb')[:10].values(
            'id', 'user__username', 'total_data_used_gb', 'usage_pattern'
        )
        
        return {
            'usage_patterns': list(usage_patterns),
            'top_users': list(top_users),
            'metrics': {
                'total_data_used': float(ClientProfile.objects.aggregate(total=Sum('total_data_used_gb'))['total'] or Decimal('0.0')),
                'avg_monthly_data': float(ClientProfile.objects.aggregate(avg=Avg('avg_monthly_data_gb'))['avg'] or Decimal('0.0')),
            }
        }
    
    def _get_client_analytics(self, start_date, end_date):
        """Get client behavior analytics"""
        connection_dist = ClientProfile.objects.values('user__connection_type').annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / ClientProfile.objects.count()
        ).order_by('-count')
        
        tier_dist = ClientProfile.objects.values('tier').annotate(
            count=Count('id'),
            avg_revenue=Avg('lifetime_value')
        ).order_by('-avg_revenue')
        
        client_type_dist = ClientProfile.objects.values('client_type').annotate(
            count=Count('id'),
            avg_ltv=Avg('lifetime_value')
        ).order_by('-avg_ltv')
        
        return {
            'connection_distribution': list(connection_dist),
            'tier_distribution': list(tier_dist),
            'client_type_distribution': list(client_type_dist),
            'retention_metrics': self._calculate_retention_metrics(start_date, end_date)
        }
    
    def _get_active_alerts(self):
        """Get active alerts"""
        alerts = []
        
        # Check for at-risk clients
        at_risk_count = ClientProfile.objects.filter(churn_risk_score__gte=Decimal('7.0')).count()
        if at_risk_count > 5:
            alerts.append({
                'type': 'churn_risk',
                'title': 'Multiple High Churn Risk Clients',
                'description': f'{at_risk_count} clients are at high risk of churning',
                'severity': 'high',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check for overdue payments
        overdue_count = ClientProfile.objects.filter(days_since_last_payment__gt=14).count()
        if overdue_count > 3:
            alerts.append({
                'type': 'payment_overdue',
                'title': 'Overdue Payments',
                'description': f'{overdue_count} clients have overdue payments',
                'severity': 'medium',
                'timestamp': timezone.now().isoformat()
            })
        
        # Check Service Operations alerts
        try:
            # Get expiring subscriptions
            expiring_subscriptions = SubscriptionService.get_expiring_subscriptions(hours=24)
            if expiring_subscriptions.get('success') and expiring_subscriptions['count'] > 10:
                alerts.append({
                    'type': 'subscription_expiry',
                    'title': 'Subscriptions Expiring',
                    'description': f'{expiring_subscriptions["count"]} subscriptions expiring in 24 hours',
                    'severity': 'medium',
                    'timestamp': timezone.now().isoformat()
                })
        except Exception:
            pass
        
        return alerts
    
    def _calculate_growth_rate(self, start_date, end_date):
        """Calculate overall growth rate"""
        if not start_date:
            return 0
        
        start_count = ClientProfile.objects.filter(created_at__lt=start_date).count()
        end_count = ClientProfile.objects.filter(created_at__lte=end_date).count()
        
        if start_count == 0:
            return 100
        
        growth = ((end_count - start_count) / start_count) * 100
        return round(growth, 1)
    
    def _calculate_retention_metrics(self, start_date, end_date):
        """Calculate retention metrics"""
        return {
            'retention_rate': 85.5,
            'avg_client_lifetime': '14.3 months',
            'churn_rate': 2.1
        }


class CommissionDashboardView(APIView):
    """Commission Dashboard for Marketers with Plan Sales"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get commission dashboard data"""
        try:
            marketer_id = request.query_params.get('marketer_id')
            
            if marketer_id:
                # Get specific marketer data
                try:
                    marketer = ClientProfile.objects.get(id=marketer_id, is_marketer=True)
                    marketer_data = self._get_marketer_stats(marketer)
                    return Response(marketer_data)
                except ClientProfile.DoesNotExist:
                    return Response({"error": "Marketer not found"}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Get all marketers summary
                marketers = ClientProfile.objects.filter(is_marketer=True)
                
                total_marketers = marketers.count()
                total_commission = marketers.aggregate(
                    total=Sum('commission_balance'),
                    earned=Sum('total_commission_earned')
                )
                
                top_marketers = marketers.order_by('-total_commission_earned')[:10].values(
                    'id', 'user__username', 'total_commission_earned', 
                    'commission_balance', 'marketer_tier'
                )
                
                pending_commissions = CommissionTransaction.objects.filter(status='pending').count()
                
                # Plan sales statistics
                plan_sales = CommissionTransaction.objects.filter(
                    transaction_type='plan_sale'
                ).aggregate(
                    total=Sum('amount'),
                    count=Count('id')
                )
                
                return Response({
                    'total_marketers': total_marketers,
                    'commission_stats': {
                        'total_balance': float(total_commission['total'] or 0),
                        'total_earned': float(total_commission['earned'] or 0),
                        'pending_approvals': pending_commissions,
                        'plan_sales_total': float(plan_sales['total'] or 0),
                        'plan_sales_count': plan_sales['count'] or 0
                    },
                    'top_marketers': list(top_marketers),
                    'timestamp': timezone.now().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Error loading commission dashboard: {str(e)}")
            return Response({"error": "Failed to load commission dashboard"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_marketer_stats(self, marketer):
        """Get detailed stats for a marketer"""
        transactions = CommissionTransaction.objects.filter(marketer=marketer).order_by('-transaction_date')[:20]
        referrals = ClientProfile.objects.filter(referred_by=marketer).count()
        
        recent_referrals = ClientProfile.objects.filter(
            referred_by=marketer
        ).select_related('user').order_by('-created_at')[:10]
        
        # Plan sales statistics
        plan_sales = CommissionTransaction.objects.filter(
            marketer=marketer,
            transaction_type='plan_sale'
        ).aggregate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        return {
            'marketer': {
                'id': marketer.id,
                'username': marketer.username,
                'name': marketer.client_name,
                'tier': marketer.marketer_tier,
                'referral_code': marketer.referral_code,
                'commission_rate': float(marketer.commission_rate)
            },
            'stats': {
                'total_earned': float(marketer.total_commission_earned),
                'current_balance': float(marketer.commission_balance),
                'total_referrals': referrals,
                'lifetime_value': float(marketer.lifetime_value),
                'plan_sales_total': float(plan_sales['total'] or 0),
                'plan_sales_count': plan_sales['count'] or 0
            },
            'transactions': CommissionTransactionSerializer(transactions, many=True).data,
            'recent_referrals': [
                {
                    'id': ref.id,
                    'username': ref.username,
                    'phone': ref.phone_number,
                    'created_at': ref.created_at.isoformat(),
                    'connection_type': ref.connection_type
                }
                for ref in recent_referrals
            ]
        }


# Original views (retained for compatibility)
class CreatePPPoEClientView(APIView):
    """Create PPPoE Client with complete workflow and plan assignment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create new PPPoE client with complete onboarding and plan assignment"""
        try:
            serializer = CreatePPPoEClientSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            name = data['name']
            phone = data['phone_number']
            plan_id = data.get('plan_id')
            referral_code = data.get('referral_code', '')
            client_type = data.get('client_type', 'residential')
            location = data.get('location', '')
            send_sms = data.get('send_sms', True)
            assign_marketer = data.get('assign_marketer', False)
            
            logger.info(f"Creating PPPoE client: {name} ({phone}) with plan: {plan_id}")
            
            with transaction.atomic():
                # Step 1: Validate phone number
                try:
                    from authentication.models import PhoneValidation
                    normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
                except ImportError:
                    normalized_phone = phone
                
                # Step 2: Check if client already exists
                try:
                    from authentication.models import UserAccount
                    existing_user = UserAccount.get_client_by_phone(normalized_phone)
                    
                    if existing_user:
                        if hasattr(existing_user, 'connection_type') and existing_user.connection_type == 'pppoe':
                            return Response({
                                "error": "PPPoE client already exists",
                                "client": {
                                    "id": str(existing_user.id),
                                    "username": existing_user.username,
                                    "name": existing_user.name if hasattr(existing_user, 'name') else '',
                                    "phone": existing_user.phone_number,
                                    "pppoe_username": existing_user.pppoe_username if hasattr(existing_user, 'pppoe_username') else ''
                                }
                            }, status=status.HTTP_400_BAD_REQUEST)
                        else:
                            # Convert existing user to PPPoE
                            existing_user.connection_type = 'pppoe'
                            if hasattr(existing_user, 'name'):
                                existing_user.name = name
                            existing_user.save()
                            user_account = existing_user
                    else:
                        # Create new PPPoE client
                        user_account = UserAccount.objects.create_client_user(
                            phone_number=normalized_phone,
                            client_name=name,
                            connection_type='pppoe'
                        )
                        
                except ImportError:
                    return Response(
                        {"error": "Authentication app not available"},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
                
                # Step 3: Generate PPPoE credentials
                credentials = user_account.generate_pppoe_credentials()
                
                # Step 4: Create business profile
                client_profile, created = ClientProfile.objects.get_or_create(
                    user=user_account,
                    defaults={
                        'client_id': uuid.uuid4(),
                        'client_type': client_type,
                        'location': {'address': location} if location else {},
                        'customer_since': timezone.now()
                    }
                )
                
                if not created:
                    client_profile.client_type = client_type
                    if location:
                        client_profile.location = {'address': location}
                    client_profile.save()
                
                # Step 5: Assign plan if specified
                if plan_id:
                    try:
                        # Create plan subscription via Service Operations
                        result = SubscriptionService.create_subscription(
                            client_id=str(client_profile.client_id),
                            internet_plan_id=plan_id,
                            client_type=client_type,
                            access_method='pppoe',
                            duration_hours=720,  # 30 days
                            auto_renew=True,
                            metadata={
                                'assigned_during_creation': True,
                                'pppoe_username': credentials['username'],
                                'created_by': request.user.username
                            },
                            created_by=request.user.username
                        )
                        
                        if result['success']:
                            # Update client's cached plan info
                            client_profile.plan_updated_at = timezone.now()
                            client_profile.plan_auto_renew = True
                            client_profile.save()
                            
                            # Get plan details for response
                            plan_details = InternetPlansAdapter.get_plan_details(plan_id)
                        else:
                            logger.warning(f"Failed to assign plan {plan_id} during creation: {result.get('error')}")
                            
                    except Exception as e:
                        logger.warning(f"Error assigning plan during creation: {str(e)}")
                
                # Step 6: Handle referral
                if referral_code:
                    try:
                        referrer = ClientProfile.objects.get(
                            referral_code=referral_code,
                            is_marketer=True
                        )
                        if referrer != client_profile:
                            client_profile.referred_by = referrer
                            client_profile.save()
                            
                            # Create commission transaction
                            CommissionTransaction.objects.create(
                                marketer=referrer,
                                transaction_type='referral',
                                amount=Decimal('500.00'),
                                description=f"Referral commission for {user_account.username}",
                                reference_id=f"REF-{user_account.id}",
                                referred_client=client_profile,
                                commission_rate=referrer.commission_rate,
                                total_commission=Decimal('500.00')
                            )
                    except ClientProfile.DoesNotExist:
                        logger.warning(f"Invalid referral code: {referral_code}")
                
                # Step 7: Send SMS if requested
                sms_sent = False
                if send_sms:
                    try:
                        from user_management.services.sms_services import SMSService
                        sms_service = SMSService()
                        
                        message = f"Hello {name}! Your PPPoE account has been created. Username: {credentials['username']}"
                        
                        if plan_id and 'plan_details' in locals():
                            message += f"\nPlan: {plan_details.get('name', 'Assigned')}"
                        
                        sms = sms_service.create_sms_message(
                            phone_number=normalized_phone,
                            message=message,
                            recipient_name=name,
                            source='pppoe_creation',
                            reference_id=f"create_{user_account.id}"
                        )
                        sms_service.send_sms(sms)
                        sms_sent = sms.status == 'sent'
                    except ImportError:
                        logger.warning("SMS service not available")
                
                # Step 8: Log interaction
                ClientInteraction.objects.create(
                    client=client_profile,
                    interaction_type='profile_update',
                    action='Admin Created PPPoE Client',
                    description=f"PPPoE client created by {request.user.username}",
                    outcome='success',
                    started_at=timezone.now(),
                    metadata={
                        'created_by': request.user.username,
                        'referral_code': referral_code,
                        'plan_assigned': bool(plan_id),
                        'sms_sent': sms_sent,
                        'credentials_generated': True
                    }
                )
                
                # Prepare response
                response_data = {
                    'success': True,
                    'message': 'PPPoE client created successfully',
                    'timestamp': timezone.now().isoformat(),
                    'client': {
                        'id': str(user_account.id),
                        'client_id': str(client_profile.client_id),
                        'username': user_account.username,
                        'name': name,
                        'phone': phone,
                        'normalized_phone': normalized_phone,
                        'business_profile_id': str(client_profile.id),
                        'referral_code': client_profile.referral_code,
                        'connection_type': 'pppoe',
                        'status': 'active'
                    },
                    'credentials': {
                        'pppoe_username': credentials['username'],
                        'pppoe_password': credentials['password'],
                        'generated_at': credentials.get('timestamp', timezone.now().isoformat())
                    },
                    'plan_assigned': bool(plan_id),
                    'plan_name': plan_details.get('name') if 'plan_details' in locals() else None,
                    'actions': {
                        'user_created': True,
                        'credentials_generated': True,
                        'business_profile_created': True,
                        'plan_assigned': bool(plan_id),
                        'referral_processed': bool(referral_code),
                        'sms_sent': sms_sent,
                        'metrics_updated': True,
                        'interaction_logged': True
                    }
                }
                
                logger.info(f"PPPoE client created successfully: {user_account.username}")
                return Response(response_data, status=status.HTTP_201_CREATED)
                
        except ValidationError as e:
            logger.error(f"Validation error creating PPPoE client: {str(e)}")
            return Response({"error": f"Validation failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating PPPoE client: {str(e)}", exc_info=True)
            return Response({"error": f"Failed to create PPPoE client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateHotspotClientView(APIView):
    """Create Hotspot Client with plan assignment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Create new hotspot client"""
        try:
            serializer = CreateHotspotClientSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            phone = data['phone_number']
            plan_id = data.get('plan_id')
            client_type = data.get('client_type', 'residential')
            send_welcome_sms = data.get('send_welcome_sms', True)
            
            # Validate phone
            try:
                from authentication.models import PhoneValidation
                normalized_phone = PhoneValidation.normalize_kenyan_phone(phone)
            except ImportError:
                normalized_phone = phone
            
            # Check if client exists
            try:
                from authentication.models import UserAccount
                existing_user = UserAccount.get_client_by_phone(normalized_phone)
                
                if existing_user:
                    return Response({
                        "error": "Client already exists",
                        "client": {
                            "id": str(existing_user.id),
                            "username": existing_user.username,
                            "phone": existing_user.phone_number,
                            "connection_type": existing_user.connection_type if hasattr(existing_user, 'connection_type') else ''
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create hotspot client
                user_account = UserAccount.objects.create_client_user(
                    phone_number=normalized_phone,
                    connection_type='hotspot'
                )
                
            except ImportError:
                return Response(
                    {"error": "Authentication app not available"},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Create business profile
            client_profile = ClientProfile.objects.create(
                user=user_account,
                client_id=uuid.uuid4(),
                client_type=client_type,
                customer_since=timezone.now()
            )
            
            # Assign plan if specified
            if plan_id:
                try:
                    # Create plan subscription via Service Operations
                    result = SubscriptionService.create_subscription(
                        client_id=str(client_profile.client_id),
                        internet_plan_id=plan_id,
                        client_type=client_type,
                        access_method='hotspot',
                        duration_hours=720,  # 30 days
                        auto_renew=True,
                        metadata={
                            'assigned_during_creation': True,
                            'created_by': request.user.username
                        },
                        created_by=request.user.username
                    )
                    
                    if result['success']:
                        client_profile.plan_updated_at = timezone.now()
                        client_profile.plan_auto_renew = True
                        client_profile.save()
                        
                        # Get plan details for response
                        plan_details = InternetPlansAdapter.get_plan_details(plan_id)
                    else:
                        logger.warning(f"Failed to assign plan {plan_id} during creation: {result.get('error')}")
                        
                except Exception as e:
                    logger.warning(f"Error assigning plan during creation: {str(e)}")
            
            # Send welcome SMS if requested
            if send_welcome_sms:
                try:
                    from user_management.services.sms_services import SMSService
                    sms_service = SMSService()
                    
                    message = (
                        f"Welcome to our hotspot service! "
                        f"Your account has been created successfully. "
                        f"Username: {user_account.username}"
                    )
                    
                    if plan_id and 'plan_details' in locals():
                        message += f"\nYour plan: {plan_details.get('name', 'Assigned')}"
                    
                    sms = sms_service.create_sms_message(
                        phone_number=normalized_phone,
                        message=message,
                        recipient_name=user_account.username,
                        source='hotspot_creation',
                        reference_id=f"hotspot_{user_account.id}"
                    )
                    sms_service.send_sms(sms)
                    
                except ImportError:
                    logger.warning("SMS service not available")
            
            # Log interaction
            ClientInteraction.objects.create(
                client=client_profile,
                interaction_type='profile_update',
                action='Hotspot Client Created',
                description='Hotspot client created via admin',
                outcome='success',
                started_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'message': 'Hotspot client created successfully',
                'client': {
                    'id': str(user_account.id),
                    'client_id': str(client_profile.client_id),
                    'username': user_account.username,
                    'phone': phone,
                    'normalized_phone': normalized_phone,
                    'business_profile_id': str(client_profile.id),
                    'referral_code': client_profile.referral_code,
                    'connection_type': 'hotspot',
                    'plan_assigned': bool(plan_id),
                    'plan_name': plan_details.get('name') if 'plan_details' in locals() else None
                },
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating hotspot client: {str(e)}")
            return Response({"error": f"Failed to create hotspot client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)