import React, { useState, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../../api'
import { EnhancedSelect, ConfirmationModal } from '../../ServiceManagement/Shared/components'

const TaxConfigurationPanel = ({ reconciliationData, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [deleteTax, setDeleteTax] = useState(null);
  const [loading, setLoading] = useState(false);

  const [taxForm, setTaxForm] = useState({
    name: '',
    tax_type: 'custom',
    rate: '',
    description: '',
    applies_to: 'revenue',
    access_type: 'all',
    is_enabled: true,
    is_included_in_price: false
  });

  const { tax_configuration } = reconciliationData;

  const taxTypeOptions = [
    { value: 'vat', label: 'VAT' },
    { value: 'withholding', label: 'Withholding Tax' },
    { value: 'custom', label: 'Custom Tax' }
  ];

  const appliesToOptions = [
    { value: 'revenue', label: 'Revenue Only' },
    { value: 'expenses', label: 'Expenses Only' },
    { value: 'both', label: 'Both Revenue & Expenses' }
  ];

  const accessTypeOptions = [
    { value: 'all', label: 'All Access Types' },
    { value: 'hotspot', label: 'Hotspot Only' },
    { value: 'pppoe', label: 'PPPoE Only' },
    { value: 'both', label: 'Both Access Types' }
  ];

  const handleTaxInputChange = useCallback((field, value) => {
    setTaxForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetTaxForm = useCallback(() => {
    setTaxForm({
      name: '',
      tax_type: 'custom',
      rate: '',
      description: '',
      applies_to: 'revenue',
      access_type: 'all',
      is_enabled: true,
      is_included_in_price: false
    });
    setEditingTax(null);
  }, []);

  const handleSaveTax = useCallback(async () => {
    if (!taxForm.name.trim()) {
      toast.error('Tax name is required');
      return;
    }

    const rate = parseFloat(taxForm.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Tax rate must be a number between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const taxData = {
        ...taxForm,
        rate: rate
      };

      if (editingTax) {
        await api.patch(`/api/payments/taxes/${editingTax.id}/`, taxData);
        toast.success('Tax updated successfully');
      } else {
        await api.post('/api/payments/taxes/', taxData);
        toast.success('Tax created successfully');
      }

      setShowTaxModal(false);
      resetTaxForm();
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save tax configuration';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [taxForm, editingTax, resetTaxForm, onRefresh]);

  const handleEditTax = useCallback((tax) => {
    setEditingTax(tax);
    setTaxForm({
      name: tax.name,
      tax_type: tax.tax_type,
      rate: tax.rate.toString(),
      description: tax.description || '',
      applies_to: tax.applies_to,
      access_type: tax.access_type,
      is_enabled: tax.is_enabled,
      is_included_in_price: tax.is_included_in_price
    });
    setShowTaxModal(true);
  }, []);

  const handleDeleteTax = useCallback(async () => {
    if (!deleteTax) return;

    if (tax_configuration.length <= 1) {
      toast.error('You must have at least one tax configured');
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/payments/taxes/${deleteTax.id}/`);
      toast.success('Tax deleted successfully');
      setDeleteTax(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete tax');
    } finally {
      setLoading(false);
    }
  }, [deleteTax, tax_configuration, onRefresh]);

  const handleToggleTax = useCallback(async (tax, enabled) => {
    try {
      await api.patch(`/api/payments/taxes/${tax.id}/`, { is_enabled: enabled });
      toast.success(`Tax ${enabled ? 'enabled' : 'disabled'} successfully`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update tax status');
    }
  }, [onRefresh]);

  const TaxFormModal = () => (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`${cardClass} w-full max-w-2xl transform transition-all`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {editingTax ? 'Edit Tax' : 'Add New Tax'}
              </h3>
              <button
                onClick={() => {
                  setShowTaxModal(false);
                  resetTaxForm();
                }}
                className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Tax Name *
                </label>
                <input
                  type="text"
                  value={taxForm.name}
                  onChange={(e) => handleTaxInputChange('name', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="e.g., VAT, Service Tax"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Tax Type
                </label>
                <EnhancedSelect
                  value={taxForm.tax_type}
                  onChange={(value) => handleTaxInputChange('tax_type', value)}
                  options={taxTypeOptions}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Tax Rate (%) *
                </label>
                <input
                  type="number"
                  value={taxForm.rate}
                  onChange={(e) => handleTaxInputChange('rate', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="e.g., 16 for 16%"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Applies To
                </label>
                <EnhancedSelect
                  value={taxForm.applies_to}
                  onChange={(value) => handleTaxInputChange('applies_to', value)}
                  options={appliesToOptions}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Access Type
                </label>
                <EnhancedSelect
                  value={taxForm.access_type}
                  onChange={(value) => handleTaxInputChange('access_type', value)}
                  options={accessTypeOptions}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={taxForm.description}
                  onChange={(e) => handleTaxInputChange('description', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_enabled"
                  checked={taxForm.is_enabled}
                  onChange={(e) => handleTaxInputChange('is_enabled', e.target.checked)}
                  className={`h-4 w-4 ${
                    theme === "dark" 
                      ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
                      : "text-blue-600 focus:ring-blue-500 border-gray-300"
                  } rounded`}
                />
                <label htmlFor="is_enabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Enabled
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_included_in_price"
                  checked={taxForm.is_included_in_price}
                  onChange={(e) => handleTaxInputChange('is_included_in_price', e.target.checked)}
                  className={`h-4 w-4 ${
                    theme === "dark" 
                      ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" 
                      : "text-blue-600 focus:ring-blue-500 border-gray-300"
                  } rounded`}
                />
                <label htmlFor="is_included_in_price" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Tax included in price
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowTaxModal(false);
                resetTaxForm();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === "dark" 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTax}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <FaSave className="mr-2" />
                  {editingTax ? 'Update Tax' : 'Create Tax'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const TaxCard = ({ tax }) => (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${
      theme === "dark" 
        ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" 
        : "bg-white border-gray-200 hover:bg-gray-50"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <h4 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {tax.name}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            theme === "dark" 
              ? "bg-blue-900 text-blue-300" 
              : "bg-blue-100 text-blue-800"
          }`}>
            {tax.rate}%
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleTax(tax, !tax.is_enabled)}
            className={`p-1 rounded ${
              tax.is_enabled 
                ? "text-green-500 hover:text-green-600" 
                : "text-gray-400 hover:text-gray-500"
            }`}
            title={tax.is_enabled ? 'Disable Tax' : 'Enable Tax'}
          >
            {tax.is_enabled ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => handleEditTax(tax)}
            className={`p-1 rounded ${
              theme === "dark" 
                ? "text-blue-400 hover:text-blue-300" 
                : "text-blue-600 hover:text-blue-800"
            }`}
            title="Edit Tax"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setDeleteTax(tax)}
            className="p-1 rounded text-red-500 hover:text-red-600"
            title="Delete Tax"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={textSecondaryClass}>Type</span>
          <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
            {tax.tax_type === 'vat' ? 'VAT' : tax.tax_type === 'withholding' ? 'Withholding Tax' : 'Custom'}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={textSecondaryClass}>Applies To</span>
          <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
            {tax.applies_to === 'revenue' ? 'Revenue' : tax.applies_to === 'expenses' ? 'Expenses' : 'Both'}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={textSecondaryClass}>Access Type</span>
          <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
            {tax.access_type === 'all' ? 'All Types' : 
             tax.access_type === 'hotspot' ? 'Hotspot Only' :
             tax.access_type === 'pppoe' ? 'PPPoE Only' : 'Both Access'}
          </span>
        </div>
        
        {tax.description && (
          <div className="text-sm">
            <span className={textSecondaryClass}>Description: </span>
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              {tax.description}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className={textSecondaryClass}>Price Inclusion</span>
          <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
            {tax.is_included_in_price ? 'Included' : 'Added'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2`}>
              Tax Configuration
            </h2>
            <p className={textSecondaryClass}>
              Configure tax rules for different access types and revenue streams
            </p>
          </div>
          
          <button
            onClick={() => setShowTaxModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
          >
            <FaPlus className="mr-2" />
            Add Tax
          </button>
        </div>
      </div>

      {/* Tax Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tax_configuration.length > 0 ? (
          tax_configuration.map((tax) => (
            <TaxCard key={tax.id} tax={tax} />
          ))
        ) : (
          <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
            theme === "dark" ? "border-gray-600" : "border-gray-300"
          }`}>
            <FaPlus className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              No Tax Configurations
            </h3>
            <p className={textSecondaryClass}>
              Get started by creating your first tax configuration
            </p>
            <button
              onClick={() => setShowTaxModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Create First Tax
            </button>
          </div>
        )}
      </div>

      {/* Tax Summary */}
      {tax_configuration.length > 0 && (
        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Tax Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-blue-900/20 border-blue-700" : "bg-blue-50 border-blue-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                Active Taxes
              </h4>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {tax_configuration.filter(t => t.is_enabled).length}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-green-900/20 border-green-700" : "bg-green-50 border-green-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-green-300" : "text-green-700"}`}>
                Revenue Taxes
              </h4>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                {tax_configuration.filter(t => t.is_enabled && (t.applies_to === 'revenue' || t.applies_to === 'both')).length}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
            } border`}>
              <h4 className={`text-sm font-medium mb-2 ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
                Expense Taxes
              </h4>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                {tax_configuration.filter(t => t.is_enabled && (t.applies_to === 'expenses' || t.applies_to === 'both')).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showTaxModal && <TaxFormModal />}
      
      <ConfirmationModal
        isOpen={!!deleteTax}
        onClose={() => setDeleteTax(null)}
        onConfirm={handleDeleteTax}
        title="Delete Tax Configuration"
        message={`Are you sure you want to delete the tax "${deleteTax?.name}"? This action cannot be undone.`}
        confirmText="Delete Tax"
        type="danger"
        theme={theme}
      />
    </div>
  );
};

export default TaxConfigurationPanel;