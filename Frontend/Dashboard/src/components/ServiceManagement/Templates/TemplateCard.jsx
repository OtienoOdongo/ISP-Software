







import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Box, Wifi, Cable, Globe, Lock, Crown, Shield, TrendingDown, Users, Check, X } from "lucide-react";
import { getThemeClasses } from "../Shared/components";
import { formatNumber } from "../Shared/utils";

// Modern Quick Create Modal Component
const QuickCreateModal = ({ isOpen, onClose, onSubmit, template, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [planName, setPlanName] = useState(`${template.name} - ${new Date().toLocaleDateString()}`);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planName.trim()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(planName.trim());
      onClose();
    } catch (error) {
      console.error("Error creating plan:", error);
      // Re-throw to be handled by parent
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Quick Create Plan
              </h2>
              <p className="text-indigo-100 mt-1 text-sm">
                Create a new plan from template
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Box className="w-8 h-8 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template.category} • {template.accessMethods?.hotspot?.enabled ? 'Hotspot' : 'PPPoE'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plan Name *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter plan name..."
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This will be the name of your new plan
              </p>
            </div>

            {/* Template Preview */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm">
                Template Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Base Price:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    KES {formatNumber(template.basePrice || template.base_price || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Used:</span>
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {template.usageCount || template.usage_count || 0} times
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!planName.trim() || isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const TemplateCard = ({ 
  template, 
  onSelect, 
  onApplyTemplate, 
  onCreateFromTemplate, 
  onEditTemplate, 
  onDeleteTemplate, 
  theme 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

  // Enhanced access methods handling
  const getAccessMethods = (template) => {
    return template.accessMethods || template.access_methods || {};
  };

  const accessMethods = getAccessMethods(template);

  // Enhanced usage count handling
  const getUsageCount = (template) => {
    const usageCount = template.usageCount !== undefined ? template.usageCount : 
                     template.usage_count !== undefined ? template.usage_count : 0;
    return parseInt(usageCount) || 0;
  };

  const usageCount = getUsageCount(template);

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

  // Handle quick create with the modal
  const handleQuickCreate = async (planName) => {
    try {
      await onCreateFromTemplate(template, planName);
      setShowQuickCreateModal(false);
    } catch (error) {
      // Error handling is done in the parent component
      throw error;
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-xl shadow-lg border cursor-pointer transition-all ${
          themeClasses.bg.card
        } ${themeClasses.border.light} hover:border-indigo-500`}
        onClick={() => onSelect(template)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-indigo-600 mr-3">
                {template.name}
              </h3>
              <div className="flex items-center space-x-2">
                {template.isPublic ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    Public
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                  </span>
                )}
                {!template.isActive && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Inactive
                  </span>
                )}
                {usageCount > 10 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                )}
              </div>
            </div>
            <p className={`text-sm ${themeClasses.text.secondary} mb-3 line-clamp-2`}>
              {template.description || "No description available"}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            template.category === "Business" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
            template.category === "Residential" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
            template.category === "Enterprise" ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          }`}>
            {template.category}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={themeClasses.text.secondary}>Base Price:</span>
            <span className="font-semibold text-indigo-600">
              KES {formatNumber(template.basePrice || template.base_price || 0)}
            </span>
          </div>

          {/* Enhanced usage count display */}
          <div className="flex items-center justify-between text-sm">
            <span className={themeClasses.text.secondary}>Used:</span>
            <span className={`font-medium ${
              usageCount === 0 ? "text-gray-500" :
              usageCount < 5 ? "text-green-600" :
              usageCount < 20 ? "text-blue-600" : "text-orange-600"
            }`}>
              {usageCount} time{usageCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={themeClasses.text.secondary}>Priority:</span>
            <span className={`flex items-center ${priorityInfo.color}`}>
              <TrendingDown className="w-3 h-3 mr-1" />
              {priorityInfo.label}
            </span>
          </div>

          {template.router_specific && (
            <div className="flex items-center justify-between text-sm">
              <span className={themeClasses.text.secondary}>Router Specific:</span>
              <span className="text-orange-600 font-medium">Yes</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            {/* Hotspot */}
            <div>
              <div className="flex items-center mb-2">
                <Wifi className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium">Hotspot</span>
                <span className={`ml-2 text-xs ${
                  accessMethods.hotspot?.enabled ? "text-green-600" : "text-red-600"
                }`}>
                  {accessMethods.hotspot?.enabled ? "✓" : "✗"}
                </span>
              </div>
              {accessMethods.hotspot?.enabled && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Download:</span>
                    <span>{accessMethods.hotspot.downloadSpeed?.value || '0'} {accessMethods.hotspot.downloadSpeed?.unit || 'Mbps'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span>
                      {accessMethods.hotspot.dataLimit?.unit === 'Unlimited' 
                        ? 'Unlimited' 
                        : `${accessMethods.hotspot.dataLimit?.value || '0'} ${accessMethods.hotspot.dataLimit?.unit || 'GB'}`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PPPoE */}
            <div>
              <div className="flex items-center mb-2">
                <Cable className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium">PPPoE</span>
                <span className={`ml-2 text-xs ${
                  accessMethods.pppoe?.enabled ? "text-green-600" : "text-red-600"
                }`}>
                  {accessMethods.pppoe?.enabled ? "✓" : "✗"}
                </span>
              </div>
              {accessMethods.pppoe?.enabled && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Download:</span>
                    <span>{accessMethods.pppoe.downloadSpeed?.value || '0'} {accessMethods.pppoe.downloadSpeed?.unit || 'Mbps'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span>
                      {accessMethods.pppoe.dataLimit?.unit === 'Unlimited' 
                        ? 'Unlimited' 
                        : `${accessMethods.pppoe.dataLimit?.value || '0'} ${accessMethods.pppoe.dataLimit?.unit || 'GB'}`
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onApplyTemplate(template);
            }}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center text-sm ${themeClasses.button.primary}`}
          >
            <Box className="w-4 h-4 mr-2" />
            Use Template
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickCreateModal(true);
            }}
            className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm ${themeClasses.button.success}`}
            title="Quick Create Plan"
          >
            <Plus className="w-4 h-4 mr-1" />
            Quick Create
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onEditTemplate(template);
            }}
            className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm ${themeClasses.button.secondary}`}
            title="Edit Template"
          >
            <Edit className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTemplate(template);
            }}
            className={`px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm ${themeClasses.button.danger}`}
            title="Delete Template"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Modern Quick Create Modal */}
      <QuickCreateModal
        isOpen={showQuickCreateModal}
        onClose={() => setShowQuickCreateModal(false)}
        onSubmit={handleQuickCreate}
        template={template}
        theme={theme}
      />
    </>
  );
};

export default TemplateCard;