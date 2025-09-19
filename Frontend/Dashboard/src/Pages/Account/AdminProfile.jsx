// import React, { useState, useEffect } from "react";
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity, Server, CheckCircle } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../api"
// import { useAuth } from "../../context/AuthContext";
// import avatar from "../../assets/avatar.png";

// const AdminProfile = ({ theme }) => {
//   const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();
//   const [profile, setProfile] = useState({
//     name: userDetails.name || "",
//     email: userDetails.email || "",
//     profilePic: userDetails.profilePic || "",
//   });
//   const [stats, setStats] = useState({
//     clients: 0,
//     activeClients: 0,
//     revenue: 0,
//     uptime: "0%",
//     total_subscriptions: 0,
//     successful_transactions: 0,
//   });
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [activities, setActivities] = useState([{ description: "No activities yet", timestamp: new Date().toISOString() }]);
//   const [network, setNetwork] = useState({
//     latency: "0ms",
//     bandwidth: "0%",
//   });
//   const [routers, setRouters] = useState([{ name: "No routers", status: "Offline", color: "red", latency: 0, bandwidth_usage: 0 }]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempProfile, setTempProfile] = useState({});
//   const [previewImage, setPreviewImage] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!isAuthenticated) {
//         console.log("User is not authenticated, skipping fetch");
//         setError("Please log in to view your profile.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         console.log("Fetching profile data...");
//         setIsLoading(true);
//         const response = await api.get("/api/account/profile/");
//         console.log("API response received:", response.data);

//         const profileData = response.data.profile || {};
//         const updatedProfile = {
//           name: profileData.name || userDetails.name || "",
//           email: profileData.email || userDetails.email || "",
//           profilePic: profileData.profile_pic || userDetails.profilePic || "",
//         };

//         setProfile(updatedProfile);
//         setStats(response.data.stats || stats);
//         setSubscriptions(response.data.subscriptions || []);
//         setPayments(response.data.payments || []);
//         setActivities(response.data.activities || activities);
//         setNetwork(response.data.network || network);
//         setRouters(response.data.routers || routers);

//         // Update AuthContext with fetched profile data
//         updateUserDetails(updatedProfile);

//         setError(null);
//       } catch (err) {
//         console.error("Fetch error:", err.response?.data || err.message);
//         setError(err.response?.data?.error || `Failed to load profile: ${err.message}`);
//       } finally {
//         console.log("Fetch complete, setting isLoading to false");
//         setIsLoading(false);
//       }
//     };

//     console.log("useEffect triggered, authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
//     if (!authLoading && isAuthenticated) {
//       fetchData();
//     }
//   }, [isAuthenticated, authLoading, updateUserDetails]);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         setError("Please upload an image file.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB.");
//         return;
//       }
//       setTempProfile((prev) => ({ ...prev, profilePic: file }));
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//     if (!isEditing) {
//       setTempProfile({ ...profile });
//       setPreviewImage(null);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!isAuthenticated) {
//       setError("Please log in to update your profile.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("name", tempProfile.name || profile.name);
//       if (tempProfile.profilePic instanceof File) {
//         formData.append("profile_pic", tempProfile.profilePic);
//       }

//       const response = await api.put("/api/account/profile/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const updatedProfile = {
//         name: response.data.name || "",
//         email: response.data.email || "",
//         profilePic: response.data.profile_pic || "",
//       };

//       setProfile(updatedProfile);
//       setPreviewImage(null);
//       updateUserDetails(updatedProfile);
//       setIsEditing(false);
//       setError(null);
//     } catch (err) {
//       console.error("Save profile error:", err);
//       setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setTempProfile((prev) => ({ ...prev, [name]: value }));
//   };

//   console.log("Rendering AdminProfile, isLoading:", isLoading, "authLoading:", authLoading, "isAuthenticated:", isAuthenticated);

//   if (authLoading || isLoading) {
//     return (
//       <div className={`min-h-screen p-8 flex justify-center items-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <p className="text-center text-red-400">Please log in to access your profile.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
//       <main className="max-w-7xl mx-auto space-y-8">
//         {error && (
//           <div className="bg-red-500 text-white p-4 rounded-lg text-center whitespace-pre-wrap">
//             {error}
//           </div>
//         )}
//         <header className="text-center">
//           <h1 className={`text-5xl font-extrabold tracking-tight ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500" : "text-indigo-600"}`}>
//             Admin Hub
//           </h1>
//           <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//             Welcome, {profile.name || "User"}
//           </p>
//         </header>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <div className="flex flex-col md:flex-row items-center gap-6">
//             <div className="relative w-32 h-32">
//               <img
//                 src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
//                 alt="User"
//                 className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
//               />
//               {isEditing && (
//                 <label
//                   htmlFor="profile-pic-upload"
//                   className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
//                 >
//                   <Camera className="w-5 h-5" />
//                   <input
//                     type="file"
//                     id="profile-pic-upload"
//                     className="hidden"
//                     onChange={handleFileUpload}
//                     accept="image/*"
//                   />
//                 </label>
//               )}
//             </div>
//             <div className="flex-1 space-y-4">
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name="name"
//                   value={tempProfile.name || ""}
//                   onChange={handleInputChange}
//                   className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"}`}
//                   placeholder="User Name"
//                 />
//               ) : (
//                 <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
//               )}
//               <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{profile.email || "No email provided"}</p>
//               <div>
//                 {isEditing ? (
//                   <div className="flex gap-4">
//                     <button
//                       onClick={handleSaveProfile}
//                       className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={handleEditToggle}
//                       className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={handleEditToggle}
//                     className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
//                   >
//                     <span>✏️</span> Edit Profile
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[
//             { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//             { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//             { title: "Daily Revenue", value: `KES ${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "yellow" },
//             { title: "Uptime", value: stats.uptime, icon: Gauge, color: "purple" },
//             { title: "Total Subscriptions", value: stats.total_subscriptions, icon: Server, color: "blue" },
//             { title: "Successful Transactions", value: stats.successful_transactions, icon: CheckCircle, color: "teal" },
//           ].map(({ title, value, icon: Icon, color }) => (
//             <div
//               key={title}
//               className={`p-4 rounded-xl shadow-md flex items-center gap-4 transition ${theme === "dark" ? `bg-${color}-900 hover:bg-${color}-800` : `bg-${color}-100 hover:bg-${color}-200`}`}
//             >
//               <Icon className={`w-8 h-8 text-${color}-400`} />
//               <div>
//                 <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{title}</p>
//                 <p className="text-xl font-semibold">{value}</p>
//               </div>
//             </div>
//           ))}
//         </section>

//         <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//             <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <Wifi className="w-6 h-6 text-green-400" /> Network Status
//             </h3>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <p>Latency</p>
//                 <p className="text-green-400">{network.latency}</p>
//               </div>
//               <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <div
//                   className="bg-green-500 h-2 rounded-full"
//                   style={{ width: `${Math.min(parseFloat(network.latency) * 10, 100)}%` }}
//                 ></div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <p>Bandwidth Usage</p>
//                 <p className="text-yellow-400">{network.bandwidth}</p>
//               </div>
//               <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <div
//                   className="bg-yellow-500 h-2 rounded-full"
//                   style={{ width: network.bandwidth || "0%" }}
//                 ></div>
//               </div>
//             </div>
//           </div>

//           <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//             <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//               <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
//             </h3>
//             <ul className="space-y-3 max-h-64 overflow-y-auto">
//               {activities.map((activity, index) => (
//                 <li key={index} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                   <p>{activity.description}</p>
//                   <p className="text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </section>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <h3 className="text-xl font-semibold mb-4">Recent Subscriptions</h3>
//           <div className="grid grid-cols-1 gap-4">
//             {subscriptions.length > 0 ? (
//               subscriptions.map((sub) => (
//                 <div key={sub.id} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                   <p><strong>Client:</strong> {sub.client.full_name}</p>
//                   <p><strong>Phone:</strong> {sub.client.phonenumber}</p>
//                   <p><strong>Plan:</strong> {sub.internet_plan?.name || "No Plan"}</p>
//                   <p><strong>Data Limit:</strong> {sub.internet_plan?.data_limit ? `${sub.internet_plan.data_limit.value} ${sub.internet_plan.data_limit.unit}` : "N/A"}</p>
//                   <p><strong>Status:</strong> {sub.is_active ? "Active" : "Inactive"}</p>
//                   <p><strong>Start:</strong> {new Date(sub.start_date).toLocaleDateString()}</p>
//                   <p><strong>End:</strong> {new Date(sub.end_date).toLocaleDateString()}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No recent subscriptions</p>
//             )}
//           </div>
//         </section>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <h3 className="text-xl font-semibold mb-4">Recent Payments</h3>
//           <div className="grid grid-cols-1 gap-4">
//             {payments.length > 0 ? (
//               payments.map((payment) => (
//                 <div key={payment.id} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                   <p><strong>Client:</strong> {payment.client.full_name}</p>
//                   <p><strong>Phone:</strong> {payment.client.phonenumber}</p>
//                   <p><strong>Amount:</strong> KES {payment.amount.toFixed(2)}</p>
//                   <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
//                   <p><strong>Transaction:</strong> {payment.transaction?.mpesa_code || "N/A"}</p>
//                   <p><strong>Plan:</strong> {payment.subscription?.internet_plan?.name || "N/A"}</p>
//                   <p><strong>Status:</strong> {payment.transaction?.status || "Unknown"}</p>
//                 </div>
//               ))
//             ) : (
//               <p>No recent payments</p>
//             )}
//           </div>
//         </section>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <h3 className="text-xl font-semibold mb-4">Router Overview</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {routers.map(({ name, status, color, latency, bandwidth_usage }) => (
//               <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <div>
//                   <span className="font-semibold">{name}</span>
//                   <p className="text-sm text-gray-400">Latency: {latency}ms</p>
//                   <p className="text-sm text-gray-400">Bandwidth: {bandwidth_usage}%</p>
//                 </div>
//                 <span className={`text-${color}-400 font-medium`}>{status}</span>
//               </div>
//             ))}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default AdminProfile;








// import React, { useState, useEffect } from "react";
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity, Server, CheckCircle } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../api"
// import { useAuth } from "../../context/AuthContext";
// import avatar from "../../assets/avatar.png";

// const AdminProfile = ({ theme }) => {
//   const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();
//   const [profile, setProfile] = useState({
//     name: userDetails.name || "",
//     email: userDetails.email || "",
//     profilePic: userDetails.profilePic || "",
//   });
//   const [stats, setStats] = useState({
//     clients: 0,
//     activeClients: 0,
//     revenue: 0,
//     uptime: "0%",
//     total_subscriptions: 0,
//     successful_transactions: 0,
//   });
//   const [activities, setActivities] = useState([{ description: "No activities yet", timestamp: new Date().toISOString() }]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempProfile, setTempProfile] = useState({});
//   const [previewImage, setPreviewImage] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!isAuthenticated) {
//         console.log("User is not authenticated, skipping fetch");
//         setError("Please log in to view your profile.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         console.log("Fetching profile data...");
//         setIsLoading(true);
//         const response = await api.get("/api/account/profile/");
//         console.log("API response received:", response.data);

//         const profileData = response.data.profile || {};
//         const updatedProfile = {
//           name: profileData.name || userDetails.name || "",
//           email: profileData.email || userDetails.email || "",
//           profilePic: profileData.profile_pic || userDetails.profilePic || "",
//         };

//         setProfile(updatedProfile);
//         setStats(response.data.stats || stats);
//         setActivities(response.data.activities || activities);

//         // Update AuthContext with fetched profile data
//         updateUserDetails(updatedProfile);

//         setError(null);
//       } catch (err) {
//         console.error("Fetch error:", err.response?.data || err.message);
//         setError(err.response?.data?.error || `Failed to load profile: ${err.message}`);
//       } finally {
//         console.log("Fetch complete, setting isLoading to false");
//         setIsLoading(false);
//       }
//     };

//     console.log("useEffect triggered, authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
//     if (!authLoading && isAuthenticated) {
//       fetchData();
//     }
//   }, [isAuthenticated, authLoading, updateUserDetails]);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         setError("Please upload an image file.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB.");
//         return;
//       }
//       setTempProfile((prev) => ({ ...prev, profilePic: file }));
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//     if (!isEditing) {
//       setTempProfile({ ...profile });
//       setPreviewImage(null);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!isAuthenticated) {
//       setError("Please log in to update your profile.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("name", tempProfile.name || profile.name);
//       if (tempProfile.profilePic instanceof File) {
//         formData.append("profile_pic", tempProfile.profilePic);
//       }

//       const response = await api.put("/api/account/profile/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const updatedProfile = {
//         name: response.data.name || "",
//         email: response.data.email || "",
//         profilePic: response.data.profile_pic || "",
//       };

//       setProfile(updatedProfile);
//       setPreviewImage(null);
//       updateUserDetails(updatedProfile);
//       setIsEditing(false);
//       setError(null);
//     } catch (err) {
//       console.error("Save profile error:", err);
//       setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setTempProfile((prev) => ({ ...prev, [name]: value }));
//   };

//   console.log("Rendering AdminProfile, isLoading:", isLoading, "authLoading:", authLoading, "isAuthenticated:", isAuthenticated);

//   if (authLoading || isLoading) {
//     return (
//       <div className={`min-h-screen p-8 flex justify-center items-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <p className="text-center text-red-400">Please log in to access your profile.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
//       <main className="max-w-7xl mx-auto space-y-8">
//         {error && (
//           <div className="bg-red-500 text-white p-4 rounded-lg text-center whitespace-pre-wrap">
//             {error}
//           </div>
//         )}
//         <header className="text-center">
//           <h1 className={`text-5xl font-extrabold tracking-tight ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500" : "text-indigo-600"}`}>
//             Admin Hub
//           </h1>
//           <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//             Welcome, {profile.name || "User"}
//           </p>
//         </header>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <div className="flex flex-col md:flex-row items-center gap-6">
//             <div className="relative w-32 h-32">
//               <img
//                 src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
//                 alt="User"
//                 className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
//               />
//               {isEditing && (
//                 <label
//                   htmlFor="profile-pic-upload"
//                   className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
//                 >
//                   <Camera className="w-5 h-5" />
//                   <input
//                     type="file"
//                     id="profile-pic-upload"
//                     className="hidden"
//                     onChange={handleFileUpload}
//                     accept="image/*"
//                   />
//                 </label>
//               )}
//             </div>
//             <div className="flex-1 space-y-4">
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name="name"
//                   value={tempProfile.name || ""}
//                   onChange={handleInputChange}
//                   className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"}`}
//                   placeholder="User Name"
//                 />
//               ) : (
//                 <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
//               )}
//               <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{profile.email || "No email provided"}</p>
//               <div>
//                 {isEditing ? (
//                   <div className="flex gap-4">
//                     <button
//                       onClick={handleSaveProfile}
//                       className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={handleEditToggle}
//                       className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={handleEditToggle}
//                     className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
//                   >
//                     <span>✏️</span> Edit Profile
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[
//             { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//             { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//           ].map(({ title, value, icon: Icon, color }) => (
//             <div
//               key={title}
//               className={`p-4 rounded-xl shadow-md flex items-center gap-4 transition ${theme === "dark" ? `bg-${color}-900 hover:bg-${color}-800` : `bg-${color}-100 hover:bg-${color}-200`}`}
//             >
//               <Icon className={`w-8 h-8 text-${color}-400`} />
//               <div>
//                 <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{title}</p>
//                 <p className="text-xl font-semibold">{value}</p>
//               </div>
//             </div>
//           ))}
//         </section>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
//           </h3>
//           <ul className="space-y-3 max-h-64 overflow-y-auto">
//             {activities.map((activity, index) => (
//               <li key={index} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <p>{activity.description}</p>
//                 <p className="text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
//               </li>
//             ))}
//           </ul>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default AdminProfile;






// // AdminProfile.js
// import React, { useState, useEffect } from "react";
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity, Server, CheckCircle, Bell, Globe, Shield, Lock, BookOpen, UserCheck } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import NotificationSystem from "./NotificationSystem";
// import LanguageRegionSelector from "./LanguageRegionSelector";
// import LoginHistory from "./LoginHistory";
// import SupportDocumentation from "./SupportDocumentation";
// import RolePermissions from "./RolePermissions";
// import PasswordSecurity from "./PasswordSecurity";
// import avatar from "../../assets/avatar.png";

// const AdminProfile = ({ theme }) => {
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [notifications, setNotifications] = useState([]);
//   const [language, setLanguage] = useState("en");
//   const [region, setRegion] = useState("US");

//   // Mock data for demonstration
//   const mockUser = {
//     name: "Admin User",
//     email: "admin@example.com",
//     profilePic: "",
//     role: "Super Admin",
//     lastLogin: {
//       timestamp: new Date().toISOString(),
//       ip: "192.168.1.100",
//       device: "Chrome on Windows",
//       location: "Nairobi, Kenya"
//     }
//   };

//   const mockStats = {
//     clients: 254,
//     activeClients: 198,
//     revenue: 12500,
//     uptime: "99.8%",
//     total_subscriptions: 287,
//     successful_transactions: 1204,
//   };

//   const mockActivities = [
//     { description: "User login from new device", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
//     { description: "Network outage resolved", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
//     { description: "New client registration: John Doe", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
//     { description: "System backup completed", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
//   ];

//   const mockLoginHistory = [
//     { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), ip: "192.168.1.100", device: "Chrome on Windows", location: "Nairobi, Kenya" },
//     { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), ip: "41.90.12.34", device: "Safari on iOS", location: "Mombasa, Kenya" },
//     { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), ip: "105.23.45.67", device: "Firefox on macOS", location: "Kampala, Uganda" },
//   ];

//   // Simulate receiving new notifications
//   useEffect(() => {
//     const notificationExamples = [
//       {
//         id: 1,
//         type: "new_client",
//         title: "New Client Signup",
//         message: "John Doe has signed up for the Premium package",
//         timestamp: new Date().toISOString(),
//         read: false,
//         priority: "medium"
//       },
//       {
//         id: 2,
//         type: "network_outage",
//         title: "Network Outage Detected",
//         message: "Zone B is experiencing connectivity issues",
//         timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
//         read: false,
//         priority: "high"
//       },
//       {
//         id: 3,
//         type: "system_alert",
//         title: "System Update Available",
//         message: "New system update is ready for installation",
//         timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
//         read: true,
//         priority: "low"
//       }
//     ];

//     setNotifications(notificationExamples);
//   }, []);

//   const markNotificationAsRead = (id) => {
//     setNotifications(notifications.map(notification => 
//       notification.id === id ? {...notification, read: true} : notification
//     ));
//   };

//   const clearAllNotifications = () => {
//     setNotifications([]);
//   };

//   const handleLanguageChange = (newLanguage, newRegion) => {
//     setLanguage(newLanguage);
//     setRegion(newRegion);
//     // In a real app, you would save these preferences to the backend
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "dashboard":
//         return (
//           <>
//             <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {[
//                 { title: "Total Clients", value: mockStats.clients, icon: Users, color: "indigo" },
//                 { title: "Active Users", value: mockStats.activeClients, icon: Wifi, color: "green" },
//                 { title: "Monthly Revenue", value: `$${mockStats.revenue}`, icon: DollarSign, color: "blue" },
//                 { title: "System Uptime", value: mockStats.uptime, icon: Server, color: "purple" },
//                 { title: "Total Subscriptions", value: mockStats.total_subscriptions, icon: CheckCircle, color: "yellow" },
//                 { title: "Successful Transactions", value: mockStats.successful_transactions, icon: Gauge, color: "red" },
//               ].map(({ title, value, icon: Icon, color }) => (
//                 <div
//                   key={title}
//                   className={`p-4 rounded-xl shadow-md flex items-center gap-4 transition ${theme === "dark" ? `bg-${color}-900 hover:bg-${color}-800` : `bg-${color}-100 hover:bg-${color}-200`}`}
//                 >
//                   <Icon className={`w-8 h-8 text-${color}-400`} />
//                   <div>
//                     <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{title}</p>
//                     <p className="text-xl font-semibold">{value}</p>
//                   </div>
//                 </div>
//               ))}
//             </section>

//             <section className={`rounded-xl p-6 shadow-lg mb-8 ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                 <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
//               </h3>
//               <ul className="space-y-3 max-h-64 overflow-y-auto">
//                 {mockActivities.map((activity, index) => (
//                   <li key={index} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                     <p>{activity.description}</p>
//                     <p className="text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
//                   </li>
//                 ))}
//               </ul>
//             </section>
//           </>
//         );
//       case "notifications":
//         return <NotificationSystem 
//                  notifications={notifications} 
//                  onMarkAsRead={markNotificationAsRead}
//                  onClearAll={clearAllNotifications}
//                  theme={theme}
//                />;
//       case "login-history":
//         return <LoginHistory history={mockLoginHistory} theme={theme} />;
//       case "support":
//         return <SupportDocumentation theme={theme} />;
//       case "roles":
//         return <RolePermissions theme={theme} />;
//       case "security":
//         return <PasswordSecurity user={mockUser} theme={theme} />;
//       default:
//         return <div>Select a tab</div>;
//     }
//   };

//   return (
//     <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
//       <main className="max-w-7xl mx-auto space-y-8">
//         <header className="flex justify-between items-center">
//           <div>
//             <h1 className={`text-5xl font-extrabold tracking-tight ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500" : "text-indigo-600"}`}>
//               Admin Hub
//             </h1>
//             <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//               Welcome, {mockUser.name}
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             <LanguageRegionSelector 
//               language={language} 
//               region={region} 
//               onChange={handleLanguageChange}
//               theme={theme}
//             />
//             <NotificationSystem 
//               notifications={notifications} 
//               onMarkAsRead={markNotificationAsRead}
//               isWidget={true}
//               theme={theme}
//             />
//           </div>
//         </header>

//         <div className="flex flex-col md:flex-row gap-8">
//           {/* Sidebar Navigation */}
//           <div className={`w-full md:w-64 rounded-xl p-4 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//             <nav className="space-y-2">
//               {[
//                 { id: "dashboard", label: "Dashboard", icon: Gauge },
//                 { id: "notifications", label: "Notifications", icon: Bell },
//                 { id: "login-history", label: "Login History", icon: Activity },
//                 { id: "support", label: "Support & Docs", icon: BookOpen },
//                 { id: "roles", label: "Roles & Permissions", icon: UserCheck },
//                 { id: "security", label: "Password & Security", icon: Shield },
//               ].map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
//                     activeTab === item.id 
//                       ? "bg-indigo-600 text-white" 
//                       : theme === "dark" 
//                         ? "hover:bg-gray-600" 
//                         : "hover:bg-gray-200"
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   <span>{item.label}</span>
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1">
//             {renderTabContent()}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminProfile;







// import React, { useState, useEffect } from "react";
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity, Server, CheckCircle, Bell, Globe, Shield, Lock, BookOpen, UserCheck } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import NotificationSystem from "../../components/AdminProfile/NotificationSystem";
// import LanguageRegionSelector from "../../components/AdminProfile/LanguageRegionSelector";
// import LoginHistory from "../../components/AdminProfile/LoginHistory";
// import SupportDocumentation from "../../components/AdminProfile/SupportDocumentation";
// import RolePermissions from "../../components/AdminProfile/RolePermissions";
// import PasswordSecurity from "../../components/AdminProfile/PasswordSecurity";
// import avatar from "../../assets/avatar.png";

// const AdminProfile = ({ theme }) => {
//   const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [profile, setProfile] = useState({
//     name: userDetails.name || "",
//     email: userDetails.email || "",
//     profilePic: userDetails.profile_pic || "",
//     user_type: userDetails.user_type || "",
//     is_2fa_enabled: userDetails.is_2fa_enabled || false,
//   });
//   const [stats, setStats] = useState({
//     clients: 0,
//     activeClients: 0,
//     revenue: 0,
//     uptime: "0%",
//     total_subscriptions: 0,
//     successful_transactions: 0,
//   });
//   const [activities, setActivities] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [loginHistory, setLoginHistory] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempProfile, setTempProfile] = useState({});
//   const [previewImage, setPreviewImage] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!isAuthenticated) {
//         setError("Please log in to view your profile.");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const profileResponse = await api.get("/api/account/profile/");
//         const updatedProfile = {
//           name: profileResponse.data.profile.name || "",
//           email: profileResponse.data.profile.email || "",
//           profilePic: profileResponse.data.profile.profile_pic || "",
//           user_type: profileResponse.data.profile.user_type || "",
//           is_2fa_enabled: profileResponse.data.profile.is_2fa_enabled || false,
//         };
//         setProfile(updatedProfile);
//         setStats(profileResponse.data.stats || stats);
//         setActivities(profileResponse.data.activities || []);

//         const notificationResponse = await api.get("/api/account/notifications/");
//         setNotifications(notificationResponse.data);

//         const historyResponse = await api.get("/api/account/login-history/");
//         setLoginHistory(historyResponse.data);

//         updateUserDetails(updatedProfile);
//         setError(null);
//       } catch (err) {
//         setError(err.response?.data?.error || `Failed to load data: ${err.message}`);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (!authLoading && isAuthenticated) {
//       fetchData();
//     }
//   }, [isAuthenticated, authLoading, updateUserDetails]);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         setError("Please upload an image file.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB.");
//         return;
//       }
//       setTempProfile((prev) => ({ ...prev, profilePic: file }));
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//     if (!isEditing) {
//       setTempProfile({ ...profile });
//       setPreviewImage(null);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (!isAuthenticated) {
//       setError("Please log in to update your profile.");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("name", tempProfile.name || profile.name);
//       if (tempProfile.profilePic instanceof File) {
//         formData.append("profile_pic", tempProfile.profilePic);
//       }

//       const response = await api.put("/api/account/profile/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setProfile(response.data);
//       setPreviewImage(null);
//       updateUserDetails(response.data);
//       setIsEditing(false);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setTempProfile((prev) => ({ ...prev, [name]: value }));
//   };

//   const markNotificationAsRead = async (id) => {
//     try {
//       await api.patch(`/api/account/notifications/${id}/`);
//       setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to mark notification as read");
//     }
//   };

//   const clearAllNotifications = async () => {
//     try {
//       await api.delete("/api/account/notifications/");
//       setNotifications([]);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to clear notifications");
//     }
//   };

//   if (authLoading || isLoading) {
//     return (
//       <div className={`min-h-screen p-8 flex justify-center items-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <p className="text-center text-red-400">Please log in to access your profile.</p>
//       </div>
//     );
//   }

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "dashboard":
//         return (
//           <>
//             <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {[
//                 { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//                 { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//                 { title: "Monthly Revenue", value: `$${stats.revenue}`, icon: DollarSign, color: "blue" },
//                 { title: "System Uptime", value: stats.uptime, icon: Server, color: "purple" },
//                 { title: "Total Subscriptions", value: stats.total_subscriptions, icon: CheckCircle, color: "yellow" },
//                 { title: "Successful Transactions", value: stats.successful_transactions, icon: Gauge, color: "red" },
//               ].map(({ title, value, icon: Icon, color }) => (
//                 <div
//                   key={title}
//                   className={`p-4 rounded-xl shadow-md flex items-center gap-4 transition ${theme === "dark" ? `bg-${color}-900 hover:bg-${color}-800` : `bg-${color}-100 hover:bg-${color}-200`}`}
//                 >
//                   <Icon className={`w-8 h-8 text-${color}-400`} />
//                   <div>
//                     <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{title}</p>
//                     <p className="text-xl font-semibold">{value}</p>
//                   </div>
//                 </div>
//               ))}
//             </section>

//             <section className={`rounded-xl p-6 shadow-lg mb-8 ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//               <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
//                 <div className="relative w-32 h-32">
//                   <img
//                     src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
//                     alt="User"
//                     className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
//                   />
//                   {isEditing && (
//                     <label
//                       htmlFor="profile-pic-upload"
//                       className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
//                     >
//                       <Camera className="w-5 h-5" />
//                       <input
//                         type="file"
//                         id="profile-pic-upload"
//                         className="hidden"
//                         onChange={handleFileUpload}
//                         accept="image/*"
//                       />
//                     </label>
//                   )}
//                 </div>
//                 <div className="flex-1 space-y-4">
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       name="name"
//                       value={tempProfile.name || ""}
//                       onChange={handleInputChange}
//                       className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"}`}
//                       placeholder="User Name"
//                     />
//                   ) : (
//                     <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
//                   )}
//                   <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{profile.email || "No email provided"}</p>
//                   <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>Role: {profile.user_type}</p>
//                   <div>
//                     {isEditing ? (
//                       <div className="flex gap-4">
//                         <button
//                           onClick={handleSaveProfile}
//                           className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                         >
//                           Save
//                         </button>
//                         <button
//                           onClick={handleEditToggle}
//                           className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         onClick={handleEditToggle}
//                         className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
//                       >
//                         <span>✏️</span> Edit Profile
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                 <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
//               </h3>
//               <ul className="space-y-3 max-h-64 overflow-y-auto">
//                 {activities.map((activity, index) => (
//                   <li key={index} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                     <p>{activity.description}</p>
//                     <p className="text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
//                   </li>
//                 ))}
//               </ul>
//             </section>
//           </>
//         );
//       case "notifications":
//         return (
//           <NotificationSystem
//             notifications={notifications}
//             onMarkAsRead={markNotificationAsRead}
//             onClearAll={clearAllNotifications}
//             theme={theme}
//           />
//         );
//       case "login-history":
//         return <LoginHistory history={loginHistory} theme={theme} />;
//       case "support":
//         return <SupportDocumentation theme={theme} />;
//       case "roles":
//         return <RolePermissions theme={theme} />;
//       case "security":
//         return <PasswordSecurity user={profile} theme={theme} />;
//       default:
//         return <div>Select a tab</div>;
//     }
//   };

//   return (
//     <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
//       <main className="max-w-7xl mx-auto space-y-8">
//         {error && (
//           <div className="bg-red-500 text-white p-4 rounded-lg text-center whitespace-pre-wrap">
//             {error}
//           </div>
//         )}
//         <header className="flex justify-between items-center">
//           <div>
//             <h1 className={`text-5xl font-extrabold tracking-tight ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500" : "text-indigo-600"}`}>
//               Admin Hub
//             </h1>
//             <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//               Welcome, {profile.name || "User"}
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             <NotificationSystem
//               notifications={notifications}
//               onMarkAsRead={markNotificationAsRead}
//               isWidget={true}
//               theme={theme}
//             />
//             <LanguageRegionSelector 
//               language="en" 
//               region="US" 
//               onChange={(lang, reg) => console.log(lang, reg)} 
//               theme={theme}
//             />
//           </div>
//         </header>

//         <div className="flex flex-col md:flex-row gap-8">
//           <div className={`w-full md:w-64 rounded-xl p-4 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//             <nav className="space-y-2">
//               {[
//                 { id: "dashboard", label: "Dashboard", icon: Gauge },
//                 { id: "notifications", label: "Notifications", icon: Bell },
//                 { id: "login-history", label: "Login History", icon: Activity },
//                 { id: "support", label: "Support & Docs", icon: BookOpen },
//                 { id: "roles", label: "Roles & Permissions", icon: UserCheck },
//                 { id: "security", label: "Password & Security", icon: Shield },
//               ].map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
//                     activeTab === item.id
//                       ? "bg-indigo-600 text-white"
//                       : theme === "dark"
//                         ? "hover:bg-gray-600"
//                         : "hover:bg-gray-200"
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   <span>{item.label}</span>
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="flex-1">{renderTabContent()}</div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminProfile;






// // src/pages/AdminProfile.jsx
// // Redesigned: Interlink Control Center

// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   lazy,
//   useCallback,
//   Suspense,
// } from "react";
// import {
//   LayoutDashboard,
//   Users,
//   DollarSign,
//   Camera,
//   Server,
//   BellRing,
//   ShieldCheck,
//   BookOpen,
//   UserCog,
//   CalendarClock,
//   Menu,
//   X,
//   User,
//   Activity,
//   Edit3,
//   Save,
//   XCircle,
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import { toast } from "react-hot-toast";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import NotificationSystem from "../../components/AdminProfile/NotificationSystem";
// import LanguageRegionSelector from "../../components/AdminProfile/LanguageRegionSelector";
// import ProfileEditor from "../../components/AdminProfile/ProfileEditor";
// const LoginHistory = lazy(() => import("../../components/AdminProfile/LoginHistory"));
// const SupportDocumentation = lazy(() => import("../../components/AdminProfile/SupportDocumentation"));
// const RolePermissions = lazy(() => import("../../components/AdminProfile/RolePermissions"));
// const PasswordSecurity = lazy(() => import("../../components/AdminProfile/PasswordSecurity"));
// import avatar from "../../assets/avatar.png";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// /* Loading */
// const LoadingFallback = () => (
//   <div className="flex justify-center items-center h-56">
//     <FaSpinner className="animate-spin text-4xl text-indigo-500" />
//   </div>
// );

// /* Utility: KES formatter */
// const formatKES = (value) =>
//   new Intl.NumberFormat("en-KE", {
//     style: "currency",
//     currency: "KES",
//     maximumFractionDigits: 0,
//   }).format(Math.round(Number(value) || 0));

// /* -----------------------
//   Main component
// ------------------------*/
// const AdminProfile = ({ theme = "light" }) => {
//   const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();

//   const [activeTab, setActiveTab] = useState("dashboard");
//   const [profile, setProfile] = useState({
//     name: userDetails?.name || "",
//     email: userDetails?.email || "",
//     profile_pic: userDetails?.profile_pic || "",
//     user_type: userDetails?.user_type || "admin",
//     is_2fa_enabled: userDetails?.is_2fa_enabled || false,
//   });

//   const [stats, setStats] = useState({
//     clients: 0,
//     active_clients: 0,
//     revenue: 0,
//     uptime: "0%",
//     total_subscriptions: 0,
//     successful_transactions: 0,
//   });

//   const [notifications, setNotifications] = useState([]);
//   const [loginHistory, setLoginHistory] = useState([]);
//   const [activities, setActivities] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempProfile, setTempProfile] = useState({});
//   const [previewImage, setPreviewImage] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   /* Fetch profile + stats */
//   const fetchData = useCallback(async () => {
//     if (!isAuthenticated) return;
//     try {
//       setIsLoading(true);
//       const { data } = await api.get("/api/account/profile/");

//       const profileData = data?.profile || {};
//       const statsData = data?.stats || {};

//       setProfile({
//         name: profileData.name ?? userDetails?.name ?? "",
//         email: profileData.email ?? userDetails?.email ?? "",
//         profile_pic: profileData.profile_pic ?? userDetails?.profile_pic ?? "",
//         user_type: profileData.user_type ?? userDetails?.user_type ?? "admin",
//         is_2fa_enabled: profileData.is_2fa_enabled ?? false,
//       });

//       setStats({
//         clients: statsData.clients ?? 0,
//         active_clients: statsData.active_clients ?? 0,
//         revenue: statsData.revenue ?? 0,
//         uptime: statsData.uptime ?? "0%",
//         total_subscriptions: statsData.total_subscriptions ?? 0,
//         successful_transactions: statsData.successful_transactions ?? 0,
//       });

//       setActivities(data?.activities || []);

//       updateUserDetails && updateUserDetails(profileData);

//       const notifRes = await api.get("/api/account/notifications/");
//       setNotifications(notifRes.data?.results || []);

//       const historyRes = await api.get("/api/account/login-history/");
//       setLoginHistory(historyRes.data?.results || []);
//     } catch (err) {
//       toast.error("Failed to load data");
//       setError("Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [isAuthenticated, updateUserDetails, userDetails]);

//   useEffect(() => {
//     if (!authLoading && isAuthenticated) fetchData();
//   }, [authLoading, isAuthenticated, fetchData]);

//   /* Profile editing functions */
//   const handleEditToggle = () => {
//     setIsEditing(!isEditing);
//     if (!isEditing) {
//       setTempProfile({ ...profile });
//       setPreviewImage(null);
//     }
//   };

//   const handleSaveProfile = async (formData) => {
//     if (!isAuthenticated) {
//       setError("Please log in to update your profile.");
//       return;
//     }

//     try {
//       const updateData = {
//         name: formData.fullName || profile.name,
//         email: formData.email || profile.email,
//         user_type: formData.role || profile.user_type,
//       };

//       const response = await api.put("/api/account/profile/", updateData);

//       setProfile(response.data);
//       setPreviewImage(null);
//       updateUserDetails(response.data);
//       setIsEditing(false);
//       setError(null);
//       toast.success("Profile updated successfully");
      
//       // Refresh data after update
//       fetchData();
//     } catch (err) {
//       setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
//       toast.error("Failed to update profile");
//     }
//   };

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         setError("Please upload an image file.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB.");
//         return;
//       }
//       setTempProfile((prev) => ({ ...prev, profile_pic: file }));
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const markNotificationAsRead = async (id) => {
//     try {
//       await api.patch(`/api/account/notifications/${id}/`);
//       setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to mark notification as read");
//     }
//   };

//   const clearAllNotifications = async () => {
//     try {
//       await api.delete("/api/account/notifications/");
//       setNotifications([]);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to clear notifications");
//     }
//   };

//   /* Derived chart data */
//   const memoizedStatsData = useMemo(
//     () => [
//       { name: "Clients", value: stats.clients },
//       { name: "Active", value: stats.active_clients },
//       { name: "Subscriptions", value: stats.total_subscriptions },
//     ],
//     [stats]
//   );

//   const chartColors = ["#6366f1", "#10b981", "#f59e0b"];

//   /* Loading & guards */
//   if (authLoading || isLoading) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
//         <FaSpinner className="animate-spin text-5xl text-indigo-500" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex justify-center items-center">
//         <p className="text-red-500">Please log in to access Interlink Control Center.</p>
//       </div>
//     );
//   }

//   /* Sidebar items */
//   const sidebarItems = [
//     { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
//     { id: "profile", label: "Profile", icon: User },
//     { id: "notifications", label: "Notifications", icon: BellRing },
//     { id: "login-history", label: "Login History", icon: CalendarClock },
//     { id: "support", label: "Support & Docs", icon: BookOpen },
//     { id: "roles", label: "Roles & Permissions", icon: UserCog },
//     { id: "security", label: "Password & Security", icon: ShieldCheck },
//   ];

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "dashboard":
//         return (
//           <motion.div
//             key="dashboard"
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 6 }}
//             transition={{ duration: 0.35 }}
//             className="space-y-8"
//           >
//             {/* Stats */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {[
//                 {
//                   title: "Total Clients",
//                   value: stats.clients,
//                   desc: "All registered clients",
//                   icon: Users,
//                   color: "from-indigo-500 to-indigo-600",
//                 },
//                 {
//                   title: "Active Clients",
//                   value: stats.active_clients,
//                   desc: "Currently online",
//                   icon: Server,
//                   color: "from-green-500 to-green-600",
//                 },
//                 {
//                   title: "Transactions",
//                   value: stats.successful_transactions,
//                   desc: "Successful payments",
//                   icon: BellRing,
//                   color: "from-yellow-500 to-yellow-600",
//                 },
//                 {
//                   title: "Revenue",
//                   value: formatKES(stats.revenue),
//                   desc: `${stats.total_subscriptions} subscriptions`,
//                   icon: DollarSign,
//                   color: "from-emerald-500 to-emerald-600",
//                 },
//               ].map((card, idx) => (
//                 <div
//                   key={idx}
//                   className="p-6 rounded-xl shadow-md bg-white/80 dark:bg-gray-800/60"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-500">{card.title}</p>
//                       <h3 className="text-2xl font-bold">{card.value}</h3>
//                       <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
//                     </div>
//                     <div
//                       className={`p-3 rounded-full bg-gradient-to-r ${card.color} text-white shadow`}
//                     >
//                       <card.icon className="w-6 h-6" />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Charts - Expanded to full width since profile card was removed */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="p-1 rounded-xl shadow-md bg-white/80 dark:bg-gray-800/60">
//                 <h3 className="text-sm font-semibold mb-4">Client Statistics</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={memoizedStatsData}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="value" radius={[6, 6, 0, 0]}>
//                       {memoizedStatsData.map((entry, idx) => (
//                         <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="p-6 rounded-xl shadow-md bg-white/80 dark:bg-gray-800/60">
//                 <h3 className="text-sm font-semibold mb-4">Subscription Distribution</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={memoizedStatsData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       paddingAngle={3}
//                       dataKey="value"
//                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                     >
//                       {memoizedStatsData.map((entry, idx) => (
//                         <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </motion.div>
//         );
//       case "profile":
//         return (
//           <motion.div
//             key="profile"
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 6 }}
//             transition={{ duration: 0.35 }}
//             className="space-y-6"
//           >
//             {isEditing ? (
//               <ProfileEditor
//                 profile={{
//                   fullName: profile.name,
//                   email: profile.email,
//                   role: profile.user_type,
//                   profilePicture: profile.profile_pic || avatar,
//                 }}
//                 onSave={handleSaveProfile}
//                 onCancel={handleEditToggle}
//               />
//             ) : (
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Profile Card */}
//                 <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60" : "bg-white/80"} lg:col-span-1`}>
//                   <div className="flex flex-col items-center">
//                     <div className="relative w-32 h-32 mb-4">
//                       <img
//                         src={profile.profile_pic || avatar}
//                         alt="User"
//                         className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
//                       />
//                     </div>
//                     <h2 className="text-2xl font-bold text-center">{profile.name || "User"}</h2>
//                     <p className="text-gray-500 dark:text-gray-300 text-center mt-1">{profile.email || "No email provided"}</p>
//                     <div className="mt-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-800 dark:text-indigo-100">
//                       {profile.user_type}
//                     </div>
                    
//                     <button
//                       onClick={handleEditToggle}
//                       className="mt-6 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-white flex items-center gap-2"
//                     >
//                       <Edit3 size={16} />
//                       Edit Profile
//                     </button>
//                   </div>
//                 </div>

//                 {/* Recent Activities */}
//                 <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60" : "bg-white/80"} lg:col-span-2`}>
//                   <div className="flex items-center gap-2 mb-6">
//                     <Activity className="text-indigo-500" />
//                     <h3 className="text-xl font-semibold">Recent Activities</h3>
//                   </div>
                  
//                   <div className="space-y-4 max-h-96 overflow-y-auto">
//                     {activities.length > 0 ? (
//                       activities.map((activity, index) => (
//                         <div 
//                           key={index} 
//                           className={`p-4 rounded-lg border-l-4 border-indigo-500 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
//                         >
//                           <p className="font-medium">{activity.description}</p>
//                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                             {new Date(activity.timestamp).toLocaleString()}
//                           </p>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                         <Activity size={48} className="mx-auto mb-4 opacity-50" />
//                         <p>No recent activities</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         );
//       case "notifications":
//         return (
//           <motion.div
//             key="notifications"
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 6 }}
//             transition={{ duration: 0.35 }}
//           >
//             <NotificationSystem
//               notifications={notifications}
//               onMarkAsRead={markNotificationAsRead}
//               onClearAll={clearAllNotifications}
//               theme={theme}
//             />
//           </motion.div>
//         );
//       case "login-history":
//         return (
//           <Suspense fallback={<LoadingFallback />}>
//             <motion.div
//               key="login-history"
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 6 }}
//               transition={{ duration: 0.35 }}
//             >
//               <LoginHistory history={loginHistory} theme={theme} />
//             </motion.div>
//           </Suspense>
//         );
//       case "support":
//         return (
//           <Suspense fallback={<LoadingFallback />}>
//             <motion.div
//               key="support"
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 6 }}
//               transition={{ duration: 0.35 }}
//             >
//               <SupportDocumentation theme={theme} />
//             </motion.div>
//           </Suspense>
//         );
//       case "roles":
//         return (
//           <Suspense fallback={<LoadingFallback />}>
//             <motion.div
//               key="roles"
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 6 }}
//               transition={{ duration: 0.35 }}
//             >
//               <RolePermissions theme={theme} />
//             </motion.div>
//           </Suspense>
//         );
//       case "security":
//         return (
//           <Suspense fallback={<LoadingFallback />}>
//             <motion.div
//               key="security"
//               initial={{ opacity: 0, y: 6 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 6 }}
//               transition={{ duration: 0.35 }}
//             >
//               <PasswordSecurity user={profile} theme={theme} />
//             </motion.div>
//           </Suspense>
//         );
//       default:
//         return <div>Select a tab</div>;
//     }
//   };

//   return (
//     <div
//       className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white"
//           : "bg-gradient-to-br from-white to-indigo-50 text-gray-800"
//       }`}
//     >
//       <main className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <header className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6">
//           <div>
//             <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//               Interactive Control Center
//             </h1>
//             <p className="mt-2 text-lg text-gray-500 dark:text-gray-300">
//               Welcome back, {profile.name || "Administrator"}
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             <NotificationSystem
//               notifications={notifications}
//               onMarkAsRead={markNotificationAsRead}
//               isWidget
//               theme={theme}
//             />
//             <LanguageRegionSelector language="en" region="KE" theme={theme} />
//           </div>
//         </header>

//         <div className="flex flex-col md:flex-row gap-6">
//           {/* Sidebar */}
//           <motion.aside
//             className={`w-64 p-5 rounded-xl shadow-xl ${
//               theme === "dark"
//                 ? "bg-gray-800/80 backdrop-blur-md"
//                 : "bg-white/80 backdrop-blur-md"
//             }`}
//           >
//             <nav className="space-y-2">
//               {sidebarItems.map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center gap-3 p-3 rounded-lg transition font-medium ${
//                     activeTab === item.id
//                       ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
//                       : "hover:bg-indigo-100 dark:hover:bg-gray-700"
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5" />
//                   {item.label}
//                 </button>
//               ))}
//             </nav>
//           </motion.aside>

//           {/* Main Content */}
//           <div className="flex-1">
//             <AnimatePresence mode="wait">
//               {renderTabContent()}
//             </AnimatePresence>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminProfile;








// src/components/AdminProfile/AdminProfile.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  lazy,
  useCallback,
  Suspense,
} from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Camera,
  Server,
  BellRing,
  ShieldCheck,
  BookOpen,
  UserCog,
  CalendarClock,
  Menu,
  X,
  User,
  Activity,
  Edit3,
  Save,
  XCircle,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import NotificationSystem from "../../components/AdminProfile/NotificationSystem";
import LanguageRegionSelector from "../../components/AdminProfile/LanguageRegionSelector";
import ProfileEditor from "../../components/AdminProfile/ProfileEditor";
const LoginHistory = lazy(() => import("../../components/AdminProfile/LoginHistory"));
const SupportDocumentation = lazy(() => import("../../components/AdminProfile/SupportDocumentation"));
const RolePermissions = lazy(() => import("../../components/AdminProfile/RolePermissions"));
const PasswordSecurity = lazy(() => import("../../components/AdminProfile/PasswordSecurity"));
import avatar from "../../assets/avatar.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* Loading */
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-56">
    <FaSpinner className="animate-spin text-4xl text-indigo-500" />
  </div>
);

/* Utility: KES formatter */
const formatKES = (value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));

/* -----------------------
  Main component
------------------------*/
const AdminProfile = ({ theme = "light" }) => {
  const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState({
    name: userDetails?.name || "",
    email: userDetails?.email || "",
    profile_pic: userDetails?.profile_pic || "",
    user_type: userDetails?.user_type || "admin",
    is_2fa_enabled: userDetails?.is_2fa_enabled || false,
  });

  const [stats, setStats] = useState({
    clients: 0,
    active_clients: 0,
    revenue: 0,
    uptime: "0%",
    total_subscriptions: 0,
    successful_transactions: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* Fetch profile + stats */
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/account/profile/");

      const profileData = data?.profile || {};
      const statsData = data?.stats || {};

      setProfile({
        name: profileData.name ?? userDetails?.name ?? "",
        email: profileData.email ?? userDetails?.email ?? "",
        profile_pic: profileData.profile_pic ?? userDetails?.profile_pic ?? "",
        user_type: profileData.user_type ?? userDetails?.user_type ?? "admin",
        is_2fa_enabled: profileData.is_2fa_enabled ?? false,
      });

      setStats({
        clients: statsData.clients ?? 0,
        active_clients: statsData.active_clients ?? 0,
        revenue: statsData.revenue ?? 0,
        uptime: statsData.uptime ?? "0%",
        total_subscriptions: statsData.total_subscriptions ?? 0,
        successful_transactions: statsData.successful_transactions ?? 0,
      });

      setActivities(data?.activities || []);

      updateUserDetails && updateUserDetails(profileData);

      const notifRes = await api.get("/api/account/notifications/");
      setNotifications(notifRes.data?.results || []);

      const historyRes = await api.get("/api/account/login-history/");
      setLoginHistory(historyRes.data?.results || []);
    } catch (err) {
      toast.error("Failed to load data");
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, updateUserDetails, userDetails]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchData();
  }, [authLoading, isAuthenticated, fetchData]);

  /* Profile editing functions */
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setTempProfile({ ...profile });
      setPreviewImage(null);
    }
  };

  const handleSaveProfile = async (formData) => {
    if (!isAuthenticated) {
      setError("Please log in to update your profile.");
      toast.error("Please log in to update your profile.");
      return;
    }

    try {
      const updateData = new FormData();
      updateData.append("name", formData.fullName || profile.name);
      updateData.append("email", formData.email || profile.email);
      updateData.append("user_type", formData.role || profile.user_type);
      if (formData.profilePicture) {
        updateData.append("profile_pic", formData.profilePicture);
      }

      const response = await api.put("/api/account/profile/", updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(response.data);
      setPreviewImage(null);
      updateUserDetails(response.data);
      setIsEditing(false);
      setError(null);
      toast.success("Profile updated successfully");
      
      // Refresh data after update
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
      toast.error("Failed to update profile");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        toast.error("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        toast.error("File size must be less than 5MB.");
        return;
      }
      setTempProfile((prev) => ({ ...prev, profile_pic: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.patch(`/api/account/notifications/${id}/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark notification as read");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/api/account/notifications/");
      setNotifications([]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to clear notifications");
    }
  };

  /* Derived chart data */
  const memoizedStatsData = useMemo(
    () => [
      { name: "Clients", value: stats.clients },
      { name: "Active", value: stats.active_clients },
      { name: "Subscriptions", value: stats.total_subscriptions },
    ],
    [stats]
  );

  const chartColors = ["#6366f1", "#10b981", "#f59e0b"];

  /* Loading & guards */
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-5xl text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">Please log in to access Interlink Control Center.</p>
      </div>
    );
  }

  /* Sidebar items */
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: BellRing },
    { id: "login-history", label: "Login History", icon: CalendarClock },
    { id: "support", label: "Support & Docs", icon: BookOpen },
    { id: "roles", label: "Roles & Permissions", icon: UserCog },
    { id: "security", label: "Password & Security", icon: ShieldCheck },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total Clients",
                  value: stats.clients,
                  desc: "All registered clients",
                  icon: Users,
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  title: "Active Clients",
                  value: stats.active_clients,
                  desc: "Currently online",
                  icon: Server,
                  color: "from-green-500 to-green-600",
                },
                {
                  title: "Transactions",
                  value: stats.successful_transactions,
                  desc: "Successful payments",
                  icon: BellRing,
                  color: "from-yellow-500 to-yellow-600",
                },
                {
                  title: "Revenue",
                  value: formatKES(stats.revenue),
                  desc: `${stats.total_subscriptions} subscriptions`,
                  icon: DollarSign,
                  color: "from-emerald-500 to-emerald-600",
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl shadow-md bg-white/80 dark:bg-gray-800/60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{card.title}</p>
                      <h3 className="text-2xl font-bold">{card.value}</h3>
                      <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
                    </div>
                    <div
                      className={`p-3 rounded-full bg-gradient-to-r ${card.color} text-white shadow`}
                    >
                      <card.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-1 rounded-xl shadow-md bg-white/80 dark:bg-gray-800/60">
                <h3 className="text-sm font-semibold mb-4">Client Statistics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memoizedStatsData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {memoizedStatsData.map((entry, idx) => (
                        <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-6 rounded-xl shadow-md bg-white/80 dark:bg-gray-800/60">
                <h3 className="text-sm font-semibold mb-4">Subscription Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={memoizedStatsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {memoizedStatsData.map((entry, idx) => (
                        <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        );
      case "profile":
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {isEditing ? (
              <ProfileEditor
                profile={{
                  fullName: profile.name,
                  email: profile.email,
                  role: profile.user_type,
                  profilePicture: profile.profile_pic || avatar,
                }}
                onSave={handleSaveProfile}
                onCancel={handleEditToggle}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60" : "bg-white/80"} lg:col-span-1`}>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <img
                        src={profile.profile_pic || avatar}
                        alt="User"
                        className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-center">{profile.name || "User"}</h2>
                    <p className="text-gray-500 dark:text-gray-300 text-center mt-1">{profile.email || "No email provided"}</p>
                    <div className="mt-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-800 dark:text-indigo-100">
                      {profile.user_type}
                    </div>
                    
                    <button
                      onClick={handleEditToggle}
                      className="mt-6 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-white flex items-center gap-2"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60" : "bg-white/80"} lg:col-span-2`}>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-indigo-500" />
                    <h3 className="text-xl font-semibold">Recent Activities</h3>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 border-indigo-500 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
                        >
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Activity size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No recent activities</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      case "notifications":
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
          >
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
              onClearAll={clearAllNotifications}
              theme={theme}
            />
          </motion.div>
        );
      case "login-history":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              key="login-history"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35 }}
            >
              <LoginHistory history={loginHistory} theme={theme} />
            </motion.div>
          </Suspense>
        );
      case "support":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
            >
              <SupportDocumentation theme={theme} />
            </motion.div>
          </Suspense>
        );
      case "roles":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35 }}
            >
              <RolePermissions theme={theme} />
            </motion.div>
          </Suspense>
        );
      case "security":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.35 }}
            >
              <PasswordSecurity user={profile} theme={theme} />
            </motion.div>
          </Suspense>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white"
          : "bg-gradient-to-br from-white to-indigo-50 text-gray-800"
      }`}
    >
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Interactive Control Center
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-300">
              Welcome back, {profile.name || "Administrator"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markNotificationAsRead}
              isWidget
              theme={theme}
            />
            <LanguageRegionSelector language="en" region="KE" theme={theme} />
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <motion.aside
            className={`w-64 p-5 rounded-xl shadow-xl ${
              theme === "dark"
                ? "bg-gray-800/80 backdrop-blur-md"
                : "bg-white/80 backdrop-blur-md"
            }`}
          >
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition font-medium ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                      : "hover:bg-indigo-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;