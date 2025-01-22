from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from network_management.models.Security_Settings import (
    FirewallRule,
    VPNConnection,
    Port,
    GuestNetwork,
    UserSecurityProfile,
    RegisteredDevice,
    SoftwareUpdate,
)
from network_management.serializers.Security_Settings import (
    FirewallRuleSerializer,
    VPNConnectionSerializer,
    PortSerializer,
    GuestNetworkSerializer,
    UserSecurityProfileSerializer,
    RegisteredDeviceSerializer,
    SoftwareUpdateSerializer,
)
import re

class SecuritySettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing security settings, including WiFi access control.

    Features:
        - Configure firewall, VPN, ports, guest networks, and security profiles.
        - Retrieve current security settings for an authenticated user.
        - Register and remove devices for WiFi access.
    """

    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    @action(detail=False, methods=['post'], name='Configure Security Settings')
    def configure(self, request):
        """
        Configure all security settings for the authenticated user.

        Expected Request Body:
            - firewall (list): List of firewall rules.
            - vpn (dict): VPN configuration details.
            - ports (list): List of port configurations.
            - guestNetwork (dict): Guest network settings.
            - twoFactorAuth (bool): Enable or disable two-factor authentication.
            - dnsEncryption (str): DNS encryption settings.
            - deviceLimit (int): Maximum number of devices allowed.
            - softwareUpdates (dict): Software update settings.

        Returns:
            - HTTP 200 with a success message on successful configuration.
            - HTTP 500 with an error message on failure.
        """
        user_profile = request.user.userprofile

        try:
            # Configure firewall rules
            FirewallRule.objects.filter(user_profile=user_profile).delete()
            for rule in request.data.get('firewall', []):
                FirewallRule.objects.create(user_profile=user_profile, **rule)

            # Configure VPN
            VPNConnection.objects.update_or_create(
                user_profile=user_profile,
                defaults=request.data.get('vpn', {})
            )

            # Configure ports
            Port.objects.filter(user_profile=user_profile).delete()
            for port in request.data.get('ports', []):
                Port.objects.create(user_profile=user_profile, **port)

            # Configure guest network
            guest_network_data = request.data.get('guestNetwork', {})
            GuestNetwork.objects.update_or_create(
                user_profile=user_profile, defaults=guest_network_data
            )

            # Update security profile
            profile, _ = UserSecurityProfile.objects.get_or_create(user_profile=user_profile)
            profile.two_factor_auth = request.data.get('twoFactorAuth', False)
            profile.dns_encryption = request.data.get('dnsEncryption', 'Disabled')
            profile.device_limit = request.data.get('deviceLimit', 2)
            profile.save()

            # Configure software updates
            SoftwareUpdate.objects.update_or_create(
                user_profile=user_profile, defaults=request.data.get('softwareUpdates', {})
            )

            return Response({"status": "Security settings configured successfully"}, 
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], name='Get Security Settings')
    def retrieve_settings(self, request):
        """
        Retrieve all security settings for the authenticated user.

        Returns:
            - HTTP 200 with the current security settings.
        """
        user_profile = request.user.userprofile
        data = {
            'firewall': FirewallRuleSerializer(FirewallRule.objects.filter(user_profile=user_profile), many=True).data,
            'vpn': VPNConnectionSerializer(VPNConnection.objects.filter(user_profile=user_profile).first()).data,
            'ports': PortSerializer(Port.objects.filter(user_profile=user_profile), many=True).data,
            'guestNetwork': GuestNetworkSerializer(GuestNetwork.objects.filter(user_profile=user_profile).first()).data,
            'securityProfile': UserSecurityProfileSerializer(UserSecurityProfile.objects.get(user_profile=user_profile)).data,
            'registeredDevices': RegisteredDeviceSerializer(RegisteredDevice.objects.filter(user_profile=user_profile), many=True).data,
            'softwareUpdates': SoftwareUpdateSerializer(SoftwareUpdate.objects.filter(user_profile=user_profile).first()).data,
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], name='Register Device')
    def register_device(self, request):
        """
        Register a new device for WiFi access.

        Expected Request Body:
            - mac_address (str): MAC address of the device to register.

        Returns:
            - HTTP 201 on successful registration.
            - HTTP 400 if MAC address is missing, invalid, or device limit is reached.
        """
        user_profile = request.user.userprofile
        mac_address = request.data.get('mac_address')

        if not mac_address:
            return Response({"error": "MAC address is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not self.is_valid_mac_address(mac_address):
            return Response({"error": "Invalid MAC address format."}, status=status.HTTP_400_BAD_REQUEST)

        profile = UserSecurityProfile.objects.get(user_profile=user_profile)
        if RegisteredDevice.objects.filter(user_profile=user_profile).count() >= profile.device_limit:
            return Response({"error": "Device limit reached."}, status=status.HTTP_400_BAD_REQUEST)

        RegisteredDevice.objects.create(user_profile=user_profile, mac_address=mac_address)
        return Response({"status": "Device registered successfully."}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], name='Remove Device')
    def remove_device(self, request):
        """
        Remove a registered device for WiFi access.

        Expected Request Body:
            - mac_address (str): MAC address of the device to remove.

        Returns:
            - HTTP 200 on successful removal.
            - HTTP 400 if MAC address is missing.
            - HTTP 404 if the device is not found.
        """
        user_profile = request.user.userprofile
        mac_address = request.data.get('mac_address')

        if not mac_address:
            return Response({"error": "MAC address is required."}, status=status.HTTP_400_BAD_REQUEST)

        device = RegisteredDevice.objects.filter(user_profile=user_profile, mac_address=mac_address).first()
        if device:
            device.delete()
            return Response({"status": "Device removed successfully."}, status=status.HTTP_200_OK)

        return Response({"error": "Device not found."}, status=status.HTTP_404_NOT_FOUND)

    def is_valid_mac_address(self, mac):
        """
        Validate whether a given MAC address is in a valid format.

        A valid MAC address matches one of the following formats:
            - XX:XX:XX:XX:XX:XX (colon-separated)
            - XX-XX-XX-XX-XX-XX (dash-separated)
            - XXXXXXXXXXXX (12 contiguous hexadecimal digits)

        Args:
            mac (str): The MAC address to validate.

        Returns:
            bool: True if the MAC address is valid, False otherwise.

        Example:
            >>> is_valid_mac_address("00:1A:2B:3C:4D:5E")
            True
            >>> is_valid_mac_address("001A2B3C4D5E")
            True
            >>> is_valid_mac_address("invalid-mac")
            False
        """
        pattern = r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^[0-9A-Fa-f]{12}$'
        return re.match(pattern, mac) is not None
