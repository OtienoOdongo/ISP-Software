from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from network_management.models.IP_Address_Management import IPAddress, Subnet 
from network_management.serializers.IP_Address_Management import IPAddressSerializer, SubnetSerializer

class IPAddressViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing IP address instances.
    """
    queryset = IPAddress.objects.all()
    serializer_class = IPAddressSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search IP addresses by IP address or assigned entity.

        Query Parameters:
            search (str): The search term to filter IP addresses.

        Returns:
            Response: A list of IP addresses matching the search criteria.
        """
        search_term = request.GET.get('search', '')
        queryset = self.queryset.filter(
            Q(ip_address__icontains=search_term) | 
            Q(assigned_to__icontains=search_term)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put'])
    def update_ip(self, request, pk=None):
        """
        Update an existing IP address.

        URL: /ip-addresses/{pk}/update_ip/
        
        Body:
            - ip_address (str): The IP address to update.
            - status (str): Status of the IP address.
            - assigned_to (str): Entity or device assigned to this IP.
            - description (str): Brief description of the IP's use.
            - subnet (dict): Subnet details with network_address and netmask.

        Returns:
            Response: Updated IP address details or error message.
        """
        ip = self.get_object()
        serializer = self.get_serializer(ip, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_ip(self, request, pk=None):
        """
        Delete an IP address.

        URL: /ip-addresses/{pk}/delete_ip/

        Returns:
            Response: Confirmation of deletion or error if the IP address was not found.
        """
        ip = self.get_object()
        ip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SubnetViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing subnet instances.
    """
    queryset = Subnet.objects.all()
    serializer_class = SubnetSerializer