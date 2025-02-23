import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const PlanAnalytics = () => {
  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    plans: ["Basic", "Plus", "Premium"],
    sales: [150, 230, 120], // Total sales per plan
    activeUsers: [100, 200, 90], // Active users per plan
    bandwidthUsage: [20, 45, 30], // Average bandwidth in Mbps
    uptime: [99.5, 99.8, 99.2], // Uptime in percentage
    userFeedback: {
      Basic: { positive: 70, neutral: 20, negative: 10 },
      Plus: { positive: 150, neutral: 50, negative: 30 },
      Premium: { positive: 90, neutral: 20, negative: 10 },
    },
  });

  // Backend integration for dynamic data
  useEffect(() => {
    // Example API call to fetch analytics
    // fetch("/api/plan-analytics")
    //   .then((res) => res.json())
    //   .then((data) => setAnalyticsData(data));
  }, []);

  // Bar chart: Sales vs Active Users
  const barChartOptions = {
    chart: { type: "bar", toolbar: { show: true } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "50%" },
    },
    xaxis: { categories: analyticsData.plans },
    yaxis: { title: { text: "Counts" } },
    legend: { position: "top" },
    colors: ["#1E90FF", "#32CD32"],
  };

  const barChartSeries = [
    { name: "Sales", data: analyticsData.sales },
    { name: "Active Users", data: analyticsData.activeUsers },
  ];

  // Line chart: Bandwidth and Uptime
  const lineChartOptions = {
    chart: { type: "line", toolbar: { show: true } },
    xaxis: { categories: analyticsData.plans },
    yaxis: [
      { title: { text: "Bandwidth (Mbps)" }, min: 0 },
      { opposite: true, title: { text: "Uptime (%)" }, min: 90, max: 100 },
    ],
    colors: ["#FF6347", "#FFD700"],
  };

  const lineChartSeries = [
    { name: "Bandwidth Usage", data: analyticsData.bandwidthUsage },
    { name: "Uptime", data: analyticsData.uptime },
  ];

  // Pie chart: User Feedback
  const feedbackPieCharts = analyticsData.plans.map((plan) => ({
    options: {
      chart: { type: "pie" },
      labels: ["Positive", "Neutral", "Negative"],
      colors: ["#32CD32", "#FFA500", "#FF4500"],
    },
    series: Object.values(analyticsData.userFeedback[plan]),
    title: plan,
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Plan Analytics</h1>

      {/* Sales vs Active Users */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Plan Popularity</h2>
        <Chart
          options={barChartOptions}
          series={barChartSeries}
          type="bar"
          height={350}
        />
      </div>

      {/* Bandwidth and Uptime */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Network Performance</h2>
        <Chart
          options={lineChartOptions}
          series={lineChartSeries}
          type="line"
          height={350}
        />
      </div>

      {/* User Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {feedbackPieCharts.map((chart, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              User Feedback - {chart.title} Plan
            </h2>
            <Chart
              options={chart.options}
              series={chart.series}
              type="pie"
              height={350}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanAnalytics;
