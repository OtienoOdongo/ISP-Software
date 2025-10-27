






// import React, { useState, useEffect, useMemo } from "react";
// import Chart from "react-apexcharts";
// import { motion, AnimatePresence } from "framer-motion";
// import { BarChart, LineChart, PieChart, Server, Users, ChevronDown, ChevronUp } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../api";
// import { useTheme } from "../../context/ThemeContext";

// // Responsive Dropdown Component
// const ResponsiveDropdown = ({ 
//   isOpen, 
//   onToggle, 
//   children, 
//   trigger, 
//   position = "left",
//   className = "",
//   mobileFullWidth = true
// }) => {
//   const { theme } = useTheme();
  
//   return (
//     <div className={`relative ${className}`}>
//       {/* Trigger */}
//       <div onClick={onToggle} className="cursor-pointer">
//         {trigger}
//       </div>

//       {/* Dropdown Content */}
//       <AnimatePresence>
//         {isOpen && (
//           <>
//             {/* Backdrop for mobile */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//               onClick={onToggle}
//             />
            
//             {/* Dropdown Panel */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: -10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: -10 }}
//               transition={{ duration: 0.2 }}
//               className={`
//                 absolute z-50 mt-2 rounded-lg shadow-lg border
//                 ${theme === 'dark' 
//                   ? 'bg-dark-background-secondary border-dark-border-medium' 
//                   : 'bg-white border-gray-200'
//                 }
//                 ${position === 'right' ? 'right-0' : 'left-0'}
//                 ${mobileFullWidth 
//                   ? 'w-screen max-w-xs sm:max-w-md md:max-w-lg lg:w-auto lg:min-w-[200px]' 
//                   : 'min-w-[200px]'
//                 }
//                 lg:max-h-96 overflow-y-auto
//               `}
//               style={{
//                 maxHeight: 'calc(100vh - 200px)'
//               }}
//             >
//               {children}
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// // Enhanced Select Component
// const EnhancedSelect = ({ 
//   value, 
//   onChange, 
//   options, 
//   placeholder = "Select an option",
//   className = "",
//   disabled = false
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { theme } = useTheme();
  
//   const textColor = theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary';
//   const borderColor = theme === 'dark' ? 'border-dark-border-medium' : 'border-light-border-medium';
//   const bgColor = theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white';

//   const selectedOption = options.find(opt => opt.value === value) || 
//                        options.find(opt => opt === value);

//   return (
//     <ResponsiveDropdown
//       isOpen={isOpen}
//       onToggle={() => !disabled && setIsOpen(!isOpen)}
//       trigger={
//         <div className={`
//           flex items-center justify-between w-full px-4 py-2 rounded-lg border
//           ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
//           ${bgColor} ${borderColor} ${textColor} ${className}
//         `}>
//           <span className="truncate">
//             {selectedOption ? (selectedOption.label || selectedOption) : placeholder}
//           </span>
//           <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//         </div>
//       }
//       mobileFullWidth={true}
//     >
//       <div className="py-1 max-h-60 overflow-y-auto">
//         {options.map((option, index) => {
//           const optionValue = option.value || option;
//           const optionLabel = option.label || option;
//           const isSelected = value === optionValue;
          
//           return (
//             <div
//               key={index}
//               onClick={() => {
//                 onChange(optionValue);
//                 setIsOpen(false);
//               }}
//               className={`
//                 px-4 py-2 cursor-pointer transition-colors
//                 ${isSelected 
//                   ? theme === 'dark' 
//                     ? 'bg-dark-primary-600 text-white' 
//                     : 'bg-teal-600 text-white'
//                   : theme === 'dark'
//                     ? 'hover:bg-dark-background-tertiary'
//                     : 'hover:bg-gray-100'
//                 }
//               `}
//             >
//               {optionLabel}
//             </div>
//           );
//         })}
//       </div>
//     </ResponsiveDropdown>
//   );
// };

// // Theme-aware chart configuration generator
// const getChartOptions = (theme) => {
//   const textColor = theme === 'dark' ? '#f9fafb' : '#1f2937';
//   const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
//   const backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff';
  
//   const baseOptions = {
//     theme: {
//       mode: theme
//     },
//     chart: {
//       background: backgroundColor,
//       foreColor: textColor,
//       toolbar: {
//         show: true,
//         tools: {
//           download: true,
//           selection: true,
//           zoom: true,
//           zoomin: true,
//           zoomout: true,
//           pan: true,
//           reset: true
//         }
//       }
//     },
//     grid: {
//       borderColor: gridColor,
//       strokeDashArray: 4,
//     },
//     legend: {
//       labels: {
//         colors: textColor
//       }
//     },
//     tooltip: {
//       theme: theme,
//       style: {
//         fontSize: '12px'
//       }
//     }
//   };

//   return {
//     bar: {
//       ...baseOptions,
//       chart: {
//         ...baseOptions.chart,
//         type: "bar",
//         animations: { enabled: true, speed: 800 }
//       },
//       plotOptions: { 
//         bar: { 
//           horizontal: false, 
//           columnWidth: "60%", 
//           endingShape: "rounded",
//           borderRadius: 4
//         } 
//       },
//       xaxis: {
//         labels: {
//           style: {
//             colors: textColor
//           }
//         }
//       },
//       yaxis: {
//         labels: {
//           style: {
//             colors: textColor
//           }
//         }
//       },
//       colors: theme === 'dark' 
//         ? ['#3b82f6', '#10b981', '#f59e0b'] 
//         : ['#1E90FF', '#32CD32', '#FFD700']
//     },
//     line: {
//       ...baseOptions,
//       chart: {
//         ...baseOptions.chart,
//         type: "line",
//         zoom: { enabled: true },
//         animations: { enabled: true, speed: 800 }
//       },
//       stroke: { curve: "smooth", width: 3 },
//       markers: { size: 5 },
//       xaxis: {
//         labels: {
//           style: {
//             colors: textColor
//           }
//         }
//       },
//       yaxis: {
//         labels: {
//           style: {
//             colors: textColor
//           }
//         }
//       },
//       colors: theme === 'dark' 
//         ? ['#ef4444', '#8b5cf6'] 
//         : ['#FF6347', '#4682B4']
//     },
//     pie: {
//       ...baseOptions,
//       chart: {
//         ...baseOptions.chart,
//         type: "pie"
//       },
//       legend: {
//         position: "bottom",
//         labels: {
//           colors: textColor
//         }
//       },
//       colors: theme === 'dark' 
//         ? ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'] 
//         : ['#32CD32', '#4682B4', '#FFD700', '#FF6347']
//     }
//   };
// };

// // Theme-aware styling classes
// const getThemeClasses = (theme) => ({
//   bg: {
//     primary: theme === 'dark' ? 'bg-dark-background-primary' : 'bg-light-background-primary',
//     card: theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white',
//   },
//   text: {
//     primary: theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary',
//     secondary: theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary',
//   },
//   border: {
//     card: theme === 'dark' ? 'border-dark-border-light' : 'border-light-border-light',
//   },
//   input: theme === 'dark' 
//     ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary' 
//     : 'bg-white border-gray-300 text-gray-900'
// });

// const PlanAnalytics = () => {
//   const { theme } = useTheme();
//   const themeClasses = getThemeClasses(theme);
//   const chartOptions = getChartOptions(theme);
  
//   const [plansData, setPlansData] = useState([]);
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [isLoading, setIsLoading] = useState(true);
//   const [timeRange, setTimeRange] = useState("30d");
  
//   const categories = useMemo(() => [
//     { value: "All", label: "All Categories" },
//     { value: "Residential", label: "Residential" },
//     { value: "Business", label: "Business" },
//     { value: "Promotional", label: "Promotional" },
//     { value: "Enterprise", label: "Enterprise" }
//   ], []);

//   const timeRanges = useMemo(() => [
//     { value: "7d", label: "Last 7 days" },
//     { value: "30d", label: "Last 30 days" },
//     { value: "90d", label: "Last 90 days" },
//     { value: "1y", label: "Last year" }
//   ], []);

//   // Memoized data processing for better performance
//   const { filteredPlans, chartData } = useMemo(() => {
//     const filtered = plansData.filter(
//       (plan) => filterCategory === "All" || plan.category === filterCategory
//     );

//     const planNames = filtered.map((plan) => plan.name);
//     const sales = filtered.map((plan) => plan.purchases || 0);
//     const activeUsers = filtered.map((plan) => Object.keys(plan.client_sessions || {}).length);
//     const revenue = filtered.map((plan) => (plan.price || 0) * (plan.purchases || 0));
//     const bandwidthUsage = filtered.map((plan) => parseFloat(plan.downloadSpeed?.value || 0));
//     const usageLimitHours = filtered.map((plan) =>
//       plan.usageLimit?.unit === "Hours" ? parseInt(plan.usageLimit.value || 0) : 720
//     );

//     const categoryCounts = categories.slice(1).map(
//       (cat) => plansData.filter((plan) => plan.category === cat.value).length
//     );

//     return {
//       filteredPlans: filtered,
//       chartData: {
//         planNames,
//         sales,
//         activeUsers,
//         revenue,
//         bandwidthUsage,
//         usageLimitHours,
//         categoryCounts
//       }
//     };
//   }, [plansData, filterCategory, categories]);

//   // Chart series configurations
//   const barChartSeries = useMemo(() => [
//     { name: "Sales", data: chartData.sales },
//     { name: "Active Users", data: chartData.activeUsers },
//     { name: "Revenue", data: chartData.revenue },
//   ], [chartData]);

//   const lineChartSeries = useMemo(() => [
//     { name: "Bandwidth Usage (Mbps)", data: chartData.bandwidthUsage },
//     { name: "Usage Limit (Hours)", data: chartData.usageLimitHours },
//   ], [chartData]);

//   const pieChartSeries = useMemo(() => chartData.categoryCounts, [chartData]);

//   // Enhanced chart options with theme support
//   const enhancedBarChartOptions = useMemo(() => ({
//     ...chartOptions.bar,
//     xaxis: {
//       categories: chartData.planNames,
//       title: { 
//         text: "Plans",
//         style: {
//           color: theme === 'dark' ? '#f9fafb' : '#1f2937'
//         }
//       },
//       labels: {
//         style: {
//           colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
//         },
//         rotate: -45,
//         hideOverlappingLabels: true,
//         maxHeight: 120
//       }
//     },
//     yaxis: [
//       { 
//         title: { 
//           text: "Counts",
//           style: {
//             color: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         },
//         labels: {
//           style: {
//             colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         }
//       },
//       { 
//         opposite: true, 
//         title: { 
//           text: "Revenue (Ksh)",
//           style: {
//             color: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         },
//         labels: {
//           style: {
//             colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           },
//           formatter: (value) => value.toLocaleString()
//         }
//       },
//     ],
//     tooltip: {
//       ...chartOptions.bar.tooltip,
//       y: [
//         { formatter: (val) => `${val} sales` },
//         { formatter: (val) => `${val} users` },
//         { formatter: (val) => `Ksh ${val.toLocaleString()}` },
//       ],
//     },
//   }), [chartOptions.bar, chartData.planNames, theme]);

//   const enhancedLineChartOptions = useMemo(() => ({
//     ...chartOptions.line,
//     xaxis: {
//       categories: chartData.planNames,
//       title: { 
//         text: "Plans",
//         style: {
//           color: theme === 'dark' ? '#f9fafb' : '#1f2937'
//         }
//       },
//       labels: {
//         style: {
//           colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
//         },
//         rotate: -45,
//         hideOverlappingLabels: true,
//         maxHeight: 120
//       }
//     },
//     yaxis: [
//       { 
//         title: { 
//           text: "Bandwidth (Mbps)",
//           style: {
//             color: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         },
//         min: 0,
//         labels: {
//           style: {
//             colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         }
//       },
//       { 
//         opposite: true, 
//         title: { 
//           text: "Usage Limit (Hours)",
//           style: {
//             color: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         },
//         min: 0,
//         labels: {
//           style: {
//             colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
//           }
//         }
//       },
//     ],
//     tooltip: {
//       ...chartOptions.line.tooltip,
//       y: [
//         { formatter: (val) => `${val} Mbps` },
//         { formatter: (val) => `${val} hours (~${(val / 24).toFixed(1)} days)` },
//       ],
//     },
//   }), [chartOptions.line, chartData.planNames, theme]);

//   const enhancedPieChartOptions = useMemo(() => ({
//     ...chartOptions.pie,
//     labels: categories.slice(1).map(cat => cat.label),
//     tooltip: { 
//       ...chartOptions.pie.tooltip,
//       y: { formatter: (val) => `${val} plans` } 
//     },
//   }), [chartOptions.pie, categories]);

//   // Data fetching
//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsLoading(true);
//       try {
//         const response = await api.get("/api/internet_plans/plan_analytics/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         setPlansData(plansData);
//         if (response.data.message) toast.info(response.data.message);
//       } catch (error) {
//         console.error("Error fetching analytics data:", error);
//         toast.error("Failed to load analytics data. Please try again later.");
//         setPlansData([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   // Key metrics calculation
//   const keyMetrics = useMemo(() => {
//     const totalRevenue = chartData.revenue.reduce((sum, rev) => sum + rev, 0);
//     const totalSubscriptions = chartData.sales.reduce((sum, sales) => sum + sales, 0);
//     const avgBandwidth = chartData.bandwidthUsage.length > 0 
//       ? chartData.bandwidthUsage.reduce((sum, bw) => sum + bw, 0) / chartData.bandwidthUsage.length 
//       : 0;
//     const activePlans = filteredPlans.filter(plan => plan.active).length;

//     return {
//       totalRevenue,
//       totalSubscriptions,
//       avgBandwidth: avgBandwidth.toFixed(1),
//       activePlans,
//       totalPlans: filteredPlans.length
//     };
//   }, [chartData, filteredPlans]);

//   if (isLoading) {
//     return (
//       <div className={`p-4 sm:p-6 min-h-screen theme-transition flex items-center justify-center ${themeClasses.bg.primary}`}>
//         <motion.div 
//           animate={{ rotate: 360 }} 
//           transition={{ repeat: Infinity, duration: 1 }}
//           className="flex flex-col items-center"
//         >
//           <Server className="w-12 h-12 text-teal-600 mb-4" />
//           <p className={`theme-transition ${themeClasses.text.secondary}`}>Loading analytics...</p>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className={`p-4 sm:p-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
//       <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      
//       {/* Header Section */}
//       <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
//         <div className="flex items-center space-x-4">
//           <h1 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
//             Plan Analytics Dashboard
//           </h1>
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
//           {/* Category Filter Dropdown */}
//           <div className="w-full sm:w-48">
//             <EnhancedSelect
//               value={filterCategory}
//               onChange={setFilterCategory}
//               options={categories}
//               placeholder="Select Category"
//             />
//           </div>
          
//           {/* Time Range Dropdown */}
//           <div className="w-full sm:w-48">
//             <EnhancedSelect
//               value={timeRange}
//               onChange={setTimeRange}
//               options={timeRanges}
//               placeholder="Select Time Range"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Key Metrics Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
//         <motion.div 
//           className={`p-4 sm:p-6 rounded-xl shadow-lg theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="flex items-center">
//             <div className={`p-3 rounded-lg ${
//               theme === 'dark' ? 'bg-dark-primary-900' : 'bg-teal-100'
//             }`}>
//               <BarChart className={`w-6 h-6 ${theme === 'dark' ? 'text-dark-primary-400' : 'text-teal-600'}`} />
//             </div>
//             <div className="ml-4 flex-1">
//               <p className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Total Revenue</p>
//               <p className={`text-2xl font-bold theme-transition ${themeClasses.text.primary}`}>
//                 Ksh {keyMetrics.totalRevenue.toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </motion.div>

//         <motion.div 
//           className={`p-4 sm:p-6 rounded-xl shadow-lg theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//         >
//           <div className="flex items-center">
//             <div className={`p-3 rounded-lg ${
//               theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
//             }`}>
//               <Users className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
//             </div>
//             <div className="ml-4 flex-1">
//               <p className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Total Subscriptions</p>
//               <p className={`text-2xl font-bold theme-transition ${themeClasses.text.primary}`}>
//                 {keyMetrics.totalSubscriptions}
//               </p>
//             </div>
//           </div>
//         </motion.div>

//         <motion.div 
//           className={`p-4 sm:p-6 rounded-xl shadow-lg theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//         >
//           <div className="flex items-center">
//             <div className={`p-3 rounded-lg ${
//               theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
//             }`}>
//               <Server className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
//             </div>
//             <div className="ml-4 flex-1">
//               <p className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Avg Bandwidth</p>
//               <p className={`text-2xl font-bold theme-transition ${themeClasses.text.primary}`}>
//                 {keyMetrics.avgBandwidth} Mbps
//               </p>
//             </div>
//           </div>
//         </motion.div>

//         <motion.div 
//           className={`p-4 sm:p-6 rounded-xl shadow-lg theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//         >
//           <div className="flex items-center">
//             <div className={`p-3 rounded-lg ${
//               theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'
//             }`}>
//               <PieChart className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
//             </div>
//             <div className="ml-4 flex-1">
//               <p className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Active Plans</p>
//               <p className={`text-2xl font-bold theme-transition ${themeClasses.text.primary}`}>
//                 {keyMetrics.activePlans}/{keyMetrics.totalPlans}
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {plansData.length === 0 ? (
//         <motion.div
//           className={`rounded-xl shadow-lg p-6 text-center theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h2 className={`text-xl font-semibold theme-transition ${themeClasses.text.primary} mb-2`}>
//             No Analytics Data Available
//           </h2>
//           <p className={`theme-transition ${themeClasses.text.secondary}`}>
//             It looks like there are no plans yet. Create some plans to start seeing analytics!
//           </p>
//         </motion.div>
//       ) : (
//         <div className="space-y-6">
//           {/* Bar Chart - Plan Popularity & Revenue */}
//           <motion.div
//             className={`rounded-xl shadow-lg p-4 sm:p-6 theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <h2 className={`text-lg sm:text-xl font-semibold theme-transition ${themeClasses.text.primary} mb-4 flex items-center`}>
//               <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mr-2" /> 
//               Plan Popularity & Revenue
//             </h2>
//             <div className="h-64 sm:h-80">
//               <Chart 
//                 options={enhancedBarChartOptions} 
//                 series={barChartSeries} 
//                 type="bar" 
//                 height="100%" 
//                 width="100%"
//               />
//             </div>
//           </motion.div>

//           {/* Line Chart - Network Performance & Usage */}
//           <motion.div
//             className={`rounded-xl shadow-lg p-4 sm:p-6 theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <h2 className={`text-lg sm:text-xl font-semibold theme-transition ${themeClasses.text.primary} mb-4 flex items-center`}>
//               <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mr-2" /> 
//               Network Performance & Usage
//             </h2>
//             <div className="h-64 sm:h-80">
//               <Chart 
//                 options={enhancedLineChartOptions} 
//                 series={lineChartSeries} 
//                 type="line" 
//                 height="100%" 
//                 width="100%"
//               />
//             </div>
//           </motion.div>

//           {/* Pie Chart - Category Distribution */}
//           <motion.div
//             className={`rounded-xl shadow-lg p-4 sm:p-6 theme-transition ${themeClasses.bg.card} ${themeClasses.border.card}`}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//           >
//             <h2 className={`text-lg sm:text-xl font-semibold theme-transition ${themeClasses.text.primary} mb-4 flex items-center`}>
//               <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mr-2" /> 
//               Category Distribution
//             </h2>
//             <div className="h-64 sm:h-80">
//               <Chart 
//                 options={enhancedPieChartOptions} 
//                 series={pieChartSeries} 
//                 type="pie" 
//                 height="100%" 
//                 width="100%"
//               />
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlanAnalytics;







import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, LineChart, PieChart, Server, Users, ChevronDown, ChevronUp, Plus, Filter, Calendar } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

// Responsive Dropdown Component
const ResponsiveDropdown = ({ 
  isOpen, 
  onToggle, 
  children, 
  trigger, 
  position = "left",
  className = "",
  mobileFullWidth = true
}) => {
  const { theme } = useTheme();
  
  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onToggle}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute z-50 mt-2 rounded-xl shadow-lg border backdrop-blur-md
                ${theme === 'dark' 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200'
                }
                ${position === 'right' ? 'right-0' : 'left-0'}
                ${mobileFullWidth 
                  ? 'w-screen max-w-xs sm:max-w-md md:max-w-lg lg:w-auto lg:min-w-[200px]' 
                  : 'min-w-[200px]'
                }
                lg:max-h-96 overflow-y-auto
              `}
              style={{
                maxHeight: 'calc(100vh - 200px)'
              }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Select Component
const EnhancedSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const bgColor = theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80';

  const selectedOption = options.find(opt => opt.value === value) || 
                       options.find(opt => opt === value);

  return (
    <ResponsiveDropdown
      isOpen={isOpen}
      onToggle={() => !disabled && setIsOpen(!isOpen)}
      trigger={
        <div className={`
          flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 backdrop-blur-md
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-indigo-400 transition-colors'}
          ${bgColor} ${borderColor} ${textColor} ${className}
        `}>
          <span className="truncate flex items-center gap-2">
            {selectedOption ? (selectedOption.label || selectedOption) : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      }
      mobileFullWidth={true}
    >
      <div className="py-1 max-h-60 overflow-y-auto">
        {options.map((option, index) => {
          const optionValue = option.value || option;
          const optionLabel = option.label || option;
          const isSelected = value === optionValue;
          
          return (
            <div
              key={index}
              onClick={() => {
                onChange(optionValue);
                setIsOpen(false);
              }}
              className={`
                px-4 py-3 cursor-pointer transition-all duration-200 border-l-4
                ${isSelected 
                  ? theme === 'dark' 
                    ? 'bg-indigo-600 text-white border-indigo-400' 
                    : 'bg-indigo-600 text-white border-indigo-400'
                  : theme === 'dark'
                    ? 'hover:bg-gray-700/80 border-transparent hover:border-gray-500'
                    : 'hover:bg-gray-100/80 border-transparent hover:border-gray-300'
                }
              `}
            >
              {optionLabel}
            </div>
          );
        })}
      </div>
    </ResponsiveDropdown>
  );
};

// Create Plan Button Component - Only shows when no data exists
const CreatePlanButton = ({ onClick, theme }) => (
  <motion.button
    onClick={onClick}
    className={`
      group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold
      transition-all duration-300 transform hover:scale-105
      ${theme === 'dark' 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg' 
        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg'
      }
    `}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
    Create Your First Plan
  </motion.button>
);

// Theme-aware chart configuration generator
const getChartOptions = (theme) => {
  const textColor = theme === 'dark' ? '#f9fafb' : '#1f2937';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const backgroundColor = theme === 'dark' ? 'transparent' : 'transparent';
  
  const baseOptions = {
    theme: {
      mode: theme
    },
    chart: {
      background: backgroundColor,
      foreColor: textColor,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
    },
    legend: {
      labels: {
        colors: textColor
      }
    },
    tooltip: {
      theme: theme,
      style: {
        fontSize: '12px'
      }
    }
  };

  return {
    bar: {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: "bar",
      },
      plotOptions: { 
        bar: { 
          horizontal: false, 
          columnWidth: "60%", 
          endingShape: "rounded",
          borderRadius: 6
        } 
      },
      xaxis: {
        labels: {
          style: {
            colors: textColor
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: textColor
          }
        }
      },
      colors: theme === 'dark' 
        ? ['#6366f1', '#10b981', '#f59e0b'] 
        : ['#6366f1', '#10b981', '#f59e0b']
    },
    line: {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: "line",
        zoom: { enabled: true },
      },
      stroke: { curve: "smooth", width: 3 },
      markers: { size: 5 },
      xaxis: {
        labels: {
          style: {
            colors: textColor
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: textColor
          }
        }
      },
      colors: theme === 'dark' 
        ? ['#ef4444', '#8b5cf6'] 
        : ['#ef4444', '#8b5cf6']
    },
    pie: {
      ...baseOptions,
      chart: {
        ...baseOptions.chart,
        type: "pie"
      },
      legend: {
        position: "bottom",
        labels: {
          colors: textColor
        }
      },
      colors: theme === 'dark' 
        ? ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'] 
        : ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6']
    }
  };
};

const PlanAnalytics = () => {
  const { theme } = useTheme();
  const chartOptions = getChartOptions(theme);
  
  const [plansData, setPlansData] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  
  const categories = useMemo(() => [
    { value: "All", label: "All Categories", icon: Filter },
    { value: "Residential", label: "Residential" },
    { value: "Business", label: "Business" },
    { value: "Promotional", label: "Promotional" },
    { value: "Enterprise", label: "Enterprise" }
  ], []);

  const timeRanges = useMemo(() => [
    { value: "7d", label: "Last 7 days", icon: Calendar },
    { value: "30d", label: "Last 30 days", icon: Calendar },
    { value: "90d", label: "Last 90 days", icon: Calendar },
    { value: "1y", label: "Last year", icon: Calendar }
  ], []);

  // Memoized data processing for better performance
  const { filteredPlans, chartData } = useMemo(() => {
    const filtered = plansData.filter(
      (plan) => filterCategory === "All" || plan.category === filterCategory
    );

    const planNames = filtered.map((plan) => plan.name);
    const sales = filtered.map((plan) => plan.purchases || 0);
    const activeUsers = filtered.map((plan) => Object.keys(plan.client_sessions || {}).length);
    const revenue = filtered.map((plan) => (plan.price || 0) * (plan.purchases || 0));
    const bandwidthUsage = filtered.map((plan) => parseFloat(plan.downloadSpeed?.value || 0));
    const usageLimitHours = filtered.map((plan) =>
      plan.usageLimit?.unit === "Hours" ? parseInt(plan.usageLimit.value || 0) : 720
    );

    const categoryCounts = categories.slice(1).map(
      (cat) => plansData.filter((plan) => plan.category === cat.value).length
    );

    return {
      filteredPlans: filtered,
      chartData: {
        planNames,
        sales,
        activeUsers,
        revenue,
        bandwidthUsage,
        usageLimitHours,
        categoryCounts
      }
    };
  }, [plansData, filterCategory, categories]);

  // Chart series configurations
  const barChartSeries = useMemo(() => [
    { name: "Sales", data: chartData.sales },
    { name: "Active Users", data: chartData.activeUsers },
    { name: "Revenue", data: chartData.revenue },
  ], [chartData]);

  const lineChartSeries = useMemo(() => [
    { name: "Bandwidth Usage (Mbps)", data: chartData.bandwidthUsage },
    { name: "Usage Limit (Hours)", data: chartData.usageLimitHours },
  ], [chartData]);

  const pieChartSeries = useMemo(() => chartData.categoryCounts, [chartData]);

  // Enhanced chart options with theme support
  const enhancedBarChartOptions = useMemo(() => ({
    ...chartOptions.bar,
    xaxis: {
      categories: chartData.planNames,
      title: { 
        text: "Plans",
        style: {
          color: theme === 'dark' ? '#f9fafb' : '#1f2937'
        }
      },
      labels: {
        style: {
          colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
        },
        rotate: -45,
        hideOverlappingLabels: true,
        maxHeight: 120
      }
    },
    yaxis: [
      { 
        title: { 
          text: "Counts",
          style: {
            color: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        },
        labels: {
          style: {
            colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        }
      },
      { 
        opposite: true, 
        title: { 
          text: "Revenue (Ksh)",
          style: {
            color: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        },
        labels: {
          style: {
            colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
          },
          formatter: (value) => value.toLocaleString()
        }
      },
    ],
    tooltip: {
      ...chartOptions.bar.tooltip,
      y: [
        { formatter: (val) => `${val} sales` },
        { formatter: (val) => `${val} users` },
        { formatter: (val) => `Ksh ${val.toLocaleString()}` },
      ],
    },
  }), [chartOptions.bar, chartData.planNames, theme]);

  const enhancedLineChartOptions = useMemo(() => ({
    ...chartOptions.line,
    xaxis: {
      categories: chartData.planNames,
      title: { 
        text: "Plans",
        style: {
          color: theme === 'dark' ? '#f9fafb' : '#1f2937'
        }
      },
      labels: {
        style: {
          colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
        },
        rotate: -45,
        hideOverlappingLabels: true,
        maxHeight: 120
      }
    },
    yaxis: [
      { 
        title: { 
          text: "Bandwidth (Mbps)",
          style: {
            color: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        },
        min: 0,
        labels: {
          style: {
            colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        }
      },
      { 
        opposite: true, 
        title: { 
          text: "Usage Limit (Hours)",
          style: {
            color: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        },
        min: 0,
        labels: {
          style: {
            colors: theme === 'dark' ? '#f9fafb' : '#1f2937'
          }
        }
      },
    ],
    tooltip: {
      ...chartOptions.line.tooltip,
      y: [
        { formatter: (val) => `${val} Mbps` },
        { formatter: (val) => `${val} hours (~${(val / 24).toFixed(1)} days)` },
      ],
    },
  }), [chartOptions.line, chartData.planNames, theme]);

  const enhancedPieChartOptions = useMemo(() => ({
    ...chartOptions.pie,
    labels: categories.slice(1).map(cat => cat.label),
    tooltip: { 
      ...chartOptions.pie.tooltip,
      y: { formatter: (val) => `${val} plans` } 
    },
  }), [chartOptions.pie, categories]);

  // Data fetching
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/api/internet_plans/plan_analytics/");
        const plansData = response.data.results || response.data;
        if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
        setPlansData(plansData);
        if (response.data.message) toast.info(response.data.message);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data. Please try again later.");
        setPlansData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Key metrics calculation
  const keyMetrics = useMemo(() => {
    const totalRevenue = chartData.revenue.reduce((sum, rev) => sum + rev, 0);
    const totalSubscriptions = chartData.sales.reduce((sum, sales) => sum + sales, 0);
    const avgBandwidth = chartData.bandwidthUsage.length > 0 
      ? chartData.bandwidthUsage.reduce((sum, bw) => sum + bw, 0) / chartData.bandwidthUsage.length 
      : 0;
    const activePlans = filteredPlans.filter(plan => plan.active).length;

    return {
      totalRevenue,
      totalSubscriptions,
      avgBandwidth: avgBandwidth.toFixed(1),
      activePlans,
      totalPlans: filteredPlans.length
    };
  }, [chartData, filteredPlans]);

  // Handle create plan action
  const handleCreatePlan = () => {
    toast.info("Redirecting to plan creation...");
    // You can implement navigation to plan creation page here
    // navigate('/plans/create');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 sm:p-8 transition-colors duration-300 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-indigo-900' : 'bg-gradient-to-br from-white to-indigo-50'
      }`}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1 }}
          className="flex flex-col items-center"
        >
          <Server className="w-12 h-12 text-indigo-500 mb-4" />
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-8 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-indigo-900' : 'bg-gradient-to-br from-white to-indigo-50'
    }`}>
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Plan Analytics Dashboard
            </h1>
            <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Monitor your internet plan performance and metrics
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Category Filter Dropdown */}
            <div className="w-full sm:w-48">
              <EnhancedSelect
                value={filterCategory}
                onChange={setFilterCategory}
                options={categories}
                placeholder="Select Category"
              />
            </div>
            
            {/* Time Range Dropdown */}
            <div className="w-full sm:w-48">
              <EnhancedSelect
                value={timeRange}
                onChange={setTimeRange}
                options={timeRanges}
                placeholder="Select Time Range"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Revenue",
              value: `Ksh ${keyMetrics.totalRevenue.toLocaleString()}`,
              desc: "Total revenue generated",
              icon: BarChart,
              color: "from-indigo-500 to-indigo-600",
              delay: 0
            },
            {
              title: "Total Subscriptions",
              value: keyMetrics.totalSubscriptions,
              desc: "Active subscriptions",
              icon: Users,
              color: "from-green-500 to-green-600",
              delay: 0.1
            },
            {
              title: "Avg Bandwidth",
              value: `${keyMetrics.avgBandwidth} Mbps`,
              desc: "Average download speed",
              icon: Server,
              color: "from-blue-500 to-blue-600",
              delay: 0.2
            },
            {
              title: "Active Plans",
              value: `${keyMetrics.activePlans}/${keyMetrics.totalPlans}`,
              desc: "Active vs total plans",
              icon: PieChart,
              color: "from-purple-500 to-purple-600",
              delay: 0.3
            }
          ].map((metric, idx) => (
            <motion.div 
              key={idx}
              className={`p-6 rounded-xl shadow-lg backdrop-blur-md ${
                theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: metric.delay }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {metric.title}
                  </p>
                  <h3 className={`text-2xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {metric.value}
                  </h3>
                  <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {metric.desc}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color} text-white shadow`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {plansData.length === 0 ? (
          <motion.div
            className={`rounded-xl shadow-lg p-8 text-center backdrop-blur-md ${
              theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <Server className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                No Analytics Data Available
              </h2>
              <p className={`mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Start by creating your first internet plan to see analytics and performance metrics.
              </p>
              <CreatePlanButton onClick={handleCreatePlan} theme={theme} />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Bar Chart - Plan Popularity & Revenue */}
            <motion.div
              className={`rounded-xl shadow-lg p-6 backdrop-blur-md ${
                theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <BarChart className="w-5 h-5 text-indigo-500" />
                </div>
                Plan Popularity & Revenue
              </h2>
              <div className="h-80">
                <Chart 
                  options={enhancedBarChartOptions} 
                  series={barChartSeries} 
                  type="bar" 
                  height="100%" 
                  width="100%"
                />
              </div>
            </motion.div>

            {/* Line Chart - Network Performance & Usage */}
            <motion.div
              className={`rounded-xl shadow-lg p-6 backdrop-blur-md ${
                theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <div className="p-2 rounded-lg bg-red-500/20">
                  <LineChart className="w-5 h-5 text-red-500" />
                </div>
                Network Performance & Usage
              </h2>
              <div className="h-80">
                <Chart 
                  options={enhancedLineChartOptions} 
                  series={lineChartSeries} 
                  type="line" 
                  height="100%" 
                  width="100%"
                />
              </div>
            </motion.div>

            {/* Pie Chart - Category Distribution */}
            <motion.div
              className={`rounded-xl shadow-lg p-6 backdrop-blur-md ${
                theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <PieChart className="w-5 h-5 text-purple-500" />
                </div>
                Category Distribution
              </h2>
              <div className="h-80">
                <Chart 
                  options={enhancedPieChartOptions} 
                  series={pieChartSeries} 
                  type="pie" 
                  height="100%" 
                  width="100%"
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanAnalytics;