
# network_management/api/views/router_management/router_monitoring_views.py
"""
Router Monitoring and Statistics Views for Network Management System

This module provides API views for router monitoring, statistics, and health checks.
"""

import logging
import requests
from routeros_api import RouterOsApiPool

from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.cache import cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import (
    Router, RouterStats, RouterHealthCheck, HotspotUser, PPPoEUser, RouterSessionHistory
)
from network_management.serializers.router_management_serializer import RouterStatsSerializer
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class RouterStatsView(APIView):
    """
    API View for retrieving router statistics.
    """
    
    permission_classes = [IsAuthenticated]

    def get_router(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def get(self, request, pk):
        """Retrieve statistics for a specific router."""
        cache_key = f"router:{pk}:stats"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)

        router = self.get_router(pk)
        try:
            if router.type == "mikrotik":
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()

                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}

                hotspot = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []

                stats = RouterStats.objects.filter(router=router).order_by("-timestamp")[:10]

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

                total_clients = len(hotspot) + len(pppoe_active)

                latest_stats = {
                    "cpu": cpu,
                    "memory": memory_mb,
                    "clients": total_clients,
                    "hotspot_clients": len(hotspot),
                    "pppoe_clients": len(pppoe_active),
                    "uptime": uptime,
                    "signal": -60,
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
                cache.set(cache_key, response_data, 60)
                
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
                cache.set(cache_key, response_data, 60)
                
                return Response(response_data)

            return Response({"error": "Stats not supported for this router type"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception("Error getting router stats")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthMonitoringView(APIView):
    """
    API View for comprehensive router health monitoring.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve health information for all routers."""
        routers = Router.objects.filter(is_active=True)
        health_data = []

        for router in routers:
            try:
                health_info = self.get_router_health(router)
                health_data.append(health_info)
                WebSocketManager.send_health_update(router.id, health_info)

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
        """Get comprehensive health information for a router."""
        cache_key = f"router:{router.id}:health_comprehensive"
        cached_health = cache.get(cache_key)
        
        if cached_health:
            return cached_health

        health_info = self.perform_health_check(router)
        cache.set(cache_key, health_info, 120)
        
        return health_info

    def perform_health_check(self, router):
        """Perform detailed health check on a router."""
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
                
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}
                
                hotspot_active = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []
                interfaces = api.get_resource("/interface").get() or []
                
                api_pool.disconnect()
                response_time = (timezone.now() - start_time).total_seconds()

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

                RouterHealthCheck.objects.create(
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
        """Calculate comprehensive health score (0-100)."""
        score = 100
        
        cpu_load = float(system_metrics.get("cpu-load", 0))
        if cpu_load > 80:
            score -= 30
        elif cpu_load > 60:
            score -= 15
        elif cpu_load > 40:
            score -= 5
            
        free_memory = float(system_metrics.get("free-memory", 0))
        total_memory = float(system_metrics.get("total-memory", 1))
        memory_usage = ((total_memory - free_memory) / total_memory) * 100
        
        if memory_usage > 90:
            score -= 20
        elif memory_usage > 80:
            score -= 10
        elif memory_usage > 70:
            score -= 5
            
        if active_sessions > 100:
            score -= 10
        elif active_sessions > 50:
            score -= 5
            
        return max(0, score)

    def get_performance_metrics(self, system_metrics):
        """Extract performance metrics from system data."""
        return {
            "cpu_usage": float(system_metrics.get("cpu-load", 0)),
            "memory_usage": self.calculate_memory_usage(system_metrics),
            "load_average": system_metrics.get("load-average", "0,0,0"),
            "architecture": system_metrics.get("architecture", "Unknown"),
            "platform": system_metrics.get("platform", "Unknown")
        }

    def calculate_memory_usage(self, system_metrics):
        """Calculate memory usage percentage."""
        free_memory = float(system_metrics.get("free-memory", 0))
        total_memory = float(system_metrics.get("total-memory", 1))
        return ((total_memory - free_memory) / total_memory) * 100


class RouterRebootView(APIView):
    """
    API View for rebooting routers.
    """
    
    permission_classes = [IsAuthenticated]

    def get_router(self, pk):
        return get_object_or_404(Router, pk=pk, is_active=True)

    def post(self, request, pk):
        """Reboot a specific router."""
        router = self.get_router(pk)
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

            self.disconnect_active_users(router)
            router.status = "updating"
            router.save()

            self.clear_router_cache(pk)
            WebSocketManager.send_router_update(pk, 'router_rebooted', {'name': router.name})

            return Response({"message": "Router reboot initiated"}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error rebooting router")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def disconnect_active_users(self, router):
        """Disconnect all active users from router."""
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

    def clear_router_cache(self, router_id):
        """Clear cache for specific router."""
        try:
            cache.delete_pattern(f"router:{router_id}:*")
            cache.delete_pattern("routers:list:*")
        except Exception as e:
            logger.warning(f"Cache pattern deletion failed: {e}")