# # account/api/views/admin_view.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from rest_framework import status
# from django.db.models import Sum, Q, Avg
# from django.utils.timezone import now
# import logging
# import traceback
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, SubscriptionSerializer,
#     PaymentSerializer, ActivityLogSerializer, NetworkHealthSerializer, RouterSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from rest_framework.exceptions import PermissionDenied

# # Configure logging to output to console
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# class AdminProfileView(APIView):
#     permission_classes = [IsAuthenticated, IsAdminUser]

#     def get(self, request):
#         admin = request.user
#         logger.debug(f"Authenticated user: {admin}, IsStaff: {admin.is_staff}, IsAuthenticated: {request.user.is_authenticated}")

#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin}")
#             raise PermissionDenied("You do not have permission to access this resource.")

#         # Safely handle profile fields
#         profile_pic_url = ""
#         if admin.profile_pic:
#             try:
#                 profile_pic_url = request.build_absolute_uri(admin.profile_pic.url)
#             except Exception as e:
#                 logger.warning(f"Failed to build profile_pic URL: {str(e)}")

#         response_data = {
#             "profile": {
#                 "name": admin.name,
#                 "email": admin.email,
#                 "profile_pic": profile_pic_url
#             },
#             "stats": {"clients": 0, "active_clients": 0, "revenue": 0.0, "uptime": "0%"},
#             "subscriptions": [],
#             "payments": [],
#             "activities": [{"description": "No activities yet"}],
#             "network": {"latency": "0ms", "bandwidth": "0%"},
#             "routers": [{"name": "No routers", "status": "Offline", "color": "red"}]
#         }

#         try:
#             # Stats calculation
#             total_clients = Client.objects.count()
#             active_clients = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__gte=now()
#             ).values('client').distinct().count()
#             today = now().date()
#             daily_revenue = Payment.objects.filter(
#                 timestamp__date=today
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             uptime = self.calculate_uptime()
#             stats_data = {
#                 'clients': total_clients,
#                 'active_clients': active_clients,
#                 'revenue': float(daily_revenue) if daily_revenue else 0.0,
#                 'uptime': uptime,
#             }
#             response_data["stats"] = StatsSerializer(stats_data).data

#             # Recent subscriptions
#             recent_subscriptions = Subscription.objects.order_by('-start_date')[:5]
#             response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

#             # Recent payments
#             recent_payments = Payment.objects.order_by('-timestamp')[:5]
#             response_data["payments"] = PaymentSerializer(recent_payments, many=True).data

#             # Activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=admin) | Q(user__isnull=True)
#             ).order_by('-timestamp')[:4]
#             response_data["activities"] = ActivityLogSerializer(activities, many=True).data or [{"description": "No activities yet"}]

#             # Network and routers
#             routers = Router.objects.all()
#             avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
#             avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
#             network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
#             response_data["network"] = NetworkHealthSerializer(network_data).data
            
#             # Serialize routers
#             router_data = RouterSerializer(routers, many=True).data
#             response_data["routers"] = router_data or [{"name": "No routers", "status": "Offline", "color": "red"}]

#             logger.debug(f"Response data prepared: {response_data}")
#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_msg = "Failed to load profile data. Please try again later."
#             logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def put(self, request):
#         admin = request.user
#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin} on PUT")
#             raise PermissionDenied("You do not have permission to update this profile.")

#         try:
#             serializer = AdminProfileSerializer(admin, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"Admin {admin.name} updated their profile",
#                     user=admin
#                 )
#                 response_data = serializer.data
#                 if admin.profile_pic:
#                     response_data['profile_pic'] = request.build_absolute_uri(admin.profile_pic.url)
#                 logger.debug(f"Profile updated successfully: {response_data}")
#                 return Response(response_data, status=status.HTTP_200_OK)
            
#             logger.error(f"Profile update failed: {serializer.errors}")
#             return Response({"error": "Profile update failed. Please check your input.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             error_msg = "Failed to update profile. Please try again later."
#             logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def calculate_uptime(self):
#         # Example: Calculate uptime based on router status
#         total_routers = Router.objects.count()
#         online_routers = Router.objects.filter(status="Online").count()
#         if total_routers > 0:
#             uptime = (online_routers / total_routers) * 100
#             return f"{uptime:.1f}%"
#         return "0%"




# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, IsAdminUser
# from account.serializers.admin_serializer import AdminProfileSerializers, StatsSerializers, SubscriptionSerializers, PaymentSerializers, ActivityLogSerializers, NetworkHealthSerializers, RouterSerializers
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from rest_framework.exceptions import PermissionDenied
# from django.db.models import Sum, Q, Avg
# import logging
# import traceback
# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
# from django.utils.timezone import now
# from rest_framework import status

# # Configure logging to output to console
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# class AdminProfileView(APIView):
#     permission_classes = [IsAuthenticated, IsAdminUser]

#     @method_decorator(csrf_exempt)
#     def get(self, request):
#         admin = request.user
#         logger.debug(f"Authenticated user: {admin}, IsStaff: {admin.is_staff}, IsAuthenticated: {request.user.is_authenticated}")

#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin}")
#             raise PermissionDenied("You do not have permission to access this resource.")

#         # Safely handle profile fields
#         profile_pic_url = ""
#         if admin.profile_pic:
#             try:
#                 profile_pic_url = request.build_absolute_uri(admin.profile_pic.url)
#             except Exception as e:
#                 logger.warning(f"Failed to build profile_pic URL: {str(e)}")

#         response_data = {
#             "profile": {
#                 "name": admin.name,
#                 "email": admin.email,
#                 "profile_pic": profile_pic_url
#             },
#             "stats": {"clients": 0, "active_clients": 0, "revenue": 0.0, "uptime": "0%"},
#             "subscriptions": [],
#             "payments": [],
#             "activities": [{"description": "No activities yet"}],
#             "network": {"latency": "0ms", "bandwidth": "0%"},
#             "routers": [{"name": "No routers", "status": "Offline", "color": "red"}]
#         }

#         try:
#             # Stats calculation
#             total_clients = Client.objects.count()
#             active_clients = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__gte=now()
#             ).values('client').distinct().count()
#             today = now().date()
#             daily_revenue = Payment.objects.filter(
#                 timestamp__date=today
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             uptime = self.calculate_uptime()
#             stats_data = {
#                 'clients': total_clients,
#                 'active_clients': active_clients,
#                 'revenue': float(daily_revenue) if daily_revenue else 0.0,
#                 'uptime': uptime,
#             }
#             response_data["stats"] = StatsSerializers(stats_data).data

#             # Recent subscriptions
#             recent_subscriptions = Subscription.objects.order_by('-start_date')[:5]
#             response_data["subscriptions"] = SubscriptionSerializers(recent_subscriptions, many=True).data

#             # Recent payments
#             recent_payments = Payment.objects.order_by('-timestamp')[:5]
#             response_data["payments"] = PaymentSerializers(recent_payments, many=True).data

#             # Activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=admin) | Q(user__isnull=True)
#             ).order_by('-timestamp')[:4]
#             response_data["activities"] = ActivityLogSerializers(activities, many=True).data or [{"description": "No activities yet"}]

#             # Network and routers
#             routers = Router.objects.all()
#             avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
#             avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
#             network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
#             response_data["network"] = NetworkHealthSerializers(network_data).data
            
#             # Serialize routers
#             router_data = RouterSerializers(routers, many=True).data
#             response_data["routers"] = router_data or [{"name": "No routers", "status": "Offline", "color": "red"}]

#             logger.debug(f"Response data prepared: {response_data}")
#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_msg = "Failed to load profile data. Please try again later."
#             logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     @method_decorator(csrf_exempt)
#     def put(self, request):
#         admin = request.user
#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin} on PUT")
#             raise PermissionDenied("You do not have permission to update this profile.")

#         try:
#             serializer = AdminProfileSerializers(admin, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"Admin {admin.name} updated their profile",
#                     user=admin
#                 )
#                 response_data = serializer.data
#                 if admin.profile_pic:
#                     response_data['profile_pic'] = request.build_absolute_uri(admin.profile_pic.url)
#                 logger.debug(f"Profile updated successfully: {response_data}")
#                 return Response(response_data, status=status.HTTP_200_OK)
            
#             logger.error(f"Profile update failed: {serializer.errors}")
#             return Response({"error": "Profile update failed. Please check your input.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             error_msg = "Failed to update profile. Please try again later."
#             logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def calculate_uptime(self):
#         # Example: Calculate uptime based on router status
#         total_routers = Router.objects.count()
#         online_routers = Router.objects.filter(status="Online").count()
#         if total_routers > 0:
#             uptime = (online_routers / total_routers) * 100
#             return f"{uptime:.1f}%"
#         return "0%"




# # account/api/views/admin_view.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAdminUser
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, SubscriptionSerializer, 
#     PaymentSerializer, ActivityLogSerializer, NetworkHealthSerializer, RouterSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from rest_framework.exceptions import PermissionDenied
# from django.db.models import Sum, Q, Avg
# import logging
# import traceback
# from django.utils.timezone import now
# from rest_framework import status
# from django.contrib.auth import get_user_model

# # Configure logging to output to console
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# User = get_user_model()

# class AdminProfileView(APIView):
#     permission_classes = [IsAdminUser]

#     def dispatch(self, request, *args, **kwargs):
#         return super(AdminProfileView, self).dispatch(request, *args, **kwargs)

#     def get(self, request):
#         admin = request.user
#         logger.debug(f"Authenticated user: {admin}, IsStaff: {admin.is_staff}, IsAuthenticated: {request.user.is_authenticated}")

#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin}")
#             raise PermissionDenied("You do not have permission to access this resource.")

#         # Safely handle profile fields
#         profile_pic_url = ""
#         if admin.profile_pic:
#             try:
#                 profile_pic_url = request.build_absolute_uri(admin.profile_pic.url)
#             except Exception as e:
#                 logger.warning(f"Failed to build profile_pic URL: {str(e)}")

#         response_data = {
#             "profile": {
#                 "name": admin.name,
#                 "email": admin.email,
#                 "profile_pic": profile_pic_url
#             },
#             "stats": {"clients": 0, "active_clients": 0, "revenue": 0.0, "uptime": "0%"},
#             "subscriptions": [],
#             "payments": [],
#             "activities": [{"description": "No activities yet"}],
#             "network": {"latency": "0ms", "bandwidth": "0%"},
#             "routers": [{"name": "No routers", "status": "Offline", "color": "red"}]
#         }

#         try:
#             # Stats calculation
#             total_clients = Client.objects.count()
#             active_clients = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__gte=now()
#             ).values('client').distinct().count()
#             today = now().date()
#             daily_revenue = Payment.objects.filter(
#                 timestamp__date=today
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             uptime = self.calculate_uptime()
#             stats_data = {
#                 'clients': total_clients,
#                 'active_clients': active_clients,
#                 'revenue': float(daily_revenue) if daily_revenue else 0.0,
#                 'uptime': uptime,
#             }
#             response_data["stats"] = StatsSerializer(stats_data).data

#             # Recent subscriptions
#             recent_subscriptions = Subscription.objects.order_by('-start_date')[:5]
#             response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

#             # Recent payments
#             recent_payments = Payment.objects.order_by('-timestamp')[:5]
#             response_data["payments"] = PaymentSerializer(recent_payments, many=True).data

#             # Activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=admin) | Q(user__isnull=True)
#             ).order_by('-timestamp')[:4]
#             response_data["activities"] = ActivityLogSerializer(activities, many=True).data or [{"description": "No activities yet"}]

#             # Network and routers
#             routers = Router.objects.all()
#             avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
#             avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
#             network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
#             response_data["network"] = NetworkHealthSerializer(network_data).data
            
#             # Serialize routers
#             router_data = RouterSerializer(routers, many=True).data
#             response_data["routers"] = router_data or [{"name": "No routers", "status": "Offline", "color": "red"}]

#             logger.debug(f"Response data prepared: {response_data}")
#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_msg = "Failed to load profile data. Please try again later."
#             logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def put(self, request):
#         admin = request.user
#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin} on PUT")
#             raise PermissionDenied("You do not have permission to update this profile.")

#         try:
#             serializer = AdminProfileSerializer(admin, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"Admin {admin.name} updated their profile",
#                     user=admin
#                 )
#                 response_data = serializer.data
#                 if admin.profile_pic:
#                     response_data['profile_pic'] = request.build_absolute_uri(admin.profile_pic.url)
#                 logger.debug(f"Profile updated successfully: {response_data}")
#                 return Response(response_data, status=status.HTTP_200_OK)
            
#             logger.error(f"Profile update failed: {serializer.errors}")
#             return Response({"error": "Profile update failed. Please check your input.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             error_msg = "Failed to update profile. Please try again later."
#             logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def calculate_uptime(self):
#         total_routers = Router.objects.count()
#         online_routers = Router.objects.filter(status="Online").count()
#         if total_routers > 0:
#             uptime = (online_routers / total_routers) * 100
#             return f"{uptime:.1f}%"
#         return "0%"




# # account/api/views/admin_view.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAdminUser
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, SubscriptionSerializer, 
#     PaymentSerializer, ActivityLogSerializer, NetworkHealthSerializer, RouterSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from rest_framework.exceptions import PermissionDenied
# from django.db.models import Sum, Q, Avg
# import logging
# import traceback
# from django.utils.timezone import now
# from rest_framework import status
# from django.contrib.auth import get_user_model

# # Configure logging to output to console
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# User = get_user_model()

# class AdminProfileView(APIView):
#     permission_classes = [IsAdminUser]

#     def dispatch(self, request, *args, **kwargs):
#         logger.debug(f"Dispatching request: Method={request.method}, User={request.user}, Authenticated={request.user.is_authenticated}")
#         return super().dispatch(request, *args, **kwargs)

#     def get(self, request):
#         admin = request.user
#         logger.debug(f"GET request - User: {admin}, IsStaff: {admin.is_staff}, IsAuthenticated: {admin.is_authenticated}, Token: {request.auth}")

#         if not admin.is_authenticated:
#             logger.warning(f"User not authenticated: {admin}")
#             return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin} - is_staff=False")
#             raise PermissionDenied("You do not have permission to access this resource.")

#         # Safely handle profile fields
#         profile_pic_url = ""
#         if admin.profile_pic:
#             try:
#                 profile_pic_url = request.build_absolute_uri(admin.profile_pic.url)
#             except Exception as e:
#                 logger.warning(f"Failed to build profile_pic URL: {str(e)}")

#         response_data = {
#             "profile": {
#                 "name": admin.name or "Unknown",
#                 "email": admin.email or "",
#                 "profile_pic": profile_pic_url
#             },
#             "stats": {"clients": 0, "active_clients": 0, "revenue": 0.0, "uptime": "0%"},
#             "subscriptions": [],
#             "payments": [],
#             "activities": [{"description": "No activities yet"}],
#             "network": {"latency": "0ms", "bandwidth": "0%"},
#             "routers": [{"name": "No routers", "status": "Offline", "color": "red"}]
#         }

#         try:
#             # Stats calculation
#             total_clients = Client.objects.count()
#             active_clients = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__gte=now()
#             ).values('client').distinct().count()
#             today = now().date()
#             daily_revenue = Payment.objects.filter(
#                 timestamp__date=today
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             uptime = self.calculate_uptime()
#             stats_data = {
#                 'clients': total_clients,
#                 'active_clients': active_clients,
#                 'revenue': float(daily_revenue) if daily_revenue else 0.0,
#                 'uptime': uptime,
#             }
#             response_data["stats"] = StatsSerializer(stats_data).data

#             # Recent subscriptions
#             recent_subscriptions = Subscription.objects.order_by('-start_date')[:5]
#             response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

#             # Recent payments
#             recent_payments = Payment.objects.order_by('-timestamp')[:5]
#             response_data["payments"] = PaymentSerializer(recent_payments, many=True).data

#             # Activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=admin) | Q(user__isnull=True)
#             ).order_by('-timestamp')[:4]
#             response_data["activities"] = ActivityLogSerializer(activities, many=True).data or [{"description": "No activities yet"}]

#             # Network and routers
#             routers = Router.objects.all()
#             avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
#             avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
#             network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
#             response_data["network"] = NetworkHealthSerializer(network_data).data
            
#             # Serialize routers
#             router_data = RouterSerializer(routers, many=True).data
#             response_data["routers"] = router_data or [{"name": "No routers", "status": "Offline", "color": "red"}]

#             logger.debug(f"Response data prepared: {response_data}")
#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_msg = "Failed to load profile data. Please try again later."
#             logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def put(self, request):
#         admin = request.user
#         logger.debug(f"PUT request - User: {admin}, IsStaff: {admin.is_staff}, IsAuthenticated: {admin.is_authenticated}, Token: {request.auth}")

#         if not admin.is_authenticated:
#             logger.warning(f"User not authenticated: {admin}")
#             return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

#         if not admin.is_staff:
#             logger.warning(f"Permission denied for user {admin} on PUT - is_staff=False")
#             raise PermissionDenied("You do not have permission to update this profile.")

#         try:
#             serializer = AdminProfileSerializer(admin, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"Admin {admin.name} updated their profile",
#                     user=admin
#                 )
#                 response_data = serializer.data
#                 if admin.profile_pic:
#                     response_data['profile_pic'] = request.build_absolute_uri(admin.profile_pic.url)
#                 logger.debug(f"Profile updated successfully: {response_data}")
#                 return Response(response_data, status=status.HTTP_200_OK)
            
#             logger.error(f"Profile update failed: {serializer.errors}")
#             return Response({"error": "Profile update failed. Please check your input.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             error_msg = "Failed to update profile. Please try again later."
#             logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def calculate_uptime(self):
#         total_routers = Router.objects.count()
#         online_routers = Router.objects.filter(status="Online").count()
#         if total_routers > 0:
#             uptime = (online_routers / total_routers) * 100
#             return f"{uptime:.1f}%"
#         return "0%"







# # account/api/views/admin_view.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated 
# from account.serializers.admin_serializer import (
#     AdminProfileSerializer, StatsSerializer, SubscriptionSerializer, 
#     PaymentSerializer, ActivityLogSerializer, NetworkHealthSerializer, RouterSerializer
# )
# from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
# from rest_framework.exceptions import PermissionDenied
# from django.db.models import Sum, Q, Avg
# import logging
# import traceback
# from django.utils.timezone import now
# from rest_framework import status
# from django.contrib.auth import get_user_model

# # Configure logging to output to console
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# User = get_user_model()

# class AdminProfileView(APIView):
#     permission_classes = [IsAuthenticated]  

#     def dispatch(self, request, *args, **kwargs):
#         logger.debug(f"Dispatching request: Method={request.method}, User={request.user}, Authenticated={request.user.is_authenticated}")
#         return super().dispatch(request, *args, **kwargs)

#     def get(self, request):
#         user = request.user
#         logger.debug(f"GET request - User: {user}, IsStaff: {user.is_staff}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

#         if not user.is_authenticated:
#             logger.warning(f"User not authenticated: {user}")
#             return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

#         # Safely handle profile fields
#         profile_pic_url = ""
#         if user.profile_pic:
#             try:
#                 profile_pic_url = request.build_absolute_uri(user.profile_pic.url)
#             except Exception as e:
#                 logger.warning(f"Failed to build profile_pic URL: {str(e)}")

#         response_data = {
#             "profile": {
#                 "name": user.name or "Unknown",
#                 "email": user.email or "",
#                 "profile_pic": profile_pic_url
#             },
#             "stats": {"clients": 0, "active_clients": 0, "revenue": 0.0, "uptime": "0%"},
#             "subscriptions": [],
#             "payments": [],
#             "activities": [{"description": "No activities yet"}],
#             "network": {"latency": "0ms", "bandwidth": "0%"},
#             "routers": [{"name": "No routers", "status": "Offline", "color": "red"}]
#         }

#         try:
#             # Stats calculation
#             total_clients = Client.objects.count()
#             active_clients = Subscription.objects.filter(
#                 is_active=True,
#                 end_date__gte=now()
#             ).values('client').distinct().count()
#             today = now().date()
#             daily_revenue = Payment.objects.filter(
#                 timestamp__date=today
#             ).aggregate(total=Sum('amount'))['total'] or 0
#             uptime = self.calculate_uptime()
#             stats_data = {
#                 'clients': total_clients,
#                 'active_clients': active_clients,
#                 'revenue': float(daily_revenue) if daily_revenue else 0.0,
#                 'uptime': uptime,
#             }
#             response_data["stats"] = StatsSerializer(stats_data).data

#             # Recent subscriptions
#             recent_subscriptions = Subscription.objects.order_by('-start_date')[:5]
#             response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

#             # Recent payments
#             recent_payments = Payment.objects.order_by('-timestamp')[:5]
#             response_data["payments"] = PaymentSerializer(recent_payments, many=True).data

#             # Activities
#             activities = ActivityLog.objects.filter(
#                 Q(user=user) | Q(user__isnull=True)
#             ).order_by('-timestamp')[:4]
#             response_data["activities"] = ActivityLogSerializer(activities, many=True).data or [{"description": "No activities yet"}]

#             # Network and routers
#             routers = Router.objects.all()
#             avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
#             avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
#             network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
#             response_data["network"] = NetworkHealthSerializer(network_data).data
            
#             # Serialize routers
#             router_data = RouterSerializer(routers, many=True).data
#             response_data["routers"] = router_data or [{"name": "No routers", "status": "Offline", "color": "red"}]

#             logger.debug(f"Response data prepared: {response_data}")
#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             error_msg = "Failed to load profile data. Please try again later."
#             logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def put(self, request):
#         user = request.user
#         logger.debug(f"PUT request - User: {user}, IsStaff: {user.is_staff}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

#         if not user.is_authenticated:
#             logger.warning(f"User not authenticated: {user}")
#             return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

#         try:
#             serializer = AdminProfileSerializer(user, data=request.data, partial=True)
#             if serializer.is_valid():
#                 serializer.save()
#                 ActivityLog.objects.create(
#                     description=f"User {user.name} updated their profile",
#                     user=user
#                 )
#                 response_data = serializer.data
#                 if user.profile_pic:
#                     response_data['profile_pic'] = request.build_absolute_uri(user.profile_pic.url)
#                 logger.debug(f"Profile updated successfully: {response_data}")
#                 return Response(response_data, status=status.HTTP_200_OK)
            
#             logger.error(f"Profile update failed: {serializer.errors}")
#             return Response({"error": "Profile update failed. Please check your input.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
#         except Exception as e:
#             error_msg = "Failed to update profile. Please try again later."
#             logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
#             return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def calculate_uptime(self):
#         total_routers = Router.objects.count()
#         online_routers = Router.objects.filter(status="Online").count()
#         if total_routers > 0:
#             uptime = (online_routers / total_routers) * 100
#             return f"{uptime:.1f}%"
#         return "0%"






from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from account.serializers.admin_serializer import (
    AdminProfileSerializer, StatsSerializer, SubscriptionSerializer, 
    PaymentSerializer, ActivityLogSerializer, NetworkHealthSerializer, 
    RouterSerializer, ClientSerializer
)
from account.models.admin_model import Client, Subscription, Payment, ActivityLog, Router
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum, Q, Avg
import logging
import traceback
from django.utils.timezone import now
from rest_framework import status
from django.contrib.auth import get_user_model

# Configure logging to output to console
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

User = get_user_model()

class AdminProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        logger.debug(f"Dispatching request: Method={request.method}, User={request.user}, Authenticated={request.user.is_authenticated}")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        user = request.user
        logger.debug(f"GET request - User: {user}, IsStaff: {user.is_staff}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

        if not user.is_authenticated:
            logger.warning(f"User not authenticated: {user}")
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_staff:
            logger.warning(f"User {user} is not staff, denying access")
            raise PermissionDenied("You do not have permission to access this resource.")

        profile_pic_url = self._get_profile_pic_url(request, user)
        response_data = {
            "profile": {
                "name": user.name or "Unknown",
                "email": user.email or "",
                "profile_pic": profile_pic_url
            },
            "stats": {"clients": 0, "active_clients": 0, "revenue": 0.0, "uptime": "0%"},
            "subscriptions": [],
            "payments": [],
            "activities": [{"description": "No activities yet"}],
            "network": {"latency": "0ms", "bandwidth": "0%"},
            "routers": [{"name": "No routers", "status": "Offline", "color": "red"}]
        }

        try:
            # Stats calculation
            total_clients = Client.objects.count()
            active_clients = Subscription.objects.filter(
                is_active=True,
                end_date__gte=now()
            ).values('client').distinct().count()
            today = now().date()
            daily_revenue = Payment.objects.filter(
                timestamp__date=today
            ).aggregate(total=Sum('amount'))['total'] or 0
            uptime = self.calculate_uptime()
            stats_data = {
                'clients': total_clients,
                'active_clients': active_clients,
                'revenue': float(daily_revenue) if daily_revenue else 0.0,
                'uptime': uptime,
            }
            response_data["stats"] = StatsSerializer(stats_data).data

            # Recent subscriptions
            recent_subscriptions = Subscription.objects.select_related('client').order_by('-start_date')[:5]
            response_data["subscriptions"] = SubscriptionSerializer(recent_subscriptions, many=True).data

            # Recent payments
            recent_payments = Payment.objects.select_related('client').order_by('-timestamp')[:5]
            response_data["payments"] = PaymentSerializer(recent_payments, many=True).data

            # Activities
            activities = ActivityLog.objects.filter(
                Q(user=user) | Q(user__isnull=True)
            ).order_by('-timestamp')[:4]
            serialized_activities = ActivityLogSerializer(activities, many=True).data
            response_data["activities"] = serialized_activities if serialized_activities else [{"description": "No activities yet"}]

            # Network and routers
            routers = Router.objects.all()
            avg_latency = routers.exclude(latency__isnull=True).aggregate(Avg('latency'))['latency__avg'] or 0.0
            avg_bandwidth = routers.exclude(bandwidth_usage__isnull=True).aggregate(Avg('bandwidth_usage'))['bandwidth_usage__avg'] or 0.0
            network_data = {'latency': f"{avg_latency:.1f}ms", 'bandwidth': f"{avg_bandwidth:.1f}%"}
            response_data["network"] = NetworkHealthSerializer(network_data).data

            router_data = RouterSerializer(routers, many=True).data
            response_data["routers"] = router_data if router_data else [{"name": "No routers", "status": "Offline", "color": "red"}]

            logger.debug(f"Response data prepared: {response_data}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            error_msg = "Failed to load profile data. Please try again later."
            logger.error(f"Error in AdminProfileView GET: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        user = request.user
        logger.debug(f"PUT request - User: {user}, IsStaff: {user.is_staff}, IsAuthenticated: {user.is_authenticated}, Token: {request.auth}")

        if not user.is_authenticated:
            logger.warning(f"User not authenticated: {user}")
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_staff:
            logger.warning(f"User {user} is not staff, denying access")
            raise PermissionDenied("You do not have permission to access this resource.")

        try:
            serializer = AdminProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                ActivityLog.objects.create(
                    description=f"Admin {user.name} updated their profile",
                    user=user
                )
                response_data = serializer.data
                response_data['profile_pic'] = self._get_profile_pic_url(request, user)
                logger.debug(f"Profile updated successfully: {response_data}")
                return Response(response_data, status=status.HTTP_200_OK)

            logger.error(f"Profile update failed: {serializer.errors}")
            return Response({"error": "Profile update failed. Please check your input.", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            error_msg = "Failed to update profile. Please try again later."
            logger.error(f"Error in AdminProfileView PUT: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_profile_pic_url(self, request, user):
        try:
            return request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else ""
        except Exception as e:
            logger.warning(f"Failed to build profile_pic URL for {user}: {str(e)}")
            return ""

    def calculate_uptime(self):
        total_routers = Router.objects.count()
        online_routers = Router.objects.filter(status="Online").count()
        if total_routers > 0:
            uptime = (online_routers / total_routers) * 100
            return f"{uptime:.1f}%"
        return "0%"

class ClientListView(APIView):
    permission_classes = [AllowAny]  # Public signup

    def get(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            logger.warning(f"Unauthorized GET request to ClientListView by {request.user}")
            return Response({"detail": "Authentication required for this action."}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            clients = Client.objects.all()
            serializer = ClientSerializer(clients, many=True)
            logger.debug(f"Retrieved {clients.count()} clients")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in ClientListView GET: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": "Failed to retrieve clients."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        logger.debug(f"POST request to ClientListView: Data={request.data}")
        try:
            serializer = ClientSerializer(data=request.data)
            if serializer.is_valid():
                client = serializer.save()
                ActivityLog.objects.create(
                    description=f"New client signed up: {client.full_name} ({client.phonenumber})",
                    user=None
                )
                logger.debug(f"Client created successfully: {serializer.data}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            logger.error(f"Client creation failed: {serializer.errors}")
            return Response(
                {"error": "Failed to create client.", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in ClientListView POST: {str(e)}\n{traceback.format_exc()}")
            return Response({"error": "Failed to process signup request."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)