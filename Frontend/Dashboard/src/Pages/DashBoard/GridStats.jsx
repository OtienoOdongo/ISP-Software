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




// Pages/Dashboard/GridStats.jsx
import React, { useState, useEffect } from "react";
import api from "../../../api"; 
import { HiOutlineArrowUp, HiOutlineArrowDown, HiUsers, HiOutlineUserGroup, HiOutlineCurrencyDollar, HiOutlineWifi } from "react-icons/hi";
import { FaSpinner } from "react-icons/fa"; 
import SalesChart from "../../components/SalesChart.jsx";
import RevenueChart from "../../components/RevenueChart.jsx";
import FinancialBarChart from "../../components/FinancialBarChart.jsx";
import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";

const GridStats = () => {
  const [gridItems, setGridItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGridItems = async () => {
      try {
        const response = await api.get("/api/dashboard/grid-items/");
        const data = response.data;
        setGridItems(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard insights. Please try again.");
        setLoading(false);
      }
    };
    fetchGridItems();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <span className="ml-3 text-lg font-medium text-gray-700">Loading Dashboard Insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {gridItems.length > 0 ? (
        gridItems.map((item) => (
          <GridCard key={item.id} item={item} />
        ))
      ) : (
        <PlaceholderGrid />
      )}

      <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
        <SalesChart />
      </GridWrapper>
      <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px] overflow-auto">
        <RevenueChart />
      </GridWrapper>
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] lg:grid-cols-[3fr_2fr] gap-6 lg:col-span-4">
        <GridWrapper className="h-[500px]">
          <FinancialBarChart />
        </GridWrapper>
        <GridWrapper className="h-[500px]">
          <VisitorAnalyticsChart />
        </GridWrapper>
      </div>
    </div>
  );
};

const GridCard = ({ item }) => (
  <GridWrapper>
    <div className="relative flex flex-col space-y-2">
      <div className="flex items-center space-x-4">
        <img
          src={`/icons/${item.icon}`}
          alt={item.label}
          className="w-10 h-10"
          onError={(e) => (e.target.src = "/icons/default-icon.png")}
        />
        <span className="text-2xl font-semibold text-gray-800">{item.value}</span>
      </div>
      <span className="text-lg text-gray-600">{item.label}</span>
      {item.signal_icon && (
        <img
          src={`/icons/${item.signal_icon}`}
          alt="signal"
          className="absolute w-8 h-8 top-0 right-0"
          onError={(e) => (e.target.src = "/icons/default-signal.png")}
        />
      )}
      <p
        className={`flex items-center text-sm font-medium ${
          item.rate > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {item.rate > 0 ? (
          <HiOutlineArrowUp className="mr-1" />
        ) : (
          <HiOutlineArrowDown className="mr-1" />
        )}
        {Math.abs(item.rate)}%
      </p>
    </div>
  </GridWrapper>
);

const PlaceholderGrid = () => (
  <>
    <GridWrapper>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <HiUsers className="text-4xl text-blue-500 mb-2" />
        <p className="text-lg font-semibold text-gray-700">Active Users</p>
        <p className="text-2xl font-bold text-gray-800">0</p>
        <p className="text-sm text-gray-500 mt-1">Real-time user tracking ready</p>
      </div>
    </GridWrapper>
    <GridWrapper>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <HiOutlineUserGroup className="text-4xl text-green-500 mb-2" />
        <p className="text-lg font-semibold text-gray-700">Total Clients</p>
        <p className="text-2xl font-bold text-gray-800">0</p>
        <p className="text-sm text-gray-500 mt-1">Client base syncing soon</p>
      </div>
    </GridWrapper>
    <GridWrapper>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <HiOutlineCurrencyDollar className="text-4xl text-yellow-500 mb-2" />
        <p className="text-lg font-semibold text-gray-700">Today’s Income</p>
        <p className="text-2xl font-bold text-gray-800">KES 0</p>
        <p className="text-sm text-gray-500 mt-1">Daily revenue monitoring active</p>
      </div>
    </GridWrapper>
    <GridWrapper>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <HiOutlineWifi className="text-4xl text-purple-500 mb-2" />
        <p className="text-lg font-semibold text-gray-700">Connectivity Hub</p>
        <p className="text-2xl font-bold text-gray-800">0</p>
        <p className="text-sm text-gray-500 mt-1">Network status updating</p>
      </div>
    </GridWrapper>
  </>
);

const GridWrapper = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100 ${className}`}>
    {children}
  </div>
);

export default GridStats;