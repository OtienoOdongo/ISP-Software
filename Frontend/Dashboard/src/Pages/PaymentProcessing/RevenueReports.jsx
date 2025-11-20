


// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { toast } from 'react-hot-toast';
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
//   FaChartLine,
//   FaNetworkWired,
//   FaWifi,
//   FaUsers,
//   FaExclamationTriangle,
//   FaFilePdf,
//   FaFileExcel,
// } from 'react-icons/fa';
// import { AiOutlineReload } from 'react-icons/ai';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { format, parseISO } from 'date-fns';
// import debounce from 'lodash.debounce';
// import api from '../../api'; 
// import { useTheme } from "../../context/ThemeContext";
// import { EnhancedSelect, EnhancedDatePicker, AccessTypeBadge, RevenueDistributionChart } from '../../components/ServiceManagement/Shared/components'

// // Import child components
// import RevenueStats from '../../components/PaymentConfiguration/RevenueReport/RevenueStats'
// import AccessTypeAnalytics from '../../components/PaymentConfiguration/RevenueReport/AccessTypeAnalytics'
// import TaxConfigurationPanel from '../../components/PaymentConfiguration/RevenueReport/TaxConfigurationPanel'
// import ExpenseManagement from '../../components/PaymentConfiguration/RevenueReport/ExpenseManagement'
// import TransactionTable from '../../components/PaymentConfiguration/RevenueReport/TransactionTable'

// // Default data structure to prevent undefined errors
// const DEFAULT_RECONCILIATION_DATA = {
//   revenue: { 
//     transactions: [], 
//     summary: { 
//       total_amount: 0, 
//       net_amount: 0, 
//       tax_breakdown: [], 
//       record_count: 0 
//     } 
//   },
//   expenses: { 
//     expenses: [], 
//     summary: { 
//       total_amount: 0, 
//       net_amount: 0, 
//       tax_breakdown: [], 
//       record_count: 0 
//     } 
//   },
//   overall_summary: { 
//     total_revenue: 0, 
//     total_expenses: 0, 
//     total_tax: 0, 
//     net_profit: 0, 
//     net_revenue: 0, 
//     net_expenses: 0,
//     combined_revenue: 0,
//     combined_profit: 0,
//     revenue_distribution: {}
//   },
//   access_type_breakdown: {
//     hotspot: { revenue: 0, expenses: 0, count: 0, profit: 0 },
//     pppoe: { revenue: 0, expenses: 0, count: 0, profit: 0 },
//     both: { revenue: 0, expenses: 0, count: 0, profit: 0 },
//     combined: { revenue: 0, expenses: 0, count: 0, profit: 0 }
//   },
//   tax_configuration: []
// };

// // Algorithm: Generate unique report IDs
// const generateReportId = () => {
//   const timestamp = new Date().getTime();
//   const random = Math.random().toString(36).substring(2, 8);
//   return `RPT_${timestamp}_${random}`;
// };

// // Algorithm: Calculate success rate from transaction data
// const calculateSuccessRate = (transactions) => {
//   if (!transactions || transactions.length === 0) return 0;
  
//   const successfulTransactions = transactions.filter(t => 
//     t.status === 'success' || t.status === 'completed'
//   ).length;
  
//   return (successfulTransactions / transactions.length) * 100;
// };

// const RevenueReports = () => {
//   const { theme } = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sortDirection, setSortDirection] = useState('date_desc');
//   const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [endDate, setEndDate] = useState(new Date());
//   const [refreshCount, setRefreshCount] = useState(0);
//   const [viewMode, setViewMode] = useState('all');
//   const [accessTypeFilter, setAccessTypeFilter] = useState('all');
//   const [activeTab, setActiveTab] = useState('overview');
//   const [unauthorized, setUnauthorized] = useState(false);
  
//   const [reconciliationData, setReconciliationData] = useState(DEFAULT_RECONCILIATION_DATA);
//   const [reports, setReports] = useState([]);
//   const [reportsLoading, setReportsLoading] = useState(false);

//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);

//   const searchInputRef = useRef(null);

//   // Data Structure: Theme-based styling with memoization
//   const containerClass = useMemo(() => 
//     theme === "dark" 
//       ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen p-4 md:p-8" 
//       : "bg-gray-50 text-gray-800 min-h-screen p-4 md:p-8",
//     [theme]
//   );

//   const cardClass = useMemo(() => 
//     theme === "dark"
//       ? "bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-md"
//       : "bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md",
//     [theme]
//   );

//   const inputClass = useMemo(() => 
//     theme === "dark"
//       ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
//       : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500",
//     [theme]
//   );

//   const textSecondaryClass = useMemo(() => 
//     theme === "dark" ? "text-gray-400" : "text-gray-500",
//     [theme]
//   );

//   const textTertiaryClass = useMemo(() => 
//     theme === "dark" ? "text-gray-500" : "text-gray-400",
//     [theme]
//   );

//   // Filter options
//   const viewModeOptions = [
//     { value: 'all', label: 'All Data' },
//     { value: 'revenue', label: 'Revenue Only' },
//     { value: 'expenses', label: 'Expenses Only' }
//   ];

//   const accessTypeOptions = [
//     { value: 'all', label: 'All Access Types' },
//     { value: 'hotspot', label: 'Hotspot Only' },
//     { value: 'pppoe', label: 'PPPoE Only' },
//     { value: 'both', label: 'Both Access Types' }
//   ];

//   const sortOptions = [
//     { value: 'date_desc', label: 'Date (Newest First)' },
//     { value: 'date_asc', label: 'Date (Oldest First)' },
//     { value: 'amount_desc', label: 'Amount (High to Low)' },
//     { value: 'amount_asc', label: 'Amount (Low to High)' },
//     { value: 'access_type', label: 'Access Type' }
//   ];

//   const reportTypeOptions = [
//     { value: 'daily', label: 'Daily Report' },
//     { value: 'weekly', label: 'Weekly Report' },
//     { value: 'monthly', label: 'Monthly Report' },
//     { value: 'custom', label: 'Custom Report' }
//   ];

//   const tabOptions = [
//     { id: 'overview', label: 'Overview', icon: FaChartLine },
//     { id: 'analytics', label: 'Analytics', icon: FaNetworkWired },
//     { id: 'transactions', label: 'Transactions', icon: FaMoneyBillWave },
//     { id: 'expenses', label: 'Expenses', icon: FaReceipt },
//     { id: 'taxes', label: 'Tax Configuration', icon: FaEdit },
//     { id: 'reports', label: 'Saved Reports', icon: FaFilePdf }
//   ];

//   // Algorithm: Enhanced error handler with specific error types
//   const handleApiError = useCallback((error, customMessage = null) => {
//     console.error('API Error Details:', {
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       data: error.response?.data,
//       message: error.message,
//       code: error.code
//     });

//     let errorMessage = customMessage || 'An unexpected error occurred';

//     if (error.response) {
//       switch (error.response.status) {
//         case 401:
//           errorMessage = 'Your session has expired. Please log in again.';
//           setUnauthorized(true);
//           break;
//         case 403:
//           errorMessage = 'You do not have permission to access this resource.';
//           break;
//         case 404:
//           errorMessage = 'The requested resource was not found.';
//           break;
//         case 500:
//           errorMessage = 'Server error. Please try again later.';
//           break;
//         case 502:
//         case 503:
//           errorMessage = 'Service temporarily unavailable. Please try again later.';
//           break;
//         default:
//           if (error.response.data?.error) {
//             errorMessage = error.response.data.error;
//           } else if (error.response.data?.detail) {
//             errorMessage = error.response.data.detail;
//           } else if (error.response.data?.message) {
//             errorMessage = error.response.data.message;
//           } else {
//             errorMessage = `Request failed with status ${error.response.status}`;
//           }
//       }
//     } else if (error.request) {
//       if (error.code === 'NETWORK_ERROR') {
//         errorMessage = 'Network error. Please check your internet connection.';
//       } else if (error.code === 'ECONNABORTED') {
//         errorMessage = 'Request timeout. Please try again.';
//       } else {
//         errorMessage = 'No response received from server. Please check your connection.';
//       }
//     } else {
//       errorMessage = error.message || 'An unexpected error occurred';
//     }

//     setError(errorMessage);
//     toast.error(errorMessage);
    
//     return errorMessage;
//   }, []);

//   // Algorithm: Debounced search with cancellation
//   const debouncedSetSearchTerm = useMemo(
//     () => debounce((value) => setSearchTerm(value), 300),
//     []
//   );

//   useEffect(() => {
//     return () => debouncedSetSearchTerm.cancel();
//   }, [debouncedSetSearchTerm]);

//   // Algorithm: Fetch reconciliation reports with caching strategy
//   const fetchReports = useCallback(async () => {
//     setReportsLoading(true);
//     try {
//       const response = await api.get('/api/payments/reports/');
//       setReports(response.data);
//     } catch (error) {
//       console.error('Failed to fetch reports:', error);
//       // Don't show toast for reports as they're secondary data
//     } finally {
//       setReportsLoading(false);
//     }
//   }, []);

//   // Algorithm: Generate reconciliation report with proper error handling
//   const generateReconciliationReport = useCallback(async (reportType = 'custom') => {
//     setIsGeneratingReport(true);
//     try {
//       const reportData = {
//         start_date: format(startDate, 'yyyy-MM-dd'),
//         end_date: format(endDate, 'yyyy-MM-dd'),
//         report_type: reportType,
//         filters: {
//           view_mode: viewMode,
//           access_type: accessTypeFilter,
//           search: searchTerm,
//           sort_by: sortDirection
//         }
//       };

//       const response = await api.post('/api/payments/reports/', reportData);
      
//       toast.success('Report generated successfully');
//       fetchReports(); // Refresh reports list
      
//       return response.data;
//     } catch (error) {
//       handleApiError(error, 'Failed to generate report');
//       throw error;
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   }, [startDate, endDate, viewMode, accessTypeFilter, searchTerm, sortDirection, fetchReports, handleApiError]);

//   // Algorithm: Enhanced fetch reconciliation data with retry logic
//   const fetchReconciliationData = useCallback(async (signal) => {
//     setLoading(true);
//     setError(null);
//     setUnauthorized(false);
    
//     try {
//       const params = {
//         start_date: format(startDate, 'yyyy-MM-dd'),
//         end_date: format(endDate, 'yyyy-MM-dd'),
//         view_mode: viewMode,
//         access_type: accessTypeFilter,
//         search: searchTerm,
//         sort_by: sortDirection
//       };

//       console.log('Fetching reconciliation data with params:', params);

//       const response = await api.get('/api/payments/reconciliation/', { 
//         params,
//         signal,
//         timeout: 30000
//       });

//       if (signal.aborted) {
//         console.log('Request aborted');
//         return;
//       }

//       console.log('Successfully fetched reconciliation data:', response.data);
      
//       // Ensure we have a valid data structure
//       const safeData = {
//         ...DEFAULT_RECONCILIATION_DATA,
//         ...response.data,
//         revenue: {
//           ...DEFAULT_RECONCILIATION_DATA.revenue,
//           ...(response.data.revenue || {})
//         },
//         expenses: {
//           ...DEFAULT_RECONCILIATION_DATA.expenses,
//           ...(response.data.expenses || {})
//         },
//         overall_summary: {
//           ...DEFAULT_RECONCILIATION_DATA.overall_summary,
//           ...(response.data.overall_summary || {})
//         },
//         access_type_breakdown: {
//           ...DEFAULT_RECONCILIATION_DATA.access_type_breakdown,
//           ...(response.data.access_type_breakdown || {})
//         }
//       };
      
//       setReconciliationData(safeData);
      
//     } catch (err) {
//       if (signal.aborted) {
//         console.log('Request was aborted');
//         return;
//       }

//       const errorMessage = handleApiError(err, 'Failed to load reconciliation data');
//       console.error('Error fetching reconciliation data:', err);
      
//       // Set default data on error to prevent crashes
//       setReconciliationData(DEFAULT_RECONCILIATION_DATA);
      
//     } finally {
//       if (!signal.aborted) {
//         setLoading(false);
//       }
//     }
//   }, [startDate, endDate, viewMode, accessTypeFilter, searchTerm, sortDirection, handleApiError]);

//   // Algorithm: Enhanced fetch analytics data
//   const fetchAnalyticsData = useCallback(async () => {
//     try {
//       const response = await api.get('/api/payments/reconciliation/analytics/access-type/', {
//         params: { days: 30 },
//         timeout: 15000
//       });
//       setAnalyticsData(response.data);
//     } catch (err) {
//       console.error('Error fetching analytics data:', err);
//       // Don't show toast for analytics errors as they're secondary data
//     }
//   }, []);

//   // Algorithm: Data fetching with dependency-based execution
//   useEffect(() => {
//     const controller = new AbortController();
//     let retryCount = 0;
//     const maxRetries = 2;

//     const fetchDataWithRetry = async () => {
//       try {
//         await fetchReconciliationData(controller.signal);
        
//         if (activeTab === 'analytics') {
//           await fetchAnalyticsData();
//         }
        
//         if (activeTab === 'reports') {
//           await fetchReports();
//         }
//       } catch (error) {
//         if (retryCount < maxRetries && !controller.signal.aborted) {
//           retryCount++;
//           console.log(`Retrying fetch... Attempt ${retryCount}`);
//           setTimeout(() => fetchDataWithRetry(), 1000 * retryCount);
//         }
//       }
//     };

//     fetchDataWithRetry();

//     return () => {
//       controller.abort();
//     };
//   }, [fetchReconciliationData, fetchAnalyticsData, fetchReports, refreshCount, activeTab]);

//   const handleRefresh = useCallback(() => {
//     setRefreshCount((prev) => prev + 1);
//     setError(null);
//     setUnauthorized(false);
//     toast.success('Refreshing data...');
//   }, []);

//   const handleResetFilters = useCallback(() => {
//     setSearchTerm('');
//     setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
//     setEndDate(new Date());
//     setViewMode('all');
//     setAccessTypeFilter('all');
//     setSortDirection('date_desc');
//     setError(null);
//     setUnauthorized(false);
//     toast.success('Filters reset successfully');
//   }, []);

//   const toggleSort = useCallback((type) => {
//     setSortDirection((prev) =>
//       type === 'amount'
//         ? prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'
//         : type === 'date'
//         ? prev === 'date_asc' ? 'date_desc' : 'date_asc'
//         : 'access_type'
//     );
//   }, []);

//   // Algorithm: Safe data accessor functions with fallbacks
//   const getRevenueTransactions = useCallback(() => {
//     return reconciliationData?.revenue?.transactions || [];
//   }, [reconciliationData]);

//   const getExpenses = useCallback(() => {
//     return reconciliationData?.expenses?.expenses || [];
//   }, [reconciliationData]);

//   const getRevenueSummary = useCallback(() => {
//     return reconciliationData?.revenue?.summary || DEFAULT_RECONCILIATION_DATA.revenue.summary;
//   }, [reconciliationData]);

//   const getExpensesSummary = useCallback(() => {
//     return reconciliationData?.expenses?.summary || DEFAULT_RECONCILIATION_DATA.expenses.summary;
//   }, [reconciliationData]);

//   const getOverallSummary = useCallback(() => {
//     return reconciliationData?.overall_summary || DEFAULT_RECONCILIATION_DATA.overall_summary;
//   }, [reconciliationData]);

//   const getAccessTypeBreakdown = useCallback(() => {
//     return reconciliationData?.access_type_breakdown || DEFAULT_RECONCILIATION_DATA.access_type_breakdown;
//   }, [reconciliationData]);

//   // Algorithm: Enhanced CSV data preparation with null safety
//   const csvData = useMemo(() => {
//     try {
//       const mapRevenue = (transaction) => {
//         const baseData = {
//           Type: 'Revenue',
//           ID: transaction.transaction_id || 'N/A',
//           User: transaction.user_name || 'N/A',
//           Source: transaction.source || 'N/A',
//           'Access Type': transaction.access_type_display || 'N/A',
//           Description: '',
//           Category: transaction.category || 'N/A',
//           'Net Amount (KES)': (transaction.amount || 0).toFixed(2),
//           'Gross Amount (KES)': (transaction.amount || 0).toFixed(2),
//           'Date': transaction.date ? format(parseISO(transaction.date), 'dd/MM/yyyy') : 'N/A',
//           'Plan': transaction.plan_name || 'N/A'
//         };
//         return baseData;
//       };

//       const mapExpense = (expense) => {
//         const baseData = {
//           Type: 'Expense',
//           ID: expense.expense_id || 'N/A',
//           User: '',
//           Source: '',
//           'Access Type': expense.access_type_display || 'N/A',
//           Description: expense.description || 'N/A',
//           Category: expense.category_name || 'N/A',
//           'Net Amount (KES)': (expense.amount || 0).toFixed(2),
//           'Gross Amount (KES)': (expense.amount || 0).toFixed(2),
//           'Date': expense.date ? format(parseISO(expense.date), 'dd/MM/yyyy') : 'N/A',
//           'Plan': 'N/A'
//         };
//         return baseData;
//       };

//       const revenueTransactions = getRevenueTransactions();
//       const expenses = getExpenses();

//       if (viewMode === 'all') {
//         return [
//           ...revenueTransactions.map(mapRevenue),
//           ...expenses.map(mapExpense)
//         ];
//       } else if (viewMode === 'revenue') {
//         return revenueTransactions.map(mapRevenue);
//       } else {
//         return expenses.map(mapExpense);
//       }
//     } catch (error) {
//       console.error('Error preparing CSV data:', error);
//       return [];
//     }
//   }, [reconciliationData, viewMode, getRevenueTransactions, getExpenses]);

//   const csvHeaders = useMemo(() => [
//     { label: 'Type', key: 'Type' },
//     { label: 'ID', key: 'ID' },
//     { label: 'User', key: 'User' },
//     { label: 'Source', key: 'Source' },
//     { label: 'Access Type', key: 'Access Type' },
//     { label: 'Description', key: 'Description' },
//     { label: 'Category', key: 'Category' },
//     { label: 'Net Amount (KES)', key: 'Net Amount (KES)' },
//     { label: 'Gross Amount (KES)', key: 'Gross Amount (KES)' },
//     { label: 'Date', key: 'Date' },
//     { label: 'Plan', key: 'Plan' }
//   ], []);

//   // Algorithm: Enhanced report generation with comprehensive data
//   const generateReport = useCallback(async (type) => {
//     if (type === 'saved') {
//       // Generate and save a report to the backend
//       try {
//         await generateReconciliationReport('custom');
//         return;
//       } catch (error) {
//         return; // Error already handled in generateReconciliationReport
//       }
//     }

//     setIsGeneratingReport(true);
//     try {
//       const revenueTransactions = getRevenueTransactions();
//       const expenses = getExpenses();

//       const hasRevenueData = (viewMode === 'all' || viewMode === 'revenue') && revenueTransactions.length > 0;
//       const hasExpenseData = (viewMode === 'all' || viewMode === 'expenses') && expenses.length > 0;

//       if (!hasRevenueData && !hasExpenseData) {
//         toast.error('No data available to generate report');
//         return;
//       }

//       if (type === 'pdf') {
//         const doc = new jsPDF();
        
//         // Header
//         doc.setFontSize(16);
//         doc.setTextColor(40, 53, 147);
//         doc.text('ENHANCED PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
        
//         // Report Info
//         doc.setFontSize(10);
//         doc.setTextColor(100);
//         doc.text(`Date Range: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`, 14, 25);
//         doc.text(`View Mode: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);
//         doc.text(`Access Type: ${accessTypeFilter.charAt(0).toUpperCase() + accessTypeFilter.slice(1)}`, 14, 35);
//         doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 40);

//         // Summary Section
//         const overallSummary = getOverallSummary();
//         doc.setFontSize(12);
//         doc.setTextColor(40, 53, 147);
//         doc.text('FINANCIAL SUMMARY', 14, 55);
        
//         doc.setFontSize(10);
//         doc.setTextColor(0);
//         doc.text(`Total Revenue: KES ${overallSummary.total_revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 20, 65);
//         doc.text(`Total Expenses: KES ${overallSummary.total_expenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 20, 70);
//         doc.text(`Total Tax: KES ${overallSummary.total_tax.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 20, 75);
//         doc.text(`Net Profit: KES ${overallSummary.net_profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 20, 80);

//         // Access Type Breakdown
//         const accessTypeBreakdown = getAccessTypeBreakdown();
//         doc.setFontSize(12);
//         doc.setTextColor(40, 53, 147);
//         doc.text('ACCESS TYPE BREAKDOWN', 14, 95);
        
//         const accessTypes = ['hotspot', 'pppoe', 'both'];
//         let yPosition = 105;
        
//         accessTypes.forEach(accessType => {
//           const data = accessTypeBreakdown[accessType] || { revenue: 0, count: 0, profit: 0 };
//           doc.text(`${accessType.toUpperCase()}:`, 20, yPosition);
//           doc.text(`Revenue: KES ${data.revenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 40, yPosition);
//           doc.text(`Transactions: ${data.count || 0}`, 120, yPosition);
//           doc.text(`Profit: KES ${data.profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 160, yPosition);
//           yPosition += 6;
//         });

//         doc.text(`COMBINED REVENUE: KES ${(overallSummary.combined_revenue || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 20, yPosition + 5);

//         // Tax Breakdown
//         const revenueSummary = getRevenueSummary();
//         const expenseSummary = getExpensesSummary();
        
//         if (revenueSummary.tax_breakdown?.length > 0 || expenseSummary.tax_breakdown?.length > 0) {
//           doc.setFontSize(12);
//           doc.setTextColor(40, 53, 147);
//           doc.text('TAX BREAKDOWN', 14, yPosition + 20);
          
//           yPosition += 30;
          
//           // Revenue Taxes
//           if (revenueSummary.tax_breakdown?.length > 0) {
//             doc.setFontSize(10);
//             doc.setTextColor(0);
//             doc.text('Revenue Taxes:', 20, yPosition);
//             yPosition += 6;
            
//             revenueSummary.tax_breakdown.forEach(tax => {
//               doc.text(`- ${tax.tax_name} (${tax.tax_rate}%): KES ${tax.tax_amount.toFixed(2)}`, 25, yPosition);
//               yPosition += 5;
//             });
//           }
          
//           // Expense Taxes
//           if (expenseSummary.tax_breakdown?.length > 0) {
//             doc.text('Expense Taxes:', 20, yPosition);
//             yPosition += 6;
            
//             expenseSummary.tax_breakdown.forEach(tax => {
//               doc.text(`- ${tax.tax_name} (${tax.tax_rate}%): KES ${tax.tax_amount.toFixed(2)}`, 25, yPosition);
//               yPosition += 5;
//             });
//           }
//         }

//         doc.save(`Enhanced_Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
//         toast.success('PDF report generated successfully');
//       } else if (type === 'csv') {
//         toast.success('CSV download started');
//       }
//     } catch (err) {
//       console.error('Report generation error:', err);
//       handleApiError(err, 'Failed to generate report');
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   }, [
//     viewMode, 
//     startDate, 
//     endDate, 
//     accessTypeFilter, 
//     getRevenueTransactions, 
//     getExpenses, 
//     getAccessTypeBreakdown, 
//     getOverallSummary,
//     getRevenueSummary,
//     getExpensesSummary,
//     generateReconciliationReport,
//     handleApiError
//   ]);

//   // Algorithm: Reports list component
//   const ReportsList = () => (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//           Saved Reports ({reports.length})
//         </h3>
//         <button
//           onClick={() => generateReport('saved')}
//           disabled={isGeneratingReport}
//           className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
//         >
//           {isGeneratingReport ? (
//             <FaSpinner className="animate-spin mr-2" />
//           ) : (
//             <FaPlus className="mr-2" />
//           )}
//           Generate New Report
//         </button>
//       </div>

//       {reportsLoading ? (
//         <div className="text-center py-8">
//           <FaSpinner className="animate-spin w-8 h-8 mx-auto mb-2" />
//           <p>Loading reports...</p>
//         </div>
//       ) : reports.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {reports.slice(0, 6).map((report) => (
//             <div key={report.id} className={`p-4 rounded-lg border ${
//               theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-white border-gray-200"
//             }`}>
//               <div className="flex items-center justify-between mb-2">
//                 <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//                   {report.report_id}
//                 </span>
//                 <span className={`text-xs px-2 py-1 rounded ${
//                   theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
//                 }`}>
//                   {report.report_type}
//                 </span>
//               </div>
//               <p className={`text-sm ${textSecondaryClass} mb-2`}>
//                 {format(parseISO(report.start_date), 'dd/MM/yyyy')} - {format(parseISO(report.end_date), 'dd/MM/yyyy')}
//               </p>
//               <div className="flex justify-between text-sm">
//                 <span>Revenue:</span>
//                 <span className="font-semibold">KES {report.total_revenue.toLocaleString('en-KE')}</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Profit:</span>
//                 <span className={`font-semibold ${
//                   report.net_profit >= 0 ? 'text-green-500' : 'text-red-500'
//                 }`}>
//                   KES {report.net_profit.toLocaleString('en-KE')}
//                 </span>
//               </div>
//               <button
//                 onClick={() => toast.success('Report download would be implemented here')}
//                 className="w-full mt-3 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
//               >
//                 Download
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
//           theme === "dark" ? "border-gray-600" : "border-gray-300"
//         }`}>
//           <FaFilePdf className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
//           <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             No Reports Generated
//           </h3>
//           <p className={textSecondaryClass}>
//             Generate your first reconciliation report to see it here
//           </p>
//           <button
//             onClick={() => generateReport('saved')}
//             className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           >
//             Generate First Report
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   // Handle unauthorized state
//   const renderUnauthorizedMessage = () => (
//     <div className={`${cardClass} p-6 text-center transition-colors duration-300`}>
//       <FaExclamationTriangle className={`text-4xl mx-auto mb-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-500"}`} />
//       <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//         Session Expired
//       </h3>
//       <p className={`mb-4 ${textSecondaryClass}`}>
//         Your login session has expired. Please log in again to continue.
//       </p>
//       <button
//         onClick={() => window.location.reload()}
//         className={`px-4 py-2 rounded-lg ${
//           theme === "dark" 
//             ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
//             : "bg-indigo-600 hover:bg-indigo-700 text-white"
//         } transition-colors duration-300`}
//       >
//         Reload Page
//       </button>
//     </div>
//   );

//   // Safe data for child components
//   const safeReconciliationData = useMemo(() => ({
//     revenue: {
//       transactions: getRevenueTransactions(),
//       summary: getRevenueSummary()
//     },
//     expenses: {
//       expenses: getExpenses(),
//       summary: getExpensesSummary()
//     },
//     overall_summary: getOverallSummary(),
//     access_type_breakdown: getAccessTypeBreakdown(),
//     tax_configuration: reconciliationData?.tax_configuration || []
//   }), [
//     getRevenueTransactions,
//     getRevenueSummary,
//     getExpenses,
//     getExpensesSummary,
//     getOverallSummary,
//     getAccessTypeBreakdown,
//     reconciliationData
//   ]);

//   return (
//     <div className={containerClass}>
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 transition-colors duration-300">
//           <h1 className={`text-2xl md:text-3xl font-semibold flex items-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//             <FaMoneyBillWave className={`mr-2 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} /> 
//             Payment Reconciliation
//           </h1>
//           <div className="flex items-center space-x-2 mt-2 md:mt-0">
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className={`flex items-center px-3 py-2 ${
//                 theme === "dark" 
//                   ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50" 
//                   : "bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//               } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
//               aria-label="Refresh data"
//             >
//               <AiOutlineReload className={`mr-1 ${loading ? 'animate-spin' : ''}`} /> 
//               {loading ? 'Refreshing...' : 'Refresh'}
//             </button>
//             <button
//               onClick={handleResetFilters}
//               className={`flex items-center px-3 py-2 ${
//                 theme === "dark" 
//                   ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
//                   : "bg-white border border-gray-300 hover:bg-gray-50"
//               } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300`}
//               aria-label="Reset filters"
//             >
//               Reset Filters
//             </button>
//             <EnhancedDatePicker
//               selected={startDate}
//               onChange={setStartDate}
//               selectsStart
//               startDate={startDate}
//               endDate={endDate}
//               minDate={null}
//               maxDate={new Date()}
//               placeholderText="Start Date"
//               theme={theme}
//               className="w-32"
//             />
//             <span className={textSecondaryClass}>to</span>
//             <EnhancedDatePicker
//               selected={endDate}
//               onChange={setEndDate}
//               selectsEnd
//               startDate={startDate}
//               endDate={endDate}
//               minDate={startDate}
//               maxDate={new Date()}
//               placeholderText="End Date"
//               theme={theme}
//               className="w-32"
//             />
//           </div>
//         </div>

//         {/* Show unauthorized message if 401 error */}
//         {unauthorized ? (
//           renderUnauthorizedMessage()
//         ) : (
//           <>
//             {/* Navigation Tabs */}
//             <div className={`${cardClass} p-2 mb-6 transition-colors duration-300`}>
//               <div className="flex flex-wrap gap-2">
//                 {tabOptions.map((tab) => {
//                   const IconComponent = tab.icon;
//                   return (
//                     <button
//                       key={tab.id}
//                       onClick={() => setActiveTab(tab.id)}
//                       className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
//                         activeTab === tab.id
//                           ? theme === "dark"
//                             ? "bg-indigo-600 text-white shadow-lg"
//                             : "bg-indigo-600 text-white shadow-md"
//                           : theme === "dark"
//                           ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                     >
//                       <IconComponent className="w-4 h-4 mr-2" />
//                       {tab.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Filters and Controls */}
//             <div className={`${cardClass} p-4 mb-6 transition-colors duration-300`}>
//               <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//                 <div className="relative flex-grow">
//                   <FaSearch className={`absolute left-3 top-3 ${textTertiaryClass}`} />
//                   <input
//                     ref={searchInputRef}
//                     type="text"
//                     className={`${inputClass} pl-10 pr-4 py-2 rounded-lg w-full transition-colors duration-300`}
//                     placeholder="Search by ID, user, access type, or description..."
//                     onChange={(e) => debouncedSetSearchTerm(e.target.value)}
//                     aria-label="Search payments and expenses"
//                   />
//                 </div>
//                 <div className="flex space-x-2">
//                   <EnhancedSelect
//                     value={viewMode}
//                     onChange={setViewMode}
//                     options={viewModeOptions}
//                     placeholder="View Mode"
//                     theme={theme}
//                     className="w-32"
//                   />
//                   <EnhancedSelect
//                     value={accessTypeFilter}
//                     onChange={setAccessTypeFilter}
//                     options={accessTypeOptions}
//                     placeholder="Access Type"
//                     theme={theme}
//                     className="w-40"
//                   />
//                   <EnhancedSelect
//                     value={sortDirection}
//                     onChange={setSortDirection}
//                     options={sortOptions}
//                     placeholder="Sort By"
//                     theme={theme}
//                     className="w-48"
//                   />
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => generateReport('pdf')}
//                     disabled={isGeneratingReport || loading}
//                     className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 ${
//                       isGeneratingReport || loading
//                         ? "opacity-50 cursor-not-allowed bg-indigo-600" 
//                         : theme === "dark" 
//                           ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
//                           : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                     }`}
//                     aria-label="Generate PDF report"
//                   >
//                     {isGeneratingReport ? (
//                       <FaSpinner className="animate-spin mr-2" />
//                     ) : (
//                       <FaFilePdf className="mr-2" />
//                     )}
//                     PDF
//                   </button>
//                   <CSVLink
//                     data={csvData}
//                     headers={csvHeaders}
//                     filename={`enhanced_payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
//                     className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 ${
//                       theme === "dark" 
//                         ? "bg-green-600 hover:bg-green-700 text-white" 
//                         : "bg-green-600 hover:bg-green-700 text-white"
//                     } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
//                     aria-label="Download CSV report"
//                     onClick={() => !loading && toast.success('CSV download started')}
//                   >
//                     <FaFileExcel className="mr-2" /> CSV
//                   </CSVLink>
//                   <button
//                     onClick={() => generateReport('saved')}
//                     disabled={isGeneratingReport || loading}
//                     className={`flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${
//                       isGeneratingReport || loading
//                         ? "opacity-50 cursor-not-allowed bg-purple-600" 
//                         : theme === "dark" 
//                           ? "bg-purple-600 hover:bg-purple-700 text-white" 
//                           : "bg-purple-600 hover:bg-purple-700 text-white"
//                     }`}
//                   >
//                     {isGeneratingReport ? (
//                       <FaSpinner className="animate-spin mr-2" />
//                     ) : (
//                       <FaSave className="mr-2" />
//                     )}
//                     Save Report
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {error && !unauthorized && (
//               <div className={`${
//                 theme === "dark" 
//                   ? "bg-red-900/50 border-red-600 text-red-300" 
//                   : "bg-red-50 border-l-4 border-red-500 text-red-700"
//               } p-4 mb-6 transition-colors duration-300`} role="alert">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <FaExclamationTriangle className={`h-5 w-5 ${theme === "dark" ? "text-red-400" : "text-red-500"}`} />
//                   </div>
//                   <div className="ml-3">
//                     <p className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-700"}`}>
//                       {error}
//                     </p>
//                     <button
//                       onClick={handleRefresh}
//                       className={`mt-2 text-sm underline ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"}`}
//                     >
//                       Try again
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {loading ? (
//               <div className="text-center py-8 transition-colors duration-300" aria-live="polite">
//                 <div className={`inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme === "dark" ? "border-indigo-500" : "border-indigo-500"} mb-2`}></div>
//                 <p className={theme === "dark" ? "text-white" : "text-gray-800"}>Loading enhanced reconciliation data...</p>
//               </div>
//             ) : (
//               <div className="space-y-6 transition-colors duration-300" aria-live="polite">
//                 {/* Overview Tab */}
//                 {activeTab === 'overview' && (
//                   <RevenueStats 
//                     reconciliationData={safeReconciliationData}
//                     theme={theme}
//                     cardClass={cardClass}
//                     textSecondaryClass={textSecondaryClass}
//                   />
//                 )}

//                 {/* Analytics Tab */}
//                 {activeTab === 'analytics' && (
//                   <AccessTypeAnalytics 
//                     analyticsData={analyticsData}
//                     reconciliationData={safeReconciliationData}
//                     theme={theme}
//                     cardClass={cardClass}
//                   />
//                 )}

//                 {/* Transactions Tab */}
//                 {activeTab === 'transactions' && (
//                   <TransactionTable 
//                     reconciliationData={safeReconciliationData}
//                     viewMode={viewMode}
//                     theme={theme}
//                     cardClass={cardClass}
//                     textSecondaryClass={textSecondaryClass}
//                     inputClass={inputClass}
//                   />
//                 )}

//                 {/* Expenses Tab */}
//                 {activeTab === 'expenses' && (
//                   <ExpenseManagement 
//                     reconciliationData={safeReconciliationData}
//                     viewMode={viewMode}
//                     theme={theme}
//                     cardClass={cardClass}
//                     textSecondaryClass={textSecondaryClass}
//                     inputClass={inputClass}
//                     onRefresh={handleRefresh}
//                   />
//                 )}

//                 {/* Taxes Tab */}
//                 {activeTab === 'taxes' && (
//                   <TaxConfigurationPanel 
//                     reconciliationData={safeReconciliationData}
//                     theme={theme}
//                     cardClass={cardClass}
//                     textSecondaryClass={textSecondaryClass}
//                     inputClass={inputClass}
//                     onRefresh={handleRefresh}
//                   />
//                 )}

//                 {/* Reports Tab */}
//                 {activeTab === 'reports' && <ReportsList />}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RevenueReports;













import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
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
  FaChartLine,
  FaNetworkWired,
  FaWifi,
  FaUsers,
  FaExclamationTriangle,
  FaFilePdf,
  FaFileExcel,
} from 'react-icons/fa';
import { AiOutlineReload } from 'react-icons/ai';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';
import debounce from 'lodash.debounce';
import api from '../../api'; 
import { useTheme } from "../../context/ThemeContext";
import { EnhancedSelect, EnhancedDatePicker, AccessTypeBadge, RevenueDistributionChart } from '../../components/ServiceManagement/Shared/components'

// Import child components
import RevenueStats from '../../components/PaymentConfiguration/RevenueReport/RevenueStats'
import AccessTypeAnalytics from '../../components/PaymentConfiguration/RevenueReport/AccessTypeAnalytics'
import TaxConfigurationPanel from '../../components/PaymentConfiguration/RevenueReport/TaxConfigurationPanel'
import ExpenseManagement from '../../components/PaymentConfiguration/RevenueReport/ExpenseManagement'
import TransactionTable from '../../components/PaymentConfiguration/RevenueReport/TransactionTable'

// Default data structure to prevent undefined errors
const DEFAULT_RECONCILIATION_DATA = {
  revenue: { 
    transactions: [], 
    summary: { 
      total_amount: 0, 
      net_amount: 0, 
      tax_breakdown: [], 
      record_count: 0 
    } 
  },
  expenses: { 
    expenses: [], 
    summary: { 
      total_amount: 0, 
      net_amount: 0, 
      tax_breakdown: [], 
      record_count: 0 
    } 
  },
  overall_summary: { 
    total_revenue: 0, 
    total_expenses: 0, 
    total_tax: 0, 
    net_profit: 0, 
    net_revenue: 0, 
    net_expenses: 0,
    combined_revenue: 0,
    combined_profit: 0,
    revenue_distribution: {}
  },
  access_type_breakdown: {
    hotspot: { revenue: 0, expenses: 0, count: 0, profit: 0 },
    pppoe: { revenue: 0, expenses: 0, count: 0, profit: 0 },
    both: { revenue: 0, expenses: 0, count: 0, profit: 0 },
    combined: { revenue: 0, expenses: 0, count: 0, profit: 0 }
  },
  tax_configuration: []
};

// Algorithm: Generate unique report IDs
const generateReportId = () => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 8);
  return `RPT_${timestamp}_${random}`;
};

// Algorithm: Calculate success rate from transaction data
const calculateSuccessRate = (transactions) => {
  if (!transactions || transactions.length === 0) return 0;
  
  const successfulTransactions = transactions.filter(t => 
    t.status === 'success' || t.status === 'completed'
  ).length;
  
  return (successfulTransactions / transactions.length) * 100;
};

// Responsive wrapper components
const ResponsiveContainer = ({ children, className = '' }) => (
  <div className={`w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const ResponsiveCard = ({ children, className = '', theme }) => (
  <div className={`
    w-full p-4 sm:p-6 rounded-xl transition-all duration-300
    ${theme === "dark" 
      ? "bg-gray-800/90 border border-gray-700 shadow-lg" 
      : "bg-white/95 border border-gray-200 shadow-lg"
    }
    ${className}
  `}>
    {children}
  </div>
);

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
  const [accessTypeFilter, setAccessTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [unauthorized, setUnauthorized] = useState(false);
  
  const [reconciliationData, setReconciliationData] = useState(DEFAULT_RECONCILIATION_DATA);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const searchInputRef = useRef(null);

  // Responsive theme-based styling with memoization
  const containerClass = useMemo(() => 
    theme === "dark" 
      ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white min-h-screen py-4" 
      : "bg-gray-50 text-gray-800 min-h-screen py-4",
    [theme]
  );

  const cardClass = useMemo(() => 
    theme === "dark"
      ? "bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg"
      : "bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg",
    [theme]
  );

  const inputClass = useMemo(() => 
    theme === "dark"
      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg",
    [theme]
  );

  const textSecondaryClass = useMemo(() => 
    theme === "dark" ? "text-gray-400" : "text-gray-600",
    [theme]
  );

  const textTertiaryClass = useMemo(() => 
    theme === "dark" ? "text-gray-500" : "text-gray-400",
    [theme]
  );

  // Filter options
  const viewModeOptions = [
    { value: 'all', label: 'All Data' },
    { value: 'revenue', label: 'Revenue Only' },
    { value: 'expenses', label: 'Expenses Only' }
  ];

  const accessTypeOptions = [
    { value: 'all', label: 'All Access Types' },
    { value: 'hotspot', label: 'Hotspot Only' },
    { value: 'pppoe', label: 'PPPoE Only' },
    { value: 'both', label: 'Both Access Types' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Date (Newest First)' },
    { value: 'date_asc', label: 'Date (Oldest First)' },
    { value: 'amount_desc', label: 'Amount (High to Low)' },
    { value: 'amount_asc', label: 'Amount (Low to High)' },
    { value: 'access_type', label: 'Access Type' }
  ];

  const reportTypeOptions = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'analytics', label: 'Analytics', icon: FaNetworkWired },
    { id: 'transactions', label: 'Transactions', icon: FaMoneyBillWave },
    { id: 'expenses', label: 'Expenses', icon: FaReceipt },
    { id: 'taxes', label: 'Tax Configuration', icon: FaEdit },
    { id: 'reports', label: 'Saved Reports', icon: FaFilePdf }
  ];

  // Enhanced error handler with 401 fix
  const handleApiError = useCallback((error, customMessage = null) => {
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    let errorMessage = customMessage || 'An unexpected error occurred';

    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          setUnauthorized(true);
          // Clear any invalid tokens
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else {
            errorMessage = `Request failed with status ${error.response.status}`;
          }
      }
    } else if (error.request) {
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = 'No response received from server. Please check your connection.';
      }
    } else {
      errorMessage = error.message || 'An unexpected error occurred';
    }

    setError(errorMessage);
    toast.error(errorMessage);
    
    return errorMessage;
  }, []);

  // Enhanced API call with token refresh
  const makeAuthenticatedRequest = useCallback(async (requestFn, ...args) => {
    try {
      return await requestFn(...args);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await api.post('/api/auth/token/refresh/', {
              refresh: refreshToken
            });
            
            if (refreshResponse.data.access) {
              localStorage.setItem('authToken', refreshResponse.data.access);
              // Retry the original request with new token
              return await requestFn(...args);
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          setUnauthorized(true);
          throw error;
        }
      }
      throw error;
    }
  }, []);

  // Algorithm: Debounced search with cancellation
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearchTerm.cancel();
  }, [debouncedSetSearchTerm]);

  // Algorithm: Fetch reconciliation reports with caching strategy
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const response = await makeAuthenticatedRequest(api.get, '/api/payments/reports/');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setReportsLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  // Algorithm: Generate reconciliation report with proper error handling
  const generateReconciliationReport = useCallback(async (reportType = 'custom') => {
    setIsGeneratingReport(true);
    try {
      const reportData = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        report_type: reportType,
        filters: {
          view_mode: viewMode,
          access_type: accessTypeFilter,
          search: searchTerm,
          sort_by: sortDirection
        }
      };

      const response = await makeAuthenticatedRequest(api.post, '/api/payments/reports/', reportData);
      
      toast.success('Report generated successfully');
      fetchReports(); // Refresh reports list
      
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to generate report');
      throw error;
    } finally {
      setIsGeneratingReport(false);
    }
  }, [startDate, endDate, viewMode, accessTypeFilter, searchTerm, sortDirection, fetchReports, handleApiError, makeAuthenticatedRequest]);

  // Algorithm: Enhanced fetch reconciliation data with retry logic and auth handling
  const fetchReconciliationData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    
    try {
      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        view_mode: viewMode,
        access_type: accessTypeFilter,
        search: searchTerm,
        sort_by: sortDirection
      };

      console.log('Fetching reconciliation data with params:', params);

      const response = await makeAuthenticatedRequest(api.get, '/api/payments/reconciliation/', { 
        params,
        signal,
        timeout: 30000
      });

      if (signal.aborted) {
        console.log('Request aborted');
        return;
      }

      console.log('Successfully fetched reconciliation data:', response.data);
      
      // Ensure we have a valid data structure
      const safeData = {
        ...DEFAULT_RECONCILIATION_DATA,
        ...response.data,
        revenue: {
          ...DEFAULT_RECONCILIATION_DATA.revenue,
          ...(response.data.revenue || {})
        },
        expenses: {
          ...DEFAULT_RECONCILIATION_DATA.expenses,
          ...(response.data.expenses || {})
        },
        overall_summary: {
          ...DEFAULT_RECONCILIATION_DATA.overall_summary,
          ...(response.data.overall_summary || {})
        },
        access_type_breakdown: {
          ...DEFAULT_RECONCILIATION_DATA.access_type_breakdown,
          ...(response.data.access_type_breakdown || {})
        }
      };
      
      setReconciliationData(safeData);
      
    } catch (err) {
      if (signal.aborted) {
        console.log('Request was aborted');
        return;
      }

      const errorMessage = handleApiError(err, 'Failed to load reconciliation data');
      console.error('Error fetching reconciliation data:', err);
      
      // Set default data on error to prevent crashes
      setReconciliationData(DEFAULT_RECONCILIATION_DATA);
      
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [startDate, endDate, viewMode, accessTypeFilter, searchTerm, sortDirection, handleApiError, makeAuthenticatedRequest]);

  // Algorithm: Enhanced fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest(api.get, '/api/payments/reconciliation/analytics/access-type/', {
        params: { days: 30 },
        timeout: 15000
      });
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    }
  }, [makeAuthenticatedRequest]);

  // Algorithm: Data fetching with dependency-based execution
  useEffect(() => {
    const controller = new AbortController();
    let retryCount = 0;
    const maxRetries = 2;

    const fetchDataWithRetry = async () => {
      try {
        await fetchReconciliationData(controller.signal);
        
        if (activeTab === 'analytics') {
          await fetchAnalyticsData();
        }
        
        if (activeTab === 'reports') {
          await fetchReports();
        }
      } catch (error) {
        if (retryCount < maxRetries && !controller.signal.aborted) {
          retryCount++;
          console.log(`Retrying fetch... Attempt ${retryCount}`);
          setTimeout(() => fetchDataWithRetry(), 1000 * retryCount);
        }
      }
    };

    fetchDataWithRetry();

    return () => {
      controller.abort();
    };
  }, [fetchReconciliationData, fetchAnalyticsData, fetchReports, refreshCount, activeTab]);

  const handleRefresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
    setError(null);
    setUnauthorized(false);
    toast.success('Refreshing data...');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setViewMode('all');
    setAccessTypeFilter('all');
    setSortDirection('date_desc');
    setError(null);
    setUnauthorized(false);
    toast.success('Filters reset successfully');
  }, []);

  const toggleSort = useCallback((type) => {
    setSortDirection((prev) =>
      type === 'amount'
        ? prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'
        : type === 'date'
        ? prev === 'date_asc' ? 'date_desc' : 'date_asc'
        : 'access_type'
    );
  }, []);

  // Algorithm: Safe data accessor functions with fallbacks
  const getRevenueTransactions = useCallback(() => {
    return reconciliationData?.revenue?.transactions || [];
  }, [reconciliationData]);

  const getExpenses = useCallback(() => {
    return reconciliationData?.expenses?.expenses || [];
  }, [reconciliationData]);

  const getRevenueSummary = useCallback(() => {
    return reconciliationData?.revenue?.summary || DEFAULT_RECONCILIATION_DATA.revenue.summary;
  }, [reconciliationData]);

  const getExpensesSummary = useCallback(() => {
    return reconciliationData?.expenses?.summary || DEFAULT_RECONCILIATION_DATA.expenses.summary;
  }, [reconciliationData]);

  const getOverallSummary = useCallback(() => {
    return reconciliationData?.overall_summary || DEFAULT_RECONCILIATION_DATA.overall_summary;
  }, [reconciliationData]);

  const getAccessTypeBreakdown = useCallback(() => {
    return reconciliationData?.access_type_breakdown || DEFAULT_RECONCILIATION_DATA.access_type_breakdown;
  }, [reconciliationData]);

  // Algorithm: Enhanced CSV data preparation with null safety
  const csvData = useMemo(() => {
    try {
      const mapRevenue = (transaction) => {
        const baseData = {
          Type: 'Revenue',
          ID: transaction.transaction_id || 'N/A',
          User: transaction.user_name || 'N/A',
          Source: transaction.source || 'N/A',
          'Access Type': transaction.access_type_display || 'N/A',
          Description: '',
          Category: transaction.category || 'N/A',
          'Net Amount (KES)': (transaction.amount || 0).toFixed(2),
          'Gross Amount (KES)': (transaction.amount || 0).toFixed(2),
          'Date': transaction.date ? format(parseISO(transaction.date), 'dd/MM/yyyy') : 'N/A',
          'Plan': transaction.plan_name || 'N/A'
        };
        return baseData;
      };

      const mapExpense = (expense) => {
        const baseData = {
          Type: 'Expense',
          ID: expense.expense_id || 'N/A',
          User: '',
          Source: '',
          'Access Type': expense.access_type_display || 'N/A',
          Description: expense.description || 'N/A',
          Category: expense.category_name || 'N/A',
          'Net Amount (KES)': (expense.amount || 0).toFixed(2),
          'Gross Amount (KES)': (expense.amount || 0).toFixed(2),
          'Date': expense.date ? format(parseISO(expense.date), 'dd/MM/yyyy') : 'N/A',
          'Plan': 'N/A'
        };
        return baseData;
      };

      const revenueTransactions = getRevenueTransactions();
      const expenses = getExpenses();

      if (viewMode === 'all') {
        return [
          ...revenueTransactions.map(mapRevenue),
          ...expenses.map(mapExpense)
        ];
      } else if (viewMode === 'revenue') {
        return revenueTransactions.map(mapRevenue);
      } else {
        return expenses.map(mapExpense);
      }
    } catch (error) {
      console.error('Error preparing CSV data:', error);
      return [];
    }
  }, [reconciliationData, viewMode, getRevenueTransactions, getExpenses]);

  const csvHeaders = useMemo(() => [
    { label: 'Type', key: 'Type' },
    { label: 'ID', key: 'ID' },
    { label: 'User', key: 'User' },
    { label: 'Source', key: 'Source' },
    { label: 'Access Type', key: 'Access Type' },
    { label: 'Description', key: 'Description' },
    { label: 'Category', key: 'Category' },
    { label: 'Net Amount (KES)', key: 'Net Amount (KES)' },
    { label: 'Gross Amount (KES)', key: 'Gross Amount (KES)' },
    { label: 'Date', key: 'Date' },
    { label: 'Plan', key: 'Plan' }
  ], []);

  // Enhanced PDF generation with responsive design
  const generatePDFReport = useCallback(async () => {
    setIsGeneratingReport(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text('ENHANCED PAYMENT RECONCILIATION REPORT', 105, 15, { align: 'center' });
      
      // Report Info
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Date Range: ${format(startDate, 'dd/MM/yyyy')} to ${format(endDate, 'dd/MM/yyyy')}`, 14, 25);
      doc.text(`View Mode: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`, 14, 30);
      doc.text(`Access Type: ${accessTypeFilter.charAt(0).toUpperCase() + accessTypeFilter.slice(1)}`, 14, 35);
      doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 40);

      // Summary Section
      const overallSummary = getOverallSummary();
      doc.setFontSize(12);
      doc.setTextColor(40, 53, 147);
      doc.text('FINANCIAL SUMMARY', 14, 55);
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Total Revenue: KES ${overallSummary.total_revenue?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`, 20, 65);
      doc.text(`Total Expenses: KES ${overallSummary.total_expenses?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`, 20, 70);
      doc.text(`Total Tax: KES ${overallSummary.total_tax?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`, 20, 75);
      doc.text(`Net Profit: KES ${overallSummary.net_profit?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`, 20, 80);

      // Access Type Breakdown
      const accessTypeBreakdown = getAccessTypeBreakdown();
      doc.setFontSize(12);
      doc.setTextColor(40, 53, 147);
      doc.text('ACCESS TYPE BREAKDOWN', 14, 95);
      
      const accessTypes = ['hotspot', 'pppoe', 'both'];
      let yPosition = 105;
      
      accessTypes.forEach(accessType => {
        const data = accessTypeBreakdown[accessType] || { revenue: 0, count: 0, profit: 0 };
        doc.text(`${accessType.toUpperCase()}:`, 20, yPosition);
        doc.text(`Revenue: KES ${data.revenue?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`, 40, yPosition);
        doc.text(`Transactions: ${data.count || 0}`, 120, yPosition);
        doc.text(`Profit: KES ${data.profit?.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}`, 160, yPosition);
        yPosition += 6;
      });

      doc.text(`COMBINED REVENUE: KES ${(overallSummary.combined_revenue || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 20, yPosition + 5);

      // Tax Breakdown
      const revenueSummary = getRevenueSummary();
      const expenseSummary = getExpensesSummary();
      
      if (revenueSummary.tax_breakdown?.length > 0 || expenseSummary.tax_breakdown?.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(40, 53, 147);
        doc.text('TAX BREAKDOWN', 14, yPosition + 20);
        
        yPosition += 30;
        
        // Revenue Taxes
        if (revenueSummary.tax_breakdown?.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.text('Revenue Taxes:', 20, yPosition);
          yPosition += 6;
          
          revenueSummary.tax_breakdown.forEach(tax => {
            doc.text(`- ${tax.tax_name} (${tax.tax_rate}%): KES ${(tax.tax_amount || 0).toFixed(2)}`, 25, yPosition);
            yPosition += 5;
          });
        }
        
        // Expense Taxes
        if (expenseSummary.tax_breakdown?.length > 0) {
          doc.text('Expense Taxes:', 20, yPosition);
          yPosition += 6;
          
          expenseSummary.tax_breakdown.forEach(tax => {
            doc.text(`- ${tax.tax_name} (${tax.tax_rate}%): KES ${(tax.tax_amount || 0).toFixed(2)}`, 25, yPosition);
            yPosition += 5;
          });
        }
      }

      doc.save(`Enhanced_Payment_Reconciliation_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (err) {
      console.error('Report generation error:', err);
      handleApiError(err, 'Failed to generate PDF report');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [
    viewMode, 
    startDate, 
    endDate, 
    accessTypeFilter, 
    getRevenueTransactions, 
    getExpenses, 
    getAccessTypeBreakdown, 
    getOverallSummary,
    getRevenueSummary,
    getExpensesSummary,
    handleApiError
  ]);

  // Algorithm: Enhanced report generation with comprehensive data
  const generateReport = useCallback(async (type) => {
    if (type === 'saved') {
      // Generate and save a report to the backend
      try {
        await generateReconciliationReport('custom');
        return;
      } catch (error) {
        return; // Error already handled in generateReconciliationReport
      }
    }

    if (type === 'pdf') {
      await generatePDFReport();
      return;
    }

    setIsGeneratingReport(true);
    try {
      const revenueTransactions = getRevenueTransactions();
      const expenses = getExpenses();

      const hasRevenueData = (viewMode === 'all' || viewMode === 'revenue') && revenueTransactions.length > 0;
      const hasExpenseData = (viewMode === 'all' || viewMode === 'expenses') && expenses.length > 0;

      if (!hasRevenueData && !hasExpenseData) {
        toast.error('No data available to generate report');
        return;
      }

      if (type === 'csv') {
        toast.success('CSV download started');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      handleApiError(err, 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  }, [
    viewMode, 
    getRevenueTransactions, 
    getExpenses,
    generateReconciliationReport,
    generatePDFReport,
    handleApiError
  ]);

  // Algorithm: Reports list component
  const ReportsList = () => (
    <ResponsiveCard theme={theme}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            Saved Reports ({reports.length})
          </h3>
          <button
            onClick={() => generateReport('saved')}
            disabled={isGeneratingReport}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
          >
            {isGeneratingReport ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaPlus className="mr-2" />
            )}
            Generate New Report
          </button>
        </div>

        {reportsLoading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin w-8 h-8 mx-auto mb-2" />
            <p>Loading reports...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.slice(0, 6).map((report) => (
              <div key={report.id} className={`p-4 rounded-lg border ${
                theme === "dark" ? "bg-gray-700/30 border-gray-600" : "bg-white border-gray-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {report.report_id}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    theme === "dark" ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"
                  }`}>
                    {report.report_type}
                  </span>
                </div>
                <p className={`text-sm ${textSecondaryClass} mb-2`}>
                  {format(parseISO(report.start_date), 'dd/MM/yyyy')} - {format(parseISO(report.end_date), 'dd/MM/yyyy')}
                </p>
                <div className="flex justify-between text-sm mb-1">
                  <span>Revenue:</span>
                  <span className="font-semibold">KES {(report.total_revenue || 0).toLocaleString('en-KE')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit:</span>
                  <span className={`font-semibold ${
                    (report.net_profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    KES {(report.net_profit || 0).toLocaleString('en-KE')}
                  </span>
                </div>
                <button
                  onClick={() => toast.success('Report download would be implemented here')}
                  className="w-full mt-3 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
            theme === "dark" ? "border-gray-600" : "border-gray-300"
          }`}>
            <FaFilePdf className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              No Reports Generated
            </h3>
            <p className={textSecondaryClass}>
              Generate your first reconciliation report to see it here
            </p>
            <button
              onClick={() => generateReport('saved')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Generate First Report
            </button>
          </div>
        )}
      </div>
    </ResponsiveCard>
  );

  // Handle unauthorized state
  const renderUnauthorizedMessage = () => (
    <div className={`${cardClass} p-6 text-center transition-colors duration-300`}>
      <FaExclamationTriangle className={`text-4xl mx-auto mb-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-500"}`} />
      <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
        Session Expired
      </h3>
      <p className={`mb-4 ${textSecondaryClass}`}>
        Your login session has expired. Please log in again to continue.
      </p>
      <button
        onClick={() => window.location.reload()}
        className={`px-4 py-2 rounded-lg ${
          theme === "dark" 
            ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        } transition-colors duration-300`}
      >
        Reload Page
      </button>
    </div>
  );

  // Safe data for child components
  const safeReconciliationData = useMemo(() => ({
    revenue: {
      transactions: getRevenueTransactions(),
      summary: getRevenueSummary()
    },
    expenses: {
      expenses: getExpenses(),
      summary: getExpensesSummary()
    },
    overall_summary: getOverallSummary(),
    access_type_breakdown: getAccessTypeBreakdown(),
    tax_configuration: reconciliationData?.tax_configuration || []
  }), [
    getRevenueTransactions,
    getRevenueSummary,
    getExpenses,
    getExpensesSummary,
    getOverallSummary,
    getAccessTypeBreakdown,
    reconciliationData
  ]);

  // Responsive action buttons component
  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        onClick={() => generateReport('pdf')}
        disabled={isGeneratingReport || loading}
        className={`flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 flex-1 ${
          isGeneratingReport || loading
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
          <FaFilePdf className="mr-2" />
        )}
        <span className="hidden sm:inline">PDF</span>
      </button>
      <CSVLink
        data={csvData}
        headers={csvHeaders}
        filename={`enhanced_payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
        className={`flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 flex-1 ${
          theme === "dark" 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-green-600 hover:bg-green-700 text-white"
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        aria-label="Download CSV report"
        onClick={() => !loading && toast.success('CSV download started')}
      >
        <FaFileExcel className="mr-2" /> 
        <span className="hidden sm:inline">CSV</span>
      </CSVLink>
      <button
        onClick={() => generateReport('saved')}
        disabled={isGeneratingReport || loading}
        className={`flex items-center justify-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 flex-1 ${
          isGeneratingReport || loading
            ? "opacity-50 cursor-not-allowed bg-purple-600" 
            : theme === "dark" 
              ? "bg-purple-600 hover:bg-purple-700 text-white" 
              : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
      >
        {isGeneratingReport ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <FaSave className="mr-2" />
        )}
        <span className="hidden sm:inline">Save</span>
      </button>
    </div>
  );

  return (
    <div className={containerClass}>
      <ResponsiveContainer>
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="flex items-center">
            <FaMoneyBillWave className={`w-8 h-8 mr-3 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
            <div>
              <h1 className={`text-2xl md:text-3xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                Payment Reconciliation
              </h1>
              <p className={textSecondaryClass}>
                Comprehensive financial reporting and analytics
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-300 ${
                theme === "dark" 
                  ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600 disabled:opacity-50" 
                  : "bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              }`}
              aria-label="Refresh data"
            >
              <AiOutlineReload className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> 
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleResetFilters}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-300 ${
                theme === "dark" 
                  ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
                  : "bg-white border border-gray-300 hover:bg-gray-50"
              }`}
              aria-label="Reset filters"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <ResponsiveCard theme={theme} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  Start Date
                </label>
                <EnhancedDatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={null}
                  maxDate={new Date()}
                  placeholderText="Start Date"
                  theme={theme}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                  End Date
                </label>
                <EnhancedDatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  placeholderText="End Date"
                  theme={theme}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </ResponsiveCard>

        {/* Show unauthorized message if 401 error */}
        {unauthorized ? (
          renderUnauthorizedMessage()
        ) : (
          <>
            {/* Navigation Tabs */}
            <ResponsiveCard theme={theme} className="mb-6">
              <div className="flex flex-wrap gap-2">
                {tabOptions.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex-1 sm:flex-none justify-center min-w-0 ${
                        activeTab === tab.id
                          ? theme === "dark"
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "bg-indigo-600 text-white shadow-md"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </ResponsiveCard>

            {/* Filters and Controls */}
            <ResponsiveCard theme={theme} className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className={`absolute left-3 top-3 ${textTertiaryClass}`} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className={`${inputClass} pl-10 pr-4 py-2 w-full`}
                      placeholder="Search by ID, user, access type, or description..."
                      onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                      aria-label="Search payments and expenses"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="flex-1">
                    <EnhancedSelect
                      value={viewMode}
                      onChange={setViewMode}
                      options={viewModeOptions}
                      placeholder="View Mode"
                      theme={theme}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <EnhancedSelect
                      value={accessTypeFilter}
                      onChange={setAccessTypeFilter}
                      options={accessTypeOptions}
                      placeholder="Access Type"
                      theme={theme}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <EnhancedSelect
                      value={sortDirection}
                      onChange={setSortDirection}
                      options={sortOptions}
                      placeholder="Sort By"
                      theme={theme}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <ActionButtons />
              </div>
            </ResponsiveCard>

            {error && !unauthorized && (
              <div className={`mb-6 p-4 rounded-lg ${
                theme === "dark" 
                  ? "bg-red-900/50 border border-red-700 text-red-200" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`} role="alert">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className={`h-5 w-5 ${theme === "dark" ? "text-red-400" : "text-red-500"}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm ${theme === "dark" ? "text-red-200" : "text-red-700"}`}>
                      {error}
                    </p>
                    <button
                      onClick={handleRefresh}
                      className={`mt-2 text-sm underline ${theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"}`}
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 transition-colors duration-300" aria-live="polite">
                <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === "dark" ? "border-indigo-500" : "border-indigo-500"} mb-4`}></div>
                <p className={`text-lg ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Loading enhanced reconciliation data...</p>
              </div>
            ) : (
              <div className="space-y-6 transition-colors duration-300" aria-live="polite">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <RevenueStats 
                    reconciliationData={safeReconciliationData}
                    theme={theme}
                    cardClass={cardClass}
                    textSecondaryClass={textSecondaryClass}
                  />
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <AccessTypeAnalytics 
                    analyticsData={analyticsData}
                    reconciliationData={safeReconciliationData}
                    theme={theme}
                    cardClass={cardClass}
                  />
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                  <TransactionTable 
                    reconciliationData={safeReconciliationData}
                    viewMode={viewMode}
                    theme={theme}
                    cardClass={cardClass}
                    textSecondaryClass={textSecondaryClass}
                    inputClass={inputClass}
                  />
                )}

                {/* Expenses Tab */}
                {activeTab === 'expenses' && (
                  <ExpenseManagement 
                    reconciliationData={safeReconciliationData}
                    viewMode={viewMode}
                    theme={theme}
                    cardClass={cardClass}
                    textSecondaryClass={textSecondaryClass}
                    inputClass={inputClass}
                    onRefresh={handleRefresh}
                  />
                )}

                {/* Taxes Tab */}
                {activeTab === 'taxes' && (
                  <TaxConfigurationPanel 
                    reconciliationData={safeReconciliationData}
                    theme={theme}
                    cardClass={cardClass}
                    textSecondaryClass={textSecondaryClass}
                    inputClass={inputClass}
                    onRefresh={handleRefresh}
                  />
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && <ReportsList />}
              </div>
            )}
          </>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueReports;