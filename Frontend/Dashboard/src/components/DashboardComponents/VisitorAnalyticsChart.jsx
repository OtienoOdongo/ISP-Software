// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";

// const VisitorAnalyticsChart = () => {
//   const [options, setOptions] = useState({
//     chart: { id: "simple-donut", type: "donut", width: "80%", fontFamily: "Inter, sans-serif" },
//     labels: ["Basic Plan", "Plus Plan", "Premium Plan"],
//     plotOptions: { pie: { donut: { size: "80%" } } },
//     legend: { position: "bottom", fontSize: "12px" },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for visitor analytics
//     const mockData = [
//       { plan: "Basic Plan", visitors: 500 },
//       { plan: "Plus Plan", visitors: 300 },
//       { plan: "Premium Plan", visitors: 200 },
//     ];

//     const total = mockData.reduce((sum, item) => sum + item.visitors, 0);
//     const percentages = mockData.map((item) => (total > 0 ? (item.visitors / total) * 100 : 0));
//     setSeries(percentages);
//     setLoading(false);
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Plan Popularity</h2>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="ml-2 text-gray-600 font-medium">Gathering Visitor Insights...</span>
//         </div>
//       ) : error ? (
//         <p className="text-center text-red-600 font-medium">{error}</p>
//       ) : (
//         <Chart options={options} series={series} type="donut" height={350} />
//       )}
//     </div>
//   );
// };

// export default VisitorAnalyticsChart;








// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const VisitorAnalyticsChart = ({ data }) => {
//   const options = {
//     chart: { id: "simple-donut", type: "donut", width: "80%", fontFamily: "Inter, sans-serif" },
//     labels: Object.keys(data),
//     plotOptions: { pie: { donut: { size: "80%" } } },
//     legend: { position: "bottom", fontSize: "12px" },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//   };

//   const series = Object.values(data);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Plan Popularity</h2>
//       <Chart options={options} series={series} type="donut" height={350} />
//     </div>
//   );
// };

// VisitorAnalyticsChart.propTypes = {
//   data: PropTypes.objectOf(PropTypes.number).isRequired,
// };

// export default VisitorAnalyticsChart;



// // VisitorAnalyticsChart.jsx
// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const VisitorAnalyticsChart = ({ data, theme }) => {
//   const options = {
//     chart: { 
//       id: "simple-donut", 
//       type: "donut", 
//       width: "80%", 
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//     },
//     labels: Object.keys(data),
//     plotOptions: { pie: { donut: { size: "80%" } } },
//     legend: { 
//       position: "bottom", 
//       fontSize: "12px",
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//     dataLabels: {
//       style: {
//         colors: [theme === "dark" ? "#111827" : "#FFFFFF"]
//       }
//     }
//   };

//   const series = Object.values(data);

//   return (
//     <div>
//       <h2 className={`text-xl font-semibold text-center mb-4 ${
//         theme === "dark" ? "text-white" : "text-gray-800"
//       }`}>Plan Popularity</h2>
//       <Chart options={options} series={series} type="donut" height={350} />
//     </div>
//   );
// };

// VisitorAnalyticsChart.propTypes = {
//   data: PropTypes.objectOf(PropTypes.number).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// export default VisitorAnalyticsChart;





import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

const VisitorAnalyticsChart = ({ data, theme }) => {
  const options = {
    chart: { 
      id: "simple-donut", 
      type: "donut", 
      width: "100%", 
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
    labels: Object.keys(data),
    plotOptions: { 
      pie: { 
        donut: { 
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: theme === "dark" ? "#F9FAFB" : "#1F2937",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              }
            }
          }
        } 
      } 
    },
    legend: { 
      position: "bottom", 
      fontSize: "12px",
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
      }
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    dataLabels: {
      enabled: true,
      style: {
        colors: [theme === "dark" ? "#111827" : "#FFFFFF"]
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: '#000',
        opacity: 0.45
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          width: "100%",
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
          position: "bottom",
          fontSize: "10px"
        },
        plotOptions: {
          pie: {
            donut: {
              size: "60%"
            }
          }
        }
      }
    }]
  };

  const series = Object.values(data);

  return (
    <div className="w-full h-full">
      <h2 className={`text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4 ${
        theme === "dark" ? "text-white" : "text-gray-800"
      }`}>Plan Popularity</h2>
      <Chart options={options} series={series} type="donut" height={350} width="100%" />
    </div>
  );
};

VisitorAnalyticsChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.number).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default VisitorAnalyticsChart;