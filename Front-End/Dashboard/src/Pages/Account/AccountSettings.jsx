import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    Bell,
    Lock,
    RefreshCcw,
    File,
    FileText,
    Trash,
    Key,
    UserCheck,
    Database,
    GitBranch,
    Bolt,
    Eye,
    EyeOff,
} from "lucide-react";

const AccountSettings = () => {
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [notificationPreference, setNotificationPreference] = useState('all');
    const [apiKeys, setApiKeys] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [backupStatus, setBackupStatus] = useState('Not Started');
    const [showSensitiveData, setShowSensitiveData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Simulating API calls
            setApiKeys([
                { id: 1, name: "Billing Integration", key: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
                { id: 2, name: "User Management", key: "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy" },
            ]);
            setAuditLogs([
                { id: 1, action: "Login", timestamp: "2023-10-01T12:00:00Z", user: "Admin" },
                { id: 2, action: "Profile Update", timestamp: "2023-10-02T09:30:00Z", user: "Support" },
            ]);
        };
        fetchData();
    }, []);

    const toggleTwoFA = () => setTwoFAEnabled(!twoFAEnabled);
    const handleNotificationChange = (event) => setNotificationPreference(event.target.value);

    const handleApiKeyRegeneration = (id) => {
        setApiKeys(apiKeys.map(key =>
            key.id === id ? { ...key, key: "new-generated-key-" + Math.random().toString(36).substr(2, 9) } : key
        ));
    };

    const handleBackupNow = () => {
        setBackupStatus('In Progress');
        setTimeout(() => setBackupStatus('Completed'), 5000);
    };

    const toggleSensitiveData = () => setShowSensitiveData(!showSensitiveData);

    return (
        <div className="bg-gradient-to-br from-gray-100 to-blue-100 min-h-screen p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6">
                    Account Settings Dashboard
                </h1>

                {/* Security Settings */}
                <section className="bg-indigo-50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                        <ShieldCheck className="mr-2 text-indigo-600" /> Security Fortress
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-lg font-medium text-gray-700">Two-Factor Authentication</label>
                            <input type="checkbox" checked={twoFAEnabled} onChange={toggleTwoFA} className="form-checkbox h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex items-center">
                            <RefreshCcw className="text-gray-500 mr-2" />
                            <button className="text-lg text-indigo-600 hover:text-indigo-700">Fortify Your Password</button>
                        </div>
                        <div className="flex items-center">
                            <Key className="text-gray-500 mr-2" />
                            <button className="text-lg text-indigo-600 hover:text-indigo-700">Master API Keys</button>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-yellow-50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                        <Bell className="mr-2 text-yellow-600" /> Notification Hub
                    </h2>
                    <div className="space-y-4">
                        <label className="text-lg font-medium text-gray-700">Alert Preferences</label>
                        <select onChange={handleNotificationChange} value={notificationPreference} className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                            <option value="all">Galactic Broadcast</option>
                            <option value="important">Critical Alerts Only</option>
                            <option value="none">Silent Mode</option>
                        </select>
                    </div>
                </section>

                {/* API Keys */}
                <section className="bg-green-50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                        <Key className="mr-2 text-green-600" /> API Key Vault
                    </h2>
                    <div className="space-y-4">
                        {apiKeys.map((key) => (
                            <div key={key.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                                <div>
                                    <p className="text-lg font-medium">{key.name}</p>
                                    <p className="text-sm text-gray-500">{showSensitiveData ? key.key : key.key.slice(0, 10) + '...'}
                                        <button onClick={toggleSensitiveData} className="ml-2 text-xs">
                                            {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </p>
                                </div>
                                <button onClick={() => handleApiKeyRegeneration(key.id)} className="px-4 py-2 text-sm bg-red-500 text-white rounded-full hover:bg-red-600">
                                    Regenerate
                                </button>
                            </div>
                        ))}
                        <button className="px-4 py-2 text-lg bg-green-500 text-white rounded-full hover:bg-green-600">Forge New Key</button>
                    </div>
                </section>

                {/* Audit Logs */}
                <section className="bg-blue-50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                        <UserCheck className="mr-2 text-blue-600" /> Audit Trail
                    </h2>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="p-3 bg-white rounded-lg shadow-sm">
                                <p className="text-sm">
                                    <span className="font-semibold">{log.action}</span> by {log.user} at {new Date(log.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-pink-50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-pink-800 mb-4 flex items-center">
                        <Database className="mr-2 text-pink-600" /> Data Sanctuary
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <FileText className="text-gray-500 mr-2" />
                            <button className="text-lg text-pink-600 hover:text-pink-700">Extract Data</button>
                        </div>
                        <div className="flex items-center">
                            <GitBranch className="text-gray-500 mr-2" />
                            <button onClick={handleBackupNow} className="text-lg text-pink-600 hover:text-pink-700">Backup Now</button>
                            <span className="ml-2 text-lg font-medium text-gray-700">{backupStatus}</span>
                        </div>
                        <div className="flex items-center">
                            <Trash className="text-gray-500 mr-2" />
                            <button className="text-lg text-red-600 hover:text-red-700">Erase Account</button>
                        </div>
                    </div>
                </section>

                {/* Legal */}
                <section className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <File className="mr-2 text-gray-600" /> Legal Archives
                    </h2>
                    <div className="space-y-4">
                        <a href="/terms" className="text-lg text-indigo-600 hover:text-indigo-700 flex items-center">
                            <FileText className="mr-2" /> Terms of Service
                        </a>
                        <a href="/privacy" className="text-lg text-indigo-600 hover:text-indigo-700 flex items-center">
                            <FileText className="mr-2" /> Privacy Policy
                        </a>
                    </div>
                </section>

                <div className="text-center mt-6">
                    <Bolt className="w-10 h-10 inline-block text-yellow-500 animate-pulse" />
                    <p className="text-xl font-medium text-gray-600">Empower Your Admin Experience</p>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;