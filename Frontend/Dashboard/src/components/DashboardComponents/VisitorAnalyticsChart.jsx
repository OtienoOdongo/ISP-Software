// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { FaSpinner } from "react-icons/fa";

// const VisitorAnalyticsChart = () => {
//   const [options, setOptions] = useState({
//     chart: { id: "simple-donut", type: "donut", width: "80%", fontFamily: "Inter, sans-serif" },
//     labels: ["Basic Plan", "Plus Plan", "Premium Plan"],
//     plotOptions: { pie: { donut: { size: "80%" } } },
//     legend: { position: "bottom", fontSize: "12px" },
//     colors: ["#3B82F6", "#10B981", "#F59E0B"],
//   });

//   const [series, setSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Mock data for visitor analytics
//     const mockData = [
//       { plan: "Basic Plan", visitors: 500 },
//       { plan: "Plus Plan", visitors: 300 },
//       { plan: "Premium Plan", visitors: 200 },
//     ];

//     const total = mockData.reduce((sum, item) => sum + item.visitors, 0);
//     const percentages = mockData.map((item) => (total > 0 ? (item.visitors / total) * 100 : 0));
//     setSeries(percentages);
//     setLoading(false);
//   }, []);

//   return (
//     <div>
//       <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Plan Popularity</h2>
//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <FaSpinner className="animate-spin text-3xl text-blue-600" />
//           <span className="ml-2 text-gray-600 font-medium">Gathering Visitor Insights...</span>
//         </div>
//       ) : error ? (
//         <p className="text-center text-red-600 font-medium">{error}</p>
//       ) : (
//         <Chart options={options} series={series} type="donut" height={350} />
//       )}
//     </div>
//   );
// };

// export default VisitorAnalyticsChart;








import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

const VisitorAnalyticsChart = ({ data }) => {
  const options = {
    chart: { id: "simple-donut", type: "donut", width: "80%", fontFamily: "Inter, sans-serif" },
    labels: Object.keys(data),
    plotOptions: { pie: { donut: { size: "80%" } } },
    legend: { position: "bottom", fontSize: "12px" },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
  };

  const series = Object.values(data);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Plan Popularity</h2>
      <Chart options={options} series={series} type="donut" height={350} />
    </div>
  );
};

VisitorAnalyticsChart.propTypes = {
  data: PropTypes.objectOf(PropTypes.number).isRequired,
};

export default VisitorAnalyticsChart;