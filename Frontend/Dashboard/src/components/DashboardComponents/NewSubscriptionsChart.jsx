
// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";
// import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

// const NewSubscriptionsChart = () => {
//   const [options, setOptions] = useState({
//     chart: {
//       type: "area",
//       height: "100%",
//       fontFamily: "Inter, sans-serif",
//       toolbar: {
//         show: true,
//         tools: {
//           download: true,
//           selection: false,
//           zoom: false,
//           zoomin: false,
//           zoomout: false,
//           pan: false,
//           reset: true,
//         },
//       },
//       zoom: {
//         enabled: false,
//       },
//       animations: {
//         enabled: true,
//         easing: 'easeinout',
//         speed: 800,
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     stroke: {
//       curve: "smooth",
//       width: 3,
//     },
//     fill: {
//       type: "gradient",
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.7,
//         opacityTo: 0.3,
//         stops: [0, 90, 100]
//       },
//     },
//     markers: {
//       size: 5,
//       strokeWidth: 0,
//       hover: {
//         size: 7,
//       },
//     },
//     xaxis: {
//       categories: [
//         "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
//         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//       ],
//       labels: {
//         style: {
//           fontSize: "12px",
//           fontWeight: 500,
//           colors: "#6B7280",
//         },
//       },
//       axisBorder: {
//         show: false,
//       },
//       axisTicks: {
//         show: false,
//       },
//       tooltip: {
//         enabled: false,
//       },
//     },
//     yaxis: {
//       labels: {
//         formatter: (value) => `${value}`,
//         style: {
//           fontSize: "12px",
//           fontWeight: 500,
//           colors: "#6B7280",
//         },
//       },
//     },
//     grid: {
//       borderColor: "#F3F4F6",
//       strokeDashArray: 4,
//       padding: {
//         top: 20,
//         right: 20,
//         bottom: 0,
//         left: 20
//       },  
//     },
//     tooltip: {
//       enabled: true,
//       x: {
//         show: true,
//         formatter: (value) => `${value} 2023`,
//       },
//       style: {
//         fontSize: '12px',
//         fontFamily: 'Inter, sans-serif',
//       },
//       marker: {
//         show: false,
//       },
//     },
//     colors: ["#3B82F6"],
//     legend: {
//       position: "top",
//       horizontalAlign: "right",
//       fontSize: "12px",
//       markers: {
//         radius: 12,
//       },
//       itemMargin: {
//         horizontal: 10,
//       },
//     },
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         const mockData = [
//           { month: "Jan", subscriptions: 50 },
//           { month: "Feb", subscriptions: 60 },
//           { month: "Mar", subscriptions: 70 },
//           { month: "Apr", subscriptions: 80 },
//           { month: "May", subscriptions: 90 },
//           { month: "Jun", subscriptions: 100 },
//           { month: "Jul", subscriptions: 110 },
//           { month: "Aug", subscriptions: 120 },
//           { month: "Sep", subscriptions: 130 },
//           { month: "Oct", subscriptions: 140 },
//           { month: "Nov", subscriptions: 150 },
//           { month: "Dec", subscriptions: 160 },
//         ];

//         setSeries([{ 
//           name: "New Subscriptions", 
//           data: mockData.map((item) => item.subscriptions) 
//         }]);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load subscription data");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
//       <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
//         <div>
//           <h3 className="text-lg font-bold text-gray-900">Subscription Growth</h3>
//           <p className="mt-1 text-sm text-gray-500">Monthly new customer acquisition</p>
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className="text-gray-500 hover:text-gray-700 transition-colors"
//           title="Refresh data"
//         >
//           <FiRefreshCw className="w-5 h-5" />
//         </button>
//       </div>
      
//       <div className="flex-1 p-6">
//         {loading ? (
//           <div className="h-full flex flex-col items-center justify-center space-y-3">
//             <FaSpinner className="animate-spin text-3xl text-blue-600" />
//             <p className="text-gray-600 font-medium">Loading subscription data</p>
//           </div>
//         ) : error ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
//               <FiAlertTriangle className="h-6 w-6 text-red-600" />
//             </div>
//             <h3 className="text-lg font-bold text-gray-900">Data Error</h3>
//             <p className="mt-2 text-sm text-gray-600">{error}</p>
//           </div>
//         ) : (
//           <Chart 
//             options={options} 
//             series={series} 
//             type="area" 
//             height="100%"
//             width="100%"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default NewSubscriptionsChart;






// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiRefreshCw } from "react-icons/fi";

// const NewSubscriptionsChart = ({ data }) => {
//   const options = {
//     chart: {
//       type: "area",
//       height: "100%",
//       fontFamily: "Inter, sans-serif",
//       toolbar: {
//         show: true,
//         tools: {
//           download: true,
//           selection: false,
//           zoom: false,
//           zoomin: false,
//           zoomout: false,
//           pan: false,
//           reset: true,
//         },
//       },
//       zoom: { enabled: false },
//       animations: { enabled: true, easing: 'easeinout', speed: 800 },
//     },
//     dataLabels: { enabled: false },
//     stroke: { curve: "smooth", width: 3 },
//     fill: {
//       type: "gradient",
//       gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 90, 100] },
//     },
//     markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
//     xaxis: {
//       categories: data.map(item => item.month),
//       labels: { style: { fontSize: "12px", fontWeight: 500, colors: "#6B7280" } },
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//       tooltip: { enabled: false },
//     },
//     yaxis: {
//       labels: {
//         formatter: (value) => `${value}`,
//         style: { fontSize: "12px", fontWeight: 500, colors: "#6B7280" },
//       },
//     },
//     grid: {
//       borderColor: "#F3F4F6",
//       strokeDashArray: 4,
//       padding: { top: 20, right: 20, bottom: 0, left: 20 },
//     },
//     tooltip: {
//       enabled: true,
//       x: { show: true, formatter: (value) => `${value} 2023` },
//       style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
//       marker: { show: false },
//     },
//     colors: ["#3B82F6"],
//     legend: {
//       position: "top",
//       horizontalAlign: "right",
//       fontSize: "12px",
//       markers: { radius: 12 },
//       itemMargin: { horizontal: 10 },
//     },
//   };

//   const series = [
//     { name: "New Subscriptions", data: data.map(item => item.subscriptions) },
//   ];

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
//       <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
//         <div>
//           <h3 className="text-lg font-bold text-gray-900">Subscription Growth</h3>
//           <p className="mt-1 text-sm text-gray-500">Monthly new customer acquisition</p>
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className="text-gray-500 hover:text-gray-700 transition-colors"
//           title="Refresh data"
//         >
//           <FiRefreshCw className="w-5 h-5" />
//         </button>
//       </div>
//       <div className="flex-1 p-6">
//         <Chart options={options} series={series} type="area" height="100%" width="100%" />
//       </div>
//     </div>
//   );
// };

// NewSubscriptionsChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       subscriptions: PropTypes.number.isRequired,
//     })
//   ).isRequired,
// };

// export default NewSubscriptionsChart;






// // NewSubscriptionsChart.jsx
// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiRefreshCw } from "react-icons/fi";

// const NewSubscriptionsChart = ({ data, theme }) => {
//   const options = {
//     chart: {
//       type: "area",
//       height: "100%",
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       toolbar: {
//         show: true,
//         tools: {
//           download: true,
//           selection: false,
//           zoom: false,
//           zoomin: false,
//           zoomout: false,
//           pan: false,
//           reset: true,
//         },
//       },
//       zoom: { enabled: false },
//       animations: { enabled: true, easing: 'easeinout', speed: 800 },
//     },
//     dataLabels: { enabled: false },
//     stroke: { curve: "smooth", width: 3 },
//     fill: {
//       type: "gradient",
//       gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3, stops: [0, 90, 100] },
//     },
//     markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
//     xaxis: {
//       categories: data.map(item => item.month),
//       labels: { 
//         style: { 
//           fontSize: "12px", 
//           fontWeight: 500, 
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
//         } 
//       },
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//       tooltip: { enabled: false },
//     },
//     yaxis: {
//       labels: {
//         formatter: (value) => `${value}`,
//         style: { 
//           fontSize: "12px", 
//           fontWeight: 500, 
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
//         },
//       },
//     },
//     grid: {
//       borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
//       strokeDashArray: 4,
//       padding: { top: 20, right: 20, bottom: 0, left: 20 },
//     },
//     tooltip: {
//       enabled: true,
//       x: { show: true, formatter: (value) => `${value} 2023` },
//       style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
//       marker: { show: false },
//       theme: theme === 'dark' ? 'dark' : 'light'
//     },
//     colors: ["#3B82F6"],
//     legend: {
//       position: "top",
//       horizontalAlign: "right",
//       fontSize: "12px",
//       markers: { radius: 12 },
//       itemMargin: { horizontal: 10 },
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//   };

//   const series = [
//     { name: "New Subscriptions", data: data.map(item => item.subscriptions) },
//   ];

//   return (
//     <div className={`rounded-xl shadow-sm overflow-hidden h-full flex flex-col ${
//       theme === "dark" 
//         ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//         : "bg-white/80 backdrop-blur-md border-gray-200"
//     } border`}>
//       <div className={`px-6 py-5 border-b ${
//         theme === "dark" ? "border-gray-700" : "border-gray-200"
//       } flex justify-between items-center`}>
//         <div>
//           <h3 className={`text-lg font-bold ${
//             theme === "dark" ? "text-white" : "text-gray-900"
//           }`}>Subscription Growth</h3>
//           <p className={`mt-1 text-sm ${
//             theme === "dark" ? "text-gray-400" : "text-gray-500"
//           }`}>Monthly new customer acquisition</p>
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className={`transition-colors ${
//             theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
//           }`}
//           title="Refresh data"
//         >
//           <FiRefreshCw className="w-5 h-5" />
//         </button>
//       </div>
//       <div className="flex-1 p-6">
//         <Chart options={options} series={series} type="area" height="100%" width="100%" />
//       </div>
//     </div>
//   );
// };

// NewSubscriptionsChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       subscriptions: PropTypes.number.isRequired,
//     })
//   ).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// export default NewSubscriptionsChart;






import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiRefreshCw } from "react-icons/fi";

const NewSubscriptionsChart = ({ data, theme }) => {
  const options = {
    chart: {
      type: "area",
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
      zoom: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { 
        shadeIntensity: 1, 
        opacityFrom: 0.7, 
        opacityTo: 0.3, 
        stops: [0, 90, 100] 
      },
    },
    markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
    xaxis: {
      categories: data.map(item => item.month),
      labels: { 
        style: { 
          fontSize: "12px", 
          fontWeight: 500, 
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
        } 
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}`,
        style: { 
          fontSize: "12px", 
          fontWeight: 500, 
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
        },
      },
    },
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
      strokeDashArray: 3,
      padding: { top: 10, right: 10, bottom: 0, left: 10 },
    },
    tooltip: {
      enabled: true,
      x: { show: true, formatter: (value) => `${value} 2023` },
      style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' },
      marker: { show: false },
      theme: theme === 'dark' ? 'dark' : 'light'
    },
    colors: ["#3B82F6"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: { radius: 12 },
      itemMargin: { horizontal: 10 },
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
      }
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
          position: "top",
          horizontalAlign: "center",
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
            style: {
              fontSize: "10px"
            }
          }
        }
      }
    }]
  };

  const series = [
    { name: "New Subscriptions", data: data.map(item => item.subscriptions) },
  ];

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden h-full flex flex-col ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
        : "bg-white/80 backdrop-blur-md border-gray-200"
    } border`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      } flex justify-between items-center`}>
        <div>
          <h3 className={`text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>Subscription Growth</h3>
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>Monthly new customer acquisition</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className={`p-2 rounded-full transition-colors ${
            theme === "dark" ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
          title="Refresh data"
        >
          <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="flex-1 p-4 sm:p-6">
        <Chart options={options} series={series} type="area" height="100%" width="100%" />
      </div>
    </div>
  );
};

NewSubscriptionsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      subscriptions: PropTypes.number.isRequired,
    })
  ).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default NewSubscriptionsChart;