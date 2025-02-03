import React, { useState, useCallback } from "react";
import {
    User,
    Lock,
    Shield,
    Bell,
    Mail,
    Smartphone,
    Key
} from "lucide-react";

const AccountSettings = () => {
    const [profile, setProfile] = useState({
        name: "Clinton Odongo",
        username: "clintonOdongo",
        email: "admin@interlink.com",
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isEnabling2FA, setIsEnabling2FA] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [twoFAForm, setTwoFAForm] = useState({
        code: ""
    });

    const [errorMessages, setErrorMessages] = useState({
        name: "",
        username: "",
        email: "",
    });

    const handleProfileUpdate = useCallback(async () => {
        try {
            let errors = {};
            if (!profile.name.trim()) errors.name = "Name is required";
            if (!profile.username.trim()) errors.username = "Username is required";
            if (!/\S+@\S+\.\S+/.test(profile.email)) errors.email = "Invalid email address";

            if (Object.keys(errors).length > 0) {
                setErrorMessages(errors);
                return;
            }

            const response = await fetch('/api/settings/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profile),
            });
            const data = await response.json();
            if (response.ok) {
                console.log("Profile updated:", data);
                alert("Profile updated successfully!");
                setErrorMessages({ name: "", username: "", email: "" });
            } else {
                console.error("Profile update failed:", data);
                alert("Failed to update profile: " + data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating profile.");
        }
    }, [profile]);

    const handlePasswordChange = useCallback(async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match!");
            return;
        }

        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            alert("Please fill in all password fields.");
            return;
        }

        try {
            const response = await fetch('/api/settings/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordForm),
            });
            const data = await response.json();
            if (response.ok) {
                console.log("Password changed successfully:", data);
                alert("Password changed successfully!");
            } else {
                console.error("Password change failed:", data);
                alert("Failed to change password: " + data.message);
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("An error occurred while changing the password.");
        }
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }, [passwordForm]);

    const handle2FAEnable = useCallback(async () => {
        try {
            const response = await fetch('/api/settings/enable-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(twoFAForm),
            });
            const data = await response.json();
            if (response.ok) {
                console.log("2FA enabled:", data);
                alert("Two-factor authentication enabled successfully!");
            } else {
                console.error("Failed to enable 2FA:", data);
                alert("Failed to enable 2FA: " + data.message);
            }
        } catch (error) {
            console.error("Error enabling 2FA:", error);
            alert("An error occurred while enabling 2FA.");
        }
        setIsEnabling2FA(false);
        setTwoFAForm({ code: "" });
    }, [twoFAForm]);

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <main className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">Account Settings</h1>
                    <p className="text-lg text-gray-500">Manage your profile and security settings here.</p>
                </header>

                <div className="space-y-10">

                    {/* Profile Information */}
                    <section className="bg-gray-50 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center text-indigo-600">
                            <User className="w-7 h-7 mr-2" />
                            Profile Information
                        </h2>
                        <div className="space-y-6">
                            {["name", "username", "email"].map((field) => (
                                <div key={field}>
                                    <label htmlFor={field} className="block text-sm font-medium mb-2 capitalize">
                                        {field.replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    <input
                                        id={field}
                                        type={field === "email" ? "email" : "text"}
                                        value={profile[field]}
                                        onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                                        className={`w-full p-4 border rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-300 ${errorMessages[field] ? 'border-red-500' : ''}`}
                                        placeholder={`Enter your ${field}`}
                                    />
                                    {errorMessages[field] && <p className="text-xs text-red-500 mt-1">{errorMessages[field]}</p>}
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleProfileUpdate}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                >
                                    Update Profile
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Security Settings */}
                    <section className="bg-gray-50 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6 flex items-center text-red-600">
                            <Lock className="w-7 h-7 mr-2" />
                            Security
                        </h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsChangingPassword(!isChangingPassword)}
                                className="w-full bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <Key className="w-5 h-5" />
                                Change Password
                            </button>
                            <button
                                onClick={() => setIsEnabling2FA(!isEnabling2FA)}
                                className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <Shield className="w-5 h-5" />
                                Enable Two-Factor Authentication
                            </button>
                        </div>
                    </section>
                </div>

                {/* Password Change Modal */}
                {isChangingPassword && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
                            <h3 className="text-xl font-semibold mb-4 flex items-center text-red-600">
                                <Lock className="w-6 h-6 mr-2" />
                                Change Password
                            </h3>
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
                                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').trim()}`}
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsChangingPassword(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
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

                {/* 2FA Enable Modal */}
                {isEnabling2FA && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
                            <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-600">
                                <Shield className="w-6 h-6 mr-2" />
                                Enable Two-Factor Authentication
                            </h3>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                                    Authentication Code
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    name="code"
                                    value={twoFAForm.code}
                                    onChange={(e) => setTwoFAForm({ code: e.target.value })}
                                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Enter the code from your authenticator app"
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsEnabling2FA(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handle2FAEnable}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Enable
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AccountSettings;