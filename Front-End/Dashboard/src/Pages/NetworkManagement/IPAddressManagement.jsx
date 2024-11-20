import React, { useState, useEffect } from "react";
import axios from "axios";

const IPAddressManagement = () => {
  const [ipData, setIpData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const mockIpData = [
    { id: 1, name: "Alice Johnson", ipAddress: "192.168.1.2", macAddress: "00:1A:2B:3C:4D:5E" },
    { id: 2, name: "Bob Smith", ipAddress: "192.168.1.3", macAddress: "00:1A:2B:3C:4D:5F" },
    { id: 3, name: "Charlie Brown", ipAddress: "192.168.1.4", macAddress: "00:1A:2B:3C:4D:60" },
  ];

  const fetchIpData = async () => {
    try {
      const response = await axios.get("/api/starlink/ip-addresses");
      if (Array.isArray(response.data)) {
        setIpData(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setIpData(mockIpData);
      }
    } catch (error) {
      console.error("Error fetching IP address data:", error);
      setIpData(mockIpData);
    }
  };

  useEffect(() => {
    fetchIpData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">IP Address Management</h1>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Assigned IP Addresses</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">IP Address</th>
              <th className="py-2 px-4">MAC Address</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ipData.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.ipAddress}</td>
                <td className="py-2 px-4">{user.macAddress}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2"
                    onClick={() => setSelectedUser(user)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">
              Details for {selectedUser.name}
            </h2>
            <p className="mb-4">IP Address: {selectedUser.ipAddress}</p>
            <p className="mb-4">MAC Address: {selectedUser.macAddress}</p>
            <button
              className="bg-gray-300 px-4 py-2 rounded-md"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPAddressManagement;