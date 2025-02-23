import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const FinancialBarChart = () => {

    
  // State for options and series
  const [options, setOptions] = useState({


    chart: {
      type: 'bar',
      stacked: true,
      height: 350,
    },
    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 
        'Jun', 'Jul', 'Aug', 'Sept', 
        'October', 'Nov', 'Dec',
      ], 
      title: {
        text: 'Months',
      },
    },
    yaxis: {
      title: {
        text: 'Amount (KES)',
      },
      labels: {
        formatter: (value) => `KES ${value.toLocaleString()}`, // Format values as currency
      },
    },
    dataLabels: {
        enabled: false,
        style: {
            fontSize: '12px',
            fontWeight: 'bold',
          },
      },
    plotOptions: {
        bar: {
          horizontal: false,
          dataLabels: {
            total: {
              enabled: false,
              offsetX: 0,
              style: {
                fontSize: '13px',
                fontWeight: 900
              }
            }
          }
        },
      },
    stroke: {
        width: 1,
        colors: ['#fff']
    },
    legend: {
      position: 'top', // Legend at the top
      horizontalAlign: 'left',
      offsetX: 40
    },
    tooltip: {
      y: {
        formatter: (value) => `KES ${value.toLocaleString()}`, // Tooltip currency formatting
      },
    },
  });

  const [series, setSeries] = useState([
    {
      name: 'Income',
      data: [20000, 22000, 25000, 27000, 30000, 32000, 35000, 37000, 40000, 42000, 45000, 47000],
      color:'#A20ACC'
    },
    {
      name: 'Profit',
      data: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000],
      color: '#34CC0A'
    },
    {
      name: 'Expenses',
      data: [3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500],
      color: '#F40B49'
    },
  ]);

  // Optional: If you want to dynamically update the data or options (for example, from an API or user interaction), you can use useEffect to update the state.

  return (

    <div>
        <h2 className="flex justify-center text-slate-500 font-semibold text-xl mb-4">
            Monthly Income, Profit & Expenses Overview
        </h2>
        <Chart 
            options={options} 
            series={series} 
            type="bar" 
            height={400} 
        />

    </div>
    
  );
};

export default FinancialBarChart;
