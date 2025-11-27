



// import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
// import PropTypes from "prop-types";
// import {
//   FiUserPlus,
//   FiDollarSign,
//   FiActivity,
//   FiTrendingUp,
//   FiTrendingDown,
//   FiWifi,
//   FiServer,
//   FiBarChart2,
//   FiRefreshCw,
//   FiUsers,
//   FiGlobe,
// } from "react-icons/fi";
// import { FaSpinner, FaUserCheck, FaCircle } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import SystemLoadMonitor from "../../components/DashboardComponents/SystemLoadMonitor.jsx";
// import SalesChart from "../../components/DashboardComponents/SalesChart.jsx";
// import RevenueChart from "../../components/DashboardComponents/RevenueChart.jsx";
// import FinancialBarChart from "../../components/DashboardComponents/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/DashboardComponents/VisitorAnalyticsChart.jsx";
// import PlanPerformanceChart from "../../components/DashboardComponents/PlanPerformanceChart.jsx";
// import NewSubscriptionsChart from "../../components/DashboardComponents/NewSubscriptionsChart.jsx";
// import ClientTypeBreakdown from "../../components/DashboardComponents/ClientTypeBreakdown.jsx";
// import { useTheme } from "../../context/ThemeContext";
// import api from "../../api";
// import { motion, AnimatePresence } from "framer-motion";

// const CURRENCY = "KES";

// // Utility functions
// const formatCurrency = (amount, currency = CURRENCY) => {
//   return new Intl.NumberFormat('en-KE', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// const formatNumber = (number) => {
//   return new Intl.NumberFormat('en-KE').format(number);
// };

// const formatPercentage = (value) => {
//   return `${value.toFixed(1)}%`;
// };

// // Memoized icon mapping to prevent recreation on each render
// const iconMap = {
//   FaUserCheck: (
//     <div className="relative">
//       <FaUserCheck className="text-2xl sm:text-3xl" />
//       <FaCircle className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-pulse" />
//     </div>
//   ),
//   FiUserPlus: <FiUserPlus className="text-2xl sm:text-3xl" />,
//   FiDollarSign: <FiDollarSign className="text-2xl sm:text-3xl" />,
//   FiActivity: <FiActivity className="text-2xl sm:text-3xl" />,
//   FiTrendingDown: <FiTrendingDown className="text-2xl sm:text-3xl" />,
//   FiBarChart2: <FiBarChart2 className="text-2xl sm:text-3xl" />,
//   FiWifi: <FiWifi className="text-2xl sm:text-3xl" />,
//   FiServer: <FiServer className="text-2xl sm:text-3xl" />,
//   FiTrendingUp: <FiTrendingUp className="text-2xl sm:text-3xl" />,
//   FiUsers: <FiUsers className="text-2xl sm:text-3xl" />,
//   FiGlobe: <FiGlobe className="text-2xl sm:text-3xl" />,
// };

// // Error Boundary Component
// class ChartErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error('Chart Error:', error, errorInfo);
//   }

//   componentDidUpdate(prevProps) {
//     if (prevProps.children !== this.props.children) {
//       this.setState({ hasError: false, error: null });
//     }
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className={`flex flex-col items-center justify-center h-64 rounded-lg border ${
//           this.props.theme === "dark" 
//             ? "bg-gray-800/50 border-gray-700 text-gray-400" 
//             : "bg-gray-50 border-gray-200 text-gray-500"
//         }`}>
//           <IoMdAlert className="text-2xl mb-2" />
//           <p className="text-sm font-medium">Failed to load {this.props.chartName}</p>
//           <p className="text-xs mt-1">Please try refreshing the page</p>
//           {this.props.showRetry && (
//             <button
//               onClick={() => this.setState({ hasError: false })}
//               className="mt-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//             >
//               Retry
//             </button>
//           )}
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// ChartErrorBoundary.propTypes = {
//   children: PropTypes.node,
//   chartName: PropTypes.string.isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]),
//   showRetry: PropTypes.bool,
// };

// ChartErrorBoundary.defaultProps = {
//   showRetry: true,
//   theme: "light",
// };

// // Loading Skeleton Component
// const GridCardSkeleton = ({ theme }) => (
//   <div className={`rounded-xl shadow-sm overflow-hidden animate-pulse ${
//     theme === "dark" 
//       ? "bg-gray-800/60 border-gray-700" 
//       : "bg-white/80 border-gray-200"
//   } border`}>
//     <div className="p-4 sm:p-6">
//       <div className="flex justify-between items-start">
//         <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//         }`} />
//         <div className={`w-16 h-6 rounded-full ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//         }`} />
//       </div>
//       <div className="mt-4 sm:mt-6 space-y-2">
//         <div className={`w-3/4 h-4 rounded ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//         }`} />
//         <div className={`w-1/2 h-6 rounded ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//         }`} />
//         <div className={`w-full h-3 rounded ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//         }`} />
//       </div>
//     </div>
//   </div>
// );

// GridCardSkeleton.propTypes = {
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// // Memoized GridCard component to prevent unnecessary re-renders
// const GridCard = React.memo(({ item, theme }) => {
//   const [isLoading, setIsLoading] = useState(false);

//   if (isLoading) {
//     return <GridCardSkeleton theme={theme} />;
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className={`rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
//         theme === "dark" 
//           ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//           : "bg-white/80 backdrop-blur-md border-gray-200"
//       } border`}
//     >
//       <div className="p-4 sm:p-6">
//         <div className="flex justify-between items-start">
//           <div
//             className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-lg ${item.bgColor} ${item.iconColor}`}
//           >
//             {iconMap[item.icon] || <FiBarChart2 className="text-2xl sm:text-3xl" />}
//           </div>

//           <div
//             className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//               item.trend === "up"
//                 ? theme === "dark" 
//                   ? "bg-green-900/50 text-green-300" 
//                   : "bg-green-100 text-green-800"
//                 : theme === "dark" 
//                   ? "bg-red-900/50 text-red-300" 
//                   : "bg-red-100 text-red-800"
//             } theme-transition`}
//           >
//             {item.trend === "up" ? (
//               <FiTrendingUp className="mr-1 w-3 h-3" />
//             ) : (
//               <FiTrendingDown className="mr-1 w-3 h-3" />
//             )}
//             {Math.abs(item.rate)}%
//           </div>
//         </div>

//         <div className="mt-4 sm:mt-6">
//           <h3 className={`text-xs sm:text-sm uppercase tracking-wider ${item.fontStyle} ${
//             theme === "dark" ? "text-gray-400" : "text-gray-500"
//           } theme-transition`}>
//             {item.label}
//           </h3>
//           <p className={`mt-1 sm:mt-2 text-xl sm:text-2xl font-bold ${
//             theme === "dark" ? "text-white" : "text-gray-900"
//           } theme-transition`}>{item.value}</p>
//           <p className={`mt-1 text-xs ${
//             theme === "dark" ? "text-gray-400" : "text-gray-500"
//           } theme-transition`}>{item.comparison}</p>
//         </div>
//       </div>
//     </motion.div>
//   );
// });

// GridCard.propTypes = {
//   item: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     label: PropTypes.string.isRequired,
//     value: PropTypes.string.isRequired,
//     comparison: PropTypes.string.isRequired,
//     icon: PropTypes.string.isRequired,
//     rate: PropTypes.number.isRequired,
//     trend: PropTypes.oneOf(["up", "down"]).isRequired,
//     bgColor: PropTypes.string.isRequired,
//     iconColor: PropTypes.string.isRequired,
//     borderColor: PropTypes.string.isRequired,
//     fontStyle: PropTypes.string.isRequired,
//   }).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// GridCard.displayName = 'GridCard';

// const GridStats = () => {
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [chartLoading, setChartLoading] = useState({});
//   const abortControllerRef = useRef(null);
//   const { theme } = useTheme();

//   // Memoized fetch function with useCallback to prevent unnecessary recreations
//   const fetchData = useCallback(async (signal) => {
//     try {
//       setLoading(true);
//       setError(null);
//       setChartLoading({});
      
//       const response = await api.get('/api/dashboard/', { signal });
      
//       // Validate response data structure
//       if (!response.data || typeof response.data !== 'object') {
//         throw new Error('Invalid dashboard data format');
//       }
      
//       setDashboardData(response.data);
//       setLoading(false);
//     } catch (err) {
//       if (err.name === 'AbortError' || err.message === 'canceled') {
//         console.log('Request was canceled');
//         return;
//       }
      
//       const errorMessage = err.response?.data?.error || 
//                           err.response?.data?.details || 
//                           err.message || 
//                           "Failed to load dashboard data.";
//       setError(errorMessage);
//       setLoading(false);
//     }
//   }, []);

//   // Handle individual chart load
//   const handleChartLoad = useCallback((chartName) => {
//     setChartLoading(prev => ({ ...prev, [chartName]: false }));
//   }, []);

//   // Handle individual chart error
//   const handleChartError = useCallback((chartName, error) => {
//     console.error(`Chart ${chartName} error:`, error);
//     setChartLoading(prev => ({ ...prev, [chartName]: false }));
//   }, []);

//   useEffect(() => {
//     let isMounted = true;
//     abortControllerRef.current = new AbortController();

//     const loadData = async () => {
//       if (isMounted) {
//         await fetchData(abortControllerRef.current.signal);
//       }
//     };

//     loadData();
    
//     return () => {
//       isMounted = false;
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [fetchData]);

//   const handleRefresh = () => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
    
//     abortControllerRef.current = new AbortController();
//     fetchData(abortControllerRef.current.signal);
//   };

//   // Validate and process dashboard data
//   const processedData = useMemo(() => {
//     if (!dashboardData) return null;

//     // Ensure all required data arrays exist
//     return {
//       grid_items: Array.isArray(dashboardData.grid_items) ? dashboardData.grid_items : [],
//       system_load: dashboardData.system_load || {},
//       sales_data: Array.isArray(dashboardData.sales_data) ? dashboardData.sales_data : [],
//       revenue_data: Array.isArray(dashboardData.revenue_data) ? dashboardData.revenue_data : [],
//       financial_data: Array.isArray(dashboardData.financial_data) ? dashboardData.financial_data : [],
//       visitor_data: dashboardData.visitor_data || {},
//       plan_performance: Array.isArray(dashboardData.plan_performance) ? dashboardData.plan_performance : [],
//       new_subscriptions: Array.isArray(dashboardData.new_subscriptions) ? dashboardData.new_subscriptions : [],
//       client_types: Array.isArray(dashboardData.client_types) ? dashboardData.client_types : [],
//     };
//   }, [dashboardData]);

//   // Memoized chart components with theme to prevent unnecessary re-renders
//   const memoizedCharts = useMemo(() => {
//     if (!processedData) return null;
    
//     const { 
//       grid_items, 
//       system_load, 
//       sales_data, 
//       revenue_data, 
//       financial_data, 
//       visitor_data, 
//       plan_performance, 
//       new_subscriptions,
//       client_types,
//     } = processedData;

//     return (
//       <>
//         {/* Stats Grid - Responsive columns */}
//         <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
//           {grid_items.map((item) => (
//             <GridCard key={item.id} item={item} theme={theme} />
//           ))}
//         </div>

//         {/* System Load Monitor */}
//         <div className="mt-8 sm:mt-10">
//           <ChartErrorBoundary chartName="System Load Monitor" theme={theme}>
//             <SystemLoadMonitor 
//               data={system_load} 
//               theme={theme}
//               onLoad={() => handleChartLoad('system_load')}
//               onError={(error) => handleChartError('system_load', error)}
//             />
//           </ChartErrorBoundary>
//         </div>

//         {/* Client Type Breakdown */}
//         {client_types.length > 0 && (
//           <div className="mt-8 sm:mt-10">
//             <ChartErrorBoundary chartName="Client Type Breakdown" theme={theme}>
//               <ClientTypeBreakdown 
//                 data={client_types} 
//                 theme={theme}
//                 onLoad={() => handleChartLoad('client_types')}
//                 onError={(error) => handleChartError('client_types', error)}
//               />
//             </ChartErrorBoundary>
//           </div>
//         )}

//         {/* Performance Charts - Responsive layout */}
//         <div className="mt-8 sm:mt-10">
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
//             <ChartErrorBoundary chartName="Sales Performance" theme={theme}>
//               <div className={`rounded-xl shadow-sm overflow-hidden ${
//                 theme === "dark" 
//                   ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//                   : "bg-white/80 backdrop-blur-md border-gray-200"
//               } border`}>
//                 <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//                   theme === "dark" ? "border-gray-700" : "border-gray-200"
//                 }`}>
//                   <h3 className={`text-lg font-bold ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}>Sales Performance</h3>
//                   <p className={`mt-1 text-sm ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>Monthly sales trend with comparison to last year</p>
//                 </div>
//                 <div className="p-4 sm:p-6">
//                   <SalesChart 
//                     data={sales_data} 
//                     theme={theme}
//                     onLoad={() => handleChartLoad('sales')}
//                     onError={(error) => handleChartError('sales', error)}
//                   />
//                 </div>
//               </div>
//             </ChartErrorBoundary>
            
//             <ChartErrorBoundary chartName="Revenue Analysis" theme={theme}>
//               <div className={`rounded-xl shadow-sm overflow-hidden ${
//                 theme === "dark" 
//                   ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//                   : "bg-white/80 backdrop-blur-md border-gray-200"
//               } border`}>
//                 <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//                   theme === "dark" ? "border-gray-700" : "border-gray-200"
//                 }`}>
//                   <h3 className={`text-lg font-bold ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}>Revenue Analysis</h3>
//                   <p className={`mt-1 text-sm ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>Revenue breakdown by product category</p>
//                 </div>
//                 <div className="p-4 sm:p-6">
//                   <RevenueChart 
//                     data={revenue_data} 
//                     theme={theme}
//                     onLoad={() => handleChartLoad('revenue')}
//                     onError={(error) => handleChartError('revenue', error)}
//                   />
//                 </div>
//               </div>
//             </ChartErrorBoundary>
//           </div>
//         </div>

//         {/* Plan Performance & Financial Overview */}
//         <div className="mt-8 sm:mt-10">
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
//             <ChartErrorBoundary chartName="Plan Performance" theme={theme}>
//               <PlanPerformanceChart 
//                 data={plan_performance} 
//                 theme={theme}
//                 onLoad={() => handleChartLoad('plan_performance')}
//                 onError={(error) => handleChartError('plan_performance', error)}
//               />
//             </ChartErrorBoundary>
            
//             <ChartErrorBoundary chartName="Financial Overview" theme={theme}>
//               <div className={`rounded-xl shadow-sm overflow-hidden ${
//                 theme === "dark" 
//                   ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//                   : "bg-white/80 backdrop-blur-md border-gray-200"
//               } border`}>
//                 <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//                   theme === "dark" ? "border-gray-700" : "border-gray-200"
//                 }`}>
//                   <h3 className={`text-lg font-bold ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}>Financial Overview</h3>
//                   <p className={`mt-1 text-sm ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>Quarterly financial performance</p>
//                 </div>
//                 <div className="p-4 sm:p-6">
//                   <FinancialBarChart 
//                     data={financial_data} 
//                     theme={theme}
//                     onLoad={() => handleChartLoad('financial')}
//                     onError={(error) => handleChartError('financial', error)}
//                   />
//                 </div>
//               </div>
//             </ChartErrorBoundary>
//           </div>
//         </div>

//         {/* Visitor Analytics & Subscriptions */}
//         <div className="mt-8 sm:mt-10">
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
//             <ChartErrorBoundary chartName="Visitor Analytics" theme={theme}>
//               <div className={`rounded-xl shadow-sm overflow-hidden ${
//                 theme === "dark" 
//                   ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//                   : "bg-white/80 backdrop-blur-md border-gray-200"
//               } border`}>
//                 <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//                   theme === "dark" ? "border-gray-700" : "border-gray-200"
//                 }`}>
//                   <h3 className={`text-lg font-bold ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}>Plan Popularity</h3>
//                   <p className={`mt-1 text-sm ${
//                     theme === "dark" ? "text-gray-400" : "text-gray-500"
//                   }`}>User engagement and behavior</p>
//                 </div>
//                 <div className="p-4 sm:p-6">
//                   <VisitorAnalyticsChart 
//                     data={visitor_data} 
//                     theme={theme}
//                     onLoad={() => handleChartLoad('visitor_analytics')}
//                     onError={(error) => handleChartError('visitor_analytics', error)}
//                   />
//                 </div>
//               </div>
//             </ChartErrorBoundary>
            
//             <ChartErrorBoundary chartName="Subscription Growth" theme={theme}>
//               <NewSubscriptionsChart 
//                 data={new_subscriptions} 
//                 theme={theme}
//                 onLoad={() => handleChartLoad('subscriptions')}
//                 onError={(error) => handleChartError('subscriptions', error)}
//               />
//             </ChartErrorBoundary>
//           </div>
//         </div>
//       </>
//     );
//   }, [processedData, theme, handleChartLoad, handleChartError]);

//   // Theme-based background classes
//   const containerClass = theme === "dark" 
//     ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
//     : "bg-gray-50 text-gray-800 min-h-screen";

//   // Loading state with enhanced UI
//   if (loading) {
//     return (
//       <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 p-4 transition-colors duration-300 ${containerClass}`}>
//         <div className="flex items-center space-y-4 p-4 gap-2">
//           <FaSpinner className="animate-spin text-2xl sm:text-3xl text-blue-600 dark:text-blue-400" />
//           <span className={`text-base sm:text-lg font-medium mr-3 ${
//             theme === "dark" ? "text-gray-300" : "text-gray-800"
//           }`}>
//             Loading Dashboard Insights
//           </span>
//         </div>
//         <p className={`text-xs sm:text-sm ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>
//           Preparing your business analytics...
//         </p>
        
//         {/* Loading skeleton grid */}
//         <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-7xl px-4">
//           {Array.from({ length: 14 }).map((_, index) => (
//             <GridCardSkeleton key={index} theme={theme} />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Error state with enhanced UI
//   if (error) {
//     return (
//       <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${containerClass}`}>
//         <div className={`max-w-md w-full rounded-xl shadow-sm p-4 sm:p-6 text-center ${
//           theme === "dark" 
//             ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//             : "bg-white/80 backdrop-blur-md border-gray-200"
//         } border`}>
//           <div className={`mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${
//             theme === "dark" ? "bg-red-900/50" : "bg-red-100"
//           } mb-3 sm:mb-4`}>
//             <IoMdAlert className={`h-5 w-5 sm:h-6 sm:w-6 ${
//               theme === "dark" ? "text-red-300" : "text-red-600"
//             }`} />
//           </div>
//           <h3 className={`text-base sm:text-lg font-semibold ${
//             theme === "dark" ? "text-white" : "text-gray-900"
//           }`}>Data Load Error</h3>
//           <p className={`mt-2 text-xs sm:text-sm ${
//             theme === "dark" ? "text-gray-300" : "text-gray-600"
//           }`}>{error}</p>
//           <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
//             <button
//               onClick={handleRefresh}
//               className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm ${
//                 theme === "dark" 
//                   ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500" 
//                   : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
//               } text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
//             >
//               <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
//               Refresh Dashboard
//             </button>
//             <button
//               onClick={() => window.location.reload()}
//               className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm border ${
//                 theme === "dark" 
//                   ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200" 
//                   : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
//               } focus:outline-none focus:ring-2 focus:ring-blue-500`}
//             >
//               Reload Page
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // No data state
//   if (!processedData || !processedData.grid_items || processedData.grid_items.length === 0) {
//     return (
//       <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${containerClass}`}>
//         <div className={`max-w-md w-full rounded-xl shadow-sm p-4 sm:p-6 text-center ${
//           theme === "dark" 
//             ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//             : "bg-white/80 backdrop-blur-md border-gray-200"
//         } border`}>
//           <div className={`mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${
//             theme === "dark" ? "bg-yellow-900/50" : "bg-yellow-100"
//           } mb-3 sm:mb-4`}>
//             <IoMdAlert className={`h-5 w-5 sm:h-6 sm:w-6 ${
//               theme === "dark" ? "text-yellow-300" : "text-yellow-600"
//             }`} />
//           </div>
//           <h3 className={`text-base sm:text-lg font-semibold ${
//             theme === "dark" ? "text-white" : "text-gray-900"
//           }`}>No Data Available</h3>
//           <p className={`mt-2 text-xs sm:text-sm ${
//             theme === "dark" ? "text-gray-300" : "text-gray-600"
//           }`}>
//             There is no dashboard data available at the moment.
//           </p>
//           <button
//             onClick={handleRefresh}
//             className={`mt-4 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm ${
//               theme === "dark" 
//                 ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500" 
//                 : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
//             } text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
//           >
//             <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
//       <div className="space-y-8 sm:space-y-10 p-4 sm:p-6">
//         {/* Header with Refresh button and stats */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className={`text-2xl sm:text-3xl font-bold ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>
//               Diconden Dashboard
//             </h1>
//             <p className={`mt-1 text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>
//               Real-time insights for Hotspot and PPPoE operations
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className={`text-xs px-3 py-1 rounded-full ${
//               theme === "dark" 
//                 ? "bg-green-900/50 text-green-300" 
//                 : "bg-green-100 text-green-800"
//             }`}>
//               Last updated: {new Date().toLocaleTimeString()}
//             </div>
//             <button
//               onClick={handleRefresh}
//               className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//                 theme === "dark" 
//                   ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-blue-500" 
//                   : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500"
//               } border`}
//             >
//               <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
//               Refresh Data
//             </button>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">
//           <motion.div
//             key={loading ? 'loading' : 'content'}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             {memoizedCharts}
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// GridStats.propTypes = {
//   // Add any props if needed in the future
// };

// export default GridStats;






// GridStats.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import {
  FiUserPlus,
  FiDollarSign,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiWifi,
  FiServer,
  FiBarChart2,
  FiRefreshCw,
  FiUsers,
  FiGlobe,
} from "react-icons/fi";
import { FaSpinner, FaUserCheck, FaCircle } from "react-icons/fa";
import { IoMdAlert } from "react-icons/io";
import { toast, Toaster } from "react-hot-toast";
import SystemLoadMonitor from "../../components/DashboardComponents/SystemLoadMonitor.jsx";
import SalesChart from "../../components/DashboardComponents/SalesChart.jsx";
import RevenueChart from "../../components/DashboardComponents/RevenueChart.jsx";
import FinancialBarChart from "../../components/DashboardComponents/FinancialBarChart.jsx";
import VisitorAnalyticsChart from "../../components/DashboardComponents/VisitorAnalyticsChart.jsx";
import PlanPerformanceChart from "../../components/DashboardComponents/PlanPerformanceChart.jsx";
import NewSubscriptionsChart from "../../components/DashboardComponents/NewSubscriptionsChart.jsx";
import ClientTypeBreakdown from "../../components/DashboardComponents/ClientTypeBreakdown.jsx";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";

// Constants
const CURRENCY = "KES";
const REFRESH_INTERVAL = 300000;

// Utility functions
const formatCurrency = (amount, currency = CURRENCY) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const validateChartData = (data, requiredFields = []) => {
  if (!data) return false;
  if (Array.isArray(data) && data.length === 0) return false;
  if (typeof data === 'object' && Object.keys(data).length === 0) return false;
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) return false;
  }
  
  return true;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Dashboard Component Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={`p-4 rounded-lg ${
          this.props.theme === "dark" 
            ? "bg-red-900/20 border-red-800" 
            : "bg-red-50 border-red-200"
        } border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <IoMdAlert className="text-red-500 mr-2" />
              <div>
                <span className={`text-sm font-medium ${
                  this.props.theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  {this.props.chartName || "Component"} temporarily unavailable
                </span>
                {this.props.showDetails && (
                  <p className={`text-xs mt-1 ${
                    this.props.theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {this.state.error?.message || 'An error occurred'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={this.handleRetry}
              className={`ml-4 px-3 py-1 text-xs rounded-md font-medium ${
                this.props.theme === "dark" 
                  ? "bg-red-800 hover:bg-red-700 text-white" 
                  : "bg-red-200 hover:bg-red-300 text-red-800"
              } transition-colors duration-200`}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  chartName: PropTypes.string,
  onRetry: PropTypes.func,
  showDetails: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

// Chart with Retry Component
const ChartWithRetry = ({ 
  chartName, 
  data, 
  theme, 
  ChartComponent, 
  validationFields = [], 
  height = "h-64" 
}) => {
  const [retryCount, setRetryCount] = useState(0);
  
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const hasValidData = validateChartData(data, validationFields);

  if (!hasValidData) {
    return (
      <EmptyChartState 
        chartName={chartName} 
        theme={theme}
        height={height}
      />
    );
  }

  return (
    <ErrorBoundary 
      key={retryCount}
      theme={theme}
      chartName={chartName}
      onRetry={handleRetry}
      showDetails={false}
    >
      <ChartComponent data={data} theme={theme} />
    </ErrorBoundary>
  );
};

ChartWithRetry.propTypes = {
  chartName: PropTypes.string.isRequired,
  data: PropTypes.any,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  ChartComponent: PropTypes.elementType.isRequired,
  validationFields: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.string,
};

// Memoized icon mapping
const iconMap = {
  FaUserCheck: (
    <div className="relative">
      <FaUserCheck className="text-2xl sm:text-3xl" />
      <FaCircle className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-pulse" />
    </div>
  ),
  FiUserPlus: <FiUserPlus className="text-2xl sm:text-3xl" />,
  FiDollarSign: <FiDollarSign className="text-2xl sm:text-3xl" />,
  FiActivity: <FiActivity className="text-2xl sm:text-3xl" />,
  FiTrendingDown: <FiTrendingDown className="text-2xl sm:text-3xl" />,
  FiBarChart2: <FiBarChart2 className="text-2xl sm:text-3xl" />,
  FiWifi: <FiWifi className="text-2xl sm:text-3xl" />,
  FiServer: <FiServer className="text-2xl sm:text-3xl" />,
  FiTrendingUp: <FiTrendingUp className="text-2xl sm:text-3xl" />,
  FiUsers: <FiUsers className="text-2xl sm:text-3xl" />,
  FiGlobe: <FiGlobe className="text-2xl sm:text-3xl" />,
};

// Loading Skeleton Component
const GridCardSkeleton = ({ theme }) => (
  <div 
    className={`rounded-xl shadow-sm overflow-hidden animate-pulse ${
      theme === "dark" 
        ? "bg-gray-800/60 border-gray-700" 
        : "bg-white/80 border-gray-200"
    } border`}
  >
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-start">
        <div 
          className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} 
        />
        <div 
          className={`w-16 h-6 rounded-full ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} 
        />
      </div>
      <div className="mt-4 sm:mt-6 space-y-2">
        <div 
          className={`w-3/4 h-4 rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} 
        />
        <div 
          className={`w-1/2 h-6 rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} 
        />
        <div 
          className={`w-full h-3 rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} 
        />
      </div>
    </div>
  </div>
);

GridCardSkeleton.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

// Empty State Component
const EmptyChartState = ({ 
  chartName, 
  theme, 
  description = "Data will appear here as it becomes available",
  height = "h-64" 
}) => (
  <div 
    className={`flex flex-col items-center justify-center ${height} rounded-lg border ${
      theme === "dark" 
        ? "bg-gray-800/30 border-gray-700 text-gray-400" 
        : "bg-gray-50 border-gray-200 text-gray-500"
    }`}
  >
    <FiBarChart2 className="text-2xl mb-3 opacity-50" />
    <p className="text-sm font-medium mb-1 text-center px-2">{chartName}</p>
    <p className="text-xs text-center px-4">{description}</p>
  </div>
);

EmptyChartState.propTypes = {
  chartName: PropTypes.string.isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  description: PropTypes.string,
  height: PropTypes.string,
};

// Memoized GridCard component
const GridCard = React.memo(({ item, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
        : "bg-white/80 backdrop-blur-md border-gray-200"
    } border`}
  >
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-start">
        <div
          className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-lg ${item.bgColor} ${item.iconColor}`}
        >
          {iconMap[item.icon] || <FiBarChart2 className="text-2xl sm:text-3xl" />}
        </div>

        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.trend === "up"
              ? theme === "dark" 
                ? "bg-green-900/50 text-green-300" 
                : "bg-green-100 text-green-800"
              : theme === "dark" 
                ? "bg-red-900/50 text-red-300" 
                : "bg-red-100 text-red-800"
          } transition-colors duration-200`}
        >
          {item.trend === "up" ? (
            <FiTrendingUp className="mr-1 w-3 h-3" />
          ) : (
            <FiTrendingDown className="mr-1 w-3 h-3" />
          )}
          {Math.abs(item.rate)}%
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <h3 className={`text-xs sm:text-sm uppercase tracking-wider ${item.fontStyle} ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        } transition-colors duration-200`}>
          {item.label}
        </h3>
        <p className={`mt-1 sm:mt-2 text-xl sm:text-2xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        } transition-colors duration-200`}>
          {item.value}
        </p>
        <p className={`mt-1 text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        } transition-colors duration-200`}>
          {item.comparison}
        </p>
      </div>
    </div>
  </motion.div>
));

GridCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    comparison: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    rate: PropTypes.number.isRequired,
    trend: PropTypes.oneOf(["up", "down"]).isRequired,
    bgColor: PropTypes.string.isRequired,
    iconColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
    fontStyle: PropTypes.string.isRequired,
  }).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

GridCard.displayName = 'GridCard';

// Main Dashboard Component
const GridStats = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortControllerRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const { theme } = useTheme();

  // SIMPLIFIED data fetching - using regular axios without safeGet
  const fetchData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use regular axios get to avoid any method attachment issues
      const response = await api.get('/api/dashboard/', { 
        signal,
        timeout: 25000 
      });
      
      // More robust validation
      if (!response || !response.data || typeof response.data !== 'object') {
        throw new Error('Invalid dashboard data format received from server');
      }
      
      setDashboardData(response.data);
      setLastUpdated(new Date());
      setLoading(false);
      
    } catch (err) {
      // Handle cancellation
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      
      console.log('🔴 Dashboard fetch error:', err);
      
      // Extract meaningful error message from different error formats
      let errorMessage = "Failed to load dashboard data";
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      err.response.data?.detail || 
                      `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error - please check your connection";
      } else if (err.message) {
        // Other error with message
        errorMessage = err.message;
      } else if (err.code) {
        // Error with code
        errorMessage = `Error: ${err.code}`;
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Only show critical errors as toasts
      const showToast = !err.response || err.response.status >= 500 || err.request;
      if (showToast) {
        toast.error(errorMessage, { 
          duration: 5000,
          id: 'dashboard-load-error'
        });
      }
    }
  }, []);

  // Initialize data loading
  useEffect(() => {
    let isMounted = true;
    abortControllerRef.current = new AbortController();

    const loadData = async () => {
      if (isMounted) {
        await fetchData(abortControllerRef.current.signal);
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    const setupAutoRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        if (!loading && document.visibilityState === 'visible') {
          handleRefresh();
        }
      }, REFRESH_INTERVAL);
    };

    setupAutoRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loading]);

  const handleRefresh = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
    
    toast.loading('Refreshing dashboard data...', {
      duration: 2000,
      id: 'dashboard-refresh'
    });
  }, [fetchData]);

  // Data processing with validation
  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    const data = typeof dashboardData === 'object' ? dashboardData : {};
    
    return {
      grid_items: Array.isArray(data.grid_items) ? data.grid_items : [],
      system_load: data.system_load || {},
      sales_data: Array.isArray(data.sales_data) ? data.sales_data : [],
      revenue_data: Array.isArray(data.revenue_data) ? data.revenue_data : [],
      financial_data: Array.isArray(data.financial_data) ? data.financial_data : [],
      visitor_data: data.visitor_data || {},
      plan_performance: Array.isArray(data.plan_performance) ? data.plan_performance : [],
      new_subscriptions: Array.isArray(data.new_subscriptions) ? data.new_subscriptions : [],
      client_types: Array.isArray(data.client_types) ? data.client_types : [],
    };
  }, [dashboardData]);

  // Memoized chart components with error boundaries
  const memoizedCharts = useMemo(() => {
    if (!processedData) return null;
    
    const { 
      grid_items, 
      system_load, 
      sales_data, 
      revenue_data, 
      financial_data, 
      visitor_data, 
      plan_performance, 
      new_subscriptions,
      client_types,
    } = processedData;

    // Check if we have any data at all
    const hasAnyData = 
      grid_items.length > 0 ||
      Object.keys(system_load).length > 0 ||
      sales_data.length > 0 ||
      revenue_data.length > 0 ||
      financial_data.length > 0 ||
      Object.keys(visitor_data).length > 0 ||
      plan_performance.length > 0 ||
      new_subscriptions.length > 0 ||
      client_types.length > 0;

    if (!hasAnyData) {
      return (
        <div className={`rounded-xl shadow-sm p-8 text-center ${
          theme === "dark" 
            ? "bg-gray-800/60 border-gray-700" 
            : "bg-white/80 border-gray-200"
        } border`}>
          <FiBarChart2 className="text-4xl mx-auto mb-4 opacity-50" />
          <h3 className={`text-lg font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            No Data Available
          </h3>
          <p className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            Dashboard data is currently empty. This might be because no data has been generated yet.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Stats Grid */}
        {grid_items.length > 0 && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {grid_items.map((item) => (
              <ErrorBoundary 
                key={item.id} 
                theme={theme} 
                chartName={`Stat Card: ${item.label}`}
                showDetails={false}
              >
                <GridCard item={item} theme={theme} />
              </ErrorBoundary>
            ))}
          </div>
        )}

        {/* System Load Monitor */}
        <div className="mt-8 sm:mt-10">
          <ChartWithRetry
            chartName="System Load Monitor"
            data={system_load}
            theme={theme}
            ChartComponent={SystemLoadMonitor}
            validationFields={['cpu', 'memory', 'disk', 'network']}
            height="h-80"
          />
        </div>

        {/* Client Type Breakdown */}
        <div className="mt-8 sm:mt-10">
          <ChartWithRetry
            chartName="Client Type Distribution"
            data={client_types}
            theme={theme}
            ChartComponent={ClientTypeBreakdown}
            height="h-80"
          />
        </div>

        {/* Performance Charts */}
        <div className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Sales Performance */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
                : "bg-white/80 backdrop-blur-md border-gray-200"
            } border transition-colors duration-200`}>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } transition-colors duration-200`}>
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } transition-colors duration-200`}>
                  Sales Performance
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } transition-colors duration-200`}>
                  Monthly sales trend with comparison to last year
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ChartWithRetry
                  chartName="Sales Performance"
                  data={sales_data}
                  theme={theme}
                  ChartComponent={SalesChart}
                />
              </div>
            </div>
            
            {/* Revenue Analysis */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
                : "bg-white/80 backdrop-blur-md border-gray-200"
            } border transition-colors duration-200`}>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } transition-colors duration-200`}>
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } transition-colors duration-200`}>
                  Revenue Analysis
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } transition-colors duration-200`}>
                  Revenue breakdown by product category
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ChartWithRetry
                  chartName="Revenue Analysis"
                  data={revenue_data}
                  theme={theme}
                  ChartComponent={RevenueChart}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Performance & Financial Overview */}
        <div className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Plan Performance */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
                : "bg-white/80 backdrop-blur-md border-gray-200"
            } border transition-colors duration-200`}>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } transition-colors duration-200`}>
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } transition-colors duration-200`}>
                  Plan Performance
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } transition-colors duration-200`}>
                  Comparison by users, revenue and data usage
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ChartWithRetry
                  chartName="Plan Performance"
                  data={plan_performance}
                  theme={theme}
                  ChartComponent={PlanPerformanceChart}
                />
              </div>
            </div>
            
            {/* Financial Overview */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
                : "bg-white/80 backdrop-blur-md border-gray-200"
            } border transition-colors duration-200`}>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } transition-colors duration-200`}>
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } transition-colors duration-200`}>
                  Financial Overview
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } transition-colors duration-200`}>
                  Quarterly financial performance
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ChartWithRetry
                  chartName="Financial Overview"
                  data={financial_data}
                  theme={theme}
                  ChartComponent={FinancialBarChart}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visitor Analytics & Subscriptions */}
        <div className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {/* Visitor Analytics */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
                : "bg-white/80 backdrop-blur-md border-gray-200"
            } border transition-colors duration-200`}>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } transition-colors duration-200`}>
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } transition-colors duration-200`}>
                  Plan Popularity
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } transition-colors duration-200`}>
                  User engagement and behavior
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ChartWithRetry
                  chartName="Plan Popularity"
                  data={visitor_data}
                  theme={theme}
                  ChartComponent={VisitorAnalyticsChart}
                />
              </div>
            </div>
            
            {/* Subscription Growth */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${
              theme === "dark" 
                ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
                : "bg-white/80 backdrop-blur-md border-gray-200"
            } border transition-colors duration-200`}>
              <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } transition-colors duration-200`}>
                <h3 className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } transition-colors duration-200`}>
                  Subscription Growth
                </h3>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                } transition-colors duration-200`}>
                  Monthly new customer acquisition
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <ChartWithRetry
                  chartName="Subscription Growth"
                  data={new_subscriptions}
                  theme={theme}
                  ChartComponent={NewSubscriptionsChart}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }, [processedData, theme]);

  // Theme-based background classes
  const containerClass = theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
    : "bg-gray-50 text-gray-800 min-h-screen";

  // Format last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div 
        className={`min-h-screen flex flex-col items-center justify-center space-y-4 p-4 transition-colors duration-300 ${containerClass}`}
      >
        <div className="flex items-center space-y-4 p-4 gap-2">
          <FaSpinner className="animate-spin text-2xl sm:text-3xl text-blue-600 dark:text-blue-400" />
          <span className={`text-base sm:text-lg font-medium mr-3 ${
            theme === "dark" ? "text-gray-300" : "text-gray-800"
          }`}>
            Loading Dashboard Insights
          </span>
        </div>
        <p className={`text-xs sm:text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          Preparing your business analytics...
        </p>
        
        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-7xl px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <GridCardSkeleton key={index} theme={theme} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div 
        className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${containerClass}`}
      >
        <div className={`max-w-md w-full rounded-xl shadow-sm p-4 sm:p-6 text-center ${
          theme === "dark" 
            ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
            : "bg-white/80 backdrop-blur-md border-gray-200"
        } border transition-colors duration-200`}>
          <div className={`mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${
            theme === "dark" ? "bg-red-900/50" : "bg-red-100"
          } mb-3 sm:mb-4 transition-colors duration-200`}>
            <IoMdAlert className={`h-5 w-5 sm:h-6 sm:w-6 ${
              theme === "dark" ? "text-red-300" : "text-red-600"
            }`} />
          </div>
          <h3 className={`text-base sm:text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          } transition-colors duration-200`}>
            Data Load Error
          </h3>
          <p className={`mt-2 text-xs sm:text-sm ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          } transition-colors duration-200`}>
            {error}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleRefresh}
              className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                theme === "dark" 
                  ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500 text-white" 
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white"
              } transition-colors duration-200`}
            >
              <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${containerClass}`}
    >
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: theme === 'dark' ? '1px solid #4B5563' : '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
          loading: {
            duration: 3000,
            iconTheme: {
              primary: '#3B82F6',
              secondary: theme === 'dark' ? '#374151' : '#fff',
            },
          },
        }}
      />
      
      <div className="space-y-8 sm:space-y-10 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } transition-colors duration-200`}>
              Diconden Dashboard
            </h1>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            } transition-colors duration-200`}>
              Real-time insights for Hotspot and PPPoE operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-xs px-3 py-1 rounded-full ${
              theme === "dark" 
                ? "bg-green-900/50 text-green-300" 
                : "bg-green-100 text-green-800"
            } transition-colors duration-200`}>
              Last updated: {formattedLastUpdated}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === "dark" 
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-blue-500" 
                  : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500"
              } border transition-colors duration-200`}
            >
              <FiRefreshCw className={`mr-2 w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={loading ? 'loading' : 'content'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {memoizedCharts}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GridStats;