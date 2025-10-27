





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
// import { useTheme } from "../../context/ThemeContext";
// import api from "../../api";
// import { motion, AnimatePresence } from "framer-motion";

// const CURRENCY = "KES";

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
// };

// // Memoized GridCard component to prevent unnecessary re-renders
// const GridCard = React.memo(({ item, theme }) => {
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
//   const abortControllerRef = useRef(null);
//   const { theme } = useTheme();

//   // Memoized fetch function with useCallback to prevent unnecessary recreations
//   const fetchData = useCallback(async (signal) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get('/api/dashboard/', { signal });
//       setDashboardData(response.data);
//       setLoading(false);
//     } catch (err) {
//       if (err.name === 'AbortError' || err.message === 'canceled') {
//         console.log('Request was canceled');
//         return;
//       }
//       setError(err.response?.data?.error || "Failed to load dashboard data.");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     abortControllerRef.current = new AbortController();
//     fetchData(abortControllerRef.current.signal);
    
//     return () => {
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

//   // Memoized chart components with theme to prevent unnecessary re-renders
//   const memoizedCharts = useMemo(() => {
//     if (!dashboardData) return null;
    
//     const { grid_items, system_load, sales_data, revenue_data, financial_data, visitor_data, plan_performance, new_subscriptions } = dashboardData;
    
//     return (
//       <>
//         {/* Stats Grid - Responsive columns */}
//         <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
//           {grid_items.map((item) => (
//             <GridCard key={item.id} item={item} theme={theme} />
//           ))}
//         </div>

//         {/* System Load Monitor */}
//         <SystemLoadMonitor data={system_load} theme={theme} />

//         {/* Performance Charts - Responsive layout */}
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
//           <div className={`rounded-xl shadow-sm overflow-hidden ${
//             theme === "dark" 
//               ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//               : "bg-white/80 backdrop-blur-md border-gray-200"
//           } border`}>
//             <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//               theme === "dark" ? "border-gray-700" : "border-gray-200"
//             }`}>
//               <h3 className={`text-lg font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-900"
//               }`}>Sales Performance</h3>
//               <p className={`mt-1 text-sm ${
//                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//               }`}>Monthly sales trend with comparison to last year</p>
//             </div>
//             <div className="p-4 sm:p-6">
//               <SalesChart data={sales_data} theme={theme} />
//             </div>
//           </div>
          
//           <div className={`rounded-xl shadow-sm overflow-hidden ${
//             theme === "dark" 
//               ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//               : "bg-white/80 backdrop-blur-md border-gray-200"
//           } border`}>
//             <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//               theme === "dark" ? "border-gray-700" : "border-gray-200"
//             }`}>
//               <h3 className={`text-lg font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-900"
//               }`}>Revenue Analysis</h3>
//               <p className={`mt-1 text-sm ${
//                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//               }`}>Revenue breakdown by product category</p>
//             </div>
//             <div className="p-4 sm:p-6">
//               <RevenueChart data={revenue_data} theme={theme} />
//             </div>
//           </div>
//         </div>

//         {/* Plan Performance & Financial Overview */}
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
//           <PlanPerformanceChart data={plan_performance} theme={theme} />
          
//           <div className={`rounded-xl shadow-sm overflow-hidden ${
//             theme === "dark" 
//               ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//               : "bg-white/80 backdrop-blur-md border-gray-200"
//           } border`}>
//             <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//               theme === "dark" ? "border-gray-700" : "border-gray-200"
//             }`}>
//               <h3 className={`text-lg font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-900"
//               }`}>Financial Overview</h3>
//               <p className={`mt-1 text-sm ${
//                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//               }`}>Quarterly financial performance</p>
//             </div>
//             <div className="p-4 sm:p-6">
//               <FinancialBarChart data={financial_data} theme={theme} />
//             </div>
//           </div>
//         </div>

//         {/* Visitor Analytics & Subscriptions */}
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
//           <div className={`rounded-xl shadow-sm overflow-hidden ${
//             theme === "dark" 
//               ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//               : "bg-white/80 backdrop-blur-md border-gray-200"
//           } border`}>
//             <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//               theme === "dark" ? "border-gray-700" : "border-gray-200"
//             }`}>
//               <h3 className={`text-lg font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-900"
//               }`}>Visitor Analytics</h3>
//               <p className={`mt-1 text-sm ${
//                 theme === "dark" ? "text-gray-400" : "text-gray-500"
//               }`}>User engagement and behavior</p>
//             </div>
//             <div className="p-4 sm:p-6">
//               <VisitorAnalyticsChart data={visitor_data} theme={theme} />
//             </div>
//           </div>
          
//           <NewSubscriptionsChart data={new_subscriptions} theme={theme} />
//         </div>
//       </>
//     );
//   }, [dashboardData, theme]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] space-y-4 p-4">
//         <div className="flex items-center space-x-3">
//           <FaSpinner className="animate-spin text-2xl sm:text-3xl text-blue-600 dark:text-blue-400" />
//           <span className={`text-base sm:text-lg font-medium ${
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
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] p-4 sm:p-6">
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
//           <button
//             onClick={handleRefresh}
//             className={`mt-4 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm ${
//               theme === "dark" 
//                 ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500" 
//                 : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
//             } text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
//           >
//             <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
//             Refresh Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       {/* Refresh button */}
//       <div className="flex justify-end">
//         <button
//           onClick={handleRefresh}
//           className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//             theme === "dark" 
//               ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-blue-500" 
//               : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500"
//           } border`}
//         >
//           <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
//           Refresh Data
//         </button>
//       </div>

//       {memoizedCharts}
//     </div>
//   );
// };

// export default GridStats;









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
} from "react-icons/fi";
import { FaSpinner, FaUserCheck, FaCircle } from "react-icons/fa";
import { IoMdAlert } from "react-icons/io";
import SystemLoadMonitor from "../../components/DashboardComponents/SystemLoadMonitor.jsx";
import SalesChart from "../../components/DashboardComponents/SalesChart.jsx";
import RevenueChart from "../../components/DashboardComponents/RevenueChart.jsx";
import FinancialBarChart from "../../components/DashboardComponents/FinancialBarChart.jsx";
import VisitorAnalyticsChart from "../../components/DashboardComponents/VisitorAnalyticsChart.jsx";
import PlanPerformanceChart from "../../components/DashboardComponents/PlanPerformanceChart.jsx";
import NewSubscriptionsChart from "../../components/DashboardComponents/NewSubscriptionsChart.jsx";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const CURRENCY = "KES";

// Memoized icon mapping to prevent recreation on each render
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
};

// Memoized GridCard component to prevent unnecessary re-renders
const GridCard = React.memo(({ item, theme }) => {
  return (
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
            } theme-transition`}
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
          } theme-transition`}>
            {item.label}
          </h3>
          <p className={`mt-1 sm:mt-2 text-xl sm:text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          } theme-transition`}>{item.value}</p>
          <p className={`mt-1 text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          } theme-transition`}>{item.comparison}</p>
        </div>
      </div>
    </motion.div>
  );
});

GridCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
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

const GridStats = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const { theme } = useTheme();

  // Memoized fetch function with useCallback to prevent unnecessary recreations
  const fetchData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/dashboard/', { signal });
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log('Request was canceled');
        return;
      }
      setError(err.response?.data?.error || "Failed to load dashboard data.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const handleRefresh = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
  };

  // Memoized chart components with theme to prevent unnecessary re-renders
  const memoizedCharts = useMemo(() => {
    if (!dashboardData) return null;
    
    const { grid_items, system_load, sales_data, revenue_data, financial_data, visitor_data, plan_performance, new_subscriptions } = dashboardData;
    
    return (
      <>
        {/* Stats Grid - Responsive columns */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {grid_items.map((item) => (
            <GridCard key={item.id} item={item} theme={theme} />
          ))}
        </div>

        {/* System Load Monitor */}
        <SystemLoadMonitor data={system_load} theme={theme} />

        {/* Performance Charts - Responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className={`rounded-xl shadow-sm overflow-hidden ${
            theme === "dark" 
              ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
              : "bg-white/80 backdrop-blur-md border-gray-200"
          } border`}>
            <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <h3 className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>Sales Performance</h3>
              <p className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>Monthly sales trend with comparison to last year</p>
            </div>
            <div className="p-4 sm:p-6">
              <SalesChart data={sales_data} theme={theme} />
            </div>
          </div>
          
          <div className={`rounded-xl shadow-sm overflow-hidden ${
            theme === "dark" 
              ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
              : "bg-white/80 backdrop-blur-md border-gray-200"
          } border`}>
            <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <h3 className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>Revenue Analysis</h3>
              <p className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>Revenue breakdown by product category</p>
            </div>
            <div className="p-4 sm:p-6">
              <RevenueChart data={revenue_data} theme={theme} />
            </div>
          </div>
        </div>

        {/* Plan Performance & Financial Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <PlanPerformanceChart data={plan_performance} theme={theme} />
          
          <div className={`rounded-xl shadow-sm overflow-hidden ${
            theme === "dark" 
              ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
              : "bg-white/80 backdrop-blur-md border-gray-200"
          } border`}>
            <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <h3 className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>Financial Overview</h3>
              <p className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>Quarterly financial performance</p>
            </div>
            <div className="p-4 sm:p-6">
              <FinancialBarChart data={financial_data} theme={theme} />
            </div>
          </div>
        </div>

        {/* Visitor Analytics & Subscriptions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className={`rounded-xl shadow-sm overflow-hidden ${
            theme === "dark" 
              ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
              : "bg-white/80 backdrop-blur-md border-gray-200"
          } border`}>
            <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <h3 className={`text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>Visitor Analytics</h3>
              <p className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>User engagement and behavior</p>
            </div>
            <div className="p-4 sm:p-6">
              <VisitorAnalyticsChart data={visitor_data} theme={theme} />
            </div>
          </div>
          
          <NewSubscriptionsChart data={new_subscriptions} theme={theme} />
        </div>
      </>
    );
  }, [dashboardData, theme]);

  // Theme-based background classes
  const containerClass = theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
    : "bg-gray-50 text-gray-800 min-h-screen";

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 p-4 transition-colors duration-300 ${containerClass}`}>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${containerClass}`}>
        <div className={`max-w-md w-full rounded-xl shadow-sm p-4 sm:p-6 text-center ${
          theme === "dark" 
            ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
            : "bg-white/80 backdrop-blur-md border-gray-200"
        } border`}>
          <div className={`mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${
            theme === "dark" ? "bg-red-900/50" : "bg-red-100"
          } mb-3 sm:mb-4`}>
            <IoMdAlert className={`h-5 w-5 sm:h-6 sm:w-6 ${
              theme === "dark" ? "text-red-300" : "text-red-600"
            }`} />
          </div>
          <h3 className={`text-base sm:text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>Data Load Error</h3>
          <p className={`mt-2 text-xs sm:text-sm ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>{error}</p>
          <button
            onClick={handleRefresh}
            className={`mt-4 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm ${
              theme === "dark" 
                ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            } text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Refresh button */}
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === "dark" 
                ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-blue-500" 
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500"
            } border`}
          >
            <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
            Refresh Data
          </button>
        </div>

        {memoizedCharts}
      </div>
    </div>
  );
};

export default GridStats;