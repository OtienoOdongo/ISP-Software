import React, { useState } from 'react';

const FirmwareUpdates = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('Pending');
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [firmwareVersion, setFirmwareVersion] = useState('v7.3.3');
  const [progress, setProgress] = useState(0);

  // Simulate a firmware update process
  const handleStartUpdate = () => {
    setIsUpdating(true);
    setUpdateStatus('In Progress');
    let progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setUpdateStatus('Completed');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleDeviceSelection = (deviceId) => {
    if (selectedDevices.includes(deviceId)) {
      setSelectedDevices(selectedDevices.filter((id) => id !== deviceId));
    } else {
      setSelectedDevices([...selectedDevices, deviceId]);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
        Firmware Updates
      </h1>

      {/* Section Title */}
      <div className="text-center mb-6">
        <p className="text-xl text-gray-700 font-medium">
          Manage and deploy firmware updates to Mikrotik router devices from the dashboard.
        </p>
      </div>

      {/* Device Selection */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Select Devices</h2>
        <div className="space-y-4">
          {['Device 1', 'Device 2', 'Device 3'].map((device, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                id={device}
                className="mr-3"
                onChange={() => handleDeviceSelection(device)}
              />
              <label htmlFor={device} className="text-lg font-medium text-gray-700">
                {device}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Firmware Update Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Firmware Update</h2>
        <div className="mb-4">
          <p className="text-lg text-gray-700">
            Current Firmware Version: <span className="font-bold">{firmwareVersion}</span>
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">Select Firmware Version</p>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={firmwareVersion}
            onChange={(e) => setFirmwareVersion(e.target.value)}
          >
            <option value="v7.3.3">v7.3.3</option>
            <option value="v7.4.0">v7.4.0</option>
            <option value="v7.5.0">v7.5.0</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleStartUpdate}
            className={`px-6 py-2 rounded-md font-semibold text-white transition duration-300 focus:outline-none ${
              isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={isUpdating || selectedDevices.length === 0}
          >
            {isUpdating ? 'Updating...' : 'Start Update'}
          </button>
          <button
            className="px-6 py-2 rounded-md font-semibold text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-100 transition duration-300"
          >
            View Update Logs
          </button>
        </div>
      </div>

      {/* Update Progress */}
      {isUpdating && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-indigo-600 mb-4">Update Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-gray-600 mt-4">{progress}%</p>
        </div>
      )}

      {/* Status */}
      <div className="text-center mt-6">
        <p
          className={`text-xl font-semibold ${
            updateStatus === 'In Progress'
              ? 'text-yellow-600'
              : updateStatus === 'Completed'
              ? 'text-green-600'
              : 'text-gray-600'
          }`}
        >
          {updateStatus === 'In Progress'
            ? 'Firmware update is in progress...'
            : updateStatus === 'Completed'
            ? 'Firmware update completed successfully!'
            : 'No updates currently pending.'}
        </p>
      </div>
    </div>
  );
};

export default FirmwareUpdates;
