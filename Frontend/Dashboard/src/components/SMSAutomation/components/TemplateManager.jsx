import React, { useState, useMemo, useCallback } from 'react';
import {
  FileText, Edit, Trash2, Copy, Search, Filter,
  Eye, EyeOff, CheckCircle, XCircle, Plus, Loader,
  BarChart3, Users, Calendar, Bell, Tag, Globe
} from 'lucide-react';
import api from '../../../api';
import { EnhancedSelect, ConfirmationModal, LoadingOverlay } from '../../ServiceManagement/Shared/components'


const TemplateManager = ({ templates, loading, theme, refreshData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // Extract unique categories and types
  const { categories, types } = useMemo(() => {
    const uniqueCategories = new Set();
    const uniqueTypes = new Set();
    
    templates.forEach(template => {
      if (template.category) uniqueCategories.add(template.category);
      if (template.template_type) uniqueTypes.add(template.template_type);
    });
    
    return {
      categories: Array.from(uniqueCategories),
      types: Array.from(uniqueTypes)
    };
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.message_template.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        template.category === categoryFilter;
      
      const matchesType = typeFilter === 'all' || 
        template.template_type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [templates, searchTerm, categoryFilter, typeFilter]);

  // Get template type icon
  const getTemplateIcon = useCallback((type) => {
    const iconMap = {
      welcome: Users,
      pppoe_credentials: Globe,
      payment_reminder: Bell,
      plan_expiry: Calendar,
      promotional: Tag,
      system: BarChart3
    };
    return iconMap[type] || FileText;
  }, []);

  // Get template type color
  const getTemplateColor = useCallback((type) => {
    const colorMap = {
      welcome: 'green',
      pppoe_credentials: 'blue',
      payment_reminder: 'yellow',
      plan_expiry: 'orange',
      promotional: 'purple',
      system: 'red'
    };
    return colorMap[type] || 'gray';
  }, []);

  // Handle template actions
  const handleDuplicate = useCallback(async (template) => {
    try {
      await api.post(`/api/sms/templates/${template.id}/duplicate/`);
      refreshData();
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  }, [refreshData]);

  const handleDelete = useCallback(async () => {
    if (!templateToDelete) return;
    
    try {
      await api.delete(`/api/sms/templates/${templateToDelete.id}/`);
      refreshData();
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [templateToDelete, refreshData]);

  const handleTestRender = useCallback(async (template) => {
    try {
      const response = await api.post(`/api/sms/templates/${template.id}/test_render/`, {
        test_data: {
          client_name: 'John Doe',
          username: 'johndoe123',
          phone_number: '+254712345678',
          plan_name: 'Business 10GB',
          amount: '1,500'
        }
      });
      
      // Show preview modal with results
      setSelectedTemplate({
        ...template,
        test_results: response.data
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Test render failed:', error);
    }
  }, []);

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading templates..." theme={theme} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-500" />
            SMS Template Management
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage SMS message templates with variables
          </p>
        </div>
        
        <button
          onClick={() => setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} size={16} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-2 border rounded-lg w-full ${
              theme === 'dark' 
                ? 'bg-gray-700/50 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
        </div>
        
        <EnhancedSelect
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'all', label: 'All Categories' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          theme={theme}
          className="min-w-[180px]"
        />
        
        <EnhancedSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: 'all', label: 'All Types' },
            ...types.map(type => ({ 
              value: type, 
              label: type.replace('_', ' ')
            }))
          ]}
          theme={theme}
          className="min-w-[180px]"
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const TemplateIcon = getTemplateIcon(template.template_type);
          const color = getTemplateColor(template.template_type);
          
          return (
            <div
              key={template.id}
              className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
                    <TemplateIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {template.template_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {template.is_system && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      System
                    </span>
                  )}
                  {template.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2 mb-4">
                <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {template.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {template.language.toUpperCase()}
                  </span>
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {template.character_count} chars
                  </span>
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Used {template.usage_count} times
                  </span>
                </div>
              </div>

              {/* Template Variables */}
              {template.variables && Object.keys(template.variables).length > 0 && (
                <div className="mb-4">
                  <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Variables:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(template.variables).slice(0, 3).map((variable, index) => (
                      <span
                        key={index}
                        className={`px-2 py-0.5 text-xs rounded ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {variable}
                      </span>
                    ))}
                    {Object.keys(template.variables).length > 3 && (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{Object.keys(template.variables).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Template Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleTestRender(template)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
                
                <button
                  onClick={() => handleDuplicate(template)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="w-3 h-3" />
                  Duplicate
                </button>
                
                {!template.is_system && (
                  <button
                    onClick={() => {
                      setTemplateToDelete(template);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description={searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
            ? "No templates match your search criteria"
            : "Create your first SMS template to get started"
          }
          actionLabel="Create Template"
          onAction={() => setIsEditing(true)}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Template"
        cancelText="Cancel"
        type="danger"
        theme={theme}
      />
    </div>
  );
};

export default TemplateManager;