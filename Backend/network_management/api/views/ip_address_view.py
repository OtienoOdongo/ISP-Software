



# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.core.paginator import Paginator
# from django.shortcuts import get_object_or_404
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.models.router_management_model import Router
# from network_management.serializers.ip_address_serializer import (
#     IPAddressSerializer, IPAddressCreateSerializer,
#     SubnetSerializer, DHCPLeaseSerializer
# )

# class IPAddressListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         router_id = request.query_params.get('router')
#         page = request.query_params.get('page', 1)
#         per_page = request.query_params.get('per_page', 10)

#         try:
#             page = int(page)
#             per_page = int(per_page)
#         except ValueError:
#             return Response(
#                 {"error": "Invalid page or per_page parameter"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         ip_addresses = IPAddress.objects.all()

#         # Validate router_id
#         if router_id:
#             try:
#                 router_id = int(router_id)
#                 if not Router.objects.filter(id=router_id).exists():
#                     return Response(
#                         {"error": "Router not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#                 ip_addresses = ip_addresses.filter(router_id=router_id)
#             except ValueError:
#                 return Response(
#                     {"error": "Invalid router ID"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#         paginator = Paginator(ip_addresses, per_page)
#         if page > paginator.num_pages:
#             return Response(
#                 {"error": "Page not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         page_obj = paginator.page(page)
#         serializer = IPAddressSerializer(page_obj.object_list, many=True)
#         return Response({
#             "data": serializer.data,
#             "total_pages": paginator.num_pages,
#             "current_page": page,
#             "total_items": paginator.count
#         })

#     def post(self, request):
#         serializer = IPAddressCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class IPAddressDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         ip_address = get_object_or_404(IPAddress, pk=pk)
#         serializer = IPAddressSerializer(ip_address)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         ip_address = get_object_or_404(IPAddress, pk=pk)
#         serializer = IPAddressCreateSerializer(ip_address, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         ip_address = get_object_or_404(IPAddress, pk=pk)
#         ip_address.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class SubnetListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         subnets = Subnet.objects.all()
#         serializer = SubnetSerializer(subnets, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = SubnetSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class DHCPLeaseListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         leases = DHCPLease.objects.all()
#         serializer = DHCPLeaseSerializer(leases, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DHCPLeaseSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)









from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
from network_management.models.router_management_model import Router
from network_management.serializers.ip_address_serializer import (
    IPAddressSerializer, IPAddressCreateSerializer, IPAddressUpdateSerializer,
    SubnetSerializer, DHCPLeaseSerializer
)

class IPAddressListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        router_id = request.query_params.get('router')
        status_filter = request.query_params.get('status')
        search_term = request.query_params.get('search', '')
        page = request.query_params.get('page', 1)
        per_page = request.query_params.get('per_page', 10)

        try:
            page = int(page)
            per_page = int(per_page)
        except ValueError:
            return Response(
                {"error": "Invalid page or per_page parameter"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ip_addresses = IPAddress.objects.select_related('router', 'assigned_to').all()

        # Filter by router
        if router_id:
            try:
                router_id = int(router_id)
                if not Router.objects.filter(id=router_id).exists():
                    return Response(
                        {"error": "Router not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                ip_addresses = ip_addresses.filter(router_id=router_id)
            except ValueError:
                return Response(
                    {"error": "Invalid router ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Filter by status
        if status_filter:
            ip_addresses = ip_addresses.filter(status=status_filter)

        # Search functionality
        if search_term:
            ip_addresses = ip_addresses.filter(
                Q(ip_address__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(subnet__icontains=search_term) |
                Q(assigned_to__full_name__icontains=search_term)
            )

        # Pagination
        paginator = Paginator(ip_addresses, per_page)
        if page > paginator.num_pages:
            return Response(
                {"error": "Page not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        page_obj = paginator.page(page)
        serializer = IPAddressSerializer(page_obj.object_list, many=True)
        
        return Response({
            "data": serializer.data,
            "total_pages": paginator.num_pages,
            "current_page": page,
            "total_items": paginator.count,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous()
        })

    def post(self, request):
        serializer = IPAddressCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                ip_address = serializer.save()
                
                # Auto-assign to router if status is assigned
                if ip_address.status == 'assigned':
                    ip_address.assign_to_router()
                    
                response_serializer = IPAddressSerializer(ip_address)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IPAddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(IPAddress.objects.select_related('router', 'assigned_to'), pk=pk)

    def get(self, request, pk):
        ip_address = self.get_object(pk)
        serializer = IPAddressSerializer(ip_address)
        return Response(serializer.data)

    def put(self, request, pk):
        ip_address = self.get_object(pk)
        serializer = IPAddressUpdateSerializer(ip_address, data=request.data, partial=True)
        
        if serializer.is_valid():
            try:
                updated_ip = serializer.save()
                
                # Handle router assignment/release based on status change
                if 'status' in request.data:
                    if request.data['status'] == 'assigned' and ip_address.status != 'assigned':
                        updated_ip.assign_to_router()
                    elif request.data['status'] == 'available' and ip_address.status == 'assigned':
                        updated_ip.release_from_router()
                
                response_serializer = IPAddressSerializer(updated_ip)
                return Response(response_serializer.data)
                
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        ip_address = self.get_object(pk)
        
        try:
            # Release from router before deletion if assigned
            if ip_address.status == 'assigned':
                ip_address.release_from_router()
                
            ip_address.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class SubnetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        router_id = request.query_params.get('router')
        subnets = Subnet.objects.select_related('router').all()
        
        if router_id:
            try:
                router_id = int(router_id)
                subnets = subnets.filter(router_id=router_id)
            except ValueError:
                return Response(
                    {"error": "Invalid router ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        serializer = SubnetSerializer(subnets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubnetSerializer(data=request.data)
        if serializer.is_valid():
            try:
                subnet = serializer.save()
                
                # Auto-configure on router
                subnet.configure_on_router()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DHCPLeaseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        router_id = request.query_params.get('router')
        active_only = request.query_params.get('active_only', 'true').lower() == 'true'
        
        leases = DHCPLease.objects.select_related('ip_address', 'client').all()
        
        if router_id:
            try:
                router_id = int(router_id)
                leases = leases.filter(ip_address__router_id=router_id)
            except ValueError:
                return Response(
                    {"error": "Invalid router ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        if active_only:
            leases = leases.filter(is_active=True)
            
        serializer = DHCPLeaseSerializer(leases, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DHCPLeaseSerializer(data=request.data)
        if serializer.is_valid():
            try:
                lease = serializer.save()
                
                # Auto-configure on router
                lease.configure_on_router()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AvailableIPsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, subnet_id):
        subnet = get_object_or_404(Subnet, pk=subnet_id)
        available_ips = subnet.get_available_ips()
        
        return Response({
            "subnet": f"{subnet.network_address}/{subnet.netmask}",
            "available_ips": available_ips,
            "total_available": len(available_ips)
        })