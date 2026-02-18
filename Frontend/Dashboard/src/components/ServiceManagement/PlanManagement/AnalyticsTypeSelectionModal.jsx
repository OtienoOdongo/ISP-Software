






// // ============================================================================
// // AnalyticsTypeSelector.jsx - CLEAN & MINIMAL
// // ============================================================================

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, Wifi, Cable, Check } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";

// const COLORS = {
//   hotspot: {
//     bg: 'bg-cyan-500',
//     bgLight: 'bg-cyan-50',
//     bgDark: 'dark:bg-cyan-900/30',
//     border: 'border-cyan-500',
//     text: 'text-cyan-600',
//     textDark: 'dark:text-cyan-400',
//     button: 'bg-cyan-600 hover:bg-cyan-700'
//   },
//   pppoe: {
//     bg: 'bg-violet-500',
//     bgLight: 'bg-violet-50',
//     bgDark: 'dark:bg-violet-900/30',
//     border: 'border-violet-500',
//     text: 'text-violet-600',
//     textDark: 'dark:text-violet-400',
//     button: 'bg-violet-600 hover:bg-violet-700'
//   }
// };

// const AnalyticsTypeSelector = ({ isOpen, onClose, onSelect, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedType, setSelectedType] = useState(null);

//   const analyticsTypes = [
//     {
//       id: "hotspot",
//       name: "Hotspot Analytics",
//       icon: Wifi,
//       color: COLORS.hotspot
//     },
//     {
//       id: "pppoe",
//       name: "PPPoE Analytics",
//       icon: Cable,
//       color: COLORS.pppoe
//     }
//   ];

//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-xl"
//           >
//             {/* Simple Header */}
//             <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//               <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                 Select Analytics
//               </h2>
//               <button
//                 onClick={onClose}
//                 className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//               </button>
//             </div>

//             {/* Options - Simple Cards */}
//             <div className="p-4 space-y-3">
//               {analyticsTypes.map((type) => {
//                 const Icon = type.icon;
//                 const isSelected = selectedType === type.id;
//                 const color = type.color;

//                 return (
//                   <motion.div
//                     key={type.id}
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => setSelectedType(type.id)}
//                     className={`
//                       relative p-4 rounded-xl border-2 cursor-pointer
//                       transition-all duration-200
//                       ${isSelected 
//                         ? `${color.border} ${color.bgLight} ${color.bgDark}` 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
//                       }
//                     `}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-3">
//                         <div className={`p-2.5 rounded-lg ${color.bg} bg-opacity-10`}>
//                           <Icon className={`w-5 h-5 ${color.text} ${color.textDark}`} />
//                         </div>
//                         <span className="font-medium text-gray-900 dark:text-white">
//                           {type.name}
//                         </span>
//                       </div>
                      
//                       {isSelected && (
//                         <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
//                           <Check className="w-3 h-3 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </div>

//             {/* Simple Actions */}
//             <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => selectedType && onSelect(selectedType)}
//                 disabled={!selectedType}
//                 className={`
//                   px-4 py-2 rounded-lg text-sm font-medium text-white
//                   transition-colors
//                   ${selectedType 
//                     ? COLORS[selectedType].button 
//                     : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
//                   }
//                 `}
//               >
//                 View
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default AnalyticsTypeSelector;




// ============================================================================
// AnalyticsTypeSelector.jsx - ENHANCED & COLORFUL (FIXED)
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, Cable, Check, Zap, Activity } from "lucide-react";
import { getThemeClasses } from "../Shared/components";

const COLORS = {
  hotspot: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    light: '#ecfeff',
    dark: '#164e63',
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500',
    text: 'text-cyan-600',
    textDark: 'dark:text-cyan-400',
    button: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700',
    shadow: 'shadow-cyan-500/20'
  },
  pppoe: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    light: '#f5f3ff',
    dark: '#4c1d95',
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500',
    text: 'text-violet-600',
    textDark: 'dark:text-violet-400',
    button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700',
    shadow: 'shadow-violet-500/20'
  }
};

const AnalyticsTypeSelector = ({ isOpen, onClose, onSelect, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedType, setSelectedType] = useState(null);

  const analyticsTypes = [
    {
      id: "hotspot",
      name: "Hotspot Analytics",
      icon: Wifi,
      color: COLORS.hotspot,
      tagline: "Wireless Performance"
    },
    {
      id: "pppoe",
      name: "PPPoE Analytics",
      icon: Cable,
      color: COLORS.pppoe,
      tagline: "Wired Connections"
    }
  ];

  if (!isOpen) return null;

  // Helper function to get border color class safely
  const getBorderColorClass = (color, isSelected) => {
    if (isSelected) return color.border;
    return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Analytics Dashboard
                  </h2>
                  <p className="text-sm text-gray-300 mt-1">
                    Choose analytics view
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Options - Enhanced Cards */}
            <div className="p-5 space-y-4">
              {analyticsTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                const color = type.color;

                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      relative p-5 rounded-xl cursor-pointer
                      transition-all duration-300
                      ${isSelected 
                        ? `bg-gradient-to-r ${color.gradient} text-white shadow-xl ${color.shadow}` 
                        : `${color.bgGradient} border-2 ${getBorderColorClass(color, false)} bg-white dark:bg-gray-800 shadow-md hover:shadow-lg`
                      }
                    `}
                  >
                    {/* Selection glow effect */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-xl bg-white/10"
                      />
                    )}

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Icon container with gradient */}
                        <div className={`
                          p-3 rounded-xl
                          ${isSelected 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${color.gradient} bg-opacity-10`
                          }
                        `}>
                          <Icon className={`
                            w-6 h-6
                            ${isSelected ? 'text-white' : color.text}
                          `} />
                        </div>
                        
                        {/* Text content */}
                        <div>
                          <h3 className={`
                            font-semibold text-lg
                            ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}
                          `}>
                            {type.name}
                          </h3>
                          <p className={`
                            text-sm flex items-center gap-1
                            ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}
                          `}>
                            <Activity className="w-3 h-3" />
                            {type.tagline}
                          </p>
                        </div>
                      </div>
                      
                      {/* Selection indicator with animation */}
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </motion.div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                      )}
                    </div>

                    {/* Decorative dot pattern for selected state */}
                    {isSelected && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Actions with better styling */}
            <div className="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={selectedType ? { scale: 1.05 } : {}}
                whileTap={selectedType ? { scale: 0.95 } : {}}
                onClick={() => selectedType && onSelect(selectedType)}
                disabled={!selectedType}
                className={`
                  px-6 py-2.5 rounded-lg text-sm font-semibold text-white
                  transition-all duration-300 flex items-center gap-2
                  ${selectedType 
                    ? `${COLORS[selectedType].button} shadow-lg` 
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  }
                `}
              >
                {selectedType ? (
                  <>
                    <span>View Analytics</span>
                    <Zap className="w-4 h-4" />
                  </>
                ) : (
                  'Select Option'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsTypeSelector;