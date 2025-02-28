// import React, { useState, useCallback } from "react";
// import { Lock, Bell, Key, Users, Copy, Loader } from "lucide-react";
// import avatar from "../../assets/avatar.png";

// const AccountSettings = () => {
//     const [profile, setProfile] = useState({
//         name: "Clinton Odongo",
//         email: "admin@interlink.com",
//         profilePic: "",
//     });
//     const [password, setPassword] = useState({
//         currentPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//     });
//     const [notifications, setNotifications] = useState({
//         emailAlerts: true,
//         paymentAlerts: true,
//         systemAlerts: false,
//     });
//     const [apiKey, setApiKey] = useState("mock-api-key-12345"); // Mock API key
//     const [isEditingProfile, setIsEditingProfile] = useState(false);
//     const [isChangingPassword, setIsChangingPassword] = useState(false);
//     const [tempProfile, setTempProfile] = useState({ ...profile });
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [passwordStrength, setPasswordStrength] = useState(0);

//     // Handle profile picture upload
//     const handleFileUpload = useCallback((e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setTempProfile((prev) => ({ ...prev, profilePic: reader.result }));
//             };
//             reader.readAsDataURL(file);
//         }
//     }, []);

//     // Handle profile edit toggle
//     const handleEditProfileToggle = () => {
//         setIsEditingProfile(!isEditingProfile);
//         if (!isEditingProfile) setTempProfile({ ...profile });
//     };

//     // Save profile changes (mock for now)
//     const handleSaveProfile = async () => {
//         setIsLoading(true);
//         setError("");
//         try {
//             // Simulate API call
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             setProfile({ ...tempProfile });
//             setIsEditingProfile(false);
//             console.log("Profile updated:", tempProfile);
//             alert("Profile updated successfully!");
//         } catch (err) {
//             setError("Failed to update profile. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Handle profile input changes
//     const handleProfileChange = (e) => {
//         const { name, value } = e.target;
//         setTempProfile((prev) => ({ ...prev, [name]: value }));
//     };

//     // Handle password input changes with strength calculation
//     const handlePasswordChange = (e) => {
//         const { name, value } = e.target;
//         setPassword((prev) => ({ ...prev, [name]: value }));
//         if (name === "newPassword") {
//             setPasswordStrength(calculatePasswordStrength(value));
//         }
//     };

//     // Calculate password strength
//     const calculatePasswordStrength = (password) => {
//         let strength = 0;
//         if (password.length >= 8) strength += 1;
//         if (/[A-Z]/.test(password)) strength += 1;
//         if (/[0-9]/.test(password)) strength += 1;
//         if (/[^A-Za-z0-9]/.test(password)) strength += 1;
//         return strength;
//     };

//     // Save password (mock for now, compatible with Djoser)
//     const handleSavePassword = async () => {
//         if (password.newPassword !== password.confirmPassword) {
//             setError("New passwords don't match!");
//             return;
//         }
//         if (!password.currentPassword || !password.newPassword) {
//             setError("Please fill all password fields!");
//             return;
//         }
//         setIsLoading(true);
//         setError("");
//         try {
//             // Simulate API call
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             console.log("Password change request:", password);
//             alert("Password changed successfully!");
//             setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
//             setIsChangingPassword(false);
//         } catch (err) {
//             setError("Failed to change password. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Handle notification toggles
//     const handleNotificationChange = (e) => {
//         const { name, checked } = e.target;
//         setNotifications((prev) => ({ ...prev, [name]: checked }));
//     };

//     // Save notification settings (mock for now)
//     const handleSaveNotifications = async () => {
//         setIsLoading(true);
//         setError("");
//         try {
//             // Simulate API call
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             console.log("Notification settings saved:", notifications);
//             alert("Notification settings updated!");
//         } catch (err) {
//             setError("Failed to save notification settings. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Generate new API key (mock for now)
//     const handleGenerateApiKey = async () => {
//         if (!window.confirm("Are you sure you want to generate a new API key? This will invalidate the current key.")) {
//             return;
//         }
//         setIsLoading(true);
//         setError("");
//         try {
//             // Simulate API call
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             const newKey = `mock-api-key-${Math.random().toString(36).substring(2, 15)}`;
//             setApiKey(newKey);
//             console.log("New API key generated:", newKey);
//             alert("New API key generated!");
//         } catch (err) {
//             setError("Failed to generate API key. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Copy API key to clipboard
//     const handleCopyApiKey = () => {
//         navigator.clipboard.writeText(apiKey);
//         alert("API key copied to clipboard!");
//     };

//     return (
//         <div className="min-h-screen bg-gray-100 p-8">
//             <main className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
//                 <header className="mb-8 text-center">
//                     <h1 className="text-4xl font-bold text-gray-800">Account Settings</h1>
//                     <p className="text-gray-500 mt-2">Manage your Interlink admin account</p>
//                 </header>

//                 {/* Profile Section */}
//                 <section className="mb-10">
//                     <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                         <Users className="w-6 h-6 text-indigo-600" /> Profile
//                     </h2>
//                     <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//                         <div className="flex flex-col sm:flex-row items-center gap-6">
//                             <div className="relative w-20 h-20">
//                                 <img
//                                     src={profile.profilePic || avatar}
//                                     alt="Profile"
//                                     className="w-full h-full rounded-full object-cover border-2 border-indigo-300"
//                                 />
//                                 {isEditingProfile && (
//                                     <label
//                                         htmlFor="profile-pic-upload"
//                                         className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700"
//                                     >
//                                         <Key className="w-4 h-4" />
//                                         <input
//                                             type="file"
//                                             id="profile-pic-upload"
//                                             className="hidden"
//                                             onChange={handleFileUpload}
//                                             accept="image/*"
//                                         />
//                                     </label>
//                                 )}
//                             </div>
//                             <div className="flex-1 space-y-4">
//                                 {isEditingProfile ? (
//                                     <>
//                                         <input
//                                             type="text"
//                                             name="name"
//                                             value={tempProfile.name}
//                                             onChange={handleProfileChange}
//                                             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//                                             placeholder="Full Name"
//                                         />
//                                         <input
//                                             type="email"
//                                             name="email"
//                                             value={tempProfile.email}
//                                             onChange={handleProfileChange}
//                                             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//                                             placeholder="Email Address"
//                                         />
//                                     </>
//                                 ) : (
//                                     <>
//                                         <p className="text-lg font-medium text-gray-800">{profile.name}</p>
//                                         <p className="text-gray-600">{profile.email}</p>
//                                     </>
//                                 )}
//                                 <div className="flex gap-4">
//                                     {isEditingProfile ? (
//                                         <>
//                                             <button
//                                                 onClick={handleSaveProfile}
//                                                 className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
//                                                 disabled={isLoading}
//                                             >
//                                                 {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
//                                             </button>
//                                             <button
//                                                 onClick={handleEditProfileToggle}
//                                                 className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
//                                                 disabled={isLoading}
//                                             >
//                                                 Cancel
//                                             </button>
//                                         </>
//                                     ) : (
//                                         <button
//                                             onClick={handleEditProfileToggle}
//                                             className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
//                                         >
//                                             Edit Profile
//                                         </button>
//                                     )}
//                                 </div>
//                                 {error && isEditingProfile && <p className="text-sm text-red-500">{error}</p>}
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* Password Management */}
//                 <section className="mb-10">
//                     <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                         <Lock className="w-6 h-6 text-red-600" /> Password
//                     </h2>
//                     {isChangingPassword ? (
//                         <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Current Password</label>
//                                 <input
//                                     type="password"
//                                     name="currentPassword"
//                                     value={password.currentPassword}
//                                     onChange={handlePasswordChange}
//                                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">New Password</label>
//                                 <input
//                                     type="password"
//                                     name="newPassword"
//                                     value={password.newPassword}
//                                     onChange={handlePasswordChange}
//                                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
//                                 />
//                                 <div className="mt-2">
//                                     <div className="w-full bg-gray-200 rounded-full h-2">
//                                         <div
//                                             className={`h-2 rounded-full ${passwordStrength === 0
//                                                     ? "bg-red-500"
//                                                     : passwordStrength === 1
//                                                         ? "bg-yellow-500"
//                                                         : passwordStrength === 2
//                                                             ? "bg-orange-500"
//                                                             : "bg-green-500"
//                                                 }`}
//                                             style={{ width: `${(passwordStrength / 4) * 100}%` }}
//                                         ></div>
//                                     </div>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                         Password strength: {passwordStrength === 0 ? "Weak" : passwordStrength === 1 ? "Fair" : passwordStrength === 2 ? "Good" : "Strong"}
//                                     </p>
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
//                                 <input
//                                     type="password"
//                                     name="confirmPassword"
//                                     value={password.confirmPassword}
//                                     onChange={handlePasswordChange}
//                                     className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
//                                 />
//                             </div>
//                             {error && <p className="text-sm text-red-500">{error}</p>}
//                             <div className="flex gap-4">
//                                 <button
//                                     onClick={handleSavePassword}
//                                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
//                                     disabled={isLoading}
//                                 >
//                                     {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Password"}
//                                 </button>
//                                 <button
//                                     onClick={() => setIsChangingPassword(false)}
//                                     className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
//                                     disabled={isLoading}
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <button
//                             onClick={() => setIsChangingPassword(true)}
//                             className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
//                         >
//                             <Lock className="w-5 h-5" /> Change Password
//                         </button>
//                     )}
//                 </section>

//                 {/* Notification Preferences */}
//                 <section className="mb-10">
//                     <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                         <Bell className="w-6 h-6 text-blue-600" /> Notifications
//                     </h2>
//                     <div className="bg-gray-50 p-6 rounded-lg shadow-sm space-y-4">
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 name="emailAlerts"
//                                 checked={notifications.emailAlerts}
//                                 onChange={handleNotificationChange}
//                                 className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                             />
//                             <label className="text-sm font-medium text-gray-700">Email Alerts</label>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 name="paymentAlerts"
//                                 checked={notifications.paymentAlerts}
//                                 onChange={handleNotificationChange}
//                                 className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                             />
//                             <label className="text-sm font-medium text-gray-700">Payment Alerts</label>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <input
//                                 type="checkbox"
//                                 name="systemAlerts"
//                                 checked={notifications.systemAlerts}
//                                 onChange={handleNotificationChange}
//                                 className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                             />
//                             <label className="text-sm font-medium text-gray-700">System Alerts (e.g., Router Status)</label>
//                         </div>
//                         {error && !isEditingProfile && !isChangingPassword && <p className="text-sm text-red-500">{error}</p>}
//                         <button
//                             onClick={handleSaveNotifications}
//                             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                             disabled={isLoading}
//                         >
//                             {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Notification Settings"}
//                         </button>
//                     </div>
//                 </section>

//                 {/* API Key Management */}
//                 <section>
//                     <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
//                         <Key className="w-6 h-6 text-green-600" /> API Key
//                     </h2>
//                     <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
//                         <div className="flex flex-col sm:flex-row items-center gap-4">
//                             <input
//                                 type="text"
//                                 value={apiKey}
//                                 readOnly
//                                 className="w-full sm:flex-1 p-2 border rounded-lg bg-gray-200 text-gray-700"
//                             />
//                             <div className="flex gap-4 w-full sm:w-auto">
//                                 <button
//                                     onClick={handleCopyApiKey}
//                                     className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
//                                 >
//                                     <Copy className="w-5 h-5" /> Copy
//                                 </button>
//                                 <button
//                                     onClick={handleGenerateApiKey}
//                                     className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
//                                     disabled={isLoading}
//                                 >
//                                     {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Generate New Key"}
//                                 </button>
//                             </div>
//                         </div>
//                         <p className="text-sm text-gray-500 mt-2">
//                             Use this key to integrate with Mikrotik or MPesa APIs.
//                         </p>
//                         {error && !isEditingProfile && !isChangingPassword && <p className="text-sm text-red-500 mt-2">{error}</p>}
//                     </div>
//                 </section>
//             </main>
//         </div>
//     );
// };

// export default AccountSettings;







import React, { useState, useEffect, useCallback } from "react";
import { Lock, Bell, Key, Users, Copy, Loader } from "lucide-react";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import avatar from "../../assets/avatar.png";

const AccountSettings = () => {
    const { isAuthenticated } = useAuth();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        profilePic: "",
    });
    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        paymentAlerts: true,
        systemAlerts: false,
    });
    const [apiKey, setApiKey] = useState("");
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!isAuthenticated) {
                setError("Please log in to view settings.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await api.get("/api/account/settings/");
                setProfile({
                    name: response.data.name || "",
                    email: response.data.email || "",
                    profilePic: response.data.profile_pic || "",
                });
                setNotifications({
                    emailAlerts: response.data.email_alerts ?? true,
                    paymentAlerts: response.data.payment_alerts ?? true,
                    systemAlerts: response.data.system_alerts ?? false,
                });
                setApiKey(response.data.api_key || "");
                setError(null);
            } catch (err) {
                setError("Failed to load settings.");
                console.error("Fetch error:", err.response?.data || err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [isAuthenticated]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setTempProfile((prev) => ({ ...prev, profilePic: file }));
        }
    }, []);

    const handleEditProfileToggle = () => {
        setIsEditingProfile(!isEditingProfile);
        if (!isEditingProfile) setTempProfile({ ...profile });
        setError("");
        setSuccess("");
    };

    const handleSaveProfile = async () => {
        if (!isAuthenticated) {
            setError("Please log in to update your profile.");
            return;
        }
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            const formData = new FormData();
            formData.append("name", tempProfile.name || profile.name);
            if (tempProfile.profilePic instanceof File) {
                formData.append("profile_pic", tempProfile.profilePic);
            }

            const response = await api.put("/api/account/settings/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setProfile({
                name: response.data.name || "",
                email: response.data.email || "",
                profilePic: response.data.profile_pic || "",
            });
            setIsEditingProfile(false);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError("Failed to update profile. Please try again.");
            console.error("Save error:", err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setTempProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPassword((prev) => ({ ...prev, [name]: value }));
        if (name === "newPassword") {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const handleSavePassword = async () => {
        if (!isAuthenticated) {
            setError("Please log in to change your password.");
            return;
        }
        if (password.newPassword !== password.confirmPassword) {
            setError("New passwords don't match!");
            return;
        }
        if (!password.currentPassword || !password.newPassword) {
            setError("Please fill all password fields!");
            return;
        }
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            await api.post("/api/auth/users/set_password/", {
                current_password: password.currentPassword,
                new_password: password.newPassword,
            });
            setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setIsChangingPassword(false);
            setSuccess("Password changed successfully!");
        } catch (err) {
            setError("Failed to change password. Please try again.");
            console.error("Password error:", err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSaveNotifications = async () => {
        if (!isAuthenticated) {
            setError("Please log in to save notifications.");
            return;
        }
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await api.put("/api/account/settings/", {
                email_alerts: notifications.emailAlerts,
                payment_alerts: notifications.paymentAlerts,
                system_alerts: notifications.systemAlerts,
            });
            setNotifications({
                emailAlerts: response.data.email_alerts ?? true,
                paymentAlerts: response.data.payment_alerts ?? true,
                systemAlerts: response.data.system_alerts ?? false,
            });
            setSuccess("Notification settings updated!");
        } catch (err) {
            setError("Failed to save notification settings. Please try again.");
            console.error("Notification error:", err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateApiKey = async () => {
        if (!isAuthenticated) {
            setError("Please log in to generate an API key.");
            return;
        }
        if (!window.confirm("Are you sure you want to generate a new API key? This will invalidate the current key.")) {
            return;
        }
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await api.patch("/api/account/settings/", {
                action: "generate_api_key",
            });
            setApiKey(response.data.api_key || "");
            setSuccess("New API key generated!");
        } catch (err) {
            setError("Failed to generate API key. Please try again.");
            console.error("API key error:", err.response?.data || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        setSuccess("API key copied to clipboard!");
        setTimeout(() => setSuccess(""), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
                    <p className="mt-2 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
                <p className="text-center text-red-400 text-lg">Please log in to access account settings.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
            <main className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 space-y-8">
                <header className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
                        Account Settings
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm sm:text-base">
                        Manage your Interlink admin account
                    </p>
                </header>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                        {success}
                    </div>
                )}

                <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" /> Profile
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                            <img
                                src={
                                    profile.profilePic
                                        ? `${import.meta.env.VITE_API_URL}${profile.profilePic}`
                                        : avatar
                                }
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-2 border-indigo-300"
                            />
                            {isEditingProfile && (
                                <label
                                    htmlFor="profile-pic-upload"
                                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
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
                                <input
                                    type="text"
                                    name="name"
                                    value={tempProfile.name || ""}
                                    onChange={handleProfileChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                                    placeholder="Full Name"
                                />
                            ) : (
                                <>
                                    <p className="text-lg sm:text-xl font-medium text-gray-800">{profile.name}</p>
                                    <p className="text-gray-600 text-sm sm:text-base">{profile.email}</p>
                                </>
                            )}
                            <div className="flex gap-4">
                                {isEditingProfile ? (
                                    <>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
                                        </button>
                                        <button
                                            onClick={handleEditProfileToggle}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleEditProfileToggle}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-red-600" /> Password
                    </h2>
                    {isChangingPassword ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={password.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={password.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
                                />
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${passwordStrength === 0
                                                ? "bg-red-500"
                                                : passwordStrength === 1
                                                    ? "bg-yellow-500"
                                                    : passwordStrength === 2
                                                        ? "bg-orange-500"
                                                        : "bg-green-500"
                                                }`}
                                            style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Strength: {passwordStrength === 0 ? "Weak" : passwordStrength === 1 ? "Fair" : passwordStrength === 2 ? "Good" : "Strong"}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={password.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-700"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSavePassword}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Password"}
                                </button>
                                <button
                                    onClick={() => setIsChangingPassword(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                        >
                            <Lock className="w-5 h-5" /> Change Password
                        </button>
                    )}
                </section>

                <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-blue-600" /> Notifications
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="emailAlerts"
                                checked={notifications.emailAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700">Email Alerts</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="paymentAlerts"
                                checked={notifications.paymentAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700">Payment Alerts</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="systemAlerts"
                                checked={notifications.systemAlerts}
                                onChange={handleNotificationChange}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700">System Alerts (e.g., Router Status)</label>
                        </div>
                        <button
                            onClick={handleSaveNotifications}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Save Notification Settings"}
                        </button>
                    </div>
                </section>

                <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Key className="w-6 h-6 text-green-600" /> API Key
                    </h2>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                                type="text"
                                value={apiKey}
                                readOnly
                                className="w-full sm:flex-1 p-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 text-sm font-mono"
                            />
                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    onClick={handleCopyApiKey}
                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
                                >
                                    <Copy className="w-5 h-5" /> Copy
                                </button>
                                <button
                                    onClick={handleGenerateApiKey}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Generate New Key"}
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Use this key to integrate with Mikrotik or MPesa APIs.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AccountSettings;