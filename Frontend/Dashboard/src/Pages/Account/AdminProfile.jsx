// import React, { useState, useEffect, useCallback } from "react";
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity } from "lucide-react";
// import api from "../../../api";
// import { useAuth } from "../../context/AuthContext";
// import avatar from "../../assets/avatar.png";

// const AdminProfile = ({ theme }) => {
//     const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();
//     const [profile, setProfile] = useState({
//         name: userDetails.name || "",
//         email: userDetails.email || "",
//         profilePic: userDetails.profilePic || "",
//     });
//     const [stats, setStats] = useState({
//         clients: 0,
//         activeClients: 0,
//         revenue: 0,
//         uptime: "0%",
//     });
//     const [subscriptions, setSubscriptions] = useState([]);
//     const [payments, setPayments] = useState([]);
//     const [activities, setActivities] = useState([{ description: "No activities yet" }]);
//     const [network, setNetwork] = useState({
//         latency: "0ms",
//         bandwidth: "0%",
//     });
//     const [routers, setRouters] = useState([{ name: "No routers", status: "Offline", color: "red" }]);
//     const [isEditing, setIsEditing] = useState(false);
//     const [tempProfile, setTempProfile] = useState({});
//     const [previewImage, setPreviewImage] = useState(null);
//     const [error, setError] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             if (!isAuthenticated) {
//                 console.log("Not authenticated, skipping fetch");
//                 setError("Please log in to view your profile.");
//                 setIsLoading(false);
//                 return;
//             }

//             try {
//                 console.log("Fetching profile data...");
//                 setIsLoading(true);
//                 const response = await Promise.race([
//                     api.get("/api/account/profile/"),
//                     new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 10000))
//                 ]);
//                 console.log("API response received:", response.data);

//                 const profileData = response.data.profile || {};
//                 const updatedProfile = {
//                     name: profileData.name || userDetails.name || "",
//                     email: profileData.email || userDetails.email || "",
//                     profilePic: profileData.profile_pic || userDetails.profilePic || "",
//                 };

//                 // Only update userDetails if the data has changed
//                 if (
//                     updatedProfile.name !== userDetails.name ||
//                     updatedProfile.email !== userDetails.email ||
//                     updatedProfile.profilePic !== userDetails.profilePic
//                 ) {
//                     updateUserDetails(updatedProfile);
//                 }

//                 setProfile(updatedProfile);
//                 setStats(response.data.stats || stats);
//                 setSubscriptions(response.data.subscriptions || []);
//                 setPayments(response.data.payments || []);
//                 setActivities(response.data.activities || activities);
//                 setNetwork(response.data.network || network);
//                 setRouters(response.data.routers || routers);

//                 setError(null);
//             } catch (err) {
//                 console.error("Fetch error:", err);
//                 setError(err.response?.data?.error || `Failed to load profile: ${err.message}`);
//             } finally {
//                 console.log("Fetch complete, setting isLoading to false");
//                 setIsLoading(false);
//             }
//         };

//         console.log("useEffect triggered, authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
//         if (!authLoading && isAuthenticated) {
//             fetchData();
//         } else {
//             console.log("Waiting for AuthContext to finish loading...");
//         }
//     }, [isAuthenticated, authLoading]); // Removed userDetails and updateUserDetails from dependencies

//     const handleFileUpload = useCallback((e) => {
//         const file = e.target.files[0];
//         if (file) {
//             if (!file.type.startsWith("image/")) {
//                 setError("Please upload an image file.");
//                 return;
//             }
//             if (file.size > 5 * 1024 * 1024) {
//                 setError("File size must be less than 5MB.");
//                 return;
//             }
//             setTempProfile((prev) => ({ ...prev, profilePic: file }));
//             setPreviewImage(URL.createObjectURL(file));
//         }
//     }, []);

//     const handleEditToggle = () => {
//         setIsEditing(!isEditing);
//         if (!isEditing) {
//             setTempProfile({ ...profile });
//             setPreviewImage(null);
//         }
//     };

//     const handleSaveProfile = async () => {
//         if (!isAuthenticated) {
//             setError("Please log in to update your profile.");
//             return;
//         }

//         try {
//             const formData = new FormData();
//             formData.append("name", tempProfile.name || profile.name);
//             if (tempProfile.profilePic instanceof File) {
//                 formData.append("profile_pic", tempProfile.profilePic);
//             }

//             const response = await api.put("/api/account/profile/", formData, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });

//             const updatedProfile = {
//                 name: response.data.name || "",
//                 email: response.data.email || "",
//                 profilePic: response.data.profile_pic || "",
//             };
//             setProfile(updatedProfile);
//             setPreviewImage(null);
//             updateUserDetails(updatedProfile);
//             setIsEditing(false);
//             setError(null);
//         } catch (err) {
//             setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setTempProfile((prev) => ({ ...prev, [name]: value }));
//     };

//     console.log("Rendering AdminProfile, isLoading:", isLoading, "authLoading:", authLoading, "isAuthenticated:", isAuthenticated);

//     if (authLoading || isLoading) {
//         return (
//             <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//                 <div>Loading...</div>
//             </div>
//         );
//     }

//     if (!isAuthenticated) {
//         return (
//             <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//                 <p className="text-center text-red-400">Please log in to access the admin dashboard.</p>
//             </div>
//         );
//     }

//     return (
//         <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
//             <main className="max-w-7xl mx-auto space-y-8">
//                 {error && (
//                     <div className="bg-red-500 text-white p-4 rounded-lg text-center whitespace-pre-wrap">
//                         {error}
//                     </div>
//                 )}
//                 <header className="text-center">
//                     <h1 className={`text-5xl font-extrabold tracking-tight ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500" : "text-indigo-600"}`}>
//                         Admin Hub
//                     </h1>
//                     <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Manage your Starlink reselling empire</p>
//                 </header>

//                 <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//                     <div className="flex flex-col md:flex-row items-center gap-6">
//                         <div className="relative w-32 h-32">
//                             <img
//                                 src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
//                                 alt="Admin"
//                                 className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
//                             />
//                             {isEditing && (
//                                 <label
//                                     htmlFor="profile-pic-upload"
//                                     className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
//                                 >
//                                     <Camera className="w-5 h-5" />
//                                     <input
//                                         type="file"
//                                         id="profile-pic-upload"
//                                         className="hidden"
//                                         onChange={handleFileUpload}
//                                         accept="image/*"
//                                     />
//                                 </label>
//                             )}
//                         </div>
//                         <div className="flex-1 space-y-4">
//                             {isEditing ? (
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={tempProfile.name || ""}
//                                     onChange={handleInputChange}
//                                     className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"}`}
//                                     placeholder="Admin Name"
//                                 />
//                             ) : (
//                                 <h2 className="text-2xl font-bold">{profile.name || "Admin"}</h2>
//                             )}
//                             <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{profile.email || "No email provided"}</p>
//                             <div>
//                                 {isEditing ? (
//                                     <div className="flex gap-4">
//                                         <button
//                                             onClick={handleSaveProfile}
//                                             className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
//                                         >
//                                             Save
//                                         </button>
//                                         <button
//                                             onClick={handleEditToggle}
//                                             className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
//                                         >
//                                             Cancel
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <button
//                                         onClick={handleEditToggle}
//                                         className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition lex items-center gap-2"
//                                     >
//                                          <span>✏️</span> Edit Profile
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {[
//                         { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//                         { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//                         { title: "Daily Revenue", value: `KES ${stats.revenue}`, icon: DollarSign, color: "yellow" },
//                         { title: "Uptime", value: stats.uptime, icon: Gauge, color: "purple" },
//                     ].map(({ title, value, icon: Icon, color }) => (
//                         <div
//                             key={title}
//                             className={`p-4 rounded-xl shadow-md flex items-center gap-4 transition ${theme === "dark" ? `bg-${color}-900 hover:bg-${color}-800` : `bg-${color}-100 hover:bg-${color}-200`}`}
//                         >
//                             <Icon className={`w-8 h-8 text-${color}-400`} />
//                             <div>
//                                 <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{title}</p>
//                                 <p className="text-xl font-semibold">{value}</p>
//                             </div>
//                         </div>
//                     ))}
//                 </section>

//                 <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//                         <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <Wifi className="w-6 h-6 text-green-400" /> Network Status
//                         </h3>
//                         <div className="space-y-4">
//                             <div className="flex justify-between items-center">
//                                 <p>Latency</p>
//                                 <p className="text-green-400">{network.latency}</p>
//                             </div>
//                             <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                                 <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
//                             </div>
//                             <div className="flex justify-between items-center">
//                                 <p>Bandwidth Usage</p>
//                                 <p className="text-yellow-400">{network.bandwidth}</p>
//                             </div>
//                             <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                                 <div
//                                     className="bg-yellow-500 h-2 rounded-full"
//                                     style={{ width: network.bandwidth || "0%" }}
//                                 ></div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//                         <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//                             <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
//                         </h3>
//                         <ul className="space-y-3 max-h-64 overflow-y-auto">
//                             {activities.map((activity, index) => (
//                                 <li key={index} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                                     {activity.description}
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </section>

//                 <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//                     <h3 className="text-xl font-semibold mb-4">Recent Subscriptions</h3>
//                     <div className="grid grid-cols-1 gap-4">
//                         {subscriptions.length > 0 ? (
//                             subscriptions.map((sub) => (
//                                 <div key={sub.id} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                                     <p><strong>Client:</strong> {sub.client.name}</p>
//                                     <p><strong>Email:</strong> {sub.client.email}</p>
//                                     <p><strong>Status:</strong> {sub.is_active ? "Active" : "Inactive"}</p>
//                                     <p><strong>Start:</strong> {new Date(sub.start_date).toLocaleDateString()}</p>
//                                     <p><strong>End:</strong> {new Date(sub.end_date).toLocaleDateString()}</p>
//                                 </div>
//                             ))
//                         ) : (
//                             <p>No recent subscriptions</p>
//                         )}
//                     </div>
//                 </section>

//                 <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//                     <h3 className="text-xl font-semibold mb-4">Recent Payments</h3>
//                     <div className="grid grid-cols-1 gap-4">
//                         {payments.length > 0 ? (
//                             payments.map((payment) => (
//                                 <div key={payment.id} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                                     <p><strong>Client:</strong> {payment.client.name}</p>
//                                     <p><strong>Email:</strong> {payment.client.email}</p>
//                                     <p><strong>Amount:</strong> KES {payment.amount}</p>
//                                     <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
//                                 </div>
//                             ))
//                         ) : (
//                             <p>No recent payments</p>
//                         )}
//                     </div>
//                 </section>

//                 <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//                     <h3 className="text-xl font-semibold mb-4">Router Overview</h3>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {routers.map(({ name, status, color }) => (
//                             <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                                 <span>{name}</span>
//                                 <span className={`text-${color}-400 font-medium`}>{status}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// };

// export default AdminProfile;






// import React, { useState, useEffect, useCallback } from "react";
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity } from "lucide-react";
// import api from "../../../api";
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
//   });
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [activities, setActivities] = useState([{ description: "No activities yet" }]);
//   const [network, setNetwork] = useState({
//     latency: "0ms",
//     bandwidth: "0%",
//   });
//   const [routers, setRouters] = useState([{ name: "No routers", status: "Offline", color: "red" }]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempProfile, setTempProfile] = useState({});
//   const [previewImage, setPreviewImage] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!isAuthenticated) {
//         console.log("Not authenticated, skipping fetch");
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
//         console.error("Fetch error:", err);
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

//   const handleFileUpload = useCallback((e) => {
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
//   }, []);

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
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <div>Loading...</div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <p className="text-center text-red-400">Please log in to access the admin dashboard.</p>
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
//             Welcome, {profile.name || "Admin"}
//           </p>
//         </header>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <div className="flex flex-col md:flex-row items-center gap-6">
//             <div className="relative w-32 h-32">
//               <img
//                 src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
//                 alt="Admin"
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
//                   placeholder="Admin Name"
//                 />
//               ) : (
//                 <h2 className="text-2xl font-bold">{profile.name || "Admin"}</h2>
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

//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//             { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//             { title: "Daily Revenue", value: `KES ${stats.revenue}`, icon: DollarSign, color: "yellow" },
//             { title: "Uptime", value: stats.uptime, icon: Gauge, color: "purple" },
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
//                 <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
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
//                   {activity.description}
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
//                   <p><strong>Client:</strong> {sub.client.name}</p>
//                   <p><strong>Email:</strong> {sub.client.email}</p>
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
//                   <p><strong>Client:</strong> {payment.client.name}</p>
//                   <p><strong>Email:</strong> {payment.client.email}</p>
//                   <p><strong>Amount:</strong> KES {payment.amount}</p>
//                   <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
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
//             {routers.map(({ name, status, color }) => (
//               <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <span>{name}</span>
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
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity } from "lucide-react";
// import api from "../../../api"
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
//   });
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [activities, setActivities] = useState([{ description: "No activities yet" }]);
//   const [network, setNetwork] = useState({
//     latency: "0ms",
//     bandwidth: "0%",
//   });
//   const [routers, setRouters] = useState([{ name: "No routers", status: "Offline", color: "red" }]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempProfile, setTempProfile] = useState({});
//   const [previewImage, setPreviewImage] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!isAuthenticated || !userDetails.is_staff) {
//         console.log("User is not authenticated or not an admin, skipping fetch");
//         setError("You do not have permission to access this resource.");
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
//         console.error("Fetch error:", err);
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
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <div>Loading...</div>
//       </div>
//     );
//   }

//   if (!userDetails.is_staff) {
//     return (
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <p className="text-center text-red-400">You do not have permission to access the admin dashboard.</p>
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
//             Welcome, {profile.name || "Admin"}
//           </p>
//         </header>

//         <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//           <div className="flex flex-col md:flex-row items-center gap-6">
//             <div className="relative w-32 h-32">
//               <img
//                 src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
//                 alt="Admin"
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
//                   placeholder="Admin Name"
//                 />
//               ) : (
//                 <h2 className="text-2xl font-bold">{profile.name || "Admin"}</h2>
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

//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//             { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//             { title: "Daily Revenue", value: `KES ${stats.revenue}`, icon: DollarSign, color: "yellow" },
//             { title: "Uptime", value: stats.uptime, icon: Gauge, color: "purple" },
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
//                 <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
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
//                   {activity.description}
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
//                   <p><strong>Client:</strong> {sub.client.name}</p>
//                   <p><strong>Email:</strong> {sub.client.email}</p>
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
//                   <p><strong>Client:</strong> {payment.client.name}</p>
//                   <p><strong>Email:</strong> {payment.client.email}</p>
//                   <p><strong>Amount:</strong> KES {payment.amount}</p>
//                   <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
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
//             {routers.map(({ name, status, color }) => (
//               <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <span>{name}</span>
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
// import { Users, Wifi, Gauge, DollarSign, Camera, Activity } from "lucide-react";
// import api from "../../../api";
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
//   });
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [activities, setActivities] = useState([{ description: "No activities yet" }]);
//   const [network, setNetwork] = useState({
//     latency: "0ms",
//     bandwidth: "0%",
//   });
//   const [routers, setRouters] = useState([{ name: "No routers", status: "Offline", color: "red" }]);
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
//       <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
//         <div>Loading...</div>
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

//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[
//             { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
//             { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
//             { title: "Daily Revenue", value: `KES ${stats.revenue}`, icon: DollarSign, color: "yellow" },
//             { title: "Uptime", value: stats.uptime, icon: Gauge, color: "purple" },
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
//                 <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
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
//                   {activity.description}
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
//                   <p><strong>Client:</strong> {sub.client.name}</p>
//                   <p><strong>Email:</strong> {sub.client.email}</p>
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
//                   <p><strong>Client:</strong> {payment.client.name}</p>
//                   <p><strong>Email:</strong> {payment.client.email}</p>
//                   <p><strong>Amount:</strong> KES {payment.amount}</p>
//                   <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
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
//             {routers.map(({ name, status, color }) => (
//               <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
//                 <span>{name}</span>
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





import React, { useState, useEffect } from "react";
import { Users, Wifi, Gauge, DollarSign, Camera, Activity } from "lucide-react";
import { FaSpinner } from "react-icons/fa"; // Added modern spinner icon
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import avatar from "../../assets/avatar.png";

const AdminProfile = ({ theme }) => {
  const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();
  const [profile, setProfile] = useState({
    name: userDetails.name || "",
    email: userDetails.email || "",
    profilePic: userDetails.profilePic || "",
  });
  const [stats, setStats] = useState({
    clients: 0,
    activeClients: 0,
    revenue: 0,
    uptime: "0%",
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState([{ description: "No activities yet" }]);
  const [network, setNetwork] = useState({
    latency: "0ms",
    bandwidth: "0%",
  });
  const [routers, setRouters] = useState([{ name: "No routers", status: "Offline", color: "red" }]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        console.log("User is not authenticated, skipping fetch");
        setError("Please log in to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching profile data...");
        setIsLoading(true);
        const response = await api.get("/api/account/profile/");
        console.log("API response received:", response.data);

        const profileData = response.data.profile || {};
        const updatedProfile = {
          name: profileData.name || userDetails.name || "",
          email: profileData.email || userDetails.email || "",
          profilePic: profileData.profile_pic || userDetails.profilePic || "",
        };

        setProfile(updatedProfile);
        setStats(response.data.stats || stats);
        setSubscriptions(response.data.subscriptions || []);
        setPayments(response.data.payments || []);
        setActivities(response.data.activities || activities);
        setNetwork(response.data.network || network);
        setRouters(response.data.routers || routers);

        // Update AuthContext with fetched profile data
        updateUserDetails(updatedProfile);

        setError(null);
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.error || `Failed to load profile: ${err.message}`);
      } finally {
        console.log("Fetch complete, setting isLoading to false");
        setIsLoading(false);
      }
    };

    console.log("useEffect triggered, authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
    if (!authLoading && isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, updateUserDetails]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      setTempProfile((prev) => ({ ...prev, profilePic: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setTempProfile({ ...profile });
      setPreviewImage(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!isAuthenticated) {
      setError("Please log in to update your profile.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", tempProfile.name || profile.name);
      if (tempProfile.profilePic instanceof File) {
        formData.append("profile_pic", tempProfile.profilePic);
      }

      const response = await api.put("/api/account/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedProfile = {
        name: response.data.name || "",
        email: response.data.email || "",
        profilePic: response.data.profile_pic || "",
      };

      setProfile(updatedProfile);
      setPreviewImage(null);
      updateUserDetails(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Save profile error:", err);
      setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempProfile((prev) => ({ ...prev, [name]: value }));
  };

  console.log("Rendering AdminProfile, isLoading:", isLoading, "authLoading:", authLoading, "isAuthenticated:", isAuthenticated);

  if (authLoading || isLoading) {
    return (
      <div className={`min-h-screen p-8 flex justify-center items-center ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
        <p className="text-center text-red-400">Please log in to access your profile.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gray-100 text-gray-800"}`}>
      <main className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg text-center whitespace-pre-wrap">
            {error}
          </div>
        )}
        <header className="text-center">
          <h1 className={`text-5xl font-extrabold tracking-tight ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500" : "text-indigo-600"}`}>
            Admin Hub
          </h1>
          <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Welcome, {profile.name || "User"}
          </p>
        </header>

        <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-32 h-32">
              <img
                src={isEditing && previewImage ? previewImage : profile.profilePic || avatar}
                alt="User"
                className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
              />
              {isEditing && (
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition"
                >
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    id="profile-pic-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                </label>
              )}
            </div>
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={tempProfile.name || ""}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-800"}`}
                  placeholder="User Name"
                />
              ) : (
                <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
              )}
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{profile.email || "No email provided"}</p>
              <div>
                {isEditing ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    <span>✏️</span> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total Clients", value: stats.clients, icon: Users, color: "indigo" },
            { title: "Active Users", value: stats.activeClients, icon: Wifi, color: "green" },
            { title: "Daily Revenue", value: `KES ${stats.revenue}`, icon: DollarSign, color: "yellow" },
            { title: "Uptime", value: stats.uptime, icon: Gauge, color: "purple" },
          ].map(({ title, value, icon: Icon, color }) => (
            <div
              key={title}
              className={`p-4 rounded-xl shadow-md flex items-center gap-4 transition ${theme === "dark" ? `bg-${color}-900 hover:bg-${color}-800` : `bg-${color}-100 hover:bg-${color}-200`}`}
            >
              <Icon className={`w-8 h-8 text-${color}-400`} />
              <div>
                <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{title}</p>
                <p className="text-xl font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wifi className="w-6 h-6 text-green-400" /> Network Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p>Latency</p>
                <p className="text-green-400">{network.latency}</p>
              </div>
              <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
              <div className="flex justify-between items-center">
                <p>Bandwidth Usage</p>
                <p className="text-yellow-400">{network.bandwidth}</p>
              </div>
              <div className={`w-full rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: network.bandwidth || "0%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
            </h3>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {activities.map((activity, index) => (
                <li key={index} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                  {activity.description}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
          <h3 className="text-xl font-semibold mb-4">Recent Subscriptions</h3>
          <div className="grid grid-cols-1 gap-4">
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <div key={sub.id} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                  <p><strong>Client:</strong> {sub.client.name}</p>
                  <p><strong>Email:</strong> {sub.client.email}</p>
                  <p><strong>Status:</strong> {sub.is_active ? "Active" : "Inactive"}</p>
                  <p><strong>Start:</strong> {new Date(sub.start_date).toLocaleDateString()}</p>
                  <p><strong>End:</strong> {new Date(sub.end_date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No recent subscriptions</p>
            )}
          </div>
        </section>

        <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
          <h3 className="text-xl font-semibold mb-4">Recent Payments</h3>
          <div className="grid grid-cols-1 gap-4">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                  <p><strong>Client:</strong> {payment.client.name}</p>
                  <p><strong>Email:</strong> {payment.client.email}</p>
                  <p><strong>Amount:</strong> KES {payment.amount}</p>
                  <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>No recent payments</p>
            )}
          </div>
        </section>

        <section className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
          <h3 className="text-xl font-semibold mb-4">Router Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {routers.map(({ name, status, color }) => (
              <div key={name} className={`flex justify-between items-center p-3 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}>
                <span>{name}</span>
                <span className={`text-${color}-400 font-medium`}>{status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminProfile;