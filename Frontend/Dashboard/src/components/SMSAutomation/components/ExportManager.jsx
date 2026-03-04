






// import React, { useState, useMemo, useCallback } from 'react';
// import {
//   Download, FileText, Database, Calendar, Filter,
//   Settings, CheckSquare, Square, ChevronDown,
//   RefreshCw, AlertCircle, CheckCircle, XCircle,
//   BarChart3, MessageSquare, Users, Server, Loader,
//   Clock, Globe, Mail, Phone, DollarSign, Tag
// } from 'lucide-react';
// import api from '../../../api';
// import { formatDate, formatFileSize } from '../utils/formatters';

// const ExportManager = ({ messages = [], templates = [], gateways = [], rules = [], theme }) => {
//   const [exportType, setExportType] = useState('messages');
//   const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
//   const [format, setFormat] = useState('csv');
//   const [selectedFields, setSelectedFields] = useState(new Set());
//   const [filters, setFilters] = useState({});
//   const [isExporting, setIsExporting] = useState(false);
//   const [exportHistory, setExportHistory] = useState([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [exportProgress, setExportProgress] = useState(0);
//   const [estimatedSize, setEstimatedSize] = useState(0);

//   // Export configurations
//   const exportConfigs = useMemo(() => ({
//     messages: {
//       name: 'SMS Messages',
//       icon: MessageSquare,
//       count: messages.length,
//       fields: [
//         { id: 'id', label: 'ID', type: 'string', default: true },
//         { id: 'phone_number', label: 'Phone Number', type: 'string', default: true },
//         { id: 'recipient_name', label: 'Recipient Name', type: 'string', default: true },
//         { id: 'message', label: 'Message', type: 'text', default: true },
//         { id: 'status', label: 'Status', type: 'string', default: true },
//         { id: 'priority', label: 'Priority', type: 'string', default: false },
//         { id: 'created_at', label: 'Created At', type: 'datetime', default: true },
//         { id: 'sent_at', label: 'Sent At', type: 'datetime', default: false },
//         { id: 'delivered_at', label: 'Delivered At', type: 'datetime', default: false },
//         { id: 'gateway_name', label: 'Gateway', type: 'string', default: false },
//         { id: 'cost', label: 'Cost', type: 'number', default: true },
//         { id: 'character_count', label: 'Characters', type: 'number', default: false },
//         { id: 'message_parts', label: 'Parts', type: 'number', default: false },
//         { id: 'reference_id', label: 'Reference', type: 'string', default: false },
//         { id: 'source', label: 'Source', type: 'string', default: false }
//       ],
//       filters: [
//         { id: 'status', label: 'Status', type: 'select', options: ['all', 'sent', 'delivered', 'failed', 'pending'] },
//         { id: 'priority', label: 'Priority', type: 'select', options: ['all', 'urgent', 'high', 'normal', 'low'] },
//         { id: 'gateway', label: 'Gateway', type: 'select', options: ['all', ...gateways.map(g => g.name)] }
//       ]
//     },
//     templates: {
//       name: 'SMS Templates',
//       icon: FileText,
//       count: templates.length,
//       fields: [
//         { id: 'id', label: 'ID', type: 'string', default: true },
//         { id: 'name', label: 'Name', type: 'string', default: true },
//         { id: 'template_type', label: 'Type', type: 'string', default: true },
//         { id: 'message_template', label: 'Template', type: 'text', default: true },
//         { id: 'language', label: 'Language', type: 'string', default: false },
//         { id: 'character_count', label: 'Characters', type: 'number', default: false },
//         { id: 'usage_count', label: 'Usage', type: 'number', default: true },
//         { id: 'is_active', label: 'Active', type: 'boolean', default: false },
//         { id: 'created_at', label: 'Created', type: 'datetime', default: true },
//         { id: 'last_used', label: 'Last Used', type: 'datetime', default: false },
//         { id: 'variables', label: 'Variables', type: 'json', default: false }
//       ]
//     },
//     gateways: {
//       name: 'SMS Gateways',
//       icon: Server,
//       count: gateways.length,
//       fields: [
//         { id: 'id', label: 'ID', type: 'string', default: true },
//         { id: 'name', label: 'Name', type: 'string', default: true },
//         { id: 'gateway_type', label: 'Type', type: 'string', default: true },
//         { id: 'is_active', label: 'Active', type: 'boolean', default: true },
//         { id: 'is_online', label: 'Online', type: 'boolean', default: true },
//         { id: 'balance', label: 'Balance', type: 'number', default: true },
//         { id: 'success_rate', label: 'Success Rate', type: 'number', default: true },
//         { id: 'total_messages_sent', label: 'Total Sent', type: 'number', default: false },
//         { id: 'total_messages_failed', label: 'Total Failed', type: 'number', default: false },
//         { id: 'cost_per_message', label: 'Cost/Message', type: 'number', default: false },
//         { id: 'last_used', label: 'Last Used', type: 'datetime', default: false },
//         { id: 'created_at', label: 'Created', type: 'datetime', default: true }
//       ]
//     },
//     rules: {
//       name: 'Automation Rules',
//       icon: Settings,
//       count: rules.length,
//       fields: [
//         { id: 'id', label: 'ID', type: 'string', default: true },
//         { id: 'name', label: 'Name', type: 'string', default: true },
//         { id: 'rule_type', label: 'Type', type: 'string', default: true },
//         { id: 'is_active', label: 'Active', type: 'boolean', default: true },
//         { id: 'execution_count', label: 'Executions', type: 'number', default: true },
//         { id: 'success_count', label: 'Success', type: 'number', default: false },
//         { id: 'failure_count', label: 'Failure', type: 'number', default: false },
//         { id: 'success_rate', label: 'Success Rate', type: 'number', default: true },
//         { id: 'priority', label: 'Priority', type: 'string', default: false },
//         { id: 'last_executed', label: 'Last Executed', type: 'datetime', default: false },
//         { id: 'created_at', label: 'Created', type: 'datetime', default: true }
//       ]
//     }
//   }), [messages.length, templates.length, gateways, rules.length]);

//   // Initialize selected fields
//   useMemo(() => {
//     const config = exportConfigs[exportType];
//     const defaultFields = new Set(
//       config.fields.filter(f => f.default).map(f => f.id)
//     );
//     setSelectedFields(defaultFields);
    
//     // Estimate size
//     const fieldCount = defaultFields.size;
//     const avgRecordSize = 200; // bytes per record
//     setEstimatedSize(config.count * fieldCount * avgRecordSize);
//   }, [exportType, exportConfigs]);

//   // Format options
//   const formatOptions = [
//     { value: 'csv', label: 'CSV', description: 'Comma-separated values', icon: FileText, mime: 'text/csv' },
//     { value: 'json', label: 'JSON', description: 'JavaScript Object Notation', icon: Database, mime: 'application/json' },
//     { value: 'excel', label: 'Excel', description: 'Microsoft Excel (.xlsx)', icon: BarChart3, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
//     { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: FileText, mime: 'application/pdf' }
//   ];

//   // Handle export
//   const handleExport = useCallback(async () => {
//     if (selectedFields.size === 0) return;
    
//     try {
//       setIsExporting(true);
//       setExportProgress(0);
      
//       const exportData = {
//         type: exportType,
//         format,
//         fields: Array.from(selectedFields),
//         filters: { ...filters },
//         date_range: dateRange.startDate && dateRange.endDate ? {
//           start: dateRange.startDate.toISOString().split('T')[0],
//           end: dateRange.endDate.toISOString().split('T')[0]
//         } : null
//       };

//       let endpoint, response;
      
//       // Simulate progress
//       const progressInterval = setInterval(() => {
//         setExportProgress(prev => Math.min(prev + 10, 90));
//       }, 500);
      
//       if (exportType === 'messages') {
//         endpoint = '/api/sms/messages/export/';
//         response = await api.get(endpoint, {
//           params: {
//             format,
//             fields: exportData.fields.join(','),
//             ...exportData.filters,
//             ...(exportData.date_range || {})
//           },
//           responseType: 'blob'
//         });
//       } else {
//         // For other types, generate locally
//         const data = {
//           messages,
//           templates,
//           gateways,
//           rules
//         }[exportType];
        
//         // Filter data based on selected fields
//         const filteredData = data.map(item => {
//           const filtered = {};
//           exportData.fields.forEach(field => {
//             filtered[field] = item[field];
//           });
//           return filtered;
//         });
        
//         // Convert based on format
//         let blob;
//         if (format === 'json') {
//           blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
//         } else {
//           // Convert to CSV
//           const headers = exportData.fields.join(',');
//           const rows = filteredData.map(item => 
//             exportData.fields.map(field => {
//               const value = item[field];
//               if (value === null || value === undefined) return '';
//               if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';');
//               if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
//               return value;
//             }).join(',')
//           );
//           const csv = [headers, ...rows].join('\n');
//           blob = new Blob([csv], { type: 'text/csv' });
//         }
        
//         response = { data: blob };
//       }
      
//       clearInterval(progressInterval);
//       setExportProgress(100);
      
//       // Create download link
//       const url = window.URL.createObjectURL(response.data);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${exportType}_export_${new Date().toISOString().split('T')[0]}.${format}`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
      
//       // Add to history
//       const historyEntry = {
//         id: Date.now(),
//         type: exportType,
//         format,
//         fields: exportData.fields.length,
//         records: exportConfigs[exportType].count,
//         timestamp: new Date().toISOString(),
//         size: response.data.size
//       };
//       setExportHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
//       setTimeout(() => {
//         setIsExporting(false);
//         setExportProgress(0);
//       }, 1000);
      
//     } catch (error) {
//       console.error('Export failed:', error);
//       setIsExporting(false);
//       setExportProgress(0);
//     }
//   }, [exportType, format, selectedFields, filters, dateRange, messages, templates, gateways, rules, exportConfigs]);

//   // Toggle field selection
//   const toggleField = useCallback((fieldId) => {
//     const newSelected = new Set(selectedFields);
//     if (newSelected.has(fieldId)) {
//       newSelected.delete(fieldId);
//     } else {
//       newSelected.add(fieldId);
//     }
//     setSelectedFields(newSelected);
    
//     // Recalculate size estimate
//     const config = exportConfigs[exportType];
//     const avgRecordSize = 200;
//     setEstimatedSize(config.count * newSelected.size * avgRecordSize);
//   }, [selectedFields, exportType, exportConfigs]);

//   // Select all fields
//   const selectAllFields = useCallback(() => {
//     const config = exportConfigs[exportType];
//     const allFields = new Set(config.fields.map(f => f.id));
//     setSelectedFields(allFields);
    
//     // Recalculate size
//     const avgRecordSize = 200;
//     setEstimatedSize(config.count * allFields.size * avgRecordSize);
//   }, [exportType, exportConfigs]);

//   // Deselect all fields
//   const deselectAllFields = useCallback(() => {
//     setSelectedFields(new Set());
//     setEstimatedSize(0);
//   }, []);

//   // Current config
//   const currentConfig = exportConfigs[exportType];
//   const FormatIcon = formatOptions.find(f => f.value === format)?.icon || FileText;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-lg font-semibold flex items-center gap-2">
//             <Download className="w-5 h-5 text-teal-500" />
//             Data Export Manager
//           </h2>
//           <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//             Export SMS automation data in various formats
//           </p>
//         </div>
        
//         <button
//           onClick={() => setShowHistory(!showHistory)}
//           className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
//             theme === 'dark' 
//               ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
//               : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//           }`}
//         >
//           <Database className="w-4 h-4" />
//           History ({exportHistory.length})
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Export Configuration */}
//         <div className={`lg:col-span-2 space-y-6 p-6 rounded-lg border ${
//           theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//         }`}>
//           {/* Export Type Selection */}
//           <div>
//             <h3 className="font-medium mb-3">Select Data to Export</h3>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//               {Object.entries(exportConfigs).map(([key, config]) => {
//                 const Icon = config.icon;
//                 const isSelected = exportType === key;
                
//                 return (
//                   <button
//                     key={key}
//                     onClick={() => setExportType(key)}
//                     className={`p-4 rounded-lg border transition-all duration-200 ${
//                       isSelected
//                         ? theme === 'dark'
//                           ? 'border-teal-500 bg-teal-900/20'
//                           : 'border-teal-500 bg-teal-50'
//                         : theme === 'dark'
//                         ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex flex-col items-center gap-2">
//                       <Icon className={`w-6 h-6 ${isSelected ? 'text-teal-500' : 'text-gray-400'}`} />
//                       <span className="text-sm font-medium">{config.name}</span>
//                       <span className={`text-xs px-2 py-0.5 rounded-full ${
//                         theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
//                       }`}>
//                         {config.count} records
//                       </span>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Export Format */}
//           <div>
//             <h3 className="font-medium mb-3">Export Format</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//               {formatOptions.map((option) => {
//                 const Icon = option.icon;
//                 const isSelected = format === option.value;
                
//                 return (
//                   <button
//                     key={option.value}
//                     onClick={() => setFormat(option.value)}
//                     className={`p-4 rounded-lg border transition-all duration-200 ${
//                       isSelected
//                         ? theme === 'dark'
//                           ? 'border-blue-500 bg-blue-900/20'
//                           : 'border-blue-500 bg-blue-50'
//                         : theme === 'dark'
//                         ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
//                         : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex flex-col items-center gap-2">
//                       <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
//                       <span className="text-sm font-medium">{option.label}</span>
//                       <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                         {option.description}
//                       </span>
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Date Range */}
//           <div>
//             <h3 className="font-medium mb-3">Date Range (Optional)</h3>
//             <div className="flex gap-3">
//               <input
//                 type="date"
//                 value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
//                 onChange={(e) => setDateRange(prev => ({ 
//                   ...prev, 
//                   startDate: e.target.value ? new Date(e.target.value) : null 
//                 }))}
//                 className={`flex-1 px-4 py-2 border rounded-lg ${
//                   theme === 'dark' 
//                     ? 'bg-gray-700 border-gray-600 text-white' 
//                     : 'bg-white border-gray-300'
//                 }`}
//                 placeholder="Start date"
//               />
//               <span className="text-gray-400">to</span>
//               <input
//                 type="date"
//                 value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
//                 onChange={(e) => setDateRange(prev => ({ 
//                   ...prev, 
//                   endDate: e.target.value ? new Date(e.target.value) : null 
//                 }))}
//                 className={`flex-1 px-4 py-2 border rounded-lg ${
//                   theme === 'dark' 
//                     ? 'bg-gray-700 border-gray-600 text-white' 
//                     : 'bg-white border-gray-300'
//                 }`}
//                 placeholder="End date"
//               />
//             </div>
//           </div>

//           {/* Field Selection */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-medium">Select Fields</h3>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={selectAllFields}
//                   className={`text-xs px-3 py-1 rounded ${
//                     theme === 'dark' 
//                       ? 'bg-gray-700 hover:bg-gray-600' 
//                       : 'bg-gray-200 hover:bg-gray-300'
//                   }`}
//                 >
//                   Select All
//                 </button>
//                 <button
//                   onClick={deselectAllFields}
//                   className={`text-xs px-3 py-1 rounded ${
//                     theme === 'dark' 
//                       ? 'bg-gray-700 hover:bg-gray-600' 
//                       : 'bg-gray-200 hover:bg-gray-300'
//                   }`}
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
            
//             <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-3 rounded ${
//               theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
//             }`}>
//               {currentConfig.fields.map((field) => (
//                 <label
//                   key={field.id}
//                   className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
//                     selectedFields.has(field.id)
//                       ? theme === 'dark'
//                         ? 'bg-blue-900/30 text-blue-400'
//                         : 'bg-blue-50 text-blue-600'
//                       : theme === 'dark'
//                       ? 'hover:bg-gray-700'
//                       : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedFields.has(field.id)}
//                     onChange={() => toggleField(field.id)}
//                     className="hidden"
//                   />
//                   {selectedFields.has(field.id) ? (
//                     <CheckSquare className="w-4 h-4 flex-shrink-0" />
//                   ) : (
//                     <Square className="w-4 h-4 flex-shrink-0" />
//                   )}
//                   <span className="text-sm truncate" title={field.label}>
//                     {field.label}
//                   </span>
//                   <span className={`text-xs px-1 ml-auto ${
//                     field.type === 'number' ? 'text-blue-500' :
//                     field.type === 'datetime' ? 'text-purple-500' :
//                     field.type === 'boolean' ? 'text-green-500' :
//                     'text-gray-400'
//                   }`}>
//                     {field.type}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Export Button */}
//           <button
//             onClick={handleExport}
//             disabled={isExporting || selectedFields.size === 0}
//             className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium ${
//               isExporting || selectedFields.size === 0
//                 ? 'opacity-50 cursor-not-allowed'
//                 : theme === 'dark' 
//                 ? 'bg-teal-600 hover:bg-teal-700 text-white' 
//                 : 'bg-teal-500 hover:bg-teal-600 text-white'
//             }`}
//           >
//             {isExporting ? (
//               <>
//                 <Loader className="w-5 h-5 animate-spin" />
//                 Exporting... {exportProgress}%
//               </>
//             ) : (
//               <>
//                 <Download className="w-5 h-5" />
//                 Export {selectedFields.size} Fields • {formatFileSize(estimatedSize)}
//               </>
//             )}
//           </button>

//           {selectedFields.size === 0 && (
//             <p className={`text-sm text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
//               Please select at least one field to export
//             </p>
//           )}

//           {/* Progress Bar */}
//           {isExporting && (
//             <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//               <div 
//                 className="h-full bg-teal-500 transition-all duration-300"
//                 style={{ width: `${exportProgress}%` }}
//               />
//             </div>
//           )}
//         </div>

//         {/* Summary Panel */}
//         <div className="space-y-6">
//           {/* Export Summary */}
//           <div className={`p-6 rounded-lg border ${
//             theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//           }`}>
//             <h3 className="font-medium mb-4 flex items-center gap-2">
//               <Settings className="w-4 h-4" />
//               Export Summary
//             </h3>
            
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                   Data Type:
//                 </span>
//                 <span className="font-medium">{currentConfig.name}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                   Format:
//                 </span>
//                 <span className="font-medium flex items-center gap-1">
//                   <FormatIcon className="w-4 h-4" />
//                   {format.toUpperCase()}
//                 </span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                   Records:
//                 </span>
//                 <span className="font-medium">{currentConfig.count.toLocaleString()}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                   Fields:
//                 </span>
//                 <span className="font-medium">{selectedFields.size}</span>
//               </div>
              
//               {dateRange.startDate && dateRange.endDate && (
//                 <div className="flex justify-between">
//                   <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                     Date Range:
//                   </span>
//                   <span className="font-medium text-sm">
//                     {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
//                   </span>
//                 </div>
//               )}
              
//               <div className="pt-4 border-t border-gray-700 dark:border-gray-600">
//                 <div className="flex justify-between font-medium">
//                   <span>Estimated Size:</span>
//                   <span className="text-teal-500">{formatFileSize(estimatedSize)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Export Options */}
//           <div className={`p-6 rounded-lg border ${
//             theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//           }`}>
//             <h3 className="font-medium mb-4">Quick Exports</h3>
            
//             <div className="space-y-2">
//               <button
//                 onClick={() => {
//                   setExportType('messages');
//                   setFormat('csv');
//                   selectAllFields();
//                 }}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
//                   theme === 'dark' 
//                     ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
//                     : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <MessageSquare className="w-4 h-4" />
//                   <span className="text-sm">All Messages (CSV)</span>
//                 </div>
//                 <Download className="w-4 h-4 text-gray-400" />
//               </button>
              
//               <button
//                 onClick={() => {
//                   setExportType('gateways');
//                   setFormat('json');
//                   selectAllFields();
//                 }}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
//                   theme === 'dark' 
//                     ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
//                     : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Server className="w-4 h-4" />
//                   <span className="text-sm">Gateway Status (JSON)</span>
//                 </div>
//                 <Download className="w-4 h-4 text-gray-400" />
//               </button>
              
//               <button
//                 onClick={() => {
//                   const today = new Date();
//                   const weekAgo = new Date(today);
//                   weekAgo.setDate(today.getDate() - 7);
//                   setExportType('messages');
//                   setFormat('excel');
//                   setDateRange({ startDate: weekAgo, endDate: today });
//                   selectAllFields();
//                 }}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
//                   theme === 'dark' 
//                     ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
//                     : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                 }`}
//               >
//                 <div className="flex items-center gap-2">
//                   <Calendar className="w-4 h-4" />
//                   <span className="text-sm">Last 7 Days (Excel)</span>
//                 </div>
//                 <Download className="w-4 h-4 text-gray-400" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Export History Modal */}
//       {showHistory && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden ${
//             theme === 'dark' ? 'bg-gray-800' : 'bg-white'
//           }`}>
//             <div className="p-6 border-b border-gray-700 dark:border-gray-600">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-bold">Export History</h3>
//                 <button
//                   onClick={() => setShowHistory(false)}
//                   className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
//                 >
//                   <XCircle className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-4 overflow-y-auto max-h-[60vh]">
//               {exportHistory.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
//                   <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                     No export history yet
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {exportHistory.map((entry) => {
//                     const config = exportConfigs[entry.type];
//                     const Icon = config?.icon || FileText;
                    
//                     return (
//                       <div
//                         key={entry.id}
//                         className={`p-4 rounded-lg border ${
//                           theme === 'dark' 
//                             ? 'border-gray-700 hover:border-gray-600' 
//                             : 'border-gray-200 hover:border-gray-300'
//                         }`}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <div className={`p-2 rounded-lg ${
//                               theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
//                             }`}>
//                               <Icon className="w-4 h-4" />
//                             </div>
//                             <div>
//                               <div className="font-medium">{config?.name || entry.type}</div>
//                               <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                                 {formatDate(entry.timestamp)}
//                               </div>
//                             </div>
//                           </div>
                          
//                           <div className="text-right">
//                             <div className="font-medium">{entry.format.toUpperCase()}</div>
//                             <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//                               {entry.fields} fields • {entry.records} records
//                             </div>
//                             {entry.size && (
//                               <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
//                                 {formatFileSize(entry.size)}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ExportManager;










import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, FileText, Database, Calendar, Filter,
  CheckSquare, Square, RefreshCw, AlertCircle,
  MessageSquare, Users, Server, Loader,
  Clock, Globe, DollarSign, Tag, XCircle,
  ChevronDown, ChevronUp, Settings
} from 'lucide-react';
import { EnhancedSelect, getThemeClasses } from '../../../components/ServiceManagement/Shared/components';
import { formatFileSize, formatDate } from '../utils/formatters';

const ExportManager = ({
  messages = [],
  templates = [],
  gateways = [],
  rules = [],
  analytics = {},
  loading,
  theme,
  themeClasses,
  onExport
}) => {
  const [exportType, setExportType] = useState('messages');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [filters, setFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Export configurations
  const exportConfigs = useMemo(() => ({
    messages: {
      name: 'SMS Messages',
      icon: MessageSquare,
      count: messages.length,
      fields: [
        { id: 'id', label: 'ID', type: 'string', default: true },
        { id: 'phone_number', label: 'Phone Number', type: 'string', default: true },
        { id: 'recipient_name', label: 'Recipient Name', type: 'string', default: true },
        { id: 'message', label: 'Message', type: 'text', default: true },
        { id: 'status', label: 'Status', type: 'string', default: true },
        { id: 'priority', label: 'Priority', type: 'string', default: false },
        { id: 'created_at', label: 'Created At', type: 'datetime', default: true },
        { id: 'sent_at', label: 'Sent At', type: 'datetime', default: false },
        { id: 'delivered_at', label: 'Delivered At', type: 'datetime', default: false },
        { id: 'gateway_name', label: 'Gateway', type: 'string', default: false },
        { id: 'cost', label: 'Cost', type: 'number', default: true },
        { id: 'character_count', label: 'Characters', type: 'number', default: false }
      ]
    },
    templates: {
      name: 'SMS Templates',
      icon: FileText,
      count: templates.length,
      fields: [
        { id: 'id', label: 'ID', type: 'string', default: true },
        { id: 'name', label: 'Name', type: 'string', default: true },
        { id: 'template_type', label: 'Type', type: 'string', default: true },
        { id: 'message_template', label: 'Template', type: 'text', default: true },
        { id: 'language', label: 'Language', type: 'string', default: false },
        { id: 'usage_count', label: 'Usage', type: 'number', default: true },
        { id: 'is_active', label: 'Active', type: 'boolean', default: false },
        { id: 'created_at', label: 'Created', type: 'datetime', default: true }
      ]
    },
    gateways: {
      name: 'SMS Gateways',
      icon: Server,
      count: gateways.length,
      fields: [
        { id: 'id', label: 'ID', type: 'string', default: true },
        { id: 'name', label: 'Name', type: 'string', default: true },
        { id: 'gateway_type', label: 'Type', type: 'string', default: true },
        { id: 'is_active', label: 'Active', type: 'boolean', default: true },
        { id: 'is_online', label: 'Online', type: 'boolean', default: true },
        { id: 'balance', label: 'Balance', type: 'number', default: true },
        { id: 'success_rate', label: 'Success Rate', type: 'number', default: true },
        { id: 'total_messages_sent', label: 'Total Sent', type: 'number', default: false },
        { id: 'cost_per_message', label: 'Cost/Message', type: 'number', default: false }
      ]
    },
    rules: {
      name: 'Automation Rules',
      icon: Settings,
      count: rules.length,
      fields: [
        { id: 'id', label: 'ID', type: 'string', default: true },
        { id: 'name', label: 'Name', type: 'string', default: true },
        { id: 'rule_type', label: 'Type', type: 'string', default: true },
        { id: 'is_active', label: 'Active', type: 'boolean', default: true },
        { id: 'execution_count', label: 'Executions', type: 'number', default: true },
        { id: 'success_count', label: 'Success', type: 'number', default: false },
        { id: 'priority', label: 'Priority', type: 'string', default: false },
        { id: 'last_executed', label: 'Last Executed', type: 'datetime', default: false }
      ]
    }
  }), [messages, templates, gateways, rules]);

  // Format options
  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileText, mime: 'text/csv' },
    { value: 'json', label: 'JSON', icon: Database, mime: 'application/json' },
    { value: 'excel', label: 'Excel', icon: FileText, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  ];

  const currentConfig = exportConfigs[exportType];
  const FormatIcon = formatOptions.find(f => f.value === format)?.icon || FileText;

  // Initialize selected fields
  useMemo(() => {
    const defaultFields = new Set(
      currentConfig.fields.filter(f => f.default).map(f => f.id)
    );
    setSelectedFields(defaultFields);
  }, [currentConfig]);

  const handleExport = async () => {
    if (selectedFields.size === 0) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Prepare export data
      const exportData = {
        type: exportType,
        format,
        fields: Array.from(selectedFields),
        filters: { ...filters },
        dateRange: dateRange.start && dateRange.end ? {
          start: dateRange.start,
          end: dateRange.end
        } : null
      };

      // Simulate export (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setExportProgress(100);

      // Add to history
      const historyEntry = {
        id: Date.now(),
        type: exportType,
        format,
        fields: selectedFields.size,
        records: currentConfig.count,
        timestamp: new Date().toISOString(),
        size: 1024 * 1024 // 1MB placeholder
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const toggleField = (fieldId) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId);
    } else {
      newSelected.add(fieldId);
    }
    setSelectedFields(newSelected);
  };

  const selectAllFields = () => {
    setSelectedFields(new Set(currentConfig.fields.map(f => f.id)));
  };

  const deselectAllFields = () => {
    setSelectedFields(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className={`ml-3 ${themeClasses.text.secondary}`}>Loading export data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
            <Download className="w-5 h-5 text-teal-500" />
            Data Export Manager
          </h2>
          <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
            Export SMS automation data in various formats
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${themeClasses.button.secondary}`}
        >
          <Database className="w-4 h-4" />
          History ({history.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className={`lg:col-span-2 space-y-6 p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
          {/* Export Type Selection */}
          <div>
            <h3 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Select Data to Export</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(exportConfigs).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = exportType === key;

                return (
                  <button
                    key={key}
                    onClick={() => setExportType(key)}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : themeClasses.border.light
                    } hover:border-teal-500`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-teal-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {config.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${themeClasses.bg.secondary}`}>
                        {config.count} records
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Format */}
          <div>
            <h3 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Export Format</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = format === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value)}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : themeClasses.border.light
                    } hover:border-blue-500`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Date Range (Optional)</h3>
            <div className="flex gap-3">
              <input
                type="date"
                value={dateRange.start || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.input}`}
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.input}`}
              />
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-medium ${themeClasses.text.primary}`}>Select Fields</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllFields}
                  className={`text-xs px-3 py-1 rounded ${themeClasses.button.secondary}`}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllFields}
                  className={`text-xs px-3 py-1 rounded ${themeClasses.button.secondary}`}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-3 rounded ${themeClasses.bg.secondary}`}>
              {currentConfig.fields.map((field) => (
                <label
                  key={field.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedFields.has(field.id)
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field.id)}
                    onChange={() => toggleField(field.id)}
                    className="hidden"
                  />
                  {selectedFields.has(field.id) ? (
                    <CheckSquare className="w-4 h-4 flex-shrink-0 text-blue-500" />
                  ) : (
                    <Square className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  )}
                  <span className={`text-sm truncate ${themeClasses.text.primary}`}>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFields.size === 0}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium ${
              isExporting || selectedFields.size === 0
                ? 'opacity-50 cursor-not-allowed'
                : themeClasses.button.primary
            }`}
          >
            {isExporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Exporting... {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export {selectedFields.size} Fields
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isExporting && (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Export Summary */}
          <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`font-medium mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
              <Settings className="w-4 h-4" />
              Export Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Data Type:</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>
                  {currentConfig.name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Format:</span>
                <span className={`font-medium flex items-center gap-1 ${themeClasses.text.primary}`}>
                  <FormatIcon className="w-4 h-4" />
                  {format.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Records:</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>
                  {currentConfig.count.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className={themeClasses.text.secondary}>Fields:</span>
                <span className={`font-medium ${themeClasses.text.primary}`}>
                  {selectedFields.size}
                </span>
              </div>

              {dateRange.start && dateRange.end && (
                <div className="flex justify-between">
                  <span className={themeClasses.text.secondary}>Date Range:</span>
                  <span className={`font-medium text-sm ${themeClasses.text.primary}`}>
                    {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Exports */}
          <div className={`p-6 rounded-lg border ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className={`font-medium mb-4 ${themeClasses.text.primary}`}>Quick Exports</h3>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setExportType('messages');
                  setFormat('csv');
                  selectAllFields();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  themeClasses.border.light
                } hover:border-teal-500`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className={`text-sm ${themeClasses.text.primary}`}>All Messages (CSV)</span>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setExportType('gateways');
                  setFormat('json');
                  selectAllFields();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  themeClasses.border.light
                } hover:border-teal-500`}
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span className={`text-sm ${themeClasses.text.primary}`}>Gateway Status (JSON)</span>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border ${
                themeClasses.bg.card
              } ${themeClasses.border.light}`}
            >
              <div className={`p-6 border-b ${themeClasses.border.light}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold ${themeClasses.text.primary}`}>Export History</h3>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className={themeClasses.text.secondary}>No export history yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((entry) => {
                      const config = exportConfigs[entry.type];
                      const Icon = config?.icon || FileText;

                      return (
                        <div
                          key={entry.id}
                          className={`p-4 rounded-lg border ${themeClasses.border.light} hover:border-teal-500 transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${themeClasses.bg.secondary}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className={`font-medium ${themeClasses.text.primary}`}>
                                  {config?.name || entry.type}
                                </div>
                                <div className={`text-sm ${themeClasses.text.secondary}`}>
                                  {formatDate(entry.timestamp)}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className={`font-medium ${themeClasses.text.primary}`}>
                                {entry.format.toUpperCase()}
                              </div>
                              <div className={`text-sm ${themeClasses.text.secondary}`}>
                                {entry.fields} fields • {entry.records} records
                              </div>
                              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                {formatFileSize(entry.size)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportManager;