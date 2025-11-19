

// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

// const PlanPerformanceChart = ({ data, theme, onLoad, onError }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//       if (onLoad) onLoad();
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [onLoad]);

//   useEffect(() => {
//     if (!data || data.length === 0) {
//       setHasError(true);
//       if (onError) onError("No data available for Plan Performance Chart");
//     } else {
//       setHasError(false);
//     }
//   }, [data, onError]);

//   if (hasError) {
//     return (
//       <div className={`rounded-xl shadow-sm overflow-hidden h-full flex flex-col ${
//         theme === "dark" 
//           ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//           : "bg-white/80 backdrop-blur-md border-gray-200"
//       } border`}>
//         <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//           theme === "dark" ? "border-gray-700" : "border-gray-200"
//         } flex justify-between items-center`}>
//           <div>
//             <h3 className={`text-lg font-bold ${
//               theme === "dark" ? "text-white" : "text-gray-900"
//             }`}>Plan Performance</h3>
//             <p className={`mt-1 text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>Comparison by users, revenue and data usage</p>
//           </div>
//         </div>
//         <div className="flex-1 flex items-center justify-center p-8">
//           <div className="text-center">
//             <FiAlertCircle className={`mx-auto text-3xl mb-3 ${
//               theme === "dark" ? "text-gray-500" : "text-gray-400"
//             }`} />
//             <p className={`text-sm ${
//               theme === "dark" ? "text-gray-400" : "text-gray-500"
//             }`}>No plan performance data available</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className={`rounded-xl shadow-sm overflow-hidden h-full flex flex-col ${
//         theme === "dark" 
//           ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//           : "bg-white/80 backdrop-blur-md border-gray-200"
//       } border animate-pulse`}>
//         <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//           theme === "dark" ? "border-gray-700" : "border-gray-200"
//         }`}>
//           <div className={`h-6 w-48 rounded ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//           }`} />
//           <div className={`h-4 w-64 rounded mt-2 ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//           }`} />
//         </div>
//         <div className="flex-1 p-4 sm:p-6">
//           <div className={`h-64 w-full rounded ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//           }`} />
//         </div>
//       </div>
//     );
//   }

//   const options = {
//     chart: {
//       type: "bar",
//       height: "100%",
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       stacked: false,
//       toolbar: {
//         show: true,
//         tools: {
//           download: true,
//           selection: true,
//           zoom: true,
//           zoomin: true,
//           zoomout: true,
//           pan: true,
//           reset: true,
//         },
//       },
//       animations: { 
//         enabled: true, 
//         easing: 'easeinout', 
//         speed: 800 
//       },
//     },
//     plotOptions: {
//       bar: { 
//         horizontal: false, 
//         columnWidth: "60%", 
//         borderRadius: 6, 
//         borderRadiusApplication: 'end' 
//       },
//     },
//     stroke: { 
//       width: 1, 
//       colors: [theme === "dark" ? "#111827" : "#FFFFFF"] 
//     },
//     xaxis: {
//       categories: data.map(item => item.plan),
//       labels: { 
//         style: { 
//           fontSize: "12px", 
//           fontWeight: 500, 
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
//         } 
//       },
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//     },
//     yaxis: [
//       {
//         seriesName: "Users",
//         title: { 
//           text: "Users", 
//           style: { 
//             fontSize: "12px", 
//             fontWeight: 600, 
//             color: theme === "dark" ? "#D1D5DB" : "#6B7280"
//           } 
//         },
//         labels: { 
//           formatter: (value) => `${Math.round(value)}`, 
//           style: { 
//             fontSize: "12px", 
//             fontWeight: 500, 
//             colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
//           } 
//         },
//       },
//       {
//         seriesName: "Revenue",
//         opposite: true,
//         title: { 
//           text: "Revenue (KES)", 
//           style: { 
//             fontSize: "12px", 
//             fontWeight: 600, 
//             color: theme === "dark" ? "#D1D5DB" : "#6B7280"
//           } 
//         },
//         labels: { 
//           formatter: (value) => `KES ${value.toLocaleString()}`, 
//           style: { 
//             fontSize: "12px", 
//             fontWeight: 500, 
//             colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
//           } 
//         },
//       },
//     ],
//     tooltip: {
//       shared: true,
//       intersect: false,
//       y: {
//         formatter: function (value, { seriesIndex }) {
//           return seriesIndex === 1 ? `KES ${value.toLocaleString()}` : `${Math.round(value)}`;
//         },
//       },
//       style: { 
//         fontSize: '12px', 
//         fontFamily: 'Inter, sans-serif' 
//       },
//       theme: theme === 'dark' ? 'dark' : 'light'
//     },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//     legend: {
//       position: "top",
//       horizontalAlign: "right",
//       fontSize: "12px",
//       markers: { 
//         radius: 8, 
//         width: 8, 
//         height: 8 
//       },
//       itemMargin: { 
//         horizontal: 12 
//       },
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     dataLabels: { enabled: false },
//     grid: {
//       borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
//       strokeDashArray: 3,
//       padding: { top: 10, right: 10, bottom: 0, left: 10 },
//     },
//     responsive: [{
//       breakpoint: 768,
//       options: {
//         chart: {
//           toolbar: {
//             tools: {
//               download: true,
//               selection: false,
//               zoom: false,
//               zoomin: false,
//               zoomout: false,
//               pan: false,
//             }
//           }
//         },
//         plotOptions: {
//           bar: {
//             columnWidth: "70%",
//             borderRadius: 4
//           }
//         },
//         legend: {
//           position: "top",
//           horizontalAlign: "center",
//           fontSize: "10px",
//           itemMargin: {
//             horizontal: 5,
//             vertical: 2
//           }
//         },
//         xaxis: {
//           labels: {
//             style: {
//               fontSize: "10px"
//             }
//           }
//         },
//         yaxis: [
//           {
//             labels: {
//               style: {
//                 fontSize: "10px"
//               }
//             }
//           },
//           {
//             labels: {
//               style: {
//                 fontSize: "10px"
//               }
//             }
//           }
//         ]
//       }
//     }]
//   };

//   const series = [
//     { name: "Users", data: data.map(item => item.users || 0) },
//     { name: "Revenue (KES)", data: data.map(item => item.revenue || 0) },
//     { name: "Avg. Data Usage (GB)", data: data.map(item => item.avg_data_usage || 0) },
//   ];

//   return (
//     <div className={`rounded-xl shadow-sm overflow-hidden h-full flex flex-col ${
//       theme === "dark" 
//         ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//         : "bg-white/80 backdrop-blur-md border-gray-200"
//     } border`}>
//       <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//         theme === "dark" ? "border-gray-700" : "border-gray-200"
//       } flex justify-between items-center`}>
//         <div>
//           <h3 className={`text-lg font-bold ${
//             theme === "dark" ? "text-white" : "text-gray-900"
//           }`}>Plan Performance</h3>
//           <p className={`mt-1 text-sm ${
//             theme === "dark" ? "text-gray-400" : "text-gray-500"
//           }`}>Comparison by users, revenue and data usage</p>
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className={`p-2 rounded-full transition-colors ${
//             theme === "dark" ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
//           }`}
//           title="Refresh data"
//         >
//           <FiRefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
//         </button>
//       </div>
//       <div className="flex-1 p-4 sm:p-6">
//         <Chart 
//           options={options} 
//           series={series} 
//           type="bar" 
//           height="100%" 
//           width="100%" 
//         />
//       </div>
//     </div>
//   );
// };

// PlanPerformanceChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       plan: PropTypes.string.isRequired,
//       users: PropTypes.number.isRequired,
//       revenue: PropTypes.number.isRequired,
//       avg_data_usage: PropTypes.number.isRequired,
//     })
//   ).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
// };

// PlanPerformanceChart.defaultProps = {
//   data: [],
//   onLoad: () => {},
//   onError: () => {},
// };

// export default PlanPerformanceChart;




import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

const PlanPerformanceChart = ({ 
  data = [], 
  theme = "light", 
  onLoad = () => {}, 
  onError = () => {} 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoad) onLoad();
    }, 800);

    return () => clearTimeout(timer);
  }, [onLoad]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setHasError(true);
      if (onError) onError("No data available for Plan Performance Chart");
    } else {
      setHasError(false);
    }
  }, [data, onError]);

  if (hasError) {
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
            }`}>Plan Performance</h3>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>Comparison by users, revenue and data usage</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <FiAlertCircle className={`mx-auto text-3xl mb-3 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`} />
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>No plan performance data available</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-sm overflow-hidden h-full flex flex-col ${
        theme === "dark" 
          ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
          : "bg-white/80 backdrop-blur-md border-gray-200"
      } border animate-pulse`}>
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className={`h-6 w-48 rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
          <div className={`h-4 w-64 rounded mt-2 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <div className={`h-64 w-full rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
        </div>
      </div>
    );
  }

  const options = {
    chart: {
      type: "bar",
      height: "100%",
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
      stacked: false,
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
      animations: { 
        enabled: true, 
        easing: 'easeinout', 
        speed: 800 
      },
    },
    plotOptions: {
      bar: { 
        horizontal: false, 
        columnWidth: "60%", 
        borderRadius: 6, 
        borderRadiusApplication: 'end' 
      },
    },
    stroke: { 
      width: 1, 
      colors: [theme === "dark" ? "#111827" : "#FFFFFF"] 
    },
    xaxis: {
      categories: data.map(item => item.plan),
      labels: { 
        style: { 
          fontSize: "12px", 
          fontWeight: 500, 
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
        } 
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        seriesName: "Users",
        title: { 
          text: "Users", 
          style: { 
            fontSize: "12px", 
            fontWeight: 600, 
            color: theme === "dark" ? "#D1D5DB" : "#6B7280"
          } 
        },
        labels: { 
          formatter: (value) => `${Math.round(value)}`, 
          style: { 
            fontSize: "12px", 
            fontWeight: 500, 
            colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
          } 
        },
      },
      {
        seriesName: "Revenue",
        opposite: true,
        title: { 
          text: "Revenue (KES)", 
          style: { 
            fontSize: "12px", 
            fontWeight: 600, 
            color: theme === "dark" ? "#D1D5DB" : "#6B7280"
          } 
        },
        labels: { 
          formatter: (value) => `KES ${value.toLocaleString()}`, 
          style: { 
            fontSize: "12px", 
            fontWeight: 500, 
            colors: theme === "dark" ? "#D1D5DB" : "#6B7280"
          } 
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value, { seriesIndex }) {
          return seriesIndex === 1 ? `KES ${value.toLocaleString()}` : `${Math.round(value)}`;
        },
      },
      style: { 
        fontSize: '12px', 
        fontFamily: 'Inter, sans-serif' 
      },
      theme: theme === 'dark' ? 'dark' : 'light'
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: { 
        radius: 8, 
        width: 8, 
        height: 8 
      },
      itemMargin: { 
        horizontal: 12 
      },
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
      }
    },
    dataLabels: { enabled: false },
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
        plotOptions: {
          bar: {
            columnWidth: "70%",
            borderRadius: 4
          }
        },
        legend: {
          position: "top",
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
        yaxis: [
          {
            labels: {
              style: {
                fontSize: "10px"
              }
            }
          },
          {
            labels: {
              style: {
                fontSize: "10px"
              }
            }
          }
        ]
      }
    }]
  };

  const series = [
    { name: "Users", data: data.map(item => item.users || 0) },
    { name: "Revenue (KES)", data: data.map(item => item.revenue || 0) },
    { name: "Avg. Data Usage (GB)", data: data.map(item => item.avg_data_usage || 0) },
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
          }`}>Plan Performance</h3>
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>Comparison by users, revenue and data usage</p>
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
        <Chart 
          options={options} 
          series={series} 
          type="bar" 
          height="100%" 
          width="100%" 
        />
      </div>
    </div>
  );
};

PlanPerformanceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      plan: PropTypes.string.isRequired,
      users: PropTypes.number.isRequired,
      revenue: PropTypes.number.isRequired,
      avg_data_usage: PropTypes.number.isRequired,
    })
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default PlanPerformanceChart;