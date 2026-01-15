


// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, Wifi, Cable, Check, ArrowRight, Zap, Users, Shield, Clock, Network } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";

// const PlanTypeSelectionModal = ({ isOpen, onClose, onSelect, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedPlanType, setSelectedPlanType] = useState(null);

//   if (!isOpen) return null;

//   const planTypes = [
//     {
//       id: "hotspot",
//       name: "Hotspot Plan",
//       icon: Wifi,
//       color: "blue",
//       gradient: "from-blue-500 to-cyan-500",
//       description: "Wireless internet access for multiple users",
//       features: [
//         { icon: Users, text: "Multi-user support" },
//         { icon: Clock, text: "Session management" },
//         { icon: Shield, text: "MAC binding" },
//         { icon: Zap, text: "Flexible validity" }
//       ]
//     },
//     {
//       id: "pppoe",
//       name: "PPPoE Plan",
//       icon: Cable,
//       color: "emerald",
//       gradient: "from-emerald-500 to-green-500",
//       description: "Wired connection with authentication",
//       features: [
//         { icon: Network, text: "IP pool management" },
//         { icon: Shield, text: "Enhanced security" },
//         { icon: Zap, text: "Stable connection" },
//         { icon: Clock, text: "Usage tracking" }
//       ]
//     }
//   ];

//   const handlePlanSelect = (planTypeId) => {
//     setSelectedPlanType(planTypeId);
//   };

//   const handleContinue = () => {
//     if (selectedPlanType) {
//       onSelect(selectedPlanType);
//     }
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 20 }}
//             transition={{ type: "spring", damping: 30, stiffness: 300 }}
//             className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
//           >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 sm:p-3 md:p-4 lg:p-5 text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Create New Plan</h2>
//                   <p className="text-purple-100 mt-0.5 text-xs sm:text-xs md:text-sm lg:text-base">
//                     Select your preferred connection type
//                   </p>
//                 </div>
//                 <button
//                   onClick={onClose}
//                   className="p-1 sm:p-1.5 rounded-xl hover:bg-white/20 transition-all duration-200"
//                 >
//                   <X className="w-3 h-3 sm:w-4 h-4 md:w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Plan Selection */}
//             <div className="p-2 sm:p-3 md:p-4 lg:p-5">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
//                 {planTypes.map((planType) => {
//                   const IconComponent = planType.icon;
//                   const isSelected = selectedPlanType === planType.id;
                  
//                   return (
//                     <motion.div
//                       key={planType.id}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => handlePlanSelect(planType.id)}
//                       className={`relative p-2 sm:p-3 md:p-4 lg:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
//                         isSelected
//                           ? planType.color === 'blue'
//                             ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-md shadow-blue-500/20'
//                             : 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-md shadow-emerald-500/20'
//                           : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
//                       }`}
//                     >
//                       {/* Selection Checkmark */}
//                       <div className={`absolute -top-1 -right-1 sm:-top-1.5 -right-1.5 w-4 h-4 sm:w-5 h-5 md:w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
//                         isSelected
//                           ? planType.color === 'blue'
//                             ? 'bg-blue-500 text-white shadow-md'
//                             : 'bg-emerald-500 text-white shadow-md'
//                           : 'bg-gray-300 dark:bg-gray-600 scale-0'
//                       }`}>
//                         <Check className="w-2.5 h-2.5 sm:w-3 h-3 md:w-4 h-4" />
//                       </div>

//                       {/* Icon with Gradient */}
//                       <div className={`p-1.5 sm:p-2 md:p-3 rounded-2xl w-10 h-10 sm:w-12 h-12 md:w-14 h-14 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3 bg-gradient-to-r ${planType.gradient} shadow-md`}>
//                         <IconComponent className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 text-white" />
//                       </div>

//                       {/* Content */}
//                       <h3 className={`text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 md:mb-1.5 ${
//                         isSelected
//                           ? planType.color === 'blue'
//                             ? 'text-blue-700 dark:text-blue-300'
//                             : 'text-emerald-700 dark:text-emerald-300'
//                           : 'text-gray-900 dark:text-white'
//                       }`}>
//                         {planType.name}
//                       </h3>
                      
//                       <p className="text-gray-600 dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-3 leading-relaxed text-xs sm:text-xs md:text-sm">
//                         {planType.description}
//                       </p>

//                       {/* Features with Icons */}
//                       <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
//                         {planType.features.map((feature, index) => {
//                           const FeatureIcon = feature.icon;
//                           return (
//                             <div key={index} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
//                               <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${
//                                 planType.color === 'blue'
//                                   ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400'
//                                   : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/30 dark:text-emerald-400'
//                               }`}>
//                                 <FeatureIcon className="w-2.5 h-2.5 sm:w-3 h-3 md:w-3.5 h-3.5" />
//                               </div>
//                               <span className="text-xs sm:text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">
//                                 {feature.text}
//                               </span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </motion.div>
//                   );
//                 })}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3 md:pt-4 gap-2 sm:gap-3 md:gap-0">
//                 <button
//                   onClick={onClose}
//                   className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
//                 >
//                   Cancel
//                 </button>
                
//                 <motion.button
//                   onClick={handleContinue}
//                   disabled={!selectedPlanType}
//                   className={`w-full sm:w-auto px-5 sm:px-6 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
//                     selectedPlanType
//                       ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
//                       : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
//                   } text-xs sm:text-sm`}
//                   whileHover={selectedPlanType ? { scale: 1.05 } : {}}
//                   whileTap={selectedPlanType ? { scale: 0.95 } : {}}
//                 >
//                   <span>Continue to Setup</span>
//                   <ArrowRight className="w-3 h-3 sm:w-4 h-4" />
//                 </motion.button>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default PlanTypeSelectionModal;








import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, Cable, Check, ArrowRight, Zap, Users, Shield, Clock, Network, FileText, LayoutTemplate } from "lucide-react";
import { getThemeClasses } from "../Shared/components";

const PlanTypeSelectionModal = ({ isOpen, onClose, onSelect, theme, templates = [] }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [selectedOption, setSelectedOption] = useState("create"); // "create" or "template"

  if (!isOpen) return null;

  // Count templates by type
  const templateStats = {
    total: templates?.length || 0,
    hotspot: templates?.filter(t => t.accessType === 'hotspot')?.length || 0,
    pppoe: templates?.filter(t => t.accessType === 'pppoe')?.length || 0,
    dual: templates?.filter(t => t.accessType === 'dual')?.length || 0
  };

  // Using unique colors: Olive and Slate
  const planTypes = [
    {
      id: "hotspot",
      name: "Hotspot Plan",
      icon: Wifi,
      color: "olive",
      gradient: "from-olive-600 to-lime-500",
      description: "Wireless internet access with flexible configurations",
      features: [
        { icon: Users, text: "Multi-device support" },
        { icon: Clock, text: "Time variant controls" },
        { icon: Shield, text: "MAC address binding" },
        { icon: Zap, text: "Bandwidth management" }
      ],
      templates: templateStats.hotspot
    },
    {
      id: "pppoe",
      name: "PPPoE Plan",
      icon: Cable,
      color: "slate",
      gradient: "from-slate-700 to-slate-500",
      description: "Wired connection with authentication and IP management",
      features: [
        { icon: Network, text: "IP pool configuration" },
        { icon: Shield, text: "Enhanced security" },
        { icon: Zap, text: "MTU optimization" },
        { icon: Clock, text: "Usage limits" }
      ],
      templates: templateStats.pppoe
    },
    {
      id: "dual",
      name: "Dual Access Plan",
      icon: Network,
      color: "indigo",
      gradient: "from-indigo-700 to-violet-600",
      description: "Combined hotspot and PPPoE access in one plan",
      features: [
        { icon: Wifi, text: "Hotspot access" },
        { icon: Cable, text: "PPPoE connection" },
        { icon: Users, text: "Mixed user support" },
        { icon: Shield, text: "Unified security" }
      ],
      templates: templateStats.dual
    }
  ];

  // Options for plan creation
  const creationOptions = [
    {
      id: "create",
      name: "Create New Plan",
      icon: FileText,
      description: "Start fresh with custom configuration",
      color: "teal"
    },
    {
      id: "template",
      name: "Use Template",
      icon: LayoutTemplate,
      description: "Start from existing template",
      color: "amber",
      disabled: templateStats.total === 0
    }
  ];

  const handlePlanSelect = (planTypeId) => {
    setSelectedPlanType(planTypeId);
  };

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (selectedPlanType && selectedOption) {
      onSelect({
        planType: selectedPlanType,
        creationMethod: selectedOption,
        templateId: selectedOption === 'template' ? null : null
      });
    }
  };

  const getColorClasses = (color) => {
    const baseClasses = {
      olive: {
        text: 'text-olive-700 dark:text-olive-300',
        bg: 'bg-olive-50 dark:bg-olive-900/20',
        border: 'border-olive-500',
        button: 'bg-olive-600 hover:bg-olive-700'
      },
      slate: {
        text: 'text-slate-700 dark:text-slate-300',
        bg: 'bg-slate-50 dark:bg-slate-900/20',
        border: 'border-slate-500',
        button: 'bg-slate-600 hover:bg-slate-700'
      },
      indigo: {
        text: 'text-indigo-700 dark:text-indigo-300',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-500',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      teal: {
        text: 'text-teal-700 dark:text-teal-300',
        bg: 'bg-teal-50 dark:bg-teal-900/20',
        border: 'border-teal-500'
      },
      amber: {
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-500'
      }
    };
    return baseClasses[color] || baseClasses.teal;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header - Using unique olive/slate gradient */}
            <div className="bg-gradient-to-r from-olive-700 via-slate-600 to-indigo-700 p-2 sm:p-3 md:p-4 lg:p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Create Internet Plan</h2>
                  <p className="text-olive-100 mt-0.5 text-xs sm:text-xs md:text-sm lg:text-base">
                    Select plan type and creation method
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 sm:p-1.5 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <X className="w-3 h-3 sm:w-4 h-4 md:w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-2 sm:p-3 md:p-4 lg:p-5">
              {/* Plan Selection */}
              <div className="mb-3 sm:mb-4 md:mb-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2 md:mb-3 text-gray-900 dark:text-white">
                  Select Plan Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {planTypes.map((planType) => {
                    const IconComponent = planType.icon;
                    const isSelected = selectedPlanType === planType.id;
                    const colorClasses = getColorClasses(planType.color);
                    
                    return (
                      <motion.div
                        key={planType.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlanSelect(planType.id)}
                        className={`relative p-2 sm:p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? `${colorClasses.border} ${colorClasses.bg} shadow-md`
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {/* Selection Checkmark */}
                        <div className={`absolute -top-1 -right-1 sm:-top-1.5 -right-1.5 w-4 h-4 sm:w-5 h-5 md:w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-white shadow-md'
                            : 'bg-gray-300 dark:bg-gray-600 scale-0'
                        }`}>
                          <Check className={`w-2.5 h-2.5 sm:w-3 h-3 md:w-4 h-4 ${colorClasses.text}`} />
                        </div>

                        {/* Icon with Gradient */}
                        <div className={`p-1.5 sm:p-2 md:p-3 rounded-2xl w-10 h-10 sm:w-12 h-12 md:w-14 h-14 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3 bg-gradient-to-r ${planType.gradient} shadow-md`}>
                          <IconComponent className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className={`text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 md:mb-1.5 ${
                          isSelected ? colorClasses.text : 'text-gray-900 dark:text-white'
                        }`}>
                          {planType.name}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-3 leading-relaxed text-xs sm:text-xs md:text-sm">
                          {planType.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5 mb-2 sm:mb-3 md:mb-4">
                          {planType.features.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <div key={index} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                                <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${
                                  planType.color === 'olive'
                                    ? 'bg-olive-100 text-olive-600 dark:bg-olive-800/30 dark:text-olive-400'
                                    : planType.color === 'slate'
                                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400'
                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800/30 dark:text-indigo-400'
                                }`}>
                                  <FeatureIcon className="w-2.5 h-2.5 sm:w-3 h-3 md:w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs sm:text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                  {feature.text}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Template Count Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {planType.templates} template(s) available
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Creation Method Selection */}
              {selectedPlanType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mb-3 sm:mb-4 md:mb-6"
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1.5 sm:mb-2 md:mb-3 text-gray-900 dark:text-white">
                    Choose Creation Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    {creationOptions.map((option) => {
                      const OptionIcon = option.icon;
                      const isSelected = selectedOption === option.id;
                      const colorClasses = getColorClasses(option.color);
                      const isDisabled = option.disabled;
                      
                      return (
                        <motion.div
                          key={option.id}
                          whileHover={!isDisabled ? { scale: 1.02 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                          onClick={() => !isDisabled && handleOptionSelect(option.id)}
                          className={`relative p-2 sm:p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isDisabled
                              ? 'cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
                              : isSelected
                              ? `${colorClasses.border} ${colorClasses.bg} shadow-md cursor-pointer`
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer'
                          }`}
                        >
                          {/* Selection Checkmark */}
                          <div className={`absolute -top-1 -right-1 sm:-top-1.5 -right-1.5 w-4 h-4 sm:w-5 h-5 md:w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected && !isDisabled
                              ? 'bg-white shadow-md'
                              : 'scale-0 opacity-0'
                          }`}>
                            <Check className={`w-2.5 h-2.5 sm:w-3 h-3 md:w-4 h-4 ${colorClasses.text}`} />
                          </div>

                          {/* Icon */}
                          <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-xl mb-1.5 sm:mb-2 md:mb-3 w-10 h-10 sm:w-12 h-12 flex items-center justify-center ${
                            isDisabled
                              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                              : option.color === 'teal'
                              ? 'bg-teal-100 text-teal-600 dark:bg-teal-800/30 dark:text-teal-400'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-800/30 dark:text-amber-400'
                          }`}>
                            <OptionIcon className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6" />
                          </div>

                          {/* Content */}
                          <h4 className={`text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 md:mb-1.5 ${
                            isDisabled
                              ? 'text-gray-500 dark:text-gray-400'
                              : isSelected ? colorClasses.text : 'text-gray-900 dark:text-white'
                          }`}>
                            {option.name}
                          </h4>
                          
                          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-xs md:text-sm">
                            {option.description}
                          </p>

                          {/* Template Warning */}
                          {option.id === 'template' && templateStats.total === 0 && (
                            <div className="mt-1.5 sm:mt-2 md:mt-3 p-1 sm:p-1.5 md:p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                No templates available. Create a plan from scratch first.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3 md:pt-4 gap-2 sm:gap-3 md:gap-0">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={handleContinue}
                  disabled={!selectedPlanType || !selectedOption}
                  className={`w-full sm:w-auto px-5 sm:px-6 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                    selectedPlanType && selectedOption
                      ? 'bg-gradient-to-r from-olive-600 to-slate-700 hover:from-olive-700 hover:to-slate-800 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  } text-xs sm:text-sm`}
                  whileHover={selectedPlanType && selectedOption ? { scale: 1.05 } : {}}
                  whileTap={selectedPlanType && selectedOption ? { scale: 0.95 } : {}}
                >
                  <span>
                    {selectedPlanType && selectedOption
                      ? selectedOption === 'template'
                        ? 'Browse Templates'
                        : `Create ${planTypes.find(p => p.id === selectedPlanType)?.name}`
                      : 'Continue to Setup'
                    }
                  </span>
                  <ArrowRight className="w-3 h-3 sm:w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PlanTypeSelectionModal;