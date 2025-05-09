// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";

// const PlanPerformanceChart = () => {
//   const [options, setOptions] = useState({
//     chart: { type: "bar", height: 350, fontFamily: "Inter, sans-serif" },
//     xaxis: {
//       categories: ["Basic Plan", "Plus Plan", "Premium Plan"],
//       title: { text: "Plans", style: { fontSize: "14px", fontWeight: "600" } },
//     },
//     yaxis: [
//       {
//         title: { text: "Users", style: { fontSize: "14px", fontWeight: "600" } },
//         labels: { formatter: (value) => `${Math.round(value)}` },
//       },
//       {
//         opposite: true,
//         title: { text: "Revenue (KES)", style: { fontSize: "14px", fontWeight: "600" } },
//         labels: { formatter: (value) => `KES ${value.toLocaleString()}` },
//       },
//     ],
//     plotOptions: { bar: { horizontal: false, columnWidth: "45%" } },
//     stroke: { width: 1, colors: ["#fff"] },
//     legend: { position: "top", fontSize: "12px" },
//     dataLabels: { enabled: false },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for plan performance
//     const mockData = [
//       { plan: "Basic Plan", users: 500, revenue: 500000, avg_data_usage: 10 },
//       { plan: "Plus Plan", users: 300, revenue: 600000, avg_data_usage: 20 },
//       { plan: "Premium Plan", users: 100, revenue: 400000, avg_data_usage: 50 },
//     ];

//     setSeries([
//       { name: "Users", data: mockData.map((item) => item.users) },
//       { name: "Revenue", data: mockData.map((item) => item.revenue) },
//       { name: "Avg. Data Usage (GB)", data: mockData.map((item) => item.avg_data_usage) },
//     ]);
//     setLoading(false);
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Plan Performance Breakdown</h2>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="ml-2 text-gray-600 font-medium">Analyzing Plan Performance...</span>
//         </div>
//       ) : error ? (
//         <p className="text-center text-red-600 font-medium">{error}</p>
//       ) : (
//         <Chart options={options} series={series} type="bar" height={400} />
//       )}
//     </div>
//   );
// };

// export default PlanPerformanceChart;





// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";
// import { FiAlertTriangle } from "react-icons/fi";

// const PlanPerformanceChart = () => {
//   const [options, setOptions] = useState({
//     chart: {
//       type: "bar",
//       height: 350,
//       fontFamily: "Inter, sans-serif",
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
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: "55%",
//         borderRadius: 4,
//         borderRadiusApplication: "end",
//       },
//     },
//     stroke: {
//       width: 1,
//       colors: ["#fff"],
//     },
//     xaxis: {
//       categories: ["Basic Plan", "Plus Plan", "Premium Plan"],
//       labels: {
//         style: {
//           fontSize: "12px",
//           fontWeight: 500,
//         },
//       },
//       axisBorder: {
//         show: false,
//       },
//       axisTicks: {
//         show: false,
//       },
//     },
//     yaxis: [
//       {
//         seriesName: "Users",
//         title: {
//           text: "Users",
//           style: {
//             fontSize: "12px",
//             fontWeight: 600,
//           },
//         },
//         labels: {
//           formatter: (value) => `${Math.round(value)}`,
//           style: {
//             fontSize: "12px",
//             fontWeight: 500,
//           },
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
//           },
//         },
//         labels: {
//           formatter: (value) => `KES ${value.toLocaleString()}`,
//           style: {
//             fontSize: "12px",
//             fontWeight: 500,
//           },
//         },
//       },
//     ],
//     tooltip: {
//       shared: true,
//       intersect: false,
//       y: {
//         formatter: function (value, { seriesIndex }) {
//           return seriesIndex === 1 
//             ? `KES ${value.toLocaleString()}` 
//             : `${Math.round(value)}`;
//         },
//       },
//     },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//     legend: {
//       position: "top",
//       horizontalAlign: "right",
//       fontSize: "12px",
//       markers: {
//         radius: 12,
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     grid: {
//       borderColor: "#f1f1f1",
//     },
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Simulate API call with delay
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         const mockData = [
//           { plan: "Basic Plan", users: 500, revenue: 500000, avg_data_usage: 10 },
//           { plan: "Plus Plan", users: 300, revenue: 600000, avg_data_usage: 20 },
//           { plan: "Premium Plan", users: 100, revenue: 400000, avg_data_usage: 50 },
//         ];

//         setSeries([
//           { name: "Users", data: mockData.map((item) => item.users) },
//           { name: "Revenue (KES)", data: mockData.map((item) => item.revenue) },
//           { name: "Avg. Data Usage (GB)", data: mockData.map((item) => item.avg_data_usage) },
//         ]);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load plan performance data");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="h-full flex flex-col">
//       <div className="px-5 pt-5 pb-2 border-b border-gray-100">
//         <h3 className="text-lg font-medium text-gray-900">Plan Performance</h3>
//         <p className="mt-1 text-sm text-gray-500">Comparison of user count, revenue and data usage by plan</p>
//       </div>
      
//       <div className="flex-1 p-5">
//         {loading ? (
//           <div className="h-full flex flex-col items-center justify-center">
//             <FaSpinner className="animate-spin text-3xl text-blue-600 mb-3" />
//             <p className="text-gray-600 font-medium">Analyzing plan performance...</p>
//             <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
//           </div>
//         ) : error ? (
//           <div className="h-full flex flex-col items-center justify-center text-center p-6">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
//               <FiAlertTriangle className="h-6 w-6 text-red-600" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900">Data load error</h3>
//             <p className="mt-2 text-sm text-gray-500">{error}</p>
//           </div>
//         ) : (
//           <Chart 
//             options={options} 
//             series={series} 
//             type="bar" 
//             height="100%"
//             className="min-h-[350px]"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default PlanPerformanceChart;








import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { FaSpinner } from "react-icons/fa";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

const PlanPerformanceChart = () => {
  const [options, setOptions] = useState({
    chart: {
      type: "bar",
      height: "100%",
      fontFamily: "Inter, sans-serif",
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 6,
        borderRadiusApplication: 'end',
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: ["Basic Plan", "Plus Plan", "Premium Plan"],
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 500,
          colors: "#6B7280",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        seriesName: "Users",
        title: {
          text: "Users",
          style: {
            fontSize: "12px",
            fontWeight: 600,
            color: "#6B7280",
          },
        },
        labels: {
          formatter: (value) => `${Math.round(value)}`,
          style: {
            fontSize: "12px",
            fontWeight: 500,
            colors: "#6B7280",
          },
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
            color: "#6B7280",
          },
        },
        labels: {
          formatter: (value) => `KES ${value.toLocaleString()}`,
          style: {
            fontSize: "12px",
            fontWeight: 500,
            colors: "#6B7280",
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (value, { seriesIndex }) {
          return seriesIndex === 1 
            ? `KES ${value.toLocaleString()}` 
            : `${Math.round(value)}`;
        },
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
    },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: {
        radius: 8,
        width: 8,
        height: 8,
      },
      itemMargin: {
        horizontal: 12,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#F3F4F6",
      strokeDashArray: 4,
      padding: {
        top: 20,
        right: 20,
        bottom: 0,
        left: 20
      },  
    },
  });

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData = [
          { plan: "Basic Plan", users: 500, revenue: 500000, avg_data_usage: 10 },
          { plan: "Plus Plan", users: 300, revenue: 600000, avg_data_usage: 20 },
          { plan: "Premium Plan", users: 100, revenue: 400000, avg_data_usage: 50 },
        ];

        setSeries([
          { name: "Users", data: mockData.map((item) => item.users) },
          { name: "Revenue (KES)", data: mockData.map((item) => item.revenue) },
          { name: "Avg. Data Usage (GB)", data: mockData.map((item) => item.avg_data_usage) },
        ]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load plan performance data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Plan Performance</h3>
          <p className="mt-1 text-sm text-gray-500">Comparison by users, revenue and data usage</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh data"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 p-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3">
            <FaSpinner className="animate-spin text-3xl text-blue-600" />
            <p className="text-gray-600 font-medium">Analyzing plan performance</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Data Error</h3>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <Chart 
            options={options} 
            series={series} 
            type="bar" 
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

export default PlanPerformanceChart;