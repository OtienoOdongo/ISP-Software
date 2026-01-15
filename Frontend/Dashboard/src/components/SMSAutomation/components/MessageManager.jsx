import React, { useState, useMemo, useCallback } from 'react';
import {
  MessageSquare, Send, Clock, CheckCircle, XCircle,
  AlertCircle, Filter, Search, Download, Trash2,
  RefreshCw, Eye, Calendar, Phone, User, Loader,
  ChevronDown, ChevronUp, BarChart3, Mail
} from 'lucide-react';
import api from '../../../api';
import { EnhancedSelect, DateRangePicker, ConfirmationModal } from '../../ServiceManagement/Shared/components'


const MessageManager = ({ messages, loading, theme, refreshData }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());

  // Available statuses
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Statuses', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'sent', label: 'Sent', color: 'blue' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
  ], []);

  // Filter messages with optimized algorithm
  const filteredMessages = useMemo(() => {
    const startTime = performance.now();
    
    let result = messages;
    
    // Apply date filter first (most selective)
    if (dateRange.startDate || dateRange.endDate) {
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
      
      result = result.filter(message => {
        const messageDate = new Date(message.created_at);
        if (start && messageDate < start) return false;
        if (end && messageDate > end) return false;
        return true;
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(message => message.status === statusFilter);
    }
    
    // Apply search filter (least selective, applied last)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(message => 
        message.phone_number.toLowerCase().includes(searchLower) ||
        message.recipient_name?.toLowerCase().includes(searchLower) ||
        message.message.toLowerCase().includes(searchLower)
      );
    }
    
    const endTime = performance.now();
    console.log(`Filtered ${messages.length} messages in ${endTime - startTime}ms`);
    
    return result;
  }, [messages, searchTerm, statusFilter, dateRange]);

  // Get status badge
  const getStatusBadge = useCallback((status) => {
    const config = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <span className={`px-2 py-1 rounded-full text-xs bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  }, [statusOptions]);

  // Format phone number
  const formatPhone = useCallback((phone) => {
    if (!phone) return 'N/A';
    // Format Kenyan numbers
    if (phone.startsWith('254')) {
      return `+${phone}`;
    }
    return phone;
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }, []);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action) => {
    if (selectedMessages.size === 0) return;
    
    try {
      const messageIds = Array.from(selectedMessages);
      
      switch (action) {
        case 'retry':
          await Promise.all(
            messageIds.map(id => 
              api.post(`/api/sms/messages/${id}/retry/`)
            )
          );
          break;
          
        case 'cancel':
          await Promise.all(
            messageIds.map(id => 
              api.post(`/api/sms/messages/${id}/cancel/`)
            )
          );
          break;
          
        case 'delete':
          await Promise.all(
            messageIds.map(id => 
              api.delete(`/api/sms/messages/${id}/`)
            )
          );
          break;
      }
      
      setSelectedMessages(new Set());
      refreshData();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [selectedMessages, refreshData]);

  // Export messages
  const exportMessages = useCallback(async () => {
    try {
      const response = await api.get('/api/sms/messages/export/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sms_messages_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-green-500" />
            SMS Message Management
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            View and manage all sent SMS messages
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportMessages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            }`}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} size={16} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg w-full ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
            />
          </div>
          
          <EnhancedSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            theme={theme}
          />
          
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
            theme={theme}
            placeholder="Date range"
          />
          
          {selectedMessages.size > 0 && (
            <EnhancedSelect
              value={bulkAction}
              onChange={(value) => {
                setBulkAction(value);
                handleBulkAction(value);
              }}
              options={[
                { value: 'retry', label: `Retry (${selectedMessages.size})` },
                { value: 'cancel', label: `Cancel (${selectedMessages.size})` },
                { value: 'delete', label: `Delete (${selectedMessages.size})` }
              ]}
              theme={theme}
              placeholder="Bulk actions..."
            />
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg text-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-2xl font-bold">{filteredMessages.length}</div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Messages
          </div>
        </div>
        
        <div className={`p-3 rounded-lg text-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-2xl font-bold text-green-500">
            {filteredMessages.filter(m => m.status === 'delivered').length}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Delivered
          </div>
        </div>
        
        <div className={`p-3 rounded-lg text-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-2xl font-bold text-red-500">
            {filteredMessages.filter(m => m.status === 'failed').length}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Failed
          </div>
        </div>
        
        <div className={`p-3 rounded-lg text-center ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="text-2xl font-bold text-yellow-500">
            {filteredMessages.filter(m => m.status === 'pending').length}
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Pending
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className={`rounded-lg border overflow-hidden ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className={`${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMessages.size === filteredMessages.length && filteredMessages.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMessages(new Set(filteredMessages.map(m => m.id)));
                      } else {
                        setSelectedMessages(new Set());
                      }
                    }}
                    className={`rounded ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className={`divide-y ${
              theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {filteredMessages.slice(0, 50).map((message) => (
                <tr 
                  key={message.id}
                  className={`hover:${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} ${
                    selectedMessages.has(message.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedMessages);
                        if (e.target.checked) {
                          newSelected.add(message.id);
                        } else {
                          newSelected.delete(message.id);
                        }
                        setSelectedMessages(newSelected);
                      }}
                      className={`rounded ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{message.recipient_name || 'Unknown'}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatPhone(message.phone_number)}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 max-w-xs">
                    <div className="truncate">{message.message}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {message.message_parts} part(s) • {message.character_count} chars
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    {getStatusBadge(message.status)}
                    {message.gateway_name && (
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        via {message.gateway_name}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>{formatDate(message.created_at)}</div>
                    {message.sent_at && (
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sent: {formatDate(message.sent_at)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    {message.cost ? (
                      <div>
                        <div>{message.currency} {parseFloat(message.cost).toFixed(4)}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Est: {message.currency} {message.estimated_cost?.toFixed(4)}
                        </div>
                      </div>
                    ) : (
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Not calculated
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setExpandedMessage(expandedMessage === message.id ? null : message.id);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="View details"
                      >
                        {expandedMessage === message.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {message.status === 'failed' && (
                        <button
                          onClick={() => api.post(`/api/sms/messages/${message.id}/retry/`)}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600"
                          title="Retry"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      
                      {message.status === 'pending' && (
                        <button
                          onClick={() => api.post(`/api/sms/messages/${message.id}/cancel/`)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Expanded Message Details */}
        {expandedMessage && (
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            {(() => {
              const message = filteredMessages.find(m => m.id === expandedMessage);
              if (!message) return null;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Message Details</h4>
                      <pre className={`text-sm p-3 rounded whitespace-pre-wrap ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {message.message}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Delivery Information</h4>
                      <div className="space-y-2">
                        {message.gateway_response && (
                          <div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Gateway Response:
                            </span>
                            <pre className={`text-xs p-2 rounded mt-1 ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              {JSON.stringify(message.gateway_response, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {message.status_history && message.status_history.length > 0 && (
                          <div>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Status History:
                            </span>
                            <div className="space-y-1 mt-1">
                              {message.status_history.slice(-5).map((history, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <div className={`w-2 h-2 rounded-full ${
                                    history.new_status === 'delivered' ? 'bg-green-500' :
                                    history.new_status === 'failed' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                  }`} />
                                  <span>{history.new_status}</span>
                                  <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                                    at {new Date(history.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {Math.min(filteredMessages.length, 50)} of {filteredMessages.length} messages
        </div>
        
        <div className="flex items-center gap-2">
          <button className={`px-3 py-1 rounded ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}>
            Previous
          </button>
          <span className="px-3 py-1">1</span>
          <button className={`px-3 py-1 rounded ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}>
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
        onConfirm={() => {
          // Handle delete
          setShowDeleteModal(false);
        }}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        theme={theme}
      />
    </div>
  );
};

export default MessageManager;