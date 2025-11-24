



// // src/Pages/NetworkManagement/components/UserManagement/UserList.jsx
// import React, { useState } from "react";
// import { Users, Wifi, Cable, Clock, Download, Upload, LogOut, History, User, Phone } from "lucide-react";
// import CustomButton from "../Common/CustomButton";
// import CustomModal from "../Common/CustomModal";
// import InputField from "../Common/InputField";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"


// const UserList = ({ 
//   hotspotUsers, 
//   pppoeUsers, 
//   theme = "light", 
//   onDisconnectUser, 
//   onViewSessionHistory,
//   showConfirm 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [userType, setUserType] = useState(null);
//   const [activeTab, setActiveTab] = useState("hotspot");
//   const [searchTerm, setSearchTerm] = useState("");

//   const formatBytes = (bytes) => {
//     if (!bytes) return "0 B";
//     const k = 1024;
//     const sizes = ["B", "KB", "MB", "GB", "TB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   const formatTime = (seconds) => {
//     if (!seconds || seconds <= 0) return "Expired";
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     if (minutes > 0) return `${minutes}m ${secs}s`;
//     return `${secs}s`;
//   };

//   const filteredHotspotUsers = hotspotUsers.filter(user =>
//     user.client?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.client?.user?.phone_number?.includes(searchTerm) ||
//     user.mac?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const filteredPPPoEUsers = pppoeUsers.filter(user =>
//     user.client?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.client?.user?.phone_number?.includes(searchTerm) ||
//     user.username?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleViewHistory = (user, type) => {
//     setSelectedUser(user);
//     setUserType(type);
//     onViewSessionHistory(user.id, type);
//   };

//   const handleDisconnect = (user, type) => {
//     showConfirm(
//       "Disconnect User",
//       `Are you sure you want to disconnect ${user.client?.user?.username || 'this user'}?`,
//       () => onDisconnectUser(user.id, type)
//     );
//   };

//   const UserTable = ({ users, type }) => (
//     <div className={`overflow-x-auto rounded-lg border ${themeClasses.border.medium}`}>
//       <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//         <thead className={theme === "dark" ? "bg-gray-800" : "bg-gray-50"}>
//           <tr>
//             <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//               Client
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//               {type === "hotspot" ? "MAC Address" : "Username"}
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//               Plan
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//               Remaining Time
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//               Data Used
//             </th>
//             <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//               Status
//             </th>
//             <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//           {users.map((user) => (
//             <tr 
//               key={user.id} 
//               className={theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"}
//             >
//               <td className="px-6 py-4">
//                 <div className="flex items-center space-x-3">
//                   <User className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className={`font-semibold ${themeClasses.text.primary}`}>
//                       {user.client?.user?.username || "Unknown"}
//                     </p>
//                     <p className={`text-sm ${themeClasses.text.tertiary} flex items-center`}>
//                       <Phone className="w-3 h-3 mr-1" />
//                       {user.client?.user?.phone_number || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               </td>
//               <td className={`px-6 py-4 font-mono text-sm ${themeClasses.text.primary}`}>
//                 {type === "hotspot" ? user.mac : user.username}
//               </td>
//               <td className={`px-6 py-4 ${themeClasses.text.primary}`}>{user.plan?.name || "N/A"}</td>
//               <td className="px-6 py-4">
//                 <div className="flex items-center">
//                   <Clock className="w-4 h-4 mr-2 text-blue-500" />
//                   <span className={themeClasses.text.primary}>{formatTime(user.remaining_time)}</span>
//                 </div>
//               </td>
//               <td className="px-6 py-4">
//                 <div className="flex items-center space-x-2">
//                   <Download className="w-3 h-3 text-green-500" />
//                   <span className={themeClasses.text.primary}>{formatBytes(user.data_used)}</span>
//                 </div>
//               </td>
//               <td className="px-6 py-4">
//                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                   user.active 
//                     ? theme === "dark" 
//                       ? "bg-green-900 text-green-300" 
//                       : "bg-green-100 text-green-600"
//                     : theme === "dark" 
//                       ? "bg-gray-800 text-gray-300" 
//                       : "bg-gray-100 text-gray-600"
//                 }`}>
//                   {user.active ? "Active" : "Inactive"}
//                 </span>
//               </td>
//               <td className="px-6 py-4 text-right space-x-2">
//                 <CustomButton
//                   onClick={() => handleViewHistory(user, type)}
//                   label="History"
//                   icon={<History className="w-3 h-3" />}
//                   variant="secondary"
//                   size="sm"
//                   theme={theme}
//                 />
//                 {user.active && (
//                   <CustomButton
//                     onClick={() => handleDisconnect(user, type)}
//                     label="Disconnect"
//                     icon={<LogOut className="w-3 h-3" />}
//                     variant="danger"
//                     size="sm"
//                     theme={theme}
//                   />
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
      
//       {users.length === 0 && (
//         <div className="text-center py-8">
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <p className={themeClasses.text.tertiary}>No users found</p>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Search and Tabs */}
//       <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
//         <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
//           <button
//             onClick={() => setActiveTab("hotspot")}
//             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//               activeTab === "hotspot"
//                 ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
//                 : `${themeClasses.text.tertiary} hover:text-gray-700 dark:hover:text-gray-300`
//             }`}
//           >
//             <Wifi className="w-4 h-4 inline mr-2" />
//             Hotspot Users ({filteredHotspotUsers.length})
//           </button>
//           <button
//             onClick={() => setActiveTab("pppoe")}
//             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//               activeTab === "pppoe"
//                 ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
//                 : `${themeClasses.text.tertiary} hover:text-gray-700 dark:hover:text-gray-300`
//             }`}
//           >
//             <Cable className="w-4 h-4 inline mr-2" />
//             PPPoE Users ({filteredPPPoEUsers.length})
//           </button>
//         </div>

//         <div className="w-full lg:w-64">
//           <InputField
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search users..."
//             icon={<Users className="w-4 h-4" />}
//             theme={theme}
//           />
//         </div>
//       </div>

//       {/* Users Table */}
//       {activeTab === "hotspot" && (
//         <UserTable users={filteredHotspotUsers} type="hotspot" />
//       )}
      
//       {activeTab === "pppoe" && (
//         <UserTable users={filteredPPPoEUsers} type="pppoe" />
//       )}

//       {/* Total Summary */}
//       <div className={`p-4 rounded-lg border ${
//         themeClasses.bg.card
//       } ${themeClasses.border.medium}`}>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//           <div>
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Total Users</p>
//             <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
//               {hotspotUsers.length + pppoeUsers.length}
//             </p>
//           </div>
//           <div>
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Active Users</p>
//             <p className="text-xl font-bold text-green-600 dark:text-green-400">
//               {hotspotUsers.filter(u => u.active).length + pppoeUsers.filter(u => u.active).length}
//             </p>
//           </div>
//           <div>
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot</p>
//             <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
//               {hotspotUsers.filter(u => u.active).length}
//             </p>
//           </div>
//           <div>
//             <p className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE</p>
//             <p className="text-xl font-bold text-green-600 dark:text-green-400">
//               {pppoeUsers.filter(u => u.active).length}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserList;






// src/Pages/NetworkManagement/components/UserManagement/UserList.jsx
import React, { useState } from "react";
import { 
  Users, 
  Wifi, 
  Cable, 
  Clock, 
  Download, 
  Upload, 
  LogOut, 
  History, 
  User, 
  Phone,
  Router,
  Server,
  Shield,
  Activity
} from "lucide-react";
import CustomButton from "../Common/CustomButton";
import CustomModal from "../Common/CustomModal";
import InputField from "../Common/InputField";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components";

const UserList = ({ 
  hotspotUsers, 
  pppoeUsers, 
  theme = "light", 
  onDisconnectUser, 
  onViewSessionHistory,
  onViewRouterDetails,
  onTestUserConnection,
  showConfirm 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [activeTab, setActiveTab] = useState("hotspot");
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionTests, setConnectionTests] = useState({});

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "Expired";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const handleTestConnection = async (userId, type) => {
    try {
      setConnectionTests(prev => ({ ...prev, [userId]: "testing" }));
      await onTestUserConnection(userId, type);
      setConnectionTests(prev => ({ ...prev, [userId]: "success" }));
      setTimeout(() => setConnectionTests(prev => ({ ...prev, [userId]: null })), 3000);
    } catch (error) {
      setConnectionTests(prev => ({ ...prev, [userId]: "failed" }));
      setTimeout(() => setConnectionTests(prev => ({ ...prev, [userId]: null })), 3000);
    }
  };

  const filteredHotspotUsers = hotspotUsers.filter(user =>
    user.client?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.client?.user?.phone_number?.includes(searchTerm) ||
    user.mac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.router?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPPPoEUsers = pppoeUsers.filter(user =>
    user.client?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.client?.user?.phone_number?.includes(searchTerm) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.router?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewHistory = (user, type) => {
    setSelectedUser(user);
    setUserType(type);
    onViewSessionHistory(user.id, type);
  };

  const handleViewRouter = (router) => {
    if (router) {
      onViewRouterDetails(router.id);
    }
  };

  const handleDisconnect = (user, type) => {
    showConfirm(
      "Disconnect User",
      `Are you sure you want to disconnect ${user.client?.user?.username || 'this user'}?`,
      () => onDisconnectUser(user.id, type)
    );
  };

  const UserTable = ({ users, type }) => (
    <div className={`overflow-x-auto rounded-lg border ${themeClasses.border.medium}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={theme === "dark" ? "bg-gray-800" : "bg-gray-50"}>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {type === "hotspot" ? "MAC Address" : "Username"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Router
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Plan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Remaining Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Data Used
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr 
              key={user.id} 
              className={theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"}
            >
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className={`font-semibold ${themeClasses.text.primary}`}>
                      {user.client?.user?.username || "Unknown"}
                    </p>
                    <p className={`text-sm ${themeClasses.text.tertiary} flex items-center`}>
                      <Phone className="w-3 h-3 mr-1" />
                      {user.client?.user?.phone_number || "N/A"}
                    </p>
                  </div>
                </div>
              </td>
              <td className={`px-6 py-4 font-mono text-sm ${themeClasses.text.primary}`}>
                {type === "hotspot" ? user.mac : user.username}
              </td>
              <td className="px-6 py-4">
                {user.router ? (
                  <button
                    onClick={() => handleViewRouter(user.router)}
                    className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Router className="w-4 h-4" />
                    <span>{user.router.name}</span>
                  </button>
                ) : (
                  <span className={themeClasses.text.tertiary}>No router</span>
                )}
              </td>
              <td className={`px-6 py-4 ${themeClasses.text.primary}`}>
                {user.plan?.name || "N/A"}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  <span className={themeClasses.text.primary}>
                    {formatTime(user.remaining_time)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3 text-green-500" />
                    <span className={`text-xs ${themeClasses.text.tertiary}`}>
                      {formatBytes(user.download_bytes || 0)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Upload className="w-3 h-3 text-blue-500" />
                    <span className={`text-xs ${themeClasses.text.tertiary}`}>
                      {formatBytes(user.upload_bytes || 0)}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.active 
                      ? theme === "dark" 
                        ? "bg-green-900 text-green-300" 
                        : "bg-green-100 text-green-600"
                      : theme === "dark" 
                        ? "bg-gray-800 text-gray-300" 
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.active ? "Active" : "Inactive"}
                  </span>
                  
                  {user.active && (
                    <button
                      onClick={() => handleTestConnection(user.id, type)}
                      className={`p-1 rounded ${
                        connectionTests[user.id] === "testing" ? "bg-yellow-100 text-yellow-600" :
                        connectionTests[user.id] === "success" ? "bg-green-100 text-green-600" :
                        connectionTests[user.id] === "failed" ? "bg-red-100 text-red-600" :
                        "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      disabled={connectionTests[user.id] === "testing"}
                    >
                      <Activity className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <CustomButton
                  onClick={() => handleViewHistory(user, type)}
                  label="History"
                  icon={<History className="w-3 h-3" />}
                  variant="secondary"
                  size="sm"
                  theme={theme}
                />
                {user.active && (
                  <CustomButton
                    onClick={() => handleDisconnect(user, type)}
                    label="Disconnect"
                    icon={<LogOut className="w-3 h-3" />}
                    variant="danger"
                    size="sm"
                    theme={theme}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={themeClasses.text.tertiary}>No users found</p>
        </div>
      )}
    </div>
  );

  // Enhanced statistics
  const totalUsers = hotspotUsers.length + pppoeUsers.length;
  const activeUsers = hotspotUsers.filter(u => u.active).length + pppoeUsers.filter(u => u.active).length;
  const totalDataUsed = [...hotspotUsers, ...pppoeUsers].reduce((sum, user) => 
    sum + (user.download_bytes || 0) + (user.upload_bytes || 0), 0
  );
  const uniqueRouters = new Set([
    ...hotspotUsers.map(u => u.router?.id).filter(Boolean),
    ...pppoeUsers.map(u => u.router?.id).filter(Boolean)
  ]).size;

  return (
    <div className="space-y-6">
      {/* Search and Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setActiveTab("hotspot")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "hotspot"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : `${themeClasses.text.tertiary} hover:text-gray-700 dark:hover:text-gray-300`
            }`}
          >
            <Wifi className="w-4 h-4 inline mr-2" />
            Hotspot Users ({filteredHotspotUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("pppoe")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pppoe"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : `${themeClasses.text.tertiary} hover:text-gray-700 dark:hover:text-gray-300`
            }`}
          >
            <Cable className="w-4 h-4 inline mr-2" />
            PPPoE Users ({filteredPPPoEUsers.length})
          </button>
        </div>

        <div className="w-full lg:w-64">
          <InputField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users, MAC, or routers..."
            icon={<Users className="w-4 h-4" />}
            theme={theme}
          />
        </div>
      </div>

      {/* Users Table */}
      {activeTab === "hotspot" && (
        <UserTable users={filteredHotspotUsers} type="hotspot" />
      )}
      
      {activeTab === "pppoe" && (
        <UserTable users={filteredPPPoEUsers} type="pppoe" />
      )}

      {/* Enhanced Summary */}
      <div className={`p-4 rounded-lg border ${
        themeClasses.bg.card
      } ${themeClasses.border.medium}`}>
        <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>
          Network Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
          <div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Total Users</p>
            <p className={`text-xl font-bold ${themeClasses.text.primary}`}>
              {totalUsers}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Active Users</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {activeUsers}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Hotspot</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {hotspotUsers.filter(u => u.active).length}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>PPPoE</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {pppoeUsers.filter(u => u.active).length}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Routers</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {uniqueRouters}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>Data Used</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatBytes(totalDataUsed)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;