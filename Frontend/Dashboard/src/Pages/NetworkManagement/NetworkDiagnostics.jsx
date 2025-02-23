



import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

// Mock data for diagnostics
const mockDiagnostics = {
  ping: { result: '20ms', status: 'success', target: 'example.com' },
  traceroute: {
    result: [
      { hop: 1, ip: '192.168.1.1', time: '2ms' },
      { hop: 2, ip: '10.0.0.1', time: '4ms' },
      { hop: 3, ip: 'isp.gateway', time: '10ms' },
    ],
    status: 'success',
    target: 'example.com',
  },
  healthCheck: { status: 'All services are operational', result: true },
  bandwidth: { download: '100 Mbps', upload: '50 Mbps', status: 'success' },
  dns: { result: 'DNS resolution successful', status: 'success', target: 'example.com' },
};

const NetworkDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    ping: { result: null, status: 'idle', target: 'example.com' },
    traceroute: { result: null, status: 'idle', target: 'example.com' },
    healthCheck: { result: null, status: 'idle' },
    bandwidth: { result: null, status: 'idle' },
    dns: { result: null, status: 'idle', target: 'example.com' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');

  const runDiagnostics = () => {
    setLoading(true);
    setError(null);

    // Simulate API call with a delay
    setTimeout(() => {
      try {
        setDiagnostics({
          ...mockDiagnostics,
          ping: { ...mockDiagnostics.ping, target: diagnosticsTarget },
          traceroute: { ...mockDiagnostics.traceroute, target: diagnosticsTarget },
          dns: { ...mockDiagnostics.dns, target: diagnosticsTarget },
        });
      } catch (err) {
        setError('Failed to run diagnostics');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  useEffect(() => {
    // Here you could initialize or fetch initial diagnostic data if needed
    return () => {
      // Cleanup if necessary, like cancelling API calls
    };
  }, []);

  const renderStatusIcon = (status) => {
    if (loading) return <FaSpinner className="text-gray-500 animate-spin inline-block mr-2" />;
    if (status === 'success') return <FaCheckCircle className="text-green-500 inline-block mr-2" />;
    if (status === 'error') return <FaTimesCircle className="text-red-500 inline-block mr-2" />;
    return null;
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Network Diagnostics</h2>
      <div className="flex items-center mb-4">
        <input
          type="text"
          className="border p-2 rounded-l w-64"
          placeholder="Enter target (e.g., example.com)"
          value={diagnosticsTarget}
          onChange={(e) => setDiagnosticsTarget(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:opacity-50"
          onClick={runDiagnostics}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center">
            {renderStatusIcon(diagnostics.ping.status)}
            Ping Test ({diagnostics.ping.target})
          </h3>
          <p>{diagnostics.ping.result ? `Latency: ${diagnostics.ping.result}` : 'No data yet.'}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center">
            {renderStatusIcon(diagnostics.traceroute.status)}
            Traceroute ({diagnostics.traceroute.target})
          </h3>
          {diagnostics.traceroute.result ? (
            <ul className="mt-2 bg-gray-100 p-2 rounded">
              {diagnostics.traceroute.result.map((hop, index) => (
                <li key={index} className="mb-1">
                  Hop {hop.hop}: {hop.ip} - {hop.time}
                </li>
              ))}
            </ul>
          ) : (
            <p>No data yet.</p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center">
            {renderStatusIcon(diagnostics.healthCheck.status)}
            Application Health Check
          </h3>
          <p>{diagnostics.healthCheck.result !== null ? diagnostics.healthCheck.status : 'No data yet.'}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center">
            {renderStatusIcon(diagnostics.bandwidth.status)}
            Bandwidth Check
          </h3>
          <p>{diagnostics.bandwidth.result ? `Download: ${diagnostics.bandwidth.download} | Upload: ${diagnostics.bandwidth.upload}` : 'No data yet.'}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center">
            {renderStatusIcon(diagnostics.dns.status)}
            DNS Resolution ({diagnostics.dns.target})
          </h3>
          <p>{diagnostics.dns.result ? diagnostics.dns.result : 'No data yet.'}</p>
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>Note: Diagnose network performance and service availability. Results will refresh each time you run diagnostics.</p>
      </div>
    </div>
  );
};

export default NetworkDiagnostics;