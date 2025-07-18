
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { FaSpinner } from "react-icons/fa";

function SalesChart() {
  const [options, setOptions] = useState({
    chart: { id: "basic-bar", fontFamily: "Inter, sans-serif", height: "100%" },
    xaxis: {
      type: "category",
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
    },
    yaxis: { title: { text: "Number of Users", style: { fontSize: "14px", fontWeight: "600" } } },
    plotOptions: { bar: { columnWidth: "80%", endingShape: "rounded" } },
    strike: { show: true, width: 1, colors: ["transparent"] },
    legend: { show: true, position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: false },
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
  });

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock data for sales
    const mockData = [
      { plan: "basic", sales: 100 },
      { plan: "basic", sales: 120 },
      { plan: "basic", sales: 130 },
      { plan: "basic", sales: 140 },
      { plan: "basic", sales: 150 },
      { plan: "basic", sales: 160 },
      { plan: "basic", sales: 170 },
      { plan: "basic", sales: 180 },
      { plan: "basic", sales: 190 },
      { plan: "basic", sales: 200 },
      { plan: "basic", sales: 210 },
      { plan: "basic", sales: 220 },
      { plan: "plus", sales: 50 },
      { plan: "plus", sales: 60 },
      { plan: "plus", sales: 70 },
      { plan: "plus", sales: 80 },
      { plan: "plus", sales: 90 },
      { plan: "plus", sales: 100 },
      { plan: "plus", sales: 110 },
      { plan: "plus", sales: 120 },
      { plan: "plus", sales: 130 },
      { plan: "plus", sales: 140 },
      { plan: "plus", sales: 150 },
      { plan: "plus", sales: 160 },
      { plan: "premium", sales: 20 },
      { plan: "premium", sales: 25 },
      { plan: "premium", sales: 30 },
      { plan: "premium", sales: 35 },
      { plan: "premium", sales: 40 },
      { plan: "premium", sales: 45 },
      { plan: "premium", sales: 50 },
      { plan: "premium", sales: 55 },
      { plan: "premium", sales: 60 },
      { plan: "premium", sales: 65 },
      { plan: "premium", sales: 70 },
      { plan: "premium", sales: 75 },
    ];

    const basicData = mockData.filter((item) => item.plan === "basic").map((item) => item.sales);
    const plusData = mockData.filter((item) => item.plan === "plus").map((item) => item.sales);
    const premiumData = mockData.filter((item) => item.plan === "premium").map((item) => item.sales);

    setSeries([
      { name: "Basic Plan", data: basicData },
      { name: "Plus Plan", data: plusData },
      { name: "Premium Plan", data: premiumData },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Monthly Sales Overview</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
          <span className="ml-2 text-gray-600 font-medium">Analyzing Sales Data...</span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600 font-medium">{error}</p>
      ) : (
        <Chart options={options} series={series} type="bar" height="400" />
      )}
    </div>
  );
}

export default SalesChart;