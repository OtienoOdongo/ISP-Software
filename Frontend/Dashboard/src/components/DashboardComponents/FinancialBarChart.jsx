







// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiAlertCircle } from "react-icons/fi";

// const FinancialBarChart = ({ data, theme, onLoad, onError }) => {
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
//       if (onError) onError("No data available for Financial Bar Chart");
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
//         }`}>No financial data available</p>
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
//       type: "bar", 
//       stacked: true, 
//       height: "100%",
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
//           fontSize: "12px",
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
//           fontSize: "12px",
//         }
//       },
//     },
//     plotOptions: { 
//       bar: { 
//         horizontal: false, 
//         columnWidth: "60%",
//         borderRadius: 4,
//         borderRadiusApplication: 'end'
//       } 
//     },
//     stroke: { 
//       width: 1, 
//       colors: [theme === "dark" ? "#111827" : "#FFFFFF"] 
//     },
//     legend: { 
//       position: "top", 
//       horizontalAlign: "center", 
//       fontSize: "12px",
//       markers: {
//         radius: 6,
//         width: 6,
//         height: 6,
//       },
//       itemMargin: {
//         horizontal: 10,
//         vertical: 5
//       },
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       }
//     },
//     dataLabels: { enabled: false },
//     colors: ["#A20ACC", "#34CC0A", "#F40B49"],
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
//           height: 300,
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
//             columnWidth: "70%"
//           }
//         },
//         legend: {
//           position: "bottom",
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
//     { name: "Income", data: data.map(item => item.income || 0) },
//     { name: "Profit", data: data.map(item => item.profit || 0) },
//     { name: "Expenses", data: data.map(item => item.expenses || 0) },
//   ];

//   return (
//     <div className="w-full h-full">
//       <Chart 
//         options={options} 
//         series={series} 
//         type="bar" 
//         height={350}
//         width="100%"
//       />
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
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
// };

// FinancialBarChart.defaultProps = {
//   data: [],
//   onLoad: () => {},
//   onError: () => {},
// };

// export default FinancialBarChart;












import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiAlertCircle } from "react-icons/fi";

const FinancialBarChart = ({ 
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
      if (onError) onError("No data available for Financial Bar Chart");
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
        }`}>No financial data available</p>
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
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
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
    stroke: { 
      width: 1, 
      colors: [theme === "dark" ? "#111827" : "#FFFFFF"] 
    },
    legend: { 
      position: "top", 
      horizontalAlign: "center", 
      fontSize: "12px",
      markers: {
        radius: 6,
        width: 6,
        height: 6,
      },
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
    { name: "Income", data: data.map(item => item.income || 0) },
    { name: "Profit", data: data.map(item => item.profit || 0) },
    { name: "Expenses", data: data.map(item => item.expenses || 0) },
  ];

  return (
    <div className="w-full h-full">
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
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default FinancialBarChart;