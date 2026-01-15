import React, { useState, useMemo, useCallback } from 'react';
import {
  Zap, Play, Pause, Calendar, Clock, Filter, Search,
  Edit, Trash2, Copy, TestTube, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, XCircle, Loader, Plus,
  BarChart3, Users, Bell, Tag, CalendarDays, TrendingUp
} from 'lucide-react';
import api from '../../../api';
import { 
  EnhancedSelect, 
  DateRangePicker, 
  ConfirmationModal,
  LoadingOverlay,
  StatisticsCard 
} from '../../ServiceManagement/Shared/components'


const AutomationRules = ({ rules, loading, theme, refreshData }) => {
  const [selectedRule, setSelectedRule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedRule, setExpandedRule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Rule types configuration
  const ruleTypes = useMemo(() => ({
    pppoe_creation: { 
      label: 'PPPoE Creation', 
      color: 'blue', 
      icon: Users,
      description: 'Triggered when a new PPPoE client is created'
    },
    hotspot_creation: { 
      label: 'Hotspot Creation', 
      color: 'green', 
      icon: Zap,
      description: 'Triggered when a new hotspot client is created'
    },
    payment_reminder: { 
      label: 'Payment Reminder', 
      color: 'yellow', 
      icon: CalendarDays,
      description: 'Scheduled reminders for upcoming payments'
    },
    plan_expiry: { 
      label: 'Plan Expiry', 
      color: 'orange', 
      icon: AlertCircle,
      description: 'Alerts before plan expiration'
    },
    welcome: { 
      label: 'Welcome Message', 
      color: 'purple', 
      icon: Bell,
      description: 'Welcome message for new clients'
    },
    promotion: { 
      label: 'Promotional', 
      color: 'pink', 
      icon: Tag,
      description: 'Promotional campaigns'
    },
    system_alert: { 
      label: 'System Alert', 
      color: 'red', 
      icon: AlertCircle,
      description: 'System notifications and alerts'
    }
  }), []);

  // Filter rules
  const filteredRules = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return rules.filter(rule => {
      const matchesSearch = searchTerm === '' || 
        rule.name.toLowerCase().includes(searchLower) ||
        rule.description.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && rule.is_active) ||
        (statusFilter === 'inactive' && !rule.is_active);
      
      const matchesType = typeFilter === 'all' || 
        rule.rule_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rules, searchTerm, statusFilter, typeFilter]);

  // Calculate rule statistics
  const ruleStats = useMemo(() => {
    const stats = {
      total: rules.length,
      active: rules.filter(r => r.is_active).length,
      successful: rules.reduce((sum, r) => sum + (r.success_count || 0), 0),
      failed: rules.reduce((sum, r) => sum + (r.failure_count || 0), 0),
      byType: {}
    };
    
    rules.forEach(rule => {
      if (!stats.byType[rule.rule_type]) {
        stats.byType[rule.rule_type] = 0;
      }
      stats.byType[rule.rule_type]++;
    });
    
    return stats;
  }, [rules]);

  // Handle rule actions
  const handleToggleActive = useCallback(async (rule) => {
    try {
      await api.post(`/api/sms/rules/${rule.id}/toggle_active/`);
      refreshData();
    } catch (error) {
      console.error('Toggle active failed:', error);
    }
  }, [refreshData]);

  const handleExecuteRule = useCallback(async (rule) => {
    try {
      const response = await api.post(`/api/sms/rules/${rule.id}/execute/`, {
        context: {
          client_name: 'Test Client',
          phone_number: '+254712345678',
          amount: '1,500',
          plan_name: 'Business 10GB'
        },
        trigger_event: 'manual_test'
      });
      
      setTestResults(response.data);
      setTimeout(() => {
        setTestResults(null);
        refreshData();
      }, 3000);
    } catch (error) {
      console.error('Execute rule failed:', error);
    }
  }, [refreshData]);

  const handleTestTrigger = useCallback(async (rule) => {
    try {
      setIsTesting(true);
      const response = await api.post(`/api/sms/rules/${rule.id}/test_trigger/`, {
        test_data: {
          client_name: 'John Doe',
          username: 'johndoe123',
          phone_number: '+254712345678',
          plan_name: 'Business 10GB',
          amount: '1,500'
        }
      });
      setTestResults(response.data);
      setIsTesting(false);
    } catch (error) {
      console.error('Test trigger failed:', error);
      setIsTesting(false);
    }
  }, []);

  const handleDeleteRule = useCallback(async () => {
    if (!ruleToDelete) return;
    
    try {
      await api.delete(`/api/sms/rules/${ruleToDelete.id}/`);
      refreshData();
      setShowDeleteModal(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Delete rule failed:', error);
    }
  }, [ruleToDelete, refreshData]);

  // Format rule conditions
  const formatConditions = useCallback((conditions) => {
    if (!conditions || Object.keys(conditions).length === 0) {
      return 'No specific conditions';
    }
    
    const parts = [];
    if (conditions.client_type) {
      parts.push(`Client Type: ${conditions.client_type.join(', ')}`);
    }
    if (conditions.tier) {
      parts.push(`Tier: ${conditions.tier.join(', ')}`);
    }
    if (conditions.min_days_active) {
      parts.push(`Min Days Active: ${conditions.min_days_active}`);
    }
    
    return parts.join(' • ');
  }, []);

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading automation rules..." theme={theme} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Automation Rules
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure automatic SMS triggers based on events and conditions
          </p>
        </div>
        
        <button
          onClick={() => setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total Rules"
          value={ruleStats.total}
          icon={Zap}
          theme={theme}
          format="number"
        />
        
        <StatisticsCard
          title="Active Rules"
          value={ruleStats.active}
          change={ruleStats.total > 0 ? 
            (ruleStats.active / ruleStats.total * 100) : 0
          }
          icon={CheckCircle}
          theme={theme}
          trend="up"
          format="percentage"
        />
        
        <StatisticsCard
          title="Successful Executions"
          value={ruleStats.successful}
          icon={TrendingUp}
          theme={theme}
          format="number"
        />
        
        <StatisticsCard
          title="Failed Executions"
          value={ruleStats.failed}
          icon={XCircle}
          theme={theme}
          trend="down"
          format="number"
        />
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} size={16} />
            <input
              type="text"
              placeholder="Search rules..."
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
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' }
            ]}
            theme={theme}
          />
          
          <EnhancedSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All Types' },
              ...Object.entries(ruleTypes).map(([value, config]) => ({
                value,
                label: config.label,
                icon: <config.icon className="w-4 h-4" />
              }))
            ]}
            theme={theme}
          />
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => {
          const ruleConfig = ruleTypes[rule.rule_type] || ruleTypes.system_alert;
          const RuleIcon = ruleConfig.icon;
          
          return (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } ${expandedRule === rule.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Rule Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${ruleConfig.color}-100 text-${ruleConfig.color}-600`}>
                    <RuleIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{rule.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        rule.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full bg-${ruleConfig.color}-100 text-${ruleConfig.color}-800`}>
                        {ruleConfig.label}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {rule.description || ruleConfig.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className={`flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        Created: {new Date(rule.created_at).toLocaleDateString()}
                      </span>
                      
                      <span className={`flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <BarChart3 className="w-3 h-3" />
                        Executed: {rule.execution_count || 0} times
                      </span>
                      
                      <span className={`flex items-center gap-1 ${
                        rule.success_rate >= 80 ? 'text-green-600' :
                        rule.success_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        Success: {rule.success_rate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTestTrigger(rule)}
                    disabled={isTesting}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isTesting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Test trigger"
                  >
                    {isTesting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleExecuteRule(rule)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Execute now"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={rule.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {rule.is_active ? (
                      <Pause className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Play className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setExpandedRule(expandedRule === rule.id ? null : rule.id);
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {expandedRule === rule.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Rule Details */}
              {expandedRule === rule.id && (
                <div className={`mt-4 pt-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rule Configuration */}
                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Rule Configuration
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Template:
                            </span>
                            <span>{rule.template_name || 'Not set'}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Priority:
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              rule.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              rule.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.priority}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Delay:
                            </span>
                            <span>{rule.delay_minutes || 0} minutes</span>
                          </div>
                          
                          {rule.schedule_cron && (
                            <div className="flex justify-between">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                Schedule:
                              </span>
                              <span className="font-mono">{rule.schedule_cron}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Conditions */}
                      {rule.conditions && Object.keys(rule.conditions).length > 0 && (
                        <div>
                          <h4 className={`font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Conditions
                          </h4>
                          <pre className={`text-xs p-2 rounded ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            {JSON.stringify(rule.conditions, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                    
                    {/* Rule Actions */}
                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Rule Actions
                        </h4>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setIsEditing(rule)}
                            className={`px-3 py-1 text-sm rounded ${
                              theme === 'dark' 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            <Edit className="w-3 h-3 inline mr-1" />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => {
                              // Duplicate rule logic
                            }}
                            className={`px-3 py-1 text-sm rounded ${
                              theme === 'dark' 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            <Copy className="w-3 h-3 inline mr-1" />
                            Duplicate
                          </button>
                          
                          <button
                            onClick={() => {
                              setRuleToDelete(rule);
                              setShowDeleteModal(true);
                            }}
                            className={`px-3 py-1 text-sm rounded ${
                              theme === 'dark' 
                                ? 'bg-red-700 hover:bg-red-800 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Recent Activity */}
                      <div>
                        <h4 className={`font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Recent Activity
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Last Executed:
                            </span>
                            <span>
                              {rule.last_executed 
                                ? new Date(rule.last_executed).toLocaleString()
                                : 'Never'
                              }
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                              Success Rate:
                            </span>
                            <div className="flex items-center gap-2">
                              <div className={`w-16 h-2 rounded-full ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                              }`}>
                                <div 
                                  className={`h-2 rounded-full ${
                                    rule.success_rate >= 80 ? 'bg-green-500' :
                                    rule.success_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(rule.success_rate || 0, 100)}%` }}
                                />
                              </div>
                              <span>{rule.success_rate || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRules.length === 0 && (
        <div className={`text-center py-12 rounded-lg border ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
        }`}>
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No automation rules found</h3>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No rules match your search criteria'
              : 'Create your first automation rule to get started'
            }
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            Create First Rule
          </button>
        </div>
      )}

      {/* Test Results Modal */}
      {testResults && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}>
          <div className={`rounded-lg max-w-md w-full p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Test Results
              </h3>
              <button
                onClick={() => setTestResults(null)}
                className={theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {testResults.success ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium mb-2">Test successful!</p>
                <pre className={`text-xs p-2 rounded text-left ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="font-medium mb-2">Test failed</p>
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {testResults.error || 'Unknown error'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRuleToDelete(null);
        }}
        onConfirm={handleDeleteRule}
        title="Delete Automation Rule"
        message={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Rule"
        cancelText="Cancel"
        type="danger"
        theme={theme}
      />
    </div>
  );
};

export default AutomationRules;