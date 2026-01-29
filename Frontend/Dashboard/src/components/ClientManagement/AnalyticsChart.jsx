


// import React, { useMemo, useRef, useEffect, useState } from 'react';
// import {
//   FiTrendingUp,
//   FiTrendingDown,
//   FiBarChart2,
//   FiPieChart,
//   FiLineChart
// } from 'react-icons/fi';
// import { FaSpinner } from 'react-icons/fa';

// const AnalyticsChart = ({ 
//   data, 
//   type = 'line', 
//   title, 
//   height = 300,
//   theme,
//   loading = false
// }) => {
//   const canvasRef = useRef(null);
//   const chartInstance = useRef(null);
//   const [isChartLoading, setIsChartLoading] = useState(false);
//   const [chartError, setChartError] = useState(null);

//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gray-800 border-gray-700 text-gray-100' 
//       : 'bg-white border-gray-200 text-gray-900',
//     heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
//     subheading: theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
//   };

//   // Process chart data
//   const chartData = useMemo(() => {
//     if (!data || !data.labels || !data.datasets) {
//       return {
//         labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//         datasets: [
//           {
//             label: 'Sample Data',
//             data: [65, 59, 80, 81, 56, 55],
//             borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
//             backgroundColor: theme === 'dark' ? '#1e40af' : '#dbeafe',
//             tension: 0.4
//           }
//         ]
//       };
//     }
//     return data;
//   }, [data, theme]);

//   // Chart options
//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//         labels: {
//           color: theme === 'dark' ? '#d1d5db' : '#374151',
//           font: {
//             size: 12
//           }
//         }
//       },
//       tooltip: {
//         backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
//         titleColor: theme === 'dark' ? '#ffffff' : '#111827',
//         bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
//         borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
//         borderWidth: 1,
//         callbacks: {
//           label: function(context) {
//             let label = context.dataset.label || '';
//             if (label) {
//               label += ': ';
//             }
//             if (context.parsed.y !== null) {
//               label += new Intl.NumberFormat('en-US').format(context.parsed.y);
//             }
//             return label;
//           }
//         }
//       }
//     },
//     scales: {
//       x: {
//         grid: {
//           color: theme === 'dark' ? '#374151' : '#e5e7eb',
//           drawBorder: false
//         },
//         ticks: {
//           color: theme === 'dark' ? '#9ca3af' : '#6b7280'
//         }
//       },
//       y: {
//         grid: {
//           color: theme === 'dark' ? '#374151' : '#e5e7eb',
//           drawBorder: false
//         },
//         ticks: {
//           color: theme === 'dark' ? '#9ca3af' : '#6b7280',
//           callback: function(value) {
//             if (value >= 1000) {
//               return value/1000 + 'k';
//             }
//             return value;
//           }
//         },
//         beginAtZero: true
//       }
//     },
//     animation: {
//       duration: 750,
//       easing: 'easeInOutQuart'
//     }
//   }), [theme]);

//   // Initialize chart
//   useEffect(() => {
//     if (!canvasRef.current || loading) return;

//     const initChart = async () => {
//       try {
//         setIsChartLoading(true);
//         setChartError(null);

//         // Dynamically import Chart.js
//         const Chart = (await import('chart.js/auto')).default;
        
//         // Register required components based on chart type
//         if (type === 'pie' || type === 'doughnut') {
//           await import('chart.js');
//         }
        
//         // Destroy existing chart
//         if (chartInstance.current) {
//           chartInstance.current.destroy();
//         }

//         // Create new chart
//         const ctx = canvasRef.current.getContext('2d');
        
//         let chartType;
//         switch (type) {
//           case 'bar': chartType = 'bar'; break;
//           case 'pie': chartType = 'pie'; break;
//           case 'doughnut': chartType = 'doughnut'; break;
//           default: chartType = 'line';
//         }

//         chartInstance.current = new Chart(ctx, {
//           type: chartType,
//           data: chartData,
//           options: chartOptions
//         });

//       } catch (err) {
//         console.error('Error initializing chart:', err);
//         setChartError('Failed to load chart. Please try again.');
//       } finally {
//         setIsChartLoading(false);
//       }
//     };

//     initChart();

//     // Cleanup
//     return () => {
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//       }
//     };
//   }, [chartData, chartOptions, type, loading]);

//   // Get chart icon based on type
//   const getChartIcon = () => {
//     switch (type) {
//       case 'bar': return <FiBarChart2 />;
//       case 'pie': return <FiPieChart />;
//       case 'line': return <FiLineChart />;
//       default: return <FiLineChart />;
//     }
//   };

//   // Calculate statistics
//   const calculateStats = useMemo(() => {
//     if (!chartData.datasets || chartData.datasets.length === 0) {
//       return { avg: 0, min: 0, max: 0, trend: 'neutral', total: 0 };
//     }

//     const dataset = chartData.datasets[0];
//     const values = dataset.data;
    
//     const total = values.reduce((a, b) => a + b, 0);
//     const avg = total / values.length;
//     const min = Math.min(...values);
//     const max = Math.max(...values);
    
//     // Calculate trend (last vs first)
//     const trend = values.length >= 2 
//       ? values[values.length - 1] > values[0] ? 'up' : 'down'
//       : 'neutral';

//     return { avg, min, max, trend, total };
//   }, [chartData]);

//   // Loading state
//   if (loading || isChartLoading) {
//     return (
//       <div className={`rounded-xl border p-8 text-center ${themeClasses.container}`}>
//         <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
//         <p className={themeClasses.subheading}>Loading chart...</p>
//       </div>
//     );
//   }

//   // Error state
//   if (chartError) {
//     return (
//       <div className={`rounded-xl border p-8 text-center ${themeClasses.container}`}>
//         <div className="text-red-500 text-2xl mb-4">⚠️</div>
//         <p className={themeClasses.heading}>Chart Error</p>
//         <p className={`text-sm mt-2 ${themeClasses.subheading}`}>{chartError}</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl border ${themeClasses.container}`}>
//       {/* Chart Header */}
//       <div className="p-4 border-b border-gray-700 dark:border-gray-600">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             {getChartIcon()}
//             <h3 className={`font-semibold ${themeClasses.heading}`}>
//               {title}
//             </h3>
//           </div>
          
//           {/* Stats Summary */}
//           <div className="hidden md:flex items-center gap-4">
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.subheading}`}>Average</p>
//               <p className={`font-medium ${themeClasses.heading}`}>
//                 {calculateStats.avg.toFixed(1)}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.subheading}`}>Min</p>
//               <p className={`font-medium ${themeClasses.heading}`}>
//                 {calculateStats.min}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.subheading}`}>Max</p>
//               <p className={`font-medium ${themeClasses.heading}`}>
//                 {calculateStats.max}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.subheading}`}>Trend</p>
//               <div className="flex items-center gap-1">
//                 {calculateStats.trend === 'up' ? (
//                   <>
//                     <FiTrendingUp className="text-green-500" size={14} />
//                     <span className="text-green-500 text-sm">Up</span>
//                   </>
//                 ) : calculateStats.trend === 'down' ? (
//                   <>
//                     <FiTrendingDown className="text-red-500" size={14} />
//                     <span className="text-red-500 text-sm">Down</span>
//                   </>
//                 ) : (
//                   <span className="text-gray-500 text-sm">Flat</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Chart Container */}
//       <div className="p-4">
//         <div style={{ height: `${height}px` }}>
//           <canvas ref={canvasRef} />
//         </div>
        
//         {/* Mobile Stats Summary */}
//         <div className="md:hidden mt-4 grid grid-cols-4 gap-2">
//           <div className="text-center p-2 rounded bg-gray-700 dark:bg-gray-700">
//             <p className={`text-xs ${themeClasses.subheading}`}>Avg</p>
//             <p className={`font-medium ${themeClasses.heading}`}>
//               {calculateStats.avg.toFixed(1)}
//             </p>
//           </div>
//           <div className="text-center p-2 rounded bg-gray-700 dark:bg-gray-700">
//             <p className={`text-xs ${themeClasses.subheading}`}>Min</p>
//             <p className={`font-medium ${themeClasses.heading}`}>
//               {calculateStats.min}
//             </p>
//           </div>
//           <div className="text-center p-2 rounded bg-gray-700 dark:bg-gray-700">
//             <p className={`text-xs ${themeClasses.subheading}`}>Max</p>
//             <p className={`font-medium ${themeClasses.heading}`}>
//               {calculateStats.max}
//             </p>
//           </div>
//           <div className={`text-center p-2 rounded ${
//             calculateStats.trend === 'up' ? 'bg-green-500/20' :
//             calculateStats.trend === 'down' ? 'bg-red-500/20' :
//             'bg-gray-700 dark:bg-gray-700'
//           }`}>
//             <p className={`text-xs ${themeClasses.subheading}`}>Trend</p>
//             <div className="flex items-center justify-center gap-1">
//               {calculateStats.trend === 'up' ? (
//                 <FiTrendingUp className="text-green-500" size={14} />
//               ) : calculateStats.trend === 'down' ? (
//                 <FiTrendingDown className="text-red-500" size={14} />
//               ) : (
//                 <span className="text-gray-500">—</span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Chart Legend */}
//       {chartData.datasets && chartData.datasets.length > 0 && (
//         <div className="p-3 border-t border-gray-700 dark:border-gray-600">
//           <div className="flex flex-wrap items-center gap-3">
//             {chartData.datasets.map((dataset, index) => (
//               <div key={index} className="flex items-center gap-2">
//                 <div 
//                   className="w-3 h-3 rounded"
//                   style={{ 
//                     backgroundColor: dataset.backgroundColor || 
//                     (theme === 'dark' ? '#3b82f6' : '#2563eb') 
//                   }}
//                 />
//                 <span className={`text-sm ${themeClasses.subheading}`}>
//                   {dataset.label}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AnalyticsChart;










// components/ClientManagement/AnalyticsChart.jsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiPieChart,
} from 'react-icons/fi';
import { FaSpinner, FaChartLine } from 'react-icons/fa';
import { getThemeClasses } from '../ServiceManagement/Shared/components'

const AnalyticsChart = ({
  data,
  type = 'line',
  title,
  height = 300,
  theme,
  loading = false
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const themeClasses = getThemeClasses(theme);

  // Process chart data with memoization
  const chartData = useMemo(() => {
    if (!data || !data.labels || !data.datasets) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sample Data',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
            backgroundColor: theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.1)',
            tension: 0.4
          }
        ]
      };
    }
    return data;
  }, [data, theme]);

  // Chart options with theme adaptation
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#d1d5db' : '#374151',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#ffffff' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
        borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            if (value >= 1000) return value/1000 + 'k';
            return value;
          }
        },
        beginAtZero: true
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  }), [theme]);

  // Initialize and update chart
  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const initChart = async () => {
      try {
        setIsChartLoading(true);
        setChartError(null);

        // Dynamic import for Chart.js to reduce bundle size
        const Chart = (await import('chart.js/auto')).default;

        // Destroy existing chart instance
        if (chartInstance.current) {
          chartInstance.current.destroy();
          chartInstance.current = null;
        }

        const ctx = canvasRef.current.getContext('2d');

        let chartType = type;
        if (type === 'pie' || type === 'doughnut') {
          // Ensure components are registered
          await import('chart.js');
        } else if (type === 'bar') {
          chartType = 'bar';
        } else {
          chartType = 'line';
        }

        chartInstance.current = new Chart(ctx, {
          type: chartType,
          data: chartData,
          options: chartOptions
        });
      } catch (err) {
        console.error('Chart initialization error:', err);
        setChartError('Failed to render chart.');
      } finally {
        setIsChartLoading(false);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartData, chartOptions, type, loading]);

  // Get appropriate icon for chart type
  const getChartIcon = () => {
    switch (type) {
      case 'bar': return <FiBarChart2 />;
      case 'pie': return <FiPieChart />;
      case 'line': return <FaChartLine />;
      default: return <FaChartLine />;
    }
  };

  // Calculate statistics with memoization
  const calculateStats = useMemo(() => {
    if (!chartData.datasets || chartData.datasets.length === 0) {
      return { avg: 0, min: 0, max: 0, trend: 'neutral', total: 0 };
    }
    const dataset = chartData.datasets[0];
    const values = dataset.data;

    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const trend = values.length >= 2
      ? values[values.length - 1] > values[0] ? 'up' : 'down'
      : 'neutral';

    return { avg, min, max, trend, total };
  }, [chartData]);

  // Loading state
  if (loading || isChartLoading) {
    return (
      <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
        <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
        <p className={themeClasses.text.secondary}>Loading chart...</p>
      </div>
    );
  }

  // Error state
  if (chartError) {
    return (
      <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
        <div className="text-red-500 text-2xl mb-4">⚠️</div>
        <p className={themeClasses.text.primary}>Chart Error</p>
        <p className={`text-sm mt-2 ${themeClasses.text.secondary}`}>{chartError}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${themeClasses.bg.card}`}>
      {/* Chart Header */}
      <div className={`p-4 border-b ${themeClasses.border.light}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <h3 className={`font-semibold ${themeClasses.text.primary}`}>
              {title}
            </h3>
          </div>
          {/* Stats Summary - Responsive: Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Average</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {calculateStats.avg.toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Min</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {calculateStats.min}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Max</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {calculateStats.max}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Trend</p>
              <div className="flex items-center gap-1">
                {calculateStats.trend === 'up' ? (
                  <>
                    <FiTrendingUp className="text-green-500" size={14} />
                    <span className="text-green-500 text-sm">Up</span>
                  </>
                ) : calculateStats.trend === 'down' ? (
                  <>
                    <FiTrendingDown className="text-red-500" size={14} />
                    <span className="text-red-500 text-sm">Down</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">Flat</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chart Container */}
      <div className="p-4">
        <div style={{ height: `${height}px`, position: 'relative' }}>
          <canvas ref={canvasRef} />
        </div>
        {/* Mobile Stats Summary */}
        <div className="md:hidden mt-4 grid grid-cols-4 gap-2">
          <div className={`text-center p-2 rounded ${themeClasses.bg.secondary}`}>
            <p className={`text-xs ${themeClasses.text.secondary}`}>Avg</p>
            <p className={`font-medium ${themeClasses.text.primary}`}>
              {calculateStats.avg.toFixed(1)}
            </p>
          </div>
          <div className={`text-center p-2 rounded ${themeClasses.bg.secondary}`}>
            <p className={`text-xs ${themeClasses.text.secondary}`}>Min</p>
            <p className={`font-medium ${themeClasses.text.primary}`}>
              {calculateStats.min}
            </p>
          </div>
          <div className={`text-center p-2 rounded ${themeClasses.bg.secondary}`}>
            <p className={`text-xs ${themeClasses.text.secondary}`}>Max</p>
            <p className={`font-medium ${themeClasses.text.primary}`}>
              {calculateStats.max}
            </p>
          </div>
          <div className={`text-center p-2 rounded ${
            calculateStats.trend === 'up' ? themeClasses.bg.success :
            calculateStats.trend === 'down' ? themeClasses.bg.danger :
            themeClasses.bg.secondary
          }`}>
            <p className={`text-xs ${themeClasses.text.secondary}`}>Trend</p>
            <div className="flex items-center justify-center gap-1">
              {calculateStats.trend === 'up' ? (
                <FiTrendingUp className="text-green-500" size={14} />
              ) : calculateStats.trend === 'down' ? (
                <FiTrendingDown className="text-red-500" size={14} />
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Chart Legend */}
      {chartData.datasets && chartData.datasets.length > 0 && (
        <div className={`p-3 border-t ${themeClasses.border.light}`}>
          <div className="flex flex-wrap items-center gap-3">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: dataset.backgroundColor ||
                      (theme === 'dark' ? '#3b82f6' : '#2563eb')
                  }}
                />
                <span className={`text-sm ${themeClasses.text.secondary}`}>
                  {dataset.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;