




# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.utils import timezone
# from datetime import timedelta
# import subprocess
# import dns.resolver
# import shlex

# from network_management.models.network_diagnostics_model import DiagnosticTest, SpeedTestHistory
# from network_management.models.router_management_model import Router
# from network_management.models.ip_address_model import IPAddress
# from network_management.serializers.network_diagnostics_serializer import (
#     DiagnosticTestSerializer, DiagnosticTestCreateSerializer, SpeedTestHistorySerializer
# )

# try:
#     from routeros_api import RouterOsApiPool
# except ImportError:
#     RouterOsApiPool = None

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
#                         {"error": "Router does not exist"},
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

#                 if test.test_type == 'speedtest' and result.get('speed_test'):
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
#         target = shlex.quote(test.target)
#         try:
#             result = subprocess.run(
#                 ['ping', '-c', '4', target], capture_output=True, text=True, check=True
#             )
#             output = result.stdout
#             lines = output.split('\n')
#             stats = lines[-2].split('/')
#             return {
#                 'min': float(stats[3]),
#                 'avg': float(stats[4]),
#                 'max': float(stats[5]),
#                 'output': output
#             }
#         except subprocess.CalledProcessError as e:
#             raise Exception(f"Ping test failed: {e.stderr}")
#         except Exception as e:
#             raise Exception(f"Ping test failed: {str(e)}")

#     def run_traceroute_test(self, test):
#         target = shlex.quote(test.target)
#         try:
#             result = subprocess.run(
#                 ['traceroute', target], capture_output=True, text=True, check=True
#             )
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
#         except subprocess.CalledProcessError as e:
#             raise Exception(f"Traceroute test failed: {e.stderr}")
#         except Exception as e:
#             raise Exception(f"Traceroute test failed: {str(e)}")

#     def run_speed_test(self, test):
#         if not RouterOsApiPool:
#             raise Exception("RouterOS API not available")
#         router = test.router
#         client_ip = test.client_ip
#         try:
#             api = RouterOsApiPool(
#                 router.ip_address, username=router.username, password=router.password, port=router.port
#             ).get_api()

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
#                     'client_download': client_download if client_ip else None,
#                     'client_upload': client_upload if client_ip else None,
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
#         target = shlex.quote(test.target)
#         try:
#             result = subprocess.run(
#                 ['ping', '-c', '10', target], capture_output=True, text=True, check=True
#             )
#             output = result.stdout
#             loss_line = [l for l in output.split('\n') if 'packet loss' in l][0]
#             loss = float(loss_line.split('%')[0].split()[-1])
#             stats = output.split('\n')[-2].split('/')
#             return {
#                 'packet_loss': loss,
#                 'rtt': {
#                     'min': float(stats[3]),
#                     'avg': float(stats[4]),
#                     'max': float(stats[5])
#                 },
#                 'output': output
#             }
#         except subprocess.CalledProcessError as e:
#             raise Exception(f"Packet loss test failed: {e.stderr}")
#         except Exception as e:
#             raise Exception(f"Packet loss test failed: {str(e)}")

#     def run_health_check(self, test):
#         if not RouterOsApiPool:
#             raise Exception("RouterOS API not available")
#         router = test.router
#         try:
#             api = RouterOsApiPool(
#                 router.ip_address, username=router.username, password=router.password, port=router.port
#             ).get_api()

#             sys_res = api.get_resource('/system/resource').get()[0]
#             cpu = float(sys_res.get('cpu-load'))
#             mem = float(sys_res.get('free-memory')) / float(sys_res.get('total-memory')) * 100
#             disk = float(sys_res.get('free-hdd-space')) / float(sys_res.get('total-hdd-space')) * 100

#             services = api.get_resource('/system/service').get()
#             service_status = [
#                 {'name': s['name'], 'status': 'running' if s['running'] == 'true' else 'stopped'}
#                 for s in services
#             ]

#             api.close()

#             return {
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
#         serializer = DiagnosticTestCreateSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         router_id = serializer.validated_data['router_id']
#         target = serializer.validated_data['target']
#         client_ip_id = serializer.validated_data.get('client_ip_id')

#         tests = []
#         test_types = ['ping', 'traceroute', 'dns', 'packet_loss', 'health_check']
#         if client_ip_id:
#             test_types.append('speedtest')

#         for test_type in test_types:
#             test_data = {
#                 'router_id': router_id,
#                 'test_type': test_type,
#                 'target': target,
#                 'client_ip_id': client_ip_id
#             }
#             test_serializer = DiagnosticTestCreateSerializer(data=test_data)
#             if test_serializer.is_valid():
#                 test = test_serializer.save(status='running')
#                 try:
#                     result = self.run_diagnostic_test(test)
#                     test.result = result
#                     test.status = 'success'
#                     test.save()
#                     tests.append(test)
#                 except Exception as e:
#                     test.status = 'error'
#                     test.result = {'error': str(e)}
#                     test.save()
#                     tests.append(test)
#             else:
#                 tests.append({'error': test_serializer.errors, 'test_type': test_type})

#         return Response(
#             DiagnosticTestSerializer([t for t in tests if isinstance(t, DiagnosticTest)], many=True).data,
#             status=status.HTTP_200_OK
#         )

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
#                         {"error": "Router does not exist"},
#                         status=status.HTTP_404_NOT_FOUND
#                     )
#                 history = history.filter(router_id=router_id)
#             except ValueError:
#                 return Response(
#                     {"error": "Invalid router ID"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#         client_ip = request.query_params.get('client_ip')
#         isp_history = history
#         client_history = history
#         if client_ip:
#             try:
#                 client_ip_obj = IPAddress.objects.get(ip_address=client_ip)
#                 client_history = history.filter(client_ip=client_ip_obj)
#                 isp_history = history.filter(client_ip__isnull=True)
#             except IPAddress.DoesNotExist:
#                 return Response(
#                     {"error": "Client IP does not exist"},
#                     status=status.HTTP_404_NOT_FOUND
#                 )

#         time_frame = request.query_params.get('time_frame', 'hour')
#         now = timezone.now()
#         time_filters = {
#             'minute': now - timedelta(hours=1),
#             'hour': now - timedelta(days=1),
#             'day': now - timedelta(days=30),
#             'month': now - timedelta(days=365),
#         }
#         if time_frame in time_filters:
#             isp_history = isp_history.filter(timestamp__gte=time_filters[time_frame])
#             client_history = client_history.filter(timestamp__gte=time_filters[time_frame])

#         isp_serializer = SpeedTestHistorySerializer(isp_history, many=True)
#         client_serializer = SpeedTestHistorySerializer(client_history, many=True)

#         response_data = {
#             'isp': {
#                 'minute': isp_serializer.data[:60] if time_frame == 'minute' else [],
#                 'hour': isp_serializer.data[:24] if time_frame == 'hour' else [],
#                 'day': isp_serializer.data[:30] if time_frame == 'day' else [],
#                 'month': isp_serializer.data[:12] if time_frame == 'month' else [],
#             },
#             'client': {
#                 'minute': client_serializer.data[:60] if time_frame == 'minute' else [],
#                 'hour': client_serializer.data[:24] if time_frame == 'hour' else [],
#                 'day': client_serializer.data[:30] if time_frame == 'day' else [],
#                 'month': client_serializer.data[:12] if time_frame == 'month' else [],
#             }
#         }
#         return Response(response_data)










from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import subprocess
import dns.resolver
import shlex
import json
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.shortcuts import get_object_or_404
from network_management.models.network_diagnostics_model import (
    DiagnosticTest, SpeedTestHistory, NetworkAlert
)
from network_management.models.router_management_model import Router
from network_management.models.ip_address_model import IPAddress
from network_management.serializers.network_diagnostics_serializer import (
    DiagnosticTestSerializer, DiagnosticTestCreateSerializer, 
    SpeedTestHistorySerializer, NetworkAlertSerializer,
    BulkTestRequestSerializer
)

try:
    from routeros_api import RouterOsApiPool
except ImportError:
    RouterOsApiPool = None

class DiagnosticTestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve diagnostic tests with filtering and pagination.
        """
        tests = DiagnosticTest.objects.select_related('router', 'client_ip').all()

        # Apply filters
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

        status_filter = request.query_params.get('status')
        if status_filter:
            tests = tests.filter(status=status_filter)

        client_ip = request.query_params.get('client_ip')
        if client_ip:
            tests = tests.filter(client_ip__ip_address=client_ip)

        # Date range filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            try:
                start_date = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                tests = tests.filter(created_at__gte=start_date)
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        if end_date:
            try:
                end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                tests = tests.filter(created_at__lte=end_date)
            except ValueError:
                return Response(
                    {"error": "Invalid end_date format"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Pagination
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        start = (page - 1) * per_page
        end = start + per_page

        total_count = tests.count()
        tests = tests[start:end]

        serializer = DiagnosticTestSerializer(tests, many=True)
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page
            }
        })

    def post(self, request):
        """
        Create and run a single diagnostic test.
        """
        serializer = DiagnosticTestCreateSerializer(data=request.data)
        if serializer.is_valid():
            test = serializer.save(status='running')
            
            # Run test in background thread
            threading.Thread(target=self._run_test_async, args=(test,)).start()
            
            return Response(
                DiagnosticTestSerializer(test).data, 
                status=status.HTTP_202_ACCEPTED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _run_test_async(self, test):
        """Run test asynchronously and update results"""
        try:
            start_time = timezone.now()
            result = self.run_diagnostic_test(test)
            end_time = timezone.now()
            
            test.result = result
            test.status = 'success'
            test.duration = (end_time - start_time).total_seconds()
            test.save()
            
            # Check for alerts based on test results
            self._check_for_alerts(test, result)
            
            # Save speed test history if applicable
            if test.test_type == 'speedtest' and result.get('speed_test'):
                self._save_speed_test_history(test, result['speed_test'])
                
        except Exception as e:
            test.status = 'error'
            test.error_message = str(e)
            test.result = {'error': str(e)}
            test.save()

    def run_diagnostic_test(self, test):
        """Run the actual diagnostic test"""
        method_map = {
            'ping': self.run_ping_test,
            'traceroute': self.run_traceroute_test,
            'speedtest': self.run_speed_test,
            'dns': self.run_dns_test,
            'packet_loss': self.run_packet_loss_test,
            'health_check': self.run_health_check,
            'port_scan': self.run_port_scan,
        }
        method = method_map.get(test.test_type)
        if not method:
            raise ValueError(f"Unsupported test type: {test.test_type}")
        return method(test)

    def run_ping_test(self, test):
        """Run ping test with comprehensive results"""
        target = shlex.quote(test.target)
        try:
            # Run ping with 10 packets for better statistics
            result = subprocess.run(
                ['ping', '-c', '10', '-i', '0.2', '-W', '2', target],
                capture_output=True, text=True, timeout=30
            )
            
            if result.returncode != 0:
                raise Exception(f"Ping failed: {result.stderr}")
                
            output = result.stdout
            lines = output.split('\n')
            
            # Parse ping statistics
            stats_line = None
            for line in reversed(lines):
                if 'min/avg/max/mdev' in line:
                    stats_line = line
                    break
            
            if stats_line:
                stats = stats_line.split('=')[1].split('/')
                return {
                    'min_rtt': float(stats[0]),
                    'avg_rtt': float(stats[1]),
                    'max_rtt': float(stats[2]),
                    'mdev': float(stats[3].split(' ')[0]),
                    'packets_transmitted': 10,
                    'packets_received': int(lines[-2].split()[3]),
                    'packet_loss': float(lines[-2].split()[5].strip('%')),
                    'output': output
                }
            else:
                raise Exception("Could not parse ping statistics")
                
        except subprocess.TimeoutExpired:
            raise Exception("Ping test timed out")
        except Exception as e:
            raise Exception(f"Ping test failed: {str(e)}")

    def run_traceroute_test(self, test):
        """Run traceroute test"""
        target = shlex.quote(test.target)
        try:
            result = subprocess.run(
                ['traceroute', '-w', '2', '-q', '1', '-m', '30', target],
                capture_output=True, text=True, timeout=60
            )
            
            output = result.stdout
            hops = []
            
            for line in output.split('\n')[1:]:
                parts = line.strip().split()
                if parts and parts[0].isdigit():
                    hop_data = {
                        'hop': int(parts[0]),
                        'hostname': parts[1] if len(parts) > 1 else '*',
                        'ip': parts[1] if len(parts) > 1 else '*',
                        'time': parts[2] if len(parts) > 2 else '*'
                    }
                    
                    # Extract IP if hostname is different
                    if len(parts) > 2 and '(' in parts[1] and ')' in parts[1]:
                        hop_data['hostname'] = parts[1].split('(')[0]
                        hop_data['ip'] = parts[1].split('(')[1].rstrip(')')
                    
                    hops.append(hop_data)
            
            return {
                'hops': hops,
                'hop_count': len(hops),
                'output': output,
                'target_reached': any(hop['hostname'] != '*' for hop in hops[-3:]) if hops else False
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("Traceroute timed out")
        except Exception as e:
            raise Exception(f"Traceroute failed: {str(e)}")

    def run_speed_test(self, test):
        """Run comprehensive speed test"""
        if not RouterOsApiPool:
            # Fallback to speedtest-cli if RouterOS API not available
            return self._run_speedtest_cli(test)
            
        try:
            router = test.router
            api = RouterOsApiPool(
                router.ip, username=router.username, password=router.password, port=router.port
            ).get_api()

            # Run bandwidth test
            bandwidth = api.get_resource('/tool/bandwidth-test')
            result = bandwidth.call('test', {
                'protocol': 'tcp',
                'direction': 'both',
                'duration': '10s',
                'random-data': 'yes'
            })

            # Extract results
            isp_download = float(result.get('rx-speed', 0)) / 1_000_000  # Convert to Mbps
            isp_upload = float(result.get('tx-speed', 0)) / 1_000_000
            latency = float(result.get('ping', 0))
            jitter = float(result.get('jitter', 0))

            # Get client-specific speeds if client IP provided
            client_download = isp_download
            client_upload = isp_upload
            
            if test.client_ip:
                client_download, client_upload = self._get_client_speeds(api, test.client_ip.ip_address)

            api.close()

            return {
                'speed_test': {
                    'download': round(isp_download, 2),
                    'upload': round(isp_upload, 2),
                    'client_download': round(client_download, 2) if test.client_ip else None,
                    'client_upload': round(client_upload, 2) if test.client_ip else None,
                    'latency': round(latency, 2),
                    'jitter': round(jitter, 2),
                    'server': 'MikroTik Bandwidth Test',
                    'isp': router.isp_name or 'Unknown ISP',
                    'device': test.client_ip.assigned_to.device_name if test.client_ip and test.client_ip.assigned_to else 'Unknown',
                    'connection_type': test.client_ip.connection_type if test.client_ip else 'Unknown'
                }
            }
            
        except Exception as e:
            raise Exception(f"Speed test failed: {str(e)}")

    def _run_speedtest_cli(self, test):
        """Fallback speed test using speedtest-cli"""
        try:
            result = subprocess.run(
                ['speedtest-cli', '--json', '--simple'],
                capture_output=True, text=True, timeout=120
            )
            
            if result.returncode != 0:
                raise Exception("Speedtest-cli failed")
                
            data = json.loads(result.stdout)
            
            return {
                'speed_test': {
                    'download': float(data['download']) / 1_000_000,  # Convert to Mbps
                    'upload': float(data['upload']) / 1_000_000,
                    'latency': float(data['ping']),
                    'server': 'Speedtest.net',
                    'isp': 'Unknown'
                }
            }
            
        except Exception as e:
            raise Exception(f"Speedtest-cli failed: {str(e)}")

    def _get_client_speeds(self, api, client_ip):
        """Get client-specific speed limits from QoS"""
        try:
            queue_resource = api.get_resource('/queue/simple')
            queues = queue_resource.get(target=client_ip)
            
            if queues:
                queue = queues[0]
                download_limit = float(queue.get('max-limit', '0/0').split('/')[0]) / 1_000_000
                upload_limit = float(queue.get('max-limit', '0/0').split('/')[1]) / 1_000_000
                return download_limit, upload_limit
                
        except Exception:
            pass
            
        return 0, 0

    def run_dns_test(self, test):
        """Run DNS resolution test"""
        try:
            # Test multiple record types
            record_types = ['A', 'AAAA', 'MX', 'NS', 'TXT']
            results = {}
            
            for record_type in record_types:
                try:
                    answers = dns.resolver.resolve(test.target, record_type)
                    results[record_type] = [r.to_text() for r in answers]
                except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers):
                    results[record_type] = []
            
            # Test response time
            import time
            start_time = time.time()
            dns.resolver.resolve(test.target, 'A')
            response_time = (time.time() - start_time) * 1000  # Convert to ms
            
            return {
                'hostname': test.target,
                'records': results,
                'response_time': round(response_time, 2),
                'primary_ip': results.get('A', [])[:1] or []
            }
            
        except Exception as e:
            raise Exception(f"DNS test failed: {str(e)}")

    def run_packet_loss_test(self, test):
        """Run packet loss test with extended analysis"""
        target = shlex.quote(test.target)
        try:
            # Run extended ping test
            result = subprocess.run(
                ['ping', '-c', '50', '-i', '0.1', '-W', '1', target],
                capture_output=True, text=True, timeout=30
            )
            
            output = result.stdout
            lines = output.split('\n')
            
            # Parse results
            stats_line = None
            for line in reversed(lines):
                if 'packet loss' in line:
                    stats_line = line
                    break
            
            if stats_line:
                parts = stats_line.split(',')
                packet_loss = float(parts[2].split('%')[0].strip())
                transmitted = int(parts[0].split()[0])
                received = int(parts[1].split()[0])
                
                # Parse RTT statistics if available
                rtt_stats = {}
                for line in lines:
                    if 'min/avg/max/mdev' in line:
                        rtt_parts = line.split('=')[1].split('/')
                        rtt_stats = {
                            'min': float(rtt_parts[0]),
                            'avg': float(rtt_parts[1]),
                            'max': float(rtt_parts[2]),
                            'mdev': float(rtt_parts[3].split()[0])
                        }
                        break
                
                return {
                    'packet_loss': packet_loss,
                    'packets_transmitted': transmitted,
                    'packets_received': received,
                    'rtt_stats': rtt_stats,
                    'output': output
                }
            else:
                raise Exception("Could not parse packet loss statistics")
                
        except subprocess.TimeoutExpired:
            raise Exception("Packet loss test timed out")
        except Exception as e:
            raise Exception(f"Packet loss test failed: {str(e)}")

    def run_health_check(self, test):
        """Run comprehensive router health check"""
        if not RouterOsApiPool:
            raise Exception("RouterOS API not available")
            
        try:
            router = test.router
            api = RouterOsApiPool(
                router.ip, username=router.username, password=router.password, port=router.port
            ).get_api()

            # System resource usage
            sys_res = api.get_resource('/system/resource').get()[0]
            cpu_load = float(sys_res.get('cpu-load', 0))
            free_memory = float(sys_res.get('free-memory', 0))
            total_memory = float(sys_res.get('total-memory', 1))
            memory_usage = ((total_memory - free_memory) / total_memory) * 100
            
            free_hdd = float(sys_res.get('free-hdd-space', 0))
            total_hdd = float(sys_res.get('total-hdd-space', 1))
            disk_usage = ((total_hdd - free_hdd) / total_hdd) * 100

            # Interface statistics
            interface_res = api.get_resource('/interface')
            interfaces = []
            for iface in interface_res.get():
                interfaces.append({
                    'name': iface.get('name'),
                    'type': iface.get('type'),
                    'running': iface.get('running') == 'true',
                    'rx_bytes': int(iface.get('rx-byte', 0)),
                    'tx_bytes': int(iface.get('tx-byte', 0))
                })

            # Service status
            services = api.get_resource('/system/service').get()
            service_status = []
            for service in services:
                service_status.append({
                    'name': service['name'],
                    'status': 'running' if service.get('running') == 'true' else 'stopped'
                })

            # System uptime
            uptime = sys_res.get('uptime', '0s')

            api.close()

            return {
                'health_check': {
                    'cpu_usage': round(cpu_load, 2),
                    'memory_usage': round(memory_usage, 2),
                    'disk_usage': round(disk_usage, 2),
                    'uptime': uptime,
                    'interfaces': interfaces,
                    'services': service_status,
                    'health_score': self._calculate_health_score(cpu_load, memory_usage, disk_usage)
                }
            }
            
        except Exception as e:
            raise Exception(f"Health check failed: {str(e)}")

    def run_port_scan(self, test):
        """Run basic port scan"""
        target = shlex.quote(test.target)
        try:
            # Scan common ports
            common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3389]
            open_ports = []
            
            for port in common_ports:
                try:
                    result = subprocess.run(
                        ['nc', '-z', '-w', '2', target, str(port)],
                        capture_output=True, text=True, timeout=5
                    )
                    if result.returncode == 0:
                        open_ports.append(port)
                except subprocess.TimeoutExpired:
                    continue
            
            return {
                'target': target,
                'open_ports': open_ports,
                'ports_scanned': len(common_ports),
                'ports_open': len(open_ports)
            }
            
        except Exception as e:
            raise Exception(f"Port scan failed: {str(e)}")

    def _calculate_health_score(self, cpu, memory, disk):
        """Calculate overall health score (0-100)"""
        scores = []
        
        # CPU score (lower is better)
        if cpu <= 50: scores.append(100)
        elif cpu <= 75: scores.append(75)
        elif cpu <= 90: scores.append(50)
        else: scores.append(25)
        
        # Memory score (lower is better)
        if memory <= 60: scores.append(100)
        elif memory <= 80: scores.append(75)
        elif memory <= 90: scores.append(50)
        else: scores.append(25)
        
        # Disk score (lower is better)
        if disk <= 70: scores.append(100)
        elif disk <= 85: scores.append(75)
        elif disk <= 95: scores.append(50)
        else: scores.append(25)
        
        return round(sum(scores) / len(scores))

    def _check_for_alerts(self, test, result):
        """Check test results and create alerts if necessary"""
        alerts = []
        
        if test.test_type == 'ping':
            if result.get('packet_loss', 0) > 10:
                alerts.append(('high_latency', 'medium', 
                             f"High packet loss to {test.target}",
                             f"Packet loss: {result['packet_loss']}%"))
        
        elif test.test_type == 'speedtest':
            speed_data = result.get('speed_test', {})
            if speed_data.get('download', 0) < 10:  # Less than 10 Mbps
                alerts.append(('slow_speed', 'high',
                             f"Slow download speed on {test.router}",
                             f"Download: {speed_data['download']} Mbps"))
        
        elif test.test_type == 'health_check':
            health_data = result.get('health_check', {})
            if health_data.get('cpu_usage', 0) > 90:
                alerts.append(('high_usage', 'high',
                             f"High CPU usage on {test.router}",
                             f"CPU: {health_data['cpu_usage']}%"))
        
        # Create alerts
        for alert_type, severity, title, description in alerts:
            NetworkAlert.objects.create(
                router=test.router,
                alert_type=alert_type,
                severity=severity,
                title=title,
                description=description,
                related_test=test
            )

    def _save_speed_test_history(self, test, speed_data):
        """Save speed test results to history"""
        SpeedTestHistory.objects.create(
            router=test.router,
            client_ip=test.client_ip,
            download=speed_data.get('download'),
            upload=speed_data.get('upload'),
            client_download=speed_data.get('client_download'),
            client_upload=speed_data.get('client_upload'),
            latency=speed_data.get('latency'),
            jitter=speed_data.get('jitter'),
            server=speed_data.get('server', ''),
            isp=speed_data.get('isp', ''),
            device=speed_data.get('device', ''),
            connection_type=speed_data.get('connection_type', '')
        )

class DiagnosticTestBulkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Run multiple diagnostic tests in parallel.
        """
        serializer = BulkTestRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        router_id = data['router_id']
        target = data['target']
        client_ip_id = data.get('client_ip_id')
        test_types = data['test_types']
        test_mode = data.get('test_mode', 'standard')

        # Create test objects
        tests = []
        for test_type in test_types:
            test_data = {
                'router_id': router_id,
                'test_type': test_type,
                'target': target,
                'client_ip_id': client_ip_id,
                'test_mode': test_mode
            }
            test_serializer = DiagnosticTestCreateSerializer(data=test_data)
            if test_serializer.is_valid():
                test = test_serializer.save(status='running')
                tests.append(test)
            else:
                tests.append({'error': test_serializer.errors, 'test_type': test_type})

        # Run tests in parallel
        def run_test(test):
            if isinstance(test, DiagnosticTest):
                try:
                    start_time = timezone.now()
                    result = DiagnosticTestListView().run_diagnostic_test(test)
                    end_time = timezone.now()
                    
                    test.result = result
                    test.status = 'success'
                    test.duration = (end_time - start_time).total_seconds()
                    test.save()
                    
                    return test
                except Exception as e:
                    test.status = 'error'
                    test.error_message = str(e)
                    test.save()
                    return test
            return test

        # Use thread pool for parallel execution
        with ThreadPoolExecutor(max_workers=min(len(tests), 5)) as executor:
            future_to_test = {executor.submit(run_test, test): test for test in tests if isinstance(test, DiagnosticTest)}
            completed_tests = []
            
            for future in as_completed(future_to_test):
                completed_tests.append(future.result())

        # Include tests that had serialization errors
        error_tests = [t for t in tests if not isinstance(t, DiagnosticTest)]
        all_tests = completed_tests + error_tests

        # Serialize successful tests
        successful_tests = [t for t in all_tests if isinstance(t, DiagnosticTest)]
        serializer = DiagnosticTestSerializer(successful_tests, many=True)
        
        return Response({
            'completed_tests': serializer.data,
            'errors': [t for t in all_tests if not isinstance(t, DiagnosticTest)]
        }, status=status.HTTP_200_OK)

class SpeedTestHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve speed test history with time-based aggregation.
        """
        history = SpeedTestHistory.objects.select_related('router', 'client_ip').all()

        # Filter by router
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

        # Filter by client IP
        client_ip = request.query_params.get('client_ip')
        if client_ip:
            try:
                client_ip_obj = IPAddress.objects.get(ip_address=client_ip)
                history = history.filter(client_ip=client_ip_obj)
            except IPAddress.DoesNotExist:
                return Response(
                    {"error": "Client IP does not exist"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Time frame filtering
        time_frame = request.query_params.get('time_frame', 'hour')
        now = timezone.now()
        time_filters = {
            'minute': now - timedelta(hours=1),
            'hour': now - timedelta(days=1),
            'day': now - timedelta(days=30),
            'month': now - timedelta(days=365),
        }
        
        if time_frame in time_filters:
            history = history.filter(timestamp__gte=time_filters[time_frame])

        # Separate ISP and client history
        isp_history = history.filter(client_ip__isnull=True)
        client_history = history.filter(client_ip__isnull=False)

        # Aggregate data based on time frame
        def aggregate_data(queryset, time_frame):
            if time_frame == 'minute':
                return list(queryset.order_by('timestamp')[:60])
            elif time_frame == 'hour':
                # Group by hour
                return list(queryset.order_by('timestamp')[:24])
            elif time_frame == 'day':
                return list(queryset.order_by('timestamp')[:30])
            elif time_frame == 'month':
                return list(queryset.order_by('timestamp')[:12])
            return list(queryset)

        isp_serializer = SpeedTestHistorySerializer(aggregate_data(isp_history, time_frame), many=True)
        client_serializer = SpeedTestHistorySerializer(aggregate_data(client_history, time_frame), many=True)

        return Response({
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
            },
            'time_frame': time_frame,
            'summary': {
                'isp_tests': isp_history.count(),
                'client_tests': client_history.count(),
                'latest_test': isp_history.first().timestamp if isp_history.exists() else None
            }
        })

class NetworkAlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve network alerts with filtering options.
        """
        alerts = NetworkAlert.objects.select_related('router', 'related_test').all()

        # Filter by resolution status
        resolved = request.query_params.get('resolved')
        if resolved is not None:
            alerts = alerts.filter(is_resolved=resolved.lower() == 'true')

        # Filter by severity
        severity = request.query_params.get('severity')
        if severity:
            alerts = alerts.filter(severity=severity)

        # Filter by router
        router_id = request.query_params.get('router')
        if router_id:
            try:
                router_id = int(router_id)
                alerts = alerts.filter(router_id=router_id)
            except ValueError:
                pass

        # Pagination
        page = int(request.query_params.get('page', 1))
        per_page = int(request.query_params.get('per_page', 20))
        start = (page - 1) * per_page
        end = start + per_page

        total_count = alerts.count()
        alerts = alerts[start:end]

        serializer = NetworkAlertSerializer(alerts, many=True)
        return Response({
            'data': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': (total_count + per_page - 1) // per_page
            }
        })

    def post(self, request, pk=None):
        """
        Resolve an alert.
        """
        if pk:
            alert = get_object_or_404(NetworkAlert, pk=pk)
            alert.resolve()
            serializer = NetworkAlertSerializer(alert)
            return Response(serializer.data)
        return Response({"error": "Alert ID required"}, status=status.HTTP_400_BAD_REQUEST)