# network_management/api/views/router_management/router_bulk_operations_views.py
"""
Router Bulk Operations Views for Network Management System

This module provides API views for bulk operations on multiple routers.
"""

import logging
from celery import shared_task
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from network_management.models.router_management_model import (
    Router, BulkOperation, RouterAuditLog
)
from network_management.serializers.router_management_serializer import (
    BulkActionSerializer, BulkOperationSerializer
)
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class BulkOperationsView(APIView):
    """
    ENHANCED API View for performing bulk operations on multiple routers.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Initiate a bulk operation on multiple routers with enhanced progress tracking."""
        serializer = BulkActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        router_ids = data['router_ids']
        action = data['action']
        parameters = data.get('parameters', {})

        routers = Router.objects.filter(
            id__in=router_ids, 
            is_active=True
        )
        
        if not routers.exists():
            return Response(
                {"error": "No valid routers found for bulk operation"},
                status=status.HTTP_400_BAD_REQUEST
            )

        bulk_operation = BulkOperation.objects.create(
            operation_type=action,
            initiated_by=request.user,
            status='running',
            results={
                'total': routers.count(),
                'completed': 0,
                'failed': 0,
                'pending': routers.count(),
                'details': {},
                'start_time': timezone.now().isoformat(),
                'health_metrics': {} if action == 'health_check' else None
            }
        )
        bulk_operation.routers.set(routers)

        RouterAuditLog.objects.create(
            router=None,
            action='bulk_operation',
            description=f"Bulk {action} initiated on {routers.count()} routers",
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes={
                'operation_type': action,
                'router_count': routers.count(),
                'parameters': parameters
            }
        )

        # Enhanced health check with detailed metrics
        if action == 'health_check':
            self.execute_enhanced_health_check.delay(
                str(bulk_operation.operation_id), 
                parameters
            )
        else:
            self.execute_bulk_operation_with_progress.delay(
                str(bulk_operation.operation_id), 
                parameters
            )

        return Response({
            "operation_id": str(bulk_operation.operation_id),
            "message": f"Bulk {action} started on {routers.count()} routers",
            "status": "running",
            "total_routers": routers.count(),
            "estimated_duration": self.estimate_duration(action, routers.count())
        })

    @shared_task(bind=True)
    def execute_enhanced_health_check(self, operation_id, parameters):
        """Execute enhanced health check with comprehensive metrics."""
        try:
            bulk_operation = BulkOperation.objects.get(operation_id=operation_id)
            routers = bulk_operation.routers.all()
            total_routers = routers.count()
            
            results = {
                'total': total_routers,
                'completed': 0,
                'failed': 0,
                'pending': total_routers,
                'details': {},
                'health_metrics': {},
                'start_time': bulk_operation.results.get('start_time'),
                'progress_updates': []
            }

            self.send_bulk_operation_progress(operation_id, results, 'started')

            for index, router in enumerate(routers):
                try:
                    results['pending'] -= 1
                    
                    # Enhanced health check with detailed metrics
                    health_metrics = self.perform_enhanced_health_check(router)
                    
                    if health_metrics['is_online']:
                        results['completed'] += 1
                        results['health_metrics'][router.id] = health_metrics
                        results['details'][router.id] = {
                            'success': True,
                            'timestamp': timezone.now().isoformat(),
                            'message': 'Health check completed successfully',
                            'metrics': health_metrics
                        }
                    else:
                        results['failed'] += 1
                        results['details'][router.id] = {
                            'success': False,
                            'timestamp': timezone.now().isoformat(),
                            'message': health_metrics.get('error', 'Health check failed'),
                            'metrics': health_metrics
                        }

                    # Enhanced progress tracking
                    progress_percentage = (index + 1) / total_routers * 100
                    health_summary = self.calculate_health_summary(results['health_metrics'])
                    
                    results['progress_updates'].append({
                        'timestamp': timezone.now().isoformat(),
                        'progress': progress_percentage,
                        'completed': results['completed'],
                        'failed': results['failed'],
                        'pending': results['pending'],
                        'health_summary': health_summary
                    })
                    
                    # Send progress update every 25% or when complete
                    if (index + 1) % max(1, total_routers // 4) == 0 or (index + 1) == total_routers:
                        self.send_bulk_operation_progress(
                            operation_id, 
                            results, 
                            'in_progress',
                            f"Health check progress: {progress_percentage:.1f}%"
                        )

                except Exception as e:
                    logger.error(f"Enhanced health check failed for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['pending'] -= 1
                    results['details'][router.id] = {
                        'success': False,
                        'error': str(e),
                        'timestamp': timezone.now().isoformat()
                    }

            # Final status determination
            if results['failed'] == 0:
                bulk_operation.status = 'completed'
                final_message = f"Health check completed successfully on {results['completed']} routers"
            elif results['completed'] > 0:
                bulk_operation.status = 'partial'
                final_message = f"Health check partially completed: {results['completed']} success, {results['failed']} failed"
            else:
                bulk_operation.status = 'failed'
                final_message = f"Health check failed on all {results['failed']} routers"

            bulk_operation.results = results
            bulk_operation.completed_at = timezone.now()
            bulk_operation.save()

            self.send_bulk_operation_progress(operation_id, results, 'completed', final_message)

            RouterAuditLog.objects.create(
                router=None,
                action='bulk_operation_complete',
                description=final_message,
                user=bulk_operation.initiated_by,
                changes={
                    'operation_id': operation_id,
                    'results': {
                        'completed': results['completed'],
                        'failed': results['failed'],
                        'total': results['total'],
                        'health_summary': self.calculate_health_summary(results['health_metrics'])
                    }
                }
            )

        except Exception as e:
            logger.error(f"Enhanced health check execution failed: {str(e)}")
            self.send_bulk_operation_progress(
                operation_id, 
                {}, 
                'failed', 
                f"Enhanced health check failed: {str(e)}"
            )

    def perform_enhanced_health_check(self, router):
        """Perform comprehensive health check with detailed metrics."""
        try:
            # Basic connectivity check
            basic_health = self.perform_router_health_check(router)
            
            if not basic_health:
                return {
                    'is_online': False,
                    'error': 'Basic connectivity check failed',
                    'timestamp': timezone.now().isoformat()
                }
            
            # Enhanced metrics collection
            enhanced_metrics = {
                'is_online': True,
                'response_time': self.measure_response_time(router),
                'health_score': self.calculate_health_score(router),
                'system_metrics': self.collect_system_metrics(router),
                'performance_metrics': self.collect_performance_metrics(router),
                'connectivity_status': self.check_connectivity(router),
                'timestamp': timezone.now().isoformat()
            }
            
            return enhanced_metrics
            
        except Exception as e:
            logger.error(f"Enhanced health check failed for router {router.id}: {str(e)}")
            return {
                'is_online': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }

    def collect_performance_metrics(self, router):
        """Collect comprehensive performance metrics."""
        try:
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    timeout=10
                )
                api = api_pool.get_api()
                
                # System resource metrics
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}
                
                # Interface statistics
                interfaces = api.get_resource("/interface").get()
                interface_stats = []
                for interface in interfaces[:5]:  # Limit to first 5 interfaces
                    interface_stats.append({
                        'name': interface.get('name'),
                        'rx_bytes': interface.get('rx-byte', 0),
                        'tx_bytes': interface.get('tx-byte', 0),
                        'status': interface.get('running')
                    })
                
                # Connection counts
                hotspot_active = api.get_resource("/ip/hotspot/active").get() or []
                pppoe_active = api.get_resource("/ppp/active").get() or []
                
                api_pool.disconnect()
                
                return {
                    'cpu_load': float(system.get('cpu-load', 0)),
                    'memory_usage': self.calculate_memory_usage(system),
                    'disk_usage': self.calculate_disk_usage(system),
                    'interface_stats': interface_stats,
                    'active_connections': len(hotspot_active) + len(pppoe_active),
                    'hotspot_users': len(hotspot_active),
                    'pppoe_users': len(pppoe_active),
                    'uptime': system.get('uptime', '0')
                }
                
            return {}
            
        except Exception as e:
            logger.error(f"Performance metrics collection failed for router {router.id}: {str(e)}")
            return {}

    def calculate_memory_usage(self, system_data):
        """Calculate memory usage percentage."""
        try:
            total_memory = int(system_data.get('total-memory', 0))
            free_memory = int(system_data.get('free-memory', 0))
            if total_memory > 0:
                return round(((total_memory - free_memory) / total_memory) * 100, 2)
            return 0
        except (ValueError, TypeError):
            return 0

    def calculate_disk_usage(self, system_data):
        """Calculate disk usage percentage."""
        try:
            total_disk = int(system_data.get('total-hdd-space', 0))
            free_disk = int(system_data.get('free-hdd-space', 0))
            if total_disk > 0:
                return round(((total_disk - free_disk) / total_disk) * 100, 2)
            return 0
        except (ValueError, TypeError):
            return 0

    def measure_response_time(self, router):
        """Measure router response time in seconds."""
        import time
        try:
            start_time = time.time()
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    timeout=5
                )
                api = api_pool.get_api()
                api.get_resource("/system/resource").get()
                api_pool.disconnect()
            elif router.type == "ubiquiti":
                import requests
                requests.get(
                    f"https://{router.ip}:{router.port}/api/self",
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=5
                )
            return round(time.time() - start_time, 3)
        except Exception:
            return None

    def calculate_health_score(self, router):
        """Calculate comprehensive health score (0-100)."""
        try:
            score = 100
            
            # Deduct points based on various factors
            metrics = self.collect_performance_metrics(router)
            
            # CPU usage penalty
            cpu_load = metrics.get('cpu_load', 0)
            if cpu_load > 90:
                score -= 30
            elif cpu_load > 70:
                score -= 15
            elif cpu_load > 50:
                score -= 5
            
            # Memory usage penalty
            memory_usage = metrics.get('memory_usage', 0)
            if memory_usage > 90:
                score -= 25
            elif memory_usage > 70:
                score -= 10
            
            # Disk usage penalty
            disk_usage = metrics.get('disk_usage', 0)
            if disk_usage > 90:
                score -= 20
            elif disk_usage > 80:
                score -= 10
            
            # Response time penalty
            response_time = self.measure_response_time(router)
            if response_time and response_time > 5:
                score -= 20
            elif response_time and response_time > 2:
                score -= 10
            
            return max(0, min(100, score))
            
        except Exception:
            return 50  # Default score if calculation fails

    def collect_system_metrics(self, router):
        """Collect basic system metrics."""
        try:
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    timeout=5
                )
                api = api_pool.get_api()
                system_list = api.get_resource("/system/resource").get()
                system = system_list[0] if system_list else {}
                api_pool.disconnect()
                
                return {
                    'cpu_load': system.get('cpu-load', '0'),
                    'uptime': system.get('uptime', '0'),
                    'version': system.get('version', 'Unknown'),
                    'board_name': system.get('board-name', 'Unknown')
                }
            return {}
        except Exception:
            return {}

    def check_connectivity(self, router):
        """Check various connectivity aspects."""
        try:
            # Basic ping test
            import subprocess
            result = subprocess.run(
                ['ping', '-c', '3', '-W', '2', router.ip],
                capture_output=True,
                text=True
            )
            ping_success = result.returncode == 0
            
            # Port connectivity
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            port_result = sock.connect_ex((router.ip, router.port))
            port_open = port_result == 0
            sock.close()
            
            return {
                'ping_success': ping_success,
                'port_open': port_open,
                'service_accessible': ping_success and port_open
            }
        except Exception:
            return {
                'ping_success': False,
                'port_open': False,
                'service_accessible': False
            }

    def calculate_health_summary(self, health_metrics):
        """Calculate summary statistics from health metrics."""
        online_count = sum(1 for metrics in health_metrics.values() if metrics.get('is_online'))
        total_count = len(health_metrics)
        
        if total_count == 0:
            return {}
            
        avg_health_score = sum(metrics.get('health_score', 0) for metrics in health_metrics.values()) / total_count
        response_times = [metrics.get('response_time', 0) for metrics in health_metrics.values() if metrics.get('response_time')]
        avg_response_time = sum(response_times) / max(1, len(response_times)) if response_times else 0
        
        return {
            'online_routers': online_count,
            'offline_routers': total_count - online_count,
            'average_health_score': round(avg_health_score, 1),
            'average_response_time': round(avg_response_time, 3),
            'online_percentage': round((online_count / total_count) * 100, 1)
        }

    def estimate_duration(self, action, router_count):
        """Estimate operation duration based on action type and router count."""
        base_times = {
            'health_check': 10,  # seconds per router
            'restart': 30,       # seconds per router  
            'update_firmware': 300,  # seconds per router
            'backup': 15,        # seconds per router
            'update_status': 5   # seconds per router
        }
        
        base_time = base_times.get(action, 10)
        estimated_seconds = base_time * router_count
        
        if estimated_seconds < 60:
            return f"{estimated_seconds} seconds"
        elif estimated_seconds < 3600:
            return f"{estimated_seconds // 60} minutes"
        else:
            return f"{estimated_seconds // 3600} hours {(estimated_seconds % 3600) // 60} minutes"

    @shared_task(bind=True)
    def execute_bulk_operation_with_progress(self, operation_id, parameters):
        """Execute bulk operation with real-time progress tracking."""
        try:
            bulk_operation = BulkOperation.objects.get(operation_id=operation_id)
            routers = bulk_operation.routers.all()
            total_routers = routers.count()
            
            results = {
                'total': total_routers,
                'completed': 0,
                'failed': 0,
                'pending': total_routers,
                'details': {},
                'start_time': bulk_operation.results.get('start_time'),
                'progress_updates': []
            }

            self.send_bulk_operation_progress(operation_id, results, 'started')

            for index, router in enumerate(routers):
                try:
                    results['pending'] -= 1
                    
                    operation_success = self.execute_single_operation(
                        router, 
                        bulk_operation.operation_type, 
                        parameters
                    )
                    
                    if operation_success:
                        results['completed'] += 1
                        results['details'][router.id] = {
                            'success': True,
                            'timestamp': timezone.now().isoformat(),
                            'message': f"{bulk_operation.operation_type} completed successfully"
                        }
                    else:
                        results['failed'] += 1
                        results['details'][router.id] = {
                            'success': False,
                            'timestamp': timezone.now().isoformat(),
                            'message': f"{bulk_operation.operation_type} failed"
                        }

                    progress_percentage = (index + 1) / total_routers * 100
                    if (index + 1) % max(1, total_routers // 10) == 0 or (index + 1) == total_routers:
                        results['progress_updates'].append({
                            'timestamp': timezone.now().isoformat(),
                            'progress': progress_percentage,
                            'completed': results['completed'],
                            'failed': results['failed'],
                            'pending': results['pending']
                        })
                        self.send_bulk_operation_progress(operation_id, results, 'in_progress')

                except Exception as e:
                    logger.error(f"Bulk operation failed for router {router.id}: {str(e)}")
                    results['failed'] += 1
                    results['pending'] -= 1
                    results['details'][router.id] = {
                        'success': False,
                        'error': str(e),
                        'timestamp': timezone.now().isoformat()
                    }

            if results['failed'] == 0:
                bulk_operation.status = 'completed'
                final_message = f"Bulk operation completed successfully on {results['completed']} routers"
            elif results['completed'] > 0:
                bulk_operation.status = 'partial'
                final_message = f"Bulk operation partially completed: {results['completed']} success, {results['failed']} failed"
            else:
                bulk_operation.status = 'failed'
                final_message = f"Bulk operation failed on all {results['failed']} routers"

            bulk_operation.results = results
            bulk_operation.completed_at = timezone.now()
            bulk_operation.save()

            self.send_bulk_operation_progress(operation_id, results, 'completed', final_message)

            RouterAuditLog.objects.create(
                router=None,
                action='bulk_operation_complete',
                description=final_message,
                user=bulk_operation.initiated_by,
                changes={
                    'operation_id': operation_id,
                    'results': {
                        'completed': results['completed'],
                        'failed': results['failed'],
                        'total': results['total']
                    }
                }
            )

        except Exception as e:
            logger.error(f"Bulk operation execution failed: {str(e)}")
            self.send_bulk_operation_progress(
                operation_id, 
                {}, 
                'failed', 
                f"Bulk operation failed: {str(e)}"
            )

    def execute_single_operation(self, router, operation_type, parameters):
        """Execute a single operation on a router with comprehensive error handling."""
        try:
            if operation_type == 'health_check':
                return self.perform_router_health_check(router)
            elif operation_type == 'restart':
                return self.restart_router_safe(router)
            elif operation_type == 'update_status':
                return self.update_router_status(router, parameters.get('status', 'connected'))
            elif operation_type == 'backup':
                return self.backup_router_config(router)
            elif operation_type == 'update_firmware':
                return self.update_router_firmware(router, parameters)
            else:
                logger.error(f"Unknown operation type: {operation_type}")
                return False
                
        except Exception as e:
            logger.error(f"Operation {operation_type} failed for router {router.id}: {str(e)}")
            return False

    def perform_router_health_check(self, router):
        """Enhanced health check with timeout."""
        try:
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    plaintext_login=True,
                    timeout=10
                )
                api = api_pool.get_api()
                system_list = api.get_resource("/system/resource").get()
                api_pool.disconnect()
                return bool(system_list)
            elif router.type == "ubiquiti":
                import requests
                response = requests.get(
                    f"https://{router.ip}:{router.port}/api/self",
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=10
                )
                return response.status_code == 200
            return False
        except Exception as e:
            logger.error(f"Health check failed for router {router.id}: {str(e)}")
            return False

    def restart_router_safe(self, router):
        """Safe router restart with pre-check."""
        try:
            if not self.perform_router_health_check(router):
                logger.warning(f"Router {router.id} is not online, skipping restart")
                return False

            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port,
                    timeout=15
                )
                api = api_pool.get_api()
                api.get_resource("/system").call("reboot")
                api_pool.disconnect()
                
                router.status = "updating"
                router.save()
                return True
                
            elif router.type == "ubiquiti":
                import requests
                controller_url = f"https://{router.ip}:{router.port}/api/s/default/cmd/devmgr"
                data = {"cmd": "restart", "mac": "all"}
                response = requests.post(
                    controller_url,
                    json=data,
                    auth=(router.username, router.password),
                    verify=False,
                    timeout=10
                )
                
                if response.status_code == 200:
                    router.status = "updating"
                    router.save()
                    return True
                    
            return False
        except Exception as e:
            logger.error(f"Router restart failed for {router.id}: {str(e)}")
            return False

    def backup_router_config(self, router):
        """Backup router configuration."""
        try:
            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                
                export_result = api.get_resource("/system").call("backup", {
                    "name": f"backup_{router.name}_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
                })
                
                api_pool.disconnect()
                return True
                
            return False
        except Exception as e:
            logger.error(f"Router backup failed for {router.id}: {str(e)}")
            return False

    def update_router_firmware(self, router, parameters):
        """Update router firmware with version checking."""
        try:
            target_version = parameters.get('target_version')
            if not target_version:
                logger.error("No target version specified for firmware update")
                return False

            if router.type == "mikrotik":
                from routeros_api import RouterOsApiPool
                api_pool = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                )
                api = api_pool.get_api()
                
                system_resource = api.get_resource("/system/resource").get()
                if system_resource:
                    current_version = system_resource[0].get('version', '')
                    if current_version == target_version:
                        logger.info(f"Router {router.id} already on version {target_version}")
                        return True
                
                api.get_resource("/system").call("upgrade", {
                    "channel": parameters.get('channel', 'stable')
                })
                
                api_pool.disconnect()
                return True
                
            return False
        except Exception as e:
            logger.error(f"Firmware update failed for router {router.id}: {str(e)}")
            return False

    def update_router_status(self, router, status):
        """Update router status."""
        try:
            router.status = status
            router.save()
            return True
        except Exception as e:
            logger.error(f"Status update failed for router {router.id}: {str(e)}")
            return False

    def send_bulk_operation_progress(self, operation_id, results, status, message=None):
        """Send real-time progress updates via WebSocket."""
        try:
            WebSocketManager.send_bulk_operation_update(
                operation_id,
                status,
                progress={
                    'completed': results.get('completed', 0),
                    'failed': results.get('failed', 0),
                    'pending': results.get('pending', 0),
                    'total': results.get('total', 0),
                    'percentage': (results.get('completed', 0) / results.get('total', 1)) * 100
                },
                message=message
            )
        except Exception as e:
            logger.error(f"WebSocket progress update failed: {str(e)}")


class BulkOperationStatusView(APIView):
    """
    API View for checking bulk operation status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, operation_id):
        """Get current status of a bulk operation."""
        try:
            bulk_operation = BulkOperation.objects.get(
                operation_id=operation_id,
                initiated_by=request.user
            )
            serializer = BulkOperationSerializer(bulk_operation)
            return Response(serializer.data)
        except BulkOperation.DoesNotExist:
            return Response(
                {"error": "Bulk operation not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BulkOperationListView(APIView):
    """
    API View for listing user's bulk operations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List bulk operations for the current user."""
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        operations = BulkOperation.objects.filter(
            initiated_by=request.user,
            started_at__gte=start_date
        ).order_by('-started_at')
        
        page = self.paginate_queryset(operations, request)
        if page is not None:
            serializer = BulkOperationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BulkOperationSerializer(operations, many=True)
        return Response(serializer.data)

    def paginate_queryset(self, queryset, request):
        """Simple pagination implementation."""
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        if start >= len(queryset):
            return None
            
        return list(queryset[start:end])

    def get_paginated_response(self, data):
        """Create paginated response format."""
        return Response({
            'count': len(data),
            'results': data,
            'page_size': len(data)
        })