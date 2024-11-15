import React from 'react';
import Chart from 'react-apexcharts';

const VisitorAnalyticsChart = () => {

  const options = {
    chart: {
      id:'simple-donut',
      type: 'donut',
      width: '80%',
    },
    labels: ['Basic Plan', 'Plus Plan', 'Premium Plan'], 
    // responsive: [
    //   {
    //     breakpoint: 480,
    //     options: {
    //       chart: {
    //         width: 200,
    //       },
    //       legend: {
    //         position: 'bottom',
    //       },
    //     },
    //   },
    // ],
    plotOptions: {
      pie: {
        donut: {
          size: '80%', 
        },
      },
    },

    legend: {
      postion: 'bottom',
    },

    


  };
 

  const series = [35, 45, 20]; // Your chart data

  return (
    <div>
      <h2 className="flex justify-center text-slate-500 font-semibold">Most Popular Plan</h2>
      <Chart 
        options={options} 
        series={series} 
        type="donut" 
        height={350} 
      />
    </div>
  );
};

export default VisitorAnalyticsChart;
