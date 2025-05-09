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
#                 Q(mac_address__icontains=search_term)
        
#         serializer = BandwidthAllocationSerializer(allocations, many=True)
#         return Response(serializer.data)
    
#     def post(self, request):
#         serializer = BandwidthAllocationCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             # Apply QoS settings to router
#             try:
#                 allocation = serializer.save()
                
#                 # Connect to router and configure QoS
#                 router = allocation.client.router
#                 if router:
#                     api = RouterOsApiPool(
#                         router.ip, 
#                         username=router.username, 
#                         password=router.password, 
#                         port=router.port
#                     ).get_api()
                    
#                     qos_resource = api.get_resource('/queue/simple')
#                     qos_resource.add(
#                         name=f"Client-{allocation.client.id}",
#                         target=allocation.ip_address,
#                         max_limit=allocation.allocated_bandwidth,
#                         priority=allocation.priority,
#                         burst_limit=allocation.qos_profile.burst_limit if allocation.qos_profile else None
#                     )
#                     api.close()
                
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class BandwidthAllocationDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(BandwidthAllocation, pk=pk)
    
#     def get(self, request, pk):
#         allocation = self.get_object(pk)
#         serializer = BandwidthAllocationSerializer(allocation)
#         return Response(serializer.data)
    
#     def put(self, request, pk):
#         allocation = self.get_object(pk)
#         serializer = BandwidthAllocationCreateSerializer(allocation, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_allocation = serializer.save()
                
#                 # Update QoS settings on router
#                 router = updated_allocation.client.router
#                 if router:
#                     api = RouterOsApiPool(
#                         router.ip, 
#                         username=router.username, 
#                         password=router.password, 
#                         port=router.port
#                     ).get_api()
                    
#                     qos_resource = api.get_resource('/queue/simple')
#                     qos_entry = qos_resource.get(name=f"Client-{updated_allocation.client.id}")[0]
#                     qos_resource.set(
#                         id=qos_entry['id'],
#                         max_limit=updated_allocation.allocated_bandwidth,
#                         priority=updated_allocation.priority
#                     )
#                     api.close()
                
#                 return Response(serializer.data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def delete(self, request, pk):
#         allocation = self.get_object(pk)
        
#         # Remove QoS settings from router
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
#                 qos_entry = qos_resource.get(name=f"Client-{allocation.client.id}")[0]
#                 qos_resource.remove(id=qos_entry['id'])
#                 api.close()
#         except Exception as e:
#             pass  # Even if QoS removal fails, we still want to delete the allocation
        
#         allocation.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class QoSProfileListView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         profiles = QoSProfile.objects.all()
#         serializer = QoSProfileSerializer(profiles, many=True)
#         return Response(serializer.data)
    
#     def post(self, request):
#         serializer = QoSProfileSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class BandwidthUsageStatsView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         # Get top bandwidth users
#         top_users = BandwidthAllocation.objects.order_by('-used_bandwidth')[:10]
#         serializer = BandwidthAllocationSerializer(top_users, many=True)
        
#         # Get total bandwidth usage
#         total_used = sum(alloc.used_bandwidth for alloc in BandwidthAllocation.objects.all())
#         total_allocated = sum(
#             float(alloc.allocated_bandwidth.replace('GB', '')) 
#             for alloc in BandwidthAllocation.objects.exclude(allocated_bandwidth='Unlimited')
        
#         return Response({
#             'top_users': serializer.data,
#             'stats': {
#                 'total_used': total_used,
#                 'total_allocated': total_allocated,
#                 'utilization_percentage': (total_used / total_allocated * 100) if total_allocated > 0 else 0
#             }
#         }))





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
#                 Q(mac_address__icontains=search_term)
#             )

#         serializer = BandwidthAllocationSerializer(allocations, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = BandwidthAllocationCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 allocation = serializer.save()

#                 # Connect to router and configure QoS
#                 router = allocation.client.router
#                 if router:
#                     api = RouterOsApiPool(
#                         router.ip,
#                         username=router.username,
#                         password=router.password,
#                         port=router.port
#                     ).get_api()

#                     qos_resource = api.get_resource('/queue/simple')
#                     qos_resource.add(
#                         name=f"Client-{allocation.client.id}",
#                         target=allocation.ip_address,
#                         max_limit=allocation.allocated_bandwidth,
#                         priority=allocation.priority,
#                         burst_limit=allocation.qos_profile.burst_limit if allocation.qos_profile else None
#                     )
#                     api.close()

#                 # Re-serialize with full serializer for accurate output
#                 response_serializer = BandwidthAllocationSerializer(allocation)
#                 return Response(response_serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class BandwidthAllocationDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(BandwidthAllocation, pk=pk)

#     def get(self, request, pk):
#         allocation = self.get_object(pk)
#         serializer = BandwidthAllocationSerializer(allocation)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         allocation = self.get_object(pk)
#         serializer = BandwidthAllocationCreateSerializer(allocation, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_allocation = serializer.save()

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
#                         qos_resource.set(
#                             id=qos_entries[0]['id'],
#                             max_limit=updated_allocation.allocated_bandwidth,
#                             priority=updated_allocation.priority
#                         )
#                     api.close()

#                 response_serializer = BandwidthAllocationSerializer(updated_allocation)
#                 return Response(response_serializer.data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
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
#         except Exception:
#             pass

#         allocation.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class QoSProfileListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         profiles = QoSProfile.objects.all()
#         serializer = QoSProfileSerializer(profiles, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = QoSProfileSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class BandwidthUsageStatsView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
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
from network_management.models.bandwidth_allocation_model import BandwidthAllocation, QoSProfile
from network_management.serializers.bandwidth_allocation_serializer import (
    BandwidthAllocationSerializer,
    BandwidthAllocationCreateSerializer,
    QoSProfileSerializer
)
from django.shortcuts import get_object_or_404
from django.db.models import Q
from routeros_api import RouterOsApiPool
from django.utils import timezone


class BandwidthAllocationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve a list of bandwidth allocations with optional filtering and search.
        Query params:
            - status: Filter by status (active, inactive, suspended)
            - search: Search by client name, IP, MAC, or ID
        """
        allocations = BandwidthAllocation.objects.all()

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            allocations = allocations.filter(status=status_filter)

        search_term = request.query_params.get('search')
        if search_term:
            allocations = allocations.filter(
                Q(client__full_name__icontains=search_term) |
                Q(ip_address__icontains=search_term) |
                Q(mac_address__icontains=search_term) |
                Q(id__icontains=search_term)
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

                # Configure QoS on router
                router = allocation.client.router
                if router:
                    api = RouterOsApiPool(
                        router.ip,
                        username=router.username,
                        password=router.password,
                        port=router.port
                    ).get_api()
                    qos_resource = api.get_resource('/queue/simple')
                    qos_params = {
                        'name': f"Client-{allocation.client.id}",
                        'target': allocation.ip_address,
                        'max_limit': allocation.allocated_bandwidth.replace('GB', 'M'),  # Convert GB to Mbps for router
                        'priority': {'high': '1', 'medium': '4', 'low': '8'}.get(allocation.priority, '4')
                    }
                    if allocation.qos_profile:
                        qos_params.update({
                            'burst_limit': allocation.qos_profile.burst_limit,
                            'min_limit': allocation.qos_profile.min_bandwidth
                        })
                    qos_resource.add(**qos_params)
                    api.close()

                response_serializer = BandwidthAllocationSerializer(allocation)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": f"Failed to configure QoS: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BandwidthAllocationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(BandwidthAllocation, pk=pk)

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
        serializer = BandwidthAllocationCreateSerializer(allocation, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                updated_allocation = serializer.save()

                # Update QoS on router
                router = updated_allocation.client.router
                if router:
                    api = RouterOsApiPool(
                        router.ip,
                        username=router.username,
                        password=router.password,
                        port=router.port
                    ).get_api()
                    qos_resource = api.get_resource('/queue/simple')
                    qos_entries = qos_resource.get(name=f"Client-{updated_allocation.client.id}")
                    if qos_entries:
                        qos_params = {
                            'id': qos_entries[0]['id'],
                            'max_limit': updated_allocation.allocated_bandwidth.replace('GB', 'M'),
                            'priority': {'high': '1', 'medium': '4', 'low': '8'}.get(updated_allocation.priority, '4')
                        }
                        if updated_allocation.qos_profile:
                            qos_params.update({
                                'burst_limit': updated_allocation.qos_profile.burst_limit,
                                'min_limit': updated_allocation.qos_profile.min_bandwidth
                            })
                        qos_resource.set(**qos_params)
                    api.close()

                response_serializer = BandwidthAllocationSerializer(updated_allocation)
                return Response(response_serializer.data)
            except Exception as e:
                return Response({"error": f"Failed to update QoS: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """
        Delete a bandwidth allocation and remove QoS settings from the router.
        """
        allocation = self.get_object(pk)
        try:
            router = allocation.client.router
            if router:
                api = RouterOsApiPool(
                    router.ip,
                    username=router.username,
                    password=router.password,
                    port=router.port
                ).get_api()
                qos_resource = api.get_resource('/queue/simple')
                qos_entries = qos_resource.get(name=f"Client-{allocation.client.id}")
                if qos_entries:
                    qos_resource.remove(id=qos_entries[0]['id'])
                api.close()
        except Exception as e:
            return Response({"error": f"Failed to remove QoS: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        allocation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class QoSProfileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve a list of QoS profiles.
        """
        profiles = QoSProfile.objects.all()
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
        Retrieve bandwidth usage statistics, including top users and aggregates.
        """
        top_users = BandwidthAllocation.objects.order_by('-used_bandwidth')[:10]
        serializer = BandwidthAllocationSerializer(top_users, many=True)

        allocations = BandwidthAllocation.objects.exclude(allocated_bandwidth='Unlimited')
        total_used = sum(alloc.used_bandwidth for alloc in BandwidthAllocation.objects.all())
        total_allocated = sum(
            float(alloc.allocated_bandwidth.replace('GB', '').strip()) for alloc in allocations
        )

        return Response({
            'top_users': serializer.data,
            'stats': {
                'total_used': total_used,
                'total_allocated': total_allocated,
                'utilization_percentage': (total_used / total_allocated * 100) if total_allocated > 0 else 0
            }
        })