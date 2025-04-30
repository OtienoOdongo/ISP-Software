# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import (
#     Count, Sum, Q, F, ExpressionWrapper, FloatField,
#     Case, When, Value, CharField
# )
# from django.utils import timezone
# from datetime import timedelta
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold
# )
# from user_management.serializers.plan_serializer import (
#     PlanAnalyticsSnapshotSerializer,
#     ClientAnalyticsSerializer,
#     SMSNotificationSerializer,
#     SMSSendSerializer,
#     ExportReportSerializer,
#     DataUsageThresholdSerializer
# )
# from user_management.services import SMSService
# from account.models.admin_model import Client, Subscription, Router
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser
# from payments.models.mpesa_config_model import Payment
# import logging

# logger = logging.getLogger(__name__)

# class PlanAnalyticsDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             # Get all active plans
#             plans = InternetPlan.objects.filter(active=True)
            
#             # Get all clients with their current subscriptions and payment status
#             clients = Client.objects.prefetch_related(
#                 'subscriptions', 
#                 'subscriptions__internet_plan',
#                 'payments',
#                 'payments__transaction'
#             ).annotate(
#                 current_plan_id=F('subscriptions__internet_plan__id'),
#                 current_plan_name=F('subscriptions__internet_plan__name'),
#                 current_plan_category=F('subscriptions__internet_plan__category'),
#                 assigned_date=F('subscriptions__start_date'),
#                 expiry_date=F('subscriptions__end_date'),
#                 payment_status=Case(
#                     When(payments__transaction__status='Success', then=Value('Paid')),
#                     When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#                     default=Value('Due'),
#                     output_field=CharField()
#                 )
#             ).distinct()
            
#             # Get network usage data with calculated percentage
#             hotspot_users = HotspotUser.objects.filter(
#                 active=True,
#                 plan__data_limit_unit__in=['GB', 'TB']  # Skip unlimited plans
#             ).annotate(
#                 data_limit_bytes=ExpressionWrapper(
#                     F('plan__data_limit_value') * 
#                     (1024**3 if F('plan__data_limit_unit') == 'GB' else 1024**4),
#                     output_field=FloatField()
#                 ),
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / F('data_limit_bytes'),
#                     output_field=FloatField()
#                 )
#             ).select_related('client', 'plan', 'router')
            
#             # Create a snapshot of current analytics
#             snapshot = self._create_analytics_snapshot(clients, hotspot_users)
            
#             # Prepare response data
#             response_data = {
#                 'plans': self._serialize_plans(plans),
#                 'clients': self._serialize_clients(clients, hotspot_users),
#                 'stats': PlanAnalyticsSnapshotSerializer(snapshot).data,
#                 'thresholds': DataUsageThresholdSerializer(
#                     DataUsageThreshold.objects.filter(is_active=True),
#                     many=True
#                 ).data
#             }
            
#             return Response(response_data, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.error(f"Error in PlanAnalyticsDashboardView: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch analytics data"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _create_analytics_snapshot(self, clients, hotspot_users):
#         # Total clients
#         total_clients = clients.count()
        
#         # Active clients (with active subscription)
#         active_clients = clients.filter(
#             subscriptions__is_active=True,
#             subscriptions__end_date__gte=timezone.now()
#         ).count()
        
#         # High usage clients (>=75% of data limit)
#         high_usage_clients = hotspot_users.filter(
#             usage_percentage__gte=75
#         ).values('client').distinct().count()
        
#         # Collected revenue from successful payments
#         collected_revenue = Payment.objects.filter(
#             transaction__status='Success'
#         ).aggregate(total=Sum('amount'))['total'] or 0
        
#         # Active devices (unique MAC addresses)
#         active_devices = hotspot_users.values('mac').distinct().count()
        
#         # Network congestion (based on router stats)
#         congested_routers = Router.objects.filter(
#             status='connected',
#             stats__cpu__gte=80  # Assuming CPU >= 80% is congested
#         ).count()
        
#         return PlanAnalyticsSnapshot.objects.create(
#             total_clients=total_clients,
#             active_clients=active_clients,
#             high_usage_clients=high_usage_clients,
#             collected_revenue=collected_revenue,
#             active_devices=active_devices,
#             congested_routers=congested_routers
#         )
    
#     def _serialize_plans(self, plans):
#         return [
#             {
#                 'id': plan.id,
#                 'name': plan.name,
#                 'price': float(plan.price),
#                 'download_speed': {
#                     'value': plan.download_speed_value,
#                     'unit': plan.download_speed_unit
#                 },
#                 'upload_speed': {
#                     'value': plan.upload_speed_value,
#                     'unit': plan.upload_speed_unit
#                 },
#                 'data_limit': {
#                     'value': plan.data_limit_value,
#                     'unit': plan.data_limit_unit
#                 },
#                 'expiry': {
#                     'value': plan.expiry_value,
#                     'unit': plan.expiry_unit
#                 },
#                 'category': plan.category,
#                 'description': plan.description
#             }
#             for plan in plans
#         ]
    
#     def _serialize_clients(self, clients, hotspot_users):
#         client_data = []
#         hotspot_user_map = {hu.client_id: hu for hu in hotspot_users}
        
#         for client in clients:
#             hotspot_user = hotspot_user_map.get(client.id)
#             data_usage = None
            
#             if hotspot_user:
#                 if hotspot_user.plan.data_limit_unit == 'Unlimited':
#                     data_usage = {
#                         'used': hotspot_user.data_used / (1024 ** 3),  # Convert to GB
#                         'total': 'Unlimited',
#                         'unit': 'GB',
#                         'percentage': None
#                     }
#                 else:
#                     total_data = float(hotspot_user.plan.data_limit_value)
#                     used_gb = hotspot_user.data_used / (1024 ** 3)
#                     percentage = (used_gb / total_data) * 100
                    
#                     data_usage = {
#                         'used': used_gb,
#                         'total': total_data,
#                         'unit': hotspot_user.plan.data_limit_unit,
#                         'percentage': percentage
#                     }
            
#             client_data.append({
#                 'id': client.id,
#                 'full_name': client.full_name,
#                 'phone_number': str(client.phonenumber),
#                 'device': hotspot_user.router.name if hotspot_user else 'Unknown',
#                 'device_id': hotspot_user.mac if hotspot_user else 'N/A',
#                 'current_plan': {
#                     'id': client.current_plan_id,
#                     'name': client.current_plan_name,
#                     'category': client.current_plan_category,
#                     'price': float(InternetPlan.objects.get(id=client.current_plan_id).price) if client.current_plan_id else None
#                 } if client.current_plan_id else None,
#                 'assigned_date': client.assigned_date.isoformat() if client.assigned_date else None,
#                 'expiry_date': client.expiry_date.isoformat() if client.expiry_date else None,
#                 'data_usage': data_usage,
#                 'payment_status': client.payment_status,
#                 'is_high_usage': data_usage['percentage'] >= 75 if data_usage and data_usage['percentage'] is not None else False,
#                 'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3 if client.expiry_date else False
#             })
        
#         return client_data

# class SMSServiceView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = SMSSendSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         try:
#             sms_service = SMSService()
#             results = sms_service.send_bulk_sms(
#                 serializer.validated_data['client_ids'],
#                 serializer.validated_data['message_type'],
#                 serializer.validated_data.get('custom_message'),
#                 serializer.validated_data.get('threshold_percentage')
#             )
            
#             return Response({
#                 'results': results,
#                 'total_sent': len([r for r in results if r['status'] == 'sent']),
#                 'total_failed': len([r for r in results if r['status'] == 'failed'])
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.error(f"Error in SMSServiceView: {str(e)}")
#             return Response(
#                 {"error": "Failed to send messages"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class SMSHistoryView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             limit = int(request.query_params.get('limit', 100))
#             offset = int(request.query_params.get('offset', 0))
            
#             notifications = SMSNotification.objects.order_by('-sent_at', '-created_at')
#             total_count = notifications.count()
            
#             notifications = notifications[offset:offset+limit]
#             serializer = SMSNotificationSerializer(notifications, many=True)
            
#             return Response({
#                 'count': total_count,
#                 'next': f"?limit={limit}&offset={offset+limit}" if offset+limit < total_count else None,
#                 'previous': f"?limit={limit}&offset={max(0, offset-limit)}" if offset > 0 else None,
#                 'results': serializer.data
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in SMSHistoryView: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch SMS history"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DataUsageThresholdView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             thresholds = DataUsageThreshold.objects.filter(is_active=True)
#             serializer = DataUsageThresholdSerializer(thresholds, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in DataUsageThresholdView: {str(e)}")
#             return Response(
#                 {"error": "Failed to fetch thresholds"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request):
#         serializer = DataUsageThresholdSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def put(self, request, pk):
#         try:
#             threshold = DataUsageThreshold.objects.get(pk=pk)
#             serializer = DataUsageThresholdSerializer(threshold, data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except DataUsageThreshold.DoesNotExist:
#             return Response(
#                 {"error": "Threshold not found"}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

# class ExportReportView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = ExportReportSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         try:
#             data = self._generate_report_data(serializer.validated_data)
#             return Response(data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in ExportReportView: {str(e)}")
#             return Response(
#                 {"error": "Failed to generate report"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _generate_report_data(self, filters):
#         # Base queryset
#         clients = Client.objects.prefetch_related(
#             'subscriptions', 
#             'subscriptions__internet_plan',
#             'payments',
#             'payments__transaction'
#         ).annotate(
#             current_plan_id=F('subscriptions__internet_plan__id'),
#             current_plan_name=F('subscriptions__internet_plan__name'),
#             current_plan_category=F('subscriptions__internet_plan__category'),
#             assigned_date=F('subscriptions__start_date'),
#             expiry_date=F('subscriptions__end_date'),
#             payment_status=Case(
#                 When(payments__transaction__status='Success', then=Value('Paid')),
#                 When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#                 default=Value('Due'),
#                 output_field=CharField()
#             )
#         )
        
#         # Apply filters
#         if filters.get('category'):
#             clients = clients.filter(
#                 subscriptions__internet_plan__category=filters['category']
#             )
            
#         if filters.get('status'):
#             clients = clients.filter(payment_status=filters['status'])
            
#         if filters.get('date_from') and filters.get('date_to'):
#             clients = clients.filter(
#                 subscriptions__start_date__gte=filters['date_from'],
#                 subscriptions__start_date__lte=filters['date_to']
#             )
        
#         # Get hotspot users for data usage
#         hotspot_users = HotspotUser.objects.filter(
#             active=True,
#             client_id__in=clients.values('id')
#         ).annotate(
#             usage_percentage=ExpressionWrapper(
#                 F('data_used') * 100 / 
#                 (F('plan__data_limit_value') * (1024 ** 3)),
#                 output_field=FloatField()
#             )
#         ).select_related('plan', 'router')
        
#         if filters.get('usage_threshold', 75):
#             hotspot_users = hotspot_users.filter(
#                 usage_percentage__gte=filters['usage_threshold']
#             )
        
#         hotspot_user_map = {hu.client_id: hu for hu in hotspot_users}
        
#         # Prepare report data
#         report_data = []
#         for client in clients:
#             hotspot_user = hotspot_user_map.get(client.id)
            
#             # Data usage info
#             data_usage = 'N/A'
#             if hotspot_user:
#                 if hotspot_user.plan.data_limit_unit == 'Unlimited':
#                     data_usage = 'Unlimited'
#                 else:
#                     used_gb = hotspot_user.data_used / (1024 ** 3)
#                     total_gb = float(hotspot_user.plan.data_limit_value)
#                     percentage = (used_gb / total_gb) * 100
#                     data_usage = f"{used_gb:.1f}/{total_gb:.1f} GB ({percentage:.1f}%)"
            
#             report_data.append({
#                 'id': client.id,
#                 'full_name': client.full_name,
#                 'phone_number': str(client.phonenumber),
#                 'device': hotspot_user.router.name if hotspot_user else 'Unknown',
#                 'mac_address': hotspot_user.mac if hotspot_user else 'N/A',
#                 'plan': client.current_plan_name if client.current_plan_name else 'None',
#                 'category': client.current_plan_category if client.current_plan_category else 'None',
#                 'payment_status': client.payment_status,
#                 'data_usage': data_usage,
#                 'assigned_date': client.assigned_date.strftime('%Y-%m-%d') if client.assigned_date else 'N/A',
#                 'expiry_date': client.expiry_date.strftime('%Y-%m-%d') if client.expiry_date else 'N/A',
#                 'is_high_usage': hotspot_user.usage_percentage >= 75 if hotspot_user and hasattr(hotspot_user, 'usage_percentage') else False,
#                 'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3 if client.expiry_date else False
#             })
        
#         return report_data







# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import (
#     Count, Sum, Q, F, ExpressionWrapper, FloatField,
#     Case, When, Value, CharField
# )
# from django.utils import timezone
# from datetime import timedelta
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold,
#     ActionNotification
# )
# from user_management.serializers.plan_serializer import (
#     PlanAnalyticsSnapshotSerializer,
#     ClientAnalyticsSerializer,
#     SMSNotificationSerializer,
#     SMSSendSerializer,
#     ExportReportSerializer,
#     DataUsageThresholdSerializer,
#     ActionNotificationSerializer
# )
# from user_management.services import SMSService
# from account.models.admin_model import Client, Subscription, Router
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser, RouterStats
# from payments.models.mpesa_config_model import Transaction
# import logging

# logger = logging.getLogger(__name__)

# class PlanAnalyticsDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             # Fetch active plans
#             plans = InternetPlan.objects.filter(active=True)
            
#             # Fetch clients with subscriptions and payments
#             clients = Client.objects.prefetch_related(
#                 'subscriptions', 
#                 'subscriptions__internet_plan',
#                 'payments',
#                 'payments__transaction'
#             ).annotate(
#                 current_plan_id=F('subscriptions__internet_plan__id'),
#                 current_plan_name=F('subscriptions__internet_plan__name'),
#                 current_plan_category=F('subscriptions__internet_plan__category'),
#                 assigned_date=F('subscriptions__start_date'),
#                 expiry_date=F('subscriptions__end_date'),
#                 payment_status=Case(
#                     When(payments__transaction__status='Success', then=Value('Paid')),
#                     When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#                     default=Value('Due'),
#                     output_field=CharField()
#                 )
#             ).distinct()
            
#             # Fetch network usage data
#             hotspot_users = HotspotUser.objects.filter(
#                 active=True,
#                 plan__data_limit_unit__in=['GB', 'TB']
#             ).annotate(
#                 data_limit_bytes=ExpressionWrapper(
#                     F('plan__data_limit_value') * 
#                     (1024**3 if F('plan__data_limit_unit') == 'GB' else 1024**4),
#                     output_field=FloatField()
#                 ),
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / F('data_limit_bytes'),
#                     output_field=FloatField()
#                 )
#             ).select_related('client', 'plan', 'router')
            
#             # Create analytics snapshot
#             snapshot = self._create_analytics_snapshot(clients, hotspot_users)
            
#             # Fetch notifications
#             notifications = ActionNotification.objects.filter(is_read=False).order_by('-created_at')[:10]
            
#             # Prepare response
#             response_data = {
#                 'plans': self._serialize_plans(plans),
#                 'clients': self._serialize_clients(clients, hotspot_users),
#                 'stats': PlanAnalyticsSnapshotSerializer(snapshot).data,
#                 'thresholds': DataUsageThresholdSerializer(
#                     DataUsageThreshold.objects.filter(is_active=True),
#                     many=True
#                 ).data,
#                 'notifications': ActionNotificationSerializer(notifications, many=True).data
#             }
            
#             return Response(response_data, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.error(f"Error in PlanAnalyticsDashboardView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to fetch analytics data: {str(e)}",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Failed to fetch analytics data"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _create_analytics_snapshot(self, clients, hotspot_users):
#         # Total clients
#         total_clients = clients.count()
        
#         # Active clients
#         active_clients = clients.filter(
#             subscriptions__is_active=True,
#             subscriptions__end_date__gte=timezone.now()
#         ).count()
        
#         # High usage clients
#         high_usage_clients = hotspot_users.filter(
#             usage_percentage__gte=75
#         ).values('client').distinct().count()
        
#         # Collected revenue
#         collected_revenue = Payment.objects.filter(
#             transaction__status='Success'
#         ).aggregate(total=Sum('amount'))['total'] or 0
        
#         # Active devices
#         active_devices = hotspot_users.values('mac').distinct().count()
        
#         # Congested routers (CPU >= 80%)
#         congested_routers = RouterStats.objects.filter(
#             cpu__gte=80,
#             timestamp__gte=timezone.now() - timedelta(hours=1)
#         ).values('router').distinct().count()
        
#         return PlanAnalyticsSnapshot.objects.create(
#             total_clients=total_clients,
#             active_clients=active_clients,
#             high_usage_clients=high_usage_clients,
#             collected_revenue=collected_revenue,
#             active_devices=active_devices,
#             congested_routers=congested_routers
#         )
    
#     def _serialize_plans(self, plans):
#         return [
#             {
#                 'id': plan.id,
#                 'name': plan.name,
#                 'price': float(plan.price),
#                 'download_speed': {
#                     'value': plan.download_speed_value,
#                     'unit': plan.download_speed_unit
#                 },
#                 'upload_speed': {
#                     'value': plan.upload_speed_value,
#                     'unit': plan.upload_speed_unit
#                 },
#                 'data_limit': {
#                     'value': plan.data_limit_value,
#                     'unit': plan.data_limit_unit
#                 },
#                 'expiry': {
#                     'value': plan.expiry_value,
#                     'unit': plan.expiry_unit
#                 },
#                 'category': plan.category,
#                 'description': plan.description
#             }
#             for plan in plans
#         ]
    
#     def _serialize_clients(self, clients, hotspot_users):
#         client_data = []
#         hotspot_user_map = {hu.client_id: hu for hu in hotspot_users if hu.client_id}
        
#         for client in clients:
#             hotspot_user = hotspot_user_map.get(client.id)
#             data_usage = None
            
#             if hotspot_user:
#                 if hotspot_user.plan.data_limit_unit == 'Unlimited':
#                     data_usage = {
#                         'used': hotspot_user.data_used / (1024 ** 3),  # Convert to GB
#                         'total': 'Unlimited',
#                         'unit': 'GB',
#                         'percentage': None
#                     }
#                 else:
#                     total_data = float(hotspot_user.plan.data_limit_value)
#                     used_gb = hotspot_user.data_used / (1024 ** 3)
#                     percentage = (used_gb / total_data) * 100
                    
#                     data_usage = {
#                         'used': used_gb,
#                         'total': total_data,
#                         'unit': hotspot_user.plan.data_limit_unit,
#                         'percentage': percentage
#                     }
            
#             client_data.append({
#                 'id': client.id,
#                 'full_name': client.full_name,
#                 'phone_number': str(client.phonenumber),
#                 'device': hotspot_user.router.name if hotspot_user else 'Unknown',
#                 'device_id': hotspot_user.mac if hotspot_user else 'N/A',
#                 'current_plan': {
#                     'id': client.current_plan_id,
#                     'name': client.current_plan_name,
#                     'category': client.current_plan_category,
#                     'price': float(InternetPlan.objects.get(id=client.current_plan_id).price) if client.current_plan_id else None
#                 } if client.current_plan_id else None,
#                 'assigned_date': client.assigned_date.isoformat() if client.assigned_date else None,
#                 'expiry_date': client.expiry_date.isoformat() if client.expiry_date else None,
#                 'data_usage': data_usage,
#                 'payment_status': client.payment_status,
#                 'is_high_usage': data_usage and data_usage['percentage'] and data_usage['percentage'] >= 75,
#                 'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3
#             })
        
#         return client_data

# class SMSServiceView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = SMSSendSerializer(data=request.data)
#         if not serializer.is_valid():
#             ActionNotification.objects.create(
#                 message="Invalid SMS request data",
#                 type='ERROR'
#             )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         try:
#             sms_service = SMSService()
#             results = sms_service.send_bulk_sms(
#                 serializer.validated_data['client_ids'],
#                 serializer.validated_data['message_type'],
#                 serializer.validated_data.get('custom_message'),
#                 serializer.validated_data.get('threshold_percentage')
#             )
            
#             total_sent = len([r for r in results if r['status'] == 'sent'])
#             total_failed = len([r for r in results if r['status'] == 'failed'])
            
#             ActionNotification.objects.create(
#                 message=f"Bulk SMS sent: {total_sent} succeeded, {total_failed} failed",
#                 type='SUCCESS' if total_sent > 0 else 'ERROR'
#             )
            
#             return Response({
#                 'results': results,
#                 'total_sent': total_sent,
#                 'total_failed': total_failed
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.error(f"Error in SMSServiceView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to send SMS: {str(e)}",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Failed to send messages"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class SMSHistoryView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             limit = int(request.query_params.get('limit', 100))
#             offset = int(request.query_params.get('offset', 0))
            
#             notifications = SMSNotification.objects.order_by('-sent_at', '-created_at')
#             total_count = notifications.count()
            
#             notifications = notifications[offset:offset+limit]
#             serializer = SMSNotificationSerializer(notifications, many=True)
            
#             return Response({
#                 'count': total_count,
#                 'next': f"?limit={limit}&offset={offset+limit}" if offset+limit < total_count else None,
#                 'previous': f"?limit={limit}&offset={max(0, offset-limit)}" if offset > 0 else None,
#                 'results': serializer.data
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in SMSHistoryView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to fetch SMS history: {str(e)}",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Failed to fetch SMS history"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DataUsageThresholdView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             thresholds = DataUsageThreshold.objects.filter(is_active=True)
#             serializer = DataUsageThresholdSerializer(thresholds, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in DataUsageThresholdView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to fetch thresholds: {str(e)}",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Failed to fetch thresholds"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request):
#         serializer = DataUsageThresholdSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             ActionNotification.objects.create(
#                 message=f"Created data usage threshold: {serializer.validated_data['threshold_percentage']}%",
#                 type='SUCCESS'
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         ActionNotification.objects.create(
#             message="Failed to create data usage threshold",
#             type='ERROR'
#         )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def put(self, request, pk):
#         try:
#             threshold = DataUsageThreshold.objects.get(pk=pk)
#             serializer = DataUsageThresholdSerializer(threshold, data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActionNotification.objects.create(
#                     message=f"Updated data usage threshold: {serializer.validated_data['threshold_percentage']}%",
#                     type='SUCCESS'
#                 )
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             ActionNotification.objects.create(
#                 message="Failed to update data usage threshold",
#                 type='ERROR'
#             )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except DataUsageThreshold.DoesNotExist:
#             ActionNotification.objects.create(
#                 message="Data usage threshold not found",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Threshold not found"}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

# class ExportReportView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = ExportReportSerializer(data=request.data)
#         if not serializer.is_valid():
#             ActionNotification.objects.create(
#                 message="Invalid report export parameters",
#                 type='ERROR'
#             )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         try:
#             data = self._generate_report_data(serializer.validated_data)
#             ActionNotification.objects.create(
#                 message="Report exported successfully",
#                 type='SUCCESS'
#             )
#             return Response(data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in ExportReportView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to generate report: {str(e)}",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Failed to generate report"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _generate_report_data(self, filters):
#         clients = Client.objects.prefetch_related(
#             'subscriptions', 
#             'subscriptions__internet_plan',
#             'payments',
#             'payments__transaction'
#         ).annotate(
#             current_plan_id=F('subscriptions__internet_plan__id'),
#             current_plan_name=F('subscriptions__internet_plan__name'),
#             current_plan_category=F('subscriptions__internet_plan__category'),
#             assigned_date=F('subscriptions__start_date'),
#             expiry_date=F('subscriptions__end_date'),
#             payment_status=Case(
#                 When(payments__transaction__status='Success', then=Value('Paid')),
#                 When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#                 default=Value('Due'),
#                 output_field=CharField()
#             )
#         )
        
#         if filters.get('category'):
#             clients = clients.filter(
#                 subscriptions__internet_plan__category=filters['category']
#             )
            
#         if filters.get('status'):
#             clients = clients.filter(payment_status=filters['status'])
            
#         if filters.get('date_from') and filters.get('date_to'):
#             clients = clients.filter(
#                 subscriptions__start_date__gte=filters['date_from'],
#                 subscriptions__start_date__lte=filters['date_to']
#             )
        
#         hotspot_users = HotspotUser.objects.filter(
#             active=True,
#             client_id__in=clients.values('id')
#         ).annotate(
#             usage_percentage=ExpressionWrapper(
#                 F('data_used') * 100 / 
#                 (F('plan__data_limit_value') * (1024 ** 3)),
#                 output_field=FloatField()
#             )
#         ).select_related('plan', 'router')
        
#         if filters.get('usage_threshold'):
#             hotspot_users = hotspot_users.filter(
#                 usage_percentage__gte=filters['usage_threshold']
#             )
        
#         hotspot_user_map = {hu.client_id: hu for hu in hotspot_users}
        
#         report_data = []
#         for client in clients:
#             hotspot_user = hotspot_user_map.get(client.id)
            
#             data_usage = 'N/A'
#             if hotspot_user:
#                 if hotspot_user.plan.data_limit_unit == 'Unlimited':
#                     data_usage = 'Unlimited'
#                 else:
#                     used_gb = hotspot_user.data_used / (1024 ** 3)
#                     total_gb = float(hotspot_user.plan.data_limit_value)
#                     percentage = (used_gb / total_gb) * 100
#                     data_usage = f"{used_gb:.1f}/{total_gb:.1f} GB ({percentage:.1f}%)"
            
#             report_data.append({
#                 'id': client.id,
#                 'full_name': client.full_name,
#                 'phone_number': str(client.phonenumber),
#                 'device': hotspot_user.router.name if hotspot_user else 'Unknown',
#                 'mac_address': hotspot_user.mac if hotspot_user else 'N/A',
#                 'plan': client.current_plan_name if client.current_plan_name else 'None',
#                 'category': client.current_plan_category if client.current_plan_category else 'None',
#                 'payment_status': client.payment_status,
#                 'data_usage': data_usage,
#                 'assigned_date': client.assigned_date.strftime('%Y-%m-%d') if client.assigned_date else 'N/A',
#                 'expiry_date': client.expiry_date.strftime('%Y-%m-%d') if client.expiry_date else 'N/A',
#                 'is_high_usage': hotspot_user and hotspot_user.usage_percentage >= 75 if hotspot_user and hasattr(hotspot_user, 'usage_percentage') else False,
#                 'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3
#             })
        
#         return report_data

# class UpdatePaymentStatusView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, client_id):
#         try:
#             client = Client.objects.get(id=client_id)
#             new_status = request.data.get('status')
#             if new_status not in ['Paid', 'Due', 'Expired']:
#                 ActionNotification.objects.create(
#                     message="Invalid payment status provided",
#                     type='ERROR'
#                 )
#                 return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Update client analytics
#             ClientAnalytics.objects.create(
#                 client=client,
#                 payment_status=new_status,
#                 timestamp=timezone.now()
#             )
            
#             ActionNotification.objects.create(
#                 message=f"Payment status updated for {client.full_name} to {new_status}",
#                 type='SUCCESS'
#             )
            
#             return Response({"message": "Status updated successfully"}, status=status.HTTP_200_OK)
#         except Client.DoesNotExist:
#             ActionNotification.objects.create(
#                 message="Client not found",
#                 type='ERROR'
#             )
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error in UpdatePaymentStatusView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to update payment status: {str(e)}",
#                 type='ERROR'
#             )
#             return Response(
#                 {"error": "Failed to update status"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class MarkNotificationReadView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, notification_id):
#         try:
#             notification = ActionNotification.objects.get(id=notification_id)
#             notification.is_read = True
#             notification.save()
#             return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
#         except ActionNotification.DoesNotExist:
#             return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)










# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from django.db.models import (
#     Count, Sum, Q, F, ExpressionWrapper, FloatField,
#     Case, When, Value, CharField
# )
# from django.utils import timezone
# from datetime import timedelta
# from user_management.models.plan_model import (
#     PlanAnalyticsSnapshot,
#     ClientAnalytics,
#     SMSNotification,
#     DataUsageThreshold,
#     ActionNotification
# )
# from user_management.serializers.plan_serializer import (
#     PlanAnalyticsSnapshotSerializer,
#     ClientAnalyticsSerializer,
#     SMSNotificationSerializer,
#     SMSSendSerializer,
#     ExportReportSerializer,
#     DataUsageThresholdSerializer,
#     ActionNotificationSerializer
# )
# from user_management.services import SMSService
# from account.models.admin_model import Client, Subscription, Payment
# from internet_plans.models.create_plan_models import InternetPlan
# from network_management.models.router_management_model import HotspotUser, RouterStats
# import logging
# import csv
# from io import StringIO

# logger = logging.getLogger(__name__)

# class PlanAnalyticsDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             # Fetch active plans
#             plans = InternetPlan.objects.filter(active=True)
            
#             # Fetch clients with subscriptions and payments
#             clients = Client.objects.prefetch_related(
#                 'subscriptions', 
#                 'subscriptions__internet_plan',
#                 'payments'
#             ).annotate(
#                 current_plan_id=F('subscriptions__internet_plan__id'),
#                 current_plan_name=F('subscriptions__internet_plan__name'),
#                 current_plan_category=F('subscriptions__internet_plan__category'),
#                 assigned_date=F('subscriptions__start_date'),
#                 expiry_date=F('subscriptions__end_date'),
#                 payment_status=Case(
#                     When(payments__isnull=False, then=Value('Paid')),
#                     When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#                     default=Value('Due'),
#                     output_field=CharField()
#                 )
#             ).distinct()
            
#             # Fetch network usage data
#             hotspot_users = HotspotUser.objects.filter(
#                 active=True
#             ).annotate(
#                 usage_percentage=ExpressionWrapper(
#                     F('data_used') * 100 / 
#                     (F('plan__data_limit_value') * (1024 ** 3)),
#                     output_field=FloatField()
#                 )
#             ).select_related('client', 'plan', 'router')
            
#             # Create analytics snapshot
#             snapshot = self._create_analytics_snapshot(clients, hotspot_users)
            
#             # Fetch notifications
#             notifications = ActionNotification.objects.filter(
#                 Q(user=request.user) | Q(user__isnull=True),
#                 is_read=False
#             ).order_by('-created_at')[:10]
            
#             # Prepare response
#             response_data = {
#                 'plans': self._serialize_plans(plans),
#                 'clients': self._serialize_clients(clients, hotspot_users),
#                 'stats': PlanAnalyticsSnapshotSerializer(snapshot).data,
#                 'thresholds': DataUsageThresholdSerializer(
#                     DataUsageThreshold.objects.filter(is_active=True),
#                     many=True
#                 ).data,
#                 'notifications': ActionNotificationSerializer(notifications, many=True).data
#             }
            
#             return Response(response_data, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.error(f"Error in PlanAnalyticsDashboardView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to fetch analytics data: {str(e)}",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Failed to fetch analytics data"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _create_analytics_snapshot(self, clients, hotspot_users):
#         # Total clients
#         total_clients = clients.count()
        
#         # Active clients
#         active_clients = clients.filter(
#             subscriptions__is_active=True,
#             subscriptions__end_date__gte=timezone.now()
#         ).count()
        
#         # High usage clients
#         high_usage_clients = hotspot_users.filter(
#             usage_percentage__gte=75
#         ).values('client').distinct().count()
        
#         # Collected revenue
#         collected_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        
#         # Active devices
#         active_devices = hotspot_users.values('mac').distinct().count()
        
#         # Congested routers (CPU >= 80%)
#         congested_routers = RouterStats.objects.filter(
#             cpu__gte=80,
#             timestamp__gte=timezone.now() - timedelta(hours=1)
#         ).values('router').distinct().count()
        
#         return PlanAnalyticsSnapshot.objects.create(
#             total_clients=total_clients,
#             active_clients=active_clients,
#             high_usage_clients=high_usage_clients,
#             collected_revenue=collected_revenue,
#             active_devices=active_devices,
#             congested_routers=congested_routers
#         )
    
#     def _serialize_plans(self, plans):
#         return [
#             {
#                 'id': plan.id,
#                 'name': plan.name,
#                 'price': float(plan.price),
#                 'download_speed': {
#                     'value': plan.download_speed_value,
#                     'unit': plan.download_speed_unit
#                 },
#                 'upload_speed': {
#                     'value': plan.upload_speed_value,
#                     'unit': plan.upload_speed_unit
#                 },
#                 'data_limit': {
#                     'value': plan.data_limit_value,
#                     'unit': plan.data_limit_unit
#                 },
#                 'expiry': {
#                     'value': plan.expiry_value,
#                     'unit': plan.expiry_unit
#                 },
#                 'category': plan.category,
#                 'description': plan.description
#             }
#             for plan in plans
#         ]
    
#     def _serialize_clients(self, clients, hotspot_users):
#         client_data = []
#         hotspot_user_map = {hu.client_id: hu for hu in hotspot_users if hu.client_id}
        
#         for client in clients:
#             hotspot_user = hotspot_user_map.get(client.id)
#             data_usage = None
            
#             if hotspot_user and hotspot_user.plan:
#                 if hotspot_user.plan.data_limit_unit == 'Unlimited':
#                     data_usage = {
#                         'used': hotspot_user.data_used / (1024 ** 3),  # Convert to GB
#                         'total': 'Unlimited',
#                         'unit': 'GB',
#                         'percentage': None
#                     }
#                 else:
#                     total_data = float(hotspot_user.plan.data_limit_value)
#                     used_gb = hotspot_user.data_used / (1024 ** 3)
#                     percentage = (used_gb / total_data) * 100 if total_data > 0 else 0
                    
#                     data_usage = {
#                         'used': used_gb,
#                         'total': total_data,
#                         'unit': hotspot_user.plan.data_limit_unit,
#                         'percentage': percentage
#                     }
            
#             client_data.append({
#                 'id': client.id,
#                 'full_name': client.full_name,
#                 'phone_number': str(client.phonenumber),
#                 'device': hotspot_user.router.name if hotspot_user else 'Unknown',
#                 'device_id': hotspot_user.mac if hotspot_user else 'N/A',
#                 'current_plan': {
#                     'id': client.current_plan_id,
#                     'name': client.current_plan_name,
#                     'category': client.current_plan_category,
#                     'price': float(InternetPlan.objects.get(id=client.current_plan_id).price) if client.current_plan_id else None
#                 } if client.current_plan_id else None,
#                 'assigned_date': client.assigned_date.isoformat() if client.assigned_date else None,
#                 'expiry_date': client.expiry_date.isoformat() if client.expiry_date else None,
#                 'data_usage': data_usage,
#                 'payment_status': client.payment_status,
#                 'is_high_usage': data_usage and data_usage['percentage'] and data_usage['percentage'] >= 75,
#                 'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3
#             })
        
#         return client_data

# class SMSServiceView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = SMSSendSerializer(data=request.data)
#         if not serializer.is_valid():
#             ActionNotification.objects.create(
#                 message="Invalid SMS request data",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         try:
#             sms_service = SMSService()
#             results = sms_service.send_bulk_sms(
#                 serializer.validated_data['client_ids'],
#                 serializer.validated_data['message_type'],
#                 serializer.validated_data.get('custom_message')
#             )
            
#             total_sent = len([r for r in results if r['status'] == 'sent'])
#             total_failed = len([r for r in results if r['status'] == 'failed'])
            
#             ActionNotification.objects.create(
#                 message=f"Bulk SMS sent: {total_sent} succeeded, {total_failed} failed",
#                 type='SUCCESS' if total_sent > 0 else 'ERROR',
#                 user=request.user
#             )
            
#             return Response({
#                 'results': results,
#                 'total_sent': total_sent,
#                 'total_failed': total_failed
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.error(f"Error in SMSServiceView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to send SMS: {str(e)}",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Failed to send messages"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class SMSHistoryView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             limit = int(request.query_params.get('limit', 100))
#             offset = int(request.query_params.get('offset', 0))
            
#             notifications = SMSNotification.objects.order_by('-sent_at', '-created_at')
#             total_count = notifications.count()
            
#             notifications = notifications[offset:offset+limit]
#             serializer = SMSNotificationSerializer(notifications, many=True)
            
#             return Response({
#                 'count': total_count,
#                 'next': f"?limit={limit}&offset={offset+limit}" if offset+limit < total_count else None,
#                 'previous': f"?limit={limit}&offset={max(0, offset-limit)}" if offset > 0 else None,
#                 'results': serializer.data
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in SMSHistoryView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to fetch SMS history: {str(e)}",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Failed to fetch SMS history"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class DataUsageThresholdView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             thresholds = DataUsageThreshold.objects.filter(is_active=True)
#             serializer = DataUsageThresholdSerializer(thresholds, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as e:
#             logger.error(f"Error in DataUsageThresholdView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to fetch thresholds: {str(e)}",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Failed to fetch thresholds"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def post(self, request):
#         serializer = DataUsageThresholdSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             ActionNotification.objects.create(
#                 message=f"Created data usage threshold: {serializer.validated_data['threshold_percentage']}%",
#                 type='SUCCESS',
#                 user=request.user
#             )
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         ActionNotification.objects.create(
#             message="Failed to create data usage threshold",
#             type='ERROR',
#             user=request.user
#         )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def put(self, request, pk):
#         try:
#             threshold = DataUsageThreshold.objects.get(pk=pk)
#             serializer = DataUsageThresholdSerializer(threshold, data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActionNotification.objects.create(
#                     message=f"Updated data usage threshold: {serializer.validated_data['threshold_percentage']}%",
#                     type='SUCCESS',
#                     user=request.user
#                 )
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             ActionNotification.objects.create(
#                 message="Failed to update data usage threshold",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except DataUsageThreshold.DoesNotExist:
#             ActionNotification.objects.create(
#                 message="Data usage threshold not found",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Threshold not found"}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

# class ExportReportView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         serializer = ExportReportSerializer(data=request.data)
#         if not serializer.is_valid():
#             ActionNotification.objects.create(
#                 message="Invalid report export parameters",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
#         try:
#             data = self._generate_report_data(serializer.validated_data)
            
#             # Create CSV response
#             csv_buffer = StringIO()
#             csv_writer = csv.writer(csv_buffer)
            
#             # Write header
#             csv_writer.writerow([
#                 'ID', 'Full Name', 'Phone', 'Device', 'MAC Address', 
#                 'Plan', 'Category', 'Payment Status', 'Data Usage', 
#                 'Assigned Date', 'Expiry Date'
#             ])
            
#             # Write data
#             for user in data:
#                 csv_writer.writerow([
#                     user['id'],
#                     user['full_name'],
#                     user['phone_number'],
#                     user['device'],
#                     user['mac_address'],
#                     user['plan'],
#                     user['category'],
#                     user['payment_status'],
#                     user['data_usage'],
#                     user['assigned_date'],
#                     user['expiry_date']
#                 ])
            
#             response = Response(csv_buffer.getvalue(), content_type='text/csv')
#             response['Content-Disposition'] = 'attachment; filename="plan_analytics_report.csv"'
            
#             ActionNotification.objects.create(
#                 message="Report exported successfully",
#                 type='SUCCESS',
#                 user=request.user
#             )
#             return response
            
#         except Exception as e:
#             logger.error(f"Error in ExportReportView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to generate report: {str(e)}",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Failed to generate report"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     def _generate_report_data(self, filters):
#         clients = Client.objects.prefetch_related(
#             'subscriptions', 
#             'subscriptions__internet_plan',
#             'payments'
#         ).annotate(
#             current_plan_id=F('subscriptions__internet_plan__id'),
#             current_plan_name=F('subscriptions__internet_plan__name'),
#             current_plan_category=F('subscriptions__internet_plan__category'),
#             assigned_date=F('subscriptions__start_date'),
#             expiry_date=F('subscriptions__end_date'),
#             payment_status=Case(
#                 When(payments__isnull=False, then=Value('Paid')),
#                 When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
#                 default=Value('Due'),
#                 output_field=CharField()
#             )
#         )
        
#         if filters.get('category'):
#             clients = clients.filter(
#                 subscriptions__internet_plan__category=filters['category']
#             )
            
#         if filters.get('status'):
#             clients = clients.filter(payment_status=filters['status'])
            
#         if filters.get('date_from') and filters.get('date_to'):
#             clients = clients.filter(
#                 subscriptions__start_date__gte=filters['date_from'],
#                 subscriptions__start_date__lte=filters['date_to']
#             )
        
#         hotspot_users = HotspotUser.objects.filter(
#             active=True,
#             client_id__in=clients.values('id')
#         ).annotate(
#             usage_percentage=ExpressionWrapper(
#                 F('data_used') * 100 / 
#                 (F('plan__data_limit_value') * (1024 ** 3)),
#                 output_field=FloatField()
#             )
#         ).select_related('plan', 'router')
        
#         if filters.get('usage_threshold'):
#             hotspot_users = hotspot_users.filter(
#                 usage_percentage__gte=filters['usage_threshold']
#             )
        
#         hotspot_user_map = {hu.client_id: hu for hu in hotspot_users}
        
#         report_data = []
#         for client in clients:
#             hotspot_user = hotspot_user_map.get(client.id)
            
#             data_usage = 'N/A'
#             if hotspot_user:
#                 if hotspot_user.plan.data_limit_unit == 'Unlimited':
#                     data_usage = 'Unlimited'
#                 else:
#                     used_gb = hotspot_user.data_used / (1024 ** 3)
#                     total_gb = float(hotspot_user.plan.data_limit_value)
#                     percentage = (used_gb / total_gb) * 100
#                     data_usage = f"{used_gb:.1f}/{total_gb:.1f} GB ({percentage:.1f}%)"
            
#             report_data.append({
#                 'id': client.id,
#                 'full_name': client.full_name,
#                 'phone_number': str(client.phonenumber),
#                 'device': hotspot_user.router.name if hotspot_user else 'Unknown',
#                 'mac_address': hotspot_user.mac if hotspot_user else 'N/A',
#                 'plan': client.current_plan_name if client.current_plan_name else 'None',
#                 'category': client.current_plan_category if client.current_plan_category else 'None',
#                 'payment_status': client.payment_status,
#                 'data_usage': data_usage,
#                 'assigned_date': client.assigned_date.strftime('%Y-%m-%d') if client.assigned_date else 'N/A',
#                 'expiry_date': client.expiry_date.strftime('%Y-%m-%d') if client.expiry_date else 'N/A',
#                 'is_high_usage': hotspot_user and hotspot_user.usage_percentage >= 75 if hotspot_user and hasattr(hotspot_user, 'usage_percentage') else False,
#                 'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3
#             })
        
#         return report_data

# class UpdatePaymentStatusView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, client_id):
#         try:
#             client = Client.objects.get(id=client_id)
#             new_status = request.data.get('status')
#             if new_status not in ['Paid', 'Due', 'Expired']:
#                 ActionNotification.objects.create(
#                     message="Invalid payment status provided",
#                     type='ERROR',
#                     user=request.user
#                 )
#                 return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            
#             # Update client analytics
#             ClientAnalytics.objects.create(
#                 client=client,
#                 payment_status=new_status,
#                 timestamp=timezone.now()
#             )
            
#             ActionNotification.objects.create(
#                 message=f"Payment status updated for {client.full_name} to {new_status}",
#                 type='SUCCESS',
#                 user=request.user
#             )
            
#             return Response({"message": "Status updated successfully"}, status=status.HTTP_200_OK)
#         except Client.DoesNotExist:
#             ActionNotification.objects.create(
#                 message="Client not found",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.error(f"Error in UpdatePaymentStatusView: {str(e)}")
#             ActionNotification.objects.create(
#                 message=f"Failed to update payment status: {str(e)}",
#                 type='ERROR',
#                 user=request.user
#             )
#             return Response(
#                 {"error": "Failed to update status"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class MarkNotificationReadView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, notification_id):
#         try:
#             notification = ActionNotification.objects.get(id=notification_id, user=request.user)
#             notification.is_read = True
#             notification.save()
#             return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
#         except ActionNotification.DoesNotExist:
#             return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)









from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import (
    Count, Sum, Q, F, ExpressionWrapper, FloatField,
    Case, When, Value, CharField
)
from django.utils import timezone
from datetime import timedelta
from user_management.models.plan_model import (
    PlanAnalyticsSnapshot,
    ClientAnalytics,
    SMSNotification,
    DataUsageThreshold,
    ActionNotification
)
from user_management.serializers.plan_serializer import (
    PlanAnalyticsSnapshotSerializer,
    ClientAnalyticsSerializer,
    SMSNotificationSerializer,
    SMSSendSerializer,
    ExportReportSerializer,
    DataUsageThresholdSerializer,
    ActionNotificationSerializer
)
from user_management.services import SMSService
from account.models.admin_model import Client, Subscription, Payment
from internet_plans.models.create_plan_models import InternetPlan
from network_management.models.router_management_model import HotspotUser, RouterStats
import logging
import csv
from io import StringIO

logger = logging.getLogger(__name__)

class PlanAnalyticsDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Fetch active plans
            plans = InternetPlan.objects.filter(active=True)
            
            # Fetch clients with subscriptions and payments
            clients = Client.objects.prefetch_related(
                'subscriptions', 
                'subscriptions__internet_plan',
                'payments'
            ).annotate(
                current_plan_id=F('subscriptions__internet_plan__id'),
                current_plan_name=F('subscriptions__internet_plan__name'),
                current_plan_category=F('subscriptions__internet_plan__category'),
                assigned_date=F('subscriptions__start_date'),
                expiry_date=F('subscriptions__end_date'),
                payment_status=Case(
                    When(payments__isnull=False, then=Value('Paid')),
                    When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
                    default=Value('Due'),
                    output_field=CharField()
                )
            ).distinct()
            
            # Fetch network usage data
            hotspot_users = HotspotUser.objects.filter(
                active=True
            ).annotate(
                usage_percentage=ExpressionWrapper(
                    F('data_used') * 100 / 
                    (F('plan__data_limit_value') * (1024 ** 3)),
                    output_field=FloatField()
                )
            ).select_related('client', 'plan', 'router')
            
            # Create analytics snapshot
            snapshot = self._create_analytics_snapshot(clients, hotspot_users)
            
            # Fetch notifications for all clients (admin can see all)
            notifications = ActionNotification.objects.filter(
                is_read=False
            ).order_by('-created_at')[:10]
            
            # Prepare response
            response_data = {
                'plans': self._serialize_plans(plans),
                'clients': self._serialize_clients(clients, hotspot_users),
                'stats': PlanAnalyticsSnapshotSerializer(snapshot).data,
                'thresholds': DataUsageThresholdSerializer(
                    DataUsageThreshold.objects.filter(is_active=True),
                    many=True
                ).data,
                'notifications': ActionNotificationSerializer(notifications, many=True).data
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in PlanAnalyticsDashboardView: {str(e)}")
            ActionNotification.objects.create(
                message=f"Failed to fetch analytics data: {str(e)}",
                type='ERROR',
                client=None  # System-wide error notification
            )
            return Response(
                {"error": "Failed to fetch analytics data"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _create_analytics_snapshot(self, clients, hotspot_users):
        # Total clients
        total_clients = clients.count()
        
        # Active clients
        active_clients = clients.filter(
            subscriptions__is_active=True,
            subscriptions__end_date__gte=timezone.now()
        ).count()
        
        # High usage clients
        high_usage_clients = hotspot_users.filter(
            usage_percentage__gte=75
        ).values('client').distinct().count()
        
        # Collected revenue
        collected_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        
        # Active devices
        active_devices = hotspot_users.values('mac').distinct().count()
        
        # Congested routers (CPU >= 80%)
        congested_routers = RouterStats.objects.filter(
            cpu__gte=80,
            timestamp__gte=timezone.now() - timedelta(hours=1)
        ).values('router').distinct().count()
        
        return PlanAnalyticsSnapshot.objects.create(
            total_clients=total_clients,
            active_clients=active_clients,
            high_usage_clients=high_usage_clients,
            collected_revenue=collected_revenue,
            active_devices=active_devices,
            congested_routers=congested_routers
        )
    
    def _serialize_plans(self, plans):
        return [
            {
                'id': plan.id,
                'name': plan.name,
                'price': float(plan.price),
                'download_speed': {
                    'value': plan.download_speed_value,
                    'unit': plan.download_speed_unit
                },
                'upload_speed': {
                    'value': plan.upload_speed_value,
                    'unit': plan.upload_speed_unit
                },
                'data_limit': {
                    'value': plan.data_limit_value,
                    'unit': plan.data_limit_unit
                },
                'expiry': {
                    'value': plan.expiry_value,
                    'unit': plan.expiry_unit
                },
                'category': plan.category,
                'description': plan.description
            }
            for plan in plans
        ]
    
    def _serialize_clients(self, clients, hotspot_users):
        client_data = []
        hotspot_user_map = {hu.client_id: hu for hu in hotspot_users if hu.client_id}
        
        for client in clients:
            hotspot_user = hotspot_user_map.get(client.id)
            data_usage = None
            
            if hotspot_user and hotspot_user.plan:
                if hotspot_user.plan.data_limit_unit == 'Unlimited':
                    data_usage = {
                        'used': hotspot_user.data_used / (1024 ** 3),  # Convert to GB
                        'total': 'Unlimited',
                        'unit': 'GB',
                        'percentage': None
                    }
                else:
                    total_data = float(hotspot_user.plan.data_limit_value)
                    used_gb = hotspot_user.data_used / (1024 ** 3)
                    percentage = (used_gb / total_data) * 100 if total_data > 0 else 0
                    
                    data_usage = {
                        'used': used_gb,
                        'total': total_data,
                        'unit': hotspot_user.plan.data_limit_unit,
                        'percentage': percentage
                    }
            
            client_data.append({
                'id': client.id,
                'full_name': client.full_name,
                'phone_number': str(client.phonenumber),
                'device': hotspot_user.router.name if hotspot_user else 'Unknown',
                'device_id': hotspot_user.mac if hotspot_user else 'N/A',
                'current_plan': {
                    'id': client.current_plan_id,
                    'name': client.current_plan_name,
                    'category': client.current_plan_category,
                    'price': float(InternetPlan.objects.get(id=client.current_plan_id).price) if client.current_plan_id else None
                } if client.current_plan_id else None,
                'assigned_date': client.assigned_date.isoformat() if client.assigned_date else None,
                'expiry_date': client.expiry_date.isoformat() if client.expiry_date else None,
                'data_usage': data_usage,
                'payment_status': client.payment_status,
                'is_high_usage': data_usage and data_usage['percentage'] and data_usage['percentage'] >= 75,
                'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3
            })
        
        return client_data

class SMSServiceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SMSSendSerializer(data=request.data)
        if not serializer.is_valid():
            ActionNotification.objects.create(
                message="Invalid SMS request data",
                type='ERROR',
                client=None
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            sms_service = SMSService()
            results = sms_service.send_bulk_sms(
                serializer.validated_data['client_ids'],
                serializer.validated_data['message_type'],
                serializer.validated_data.get('custom_message')
            )
            
            total_sent = len([r for r in results if r['status'] == 'sent'])
            total_failed = len([r for r in results if r['status'] == 'failed'])
            
            ActionNotification.objects.create(
                message=f"Bulk SMS sent: {total_sent} succeeded, {total_failed} failed",
                type='SUCCESS' if total_sent > 0 else 'ERROR',
                client=None
            )
            
            return Response({
                'results': results,
                'total_sent': total_sent,
                'total_failed': total_failed
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in SMSServiceView: {str(e)}")
            ActionNotification.objects.create(
                message=f"Failed to send SMS: {str(e)}",
                type='ERROR',
                client=None
            )
            return Response(
                {"error": "Failed to send messages"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SMSHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 100))
            offset = int(request.query_params.get('offset', 0))
            
            notifications = SMSNotification.objects.order_by('-sent_at', '-created_at')
            total_count = notifications.count()
            
            notifications = notifications[offset:offset+limit]
            serializer = SMSNotificationSerializer(notifications, many=True)
            
            return Response({
                'count': total_count,
                'next': f"?limit={limit}&offset={offset+limit}" if offset+limit < total_count else None,
                'previous': f"?limit={limit}&offset={max(0, offset-limit)}" if offset > 0 else None,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in SMSHistoryView: {str(e)}")
            ActionNotification.objects.create(
                message=f"Failed to fetch SMS history: {str(e)}",
                type='ERROR',
                client=None
            )
            return Response(
                {"error": "Failed to fetch SMS history"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DataUsageThresholdView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            thresholds = DataUsageThreshold.objects.filter(is_active=True)
            serializer = DataUsageThresholdSerializer(thresholds, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in DataUsageThresholdView: {str(e)}")
            ActionNotification.objects.create(
                message=f"Failed to fetch thresholds: {str(e)}",
                type='ERROR',
                client=None
            )
            return Response(
                {"error": "Failed to fetch thresholds"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        serializer = DataUsageThresholdSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            ActionNotification.objects.create(
                message=f"Created data usage threshold: {serializer.validated_data['threshold_percentage']}%",
                type='SUCCESS',
                client=None
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        ActionNotification.objects.create(
            message="Failed to create data usage threshold",
            type='ERROR',
            client=None
        )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        try:
            threshold = DataUsageThreshold.objects.get(pk=pk)
            serializer = DataUsageThresholdSerializer(threshold, data=request.data)
            if serializer.is_valid():
                serializer.save()
                ActionNotification.objects.create(
                    message=f"Updated data usage threshold: {serializer.validated_data['threshold_percentage']}%",
                    type='SUCCESS',
                    client=None
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            ActionNotification.objects.create(
                message="Failed to update data usage threshold",
                type='ERROR',
                client=None
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except DataUsageThreshold.DoesNotExist:
            ActionNotification.objects.create(
                message="Data usage threshold not found",
                type='ERROR',
                client=None
            )
            return Response(
                {"error": "Threshold not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ExportReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ExportReportSerializer(data=request.data)
        if not serializer.is_valid():
            ActionNotification.objects.create(
                message="Invalid report export parameters",
                type='ERROR',
                client=None
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            data = self._generate_report_data(serializer.validated_data)
            
            # Create CSV response
            csv_buffer = StringIO()
            csv_writer = csv.writer(csv_buffer)
            
            # Write header
            csv_writer.writerow([
                'ID', 'Full Name', 'Phone', 'Device', 'MAC Address', 
                'Plan', 'Category', 'Payment Status', 'Data Usage', 
                'Assigned Date', 'Expiry Date'
            ])
            
            # Write data
            for user in data:
                csv_writer.writerow([
                    user['id'],
                    user['full_name'],
                    user['phone_number'],
                    user['device'],
                    user['mac_address'],
                    user['plan'],
                    user['category'],
                    user['payment_status'],
                    user['data_usage'],
                    user['assigned_date'],
                    user['expiry_date']
                ])
            
            response = Response(csv_buffer.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="plan_analytics_report.csv"'
            
            ActionNotification.objects.create(
                message="Report exported successfully",
                type='SUCCESS',
                client=None
            )
            return response
            
        except Exception as e:
            logger.error(f"Error in ExportReportView: {str(e)}")
            ActionNotification.objects.create(
                message=f"Failed to generate report: {str(e)}",
                type='ERROR',
                client=None
            )
            return Response(
                {"error": "Failed to generate report"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_report_data(self, filters):
        clients = Client.objects.prefetch_related(
            'subscriptions', 
            'subscriptions__internet_plan',
            'payments'
        ).annotate(
            current_plan_id=F('subscriptions__internet_plan__id'),
            current_plan_name=F('subscriptions__internet_plan__name'),
            current_plan_category=F('subscriptions__internet_plan__category'),
            assigned_date=F('subscriptions__start_date'),
            expiry_date=F('subscriptions__end_date'),
            payment_status=Case(
                When(payments__isnull=False, then=Value('Paid')),
                When(subscriptions__end_date__lt=timezone.now(), then=Value('Expired')),
                default=Value('Due'),
                output_field=CharField()
            )
        )
        
        if filters.get('category'):
            clients = clients.filter(
                subscriptions__internet_plan__category=filters['category']
            )
            
        if filters.get('status'):
            clients = clients.filter(payment_status=filters['status'])
            
        if filters.get('date_from') and filters.get('date_to'):
            clients = clients.filter(
                subscriptions__start_date__gte=filters['date_from'],
                subscriptions__start_date__lte=filters['date_to']
            )
        
        hotspot_users = HotspotUser.objects.filter(
            active=True,
            client_id__in=clients.values('id')
        ).annotate(
            usage_percentage=ExpressionWrapper(
                F('data_used') * 100 / 
                (F('plan__data_limit_value') * (1024 ** 3)),
                output_field=FloatField()
            )
        ).select_related('plan', 'router')
        
        if filters.get('usage_threshold'):
            hotspot_users = hotspot_users.filter(
                usage_percentage__gte=filters['usage_threshold']
            )
        
        hotspot_user_map = {hu.client_id: hu for hu in hotspot_users}
        
        report_data = []
        for client in clients:
            hotspot_user = hotspot_user_map.get(client.id)
            
            data_usage = 'N/A'
            if hotspot_user:
                if hotspot_user.plan.data_limit_unit == 'Unlimited':
                    data_usage = 'Unlimited'
                else:
                    used_gb = hotspot_user.data_used / (1024 ** 3)
                    total_gb = float(hotspot_user.plan.data_limit_value)
                    percentage = (used_gb / total_gb) * 100
                    data_usage = f"{used_gb:.1f}/{total_gb:.1f} GB ({percentage:.1f}%)"
            
            report_data.append({
                'id': client.id,
                'full_name': client.full_name,
                'phone_number': str(client.phonenumber),
                'device': hotspot_user.router.name if hotspot_user else 'Unknown',
                'mac_address': hotspot_user.mac if hotspot_user else 'N/A',
                'plan': client.current_plan_name if client.current_plan_name else 'None',
                'category': client.current_plan_category if client.current_plan_category else 'None',
                'payment_status': client.payment_status,
                'data_usage': data_usage,
                'assigned_date': client.assigned_date.strftime('%Y-%m-%d') if client.assigned_date else 'N/A',
                'expiry_date': client.expiry_date.strftime('%Y-%m-%d') if client.expiry_date else 'N/A',
                'is_high_usage': hotspot_user and hotspot_user.usage_percentage >= 75 if hotspot_user and hasattr(hotspot_user, 'usage_percentage') else False,
                'is_near_expiry': client.expiry_date and (client.expiry_date - timezone.now()).days <= 3
            })
        
        return report_data

class UpdatePaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, client_id):
        try:
            client = Client.objects.get(id=client_id)
            new_status = request.data.get('status')
            if new_status not in ['Paid', 'Due', 'Expired']:
                ActionNotification.objects.create(
                    message="Invalid payment status provided",
                    type='ERROR',
                    client=client
                )
                return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update client analytics
            ClientAnalytics.objects.create(
                client=client,
                payment_status=new_status,
                timestamp=timezone.now()
            )
            
            ActionNotification.objects.create(
                message=f"Payment status updated for {client.full_name} to {new_status}",
                type='SUCCESS',
                client=client
            )
            
            return Response({"message": "Status updated successfully"}, status=status.HTTP_200_OK)
        except Client.DoesNotExist:
            ActionNotification.objects.create(
                message="Client not found",
                type='ERROR',
                client=None
            )
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in UpdatePaymentStatusView: {str(e)}")
            ActionNotification.objects.create(
                message=f"Failed to update payment status: {str(e)}",
                type='ERROR',
                client=None
            )
            return Response(
                {"error": "Failed to update status"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, notification_id):
        try:
            notification = ActionNotification.objects.get(id=notification_id)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read"}, status=status.HTTP_200_OK)
        except ActionNotification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)