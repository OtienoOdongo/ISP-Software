

// // src/components/Account/AdminProfile.jsx
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
//       toast.error("Please log in to update your profile.");
//       return;
//     }

//     try {
//       const updateData = new FormData();
//       updateData.append("name", formData.fullName || profile.name);
//       updateData.append("email", formData.email || profile.email);
//       updateData.append("user_type", formData.role || profile.user_type);
//       if (formData.profilePicture) {
//         updateData.append("profile_pic", formData.profilePicture);
//       }

//       const response = await api.put("/api/account/profile/", updateData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

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
//         toast.error("Please upload an image file.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setError("File size must be less than 5MB.");
//         toast.error("File size must be less than 5MB.");
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

//             {/* Charts */}
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
//             transition={{ duration: 0.35 }}
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









// src/components/Account/AdminProfile.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  lazy,
  useCallback,
  Suspense,
  useRef
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
import { useTheme } from "../../context/ThemeContext";
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

// Data structures for efficient state management
class ProfileData {
  constructor(data = {}) {
    this.name = data.name || "";
    this.email = data.email || "";
    this.profile_pic = data.profile_pic || "";
    this.user_type = data.user_type || "admin";
    this.is_2fa_enabled = data.is_2fa_enabled || false;
  }
  
  update(newData) {
    return new ProfileData({ ...this, ...newData });
  }
}

class StatsData {
  constructor(data = {}) {
    this.clients = data.clients || 0;
    this.active_clients = data.active_clients || 0;
    this.revenue = data.revenue || 0;
    this.uptime = data.uptime || "0%";
    this.total_subscriptions = data.total_subscriptions || 0;
    this.successful_transactions = data.successful_transactions || 0;
  }
}

// Algorithm for debouncing API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Algorithm for memoizing expensive calculations
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Utility: KES formatter with memoization
const formatKES = memoize((value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0))
);

/* Loading */
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-56">
    <FaSpinner className="animate-spin text-4xl text-indigo-500" />
  </div>
);

/* -----------------------
  Main component
------------------------*/
const AdminProfile = () => {
  const { isAuthenticated, userDetails, loading: authLoading, updateUserDetails } = useAuth();
  const { theme } = useTheme();
  
  // Using Map for efficient notification management
  const [notificationsMap] = useState(new Map());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(new ProfileData(userDetails));
  const [stats, setStats] = useState(new StatsData());
  const [notifications, setNotifications] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(new ProfileData());
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const abortControllerRef = useRef(new AbortController());

  // Efficient data fetching with abort controller
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Using Promise.all for parallel requests
      const [profileResponse, notifResponse, historyResponse] = await Promise.all([
        api.get("/api/account/profile/", { 
          signal: abortControllerRef.current.signal 
        }),
        api.get("/api/account/notifications/", { 
          signal: abortControllerRef.current.signal 
        }),
        api.get("/api/account/login-history/", { 
          signal: abortControllerRef.current.signal 
        })
      ]);

      const profileData = profileResponse.data?.profile || {};
      const statsData = profileResponse.data?.stats || {};

      setProfile(new ProfileData(profileData));
      setStats(new StatsData(statsData));
      setActivities(profileResponse.data?.activities || []);
      
      // Efficient notification update using Map
      const newNotifications = notifResponse.data?.results || [];
      newNotifications.forEach(notif => notificationsMap.set(notif.id, notif));
      setNotifications(Array.from(notificationsMap.values()));
      
      setLoginHistory(historyResponse.data?.results || []);
      
      if (updateUserDetails) {
        updateUserDetails(profileData);
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      setError("Failed to load data");
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, updateUserDetails, notificationsMap]);

  // Debounced data fetching
  const debouncedFetchData = useMemo(() => debounce(fetchData, 300), [fetchData]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      debouncedFetchData();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [authLoading, isAuthenticated, debouncedFetchData]);

  /* Profile editing functions */
  const handleEditToggle = useCallback(() => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setTempProfile(new ProfileData(profile));
      setPreviewImage(null);
    }
  }, [isEditing, profile]);

  const handleSaveProfile = useCallback(async (formData) => {
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
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(new ProfileData(response.data));
      setPreviewImage(null);
      
      if (updateUserDetails) {
        updateUserDetails(response.data);
      }
      
      setIsEditing(false);
      setError(null);
      toast.success("Profile updated successfully");
      
      // Refresh data after update
      debouncedFetchData();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
      toast.error("Failed to update profile");
    }
  }, [isAuthenticated, profile, updateUserDetails, debouncedFetchData]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    
    setTempProfile(prev => prev.update({ profile_pic: file }));
    setPreviewImage(URL.createObjectURL(file));
  }, []);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/api/account/notifications/${id}/`);
      
      // Efficient update using Map
      if (notificationsMap.has(id)) {
        notificationsMap.set(id, { ...notificationsMap.get(id), read: true });
        setNotifications(Array.from(notificationsMap.values()));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark notification as read");
    }
  }, [notificationsMap]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete("/api/account/notifications/");
      notificationsMap.clear();
      setNotifications([]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to clear notifications");
    }
  }, [notificationsMap]);

  /* Derived chart data with memoization */
  const memoizedStatsData = useMemo(() => [
    { name: "Clients", value: stats.clients },
    { name: "Active", value: stats.active_clients },
    { name: "Subscriptions", value: stats.total_subscriptions },
  ], [stats.clients, stats.active_clients, stats.total_subscriptions]);

  const chartColors = useMemo(() => ["#6366f1", "#10b981", "#f59e0b"], []);

  // Binary search algorithm for activities (if needed for large datasets)
  const findActivityById = useCallback((id) => {
    let left = 0;
    let right = activities.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (activities[mid].id === id) return activities[mid];
      if (activities[mid].id < id) left = mid + 1;
      else right = mid - 1;
    }
    return null;
  }, [activities]);

  /* Loading & guards */
  if (authLoading || isLoading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <FaSpinner className="animate-spin text-5xl text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}>
        <p className="text-red-500">Please log in to access Diconden Control Center.</p>
      </div>
    );
  }

  /* Sidebar items */
  const sidebarItems = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: BellRing },
    { id: "login-history", label: "Login History", icon: CalendarClock },
    { id: "support", label: "Support & Docs", icon: BookOpen },
    { id: "roles", label: "Roles & Permissions", icon: UserCog },
    { id: "security", label: "Password & Security", icon: ShieldCheck },
  ], []);

  const renderTabContent = useCallback(() => {
    const tabComponents = {
      dashboard: (
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
                className={`p-6 rounded-xl shadow-md ${
                  theme === "dark" 
                    ? "bg-gray-800/60 backdrop-blur-md" 
                    : "bg-white/80 backdrop-blur-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>{card.title}</p>
                    <h3 className={`text-2xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}>{card.value}</h3>
                    <p className={`text-xs mt-1 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}>{card.desc}</p>
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
            <div className={`p-1 rounded-xl shadow-md ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md" 
                : "bg-white/80 backdrop-blur-md"
            }`}>
              <h3 className={`text-sm font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}>Client Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={memoizedStatsData}>
                  <XAxis dataKey="name" stroke={theme === "dark" ? "#fff" : "#374151"} />
                  <YAxis stroke={theme === "dark" ? "#fff" : "#374151"} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                      borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                      color: theme === "dark" ? "#fff" : "#374151"
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {memoizedStatsData.map((entry, idx) => (
                      <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`p-6 rounded-xl shadow-md ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md" 
                : "bg-white/80 backdrop-blur-md"
            }`}>
              <h3 className={`text-sm font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}>Subscription Distribution</h3>
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                      borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                      color: theme === "dark" ? "#fff" : "#374151"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ),
      profile: (
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
              theme={theme}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className={`p-6 rounded-xl shadow-md ${
                theme === "dark" 
                  ? "bg-gray-800/60 backdrop-blur-md" 
                  : "bg-white/80 backdrop-blur-md"
              } lg:col-span-1`}>
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <img
                      src={profile.profile_pic || avatar}
                      alt="User"
                      className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
                    />
                  </div>
                  <h2 className={`text-2xl font-bold text-center ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>{profile.name || "User"}</h2>
                  <p className={`text-center mt-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}>{profile.email || "No email provided"}</p>
                  <div className={`mt-4 px-3 py-1 rounded-full ${
                    theme === "dark" 
                      ? "bg-indigo-900 text-indigo-100" 
                      : "bg-indigo-100 text-indigo-800"
                  }`}>
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
              <div className={`p-6 rounded-xl shadow-md ${
                theme === "dark" 
                  ? "bg-gray-800/60 backdrop-blur-md" 
                  : "bg-white/80 backdrop-blur-md"
              } lg:col-span-2`}>
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="text-indigo-500" />
                  <h3 className={`text-xl font-semibold ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>Recent Activities</h3>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border-l-4 border-indigo-500 ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                        }`}
                      >
                        <p className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-800"
                        }`}>{activity.description}</p>
                        <p className={`text-sm mt-1 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className={`text-center py-8 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      <Activity size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ),
      notifications: (
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
      ),
      "login-history": (
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
      ),
      support: (
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
      ),
      roles: (
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
      ),
      security: (
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
      )
    };

    return tabComponents[activeTab] || <div>Select a tab</div>;
  }, [activeTab, stats, theme, memoizedStatsData, chartColors, isEditing, profile, activities, notifications, loginHistory, handleSaveProfile, handleEditToggle, markNotificationAsRead, clearAllNotifications]);

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
            <p className={`mt-2 text-lg ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}>
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
                      : `${
                          theme === "dark" 
                            ? "hover:bg-gray-700 text-gray-300" 
                            : "hover:bg-indigo-100 text-gray-700"
                        }`
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