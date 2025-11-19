import React, { useState, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaReceipt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../../api'
import { EnhancedSelect, EnhancedDatePicker, AccessTypeBadge, ConfirmationModal } from '../../ServiceManagement/Shared/components'

const ExpenseManagement = ({ reconciliationData, viewMode, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    access_type: 'general',
    date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: ''
  });

  const { expenses } = reconciliationData;
  const expenseCategories = []; // This would come from your API

  const accessTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'pppoe', label: 'PPPoE' },
    { value: 'both', label: 'Both' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Expenses' },
    { value: 'hotspot', label: 'Hotspot Expenses' },
    { value: 'pppoe', label: 'PPPoE Expenses' },
    { value: 'both', label: 'Both Access Expenses' },
    { value: 'general', label: 'General Expenses' }
  ];

  const handleExpenseInputChange = useCallback((field, value) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetExpenseForm = useCallback(() => {
    setExpenseForm({
      description: '',
      amount: '',
      category: '',
      access_type: 'general',
      date: new Date().toISOString().split('T')[0],
      reference_number: '',
      notes: ''
    });
    setEditingExpense(null);
  }, []);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses.expenses || [];
    
    if (expenseFilter !== 'all') {
      filtered = filtered.filter(expense => expense.access_type === expenseFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    return filtered;
  }, [expenses.expenses, expenseFilter, categoryFilter]);

  const handleSaveExpense = useCallback(async () => {
    if (!expenseForm.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!expenseForm.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        ...expenseForm,
        amount: amount
      };

      if (editingExpense) {
        await api.patch(`/api/payments/manual-expenses/${editingExpense.id}/`, expenseData);
        toast.success('Expense updated successfully');
      } else {
        await api.post('/api/payments/manual-expenses/', expenseData);
        toast.success('Expense created successfully');
      }

      setShowExpenseModal(false);
      resetExpenseForm();
      onRefresh();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save expense';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [expenseForm, editingExpense, resetExpenseForm, onRefresh]);

  const handleEditExpense = useCallback((expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      access_type: expense.access_type,
      date: expense.date,
      reference_number: expense.reference_number || '',
      notes: expense.notes || ''
    });
    setShowExpenseModal(true);
  }, []);

  const handleDeleteExpense = useCallback(async () => {
    if (!deleteExpense) return;

    setLoading(true);
    try {
      await api.delete(`/api/payments/manual-expenses/${deleteExpense.id}/`);
      toast.success('Expense deleted successfully');
      setDeleteExpense(null);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  }, [deleteExpense, onRefresh]);

  const ExpenseFormModal = () => (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`${cardClass} w-full max-w-2xl transform transition-all`}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => {
                  setShowExpenseModal(false);
                  resetExpenseForm();
                }}
                className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Description *
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => handleExpenseInputChange('description', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="What was this expense for?"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Category *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => handleExpenseInputChange('category', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Access Type
                </label>
                <EnhancedSelect
                  value={expenseForm.access_type}
                  onChange={(value) => handleExpenseInputChange('access_type', value)}
                  options={accessTypeOptions}
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Date *
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => handleExpenseInputChange('date', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Reference Number
                </label>
                <input
                  type="text"
                  value={expenseForm.reference_number}
                  onChange={(e) => handleExpenseInputChange('reference_number', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="Optional reference number"
                />
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Notes
                </label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => handleExpenseInputChange('notes', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="Additional notes (optional)"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowExpenseModal(false);
                resetExpenseForm();
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
              onClick={handleSaveExpense}
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
                  <FaPlus className="mr-2" />
                  {editingExpense ? 'Update Expense' : 'Create Expense'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ExpenseCard = ({ expense }) => (
    <div className={`p-4 rounded-lg border transition-all duration-300 ${
      theme === "dark" 
        ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" 
        : "bg-white border-gray-200 hover:bg-gray-50"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <AccessTypeBadge accessType={expense.access_type} theme={theme} size="sm" />
          <span className={`text-xs px-2 py-1 rounded-full ${
            theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
          }`}>
            {expense.category_name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditExpense(expense)}
            className={`p-1 rounded ${
              theme === "dark" 
                ? "text-blue-400 hover:text-blue-300" 
                : "text-blue-600 hover:text-blue-800"
            }`}
            title="Edit Expense"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setDeleteExpense(expense)}
            className="p-1 rounded text-red-500 hover:text-red-600"
            title="Delete Expense"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h4 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
        {expense.description}
      </h4>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={textSecondaryClass}>Amount</span>
          <span className={`font-semibold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
            KES {expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={textSecondaryClass}>Date</span>
          <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
            {format(parseISO(expense.date), 'dd/MM/yyyy')}
          </span>
        </div>
        
        {expense.reference_number && (
          <div className="flex justify-between text-sm">
            <span className={textSecondaryClass}>Reference</span>
            <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
              {expense.reference_number}
            </span>
          </div>
        )}
        
        {expense.notes && (
          <div className="text-sm">
            <span className={textSecondaryClass}>Notes: </span>
            <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              {expense.notes}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardClass} p-6 transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 flex items-center`}>
              <FaReceipt className="mr-2" /> Expense Management
            </h2>
            <p className={textSecondaryClass}>
              Manage and track expenses across different access types
            </p>
          </div>
          
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
          >
            <FaPlus className="mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${cardClass} p-4 transition-colors duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <FaFilter className={textSecondaryClass} />
            <span className={textSecondaryClass}>Filter by:</span>
          </div>
          
          <EnhancedSelect
            value={expenseFilter}
            onChange={setExpenseFilter}
            options={filterOptions}
            placeholder="Access Type"
            theme={theme}
            className="w-48"
          />
          
          <EnhancedSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[]} // Would be populated with categories
            placeholder="Category"
            theme={theme}
            className="w-48"
          />
        </div>
      </div>

      {/* Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
            KES {expenses.summary?.total_amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Hotspot Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
            KES {filteredExpenses.filter(e => e.access_type === 'hotspot').reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>PPPoE Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
            KES {filteredExpenses.filter(e => e.access_type === 'pppoe').reduce((sum, e) => sum + parseFloat(e.amount), 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-yellow-500 bg-yellow-900/20" : "border-yellow-500 bg-yellow-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Expense Count</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
            {filteredExpenses.length}
          </p>
        </div>
      </div>

      {/* Expense Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        ) : (
          <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
            theme === "dark" ? "border-gray-600" : "border-gray-300"
          }`}>
            <FaReceipt className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              No Expenses Found
            </h3>
            <p className={textSecondaryClass}>
              {expenseFilter !== 'all' ? `No ${expenseFilter} expenses found` : 'No expenses recorded yet'}
            </p>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Create First Expense
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showExpenseModal && <ExpenseFormModal />}
      
      <ConfirmationModal
        isOpen={!!deleteExpense}
        onClose={() => setDeleteExpense(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        message={`Are you sure you want to delete the expense "${deleteExpense?.description}"? This action cannot be undone.`}
        confirmText="Delete Expense"
        type="danger"
        theme={theme}
      />
    </div>
  );
};

export default ExpenseManagement;