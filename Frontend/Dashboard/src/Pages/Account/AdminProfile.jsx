import React, { useState, useEffect, useCallback } from "react";
import { Users, Wifi, Gauge, DollarSign, Camera, Activity } from "lucide-react";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import avatar from "../../assets/avatar.png";

const AdminProfile = () => {
    const { isAuthenticated } = useAuth();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        profilePic: "",
    });
    const [stats, setStats] = useState({
        clients: 0,
        activeClients: 0,
        revenue: 0,
        uptime: "0%",
    });
    const [activities, setActivities] = useState([
        { description: "No activities yet" },
    ]);
    const [network, setNetwork] = useState({
        latency: "0ms",
        bandwidth: "0%",
    });
    const [routers, setRouters] = useState([
        { name: "No routers", status: "Offline", color: "red" },
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated) {
                setError("Please log in to view your profile.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await api.get("/api/account/profile/");
                setProfile({
                    name: response.data.profile.name || "",
                    email: response.data.profile.email || "",
                    profilePic: response.data.profile.profilePic || "",
                });
                setStats({
                    clients: response.data.stats.clients || 0,
                    activeClients: response.data.stats.active_clients || 0,
                    revenue: response.data.stats.revenue || 0,
                    uptime: response.data.stats.uptime || "0%",
                });
                setActivities(
                    response.data.activities?.length > 0
                        ? response.data.activities
                        : [{ description: "No activities yet" }]
                );
                setNetwork({
                    latency: response.data.network.latency || "0ms",
                    bandwidth: response.data.network.bandwidth || "0%",
                });
                setRouters(
                    response.data.routers?.length > 0
                        ? response.data.routers
                        : [{ name: "No routers", status: "Offline", color: "red" }]
                );
                setError(null);
            } catch (err) {
                setError("Failed to load profile data. Using default values.");
                console.error("Fetch error:", err.response?.data || err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setTempProfile((prev) => ({ ...prev, profilePic: file }));
        }
    }, []);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setTempProfile({ ...profile });
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
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setProfile(response.data);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError("Failed to save profile. Please try again.");
            console.error("Save error:", err.response?.data || err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempProfile((prev) => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
                <p className="text-center">Loading dashboard...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
                <p className="text-center text-red-400">Please log in to access the admin dashboard.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
            <main className="max-w-7xl mx-auto space-y-8">
                {error && (
                    <p className="text-center text-red-400">{error}</p>
                )}

                <header className="text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight">Interlink Admin Hub</h1>
                    <p className="mt-2 text-lg text-gray-400">Manage your Starlink reselling empire</p>
                </header>

                <section className="bg-gray-700 rounded-xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative w-32 h-32">
                            <img
                                src={
                                    profile.profilePic
                                        ? `${import.meta.env.VITE_API_URL}${profile.profilePic}`
                                        : avatar
                                }
                                alt="Admin"
                                className="w-full h-full rounded-full object-cover border-4 border-indigo-500"
                            />
                            {isEditing && (
                                <label
                                    htmlFor="profile-pic-upload"
                                    className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700"
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
                                    className="w-full p-3 bg-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Admin Name"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                            )}
                            <p className="text-gray-300">{profile.email}</p>
                            <div>
                                {isEditing ? (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleEditToggle}
                                            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleEditToggle}
                                        className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700"
                                    >
                                        Edit Profile
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
                            className={`bg-${color}-900 p-4 rounded-xl shadow-md flex items-center gap-4 hover:bg-${color}-800 transition`}
                        >
                            <Icon className={`w-8 h-8 text-${color}-400`} />
                            <div>
                                <p className="text-sm text-gray-300">{title}</p>
                                <p className="text-xl font-semibold">{value}</p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Wifi className="w-6 h-6 text-green-400" /> Network Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p>Latency</p>
                                <p className="text-green-400">{network.latency}</p>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <p>Bandwidth Usage</p>
                                <p className="text-yellow-400">{network.bandwidth}</p>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: network.bandwidth }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-700 rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-400" /> Recent Actions
                        </h3>
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {activities.map((activity, index) => (
                                <li key={index} className="p-3 bg-gray-600 rounded-lg">
                                    {activity.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="bg-gray-700 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Router Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {routers.map(({ name, status, color }) => (
                            <div key={name} className="flex justify-between items-center p-3 bg-gray-600 rounded-lg">
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



