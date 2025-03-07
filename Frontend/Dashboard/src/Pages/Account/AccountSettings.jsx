import React, { useState, useEffect, useCallback } from "react";
import { Lock, Bell, Key, Users, Copy, Loader, Shield, Clock } from "lucide-react";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import avatar from "../../assets/avatar.png";

const AccountSettings = () => {
    const { isAuthenticated, userDetails, updateUserDetails } = useAuth();
    const [profile, setProfile] = useState({
        name: userDetails.name || "",
        email: userDetails.email || "",
        profilePic: userDetails.profilePic || "",
    });
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        paymentAlerts: true,
        systemAlerts: false,
        securityAlerts: true,
        priorityOnly: false,
        digestFrequency: "daily",
    });
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorEnabled: false,
        sessionTimeout: 30,
        ipWhitelist: "",
    });
    const [apiKey, setApiKey] = useState("");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState({ ...profile });
    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            if (!isAuthenticated) {
                console.log("Not authenticated, skipping fetch");
                return;
            }
            setIsLoading(true);
            try {
                console.log("Fetching settings from /api/account/settings/");
                const response = await api.get("/api/account/settings/");
                console.log("Settings response:", response.data);
                setNotifications({
                    emailAlerts: response.data.email_alerts || false,
                    paymentAlerts: response.data.payment_alerts || false,
                    systemAlerts: response.data.system_alerts || false,
                    securityAlerts: response.data.security_alerts || false,
                    priorityOnly: response.data.priority_only || false,
                    digestFrequency: response.data.digest_frequency || "daily",
                });
                setSecuritySettings({
                    twoFactorEnabled: response.data.two_factor_enabled || false,
                    sessionTimeout: response.data.session_timeout || 30,
                    ipWhitelist: response.data.ip_whitelist || "",
                });
                setApiKey(response.data.api_key || "");
                setProfile({
                    name: userDetails.name || "",
                    email: userDetails.email || "",
                    profilePic: userDetails.profilePic || "",
                });
                setError("");
            } catch (err) {
                console.error("Fetch error:", err.message, err.response?.status, err.response?.data);
                setError(
                    err.response?.status === 403
                        ? "Forbidden: Ensure you have admin privileges."
                        : err.response?.status === 401
                            ? "Unauthorized: Please log in again."
                            : "Failed to load settings. Please try again."
                );
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [isAuthenticated, userDetails]);

    const handleFileUpload = useCallback((e) => {
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
    }, []);

    const handleEditProfileToggle = () => {
        setIsEditingProfile(!isEditingProfile);
        if (!isEditingProfile) {
            setTempProfile({ ...profile });
            setPreviewImage(null);
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        setError("");
        try {
            const formData = new FormData();
            formData.append("name", tempProfile.name || profile.name);
            if (tempProfile.profilePic instanceof File) {
                formData.append("profile_pic", tempProfile.profilePic);
            }

            const response = await api.put("/api/account/profile/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Profile save response:", response.data);

            const updatedProfile = {
                name: response.data.name || "",
                email: response.data.email || "",
                profilePic: response.data.profile_pic || "",
            };
            setProfile(updatedProfile);
            updateUserDetails(updatedProfile);
            setPreviewImage(null);
            setIsEditingProfile(false);
            alert("Profile updated successfully!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update profile.");
            console.error("Save error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setTempProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked, value } = e.target;
        setNotifications((prev) => ({
            ...prev,
            [name]: name === "digestFrequency" ? value : checked,
        }));
    };

    const handleSaveNotifications = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.put("/api/account/settings/", {
                email_alerts: notifications.emailAlerts,
                payment_alerts: notifications.paymentAlerts,
                system_alerts: notifications.systemAlerts,
                security_alerts: notifications.securityAlerts,
                priority_only: notifications.priorityOnly,
                digest_frequency: notifications.digestFrequency,
            });
            console.log("Notification settings saved:", response.data);
            alert("Notification settings updated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save notification settings.");
            console.error("Save error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSecurityChange = (e) => {
        const { name, value, checked } = e.target;
        setSecuritySettings((prev) => ({
            ...prev,
            [name]: name === "twoFactorEnabled" ? checked : value,
        }));
    };

    const handleSaveSecurity = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.put("/api/account/settings/", {
                two_factor_enabled: securitySettings.twoFactorEnabled,
                session_timeout: parseInt(securitySettings.sessionTimeout, 10),
                ip_whitelist: securitySettings.ipWhitelist,
            });
            console.log("Security settings saved:", response.data);
            alert("Security settings updated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save security settings.");
            console.error("Save error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!window.confirm("Generating a new API key will invalidate the current one. Continue?")) return;
        setIsLoading(true);
        setError("");
        try {
            const response = await api.post("/api/account/generate-api-key/");
            setApiKey(response.data.api_key);
            alert("New API key generated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate API key.");
            console.error("Generate error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        alert("API key copied to clipboard!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <main className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                <header className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
                    <h1 className="text-3xl font-bold">Account Settings</h1>
                    <p className="text-gray-200 mt-2">Secure and customize your dashboard experience</p>
                </header>

                {error && (
                    <div className="bg-red-500 text-white p-4 text-center">
                        {error}
                    </div>
                )}

                {/* Profile Section */}
                <section className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" /> Personal Information
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative w-24 h-24">
                                <img
                                    src={
                                        isEditingProfile && previewImage
                                            ? previewImage
                                            : profile.profilePic
                                                ? `${import.meta.env.VITE_API_URL}${profile.profilePic}`
                                                : avatar
                                    }
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover border-4 border-indigo-100"
                                />
                                {isEditingProfile && (
                                    <label
                                        htmlFor="profile-pic-upload"
                                        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-indigo-700"
                                    >
                                        <Key className="w-4 h-4" />
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
                                {isEditingProfile ? (
                                    <>
                                        <input
                                            type="text"
                                            name="name"
                                            value={tempProfile.name}
                                            onChange={handleProfileChange}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Full Name"
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            value={tempProfile.email}
                                            disabled
                                            className="w-full p-2 border rounded-lg bg-gray-200 text-gray-500"
                                            placeholder="Email Address"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium text-gray-800">{profile.name}</p>
                                        <p className="text-gray-600">{profile.email}</p>
                                    </>
                                )}
                                <div className="flex gap-4">
                                    {isEditingProfile ? (
                                        <>
                                            <button
                                                onClick={handleSaveProfile}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
                                            </button>
                                            <button
                                                onClick={handleEditProfileToggle}
                                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEditProfileToggle}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Settings */}
                <section className="p-8 bg-gray-50">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-red-600" /> Security
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="twoFactorEnabled"
                                checked={securitySettings.twoFactorEnabled}
                                onChange={handleSecurityChange}
                                className="w-4 h-4 text-red-600 focus:ring-red-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Enable Two-Factor Authentication (2FA)</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                name="sessionTimeout"
                                value={securitySettings.sessionTimeout}
                                onChange={handleSecurityChange}
                                min="5"
                                max="1440"
                                className="w-full sm:w-24 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">Auto-logout after inactivity (5-1440 minutes).</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">IP Whitelist (comma-separated)</label>
                            <input
                                type="text"
                                name="ipWhitelist"
                                value={securitySettings.ipWhitelist}
                                onChange={handleSecurityChange}
                                placeholder="e.g., 192.168.1.1, 10.0.0.2"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">Restrict dashboard access to these IPs.</p>
                        </div>
                        <button
                            onClick={handleSaveSecurity}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Security Settings"}
                        </button>
                    </div>
                </section>

                {/* Notification Preferences */}
                <section className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-blue-600" /> Notifications
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="emailAlerts"
                                checked={notifications.emailAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Email Alerts (General Updates)</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="paymentAlerts"
                                checked={notifications.paymentAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Payment Alerts</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="systemAlerts"
                                checked={notifications.systemAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">System Alerts (e.g., Router Status)</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="securityAlerts"
                                checked={notifications.securityAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">Security Alerts (e.g., Login Attempts)</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="priorityOnly"
                                checked={notifications.priorityOnly}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700">High-Priority Only</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notification Digest Frequency</label>
                            <select
                                name="digestFrequency"
                                value={notifications.digestFrequency}
                                onChange={handleNotificationChange}
                                className="w-full sm:w-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="immediate">Immediate</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                            <p className="text-sm text-gray-500 mt-1">Control when non-priority notifications are sent.</p>
                        </div>
                        <button
                            onClick={handleSaveNotifications}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Notification Settings"}
                        </button>
                    </div>
                </section>

                {/* API Key Management */}
                <section className="p-8 bg-gray-50">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Key className="w-6 h-6 text-green-600" /> API Key
                    </h2>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                                type="text"
                                value={apiKey}
                                readOnly
                                className="w-full sm:flex-1 p-2 border rounded-lg bg-gray-200 text-gray-700"
                            />
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    onClick={handleCopyApiKey}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                                >
                                    <Copy className="w-5 h-5" /> Copy
                                </button>
                                <button
                                    onClick={handleGenerateApiKey}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Generate New Key"}
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Use this key for secure API integrations (e.g., Mikrotik, MPesa).
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AccountSettings;


