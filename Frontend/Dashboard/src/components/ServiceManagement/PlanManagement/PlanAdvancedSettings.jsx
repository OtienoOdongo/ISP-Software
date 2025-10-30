

// import React, { useState } from "react";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { priorityOptions } from "../Shared/constant";
// import { Search, Info } from "lucide-react";

// const PlanAdvancedSettings = ({ form, errors, onChange, routers, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [searchTerm, setSearchTerm] = useState("");

//   const filteredRouters = routers.filter(r => 
//     (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (r.location || "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const toggleRouter = (id) => {
//     const ids = form.allowed_routers_ids.includes(id)
//       ? form.allowed_routers_ids.filter(x => x !== id)
//       : [...form.allowed_routers_ids, id];
//     onChange({ target: { name: 'allowed_routers_ids', value: ids } });
//   };

//   return (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg lg:text-xl font-semibold mb-5">Advanced Settings</h3>
//       <div className="space-y-6">

//         {/* Priority */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
//             Traffic Priority
//             <Info className="inline w-3.5 h-3.5 ml-1 text-gray-500" />
//           </label>
//           <EnhancedSelect
//             value={form.priority_level}
//             onChange={(v) => onChange({ target: { name: 'priority_level', value: +v } })}
//             options={priorityOptions.map(o => ({ value: o.value, label: `${o.label} — Level ${o.value}` }))}
//             theme={theme}
//           />
//         </div>

//         {/* Router Specific */}
//         <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
//           <div>
//             <label className={`block text-sm font-medium ${themeClasses.text.primary}`}>Router-Specific Plan</label>
//             <p className="text-xs text-gray-500">Limit to selected routers only</p>
//           </div>
//           <div 
//             onClick={() => onChange({ target: { name: 'router_specific', checked: !form.router_specific } })}
//             className={`relative inline-flex h-6 w-11 rounded-full cursor-pointer transition-colors ${
//               form.router_specific ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
//             }`}
//           >
//             <span className={`inline-block h-4 w-4 bg-white rounded-full shadow transition-transform ${
//               form.router_specific ? 'translate-x-6' : 'translate-x-1'
//             }`} />
//           </div>
//         </div>

//         {/* Router List */}
//         {form.router_specific && (
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Allowed Routers</label>
//             <div className="relative mb-2">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search routers..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm ${themeClasses.input}`}
//               />
//             </div>
//             <div className={`max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//               {filteredRouters.length === 0 ? (
//                 <p className="text-sm text-center text-gray-500 py-4">No routers found</p>
//               ) : (
//                 filteredRouters.map(router => (
//                   <label key={router.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={form.allowed_routers_ids.includes(router.id)}
//                       onChange={() => toggleRouter(router.id)}
//                       className="h-4 w-4 text-indigo-600 rounded border-gray-300"
//                     />
//                     <span className="ml-2 text-sm flex-1 truncate">
//                       {router.name || `Router ${router.id}`}
//                       {router.location && <span className="text-xs text-gray-500 ml-1">— {router.location}</span>}
//                     </span>
//                   </label>
//                 ))
//               )}
//             </div>
//           </div>
//         )}

//         {/* FUP */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               FUP Policy
//               <Info className="inline w-3.5 h-3.5 ml-1 text-gray-500" />
//             </label>
//             <input
//               name="FUP_policy"
//               value={form.FUP_policy || ""}
//               onChange={onChange}
//               className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.input}`}
//               placeholder="e.g., Reduce to 1 Mbps"
//             />
//           </div>
//           <div>
//             <label className={`block text-sm font-medium mb-1 ${themeClasses.text.primary}`}>
//               FUP Trigger (%)
//             </label>
//             <input
//               type="number"
//               value={form.FUP_threshold || 80}
//               onChange={(e) => onChange({ target: { name: 'FUP_threshold', value: +e.target.value || 80 } })}
//               className={`w-full px-3 py-2 rounded-lg text-sm ${themeClasses.input}`}
//               min="0" max="100"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanAdvancedSettings;













import React from "react";
import { motion } from "framer-motion";
import { EnhancedSelect, getThemeClasses } from "../Shared/components"
import { priorityOptions } from "../Shared/constant"
import { Settings, Router, Shield, TrendingDown } from "lucide-react";

const PlanAdvancedSettings = ({ form, errors, onChange, routers, theme }) => {
  const themeClasses = getThemeClasses(theme);

  const toggleRouterSelection = (routerId) => {
    const currentRouters = [...form.allowed_routers_ids];
    const index = currentRouters.indexOf(routerId);
    
    if (index > -1) {
      currentRouters.splice(index, 1);
    } else {
      currentRouters.push(routerId);
    }
    
    onChange({ target: { name: 'allowed_routers_ids', value: currentRouters } });
  };

  // Priority level descriptions for better UX
  const getPriorityDescription = (level) => {
    const descriptions = {
      1: "Background tasks, lowest priority",
      2: "Standard browsing, low priority",
      3: "Normal usage, medium priority",
      4: "Streaming, high priority",
      5: "Gaming, very high priority",
      6: "Critical applications",
      7: "Premium users",
      8: "VIP/Administrative"
    };
    return descriptions[level] || "Standard priority";
  };

  return (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-indigo-600" />
        Advanced Settings
      </h3>
      
      <div className="space-y-6">
        {/* Priority Level with Enhanced UX */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
            <TrendingDown className="w-4 h-4 mr-2" />
            Network Priority
          </label>
          
          <div className="mb-3">
            <EnhancedSelect
              value={form.priority_level}
              onChange={(value) => onChange({ target: { name: 'priority_level', value: parseInt(value, 10) } })}
              options={priorityOptions.map(opt => ({ 
                value: opt.value, 
                label: `${opt.label} - Level ${opt.value}`
              }))}
              theme={theme}
            />
          </div>
          
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-800/20' : 'bg-blue-100'}`}>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Current:</strong> {getPriorityDescription(form.priority_level)}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Higher priority plans get better network performance during congestion
            </p>
          </div>
          
          {errors.priority_level && <p className="text-red-500 text-xs mt-2">{errors.priority_level}</p>}
        </div>
        
        {/* Router Restrictions */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-purple-900/10' : 'bg-purple-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${themeClasses.text.primary} flex items-center`}>
                <Router className="w-4 h-4 mr-2" />
                Router Restrictions
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Limit this plan to specific routers only
              </p>
            </div>
            <div 
              onClick={() => onChange({ target: { name: 'router_specific', type: 'checkbox', checked: !form.router_specific } })} 
              className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                form.router_specific 
                  ? 'bg-indigo-600'
                  : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                form.router_specific ? "translate-x-6" : "translate-x-1"
              }`} />
            </div>
          </div>
          
          {form.router_specific && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Allowed Routers
                <span className="text-xs text-gray-500 ml-2">- Select where this plan will be available</span>
              </label>
              
              {routers.length === 0 ? (
                <div className={`p-4 text-center rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>No routers available in your network.</p>
                </div>
              ) : (
                <div className={`space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 ${themeClasses.border.light} ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  {routers.map((router) => (
                    <div 
                      key={router.id} 
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        form.allowed_routers_ids.includes(router.id)
                          ? theme === 'dark' ? 'bg-indigo-900/50 border-indigo-500' : 'bg-indigo-50 border-indigo-300'
                          : theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                      } border`}
                      onClick={() => toggleRouterSelection(router.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={form.allowed_routers_ids.includes(router.id)} 
                        onChange={() => {}} // Handled by parent div click
                        className={`h-4 w-4 focus:ring-indigo-500 border rounded ${
                          theme === 'dark' 
                            ? 'bg-gray-600 border-gray-500 text-indigo-600' 
                            : 'text-indigo-600 border-gray-300'
                        }`}
                      />
                      <label className={`ml-3 text-sm ${themeClasses.text.primary} flex-1 cursor-pointer`}>
                        <div className="font-medium">{router.name || `Router ${router.id}`}</div>
                        {router.location && (
                          <div className="text-xs text-gray-500 mt-1">{router.location}</div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {form.allowed_routers_ids.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  {form.allowed_routers_ids.length} router(s) selected
                </p>
              )}
            </motion.div>
          )}
          {errors.router_specific && <p className="text-red-500 text-xs mt-2">{errors.router_specific}</p>}
        </div>
        
        {/* Fair Usage Policy */}
        <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-orange-900/10' : 'bg-orange-50'}`}>
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.primary} flex items-center`}>
            <Shield className="w-4 h-4 mr-2" />
            Fair Usage Policy (FUP)
          </label>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                FUP Threshold
                <span className="text-xs text-gray-500 ml-2">- When to apply usage limits</span>
              </label>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  value={form.FUP_threshold || 80} 
                  onChange={(e) => onChange({ target: { name: 'FUP_threshold', value: parseInt(e.target.value, 10) || 80 } })} 
                  className="flex-1"
                  min="0" 
                  max="100" 
                  step="1" 
                />
                <span className="text-sm font-medium min-w-12">
                  {form.FUP_threshold || 80}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Policy activates after {form.FUP_threshold || 80}% of usage limit is reached
              </p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Policy Description
                <span className="text-xs text-gray-500 ml-2">- What happens after threshold</span>
              </label>
              <textarea 
                value={form.FUP_policy || ""} 
                onChange={(e) => onChange(e)} 
                name="FUP_policy"
                rows={3}
                className={`w-full px-3 py-2 rounded-lg shadow-sm text-sm ${themeClasses.input}`}
                placeholder="e.g., Speed will be reduced to 1Mbps after reaching the usage threshold to ensure fair usage for all customers..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Clearly describe what changes when the fair usage threshold is reached
              </p>
            </div>
          </div>
        </div>
        
        {/* Summary Card */}
        {(form.router_specific || form.FUP_policy || form.FUP_threshold) && (
          <div className={`p-4 rounded-lg border ${themeClasses.border.light} ${theme === 'dark' ? 'bg-green-900/10' : 'bg-green-50'}`}>
            <h4 className="text-sm font-semibold mb-3 text-green-700 dark:text-green-300">
              Advanced Settings Summary
            </h4>
            <div className="space-y-2 text-sm">
              {form.router_specific && (
                <p><strong>Router Restrictions:</strong> Enabled ({form.allowed_routers_ids.length} routers)</p>
              )}
              {form.FUP_threshold && (
                <p><strong>FUP Threshold:</strong> {form.FUP_threshold}% of usage limit</p>
              )}
              {form.FUP_policy && (
                <p><strong>FUP Policy:</strong> {form.FUP_policy.substring(0, 60)}...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanAdvancedSettings;