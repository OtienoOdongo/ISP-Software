
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Server, Upload, Settings, X, Activity, Users,
  BarChart2, RefreshCw, Plus, CheckCircle, AlertTriangle,
  Globe, Download, Signal, Clock, PieChart, UserPlus, Eye,
  EyeOff, Filter, HardDrive, Terminal, Shield, LogOut,
  LogIn, WifiOff, BatteryCharging, Cpu, MemoryStick,
  Router, Network, Gauge, Database, Bell, ChevronDown,
  ChevronUp, MoreHorizontal, Trash2, Edit, Search
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from "chart.js";
import api from "../../api"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const BandwidthAllocation = () => {
  const [bandwidthData, setBandwidthData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newAllocation, setNewAllocation] = useState("");
  const [newQos, setNewQos] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [showChart, setShowChart] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState(null);
  const [chartStats, setChartStats] = useState({ top_users: [], stats: {} });
  const [qosProfiles, setQosProfiles] = useState([]);
  const [plans, setPlans] = useState([]);

  const fetchQosProfiles = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/qos-profiles/");
      setQosProfiles(response.data);
    } catch (error) {
      console.error("Error fetching QoS profiles:", error);
      toast.error("Failed to fetch QoS profiles");
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await api.get("/api/internet_plans/");
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans");
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/network_management/allocations/", {
        params: { status: filter !== "all" ? filter : undefined, search: searchTerm || undefined }
      });
      const formattedData = response.data.map(allocation => ({
        id: allocation.id,
        name: allocation.client?.full_name || "Unknown",
        plan: {
          name: allocation.plan?.name || "Unknown",
          category: allocation.plan?.category || "Unknown"
        },
        status: allocation.status,
        lastSeen: allocation.last_used,
        devices: [
          {
            deviceId: allocation.id,
            mac: allocation.mac_address,
            allocated: allocation.allocated_bandwidth === "Unlimited" ? "Unlimited" : parseFloat(allocation.allocated_bandwidth.replace("GB", "")),
            quota: allocation.quota === "Unlimited" ? "Unlimited" : parseFloat(allocation.quota.replace("GB", "")),
            used: allocation.used_bandwidth,
            qos: allocation.priority,
            unlimited: allocation.allocated_bandwidth === "Unlimited",
            ip: allocation.ip_address,
            connectedAt: allocation.last_used
          }
        ]
      }));
      setBandwidthData(formattedData);
    } catch (error) {
      console.error("Error fetching bandwidth data:", error);
      setError("Failed to fetch bandwidth data.");
      toast.error(error.response?.data?.error || "Failed to fetch bandwidth data");
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/usage-stats/");
      setChartStats(response.data);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      toast.error("Failed to fetch usage stats");
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchQosProfiles();
    fetchPlans();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchStats, fetchQosProfiles, fetchPlans]);

  const updateBandwidth = useCallback(async (userId, deviceId, newAllocation, newQos) => {
    setIsUpdating(true);
    try {
      const qosProfile = qosProfiles.find(profile => profile.priority === newQos);
      await api.put(`/api/network_management/allocations/${deviceId}/`, {
        allocated_bandwidth: newAllocation === "Unlimited" ? "Unlimited" : `${newAllocation}GB`,
        quota: newAllocation === "Unlimited" ? "Unlimited" : `${newAllocation}GB`,
        priority: newQos,
        qos_profile: qosProfile ? qosProfile.id : null
      });
      setBandwidthData(prevData =>
        prevData.map(user =>
          user.id === userId ? {
            ...user,
            devices: user.devices.map(device =>
              device.deviceId === deviceId ? {
                ...device,
                allocated: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
                quota: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
                qos: newQos,
                unlimited: newAllocation === "Unlimited"
              } : device
            )
          } : user
        )
      );
      toast.success("Bandwidth updated successfully!");
      await fetchStats();
    } catch (error) {
      console.error("Error updating bandwidth allocation:", error);
      toast.error(error.response?.data?.error || "Failed to update bandwidth");
    } finally {
      setIsUpdating(false);
    }
  }, [fetchStats, qosProfiles]);

  const checkBandwidthQuota = useCallback((device) => {
    if (device.unlimited) {
      return { status: "Unlimited", message: "Unlimited", color: "text-blue-600" };
    }
    return device.used >= device.quota
      ? { status: "Exceed", message: "Quota exceeded", color: "text-red-600" }
      : { status: "Normal", message: `${device.quota - device.used} GB left`, color: "text-green-600" };
  }, []);

  const getUserStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-600";
      case "inactive": return "bg-red-100 text-red-600";
      case "suspended": return "bg-yellow-100 text-yellow-600";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const timeSince = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
    return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
  };

  const openEditModal = useCallback((user, device) => {
    setSelectedUser(user);
    setSelectedDevice(device);
    setNewAllocation(device.allocated === "Unlimited" ? "Unlimited" : device.allocated.toString());
    setNewQos(device.qos);
  }, []);

  const handleSaveChanges = useCallback(() => {
    if (selectedUser && selectedDevice) {
      updateBandwidth(selectedUser.id, selectedDevice.deviceId, newAllocation, newQos);
      setSelectedUser(null);
      setSelectedDevice(null);
      setNewAllocation("");
      setNewQos("");
    }
  }, [selectedUser, selectedDevice, newAllocation, newQos, updateBandwidth]);

  const filterData = useCallback((data, term, statusFilter) => {
    if (!term && statusFilter === "all") return data;
    const termLower = term.toLowerCase();
    return data.filter(user =>
      (statusFilter === "all" || user.status === statusFilter) &&
      (user.id.toString().includes(term) ||
       user.name.toLowerCase().includes(termLower) ||
       user.plan.name.toLowerCase().includes(termLower) ||
       user.plan.category.toLowerCase().includes(termLower) ||
       user.devices.some(device => device.mac.toLowerCase().includes(termLower) || 
                                 device.ip.includes(term)))
    );
  }, []);

  const filteredData = useMemo(() => filterData(bandwidthData, searchTerm, filter), [bandwidthData, searchTerm, filter, filterData]);

  const barChartData = {
    labels: chartStats.top_users.map(user => user.client?.full_name || "Unknown"),
    datasets: [
      {
        label: "Allocated Bandwidth (GB)",
        data: chartStats.top_users.map(user => user.allocated_bandwidth === "Unlimited" ? 150 : parseFloat(user.allocated_bandwidth.replace("GB", ""))),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 1
      },
      {
        label: "Used Bandwidth (GB)",
        data: chartStats.top_users.map(user => user.used_bandwidth),
        backgroundColor: "rgba(244, 63, 94, 0.7)",
        borderColor: "rgba(225, 29, 72, 1)",
        borderWidth: 1
      }
    ]
  };

  const lineChartData = {
    labels: chartStats.top_users.map(user => user.client?.full_name || "Unknown"),
    datasets: [
      {
        label: "Allocated Bandwidth (GB)",
        data: chartStats.top_users.map(user => user.allocated_bandwidth === "Unlimited" ? 150 : parseFloat(user.allocated_bandwidth.replace("GB", ""))),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Used Bandwidth (GB)",
        data: chartStats.top_users.map(user => user.used_bandwidth),
        borderColor: "rgba(244, 63, 94, 1)",
        backgroundColor: "rgba(244, 63, 94, 0.1)",
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#1F2937",
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: "Bandwidth Allocation and Usage",
        color: "#1F2937",
        font: { size: 16 }
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        usePointStyle: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Bandwidth (GB)",
          color: "#6B7280"
        },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#6B7280" }
      },
      x: {
        grid: { color: "rgba(0, 0, 0, 0.1)" },
        ticks: { color: "#6B7280" }
      }
    }
  };

  // Get allowed QoS priorities based on plan category
  const getAllowedQosOptions = (category) => {
    const allowedPriorities = {
      Residential: ['medium', 'low'],
      Business: ['high', 'medium'],
      Promotional: ['medium'],
      Enterprise: ['high', 'medium', 'low']
    };
    return qosProfiles
      .filter(profile => allowedPriorities[category]?.includes(profile.priority))
      .map(profile => profile.priority);
  };

  return (
    <div className="p-6 bg-gray-100 text-gray-900 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="light" pauseOnHover newestOnTop />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <Server className="w-8 h-8 text-indigo-600" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Bandwidth Allocation</h1>
            <p className="text-sm text-gray-500">
              {bandwidthData.length} users • {bandwidthData.filter(u => u.status === "active").length} active
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={fetchData}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            color="bg-gray-200 hover:bg-gray-300"
            compact
            aria-label="Refresh bandwidth data"
          />
        </div>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by name, ID, plan, category, MAC, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search bandwidth allocations"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 text-sm"
          aria-label="Filter by status"
        >
          <option value="all">All Users</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Chart Section */}
      <motion.section
        className="bg-white p-4 rounded-lg shadow mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
            Bandwidth Visualization
          </h2>
          <div className="flex space-x-2">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-900 text-sm"
              aria-label="Select chart type"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
            </select>
            <Button
              onClick={() => setShowChart(!showChart)}
              label={showChart ? "Hide" : "Show"}
              icon={showChart ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              color="bg-gray-200 hover:bg-gray-300"
              compact
              aria-label={showChart ? "Hide chart" : "Show chart"}
            />
          </div>
        </div>
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="h-64"
          >
            {chartType === "bar" ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <Line data={lineChartData} options={chartOptions} />
            )}
          </motion.div>
        )}
      </motion.section>

      {/* Users Table */}
      <section className="bg-white p-4 rounded-lg shadow">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <ThreeDots color="#6366F1" height={50} width={50} aria-label="Loading" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 flex flex-col items-center">
            <AlertTriangle className="w-8 h-8 mb-2" aria-hidden="true" />
            <p>No users found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Plan Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Plan Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Allocated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Used</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">QoS</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quota Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map(user => (
                  <React.Fragment key={user.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                      role="button"
                      aria-expanded={expandedUser === user.id}
                      aria-label={`Toggle details for ${user.name}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600">{user.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.plan.category === "Residential" ? "bg-green-100 text-green-800" :
                          user.plan.category === "Business" ? "bg-blue-100 text-blue-800" :
                          user.plan.category === "Promotional" ? "bg-yellow-100 text-yellow-800" :
                          user.plan.category === "Enterprise" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {user.plan.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.plan.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getUserStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.devices[0].mac}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.devices[0].allocated === "Unlimited" ? "Unlimited" : `${user.devices[0].allocated} GB`}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.devices[0].used} GB
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.devices[0].qos}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={checkBandwidthQuota(user.devices[0]).color}>
                          {checkBandwidthQuota(user.devices[0]).message}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(user, user.devices[0]);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 mr-2"
                          aria-label={`Edit bandwidth for ${user.name}`}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          aria-label={expandedUser === user.id ? "Collapse details" : "Expand details"}
                        >
                          {expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    {expandedUser === user.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="10" className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                <Terminal className="w-4 h-4 mr-2 text-indigo-600" aria-hidden="true" />
                                Device Details
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <p className="text-gray-500">MAC Address:</p>
                                <p className="text-gray-900">{user.devices[0].mac}</p>
                                <p className="text-gray-500">IP Address:</p>
                                <p className="text-gray-900">{user.devices[0].ip}</p>
                                <p className="text-gray-500">Connected:</p>
                                <p className="text-gray-900">{timeSince(user.devices[0].connectedAt)}</p>
                                <p className="text-gray-500">Quota:</p>
                                <p className="text-gray-900">
                                  {user.devices[0].quota === "Unlimited" ? "Unlimited" : `${user.devices[0].quota} GB`}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-indigo-600" aria-hidden="true" />
                                Usage Statistics
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <p className="text-gray-500">Bandwidth Used:</p>
                                <p className="text-gray-900">
                                  {user.devices[0].used} GB ({user.devices[0].allocated === "Unlimited" ?
                                    "∞" :
                                    `${Math.round((user.devices[0].used / user.devices[0].allocated) * 100)}%`} of allocated)
                                </p>
                                <p className="text-gray-500">Remaining:</p>
                                <p className="text-gray-900">
                                  {user.devices[0].quota === "Unlimited" ?
                                    "Unlimited" :
                                    `${user.devices[0].quota - user.devices[0].used} GB`}
                                </p>
                                <p className="text-gray-500">Last Seen:</p>
                                <p className="text-gray-900">{timeSince(user.lastSeen)}</p>
                                <p className="text-gray-500">Status:</p>
                                <p className={checkBandwidthQuota(user.devices[0]).color}>
                                  {checkBandwidthQuota(user.devices[0]).message}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedUser && selectedDevice && (
          <Modal
            isOpen={!!selectedUser}
            title={`Edit Bandwidth for ${selectedUser.name}'s Device`}
            onClose={() => {
              setSelectedUser(null);
              setSelectedDevice(null);
              setNewAllocation("");
              setNewQos("");
            }}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">MAC Address</label>
                <div className="p-2 bg-gray-50 rounded-md text-gray-900">
                  {selectedDevice.mac}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Allocated Bandwidth</label>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-l-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={newAllocation}
                    onChange={(e) => setNewAllocation(e.target.value)}
                    placeholder="Enter bandwidth in GB"
                    aria-label="Allocated bandwidth"
                    disabled={isUpdating}
                  />
                  <select
                    className="p-2 bg-gray-50 border border-gray-300 rounded-r-md text-gray-900"
                    value={newAllocation === "Unlimited" ? "Unlimited" : ""}
                    onChange={(e) => setNewAllocation(e.target.value === "Unlimited" ? "Unlimited" : newAllocation)}
                    aria-label="Bandwidth type"
                    disabled={isUpdating}
                  >
                    <option value="">Custom</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max for {selectedUser.plan.name} ({selectedUser.plan.category}):{" "}
                  {plans.find(p => p.name === selectedUser.plan.name)?.dataLimit.value || "N/A"}{" "}
                  {plans.find(p => p.name === selectedUser.plan.name)?.dataLimit.unit || ""}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Quality of Service (QoS)</label>
                <select
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newQos}
                  onChange={(e) => setNewQos(e.target.value)}
                  aria-label="Quality of Service"
                  disabled={isUpdating}
                >
                  {getAllowedQosOptions(selectedUser.plan.category).map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedDevice(null);
                    setNewAllocation("");
                    setNewQos("");
                  }}
                  label="Cancel"
                  color="bg-gray-200 hover:bg-gray-300"
                  disabled={isUpdating}
                  aria-label="Cancel"
                />
                <Button
                  onClick={handleSaveChanges}
                  label={isUpdating ? "Saving..." : "Save Changes"}
                  icon={isUpdating ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
                  color="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isUpdating || !newAllocation || !newQos}
                  aria-label="Save changes"
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable Components
const Button = ({ onClick, label, icon, color, disabled, compact, fullWidth, badge, ariaLabel }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`${color} ${compact ? "p-2" : "px-3 py-2"} ${fullWidth ? "w-full" : ""} text-white rounded-md flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed relative`}
    aria-label={ariaLabel}
  >
    {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-1" : ""}` })}
    {label && <span>{label}</span>}
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
        {badge}
      </span>
    )}
  </motion.button>
);

const Modal = ({ isOpen, title, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-6 rounded-lg max-w-md w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default BandwidthAllocation;