




import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wifi, Cable, BarChart3, TrendingUp, Users, Activity, Check, ArrowRight } from "lucide-react";
import { getThemeClasses } from "../Shared/components";

const AnalyticsTypeSelectionModal = ({ isOpen, onClose, onSelect, theme, plans, subscriptions = [] }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedAnalyticsType, setSelectedAnalyticsType] = useState(null);

  // Calculate dynamic metrics from plans and subscriptions - moved before early return
  const analyticsData = useMemo(() => {
    // Calculate plan counts and subscribers
    const { hotspotPlans, pppoePlans, hotspotSubscribers, pppoeSubscribers } = plans.reduce(
      (acc, plan) => {
        if (plan.accessType === 'hotspot') {
          acc.hotspotPlans++;
          acc.hotspotSubscribers += (plan.purchases || 0);
        } else if (plan.accessType === 'pppoe') {
          acc.pppoePlans++;
          acc.pppoeSubscribers += (plan.purchases || 0);
        }
        return acc;
      },
      { hotspotPlans: 0, pppoePlans: 0, hotspotSubscribers: 0, pppoeSubscribers: 0 }
    );

    // Calculate active sessions/connections from subscriptions
    const now = new Date();
    const activeHotspotSessions = subscriptions.filter(sub => 
      sub.plan_id && 
      plans.find(p => p.id === sub.plan_id && p.accessType === 'hotspot') &&
      sub.status === 'active' &&
      (!sub.expires_at || new Date(sub.expires_at) > now)
    ).length;

    const activePppoeConnections = subscriptions.filter(sub => 
      sub.plan_id && 
      plans.find(p => p.id === sub.plan_id && p.accessType === 'pppoe') &&
      sub.status === 'active' &&
      (!sub.expires_at || new Date(sub.expires_at) > now)
    ).length;

    return {
      hotspotPlans,
      pppoePlans,
      hotspotSubscribers,
      pppoeSubscribers,
      activeHotspotSessions,
      activePppoeConnections
    };
  }, [plans, subscriptions]);

  const analyticsTypes = [
    {
      id: "hotspot",
      name: "Hotspot Analytics",
      icon: Wifi,
      color: "blue",
      description: "Comprehensive analytics for wireless hotspot plans",
      metrics: [
        { icon: Users, label: "Total Plans", value: analyticsData.hotspotPlans },
        { icon: TrendingUp, label: "Subscribers", value: analyticsData.hotspotSubscribers },
        { icon: Activity, label: "Active Sessions", value: analyticsData.activeHotspotSessions }
      ],
      features: [
        "User connection patterns",
        "Bandwidth usage analytics",
        "Session duration trends",
        "Peak usage hours"
      ]
    },
    {
      id: "pppoe",
      name: "PPPoE Analytics",
      icon: Cable,
      color: "emerald",
      description: "Detailed insights for wired PPPoE connections",
      metrics: [
        { icon: Users, label: "Total Plans", value: analyticsData.pppoePlans },
        { icon: TrendingUp, label: "Subscribers", value: analyticsData.pppoeSubscribers },
        { icon: Activity, label: "Active Connections", value: analyticsData.activePppoeConnections }
      ],
      features: [
        "Connection stability metrics",
        "IP pool utilization",
        "Authentication logs",
        "Network performance"
      ]
    }
  ];

  const getColorClasses = (color, isSelected = false) => {
    const baseClasses = {
      blue: {
        border: isSelected ? 'border-blue-500 ring-4 ring-blue-200 dark:ring-blue-900/30' : 'border-gray-200 dark:border-gray-600',
        bg: isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
        text: {
          primary: 'text-blue-700 dark:text-blue-300',
          secondary: 'text-blue-600 dark:text-blue-400'
        },
        button: 'bg-blue-600 hover:bg-blue-700 text-white'
      },
      emerald: {
        border: isSelected ? 'border-emerald-500 ring-4 ring-emerald-200 dark:ring-emerald-900/30' : 'border-gray-200 dark:border-gray-600',
        bg: isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-gray-800',
        text: {
          primary: 'text-emerald-700 dark:text-emerald-300',
          secondary: 'text-emerald-600 dark:text-emerald-400'
        },
        button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
      }
    };
    return baseClasses[color] || baseClasses.blue;
  };

  const handleAnalyticsSelect = (analyticsType) => {
    setSelectedAnalyticsType(analyticsType);
  };

  const handleContinue = () => {
    if (selectedAnalyticsType) {
      onSelect(selectedAnalyticsType);
    }
  };

  // Early return must be after all hooks
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl rounded-3xl shadow-2xl bg-white dark:bg-gray-900 overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-2 sm:p-3 md:p-4 lg:p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 flex items-center">
                    <BarChart3 className="w-4 h-4 sm:w-5 h-5 md:w-6 h-6 lg:w-7 h-7 mr-1 sm:mr-2" />
                    View Analytics
                  </h2>
                  <p className="text-purple-100 text-xs sm:text-xs md:text-sm lg:text-base">
                    Choose analytics type to view detailed insights
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  <X className="w-3 h-3 sm:w-4 h-4 md:w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Analytics Type Selection */}
            <div className="p-2 sm:p-3 md:p-4 lg:p-5">
              <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 md:grid-cols-2">
                {analyticsTypes.map((analyticsType) => {
                  const IconComponent = analyticsType.icon;
                  const isSelected = selectedAnalyticsType === analyticsType.id;
                  const colorClasses = getColorClasses(analyticsType.color, isSelected);
                  
                  return (
                    <motion.div
                      key={analyticsType.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnalyticsSelect(analyticsType.id)}
                      className={`relative p-2 sm:p-3 md:p-4 lg:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${colorClasses.border} ${colorClasses.bg}`}
                    >
                      {/* Selection Indicator */}
                      <div className={`absolute -top-1 -right-1 sm:-top-1.5 -right-1.5 w-4 h-4 sm:w-5 h-5 md:w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'scale-100 opacity-100 bg-white shadow-md' 
                          : 'scale-0 opacity-0'
                      }`}>
                        <Check className={`w-2.5 h-2.5 sm:w-3 h-3 md:w-4 h-4 ${colorClasses.text.secondary}`} />
                      </div>

                      {/* Header */}
                      <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 mb-1.5 sm:mb-2 md:mb-3">
                        <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-xl bg-gradient-to-r ${
                          analyticsType.color === 'blue' ? 'from-blue-500 to-cyan-500' : 'from-emerald-500 to-green-500'
                        }`}>
                          <IconComponent className="w-3 h-3 sm:w-4 h-4 md:w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-sm sm:text-base md:text-lg font-bold ${colorClasses.text.primary}`}>
                            {analyticsType.name}
                          </h3>
                          <p className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {analyticsType.description}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 mb-1.5 sm:mb-2 md:mb-3">
                        {analyticsType.metrics.map((metric, index) => {
                          const MetricIcon = metric.icon;
                          return (
                            <div key={index} className="text-center p-1 sm:p-1.5 md:p-2 rounded-lg bg-white dark:bg-gray-700/50">
                              <MetricIcon className={`w-2.5 h-2.5 sm:w-3 h-3 md:w-3.5 h-3.5 mx-auto mb-0.5 ${colorClasses.text.secondary}`} />
                              <div className="font-bold text-xs sm:text-sm md:text-base text-gray-900 dark:text-white">
                                {metric.value}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {metric.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className={`text-xs sm:text-xs md:text-sm font-semibold mb-0.5 sm:mb-1 ${colorClasses.text.secondary}`}>
                          Analytics Include:
                        </h4>
                        <ul className="space-y-0.5 sm:space-y-0.5 md:space-y-1">
                          {analyticsType.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
                              <div className="w-0.5 h-0.5 sm:w-1 h-1 rounded-full bg-gray-400 mr-1 sm:mr-1.5"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700 gap-2 sm:gap-3 md:gap-0">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 font-medium text-xs sm:text-sm"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={handleContinue}
                  disabled={!selectedAnalyticsType}
                  className={`w-full sm:w-auto px-5 sm:px-6 py-1.5 sm:py-2 rounded-xl font-semibold flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all duration-300 ${
                    selectedAnalyticsType 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  } text-xs sm:text-sm`}
                  whileHover={selectedAnalyticsType ? { scale: 1.05 } : {}}
                  whileTap={selectedAnalyticsType ? { scale: 0.95 } : {}}
                >
                  <span>
                    {selectedAnalyticsType 
                      ? `View ${selectedAnalyticsType === 'hotspot' ? 'Hotspot' : 'PPPoE'} Analytics` 
                      : 'Select Analytics Type'
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

export default AnalyticsTypeSelectionModal;