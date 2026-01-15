import React, { useState, useMemo, useCallback } from 'react';
import {
  Download, FileText, Database, Calendar, Filter,
  Settings, CheckSquare, Square, ChevronDown,
  RefreshCw, AlertCircle, CheckCircle, XCircle,
  BarChart3, MessageSquare, Users, Server
} from 'lucide-react';
import api from '../../../api';
import { 
  EnhancedSelect,
  DateRangePicker,
  LoadingOverlay,
  ConfirmationModal
} from '../../ServiceManagement/Shared/components'


const ExportManager = ({ messages, templates, gateways, rules, theme }) => {
  const [exportType, setExportType] = useState('messages');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [format, setFormat] = useState('csv');
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [filters, setFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Export configurations
  const exportConfigs = useMemo(() => ({
    messages: {
      name: 'SMS Messages',
      icon: MessageSquare,
      fields: [
        { id: 'id', label: 'ID', default: true },
        { id: 'phone_number', label: 'Phone Number', default: true },
        { id: 'recipient_name', label: 'Recipient Name', default: true },
        { id: 'message', label: 'Message', default: true },
        { id: 'status', label: 'Status', default: true },
        { id: 'priority', label: 'Priority', default: false },
        { id: 'created_at', label: 'Created At', default: true },
        { id: 'sent_at', label: 'Sent At', default: false },
        { id: 'delivered_at', label: 'Delivered At', default: false },
        { id: 'gateway_name', label: 'Gateway', default: false },
        { id: 'cost', label: 'Cost', default: true },
        { id: 'character_count', label: 'Character Count', default: false },
        { id: 'message_parts', label: 'Message Parts', default: false }
      ],
      filters: [
        { id: 'status', label: 'Status', type: 'select', options: ['all', 'sent', 'delivered', 'failed', 'pending'] },
        { id: 'gateway', label: 'Gateway', type: 'select', options: gateways.map(g => g.id) },
        { id: 'priority', label: 'Priority', type: 'select', options: ['all', 'urgent', 'high', 'normal', 'low'] }
      ]
    },
    templates: {
      name: 'SMS Templates',
      icon: FileText,
      fields: [
        { id: 'id', label: 'ID', default: true },
        { id: 'name', label: 'Name', default: true },
        { id: 'template_type', label: 'Type', default: true },
        { id: 'message_template', label: 'Template', default: true },
        { id: 'character_count', label: 'Character Count', default: false },
        { id: 'usage_count', label: 'Usage Count', default: true },
        { id: 'is_active', label: 'Active', default: false },
        { id: 'created_at', label: 'Created At', default: true },
        { id: 'variables', label: 'Variables', default: false }
      ]
    },
    gateways: {
      name: 'SMS Gateways',
      icon: Server,
      fields: [
        { id: 'id', label: 'ID', default: true },
        { id: 'name', label: 'Name', default: true },
        { id: 'gateway_type', label: 'Type', default: true },
        { id: 'is_active', label: 'Active', default: true },
        { id: 'is_online', label: 'Online', default: true },
        { id: 'balance', label: 'Balance', default: true },
        { id: 'success_rate', label: 'Success Rate', default: true },
        { id: 'total_messages_sent', label: 'Total Sent', default: false },
        { id: 'cost_per_message', label: 'Cost/Message', default: false },
        { id: 'last_used', label: 'Last Used', default: false }
      ]
    },
    rules: {
      name: 'Automation Rules',
      icon: Settings,
      fields: [
        { id: 'id', label: 'ID', default: true },
        { id: 'name', label: 'Name', default: true },
        { id: 'rule_type', label: 'Type', default: true },
        { id: 'is_active', label: 'Active', default: true },
        { id: 'execution_count', label: 'Executions', default: true },
        { id: 'success_count', label: 'Success Count', default: false },
        { id: 'failure_count', label: 'Failure Count', default: false },
        { id: 'success_rate', label: 'Success Rate', default: true },
        { id: 'last_executed', label: 'Last Executed', default: false },
        { id: 'created_at', label: 'Created At', default: true }
      ]
    }
  }), [gateways]);

  // Initialize selected fields
  useMemo(() => {
    const config = exportConfigs[exportType];
    const defaultFields = new Set(
      config.fields.filter(f => f.default).map(f => f.id)
    );
    setSelectedFields(defaultFields);
  }, [exportType, exportConfigs]);

  // Available formats
  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format' }
  ];

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      
      const exportData = {
        type: exportType,
        format,
        fields: Array.from(selectedFields),
        filters: { ...filters },
        date_range: dateRange
      };

      let endpoint, response;
      
      switch (exportType) {
        case 'messages':
          endpoint = '/api/sms/messages/export/';
          response = await api.get(endpoint, {
            params: {
              format,
              fields: exportData.fields.join(','),
              ...exportData.filters,
              start_date: dateRange.startDate?.toISOString(),
              end_date: dateRange.endDate?.toISOString()
            },
            responseType: 'blob'
          });
          break;
          
        default:
          // For other types, we need to implement separate endpoints
          // For now, use a generic approach
          const data = {
            messages,
            templates,
            gateways,
            rules
          }[exportType];
          
          // Convert to CSV
          const fields = exportConfigs[exportType].fields.filter(f => selectedFields.has(f.id));
          const csv = convertToCSV(data, fields);
          response = { data: new Blob([csv], { type: 'text/csv' }) };
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${exportType}_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Add to history
      const historyEntry = {
        id: Date.now(),
        type: exportType,
        format,
        fields: exportData.fields.length,
        timestamp: new Date().toISOString(),
        size: response.data.size || 'N/A'
      };
      setExportHistory(prev => [historyEntry, ...prev.slice(0, 9)]);

      setIsExporting(false);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  }, [exportType, format, selectedFields, filters, dateRange, messages, templates, gateways, rules, exportConfigs]);

  // Convert data to CSV
  const convertToCSV = (data, fields) => {
    if (!data || data.length === 0) return '';
    
    // Headers
    const headers = fields.map(f => f.label).join(',');
    
    // Rows
    const rows = data.map(item => {
      return fields.map(field => {
        const value = item[field.id];
        // Handle special cases
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        // Escape commas in CSV
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',');
    });
    
    return [headers, ...rows].join('\n');
  };

  // Toggle field selection
  const toggleField = useCallback((fieldId) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldId)) {
      newSelected.delete(fieldId);
    } else {
      newSelected.add(fieldId);
    }
    setSelectedFields(newSelected);
  }, [selectedFields]);

  // Select all fields
  const selectAllFields = useCallback(() => {
    const config = exportConfigs[exportType];
    const allFields = new Set(config.fields.map(f => f.id));
    setSelectedFields(allFields);
  }, [exportType, exportConfigs]);

  // Deselect all fields
  const deselectAllFields = useCallback(() => {
    setSelectedFields(new Set());
  }, []);

  // Current configuration
  const currentConfig = exportConfigs[exportType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Download className="w-6 h-6 text-teal-500" />
            Data Export Manager
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Export SMS automation data in various formats
          </p>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <Database className="w-4 h-4" />
          Export History ({exportHistory.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className={`lg:col-span-2 space-y-6 p-6 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Export Type Selection */}
          <div>
            <h3 className="font-medium mb-3">Select Data to Export</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(exportConfigs).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setExportType(key)}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      exportType === key
                        ? theme === 'dark'
                          ? 'border-teal-500 bg-teal-900/20'
                          : 'border-teal-500 bg-teal-50'
                        : theme === 'dark'
                        ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className={`w-6 h-6 ${
                        exportType === key ? 'text-teal-500' : 'text-gray-400'
                      }`} />
                      <span className="text-sm font-medium">{config.name}</span>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {exportType === key ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Format */}
          <div>
            <h3 className="font-medium mb-3">Export Format</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    format === option.value
                      ? theme === 'dark'
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-blue-500 bg-blue-50'
                      : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="font-medium mb-3">Date Range</h3>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
              theme={theme}
              className="w-full"
            />
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Leave empty to export all data
            </p>
          </div>

          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Select Fields</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllFields}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllFields}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 rounded ${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              {currentConfig.fields.map((field) => (
                <label
                  key={field.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                    selectedFields.has(field.id)
                      ? theme === 'dark'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.has(field.id)}
                    onChange={() => toggleField(field.id)}
                    className="hidden"
                  />
                  {selectedFields.has(field.id) ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span className="text-sm">{field.label}</span>
                  {field.default && (
                    <span className={`text-xs px-1 rounded ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      Default
                    </span>
                  )}
                </label>
              ))}
            </div>
            
            <div className={`mt-3 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {selectedFields.size} of {currentConfig.fields.length} fields selected
            </div>
          </div>
        </div>

        {/* Export Preview and Actions */}
        <div className="space-y-6">
          {/* Export Summary */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-medium mb-4">Export Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Data Type:
                </span>
                <span className="font-medium">{currentConfig.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Format:
                </span>
                <span className="font-medium">{format.toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Fields Selected:
                </span>
                <span className="font-medium">{selectedFields.size}</span>
              </div>
              
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  Date Range:
                </span>
                <span className="font-medium">
                  {dateRange.startDate 
                    ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate?.toLocaleDateString() || 'Now'}`
                    : 'All dates'
                  }
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-700 dark:border-gray-600">
                <div className="flex justify-between font-medium">
                  <span>Estimated Size:</span>
                  <span>~{Math.round(selectedFields.size * (exportType === 'messages' ? messages.length : 50) * 0.1)} KB</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={isExporting || selectedFields.size === 0}
              className={`w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
                isExporting || selectedFields.size === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } ${
                theme === 'dark' 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-teal-500 hover:bg-teal-600 text-white'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
            
            {selectedFields.size === 0 && (
              <p className={`mt-3 text-sm text-center ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                Please select at least one field to export
              </p>
            )}
          </div>

          {/* Quick Exports */}
          <div className={`p-6 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-medium mb-4">Quick Exports</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setExportType('messages');
                  setFormat('csv');
                  selectAllFields();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>All Messages (CSV)</span>
                </div>
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  setExportType('gateways');
                  setFormat('json');
                  selectAllFields();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span>Gateway Status (JSON)</span>
                </div>
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(today.getDate() - 7);
                  setExportType('messages');
                  setFormat('excel');
                  setDateRange({ startDate: weekAgo, endDate: today });
                  selectAllFields();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Last 7 Days (Excel)</span>
                </div>
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export History Modal */}
      {showHistory && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
          <div className={`rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-700 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Export History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {exportHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    No export history yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exportHistory.map((entry) => {
                    const config = exportConfigs[entry.type];
                    const Icon = config?.icon || FileText;
                    
                    return (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' 
                            ? 'border-gray-700 hover:border-gray-600' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{config?.name || entry.type}</div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(entry.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{entry.format.toUpperCase()}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {entry.fields} fields
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className={`p-4 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setExportHistory([])}
                className={`w-full px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportManager;