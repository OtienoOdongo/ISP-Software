import React, { useState } from "react";

const UserProfiles = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Alice Johnson", phone: "1234567890", plan: "Basic", status: "Active", autoRenewal: true },
    { id: 2, name: "Bob Smith", phone: "0987654321", plan: "Plus", status: "Inactive", autoRenewal: false },
    { id: 3, name: "Charlie Brown", phone: "1122334455", plan: "Premium", status: "Active", autoRenewal: true },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const plans = ["Basic", "Plus", "Premium"];

  // Handle Plan Update
  const handlePlanUpdate = (userId, newPlan) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, plan: newPlan } : user
      )
    );
  };

  // Toggle Auto-Renewal
  const toggleAutoRenewal = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, autoRenewal: !user.autoRenewal } : user
      )
    );
  };

  // Update User Status
  const updateStatus = (userId, newStatus) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">User Profiles</h1>

      {/* User List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Phone</th>
              <th className="py-2 px-4">Plan</th>
              <th className="py-2 px-4">Auto Renewal</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.phone}</td>
                <td className="py-2 px-4">{user.plan}</td>
                <td className="py-2 px-4">
                  {user.autoRenewal ? "Enabled" : "Disabled"}
                </td>
                <td className="py-2 px-4">{user.status}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-gray-300 text-black px-3 py-1 rounded-md"
                    onClick={() =>
                      updateStatus(user.id, user.status === "Active" ? "Inactive" : "Active")
                    }
                  >
                    {user.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Name</label>
              <input
                type="text"
                value={selectedUser.name}
                disabled
                className="w-full border p-2 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Phone</label>
              <input
                type="text"
                value={selectedUser.phone}
                disabled
                className="w-full border p-2 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Plan</label>
              <select
                className="w-full border p-2 rounded-md"
                value={selectedUser.plan}
                onChange={(e) => handlePlanUpdate(selectedUser.id, e.target.value)}
              >
                {plans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Auto Renewal</label>
              <div className="flex items-center">
                <button
                  className={`px-4 py-2 rounded-md ${
                    selectedUser.autoRenewal ? "bg-green-500 text-white" : "bg-gray-300"
                  }`}
                  onClick={() => toggleAutoRenewal(selectedUser.id)}
                >
                  {selectedUser.autoRenewal ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                onClick={() => setIsEditing(false)}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfiles;
