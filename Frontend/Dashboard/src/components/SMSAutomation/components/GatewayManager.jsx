import React, { useState, useMemo, useCallback } from 'react';
import { 
  Server, Wifi, WifiOff, Settings, RefreshCw, Power,
  AlertTriangle, CheckCircle, XCircle, Edit, Trash2,
  Plus, Loader, Shield, Zap, Battery, Globe
} from 'lucide-react';
import api from '../../../api';
import { EnhancedSelect, ConfirmationModal, LoadingOverlay } from '../../ServiceManagement/Shared/components'


const GatewayManager = ({ gateways, loading, theme, refreshData }) => {
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState(null);
  const [filter, setFilter] = useState('all');

  const gatewayTypes = useMemo(() => ({
    africastalking: { name: "Africa's Talking", color: 'orange', icon: Globe },
    twilio: { name: 'Twilio', color: 'blue', icon: Server },
    smpp: { name: 'SMPP', color: 'green', icon: Wifi },
    custom: { name: 'Custom API', color: 'purple', icon: Settings }
  }), []);

  const filteredGateways = useMemo(() => {
    if (filter === 'all') return gateways;
    if (filter === 'online') return gateways.filter(g => g.is_online);
    if (filter === 'offline') return gateways.filter(g => !g.is_online);
    if (filter === 'healthy') return gateways.filter(g => g.health_status === 'healthy');
    if (filter === 'unhealthy') return gateways.filter(g => g.health_status !== 'healthy');
    return gateways;
  }, [gateways, filter]);

  const handleTestConnection = useCallback(async (gateway) => {
    try {
      setIsTesting(true);
      const response = await api.post(`/api/sms/gateways/${gateway.id}/test_connection/`);
      setTestResults(response.data);
      
      if (response.data.success) {
        // Refresh data after successful test
        setTimeout(() => {
          refreshData();
          setIsTesting(false);
          setTestResults(null);
        }, 2000);
      } else {
        setIsTesting(false);
      }
    } catch (error) {
      console.error('Test connection failed:', error);
      setIsTesting(false);
    }
  }, [refreshData]);

  const handleSetDefault = useCallback(async (gateway) => {
    try {
      await api.post(`/api/sms/gateways/${gateway.id}/set_default/`);
      refreshData();
    } catch (error) {
      console.error('Set default failed:', error);
    }
  }, [refreshData]);

  const handleToggleActive = useCallback(async (gateway) => {
    try {
      await api.post(`/api/sms/gateways/${gateway.id}/toggle_active/`);
      refreshData();
    } catch (error) {
      console.error('Toggle active failed:', error);
    }
  }, [refreshData]);

  const handleDeleteGateway = useCallback(async () => {
    if (!gatewayToDelete) return;
    
    try {
      await api.delete(`/api/sms/gateways/${gatewayToDelete.id}/`);
      refreshData();
      setShowDeleteModal(false);
      setGatewayToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [gatewayToDelete, refreshData]);

  const getHealthBadge = useCallback((status) => {
    const statusConfig = {
      healthy: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      offline: { color: 'bg-red-100 text-red-800', icon: WifiOff },
      no_balance: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      poor_performance: { color: 'bg-orange-100 text-orange-800', icon: Battery },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Power }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  }, []);

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading gateways..." theme={theme} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-500" />
            SMS Gateway Management
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure and monitor SMS gateway connections
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <EnhancedSelect
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All Gateways' },
              { value: 'online', label: 'Online Only' },
              { value: 'offline', label: 'Offline Only' },
              { value: 'healthy', label: 'Healthy Only' },
              { value: 'unhealthy', label: 'Unhealthy Only' }
            ]}
            theme={theme}
            className="min-w-[150px]"
          />
          
          <button
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Gateway
          </button>
        </div>
      </div>

      {/* Gateway List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGateways.map((gateway) => {
          const typeConfig = gatewayTypes[gateway.gateway_type] || gatewayTypes.custom;
          const TypeIcon = typeConfig.icon;
          
          return (
            <div
              key={gateway.id}
              className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } ${gateway.is_default ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Gateway Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${typeConfig.color}-100 text-${typeConfig.color}-600`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {gateway.name}
                      {gateway.is_default && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {typeConfig.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(gateway)}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      gateway.is_active ? 'text-green-500' : 'text-gray-400'
                    }`}
                    title={gateway.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGatewayToDelete(gateway)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gateway Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Status
                  </span>
                  {getHealthBadge(gateway.health_status)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Balance
                  </span>
                  <span className="font-medium">
                    {gateway.currency} {parseFloat(gateway.balance).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Success Rate
                  </span>
                  <span className={`font-medium ${
                    gateway.success_rate > 80 ? 'text-green-500' : 
                    gateway.success_rate > 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {parseFloat(gateway.success_rate).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Gateway Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleTestConnection(gateway)}
                  disabled={isTesting}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {isTesting ? <Loader className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Test
                </button>
                
                <button
                  onClick={() => handleSetDefault(gateway)}
                  disabled={gateway.is_default}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-sm ${
                    gateway.is_default
                      ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                      : theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  {gateway.is_default ? 'Default' : 'Set Default'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGateways.length === 0 && (
        <EmptyState
          icon={Server}
          title="No gateways found"
          description={filter !== 'all' 
            ? `No gateways match the "${filter}" filter`
            : "Add your first SMS gateway to get started"
          }
          actionLabel="Add Gateway"
          onAction={() => setIsEditing(true)}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setGatewayToDelete(null);
        }}
        onConfirm={handleDeleteGateway}
        title="Delete Gateway"
        message={`Are you sure you want to delete "${gatewayToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Gateway"
        cancelText="Cancel"
        type="danger"
        theme={theme}
      />
    </div>
  );
};

export default GatewayManager;