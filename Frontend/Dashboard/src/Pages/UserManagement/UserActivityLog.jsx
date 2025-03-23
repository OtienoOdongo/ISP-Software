// import React, { useState, useEffect } from "react";
// import {
//   Clock,
//   User,
//   WifiHigh,
//   AlertCircle,
//   CheckCircle,
//   LogOut,
// } from "lucide-react";

// // Mock Data with Three Users
// const mockUserActivities = [
//   {
//     userId: 1,
//     name: "John Doe",
//     activities: [
//       { id: 1, type: "login", details: "Connected from Kisumu.", timestamp: "2025-01-12T08:30:00Z" },
//       { id: 2, type: "data_usage", details: "Consumed 10 GB this month.", timestamp: "2025-01-12T14:45:00Z" },
//       { id: 3, type: "payment_success", details: "Monthly subscription payment processed.", timestamp: "2025-01-11T23:59:00Z" },
//       { id: 4, type: "logout", details: "Disconnected from service.", timestamp: "2025-01-12T16:15:00Z" },
//     ],
//   },
//   {
//     userId: 2,
//     name: "Jane Smith",
//     activities: [
//       { id: 5, type: "login", details: "Accessed from Mombasa.", timestamp: "2025-01-13T09:00:00Z" },
//       { id: 6, type: "data_usage", details: "Used 2 GB in the last 24 hours.", timestamp: "2025-01-13T15:30:00Z" },
//       { id: 7, type: "payment_failed", details: "Weekly plan payment failed.", timestamp: "2025-01-12T22:00:00Z" },
//     ],
//   },
//   {
//     userId: 3,
//     name: "Mike Johnson",
//     activities: [
//       { id: 8, type: "data_usage", details: "Used 500 MB today.", timestamp: "2025-01-14T10:00:00Z" },
//       { id: 9, type: "login", details: "Logged in from Nairobi.", timestamp: "2025-01-14T11:30:00Z" },
//     ],
//   },
// ];

// const UserActivityLog = ({ userId }) => {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userName, setUserName] = useState("");

//   useEffect(() => {
//     // Fetch user-specific activities
//     const user = mockUserActivities.find((user) => user.userId === userId);
//     const userActivities = user?.activities || [];
//     setUserName(user?.name || "Unknown User");
//     setTimeout(() => {
//       setActivities(userActivities);
//       setLoading(false);
//     }, 1000);
//   }, [userId]);

//   const formatDateTime = (dateTime) => {
//     const date = new Date(dateTime);
//     return date.toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const activityIcons = {
//     login: User,
//     logout: LogOut,
//     data_usage: WifiHigh,
//     payment_failed: AlertCircle,
//     payment_success: CheckCircle,
//   };

//   return (
//     <div className="bg-gray-100 shadow-md rounded-lg p-6">
//       <h2 className="text-xl font-bold text-gray-800 mb-4">{userName}'s Activity Log</h2>
//       {loading ? (
//         <p className="text-gray-600">Loading activities...</p>
//       ) : activities.length > 0 ? (
//         <div className="space-y-4">
//           {activities.map((activity) => {
//             const Icon = activityIcons[activity.type] || Clock;
//             return (
//               <div
//                 key={activity.id}
//                 className="bg-white shadow-sm rounded-lg p-4 flex items-center space-x-4"
//               >
//                 <Icon className="w-6 h-6 text-gray-500" />
//                 <div>
//                   <p className="text-sm font-medium text-gray-900 capitalize">
//                     {activity.type.replace("_", " ")}
//                   </p>
//                   <p className="text-sm text-gray-500">{activity.details}</p>
//                   <p className="text-xs text-gray-400">{formatDateTime(activity.timestamp)}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <p className="text-gray-600">No activities found for {userName}.</p>
//       )}
//     </div>
//   );
// };

// // Parent Component with List of Users and Search Functionality
// const App = () => {
//   const [selectedUserId, setSelectedUserId] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [visibleUsers, setVisibleUsers] = useState(mockUserActivities.slice(0, 3));
//   const [searchHistory, setSearchHistory] = useState([]);

//   useEffect(() => {
//     // Filter users based on search term
//     const filtered = mockUserActivities.filter((user) =>
//       user.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     if (filtered.length > 0) {
//       // Check if user was searched within 24 hours
//       const now = new Date();
//       const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

//       let newVisibleUsers = visibleUsers;

//       // Find if the searched user was in history within last 24 hours
//       const searchedUserInHistory = searchHistory.find(
//         (historyItem) => historyItem.userId === filtered[0].userId && historyItem.timestamp > twentyFourHoursAgo
//       );

//       if (searchedUserInHistory) {
//         // If found, replace the oldest visible user
//         const oldestUser = visibleUsers.reduce((oldest, user) =>
//           !searchHistory.some(h => h.userId === user.userId) || h.timestamp < oldest.timestamp ? user : oldest
//         );
//         newVisibleUsers = visibleUsers.filter(user => user.userId !== oldestUser.userId);
//       }

//       // Add or update the searched user in visibleUsers
//       newVisibleUsers = [...newVisibleUsers, filtered[0]].slice(-3); // slice to ensure only 3 items

//       // Update search history
//       setSearchHistory(prev => {
//         const updatedHistory = [...prev.filter(h => h.userId !== filtered[0].userId), { userId: filtered[0].userId, timestamp: now }];
//         return updatedHistory;
//       });

//       setVisibleUsers(newVisibleUsers);
//     }
//   }, [searchTerm]);

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">User Activities</h1>

//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search users by name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {visibleUsers.map((user) => (
//           <div
//             key={user.userId}
//             className={`cursor-pointer p-4 rounded-lg shadow-md ${selectedUserId === user.userId ? "bg-indigo-100" : "bg-white"
//               }`}
//             onClick={() => setSelectedUserId(user.userId)}
//           >
//             <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
//             <p className="text-sm text-gray-500">{user.activities.length} activities logged</p>
//           </div>
//         ))}
//       </div>
//       <div className="mt-6">
//         <UserActivityLog userId={selectedUserId} />
//       </div>
//     </div>
//   );
// };

// export default App;



// import React, { useState, useEffect } from "react";
// import { Clock, User, WifiHigh, AlertCircle, CheckCircle, LogOut } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../../api";

// const UserActivityLog = ({ userId }) => {
//   const [activities, setActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userName, setUserName] = useState("");

//   // Fetch user-specific activities
//   useEffect(() => {
//     const fetchActivities = async () => {
//       try {
//         const response = await api.get("/api/user_management/user-activities/", {
//           params: { user_id: userId },
//         });
//         setActivities(response.data);
//       } catch (error) {
//         setError("Unable to fetch activity log. Please try again later.");
//         setActivities([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchActivities();
//   }, [userId]);

//   // Fetch user name
//   useEffect(() => {
//     const fetchUserName = async () => {
//       try {
//         const response = await api.get(`/api/user_management/user-profiles/${userId}/`);
//         setUserName(response.data.client.full_name); // Adjusted for nested client structure
//       } catch (error) {
//         setUserName("Unknown User");
//       }
//     };

//     fetchUserName();
//   }, [userId]);

//   const formatDateTime = (dateTime) => {
//     if (!dateTime) return "Not Available";
//     const date = new Date(dateTime);
//     return date.toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const activityIcons = {
//     login: User,
//     logout: LogOut,
//     data_usage: WifiHigh,
//     payment_failed: AlertCircle,
//     payment_success: CheckCircle,
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
//       <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
//           <h2 className="text-4xl font-extrabold text-center tracking-wide drop-shadow-md">
//             {userName}'s Activity Log
//           </h2>
//           <p className="text-center text-indigo-100 mt-3 text-xl font-light">
//             Real-Time Insights into Client Actions
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="p-10 space-y-8">
//           {loading ? (
//             <div className="flex items-center justify-center py-20">
//               <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
//               <span className="ml-4 text-gray-700 text-xl font-medium">Loading Activity Log...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
//               <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 We're fine-tuning our systems. Activity logs will be available shortly.
//               </p>
//             </div>
//           ) : activities.length === 0 ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <Clock className="w-20 h-20 text-indigo-500 mx-auto" />
//               <p className="text-gray-800 text-2xl font-semibold mt-6">No Activities Recorded</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 {userName} hasn’t logged any actions yet. Stay tuned for updates!
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {activities.map((activity) => {
//                 const Icon = activityIcons[activity.type] || Clock;
//                 return (
//                   <div
//                     key={activity.id}
//                     className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6"
//                   >
//                     <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full">
//                       <Icon className="w-8 h-8 text-indigo-600" />
//                     </div>
//                     <div className="flex-1">
//                       <p className="text-lg font-semibold text-gray-900 capitalize">
//                         {activity.type.replace("_", " ")}
//                       </p>
//                       <p className="text-gray-700 mt-1">{activity.details}</p>
//                       <p className="text-sm text-gray-500 mt-2">
//                         {formatDateTime(activity.timestamp)}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserActivityLog;





import React, { useState, useEffect } from "react";
import { Clock, User, WifiHigh, AlertCircle, CheckCircle, LogOut } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import api from "../../../api";

const UserActivityLog = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");

  // Fetch user-specific activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId || userId === "undefined") {
        setError("Invalid user ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get("/api/user_management/user-activities/", {
          params: { user_id: userId },
        });
        setActivities(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to fetch activity log. Please try again later.");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!userId || userId === "undefined") {
        setUserName("Unknown User");
        return;
      }

      try {
        const response = await api.get(`/api/user_management/user-profiles/${userId}/`);
        setUserName(response.data.client.full_name || "Unknown User");
      } catch (err) {
        setUserName("Unknown User");
        setError(err.response?.data?.error || "Unable to fetch user name.");
      }
    };

    fetchUserName();
  }, [userId]);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not Available";
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activityIcons = {
    login: User,
    logout: LogOut,
    data_usage: WifiHigh,
    payment_failed: AlertCircle,
    payment_success: CheckCircle,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
          <h2 className="text-4xl font-extrabold text-center tracking-wide drop-shadow-md">
            {userName}'s Activity Log
          </h2>
          <p className="text-center text-indigo-100 mt-3 text-xl font-light">
            Real-Time Insights into Client Actions
          </p>
        </div>

        {/* Main Content */}
        <div className="p-10 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
              <span className="ml-4 text-gray-700 text-xl font-medium">Loading Activity Log...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
              <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
              <p className="text-gray-600 mt-3 text-lg">
                We're fine-tuning our systems. Activity logs will be available shortly.
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <Clock className="w-20 h-20 text-indigo-500 mx-auto" />
              <p className="text-gray-800 text-2xl font-semibold mt-6">No Activities Recorded</p>
              <p className="text-gray-600 mt-3 text-lg">
                {userName} hasn’t logged any actions yet. Stay tuned for updates!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type] || Clock;
                return (
                  <div
                    key={activity.id}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6"
                  >
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full">
                      <Icon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {activity.type?.replace("_", " ") || "Unknown Activity"}
                      </p>
                      <p className="text-gray-700 mt-1">{activity.details || "No details available"}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityLog;