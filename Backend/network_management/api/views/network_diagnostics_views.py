# import subprocess
# import json
# import re
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestResult, HealthCheckResult
# from network_management.serializers.network_diagnostics_serializer import (
#     DiagnosticTestSerializer,
#     DiagnosticTestCreateSerializer,
#     SpeedTestResultSerializer,
#     HealthCheckResultSerializer
# )
# from django.shortcuts import get_object_or_404
# from routeros_api import RouterOsApiPool
# from django.utils import timezone

# class DiagnosticTestView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         tests = DiagnosticTest.objects.all().order_by('-started_at')[:50]
#         serializer = DiagnosticTestSerializer(tests, many=True)
#         return Response(serializer.data)
    
#     def post(self, request):
#         serializer = DiagnosticTestCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             try:
#                 test = serializer.save(status='running')
                
#                 # Run the appropriate test based on type
#                 if test.test_type == 'ping':
#                     self.run_ping_test(test)
#                 elif test.test_type == 'traceroute':
#                     self.run_traceroute_test(test)
#                 elif test.test_type == 'speedtest':
#                     self.run_speed_test(test)
#                 elif test.test_type == 'dns':
#                     self.run_dns_test(test)
#                 elif test.test_type == 'packet_loss':
#                     self.run_packet_loss_test(test)
#                 elif test.test_type == 'health_check':
#                     self.run_health_check(test)
                
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 test.status = 'failed'
#                 test.result = {'error': str(e)}
#                 test.completed_at = timezone.now()
#                 test.save()
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#     def run_ping_test(self, test):
#         try:
#             # Run ping command (Linux/Mac)
#             result = subprocess.run(
#                 ['ping', '-c', '4', test.target],
#                 capture_output=True,
#                 text=True
#             )
            
#             # Parse ping output
#             if result.returncode == 0:
#                 match = re.search(r'min/avg/max/stddev = (\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)', result.stdout)
#                 if match:
#                     test.result = {
#                         'min': float(match.group(1)),
#                         'avg': float(match.group(2)),
#                         'max': float(match.group(3)),
#                         'stddev': float(match.group(4))
#                     }
#                     test.status = 'success'
#                 else:
#                     test.result = {'error': 'Could not parse ping results'}
#                     test.status = 'failed'
#             else:
#                 test.result = {'error': result.stderr}
#                 test.status = 'failed'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()
    
#     def run_traceroute_test(self, test):
#         try:
#             # Run traceroute command (Linux/Mac)
#             result = subprocess.run(
#                 ['traceroute', test.target],
#                 capture_output=True,
#                 text=True
#             )
            
#             if result.returncode == 0:
#                 hops = []
#                 for line in result.stdout.split('\n')[1:]:
#                     if not line.strip():
#                         continue
#                     parts = line.split()
#                     hop = {
#                         'hop': parts[0],
#                         'ip': parts[1] if parts[1] != '*' else None,
#                         'time': ' '.join(parts[2:]) if len(parts) > 2 else None
#                     }
#                     hops.append(hop)
                
#                 test.result = {'hops': hops}
#                 test.status = 'success'
#             else:
#                 test.result = {'error': result.stderr}
#                 test.status = 'failed'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()
    
#     def run_speed_test(self, test):
#         try:
#             # Run speedtest-cli (needs to be installed)
#             result = subprocess.run(
#                 ['speedtest-cli', '--json'],
#                 capture_output=True,
#                 text=True
#             )
            
#             if result.returncode == 0:
#                 data = json.loads(result.stdout)
#                 speed_test = SpeedTestResult.objects.create(
#                     test=test,
#                     download_speed=data['download'] / 1000000,  # Convert to Mbps
#                     upload_speed=data['upload'] / 1000000,      # Convert to Mbps
#                     latency=data['ping'],
#                     jitter=0,  # Not provided by speedtest-cli
#                     server=data['server']['name'],
#                     isp=data['client']['isp']
#                 )
                
#                 test.result = {
#                     'download': speed_test.download_speed,
#                     'upload': speed_test.upload_speed,
#                     'latency': speed_test.latency,
#                     'server': speed_test.server,
#                     'isp': speed_test.isp
#                 }
#                 test.status = 'success'
#             else:
#                 test.result = {'error': result.stderr}
#                 test.status = 'failed'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()
    
#     def run_dns_test(self, test):
#         try:
#             import socket
#             result = socket.gethostbyname_ex(test.target)
            
#             test.result = {
#                 'hostname': result[0],
#                 'aliases': result[1],
#                 'addresses': result[2]
#             }
#             test.status = 'success'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()
    
#     def run_packet_loss_test(self, test):
#         try:
#             # Run ping command with packet count (Linux/Mac)
#             result = subprocess.run(
#                 ['ping', '-c', '100', test.target],
#                 capture_output=True,
#                 text=True
#             )
            
#             if result.returncode == 0:
#                 # Parse packet loss percentage
#                 match = re.search(r'(\d+)% packet loss', result.stdout)
#                 if match:
#                     packet_loss = int(match.group(1))
                    
#                     # Parse round-trip times
#                     rtt_match = re.search(r'min/avg/max/stddev = (\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)', result.stdout)
#                     rtt = {
#                         'min': float(rtt_match.group(1)) if rtt_match else None,
#                         'avg': float(rtt_match.group(2)) if rtt_match else None,
#                         'max': float(rtt_match.group(3)) if rtt_match else None,
#                         'stddev': float(rtt_match.group(4)) if rtt_match else None
#                     }
                    
#                     test.result = {
#                         'packet_loss': packet_loss,
#                         'rtt': rtt
#                     }
#                     test.status = 'success'
#                 else:
#                     test.result = {'error': 'Could not parse packet loss results'}
#                     test.status = 'failed'
#             else:
#                 test.result = {'error': result.stderr}
#                 test.status = 'failed'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()
    
#     def run_health_check(self, test):
#         try:
#             api = RouterOsApiPool(
#                 test.router.ip, 
#                 username=test.router.username, 
#                 password=test.router.password, 
#                 port=test.router.port
#             ).get_api()
            
#             # Get system resources
#             resources = api.get_resource('/system/resource').get()[0]
            
#             # Get services status
#             services = api.get_resource('/ip/service').get()
            
#             # Get interface status
#             interfaces = api.get_resource('/interface').get()
            
#             api.close()
            
#             # Create health check result
#             health_check = HealthCheckResult.objects.create(
#                 test=test,
#                 services=services,
#                 cpu_usage=float(resources['cpu-load']),
#                 memory_usage=(1 - (float(resources['free-memory']) / float(resources['total-memory']))) * 100,
#                 disk_usage=(1 - (float(resources['free-hdd-space']) / float(resources['total-hdd-space']))) * 100
#             )
            
#             test.result = {
#                 'cpu_usage': health_check.cpu_usage,
#                 'memory_usage': health_check.memory_usage,
#                 'disk_usage': health_check.disk_usage,
#                 'services': health_check.services
#             }
#             test.status = 'success'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()

# class DiagnosticTestDetailView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get_object(self, pk):
#         return get_object_or_404(DiagnosticTest, pk=pk)
    
#     def get(self, request, pk):
#         test = self.get_object(pk)
#         serializer = DiagnosticTestSerializer(test)
#         return Response(serializer.data)

# class BulkDiagnosticsView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         router_id = request.data.get('router_id')
#         target = request.data.get('target', '')
#         client_ip = request.data.get('client_ip', '')
        
#         if not router_id:
#             return Response({"error": "router_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             tests = []
            
#             # Run ping test
#             ping_test = DiagnosticTest.objects.create(
#                 router_id=router_id,
#                 test_type='ping',
#                 target=target,
#                 status='running'
#             )
#             self.run_ping_test(ping_test)
#             tests.append(ping_test)
            
#             # Run traceroute test
#             traceroute_test = DiagnosticTest.objects.create(
#                 router_id=router_id,
#                 test_type='traceroute',
#                 target=target,
#                 status='running'
#             )
#             self.run_traceroute_test(traceroute_test)
#             tests.append(traceroute_test)
            
#             # Run DNS test
#             dns_test = DiagnosticTest.objects.create(
#                 router_id=router_id,
#                 test_type='dns',
#                 target=target,
#                 status='running'
#             )
#             self.run_dns_test(dns_test)
#             tests.append(dns_test)
            
#             # Run packet loss test
#             packet_loss_test = DiagnosticTest.objects.create(
#                 router_id=router_id,
#                 test_type='packet_loss',
#                 target=target,
#                 status='running'
#             )
#             self.run_packet_loss_test(packet_loss_test)
#             tests.append(packet_loss_test)
            
#             # Run health check
#             health_check_test = DiagnosticTest.objects.create(
#                 router_id=router_id,
#                 test_type='health_check',
#                 status='running'
#             )
#             self.run_health_check(health_check_test)
#             tests.append(health_check_test)
            
#             # Run speed tests if client IP provided
#             if client_ip:
#                 speed_test = DiagnosticTest.objects.create(
#                     router_id=router_id,
#                     test_type='speedtest',
#                     status='running'
#                 )
#                 self.run_speed_test(speed_test)
#                 tests.append(speed_test)
            
#             serializer = DiagnosticTestSerializer(tests, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)





# import subprocess
# import json
# import re
# import socket
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from routeros_api import RouterOsApiPool

# from network_management.models.network_diagnostics_model import (
#     DiagnosticTest, SpeedTestResult, HealthCheckResult
# )
# from network_management.serializers.network_diagnostics_serializer import (
#     DiagnosticTestSerializer, DiagnosticTestCreateSerializer
# )


# class DiagnosticTestView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         tests = DiagnosticTest.objects.all().order_by('-started_at')[:50]
#         serializer = DiagnosticTestSerializer(tests, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DiagnosticTestCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             test = serializer.save(status='running')
#             try:
#                 self.dispatch_test(test)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 test.status = 'failed'
#                 test.result = {'error': str(e)}
#                 test.completed_at = timezone.now()
#                 test.save()
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def dispatch_test(self, test):
#         test_type_map = {
#             'ping': self.run_ping_test,
#             'traceroute': self.run_traceroute_test,
#             'speedtest': self.run_speed_test,
#             'dns': self.run_dns_test,
#             'packet_loss': self.run_packet_loss_test,
#             'health_check': self.run_health_check
#         }
#         if test.test_type in test_type_map:
#             test_type_map[test.test_type](test)
#         else:
#             raise ValueError(f"Unknown test type: {test.test_type}")

#     def run_ping_test(self, test):
#         try:
#             result = subprocess.run(['ping', '-c', '4', test.target], capture_output=True, text=True)
#             if result.returncode == 0:
#                 match = re.search(r'min/avg/max/stddev = (\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)', result.stdout)
#                 if match:
#                     test.result = {
#                         'min': float(match.group(1)),
#                         'avg': float(match.group(2)),
#                         'max': float(match.group(3)),
#                         'stddev': float(match.group(4))
#                     }
#                     test.status = 'success'
#                 else:
#                     raise ValueError('Could not parse ping results')
#             else:
#                 raise RuntimeError(result.stderr)
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()

#     def run_traceroute_test(self, test):
#         try:
#             result = subprocess.run(['traceroute', test.target], capture_output=True, text=True)
#             if result.returncode == 0:
#                 hops = []
#                 for line in result.stdout.splitlines()[1:]:
#                     parts = line.split()
#                     if parts:
#                         hops.append({
#                             'hop': parts[0],
#                             'ip': parts[1] if parts[1] != '*' else None,
#                             'time': ' '.join(parts[2:])
#                         })
#                 test.result = {'hops': hops}
#                 test.status = 'success'
#             else:
#                 raise RuntimeError(result.stderr)
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()

#     def run_speed_test(self, test):
#         try:
#             result = subprocess.run(['speedtest-cli', '--json'], capture_output=True, text=True)
#             if result.returncode == 0:
#                 data = json.loads(result.stdout)
#                 speed_result = SpeedTestResult.objects.create(
#                     test=test,
#                     download_speed=data['download'] / 1_000_000,
#                     upload_speed=data['upload'] / 1_000_000,
#                     latency=data['ping'],
#                     jitter=0,
#                     server=data['server']['name'],
#                     isp=data['client']['isp']
#                 )
#                 test.result = {
#                     'download': speed_result.download_speed,
#                     'upload': speed_result.upload_speed,
#                     'latency': speed_result.latency,
#                     'server': speed_result.server,
#                     'isp': speed_result.isp
#                 }
#                 test.status = 'success'
#             else:
#                 raise RuntimeError(result.stderr)
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()

#     def run_dns_test(self, test):
#         try:
#             result = socket.gethostbyname_ex(test.target)
#             test.result = {
#                 'hostname': result[0],
#                 'aliases': result[1],
#                 'addresses': result[2]
#             }
#             test.status = 'success'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()

#     def run_packet_loss_test(self, test):
#         try:
#             result = subprocess.run(['ping', '-c', '100', test.target], capture_output=True, text=True)
#             if result.returncode == 0:
#                 loss_match = re.search(r'(\d+)% packet loss', result.stdout)
#                 rtt_match = re.search(r'min/avg/max/stddev = (\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)', result.stdout)
#                 if loss_match:
#                     test.result = {
#                         'packet_loss': int(loss_match.group(1)),
#                         'rtt': {
#                             'min': float(rtt_match.group(1)) if rtt_match else None,
#                             'avg': float(rtt_match.group(2)) if rtt_match else None,
#                             'max': float(rtt_match.group(3)) if rtt_match else None,
#                             'stddev': float(rtt_match.group(4)) if rtt_match else None,
#                         }
#                     }
#                     test.status = 'success'
#                 else:
#                     raise ValueError("Could not parse packet loss results")
#             else:
#                 raise RuntimeError(result.stderr)
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()

#     def run_health_check(self, test):
#         try:
#             api = RouterOsApiPool(
#                 test.router.ip,
#                 username=test.router.username,
#                 password=test.router.password,
#                 port=test.router.port
#             ).get_api()

#             resources = api.get_resource('/system/resource').get()[0]
#             services = api.get_resource('/ip/service').get()
#             interfaces = api.get_resource('/interface').get()
#             api.close()

#             health = HealthCheckResult.objects.create(
#                 test=test,
#                 services=services,
#                 cpu_usage=float(resources['cpu-load']),
#                 memory_usage=(1 - float(resources['free-memory']) / float(resources['total-memory'])) * 100,
#                 disk_usage=(1 - float(resources['free-hdd-space']) / float(resources['total-hdd-space'])) * 100
#             )

#             test.result = {
#                 'cpu_usage': health.cpu_usage,
#                 'memory_usage': health.memory_usage,
#                 'disk_usage': health.disk_usage,
#                 'services': health.services
#             }
#             test.status = 'success'
#         except Exception as e:
#             test.result = {'error': str(e)}
#             test.status = 'failed'
#         finally:
#             test.completed_at = timezone.now()
#             test.save()


# class DiagnosticTestDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, pk):
#         test = get_object_or_404(DiagnosticTest, pk=pk)
#         serializer = DiagnosticTestSerializer(test)
#         return Response(serializer.data)


# class BulkDiagnosticsView(DiagnosticTestView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         router_id = request.data.get('router_id')
#         target = request.data.get('target', '')
#         client_ip = request.data.get('client_ip', '')

#         if not router_id:
#             return Response({"error": "router_id is required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             test_types = ['ping', 'traceroute', 'dns', 'packet_loss', 'health_check']
#             if client_ip:
#                 test_types.append('speedtest')

#             tests = []
#             for t_type in test_types:
#                 test = DiagnosticTest.objects.create(
#                     router_id=router_id,
#                     test_type=t_type,
#                     target=target if t_type != 'health_check' else '',
#                     status='running'
#                 )
#                 self.dispatch_test(test)
#                 tests.append(test)

#             serializer = DiagnosticTestSerializer(tests, many=True)
#             return Response(serializer.data)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)









# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from datetime import timedelta
# import subprocess
# import dns.resolver

# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.ip_address_model import IPAddress
# from network_management.models.router_management_model import Router
# from network_management.serializers.network_diagnostics_serializer import (
#     DiagnosticTestSerializer, DiagnosticTestCreateSerializer, SpeedTestHistorySerializer
# )

# from routeros_api import RouterOsApiPool


# class DiagnosticTestListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         tests = DiagnosticTest.objects.all()

#         router_id = request.query_params.get('router')
#         if router_id:
#             tests = tests.filter(router_id=router_id)

#         test_type = request.query_params.get('test_type')
#         if test_type:
#             tests = tests.filter(test_type=test_type)

#         client_ip = request.query_params.get('client_ip')
#         if client_ip:
#             tests = tests.filter(client_ip__ip_address=client_ip)

#         serializer = DiagnosticTestSerializer(tests, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DiagnosticTestCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             test = serializer.save(status='running')
#             try:
#                 result = self.run_diagnostic_test(test)
#                 test.result = result
#                 test.status = 'success'
#                 test.save()

#                 if test.test_type == 'speedtest' and 'speed_test' in result:
#                     SpeedTestHistory.objects.create(
#                         router=test.router,
#                         client_ip=test.client_ip,
#                         download=result['speed_test'].get('download'),
#                         upload=result['speed_test'].get('upload'),
#                         client_download=result['speed_test'].get('client_download'),
#                         client_upload=result['speed_test'].get('client_upload'),
#                         latency=result['speed_test'].get('latency'),
#                         jitter=result['speed_test'].get('jitter'),
#                         server=result['speed_test'].get('server', ''),
#                         isp=result['speed_test'].get('isp', ''),
#                         device=result['speed_test'].get('device', ''),
#                         connection_type=result['speed_test'].get('connection_type', '')
#                     )

#                 return Response(DiagnosticTestSerializer(test).data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 test.status = 'error'
#                 test.result = {'error': str(e)}
#                 test.save()
#                 return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def run_diagnostic_test(self, test):
#         method_map = {
#             'ping': self.run_ping_test,
#             'traceroute': self.run_traceroute_test,
#             'speedtest': self.run_speed_test,
#             'dns': self.run_dns_test,
#             'packet_loss': self.run_packet_loss_test,
#             'health_check': self.run_health_check
#         }
#         method = method_map.get(test.test_type)
#         if not method:
#             raise ValueError("Invalid test type")

#         return method(test)

#     def run_ping_test(self, test):
#         target = test.target
#         try:
#             result = subprocess.run(['ping', '-c', '4', target], capture_output=True, text=True)
#             output = result.stdout
#             if result.returncode == 0:
#                 lines = output.split('\n')
#                 stats = lines[-2].split('/')
#                 return {
#                     'min': float(stats[3]),
#                     'avg': float(stats[4]),
#                     'max': float(stats[5]),
#                     'output': output
#                 }
#             raise Exception("Ping failed")
#         except Exception as e:
#             raise Exception(f"Ping test failed: {str(e)}")

#     def run_traceroute_test(self, test):
#         target = test.target
#         try:
#             result = subprocess.run(['traceroute', target], capture_output=True, text=True)
#             output = result.stdout
#             hops = []
#             for line in output.split('\n')[1:]:
#                 parts = line.strip().split()
#                 if parts and parts[0].isdigit():
#                     hops.append({
#                         'hop': int(parts[0]),
#                         'ip': parts[1] if len(parts) > 1 else '*',
#                         'time': parts[2] if len(parts) > 2 else '*'
#                     })
#             return {'hops': hops, 'output': output}
#         except Exception as e:
#             raise Exception(f"Traceroute test failed: {str(e)}")

#     def run_speed_test(self, test):
#         router = test.router
#         client_ip = test.client_ip
#         try:
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()

#             bandwidth = api.get_resource('/tool/bandwidth-test')
#             result = bandwidth.call('test', {
#                 'protocol': 'tcp',
#                 'direction': 'both',
#                 'duration': '10s'
#             })

#             isp_download = float(result.get('rx-speed', 0)) / 1_000_000
#             isp_upload = float(result.get('tx-speed', 0)) / 1_000_000
#             latency = float(result.get('ping', 0))
#             jitter = float(result.get('jitter', 0))

#             client_download = isp_download
#             client_upload = isp_upload
#             if client_ip:
#                 queue = api.get_resource('/queue/simple')
#                 for q in queue.get():
#                     if q.get('target') == client_ip.ip_address:
#                         client_download = float(q.get('max-limit-download', isp_download)) / 1_000_000
#                         client_upload = float(q.get('max-limit-upload', isp_upload)) / 1_000_000
#                         break

#             api.close()

#             return {
#                 'speed_test': {
#                     'download': isp_download,
#                     'upload': isp_upload,
#                     'client_download': client_download,
#                     'client_upload': client_upload,
#                     'latency': latency,
#                     'jitter': jitter,
#                     'server': 'MikroTik Bandwidth Test',
#                     'isp': 'Local ISP',
#                     'device': client_ip.assigned_to.device_name if client_ip and client_ip.assigned_to else 'Unknown',
#                     'connection_type': client_ip.connection_type if client_ip else 'Unknown'
#                 }
#             }
#         except Exception as e:
#             raise Exception(f"Speed test failed: {str(e)}")

#     def run_dns_test(self, test):
#         try:
#             answers = dns.resolver.resolve(test.target, 'A')
#             addresses = [r.to_text() for r in answers]
#             return {'hostname': test.target, 'addresses': addresses}
#         except Exception as e:
#             raise Exception(f"DNS test failed: {str(e)}")

#     def run_packet_loss_test(self, test):
#         try:
#             result = subprocess.run(['ping', '-c', '10', test.target], capture_output=True, text=True)
#             output = result.stdout
#             if result.returncode == 0:
#                 loss_line = [l for l in output.split('\n') if 'packet loss' in l][0]
#                 loss = float(loss_line.split('%')[0].split()[-1])
#                 stats = output.split('\n')[-2].split('/')
#                 return {
#                     'packet_loss': loss,
#                     'rtt': {
#                         'min': float(stats[3]),
#                         'avg': float(stats[4]),
#                         'max': float(stats[5])
#                     },
#                     'output': output
#                 }
#             raise Exception("Packet loss test failed")
#         except Exception as e:
#             raise Exception(f"Packet loss test failed: {str(e)}")

#     def run_health_check(self, test):
#         router = test.router
#         try:
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()

#             sys_res = api.get_resource('/system/resource').get()[0]
#             cpu = float(sys_res.get('cpu-load'))
#             mem = float(sys_res.get('free-memory')) / float(sys_res.get('total-memory')) * 100
#             disk = float(sys_res.get('free-hdd-space')) / float(sys_res.get('total-hdd-space')) * 100

#             services = api.get_resource('/system/service').get()
#             service_status = [{'name': s['name'], 'status': 'running' if s['running'] == 'true' else 'stopped'} for s in services]

#             api.close()

#             return {
#                 'message': 'Health check completed',
#                 'health_check': {
#                     'cpu_usage': cpu,
#                     'memory_usage': mem,
#                     'disk_usage': disk,
#                     'services': service_status
#                 }
#             }
#         except Exception as e:
#             raise Exception(f"Health check failed: {str(e)}")









# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from datetime import timedelta
# import subprocess
# import dns.resolver

# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.ip_address_model import IPAddress
# from network_management.models.router_management_model import Router
# from network_management.serializers.network_diagnostics_serializer import (
#     DiagnosticTestSerializer, DiagnosticTestCreateSerializer, SpeedTestHistorySerializer
# )

# from routeros_api import RouterOsApiPool

# class DiagnosticTestListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         tests = DiagnosticTest.objects.all()

#         router_id = request.query_params.get('router')
#         if router_id:
#             tests = tests.filter(router_id=router_id)

#         test_type = request.query_params.get('test_type')
#         if test_type:
#             tests = tests.filter(test_type=test_type)

#         client_ip = request.query_params.get('client_ip')
#         if client_ip:
#             tests = tests.filter(client_ip__ip_address=client_ip)

#         serializer = DiagnosticTestSerializer(tests, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DiagnosticTestCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             test = serializer.save(status='running')
#             try:
#                 result = self.run_diagnostic_test(test)
#                 test.result = result
#                 test.status = 'success'
#                 test.save()

#                 if test.test_type == 'speedtest' and 'speed_test' in result:
#                     SpeedTestHistory.objects.create(
#                         router=test.router,
#                         client_ip=test.client_ip,
#                         download=result['speed_test'].get('download'),
#                         upload=result['speed_test'].get('upload'),
#                         client_download=result['speed_test'].get('client_download'),
#                         client_upload=result['speed_test'].get('client_upload'),
#                         latency=result['speed_test'].get('latency'),
#                         jitter=result['speed_test'].get('jitter'),
#                         server=result['speed_test'].get('server', ''),
#                         isp=result['speed_test'].get('isp', ''),
#                         device=result['speed_test'].get('device', ''),
#                         connection_type=result['speed_test'].get('connection_type', '')
#                     )

#                 return Response(DiagnosticTestSerializer(test).data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 test.status = 'error'
#                 test.result = {'error': str(e)}
#                 test.save()
#                 return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def run_diagnostic_test(self, test):
#         method_map = {
#             'ping': self.run_ping_test,
#             'traceroute': self.run_traceroute_test,
#             'speedtest': self.run_speed_test,
#             'dns': self.run_dns_test,
#             'packet_loss': self.run_packet_loss_test,
#             'health_check': self.run_health_check
#         }
#         method = method_map.get(test.test_type)
#         if not method:
#             raise ValueError("Invalid test type")

#         return method(test)

#     def run_ping_test(self, test):
#         target = test.target
#         try:
#             result = subprocess.run(['ping', '-c', '4', target], capture_output=True, text=True)
#             output = result.stdout
#             if result.returncode == 0:
#                 lines = output.split('\n')
#                 stats = lines[-2].split('/')
#                 return {
#                     'min': float(stats[3]),
#                     'avg': float(stats[4]),
#                     'max': float(stats[5]),
#                     'output': output
#                 }
#             raise Exception("Ping failed")
#         except Exception as e:
#             raise Exception(f"Ping test failed: {str(e)}")

#     def run_traceroute_test(self, test):
#         target = test.target
#         try:
#             result = subprocess.run(['traceroute', target], capture_output=True, text=True)
#             output = result.stdout
#             hops = []
#             for line in output.split('\n')[1:]:
#                 parts = line.strip().split()
#                 if parts and parts[0].isdigit():
#                     hops.append({
#                         'hop': int(parts[0]),
#                         'ip': parts[1] if len(parts) > 1 else '*',
#                         'time': parts[2] if len(parts) > 2 else '*'
#                     })
#             return {'hops': hops, 'output': output}
#         except Exception as e:
#             raise Exception(f"Traceroute test failed: {str(e)}")

#     def run_speed_test(self, test):
#         router = test.router
#         client_ip = test.client_ip
#         try:
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()

#             bandwidth = api.get_resource('/tool/bandwidth-test')
#             result = bandwidth.call('test', {
#                 'protocol': 'tcp',
#                 'direction': 'both',
#                 'duration': '10s'
#             })

#             isp_download = float(result.get('rx-speed', 0)) / 1_000_000
#             isp_upload = float(result.get('tx-speed', 0)) / 1_000_000
#             latency = float(result.get('ping', 0))
#             jitter = float(result.get('jitter', 0))

#             client_download = isp_download
#             client_upload = isp_upload
#             if client_ip:
#                 queue = api.get_resource('/queue/simple')
#                 for q in queue.get():
#                     if q.get('target') == client_ip.ip_address:
#                         client_download = float(q.get('max-limit-download', isp_download)) / 1_000_000
#                         client_upload = float(q.get('max-limit-upload', isp_upload)) / 1_000_000
#                         break

#             api.close()

#             return {
#                 'speed_test': {
#                     'download': isp_download,
#                     'upload': isp_upload,
#                     'client_download': client_download,
#                     'client_upload': client_upload,
#                     'latency': latency,
#                     'jitter': jitter,
#                     'server': 'MikroTik Bandwidth Test',
#                     'isp': 'Local ISP',
#                     'device': client_ip.assigned_to.device_name if client_ip and client_ip.assigned_to else 'Unknown',
#                     'connection_type': client_ip.connection_type if client_ip else 'Unknown'
#                 }
#             }
#         except Exception as e:
#             raise Exception(f"Speed test failed: {str(e)}")

#     def run_dns_test(self, test):
#         try:
#             answers = dns.resolver.resolve(test.target, 'A')
#             addresses = [r.to_text() for r in answers]
#             return {'hostname': test.target, 'addresses': addresses}
#         except Exception as e:
#             raise Exception(f"DNS test failed: {str(e)}")

#     def run_packet_loss_test(self, test):
#         try:
#             result = subprocess.run(['ping', '-c', '10', test.target], capture_output=True, text=True)
#             output = result.stdout
#             if result.returncode == 0:
#                 loss_line = [l for l in output.split('\n') if 'packet loss' in l][0]
#                 loss = float(loss_line.split('%')[0].split()[-1])
#                 stats = output.split('\n')[-2].split('/')
#                 return {
#                     'packet_loss': loss,
#                     'rtt': {
#                         'min': float(stats[3]),
#                         'avg': float(stats[4]),
#                         'max': float(stats[5])
#                     },
#                     'output': output
#                 }
#             raise Exception("Packet loss test failed")
#         except Exception as e:
#             raise Exception(f"Packet loss test failed: {str(e)}")

#     def run_health_check(self, test):
#         router = test.router
#         try:
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()

#             sys_res = api.get_resource('/system/resource').get()[0]
#             cpu = float(sys_res.get('cpu-load'))
#             mem = float(sys_res.get('free-memory')) / float(sys_res.get('total-memory')) * 100
#             disk = float(sys_res.get('free-hdd-space')) / float(sys_res.get('total-hdd-space')) * 100

#             services = api.get_resource('/system/service').get()
#             service_status = [{'name': s['name'], 'status': 'running' if s['running'] == 'true' else 'stopped'} for s in services]

#             api.close()

#             return {
#                 'message': 'Health check completed',
#                 'health_check': {
#                     'cpu_usage': cpu,
#                     'memory_usage': mem,
#                     'disk_usage': disk,
#                     'services': service_status
#                 }
#             }
#         except Exception as e:
#             raise Exception(f"Health check failed: {str(e)}")

# class DiagnosticTestBulkView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         router_id = request.data.get('router_id')
#         target = request.data.get('target')
#         client_ip = request.data.get('client_ip')

#         if not router_id or not target:
#             return Response({'error': 'router_id and target are required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             tests = []
#             test_types = ['ping', 'traceroute', 'dns', 'packet_loss', 'health_check']
            
#             if client_ip:
#                 test_types.append('speedtest')

#             for test_type in test_types:
#                 test_data = {
#                     'router': router_id,
#                     'test_type': test_type,
#                     'target': target,
#                     'client_ip': client_ip
#                 }
#                 serializer = DiagnosticTestCreateSerializer(data=test_data)
#                 if serializer.is_valid():
#                     test = serializer.save(status='running')
#                     try:
#                         result = DiagnosticTestListView().run_diagnostic_test(test)
#                         test.result = result
#                         test.status = 'success'
#                         test.save()
#                         tests.append(test)
#                     except Exception as e:
#                         test.status = 'error'
#                         test.result = {'error': str(e)}
#                         test.save()
#                         tests.append(test)
#                 else:
#                     tests.append({'error': serializer.errors, 'test_type': test_type})

#             return Response(DiagnosticTestSerializer([t for t in tests if isinstance(t, DiagnosticTest)], many=True).data, 
#                            status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class SpeedTestHistoryView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         history = SpeedTestHistory.objects.all()

#         router_id = request.query_params.get('router')
#         if router_id:
#             history = history.filter(router_id=router_id)

#         client_ip = request.query_params.get('client_ip')
#         if client_ip:
#             history = history.filter(client_ip__ip_address=client_ip)

#         time_frame = request.query_params.get('time_frame', 'hour')
#         now = timezone.now()

#         if time_frame == 'minute':
#             history = history.filter(timestamp__gte=now - timedelta(hours=1))
#         elif time_frame == 'hour':
#             history = history.filter(timestamp__gte=now - timedelta(days=1))
#         elif time_frame == 'day':
#             history = history.filter(timestamp__gte=now - timedelta(days=30))
#         elif time_frame == 'month':
#             history = history.filter(timestamp__gte=now - timedelta(days=365))

#         serializer = SpeedTestHistorySerializer(history, many=True)
#         return Response({
#             'isp': {
#                 'minute': serializer.data[:60],
#                 'hour': serializer.data[:24],
#                 'day': serializer.data[:30],
#                 'month': serializer.data[:12]
#             },
#             'client': {
#                 'minute': serializer.data[:60],
#                 'hour': serializer.data[:24],
#                 'day': serializer.data[:30],
#                 'month': serializer.data[:12]
#             }
#         })






# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from datetime import timedelta
# import subprocess
# import dns.resolver

# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.router_management_model import Router
# from network_management.models.ip_address_model import IPAddress
# from network_management.serializers.network_diagnostics_serializer import (
#     DiagnosticTestSerializer, DiagnosticTestCreateSerializer, SpeedTestHistorySerializer
# )

# from routeros_api import RouterOsApiPool

# class DiagnosticTestListView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         tests = DiagnosticTest.objects.all()

#         router_id = request.query_params.get('router')
#         if router_id:
#             try:
#                 router_id = int(router_id)
#                 if not Router.objects.filter(id=router_id).exists():
#                     return Response(
#                         {"error": "Router not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#                 tests = tests.filter(router_id=router_id)
#             except ValueError:
#                 return Response(
#                     {"error": "Invalid router ID"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#         test_type = request.query_params.get('test_type')
#         if test_type:
#             tests = tests.filter(test_type=test_type)

#         client_ip = request.query_params.get('client_ip')
#         if client_ip:
#             tests = tests.filter(client_ip__ip_address=client_ip)

#         serializer = DiagnosticTestSerializer(tests, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DiagnosticTestCreateSerializer(data=request.data)
#         if serializer.is_valid():
#             test = serializer.save(status='running')
#             try:
#                 result = self.run_diagnostic_test(test)
#                 test.result = result
#                 test.status = 'success'
#                 test.save()

#                 if test.test_type == 'speedtest' and 'speed_test' in result:
#                     SpeedTestHistory.objects.create(
#                         router=test.router,
#                         client_ip=test.client_ip,
#                         download=result['speed_test'].get('download'),
#                         upload=result['speed_test'].get('upload'),
#                         client_download=result['speed_test'].get('client_download'),
#                         client_upload=result['speed_test'].get('client_upload'),
#                         latency=result['speed_test'].get('latency'),
#                         jitter=result['speed_test'].get('jitter'),
#                         server=result['speed_test'].get('server', ''),
#                         isp=result['speed_test'].get('isp', ''),
#                         device=result['speed_test'].get('device', ''),
#                         connection_type=result['speed_test'].get('connection_type', '')
#                     )

#                 return Response(DiagnosticTestSerializer(test).data, status=status.HTTP_201_CREATED)
#             except Exception as e:
#                 test.status = 'error'
#                 test.result = {'error': str(e)}
#                 test.save()
#                 return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def run_diagnostic_test(self, test):
#         method_map = {
#             'ping': self.run_ping_test,
#             'traceroute': self.run_traceroute_test,
#             'speedtest': self.run_speed_test,
#             'dns': self.run_dns_test,
#             'packet_loss': self.run_packet_loss_test,
#             'health_check': self.run_health_check
#         }
#         method = method_map.get(test.test_type)
#         if not method:
#             raise ValueError("Invalid test type")

#         return method(test)

#     def run_ping_test(self, test):
#         target = test.target
#         try:
#             result = subprocess.run(['ping', '-c', '4', target], capture_output=True, text=True)
#             output = result.stdout
#             if result.returncode == 0:
#                 lines = output.split('\n')
#                 stats = lines[-2].split('/')
#                 return {
#                     'min': float(stats[3]),
#                     'avg': float(stats[4]),
#                     'max': float(stats[5]),
#                     'output': output
#                 }
#             raise Exception("Ping failed")
#         except Exception as e:
#             raise Exception(f"Ping test failed: {str(e)}")

#     def run_traceroute_test(self, test):
#         target = test.target
#         try:
#             result = subprocess.run(['traceroute', target], capture_output=True, text=True)
#             output = result.stdout
#             hops = []
#             for line in output.split('\n')[1:]:
#                 parts = line.strip().split()
#                 if parts and parts[0].isdigit():
#                     hops.append({
#                         'hop': int(parts[0]),
#                         'ip': parts[1] if len(parts) > 1 else '*',
#                         'time': parts[2] if len(parts) > 2 else '*'
#                     })
#             return {'hops': hops, 'output': output}
#         except Exception as e:
#             raise Exception(f"Traceroute test failed: {str(e)}")

#     def run_speed_test(self, test):
#         router = test.router
#         client_ip = test.client_ip
#         try:
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()

#             bandwidth = api.get_resource('/tool/bandwidth-test')
#             result = bandwidth.call('test', {
#                 'protocol': 'tcp',
#                 'direction': 'both',
#                 'duration': '10s'
#             })

#             isp_download = float(result.get('rx-speed', 0)) / 1_000_000
#             isp_upload = float(result.get('tx-speed', 0)) / 1_000_000
#             latency = float(result.get('ping', 0))
#             jitter = float(result.get('jitter', 0))

#             client_download = isp_download
#             client_upload = isp_upload
#             if client_ip:
#                 queue = api.get_resource('/queue/simple')
#                 for q in queue.get():
#                     if q.get('target') == client_ip.ip_address:
#                         client_download = float(q.get('max-limit-download', isp_download)) / 1_000_000
#                         client_upload = float(q.get('max-limit-upload', isp_upload)) / 1_000_000
#                         break

#             api.close()

#             return {
#                 'speed_test': {
#                     'download': isp_download,
#                     'upload': isp_upload,
#                     'client_download': client_download,
#                     'client_upload': client_upload,
#                     'latency': latency,
#                     'jitter': jitter,
#                     'server': 'MikroTik Bandwidth Test',
#                     'isp': 'Local ISP',
#                     'device': client_ip.assigned_to.device_name if client_ip and client_ip.assigned_to else 'Unknown',
#                     'connection_type': client_ip.connection_type if client_ip else 'Unknown'
#                 }
#             }
#         except Exception as e:
#             raise Exception(f"Speed test failed: {str(e)}")

#     def run_dns_test(self, test):
#         try:
#             answers = dns.resolver.resolve(test.target, 'A')
#             addresses = [r.to_text() for r in answers]
#             return {'hostname': test.target, 'addresses': addresses}
#         except Exception as e:
#             raise Exception(f"DNS test failed: {str(e)}")

#     def run_packet_loss_test(self, test):
#         try:
#             result = subprocess.run(['ping', '-c', '10', test.target], capture_output=True, text=True)
#             output = result.stdout
#             if result.returncode == 0:
#                 loss_line = [l for l in output.split('\n') if 'packet loss' in l][0]
#                 loss = float(loss_line.split('%')[0].split()[-1])
#                 stats = output.split('\n')[-2].split('/')
#                 return {
#                     'packet_loss': loss,
#                     'rtt': {
#                         'min': float(stats[3]),
#                         'avg': float(stats[4]),
#                         'max': float(stats[5])
#                     },
#                     'output': output
#                 }
#             raise Exception("Packet loss test failed")
#         except Exception as e:
#             raise Exception(f"Packet loss test failed: {str(e)}")

#     def run_health_check(self, test):
#         router = test.router
#         try:
#             api = RouterOsApiPool(router.ip, username=router.username, password=router.password, port=router.port).get_api()

#             sys_res = api.get_resource('/system/resource').get()[0]
#             cpu = float(sys_res.get('cpu-load'))
#             mem = float(sys_res.get('free-memory')) / float(sys_res.get('total-memory')) * 100
#             disk = float(sys_res.get('free-hdd-space')) / float(sys_res.get('total-hdd-space')) * 100

#             services = api.get_resource('/system/service').get()
#             service_status = [{'name': s['name'], 'status': 'running' if s['running'] == 'true' else 'stopped'} for s in services]

#             api.close()

#             return {
#                 'message': 'Health check completed',
#                 'health_check': {
#                     'cpu_usage': cpu,
#                     'memory_usage': mem,
#                     'disk_usage': disk,
#                     'services': service_status
#                 }
#             }
#         except Exception as e:
#             raise Exception(f"Health check failed: {str(e)}")

# class DiagnosticTestBulkView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         router_id = request.data.get('router_id')
#         target = request.data.get('target')
#         client_ip = request.data.get('client_ip')

#         if not router_id:
#             return Response({'error': 'router_id is required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             router_id = int(router_id)
#             if not Router.objects.filter(id=router_id).exists():
#                 return Response(
#                     {"error": "Router not found"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )
#         except ValueError:
#             return Response(
#                 {"error": "Invalid router ID"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if not target:
#             return Response({'error': 'target is required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             tests = []
#             test_types = ['ping', 'traceroute', 'dns', 'packet_loss', 'health_check']
            
#             if client_ip:
#                 test_types.append('speedtest')

#             for test_type in test_types:
#                 test_data = {
#                     'router': router_id,
#                     'test_type': test_type,
#                     'target': target,
#                     'client_ip': client_ip
#                 }
#                 serializer = DiagnosticTestCreateSerializer(data=test_data)
#                 if serializer.is_valid():
#                     test = serializer.save(status='running')
#                     try:
#                         result = DiagnosticTestListView().run_diagnostic_test(test)
#                         test.result = result
#                         test.status = 'success'
#                         test.save()
#                         tests.append(test)
#                     except Exception as e:
#                         test.status = 'error'
#                         test.result = {'error': str(e)}
#                         test.save()
#                         tests.append(test)
#                 else:
#                     tests.append({'error': serializer.errors, 'test_type': test_type})

#             return Response(
#                 DiagnosticTestSerializer([t for t in tests if isinstance(t, DiagnosticTest)], many=True).data,
#                 status=status.HTTP_200_OK
#             )
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class SpeedTestHistoryView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         history = SpeedTestHistory.objects.all()

#         router_id = request.query_params.get('router')
#         if router_id:
#             try:
#                 router_id = int(router_id)
#                 if not Router.objects.filter(id=router_id).exists():
#                     return Response(
#                         {"error": "Router not found"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#                 history = history.filter(router_id=router_id)
#             except ValueError:
#                 return Response(
#                     {"error": "Invalid router ID"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#         client_ip = request.query_params.get('client_ip')
#         if client_ip:
#             history = history.filter(client_ip__ip_address=client_ip)

#         time_frame = request.query_params.get('time_frame', 'hour')
#         now = timezone.now()

#         if time_frame == 'minute':
#             history = history.filter(timestamp__gte=now - timedelta(hours=1))
#         elif time_frame == 'hour':
#             history = history.filter(timestamp__gte=now - timedelta(days=1))
#         elif time_frame == 'day':
#             history = history.filter(timestamp__gte=now - timedelta(days=30))
#         elif time_frame == 'month':
#             history = history.filter(timestamp__gte=now - timedelta(days=365))

#         serializer = SpeedTestHistorySerializer(history, many=True)
#         return Response({
#             'isp': {
#                 'minute': serializer.data[:60],
#                 'hour': serializer.data[:24],
#                 'day': serializer.data[:30],
#                 'month': serializer.data[:12]
#             },
#             'client': {
#                 'minute': serializer.data[:60],
#                 'hour': serializer.data[:24],
#                 'day': serializer.data[:30],
#                 'month': serializer.data[:12]
#             }
#         })






from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import subprocess
import dns.resolver
import shlex

from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
from network_management.models.router_management_model import Router
from network_management.models.ip_address_model import IPAddress
from network_management.serializers.network_diagnostics_serializer import (
    DiagnosticTestSerializer, DiagnosticTestCreateSerializer, SpeedTestHistorySerializer
)

try:
    from routeros_api import RouterOsApiPool
except ImportError:
    RouterOsApiPool = None

class DiagnosticTestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tests = DiagnosticTest.objects.all()

        router_id = request.query_params.get('router')
        if router_id:
            try:
                router_id = int(router_id)
                if not Router.objects.filter(id=router_id).exists():
                    return Response(
                        {"error": "Router does not exist"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                tests = tests.filter(router_id=router_id)
            except ValueError:
                return Response(
                    {"error": "Invalid router ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        test_type = request.query_params.get('test_type')
        if test_type:
            tests = tests.filter(test_type=test_type)

        client_ip = request.query_params.get('client_ip')
        if client_ip:
            tests = tests.filter(client_ip__ip_address=client_ip)

        serializer = DiagnosticTestSerializer(tests, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DiagnosticTestCreateSerializer(data=request.data)
        if serializer.is_valid():
            test = serializer.save(status='running')
            try:
                result = self.run_diagnostic_test(test)
                test.result = result
                test.status = 'success'
                test.save()

                if test.test_type == 'speedtest' and result.get('speed_test'):
                    SpeedTestHistory.objects.create(
                        router=test.router,
                        client_ip=test.client_ip,
                        download=result['speed_test'].get('download'),
                        upload=result['speed_test'].get('upload'),
                        client_download=result['speed_test'].get('client_download'),
                        client_upload=result['speed_test'].get('client_upload'),
                        latency=result['speed_test'].get('latency'),
                        jitter=result['speed_test'].get('jitter'),
                        server=result['speed_test'].get('server', ''),
                        isp=result['speed_test'].get('isp', ''),
                        device=result['speed_test'].get('device', ''),
                        connection_type=result['speed_test'].get('connection_type', '')
                    )

                return Response(DiagnosticTestSerializer(test).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                test.status = 'error'
                test.result = {'error': str(e)}
                test.save()
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def run_diagnostic_test(self, test):
        method_map = {
            'ping': self.run_ping_test,
            'traceroute': self.run_traceroute_test,
            'speedtest': self.run_speed_test,
            'dns': self.run_dns_test,
            'packet_loss': self.run_packet_loss_test,
            'health_check': self.run_health_check
        }
        method = method_map.get(test.test_type)
        if not method:
            raise ValueError("Invalid test type")
        return method(test)

    def run_ping_test(self, test):
        target = shlex.quote(test.target)
        try:
            result = subprocess.run(
                ['ping', '-c', '4', target], capture_output=True, text=True, check=True
            )
            output = result.stdout
            lines = output.split('\n')
            stats = lines[-2].split('/')
            return {
                'min': float(stats[3]),
                'avg': float(stats[4]),
                'max': float(stats[5]),
                'output': output
            }
        except subprocess.CalledProcessError as e:
            raise Exception(f"Ping test failed: {e.stderr}")
        except Exception as e:
            raise Exception(f"Ping test failed: {str(e)}")

    def run_traceroute_test(self, test):
        target = shlex.quote(test.target)
        try:
            result = subprocess.run(
                ['traceroute', target], capture_output=True, text=True, check=True
            )
            output = result.stdout
            hops = []
            for line in output.split('\n')[1:]:
                parts = line.strip().split()
                if parts and parts[0].isdigit():
                    hops.append({
                        'hop': int(parts[0]),
                        'ip': parts[1] if len(parts) > 1 else '*',
                        'time': parts[2] if len(parts) > 2 else '*'
                    })
            return {'hops': hops, 'output': output}
        except subprocess.CalledProcessError as e:
            raise Exception(f"Traceroute test failed: {e.stderr}")
        except Exception as e:
            raise Exception(f"Traceroute test failed: {str(e)}")

    def run_speed_test(self, test):
        if not RouterOsApiPool:
            raise Exception("RouterOS API not available")
        router = test.router
        client_ip = test.client_ip
        try:
            api = RouterOsApiPool(
                router.ip_address, username=router.username, password=router.password, port=router.port
            ).get_api()

            bandwidth = api.get_resource('/tool/bandwidth-test')
            result = bandwidth.call('test', {
                'protocol': 'tcp',
                'direction': 'both',
                'duration': '10s'
            })

            isp_download = float(result.get('rx-speed', 0)) / 1_000_000
            isp_upload = float(result.get('tx-speed', 0)) / 1_000_000
            latency = float(result.get('ping', 0))
            jitter = float(result.get('jitter', 0))

            client_download = isp_download
            client_upload = isp_upload
            if client_ip:
                queue = api.get_resource('/queue/simple')
                for q in queue.get():
                    if q.get('target') == client_ip.ip_address:
                        client_download = float(q.get('max-limit-download', isp_download)) / 1_000_000
                        client_upload = float(q.get('max-limit-upload', isp_upload)) / 1_000_000
                        break

            api.close()

            return {
                'speed_test': {
                    'download': isp_download,
                    'upload': isp_upload,
                    'client_download': client_download if client_ip else None,
                    'client_upload': client_upload if client_ip else None,
                    'latency': latency,
                    'jitter': jitter,
                    'server': 'MikroTik Bandwidth Test',
                    'isp': 'Local ISP',
                    'device': client_ip.assigned_to.device_name if client_ip and client_ip.assigned_to else 'Unknown',
                    'connection_type': client_ip.connection_type if client_ip else 'Unknown'
                }
            }
        except Exception as e:
            raise Exception(f"Speed test failed: {str(e)}")

    def run_dns_test(self, test):
        try:
            answers = dns.resolver.resolve(test.target, 'A')
            addresses = [r.to_text() for r in answers]
            return {'hostname': test.target, 'addresses': addresses}
        except Exception as e:
            raise Exception(f"DNS test failed: {str(e)}")

    def run_packet_loss_test(self, test):
        target = shlex.quote(test.target)
        try:
            result = subprocess.run(
                ['ping', '-c', '10', target], capture_output=True, text=True, check=True
            )
            output = result.stdout
            loss_line = [l for l in output.split('\n') if 'packet loss' in l][0]
            loss = float(loss_line.split('%')[0].split()[-1])
            stats = output.split('\n')[-2].split('/')
            return {
                'packet_loss': loss,
                'rtt': {
                    'min': float(stats[3]),
                    'avg': float(stats[4]),
                    'max': float(stats[5])
                },
                'output': output
            }
        except subprocess.CalledProcessError as e:
            raise Exception(f"Packet loss test failed: {e.stderr}")
        except Exception as e:
            raise Exception(f"Packet loss test failed: {str(e)}")

    def run_health_check(self, test):
        if not RouterOsApiPool:
            raise Exception("RouterOS API not available")
        router = test.router
        try:
            api = RouterOsApiPool(
                router.ip_address, username=router.username, password=router.password, port=router.port
            ).get_api()

            sys_res = api.get_resource('/system/resource').get()[0]
            cpu = float(sys_res.get('cpu-load'))
            mem = float(sys_res.get('free-memory')) / float(sys_res.get('total-memory')) * 100
            disk = float(sys_res.get('free-hdd-space')) / float(sys_res.get('total-hdd-space')) * 100

            services = api.get_resource('/system/service').get()
            service_status = [
                {'name': s['name'], 'status': 'running' if s['running'] == 'true' else 'stopped'}
                for s in services
            ]

            api.close()

            return {
                'health_check': {
                    'cpu_usage': cpu,
                    'memory_usage': mem,
                    'disk_usage': disk,
                    'services': service_status
                }
            }
        except Exception as e:
            raise Exception(f"Health check failed: {str(e)}")

class DiagnosticTestBulkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DiagnosticTestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        router_id = serializer.validated_data['router_id']
        target = serializer.validated_data['target']
        client_ip_id = serializer.validated_data.get('client_ip_id')

        tests = []
        test_types = ['ping', 'traceroute', 'dns', 'packet_loss', 'health_check']
        if client_ip_id:
            test_types.append('speedtest')

        for test_type in test_types:
            test_data = {
                'router_id': router_id,
                'test_type': test_type,
                'target': target,
                'client_ip_id': client_ip_id
            }
            test_serializer = DiagnosticTestCreateSerializer(data=test_data)
            if test_serializer.is_valid():
                test = test_serializer.save(status='running')
                try:
                    result = self.run_diagnostic_test(test)
                    test.result = result
                    test.status = 'success'
                    test.save()
                    tests.append(test)
                except Exception as e:
                    test.status = 'error'
                    test.result = {'error': str(e)}
                    test.save()
                    tests.append(test)
            else:
                tests.append({'error': test_serializer.errors, 'test_type': test_type})

        return Response(
            DiagnosticTestSerializer([t for t in tests if isinstance(t, DiagnosticTest)], many=True).data,
            status=status.HTTP_200_OK
        )

class SpeedTestHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = SpeedTestHistory.objects.all()

        router_id = request.query_params.get('router')
        if router_id:
            try:
                router_id = int(router_id)
                if not Router.objects.filter(id=router_id).exists():
                    return Response(
                        {"error": "Router does not exist"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                history = history.filter(router_id=router_id)
            except ValueError:
                return Response(
                    {"error": "Invalid router ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        client_ip = request.query_params.get('client_ip')
        isp_history = history
        client_history = history
        if client_ip:
            try:
                client_ip_obj = IPAddress.objects.get(ip_address=client_ip)
                client_history = history.filter(client_ip=client_ip_obj)
                isp_history = history.filter(client_ip__isnull=True)
            except IPAddress.DoesNotExist:
                return Response(
                    {"error": "Client IP does not exist"},
                    status=status.HTTP_404_NOT_FOUND
                )

        time_frame = request.query_params.get('time_frame', 'hour')
        now = timezone.now()
        time_filters = {
            'minute': now - timedelta(hours=1),
            'hour': now - timedelta(days=1),
            'day': now - timedelta(days=30),
            'month': now - timedelta(days=365),
        }
        if time_frame in time_filters:
            isp_history = isp_history.filter(timestamp__gte=time_filters[time_frame])
            client_history = client_history.filter(timestamp__gte=time_filters[time_frame])

        isp_serializer = SpeedTestHistorySerializer(isp_history, many=True)
        client_serializer = SpeedTestHistorySerializer(client_history, many=True)

        response_data = {
            'isp': {
                'minute': isp_serializer.data[:60] if time_frame == 'minute' else [],
                'hour': isp_serializer.data[:24] if time_frame == 'hour' else [],
                'day': isp_serializer.data[:30] if time_frame == 'day' else [],
                'month': isp_serializer.data[:12] if time_frame == 'month' else [],
            },
            'client': {
                'minute': client_serializer.data[:60] if time_frame == 'minute' else [],
                'hour': client_serializer.data[:24] if time_frame == 'hour' else [],
                'day': client_serializer.data[:30] if time_frame == 'day' else [],
                'month': client_serializer.data[:12] if time_frame == 'month' else [],
            }
        }
        return Response(response_data)