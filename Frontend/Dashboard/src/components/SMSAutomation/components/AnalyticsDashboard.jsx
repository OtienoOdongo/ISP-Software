import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, PieChart, Calendar,
  Filter, Download, RefreshCw, Users, MessageSquare, DollarSign,
  Activity, Clock, CheckCircle, XCircle, AlertCircle, Globe
} from 'lucide-react';
import api from '../../../api'
import { 
  EnhancedSelect,
  DateRangePicker,
  StatisticsCard,
  LoadingOverlay
} from '../../ServiceManagement/Shared/components'

// Chart component using Recharts
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const AnalyticsDashboard = ({ stats, analytics, theme, detailed = false }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });
  const [granularity, setGranularity] = useState('day');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sms/analytics/', {
        params: {
          start_date: dateRange.startDate.toISOString().split('T')[0],
          end_date: dateRange.endDate.toISOString().split('T')[0],
          group_by: granularity
        }
      });
      
      setChartData(response.data.analytics || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, granularity]);

  // Initial fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Process chart data
  const processedData = useMemo(() => {
    return chartData.map(item => ({
      date: item.date,
      messages: item.total_messages || 0,
      delivered: item.delivered_messages || 0,
      failed: item.failed_messages || 0,
      successRate: item.delivery_rate || 0,
      cost: item.total_cost || 0
    }));
  }, [chartData]);

  // Gateway performance data
  const gatewayData = useMemo(() => {
    if (!analytics.gateway_metrics) return [];
    
    return Object.entries(analytics.gateway_metrics).map(([name, metrics]) => ({
      name,
      messages: metrics.total || 0,
      successRate: metrics.success_rate || 0,
      cost: metrics.cost || 0
    }));
  }, [analytics]);

  // Template performance data
  const templateData = useMemo(() => {
    if (!analytics.template_metrics) return [];
    
    return Object.entries(analytics.template_metrics)
      .slice(0, 10)
      .map(([name, count]) => ({
        name,
        count
      }));
  }, [analytics]);

  // Color palette based on theme
  const colors = useMemo(() => ({
    primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
    success: theme === 'dark' ? '#10b981' : '#059669',
    danger: theme === 'dark' ? '#ef4444' : '#dc2626',
    warning: theme === 'dark' ? '#f59e0b' : '#d97706',
    background: theme === 'dark' ? '#1f2937' : '#f9fafb',
    text: theme === 'dark' ? '#d1d5db' : '#374151'
  }), [theme]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading analytics..." theme={theme} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Analytics Dashboard
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive SMS performance metrics and insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
            theme={theme}
            className="w-full sm:w-auto"
          />
          
          <EnhancedSelect
            value={granularity}
            onChange={setGranularity}
            options={[
              { value: 'day', label: 'Daily' },
              { value: 'week', label: 'Weekly' },
              { value: 'month', label: 'Monthly' }
            ]}
            theme={theme}
            className="min-w-[120px]"
          />
          
          <button
            onClick={fetchAnalyticsData}
            className={`p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Messages"
          value={stats.today.total}
          change={10}
          icon={MessageSquare}
          theme={theme}
          trend="up"
          format="number"
        />
        
        <StatisticsCard
          title="Delivery Rate"
          value={stats.today.total > 0 ? 
            Math.round((stats.today.delivered / stats.today.total) * 100) : 0
          }
          change={5}
          icon={CheckCircle}
          theme={theme}
          trend="up"
          format="percentage"
        />
        
        <StatisticsCard
          title="Total Cost"
          value={stats.today.cost}
          icon={DollarSign}
          theme={theme}
          format="currency"
        />
        
        <StatisticsCard
          title="Active Gateways"
          value={stats.gateways.online}
          change={stats.gateways.total > 0 ? 
            Math.round((stats.gateways.online / stats.gateways.total) * 100) : 0
          }
          icon={Globe}
          theme={theme}
          trend="neutral"
          format="number"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Volume Chart */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Message Volume
            </h3>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Last 30 days
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="date" 
                  stroke={colors.text}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  stroke={colors.text}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="messages" 
                  name="Total Messages" 
                  fill={colors.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="delivered" 
                  name="Delivered" 
                  fill={colors.success}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success Rate Trend */}
        <div className={`p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Success Rate Trend
            </h3>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Delivery rate over time
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis 
                  dataKey="date" 
                  stroke={colors.text}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  stroke={colors.text}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Success Rate']}
                  content={<CustomTooltip />}
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  name="Success Rate" 
                  stroke={colors.success}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {detailed && (
        <>
          {/* Gateway Performance */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-500" />
              Gateway Performance
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Gateway
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Messages
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Success Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Avg Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                      Avg Delivery Time
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {gatewayData.map((gateway, index) => (
                    <tr key={index} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{gateway.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {gateway.messages.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-2 rounded-full ${
                                gateway.successRate >= 80 ? 'bg-green-500' :
                                gateway.successRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(gateway.successRate, 100)}%` }}
                            />
                          </div>
                          <span>{gateway.successRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        KES {gateway.cost.toFixed(4)}
                      </td>
                      <td className="px-4 py-3">
                        2.3s {/* Example data */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Template Usage */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-500" />
                Template Usage Distribution
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={templateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {templateData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={[
                              '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                              '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1'
                            ][index % 10]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Messages']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Top Templates</h4>
                {templateData.slice(0, 5).map((template, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[120px]">{template.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{template.count.toLocaleString()}</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {((template.count / templateData.reduce((sum, t) => sum + t.count, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className={`p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Peak Hours Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">2,345</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Peak hour messages (10:00 - 11:00)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">94.7%</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Success rate during peak
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i;
                  const messages = Math.floor(Math.random() * 1000) + 500; // Example data
                  const percentage = (messages / 2345) * 100;
                  
                  return (
                    <div key={hour} className="flex items-center gap-3">
                      <span className="w-10 text-sm">{hour.toString().padStart(2, '0')}:00</span>
                      <div className="flex-1">
                        <div 
                          className={`h-4 rounded-full ${
                            hour === 10 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm">{messages.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Options */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-medium mb-1">Export Analytics Data</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Download comprehensive analytics reports
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Download className="w-4 h-4" />
              CSV Report
            </button>
            
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              PDF Report
            </button>
            
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              Excel Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;