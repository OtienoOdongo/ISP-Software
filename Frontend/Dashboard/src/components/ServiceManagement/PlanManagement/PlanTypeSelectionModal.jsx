


import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, Cable, Check, ArrowRight, Zap, Users, Shield, Clock, Network } from "lucide-react";
import { getThemeClasses } from "../Shared/components";

const PlanTypeSelectionModal = ({ isOpen, onClose, onSelect, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedPlanType, setSelectedPlanType] = useState(null);

  if (!isOpen) return null;

  const planTypes = [
    {
      id: "hotspot",
      name: "Hotspot Plan",
      icon: Wifi,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      description: "Wireless internet access for multiple users",
      features: [
        { icon: Users, text: "Multi-user support" },
        { icon: Clock, text: "Session management" },
        { icon: Shield, text: "MAC binding" },
        { icon: Zap, text: "Flexible validity" }
      ]
    },
    {
      id: "pppoe",
      name: "PPPoE Plan",
      icon: Cable,
      color: "emerald",
      gradient: "from-emerald-500 to-green-500",
      description: "Wired connection with authentication",
      features: [
        { icon: Network, text: "IP pool management" },
        { icon: Shield, text: "Enhanced security" },
        { icon: Zap, text: "Stable connection" },
        { icon: Clock, text: "Usage tracking" }
      ]
    }
  ];

  const handlePlanSelect = (planTypeId) => {
    setSelectedPlanType(planTypeId);
  };

  const handleContinue = () => {
    if (selectedPlanType) {
      onSelect(selectedPlanType);
    }
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
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 sm:p-3 md:p-4 lg:p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Create New Plan</h2>
                  <p className="text-purple-100 mt-0.5 text-xs sm:text-xs md:text-sm lg:text-base">
                    Select your preferred connection type
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

            {/* Plan Selection */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                {planTypes.map((planType) => {
                  const IconComponent = planType.icon;
                  const isSelected = selectedPlanType === planType.id;
                  
                  return (
                    <motion.div
                      key={planType.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlanSelect(planType.id)}
                      className={`relative p-2 sm:p-3 md:p-4 lg:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? planType.color === 'blue'
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-md shadow-blue-500/20'
                            : 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-md shadow-emerald-500/20'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm'
                      }`}
                    >
                      {/* Selection Checkmark */}
                      <div className={`absolute -top-1 -right-1 sm:-top-1.5 -right-1.5 w-4 h-4 sm:w-5 h-5 md:w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? planType.color === 'blue'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-emerald-500 text-white shadow-md'
                          : 'bg-gray-300 dark:bg-gray-600 scale-0'
                      }`}>
                        <Check className="w-2.5 h-2.5 sm:w-3 h-3 md:w-4 h-4" />
                      </div>

                      {/* Icon with Gradient */}
                      <div className={`p-1.5 sm:p-2 md:p-3 rounded-2xl w-10 h-10 sm:w-12 h-12 md:w-14 h-14 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3 bg-gradient-to-r ${planType.gradient} shadow-md`}>
                        <IconComponent className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <h3 className={`text-sm sm:text-base md:text-lg font-bold mb-0.5 sm:mb-1 md:mb-1.5 ${
                        isSelected
                          ? planType.color === 'blue'
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-emerald-700 dark:text-emerald-300'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {planType.name}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-3 leading-relaxed text-xs sm:text-xs md:text-sm">
                        {planType.description}
                      </p>

                      {/* Features with Icons */}
                      <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
                        {planType.features.map((feature, index) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <div key={index} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                              <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${
                                planType.color === 'blue'
                                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-800/30 dark:text-blue-400'
                                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/30 dark:text-emerald-400'
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
                    </motion.div>
                  );
                })}
              </div>

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
                  disabled={!selectedPlanType}
                  className={`w-full sm:w-auto px-5 sm:px-6 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                    selectedPlanType
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  } text-xs sm:text-sm`}
                  whileHover={selectedPlanType ? { scale: 1.05 } : {}}
                  whileTap={selectedPlanType ? { scale: 0.95 } : {}}
                >
                  <span>Continue to Setup</span>
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