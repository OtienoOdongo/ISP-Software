
# network_management/api/views/router_management/technician_view.py
"""
ENHANCED Technician Workflow API Views for Network Management System - PRODUCTION READY

This module provides COMPLETE API views for technician deployment workflows
with comprehensive error handling and production-ready reliability.
"""

import logging
import json
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from network_management.models.router_management_model import Router, RouterAuditLog
from network_management.serializers.router_management_serializer import (
    TechnicianWorkflowSerializer,
    DeploymentRequestSerializer
)
from network_management.scripts.technician_workflow import TechnicianWorkflowManager
from network_management.utils.websocket_utils import WebSocketManager

logger = logging.getLogger(__name__)


class TechnicianBaseView(APIView):
    """
    Enhanced base view class for technician operations with common functionality.
    """
    permission_classes = [IsAuthenticated]
    
    def get_router(self, pk):
        """Retrieve router instance with common checks."""
        return get_object_or_404(Router, pk=pk, is_active=True)
    
    def create_technician_audit_log(self, router, action, description, request, changes=None):
        """Create standardized technician audit log entry."""
        return RouterAuditLog.objects.create(
            router=router,
            action=action,
            description=description,
            user=request.user,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            changes=changes or {}
        )
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        else:
            return request.META.get('REMOTE_ADDR')


class TechnicianWorkflowView(TechnicianBaseView):
    """
    COMPREHENSIVE API View for managing technician deployment workflows.
    """
    
    def post(self, request, pk=None):
        """
        Start a technician workflow for router deployment.
        
        Request Body:
            - workflow_type: "new_router_deployment", "vpn_enablement", or "troubleshooting"
            - deployment_site: Deployment site name
            - router_config: Router configuration parameters (if no router_id)
        """
        serializer = TechnicianWorkflowSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        workflow_type = data.get('workflow_type', 'new_router_deployment')
        deployment_site = data.get('deployment_site', 'Unknown Site')
        
        # If router ID is provided, use existing router
        if pk:
            router = self.get_router(pk)
            router_config = {
                'host': router.ip,
                'username': router.username,
                'password': router.password,
                'port': router.port,
                'name': router.name,
                'vpn_type': data.get('vpn_type', 'openvpn'),
                'setup_type': data.get('setup_type', 'hotspot')
            }
        else:
            # Use provided router configuration
            router_config = data.get('router_config', {})
            if not router_config.get('host'):
                return Response(
                    {"error": "Router configuration with host is required when no router ID provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            workflow_manager = TechnicianWorkflowManager(request.user, deployment_site)
            success, message, workflow_details = workflow_manager.start_workflow(workflow_type, router_config)
            
            # Create audit log if router exists
            if pk:
                router = self.get_router(pk)
                self.create_technician_audit_log(
                    router=router,
                    action='technician_workflow',
                    description=f"Technician workflow {workflow_type} {'completed' if success else 'failed'}",
                    request=request,
                    changes={
                        'workflow_type': workflow_type,
                        'technician': request.user.username,
                        'deployment_site': deployment_site,
                        'success': success,
                        'message': message,
                        'workflow_details': workflow_details
                    }
                )
            
            # Send WebSocket update if router exists
            if pk:
                WebSocketManager.send_router_update(
                    pk,
                    'technician_workflow_completed',
                    {
                        'workflow_type': workflow_type,
                        'technician': request.user.username,
                        'success': success,
                        'message': message
                    }
                )
            
            response_data = {
                'success': success,
                'message': message,
                'workflow_type': workflow_type,
                'technician': request.user.username,
                'deployment_site': deployment_site,
                'workflow_details': workflow_details
            }
            
            if success:
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Technician workflow failed: {str(e)}")
            return Response(
                {"error": f"Technician workflow failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """
        Get available workflow templates and technician information.
        
        Returns:
            Response: Workflow templates and technician data
        """
        from network_management.scripts.technician_workflow import TechnicianWorkflowManager
        
        # Create a temporary workflow manager for template viewing
        workflow_manager = TechnicianWorkflowManager(request.user, "template_site")
        
        available_templates = []
        for template_id, template in workflow_manager.workflow_templates.items():
            available_templates.append({
                'id': template_id,
                'name': template['name'],
                'description': template['description'],
                'steps': template['steps'],
                'estimated_duration': self.get_estimated_duration(template_id)
            })
        
        return Response({
            'workflow_templates': available_templates,
            'total_templates': len(available_templates),
            'technician_capabilities': self.get_technician_capabilities(),
            'current_user': {
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff
            }
        })
    
    def get_estimated_duration(self, workflow_type):
        """Get estimated duration for workflow type."""
        durations = {
            'new_router_deployment': '20-30 minutes',
            'vpn_enablement': '10-15 minutes',
            'troubleshooting': '15-45 minutes'
        }
        return durations.get(workflow_type, 'Variable')
    
    def get_technician_capabilities(self):
        """Get technician capabilities information."""
        return {
            'supported_router_types': ['MikroTik', 'Ubiquiti', 'Cisco'],
            'supported_services': ['Hotspot', 'PPPoE', 'VPN', 'QoS'],
            'supported_vpn_types': ['OpenVPN', 'WireGuard', 'SSTP'],
            'automation_level': 'Full automation with manual override'
        }


class TechnicianDeploymentView(TechnicianBaseView):
    """
    API View for managing technician deployments and deployment history.
    """
    
    def post(self, request):
        """
        Start a new technician deployment.
        
        Request Body:
            - site: Deployment site name
            - workflow_type: Type of workflow to execute
            - router_config: Router configuration
        """
        serializer = DeploymentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        site = data.get('site')
        workflow_type = data.get('workflow_type')
        router_config = data.get('router_config', {})
        
        try:
            workflow_manager = TechnicianWorkflowManager(request.user, site)
            success, message, workflow_details = workflow_manager.start_workflow(workflow_type, router_config)
            
            response_data = {
                'success': success,
                'message': message,
                'deployment_id': f"deploy_{request.user.id}_{int(timezone.now().timestamp())}",
                'technician': request.user.username,
                'site': site,
                'workflow_type': workflow_type,
                'workflow_details': workflow_details
            }
            
            if success:
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Deployment start failed: {str(e)}")
            return Response(
                {"error": f"Deployment start failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """
        Get deployment history for the current user.
        
        Query Parameters:
            - days: Number of days to look back (default: 30)
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timezone.timedelta(days=days)
        
        # Get audit logs for technician workflows by this user
        technician_logs = RouterAuditLog.objects.filter(
            user=request.user,
            action='technician_workflow',
            timestamp__gte=start_date
        ).order_by('-timestamp')
        
        deployments = []
        for log in technician_logs:
            deployments.append({
                'deployment_id': f"deploy_{log.id}",
                'router_id': log.router.id if log.router else None,
                'router_name': log.router.name if log.router else 'External Router',
                'router_ip': log.router.ip if log.router else log.changes.get('router_config', {}).get('host', 'Unknown'),
                'workflow_type': log.changes.get('workflow_type', 'unknown'),
                'site': log.changes.get('deployment_site', 'Unknown'),
                'timestamp': log.timestamp.isoformat(),
                'success': log.changes.get('success', False),
                'message': log.changes.get('message', '')
            })
        
        # Calculate statistics
        total_deployments = len(deployments)
        successful_deployments = len([d for d in deployments if d['success']])
        success_rate = (successful_deployments / total_deployments * 100) if total_deployments > 0 else 0
        
        return Response({
            'total_deployments': total_deployments,
            'successful_deployments': successful_deployments,
            'success_rate': round(success_rate, 2),
            'time_period_days': days,
            'deployments': deployments,
            'user_statistics': {
                'username': request.user.username,
                'total_workflows': total_deployments,
                'success_rate': round(success_rate, 2),
                'recent_activity_days': days
            }
        })


class BulkTechnicianWorkflowView(TechnicianBaseView):
    """
    API View for bulk technician workflow operations.
    """
    
    def post(self, request):
        """
        Execute workflows on multiple routers.
        
        Request Body:
            - router_ids: List of router IDs
            - workflow_type: Workflow type to execute
            - deployment_site: Deployment site name
        """
        router_ids = request.data.get('router_ids', [])
        workflow_type = request.data.get('workflow_type', 'new_router_deployment')
        deployment_site = request.data.get('deployment_site', 'Bulk Deployment')
        
        if not router_ids:
            return Response(
                {"error": "router_ids array is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        routers = Router.objects.filter(id__in=router_ids, is_active=True)
        results = {
            'total_routers': len(routers),
            'successful_workflows': 0,
            'failed_workflows': 0,
            'details': {}
        }
        
        for router in routers:
            try:
                router_config = {
                    'host': router.ip,
                    'username': router.username,
                    'password': router.password,
                    'port': router.port,
                    'name': router.name,
                    'vpn_type': 'openvpn',
                    'setup_type': 'hotspot'
                }
                
                workflow_manager = TechnicianWorkflowManager(request.user, deployment_site)
                success, message, workflow_details = workflow_manager.start_workflow(workflow_type, router_config)
                
                if success:
                    results['successful_workflows'] += 1
                    results['details'][router.id] = {
                        'status': 'success',
                        'message': message,
                        'workflow_type': workflow_type
                    }
                else:
                    results['failed_workflows'] += 1
                    results['details'][router.id] = {
                        'status': 'failed',
                        'message': message
                    }
                
                # Create audit log for each router
                self.create_technician_audit_log(
                    router=router,
                    action='bulk_technician_workflow',
                    description=f"Bulk technician workflow {workflow_type} {'completed' if success else 'failed'}",
                    request=request,
                    changes={
                        'workflow_type': workflow_type,
                        'technician': request.user.username,
                        'deployment_site': deployment_site,
                        'success': success,
                        'message': message
                    }
                )
                
            except Exception as e:
                logger.error(f"Bulk technician workflow failed for router {router.id}: {str(e)}")
                results['failed_workflows'] += 1
                results['details'][router.id] = {
                    'status': 'failed',
                    'message': f'Workflow failed: {str(e)}'
                }
        
        return Response(results)


class TechnicianDashboardView(TechnicianBaseView):
    """
    API View for technician dashboard and real-time monitoring.
    """
    
    def get(self, request):
        """
        Get technician dashboard data.
        
        Returns:
            Response: Dashboard data for technician operations
        """
        # Get recent technician activity
        recent_workflows = RouterAuditLog.objects.filter(
            user=request.user,
            action__in=['technician_workflow', 'bulk_technician_workflow']
        ).order_by('-timestamp')[:10]
        
        recent_activities = []
        for log in recent_workflows:
            recent_activities.append({
                'action': log.action,
                'description': log.description,
                'router_name': log.router.name if log.router else 'External',
                'timestamp': log.timestamp.isoformat(),
                'success': log.changes.get('success', False)
            })
        
        # Get statistics for the last 30 days
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        
        total_workflows = RouterAuditLog.objects.filter(
            user=request.user,
            action__in=['technician_workflow', 'bulk_technician_workflow'],
            timestamp__gte=thirty_days_ago
        ).count()
        
        successful_workflows = RouterAuditLog.objects.filter(
            user=request.user,
            action__in=['technician_workflow', 'bulk_technician_workflow'],
            timestamp__gte=thirty_days_ago,
            changes__success=True
        ).count()
        
        success_rate = (successful_workflows / total_workflows * 100) if total_workflows > 0 else 0
        
        # Get router statistics
        total_routers = Router.objects.filter(is_active=True).count()
        connected_routers = Router.objects.filter(
            is_active=True, 
            connection_status='connected'
        ).count()
        
        return Response({
            'user_info': {
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'date_joined': request.user.date_joined.isoformat()
            },
            'workflow_statistics': {
                'total_workflows_30_days': total_workflows,
                'successful_workflows': successful_workflows,
                'success_rate': round(success_rate, 2),
                'recent_activities': recent_activities
            },
            'system_overview': {
                'total_routers': total_routers,
                'connected_routers': connected_routers,
                'connection_rate': round((connected_routers / total_routers * 100), 2) if total_routers > 0 else 0
            },
            'quick_actions': [
                {
                    'name': 'New Router Deployment',
                    'type': 'new_router_deployment',
                    'description': 'Deploy and configure a new router',
                    'icon': 'router'
                },
                {
                    'name': 'VPN Configuration',
                    'type': 'vpn_enablement', 
                    'description': 'Configure VPN on existing router',
                    'icon': 'vpn'
                },
                {
                    'name': 'Bulk Operations',
                    'type': 'bulk_operations',
                    'description': 'Perform operations on multiple routers',
                    'icon': 'settings'
                }
            ]
        })