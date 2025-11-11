// components/ConnectionStats.jsx
import React, { useState, useEffect } from 'react';
import { Users, Wifi, Signal, UserCheck, UserX } from 'lucide-react';
import api from '../../../api'
import { useTheme } from '../../../context/ThemeContext'

const ConnectionStats = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/user_management/connection-stats/');
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse rounded-xl p-6 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-20 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-xl ${
        theme === 'dark' ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'
      }`}>
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Clients',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'blue',
      description: 'Registered clients'
    },
    {
      title: 'Active Connections',
      value: stats?.active_connections || 0,
      icon: Signal,
      color: 'green',
      description: 'Currently connected'
    },
    {
      title: 'Hotspot Users',
      value: stats?.hotspot_users?.active || 0,
      icon: Wifi,
      color: 'orange',
      description: `${stats?.hotspot_users?.percentage || 0}% of total`
    },
    {
      title: 'PPPoE Users',
      value: stats?.pppoe_users?.active || 0,
      icon: UserCheck,
      color: 'purple',
      description: `${stats?.pppoe_users?.percentage || 0}% of total`
    },
    {
      title: 'Inactive Clients',
      value: stats?.inactive_clients || 0,
      icon: UserX,
      color: 'red',
      description: 'No active connection'
    }
  ];

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      }`}>
        <Users size={20} className="text-blue-500" />
        Connection Overview
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border transition-colors duration-300 ${
              theme === 'dark' 
                ? `bg-${stat.color}-900/20 border-${stat.color}-800/50` 
                : `bg-${stat.color}-50 border-${stat.color}-200`
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.title}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                theme === 'dark' 
                  ? `bg-${stat.color}-900/30 text-${stat.color}-400`
                  : `bg-${stat.color}-100 text-${stat.color}-600`
              }`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className={`text-xs mt-2 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionStats;