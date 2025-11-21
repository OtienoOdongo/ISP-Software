
# network_management/api/views/router_management/router_health_views.py

"""
Router Health and Monitoring Views for Network Management System
"""

import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.cache import cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import (
    Router, RouterHealthCheck, RouterAuditLog
)
from network_management.utils.mikrotik_connector import MikroTikConnector
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class RouterHealthCheckView(APIView):
    """
    API View for comprehensive router health checks with detailed diagnostics.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        """Get comprehensive health check for a specific router or all routers."""
        if pk:
            # Single router health check
            router = get_object_or_404(Router, pk=pk, is_active=True)
            health_info = self.get_router_health(router)
            return Response(health_info)
        else:
            # All routers health check
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
        cache.set(cache_key, health_info, 120)  # Cache for 2 minutes
        
        return health_info

    def perform_health_check(self, router):
        """Perform detailed health check on a router."""
        start_time = timezone.now()
        
        try:
            connector = MikroTikConnector(
                router.ip,
                router.username,
                router.password,
                router.port
            )
            
            test_results = connector.test_connection()
            
            if test_results.get('system_access'):
                system_info = test_results.get('system_info', {})
                health_score = self.calculate_health_score(system_info)
                
                system_metrics = {
                    "cpu_load": float(system_info.get("cpu-load", 0)),
                    "free_memory": float(system_info.get("free-memory", 0)),
                    "total_memory": float(system_info.get("total-memory", 0)),
                    "uptime": system_info.get("uptime", "0"),
                    "board_name": system_info.get("board-name", "Unknown"),
                    "version": system_info.get("version", "Unknown")
                }

                # Save health check result
                health_check = RouterHealthCheck.objects.create(
                    router=router,
                    is_online=True,
                    response_time=test_results.get('response_time'),
                    system_metrics=system_metrics,
                    health_score=health_score,
                    performance_metrics=self.get_performance_metrics(system_info)
                )

                return {
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "online",
                    "response_time": test_results.get('response_time'),
                    "health_score": health_score,
                    "system_metrics": system_metrics,
                    "timestamp": start_time.isoformat()
                }
            else:
                # Router is offline
                RouterHealthCheck.objects.create(
                    router=router,
                    is_online=False,
                    error_message="Connection test failed",
                    health_score=0
                )
                
                return {
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "offline",
                    "error": "Connection test failed",
                    "health_score": 0,
                    "timestamp": start_time.isoformat()
                }
            
        except Exception as e:
            logger.error(f"Health check failed for router {router.id}: {str(e)}")
            RouterHealthCheck.objects.create(
                router=router,
                is_online=False,
                error_message=str(e),
                health_score=0
            )
            
            return {
                "router": router.name,
                "router_ip": router.ip,
                "status": "error",
                "error": str(e),
                "health_score": 0,
                "timestamp": start_time.isoformat()
            }

    def calculate_health_score(self, system_metrics):
        """Calculate comprehensive health score (0-100)."""
        try:
            score = 100
            
            # CPU usage penalty
            cpu_load = float(system_metrics.get("cpu-load", 0))
            if cpu_load > 90:
                score -= 30
            elif cpu_load > 70:
                score -= 15
            elif cpu_load > 50:
                score -= 5
            
            # Memory usage penalty
            free_memory = float(system_metrics.get("free-memory", 0))
            total_memory = float(system_metrics.get("total-memory", 1))
            memory_usage = ((total_memory - free_memory) / total_memory) * 100
            
            if memory_usage > 90:
                score -= 20
            elif memory_usage > 80:
                score -= 10
            elif memory_usage > 70:
                score -= 5
            
            return max(0, min(100, score))
        except Exception:
            return 50  # Default score if calculation fails

    def get_performance_metrics(self, system_metrics):
        """Extract performance metrics from system data."""
        return {
            "cpu_usage": float(system_metrics.get("cpu-load", 0)),
            "memory_usage": self.calculate_memory_usage(system_metrics),
            "architecture": system_metrics.get("architecture", "Unknown"),
            "platform": system_metrics.get("platform", "Unknown")
        }

    def calculate_memory_usage(self, system_metrics):
        """Calculate memory usage percentage."""
        try:
            free_memory = float(system_metrics.get("free-memory", 0))
            total_memory = float(system_metrics.get("total-memory", 1))
            return ((total_memory - free_memory) / total_memory) * 100
        except (ValueError, ZeroDivisionError):
            return 0


class RestoreSessionsView(APIView):
    """
    API View for restoring user sessions on specific routers.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Restore sessions for a specific router."""
        router = get_object_or_404(Router, pk=pk, is_active=True)
        
        try:
            from network_management.api.views.router_management.router_session_views import SessionRecoveryView
            recovery_view = SessionRecoveryView()
            
            # Get recoverable sessions for this router
            recoverable_sessions = recovery_view.find_recoverable_sessions(
                phone_number="", 
                mac_address="", 
                username=""
            ).filter(router=router)
            
            recovered_count = 0
            for session in recoverable_sessions:
                if recovery_view.recover_session(session, 'auto'):
                    recovered_count += 1
            
            # Send WebSocket notification
            WebSocketManager.send_session_recovery_notification(recovered_count)
            
            # Create audit log
            RouterAuditLog.objects.create(
                router=router,
                action='session_restore',
                description=f"Restored {recovered_count} sessions on {router.name}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                "message": f"Restored {recovered_count} sessions on {router.name}",
                "recovered_count": recovered_count,
                "router": router.name
            })
            
        except Exception as e:
            logger.error(f"Session restoration failed for router {router.id}: {str(e)}")
            return Response(
                {"error": f"Session restoration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')


class UserSessionRecoveryView(APIView):
    """
    API View for user session recovery with enhanced error handling.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Recover user sessions based on provided criteria."""
        from network_management.api.views.router_management.router_session_views import SessionRecoveryView
        recovery_view = SessionRecoveryView()
        
        try:
            return recovery_view.post(request)
        except Exception as e:
            logger.error(f"User session recovery failed: {str(e)}")
            return Response(
                {"error": f"Session recovery failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )