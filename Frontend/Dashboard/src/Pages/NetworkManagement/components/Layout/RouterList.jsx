


// // src/Pages/NetworkManagement/components/Layout/RouterList.jsx
// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Router, AlertTriangle, Plus } from "lucide-react";
// import CustomButton from "../Common/CustomButton";
// import RouterCard from "./RouterCard"
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const RouterList = ({
//   routers = [],
//   isLoading = false,
//   expandedRouter,
//   routerStats = {},
//   theme = "light",
//   onToggleExpand,
//   onViewStats,
//   onRestart,
//   onStatusChange,
//   onEdit,
//   onDelete,
//   onAddRouter,
//   searchTerm = "",
//   filter = "all"
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   const filteredRouters = routers.filter(router => {
//     const matchesStatus = filter === "all" || router.status === filter;
//     const matchesSearch = 
//       router.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       router.ip?.includes(searchTerm) ||
//       (router.model && router.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (router.location && router.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
//     return matchesStatus && matchesSearch;
//   });

//   if (isLoading) {
//     return (
//       <div className={`p-8 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }

//   if (filteredRouters.length === 0) {
//     return (
//       <div className={`p-8 rounded-xl text-center border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//         <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
//           {routers.length === 0 ? "No Routers Found" : "No Matching Routers"}
//         </h3>
//         <p className={`mb-6 ${themeClasses.text.secondary}`}>
//           {routers.length === 0 
//             ? "Get started by adding your first router to the network."
//             : "No routers match your current search and filter criteria."
//           }
//         </p>
//         {routers.length === 0 && (
//           <div className="flex justify-center">
//             <CustomButton
//               onClick={onAddRouter}
//               icon={<Plus className="w-4 h-4" />}
//               label="Add Your First Router"
//               variant="primary"
//               theme={theme}
//             />
//           </div>
//         )}
//       </div>
//     );
//   }

//   const connectedCount = routers.filter(r => r.status === "connected").length;
//   const disconnectedCount = routers.filter(r => r.status === "disconnected").length;
//   const updatingCount = routers.filter(r => r.status === "updating").length;
//   const maintenanceCount = routers.filter(r => r.status === "updating" || r.status === "error").length;

//   return (
//     <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
//         <h2 className={`text-xl font-semibold flex items-center ${themeClasses.text.primary}`}>
//           <Router className="w-6 h-6 mr-2" />
//           Network Routers
//           <span className={`text-sm font-normal ml-2 ${themeClasses.text.secondary}`}>
//             ({filteredRouters.length} of {routers.length})
//           </span>
//         </h2>
        
//         <div className={`flex items-center space-x-2 text-sm ${themeClasses.text.secondary}`}>
//           <div className="flex items-center space-x-1">
//             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//             <span>Connected: {connectedCount}</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//             <span>Disconnected: {disconnectedCount}</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
//             <span>Updating: {updatingCount}</span>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         <div className="space-y-4">
//           {filteredRouters.map((router, index) => (
//             <motion.div
//               key={router.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3, delay: index * 0.1 }}
//             >
//               <RouterCard
//                 router={router}
//                 isExpanded={expandedRouter === router.id}
//                 routerStats={routerStats}
//                 theme={theme}
//                 onToggleExpand={onToggleExpand}
//                 onViewStats={onViewStats}
//                 onRestart={onRestart}
//                 onStatusChange={onStatusChange}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//               />
//             </motion.div>
//           ))}
//         </div>
//       </AnimatePresence>

//       <div className={`mt-6 p-4 rounded-lg border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//           <div>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Total Routers</p>
//             <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{routers.length}</p>
//           </div>
//           <div>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Online</p>
//             <p className="text-xl font-bold text-green-600 dark:text-green-400">
//               {connectedCount}
//             </p>
//           </div>
//           <div>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Offline</p>
//             <p className="text-xl font-bold text-red-600 dark:text-red-400">
//               {disconnectedCount}
//             </p>
//           </div>
//           <div>
//             <p className={`text-sm ${themeClasses.text.secondary}`}>Maintenance</p>
//             <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
//               {maintenanceCount}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RouterList;








// src/Pages/NetworkManagement/components/Layout/RouterList.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Router, AlertTriangle, Plus, Filter, Search } from "lucide-react";
import CustomButton from "../Common/CustomButton";
import RouterCard from "./RouterCard"
import { getThemeClasses, EnhancedSelect } from "../../../../components/ServiceManagement/Shared/components"

const RouterList = ({
  routers = [],
  isLoading = false,
  expandedRouter,
  routerStats = {},
  theme = "light",
  onToggleExpand,
  onViewStats,
  onRestart,
  onStatusChange,
  onEdit,
  onDelete,
  onAddRouter,
  onTestConnection,
  onRunDiagnostics,
  onConfigureScript,
  onConfigureVPN,
  searchTerm = "",
  filter = "all",
  dispatch
}) => {
  const themeClasses = getThemeClasses(theme);

  const filterOptions = [
    { value: "all", label: "All Routers" },
    { value: "connected", label: "Connected" },
    { value: "disconnected", label: "Disconnected" },
    { value: "configured", label: "Configured" },
    { value: "not_configured", label: "Not Configured" },
    { value: "partially_configured", label: "Partially Configured" },
    { value: "hotspot", label: "Hotspot" },
    { value: "pppoe", label: "PPPoE" },
    { value: "vpn", label: "VPN" },
  ];

  const filteredRouters = routers.filter(router => {
    const matchesStatus = filter === "all" || 
      (filter === "connected" && router.connection_status === "connected") ||
      (filter === "disconnected" && router.connection_status === "disconnected") ||
      (filter === "configured" && router.configuration_status === "configured") ||
      (filter === "not_configured" && router.configuration_status === "not_configured") ||
      (filter === "partially_configured" && router.configuration_status === "partially_configured") ||
      (filter === "hotspot" && router.configuration_type === "hotspot") ||
      (filter === "pppoe" && router.configuration_type === "pppoe") ||
      (filter === "vpn" && router.configuration_type?.includes("vpn"));
    
    const matchesSearch = 
      router.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      router.ip?.includes(searchTerm) ||
      (router.model && router.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (router.location && router.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (router.ssid && router.ssid.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className={`p-8 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (filteredRouters.length === 0) {
    return (
      <div className={`p-8 rounded-xl text-center border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
          {routers.length === 0 ? "No Routers Found" : "No Matching Routers"}
        </h3>
        <p className={`mb-6 ${themeClasses.text.secondary}`}>
          {routers.length === 0 
            ? "Get started by adding your first router to the network."
            : "No routers match your current search and filter criteria."
          }
        </p>
        {routers.length === 0 && (
          <div className="flex justify-center">
            <CustomButton
              onClick={onAddRouter}
              icon={<Plus className="w-4 h-4" />}
              label="Add Your First Router"
              variant="primary"
              theme={theme}
            />
          </div>
        )}
      </div>
    );
  }

  const connectedCount = routers.filter(r => r.connection_status === "connected").length;
  const disconnectedCount = routers.filter(r => r.connection_status === "disconnected").length;
  const configuredCount = routers.filter(r => r.configuration_status === "configured").length;
  const notConfiguredCount = routers.filter(r => r.configuration_status === "not_configured").length;
  const partiallyConfiguredCount = routers.filter(r => r.configuration_status === "partially_configured").length;

  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <Router className="w-6 h-6 text-blue-500" />
          <div>
            <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
              Network Routers
            </h2>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              {filteredRouters.length} of {routers.length} routers
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${themeClasses.text.tertiary}`} />
            </div>
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-300 ${themeClasses.input}`}
              placeholder="Search routers..."
              value={searchTerm}
              onChange={(e) => dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })}
            />
          </div>
          
          <EnhancedSelect
            value={filter}
            onChange={(value) => dispatch({ type: "SET_FILTER", payload: value })}
            options={filterOptions}
            placeholder="Filter routers"
            className="w-full lg:w-48"
            theme={theme}
          />
        </div>
      </div>

      {/* Statistics Overview */}
      <div className={`p-4 rounded-lg border mb-6 ${
        theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className={`text-sm ${themeClasses.text.secondary}`}>Total</p>
            <p className={`text-xl font-bold ${themeClasses.text.primary}`}>{routers.length}</p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.secondary}`}>Connected</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {connectedCount}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.secondary}`}>Disconnected</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {disconnectedCount}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.secondary}`}>Configured</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {configuredCount}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text.secondary}`}>Partial/None</p>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
              {partiallyConfiguredCount + notConfiguredCount}
            </p>
          </div>
        </div>
      </div>

      {/* Router Cards */}
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
                onTestConnection={onTestConnection}
                onRunDiagnostics={onRunDiagnostics}
                onConfigureScript={onConfigureScript}
                onConfigureVPN={onConfigureVPN}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Configuration Summary */}
      <div className={`mt-6 p-4 rounded-lg border ${
        theme === "dark" ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      }`}>
        <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Configuration Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              configuredCount > 0 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <p className={themeClasses.text.secondary}>Fully Configured</p>
            <p className="font-semibold">{configuredCount}</p>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              partiallyConfiguredCount > 0 ? 'bg-yellow-500' : 'bg-gray-300'
            }`}></div>
            <p className={themeClasses.text.secondary}>Partial Config</p>
            <p className="font-semibold">{partiallyConfiguredCount}</p>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              notConfiguredCount > 0 ? 'bg-red-500' : 'bg-gray-300'
            }`}></div>
            <p className={themeClasses.text.secondary}>Not Configured</p>
            <p className="font-semibold">{notConfiguredCount}</p>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-1"></div>
            <p className={themeClasses.text.secondary}>Hotspot Enabled</p>
            <p className="font-semibold">
              {routers.filter(r => r.configuration_type === 'hotspot' || r.configuration_type === 'both').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouterList;