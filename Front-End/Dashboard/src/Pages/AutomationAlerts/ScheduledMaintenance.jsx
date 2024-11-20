import React, { useState } from "react";
import { CalendarDays, CheckCircle, XCircle, PlusCircle } from "lucide-react";

const ScheduledMaintenance = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([
    {
      id: 1,
      title: "Network Upgrade",
      description: "Upgrading the main server router.",
      date: "2024-11-25",
      status: "Scheduled",
      notified: true,
    },
    {
      id: 2,
      title: "Firmware Update",
      description: "Installing new firmware on backup routers.",
      date: "2024-11-30",
      status: "Pending",
      notified: false,
    },
  ]);

  const [newMaintenance, setNewMaintenance] = useState({
    title: "",
    description: "",
    date: "",
  });

  // Handle adding new maintenance
  const addMaintenance = () => {
    if (!newMaintenance.title || !newMaintenance.date) {
      alert("Title and Date are required!");
      return;
    }
    setMaintenanceLogs([
      ...maintenanceLogs,
      {
        id: maintenanceLogs.length + 1,
        ...newMaintenance,
        status: "Pending",
        notified: false,
      },
    ]);
    setNewMaintenance({ title: "", description: "", date: "" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Scheduled Maintenance
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Set up and manage maintenance schedules with automated user notifications.
      </p>

      {/* Add Maintenance Form */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Add Maintenance</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            type="text"
            className="p-2 border rounded-md"
            placeholder="Title"
            value={newMaintenance.title}
            onChange={(e) =>
              setNewMaintenance({ ...newMaintenance, title: e.target.value })
            }
          />
          <input
            type="text"
            className="p-2 border rounded-md"
            placeholder="Description (Optional)"
            value={newMaintenance.description}
            onChange={(e) =>
              setNewMaintenance({
                ...newMaintenance,
                description: e.target.value,
              })
            }
          />
          <input
            type="date"
            className="p-2 border rounded-md"
            value={newMaintenance.date}
            onChange={(e) =>
              setNewMaintenance({ ...newMaintenance, date: e.target.value })
            }
          />
        </div>
        <div className="text-right mt-4">
          <button
            onClick={addMaintenance}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Maintenance
          </button>
        </div>
      </div>

      {/* Maintenance Logs */}
      <div className="space-y-4">
        {maintenanceLogs.map((log) => (
          <div
            key={log.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow ${
              log.status === "Scheduled"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              <CalendarDays className="w-6 h-6" />
              <div>
                <p className="font-bold">{log.title}</p>
                <p className="text-sm">{log.description}</p>
                <p className="text-sm">
                  Date: {log.date}
                </p>
                <p className="text-xs text-gray-500">
                  Notified: {log.notified ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <div>
              {log.status === "Scheduled" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Maintenance */}
      {maintenanceLogs.length === 0 && (
        <div className="text-center text-gray-600 mt-6">
          <p>No scheduled maintenance at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ScheduledMaintenance;
