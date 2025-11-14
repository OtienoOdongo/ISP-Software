import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  FiWifi, 
  FiServer, 
  FiActivity, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiXCircle,
  FiRefreshCw 
} from "react-icons/fi";
import { motion } from "framer-motion";

const RouterHealthOverview = ({ data, theme, onLoad, onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoad) onLoad();
    }, 500);

    return () => clearTimeout(timer);
  }, [onLoad]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setHasError(true);
      if (onError) onError("No data available for Router Health Overview");
    } else {
      setHasError(false);
    }
  }, [data, onError]);

  const getStatusIcon = (status, healthScore) => {
    if (status === 'connected' && healthScore >= 80) {
      return <FiCheckCircle className="text-green-500" />;
    } else if (status === 'connected' && healthScore >= 60) {
      return <FiActivity className="text-yellow-500" />;
    } else if (status === 'connected') {
      return <FiAlertTriangle className="text-orange-500" />;
    } else {
      return <FiXCircle className="text-red-500" />;
    }
  };

  const getStatusColor = (status, healthScore) => {
    if (status === 'connected' && healthScore >= 80) {
      return 'text-green-500';
    } else if (status === 'connected' && healthScore >= 60) {
      return 'text-yellow-500';
    } else if (status === 'connected') {
      return 'text-orange-500';
    } else {
      return 'text-red-500';
    }
  };

  const getStatusBgColor = (status, healthScore) => {
    if (status === 'connected' && healthScore >= 80) {
      return theme === "dark" ? "bg-green-900/50" : "bg-green-100";
    } else if (status === 'connected' && healthScore >= 60) {
      return theme === "dark" ? "bg-yellow-900/50" : "bg-yellow-100";
    } else if (status === 'connected') {
      return theme === "dark" ? "bg-orange-900/50" : "bg-orange-100";
    } else {
      return theme === "dark" ? "bg-red-900/50" : "bg-red-100";
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (hasError) {
    return null; // Don't show anything if no data
  }

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-sm overflow-hidden ${
        theme === "dark" 
          ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
          : "bg-white/80 backdrop-blur-md border-gray-200"
      } border animate-pulse`}>
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className={`h-6 w-48 rounded ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-300"
          }`} />
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
              }`}>
                <div className={`h-4 w-3/4 rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                } mb-3`} />
                <div className={`h-3 w-1/2 rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                } mb-2`} />
                <div className={`h-6 w-16 rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const healthyRouters = data.filter(router => 
    router.status === 'connected' && router.health_score >= 60
  ).length;

  const totalRouters = data.length;

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md border-gray-700" 
        : "bg-white/80 backdrop-blur-md border-gray-200"
    } border`}>
      <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${
        theme === "dark" ? "border-gray-700" : "border-gray-200"
      } flex justify-between items-center`}>
        <div>
          <h3 className={`text-lg font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>Router Health Overview</h3>
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            {healthyRouters}/{totalRouters} routers operating normally
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
          healthyRouters === totalRouters 
            ? theme === "dark" 
              ? "bg-green-900/50 text-green-300" 
              : "bg-green-100 text-green-800"
            : theme === "dark" 
              ? "bg-yellow-900/50 text-yellow-300" 
              : "bg-yellow-100 text-yellow-800"
        }`}>
          {healthyRouters === totalRouters ? (
            <FiCheckCircle className="w-3 h-3" />
          ) : (
            <FiAlertTriangle className="w-3 h-3" />
          )}
          <span>
            {Math.round((healthyRouters / totalRouters) * 100)}% Healthy
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((router, index) => (
            <motion.div
              key={router.router_name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`rounded-lg border p-4 transition-all hover:shadow-sm ${
                theme === "dark" 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {router.status === 'connected' ? (
                    <FiWifi className={`text-lg ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`} />
                  ) : (
                    <FiServer className={`text-lg ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`} />
                  )}
                  <div>
                    <h4 className={`font-semibold text-sm ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {router.router_name}
                    </h4>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {router.ip}
                    </p>
                  </div>
                </div>
                <div className={`p-1 rounded ${
                  getStatusBgColor(router.status, router.health_score)
                }`}>
                  {getStatusIcon(router.status, router.health_score)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Health Score</span>
                  <span className={`text-sm font-bold ${getHealthScoreColor(router.health_score)}`}>
                    {router.health_score}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Active Users</span>
                  <span className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}>
                    {router.active_users}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>Status</span>
                  <span className={`text-xs font-medium capitalize ${
                    getStatusColor(router.status, router.health_score)
                  }`}>
                    {router.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {router.last_seen && (
                <div className={`mt-3 pt-2 border-t ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}>
                  <p className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    Last seen: {new Date(router.last_seen).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8">
            <FiServer className={`mx-auto text-3xl mb-3 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`} />
            <p className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>No router health data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

RouterHealthOverview.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      router_name: PropTypes.string.isRequired,
      ip: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      health_score: PropTypes.number.isRequired,
      active_users: PropTypes.number.isRequired,
      last_seen: PropTypes.string,
    })
  ).isRequired,
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

RouterHealthOverview.defaultProps = {
  data: [],
  onLoad: () => {},
  onError: () => {},
};

export default RouterHealthOverview;