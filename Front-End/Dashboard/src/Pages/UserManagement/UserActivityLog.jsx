// import React, { useState, useEffect } from 'react';

// const UserActivityLog = () => {
//   // Mock data for user activities
//   const [activityLogs, setActivityLogs] = useState([]);

//   useEffect(() => {
//     // Fetch activity logs from backend or mock API
//     const mockData = [
//       { id: 1, user: 'Alice Johnson', action: 'Logged in', timestamp: '2024-11-17 10:15 AM' },
//       { id: 2, user: 'Bob Smith', action: 'Plan upgraded to Plus', timestamp: '2024-11-16 03:45 PM' },
//       { id: 3, user: 'Charlie Brown', action: 'Password reset', timestamp: '2024-11-15 01:20 PM' },
//     ];
//     setActivityLogs(mockData);
//   }, []);

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">User Activity Log</h1>
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b">
//               <th className="py-2 px-4">User</th>
//               <th className="py-2 px-4">Action</th>
//               <th className="py-2 px-4">Timestamp</th>
//             </tr>
//           </thead>
//           <tbody>
//             {activityLogs.map((log) => (
//               <tr key={log.id} className="border-b hover:bg-gray-50">
//                 <td className="py-2 px-4">{log.user}</td>
//                 <td className="py-2 px-4">{log.action}</td>
//                 <td className="py-2 px-4">{log.timestamp}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default UserActivityLog;



import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserActivityLog = () => {
  // Mock data for user activities and connected devices
  const [activityLogs, setActivityLogs] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    // Mock data for user activity logs
    const mockActivityLogs = [
      { id: 1, user: 'Alice Johnson', action: 'Logged in', timestamp: '2024-11-17 10:15 AM' },
      { id: 2, user: 'Bob Smith', action: 'Plan upgraded to Plus', timestamp: '2024-11-16 03:45 PM' },
      { id: 3, user: 'Charlie Brown', action: 'Password reset', timestamp: '2024-11-15 01:20 PM' },
    ];
    setActivityLogs(mockActivityLogs);

    // Mock data for connected devices
    const mockDevices = [
      { id: 1, mac: '00:1A:2B:3C:4D:5E', ip: '192.168.1.101', traffic: '500MB', status: 'Active', lastActivity: '2024-11-17 09:00 AM' },
      { id: 2, mac: '00:1A:2B:3C:4D:5F', ip: '192.168.1.102', traffic: '2GB', status: 'Active', lastActivity: '2024-11-16 06:30 PM' },
      { id: 3, mac: '00:1A:2B:3C:4D:60', ip: '192.168.1.103', traffic: '100MB', status: 'Inactive', lastActivity: '2024-11-14 11:00 AM' },
    ];
    setConnectedDevices(mockDevices);

    // Simulate alerts for suspicious activities
    mockDevices.forEach(device => {
      // Trigger alert for unusual traffic (e.g., more than 1GB)
      if (parseInt(device.traffic) > 1000) {
        toast.warn(`Suspicious traffic detected from device ${device.mac}`);
      }

      // Trigger alert for repeated login failures (just an example)
      if (device.status === 'Inactive') {
        toast.error(`Repeated login failure detected for device ${device.mac}`);
      }
    });

  }, []);

  // Handle viewing device details
  const handleViewDetails = (device) => {
    setSelectedDevice(device);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">User Activity Log</h1>

      {/* User Activity Table */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Activity</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Action</th>
              <th className="py-2 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{log.user}</td>
                <td className="py-2 px-4">{log.action}</td>
                <td className="py-2 px-4">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Connected Devices Table */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">MAC Address</th>
              <th className="py-2 px-4">IP Address</th>
              <th className="py-2 px-4">Traffic</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {connectedDevices.map((device) => (
              <tr key={device.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{device.mac}</td>
                <td className="py-2 px-4">{device.ip}</td>
                <td className="py-2 px-4">{device.traffic}</td>
                <td className="py-2 px-4">
                  <span className={device.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
                    {device.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleViewDetails(device)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Device Details Popup */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-2xl font-semibold mb-4">Device Details</h3>
            <div className="mb-4">
              <strong>MAC Address:</strong> {selectedDevice.mac}
            </div>
            <div className="mb-4">
              <strong>IP Address:</strong> {selectedDevice.ip}
            </div>
            <div className="mb-4">
              <strong>Traffic:</strong> {selectedDevice.traffic}
            </div>
            <div className="mb-4">
              <strong>Status:</strong> <span className={selectedDevice.status === 'Active' ? 'text-green-500' : 'text-red-500'}>{selectedDevice.status}</span>
            </div>
            <div className="mb-4">
              <strong>Last Activity:</strong> {selectedDevice.lastActivity}
            </div>
            <button
              onClick={() => setSelectedDevice(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
};

export default UserActivityLog;
