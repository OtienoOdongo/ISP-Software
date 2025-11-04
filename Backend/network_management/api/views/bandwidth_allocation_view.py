


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from network_management.models.bandwidth_allocation_model import BandwidthAllocation, QoSProfile
# from network_management.serializers.bandwidth_allocation_serializer import (
#     BandwidthAllocationSerializer,
#     BandwidthAllocationCreateSerializer,
#     QoSProfileSerializer
# )
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from routeros_api import RouterOsApiPool
# from django.utils import timezone


# class BandwidthAllocationListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Retrieve a list of bandwidth allocations with optional filtering and search.
#         Query params:
#             - status: Filter by status (active, inactive, suspended)
#             - search: Search by client name, IP, MAC, or ID
#         """
#         allocations = BandwidthAllocation.objects.all()

#         # Apply filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             allocations = allocations.filter(status=status_filter)

#         search_term = request.query_params.get('search')
#         if search_term:
#             allocations = allocations.filter(
#                 Q(client__full_name__icontains=search_term) |
#                 Q(ip_address__icontains=search_term) |
#                 Q(mac_address__icontains=search_term) |
#                 Q(id__icontains=search_term)
#             )

#         serializer = BandwidthAllocationSerializer(allocations, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         """
#         Create a new bandwidth allocation and configure QoS on the router.
#         """
#         serializer = BandwidthAllocationCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 allocation = serializer.save()

#                 # Configure QoS on router
#                 router = allocation.client.router
#                 if router:
#                     api = RouterOsApiPool(
#                         router.ip,
#                         username=router.username,
#                         password=router.password,
#                         port=router.port
#                     ).get_api()
#                     qos_resource = api.get_resource('/queue/simple')
#                     qos_params = {
#                         'name': f"Client-{allocation.client.id}",
#                         'target': allocation.ip_address,
#                         'max_limit': allocation.allocated_bandwidth.replace('GB', 'M'),  # Convert GB to Mbps for router
#                         'priority': {'high': '1', 'medium': '4', 'low': '8'}.get(allocation.priority, '4')
#                     }
#                     if allocation.qos_profile:
#                         qos_params.update({
#                             'burst_limit': allocation.qos_profile.burst_limit,
#                             'min_limit': allocation.qos_profile.min_bandwidth
#                         })
#                     qos_resource.add(**qos_params)
#                     api.close()

#                 response_serializer = BandwidthAllocationSerializer(allocation)
#                 return Response(response_serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({"error": f"Failed to configure QoS: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class BandwidthAllocationDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(BandwidthAllocation, pk=pk)

#     def get(self, request, pk):
#         """
#         Retrieve a single bandwidth allocation by ID.
#         """
#         allocation = self.get_object(pk)
#         serializer = BandwidthAllocationSerializer(allocation)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         """
#         Update an existing bandwidth allocation and reconfigure QoS on the router.
#         """
#         allocation = self.get_object(pk)
#         serializer = BandwidthAllocationCreateSerializer(allocation, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_allocation = serializer.save()

#                 # Update QoS on router
#                 router = updated_allocation.client.router
#                 if router:
#                     api = RouterOsApiPool(
#                         router.ip,
#                         username=router.username,
#                         password=router.password,
#                         port=router.port
#                     ).get_api()
#                     qos_resource = api.get_resource('/queue/simple')
#                     qos_entries = qos_resource.get(name=f"Client-{updated_allocation.client.id}")
#                     if qos_entries:
#                         qos_params = {
#                             'id': qos_entries[0]['id'],
#                             'max_limit': updated_allocation.allocated_bandwidth.replace('GB', 'M'),
#                             'priority': {'high': '1', 'medium': '4', 'low': '8'}.get(updated_allocation.priority, '4')
#                         }
#                         if updated_allocation.qos_profile:
#                             qos_params.update({
#                                 'burst_limit': updated_allocation.qos_profile.burst_limit,
#                                 'min_limit': updated_allocation.qos_profile.min_bandwidth
#                             })
#                         qos_resource.set(**qos_params)
#                     api.close()

#                 response_serializer = BandwidthAllocationSerializer(updated_allocation)
#                 return Response(response_serializer.data)
#             except Exception as e:
#                 return Response({"error": f"Failed to update QoS: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         """
#         Delete a bandwidth allocation and remove QoS settings from the router.
#         """
#         allocation = self.get_object(pk)
#         try:
#             router = allocation.client.router
#             if router:
#                 api = RouterOsApiPool(
#                     router.ip,
#                     username=router.username,
#                     password=router.password,
#                     port=router.port
#                 ).get_api()
#                 qos_resource = api.get_resource('/queue/simple')
#                 qos_entries = qos_resource.get(name=f"Client-{allocation.client.id}")
#                 if qos_entries:
#                     qos_resource.remove(id=qos_entries[0]['id'])
#                 api.close()
#         except Exception as e:
#             return Response({"error": f"Failed to remove QoS: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#         allocation.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class QoSProfileListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Retrieve a list of QoS profiles.
#         """
#         profiles = QoSProfile.objects.all()
#         serializer = QoSProfileSerializer(profiles, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         """
#         Create a new QoS profile.
#         """
#         serializer = QoSProfileSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class BandwidthUsageStatsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         """
#         Retrieve bandwidth usage statistics, including top users and aggregates.
#         """
#         top_users = BandwidthAllocation.objects.order_by('-used_bandwidth')[:10]
#         serializer = BandwidthAllocationSerializer(top_users, many=True)

#         allocations = BandwidthAllocation.objects.exclude(allocated_bandwidth='Unlimited')
#         total_used = sum(alloc.used_bandwidth for alloc in BandwidthAllocation.objects.all())
#         total_allocated = sum(
#             float(alloc.allocated_bandwidth.replace('GB', '').strip()) for alloc in allocations
#         )

#         return Response({
#             'top_users': serializer.data,
#             'stats': {
#                 'total_used': total_used,
#                 'total_allocated': total_allocated,
#                 'utilization_percentage': (total_used / total_allocated * 100) if total_allocated > 0 else 0
#             }
#         })








from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Avg
from django.utils import timezone
from datetime import timedelta

from network_management.models.bandwidth_allocation_model import (
    BandwidthAllocation, QoSProfile, BandwidthUsageHistory
)
from network_management.serializers.bandwidth_allocation_serializer import (
    BandwidthAllocationSerializer,
    BandwidthAllocationCreateSerializer,
    BandwidthAllocationUpdateSerializer,
    QoSProfileSerializer
)
from routeros_api import RouterOsApiPool

class BandwidthAllocationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve a list of bandwidth allocations with optional filtering and search.
        Query params:
            - status: Filter by status (active, inactive, suspended)
            - search: Search by client name, IP, MAC, or ID
            - plan_category: Filter by plan category
            - over_quota: Filter by over-quota status
        """
        allocations = BandwidthAllocation.objects.select_related(
            'client', 'plan', 'qos_profile'
        ).prefetch_related('usage_history').all()

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            allocations = allocations.filter(status=status_filter)

        plan_category = request.query_params.get('plan_category')
        if plan_category:
            allocations = allocations.filter(plan__category=plan_category)

        over_quota = request.query_params.get('over_quota')
        if over_quota and over_quota.lower() == 'true':
            # Filter allocations that are over quota
            over_quota_allocations = []
            for allocation in allocations:
                if allocation.is_over_quota():
                    over_quota_allocations.append(allocation.id)
            allocations = allocations.filter(id__in=over_quota_allocations)

        search_term = request.query_params.get('search')
        if search_term:
            allocations = allocations.filter(
                Q(client__full_name__icontains=search_term) |
                Q(ip_address__icontains=search_term) |
                Q(mac_address__icontains=search_term) |
                Q(id__icontains=search_term) |
                Q(plan__name__icontains=search_term)
            )

        serializer = BandwidthAllocationSerializer(allocations, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new bandwidth allocation and configure QoS on the router.
        """
        serializer = BandwidthAllocationCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                allocation = serializer.save()

                # Configure QoS on router if client has a router
                if hasattr(allocation.client, 'router') and allocation.client.router:
                    self._configure_router_qos(allocation)

                response_serializer = BandwidthAllocationSerializer(allocation)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {"error": f"Failed to create allocation: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _configure_router_qos(self, allocation):
        """Configure QoS settings on the router"""
        try:
            router = allocation.client.router
            api = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            ).get_api()
            
            qos_resource = api.get_resource('/queue/simple')
            
            # Prepare QoS parameters
            qos_params = {
                'name': f"Client-{allocation.client.id}-{allocation.id}",
                'target': allocation.ip_address,
                'max_limit': self._convert_to_mikrotik_format(allocation.allocated_bandwidth),
                'priority': {'high': '1', 'medium': '4', 'low': '8'}.get(allocation.priority, '4')
            }
            
            # Add QoS profile settings if available
            if allocation.qos_profile:
                qos_params.update({
                    'burst_limit': allocation.qos_profile.burst_limit,
                    'burst_threshold': allocation.qos_profile.min_bandwidth,
                    'min_limit': allocation.qos_profile.min_bandwidth
                })
            
            qos_resource.add(**qos_params)
            api.close()
            
        except Exception as e:
            raise Exception(f"Failed to configure QoS: {str(e)}")

    def _convert_to_mikrotik_format(self, bandwidth_str):
        """Convert bandwidth string to MikroTik format"""
        if bandwidth_str.lower() == 'unlimited':
            return '0'  # 0 means unlimited in MikroTik
            
        try:
            if bandwidth_str.upper().endswith('GB'):
                value = float(bandwidth_str.upper().replace('GB', '').strip())
                # Convert GB to Mbps for router (approximate conversion)
                return f"{int(value * 8000)}k/{(value * 8000)}k"  # Download/Upload
        except (ValueError, AttributeError):
            pass
            
        return '0'

class BandwidthAllocationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            BandwidthAllocation.objects.select_related('client', 'plan', 'qos_profile'),
            pk=pk
        )

    def get(self, request, pk):
        """
        Retrieve a single bandwidth allocation by ID.
        """
        allocation = self.get_object(pk)
        serializer = BandwidthAllocationSerializer(allocation)
        return Response(serializer.data)

    def put(self, request, pk):
        """
        Update an existing bandwidth allocation and reconfigure QoS on the router.
        """
        allocation = self.get_object(pk)
        serializer = BandwidthAllocationUpdateSerializer(allocation, data=request.data, partial=True)
        
        if serializer.is_valid():
            try:
                updated_allocation = serializer.save()

                # Update QoS on router if changes affect QoS settings
                if any(field in request.data for field in ['allocated_bandwidth', 'priority', 'qos_profile']):
                    if hasattr(updated_allocation.client, 'router') and updated_allocation.client.router:
                        self._update_router_qos(updated_allocation)

                response_serializer = BandwidthAllocationSerializer(updated_allocation)
                return Response(response_serializer.data)
                
            except Exception as e:
                return Response(
                    {"error": f"Failed to update allocation: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _update_router_qos(self, allocation):
        """Update QoS settings on the router"""
        try:
            router = allocation.client.router
            api = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            ).get_api()
            
            qos_resource = api.get_resource('/queue/simple')
            queue_name = f"Client-{allocation.client.id}-{allocation.id}"
            qos_entries = qos_resource.get(name=queue_name)
            
            if qos_entries:
                qos_params = {
                    'id': qos_entries[0]['id'],
                    'max_limit': self._convert_to_mikrotik_format(allocation.allocated_bandwidth),
                    'priority': {'high': '1', 'medium': '4', 'low': '8'}.get(allocation.priority, '4')
                }
                
                if allocation.qos_profile:
                    qos_params.update({
                        'burst_limit': allocation.qos_profile.burst_limit,
                        'burst_threshold': allocation.qos_profile.min_bandwidth,
                        'min_limit': allocation.qos_profile.min_bandwidth
                    })
                
                qos_resource.set(**qos_params)
                
            api.close()
            
        except Exception as e:
            raise Exception(f"Failed to update QoS: {str(e)}")

    def delete(self, request, pk):
        """
        Delete a bandwidth allocation and remove QoS settings from the router.
        """
        allocation = self.get_object(pk)
        
        try:
            # Remove QoS settings from router
            if hasattr(allocation.client, 'router') and allocation.client.router:
                self._remove_router_qos(allocation)
                
            allocation.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to delete allocation: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _remove_router_qos(self, allocation):
        """Remove QoS settings from the router"""
        try:
            router = allocation.client.router
            api = RouterOsApiPool(
                router.ip,
                username=router.username,
                password=router.password,
                port=router.port
            ).get_api()
            
            qos_resource = api.get_resource('/queue/simple')
            queue_name = f"Client-{allocation.client.id}-{allocation.id}"
            qos_entries = qos_resource.get(name=queue_name)
            
            if qos_entries:
                qos_resource.remove(id=qos_entries[0]['id'])
                
            api.close()
            
        except Exception as e:
            raise Exception(f"Failed to remove QoS: {str(e)}")

class QoSProfileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve a list of QoS profiles.
        """
        active_only = request.query_params.get('active_only', 'true').lower() == 'true'
        profiles = QoSProfile.objects.all()
        
        if active_only:
            profiles = profiles.filter(is_active=True)
            
        serializer = QoSProfileSerializer(profiles, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new QoS profile.
        """
        serializer = QoSProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BandwidthUsageStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve comprehensive bandwidth usage statistics.
        """
        # Get top users by usage
        top_users = BandwidthAllocation.objects.select_related('client', 'plan').order_by('-used_bandwidth')[:10]
        top_users_serializer = BandwidthAllocationSerializer(top_users, many=True)

        # Calculate aggregate statistics
        total_allocations = BandwidthAllocation.objects.count()
        active_allocations = BandwidthAllocation.objects.filter(status='active').count()
        
        # Calculate total used and allocated bandwidth
        total_used = BandwidthAllocation.objects.aggregate(
            total_used=Sum('used_bandwidth')
        )['total_used'] or 0

        # Calculate total allocated (excluding unlimited)
        allocations_with_limits = BandwidthAllocation.objects.exclude(allocated_bandwidth='Unlimited')
        total_allocated = 0
        for alloc in allocations_with_limits:
            try:
                total_allocated += float(alloc.allocated_bandwidth.replace('GB', '').strip())
            except (ValueError, AttributeError):
                pass

        # Calculate over-quota statistics
        over_quota_count = 0
        for allocation in BandwidthAllocation.objects.all():
            if allocation.is_over_quota():
                over_quota_count += 1

        # Recent usage trends (last 24 hours)
        last_24_hours = timezone.now() - timedelta(hours=24)
        recent_usage = BandwidthUsageHistory.objects.filter(
            timestamp__gte=last_24_hours
        ).aggregate(
            total_bytes=Sum('bytes_used'),
            avg_bandwidth=Avg('average_bandwidth'),
            peak_bandwidth=Avg('peak_bandwidth')
        )

        return Response({
            'top_users': top_users_serializer.data,
            'stats': {
                'total_allocations': total_allocations,
                'active_allocations': active_allocations,
                'over_quota_allocations': over_quota_count,
                'total_used_gb': round(total_used, 2),
                'total_allocated_gb': round(total_allocated, 2),
                'utilization_percentage': round((total_used / total_allocated * 100) if total_allocated > 0 else 0, 2),
                'recent_usage_trends': {
                    'last_24_hours_gb': round((recent_usage['total_bytes'] or 0) / (1024 ** 3), 2),
                    'average_bandwidth_mbps': round(recent_usage['avg_bandwidth'] or 0, 2),
                    'peak_bandwidth_mbps': round(recent_usage['peak_bandwidth'] or 0, 2)
                }
            }
        })

class BandwidthUsageUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """
        Update bandwidth usage for an allocation.
        """
        allocation = get_object_or_404(BandwidthAllocation, pk=pk)
        bytes_used = request.data.get('bytes_used')
        duration = request.data.get('duration', 60)  # Default 60 seconds
        
        if not bytes_used:
            return Response(
                {"error": "bytes_used is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            bytes_used = int(bytes_used)
            duration = int(duration)
            
            # Calculate bandwidth metrics
            bandwidth_mbps = (bytes_used * 8) / (duration * 1000000)  # Convert to Mbps
            
            # Create usage history record
            BandwidthUsageHistory.objects.create(
                allocation=allocation,
                bytes_used=bytes_used,
                duration=duration,
                peak_bandwidth=bandwidth_mbps,
                average_bandwidth=bandwidth_mbps
            )
            
            # Update allocation usage
            allocation.update_usage(bytes_used)
            
            serializer = BandwidthAllocationSerializer(allocation)
            return Response(serializer.data)
            
        except (ValueError, TypeError) as e:
            return Response(
                {"error": "Invalid bytes_used or duration format"},
                status=status.HTTP_400_BAD_REQUEST
            )