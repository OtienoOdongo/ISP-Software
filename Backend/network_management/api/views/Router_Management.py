from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from network_management.models.Router_Management import Router
from network_management.serializers.Router_Management import RouterSerializer
from librouteros import connect
import paramiko
import logging

# Set up logging
logger = logging.getLogger(__name__)

class RouterViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for managing MikroTik routers, providing CRUD operations 
    and custom actions for router management.

    Attributes:
        queryset: All Router instances.
        serializer_class: Serializer for Router model.
    """
    queryset = Router.objects.all()
    serializer_class = RouterSerializer

    def perform_create(self, serializer):
        """
        Override the create method to handle potential IntegrityError for duplicate entries.
        """
        try:
            serializer.save()
        except IntegrityError:
            raise ValidationError("A router with this name or IP already exists.")

    def get_router_api(self, router_id: int):
        """
        Connect to the MikroTik router using its API.

        :param router_id: The ID of the router to connect to.
        :return: An API connection object.
        :raises Exception: If connection fails.
        """
        router = get_object_or_404(Router, pk=router_id)
        try:
            api = connect(host=router.ip_address, username=router.username, password=router.password)
            return api
        except Exception as e:
            logger.error(f"Failed to connect to router API: {e}")
            raise Exception(f"Failed to connect to router: {e}")

    def get_router_ssh(self, router_id: int):
        """
        Connect to the MikroTik router using SSH.

        :param router_id: The ID of the router to connect to.
        :return: An SSH client object.
        :raises Exception: If SSH connection fails.
        """
        router = get_object_or_404(Router, pk=router_id)
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            ssh.connect(router.ip_address, username=router.username, password=router.password, timeout=30)
            return ssh
        except Exception as e:
            ssh.close()
            logger.error(f"SSH connection failed: {e}")
            raise Exception(f"SSH connection failed: {e}")

    def fetch_status(self, request, pk=None):
        """
        Fetch and update the status of a router.

        :param request: HTTP request object.
        :param pk: Primary key of the router to fetch status for.
        :return: Serialized router data with updated status.
        """
        router = self.get_object()
        try:
            api = self.get_router_api(pk)
            identity_cmd = api('/system identity print')
            resource_cmd = api('/system resource print')

            router.version = identity_cmd[0].get('version', 'Unknown')
            router.uptime = resource_cmd[0].get('uptime', 'Unknown')
            router.bandwidth = f"{resource_cmd[0].get('cpu-load', 'Unknown')}% CPU load"
            router.status = "Connected"
            router.save()

            return Response(RouterSerializer(router).data)
        except Exception as e:
            logger.error(f"Error fetching router status: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update_firmware(self, request, pk=None):
        """
        Initiate a firmware update for a router.

        :param request: HTTP request object with the firmware version to update to.
        :param pk: Primary key of the router to update.
        :return: Response with message about the update initiation.
        """
        router = self.get_object()
        new_version = request.data.get('firmware_version')
        if not new_version:
            return Response({"error": "Firmware version required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ssh = self.get_router_ssh(pk)
            stdin, stdout, stderr = ssh.exec_command(f'/system package update install version={new_version}')
            output = stdout.read().decode() + stderr.read().decode()
            ssh.close()
            router.version = new_version
            router.save()
            logger.info(f"Firmware update initiated for router {router.name}. Output: {output}")
            return Response({"message": f"Firmware update initiated. Output: {output}"})
        except Exception as e:
            logger.error(f"Error updating firmware: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def share_internet(self, request, pk=None):
        """
        Enable internet sharing on the router through NAT configuration.

        :param request: HTTP request object.
        :param pk: Primary key of the router to configure.
        :return: Response with confirmation message.
        """
        try:
            ssh = self.get_router_ssh(pk)
            stdin, stdout, stderr = ssh.exec_command(
                '/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade'
                )
            output = stdout.read().decode() + stderr.read().decode()
            ssh.close()
            logger.info(f"Internet sharing enabled for router {pk}. Output: {output}")
            return Response({"message": f"Internet sharing enabled. Output: {output}"})
        except Exception as e:
            logger.error(f"Error enabling internet sharing: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update_router_status(self, request, pk=None):
        """
        Update the connection status of a router.

        :param request: HTTP request object with the new status.
        :param pk: Primary key of the router to update.
        :return: Serialized data of the updated router.
        """
        router = self.get_object()
        status = request.data.get('status', 'Disconnected')
        router.status = status
        router.save()
        logger.info(f"Router {router.name} status updated to {status}.")
        return Response(RouterSerializer(router).data)
