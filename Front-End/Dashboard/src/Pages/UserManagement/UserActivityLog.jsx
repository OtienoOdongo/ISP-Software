



// import React, { useState, useEffect } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const UserActivityLog = () => {
//   // Mock data for user activities and connected devices
//   const [activityLogs, setActivityLogs] = useState([]);
//   const [connectedDevices, setConnectedDevices] = useState([]);
//   const [selectedDevice, setSelectedDevice] = useState(null);

//   useEffect(() => {
//     // Mock data for user activity logs
//     const mockActivityLogs = [
//       { id: 1, user: 'Alice Johnson', action: 'Logged in', timestamp: '2024-11-17 10:15 AM' },
//       { id: 2, user: 'Bob Smith', action: 'Plan upgraded to Plus', timestamp: '2024-11-16 03:45 PM' },
//       { id: 3, user: 'Charlie Brown', action: 'Password reset', timestamp: '2024-11-15 01:20 PM' },
//     ];
//     setActivityLogs(mockActivityLogs);

//     // Mock data for connected devices
//     const mockDevices = [
//       { id: 1, mac: '00:1A:2B:3C:4D:5E', ip: '192.168.1.101', traffic: '500MB', status: 'Active', lastActivity: '2024-11-17 09:00 AM' },
//       { id: 2, mac: '00:1A:2B:3C:4D:5F', ip: '192.168.1.102', traffic: '2GB', status: 'Active', lastActivity: '2024-11-16 06:30 PM' },
//       { id: 3, mac: '00:1A:2B:3C:4D:60', ip: '192.168.1.103', traffic: '100MB', status: 'Inactive', lastActivity: '2024-11-14 11:00 AM' },
//     ];
//     setConnectedDevices(mockDevices);

//     // Simulate alerts for suspicious activities
//     mockDevices.forEach(device => {
//       // Trigger alert for unusual traffic (e.g., more than 1GB)
//       if (parseInt(device.traffic) > 1000) {
//         toast.warn(`Suspicious traffic detected from device ${device.mac}`);
//       }

//       // Trigger alert for repeated login failures (just an example)
//       if (device.status === 'Inactive') {
//         toast.error(`Repeated login failure detected for device ${device.mac}`);
//       }
//     });

//   }, []);

//   // Handle viewing device details
//   const handleViewDetails = (device) => {
//     setSelectedDevice(device);
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">User Activity Log</h1>

//       {/* User Activity Table */}
//       <div className="bg-white shadow-md rounded-lg p-4 mb-6">
//         <h2 className="text-xl font-semibold mb-4">User Activity</h2>
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

//       {/* Connected Devices Table */}
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <h2 className="text-xl font-semibold mb-4">Connected Devices</h2>
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b">
//               <th className="py-2 px-4">MAC Address</th>
//               <th className="py-2 px-4">IP Address</th>
//               <th className="py-2 px-4">Traffic</th>
//               <th className="py-2 px-4">Status</th>
//               <th className="py-2 px-4">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {connectedDevices.map((device) => (
//               <tr key={device.id} className="border-b hover:bg-gray-50">
//                 <td className="py-2 px-4">{device.mac}</td>
//                 <td className="py-2 px-4">{device.ip}</td>
//                 <td className="py-2 px-4">{device.traffic}</td>
//                 <td className="py-2 px-4">
//                   <span className={device.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
//                     {device.status}
//                   </span>
//                 </td>
//                 <td className="py-2 px-4">
//                   <button
//                     onClick={() => handleViewDetails(device)}
//                     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                   >
//                     View Details
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Device Details Popup */}
//       {selectedDevice && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg w-1/3">
//             <h3 className="text-2xl font-semibold mb-4">Device Details</h3>
//             <div className="mb-4">
//               <strong>MAC Address:</strong> {selectedDevice.mac}
//             </div>
//             <div className="mb-4">
//               <strong>IP Address:</strong> {selectedDevice.ip}
//             </div>
//             <div className="mb-4">
//               <strong>Traffic:</strong> {selectedDevice.traffic}
//             </div>
//             <div className="mb-4">
//               <strong>Status:</strong> <span className={selectedDevice.status === 'Active' ? 'text-green-500' : 'text-red-500'}>{selectedDevice.status}</span>
//             </div>
//             <div className="mb-4">
//               <strong>Last Activity:</strong> {selectedDevice.lastActivity}
//             </div>
//             <button
//               onClick={() => setSelectedDevice(null)}
//               className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Toast container for notifications */}
//       <ToastContainer />
//     </div>
//   );
// };

// export default UserActivityLog;


import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  WifiHigh,
  AlertCircle,
  CheckCircle,
  LogOut,
} from "lucide-react";

const mockUserActivities = [
  // User 1 activities
  {
    userId: 1,
    activities: [
      {
        id: 1,
        type: "login",
        details: "User connected from Kisumu.",
        timestamp: "2025-01-12T08:30:00Z",
      },
      {
        id: 2,
        type: "data_usage",
        details: "Consumed 10 GB of data this month.",
        timestamp: "2025-01-12T14:45:00Z",
      },
      {
        id: 3,
        type: "payment_success",
        details: "Monthly subscription payment processed.",
        timestamp: "2025-01-11T23:59:00Z",
      },
      {
        id: 4,
        type: "logout",
        details: "User disconnected from service.",
        timestamp: "2025-01-12T16:15:00Z",
      },
    ],
  },
  // User 2 activities
  {
    userId: 2,
    activities: [
      {
        id: 5,
        type: "login",
        details: "User accessed service from Mombasa.",
        timestamp: "2025-01-13T09:00:00Z",
      },
      {
        id: 6,
        type: "data_usage",
        details: "Used 2 GB of data in the last 24 hours.",
        timestamp: "2025-01-13T15:30:00Z",
      },
      {
        id: 7,
        type: "payment_failed",
        details: "Payment for weekly plan failed - insufficient funds.",
        timestamp: "2025-01-12T22:00:00Z",
      },
    ],
  },
  // User 3 activities
  {
    userId: 3,
    activities: [
      {
        id: 8,
        type: "login",
        details: "User connected to Eldoret hotspot.",
        timestamp: "2025-01-14T07:15:00Z",
      },
      {
        id: 9,
        type: "data_usage",
        details: "Reached 90% of monthly data cap.",
        timestamp: "2025-01-14T12:00:00Z",
      },
    ],
  },
  // User 4 activities
  {
    userId: 4,
    activities: [
      {
        id: 10,
        type: "login",
        details: "User logged in from Nairobi.",
        timestamp: "2025-01-15T10:00:00Z",
      },
      {
        id: 11,
        type: "data_usage",
        details: "Consumed 500 MB of data today.",
        timestamp: "2025-01-15T13:45:00Z",
      },
      {
        id: 12,
        type: "payment_success",
        details: "Daily plan payment confirmed.",
        timestamp: "2025-01-15T09:55:00Z",
      },
    ],
  },
];

const UserActivityLog = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching user-specific activities
    const userActivities = mockUserActivities.find(user => user.userId === userId)?.activities || [];
    setTimeout(() => {
      setActivities(userActivities);
      setLoading(false);
    }, 1000); // Simulate API response delay
  }, [userId]);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activityIcons = {
    'login': User,
    'logout': LogOut,
    'data_usage': WifiHigh,
    'payment_failed': AlertCircle,
    'payment_success': CheckCircle,
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">User Activity Log</h2>

      {loading && <p className="text-gray-600">Loading...</p>}

      {error &&
        <p className="text-red-500">
          <AlertCircle className="inline-block mr-2 w-5 h-5 text-red-500" />
          {error}
        </p>
      }

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(activities) && activities.length > 0 ? (
                activities.map((activity) => {
                  const Icon = activityIcons[activity.type] || Clock;
                  return (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{activity.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(activity.timestamp)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No activities found for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserActivityLog;