

// import React, { useState, useCallback, useEffect } from "react";
// import {
//   Users,
//   WifiHigh,
//   CheckCircle,
//   Clock,
//   Ban,
//   HelpCircle
// } from "lucide-react";

// const mockUsers = [
//   {
//     id: 1,
//     name: "Ken Opiyo",
//     phone: "+254701234567",
//     lastLogin: "2025-01-12T14:30:00Z",
//     active: true,
//     dataUsage: { used: 20, total: 100, unit: "GB" },
//     paymentStatus: "Paid",
//     subscription: {
//       plan: "Premium",
//       startDate: "2025-01-01",
//       expiryDate: "2025-02-01",
//     },
//   },
//   {
//     id: 2,
//     name: "Lenox Kamari",
//     phone: "+254712345678",
//     lastLogin: "2025-01-11T12:00:00Z",
//     active: false,
//     dataUsage: { used: 15, total: 30, unit: "GB" },
//     paymentStatus: "Pending",
//     subscription: {
//       plan: "Plus",
//       startDate: "2025-01-05",
//       expiryDate: "2025-02-05",
//     },
//   },
//   {
//     id: 3,
//     name: "Lucy Wange",
//     phone: "+25474567890",
//     lastLogin: "2025-01-11T12:00:00Z",
//     active: false,
//     dataUsage: { used: 9.9, total: 10, unit: "GB" },
//     paymentStatus: "Paid",
//     subscription: {
//       plan: "Basic",
//       startDate: "2025-01-05",
//       expiryDate: "2025-02-05",
//     },
//   },
// ];

// const UserProfile = () => {
//   const [users, setUsers] = useState(mockUsers);
//   const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
//   const [searchQuery, setSearchQuery] = useState("");

//   const handleSearch = useCallback((event) => {
//     setSearchQuery(event.target.value);
//   }, []);

//   const filteredUsers = users.filter((user) =>
//     user.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleUserSelect = useCallback((userId) => {
//     const user = users.find((u) => u.id === userId);
//     setSelectedUser(user);
//   }, [users]);

//   const handleSuspend = useCallback(() => {
//     setUsers(prevUsers =>
//       prevUsers.map(user =>
//         user.id === selectedUser.id ? { ...user, active: !user.active } : user
//       )
//     );
//     setSelectedUser(prev => ({ ...prev, active: !prev.active }));
//   }, [selectedUser, users]);

//   const formatDateTime = useCallback((dateTime) => {
//     const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
//     return new Date(dateTime).toLocaleDateString("en-US", options);
//   }, []);

//   // Use useEffect to set the initial selected user from local storage if available
//   useEffect(() => {
//     const storedUser = localStorage.getItem("selectedUser");
//     if (storedUser) {
//       setSelectedUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // Save selected user to local storage when changed
//   useEffect(() => {
//     localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
//   }, [selectedUser]);

//   return (
//     <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
//       {/* Search Bar */}
//       <div className="relative mb-4">
//         <input
//           type="text"
//           placeholder="Search users by name..."
//           value={searchQuery}
//           onChange={handleSearch}
//           className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//           aria-label="Search for users"
//         />
//         <select
//           value={selectedUser.id}
//           onChange={(e) => handleUserSelect(Number(e.target.value))}
//           className="absolute right-0 top-0 px-4 py-2 border-l border-gray-300 rounded-r-lg
//            bg-white focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer"
//         >
//           <option  value="" disabled>Select User</option>
//           {filteredUsers.map((user) => (
//             <option  key={user.id} value={user.id}>
//               {user.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* User Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <Users className="w-8 h-8 text-blue-500" />
//           <h1 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h1>
//         </div>
//       </div>

//       {/* Profile Details */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-2">Profile Details</h2>
//           <p className="text-sm text-gray-600">
//             <span className="font-bold mr-2">Phone:</span> {selectedUser.phone}
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-bold mr-2">Status:</span>
//             <span className={selectedUser.active ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
//               {selectedUser.active ? "Active" : "Suspended"}
//             </span>
//           </p>
//         </div>

//         {/* Activity */}
//         <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-2">Activity</h2>
//           <div className="flex items-center space-x-2 mb-2">
//             <Clock className="w-9 h-9 text-orange-500" />
//             <p className="text-sm text-gray-600">
//               <span className="font-bold mr-2">Last Login:</span> {formatDateTime(selectedUser.lastLogin)}
//             </p>
//           </div>
//           <p className="text-sm text-gray-600">
//             <span className="font-bold mr-2">User Logins:</span> 10 times this month
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-bold mr-2">Recent Activity:</span> Updated plan 2 days ago
//           </p>
//         </div>
//       </div>

//       {/* Data Usage */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-2">Data Usage</h2>
//           <div className="flex items-center space-x-2 mb-2">
//             <WifiHigh className="w-11 h-11 text-blue-500" />
//             <p className="text-sm text-gray-600">
//               <span className="font-bold mr-2">Usage:</span>
//               {selectedUser.dataUsage.total === 'unlimited' ? 'Unlimited' :
//                 `${selectedUser.dataUsage.used} / ${selectedUser.dataUsage.total}${selectedUser.dataUsage.unit} (${Math.round((selectedUser.dataUsage.used / selectedUser.dataUsage.total) * 100)}% used)`}
//             </p>
//           </div>
//           <div className="h-2 bg-gray-200 rounded-full w-full">
//             <div
//               className="h-full bg-blue-500 rounded-full"
//               style={{ width: `${selectedUser.dataUsage.total === 'unlimited' ? 0 : (selectedUser.dataUsage.used / selectedUser.dataUsage.total) * 100}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Payment Status */}
//         <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
//           <h2 className="text-lg font-semibold mb-2">Payment Status</h2>
//           <div className="flex items-center space-x-2 mb-2">
//             {selectedUser.paymentStatus === "Paid" ? (
//               <CheckCircle className="w-9 h-9 text-green-500" />
//             ) : (
//               <HelpCircle className="w-9 h-9 text-red-500" />
//             )}
//             <p className="text-sm text-gray-600">
//               <span className="font-bold mr-2">Status:</span> {selectedUser.paymentStatus}
//             </p>
//           </div>
//           <p className="text-sm text-gray-600">
//             <span className="font-bold mr-2">Last Payment:</span> {formatDateTime("2025-01-01T00:00:00Z")}
//           </p>
//           <p className="text-sm text-gray-600">
//             <span className="font-bold mr-2">Next Payment Due:</span> {formatDateTime("2025-02-01T00:00:00Z")}
//           </p>
//         </div>
//       </div>

//       {/* Subscription Details */}
//       <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
//         <h2 className="text-lg font-semibold mb-2">Subscription</h2>
//         <p className="text-sm text-gray-600">
//           <span className="font-bold mr-2" style={{ color: selectedUser.subscription.plan === "Premium" ? "#FFD700" : selectedUser.subscription.plan === "Plus" ? "#FF4500" : "#008000" }}>Plan:</span> {selectedUser.subscription.plan}
//         </p>
//         <p className="text-sm text-gray-600">
//           <span className="font-bold mr-2">Start Date:</span> {formatDateTime(selectedUser.subscription.startDate)}
//         </p>
//         <p className="text-sm text-gray-600">
//           <span className="font-bold mr-2">Expiry Date:</span> {formatDateTime(selectedUser.subscription.expiryDate)}
//         </p>
//       </div>

//       {/* Suspend User Button */}
//       <div className="mt-6 flex justify-center">
//         <button
//           onClick={handleSuspend}
//           className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//         >
//           <Ban size={20} className="inline-block mr-2" />
//           Suspend
//         </button>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;



// import React, { useState, useEffect } from "react";
// import { Users, WifiHigh, CheckCircle, Clock, Ban, HelpCircle } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../../api"; // Using your existing api.js

// const UserProfile = () => {
//   const [profiles, setProfiles] = useState([]);
//   const [selectedProfile, setSelectedProfile] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch profiles using your existing api setup
//   useEffect(() => {
//     const fetchProfiles = async () => {
//       try {
//         const response = await api.get("/api/user_management/user-profiles/", {
//           params: { search: searchQuery },
//         });
//         const fetchedProfiles = response.data;
//         setProfiles(fetchedProfiles);
//         setSelectedProfile(fetchedProfiles.length > 0 ? fetchedProfiles[0] : null);
//       } catch (error) {
//         setError("Unable to fetch client data. Please try again later.");
//         setProfiles([]);
//         setSelectedProfile(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfiles();
//   }, [searchQuery]);

//   const handleSearch = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   const handleProfileSelect = (profileId) => {
//     const profile = profiles.find((p) => p.id === profileId);
//     setSelectedProfile(profile);
//   };

//   const handleToggleStatus = async () => {
//     if (!selectedProfile) return;

//     try {
//       const response = await api.post(`/api/user_management/user-profiles/${selectedProfile.id}/toggle-status/`);
//       const updatedProfile = response.data;
//       setProfiles(profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));
//       setSelectedProfile(updatedProfile);
//       setError(null);
//     } catch (error) {
//       setError("Failed to update status. Please try again.");
//     }
//   };

//   const formatDateTime = (dateTime) => {
//     if (!dateTime) return "Not Available";
//     const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
//     return new Date(dateTime).toLocaleDateString("en-US", options);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
//       <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
//           <h1 className="text-5xl font-extrabold text-center tracking-wide drop-shadow-md">
//             ClientSync Dashboard
//           </h1>
//           <p className="text-center text-indigo-100 mt-3 text-xl font-light">
//             Empowering Seamless Client Management
//           </p>
//         </div>

//         {/* Search Bar */}
//         <div className="p-8 bg-gray-100 border-b border-gray-200">
//           <div className="flex items-center space-x-6">
//             <input
//               type="text"
//               placeholder="Search clients by name..."
//               value={searchQuery}
//               onChange={handleSearch}
//               className="flex-1 px-6 py-4 bg-white border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
//             />
//             <select
//               value={selectedProfile?.id || ""}
//               onChange={(e) => handleProfileSelect(Number(e.target.value))}
//               className="px-6 py-4 bg-white border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 text-gray-700"
//             >
//               <option value="" disabled>
//                 Select Client
//               </option>
//               {profiles.map((profile) => (
//                 <option key={profile.id} value={profile.id}>
//                   {profile.client.full_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="p-10 space-y-10">
//           {/* Loading State */}
//           {loading ? (
//             <div className="flex items-center justify-center py-20">
//               <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
//               <span className="ml-4 text-gray-700 text-xl font-medium">Fetching Client Insights...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <HelpCircle className="w-20 h-20 text-red-500 mx-auto" />
//               <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 Our team is optimizing the system. Real-time data coming soon!
//               </p>
//             </div>
//           ) : profiles.length === 0 ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <Users className="w-20 h-20 text-indigo-500 mx-auto" />
//               <p className="text-gray-800 text-2xl font-semibold mt-6">No Clients Yet</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 Start adding clients to unlock powerful management features.
//               </p>
//             </div>
//           ) : selectedProfile ? (
//             <>
//               {/* Client Header */}
//               <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl shadow-md">
//                 <div className="flex items-center space-x-6">
//                   <Users className="w-14 h-14 text-indigo-600" />
//                   <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
//                     {selectedProfile.client.full_name}
//                   </h2>
//                 </div>
//                 <span
//                   className={`px-6 py-3 rounded-full text-base font-semibold shadow-lg ${
//                     selectedProfile.active
//                       ? "bg-green-200 text-green-800"
//                       : "bg-red-200 text-red-800"
//                   }`}
//                 >
//                   {selectedProfile.active ? "Active" : "Suspended"}
//                 </span>
//               </div>

//               {/* Profile Grid */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Client Details */}
//                 <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                   <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
//                     <Users className="w-7 h-7 mr-3" /> Client Details
//                   </h3>
//                   <p className="text-gray-700 mb-4">
//                     <span className="font-bold text-gray-900">Phone:</span>{" "}
//                     {selectedProfile.client.phonenumber}
//                   </p>
//                   <p className="text-gray-700">
//                     <span className="font-bold text-gray-900">Joined:</span>{" "}
//                     {formatDateTime(selectedProfile.client.created_at)}
//                   </p>
//                 </div>

//                 {/* Activity */}
//                 <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                   <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
//                     <Clock className="w-7 h-7 mr-3" /> Activity
//                   </h3>
//                   <p className="text-gray-700">
//                     <span className="font-bold text-gray-900">Last Login:</span>{" "}
//                     {formatDateTime(selectedProfile.last_login)}
//                   </p>
//                 </div>

//                 {/* Data Usage */}
//                 <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                   <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
//                     <WifiHigh className="w-7 h-7 mr-3" /> Data Usage
//                   </h3>
//                   <p className="text-gray-700 mb-4">
//                     <span className="font-bold text-gray-900">Usage:</span>{" "}
//                     {selectedProfile.data_total === "unlimited"
//                       ? "Unlimited"
//                       : `${selectedProfile.data_used} / ${selectedProfile.data_total} ${selectedProfile.data_unit} (${Math.round(
//                           (selectedProfile.data_used / selectedProfile.data_total) * 100
//                         )}% used)`}
//                   </p>
//                   <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
//                       style={{
//                         width: `${selectedProfile.data_total === "unlimited" ? 0 : (selectedProfile.data_used / selectedProfile.data_total) * 100}%`,
//                       }}
//                     ></div>
//                   </div>
//                 </div>

//                 {/* Payment Status */}
//                 <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                   <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
//                     {selectedProfile.payment_status === "Paid" ? (
//                       <CheckCircle className="w-7 h-7 mr-3 text-green-500" />
//                     ) : (
//                       <HelpCircle className="w-7 h-7 mr-3 text-red-500" />
//                     )}
//                     Payment Status
//                   </h3>
//                   <p className="text-gray-700 mb-4">
//                     <span className="font-bold text-gray-900">Status:</span>{" "}
//                     <span
//                       className={`font-semibold ${
//                         selectedProfile.payment_status === "Paid" ? "text-green-600" : "text-red-600"
//                       }`}
//                     >
//                       {selectedProfile.payment_status}
//                     </span>
//                   </p>
//                   <p className="text-gray-700">
//                     <span className="font-bold text-gray-900">Next Due:</span>{" "}
//                     {formatDateTime(selectedProfile.subscription_expiry_date)}
//                   </p>
//                 </div>
//               </div>

//               {/* Subscription Details */}
//               <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                 <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
//                   <Users className="w-7 h-7 mr-3" /> Subscription
//                 </h3>
//                 <p className="text-gray-700 mb-4">
//                   <span className="font-bold text-gray-900">Plan:</span>{" "}
//                   <span
//                     className="font-semibold"
//                     style={{
//                       color:
//                         selectedProfile.subscription_plan === "Premium"
//                           ? "#FFD700"
//                           : selectedProfile.subscription_plan === "Plus"
//                           ? "#FF4500"
//                           : "#008000",
//                     }}
//                   >
//                     {selectedProfile.subscription_plan}
//                   </span>
//                 </p>
//                 <p className="text-gray-700 mb-4">
//                   <span className="font-bold text-gray-900">Start:</span>{" "}
//                   {formatDateTime(selectedProfile.subscription_start_date)}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-bold text-gray-900">Expiry:</span>{" "}
//                   {formatDateTime(selectedProfile.subscription_expiry_date)}
//                 </p>
//               </div>

//               {/* Toggle Status Button */}
//               <div className="flex justify-center">
//                 <button
//                   onClick={handleToggleStatus}
//                   className={`px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
//                     selectedProfile.active
//                       ? "bg-red-600 hover:bg-red-700"
//                       : "bg-green-600 hover:bg-green-700"
//                   }`}
//                 >
//                   <Ban size={26} className="inline-block mr-3" />
//                   {selectedProfile.active ? "Suspend Client" : "Activate Client"}
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <Users className="w-20 h-20 text-indigo-500 mx-auto" />
//               <p className="text-gray-800 text-2xl font-semibold mt-6">Select a Client</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 Choose a client from the list to explore their details.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;








import React, { useState, useEffect, useCallback } from "react";
import { Users, WifiHigh, CheckCircle, Clock, Ban, HelpCircle } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import api from "../../../api";
import debounce from "lodash/debounce"; 

const UserProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced fetch function
  const fetchProfiles = useCallback(
    debounce(async (query) => {
      setLoading(true);
      try {
        const response = await api.get("/api/user_management/user-profiles/", {
          params: { search: query },
        });
        const fetchedProfiles = response.data;
        setProfiles(fetchedProfiles);
        setSelectedProfile(fetchedProfiles.length > 0 ? fetchedProfiles[0] : null);
        setError(null);
      } catch (err) {
        setError("Unable to fetch client data. Please try again later.");
        setProfiles([]);
        setSelectedProfile(null);
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms debounce delay
    []
  );

  useEffect(() => {
    fetchProfiles(searchQuery);
  }, [searchQuery, fetchProfiles]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleProfileSelect = (profileId) => {
    const profile = profiles.find((p) => p.id === Number(profileId));
    setSelectedProfile(profile);
  };

  const handleToggleStatus = async () => {
    if (!selectedProfile) return;

    try {
      const response = await api.post(`/api/user_management/user-profiles/${selectedProfile.id}/toggle-status/`);
      const updatedProfile = response.data;
      setProfiles(profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)));
      setSelectedProfile(updatedProfile);
      setError(null);
    } catch (err) {
      setError("Failed to update status. Please try again.");
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not Available";
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateTime).toLocaleDateString("en-US", options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
          <h1 className="text-5xl font-extrabold text-center tracking-wide drop-shadow-md">
            Client Dashboard
          </h1>
          <p className="text-center text-indigo-100 mt-3 text-xl font-light">
            Empowering Seamless Client Management
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-8 bg-gray-100 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <input
              type="text"
              placeholder="Search clients by name..."
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 px-6 py-4 bg-white border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
            />
            <select
              value={selectedProfile?.id || ""}
              onChange={(e) => handleProfileSelect(e.target.value)}
              className="px-6 py-4 bg-white border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 text-gray-700"
            >
              <option value="" disabled>
                Select Client
              </option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.client.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-10 space-y-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
              <span className="ml-4 text-gray-700 text-xl font-medium">Fetching Client Insights...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <HelpCircle className="w-20 h-20 text-red-500 mx-auto" />
              <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
              <p className="text-gray-600 mt-3 text-lg">
                Our team is optimizing the system. Real-time data coming soon!
              </p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <Users className="w-20 h-20 text-indigo-500 mx-auto" />
              <p className="text-gray-800 text-2xl font-semibold mt-6">No Clients Yet</p>
              <p className="text-gray-600 mt-3 text-lg">
                Start adding clients to unlock powerful management features.
              </p>
            </div>
          ) : selectedProfile ? (
            <>
              {/* Client Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl shadow-md">
                <div className="flex items-center space-x-6">
                  <Users className="w-14 h-14 text-indigo-600" />
                  <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                    {selectedProfile.client.full_name}
                  </h2>
                </div>
                <span
                  className={`px-6 py-3 rounded-full text-base font-semibold shadow-lg ${
                    selectedProfile.active
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {selectedProfile.active ? "Active" : "Suspended"}
                </span>
              </div>

              {/* Profile Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Client Details */}
                <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
                    <Users className="w-7 h-7 mr-3" /> Client Details
                  </h3>
                  <p className="text-gray-700 mb-4">
                    <span className="font-bold text-gray-900">Phone:</span>{" "}
                    {selectedProfile.client.phonenumber || "Not Provided"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Joined:</span>{" "}
                    {formatDateTime(selectedProfile.client.created_at)}
                  </p>
                </div>

                {/* Activity */}
                <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
                    <Clock className="w-7 h-7 mr-3" /> Activity
                  </h3>
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Last Login:</span>{" "}
                    {formatDateTime(selectedProfile.last_login)}
                  </p>
                </div>

                {/* Data Usage */}
                <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
                    <WifiHigh className="w-7 h-7 mr-3" /> Data Usage
                  </h3>
                  <p className="text-gray-700 mb-4">
                    <span className="font-bold text-gray-900">Usage:</span>{" "}
                    {selectedProfile.data_total === "unlimited"
                      ? "Unlimited"
                      : `${selectedProfile.data_used || 0} / ${selectedProfile.data_total || 0} ${selectedProfile.data_unit || "GB"} (${
                          selectedProfile.data_total
                            ? Math.round((selectedProfile.data_used / selectedProfile.data_total) * 100)
                            : 0
                        }% used)`}
                  </p>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          selectedProfile.data_total === "unlimited" || !selectedProfile.data_total
                            ? 0
                            : (selectedProfile.data_used / selectedProfile.data_total) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
                    {selectedProfile.payment_status === "Paid" ? (
                      <CheckCircle className="w-7 h-7 mr-3 text-green-500" />
                    ) : (
                      <HelpCircle className="w-7 h-7 mr-3 text-red-500" />
                    )}
                    Payment Status
                  </h3>
                  <p className="text-gray-700 mb-4">
                    <span className="font-bold text-gray-900">Status:</span>{" "}
                    <span
                      className={`font-semibold ${
                        selectedProfile.payment_status === "Paid" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {selectedProfile.payment_status || "Unknown"}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-bold text-gray-900">Next Due:</span>{" "}
                    {formatDateTime(selectedProfile.subscription_expiry_date)}
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center">
                  <Users className="w-7 h-7 mr-3" /> Subscription
                </h3>
                <p className="text-gray-700 mb-4">
                  <span className="font-bold text-gray-900">Plan:</span>{" "}
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        selectedProfile.subscription_plan === "Premium"
                          ? "#FFD700"
                          : selectedProfile.subscription_plan === "Plus"
                          ? "#FF4500"
                          : "#008000",
                    }}
                  >
                    {selectedProfile.subscription_plan || "None"}
                  </span>
                </p>
                <p className="text-gray-700 mb-4">
                  <span className="font-bold text-gray-900">Start:</span>{" "}
                  {formatDateTime(selectedProfile.subscription_start_date)}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold text-gray-900">Expiry:</span>{" "}
                  {formatDateTime(selectedProfile.subscription_expiry_date)}
                </p>
              </div>

              {/* Toggle Status Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className={`px-10 py-4 rounded-full text-white font-semibold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    selectedProfile.active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Ban size={26} className="inline-block mr-3" />
                  {selectedProfile.active ? "Suspend Client" : "Activate Client"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <Users className="w-20 h-20 text-indigo-500 mx-auto" />
              <p className="text-gray-800 text-2xl font-semibold mt-6">Select a Client</p>
              <p className="text-gray-600 mt-3 text-lg">
                Choose a client from the list to explore their details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;