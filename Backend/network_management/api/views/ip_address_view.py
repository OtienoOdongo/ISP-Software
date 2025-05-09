# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.serializers.ip_address_serializer import (
#     IPAddressSerializer,
#     IPAddressCreateSerializer,
#     SubnetSerializer,
#     DHCPLeaseSerializer
# )
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from django.core.paginator import Paginator
# from routeros_api import RouterOsApiPool
# from django.utils import timezone

# class IPAddressListView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         ip_addresses = IPAddress.objects.all()
        
#         # Apply filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             ip_addresses = ip_addresses.filter(status=status_filter)
            
#         subnet_filter = request.query_params.get('subnet')
#         if subnet_filter:
#             ip_addresses = ip_addresses.filter(subnet__contains=subnet_filter)
            
#         search_term = request.query_params.get('search')
#         if search_term:
#             ip_addresses = ip_addresses.filter(
#                 Q(ip_address__icontains=search_term) |
#                 Q(assigned_to__full_name__icontains=search_term) |
#                 Q(description__icontains=search_term))
        
#         # Pagination
#         page = request.query_params.get('page', 1)
#         per_page = request.query_params.get('per_page', 10)
#         paginator = Paginator(ip_addresses, per_page)
#         page_obj = paginator.get_page(page)
        
#         serializer = IPAddressSerializer(page_obj, many=True)
#         return Response({
#             'data': serializer.data,
#             'total': paginator.count,
#             'page': page_obj.number,
#             'per_page': paginator.per_page,
#             'total_pages': paginator.num_pages
#         })
    
#     def post(self, request):
#         serializer = IPAddressCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 ip_address = serializer.save()
                
#                 # Add IP to router if assigned
#                 if ip_address.status == 'assigned' and ip_address.router:
#                     api = RouterOsApiPool(
#                         ip_address.router.ip, 
#                         username=ip_address.router.username, 
#                         password=ip_address.router.password, 
#                         port=ip_address.router.port
#                     ).get_api()
                    
#                     ip_resource = api.get_resource('/ip/address')
#                     ip_resource.add(
#                         address=ip_address.ip_address,
#                         network=ip_address.subnet.split('/')[0],
#                         interface='bridge'
#                     )
#                     api.close()
                
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class IPAddressDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(IPAddress, pk=pk)
    
#     def get(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressSerializer(ip_address)
#         return Response(serializer.data)
    
#     def put(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressCreateSerializer(ip_address, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_ip = serializer.save()
                
#                 # Update IP on router if status changed
#                 if 'status' in request.data and ip_address.router:
#                     api = RouterOsApiPool(
#                         ip_address.router.ip, 
#                         username=ip_address.router.username, 
#                         password=ip_address.router.password, 
#                         port=ip_address.router.port
#                     ).get_api()
                    
#                     ip_resource = api.get_resource('/ip/address')
#                     if updated_ip.status == 'assigned':
#                         ip_resource.add(
#                             address=updated_ip.ip_address,
#                             network=updated_ip.subnet.split('/')[0],
#                             interface='bridge'
#                         )
#                     else:
#                         addresses = ip_resource.get(address=updated_ip.ip_address)
#                         if addresses:
#                             ip_resource.remove(id=addresses[0]['id'])
#                     api.close()
                
#                 return Response(serializer.data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def delete(self, request, pk):
#         ip_address = self.get_object(pk)
        
#         # Remove IP from router if assigned
#         try:
#             if ip_address.status == 'assigned' and ip_address.router:
#                 api = RouterOsApiPool(
#                     ip_address.router.ip, 
#                     username=ip_address.router.username, 
#                     password=ip_address.router.password, 
#                     port=ip_address.router.port
#                 ).get_api()
                
#                 ip_resource = api.get_resource('/ip/address')
#                 addresses = ip_resource.get(address=ip_address.ip_address)
#                 if addresses:
#                     ip_resource.remove(id=addresses[0]['id'])
#                 api.close()
#         except Exception as e:
#             pass  # Even if removal fails, we still want to delete the IP
        
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
        
#         # Filter by IP or MAC
#         ip_filter = request.query_params.get('ip')
#         if ip_filter:
#             leases = leases.filter(ip_address__ip_address=ip_filter)
            
#         mac_filter = request.query_params.get('mac')
#         if mac_filter:
#             leases = leases.filter(mac_address=mac_filter)
        
#         serializer = DHCPLeaseSerializer(leases, many=True)
#         return Response(serializer.data)





# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.serializers.ip_address_serializer import (
#     IPAddressSerializer, IPAddressCreateSerializer, SubnetSerializer, DHCPLeaseSerializer
# )
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from django.core.paginator import Paginator
# from routeros_api import RouterOsApiPool
# from django.utils import timezone

# class IPAddressListView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         ip_addresses = IPAddress.objects.all()
        
#         # Apply filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             ip_addresses = ip_addresses.filter(status=status_filter)
            
#         subnet_filter = request.query_params.get('subnet')
#         if subnet_filter:
#             ip_addresses = ip_addresses.filter(subnet__contains=subnet_filter)
            
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             ip_addresses = ip_addresses.filter(router_id=router_filter)
            
#         search_term = request.query_params.get('search')
#         if search_term:
#             ip_addresses = ip_addresses.filter(
#                 Q(ip_address__icontains=search_term) |
#                 Q(assigned_to__full_name__icontains=search_term) |
#                 Q(description__icontains=search_term))
        
#         # Pagination
#         page = request.query_params.get('page', 1)
#         per_page = request.query_params.get('per_page', 10)
#         paginator = Paginator(ip_addresses, per_page)
#         page_obj = paginator.get_page(page)
        
#         serializer = IPAddressSerializer(page_obj, many=True)
#         return Response({
#             'data': serializer.data,
#             'total': paginator.count,
#             'page': page_obj.number,
#             'per_page': paginator.per_page,
#             'total_pages': paginator.num_pages
#         })
    
#     def post(self, request):
#         serializer = IPAddressCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 ip_address = serializer.save()
                
#                 # Automatically assign IP to router if status is 'assigned'
#                 if ip_address.status == 'assigned' and ip_address.router:
#                     ip_address.assign_to_router()
                
#                 return Response(IPAddressSerializer(ip_address).data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class IPAddressDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(IPAddress, pk=pk)
    
#     def get(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressSerializer(ip_address)
#         return Response(serializer.data)
    
#     def put(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressCreateSerializer(ip_address, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_ip = serializer.save()
                
#                 # Update IP on router if status changed
#                 if 'status' in request.data and updated_ip.router:
#                     if updated_ip.status == 'assigned':
#                         updated_ip.assign_to_router()
#                     else:
#                         api = RouterOsApiPool(
#                             updated_ip.router.ip, 
#                             username=updated_ip.router.username, 
#                             password=updated_ip.router.password, 
#                             port=updated_ip.router.port
#                         ).get_api()
#                         ip_resource = api.get_resource('/ip/address')
#                         addresses = ip_resource.get(address=updated_ip.ip_address)
#                         if addresses:
#                             ip_resource.remove(id=addresses[0]['id'])
#                         api.close()
                
#                 return Response(IPAddressSerializer(updated_ip).data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def delete(self, request, pk):
#         ip_address = self.get_object(pk)
        
#         try:
#             if ip_address.status == 'assigned' and ip_address.router:
#                 api = RouterOsApiPool(
#                     ip_address.router.ip, 
#                     username=ip_address.router.username, 
#                     password=ip_address.router.password, 
#                     port=ip_address.router.port
#                 ).get_api()
#                 ip_resource = api.get_resource('/ip/address')
#                 addresses = ip_resource.get(address=ip_address.ip_address)
#                 if addresses:
#                     ip_resource.remove(id=addresses[0]['id'])
#                 api.close()
#         except Exception as e:
#             pass
        
#         ip_address.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class SubnetListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         subnets = Subnet.objects.all()
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             subnets = subnets.filter(router_id=router_filter)
#         serializer = SubnetSerializer(subnets, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = SubnetSerializer(data=request.data)
#         if serializer.is_valid():
#             subnet = serializer.save()
#             try:
#                 subnet.configure_on_router()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 subnet.delete()
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class SubnetDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(Subnet, pk=pk)

#     def get(self, request, pk):
#         subnet = self.get_object(pk)
#         serializer = SubnetSerializer(subnet)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         subnet = self.get_object(pk)
#         serializer = SubnetSerializer(subnet, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_subnet = serializer.save()
#                 updated_subnet.configure_on_router()
#                 return Response(serializer.data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         subnet = self.get_object(pk)
#         try:
#             api = RouterOsApiPool(
#                 subnet.router.ip,
#                 username=subnet.router.username,
#                 password=subnet.router.password,
#                 port=subnet.router.port
#             ).get_api()
#             ip_resource = api.get_resource('/ip/address')
#             addresses = ip_resource.get(address=f"{subnet.network_address}/{subnet.netmask}")
#             if addresses:
#                 ip_resource.remove(id=addresses[0]['id'])
#             api.close()
#         except Exception:
#             pass
#         subnet.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class DHCPLeaseListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         leases = DHCPLease.objects.all()

#         ip_filter = request.query_params.get('ip')
#         if ip_filter:
#             leases = leases.filter(ip_address__ip_address=ip_filter)

#         mac_filter = request.query_params.get('mac')
#         if mac_filter:
#             leases = leases.filter(mac_address=mac_filter)

#         router_filter = request.query_params.get('router')
#         if router_filter:
#             leases = leases.filter(ip_address__router_id=router_filter)

#         serializer = DHCPLeaseSerializer(leases, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DHCPLeaseSerializer(data=request.data)
#         if serializer.is_valid():
#             lease = serializer.save()
#             try:
#                 lease.configure_on_router()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 lease.delete()
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class DHCPLeaseDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk):
#         return get_object_or_404(DHCPLease, pk=pk)

#     def get(self, request, pk):
#         lease = self.get_object(pk)
#         serializer = DHCPLeaseSerializer(lease)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         lease = self.get_object(pk)
#         serializer = DHCPLeaseSerializer(lease, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_lease = serializer.save()
#                 updated_lease.configure_on_router()
#                 return Response(serializer.data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         lease = self.get_object(pk)
#         try:
#             api = RouterOsApiPool(
#                 lease.ip_address.router.ip,
#                 username=lease.ip_address.router.username,
#                 password=lease.ip_address.router.password,
#                 port=lease.ip_address.router.port
#             ).get_api()
#             dhcp_resource = api.get_resource('/ip/dhcp-server/lease')
#             leases = dhcp_resource.get(address=lease.ip_address.ip_address, mac_address=lease.mac_address)
#             if leases:
#                 dhcp_resource.remove(id=leases[0]['id'])
#             api.close()
#         except Exception:
#             pass
#         lease.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)






# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
# from network_management.serializers.ip_address_serializer import (
#     IPAddressSerializer, IPAddressCreateSerializer, SubnetSerializer, DHCPLeaseSerializer
# )
# from django.shortcuts import get_object_or_404
# from django.db.models import Q
# from django.core.paginator import Paginator
# from routeros_api import RouterOsApiPool
# from django.utils import timezone

# class IPAddressListView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         ip_addresses = IPAddress.objects.all()
        
#         # Apply filters
#         status_filter = request.query_params.get('status')
#         if status_filter:
#             ip_addresses = ip_addresses.filter(status=status_filter)
            
#         subnet_filter = request.query_params.get('subnet')
#         if subnet_filter:
#             ip_addresses = ip_addresses.filter(subnet__contains=subnet_filter)
            
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             ip_addresses = ip_addresses.filter(router_id=router_filter)
            
#         search_term = request.query_params.get('search')
#         if search_term:
#             ip_addresses = ip_addresses.filter(
#                 Q(ip_address__icontains=search_term) |
#                 Q(assigned_to__full_name__icontains=search_term) |
#                 Q(description__icontains=search_term))
        
#         # Pagination
#         page = request.query_params.get('page', 1)
#         per_page = request.query_params.get('per_page', 10)
#         paginator = Paginator(ip_addresses, per_page)
#         page_obj = paginator.get_page(page)
        
#         serializer = IPAddressSerializer(page_obj, many=True)
#         return Response({
#             'data': serializer.data,
#             'total': paginator.count,
#             'page': page_obj.number,
#             'per_page': paginator.per_page,
#             'total_pages': paginator.num_pages
#         })
    
#     def post(self, request):
#         serializer = IPAddressCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 ip_address = serializer.save()
                
#                 if ip_address.status == 'assigned' and ip_address.router:
#                     ip_address.assign_to_router()
                
#                 return Response(IPAddressSerializer(ip_address).data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class IPAddressDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(IPAddress, pk=pk)
    
#     def get(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressSerializer(ip_address)
#         return Response(serializer.data)
    
#     def put(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressCreateSerializer(ip_address, data=request.data, partial=True)
#         if serializer.is_valid():
#             try:
#                 updated_ip = serializer.save()
                
#                 if 'status' in request.data and updated_ip.router:
#                     if updated_ip.status == 'assigned':
#                         updated_ip.assign_to_router()
#                     else:
#                         api = RouterOsApiPool(
#                             updated_ip.router.ip, 
#                             username=updated_ip.router.username, 
#                             password=updated_ip.router.password, 
#                             port=updated_ip.router.port
#                         ).get_api()
#                         ip_resource = api.get_resource('/ip/address')
#                         addresses = ip_resource.get(address=updated_ip.ip_address)
#                         if addresses:
#                             ip_resource.remove(id=addresses[0]['id'])
#                         api.close()
                
#                 return Response(IPAddressSerializer(updated_ip).data)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def delete(self, request, pk):
#         ip_address = self.get_object(pk)
        
#         try:
#             if ip_address.status == 'assigned' and ip_address.router:
#                 api = RouterOsApiPool(
#                     ip_address.router.ip, 
#                     username=ip_address.router.username, 
#                     password=ip_address.router.password, 
#                     port=ip_address.router.port
#                 ).get_api()
#                 ip_resource = api.get_resource('/ip/address')
#                 addresses = ip_resource.get(address=ip_address.ip_address)
#                 if addresses:
#                     ip_resource.remove(id=addresses[0]['id'])
#                 api.close()
#         except Exception as e:
#             pass
        
#         ip_address.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

# class SubnetListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         subnets = Subnet.objects.all()
#         router_filter = request.query_params.get('router')
#         if router_filter:
#             subnets = subnets.filter(router_id=router_filter)
#         serializer = SubnetSerializer(subnets, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = SubnetSerializer(data=request.data)
#         if serializer.is_valid():
#             subnet = serializer.save()
#             try:
#                 subnet.configure_on_router()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 subnet.delete()
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class DHCPLeaseListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         leases = DHCPLease.objects.all()

#         ip_filter = request.query_params.get('ip')
#         if ip_filter:
#             leases = leases.filter(ip_address__ip_address=ip_filter)

#         mac_filter = request.query_params.get('mac')
#         if mac_filter:
#             leases = leases.filter(mac_address=mac_filter)

#         router_filter = request.query_params.get('router')
#         if router_filter:
#             leases = leases.filter(ip_address__router_id=router_filter)

#         serializer = DHCPLeaseSerializer(leases, many=True)
#         return Response(serializer.data)










# # network_management/api/views/ip_address_view.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.pagination import PageNumberPagination
# from rest_framework.permissions import IsAuthenticated
# from django.db.models import Q
# from django.http import Http404
# from network_management.models.ip_address_model import IPAddress
# from network_management.serializers.ip_address_serializer import IPAddressSerializer

# class IPAddressPagination(PageNumberPagination):
#     page_size = 10
#     page_size_query_param = 'per_page'
#     max_page_size = 100

#     def get_paginated_response(self, data):
#         return Response({
#             'data': data,
#             'meta': {
#                 'total': self.page.paginator.count,
#                 'total_pages': self.page.paginator.num_pages,
#                 'current_page': self.page.number,
#                 'per_page': self.get_page_size(self.request)
#             }
#         })

# class IPAddressListView(APIView):
#     permission_classes = [IsAuthenticated]
#     pagination_class = IPAddressPagination
    
#     def get(self, request):
#         try:
#             queryset = IPAddress.objects.select_related('router', 'assigned_to').order_by('ip_address')
            
#             # Filtering
#             router_id = request.query_params.get('router')
#             if router_id and router_id.lower() != 'undefined':
#                 try:
#                     queryset = queryset.filter(router_id=int(router_id))
#                 except (ValueError, TypeError):
#                     return Response(
#                         {"error": "Invalid router ID"}, 
#                         status=status.HTTP_400_BAD_REQUEST
#                     )
            
#             status_filter = request.query_params.get('status')
#             if status_filter in ['available', 'assigned', 'reserved', 'blocked']:
#                 queryset = queryset.filter(status=status_filter.lower())
            
#             search_term = request.query_params.get('search')
#             if search_term:
#                 queryset = queryset.filter(
#                     Q(ip_address__icontains=search_term) |
#                     Q(description__icontains=search_term) |
#                     Q(subnet__icontains=search_term) |
#                     Q(assigned_to__full_name__icontains=search_term)
#                 )
            
#             # Pagination
#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(queryset, request)
            
#             serializer = IPAddressSerializer(page if page is not None else queryset, many=True)
            
#             if page is not None:
#                 return paginator.get_paginated_response(serializer.data)
            
#             return Response({
#                 'data': serializer.data,
#                 'meta': {
#                     'total': queryset.count(),
#                     'total_pages': 1,
#                     'current_page': 1,
#                     'per_page': queryset.count()
#                 }
#             })
            
#         except Exception as e:
#             return Response(
#                 {"error": f"Server error: {str(e)}"},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

#     def post(self, request):
#         try:
#             serializer = IPAddressSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response(
#                 {"error": str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class IPAddressDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         try:
#             return IPAddress.objects.get(pk=pk)
#         except IPAddress.DoesNotExist:
#             raise Http404

#     def get(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressSerializer(ip_address)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         ip_address = self.get_object(pk)
#         serializer = IPAddressSerializer(ip_address, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         ip_address = self.get_object(pk)
#         ip_address.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from network_management.models.ip_address_model import IPAddress, Subnet, DHCPLease
from network_management.models.router_management_model import Router
from network_management.serializers.ip_address_serializer import (
    IPAddressSerializer, IPAddressCreateSerializer,
    SubnetSerializer, DHCPLeaseSerializer
)

class IPAddressListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        router_id = request.query_params.get('router')
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

        ip_addresses = IPAddress.objects.all()

        # Validate router_id
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
            "total_items": paginator.count
        })

    def post(self, request):
        serializer = IPAddressCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IPAddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ip_address = get_object_or_404(IPAddress, pk=pk)
        serializer = IPAddressSerializer(ip_address)
        return Response(serializer.data)

    def put(self, request, pk):
        ip_address = get_object_or_404(IPAddress, pk=pk)
        serializer = IPAddressCreateSerializer(ip_address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        ip_address = get_object_or_404(IPAddress, pk=pk)
        ip_address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SubnetListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subnets = Subnet.objects.all()
        serializer = SubnetSerializer(subnets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SubnetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DHCPLeaseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        leases = DHCPLease.objects.all()
        serializer = DHCPLeaseSerializer(leases, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DHCPLeaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)