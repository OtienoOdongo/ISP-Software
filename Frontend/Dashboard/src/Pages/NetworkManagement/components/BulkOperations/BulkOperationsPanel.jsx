




// import React, { useState, useCallback, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   RefreshCw, Server, Download, Upload, Settings, Play, Pause, 
//   CheckCircle, XCircle, Clock, Users, Activity, Wifi, Shield,
//   Router, Zap, Database
// } from 'lucide-react';
// import CustomButton from '../Common/CustomButton';
// import { getThemeClasses } from '../../../../components/ServiceManagement/Shared/components';
// import { toast } from 'react-toastify';

// const BulkOperationsPanel = ({ theme = "light", routers = [] }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [selectedRouters, setSelectedRouters] = useState([]);
//   const [operationType, setOperationType] = useState('health_check');
//   const [isLoading, setIsLoading] = useState(false);
//   const [operations, setOperations] = useState([]);
//   const [configParams, setConfigParams] = useState({});
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   // Enhanced operation types matching backend capabilities
//   const operationTypes = [
//     { 
//       value: 'health_check', 
//       label: 'Health Check', 
//       icon: Activity,
//       description: 'Test connectivity and system health'
//     },
//     { 
//       value: 'configure_hotspot', 
//       label: 'Configure Hotspot', 
//       icon: Wifi,
//       description: 'Setup wireless hotspot with captive portal'
//     },
//     { 
//       value: 'configure_pppoe', 
//       label: 'Configure PPPoE', 
//       icon: Users,
//       description: 'Setup PPPoE server for user authentication'
//     },
//     { 
//       value: 'auto_setup_routers', 
//       label: 'Auto Setup', 
//       icon: Zap,
//       description: 'Complete automated router setup'
//     },
//     { 
//       value: 'backup_config', 
//       label: 'Backup Config', 
//       icon: Database,
//       description: 'Backup router configurations'
//     },
//     { 
//       value: 'vpn_configuration', 
//       label: 'VPN Setup', 
//       icon: Shield,
//       description: 'Configure VPN services'
//     },
//     { 
//       value: 'script_configuration', 
//       label: 'Script Setup', 
//       icon: Router,
//       description: 'Run configuration scripts'
//     }
//   ];

//   // Configuration templates for different operation types
//   const configurationTemplates = {
//     configure_hotspot: {
//       ssid: '',
//       bandwidth_limit: '10M',
//       session_timeout: 60,
//       max_users: 50,
//       welcome_message: '',
//       redirect_url: '',
//       configuration_template: 'public_wifi'
//     },
//     configure_pppoe: {
//       service_name: '',
//       bandwidth_limit: '10M',
//       mtu: 1492,
//       ip_pool_name: 'pppoe-pool',
//       dns_servers: '8.8.8.8,1.1.1.1'
//     },
//     auto_setup_routers: {
//       setup_type: 'hotspot', // 'hotspot', 'pppoe', 'both'
//       template: 'public_wifi'
//     },
//     script_configuration: {
//       script_type: 'basic_setup', // 'basic_setup', 'hotspot_setup', 'pppoe_setup', 'full_setup'
//       parameters: {},
//       dry_run: false
//     },
//     vpn_configuration: {
//       vpn_type: 'openvpn', // 'openvpn', 'wireguard', 'sstp'
//       configuration: {},
//       generate_certificates: true
//     }
//   };

//   const handleRouterSelect = (routerId) => {
//     setSelectedRouters(prev => 
//       prev.includes(routerId) 
//         ? prev.filter(id => id !== routerId)
//         : [...prev, routerId]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedRouters.length === routers.length) {
//       setSelectedRouters([]);
//     } else {
//       setSelectedRouters(routers.map(r => r.id));
//     }
//   };

//   const handleConfigParamChange = (key, value) => {
//     setConfigParams(prev => ({
//       ...prev,
//       [key]: value
//     }));
//   };

//   const executeBulkOperation = useCallback(async () => {
//     if (selectedRouters.length === 0) {
//       toast.error('Please select at least one router');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       let endpoint = '/api/network_management/bulk-actions/';
//       let payload = {
//         router_ids: selectedRouters,
//         action: operationType
//       };

//       // Add configuration data based on operation type
//       if (operationType === 'configure_hotspot' || operationType === 'configure_pppoe') {
//         payload.config_data = configParams;
//       } else if (operationType === 'auto_setup_routers') {
//         payload.setup_type = configParams.setup_type || 'hotspot';
//       } else if (operationType === 'script_configuration') {
//         payload.script_type = configParams.script_type || 'basic_setup';
//         payload.parameters = configParams.parameters || {};
//         payload.dry_run = configParams.dry_run || false;
//       }

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Operation failed');
//       }
      
//       const result = await response.json();
      
//       // Create operation tracking object
//       const operation = {
//         id: Date.now().toString(),
//         type: operationType,
//         status: 'running',
//         started_at: new Date().toISOString(),
//         routers_count: selectedRouters.length,
//         progress: {
//           completed: 0,
//           total: selectedRouters.length,
//           successful: 0,
//           failed: 0
//         },
//         details: result.details || {}
//       };

//       setOperations(prev => [operation, ...prev]);
//       toast.success(`Bulk ${operationTypes.find(op => op.value === operationType)?.label} started`);
      
//       // Update progress based on initial response
//       if (result.details) {
//         updateOperationProgress(operation.id, result);
//       }

//     } catch (error) {
//       toast.error(`Failed to start bulk operation: ${error.message}`);
//       console.error('Bulk operation error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedRouters, operationType, configParams]);

//   const updateOperationProgress = (operationId, result) => {
//     setOperations(prev => 
//       prev.map(op => {
//         if (op.id === operationId) {
//           const successful = Object.values(result.details).filter(d => d.status === 'success').length;
//           const failed = Object.values(result.details).filter(d => d.status === 'failed').length;
//           const completed = successful + failed;
          
//           return {
//             ...op,
//             progress: {
//               completed,
//               total: op.routers_count,
//               successful,
//               failed
//             },
//             status: completed === op.routers_count ? 'completed' : 'running',
//             details: { ...op.details, ...result.details }
//           };
//         }
//         return op;
//       })
//     );
//   };

//   const getOperationStatusIcon = (status) => {
//     switch (status) {
//       case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
//       case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
//       default: return <Clock className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const renderConfigurationFields = () => {
//     if (!showAdvanced) return null;

//     switch (operationType) {
//       case 'configure_hotspot':
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
//             <div>
//               <label className="block text-sm font-medium mb-1">SSID</label>
//               <input
//                 type="text"
//                 value={configParams.ssid || ''}
//                 onChange={(e) => handleConfigParamChange('ssid', e.target.value)}
//                 placeholder="WiFi Network Name"
//                 className="w-full p-2 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Bandwidth Limit</label>
//               <input
//                 type="text"
//                 value={configParams.bandwidth_limit || '10M'}
//                 onChange={(e) => handleConfigParamChange('bandwidth_limit', e.target.value)}
//                 placeholder="10M"
//                 className="w-full p-2 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
//               <input
//                 type="number"
//                 value={configParams.session_timeout || 60}
//                 onChange={(e) => handleConfigParamChange('session_timeout', parseInt(e.target.value))}
//                 className="w-full p-2 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Max Users</label>
//               <input
//                 type="number"
//                 value={configParams.max_users || 50}
//                 onChange={(e) => handleConfigParamChange('max_users', parseInt(e.target.value))}
//                 className="w-full p-2 border rounded text-sm"
//               />
//             </div>
//           </div>
//         );

//       case 'configure_pppoe':
//         return (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
//             <div>
//               <label className="block text-sm font-medium mb-1">Service Name</label>
//               <input
//                 type="text"
//                 value={configParams.service_name || ''}
//                 onChange={(e) => handleConfigParamChange('service_name', e.target.value)}
//                 placeholder="PPPoE Service Name"
//                 className="w-full p-2 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Bandwidth Limit</label>
//               <input
//                 type="text"
//                 value={configParams.bandwidth_limit || '10M'}
//                 onChange={(e) => handleConfigParamChange('bandwidth_limit', e.target.value)}
//                 className="w-full p-2 border rounded text-sm"
//               />
//             </div>
//           </div>
//         );

//       case 'auto_setup_routers':
//         return (
//           <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
//             <label className="block text-sm font-medium mb-2">Setup Type</label>
//             <select
//               value={configParams.setup_type || 'hotspot'}
//               onChange={(e) => handleConfigParamChange('setup_type', e.target.value)}
//               className="w-full p-2 border rounded text-sm"
//             >
//               <option value="hotspot">Hotspot Only</option>
//               <option value="pppoe">PPPoE Only</option>
//               <option value="both">Both Hotspot & PPPoE</option>
//             </select>
//           </div>
//         );

//       case 'script_configuration':
//         return (
//           <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
//             <label className="block text-sm font-medium mb-2">Script Type</label>
//             <select
//               value={configParams.script_type || 'basic_setup'}
//               onChange={(e) => handleConfigParamChange('script_type', e.target.value)}
//               className="w-full p-2 border rounded text-sm mb-3"
//             >
//               <option value="basic_setup">Basic Setup</option>
//               <option value="hotspot_setup">Hotspot Setup</option>
//               <option value="pppoe_setup">PPPoE Setup</option>
//               <option value="full_setup">Full Setup</option>
//             </select>
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={configParams.dry_run || false}
//                 onChange={(e) => handleConfigParamChange('dry_run', e.target.checked)}
//                 className="mr-2"
//               />
//               Dry Run (Simulate without applying)
//             </label>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Reset config params when operation type changes
//   useEffect(() => {
//     setConfigParams(configurationTemplates[operationType] || {});
//   }, [operationType]);

//   return (
//     <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <h3 className={`text-lg font-semibold mb-4 flex items-center ${themeClasses.text.primary}`}>
//         <Settings className="w-5 h-5 mr-2" />
//         Bulk Operations
//       </h3>

//       {/* Operation Type Selection */}
//       <div className="mb-6">
//         <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
//           Operation Type
//         </label>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {operationTypes.map((op) => (
//             <motion.button
//               key={op.value}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={() => setOperationType(op.value)}
//               className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
//                 operationType === op.value
//                   ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
//                   : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500 ${themeClasses.bg.hover}`
//               }`}
//             >
//               <op.icon className="w-5 h-5 mx-auto mb-2" />
//               <span className="text-xs font-medium block">{op.label}</span>
//               <span className="text-xs opacity-70 mt-1 block">{op.description}</span>
//             </motion.button>
//           ))}
//         </div>
//       </div>

//       {/* Router Selection */}
//       <div className="mb-6">
//         <div className="flex items-center justify-between mb-3">
//           <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
//             Select Routers ({selectedRouters.length} selected)
//           </label>
//           <div className="flex items-center space-x-3">
//             <span className="text-sm text-gray-500">
//               {routers.filter(r => r.connection_status === 'connected').length} connected
//             </span>
//             <button
//               onClick={handleSelectAll}
//               className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
//             >
//               {selectedRouters.length === routers.length ? 'Deselect All' : 'Select All'}
//             </button>
//           </div>
//         </div>
        
//         <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//             {routers.map(router => (
//               <motion.label 
//                 key={router.id} 
//                 whileHover={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#374151' }}
//                 className="flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors"
//               >
//                 <input
//                   type="checkbox"
//                   checked={selectedRouters.includes(router.id)}
//                   onChange={() => handleRouterSelect(router.id)}
//                   className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center space-x-2">
//                     <p className={`text-sm font-medium truncate ${themeClasses.text.primary}`}>
//                       {router.name}
//                     </p>
//                     <span className={`inline-block w-2 h-2 rounded-full ${
//                       router.connection_status === 'connected' ? 'bg-green-500' : 'bg-red-500'
//                     }`}></span>
//                   </div>
//                   <p className={`text-xs truncate ${themeClasses.text.tertiary}`}>
//                     {router.ip} • {router.configuration_status || 'not_configured'}
//                   </p>
//                 </div>
//               </motion.label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Configuration Parameters */}
//       <div className="mb-6">
//         <button
//           onClick={() => setShowAdvanced(!showAdvanced)}
//           className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
//         >
//           <Settings className="w-4 h-4 mr-1" />
//           {showAdvanced ? 'Hide' : 'Show'} Configuration Options
//         </button>
//         {renderConfigurationFields()}
//       </div>

//       {/* Execute Button */}
//       <CustomButton
//         onClick={executeBulkOperation}
//         label={
//           isLoading 
//             ? `Executing ${operationTypes.find(op => op.value === operationType)?.label}...` 
//             : `Execute ${operationTypes.find(op => op.value === operationType)?.label}`
//         }
//         icon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
//         variant="primary"
//         disabled={isLoading || selectedRouters.length === 0}
//         fullWidth
//         theme={theme}
//       />

//       {/* Recent Operations */}
//       {operations.length > 0 && (
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mt-6"
//         >
//           <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Recent Operations</h4>
//           <div className="space-y-2 max-h-64 overflow-y-auto">
//             {operations.slice(0, 5).map((op) => (
//               <motion.div 
//                 key={op.id}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className={`p-3 rounded-lg border ${themeClasses.border.medium}`}
//               >
//                 <div className="flex items-center justify-between mb-2">
//                   <div className="flex items-center space-x-3">
//                     {getOperationStatusIcon(op.status)}
//                     <div>
//                       <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
//                         {operationTypes.find(opt => opt.value === op.type)?.label}
//                       </p>
//                       <p className={`text-xs ${themeClasses.text.tertiary}`}>
//                         {op.routers_count} routers • {new Date(op.started_at).toLocaleTimeString()}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className={`text-sm font-medium ${
//                       op.status === 'completed' ? 'text-green-600' :
//                       op.status === 'failed' ? 'text-red-600' :
//                       'text-blue-600'
//                     }`}>
//                       {op.status?.charAt(0).toUpperCase() + op.status?.slice(1)}
//                     </p>
//                     {op.progress && (
//                       <p className="text-xs text-gray-500">
//                         {op.progress.successful} success, {op.progress.failed} failed
//                       </p>
//                     )}
//                   </div>
//                 </div>
                
//                 {op.progress && (
//                   <div className="space-y-2">
//                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
//                       <div 
//                         className="h-2 rounded-full transition-all duration-300"
//                         style={{ 
//                           width: `${(op.progress.completed / op.progress.total) * 100}%`,
//                           backgroundColor: op.status === 'completed' ? 
//                             (op.progress.failed > 0 ? '#f59e0b' : '#10b981') : '#3b82f6'
//                         }}
//                       ></div>
//                     </div>
//                     <div className="flex justify-between text-xs text-gray-500">
//                       <span>Progress: {op.progress.completed}/{op.progress.total}</span>
//                       <span>{Math.round((op.progress.completed / op.progress.total) * 100)}%</span>
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default BulkOperationsPanel;










// src/Pages/NetworkManagement/components/BulkOperations/BulkOperationsPanel.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Server, Download, Upload, Settings, Play, Pause, 
  CheckCircle, XCircle, Clock, Users, Activity, Wifi, Shield,
  Router, Zap, Database, AlertTriangle, ChevronDown, ChevronUp,
  Monitor, Network, Cpu, HardDrive
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import InputField from '../Common/InputField';
import { getThemeClasses, EnhancedSelect } from '../../../../components/ServiceManagement/Shared/components';
import { toast } from 'react-toastify';

const BulkOperationsPanel = ({ theme = "light", routers = [], onOperationComplete }) => {
  const themeClasses = getThemeClasses(theme);
  const [selectedRouters, setSelectedRouters] = useState([]);
  const [operationType, setOperationType] = useState('health_check');
  const [isLoading, setIsLoading] = useState(false);
  const [operations, setOperations] = useState([]);
  const [configParams, setConfigParams] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedOperation, setExpandedOperation] = useState(null);

  // Enhanced operation types matching backend capabilities
  const operationTypes = [
    { 
      value: 'health_check', 
      label: 'Health Check', 
      icon: Activity,
      description: 'Test connectivity and system health',
      color: 'blue',
      estimatedTime: '1-2 minutes'
    },
    { 
      value: 'configure_hotspot', 
      label: 'Configure Hotspot', 
      icon: Wifi,
      description: 'Setup wireless hotspot with captive portal',
      color: 'green',
      estimatedTime: '5-10 minutes'
    },
    { 
      value: 'configure_pppoe', 
      label: 'Configure PPPoE', 
      icon: Users,
      description: 'Setup PPPoE server for user authentication',
      color: 'purple',
      estimatedTime: '3-7 minutes'
    },
    { 
      value: 'auto_setup_routers', 
      label: 'Auto Setup', 
      icon: Zap,
      description: 'Complete automated router setup',
      color: 'orange',
      estimatedTime: '10-15 minutes'
    },
    { 
      value: 'backup_config', 
      label: 'Backup Config', 
      icon: Database,
      description: 'Backup router configurations',
      color: 'indigo',
      estimatedTime: '2-5 minutes'
    },
    { 
      value: 'vpn_configuration', 
      label: 'VPN Setup', 
      icon: Shield,
      description: 'Configure VPN services',
      color: 'red',
      estimatedTime: '5-10 minutes'
    },
    { 
      value: 'script_configuration', 
      label: 'Script Setup', 
      icon: Router,
      description: 'Run configuration scripts',
      color: 'blue',
      estimatedTime: 'Variable'
    },
    { 
      value: 'diagnostics', 
      label: 'Run Diagnostics', 
      icon: Cpu,
      description: 'Comprehensive system diagnostics',
      color: 'yellow',
      estimatedTime: '3-5 minutes'
    },
    { 
      value: 'firmware_update', 
      label: 'Firmware Update', 
      icon: Download,
      description: 'Update router firmware',
      color: 'red',
      estimatedTime: '10-20 minutes'
    }
  ];

  // Configuration templates for different operation types
  const configurationTemplates = {
    configure_hotspot: {
      ssid: '',
      bandwidth_limit: '10M',
      session_timeout: 60,
      max_users: 50,
      welcome_message: '',
      redirect_url: 'http://captive.surfzone.local',
      configuration_template: 'public_wifi',
      auto_apply: true
    },
    configure_pppoe: {
      service_name: '',
      bandwidth_limit: '10M',
      mtu: 1492,
      ip_pool_name: 'pppoe-pool',
      dns_servers: '8.8.8.8,1.1.1.1',
      auto_apply: true
    },
    auto_setup_routers: {
      setup_type: 'hotspot',
      template: 'public_wifi',
      router_name: '',
      dry_run: false
    },
    script_configuration: {
      script_type: 'basic_setup',
      parameters: {},
      dry_run: false
    },
    vpn_configuration: {
      vpn_type: 'openvpn',
      configuration: {},
      generate_certificates: true
    },
    diagnostics: {
      comprehensive: true,
      include_performance: true,
      include_security: true
    },
    firmware_update: {
      backup_before_update: true,
      force_update: false,
      reboot_after_update: true
    }
  };

  const handleRouterSelect = (routerId) => {
    setSelectedRouters(prev => 
      prev.includes(routerId) 
        ? prev.filter(id => id !== routerId)
        : [...prev, routerId]
    );
  };

  const handleSelectAll = (filterType = 'all') => {
    let routersToSelect = routers;
    
    if (filterType === 'connected') {
      routersToSelect = routers.filter(r => r.connection_status === 'connected');
    } else if (filterType === 'disconnected') {
      routersToSelect = routers.filter(r => r.connection_status === 'disconnected');
    } else if (filterType === 'configured') {
      routersToSelect = routers.filter(r => r.configuration_status === 'configured');
    }

    if (selectedRouters.length === routersToSelect.length && 
        selectedRouters.every(id => routersToSelect.some(r => r.id === id))) {
      setSelectedRouters([]);
    } else {
      setSelectedRouters(routersToSelect.map(r => r.id));
    }
  };

  const handleConfigParamChange = (key, value) => {
    setConfigParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const executeBulkOperation = useCallback(async () => {
    if (selectedRouters.length === 0) {
      toast.error('Please select at least one router');
      return;
    }

    // Validate configuration for specific operations
    if (operationType === 'configure_hotspot' && !configParams.ssid) {
      toast.error('SSID is required for hotspot configuration');
      return;
    }

    setIsLoading(true);
    
    // Create operation tracking object
    const operationId = `bulk_${operationType}_${Date.now()}`;
    const operation = {
      id: operationId,
      type: operationType,
      status: 'running',
      started_at: new Date().toISOString(),
      routers_count: selectedRouters.length,
      progress: {
        completed: 0,
        total: selectedRouters.length,
        successful: 0,
        failed: 0,
        pending: selectedRouters.length
      },
      details: {},
      estimated_duration: operationTypes.find(op => op.value === operationType)?.estimatedTime
    };

    setOperations(prev => [operation, ...prev]);

    try {
      const payload = {
        router_ids: selectedRouters,
        action: operationType,
        ...configParams
      };

      const response = await fetch('/api/network_management/bulk-actions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Operation failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update operation with initial results
      updateOperationProgress(operationId, result);
      
      toast.success(`Bulk ${operationTypes.find(op => op.value === operationType)?.label} started successfully`);
      
      // Notify parent component
      if (onOperationComplete) {
        onOperationComplete(operationId, result);
      }

    } catch (error) {
      console.error('Bulk operation error:', error);
      toast.error(`Failed to start bulk operation: ${error.message}`);
      
      // Mark operation as failed
      updateOperationProgress(operationId, { 
        error: error.message,
        details: Object.fromEntries(selectedRouters.map(id => [id, { status: 'failed', error: error.message }]))
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedRouters, operationType, configParams, onOperationComplete]);

  const updateOperationProgress = (operationId, result) => {
    setOperations(prev => 
      prev.map(op => {
        if (op.id === operationId) {
          const details = result.details || {};
          const successful = Object.values(details).filter(d => d.status === 'success').length;
          const failed = Object.values(details).filter(d => d.status === 'failed').length;
          const completed = successful + failed;
          const pending = op.routers_count - completed;
          
          const updatedOp = {
            ...op,
            progress: {
              completed,
              total: op.routers_count,
              successful,
              failed,
              pending
            },
            status: result.error ? 'failed' : (completed === op.routers_count ? 'completed' : 'running'),
            details: { ...op.details, ...details },
            error: result.error,
            completed_at: completed === op.routers_count ? new Date().toISOString() : op.completed_at
          };

          return updatedOp;
        }
        return op;
      })
    );
  };

  const getOperationStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getOperationColor = (operationType) => {
    const op = operationTypes.find(o => o.value === operationType);
    return op?.color || 'blue';
  };

  const renderConfigurationFields = () => {
    if (!showAdvanced) return null;

    const currentOperation = operationTypes.find(op => op.value === operationType);
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className={`p-4 rounded-lg border ${themeClasses.border.medium} ${themeClasses.bg.card}`}>
          <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
            <Settings className="w-4 h-4 mr-2" />
            {currentOperation?.label} Configuration
          </h4>

          {operationType === 'configure_hotspot' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="SSID"
                value={configParams.ssid || ''}
                onChange={(e) => handleConfigParamChange('ssid', e.target.value)}
                placeholder="WiFi Network Name"
                required
                theme={theme}
              />
              <InputField
                label="Bandwidth Limit"
                value={configParams.bandwidth_limit || '10M'}
                onChange={(e) => handleConfigParamChange('bandwidth_limit', e.target.value)}
                placeholder="10M"
                theme={theme}
              />
              <InputField
                label="Session Timeout (minutes)"
                type="number"
                value={configParams.session_timeout || 60}
                onChange={(e) => handleConfigParamChange('session_timeout', parseInt(e.target.value))}
                theme={theme}
              />
              <InputField
                label="Max Users"
                type="number"
                value={configParams.max_users || 50}
                onChange={(e) => handleConfigParamChange('max_users', parseInt(e.target.value))}
                theme={theme}
              />
            </div>
          )}

          {operationType === 'configure_pppoe' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Service Name"
                value={configParams.service_name || ''}
                onChange={(e) => handleConfigParamChange('service_name', e.target.value)}
                placeholder="PPPoE Service Name"
                theme={theme}
              />
              <InputField
                label="Bandwidth Limit"
                value={configParams.bandwidth_limit || '10M'}
                onChange={(e) => handleConfigParamChange('bandwidth_limit', e.target.value)}
                theme={theme}
              />
              <InputField
                label="MTU"
                type="number"
                value={configParams.mtu || 1492}
                onChange={(e) => handleConfigParamChange('mtu', parseInt(e.target.value))}
                theme={theme}
              />
              <InputField
                label="IP Pool Name"
                value={configParams.ip_pool_name || 'pppoe-pool'}
                onChange={(e) => handleConfigParamChange('ip_pool_name', e.target.value)}
                theme={theme}
              />
            </div>
          )}

          {operationType === 'auto_setup_routers' && (
            <div className="space-y-4">
              <EnhancedSelect
                label="Setup Type"
                value={configParams.setup_type || 'hotspot'}
                onChange={(value) => handleConfigParamChange('setup_type', value)}
                options={[
                  { value: 'hotspot', label: 'Hotspot Only' },
                  { value: 'pppoe', label: 'PPPoE Only' },
                  { value: 'both', label: 'Both Hotspot & PPPoE' }
                ]}
                theme={theme}
              />
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={configParams.dry_run || false}
                  onChange={(e) => handleConfigParamChange('dry_run', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className={`text-sm ${themeClasses.text.primary}`}>
                  Dry Run (Simulate without applying changes)
                </label>
              </div>
            </div>
          )}

          {operationType === 'script_configuration' && (
            <div className="space-y-4">
              <EnhancedSelect
                label="Script Type"
                value={configParams.script_type || 'basic_setup'}
                onChange={(value) => handleConfigParamChange('script_type', value)}
                options={[
                  { value: 'basic_setup', label: 'Basic Setup' },
                  { value: 'hotspot_setup', label: 'Hotspot Setup' },
                  { value: 'pppoe_setup', label: 'PPPoE Setup' },
                  { value: 'full_setup', label: 'Full Setup' }
                ]}
                theme={theme}
              />
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={configParams.dry_run || false}
                  onChange={(e) => handleConfigParamChange('dry_run', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className={`text-sm ${themeClasses.text.primary}`}>
                  Dry Run (Test script without applying)
                </label>
              </div>
            </div>
          )}

          {/* Warning for destructive operations */}
          {['firmware_update', 'script_configuration'].includes(operationType) && (
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-300">Important Notice</h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    This operation will modify router configurations. Ensure you have backups and understand the changes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Reset config params when operation type changes
  useEffect(() => {
    setConfigParams(configurationTemplates[operationType] || {});
  }, [operationType]);

  const connectedRouters = routers.filter(r => r.connection_status === 'connected');
  const disconnectedRouters = routers.filter(r => r.connection_status === 'disconnected');

  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
          <Settings className="w-5 h-5 mr-2" />
          Bulk Operations
        </h3>
        <div className="flex items-center space-x-2 text-sm">
          <span className={themeClasses.text.tertiary}>
            {routers.length} total routers
          </span>
          <span className="text-green-600 dark:text-green-400">
            {connectedRouters.length} connected
          </span>
          <span className="text-red-600 dark:text-red-400">
            {disconnectedRouters.length} disconnected
          </span>
        </div>
      </div>

      {/* Operation Type Selection */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
          Select Operation Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {operationTypes.map((op) => (
            <motion.button
              key={op.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOperationType(op.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-center group ${
                operationType === op.value
                  ? `border-${op.color}-500 bg-${op.color}-50 dark:bg-${op.color}-900/20 text-${op.color}-700 dark:text-${op.color}-300`
                  : `${themeClasses.border.medium} hover:border-gray-400 dark:hover:border-gray-500 ${themeClasses.bg.hover}`
              }`}
            >
              <div className={`p-2 rounded-lg mb-2 mx-auto w-fit ${
                operationType === op.value 
                  ? `bg-${op.color}-100 dark:bg-${op.color}-800` 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <op.icon className={`w-4 h-4 ${
                  operationType === op.value 
                    ? `text-${op.color}-600 dark:text-${op.color}-400`
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
              <span className="text-xs font-medium block">{op.label}</span>
              <span className="text-xs opacity-70 mt-1 block">{op.description}</span>
              <span className="text-xs text-gray-500 mt-1 block">{op.estimatedTime}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Router Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
            Select Routers ({selectedRouters.length} selected)
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {connectedRouters.length} connected
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleSelectAll('all')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                {selectedRouters.length === routers.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => handleSelectAll('connected')}
                className="text-sm text-green-600 dark:text-green-400 hover:underline px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                Connected
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
          {routers.length === 0 ? (
            <div className="text-center py-4">
              <Server className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className={themeClasses.text.tertiary}>No routers available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {routers.map(router => (
                <motion.label 
                  key={router.id} 
                  whileHover={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#374151' }}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                    router.connection_status === 'disconnected' ? 'opacity-60' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRouters.includes(router.id)}
                    onChange={() => handleRouterSelect(router.id)}
                    disabled={router.connection_status === 'disconnected' && operationType !== 'health_check'}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${themeClasses.text.primary}`}>
                        {router.name}
                      </p>
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        router.connection_status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                    <p className={`text-xs truncate ${themeClasses.text.tertiary}`}>
                      {router.ip} • {router.configuration_status || 'not_configured'}
                    </p>
                  </div>
                </motion.label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Parameters */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          {showAdvanced ? 'Hide' : 'Show'} Configuration Options
        </button>
        <AnimatePresence>
          {renderConfigurationFields()}
        </AnimatePresence>
      </div>

      {/* Execute Button */}
      <CustomButton
        onClick={executeBulkOperation}
        label={
          isLoading 
            ? `Starting ${operationTypes.find(op => op.value === operationType)?.label}...` 
            : `Execute ${operationTypes.find(op => op.value === operationType)?.label}`
        }
        icon={isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        variant="primary"
        disabled={isLoading || selectedRouters.length === 0}
        fullWidth
        theme={theme}
      />

      {/* Recent Operations */}
      {operations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h4 className={`font-medium mb-3 flex items-center ${themeClasses.text.primary}`}>
            <Activity className="w-4 h-4 mr-2" />
            Recent Operations
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {operations.slice(0, 5).map((op) => (
              <motion.div 
                key={op.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-3 rounded-lg border ${themeClasses.border.medium} cursor-pointer`}
                onClick={() => setExpandedOperation(expandedOperation === op.id ? null : op.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getOperationStatusIcon(op.status)}
                    <div>
                      <p className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {operationTypes.find(opt => opt.value === op.type)?.label}
                      </p>
                      <p className={`text-xs ${themeClasses.text.tertiary}`}>
                        {op.routers_count} routers • {new Date(op.started_at).toLocaleTimeString()}
                        {op.estimated_duration && ` • ${op.estimated_duration}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      op.status === 'completed' ? 'text-green-600' :
                      op.status === 'failed' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {op.status?.charAt(0).toUpperCase() + op.status?.slice(1)}
                    </p>
                    {op.progress && (
                      <p className="text-xs text-gray-500">
                        {op.progress.successful} success, {op.progress.failed} failed
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {op.progress && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(op.progress.completed / op.progress.total) * 100}%`,
                          backgroundColor: op.status === 'completed' ? 
                            (op.progress.failed > 0 ? '#f59e0b' : '#10b981') : 
                            (op.status === 'failed' ? '#ef4444' : '#3b82f6')
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress: {op.progress.completed}/{op.progress.total}</span>
                      <span>{Math.round((op.progress.completed / op.progress.total) * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedOperation === op.id && op.details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className={themeClasses.text.tertiary}>Successful:</span>
                          <span className="ml-1 text-green-600 font-medium">{op.progress.successful}</span>
                        </div>
                        <div>
                          <span className={themeClasses.text.tertiary}>Failed:</span>
                          <span className="ml-1 text-red-600 font-medium">{op.progress.failed}</span>
                        </div>
                        <div>
                          <span className={themeClasses.text.tertiary}>Pending:</span>
                          <span className="ml-1 text-blue-600 font-medium">{op.progress.pending}</span>
                        </div>
                        <div>
                          <span className={themeClasses.text.tertiary}>Duration:</span>
                          <span className="ml-1 font-medium">
                            {op.completed_at 
                              ? `${Math.round((new Date(op.completed_at) - new Date(op.started_at)) / 1000)}s`
                              : 'Running...'
                            }
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BulkOperationsPanel;