// import RevenueChart from "../../components/RevenueChart.jsx";
// import SalesChart from "../../components/SalesChart.jsx";
// import { gridData } from "../../constants/index.jsx";
// import { HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
// import FinancialBarChart from "../../components/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";

// const GridStats = () => {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//       {/* Dynamically rendered grid items */}
//       {gridData.map((item, index) => (
//         <GridWrapper key={index}>
//           <div className="relative">
//             <div className="w-12 h-12 text-2xl flex items-center justify-between">
//               {/* Render dynamic icons */}
//               {item.userIcon || item.customersIcon || item.incomeIcon || item.connectIcon}
//               <div className="px-10 text-xl flex items-center justify-between">
//                 {item.totalUsers || item.totalClients || item.totalIncome || item.totalConnect}
//               </div>
//             </div>
//             <div className="pt-3 text-xl text-gray-700 font-light">
//               {item.userLabel || item.customerLabel || item.incomeLabel || item.connectLabel}
//             </div>
//             <div className="absolute w-12 h-12 -top-7 -right-6">
//               {item.signalIcon || item.customerGroupIcon || item.networthIcon || item.otherConnectIcon}
//             </div>
//           </div>
//           <div className="relative">
//             <p
//               className={`flex gap-1 items-center text-base font-semibold 
//               ${(item.userRate > 0 || item.customerRate > 0 || item.incomeRate > 0 || item.connectRate > 0) 
//                   ? "text-emerald-500" : "text-red-500"} absolute -bottom-7 -right-7`}
//             >
//               {(item.userRate > 0 || item.customerRate > 0 || item.incomeRate > 0 || item.connectRate > 0)
//                  ? <HiOutlineArrowUp /> : <HiOutlineArrowDown />}
//               {item.userRate || item.customerRate || item.incomeRate || item.connectRate}%
//             </p>
//           </div>
//         </GridWrapper>
//       ))}

//       {/* Sales Chart */}
//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
//         <SalesChart />
//       </GridWrapper>

//       {/* Revenue Chart */}
//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px] overflow-auto">
//         <RevenueChart />
//       </GridWrapper>

//       {/* Double Region Charts with Responsive Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] lg:grid-cols-[3fr_2fr] gap-4 lg:col-span-4">
//         <GridWrapper className="h-[500px]">
//           <FinancialBarChart />
//         </GridWrapper>
//         <GridWrapper className="h-[500px]">
//           <VisitorAnalyticsChart />
//         </GridWrapper>
//       </div>
//     </div>
//   );
// };

// export default GridStats;

// const GridWrapper = ({ children, className = "" }) => {
//   return (
//     <div className={`bg-white rounded-lg p-9 border-gray-200 items-center ${className}`}>
//       {children}
//     </div>
//   );
// };




// // Pages/Dashboard/GridStats.jsx
// import React, { useState, useEffect } from "react";
// import api from "../../../api"; 
// import { HiOutlineArrowUp, HiOutlineArrowDown, HiUsers, HiOutlineUserGroup, HiOutlineCurrencyDollar, HiOutlineWifi } from "react-icons/hi";
// import { FaSpinner } from "react-icons/fa"; 
// import SalesChart from "../../components/SalesChart.jsx";
// import RevenueChart from "../../components/RevenueChart.jsx";
// import FinancialBarChart from "../../components/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";

// const GridStats = () => {
//   const [gridItems, setGridItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchGridItems = async () => {
//       try {
//         const response = await api.get("/api/dashboard/grid-items/");
//         const data = response.data;
//         setGridItems(data);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to fetch dashboard insights. Please try again.");
//         setLoading(false);
//       }
//     };
//     fetchGridItems();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//         <span className="ml-3 text-lg font-medium text-gray-700">Loading Dashboard Insights...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
//         <p className="text-red-600 font-semibold">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-2 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//       {gridItems.length > 0 ? (
//         gridItems.map((item) => (
//           <GridCard key={item.id} item={item} />
//         ))
//       ) : (
//         <PlaceholderGrid />
//       )}

//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
//         <SalesChart />
//       </GridWrapper>
//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px] overflow-auto">
//         <RevenueChart />
//       </GridWrapper>
//       <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] lg:grid-cols-[3fr_2fr] gap-6 lg:col-span-4">
//         <GridWrapper className="h-[500px]">
//           <FinancialBarChart />
//         </GridWrapper>
//         <GridWrapper className="h-[500px]">
//           <VisitorAnalyticsChart />
//         </GridWrapper>
//       </div>
//     </div>
//   );
// };

// const GridCard = ({ item }) => (
//   <GridWrapper>
//     <div className="relative flex flex-col space-y-2">
//       <div className="flex items-center space-x-4">
//         <img
//           src={`/icons/${item.icon}`}
//           alt={item.label}
//           className="w-10 h-10"
//           onError={(e) => (e.target.src = "/icons/default-icon.png")}
//         />
//         <span className="text-2xl font-semibold text-gray-800">{item.value}</span>
//       </div>
//       <span className="text-lg text-gray-600">{item.label}</span>
//       {item.signal_icon && (
//         <img
//           src={`/icons/${item.signal_icon}`}
//           alt="signal"
//           className="absolute w-8 h-8 top-0 right-0"
//           onError={(e) => (e.target.src = "/icons/default-signal.png")}
//         />
//       )}
//       <p
//         className={`flex items-center text-sm font-medium ${
//           item.rate > 0 ? "text-green-600" : "text-red-600"
//         }`}
//       >
//         {item.rate > 0 ? (
//           <HiOutlineArrowUp className="mr-1" />
//         ) : (
//           <HiOutlineArrowDown className="mr-1" />
//         )}
//         {Math.abs(item.rate)}%
//       </p>
//     </div>
//   </GridWrapper>
// );

// const PlaceholderGrid = () => (
//   <>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiUsers className="text-4xl text-blue-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Active Users</p>
//         <p className="text-2xl font-bold text-gray-800">0</p>
//         <p className="text-sm text-gray-500 mt-1">Real-time user tracking ready</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineUserGroup className="text-4xl text-green-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Total Clients</p>
//         <p className="text-2xl font-bold text-gray-800">0</p>
//         <p className="text-sm text-gray-500 mt-1">Client base syncing soon</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineCurrencyDollar className="text-4xl text-yellow-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Today’s Income</p>
//         <p className="text-2xl font-bold text-gray-800">KES 0</p>
//         <p className="text-sm text-gray-500 mt-1">Daily revenue monitoring active</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineWifi className="text-4xl text-purple-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Connectivity Hub</p>
//         <p className="text-2xl font-bold text-gray-800">0</p>
//         <p className="text-sm text-gray-500 mt-1">Network status updating</p>
//       </div>
//     </GridWrapper>
//   </>
// );

// const GridWrapper = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 ${className}`}>
//     {children}
//   </div>
// );

// export default GridStats;







// import React, { useState, useEffect } from "react";
// import {
//   HiOutlineArrowUp,
//   HiOutlineArrowDown,
//   HiUsers,
//   HiOutlineUserGroup,
//   HiOutlineCurrencyDollar,
//   HiOutlineUserRemove,
//   HiOutlineWifi,
// } from "react-icons/hi";
// import { FaSpinner } from "react-icons/fa";
// import SalesChart from "../../components/SalesChart.jsx";
// import RevenueChart from "../../components/RevenueChart.jsx";
// import FinancialBarChart from "../../components/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";
// import PlanPerformanceChart from "../../components/PlanPerformanceChart.jsx";
// import SystemLoadMonitor from "../../components/SystemLoadMonitor.jsx";
// import NewSubscriptionsChart from "../../components/NewSubscriptionsChart.jsx";

// const GridStats = () => {
//   const [gridItems, setGridItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for grid items
//     const mockGridItems = [
//       {
//         id: 1,
//         label: "Active Users",
//         value: "1,234",
//         icon: "active_users",
//         rate: 5.2,
//         signal_icon: "signal-up.png",
//       },
//       {
//         id: 2,
//         label: "Total Clients",
//         value: "5,678",
//         icon: "total_clients",
//         rate: 2.1,
//         signal_icon: "signal-up.png",
//       },
//       {
//         id: 3,
//         label: "This Month’s Income",
//         value: "KES 1,200,000",
//         icon: "this_month_income",
//         rate: 3.1,
//         signal_icon: "signal-up.png",
//       },
//       {
//         id: 4,
//         label: "Today’s Income",
//         value: "KES 45,000",
//         icon: "todays_income",
//         rate: 4.5,
//         signal_icon: "signal-up.png",
//       },
//       {
//         id: 5,
//         label: "Churn Rate",
//         value: "2.5%",
//         icon: "churn_rate",
//         rate: -1.2,
//         signal_icon: "signal-down.png",
//       },
//       {
//         id: 6,
//         label: "ARPU",
//         value: "KES 1,500",
//         icon: "arpu",
//         rate: 0.8,
//         signal_icon: "signal-up.png",
//       },
//       {
//         id: 7,
//         label: "Network Uptime",
//         value: "99.9%",
//         icon: "network_uptime",
//         rate: 0.1,
//         signal_icon: "signal-up.png",
//       },
//       {
//         id: 8,
//         label: "Avg. Bandwidth Usage",
//         value: "50 Mbps",
//         icon: "avg_bandwidth",
//         rate: 2.3,
//         signal_icon: "signal-up.png",
//       },
//     ];

//     setGridItems(mockGridItems);
//     setLoading(false);
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <FaSpinner className="animate-spin text-4xl text-blue-600" />
//         <span className="ml-3 text-lg font-medium text-gray-700">Loading Dashboard Insights...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
//         <p className="text-red-600 font-semibold">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-2 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//       {gridItems.length > 0 ? (
//         gridItems.map((item) => <GridCard key={item.id} item={item} />)
//       ) : (
//         <PlaceholderGrid />
//       )}

//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
//         <SalesChart />
//       </GridWrapper>
//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px] overflow-auto">
//         <RevenueChart />
//       </GridWrapper>
//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
//         <PlanPerformanceChart />
//       </GridWrapper>
//       <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
//         <SystemLoadMonitor />
//       </GridWrapper>
//       <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] lg:grid-cols-[3fr_2fr] gap-6 lg:col-span-4">
//         <GridWrapper className="h-[500px]">
//           <FinancialBarChart />
//         </GridWrapper>
//         <GridWrapper className="h-[500px]">
//           <VisitorAnalyticsChart />
//         </GridWrapper>
//       </div>
//       <GridWrapper className="lg:col-span-4 h-[500px]">
//         <NewSubscriptionsChart />
//       </GridWrapper>
//     </div>
//   );
// };

// const GridCard = ({ item }) => {
//   const iconMap = {
//     active_users: <HiUsers className="text-4xl text-blue-500" />,
//     total_clients: <HiOutlineUserGroup className="text-4xl text-green-500" />,
//     this_month_income: <HiOutlineCurrencyDollar className="text-4xl text-yellow-500" />,
//     todays_income: <HiOutlineCurrencyDollar className="text-4xl text-pink-500" />,
//     churn_rate: <HiOutlineUserRemove className="text-4xl text-red-500" />,
//     arpu: <HiOutlineCurrencyDollar className="text-4xl text-purple-500" />,
//     network_uptime: <HiOutlineWifi className="text-4xl text-teal-500" />,
//     avg_bandwidth: <HiOutlineWifi className="text-4xl text-orange-500" />,
//   };

//   return (
//     <GridWrapper>
//       <div className="relative flex flex-col space-y-2">
//         <div className="flex items-center space-x-4">
//           {iconMap[item.icon] || <HiOutlineCurrencyDollar className="text-4xl text-gray-500" />}
//           <span className="text-2xl font-semibold text-gray-800">{item.value}</span>
//         </div>
//         <span className="text-lg text-gray-600">{item.label}</span>
//         {item.signal_icon && (
//           <img
//             src={`/icons/${item.signal_icon}`}
//             alt="signal"
//             className="absolute w-8 h-8 top-0 right-0"
//             onError={(e) => (e.target.src = "/icons/default-signal.png")}
//           />
//         )}
//         {item.rate !== undefined && (
//           <p
//             className={`flex items-center text-sm font-medium ${
//               item.rate > 0 ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {item.rate > 0 ? (
//               <HiOutlineArrowUp className="mr-1" />
//             ) : (
//               <HiOutlineArrowDown className="mr-1" />
//             )}
//             {Math.abs(item.rate)}%
//           </p>
//         )}
//       </div>
//     </GridWrapper>
//   );
// };

// const PlaceholderGrid = () => (
//   <>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiUsers className="text-4xl text-blue-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Active Users</p>
//         <p className="text-2xl font-bold text-gray-800">0</p>
//         <p className="text-sm text-gray-500 mt-1">Real-time user tracking ready</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineUserGroup className="text-4xl text-green-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Total Clients</p>
//         <p className="text-2xl font-bold text-gray-800">0</p>
//         <p className="text-sm text-gray-500 mt-1">Client base syncing soon</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineCurrencyDollar className="text-4xl text-yellow-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">This Month’s Income</p>
//         <p className="text-2xl font-bold text-gray-800">KES 0</p>
//         <p className="text-sm text-gray-500 mt-1">Monthly revenue monitoring active</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineCurrencyDollar className="text-4xl text-pink-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Today’s Income</p>
//         <p className="text-2xl font-bold text-gray-800">KES 0</p>
//         <p className="text-sm text-gray-500 mt-1">Daily revenue monitoring active</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineUserRemove className="text-4xl text-red-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Churn Rate</p>
//         <p className="text-2xl font-bold text-gray-800">0%</p>
//         <p className="text-sm text-gray-500 mt-1">Customer retention tracking</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineCurrencyDollar className="text-4xl text-purple-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">ARPU (Average Revenue Per User)</p>
//         <p className="text-2xl font-bold text-gray-800">KES 0</p>
//         <p className="text-sm text-gray-500 mt-1">Revenue per user monitoring</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineWifi className="text-4xl text-teal-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Network Uptime</p>
//         <p className="text-2xl font-bold text-gray-800">0%</p>
//         <p className="text-sm text-gray-500 mt-1">Service reliability tracking</p>
//       </div>
//     </GridWrapper>
//     <GridWrapper>
//       <div className="flex flex-col items-center justify-center h-full text-center">
//         <HiOutlineWifi className="text-4xl text-orange-500 mb-2" />
//         <p className="text-lg font-semibold text-gray-700">Avg. Bandwidth Usage</p>
//         <p className="text-2xl font-bold text-gray-800">0 Mbps</p>
//         <p className="text-sm text-gray-500 mt-1">Per client data consumption</p>
//       </div>
//     </GridWrapper>
//   </>
// );

// const GridWrapper = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 ${className}`}>
//     {children}
//   </div>
// );

// export default GridStats;









// import React, { useState, useEffect } from "react";
// import {
//   HiOutlineArrowUp,
//   HiOutlineArrowDown,
//   HiUsers,
//   HiOutlineUserGroup,
//   HiOutlineCurrencyDollar,
//   HiOutlineUserRemove,
//   HiOutlineWifi,
//   HiOutlineChip,
//   HiOutlineServer,
//   HiOutlineChartBar,
// } from "react-icons/hi";
// import { FaSpinner } from "react-icons/fa";
// import SalesChart from "../../components/SalesChart.jsx";
// import RevenueChart from "../../components/RevenueChart.jsx";
// import FinancialBarChart from "../../components/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";
// import PlanPerformanceChart from "../../components/PlanPerformanceChart.jsx";
// import SystemLoadMonitor from "../../components/SystemLoadMonitor.jsx";
// import NewSubscriptionsChart from "../../components/NewSubscriptionsChart.jsx";

// const GridStats = () => {
//   const [gridItems, setGridItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Simulate API call with delay
//     const fetchData = async () => {
//       try {
//         // Mock data for grid items
//         const mockGridItems = [
//           {
//             id: 1,
//             label: "Active Users",
//             value: "1,234",
//             icon: "active_users",
//             rate: 5.2,
//             trend: "up",
//             description: "Currently online",
//           },
//           {
//             id: 2,
//             label: "Total Clients",
//             value: "5,678",
//             icon: "total_clients",
//             rate: 2.1,
//             trend: "up",
//             description: "Registered accounts",
//           },
//           {
//             id: 3,
//             label: "Monthly Revenue",
//             value: "KES 1,200,000",
//             icon: "this_month_income",
//             rate: 3.1,
//             trend: "up",
//             description: "Current month",
//           },
//           {
//             id: 4,
//             label: "Today's Revenue",
//             value: "KES 45,000",
//             icon: "todays_income",
//             rate: 4.5,
//             trend: "up",
//             description: "Daily earnings",
//           },
//           {
//             id: 5,
//             label: "Churn Rate",
//             value: "2.5%",
//             icon: "churn_rate",
//             rate: -1.2,
//             trend: "down",
//             description: "Monthly attrition",
//           },
//           {
//             id: 6,
//             label: "ARPU",
//             value: "KES 1,500",
//             icon: "arpu",
//             rate: 0.8,
//             trend: "up",
//             description: "Avg revenue per user",
//           },
//           {
//             id: 7,
//             label: "Network Uptime",
//             value: "99.9%",
//             icon: "network_uptime",
//             rate: 0.1,
//             trend: "up",
//             description: "Last 30 days",
//           },
//           {
//             id: 8,
//             label: "Bandwidth Usage",
//             value: "50 Mbps",
//             icon: "avg_bandwidth",
//             rate: 2.3,
//             trend: "up",
//             description: "Current utilization",
//           },
//         ];

//         await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
//         setGridItems(mockGridItems);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load dashboard data. Please try again.");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh]">
//         <div className="flex items-center">
//           <FaSpinner className="animate-spin text-4xl text-blue-600" />
//           <span className="ml-3 text-lg font-medium text-gray-700">
//             Loading Dashboard Insights...
//           </span>
//         </div>
//         <p className="mt-2 text-sm text-gray-500">
//           Gathering real-time metrics from your network
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh] p-6">
//         <div className="max-w-md text-center p-6 bg-white rounded-xl shadow-sm border border-red-100">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//             <svg
//               className="h-6 w-6 text-red-600"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//               />
//             </svg>
//           </div>
//           <h3 className="mt-3 text-lg font-medium text-gray-900">Data load error</h3>
//           <p className="mt-2 text-sm text-gray-500">{error}</p>
//           <div className="mt-4">
//             <button
//               onClick={() => window.location.reload()}
//               className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {gridItems.map((item) => (
//           <GridCard key={item.id} item={item} />
//         ))}
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         <GridWrapper>
//           <SalesChart />
//         </GridWrapper>
//         <GridWrapper>
//           <RevenueChart />
//         </GridWrapper>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         <GridWrapper>
//           <PlanPerformanceChart />
//         </GridWrapper>
//         <GridWrapper>
//           <SystemLoadMonitor />
//         </GridWrapper>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
//         <GridWrapper>
//           <FinancialBarChart />
//         </GridWrapper>
//         <GridWrapper>
//           <VisitorAnalyticsChart />
//         </GridWrapper>
//       </div>

//       <GridWrapper>
//         <NewSubscriptionsChart />
//       </GridWrapper>
//     </div>
//   );
// };

// const GridCard = ({ item }) => {
//   const iconMap = {
//     active_users: <HiUsers className="text-2xl" />,
//     total_clients: <HiOutlineUserGroup className="text-2xl" />,
//     this_month_income: <HiOutlineCurrencyDollar className="text-2xl" />,
//     todays_income: <HiOutlineCurrencyDollar className="text-2xl" />,
//     churn_rate: <HiOutlineUserRemove className="text-2xl" />,
//     arpu: <HiOutlineChartBar className="text-2xl" />,
//     network_uptime: <HiOutlineWifi className="text-2xl" />,
//     avg_bandwidth: <HiOutlineServer className="text-2xl" />,
//   };

//   const trendColors = {
//     up: "text-green-600 bg-green-50",
//     down: "text-red-600 bg-red-50",
//   };

//   return (
//     <GridWrapper>
//       <div className="flex flex-col h-full">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-blue-600">
//             {iconMap[item.icon] || <HiOutlineCurrencyDollar className="text-2xl" />}
//           </div>
//           <span
//             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//               trendColors[item.trend] || "bg-gray-100 text-gray-800"
//             }`}
//           >
//             {item.trend === "up" ? (
//               <HiOutlineArrowUp className="mr-1" />
//             ) : (
//               <HiOutlineArrowDown className="mr-1" />
//             )}
//             {Math.abs(item.rate)}%
//           </span>
//         </div>

//         <div className="mt-4">
//           <h3 className="text-lg font-medium text-gray-500">{item.label}</h3>
//           <p className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</p>
//           <p className="mt-1 text-sm text-gray-500">{item.description}</p>
//         </div>
//       </div>
//     </GridWrapper>
//   );
// };

// const GridWrapper = ({ children, className = "" }) => (
//   <div
//     className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
//   >
//     <div className="p-5">{children}</div>
//   </div>
// );

// export default GridStats;







// import React, { useState, useEffect, useCallback } from "react";
// import PropTypes from "prop-types";
// import {
//   FiUsers,
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
// import { FaSpinner } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import SalesChart from "../../components/SalesChart.jsx";
// import RevenueChart from "../../components/RevenueChart.jsx";
// import FinancialBarChart from "../../components/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";
// import PlanPerformanceChart from "../../components/PlanPerformanceChart.jsx";
// import SystemLoadMonitor from "../../components/SystemLoadMonitor.jsx";
// import NewSubscriptionsChart from "../../components/NewSubscriptionsChart.jsx";

// // Define currency dynamically (could be from user settings or context)
// const CURRENCY = "KES"; // Ideally, this should come from a config or context

// const GridStats = () => {
//   const [gridItems, setGridItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Use useCallback to memoize fetchData
//   const fetchData = useCallback(async (signal) => {
//     try {
//       // Simulate API call with delay
//       await new Promise((resolve) => setTimeout(resolve, 800));

//       // Check if the request was aborted
//       if (signal.aborted) return;

//       // Enhanced mock data with comparison metrics
//       const mockGridItems = [
//         {
//           id: 1,
//           label: "Active Users",
//           value: "1,234",
//           comparison: "vs 1,173 yesterday",
//           icon: <FiUsers className="text-xl" />,
//           rate: 5.2,
//           trend: "up",
//           trendExplanation: "5.2% increase from last week due to new marketing campaign",
//           bgColor: "bg-indigo-50",
//           iconColor: "text-indigo-600",
//         },
//         {
//           id: 2,
//           label: "Total Clients",
//           value: "5,678",
//           comparison: "vs 5,432 last month",
//           icon: <FiUserPlus className="text-xl" />,
//           rate: 4.5,
//           trend: "up",
//           trendExplanation: "4.5% monthly growth with improved onboarding",
//           bgColor: "bg-teal-50",
//           iconColor: "text-teal-600",
//         },
//         {
//           id: 3,
//           label: "Monthly Revenue",
//           value: `${CURRENCY} 1,200,000`,
//           comparison: `vs ${CURRENCY} 1,150,000 last month`,
//           icon: <FiDollarSign className="text-xl" />,
//           rate: 4.3,
//           trend: "up",
//           trendExplanation: "4.3% increase from premium plan upgrades",
//           bgColor: "bg-emerald-50",
//           iconColor: "text-emerald-600",
//         },
//         {
//           id: 4,
//           label: "Today's Revenue",
//           value: `${CURRENCY} 45,000`,
//           comparison: `vs ${CURRENCY} 42,000 yesterday`,
//           icon: <FiActivity className="text-xl" />,
//           rate: 7.1,
//           trend: "up",
//           trendExplanation: "7.1% higher than typical weekday average",
//           bgColor: "bg-amber-50",
//           iconColor: "text-amber-600",
//         },
//         {
//           id: 5,
//           label: "Churn Rate",
//           value: "2.5%",
//           comparison: "vs 3.7% last quarter",
//           icon: <FiTrendingDown className="text-xl" />,
//           rate: -1.2,
//           trend: "down",
//           trendExplanation: "1.2% improvement from retention initiatives",
//           bgColor: "bg-rose-50",
//           iconColor: "text-rose-600",
//         },
//         {
//           id: 6,
//           label: "ARPU",
//           value: `${CURRENCY} 1,500`,
//           comparison: `vs ${CURRENCY} 1,450 last month`,
//           icon: <FiBarChart2 className="text-xl" />,
//           rate: 3.4,
//           trend: "up",
//           trendExplanation: "3.4% increase from value-added services",
//           bgColor: "bg-violet-50",
//           iconColor: "text-violet-600",
//         },
//         {
//           id: 7,
//           label: "Network Uptime",
//           value: "99.9%",
//           comparison: "vs 99.8% last month",
//           icon: <FiWifi className="text-xl" />,
//           rate: 0.1,
//           trend: "up",
//           trendExplanation: "0.1% improvement from infrastructure upgrades",
//           bgColor: "bg-sky-50",
//           iconColor: "text-sky-600",
//         },
//         {
//           id: 8,
//           label: "Bandwidth Usage",
//           value: "50 Mbps",
//           comparison: "vs 48 Mbps last week",
//           icon: <FiServer className="text-xl" />,
//           rate: 4.2,
//           trend: "up",
//           trendExplanation: "4.2% increase from new video streaming users",
//           bgColor: "bg-blue-50",
//           iconColor: "text-blue-600",
//         },
//       ];

//       setGridItems(mockGridItems);
//       setLoading(false);
//     } catch (err) {
//       if (signal.aborted) return;
//       setError(
//         err.message || "Failed to load dashboard data. Please try again."
//       );
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const controller = new AbortController();
//     fetchData(controller.signal);

//     // Cleanup on unmount
//     return () => controller.abort();
//   }, [fetchData]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
//         <div className="flex items-center space-x-3">
//           <FaSpinner
//             className="animate-spin text-3xl text-blue-600"
//             aria-label="Loading"
//           />
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
//         <div className="max-w-md w-full bg-white rounded-xl shadow-xs border border-gray-200 p-6 text-center">
//           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//             <IoMdAlert
//               className="h-6 w-6 text-red-600"
//               aria-label="Error Alert"
//             />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-900">Data Load Error</h3>
//           <p className="mt-2 text-sm text-gray-600">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             aria-label="Refresh Dashboard"
//           >
//             <FiRefreshCw className="mr-2" />
//             Refresh Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {gridItems.map((item) => (
//           <GridCard key={item.id} item={item} />
//         ))}
//       </div>

//       {/* Performance Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         <GridWrapper
//           title="Sales Performance"
//           description="Monthly sales trend with comparison to last year"
//         >
//           <SalesChart />
//         </GridWrapper>
//         <GridWrapper
//           title="Revenue Analysis"
//           description="Revenue breakdown by product category"
//         >
//           <RevenueChart />
//         </GridWrapper>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         <GridWrapper
//           title="Plan Performance"
//           description="User distribution and revenue by subscription plan"
//         >
//           <PlanPerformanceChart />
//         </GridWrapper>
//         <GridWrapper
//           title="System Health Monitor"
//           description="Real-time infrastructure metrics"
//         >
//           <SystemLoadMonitor />
//         </GridWrapper>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
//         <GridWrapper
//           title="Financial Overview"
//           description="Quarterly financial performance"
//         >
//           <FinancialBarChart />
//         </GridWrapper>
//         <GridWrapper
//           title="Visitor Analytics"
//           description="User engagement and behavior"
//         >
//           <VisitorAnalyticsChart />
//         </GridWrapper>
//       </div>

//       <GridWrapper
//         title="Subscription Growth"
//         description="New customer acquisition trend"
//       >
//         <NewSubscriptionsChart />
//       </GridWrapper>
//     </div>
//   );
// };

// const GridCard = ({ item }) => {
//   return (
//     <div
//       className={`bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden transition-all hover:shadow-sm hover:-translate-y-1`}
//       role="region"
//       aria-label={item.label}
//     >
//       <div className="p-5">
//         <div className="flex justify-between items-start">
//           <div
//             className={`flex items-center justify-center w-12 h-12 rounded-lg ${item.bgColor} ${item.iconColor}`}
//             aria-hidden="true"
//           >
//             {item.icon}
//           </div>

//           <div
//             className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
//               item.trend === "up"
//                 ? "bg-green-50 text-green-600"
//                 : "bg-red-50 text-red-600"
//             }`}
//           >
//             {item.trend === "up" ? (
//               <FiTrendingUp className="mr-1" aria-hidden="true" />
//             ) : (
//               <FiTrendingDown className="mr-1" aria-hidden="true" />
//             )}
//             {Math.abs(item.rate)}%
//           </div>
//         </div>

//         <div className="mt-4">
//           <h3 className="text-base font-medium text-gray-500">{item.label}</h3>
//           <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
//           <p className="mt-1 text-xs text-gray-500">{item.comparison}</p>

//           <div
//             className={`mt-3 flex items-center text-xs font-medium ${
//               item.trend === "up" ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             <span className="inline-flex items-center">
//               {item.trendExplanation}
//             </span>
//           </div>
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
//     trendExplanation: PropTypes.string.isRequired,
//     bgColor: PropTypes.string.isRequired,
//     iconColor: PropTypes.string.isRequired,
//   }).isRequired,
// };

// const GridWrapper = ({ children, title, description, className = "" }) => (
//   <div
//     className={`bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden ${className}`}
//     role="region"
//     aria-label={title}
//   >
//     {(title || description) && (
//       <div className="px-5 pt-5 pb-2 border-b border-gray-100">
//         {title && (
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//         )}
//         {description && (
//           <p className="mt-1 text-sm text-gray-500">{description}</p>
//         )}
//       </div>
//     )}
//     <div className="p-5">{children}</div>
//   </div>
// );

// GridWrapper.propTypes = {
//   children: PropTypes.node.isRequired,
//   title: PropTypes.string,
//   description: PropTypes.string,
//   className: PropTypes.string,
// };

// export default GridStats;






// import React, { useState, useEffect, useCallback } from "react";
// import PropTypes from "prop-types";
// import {
//   FiUsers,
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
// import { FaSpinner } from "react-icons/fa";
// import { IoMdAlert } from "react-icons/io";
// import SystemLoadMonitor from "../../components/SystemLoadMonitor.jsx";
// import SalesChart from "../../components/SalesChart.jsx";
// import RevenueChart from "../../components/RevenueChart.jsx";
// import FinancialBarChart from "../../components/FinancialBarChart.jsx";
// import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";
// import PlanPerformanceChart from "../../components/PlanPerformanceChart.jsx";
// import NewSubscriptionsChart from "../../components/NewSubscriptionsChart.jsx";

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
//           label: "Active Users",
//           value: "1,234",
//           comparison: "vs 1,173 yesterday",
//           icon: <FiUsers className="text-3xl" />,
//           rate: 5.2,
//           trend: "up",
//           bgColor: "bg-indigo-100",
//           iconColor: "text-indigo-600",
//           borderColor: "border-indigo-200",
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
//         },
//         {
//           id: 6,
//           label: "Average Revenue Per User (ARPU)",
//           value: `${CURRENCY} 1,500`,
//           comparison: `vs ${CURRENCY} 1,450 last month`,
//           icon: <FiBarChart2 className="text-3xl" />,
//           rate: 3.4,
//           trend: "up",
//           bgColor: "bg-violet-100",
//           iconColor: "text-violet-600",
//           borderColor: "border-violet-200",
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
//     <div className="space-y-6">
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
//           <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
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
//   }).isRequired,
// };

// export default GridStats;








import React, { useState, useEffect, useCallback } from "react";
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

const CURRENCY = "KES";

const GridStats = () => {
  const [gridItems, setGridItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (signal) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (signal.aborted) return;

      const mockGridItems = [
        {
          id: 1,
          label: "Current Online Users",
          value: "1,234",
          comparison: "vs 1,173 yesterday",
          icon: (
            <div className="relative">
              <FaUserCheck className="text-3xl" />
              <FaCircle className="absolute -top-1 -right-1 text-xs text-cyan-400 animate-pulse" />
            </div>
          ),
          rate: 5.2,
          trend: "up",
          bgColor: "bg-indigo-100",
          iconColor: "text-indigo-600",
          borderColor: "border-indigo-200",
          fontStyle: "font-semibold italic"
        },
        {
          id: 2,
          label: "Total Clients",
          value: "5,678",
          comparison: "vs 5,432 last month",
          icon: <FiUserPlus className="text-3xl" />,
          rate: 4.5,
          trend: "up",
          bgColor: "bg-teal-100",
          iconColor: "text-teal-600",
          borderColor: "border-teal-200",
          fontStyle: "font-medium"
        },
        {
          id: 3,
          label: "Monthly Revenue",
          value: `${CURRENCY} 1,200,000`,
          comparison: `vs ${CURRENCY} 1,150,000 last month`,
          icon: <FiDollarSign className="text-3xl" />,
          rate: 4.3,
          trend: "up",
          bgColor: "bg-emerald-100",
          iconColor: "text-emerald-600",
          borderColor: "border-emerald-200",
          fontStyle: "font-bold"
        },
        {
          id: 4,
          label: "Today's Revenue",
          value: `${CURRENCY} 45,000`,
          comparison: `vs ${CURRENCY} 42,000 yesterday`,
          icon: <FiActivity className="text-3xl" />,
          rate: 7.1,
          trend: "up",
          bgColor: "bg-amber-100",
          iconColor: "text-amber-600",
          borderColor: "border-amber-200",
          fontStyle: "font-medium italic"
        },
        {
          id: 5,
          label: "Churn Rate",
          value: "2.5%",
          comparison: "vs 3.7% last quarter",
          icon: <FiTrendingDown className="text-3xl" />,
          rate: -1.2,
          trend: "down",
          bgColor: "bg-rose-100",
          iconColor: "text-rose-600",
          borderColor: "border-rose-200",
          fontStyle: "font-semibold"
        },
        {
          id: 6,
          label: "Average Revenue Per User",
          value: `${CURRENCY} 1,500`,
          comparison: `vs ${CURRENCY} 1,450 last month`,
          icon: <FiBarChart2 className="text-3xl" />,
          rate: 3.4,
          trend: "up",
          bgColor: "bg-violet-100",
          iconColor: "text-violet-600",
          borderColor: "border-violet-200",
          fontStyle: "font-medium"
        },
        {
          id: 7,
          label: "Network Uptime",
          value: "99.9%",
          comparison: "vs 99.8% last month",
          icon: <FiWifi className="text-3xl" />,
          rate: 0.1,
          trend: "up",
          bgColor: "bg-sky-100",
          iconColor: "text-sky-600",
          borderColor: "border-sky-200",
          fontStyle: "font-bold italic"
        },
        {
          id: 8,
          label: "Bandwidth Usage",
          value: "50 Mbps",
          comparison: "vs 48 Mbps last week",
          icon: <FiServer className="text-3xl" />,
          rate: 4.2,
          trend: "up",
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
          borderColor: "border-blue-200",
          fontStyle: "font-semibold"
        },
      ];

      setGridItems(mockGridItems);
      setLoading(false);
    } catch (err) {
      if (signal.aborted) return;
      setError(err.message || "Failed to load dashboard data.");
      setLoading(false);
    }
  }, []);

  // ... rest of the component remains the same
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

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
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiRefreshCw className="mr-2" />
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {gridItems.map((item) => (
          <GridCard key={item.id} item={item} />
        ))}
      </div>

      {/* System Load Monitor - Full width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SystemLoadMonitor />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Sales Performance</h3>
            <p className="mt-1 text-sm text-gray-500">Monthly sales trend with comparison to last year</p>
          </div>
          <div className="p-6">
            <SalesChart />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
            <p className="mt-1 text-sm text-gray-500">Revenue breakdown by product category</p>
          </div>
          <div className="p-6">
            <RevenueChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanPerformanceChart />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Financial Overview</h3>
            <p className="mt-1 text-sm text-gray-500">Quarterly financial performance</p>
          </div>
          <div className="p-6">
            <FinancialBarChart />
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
            <VisitorAnalyticsChart />
          </div>
        </div>
        <NewSubscriptionsChart />
      </div>
    </div>
  );
};

const GridCard = ({ item }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${item.borderColor} overflow-hidden transition-all hover:shadow-md`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-lg ${item.bgColor} ${item.iconColor}`}
          >
            {item.icon}
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
    icon: PropTypes.element.isRequired,
    rate: PropTypes.number.isRequired,
    trend: PropTypes.oneOf(["up", "down"]).isRequired,
    bgColor: PropTypes.string.isRequired,
    iconColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
    fontStyle: PropTypes.string.isRequired,
  }).isRequired,
};

export default GridStats;