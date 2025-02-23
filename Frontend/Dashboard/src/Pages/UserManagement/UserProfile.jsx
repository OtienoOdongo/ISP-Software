

import React, { useState, useCallback, useEffect } from "react";
import {
  Users,
  WifiHigh,
  CheckCircle,
  Clock,
  Ban,
  HelpCircle
} from "lucide-react";

const mockUsers = [
  {
    id: 1,
    name: "Ken Opiyo",
    phone: "+254701234567",
    lastLogin: "2025-01-12T14:30:00Z",
    active: true,
    dataUsage: { used: 20, total: 100, unit: "GB" },
    paymentStatus: "Paid",
    subscription: {
      plan: "Premium",
      startDate: "2025-01-01",
      expiryDate: "2025-02-01",
    },
  },
  {
    id: 2,
    name: "Lenox Kamari",
    phone: "+254712345678",
    lastLogin: "2025-01-11T12:00:00Z",
    active: false,
    dataUsage: { used: 15, total: 30, unit: "GB" },
    paymentStatus: "Pending",
    subscription: {
      plan: "Plus",
      startDate: "2025-01-05",
      expiryDate: "2025-02-05",
    },
  },
  {
    id: 3,
    name: "Lucy Wange",
    phone: "+25474567890",
    lastLogin: "2025-01-11T12:00:00Z",
    active: false,
    dataUsage: { used: 9.9, total: 10, unit: "GB" },
    paymentStatus: "Paid",
    subscription: {
      plan: "Basic",
      startDate: "2025-01-05",
      expiryDate: "2025-02-05",
    },
  },
];

const UserProfile = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
  }, [users]);

  const handleSuspend = useCallback(() => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === selectedUser.id ? { ...user, active: !user.active } : user
      )
    );
    setSelectedUser(prev => ({ ...prev, active: !prev.active }));
  }, [selectedUser, users]);

  const formatDateTime = useCallback((dateTime) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateTime).toLocaleDateString("en-US", options);
  }, []);

  // Use useEffect to set the initial selected user from local storage if available
  useEffect(() => {
    const storedUser = localStorage.getItem("selectedUser");
    if (storedUser) {
      setSelectedUser(JSON.parse(storedUser));
    }
  }, []);

  // Save selected user to local storage when changed
  useEffect(() => {
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
  }, [selectedUser]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={handleSearch}
          className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          aria-label="Search for users"
        />
        <select
          value={selectedUser.id}
          onChange={(e) => handleUserSelect(Number(e.target.value))}
          className="absolute right-0 top-0 px-4 py-2 border-l border-gray-300 rounded-r-lg
           bg-white focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer"
        >
          <option  value="" disabled>Select User</option>
          {filteredUsers.map((user) => (
            <option  key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {/* User Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h1>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Profile Details</h2>
          <p className="text-sm text-gray-600">
            <span className="font-bold mr-2">Phone:</span> {selectedUser.phone}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-bold mr-2">Status:</span>
            <span className={selectedUser.active ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {selectedUser.active ? "Active" : "Suspended"}
            </span>
          </p>
        </div>

        {/* Activity */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Activity</h2>
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-9 h-9 text-orange-500" />
            <p className="text-sm text-gray-600">
              <span className="font-bold mr-2">Last Login:</span> {formatDateTime(selectedUser.lastLogin)}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-bold mr-2">User Logins:</span> 10 times this month
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-bold mr-2">Recent Activity:</span> Updated plan 2 days ago
          </p>
        </div>
      </div>

      {/* Data Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Data Usage</h2>
          <div className="flex items-center space-x-2 mb-2">
            <WifiHigh className="w-11 h-11 text-blue-500" />
            <p className="text-sm text-gray-600">
              <span className="font-bold mr-2">Usage:</span>
              {selectedUser.dataUsage.total === 'unlimited' ? 'Unlimited' :
                `${selectedUser.dataUsage.used} / ${selectedUser.dataUsage.total}${selectedUser.dataUsage.unit} (${Math.round((selectedUser.dataUsage.used / selectedUser.dataUsage.total) * 100)}% used)`}
            </p>
          </div>
          <div className="h-2 bg-gray-200 rounded-full w-full">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${selectedUser.dataUsage.total === 'unlimited' ? 0 : (selectedUser.dataUsage.used / selectedUser.dataUsage.total) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Payment Status</h2>
          <div className="flex items-center space-x-2 mb-2">
            {selectedUser.paymentStatus === "Paid" ? (
              <CheckCircle className="w-9 h-9 text-green-500" />
            ) : (
              <HelpCircle className="w-9 h-9 text-red-500" />
            )}
            <p className="text-sm text-gray-600">
              <span className="font-bold mr-2">Status:</span> {selectedUser.paymentStatus}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-bold mr-2">Last Payment:</span> {formatDateTime("2025-01-01T00:00:00Z")}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-bold mr-2">Next Payment Due:</span> {formatDateTime("2025-02-01T00:00:00Z")}
          </p>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Subscription</h2>
        <p className="text-sm text-gray-600">
          <span className="font-bold mr-2" style={{ color: selectedUser.subscription.plan === "Premium" ? "#FFD700" : selectedUser.subscription.plan === "Plus" ? "#FF4500" : "#008000" }}>Plan:</span> {selectedUser.subscription.plan}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-bold mr-2">Start Date:</span> {formatDateTime(selectedUser.subscription.startDate)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-bold mr-2">Expiry Date:</span> {formatDateTime(selectedUser.subscription.expiryDate)}
        </p>
      </div>

      {/* Suspend User Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSuspend}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Ban size={20} className="inline-block mr-2" />
          Suspend
        </button>
      </div>
    </div>
  );
};

export default UserProfile;