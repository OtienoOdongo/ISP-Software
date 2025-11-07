


// src/Pages/NetworkManagement/components/Layout/ActiveRouterPanel.jsx
import React from "react";
import { Server, Wifi, Cable, Users, Settings, Lock, RotateCcw } from "lucide-react";
import CustomButton from "../Common/CustomButton";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const ActiveRouterPanel = ({
  activeRouter,
  hotspotUsers = [],
  pppoeUsers = [],
  theme = "light",
  onConfigureHotspot,
  onConfigurePPPoE,
  onManageUsers,
  onCallbackSettings,
  onRestoreSessions
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const activeHotspotUsers = Array.isArray(hotspotUsers) ? hotspotUsers.filter(user => user.active).length : 0;
  const activePPPoEUsers = Array.isArray(pppoeUsers) ? pppoeUsers.filter(user => user.active).length : 0;

  return (
    <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
        <Server className="w-5 h-5 mr-2" />
        Active Router: {activeRouter?.name || "Unknown"}
      </h3>
      
      <div className="space-y-4">
        {/* User Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg text-center border ${
            theme === "dark" ? "bg-blue-900/30 border-blue-800" : "bg-blue-100 border-blue-200"
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span className={`text-sm ${themeClasses.text.secondary}`}>Hotspot Users</span>
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {activeHotspotUsers}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg text-center border ${
            theme === "dark" ? "bg-green-900/30 border-green-800" : "bg-green-100 border-green-200"
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Cable className="w-4 h-4 text-green-500" />
              <span className={`text-sm ${themeClasses.text.secondary}`}>PPPoE Users</span>
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {activePPPoEUsers}
            </div>
          </div>
        </div>

        {/* Router Information */}
        <div className={`p-3 rounded-lg border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-200"}`}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>IP Address</span>
              <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter?.ip || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>Status</span>
              <span className={`font-medium ${
                activeRouter?.status === "connected" ? "text-green-500" :
                activeRouter?.status === "disconnected" ? "text-red-500" : "text-yellow-500"
              }`}>
                {activeRouter?.status?.charAt(0).toUpperCase() + activeRouter?.status?.slice(1) || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>Type</span>
              <span className={`font-medium ${themeClasses.text.primary} capitalize`}>{activeRouter?.type || "N/A"}</span>
            </div>
            {activeRouter?.location && (
              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Location</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>{activeRouter.location}</span>
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
            disabled={activeRouter?.status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onConfigurePPPoE}
            label="Configure PPPoE"
            icon={<Cable className="w-4 h-4" />}
            variant="primary"
            disabled={activeRouter?.status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onManageUsers}
            label="Manage Users"
            icon={<Users className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter?.status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          <CustomButton
            onClick={onCallbackSettings}
            label="Callback Settings"
            icon={<Lock className="w-4 h-4" />}
            variant="secondary"
            disabled={activeRouter?.status !== "connected"}
            fullWidth
            theme={theme}
          />
          
          {activeRouter?.status === "connected" && (
            <CustomButton
              onClick={onRestoreSessions}
              label="Restore Sessions"
              icon={<RotateCcw className="w-4 h-4" />}
              variant="warning"
              fullWidth
              theme={theme}
            />
          )}
        </div>

        {/* Quick Stats */}
        <div className={`p-3 rounded-lg border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-100 border-gray-200"}`}>
          <h4 className={`font-medium text-sm mb-2 ${themeClasses.text.primary}`}>
            Quick Statistics
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>Total Users:</span>
              <span className={`font-medium ${themeClasses.text.primary}`}>{activeHotspotUsers + activePPPoEUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>Hotspot:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{activeHotspotUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>PPPoE:</span>
              <span className="font-medium text-green-600 dark:text-green-400">{activePPPoEUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className={themeClasses.text.secondary}>Capacity:</span>
              <span className={`font-medium ${themeClasses.text.primary}`}>
                {Math.round(((activeHotspotUsers + activePPPoEUsers) / (activeRouter?.max_clients || 50)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRouterPanel;