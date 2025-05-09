// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";

// const NewSubscriptionsChart = () => {
//   const [options, setOptions] = useState({
//     chart: { type: "line", height: 350, fontFamily: "Inter, sans-serif" },
//     xaxis: {
//       categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
//       title: { text: "Months", style: { fontSize: "14px", fontWeight: "600" } },
//     },
//     yaxis: {
//       title: { text: "New Subscriptions", style: { fontSize: "14px", fontWeight: "600" } },
//       labels: { formatter: (value) => `${Math.round(value)}` },
//     },
//     stroke: { curve: "smooth", width: 2 },
//     legend: { position: "top", fontSize: "12px" },
//     dataLabels: { enabled: false },
//     colors: ["#3B82F6"],
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for new subscriptions
//     const mockData = [
//       { month: "Jan", subscriptions: 50 },
//       { month: "Feb", subscriptions: 60 },
//       { month: "Mar", subscriptions: 70 },
//       { month: "Apr", subscriptions: 80 },
//       { month: "May", subscriptions: 90 },
//       { month: "Jun", subscriptions: 100 },
//       { month: "Jul", subscriptions: 110 },
//       { month: "Aug", subscriptions: 120 },
//       { month: "Sept", subscriptions: 130 },
//       { month: "Oct", subscriptions: 140 },
//       { month: "Nov", subscriptions: 150 },
//       { month: "Dec", subscriptions: 160 },
//     ];

//     setSeries([{ name: "New Subscriptions", data: mockData.map((item) => item.subscriptions) }]);
//     setLoading(false);
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">New Subscriptions Trend</h2>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="ml-2 text-gray-600 font-medium">Tracking New Subscriptions...</span>
//         </div>
//       ) : error ? (
//         <p className="text-center text-red-600 font-medium">{error}</p>
//       ) : (
//         <Chart options={options} series={series} type="line" height={400} />
//       )}
//     </div>
//   );
// };

// export default NewSubscriptionsChart;






// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";
// import { FiAlertTriangle } from "react-icons/fi";

// const NewSubscriptionsChart = () => {
//   const [options, setOptions] = useState({
//     chart: {
//       type: "line",
//       height: 350,
//       fontFamily: "Inter, sans-serif",
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
//       zoom: {
//         enabled: true,
//       },
//     },
//     stroke: {
//       curve: "smooth",
//       width: 3,
//     },
//     markers: {
//       size: 5,
//       strokeWidth: 0,
//       hover: {
//         size: 7,
//       },
//     },
//     xaxis: {
//       categories: [
//         "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
//         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//       ],
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
//     yaxis: {
//       labels: {
//         formatter: (value) => `${Math.round(value)}`,
//         style: {
//           fontSize: "12px",
//           fontWeight: 500,
//         },
//       },
//     },
//     grid: {
//       borderColor: "#f1f1f1",
//     },
//     tooltip: {
//       enabled: true,
//       x: {
//         show: true,
//         formatter: (value) => `${value} 2023`,
//       },
//     },
//     colors: ["#3B82F6"],
//     dataLabels: {
//       enabled: false,
//     },
//     legend: {
//       position: "top",
//       horizontalAlign: "right",
//       fontSize: "12px",
//       markers: {
//         radius: 12,
//       },
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
//           { month: "Jan", subscriptions: 50 },
//           { month: "Feb", subscriptions: 60 },
//           { month: "Mar", subscriptions: 70 },
//           { month: "Apr", subscriptions: 80 },
//           { month: "May", subscriptions: 90 },
//           { month: "Jun", subscriptions: 100 },
//           { month: "Jul", subscriptions: 110 },
//           { month: "Aug", subscriptions: 120 },
//           { month: "Sep", subscriptions: 130 },
//           { month: "Oct", subscriptions: 140 },
//           { month: "Nov", subscriptions: 150 },
//           { month: "Dec", subscriptions: 160 },
//         ];

//         setSeries([
//           { 
//             name: "New Subscriptions", 
//             data: mockData.map((item) => item.subscriptions) 
//           }
//         ]);
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load subscription data");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="h-full flex flex-col">
//       <div className="px-5 pt-5 pb-2 border-b border-gray-100">
//         <h3 className="text-lg font-medium text-gray-900">New Subscriptions Trend</h3>
//         <p className="mt-1 text-sm text-gray-500">Monthly growth of new customer subscriptions</p>
//       </div>
      
//       <div className="flex-1 p-5">
//         {loading ? (
//           <div className="h-full flex flex-col items-center justify-center">
//             <FaSpinner className="animate-spin text-3xl text-blue-600 mb-3" />
//             <p className="text-gray-600 font-medium">Loading subscription data...</p>
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
//             type="line" 
//             height="100%"
//             className="min-h-[350px]"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default NewSubscriptionsChart;







import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { FaSpinner } from "react-icons/fa";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

const NewSubscriptionsChart = () => {
  const [options, setOptions] = useState({
    chart: {
      type: "area",
      height: "100%",
      fontFamily: "Inter, sans-serif",
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
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      },
    },
    markers: {
      size: 5,
      strokeWidth: 0,
      hover: {
        size: 7,
      },
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
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
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => `${value}`,
        style: {
          fontSize: "12px",
          fontWeight: 500,
          colors: "#6B7280",
        },
      },
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
    tooltip: {
      enabled: true,
      x: {
        show: true,
        formatter: (value) => `${value} 2023`,
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      marker: {
        show: false,
      },
    },
    colors: ["#3B82F6"],
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: {
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
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
          { month: "Jan", subscriptions: 50 },
          { month: "Feb", subscriptions: 60 },
          { month: "Mar", subscriptions: 70 },
          { month: "Apr", subscriptions: 80 },
          { month: "May", subscriptions: 90 },
          { month: "Jun", subscriptions: 100 },
          { month: "Jul", subscriptions: 110 },
          { month: "Aug", subscriptions: 120 },
          { month: "Sep", subscriptions: 130 },
          { month: "Oct", subscriptions: 140 },
          { month: "Nov", subscriptions: 150 },
          { month: "Dec", subscriptions: 160 },
        ];

        setSeries([{ 
          name: "New Subscriptions", 
          data: mockData.map((item) => item.subscriptions) 
        }]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load subscription data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Subscription Growth</h3>
          <p className="mt-1 text-sm text-gray-500">Monthly new customer acquisition</p>
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
            <p className="text-gray-600 font-medium">Loading subscription data</p>
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
            type="area" 
            height="100%"
            width="100%"
          />
        )}
      </div>
    </div>
  );
};

export default NewSubscriptionsChart;