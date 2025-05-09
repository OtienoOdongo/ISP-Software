# from django.db import models
# from django.utils import timezone
# from network_management.models.router_management_model import Router
# from account.models.admin_model import Client

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
#     subnet = models.CharField(max_length=18)  # e.g., "192.168.1.0/24"
#     bandwidth_limit = models.CharField(max_length=20, blank=True)  # e.g., "100Mbps"
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
#     last_used = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.ip_address} ({self.status})"

# class Subnet(models.Model):
#     network_address = models.GenericIPAddressField()
#     netmask = models.GenericIPAddressField()
#     description = models.TextField(blank=True)
#     vlan_id = models.PositiveIntegerField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"{self.network_address}/{self.netmask}"

# class DHCPLease(models.Model):
#     ip_address = models.ForeignKey(IPAddress, on_delete=models.CASCADE, related_name='dhcp_leases')
#     mac_address = models.CharField(max_length=17)
#     client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
#     lease_time = models.PositiveIntegerField()  # in seconds
#     expires_at = models.DateTimeField()
#     created_at = models.DateTimeField(default=timezone.now)

#     def __str__(self):
#         return f"{self.ip_address} - {self.mac_address}"






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
#     subnet = models.CharField(max_length=18)  # e.g., "192.168.1.0/24"
#     bandwidth_limit = models.CharField(max_length=20, blank=True)  # e.g., "100Mbps"
#     priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
#     last_used = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.ip_address} ({self.status})"

#     def assign_to_router(self, interface='bridge'):
#         """Assign this IP to the router via MikroTik API."""
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
#     netmask = models.CharField(max_length=18)  # e.g., "255.255.255.0" or "/24"
#     description = models.TextField(blank=True)
#     vlan_id = models.PositiveIntegerField(null=True, blank=True)
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.network_address}/{self.netmask}"

#     def configure_on_router(self):
#         """Configure subnet on the MikroTik router."""
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
#     mac_address = models.CharField(max_length=17)  # e.g., "00:11:22:33:44:55"
#     client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
#     lease_time = models.PositiveIntegerField(default=3600)  # in seconds
#     expires_at = models.DateTimeField()
#     created_at = models.DateTimeField(default=timezone.now)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.ip_address} - {self.mac_address}"

#     def configure_on_router(self):
#         """Configure DHCP lease on the MikroTik router."""
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

    def __str__(self):
        return f"{self.ip_address} ({self.status})"

    def assign_to_router(self, interface='bridge'):
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
                interface=interface
            )
            api.close()
            self.status = 'assigned'
            self.last_used = timezone.now()
            self.save()
        except Exception as e:
            raise Exception(f"Failed to assign IP to router: {str(e)}")

class Subnet(models.Model):
    router = models.ForeignKey(Router, on_delete=models.CASCADE, related_name='subnets')
    network_address = models.GenericIPAddressField()
    netmask = models.CharField(max_length=18)
    description = models.TextField(blank=True)
    vlan_id = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.network_address}/{self.netmask}"

    def configure_on_router(self):
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
                network=self.network_address
            )
            api.close()
        except Exception as e:
            raise Exception(f"Failed to configure subnet on router: {str(e)}")
        
class DHCPLease(models.Model):
    ip_address = models.ForeignKey(IPAddress, on_delete=models.CASCADE, related_name='dhcp_leases')
    mac_address = models.CharField(max_length=17)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    lease_time = models.PositiveIntegerField(default=3600)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ip_address} - {self.mac_address}"

    def configure_on_router(self):
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





