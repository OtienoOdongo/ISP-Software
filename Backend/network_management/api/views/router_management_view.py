





# # network_management/api/views

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from network_management.models.router_management_model import Router, RouterStats, HotspotUser
# from network_management.serializers.router_management_serializer import RouterSerializer, RouterStatsSerializer, HotspotUserSerializer
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from payments.models.payment_config_model import Transaction
# from routeros_api import RouterOsApiPool
# from django.utils import timezone
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# import os
# import requests  # For potential other router APIs
# import subprocess  # For ARP lookup

# @receiver(post_save, sender=Subscription)
# def activate_user_on_router(sender, instance, created, **kwargs):
#     if created and instance.is_active:
#         # Assume default router or find by logic (e.g., first connected)
#         router = Router.objects.filter(status="connected").first()
#         if not router:
#             # Log error or raise
#             return
#         # Assume MAC from transaction metadata (captured in payment initiation)
#         mac = instance.transaction.metadata.get('mac') if instance.transaction else None
#         if not mac:
#             # Log error
#             return
#         # Create HotspotUser
#         hotspot_user = HotspotUser.objects.create(
#             router=router,
#             client=instance.client,
#             plan=instance.internet_plan,
#             transaction=instance.transaction,
#             mac=mac,
#             ip=instance.transaction.metadata.get('ip', '0.0.0.0'),
#             active=True
#         )
#         # Activate on router based on type
#         if router.type == "mikrotik":
#             try:
#                 api_pool = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port)
#                 api = api_pool.get_api()
#                 hotspot = api.get_resource("/ip/hotspot/user")
#                 hotspot.add(
#                     name=instance.client.user.name,
#                     password=str(instance.client.id),
#                     profile=instance.internet_plan.name,
#                     mac_address=mac,
#                     limit_bytes_total=int(float(instance.internet_plan.data_limit_value) * (1024 ** 3 if instance.internet_plan.data_limit_unit == "GB" else 1024 ** 4)) if instance.internet_plan.data_limit_value != 'Unlimited' else 0
#                 )
#                 api_pool.disconnect()
#             except Exception as e:
#                 # Log error
#                 pass
#         elif router.type == "ubiquiti":
#             # Example UniFi API call (assume controller URL in router metadata or fixed)
#             # Use requests to post to UniFi controller API for authorizing guest
#             try:
#                 controller_url = "https://unifi-controller:8443/api/s/<site>/cmd/stamgr"
#                 data = {
#                     "cmd": "authorize-guest",
#                     "mac": mac.lower(),
#                     "minutes": int(instance.internet_plan.expiry_value) * (1440 if instance.internet_plan.expiry_unit == "Days" else 43200),  # Convert to minutes
#                     "up": int(float(instance.internet_plan.upload_speed_value)) if instance.internet_plan.upload_speed_value != 'Unlimited' else 0,
#                     "down": int(float(instance.internet_plan.download_speed_value)) if instance.internet_plan.download_speed_value != 'Unlimited' else 0,
#                     "bytes": int(float(instance.internet_plan.data_limit_value) * (1024 ** 3 if instance.internet_plan.data_limit_unit == "GB" else 1024 ** 4)) if instance.internet_plan.data_limit_value != 'Unlimited' else 0
#                 }
#                 requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
#             except Exception as e:
#                 # Log error
#                 pass
#         elif router.type == "cisco":
#             # Placeholder for Cisco API/CLI
#             pass
#         # Update subscription or log

# class RouterListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         routers = Router.objects.all()
#         serializer = RouterSerializer(routers, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = RouterSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(status="disconnected")
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class RouterDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Router.objects.get(pk=pk)
#         except Router.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         serializer = RouterSerializer(router)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         serializer = RouterSerializer(router, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         router.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class RouterActivateUserView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         router = Router.objects.filter(id=pk, status="connected").first()
#         if not router:
#             return Response({"error": "Router not found or not connected"}, status=status.HTTP_404_NOT_FOUND)
#         mac = request.data.get("mac")
#         plan_id = request.data.get("plan_id")
#         client_id = request.data.get("client_id")
#         transaction_id = request.data.get("transaction_id")
#         if not all([mac, plan_id, client_id]):
#             return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             client = Client.objects.get(id=client_id)
#             plan = InternetPlan.objects.get(id=plan_id)
#             transaction = Transaction.objects.get(id=transaction_id) if transaction_id else None
#             # Create HotspotUser
#             hotspot_user = HotspotUser.objects.create(
#                 router=router,
#                 client=client,
#                 plan=plan,
#                 transaction=transaction,
#                 mac=mac,
#                 ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
#                 active=True
#             )
#             # Type-specific activation
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port)
#                 api = api_pool.get_api()
#                 hotspot = api.get_resource("/ip/hotspot/user")
#                 hotspot.add(
#                     name=client.user.name,
#                     password=str(client.id),
#                     profile=plan.name,
#                     mac_address=mac,
#                     limit_bytes_total=int(float(plan.data_limit_value) * (1024 ** 3 if plan.data_limit_unit == "GB" else 1024 ** 4)) if plan.data_limit_value != 'Unlimited' else 0
#                 )
#                 api_pool.disconnect()
#             elif router.type == "ubiquiti":
#                 # UniFi example
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"  # Assume default site
#                 data = {
#                     "cmd": "authorize-guest",
#                     "mac": mac.lower(),
#                     "minutes": int(plan.expiry_value) * (1440 if plan.expiry_unit == "Days" else 43200),
#                     "up": int(float(plan.upload_speed_value)) if plan.upload_speed_value != 'Unlimited' else 0,
#                     "down": int(float(plan.download_speed_value)) if plan.download_speed_value != 'Unlimited' else 0,
#                     "bytes": int(float(plan.data_limit_value) * (1024 ** 3 if plan.data_limit_unit == "GB" else 1024 ** 4)) if plan.data_limit_value != 'Unlimited' else 0
#                 }
#                 response = requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
#                 if response.status_code != 200:
#                     raise Exception("Ubiquiti activation failed")
#             elif router.type == "cisco":
#                 # Placeholder for Cisco Meraki or IOS API
#                 pass
#             elif router.type == "other":
#                 # Custom logic, e.g., call external script
#                 pass
#             serializer = HotspotUserSerializer(hotspot_user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class RouterStatsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Router.objects.get(pk=pk)
#         except Router.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         try:
#             if router.type == "mikrotik":
#                 api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#                 system = api.get_resource("/system/resource").get()[0]
#                 hotspot = api.get_resource("/ip/hotspot/active").get()
#                 stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]
#                 latest_stats = {
#                     "cpu": float(system.get("cpu-load", 0)),
#                     "memory": float(system.get("free-memory", 0)) / 1024 / 1024,
#                     "clients": len(hotspot),
#                     "uptime": system.get("uptime", "0%"),
#                     "signal": -60,  # Placeholder
#                     "temperature": float(system.get("cpu-temperature", 0)),
#                     "throughput": float(api.get_resource("/interface").get()[0].get("rx-byte", 0)) / 1024 / 1024,
#                     "disk": float(system.get("free-hdd-space", 0)) / float(system.get("total-hdd-space", 1)) * 100,
#                     "timestamp": timezone.now()
#                 }
#                 RouterStats.objects.create(router=router, **latest_stats)
#                 serializer = RouterStatsSerializer(stats, many=True)
#                 history = {key: [getattr(s, key) for s in stats] for key in latest_stats if key != "timestamp"}
#                 history["timestamps"] = [s.timestamp.strftime("%H:%M:%S") for s in stats]
#                 api.close()
#                 return Response({"latest": latest_stats, "history": history})
#             elif router.type == "ubiquiti":
#                 # Example UniFi stats fetch
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/stat/sta"
#                 response = requests.get(controller_url, auth=(router.username, router.password), verify=False)
#                 data = response.json().get('data', [])
#                 # Aggregate stats
#                 latest_stats = {
#                     "cpu": 0,  # Placeholder, fetch from device status
#                     "memory": 0,
#                     "clients": len(data),
#                     "uptime": "N/A",
#                     "signal": sum([sta.get('signal', 0) for sta in data]) / len(data) if data else 0,
#                     "temperature": 0,
#                     "throughput": sum([sta.get('rx_rate', 0) + sta.get('tx_rate', 0) for sta in data]) / 1024 / 1024,
#                     "disk": 0,
#                     "timestamp": timezone.now()
#                 }
#                 RouterStats.objects.create(router=router, **latest_stats)
#                 # History similar
#                 return Response({"latest": latest_stats, "history": {}})  # Implement history
#             # Add for other types
#             return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class RouterRebootView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Router.objects.get(pk=pk)
#         except Router.DoesNotExist:
#             return None

#     def post(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         try:
#             if router.type == "mikrotik":
#                 api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#                 api.get_resource("/system").call("reboot")
#                 api.close()
#             elif router.type == "ubiquiti":
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
#                 data = {"cmd": "restart", "mac": "all"}  # Or specific device
#                 requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
#             # Add for others
#             router.status = "updating"
#             router.save()
#             return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class HotspotUsersView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Router.objects.get(pk=pk)
#         except Router.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         users = HotspotUser.objects.filter(router=router)
#         serializer = HotspotUserSerializer(users, many=True)
#         return Response(serializer.data)

# class HotspotUserDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return HotspotUser.objects.get(pk=pk)
#         except HotspotUser.DoesNotExist:
#             return None

#     def delete(self, request, pk):
#         user = self.get_object(pk)
#         if not user:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         try:
#             router = user.router
#             if router.type == "mikrotik":
#                 api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#                 api.get_resource("/ip/hotspot/active").remove(id=user.mac)
#                 api.close()
#             elif router.type == "ubiquiti":
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
#                 data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
#                 requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
#             # Add for others
#             user.delete()
#             return Response(status=status.HTTP_204_NO_CONTENT)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class HotspotConfigView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         try:
#             return Router.objects.get(pk=pk)
#         except Router.DoesNotExist:
#             return None

#     def post(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         try:
#             landing_page = request.FILES.get("landingPage")
#             if landing_page:
#                 path = f"media/hotspot/{landing_page.name}"
#                 with open(path, "wb+") as destination:
#                     for chunk in landing_page.chunks():
#                         destination.write(chunk)
#             else:
#                 return Response({"error": "Landing page required"}, status=status.HTTP_400_BAD_REQUEST)

#             hotspot_config = {
#                 "ssid": request.data.get("ssid", "SurfZone-WiFi"),
#                 "redirectUrl": request.data.get("redirectUrl", "http://captive.surfzone.local"),
#                 "bandwidthLimit": request.data.get("bandwidthLimit", "10M"),
#                 "sessionTimeout": request.data.get("sessionTimeout", "60"),
#                 "authMethod": "universal",
#                 "landingPage": landing_page.name
#             }
#             router.hotspot_config = hotspot_config
#             router.save()

#             if router.type == "mikrotik":
#                 api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#                 api.get_resource("/ip/hotspot").set(id="*0", name=hotspot_config["ssid"], interface="bridge", pool="dhcp_pool0", profile="hsprof1")
#                 api.get_resource("/ip/hotspot/profile").set(id="hsprof1", login_by="universal", html_directory="hotspot")
#                 with open(path, "rb") as f:
#                     api.get_resource("/file").call("upload", file=f.read(), name=f"hotspot/{landing_page.name}")
#                 api.close()
#             elif router.type == "ubiquiti":
#                 # UniFi hotspot config example
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/set/setting/guest_access"
#                 data = {
#                     "portal_enabled": True,
#                     "portal_customized": True,
#                     "redirect_enabled": True,
#                     "redirect_url": hotspot_config["redirectUrl"],
#                     # Upload landing page to controller if needed
#                 }
#                 requests.put(controller_url, json=data, auth=(router.username, router.password), verify=False)
#             # Add for others
#             return Response({"message": "Hotspot configured"}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class BulkActionView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         router_ids = request.data.get("router_ids", [])
#         action = request.data.get("action")
#         if not router_ids or action not in ["connect", "disconnect", "delete", "reboot"]:
#             return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
#         routers = Router.objects.filter(id__in=router_ids)
#         try:
#             for router in routers:
#                 if action == "connect":
#                     if router.type == "mikrotik":
#                         # Test connection
#                         RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api().close()
#                     elif router.type == "ubiquiti":
#                         requests.get(f"https://{router.ip}:{router.port}/api/login", auth=(router.username, router.password), verify=False)
#                     # Add for others
#                     router.status = "connected"
#                 elif action == "disconnect":
#                     router.status = "disconnected"
#                 elif action == "reboot":
#                     if router.type == "mikrotik":
#                         api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#                         api.get_resource("/system").call("reboot")
#                         api.close()
#                     # Add for others
#                     router.status = "updating"
#                 router.save()
#             if action == "delete":
#                 routers.delete()
#             return Response({"message": f"Bulk {action} completed"}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class GetMacView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         client_ip = request.META.get('REMOTE_ADDR')
#         try:
#             # Use ARP to get MAC (Linux/MacOS example; adjust for server OS)
#             result = subprocess.run(['arp', '-n', client_ip], capture_output=True, text=True)
#             output = result.stdout
#             mac = output.split()[3] if len(output.split()) > 3 else None
#             if mac and len(mac) == 17:
#                 return Response({"mac": mac.upper()})
#             else:
#                 return Response({"mac": "00:00:00:00:00:00"})
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









import subprocess
import logging
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from routeros_api import RouterOsApiPool
import requests
from datetime import timedelta

from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, ActivationAttempt, 
    RouterSessionHistory, RouterHealthCheck
)
from network_management.serializers.router_management_serializer import (
    RouterSerializer, RouterStatsSerializer, HotspotUserSerializer,
    ActivationAttemptSerializer, RouterSessionHistorySerializer,
    RouterHealthCheckSerializer
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from payments.models.payment_config_model import Transaction
from django.contrib.auth import get_user_model

User = get_user_model()

logger = logging.getLogger(__name__)

class RouterListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        routers = Router.objects.filter(is_active=True)
        serializer = RouterSerializer(routers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RouterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(status="disconnected")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RouterDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        router = self.get_object(pk)
        serializer = RouterSerializer(router)
        return Response(serializer.data)

    def put(self, request, pk):
        router = self.get_object(pk)
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        router = self.get_object(pk)
        router.is_active = False
        router.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RouterActivateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        router = Router.objects.filter(id=pk, status="connected", is_active=True).first()
        if not router:
            return Response({"error": "Router not found or not connected"}, status=status.HTTP_404_NOT_FOUND)
        
        mac = request.data.get("mac")
        plan_id = request.data.get("plan_id")
        client_id = request.data.get("client_id")
        transaction_id = request.data.get("transaction_id")
        
        if not all([mac, plan_id, client_id]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client = Client.objects.get(id=client_id)
            plan = InternetPlan.objects.get(id=plan_id)
            transaction = Transaction.objects.get(id=transaction_id) if transaction_id else None
            
            # Check if user already has an active session
            existing_session = HotspotUser.objects.filter(
                client=client, active=True
            ).first()
            
            if existing_session:
                # If user has existing session, transfer it to this router
                existing_session.active = False
                existing_session.disconnected_at = timezone.now()
                existing_session.save()
                
                # Create session history record
                session_duration = (timezone.now() - existing_session.connected_at).seconds
                RouterSessionHistory.objects.create(
                    hotspot_user=existing_session,
                    router=existing_session.router,
                    start_time=existing_session.connected_at,
                    end_time=timezone.now(),
                    data_used=existing_session.data_used,
                    duration=session_duration,
                    disconnected_reason="router_switch"
                )
            
            # Calculate remaining time if user had previous sessions
            remaining_time = self.calculate_remaining_time(client, plan)
            
            # Create new hotspot user
            hotspot_user = HotspotUser.objects.create(
                router=router,
                client=client,
                plan=plan,
                transaction=transaction,
                mac=mac,
                ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
                active=True,
                remaining_time=remaining_time
            )
            
            # Type-specific activation
            success, error = self.activate_on_router(router, hotspot_user)
            
            if success:
                serializer = HotspotUserSerializer(hotspot_user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                hotspot_user.delete()
                return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error activating user: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def calculate_remaining_time(self, client, plan):
        """Calculate remaining time based on previous sessions"""
        # Get all sessions for this client and plan
        sessions = HotspotUser.objects.filter(
            client=client, 
            plan=plan,
            active=False
        )
        
        total_used_time = sum(session.total_session_time for session in sessions)
        
        # Calculate plan duration in seconds
        if plan.expiry_unit == 'Hours':
            plan_duration = plan.expiry_value * 3600
        elif plan.expiry_unit == 'Days':
            plan_duration = plan.expiry_value * 86400
        else:  # Unlimited or other
            plan_duration = 0
        
        # Calculate remaining time
        remaining_time = max(0, plan_duration - total_used_time) if plan_duration > 0 else 0
        
        return remaining_time
    
    def activate_on_router(self, router, hotspot_user):
        """Router-specific activation logic"""
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip, 
                    username=router.username, 
                    password=router.password, 
                    port=router.port
                )
                api = api_pool.get_api()
                hotspot = api.get_resource("/ip/hotspot/user")
                
                # Calculate data limit in bytes
                data_limit = 0
                if hotspot_user.plan.data_limit_value != 'Unlimited':
                    multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                    data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
                
                # Add user to hotspot
                hotspot.add(
                    name=hotspot_user.client.user.username,
                    password=str(hotspot_user.client.id),
                    profile=hotspot_user.plan.name,
                    mac_address=hotspot_user.mac,
                    limit_bytes_total=data_limit
                )
                
                # Set session timeout if plan has time limit
                if hotspot_user.remaining_time > 0:
                    # Convert seconds to minutes for MikroTik
                    timeout_minutes = max(1, hotspot_user.remaining_time // 60)
                    api.get_resource("/ip/hotspot/active").set(
                        mac_address=hotspot_user.mac.lower(),
                        idle_timeout=f"{timeout_minutes}m"
                    )
                
                api_pool.disconnect()
                return True, None
                
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                
                # Calculate authorization duration in minutes
                auth_minutes = max(1, hotspot_user.remaining_time // 60) if hotspot_user.remaining_time > 0 else 1440
                
                data = {
                    "cmd": "authorize-guest",
                    "mac": hotspot_user.mac.lower(),
                    "minutes": auth_minutes,
                    "up": int(float(hotspot_user.plan.upload_speed_value)) if hotspot_user.plan.upload_speed_value != 'Unlimited' else 0,
                    "down": int(float(hotspot_user.plan.download_speed_value)) if hotspot_user.plan.download_speed_value != 'Unlimited' else 0,
                    "bytes": int(float(hotspot_user.plan.data_limit_value) * (1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4)) if hotspot_user.plan.data_limit_value != 'Unlimited' else 0
                }
                
                response = requests.post(
                    controller_url, 
                    json=data, 
                    auth=(router.username, router.password), 
                    verify=False,
                    timeout=10
                )
                
                if response.status_code == 200:
                    return True, None
                else:
                    return False, f"Ubiquiti API error: {response.status_code}"
                    
            elif router.type == "cisco":
                # Placeholder for Cisco implementation
                return True, None
                
            else:
                return False, f"Unsupported router type: {router.type}"
                
        except Exception as e:
            logger.error(f"Error activating on router {router.id}: {str(e)}")
            return False, str(e)

class RouterStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        router = self.get_object(pk)
        try:
            if router.type == "mikrotik":
                api = RouterOsApiPool(
                    router.ip, 
                    username=router.username, 
                    password=router.password, 
                    port=router.port
                ).get_api()
                
                system = api.get_resource("/system/resource").get()[0]
                hotspot = api.get_resource("/ip/hotspot/active").get()
                
                stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]
                latest_stats = {
                    "cpu": float(system.get("cpu-load", 0)),
                    "memory": float(system.get("free-memory", 0)) / 1024 / 1024,
                    "clients": len(hotspot),
                    "uptime": system.get("uptime", "0%"),
                    "signal": -60,  # Placeholder
                    "temperature": float(system.get("cpu-temperature", 0)),
                    "throughput": float(api.get_resource("/interface").get()[0].get("rx-byte", 0)) / 1024 / 1024,
                    "disk": float(system.get("free-hdd-space", 0)) / float(system.get("total-hdd-space", 1)) * 100,
                    "timestamp": timezone.now()
                }
                
                RouterStats.objects.create(router=router, **latest_stats)
                serializer = RouterStatsSerializer(stats, many=True)
                
                history = {key: [getattr(s, key) for s in stats] for key in latest_stats if key != "timestamp"}
                history["timestamps"] = [s.timestamp.strftime("%H:%M:%S") for s in stats]
                
                api.close()
                return Response({"latest": latest_stats, "history": history})
                
            elif router.type == "ubiquiti":
                # UniFi stats implementation
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/stat/sta"
                response = requests.get(
                    controller_url, 
                    auth=(router.username, router.password), 
                    verify=False,
                    timeout=10
                )
                
                data = response.json().get('data', [])
                latest_stats = {
                    "cpu": 0,  # Placeholder
                    "memory": 0,
                    "clients": len(data),
                    "uptime": "N/A",
                    "signal": sum([sta.get('signal', 0) for sta in data]) / len(data) if data else 0,
                    "temperature": 0,
                    "throughput": sum([sta.get('rx_rate', 0) + sta.get('tx_rate', 0) for sta in data]) / 1024 / 1024,
                    "disk": 0,
                    "timestamp": timezone.now()
                }
                
                RouterStats.objects.create(router=router, **latest_stats)
                return Response({"latest": latest_stats, "history": {}})
                
            return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error getting router stats: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterRebootView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def post(self, request, pk):
        router = self.get_object(pk)
        try:
            if router.type == "mikrotik":
                api = RouterOsApiPool(
                    router.ip, 
                    username=router.username, 
                    password=router.password, 
                    port=router.port
                ).get_api()
                api.get_resource("/system").call("reboot")
                api.close()
                
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
                data = {"cmd": "restart", "mac": "all"}
                requests.post(
                    controller_url, 
                    json=data, 
                    auth=(router.username, router.password), 
                    verify=False,
                    timeout=10
                )
            
            # Save all active sessions before reboot
            active_users = HotspotUser.objects.filter(router=router, active=True)
            for user in active_users:
                user.active = False
                user.disconnected_at = timezone.now()
                user.save()
                
                # Record session history
                session_duration = (timezone.now() - user.connected_at).seconds
                RouterSessionHistory.objects.create(
                    hotspot_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=user.data_used,
                    duration=session_duration,
                    disconnected_reason="router_reboot"
                )
            
            router.status = "updating"
            router.save()
            
            return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error rebooting router: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HotspotUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        router = self.get_object(pk)
        users = HotspotUser.objects.filter(router=router).order_by('-connected_at')
        serializer = HotspotUserSerializer(users, many=True)
        return Response(serializer.data)

class HotspotUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(HotspotUser, pk=pk)

    def delete(self, request, pk):
        user = self.get_object(pk)
        try:
            router = user.router
            
            if router.type == "mikrotik":
                api = RouterOsApiPool(
                    router.ip, 
                    username=router.username, 
                    password=router.password, 
                    port=router.port
                ).get_api()
                api.get_resource("/ip/hotspot/active").remove(mac=user.mac.lower())
                api.close()
                
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
                requests.post(
                    controller_url, 
                    json=data, 
                    auth=(router.username, router.password), 
                    verify=False,
                    timeout=10
                )
            
            # Record session history
            if user.active:
                session_duration = (timezone.now() - user.connected_at).seconds
                RouterSessionHistory.objects.create(
                    hotspot_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=user.data_used,
                    duration=session_duration,
                    disconnected_reason="manual_disconnect"
                )
            
            user.active = False
            user.disconnected_at = timezone.now()
            user.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(f"Error disconnecting user: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HotspotConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def post(self, request, pk):
        router = self.get_object(pk)
        try:
            landing_page = request.FILES.get("landingPage")
            if landing_page:
                path = f"media/hotspot/{landing_page.name}"
                with open(path, "wb+") as destination:
                    for chunk in landing_page.chunks():
                        destination.write(chunk)
            else:
                return Response({"error": "Landing page required"}, status=status.HTTP_400_BAD_REQUEST)

            hotspot_config = {
                "ssid": request.data.get("ssid", "SurfZone-WiFi"),
                "redirectUrl": request.data.get("redirectUrl", "http://captive.surfzone.local"),
                "bandwidthLimit": request.data.get("bandwidthLimit", "10M"),
                "sessionTimeout": request.data.get("sessionTimeout", "60"),
                "authMethod": "universal",
                "landingPage": landing_page.name
            }
            
            router.hotspot_config = hotspot_config
            router.save()

            if router.type == "mikrotik":
                api = RouterOsApiPool(
                    router.ip, 
                    username=router.username, 
                    password=router.password, 
                    port=router.port
                ).get_api()
                
                api.get_resource("/ip/hotspot").set(
                    id="*0", 
                    name=hotspot_config["ssid"], 
                    interface="bridge", 
                    pool="dhcp_pool0", 
                    profile="hsprof1"
                )
                
                api.get_resource("/ip/hotspot/profile").set(
                    id="hsprof1", 
                    login_by="universal", 
                    html_directory="hotspot"
                )
                
                with open(path, "rb") as f:
                    api.get_resource("/file").call(
                        "upload", 
                        file=f.read(), 
                        name=f"hotspot/{landing_page.name}"
                    )
                
                api.close()
                
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/set/setting/guest_access"
                data = {
                    "portal_enabled": True,
                    "portal_customized": True,
                    "redirect_enabled": True,
                    "redirect_url": hotspot_config["redirectUrl"],
                }
                requests.put(
                    controller_url, 
                    json=data, 
                    auth=(router.username, router.password), 
                    verify=False,
                    timeout=10
                )
            
            return Response({"message": "Hotspot configured"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error configuring hotspot: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BulkActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        router_ids = request.data.get("router_ids", [])
        action = request.data.get("action")
        
        if not router_ids or action not in ["connect", "disconnect", "delete", "reboot"]:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
        
        routers = Router.objects.filter(id__in=router_ids, is_active=True)
        try:
            for router in routers:
                if action == "connect":
                    if router.type == "mikrotik":
                        RouterOsApiPool(
                            router.ip, 
                            username=router.username, 
                            password=router.password, 
                            port=router.port
                        ).get_api().close()
                    elif router.type == "ubiquiti":
                        requests.get(
                            f"https://{router.ip}:{router.port}/api/login", 
                            auth=(router.username, router.password), 
                            verify=False,
                            timeout=10
                        )
                    router.status = "connected"
                    
                elif action == "disconnect":
                    router.status = "disconnected"
                    
                elif action == "reboot":
                    if router.type == "mikrotik":
                        api = RouterOsApiPool(
                            router.ip, 
                            username=router.username, 
                            password=router.password, 
                            port=router.port
                        ).get_api()
                        api.get_resource("/system").call("reboot")
                        api.close()
                    router.status = "updating"
                    
                router.save()
                
            if action == "delete":
                routers.update(is_active=False)
                
            return Response({"message": f"Bulk {action} completed"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error performing bulk action: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetMacView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client_ip = request.META.get('REMOTE_ADDR')
        mac = self.get_mac_address(client_ip)
        return Response({"mac": mac.upper() if mac else "00:00:00:00:00:00"})
    
    def get_mac_address(self, ip):
        # Method 1: ARP table (Linux/MacOS)
        try:
            result = subprocess.run(['arp', '-n', ip], capture_output=True, text=True)
            output = result.stdout
            if len(output.split()) > 3:
                return output.split()[3]
        except:
            pass
        
        # Method 2: Windows ARP
        try:
            result = subprocess.run(['arp', '-a', ip], capture_output=True, text=True)
            output = result.stdout
            # Parse Windows ARP output
            lines = output.split('\n')
            for line in lines:
                if ip in line:
                    parts = line.split()
                    if len(parts) > 1:
                        return parts[1]
        except:
            pass
        
        # Method 3: Database lookup for previously seen clients
        try:
            recent_user = HotspotUser.objects.filter(ip=ip).order_by('-connected_at').first()
            if recent_user:
                return recent_user.mac
        except:
            pass
        
        return None

class RouterHealthCheckView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        routers = Router.objects.filter(is_active=True)
        health_data = []
        
        for router in routers:
            try:
                start_time = timezone.now()
                
                if router.type == "mikrotik":
                    api = RouterOsApiPool(
                        router.ip, 
                        username=router.username, 
                        password=router.password, 
                        port=router.port,
                        plaintext_login=True
                    )
                    connection = api.get_api()
                    connection.close()
                    response_time = (timezone.now() - start_time).total_seconds()
                    
                    RouterHealthCheck.objects.create(
                        router=router,
                        is_online=True,
                        response_time=response_time
                    )
                    
                    health_data.append({
                        "router": router.name,
                        "status": "online",
                        "response_time": response_time
                    })
                    
                elif router.type == "ubiquiti":
                    response = requests.get(
                        f"https://{router.ip}:{router.port}/api/self", 
                        auth=(router.username, router.password), 
                        verify=False,
                        timeout=10
                    )
                    
                    response_time = (timezone.now() - start_time).total_seconds()
                    
                    RouterHealthCheck.objects.create(
                        router=router,
                        is_online=response.status_code == 200,
                        response_time=response_time
                    )
                    
                    health_data.append({
                        "router": router.name,
                        "status": "online" if response.status_code == 200 else "offline",
                        "response_time": response_time
                    })
                    
            except Exception as e:
                RouterHealthCheck.objects.create(
                    router=router,
                    is_online=False,
                    error_message=str(e)
                )
                
                health_data.append({
                    "router": router.name,
                    "status": "offline",
                    "error": str(e)
                })
        
        return Response(health_data)

class RestoreSessionsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        """Restore user sessions after router comes back online"""
        router = get_object_or_404(Router, pk=pk, is_active=True)
        
        if router.status != "connected":
            return Response({"error": "Router is not connected"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find sessions that were active when router went offline
        cutoff_time = timezone.now() - timedelta(hours=24)  # Look back 24 hours
        interrupted_sessions = RouterSessionHistory.objects.filter(
            router=router,
            end_time__gte=cutoff_time,
            disconnected_reason__in=["router_reboot", "power_outage", "router_switch"]
        )
        
        restored_count = 0
        for session in interrupted_sessions:
            # Check if user still has remaining time
            if session.hotspot_user.remaining_time > 0:
                # Reactivate user on router
                hotspot_user = session.hotspot_user
                hotspot_user.active = True
                hotspot_user.router = router
                hotspot_user.connected_at = timezone.now()
                hotspot_user.disconnected_at = None
                hotspot_user.save()
                
                # Activate on router
                success, error = self.activate_on_router(router, hotspot_user)
                
                if success:
                    restored_count += 1
                    # Update session history
                    session.disconnected_reason = f"restored_{session.disconnected_reason}"
                    session.save()
        
        return Response({
            "message": f"Restored {restored_count} sessions",
            "restored_count": restored_count
        })
    
    def activate_on_router(self, router, hotspot_user):
        """Reuse the activation logic from RouterActivateUserView"""
        view = RouterActivateUserView()
        return view.activate_on_router(router, hotspot_user)

class UserSessionRecoveryView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Allow users to recover their session after router outage"""
        phone_number = request.data.get("phone_number")
        mac_address = request.data.get("mac_address")
        
        if not phone_number or not mac_address:
            return Response(
                {"error": "Phone number and MAC address are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find client by phone number
            user = User.objects.get(phone_number=phone_number, user_type='client')
            client = Client.objects.get(user=user)
            
            # Find the most recent session for this client and MAC
            recent_session = HotspotUser.objects.filter(
                client=client, 
                mac=mac_address
            ).order_by('-connected_at').first()
            
            if not recent_session:
                return Response(
                    {"error": "No session found for this device"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if there's remaining time
            if recent_session.remaining_time <= 0:
                return Response(
                    {"error": "No remaining time in your session"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find an available router
            router = Router.objects.filter(
                status="connected", 
                is_active=True,
                captive_portal_enabled=True
            ).first()
            
            if not router:
                return Response(
                    {"error": "No routers available at the moment"}, 
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # Create new hotspot user with remaining time
            new_hotspot_user = HotspotUser.objects.create(
                router=router,
                client=client,
                plan=recent_session.plan,
                transaction=recent_session.transaction,
                mac=mac_address,
                ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
                active=True,
                remaining_time=recent_session.remaining_time,
                total_session_time=recent_session.total_session_time
            )
            
            # Activate on router
            view = RouterActivateUserView()
            success, error = view.activate_on_router(router, new_hotspot_user)
            
            if success:
                serializer = HotspotUserSerializer(new_hotspot_user)
                return Response({
                    "message": "Session restored successfully",
                    "session": serializer.data
                })
            else:
                new_hotspot_user.delete()
                return Response(
                    {"error": f"Failed to activate session: {error}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Client.DoesNotExist:
            return Response(
                {"error": "Client not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error recovering session: {str(e)}")
            return Response(
                {"error": "Internal server error"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )