
// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";

// function RevenueChart() {
//   const [options, setOptions] = useState({
//     chart: { id: "Spline Area", height: "100%", type: "area", fontFamily: "Inter, sans-serif" },
//     xaxis: {
//       categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
//     },
//     yaxis: {
//       title: { text: "Revenue (KES)", style: { fontSize: "14px", fontWeight: "600" } },
//       labels: { formatter: (value) => `KES ${value.toLocaleString()}` },
//     },
//     stroke: { curve: "smooth", width: [2, 2], dashArray: [0, 5] },
//     fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 100] } },
//     legend: { position: "bottom", fontSize: "12px" },
//     dataLabels: { enabled: false },
//     colors: ["#3B82F6", "#10B981"],
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for revenue trends
//     const mockData = [
//       { targeted_revenue: 500000, projected_revenue: 480000 },
//       { targeted_revenue: 520000, projected_revenue: 500000 },
//       { targeted_revenue: 540000, projected_revenue: 510000 },
//       { targeted_revenue: 560000, projected_revenue: 530000 },
//       { targeted_revenue: 580000, projected_revenue: 550000 },
//       { targeted_revenue: 600000, projected_revenue: 570000 },
//       { targeted_revenue: 620000, projected_revenue: 590000 },
//       { targeted_revenue: 640000, projected_revenue: 610000 },
//       { targeted_revenue: 660000, projected_revenue: 630000 },
//       { targeted_revenue: 680000, projected_revenue: 650000 },
//       { targeted_revenue: 700000, projected_revenue: 670000 },
//       { targeted_revenue: 720000, projected_revenue: 690000 },
//     ];

//     setSeries([
//       { name: "Targeted Revenue", data: mockData.map((item) => item.targeted_revenue) },
//       { name: "Projected Revenue", data: mockData.map((item) => item.projected_revenue) },
//     ]);
//     setLoading(false);
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Revenue Trends</h2>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="ml-2 text-gray-600 font-medium">Tracking Revenue...</span>
//         </div>
//       ) : error ? (
//         <p className="text-center text-red-600 font-medium">{error}</p>
//       ) : (
//         <Chart options={options} series={series} type="area" height="400" />
//       )}
//     </div>
//   );
// }

// export default RevenueChart;







// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const RevenueChart = ({ data }) => {
//   const options = {
//     chart: { id: "Spline Area", height: "100%", type: "area", fontFamily: "Inter, sans-serif" },
//     xaxis: {
//       categories: data.map(item => item.month),
//     },
//     yaxis: {
//       title: { text: "Revenue (KES)", style: { fontSize: "14px", fontWeight: "600" } },
//       labels: { formatter: (value) => `KES ${value.toLocaleString()}` },
//     },
//     stroke: { curve: "smooth", width: [2, 2], dashArray: [0, 5] },
//     fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 100] } },
//     legend: { position: "bottom", fontSize: "12px" },
//     dataLabels: { enabled: false },
//     colors: ["#3B82F6", "#10B981"],
//   };

//   const series = [
//     { name: "Targeted Revenue", data: data.map(item => item.targeted_revenue) },
//     { name: "Projected Revenue", data: data.map(item => item.projected_revenue) },
//   ];

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Revenue Trends</h2>
//       <Chart options={options} series={series} type="area" height="400" />
//     </div>
//   );
// };

// RevenueChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       targeted_revenue: PropTypes.number.isRequired,
//       projected_revenue: PropTypes.number.isRequired,
//     })
//   ).isRequired,
// };

// export default RevenueChart;



// // RevenueChart.jsx
// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const RevenueChart = ({ data, theme }) => {
//   const options = {
//     chart: { 
//       id: "Spline Area", 
//       height: "100%", 
//       type: "area", 
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//     },
//     xaxis: {
//       categories: data.map(item => item.month),
//       labels: {
//         style: {
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
//         }
//       }
//     },
//     yaxis: {
//       title: { 
//         text: "Revenue (KES)", 
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
//     stroke: { curve: "smooth", width: [2, 2], dashArray: [0, 5] },
//     fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 100] } },
//     legend: { 
//       position: "bottom", 
//       fontSize: "12px",
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     dataLabels: { enabled: false },
//     colors: ["#3B82F6", "#10B981"],
//     grid: {
//       borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
//       strokeDashArray: 4,
//       padding: { top: 20, right: 20, bottom: 0, left: 20 },
//     },
//   };

//   const series = [
//     { name: "Targeted Revenue", data: data.map(item => item.targeted_revenue) },
//     { name: "Projected Revenue", data: data.map(item => item.projected_revenue) },
//   ];

//   return (
//     <div>
//       <h2 className={`text-xl font-semibold text-center mb-4 ${
//         theme === "dark" ? "text-white" : "text-gray-800"
//       }`}>Revenue Trends</h2>
//       <Chart options={options} series={series} type="area" height="400" />
//     </div>
//   );
// };

// RevenueChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       targeted_revenue: PropTypes.number.isRequired,
//       projected_revenue: PropTypes.number.isRequired,
//     })
//   ).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// export default RevenueChart;








import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

const RevenueChart = ({ data, theme }) => {
  const options = {
    chart: { 
      id: "Spline Area", 
      height: "100%", 
      type: "area", 
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
      labels: {
        style: {
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
          fontSize: "12px",
        }
      }
    },
    yaxis: {
      title: { 
        text: "Revenue (KES)", 
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
    stroke: { curve: "smooth", width: [2, 2], dashArray: [0, 5] },
    fill: { 
      type: "gradient", 
      gradient: { 
        shadeIntensity: 1, 
        opacityFrom: 0.7, 
        opacityTo: 0.3, 
        stops: [0, 100] 
      } 
    },
    legend: { 
      position: "bottom", 
      fontSize: "12px",
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
      }
    },
    dataLabels: { enabled: false },
    colors: ["#3B82F6", "#10B981"],
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
      strokeDashArray: 3,
      padding: { top: 10, right: 10, bottom: 0, left: 10 },
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
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
        legend: {
          fontSize: "10px"
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
    { name: "Targeted Revenue", data: data.map(item => item.targeted_revenue) },
    { name: "Projected Revenue", data: data.map(item => item.projected_revenue) },
  ];

  return (
    <div className="w-full h-full">
      <h2 className={`text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4 ${
        theme === "dark" ? "text-white" : "text-gray-800"
      }`}>Revenue Trends</h2>
      <Chart options={options} series={series} type="area" height={350} width="100%" />
    </div>
  );
};

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      targeted_revenue: PropTypes.number.isRequired,
      projected_revenue: PropTypes.number.isRequired,
    })
  ).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default RevenueChart;