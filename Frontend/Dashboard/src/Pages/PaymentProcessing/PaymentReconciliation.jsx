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

// Default Kenyan tax configuration
const DEFAULT_TAXES = [
  {
    id: 'vat',
    name: 'VAT',
    rate: 16,
    description: 'Value Added Tax (Kenya standard rate)',
    appliesTo: 'revenue',
    isEnabled: true,
    isIncludedInPrice: true,
  },
  {
    id: 'withholding',
    name: 'Withholding Tax',
    rate: 5,
    description: 'Withholding Tax on services',
    appliesTo: 'expenses',
    isEnabled: false,
    isIncludedInPrice: false,
  },
];

// Mock data (moved outside component to avoid useMemo)
const MOCK_PAYMENTS = [
  { id: 1, paymentId: 'PY100523456', userName: 'John Doe', amount: 1000, date: new Date().toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 2, paymentId: 'PY100665432', userName: 'Jane Smith', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 3, paymentId: 'PY100798765', userName: 'Bob Johnson', amount: 2000, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 4, paymentId: 'PY100845678', userName: 'Alice Brown', amount: 1500, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
  { id: 5, paymentId: 'PY100932165', userName: 'Mike Wilson', amount: 750, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), source: 'WiFi Sales', category: 'Revenue' },
];

const MOCK_EXPENSES = [
  { id: 1, expenseId: 'EX100523456', amount: 300, date: new Date().toISOString(), description: 'Office Supplies', category: 'Operations' },
  { id: 2, expenseId: 'EX100665432', amount: 200, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), description: 'Internet Bill', category: 'Utilities' },
  { id: 3, expenseId: 'EX100798765', amount: 500, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), description: 'Payroll', category: 'Payroll' },
  { id: 4, expenseId: 'EX100845678', amount: 150, date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), description: 'Marketing', category: 'Advertising' },
  { id: 5, expenseId: 'EX100932165', amount: 100, date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(), description: 'Transport', category: 'Logistics' },
];

const PaymentReconciliation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState('date_desc');
  const [startDate, setStartDate] = useState(() => new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [viewMode, setViewMode] = useState('all');
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Operations',
    date: new Date().toISOString(),
  });
  const [editingCategories, setEditingCategories] = useState(false);
  const [customCategories, setCustomCategories] = useState([
    'Operations', 'Utilities', 'Payroll', 'Advertising', 'Logistics',
    'Maintenance', 'Office Supplies', 'Travel', 'Training', 'Other',
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [taxes, setTaxes] = useState(DEFAULT_TAXES);
  const [showTaxConfig, setShowTaxConfig] = useState(false);
  const [newTax, setNewTax] = useState({
    name: '',
    rate: 0,
    description: '',
    appliesTo: 'revenue',
    isEnabled: true,
    isIncludedInPrice: false,
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const modalRef = useRef(null);
  const taxModalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounce search with cleanup
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetSearchTerm.cancel();
  }, [debouncedSetSearchTerm]);

  // Fetch data with cleanup
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let isMounted = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filteredPayments = MOCK_PAYMENTS.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate >= new Date(start.setHours(0, 0, 0, 0)) &&
          paymentDate <= new Date(end.setHours(23, 59, 59, 999))
        );
      });

      const filteredExpenses = MOCK_EXPENSES.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate >= new Date(start.setHours(0, 0, 0, 0)) &&
          expenseDate <= new Date(end.setHours(23, 59, 59, 999))
        );
      });

      if (isMounted) {
        setPayments(filteredPayments);
        setExpenses(filteredExpenses);
        if (filteredPayments.length === 0 && filteredExpenses.length === 0) {
          toast.info('No records found for the selected date range', { autoClose: 3000 });
        }
      }
    } catch (err) {
      if (isMounted) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
        toast.error('Failed to load data. Please try again.');
      }
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData, refreshCount]);

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
    setTaxes(DEFAULT_TAXES);
    toast.info('Filters reset', { autoClose: 2000 });
  }, []);

  const filteredPayments = useMemo(() =>
    payments.filter(
      (payment) =>
        payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [payments, searchTerm]);

  const filteredExpenses = useMemo(() =>
    expenses.filter(
      (expense) =>
        expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    ), [expenses, searchTerm]);

  const sortedPayments = useMemo(() => [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sortDirection === 'amount_asc') return a.amount - b.amount;
    if (sortDirection === 'amount_desc') return b.amount - a.amount;
    if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  }), [filteredPayments, sortDirection]);

  const sortedExpenses = useMemo(() => [...filteredExpenses].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (sortDirection === 'amount_asc') return a.amount - b.amount;
    if (sortDirection === 'amount_desc') return b.amount - a.amount;
    if (sortDirection === 'date_asc') return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  }), [filteredExpenses, sortDirection]);

  const toggleSort = useCallback((type) => {
    setSortDirection((prev) =>
      type === 'amount'
        ? prev === 'amount_asc' ? 'amount_desc' : 'amount_asc'
        : prev === 'date_asc' ? 'date_desc' : 'date_asc'
    );
  }, []);

  // Enhanced tax calculations with validation
  const calculateTaxes = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return [];
    const applicableTaxes = taxes.filter(
      (tax) => tax.isEnabled && tax.appliesTo === type && !isNaN(tax.rate)
    );
    return applicableTaxes.map((tax) => {
      let taxableAmount = amount;
      if (tax.isIncludedInPrice) {
        taxableAmount = amount / (1 + tax.rate / 100);
      }
      const taxAmount = taxableAmount * (tax.rate / 100);
      return { ...tax, amount: taxAmount, taxableAmount };
    });
  }, [taxes]);

  const calculateNetAmount = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
    const applicableTaxes = taxes.filter(
      (tax) => tax.isEnabled && tax.appliesTo === type && tax.isIncludedInPrice && !isNaN(tax.rate)
    );
    if (applicableTaxes.length === 0) return amount;
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
    return amount / (1 + totalTaxRate / 100);
  }, [taxes]);

  const calculateGrossAmount = useCallback((amount, type) => {
    if (!Array.isArray(taxes) || isNaN(amount) || amount <= 0) return amount;
    const applicableTaxes = taxes.filter(
      (tax) => tax.isEnabled && tax.appliesTo === type && !tax.isIncludedInPrice && !isNaN(tax.rate)
    );
    if (applicableTaxes.length === 0) return amount;
    const totalTaxRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
    return amount * (1 + totalTaxRate / 100);
  }, [taxes]);

  const generateReport = useCallback(async (type) => {
    setIsGeneratingReport(true);
    try {
      const hasRevenueData = (viewMode === 'all' || viewMode === 'revenue') && sortedPayments.length > 0;
      const hasExpenseData = (viewMode === 'all' || viewMode === 'expenses') && sortedExpenses.length > 0;

      if (!hasRevenueData && !hasExpenseData) {
        toast.warning('No data to generate report', { autoClose: 3000 });
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

        const enabledTaxes = taxes.filter((tax) => tax.isEnabled);
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
            ...taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => [`${tax.name} (${tax.rate}%)`]),
            ['Gross Amount (KES)', 'Date'],
          ].flat();

          const revenueData = sortedPayments.map((payment) => {
            const rowData = [
              payment.paymentId,
              payment.userName,
              payment.source,
              payment.category,
              calculateNetAmount(payment.amount, 'revenue').toLocaleString('en-KE', { minimumFractionDigits: 2 }),
            ];
            taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').forEach((tax) => {
              const taxObj = calculateTaxes(payment.amount, 'revenue').find((t) => t.id === tax.id);
              rowData.push(taxObj ? taxObj.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00');
            });
            rowData.push(
              payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
              format(parseISO(payment.date), 'dd/MM/yyyy')
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
            ...taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => [`${tax.name} (${tax.rate}%)`]),
            ['Net Amount (KES)', 'Date'],
          ].flat();

          const expenseData = sortedExpenses.map((expense) => {
            const rowData = [
              expense.expenseId,
              expense.description || 'N/A',
              expense.category,
              expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }),
            ];
            taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').forEach((tax) => {
              const taxObj = calculateTaxes(expense.amount, 'expenses').find((t) => t.id === tax.id);
              rowData.push(taxObj ? taxObj.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '0.00');
            });
            rowData.push(
              calculateNetAmount(expense.amount, 'expenses').toLocaleString('en-KE', { minimumFractionDigits: 2 }),
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

        const totalRevenue = sortedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalExpenses = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const revenueTaxes = calculateTaxes(totalRevenue, 'revenue');
        const expenseTaxes = calculateTaxes(totalExpenses, 'expenses');
        const totalRevenueTax = revenueTaxes.reduce((sum, tax) => sum + tax.amount, 0);
        const totalExpenseTax = expenseTaxes.reduce((sum, tax) => sum + tax.amount, 0);
        const netRevenue = calculateNetAmount(totalRevenue, 'revenue');
        const netExpenses = calculateNetAmount(totalExpenses, 'expenses');
        const profit = totalRevenue - totalExpenses - totalExpenseTax;

        doc.setFontSize(10);
        doc.setTextColor(40, 53, 147);

        if (viewMode === 'all' || viewMode === 'revenue') {
          doc.text(`Total Revenue (Gross): KES ${totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          if (revenueTaxes.length > 0) {
            doc.text(`Net Revenue (Before Tax): KES ${netRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
            startY += 5;
            revenueTaxes.forEach((tax) => {
              doc.text(`${tax.name} (${tax.rate}%): KES ${tax.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
              startY += 5;
            });
          }
        }

        if (viewMode === 'all' || viewMode === 'expenses') {
          doc.text(`Total Expenses (Gross): KES ${totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          if (expenseTaxes.length > 0) {
            doc.text(`Net Expenses (Before Tax): KES ${netExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
            startY += 5;
            expenseTaxes.forEach((tax) => {
              doc.text(`${tax.name} (${tax.rate}%): KES ${tax.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
              startY += 5;
            });
          }
        }

        if (viewMode === 'all') {
          doc.text(`Total Taxes: KES ${(totalRevenueTax + totalExpenseTax).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
          startY += 5;
          doc.text(`Profit (After Tax): KES ${profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`, 14, startY);
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
      toast.error(`Failed to generate report: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [sortedPayments, sortedExpenses, viewMode, startDate, endDate, taxes, calculateTaxes, calculateNetAmount]);

  const { totalRevenue, totalExpenses, profit, totalRevenueTax, totalExpenseTax, netRevenue, netExpenses } = useMemo(() => {
    const rev = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const exp = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const revTaxes = calculateTaxes(rev, 'revenue');
    const expTaxes = calculateTaxes(exp, 'expenses');
    const revTax = revTaxes.reduce((sum, tax) => sum + tax.amount, 0);
    const expTax = expTaxes.reduce((sum, tax) => sum + tax.amount, 0);
    const netRev = calculateNetAmount(rev, 'revenue');
    const netExp = calculateNetAmount(exp, 'expenses');
    return {
      totalRevenue: rev,
      totalExpenses: exp,
      profit: rev - exp - expTax,
      totalRevenueTax: revTax,
      totalExpenseTax: expTax,
      netRevenue: netRev,
      netExpenses: netExp,
    };
  }, [payments, expenses, calculateTaxes, calculateNetAmount]);

  const csvData = useMemo(() => {
    const mapPayment = (p) => {
      const baseData = {
        Type: 'Revenue',
        ID: p.paymentId,
        User: p.userName,
        Source: p.source,
        Category: p.category,
        'Net Amount (KES)': calculateNetAmount(p.amount, 'revenue').toFixed(2),
      };
      calculateTaxes(p.amount, 'revenue').forEach((tax) => {
        baseData[`${tax.name} (${tax.rate}%)`] = tax.amount.toFixed(2);
      });
      baseData['Gross Amount (KES)'] = p.amount.toFixed(2);
      baseData['Date'] = format(parseISO(p.date), 'dd/MM/yyyy');
      return baseData;
    };

    const mapExpense = (e) => {
      const baseData = {
        Type: 'Expense',
        ID: e.expenseId,
        Description: e.description || 'N/A',
        Category: e.category,
        'Amount (KES)': e.amount.toFixed(2),
      };
      calculateTaxes(e.amount, 'expenses').forEach((tax) => {
        baseData[`${tax.name} (${tax.rate}%)`] = tax.amount.toFixed(2);
      });
      baseData['Net Amount (KES)'] = calculateNetAmount(e.amount, 'expenses').toFixed(2);
      baseData['Date'] = format(parseISO(e.date), 'dd/MM/yyyy');
      return baseData;
    };

    if (viewMode === 'all') {
      return [...sortedPayments.map(mapPayment), ...sortedExpenses.map(mapExpense)];
    } else if (viewMode === 'revenue') {
      return sortedPayments.map(mapPayment);
    } else {
      return sortedExpenses.map(mapExpense);
    }
  }, [sortedPayments, sortedExpenses, viewMode, calculateTaxes, calculateNetAmount]);

  const openAddExpenseModal = useCallback(() => setShowAddExpenseModal(true), []);

  const closeAddExpenseModal = useCallback(() => {
    setShowAddExpenseModal(false);
    setNewExpense({
      description: '',
      amount: '',
      category: customCategories[0] || 'Operations',
      date: new Date().toISOString(),
    });
    setEditingCategories(false);
    setNewCategory('');
  }, [customCategories]);

  const handleExpenseInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDateChange = useCallback((date) => {
    setNewExpense((prev) => ({
      ...prev,
      date: date ? date.toISOString() : new Date().toISOString(),
    }));
  }, []);

  const handleAddExpense = useCallback(() => {
    if (!newExpense.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!newExpense.amount || isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!customCategories.includes(newExpense.category)) {
      toast.error('Please select a valid category');
      return;
    }

    const newExpenseRecord = {
      id: expenses.length + 1,
      expenseId: `EX${new Date().getTime().toString().slice(-6)}`,
      description: newExpense.description.trim(),
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
    };

    setExpenses((prev) => [...prev, newExpenseRecord]);
    toast.success('Expense added successfully!');
    closeAddExpenseModal();
  }, [newExpense, expenses, customCategories, closeAddExpenseModal]);

  const toggleCategoryEditing = useCallback(() => setEditingCategories((prev) => !prev), []);

  const handleAddCategory = useCallback(() => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      toast.error('Category name cannot be empty');
      return;
    }
    if (customCategories.includes(trimmedCategory)) {
      toast.error('Category already exists');
      return;
    }
    setCustomCategories((prev) => [...prev, trimmedCategory]);
    setNewCategory('');
    toast.success('Category added successfully!');
  }, [newCategory, customCategories]);

  const handleRemoveCategory = useCallback((categoryToRemove) => {
    if (customCategories.length <= 1) {
      toast.error('You must have at least one category');
      return;
    }
    setCustomCategories((prev) => prev.filter((cat) => cat !== categoryToRemove));
    if (newExpense.category === categoryToRemove) {
      setNewExpense((prev) => ({ ...prev, category: customCategories[0] || 'Operations' }));
    }
    toast.success('Category removed successfully!');
  }, [customCategories, newExpense.category]);

  const toggleTaxConfig = useCallback(() => setShowTaxConfig((prev) => !prev), []);

  const handleTaxInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewTax((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleAddTax = useCallback(() => {
    if (!newTax.name.trim()) {
      toast.error('Tax name is required');
      return;
    }
    const rate = Number(newTax.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Tax rate must be a number between 0 and 100');
      return;
    }

    const taxId = newTax.name.toLowerCase().replace(/\s+/g, '-');
    if (taxes.some((tax) => tax.id === taxId)) {
      toast.error('A tax with a similar name already exists');
      return;
    }

    const taxToAdd = {
      id: taxId,
      name: newTax.name.trim(),
      rate,
      description: newTax.description.trim(),
      appliesTo: newTax.appliesTo,
      isEnabled: newTax.isEnabled,
      isIncludedInPrice: newTax.isIncludedInPrice,
    };

    setTaxes((prev) => [...prev, taxToAdd]);
    setNewTax({
      name: '',
      rate: 0,
      description: '',
      appliesTo: 'revenue',
      isEnabled: true,
      isIncludedInPrice: false,
    });
    toast.success('Tax added successfully!');
  }, [newTax, taxes]);

  const handleToggleTax = useCallback((taxId, isEnabled) => {
    setTaxes((prev) => prev.map((tax) => (tax.id === taxId ? { ...tax, isEnabled } : tax)));
  }, []);

  const handleRemoveTax = useCallback((taxId) => {
    if (taxes.length <= 1) {
      toast.error('You must have at least one tax configured');
      return;
    }
    setTaxes((prev) => prev.filter((tax) => tax.id !== taxId));
    toast.success('Tax removed successfully!');
  }, [taxes]);

  useEffect(() => {
    if ((showAddExpenseModal || showTaxConfig) && (modalRef.current || taxModalRef.current)) {
      const currentModalRef = showAddExpenseModal ? modalRef.current : taxModalRef.current;
      const focusableElements = currentModalRef.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

      document.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showAddExpenseModal, showTaxConfig, closeAddExpenseModal, toggleTaxConfig]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 flex items-center">
            <FaMoneyBillWave className="mr-2 text-blue-600" /> Payment Reconciliation
          </h1>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Refresh data"
            >
              <AiOutlineReload className="mr-1" /> Refresh
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="dd/MM/yyyy"
                aria-label="Start date"
              />
              <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date) => date && setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="p-2 border rounded-lg w-32 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="dd/MM/yyyy"
                aria-label="End date"
              />
              <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-800">Tax Configuration</h2>
            <button
              onClick={toggleTaxConfig}
              className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label="Configure taxes"
            >
              {showTaxConfig ? 'Hide Tax Settings' : 'Configure Taxes'}
            </button>
          </div>

          {showTaxConfig && (
            <div ref={taxModalRef} className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newTax.name}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. VAT, Withholding Tax"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="rate"
                    value={newTax.rate}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 16 for 16%"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
 agon="description"
                    name="description"
                    value={newTax.description}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tax description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Applies To</label>
                  <select
                    name="appliesTo"
                    value={newTax.appliesTo}
                    onChange={handleTaxInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="expenses">Expenses</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isIncludedInPrice"
                    name="isIncludedInPrice"
                    checked={newTax.isIncludedInPrice}
                    onChange={handleTaxInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isIncludedInPrice" className="ml-2 block text-sm text-gray-700">
                    Tax is included in price
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    name="isEnabled"
                    checked={newTax.isEnabled}
                    onChange={handleTaxInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isEnabled" className="ml-2 block text-sm text-gray-700">
                    Enabled by default
                  </label>
                </div>
              </div>
              <button
                onClick={handleAddTax}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Tax
              </button>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Configured Taxes</h3>
                {taxes.length === 0 ? (
                  <p className="text-sm text-gray-500">No taxes configured</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {taxes.map((tax) => (
                      <li key={tax.id} className="py-3 flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{tax.name} ({tax.rate}%)</span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {tax.appliesTo}
                            </span>
                            {tax.isIncludedInPrice && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Included
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{tax.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="relative inline-block w-10">
                            <input
                              type="checkbox"
                              id={`toggle-${tax.id}`}
                              checked={tax.isEnabled}
                              onChange={(e) => handleToggleTax(tax.id, e.target.checked)}
                              className="sr-only"
                            />
                            <label
                              htmlFor={`toggle-${tax.id}`}
                              className={`relative inline-block w-10 h-6 rounded-full cursor-pointer ${
                                tax.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  tax.isEnabled ? 'translate-x-4' : ''
                                }`}
                              />
                            </label>
                          </div>
                          <button
                            onClick={() => handleRemoveTax(tax.id)}
                            className="text-red-500 hover:text-red-700"
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
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Revenue Taxes</h3>
              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => (
                    <li key={tax.id} className="flex justify-between text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">
                        KES {calculateTaxes(totalRevenue, 'revenue').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-blue-600 mt-1">No taxes applied to revenue</p>
              )}
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800">Expense Taxes</h3>
              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => (
                    <li key={tax.id} className="flex justify-between text-sm">
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span className="font-medium">
                        KES {calculateTaxes(totalExpenses, 'expenses').find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-purple-600 mt-1">No taxes applied to expenses</p>
              )}
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Total Tax Liability</h3>
              <p className="text-lg font-bold text-green-700 mt-1">
                KES {(totalRevenueTax + totalExpenseTax).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">
              KES {totalRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              {taxes.some((tax) => tax.isEnabled && tax.appliesTo === 'revenue') && (
                <span className="block text-sm font-normal text-gray-500">
                  (Net: KES {netRevenue.toLocaleString('en-KE', { minimumFractionDigits: 2 })} + Tax: KES {totalRevenueTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
                </span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              KES {totalExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              {taxes.some((tax) => tax.isEnabled && tax.appliesTo === 'expenses') && (
                <span className="block text-sm font-normal text-gray-500">
                  (Net: KES {netExpenses.toLocaleString('en-KE', { minimumFractionDigits: 2 })} + Tax: KES {totalExpenseTax.toLocaleString('en-KE', { minimumFractionDigits: 2 })})
                </span>
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm">Profit (After Tax)</h3>
            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              KES {profit.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by ID, source, user, or category..."
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                aria-label="Search payments and expenses"
              />
            </div>
            <div className="flex space-x-2">
              <select
                className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                aria-label="View mode"
              >
                <option value="all">All</option>
                <option value="revenue">Revenue</option>
                <option value="expenses">Expenses</option>
              </select>
              <button
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
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
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
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
                className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isGeneratingReport ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Generate PDF report"
              >
                {isGeneratingReport ? (
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaDownload className="mr-2" />
                )}
                PDF
              </button>
              <CSVLink
                data={csvData}
                filename={`payment_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                aria-label="Download CSV"
                onClick={() => toast.success('CSV download started')}
              >
                <FaDownload className="mr-2" /> CSV
              </CSVLink>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8" aria-live="polite">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(viewMode === 'all' || viewMode === 'revenue') && (
              <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaMoneyBillWave className="mr-2 text-green-600" /> Revenue
                  </h2>
                  <span className="text-sm text-gray-500">{sortedPayments.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Amount (KES)
                        </th>
                        {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => (
                          <th key={tax.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {tax.name} ({tax.rate}%)
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross Amount (KES)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedPayments.length > 0 ? (
                        sortedPayments.map((payment) => {
                          const netAmount = calculateNetAmount(payment.amount, 'revenue');
                          const paymentTaxes = calculateTaxes(payment.amount, 'revenue');
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{payment.paymentId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.userName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.source}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').map((tax) => (
                                <td key={tax.id} className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                                  {paymentTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                {payment.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(parseISO(payment.date), 'dd/MM/yyyy')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6 + taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'revenue').length} className="px-6 py-4 text-center text-sm text-gray-500">
                            No revenue records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(viewMode === 'all' || viewMode === 'expenses') && (
              <div className="bg-white rounded-lg shadow overflow-hidden transition-all hover:shadow-md">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <FaReceipt className="mr-2 text-red-600" /> Expenses
                    </h2>
                    <button
                      onClick={openAddExpenseModal}
                      className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      aria-label="Add new expense"
                    >
                      <FaPlus className="mr-1" /> Add Expense
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">{sortedExpenses.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount (KES)
                        </th>
                        {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => (
                          <th key={tax.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {tax.name} ({tax.rate}%)
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Amount (KES)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedExpenses.length > 0 ? (
                        sortedExpenses.map((expense) => {
                          const expenseTaxes = calculateTaxes(expense.amount, 'expenses');
                          const netAmount = calculateNetAmount(expense.amount, 'expenses');
                          return (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{expense.expenseId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                {expense.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              {taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').map((tax) => (
                                <td key={tax.id} className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                                  {expenseTaxes.find((t) => t.id === tax.id)?.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                {netAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(parseISO(expense.date), 'dd/MM/yyyy')}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5 + taxes.filter((tax) => tax.isEnabled && tax.appliesTo === 'expenses').length} className="px-6 py-4 text-center text-sm text-gray-500">
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

      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAddExpenseModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div
              ref={modalRef}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Expense</h2>
                  <button
                    onClick={closeAddExpenseModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Close modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={newExpense.description}
                      onChange={handleExpenseInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="What was this expense for?"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (KES)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={newExpense.amount}
                      onChange={handleExpenseInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <button
                        onClick={toggleCategoryEditing}
                        className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                      >
                        {editingCategories ? <FaSave className="mr-1" /> : <FaEdit className="mr-1" />}
                        {editingCategories ? 'Save Categories' : 'Edit Categories'}
                      </button>
                    </div>
                    {editingCategories ? (
                      <div className="mb-4">
                        <div className="flex mb-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-grow px-3 py-2 border rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="New category name"
                          />
                          <button
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {customCategories.map((category) => (
                            <div key={category} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                              <span className="text-sm">{category}</span>
                              <button
                                onClick={() => handleRemoveCategory(category)}
                                className="ml-1 text-red-500 hover:text-red-700"
                                aria-label={`Remove ${category} category`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <select
                        id="category"
                        name="category"
                        value={newExpense.category}
                        onChange={handleExpenseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      >
                        {customCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <DatePicker
                      selected={new Date(newExpense.date)}
                      onChange={handleDateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      dateFormat="dd/MM/yyyy"
                      maxDate={new Date()}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleAddExpense}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Expense
                </button>
                <button
                  onClick={closeAddExpenseModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default PaymentReconciliation;