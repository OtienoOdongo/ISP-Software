import React, { useState, useCallback } from "react";
import { Users, Gauge, WifiHigh, TrendingUp, CameraIcon } from "lucide-react";
import avatar from "../../assets/avatar.png";

const AdminProfile = ({ onOpenSettings }) => {
    const [profile, setProfile] = useState({
        name: "Clinton Odongo",
        email: "admin@interlink.com",
        role: "Admin",
        clients: 25,
        activeClients: 18,
        subscriptions: 50,
        profilePic: "",
    });

    const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
    const [tempProfile, setTempProfile] = useState({ ...profile }); // Temporary state for editing

    const [recentActivities, setRecentActivities] = useState([
        { description: "New client registered: Acme Corp" },
        { description: "Network upgrade completed for Nairobi region" },
        { description: "Monthly billing cycle started" },
        { description: "Security patch applied to all routers" },
    ]);

    const [networkHealth, setNetworkHealth] = useState({
        latency: "45ms",
        bandwidthUsage: "70%",
    });

    const [serverStatus, setServerStatus] = useState([
        { name: "Main Router", status: "Online", color: "green" },
        { name: "Backup Router", status: "Offline", color: "red" },
        { name: "Router 1", status: "Online", color: "green" },
    ]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.onerror = () => {
                console.error("Error reading file");
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleEditProfile = () => {
        setIsEditing(true); // Enter edit mode
        setTempProfile({ ...profile }); // Copy current profile data to temporary state
    };

    const handleSaveProfile = () => {
        setProfile({ ...tempProfile }); // Save changes from temporary state to profile
        setIsEditing(false); // Exit edit mode
    };

    const handleCancelEdit = () => {
        setIsEditing(false); // Exit edit mode without saving
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempProfile(prev => ({ ...prev, [name]: value })); // Update temporary state
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <main className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Profile</h1>
                    <p className="text-sm text-gray-500">Welcome to your admin dashboard.</p>
                </header>

                <div className="space-y-8">
                    {/* Personal Information */}
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                            <Users className="w-6 h-6" />
                            Personal Information
                        </h2>
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative w-32 h-32">
                                <img
                                    src={profile.profilePic || avatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full border-2 border-gray-300"
                                />
                                <label
                                    htmlFor="profile-pic-upload"
                                    className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer"
                                    title="Change Profile Picture"
                                >
                                    <CameraIcon className="w-4 h-4" />
                                </label>
                                <input
                                    type="file"
                                    id="profile-pic-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={tempProfile.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="w-full p-3 border rounded-lg bg-gray-200">{profile.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={tempProfile.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ) : (
                                    <p className="w-full p-3 border rounded-lg bg-gray-200">{profile.email}</p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleEditProfile}
                                        className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

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
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;