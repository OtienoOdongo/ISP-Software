
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

//   // Theme-based background classes
//   const containerClass = theme === "dark" 
//     ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
//     : "bg-gray-50 text-gray-800 min-h-screen";

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
//       </div>
//     );
//   }

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
//     <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
//       <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//         {/* Refresh button */}
//         <div className="flex justify-end">
//           <button
//             onClick={handleRefresh}
//             className={`inline-flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-blue-500" 
//                 : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500"
//             } border`}
//           >
//             <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
//             Refresh Data
//           </button>
//         </div>

//         {memoizedCharts}
//       </div>
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
  FiUsers,
  FiGlobe,
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
import DataUsageChart from "../../components/DashboardComponents/DataUsageChart.jsx";
import ClientTypeBreakdown from "../../components/DashboardComponents/ClientTypeBreakdown.jsx";
import RouterHealthOverview from "../../components/DashboardComponents/RouterHealthOverview.jsx";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const CURRENCY = "KES";

// Utility functions
const formatCurrency = (amount, currency = CURRENCY) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('en-KE').format(number);
};

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

const formatDataSize = (bytes) => {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / (1024 ** 3)).toFixed(1)} GB`;
  } else if (bytes >= 1024 ** 2) {
    return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
};

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
  FiTrendingUp: <FiTrendingUp className="text-2xl sm:text-3xl" />,
  FiUsers: <FiUsers className="text-2xl sm:text-3xl" />,
  FiGlobe: <FiGlobe className="text-2xl sm:text-3xl" />,
};

// Error Boundary Component
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`flex flex-col items-center justify-center h-64 rounded-lg border ${
          this.props.theme === "dark" 
            ? "bg-gray-800/50 border-gray-700 text-gray-400" 
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          <IoMdAlert className="text-2xl mb-2" />
          <p className="text-sm font-medium">Failed to load {this.props.chartName}</p>
          <p className="text-xs mt-1">Please try refreshing the page</p>
          {this.props.showRetry && (
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ChartErrorBoundary.propTypes = {
  children: PropTypes.node,
  chartName: PropTypes.string.isRequired,
  theme: PropTypes.oneOf(["light", "dark"]),
  showRetry: PropTypes.bool,
};

ChartErrorBoundary.defaultProps = {
  showRetry: true,
  theme: "light",
};

// Loading Skeleton Component
const GridCardSkeleton = ({ theme }) => (
  <div className={`rounded-xl shadow-sm overflow-hidden animate-pulse ${
    theme === "dark" 
      ? "bg-gray-800/60 border-gray-700" 
      : "bg-white/80 border-gray-200"
  } border`}>
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`} />
        <div className={`w-16 h-6 rounded-full ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`} />
      </div>
      <div className="mt-4 sm:mt-6 space-y-2">
        <div className={`w-3/4 h-4 rounded ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`} />
        <div className={`w-1/2 h-6 rounded ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`} />
        <div className={`w-full h-3 rounded ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`} />
      </div>
    </div>
  </div>
);

GridCardSkeleton.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

// Memoized GridCard component to prevent unnecessary re-renders
const GridCard = React.memo(({ item, theme }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <GridCardSkeleton theme={theme} />;
  }

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
  const [chartLoading, setChartLoading] = useState({});
  const abortControllerRef = useRef(null);
  const { theme } = useTheme();

  // Memoized fetch function with useCallback to prevent unnecessary recreations
  const fetchData = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);
      setChartLoading({});
      
      const response = await api.get('/api/dashboard/', { signal });
      
      // Validate response data structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid dashboard data format');
      }
      
      setDashboardData(response.data);
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log('Request was canceled');
        return;
      }
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          "Failed to load dashboard data.";
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  // Handle individual chart load
  const handleChartLoad = useCallback((chartName) => {
    setChartLoading(prev => ({ ...prev, [chartName]: false }));
  }, []);

  // Handle individual chart error
  const handleChartError = useCallback((chartName, error) => {
    console.error(`Chart ${chartName} error:`, error);
    setChartLoading(prev => ({ ...prev, [chartName]: false }));
  }, []);

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

  const handleRefresh = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
  };

  // Validate and process dashboard data
  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    // Ensure all required data arrays exist
    return {
      grid_items: Array.isArray(dashboardData.grid_items) ? dashboardData.grid_items : [],
      system_load: dashboardData.system_load || {},
      sales_data: Array.isArray(dashboardData.sales_data) ? dashboardData.sales_data : [],
      revenue_data: Array.isArray(dashboardData.revenue_data) ? dashboardData.revenue_data : [],
      financial_data: Array.isArray(dashboardData.financial_data) ? dashboardData.financial_data : [],
      visitor_data: dashboardData.visitor_data || {},
      plan_performance: Array.isArray(dashboardData.plan_performance) ? dashboardData.plan_performance : [],
      new_subscriptions: Array.isArray(dashboardData.new_subscriptions) ? dashboardData.new_subscriptions : [],
      data_usage: Array.isArray(dashboardData.data_usage) ? dashboardData.data_usage : [],
      client_types: Array.isArray(dashboardData.client_types) ? dashboardData.client_types : [],
      router_health: Array.isArray(dashboardData.router_health) ? dashboardData.router_health : [],
    };
  }, [dashboardData]);

  // Memoized chart components with theme to prevent unnecessary re-renders
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
      data_usage,
      client_types,
      router_health
    } = processedData;

    return (
      <>
        {/* Stats Grid - Responsive columns */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {grid_items.map((item) => (
            <GridCard key={item.id} item={item} theme={theme} />
          ))}
        </div>

        {/* System Load Monitor */}
        <div className="mt-8 sm:mt-10">
          <ChartErrorBoundary chartName="System Load Monitor" theme={theme}>
            <SystemLoadMonitor 
              data={system_load} 
              theme={theme}
              onLoad={() => handleChartLoad('system_load')}
              onError={(error) => handleChartError('system_load', error)}
            />
          </ChartErrorBoundary>
        </div>

        {/* Client Type Breakdown */}
        {client_types.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <ChartErrorBoundary chartName="Client Type Breakdown" theme={theme}>
              <ClientTypeBreakdown 
                data={client_types} 
                theme={theme}
                onLoad={() => handleChartLoad('client_types')}
                onError={(error) => handleChartError('client_types', error)}
              />
            </ChartErrorBoundary>
          </div>
        )}

        {/* Performance Charts - Responsive layout */}
        <div className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <ChartErrorBoundary chartName="Sales Performance" theme={theme}>
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
                  <SalesChart 
                    data={sales_data} 
                    theme={theme}
                    onLoad={() => handleChartLoad('sales')}
                    onError={(error) => handleChartError('sales', error)}
                  />
                </div>
              </div>
            </ChartErrorBoundary>
            
            <ChartErrorBoundary chartName="Revenue Analysis" theme={theme}>
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
                  <RevenueChart 
                    data={revenue_data} 
                    theme={theme}
                    onLoad={() => handleChartLoad('revenue')}
                    onError={(error) => handleChartError('revenue', error)}
                  />
                </div>
              </div>
            </ChartErrorBoundary>
          </div>
        </div>

        {/* Data Usage Analytics */}
        {data_usage.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <ChartErrorBoundary chartName="Data Usage Analytics" theme={theme}>
              <DataUsageChart 
                data={data_usage} 
                theme={theme}
                onLoad={() => handleChartLoad('data_usage')}
                onError={(error) => handleChartError('data_usage', error)}
              />
            </ChartErrorBoundary>
          </div>
        )}

        {/* Plan Performance & Financial Overview */}
        <div className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <ChartErrorBoundary chartName="Plan Performance" theme={theme}>
              <PlanPerformanceChart 
                data={plan_performance} 
                theme={theme}
                onLoad={() => handleChartLoad('plan_performance')}
                onError={(error) => handleChartError('plan_performance', error)}
              />
            </ChartErrorBoundary>
            
            <ChartErrorBoundary chartName="Financial Overview" theme={theme}>
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
                  <FinancialBarChart 
                    data={financial_data} 
                    theme={theme}
                    onLoad={() => handleChartLoad('financial')}
                    onError={(error) => handleChartError('financial', error)}
                  />
                </div>
              </div>
            </ChartErrorBoundary>
          </div>
        </div>

        {/* Router Health Overview */}
        {router_health.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <ChartErrorBoundary chartName="Router Health Overview" theme={theme}>
              <RouterHealthOverview 
                data={router_health} 
                theme={theme}
                onLoad={() => handleChartLoad('router_health')}
                onError={(error) => handleChartError('router_health', error)}
              />
            </ChartErrorBoundary>
          </div>
        )}

        {/* Visitor Analytics & Subscriptions */}
        <div className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            <ChartErrorBoundary chartName="Visitor Analytics" theme={theme}>
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
                  }`}>Plan Popularity</h3>
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>User engagement and behavior</p>
                </div>
                <div className="p-4 sm:p-6">
                  <VisitorAnalyticsChart 
                    data={visitor_data} 
                    theme={theme}
                    onLoad={() => handleChartLoad('visitor_analytics')}
                    onError={(error) => handleChartError('visitor_analytics', error)}
                  />
                </div>
              </div>
            </ChartErrorBoundary>
            
            <ChartErrorBoundary chartName="Subscription Growth" theme={theme}>
              <NewSubscriptionsChart 
                data={new_subscriptions} 
                theme={theme}
                onLoad={() => handleChartLoad('subscriptions')}
                onError={(error) => handleChartError('subscriptions', error)}
              />
            </ChartErrorBoundary>
          </div>
        </div>
      </>
    );
  }, [processedData, theme, handleChartLoad, handleChartError]);

  // Theme-based background classes
  const containerClass = theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen" 
    : "bg-gray-50 text-gray-800 min-h-screen";

  // Loading state with enhanced UI
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
        
        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full max-w-7xl px-4">
          {Array.from({ length: 14 }).map((_, index) => (
            <GridCardSkeleton key={index} theme={theme} />
          ))}
        </div>
      </div>
    );
  }

  // Error state with enhanced UI
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
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleRefresh}
              className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm ${
                theme === "dark" 
                  ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500" 
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              } text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
              Refresh Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm border ${
                theme === "dark" 
                  ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200" 
                  : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!processedData || !processedData.grid_items || processedData.grid_items.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${containerClass}`}>
        <div className={`max-w-md w-full rounded-xl shadow-sm p-4 sm:p-6 text-center ${
          theme === "dark" 
            ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
            : "bg-white/80 backdrop-blur-md border-gray-200"
        } border`}>
          <div className={`mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${
            theme === "dark" ? "bg-yellow-900/50" : "bg-yellow-100"
          } mb-3 sm:mb-4`}>
            <IoMdAlert className={`h-5 w-5 sm:h-6 sm:w-6 ${
              theme === "dark" ? "text-yellow-300" : "text-yellow-600"
            }`} />
          </div>
          <h3 className={`text-base sm:text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>No Data Available</h3>
          <p className={`mt-2 text-xs sm:text-sm ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}>
            There is no dashboard data available at the moment.
          </p>
          <button
            onClick={handleRefresh}
            className={`mt-4 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm ${
              theme === "dark" 
                ? "bg-blue-700 hover:bg-blue-600 focus:ring-blue-500" 
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            } text-white focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <FiRefreshCw className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
      <div className="space-y-8 sm:space-y-10 p-4 sm:p-6">
        {/* Header with Refresh button and stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Diconden Dashboard
            </h1>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Real-time insights for Hotspot and PPPoE operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-xs px-3 py-1 rounded-full ${
              theme === "dark" 
                ? "bg-green-900/50 text-green-300" 
                : "bg-green-100 text-green-800"
            }`}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
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

GridStats.propTypes = {
  // Add any props if needed in the future
};

export default GridStats;