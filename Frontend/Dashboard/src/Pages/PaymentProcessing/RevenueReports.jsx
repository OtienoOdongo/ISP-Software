



// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { toast, ToastContainer } from 'react-toastify';
// import {
//   FaSearch,
//   FaDownload,
//   FaSortAmountDown,
//   FaSortAmountUp,
//   FaCalendarAlt,
//   FaMoneyBillWave,
//   FaReceipt,
//   FaPlus,
//   FaEdit,
//   FaSave,
//   FaTrash,
//   FaSpinner,
// } from 'react-icons/fa';
// import { AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import 'react-toastify/dist/ReactToastify.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { format, parseISO } from 'date-fns';
// import debounce from 'lodash.debounce';
// import api from '../../api'; // Your API configuration

// const PaymentReconciliation = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [viewMode, setViewMode] = useState('all');
//   const [reconciliationData, setReconciliationData] = useState({
//     revenue: { transactions: [], summary: { total_amount: 0, net_amount: 0, tax_breakdown: [], record_count: 0 } },
//     expenses: { expenses: [], summary: { total_amount: 0, net_amount: 0, tax_breakdown: [], record_count: 0 } },
//     overall_summary: { total_revenue: 0, total_expenses: 0, total_tax: 0, net_profit: 0, net_revenue: 0, net_expenses: 0 },
//     tax_configuration: []
//   });
//   const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
//   const [newExpense, setNewExpense] = useState({
//     description: '',
//     amount: '',
//     category: '',
//     date: new Date().toISOString().split('T')[0],
//   });
//   const [editingCategories, setEditingCategories] = useState(false);
//   const [expenseCategories, setExpenseCategories] = useState([]);
//   const [newCategory, setNewCategory] = useState('');
//   const [taxes, setTaxes] = useState([]);
//   const [showTaxConfig, setShowTaxConfig] = useState(false);
//   const [newTax, setNewTax] = useState({
//     name: '',
//     rate: 0,
//     description: '',
//     applies_to: 'revenue',
//     is_enabled: true,
//     is_included_in_price: false,
//     tax_type: 'custom'
//   });
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

//   const modalRef = useRef(null);
//   const taxModalRef = useRef(null);
//   const searchInputRef = useRef(null);

//   // Debounce search
//   const debouncedSetSearchTerm = useMemo(
//     () => debounce((value) => setSearchTerm(value), 300),
//     []
//   );

//   useEffect(() => {
//     return () => debouncedSetSearchTerm.cancel();
//   }, [debouncedSetSearchTerm]);

//   // Fetch reconciliation data
//   const fetchReconciliationData = useCallback(async (signal) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = {
//         start_date: format(startDate, 'yyyy-MM-dd'),
//         end_date: format(endDate, 'yyyy-MM-dd'),
//         view_mode: viewMode,
//         search: searchTerm,
//         sort_by: sortDirection
//       };

//       const response = await api.get('/api/payments/reconciliation/', { 
//         params,
//         signal 
//       });

//       if (signal.aborted) return;

//       setReconciliationData(response.data);
//       setTaxes(response.data.tax_configuration || []);
      
//     } catch (err) {
//       if (!signal.aborted) {
//         const errorMessage = err.response?.data?.error || 'Failed to load reconciliation data. Please try again.';
//         setError(errorMessage);
//         console.error('Error fetching reconciliation data:', err);
//         toast.error(errorMessage);
//       }
//     } finally {
//       if (!signal.aborted) setLoading(false);
//     }
//   }, [startDate, endDate, viewMode, searchTerm, sortDirection]);

//   // Fetch expense categories
//   const fetchExpenseCategories = useCallback(async () => {
//     try {
//       const response = await api.get('/api/payments/expense-categories/');
//       setExpenseCategories(response.data);
//       if (response.data.length > 0 && !newExpense.category) {
//         setNewExpense(prev => ({ ...prev, category: response.data[0].id }));
//       }
//     } catch (err) {
//       console.error('Error fetching expense categories:', err);
//       toast.error('Failed to load expense categories');
//     }
//   }, [newExpense.category]);

//   // Fetch initial data
//   useEffect(() => {
//     const controller = new AbortController();
//     fetchReconciliationData(controller.signal);
//     fetchExpenseCategories();
//     return () => controller.abort();
//   }, [fetchReconciliationData, fetchExpenseCategories, refreshCount]);

//   const handleRefresh = useCallback(() => {
//     setRefreshCount((prev) => prev + 1);
//     toast.info('Refreshing data...', { autoClose: 2000 });
//   }, []);

//   const handleResetFilters = useCallback(() => {
//     setSearchTerm('');
//     setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
//     setEndDate(new Date());
//     setViewMode('all');
//     setSortDirection('date_desc');
//     toast.info('Filters reset', { autoClose: 2000 });
//   }, []);

//   const toggleSort = useCallback((type) => {
//     setSortDirection((prev) =>
//       type === 'amount'
//         ? prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'
//         : prev === 'date_asc' ? 'date_desc' : 'date_asc'
//     );
//   }, []);

//   // Tax calculations
//   const calculateTaxes = useCallback((amount, type) => {
//     if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return [];
//     const applicableTaxes = taxes.filter(
//       (tax) => tax.is_enabled && (tax.applies_to === type || tax.applies_to === 'both') && !isNaN(tax.rate)
//     );
//     return applicableTaxes.map((tax) => {
//       let taxableAmount = amount;
//       let taxAmount = 0;
      
//       if (tax.is_included_in_price) {
//         // Tax is included in price
//         taxableAmount = amount / (1 + tax.rate / 100);
//         taxAmount = taxableAmount * (tax.rate / 100);
//       } else {
//         // Tax is added on top
//         taxAmount = amount * (tax.rate / 100);
//       }
      
//       return { 
//         ...tax, 
//         amount: taxAmount, 
//         taxable_amount: taxableAmount 
//       };
//     });
//   }, [taxes]);

//   const calculateNetAmount = useCallback((amount, type) => {
//     if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
//     const applicableTaxes = taxes.filter(
//       (tax) => tax.is_enabled && (tax.applies_to === type || tax.applies_to === 'both') && tax.is_included_in_price && !isNaN(tax.rate)
//     );
//     if (applicableTaxes.length === 0) return amount;
//     const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + Number(tax.rate), 0);
//     if (totalTaxRate === 0) return amount;
//     return amount / (1 + totalTaxRate / 100);
//   }, [taxes]);

//   const calculateGrossAmount = useCallback((amount, type) => {
//     if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
//     const applicableTaxes = taxes.filter(
//       (tax) => tax.is_enabled && (tax.applies_to === type || tax.applies_to === 'both') && !tax.is_included_in_price && !isNaN(tax.rate)
//     );
//     if (applicableTaxes.length === 0) return amount;
//     const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
//     return amount * (1 + totalTaxRate / 100);
//   }, [taxes]);

//   // Generate report
//   const generateReport = useCallback(async (type) => {
//     setIsGeneratingReport(true);
//     try {
//       const hasRevenueData = (viewMode === 'all' || viewMode === 'revenue') && reconciliationData.revenue.transactions.length > 0;
//       const hasExpenseData = (viewMode === 'all' || viewMode === 'expenses') && reconciliationData.expenses.expenses.length > 0;

//       if (!hasRevenueData && !hasExpenseData) {
//         toast.warning('No data available to generate report', { autoClose: 3000 });
//         return;
//       }

//       if (type === 'pdf') {
//         const doc = new jsPDF();
//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
//         doc.setFontSize(10);
//         doc.setTextColor(100);
//         doc.text(`Date Range: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`, 14, 25);
//         doc.text(`View Mode: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);

//         const enabledTaxes = taxes.filter((tax) => tax.is_enabled);
//         doc.text(
//           enabledTaxes.length > 0
//             ? `Taxes: ${enabledTaxes.map((tax) => `${tax.name} (${tax.rate}%)`).join(', ')}`
//             : 'Tax Calculation: Disabled',
//           14,
//           35
//         );

//         let startY = 45;

//         if (hasRevenueData) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('REVENUE', 14, startY);
//           startY += 10;

//           const revenueHeaders = [
//             ['Payment ID', 'User', 'Source', 'Category', 'Net Amount (KES)'],
//             ...taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => [`${tax.name} (${tax.rate}%)`]),
//             ['Gross Amount (KES)', 'Date'],
//           ].flat();

//           const revenueData = reconciliationData.revenue.transactions.map((transaction) => {
//             const transactionTaxes = calculateTaxes(transaction.amount, 'revenue');
//             const netAmount = calculateNetAmount(transaction.amount, 'revenue');
//             const grossAmount = calculateGrossAmount(transaction.amount, 'revenue');
            
//             const rowData = [
//               transaction.transaction_id,
//               transaction.user_name,
//               transaction.source,
//               transaction.category,
//               netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//             ];
            
//             taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).forEach((tax) => {
//               const taxAmount = transactionTaxes.find((t) => t.id === tax.id)?.amount || 0;
//               rowData.push(taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }));
//             });
            
//             rowData.push(
//               grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//               format(parseISO(transaction.date), 'dd/MM/yyyy')
//             );
//             return rowData;
//           });

//           doc.autoTable({
//             head: [revenueHeaders],
//             body: revenueData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [40, 53, 147], textColor: 255 },
//             alternateRowStyles: { fillColor: [240, 240, 240] },
//           });

//           startY = doc.lastAutoTable.finalY + 10;
//         }

//         if (hasExpenseData) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('EXPENSES', 14, startY);
//           startY += 10;

//           const expenseHeaders = [
//             ['Expense ID', 'Description', 'Category', 'Amount (KES)'],
//             ...taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => [`${tax.name} (${tax.rate}%)`]),
//             ['Net Amount (KES)', 'Date'],
//           ].flat();

//           const expenseData = reconciliationData.expenses.expenses.map((expense) => {
//             const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
//             const netAmount = calculateNetAmount(expense.amount, 'expenses');
//             const grossAmount = calculateGrossAmount(expense.amount, 'expenses');
            
//             const rowData = [
//               expense.expense_id,
//               expense.description || 'N/A',
//               expense.category_name,
//               grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//             ];
            
//             taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).forEach((tax) => {
//               const taxAmount = expenseTaxes.find((t) => t.id === tax.id)?.amount || 0;
//               rowData.push(taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }));
//             });
            
//             rowData.push(
//               netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
//               format(parseISO(expense.date), 'dd/MM/yyyy')
//             );
//             return rowData;
//           });

//           doc.autoTable({
//             head: [expenseHeaders],
//             body: expenseData,
//             startY,
//             styles: { fontSize: 8 },
//             headStyles: { fillColor: [153, 0, 0], textColor: 255 },
//             alternateRowStyles: { fillColor: [255, 240, 240] },
//           });

//           startY = doc.lastAutoTable.finalY + 10;
//         }

//         // Add summary section
//         doc.setFontSize(10);
//         doc.setTextColor(40, 53, 147);

//         if (viewMode === 'all' || viewMode === 'revenue') {
//           doc.text(`Total Revenue: KES ${reconciliationData.overall_summary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//           doc.text(`Net Revenue: KES ${reconciliationData.overall_summary.net_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//         }

//         if (viewMode === 'all' || viewMode === 'expenses') {
//           doc.text(`Total Expenses: KES ${reconciliationData.overall_summary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//           doc.text(`Net Expenses: KES ${reconciliationData.overall_summary.net_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//         }

//         if (viewMode === 'all') {
//           doc.text(`Total Tax: KES ${reconciliationData.overall_summary.total_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//           doc.text(`Net Profit: KES ${reconciliationData.overall_summary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
//           startY += 5;
//         }

//         doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, startY);
//         doc.save(`Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (type === 'csv') {
//         toast.info('Preparing CSV download...', { autoClose: 2000 });
//       }
//     } catch (err) {
//       console.error('Report generation error:', err);
//       const errorMessage = err.message.includes('jsPDF')
//         ? 'Failed to generate PDF. Please ensure your browser supports PDF generation.'
//         : 'An unexpected error occurred while generating the report.';
//       toast.error(errorMessage, { autoClose: 5000 });
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   }, [reconciliationData, viewMode, startDate, endDate, taxes, calculateTaxes, calculateNetAmount, calculateGrossAmount]);

//   // CSV data preparation
//   const csvData = useMemo(() => {
//     const mapRevenue = (transaction) => {
//       const transactionTaxes = calculateTaxes(transaction.amount, 'revenue');
//       const netAmount = calculateNetAmount(transaction.amount, 'revenue');
//       const grossAmount = calculateGrossAmount(transaction.amount, 'revenue');
      
//       const baseData = {
//         Type: 'Revenue',
//         ID: transaction.transaction_id,
//         User: transaction.user_name,
//         Source: transaction.source,
//         Description: '',
//         Category: transaction.category,
//         'Net Amount (KES)': netAmount.toFixed(2),
//       };
      
//       taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).forEach((tax) => {
//         baseData[`${tax.name} (${tax.rate}%)`] = transactionTaxes.find((t) => t.id === tax.id)?.amount.toFixed(2) || '0.00';
//       });
      
//       baseData['Gross Amount (KES)'] = grossAmount.toFixed(2);
//       baseData['Date'] = format(parseISO(transaction.date), 'dd/MM/yyyy');
//       return baseData;
//     };

//     const mapExpense = (expense) => {
//       const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
//       const netAmount = calculateNetAmount(expense.amount, 'expenses');
//       const grossAmount = calculateGrossAmount(expense.amount, 'expenses');
      
//       const baseData = {
//         Type: 'Expense',
//         ID: expense.expense_id,
//         User: '',
//         Source: '',
//         Description: expense.description || 'N/A',
//         Category: expense.category_name,
//         'Net Amount (KES)': netAmount.toFixed(2),
//       };
      
//       taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).forEach((tax) => {
//         baseData[`${tax.name} (${tax.rate}%)`] = expenseTaxes.find((t) => t.id === tax.id)?.amount.toFixed(2) || '0.00';
//       });
      
//       baseData['Gross Amount (KES)'] = grossAmount.toFixed(2);
//       baseData['Date'] = format(parseISO(expense.date), 'dd/MM/yyyy');
//       return baseData;
//     };

//     if (viewMode === 'all') {
//       return [
//         ...reconciliationData.revenue.transactions.map(mapRevenue),
//         ...reconciliationData.expenses.expenses.map(mapExpense)
//       ];
//     } else if (viewMode === 'revenue') {
//       return reconciliationData.revenue.transactions.map(mapRevenue);
//     } else {
//       return reconciliationData.expenses.expenses.map(mapExpense);
//     }
//   }, [reconciliationData, viewMode, taxes, calculateTaxes, calculateNetAmount, calculateGrossAmount]);

//   const csvHeaders = useMemo(() => {
//     const baseHeaders = [
//       { label: 'Type', key: 'Type' },
//       { label: 'ID', key: 'ID' },
//       { label: 'User', key: 'User' },
//       { label: 'Source', key: 'Source' },
//       { label: 'Description', key: 'Description' },
//       { label: 'Category', key: 'Category' },
//       { label: 'Net Amount (KES)', key: 'Net Amount (KES)' },
//     ];
    
//     const taxHeaders = taxes
//       .filter((tax) => tax.is_enabled)
//       .map((tax) => ({ label: `${tax.name} (${tax.rate}%)`, key: `${tax.name} (${tax.rate}%)` }));
    
//     return [
//       ...baseHeaders,
//       ...taxHeaders,
//       { label: 'Gross Amount (KES)', key: 'Gross Amount (KES)' },
//       { label: 'Date', key: 'Date' }
//     ];
//   }, [taxes]);

//   // Expense modal handlers
//   const openAddExpenseModal = useCallback(() => setShowAddExpenseModal(true), []);

//   const closeAddExpenseModal = useCallback(() => {
//     setShowAddExpenseModal(false);
//     setNewExpense({
//       description: '',
//       amount: '',
//       category: expenseCategories[0]?.id || '',
//       date: new Date().toISOString().split('T')[0],
//     });
//     setEditingCategories(false);
//     setNewCategory('');
//   }, [expenseCategories]);

//   const handleExpenseInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setNewExpense((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleAddExpense = useCallback(async () => {
//     if (!newExpense.description.trim()) {
//       toast.error('Description is required');
//       return;
//     }
//     if (!newExpense.amount || isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
//       toast.error('Please enter a valid amount');
//       return;
//     }
//     if (!newExpense.category) {
//       toast.error('Please select a category');
//       return;
//     }

//     try {
//       const expenseData = {
//         description: newExpense.description.trim(),
//         amount: Number(newExpense.amount),
//         category: newExpense.category,
//         date: newExpense.date,
//       };

//       await api.post('/api/payments/manual-expenses/', expenseData);
//       toast.success('Expense added successfully!');
//       closeAddExpenseModal();
//       handleRefresh(); // Refresh data to include new expense
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to add expense';
//       toast.error(errorMessage);
//     }
//   }, [newExpense, closeAddExpenseModal, handleRefresh]);

//   // Tax configuration handlers
//   const toggleTaxConfig = useCallback(() => setShowTaxConfig((prev) => !prev), []);

//   const handleTaxInputChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setNewTax((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   }, []);

//   const handleAddTax = useCallback(async () => {
//     if (!newTax.name.trim()) {
//       toast.error('Tax name is required');
//       return;
//     }
//     const rate = Number(newTax.rate);
//     if (isNaN(rate) || rate < 0 || rate > 100) {
//       toast.error('Tax rate must be a number between 0 and 100');
//       return;
//     }

//     try {
//       await api.post('/api/payments/taxes/', newTax);
//       toast.success('Tax added successfully!');
//       setNewTax({
//         name: '',
//         rate: 0,
//         description: '',
//         applies_to: 'revenue',
//         is_enabled: true,
//         is_included_in_price: false,
//         tax_type: 'custom'
//       });
//       handleRefresh(); // Refresh to get updated tax config
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to add tax';
//       toast.error(errorMessage);
//     }
//   }, [newTax, handleRefresh]);

//   const handleToggleTax = useCallback(async (taxId, isEnabled) => {
//     try {
//       await api.patch(`/api/payments/taxes/${taxId}/`, { is_enabled: isEnabled });
//       setTaxes((prev) => prev.map((tax) => (tax.id === taxId ? { ...tax, is_enabled: isEnabled } : tax)));
//       toast.success(`Tax ${isEnabled ? 'enabled' : 'disabled'} successfully`);
//     } catch (err) {
//       toast.error('Failed to update tax status');
//     }
//   }, []);

//   const handleRemoveTax = useCallback(async (taxId) => {
//     if (taxes.length <= 1) {
//       toast.error('You must have at least one tax configured');
//       return;
//     }
//     try {
//       await api.delete(`/api/payments/taxes/${taxId}/`);
//       setTaxes((prev) => prev.filter((tax) => tax.id !== taxId));
//       toast.success('Tax removed successfully!');
//     } catch (err) {
//       toast.error('Failed to remove tax');
//     }
//   }, [taxes]);

//   // Category management
//   const toggleCategoryEditing = useCallback(() => setEditingCategories((prev) => !prev), []);

//   const handleAddCategory = useCallback(async () => {
//     const trimmedCategory = newCategory.trim();
//     if (!trimmedCategory) {
//       toast.error('Category name cannot be empty');
//       return;
//     }

//     try {
//       await api.post('/api/payments/expense-categories/', { name: trimmedCategory });
//       setNewCategory('');
//       toast.success('Category added successfully!');
//       fetchExpenseCategories(); // Refresh categories
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to add category';
//       toast.error(errorMessage);
//     }
//   }, [newCategory, fetchExpenseCategories]);

//   // Modal focus trap
//   useEffect(() => {
//     if (showAddExpenseModal || showTaxConfig) {
//       const currentModalRef = showAddExpenseModal ? modalRef.current : taxModalRef.current;
//       const focusableElements = currentModalRef.querySelectorAll(
//         'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
//       );
//       const firstElement = focusableElements[0];
//       const lastElement = focusableElements[focusableElements.length - 1];

//       const handleKeyDown = (e) => {
//         if (e.key === 'Tab') {
//           if (e.shiftKey && document.activeElement === firstElement) {
//             e.preventDefault();
//             lastElement.focus();
//           } else if (!e.shiftKey && document.activeElement === lastElement) {
//             e.preventDefault();
//             firstElement.focus();
//           }
//         }
//         if (e.key === 'Escape') {
//           showAddExpenseModal ? closeAddExpenseModal() : toggleTaxConfig();
//         }
//       };

//       currentModalRef.addEventListener('keydown', handleKeyDown);
//       firstElement?.focus();

//       return () => currentModalRef.removeEventListener('keydown', handleKeyDown);
//     }
//   }, [showAddExpenseModal, showTaxConfig, closeAddExpenseModal, toggleTaxConfig]);

//   // Category item component
//   const CategoryItem = React.memo(({ category, onRemove }) => (
//     <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
//       <span className="text-sm">{category.name}</span>
//       <button
//         onClick={() => onRemove(category.id)}
//         className="ml-1 text-red-500 hover:text-red-700"
//         aria-label={`Remove ${category.name} category`}
//       >
//         ×
//       </button>
//     </div>
//   ));

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
//             <FaMoneyBillWave className="mr-2 text-blue-600" /> Payment Reconciliation
//           </h1>
//           <div className="flex items-center space-x-2 mt-2 md:mt-0">
//             <button
//               onClick={handleRefresh}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="Refresh data"
//             >
//               <AiOutlineReload className="mr-1" /> Refresh
//             </button>
//             <button
//               onClick={handleResetFilters}
//               className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               aria-label="Reset filters"
//             >
//               Reset Filters
//             </button>
//             <div className="relative">
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => date && setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="Select start date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//             <span className="text-gray-500">to</span>
//             <div className="relative">
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => date && setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 maxDate={new Date()}
//                 className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
//                 dateFormat="dd/MM/yyyy"
//                 aria-label="Select end date"
//               />
//               <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         {/* Tax Configuration Section */}
//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-lg font-medium text-gray-800">Tax Configuration</h2>
//             <button
//               onClick={toggleTaxConfig}
//               className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               aria-label={showTaxConfig ? 'Hide tax configuration' : 'Show tax configuration'}
//             >
//               {showTaxConfig ? 'Hide Tax Settings' : 'Configure Taxes'}
//             </button>
//           </div>

//           {showTaxConfig && (
//             <div ref={taxModalRef} className="mt-4 p-4 border rounded-lg bg-gray-50">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={newTax.name}
//                     onChange={handleTaxInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="e.g. VAT, Withholding Tax"
//                     aria-label="Tax name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
//                   <input
//                     type="number"
//                     name="rate"
//                     value={newTax.rate}
//                     onChange={handleTaxInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="e.g. 16 for 16%"
//                     min="0"
//                     max="100"
//                     step="0.1"
//                     aria-label="Tax rate"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                   <input
//                     type="text"
//                     name="description"
//                     value={newTax.description}
//                     onChange={handleTaxInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Tax description"
//                     aria-label="Tax description"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
//                   <select
//                     name="applies_to"
//                     value={newTax.applies_to}
//                     onChange={handleTaxInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                     aria-label="Tax applies to"
//                   >
//                     <option value="revenue">Revenue</option>
//                     <option value="expenses">Expenses</option>
//                     <option value="both">Both</option>
//                   </select>
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="is_included_in_price"
//                     name="is_included_in_price"
//                     checked={newTax.is_included_in_price}
//                     onChange={handleTaxInputChange}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     aria-label="Tax included in price"
//                   />
//                   <label htmlFor="is_included_in_price" className="ml-2 block text-sm text-gray-700">
//                     Tax is included in price
//                   </label>
//                 </div>
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="is_enabled"
//                     name="is_enabled"
//                     checked={newTax.is_enabled}
//                     onChange={handleTaxInputChange}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     aria-label="Tax enabled"
//                   />
//                   <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-700">
//                     Enabled by default
//                   </label>
//                 </div>
//               </div>
//               <button
//                 onClick={handleAddTax}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 aria-label="Add tax"
//               >
//                 Add Tax
//               </button>

//               <div className="mt-4">
//                 <h3 className="text-sm font-medium text-gray-700 mb-2">Configured Taxes</h3>
//                 {taxes.length === 0 ? (
//                   <p className="text-sm text-gray-500">No taxes configured</p>
//                 ) : (
//                   <ul className="divide-y divide-gray-200">
//                     {taxes.map((tax) => (
//                       <li key={tax.id} className="py-3 flex justify-between items-center">
//                         <div>
//                           <div className="flex items-center">
//                             <span className="font-medium">{tax.name} ({tax.rate}%)</span>
//                             <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                               {tax.applies_to}
//                             </span>
//                             {tax.is_included_in_price && (
//                               <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
//                                 Included
//                               </span>
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-500">{tax.description}</p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <div className="relative inline-block w-10">
//                             <input
//                               type="checkbox"
//                               id={`toggle-${tax.id}`}
//                               checked={tax.is_enabled}
//                               onChange={(e) => handleToggleTax(tax.id, e.target.checked)}
//                               className="sr-only"
//                               aria-label={`Toggle ${tax.name} tax`}
//                             />
//                             <label
//                               htmlFor={`toggle-${tax.id}`}
//                               className={`relative inline-block w-10 h-6 rounded-full cursor-pointer ${
//                                 tax.is_enabled ? 'bg-green-500' : 'bg-gray-300'
//                               }`}
//                             >
//                               <span
//                                 className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
//                                   tax.is_enabled ? 'translate-x-4' : ''
//                                 }`}
//                               />
//                             </label>
//                           </div>
//                           <button
//                             onClick={() => handleRemoveTax(tax.id)}
//                             className="text-red-500 hover:text-red-700"
//                             aria-label={`Remove ${tax.name} tax`}
//                           >
//                             <FaTrash />
//                           </button>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
//               <h3 className="text-sm font-medium text-blue-800">Revenue Taxes</h3>
//               {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).length > 0 ? (
//                 <ul className="mt-1 space-y-1">
//                   {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => (
//                     <li key={tax.id} className="flex justify-between text-sm">
//                       <span>{tax.name} ({tax.rate}%)</span>
//                       <span className="font-medium">
//                         KES {calculateTaxes(reconciliationData.overall_summary.total_revenue, 'revenue').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-blue-600 mt-1">No taxes applied to revenue</p>
//               )}
//             </div>
//             <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
//               <h3 className="text-sm font-medium text-purple-800">Expense Taxes</h3>
//               {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).length > 0 ? (
//                 <ul className="mt-1 space-y-1">
//                   {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => (
//                     <li key={tax.id} className="flex justify-between text-sm">
//                       <span>{tax.name} ({tax.rate}%)</span>
//                       <span className="font-medium">
//                         KES {calculateTaxes(reconciliationData.overall_summary.total_expenses, 'expenses').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-purple-600 mt-1">No taxes applied to expenses</p>
//               )}
//             </div>
//             <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//               <h3 className="text-sm font-medium text-green-800">Total Tax Liability</h3>
//               <p className="text-lg font-bold text-green-700 mt-1">
//                 KES {reconciliationData.overall_summary.total_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Total Revenue</h3>
//             <p className="text-2xl font-bold text-green-600">
//               KES {reconciliationData.overall_summary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//               {reconciliationData.revenue.summary.tax_breakdown.length > 0 && (
//                 <span className="block text-sm font-normal text-gray-500">
//                   (Net: KES {reconciliationData.overall_summary.net_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
//                 </span>
//               )}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Total Expenses</h3>
//             <p className="text-2xl font-bold text-red-600">
//               KES {reconciliationData.overall_summary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//               {reconciliationData.expenses.summary.tax_breakdown.length > 0 && (
//                 <span className="block text-sm font-normal text-gray-500">
//                   (Net: KES {reconciliationData.overall_summary.net_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
//                 </span>
//               )}
//             </p>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition-shadow">
//             <h3 className="text-gray-500 text-sm">Profit (After Tax)</h3>
//             <p className={`text-2xl font-bold ${reconciliationData.overall_summary.net_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
//               KES {reconciliationData.overall_summary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//             </p>
//           </div>
//         </div>

//         {/* Filters and Controls */}
//         <div className="bg-white p-4 rounded-lg shadow mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//             <div className="relative flex-grow">
//               <FaSearch className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 ref={searchInputRef}
//                 type="text"
//                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search by ID, source, user, or category..."
//                 onChange={(e) => debouncedSetSearchTerm(e.target.value)}
//                 aria-label="Search payments and expenses"
//               />
//             </div>
//             <div className="flex space-x-2">
//               <select
//                 className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                 value={viewMode}
//                 onChange={(e) => setViewMode(e.target.value)}
//                 aria-label="Select view mode"
//               >
//                 <option value="all">All</option>
//                 <option value="revenue">Revenue</option>
//                 <option value="expenses">Expenses</option>
//               </select>
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('date')}
//                 aria-label="Sort by date"
//               >
//                 {sortDirection.includes('date') ? (
//                   sortDirection === 'date_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Date
//               </button>
//               <button
//                 className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
//                 onClick={() => toggleSort('amount')}
//                 aria-label="Sort by amount"
//               >
//                 {sortDirection.includes('amount') ? (
//                   sortDirection === 'amount_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
//                 ) : (
//                   <FaSortAmountDown className="mr-1" />
//                 )}
//                 Amount
//               </button>
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => generateReport('pdf')}
//                 disabled={isGeneratingReport}
//                 className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
//                   isGeneratingReport ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//                 aria-label="Generate PDF report"
//               >
//                 {isGeneratingReport ? (
//                   <FaSpinner className="animate-spin mr-2" />
//                 ) : (
//                   <FaDownload className="mr-2" />
//                 )}
//                 PDF
//               </button>
//               <CSVLink
//                 data={csvData}
//                 headers={csvHeaders}
//                 filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
//                 className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//                 aria-label="Download CSV report"
//                 onClick={() => toast.success('CSV download started')}
//               >
//                 <FaDownload className="mr-2" /> CSV
//               </CSVLink>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center py-8" aria-live="polite">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
//             <p>Loading reconciliation data...</p>
//           </div>
//         ) : (
//           <div className="space-y-6" aria-live="polite">
//             {/* Revenue Section */}
//             {(viewMode === 'all' || viewMode === 'revenue') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                     <FaMoneyBillWave className="mr-2 text-green-600" /> Revenue
//                   </h2>
//                   <span className="text-sm text-gray-500">{reconciliationData.revenue.summary.record_count} records</span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Payment ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           User
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Source
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Net Amount (KES)
//                         </th>
//                         {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => (
//                           <th key={tax.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             {tax.name} ({tax.rate}%)
//                           </th>
//                         ))}
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Gross Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {reconciliationData.revenue.transactions.length > 0 ? (
//                         reconciliationData.revenue.transactions.map((transaction) => {
//                           const transactionTaxes = calculateTaxes(transaction.amount, 'revenue');
//                           const netAmount = calculateNetAmount(transaction.amount, 'revenue');
//                           const grossAmount = calculateGrossAmount(transaction.amount, 'revenue');
                          
//                           return (
//                             <tr key={transaction.transaction_id} className="hover:bg-gray-50 transition-colors">
//                               <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{transaction.transaction_id}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.user_name}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.source}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
//                                 {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                               </td>
//                               {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => (
//                                 <td key={tax.id} className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
//                                   {transactionTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
//                                 </td>
//                               ))}
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
//                                 {grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(parseISO(transaction.date), 'dd/MM/yyyy')}</td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td colSpan={6 + taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).length} className="px-6 py-4 text-center text-sm text-gray-500">
//                             No revenue records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Expenses Section */}
//             {(viewMode === 'all' || viewMode === 'expenses') && (
//               <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
//                 <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
//                   <div className="flex items-center">
//                     <h2 className="text-lg font-medium text-gray-900 flex items-center">
//                       <FaReceipt className="mr-2 text-red-600" /> Expenses
//                     </h2>
//                     <button
//                       onClick={openAddExpenseModal}
//                       className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//                       aria-label="Add new expense"
//                     >
//                       <FaPlus className="mr-1" /> Add Expense
//                     </button>
//                   </div>
//                   <span className="text-sm text-gray-500">{reconciliationData.expenses.summary.record_count} records</span>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Expense ID
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Description
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Category
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount (KES)
//                         </th>
//                         {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => (
//                           <th key={tax.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             {tax.name} ({tax.rate}%)
//                           </th>
//                         ))}
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Net Amount (KES)
//                         </th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {reconciliationData.expenses.expenses.length > 0 ? (
//                         reconciliationData.expenses.expenses.map((expense) => {
//                           const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
//                           const netAmount = calculateNetAmount(expense.amount, 'expenses');
//                           const grossAmount = calculateGrossAmount(expense.amount, 'expenses');
                          
//                           return (
//                             <tr key={expense.expense_id} className="hover:bg-gray-50 transition-colors">
//                               <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{expense.expense_id}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description || 'N/A'}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category_name}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
//                                 {grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                               </td>
//                               {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => (
//                                 <td key={tax.id} className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
//                                   {expenseTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
//                                 </td>
//                               ))}
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
//                                 {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(parseISO(expense.date), 'dd/MM/yyyy')}</td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td colSpan={5 + taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).length} className="px-6 py-4 text-center text-sm text-gray-500">
//                             No expense records found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Add Expense Modal */}
//       {showAddExpenseModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
//           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//               <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAddExpenseModal}></div>
//             </div>
//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
//             <div
//               ref={modalRef}
//               className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
//             >
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-semibold text-gray-800">Add New Expense</h2>
//                   <button
//                     onClick={closeAddExpenseModal}
//                     className="text-gray-500 hover:text-gray-700 focus:outline-none"
//                     aria-label="Close add expense modal"
//                   >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                       Description
//                     </label>
//                     <input
//                       type="text"
//                       id="description"
//                       name="description"
//                       value={newExpense.description}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="What was this expense for?"
//                       required
//                       aria-label="Expense description"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//                       Amount (KES)
//                     </label>
//                     <input
//                       type="number"
//                       id="amount"
//                       name="amount"
//                       value={newExpense.amount}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="0.00"
//                       min="0"
//                       step="0.01"
//                       required
//                       aria-label="Expense amount"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//                       Category
//                     </label>
//                     <select
//                       id="category"
//                       name="category"
//                       value={newExpense.category}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
//                       required
//                       aria-label="Select expense category"
//                     >
//                       <option value="">Select a category</option>
//                       {expenseCategories.map((category) => (
//                         <option key={category.id} value={category.id}>{category.name}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       id="date"
//                       name="date"
//                       value={newExpense.date}
//                       onChange={handleExpenseInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                       max={new Date().toISOString().split('T')[0]}
//                       required
//                       aria-label="Select expense date"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                 <button
//                   onClick={handleAddExpense}
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//                   aria-label="Add expense"
//                 >
//                   Add Expense
//                 </button>
//                 <button
//                   onClick={closeAddExpenseModal}
//                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
//                   aria-label="Cancel adding expense"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <ToastContainer position="top-right" autoClose={5000} />
//     </div>
//   );
// };

// export default PaymentReconciliation;









import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import {
  FaSearch,
  FaDownload,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaPlus,
  FaEdit,
  FaSave,
  FaTrash,
  FaSpinner,
} from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import debounce from 'lodash.debounce';
import api from '../../api'; 
import { useTheme } from "../../context/ThemeContext";

const RevenueReports = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState('date_desc');
  const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [viewMode, setViewMode] = useState('all');
  const [reconciliationData, setReconciliationData] = useState({
    revenue: { transactions: [], summary: { total_amount: 0, net_amount: 0, tax_breakdown: [], record_count: 0 } },
    expenses: { expenses: [], summary: { total_amount: 0, net_amount: 0, tax_breakdown: [], record_count: 0 } },
    overall_summary: { total_revenue: 0, total_expenses: 0, total_tax: 0, net_profit: 0, net_revenue: 0, net_expenses: 0 },
    tax_configuration: []
  });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingCategories, setEditingCategories] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [taxes, setTaxes] = useState([]);
  const [showTaxConfig, setShowTaxConfig] = useState(false);
  const [newTax, setNewTax] = useState({
    name: '',
    rate: 0,
    description: '',
    applies_to: 'revenue',
    is_enabled: true,
    is_included_in_price: false,
    tax_type: 'custom'
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const modalRef = useRef(null);
  const taxModalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Theme-based styling variables
  const containerClass = useMemo(() => 
    theme === "dark" 
      ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen p-4 md:p-8" 
      : "bg-gray-50 text-gray-800 min-h-screen p-4 md:p-8",
    [theme]
  );

  const cardClass = useMemo(() => 
    theme === "dark"
      ? "bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-md"
      : "bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md",
    [theme]
  );

  const inputClass = useMemo(() => 
    theme === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500",
    [theme]
  );

  const textSecondaryClass = useMemo(() => 
    theme === "dark" ? "text-gray-400" : "text-gray-500",
    [theme]
  );

  const textTertiaryClass = useMemo(() => 
    theme === "dark" ? "text-gray-500" : "text-gray-400",
    [theme]
  );

  // Debounce search
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearchTerm.cancel();
  }, [debouncedSetSearchTerm]);

  // Fetch reconciliation data
  const fetchReconciliationData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        view_mode: viewMode,
        search: searchTerm,
        sort_by: sortDirection
      };

      const response = await api.get('/api/payments/reconciliation/', { 
        params,
        signal 
      });

      if (signal.aborted) return;

      setReconciliationData(response.data);
      setTaxes(response.data.tax_configuration || []);
      
    } catch (err) {
      if (!signal.aborted) {
        const errorMessage = err.response?.data?.error || 'Failed to load reconciliation data. Please try again.';
        setError(errorMessage);
        console.error('Error fetching reconciliation data:', err);
        toast.error(errorMessage);
      }
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [startDate, endDate, viewMode, searchTerm, sortDirection]);

  // Fetch expense categories
  const fetchExpenseCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/expense-categories/');
      setExpenseCategories(response.data);
      if (response.data.length > 0 && !newExpense.category) {
        setNewExpense(prev => ({ ...prev, category: response.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching expense categories:', err);
      toast.error('Failed to load expense categories');
    }
  }, [newExpense.category]);

  // Fetch initial data
  useEffect(() => {
    const controller = new AbortController();
    fetchReconciliationData(controller.signal);
    fetchExpenseCategories();
    return () => controller.abort();
  }, [fetchReconciliationData, fetchExpenseCategories, refreshCount]);

  const handleRefresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
    toast.info('Refreshing data...', { autoClose: 2000 });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setViewMode('all');
    setSortDirection('date_desc');
    toast.info('Filters reset', { autoClose: 2000 });
  }, []);

  const toggleSort = useCallback((type) => {
    setSortDirection((prev) =>
      type === 'amount'
        ? prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'
        : prev === 'date_asc' ? 'date_desc' : 'date_asc'
    );
  }, []);

  // Tax calculations
  const calculateTaxes = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return [];
    const applicableTaxes = taxes.filter(
      (tax) => tax.is_enabled && (tax.applies_to === type || tax.applies_to === 'both') && !isNaN(tax.rate)
    );
    return applicableTaxes.map((tax) => {
      let taxableAmount = amount;
      let taxAmount = 0;
      
      if (tax.is_included_in_price) {
        // Tax is included in price
        taxableAmount = amount / (1 + tax.rate / 100);
        taxAmount = taxableAmount * (tax.rate / 100);
      } else {
        // Tax is added on top
        taxAmount = amount * (tax.rate / 100);
      }
      
      return { 
        ...tax, 
        amount: taxAmount, 
        taxable_amount: taxableAmount 
      };
    });
  }, [taxes]);

  const calculateNetAmount = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
    const applicableTaxes = taxes.filter(
      (tax) => tax.is_enabled && (tax.applies_to === type || tax.applies_to === 'both') && tax.is_included_in_price && !isNaN(tax.rate)
    );
    if (applicableTaxes.length === 0) return amount;
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + Number(tax.rate), 0);
    if (totalTaxRate === 0) return amount;
    return amount / (1 + totalTaxRate / 100);
  }, [taxes]);

  const calculateGrossAmount = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
    const applicableTaxes = taxes.filter(
      (tax) => tax.is_enabled && (tax.applies_to === type || tax.applies_to === 'both') && !tax.is_included_in_price && !isNaN(tax.rate)
    );
    if (applicableTaxes.length === 0) return amount;
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
    return amount * (1 + totalTaxRate / 100);
  }, [taxes]);

  // Generate report
  const generateReport = useCallback(async (type) => {
    setIsGeneratingReport(true);
    try {
      const hasRevenueData = (viewMode === 'all' || viewMode === 'revenue') && reconciliationData.revenue.transactions.length > 0;
      const hasExpenseData = (viewMode === 'all' || viewMode === 'expenses') && reconciliationData.expenses.expenses.length > 0;

      if (!hasRevenueData && !hasExpenseData) {
        toast.warning('No data available to generate report', { autoClose: 3000 });
        return;
      }

      if (type === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.setTextColor(40, 53, 147);
        doc.text('PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Date Range: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`, 14, 25);
        doc.text(`View Mode: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);

        const enabledTaxes = taxes.filter((tax) => tax.is_enabled);
        doc.text(
          enabledTaxes.length > 0
            ? `Taxes: ${enabledTaxes.map((tax) => `${tax.name} (${tax.rate}%)`).join(', ')}`
            : 'Tax Calculation: Disabled',
          14,
          35
        );

        let startY = 45;

        if (hasRevenueData) {
          doc.setFontSize(12);
          doc.setTextColor(40, 53, 147);
          doc.text('REVENUE', 14, startY);
          startY += 10;

          const revenueHeaders = [
            ['Payment ID', 'User', 'Source', 'Category', 'Net Amount (KES)'],
            ...taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => [`${tax.name} (${tax.rate}%)`]),
            ['Gross Amount (KES)', 'Date'],
          ].flat();

          const revenueData = reconciliationData.revenue.transactions.map((transaction) => {
            const transactionTaxes = calculateTaxes(transaction.amount, 'revenue');
            const netAmount = calculateNetAmount(transaction.amount, 'revenue');
            const grossAmount = calculateGrossAmount(transaction.amount, 'revenue');
            
            const rowData = [
              transaction.transaction_id,
              transaction.user_name,
              transaction.source,
              transaction.category,
              netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
            ];
            
            taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).forEach((tax) => {
              const taxAmount = transactionTaxes.find((t) => t.id === tax.id)?.amount || 0;
              rowData.push(taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }));
            });
            
            rowData.push(
              grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
              format(parseISO(transaction.date), 'dd/MM/yyyy')
            );
            return rowData;
          });

          doc.autoTable({
            head: [revenueHeaders],
            body: revenueData,
            startY,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 53, 147], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
          });

          startY = doc.lastAutoTable.finalY + 10;
        }

        if (hasExpenseData) {
          doc.setFontSize(12);
          doc.setTextColor(40, 53, 147);
          doc.text('EXPENSES', 14, startY);
          startY += 10;

          const expenseHeaders = [
            ['Expense ID', 'Description', 'Category', 'Amount (KES)'],
            ...taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => [`${tax.name} (${tax.rate}%)`]),
            ['Net Amount (KES)', 'Date'],
          ].flat();

          const expenseData = reconciliationData.expenses.expenses.map((expense) => {
            const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
            const netAmount = calculateNetAmount(expense.amount, 'expenses');
            const grossAmount = calculateGrossAmount(expense.amount, 'expenses');
            
            const rowData = [
              expense.expense_id,
              expense.description || 'N/A',
              expense.category_name,
              grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
            ];
            
            taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).forEach((tax) => {
              const taxAmount = expenseTaxes.find((t) => t.id === tax.id)?.amount || 0;
              rowData.push(taxAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }));
            });
            
            rowData.push(
              netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
              format(parseISO(expense.date), 'dd/MM/yyyy')
            );
            return rowData;
          });

          doc.autoTable({
            head: [expenseHeaders],
            body: expenseData,
            startY,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [153, 0, 0], textColor: 255 },
            alternateRowStyles: { fillColor: [255, 240, 240] },
          });

          startY = doc.lastAutoTable.finalY + 10;
        }

        // Add summary section
        doc.setFontSize(10);
        doc.setTextColor(40, 53, 147);

        if (viewMode === 'all' || viewMode === 'revenue') {
          doc.text(`Total Revenue: KES ${reconciliationData.overall_summary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          doc.text(`Net Revenue: KES ${reconciliationData.overall_summary.net_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
        }

        if (viewMode === 'all' || viewMode === 'expenses') {
          doc.text(`Total Expenses: KES ${reconciliationData.overall_summary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          doc.text(`Net Expenses: KES ${reconciliationData.overall_summary.net_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
        }

        if (viewMode === 'all') {
          doc.text(`Total Tax: KES ${reconciliationData.overall_summary.total_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          doc.text(`Net Profit: KES ${reconciliationData.overall_summary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
        }

        doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 14, startY);
        doc.save(`Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success('PDF report generated successfully');
      } else if (type === 'csv') {
        toast.info('Preparing CSV download...', { autoClose: 2000 });
      }
    } catch (err) {
      console.error('Report generation error:', err);
      const errorMessage = err.message.includes('jsPDF')
        ? 'Failed to generate PDF. Please ensure your browser supports PDF generation.'
        : 'An unexpected error occurred while generating the report.';
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [reconciliationData, viewMode, startDate, endDate, taxes, calculateTaxes, calculateNetAmount, calculateGrossAmount]);

  // CSV data preparation
  const csvData = useMemo(() => {
    const mapRevenue = (transaction) => {
      const transactionTaxes = calculateTaxes(transaction.amount, 'revenue');
      const netAmount = calculateNetAmount(transaction.amount, 'revenue');
      const grossAmount = calculateGrossAmount(transaction.amount, 'revenue');
      
      const baseData = {
        Type: 'Revenue',
        ID: transaction.transaction_id,
        User: transaction.user_name,
        Source: transaction.source,
        Description: '',
        Category: transaction.category,
        'Net Amount (KES)': netAmount.toFixed(2),
      };
      
      taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).forEach((tax) => {
        baseData[`${tax.name} (${tax.rate}%)`] = transactionTaxes.find((t) => t.id === tax.id)?.amount.toFixed(2) || '0.00';
      });
      
      baseData['Gross Amount (KES)'] = grossAmount.toFixed(2);
      baseData['Date'] = format(parseISO(transaction.date), 'dd/MM/yyyy');
      return baseData;
    };

    const mapExpense = (expense) => {
      const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
      const netAmount = calculateNetAmount(expense.amount, 'expenses');
      const grossAmount = calculateGrossAmount(expense.amount, 'expenses');
      
      const baseData = {
        Type: 'Expense',
        ID: expense.expense_id,
        User: '',
        Source: '',
        Description: expense.description || 'N/A',
        Category: expense.category_name,
        'Net Amount (KES)': netAmount.toFixed(2),
      };
      
      taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).forEach((tax) => {
        baseData[`${tax.name} (${tax.rate}%)`] = expenseTaxes.find((t) => t.id === tax.id)?.amount.toFixed(2) || '0.00';
      });
      
      baseData['Gross Amount (KES)'] = grossAmount.toFixed(2);
      baseData['Date'] = format(parseISO(expense.date), 'dd/MM/yyyy');
      return baseData;
    };

    if (viewMode === 'all') {
      return [
        ...reconciliationData.revenue.transactions.map(mapRevenue),
        ...reconciliationData.expenses.expenses.map(mapExpense)
      ];
    } else if (viewMode === 'revenue') {
      return reconciliationData.revenue.transactions.map(mapRevenue);
    } else {
      return reconciliationData.expenses.expenses.map(mapExpense);
    }
  }, [reconciliationData, viewMode, taxes, calculateTaxes, calculateNetAmount, calculateGrossAmount]);

  const csvHeaders = useMemo(() => {
    const baseHeaders = [
      { label: 'Type', key: 'Type' },
      { label: 'ID', key: 'ID' },
      { label: 'User', key: 'User' },
      { label: 'Source', key: 'Source' },
      { label: 'Description', key: 'Description' },
      { label: 'Category', key: 'Category' },
      { label: 'Net Amount (KES)', key: 'Net Amount (KES)' },
    ];
    
    const taxHeaders = taxes
      .filter((tax) => tax.is_enabled)
      .map((tax) => ({ label: `${tax.name} (${tax.rate}%)`, key: `${tax.name} (${tax.rate}%)` }));
    
    return [
      ...baseHeaders,
      ...taxHeaders,
      { label: 'Gross Amount (KES)', key: 'Gross Amount (KES)' },
      { label: 'Date', key: 'Date' }
    ];
  }, [taxes]);

  // Expense modal handlers
  const openAddExpenseModal = useCallback(() => setShowAddExpenseModal(true), []);

  const closeAddExpenseModal = useCallback(() => {
    setShowAddExpenseModal(false);
    setNewExpense({
      description: '',
      amount: '',
      category: expenseCategories[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingCategories(false);
    setNewCategory('');
  }, [expenseCategories]);

  const handleExpenseInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAddExpense = useCallback(async () => {
    if (!newExpense.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!newExpense.amount || isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!newExpense.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      const expenseData = {
        description: newExpense.description.trim(),
        amount: Number(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
      };

      await api.post('/api/payments/manual-expenses/', expenseData);
      toast.success('Expense added successfully!');
      closeAddExpenseModal();
      handleRefresh(); // Refresh data to include new expense
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add expense';
      toast.error(errorMessage);
    }
  }, [newExpense, closeAddExpenseModal, handleRefresh]);

  // Tax configuration handlers
  const toggleTaxConfig = useCallback(() => setShowTaxConfig((prev) => !prev), []);

  const handleTaxInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewTax((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleAddTax = useCallback(async () => {
    if (!newTax.name.trim()) {
      toast.error('Tax name is required');
      return;
    }
    const rate = Number(newTax.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Tax rate must be a number between 0 and 100');
      return;
    }

    try {
      await api.post('/api/payments/taxes/', newTax);
      toast.success('Tax added successfully!');
      setNewTax({
        name: '',
        rate: 0,
        description: '',
        applies_to: 'revenue',
        is_enabled: true,
        is_included_in_price: false,
        tax_type: 'custom'
      });
      handleRefresh(); // Refresh to get updated tax config
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add tax';
      toast.error(errorMessage);
    }
  }, [newTax, handleRefresh]);

  const handleToggleTax = useCallback(async (taxId, isEnabled) => {
    try {
      await api.patch(`/api/payments/taxes/${taxId}/`, { is_enabled: isEnabled });
      setTaxes((prev) => prev.map((tax) => (tax.id === taxId ? { ...tax, is_enabled: isEnabled } : tax)));
      toast.success(`Tax ${isEnabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      toast.error('Failed to update tax status');
    }
  }, []);

  const handleRemoveTax = useCallback(async (taxId) => {
    if (taxes.length <= 1) {
      toast.error('You must have at least one tax configured');
      return;
    }
    try {
      await api.delete(`/api/payments/taxes/${taxId}/`);
      setTaxes((prev) => prev.filter((tax) => tax.id !== taxId));
      toast.success('Tax removed successfully!');
    } catch (err) {
      toast.error('Failed to remove tax');
    }
  }, [taxes]);

  // Category management
  const toggleCategoryEditing = useCallback(() => setEditingCategories((prev) => !prev), []);

  const handleAddCategory = useCallback(async () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      await api.post('/api/payments/expense-categories/', { name: trimmedCategory });
      setNewCategory('');
      toast.success('Category added successfully!');
      fetchExpenseCategories(); // Refresh categories
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to add category';
      toast.error(errorMessage);
    }
  }, [newCategory, fetchExpenseCategories]);

  // Modal focus trap
  useEffect(() => {
    if (showAddExpenseModal || showTaxConfig) {
      const currentModalRef = showAddExpenseModal ? modalRef.current : taxModalRef.current;
      const focusableElements = currentModalRef.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === 'Escape') {
          showAddExpenseModal ? closeAddExpenseModal() : toggleTaxConfig();
        }
      };

      currentModalRef.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => currentModalRef.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAddExpenseModal, showTaxConfig, closeAddExpenseModal, toggleTaxConfig]);

  // Category item component
  const CategoryItem = React.memo(({ category, onRemove }) => (
    <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-full px-3 py-1 flex items-center`}>
      <span className="text-sm">{category.name}</span>
      <button
        onClick={() => onRemove(category.id)}
        className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"} ml-1`}
        aria-label={`Remove ${category.name} category`}
      >
        ×
      </button>
    </div>
  ));

  const greenClass = useMemo(() => theme === "dark" ? "text-green-400" : "text-green-600", [theme]);
  const redClass = useMemo(() => theme === "dark" ? "text-red-400" : "text-red-600", [theme]);
  const blueClass = useMemo(() => theme === "dark" ? "text-blue-400" : "text-blue-600", [theme]);
  const yellowClass = useMemo(() => theme === "dark" ? "text-yellow-400" : "text-yellow-600", [theme]);

  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 transition-colors duration-300">
          <h1 className={`text-2xl md:text-3xl font-semibold flex items-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            <FaMoneyBillWave className={`mr-2 ${blueClass}`} /> Payment Reconciliation
          </h1>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button
              onClick={handleRefresh}
              className={`flex items-center px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-white border border-gray-300 hover:bg-gray-50"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
              aria-label="Refresh data"
            >
              <AiOutlineReload className="mr-1" /> Refresh
            </button>
            <button
              onClick={handleResetFilters}
              className={`flex items-center px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-white border border-gray-300 hover:bg-gray-50"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()}
                className={`${inputClass} p-2 rounded-lg w-32 transition-colors duration-300`}
                dateFormat="dd/MM/yyyy"
                aria-label="Select start date"
                wrapperClassName={theme === "dark" ? "dark-datepicker" : ""}
              />
              <FaCalendarAlt className={`absolute right-3 top-3 ${textTertiaryClass} pointer-events-none`} />
            </div>
            <span className={textSecondaryClass}>to</span>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => date && setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className={`${inputClass} p-2 rounded-lg w-32 transition-colors duration-300`}
                dateFormat="dd/MM/yyyy"
                aria-label="Select end date"
                wrapperClassName={theme === "dark" ? "dark-datepicker" : ""}
              />
              <FaCalendarAlt className={`absolute right-3 top-3 ${textTertiaryClass} pointer-events-none`} />
            </div>
          </div>
        </div>

        {/* Tax Configuration Section */}
        <div className={`${cardClass} p-4 mb-6 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Tax Configuration</h2>
            <button
              onClick={toggleTaxConfig}
              className="flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
              aria-label={showTaxConfig ? 'Hide tax configuration' : 'Show tax configuration'}
            >
              {showTaxConfig ? 'Hide Tax Settings' : 'Configure Taxes'}
            </button>
          </div>

          {showTaxConfig && (
            <div ref={taxModalRef} className={`${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"} mt-4 p-4 border rounded-lg transition-colors duration-300`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>Tax Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newTax.name}
                    onChange={handleTaxInputChange}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                    placeholder="e.g. VAT, Withholding Tax"
                    aria-label="Tax name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>Tax Rate (%)</label>
                  <input
                    type="number"
                    name="rate"
                    value={newTax.rate}
                    onChange={handleTaxInputChange}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                    placeholder="e.g. 16 for 16%"
                    min="0"
                    max="100"
                    step="0.1"
                    aria-label="Tax rate"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newTax.description}
                    onChange={handleTaxInputChange}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                    placeholder="Tax description"
                    aria-label="Tax description"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>Applies To</label>
                  <select
                    name="applies_to"
                    value={newTax.applies_to}
                    onChange={handleTaxInputChange}
                    className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                    aria-label="Tax applies to"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expenses">Expenses</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_included_in_price"
                    name="is_included_in_price"
                    checked={newTax.is_included_in_price}
                    onChange={handleTaxInputChange}
                    className={`h-4 w-4 ${theme === "dark" ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" : "text-blue-600 focus:ring-blue-500 border-gray-300"} rounded`}
                    aria-label="Tax included in price"
                  />
                  <label htmlFor="is_included_in_price" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Tax is included in price
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_enabled"
                    name="is_enabled"
                    checked={newTax.is_enabled}
                    onChange={handleTaxInputChange}
                    className={`h-4 w-4 ${theme === "dark" ? "text-indigo-400 focus:ring-indigo-400 border-gray-600" : "text-blue-600 focus:ring-blue-500 border-gray-300"} rounded`}
                    aria-label="Tax enabled"
                  />
                  <label htmlFor="is_enabled" className={`ml-2 block text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                    Enabled by default
                  </label>
                </div>
              </div>
              <button
                onClick={handleAddTax}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                aria-label="Add tax"
              >
                Add Tax
              </button>

              <div className="mt-4">
                <h3 className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-2`}>Configured Taxes</h3>
                {taxes.length === 0 ? (
                  <p className={`text-sm ${textSecondaryClass}`}>No taxes configured</p>
                ) : (
                  <ul className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
                    {taxes.map((tax) => (
                      <li key={tax.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{tax.name} ({tax.rate}%)</span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"}`}>
                              {tax.applies_to}
                            </span>
                            {tax.is_included_in_price && (
                              <span className={`ml-2 text-xs px-2 py-1 rounded ${theme === "dark" ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800"}`}>
                                Included
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${textSecondaryClass}`}>{tax.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative inline-block w-10">
                            <input
                              type="checkbox"
                              id={`toggle-${tax.id}`}
                              checked={tax.is_enabled}
                              onChange={(e) => handleToggleTax(tax.id, e.target.checked)}
                              className="sr-only"
                              aria-label={`Toggle ${tax.name} tax`}
                            />
                            <label
                              htmlFor={`toggle-${tax.id}`}
                              className={`relative inline-block w-10 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                                tax.is_enabled ? "bg-green-500" : theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  tax.is_enabled ? 'translate-x-4' : ''
                                }`}
                              />
                            </label>
                          </div>
                          <button
                            onClick={() => handleRemoveTax(tax.id)}
                            className={`${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"} transition-colors duration-300`}
                            aria-label={`Remove ${tax.name} tax`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${theme === "dark" ? "bg-blue-900/50 border-blue-600" : "bg-blue-50 border border-blue-100"} p-3 rounded-lg transition-colors duration-300`}>
              <h3 className={`text-sm font-medium ${theme === "dark" ? "text-blue-300" : "text-blue-800"}`}>Revenue Taxes</h3>
              {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => (
                    <li key={tax.id} className="flex justify-between text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">
                        KES {calculateTaxes(reconciliationData.overall_summary.total_revenue, 'revenue').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>No taxes applied to revenue</p>
              )}
            </div>
            <div className={`${theme === "dark" ? "bg-purple-900/50 border-purple-600" : "bg-purple-50 border border-purple-100"} p-3 rounded-lg transition-colors duration-300`}>
              <h3 className={`text-sm font-medium ${theme === "dark" ? "text-purple-300" : "text-purple-800"}`}>Expense Taxes</h3>
              {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => (
                    <li key={tax.id} className="flex justify-between text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">
                        KES {calculateTaxes(reconciliationData.overall_summary.total_expenses, 'expenses').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>No taxes applied to expenses</p>
              )}
            </div>
            <div className={`${theme === "dark" ? "bg-green-900/50 border-green-600" : "bg-green-50 border border-green-100"} p-3 rounded-lg transition-colors duration-300`}>
              <h3 className={`text-sm font-medium ${theme === "dark" ? "text-green-300" : "text-green-800"}`}>Total Tax Liability</h3>
              <p className={`text-lg font-bold mt-1 ${theme === "dark" ? "text-green-400" : "text-green-700"}`}>
                KES {reconciliationData.overall_summary.total_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`${cardClass} p-4 border-l-4 ${theme === "dark" ? "border-green-500 hover:shadow-lg" : "border-green-500 hover:shadow-md"} transition-all duration-300`}>
            <h3 className={`text-sm ${textSecondaryClass}`}>Total Revenue</h3>
            <p className={`text-2xl font-bold ${greenClass}`}>
              KES {reconciliationData.overall_summary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              {reconciliationData.revenue.summary.tax_breakdown.length > 0 && (
                <span className={`block text-sm font-normal ${textSecondaryClass}`}>
                  (Net: KES {reconciliationData.overall_summary.net_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
                </span>
              )}
            </p>
          </div>
          <div className={`${cardClass} p-4 border-l-4 ${theme === "dark" ? "border-red-500 hover:shadow-lg" : "border-red-500 hover:shadow-md"} transition-all duration-300`}>
            <h3 className={`text-sm ${textSecondaryClass}`}>Total Expenses</h3>
            <p className={`text-2xl font-bold ${redClass}`}>
              KES {reconciliationData.overall_summary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              {reconciliationData.expenses.summary.tax_breakdown.length > 0 && (
                <span className={`block text-sm font-normal ${textSecondaryClass}`}>
                  (Net: KES {reconciliationData.overall_summary.net_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
                </span>
              )}
            </p>
          </div>
          <div className={`${cardClass} p-4 border-l-4 ${theme === "dark" ? "border-blue-500 hover:shadow-lg" : "border-blue-500 hover:shadow-md"} transition-all duration-300`}>
            <h3 className={`text-sm ${textSecondaryClass}`}>Profit (After Tax)</h3>
            <p className={`text-2xl font-bold ${reconciliationData.overall_summary.net_profit >= 0 ? greenClass : redClass}`}>
              KES {reconciliationData.overall_summary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className={`${cardClass} p-4 mb-6 transition-colors duration-300`}>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-grow">
              <FaSearch className={`absolute left-3 top-3 ${textTertiaryClass}`} />
              <input
                ref={searchInputRef}
                type="text"
                className={`${inputClass} pl-10 pr-4 py-2 rounded-lg w-full transition-colors duration-300`}
                placeholder="Search by ID, source, user, or category..."
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                aria-label="Search payments and expenses"
              />
            </div>
            <div className="flex space-x-2">
              <select
                className={`${inputClass} p-2 rounded-lg bg-transparent transition-colors duration-300`}
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                aria-label="Select view mode"
              >
                <option value="all">All</option>
                <option value="revenue">Revenue</option>
                <option value="expenses">Expenses</option>
              </select>
              <button
                className={`flex items-center px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-white border border-gray-300 hover:bg-gray-50"} rounded-lg transition-colors duration-300`}
                onClick={() => toggleSort('date')}
                aria-label="Sort by date"
              >
                {sortDirection.includes('date') ? (
                  sortDirection === 'date_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
                ) : (
                  <FaSortAmountDown className="mr-1" />
                )}
                Date
              </button>
              <button
                className={`flex items-center px-3 py-2 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" : "bg-white border border-gray-300 hover:bg-gray-50"} rounded-lg transition-colors duration-300`}
                onClick={() => toggleSort('amount')}
                aria-label="Sort by amount"
              >
                {sortDirection.includes('amount') ? (
                  sortDirection === 'amount_asc' ? <FaSortAmountUp className="mr-1" /> : <FaSortAmountDown className="mr-1" />
                ) : (
                  <FaSortAmountDown className="mr-1" />
                )}
                Amount
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => generateReport('pdf')}
                disabled={isGeneratingReport}
                className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
                  isGeneratingReport 
                    ? "opacity-50 cursor-not-allowed bg-indigo-600" 
                    : theme === "dark" 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
                aria-label="Generate PDF report"
              >
                {isGeneratingReport ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaDownload className="mr-2" />
                )}
                PDF
              </button>
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
                className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 ${
                  theme === "dark" 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                aria-label="Download CSV report"
                onClick={() => toast.success('CSV download started')}
              >
                <FaDownload className="mr-2" /> CSV
              </CSVLink>
            </div>
          </div>
        </div>

        {error && (
          <div className={`${theme === "dark" ? "bg-red-900/50 border-red-600 text-red-300" : "bg-red-50 border-l-4 border-red-500"} p-4 mb-6 transition-colors duration-300`} role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${theme === "dark" ? "text-red-400" : "text-red-500"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 transition-colors duration-300" aria-live="polite">
            <div className={`inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === "dark" ? "border-indigo-500" : "border-indigo-500"} mb-2`}></div>
            <p className={theme === "dark" ? "text-white" : "text-gray-800"}>Loading reconciliation data...</p>
          </div>
        ) : (
          <div className="space-y-6 transition-colors duration-300" aria-live="polite">
            {/* Revenue Section */}
            {(viewMode === 'all' || viewMode === 'revenue') && (
              <div className={`${cardClass} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg`}>
                <div className={`px-6 py-4 ${theme === "dark" ? "border-b border-gray-700 bg-gray-800/60" : "border-b border-gray-200 bg-white/80"} flex justify-between items-center transition-colors duration-300`}>
                  <h2 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
                    <FaMoneyBillWave className={`mr-2 ${greenClass}`} /> Revenue
                  </h2>
                  <span className={`text-sm ${textSecondaryClass}`}>{reconciliationData.revenue.summary.record_count} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y transition-colors duration-300 ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead className={theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"}>
                      <tr>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Payment ID
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          User
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Source
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Category
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Net Amount (KES)
                        </th>
                        {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => (
                          <th key={tax.id} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                            {tax.name} ({tax.rate}%)
                          </th>
                        ))}
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Gross Amount (KES)
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className={theme === "dark" ? "bg-gray-800/60 divide-gray-700" : "bg-white divide-gray-200"}>
                      {reconciliationData.revenue.transactions.length > 0 ? (
                        reconciliationData.revenue.transactions.map((transaction) => {
                          const transactionTaxes = calculateTaxes(transaction.amount, 'revenue');
                          const netAmount = calculateNetAmount(transaction.amount, 'revenue');
                          const grossAmount = calculateGrossAmount(transaction.amount, 'revenue');
                          
                          return (
                            <tr key={transaction.transaction_id} className={`transition-colors duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.transaction_id}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.user_name}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{transaction.source}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>{transaction.category}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${greenClass}`}>
                                {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).map((tax) => (
                                <td key={tax.id} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${yellowClass}`}>
                                  {transactionTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                              ))}
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${greenClass}`}>
                                {grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>{format(parseISO(transaction.date), 'dd/MM/yyyy')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6 + taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'revenue' || tax.applies_to === 'both')).length} className={`px-6 py-4 text-center text-sm ${textSecondaryClass}`}>
                            No revenue records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expenses Section */}
            {(viewMode === 'all' || viewMode === 'expenses') && (
              <div className={`${cardClass} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg`}>
                <div className={`px-6 py-4 ${theme === "dark" ? "border-b border-gray-700 bg-gray-800/60" : "border-b border-gray-200 bg-white/80"} flex justify-between items-center transition-colors duration-300`}>
                  <div className="flex items-center">
                    <h2 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
                      <FaReceipt className={`mr-2 ${redClass}`} /> Expenses
                    </h2>
                    <button
                      onClick={openAddExpenseModal}
                      className="ml-4 flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      aria-label="Add new expense"
                    >
                      <FaPlus className="mr-1" /> Add Expense
                    </button>
                  </div>
                  <span className={`text-sm ${textSecondaryClass}`}>{reconciliationData.expenses.summary.record_count} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y transition-colors duration-300 ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead className={theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"}>
                      <tr>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Expense ID
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Description
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Category
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Amount (KES)
                        </th>
                        {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => (
                          <th key={tax.id} scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                            {tax.name} ({tax.rate}%)
                          </th>
                        ))}
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Net Amount (KES)
                        </th>
                        <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondaryClass}`}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className={theme === "dark" ? "bg-gray-800/60 divide-gray-700" : "bg-white divide-gray-200"}>
                      {reconciliationData.expenses.expenses.length > 0 ? (
                        reconciliationData.expenses.expenses.map((expense) => {
                          const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
                          const netAmount = calculateNetAmount(expense.amount, 'expenses');
                          const grossAmount = calculateGrossAmount(expense.amount, 'expenses');
                          
                          return (
                            <tr key={expense.expense_id} className={`transition-colors duration-300 ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{expense.expense_id}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{expense.description || 'N/A'}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>{expense.category_name}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${redClass}`}>
                                {grossAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              {taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).map((tax) => (
                                <td key={tax.id} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${yellowClass}`}>
                                  {expenseTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                              ))}
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${redClass}`}>
                                {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>{format(parseISO(expense.date), 'dd/MM/yyyy')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5 + taxes.filter((tax) => tax.is_enabled && (tax.applies_to === 'expenses' || tax.applies_to === 'both')).length} className={`px-6 py-4 text-center text-sm ${textSecondaryClass}`}>
                            No expense records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-500"} opacity-75`} onClick={closeAddExpenseModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div
              ref={modalRef}
              className={`${cardClass} inline-block align-bottom text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
            >
              <div className={`${theme === "dark" ? "bg-gray-800/80" : "bg-white"} px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Add New Expense</h2>
                  <button
                    onClick={closeAddExpenseModal}
                    className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"} focus:outline-none transition-colors duration-300`}
                    aria-label="Close add expense modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={newExpense.description}
                      onChange={handleExpenseInputChange}
                      className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                      placeholder="What was this expense for?"
                      required
                      aria-label="Expense description"
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleExpenseInputChange}
                      className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      aria-label="Expense amount"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={newExpense.category}
                      onChange={handleExpenseInputChange}
                      className={`${inputClass} w-full px-3 py-2 rounded-lg bg-transparent transition-colors duration-300`}
                      required
                      aria-label="Select expense category"
                    >
                      <option value="">Select a category</option>
                      {expenseCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className={`block text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-700"} mb-1`}>
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newExpense.date}
                      onChange={handleExpenseInputChange}
                      className={`${inputClass} w-full px-3 py-2 rounded-lg transition-colors duration-300`}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      aria-label="Select expense date"
                    />
                  </div>
                </div>
              </div>
              <div className={`${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t`}>
                <button
                  onClick={handleAddExpense}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  aria-label="Add expense"
                >
                  Add Expense
                </button>
                <button
                  onClick={closeAddExpenseModal}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-label="Cancel adding expense"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} theme={theme} />
    </div>
  );
};

export default RevenueReports;