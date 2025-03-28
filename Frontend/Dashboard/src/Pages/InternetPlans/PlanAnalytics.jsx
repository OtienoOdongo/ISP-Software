// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { motion } from "framer-motion";
// import { BarChart, LineChart, PieChart, Users, DollarSign, Clock, Server } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const PlanAnalytics = () => {
//   const [plansData, setPlansData] = useState([]);
//   const [filterCategory, setFilterCategory] = useState("All");
//   const categories = ["All", "Residential", "Business", "Promotional", "Enterprise"];

//   // Fetch plans from localStorage (same as CreatePlans)
//   useEffect(() => {
//     try {
//       const savedPlans = JSON.parse(localStorage.getItem("isp-plans")) || [];
//       setPlansData(savedPlans);
//     } catch (error) {
//       console.error("Error loading plans:", error);
//       toast.error("Failed to load analytics data.");
//     }
//   }, []);

//   // Derived analytics data
//   const filteredPlans = plansData.filter(
//     (plan) => filterCategory === "All" || plan.category === filterCategory
//   );
//   const planNames = filteredPlans.map((plan) => plan.name);
//   const sales = filteredPlans.map((plan) => plan.purchases || 0);
//   const activeUsers = filteredPlans.map((plan) =>
//     Object.keys(plan.clientSessions || {}).length
//   );
//   const revenue = filteredPlans.map((plan) => (plan.price || 0) * (plan.purchases || 0));
//   const bandwidthUsage = filteredPlans.map((plan) =>
//     parseFloat(plan.downloadSpeed?.value || 0)
//   );
//   const uptime = filteredPlans.map(() => (Math.random() * (100 - 99) + 99).toFixed(1)); // Mock uptime
//   const usageLimitHours = filteredPlans.map((plan) =>
//     plan.usageLimit?.unit === "Hours" ? parseInt(plan.usageLimit.value || 0) : 720
//   ); // Default to 720 if Unlimited

//   // Bar Chart: Sales vs Active Users vs Revenue
//   const barChartOptions = {
//     chart: { type: "bar", toolbar: { show: true }, animations: { enabled: true } },
//     plotOptions: { bar: { horizontal: false, columnWidth: "60%", endingShape: "rounded" } },
//     xaxis: { categories: planNames, title: { text: "Plans" } },
//     yaxis: [
//       { title: { text: "Counts" } },
//       { opposite: true, title: { text: "Revenue (Ksh)" } },
//     ],
//     legend: { position: "top", horizontalAlign: "center" },
//     colors: ["#1E90FF", "#32CD32", "#FFD700"],
//     tooltip: {
//       shared: true,
//       intersect: false,
//       y: [
//         { formatter: (val) => `${val} sales` },
//         { formatter: (val) => `${val} users` },
//         { formatter: (val) => `Ksh ${val.toLocaleString()}` },
//       ],
//     },
//   };

//   const barChartSeries = [
//     { name: "Sales", data: sales },
//     { name: "Active Users", data: activeUsers },
//     { name: "Revenue", data: revenue },
//   ];

//   // Line Chart: Bandwidth Usage vs Usage Limit
//   const lineChartOptions = {
//     chart: { type: "line", toolbar: { show: true }, zoom: { enabled: true } },
//     xaxis: { categories: planNames, title: { text: "Plans" } },
//     yaxis: [
//       { title: { text: "Bandwidth (Mbps)" }, min: 0 },
//       { opposite: true, title: { text: "Usage Limit (Hours)" }, min: 0 },
//     ],
//     stroke: { curve: "smooth", width: 2 },
//     colors: ["#FF6347", "#4682B4"],
//     markers: { size: 4 },
//     tooltip: {
//       shared: true,
//       y: [
//         { formatter: (val) => `${val} Mbps` },
//         { formatter: (val) => `${val} hours (~${(val / 24).toFixed(1)} days)` },
//       ],
//     },
//   };

//   const lineChartSeries = [
//     { name: "Bandwidth Usage", data: bandwidthUsage },
//     { name: "Usage Limit", data: usageLimitHours },
//   ];

//   // Pie Chart: Category Distribution
//   const categoryCounts = categories.slice(1).map(
//     (cat) => plansData.filter((plan) => plan.category === cat).length
//   );
//   const pieChartOptions = {
//     chart: { type: "pie" },
//     labels: categories.slice(1),
//     colors: ["#32CD32", "#4682B4", "#FFD700", "#FF6347"],
//     legend: { position: "bottom" },
//     tooltip: { y: { formatter: (val) => `${val} plans` } },
//   };

//   const pieChartSeries = categoryCounts;

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Plan Analytics</h1>
//         <select
//           value={filterCategory}
//           onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Sales vs Active Users vs Revenue */}
//       <motion.div
//         className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//           <BarChart className="w-6 h-6 text-teal-600 mr-2" /> Plan Popularity & Revenue
//         </h2>
//         <Chart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
//       </motion.div>

//       {/* Bandwidth Usage vs Usage Limit */}
//       <motion.div
//         className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//           <LineChart className="w-6 h-6 text-teal-600 mr-2" /> Network Performance & Usage
//         </h2>
//         <Chart options={lineChartOptions} series={lineChartSeries} type="line" height={350} />
//       </motion.div>

//       {/* Category Distribution */}
//       <motion.div
//         className="bg-white shadow-lg rounded-xl p-6 border border-gray-100"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.4 }}
//       >
//         <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//           <PieChart className="w-6 h-6 text-teal-600 mr-2" /> Category Distribution
//         </h2>
//         <Chart options={pieChartOptions} series={pieChartSeries} type="pie" height={350} />
//       </motion.div>
//     </div>
//   );
// };

// export default PlanAnalytics;




import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";
import { BarChart, LineChart, PieChart, Server } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../api";

const PlanAnalytics = () => {
  const [plansData, setPlansData] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const categories = ["All", "Residential", "Business", "Promotional", "Enterprise"];

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

  const filteredPlans = plansData.filter(
    (plan) => filterCategory === "All" || plan.category === filterCategory
  );
  const planNames = filteredPlans.map((plan) => plan.name);
  const sales = filteredPlans.map((plan) => plan.purchases || 0);
  const activeUsers = filteredPlans.map((plan) =>
    Object.keys(plan.client_sessions || {}).length
  );
  const revenue = filteredPlans.map((plan) => (plan.price || 0) * (plan.purchases || 0));
  const bandwidthUsage = filteredPlans.map((plan) =>
    parseFloat(plan.downloadSpeed?.value || 0)
  );
  const uptime = filteredPlans.map((plan) => plan.uptime || (Math.random() * (100 - 99) + 99).toFixed(1));
  const usageLimitHours = filteredPlans.map((plan) =>
    plan.usageLimit?.unit === "Hours" ? parseInt(plan.usageLimit.value || 0) : 720
  );

  const barChartOptions = {
    chart: { type: "bar", toolbar: { show: true }, animations: { enabled: true } },
    plotOptions: { bar: { horizontal: false, columnWidth: "60%", endingShape: "rounded" } },
    xaxis: { categories: planNames, title: { text: "Plans" } },
    yaxis: [
      { title: { text: "Counts" } },
      { opposite: true, title: { text: "Revenue (Ksh)" } },
    ],
    legend: { position: "top", horizontalAlign: "center" },
    colors: ["#1E90FF", "#32CD32", "#FFD700"],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (val) => `${val} sales` },
        { formatter: (val) => `${val} users` },
        { formatter: (val) => `Ksh ${val.toLocaleString()}` },
      ],
    },
  };

  const barChartSeries = [
    { name: "Sales", data: sales },
    { name: "Active Users", data: activeUsers },
    { name: "Revenue", data: revenue },
  ];

  const lineChartOptions = {
    chart: { type: "line", toolbar: { show: true }, zoom: { enabled: true } },
    xaxis: { categories: planNames, title: { text: "Plans" } },
    yaxis: [
      { title: { text: "Bandwidth (Mbps)" }, min: 0 },
      { opposite: true, title: { text: "Usage Limit (Hours)" }, min: 0 },
    ],
    stroke: { curve: "smooth", width: 2 },
    colors: ["#FF6347", "#4682B4"],
    markers: { size: 4 },
    tooltip: {
      shared: true,
      y: [
        { formatter: (val) => `${val} Mbps` },
        { formatter: (val) => `${val} hours (~${(val / 24).toFixed(1)} days)` },
      ],
    },
  };

  const lineChartSeries = [
    { name: "Bandwidth Usage", data: bandwidthUsage },
    { name: "Usage Limit", data: usageLimitHours },
  ];

  const categoryCounts = categories.slice(1).map(
    (cat) => plansData.filter((plan) => plan.category === cat).length
  );
  const pieChartOptions = {
    chart: { type: "pie" },
    labels: categories.slice(1),
    colors: ["#32CD32", "#4682B4", "#FFD700", "#FF6347"],
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (val) => `${val} plans` } },
  };

  const pieChartSeries = categoryCounts;

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Server className="w-12 h-12 text-teal-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Plan Analytics</h1>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {plansData.length === 0 ? (
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 text-center border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">No Analytics Data Available</h2>
          <p className="text-gray-600 mt-2">
            It looks like there are no plans yet. Create some plans to start seeing analytics!
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="w-6 h-6 text-teal-600 mr-2" /> Plan Popularity & Revenue
            </h2>
            <Chart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
          </motion.div>

          <motion.div
            className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <LineChart className="w-6 h-6 text-teal-600 mr-2" /> Network Performance & Usage
            </h2>
            <Chart options={lineChartOptions} series={lineChartSeries} type="line" height={350} />
          </motion.div>

          <motion.div
            className="bg-white shadow-lg rounded-xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-6 h-6 text-teal-600 mr-2" /> Category Distribution
            </h2>
            <Chart options={pieChartOptions} series={pieChartSeries} type="pie" height={350} />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default PlanAnalytics;