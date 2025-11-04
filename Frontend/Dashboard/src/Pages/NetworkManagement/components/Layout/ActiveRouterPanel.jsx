// src/Pages/NetworkManagement/components/Layout/ActiveRouterPanel.jsx
import React from "react";
import { Server, Wifi, Cable, Users, Settings, Lock, RotateCcw } from "lucide-react";
import CustomButton from "../Common/CustomButton";

const ActiveRouterPanel = ({
  activeRouter,
  hotspotUsers,
  pppoeUsers,
  theme,
  onConfigureHotspot,
  onConfigurePPPoE,
  onManageUsers,
  onCallbackSettings,
  onRestoreSessions
}) => {
  const activeHotspotUsers = hotspotUsers.filter(user => user.active).length;
  const activePPPoEUsers = pppoeUsers.filter(user => user.active).length;

  return (
    <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${
      theme === "dark" 
        ? "bg-gray-800/80 border border-gray-700" 
        : "bg-white/80 border border-gray-200"
    }`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Server className="w-5 h-5 mr-2" />
        Active Router: {activeRouter.name}
      </h3>
      
      <div className="space-y-4">
        {/* User Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg text-center ${
            theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Hotspot Users</span>
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {activeHotspotUsers}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg text-center ${
            theme === "dark" ? "bg-green-900/30" : "bg-green-100"
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Cable className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">PPPoE Users</span>
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {activePPPoEUsers}
            </div>
          </div>
        </div>

        {/* Router Information */}
        <div className={`p-3 rounded-lg ${
          theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
        }`}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">IP Address</span>
              <span className="font-medium">{activeRouter.ip}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`font-medium ${
                activeRouter.status === "connected" ? "text-green-500" :
                activeRouter.status === "disconnected" ? "text-red-500" : "text-yellow-500"
              }`}>
                {activeRouter.status.charAt(0).toUpperCase() + activeRouter.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Type</span>
              <span className="font-medium capitalize">{activeRouter.type}</span>
            </div>
            {activeRouter.location && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location</span>
                <span className="font-medium">{activeRouter.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <CustomButton
            onClick={onConfigureHotspot}
            label="Configure Hotspot"
            icon={<Wifi className="w-4 h-4" />}
            variant="primary"
            disabled={activeRouter.status !== "connected"}
            fullWidth
          />
          
          <CustomButton
            onClick={onConfigurePPPoE}
            label="Configure PPPoE"
            icon={<Cable className="w-4 h-4" />}
            variant="primary"
            disabled={activeRouter.status !== "connected"}
            fullWidth
          />
          
          <CustomButton
            onClick={onManageUsers}
            label="Manage Users"
            icon={<Users className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter.status !== "connected"}
            fullWidth
          />
          
          <CustomButton
            onClick={onCallbackSettings}
            label="Callback Settings"
            icon={<Lock className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter.status !== "connected"}
            fullWidth
          />
          
          {activeRouter.status === "connected" && (
            <CustomButton
              onClick={onRestoreSessions}
              label="Restore Sessions"
              icon={<RotateCcw className="w-4 h-4" />}
              variant="warning"
              fullWidth
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className={`p-3 rounded-lg ${
          theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
        }`}>
          <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
            Quick Statistics
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-medium">{activeHotspotUsers + activePPPoEUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Hotspot:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{activeHotspotUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>PPPoE:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{activePPPoEUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Capacity:</span>
              <span className="font-medium">
                {Math.round(((activeHotspotUsers + activePPPoEUsers) / (activeRouter.max_clients || 50)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRouterPanel;