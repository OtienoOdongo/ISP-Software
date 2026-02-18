


// // ============================================================================
// // PlanAnalytics.js - COMPLETELY REWRITTEN
// // ============================================================================

// import React, { useState, useMemo, useCallback } from "react";
// import { motion } from "framer-motion";
// import {
//   BarChart3, Users, TrendingUp, Award,
//   Calendar, Download, Eye, PieChart, Activity, Box,
//   Wifi, Cable, ArrowLeft, Check, Clock, RefreshCw,
//   FileText, Layers, Target, AlertTriangle, Filter,
//   TrendingDown, Globe, Shield, Package, Zap, Database,
//   DollarSign, Percent, Star, Crown, Sparkles, Gift,
//   Smartphone, Gauge, Server, ArrowUp, ArrowDown,
//   Minus, Circle, CheckCircle, XCircle
// } from "lucide-react";
// import { EnhancedSelect, getThemeClasses } from "../Shared/components";
// import { formatNumber, formatCurrency, formatDate } from "../Shared/formatters";

// // ============================================================================
// // CONSTANTS
// // ============================================================================
// const TIME_RANGE_OPTIONS = [
//   { value: "7d", label: "Last 7 Days" },
//   { value: "30d", label: "Last 30 Days" },
//   { value: "90d", label: "Last 90 Days" },
//   { value: "365d", label: "Last 1 Year" },
//   { value: "all", label: "All Time" }
// ];

// const CHART_COLORS = {
//   indigo: {
//     light: "bg-indigo-500",
//     dark: "bg-indigo-600",
//     text: "text-indigo-600 dark:text-indigo-400"
//   },
//   blue: {
//     light: "bg-blue-500",
//     dark: "bg-blue-600",
//     text: "text-blue-600 dark:text-blue-400"
//   },
//   green: {
//     light: "bg-green-500",
//     dark: "bg-green-600",
//     text: "text-green-600 dark:text-green-400"
//   },
//   purple: {
//     light: "bg-purple-500",
//     dark: "bg-purple-600",
//     text: "text-purple-600 dark:text-purple-400"
//   },
//   orange: {
//     light: "bg-orange-500",
//     dark: "bg-orange-600",
//     text: "text-orange-600 dark:text-orange-400"
//   },
//   red: {
//     light: "bg-red-500",
//     dark: "bg-red-600",
//     text: "text-red-600 dark:text-red-400"
//   },
//   amber: {
//     light: "bg-amber-500",
//     dark: "bg-amber-600",
//     text: "text-amber-600 dark:text-amber-400"
//   }
// };

// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================

// /**
//  * Detect access type from plan
//  */
// const detectAccessType = (plan) => {
//   if (!plan) return null;
  
//   if (plan.accessType) return plan.accessType;
  
//   const hotspot = plan.access_methods?.hotspot?.enabled;
//   const pppoe = plan.access_methods?.pppoe?.enabled;
  
//   if (hotspot && pppoe) return 'both';
//   if (hotspot) return 'hotspot';
//   if (pppoe) return 'pppoe';
  
//   return null;
// };

// /**
//  * Calculate rating from purchases
//  */
// const calculateRating = (purchases) => {
//   if (purchases >= 1000) return 4.9;
//   if (purchases >= 500) return 4.7;
//   if (purchases >= 250) return 4.5;
//   if (purchases >= 100) return 4.2;
//   if (purchases >= 50) return 4.0;
//   if (purchases >= 25) return 3.8;
//   if (purchases >= 10) return 3.5;
//   if (purchases >= 5) return 3.2;
//   if (purchases >= 1) return 3.0;
//   return 0;
// };

// /**
//  * Calculate trend percentage
//  */
// const calculateTrend = (current, previous) => {
//   if (previous === 0) return current > 0 ? 100 : 0;
//   return ((current - previous) / previous) * 100;
// };

// /**
//  * Calculate plan statistics
//  */
// const calculatePlanStatistics = (plans, analyticsType, timeRange) => {
//   const filteredPlans = analyticsType 
//     ? plans.filter(plan => detectAccessType(plan) === analyticsType)
//     : plans;

//   // Filter by time range
//   let timeFilteredPlans = filteredPlans;
//   if (timeRange !== 'all') {
//     const now = new Date();
//     const cutoff = new Date();
    
//     switch(timeRange) {
//       case '7d':
//         cutoff.setDate(now.getDate() - 7);
//         break;
//       case '30d':
//         cutoff.setMonth(now.getMonth() - 1);
//         break;
//       case '90d':
//         cutoff.setMonth(now.getMonth() - 3);
//         break;
//       case '365d':
//         cutoff.setFullYear(now.getFullYear() - 1);
//         break;
//       default:
//         cutoff.setFullYear(now.getFullYear() - 1);
//     }
    
//     timeFilteredPlans = filteredPlans.filter(plan => {
//       const createdDate = new Date(plan.created_at);
//       return createdDate >= cutoff;
//     });
//   }

//   // Basic stats
//   const totalPlans = timeFilteredPlans.length;
//   const activePlans = timeFilteredPlans.filter(p => p.active).length;
//   const inactivePlans = totalPlans - activePlans;
//   const totalPurchases = timeFilteredPlans.reduce((sum, p) => sum + (p.purchases || 0), 0);
//   const totalRevenue = timeFilteredPlans.reduce((sum, p) => 
//     sum + ((p.purchases || 0) * (parseFloat(p.price) || 0)), 0
//   );

//   // Average price
//   const paidPlans = timeFilteredPlans.filter(p => p.plan_type === 'paid');
//   const avgPrice = paidPlans.length > 0
//     ? paidPlans.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / paidPlans.length
//     : 0;

//   // Category distribution
//   const categoryDistribution = timeFilteredPlans.reduce((acc, p) => {
//     const cat = p.category || 'uncategorized';
//     if (!acc[cat]) {
//       acc[cat] = { count: 0, purchases: 0, revenue: 0 };
//     }
//     acc[cat].count++;
//     acc[cat].purchases += p.purchases || 0;
//     acc[cat].revenue += (p.purchases || 0) * (parseFloat(p.price) || 0);
//     return acc;
//   }, {});

//   // Access type distribution
//   const accessTypeDistribution = {
//     hotspot: timeFilteredPlans.filter(p => detectAccessType(p) === 'hotspot').length,
//     pppoe: timeFilteredPlans.filter(p => detectAccessType(p) === 'pppoe').length,
//     dual: timeFilteredPlans.filter(p => detectAccessType(p) === 'both').length
//   };

//   // Plan type distribution
//   const planTypeDistribution = {
//     paid: timeFilteredPlans.filter(p => p.plan_type === 'paid').length,
//     free_trial: timeFilteredPlans.filter(p => p.plan_type === 'free_trial').length,
//     promotional: timeFilteredPlans.filter(p => p.plan_type === 'promotional').length
//   };

//   // Time variant stats
//   const timeVariantStats = {
//     withTimeVariant: timeFilteredPlans.filter(p => p.time_variant?.is_active).length,
//     withoutTimeVariant: timeFilteredPlans.filter(p => !p.time_variant?.is_active).length,
//     currentlyAvailable: timeFilteredPlans.filter(p => p.is_available_now).length
//   };

//   // Price statistics
//   const prices = timeFilteredPlans
//     .filter(p => p.plan_type === 'paid')
//     .map(p => parseFloat(p.price) || 0);
  
//   const priceStats = {
//     min: prices.length > 0 ? Math.min(...prices) : 0,
//     max: prices.length > 0 ? Math.max(...prices) : 0,
//     avg: avgPrice,
//     median: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0
//   };

//   // Top performing plans
//   const topPlans = [...timeFilteredPlans]
//     .filter(p => p.purchases > 0)
//     .sort((a, b) => (b.purchases || 0) - (a.purchases || 0))
//     .slice(0, 10)
//     .map(plan => ({
//       ...plan,
//       rating: calculateRating(plan.purchases),
//       revenue: (plan.purchases || 0) * (parseFloat(plan.price) || 0),
//       marketShare: totalPurchases > 0 ? ((plan.purchases || 0) / totalPurchases) * 100 : 0
//     }));

//   // Growth metrics (simulated for demo - in production would use historical data)
//   const growth = {
//     plans: calculateTrend(totalPlans, totalPlans * 0.9),
//     purchases: calculateTrend(totalPurchases, totalPurchases * 0.85),
//     revenue: calculateTrend(totalRevenue, totalRevenue * 0.88)
//   };

//   return {
//     totalPlans,
//     activePlans,
//     inactivePlans,
//     totalPurchases,
//     totalRevenue,
//     avgPrice,
//     filteredCount: timeFilteredPlans.length,
//     categoryDistribution,
//     accessTypeDistribution,
//     planTypeDistribution,
//     timeVariantStats,
//     priceStats,
//     topPlans,
//     growth
//   };
// };

// // ============================================================================
// // STAT CARD COMPONENT
// // ============================================================================
// const StatCard = ({ title, value, icon: Icon, color, theme, trend, suffix = '' }) => {
//   const themeClasses = getThemeClasses(theme);
//   const colorClasses = CHART_COLORS[color] || CHART_COLORS.indigo;

//   return (
//     <div className={`p-4 sm:p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex items-start justify-between mb-2">
//         <div>
//           <p className={`text-sm ${themeClasses.text.secondary}`}>{title}</p>
//           <h3 className="text-xl sm:text-2xl font-bold mt-1 text-gray-900 dark:text-white">
//             {value}{suffix}
//           </h3>
//         </div>
//         <div className={`p-2 rounded-lg ${colorClasses.light} dark:${colorClasses.dark} bg-opacity-20`}>
//           <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.text}`} />
//         </div>
//       </div>
      
//       {trend !== undefined && (
//         <div className="flex items-center mt-3">
//           {trend > 0 ? (
//             <>
//               <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
//               <span className="text-sm text-green-600">+{trend.toFixed(1)}%</span>
//             </>
//           ) : trend < 0 ? (
//             <>
//               <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
//               <span className="text-sm text-red-600">{trend.toFixed(1)}%</span>
//             </>
//           ) : (
//             <>
//               <Minus className="w-4 h-4 text-gray-500 mr-1" />
//               <span className="text-sm text-gray-500">0%</span>
//             </>
//           )}
//           <span className="text-xs text-gray-500 ml-2">vs last period</span>
//         </div>
//       )}
//     </div>
//   );
// };

// // ============================================================================
// // PROGRESS BAR COMPONENT
// // ============================================================================
// const ProgressBar = ({ percentage, color = "indigo", theme, label, value, total }) => {
//   const colorClasses = CHART_COLORS[color] || CHART_COLORS.indigo;
  
//   return (
//     <div className="mt-2" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
//       <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
//         <span>{label}</span>
//         <span>{value} / {total}</span>
//       </div>
//       <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//         <div 
//           className={`${colorClasses.light} dark:${colorClasses.dark} h-2 rounded-full transition-all duration-500`}
//           style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
//         />
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // DISTRIBUTION CHART COMPONENT
// // ============================================================================
// const DistributionChart = ({ data, title, icon: Icon, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const total = Object.values(data).reduce((sum, val) => sum + val, 0);

//   const colors = ['indigo', 'blue', 'green', 'purple', 'orange', 'red', 'amber'];

//   return (
//     <div className={`p-4 sm:p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         {Icon && <Icon className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />}
//         {title}
//       </h3>
      
//       <div className="space-y-3">
//         {Object.entries(data).map(([key, value], index) => {
//           const percentage = total > 0 ? (value / total) * 100 : 0;
//           const color = colors[index % colors.length];
          
//           return (
//             <div key={key}>
//               <div className="flex justify-between items-center mb-1">
//                 <span className="text-sm font-medium capitalize">
//                   {key.replace('_', ' ')}
//                 </span>
//                 <span className="text-sm text-gray-600 dark:text-gray-400">
//                   {value} ({percentage.toFixed(1)}%)
//                 </span>
//               </div>
//               <ProgressBar
//                 percentage={percentage}
//                 color={color}
//                 theme={theme}
//                 value={value}
//                 total={total}
//               />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // TOP PLANS TABLE COMPONENT
// // ============================================================================
// const TopPlansTable = ({ plans, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   if (!plans || plans.length === 0) {
//     return (
//       <div className={`p-6 text-center rounded-xl ${themeClasses.bg.card}`}>
//         <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//         <p className={themeClasses.text.secondary}>No plan performance data available</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`p-4 sm:p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         <Award className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
//         Top Performing Plans
//       </h3>
      
//       <div className="space-y-3">
//         {plans.map((plan, index) => {
//           const accessType = detectAccessType(plan);
//           const rating = calculateRating(plan.purchases);
          
//           return (
//             <div key={plan.id} className={`p-3 rounded-lg border ${
//               theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3 sm:space-x-4">
//                   <div className="flex items-center justify-center w-7 h-7 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
//                     <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
//                       #{index + 1}
//                     </span>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-semibold text-gray-900 dark:text-white truncate">
//                       {plan.name}
//                     </h4>
//                     <div className="flex flex-wrap gap-1 mt-1">
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
//                       }`}>
//                         {plan.category}
//                       </span>
//                       <span className={`text-xs px-2 py-1 rounded-full ${
//                         plan.plan_type === 'free_trial'
//                           ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
//                           : plan.plan_type === 'promotional'
//                             ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
//                             : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
//                       }`}>
//                         {plan.plan_type}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="text-right">
//                   <p className="font-semibold text-gray-900 dark:text-white">
//                     {formatNumber(plan.purchases || 0)}
//                   </p>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">
//                     purchases
//                   </p>
//                 </div>
//               </div>
              
//               <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
//                 <div>
//                   <span className="text-gray-500">Rating:</span>{' '}
//                   <span className="font-medium text-amber-600">{rating.toFixed(1)} ★</span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Revenue:</span>{' '}
//                   <span className="font-medium text-green-600">KES {formatNumber(plan.revenue.toFixed(2))}</span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Market Share:</span>{' '}
//                   <span className="font-medium text-purple-600">{plan.marketShare.toFixed(1)}%</span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Price:</span>{' '}
//                   <span className="font-medium">KES {formatNumber(plan.price)}</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // TIME VARIANT STATS COMPONENT
// // ============================================================================
// const TimeVariantStats = ({ stats, theme }) => {
//   const themeClasses = getThemeClasses(theme);
//   const total = stats.withTimeVariant + stats.withoutTimeVariant;
  
//   if (total === 0) return null;

//   const getPercentage = (value) => ((value / total) * 100).toFixed(1);

//   return (
//     <div className={`p-4 sm:p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         <Clock className="w-5 h-5 mr-3 text-orange-600 dark:text-orange-400" />
//         Time Availability Analytics
//       </h3>
      
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
//           <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
//             {stats.withTimeVariant}
//           </div>
//           <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Time Restricted</div>
//           <div className="text-xs text-blue-500 mt-1">{getPercentage(stats.withTimeVariant)}%</div>
//         </div>
        
//         <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
//           <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
//             {stats.withoutTimeVariant}
//           </div>
//           <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Always Available</div>
//           <div className="text-xs text-green-500 mt-1">{getPercentage(stats.withoutTimeVariant)}%</div>
//         </div>
        
//         <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
//           <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
//             {stats.currentlyAvailable}
//           </div>
//           <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Available Now</div>
//           <div className="text-xs text-purple-500 mt-1">
//             {total > 0 ? ((stats.currentlyAvailable / total) * 100).toFixed(1) : 0}%
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // PRICE STATISTICS COMPONENT
// // ============================================================================
// const PriceStatistics = ({ stats, theme }) => {
//   const themeClasses = getThemeClasses(theme);

//   return (
//     <div className={`p-4 sm:p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
//         <DollarSign className="w-5 h-5 mr-3 text-green-600 dark:text-green-400" />
//         Price Statistics
//       </h3>
      
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//         <div className="text-center">
//           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//             KES {formatNumber(stats.min)}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">Minimum</div>
//         </div>
        
//         <div className="text-center">
//           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//             KES {formatNumber(stats.avg)}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
//         </div>
        
//         <div className="text-center">
//           <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//             KES {formatNumber(stats.median)}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">Median</div>
//         </div>
        
//         <div className="text-center">
//           <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
//             KES {formatNumber(stats.max)}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400">Maximum</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // MAIN PLANANALYTICS COMPONENT
// // ============================================================================
// const PlanAnalytics = ({ 
//   plans, 
//   onBack, 
//   analyticsType, 
//   theme,
//   onExport,
//   onRefresh 
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [timeRange, setTimeRange] = useState("30d");
//   const [isRefreshing, setIsRefreshing] = useState(false);
  
//   // Calculate statistics
//   const stats = useMemo(() => {
//     return calculatePlanStatistics(plans, analyticsType, timeRange);
//   }, [plans, analyticsType, timeRange]);
  
//   // Get analytics type info
//   const getAnalyticsTypeInfo = () => {
//     switch (analyticsType) {
//       case 'hotspot':
//         return {
//           name: 'Hotspot Analytics',
//           icon: Wifi,
//           color: 'blue',
//           gradient: 'from-blue-500 to-cyan-500',
//           description: 'Comprehensive analytics for wireless hotspot plans'
//         };
//       case 'pppoe':
//         return {
//           name: 'PPPoE Analytics',
//           icon: Cable,
//           color: 'green',
//           gradient: 'from-green-500 to-emerald-500',
//           description: 'Detailed insights for wired PPPoE connections'
//         };
//       default:
//         return {
//           name: 'All Plan Analytics',
//           icon: BarChart3,
//           color: 'indigo',
//           gradient: 'from-indigo-500 to-purple-500',
//           description: 'Track plan performance across all access types'
//         };
//     }
//   };

//   const analyticsTypeInfo = getAnalyticsTypeInfo();
//   const AnalyticsTypeIcon = analyticsTypeInfo.icon;

//   // Handle refresh
//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     try {
//       if (onRefresh) {
//         await onRefresh();
//       }
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   // Handle export
//   const handleExport = () => {
//     if (onExport) {
//       const exportPayload = {
//         analyticsType,
//         timeRange,
//         stats,
//         timestamp: new Date().toISOString(),
//         generatedBy: 'PlanAnalytics'
//       };
//       onExport(exportPayload);
//     }
//   };

//   return (
//     <div className={`min-h-screen p-3 sm:p-6 lg:p-8 transition-colors duration-300 ${themeClasses.bg.primary}`}>
//       <main className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center space-x-3 sm:space-x-4 mb-2">
//               <div className={`p-3 rounded-xl bg-gradient-to-r ${analyticsTypeInfo.gradient}`}>
//                 <AnalyticsTypeIcon className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
//                   {analyticsTypeInfo.name}
//                 </h1>
//                 <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${themeClasses.text.secondary}`}>
//                   {analyticsTypeInfo.description}
//                 </p>
//               </div>
//             </div>
            
//             <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//               analyticsTypeInfo.color === 'blue' 
//                 ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-700'
//                 : analyticsTypeInfo.color === 'green'
//                 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border border-green-200 dark:border-green-700'
//                 : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-700'
//             }`}>
//               <Check className="w-3 h-3 mr-1" />
//               {analyticsTypeInfo.name}
//             </div>
//           </div>
          
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="w-full sm:w-48">
//               <EnhancedSelect
//                 value={timeRange}
//                 onChange={setTimeRange}
//                 options={TIME_RANGE_OPTIONS}
//                 theme={theme}
//               />
//             </div>
            
//             <div className="flex gap-2">
//               <button
//                 onClick={handleRefresh}
//                 disabled={isRefreshing}
//                 className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
//               >
//                 <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//               <button
//                 onClick={handleExport}
//                 className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.primary}`}
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Export
//               </button>
//               <button
//                 onClick={onBack}
//                 className={`px-3 py-2 rounded-lg text-sm flex items-center ${themeClasses.button.secondary}`}
//               >
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 Back
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Key Statistics */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//           <StatCard
//             title="Total Plans"
//             value={stats.totalPlans}
//             icon={Package}
//             color="indigo"
//             theme={theme}
//             trend={stats.growth.plans}
//           />
//           <StatCard
//             title="Total Purchases"
//             value={formatNumber(stats.totalPurchases)}
//             icon={Users}
//             color="green"
//             theme={theme}
//             trend={stats.growth.purchases}
//           />
//           <StatCard
//             title="Total Revenue"
//             value={`KES ${formatNumber(stats.totalRevenue.toFixed(2))}`}
//             icon={DollarSign}
//             color="purple"
//             theme={theme}
//             trend={stats.growth.revenue}
//           />
//           <StatCard
//             title="Avg Price"
//             value={`KES ${formatNumber(stats.avgPrice.toFixed(2))}`}
//             icon={Zap}
//             color="blue"
//             theme={theme}
//           />
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//           {/* Left Column */}
//           <div className="space-y-4 sm:space-y-6">
//             <DistributionChart
//               data={stats.accessTypeDistribution}
//               title="Access Type Distribution"
//               icon={Wifi}
//               theme={theme}
//             />
//             <DistributionChart
//               data={stats.planTypeDistribution}
//               title="Plan Type Distribution"
//               icon={Layers}
//               theme={theme}
//             />
//           </div>
          
//           {/* Right Column */}
//           <div className="space-y-4 sm:space-y-6">
//             <DistributionChart
//               data={stats.categoryDistribution}
//               title="Category Distribution"
//               icon={Tag}
//               theme={theme}
//             />
//             <TimeVariantStats stats={stats.timeVariantStats} theme={theme} />
//           </div>
//         </div>

//         {/* Price Statistics */}
//         <PriceStatistics stats={stats.priceStats} theme={theme} />

//         {/* Top Plans */}
//         <TopPlansTable plans={stats.topPlans} theme={theme} />

//         {/* Summary Footer */}
//         <div className={`p-4 sm:p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <div>
//               <p className={themeClasses.text.secondary}>
//                 Analysis Period: <span className="font-semibold">
//                   {TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}
//                 </span>
//               </p>
//               <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
//                 Plans Analyzed: <span className="font-semibold">{stats.filteredCount}</span>
//                 {stats.filteredCount !== plans.length && (
//                   <span className="text-xs text-gray-500 ml-2">
//                     (filtered from {plans.length} total)
//                   </span>
//                 )}
//               </p>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <Circle className="w-3 h-3 fill-green-500 text-green-500" />
//                 <span className="text-xs text-gray-600 dark:text-gray-400">
//                   Active: {stats.activePlans}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Circle className="w-3 h-3 fill-red-500 text-red-500" />
//                 <span className="text-xs text-gray-600 dark:text-gray-400">
//                   Inactive: {stats.inactivePlans}
//                 </span>
//               </div>
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 Generated: {formatDate(new Date().toISOString(), true)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default PlanAnalytics;









// ============================================================================
// PlanAnalytics.js - FIXED VERSION
// ============================================================================

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, TrendingUp, Award,
  Calendar, Download, Eye, PieChart, Activity, Box,
  Wifi, Cable, ArrowLeft, Check, Clock, RefreshCw,
  FileText, Layers, Target, AlertTriangle, Filter,
  TrendingDown, Globe, Shield, Package, Zap, Database,
  DollarSign, Percent, Star, Crown, Sparkles, Gift,
  Smartphone, Gauge, Server, ArrowUp, ArrowDown,
  Minus, Circle, CheckCircle, XCircle, Tag, Hash
} from "lucide-react";
import { EnhancedSelect, getThemeClasses } from "../Shared/components";
import { formatNumber, formatCurrency, formatDate } from "../Shared/formatters";

// ============================================================================
// CONSTANTS
// ============================================================================
const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "365d", label: "Last 1 Year" },
  { value: "all", label: "All Time" }
];

const CHART_COLORS = {
  indigo: { light: "bg-indigo-500", dark: "bg-indigo-600", text: "text-indigo-600 dark:text-indigo-400" },
  blue: { light: "bg-blue-500", dark: "bg-blue-600", text: "text-blue-600 dark:text-blue-400" },
  green: { light: "bg-green-500", dark: "bg-green-600", text: "text-green-600 dark:text-green-400" },
  purple: { light: "bg-purple-500", dark: "bg-purple-600", text: "text-purple-600 dark:text-purple-400" },
  orange: { light: "bg-orange-500", dark: "bg-orange-600", text: "text-orange-600 dark:text-orange-400" },
  red: { light: "bg-red-500", dark: "bg-red-600", text: "text-red-600 dark:text-red-400" },
  amber: { light: "bg-amber-500", dark: "bg-amber-600", text: "text-amber-600 dark:text-amber-400" },
  teal: { light: "bg-teal-500", dark: "bg-teal-600", text: "text-teal-600 dark:text-teal-400" },
  cyan: { light: "bg-cyan-500", dark: "bg-cyan-600", text: "text-cyan-600 dark:text-cyan-400" },
  fuchsia: { light: "bg-fuchsia-500", dark: "bg-fuchsia-600", text: "text-fuchsia-600 dark:text-fuchsia-400" }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect access type from plan
 */
const detectAccessType = (plan) => {
  if (!plan) return null;
  
  if (plan.accessType) return plan.accessType;
  
  const accessMethods = plan.access_methods || plan.accessMethods || {};
  const hotspot = accessMethods?.hotspot?.enabled;
  const pppoe = accessMethods?.pppoe?.enabled;
  
  if (hotspot && pppoe) return 'both';
  if (hotspot) return 'hotspot';
  if (pppoe) return 'pppoe';
  
  return null;
};

/**
 * Calculate rating from purchases
 */
const calculateRating = (purchases) => {
  if (purchases >= 1000) return 4.9;
  if (purchases >= 500) return 4.7;
  if (purchases >= 250) return 4.5;
  if (purchases >= 100) return 4.2;
  if (purchases >= 50) return 4.0;
  if (purchases >= 25) return 3.8;
  if (purchases >= 10) return 3.5;
  if (purchases >= 5) return 3.2;
  if (purchases >= 1) return 3.0;
  return 0;
};

/**
 * Calculate trend percentage
 */
const calculateTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate plan statistics - FIXED: Properly handle nested objects
 */
const calculatePlanStatistics = (plans, analyticsType, timeRange) => {
  const safePlans = Array.isArray(plans) ? plans : [];
  
  const filteredPlans = analyticsType 
    ? safePlans.filter(plan => detectAccessType(plan) === analyticsType)
    : safePlans;

  // Filter by time range
  let timeFilteredPlans = filteredPlans;
  if (timeRange !== 'all') {
    const now = new Date();
    const cutoff = new Date();
    
    switch(timeRange) {
      case '7d': cutoff.setDate(now.getDate() - 7); break;
      case '30d': cutoff.setMonth(now.getMonth() - 1); break;
      case '90d': cutoff.setMonth(now.getMonth() - 3); break;
      case '365d': cutoff.setFullYear(now.getFullYear() - 1); break;
      default: cutoff.setFullYear(now.getFullYear() - 1);
    }
    
    timeFilteredPlans = filteredPlans.filter(plan => {
      const createdDate = plan.created_at ? new Date(plan.created_at) : new Date();
      return createdDate >= cutoff;
    });
  }

  // Basic stats
  const totalPlans = timeFilteredPlans.length;
  const activePlans = timeFilteredPlans.filter(p => p.active).length;
  const inactivePlans = totalPlans - activePlans;
  const totalPurchases = timeFilteredPlans.reduce((sum, p) => sum + (p.purchases || 0), 0);
  const totalRevenue = timeFilteredPlans.reduce((sum, p) => 
    sum + ((p.purchases || 0) * (parseFloat(p.price) || 0)), 0
  );

  // Average price
  const paidPlans = timeFilteredPlans.filter(p => p.plan_type === 'paid');
  const avgPrice = paidPlans.length > 0
    ? paidPlans.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / paidPlans.length
    : 0;

  // Category distribution - FIXED: Store just the count, not an object
  const categoryCounts = {};
  timeFilteredPlans.forEach(p => {
    const cat = p.category || 'uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Access type distribution
  const accessTypeDistribution = {
    hotspot: timeFilteredPlans.filter(p => detectAccessType(p) === 'hotspot').length,
    pppoe: timeFilteredPlans.filter(p => detectAccessType(p) === 'pppoe').length,
    both: timeFilteredPlans.filter(p => detectAccessType(p) === 'both').length
  };

  // Plan type distribution
  const planTypeDistribution = {
    paid: timeFilteredPlans.filter(p => p.plan_type === 'paid').length,
    free_trial: timeFilteredPlans.filter(p => p.plan_type === 'free_trial').length,
    promotional: timeFilteredPlans.filter(p => p.plan_type === 'promotional').length
  };

  // Time variant stats
  const timeVariantStats = {
    withTimeVariant: timeFilteredPlans.filter(p => p.time_variant?.is_active).length,
    withoutTimeVariant: timeFilteredPlans.filter(p => !p.time_variant?.is_active).length,
    currentlyAvailable: timeFilteredPlans.filter(p => p.is_available_now).length
  };

  // Price statistics
  const prices = timeFilteredPlans
    .filter(p => p.plan_type === 'paid')
    .map(p => parseFloat(p.price) || 0);
  
  const priceStats = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
    avg: avgPrice,
    median: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0
  };

  // Top performing plans
  const topPlans = [...timeFilteredPlans]
    .filter(p => p.purchases > 0)
    .sort((a, b) => (b.purchases || 0) - (a.purchases || 0))
    .slice(0, 10)
    .map(plan => ({
      ...plan,
      rating: calculateRating(plan.purchases),
      revenue: (plan.purchases || 0) * (parseFloat(plan.price) || 0),
      marketShare: totalPurchases > 0 ? ((plan.purchases || 0) / totalPurchases) * 100 : 0
    }));

  // Growth metrics
  const growth = {
    plans: calculateTrend(totalPlans, totalPlans * 0.9),
    purchases: calculateTrend(totalPurchases, totalPurchases * 0.85),
    revenue: calculateTrend(totalRevenue, totalRevenue * 0.88)
  };

  return {
    totalPlans,
    activePlans,
    inactivePlans,
    totalPurchases,
    totalRevenue,
    avgPrice,
    filteredCount: timeFilteredPlans.length,
    categoryCounts,  // ← Now this is just counts, not objects
    accessTypeDistribution,
    planTypeDistribution,
    timeVariantStats,
    priceStats,
    topPlans,
    growth
  };
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
const StatCard = ({ title, value, icon: Icon, color, theme, trend, suffix = '' }) => {
  const themeClasses = getThemeClasses(theme);
  const colorClasses = CHART_COLORS[color] || CHART_COLORS.indigo;

  return (
    <div className={`p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
            {value}{suffix}
          </h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses.light} dark:${colorClasses.dark} bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${colorClasses.text}`} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center mt-3">
          {trend > 0 ? (
            <>
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-600">+{trend.toFixed(1)}%</span>
            </>
          ) : trend < 0 ? (
            <>
              <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm font-medium text-red-600">{trend.toFixed(1)}%</span>
            </>
          ) : (
            <>
              <Minus className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium text-gray-500">0%</span>
            </>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last period</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================
const ProgressBar = ({ percentage, color = "indigo", theme, label, value, total }) => {
  const colorClasses = CHART_COLORS[color] || CHART_COLORS.indigo;
  
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span className="font-medium">{label}</span>
        <span>{value} / {total}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${colorClasses.light} dark:${colorClasses.dark} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// DISTRIBUTION CHART COMPONENT - FIXED: Handle simple number values
// ============================================================================
const DistributionChart = ({ data, title, icon: Icon, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  const colors = ['indigo', 'blue', 'green', 'purple', 'orange', 'red', 'amber', 'teal', 'cyan', 'fuchsia'];

  return (
    <div className={`p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        {Icon && <Icon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />}
        {title}
      </h3>
      
      <div className="space-y-3">
        {Object.entries(data).map(([key, value], index) => {
          // Ensure value is a number
          const numericValue = typeof value === 'object' ? value.count || 0 : value;
          const percentage = total > 0 ? (numericValue / total) * 100 : 0;
          const color = colors[index % colors.length];
          
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {numericValue} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <ProgressBar
                percentage={percentage}
                color={color}
                theme={theme}
                value={numericValue}
                total={total}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// TOP PLANS TABLE COMPONENT
// ============================================================================
const TopPlansTable = ({ plans, theme }) => {
  const themeClasses = getThemeClasses(theme);

  if (!plans || plans.length === 0) {
    return (
      <div className={`p-8 text-center rounded-xl ${themeClasses.bg.card}`}>
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className={themeClasses.text.secondary}>No plan performance data available</p>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Award className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
        Top Performing Plans
      </h3>
      
      <div className="space-y-3">
        {plans.map((plan, index) => (
          <div key={plan.id} className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {plan.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      plan.plan_type === 'free_trial'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300'
                        : plan.plan_type === 'promotional'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                    }`}>
                      {plan.plan_type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatNumber(plan.purchases || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">purchases</p>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Rating:</span>
                <span className="ml-1 font-medium text-amber-600">{plan.rating.toFixed(1)} ★</span>
              </div>
              <div>
                <span className="text-gray-500">Revenue:</span>
                <span className="ml-1 font-medium text-green-600">KES {formatNumber(plan.revenue.toFixed(0))}</span>
              </div>
              <div>
                <span className="text-gray-500">Share:</span>
                <span className="ml-1 font-medium text-purple-600">{plan.marketShare.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="ml-1 font-medium">KES {formatNumber(plan.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TIME VARIANT STATS COMPONENT
// ============================================================================
const TimeVariantStats = ({ stats, theme }) => {
  const themeClasses = getThemeClasses(theme);
  const total = stats.withTimeVariant + stats.withoutTimeVariant;
  
  if (total === 0) return null;

  const getPercentage = (value) => ((value / total) * 100).toFixed(1);

  return (
    <div className={`p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Clock className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
        Time Availability
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.withTimeVariant}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Time Restricted</div>
          <div className="text-xs text-blue-500 mt-0.5">{getPercentage(stats.withTimeVariant)}%</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.withoutTimeVariant}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Always Available</div>
          <div className="text-xs text-green-500 mt-0.5">{getPercentage(stats.withoutTimeVariant)}%</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.currentlyAvailable}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Available Now</div>
          <div className="text-xs text-purple-500 mt-0.5">
            {total > 0 ? ((stats.currentlyAvailable / total) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PRICE STATISTICS COMPONENT
// ============================================================================
const PriceStatistics = ({ stats, theme }) => {
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`p-5 rounded-xl shadow-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <DollarSign className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
        Price Statistics (KES)
      </h3>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatNumber(stats.min)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Minimum</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(Math.round(stats.avg))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Average</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatNumber(stats.median)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Median</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatNumber(stats.max)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Maximum</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PLANANALYTICS COMPONENT
// ============================================================================
const PlanAnalytics = ({ 
  plans = [],
  onBack, 
  analyticsType, 
  theme,
  onExport,
  onRefresh 
}) => {
  const themeClasses = getThemeClasses(theme);
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const stats = useMemo(() => {
    return calculatePlanStatistics(plans, analyticsType, timeRange);
  }, [plans, analyticsType, timeRange]);
  
  const getAnalyticsTypeInfo = () => {
    switch (analyticsType) {
      case 'hotspot':
        return {
          name: 'Hotspot Analytics',
          icon: Wifi,
          color: 'blue',
          gradient: 'from-blue-500 to-cyan-500',
          description: 'Wireless hotspot plan analytics'
        };
      case 'pppoe':
        return {
          name: 'PPPoE Analytics',
          icon: Cable,
          color: 'green',
          gradient: 'from-green-500 to-emerald-500',
          description: 'Wired PPPoE plan analytics'
        };
      default:
        return {
          name: 'All Plans Analytics',
          icon: BarChart3,
          color: 'indigo',
          gradient: 'from-indigo-500 to-purple-500',
          description: 'Comprehensive plan analytics'
        };
    }
  };

  const analyticsTypeInfo = getAnalyticsTypeInfo();
  const AnalyticsTypeIcon = analyticsTypeInfo.icon;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport({
        analyticsType,
        timeRange,
        stats,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${themeClasses.bg.primary}`}>
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${analyticsTypeInfo.gradient}`}>
                <AnalyticsTypeIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsTypeInfo.name}
              </h1>
            </div>
            <p className={themeClasses.text.secondary}>
              {analyticsTypeInfo.description}
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="w-40">
              <EnhancedSelect
                value={timeRange}
                onChange={setTimeRange}
                options={TIME_RANGE_OPTIONS}
                theme={theme}
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 py-2 rounded-lg text-sm ${themeClasses.button.secondary}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className={`px-3 py-2 rounded-lg text-sm ${themeClasses.button.primary}`}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              className={`px-3 py-2 rounded-lg text-sm ${themeClasses.button.secondary}`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Plans"
            value={stats.totalPlans}
            icon={Package}
            color="indigo"
            theme={theme}
            trend={stats.growth.plans}
          />
          <StatCard
            title="Total Purchases"
            value={formatNumber(stats.totalPurchases)}
            icon={Users}
            color="green"
            theme={theme}
            trend={stats.growth.purchases}
          />
          <StatCard
            title="Total Revenue"
            value={`KES ${formatNumber(Math.round(stats.totalRevenue))}`}
            icon={DollarSign}
            color="purple"
            theme={theme}
            trend={stats.growth.revenue}
          />
          <StatCard
            title="Avg Price"
            value={`KES ${formatNumber(Math.round(stats.avgPrice))}`}
            icon={Zap}
            color="blue"
            theme={theme}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistributionChart
            data={stats.accessTypeDistribution}
            title="Access Type Distribution"
            icon={Wifi}
            theme={theme}
          />
          <DistributionChart
            data={stats.planTypeDistribution}
            title="Plan Type Distribution"
            icon={Layers}
            theme={theme}
          />
          <DistributionChart
            data={stats.categoryCounts}  // ← Now using categoryCounts, not categoryDistribution
            title="Category Distribution"
            icon={Tag}
            theme={theme}
          />
          <TimeVariantStats stats={stats.timeVariantStats} theme={theme} />
        </div>

        {/* Price Stats */}
        <PriceStatistics stats={stats.priceStats} theme={theme} />

        {/* Top Plans */}
        <TopPlansTable plans={stats.topPlans} theme={theme} />

        {/* Footer */}
        <div className={`p-4 rounded-xl ${themeClasses.bg.card}`}>
          <div className="flex justify-between items-center text-sm">
            <div className={themeClasses.text.secondary}>
              Period: {TIME_RANGE_OPTIONS.find(opt => opt.value === timeRange)?.label}
              {stats.filteredCount !== plans.length && (
                <span className="ml-2 text-xs">
                  (filtered from {plans.length} total)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Active: {stats.activePlans}</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Inactive: {stats.inactivePlans}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlanAnalytics;