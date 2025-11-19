


// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiAlertCircle } from "react-icons/fi";

// const RevenueChart = ({ data, theme, onLoad, onError }) => {
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
//       if (onError) onError("No data available for Revenue Chart");
//     } else {
//       setHasError(false);
//     }
//   }, [data, onError]);

//   if (hasError) {
//     return (
//       <div className="w-full h-full flex flex-col items-center justify-center">
//         <FiAlertCircle className={`text-2xl mb-2 ${
//           theme === "dark" ? "text-gray-500" : "text-gray-400"
//         }`} />
//         <p className={`text-sm ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>No revenue data available</p>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="w-full h-full flex items-center justify-center">
//         <div className={`animate-pulse w-full h-64 rounded ${
//           theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//         }`} />
//       </div>
//     );
//   }

//   const options = {
//     chart: { 
//       id: "revenue-area-chart", 
//       height: "100%", 
//       type: "area", 
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
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
//         speed: 800,
//       },
//     },
//     xaxis: {
//       categories: data.map(item => item.month),
//       labels: {
//         style: {
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
//           fontSize: "12px",
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
//           fontSize: "12px",
//         }
//       },
//     },
//     stroke: { 
//       curve: "smooth", 
//       width: [2, 2], 
//       dashArray: [0, 5] 
//     },
//     fill: { 
//       type: "gradient", 
//       gradient: { 
//         shadeIntensity: 1, 
//         opacityFrom: 0.7, 
//         opacityTo: 0.3, 
//         stops: [0, 90, 100] 
//       } 
//     },
//     legend: { 
//       position: "bottom", 
//       horizontalAlign: "center",
//       fontSize: "12px",
//       markers: {
//         radius: 6,
//         width: 6,
//         height: 6,
//       },
//       itemMargin: {
//         horizontal: 10,
//         vertical: 4
//       },
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     dataLabels: { enabled: false },
//     colors: ["#3B82F6", "#10B981"],
//     grid: {
//       borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
//       strokeDashArray: 3,
//       padding: { top: 10, right: 10, bottom: 0, left: 10 },
//     },
//     tooltip: {
//       enabled: true,
//       shared: true,
//       intersect: false,
//       y: {
//         formatter: function (value) {
//           return `KES ${value.toLocaleString()}`;
//         }
//       },
//       style: {
//         fontSize: '12px',
//         fontFamily: 'Inter, sans-serif'
//       },
//       theme: theme === 'dark' ? 'dark' : 'light'
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
//         legend: {
//           fontSize: "10px",
//           position: "bottom",
//           horizontalAlign: "center",
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
//         yaxis: {
//           labels: {
//             formatter: (value) => `KES ${value > 1000 ? (value/1000).toFixed(0) + 'K' : value}`,
//             style: {
//               fontSize: "10px"
//             }
//           }
//         }
//       }
//     }]
//   };

//   const series = [
//     { name: "Targeted Revenue", data: data.map(item => item.targeted_revenue || 0) },
//     { name: "Projected Revenue", data: data.map(item => item.projected_revenue || 0) },
//   ];

//   return (
//     <div className="w-full h-full">
//       <Chart 
//         options={options} 
//         series={series} 
//         type="area" 
//         height={350} 
//         width="100%" 
//       />
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
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
// };

// RevenueChart.defaultProps = {
//   data: [],
//   onLoad: () => {},
//   onError: () => {},
// };

// export default RevenueChart;






import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiAlertCircle } from "react-icons/fi";

const RevenueChart = ({ 
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
      if (onError) onError("No data available for Revenue Chart");
    } else {
      setHasError(false);
    }
  }, [data, onError]);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <FiAlertCircle className={`text-2xl mb-2 ${
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        }`} />
        <p className={`text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>No revenue data available</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`animate-pulse w-full h-64 rounded ${
          theme === "dark" ? "bg-gray-700" : "bg-gray-300"
        }`} />
      </div>
    );
  }

  const options = {
    chart: { 
      id: "revenue-area-chart", 
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
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
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
    stroke: { 
      curve: "smooth", 
      width: [2, 2], 
      dashArray: [0, 5] 
    },
    fill: { 
      type: "gradient", 
      gradient: { 
        shadeIntensity: 1, 
        opacityFrom: 0.7, 
        opacityTo: 0.3, 
        stops: [0, 90, 100] 
      } 
    },
    legend: { 
      position: "bottom", 
      horizontalAlign: "center",
      fontSize: "12px",
      markers: {
        radius: 6,
        width: 6,
        height: 6,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 4
      },
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
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return `KES ${value.toLocaleString()}`;
        }
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      theme: theme === 'dark' ? 'dark' : 'light'
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
          fontSize: "10px",
          position: "bottom",
          horizontalAlign: "center",
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
    { name: "Targeted Revenue", data: data.map(item => item.targeted_revenue || 0) },
    { name: "Projected Revenue", data: data.map(item => item.projected_revenue || 0) },
  ];

  return (
    <div className="w-full h-full">
      <Chart 
        options={options} 
        series={series} 
        type="area" 
        height={350} 
        width="100%" 
      />
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
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default RevenueChart;