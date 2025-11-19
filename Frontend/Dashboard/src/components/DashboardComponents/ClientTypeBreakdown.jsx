// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import PropTypes from "prop-types";
// import { FiUsers, FiWifi, FiServer } from "react-icons/fi";

// const ClientTypeBreakdown = ({ data, theme, onLoad, onError }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//       if (onLoad) onLoad();
//     }, 600);

//     return () => clearTimeout(timer);
//   }, [onLoad]);

//   useEffect(() => {
//     if (!data || data.length === 0) {
//       setHasError(true);
//       if (onError) onError("No data available for Client Type Breakdown");
//     } else {
//       setHasError(false);
//     }
//   }, [data, onError]);

//   if (hasError) {
//     return null; // Don't show anything if no data
//   }

//   if (isLoading) {
//     return (
//       <div className={`rounded-xl shadow-sm overflow-hidden ${
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
//         </div>
//         <div className="p-4 sm:p-6">
//           <div className={`h-48 w-full rounded ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-300"
//           }`} />
//         </div>
//       </div>
//     );
//   }

//   const totalClients = data.reduce((sum, item) => sum + (item.count || 0), 0);

//   const options = {
//     chart: {
//       type: "donut",
//       height: "100%",
//       fontFamily: "Inter, sans-serif",
//       background: "transparent",
//       foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
//       animations: {
//         enabled: true,
//         easing: 'easeinout',
//         speed: 800,
//       },
//     },
//     labels: data.map(item => item.type),
//     colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
//     plotOptions: {
//       pie: {
//         donut: {
//           size: "65%",
//           labels: {
//             show: true,
//             name: {
//               show: true,
//               fontSize: '14px',
//               fontFamily: 'Inter, sans-serif',
//               color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//             },
//             value: {
//               show: true,
//               fontSize: '20px',
//               fontFamily: 'Inter, sans-serif',
//               color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//               formatter: function (val) {
//                 return val + "%";
//               }
//             },
//             total: {
//               show: true,
//               label: 'Total Clients',
//               color: theme === "dark" ? "#F9FAFB" : "#1F2937",
//               formatter: function (w) {
//                 return totalClients.toString();
//               }
//             }
//           }
//         }
//       }
//     },
//     dataLabels: {
//       enabled: true,
//       style: {
//         colors: [theme === "dark" ? "#111827" : "#FFFFFF"],
//         fontSize: '12px',
//         fontFamily: 'Inter, sans-serif'
//       },
//       dropShadow: {
//         enabled: true,
//         top: 1,
//         left: 1,
//         blur: 1,
//         color: '#000',
//         opacity: 0.45
//       },
//       formatter: function (val, { seriesIndex, w }) {
//         return w.config.labels[seriesIndex] + ': ' + val.toFixed(1) + '%';
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
//         horizontal: 8,
//         vertical: 4
//       },
//       labels: {
//         colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
//         useSeriesColors: false
//       }
//     },
//     tooltip: {
//       enabled: true,
//       y: {
//         formatter: function (value, { seriesIndex, w }) {
//           const count = data[seriesIndex]?.count || 0;
//           return `${count} clients (${value.toFixed(1)}%)`;
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
//           height: 300
//         },
//         plotOptions: {
//           pie: {
//             donut: {
//               size: "55%"
//             }
//           }
//         },
//         legend: {
//           position: "bottom",
//           horizontalAlign: "center",
//           fontSize: "10px",
//           itemMargin: {
//             horizontal: 4,
//             vertical: 2
//           }
//         },
//         dataLabels: {
//           style: {
//             fontSize: '10px'
//           }
//         }
//       }
//     }]
//   };

//   const series = data.map(item => item.percentage || 0);

//   return (
//     <div className={`rounded-xl shadow-sm overflow-hidden ${
//       theme === "dark" 
//         ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
//         : "bg-white/80 backdrop-blur-md border-gray-200"
//     } border`}>
//       <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
//         theme === "dark" ? "border-gray-700" : "border-gray-200"
//       }`}>
//         <h3 className={`text-lg font-bold ${
//           theme === "dark" ? "text-white" : "text-gray-900"
//         }`}>Client Type Distribution</h3>
//         <p className={`mt-1 text-sm ${
//           theme === "dark" ? "text-gray-400" : "text-gray-500"
//         }`}>Breakdown of Hotspot vs PPPoE clients</p>
//       </div>
//       <div className="p-4 sm:p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
//           <div className="h-64">
//             <Chart 
//               options={options} 
//               series={series} 
//               type="donut" 
//               height="100%" 
//               width="100%"
//             />
//           </div>
//           <div className="space-y-3">
//             {data.map((item, index) => (
//               <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-opacity-50"
//                 style={{
//                   backgroundColor: theme === "dark" ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
//                 }}>
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${
//                     theme === "dark" ? 'bg-gray-700' : 'bg-gray-200'
//                   }`}>
//                     {item.type === 'Hotspot' ? (
//                       <FiWifi className={`text-lg ${
//                         theme === "dark" ? "text-blue-400" : "text-blue-600"
//                       }`} />
//                     ) : (
//                       <FiServer className={`text-lg ${
//                         theme === "dark" ? "text-green-400" : "text-green-600"
//                       }`} />
//                     )}
//                   </div>
//                   <div>
//                     <p className={`font-medium ${
//                       theme === "dark" ? "text-white" : "text-gray-900"
//                     }`}>{item.type}</p>
//                     <p className={`text-sm ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}>{item.count} clients</p>
//                   </div>
//                 </div>
//                 <div className={`text-lg font-bold ${
//                   theme === "dark" ? "text-white" : "text-gray-900"
//                 }`}>
//                   {item.percentage?.toFixed(1)}%
//                 </div>
//               </div>
//             ))}
//             <div className={`mt-4 p-3 rounded-lg ${
//               theme === "dark" ? "bg-gray-700" : "bg-gray-100"
//             }`}>
//               <div className="flex items-center justify-between">
//                 <span className={`text-sm ${
//                   theme === "dark" ? "text-gray-300" : "text-gray-700"
//                 }`}>Total Clients</span>
//                 <span className={`font-bold ${
//                   theme === "dark" ? "text-white" : "text-gray-900"
//                 }`}>{totalClients}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// ClientTypeBreakdown.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       type: PropTypes.string.isRequired,
//       count: PropTypes.number.isRequired,
//       percentage: PropTypes.number.isRequired,
//     })
//   ).isRequired,
//   theme: PropTypes.oneOf(["light", "dark"]).isRequired,
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
// };

// ClientTypeBreakdown.defaultProps = {
//   data: [],
//   onLoad: () => {},
//   onError: () => {},
// };

// export default ClientTypeBreakdown;









import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiUsers, FiWifi, FiServer } from "react-icons/fi";

const ClientTypeBreakdown = ({ 
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
    }, 600);

    return () => clearTimeout(timer);
  }, [onLoad]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setHasError(true);
      if (onError) onError("No data available for Client Type Breakdown");
    } else {
      setHasError(false);
    }
  }, [data, onError]);

  if (hasError) {
    return null; // Don't show anything if no data
  }

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-sm overflow-hidden ${
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
        </div>
        <div className="p-4 sm:p-6">
          <div className={`h-48 w-full rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
        </div>
      </div>
    );
  }

  const totalClients = data.reduce((sum, item) => sum + (item.count || 0), 0);

  const options = {
    chart: {
      type: "donut",
      height: "100%",
      fontFamily: "Inter, sans-serif",
      background: "transparent",
      foreColor: theme === "dark" ? "#F9FAFB" : "#1F2937",
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    labels: data.map(item => item.type),
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
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
                return val + "%";
              }
            },
            total: {
              show: true,
              label: 'Total Clients',
              color: theme === "dark" ? "#F9FAFB" : "#1F2937",
              formatter: function (w) {
                return totalClients.toString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: [theme === "dark" ? "#111827" : "#FFFFFF"],
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
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
        return w.config.labels[seriesIndex] + ': ' + val.toFixed(1) + '%';
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
        useSeriesColors: false
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value, { seriesIndex, w }) {
          const count = data[seriesIndex]?.count || 0;
          return `${count} clients (${value.toFixed(1)}%)`;
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
          height: 300
        },
        plotOptions: {
          pie: {
            donut: {
              size: "55%"
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
        dataLabels: {
          style: {
            fontSize: '10px'
          }
        }
      }
    }]
  };

  const series = data.map(item => item.percentage || 0);

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
        : "bg-white/80 backdrop-blur-md border-gray-200"
    } border`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}>
        <h3 className={`text-lg font-bold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>Client Type Distribution</h3>
        <p className={`mt-1 text-sm ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>Breakdown of Hotspot vs PPPoE clients</p>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          <div className="h-64">
            <Chart 
              options={options} 
              series={series} 
              type="donut" 
              height="100%" 
              width="100%"
            />
          </div>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-opacity-50"
                style={{
                  backgroundColor: theme === "dark" ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.5)'
                }}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === "dark" ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {item.type === 'Hotspot' ? (
                      <FiWifi className={`text-lg ${
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      }`} />
                    ) : (
                      <FiServer className={`text-lg ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`} />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>{item.type}</p>
                    <p className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>{item.count} clients</p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {item.percentage?.toFixed(1)}%
                </div>
              </div>
            ))}
            <div className={`mt-4 p-3 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>Total Clients</span>
                <span className={`font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>{totalClients}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ClientTypeBreakdown.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      percentage: PropTypes.number.isRequired,
    })
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default ClientTypeBreakdown;