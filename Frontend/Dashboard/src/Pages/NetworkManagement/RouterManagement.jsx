
import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, UploadCloud, AlertCircle } from 'lucide-react';

const RouterManagement = () => {
  // Mock data for routers
  const mockRouters = [
    { id: 'router1', name: 'MikroTik-R1', status: 'Connected', bandwidth: '500Mbps', uptime: '1d 4h 23m', version: '6.49.7' },
    { id: 'router2', name: 'MikroTik-R2', status: 'Disconnected', bandwidth: '1Gbps', uptime: 'N/A', version: '6.48.3' }
  ];

  const [routers, setRouters] = useState([]);
  const [currentRouter, setCurrentRouter] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firmwareVersion, setFirmwareVersion] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setRouters(mockRouters);
      setCurrentRouter(mockRouters[0]); // Default to first router
      setIsLoading(false);
    }, 1000); // Simulate a delay for API response
  }, []);

  const fetchRouterStatus = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setCurrentRouter(prev => ({
        ...prev,
        uptime: '1d 5h 12m',
        version: '6.49.7',
      }));
      setIsLoading(false);
    }, 2000);
  };

  const updateFirmware = () => {
    if (!firmwareVersion) {
      alert('Please enter a firmware version.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      alert(`Firmware update to version ${firmwareVersion} initiated.`);
      setCurrentRouter(prev => ({ ...prev, version: firmwareVersion }));
      setFirmwareVersion('');
      setIsLoading(false);
    }, 2000);
  };

  const shareInternet = () => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      alert('Internet sharing enabled successfully.');
      setIsLoading(false);
    }, 2000);
  };

  const updateRouterStatus = (action) => {
    setStatus(`Router ${action === 'connect' ? 'connected' : 'disconnected'}`);
    setCurrentRouter({ ...currentRouter, status: action === 'connect' ? 'Connected' : 'Disconnected' });
  };

  const RouterSelector = () => (
    <div className="mb-6">
      <label htmlFor="routerSelector" className="block text-sm font-medium text-gray-700 mb-2">
        Select Router:
      </label>
      <select
        id="routerSelector"
        value={currentRouter ? currentRouter.id : ''}
        onChange={(e) => setCurrentRouter(routers.find(r => r.id === e.target.value) || null)}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
         focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {Array.isArray(routers) && routers.length > 0 ?
          routers.map(router => (
            <option key={router.id} value={router.id}>
              {router.name} - {router.status}
            </option>
          )) :
          <option value="">No routers available</option>
        }
      </select>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
        Router Management 
      </h2>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="w-6 h-6 mr-3" />
          <p className="text-lg">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center">
          <p className="text-2xl text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          <RouterSelector />
          {currentRouter && (
            <div className="bg-white p-6 rounded-lg shadow-xl mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Wifi className="w-8 h-8 mr-2 text-blue-500" />
                Router Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div><strong>Identity:</strong> {currentRouter.name}</div>
                <div><strong>Uptime:</strong> {currentRouter.uptime}</div>
                <div><strong>Version:</strong> {currentRouter.version}</div>
                <div><strong>Status:</strong>
                  <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                     ${currentRouter.status === 'Connected' ? 'bg-green-100 text-green-800' 
                     : 'bg-red-100 text-red-800'}`}>
                    {currentRouter.status}
                  </span>
                </div>
                <div><strong>Bandwidth:</strong> {currentRouter.bandwidth}</div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={fetchRouterStatus}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                   shadow-lg flex items-center justify-center"
                >
                  <RefreshCw className="w-6 h-6 mr-2" />
                  {isLoading ? 'Refreshing...' : 'Refresh Status'}
                </button>
                <button
                  onClick={() => updateRouterStatus(currentRouter.status === 'Connected' ? 'disconnect' : 'connect')}
                  className={`w-full sm:w-auto px-5 py-3 rounded-lg shadow-lg flex items-center 
                    justify-center ${currentRouter.status === 'Connected' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                      'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  <Wifi className="w-6 h-6 mr-2" />
                  {currentRouter.status === 'Connected' ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          )}

          {/* Firmware Update Section */}
          <div className="bg-white p-6 rounded-lg shadow-xl mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <UploadCloud className="w-8 h-8 mr-2 text-green-500" />
              Firmware Update
            </h3>
            <div className="mb-4">
              <label htmlFor="firmwareVersion" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Firmware Version
              </label>
              <input
                type="text"
                id="firmwareVersion"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                placeholder="e.g., 6.47.9"
              />
            </div>
            <button
              onClick={updateFirmware}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-3 bg-green-600 text-white rounded-lg shadow-lg 
              flex items-center justify-center hover:bg-green-700"
            >
              <UploadCloud className="w-6 h-6 mr-2" />
              {isLoading ? 'Updating...' : 'Update Firmware'}
            </button>
          </div>

          {/* Internet Sharing Section */}
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Wifi className="w-8 h-8 mr-2 text-indigo-500" />
              Internet Sharing
            </h3>
            <p className="text-gray-600 mb-4">
              Configure the router to share internet with clients via NAT.
            </p>
            <button
              onClick={shareInternet}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-lg shadow-lg
               flex items-center justify-center hover:bg-indigo-700"
            >
              <Wifi className="w-6 h-6 mr-2" />
              {isLoading ? 'Configuring...' : 'Enable Internet Sharing'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RouterManagement;