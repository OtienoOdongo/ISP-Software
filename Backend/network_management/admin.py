from django.contrib import admin
from network_management.models.Bandwidth_Allocation import Device
from network_management.models.IP_Address_Management import IPAddress, Subnet 
from network_management.models.Network_Diagnostic import DiagnosticResult
from network_management.models.Router_Management import Router
from network_management.models.Security_Settings import (
    FirewallRule,
    VPNConnection,
    Port,
    GuestNetwork,
    UserSecurityProfile,
    RegisteredDevice,
    SoftwareUpdate,
)

admin.site.register(Device)
admin.site.register(IPAddress)
admin.site.register(Subnet)
admin.site.register(DiagnosticResult)
admin.site.register(Router)
admin.site.register(FirewallRule)
admin.site.register(VPNConnection)
admin.site.register(Port)
admin.site.register(GuestNetwork)
admin.site.register(UserSecurityProfile)
admin.site.register(RegisteredDevice)
admin.site.register(SoftwareUpdate)