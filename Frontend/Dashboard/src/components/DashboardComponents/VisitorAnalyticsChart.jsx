



// import React from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";

// const VisitorAnalyticsChart = ({ data, theme }) => {
//   const options = {
//     chart: { 
//       id: "simple-donut", 
//       type: "donut", 
//       width: "100%", 
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
//     },
//     labels: Object.keys(data),
//     plotOptions: { 
//       pie: { 
//         donut: { 
//           size: "70%",
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: 'Total',
//               color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//               formatter: function (w) {
//                 return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
//               }
//             }
//           }
//         } 
//       } 
//     },
//     legend: { 
//       position: "bottom", 
//       fontSize: "12px",
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
//     dataLabels: {
//       enabled: true,
//       style: {
//         colors: [theme === "dark" ? "#111827" : "#FFFFFF"]
//       },
//       dropShadow: {
//         enabled: true,
//         top: 1,
//         left: 1,
//         blur: 1,
//         color: '#000',
//         opacity: 0.45
//       }
//     },
//     responsive: [{
//       breakpoint: 768,
//       options: {
//         chart: {
//           width: "100%",
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
//           position: "bottom",
//           fontSize: "10px"
//         },
//         plotOptions: {
//           pie: {
//             donut: {
//               size: "60%"
//             }
//           }
//         }
//       }
//     }]
//   };

//   const series = Object.values(data);

//   return (
//     <div className="w-full h-full">
//       <h2 className={`text-lg sm:text-xl font-semibold text-center mb-3 sm:mb-4 ${
//         theme === "dark" ? "text-white" : "text-gray-800"
//       }`}>Plan Popularity</h2>
//       <Chart options={options} series={series} type="donut" height={350} width="100%" />
//     </div>
//   );
// };

// VisitorAnalyticsChart.propTypes = {
//   data: PropTypes.objectOf(PropTypes.number).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
// };

// export default VisitorAnalyticsChart;







import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiAlertCircle } from "react-icons/fi";

const VisitorAnalyticsChart = ({ data, theme, onLoad, onError }) => {
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
    if (!data || Object.keys(data).length === 0) {
      setHasError(true);
      if (onError) onError("No data available for Visitor Analytics Chart");
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
        }`}>No visitor data available</p>
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
      id: "plan-popularity-donut", 
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
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    labels: Object.keys(data),
    plotOptions: { 
      pie: { 
        donut: { 
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              color: theme === "dark" ? "#F9FAFB" : "#1F2937",
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: 'Inter, sans-serif',
              color: theme === "dark" ? "#F9FAFB" : "#1F2937",
              formatter: function (val) {
                return val;
              }
            },
            total: {
              show: true,
              label: 'Total Users',
              color: theme === "dark" ? "#F9FAFB" : "#1F2937",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        } 
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
        horizontal: 8,
        vertical: 4
      },
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
      }
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    dataLabels: {
      enabled: true,
      style: {
        colors: [theme === "dark" ? "#111827" : "#FFFFFF"],
        fontSize: '12px'
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: '#000',
        opacity: 0.45
      },
      formatter: function (val, { seriesIndex, w }) {
        return w.config.labels[seriesIndex] + ': ' + val;
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value, { seriesIndex, w }) {
          return value + ' users';
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
          horizontalAlign: "center",
          fontSize: "10px",
          itemMargin: {
            horizontal: 4,
            vertical: 2
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: "60%"
            }
          }
        },
        dataLabels: {
          style: {
            fontSize: '10px'
          }
        }
      }
    }]
  };

  const series = Object.values(data);

  return (
    <div className="w-full h-full">
      <Chart 
        options={options} 
        series={series} 
        type="donut" 
        height={350} 
        width="100%" 
      />
    </div>
  );
};

VisitorAnalyticsChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.number).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

VisitorAnalyticsChart.defaultProps = {
  data: {},
  onLoad: () => {},
  onError: () => {},
};

export default VisitorAnalyticsChart;