// components/AdvancedFilters.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Router } from 'lucide-react';
import api from '../../../api'
import { useTheme } from '../../../context/ThemeContext'

const AdvancedFilters = ({ 
  activeFilter, 
  setActiveFilter, 
  connectionFilter, 
  setConnectionFilter, 
  searchQuery, 
  setSearchQuery,
  routerFilter,
  setRouterFilter 
}) => {
  const { theme } = useTheme();
  const [routers, setRouters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchRouters = async () => {
      try {
        // This endpoint would need to be created in your backend
        const response = await api.get('/api/network_management/routers/');
        setRouters(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch routers:', error);
      }
    };

    fetchRouters();
  }, []);

  const clearFilters = () => {
    setActiveFilter('all');
    setConnectionFilter('all');
    setSearchQuery('');
    setRouterFilter('all');
  };

  const hasActiveFilters = activeFilter !== 'all' || 
                          connectionFilter !== 'all' || 
                          searchQuery || 
                          routerFilter !== 'all';

  return (
    <div className={`rounded-lg border transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by username or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={16} />
          Advanced Filters
          {hasActiveFilters && (
            <span className={`w-2 h-2 rounded-full ${
              theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
            }`}></span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className={`block text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeFilter === filter.value
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Type Filter */}
          <div>
            <label className={`block text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Connection Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Connections' },
                { value: 'hotspot', label: 'Hotspot Only' },
                { value: 'pppoe', label: 'PPPoE Only' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setConnectionFilter(filter.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    connectionFilter === filter.value
                      ? theme === 'dark'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Router Filter */}
          <div>
            <label className={`block text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Router
            </label>
            <select
              value={routerFilter}
              onChange={(e) => setRouterFilter(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="all">All Routers</option>
              {routers.map((router) => (
                <option key={router.id} value={router.id}>
                  {router.name} ({router.ip})
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                theme === 'dark' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <X size={16} />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;