import React, { useState, useEffect } from "react";
import {
  Eye,
  Phone,
  Wifi,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  HardDrive,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  CreditCard,
  Shield,
  Zap,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  BadgeCheck,
  User as UserIcon,
  History,
  Globe,
  Package,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Circle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import api from "../../api"
import { useAuth } from "../../context/AuthContext";
import { FaSpinner } from "react-icons/fa";

const UserProfilePage = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const today = new Date();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [filterYear, setFilterYear] = useState("All");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(3); // Keep 3 users per page for UI
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated) {
        setError("Please log in to view user profiles.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        let allUsers = [];
        let nextUrl = "/api/user_management/profiles/?page_size=50"; // Request 50 users per page for efficiency

        // Fetch all pages of users
        while (nextUrl) {
          const response = await api.get(nextUrl);
          const usersData = response.data.results || response.data;
          allUsers = [...allUsers, ...usersData];
          nextUrl = response.data.next; // Update to next page URL or null
        }

        const enrichedUsers = allUsers.map(enrichUser);
        setUsers(enrichedUsers);
        setSelectedUser(enrichedUsers[0] || null);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, authLoading]);

  // Filter users based on active status
  useEffect(() => {
    let filtered = users;
    if (activeFilter === 'active') {
      filtered = users.filter(user => user.active);
    } else if (activeFilter === 'inactive') {
      filtered = users.filter(user => !user.active);
    }
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [users, activeFilter]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Enrich user data
  const enrichUser = (user) => {
    const expiry = user.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
    const paymentStatus = expiry ? 
      (today < expiry ? "Paid" : today.toDateString() === expiry.toDateString() ? "Due" : "Expired") : 
      "No Plan";

    const isUnlimited = user.data_usage?.total === "unlimited";
    const active = isUnlimited || (user.data_usage?.used < parseFloat(user.data_usage?.total || 0));

    const totalRevenue = user.history?.purchaseHistory?.reduce(
      (sum, purchase) => sum + purchase.amount,
      0
    ) || 0;

    const renewalFrequency = user.history?.purchaseHistory?.length > 1 ?
      `${user.history.purchaseHistory.length} renewals` : "No renewals";

    const firstPurchase = user.history?.purchaseHistory?.length > 0 ?
      new Date(user.history.purchaseHistory[user.history.purchaseHistory.length - 1]?.purchase_date) : null;
    
    const monthsActive = firstPurchase ?
      (today.getFullYear() - firstPurchase.getFullYear()) * 12 +
      (today.getMonth() - firstPurchase.getMonth()) + 1 : 0;
    
    const avgMonthlySpend = totalRevenue / Math.max(monthsActive, 1);

    const loyaltyDuration = firstPurchase ? 
      Math.floor((today - firstPurchase) / ( organizar1000 * 60 * 60 * 24 * 30)) : 0;

    return {
      ...user,
      paymentStatus,
      active,
      isUnlimited,
      totalRevenue,
      renewalFrequency,
      avgMonthlySpend,
      loyaltyDuration,
      hasPlan: !!user.subscription
    };
  };

  const handleView = async (user) => {
    try {
      const response = await api.get(`/api/user_management/profiles/${user.id}/`);
      const enrichedUser = enrichUser(response.data);
      setSelectedUser(enrichedUser);
      setExpandedSection(null);
      setFilterYear("All");
      setSelectedPurchase(null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load user profile.");
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        fullName: selectedUser.full_name,
        phone: selectedUser.phonenumber,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/api/user_management/profiles/${selectedUser.id}/`, {
        full_name: editForm.fullName,
        phonenumber: editForm.phone,
      });
      const enrichedUser = enrichUser(response.data);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? enrichedUser : u))
      );
      setSelectedUser(enrichedUser);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user profile.");
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    setSelectedPurchase(null);
  };

  const DataUsageBar = ({ used, total, isUnlimited }) => {
    if (isUnlimited) {
      return (
        <div className="w-full bg-gradient-to-r from-purple-100 to-blue-100 rounded-full h-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 opacity-70 animate-pulse rounded-full"></div>
        </div>
      );
    }

    const percentage = Math.min((used / parseFloat(total || 1)) * 100, 100);
    let colorClass = "bg-green-500";
    if (percentage > 80) colorClass = "bg-yellow-500";
    if (percentage > 95) colorClass = "bg-red-500";

    return (
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClass} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const DataUsageIcon = ({ used, total, isUnlimited }) => {
    if (isUnlimited) return <Zap className="text-purple-500" size={18} />;
    const percentage = used / parseFloat(total || 1);
    if (percentage < 0.3) return <BatteryFull className="text-green-500" size={18} />;
    if (percentage < 0.7) return <BatteryMedium className="text-yellow-500" size={18} />;
    return <BatteryLow className="text-red-500" size={18} />;
  };

  const PaymentStatusIcon = ({ status }) => {
    switch (status) {
      case "Paid":
        return <BadgeCheck className="text-green-500" size={18} />;
      case "Due":
        return <Clock className="text-yellow-500" size={18} />;
      case "Expired":
        return <AlertTriangle className="text-red-500" size={18} />;
      default:
        return <CreditCard className="text-gray-500" size={18} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = (history) => {
    if (!history?.purchaseHistory) return;
    
    const headers = ["Plan,Purchase Date,Duration,Price,Status,Payment Method,Invoice Number"];
    const rows = history.purchaseHistory.map((purchase) =>
      [
        purchase.plan?.name || "N/A",
        formatDate(purchase.purchase_date),
        purchase.duration || "N/A",
        `$${purchase.amount}`,
        purchase.status || "N/A",
        purchase.payment_method || "N/A",
        purchase.invoice_number || "N/A",
      ].join(",")
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${selectedUser.full_name}_subscription_history.csv`);
    a.click();
  };

  const getFilteredPurchaseHistory = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    if (filterYear === "All") return selectedUser.history.purchaseHistory;
    return selectedUser.history.purchaseHistory.filter(
      (purchase) => new Date(purchase.purchase_date).getFullYear().toString() === filterYear
    );
  };

  const getChartData = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const purchasesByYear = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const year = new Date(purchase.purchase_date).getFullYear();
      if (!purchasesByYear[year]) purchasesByYear[year] = 0;
      purchasesByYear[year] += purchase.amount;
    });
    return Object.keys(purchasesByYear).map((year) => ({
      year,
      revenue: purchasesByYear[year],
    }));
  };

  const getMonthlyChartData = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const monthlyData = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const date = new Date(purchase.purchase_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyData[monthYear]) monthlyData[monthYear] = 0;
      monthlyData[monthYear] += purchase.amount;
    });

    return Object.keys(monthlyData).map((key) => {
      const [year, month] = key.split("-");
      return {
        month: `${new Date(year, month - 1).toLocaleString("default", { month: "short" })} ${year}`,
        revenue: monthlyData[key],
      };
    });
  };

  const getPlanDistributionData = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const planCounts = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const plan = purchase.plan?.name || "Unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    return Object.keys(planCounts).map((plan) => ({
      name: plan,
      value: planCounts[plan],
      color: getPlanColor(plan),
    }));
  };

  const getPaymentMethodData = () => {
    if (!selectedUser?.history?.purchaseHistory) return [];
    const methodCounts = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const method = purchase.payment_method || "Unknown";
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    return Object.keys(methodCounts).map((method) => ({
      name: method,
      value: methodCounts[method],
    }));
  };

  const getPlanColor = (plan) => {
    const colors = {
      Enterprise: "#6366F1",
      Business: "#3B82F6",
      Residential: "#10B981",
      Promotional: "#F59E0B",
      Unknown: "#6B7280",
    };
    return colors[plan] || "#6B7280";
  };

  const getPlanBehavior = () => {
    if (!selectedUser?.history?.purchaseHistory) return { favoritePlan: "N/A", upgrades: 0, planChanges: 0, avgDuration: 0 };
    const planCounts = {};
    selectedUser.history.purchaseHistory.forEach((purchase) => {
      const plan = purchase.plan?.name || "Unknown";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    const favoritePlan = Object.keys(planCounts).reduce(
      (a, b) => (planCounts[a] > planCounts[b] ? a : b),
      selectedUser.history.purchaseHistory[0]?.plan?.name || "N/A"
    );
    const upgrades = selectedUser.history.purchaseHistory.filter(
      (purchase, index) =>
        index > 0 &&
        purchase.amount > selectedUser.history.purchaseHistory[index - 1].amount
    ).length;

    const planChanges = selectedUser.history.purchaseHistory.length - 1;

    const durations = selectedUser.history.purchaseHistory.map((purchase) => {
      if (purchase.duration?.includes("month")) {
        return parseInt(purchase.duration) || 1;
      }
      return 1;
    });
    const avgDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

    return { favoritePlan, upgrades, planChanges, avgDuration };
  };

  const getSpendingTrend = () => {
    if (!selectedUser?.history?.purchaseHistory || selectedUser.history.purchaseHistory.length < 2) return "stable";
    const firstPrice = selectedUser.history.purchaseHistory[0].amount;
    const lastPrice = selectedUser.history.purchaseHistory[selectedUser.history.purchaseHistory.length - 1].amount;
    return lastPrice > firstPrice ? "up" : lastPrice < firstPrice ? "down" : "stable";
  };

  const viewPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase);
  };

  const closePurchaseDetails = () => {
    setSelectedPurchase(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <p className="text-center text-red-500">Please log in to access user profiles.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500">Manage and view user details and subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <UserIcon className="text-blue-500" size={18} />
              Users ({filteredUsers.filter((u) => u.active).length}/{filteredUsers.length})
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                className={`px-2 py-1 text-xs rounded-md ${activeFilter === 'inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Inactive
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleView(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          {user.hasPlan ? `${user.subscription?.plan || 'No Plan'} Plan` : 'No Plan'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-gray-500">{user.phonenumber}</span>
                  </div>
                  {!user.hasPlan && (
                    <div className="mt-2 flex items-center text-xs text-yellow-700">
                      <AlertTriangle size={14} className="mr-1" />
                      <span>No active subscription</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
          {filteredUsers.length > usersPerPage && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* User Details */}
        {selectedUser && (
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedUser.active ? "bg-gradient-to-br from-green-100 to-teal-100" : "bg-gradient-to-br from-gray-100 to-gray-200"
                  }`}>
                    <User className={selectedUser.active ? "text-green-600" : "text-gray-500"} size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedUser.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedUser.active ? "Active" : "Inactive"}
                      </span>
                      {selectedUser.hasPlan ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {selectedUser.subscription?.plan} Plan
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          No Active Plan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={handleEditToggle}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone size={16} />
                    <span className="text-xs">Phone</span>
                  </div>
                  <p className="font-medium mt-1">{selectedUser.phonenumber}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <HardDrive size={16} />
                    <span className="text-xs">Device</span>
                  </div>
                  <p className="font-medium mt-1">{selectedUser.device}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Shield size={16} />
                    <span className="text-xs">Location</span>
                  </div>
                  <p className="font-medium mt-1">{selectedUser.location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock size={16} />
                    <span className="text-xs">Last Login</span>
                  </div>
                  <p className="font-medium mt-1">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Plan Card */}
            {selectedUser.hasPlan ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div
                  className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("plan")}
                >
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <BarChart2 className="text-blue-500" size={18} />
                    Current Plan
                  </h3>
                  {expandedSection === "plan" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {expandedSection === "plan" && selectedUser.subscription && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Plan Type</p>
                            <p className="font-medium">{selectedUser.subscription.plan}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <PaymentStatusIcon status={selectedUser.paymentStatus} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Payment Status</p>
                            <p className="font-medium capitalize">{selectedUser.paymentStatus}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="font-medium">{formatDate(selectedUser.subscription.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Expiry Date</p>
                            <p className="font-medium">{formatDate(selectedUser.subscription.expiryDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <DataUsageIcon
                          used={selectedUser.data_usage?.used || 0}
                          total={selectedUser.data_usage?.total || 1}
                          isUnlimited={selectedUser.isUnlimited}
                        />
                        <span className="font-medium">Data Consumption</span>
                      </div>
                      <span className="text-sm font-medium">
                        {selectedUser.isUnlimited
                          ? "Unlimited"
                          : `${selectedUser.data_usage?.used || 0} ${selectedUser.data_usage?.unit || 'GB'} of ${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}
                      </span>
                    </div>
                    <div className="mb-2">
                      <DataUsageBar
                        used={selectedUser.data_usage?.used || 0}
                        total={selectedUser.data_usage?.total || 1}
                        isUnlimited={selectedUser.isUnlimited}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>0 {selectedUser.data_usage?.unit || 'GB'}</span>
                      <span>{selectedUser.isUnlimited ? "∞" : `${selectedUser.data_usage?.total || 0} ${selectedUser.data_usage?.unit || 'GB'}`}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">No Active Plan</h3>
                      <p className="text-sm text-gray-500">This user doesn't have an active subscription</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                    Assign Plan
                  </button>
                </div>
              </div>
            )}

            {/* Subscription History Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("history")}
              >
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <History className="text-blue-500" size={18} />
                  Subscription History
                </h3>
                {expandedSection === "history" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {expandedSection === "history" && (
                <div className="p-6">
                  {selectedUser.history?.purchaseHistory?.length > 0 ? (
                    <div className="space-y-8">
                      {/* Customer Lifetime Value */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                          <CreditCard size={16} />
                          Customer Lifetime Value
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Total Revenue</p>
                            <p className="font-medium text-lg">{formatCurrency(selectedUser.totalRevenue)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Avg. Monthly Spend</p>
                            <p className="font-medium text-lg">{formatCurrency(selectedUser.avgMonthlySpend)}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Renewal Frequency</p>
                            <p className="font-medium text-lg">{selectedUser.renewalFrequency}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500">Loyalty Duration</p>
                            <p className="font-medium text-lg">{selectedUser.loyaltyDuration} months</p>
                          </div>
                        </div>
                      </div>

                      {/* Plan Purchase Trends */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart2 size={16} />
                            Annual Revenue Trend
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getChartData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                                <Line
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke="#3B82F6"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart2 size={16} />
                            Monthly Revenue Breakdown
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getMonthlyChartData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                                <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Plan Distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Package size={16} />
                            Plan Distribution
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getPlanDistributionData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {getPlanDistributionData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <CreditCard size={16} />
                            Payment Methods
                          </h4>
                          <div className="h-64 bg-gray-50 p-3 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getPaymentMethodData()}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {getPaymentMethodData().map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={["#6366F1", "#3B82F6", "#10B981", "#F59E0B"][index % 4]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value, name) => [`${value} purchases`, name]} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Plan Behavior Insights */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <TrendingUp size={16} />
                          Plan Behavior Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Favorite Plan</p>
                            <p className="font-medium">{getPlanBehavior().favoritePlan}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Number of Upgrades</p>
                            <p className="font-medium">{getPlanBehavior().upgrades}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Plan Changes</p>
                            <p className="font-medium">{getPlanBehavior().planChanges}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Avg. Plan Duration</p>
                            <p className="font-medium">{getPlanBehavior().avgDuration.toFixed(1)} months</p>
                          </div>
                        </div>
                        <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Spending Trend:</p>
                            {getSpendingTrend() === "up" ? (
                              <div className="flex items-center text-green-500">
                                <TrendingUp size={16} />
                                <span className="ml-1">Increasing</span>
                              </div>
                            ) : getSpendingTrend() === "down" ? (
                              <div className="flex items-center text-red-500">
                                <TrendingDown size={16} />
                                <span className="ml-1">Decreasing</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <Circle size={16} />
                                <span className="ml-1">Stable</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Purchase History */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-700 flex items-center gap-2">
                            <History size={16} />
                            Detailed Purchase History
                          </h4>
                          <div className="flex items-center gap-2">
                            <select
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                              value={filterYear}
                              onChange={(e) => setFilterYear(e.target.value)}
                            >
                              <option value="All">All Years</option>
                              {[
                                ...new Set(
                                  selectedUser.history.purchaseHistory.map((p) =>
                                    new Date(p.purchase_date).getFullYear()
                                  )
                                ),
                              ]
                                .sort((a, b) => b - a)
                                .map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                            </select>
                            <button
                              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                              onClick={() => exportToCSV(selectedUser.history)}
                            >
                              <Download size={14} />
                              Export
                            </button>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Plan</th>
                                <th className="p-2 text-left">Purchase Date</th>
                                <th className="p-2 text-left">Duration</th>
                                <th className="p-2 text-left">Price</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getFilteredPurchaseHistory().map((purchase, index) => (
                                <tr
                                  key={index}
                                  className="border-b hover:bg-gray-50 cursor-pointer"
                                  onClick={() => viewPurchaseDetails(purchase)}
                                >
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getPlanColor(purchase.plan?.name) }}
                                      ></div>
                                      {purchase.plan?.name || "N/A"}
                                    </div>
                                  </td>
                                  <td className="p-2">{formatDate(purchase.purchase_date)}</td>
                                  <td className="p-2">{purchase.duration || "N/A"}</td>
                                  <td className="p-2 font-medium">${purchase.amount}</td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        purchase.status === "Active"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                      }`}
                                    >
                                      {purchase.status || "N/A"}
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    <button className="text-blue-500 hover:text-blue-700">
                                      <ArrowUpRight size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package size={24} className="mx-auto mb-2 text-gray-400" />
                      <p>No subscription history found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit User Profile</h3>
              <button
                onClick={handleEditToggle}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  pattern="(\+254|0)[0-9]{9}"
                  title="Phone number must be in the format +254XXXXXXXXX or 07XXXXXXXX"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Purchase Details</h3>
                <button
                  onClick={closePurchaseDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{selectedPurchase.plan?.name || "N/A"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{formatDate(selectedPurchase.purchase_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedPurchase.duration || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">${selectedPurchase.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedPurchase.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedPurchase.status || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{selectedPurchase.payment_method || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Invoice Number</p>
                    <p className="font-medium">{selectedPurchase.invoice_number || "N/A"}</p>
                  </div>
                </div>
                {selectedPurchase.status === "Expired" && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle size={16} />
                      <p className="text-sm">
                        This plan expired on {formatDate(selectedUser.subscription?.expiryDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePurchaseDetails}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;