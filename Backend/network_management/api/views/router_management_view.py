from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from network_management.models.router_management_model import Router
from network_management.serializers.router_management_serializer import RouterSerializer
import paramiko
import logging
from io import StringIO
from cryptography.hazmat.primitives import serialization as crypto_serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

logger = logging.getLogger(__name__)

class RouterBaseView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Router.objects.get(pk=pk)
        except Router.DoesNotExist:
            return None

    def generate_ssh_key_pair(self):
        """Generate an RSA key pair."""
        try:
            key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=4096,
                backend=default_backend()
            )
            private_key = key.private_bytes(
                encoding=crypto_serialization.Encoding.PEM,
                format=crypto_serialization.PrivateFormat.PKCS8,
                encryption_algorithm=crypto_serialization.NoEncryption()
            ).decode('utf-8')
            public_key = key.public_key().public_bytes(
                encoding=crypto_serialization.Encoding.OpenSSH,
                format=crypto_serialization.PublicFormat.OpenSSH
            ).decode('utf-8')
            return private_key, public_key
        except Exception as e:
            logger.error(f"SSH key generation failed: {str(e)}")
            raise Exception(f"SSH key generation failed: {str(e)}")

    def get_ssh_client(self, router, initial_password=None):
        """Establish an SSH connection to the MikroTik router."""
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            if initial_password:  # For initial connection to deploy key
                ssh.connect(
                    hostname=router.host,
                    username=router.user,
                    password=initial_password,
                    port=router.port,
                    look_for_keys=False,
                    allow_agent=False
                )
            else:  # Use stored SSH key
                pkey = paramiko.RSAKey.from_private_key(StringIO(router.ssh_key))
                ssh.connect(
                    hostname=router.host,
                    username=router.user,
                    pkey=pkey,
                    port=router.port,
                    look_for_keys=False,
                    allow_agent=False
                )
            return ssh
        except Exception as e:
            logger.error(f"SSH connection failed for {router.name} ({router.host}): {str(e)}")
            raise Exception(f"SSH connection failed: {str(e)}")

    def execute_ssh_command(self, ssh, command):
        """Execute a command over SSH and return the output."""
        try:
            stdin, stdout, stderr = ssh.exec_command(command)
            output = stdout.read().decode('utf-8').strip()
            error = stderr.read().decode('utf-8').strip()
            if error:
                raise Exception(f"Command failed: {error}")
            return output
        except Exception as e:
            logger.error(f"SSH command '{command}' failed: {str(e)}")
            raise Exception(f"Command execution failed: {str(e)}")

    def deploy_ssh_key(self, ssh, public_key, router):
        """Deploy the public key to the MikroTik router."""
        try:
            sftp = ssh.open_sftp()
            with sftp.file('temp.pub', 'w') as f:
                f.write(public_key)
            sftp.close()
            self.execute_ssh_command(ssh, f'/user ssh-keys import public-key-file=temp.pub user={router.user}')
            self.execute_ssh_command(ssh, '/file remove temp.pub')
            logger.info(f"Deployed SSH key to {router.name} ({router.host})")
        except Exception as e:
            logger.error(f"SSH key deployment failed for {router.name}: {str(e)}")
            raise Exception(f"SSH key deployment failed: {str(e)}")

    def fetch_router_data(self, ssh, router):
        """Fetch real-time data from the MikroTik router via SSH."""
        try:
            identity = self.execute_ssh_command(ssh, '/system identity print')
            resource = self.execute_ssh_command(ssh, '/system resource print')
            hotspot = self.execute_ssh_command(ssh, '/ip hotspot active print count-only')

            data = {
                'name': identity.split('name: ')[1].split('\n')[0],
                'status': 'Connected',
                'uptime': resource.split('uptime: ')[1].split('\n')[0],
                'version': resource.split('version: ')[1].split('\n')[0],
                'bandwidth': resource.split('free-memory: ')[1].split('\n')[0].replace('MiB', 'MB'),
                'cpu_usage': int(resource.split('cpu-load: ')[1].split('%')[0]),
                'active_clients': int(hotspot) if hotspot.isdigit() else 0,
            }
            return data
        except Exception as e:
            logger.error(f"Failed to fetch data for {router.name}: {str(e)}")
            raise Exception(f"Data fetch failed: {str(e)}")

class RouterListCreateView(RouterBaseView):
    def get(self, request):
        routers = Router.objects.all()
        serializer = RouterSerializer(routers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new router, generate SSH keys, and deploy them."""
        initial_password = request.data.get('initial_password')  # Temporary password for first connection
        serializer = RouterSerializer(data=request.data)
        if serializer.is_valid():
            router = serializer.save()
            try:
                # Generate SSH key pair
                private_key, public_key = self.generate_ssh_key_pair()
                router.ssh_key = private_key
                router.ssh_pub_key = public_key

                # Connect with initial password to deploy key
                ssh = self.get_ssh_client(router, initial_password=initial_password)
                self.deploy_ssh_key(ssh, public_key, router)
                
                # Verify connection with new key
                ssh.close()
                ssh = self.get_ssh_client(router)
                data = self.fetch_router_data(ssh, router)
                for key, value in data.items():
                    setattr(router, key, value)
                router.save()
                ssh.close()

                logger.info(f"Created and configured router: {router.name} ({router.host})")
                return Response(RouterSerializer(router).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                router.delete()  # Clean up if setup fails
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RouterDetailView(RouterBaseView):
    def get(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RouterSerializer(router)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = RouterSerializer(router, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Updated router: {router.name} ({router.host})")
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        router_name = router.name
        router.delete()
        logger.info(f"Deleted router: {router_name}")
        return Response(status=status.HTTP_204_NO_CONTENT)

class RouterConnectView(RouterBaseView):
    def post(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            ssh = self.get_ssh_client(router)
            data = self.fetch_router_data(ssh, router)
            for key, value in data.items():
                setattr(router, key, value)
            router.save()
            ssh.close()
            logger.info(f"Connected to router: {router.name} ({router.host})")
            return Response(RouterSerializer(router).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterDisconnectView(RouterBaseView):
    def post(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        router.status = 'Disconnected'
        router.uptime = 'N/A'
        router.cpu_usage = 0
        router.active_clients = 0
        router.save()
        logger.info(f"Disconnected router: {router.name} ({router.host})")
        return Response(RouterSerializer(router).data, status=status.HTTP_200_OK)

class RouterStatusView(RouterBaseView):
    def get(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        if router.status != 'Connected':
            return Response(RouterSerializer(router).data, status=status.HTTP_200_OK)
        try:
            ssh = self.get_ssh_client(router)
            data = self.fetch_router_data(ssh, router)
            for key, value in data.items():
                setattr(router, key, value)
            router.save()
            ssh.close()
            logger.info(f"Refreshed status for router: {router.name} ({router.host})")
            return Response(RouterSerializer(router).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterFirmwareView(RouterBaseView):
    def post(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        version = request.data.get('version')
        if not version:
            return Response({"error": "Firmware version required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ssh = self.get_ssh_client(router)
            self.execute_ssh_command(ssh, f'/system package update set channel=stable version={version}')
            self.execute_ssh_command(ssh, '/system package update install')
            router.version = version
            router.save()
            ssh.close()
            logger.info(f"Updated firmware for {router.name} to version {version}")
            return Response(RouterSerializer(router).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Firmware update failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterShareInternetView(RouterBaseView):
    def post(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        plan_id = request.data.get('plan_id')
        try:
            ssh = self.get_ssh_client(router)
            self.execute_ssh_command(ssh, '/ip firewall nat add chain=srcnat action=masquerade out-interface=ether1')
            if plan_id:
                from internet_plans.models.create_plan_models import InternetPlan
                plan = InternetPlan.objects.filter(id=plan_id).first()
                if plan:
                    profile_name = plan.name.lower().replace(' ', '_')
                    self.execute_ssh_command(ssh, f'/ip hotspot user add name=client_{int(__import__("time").time())} profile={profile_name} limit-uptime={plan.expiry_value}{plan.expiry_unit[0]}')
                    logger.info(f"Assigned plan '{plan.name}' to new client on {router.name}")
            ssh.close()
            logger.info(f"Enabled internet sharing on {router.name}")
            return Response({"message": "Internet sharing enabled"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Internet sharing failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterExportView(RouterBaseView):
    def get(self, request, pk):
        router = self.get_object(pk)
        if not router:
            return Response({"error": "Router not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            ssh = self.get_ssh_client(router)
            config = self.execute_ssh_command(ssh, '/export')
            ssh.close()
            logger.info(f"Exported config for {router.name}")
            return Response({'config': config}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RouterImportView(RouterBaseView):
    def post(self, request, pk):
        router = self.get_object(pk)
        if not router or 'file' not in request.FILES:
            return Response({"error": "Router or file not found"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ssh = self.get_ssh_client(router)
            script = request.FILES['file'].read().decode('utf-8')
            sftp = ssh.open_sftp()
            with sftp.file('temp.rsc', 'w') as f:
                f.write(script)
            sftp.close()
            self.execute_ssh_command(ssh, '/import file=temp.rsc')
            data = self.fetch_router_data(ssh, router)
            for key, value in data.items():
                setattr(router, key, value)
            router.save()
            ssh.close()
            logger.info(f"Imported config for {router.name}")
            return Response(RouterSerializer(router).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)