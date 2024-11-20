import React, { useState } from 'react';
import Chart from 'react-apexcharts';

const UsageReports = () => {
  // Simulated data for usage, activity, and performance over time (e.g., monthly data)
  const [data, setData] = useState({
    dataUsage: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      used: [100, 150, 200, 220, 300, 350, 400], // GB used over the months
      remaining: [400, 350, 300, 280, 200, 150, 100], // GB remaining over the months
    },
    stackedAreaData: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      activeUsers: [150, 180, 200, 220, 250, 270, 290], // Active users count over the months
      inactiveUsers: [30, 25, 20, 15, 10, 5, 0], // Inactive users count over the months
    },
    comboChartData: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      usage: [100, 150, 200, 220, 300, 350, 400], // Data usage over the months (Line chart)
      performance: [5, 10, 15, 20, 25, 30, 35], // Network performance (Bar chart)
    },
  });

  // Donut Chart for Data Usage (Used vs Remaining Data)
  const donutChartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Used Data', 'Remaining Data'],
    title: {
      text: 'Data Usage Breakdown',
      align: 'center',
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} GB`,
      },
    },
  };

  const donutChartSeries = [
    data.dataUsage.used[data.dataUsage.used.length - 1], // Last month's used data
    data.dataUsage.remaining[data.dataUsage.remaining.length - 1], // Last month's remaining data
  ];

  // Stacked Area Chart for Data Usage & User Activity
  const stackedAreaChartOptions = {
    chart: {
      type: 'area',
      stacked: true,
      height: 350,
    },
    title: {
      text: 'User Activity and Data Usage',
      align: 'center',
    },
    xaxis: {
      categories: data.stackedAreaData.months,
    },
    yaxis: {
      title: {
        text: 'Users/Usage',
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    dataLabels: {
      enabled: true,
      style: {
          fontSize: '8px',
          fontWeight: 'bold',
        },
    },
    colors: ['#00E396', '#FF4560'], 
  };

  const stackedAreaChartSeries = [
    {
      name: 'Active Users',
      data: data.stackedAreaData.activeUsers,
    },
    {
      name: 'Inactive Users',
      data: data.stackedAreaData.inactiveUsers,
    },
  ];

  // Combo Mixed Line and Bar Chart for Data Usage & Network Performance
  const comboChartOptions = {
    chart: {
      height: 350,
      type: 'line',
    },
    title: {
      text: 'Data Usage & Network Performance',
      align: 'center',
    },
    xaxis: {
      categories: data.comboChartData.months,
    },
    stroke: {
      width: [3, 0], // Line for usage, no line for performance
    },
    yaxis: [
      {
        title: {
          text: 'Data Usage (GB)',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Network Performance',
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    },
    series: [
      {
        name: 'Data Usage (GB)',
        type: 'line',
        data: data.comboChartData.usage,
      },
      {
        name: 'Network Performance',
        type: 'bar',
        data: data.comboChartData.performance,
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Usage Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="bg-white shadow-md rounded-lg p-6 col-span-1 sm:col-span-1 lg:col-span-1">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Data Usage Breakdown</h2>
          <Chart
            options={donutChartOptions}
            series={donutChartSeries}
            type="donut"
            width="100%"
            height={350}
          />
        </div>

        {/* Stacked Area Chart */}
        <div className="bg-white shadow-md rounded-lg p-6 col-span-1 sm:col-span-2 lg:col-span-2">
          <h2 className="text-xl font-medium text-gray-700 mb-4">User Activity and Data Usage</h2>
          <Chart
            options={stackedAreaChartOptions}
            series={stackedAreaChartSeries}
            type="area"
            width="100%"
            height={350}
          />
        </div>

        {/* Combo Mixed Line and Bar Chart */}
        <div className="bg-white shadow-md rounded-lg p-6 col-span-1 sm:col-span-2 lg:col-span-2">
          <h2 className="text-xl font-medium text-gray-700 mb-4">Data Usage & Network Performance</h2>
          <Chart
            options={comboChartOptions}
            series={comboChartOptions.series}
            type="line"
            width="100%"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default UsageReports;
