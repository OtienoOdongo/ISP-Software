import React, { useState } from 'react';

// Mock data for diagnostics
const mockDiagnostics = {
  ping: { result: 'Ping: 20ms' },
  traceroute: {
    result: `
      1  192.168.1.1  2ms
      2  10.0.0.1     4ms
      3  starlink.com 10ms
    `,
  },
  healthCheck: { status: 'Connection is stable with 99.9% uptime' },
};

const NetworkDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    ping: null,
    traceroute: null,
    healthCheck: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDiagnostics = () => {
    setLoading(true);
    setError(null);

    // Simulate API call with a delay
    setTimeout(() => {
      try {
        // Set mock data
        setDiagnostics(mockDiagnostics);
      } catch (err) {
        setError('Failed to run diagnostics');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Network Diagnostics</h2>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={runDiagnostics}
        disabled={loading}
      >
        {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </button>

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      <div className="mt-6">
        <h3 className="font-semibold text-gray-700">Ping Test</h3>
        <p>{diagnostics.ping ? diagnostics.ping.result : 'No data yet.'}</p>

        <h3 className="font-semibold text-gray-700 mt-4">Traceroute</h3>
        <pre className="bg-gray-100 p-2 rounded">
          {diagnostics.traceroute ? diagnostics.traceroute.result : 'No data yet.'}
        </pre>

        <h3 className="font-semibold text-gray-700 mt-4">Connection Health Check</h3>
        <p>{diagnostics.healthCheck ? diagnostics.healthCheck.status : 'No data yet.'}</p>
      </div>
    </div>
  );
};

export default NetworkDiagnostics;

