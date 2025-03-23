// import React, { useState } from 'react';
// import Chart from 'react-apexcharts';

// function SalesChart() {
//   const [options, setOptions] = useState({
//     chart: {
//       id: 'basic-bar',
//       fontFamily: 'Satoshi, sans-serif',
//       height: '100%',  // Set to 100% for responsiveness
//       zoom: {
//         enabled: true,
//         type: 'x',  // Enables zooming in the x-axis direction
//         autoScaleYaxis: true,
//         zoomedArea: {
//           fill: {
//             color: '#90CAF9',
//             opacity: 0.4,
//           },
//           stroke: {
//             color: '#0D47A1',
//             opacity: 0.4,
//             width: 1,
//           },
//         },
//       },
//     },
//     grid: {
//       padding: {
//         left: 10,
//         right: 10,
//       },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: '80%',
//         endingShape: 'rounded',
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     stroke: {
//       show: true,
//       width: 1,
//       colors: ['transparent'],
//     },
//     legend: {
//       show: true,
//       position: 'bottom',
//     },
//     xaxis: {
//       type: 'category',
//       categories: [
//         "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//         "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
//       ],
//     },
//     yaxis: {
//       title: {
//         text: 'Number of Users',
//         style: {
//           fontSize: '15px',
//           fontWeight: 'bold',
//         },
//       },
//     },
//     fill: {
//       opacity: 1,
//     },
//     tooltip: {
//       enabled: true,
//       shared: true,
//       intersect: false,
//     },
//   });

//   const [series, setSeries] = useState([
//     {
//       name: 'Basic Plan',
//       data: [150, 130, 140, 160, 170, 165, 175, 180, 160, 190, 200, 210],
//     },
//     {
//       name: 'Plus Plan',
//       data: [100, 90, 110, 120, 125, 130, 135, 140, 145, 150, 155, 160],
//     },
//     {
//       name: 'Premium Plan',
//       data: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105],
//     },
//   ]);

//   return (
//     <div className="w-full">
//       <h2 className="flex justify-center text-slate-500 font-semibold text-xl mb-4">
//         Total Monthly Sales
//       </h2>
//       <Chart
//         options={options}
//         series={series}
//         type="bar"
//         height="400" // You can change this to a fixed height or make it dynamic
//       />
//     </div>
//   );
// }

// export default SalesChart;




// components/SalesChart.jsx
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import api from "../../api"; // Adjust path
import { FaSpinner } from "react-icons/fa";

function SalesChart() {
  const [options, setOptions] = useState({
    chart: { id: "basic-bar", fontFamily: "Inter, sans-serif", height: "100%" },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
    },
    yaxis: { title: { text: "Number of Users", style: { fontSize: "14px", fontWeight: "600" } } },
    plotOptions: { bar: { columnWidth: "80%", endingShape: "rounded" } },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    legend: { show: true, position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: false },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
  });

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await api.get("/api/dashboard/sales-data/");
        const data = response.data;
        if (data.length === 0) {
          setSeries([
            { name: "Basic Plan", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Plus Plan", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Premium Plan", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          ]);
        } else {
          const basicData = data.filter((item) => item.plan === "basic").map((item) => item.sales);
          const plusData = data.filter((item) => item.plan === "plus").map((item) => item.sales);
          const premiumData = data.filter((item) => item.plan === "premium").map((item) => item.sales);
          setSeries([
            { name: "Basic Plan", data: basicData },
            { name: "Plus Plan", data: plusData },
            { name: "Premium Plan", data: premiumData },
          ]);
        }
        setLoading(false);
      } catch (error) {
        setError("Failed to load sales insights.");
        setLoading(false);
      }
    };
    fetchSalesData();
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Monthly Sales Overview</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
          <span className="ml-2 text-gray-600 font-medium">Analyzing Sales Data...</span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600 font-medium">{error}</p>
      ) : (
        <Chart options={options} series={series} type="bar" height="400" />
      )}
    </div>
  );
}

export default SalesChart;