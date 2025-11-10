
// // src/Pages/NetworkManagement/components/Audit/AuditLogViewer.jsx

// import React, { useState, useCallback, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Search, Filter, Download, Calendar, User, Server, 
//   RefreshCw, FileText, Trash2, Eye 
// } from 'lucide-react';
// import CustomButton from '../Common/CustomButton';
// import InputField from '../Common/InputField';
// import { getThemeClasses, EnhancedSelect } from '../../../../components/ServiceManagement/Shared/components';

// const AuditLogViewer = ({ theme = "light" }) => {
//   const themeClasses = getThemeClasses(theme);
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     action: '',
//     router_id: '',
//     user_id: '',
//     days: 7,
//     search: ''
//   });

//   const actionTypes = [
//     { value: 'create', label: 'Create' },
//     { value: 'update', label: 'Update' },
//     { value: 'delete', label: 'Delete' },
//     { value: 'user_activation', label: 'User Activation' },
//     { value: 'user_deactivation', label: 'User Deactivation' },
//     { value: 'bulk_operation', label: 'Bulk Operation' },
//     { value: 'configure', label: 'Configure' }
//   ];

//   const fetchAuditLogs = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (filters.action) params.append('action', filters.action);
//       if (filters.router_id) params.append('router_id', filters.router_id);
//       if (filters.user_id) params.append('user_id', filters.user_id);
//       if (filters.days) params.append('days', filters.days);
//       if (filters.search) params.append('search', filters.search);

//       const response = await fetch(`/api/network_management/audit-logs/?${params}`);
//       const data = await response.json();
//       setLogs(data.logs || data);
//     } catch (error) {
//       console.error('Error fetching audit logs:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   const exportLogs = async (format = 'json') => {
//     try {
//       const response = await fetch(`/api/network_management/audit-logs/export/?format=${format}`);
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
//     } catch (error) {
//       console.error('Export error:', error);
//     }
//   };

//   useEffect(() => {
//     fetchAuditLogs();
//   }, [fetchAuditLogs]);

//   const getActionColor = (action) => {
//     const colors = {
//       create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//       user_activation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
//       user_deactivation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
//       bulk_operation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
//     };
//     return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//   };

//   return (
//     <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
//         <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
//           <FileText className="w-5 h-5 mr-2" />
//           Audit Logs
//         </h3>
        
//         <div className="flex gap-2">
//           <CustomButton
//             onClick={() => exportLogs('csv')}
//             icon={<Download className="w-4 h-4" />}
//             label="Export CSV"
//             variant="secondary"
//             size="sm"
//             theme={theme}
//           />
//           <CustomButton
//             onClick={() => exportLogs('json')}
//             icon={<Download className="w-4 h-4" />}
//             label="Export JSON"
//             variant="secondary"
//             size="sm"
//             theme={theme}
//           />
//           <CustomButton
//             onClick={fetchAuditLogs}
//             icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
//             label="Refresh"
//             variant="secondary"
//             size="sm"
//             disabled={loading}
//             theme={theme}
//           />
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={`p-4 rounded-lg border mb-6 ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <EnhancedSelect
//             value={filters.action}
//             onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
//             options={actionTypes}
//             placeholder="All Actions"
//             theme={theme}
//           />
          
//           <InputField
//             value={filters.search}
//             onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//             placeholder="Search logs..."
//             icon={<Search className="w-4 h-4" />}
//             theme={theme}
//           />

//           <InputField
//             type="number"
//             value={filters.days}
//             onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
//             placeholder="Days"
//             icon={<Calendar className="w-4 h-4" />}
//             theme={theme}
//           />
//         </div>
//       </div>

//       {/* Logs List */}
//       <div className="space-y-3 max-h-96 overflow-y-auto">
//         {loading ? (
//           <div className="flex justify-center py-8">
//             <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
//           </div>
//         ) : logs.length === 0 ? (
//           <div className="text-center py-8">
//             <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className={themeClasses.text.tertiary}>No audit logs found</p>
//           </div>
//         ) : (
//           logs.map((log, index) => (
//             <motion.div
//               key={log.id || index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={`p-4 rounded-lg border ${themeClasses.border.medium}`}
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <div className="flex items-center space-x-3">
//                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
//                     {log.action?.replace(/_/g, ' ')}
//                   </span>
//                   {log.router && (
//                     <div className="flex items-center text-sm">
//                       <Server className="w-4 h-4 mr-1" />
//                       <span className={themeClasses.text.secondary}>{log.router.name}</span>
//                     </div>
//                   )}
//                 </div>
//                 <span className={`text-sm ${themeClasses.text.tertiary}`}>
//                   {new Date(log.timestamp).toLocaleString()}
//                 </span>
//               </div>

//               <p className={`text-sm mb-3 ${themeClasses.text.primary}`}>{log.description}</p>

//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center space-x-4">
//                   {log.user && (
//                     <div className="flex items-center">
//                       <User className="w-4 h-4 mr-1" />
//                       <span className={themeClasses.text.secondary}>{log.user.username}</span>
//                     </div>
//                   )}
//                   {log.ip_address && (
//                     <span className={themeClasses.text.tertiary}>IP: {log.ip_address}</span>
//                   )}
//                 </div>
                
//                 {log.changes && Object.keys(log.changes).length > 0 && (
//                   <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
//                     View Changes
//                   </button>
//                 )}
//               </div>
//             </motion.div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuditLogViewer;




// src/Pages/NetworkManagement/components/Audit/AuditLogViewer.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Download, Calendar, User, Server, 
  RefreshCw, FileText, Trash2, Eye 
} from 'lucide-react';
import CustomButton from '../Common/CustomButton';
import InputField from '../Common/InputField';
import { getThemeClasses, EnhancedSelect } from '../../../../components/ServiceManagement/Shared/components';

const AuditLogViewer = ({ theme = "light" }) => {
  const themeClasses = getThemeClasses(theme);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    router_id: '',
    user_id: '',
    days: 7,
    search: ''
  });

  const actionTypes = [
    { value: 'create', label: 'Create' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'user_activation', label: 'User Activation' },
    { value: 'user_deactivation', label: 'User Deactivation' },
    { value: 'bulk_operation', label: 'Bulk Operation' },
    { value: 'configure', label: 'Configure' }
  ];

  // FIX: Handle different response formats and add error handling
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.router_id) params.append('router_id', filters.router_id);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.days) params.append('days', filters.days);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/network_management/audit-logs/?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // FIX: Handle different response formats
      let logsArray = [];
      if (Array.isArray(data)) {
        logsArray = data;
      } else if (data && Array.isArray(data.logs)) {
        logsArray = data.logs;
      } else if (data && data.results && Array.isArray(data.results)) {
        logsArray = data.results;
      } else if (data && typeof data === 'object') {
        // If it's an object but not the expected format, try to extract any array
        const possibleArrays = Object.values(data).filter(item => Array.isArray(item));
        logsArray = possibleArrays.length > 0 ? possibleArrays[0] : [];
      }
      
      setLogs(logsArray);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const exportLogs = async (format = 'json') => {
    try {
      const response = await fetch(`/api/network_management/audit-logs/export/?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      user_activation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      user_deactivation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      bulk_operation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className={`p-6 rounded-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h3 className={`text-lg font-semibold flex items-center ${themeClasses.text.primary}`}>
          <FileText className="w-5 h-5 mr-2" />
          Audit Logs
        </h3>
        
        <div className="flex gap-2">
          <CustomButton
            onClick={() => exportLogs('csv')}
            icon={<Download className="w-4 h-4" />}
            label="Export CSV"
            variant="secondary"
            size="sm"
            theme={theme}
          />
          <CustomButton
            onClick={() => exportLogs('json')}
            icon={<Download className="w-4 h-4" />}
            label="Export JSON"
            variant="secondary"
            size="sm"
            theme={theme}
          />
          <CustomButton
            onClick={fetchAuditLogs}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            label="Refresh"
            variant="secondary"
            size="sm"
            disabled={loading}
            theme={theme}
          />
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border mb-6 ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnhancedSelect
            value={filters.action}
            onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
            options={actionTypes}
            placeholder="All Actions"
            theme={theme}
          />
          
          <InputField
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search logs..."
            icon={<Search className="w-4 h-4" />}
            theme={theme}
          />

          <InputField
            type="number"
            value={filters.days}
            onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
            placeholder="Days"
            icon={<Calendar className="w-4 h-4" />}
            theme={theme}
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (Array.isArray(logs) && logs.length === 0) ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className={themeClasses.text.tertiary}>No audit logs found</p>
          </div>
        ) : Array.isArray(logs) ? (
          logs.map((log, index) => (
            <motion.div
              key={log.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${themeClasses.border.medium}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                    {log.action?.replace(/_/g, ' ')}
                  </span>
                  {log.router && (
                    <div className="flex items-center text-sm">
                      <Server className="w-4 h-4 mr-1" />
                      <span className={themeClasses.text.secondary}>{log.router.name}</span>
                    </div>
                  )}
                </div>
                <span className={`text-sm ${themeClasses.text.tertiary}`}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className={`text-sm mb-3 ${themeClasses.text.primary}`}>{log.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {log.user && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span className={themeClasses.text.secondary}>{log.user.username}</span>
                    </div>
                  )}
                  {log.ip_address && (
                    <span className={themeClasses.text.tertiary}>IP: {log.ip_address}</span>
                  )}
                </div>
                
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    View Changes
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className={themeClasses.text.tertiary}>Invalid data format received</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;