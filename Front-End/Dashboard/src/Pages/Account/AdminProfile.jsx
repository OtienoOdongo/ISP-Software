import React, { useState } from "react";
import {
    Users,
    Gauge,
    DollarSign,
    BarChart,
    WifiHigh,
    Server,
    TrendingUp,
    Settings,
    ShieldCheck,
    CameraIcon
} from "lucide-react";
import avatar from "../../assets/avatar.png";

// Commented out useEffect for now, using dummy data instead
// import axios from 'axios';

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        name: "Clinton Odongo",
        email: "admin@interlink.com",
        phone: "+254 700 123 456",
        role: "Admin",
        clients: 25,
        activeClients: 18,
        subscriptions: 50,
        profilePic: "",
    });

    // Using dummy data for recent activities
    const [recentActivities, setRecentActivities] = useState([
        { description: "New client registered: Acme Corp" },
        { description: "Network upgrade completed for Nairobi region" },
        { description: "Monthly billing cycle started" },
        { description: "Security patch applied to all routers" }
    ]);

    // Using dummy data for network health
    const [networkHealth, setNetworkHealth] = useState({
        latency: "45ms",
        bandwidthUsage: "70%"
    });

    // Using dummy data for server status
    const [serverStatus, setServerStatus] = useState([
        { name: "Main Router", status: "Online", color: "green" },
        { name: "Backup Router", status: "Offline", color: "red" },
        { name: "Router 1", status: "Online", color: "green" }
    ]);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // useEffect(() => {
    //   const fetchAdminData = async () => {
    //     try {
    //       const profileResponse = await axios.get('/api/admin-profile');
    //       setProfile(prev => ({ ...prev, ...profileResponse.data }));
    // 
    //       const activitiesResponse = await axios.get('/api/recent-activities');
    //       setRecentActivities(activitiesResponse.data);
    // 
    //       const networkHealthResponse = await axios.get('/api/network-health');
    //       setNetworkHealth(networkHealthResponse.data);
    // 
    //       const serverStatusResponse = await axios.get('/api/server-status');
    //       setServerStatus(serverStatusResponse.data);
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //     }
    //   };

    //   fetchAdminData();
    // }, []);

    const handlePasswordChange = () => {
        console.log("Password changed:", passwordForm);
        setIsChangingPassword(false);
        // Implement actual password change API call
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile({ ...profile, profilePic: URL.createObjectURL(file) });
            // Upload file to server
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 min-h-screen p-6 bg-gray-100">
            {/* Sidebar */}
            <aside className="bg-white shadow-lg rounded-lg p-6 lg:sticky lg:top-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="relative w-32 h-32">
                        <img
                            src={profile.profilePic || avatar}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full border-2 border-gray-300"
                        />
                        <label
                            htmlFor="profile-pic-upload"
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer"
                            title="Change Profile Picture"
                        >
                            <CameraIcon size={20} />
                        </label>
                        <input
                            type="file"
                            id="profile-pic-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept="image/*"
                        />
                    </div>
                    <h2 className="text-lg font-semibold">{profile.name}</h2>
                    <p className="text-sm text-gray-500">{profile.role}</p>
                </div>

                <ul className="space-y-4">
                    {[
                        { icon: Settings, label: "Account Settings", path: "/settings" },
                        { icon: Users, label: "Client Management", path: "/clients" },
                        { icon: Gauge, label: "Network Performance", path: "/network" },
                        { icon: DollarSign, label: "Financial Overview", path: "/finance" },
                        { icon: Server, label: "Router Management", path: "/router-management" },
                        { icon: BarChart, label: "Analytics", path: "/analytics" },
                        { icon: ShieldCheck, label: "Security", path: "/security" },
                    ].map(({ icon: Icon, label, path }) => (
                        <li key={label} className="flex items-center gap-3 text-gray-700 hover:text-blue-500 cursor-pointer">
                            <Icon size={20} />
                            <a href={path}>{label}</a>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {profile.name}</h1>
                    <button
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 shadow-md transition-colors"
                    >
                        Change Password
                    </button>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { title: "Clients", value: profile.clients, icon: Users, color: "blue" },
                        { title: "Active Connections", value: profile.activeClients, icon: WifiHigh, color: "green" },
                        { title: "Total Subscriptions", value: profile.subscriptions, icon: TrendingUp, color: "purple" },
                        { title: "Network Uptime", value: "99.9%", icon: Gauge, color: "yellow" },
                    ].map(({ title, value, icon: Icon, color }) => (
                        <div key={title} className={`bg-${color}-100 p-6 rounded-lg shadow-md flex items-center space-x-4`}>
                            <Icon className={`w-10 h-10 text-${color}-600`} />
                            <div>
                                <h3 className="text-sm text-gray-600">{title}</h3>
                                <p className={`text-lg font-bold text-${color}-800`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activities */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Activities</h2>
                    <ul className="space-y-2">
                        {recentActivities.map((activity, index) => (
                            <li key={index} className="p-4 bg-white rounded-lg shadow-sm">
                                <span className="text-sm text-gray-600">{activity.description}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* System Health */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Network Health</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex-grow">
                                <p className="text-sm text-gray-600">Latency</p>
                                <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
                            </div>
                            <span className="text-sm text-gray-600">{networkHealth.latency}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex-grow">
                                <p className="text-sm text-gray-600">Bandwidth Usage</p>
                                <div className="h-2 bg-yellow-400 rounded-full" style={{ width: networkHealth.bandwidthUsage }}></div>
                            </div>
                            <span className="text-sm text-gray-600">{networkHealth.bandwidthUsage}</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4">Server Status</h3>
                        <ul className="space-y-2">
                            {serverStatus.map(({ name, status, color }) => (
                                <li key={name} className="flex items-center justify-between">
                                    <span className="text-gray-600">{name}</span>
                                    <span className={`text-${color}-600 font-medium`}>{status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Password Change Modal */}
                {isChangingPassword && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                            {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                                <div key={field} className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field}>
                                        {field.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <input
                                        type="password"
                                        id={field}
                                        name={field}
                                        value={passwordForm[field]}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button
                                    onClick={handlePasswordChange}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminProfile;


