// AccountSettings.jsx
import React, { useState, useEffect } from "react";
import {
    Lock, Bell, Key, LogOut, Copy, Loader, Trash, Download, Eye, EyeOff
} from "lucide-react";
import api from "../../api"
import { useAuth } from "../../context/AuthContext";

// Reusable Section Component
const Section = ({ title, icon: Icon, children }) => (
    <section className="p-6 bg-white rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon className="w-5 h-5 text-indigo-600" /> {title}
        </h2>
        <div className="space-y-4">{children}</div>
    </section>
);

// Reusable Checkbox Component
const Checkbox = ({ label, name, checked, onChange, disabled }) => (
    <div className="flex items-center gap-2">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
        />
        <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
);

const AccountSettings = () => {
    const { isAuthenticated, userDetails, logout } = useAuth();
    const [state, setState] = useState({
        notifications: {
            emailAlerts: true,
            paymentAlerts: true,
            systemAlerts: false,
            securityAlerts: true,
            priorityOnly: false,
            digestFrequency: "daily",
        },
        security: {
            twoFactorEnabled: false,
            sessionTimeout: 30,
            ipWhitelist: "",
            qrCodeUrl: "",
            backupCodes: [],
        },
        apiKey: "",
        activeSessions: [],
        privacy: {
            profileVisible: true,
            optOutAnalytics: false,
        },
    });
    const [loading, setLoading] = useState({
        fetch: false,
        notifications: false,
        security: false,
        apiKey: false,
        sessions: false,
        delete: false,
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            if (!isAuthenticated) return;
            setLoading((prev) => ({ ...prev, fetch: true }));
            try {
                const response = await api.get("/api/account/settings/");
                setState((prev) => ({
                    ...prev,
                    notifications: {
                        emailAlerts: response.data.email_alerts ?? true,
                        paymentAlerts: response.data.payment_alerts ?? true,
                        systemAlerts: response.data.system_alerts ?? false,
                        securityAlerts: response.data.security_alerts ?? true,
                        priorityOnly: response.data.priority_only ?? false,
                        digestFrequency: response.data.digest_frequency ?? "daily",
                    },
                    security: {
                        ...prev.security,
                        twoFactorEnabled: response.data.two_factor_enabled ?? false,
                        sessionTimeout: response.data.session_timeout ?? 30,
                        ipWhitelist: response.data.ip_whitelist ?? "",
                    },
                    apiKey: response.data.api_key ?? "",
                    activeSessions: response.data.active_sessions ?? [],
                    privacy: {
                        profileVisible: response.data.profile_visible ?? true,
                        optOutAnalytics: response.data.opt_out_analytics ?? false,
                    },
                }));
                setError("");
            } catch (err) {
                setError(
                    err.response?.status === 403
                        ? "Forbidden: Admin privileges required."
                        : err.response?.status === 401
                            ? "Unauthorized: Please log in again."
                            : "Failed to load settings."
                );
            } finally {
                setLoading((prev) => ({ ...prev, fetch: false }));
            }
        };
        fetchSettings();
    }, [isAuthenticated]);

    const handleChange = (section, key, value) => {
        setState((prev) => ({
            ...prev,
            [section]: { ...prev[section], [key]: value },
        }));
    };

    const handleSaveNotifications = async () => {
        setLoading((prev) => ({ ...prev, notifications: true }));
        setError("");
        try {
            await api.put("/api/account/settings/", {
                email_alerts: state.notifications.emailAlerts,
                payment_alerts: state.notifications.paymentAlerts,
                system_alerts: state.notifications.systemAlerts,
                security_alerts: state.notifications.securityAlerts,
                priority_only: state.notifications.priorityOnly,
                digest_frequency: state.notifications.digestFrequency,
            });
            setError("");
            alert("Notification settings updated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save notification settings.");
        } finally {
            setLoading((prev) => ({ ...prev, notifications: false }));
        }
    };

    const handleSaveSecurity = async () => {
        setLoading((prev) => ({ ...prev, security: true }));
        setError("");
        try {
            await api.put("/api/account/settings/", {
                two_factor_enabled: state.security.twoFactorEnabled,
                session_timeout: parseInt(state.security.sessionTimeout, 10),
                ip_whitelist: state.security.ipWhitelist,
            });
            if (state.security.twoFactorEnabled && !state.security.qrCodeUrl) {
                const { qr_code_url, backup_codes } = await api.get("/api/account/2fa/setup/");
                setState((prev) => ({
                    ...prev,
                    security: { ...prev.security, qrCodeUrl: qr_code_url, backupCodes: backup_codes },
                }));
            } else if (!state.security.twoFactorEnabled) {
                setState((prev) => ({
                    ...prev,
                    security: { ...prev.security, qrCodeUrl: "", backupCodes: [] },
                }));
            }
            setError("");
            alert("Security settings updated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save security settings.");
        } finally {
            setLoading((prev) => ({ ...prev, security: false }));
        }
    };

    const handleGenerateApiKey = async () => {
        if (!window.confirm("Generating a new API key will invalidate the current one. Continue?")) return;
        setLoading((prev) => ({ ...prev, apiKey: true }));
        setError("");
        try {
            const response = await api.post("/api/account/generate-api-key/");
            setState((prev) => ({ ...prev, apiKey: response.data.api_key }));
            alert("New API key generated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate API key.");
        } finally {
            setLoading((prev) => ({ ...prev, apiKey: false }));
        }
    };

    const handleCopyApiKey = () => {
        navigator.clipboard.writeText(state.apiKey);
        alert("API key copied to clipboard!");
    };

    const handleLogoutSession = async (sessionId) => {
        setLoading((prev) => ({ ...prev, sessions: true }));
        try {
            await api.post("/api/account/sessions/logout/", { session_id: sessionId });
            setState((prev) => ({
                ...prev,
                activeSessions: prev.activeSessions.filter((s) => s.id !== sessionId),
            }));
        } catch (err) {
            setError(err.response?.data?.error || "Failed to log out session.");
        } finally {
            setLoading((prev) => ({ ...prev, sessions: false }));
        }
    };

    const handleLogoutAllSessions = async () => {
        if (!window.confirm("This will log you out of all sessions. Continue?")) return;
        setLoading((prev) => ({ ...prev, sessions: true }));
        try {
            await api.post("/api/account/sessions/logout-all/");
            logout();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to log out all sessions.");
        } finally {
            setLoading((prev) => ({ ...prev, sessions: false }));
        }
    };

    const handleExportData = async () => {
        setLoading((prev) => ({ ...prev, fetch: true }));
        try {
            const response = await api.get("/api/account/data-export/", { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "account_data.zip");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to export data.");
        } finally {
            setLoading((prev) => ({ ...prev, fetch: false }));
        }
    };

    const handleSavePrivacy = async () => {
        setLoading((prev) => ({ ...prev, security: true }));
        try {
            await api.put("/api/account/settings/", {
                profile_visible: state.privacy.profileVisible,
                opt_out_analytics: state.privacy.optOutAnalytics,
            });
            alert("Privacy settings updated!");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save privacy settings.");
        } finally {
            setLoading((prev) => ({ ...prev, security: false }));
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
        setLoading((prev) => ({ ...prev, delete: true }));
        setError("");
        try {
            await api.delete("/api/account/delete/");
            alert("Account deleted successfully!");
            logout();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete account.");
        } finally {
            setLoading((prev) => ({ ...prev, delete: false }));
        }
    };

    if (loading.fetch) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500">Please log in to access settings.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <main className="max-w-4xl mx-auto space-y-6">
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">{error}</div>
                )}

                {/* Notifications */}
                <Section title="Notifications" icon={Bell}>
                    <Checkbox
                        label="Email Alerts (General Updates)"
                        name="emailAlerts"
                        checked={state.notifications.emailAlerts}
                        onChange={(e) => handleChange("notifications", "emailAlerts", e.target.checked)}
                    />
                    <Checkbox
                        label="Payment Alerts"
                        name="paymentAlerts"
                        checked={state.notifications.paymentAlerts}
                        onChange={(e) => handleChange("notifications", "paymentAlerts", e.target.checked)}
                    />
                    <Checkbox
                        label="System Alerts (e.g., Router Status)"
                        name="systemAlerts"
                        checked={state.notifications.systemAlerts}
                        onChange={(e) => handleChange("notifications", "systemAlerts", e.target.checked)}
                    />
                    <Checkbox
                        label="Security Alerts (e.g., Login Attempts)"
                        name="securityAlerts"
                        checked={state.notifications.securityAlerts}
                        onChange={(e) => handleChange("notifications", "securityAlerts", e.target.checked)}
                    />
                    <Checkbox
                        label="High-Priority Only"
                        name="priorityOnly"
                        checked={state.notifications.priorityOnly}
                        onChange={(e) => handleChange("notifications", "priorityOnly", e.target.checked)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notification Digest Frequency</label>
                        <select
                            name="digestFrequency"
                            value={state.notifications.digestFrequency}
                            onChange={(e) => handleChange("notifications", "digestFrequency", e.target.value)}
                            className="mt-1 w-full sm:w-32 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        disabled={loading.notifications}
                    >
                        {loading.notifications ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
                    </button>
                </Section>

                {/* Security */}
                <Section title="Security" icon={Lock}>
                    <Checkbox
                        label="Enable Two-Factor Authentication (2FA)"
                        name="twoFactorEnabled"
                        checked={state.security.twoFactorEnabled}
                        onChange={(e) => handleChange("security", "twoFactorEnabled", e.target.checked)}
                    />
                    {state.security.twoFactorEnabled && state.security.qrCodeUrl && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Scan this QR code with your authenticator app:</p>
                            <img src={state.security.qrCodeUrl} alt="2FA QR Code" className="w-32 h-32" />
                            <p className="text-sm text-gray-600">Backup Codes:</p>
                            <ul className="list-disc pl-5">
                                {state.security.backupCodes.map((code, index) => (
                                    <li key={index} className="text-sm">{code}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                        <input
                            type="number"
                            name="sessionTimeout"
                            value={state.security.sessionTimeout}
                            onChange={(e) => handleChange("security", "sessionTimeout", e.target.value)}
                            min="5"
                            max="1440"
                            className="mt-1 w-full sm:w-24 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">IP Whitelist (comma-separated)</label>
                        <input
                            type="text"
                            name="ipWhitelist"
                            value={state.security.ipWhitelist}
                            onChange={(e) => handleChange("security", "ipWhitelist", e.target.value)}
                            placeholder="e.g., 192.168.1.1, 10.0.0.2"
                            className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handleSaveSecurity}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        disabled={loading.security}
                    >
                        {loading.security ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
                    </button>
                </Section>

                {/* API Key Management */}
                <Section title="API Key" icon={Key}>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            type="text"
                            value={state.apiKey}
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
                                disabled={loading.apiKey}
                            >
                                {loading.apiKey ? <Loader className="w-5 h-5 animate-spin" /> : "Generate"}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Use this key for secure API integrations.</p>
                </Section>

                {/* Active Sessions */}
                <Section title="Active Sessions" icon={LogOut}>
                    {state.activeSessions.length > 0 ? (
                        <>
                            {state.activeSessions.map((session) => (
                                <div key={session.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium">{session.device}</p>
                                        <p className="text-xs text-gray-500">Last active: {new Date(session.last_active).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleLogoutSession(session.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                                        disabled={loading.sessions}
                                    >
                                        Log Out
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleLogoutAllSessions}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 mt-4"
                                disabled={loading.sessions}
                            >
                                {loading.sessions ? <Loader className="w-5 h-5 animate-spin" /> : "Log Out All"}
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">No active sessions found.</p>
                    )}
                </Section>

                {/* Data Export */}
                <Section title="Data Export" icon={Download}>
                    <p className="text-sm text-gray-600">Export all your account data as a ZIP file.</p>
                    <button
                        onClick={handleExportData}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        disabled={loading.fetch}
                    >
                        {loading.fetch ? <Loader className="w-5 h-5 animate-spin" /> : "Export Data"}
                    </button>
                </Section>

                {/* Privacy Settings */}
                <Section title="Privacy Settings" icon={Eye}>
                    <Checkbox
                        label="Profile visible to others"
                        name="profileVisible"
                        checked={state.privacy.profileVisible}
                        onChange={(e) => handleChange("privacy", "profileVisible", e.target.checked)}
                    />
                    <Checkbox
                        label="Opt out of analytics"
                        name="optOutAnalytics"
                        checked={state.privacy.optOutAnalytics}
                        onChange={(e) => handleChange("privacy", "optOutAnalytics", e.target.checked)}
                    />
                    <button
                        onClick={handleSavePrivacy}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                        disabled={loading.security}
                    >
                        {loading.security ? <Loader className="w-5 h-5 animate-spin" /> : "Save"}
                    </button>
                </Section>

                {/* Delete Account */}
                <Section title="Delete Account" icon={Trash}>
                    <p className="text-sm text-gray-600">
                        Permanently remove all your data. This action cannot be undone.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                        disabled={loading.delete}
                    >
                        {loading.delete ? <Loader className="w-5 h-5 animate-spin" /> : "Delete Account"}
                    </button>
                </Section>
            </main>
        </div>
    );
};

export default AccountSettings;