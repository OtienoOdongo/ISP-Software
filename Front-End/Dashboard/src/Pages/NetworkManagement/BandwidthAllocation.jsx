import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BandwidthAllocation = () => {
  const [bandwidthData, setBandwidthData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newAllocation, setNewAllocation] = useState("");
  const [newQos, setNewQos] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Ref for the bar chart
  const barChartRef = useRef(null);

  // Mock data for users and devices
  const mockData = [
    {
      id: 1,
      name: "Alice Johnson",
      plan: "Premium Plan",
      devices: [
        {
          deviceId: 1,
          mac: "00:1A:2B:3C:4D:5E",
          allocated: 50,
          used: 30,
          qos: "High",
          quota: 100,
          unlimited: false
        }
      ]
    },
    {
      id: 2,
      name: "Bob Smith",
      plan: "Plus Plan",
      devices: [
        {
          deviceId: 2,
          mac: "11:22:33:44:55:66",
          allocated: 70,
          used: 65,
          qos: "Medium",
          quota: 150,
          unlimited: false
        }
      ]
    },
    {
      id: 3,
      name: "Charlie Lee",
      plan: "Basic Plan",
      devices: [
        {
          deviceId: 3,
          mac: "22:33:44:55:66:77",
          allocated: 50,
          used: 10,
          qos: "Low",
          quota: 50,
          unlimited: false
        }
      ]
    },
    {
      id: 4,
      name: "Diana May",
      plan: "Unlimited Plan",
      devices: [
        {
          deviceId: 4,
          mac: "33:44:55:66:77:88",
          allocated: "Unlimited",
          used: 0,
          qos: "High",
          quota: "Unlimited",
          unlimited: true
        }
      ]
    }
  ];

  const planLimits = {
    Premium: { maxBandwidth: 150, qosOptions: ["High", "Medium", "Low"] },
    Plus: { maxBandwidth: 100, qosOptions: ["Medium", "Low"] },
    Basic: { maxBandwidth: 50, qosOptions: ["Low"] },
    Unlimited: { maxBandwidth: "Unlimited", qosOptions: ["High", "Medium", "Low"] },
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      setBandwidthData(mockData);
    } catch (error) {
      console.error("Error fetching bandwidth data:", error);
      setError("Failed to fetch bandwidth data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateBandwidth = useCallback(async (userId, deviceId, newAllocation, newQos) => {
    try {
      setBandwidthData(prevData =>
        prevData.map(user =>
          user.id === userId ? {
            ...user,
            devices: user.devices.map(device =>
              device.deviceId === deviceId ? {
                ...device,
                allocated: newAllocation === "Unlimited" ? "Unlimited" : parseInt(newAllocation),
                qos: newQos,
                quota: newAllocation === "Unlimited" ? "Unlimited" : device.quota,
                unlimited: newAllocation === "Unlimited"
              } : device
            )
          } : user
        )
      );
      toast.success("Bandwidth updated successfully!");
    } catch (error) {
      console.error("Error updating bandwidth allocation:", error);
      toast.error("Failed to update bandwidth.");
    }
  }, []);

  const checkBandwidthQuota = useCallback((device) => {
    if (device.unlimited) {
      return { status: "Unlimited", message: "Unlimited Bandwidth" };
    }
    return device.used >= device.quota
      ? { status: "Exceed", message: "Quota exceeded" }
      : { status: "Normal", message: `${device.quota - device.used} GB remaining` };
  }, []);

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

  const filterData = useCallback((term) => {
    if (!term) return bandwidthData;
    const termLower = term.toLowerCase();
    return bandwidthData.filter(user =>
      user.id.toString().includes(term) ||
      user.devices.some(device => device.mac.toLowerCase().includes(termLower))
    );
  }, [bandwidthData]);

  const filteredData = filterData(searchTerm);

  const barChartData = {
    labels: filteredData.map(user => user.name),
    datasets: [
      {
        label: 'Allocated Bandwidth (GB)',
        data: filteredData.flatMap(user => user.devices.map(device => device.allocated === "Unlimited" ? 150 : device.allocated)),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Used Bandwidth (GB)',
        data: filteredData.flatMap(user => user.devices.map(device => device.used)),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Bandwidth (GB)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bandwidth Allocation and Usage'
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Bandwidth Allocation</h1>

      <input
        type="text"
        className="mb-4 p-2 border rounded-md w-full"
        placeholder="Search for a user by ID or MAC address..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <Bar ref={barChartRef} data={barChartData} options={barChartOptions} />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4">User</th>
                <th className="py-2 px-4">MAC</th>
                <th className="py-2 px-4">Plan</th>
                <th className="py-2 px-4">Allocated</th>
                <th className="py-2 px-4">Used</th>
                <th className="py-2 px-4">QoS</th>
                <th className="py-2 px-4">Quota</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(user =>
                user.devices.map(device => {
                  const { status, message } = checkBandwidthQuota(device);
                  return (
                    <tr key={device.deviceId} className="border-b">
                      <td className="py-2 px-4">{user.name}</td>
                      <td className="py-2 px-4">{device.mac}</td>
                      <td className="py-2 px-4">{user.plan}</td>
                      <td className="py-2 px-4">{device.allocated}</td>
                      <td className="py-2 px-4">{device.used}</td>
                      <td className="py-2 px-4">{device.qos}</td>
                      <td className="py-2 px-4">{device.quota}</td>
                      <td className="py-2 px-4">
                        <span className={status === "Exceed" ? "text-red-500" : status === "Unlimited" ? "text-blue-500" : "text-green-500"}>
                          {message}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                          onClick={() => openEditModal(user, device)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && selectedDevice && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Bandwidth for {selectedUser.name}'s Device</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Allocated Bandwidth</label>
              <input
                type="text"
                className="border p-2 rounded-md w-full"
                value={newAllocation}
                onChange={(e) => setNewAllocation(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">QoS</label>
              <select
                className="border p-2 rounded-md w-full"
                value={newQos}
                onChange={(e) => setNewQos(e.target.value)}
              >
                {planLimits[selectedUser.plan]?.qosOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded-md"
                onClick={() => { setSelectedUser(null); setSelectedDevice(null); }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-md"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default BandwidthAllocation;