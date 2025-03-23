
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Users,
//   WifiHigh,
//   CheckCircle,
//   Edit,
//   Save,
//   X,
//   Calendar,
//   Clock,
//   RefreshCcw,
// } from "lucide-react";
// // import axios from 'axios'; // Commented out for mock data usage

// const mockPlans = [
//   { id: 1, name: "Basic", validity: "1 day", data: "1GB", price: 1 },
//   { id: 2, name: "Plus", validity: "7 days", data: "10GB", price: 7 },
//   { id: 3, name: "Premium", validity: "30 days", data: "100GB", price: 30 },
// ];

// const mockUsers = [
//   {
//     id: 1,
//     name: "Jane Doe",
//     currentPlan: { id: 3, name: "Premium", validity: "30 days", data: "100GB", 
//       price: 30, assignedDate: "2025-01-12", deviceId: "AA:BB:CC:DD:EE:FF" },
//     lastLogin: "2025-01-12T14:30:00Z"
//   },
//   {
//     id: 2,
//     name: "John Smith",
//     currentPlan: { id: 2, name: "Plus", validity: "7 days", data: "10GB",
//        price: 7, assignedDate: "2025-01-11", deviceId: "11:22:33:44:55:66" },
//     lastLogin: "2025-01-11T12:00:00Z"
//   },
//   { id: 3, name: "Alice Johnson", currentPlan: null, lastLogin: "2025-01-10T08:00:00Z" }, // Example of a user without a plan
// ];

// const PlanAssignment = () => {
//   const [users, setUsers] = useState(mockUsers);
//   const [plans, setPlans] = useState(mockPlans);
//   const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [autoAssign, setAutoAssign] = useState(true);

//   useEffect(() => {
//     // Mock API calls for initial data fetch
//     // In a real scenario:
//     // fetchUsersAndPlans();
//     // const paymentConfirmationListener = setInterval(fetchNewPayments, 10000); // Check every 10 seconds for new payments
//     // return () => clearInterval(paymentConfirmationListener);

//     // Here, we're just setting mock data to mimic an API response
//     setUsers(mockUsers);
//     setPlans(mockPlans);

//     // Simulating automatic plan assignment for demonstration
//     if (autoAssign) {
//       const interval = setInterval(() => {
//         setUsers(prevUsers => prevUsers.map(user => {
//           const daysSinceLastLogin = (new Date() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
//           if (daysSinceLastLogin > 7 && user.currentPlan?.id !== 1) {
//             return { ...user, currentPlan: plans[0] };
//           } else if (daysSinceLastLogin > 1 && user.currentPlan?.id !== 2) {
//             return { ...user, currentPlan: plans[1] };
//           } else if (daysSinceLastLogin <= 1 && user.currentPlan?.id !== 3) {
//             return { ...user, currentPlan: plans[2] };
//           }
//           return user;
//         }));
//       }, 60000); // Check every minute

//       return () => clearInterval(interval);
//     }
//   }, [autoAssign]);

//   // Mock function for automatic plan assignment based on payment
//   // const assignPlanAutomatically = (payment) => {
//   //   const { userId, planId, deviceId } = payment;
//   //   const plan = plans.find(p => p.id === planId);
//   //   if (!plan) {
//   //     console.error(`Plan with id ${planId} not found`);
//   //     return;
//   //   }
//   //   setUsers(prevUsers => 
//   //     prevUsers.map(user => 
//   //       user.id === userId ? 
//   //         { ...user, 
//   //           currentPlan: { 
//   //             ...plan, 
//   //             assignedDate: new Date().toISOString(), 
//   //             deviceId: deviceId 
//   //           } 
//   //         } 
//   //       : user
//   //     )
//   //   );
//   //   // Here you would typically make an API call to update the user's plan on the server
//   // };

//   const handleUserSelect = (userId) => {
//     const user = users.find(u => u.id === userId);
//     setSelectedUser(user);
//   };

//   const handleEditToggle = () => setIsEditing(!isEditing);

//   const handlePlanChange = (planId) => {
//     const newPlan = plans.find(p => p.id === planId);
//     setSelectedUser(prevUser => ({
//       ...prevUser,
//       currentPlan: { ...newPlan, assignedDate: new Date().toISOString() }
//     }));
//     setUsers(prevUsers =>
//       prevUsers.map(user =>
//         user.id === selectedUser.id ? { ...user, currentPlan: { ...newPlan, 
//           assignedDate: new Date().toISOString() } } : user
//       )
//     );
//   };

//   const handleSave = () => {
//     console.log("Plan updated for user:", selectedUser.name, "to:", selectedUser.currentPlan.name);
//     setIsEditing(false);
//   };

//   // Memoized calculation for plan suggestions based on usage patterns
//   const suggestedPlan = useMemo(() => {
//     const daysSinceLastLogin = (new Date() - new Date(selectedUser.lastLogin)) / (1000 * 60 * 60 * 24);
//     if (daysSinceLastLogin > 7) return plans[0];
//     if (daysSinceLastLogin > 1) return plans[1];
//     return plans[2];
//   }, [selectedUser.lastLogin, plans]);

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-gray-50 to-blue-50 p-6">
//       <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
//         <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r
//          from-blue-500 to-purple-500 mb-6 flex items-center">
//           <Users className="mr-2 text-blue-500" /> Plan Management 
//         </h1>

//         {/* User Selection */}
//         <div className="relative mb-4">
//           <select
//             onChange={(e) => handleUserSelect(Number(e.target.value))}
//             value={selectedUser.id}
//             className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none
//              focus:ring focus:ring-blue-300 bg-white text-gray-800"
//           >
//             {users.map(user => (
//               <option key={user.id} value={user.id}>
//                 {user.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Plan Management */}
//         <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-2xl font-bold text-blue-800">
//               <Users className="w-6 h-6 inline-block mr-2 text-blue-500" />
//               {selectedUser.name}'s Plan
//             </h2>
//             <div className="flex space-x-2">
//               <button
//                 onClick={handleEditToggle}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//               >
//                 {isEditing ? <X size={18} /> : <Edit size={18} />}
//               </button>
//               <button
//                 onClick={() => setAutoAssign(!autoAssign)}
//                 className={`px-4 py-2 rounded-full text-white ${autoAssign ? 'bg-green-500 hover:bg-green-600' 
//                   : 'bg-gray-400 hover:bg-gray-500'}`}
//                 title={autoAssign ? "Disable Auto-Assignment" : "Enable Auto-Assignment"}
//               >
//                 <RefreshCcw size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4 mb-4">
//             <WifiHigh className="w-6 h-6 text-blue-500" />
//             <div>
//               <p className="text-sm text-gray-600 font-bold">Current Plan:</p>
//               <h3 className="text-lg font-semibold">{selectedUser.currentPlan ? selectedUser.currentPlan.name : "No Plan"}</h3>
//               <p className="text-sm text-gray-600">
//                 {selectedUser.currentPlan
//                   ? `${selectedUser.currentPlan.data} - Valid for ${selectedUser.currentPlan.validity} - KES ${selectedUser.currentPlan.price}`
//                   : "No Plan Assigned"}
//               </p>
//             </div>
//           </div>

//           {isEditing && (
//             <div className="relative">
//               <select
//                 onChange={(e) => handlePlanChange(Number(e.target.value))}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//               >
//                 {plans.map(plan => (
//                   <option key={plan.id} value={plan.id}>
//                     {plan.name} - {plan.data} for {plan.validity} - KES {plan.price}
//                   </option>
//                 ))}
//               </select>
//               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                 <Calendar className="w-5 h-5 text-gray-400" />
//               </div>
//             </div>
//           )}

//           {!isEditing && (
//             <div className="mt-4">
//               <p className="text-sm text-gray-600 mb-2">Suggested Plan:</p>
//               <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg font-semibold">{suggestedPlan.name}</h3>
//                   <p className="text-sm text-gray-600">{suggestedPlan.data} - Valid for {suggestedPlan.validity} - KES {suggestedPlan.price}</p>
//                 </div>
//                 <CheckCircle className="w-6 h-6 text-green-500" />
//               </div>
//             </div>
//           )}

//           {isEditing && (
//             <button
//               onClick={handleSave}
//               className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
//             >
//               <Save size={18} className="inline-block mr-2" />
//               Save Changes
//             </button>
//           )}
//         </div>

//         {/* Plan Overview */}
//         <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg shadow-lg p-4">
//           <h2 className="text-lg font-semibold mb-4 text-blue-800">Available Plans</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {plans.map(plan => (
//               <div key={plan.id} className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
//                 <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
//                 <p className="text-sm text-gray-600">{plan.data}</p>
//                 <p className="text-sm text-gray-600">Valid for {plan.validity}</p>
//                 <p className="text-lg font-bold text-blue-600">KES {plan.price}</p>
//                 <div className="mt-2 flex justify-between items-center">
//                   <button
//                     onClick={() => handlePlanChange(plan.id)}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
//                   >
//                     Assign
//                   </button>
//                   <CheckCircle
//                     className={`w-6 h-6 KES {plan.id === selectedUser.currentPlan?.id ? 'text-green-500' : 'text-gray-300'}`}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* User List */}
//         <div className="mt-6 overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User Name
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Current Plan
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Assigned Date
//                 </th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Device ID
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {Array.isArray(users) && users.map(user => (
//                 <tr key={user.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <Users className="w-5 h-5 text-gray-500 mr-2" />
//                       {user.name}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {user.currentPlan ? user.currentPlan.name : "No Plan"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {user.currentPlan ? new Date(user.currentPlan.assignedDate).toLocaleDateString() : "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {user.currentPlan ? user.currentPlan.deviceId : "N/A"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanAssignment;





// import React, { useState, useEffect } from "react";
// import { Users, WifiHigh, CheckCircle, Edit, Save, X, Calendar, Clock, RefreshCcw } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../../api";

// const PlanAssignment = () => {
//   const [users, setUsers] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [autoAssign, setAutoAssign] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch users and plans from the backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [usersResponse, plansResponse] = await Promise.all([
//           api.get("/api/user_management/user-profiles/"),
//           api.get("/api/user_management/plans/"),
//         ]);
//         const fetchedUsers = usersResponse.data;
//         setUsers(fetchedUsers);
//         setPlans(plansResponse.data);
//         setSelectedUser(fetchedUsers.length > 0 ? fetchedUsers[0] : null);
//       } catch (error) {
//         setError("Unable to load plans or users. Please try again later.");
//         setUsers([]);
//         setPlans([]);
//         setSelectedUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle user selection
//   const handleUserSelect = (userId) => {
//     const user = users.find((u) => u.id === userId);
//     setSelectedUser(user);
//     setIsEditing(false); // Reset editing mode on user change
//   };

//   // Generate a unique device ID
//   const generateDeviceId = () => {
//     return "MAC-" + Math.random().toString(36).substring(2, 15).toUpperCase();
//   };

//   // Handle plan assignment
//   const handlePlanChange = async (planId) => {
//     if (!selectedUser) return;
//     try {
//       const deviceId = generateDeviceId();
//       const response = await api.post("/api/user_management/user-plans/", {
//         user_id: selectedUser.id,
//         plan_id: planId,
//         device_mac_address: deviceId,
//       });
//       const updatedPlan = response.data.plan;
//       setSelectedUser((prevUser) => ({
//         ...prevUser,
//         subscription_plan: updatedPlan.name, // Match backend field
//         currentPlan: updatedPlan, // Temporary for UI
//       }));
//       setUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user.id === selectedUser.id ? { ...user, subscription_plan: updatedPlan.name, currentPlan: updatedPlan } : user
//         )
//       );
//       setError(null);
//       setIsEditing(false);
//     } catch (error) {
//       setError("Failed to assign plan. Please try again.");
//     }
//   };

//   // Handle save (exit editing)
//   const handleSave = () => {
//     setIsEditing(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
//       <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
//           <h1 className="text-5xl font-extrabold text-center tracking-wide drop-shadow-md flex items-center justify-center">
//             <Users className="w-10 h-10 mr-4" />
//             Plan Assignment
//           </h1>
//           <p className="text-center text-indigo-100 mt-3 text-xl font-light">
//             Optimize Client Plans with Ease
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="p-10 space-y-10">
//           {loading ? (
//             <div className="flex items-center justify-center py-20">
//               <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
//               <span className="ml-4 text-gray-700 text-xl font-medium">Loading Plan Data...</span>
//             </div>
//           ) : error ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <X className="w-20 h-20 text-red-500 mx-auto" />
//               <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 We're refining our plan system. Check back soon!
//               </p>
//             </div>
//           ) : users.length === 0 ? (
//             <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//               <Users className="w-20 h-20 text-indigo-500 mx-auto" />
//               <p className="text-gray-800 text-2xl font-semibold mt-6">No Clients Available</p>
//               <p className="text-gray-600 mt-3 text-lg">
//                 Add clients to begin assigning plans.
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* User Selection */}
//               <div className="bg-gray-100 p-6 rounded-2xl shadow-inner">
//                 <select
//                   onChange={(e) => handleUserSelect(Number(e.target.value))}
//                   value={selectedUser?.id || ""}
//                   className="w-full px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700"
//                 >
//                   <option value="" disabled>
//                     Select a Client
//                   </option>
//                   {users.map((user) => (
//                     <option key={user.id} value={user.id}>
//                       {user.client.full_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Plan Management */}
//               {selectedUser ? (
//                 <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                   <div className="flex items-center justify-between mb-6">
//                     <h2 className="text-3xl font-bold text-gray-900 flex items-center">
//                       <Users className="w-8 h-8 text-indigo-600 mr-3" />
//                       {selectedUser.client.full_name}'s Plan
//                     </h2>
//                     <div className="flex space-x-4">
//                       <button
//                         onClick={() => setIsEditing(!isEditing)}
//                         className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
//                       >
//                         {isEditing ? <X size={20} /> : <Edit size={20} />}
//                       </button>
//                       <button
//                         onClick={() => setAutoAssign(!autoAssign)}
//                         className={`px-6 py-2 rounded-full text-white shadow-md hover:shadow-lg transition-colors ${
//                           autoAssign ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
//                         }`}
//                         title={autoAssign ? "Disable Auto-Assignment" : "Enable Auto-Assignment"}
//                       >
//                         <RefreshCcw size={20} />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="space-y-6">
//                     <div className="flex items-center space-x-4">
//                       <WifiHigh className="w-8 h-8 text-indigo-600" />
//                       <div>
//                         <p className="text-sm text-gray-600 font-bold">Current Plan:</p>
//                         <h3 className="text-xl font-semibold text-gray-800">
//                           {selectedUser.subscription_plan || "No Plan Assigned"}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           {selectedUser.currentPlan
//                             ? `${selectedUser.currentPlan.data} - Valid for ${selectedUser.currentPlan.validity} - KES ${selectedUser.currentPlan.price}`
//                             : "Assign a plan to get started"}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="p-6 bg-gray-50 rounded-xl shadow-inner">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
//                       <div className="flex items-center space-x-3">
//                         <Clock className="w-6 h-6 text-orange-500" />
//                         <p className="text-gray-700">
//                           <span className="font-bold">Last Login:</span>{" "}
//                           {selectedUser.last_login
//                             ? new Date(selectedUser.last_login).toLocaleString()
//                             : "Not Available"}
//                         </p>
//                       </div>
//                     </div>

//                     {isEditing && (
//                       <div className="relative">
//                         <select
//                           onChange={(e) => handlePlanChange(e.target.value)}
//                           className="w-full px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700"
//                         >
//                           <option value="" disabled>
//                             Select a Plan
//                           </option>
//                           {plans.map((plan) => (
//                             <option key={plan.id} value={plan.id}>
//                               {plan.name} - {plan.data} for {plan.validity} - KES {plan.price}
//                             </option>
//                           ))}
//                         </select>
//                         <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       </div>
//                     )}

//                     {isEditing && (
//                       <button
//                         onClick={handleSave}
//                         className="mt-6 px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
//                       >
//                         <Save size={20} className="inline-block mr-2" />
//                         Save Changes
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
//                   <Users className="w-20 h-20 text-indigo-500 mx-auto" />
//                   <p className="text-gray-800 text-2xl font-semibold mt-6">Select a Client</p>
//                   <p className="text-gray-600 mt-3 text-lg">
//                     Choose a client from the dropdown to manage their plan.
//                   </p>
//                 </div>
//               )}

//               {/* Plan Overview */}
//               {plans.length > 0 && (
//                 <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
//                   <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Plans</h2>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {plans.map((plan) => (
//                       <div
//                         key={plan.id}
//                         className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
//                       >
//                         <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
//                         <p className="text-gray-600 mt-1">{plan.data}</p>
//                         <p className="text-gray-600">Valid for {plan.validity}</p>
//                         <p className="text-lg font-semibold text-indigo-600 mt-2">KES {plan.price}</p>
//                         <div className="mt-4 flex justify-between items-center">
//                           <button
//                             onClick={() => handlePlanChange(plan.id)}
//                             className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
//                           >
//                             Assign
//                           </button>
//                           <CheckCircle
//                             className={`w-6 h-6 ${
//                               selectedUser?.subscription_plan === plan.name ? "text-green-500" : "text-gray-300"
//                             }`}
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* User List */}
//               {users.length > 0 && (
//                 <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-x-auto">
//                   <h2 className="text-2xl font-semibold text-gray-900 mb-6">Client Plan Overview</h2>
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-indigo-50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Client Name</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Current Plan</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Assigned Date</th>
//                         <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Device ID</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {users.map((user) => (
//                         <tr key={user.id}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <Users className="w-5 h-5 text-gray-500 mr-2" />
//                               {user.client.full_name}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
//                             {user.subscription_plan || "No Plan"}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
//                             {user.currentPlan?.assigned_date
//                               ? new Date(user.currentPlan.assigned_date).toLocaleDateString()
//                               : "N/A"}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
//                             {user.currentPlan?.device_mac_address || "N/A"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanAssignment;






import React, { useState, useEffect } from "react";
import { Users, WifiHigh, CheckCircle, Edit, Save, X, Calendar, Clock, RefreshCcw } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import api from "../../../api";

const PlanAssignment = () => {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users and plans from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, plansResponse] = await Promise.all([
          api.get("/api/user_management/user-profiles/"),
          api.get("/api/user_management/plans/"),
        ]);
        const fetchedUsers = usersResponse.data;
        setUsers(fetchedUsers);
        setPlans(plansResponse.data);
        setSelectedUser(fetchedUsers.length > 0 ? fetchedUsers[0] : null);
      } catch (error) {
        setError("Unable to load plans or users. Please try again later.");
        setUsers([]);
        setPlans([]);
        setSelectedUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle user selection
  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    setIsEditing(false); // Reset editing mode on user change
  };

  // Generate a unique device ID
  const generateDeviceId = () => {
    return "MAC-" + Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  // Handle plan assignment
  const handlePlanChange = async (planId) => {
    if (!selectedUser) return;
    try {
      const deviceId = generateDeviceId();
      const response = await api.post("/api/user_management/user-plans/", {
        user_id: selectedUser.id,
        plan_id: planId,
        device_mac_address: deviceId,
      });
      const updatedPlan = response.data.plan;
      setSelectedUser((prevUser) => ({
        ...prevUser,
        subscription_plan: updatedPlan.name, // Match backend field
        currentPlan: updatedPlan, // Temporary for UI
      }));
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, subscription_plan: updatedPlan.name, currentPlan: updatedPlan } : user
        )
      );
      setError(null);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to assign plan. Please try again.");
    }
  };

  // Handle save (exit editing)
  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-600 p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-8 text-white">
          <h1 className="text-5xl font-extrabold text-center tracking-wide drop-shadow-md flex items-center justify-center">
            <Users className="w-10 h-10 mr-4" />
            Plan Assignment
          </h1>
          <p className="text-center text-indigo-100 mt-3 text-xl font-light">
            Optimize Client Plans with Ease
          </p>
        </div>

        {/* Main Content */}
        <div className="p-10 space-y-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-indigo-600 text-5xl" />
              <span className="ml-4 text-gray-700 text-xl font-medium">Loading Plan Data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <X className="w-20 h-20 text-red-500 mx-auto" />
              <p className="text-red-600 text-2xl font-semibold mt-6">{error}</p>
              <p className="text-gray-600 mt-3 text-lg">
                We're refining our plan system. Check back soon!
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
              <Users className="w-20 h-20 text-indigo-500 mx-auto" />
              <p className="text-gray-800 text-2xl font-semibold mt-6">No Clients Available</p>
              <p className="text-gray-600 mt-3 text-lg">
                Add clients to begin assigning plans.
              </p>
            </div>
          ) : (
            <>
              {/* User Selection */}
              <div className="bg-gray-100 p-6 rounded-2xl shadow-inner">
                <select
                  onChange={(e) => handleUserSelect(Number(e.target.value))}
                  value={selectedUser?.id || ""}
                  className="w-full px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700"
                >
                  <option value="" disabled>
                    Select a Client
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.client.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Management */}
              {selectedUser ? (
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                      <Users className="w-8 h-8 text-indigo-600 mr-3" />
                      {selectedUser.client.full_name}'s Plan
                    </h2>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        {isEditing ? <X size={20} /> : <Edit size={20} />}
                      </button>
                      <button
                        onClick={() => setAutoAssign(!autoAssign)}
                        className={`px-6 py-2 rounded-full text-white shadow-md hover:shadow-lg transition-colors ${
                          autoAssign ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
                        }`}
                        title={autoAssign ? "Disable Auto-Assignment" : "Enable Auto-Assignment"}
                      >
                        <RefreshCcw size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <WifiHigh className="w-8 h-8 text-indigo-600" />
                      <div>
                        <p className="text-sm text-gray-600 font-bold">Current Plan:</p>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedUser.subscription_plan || "No Plan Assigned"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedUser.currentPlan
                            ? `${selectedUser.currentPlan.data} - Valid for ${selectedUser.currentPlan.validity} - KES ${selectedUser.currentPlan.price}`
                            : "Assign a plan to get started"}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-xl shadow-inner">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-orange-500" />
                        <p className="text-gray-700">
                          <span className="font-bold">Last Login:</span>{" "}
                          {selectedUser.last_login
                            ? new Date(selectedUser.last_login).toLocaleString()
                            : "Not Available"}
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="relative">
                        <select
                          onChange={(e) => handlePlanChange(e.target.value)}
                          className="w-full px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300 text-gray-700"
                        >
                          <option value="" disabled>
                            Select a Plan
                          </option>
                          {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} - {plan.data} for {plan.validity} - KES {plan.price}
                            </option>
                          ))}
                        </select>
                        <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    )}

                    {isEditing && (
                      <button
                        onClick={handleSave}
                        className="mt-6 px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Save size={20} className="inline-block mr-2" />
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner">
                  <Users className="w-20 h-20 text-indigo-500 mx-auto" />
                  <p className="text-gray-800 text-2xl font-semibold mt-6">Select a Client</p>
                  <p className="text-gray-600 mt-3 text-lg">
                    Choose a client from the dropdown to manage their plan.
                  </p>
                </div>
              )}

              {/* Plan Overview */}
              {plans.length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Plans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
                      >
                        <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                        <p className="text-gray-600 mt-1">{plan.data}</p>
                        <p className="text-gray-600">Valid for {plan.validity}</p>
                        <p className="text-lg font-semibold text-indigo-600 mt-2">KES {plan.price}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <button
                            onClick={() => handlePlanChange(plan.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                          >
                            Assign
                          </button>
                          <CheckCircle
                            className={`w-6 h-6 ${
                              selectedUser?.subscription_plan === plan.name ? "text-green-500" : "text-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              {users.length > 0 && (
                <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-x-auto">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Client Plan Overview</h2>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Client Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Current Plan</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Assigned Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-indigo-700">Device ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="w-5 h-5 text-gray-500 mr-2" />
                              {user.client.full_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {user.subscription_plan || "No Plan"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {user.currentPlan?.assigned_date
                              ? new Date(user.currentPlan.assigned_date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            {user.currentPlan?.device_mac_address || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanAssignment;