

# from django.db import models
# from django.utils import timezone
# from network_management.models.router_management_model import Router
# from account.models.admin_model import Client
# from routeros_api import RouterOsApiPool

# class IPAddress(models.Model):
#     STATUS_CHOICES = (
#         ('available', 'Available'),
#         ('assigned', 'Assigned'),
#         ('reserved', 'Reserved'),
#         ('blocked', 'Blocked'),
#     )
    
#     PRIORITY_CHOICES = (
#         ('high', 'High'),
#         ('medium', 'Medium'),
#         ('low', 'Low'),
#     )
    
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='ip_addresses')
#     ip_address = models.GenericIPAddressField(unique=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
#     assigned_to = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
#     description = models.TextField(blank=True)
#     subnet = models.CharField(max_length=18)
#     bandwidth_limit = models.CharField(max_length=20, blank=True)
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
#     last_used = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.ip_address} ({self.status})"

#     def assign_to_router(self, interface='bridge'):
#         if self.status != 'available':
#             raise ValueError("IP is not available for assignment")
#         try:
#             api = RouterOsApiPool(
#                 self.router.ip,
#                 username=self.router.username,
#                 password=self.router.password,
#                 port=self.router.port
#             ).get_api()
#             ip_resource = api.get_resource('/ip/address')
#             ip_resource.add(
#                 address=self.ip_address,
#                 network=self.subnet.split('/')[0],
#                 interface=interface
#             )
#             api.close()
#             self.status = 'assigned'
#             self.last_used = timezone.now()
#             self.save()
#         except Exception as e:
#             raise Exception(f"Failed to assign IP to router: {str(e)}")

# class Subnet(models.Model):
#     router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='subnets')
#     network_address = models.GenericIPAddressField()
#     netmask = models.CharField(max_length=18)
#     description = models.TextField(blank=True)
#     vlan_id = models.PositiveIntegerField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.network_address}/{self.netmask}"

#     def configure_on_router(self):
#         try:
#             api = RouterOsApiPool(
#                 self.router.ip,
#                 username=self.router.username,
#                 password=self.router.password,
#                 port=self.router.port
#             ).get_api()
#             ip_resource = api.get_resource('/ip/address')
#             ip_resource.add(
#                 address=f"{self.network_address}/{self.netmask}",
#                 interface='bridge' if not self.vlan_id else f'vlan{self.vlan_id}',
#                 network=self.network_address
#             )
#             api.close()
#         except Exception as e:
#             raise Exception(f"Failed to configure subnet on router: {str(e)}")
        
# class DHCPLease(models.Model):
#     ip_address = models.ForeignKey(IPAddress, on_delete=models.CASCADE, related_name='dhcp_leases')
#     mac_address = models.CharField(max_length=17)
#     client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
#     lease_time = models.PositiveIntegerField(default=3600)
#     expires_at = models.DateTimeField()
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.ip_address} - {self.mac_address}"

#     def configure_on_router(self):
#         try:
#             api = RouterOsApiPool(
#                 self.ip_address.router.ip,
#                 username=self.ip_address.router.username,
#                 password=self.ip_address.router.password,
#                 port=self.ip_address.router.port
#             ).get_api()
#             dhcp_resource = api.get_resource('/ip/dhcp-server/lease')
#             dhcp_resource.add(
#                 address=self.ip_address.ip_address,
#                 mac_address=self.mac_address,
#                 lease_time=str(self.lease_time),
#                 comment=f"Lease for {self.client.full_name if self.client else 'Unknown'}"
#             )
#             api.close()
#         except Exception as e:
#             raise Exception(f"Failed to configure DHCP lease: {str(e)}")







from django.db import models
from django.utils import timezone
from network_management.models.router_management_model import Router
from account.models.admin_model import Client
from routeros_api import RouterOsApiPool
import ipaddress

class IPAddress(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('reserved', 'Reserved'),
        ('blocked', 'Blocked'),
    )
    
    PRIORITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )
    
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='ip_addresses')
    ip_address = models.GenericIPAddressField(unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='available')
    assigned_to = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    subnet = models.CharField(max_length=18)
    bandwidth_limit = models.CharField(max_length=20, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    last_used = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'status']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ip_address} ({self.status})"

    def clean(self):
        """Validate IP address and subnet consistency"""
        try:
            ip = ipaddress.ip_address(self.ip_address)
            network = ipaddress.ip_network(self.subnet, strict=False)
            
            if ip not in network:
                raise ValidationError(f"IP address {self.ip_address} is not within subnet {self.subnet}")
                
        except ValueError as e:
            raise ValidationError(f"Invalid IP address or subnet: {str(e)}")

    def assign_to_router(self, interface='bridge'):
        """Assign IP address to router interface"""
        if self.status != 'available':
            raise ValueError("IP is not available for assignment")
        
        try:
            api = RouterOsApiPool(
                self.router.ip,
                username=self.router.username,
                password=self.router.password,
                port=self.router.port
            ).get_api()
            
            ip_resource = api.get_resource('/ip/address')
            ip_resource.add(
                address=self.ip_address,
                network=self.subnet.split('/')[0],
                interface=interface,
                comment=f"Assigned to {self.assigned_to.full_name if self.assigned_to else 'Unknown'}"
            )
            api.close()
            
            self.status = 'assigned'
            self.last_used = timezone.now()
            self.save()
            
        except Exception as e:
            raise Exception(f"Failed to assign IP to router: {str(e)}")

    def release_from_router(self):
        """Release IP address from router"""
        try:
            api = RouterOsApiPool(
                self.router.ip,
                username=self.router.username,
                password=self.router.password,
                port=self.router.port
            ).get_api()
            
            ip_resource = api.get_resource('/ip/address')
            addresses = ip_resource.get(address=self.ip_address)
            
            if addresses:
                ip_resource.remove(id=addresses[0]['id'])
            
            api.close()
            
            self.status = 'available'
            self.assigned_to = None
            self.save()
            
        except Exception as e:
            raise Exception(f"Failed to release IP from router: {str(e)}")

class Subnet(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='subnets')
    network_address = models.GenericIPAddressField()
    netmask = models.CharField(max_length=18)
    description = models.TextField(blank=True)
    vlan_id = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['router', 'is_active']),
            models.Index(fields=['network_address']),
        ]
        unique_together = ['router', 'network_address', 'netmask']

    def __str__(self):
        return f"{self.network_address}/{self.netmask}"

    def clean(self):
        """Validate subnet configuration"""
        try:
            network = ipaddress.ip_network(f"{self.network_address}/{self.netmask}", strict=False)
            self.network_address = str(network.network_address)
            self.netmask = str(network.netmask)
        except ValueError as e:
            raise ValidationError(f"Invalid network address or netmask: {str(e)}")

    def configure_on_router(self):
        """Configure subnet on router"""
        try:
            api = RouterOsApiPool(
                self.router.ip,
                username=self.router.username,
                password=self.router.password,
                port=self.router.port
            ).get_api()
            
            ip_resource = api.get_resource('/ip/address')
            ip_resource.add(
                address=f"{self.network_address}/{self.netmask}",
                interface='bridge' if not self.vlan_id else f'vlan{self.vlan_id}',
                network=self.network_address,
                comment=self.description
            )
            api.close()
            
        except Exception as e:
            raise Exception(f"Failed to configure subnet on router: {str(e)}")

    def get_available_ips(self):
        """Get list of available IP addresses in subnet"""
        try:
            network = ipaddress.ip_network(f"{self.network_address}/{self.netmask}")
            used_ips = set(IPAddress.objects.filter(
                router=self.router,
                subnet=str(network)
            ).values_list('ip_address', flat=True))
            
            available_ips = []
            for ip in network.hosts():
                if str(ip) not in used_ips:
                    available_ips.append(str(ip))
                    
            return available_ips
        except ValueError:
            return []

class DHCPLease(models.Model):
    ip_address = models.ForeignKey(IPAddress, on_delete=models.CASCADE, related_name='dhcp_leases')
    mac_address = models.CharField(max_length=17)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    lease_time = models.PositiveIntegerField(default=3600)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['ip_address', 'is_active']),
            models.Index(fields=['mac_address']),
            models.Index(fields=['expires_at']),
        ]
        unique_together = ['ip_address', 'mac_address']

    def __str__(self):
        return f"{self.ip_address} - {self.mac_address}"

    def clean(self):
        """Validate MAC address format"""
        import re
        if not re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', self.mac_address):
            raise ValidationError("Invalid MAC address format")

    def configure_on_router(self):
        """Configure DHCP lease on router"""
        try:
            api = RouterOsApiPool(
                self.ip_address.router.ip,
                username=self.ip_address.router.username,
                password=self.ip_address.router.password,
                port=self.ip_address.router.port
            ).get_api()
            
            dhcp_resource = api.get_resource('/ip/dhcp-server/lease')
            dhcp_resource.add(
                address=self.ip_address.ip_address,
                mac_address=self.mac_address,
                lease_time=str(self.lease_time),
                comment=f"Lease for {self.client.full_name if self.client else 'Unknown'}"
            )
            api.close()
            
        except Exception as e:
            raise Exception(f"Failed to configure DHCP lease: {str(e)}")

    def is_expired(self):
        """Check if lease has expired"""
        return timezone.now() > self.expires_at