import React, { useState } from 'react';
import Chart from 'react-apexcharts';

function RevenueChart() {

  const [options, setOptions] = useState({
    chart: {
      id: 'Spline Area',
      height: '100%',
      type: 'area',
      
    },
    dataLabels: {
      enabled: false,
      style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
      dashArray: [0, 5]
    },
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
         "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
        ],
    },

    yaxis: {
      title: {
        text: 'Revenue (KES)',
        style: {
          fontSize: '15px',
          fontWeight: 'bold',
        },
      },
      labels: {
        formatter: value => `KES ${value.toLocaleString()}`,
      }
    },

    tooltip: {
      shared: true,
      y: {
        formatter: value => `KES ${value.toLocaleString()}`
      }
    },
    

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    },
    // markers: {
    //   size: [1, 1]
    // },
    
    legend: {
      position: 'bottom'
    }

    

       
  })

  const [series, setSeries] = useState([

    {
      name: 'Targeted Revenue',
      data: [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500]
    },
    {
      name: 'Projected Revenue',
      data: [1800, 2300, 3200, 3300, 3800, 4200, 4800, 5200, 5700, 6200, 6800, 7400]
    },


  ])

  return (
    <div>
       <h2 className='flex justify-center text-slate-500 font-semibold'> Total Revenue</h2>
            <Chart 
                options={options}
                series={series}
                type='area'
               
            />

    </div>
  )

}
export default RevenueChart

