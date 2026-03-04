

// import React, { useMemo, useRef, useEffect, useState } from 'react';
// import {
//   TrendingUp, TrendingDown, BarChart3, PieChart,
//   LineChart, Download
// } from 'lucide-react';
// import { FaSpinner } from 'react-icons/fa';
// import { getThemeClasses } from '../ServiceManagement/Shared/components';

// // Dynamic import for Chart.js to reduce bundle size
// let Chart;
// if (typeof window !== 'undefined') {
//   import('chart.js/auto').then(module => {
//     Chart = module.default;
//   });
// }

// const AnalyticsChart = ({
//   data,
//   type = 'line',
//   title,
//   height = 300,
//   theme,
//   loading = false,
//   onExport
// }) => {
//   const canvasRef = useRef(null);
//   const chartInstance = useRef(null);
//   const [isChartLoading, setIsChartLoading] = useState(false);
//   const [chartError, setChartError] = useState(null);
//   const themeClasses = getThemeClasses(theme);

//   // Process chart data
//   const chartData = useMemo(() => {
//     if (!data || !data.labels || !data.datasets) {
//       // Return sample data for demonstration
//       return {
//         labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//         datasets: [
//           {
//             label: title || 'Data',
//             data: [65, 59, 80, 81, 56, 55],
//             borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
//             backgroundColor: theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.1)',
//             tension: 0.4,
//             fill: type === 'line'
//           }
//         ]
//       };
//     }
//     return data;
//   }, [data, theme, title, type]);

//   // Chart options
//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//         labels: {
//           color: theme === 'dark' ? '#d1d5db' : '#374151',
//           font: { size: 12 }
//         }
//       },
//       tooltip: {
//         backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
//         titleColor: theme === 'dark' ? '#ffffff' : '#111827',
//         bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
//         borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
//         borderWidth: 1
//       }
//     },
//     scales: type !== 'pie' && type !== 'doughnut' ? {
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
//             if (value >= 1000) return value/1000 + 'k';
//             return value;
//           }
//         },
//         beginAtZero: true
//       }
//     } : undefined
//   }), [theme, type]);

//   // Initialize chart
//   useEffect(() => {
//     if (!canvasRef.current || loading || !Chart) return;

//     const initChart = async () => {
//       try {
//         setIsChartLoading(true);
//         setChartError(null);

//         // Destroy existing chart
//         if (chartInstance.current) {
//           chartInstance.current.destroy();
//         }

//         const ctx = canvasRef.current.getContext('2d');
        
//         chartInstance.current = new Chart(ctx, {
//           type: type === 'pie' ? 'pie' : type === 'bar' ? 'bar' : 'line',
//           data: chartData,
//           options: chartOptions
//         });
//       } catch (err) {
//         console.error('Chart initialization error:', err);
//         setChartError('Failed to render chart');
//       } finally {
//         setIsChartLoading(false);
//       }
//     };

//     initChart();

//     return () => {
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//       }
//     };
//   }, [chartData, chartOptions, type, loading]);

//   // Calculate statistics
//   const stats = useMemo(() => {
//     if (!chartData.datasets || chartData.datasets.length === 0) {
//       return { avg: 0, min: 0, max: 0, total: 0 };
//     }
    
//     const dataset = chartData.datasets[0];
//     const values = dataset.data.filter(v => v !== null && v !== undefined);
    
//     if (values.length === 0) return { avg: 0, min: 0, max: 0, total: 0 };
    
//     const total = values.reduce((a, b) => a + b, 0);
//     const avg = total / values.length;
//     const min = Math.min(...values);
//     const max = Math.max(...values);
    
//     return { avg, min, max, total };
//   }, [chartData]);

//   // Get chart icon
//   const getChartIcon = () => {
//     switch (type) {
//       case 'bar': return <BarChart3 size={18} />;
//       case 'pie': return <PieChart size={18} />;
//       case 'line': return <LineChart size={18} />;
//       default: return <LineChart size={18} />;
//     }
//   };

//   // Loading state
//   if (loading || isChartLoading) {
//     return (
//       <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
//         <FaSpinner className="animate-spin text-2xl mx-auto mb-4 text-blue-500" />
//         <p className={themeClasses.text.secondary}>Loading chart...</p>
//       </div>
//     );
//   }

//   // Error state
//   if (chartError) {
//     return (
//       <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
//         <div className="text-red-500 text-2xl mb-4">⚠️</div>
//         <p className={themeClasses.text.primary}>Chart Error</p>
//         <p className={`text-sm mt-2 ${themeClasses.text.secondary}`}>{chartError}</p>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl border ${themeClasses.bg.card}`}>
//       {/* Header */}
//       <div className={`p-4 border-b ${themeClasses.border.light}`}>
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div className="flex items-center gap-2">
//             {getChartIcon()}
//             <h3 className={`font-semibold ${themeClasses.text.primary}`}>
//               {title || 'Chart'}
//             </h3>
//           </div>
          
//           {/* Stats Summary */}
//           <div className="flex items-center gap-4">
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.text.secondary}`}>Avg</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {stats.avg.toFixed(1)}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.text.secondary}`}>Min</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {stats.min}
//               </p>
//             </div>
//             <div className="text-center">
//               <p className={`text-xs ${themeClasses.text.secondary}`}>Max</p>
//               <p className={`font-medium ${themeClasses.text.primary}`}>
//                 {stats.max}
//               </p>
//             </div>
//             {onExport && (
//               <button
//                 onClick={onExport}
//                 className={`p-2 rounded ${themeClasses.button.secondary}`}
//                 title="Export chart data"
//               >
//                 <Download size={16} />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Chart Container */}
//       <div className="p-4">
//         <div style={{ height: `${height}px`, position: 'relative' }}>
//           <canvas ref={canvasRef} />
//         </div>
//       </div>

//       {/* Legend */}
//       {chartData.datasets && chartData.datasets.length > 1 && (
//         <div className={`p-3 border-t ${themeClasses.border.light}`}>
//           <div className="flex flex-wrap items-center gap-3">
//             {chartData.datasets.map((dataset, index) => (
//               <div key={index} className="flex items-center gap-2">
//                 <div
//                   className="w-3 h-3 rounded"
//                   style={{
//                     backgroundColor: dataset.borderColor || dataset.backgroundColor ||
//                       (theme === 'dark' ? '#3b82f6' : '#2563eb')
//                   }}
//                 />
//                 <span className={`text-sm ${themeClasses.text.secondary}`}>
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








import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart,
  LineChart, Download
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { getThemeClasses } from '../ServiceManagement/Shared/components';

let Chart;
if (typeof window !== 'undefined') {
  import('chart.js/auto').then(module => {
    Chart = module.default;
  });
}

const AnalyticsChart = ({
  data,
  type = 'line',
  title,
  height = 300,
  theme,
  loading = false,
  onExport
}) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const themeClasses = getThemeClasses(theme);

  // Process chart data - handle both formats
  const chartData = useMemo(() => {
    if (!data) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Handle different data formats
    if (data.labels && data.datasets) {
      return data;
    }

    // Handle array format for pie charts
    if (Array.isArray(data) && type === 'pie') {
      return {
        labels: data.map(item => item.label || item.name || 'Unknown'),
        datasets: [{
          data: data.map(item => item.value || item.count || 0),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
        }]
      };
    }

    // Handle array format for line/bar charts
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.date || firstItem.period) {
        return {
          labels: data.map(item => item.date || item.period || ''),
          datasets: [{
            label: title || 'Value',
            data: data.map(item => item.value || item.count || item.revenue || 0),
            borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
            backgroundColor: theme === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.1)',
            tension: 0.4,
            fill: type === 'line'
          }]
        };
      }
    }

    return data;
  }, [data, theme, title, type]);

  // Chart options
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
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== undefined) {
              label += new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(context.parsed.y);
            } else if (context.parsed !== undefined) {
              label += new Intl.NumberFormat('en-KE').format(context.parsed);
            }
            return label;
          }
        }
      }
    },
    scales: type !== 'pie' && type !== 'doughnut' ? {
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
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          }
        },
        beginAtZero: true
      }
    } : undefined
  }), [theme, type]);

  // Initialize chart
  useEffect(() => {
    if (!canvasRef.current || loading || !Chart || !chartData.labels || chartData.labels.length === 0) return;

    const initChart = async () => {
      try {
        setIsChartLoading(true);
        setChartError(null);

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        
        chartInstance.current = new Chart(ctx, {
          type: type === 'pie' ? 'pie' : type === 'bar' ? 'bar' : 'line',
          data: chartData,
          options: chartOptions
        });
      } catch (err) {
        console.error('Chart initialization error:', err);
        setChartError('Failed to render chart');
      } finally {
        setIsChartLoading(false);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, chartOptions, type, loading]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!chartData.datasets || chartData.datasets.length === 0) {
      return { avg: 0, min: 0, max: 0, total: 0 };
    }
    
    const dataset = chartData.datasets[0];
    const values = dataset.data.filter(v => v !== null && v !== undefined);
    
    if (values.length === 0) return { avg: 0, min: 0, max: 0, total: 0 };
    
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, total };
  }, [chartData]);

  // Get chart icon
  const getChartIcon = () => {
    switch (type) {
      case 'bar': return <BarChart3 size={18} />;
      case 'pie': return <PieChart size={18} />;
      case 'line': return <LineChart size={18} />;
      default: return <LineChart size={18} />;
    }
  };

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

  // No data state
  if (!chartData.labels || chartData.labels.length === 0) {
    return (
      <div className={`rounded-xl border p-8 text-center ${themeClasses.bg.card}`}>
        <BarChart3 size={32} className="mx-auto mb-4 opacity-50" />
        <p className={themeClasses.text.primary}>No Data Available</p>
        <p className={`text-sm mt-2 ${themeClasses.text.secondary}`}>No chart data to display</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${themeClasses.bg.card}`}>
      <div className={`p-4 border-b ${themeClasses.border.light}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <h3 className={`font-semibold ${themeClasses.text.primary}`}>
              {title || 'Chart'}
            </h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Avg</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {stats.avg >= 1000 ? (stats.avg / 1000).toFixed(1) + 'K' : stats.avg.toFixed(1)}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Min</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {stats.min >= 1000 ? (stats.min / 1000).toFixed(1) + 'K' : stats.min}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${themeClasses.text.secondary}`}>Max</p>
              <p className={`font-medium ${themeClasses.text.primary}`}>
                {stats.max >= 1000 ? (stats.max / 1000).toFixed(1) + 'K' : stats.max}
              </p>
            </div>
            {onExport && (
              <button
                onClick={onExport}
                className={`p-2 rounded ${themeClasses.button.secondary}`}
                title="Export chart data"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div style={{ height: `${height}px`, position: 'relative' }}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {chartData.datasets && chartData.datasets.length > 1 && (
        <div className={`p-3 border-t ${themeClasses.border.light}`}>
          <div className="flex flex-wrap items-center gap-3">
            {chartData.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: dataset.borderColor || dataset.backgroundColor ||
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