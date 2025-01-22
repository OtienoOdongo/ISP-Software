from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from network_management.models.Network_Diagnostic import DiagnosticResult
from network_management.serializers.Network_Diagnostic import DiagnosticResultSerializer

class NetworkDiagnosticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling network diagnostics operations.
    """
    queryset = DiagnosticResult.objects.all()
    serializer_class = DiagnosticResultSerializer

    @action(detail=False, methods=['post'])
    def run_diagnostics(self, request):
        """
        Endpoint to run all network diagnostics.

        Expects:
            - target (str): The domain or IP to test.

        Returns:
            - A dictionary with diagnostic results for each test type.
        """
        target = request.data.get('target', 'example.com')

        # Mock function to simulate diagnostics. In a real scenario, replace with actual diagnostics:
        def run_test(test_type):
            try:
                if test_type == 'ping':
                    return {"result": "20ms", "status": "success"}
                elif test_type == 'traceroute':
                    return {
                        "result": [{"hop": 1, "ip": "192.168.1.1", "time": "2ms"},
                                   {"hop": 2, "ip": "10.0.0.1", "time": "4ms"},
                                   {"hop": 3, "ip": "isp.gateway", "time": "10ms"}],
                        "status": "success"
                    }
                elif test_type == 'health_check':
                    return {"result": "All services are operational", "status": "success"}
                elif test_type == 'bandwidth':
                    return {"result": {"download": "100 Mbps", "upload": "50 Mbps"}, "status": "success"}
                elif test_type == 'dns':
                    return {"result": "DNS resolution successful", "status": "success"}
                return {"result": "Test not implemented", "status": "error"}
            except Exception as e:
                return {"result": str(e), "status": "error"}

        results = {}
        for test_type in ['ping', 'traceroute', 'health_check', 'bandwidth', 'dns']:
            test_result = run_test(test_type)
            # Save results to the database
            DiagnosticResult.objects.create(
                test_type=test_type,
                target=target,
                result=test_result['result'],  # No need to call json.dumps here
                status=test_result['status']
            )
            results[test_type] = test_result

        return Response(results, status=status.HTTP_200_OK)
