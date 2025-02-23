import React from 'react'
import RevenueChart from "../../components/RevenueChart.jsx";
import FinancialBarChart from "../../components/FinancialBarChart.jsx";

const FinancialReports = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <RevenueChart />
      </div>

      {/* Financial Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <FinancialBarChart />
      </div>
    </div>
  );
}

export default FinancialReports;
