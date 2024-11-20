import React, { useState } from 'react';
import { RefreshCw, Wifi, UploadCloud, AlertCircle } from 'lucide-react';

const RouterManagement = () => {
  const [status, setStatus] = useState({
    identity: { name: 'MikroTik-R1' },
    uptime: '1d 4h 23m',
    version: '6.49.7',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [firmwareVersion, setFirmwareVersion] = useState('');

  // Mock function to fetch router status
  const fetchRouterStatus = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      setStatus({
        identity: { name: 'MikroTik-R1' },
        uptime: '1d 5h 12m',
        version: '6.49.7',
      });
      setLoading(false);
    }, 2000);
  };

  // Mock function to update firmware
  const updateFirmware = () => {
    if (!firmwareVersion) {
      alert('Please enter a firmware version.');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      alert(`Firmware update to version ${firmwareVersion} initiated.`);
      setLoading(false);
    }, 2000);
  };

  // Mock function to share internet
  const shareInternet = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      alert('Internet sharing enabled successfully.');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Router Management
      </h2>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Router Status Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-blue-500" />
          Router Status
        </h3>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div>
            <p><strong>Identity:</strong> {status?.identity?.name || 'N/A'}</p>
            <p><strong>Uptime:</strong> {status?.uptime || 'N/A'}</p>
            <p><strong>Version:</strong> {status?.version || 'N/A'}</p>
          </div>
        )}
        <button
          onClick={fetchRouterStatus}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 flex items-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          {loading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* Firmware Update Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <UploadCloud className="w-5 h-5 mr-2 text-green-500" />
          Firmware Update
        </h3>
        <div className="mb-3">
          <label htmlFor="firmwareVersion" className="block text-gray-700">
            Enter Firmware Version
          </label>
          <input
            type="text"
            id="firmwareVersion"
            className="mt-1 p-2 border border-gray-300 rounded-lg w-full"
            value={firmwareVersion}
            onChange={(e) => setFirmwareVersion(e.target.value)}
            placeholder="e.g., 6.47.9"
          />
        </div>
        <button
          onClick={updateFirmware}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 flex items-center"
        >
          <UploadCloud className="w-5 h-5 mr-2" />
          {loading ? 'Updating...' : 'Update Firmware'}
        </button>
      </div>

      {/* Internet Sharing Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Wifi className="w-5 h-5 mr-2 text-indigo-500" />
          Internet Sharing
        </h3>
        <p className="text-gray-600 mb-4">
          Configure the router to share internet with clients via NAT.
        </p>
        <button
          onClick={shareInternet}
          disabled={loading}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 flex items-center"
        >
          <Wifi className="w-5 h-5 mr-2" />
          {loading ? 'Configuring...' : 'Enable Internet Sharing'}
        </button>
      </div>
    </div>
  );
};

export default RouterManagement;
