// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import CommissionService from '../services/CommissionService';
// import { formatCommissionData } from '../utils/formatters';

// const useCommission = (marketerId = null) => {
//   // State
//   const [transactions, setTransactions] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [payouts, setPayouts] = useState([]);
//   const [marketerPerformance, setMarketerPerformance] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [stats, setStats] = useState(null);

//   // Filter and pagination state
//   const [filters, setFilters] = useState({
//     status: 'all',
//     transaction_type: 'all',
//     date_from: '',
//     date_to: '',
//     min_amount: '',
//     max_amount: ''
//   });

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     pageSize: 20,
//     totalCount: 0,
//     totalPages: 0
//   });

//   // Refs for aborting requests
//   const abortControllerRef = useRef(null);

//   // Cleanup function
//   const abortPreviousRequest = useCallback(() => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();
//     return abortControllerRef.current.signal;
//   }, []);

//   // Fetch transactions
//   const fetchTransactions = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await CommissionService.getTransactions(
//         { ...filters, marketer_id: marketerId },
//         {
//           page: pagination.currentPage,
//           pageSize: pagination.pageSize
//         },
//         signal
//       );
      
//       const data = response.data;
//       const transactionList = data.results || data;
      
//       const formattedTransactions = transactionList.map(formatCommissionData);
//       setTransactions(formattedTransactions);
      
//       if (data.count !== undefined) {
//         const totalPages = Math.ceil(data.count / pagination.pageSize);
//         setPagination(prev => ({
//           ...prev,
//           totalCount: data.count,
//           totalPages
//         }));
//       }
      
//       return formattedTransactions;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching transactions:', err);
//         throw err;
//       }
//     }
//   }, [filters, pagination.currentPage, pagination.pageSize, marketerId]);

//   // Fetch summary
//   const fetchSummary = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await CommissionService.getCommissionSummary('month', signal);
//       setSummary(response.data);
//       return response.data;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching summary:', err);
//       }
//     }
//   }, []);

//   // Fetch payouts
//   const fetchPayouts = useCallback(async () => {
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await CommissionService.getPayoutHistory({ marketer_id: marketerId }, signal);
//       setPayouts(response.data.payouts || []);
//       return response.data;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching payouts:', err);
//       }
//     }
//   }, [marketerId]);

//   // Fetch marketer performance
//   const fetchMarketerPerformance = useCallback(async () => {
//     if (!marketerId) return;
    
//     const signal = abortControllerRef.current?.signal;
    
//     try {
//       const response = await CommissionService.getMarketerPerformance(
//         marketerId,
//         filters.date_from,
//         filters.date_to,
//         signal
//       );
//       setMarketerPerformance(response.data);
//       return response.data;
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching marketer performance:', err);
//       }
//     }
//   }, [marketerId, filters.date_from, filters.date_to]);

//   // Fetch all data
//   const fetchAllData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       abortPreviousRequest();
      
//       await Promise.all([
//         fetchTransactions(),
//         fetchSummary(),
//         fetchPayouts(),
//         marketerId ? fetchMarketerPerformance() : Promise.resolve()
//       ]);
      
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
//         console.error('Error fetching commission data:', err);
//         setError(err.message || 'Failed to load commission data');
//       }
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, [fetchTransactions, fetchSummary, fetchPayouts, fetchMarketerPerformance, marketerId, abortPreviousRequest]);

//   // Initial load
//   useEffect(() => {
//     fetchAllData();
    
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [fetchAllData]);

//   // Handle filter changes
//   const handleFilterChange = useCallback((filterName, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterName]: value
//     }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   }, []);

//   // Handle pagination
//   const handlePageChange = useCallback((page) => {
//     setPagination(prev => ({ ...prev, currentPage: page }));
//   }, []);

//   const handlePageSizeChange = useCallback((size) => {
//     const pageSize = parseInt(size, 10);
//     setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
//   }, []);

//   // Refresh data
//   const handleRefresh = useCallback(() => {
//     setIsRefreshing(true);
//     fetchAllData();
//   }, [fetchAllData]);

//   // Approve transaction
//   const approveTransaction = useCallback(async (transactionId, notes = '') => {
//     try {
//       setIsLoading(true);
//       const response = await CommissionService.approveTransaction(transactionId, notes);
      
//       if (response.data.success) {
//         // Refresh data
//         await fetchAllData();
//         return { success: true };
//       }
      
//       return { success: false, error: 'Failed to approve transaction' };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to approve transaction';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchAllData]);

//   // Mark as paid
//   const markAsPaid = useCallback(async (transactionId, paymentData) => {
//     try {
//       setIsLoading(true);
//       const response = await CommissionService.markAsPaid(transactionId, paymentData);
      
//       if (response.data.success) {
//         await fetchAllData();
//         return { success: true };
//       }
      
//       return { success: false, error: 'Failed to mark as paid' };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to mark as paid';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchAllData]);

//   // Process payout
//   const processPayout = useCallback(async (payoutData) => {
//     try {
//       setIsLoading(true);
//       const response = await CommissionService.processPayout(payoutData);
      
//       if (response.data.success) {
//         await fetchAllData();
//         return { success: true, data: response.data };
//       }
      
//       return { success: false, error: 'Failed to process payout' };
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message || 'Failed to process payout';
//       setError(errorMsg);
//       return { success: false, error: errorMsg };
//     } finally {
//       setIsLoading(false);
//     }
//   }, [fetchAllData]);

//   // Calculate statistics
//   const calculateStats = useCallback((transactionList) => {
//     if (!transactionList || transactionList.length === 0) {
//       return {
//         totalAmount: 0,
//         totalCount: 0,
//         averageAmount: 0,
//         pendingCount: 0,
//         paidCount: 0,
//         approvedCount: 0,
//         rejectedCount: 0
//       };
//     }
    
//     let totalAmount = 0;
//     let pendingCount = 0;
//     let paidCount = 0;
//     let approvedCount = 0;
//     let rejectedCount = 0;
    
//     transactionList.forEach(tx => {
//       totalAmount += tx.amount || 0;
      
//       switch (tx.status) {
//         case 'pending': pendingCount++; break;
//         case 'paid': paidCount++; break;
//         case 'approved': approvedCount++; break;
//         case 'rejected': rejectedCount++; break;
//       }
//     });
    
//     return {
//       totalAmount,
//       totalCount: transactionList.length,
//       averageAmount: totalAmount / transactionList.length,
//       pendingCount,
//       paidCount,
//       approvedCount,
//       rejectedCount
//     };
//   }, []);

//   // Update stats whenever transactions change
//   useEffect(() => {
//     if (transactions.length > 0) {
//       const calculatedStats = calculateStats(transactions);
//       setStats(calculatedStats);
//     }
//   }, [transactions, calculateStats]);

//   return {
//     // Data
//     transactions,
//     summary,
//     payouts,
//     marketerPerformance,
//     isLoading,
//     isRefreshing,
//     error,
//     stats,
//     filters,
//     pagination,
    
//     // Actions
//     handleFilterChange,
//     handlePageChange,
//     handlePageSizeChange,
//     handleRefresh,
//     approveTransaction,
//     markAsPaid,
//     processPayout,
    
//     // Derived state
//     totalCount: transactions.length,
//     hasFilters: Object.values(filters).some(v => v && v !== 'all')
//   };
// };

// export default useCommission;









import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CommissionService from '../services/CommissionService';

const useCommission = (marketerId = null) => {
  // State
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [marketerPerformance, setMarketerPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    status: 'all',
    transaction_type: 'all',
    date_from: '',
    date_to: ''
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });

  // Refs for aborting requests
  const abortControllerRef = useRef(null);

  // Cleanup function
  const abortPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    const signal = abortControllerRef.current?.signal;
    
    try {
      const response = await CommissionService.getTransactions(
        { ...filters, marketer_id: marketerId },
        {
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        },
        signal
      );
      
      const data = response.data || response;
      const transactionList = data.results || data;
      
      setTransactions(transactionList);
      
      if (data.count !== undefined) {
        const totalPages = Math.ceil(data.count / pagination.pageSize);
        setPagination(prev => ({
          ...prev,
          totalCount: data.count,
          totalPages
        }));
      }
      
      return transactionList;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching transactions:', err);
        throw err;
      }
    }
  }, [filters, pagination.currentPage, pagination.pageSize, marketerId]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    const signal = abortControllerRef.current?.signal;
    
    try {
      const response = await CommissionService.getCommissionSummary('month', signal);
      setSummary(response.data || response);
      return response.data || response;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching summary:', err);
      }
    }
  }, []);

  // Fetch payouts
  const fetchPayouts = useCallback(async () => {
    const signal = abortControllerRef.current?.signal;
    
    try {
      const response = await CommissionService.getPayoutHistory(
        { marketer_id: marketerId }, 
        signal
      );
      const data = response.data || response;
      setPayouts(data.payouts || []);
      return data;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching payouts:', err);
      }
    }
  }, [marketerId]);

  // Fetch marketer performance
  const fetchMarketerPerformance = useCallback(async () => {
    if (!marketerId) return;
    
    const signal = abortControllerRef.current?.signal;
    
    try {
      const response = await CommissionService.getMarketerPerformance(
        marketerId,
        filters.date_from,
        filters.date_to,
        signal
      );
      setMarketerPerformance(response.data || response);
      return response.data || response;
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching marketer performance:', err);
      }
    }
  }, [marketerId, filters.date_from, filters.date_to]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      abortPreviousRequest();
      
      await Promise.all([
        fetchTransactions(),
        fetchSummary(),
        fetchPayouts(),
        marketerId ? fetchMarketerPerformance() : Promise.resolve()
      ]);
      
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        console.error('Error fetching commission data:', err);
        setError(err.message || 'Failed to load commission data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchTransactions, fetchSummary, fetchPayouts, fetchMarketerPerformance, marketerId, abortPreviousRequest]);

  // Initial load
  useEffect(() => {
    fetchAllData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllData]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    const pageSize = parseInt(size, 10);
    setPagination(prev => ({ ...prev, pageSize, currentPage: 1 }));
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAllData();
  }, [fetchAllData]);

  const approveTransaction = useCallback(async (transactionId, notes = '') => {
    try {
      setIsLoading(true);
      const response = await CommissionService.approveTransaction(transactionId, notes);
      
      if (response.success) {
        await fetchAllData();
        return { success: true };
      }
      
      return { success: false, error: 'Failed to approve transaction' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to approve transaction';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllData]);

  const markAsPaid = useCallback(async (transactionId, paymentData) => {
    try {
      setIsLoading(true);
      const response = await CommissionService.markAsPaid(transactionId, paymentData);
      
      if (response.success) {
        await fetchAllData();
        return { success: true };
      }
      
      return { success: false, error: 'Failed to mark as paid' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to mark as paid';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllData]);

  const processPayout = useCallback(async (payoutData) => {
    try {
      setIsLoading(true);
      const response = await CommissionService.processPayout(payoutData);
      
      if (response.success) {
        await fetchAllData();
        return { success: true, data: response.data || response };
      }
      
      return { success: false, error: 'Failed to process payout' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to process payout';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllData]);

  const stats = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        pendingCount: 0,
        paidCount: 0,
        approvedCount: 0,
        rejectedCount: 0
      };
    }
    
    let totalAmount = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    
    transactions.forEach(tx => {
      totalAmount += tx.amount || 0;
      
      switch (tx.status) {
        case 'pending': pendingCount++; break;
        case 'paid': paidCount++; break;
        case 'approved': approvedCount++; break;
        case 'rejected': rejectedCount++; break;
      }
    });
    
    return {
      totalAmount,
      totalCount: transactions.length,
      averageAmount: totalAmount / transactions.length,
      pendingCount,
      paidCount,
      approvedCount,
      rejectedCount
    };
  }, [transactions]);

  return {
    transactions,
    summary,
    payouts,
    marketerPerformance,
    isLoading,
    isRefreshing,
    error,
    stats,
    filters,
    pagination,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
    approveTransaction,
    markAsPaid,
    processPayout,
    totalCount: transactions.length,
    hasFilters: Object.values(filters).some(v => v && v !== 'all')
  };
};

export default useCommission;