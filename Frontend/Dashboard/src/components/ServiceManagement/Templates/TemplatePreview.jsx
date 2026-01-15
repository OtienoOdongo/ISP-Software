



// import React from "react";
// import { motion } from "framer-motion";
// import { X, Check, Plus, Box, Wifi, Cable, Shield, TrendingDown } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";
// import { formatNumber, formatBandwidthDisplay } from "../Shared/utils";

// const TemplatePreview = ({ 
//   template, 
//   onClose, 
//   onApplyTemplate, 
//   onCreateFromTemplate, 
//   theme 
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Helper function to safely access access methods
//   const getAccessMethods = (template) => {
//     return template.accessMethods || template.access_methods || {};
//   };

//   const accessMethods = getAccessMethods(template);

//   // Helper to format time for display
//   const formatTimeDisplay = (seconds) => {
//     if (seconds === 0) return "No Limit";
//     const hours = seconds / 3600;
//     if (hours >= 24) {
//       const days = hours / 24;
//       return days === 1 ? "1 Day" : `${days} Days`;
//     }
//     return hours === 1 ? "1 Hour" : `${hours} Hours`;
//   };

//   // Get priority level info
//   const getPriorityInfo = (level) => {
//     const priority = {
//       1: { label: "Lowest", color: "text-gray-500" },
//       2: { label: "Low", color: "text-blue-500" },
//       3: { label: "Medium", color: "text-green-500" },
//       4: { label: "High", color: "text-yellow-500" },
//       5: { label: "Highest", color: "text-orange-500" },
//       6: { label: "Critical", color: "text-red-500" },
//       7: { label: "Premium", color: "text-purple-500" },
//       8: { label: "VIP", color: "text-pink-500" },
//     };
//     return priority[level] || priority[4];
//   };

//   const priorityInfo = getPriorityInfo(template.priority_level || 4);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
//       >
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-indigo-600">{template.name}</h2>
//             <p className={`mt-1 ${themeClasses.text.secondary}`}>
//               {template.description}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <h4 className="font-semibold mb-2">Template Information</h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Category:</span>
//                 <span className="font-medium">{template.category}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Base Price:</span>
//                 <span className="font-medium">Ksh {formatNumber(template.basePrice || template.base_price || 0)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Usage Count:</span>
//                 <span className="font-medium">{template.usageCount || template.usage_count || 0}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Status:</span>
//                 <span className={`font-medium ${
//                   template.isActive !== false ? 'text-green-600' : 'text-red-600'
//                 }`}>
//                   {template.isActive !== false ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Visibility:</span>
//                 <span className={`font-medium ${
//                   template.isPublic ? 'text-green-600' : 'text-blue-600'
//                 }`}>
//                   {template.isPublic ? 'Public' : 'Private'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <h4 className="font-semibold mb-2">Advanced Settings</h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Priority Level:</span>
//                 <span className={`font-medium flex items-center ${priorityInfo.color}`}>
//                   <TrendingDown className="w-3 h-3 mr-1" />
//                   {priorityInfo.label}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Router Specific:</span>
//                 <span className="font-medium">
//                   {template.router_specific ? 'Yes' : 'No'}
//                 </span>
//               </div>
//               {template.FUP_threshold && (
//                 <div className="flex justify-between">
//                   <span>FUP Threshold:</span>
//                   <span className="font-medium">
//                     {template.FUP_threshold}%
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Hotspot Configuration */}
//           {accessMethods.hotspot?.enabled && (
//             <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//               <div className="flex items-center mb-4">
//                 <Wifi className="w-6 h-6 text-blue-600 mr-3" />
//                 <h3 className="text-lg font-semibold">Hotspot Configuration</h3>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span>Download Speed:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.downloadSpeed?.value || '0'} {accessMethods.hotspot.downloadSpeed?.unit || 'Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Upload Speed:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.uploadSpeed?.value || '0'} {accessMethods.hotspot.uploadSpeed?.unit || 'Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Data Limit:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.dataLimit?.unit === 'Unlimited' 
//                       ? 'Unlimited' 
//                       : `${accessMethods.hotspot.dataLimit?.value || '0'} ${accessMethods.hotspot.dataLimit?.unit || 'GB'}`
//                     }
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Usage Limit:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.usageLimit?.unit === 'Unlimited' 
//                       ? 'Unlimited' 
//                       : `${accessMethods.hotspot.usageLimit?.value || '0'} ${accessMethods.hotspot.usageLimit?.unit || 'Hours'}`
//                     }
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Bandwidth Limit:</span>
//                   <span className="font-medium">
//                     {formatBandwidthDisplay(accessMethods.hotspot.bandwidthLimit || 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Max Devices:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.maxDevices === 0 ? 'Unlimited' : accessMethods.hotspot.maxDevices}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Session Timeout:</span>
//                   <span className="font-medium">
//                     {formatTimeDisplay(accessMethods.hotspot.sessionTimeout || 86400)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>MAC Binding:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.macBinding ? 'Enabled' : 'Disabled'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* PPPoE Configuration */}
//           {accessMethods.pppoe?.enabled && (
//             <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//               <div className="flex items-center mb-4">
//                 <Cable className="w-6 h-6 text-green-600 mr-3" />
//                 <h3 className="text-lg font-semibold">PPPoE Configuration</h3>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span>Download Speed:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.downloadSpeed?.value || '0'} {accessMethods.pppoe.downloadSpeed?.unit || 'Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Upload Speed:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.uploadSpeed?.value || '0'} {accessMethods.pppoe.uploadSpeed?.unit || 'Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Data Limit:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.dataLimit?.unit === 'Unlimited' 
//                       ? 'Unlimited' 
//                       : `${accessMethods.pppoe.dataLimit?.value || '0'} ${accessMethods.pppoe.dataLimit?.unit || 'GB'}`
//                     }
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Usage Limit:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.usageLimit?.unit === 'Unlimited' 
//                       ? 'Unlimited' 
//                       : `${accessMethods.pppoe.usageLimit?.value || '0'} ${accessMethods.pppoe.usageLimit?.unit || 'Hours'}`
//                     }
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Bandwidth Limit:</span>
//                   <span className="font-medium">
//                     {formatBandwidthDisplay(accessMethods.pppoe.bandwidthLimit || 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Max Devices:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.maxDevices === 0 ? 'Unlimited' : accessMethods.pppoe.maxDevices}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Session Timeout:</span>
//                   <span className="font-medium">
//                     {formatTimeDisplay(accessMethods.pppoe.sessionTimeout || 86400)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>MAC Binding:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.macBinding ? 'Enabled' : 'Disabled'}
//                   </span>
//                 </div>
//                 {accessMethods.pppoe.ipPool && (
//                   <div className="flex justify-between">
//                     <span>IP Pool:</span>
//                     <span className="font-medium">
//                       {accessMethods.pppoe.ipPool}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end space-x-4 mt-8">
//           <button
//             onClick={onClose}
//             className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => {
//               onApplyTemplate(template);
//               onClose();
//             }}
//             className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.primary}`}
//           >
//             <Box className="w-4 h-4 mr-2" />
//             Use This Template
//           </button>
//           <button
//             onClick={() => {
//               onCreateFromTemplate(template);
//               onClose();
//             }}
//             className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Quick Create
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default TemplatePreview;








import React from "react";
import { motion } from "framer-motion";
import { X, Check, Plus, Box, Wifi, Cable, Shield, TrendingDown } from "lucide-react";
import { getThemeClasses } from "../Shared/components";
import { formatNumber, formatBandwidthDisplay } from "../Shared/utils";

const TemplatePreview = ({ 
  template, 
  onClose, 
  onApplyTemplate, 
  onCreateFromTemplate, 
  theme 
}) => {
  const themeClasses = getThemeClasses(theme);

  // Helper function to safely access access methods
  const getAccessMethods = (template) => {
    return template.accessMethods || template.access_methods || {};
  };

  const accessMethods = getAccessMethods(template);

  // Helper to format time for display
  const formatTimeDisplay = (seconds) => {
    if (seconds === 0) return "No Limit";
    const hours = seconds / 3600;
    if (hours >= 24) {
      const days = hours / 24;
      return days === 1 ? "1 Day" : `${days} Days`;
    }
    return hours === 1 ? "1 Hour" : `${hours} Hours`;
  };

  // Get priority level info
  const getPriorityInfo = (level) => {
    const priority = {
      1: { label: "Lowest", color: "text-gray-500" },
      2: { label: "Low", color: "text-blue-500" },
      3: { label: "Medium", color: "text-green-500" },
      4: { label: "High", color: "text-yellow-500" },
      5: { label: "Highest", color: "text-orange-500" },
      6: { label: "Critical", color: "text-red-500" },
      7: { label: "Premium", color: "text-purple-500" },
      8: { label: "VIP", color: "text-pink-500" },
    };
    return priority[level] || priority[4];
  };

  const priorityInfo = getPriorityInfo(template.priority_level || 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-3 sm:p-4 md:p-6`}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600 truncate">
              {template.name}
            </h2>
            <p className={`mt-1 text-xs sm:text-sm ${themeClasses.text.secondary} truncate`}>
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex-shrink-0 ml-2"
            aria-label="Close preview"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Template Information</h4>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="truncate mr-2">Category:</span>
                <span className="font-medium truncate">{template.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="truncate mr-2">Base Price:</span>
                <span className="font-medium truncate">Ksh {formatNumber(template.basePrice || template.base_price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="truncate mr-2">Usage Count:</span>
                <span className="font-medium truncate">{template.usageCount || template.usage_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="truncate mr-2">Status:</span>
                <span className={`font-medium truncate ${
                  template.isActive !== false ? 'text-green-600' : 'text-red-600'
                }`}>
                  {template.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="truncate mr-2">Visibility:</span>
                <span className={`font-medium truncate ${
                  template.isPublic ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {template.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Advanced Settings</h4>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="truncate mr-2">Priority Level:</span>
                <span className={`font-medium flex items-center ${priorityInfo.color} truncate`}>
                  <TrendingDown className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{priorityInfo.label}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="truncate mr-2">Router Specific:</span>
                <span className="font-medium truncate">
                  {template.router_specific ? 'Yes' : 'No'}
                </span>
              </div>
              {template.FUP_threshold && (
                <div className="flex justify-between">
                  <span className="truncate mr-2">FUP Threshold:</span>
                  <span className="font-medium truncate">
                    {template.FUP_threshold}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Hotspot Configuration */}
          {accessMethods.hotspot?.enabled && (
            <div className={`p-3 sm:p-4 md:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-3 sm:mb-4">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold">Hotspot Configuration</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="truncate mr-2">Download Speed:</span>
                  <span className="font-medium truncate">
                    {accessMethods.hotspot.downloadSpeed?.value || '0'} {accessMethods.hotspot.downloadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Upload Speed:</span>
                  <span className="font-medium truncate">
                    {accessMethods.hotspot.uploadSpeed?.value || '0'} {accessMethods.hotspot.uploadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Data Limit:</span>
                  <span className="font-medium truncate">
                    {accessMethods.hotspot.dataLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.hotspot.dataLimit?.value || '0'} ${accessMethods.hotspot.dataLimit?.unit || 'GB'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Usage Limit:</span>
                  <span className="font-medium truncate">
                    {accessMethods.hotspot.usageLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.hotspot.usageLimit?.value || '0'} ${accessMethods.hotspot.usageLimit?.unit || 'Hours'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Bandwidth Limit:</span>
                  <span className="font-medium truncate">
                    {formatBandwidthDisplay(accessMethods.hotspot.bandwidthLimit || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Max Devices:</span>
                  <span className="font-medium truncate">
                    {accessMethods.hotspot.maxDevices === 0 ? 'Unlimited' : accessMethods.hotspot.maxDevices}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Session Timeout:</span>
                  <span className="font-medium truncate">
                    {formatTimeDisplay(accessMethods.hotspot.sessionTimeout || 86400)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">MAC Binding:</span>
                  <span className="font-medium truncate">
                    {accessMethods.hotspot.macBinding ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PPPoE Configuration */}
          {accessMethods.pppoe?.enabled && (
            <div className={`p-3 sm:p-4 md:p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-3 sm:mb-4">
                <Cable className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold">PPPoE Configuration</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="truncate mr-2">Download Speed:</span>
                  <span className="font-medium truncate">
                    {accessMethods.pppoe.downloadSpeed?.value || '0'} {accessMethods.pppoe.downloadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Upload Speed:</span>
                  <span className="font-medium truncate">
                    {accessMethods.pppoe.uploadSpeed?.value || '0'} {accessMethods.pppoe.uploadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Data Limit:</span>
                  <span className="font-medium truncate">
                    {accessMethods.pppoe.dataLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.pppoe.dataLimit?.value || '0'} ${accessMethods.pppoe.dataLimit?.unit || 'GB'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Usage Limit:</span>
                  <span className="font-medium truncate">
                    {accessMethods.pppoe.usageLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.pppoe.usageLimit?.value || '0'} ${accessMethods.pppoe.usageLimit?.unit || 'Hours'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Bandwidth Limit:</span>
                  <span className="font-medium truncate">
                    {formatBandwidthDisplay(accessMethods.pppoe.bandwidthLimit || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Max Devices:</span>
                  <span className="font-medium truncate">
                    {accessMethods.pppoe.maxDevices === 0 ? 'Unlimited' : accessMethods.pppoe.maxDevices}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">Session Timeout:</span>
                  <span className="font-medium truncate">
                    {formatTimeDisplay(accessMethods.pppoe.sessionTimeout || 86400)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="truncate mr-2">MAC Binding:</span>
                  <span className="font-medium truncate">
                    {accessMethods.pppoe.macBinding ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {accessMethods.pppoe.ipPool && (
                  <div className="flex justify-between">
                    <span className="truncate mr-2">IP Pool:</span>
                    <span className="font-medium truncate">
                      {accessMethods.pppoe.ipPool}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4 mt-4 sm:mt-6 md:mt-8">
          <button
            onClick={onClose}
            className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg ${themeClasses.button.secondary} text-sm sm:text-base`}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyTemplate(template);
              onClose();
            }}
            className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg flex items-center justify-center ${themeClasses.button.primary} text-sm sm:text-base`}
            type="button"
          >
            <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Use This Template</span>
          </button>
          <button
            onClick={() => {
              onCreateFromTemplate(template);
              onClose();
            }}
            className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-lg flex items-center justify-center ${themeClasses.button.success} text-sm sm:text-base`}
            type="button"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Quick Create</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplatePreview;