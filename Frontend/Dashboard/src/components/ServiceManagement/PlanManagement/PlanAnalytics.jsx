

// import React, { useState, useMemo, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   BarChart3, Users, DollarSign, TrendingUp, Award,
//   Calendar, Filter, Download, Eye, PieChart, Activity, Box,
//   Wifi, Cable, ArrowLeft, Check, Clock, X, RefreshCw,
//   FileText, Edit, Layers, Target, AlertTriangle
// } from "lucide-react";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components"
// import { 
//   formatNumber, 
//   calculateCategoryMetrics, 
//   processAnalyticsData,
//   calculatePlanPerformance,
//   calculatePopularity
// } from "../Shared/utils"
// import { analyticsTimeRanges, categories, popularityLevels } from "../Shared/constant"

// // Enhanced Star component with better accessibility
// const Star = ({ className, filled = true }) => (
//   <svg 
//     className={className} 
//     fill={filled ? "currentColor" : "none"} 
//     stroke="currentColor"
//     viewBox="0 0 20 20"
//   >
//     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//   </svg>
// );

// // Enhanced Progress Bar with better accessibility
// const ProgressBar = ({ percentage, color = "indigo", theme, label = "Progress" }) => (
//   <div className="mt-3" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
//     <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
//       <span>{label}</span>
//       <span>{percentage.toFixed(1)}%</span>
//     </div>
//     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//       <div 
//         className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
//         style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
//       ></div>
//     </div>
//   </div>
// );

// // Enhanced currency formatting with error handling
// const formatCurrency = (amount) => {
//   const numericAmount = parseFloat(amount) || 0;
//   return `KES ${formatNumber(numericAmount)}`;
// };

// // Enhanced time range options with validation
// const enhancedTimeRanges = [
//   { value: "1d", label: "Today", days: 1 },
//   { value: "7d", label: "Last 7 Days", days: 7 },
//   { value: "30d", label: "Last 30 Days", days: 30 },
//   { value: "90d", label: "Last 90 Days", days: 90 },
//   { value: "365d", label: "Last 1 Year", days: 365 },
//   { value: "all", label: "All Time", days: null },
//   { value: "custom", label: "Custom Range", days: null }
// ];

// // Enhanced access type detection with fallbacks
// const detectAccessType = (plan) => {
//   if (!plan) return null;
  
//   // Priority 1: Explicit accessType field
//   if (plan.accessType && ['hotspot', 'pppoe'].includes(plan.accessType)) {
//     return plan.accessType;
//   }
  
//   // Priority 2: Legacy accessMethods structure
//   if (plan.accessMethods) {
//     if (plan.accessMethods.hotspot?.enabled && plan.accessMethods.pppoe?.enabled) {
//       return 'both';
//     }
//     if (plan.accessMethods.hotspot?.enabled) return 'hotspot';
//     if (plan.accessMethods.pppoe?.enabled) return 'pppoe';
//   }
  
//   // Priority 3: Template access type
//   if (plan.template_access_type) {
//     return plan.template_access_type;
//   }
  
//   return null;
// };

// // Data validation function (missing from utils)
// const validateAnalyticsData = (data, dataType) => {
//   if (!Array.isArray(data)) {
//     console.warn(`Invalid ${dataType}: expected array, got`, typeof data);
//     return [];
//   }
  
//   // Basic validation based on data type
//   switch (dataType) {
//     case 'subscriptions':
//       return data.filter(item => 
//         item && 
//         (item.id || item.plan_id) && 
//         (item.created_at || item.start_date)
//       );
    
//     case 'plans':
//       return data.filter(item => 
//         item && 
//         item.id && 
//         item.name && 
//         (item.accessType || item.accessMethods || item.template_access_type)
//       );
    
//     case 'templates':
//       return data.filter(item => 
//         item && 
//         item.id && 
//         item.name
//       );
    
//     default:
//       return data.filter(item => item != null);
//   }
// };

// // Calculate template efficiency (moved from utils since it doesn't exist there)
// const calculateTemplateEfficiency = (template, plansFromTemplate, subscriptionsFromTemplate) => {
//   const usageCount = template.usageCount || template.usage_count || 0;
//   const plansCreated = plansFromTemplate.length;
//   const activeSubscriptions = subscriptionsFromTemplate.length;
  
//   // Efficiency score based on multiple factors
//   let efficiencyScore = 0;
  
//   // Usage factor (0-40 points)
//   const usageFactor = Math.min((usageCount / 10) * 10, 40);
  
//   // Conversion factor (0-30 points)
//   const conversionRate = plansCreated > 0 ? (activeSubscriptions / plansCreated) * 100 : 0;
//   const conversionFactor = Math.min(conversionRate * 0.3, 30);
  
//   // Revenue factor (0-30 points) - simplified calculation
//   const revenueFactor = Math.min(usageCount * 2, 30);
  
//   efficiencyScore = usageFactor + conversionFactor + revenueFactor;
  
//   return {
//     score: Math.min(efficiencyScore, 100),
//     factors: {
//       usage: usageFactor,
//       conversion: conversionFactor,
//       revenue: revenueFactor
//     }
//   };
// };

// // Enhanced analytics data processing with comprehensive template tracking
// const processEnhancedAnalyticsData = (subscriptions, plans, templates, timeRange = '30d', analyticsType = null, customRange = null) => {
//   try {
//     const now = new Date();
//     let startDate = new Date();
    
//     // Validate input data
//     const validatedSubscriptions = validateAnalyticsData(subscriptions, 'subscriptions');
//     const validatedPlans = validateAnalyticsData(plans, 'plans');
//     const validatedTemplates = validateAnalyticsData(templates, 'templates');

//     // Handle custom date range
//     if (customRange) {
//       startDate = new Date(customRange.startDate);
//       const endDate = new Date(customRange.endDate);
      
//       if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//         throw new Error('Invalid custom date range');
//       }

//       const filteredSubscriptions = validatedSubscriptions.filter(sub => {
//         const subscriptionDate = new Date(sub.created_at || sub.start_date);
//         return subscriptionDate >= startDate && subscriptionDate <= endDate;
//       });

//       return processAnalyticsData(filteredSubscriptions, validatedPlans, 'custom');
//     }

//     // Handle predefined time ranges
//     const timeRangeConfig = enhancedTimeRanges.find(tr => tr.value === timeRange);
//     if (timeRangeConfig && timeRangeConfig.days) {
//       startDate.setDate(now.getDate() - timeRangeConfig.days);
//     } else if (timeRange !== 'all') {
//       startDate = new Date(0); // All time
//     }

//     // Enhanced filtering with access type consideration
//     const filteredSubscriptions = validatedSubscriptions.filter(sub => {
//       const subscriptionDate = new Date(sub.created_at || sub.start_date);
//       const dateMatch = timeRange === 'all' || subscriptionDate >= startDate;
      
//       if (analyticsType && sub.plan_id) {
//         const plan = validatedPlans.find(p => p.id === sub.plan_id);
//         if (plan) {
//           const planAccessType = detectAccessType(plan);
//           return dateMatch && planAccessType === analyticsType;
//         }
//       }
      
//       return dateMatch;
//     });

//     const baseAnalytics = processAnalyticsData(filteredSubscriptions, validatedPlans, timeRange);
    
//     // Enhanced template analytics
//     const templateAnalytics = calculateTemplateAnalytics(
//       validatedTemplates, 
//       validatedPlans, 
//       filteredSubscriptions,
//       analyticsType,
//       startDate
//     );

//     return {
//       ...baseAnalytics,
//       templateAnalytics,
//       dataQuality: {
//         subscriptions: filteredSubscriptions.length,
//         plans: validatedPlans.length,
//         templates: validatedTemplates.length,
//         lastUpdated: new Date().toISOString()
//       }
//     };
//   } catch (error) {
//     console.error('Error processing analytics data:', error);
//     return getFallbackAnalyticsData();
//   }
// };

// // Comprehensive template analytics calculation
// const calculateTemplateAnalytics = (templates, plans, subscriptions, analyticsType, startDate) => {
//   const templateStats = {
//     total: templates.length,
//     active: templates.filter(t => t.isActive !== false).length,
//     public: templates.filter(t => t.isPublic).length,
//     byAccessType: {
//       hotspot: templates.filter(t => detectAccessType(t) === 'hotspot').length,
//       pppoe: templates.filter(t => detectAccessType(t) === 'pppoe').length,
//       both: templates.filter(t => detectAccessType(t) === 'both').length
//     },
//     usage: {},
//     efficiency: {},
//     creationTrends: {}
//   };

//   // Calculate template usage metrics
//   templates.forEach(template => {
//     const templateAccessType = detectAccessType(template);
    
//     // Skip if analytics type filter doesn't match
//     if (analyticsType && templateAccessType !== analyticsType) return;

//     const plansFromTemplate = plans.filter(plan => 
//       plan.template_id === template.id || plan.template_name === template.name
//     );

//     const subscriptionsFromTemplate = subscriptions.filter(sub =>
//       plansFromTemplate.some(plan => plan.id === sub.plan_id)
//     );

//     const usageCount = template.usageCount || template.usage_count || 0;
//     const revenue = subscriptionsFromTemplate.reduce((sum, sub) => 
//       sum + (parseFloat(sub.amount) || 0), 0
//     );

//     templateStats.usage[template.id] = {
//       usageCount,
//       plansCreated: plansFromTemplate.length,
//       activeSubscriptions: subscriptionsFromTemplate.length,
//       totalRevenue: revenue,
//       conversionRate: plansFromTemplate.length > 0 ? 
//         (subscriptionsFromTemplate.length / plansFromTemplate.length) * 100 : 0
//     };

//     templateStats.efficiency[template.id] = calculateTemplateEfficiency(template, plansFromTemplate, subscriptionsFromTemplate);
//   });

//   // Calculate creation trends (last 6 months)
//   const sixMonthsAgo = new Date();
//   sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
//   templateStats.creationTrends = templates
//     .filter(template => new Date(template.created_at) >= sixMonthsAgo)
//     .reduce((trends, template) => {
//       const month = new Date(template.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
//       trends[month] = (trends[month] || 0) + 1;
//       return trends;
//     }, {});

//   return templateStats;
// };

// // Fallback data for error scenarios
// const getFallbackAnalyticsData = () => ({
//   totalSubscriptions: 0,
//   activeSubscriptions: 0,
//   totalRevenue: 0,
//   categoryStats: {},
//   templateAnalytics: {
//     total: 0,
//     active: 0,
//     public: 0,
//     byAccessType: { hotspot: 0, pppoe: 0, both: 0 },
//     usage: {},
//     efficiency: {},
//     creationTrends: {}
//   },
//   dataQuality: {
//     subscriptions: 0,
//     plans: 0,
//     templates: 0,
//     lastUpdated: new Date().toISOString(),
//     error: true
//   }
// });

// // Custom Date Range Modal Component
// const CustomDateRangeModal = ({ isOpen, onClose, onApply, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [errors, setErrors] = useState({});

//   const validateDates = () => {
//     const newErrors = {};
    
//     if (!startDate) newErrors.startDate = 'Start date is required';
//     if (!endDate) newErrors.endDate = 'End date is required';
    
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
      
//       if (start > end) {
//         newErrors.dateRange = 'Start date cannot be after end date';
//       }
      
//       if (end > new Date()) {
//         newErrors.futureDate = 'End date cannot be in the future';
//       }
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleApply = () => {
//     if (validateDates()) {
//       onApply({ startDate, endDate });
//       onClose();
//     }
//   };

//   const handleReset = () => {
//     setStartDate("");
//     setEndDate("");
//     setErrors({});
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
//       >
//         <div className="flex items-center justify-between mb-4">
//           <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
//             Custom Date Range
//           </h3>
//           <button
//             onClick={onClose}
//             className={`p-1 rounded-lg ${themeClasses.button.secondary}`}
//             aria-label="Close modal"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <div className="space-y-4 mb-6">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Start Date *
//             </label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${
//                 errors.startDate ? 'border-red-500' : themeClasses.input
//               }`}
//               aria-invalid={!!errors.startDate}
//               aria-describedby={errors.startDate ? "startDate-error" : undefined}
//             />
//             {errors.startDate && (
//               <p id="startDate-error" className="text-red-500 text-xs mt-1">{errors.startDate}</p>
//             )}
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               End Date *
//             </label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${
//                 errors.endDate ? 'border-red-500' : themeClasses.input
//               }`}
//               aria-invalid={!!errors.endDate}
//               aria-describedby={errors.endDate ? "endDate-error" : undefined}
//             />
//             {errors.endDate && (
//               <p id="endDate-error" className="text-red-500 text-xs mt-1">{errors.endDate}</p>
//             )}
//           </div>
          
//           {(errors.dateRange || errors.futureDate) && (
//             <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//               <p className="text-red-700 dark:text-red-300 text-sm">
//                 {errors.dateRange || errors.futureDate}
//               </p>
//             </div>
//           )}
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
//           <button
//             onClick={handleReset}
//             className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
//           >
//             Reset
//           </button>
//           <button
//             onClick={handleApply}
//             disabled={!startDate || !endDate}
//             className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
//               !startDate || !endDate 
//                 ? 'bg-gray-400 cursor-not-allowed' 
//                 : 'bg-indigo-600 hover:bg-indigo-700'
//             }`}
//           >
//             Apply Range
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// // Enhanced Template Analytics Component
// const TemplateAnalyticsSection = ({ templateAnalytics, analyticsType, theme }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   if (!templateAnalytics || templateAnalytics.total === 0) {
//     return (
//       <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <h3 className="text-lg font-semibold mb-4 flex items-center">
//           <Layers className="w-5 h-5 mr-3 text-blue-600" />
//           Template Analytics
//         </h3>
//         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//           <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
//           <p>No template data available for analytics</p>
//         </div>
//       </div>
//     );
//   }

//   const topPerformingTemplates = Object.entries(templateAnalytics.usage)
//     .map(([templateId, usage]) => ({
//       templateId,
//       ...usage,
//       efficiency: templateAnalytics.efficiency[templateId]
//     }))
//     .sort((a, b) => b.totalRevenue - a.totalRevenue)
//     .slice(0, 5);

//   return (
//     <div className={`p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg font-semibold mb-4 flex items-center">
//         <Layers className="w-5 h-5 mr-3 text-blue-600" />
//         Template Analytics
//         {analyticsType && (
//           <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
//             ({analyticsType.charAt(0).toUpperCase() + analyticsType.slice(1)} Templates)
//           </span>
//         )}
//       </h3>

//       {/* Template Overview Cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
//           <div className="text-2xl font-bold text-blue-600">{templateAnalytics.total}</div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">Total Templates</div>
//         </div>
//         <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
//           <div className="text-2xl font-bold text-green-600">{templateAnalytics.active}</div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
//         </div>
//         <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
//           <div className="text-2xl font-bold text-purple-600">{templateAnalytics.public}</div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">Public</div>
//         </div>
//         <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
//           <div className="text-2xl font-bold text-orange-600">
//             {templateAnalytics.byAccessType[analyticsType] || 0}
//           </div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">
//             {analyticsType ? analyticsType.toUpperCase() : 'All'} Type
//           </div>
//         </div>
//       </div>

//       {/* Top Performing Templates */}
//       <div className="mb-6">
//         <h4 className="font-semibold mb-3 flex items-center">
//           <Target className="w-4 h-4 mr-2 text-green-600" />
//           Top Performing Templates
//         </h4>
//         <div className="space-y-3">
//           {topPerformingTemplates.map((template, index) => (
//             <div key={template.templateId} className={`p-4 rounded-lg border ${
//               theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
//                     <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
//                       #{index + 1}
//                     </span>
//                   </div>
//                   <div>
//                     <h5 className="font-semibold text-gray-900 dark:text-white">
//                       Template {template.templateId}
//                     </h5>
//                     <div className="flex items-center space-x-2 mt-1">
//                       <span className="text-xs text-gray-500">
//                         {template.plansCreated} plans created
//                       </span>
//                       <span className="text-xs text-green-600">
//                         {template.conversionRate.toFixed(1)}% conversion
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-semibold text-gray-900 dark:text-white">
//                     {formatCurrency(template.totalRevenue)}
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {template.activeSubscriptions} active
//                   </p>
//                 </div>
//               </div>
//               <ProgressBar 
//                 percentage={template.efficiency?.score || 0} 
//                 color="green" 
//                 theme={theme}
//                 label="Efficiency Score"
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Template Creation Trends */}
//       {Object.keys(templateAnalytics.creationTrends).length > 0 && (
//         <div>
//           <h4 className="font-semibold mb-3 flex items-center">
//             <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
//             Template Creation Trends (Last 6 Months)
//           </h4>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
//             {Object.entries(templateAnalytics.creationTrends).map(([month, count]) => (
//               <div key={month} className={`p-3 rounded-lg text-center ${
//                 theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
//               }`}>
//                 <div className="text-sm font-semibold text-gray-900 dark:text-white">{count}</div>
//                 <div className="text-xs text-gray-500">{month}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Main PlanAnalytics Component
// const PlanAnalytics = ({ plans, subscriptions, templates = [], onBack, analyticsType, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [timeRange, setTimeRange] = useState("30d");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [viewMode, setViewMode] = useState("overview");
//   const [showCustomModal, setShowCustomModal] = useState(false);
//   const [customRange, setCustomRange] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [dataQuality, setDataQuality] = useState({ valid: true, message: null });

//   // Enhanced data validation on component mount
//   useEffect(() => {
//     const validateData = () => {
//       try {
//         if (!Array.isArray(plans) || !Array.isArray(subscriptions)) {
//           throw new Error('Invalid data structure: plans and subscriptions must be arrays');
//         }
        
//         const hasValidPlans = plans.some(plan => plan.id && plan.name);
//         const hasValidSubscriptions = subscriptions.some(sub => sub.id && sub.plan_id);
        
//         if (!hasValidPlans && !hasValidSubscriptions) {
//           setDataQuality({ 
//             valid: false, 
//             message: 'No valid plan or subscription data available' 
//           });
//         } else {
//           setDataQuality({ valid: true, message: null });
//         }
//       } catch (error) {
//         setDataQuality({ valid: false, message: error.message });
//       }
//     };

//     validateData();
//   }, [plans, subscriptions]);

//   // Enhanced time range handling
//   const handleTimeRangeChange = (value) => {
//     if (value === "custom") {
//       setShowCustomModal(true);
//     } else {
//       setTimeRange(value);
//       setCustomRange(null);
//     }
//   };

//   const handleCustomRangeApply = (range) => {
//     setCustomRange(range);
//     setTimeRange("custom");
//   };

//   // Enhanced refresh with error handling
//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     try {
//       // Simulate API call - in real app, this would fetch fresh data
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       // Trigger parent component to refresh data
//       window.dispatchEvent(new CustomEvent('refreshAnalyticsData'));
//     } catch (error) {
//       console.error('Error refreshing analytics:', error);
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   // Consolidated data processing with enhanced error handling
//   const processedData = useMemo(() => {
//     if (!dataQuality.valid) {
//       return getFallbackAnalyticsData();
//     }

//     try {
//       // Filter plans by analytics type with enhanced logic
//       const filteredPlansByType = analyticsType 
//         ? plans.filter(plan => {
//             const planAccessType = detectAccessType(plan);
//             return planAccessType === analyticsType;
//           })
//         : plans;

//       // Calculate metrics using enhanced processing
//       const { categoryMetrics, totalSubscribers, averageRating } = calculateCategoryMetrics(filteredPlansByType);
      
//       // Use enhanced analytics data processing
//       const analyticsData = processEnhancedAnalyticsData(
//         subscriptions, 
//         filteredPlansByType, 
//         templates,
//         timeRange,
//         analyticsType,
//         customRange
//       );
      
//       // Filter plans by category
//       const filteredPlans = selectedCategory === "All" 
//         ? filteredPlansByType 
//         : filteredPlansByType.filter(plan => plan.category === selectedCategory);

//       // Top performing plans with enhanced calculations
//       const topPlans = filteredPlans
//         .map(plan => ({
//           ...plan,
//           performance: calculatePlanPerformance(plan, totalSubscribers),
//           accessType: detectAccessType(plan)
//         }))
//         .sort((a, b) => b.performance.marketShare - a.performance.marketShare)
//         .slice(0, 10);

//       // Calculate access type distribution
//       const accessTypeDistribution = {
//         hotspot: filteredPlansByType.filter(plan => detectAccessType(plan) === 'hotspot').length,
//         pppoe: filteredPlansByType.filter(plan => detectAccessType(plan) === 'pppoe').length,
//         both: filteredPlansByType.filter(plan => detectAccessType(plan) === 'both').length
//       };

//       return {
//         filteredPlansByType,
//         categoryMetrics,
//         totalSubscribers,
//         averageRating,
//         analyticsData,
//         filteredPlans,
//         topPlans,
//         categoryPerformanceData: Object.entries(analyticsData.categoryStats || {})
//           .map(([category, stats]) => ({
//             category,
//             ...stats,
//             popularity: calculatePopularity(stats.subscriptions),
//             averageRevenue: stats.subscriptions > 0 ? (stats.revenue / stats.subscriptions) : 0
//           }))
//           .sort((a, b) => b.subscriptions - a.subscriptions),
//         accessTypeDistribution,
//         templateAnalytics: analyticsData.templateAnalytics,
//         dataQuality: analyticsData.dataQuality
//       };
//     } catch (error) {
//       console.error('Error processing analytics data:', error);
//       return getFallbackAnalyticsData();
//     }
//   }, [plans, analyticsType, subscriptions, templates, timeRange, selectedCategory, customRange, dataQuality.valid]);

//   // Get analytics type display information
//   const getAnalyticsTypeInfo = () => {
//     switch (analyticsType) {
//       case 'hotspot':
//         return {
//           name: 'Hotspot Analytics',
//           icon: Wifi,
//           color: 'blue',
//           gradient: 'from-blue-500 to-cyan-500',
//           badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
//           description: 'Comprehensive analytics for wireless hotspot plans'
//         };
//       case 'pppoe':
//         return {
//           name: 'PPPoE Analytics',
//           icon: Cable,
//           color: 'emerald',
//           gradient: 'from-emerald-500 to-green-500',
//           badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
//           description: 'Detailed insights for wired PPPoE connections'
//         };
//       default:
//         return {
//           name: 'All Analytics',
//           icon: BarChart3,
//           color: 'purple',
//           gradient: 'from-purple-500 to-pink-500',
//           badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
//           description: 'Track plan performance and subscriber trends across all access types'
//         };
//     }
//   };

//   const analyticsTypeInfo = getAnalyticsTypeInfo();
//   const AnalyticsTypeIcon = analyticsTypeInfo.icon;

//   // Render popularity badge
//   const renderPopularityBadge = (popularity) => (
//     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${popularity.color}`}>
//       <TrendingUp className="w-3 h-3 mr-1" />
//       {popularity.label}
//     </span>
//   );

//   // Render rating stars
//   const renderStars = (rating, size = "sm") => {
//     const starSize = size === "lg" ? "w-5 h-5" : "w-3 h-3 lg:w-4 lg:h-4";
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star 
//             key={i} 
//             className={`${starSize} ${i < Math.floor(rating) 
//               ? "text-amber-400 fill-current" 
//               : theme === 'dark' ? "text-gray-500" : "text-gray-300"}`} 
//           />
//         ))}
//         <span className={`ml-1 text-xs ${themeClasses.text.secondary}`}>
//           {rating.toFixed(1)}
//         </span>
//       </div>
//     );
//   };

//   // Card Component for reusable card layout
//   const Card = ({ children, className = "" }) => (
//     <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} ${className}`}>
//       {children}
//     </div>
//   );

//   // Time Range Selector with enhanced options
//   const TimeRangeSelector = () => {
//     const getTimeRangeLabel = () => {
//       if (timeRange === "custom" && customRange) {
//         const start = new Date(customRange.startDate).toLocaleDateString();
//         const end = new Date(customRange.endDate).toLocaleDateString();
//         return `${start} - ${end}`;
//       }
      
//       const selected = enhancedTimeRanges.find(opt => opt.value === timeRange);
//       return selected ? selected.label : "Select Range";
//     };

//     const getTimeRangeOptions = () => {
//       return enhancedTimeRanges.map(option => ({
//         ...option,
//         label: option.value === "custom" && customRange 
//           ? `Custom: ${new Date(customRange.startDate).toLocaleDateString()} - ${new Date(customRange.endDate).toLocaleDateString()}`
//           : option.label
//       }));
//     };

//     return (
//       <div className="w-full sm:w-64">
//         <EnhancedSelect
//           value={timeRange}
//           onChange={handleTimeRangeChange}
//           options={getTimeRangeOptions()}
//           placeholder="Select time range"
//           theme={theme}
//         />
//       </div>
//     );
//   };

//   // Access Type Distribution Component
//   const AccessTypeDistribution = () => (
//     <Card>
//       <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Access Type Distribution</h4>
//       <div className="space-y-3">
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-gray-600 dark:text-gray-400">Hotspot Plans</span>
//           <span className="font-semibold text-blue-600">{processedData.accessTypeDistribution.hotspot}</span>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-gray-600 dark:text-gray-400">PPPoE Plans</span>
//           <span className="font-semibold text-emerald-600">{processedData.accessTypeDistribution.pppoe}</span>
//         </div>
//         <div className="flex justify-between items-center">
//           <span className="text-sm text-gray-600 dark:text-gray-400">Dual Access Plans</span>
//           <span className="font-semibold text-purple-600">{processedData.accessTypeDistribution.both}</span>
//         </div>
//       </div>
//     </Card>
//   );

//   // Overview Cards with enhanced data
//   const OverviewCards = () => (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
//       <Card>
//         <div className="flex items-center">
//           <Users className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 dark:text-indigo-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{processedData.totalSubscribers}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Subscribers</p>
//           </div>
//         </div>
//       </Card>
      
//       <Card>
//         <div className="flex items-center">
//           <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{processedData.analyticsData.activeSubscriptions}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Active Subscriptions</p>
//           </div>
//         </div>
//       </Card>
      
//       <Card>
//         <div className="flex items-center">
//           <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(processedData.analyticsData.totalRevenue)}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Revenue</p>
//           </div>
//         </div>
//       </Card>
      
//       <Card>
//         <div className="flex items-center">
//           <Box className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{processedData.filteredPlansByType.length}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>
//               {analyticsType ? `${analyticsType.charAt(0).toUpperCase() + analyticsType.slice(1)} Plans` : 'Total Plans'}
//             </p>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );

//   // Category Performance Component
//   const CategoryPerformance = () => (
//     <Card>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         <PieChart className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
//         Category Performance
//         {analyticsType && (
//           <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({analyticsTypeInfo.name})</span>
//         )}
//       </h3>
//       <div className="space-y-4">
//         {processedData.categoryPerformanceData.length > 0 ? (
//           processedData.categoryPerformanceData.map((category, index) => (
//             <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
//                   <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
//                     {index + 1}
//                   </span>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-900 dark:text-white">
//                     {category.category}
//                   </h4>
//                   <div className="flex items-center space-x-2 mt-1">
//                     {renderStars(processedData.categoryMetrics[category.category]?.averageRating || 0)}
//                     {renderPopularityBadge(category.popularity)}
//                   </div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="font-semibold text-gray-900 dark:text-white">{category.subscriptions} subs</p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {formatCurrency(category.revenue)}
//                 </p>
//                 <p className="text-xs text-gray-400 dark:text-gray-500">
//                   {((category.subscriptions / processedData.analyticsData.totalSubscriptions) * 100).toFixed(1)}% share
//                 </p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//             <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
//             <p>No category data available for {analyticsTypeInfo.name}</p>
//           </div>
//         )}
//       </div>
//     </Card>
//   );

//   // Plan Performance Component
//   const PlanPerformance = () => (
//     <Card>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         <Award className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
//         Top Performing Plans
//         {analyticsType && (
//           <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({analyticsTypeInfo.name})</span>
//         )}
//         {selectedCategory !== "All" && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({selectedCategory})</span>}
//       </h3>
      
//       <div className="mb-4 flex flex-col sm:flex-row gap-4">
//         <div className="w-full sm:w-48">
//           <EnhancedSelect
//             value={selectedCategory}
//             onChange={setSelectedCategory}
//             options={[
//               { value: "All", label: "All Categories" },
//               ...categories.map(cat => ({ value: cat, label: cat }))
//             ]}
//             theme={theme}
//           />
//         </div>
//       </div>

//       <div className="space-y-3">
//         {processedData.topPlans.length > 0 ? (
//           processedData.topPlans.map((plan, index) => (
//             <div key={plan.id} className={`p-4 rounded-lg border ${
//               theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
//                     <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
//                       #{index + 1}
//                     </span>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white">
//                       {plan.name}
//                     </h4>
//                     <div className="flex items-center space-x-3 mt-1">
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
//                       }`}>
//                         {plan.category}
//                       </span>
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         plan.accessType === 'hotspot' 
//                           ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
//                           : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
//                       }`}>
//                         {plan.accessType?.toUpperCase()}
//                       </span>
//                       {renderStars(plan.performance.rating)}
//                       {renderPopularityBadge(plan.performance.popularity)}
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="text-right">
//                   <p className="font-semibold text-lg text-gray-900 dark:text-white">{plan.purchases} subscribers</p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     {formatCurrency(plan.performance.revenue)}
//                   </p>
//                   <p className="text-xs text-gray-400 dark:text-gray-500">
//                     {plan.performance.marketShare.toFixed(1)}% market share
//                   </p>
//                 </div>
//               </div>
              
//               <ProgressBar 
//                 percentage={plan.performance.marketShare} 
//                 color="indigo" 
//                 theme={theme} 
//               />
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//             <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
//             <p>No plan data available for {analyticsTypeInfo.name}</p>
//           </div>
//         )}
//       </div>
//     </Card>
//   );

//   // Quick Stats Component
//   const QuickStats = () => (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
//       <Card>
//         <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Most Popular Category</h4>
//         {processedData.categoryPerformanceData.length > 0 ? (
//           <div className="text-center">
//             <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
//               {processedData.categoryPerformanceData[0].category}
//             </div>
//             <div className="text-sm text-gray-500 dark:text-gray-400">
//               {processedData.categoryPerformanceData[0].subscriptions} subscriptions
//             </div>
//             {renderPopularityBadge(processedData.categoryPerformanceData[0].popularity)}
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-400">No data available</p>
//         )}
//       </Card>
      
//       <AccessTypeDistribution />
//     </div>
//   );

//   // View Mode Buttons Component
//   const ViewModeButtons = () => (
//     <div className="flex space-x-2 flex-wrap">
//       {["overview", "categories", "plans", "templates"].map((mode) => (
//         <motion.button
//           key={mode}
//           onClick={() => setViewMode(mode)}
//           className={`px-4 py-2 rounded-lg text-sm ${
//             viewMode === mode 
//               ? "bg-indigo-600 text-white" 
//               : themeClasses.button.secondary
//           }`}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {mode.charAt(0).toUpperCase() + mode.slice(1)}
//         </motion.button>
//       ))}
//     </div>
//   );

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center space-x-4 mb-2">
//               <div className={`p-3 rounded-xl bg-gradient-to-r ${analyticsTypeInfo.gradient}`}>
//                 <AnalyticsTypeIcon className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//                   {analyticsTypeInfo.name}
//                 </h1>
//                 <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
//                   {analyticsTypeInfo.description}
//                 </p>
//               </div>
//             </div>
            
//             {/* Analytics Type Badge */}
//             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${analyticsTypeInfo.badgeColor}`}>
//               <Check className="w-3 h-3 mr-1" />
//               {analyticsTypeInfo.name}
//             </div>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-3">
//             <TimeRangeSelector />
//             <ViewModeButtons />
//             <motion.button
//               onClick={handleRefresh}
//               disabled={isRefreshing}
//               className={`px-4 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </motion.button>
//             <motion.button
//               onClick={onBack}
//               className={`px-4 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Plans
//             </motion.button>
//           </div>
//         </div>

//         {/* Data Quality Warning */}
//         {!dataQuality.valid && (
//           <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//             <div className="flex items-center">
//               <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
//               <div>
//                 <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
//                   Data Quality Issue
//                 </h4>
//                 <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
//                   {dataQuality.message}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main Content based on View Mode */}
//         <div className="space-y-6 lg:space-y-8">
//           <OverviewCards />
          
//           {viewMode === "overview" && (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
//               <div className="lg:col-span-2">
//                 <CategoryPerformance />
//               </div>
//               <div className="space-y-6">
//                 <QuickStats />
//                 <TemplateAnalyticsSection
//                   templateAnalytics={processedData.templateAnalytics}
//                   analyticsType={analyticsType}
//                   theme={theme}
//                 />
//               </div>
//             </div>
//           )}

//           {viewMode === "categories" && <CategoryPerformance />}
//           {viewMode === "plans" && <PlanPerformance />}
//           {viewMode === "templates" && (
//             <TemplateAnalyticsSection
//               templateAnalytics={processedData.templateAnalytics}
//               analyticsType={analyticsType}
//               theme={theme}
//             />
//           )}
//         </div>

//         {/* Custom Date Range Modal */}
//         <CustomDateRangeModal
//           isOpen={showCustomModal}
//           onClose={() => setShowCustomModal(false)}
//           onApply={handleCustomRangeApply}
//           theme={theme}
//         />
//       </main>
//     </div>
//   );
// };

// export default PlanAnalytics;














import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, DollarSign, TrendingUp, Award,
  Calendar, Download, Eye, PieChart, Activity, Box,
  Wifi, Cable, ArrowLeft, Check, Clock, RefreshCw,
  FileText, Layers, Target, AlertTriangle, Filter,
  TrendingDown, Globe, Shield, Package
} from "lucide-react";
import { EnhancedSelect, getThemeClasses } from "../Shared/components"
import { 
  formatNumber, 
  formatCurrency,
  calculatePlanStatistics,
  getAccessTypeColor
} from "../Shared/utils"
import { categories, planTypes } from "../Shared/constant"

// Enhanced Progress Bar
const ProgressBar = ({ percentage, color = "indigo", theme, label = "Progress" }) => (
  <div className="mt-2" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
      <span>{label}</span>
      <span>{percentage.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
      ></div>
    </div>
  </div>
);

// Access type detection
const detectAccessType = (plan) => {
  if (!plan) return null;
  
  if (plan.accessType) return plan.accessType;
  
  const enabledMethods = plan.enabled_access_methods || plan.get_enabled_access_methods?.() || [];
  if (enabledMethods.includes('hotspot') && enabledMethods.includes('pppoe')) return 'dual';
  if (enabledMethods.includes('hotspot')) return 'hotspot';
  if (enabledMethods.includes('pppoe')) return 'pppoe';
  
  return null;
};

// Enhanced plan statistics calculation
const calculateEnhancedPlanStats = (plans, analyticsType, timeRange) => {
  const filteredPlans = analyticsType 
    ? plans.filter(plan => detectAccessType(plan) === analyticsType)
    : plans;

  // Filter by time range if needed
  let timeFilteredPlans = filteredPlans;
  if (timeRange !== 'all') {
    const now = new Date();
    const cutoff = new Date();
    
    switch(timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case '90d':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      default:
        cutoff.setFullYear(now.getFullYear() - 1);
    }
    
    timeFilteredPlans = filteredPlans.filter(plan => {
      const createdDate = new Date(plan.created_at);
      return createdDate >= cutoff;
    });
  }

  const stats = calculatePlanStatistics(timeFilteredPlans);
  
  // Calculate revenue estimates
  const totalRevenue = timeFilteredPlans.reduce((sum, plan) => {
    const price = parseFloat(plan.price) || 0;
    const purchases = plan.purchases || 0;
    return sum + (price * purchases);
  }, 0);

  // Calculate access type distribution
  const accessTypeDistribution = {
    hotspot: timeFilteredPlans.filter(p => detectAccessType(p) === 'hotspot').length,
    pppoe: timeFilteredPlans.filter(p => detectAccessType(p) === 'pppoe').length,
    dual: timeFilteredPlans.filter(p => detectAccessType(p) === 'dual').length
  };

  // Calculate category performance
  const categoryPerformance = {};
  timeFilteredPlans.forEach(plan => {
    const category = plan.category || 'Uncategorized';
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = {
        count: 0,
        purchases: 0,
        revenue: 0,
        active: 0
      };
    }
    
    categoryPerformance[category].count++;
    categoryPerformance[category].purchases += plan.purchases || 0;
    categoryPerformance[category].revenue += (plan.price || 0) * (plan.purchases || 0);
    categoryPerformance[category].active += plan.active ? 1 : 0;
  });

  // Top performing plans
  const topPlans = [...timeFilteredPlans]
    .filter(p => p.purchases > 0)
    .sort((a, b) => (b.purchases || 0) - (a.purchases || 0))
    .slice(0, 10)
    .map(plan => ({
      ...plan,
      revenue: (plan.price || 0) * (plan.purchases || 0),
      marketShare: ((plan.purchases || 0) / (stats.totalPurchases || 1)) * 100
    }));

  // Time variant statistics
  const timeVariantStats = {
    withTimeVariant: timeFilteredPlans.filter(p => p.time_variant?.is_active).length,
    withoutTimeVariant: timeFilteredPlans.filter(p => !p.time_variant?.is_active).length,
    currentlyAvailable: timeFilteredPlans.filter(p => {
      if (!p.time_variant?.is_active) return true;
      // Simplified availability check - in real app, use proper is_available_now function
      return p.time_variant.force_available || true;
    }).length
  };

  return {
    ...stats,
    totalRevenue,
    accessTypeDistribution,
    categoryPerformance,
    topPlans,
    timeVariantStats,
    filteredCount: timeFilteredPlans.length,
    averagePrice: timeFilteredPlans.length > 0 
      ? timeFilteredPlans.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / timeFilteredPlans.length 
      : 0,
    averagePurchases: timeFilteredPlans.length > 0
      ? timeFilteredPlans.reduce((sum, p) => sum + (p.purchases || 0), 0) / timeFilteredPlans.length
      : 0
  };
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, theme, subtext, trend }) => {
  const themeClasses = getThemeClasses(theme);
  
  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className={`text-sm ${themeClasses.text.secondary}`}>{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtext && (
        <p className={`text-sm mt-2 ${themeClasses.text.secondary}`}>{subtext}</p>
      )}
      {trend && (
        <div className="flex items-center mt-3">
          {trend > 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm text-red-600">{Math.abs(trend)}%</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Category Performance Component
const CategoryPerformance = ({ data, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.bg.card} text-center`}>
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className={themeClasses.text.secondary}>No category data available</p>
      </div>
    );
  }

  const categoriesArray = Object.entries(data)
    .map(([category, stats]) => ({
      category,
      ...stats,
      revenuePerPlan: stats.revenue / stats.count,
      purchaseRate: stats.purchases / stats.count
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <PieChart className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
        Category Performance
      </h3>
      <div className="space-y-4">
        {categoriesArray.slice(0, 5).map((item, index) => (
          <div key={item.category} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.category}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                      {item.count} plans
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.active === item.count ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      item.active > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {item.active} active
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.revenue)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.purchases} purchases</p>
              </div>
            </div>
            <ProgressBar 
              percentage={(item.revenue / categoriesArray[0].revenue) * 100} 
              color="indigo" 
              theme={theme}
              label="Revenue Contribution"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Plans Component
const TopPlansSection = ({ topPlans, analyticsType, theme }) => {
  const themeClasses = getThemeClasses(theme);
  
  if (!topPlans || topPlans.length === 0) {
    return (
      <div className={`p-6 rounded-xl ${themeClasses.bg.card} text-center`}>
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className={themeClasses.text.secondary}>No plan performance data available</p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Award className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
        Top Performing Plans
        {analyticsType && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({analyticsType.charAt(0).toUpperCase() + analyticsType.slice(1)})
          </span>
        )}
      </h3>
      <div className="space-y-3">
        {topPlans.map((plan, index) => {
          const accessType = detectAccessType(plan);
          const accessTypeColor = getAccessTypeColor(accessType);
          
          return (
            <div key={plan.id} className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                      {plan.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {plan.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' 
                          ? `${accessTypeColor.dark.bg} ${accessTypeColor.dark.text}`
                          : `${accessTypeColor.light.bg} ${accessTypeColor.light.text}`
                      }`}>
                        {accessType?.toUpperCase() || 'N/A'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        plan.plan_type === 'free_trial'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                      }`}>
                        {plan.plan_type || 'paid'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(plan.revenue)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.purchases} purchases
                  </p>
                </div>
              </div>
              
              <ProgressBar 
                percentage={plan.marketShare} 
                color="indigo" 
                theme={theme}
                label="Market Share"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Access Type Distribution Component
const AccessTypeDistribution = ({ distribution, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const total = distribution.hotspot + distribution.pppoe + distribution.dual;
  
  if (total === 0) return null;

  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Access Type Distribution
      </h3>
      <div className="space-y-4">
        {/* Hotspot */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Wifi className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium">Hotspot Plans</span>
            </div>
            <span className="text-sm font-semibold">{distribution.hotspot} ({getPercentage(distribution.hotspot)}%)</span>
          </div>
          <ProgressBar percentage={getPercentage(distribution.hotspot)} color="blue" theme={theme} />
        </div>
        
        {/* PPPoE */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Cable className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium">PPPoE Plans</span>
            </div>
            <span className="text-sm font-semibold">{distribution.pppoe} ({getPercentage(distribution.pppoe)}%)</span>
          </div>
          <ProgressBar percentage={getPercentage(distribution.pppoe)} color="green" theme={theme} />
        </div>
        
        {/* Dual */}
        {distribution.dual > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Wifi className="w-4 h-4 text-purple-600 mr-1" />
                <Cable className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium ml-2">Dual Access Plans</span>
              </div>
              <span className="text-sm font-semibold">{distribution.dual} ({getPercentage(distribution.dual)}%)</span>
            </div>
            <ProgressBar percentage={getPercentage(distribution.dual)} color="purple" theme={theme} />
          </div>
        )}
      </div>
    </div>
  );
};

// Time Variant Statistics Component
const TimeVariantStats = ({ stats, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const total = stats.withTimeVariant + stats.withoutTimeVariant;
  
  if (total === 0) return null;

  return (
    <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Clock className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-400" />
        Time Availability Analytics
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.withTimeVariant}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Time Restricted</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.withoutTimeVariant}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Always Available</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.currentlyAvailable}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available Now</div>
        </div>
      </div>
    </div>
  );
};

// Main PlanAnalytics Component
const PlanAnalytics = ({ 
  plans, 
  onBack, 
  analyticsType, 
  theme,
  exportData,
  refreshAnalytics 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Calculate statistics
  const stats = useMemo(() => {
    return calculateEnhancedPlanStats(plans, analyticsType, timeRange);
  }, [plans, analyticsType, timeRange]);
  
  // Get analytics type info
  const getAnalyticsTypeInfo = () => {
    switch (analyticsType) {
      case 'hotspot':
        return {
          name: 'Hotspot Analytics',
          icon: Wifi,
          color: 'blue',
          gradient: 'from-blue-500 to-cyan-500',
          description: 'Comprehensive analytics for wireless hotspot plans'
        };
      case 'pppoe':
        return {
          name: 'PPPoE Analytics',
          icon: Cable,
          color: 'green',
          gradient: 'from-green-500 to-emerald-500',
          description: 'Detailed insights for wired PPPoE connections'
        };
      default:
        return {
          name: 'All Plan Analytics',
          icon: BarChart3,
          color: 'indigo',
          gradient: 'from-indigo-500 to-purple-500',
          description: 'Track plan performance across all access types'
        };
    }
  };

  const analyticsTypeInfo = getAnalyticsTypeInfo();
  const AnalyticsTypeIcon = analyticsTypeInfo.icon;

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAnalytics();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle export
  const handleExport = () => {
    const exportPayload = {
      analyticsType,
      timeRange,
      stats,
      timestamp: new Date().toISOString()
    };
    exportData(exportPayload);
  };

  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${analyticsTypeInfo.gradient}`}>
                <AnalyticsTypeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                  {analyticsTypeInfo.name}
                </h1>
                <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${themeClasses.text.secondary}`}>
                  {analyticsTypeInfo.description}
                </p>
              </div>
            </div>
            
            {/* Analytics Type Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              analyticsTypeInfo.color === 'blue' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
                : analyticsTypeInfo.color === 'green'
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-200 dark:border-green-700'
                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-700'
            }`}>
              <Check className="w-3 h-3 mr-1" />
              {analyticsTypeInfo.name}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Time Range Selector */}
            <div className="w-full sm:w-48">
              <EnhancedSelect
                value={timeRange}
                onChange={setTimeRange}
                options={[
                  { value: "7d", label: "Last 7 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "90d", label: "Last 90 Days" },
                  { value: "365d", label: "Last 1 Year" },
                  { value: "all", label: "All Time" }
                ]}
                theme={theme}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
              <motion.button
                onClick={handleExport}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.primary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </motion.button>
              <motion.button
                onClick={onBack}
                className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </motion.button>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Plans"
            value={stats.filteredCount}
            icon={Box}
            color="indigo"
            theme={theme}
            subtext={`${analyticsType || 'All'} plans`}
          />
          <StatCard
            title="Total Purchases"
            value={formatNumber(stats.totalPurchases)}
            icon={Users}
            color="green"
            theme={theme}
            subtext={`${stats.totalActivePlans} active plans`}
          />
          <StatCard
            title="Estimated Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="purple"
            theme={theme}
            subtext="Based on plan prices and purchases"
          />
          <StatCard
            title="Average Price"
            value={`KES ${formatNumber(stats.averagePrice.toFixed(2))}`}
            icon={Activity}
            color="blue"
            theme={theme}
            subtext={`${stats.averagePurchases.toFixed(1)} avg purchases per plan`}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            <CategoryPerformance data={stats.categoryPerformance} theme={theme} />
            <AccessTypeDistribution distribution={stats.accessTypeDistribution} theme={theme} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            <TopPlansSection topPlans={stats.topPlans} analyticsType={analyticsType} theme={theme} />
            <TimeVariantStats stats={stats.timeVariantStats} theme={theme} />
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Detailed Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.highPriorityPlans || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">High Priority Plans</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.freeTrialPlans || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Free Trial Plans</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.paidPlans || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Paid Plans</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inactivePlans || 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Inactive Plans</div>
            </div>
          </div>
        </div>

        {/* Time Range Summary */}
        <div className={`p-4 sm:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <Calendar className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-400" />
            Time Range Summary
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className={themeClasses.text.secondary}>
                Showing data for: <span className="font-semibold">
                  {timeRange === '7d' ? 'Last 7 Days' :
                   timeRange === '30d' ? 'Last 30 Days' :
                   timeRange === '90d' ? 'Last 90 Days' :
                   timeRange === '365d' ? 'Last 1 Year' : 'All Time'}
                </span>
              </p>
              <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
                Plans analyzed: <span className="font-semibold">{stats.filteredCount}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanAnalytics;