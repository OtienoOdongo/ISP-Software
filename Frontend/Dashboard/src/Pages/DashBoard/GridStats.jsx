
// import React, { useState, useEffect, useCallback } from "react";
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
// import RevenueChart from "../../components/DashboardComponents/RevenueChart.jsx"
// import FinancialBarChart from "../../components/DashboardComponents/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/DashboardComponents/VisitorAnalyticsChart.jsx";
// import PlanPerformanceChart from "../../components/DashboardComponents/PlanPerformanceChart.jsx";
// import NewSubscriptionsChart from "../../components/DashboardComponents/NewSubscriptionsChart.jsx";

// const CURRENCY = "KES";

// const GridStats = () => {
//   const [gridItems, setGridItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchData = useCallback(async (signal) => {
//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       if (signal.aborted) return;

//       const mockGridItems = [
//         {
//           id: 1,
//           label: "Current Online Users",
//           value: "1,234",
//           comparison: "vs 1,173 yesterday",
//           icon: (
//             <div className="relative">
//               <FaUserCheck className="text-3xl" />
//               <FaCircle className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-pulse" />
//             </div>
//           ),
//           rate: 5.2,
//           trend: "up",
//           bgColor: "bg-indigo-100",
//           iconColor: "text-indigo-600",
//           borderColor: "border-indigo-200",
//           fontStyle: "font-semibold italic"
//         },
//         {
//           id: 2,
//           label: "Total Clients",
//           value: "5,678",
//           comparison: "vs 5,432 last month",
//           icon: <FiUserPlus className="text-3xl" />,
//           rate: 4.5,
//           trend: "up",
//           bgColor: "bg-teal-100",
//           iconColor: "text-teal-600",
//           borderColor: "border-teal-200",
//           fontStyle: "font-medium"
//         },
//         {
//           id: 3,
//           label: "Monthly Revenue",
//           value: `${CURRENCY} 1,200,000`,
//           comparison: `vs ${CURRENCY} 1,150,000 last month`,
//           icon: <FiDollarSign className="text-3xl" />,
//           rate: 4.3,
//           trend: "up",
//           bgColor: "bg-emerald-100",
//           iconColor: "text-emerald-600",
//           borderColor: "border-emerald-200",
//           fontStyle: "font-bold"
//         },
//         {
//           id: 4,
//           label: "Today's Revenue",
//           value: `${CURRENCY} 45,000`,
//           comparison: `vs ${CURRENCY} 42,000 yesterday`,
//           icon: <FiActivity className="text-3xl" />,
//           rate: 7.1,
//           trend: "up",
//           bgColor: "bg-amber-100",
//           iconColor: "text-amber-600",
//           borderColor: "border-amber-200",
//           fontStyle: "font-medium italic"
//         },
//         {
//           id: 5,
//           label: "Churn Rate",
//           value: "2.5%",
//           comparison: "vs 3.7% last quarter",
//           icon: <FiTrendingDown className="text-3xl" />,
//           rate: -1.2,
//           trend: "down",
//           bgColor: "bg-rose-100",
//           iconColor: "text-rose-600",
//           borderColor: "border-rose-200",
//           fontStyle: "font-semibold"
//         },
//         {
//           id: 6,
//           label: "Average Revenue Per User",
//           value: `${CURRENCY} 1,500`,
//           comparison: `vs ${CURRENCY} 1,450 last month`,
//           icon: <FiBarChart2 className="text-3xl" />,
//           rate: 3.4,
//           trend: "up",
//           bgColor: "bg-violet-100",
//           iconColor: "text-violet-600",
//           borderColor: "border-violet-200",
//           fontStyle: "font-medium"
//         },
//         {
//           id: 7,
//           label: "Network Uptime",
//           value: "99.9%",
//           comparison: "vs 99.8% last month",
//           icon: <FiWifi className="text-3xl" />,
//           rate: 0.1,
//           trend: "up",
//           bgColor: "bg-sky-100",
//           iconColor: "text-sky-600",
//           borderColor: "border-sky-200",
//           fontStyle: "font-bold italic"
//         },
//         {
//           id: 8,
//           label: "Bandwidth Usage",
//           value: "50 Mbps",
//           comparison: "vs 48 Mbps last week",
//           icon: <FiServer className="text-3xl" />,
//           rate: 4.2,
//           trend: "up",
//           bgColor: "bg-blue-100",
//           iconColor: "text-blue-600",
//           borderColor: "border-blue-200",
//           fontStyle: "font-semibold"
//         },
//       ];

//       setGridItems(mockGridItems);
//       setLoading(false);
//     } catch (err) {
//       if (signal.aborted) return;
//       setError(err.message || "Failed to load dashboard data.");
//       setLoading(false);
//     }
//   }, []);

 
//   useEffect(() => {
//     const controller = new AbortController();
//     fetchData(controller.signal);
//     return () => controller.abort();
//   }, [fetchData]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
//         <div className="flex items-center space-x-3">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="text-lg font-medium text-gray-800">
//             Loading Dashboard Insights
//           </span>
//         </div>
//         <p className="text-sm text-gray-500">
//           Preparing your business analytics...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
//         <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//             <IoMdAlert className="h-6 w-6 text-red-600" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900">Data Load Error</h3>
//           <p className="mt-2 text-sm text-gray-600">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//           >
//             <FiRefreshCw className="mr-2" />
//             Refresh Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 font-sans">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {gridItems.map((item) => (
//           <GridCard key={item.id} item={item} />
//         ))}
//       </div>

//       {/* System Load Monitor - Full width */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <SystemLoadMonitor />
//       </div>

//       {/* Performance Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
//             <p className="mt-1 text-sm text-gray-500">Monthly sales trend with comparison to last year</p>
//           </div>
//           <div className="p-6">
//             <SalesChart />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
//             <p className="mt-1 text-sm text-gray-500">Revenue breakdown by product category</p>
//           </div>
//           <div className="p-6">
//             <RevenueChart />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <PlanPerformanceChart />
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
//             <p className="mt-1 text-sm text-gray-500">Quarterly financial performance</p>
//           </div>
//           <div className="p-6">
//             <FinancialBarChart />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Visitor Analytics</h3>
//             <p className="mt-1 text-sm text-gray-500">User engagement and behavior</p>
//           </div>
//           <div className="p-6">
//             <VisitorAnalyticsChart />
//           </div>
//         </div>
//         <NewSubscriptionsChart />
//       </div>
//     </div>
//   );
// };

// const GridCard = ({ item }) => {
//   return (
//     <div
//       className={`bg-white rounded-xl shadow-sm border ${item.borderColor} overflow-hidden transition-all hover:shadow-md`}
//     >
//       <div className="p-6">
//         <div className="flex justify-between items-start">
//           <div
//             className={`flex items-center justify-center w-14 h-14 rounded-lg ${item.bgColor} ${item.iconColor}`}
//           >
//             {item.icon}
//           </div>

//           <div
//             className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//               item.trend === "up"
//                 ? "bg-green-100 text-green-800"
//                 : "bg-red-100 text-red-800"
//             }`}
//           >
//             {item.trend === "up" ? (
//               <FiTrendingUp className="mr-1" />
//             ) : (
//               <FiTrendingDown className="mr-1" />
//             )}
//             {Math.abs(item.rate)}%
//           </div>
//         </div>

//         <div className="mt-6">
//           <h3 className={`text-sm text-gray-500 uppercase tracking-wider ${item.fontStyle}`}>
//             {item.label}
//           </h3>
//           <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
//           <p className="mt-1 text-xs text-gray-500">{item.comparison}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// GridCard.propTypes = {
//   item: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     label: PropTypes.string.isRequired,
//     value: PropTypes.string.isRequired,
//     comparison: PropTypes.string.isRequired,
//     icon: PropTypes.element.isRequired,
//     rate: PropTypes.number.isRequired,
//     trend: PropTypes.oneOf(["up", "down"]).isRequired,
//     bgColor: PropTypes.string.isRequired,
//     iconColor: PropTypes.string.isRequired,
//     borderColor: PropTypes.string.isRequired,
//     fontStyle: PropTypes.string.isRequired,
//   }).isRequired,
// };

// export default GridStats;





// import React, { useState, useEffect, useCallback } from "react";
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
// import api from "../../api";


// const CURRENCY = "KES";

// const GridStats = () => {
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchData = useCallback(async (signal) => {
//     try {
//       const response = await api.get('/api/dashboard/', { signal });
//       setDashboardData(response.data);
//       setLoading(false);
//     } catch (err) {
//       if (err.name === 'AbortError') return;
//       setError(err.response?.data?.error || "Failed to load dashboard data.");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const controller = new AbortController();
//     fetchData(controller.signal);
//     return () => controller.abort();
//   }, [fetchData]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
//         <div className="flex items-center space-x-3">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="text-lg font-medium text-gray-800">
//             Loading Dashboard Insights
//           </span>
//         </div>
//         <p className="text-sm text-gray-500">
//           Preparing your business analytics...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
//         <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//             <IoMdAlert className="h-6 w-6 text-red-600" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900">Data Load Error</h3>
//           <p className="mt-2 text-sm text-gray-600">{error}</p>
//           <button
//             onClick={() => fetchData(new AbortController().signal)}
//             className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//           >
//             <FiRefreshCw className="mr-2" />
//             Refresh Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const { grid_items, system_load, sales_data, revenue_data, financial_data, visitor_data, plan_performance, new_subscriptions } = dashboardData;

//   return (
//     <div className="space-y-6 font-sans">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {grid_items.map((item) => (
//           <GridCard key={item.id} item={item} />
//         ))}
//       </div>

//       {/* System Load Monitor */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <SystemLoadMonitor data={system_load} />
//       </div>

//       {/* Performance Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
//             <p className="mt-1 text-sm text-gray-500">Monthly sales trend with comparison to last year</p>
//           </div>
//           <div className="p-6">
//             <SalesChart data={sales_data} />
//           </div>
//         </div>
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
//             <p className="mt-1 text-sm text-gray-500">Revenue breakdown by product category</p>
//           </div>
//           <div className="p-6">
//             <RevenueChart data={revenue_data} />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <PlanPerformanceChart data={plan_performance} />
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
//             <p className="mt-1 text-sm text-gray-500">Quarterly financial performance</p>
//           </div>
//           <div className="p-6">
//             <FinancialBarChart data={financial_data} />
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h3 className="text-lg font-bold text-gray-900">Visitor Analytics</h3>
//             <p className="mt-1 text-sm text-gray-500">User engagement and behavior</p>
//           </div>
//           <div className="p-6">
//             <VisitorAnalyticsChart data={visitor_data} />
//           </div>
//         </div>
//         <NewSubscriptionsChart data={new_subscriptions} />
//       </div>
//     </div>
//   );
// };

// const GridCard = ({ item }) => {
//   const iconMap = {
//     FaUserCheck: (
//       <div className="relative">
//         <FaUserCheck className="text-3xl" />
//         <FaCircle className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-pulse" />
//       </div>
//     ),
//     FiUserPlus: <FiUserPlus className="text-3xl" />,
//     FiDollarSign: <FiDollarSign className="text-3xl" />,
//     FiActivity: <FiActivity className="text-3xl" />,
//     FiTrendingDown: <FiTrendingDown className="text-3xl" />,
//     FiBarChart2: <FiBarChart2 className="text-3xl" />,
//     FiWifi: <FiWifi className="text-3xl" />,
//     FiServer: <FiServer className="text-3xl" />,
//   };

//   return (
//     <div
//       className={`bg-white rounded-xl shadow-sm border ${item.borderColor} overflow-hidden transition-all hover:shadow-md`}
//     >
//       <div className="p-6">
//         <div className="flex justify-between items-start">
//           <div
//             className={`flex items-center justify-center w-14 h-14 rounded-lg ${item.bgColor} ${item.iconColor}`}
//           >
//             {iconMap[item.icon] || <FiBarChart2 className="text-3xl" />}
//           </div>

//           <div
//             className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//               item.trend === "up"
//                 ? "bg-green-100 text-green-800"
//                 : "bg-red-100 text-red-800"
//             }`}
//           >
//             {item.trend === "up" ? (
//               <FiTrendingUp className="mr-1" />
//             ) : (
//               <FiTrendingDown className="mr-1" />
//             )}
//             {Math.abs(item.rate)}%
//           </div>
//         </div>

//         <div className="mt-6">
//           <h3 className={`text-sm text-gray-500 uppercase tracking-wider ${item.fontStyle}`}>
//             {item.label}
//           </h3>
//           <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
//           <p className="mt-1 text-xs text-gray-500">{item.comparison}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

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
// };

// export default GridStats;







import React, { useState, useEffect, useCallback, useRef } from "react";
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
import api from "../../api";

const CURRENCY = "KES";

const GridStats = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

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
    
    // Cleanup function that runs when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const handleRefresh = () => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for the new request
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
          <span className="text-lg font-medium text-gray-800">
            Loading Dashboard Insights
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Preparing your business analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <IoMdAlert className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Data Load Error</h3>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiRefreshCw className="mr-2" />
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { grid_items, system_load, sales_data, revenue_data, financial_data, visitor_data, plan_performance, new_subscriptions } = dashboardData;

  return (
    <div className="space-y-6 font-sans">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiRefreshCw className="mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {grid_items.map((item) => (
          <GridCard key={item.id} item={item} />
        ))}
      </div>

      {/* System Load Monitor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SystemLoadMonitor data={system_load} />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
            <p className="mt-1 text-sm text-gray-500">Monthly sales trend with comparison to last year</p>
          </div>
          <div className="p-6">
            <SalesChart data={sales_data} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
            <p className="mt-1 text-sm text-gray-500">Revenue breakdown by product category</p>
          </div>
          <div className="p-6">
            <RevenueChart data={revenue_data} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanPerformanceChart data={plan_performance} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
            <p className="mt-1 text-sm text-gray-500">Quarterly financial performance</p>
          </div>
          <div className="p-6">
            <FinancialBarChart data={financial_data} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Visitor Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">User engagement and behavior</p>
          </div>
          <div className="p-6">
            <VisitorAnalyticsChart data={visitor_data} />
          </div>
        </div>
        <NewSubscriptionsChart data={new_subscriptions} />
      </div>
    </div>
  );
};

const GridCard = ({ item }) => {
  const iconMap = {
    FaUserCheck: (
      <div className="relative">
        <FaUserCheck className="text-3xl" />
        <FaCircle className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-pulse" />
      </div>
    ),
    FiUserPlus: <FiUserPlus className="text-3xl" />,
    FiDollarSign: <FiDollarSign className="text-3xl" />,
    FiActivity: <FiActivity className="text-3xl" />,
    FiTrendingDown: <FiTrendingDown className="text-3xl" />,
    FiBarChart2: <FiBarChart2 className="text-3xl" />,
    FiWifi: <FiWifi className="text-3xl" />,
    FiServer: <FiServer className="text-3xl" />,
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${item.borderColor} overflow-hidden transition-all hover:shadow-md`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-lg ${item.bgColor} ${item.iconColor}`}
          >
            {iconMap[item.icon] || <FiBarChart2 className="text-3xl" />}
          </div>

          <div
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              item.trend === "up"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.trend === "up" ? (
              <FiTrendingUp className="mr-1" />
            ) : (
              <FiTrendingDown className="mr-1" />
            )}
            {Math.abs(item.rate)}%
          </div>
        </div>

        <div className="mt-6">
          <h3 className={`text-sm text-gray-500 uppercase tracking-wider ${item.fontStyle}`}>
            {item.label}
          </h3>
          <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
          <p className="mt-1 text-xs text-gray-500">{item.comparison}</p>
        </div>
      </div>
    </div>
  );
};

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
};

export default GridStats;