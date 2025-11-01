


// import React from "react";
// import { motion } from "framer-motion";
// import { X, Check, Plus, Box, Wifi, Cable } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";
// import { formatNumber } from "../Shared/formatters";

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
//             </div>
//           </div>

//           <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//             <h4 className="font-semibold mb-2">Access Methods</h4>
//             <div className="space-y-2 text-sm">
//               {accessMethods.hotspot?.enabled && (
//                 <div className="flex items-center">
//                   <Check className="w-4 h-4 text-green-600 mr-2" />
//                   <span>Hotspot</span>
//                 </div>
//               )}
//               {accessMethods.pppoe?.enabled && (
//                 <div className="flex items-center">
//                   <Check className="w-4 h-4 text-green-600 mr-2" />
//                   <span>PPPoE</span>
//                 </div>
//               )}
//               {(!accessMethods.hotspot?.enabled && !accessMethods.pppoe?.enabled) && (
//                 <p className={themeClasses.text.secondary}>No access methods enabled</p>
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
//                   <span>Connections:</span>
//                   <span className="font-medium">
//                     {accessMethods.hotspot.concurrentConnections || 1}
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
//                   <span>Connections:</span>
//                   <span className="font-medium">
//                     {accessMethods.pppoe.concurrentConnections || 1}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-indigo-600">{template.name}</h2>
            <p className={`mt-1 ${themeClasses.text.secondary}`}>
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className="font-semibold mb-2">Template Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{template.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span className="font-medium">Ksh {formatNumber(template.basePrice || template.base_price || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Usage Count:</span>
                <span className="font-medium">{template.usageCount || template.usage_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${
                  template.isActive !== false ? 'text-green-600' : 'text-red-600'
                }`}>
                  {template.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Visibility:</span>
                <span className={`font-medium ${
                  template.isPublic ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {template.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <h4 className="font-semibold mb-2">Advanced Settings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Priority Level:</span>
                <span className={`font-medium flex items-center ${priorityInfo.color}`}>
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {priorityInfo.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Router Specific:</span>
                <span className="font-medium">
                  {template.router_specific ? 'Yes' : 'No'}
                </span>
              </div>
              {template.FUP_threshold && (
                <div className="flex justify-between">
                  <span>FUP Threshold:</span>
                  <span className="font-medium">
                    {template.FUP_threshold}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hotspot Configuration */}
          {accessMethods.hotspot?.enabled && (
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-4">
                <Wifi className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Hotspot Configuration</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Download Speed:</span>
                  <span className="font-medium">
                    {accessMethods.hotspot.downloadSpeed?.value || '0'} {accessMethods.hotspot.downloadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upload Speed:</span>
                  <span className="font-medium">
                    {accessMethods.hotspot.uploadSpeed?.value || '0'} {accessMethods.hotspot.uploadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Limit:</span>
                  <span className="font-medium">
                    {accessMethods.hotspot.dataLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.hotspot.dataLimit?.value || '0'} ${accessMethods.hotspot.dataLimit?.unit || 'GB'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Limit:</span>
                  <span className="font-medium">
                    {accessMethods.hotspot.usageLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.hotspot.usageLimit?.value || '0'} ${accessMethods.hotspot.usageLimit?.unit || 'Hours'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth Limit:</span>
                  <span className="font-medium">
                    {formatBandwidthDisplay(accessMethods.hotspot.bandwidthLimit || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Devices:</span>
                  <span className="font-medium">
                    {accessMethods.hotspot.maxDevices === 0 ? 'Unlimited' : accessMethods.hotspot.maxDevices}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Session Timeout:</span>
                  <span className="font-medium">
                    {formatTimeDisplay(accessMethods.hotspot.sessionTimeout || 86400)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>MAC Binding:</span>
                  <span className="font-medium">
                    {accessMethods.hotspot.macBinding ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PPPoE Configuration */}
          {accessMethods.pppoe?.enabled && (
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-4">
                <Cable className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold">PPPoE Configuration</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Download Speed:</span>
                  <span className="font-medium">
                    {accessMethods.pppoe.downloadSpeed?.value || '0'} {accessMethods.pppoe.downloadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Upload Speed:</span>
                  <span className="font-medium">
                    {accessMethods.pppoe.uploadSpeed?.value || '0'} {accessMethods.pppoe.uploadSpeed?.unit || 'Mbps'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Limit:</span>
                  <span className="font-medium">
                    {accessMethods.pppoe.dataLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.pppoe.dataLimit?.value || '0'} ${accessMethods.pppoe.dataLimit?.unit || 'GB'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Limit:</span>
                  <span className="font-medium">
                    {accessMethods.pppoe.usageLimit?.unit === 'Unlimited' 
                      ? 'Unlimited' 
                      : `${accessMethods.pppoe.usageLimit?.value || '0'} ${accessMethods.pppoe.usageLimit?.unit || 'Hours'}`
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth Limit:</span>
                  <span className="font-medium">
                    {formatBandwidthDisplay(accessMethods.pppoe.bandwidthLimit || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Devices:</span>
                  <span className="font-medium">
                    {accessMethods.pppoe.maxDevices === 0 ? 'Unlimited' : accessMethods.pppoe.maxDevices}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Session Timeout:</span>
                  <span className="font-medium">
                    {formatTimeDisplay(accessMethods.pppoe.sessionTimeout || 86400)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>MAC Binding:</span>
                  <span className="font-medium">
                    {accessMethods.pppoe.macBinding ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {accessMethods.pppoe.ipPool && (
                  <div className="flex justify-between">
                    <span>IP Pool:</span>
                    <span className="font-medium">
                      {accessMethods.pppoe.ipPool}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApplyTemplate(template);
              onClose();
            }}
            className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.primary}`}
          >
            <Box className="w-4 h-4 mr-2" />
            Use This Template
          </button>
          <button
            onClick={() => {
              onCreateFromTemplate(template);
              onClose();
            }}
            className={`px-6 py-2 rounded-lg flex items-center ${themeClasses.button.success}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Create
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplatePreview;