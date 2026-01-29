





// import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaReceipt, FaSpinner, FaTimes, FaSave, FaTag } from 'react-icons/fa';
// import { format, parseISO } from 'date-fns';
// import { toast } from 'react-hot-toast';
// import api from '../../../api'
// import { EnhancedSelect, EnhancedDatePicker, AccessTypeBadge, ConfirmationModal } from '../../ServiceManagement/Shared/components'

// // Predefined expense categories for ISP business
// const PREDEFINED_CATEGORIES = [
//   'Network Equipment',
//   'Internet Bandwidth',
//   'Server Maintenance',
//   'Staff Salaries',
//   'Office Rent',
//   'Utilities (Electricity, Water)',
//   'Marketing & Advertising',
//   'Software Licenses',
//   'Hardware Purchases',
//   'Vehicle Maintenance',
//   'Fuel & Transportation',
//   'Professional Services',
//   'Insurance',
//   'Taxes & Levies',
//   'Bank Charges',
//   'Travel & Accommodation',
//   'Training & Development',
//   'Repairs & Maintenance',
//   'Office Supplies',
//   'Customer Support',
//   'Security Services',
//   'Cleaning Services',
//   'Internet Service Provider Fees',
//   'Tower Rental',
//   'Fiber Installation',
//   'Wireless Equipment',
//   'Backup Power Systems',
//   'Network Monitoring Tools',
//   'Customer Premises Equipment',
//   'License Fees'
// ];

// // Moved ExpenseFormModal outside to prevent remounting on re-renders
// const ExpenseFormModal = ({ showExpenseModal, setShowExpenseModal, editingExpense, expenseForm, handleExpenseInputChange, formErrors, theme, cardClass, inputClass, textSecondaryClass, loading, resetExpenseForm, accessTypeOptions, categoriesLoading, categoryOptions, setShowCategoryModal, handleSaveExpense, onRefresh }) => {
//   if (!showExpenseModal) return null;

//   // Enhanced Category Select Component
//   const CategorySelect = () => (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between">
//         <label className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//           Category *
//         </label>
//         <button
//           type="button"
//           onClick={() => setShowCategoryModal(true)}
//           className={`flex items-center text-xs px-2 py-1 rounded ${
//             theme === "dark" 
//               ? "bg-gray-600 hover:bg-gray-500 text-gray-300" 
//               : "bg-gray-200 hover:bg-gray-300 text-gray-700"
//           }`}
//         >
//           <FaPlus className="w-3 h-3 mr-1" />
//           New Category
//         </button>
//       </div>
      
//       <EnhancedSelect
//         value={expenseForm.category}
//         onChange={(value) => handleExpenseInputChange('category', value)}
//         options={categoryOptions.filter(opt => opt.value !== 'all')}
//         placeholder="Select a category"
//         theme={theme}
//         isInvalid={!!formErrors.category}
//       />
      
//       {formErrors.category && (
//         <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
//       )}
      
//       {categoriesLoading && (
//         <div className="flex items-center mt-1">
//           <FaSpinner className="animate-spin w-3 h-3 mr-1 text-gray-500" />
//           <span className="text-xs text-gray-500">Loading categories...</span>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
//       <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
//         <div className={`${cardClass} w-full max-w-2xl transform transition-all`}>
//           <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between">
//               <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 {editingExpense ? 'Edit Expense' : 'Add New Expense'}
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowExpenseModal(false);
//                   resetExpenseForm();
//                 }}
//                 className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           <div className="p-4 sm:p-6 space-y-6">
//             {/* Basic Information Section */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Expense Details
//               </h4>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Description *
//                   </label>
//                   <input
//                     type="text"
//                     value={expenseForm.description}
//                     onChange={(e) => handleExpenseInputChange('description', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="What was this expense for?"
//                     maxLength={255}
//                   />
//                   {formErrors.description && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Amount (KES) *
//                   </label>
//                   <input
//                     type="number"
//                     value={expenseForm.amount}
//                     onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     placeholder="0.00"
//                     min="0"
//                     max="10000000"
//                     step="0.01"
//                   />
//                   {formErrors.amount && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
//                   )}
//                   {expenseForm.amount && !formErrors.amount && (
//                     <p className="text-green-600 text-xs mt-1">
//                       Amount: KES {parseFloat(expenseForm.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <CategorySelect />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Access Type
//                   </label>
//                   <EnhancedSelect
//                     value={expenseForm.access_type}
//                     onChange={(value) => handleExpenseInputChange('access_type', value)}
//                     options={accessTypeOptions}
//                     theme={theme}
//                   />
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Date *
//                   </label>
//                   <input
//                     type="date"
//                     value={expenseForm.date}
//                     onChange={(e) => handleExpenseInputChange('date', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg ${
//                       formErrors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
//                     }`}
//                     max={new Date().toISOString().split('T')[0]}
//                   />
//                   {formErrors.date && (
//                     <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                     Reference Number
//                   </label>
//                   <input
//                     type="text"
//                     value={expenseForm.reference_number}
//                     onChange={(e) => handleExpenseInputChange('reference_number', e.target.value)}
//                     className={`${inputClass} w-full px-3 py-2 rounded-lg`}
//                     placeholder="Optional reference number"
//                     maxLength={100}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Additional Information Section */}
//             <div>
//               <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Additional Information
//               </h4>
//               <div className="sm:col-span-2">
//                 <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                   Notes
//                 </label>
//                 <textarea
//                   value={expenseForm.notes}
//                   onChange={(e) => handleExpenseInputChange('notes', e.target.value)}
//                   className={`${inputClass} w-full px-3 py-2 rounded-lg`}
//                   placeholder="Additional notes, vendor details, or any relevant information (optional)"
//                   rows="3"
//                   maxLength={500}
//                 />
//                 <p className={`text-xs mt-1 ${textSecondaryClass}`}>
//                   {expenseForm.notes.length}/500 characters
//                 </p>
//               </div>
//             </div>

//             {/* Form Validation Summary */}
//             {Object.keys(formErrors).length > 0 && (
//               <div className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
//               }`}>
//                 <div className="flex items-center space-x-2">
//                   <FaTimes className="w-4 h-4 text-red-500" />
//                   <span className="text-sm font-medium text-red-700 dark:text-red-300">
//                     Please fix the following errors:
//                   </span>
//                 </div>
//                 <ul className="text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
//                   {Object.values(formErrors).map((error, index) => (
//                     <li key={index}>{error}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>

//           <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
//             <button
//               onClick={() => {
//                 setShowExpenseModal(false);
//                 resetExpenseForm();
//               }}
//               className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSaveExpense}
//               disabled={loading || categoriesLoading}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   {editingExpense ? 'Updating...' : 'Creating...'}
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <FaSave className="mr-2" />
//                   {editingExpense ? 'Update Expense' : 'Create Expense'}
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Moved CategoryCreationModal outside to prevent remounting
// const CategoryCreationModal = ({ showCategoryModal, setShowCategoryModal, newCategoryName, setNewCategoryName, creatingCategory, handleCreateCategory, theme, cardClass, inputClass, textSecondaryClass }) => {
//   if (!showCategoryModal) return null;

//   return (
//     <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
//       <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
//         <div className={`${cardClass} w-full max-w-md transform transition-all`}>
//           <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between">
//               <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                 Create New Category
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowCategoryModal(false);
//                   setNewCategoryName('');
//                 }}
//                 className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
//               >
//                 <FaTimes className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           <div className="p-4 sm:p-6 space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                 Category Name *
//               </label>
//               <input
//                 type="text"
//                 value={newCategoryName}
//                 onChange={(e) => setNewCategoryName(e.target.value)}
//                 className={`${inputClass} w-full px-3 py-2 rounded-lg`}
//                 placeholder="Enter category name"
//                 maxLength={100}
//               />
//               <p className={`text-xs mt-1 ${textSecondaryClass}`}>
//                 Suggested categories: {PREDEFINED_CATEGORIES.slice(0, 3).join(', ')}...
//               </p>
//             </div>

//             {/* Quick Category Suggestions */}
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
//                 Quick Suggestions
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {PREDEFINED_CATEGORIES.slice(0, 6).map((category) => (
//                   <button
//                     key={category}
//                     type="button"
//                     onClick={() => setNewCategoryName(category)}
//                     className={`px-3 py-1 text-xs rounded-full border transition-colors ${
//                       theme === "dark" 
//                         ? "border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white" 
//                         : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800"
//                     }`}
//                   >
//                     {category}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
//             <button
//               onClick={() => {
//                 setShowCategoryModal(false);
//                 setNewCategoryName('');
//               }}
//               className={`px-4 py-2 rounded-lg text-sm font-medium ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreateCategory}
//               disabled={creatingCategory || !newCategoryName.trim()}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {creatingCategory ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Creating...
//                 </div>
//               ) : (
//                 <div className="flex items-center">
//                   <FaTag className="mr-2" />
//                   Create Category
//                 </div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ExpenseManagement = ({ reconciliationData, viewMode, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
//   const [showExpenseModal, setShowExpenseModal] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [editingExpense, setEditingExpense] = useState(null);
//   const [deleteExpense, setDeleteExpense] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [expenseFilter, setExpenseFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [expenseCategories, setExpenseCategories] = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);
//   const [newCategoryName, setNewCategoryName] = useState('');
//   const [creatingCategory, setCreatingCategory] = useState(false);

//   const [expenseForm, setExpenseForm] = useState({
//     description: '',
//     amount: '',
//     category: '',
//     access_type: 'general',
//     date: new Date().toISOString().split('T')[0],
//     reference_number: '',
//     notes: ''
//   });

//   const [formErrors, setFormErrors] = useState({});

//   const { expenses } = reconciliationData;

//   // Data Structure: Enhanced category management with quick lookups
//   const categoryMap = useMemo(() => {
//     return expenseCategories.reduce((map, category) => {
//       map[category.id] = category;
//       map[category.name] = category; // Also map by name for easy lookup
//       return map;
//     }, {});
//   }, [expenseCategories]);

//   // Algorithm: Enhanced category fetching with caching
//   const fetchExpenseCategories = useCallback(async (retryCount = 0) => {
//     setCategoriesLoading(true);
//     try {
//       const response = await api.get('/api/payments/expense-categories/');
//       setExpenseCategories(response.data);
//     } catch (error) {
//       console.error('Failed to fetch expense categories:', error);
//       if (retryCount < 3) {
//         const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
//         setTimeout(() => fetchExpenseCategories(retryCount + 1), delay);
//       } else {
//         toast.error('Failed to load expense categories');
//         // Initialize with predefined categories if API fails
//         setExpenseCategories(PREDEFINED_CATEGORIES.map((name, index) => ({
//           id: `predefined-${index}`,
//           name,
//           is_predefined: true
//         })));
//       }
//     } finally {
//       setCategoriesLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchExpenseCategories();
//   }, [fetchExpenseCategories]);

//   // Algorithm: Create new expense category
//   const handleCreateCategory = useCallback(async () => {
//     if (!newCategoryName.trim()) {
//       toast.error('Category name is required');
//       return;
//     }

//     // Check if category already exists
//     const existingCategory = expenseCategories.find(
//       cat => cat.name.toLowerCase() === newCategoryName.toLowerCase()
//     );
    
//     if (existingCategory) {
//       toast.error('Category already exists');
//       return;
//     }

//     setCreatingCategory(true);
//     try {
//       const response = await api.post('/api/payments/expense-categories/', {
//         name: newCategoryName.trim(),
//         description: `Custom category: ${newCategoryName.trim()}`,
//         is_active: true
//       });

//       setExpenseCategories(prev => [...prev, response.data]);
//       setNewCategoryName('');
//       setShowCategoryModal(false);
//       toast.success('Category created successfully');
      
//       // Auto-select the new category in the form
//       setExpenseForm(prev => ({
//         ...prev,
//         category: response.data.id
//       }));
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to create category';
//       toast.error(errorMessage);
//     } finally {
//       setCreatingCategory(false);
//     }
//   }, [newCategoryName, expenseCategories]);

//   const accessTypeOptions = [
//     { value: 'general', label: 'General' },
//     { value: 'hotspot', label: 'Hotspot' },
//     { value: 'pppoe', label: 'PPPoE' },
//     { value: 'both', label: 'Both' }
//   ];

//   const filterOptions = [
//     { value: 'all', label: 'All Expenses' },
//     { value: 'hotspot', label: 'Hotspot Expenses' },
//     { value: 'pppoe', label: 'PPPoE Expenses' },
//     { value: 'both', label: 'Both Access Expenses' },
//     { value: 'general', label: 'General Expenses' }
//   ];

//   const categoryOptions = useMemo(() => [
//     { value: 'all', label: 'All Categories' },
//     ...expenseCategories.map(category => ({
//       value: category.id,
//       label: category.name,
//       isPredefined: category.is_predefined
//     }))
//   ], [expenseCategories]);

//   // Algorithm: Enhanced form validation
//   const validateExpenseForm = useCallback((formData) => {
//     const errors = {};

//     if (!formData.description.trim()) {
//       errors.description = 'Description is required';
//     } else if (formData.description.trim().length < 3) {
//       errors.description = 'Description must be at least 3 characters';
//     }

//     const amount = parseFloat(formData.amount);
//     if (isNaN(amount) || amount <= 0) {
//       errors.amount = 'Please enter a valid positive amount';
//     } else if (amount > 10000000) { // 10 million KES limit
//       errors.amount = 'Amount seems unusually high. Please verify.';
//     }

//     if (!formData.category) {
//       errors.category = 'Please select a category';
//     }

//     if (!formData.date) {
//       errors.date = 'Date is required';
//     } else {
//       const selectedDate = new Date(formData.date);
//       const today = new Date();
//       if (selectedDate > today) {
//         errors.date = 'Date cannot be in the future';
//       }
//     }

//     return errors;
//   }, []);

//   const handleExpenseInputChange = useCallback((field, value) => {
//     setExpenseForm(prev => {
//       const newForm = {
//         ...prev,
//         [field]: value
//       };
      
//       // Validate on change for real-time feedback
//       if (Object.keys(formErrors).length > 0) {
//         const newErrors = validateExpenseForm(newForm);
//         setFormErrors(newErrors);
//       }
      
//       return newForm;
//     });
//   }, [formErrors, validateExpenseForm]);

//   const resetExpenseForm = useCallback(() => {
//     setExpenseForm({
//       description: '',
//       amount: '',
//       category: '',
//       access_type: 'general',
//       date: new Date().toISOString().split('T')[0],
//       reference_number: '',
//       notes: ''
//     });
//     setFormErrors({});
//     setEditingExpense(null);
//   }, []);

//   // Algorithm: Enhanced filtering with search capability
//   const filteredExpenses = useMemo(() => {
//     let filtered = expenses.expenses || [];
    
//     if (expenseFilter !== 'all') {
//       filtered = filtered.filter(expense => expense.access_type === expenseFilter);
//     }
    
//     if (categoryFilter !== 'all') {
//       filtered = filtered.filter(expense => expense.category === categoryFilter);
//     }
    
//     // Sort by date descending for better UX
//     return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
//   }, [expenses.expenses, expenseFilter, categoryFilter]);

//   // Algorithm: Enhanced expense statistics with category insights
//   const expenseStats = useMemo(() => {
//     const stats = {
//       total: 0,
//       byAccessType: {
//         hotspot: 0,
//         pppoe: 0,
//         both: 0,
//         general: 0
//       },
//       byCategory: {},
//       categoryCount: {}
//     };

//     filteredExpenses.forEach(expense => {
//       const amount = parseFloat(expense.amount);
//       stats.total += amount;
//       stats.byAccessType[expense.access_type] += amount;
      
//       const categoryName = categoryMap[expense.category]?.name || 'Unknown';
//       stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + amount;
//       stats.categoryCount[categoryName] = (stats.categoryCount[categoryName] || 0) + 1;
//     });

//     return stats;
//   }, [filteredExpenses, categoryMap]);

//   // Algorithm: Enhanced expense saving with comprehensive validation
//   const handleSaveExpense = useCallback(async () => {
//     const errors = validateExpenseForm(expenseForm);
//     setFormErrors(errors);
    
//     if (Object.keys(errors).length > 0) {
//       toast.error('Please fix the form errors before saving');
//       return;
//     }

//     setLoading(true);
//     try {
//       const amount = parseFloat(expenseForm.amount);
//       const expenseData = {
//         ...expenseForm,
//         amount: amount
//       };

//       if (editingExpense) {
//         await api.patch(`/api/payments/manual-expenses/${editingExpense.id}/`, expenseData);
//         toast.success('Expense updated successfully');
//       } else {
//         await api.post('/api/payments/manual-expenses/', expenseData);
//         toast.success('Expense created successfully');
//       }

//       setShowExpenseModal(false);
//       resetExpenseForm();
//       onRefresh();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 
//                           error.response?.data?.detail || 
//                           'Failed to save expense';
//       toast.error(errorMessage);
      
//       // Handle specific backend validation errors
//       if (error.response?.data) {
//         const backendErrors = error.response.data;
//         const fieldErrors = {};
        
//         Object.keys(backendErrors).forEach(field => {
//           if (backendErrors[field] && Array.isArray(backendErrors[field])) {
//             fieldErrors[field] = backendErrors[field][0];
//           }
//         });
        
//         if (Object.keys(fieldErrors).length > 0) {
//           setFormErrors(fieldErrors);
//         }
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [expenseForm, editingExpense, validateExpenseForm, resetExpenseForm, onRefresh]);

//   const handleEditExpense = useCallback((expense) => {
//     setEditingExpense(expense);
//     setExpenseForm({
//       description: expense.description,
//       amount: expense.amount.toString(),
//       category: expense.category,
//       access_type: expense.access_type,
//       date: expense.date,
//       reference_number: expense.reference_number || '',
//       notes: expense.notes || ''
//     });
//     setFormErrors({});
//     setShowExpenseModal(true);
//   }, []);

//   const handleDeleteExpense = useCallback(async () => {
//     if (!deleteExpense) return;

//     setLoading(true);
//     try {
//       await api.delete(`/api/payments/manual-expenses/${deleteExpense.id}/`);
//       toast.success('Expense deleted successfully');
//       setDeleteExpense(null);
//       onRefresh();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to delete expense';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [deleteExpense, onRefresh]);

//   const ExpenseCard = ({ expense }) => {
//     const category = categoryMap[expense.category];
    
//     return (
//       <div className={`p-4 rounded-lg border transition-all duration-300 ${
//         theme === "dark" 
//           ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" 
//           : "bg-white border-gray-200 hover:bg-gray-50"
//       }`}>
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center space-x-3">
//             <AccessTypeBadge accessType={expense.access_type} theme={theme} size="sm" />
//             <span className={`text-xs px-2 py-1 rounded-full ${
//               theme === "dark" ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"
//             }`}>
//               {category?.name || 'Unknown Category'}
//             </span>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => handleEditExpense(expense)}
//               className={`p-1 rounded ${
//                 theme === "dark" 
//                   ? "text-blue-400 hover:text-blue-300" 
//                   : "text-blue-600 hover:text-blue-800"
//               }`}
//               title="Edit Expense"
//             >
//               <FaEdit className="w-4 h-4" />
//             </button>
            
//             <button
//               onClick={() => setDeleteExpense(expense)}
//               className="p-1 rounded text-red-500 hover:text-red-600"
//               title="Delete Expense"
//             >
//               <FaTrash className="w-4 h-4" />
//             </button>
//           </div>
//         </div>

//         <h4 className={`font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//           {expense.description}
//         </h4>

//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span className={textSecondaryClass}>Amount</span>
//             <span className={`font-semibold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
//               KES {parseFloat(expense.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//             </span>
//           </div>
          
//           <div className="flex justify-between text-sm">
//             <span className={textSecondaryClass}>Date</span>
//             <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//               {format(parseISO(expense.date), 'dd/MM/yyyy')}
//             </span>
//           </div>
          
//           {expense.reference_number && (
//             <div className="flex justify-between text-sm">
//               <span className={textSecondaryClass}>Reference</span>
//               <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                 {expense.reference_number}
//               </span>
//             </div>
//           )}
          
//           {expense.notes && (
//             <div className="text-sm">
//               <span className={textSecondaryClass}>Notes: </span>
//               <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
//                 {expense.notes}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className={`${cardClass} p-6 transition-colors duration-300`}>
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//           <div>
//             <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2 flex items-center`}>
//               <FaReceipt className="mr-2" /> Expense Management
//             </h2>
//             <p className={textSecondaryClass}>
//               Manage and track expenses across different access types and categories
//             </p>
//           </div>
          
//           <div className="flex space-x-3">
//             <button
//               onClick={fetchExpenseCategories}
//               disabled={categoriesLoading}
//               className={`flex items-center px-4 py-2 rounded-lg ${
//                 theme === "dark" 
//                   ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                   : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//               } disabled:opacity-50`}
//             >
//               {categoriesLoading ? (
//                 <FaSpinner className="animate-spin mr-2" />
//               ) : (
//                 <FaSpinner className="mr-2" />
//               )}
//               Refresh
//             </button>
//             <button
//               onClick={() => setShowExpenseModal(true)}
//               className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
//             >
//               <FaPlus className="mr-2" />
//               Add Expense
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={`${cardClass} p-4 transition-colors duration-300`}>
//         <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
//           <div className="flex items-center space-x-2">
//             <FaFilter className={textSecondaryClass} />
//             <span className={textSecondaryClass}>Filter by:</span>
//           </div>
          
//           <EnhancedSelect
//             value={expenseFilter}
//             onChange={setExpenseFilter}
//             options={filterOptions}
//             placeholder="Access Type"
//             theme={theme}
//             className="w-48"
//           />
          
//           <EnhancedSelect
//             value={categoryFilter}
//             onChange={setCategoryFilter}
//             options={categoryOptions}
//             placeholder="Category"
//             theme={theme}
//             className="w-48"
//             disabled={categoriesLoading}
//           />
//         </div>
//       </div>

//       {/* Expense Summary */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//         <div className={`p-4 rounded-lg border-l-4 ${
//           theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
//         }`}>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Expenses</h3>
//           <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
//             KES {expenseStats.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//           </p>
//         </div>
        
//         <div className={`p-4 rounded-lg border-l-4 ${
//           theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
//         }`}>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Hotspot Expenses</h3>
//           <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
//             KES {expenseStats.byAccessType.hotspot.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//           </p>
//         </div>
        
//         <div className={`p-4 rounded-lg border-l-4 ${
//           theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
//         }`}>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>PPPoE Expenses</h3>
//           <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
//             KES {expenseStats.byAccessType.pppoe.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//           </p>
//         </div>
        
//         <div className={`p-4 rounded-lg border-l-4 ${
//           theme === "dark" ? "border-yellow-500 bg-yellow-900/20" : "border-yellow-500 bg-yellow-50"
//         }`}>
//           <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Expense Count</h3>
//           <p className={`text-2xl font-bold ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
//             {filteredExpenses.length}
//           </p>
//         </div>
//       </div>

//       {/* Expense Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredExpenses.length > 0 ? (
//           filteredExpenses.map((expense) => (
//             <ExpenseCard key={expense.id} expense={expense} />
//           ))
//         ) : (
//           <div className={`col-span-3 p-8 text-center rounded-lg border-2 border-dashed ${
//             theme === "dark" ? "border-gray-600" : "border-gray-300"
//           }`}>
//             <FaReceipt className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
//             <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//               No Expenses Found
//             </h3>
//             <p className={textSecondaryClass}>
//               {expenseFilter !== 'all' ? `No ${expenseFilter} expenses found` : 'No expenses recorded yet'}
//             </p>
//             <button
//               onClick={() => setShowExpenseModal(true)}
//               className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
//             >
//               Create First Expense
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Category Breakdown */}
//       {Object.keys(expenseStats.byCategory).length > 0 && (
//         <div className={`${cardClass} p-6 transition-colors duration-300`}>
//           <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             Expense Breakdown by Category
//           </h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {Object.entries(expenseStats.byCategory).map(([category, amount]) => (
//               <div key={category} className={`p-3 rounded-lg border ${
//                 theme === "dark" ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
//               }`}>
//                 <div className="flex justify-between items-center">
//                   <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                     {category}
//                   </span>
//                   <span className={`text-sm font-semibold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
//                     KES {amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
//                   <div 
//                     className="bg-red-500 h-2 rounded-full transition-all duration-500"
//                     style={{ 
//                       width: `${(amount / expenseStats.total) * 100}%` 
//                     }}
//                   ></div>
//                 </div>
//                 <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                   {expenseStats.categoryCount[category]} expenses
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       <ExpenseFormModal
//         showExpenseModal={showExpenseModal}
//         setShowExpenseModal={setShowExpenseModal}
//         editingExpense={editingExpense}
//         expenseForm={expenseForm}
//         handleExpenseInputChange={handleExpenseInputChange}
//         formErrors={formErrors}
//         theme={theme}
//         cardClass={cardClass}
//         inputClass={inputClass}
//         textSecondaryClass={textSecondaryClass}
//         loading={loading}
//         resetExpenseForm={resetExpenseForm}
//         accessTypeOptions={accessTypeOptions}
//         categoriesLoading={categoriesLoading}
//         categoryOptions={categoryOptions}
//         setShowCategoryModal={setShowCategoryModal}
//         handleSaveExpense={handleSaveExpense}
//         onRefresh={onRefresh}
//       />
//       <CategoryCreationModal
//         showCategoryModal={showCategoryModal}
//         setShowCategoryModal={setShowCategoryModal}
//         newCategoryName={newCategoryName}
//         setNewCategoryName={setNewCategoryName}
//         creatingCategory={creatingCategory}
//         handleCreateCategory={handleCreateCategory}
//         theme={theme}
//         cardClass={cardClass}
//         inputClass={inputClass}
//         textSecondaryClass={textSecondaryClass}
//       />
      
//       <ConfirmationModal
//         isOpen={!!deleteExpense}
//         onClose={() => setDeleteExpense(null)}
//         onConfirm={handleDeleteExpense}
//         title="Delete Expense"
//         message={`Are you sure you want to delete the expense "${deleteExpense?.description}"? This action cannot be undone.`}
//         confirmText="Delete Expense"
//         type="danger"
//         theme={theme}
//       />
//     </div>
//   );
// };

// export default ExpenseManagement;






import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaReceipt, FaSpinner, FaTimes, FaSave, FaTag, FaExclamationTriangle } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import api from '../../../api'
import { EnhancedSelect,  DateRangePicker, AccessTypeBadge, ConfirmationModal } from '../../ServiceManagement/Shared/components'

// Predefined expense categories for ISP business
const PREDEFINED_CATEGORIES = [
  'Network Equipment',
  'Internet Bandwidth',
  'Server Maintenance',
  'Staff Salaries',
  'Office Rent',
  'Utilities (Electricity, Water)',
  'Marketing & Advertising',
  'Software Licenses',
  'Hardware Purchases',
  'Vehicle Maintenance',
  'Fuel & Transportation',
  'Professional Services',
  'Insurance',
  'Taxes & Levies',
  'Bank Charges',
  'Travel & Accommodation',
  'Training & Development',
  'Repairs & Maintenance',
  'Office Supplies',
  'Customer Support',
  'Security Services',
  'Cleaning Services',
  'Internet Service Provider Fees',
  'Tower Rental',
  'Fiber Installation',
  'Wireless Equipment',
  'Backup Power Systems',
  'Network Monitoring Tools',
  'Customer Premises Equipment',
  'License Fees'
];

// Enhanced Category Select Component with Delete Icons
const CategorySelect = ({ 
  value, 
  onChange, 
  options, 
  theme, 
  isInvalid, 
  categoriesLoading, 
  expenseCategories,
  setDeletingCategory 
}) => {
  // Filter out 'all' option and separate predefined vs custom
  const filteredOptions = options.filter(opt => opt.value !== 'all');
  
  const handleQuickDelete = (e, categoryId, categoryName) => {
    e.stopPropagation(); // Prevent dropdown from closing
    e.preventDefault(); // Prevent option selection
    
    // Find the category object
    const category = expenseCategories.find(cat => cat.id === categoryId);
    if (category && !category.is_predefined) {
      setDeletingCategory(category);
    }
  };

  // Custom option renderer with delete icons for custom categories
  const CustomOption = ({ innerProps, label, data }) => {
    const isCustom = !data.isPredefined;
    const category = expenseCategories.find(cat => cat.id === data.value);
    
    return (
      <div 
        {...innerProps} 
        className={`flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}
      >
        <div className="flex items-center space-x-2">
          <FaTag className={`w-3 h-3 ${isCustom ? 'text-green-500' : 'text-blue-500'}`} />
          <span>{label}</span>
          {!isCustom && (
            <span className={`text-xs px-1 py-0.5 rounded ${
              theme === "dark" ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
            }`}>
              System
            </span>
          )}
        </div>
        
        {isCustom && category && (
          <button
            onClick={(e) => handleQuickDelete(e, data.value, label)}
            className="p-1 text-red-500 hover:text-red-600 transition-colors ml-2"
            title="Delete Category"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
          Category *
        </label>
      </div>
      
      <EnhancedSelect
        value={value}
        onChange={onChange}
        options={filteredOptions}
        placeholder="Select a category"
        theme={theme}
        isInvalid={isInvalid}
        components={{ Option: CustomOption }}
      />
      
      {isInvalid && (
        <p className="text-red-500 text-xs mt-1">Please select a category</p>
      )}
      
      {categoriesLoading && (
        <div className="flex items-center mt-1">
          <FaSpinner className="animate-spin w-3 h-3 mr-1 text-gray-500" />
          <span className="text-xs text-gray-500">Loading categories...</span>
        </div>
      )}
    </div>
  );
};

// Moved ExpenseFormModal outside to prevent remounting on re-renders
const ExpenseFormModal = ({ 
  showExpenseModal, 
  setShowExpenseModal, 
  editingExpense, 
  expenseForm, 
  handleExpenseInputChange, 
  formErrors, 
  theme, 
  cardClass, 
  inputClass, 
  textSecondaryClass, 
  loading, 
  resetExpenseForm, 
  accessTypeOptions, 
  categoriesLoading, 
  categoryOptions, 
  setShowCategoryModal, 
  handleSaveExpense, 
  onRefresh,
  expenseCategories,
  setDeletingCategory 
}) => {
  if (!showExpenseModal) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className={`${cardClass} w-full max-w-2xl transform transition-all`}>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Basic Information Section */}
            <div>
              <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Expense Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Description *
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => handleExpenseInputChange('description', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="What was this expense for?"
                    maxLength={255}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Amount (KES) *
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="0.00"
                    min="0"
                    max="10000000"
                    step="0.01"
                  />
                  {formErrors.amount && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
                  )}
                  {expenseForm.amount && !formErrors.amount && (
                    <p className="text-green-600 text-xs mt-1">
                      Amount: KES {parseFloat(expenseForm.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                <div>
                  <CategorySelect
                    value={expenseForm.category}
                    onChange={(value) => handleExpenseInputChange('category', value)}
                    options={categoryOptions}
                    theme={theme}
                    isInvalid={!!formErrors.category}
                    categoriesLoading={categoriesLoading}
                    expenseCategories={expenseCategories}
                    setDeletingCategory={setDeletingCategory}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className={`flex items-center text-xs px-2 py-1 rounded ${
                        theme === "dark" 
                          ? "bg-gray-600 hover:bg-gray-500 text-gray-300" 
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      <FaPlus className="w-3 h-3 mr-1" />
                      New Category
                    </button>
                  </div>
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
                    className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                      formErrors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                  )}
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
                    maxLength={100}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h4 className={`text-md font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Additional Information
              </h4>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Notes
                </label>
                <textarea
                  value={expenseForm.notes}
                  onChange={(e) => handleExpenseInputChange('notes', e.target.value)}
                  className={`${inputClass} w-full px-3 py-2 rounded-lg`}
                  placeholder="Additional notes, vendor details, or any relevant information (optional)"
                  rows="3"
                  maxLength={500}
                />
                <p className={`text-xs mt-1 ${textSecondaryClass}`}>
                  {expenseForm.notes.length}/500 characters
                </p>
              </div>
            </div>

            {/* Form Validation Summary */}
            {Object.keys(formErrors).length > 0 && (
              <div className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
              }`}>
                <div className="flex items-center space-x-2">
                  <FaTimes className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="text-xs text-red-600 dark:text-red-400 mt-1 list-disc list-inside">
                  {Object.values(formErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
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
              disabled={loading || categoriesLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingExpense ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <FaSave className="mr-2" />
                  {editingExpense ? 'Update Expense' : 'Create Expense'}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Moved CategoryCreationModal outside to prevent remounting
const CategoryCreationModal = ({ 
  showCategoryModal, 
  setShowCategoryModal, 
  newCategoryName, 
  setNewCategoryName, 
  creatingCategory, 
  handleCreateCategory, 
  theme, 
  cardClass, 
  inputClass, 
  textSecondaryClass,
  expenseCategories,
  handleDeleteCategory // Add this prop for direct deletion
}) => {
  if (!showCategoryModal) return null;

  // Get only custom categories
  const customCategories = expenseCategories.filter(cat => !cat.is_predefined);

  // Check if current category name already exists
  const categoryExists = useMemo(() => {
    if (!newCategoryName.trim()) return false;
    
    return expenseCategories.some(
      cat => cat.name.toLowerCase() === newCategoryName.toLowerCase().trim()
    );
  }, [newCategoryName, expenseCategories]);

  const handleSuggestionClick = (category) => {
    // Check if the suggested category already exists
    const exists = expenseCategories.some(
      cat => cat.name.toLowerCase() === category.toLowerCase()
    );
    
    if (exists) {
      toast.error(`Category "${category}" already exists`);
      return;
    }
    
    setNewCategoryName(category);
  };

  // Function to handle quick category deletion with toast
  const handleQuickDelete = async (category) => {
    try {
      await handleDeleteCategory(category);
      toast.success(`Category "${category.name}" deleted successfully`);
    } catch (error) {
      // Error handling is done in the main handleDeleteCategory function
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${theme === "dark" ? "bg-gray-900 bg-opacity-75" : "bg-gray-500 bg-opacity-75"}`}>
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className={`${cardClass} w-full max-w-2xl transform transition-all`}>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Create New Category
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName('');
                }}
                className={`p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Category Name Input Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={`${inputClass} w-full px-3 py-2 rounded-lg ${
                  categoryExists ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Enter category name"
                maxLength={100}
              />
              {categoryExists && (
                <p className="text-red-500 text-xs mt-1">
                  Category "{newCategoryName}" already exists
                </p>
              )}
              <p className={`text-xs mt-1 ${textSecondaryClass}`}>
                Suggested categories: {PREDEFINED_CATEGORIES.slice(0, 3).join(', ')}...
              </p>
            </div>

            {/* Quick Category Suggestions */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                Quick Suggestions
              </label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_CATEGORIES.slice(0, 6).map((category) => {
                  const exists = expenseCategories.some(
                    cat => cat.name.toLowerCase() === category.toLowerCase()
                  );
                  
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleSuggestionClick(category)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        exists 
                          ? theme === "dark" 
                            ? "border-red-600 bg-red-900/50 text-red-300 cursor-not-allowed" 
                            : "border-red-300 bg-red-100 text-red-700 cursor-not-allowed"
                          : theme === "dark" 
                            ? "border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white" 
                            : "border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800"
                      }`}
                      disabled={exists}
                      title={exists ? "Category already exists" : `Add ${category}`}
                    >
                      {category}
                      {exists && " ✓"}
                    </button>
                  );
                })}
              </div>
              <p className={`text-xs mt-2 ${textSecondaryClass}`}>
                ✓ indicates category already exists
              </p>
            </div>

            {/* Custom Categories Section */}
            {customCategories.length > 0 && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Your Custom Categories
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({customCategories.length} categories)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {customCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center space-x-2 px-3 py-1 text-xs rounded-full border transition-colors ${
                        theme === "dark" 
                          ? "border-green-600 bg-green-900/50 text-green-300" 
                          : "border-green-300 bg-green-100 text-green-700"
                      }`}
                    >
                      <span>{category.name}</span>
                      <button
                        onClick={() => handleQuickDelete(category)}
                        className="p-0.5 text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Category"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-2 ${textSecondaryClass}`}>
                  Click the X icon to delete a custom category
                </p>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategoryName('');
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
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim() || categoryExists}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingCategory ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <FaTag className="mr-2" />
                  Create Category
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpenseManagement = ({ reconciliationData, viewMode, theme, cardClass, textSecondaryClass, inputClass, onRefresh }) => {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteExpense, setDeleteExpense] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenseFilter, setExpenseFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    access_type: 'general',
    date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const { expenses } = reconciliationData;

  // Data Structure: Enhanced category management with quick lookups
  const categoryMap = useMemo(() => {
    return expenseCategories.reduce((map, category) => {
      map[category.id] = category;
      map[category.name] = category;
      return map;
    }, {});
  }, [expenseCategories]);

  // Algorithm: Enhanced category fetching with caching
  const fetchExpenseCategories = useCallback(async (retryCount = 0) => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/api/payments/expense-categories/');
      setExpenseCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch expense categories:', error);
      if (retryCount < 3) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => fetchExpenseCategories(retryCount + 1), delay);
      } else {
        toast.error('Failed to load expense categories');
        setExpenseCategories(PREDEFINED_CATEGORIES.map((name, index) => ({
          id: `predefined-${index}`,
          name,
          is_predefined: true
        })));
      }
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseCategories();
  }, [fetchExpenseCategories]);

  // Algorithm: Enhanced form validation
  const validateExpenseForm = useCallback((formData) => {
    const errors = {};

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters';
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter a valid positive amount';
    } else if (amount > 10000000) { // 10 million KES limit
      errors.amount = 'Amount seems unusually high. Please verify.';
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        errors.date = 'Date cannot be in the future';
      }
    }

    return errors;
  }, []);

  // Algorithm: Handle expense input changes
  const handleExpenseInputChange = useCallback((field, value) => {
    setExpenseForm(prev => {
      const newForm = {
        ...prev,
        [field]: value
      };
      
      // Validate on change for real-time feedback
      if (Object.keys(formErrors).length > 0) {
        const newErrors = validateExpenseForm(newForm);
        setFormErrors(newErrors);
      }
      
      return newForm;
    });
  }, [formErrors, validateExpenseForm]);

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
    setFormErrors({});
    setEditingExpense(null);
  }, []);

  // Algorithm: Enhanced expense saving with comprehensive validation
  const handleSaveExpense = useCallback(async () => {
    const errors = validateExpenseForm(expenseForm);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(expenseForm.amount);
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
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Failed to save expense';
      toast.error(errorMessage);
      
      // Handle specific backend validation errors
      if (error.response?.data) {
        const backendErrors = error.response.data;
        const fieldErrors = {};
        
        Object.keys(backendErrors).forEach(field => {
          if (backendErrors[field] && Array.isArray(backendErrors[field])) {
            fieldErrors[field] = backendErrors[field][0];
          }
        });
        
        if (Object.keys(fieldErrors).length > 0) {
          setFormErrors(fieldErrors);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [expenseForm, editingExpense, validateExpenseForm, resetExpenseForm, onRefresh]);

  // Algorithm: Create new expense category
  const handleCreateCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    // Check if category already exists
    const existingCategory = expenseCategories.find(
      cat => cat.name.toLowerCase() === newCategoryName.toLowerCase()
    );
    
    if (existingCategory) {
      toast.error('Category already exists');
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await api.post('/api/payments/expense-categories/', {
        name: newCategoryName.trim(),
        description: `Custom category: ${newCategoryName.trim()}`,
        is_active: true
      });

      setExpenseCategories(prev => [...prev, response.data]);
      setNewCategoryName('');
      setShowCategoryModal(false);
      toast.success('Category created successfully');
      
      // Auto-select the new category in the form
      setExpenseForm(prev => ({
        ...prev,
        category: response.data.id
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create category';
      toast.error(errorMessage);
    } finally {
      setCreatingCategory(false);
    }
  }, [newCategoryName, expenseCategories]);

  // Algorithm: Delete custom expense category
  const handleDeleteCategory = useCallback(async (categoryToDelete = null) => {
    const category = categoryToDelete || deletingCategory;
    if (!category) return;

    setLoading(true);
    try {
      await api.delete(`/api/payments/expense-categories/${category.id}/`);
      
      // Remove category from local state
      setExpenseCategories(prev => prev.filter(cat => cat.id !== category.id));
      
      // If the deleted category was selected in the form, clear it
      if (expenseForm.category === category.id) {
        setExpenseForm(prev => ({ ...prev, category: '' }));
      }
      
      // If the deleted category was selected in the filter, reset to 'all'
      if (categoryFilter === category.id) {
        setCategoryFilter('all');
      }
      
      // Only set deletingCategory to null if it was set via the confirmation modal
      if (!categoryToDelete) {
        setDeletingCategory(null);
      }
      
      // Refresh data to ensure consistency
      onRefresh();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.expense_count > 0) {
        toast.error(`Cannot delete category. It is used in ${errorData.expense_count} expense(s).`);
      } else {
        const errorMessage = errorData?.error || 'Failed to delete category';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [deletingCategory, expenseForm.category, categoryFilter, onRefresh]);

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
    setFormErrors({});
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
      const errorMessage = error.response?.data?.error || 'Failed to delete expense';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deleteExpense, onRefresh]);

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

  const categoryOptions = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    ...expenseCategories.map(category => ({
      value: category.id,
      label: category.name,
      isPredefined: category.is_predefined
    }))
  ], [expenseCategories]);

  // Algorithm: Enhanced filtering with search capability
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.expenses || [];
    
    if (expenseFilter !== 'all') {
      filtered = filtered.filter(expense => expense.access_type === expenseFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    // Sort by date descending for better UX
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses.expenses, expenseFilter, categoryFilter]);

  // Algorithm: Enhanced expense statistics with category insights
  const expenseStats = useMemo(() => {
    const stats = {
      total: 0,
      byAccessType: {
        hotspot: 0,
        pppoe: 0,
        both: 0,
        general: 0
      },
      byCategory: {},
      categoryCount: {}
    };

    filteredExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      stats.total += amount;
      stats.byAccessType[expense.access_type] += amount;
      
      const categoryName = categoryMap[expense.category]?.name || 'Unknown';
      stats.byCategory[categoryName] = (stats.byCategory[categoryName] || 0) + amount;
      stats.categoryCount[categoryName] = (stats.categoryCount[categoryName] || 0) + 1;
    });

    return stats;
  }, [filteredExpenses, categoryMap]);

  const ExpenseCard = ({ expense }) => {
    const category = categoryMap[expense.category];
    
    return (
      <div className={`p-4 rounded-lg border transition-all duration-300 ${
        theme === "dark" 
          ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" 
          : "bg-white border-gray-200 hover:bg-gray-50"
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <AccessTypeBadge accessType={expense.access_type} theme={theme} size="sm" />
            <span className={`text-xs px-2 py-1 rounded-full ${
              category?.is_predefined 
                ? theme === "dark" ? "bg-blue-900/50 text-blue-300" : "bg-blue-100 text-blue-700"
                : theme === "dark" ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700"
            }`}>
              {category?.name || 'Unknown Category'}
              {category?.is_predefined && ' (System)'}
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
              KES {parseFloat(expense.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
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
  };

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
              Manage and track expenses across different access types and categories
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={fetchExpenseCategories}
              disabled={categoriesLoading}
              className={`flex items-center px-4 py-2 rounded-lg ${
                theme === "dark" 
                  ? "bg-gray-700 hover:bg-gray-600 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              } disabled:opacity-50`}
            >
              {categoriesLoading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSpinner className="mr-2" />
              )}
              Refresh
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              <FaPlus className="mr-2" />
              Add Expense
            </button>
          </div>
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
            options={categoryOptions}
            placeholder="Category"
            theme={theme}
            className="w-48"
            disabled={categoriesLoading}
          />
        </div>
      </div>

      {/* Expense Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Total Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
            KES {expenseStats.total.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-green-500 bg-green-900/20" : "border-green-500 bg-green-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>Hotspot Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
            KES {expenseStats.byAccessType.hotspot.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border-l-4 ${
          theme === "dark" ? "border-purple-500 bg-purple-900/20" : "border-purple-500 bg-purple-50"
        }`}>
          <h3 className={`text-sm ${textSecondaryClass} mb-1`}>PPPoE Expenses</h3>
          <p className={`text-2xl font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
            KES {expenseStats.byAccessType.pppoe.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
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

      {/* Category Breakdown */}
      {Object.keys(expenseStats.byCategory).length > 0 && (
        <div className={`${cardClass} p-6 transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Expense Breakdown by Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(expenseStats.byCategory).map(([category, amount]) => (
              <div key={category} className={`p-3 rounded-lg border ${
                theme === "dark" ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {category}
                  </span>
                  <span className={`text-sm font-semibold ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                    KES {amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(amount / expenseStats.total) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {expenseStats.categoryCount[category]} expenses
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExpenseFormModal
        showExpenseModal={showExpenseModal}
        setShowExpenseModal={setShowExpenseModal}
        editingExpense={editingExpense}
        expenseForm={expenseForm}
        handleExpenseInputChange={handleExpenseInputChange}
        formErrors={formErrors}
        theme={theme}
        cardClass={cardClass}
        inputClass={inputClass}
        textSecondaryClass={textSecondaryClass}
        loading={loading}
        resetExpenseForm={resetExpenseForm}
        accessTypeOptions={accessTypeOptions}
        categoriesLoading={categoriesLoading}
        categoryOptions={categoryOptions}
        setShowCategoryModal={setShowCategoryModal}
        handleSaveExpense={handleSaveExpense}
        onRefresh={onRefresh}
        expenseCategories={expenseCategories}
        setDeletingCategory={setDeletingCategory}
      />
      
      <CategoryCreationModal
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        creatingCategory={creatingCategory}
        handleCreateCategory={handleCreateCategory}
        theme={theme}
        cardClass={cardClass}
        inputClass={inputClass}
        textSecondaryClass={textSecondaryClass}
        expenseCategories={expenseCategories}
        handleDeleteCategory={handleDeleteCategory}
      />
      
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
      
      <ConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${deletingCategory?.name}"? This action cannot be undone.${
          deletingCategory && categoryMap[deletingCategory.id]?.expense_count > 0 
            ? ` This category is used in ${categoryMap[deletingCategory.id].expense_count} expense(s) and cannot be deleted.`
            : ''
        }`}
        confirmText="Delete Category"
        type="danger"
        theme={theme}
        disabled={deletingCategory && categoryMap[deletingCategory.id]?.expense_count > 0}
      />
    </div>
  );
};

export default ExpenseManagement;