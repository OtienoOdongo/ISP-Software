

# import subprocess
# import logging
# import warnings
# from datetime import timedelta

# from django.utils import timezone
# from django.db import transaction
# from django.shortcuts import get_object_or_404

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated, AllowAny

# import requests
# from routeros_api import RouterOsApiPool

# import warnings
# from urllib3.exceptions import InsecureRequestWarning

# from network_management.models.router_management_model import (
#     Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt,
#     RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig
# )
# from network_management.serializers.router_management_serializer import (
#     RouterSerializer, RouterStatsSerializer, HotspotUserSerializer,
#     PPPoEUserSerializer, ActivationAttemptSerializer, RouterSessionHistorySerializer,
#     RouterHealthCheckSerializer, RouterCallbackConfigSerializer
# )
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan, Subscription
# from payments.models.payment_config_model import Transaction
# from django.contrib.auth import get_user_model

# User = get_user_model()

# logger = logging.getLogger(__name__)

# # Suppress InsecureRequestWarning for self-signed / internal controllers 
# warnings.simplefilter('ignore', InsecureRequestWarning)


# class RouterListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         routers = Router.objects.filter(is_active=True)
#         serializer = RouterSerializer(routers, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = RouterSerializer(data=request.data)
#         if serializer.is_valid():
#             router = serializer.save(status="disconnected")
#             # Conform callback URL
#             router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
#             router.save()
#             return Response(RouterSerializer(router).data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RouterDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         serializer = RouterSerializer(router)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         router = self.get_object(pk)
#         serializer = RouterSerializer(router, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         router = self.get_object(pk)
#         router.is_active = False
#         router.save()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class RouterActivateUserView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         router = Router.objects.filter(id=pk, status="connected", is_active=True).first()
#         if not router:
#             return Response({"error": "Router not found or not connected"}, status=status.HTTP_404_NOT_FOUND)

#         connection_type = request.data.get("connection_type", "hotspot")  # NEW: hotspot or pppoe
#         mac = (request.data.get("mac") or "").lower()
#         username = request.data.get("username")  # NEW: for PPPoE
#         password = request.data.get("password")  # NEW: for PPPoE
#         plan_id = request.data.get("plan_id")
#         client_id = request.data.get("client_id")
#         transaction_id = request.data.get("transaction_id")

#         if connection_type == "hotspot" and not all([mac, plan_id, client_id]):
#             return Response({"error": "Missing required fields for hotspot"}, status=status.HTTP_400_BAD_REQUEST)
#         elif connection_type == "pppoe" and not all([username, password, plan_id, client_id]):
#             return Response({"error": "Missing required fields for PPPoE"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             client = Client.objects.get(id=client_id)
#             plan = InternetPlan.objects.get(id=plan_id)
#             transaction = None
#             if transaction_id:
#                 try:
#                     transaction = Transaction.objects.get(id=transaction_id)
#                 except Transaction.DoesNotExist:
#                     transaction = None

#             if connection_type == "hotspot":
#                 return self.activate_hotspot_user(router, client, plan, transaction, mac, request)
#             elif connection_type == "pppoe":
#                 return self.activate_pppoe_user(router, client, plan, transaction, username, password, request)
#             else:
#                 return Response({"error": "Invalid connection type"}, status=status.HTTP_400_BAD_REQUEST)

#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except InternetPlan.DoesNotExist:
#             return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.exception("Error activating user")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def activate_hotspot_user(self, router, client, plan, transaction, mac, request):
#         # End any existing active session for the client
#         existing_session = HotspotUser.objects.filter(client=client, active=True).first()
#         if existing_session:
#             existing_session.active = False
#             existing_session.disconnected_at = timezone.now()
#             existing_session.save()

#             session_duration = int((timezone.now() - existing_session.connected_at).total_seconds())
#             RouterSessionHistory.objects.create(
#                 hotspot_user=existing_session,
#                 router=existing_session.router,
#                 start_time=existing_session.connected_at,
#                 end_time=timezone.now(),
#                 data_used=getattr(existing_session, "data_used", 0),
#                 duration=session_duration,
#                 disconnected_reason="router_switch",
#                 user_type="hotspot"
#             )

#         remaining_time = self.calculate_remaining_time(client, plan)

#         hotspot_user = HotspotUser.objects.create(
#             router=router,
#             client=client,
#             plan=plan,
#             transaction=transaction,
#             mac=mac,
#             ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
#             active=True,
#             remaining_time=remaining_time
#         )

#         success, error = self.activate_hotspot_on_router(router, hotspot_user)

#         # Ensure a Subscription record exists
#         try:
#             subscription, _ = Subscription.objects.get_or_create(client=client, internet_plan=plan)
#         except Exception:
#             subscription = None

#         ActivationAttempt.objects.create(
#             subscription=subscription,
#             router=router,
#             success=bool(success),
#             error_message=error if error else "",
#             retry_count=0,
#             user_type="hotspot"
#         )

#         if success:
#             serializer = HotspotUserSerializer(hotspot_user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         else:
#             # remove db row if activation on router failed
#             hotspot_user.delete()
#             return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def activate_pppoe_user(self, router, client, plan, transaction, username, password, request):
#         # End any existing active session for the client
#         existing_session = PPPoEUser.objects.filter(client=client, active=True).first()
#         if existing_session:
#             existing_session.active = False
#             existing_session.disconnected_at = timezone.now()
#             existing_session.save()

#             session_duration = int((timezone.now() - existing_session.connected_at).total_seconds())
#             RouterSessionHistory.objects.create(
#                 pppoe_user=existing_session,
#                 router=existing_session.router,
#                 start_time=existing_session.connected_at,
#                 end_time=timezone.now(),
#                 data_used=getattr(existing_session, "data_used", 0),
#                 duration=session_duration,
#                 disconnected_reason="router_switch",
#                 user_type="pppoe"
#             )

#         remaining_time = self.calculate_remaining_time(client, plan)

#         pppoe_user = PPPoEUser.objects.create(
#             router=router,
#             client=client,
#             plan=plan,
#             transaction=transaction,
#             username=username,
#             password=password,
#             ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
#             active=True,
#             remaining_time=remaining_time
#         )

#         success, error = self.activate_pppoe_on_router(router, pppoe_user)

#         # Ensure a Subscription record exists
#         try:
#             subscription, _ = Subscription.objects.get_or_create(client=client, internet_plan=plan)
#         except Exception:
#             subscription = None

#         ActivationAttempt.objects.create(
#             subscription=subscription,
#             router=router,
#             success=bool(success),
#             error_message=error if error else "",
#             retry_count=0,
#             user_type="pppoe"
#         )

#         if success:
#             serializer = PPPoEUserSerializer(pppoe_user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         else:
#             # remove db row if activation on router failed
#             pppoe_user.delete()
#             return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def calculate_remaining_time(self, client, plan):
#         # Calculate total used time from both hotspot and PPPoE sessions
#         hotspot_sessions = HotspotUser.objects.filter(client=client, plan=plan, active=False)
#         pppoe_sessions = PPPoEUser.objects.filter(client=client, plan=plan, active=False)

#         total_used_time = 0
#         for session in hotspot_sessions:
#             total_used_time += getattr(session, "total_session_time", 0) or 0
#         for session in pppoe_sessions:
#             total_used_time += getattr(session, "total_session_time", 0) or 0

#         if getattr(plan, "expiry_unit", None) == 'Hours':
#             plan_duration = int(getattr(plan, "expiry_value", 0)) * 3600
#         elif getattr(plan, "expiry_unit", None) == 'Days':
#             plan_duration = int(getattr(plan, "expiry_value", 0)) * 86400
#         else:  # Unlimited or other
#             plan_duration = 0

#         remaining_time = max(0, plan_duration - total_used_time) if plan_duration > 0 else 0
#         return remaining_time

#     def activate_hotspot_on_router(self, router, hotspot_user):
#         # Existing hotspot activation logic
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 hotspot = api.get_resource("/ip/hotspot/user")

#                 data_limit = 0
#                 if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
#                     try:
#                         multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
#                         data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
#                     except Exception:
#                         data_limit = 0

#                 username = getattr(hotspot_user.client, "user", None)
#                 username_str = username.username if username else f"user_{hotspot_user.client.id}"

#                 hotspot.add(
#                     name=username_str,
#                     password=str(hotspot_user.client.id),
#                     profile=getattr(hotspot_user.plan, "name", ""),
#                     mac_address=hotspot_user.mac.lower(),
#                     limit_bytes_total=data_limit
#                 )

#                 if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
#                     active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
#                     if active:
#                         api.get_resource("/ip/hotspot/active").set(
#                             id=active[0].get('id'),
#                             idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
#                         )

#                 api_pool.disconnect()
#                 return True, None

#             elif router.type == "ubiquiti":
#                 # Ubiquiti hotspot activation logic
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
#                 auth_minutes = max(1, hotspot_user.remaining_time // 60) if hotspot_user.remaining_time and hotspot_user.remaining_time > 0 else 1440

#                 def to_int_if_numeric(val):
#                     try:
#                         return int(float(val))
#                     except Exception:
#                         return 0

#                 bytes_limit = 0
#                 if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
#                     try:
#                         mul = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
#                         bytes_limit = int(float(hotspot_user.plan.data_limit_value) * mul)
#                     except Exception:
#                         bytes_limit = 0

#                 data = {
#                     "cmd": "authorize-guest",
#                     "mac": hotspot_user.mac.lower(),
#                     "minutes": auth_minutes,
#                     "up": to_int_if_numeric(getattr(hotspot_user.plan, "upload_speed_value", 0)),
#                     "down": to_int_if_numeric(getattr(hotspot_user.plan, "download_speed_value", 0)),
#                     "bytes": bytes_limit
#                 }

#                 response = requests.post(
#                     controller_url,
#                     json=data,
#                     auth=(router.username, router.password),
#                     verify=False,
#                     timeout=10
#                 )

#                 if response.status_code == 200:
#                     return True, None
#                 else:
#                     return False, f"Ubiquiti API error: {response.status_code}"

#             elif router.type == "cisco":
#                 # Placeholder for Cisco
#                 return True, None

#             else:
#                 return False, f"Unsupported router type: {router.type}"

#         except Exception as e:
#             logger.exception(f"Error activating hotspot on router {getattr(router, 'id', 'unknown')}")
#             return False, str(e)

#     def activate_pppoe_on_router(self, router, pppoe_user):  # NEW: PPPoE activation
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 pppoe_secret = api.get_resource("/ppp/secret")

#                 # Configure PPPoE secret
#                 pppoe_secret.add(
#                     name=pppoe_user.username,
#                     password=pppoe_user.password,
#                     service="pppoe",
#                     profile=getattr(pppoe_user.plan, "name", "default"),
#                     remote_address=pppoe_user.ip_address or "dynamic"
#                 )

#                 # Set session timeout if remaining time is specified
#                 if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
#                     profile_resource = api.get_resource("/ppp/profile")
#                     profile_resource.set(
#                         name=getattr(pppoe_user.plan, "name", "default"),
#                         session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
#                     )

#                 api_pool.disconnect()
#                 return True, None

#             elif router.type == "ubiquiti":
#                 # Ubiquiti PPPoE configuration would go here
#                 # This is a placeholder as Ubiquiti typically doesn't handle PPPoE servers
#                 return True, "PPPoE configuration not supported on Ubiquiti routers"

#             elif router.type == "cisco":
#                 # Placeholder for Cisco PPPoE
#                 return True, None

#             else:
#                 return False, f"Unsupported router type for PPPoE: {router.type}"

#         except Exception as e:
#             logger.exception(f"Error activating PPPoE on router {getattr(router, 'id', 'unknown')}")
#             return False, str(e)


# class RouterStatsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()

#                 # system resource may return a list with single item
#                 system_list = api.get_resource("/system/resource").get()
#                 system = system_list[0] if system_list else {}

#                 hotspot = api.get_resource("/ip/hotspot/active").get() or []
#                 pppoe_active = api.get_resource("/ppp/active").get() or []  # NEW: Get PPPoE active sessions

#                 stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]

#                 # Safe numeric parsing
#                 def safe_float(x, default=0.0):
#                     try:
#                         return float(x)
#                     except Exception:
#                         return default

#                 cpu = safe_float(system.get("cpu-load", 0))
#                 free_mem = safe_float(system.get("free-memory", 0))
#                 memory_mb = free_mem / 1024 / 1024 if free_mem else 0
#                 uptime = system.get("uptime", "0")
#                 temperature = safe_float(system.get("cpu-temperature", 0))
#                 interfaces = api.get_resource("/interface").get() or [{}]
#                 rx = safe_float(interfaces[0].get("rx-byte", 0))
#                 throughput_mb = rx / 1024 / 1024 if rx else 0
#                 total_hdd = safe_float(system.get("total-hdd-space", 1))
#                 free_hdd = safe_float(system.get("free-hdd-space", 0))
#                 disk_percent = (free_hdd / total_hdd * 100) if total_hdd else 0

#                 # Calculate total clients (hotspot + PPPoE)
#                 total_clients = len(hotspot) + len(pppoe_active)

#                 latest_stats = {
#                     "cpu": cpu,
#                     "memory": memory_mb,
#                     "clients": total_clients,  # UPDATED: Include PPPoE clients
#                     "hotspot_clients": len(hotspot),
#                     "pppoe_clients": len(pppoe_active),
#                     "uptime": uptime,
#                     "signal": -60,  # Placeholder; you can compute if available
#                     "temperature": temperature,
#                     "throughput": throughput_mb,
#                     "disk": disk_percent,
#                     "timestamp": timezone.now()
#                 }

#                 RouterStats.objects.create(router=router, **latest_stats)
#                 serializer = RouterStatsSerializer(stats, many=True)

#                 history = {key: [getattr(s, key) for s in stats] for key in latest_stats if key != "timestamp"}
#                 history["timestamps"] = [s.timestamp.strftime("%H:%M:%S") for s in stats]

#                 api_pool.disconnect()
#                 return Response({"latest": latest_stats, "history": history})

#             elif router.type == "ubiquiti":
#                 response = requests.get(
#                     f"https://{router.ip}:{router.port}/api/s/default/stat/sta",
#                     auth=(router.username, router.password),
#                     verify=False,
#                     timeout=10
#                 )

#                 data = response.json().get('data', []) if response and response.status_code == 200 else []
#                 clients = len(data)
#                 signal = sum([sta.get('signal', 0) for sta in data]) / clients if clients else 0
#                 throughput = sum([sta.get('rx_rate', 0) + sta.get('tx_rate', 0) for sta in data]) / 1024 / 1024 if data else 0

#                 latest_stats = {
#                     "cpu": 0,
#                     "memory": 0,
#                     "clients": clients,
#                     "hotspot_clients": clients,
#                     "pppoe_clients": 0,
#                     "uptime": "N/A",
#                     "signal": signal,
#                     "temperature": 0,
#                     "throughput": throughput,
#                     "disk": 0,
#                     "timestamp": timezone.now()
#                 }

#                 RouterStats.objects.create(router=router, **latest_stats)
#                 return Response({"latest": latest_stats, "history": {}})

#             return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)

#         except Exception as e:
#             logger.exception("Error getting router stats")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class RouterRebootView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def post(self, request, pk):
#         router = self.get_object(pk)
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 api.get_resource("/system").call("reboot")
#                 api_pool.disconnect()

#             elif router.type == "ubiquiti":
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
#                 data = {"cmd": "restart", "mac": "all"}
#                 try:
#                     requests.post(
#                         controller_url,
#                         json=data,
#                         auth=(router.username, router.password),
#                         verify=False,
#                         timeout=10
#                     )
#                 except Exception:
#                     logger.exception("Ubiquiti reboot request failed")

#             # Disconnect both hotspot and PPPoE users
#             active_hotspot_users = HotspotUser.objects.filter(router=router, active=True)
#             active_pppoe_users = PPPoEUser.objects.filter(router=router, active=True)
            
#             for user in active_hotspot_users:
#                 user.active = False
#                 user.disconnected_at = timezone.now()
#                 user.save()

#                 session_duration = int((timezone.now() - user.connected_at).total_seconds())
#                 RouterSessionHistory.objects.create(
#                     hotspot_user=user,
#                     router=router,
#                     start_time=user.connected_at,
#                     end_time=timezone.now(),
#                     data_used=getattr(user, "data_used", 0),
#                     duration=session_duration,
#                     disconnected_reason="router_reboot",
#                     user_type="hotspot"
#                 )

#             for user in active_pppoe_users:
#                 user.active = False
#                 user.disconnected_at = timezone.now()
#                 user.save()

#                 session_duration = int((timezone.now() - user.connected_at).total_seconds())
#                 RouterSessionHistory.objects.create(
#                     pppoe_user=user,
#                     router=router,
#                     start_time=user.connected_at,
#                     end_time=timezone.now(),
#                     data_used=getattr(user, "data_used", 0),
#                     duration=session_duration,
#                     disconnected_reason="router_reboot",
#                     user_type="pppoe"
#                 )

#             router.status = "updating"
#             router.save()

#             return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.exception("Error rebooting router")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class HotspotUsersView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         users = HotspotUser.objects.filter(router=router).order_by('-connected_at')
#         serializer = HotspotUserSerializer(users, many=True)
#         return Response(serializer.data)


# class HotspotUserDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(HotspotUser, pk=pk)

#     def delete(self, request, pk):
#         user = self.get_object(pk)
#         try:
#             router = user.router

#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 active = api.get_resource("/ip/hotspot/active").get(mac_address=user.mac.lower())
#                 if active:
#                     api.get_resource("/ip/hotspot/active").remove(id=active[0].get('id'))
#                 api_pool.disconnect()

#             elif router.type == "ubiquiti":
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
#                 data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
#                 try:
#                     requests.post(
#                         controller_url,
#                         json=data,
#                         auth=(router.username, router.password),
#                         verify=False,
#                         timeout=10
#                     )
#                 except Exception:
#                     logger.exception("Ubiquiti unauthorize request failed")

#             if user.active:
#                 session_duration = int((timezone.now() - user.connected_at).total_seconds())
#                 RouterSessionHistory.objects.create(
#                     hotspot_user=user,
#                     router=router,
#                     start_time=user.connected_at,
#                     end_time=timezone.now(),
#                     data_used=getattr(user, "data_used", 0),
#                     duration=session_duration,
#                     disconnected_reason="manual_disconnect",
#                     user_type="hotspot"
#                 )

#             user.active = False
#             user.disconnected_at = timezone.now()
#             user.save()

#             return Response(status=status.HTTP_204_NO_CONTENT)

#         except Exception as e:
#             logger.exception("Error disconnecting user")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PPPoEUsersView(APIView):  # NEW: PPPoE users view
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def get(self, request, pk):
#         router = self.get_object(pk)
#         users = PPPoEUser.objects.filter(router=router).order_by('-connected_at')
#         serializer = PPPoEUserSerializer(users, many=True)
#         return Response(serializer.data)


# class PPPoEUserDetailView(APIView):  # NEW: PPPoE user detail view
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(PPPoEUser, pk=pk)

#     def delete(self, request, pk):
#         user = self.get_object(pk)
#         try:
#             router = user.router

#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 pppoe_secret = api.get_resource("/ppp/secret")
#                 secrets = pppoe_secret.get(name=user.username)
#                 if secrets:
#                     pppoe_secret.remove(id=secrets[0].get('id'))
#                 api_pool.disconnect()

#             if user.active:
#                 session_duration = int((timezone.now() - user.connected_at).total_seconds())
#                 RouterSessionHistory.objects.create(
#                     pppoe_user=user,
#                     router=router,
#                     start_time=user.connected_at,
#                     end_time=timezone.now(),
#                     data_used=getattr(user, "data_used", 0),
#                     duration=session_duration,
#                     disconnected_reason="manual_disconnect",
#                     user_type="pppoe"
#                 )

#             user.active = False
#             user.disconnected_at = timezone.now()
#             user.save()

#             return Response(status=status.HTTP_204_NO_CONTENT)

#         except Exception as e:
#             logger.exception("Error disconnecting PPPoE user")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class HotspotConfigView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def post(self, request, pk):
#         router = self.get_object(pk)
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
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()

#                 # Example: update hotspot settings (IDs/profiles may differ; adjust to your setup)
#                 try:
#                     api.get_resource("/ip/hotspot").set(
#                         id="*0",
#                         name=hotspot_config["ssid"],
#                         interface="bridge",
#                         pool="dhcp_pool0",
#                         profile="hsprof1"
#                     )
#                 except Exception:
#                     logger.exception("Failed to set hotspot base config on mikrotik (may require different IDs)")

#                 try:
#                     api.get_resource("/ip/hotspot/profile").set(
#                         id="hsprof1",
#                         login_by="universal",
#                         html_directory="hotspot"
#                     )
#                 except Exception:
#                     logger.exception("Failed to set hotspot profile on mikrotik")

#                 # Upload landing page file to the router's file system (this is device-specific)
#                 try:
#                     with open(path, "rb") as f:
#                         api.get_resource("/file").call(
#                             "upload",
#                             file=f.read(),
#                             name=f"hotspot/{landing_page.name}"
#                         )
#                 except Exception:
#                     logger.exception("Failed to upload landing page to mikrotik")

#                 api_pool.disconnect()

#             elif router.type == "ubiquiti":
#                 controller_url = f"https://{router.ip}:{router.port}/api/s/default/set/setting/guest_access"
#                 data = {
#                     "portal_enabled": True,
#                     "portal_customized": True,
#                     "redirect_enabled": True,
#                     "redirect_url": hotspot_config["redirectUrl"],
#                 }
#                 try:
#                     requests.put(
#                         controller_url,
#                         json=data,
#                         auth=(router.username, router.password),
#                         verify=False,
#                         timeout=10
#                     )
#                 except Exception:
#                     logger.exception("Failed to configure ubiquiti guest_access")

#             return Response({"message": "Hotspot configured"}, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.exception("Error configuring hotspot")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class PPPoEConfigView(APIView):  # NEW: PPPoE configuration view
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Router, pk=pk, is_active=True)

#     def post(self, request, pk):
#         router = self.get_object(pk)
#         try:
#             pppoe_config = {
#                 "ip_pool": request.data.get("ipPool", "pppoe-pool-1"),
#                 "service_name": request.data.get("serviceName", ""),
#                 "mtu": request.data.get("mtu", 1492),
#                 "dns_servers": request.data.get("dnsServers", "8.8.8.8,1.1.1.1"),
#                 "bandwidth_limit": request.data.get("bandwidthLimit", "10M"),
#             }

#             router.pppoe_config = pppoe_config
#             router.save()

#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()

#                 # Configure PPPoE server
#                 try:
#                     # Create IP pool
#                     ip_pool = api.get_resource("/ip/pool")
#                     pools = ip_pool.get(name=pppoe_config["ip_pool"])
#                     if not pools:
#                         ip_pool.add(
#                             name=pppoe_config["ip_pool"],
#                             ranges=f"192.168.{pk}.10-192.168.{pk}.200"
#                         )

#                     # Configure PPPoE server
#                     pppoe_server = api.get_resource("/interface/pppoe-server")
#                     servers = pppoe_server.get(service_name=pppoe_config["service_name"] or "pppoe-service")
#                     if not servers:
#                         pppoe_server.add(
#                             service_name=pppoe_config["service_name"] or "pppoe-service",
#                             interface="bridge",
#                             authentication=["pap", "chap", "mschap2"],
#                             default_profile="default",
#                             one_session_per_host=True
#                         )

#                     # Configure DNS
#                     dns_servers = pppoe_config["dns_servers"].split(",")
#                     dns_resource = api.get_resource("/ip/dns")
#                     dns_resource.set(servers=",".join(dns_servers))

#                 except Exception as e:
#                     logger.exception("Failed to configure PPPoE on mikrotik")
#                     return Response({"error": f"PPPoE configuration failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#                 api_pool.disconnect()

#             return Response({"message": "PPPoE configured successfully"}, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.exception("Error configuring PPPoE")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class BulkActionView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         router_ids = request.data.get("router_ids", [])
#         action = request.data.get("action")

#         if not router_ids or action not in ["connect", "disconnect", "delete", "reboot"]:
#             return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

#         routers = Router.objects.filter(id__in=router_ids, is_active=True)
#         try:
#             for router in routers:
#                 if action == "connect":
#                     if router.type == "mikrotik":
#                         api_pool = RouterOsApiPool(
#                             router.ip,
#                             username=router.username,
#                             password=router.password,
#                             port=router.port
#                         )
#                         api = api_pool.get_api()
#                         api_pool.disconnect()
#                     elif router.type == "ubiquiti":
#                         try:
#                             requests.get(
#                                 f"https://{router.ip}:{router.port}/api/login",
#                                 auth=(router.username, router.password),
#                                 verify=False,
#                                 timeout=10
#                             )
#                         except Exception:
#                             logger.exception("Ubiquiti connect attempt failed")
#                     router.status = "connected"

#                 elif action == "disconnect":
#                     router.status = "disconnected"

#                 elif action == "reboot":
#                     if router.type == "mikrotik":
#                         api_pool = RouterOsApiPool(
#                             router.ip,
#                             username=router.username,
#                             password=router.password,
#                             port=router.port
#                         )
#                         api = api_pool.get_api()
#                         api.get_resource("/system").call("reboot")
#                         api_pool.disconnect()
#                     router.status = "updating"

#                 router.save()

#             if action == "delete":
#                 routers.update(is_active=False)

#             return Response({"message": f"Bulk {action} completed"}, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.exception("Error performing bulk action")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class GetMacView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         client_ip = request.META.get('REMOTE_ADDR')
#         mac = self.get_mac_address(client_ip)
#         return Response({"mac": mac.upper() if mac else "00:00:00:00:00:00"})

#     def get_mac_address(self, ip):
#         # Try arp -n first, then arp -a, then database fallback
#         try:
#             result = subprocess.run(['arp', '-n', ip], capture_output=True, text=True, check=False)
#             output = result.stdout or ""
#             parts = output.split()
#             # this parsing is system-dependent; attempt a robust fallback
#             if len(parts) >= 4:
#                 possible = parts[3]
#                 if ":" in possible or "-" in possible:
#                     return possible.replace("-", ":").lower()
#         except Exception:
#             logger.exception("arp -n failed")

#         try:
#             result = subprocess.run(['arp', '-a', ip], capture_output=True, text=True, check=False)
#             output = result.stdout or ""
#             lines = output.splitlines()
#             for line in lines:
#                 if ip in line:
#                     parts = line.split()
#                     # try to find mac-like token
#                     for token in parts:
#                         if (":" in token and len(token) >= 11) or ("-" in token and len(token) >= 11):
#                             return token.replace("-", ":").lower()
#         except Exception:
#             logger.exception("arp -a failed")

#         # fallback to DB lookup
#         try:
#             recent_user = HotspotUser.objects.filter(ip=ip).order_by('-connected_at').first()
#             if recent_user:
#                 return recent_user.mac.lower()
#         except Exception:
#             logger.exception("DB fallback for MAC failed")

#         return None


# class RouterHealthCheckView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         routers = Router.objects.filter(is_active=True)
#         health_data = []

#         for router in routers:
#             try:
#                 start_time = timezone.now()

#                 if router.type == "mikrotik":
#                     api_pool = RouterOsApiPool(
#                         router.ip,
#                         username=router.username,
#                         password=router.password,
#                         port=router.port,
#                         plaintext_login=True
#                     )
#                     connection = api_pool.get_api()
                    
#                     # Get system metrics for detailed health check
#                     system_list = api.get_resource("/system/resource").get()
#                     system = system_list[0] if system_list else {}
                    
#                     # Get active sessions
#                     hotspot_active = api.get_resource("/ip/hotspot/active").get() or []
#                     pppoe_active = api.get_resource("/ppp/active").get() or []
                    
#                     api_pool.disconnect()
#                     response_time = (timezone.now() - start_time).total_seconds()

#                     system_metrics = {
#                         "cpu_load": float(system.get("cpu-load", 0)),
#                         "free_memory": float(system.get("free-memory", 0)),
#                         "total_memory": float(system.get("total-memory", 0)),
#                         "uptime": system.get("uptime", "0"),
#                         "hotspot_sessions": len(hotspot_active),
#                         "pppoe_sessions": len(pppoe_active),
#                         "total_sessions": len(hotspot_active) + len(pppoe_active)
#                     }

#                     RouterHealthCheck.objects.create(
#                         router=router,
#                         is_online=True,
#                         response_time=response_time,
#                         system_metrics=system_metrics
#                     )

#                     health_data.append({
#                         "router": router.name,
#                         "router_ip": router.ip,
#                         "status": "online",
#                         "response_time": response_time,
#                         "system_metrics": system_metrics
#                     })

#                 elif router.type == "ubiquiti":
#                     try:
#                         response = requests.get(
#                             f"https://{router.ip}:{router.port}/api/self",
#                             auth=(router.username, router.password),
#                             verify=False,
#                             timeout=10
#                         )
#                         ok = response.status_code == 200
#                     except Exception as e:
#                         ok = False
#                         response = None

#                     response_time = (timezone.now() - start_time).total_seconds()

#                     RouterHealthCheck.objects.create(
#                         router=router,
#                         is_online=ok,
#                         response_time=response_time
#                     )

#                     health_data.append({
#                         "router": router.name,
#                         "router_ip": router.ip,
#                         "status": "online" if ok else "offline",
#                         "response_time": response_time
#                     })

#             except Exception as e:
#                 logger.exception("Health check failed for router")
#                 RouterHealthCheck.objects.create(
#                     router=router,
#                     is_online=False,
#                     error_message=str(e)
#                 )

#                 health_data.append({
#                     "router": router.name,
#                     "router_ip": router.ip,
#                     "status": "offline",
#                     "error": str(e)
#                 })

#         return Response(health_data)


# class RestoreSessionsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         router = get_object_or_404(Router, pk=pk, is_active=True)

#         if router.status != "connected":
#             return Response({"error": "Router is not connected"}, status=status.HTTP_400_BAD_REQUEST)

#         cutoff_time = timezone.now() - timedelta(hours=24)  # Look back 24 hours
#         interrupted_sessions = RouterSessionHistory.objects.filter(
#             router=router,
#             end_time__gte=cutoff_time,
#             disconnected_reason__in=["router_reboot", "power_outage", "router_switch"]
#         )

#         restored_count = 0
#         for session in interrupted_sessions:
#             try:
#                 if session.user_type == "hotspot" and session.hotspot_user and session.hotspot_user.remaining_time > 0:
#                     hotspot_user = session.hotspot_user
#                     hotspot_user.active = True
#                     hotspot_user.router = router
#                     hotspot_user.connected_at = timezone.now()
#                     hotspot_user.disconnected_at = None
#                     hotspot_user.save()

#                     success, error = self.activate_hotspot_on_router(router, hotspot_user)

#                     if success:
#                         restored_count += 1
#                         session.disconnected_reason = f"restored_{session.disconnected_reason}"
#                         session.save()
                
#                 elif session.user_type == "pppoe" and session.pppoe_user and session.pppoe_user.remaining_time > 0:
#                     pppoe_user = session.pppoe_user
#                     pppoe_user.active = True
#                     pppoe_user.router = router
#                     pppoe_user.connected_at = timezone.now()
#                     pppoe_user.disconnected_at = None
#                     pppoe_user.save()

#                     success, error = self.activate_pppoe_on_router(router, pppoe_user)

#                     if success:
#                         restored_count += 1
#                         session.disconnected_reason = f"restored_{session.disconnected_reason}"
#                         session.save()
#             except Exception:
#                 logger.exception("Failed to restore session")

#         return Response({
#             "message": f"Restored {restored_count} sessions",
#             "restored_count": restored_count
#         })

#     def activate_hotspot_on_router(self, router, hotspot_user):
#         # Reuse the hotspot activation logic from RouterActivateUserView
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 hotspot = api.get_resource("/ip/hotspot/user")

#                 data_limit = 0
#                 if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
#                     try:
#                         multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
#                         data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
#                     except Exception:
#                         data_limit = 0

#                 username = getattr(hotspot_user.client, "user", None)
#                 username_str = username.username if username else f"user_{hotspot_user.client.id}"

#                 hotspot.add(
#                     name=username_str,
#                     password=str(hotspot_user.client.id),
#                     profile=getattr(hotspot_user.plan, "name", ""),
#                     mac_address=hotspot_user.mac.lower(),
#                     limit_bytes_total=data_limit
#                 )

#                 if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
#                     active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
#                     if active:
#                         api.get_resource("/ip/hotspot/active").set(
#                             id=active[0].get('id'),
#                             idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
#                         )

#                 api_pool.disconnect()
#                 return True, None
#             return False, "Router type not supported for hotspot restoration"
#         except Exception as e:
#             return False, str(e)

#     def activate_pppoe_on_router(self, router, pppoe_user):
#         # Reuse the PPPoE activation logic from RouterActivateUserView
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 pppoe_secret = api.get_resource("/ppp/secret")

#                 # Configure PPPoE secret
#                 pppoe_secret.add(
#                     name=pppoe_user.username,
#                     password=pppoe_user.password,
#                     service="pppoe",
#                     profile=getattr(pppoe_user.plan, "name", "default"),
#                     remote_address=pppoe_user.ip_address or "dynamic"
#                 )

#                 # Set session timeout if remaining time is specified
#                 if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
#                     profile_resource = api.get_resource("/ppp/profile")
#                     profile_resource.set(
#                         name=getattr(pppoe_user.plan, "name", "default"),
#                         session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
#                     )

#                 api_pool.disconnect()
#                 return True, None
#             return False, "Router type not supported for PPPoE restoration"
#         except Exception as e:
#             return False, str(e)


# class UserSessionRecoveryView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         phone_number = request.data.get("phone_number")
#         mac_address = (request.data.get("mac_address") or "").lower()
#         username = request.data.get("username")  # NEW: for PPPoE recovery

#         if not phone_number or (not mac_address and not username):
#             return Response(
#                 {"error": "Phone number and either MAC address or username are required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             user = User.objects.get(phone_number=phone_number, user_type='client')
#             client = Client.objects.get(user=user)

#             # Try to find recent session by MAC (hotspot) or username (PPPoE)
#             recent_hotspot_session = None
#             recent_pppoe_session = None
            
#             if mac_address:
#                 recent_hotspot_session = HotspotUser.objects.filter(
#                     client=client,
#                     mac=mac_address
#                 ).order_by('-connected_at').first()
            
#             if username:
#                 recent_pppoe_session = PPPoEUser.objects.filter(
#                     client=client,
#                     username=username
#                 ).order_by('-connected_at').first()

#             # Determine which session to recover
#             session_to_recover = None
#             connection_type = None
            
#             if recent_hotspot_session and recent_hotspot_session.remaining_time > 0:
#                 session_to_recover = recent_hotspot_session
#                 connection_type = "hotspot"
#             elif recent_pppoe_session and recent_pppoe_session.remaining_time > 0:
#                 session_to_recover = recent_pppoe_session
#                 connection_type = "pppoe"

#             if not session_to_recover:
#                 return Response({"error": "No valid session found for recovery"}, status=status.HTTP_404_NOT_FOUND)

#             router = Router.objects.filter(
#                 status="connected",
#                 is_active=True,
#                 captive_portal_enabled=True
#             ).first()

#             if not router:
#                 return Response({"error": "No routers available at the moment"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

#             if connection_type == "hotspot":
#                 new_hotspot_user = HotspotUser.objects.create(
#                     router=router,
#                     client=client,
#                     plan=session_to_recover.plan,
#                     transaction=session_to_recover.transaction,
#                     mac=mac_address,
#                     ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
#                     active=True,
#                     remaining_time=session_to_recover.remaining_time,
#                     total_session_time=getattr(session_to_recover, "total_session_time", 0)
#                 )

#                 success, error = self.activate_hotspot_on_router(router, new_hotspot_user)

#                 if success:
#                     serializer = HotspotUserSerializer(new_hotspot_user)
#                     return Response({
#                         "message": "Hotspot session restored successfully",
#                         "session": serializer.data
#                     })
#                 else:
#                     new_hotspot_user.delete()
#                     return Response({"error": f"Failed to activate hotspot session: {error}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             elif connection_type == "pppoe":
#                 new_pppoe_user = PPPoEUser.objects.create(
#                     router=router,
#                     client=client,
#                     plan=session_to_recover.plan,
#                     transaction=session_to_recover.transaction,
#                     username=username,
#                     password=session_to_recover.password,
#                     ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
#                     active=True,
#                     remaining_time=session_to_recover.remaining_time,
#                     total_session_time=getattr(session_to_recover, "total_session_time", 0)
#                 )

#                 success, error = self.activate_pppoe_on_router(router, new_pppoe_user)

#                 if success:
#                     serializer = PPPoEUserSerializer(new_pppoe_user)
#                     return Response({
#                         "message": "PPPoE session restored successfully",
#                         "session": serializer.data
#                     })
#                 else:
#                     new_pppoe_user.delete()
#                     return Response({"error": f"Failed to activate PPPoE session: {error}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         except User.DoesNotExist:
#             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Client.DoesNotExist:
#             return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             logger.exception("Error recovering session")
#             return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def activate_hotspot_on_router(self, router, hotspot_user):
#         # Reuse the hotspot activation logic
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 hotspot = api.get_resource("/ip/hotspot/user")

#                 data_limit = 0
#                 if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
#                     try:
#                         multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
#                         data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
#                     except Exception:
#                         data_limit = 0

#                 username = getattr(hotspot_user.client, "user", None)
#                 username_str = username.username if username else f"user_{hotspot_user.client.id}"

#                 hotspot.add(
#                     name=username_str,
#                     password=str(hotspot_user.client.id),
#                     profile=getattr(hotspot_user.plan, "name", ""),
#                     mac_address=hotspot_user.mac.lower(),
#                     limit_bytes_total=data_limit
#                 )

#                 if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
#                     active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
#                     if active:
#                         api.get_resource("/ip/hotspot/active").set(
#                             id=active[0].get('id'),
#                             idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
#                         )

#                 api_pool.disconnect()
#                 return True, None
#             return False, "Router type not supported"
#         except Exception as e:
#             return False, str(e)

#     def activate_pppoe_on_router(self, router, pppoe_user):
#         # Reuse the PPPoE activation logic
#         try:
#             if router.type == "mikrotik":
#                 api_pool = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 )
#                 api = api_pool.get_api()
#                 pppoe_secret = api.get_resource("/ppp/secret")

#                 # Configure PPPoE secret
#                 pppoe_secret.add(
#                     name=pppoe_user.username,
#                     password=pppoe_user.password,
#                     service="pppoe",
#                     profile=getattr(pppoe_user.plan, "name", "default"),
#                     remote_address=pppoe_user.ip_address or "dynamic"
#                 )

#                 # Set session timeout if remaining time is specified
#                 if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
#                     profile_resource = api.get_resource("/ppp/profile")
#                     profile_resource.set(
#                         name=getattr(pppoe_user.plan, "name", "default"),
#                         session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
#                     )

#                 api_pool.disconnect()
#                 return True, None
#             return False, "Router type not supported for PPPoE"
#         except Exception as e:
#             return False, str(e)


# class RouterCallbackConfigListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         router = get_object_or_404(Router, pk=pk)
#         callbacks = router.callback_configs.all()
#         serializer = RouterCallbackConfigSerializer(callbacks, many=True)
#         return Response(serializer.data)

#     def post(self, request, pk):
#         router = get_object_or_404(Router, pk=pk)
#         data = request.data.copy()
#         data['router'] = pk
#         serializer = RouterCallbackConfigSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class RouterCallbackConfigDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, router_pk, callback_pk):
#         return get_object_or_404(RouterCallbackConfig, router_id=router_pk, pk=callback_pk)

#     def get(self, request, pk, callback_pk):
#         callback = self.get_object(pk, callback_pk)
#         serializer = RouterCallbackConfigSerializer(callback)
#         return Response(serializer.data)

#     def put(self, request, pk, callback_pk):
#         callback = self.get_object(pk, callback_pk)
#         serializer = RouterCallbackConfigSerializer(callback, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk, callback_pk):
#         callback = self.get_object(pk, callback_pk)
#         callback.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)







import subprocess
import logging
import warnings
from datetime import timedelta
import redis
import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, F, ExpressionWrapper, DurationField
from django.core.cache import cache
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet

import requests
from routeros_api import RouterOsApiPool

import warnings
from urllib3.exceptions import InsecureRequestWarning

from network_management.models.router_management_model import (
    Router, RouterStats, HotspotUser, PPPoEUser, ActivationAttempt,
    RouterSessionHistory, RouterHealthCheck, RouterCallbackConfig,
    RouterAuditLog, BulkOperation  # NEW
)
from network_management.serializers.router_management_serializer import (
    RouterSerializer, RouterStatsSerializer, HotspotUserSerializer,
    PPPoEUserSerializer, ActivationAttemptSerializer, RouterSessionHistorySerializer,
    RouterHealthCheckSerializer, RouterCallbackConfigSerializer,
    RouterAuditLogSerializer, BulkOperationSerializer,  # NEW
    SessionRecoverySerializer, BulkActionSerializer, PaymentVerificationSerializer  # NEW
)
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from payments.models.payment_config_model import Transaction
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)
channel_layer = get_channel_layer()

# Redis client
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

# Suppress InsecureRequestWarning for self-signed / internal controllers 
warnings.simplefilter('ignore', InsecureRequestWarning)

class RouterListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', 'all')
        router_type = request.query_params.get('type', '')
        
        # Try to get from cache first
        cache_key = f"routers:list:{search}:{status_filter}:{router_type}"
        cached_data = redis_client.get(cache_key)
        
        if cached_data:
            return Response(json.loads(cached_data))

        routers = Router.objects.filter(is_active=True)
        
        if search:
            routers = routers.filter(
                Q(name__icontains=search) |
                Q(ip__icontains=search) |
                Q(location__icontains=search) |
                Q(ssid__icontains=search) |
                Q(description__icontains=search)
            )
        
        if status_filter != 'all':
            routers = routers.filter(status=status_filter)
            
        if router_type:
            routers = routers.filter(type=router_type)

        serializer = RouterSerializer(routers, many=True)
        
        # Cache the result for 2 minutes
        redis_client.setex(cache_key, 120, json.dumps(serializer.data))
        
        return Response(serializer.data)

    def post(self, request):
        serializer = RouterSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save(status="disconnected")
                # Conform callback URL
                router.callback_url = f"{request.build_absolute_uri('/')[:-1]}/api/payments/mpesa-callbacks/dispatch/{router.id}/"
                router.save()
                
                # Log the action
                RouterAuditLog.objects.create(
                    router=router,
                    action='create',
                    description=f"Router {router.name} created",
                    user=request.user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    changes=request.data
                )
                
                # Clear cache
                self.clear_routers_cache()
                
                # Send WebSocket update
                self.send_websocket_update('router_created', router.id)
                
            return Response(RouterSerializer(router).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def clear_routers_cache(self):
        """Clear all routers list cache"""
        pattern = "routers:list:*"
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)

    def send_websocket_update(self, action, router_id):
        """Send WebSocket update for real-time notifications"""
        try:
            async_to_sync(channel_layer.group_send)(
                "routers",
                {
                    "type": "router_update",
                    "action": action,
                    "router_id": router_id,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket update failed: {str(e)}")

class RouterDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        # Try cache first
        cache_key = f"router:{pk}:detail"
        cached_data = redis_client.get(cache_key)
        
        if cached_data:
            return Response(json.loads(cached_data))

        router = self.get_object(pk)
        serializer = RouterSerializer(router)
        
        # Cache for 5 minutes
        redis_client.setex(cache_key, 300, json.dumps(serializer.data))
        
        return Response(serializer.data)

    def put(self, request, pk):
        router = self.get_object(pk)
        old_data = RouterSerializer(router).data
        
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                router = serializer.save()
                
                # Log changes
                changes = self.get_changes(old_data, request.data)
                RouterAuditLog.objects.create(
                    router=router,
                    action='update',
                    description=f"Router {router.name} updated",
                    user=request.user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    changes=changes
                )
                
                # Clear cache
                self.clear_router_cache(pk)
                self.clear_routers_cache()
                
                # Send WebSocket update
                self.send_websocket_update('router_updated', pk)
                
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        router = self.get_object(pk)
        
        with transaction.atomic():
            router.is_active = False
            router.save()
            
            # Log deletion
            RouterAuditLog.objects.create(
                router=router,
                action='delete',
                description=f"Router {router.name} deleted",
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Clear cache
            self.clear_router_cache(pk)
            self.clear_routers_cache()
            
            # Send WebSocket update
            self.send_websocket_update('router_deleted', pk)
            
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_changes(self, old_data, new_data):
        """Detect changes between old and new data"""
        changes = {}
        for key, new_value in new_data.items():
            old_value = old_data.get(key)
            if old_value != new_value:
                changes[key] = {'old': old_value, 'new': new_value}
        return changes

    def clear_router_cache(self, router_id):
        """Clear cache for specific router"""
        patterns = [
            f"router:{router_id}:*",
            f"routers:list:*"
        ]
        for pattern in patterns:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)

    def send_websocket_update(self, action, router_id):
        """Send WebSocket update"""
        try:
            async_to_sync(channel_layer.group_send)(
                "routers",
                {
                    "type": "router_update",
                    "action": action,
                    "router_id": router_id,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"WebSocket update failed: {str(e)}")

# Enhanced RouterActivateUserView with Payment Verification
class RouterActivateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        router = Router.objects.filter(id=pk, status="connected", is_active=True).first()
        if not router:
            return Response({"error": "Router not found or not connected"}, status=status.HTTP_404_NOT_FOUND)

        # Verify payment before activation
        payment_verified = self.verify_payment(request.data)
        if not payment_verified:
            return Response({"error": "Payment verification failed"}, status=status.HTTP_402_PAYMENT_REQUIRED)

        connection_type = request.data.get("connection_type", "hotspot")
        mac = (request.data.get("mac") or "").lower()
        username = request.data.get("username")
        password = request.data.get("password")
        plan_id = request.data.get("plan_id")
        client_id = request.data.get("client_id")
        transaction_id = request.data.get("transaction_id")

        if connection_type == "hotspot" and not all([mac, plan_id, client_id]):
            return Response({"error": "Missing required fields for hotspot"}, status=status.HTTP_400_BAD_REQUEST)
        elif connection_type == "pppoe" and not all([username, password, plan_id, client_id]):
            return Response({"error": "Missing required fields for PPPoE"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client = Client.objects.get(id=client_id)
            plan = InternetPlan.objects.get(id=plan_id)
            transaction = None
            if transaction_id:
                try:
                    transaction = Transaction.objects.get(id=transaction_id)
                except Transaction.DoesNotExist:
                    transaction = None

            if connection_type == "hotspot":
                return self.activate_hotspot_user(router, client, plan, transaction, mac, request)
            elif connection_type == "pppoe":
                return self.activate_pppoe_user(router, client, plan, transaction, username, password, request)
            else:
                return Response({"error": "Invalid connection type"}, status=status.HTTP_400_BAD_REQUEST)

        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
        except InternetPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.exception("Error activating user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def verify_payment(self, data):
        """Enhanced payment verification with multiple checks"""
        try:
            client_id = data.get('client_id')
            plan_id = data.get('plan_id')
            transaction_id = data.get('transaction_id')
            
            if not all([client_id, plan_id]):
                return False

            # Check if client has active subscription
            active_subscription = Subscription.objects.filter(
                client_id=client_id,
                internet_plan_id=plan_id,
                is_active=True,
                end_date__gt=timezone.now()
            ).exists()
            
            if active_subscription:
                return True

            # Check transaction status
            if transaction_id:
                try:
                    transaction = Transaction.objects.get(
                        id=transaction_id,
                        status='completed'
                    )
                    return True
                except Transaction.DoesNotExist:
                    pass

            # Check for recent successful payment
            recent_payment = Transaction.objects.filter(
                client_id=client_id,
                plan_id=plan_id,
                status='completed',
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).exists()
            
            return recent_payment

        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}")
            return False

    def activate_hotspot_user(self, router, client, plan, transaction, mac, request):
        # End any existing active session for the client
        existing_session = HotspotUser.objects.filter(client=client, active=True).first()
        if existing_session:
            existing_session.active = False
            existing_session.disconnected_at = timezone.now()
            existing_session.save()

            session_duration = int((timezone.now() - existing_session.connected_at).total_seconds())
            RouterSessionHistory.objects.create(
                hotspot_user=existing_session,
                router=existing_session.router,
                start_time=existing_session.connected_at,
                end_time=timezone.now(),
                data_used=getattr(existing_session, "data_used", 0),
                duration=session_duration,
                disconnected_reason="router_switch",
                user_type="hotspot"
            )

        remaining_time = self.calculate_remaining_time(client, plan)

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

        success, error = self.activate_hotspot_on_router(router, hotspot_user)

        # Ensure a Subscription record exists
        try:
            subscription, _ = Subscription.objects.get_or_create(client=client, internet_plan=plan)
        except Exception:
            subscription = None

        ActivationAttempt.objects.create(
            subscription=subscription,
            router=router,
            success=bool(success),
            error_message=error if error else "",
            retry_count=0,
            user_type="hotspot"
        )

        # Log the activation
        RouterAuditLog.objects.create(
            router=router,
            action='user_activation',
            description=f"Hotspot user activated for {client.user.username}",
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes={'mac': mac, 'plan': plan.name, 'client': client.user.username}
        )

        if success:
            serializer = HotspotUserSerializer(hotspot_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # remove db row if activation on router failed
            hotspot_user.delete()
            return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def activate_pppoe_user(self, router, client, plan, transaction, username, password, request):
        # End any existing active session for the client
        existing_session = PPPoEUser.objects.filter(client=client, active=True).first()
        if existing_session:
            existing_session.active = False
            existing_session.disconnected_at = timezone.now()
            existing_session.save()

            session_duration = int((timezone.now() - existing_session.connected_at).total_seconds())
            RouterSessionHistory.objects.create(
                pppoe_user=existing_session,
                router=existing_session.router,
                start_time=existing_session.connected_at,
                end_time=timezone.now(),
                data_used=getattr(existing_session, "data_used", 0),
                duration=session_duration,
                disconnected_reason="router_switch",
                user_type="pppoe"
            )

        remaining_time = self.calculate_remaining_time(client, plan)

        pppoe_user = PPPoEUser.objects.create(
            router=router,
            client=client,
            plan=plan,
            transaction=transaction,
            username=username,
            password=password,
            ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
            active=True,
            remaining_time=remaining_time
        )

        success, error = self.activate_pppoe_on_router(router, pppoe_user)

        # Ensure a Subscription record exists
        try:
            subscription, _ = Subscription.objects.get_or_create(client=client, internet_plan=plan)
        except Exception:
            subscription = None

        ActivationAttempt.objects.create(
            subscription=subscription,
            router=router,
            success=bool(success),
            error_message=error if error else "",
            retry_count=0,
            user_type="pppoe"
        )

        # Log the activation
        RouterAuditLog.objects.create(
            router=router,
            action='user_activation',
            description=f"PPPoE user activated for {client.user.username}",
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes={'username': username, 'plan': plan.name, 'client': client.user.username}
        )

        if success:
            serializer = PPPoEUserSerializer(pppoe_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # remove db row if activation on router failed
            pppoe_user.delete()
            return Response({"error": error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def calculate_remaining_time(self, client, plan):
        # Calculate total used time from both hotspot and PPPoE sessions
        hotspot_sessions = HotspotUser.objects.filter(client=client, plan=plan, active=False)
        pppoe_sessions = PPPoEUser.objects.filter(client=client, plan=plan, active=False)

        total_used_time = 0
        for session in hotspot_sessions:
            total_used_time += getattr(session, "total_session_time", 0) or 0
        for session in pppoe_sessions:
            total_used_time += getattr(session, "total_session_time", 0) or 0

        if getattr(plan, "expiry_unit", None) == 'Hours':
            plan_duration = int(getattr(plan, "expiry_value", 0)) * 3600
        elif getattr(plan, "expiry_unit", None) == 'Days':
            plan_duration = int(getattr(plan, "expiry_value", 0)) * 86400
        else:  # Unlimited or other
            plan_duration = 0

        remaining_time = max(0, plan_duration - total_used_time) if plan_duration > 0 else 0
        return remaining_time

    def activate_hotspot_on_router(self, router, hotspot_user):
        # Existing hotspot activation logic
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

                data_limit = 0
                if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
                    try:
                        multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                        data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
                    except Exception:
                        data_limit = 0

                username = getattr(hotspot_user.client, "user", None)
                username_str = username.username if username else f"user_{hotspot_user.client.id}"

                hotspot.add(
                    name=username_str,
                    password=str(hotspot_user.client.id),
                    profile=getattr(hotspot_user.plan, "name", ""),
                    mac_address=hotspot_user.mac.lower(),
                    limit_bytes_total=data_limit
                )

                if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
                    active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
                    if active:
                        api.get_resource("/ip/hotspot/active").set(
                            id=active[0].get('id'),
                            idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
                        )

                api_pool.disconnect()
                return True, None

            elif router.type == "ubiquiti":
                # Ubiquiti hotspot activation logic
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                auth_minutes = max(1, hotspot_user.remaining_time // 60) if hotspot_user.remaining_time and hotspot_user.remaining_time > 0 else 1440

                def to_int_if_numeric(val):
                    try:
                        return int(float(val))
                    except Exception:
                        return 0

                bytes_limit = 0
                if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
                    try:
                        mul = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                        bytes_limit = int(float(hotspot_user.plan.data_limit_value) * mul)
                    except Exception:
                        bytes_limit = 0

                data = {
                    "cmd": "authorize-guest",
                    "mac": hotspot_user.mac.lower(),
                    "minutes": auth_minutes,
                    "up": to_int_if_numeric(getattr(hotspot_user.plan, "upload_speed_value", 0)),
                    "down": to_int_if_numeric(getattr(hotspot_user.plan, "download_speed_value", 0)),
                    "bytes": bytes_limit
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
                # Placeholder for Cisco
                return True, None

            else:
                return False, f"Unsupported router type: {router.type}"

        except Exception as e:
            logger.exception(f"Error activating hotspot on router {getattr(router, 'id', 'unknown')}")
            return False, str(e)

    def activate_pppoe_on_router(self, router, pppoe_user):
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                pppoe_secret = api.get_resource("/ppp/secret")

                # Configure PPPoE secret
                pppoe_secret.add(
                    name=pppoe_user.username,
                    password=pppoe_user.password,
                    service="pppoe",
                    profile=getattr(pppoe_user.plan, "name", "default"),
                    remote_address=pppoe_user.ip_address or "dynamic"
                )

                # Set session timeout if remaining time is specified
                if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
                    profile_resource = api.get_resource("/ppp/profile")
                    profile_resource.set(
                        name=getattr(pppoe_user.plan, "name", "default"),
                        session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
                    )

                api_pool.disconnect()
                return True, None

            elif router.type == "ubiquiti":
                # Ubiquiti PPPoE configuration would go here
                # This is a placeholder as Ubiquiti typically doesn't handle PPPoE servers
                return True, "PPPoE configuration not supported on Ubiquiti routers"

            elif router.type == "cisco":
                # Placeholder for Cisco PPPoE
                return True, None

            else:
                return False, f"Unsupported router type for PPPoE: {router.type}"

        except Exception as e:
            logger.exception(f"Error activating PPPoE on router {getattr(router, 'id', 'unknown')}")
            return False, str(e)

# NEW: Session Recovery Views
class SessionRecoveryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SessionRecoverySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        phone_number = data['phone_number']
        mac_address = data.get('mac_address', '')
        username = data.get('username', '')
        recovery_method = data['recovery_method']

        try:
            # Find recoverable sessions
            recoverable_sessions = self.find_recoverable_sessions(phone_number, mac_address, username)
            
            if not recoverable_sessions:
                return Response({"error": "No recoverable sessions found"}, status=status.HTTP_404_NOT_FOUND)

            recovered_sessions = []
            for session in recoverable_sessions:
                if self.recover_session(session, recovery_method):
                    recovered_sessions.append(session.id)

            return Response({
                "message": f"Recovered {len(recovered_sessions)} sessions",
                "recovered_count": len(recovered_sessions),
                "recovered_sessions": recovered_sessions
            })

        except Exception as e:
            logger.error(f"Session recovery failed: {str(e)}")
            return Response({"error": "Session recovery failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def find_recoverable_sessions(self, phone_number, mac_address, username):
        """Find sessions that can be recovered"""
        cutoff_time = timezone.now() - timedelta(hours=24)
        
        sessions = RouterSessionHistory.objects.filter(
            Q(start_time__gte=cutoff_time),
            Q(recoverable=True),
            Q(recovery_attempted=False),
            Q(disconnected_reason__in=['router_reboot', 'power_outage', 'router_switch'])
        )

        if mac_address:
            sessions = sessions.filter(
                Q(hotspot_user__mac=mac_address) | 
                Q(hotspot_user__client__user__phone_number=phone_number)
            )
        elif username:
            sessions = sessions.filter(
                Q(pppoe_user__username=username) |
                Q(pppoe_user__client__user__phone_number=phone_number)
            )
        else:
            sessions = sessions.filter(
                Q(hotspot_user__client__user__phone_number=phone_number) |
                Q(pppoe_user__client__user__phone_number=phone_number)
            )

        return sessions

    def recover_session(self, session, recovery_method):
        """Recover a single session"""
        try:
            if session.user_type == 'hotspot' and session.hotspot_user:
                return self.recover_hotspot_session(session.hotspot_user, recovery_method)
            elif session.user_type == 'pppoe' and session.pppoe_user:
                return self.recover_pppoe_session(session.pppoe_user, recovery_method)
            return False
        except Exception as e:
            logger.error(f"Session recovery failed for {session.id}: {str(e)}")
            session.recovery_attempted = True
            session.save()
            return False

    def recover_hotspot_session(self, hotspot_user, recovery_method):
        """Recover hotspot session"""
        try:
            # Create new hotspot user with same parameters
            new_hotspot_user = HotspotUser.objects.create(
                router=hotspot_user.router,
                client=hotspot_user.client,
                plan=hotspot_user.plan,
                transaction=hotspot_user.transaction,
                mac=hotspot_user.mac,
                ip=hotspot_user.ip,
                active=True,
                remaining_time=hotspot_user.remaining_time
            )

            # Activate on router
            success, error = self.activate_hotspot_on_router(hotspot_user.router, new_hotspot_user)
            
            if success:
                # Mark original session as recovered
                hotspot_user.recovery_attempted = True
                hotspot_user.save()
                return True
            else:
                new_hotspot_user.delete()
                return False
        except Exception as e:
            logger.error(f"Hotspot session recovery failed: {str(e)}")
            return False

    def recover_pppoe_session(self, pppoe_user, recovery_method):
        """Recover PPPoE session"""
        try:
            # Create new PPPoE user with same parameters
            new_pppoe_user = PPPoEUser.objects.create(
                router=pppoe_user.router,
                client=pppoe_user.client,
                plan=pppoe_user.plan,
                transaction=pppoe_user.transaction,
                username=pppoe_user.username,
                password=pppoe_user.password,
                ip_address=pppoe_user.ip_address,
                active=True,
                remaining_time=pppoe_user.remaining_time
            )

            # Activate on router
            success, error = self.activate_pppoe_on_router(pppoe_user.router, new_pppoe_user)
            
            if success:
                # Mark original session as recovered
                pppoe_user.recovery_attempted = True
                pppoe_user.save()
                return True
            else:
                new_pppoe_user.delete()
                return False
        except Exception as e:
            logger.error(f"PPPoE session recovery failed: {str(e)}")
            return False

    def activate_hotspot_on_router(self, router, hotspot_user):
        """Reuse activation logic from RouterActivateUserView"""
        # This method should contain the same implementation as RouterActivateUserView.activate_hotspot_on_router
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

                data_limit = 0
                if getattr(hotspot_user.plan, "data_limit_value", None) and str(hotspot_user.plan.data_limit_value).lower() != 'unlimited':
                    try:
                        multiplier = 1024 ** 3 if hotspot_user.plan.data_limit_unit == "GB" else 1024 ** 4
                        data_limit = int(float(hotspot_user.plan.data_limit_value) * multiplier)
                    except Exception:
                        data_limit = 0

                username = getattr(hotspot_user.client, "user", None)
                username_str = username.username if username else f"user_{hotspot_user.client.id}"

                hotspot.add(
                    name=username_str,
                    password=str(hotspot_user.client.id),
                    profile=getattr(hotspot_user.plan, "name", ""),
                    mac_address=hotspot_user.mac.lower(),
                    limit_bytes_total=data_limit
                )

                if hotspot_user.remaining_time and hotspot_user.remaining_time > 0:
                    active = api.get_resource("/ip/hotspot/active").get(mac_address=hotspot_user.mac.lower())
                    if active:
                        api.get_resource("/ip/hotspot/active").set(
                            id=active[0].get('id'),
                            idle_timeout=f"{max(1, hotspot_user.remaining_time // 60)}m"
                        )

                api_pool.disconnect()
                return True, None
            return False, "Router type not supported for hotspot recovery"
        except Exception as e:
            return False, str(e)

    def activate_pppoe_on_router(self, router, pppoe_user):
        """Reuse activation logic from RouterActivateUserView"""
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                pppoe_secret = api.get_resource("/ppp/secret")

                # Configure PPPoE secret
                pppoe_secret.add(
                    name=pppoe_user.username,
                    password=pppoe_user.password,
                    service="pppoe",
                    profile=getattr(pppoe_user.plan, "name", "default"),
                    remote_address=pppoe_user.ip_address or "dynamic"
                )

                # Set session timeout if remaining time is specified
                if pppoe_user.remaining_time and pppoe_user.remaining_time > 0:
                    profile_resource = api.get_resource("/ppp/profile")
                    profile_resource.set(
                        name=getattr(pppoe_user.plan, "name", "default"),
                        session_timeout=f"{max(1, pppoe_user.remaining_time // 60)}m"
                    )

                api_pool.disconnect()
                return True, None
            return False, "Router type not supported for PPPoE recovery"
        except Exception as e:
            return False, str(e)

# NEW: Bulk Operations View
class BulkOperationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BulkActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        router_ids = data['router_ids']
        action = data['action']
        parameters = data.get('parameters', {})

        # Create bulk operation record
        bulk_operation = BulkOperation.objects.create(
            operation_type=action,
            initiated_by=request.user,
            status='running'
        )
        bulk_operation.routers.set(router_ids)

        # Execute bulk operation asynchronously
        self.execute_bulk_operation.delay(bulk_operation.operation_id, parameters)

        return Response({
            "operation_id": str(bulk_operation.operation_id),
            "message": "Bulk operation started",
            "status": "running"
        })

    @staticmethod
    @async_to_sync
    async def execute_bulk_operation(operation_id, parameters):
        """Execute bulk operation asynchronously"""
        try:
            bulk_operation = BulkOperation.objects.get(operation_id=operation_id)
            routers = bulk_operation.routers.all()
            
            results = {
                'completed': [],
                'failed': [],
                'details': {}
            }

            for router in routers:
                try:
                    if bulk_operation.operation_type == 'health_check':
                        success = await perform_router_health_check(router)
                    elif bulk_operation.operation_type == 'restart':
                        success = await restart_router(router)
                    elif bulk_operation.operation_type == 'update_status':
                        success = await update_router_status(router, parameters.get('status'))
                    else:
                        success = False

                    if success:
                        results['completed'].append(router.id)
                    else:
                        results['failed'].append(router.id)

                    results['details'][router.id] = {
                        'success': success,
                        'timestamp': timezone.now().isoformat()
                    }

                except Exception as e:
                    logger.error(f"Bulk operation failed for router {router.id}: {str(e)}")
                    results['failed'].append(router.id)
                    results['details'][router.id] = {
                        'success': False,
                        'error': str(e)
                    }

            # Update operation status
            bulk_operation.results = results
            if results['failed'] and results['completed']:
                bulk_operation.status = 'partial'
            elif results['failed']:
                bulk_operation.status = 'failed'
            else:
                bulk_operation.status = 'completed'
            
            bulk_operation.completed_at = timezone.now()
            bulk_operation.save()

            # Send WebSocket notification
            await channel_layer.group_send(
                "bulk_operations",
                {
                    "type": "bulk_operation_complete",
                    "operation_id": str(operation_id),
                    "status": bulk_operation.status,
                    "results": results
                }
            )

        except Exception as e:
            logger.error(f"Bulk operation execution failed: {str(e)}")

# Helper functions for bulk operations
async def perform_router_health_check(router):
    """Perform health check for a router"""
    try:
        if router.type == "mikrotik":
            api_pool = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port,
                plaintext_login=True
            )
            api = api_pool.get_api()
            system_list = api.get_resource("/system/resource").get()
            api_pool.disconnect()
            return bool(system_list)
        elif router.type == "ubiquiti":
            response = requests.get(
                f"https://{router.ip}:{router.port}/api/self",
                auth=(router.username, router.password),
                verify=False,
                timeout=10
            )
            return response.status_code == 200
        return False
    except Exception:
        return False

async def restart_router(router):
    """Restart a router"""
    try:
        if router.type == "mikrotik":
            api_pool = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            )
            api = api_pool.get_api()
            api.get_resource("/system").call("reboot")
            api_pool.disconnect()
            return True
        elif router.type == "ubiquiti":
            controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
            data = {"cmd": "restart", "mac": "all"}
            response = requests.post(
                controller_url,
                json=data,
                auth=(router.username, router.password),
                verify=False,
                timeout=10
            )
            return response.status_code == 200
        return False
    except Exception:
        return False

async def update_router_status(router, status):
    """Update router status"""
    try:
        router.status = status
        router.save()
        return True
    except Exception:
        return False

# NEW: Enhanced Health Monitoring with WebSockets
class HealthMonitoringView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        routers = Router.objects.filter(is_active=True)
        health_data = []

        for router in routers:
            try:
                health_info = self.get_router_health(router)
                health_data.append(health_info)

                # Send real-time update via WebSocket
                self.send_health_update(router, health_info)

            except Exception as e:
                logger.error(f"Health check failed for router {router.id}: {str(e)}")
                health_data.append({
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "error",
                    "error": str(e)
                })

        return Response(health_data)

    def get_router_health(self, router):
        """Get comprehensive health information for a router"""
        # Try cache first
        cache_key = f"router:{router.id}:health_comprehensive"
        cached_health = redis_client.get(cache_key)
        
        if cached_health:
            return json.loads(cached_health)

        # Perform health check
        health_info = self.perform_health_check(router)
        
        # Cache for 2 minutes
        redis_client.setex(cache_key, 120, json.dumps(health_info))
        
        return health_info

    def perform_health_check(self, router):
        """Perform detailed health check"""
        start_time = timezone.now()
        
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    plaintext_login=True
                )
                api = api_pool.get_api()
                
                # Get comprehensive system metrics
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}
                
                # Get active sessions
                hotspot_active = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []
                
                # Get interface statistics
                interfaces = api.get_resource("/interface").get() or []
                
                api_pool.disconnect()
                response_time = (timezone.now() - start_time).total_seconds()

                # Calculate health score
                health_score = self.calculate_health_score(system, len(hotspot_active) + len(pppoe_active))
                
                system_metrics = {
                    "cpu_load": float(system.get("cpu-load", 0)),
                    "free_memory": float(system.get("free-memory", 0)),
                    "total_memory": float(system.get("total-memory", 0)),
                    "uptime": system.get("uptime", "0"),
                    "hotspot_sessions": len(hotspot_active),
                    "pppoe_sessions": len(pppoe_active),
                    "total_sessions": len(hotspot_active) + len(pppoe_active),
                    "interface_count": len(interfaces),
                    "board_name": system.get("board-name", "Unknown"),
                    "version": system.get("version", "Unknown")
                }

                # Create health check record
                health_check = RouterHealthCheck.objects.create(
                    router=router,
                    is_online=True,
                    response_time=response_time,
                    system_metrics=system_metrics,
                    health_score=health_score,
                    performance_metrics=self.get_performance_metrics(system)
                )

                return {
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "online",
                    "response_time": response_time,
                    "health_score": health_score,
                    "system_metrics": system_metrics,
                    "timestamp": start_time.isoformat()
                }

            elif router.type == "ubiquiti":
                try:
                    response = requests.get(
                        f"https://{router.ip}:{router.port}/api/self",
                        auth=(router.username, router.password),
                        verify=False,
                        timeout=10
                    )
                    ok = response.status_code == 200
                    response_time = (timezone.now() - start_time).total_seconds()

                    RouterHealthCheck.objects.create(
                        router=router,
                        is_online=ok,
                        response_time=response_time
                    )

                    return {
                        "router": router.name,
                        "router_ip": router.ip,
                        "status": "online" if ok else "offline",
                        "response_time": response_time,
                        "health_score": 100 if ok else 0,
                        "system_metrics": {},
                        "timestamp": start_time.isoformat()
                    }

                except Exception as e:
                    RouterHealthCheck.objects.create(
                        router=router,
                        is_online=False,
                        error_message=str(e)
                    )
                    return {
                        "router": router.name,
                        "router_ip": router.ip,
                        "status": "offline",
                        "error": str(e),
                        "health_score": 0,
                        "timestamp": start_time.isoformat()
                    }
            
        except Exception as e:
            # Create failed health check record
            RouterHealthCheck.objects.create(
                router=router,
                is_online=False,
                error_message=str(e),
                health_score=0
            )
            
            return {
                "router": router.name,
                "router_ip": router.ip,
                "status": "offline",
                "error": str(e),
                "health_score": 0,
                "timestamp": start_time.isoformat()
            }

    def calculate_health_score(self, system_metrics, active_sessions):
        """Calculate comprehensive health score (0-100)"""
        score = 100
        
        # CPU impact (up to -30 points)
        cpu_load = float(system_metrics.get("cpu-load", 0))
        if cpu_load > 80:
            score -= 30
        elif cpu_load > 60:
            score -= 15
        elif cpu_load > 40:
            score -= 5
            
        # Memory impact (up to -20 points)
        free_memory = float(system_metrics.get("free-memory", 0))
        total_memory = float(system_metrics.get("total-memory", 1))
        memory_usage = ((total_memory - free_memory) / total_memory) * 100
        
        if memory_usage > 90:
            score -= 20
        elif memory_usage > 80:
            score -= 10
        elif memory_usage > 70:
            score -= 5
            
        # Session load impact (up to -10 points)
        if active_sessions > 100:
            score -= 10
        elif active_sessions > 50:
            score -= 5
            
        return max(0, score)

    def get_performance_metrics(self, system_metrics):
        """Extract performance metrics from system data"""
        return {
            "cpu_usage": float(system_metrics.get("cpu-load", 0)),
            "memory_usage": self.calculate_memory_usage(system_metrics),
            "load_average": system_metrics.get("load-average", "0,0,0"),
            "architecture": system_metrics.get("architecture", "Unknown"),
            "platform": system_metrics.get("platform", "Unknown")
        }

    def calculate_memory_usage(self, system_metrics):
        """Calculate memory usage percentage"""
        free_memory = float(system_metrics.get("free-memory", 0))
        total_memory = float(system_metrics.get("total-memory", 1))
        return ((total_memory - free_memory) / total_memory) * 100

    def send_health_update(self, router, health_info):
        """Send real-time health update via WebSocket"""
        try:
            async_to_sync(channel_layer.group_send)(
                f"router_{router.id}_health",
                {
                    "type": "health_update",
                    "router_id": router.id,
                    "health_info": health_info,
                    "timestamp": timezone.now().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"Health WebSocket update failed: {str(e)}")

# NEW: Audit Log View
class RouterAuditLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        router_id = request.query_params.get('router_id')
        action = request.query_params.get('action')
        days = int(request.query_params.get('days', 7))
        
        start_date = timezone.now() - timedelta(days=days)
        
        logs = RouterAuditLog.objects.filter(timestamp__gte=start_date)
        
        if router_id:
            logs = logs.filter(router_id=router_id)
        if action:
            logs = logs.filter(action=action)
            
        logs = logs.select_related('router', 'user').order_by('-timestamp')
        
        page = self.paginate_queryset(logs, request)
        if page is not None:
            serializer = RouterAuditLogSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = RouterAuditLogSerializer(logs, many=True)
        return Response(serializer.data)

    def paginate_queryset(self, queryset, request):
        """Simple pagination implementation"""
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        if start >= len(queryset):
            return None
            
        return list(queryset[start:end])

    def get_paginated_response(self, data):
        return Response({
            'count': len(data),
            'results': data
        })

# Keep existing views with enhancements
class RouterStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        # Try cache first
        cache_key = f"router:{pk}:stats"
        cached_data = redis_client.get(cache_key)
        
        if cached_data:
            return Response(json.loads(cached_data))

        router = self.get_object(pk)
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()

                # system resource may return a list with single item
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}

                hotspot = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []  # NEW: Get PPPoE active sessions

                stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]

                # Safe numeric parsing
                def safe_float(x, default=0.0):
                    try:
                        return float(x)
                    except Exception:
                        return default

                cpu = safe_float(system.get("cpu-load", 0))
                free_mem = safe_float(system.get("free-memory", 0))
                memory_mb = free_mem / 1024 / 1024 if free_mem else 0
                uptime = system.get("uptime", "0")
                temperature = safe_float(system.get("cpu-temperature", 0))
                interfaces = api.get_resource("/interface").get() or [{}]
                rx = safe_float(interfaces[0].get("rx-byte", 0))
                throughput_mb = rx / 1024 / 1024 if rx else 0
                total_hdd = safe_float(system.get("total-hdd-space", 1))
                free_hdd = safe_float(system.get("free-hdd-space", 0))
                disk_percent = (free_hdd / total_hdd * 100) if total_hdd else 0

                # Calculate total clients (hotspot + PPPoE)
                total_clients = len(hotspot) + len(pppoe_active)

                latest_stats = {
                    "cpu": cpu,
                    "memory": memory_mb,
                    "clients": total_clients,  # UPDATED: Include PPPoE clients
                    "hotspot_clients": len(hotspot),
                    "pppoe_clients": len(pppoe_active),
                    "uptime": uptime,
                    "signal": -60,  # Placeholder; you can compute if available
                    "temperature": temperature,
                    "throughput": throughput_mb,
                    "disk": disk_percent,
                    "timestamp": timezone.now()
                }

                RouterStats.objects.create(router=router, **latest_stats)
                serializer = RouterStatsSerializer(stats, many=True)

                history = {key: [getattr(s, key) for s in stats] for key in latest_stats if key != "timestamp"}
                history["timestamps"] = [s.timestamp.strftime("%H:%M:%S") for s in stats]

                api_pool.disconnect()
                
                response_data = {"latest": latest_stats, "history": history}
                # Cache for 1 minute
                redis_client.setex(cache_key, 60, json.dumps(response_data))
                
                return Response(response_data)

            elif router.type == "ubiquiti":
                response = requests.get(
                    f"https://{router.ip}:{router.port}/api/s/default/stat/sta",
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=10
                )

                data = response.json().get('data', []) if response and response.status_code == 200 else []
                clients = len(data)
                signal = sum([sta.get('signal', 0) for sta in data]) / clients if clients else 0
                throughput = sum([sta.get('rx_rate', 0) + sta.get('tx_rate', 0) for sta in data]) / 1024 / 1024 if data else 0

                latest_stats = {
                    "cpu": 0,
                    "memory": 0,
                    "clients": clients,
                    "hotspot_clients": clients,
                    "pppoe_clients": 0,
                    "uptime": "N/A",
                    "signal": signal,
                    "temperature": 0,
                    "throughput": throughput,
                    "disk": 0,
                    "timestamp": timezone.now()
                }

                RouterStats.objects.create(router=router, **latest_stats)
                
                response_data = {"latest": latest_stats, "history": {}}
                # Cache for 1 minute
                redis_client.setex(cache_key, 60, json.dumps(response_data))
                
                return Response(response_data)

            return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("Error getting router stats")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterRebootView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def post(self, request, pk):
        router = self.get_object(pk)
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                api.get_resource("/system").call("reboot")
                api_pool.disconnect()

            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
                data = {"cmd": "restart", "mac": "all"}
                try:
                    requests.post(
                        controller_url,
                        json=data,
                        auth=(router.username, router.password),
                        verify=False,
                        timeout=10
                    )
                except Exception:
                    logger.exception("Ubiquiti reboot request failed")

            # Disconnect both hotspot and PPPoE users
            active_hotspot_users = HotspotUser.objects.filter(router=router, active=True)
            active_pppoe_users = PPPoEUser.objects.filter(router=router, active=True)
            
            for user in active_hotspot_users:
                user.active = False
                user.disconnected_at = timezone.now()
                user.save()

                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    hotspot_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="router_reboot",
                    user_type="hotspot"
                )

            for user in active_pppoe_users:
                user.active = False
                user.disconnected_at = timezone.now()
                user.save()

                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    pppoe_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="router_reboot",
                    user_type="pppoe"
                )

            router.status = "updating"
            router.save()

            # Clear cache
            patterns = [f"router:{pk}:*", "routers:list:*"]
            for pattern in patterns:
                keys = redis_client.keys(pattern)
                if keys:
                    redis_client.delete(*keys)

            # Send WebSocket update
            try:
                async_to_sync(channel_layer.group_send)(
                    "routers",
                    {
                        "type": "router_update",
                        "action": "router_rebooted",
                        "router_id": pk,
                        "timestamp": timezone.now().isoformat()
                    }
                )
            except Exception as e:
                logger.error(f"WebSocket update failed: {str(e)}")

            return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error rebooting router")
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
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                active = api.get_resource("/ip/hotspot/active").get(mac_address=user.mac.lower())
                if active:
                    api.get_resource("/ip/hotspot/active").remove(id=active[0].get('id'))
                api_pool.disconnect()

            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
                try:
                    requests.post(
                        controller_url,
                        json=data,
                        auth=(router.username, router.password),
                        verify=False,
                        timeout=10
                    )
                except Exception:
                    logger.exception("Ubiquiti unauthorize request failed")

            if user.active:
                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    hotspot_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="manual_disconnect",
                    user_type="hotspot"
                )

            user.active = False
            user.disconnected_at = timezone.now()
            user.save()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.exception("Error disconnecting user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PPPoEUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        router = self.get_object(pk)
        users = PPPoEUser.objects.filter(router=router).order_by('-connected_at')
        serializer = PPPoEUserSerializer(users, many=True)
        return Response(serializer.data)

class PPPoEUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(PPPoEUser, pk=pk)

    def delete(self, request, pk):
        user = self.get_object(pk)
        try:
            router = user.router

            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                pppoe_secret = api.get_resource("/ppp/secret")
                secrets = pppoe_secret.get(name=user.username)
                if secrets:
                    pppoe_secret.remove(id=secrets[0].get('id'))
                api_pool.disconnect()

            if user.active:
                session_duration = int((timezone.now() - user.connected_at).total_seconds())
                RouterSessionHistory.objects.create(
                    pppoe_user=user,
                    router=router,
                    start_time=user.connected_at,
                    end_time=timezone.now(),
                    data_used=getattr(user, "data_used", 0),
                    duration=session_duration,
                    disconnected_reason="manual_disconnect",
                    user_type="pppoe"
                )

            user.active = False
            user.disconnected_at = timezone.now()
            user.save()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.exception("Error disconnecting PPPoE user")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# NEW: WebSocket Consumer (consumers.py)
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RouterConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.router_group = "routers"
        
        # Join router group
        await self.channel_layer.group_add(
            self.router_group,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave router group
        await self.channel_layer.group_discard(
            self.router_group,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.router_group,
            {
                'type': 'router_message',
                'message': message
            }
        )

    # Receive message from room group
    async def router_message(self, event):
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def router_update(self, event):
        """Handle router update events"""
        await self.send(text_data=json.dumps({
            'type': 'router_update',
            'action': event['action'],
            'router_id': event['router_id'],
            'timestamp': event['timestamp']
        }))

    async def health_update(self, event):
        """Handle health update events"""
        await self.send(text_data=json.dumps({
            'type': 'health_update',
            'router_id': event['router_id'],
            'health_info': event['health_info'],
            'timestamp': event['timestamp']
        }))

    async def bulk_operation_complete(self, event):
        """Handle bulk operation completion"""
        await self.send(text_data=json.dumps({
            'type': 'bulk_operation_complete',
            'operation_id': event['operation_id'],
            'status': event['status'],
            'results': event['results']
        }))