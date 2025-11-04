// src/Pages/NetworkManagement/components/Monitoring/PerformanceMetrics.jsx
import React from "react";
import { TrendingUp, TrendingDown, Minus, Cpu, HardDrive, Network, Users } from "lucide-react";

const PerformanceMetrics = ({ 
  routerStats, 
  theme 
}) => {
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { direction: 'neutral', value: '0%' };
    
    const change = ((current - previous) / previous) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return {
      direction,
      value: `${Math.abs(change).toFixed(1)}%`,
      icon: direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
             direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
             <Minus className="w-4 h-4" />
    };
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Mock historical data - in real app, this would come from API
  const historicalData = {
    cpu: [45, 52, 48, 55, 60, 58, 65],
    memory: [60, 62, 65, 68, 70, 72, 75],
    clients: [25, 28, 30, 32, 35, 38, 40],
    throughput: [85, 90, 95, 100, 105, 110, 115]
  };

  const currentStats = routerStats?.latest || {};
  const previousStats = {
    cpu: historicalData.cpu[historicalData.cpu.length - 2] || 0,
    memory: historicalData.memory[historicalData.memory.length - 2] || 0,
    clients: historicalData.clients[historicalData.clients.length - 2] || 0,
    throughput: historicalData.throughput[historicalData.throughput.length - 2] || 0
  };

  const metrics = [
    {
      name: "CPU Usage",
      current: currentStats.cpu || 0,
      previous: previousStats.cpu,
      icon: <Cpu className="w-5 h-5" />,
      color: "blue"
    },
    {
      name: "Memory Usage",
      current: currentStats.memory || 0,
      previous: previousStats.memory,
      icon: <HardDrive className="w-5 h-5" />,
      color: "purple"
    },
    {
      name: "Connected Clients",
      current: currentStats.clients || 0,
      previous: previousStats.clients,
      icon: <Users className="w-5 h-5" />,
      color: "green"
    },
    {
      name: "Throughput",
      current: currentStats.throughput || 0,
      previous: previousStats.throughput,
      icon: <Network className="w-5 h-5" />,
      color: "orange",
      unit: "Mbps"
    }
  ];

  return (
    <div className={`p-6 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${
      theme === "dark" 
        ? "bg-gray-800/80 border border-gray-700" 
        : "bg-white/80 border border-gray-200"
    }`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2" />
        Performance Trends
      </h3>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const trend = calculateTrend(metric.current, metric.previous);
          
          return (
            <div key={index} className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    metric.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    metric.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                    metric.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{metric.name}</p>
                    <p className="text-2xl font-bold">
                      {metric.current}{metric.unit ? ` ${metric.unit}` : '%'}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(trend.direction)}`}>
                  {trend.icon}
                  <span className="text-sm font-medium">{trend.value}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metric.color === 'blue' ? 'bg-blue-500' :
                    metric.color === 'purple' ? 'bg-purple-500' :
                    metric.color === 'green' ? 'bg-green-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(metric.current, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className={`mt-4 p-3 rounded-lg ${
        theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
      }`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Overall Performance</span>
          <span className={`font-medium ${
            metrics.every(m => m.current < 80) ? 'text-green-500' :
            metrics.some(m => m.current >= 90) ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {metrics.every(m => m.current < 80) ? 'Excellent' :
             metrics.some(m => m.current >= 90) ? 'Critical' : 'Good'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;