
# # network_management/api/views/router_management/router_health_views.py

# """
# Router Health and Monitoring Views for Network Management System
# """

# import logging
# from django.utils import timezone
# from django.shortcuts import get_object_or_404
# from django.core.cache import cache

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from network_management.models.router_management_model import (
#     Router, RouterHealthCheck, RouterAuditLog
# )
# from network_management.utils.mikrotik_connector import MikroTikConnector
# from network_management.utils.websocket_utils import WebSocketManager

# logger = logging.getLogger(__name__)


# class RouterHealthCheckView(APIView):
#     """
#     API View for comprehensive router health checks with detailed diagnostics.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk=None):
#         """Get comprehensive health check for a specific router or all routers."""
#         if pk:
#             # Single router health check
#             router = get_object_or_404(Router, pk=pk, is_active=True)
#             health_info = self.get_router_health(router)
#             return Response(health_info)
#         else:
#             # All routers health check
#             routers = Router.objects.filter(is_active=True)
#             health_data = []

#             for router in routers:
#                 try:
#                     health_info = self.get_router_health(router)
#                     health_data.append(health_info)
#                     WebSocketManager.send_health_update(router.id, health_info)
#                 except Exception as e:
#                     logger.error(f"Health check failed for router {router.id}: {str(e)}")
#                     health_data.append({
#                         "router": router.name,
#                         "router_ip": router.ip,
#                         "status": "error",
#                         "error": str(e)
#                     })

#             return Response(health_data)

#     def get_router_health(self, router):
#         """Get comprehensive health information for a router."""
#         cache_key = f"router:{router.id}:health_comprehensive"
#         cached_health = cache.get(cache_key)
        
#         if cached_health:
#             return cached_health

#         health_info = self.perform_health_check(router)
#         cache.set(cache_key, health_info, 120)  # Cache for 2 minutes
        
#         return health_info

#     def perform_health_check(self, router):
#         """Perform detailed health check on a router."""
#         start_time = timezone.now()
        
#         try:
#             connector = MikroTikConnector(
#                 router.ip,
#                 router.username,
#                 router.password,
#                 router.port
#             )
            
#             test_results = connector.test_connection()
            
#             if test_results.get('system_access'):
#                 system_info = test_results.get('system_info', {})
#                 health_score = self.calculate_health_score(system_info)
                
#                 system_metrics = {
#                     "cpu_load": float(system_info.get("cpu-load", 0)),
#                     "free_memory": float(system_info.get("free-memory", 0)),
#                     "total_memory": float(system_info.get("total-memory", 0)),
#                     "uptime": system_info.get("uptime", "0"),
#                     "board_name": system_info.get("board-name", "Unknown"),
#                     "version": system_info.get("version", "Unknown")
#                 }

#                 # Save health check result
#                 health_check = RouterHealthCheck.objects.create(
#                     router=router,
#                     is_online=True,
#                     response_time=test_results.get('response_time'),
#                     system_metrics=system_metrics,
#                     health_score=health_score,
#                     performance_metrics=self.get_performance_metrics(system_info)
#                 )

#                 return {
#                     "router": router.name,
#                     "router_ip": router.ip,
#                     "status": "online",
#                     "response_time": test_results.get('response_time'),
#                     "health_score": health_score,
#                     "system_metrics": system_metrics,
#                     "timestamp": start_time.isoformat()
#                 }
#             else:
#                 # Router is offline
#                 RouterHealthCheck.objects.create(
#                     router=router,
#                     is_online=False,
#                     error_message="Connection test failed",
#                     health_score=0
#                 )
                
#                 return {
#                     "router": router.name,
#                     "router_ip": router.ip,
#                     "status": "offline",
#                     "error": "Connection test failed",
#                     "health_score": 0,
#                     "timestamp": start_time.isoformat()
#                 }
            
#         except Exception as e:
#             logger.error(f"Health check failed for router {router.id}: {str(e)}")
#             RouterHealthCheck.objects.create(
#                 router=router,
#                 is_online=False,
#                 error_message=str(e),
#                 health_score=0
#             )
            
#             return {
#                 "router": router.name,
#                 "router_ip": router.ip,
#                 "status": "error",
#                 "error": str(e),
#                 "health_score": 0,
#                 "timestamp": start_time.isoformat()
#             }

#     def calculate_health_score(self, system_metrics):
#         """Calculate comprehensive health score (0-100)."""
#         try:
#             score = 100
            
#             # CPU usage penalty
#             cpu_load = float(system_metrics.get("cpu-load", 0))
#             if cpu_load > 90:
#                 score -= 30
#             elif cpu_load > 70:
#                 score -= 15
#             elif cpu_load > 50:
#                 score -= 5
            
#             # Memory usage penalty
#             free_memory = float(system_metrics.get("free-memory", 0))
#             total_memory = float(system_metrics.get("total-memory", 1))
#             memory_usage = ((total_memory - free_memory) / total_memory) * 100
            
#             if memory_usage > 90:
#                 score -= 20
#             elif memory_usage > 80:
#                 score -= 10
#             elif memory_usage > 70:
#                 score -= 5
            
#             return max(0, min(100, score))
#         except Exception:
#             return 50  # Default score if calculation fails

#     def get_performance_metrics(self, system_metrics):
#         """Extract performance metrics from system data."""
#         return {
#             "cpu_usage": float(system_metrics.get("cpu-load", 0)),
#             "memory_usage": self.calculate_memory_usage(system_metrics),
#             "architecture": system_metrics.get("architecture", "Unknown"),
#             "platform": system_metrics.get("platform", "Unknown")
#         }

#     def calculate_memory_usage(self, system_metrics):
#         """Calculate memory usage percentage."""
#         try:
#             free_memory = float(system_metrics.get("free-memory", 0))
#             total_memory = float(system_metrics.get("total-memory", 1))
#             return ((total_memory - free_memory) / total_memory) * 100
#         except (ValueError, ZeroDivisionError):
#             return 0


# class RestoreSessionsView(APIView):
#     """
#     API View for restoring user sessions on specific routers.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         """Restore sessions for a specific router."""
#         router = get_object_or_404(Router, pk=pk, is_active=True)
        
#         try:
#             from network_management.api.views.router_management.router_session_views import SessionRecoveryView
#             recovery_view = SessionRecoveryView()
            
#             # Get recoverable sessions for this router
#             recoverable_sessions = recovery_view.find_recoverable_sessions(
#                 phone_number="", 
#                 mac_address="", 
#                 username=""
#             ).filter(router=router)
            
#             recovered_count = 0
#             for session in recoverable_sessions:
#                 if recovery_view.recover_session(session, 'auto'):
#                     recovered_count += 1
            
#             # Send WebSocket notification
#             WebSocketManager.send_session_recovery_notification(recovered_count)
            
#             # Create audit log
#             RouterAuditLog.objects.create(
#                 router=router,
#                 action='session_restore',
#                 description=f"Restored {recovered_count} sessions on {router.name}",
#                 user=request.user,
#                 ip_address=self.get_client_ip(request),
#                 user_agent=request.META.get('HTTP_USER_AGENT', '')
#             )
            
#             return Response({
#                 "message": f"Restored {recovered_count} sessions on {router.name}",
#                 "recovered_count": recovered_count,
#                 "router": router.name
#             })
            
#         except Exception as e:
#             logger.error(f"Session restoration failed for router {router.id}: {str(e)}")
#             return Response(
#                 {"error": f"Session restoration failed: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def get_client_ip(self, request):
#         """Get client IP address."""
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         else:
#             return request.META.get('REMOTE_ADDR')


# class UserSessionRecoveryView(APIView):
#     """
#     API View for user session recovery with enhanced error handling.
#     """
    
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         """Recover user sessions based on provided criteria."""
#         from network_management.api.views.router_management.router_session_views import SessionRecoveryView
#         recovery_view = SessionRecoveryView()
        
#         try:
#             return recovery_view.post(request)
#         except Exception as e:
#             logger.error(f"User session recovery failed: {str(e)}")
#             return Response(
#                 {"error": f"Session recovery failed: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )







# network_management/api/views/router_management/router_health_views.py



# network_management/api/views/router_management/router_health_views.py

"""
ENHANCED Router Health and Monitoring Views for Network Management System - PRODUCTION READY
"""

import logging
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.db.models import Q, Count, Avg
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import (
    Router, RouterHealthCheck, RouterAuditLog, RouterStats,
    HotspotUser, PPPoEUser
)
from network_management.utils.mikrotik_connector import MikroTikConnector
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class HealthMonitoringView(APIView):
    """
    ENHANCED API View for comprehensive health monitoring with empty database handling.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get comprehensive health monitoring data for all routers with fallback for empty database.
        """
        try:
            # Check if we have any routers first
            total_routers = Router.objects.filter(is_active=True).count()
            
            if total_routers == 0:
                return Response({
                    'total_routers': 0,
                    'online_routers': 0,
                    'offline_routers': 0,
                    'health_score': 0,
                    'system_health': 'no_data',
                    'recent_alerts': [],
                    'performance_metrics': {
                        'average_response_time': 0,
                        'total_active_users': 0,
                        'system_uptime': '0d 0h 0m'
                    },
                    'routers': [],
                    'message': 'No routers configured. Add routers to start monitoring.',
                    'timestamp': timezone.now().isoformat()
                })

            # Get basic router statistics
            online_routers = Router.objects.filter(
                is_active=True, 
                connection_status='connected'
            ).count()
            
            offline_routers = total_routers - online_routers
            
            # Calculate overall health score
            health_score = self.calculate_overall_health_score()
            
            # Get performance metrics
            performance_metrics = self.get_performance_metrics()
            
            # Get recent health alerts (last 24 hours)
            recent_alerts = self.get_recent_alerts()
            
            # Get detailed router health data
            routers_health = self.get_routers_health_data()
            
            response_data = {
                'total_routers': total_routers,
                'online_routers': online_routers,
                'offline_routers': offline_routers,
                'health_score': health_score,
                'system_health': self.get_system_health_status(health_score),
                'recent_alerts': recent_alerts,
                'performance_metrics': performance_metrics,
                'routers': routers_health,
                'last_updated': timezone.now().isoformat(),
                'timestamp': timezone.now().isoformat()
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Health monitoring error: {str(e)}")
            return Response({
                'error': 'Health monitoring temporarily unavailable',
                'total_routers': 0,
                'online_routers': 0,
                'offline_routers': 0,
                'health_score': 0,
                'system_health': 'error',
                'recent_alerts': [],
                'performance_metrics': {},
                'routers': [],
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def calculate_overall_health_score(self):
        """Calculate overall system health score based on router statuses."""
        try:
            # Get recent health checks (last 1 hour)
            recent_health_checks = RouterHealthCheck.objects.filter(
                timestamp__gte=timezone.now() - timezone.timedelta(hours=1)
            )
            
            if not recent_health_checks.exists():
                return 50  # Default score if no recent data
            
            avg_health_score = recent_health_checks.aggregate(
                avg_score=Avg('health_score')
            )['avg_score'] or 50
            
            # Adjust score based on online/offline ratio
            total_routers = Router.objects.filter(is_active=True).count()
            online_routers = Router.objects.filter(
                is_active=True, 
                connection_status='connected'
            ).count()
            
            online_ratio = online_routers / total_routers if total_routers > 0 else 0
            adjusted_score = avg_health_score * online_ratio
            
            return round(max(0, min(100, adjusted_score)))
            
        except Exception as e:
            logger.error(f"Health score calculation error: {str(e)}")
            return 50

    def get_performance_metrics(self):
        """Get system-wide performance metrics."""
        try:
            # Get active users count
            hotspot_users = HotspotUser.objects.filter(active=True).count()
            pppoe_users = PPPoEUser.objects.filter(active=True).count()
            total_active_users = hotspot_users + pppoe_users
            
            # Get average response time from recent health checks
            recent_checks = RouterHealthCheck.objects.filter(
                timestamp__gte=timezone.now() - timezone.timedelta(hours=1),
                response_time__isnull=False
            )
            avg_response_time = recent_checks.aggregate(
                avg_time=Avg('response_time')
            )['avg_time'] or 0
            
            # Get system uptime (oldest router uptime)
            oldest_router = Router.objects.filter(is_active=True).order_by('created_at').first()
            system_uptime = "0d 0h 0m"
            if oldest_router:
                uptime_delta = timezone.now() - oldest_router.created_at
                days = uptime_delta.days
                hours = uptime_delta.seconds // 3600
                minutes = (uptime_delta.seconds % 3600) // 60
                system_uptime = f"{days}d {hours}h {minutes}m"
            
            return {
                'average_response_time': round(avg_response_time, 3),
                'total_active_users': total_active_users,
                'system_uptime': system_uptime,
                'hotspot_users': hotspot_users,
                'pppoe_users': pppoe_users
            }
            
        except Exception as e:
            logger.error(f"Performance metrics error: {str(e)}")
            return {
                'average_response_time': 0,
                'total_active_users': 0,
                'system_uptime': '0d 0h 0m',
                'hotspot_users': 0,
                'pppoe_users': 0
            }

    def get_recent_alerts(self):
        """Get recent health alerts and issues."""
        try:
            recent_alerts = []
            
            # Check for offline routers
            offline_routers = Router.objects.filter(
                is_active=True,
                connection_status='disconnected'
            )
            
            for router in offline_routers:
                recent_alerts.append({
                    'type': 'offline',
                    'severity': 'high',
                    'message': f'Router {router.name} is offline',
                    'router_id': router.id,
                    'router_name': router.name,
                    'timestamp': timezone.now().isoformat()
                })
            
            # Check for routers with low health scores
            low_health_routers = Router.objects.filter(
                is_active=True,
                connection_status='connected'
            ).annotate(
                recent_health=Avg('health_checks__health_score')
            ).filter(recent_health__lt=50)
            
            for router in low_health_routers:
                recent_alerts.append({
                    'type': 'low_health',
                    'severity': 'medium',
                    'message': f'Router {router.name} has low health score',
                    'router_id': router.id,
                    'router_name': router.name,
                    'timestamp': timezone.now().isoformat()
                })
            
            return recent_alerts[:10]  # Return only last 10 alerts
            
        except Exception as e:
            logger.error(f"Recent alerts error: {str(e)}")
            return []

    def get_routers_health_data(self):
        """Get detailed health data for all routers."""
        try:
            routers = Router.objects.filter(is_active=True)
            routers_health = []
            
            for router in routers:
                # Get latest health check
                latest_health = RouterHealthCheck.objects.filter(
                    router=router
                ).order_by('-timestamp').first()
                
                # Get active users
                active_users = router.get_active_users_count()
                
                # Get connection quality
                connection_quality = router.get_connection_quality()
                
                router_health_data = {
                    'id': router.id,
                    'name': router.name,
                    'ip': router.ip,
                    'type': router.type,
                    'status': router.status,
                    'connection_status': router.connection_status,
                    'configuration_status': router.configuration_status,
                    'active_users': active_users,
                    'connection_quality': connection_quality,
                    'last_seen': router.last_seen.isoformat() if router.last_seen else None,
                    'health_score': latest_health.health_score if latest_health else 0,
                    'is_online': latest_health.is_online if latest_health else False,
                    'response_time': latest_health.response_time if latest_health else None,
                    'firmware_version': router.firmware_version
                }
                
                routers_health.append(router_health_data)
            
            return routers_health
            
        except Exception as e:
            logger.error(f"Routers health data error: {str(e)}")
            return []

    def get_system_health_status(self, health_score):
        """Get system health status based on score."""
        if health_score >= 80:
            return 'healthy'
        elif health_score >= 60:
            return 'degraded'
        elif health_score >= 40:
            return 'unhealthy'
        else:
            return 'critical'


class RouterHealthCheckView(APIView):
    """
    ENHANCED API View for comprehensive router health checks with timeout handling.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        """
        Get comprehensive health check for a specific router or all routers with timeout protection.
        """
        try:
            if pk:
                # Single router health check
                router = get_object_or_404(Router, pk=pk, is_active=True)
                health_info = self.get_router_health(router)
                return Response(health_info)
            else:
                # All routers health check with timeout protection
                routers = Router.objects.filter(is_active=True)
                
                if not routers.exists():
                    return Response({
                        'message': 'No routers found',
                        'routers': [],
                        'total_checked': 0,
                        'online_count': 0,
                        'offline_count': 0,
                        'timestamp': timezone.now().isoformat()
                    })
                
                health_data = []
                online_count = 0
                offline_count = 0

                for router in routers:
                    try:
                        health_info = self.get_router_health(router)
                        health_data.append(health_info)
                        
                        if health_info.get('status') == 'online':
                            online_count += 1
                        else:
                            offline_count += 1
                            
                        # Send WebSocket update
                        WebSocketManager.send_health_update(router.id, health_info)
                        
                    except Exception as e:
                        logger.error(f"Health check failed for router {router.id}: {str(e)}")
                        health_data.append({
                            "router_id": router.id,
                            "router": router.name,
                            "router_ip": router.ip,
                            "status": "error",
                            "error": str(e),
                            "health_score": 0,
                            "timestamp": timezone.now().isoformat()
                        })
                        offline_count += 1

                return Response({
                    'routers': health_data,
                    'total_checked': len(routers),
                    'online_count': online_count,
                    'offline_count': offline_count,
                    'success_rate': round((online_count / len(routers)) * 100, 2),
                    'timestamp': timezone.now().isoformat()
                })
                
        except Exception as e:
            logger.error(f"Health check view error: {str(e)}")
            return Response(
                {"error": f"Health check failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_router_health(self, router):
        """Get comprehensive health information for a router with caching."""
        cache_key = f"router:{router.id}:health_comprehensive"
        cached_health = cache.get(cache_key)
        
        if cached_health:
            return cached_health

        health_info = self.perform_health_check(router)
        cache.set(cache_key, health_info, 120)  # Cache for 2 minutes
        
        return health_info

    def perform_health_check(self, router):
        """Perform detailed health check on a router with timeout handling."""
        start_time = timezone.now()
        
        try:
            # Test connection with timeout protection
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
                    "router_id": router.id,
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "online",
                    "response_time": test_results.get('response_time'),
                    "health_score": health_score,
                    "system_metrics": system_metrics,
                    "performance_metrics": self.get_performance_metrics(system_info),
                    "timestamp": start_time.isoformat(),
                    "connection_quality": router.get_connection_quality()
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
                    "router_id": router.id,
                    "router": router.name,
                    "router_ip": router.ip,
                    "status": "offline",
                    "error": "Connection test failed",
                    "health_score": 0,
                    "timestamp": start_time.isoformat(),
                    "connection_quality": {"quality": "unknown", "success_rate": 0}
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
                "router_id": router.id,
                "router": router.name,
                "router_ip": router.ip,
                "status": "error",
                "error": str(e),
                "health_score": 0,
                "timestamp": start_time.isoformat(),
                "connection_quality": {"quality": "unknown", "success_rate": 0}
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
    ENHANCED API View for restoring user sessions with comprehensive error handling.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Restore sessions for a specific router with fallback handling."""
        try:
            router = get_object_or_404(Router, pk=pk, is_active=True)
            
            # Import here to avoid circular imports
            from network_management.api.views.router_management.router_session_views import SessionRecoveryView
            
            recovery_view = SessionRecoveryView()
            
            # Get recoverable sessions for this router
            recoverable_sessions = recovery_view.find_recoverable_sessions(
                phone_number="", 
                mac_address="", 
                username=""
            ).filter(router=router)
            
            recovered_count = 0
            errors = []
            
            for session in recoverable_sessions:
                try:
                    if recovery_view.recover_session(session, 'auto'):
                        recovered_count += 1
                except Exception as e:
                    errors.append(f"Session {session.id}: {str(e)}")
                    logger.error(f"Session recovery failed for session {session.id}: {str(e)}")
            
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
            
            response_data = {
                "message": f"Restored {recovered_count} sessions on {router.name}",
                "recovered_count": recovered_count,
                "router": router.name,
                "errors": errors if errors else None,
                "timestamp": timezone.now().isoformat()
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Session restoration failed: {str(e)}")
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
    ENHANCED API View for user session recovery with comprehensive error handling.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Recover user sessions based on provided criteria with fallback handling."""
        try:
            from network_management.api.views.router_management.router_session_views import SessionRecoveryView
            recovery_view = SessionRecoveryView()
            
            return recovery_view.post(request)
            
        except Exception as e:
            logger.error(f"User session recovery failed: {str(e)}")
            return Response(
                {
                    "error": f"Session recovery failed: {str(e)}",
                    "recovered_sessions": 0,
                    "timestamp": timezone.now().isoformat()
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class QuickHealthCheckView(APIView):
    """
    Quick health check endpoint for load balancers and monitoring systems.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Quick health check that returns basic system status."""
        try:
            total_routers = Router.objects.filter(is_active=True).count()
            online_routers = Router.objects.filter(
                is_active=True, 
                connection_status='connected'
            ).count()
            
            return Response({
                'status': 'healthy' if online_routers > 0 or total_routers == 0 else 'degraded',
                'total_routers': total_routers,
                'online_routers': online_routers,
                'timestamp': timezone.now().isoformat(),
                'service': 'network_management',
                'version': '2.1.0'
            })
            
        except Exception as e:
            logger.error(f"Quick health check failed: {str(e)}")
            return Response({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)