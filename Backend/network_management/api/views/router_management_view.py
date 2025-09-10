

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from network_management.models.router_management_model import Router, RouterStats, HotspotUser
# from network_management.serializers.router_management_serializer import RouterSerializer, RouterStatsSerializer, HotspotUserSerializer
# from account.models.admin_model import Client
# from internet_plans.models.create_plan_models import InternetPlan
# from payments.models.payment_config_model import Transaction
# from routeros_api import RouterOsApiPool
# from django.utils import timezone
# import os

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
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#             system = api.get_resource("/system/resource").get()[0]
#             hotspot = api.get_resource("/ip/hotspot/active").get()
#             stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]
#             latest_stats = {
#                 "cpu": float(system.get("cpu-load", 0)),
#                 "memory": float(system.get("free-memory", 0)) / 1024 / 1024,
#                 "clients": len(hotspot),
#                 "uptime": system.get("uptime", "0%"),
#                 "signal": -60,  # Placeholder, adjust if signal data available
#                 "temperature": float(system.get("cpu-temperature", 0)),
#                 "throughput": float(api.get_resource("/interface").get()[0].get("rx-byte", 0)) / 1024 / 1024,
#                 "disk": float(system.get("free-hdd-space", 0)) / float(system.get("total-hdd-space", 1)) * 100,
#                 "timestamp": timezone.now()
#             }
#             RouterStats.objects.create(router=router, **latest_stats)
#             serializer = RouterStatsSerializer(stats, many=True)
#             history = {key: [getattr(s, key) for s in stats] for key in latest_stats if key != "timestamp"}
#             history["timestamps"] = [s.timestamp.strftime("%H:%M:%S") for s in stats]
#             api.close()
#             return Response({"latest": latest_stats, "history": history})
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
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#             api.get_resource("/system").call("reboot")
#             api.close()
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

#     def post(self, request, pk):
#         router = self.get_object(pk)
#         if not router:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#         client_id = request.data.get("client_id")
#         plan_id = request.data.get("plan_id")
#         transaction_id = request.data.get("transaction_id")
#         mac = request.data.get("mac")

#         try:
#             client = Client.objects.get(id=client_id)
#             plan = InternetPlan.objects.get(id=plan_id)
#             transaction = Transaction.objects.get(id=transaction_id, status="completed")
#         except (Client.DoesNotExist, InternetPlan.DoesNotExist, Transaction.DoesNotExist):
#             return Response({"error": "Invalid client, plan, or transaction"}, status=status.HTTP_400_BAD_REQUEST)

#         api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#         hotspot = api.get_resource("/ip/hotspot/user")
#         hotspot.add(
#             name=client.full_name,
#             password=str(client.id),  # Use client ID as password for simplicity
#             profile=plan.name,
#             mac_address=mac,
#             limit_bytes_total=int(plan.dataLimit.value * (1024 ** 3 if plan.dataLimit.unit == "GB" else 1024 ** 2))
#         )
#         ip = api.get_resource("/ip/hotspot/active").get(mac_address=mac)[0]["address"]
#         api.close()

#         user = HotspotUser.objects.create(
#             router=router, client=client, plan=plan, transaction=transaction,
#             mac=mac, ip=ip, active=True
#         )
#         serializer = HotspotUserSerializer(user)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

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
#             api = RouterOsApiPool(user.router.ip, username=user.router.username, password=user.router.password, port=user.router.port).get_api()
#             api.get_resource("/ip/hotspot/active").remove(id=user.mac)
#             api.close()
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

#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#             api.get_resource("/ip/hotspot").set(id="*0", name=hotspot_config["ssid"], interface="bridge", pool="dhcp_pool0", profile="hsprof1")
#             api.get_resource("/ip/hotspot/profile").set(id="hsprof1", login_by="universal", html_directory="hotspot")
#             with open(path, "rb") as f:
#                 api.get_resource("/file").call("upload", file=f.read(), name=f"hotspot/{landing_page.name}")
#             api.close()

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
#                 api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
#                 if action == "connect":
#                     router.status = "connected"
#                 elif action == "disconnect":
#                     router.status = "disconnected"
#                 elif action == "reboot":
#                     api.get_resource("/system").call("reboot")
#                     router.status = "updating"
#                 router.save()
#                 api.close()
#             if action == "delete":
#                 routers.delete()
#             return Response({"message": f"Bulk {action} completed"}, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






# network_management/api/views

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from network_management.models.router_management_model import Router, RouterStats, HotspotUser
from network_management.serializers.router_management_serializer import RouterSerializer, RouterStatsSerializer, HotspotUserSerializer
from account.models.admin_model import Client
from internet_plans.models.create_plan_models import InternetPlan, Subscription
from payments.models.payment_config_model import Transaction
from routeros_api import RouterOsApiPool
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import os
import requests  # For potential other router APIs
import subprocess  # For ARP lookup

@receiver(post_save, sender=Subscription)
def activate_user_on_router(sender, instance, created, **kwargs):
    if created and instance.is_active:
        # Assume default router or find by logic (e.g., first connected)
        router = Router.objects.filter(status="connected").first()
        if not router:
            # Log error or raise
            return
        # Assume MAC from transaction metadata (captured in payment initiation)
        mac = instance.transaction.metadata.get('mac') if instance.transaction else None
        if not mac:
            # Log error
            return
        # Create HotspotUser
        hotspot_user = HotspotUser.objects.create(
            router=router,
            client=instance.client,
            plan=instance.internet_plan,
            transaction=instance.transaction,
            mac=mac,
            ip=instance.transaction.metadata.get('ip', '0.0.0.0'),
            active=True
        )
        # Activate on router based on type
        if router.type == "mikrotik":
            try:
                api_pool = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port)
                api = api_pool.get_api()
                hotspot = api.get_resource("/ip/hotspot/user")
                hotspot.add(
                    name=instance.client.user.name,
                    password=str(instance.client.id),
                    profile=instance.internet_plan.name,
                    mac_address=mac,
                    limit_bytes_total=int(float(instance.internet_plan.data_limit_value) * (1024 ** 3 if instance.internet_plan.data_limit_unit == "GB" else 1024 ** 4)) if instance.internet_plan.data_limit_value != 'Unlimited' else 0
                )
                api_pool.disconnect()
            except Exception as e:
                # Log error
                pass
        elif router.type == "ubiquiti":
            # Example UniFi API call (assume controller URL in router metadata or fixed)
            # Use requests to post to UniFi controller API for authorizing guest
            try:
                controller_url = "https://unifi-controller:8443/api/s/<site>/cmd/stamgr"
                data = {
                    "cmd": "authorize-guest",
                    "mac": mac.lower(),
                    "minutes": int(instance.internet_plan.expiry_value) * (1440 if instance.internet_plan.expiry_unit == "Days" else 43200),  # Convert to minutes
                    "up": int(float(instance.internet_plan.upload_speed_value)) if instance.internet_plan.upload_speed_value != 'Unlimited' else 0,
                    "down": int(float(instance.internet_plan.download_speed_value)) if instance.internet_plan.download_speed_value != 'Unlimited' else 0,
                    "bytes": int(float(instance.internet_plan.data_limit_value) * (1024 ** 3 if instance.internet_plan.data_limit_unit == "GB" else 1024 ** 4)) if instance.internet_plan.data_limit_value != 'Unlimited' else 0
                }
                requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
            except Exception as e:
                # Log error
                pass
        elif router.type == "cisco":
            # Placeholder for Cisco API/CLI
            pass
        # Update subscription or log

class RouterListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        routers = Router.objects.all()
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
        try:
            return Router.objects.get(pk=pk)
        except Router.DoesNotExist:
            return None

    def get(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = RouterSerializer(router)
        return Response(serializer.data)

    def put(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
        router.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RouterActivateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        router = Router.objects.filter(id=pk, status="connected").first()
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
            # Create HotspotUser
            hotspot_user = HotspotUser.objects.create(
                router=router,
                client=client,
                plan=plan,
                transaction=transaction,
                mac=mac,
                ip=request.META.get('REMOTE_ADDR', '0.0.0.0'),
                active=True
            )
            # Type-specific activation
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port)
                api = api_pool.get_api()
                hotspot = api.get_resource("/ip/hotspot/user")
                hotspot.add(
                    name=client.user.name,
                    password=str(client.id),
                    profile=plan.name,
                    mac_address=mac,
                    limit_bytes_total=int(float(plan.data_limit_value) * (1024 ** 3 if plan.data_limit_unit == "GB" else 1024 ** 4)) if plan.data_limit_value != 'Unlimited' else 0
                )
                api_pool.disconnect()
            elif router.type == "ubiquiti":
                # UniFi example
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"  # Assume default site
                data = {
                    "cmd": "authorize-guest",
                    "mac": mac.lower(),
                    "minutes": int(plan.expiry_value) * (1440 if plan.expiry_unit == "Days" else 43200),
                    "up": int(float(plan.upload_speed_value)) if plan.upload_speed_value != 'Unlimited' else 0,
                    "down": int(float(plan.download_speed_value)) if plan.download_speed_value != 'Unlimited' else 0,
                    "bytes": int(float(plan.data_limit_value) * (1024 ** 3 if plan.data_limit_unit == "GB" else 1024 ** 4)) if plan.data_limit_value != 'Unlimited' else 0
                }
                response = requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
                if response.status_code != 200:
                    raise Exception("Ubiquiti activation failed")
            elif router.type == "cisco":
                # Placeholder for Cisco Meraki or IOS API
                pass
            elif router.type == "other":
                # Custom logic, e.g., call external script
                pass
            serializer = HotspotUserSerializer(hotspot_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Router.objects.get(pk=pk)
        except Router.DoesNotExist:
            return None

    def get(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            if router.type == "mikrotik":
                api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
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
                # Example UniFi stats fetch
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/stat/sta"
                response = requests.get(controller_url, auth=(router.username, router.password), verify=False)
                data = response.json().get('data', [])
                # Aggregate stats
                latest_stats = {
                    "cpu": 0,  # Placeholder, fetch from device status
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
                # History similar
                return Response({"latest": latest_stats, "history": {}})  # Implement history
            # Add for other types
            return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterRebootView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Router.objects.get(pk=pk)
        except Router.DoesNotExist:
            return None

    def post(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            if router.type == "mikrotik":
                api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
                api.get_resource("/system").call("reboot")
                api.close()
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
                data = {"cmd": "restart", "mac": "all"}  # Or specific device
                requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
            # Add for others
            router.status = "updating"
            router.save()
            return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HotspotUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Router.objects.get(pk=pk)
        except Router.DoesNotExist:
            return None

    def get(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
        users = HotspotUser.objects.filter(router=router)
        serializer = HotspotUserSerializer(users, many=True)
        return Response(serializer.data)

class HotspotUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return HotspotUser.objects.get(pk=pk)
        except HotspotUser.DoesNotExist:
            return None

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            router = user.router
            if router.type == "mikrotik":
                api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
                api.get_resource("/ip/hotspot/active").remove(id=user.mac)
                api.close()
            elif router.type == "ubiquiti":
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/stamgr"
                data = {"cmd": "unauthorize-guest", "mac": user.mac.lower()}
                requests.post(controller_url, json=data, auth=(router.username, router.password), verify=False)
            # Add for others
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HotspotConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Router.objects.get(pk=pk)
        except Router.DoesNotExist:
            return None

    def post(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response(status=status.HTTP_404_NOT_FOUND)
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
                api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
                api.get_resource("/ip/hotspot").set(id="*0", name=hotspot_config["ssid"], interface="bridge", pool="dhcp_pool0", profile="hsprof1")
                api.get_resource("/ip/hotspot/profile").set(id="hsprof1", login_by="universal", html_directory="hotspot")
                with open(path, "rb") as f:
                    api.get_resource("/file").call("upload", file=f.read(), name=f"hotspot/{landing_page.name}")
                api.close()
            elif router.type == "ubiquiti":
                # UniFi hotspot config example
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/set/setting/guest_access"
                data = {
                    "portal_enabled": True,
                    "portal_customized": True,
                    "redirect_enabled": True,
                    "redirect_url": hotspot_config["redirectUrl"],
                    # Upload landing page to controller if needed
                }
                requests.put(controller_url, json=data, auth=(router.username, router.password), verify=False)
            # Add for others
            return Response({"message": "Hotspot configured"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BulkActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        router_ids = request.data.get("router_ids", [])
        action = request.data.get("action")
        if not router_ids or action not in ["connect", "disconnect", "delete", "reboot"]:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)
        routers = Router.objects.filter(id__in=router_ids)
        try:
            for router in routers:
                if action == "connect":
                    if router.type == "mikrotik":
                        # Test connection
                        RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api().close()
                    elif router.type == "ubiquiti":
                        requests.get(f"https://{router.ip}:{router.port}/api/login", auth=(router.username, router.password), verify=False)
                    # Add for others
                    router.status = "connected"
                elif action == "disconnect":
                    router.status = "disconnected"
                elif action == "reboot":
                    if router.type == "mikrotik":
                        api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()
                        api.get_resource("/system").call("reboot")
                        api.close()
                    # Add for others
                    router.status = "updating"
                router.save()
            if action == "delete":
                routers.delete()
            return Response({"message": f"Bulk {action} completed"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetMacView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client_ip = request.META.get('REMOTE_ADDR')
        try:
            # Use ARP to get MAC (Linux/MacOS example; adjust for server OS)
            result = subprocess.run(['arp', '-n', client_ip], capture_output=True, text=True)
            output = result.stdout
            mac = output.split()[3] if len(output.split()) > 3 else None
            if mac and len(mac) == 17:
                return Response({"mac": mac.upper()})
            else:
                return Response({"mac": "00:00:00:00:00:00"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

