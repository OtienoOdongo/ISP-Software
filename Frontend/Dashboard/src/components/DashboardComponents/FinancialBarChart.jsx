
// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";

// const FinancialBarChart = () => {
//   const [options, setOptions] = useState({
//     chart: { type: "bar", stacked: true, height: 350, fontFamily: "Inter, sans-serif" },
//     xaxis: {
//       categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
//       title: { text: "Months", style: { fontSize: "14px", fontWeight: "600" } },
//     },
//     yaxis: {
//       title: { text: "Amount (KES)", style: { fontSize: "14px", fontWeight: "600" } },
//       labels: { formatter: (value) => `KES ${value.toLocaleString()}` },
//     },
//     plotOptions: { bar: { horizontal: false, dataLabels: { total: { enabled: false } } } },
//     stroke: { width: 1, colors: ["#fff"] },
//     legend: { position: "top", horizontalAlign: "left", offsetX: 40, fontSize: "12px" },
//     dataLabels: { enabled: false },
//     colors: ["#A20ACC", "#34CC0A", "#F40B49"],
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for financial performance
//     const mockData = [
//       { income: 500000, profit: 200000, expenses: 300000 },
//       { income: 550000, profit: 220000, expenses: 330000 },
//       { income: 600000, profit: 240000, expenses: 360000 },
//       { income: 650000, profit: 260000, expenses: 390000 },
//       { income: 700000, profit: 280000, expenses: 420000 },
//       { income: 750000, profit: 300000, expenses: 450000 },
//       { income: 800000, profit: 320000, expenses: 480000 },
//       { income: 850000, profit: 340000, expenses: 510000 },
//       { income: 900000, profit: 360000, expenses: 540000 },
//       { income: 950000, profit: 380000, expenses: 570000 },
//       { income: 1000000, profit: 400000, expenses: 600000 },
//       { income: 1050000, profit: 420000, expenses: 630000 },
//     ];

//     setSeries([
//       { name: "Income", data: mockData.map((item) => item.income), color: "#A20ACC" },
//       { name: "Profit", data: mockData.map((item) => item.profit), color: "#34CC0A" },
//       { name: "Expenses", data: mockData.map((item) => item.expenses), color: "#F40B49" },
//     ]);
//     setLoading(false);
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Financial Performance</h2>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="ml-2 text-gray-600 font-medium">Calculating Metrics...</span>
//         </div>
//       ) : error ? (
//         <p className="text-center text-red-600 font-medium">{error}</p>
//       ) : (
//         <Chart options={options} series={series} type="bar" height={400} />
//       )}
//     </div>
//   );
// };

// export default FinancialBarChart;







// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const FinancialBarChart = ({ data }) => {
//   const options = {
//     chart: { type: "bar", stacked: true, height: 350, fontFamily: "Inter, sans-serif" },
//     xaxis: {
//       categories: data.map(item => item.month),
//       title: { text: "Months", style: { fontSize: "14px", fontWeight: "600" } },
//     },
//     yaxis: {
//       title: { text: "Amount (KES)", style: { fontSize: "14px", fontWeight: "600" } },
//       labels: { formatter: (value) => `KES ${value.toLocaleString()}` },
//     },
//     plotOptions: { bar: { horizontal: false, dataLabels: { total: { enabled: false } } } },
//     stroke: { width: 1, colors: ["#fff"] },
//     legend: { position: "top", horizontalAlign: "left", offsetX: 40, fontSize: "12px" },
//     dataLabels: { enabled: false },
//     colors: ["#A20ACC", "#34CC0A", "#F40B49"],
//   };

//   const series = [
//     { name: "Income", data: data.map(item => item.income) },
//     { name: "Profit", data: data.map(item => item.profit) },
//     { name: "Expenses", data: data.map(item => item.expenses) },
//   ];

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Financial Performance</h2>
//       <Chart options={options} series={series} type="bar" height={400} />
//     </div>
//   );
// };

// FinancialBarChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       income: PropTypes.number.isRequired,
//       profit: PropTypes.number.isRequired,
//       expenses: PropTypes.number.isRequired,
//     })
//   ).isRequired,
// };

// export default FinancialBarChart;






// // FinancialBarChart.jsx
// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const FinancialBarChart = ({ data, theme }) => {
//   const options = {
//     chart: { 
//       type: "bar", 
//       stacked: true, 
//       height: 350, 
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//     },
//     xaxis: {
//       categories: data.map(item => item.month),
//       title: { 
//         text: "Months", 
//         style: { 
//           fontSize: "14px", 
//           fontWeight: "600",
//           color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         } 
//       },
//       labels: {
//         style: {
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
//         }
//       }
//     },
//     yaxis: {
//       title: { 
//         text: "Amount (KES)", 
//         style: { 
//           fontSize: "14px", 
//           fontWeight: "600",
//           color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         } 
//       },
//       labels: { 
//         formatter: (value) => `KES ${value.toLocaleString()}`,
//         style: {
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
//         }
//       },
//     },
//     plotOptions: { bar: { horizontal: false, dataLabels: { total: { enabled: false } } } },
//     stroke: { width: 1, colors: [theme === "dark" ? "#111827" : "#FFFFFF"] },
//     legend: { 
//       position: "top", 
//       horizontalAlign: "left", 
//       offsetX: 40, 
//       fontSize: "12px",
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     dataLabels: { enabled: false },
//     colors: ["#A20ACC", "#34CC0A", "#F40B49"],
//     grid: {
//       borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
//       strokeDashArray: 4,
//       padding: { top: 20, right: 20, bottom: 0, left: 20 },
//     },
//   };

//   const series = [
//     { name: "Income", data: data.map(item => item.income) },
//     { name: "Profit", data: data.map(item => item.profit) },
//     { name: "Expenses", data: data.map(item => item.expenses) },
//   ];

//   return (
//     <div>
//       <h2 className={`text-xl font-semibold text-center mb-4 ${
//         theme === "dark" ? "text-white" : "text-gray-800"
//       }`}>Financial Performance</h2>
//       <Chart options={options} series={series} type="bar" height={400} />
//     </div>
//   );
// };

// FinancialBarChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       income: PropTypes.number.isRequired,
//       profit: PropTypes.number.isRequired,
//       expenses: PropTypes.number.isRequired,
//     })
//   ).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// export default FinancialBarChart;







import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

const FinancialBarChart = ({ data, theme }) => {
  const options = {
    chart: { 
      type: "bar", 
      stacked: true, 
      height: "100%",
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    xaxis: {
      categories: data.map(item => item.month),
      title: { 
        text: "Months", 
        style: { 
          fontSize: "14px", 
          fontWeight: "600",
          color: theme === "dark" ? "#F9FAFB" : "#1F2937",
        } 
      },
      labels: {
        style: {
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
          fontSize: "12px",
        }
      }
    },
    yaxis: {
      title: { 
        text: "Amount (KES)", 
        style: { 
          fontSize: "14px", 
          fontWeight: "600",
          color: theme === "dark" ? "#F9FAFB" : "#1F2937",
        } 
      },
      labels: { 
        formatter: (value) => `KES ${value.toLocaleString()}`,
        style: {
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
          fontSize: "12px",
        }
      },
    },
    plotOptions: { 
      bar: { 
        horizontal: false, 
        columnWidth: "60%",
        borderRadius: 4,
        borderRadiusApplication: 'end'
      } 
    },
    stroke: { width: 1, colors: [theme === "dark" ? "#111827" : "#FFFFFF"] },
    legend: { 
      position: "top", 
      horizontalAlign: "center", 
      fontSize: "12px",
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
      }
    },
    dataLabels: { enabled: false },
    colors: ["#A20ACC", "#34CC0A", "#F40B49"],
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
      strokeDashArray: 3,
      padding: { top: 10, right: 10, bottom: 0, left: 10 },
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300,
          toolbar: {
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
            }
          }
        },
        plotOptions: {
          bar: {
            columnWidth: "70%"
          }
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          fontSize: "10px",
          itemMargin: {
            horizontal: 5,
            vertical: 2
          }
        },
        xaxis: {
          labels: {
            style: {
              fontSize: "10px"
            }
          }
        },
        yaxis: {
          labels: {
            formatter: (value) => `KES ${value > 1000 ? (value/1000).toFixed(0) + 'K' : value}`,
            style: {
              fontSize: "10px"
            }
          }
        }
      }
    }]
  };

  const series = [
    { name: "Income", data: data.map(item => item.income) },
    { name: "Profit", data: data.map(item => item.profit) },
    { name: "Expenses", data: data.map(item => item.expenses) },
  ];

  return (
    <div className="w-full h-full">
      <h2 className={`text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4 ${
        theme === "dark" ? "text-white" : "text-gray-800"
      }`}>Financial Performance</h2>
      <Chart 
        options={options} 
        series={series} 
        type="bar" 
        height={350}
        width="100%"
      />
    </div>
  );
};

FinancialBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      income: PropTypes.number.isRequired,
      profit: PropTypes.number.isRequired,
      expenses: PropTypes.number.isRequired,
    })
  ).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default FinancialBarChart;