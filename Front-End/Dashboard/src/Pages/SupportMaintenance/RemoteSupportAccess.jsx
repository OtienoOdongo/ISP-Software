import React, { useState } from 'react';

const RemoteSupportAccess = () => {
  const [isRemoteSessionActive, setIsRemoteSessionActive] = useState(false);

  // Toggle remote support session
  const handleSessionToggle = () => {
    setIsRemoteSessionActive(!isRemoteSessionActive);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
        Remote Support Access
      </h1>

      {/* Section Title */}
      <div className="text-center mb-6">
        <p className="text-xl text-gray-700 font-medium">
          Enable remote troubleshooting and support for users.
        </p>
      </div>

      {/* Remote Support Card */}
      <div className="bg-white p-6 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-2xl max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-indigo-600">Remote Support Status</h2>
          <div
            className={`px-4 py-1 text-sm rounded-full font-medium ${
              isRemoteSessionActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isRemoteSessionActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          {isRemoteSessionActive
            ? 'You are currently connected to the user for troubleshooting.'
            : 'Remote troubleshooting is currently disabled. Enable support to assist users remotely.'}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSessionToggle}
            className={`px-6 py-2 rounded-md font-semibold text-white transition duration-300 focus:outline-none ${
              isRemoteSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isRemoteSessionActive ? 'End Remote Session' : 'Start Remote Session'}
          </button>
          <button
            className="px-6 py-2 rounded-md font-semibold text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-100 transition duration-300"
          >
            View Logs
          </button>
        </div>
      </div>

      {/* FAQs or Help Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">How to Use Remote Support</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-indigo-700 mb-2">1. Start a Remote Session</h3>
            <p className="text-gray-600">
              Click the "Start Remote Session" button to initiate a troubleshooting session with the user. 
              You will be able to view their screen and offer assistance remotely.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-indigo-700 mb-2">2. End the Remote Session</h3>
            <p className="text-gray-600">
              Once the issue is resolved, click the "End Remote Session" button to disconnect the user.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-medium text-indigo-700 mb-2">3. View Session Logs</h3>
            <p className="text-gray-600">
              You can view the session logs to track any actions taken during the remote session for future reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteSupportAccess;
