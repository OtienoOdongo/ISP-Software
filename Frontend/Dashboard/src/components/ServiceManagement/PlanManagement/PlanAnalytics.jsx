



// import React, { useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   BarChart3, Users, DollarSign, TrendingUp, Award,
//   Calendar, Filter, Download, Eye, PieChart, Activity, Box,
//   Wifi, Cable, ArrowLeft, Check, Clock, X
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

// // Star component for ratings
// const Star = ({ className }) => (
//   <svg className={className} fill="currentColor" viewBox="0 0 20 20">
//     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//   </svg>
// );

// // Progress Bar Component
// const ProgressBar = ({ percentage, color = "indigo", theme }) => (
//   <div className="mt-3">
//     <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
//       <span>Progress</span>
//       <span>{percentage.toFixed(1)}%</span>
//     </div>
//     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//       <div 
//         className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
//         style={{ width: `${Math.min(percentage, 100)}%` }}
//       ></div>
//     </div>
//   </div>
// );

// // Format currency consistently
// const formatCurrency = (amount) => `KES ${formatNumber(amount)}`;

// // Enhanced time range options with more granular selections
// const enhancedTimeRanges = [
//   // Daily
//   { value: "1d", label: "Today" },
//   { value: "2d", label: "Last 2 Days" },
//   { value: "3d", label: "Last 3 Days" },
  
//   // Weekly
//   { value: "7d", label: "Last 7 Days" },
//   { value: "14d", label: "Last 14 Days" },
//   { value: "21d", label: "Last 21 Days" },
  
//   // Monthly
//   { value: "30d", label: "Last 30 Days" },
//   { value: "60d", label: "Last 60 Days" },
//   { value: "90d", label: "Last 90 Days" },
//   { value: "180d", label: "Last 6 Months" },
  
//   // Yearly
//   { value: "365d", label: "Last 1 Year" },
//   { value: "730d", label: "Last 2 Years" },
  
//   // All time
//   { value: "all", label: "All Time" },
  
//   // Custom Range
//   { value: "custom", label: "Custom Range" }
// ];

// // Custom Date Range Modal Component
// const CustomDateRangeModal = ({ isOpen, onClose, onApply, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const handleApply = () => {
//     if (startDate && endDate) {
//       onApply({ startDate, endDate });
//       onClose();
//     }
//   };

//   const handleReset = () => {
//     setStartDate("");
//     setEndDate("");
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
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <div className="space-y-4 mb-6">
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               Start Date
//             </label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>
          
//           <div>
//             <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//               End Date
//             </label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
//             />
//           </div>
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

// const PlanAnalytics = ({ plans, subscriptions, templates = [], onBack, analyticsType, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [timeRange, setTimeRange] = useState("30d");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [viewMode, setViewMode] = useState("overview");
//   const [showCustomModal, setShowCustomModal] = useState(false);
//   const [customRange, setCustomRange] = useState(null);

//   // Handle time range change
//   const handleTimeRangeChange = (value) => {
//     if (value === "custom") {
//       setShowCustomModal(true);
//     } else {
//       setTimeRange(value);
//       setCustomRange(null);
//     }
//   };

//   // Handle custom range application
//   const handleCustomRangeApply = (range) => {
//     setCustomRange(range);
//     setTimeRange("custom");
//   };

//   // Get display label for time range
//   const getTimeRangeLabel = () => {
//     if (timeRange === "custom" && customRange) {
//       const start = new Date(customRange.startDate).toLocaleDateString();
//       const end = new Date(customRange.endDate).toLocaleDateString();
//       return `${start} - ${end}`;
//     }
    
//     const selected = enhancedTimeRanges.find(opt => opt.value === timeRange);
//     return selected ? selected.label : "Select Range";
//   };

//   // Enhanced time range options with custom display
//   const getTimeRangeOptions = () => {
//     return enhancedTimeRanges.map(option => ({
//       ...option,
//       label: option.value === "custom" && customRange 
//         ? `Custom: ${new Date(customRange.startDate).toLocaleDateString()} - ${new Date(customRange.endDate).toLocaleDateString()}`
//         : option.label
//     }));
//   };

//   // Consolidated data processing
//   const processedData = useMemo(() => {
//     // Filter plans by analytics type
//     const filteredPlansByType = analyticsType 
//       ? plans.filter(plan => plan.accessType === analyticsType)
//       : plans;

//     // Calculate metrics - pass custom range if selected
//     const { categoryMetrics, totalSubscribers, averageRating } = calculateCategoryMetrics(filteredPlansByType);
//     const analyticsData = processAnalyticsData(
//       subscriptions, 
//       filteredPlansByType, 
//       timeRange,
//       customRange
//     );
    
//     // Filter plans by category
//     const filteredPlans = selectedCategory === "All" 
//       ? filteredPlansByType 
//       : filteredPlansByType.filter(plan => plan.category === selectedCategory);

//     // Top performing plans
//     const topPlans = filteredPlans
//       .map(plan => ({
//         ...plan,
//         performance: calculatePlanPerformance(plan, totalSubscribers)
//       }))
//       .sort((a, b) => b.performance.marketShare - a.performance.marketShare)
//       .slice(0, 10);

//     // Template analytics
//     const templateAnalytics = templates
//       .filter(template => {
//         if (template.isActive === false) return false;
//         if (analyticsType && template.accessType !== analyticsType) return false;
//         return true;
//       })
//       .map(template => ({
//         ...template,
//         usageRate: ((template.usageCount || template.usage_count || 0) / Math.max(filteredPlansByType.length, 1)) * 100
//       }))
//       .sort((a, b) => (b.usageCount || b.usage_count || 0) - (a.usageCount || a.usage_count || 0))
//       .slice(0, 10);

//     // Category Performance Data
//     const categoryPerformanceData = Object.entries(analyticsData.categoryStats || {})
//       .map(([category, stats]) => ({
//         category,
//         ...stats,
//         popularity: calculatePopularity(stats.subscriptions)
//       }))
//       .sort((a, b) => b.subscriptions - a.subscriptions);

//     return {
//       filteredPlansByType,
//       categoryMetrics,
//       totalSubscribers,
//       averageRating,
//       analyticsData,
//       filteredPlans,
//       topPlans,
//       templateAnalytics,
//       categoryPerformanceData
//     };
//   }, [plans, analyticsType, subscriptions, timeRange, selectedCategory, templates, customRange]);

//   const {
//     filteredPlansByType,
//     categoryMetrics,
//     totalSubscribers,
//     analyticsData,
//     filteredPlans,
//     topPlans,
//     templateAnalytics,
//     categoryPerformanceData
//   } = processedData;

//   // Get analytics type display information
//   const getAnalyticsTypeInfo = () => {
//     switch (analyticsType) {
//       case 'hotspot':
//         return {
//           name: 'Hotspot Analytics',
//           icon: Wifi,
//           color: 'blue',
//           gradient: 'from-blue-500 to-cyan-500',
//           badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
//         };
//       case 'pppoe':
//         return {
//           name: 'PPPoE Analytics',
//           icon: Cable,
//           color: 'emerald',
//           gradient: 'from-emerald-500 to-green-500',
//           badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
//         };
//       default:
//         return {
//           name: 'All Analytics',
//           icon: BarChart3,
//           color: 'purple',
//           gradient: 'from-purple-500 to-pink-500',
//           badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
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
//   const TimeRangeSelector = () => (
//     <div className="w-full sm:w-64">
//       <EnhancedSelect
//         value={timeRange}
//         onChange={handleTimeRangeChange}
//         options={getTimeRangeOptions()}
//         placeholder="Select time range"
//         theme={theme}
//       />
//     </div>
//   );

//   // Overview Cards
//   const OverviewCards = () => (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
//       <Card>
//         <div className="flex items-center">
//           <Users className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 dark:text-indigo-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Subscribers</p>
//           </div>
//         </div>
//       </Card>
      
//       <Card>
//         <div className="flex items-center">
//           <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.activeSubscriptions}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Active Subscriptions</p>
//           </div>
//         </div>
//       </Card>
      
//       <Card>
//         <div className="flex items-center">
//           <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analyticsData.totalRevenue)}</h3>
//             <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Revenue</p>
//           </div>
//         </div>
//       </Card>
      
//       <Card>
//         <div className="flex items-center">
//           <Box className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400 mr-3 lg:mr-4" />
//           <div>
//             <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{filteredPlansByType.length}</h3>
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
//         {categoryPerformanceData.length > 0 ? (
//           categoryPerformanceData.map((category, index) => (
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
//                     {renderStars(categoryMetrics[category.category]?.averageRating || 0)}
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
//                   {((category.subscriptions / analyticsData.totalSubscriptions) * 100).toFixed(1)}% share
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
//         {topPlans.length > 0 ? (
//           topPlans.map((plan, index) => (
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
//         {categoryPerformanceData.length > 0 ? (
//           <div className="text-center">
//             <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
//               {categoryPerformanceData[0].category}
//             </div>
//             <div className="text-sm text-gray-500 dark:text-gray-400">
//               {categoryPerformanceData[0].subscriptions} subscriptions
//             </div>
//             {renderPopularityBadge(categoryPerformanceData[0].popularity)}
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-400">No data available</p>
//         )}
//       </Card>
      
//       <Card>
//         <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Growth Insights</h4>
//         {categoryPerformanceData.length > 0 ? (
//           <div className="space-y-2">
//             {categoryPerformanceData.slice(0, 3).map((category, index) => (
//               <div key={category.category} className="flex justify-between items-center">
//                 <span className="text-sm text-gray-700 dark:text-gray-300">{category.category}</span>
//                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                   {category.subscriptions} subs
//                 </span>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-400">No growth data available</p>
//         )}
//       </Card>
//     </div>
//   );

//   // Template Performance Component
//   const TemplatePerformance = () => (
//     <Card>
//       <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         <Box className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
//         Template Performance
//         {analyticsType && (
//           <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({analyticsTypeInfo.name})</span>
//         )}
//       </h3>
      
//       {templateAnalytics.length === 0 ? (
//         <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//           <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
//           <p>No template data available for {analyticsTypeInfo.name}</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {templateAnalytics.map((template, index) => (
//             <div key={template.id} className={`p-4 rounded-lg border ${
//               theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
//                     <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
//                       #{index + 1}
//                     </span>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold text-gray-900 dark:text-white">
//                       {template.name}
//                     </h4>
//                     <div className="flex items-center space-x-3 mt-1">
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
//                       }`}>
//                         {template.category}
//                       </span>
//                       <span className="text-xs text-gray-500 dark:text-gray-400">
//                         Used {template.usageCount || template.usage_count || 0} times
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="text-right">
//                   <p className="font-semibold text-lg text-gray-900 dark:text-white">
//                     {template.usageRate.toFixed(1)}%
//                   </p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Usage Rate
//                   </p>
//                 </div>
//               </div>
              
//               <ProgressBar 
//                 percentage={template.usageRate} 
//                 color="blue" 
//                 theme={theme} 
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </Card>
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
//                   {analyticsType === 'hotspot' 
//                     ? 'Comprehensive analytics for wireless hotspot plans' 
//                     : analyticsType === 'pppoe'
//                     ? 'Detailed insights for wired PPPoE connections'
//                     : 'Track plan performance and subscriber trends'
//                   }
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
//                 <TemplatePerformance />
//               </div>
//             </div>
//           )}

//           {viewMode === "categories" && <CategoryPerformance />}
//           {viewMode === "plans" && <PlanPerformance />}
//           {viewMode === "templates" && <TemplatePerformance />}
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
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Users, DollarSign, TrendingUp, Award,
  Calendar, Filter, Download, Eye, PieChart, Activity, Box,
  Wifi, Cable, ArrowLeft, Check, Clock, X, RefreshCw
} from "lucide-react";
import { EnhancedSelect, getThemeClasses } from "../Shared/components"
import { 
  formatNumber, 
  calculateCategoryMetrics, 
  processAnalyticsData,
  calculatePlanPerformance,
  calculatePopularity
} from "../Shared/utils"
import { analyticsTimeRanges, categories, popularityLevels } from "../Shared/constant"

// Star component for ratings
const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Progress Bar Component
const ProgressBar = ({ percentage, color = "indigo", theme }) => (
  <div className="mt-3">
    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
      <span>Progress</span>
      <span>{percentage.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  </div>
);

// Format currency consistently
const formatCurrency = (amount) => `KES ${formatNumber(amount)}`;

// Enhanced time range options with more granular selections
const enhancedTimeRanges = [
  // Daily
  { value: "1d", label: "Today" },
  { value: "2d", label: "Last 2 Days" },
  { value: "3d", label: "Last 3 Days" },
  
  // Weekly
  { value: "7d", label: "Last 7 Days" },
  { value: "14d", label: "Last 14 Days" },
  { value: "21d", label: "Last 21 Days" },
  
  // Monthly
  { value: "30d", label: "Last 30 Days" },
  { value: "60d", label: "Last 60 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "180d", label: "Last 6 Months" },
  
  // Yearly
  { value: "365d", label: "Last 1 Year" },
  { value: "730d", label: "Last 2 Years" },
  
  // All time
  { value: "all", label: "All Time" },
  
  // Custom Range
  { value: "custom", label: "Custom Range" }
];

// Enhanced analytics data processing with proper access type filtering
const processAnalyticsDataEnhanced = (subscriptions, plans, timeRange = '30d', analyticsType = null, customRange = null) => {
  const now = new Date();
  let startDate = new Date();
  
  // Handle custom date range
  if (customRange) {
    startDate = new Date(customRange.startDate);
    const endDate = new Date(customRange.endDate);
    
    const filteredSubscriptions = subscriptions.filter(sub => {
      const subscriptionDate = new Date(sub.created_at || sub.start_date);
      const dateMatch = subscriptionDate >= startDate && subscriptionDate <= endDate;
      
      if (analyticsType && sub.plan_id) {
        const plan = plans.find(p => p.id === sub.plan_id);
        if (plan) {
          const planAccessType = plan.accessType || 
                                (plan.accessMethods?.hotspot?.enabled ? 'hotspot' : 
                                 plan.accessMethods?.pppoe?.enabled ? 'pppoe' : null);
          return dateMatch && planAccessType === analyticsType;
        }
      }
      
      return dateMatch;
    });

    return processAnalyticsData(filteredSubscriptions, plans, 'custom');
  }
  
  // Handle predefined time ranges
  switch (timeRange) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      break;
    case '2d':
      startDate.setDate(now.getDate() - 2);
      break;
    case '3d':
      startDate.setDate(now.getDate() - 3);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '14d':
      startDate.setDate(now.getDate() - 14);
      break;
    case '21d':
      startDate.setDate(now.getDate() - 21);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '60d':
      startDate.setDate(now.getDate() - 60);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '180d':
      startDate.setDate(now.getDate() - 180);
      break;
    case '365d':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '730d':
      startDate.setFullYear(now.getFullYear() - 2);
      break;
    default:
      startDate = new Date(0); // All time
  }

  // Enhanced filtering by analytics type
  const filteredSubscriptions = subscriptions.filter(sub => {
    const subscriptionDate = new Date(sub.created_at || sub.start_date);
    const dateMatch = subscriptionDate >= startDate;
    
    if (analyticsType && sub.plan_id) {
      const plan = plans.find(p => p.id === sub.plan_id);
      if (plan) {
        const planAccessType = plan.accessType || 
                              (plan.accessMethods?.hotspot?.enabled ? 'hotspot' : 
                               plan.accessMethods?.pppoe?.enabled ? 'pppoe' : null);
        return dateMatch && planAccessType === analyticsType;
      }
    }
    
    return dateMatch;
  });

  return processAnalyticsData(filteredSubscriptions, plans, timeRange);
};

// Custom Date Range Modal Component
const CustomDateRangeModal = ({ isOpen, onClose, onApply, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    if (startDate && endDate) {
      onApply({ startDate, endDate });
      onClose();
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`w-full max-w-md rounded-xl shadow-lg ${themeClasses.bg.card} ${themeClasses.border.light} border p-6`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Custom Date Range
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${themeClasses.button.secondary}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${themeClasses.input}`}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${themeClasses.button.secondary}`}
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
              !startDate || !endDate 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Apply Range
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PlanAnalytics = ({ plans, subscriptions, templates = [], onBack, analyticsType, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("overview");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    if (value === "custom") {
      setShowCustomModal(true);
    } else {
      setTimeRange(value);
      setCustomRange(null);
    }
  };

  // Handle custom range application
  const handleCustomRangeApply = (range) => {
    setCustomRange(range);
    setTimeRange("custom");
  };

  // Handle refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API refresh - in real app, this would fetch new data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Get display label for time range
  const getTimeRangeLabel = () => {
    if (timeRange === "custom" && customRange) {
      const start = new Date(customRange.startDate).toLocaleDateString();
      const end = new Date(customRange.endDate).toLocaleDateString();
      return `${start} - ${end}`;
    }
    
    const selected = enhancedTimeRanges.find(opt => opt.value === timeRange);
    return selected ? selected.label : "Select Range";
  };

  // Enhanced time range options with custom display
  const getTimeRangeOptions = () => {
    return enhancedTimeRanges.map(option => ({
      ...option,
      label: option.value === "custom" && customRange 
        ? `Custom: ${new Date(customRange.startDate).toLocaleDateString()} - ${new Date(customRange.endDate).toLocaleDateString()}`
        : option.label
    }));
  };

  // Consolidated data processing with enhanced filtering
  const processedData = useMemo(() => {
    // Filter plans by analytics type with enhanced logic
    const filteredPlansByType = analyticsType 
      ? plans.filter(plan => {
          const planAccessType = plan.accessType || 
                               (plan.accessMethods?.hotspot?.enabled ? 'hotspot' : 
                                plan.accessMethods?.pppoe?.enabled ? 'pppoe' : null);
          return planAccessType === analyticsType;
        })
      : plans;

    // Calculate metrics using enhanced processing
    const { categoryMetrics, totalSubscribers, averageRating } = calculateCategoryMetrics(filteredPlansByType);
    
    // Use enhanced analytics data processing
    const analyticsData = processAnalyticsDataEnhanced(
      subscriptions, 
      filteredPlansByType, 
      timeRange,
      analyticsType,
      customRange
    );
    
    // Filter plans by category
    const filteredPlans = selectedCategory === "All" 
      ? filteredPlansByType 
      : filteredPlansByType.filter(plan => plan.category === selectedCategory);

    // Top performing plans with enhanced calculations
    const topPlans = filteredPlans
      .map(plan => ({
        ...plan,
        performance: calculatePlanPerformance(plan, totalSubscribers),
        accessType: plan.accessType || (plan.accessMethods?.hotspot?.enabled ? 'hotspot' : 'pppoe')
      }))
      .sort((a, b) => b.performance.marketShare - a.performance.marketShare)
      .slice(0, 10);

    // Enhanced template analytics with access type filtering
    const templateAnalytics = templates
      .filter(template => {
        if (template.isActive === false) return false;
        if (analyticsType) {
          const templateAccessType = template.accessType || 
                                   (template.accessMethods?.hotspot?.enabled ? 'hotspot' : 
                                    template.accessMethods?.pppoe?.enabled ? 'pppoe' : null);
          return templateAccessType === analyticsType;
        }
        return true;
      })
      .map(template => ({
        ...template,
        usageRate: ((template.usageCount || template.usage_count || 0) / Math.max(filteredPlansByType.length, 1)) * 100,
        accessType: template.accessType || (template.accessMethods?.hotspot?.enabled ? 'hotspot' : 'pppoe')
      }))
      .sort((a, b) => (b.usageCount || b.usage_count || 0) - (a.usageCount || a.usage_count || 0))
      .slice(0, 10);

    // Category Performance Data with enhanced metrics
    const categoryPerformanceData = Object.entries(analyticsData.categoryStats || {})
      .map(([category, stats]) => ({
        category,
        ...stats,
        popularity: calculatePopularity(stats.subscriptions),
        averageRevenue: stats.subscriptions > 0 ? (stats.revenue / stats.subscriptions) : 0
      }))
      .sort((a, b) => b.subscriptions - a.subscriptions);

    // Calculate access type distribution
    const accessTypeDistribution = {
      hotspot: filteredPlansByType.filter(plan => 
        plan.accessMethods?.hotspot?.enabled || plan.accessType === 'hotspot'
      ).length,
      pppoe: filteredPlansByType.filter(plan => 
        plan.accessMethods?.pppoe?.enabled || plan.accessType === 'pppoe'
      ).length,
      both: filteredPlansByType.filter(plan => 
        plan.accessMethods?.hotspot?.enabled && plan.accessMethods?.pppoe?.enabled
      ).length
    };

    return {
      filteredPlansByType,
      categoryMetrics,
      totalSubscribers,
      averageRating,
      analyticsData,
      filteredPlans,
      topPlans,
      templateAnalytics,
      categoryPerformanceData,
      accessTypeDistribution
    };
  }, [plans, analyticsType, subscriptions, timeRange, selectedCategory, templates, customRange]);

  const {
    filteredPlansByType,
    categoryMetrics,
    totalSubscribers,
    analyticsData,
    filteredPlans,
    topPlans,
    templateAnalytics,
    categoryPerformanceData,
    accessTypeDistribution
  } = processedData;

  // Get analytics type display information
  const getAnalyticsTypeInfo = () => {
    switch (analyticsType) {
      case 'hotspot':
        return {
          name: 'Hotspot Analytics',
          icon: Wifi,
          color: 'blue',
          gradient: 'from-blue-500 to-cyan-500',
          badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          description: 'Comprehensive analytics for wireless hotspot plans'
        };
      case 'pppoe':
        return {
          name: 'PPPoE Analytics',
          icon: Cable,
          color: 'emerald',
          gradient: 'from-emerald-500 to-green-500',
          badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          description: 'Detailed insights for wired PPPoE connections'
        };
      default:
        return {
          name: 'All Analytics',
          icon: BarChart3,
          color: 'purple',
          gradient: 'from-purple-500 to-pink-500',
          badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          description: 'Track plan performance and subscriber trends across all access types'
        };
    }
  };

  const analyticsTypeInfo = getAnalyticsTypeInfo();
  const AnalyticsTypeIcon = analyticsTypeInfo.icon;

  // Render popularity badge
  const renderPopularityBadge = (popularity) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${popularity.color}`}>
      <TrendingUp className="w-3 h-3 mr-1" />
      {popularity.label}
    </span>
  );

  // Render rating stars
  const renderStars = (rating, size = "sm") => {
    const starSize = size === "lg" ? "w-5 h-5" : "w-3 h-3 lg:w-4 lg:h-4";
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`${starSize} ${i < Math.floor(rating) 
              ? "text-amber-400 fill-current" 
              : theme === 'dark' ? "text-gray-500" : "text-gray-300"}`} 
          />
        ))}
        <span className={`ml-1 text-xs ${themeClasses.text.secondary}`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Card Component for reusable card layout
  const Card = ({ children, className = "" }) => (
    <div className={`p-4 lg:p-6 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light} ${className}`}>
      {children}
    </div>
  );

  // Time Range Selector with enhanced options
  const TimeRangeSelector = () => (
    <div className="w-full sm:w-64">
      <EnhancedSelect
        value={timeRange}
        onChange={handleTimeRangeChange}
        options={getTimeRangeOptions()}
        placeholder="Select time range"
        theme={theme}
      />
    </div>
  );

  // Access Type Distribution Component
  const AccessTypeDistribution = () => (
    <Card>
      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Access Type Distribution</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Hotspot Plans</span>
          <span className="font-semibold text-blue-600">{accessTypeDistribution.hotspot}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">PPPoE Plans</span>
          <span className="font-semibold text-emerald-600">{accessTypeDistribution.pppoe}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Dual Access Plans</span>
          <span className="font-semibold text-purple-600">{accessTypeDistribution.both}</span>
        </div>
      </div>
    </Card>
  );

  // Overview Cards with enhanced data
  const OverviewCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <Card>
        <div className="flex items-center">
          <Users className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600 dark:text-indigo-400 mr-3 lg:mr-4" />
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers}</h3>
            <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Subscribers</p>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center">
          <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400 mr-3 lg:mr-4" />
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.activeSubscriptions}</h3>
            <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Active Subscriptions</p>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 dark:text-purple-400 mr-3 lg:mr-4" />
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analyticsData.totalRevenue)}</h3>
            <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>Total Revenue</p>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="flex items-center">
          <Box className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400 mr-3 lg:mr-4" />
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{filteredPlansByType.length}</h3>
            <p className={`text-xs lg:text-sm ${themeClasses.text.secondary}`}>
              {analyticsType ? `${analyticsType.charAt(0).toUpperCase() + analyticsType.slice(1)} Plans` : 'Total Plans'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  // Category Performance Component
  const CategoryPerformance = () => (
    <Card>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <PieChart className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
        Category Performance
        {analyticsType && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({analyticsTypeInfo.name})</span>
        )}
      </h3>
      <div className="space-y-4">
        {categoryPerformanceData.length > 0 ? (
          categoryPerformanceData.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {category.category}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(categoryMetrics[category.category]?.averageRating || 0)}
                    {renderPopularityBadge(category.popularity)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">{category.subscriptions} subs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(category.revenue)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {((category.subscriptions / analyticsData.totalSubscriptions) * 100).toFixed(1)}% share
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No category data available for {analyticsTypeInfo.name}</p>
          </div>
        )}
      </div>
    </Card>
  );

  // Plan Performance Component
  const PlanPerformance = () => (
    <Card>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Award className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
        Top Performing Plans
        {analyticsType && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({analyticsTypeInfo.name})</span>
        )}
        {selectedCategory !== "All" && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({selectedCategory})</span>}
      </h3>
      
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <EnhancedSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { value: "All", label: "All Categories" },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
            theme={theme}
          />
        </div>
      </div>

      <div className="space-y-3">
        {topPlans.length > 0 ? (
          topPlans.map((plan, index) => (
            <div key={plan.id} className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {plan.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        plan.accessType === 'hotspot' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      }`}>
                        {plan.accessType?.toUpperCase()}
                      </span>
                      {renderStars(plan.performance.rating)}
                      {renderPopularityBadge(plan.performance.popularity)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">{plan.purchases} subscribers</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(plan.performance.revenue)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {plan.performance.marketShare.toFixed(1)}% market share
                  </p>
                </div>
              </div>
              
              <ProgressBar 
                percentage={plan.performance.marketShare} 
                color="indigo" 
                theme={theme} 
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No plan data available for {analyticsTypeInfo.name}</p>
          </div>
        )}
      </div>
    </Card>
  );

  // Quick Stats Component
  const QuickStats = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <Card>
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Most Popular Category</h4>
        {categoryPerformanceData.length > 0 ? (
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              {categoryPerformanceData[0].category}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {categoryPerformanceData[0].subscriptions} subscriptions
            </div>
            {renderPopularityBadge(categoryPerformanceData[0].popularity)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        )}
      </Card>
      
      <AccessTypeDistribution />
    </div>
  );

  // Template Performance Component
  const TemplatePerformance = () => (
    <Card>
      <h3 className="text-lg lg:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Box className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />
        Template Performance
        {analyticsType && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({analyticsTypeInfo.name})</span>
        )}
      </h3>
      
      {templateAnalytics.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No template data available for {analyticsTypeInfo.name}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templateAnalytics.map((template, index) => (
            <div key={template.id} className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {template.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.accessType === 'hotspot' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      }`}>
                        {template.accessType?.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Used {template.usageCount || template.usage_count || 0} times
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {template.usageRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Usage Rate
                  </p>
                </div>
              </div>
              
              <ProgressBar 
                percentage={template.usageRate} 
                color="blue" 
                theme={theme} 
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  // View Mode Buttons Component
  const ViewModeButtons = () => (
    <div className="flex space-x-2 flex-wrap">
      {["overview", "categories", "plans", "templates"].map((mode) => (
        <motion.button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`px-4 py-2 rounded-lg text-sm ${
            viewMode === mode 
              ? "bg-indigo-600 text-white" 
              : themeClasses.button.secondary
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4 mb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${analyticsTypeInfo.gradient}`}>
                <AnalyticsTypeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                  {analyticsTypeInfo.name}
                </h1>
                <p className={`mt-1 lg:mt-2 text-sm lg:text-lg ${themeClasses.text.secondary}`}>
                  {analyticsTypeInfo.description}
                </p>
              </div>
            </div>
            
            {/* Analytics Type Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${analyticsTypeInfo.badgeColor}`}>
              <Check className="w-3 h-3 mr-1" />
              {analyticsTypeInfo.name}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <TimeRangeSelector />
            <ViewModeButtons />
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            <motion.button
              onClick={onBack}
              className={`px-4 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </motion.button>
          </div>
        </div>

        {/* Main Content based on View Mode */}
        <div className="space-y-6 lg:space-y-8">
          <OverviewCards />
          
          {viewMode === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <CategoryPerformance />
              </div>
              <div className="space-y-6">
                <QuickStats />
                <TemplatePerformance />
              </div>
            </div>
          )}

          {viewMode === "categories" && <CategoryPerformance />}
          {viewMode === "plans" && <PlanPerformance />}
          {viewMode === "templates" && <TemplatePerformance />}
        </div>

        {/* Custom Date Range Modal */}
        <CustomDateRangeModal
          isOpen={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onApply={handleCustomRangeApply}
          theme={theme}
        />
      </main>
    </div>
  );
};

export default PlanAnalytics;