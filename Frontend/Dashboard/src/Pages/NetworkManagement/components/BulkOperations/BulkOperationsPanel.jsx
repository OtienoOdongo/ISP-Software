import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Server, Download, Upload, Settings, Play, Pause, 
  CheckCircle, XCircle, Clock, Users, Activity 
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
import { toast } from 'react-toastify';

const BulkOperationsPanel = ({ theme = "light", routers = [] }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedRouters, setSelectedRouters] = useState([]);
  const [operationType, setOperationType] = useState('health_check');
  const [isLoading, setIsLoading] = useState(false);
  const [operations, setOperations] = useState([]);

  const operationTypes = [
    { value: 'health_check', label: 'Health Check', icon: Activity },
    { value: 'restart', label: 'Restart Routers', icon: RefreshCw },
    { value: 'update_firmware', label: 'Update Firmware', icon: Download },
    { value: 'backup_config', label: 'Backup Config', icon: Server },
    { value: 'update_status', label: 'Update Status', icon: Settings }
  ];

  const handleRouterSelect = (routerId) => {
    setSelectedRouters(prev => 
      prev.includes(routerId) 
        ? prev.filter(id => id !== routerId)
        : [...prev, routerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRouters.length === routers.length) {
      setSelectedRouters([]);
    } else {
      setSelectedRouters(routers.map(r => r.id));
    }
  };

  const executeBulkOperation = useCallback(async () => {
    if (selectedRouters.length === 0) {
      toast.error('Please select at least one router');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/network_management/bulk-operations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          router_ids: selectedRouters,
          action: operationType,
          parameters: {}
        })
      });

      if (!response.ok) throw new Error('Operation failed');
      
      const result = await response.json();
      setOperations(prev => [result, ...prev]);
      toast.success(`Bulk operation started: ${result.operation_id}`);
      
      // Poll for operation status
      pollOperationStatus(result.operation_id);
    } catch (error) {
      toast.error('Failed to start bulk operation');
      console.error('Bulk operation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRouters, operationType]);

  const pollOperationStatus = async (operationId) => {
    try {
      const response = await fetch(`/api/network_management/bulk-operations/${operationId}/`);
      const status = await response.json();
      
      setOperations(prev => 
        prev.map(op => 
          op.operation_id === operationId ? { ...op, ...status } : op
        )
      );

      if (status.status === 'running') {
        setTimeout(() => pollOperationStatus(operationId), 2000);
      }
    } catch (error) {
      console.error('Status polling error:', error);
    }
  };

  const getOperationStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
        <Settings className="w-5 h-5 mr-2" />
        Bulk Operations
      </h3>

      {/* Operation Type Selection */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
          Operation Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {operationTypes.map((op) => (
            <button
              key={op.value}
              onClick={() => setOperationType(op.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                operationType === op.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500`
              }`}
            >
              <op.icon className="w-5 h-5 mx-auto mb-2" />
              <span className="text-xs font-medium">{op.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Router Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
            Select Routers ({selectedRouters.length} selected)
          </label>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {selectedRouters.length === routers.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {routers.map(router => (
              <label key={router.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <input
                  type="checkbox"
                  checked={selectedRouters.includes(router.id)}
                  onChange={() => handleRouterSelect(router.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className={`text-sm font-medium ${themeClasses.text.primary}`}>{router.name}</p>
                  <p className={`text-xs ${themeClasses.text.tertiary}`}>{router.ip} • {router.status}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Execute Button */}
      <CustomButton
        onClick={executeBulkOperation}
        label={`Execute ${operationTypes.find(op => op.value === operationType)?.label}`}
        icon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        variant="primary"
        disabled={isLoading || selectedRouters.length === 0}
        fullWidth
        theme={theme}
      />

      {/* Recent Operations */}
      {operations.length > 0 && (
        <div className="mt-6">
          <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Recent Operations</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {operations.slice(0, 5).map((op, index) => (
              <div key={index} className={`p-3 rounded-lg border ${themeClasses.border.medium}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getOperationStatusIcon(op.status)}
                    <div>
                      <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {operationTypes.find(opt => opt.value === op.operation_type)?.label}
                      </p>
                      <p className={`text-xs ${themeClasses.text.tertiary}`}>
                        {op.routers_count} routers • {new Date(op.started_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${
                      op.status === 'completed' ? 'text-green-600' :
                      op.status === 'failed' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {op.status?.charAt(0).toUpperCase() + op.status?.slice(1)}
                    </p>
                    {op.progress && (
                      <p className="text-xs text-gray-500">
                        {op.progress.completed}/{op.progress.total} completed
                      </p>
                    )}
                  </div>
                </div>
                {op.progress && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(op.progress.completed / op.progress.total) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperationsPanel;