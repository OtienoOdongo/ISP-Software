// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";

// const FinancialBarChart = () => {

    
//   // State for options and series
//   const [options, setOptions] = useState({


//     chart: {
//       type: 'bar',
//       stacked: true,
//       height: 350,
//     },
//     xaxis: {
//       categories: [
//         'Jan', 'Feb', 'Mar', 'Apr', 'May', 
//         'Jun', 'Jul', 'Aug', 'Sept', 
//         'October', 'Nov', 'Dec',
//       ], 
//       title: {
//         text: 'Months',
//       },
//     },
//     yaxis: {
//       title: {
//         text: 'Amount (KES)',
//       },
//       labels: {
//         formatter: (value) => `KES ${value.toLocaleString()}`, // Format values as currency
//       },
//     },
//     dataLabels: {
//         enabled: false,
//         style: {
//             fontSize: '12px',
//             fontWeight: 'bold',
//           },
//       },
//     plotOptions: {
//         bar: {
//           horizontal: false,
//           dataLabels: {
//             total: {
//               enabled: false,
//               offsetX: 0,
//               style: {
//                 fontSize: '13px',
//                 fontWeight: 900
//               }
//             }
//           }
//         },
//       },
//     stroke: {
//         width: 1,
//         colors: ['#fff']
//     },
//     legend: {
//       position: 'top', // Legend at the top
//       horizontalAlign: 'left',
//       offsetX: 40
//     },
//     tooltip: {
//       y: {
//         formatter: (value) => `KES ${value.toLocaleString()}`, // Tooltip currency formatting
//       },
//     },
//   });

//   const [series, setSeries] = useState([
//     {
//       name: 'Income',
//       data: [20000, 22000, 25000, 27000, 30000, 32000, 35000, 37000, 40000, 42000, 45000, 47000],
//       color:'#A20ACC'
//     },
//     {
//       name: 'Profit',
//       data: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000],
//       color: '#34CC0A'
//     },
//     {
//       name: 'Expenses',
//       data: [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500],
//       color: '#F40B49'
//     },
//   ]);

//   // Optional: If you want to dynamically update the data or options (for example, from an API or user interaction), you can use useEffect to update the state.

//   return (

//     <div>
//         <h2 className="flex justify-center text-slate-500 font-semibold text-xl mb-4">
//             Monthly Income, Profit & Expenses Overview
//         </h2>
//         <Chart 
//             options={options} 
//             series={series} 
//             type="bar" 
//             height={400} 
//         />

//     </div>
    
//   );
// };

// export default FinancialBarChart;



// components/FinancialBarChart.jsx
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import api from "../../api"; // Adjust path
import { FaSpinner } from "react-icons/fa";

const FinancialBarChart = () => {
  const [options, setOptions] = useState({
    chart: { type: "bar", stacked: true, height: 350, fontFamily: "Inter, sans-serif" },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
      title: { text: "Months", style: { fontSize: "14px", fontWeight: "600" } },
    },
    yaxis: {
      title: { text: "Amount (KES)", style: { fontSize: "14px", fontWeight: "600" } },
      labels: { formatter: (value) => `KES ${value.toLocaleString()}` },
    },
    plotOptions: { bar: { horizontal: false, dataLabels: { total: { enabled: false } } } },
    stroke: { width: 1, colors: ["#fff"] },
    legend: { position: "top", horizontalAlign: "left", offsetX: 40, fontSize: "12px" },
    dataLabels: { enabled: false },
    colors: ["#A20ACC", "#34CC0A", "#F40B49"],
  });

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await api.get("/api/dashboard/financial-data/");
        const data = response.data;
        if (data.length === 0) {
          setSeries([
            { name: "Income", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], color: "#A20ACC" },
            { name: "Profit", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], color: "#34CC0A" },
            { name: "Expenses", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], color: "#F40B49" },
          ]);
        } else {
          setSeries([
            { name: "Income", data: data.map((item) => item.income), color: "#A20ACC" },
            { name: "Profit", data: data.map((item) => item.profit), color: "#34CC0A" },
            { name: "Expenses", data: data.map((item) => item.expenses), color: "#F40B49" },
          ]);
        }
        setLoading(false);
      } catch (error) {
        setError("Failed to load financial insights.");
        setLoading(false);
      }
    };
    fetchFinancialData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Financial Performance</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
          <span className="ml-2 text-gray-600 font-medium">Calculating Metrics...</span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600 font-medium">{error}</p>
      ) : (
        <Chart options={options} series={series} type="bar" height={400} />
      )}
    </div>
  );
};

export default FinancialBarChart;