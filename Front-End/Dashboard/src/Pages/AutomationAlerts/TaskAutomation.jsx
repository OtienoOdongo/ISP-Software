import React, { useState } from "react";
import { PlayCircle, PauseCircle, CheckCircle, AlertCircle } from "lucide-react";

const TaskAutomation = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Automate Billing",
      description: "Generate and send monthly bills to clients automatically.",
      status: "Active",
    },
    {
      id: 2,
      name: "Plan Renewals",
      description: "Automatically renew plans for subscribed users.",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Send Notifications",
      description: "Notify clients about data usage thresholds and updates.",
      status: "Active",
    },
  ]);

  const toggleTaskStatus = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "Active" ? "Inactive" : "Active" }
          : task
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Task Automation
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Automate routine tasks like billing, notifications, or plan renewals to save time and reduce manual effort.
      </p>

      {/* Automation Tasks */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow ${
              task.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              {task.status === "Active" ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-bold">{task.name}</p>
                <p className="text-sm">{task.description}</p>
              </div>
            </div>
            <button
              onClick={() => toggleTaskStatus(task.id)}
              className={`flex items-center px-4 py-2 rounded text-white ${
                task.status === "Active" ? "bg-red-600" : "bg-green-600"
              } hover:opacity-90`}
            >
              {task.status === "Active" ? (
                <>
                  <PauseCircle className="w-5 h-5 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Activate
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* No Tasks Placeholder */}
      {tasks.length === 0 && (
        <div className="text-center text-gray-600 mt-6">
          <p>No tasks have been configured yet.</p>
        </div>
      )}
    </div>
  );
};

export default TaskAutomation;
