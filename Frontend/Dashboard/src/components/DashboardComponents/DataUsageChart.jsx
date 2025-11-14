import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";
import { FiRefreshCw, FiAlertCircle } from "react-icons/fi";

const DataUsageChart = ({ data, theme, onLoad, onError }) => {
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
      if (onError) onError("No data available for Data Usage chart");
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
            }`}>Data Usage Analytics</h3>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>Monthly data consumption by connection type</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <FiAlertCircle className={`mx-auto text-3xl mb-3 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`} />
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>No data available for display</p>
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
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 6,
        borderRadiusApplication: 'end',
        dataLabels: {
          position: 'top'
        }
      },
    },
    dataLabels: {
      enabled: false,
      formatter: function (val) {
        return val.toFixed(1) + " GB";
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: [theme === "dark" ? "#F9FAFB" : "#1F2937"]
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: data.map(item => item.month),
      labels: {
        style: {
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
          fontSize: "12px",
        },
        rotate: -45,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Data Usage (GB)",
        style: {
          fontSize: "14px",
          fontWeight: "600",
          color: theme === "dark" ? "#F9FAFB" : "#1F2937",
        }
      },
      labels: {
        formatter: (value) => `${value.toFixed(1)} GB`,
        style: {
          colors: theme === "dark" ? "#D1D5DB" : "#6B7280",
          fontSize: "12px",
        }
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
      markers: {
        radius: 8,
        width: 8,
        height: 8,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 4
      },
      labels: {
        colors: theme === "dark" ? "#F9FAFB" : "#1F2937",
        useSeriesColors: false
      }
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      borderColor: theme === "dark" ? "#374151" : "#E5E7EB",
      strokeDashArray: 3,
      padding: { top: 10, right: 10, bottom: 0, left: 10 },
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: function (value) {
          return value.toFixed(1) + " GB";
        }
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      theme: theme === 'dark' ? 'dark' : 'light',
      marker: {
        show: true
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
        plotOptions: {
          bar: {
            columnWidth: "70%",
            borderRadius: 4
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
        dataLabels: {
          enabled: false
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
        }
      }
    }]
  };

  const series = [
    { 
      name: "Hotspot Data", 
      data: data.map(item => item.hotspot_data || 0) 
    },
    { 
      name: "PPPoE Data", 
      data: data.map(item => item.pppoe_data || 0) 
    },
    { 
      name: "Total Data", 
      data: data.map(item => item.total_data || 0) 
    },
  ];

  const totalHotspotData = data.reduce((sum, item) => sum + (item.hotspot_data || 0), 0);
  const totalPppoeData = data.reduce((sum, item) => sum + (item.pppoe_data || 0), 0);
  const totalData = totalHotspotData + totalPppoeData;

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
          }`}>Data Usage Analytics</h3>
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>Monthly data consumption by connection type</p>
        </div>
        <div className={`flex items-center gap-4 text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Hotspot: {(totalHotspotData).toFixed(1)} GB</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>PPPoE: {(totalPppoeData).toFixed(1)} GB</span>
          </div>
        </div>
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

DataUsageChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      hotspot_data: PropTypes.number,
      pppoe_data: PropTypes.number,
      total_data: PropTypes.number,
    })
  ).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

DataUsageChart.defaultProps = {
  data: [],
  onLoad: () => {},
  onError: () => {},
};

export default DataUsageChart;