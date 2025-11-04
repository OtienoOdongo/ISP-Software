// src/Pages/NetworkManagement/components/Layout/RouterList.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Router, AlertTriangle, Plus } from "lucide-react";
import CustomButton from "../Common/CustomButton";
import RouterCard from "./RouterCard";

const RouterList = ({
  routers,
  isLoading,
  expandedRouter,
  routerStats,
  theme,
  onToggleExpand,
  onViewStats,
  onRestart,
  onStatusChange,
  onEdit,
  onDelete,
  searchTerm,
  filter
}) => {
  const filteredRouters = routers.filter(router => {
    const matchesStatus = filter === "all" || router.status === filter;
    const matchesSearch = 
      router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      router.ip.includes(searchTerm) ||
      (router.model && router.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (router.location && router.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className={`p-8 rounded-xl ${
        theme === "dark" ? "bg-gray-800/80" : "bg-white"
      }`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (filteredRouters.length === 0) {
    return (
      <div className={`p-8 rounded-xl text-center ${
        theme === "dark" ? "bg-gray-800/80" : "bg-white"
      }`}>
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {routers.length === 0 ? "No Routers Found" : "No Matching Routers"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {routers.length === 0 
            ? "Get started by adding your first router to the network."
            : "No routers match your current search and filter criteria."
          }
        </p>
        {routers.length === 0 && (
          <CustomButton
            onClick={() => {
              // This would be handled by the parent component
              console.log("Add first router");
            }}
            icon={<Plus className="w-4 h-4" />}
            label="Add Your First Router"
            variant="primary"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${
      theme === "dark" ? "bg-gray-800/80" : "bg-white"
    }`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Router className="w-6 h-6 mr-2" />
          Network Routers
          <span className="text-sm font-normal ml-2 text-gray-500 dark:text-gray-400">
            ({filteredRouters.length} of {routers.length})
          </span>
        </h2>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected: {routers.filter(r => r.status === "connected").length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Disconnected: {routers.filter(r => r.status === "disconnected").length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Updating: {routers.filter(r => r.status === "updating").length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <div className="space-y-4">
          {filteredRouters.map((router, index) => (
            <motion.div
              key={router.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <RouterCard
                router={router}
                isExpanded={expandedRouter === router.id}
                routerStats={routerStats}
                theme={theme}
                onToggleExpand={onToggleExpand}
                onViewStats={onViewStats}
                onRestart={onRestart}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Summary Footer */}
      <div className={`mt-6 p-4 rounded-lg ${
        theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Routers</p>
            <p className="text-xl font-bold">{routers.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {routers.filter(r => r.status === "connected").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {routers.filter(r => r.status === "disconnected").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance</p>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {routers.filter(r => r.status === "updating" || r.status === "error").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouterList;