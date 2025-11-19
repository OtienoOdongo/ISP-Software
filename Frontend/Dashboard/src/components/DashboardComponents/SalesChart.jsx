




// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiAlertCircle } from "react-icons/fi";

// const SalesChart = ({ data, theme, onLoad, onError }) => {
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
//       if (onError) onError("No data available for Sales Chart");
//     } else {
//       setHasError(false);
//     }
//   }, [data, onError]);

//   // Process data to get unique months and plans
//   const processedData = React.useMemo(() => {
//     if (!data || data.length === 0) return { months: [], plans: [], series: [] };

//     const months = [...new Set(data.map(item => item.month))];
//     const plans = [...new Set(data.map(item => item.plan))];

//     const series = plans.map(plan => ({
//       name: plan,
//       data: months.map(month => {
//         const entry = data.find(item => item.month === month && item.plan === plan);
//         return entry ? entry.sales : 0;
//       }),
//     }));

//     return { months, plans, series };
//   }, [data]);

//   if (hasError) {
//     return (
//       <div className="w-full h-full flex flex-col items-center justify-center">
//         <FiAlertCircle className={`text-2xl mb-2 ${
//           theme === "dark" ? "text-gray-500" : "text-gray-400"
//         }`} />
//         <p className={`text-sm ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>No sales data available</p>
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
//       id: "sales-bar-chart", 
//       fontFamily: "Inter, sans-serif", 
//       height: "100%",
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
//       type: "category",
//       categories: processedData.months,
//       labels: {
//         style: {
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
//           fontSize: "12px",
//         },
//         rotate: -45,
//       }
//     },
//     yaxis: { 
//       title: { 
//         text: "Number of Users", 
//         style: { 
//           fontSize: "14px", 
//           fontWeight: "600",
//           color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         } 
//       },
//       labels: {
//         style: {
//           colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
//           fontSize: "12px",
//         }
//       }
//     },
//     plotOptions: { 
//       bar: { 
//         columnWidth: "70%", 
//         endingShape: "rounded",
//         borderRadius: 4,
//         dataLabels: {
//           position: 'top'
//         }
//       } 
//     },
//     stroke: { 
//       show: true, 
//       width: 1, 
//       colors: ["transparent"] 
//     },
//     legend: { 
//       show: true, 
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
//     dataLabels: { 
//       enabled: false 
//     },
//     colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
//     grid: {
//       borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
//       strokeDashArray: 3,
//       padding: { top: 10, right: 10, bottom: 0, left: 10 },
//       xaxis: {
//         lines: {
//           show: false
//         }
//       }
//     },
//     tooltip: {
//       enabled: true,
//       shared: true,
//       intersect: false,
//       style: {
//         fontSize: '12px',
//         fontFamily: 'Inter, sans-serif'
//       },
//       theme: theme === 'dark' ? 'dark' : 'light',
//       y: {
//         formatter: function (value) {
//           return value + " users";
//         }
//       }
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
//             },
//             rotate: -45,
//           }
//         },
//         yaxis: {
//           labels: {
//             style: {
//               fontSize: "10px"
//             }
//           }
//         },
//         plotOptions: {
//           bar: {
//             columnWidth: "80%"
//           }
//         }
//       }
//     }]
//   };

//   return (
//     <div className="w-full h-full">
//       <Chart 
//         options={options} 
//         series={processedData.series} 
//         type="bar" 
//         height={350} 
//         width="100%" 
//       />
//     </div>
//   );
// };

// SalesChart.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       month: PropTypes.string.isRequired,
//       plan: PropTypes.string.isRequired,
//       sales: PropTypes.number.isRequired,
//     })
//   ).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
// };

// SalesChart.defaultProps = {
//   data: [],
//   onLoad: () => {},
//   onError: () => {},
// };

// export default SalesChart;







import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiAlertCircle } from "react-icons/fi";

const SalesChart = ({ 
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
      if (onError) onError("No data available for Sales Chart");
    } else {
      setHasError(false);
    }
  }, [data, onError]);

  // Process data to get unique months and plans
  const processedData = React.useMemo(() => {
    if (!data || data.length === 0) return { months: [], plans: [], series: [] };

    const months = [...new Set(data.map(item => item.month))];
    const plans = [...new Set(data.map(item => item.plan))];

    const series = plans.map(plan => ({
      name: plan,
      data: months.map(month => {
        const entry = data.find(item => item.month === month && item.plan === plan);
        return entry ? entry.sales : 0;
      }),
    }));

    return { months, plans, series };
  }, [data]);

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <FiAlertCircle className={`text-2xl mb-2 ${
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        }`} />
        <p className={`text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>No sales data available</p>
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
      id: "sales-bar-chart", 
      fontFamily: "Inter, sans-serif", 
      height: "100%",
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
      type: "category",
      categories: processedData.months,
      labels: {
        style: {
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
          fontSize: "12px",
        },
        rotate: -45,
      }
    },
    yaxis: { 
      title: { 
        text: "Number of Users", 
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
    plotOptions: { 
      bar: { 
        columnWidth: "70%", 
        endingShape: "rounded",
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      } 
    },
    stroke: { 
      show: true, 
      width: 1, 
      colors: ["transparent"] 
    },
    legend: { 
      show: true, 
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
    dataLabels: { 
      enabled: false 
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
      strokeDashArray: 3,
      padding: { top: 10, right: 10, bottom: 0, left: 10 },
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      theme: theme === 'dark' ? 'dark' : 'light',
      y: {
        formatter: function (value) {
          return value + " users";
        }
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
            },
            rotate: -45,
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: "10px"
            }
          }
        },
        plotOptions: {
          bar: {
            columnWidth: "80%"
          }
        }
      }
    }]
  };

  return (
    <div className="w-full h-full">
      <Chart 
        options={options} 
        series={processedData.series} 
        type="bar" 
        height={350} 
        width="100%" 
      />
    </div>
  );
};

SalesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      plan: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
    })
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default SalesChart;