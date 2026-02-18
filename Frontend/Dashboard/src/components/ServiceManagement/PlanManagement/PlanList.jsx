

// import React, { useState, useMemo, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Eye, Users, Search,
//   Wifi, Cable, BarChart3, Package, Box, Filter,
//   ChevronDown, ChevronUp, Clock, DollarSign, Calendar,
//   CheckCircle, XCircle, AlertTriangle, Settings,
//   Star, Target, TrendingUp, Zap, Shield, Download,
//   TrendingDown, Activity, Award, Flame, Crown, Sparkles,
//   Heart, ThumbsUp, Gauge, Server, RefreshCw, X,
//   Menu, Grid, LayoutGrid, List, Info, Tag, Layers,
//   ChevronLeft, ChevronRight, Maximize2, Minimize2, CreditCard,
//   Gift, BadgePercent
// } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";
// import { formatCurrency, formatNumber } from "../Shared/formatters";

// // ============================================================================
// // Plan Type Badge – FIXED: Correctly displays based on plan_type from constants
// // ============================================================================
// const PlanTypeBadge = ({ type, theme, size = 'sm' }) => {
//   // Match exact values from constant.js: "Free_trial", "Paid", "Promotional"
//   const config = {
//     Paid: {
//       label: 'Paid',
//       bg: 'bg-green-100 dark:bg-green-900/30',
//       text: 'text-green-700 dark:text-green-400',
//       border: 'border-green-200 dark:border-green-800',
//       icon: DollarSign
//     },
//     Free_trial: {
//       label: 'Free Trial',
//       bg: 'bg-blue-100 dark:bg-blue-900/30',
//       text: 'text-blue-700 dark:text-blue-400',
//       border: 'border-blue-200 dark:border-blue-800',
//       icon: Clock
//     },
//     Promotional: {
//       label: 'Promotional',
//       bg: 'bg-purple-100 dark:bg-purple-900/30',
//       text: 'text-purple-700 dark:text-purple-400',
//       border: 'border-purple-200 dark:border-purple-800',
//       icon: Sparkles
//     }
//   };

//   // Use the type directly - no normalization needed if it matches constants
//   const configKey = type || 'Paid';
//   const { label, bg, text, border, icon: Icon } = config[configKey] || config.Paid;

//   const sizeClasses = {
//     xs: 'px-1.5 py-0.5 text-[10px]',
//     sm: 'px-2 py-1 text-xs',
//     md: 'px-2.5 py-1.5 text-sm'
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1 rounded-full border font-medium
//       ${bg} ${text} ${border}
//       ${sizeClasses[size]}
//     `}>
//       <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
//       {label}
//     </span>
//   );
// };

// // ============================================================================
// // Access Type Badge – FIXED: Reads from access_methods object with fallbacks
// // ============================================================================
// const AccessTypeBadge = ({ accessMethods = {}, size = 'sm', showLabel = true }) => {
//   // Ensure accessMethods has the expected structure with fallbacks
//   const hotspot = accessMethods?.hotspot || { enabled: false };
//   const pppoe = accessMethods?.pppoe || { enabled: false };
  
//   // Check if methods are enabled
//   const hasHotspot = hotspot.enabled === true;
//   const hasPPPoE = pppoe.enabled === true;

//   let config;

//   if (hasHotspot && hasPPPoE) {
//     config = {
//       icon: () => (
//         <div className="flex items-center">
//           <Wifi className="w-3 h-3 mr-0.5" />
//           <Cable className="w-3 h-3" />
//         </div>
//       ),
//       label: "Dual Access",
//       color: "text-purple-600",
//       bg: "bg-purple-100 dark:bg-purple-900/30",
//       border: "border-purple-200 dark:border-purple-800"
//     };
//   } else if (hasHotspot) {
//     config = {
//       icon: Wifi,
//       label: "Hotspot Only",
//       color: "text-blue-600",
//       bg: "bg-blue-100 dark:bg-blue-900/30",
//       border: "border-blue-200 dark:border-blue-800"
//     };
//   } else if (hasPPPoE) {
//     config = {
//       icon: Cable,
//       label: "PPPoE Only",
//       color: "text-green-600",
//       bg: "bg-green-100 dark:bg-green-900/30",
//       border: "border-green-200 dark:border-green-800"
//     };
//   } else {
//     config = {
//       icon: Wifi,
//       label: "No Access",
//       color: "text-gray-600",
//       bg: "bg-gray-100 dark:bg-gray-800",
//       border: "border-gray-200 dark:border-gray-700"
//     };
//   }

//   const { icon: Icon, label, color, bg, border } = config;

//   const sizeClasses = {
//     xs: "px-1.5 py-0.5 text-xs",
//     sm: "px-2 py-1 text-xs",
//     md: "px-2.5 py-1.5 text-sm"
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1.5 rounded-full font-medium
//       ${bg} ${color} ${border} border
//       ${sizeClasses[size]}
//     `}>
//       <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
//       {showLabel && label}
//     </span>
//   );
// };

// // ============================================================================
// // Availability Badge
// // ============================================================================
// const AvailabilityBadge = ({ isAvailable, theme, size = 'sm' }) => {
//   const sizeClasses = {
//     xs: 'px-1.5 py-0.5 text-[10px]',
//     sm: 'px-2 py-1 text-xs',
//     md: 'px-2.5 py-1.5 text-sm'
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1 rounded-full font-medium
//       ${isAvailable
//         ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800'
//         : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800'
//       }
//       ${sizeClasses[size]}
//     `}>
//       {isAvailable ? (
//         <CheckCircle className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
//       ) : (
//         <XCircle className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
//       )}
//       {isAvailable ? 'Available' : 'Unavailable'}
//     </span>
//   );
// };

// // ============================================================================
// // Star Rating Component
// // ============================================================================
// const StarRating = ({ rating, size = 'sm' }) => {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//   const sizeClasses = {
//     xs: "w-3 h-3",
//     sm: "w-4 h-4",
//     md: "w-5 h-5"
//   };

//   return (
//     <div className="flex items-center gap-1">
//       <div className="flex items-center">
//         {[...Array(fullStars)].map((_, i) => (
//           <Star
//             key={`full-${i}`}
//             className={`${sizeClasses[size]} fill-current text-amber-400`}
//           />
//         ))}
//         {hasHalfStar && (
//           <div className="relative">
//             <Star className={`${sizeClasses[size]} text-gray-300`} />
//             <div className="absolute inset-0 overflow-hidden w-1/2">
//               <Star className={`${sizeClasses[size]} fill-current text-amber-400`} />
//             </div>
//           </div>
//         )}
//         {[...Array(emptyStars)].map((_, i) => (
//           <Star
//             key={`empty-${i}`}
//             className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
//           />
//         ))}
//       </div>
//       <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
//         {rating.toFixed(1)}
//       </span>
//     </div>
//   );
// };

// // ============================================================================
// // Calculate Rating (based on purchases)
// // ============================================================================
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

// // ============================================================================
// // Price Display Helper – FIXED: Handles all plan types correctly
// // ============================================================================
// const getPriceDisplay = (plan) => {
//   const price = parseFloat(plan.price) || 0;
  
//   switch (plan.plan_type) {
//     case 'Free_trial':
//       return {
//         main: 'Free Trial',
//         badge: null,
//         className: 'text-blue-600 dark:text-blue-400 font-medium'
//       };
    
//     case 'Promotional':
//       if (price === 0) {
//         return {
//           main: 'Free',
//           badge: 'Promotional',
//           className: 'text-purple-600 dark:text-purple-400'
//         };
//       }
//       return {
//         main: `KES ${price.toFixed(2)}`,
//         badge: 'Promotional',
//         className: 'text-purple-600 dark:text-purple-400 font-bold'
//       };
    
//     case 'Paid':
//     default:
//       if (price === 0) {
//         return {
//           main: 'Free',
//           badge: null,
//           className: 'text-gray-600 dark:text-gray-400'
//         };
//       }
//       return {
//         main: `KES ${price.toFixed(2)}`,
//         badge: null,
//         className: 'text-gray-900 dark:text-white font-bold'
//       };
//   }
// };

// // ============================================================================
// // Plan Table Row – FIXED: All display issues resolved
// // ============================================================================
// const PlanTableRow = ({
//   plan,
//   theme,
//   onViewDetails,
//   onEditPlan,
//   onDeletePlan,
//   onDuplicatePlan,
//   onToggleStatus,
//   isSelected,
//   onSelect
// }) => {
//   const rating = calculateRating(plan.purchases);
//   const themeClasses = getThemeClasses(theme);
//   const priceDisplay = getPriceDisplay(plan);
  
//   // Use access_methods object from the plan with fallback
//   const accessMethods = plan.access_methods || { 
//     hotspot: { enabled: false }, 
//     pppoe: { enabled: false } 
//   };

//   return (
//     <tr className={`
//       group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
//       ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}
//     `}>
//       {/* Checkbox */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <input
//           type="checkbox"
//           checked={isSelected}
//           onChange={() => onSelect(plan.id)}
//           className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
//         />
//       </td>

//       {/* Plan Info - FIXED: Shows correct plan type from plan.plan_type */}
//       <td className="px-4 py-4">
//         <div className="flex items-start gap-3">
//           <div className={`
//             p-2 rounded-lg flex-shrink-0
//             ${accessMethods?.hotspot?.enabled && accessMethods?.pppoe?.enabled
//               ? 'bg-purple-100 dark:bg-purple-900/30'
//               : accessMethods?.hotspot?.enabled
//                 ? 'bg-blue-100 dark:bg-blue-900/30'
//                 : accessMethods?.pppoe?.enabled
//                   ? 'bg-green-100 dark:bg-green-900/30'
//                   : 'bg-gray-100 dark:bg-gray-800'
//             }
//           `}>
//             {accessMethods?.hotspot?.enabled && accessMethods?.pppoe?.enabled ? (
//               <div className="flex items-center gap-0.5">
//                 <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                 <Cable className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//               </div>
//             ) : accessMethods?.hotspot?.enabled ? (
//               <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//             ) : accessMethods?.pppoe?.enabled ? (
//               <Cable className="w-4 h-4 text-green-600 dark:text-green-400" />
//             ) : (
//               <AlertTriangle className="w-4 h-4 text-gray-400" />
//             )}
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="font-semibold text-gray-900 dark:text-white">
//                 {plan.name}
//               </span>
//               <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
//             </div>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 {plan.category || 'Uncategorized'}
//               </span>
//               <span className="text-gray-300 dark:text-gray-600">•</span>
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 ID: {plan.id?.slice(0, 8)}...
//               </span>
//             </div>
//           </div>
//         </div>
//       </td>

//       {/* Price - FIXED: Shows correct price based on plan type */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className={priceDisplay.className}>
//           {priceDisplay.main}
//         </div>
//         {priceDisplay.badge && (
//           <div className="text-xs mt-1 text-purple-600 dark:text-purple-400 flex items-center gap-1">
//             <BadgePercent className="w-3 h-3" />
//             {priceDisplay.badge}
//           </div>
//         )}
//       </td>

//       {/* Access Type - FIXED: Passes accessMethods object with fallback */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <AccessTypeBadge
//           accessMethods={accessMethods}
//           size="xs"
//           showLabel={true}
//         />
//       </td>

//       {/* Subscribers & Rating */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="flex items-center gap-2 mb-1">
//           <Users className="w-3.5 h-3.5 text-gray-500" />
//           <span className="text-sm font-medium text-gray-900 dark:text-white">
//             {formatNumber(plan.purchases || 0)}
//           </span>
//         </div>
//         <StarRating rating={rating} size="xs" />
//       </td>

//       {/* Status */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="space-y-1">
//           <AvailabilityBadge
//             isAvailable={plan.is_available_now || false}
//             theme={theme}
//             size="xs"
//           />
//           <span className={`
//             inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
//             ${plan.active
//               ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
//               : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
//             }
//           `}>
//             {plan.active ? 'Active' : 'Inactive'}
//           </span>
//           {plan.has_time_variant && (
//             <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
//               <Clock className="w-3 h-3" />
//               Time Restricted
//             </span>
//           )}
//         </div>
//       </td>

//       {/* Actions */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => onViewDetails(plan)}
//             className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             title="View Details"
//           >
//             <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
//           </button>
//           <button
//             onClick={() => onEditPlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
//             title="Edit Plan"
//           >
//             <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//           </button>
//           <button
//             onClick={() => onDuplicatePlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
//             title="Duplicate Plan"
//           >
//             <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
//           </button>
//           <button
//             onClick={() => onToggleStatus(plan)}
//             className={`
//               p-1.5 rounded-lg transition-colors
//               ${plan.active
//                 ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
//                 : 'hover:bg-green-100 dark:hover:bg-green-900/30'
//               }
//             `}
//             title={plan.active ? "Deactivate" : "Activate"}
//           >
//             {plan.active ? (
//               <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//             ) : (
//               <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
//             )}
//           </button>
//           <button
//             onClick={() => onDeletePlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
//             title="Delete Plan"
//           >
//             <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// };

// // ============================================================================
// // Filter Button Component
// // ============================================================================
// const FilterButton = ({ label, icon: Icon, active, onClick, color = 'indigo' }) => {
//   const colorClasses = {
//     indigo: {
//       active: 'bg-indigo-600 text-white border-indigo-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
//     },
//     blue: {
//       active: 'bg-blue-600 text-white border-blue-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
//     },
//     green: {
//       active: 'bg-green-600 text-white border-green-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
//     },
//     purple: {
//       active: 'bg-purple-600 text-white border-purple-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400'
//     },
//     amber: {
//       active: 'bg-amber-600 text-white border-amber-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
//     },
//     red: {
//       active: 'bg-red-600 text-white border-red-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400'
//     }
//   };

//   return (
//     <button
//       onClick={onClick}
//       className={`
//         px-3 py-1.5 rounded-lg text-xs font-medium transition-all
//         flex items-center gap-1.5 border-2
//         ${active ? colorClasses[color].active : colorClasses[color].inactive}
//       `}
//     >
//       {Icon && <Icon className="w-3.5 h-3.5" />}
//       {label}
//     </button>
//   );
// };

// // ============================================================================
// // MAIN PLANLIST COMPONENT – All issues fixed
// // ============================================================================
// const PlanList = ({
//   plans = [],
//   allPlans = [],
//   isLoading = false,
//   onEditPlan,
//   onViewDetails,
//   onDeletePlan,
//   onDuplicatePlan,
//   onToggleStatus,
//   onNewPlan,
//   onViewAnalytics,
//   onViewTemplates,
//   theme = 'light',
//   isMobile = false,
//   searchQuery = '',
//   onSearchChange,
//   filters = {
//     search: '',
//     category: 'all',
//     planType: 'all',
//     accessType: 'all',
//     availability: 'all',
//     active: 'all',
//     hasTimeVariant: 'all',
//     routerSpecific: 'all',
//     priceRange: null
//   },
//   onFilterChange,
//   onClearFilters,
//   sortConfig = { field: 'name', direction: 'asc' },
//   onSort
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedPlans, setSelectedPlans] = useState([]);
//   const [showBulkActions, setShowBulkActions] = useState(false);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const scrollPositionRef = useRef(0);

//   // ==========================================================================
//   // STATISTICS – FIXED: Uses plan.plan_type directly
//   // ==========================================================================
//   const stats = useMemo(() => {
//     const active = plans.filter(p => p.active).length;
//     const inactive = plans.filter(p => !p.active).length;
//     const available = plans.filter(p => p.is_available_now).length;
//     const totalSubscribers = plans.reduce((sum, p) => sum + (p.purchases || 0), 0);

//     const mostPopular = [...plans].sort((a, b) => (b.purchases || 0) - (a.purchases || 0))[0];

//     // Count by plan type – FIXED: Use plan.plan_type directly
//     const byPlanType = plans.reduce((acc, p) => {
//       const type = p.plan_type || 'Paid';
//       acc[type] = (acc[type] || 0) + 1;
//       return acc;
//     }, {});

//     return {
//       total: plans.length,
//       active,
//       inactive,
//       available,
//       totalSubscribers,
//       mostPopular,
//       byPlanType
//     };
//   }, [plans]);

//   // ==========================================================================
//   // FILTER HANDLERS – FIXED: Uses correct values from constants
//   // ==========================================================================
//   const handleQuickFilter = useCallback((type, value) => {
//     const newValue = filters[type] === value ? 'all' : value;
//     onFilterChange(type, newValue);
//   }, [filters, onFilterChange]);

//   const handleClearAllFilters = useCallback(() => {
//     onSearchChange('');
//     onClearFilters();
//   }, [onSearchChange, onClearFilters]);

//   // ==========================================================================
//   // BULK ACTIONS
//   // ==========================================================================
//   const togglePlanSelection = useCallback((id) => {
//     setSelectedPlans(prev =>
//       prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
//     );
//   }, []);

//   const toggleAllPlans = useCallback(() => {
//     setSelectedPlans(prev =>
//       prev.length === plans.length ? [] : plans.map(p => p.id)
//     );
//   }, [plans]);

//   const handleBulkAction = useCallback(async (action) => {
//     setShowBulkActions(false);

//     if (action === 'delete') {
//       if (!window.confirm(`Delete ${selectedPlans.length} selected plans? This cannot be undone.`)) {
//         return;
//       }
//     }

//     const batchSize = 5;
//     for (let i = 0; i < selectedPlans.length; i += batchSize) {
//       const batch = selectedPlans.slice(i, i + batchSize);
//       await Promise.allSettled(
//         batch.map(async (id) => {
//           const plan = plans.find(p => p.id === id);
//           if (!plan) return;

//           switch (action) {
//             case 'activate':
//               if (!plan.active) await onToggleStatus(plan);
//               break;
//             case 'deactivate':
//               if (plan.active) await onToggleStatus(plan);
//               break;
//             case 'duplicate':
//               await onDuplicatePlan(plan);
//               break;
//             case 'delete':
//               await onDeletePlan(plan);
//               break;
//             default:
//               break;
//           }
//         })
//       );
//     }

//     setSelectedPlans([]);
//   }, [selectedPlans, plans, onToggleStatus, onDuplicatePlan, onDeletePlan]);

//   // ==========================================================================
//   // RENDER STATS CARDS
//   // ==========================================================================
//   const renderStats = () => (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
//             <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</span>
//         </div>
//         <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//           {stats.total}
//         </div>
//         <div className="flex items-center gap-2 mt-1 text-xs">
//           <span className="text-green-600 dark:text-green-400">{stats.active} active</span>
//           <span className="text-gray-300 dark:text-gray-600">•</span>
//           <span className="text-red-600 dark:text-red-400">{stats.inactive} inactive</span>
//         </div>
//       </div>

//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
//             <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</span>
//         </div>
//         <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//           {formatNumber(stats.totalSubscribers)}
//         </div>
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           Across {stats.total} plans
//         </div>
//       </div>

//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
//             <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Now</span>
//         </div>
//         <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//           {stats.available}
//         </div>
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           {stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0}% of plans
//         </div>
//       </div>

//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
//             <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Popular</span>
//         </div>
//         <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
//           {stats.mostPopular?.name || 'N/A'}
//         </div>
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           {formatNumber(stats.mostPopular?.purchases || 0)} subscribers
//         </div>
//       </div>
//     </div>
//   );

//   // ==========================================================================
//   // RENDER FILTERS – FIXED: Uses correct plan type values
//   // ==========================================================================
//   const renderFilters = () => (
//     <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//       {/* Search Bar */}
//       <div className="relative mb-4">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search plans by name, category, or description..."
//           value={searchQuery}
//           onChange={(e) => onSearchChange(e.target.value)}
//           className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
//         />
//         {searchQuery && (
//           <button
//             onClick={() => onSearchChange('')}
//             className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//           >
//             <X className="w-5 h-5 text-gray-400" />
//           </button>
//         )}
//       </div>

//       {/* Quick Filters */}
//       <div className="flex flex-wrap items-center gap-2">
//         <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">
//           Quick Filters:
//         </span>

//         {/* All Plans – clears all filters */}
//         <FilterButton
//           label="All Plans"
//           icon={Package}
//           active={!searchQuery &&
//             filters.accessType === 'all' &&
//             filters.planType === 'all' &&
//             filters.availability === 'all' &&
//             filters.active === 'all' &&
//             filters.hasTimeVariant === 'all'}
//           onClick={handleClearAllFilters}
//           color="indigo"
//         />

//         {/* Hotspot Only */}
//         <FilterButton
//           label="Hotspot Only"
//           icon={Wifi}
//           active={filters.accessType === 'hotspot'}
//           onClick={() => handleQuickFilter('accessType', 'hotspot')}
//           color="blue"
//         />

//         {/* PPPoE Only */}
//         <FilterButton
//           label="PPPoE Only"
//           icon={Cable}
//           active={filters.accessType === 'pppoe'}
//           onClick={() => handleQuickFilter('accessType', 'pppoe')}
//           color="green"
//         />

//         {/* Dual Access */}
//         <FilterButton
//           label="Dual Access"
//           icon={() => (
//             <div className="flex">
//               <Wifi className="w-3.5 h-3.5 mr-0.5" />
//               <Cable className="w-3.5 h-3.5" />
//             </div>
//           )}
//           active={filters.accessType === 'both'}
//           onClick={() => handleQuickFilter('accessType', 'both')}
//           color="purple"
//         />

//         {/* Available */}
//         <FilterButton
//           label="Available"
//           icon={CheckCircle}
//           active={filters.availability === 'available'}
//           onClick={() => handleQuickFilter('availability', 'available')}
//           color="green"
//         />

//         {/* Unavailable */}
//         <FilterButton
//           label="Unavailable"
//           icon={XCircle}
//           active={filters.availability === 'unavailable'}
//           onClick={() => handleQuickFilter('availability', 'unavailable')}
//           color="red"
//         />

//         {/* Free Trials – FIXED: Uses correct value "Free_trial" */}
//         <FilterButton
//           label="Free Trials"
//           icon={Clock}
//           active={filters.planType === 'Free_trial'}
//           onClick={() => handleQuickFilter('planType', 'Free_trial')}
//           color="blue"
//         />

//         {/* Promotional – FIXED: Uses correct value "Promotional" */}
//         <FilterButton
//           label="Promotional"
//           icon={Sparkles}
//           active={filters.planType === 'Promotional'}
//           onClick={() => handleQuickFilter('planType', 'Promotional')}
//           color="purple"
//         />

//         {/* Paid – FIXED: Uses correct value "Paid" */}
//         <FilterButton
//           label="Paid"
//           icon={DollarSign}
//           active={filters.planType === 'Paid'}
//           onClick={() => handleQuickFilter('planType', 'Paid')}
//           color="green"
//         />

//         {/* Time Restricted */}
//         <FilterButton
//           label="Time Restricted"
//           icon={Clock}
//           active={filters.hasTimeVariant === 'yes'}
//           onClick={() => handleQuickFilter('hasTimeVariant', 'yes')}
//           color="amber"
//         />

//         {/* Active Only */}
//         <FilterButton
//           label="Active"
//           icon={CheckCircle}
//           active={filters.active === 'active'}
//           onClick={() => handleQuickFilter('active', 'active')}
//           color="green"
//         />

//         {/* Clear All Button – shown when any filter is active */}
//         {(searchQuery ||
//           filters.accessType !== 'all' ||
//           filters.planType !== 'all' ||
//           filters.availability !== 'all' ||
//           filters.active !== 'all' ||
//           filters.hasTimeVariant !== 'all') && (
//           <button
//             onClick={handleClearAllFilters}
//             className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-1.5 ml-auto"
//           >
//             <X className="w-3.5 h-3.5" />
//             Clear All
//           </button>
//         )}
//       </div>

//       {/* Filter Summary */}
//       {(searchQuery ||
//         filters.accessType !== 'all' ||
//         filters.planType !== 'all' ||
//         filters.availability !== 'all' ||
//         filters.active !== 'all' ||
//         filters.hasTimeVariant !== 'all') && (
//         <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             Showing {plans.length} of {allPlans.length} plans
//           </p>
//         </div>
//       )}
//     </div>
//   );

//   // ==========================================================================
//   // MAIN RENDER
//   // ==========================================================================
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" />
//               </div>
//             </div>
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your plans...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Internet Plans
//             </h1>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//               Create, manage, and analyze your internet service plans
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={onViewAnalytics}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2 text-sm"
//             >
//               <BarChart3 className="w-4 h-4" />
//               Analytics
//             </button>

//             <button
//               onClick={onViewTemplates}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 text-sm"
//             >
//               <Box className="w-4 h-4" />
//               Templates
//             </button>

//             <button
//               onClick={onNewPlan}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 text-sm"
//             >
//               <Plus className="w-4 h-4" />
//               New Plan
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         {renderFilters()}

//         {/* Statistics – only shown when plans exist */}
//         {plans.length > 0 && renderStats()}

//         {/* Plans Table */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//           {plans.length === 0 ? (
//             <div className="py-20 px-4 text-center">
//               <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//                 <Package className="w-10 h-10 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                 No plans found
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
//                 {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== null)
//                   ? "Try adjusting your filters or search query"
//                   : "Get started by creating your first internet plan"
//                 }
//               </p>
//               {!searchQuery && Object.values(filters).every(v => v === 'all' || v === null) && (
//                 <button
//                   onClick={onNewPlan}
//                   className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Create Your First Plan
//                 </button>
//               )}
//             </div>
//           ) : (
//             <>
//               {/* Bulk Actions Bar */}
//               {selectedPlans.length > 0 && (
//                 <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
//                       {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'} selected
//                     </span>
//                     <button
//                       onClick={() => setSelectedPlans([])}
//                       className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
//                     >
//                       Clear selection
//                     </button>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => handleBulkAction('activate')}
//                       className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700"
//                     >
//                       Activate
//                     </button>
//                     <button
//                       onClick={() => handleBulkAction('deactivate')}
//                       className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-700"
//                     >
//                       Deactivate
//                     </button>
//                     <button
//                       onClick={() => handleBulkAction('duplicate')}
//                       className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
//                     >
//                       Duplicate
//                     </button>
//                     <button
//                       onClick={() => handleBulkAction('delete')}
//                       className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[1000px]">
//                   <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
//                     <tr>
//                       <th className="px-4 py-3 w-10">
//                         <input
//                           type="checkbox"
//                           checked={selectedPlans.length === plans.length && plans.length > 0}
//                           onChange={toggleAllPlans}
//                           className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
//                         />
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Plan Details
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Price
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Access Type
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Subscribers
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Status
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                     {plans.map(plan => (
//                       <PlanTableRow
//                         key={plan.id}
//                         plan={plan}
//                         theme={theme}
//                         onViewDetails={onViewDetails}
//                         onEditPlan={onEditPlan}
//                         onDeletePlan={onDeletePlan}
//                         onDuplicatePlan={onDuplicatePlan}
//                         onToggleStatus={onToggleStatus}
//                         isSelected={selectedPlans.includes(plan.id)}
//                         onSelect={togglePlanSelection}
//                       />
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Footer */}
//               <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
//                 <div className="flex items-center gap-2">
//                   <Activity className="w-3.5 h-3.5" />
//                   <span>
//                     Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">
//                       {plans.length}
//                     </span> of <span className="font-semibold">{allPlans.length}</span> plans
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Sparkles className="w-3.5 h-3.5" />
//                   <span>Sorted by {sortConfig.field} ({sortConfig.direction})</span>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlanList;























// // ============================================================================
// // PlanList.js - COMPLETELY REWRITTEN
// // ============================================================================

// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Eye, Users, Search,
//   Wifi, Cable, BarChart3, Package, Box, Filter,
//   ChevronDown, ChevronUp, Clock, DollarSign, Calendar,
//   CheckCircle, XCircle, AlertTriangle, Settings,
//   Star, Target, TrendingUp, Zap, Shield, Download,
//   TrendingDown, Activity, Award, Flame, Crown, Sparkles,
//   Heart, ThumbsUp, Gauge, Server, RefreshCw, X,
//   Menu, Grid, LayoutGrid, List, Info, Tag, Layers,
//   ChevronLeft, ChevronRight, Maximize2, Minimize2, CreditCard,
//   Gift, BadgePercent, Infinity, AlertCircle, Check
// } from "lucide-react";
// import { getThemeClasses } from "../Shared/components";
// import { formatCurrency, formatNumber, formatDate } from "../Shared/formatters";

// // ============================================================================
// // CONSTANTS - Match backend exactly
// // ============================================================================
// const PLAN_TYPE_LABELS = {
//   paid: "Paid",
//   free_trial: "Free Trial",
//   promotional: "Promotional"
// };

// const ACCESS_TYPE_ICONS = {
//   hotspot: Wifi,
//   pppoe: Cable,
//   both: () => (
//     <div className="flex items-center">
//       <Wifi className="w-3 h-3 mr-0.5" />
//       <Cable className="w-3 h-3" />
//     </div>
//   )
// };

// const ACCESS_TYPE_COLORS = {
//   hotspot: {
//     light: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
//     dark: { bg: "bg-blue-900/30", text: "text-blue-400", border: "border-blue-800" }
//   },
//   pppoe: {
//     light: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
//     dark: { bg: "bg-green-900/30", text: "text-green-400", border: "border-green-800" }
//   },
//   both: {
//     light: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
//     dark: { bg: "bg-purple-900/30", text: "text-purple-400", border: "border-purple-800" }
//   }
// };

// // ============================================================================
// // PLAN TYPE BADGE COMPONENT
// // ============================================================================
// const PlanTypeBadge = ({ type, theme, size = 'sm' }) => {
//   const config = {
//     paid: {
//       label: 'Paid',
//       bg: 'bg-green-100 dark:bg-green-900/30',
//       text: 'text-green-700 dark:text-green-400',
//       border: 'border-green-200 dark:border-green-800',
//       icon: DollarSign
//     },
//     free_trial: {
//       label: 'Free Trial',
//       bg: 'bg-blue-100 dark:bg-blue-900/30',
//       text: 'text-blue-700 dark:text-blue-400',
//       border: 'border-blue-200 dark:border-blue-800',
//       icon: Clock
//     },
//     promotional: {
//       label: 'Promotional',
//       bg: 'bg-purple-100 dark:bg-purple-900/30',
//       text: 'text-purple-700 dark:text-purple-400',
//       border: 'border-purple-200 dark:border-purple-800',
//       icon: Sparkles
//     }
//   };

//   const { label, bg, text, border, icon: Icon } = config[type] || config.paid;

//   const sizeClasses = {
//     xs: 'px-1.5 py-0.5 text-[10px]',
//     sm: 'px-2 py-1 text-xs',
//     md: 'px-2.5 py-1.5 text-sm'
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1 rounded-full border font-medium
//       ${bg} ${text} ${border}
//       ${sizeClasses[size]}
//     `}>
//       <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
//       {label}
//     </span>
//   );
// };

// // ============================================================================
// // ACCESS TYPE BADGE COMPONENT
// // ============================================================================
// const AccessTypeBadge = ({ accessMethods = {}, size = 'sm', showLabel = true }) => {
//   const hotspot = accessMethods?.hotspot || { enabled: false };
//   const pppoe = accessMethods?.pppoe || { enabled: false };
  
//   const hasHotspot = hotspot.enabled === true;
//   const hasPPPoE = pppoe.enabled === true;

//   let type = 'none';
//   if (hasHotspot && hasPPPoE) type = 'both';
//   else if (hasHotspot) type = 'hotspot';
//   else if (hasPPPoE) type = 'pppoe';

//   const colors = ACCESS_TYPE_COLORS[type] || ACCESS_TYPE_COLORS.hotspot;
//   const Icon = ACCESS_TYPE_ICONS[type] || Wifi;

//   const sizeClasses = {
//     xs: "px-1.5 py-0.5 text-xs",
//     sm: "px-2 py-1 text-xs",
//     md: "px-2.5 py-1.5 text-sm"
//   };

//   const labels = {
//     hotspot: "Hotspot",
//     pppoe: "PPPoE",
//     both: "Dual Access",
//     none: "No Access"
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1.5 rounded-full font-medium border
//       ${colors.light.bg} ${colors.light.text} ${colors.light.border}
//       dark:${colors.dark.bg} dark:${colors.dark.text} dark:${colors.dark.border}
//       ${sizeClasses[size]}
//     `}>
//       <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
//       {showLabel && labels[type]}
//     </span>
//   );
// };

// // ============================================================================
// // AVAILABILITY BADGE COMPONENT
// // ============================================================================
// const AvailabilityBadge = ({ isAvailable, theme, size = 'sm' }) => {
//   const sizeClasses = {
//     xs: 'px-1.5 py-0.5 text-[10px]',
//     sm: 'px-2 py-1 text-xs',
//     md: 'px-2.5 py-1.5 text-sm'
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1 rounded-full font-medium border
//       ${isAvailable
//         ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-800'
//         : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800'
//       }
//       ${sizeClasses[size]}
//     `}>
//       {isAvailable ? (
//         <CheckCircle className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
//       ) : (
//         <XCircle className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
//       )}
//       {isAvailable ? 'Available' : 'Unavailable'}
//     </span>
//   );
// };

// // ============================================================================
// // STAR RATING COMPONENT
// // ============================================================================
// const StarRating = ({ rating, size = 'sm' }) => {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//   const sizeClasses = {
//     xs: "w-3 h-3",
//     sm: "w-4 h-4",
//     md: "w-5 h-5"
//   };

//   return (
//     <div className="flex items-center gap-1">
//       <div className="flex items-center">
//         {[...Array(fullStars)].map((_, i) => (
//           <Star
//             key={`full-${i}`}
//             className={`${sizeClasses[size]} fill-current text-amber-400`}
//           />
//         ))}
//         {hasHalfStar && (
//           <div className="relative">
//             <Star className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
//             <div className="absolute inset-0 overflow-hidden w-1/2">
//               <Star className={`${sizeClasses[size]} fill-current text-amber-400`} />
//             </div>
//           </div>
//         )}
//         {[...Array(emptyStars)].map((_, i) => (
//           <Star
//             key={`empty-${i}`}
//             className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
//           />
//         ))}
//       </div>
//       <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
//         {rating.toFixed(1)}
//       </span>
//     </div>
//   );
// };

// // ============================================================================
// // PRICE DISPLAY HELPER
// // ============================================================================
// const getPriceDisplay = (plan) => {
//   const price = parseFloat(plan.price) || 0;
  
//   switch (plan.plan_type) {
//     case 'free_trial':
//       return {
//         main: 'Free Trial',
//         value: '0.00',
//         badge: null,
//         className: 'text-blue-600 dark:text-blue-400 font-medium'
//       };
    
//     case 'promotional':
//       if (price === 0) {
//         return {
//           main: 'Free',
//           value: '0.00',
//           badge: 'Promo',
//           className: 'text-purple-600 dark:text-purple-400'
//         };
//       }
//       return {
//         main: `KES ${price.toFixed(2)}`,
//         value: price.toFixed(2),
//         badge: 'Promo',
//         className: 'text-purple-600 dark:text-purple-400 font-bold'
//       };
    
//     case 'paid':
//     default:
//       if (price === 0) {
//         return {
//           main: 'Free',
//           value: '0.00',
//           badge: null,
//           className: 'text-gray-600 dark:text-gray-400'
//         };
//       }
//       return {
//         main: `KES ${price.toFixed(2)}`,
//         value: price.toFixed(2),
//         badge: null,
//         className: 'text-gray-900 dark:text-white font-bold'
//       };
//   }
// };

// // ============================================================================
// // CALCULATE RATING FROM PURCHASES
// // ============================================================================
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

// // ============================================================================
// // FILTER BUTTON COMPONENT
// // ============================================================================
// const FilterButton = ({ label, icon: Icon, active, onClick, color = 'indigo' }) => {
//   const colorClasses = {
//     indigo: {
//       active: 'bg-indigo-600 text-white border-indigo-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
//     },
//     blue: {
//       active: 'bg-blue-600 text-white border-blue-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
//     },
//     green: {
//       active: 'bg-green-600 text-white border-green-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
//     },
//     purple: {
//       active: 'bg-purple-600 text-white border-purple-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400'
//     },
//     amber: {
//       active: 'bg-amber-600 text-white border-amber-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
//     },
//     red: {
//       active: 'bg-red-600 text-white border-red-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400'
//     }
//   };

//   return (
//     <button
//       onClick={onClick}
//       className={`
//         px-3 py-1.5 rounded-lg text-xs font-medium transition-all
//         flex items-center gap-1.5 border-2
//         ${active ? colorClasses[color].active : colorClasses[color].inactive}
//       `}
//     >
//       {Icon && <Icon className="w-3.5 h-3.5" />}
//       {label}
//     </button>
//   );
// };

// // ============================================================================
// // PLAN TABLE ROW COMPONENT
// // ============================================================================
// const PlanTableRow = ({
//   plan,
//   theme,
//   onViewDetails,
//   onEditPlan,
//   onDeletePlan,
//   onDuplicatePlan,
//   onToggleStatus,
//   isSelected,
//   onSelect
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const rating = calculateRating(plan.purchases);
//   const priceDisplay = getPriceDisplay(plan);
  
//   const accessMethods = plan.access_methods || { 
//     hotspot: { enabled: false }, 
//     pppoe: { enabled: false } 
//   };

//   return (
//     <tr className={`
//       group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
//       ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}
//     `}>
//       {/* Checkbox */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <input
//           type="checkbox"
//           checked={isSelected}
//           onChange={() => onSelect(plan.id)}
//           className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
//         />
//       </td>

//       {/* Plan Info */}
//       <td className="px-4 py-4">
//         <div className="flex items-start gap-3">
//           <div className={`
//             p-2 rounded-lg flex-shrink-0
//             ${accessMethods?.hotspot?.enabled && accessMethods?.pppoe?.enabled
//               ? 'bg-purple-100 dark:bg-purple-900/30'
//               : accessMethods?.hotspot?.enabled
//                 ? 'bg-blue-100 dark:bg-blue-900/30'
//                 : accessMethods?.pppoe?.enabled
//                   ? 'bg-green-100 dark:bg-green-900/30'
//                   : 'bg-gray-100 dark:bg-gray-800'
//             }
//           `}>
//             {accessMethods?.hotspot?.enabled && accessMethods?.pppoe?.enabled ? (
//               <div className="flex items-center gap-0.5">
//                 <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                 <Cable className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//               </div>
//             ) : accessMethods?.hotspot?.enabled ? (
//               <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//             ) : accessMethods?.pppoe?.enabled ? (
//               <Cable className="w-4 h-4 text-green-600 dark:text-green-400" />
//             ) : (
//               <AlertTriangle className="w-4 h-4 text-gray-400" />
//             )}
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="font-semibold text-gray-900 dark:text-white">
//                 {plan.name}
//               </span>
//               <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
//             </div>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 {plan.category || 'Uncategorized'}
//               </span>
//               <span className="text-gray-300 dark:text-gray-600">•</span>
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 ID: {plan.id?.slice(0, 8)}...
//               </span>
//             </div>
//           </div>
//         </div>
//       </td>

//       {/* Price */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className={priceDisplay.className}>
//           {priceDisplay.main}
//         </div>
//         {priceDisplay.badge && (
//           <div className="text-xs mt-1 text-purple-600 dark:text-purple-400 flex items-center gap-1">
//             <BadgePercent className="w-3 h-3" />
//             {priceDisplay.badge}
//           </div>
//         )}
//       </td>

//       {/* Access Type */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <AccessTypeBadge
//           accessMethods={accessMethods}
//           size="xs"
//           showLabel={true}
//         />
//       </td>

//       {/* Subscribers & Rating */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="flex items-center gap-2 mb-1">
//           <Users className="w-3.5 h-3.5 text-gray-500" />
//           <span className="text-sm font-medium text-gray-900 dark:text-white">
//             {formatNumber(plan.purchases || 0)}
//           </span>
//         </div>
//         <StarRating rating={rating} size="xs" />
//       </td>

//       {/* Status */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="space-y-1">
//           <AvailabilityBadge
//             isAvailable={plan.is_available_now || false}
//             theme={theme}
//             size="xs"
//           />
//           <span className={`
//             inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
//             ${plan.active
//               ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
//               : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
//             }
//           `}>
//             {plan.active ? 'Active' : 'Inactive'}
//           </span>
//           {plan.has_time_variant && (
//             <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
//               <Clock className="w-3 h-3" />
//               Time Restricted
//             </span>
//           )}
//         </div>
//       </td>

//       {/* Actions */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => onViewDetails(plan)}
//             className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             title="View Details"
//           >
//             <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
//           </button>
//           <button
//             onClick={() => onEditPlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
//             title="Edit Plan"
//           >
//             <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//           </button>
//           <button
//             onClick={() => onDuplicatePlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
//             title="Duplicate Plan"
//           >
//             <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
//           </button>
//           <button
//             onClick={() => onToggleStatus(plan)}
//             className={`
//               p-1.5 rounded-lg transition-colors
//               ${plan.active
//                 ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
//                 : 'hover:bg-green-100 dark:hover:bg-green-900/30'
//               }
//             `}
//             title={plan.active ? "Deactivate" : "Activate"}
//           >
//             {plan.active ? (
//               <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//             ) : (
//               <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
//             )}
//           </button>
//           <button
//             onClick={() => onDeletePlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
//             title="Delete Plan"
//           >
//             <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// };

// // ============================================================================
// // MAIN PLANLIST COMPONENT
// // ============================================================================
// const PlanList = ({
//   plans = [],
//   allPlans = [],
//   isLoading = false,
//   onEditPlan,
//   onViewDetails,
//   onDeletePlan,
//   onDuplicatePlan,
//   onToggleStatus,
//   onNewPlan,
//   onViewAnalytics,
//   onViewTemplates,
//   theme = 'light',
//   isMobile = false,
//   searchQuery = '',
//   onSearchChange,
//   filters = {
//     category: 'all',
//     planType: 'all',
//     accessType: 'all',
//     availability: 'all',
//     active: 'all',
//     hasTimeVariant: 'all',
//     routerSpecific: 'all',
//     priceRange: null
//   },
//   onFilterChange,
//   onClearFilters,
//   sortConfig = { field: 'name', direction: 'asc' },
//   onSort
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedPlans, setSelectedPlans] = useState([]);
//   const [showBulkActions, setShowBulkActions] = useState(false);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
//   const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

//   // ==========================================================================
//   // STATISTICS
//   // ==========================================================================
//   const stats = useMemo(() => {
//     const active = plans.filter(p => p.active).length;
//     const inactive = plans.filter(p => !p.active).length;
//     const available = plans.filter(p => p.is_available_now).length;
//     const totalSubscribers = plans.reduce((sum, p) => sum + (p.purchases || 0), 0);
//     const totalRevenue = plans.reduce((sum, p) => sum + ((p.purchases || 0) * (parseFloat(p.price) || 0)), 0);

//     const mostPopular = [...plans].sort((a, b) => (b.purchases || 0) - (a.purchases || 0))[0];
//     const mostExpensive = [...plans].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))[0];

//     const byPlanType = plans.reduce((acc, p) => {
//       const type = p.plan_type || 'paid';
//       acc[type] = (acc[type] || 0) + 1;
//       return acc;
//     }, {});

//     const byAccessType = plans.reduce((acc, p) => {
//       const hotspot = p.access_methods?.hotspot?.enabled;
//       const pppoe = p.access_methods?.pppoe?.enabled;
//       let type = 'none';
//       if (hotspot && pppoe) type = 'both';
//       else if (hotspot) type = 'hotspot';
//       else if (pppoe) type = 'pppoe';
      
//       acc[type] = (acc[type] || 0) + 1;
//       return acc;
//     }, {});

//     return {
//       total: plans.length,
//       active,
//       inactive,
//       available,
//       totalSubscribers,
//       totalRevenue,
//       mostPopular,
//       mostExpensive,
//       byPlanType,
//       byAccessType
//     };
//   }, [plans]);

//   // ==========================================================================
//   // FILTER HANDLERS
//   // ==========================================================================
//   const handleQuickFilter = useCallback((type, value) => {
//     const newValue = filters[type] === value ? 'all' : value;
//     onFilterChange(type, newValue);
//   }, [filters, onFilterChange]);

//   const handleClearAllFilters = useCallback(() => {
//     onSearchChange('');
//     onClearFilters();
//   }, [onSearchChange, onClearFilters]);

//   // ==========================================================================
//   // BULK ACTIONS
//   // ==========================================================================
//   const togglePlanSelection = useCallback((id) => {
//     setSelectedPlans(prev =>
//       prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
//     );
//   }, []);

//   const toggleAllPlans = useCallback(() => {
//     setSelectedPlans(prev =>
//       prev.length === plans.length ? [] : plans.map(p => p.id)
//     );
//   }, [plans]);

//   const handleBulkAction = useCallback(async (action) => {
//     setShowBulkActions(false);

//     if (action === 'delete') {
//       if (!window.confirm(`Delete ${selectedPlans.length} selected plans? This cannot be undone.`)) {
//         return;
//       }
//     }

//     const batchSize = 5;
//     for (let i = 0; i < selectedPlans.length; i += batchSize) {
//       const batch = selectedPlans.slice(i, i + batchSize);
//       await Promise.allSettled(
//         batch.map(async (id) => {
//           const plan = plans.find(p => p.id === id);
//           if (!plan) return;

//           switch (action) {
//             case 'activate':
//               if (!plan.active) await onToggleStatus(plan);
//               break;
//             case 'deactivate':
//               if (plan.active) await onToggleStatus(plan);
//               break;
//             case 'duplicate':
//               await onDuplicatePlan(plan);
//               break;
//             case 'delete':
//               await onDeletePlan(plan);
//               break;
//             default:
//               break;
//           }
//         })
//       );
//     }

//     setSelectedPlans([]);
//   }, [selectedPlans, plans, onToggleStatus, onDuplicatePlan, onDeletePlan]);

//   // ==========================================================================
//   // GRID VIEW RENDERER
//   // ==========================================================================
//   const renderGridView = useCallback(() => {
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {plans.map(plan => {
//           const priceDisplay = getPriceDisplay(plan);
//           const accessMethods = plan.access_methods || {};
//           const rating = calculateRating(plan.purchases);
//           const isSelected = selectedPlans.includes(plan.id);

//           return (
//             <motion.div
//               key={plan.id}
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className={`
//                 rounded-xl border overflow-hidden cursor-pointer transition-all
//                 ${isSelected
//                   ? 'ring-2 ring-indigo-500 border-indigo-500'
//                   : theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
//                     : 'bg-white border-gray-200 hover:border-gray-300'
//                 }
//               `}
//               onClick={() => togglePlanSelection(plan.id)}
//             >
//               <div className="p-4">
//                 {/* Header */}
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => togglePlanSelection(plan.id)}
//                       onClick={(e) => e.stopPropagation()}
//                       className="w-4 h-4 rounded border-gray-300 text-indigo-600"
//                     />
//                     <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <AvailabilityBadge
//                       isAvailable={plan.is_available_now || false}
//                       theme={theme}
//                       size="xs"
//                     />
//                   </div>
//                 </div>

//                 {/* Plan Info */}
//                 <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
//                   {plan.description || 'No description'}
//                 </p>

//                 {/* Price */}
//                 <div className={`text-2xl font-bold mb-3 ${priceDisplay.className}`}>
//                   {priceDisplay.main}
//                 </div>

//                 {/* Access Type */}
//                 <div className="mb-3">
//                   <AccessTypeBadge accessMethods={accessMethods} size="sm" />
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                   <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
//                     <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
//                     <div className="text-sm font-medium">
//                       {formatNumber(plan.purchases || 0)}
//                     </div>
//                     <div className="text-xs text-gray-500">Subscribers</div>
//                   </div>
//                   <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
//                     <Star className="w-4 h-4 mx-auto mb-1 text-amber-500" />
//                     <div className="text-sm font-medium">
//                       {rating.toFixed(1)}
//                     </div>
//                     <div className="text-xs text-gray-500">Rating</div>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onViewDetails(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onEditPlan(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
//                   >
//                     <Pencil className="w-4 h-4 text-blue-600" />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDuplicatePlan(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
//                   >
//                     <Plus className="w-4 h-4 text-green-600" />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDeletePlan(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
//                   >
//                     <Trash2 className="w-4 h-4 text-red-600" />
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>
//     );
//   }, [plans, theme, selectedPlans, togglePlanSelection, onViewDetails, onEditPlan, onDuplicatePlan, onDeletePlan]);

//   // ==========================================================================
//   // TABLE VIEW RENDERER
//   // ==========================================================================
//   const renderTableView = useCallback(() => {
//     return (
//       <div className="overflow-x-auto">
//         <table className="w-full min-w-[1000px]">
//           <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
//             <tr>
//               <th className="px-4 py-3 w-10">
//                 <input
//                   type="checkbox"
//                   checked={selectedPlans.length === plans.length && plans.length > 0}
//                   onChange={toggleAllPlans}
//                   className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
//                 />
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Plan Details
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Price
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Access Type
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Subscribers
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//             {plans.map(plan => (
//               <PlanTableRow
//                 key={plan.id}
//                 plan={plan}
//                 theme={theme}
//                 onViewDetails={onViewDetails}
//                 onEditPlan={onEditPlan}
//                 onDeletePlan={onDeletePlan}
//                 onDuplicatePlan={onDuplicatePlan}
//                 onToggleStatus={onToggleStatus}
//                 isSelected={selectedPlans.includes(plan.id)}
//                 onSelect={togglePlanSelection}
//               />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   }, [plans, theme, selectedPlans, toggleAllPlans, togglePlanSelection, onViewDetails, onEditPlan, onDeletePlan, onDuplicatePlan, onToggleStatus]);

//   // ==========================================================================
//   // RENDER STATS CARDS
//   // ==========================================================================
//   const renderStats = () => (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
//             <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</span>
//         </div>
//         <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//           {stats.total}
//         </div>
//         <div className="flex items-center gap-2 mt-1 text-xs">
//           <span className="text-green-600 dark:text-green-400">{stats.active} active</span>
//           <span className="text-gray-300 dark:text-gray-600">•</span>
//           <span className="text-red-600 dark:text-red-400">{stats.inactive} inactive</span>
//         </div>
//       </div>

//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
//             <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</span>
//         </div>
//         <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//           {formatNumber(stats.totalSubscribers)}
//         </div>
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           Revenue: KES {formatNumber(stats.totalRevenue.toFixed(2))}
//         </div>
//       </div>

//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
//             <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Now</span>
//         </div>
//         <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//           {stats.available}
//         </div>
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           {stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0}% of plans
//         </div>
//       </div>

//       <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//         <div className="flex items-center gap-2 mb-2">
//           <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
//             <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//           </div>
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Popular</span>
//         </div>
//         <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate">
//           {stats.mostPopular?.name || 'N/A'}
//         </div>
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           {formatNumber(stats.mostPopular?.purchases || 0)} subscribers
//         </div>
//       </div>
//     </div>
//   );

//   // ==========================================================================
//   // RENDER FILTERS
//   // ==========================================================================
//   const renderFilters = () => (
//     <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//       {/* Search Bar */}
//       <div className="relative mb-4">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search plans by name, category, or description..."
//           value={searchQuery}
//           onChange={(e) => onSearchChange(e.target.value)}
//           className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
//         />
//         {searchQuery && (
//           <button
//             onClick={() => onSearchChange('')}
//             className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//           >
//             <X className="w-5 h-5 text-gray-400" />
//           </button>
//         )}
//       </div>

//       {/* Quick Filters */}
//       <div className="flex flex-wrap items-center gap-2">
//         <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">
//           Quick Filters:
//         </span>

//         <FilterButton
//           label="All Plans"
//           icon={Package}
//           active={!searchQuery &&
//             filters.accessType === 'all' &&
//             filters.planType === 'all' &&
//             filters.availability === 'all' &&
//             filters.active === 'all' &&
//             filters.hasTimeVariant === 'all'}
//           onClick={handleClearAllFilters}
//           color="indigo"
//         />

//         <FilterButton
//           label="Hotspot"
//           icon={Wifi}
//           active={filters.accessType === 'hotspot'}
//           onClick={() => handleQuickFilter('accessType', 'hotspot')}
//           color="blue"
//         />

//         <FilterButton
//           label="PPPoE"
//           icon={Cable}
//           active={filters.accessType === 'pppoe'}
//           onClick={() => handleQuickFilter('accessType', 'pppoe')}
//           color="green"
//         />

//         <FilterButton
//           label="Dual"
//           icon={() => (
//             <div className="flex">
//               <Wifi className="w-3.5 h-3.5 mr-0.5" />
//               <Cable className="w-3.5 h-3.5" />
//             </div>
//           )}
//           active={filters.accessType === 'both'}
//           onClick={() => handleQuickFilter('accessType', 'both')}
//           color="purple"
//         />

//         <FilterButton
//           label="Available"
//           icon={CheckCircle}
//           active={filters.availability === 'available'}
//           onClick={() => handleQuickFilter('availability', 'available')}
//           color="green"
//         />

//         <FilterButton
//           label="Free Trial"
//           icon={Clock}
//           active={filters.planType === 'free_trial'}
//           onClick={() => handleQuickFilter('planType', 'free_trial')}
//           color="blue"
//         />

//         <FilterButton
//           label="Promotional"
//           icon={Sparkles}
//           active={filters.planType === 'promotional'}
//           onClick={() => handleQuickFilter('planType', 'promotional')}
//           color="purple"
//         />

//         <FilterButton
//           label="Paid"
//           icon={DollarSign}
//           active={filters.planType === 'paid'}
//           onClick={() => handleQuickFilter('planType', 'paid')}
//           color="green"
//         />

//         <FilterButton
//           label="Time Restricted"
//           icon={Clock}
//           active={filters.hasTimeVariant === 'yes'}
//           onClick={() => handleQuickFilter('hasTimeVariant', 'yes')}
//           color="amber"
//         />

//         <FilterButton
//           label="Active"
//           icon={CheckCircle}
//           active={filters.active === 'active'}
//           onClick={() => handleQuickFilter('active', 'active')}
//           color="green"
//         />

//         {(searchQuery ||
//           filters.accessType !== 'all' ||
//           filters.planType !== 'all' ||
//           filters.availability !== 'all' ||
//           filters.active !== 'all' ||
//           filters.hasTimeVariant !== 'all') && (
//           <button
//             onClick={handleClearAllFilters}
//             className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-1.5 ml-auto"
//           >
//             <X className="w-3.5 h-3.5" />
//             Clear All
//           </button>
//         )}
//       </div>

//       {/* Filter Summary */}
//       {(searchQuery ||
//         filters.accessType !== 'all' ||
//         filters.planType !== 'all' ||
//         filters.availability !== 'all' ||
//         filters.active !== 'all' ||
//         filters.hasTimeVariant !== 'all') && (
//         <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             Showing {plans.length} of {allPlans.length} plans
//           </p>
//         </div>
//       )}
//     </div>
//   );

//   // ==========================================================================
//   // MAIN RENDER
//   // ==========================================================================
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" />
//               </div>
//             </div>
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your plans...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Internet Plans
//             </h1>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//               Create, manage, and analyze your internet service plans
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* View Toggle */}
//             <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
//               <button
//                 onClick={() => setViewMode('table')}
//                 className={`p-2 rounded-md transition-colors ${
//                   viewMode === 'table'
//                     ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//                 title="Table View"
//               >
//                 <List className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`p-2 rounded-md transition-colors ${
//                   viewMode === 'grid'
//                     ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//                 title="Grid View"
//               >
//                 <Grid className="w-4 h-4" />
//               </button>
//             </div>

//             <button
//               onClick={onViewAnalytics}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2 text-sm"
//             >
//               <BarChart3 className="w-4 h-4" />
//               Analytics
//             </button>

//             <button
//               onClick={onViewTemplates}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 text-sm"
//             >
//               <Box className="w-4 h-4" />
//               Templates
//             </button>

//             <button
//               onClick={onNewPlan}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 text-sm"
//             >
//               <Plus className="w-4 h-4" />
//               New Plan
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         {renderFilters()}

//         {/* Statistics */}
//         {plans.length > 0 && renderStats()}

//         {/* Bulk Actions Bar */}
//         {selectedPlans.length > 0 && (
//           <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
//                 {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'} selected
//               </span>
//               <button
//                 onClick={() => setSelectedPlans([])}
//                 className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
//               >
//                 Clear selection
//               </button>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handleBulkAction('activate')}
//                 className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700"
//               >
//                 Activate
//               </button>
//               <button
//                 onClick={() => handleBulkAction('deactivate')}
//                 className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-700"
//               >
//                 Deactivate
//               </button>
//               <button
//                 onClick={() => handleBulkAction('duplicate')}
//                 className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
//               >
//                 Duplicate
//               </button>
//               <button
//                 onClick={() => handleBulkAction('delete')}
//                 className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Plans Display */}
//         {plans.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-20 px-4 text-center">
//             <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//               <Package className="w-10 h-10 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//               No plans found
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
//               {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== null)
//                 ? "Try adjusting your filters or search query"
//                 : "Get started by creating your first internet plan"
//               }
//             </p>
//             {!searchQuery && Object.values(filters).every(v => v === 'all' || v === null) && (
//               <button
//                 onClick={onNewPlan}
//                 className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
//               >
//                 <Plus className="w-4 h-4" />
//                 Create Your First Plan
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//             {viewMode === 'table' ? renderTableView() : renderGridView()}

//             {/* Footer */}
//             <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
//               <div className="flex items-center gap-2">
//                 <Activity className="w-3.5 h-3.5" />
//                 <span>
//                   Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">
//                     {plans.length}
//                   </span> of <span className="font-semibold">{allPlans.length}</span> plans
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-3.5 h-3.5" />
//                 <span>Sorted by {sortConfig.field} ({sortConfig.direction})</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanList;












// // PlanList.js - COMPLETE PRODUCTION READY VERSION

// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Eye, Users, Search,
//   Wifi, Cable, BarChart3, Package, Box, Filter,
//   ChevronDown, ChevronUp, Clock, DollarSign, Calendar,
//   CheckCircle, XCircle, AlertTriangle, Settings,
//   Star, Target, TrendingUp, Zap, Shield, Download,
//   TrendingDown, Activity, Award, Flame, Crown, Sparkles,
//   Heart, ThumbsUp, Gauge, Server, RefreshCw, X,
//   Menu, Grid, LayoutGrid, List, Info, Tag, Layers,
//   ChevronLeft, ChevronRight, Maximize2, Minimize2, CreditCard,
//   Gift, BadgePercent, Infinity, AlertCircle, Check
// } from "lucide-react";

// // ============================================================================
// // CONSTANTS
// // ============================================================================

// const PLAN_TYPE_LABELS = {
//   paid: "Paid",
//   free_trial: "Free Trial",
//   promotional: "Promotional"
// };

// const PLAN_TYPE_COLORS = {
//   paid: {
//     light: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
//     dark: { bg: "dark:bg-green-900/30", text: "dark:text-green-400", border: "dark:border-green-800" }
//   },
//   free_trial: {
//     light: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
//     dark: { bg: "dark:bg-blue-900/30", text: "dark:text-blue-400", border: "dark:border-blue-800" }
//   },
//   promotional: {
//     light: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
//     dark: { bg: "dark:bg-purple-900/30", text: "dark:text-purple-400", border: "dark:border-purple-800" }
//   }
// };

// const ACCESS_TYPE_ICONS = {
//   hotspot: Wifi,
//   pppoe: Cable,
//   both: () => (
//     <div className="flex items-center">
//       <Wifi className="w-3 h-3 mr-0.5" />
//       <Cable className="w-3 h-3" />
//     </div>
//   ),
//   none: AlertTriangle
// };

// const ACCESS_TYPE_COLORS = {
//   hotspot: {
//     light: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
//     dark: { bg: "dark:bg-blue-900/30", text: "dark:text-blue-400", border: "dark:border-blue-800" }
//   },
//   pppoe: {
//     light: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
//     dark: { bg: "dark:bg-green-900/30", text: "dark:text-green-400", border: "dark:border-green-800" }
//   },
//   both: {
//     light: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
//     dark: { bg: "dark:bg-purple-900/30", text: "dark:text-purple-400", border: "dark:border-purple-800" }
//   },
//   none: {
//     light: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
//     dark: { bg: "dark:bg-gray-800", text: "dark:text-gray-400", border: "dark:border-gray-700" }
//   }
// };

// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================

// const getThemeClasses = (theme) => ({
//   bg: {
//     primary: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
//     card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
//     hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
//     success: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
//     warning: theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-100',
//     danger: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
//     info: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
//   },
//   text: {
//     primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
//     secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
//     success: theme === 'dark' ? 'text-green-400' : 'text-green-700',
//     warning: theme === 'dark' ? 'text-amber-400' : 'text-amber-700',
//     danger: theme === 'dark' ? 'text-red-400' : 'text-red-700',
//     info: theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
//   },
//   border: {
//     light: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
//     success: theme === 'dark' ? 'border-green-800' : 'border-green-200',
//     warning: theme === 'dark' ? 'border-amber-800' : 'border-amber-200',
//     danger: theme === 'dark' ? 'border-red-800' : 'border-red-200',
//     info: theme === 'dark' ? 'border-blue-800' : 'border-blue-200'
//   }
// });

// const formatCurrency = (value) => {
//   return new Intl.NumberFormat('en-KE', {
//     style: 'currency',
//     currency: 'KES',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }).format(value);
// };

// const formatNumber = (value) => {
//   return new Intl.NumberFormat('en-KE').format(value || 0);
// };

// const formatDate = (dateString, includeTime = false) => {
//   if (!dateString) return 'N/A';
//   try {
//     const date = new Date(dateString);
//     if (includeTime) {
//       return date.toLocaleString('en-KE', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     }
//     return date.toLocaleDateString('en-KE', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   } catch {
//     return 'Invalid Date';
//   }
// };

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

// const calculatePopularity = (purchases) => {
//   if (purchases >= 1000) return { label: 'Very High', color: 'text-purple-600', icon: Crown };
//   if (purchases >= 500) return { label: 'High', color: 'text-green-600', icon: TrendingUp };
//   if (purchases >= 100) return { label: 'Medium', color: 'text-blue-600', icon: Activity };
//   if (purchases >= 10) return { label: 'Low', color: 'text-amber-600', icon: TrendingDown };
//   return { label: 'New', color: 'text-gray-600', icon: Star };
// };

// // ============================================================================
// // PLAN TYPE BADGE COMPONENT
// // ============================================================================

// const PlanTypeBadge = ({ type, theme = 'light', size = 'sm' }) => {
//   const config = {
//     paid: {
//       label: 'Paid',
//       icon: DollarSign,
//       colors: PLAN_TYPE_COLORS.paid
//     },
//     free_trial: {
//       label: 'Free Trial',
//       icon: Clock,
//       colors: PLAN_TYPE_COLORS.free_trial
//     },
//     promotional: {
//       label: 'Promotional',
//       icon: Sparkles,
//       colors: PLAN_TYPE_COLORS.promotional
//     }
//   };

//   const { label, icon: Icon, colors } = config[type] || config.paid;

//   const sizeClasses = {
//     xs: 'px-1.5 py-0.5 text-[10px]',
//     sm: 'px-2 py-1 text-xs',
//     md: 'px-2.5 py-1.5 text-sm'
//   };

//   const iconSizes = {
//     xs: 'w-2.5 h-2.5',
//     sm: 'w-3 h-3',
//     md: 'w-3.5 h-3.5'
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1 rounded-full border font-medium
//       ${colors.light.bg} ${colors.light.text} ${colors.light.border}
//       ${colors.dark.bg} ${colors.dark.text} ${colors.dark.border}
//       ${sizeClasses[size]}
//     `}>
//       <Icon className={iconSizes[size]} />
//       {label}
//     </span>
//   );
// };

// // ============================================================================
// // ACCESS TYPE BADGE COMPONENT
// // ============================================================================

// const AccessTypeBadge = ({ accessMethods = {}, size = 'sm', showLabel = true, theme = 'light' }) => {
//   const hotspot = accessMethods?.hotspot || { enabled: false };
//   const pppoe = accessMethods?.pppoe || { enabled: false };
  
//   const hasHotspot = hotspot.enabled === true;
//   const hasPPPoE = pppoe.enabled === true;

//   let type = 'none';
//   if (hasHotspot && hasPPPoE) type = 'both';
//   else if (hasHotspot) type = 'hotspot';
//   else if (hasPPPoE) type = 'pppoe';

//   const colors = ACCESS_TYPE_COLORS[type] || ACCESS_TYPE_COLORS.none;
//   const Icon = ACCESS_TYPE_ICONS[type] || ACCESS_TYPE_ICONS.none;

//   const sizeClasses = {
//     xs: "px-1.5 py-0.5 text-xs",
//     sm: "px-2 py-1 text-xs",
//     md: "px-2.5 py-1.5 text-sm"
//   };

//   const iconSizes = {
//     xs: "w-3 h-3",
//     sm: "w-3.5 h-3.5",
//     md: "w-4 h-4"
//   };

//   const labels = {
//     hotspot: "Hotspot",
//     pppoe: "PPPoE",
//     both: "Dual Access",
//     none: "No Access"
//   };

//   return (
//     <span className={`
//       inline-flex items-center gap-1.5 rounded-full font-medium border
//       ${colors.light.bg} ${colors.light.text} ${colors.light.border}
//       ${colors.dark.bg} ${colors.dark.text} ${colors.dark.border}
//       ${sizeClasses[size]}
//     `}>
//       <Icon className={iconSizes[size]} />
//       {showLabel && labels[type]}
//     </span>
//   );
// };

// // ============================================================================
// // AVAILABILITY BADGE COMPONENT
// // ============================================================================

// const AvailabilityBadge = ({ isAvailable, theme = 'light', size = 'sm' }) => {
//   const sizeClasses = {
//     xs: 'px-1.5 py-0.5 text-[10px]',
//     sm: 'px-2 py-1 text-xs',
//     md: 'px-2.5 py-1.5 text-sm'
//   };

//   const iconSizes = {
//     xs: 'w-2.5 h-2.5',
//     sm: 'w-3 h-3',
//     md: 'w-3.5 h-3.5'
//   };

//   const colors = isAvailable
//     ? {
//         bg: 'bg-green-100 dark:bg-green-900/50',
//         text: 'text-green-700 dark:text-green-400',
//         border: 'border-green-200 dark:border-green-800'
//       }
//     : {
//         bg: 'bg-red-100 dark:bg-red-900/50',
//         text: 'text-red-700 dark:text-red-400',
//         border: 'border-red-200 dark:border-red-800'
//       };

//   return (
//     <span className={`
//       inline-flex items-center gap-1 rounded-full font-medium border
//       ${colors.bg} ${colors.text} ${colors.border}
//       ${sizeClasses[size]}
//     `}>
//       {isAvailable ? (
//         <CheckCircle className={iconSizes[size]} />
//       ) : (
//         <XCircle className={iconSizes[size]} />
//       )}
//       {isAvailable ? 'Available' : 'Unavailable'}
//     </span>
//   );
// };

// // ============================================================================
// // STAR RATING COMPONENT
// // ============================================================================

// const StarRating = ({ rating, size = 'sm' }) => {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

//   const sizeClasses = {
//     xs: "w-3 h-3",
//     sm: "w-4 h-4",
//     md: "w-5 h-5"
//   };

//   return (
//     <div className="flex items-center gap-1">
//       <div className="flex items-center">
//         {[...Array(fullStars)].map((_, i) => (
//           <Star
//             key={`full-${i}`}
//             className={`${sizeClasses[size]} fill-current text-amber-400`}
//           />
//         ))}
//         {hasHalfStar && (
//           <div className="relative">
//             <Star className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
//             <div className="absolute inset-0 overflow-hidden w-1/2">
//               <Star className={`${sizeClasses[size]} fill-current text-amber-400`} />
//             </div>
//           </div>
//         )}
//         {[...Array(emptyStars)].map((_, i) => (
//           <Star
//             key={`empty-${i}`}
//             className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
//           />
//         ))}
//       </div>
//       <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
//         {rating.toFixed(1)}
//       </span>
//     </div>
//   );
// };

// // ============================================================================
// // PRICE DISPLAY HELPER
// // ============================================================================

// const getPriceDisplay = (plan) => {
//   const price = parseFloat(plan.price) || 0;
  
//   switch (plan.plan_type) {
//     case 'free_trial':
//       return {
//         main: 'Free Trial',
//         value: '0.00',
//         badge: null,
//         className: 'text-blue-600 dark:text-blue-400 font-medium'
//       };
    
//     case 'promotional':
//       if (price === 0) {
//         return {
//           main: 'Free',
//           value: '0.00',
//           badge: 'Promo',
//           className: 'text-purple-600 dark:text-purple-400'
//         };
//       }
//       return {
//         main: formatCurrency(price),
//         value: price.toFixed(2),
//         badge: 'Promo',
//         className: 'text-purple-600 dark:text-purple-400 font-bold'
//       };
    
//     case 'paid':
//     default:
//       if (price === 0) {
//         return {
//           main: 'Free',
//           value: '0.00',
//           badge: null,
//           className: 'text-gray-600 dark:text-gray-400'
//         };
//       }
//       return {
//         main: formatCurrency(price),
//         value: price.toFixed(2),
//         badge: null,
//         className: 'text-gray-900 dark:text-white font-bold'
//       };
//   }
// };

// // ============================================================================
// // FILTER BUTTON COMPONENT
// // ============================================================================

// const FilterButton = ({ label, icon: Icon, active, onClick, color = 'indigo' }) => {
//   const colorClasses = {
//     indigo: {
//       active: 'bg-indigo-600 text-white border-indigo-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
//     },
//     blue: {
//       active: 'bg-blue-600 text-white border-blue-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
//     },
//     green: {
//       active: 'bg-green-600 text-white border-green-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
//     },
//     purple: {
//       active: 'bg-purple-600 text-white border-purple-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400'
//     },
//     amber: {
//       active: 'bg-amber-600 text-white border-amber-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
//     },
//     red: {
//       active: 'bg-red-600 text-white border-red-600',
//       inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400'
//     }
//   };

//   return (
//     <button
//       onClick={onClick}
//       className={`
//         px-3 py-1.5 rounded-lg text-xs font-medium transition-all
//         flex items-center gap-1.5 border-2 whitespace-nowrap
//         ${active ? colorClasses[color].active : colorClasses[color].inactive}
//       `}
//     >
//       {Icon && <Icon className="w-3.5 h-3.5" />}
//       {label}
//     </button>
//   );
// };

// // ============================================================================
// // PLAN TABLE ROW COMPONENT
// // ============================================================================

// const PlanTableRow = ({
//   plan,
//   theme = 'light',
//   onViewDetails,
//   onEditPlan,
//   onDeletePlan,
//   onDuplicatePlan,
//   onToggleStatus,
//   isSelected,
//   onSelect
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const rating = calculateRating(plan.purchases);
//   const priceDisplay = getPriceDisplay(plan);
//   const popularity = calculatePopularity(plan.purchases);
//   const PopularityIcon = popularity.icon;
  
//   const accessMethods = plan.access_methods || { 
//     hotspot: { enabled: false }, 
//     pppoe: { enabled: false } 
//   };

//   return (
//     <tr className={`
//       group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
//       ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}
//     `}>
//       {/* Checkbox */}
//       <td className="px-4 py-4 whitespace-nowrap w-10">
//         <input
//           type="checkbox"
//           checked={isSelected}
//           onChange={() => onSelect(plan.id)}
//           className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
//         />
//       </td>

//       {/* Plan Info */}
//       <td className="px-4 py-4">
//         <div className="flex items-start gap-3">
//           <div className={`
//             p-2 rounded-lg flex-shrink-0
//             ${accessMethods?.hotspot?.enabled && accessMethods?.pppoe?.enabled
//               ? 'bg-purple-100 dark:bg-purple-900/30'
//               : accessMethods?.hotspot?.enabled
//                 ? 'bg-blue-100 dark:bg-blue-900/30'
//                 : accessMethods?.pppoe?.enabled
//                   ? 'bg-green-100 dark:bg-green-900/30'
//                   : 'bg-gray-100 dark:bg-gray-800'
//             }
//           `}>
//             {accessMethods?.hotspot?.enabled && accessMethods?.pppoe?.enabled ? (
//               <div className="flex items-center gap-0.5">
//                 <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                 <Cable className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//               </div>
//             ) : accessMethods?.hotspot?.enabled ? (
//               <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//             ) : accessMethods?.pppoe?.enabled ? (
//               <Cable className="w-4 h-4 text-green-600 dark:text-green-400" />
//             ) : (
//               <AlertTriangle className="w-4 h-4 text-gray-400" />
//             )}
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <span className="font-semibold text-gray-900 dark:text-white">
//                 {plan.name}
//               </span>
//               <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
//             </div>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 {plan.category || 'Uncategorized'}
//               </span>
//               <span className="text-gray-300 dark:text-gray-600">•</span>
//               <span className="text-xs text-gray-500 dark:text-gray-400">
//                 ID: {plan.id?.slice(0, 8)}...
//               </span>
//             </div>
//             {plan.description && (
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
//                 {plan.description}
//               </p>
//             )}
//           </div>
//         </div>
//       </td>

//       {/* Price */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className={priceDisplay.className}>
//           {priceDisplay.main}
//         </div>
//         {priceDisplay.badge && (
//           <div className="text-xs mt-1 text-purple-600 dark:text-purple-400 flex items-center gap-1">
//             <BadgePercent className="w-3 h-3" />
//             {priceDisplay.badge}
//           </div>
//         )}
//       </td>

//       {/* Access Type */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <AccessTypeBadge
//           accessMethods={accessMethods}
//           size="xs"
//           showLabel={true}
//           theme={theme}
//         />
//       </td>

//       {/* Subscribers & Rating */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="flex items-center gap-2 mb-1">
//           <Users className="w-3.5 h-3.5 text-gray-500" />
//           <span className="text-sm font-medium text-gray-900 dark:text-white">
//             {formatNumber(plan.purchases || 0)}
//           </span>
//         </div>
//         <StarRating rating={rating} size="xs" />
//         <div className="flex items-center gap-1 mt-1">
//           <PopularityIcon className={`w-3 h-3 ${popularity.color}`} />
//           <span className={`text-xs ${popularity.color}`}>
//             {popularity.label}
//           </span>
//         </div>
//       </td>

//       {/* Status */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="space-y-1">
//           <AvailabilityBadge
//             isAvailable={plan.is_available_now || false}
//             theme={theme}
//             size="xs"
//           />
//           <span className={`
//             inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
//             ${plan.active
//               ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
//               : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
//             }
//           `}>
//             {plan.active ? 'Active' : 'Inactive'}
//           </span>
//           {plan.has_time_variant && (
//             <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
//               <Clock className="w-3 h-3" />
//               Time Restricted
//             </span>
//           )}
//         </div>
//       </td>

//       {/* Actions */}
//       <td className="px-4 py-4 whitespace-nowrap">
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => onViewDetails(plan)}
//             className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//             title="View Details"
//           >
//             <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
//           </button>
//           <button
//             onClick={() => onEditPlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
//             title="Edit Plan"
//           >
//             <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//           </button>
//           <button
//             onClick={() => onDuplicatePlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
//             title="Duplicate Plan"
//           >
//             <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
//           </button>
//           <button
//             onClick={() => onToggleStatus(plan)}
//             className={`
//               p-1.5 rounded-lg transition-colors
//               ${plan.active
//                 ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
//                 : 'hover:bg-green-100 dark:hover:bg-green-900/30'
//               }
//             `}
//             title={plan.active ? "Deactivate" : "Activate"}
//           >
//             {plan.active ? (
//               <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//             ) : (
//               <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
//             )}
//           </button>
//           <button
//             onClick={() => onDeletePlan(plan)}
//             className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
//             title="Delete Plan"
//           >
//             <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// };

// // ============================================================================
// // MAIN PLANLIST COMPONENT
// // ============================================================================

// const PlanList = ({
//   plans = [],
//   allPlans = [],
//   isLoading = false,
//   onEditPlan,
//   onViewDetails,
//   onDeletePlan,
//   onDuplicatePlan,
//   onToggleStatus,
//   onNewPlan,
//   onViewAnalytics,
//   onViewTemplates,
//   onRefresh,
//   theme = 'light',
//   isMobile = false,
//   searchQuery = '',
//   onSearchChange,
//   filters = {
//     category: 'all',
//     planType: 'all',
//     accessType: 'all',
//     availability: 'all',
//     active: 'all',
//     hasTimeVariant: 'all',
//     routerSpecific: 'all',
//     priceRange: null
//   },
//   onFilterChange,
//   onClearFilters,
//   sortConfig = { field: 'name', direction: 'asc' },
//   onSort
// }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedPlans, setSelectedPlans] = useState([]);
//   const [showBulkActions, setShowBulkActions] = useState(false);
//   const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
//   const [showFilters, setShowFilters] = useState(!isMobile);

//   // Update showFilters when isMobile changes
//   useEffect(() => {
//     setShowFilters(!isMobile);
//   }, [isMobile]);

//   // ==========================================================================
//   // STATISTICS
//   // ==========================================================================

//   const stats = useMemo(() => {
//     const active = plans.filter(p => p.active).length;
//     const inactive = plans.filter(p => !p.active).length;
//     const available = plans.filter(p => p.is_available_now).length;
//     const totalSubscribers = plans.reduce((sum, p) => sum + (p.purchases || 0), 0);
//     const totalRevenue = plans.reduce((sum, p) => sum + ((p.purchases || 0) * (parseFloat(p.price) || 0)), 0);

//     const mostPopular = [...plans].sort((a, b) => (b.purchases || 0) - (a.purchases || 0))[0];
//     const mostExpensive = [...plans].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))[0];

//     const byPlanType = plans.reduce((acc, p) => {
//       const type = p.plan_type || 'paid';
//       acc[type] = (acc[type] || 0) + 1;
//       return acc;
//     }, {});

//     const byAccessType = plans.reduce((acc, p) => {
//       const hotspot = p.access_methods?.hotspot?.enabled;
//       const pppoe = p.access_methods?.pppoe?.enabled;
//       let type = 'none';
//       if (hotspot && pppoe) type = 'both';
//       else if (hotspot) type = 'hotspot';
//       else if (pppoe) type = 'pppoe';
      
//       acc[type] = (acc[type] || 0) + 1;
//       return acc;
//     }, {});

//     return {
//       total: plans.length,
//       active,
//       inactive,
//       available,
//       totalSubscribers,
//       totalRevenue,
//       mostPopular,
//       mostExpensive,
//       byPlanType,
//       byAccessType
//     };
//   }, [plans]);

//   // ==========================================================================
//   // FILTER HANDLERS
//   // ==========================================================================

//   const handleQuickFilter = useCallback((type, value) => {
//     const newValue = filters[type] === value ? 'all' : value;
//     onFilterChange(type, newValue);
//   }, [filters, onFilterChange]);

//   const handleClearAllFilters = useCallback(() => {
//     onSearchChange('');
//     onClearFilters();
//   }, [onSearchChange, onClearFilters]);

//   // ==========================================================================
//   // BULK ACTIONS
//   // ==========================================================================

//   const togglePlanSelection = useCallback((id) => {
//     setSelectedPlans(prev => {
//       const newSelection = prev.includes(id) 
//         ? prev.filter(p => p !== id) 
//         : [...prev, id];
//       setShowBulkActions(newSelection.length > 0);
//       return newSelection;
//     });
//   }, []);

//   const toggleAllPlans = useCallback(() => {
//     setSelectedPlans(prev => {
//       const newSelection = prev.length === plans.length ? [] : plans.map(p => p.id);
//       setShowBulkActions(newSelection.length > 0);
//       return newSelection;
//     });
//   }, [plans]);

//   const clearSelection = useCallback(() => {
//     setSelectedPlans([]);
//     setShowBulkActions(false);
//   }, []);

//   const handleBulkAction = useCallback(async (action) => {
//     if (selectedPlans.length === 0) return;

//     if (action === 'delete') {
//       if (!window.confirm(`Delete ${selectedPlans.length} selected plans? This cannot be undone.`)) {
//         return;
//       }
//     }

//     setShowBulkActions(false);

//     // Process in batches to avoid overwhelming the API
//     const batchSize = 5;
//     for (let i = 0; i < selectedPlans.length; i += batchSize) {
//       const batch = selectedPlans.slice(i, i + batchSize);
//       await Promise.allSettled(
//         batch.map(async (id) => {
//           const plan = plans.find(p => p.id === id);
//           if (!plan) return;

//           switch (action) {
//             case 'activate':
//               if (!plan.active) await onToggleStatus(plan);
//               break;
//             case 'deactivate':
//               if (plan.active) await onToggleStatus(plan);
//               break;
//             case 'duplicate':
//               await onDuplicatePlan(plan);
//               break;
//             case 'delete':
//               await onDeletePlan(plan);
//               break;
//             default:
//               break;
//           }
//         })
//       );
//     }

//     clearSelection();
//   }, [selectedPlans, plans, onToggleStatus, onDuplicatePlan, onDeletePlan, clearSelection]);

//   // ==========================================================================
//   // GRID VIEW RENDERER
//   // ==========================================================================

//   const renderGridView = useCallback(() => {
//     if (plans.length === 0) return null;

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
//         {plans.map(plan => {
//           const priceDisplay = getPriceDisplay(plan);
//           const accessMethods = plan.access_methods || {};
//           const rating = calculateRating(plan.purchases);
//           const popularity = calculatePopularity(plan.purchases);
//           const PopularityIcon = popularity.icon;
//           const isSelected = selectedPlans.includes(plan.id);

//           return (
//             <motion.div
//               key={plan.id}
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               whileHover={{ y: -2 }}
//               className={`
//                 rounded-xl border overflow-hidden cursor-pointer transition-all
//                 ${isSelected
//                   ? 'ring-2 ring-indigo-500 border-indigo-500'
//                   : theme === 'dark'
//                     ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
//                     : 'bg-white border-gray-200 hover:border-gray-300'
//                 }
//               `}
//               onClick={() => togglePlanSelection(plan.id)}
//             >
//               <div className="p-4">
//                 {/* Header */}
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => togglePlanSelection(plan.id)}
//                       onClick={(e) => e.stopPropagation()}
//                       className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                     />
//                     <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
//                   </div>
//                   <AvailabilityBadge
//                     isAvailable={plan.is_available_now || false}
//                     theme={theme}
//                     size="xs"
//                   />
//                 </div>

//                 {/* Plan Info */}
//                 <h3 className="font-semibold text-lg mb-1 line-clamp-1">{plan.name}</h3>
//                 {plan.description && (
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
//                     {plan.description}
//                   </p>
//                 )}

//                 {/* Price */}
//                 <div className={`text-2xl font-bold mb-3 ${priceDisplay.className}`}>
//                   {priceDisplay.main}
//                 </div>

//                 {/* Access Type */}
//                 <div className="mb-3">
//                   <AccessTypeBadge 
//                     accessMethods={accessMethods} 
//                     size="sm" 
//                     theme={theme} 
//                   />
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                   <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
//                     <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
//                     <div className="text-sm font-medium">
//                       {formatNumber(plan.purchases || 0)}
//                     </div>
//                     <div className="text-xs text-gray-500">Subscribers</div>
//                   </div>
//                   <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
//                     <div className="flex justify-center mb-1">
//                       <PopularityIcon className={`w-4 h-4 ${popularity.color}`} />
//                     </div>
//                     <div className="text-sm font-medium">
//                       {rating.toFixed(1)}
//                     </div>
//                     <div className="text-xs text-gray-500">Rating</div>
//                   </div>
//                 </div>

//                 {/* Status Indicators */}
//                 <div className="flex flex-wrap gap-1 mb-3">
//                   <span className={`
//                     inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
//                     ${plan.active
//                       ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
//                       : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
//                     }
//                   `}>
//                     {plan.active ? 'Active' : 'Inactive'}
//                   </span>
//                   {plan.has_time_variant && (
//                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
//                       <Clock className="w-3 h-3" />
//                       Time Restricted
//                     </span>
//                   )}
//                 </div>

//                 {/* Actions */}
//                 <div className="flex justify-end gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onViewDetails(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//                     title="View Details"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onEditPlan(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
//                     title="Edit Plan"
//                   >
//                     <Pencil className="w-4 h-4 text-blue-600" />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDuplicatePlan(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
//                     title="Duplicate Plan"
//                   >
//                     <Plus className="w-4 h-4 text-green-600" />
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onToggleStatus(plan);
//                     }}
//                     className={`
//                       p-2 rounded-lg transition-colors
//                       ${plan.active
//                         ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
//                         : 'hover:bg-green-100 dark:hover:bg-green-900/30'
//                       }
//                     `}
//                     title={plan.active ? "Deactivate" : "Activate"}
//                   >
//                     {plan.active ? (
//                       <XCircle className="w-4 h-4 text-amber-600" />
//                     ) : (
//                       <CheckCircle className="w-4 h-4 text-green-600" />
//                     )}
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDeletePlan(plan);
//                     }}
//                     className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
//                     title="Delete Plan"
//                   >
//                     <Trash2 className="w-4 h-4 text-red-600" />
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>
//     );
//   }, [plans, theme, selectedPlans, togglePlanSelection, onViewDetails, onEditPlan, onDuplicatePlan, onToggleStatus, onDeletePlan]);

//   // ==========================================================================
//   // TABLE VIEW RENDERER
//   // ==========================================================================

//   const renderTableView = useCallback(() => {
//     if (plans.length === 0) return null;

//     return (
//       <div className="overflow-x-auto">
//         <table className="w-full min-w-[1200px]">
//           <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
//             <tr>
//               <th className="px-4 py-3 w-10">
//                 <input
//                   type="checkbox"
//                   checked={selectedPlans.length === plans.length && plans.length > 0}
//                   onChange={toggleAllPlans}
//                   className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
//                 />
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Plan Details
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Price
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Access Type
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Subscribers
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//             {plans.map(plan => (
//               <PlanTableRow
//                 key={plan.id}
//                 plan={plan}
//                 theme={theme}
//                 onViewDetails={onViewDetails}
//                 onEditPlan={onEditPlan}
//                 onDeletePlan={onDeletePlan}
//                 onDuplicatePlan={onDuplicatePlan}
//                 onToggleStatus={onToggleStatus}
//                 isSelected={selectedPlans.includes(plan.id)}
//                 onSelect={togglePlanSelection}
//               />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   }, [plans, theme, selectedPlans, toggleAllPlans, togglePlanSelection, onViewDetails, onEditPlan, onDeletePlan, onDuplicatePlan, onToggleStatus]);

//   // ==========================================================================
//   // RENDER STATS CARDS
//   // ==========================================================================

//   const renderStats = () => {
//     if (plans.length === 0) return null;

//     return (
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//           <div className="flex items-center gap-2 mb-2">
//             <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
//               <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//             </div>
//             <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</span>
//           </div>
//           <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//             {stats.total}
//           </div>
//           <div className="flex items-center gap-2 mt-1 text-xs">
//             <span className="text-green-600 dark:text-green-400">{stats.active} active</span>
//             <span className="text-gray-300 dark:text-gray-600">•</span>
//             <span className="text-red-600 dark:text-red-400">{stats.inactive} inactive</span>
//           </div>
//         </div>

//         <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//           <div className="flex items-center gap-2 mb-2">
//             <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
//               <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
//             </div>
//             <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</span>
//           </div>
//           <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//             {formatNumber(stats.totalSubscribers)}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             Revenue: {formatCurrency(stats.totalRevenue)}
//           </div>
//         </div>

//         <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//           <div className="flex items-center gap-2 mb-2">
//             <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
//               <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//             </div>
//             <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Now</span>
//           </div>
//           <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//             {stats.available}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             {stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0}% of plans
//           </div>
//         </div>

//         <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//           <div className="flex items-center gap-2 mb-2">
//             <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
//               <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//             </div>
//             <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Popular</span>
//           </div>
//           <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate" title={stats.mostPopular?.name}>
//             {stats.mostPopular?.name || 'N/A'}
//           </div>
//           <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//             {formatNumber(stats.mostPopular?.purchases || 0)} subscribers
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ==========================================================================
//   // RENDER FILTERS
//   // ==========================================================================

//   const renderFilters = () => {
//     const hasActiveFilters = searchQuery || 
//       filters.accessType !== 'all' ||
//       filters.planType !== 'all' ||
//       filters.availability !== 'all' ||
//       filters.active !== 'all' ||
//       filters.hasTimeVariant !== 'all';

//     return (
//       <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
//         {/* Search Bar */}
//         <div className="relative mb-4">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search plans by name, category, or description..."
//             value={searchQuery}
//             onChange={(e) => onSearchChange(e.target.value)}
//             className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
//           />
//           {searchQuery && (
//             <button
//               onClick={() => onSearchChange('')}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               <X className="w-5 h-5 text-gray-400" />
//             </button>
//           )}
//         </div>

//         {/* Filter Toggle for Mobile */}
//         {isMobile && (
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="w-full mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between"
//           >
//             <span className="flex items-center gap-2">
//               <Filter className="w-4 h-4" />
//               Filters
//             </span>
//             <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//           </button>
//         )}

//         {/* Filters */}
//         {(showFilters || !isMobile) && (
//           <>
//             <div className="flex flex-wrap items-center gap-2">
//               <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">
//                 Quick Filters:
//               </span>

//               <FilterButton
//                 label="All Plans"
//                 icon={Package}
//                 active={!hasActiveFilters}
//                 onClick={handleClearAllFilters}
//                 color="indigo"
//               />

//               <FilterButton
//                 label="Hotspot"
//                 icon={Wifi}
//                 active={filters.accessType === 'hotspot'}
//                 onClick={() => handleQuickFilter('accessType', 'hotspot')}
//                 color="blue"
//               />

//               <FilterButton
//                 label="PPPoE"
//                 icon={Cable}
//                 active={filters.accessType === 'pppoe'}
//                 onClick={() => handleQuickFilter('accessType', 'pppoe')}
//                 color="green"
//               />

//               <FilterButton
//                 label="Dual"
//                 icon={() => (
//                   <div className="flex">
//                     <Wifi className="w-3.5 h-3.5 -mr-1" />
//                     <Cable className="w-3.5 h-3.5" />
//                   </div>
//                 )}
//                 active={filters.accessType === 'both'}
//                 onClick={() => handleQuickFilter('accessType', 'both')}
//                 color="purple"
//               />

//               <FilterButton
//                 label="Available"
//                 icon={CheckCircle}
//                 active={filters.availability === 'available'}
//                 onClick={() => handleQuickFilter('availability', 'available')}
//                 color="green"
//               />

//               <FilterButton
//                 label="Free Trial"
//                 icon={Clock}
//                 active={filters.planType === 'free_trial'}
//                 onClick={() => handleQuickFilter('planType', 'free_trial')}
//                 color="blue"
//               />

//               <FilterButton
//                 label="Promotional"
//                 icon={Sparkles}
//                 active={filters.planType === 'promotional'}
//                 onClick={() => handleQuickFilter('planType', 'promotional')}
//                 color="purple"
//               />

//               <FilterButton
//                 label="Paid"
//                 icon={DollarSign}
//                 active={filters.planType === 'paid'}
//                 onClick={() => handleQuickFilter('planType', 'paid')}
//                 color="green"
//               />

//               <FilterButton
//                 label="Time Restricted"
//                 icon={Clock}
//                 active={filters.hasTimeVariant === 'yes'}
//                 onClick={() => handleQuickFilter('hasTimeVariant', 'yes')}
//                 color="amber"
//               />

//               <FilterButton
//                 label="Active"
//                 icon={CheckCircle}
//                 active={filters.active === 'active'}
//                 onClick={() => handleQuickFilter('active', 'active')}
//                 color="green"
//               />
//             </div>

//             {/* Filter Summary */}
//             {hasActiveFilters && (
//               <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Showing {plans.length} of {allPlans.length} plans
//                   {searchQuery && ` matching "${searchQuery}"`}
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     );
//   };

//   // ==========================================================================
//   // MAIN RENDER
//   // ==========================================================================

//   if (isLoading && plans.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" />
//               </div>
//             </div>
//             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your plans...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               Internet Plans
//             </h1>
//             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//               Create, manage, and analyze your internet service plans
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Refresh Button */}
//             <button
//               onClick={onRefresh}
//               disabled={isLoading}
//               className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
//               title="Refresh Plans"
//             >
//               <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
//             </button>

//             {/* View Toggle */}
//             <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
//               <button
//                 onClick={() => setViewMode('table')}
//                 className={`p-2 rounded-md transition-colors ${
//                   viewMode === 'table'
//                     ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//                 title="Table View"
//               >
//                 <List className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`p-2 rounded-md transition-colors ${
//                   viewMode === 'grid'
//                     ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//                 title="Grid View"
//               >
//                 <Grid className="w-4 h-4" />
//               </button>
//             </div>

//             <button
//               onClick={onViewAnalytics}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2 text-sm"
//             >
//               <BarChart3 className="w-4 h-4" />
//               Analytics
//             </button>

//             <button
//               onClick={onViewTemplates}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 text-sm"
//             >
//               <Box className="w-4 h-4" />
//               Templates
//             </button>

//             <button
//               onClick={onNewPlan}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 text-sm"
//             >
//               <Plus className="w-4 h-4" />
//               New Plan
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         {renderFilters()}

//         {/* Statistics */}
//         {plans.length > 0 && renderStats()}

//         {/* Bulk Actions Bar */}
//         <AnimatePresence>
//           {showBulkActions && selectedPlans.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between"
//             >
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
//                   {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'} selected
//                 </span>
//                 <button
//                   onClick={clearSelection}
//                   className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
//                 >
//                   Clear selection
//                 </button>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => handleBulkAction('activate')}
//                   className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700"
//                 >
//                   Activate
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('deactivate')}
//                   className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-700"
//                 >
//                   Deactivate
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('duplicate')}
//                   className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
//                 >
//                   Duplicate
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('delete')}
//                   className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Plans Display */}
//         {plans.length === 0 ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-20 px-4 text-center">
//             <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//               <Package className="w-10 h-10 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//               No plans found
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
//               {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== null)
//                 ? "Try adjusting your filters or search query"
//                 : "Get started by creating your first internet plan"
//               }
//             </p>
//             {!searchQuery && Object.values(filters).every(v => v === 'all' || v === null) && (
//               <button
//                 onClick={onNewPlan}
//                 className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
//               >
//                 <Plus className="w-4 h-4" />
//                 Create Your First Plan
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//             {viewMode === 'table' ? renderTableView() : renderGridView()}

//             {/* Footer */}
//             <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
//               <div className="flex items-center gap-2">
//                 <Activity className="w-3.5 h-3.5" />
//                 <span>
//                   Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">
//                     {plans.length}
//                   </span> of <span className="font-semibold">{allPlans.length}</span> plans
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-3.5 h-3.5" />
//                 <span>Sorted by {sortConfig.field} ({sortConfig.direction})</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanList;








// PlanList.js - COMPLETE PRODUCTION READY VERSION WITH FIXED ACCESS TYPE

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, Users, Search,
  Wifi, Cable, BarChart3, Package, Box, Filter,
  ChevronDown, ChevronUp, Clock, DollarSign, Calendar,
  CheckCircle, XCircle, AlertTriangle, Settings,
  Star, Target, TrendingUp, Zap, Shield, Download,
  TrendingDown, Activity, Award, Flame, Crown, Sparkles,
  Heart, ThumbsUp, Gauge, Server, RefreshCw, X,
  Menu, Grid, LayoutGrid, List, Info, Tag, Layers,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, CreditCard,
  Gift, BadgePercent, Infinity, AlertCircle, Check
} from "lucide-react";

// ============================================================================
// CONSTANTS
// ============================================================================

const PLAN_TYPE_LABELS = {
  paid: "Paid",
  free_trial: "Free Trial",
  promotional: "Promotional"
};

const PLAN_TYPE_COLORS = {
  paid: {
    light: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    dark: { bg: "dark:bg-green-900/30", text: "dark:text-green-400", border: "dark:border-green-800" }
  },
  free_trial: {
    light: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
    dark: { bg: "dark:bg-blue-900/30", text: "dark:text-blue-400", border: "dark:border-blue-800" }
  },
  promotional: {
    light: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
    dark: { bg: "dark:bg-purple-900/30", text: "dark:text-purple-400", border: "dark:border-purple-800" }
  }
};

// ============================================================================
// ACCESS TYPE CONFIGURATION - FIXED
// ============================================================================

const ACCESS_TYPE_CONFIG = {
  hotspot: {
    label: 'Hotspot',
    icon: Wifi,
    colors: {
      light: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
      dark: { bg: "dark:bg-blue-900/30", text: "dark:text-blue-400", border: "dark:border-blue-800" }
    }
  },
  pppoe: {
    label: 'PPPoE',
    icon: Cable,
    colors: {
      light: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
      dark: { bg: "dark:bg-green-900/30", text: "dark:text-green-400", border: "dark:border-green-800" }
    }
  },
  both: {
    label: 'Dual Access',
    icon: () => (
      <div className="flex items-center">
        <Wifi className="w-3 h-3 mr-0.5" />
        <Cable className="w-3 h-3" />
      </div>
    ),
    colors: {
      light: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
      dark: { bg: "dark:bg-purple-900/30", text: "dark:text-purple-400", border: "dark:border-purple-800" }
    }
  },
  none: {
    label: 'No Access',
    icon: AlertTriangle,
    colors: {
      light: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
      dark: { bg: "dark:bg-gray-800", text: "dark:text-gray-400", border: "dark:border-gray-700" }
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getThemeClasses = (theme) => ({
  bg: {
    primary: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    hover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    success: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
    warning: theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-100',
    danger: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
    info: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
  },
  text: {
    primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
    secondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    success: theme === 'dark' ? 'text-green-400' : 'text-green-700',
    warning: theme === 'dark' ? 'text-amber-400' : 'text-amber-700',
    danger: theme === 'dark' ? 'text-red-400' : 'text-red-700',
    info: theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
  },
  border: {
    light: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    success: theme === 'dark' ? 'border-green-800' : 'border-green-200',
    warning: theme === 'dark' ? 'border-amber-800' : 'border-amber-200',
    danger: theme === 'dark' ? 'border-red-800' : 'border-red-200',
    info: theme === 'dark' ? 'border-blue-800' : 'border-blue-200'
  }
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-KE').format(value || 0);
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

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

const calculatePopularity = (purchases) => {
  if (purchases >= 1000) return { label: 'Very High', color: 'text-purple-600', icon: Crown };
  if (purchases >= 500) return { label: 'High', color: 'text-green-600', icon: TrendingUp };
  if (purchases >= 100) return { label: 'Medium', color: 'text-blue-600', icon: Activity };
  if (purchases >= 10) return { label: 'Low', color: 'text-amber-600', icon: TrendingDown };
  return { label: 'New', color: 'text-gray-600', icon: Star };
};

// ============================================================================
// HELPER FUNCTION TO DETERMINE ACCESS TYPE - FIXED
// ============================================================================

const getAccessTypeFromPlan = (plan) => {
  const accessMethods = plan.access_methods || {};
  const hotspot = accessMethods.hotspot || { enabled: false };
  const pppoe = accessMethods.pppoe || { enabled: false };
  
  const hotspotEnabled = hotspot.enabled === true;
  const pppoeEnabled = pppoe.enabled === true;
  
  if (hotspotEnabled && pppoeEnabled) return 'both';
  if (hotspotEnabled) return 'hotspot';
  if (pppoeEnabled) return 'pppoe';
  return 'none';
};

// ============================================================================
// PLAN TYPE BADGE COMPONENT
// ============================================================================

const PlanTypeBadge = ({ type, theme = 'light', size = 'sm' }) => {
  const config = {
    paid: {
      label: 'Paid',
      icon: DollarSign,
      colors: PLAN_TYPE_COLORS.paid
    },
    free_trial: {
      label: 'Free Trial',
      icon: Clock,
      colors: PLAN_TYPE_COLORS.free_trial
    },
    promotional: {
      label: 'Promotional',
      icon: Sparkles,
      colors: PLAN_TYPE_COLORS.promotional
    }
  };

  const { label, icon: Icon, colors } = config[type] || config.paid;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${colors.light.bg} ${colors.light.text} ${colors.light.border}
      ${colors.dark.bg} ${colors.dark.text} ${colors.dark.border}
      ${sizeClasses[size]}
    `}>
      <Icon className={iconSizes[size]} />
      {label}
    </span>
  );
};

// ============================================================================
// ACCESS TYPE BADGE COMPONENT - FIXED
// ============================================================================

const AccessTypeBadge = ({ plan, size = 'sm', showLabel = true, theme = 'light' }) => {
  // Get access type directly from plan
  const accessType = getAccessTypeFromPlan(plan);
  const config = ACCESS_TYPE_CONFIG[accessType] || ACCESS_TYPE_CONFIG.none;
  
  const Icon = config.icon;
  const colors = config.colors;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm"
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4"
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium border
      ${colors.light.bg} ${colors.light.text} ${colors.light.border}
      ${colors.dark.bg} ${colors.dark.text} ${colors.dark.border}
      ${sizeClasses[size]}
    `}>
      <Icon className={iconSizes[size]} />
      {showLabel && config.label}
    </span>
  );
};

// ============================================================================
// AVAILABILITY BADGE COMPONENT
// ============================================================================

const AvailabilityBadge = ({ isAvailable, theme = 'light', size = 'sm' }) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm'
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5'
  };

  const colors = isAvailable
    ? {
        bg: 'bg-green-100 dark:bg-green-900/50',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      }
    : {
        bg: 'bg-red-100 dark:bg-red-900/50',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800'
      };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium border
      ${colors.bg} ${colors.text} ${colors.border}
      ${sizeClasses[size]}
    `}>
      {isAvailable ? (
        <CheckCircle className={iconSizes[size]} />
      ) : (
        <XCircle className={iconSizes[size]} />
      )}
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  );
};

// ============================================================================
// STAR RATING COMPONENT
// ============================================================================

const StarRating = ({ rating, size = 'sm' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5"
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${sizeClasses[size]} fill-current text-amber-400`}
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClasses[size]} fill-current text-amber-400`} />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// ============================================================================
// PRICE DISPLAY HELPER
// ============================================================================

const getPriceDisplay = (plan) => {
  const price = parseFloat(plan.price) || 0;
  
  switch (plan.plan_type) {
    case 'free_trial':
      return {
        main: 'Free Trial',
        value: '0.00',
        badge: null,
        className: 'text-blue-600 dark:text-blue-400 font-medium'
      };
    
    case 'promotional':
      if (price === 0) {
        return {
          main: 'Free',
          value: '0.00',
          badge: 'Promo',
          className: 'text-purple-600 dark:text-purple-400'
        };
      }
      return {
        main: formatCurrency(price),
        value: price.toFixed(2),
        badge: 'Promo',
        className: 'text-purple-600 dark:text-purple-400 font-bold'
      };
    
    case 'paid':
    default:
      if (price === 0) {
        return {
          main: 'Free',
          value: '0.00',
          badge: null,
          className: 'text-gray-600 dark:text-gray-400'
        };
      }
      return {
        main: formatCurrency(price),
        value: price.toFixed(2),
        badge: null,
        className: 'text-gray-900 dark:text-white font-bold'
      };
  }
};

// ============================================================================
// FILTER BUTTON COMPONENT
// ============================================================================

const FilterButton = ({ label, icon: Icon, active, onClick, color = 'indigo' }) => {
  const colorClasses = {
    indigo: {
      active: 'bg-indigo-600 text-white border-indigo-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
    },
    blue: {
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
    },
    green: {
      active: 'bg-green-600 text-white border-green-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
    },
    purple: {
      active: 'bg-purple-600 text-white border-purple-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-400'
    },
    amber: {
      active: 'bg-amber-600 text-white border-amber-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
    },
    red: {
      active: 'bg-red-600 text-white border-red-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400'
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        flex items-center gap-1.5 border-2 whitespace-nowrap
        ${active ? colorClasses[color].active : colorClasses[color].inactive}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
};

// ============================================================================
// PLAN TABLE ROW COMPONENT - FIXED ACCESS TYPE
// ============================================================================

const PlanTableRow = ({
  plan,
  theme = 'light',
  onViewDetails,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onToggleStatus,
  isSelected,
  onSelect
}) => {
  const themeClasses = getThemeClasses(theme);
  const rating = calculateRating(plan.purchases);
  const priceDisplay = getPriceDisplay(plan);
  const popularity = calculatePopularity(plan.purchases);
  const PopularityIcon = popularity.icon;
  
  // Get access type for icon display
  const accessType = getAccessTypeFromPlan(plan);
  
  const getIconAndColor = () => {
    switch(accessType) {
      case 'both':
        return {
          icon: (
            <div className="flex items-center gap-0.5">
              <Wifi className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <Cable className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          ),
          bg: 'bg-purple-100 dark:bg-purple-900/30'
        };
      case 'hotspot':
        return {
          icon: <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
          bg: 'bg-blue-100 dark:bg-blue-900/30'
        };
      case 'pppoe':
        return {
          icon: <Cable className="w-4 h-4 text-green-600 dark:text-green-400" />,
          bg: 'bg-green-100 dark:bg-green-900/30'
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-gray-400" />,
          bg: 'bg-gray-100 dark:bg-gray-800'
        };
    }
  };

  const { icon, bg } = getIconAndColor();

  return (
    <tr className={`
      group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
      ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}
    `}>
      {/* Checkbox */}
      <td className="px-4 py-4 whitespace-nowrap w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(plan.id)}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
        />
      </td>

      {/* Plan Info */}
      <td className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${bg}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {plan.name}
              </span>
              <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {plan.category || 'Uncategorized'}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {plan.id?.slice(0, 8)}...
              </span>
            </div>
            {plan.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {plan.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className={priceDisplay.className}>
          {priceDisplay.main}
        </div>
        {priceDisplay.badge && (
          <div className="text-xs mt-1 text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <BadgePercent className="w-3 h-3" />
            {priceDisplay.badge}
          </div>
        )}
      </td>

      {/* Access Type - FIXED */}
      <td className="px-4 py-4 whitespace-nowrap">
        <AccessTypeBadge
          plan={plan}
          size="xs"
          showLabel={true}
          theme={theme}
        />
      </td>

      {/* Subscribers & Rating */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatNumber(plan.purchases || 0)}
          </span>
        </div>
        <StarRating rating={rating} size="xs" />
        <div className="flex items-center gap-1 mt-1">
          <PopularityIcon className={`w-3 h-3 ${popularity.color}`} />
          <span className={`text-xs ${popularity.color}`}>
            {popularity.label}
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <AvailabilityBadge
            isAvailable={plan.is_available_now || false}
            theme={theme}
            size="xs"
          />
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${plan.active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            }
          `}>
            {plan.active ? 'Active' : 'Inactive'}
          </span>
          {plan.has_time_variant && (
            <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <Clock className="w-3 h-3" />
              Time Restricted
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails(plan)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onEditPlan(plan)}
            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title="Edit Plan"
          >
            <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => onDuplicatePlan(plan)}
            className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            title="Duplicate Plan"
          >
            <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
          <button
            onClick={() => onToggleStatus(plan)}
            className={`
              p-1.5 rounded-lg transition-colors
              ${plan.active
                ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
                : 'hover:bg-green-100 dark:hover:bg-green-900/30'
              }
            `}
            title={plan.active ? "Deactivate" : "Activate"}
          >
            {plan.active ? (
              <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </button>
          <button
            onClick={() => onDeletePlan(plan)}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// GRID VIEW CARD COMPONENT - FIXED ACCESS TYPE
// ============================================================================

const GridViewCard = ({
  plan,
  theme,
  isSelected,
  onSelect,
  onViewDetails,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onToggleStatus
}) => {
  const priceDisplay = getPriceDisplay(plan);
  const rating = calculateRating(plan.purchases);
  const popularity = calculatePopularity(plan.purchases);
  const PopularityIcon = popularity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`
        rounded-xl border overflow-hidden cursor-pointer transition-all
        ${isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500'
          : theme === 'dark'
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }
      `}
      onClick={() => onSelect(plan.id)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(plan.id)}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <PlanTypeBadge type={plan.plan_type} theme={theme} size="xs" />
          </div>
          <AvailabilityBadge
            isAvailable={plan.is_available_now || false}
            theme={theme}
            size="xs"
          />
        </div>

        {/* Plan Info */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{plan.name}</h3>
        {plan.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {plan.description}
          </p>
        )}

        {/* Price */}
        <div className={`text-2xl font-bold mb-3 ${priceDisplay.className}`}>
          {priceDisplay.main}
        </div>

        {/* Access Type - FIXED */}
        <div className="mb-3">
          <AccessTypeBadge 
            plan={plan}
            size="sm" 
            theme={theme} 
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <div className="text-sm font-medium">
              {formatNumber(plan.purchases || 0)}
            </div>
            <div className="text-xs text-gray-500">Subscribers</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <div className="flex justify-center mb-1">
              <PopularityIcon className={`w-4 h-4 ${popularity.color}`} />
            </div>
            <div className="text-sm font-medium">
              {rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`
            inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${plan.active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            }
          `}>
            {plan.active ? 'Active' : 'Inactive'}
          </span>
          {plan.has_time_variant && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
              <Clock className="w-3 h-3" />
              Time Restricted
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(plan);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditPlan(plan);
            }}
            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title="Edit Plan"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicatePlan(plan);
            }}
            className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            title="Duplicate Plan"
          >
            <Plus className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(plan);
            }}
            className={`
              p-2 rounded-lg transition-colors
              ${plan.active
                ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
                : 'hover:bg-green-100 dark:hover:bg-green-900/30'
              }
            `}
            title={plan.active ? "Deactivate" : "Activate"}
          >
            {plan.active ? (
              <XCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePlan(plan);
            }}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN PLANLIST COMPONENT
// ============================================================================

const PlanList = ({
  plans = [],
  allPlans = [],
  isLoading = false,
  onEditPlan,
  onViewDetails,
  onDeletePlan,
  onDuplicatePlan,
  onToggleStatus,
  onNewPlan,
  onViewAnalytics,
  onViewTemplates,
  onRefresh,
  theme = 'light',
  isMobile = false,
  searchQuery = '',
  onSearchChange,
  filters = {
    category: 'all',
    planType: 'all',
    accessType: 'all',
    availability: 'all',
    active: 'all',
    hasTimeVariant: 'all',
    routerSpecific: 'all',
    priceRange: null
  },
  onFilterChange,
  onClearFilters,
  sortConfig = { field: 'name', direction: 'asc' },
  onSort
}) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(!isMobile);

  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  const stats = useMemo(() => {
    const active = plans.filter(p => p.active).length;
    const inactive = plans.filter(p => !p.active).length;
    const available = plans.filter(p => p.is_available_now).length;
    const totalSubscribers = plans.reduce((sum, p) => sum + (p.purchases || 0), 0);
    const totalRevenue = plans.reduce((sum, p) => sum + ((p.purchases || 0) * (parseFloat(p.price) || 0)), 0);

    const mostPopular = [...plans].sort((a, b) => (b.purchases || 0) - (a.purchases || 0))[0];
    const mostExpensive = [...plans].sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0))[0];

    const byPlanType = plans.reduce((acc, p) => {
      const type = p.plan_type || 'paid';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: plans.length,
      active,
      inactive,
      available,
      totalSubscribers,
      totalRevenue,
      mostPopular,
      mostExpensive,
      byPlanType
    };
  }, [plans]);

  // ==========================================================================
  // FILTER HANDLERS
  // ==========================================================================

  const handleQuickFilter = useCallback((type, value) => {
    const newValue = filters[type] === value ? 'all' : value;
    onFilterChange(type, newValue);
  }, [filters, onFilterChange]);

  const handleClearAllFilters = useCallback(() => {
    onSearchChange('');
    onClearFilters();
  }, [onSearchChange, onClearFilters]);

  // ==========================================================================
  // BULK ACTIONS
  // ==========================================================================

  const togglePlanSelection = useCallback((id) => {
    setSelectedPlans(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  const toggleAllPlans = useCallback(() => {
    setSelectedPlans(prev => {
      const newSelection = prev.length === plans.length ? [] : plans.map(p => p.id);
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  }, [plans]);

  const clearSelection = useCallback(() => {
    setSelectedPlans([]);
    setShowBulkActions(false);
  }, []);

  const handleBulkAction = useCallback(async (action) => {
    if (selectedPlans.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Delete ${selectedPlans.length} selected plans? This cannot be undone.`)) {
        return;
      }
    }

    setShowBulkActions(false);

    const batchSize = 5;
    for (let i = 0; i < selectedPlans.length; i += batchSize) {
      const batch = selectedPlans.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (id) => {
          const plan = plans.find(p => p.id === id);
          if (!plan) return;

          switch (action) {
            case 'activate':
              if (!plan.active) await onToggleStatus(plan);
              break;
            case 'deactivate':
              if (plan.active) await onToggleStatus(plan);
              break;
            case 'duplicate':
              await onDuplicatePlan(plan);
              break;
            case 'delete':
              await onDeletePlan(plan);
              break;
            default:
              break;
          }
        })
      );
    }

    clearSelection();
  }, [selectedPlans, plans, onToggleStatus, onDuplicatePlan, onDeletePlan, clearSelection]);

  // ==========================================================================
  // GRID VIEW RENDERER
  // ==========================================================================

  const renderGridView = useCallback(() => {
    if (plans.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {plans.map(plan => (
          <GridViewCard
            key={plan.id}
            plan={plan}
            theme={theme}
            isSelected={selectedPlans.includes(plan.id)}
            onSelect={togglePlanSelection}
            onViewDetails={onViewDetails}
            onEditPlan={onEditPlan}
            onDeletePlan={onDeletePlan}
            onDuplicatePlan={onDuplicatePlan}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    );
  }, [plans, theme, selectedPlans, togglePlanSelection, onViewDetails, onEditPlan, onDeletePlan, onDuplicatePlan, onToggleStatus]);

  // ==========================================================================
  // TABLE VIEW RENDERER
  // ==========================================================================

  const renderTableView = useCallback(() => {
    if (plans.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedPlans.length === plans.length && plans.length > 0}
                  onChange={toggleAllPlans}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Plan Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Access Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Subscribers
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {plans.map(plan => (
              <PlanTableRow
                key={plan.id}
                plan={plan}
                theme={theme}
                onViewDetails={onViewDetails}
                onEditPlan={onEditPlan}
                onDeletePlan={onDeletePlan}
                onDuplicatePlan={onDuplicatePlan}
                onToggleStatus={onToggleStatus}
                isSelected={selectedPlans.includes(plan.id)}
                onSelect={togglePlanSelection}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [plans, theme, selectedPlans, toggleAllPlans, togglePlanSelection, onViewDetails, onEditPlan, onDeletePlan, onDuplicatePlan, onToggleStatus]);

  // ==========================================================================
  // RENDER STATS CARDS
  // ==========================================================================

  const renderStats = () => {
    if (plans.length === 0) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.total}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-green-600 dark:text-green-400">{stats.active} active</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-red-600 dark:text-red-400">{stats.inactive} inactive</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatNumber(stats.totalSubscribers)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Revenue: {formatCurrency(stats.totalRevenue)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Now</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.available}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0}% of plans
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Most Popular</span>
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 truncate" title={stats.mostPopular?.name}>
            {stats.mostPopular?.name || 'N/A'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatNumber(stats.mostPopular?.purchases || 0)} subscribers
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER FILTERS
  // ==========================================================================

  const renderFilters = () => {
    const hasActiveFilters = searchQuery || 
      filters.accessType !== 'all' ||
      filters.planType !== 'all' ||
      filters.availability !== 'all' ||
      filters.active !== 'all' ||
      filters.hasTimeVariant !== 'all';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search plans by name, category, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle for Mobile */}
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Filters */}
        {(showFilters || !isMobile) && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-1">
                Quick Filters:
              </span>

              <FilterButton
                label="All Plans"
                icon={Package}
                active={!hasActiveFilters}
                onClick={handleClearAllFilters}
                color="indigo"
              />

              <FilterButton
                label="Hotspot"
                icon={Wifi}
                active={filters.accessType === 'hotspot'}
                onClick={() => handleQuickFilter('accessType', 'hotspot')}
                color="blue"
              />

              <FilterButton
                label="PPPoE"
                icon={Cable}
                active={filters.accessType === 'pppoe'}
                onClick={() => handleQuickFilter('accessType', 'pppoe')}
                color="green"
              />

              <FilterButton
                label="Dual"
                icon={() => (
                  <div className="flex">
                    <Wifi className="w-3.5 h-3.5 -mr-1" />
                    <Cable className="w-3.5 h-3.5" />
                  </div>
                )}
                active={filters.accessType === 'both'}
                onClick={() => handleQuickFilter('accessType', 'both')}
                color="purple"
              />

              <FilterButton
                label="Available"
                icon={CheckCircle}
                active={filters.availability === 'available'}
                onClick={() => handleQuickFilter('availability', 'available')}
                color="green"
              />

              <FilterButton
                label="Free Trial"
                icon={Clock}
                active={filters.planType === 'free_trial'}
                onClick={() => handleQuickFilter('planType', 'free_trial')}
                color="blue"
              />

              <FilterButton
                label="Promotional"
                icon={Sparkles}
                active={filters.planType === 'promotional'}
                onClick={() => handleQuickFilter('planType', 'promotional')}
                color="purple"
              />

              <FilterButton
                label="Paid"
                icon={DollarSign}
                active={filters.planType === 'paid'}
                onClick={() => handleQuickFilter('planType', 'paid')}
                color="green"
              />

              <FilterButton
                label="Time Restricted"
                icon={Clock}
                active={filters.hasTimeVariant === 'yes'}
                onClick={() => handleQuickFilter('hasTimeVariant', 'yes')}
                color="amber"
              />

              <FilterButton
                label="Active"
                icon={CheckCircle}
                active={filters.active === 'active'}
                onClick={() => handleQuickFilter('active', 'active')}
                color="green"
              />
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {plans.length} of {allPlans.length} plans
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  if (isLoading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-2xl font-bold text-teal-600 dark:text-teal-400">
              Service Packages
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create, manage, and analyze your internet service plans
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Plans"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onViewAnalytics}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2 text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>

            <button
              onClick={onViewTemplates}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 text-sm"
            >
              <Box className="w-4 h-4" />
              Templates
            </button>

            <button
              onClick={onNewPlan}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </button>
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Statistics */}
        {plans.length > 0 && renderStats()}

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {showBulkActions && selectedPlans.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs hover:bg-amber-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('duplicate')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Display */}
        {plans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-20 px-4 text-center">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No plans found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== null)
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first internet plan"
              }
            </p>
            {!searchQuery && Object.values(filters).every(v => v === 'all' || v === null) && (
              <button
                onClick={onNewPlan}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Plan
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {viewMode === 'table' ? renderTableView() : renderGridView()}

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                <span>
                  Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {plans.length}
                  </span> of <span className="font-semibold">{allPlans.length}</span> plans
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sorted by {sortConfig.field} ({sortConfig.direction})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanList;