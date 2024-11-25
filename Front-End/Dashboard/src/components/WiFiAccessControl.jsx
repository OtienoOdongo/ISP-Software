import React, { useState } from 'react';

const WiFiAccessControl = () => {
  const [accessControl, setAccessControl] = useState({
    isolation: false,
    maxDevices: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const configureAccessControl = () => {
    setLoading(true);
    setError(null);

    const mockResponse = {
      isolation: true,
      maxDevices: 1,
      message: 'WiFi Access Control configured successfully!',
    };

    // Simulating API response delay
    setTimeout(() => {
      setAccessControl({
        isolation: mockResponse.isolation,
        maxDevices: mockResponse.maxDevices,
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 bg-gray-50 rounded shadow mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">WiFi Access Control</h2>
      <p className="text-gray-600">
        Ensure users cannot share your WiFi connection. Apply isolation and limit device connections.
      </p>

      <button
        className="px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        onClick={configureAccessControl}
        disabled={loading}
      >
        {loading ? 'Applying Settings...' : 'Apply Access Control'}
      </button>

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700">Current Settings:</h3>
        <ul className="mt-2 space-y-2">
          <li>
            <strong>Client Isolation:</strong>{' '}
            {accessControl.isolation ? (
              <span className="text-green-600">Enabled</span>
            ) : (
              <span className="text-red-600">Disabled</span>
            )}
          </li>
          <li>
            <strong>Max Devices per User:</strong> {accessControl.maxDevices}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WiFiAccessControl;
