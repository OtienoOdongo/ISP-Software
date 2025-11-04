


import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Wifi, Cable, Box, Shield, TrendingDown, Users } from "lucide-react";
import { getThemeClasses } from "../Shared/components";

const TemplateTypeSelection = ({ 
  templateType, 
  onTemplateTypeSelect, 
  onContinue, 
  theme 
}) => {
  const themeClasses = getThemeClasses(theme);

  const templateTypes = [
    {
      id: "hotspot",
      name: "Hotspot Template",
      icon: Wifi,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      description: "Wireless internet access for multiple users",
      features: [
        { icon: Users, text: "Multi-user session management" },
        { icon: Shield, text: "MAC address binding" },
        { icon: TrendingDown, text: "Bandwidth and data limits" },
        { icon: Box, text: "Device connection limits" }
      ]
    },
    {
      id: "pppoe",
      name: "PPPoE Template",
      icon: Cable,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      description: "Wired connections with authentication",
      features: [
        { icon: Shield, text: "IP pool management" },
        { icon: Box, text: "DNS and MTU configuration" },
        { icon: TrendingDown, text: "Enhanced security features" },
        { icon: Users, text: "Stable connection management" }
      ]
    }
  ];

  // Handle keyboard navigation
  const handleKeyPress = (event, typeId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTemplateTypeSelect(typeId);
    }
  };

  // Get color classes based on type and selection state
  const getColorClasses = (type, isSelected) => {
    const baseClasses = {
      blue: {
        border: isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-300 dark:border-gray-600',
        bg: isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800',
        iconBg: isSelected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700',
        icon: isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400',
        text: {
          primary: isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white',
          secondary: isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
        },
        badge: 'bg-blue-500 text-white'
      },
      green: {
        border: isSelected ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' : 'border-gray-300 dark:border-gray-600',
        bg: isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800',
        iconBg: isSelected ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700',
        icon: isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400',
        text: {
          primary: isSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white',
          secondary: isSelected ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
        },
        badge: 'bg-green-500 text-white'
      }
    };
    
    return baseClasses[type.color] || baseClasses.blue;
  };

  // Get display name for selected template type
  const getSelectedTypeName = () => {
    if (!templateType) return "Template";
    const selectedType = templateTypes.find(type => type.id === templateType);
    return selectedType ? selectedType.name.replace(" Template", "") : "Template";
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h2 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
        <Box className="w-5 h-5 mr-3 text-indigo-600" />
        Select Template Type
      </h2>
      
      <p className={`text-sm mb-6 ${themeClasses.text.secondary}`}>
        Choose the type of template you want to create. Both options provide comprehensive configuration for their respective access methods.
      </p>
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        role="radiogroup"
        aria-label="Select template type"
        aria-required="true"
      >
        {templateTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = templateType === type.id;
          const colorClasses = getColorClasses(type, isSelected);
          
          return (
            <motion.button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Select ${type.name}`}
              tabIndex={0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTemplateTypeSelect(type.id)}
              onKeyDown={(e) => handleKeyPress(e, type.id)}
              className={`w-full p-6 border-2 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 ${
                colorClasses.border
              } ${colorClasses.bg}`}
            >
              <div className="flex items-start mb-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${colorClasses.iconBg}`}>
                  <IconComponent className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className={`text-lg font-semibold mb-1 ${colorClasses.text.primary}`}>
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {type.features.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={index} className="flex items-center text-sm">
                      <FeatureIcon className={`w-4 h-4 mr-2 ${colorClasses.text.secondary}`} />
                      <span className={colorClasses.text.secondary}>
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Selection Checkmark */}
              {isSelected && (
                <div className="flex justify-end mt-4">
                  <div 
                    className={`p-2 rounded-full ${colorClasses.badge}`}
                    aria-hidden="true"
                  >
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selection Required Message */}
      {!templateType && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            Please select a template type to continue
          </p>
        </motion.div>
      )}

      <div className="flex justify-end">
        <motion.button
          type="button"
          onClick={onContinue}
          disabled={!templateType}
          className={`px-6 py-3 rounded-lg flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 ${
            !templateType 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300' 
              : `${themeClasses.button.primary} hover:shadow-lg`
          }`}
          whileHover={templateType ? { scale: 1.05 } : {}}
          whileTap={templateType ? { scale: 0.95 } : {}}
          aria-disabled={!templateType}
        >
          Continue to {getSelectedTypeName()} Configuration
          <ArrowRight className="w-4 h-4 ml-2" />
        </motion.button>
      </div>

      {/* Helper text for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {templateType 
          ? `${getSelectedTypeName()} template selected` 
          : "No template type selected. Please choose Hotspot or PPPoE template type."
        }
      </div>
    </div>
  );
};

export default TemplateTypeSelection;