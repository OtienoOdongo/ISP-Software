








// src/components/Account/AdminProfile.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  lazy,
  useCallback,
  Suspense,
  useRef,
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
  User,
  Activity,
  Edit3,
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

/* -----------------------
  Small helper classes
------------------------*/
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

/* simple KES formatter (pure) */
const formatKES = (value) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));

/* Loading fallback */
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

  // ---- All hooks first and unconditionally ----
  const [notificationsMap, setNotificationsMap] = useState(() => new Map());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(new ProfileData(userDetails || {}));
  const [stats, setStats] = useState(new StatsData());
  const [notifications, setNotifications] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(new ProfileData());
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // refs for debounce + abort controller
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // ------------------------
  // Fetching data (safe)
  // ------------------------
  const fetchData = useCallback(async (signal) => {
    try {
      setIsLoading(true);
      setError(null);

      // fetch profile (and related data), notifications, login history in parallel
      const [profileResp, notifResp, historyResp] = await Promise.all([
        api.get("/api/account/profile/", { signal }),
        api.get("/api/account/notifications/", { signal }),
        api.get("/api/account/login-history/", { signal }),
      ]);

      const profileData = profileResp.data?.profile || profileResp.data || {};
      const statsData = profileResp.data?.stats || {};

      setProfile(new ProfileData(profileData));
      setStats(new StatsData(statsData));
      setActivities(profileResp.data?.activities || []);

      // update notifications map state - keep stable Map object pattern
      const newList = (notifResp.data?.results || []).slice();
      setNotificationsMap((prevMap) => {
        const next = new Map(prevMap);
        newList.forEach((n) => next.set(n.id, n));
        // also update array form
        setNotifications(Array.from(next.values()));
        return next;
      });

      setLoginHistory(historyResp.data?.results || []);

      if (updateUserDetails) updateUserDetails(profileData);
    } catch (err) {
      if (err.name === "AbortError") {
        // aborted: ignore
        return;
      }
      console.error("fetchData error", err);
      setError("Failed to load data");
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [updateUserDetails]);

  // Debounced wrapper using refs (keeps hooks stable)
  const debouncedFetch = useCallback(() => {
    // clear previous debounce
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      // abort previous in-flight
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (_) {}
      }
      abortControllerRef.current = new AbortController();
      fetchData(abortControllerRef.current.signal);
    }, 250);
  }, [fetchData]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      debouncedFetch();
    }

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) {
        try { abortControllerRef.current.abort(); } catch (_) {}
      }
    };
  }, [authLoading, isAuthenticated, debouncedFetch]);

  // ------------------------
  // Profile editing handlers
  // ------------------------
  const handleEditToggle = useCallback(() => {
    setIsEditing((prev) => {
      const next = !prev;
      if (next) {
        setTempProfile(profile);
        setPreviewImage(null);
      }
      return next;
    });
  }, [profile]);

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

      const updatedProfile = response.data || {};
      setProfile(new ProfileData(updatedProfile));
      setPreviewImage(null);
      if (updateUserDetails) updateUserDetails(updatedProfile);
      setIsEditing(false);
      setError(null);
      toast.success("Profile updated successfully");

      // refresh after save
      debouncedFetch();
    } catch (err) {
      console.error("save profile error", err);
      setError(err.response?.data?.error || `Failed to save profile: ${err.message}`);
      toast.error("Failed to update profile");
    }
  }, [isAuthenticated, profile, updateUserDetails, debouncedFetch]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
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

    setTempProfile((prev) => prev.update({ profile_pic: file }));
    setPreviewImage(URL.createObjectURL(file));
  }, []);

  // ------------------------
  // Notifications operations
  // ------------------------
  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/api/account/notifications/${id}/`);
      setNotificationsMap((prev) => {
        const next = new Map(prev);
        if (next.has(id)) {
          next.set(id, { ...next.get(id), read: true });
          setNotifications(Array.from(next.values()));
        }
        return next;
      });
    } catch (err) {
      console.error("markNotificationAsRead", err);
      setError(err.response?.data?.error || "Failed to mark notification as read");
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete("/api/account/notifications/");
      setNotificationsMap(() => {
        setNotifications([]);
        return new Map();
      });
    } catch (err) {
      console.error("clearAllNotifications", err);
      setError(err.response?.data?.error || "Failed to clear notifications");
    }
  }, []);

  // ------------------------
  // Derived memoized values
  // ------------------------
  const memoizedStatsData = useMemo(
    () => [
      { name: "Clients", value: stats.clients },
      { name: "Active", value: stats.active_clients },
      { name: "Subscriptions", value: stats.total_subscriptions },
    ],
    [stats.clients, stats.active_clients, stats.total_subscriptions]
  );

  const chartColors = useMemo(() => ["#6366f1", "#10b981", "#f59e0b"], []);

  const sidebarItems = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "profile", label: "Profile", icon: User },
      { id: "notifications", label: "Notifications", icon: BellRing },
      { id: "login-history", label: "Login History", icon: CalendarClock },
      { id: "support", label: "Support & Docs", icon: BookOpen },
      { id: "roles", label: "Roles & Permissions", icon: UserCog },
      { id: "security", label: "Password & Security", icon: ShieldCheck },
    ],
    []
  );

  // ------------------------
  // Binary search utility (kept as-is)
  // ------------------------
  const findActivityById = useCallback(
    (id) => {
      let left = 0;
      let right = activities.length - 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (activities[mid].id === id) return activities[mid];
        if (activities[mid].id < id) left = mid + 1;
        else right = mid - 1;
      }
      return null;
    },
    [activities]
  );

  // ------------------------
  // Render tab content (no hooks inside here)
  // ------------------------
  const renderTabContent = useCallback(() => {
    // Components rely on state but do not call hooks inside this function
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
                  className={`p-6 rounded-xl shadow-md ${
                    theme === "dark" ? "bg-gray-800/60 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{card.title}</p>
                      <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>{card.value}</h3>
                      <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{card.desc}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gradient-to-r ${card.color} text-white shadow`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className={`p-1 rounded-xl shadow-md ${
                  theme === "dark" ? "bg-gray-800/60 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"
                }`}
              >
                <h3 className={`text-sm font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Client Statistics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={memoizedStatsData}>
                    <XAxis dataKey="name" stroke={theme === "dark" ? "#fff" : "#374151"} />
                    <YAxis stroke={theme === "dark" ? "#fff" : "#374151"} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                        color: theme === "dark" ? "#fff" : "#374151",
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

              <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"}`}>
                <h3 className={`text-sm font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Subscription Distribution</h3>
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
                        color: theme === "dark" ? "#fff" : "#374151",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        );
      case "profile":
        return (
          <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.35 }} className="space-y-6">
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
                <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"} lg:col-span-1`}>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <img src={profile.profile_pic || avatar} alt="User" className="w-full h-full rounded-full object-cover border-4 border-indigo-500" />
                    </div>
                    <h2 className={`text-2xl font-bold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>{profile.name || "User"}</h2>
                    <p className={`text-center mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>{profile.email || "No email provided"}</p>
                    <div className={`mt-4 px-3 py-1 rounded-full ${theme === "dark" ? "bg-indigo-900 text-indigo-100" : "bg-indigo-100 text-indigo-800"}`}>{profile.user_type}</div>

                    <button onClick={handleEditToggle} className="mt-6 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-white flex items-center gap-2">
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className={`p-6 rounded-xl shadow-md ${theme === "dark" ? "bg-gray-800/60 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"} lg:col-span-2`}>
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-indigo-500" />
                    <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Recent Activities</h3>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {activities.length > 0 ? (
                      activities.map((activity, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 border-indigo-500 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                          <p className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>{activity.description}</p>
                          <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
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
          <motion.div key="notifications" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.35 }}>
            <NotificationSystem notifications={notifications} onMarkAsRead={markNotificationAsRead} onClearAll={clearAllNotifications} theme={theme} />
          </motion.div>
        );
      case "login-history":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div key="login-history" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.35 }}>
              <LoginHistory history={loginHistory} theme={theme} />
            </motion.div>
          </Suspense>
        );
      case "support":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div key="support" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.35 }}>
              <SupportDocumentation theme={theme} />
            </motion.div>
          </Suspense>
        );
      case "roles":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div key="roles" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.35 }}>
              <RolePermissions theme={theme} />
            </motion.div>
          </Suspense>
        );
      case "security":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <motion.div key="security" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.35 }}>
              <PasswordSecurity user={profile} theme={theme} />
            </motion.div>
          </Suspense>
        );
      default:
        return <div>Select a tab</div>;
    }
  }, [
    activeTab,
    activities,
    chartColors,
    handleEditToggle,
    handleSaveProfile,
    isEditing,
    memoizedStatsData,
    notifications,
    loginHistory,
    markNotificationAsRead,
    clearAllNotifications,
    profile,
    stats,
    theme,
  ]);

  // ------------------------
  // Loading & auth guards (these returns are after hooks)
  // ------------------------
  if (authLoading || isLoading) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <FaSpinner className="animate-spin text-5xl text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
        }`}
      >
        <p className="text-red-500">Please log in to access Interlink Control Center.</p>
      </div>
    );
  }

  // ------------------------
  // Render
  // ------------------------
  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        theme === "dark" ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white" : "bg-gradient-to-br from-white to-indigo-50 text-gray-800"
      }`}
    >
      <main className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Interactive Control Center
            </h1>
            <p className={`mt-2 text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Welcome back, {profile.name || "Administrator"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationSystem notifications={notifications} onMarkAsRead={markNotificationAsRead} isWidget theme={theme} />
            <LanguageRegionSelector language="en" region="KE" theme={theme} />
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <motion.aside className={`w-64 p-5 rounded-xl shadow-xl ${theme === "dark" ? "bg-gray-800/80 backdrop-blur-md" : "bg-white/80 backdrop-blur-md"}`}>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition font-medium ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                      : `${theme === "dark" ? "hover:bg-gray-700 text-gray-300" : "hover:bg-indigo-100 text-gray-700"}`
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.aside>

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