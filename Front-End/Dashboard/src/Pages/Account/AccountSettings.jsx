


import React, { useState, useCallback } from "react";
import { User, Lock, Bell, Shield } from "lucide-react";
import avatar from "../../assets/avatar.png";

const AccountSettings = () => {
    const [profile, setProfile] = useState({
        name: "Clinton Odongo",
        email: "admin@interlink.com",
        phone: "+254 700 123 456",
        role: "Admin",
        profilePic: "",
    });

    const [security, setSecurity] = useState({
        twoFactorAuth: false,
        passwordLastChanged: "2023-10-01",
    });

    const [notifications, setNotifications] = useState({
        internetUsageAlerts: {
            active: true,
            threshold: "80%",
            frequency: "daily"
        },
        subscriptionReminders: {
            active: true,
            daysBefore: 3,
            frequency: "daily"
        },
        systemUpdates: {
            active: true,
            frequency: "as-it-happens"
        },
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile(prev => ({ ...prev, profilePic: URL.createObjectURL(file) }));
            // Implement file upload to backend
        }
    }, []);

    const handleProfileUpdate = useCallback((e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate backend call
        setTimeout(() => {
            alert("Profile updated!");
            setLoading(false);
        }, 2000);
    }, [profile]);

    const handlePasswordChange = useCallback((e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
        // Simulate backend call
        setTimeout(() => {
            console.log("Password changed:", passwordForm);
            setIsPasswordModalOpen(false);
            alert("Password changed successfully!");
            setLoading(false);
        }, 2000);
    }, [passwordForm]);

    const toggleTwoFactorAuth = useCallback(() => {
        setSecurity(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }));
        console.log("Two-factor authentication toggled:", !security.twoFactorAuth);
        // Implement backend call to toggle two-factor auth
    }, [security.twoFactorAuth]);

    const handleNotificationChange = useCallback((type, key) => (e) => {
        setNotifications(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: key === 'active' ? !prev[type][key] : e.target.value
            }
        }));
        console.log(`${type} notification ${key} updated to:`, e.target.value || !prev[type][key]);
        // Implement backend call to update notification preferences
    }, []);

    const PasswordModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium mb-2 capitalize">
                                {field.replace(/([A-Z])/g, ' $1')}
                            </label>
                            <input
                                type="password"
                                value={passwordForm[field]}
                                onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                    ))}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <main className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Account Settings</h1>
                    <p className="text-sm text-gray-500">Manage your account preferences and security settings.</p>
                </header>

                <div className="space-y-8">

                    {/* Personal Information */}
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                            <User className="w-6 h-6" />
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
                                    <User className="w-4 h-4" />
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
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors duration-200"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Profile"}
                            </button>
                        </form>
                    </section>

                    {/* Security Settings */}
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
                            <Shield className="w-6 h-6" />
                            Security
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500">
                                        Add an extra layer of security to your account.
                                    </p>
                                </div>
                                <button
                                    onClick={toggleTwoFactorAuth}
                                    className={`p-2 rounded-full ${security.twoFactorAuth ? "bg-green-600" : "bg-gray-300"} text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-200`}
                                >
                                    {security.twoFactorAuth ? "On" : "Off"}
                                </button>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                disabled={loading}
                            >
                                <Lock className="w-5 h-5" />
                                Change Password
                            </button>
                            <p className="text-sm text-gray-500 italic">Last changed: {security.passwordLastChanged}</p>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-600">
                            <Bell className="w-6 h-6" />
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(notifications).map(([type, { active, threshold, daysBefore, frequency }]) => (
                                <div key={type} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-medium">{type.replace(/([A-Z])/g, " $1").trim()}</h3>
                                        <button
                                            onClick={handleNotificationChange(type, 'active')}
                                            className={`p-2 rounded-full ${active ? "bg-green-600" : "bg-gray-300"} text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-green-200`}
                                        >
                                            {active ? "On" : "Off"}
                                        </button>
                                    </div>
                                    {active && (
                                        <>
                                            {type === "internetUsageAlerts" && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Usage Threshold</label>
                                                    <select
                                                        onChange={handleNotificationChange(type, 'threshold')}
                                                        value={threshold}
                                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                                    >
                                                        <option value="80%">80%</option>
                                                        <option value="90%">90%</option>
                                                        <option value="100%">100%</option>
                                                    </select>
                                                </div>
                                            )}
                                            {type === "subscriptionReminders" && (
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Remind Before</label>
                                                    <select
                                                        onChange={handleNotificationChange(type, 'daysBefore')}
                                                        value={daysBefore}
                                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                                    >
                                                        <option value="3">3 Days</option>
                                                        <option value="7">7 Days</option>
                                                        <option value="14">14 Days</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Frequency</label>
                                                <select
                                                    onChange={handleNotificationChange(type, 'frequency')}
                                                    value={frequency}
                                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="as-it-happens">As It Happens</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {isPasswordModalOpen && <PasswordModal />}
        </div>
    );
};

export default AccountSettings;
