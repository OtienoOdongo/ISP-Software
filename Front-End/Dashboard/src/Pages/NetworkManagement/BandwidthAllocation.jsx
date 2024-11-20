// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import axios from "axios";

// const BandwidthAllocation = () => {
//   const [bandwidthData, setBandwidthData] = useState([]);
//   const [macAddresses, setMacAddresses] = useState([]);
//   const [newMacAddress, setNewMacAddress] = useState("");
//   const [allowedMacs, setAllowedMacs] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [qosSettings, setQosSettings] = useState({});
//   const [userPlans, setUserPlans] = useState({});
//   const [error, setError] = useState("");

//   // Expanded mock data for users
//   const mockData = [
//     { id: 1, name: "Alice Johnson", allocated: 50, used: 30, qos: "High", plan: "Premium", mac: "00:1A:2B:3C:4D:5E" },
//     { id: 2, name: "Bob Smith", allocated: 70, used: 65, qos: "Medium", plan: "Standard", mac: "11:22:33:44:55:66" },
//     { id: 3, name: "Charlie Brown", allocated: 100, used: 85, qos: "Low", plan: "Basic", mac: "AA:BB:CC:DD:EE:FF" },
//     { id: 4, name: "David Wilson", allocated: 120, used: 40, qos: "High", plan: "Premium", mac: "66:77:88:99:00:11" },
//     { id: 5, name: "Eve Davis", allocated: 90, used: 50, qos: "Medium", plan: "Standard", mac: "FF:EE:DD:CC:BB:AA" },
//     { id: 6, name: "Frank Lee", allocated: 150, used: 100, qos: "Low", plan: "Basic", mac: "22:33:44:55:66:77" }
//   ];

//   const planLimits = {
//     Premium: { maxBandwidth: 150, qosOptions: ["High", "Medium", "Low"] },
//     Standard: { maxBandwidth: 100, qosOptions: ["Medium", "Low"] },
//     Basic: { maxBandwidth: 50, qosOptions: ["Low"] },
//   };

//   const fetchData = async () => {
//     try {
//       const response = await axios.get("/api/starlink/bandwidth");
//       if (Array.isArray(response.data)) {
//         setBandwidthData(response.data);
//         setMacAddresses(response.data.map((user) => user.mac));
//       } else {
//         console.error("Unexpected response format:", response.data);
//         setBandwidthData(mockData);
//         setMacAddresses(mockData.map((user) => user.mac));
//       }
//     } catch (error) {
//       console.error("Error fetching bandwidth data:", error);
//       setBandwidthData(mockData);
//       setMacAddresses(mockData.map((user) => user.mac));
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const adjustBandwidth = async (id, newAllocation, newQos) => {
//     try {
//       await axios.put(`/api/starlink/bandwidth/${id}`, { allocated: newAllocation, qos: newQos });
//       setBandwidthData((prevData) =>
//         prevData.map((user) =>
//           user.id === id ? { ...user, allocated: newAllocation, qos: newQos } : user
//         )
//       );
//     } catch (error) {
//       console.error("Error updating bandwidth allocation:", error);
//     }
//   };

//   const addMacAddress = async () => {
//     if (newMacAddress && !allowedMacs.includes(newMacAddress)) {
//       try {
//         setAllowedMacs((prev) => [...prev, newMacAddress]);
//         setNewMacAddress("");
//         setError("");
//       } catch (error) {
//         console.error("Error adding MAC address:", error);
//       }
//     } else {
//       setError("Invalid MAC address or already added.");
//     }
//   };

//   const removeMacAddress = (mac) => {
//     setAllowedMacs((prev) => prev.filter((addr) => addr !== mac));
//   };

//   const chartOptions = {
//     chart: {
//       type: "bar",
//       height: 350,
//       toolbar: { show: true },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: "55%",
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     xaxis: {
//       categories: bandwidthData.map((user) => user.name),
//     },
//     yaxis: {
//       title: {
//         text: "Bandwidth (MB)",
//       },
//     },
//     colors: ["#6b5b95", "#ff7b25"],
//     legend: {
//       position: "right",
//     },
//     tooltip: {
//       y: {
//         formatter: (value) => `${value} MB`,
//       },
//     },
//   };

//   const chartSeries = [
//     {
//       name: "Allocated Bandwidth",
//       data: bandwidthData.map((user) => user.allocated),
//     },
//     {
//       name: "Used Bandwidth",
//       data: bandwidthData.map((user) => user.used),
//     },
//   ];

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">Bandwidth Allocation</h1>

//       <div className="bg-white shadow-md rounded-lg p-4 mb-6">
//         <Chart
//           options={chartOptions}
//           series={chartSeries}
//           type="bar"
//           height={350}
//         />
//       </div>

//       <div className="bg-white shadow-md rounded-lg p-4 mb-6">
//         <h2 className="text-xl font-semibold mb-4">MAC Address Filtering</h2>
//         <div className="mb-4">
//           <input
//             type="text"
//             className="border p-2 rounded-md w-full"
//             placeholder="Enter MAC Address (e.g., 00:1A:2B:3C:4D:5E)"
//             value={newMacAddress}
//             onChange={(e) => setNewMacAddress(e.target.value)}
//           />
//           <button
//             className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
//             onClick={addMacAddress}
//           >
//             Add MAC Address
//           </button>
//           {error && <p className="text-red-500 mt-2">{error}</p>}
//         </div>
//         <ul>
//           {allowedMacs.map((mac) => (
//             <li key={mac} className="flex justify-between items-center mb-2">
//               <span>{mac}</span>
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded-md"
//                 onClick={() => removeMacAddress(mac)}
//               >
//                 Remove
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="bg-white shadow-md rounded-lg p-4">
//         <h2 className="text-xl font-semibold mb-4">User Bandwidth Details</h2>
//         <table className="w-full text-left">
//           <thead>
//             <tr className="border-b">
//               <th className="py-2 px-4">Name</th>
//               <th className="py-2 px-4">MAC Address</th>
//               <th className="py-2 px-4">Allocated Bandwidth (MB)</th>
//               <th className="py-2 px-4">Used Bandwidth (MB)</th>
//               <th className="py-2 px-4">QoS</th>
//               <th className="py-2 px-4">Plan</th>
//               <th className="py-2 px-4">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {bandwidthData.map((user) => (
//               <tr key={user.id} className="border-b hover:bg-gray-50">
//                 <td className="py-2 px-4">{user.name}</td>
//                 <td className="py-2 px-4">{user.mac}</td>
//                 <td className="py-2 px-4">{user.allocated}</td>
//                 <td className="py-2 px-4">{user.used}</td>
//                 <td className="py-2 px-4">{user.qos}</td>
//                 <td className="py-2 px-4">{user.plan}</td>
//                 <td className="py-2 px-4">
//                   <button
//                     className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2"
//                     onClick={() => setSelectedUser(user)}
//                   >
//                     Adjust Bandwidth & QoS
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {selectedUser && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//             <h2 className="text-xl font-semibold mb-4">Adjust Bandwidth for {selectedUser.name}</h2>
//             <div>
//               <label htmlFor="bandwidth" className="block mb-2">
//                 Allocated Bandwidth (MB):
//               </label>
//               <input
//                 id="bandwidth"
//                 type="number"
//                 value={selectedUser.allocated}
//                 onChange={(e) => adjustBandwidth(selectedUser.id, e.target.value, selectedUser.qos)}
//                 className="border p-2 rounded-md mb-4 w-full"
//               />
//               <label htmlFor="qos" className="block mb-2">
//                 QoS:
//               </label>
//               <select
//                 id="qos"
//                 value={selectedUser.qos}
//                 onChange={(e) => adjustBandwidth(selectedUser.id, selectedUser.allocated, e.target.value)}
//                 className="border p-2 rounded-md w-full"
//               >
//                 {planLimits[selectedUser.plan].qosOptions.map((qosOption) => (
//                   <option key={qosOption} value={qosOption}>
//                     {qosOption}
//                   </option>
//                 ))}
//               </select>
//               <div className="mt-4 flex justify-end">
//                 <button
//                   className="bg-red-500 text-white px-4 py-2 rounded-md"
//                   onClick={() => setSelectedUser(null)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BandwidthAllocation;



import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify components

import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const BandwidthAllocation = () => {
  const [bandwidthData, setBandwidthData] = useState([]);
  const [macAddresses, setMacAddresses] = useState([]);
  const [newMacAddress, setNewMacAddress] = useState("");
  const [allowedMacs, setAllowedMacs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [newAllocation, setNewAllocation] = useState("");
  const [newQos, setNewQos] = useState("");

  // Mock data for testing
  const mockData = [
    { id: 1, name: "Alice Johnson", allocated: 50, used: 30, qos: "High", plan: "Premium", mac: "00:1A:2B:3C:4D:5E", quota: 100, disconnected: false },
    { id: 2, name: "Bob Smith", allocated: 70, used: 65, qos: "Medium", plan: "Standard", mac: "11:22:33:44:55:66", quota: 150, disconnected: false },
    { id: 3, name: "Charlie Brown", allocated: 100, used: 85, qos: "Low", plan: "Basic", mac: "AA:BB:CC:DD:EE:FF", quota: 200, disconnected: false },
    { id: 4, name: "David Wilson", allocated: 120, used: 40, qos: "High", plan: "Premium", mac: "66:77:88:99:00:11", quota: 250, disconnected: false },
    { id: 5, name: "Eve Davis", allocated: 90, used: 50, qos: "Medium", plan: "Standard", mac: "FF:EE:DD:CC:BB:AA", quota: 300, disconnected: false },
    { id: 6, name: "Frank Lee", allocated: 150, used: 100, qos: "Low", plan: "Basic", mac: "22:33:44:55:66:77", quota: 350, disconnected: false }
  ];

  const planLimits = {
    Premium: { maxBandwidth: 150, qosOptions: ["High", "Medium", "Low"] },
    Standard: { maxBandwidth: 100, qosOptions: ["Medium", "Low"] },
    Basic: { maxBandwidth: 50, qosOptions: ["Low"] },
  };

  const fetchData = async () => {
    try {
      // Here you can replace the mock data with an actual API request
      // const response = await axios.get("/api/starlink/bandwidth");
      // If using mock data directly, we'll skip the axios call

      setBandwidthData(mockData);
      setMacAddresses(mockData.map((user) => user.mac));
    } catch (error) {
      console.error("Error fetching bandwidth data:", error);
      setError("Failed to fetch bandwidth data.");
      setBandwidthData(mockData); // Fallback to mock data
      setMacAddresses(mockData.map((user) => user.mac)); // Fallback to mock MAC addresses
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adjustBandwidth = async (id, newAllocation, newQos) => {
    try {
      // This would usually be an API call to update the user's bandwidth allocation
      // await axios.put(`/api/starlink/bandwidth/${id}`, { allocated: newAllocation, qos: newQos });

      setBandwidthData((prevData) =>
        prevData.map((user) =>
          user.id === id ? { ...user, allocated: newAllocation, qos: newQos } : user
        )
      );
    } catch (error) {
      console.error("Error updating bandwidth allocation:", error);
    }
  };

  const addMacAddress = async () => {
    if (newMacAddress && !allowedMacs.includes(newMacAddress)) {
      try {
        setAllowedMacs((prev) => [...prev, newMacAddress]);
        setNewMacAddress("");
        setError("");
      } catch (error) {
        console.error("Error adding MAC address:", error);
      }
    } else {
      setError("Invalid MAC address or already added.");
    }
  };

  const removeMacAddress = (mac) => {
    setAllowedMacs((prev) => prev.filter((addr) => addr !== mac));
  };

  const disconnectUser = (id) => {
    setBandwidthData((prevData) =>
      prevData.map((user) =>
        user.id === id ? { ...user, disconnected: true } : user
      )
    );

    // Display toast notification
    toast.success(`User with ID ${id} has been disconnected successfully!`);
  };

  const checkBandwidthQuota = (user) => {
    if (user.used >= user.quota) {
      return { status: "Exceed", message: "Quota exceeded" };
    }
    return { status: "Normal", message: `${user.quota - user.used} MB remaining` };
  };

  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: bandwidthData.map((user) => user.name),
    },
    yaxis: {
      title: {
        text: "Bandwidth (MB)",
      },
    },
    colors: ["#6b5b95", "#ff7b25"],
    legend: {
      position: "right",
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} MB`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Allocated Bandwidth",
      data: bandwidthData.map((user) => user.allocated),
    },
    {
      name: "Used Bandwidth",
      data: bandwidthData.map((user) => user.used),
    },
  ];

  // Handling edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setNewAllocation(user.allocated);
    setNewQos(user.qos);
  };

  const handleSaveChanges = () => {
    if (selectedUser) {
      adjustBandwidth(selectedUser.id, newAllocation, newQos);
      setSelectedUser(null);
      setNewAllocation("");
      setNewQos("");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Bandwidth Allocation</h1>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={350}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">MAC Address Filtering</h2>
        <div className="mb-4">
          <input
            type="text"
            className="border p-2 rounded-md w-full"
            placeholder="Enter MAC Address (e.g., 00:1A:2B:3C:4D:5E)"
            value={newMacAddress}
            onChange={(e) => setNewMacAddress(e.target.value)}
          />
          <button
            className="mt-2 bg-blue-500 text-white px-3 py-2 rounded-md"
            onClick={addMacAddress}
          >
            Add MAC Address
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <ul>
          {allowedMacs.map((mac) => (
            <li key={mac} className="flex justify-between items-center mb-2">
              <span>{mac}</span>
              <button
                className="bg-red-500 text-white px-3 py-2 rounded-md"
                onClick={() => removeMacAddress(mac)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bandwidth Allocation</h2>
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">MAC</th>
              <th className="py-2 px-4">Allocated</th>
              <th className="py-2 px-4">Used</th>
              <th className="py-2 px-4">QoS</th>
              <th className="py-2 px-4">Plan</th>
              <th className="py-2 px-4">Quota</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bandwidthData.map((user) => {
              const { status, message } = checkBandwidthQuota(user);

              return (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.mac}</td>
                  <td className="py-2 px-4">{user.allocated}</td>
                  <td className="py-2 px-4">{user.used}</td>
                  <td className="py-2 px-4">{user.qos}</td>
                  <td className="py-2 px-4">{user.plan}</td>
                  <td className="py-2 px-4">{user.quota}</td>
                  <td className="py-2 px-4">
                    <span className={status === "Exceed" ? "text-red-500" : "text-green-500"}>
                      {message}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded-md"
                      onClick={() => disconnectUser(user.id)}
                    >
                      Disconnect
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Bandwidth for {selectedUser.name}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Allocated Bandwidth</label>
              <input
                type="number"
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
                onClick={() => setSelectedUser(null)}
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

      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
};

export default BandwidthAllocation;
