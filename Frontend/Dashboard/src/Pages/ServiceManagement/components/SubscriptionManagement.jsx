

// src/Pages/ServiceManagement/components/SubscriptionManagement.jsx
import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Eye, Trash2, Check, X, AlertTriangle,
  Wifi, Cable, Clock, Star as StarIcon, Search, Filter,
  ChevronDown, ChevronUp, Download, MoreVertical, Edit, Copy,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { API_ENDPOINTS, PAGINATION } from './constants';
import { useApi } from './hooks/useApi';
import { useBulkOperations } from './hooks/useBulkOperations';
import { usePagination } from './hooks/usePagination';
import { useDebounce } from './hooks/useDebounce';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { TableSkeleton } from './common/TableSkeleton';
import { ConfirmDialog } from './common/ConfirmDialog';

const Star = ({ filled, onClick, className, disabled }) => (
  <motion.svg
    className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 20 20"
    onClick={disabled ? undefined : onClick}
    whileHover={!disabled ? { scale: 1.2 } : {}}
    whileTap={!disabled ? { scale: 0.9 } : {}}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </motion.svg>
);

const SubscriptionManagement = memo(({ subscriptions = [], onRefresh, theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAccessMethod, setFilterAccessMethod] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [ratingLoading, setRatingLoading] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null });
  
  // Cache for client and plan details
  const [clientCache, setClientCache] = useState({});
  const [planCache, setPlanCache] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  
  // Use refs to track fetched IDs and prevent infinite loops
  const fetchedClientsRef = useRef(new Set());
  const fetchedPlansRef = useRef(new Set());
  const isFetchingRef = useRef(false);
  
  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // API hooks for fetching client and plan details
  const { fetchData: fetchClient } = useApi('', { manual: true });
  const { fetchData: fetchPlan } = useApi('', { manual: true });
  
  // Pagination
  const {
    page,
    pageSize,
    total,
    totalPages,
    setTotal,
    nextPage,
    prevPage,
    changePageSize,
  } = usePagination(1, PAGINATION.DEFAULT_PAGE_SIZE);
  
  // Bulk operations
  const {
    selected,
    loading: bulkLoading,
    results: bulkResults,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    executeBulkAction,
  } = useBulkOperations((result) => {
    if (result.success) {
      addNotification({
        type: 'success',
        message: `Bulk action completed: ${result.successful} successful, ${result.failed} failed`,
      });
      onRefresh();
    } else {
      addNotification({ type: 'error', message: result.error });
    }
  });
  
  // Enhanced helper function to extract client data from various response formats
  const extractClientData = (response) => {
    if (!response) return null;
    
    console.log('Extracting client data from:', response);
    
    // Case 1: Direct client object
    if (response.id && (response.user_type || response.username)) {
      return response;
    }
    
    // Case 2: Array response
    if (Array.isArray(response)) {
      if (response.length === 0) return null;
      
      const firstItem = response[0];
      
      // Check for nested client property
      if (firstItem?.client) {
        return firstItem.client;
      }
      // Check for data property
      if (firstItem?.data) {
        return firstItem.data;
      }
      // Check if firstItem itself has id
      if (firstItem?.id) {
        return firstItem;
      }
      // Otherwise return the item itself
      return firstItem;
    }
    
    // Case 3: Object with success and client properties
    if (response.success && response.client) {
      return response.client;
    }
    
    // Case 4: Object with data property
    if (response.data) {
      // Check if data contains client
      if (response.data.client) {
        return response.data.client;
      }
      return response.data;
    }
    
    // Case 5: Object with results property (pagination)
    if (response.results && Array.isArray(response.results) && response.results.length > 0) {
      return response.results[0];
    }
    
    // Case 6: Object with users property
    if (response.users && Array.isArray(response.users) && response.users.length > 0) {
      return response.users[0];
    }
    
    return response;
  };
  
  // Enhanced helper function to extract plan data from various response formats
  const extractPlanData = (response) => {
    if (!response) return null;
    
    console.log('Extracting plan data from:', response);
    
    // Case 1: Direct plan object
    if (response.id && response.name) {
      return response;
    }
    
    // Case 2: Array response
    if (Array.isArray(response)) {
      if (response.length === 0) return null;
      
      const firstItem = response[0];
      
      // Check for nested plan property
      if (firstItem?.plan) {
        return firstItem.plan;
      }
      // Check for data property
      if (firstItem?.data) {
        return firstItem.data;
      }
      // Check if firstItem itself has id and name
      if (firstItem?.id && firstItem?.name) {
        return firstItem;
      }
      // Check for summary property (from your API response)
      if (firstItem?.summary) {
        return firstItem.summary;
      }
      // Otherwise return the item itself
      return firstItem;
    }
    
    // Case 3: Object with success and plan properties
    if (response.success && response.plan) {
      return response.plan;
    }
    
    // Case 4: Object with data property
    if (response.data) {
      // Check if data contains plan
      if (response.data.plan) {
        return response.data.plan;
      }
      return response.data;
    }
    
    // Case 5: Object with results property (pagination)
    if (response.results && Array.isArray(response.results) && response.results.length > 0) {
      return response.results[0];
    }
    
    // Case 6: Object with plans property
    if (response.plans && Array.isArray(response.plans) && response.plans.length > 0) {
      return response.plans[0];
    }
    
    // Case 7: Object with summary property (from your API)
    if (response.summary) {
      return response.summary;
    }
    
    return response;
  };
  
  // Fetch client and plan details for subscriptions
  useEffect(() => {
    const fetchDetails = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current || !subscriptions || subscriptions.length === 0) return;
      
      isFetchingRef.current = true;
      
      const newLoading = { ...loadingDetails };
      const newClientCache = { ...clientCache };
      const newPlanCache = { ...planCache };
      let hasChanges = false;
      
      for (const sub of subscriptions) {
        // Fetch client details if not cached and not already fetched
        if (sub.client_id && 
            !clientCache[sub.client_id] && 
            !fetchedClientsRef.current.has(sub.client_id) &&
            !newLoading[`client_${sub.client_id}`]) {
          
          newLoading[`client_${sub.client_id}`] = true;
          fetchedClientsRef.current.add(sub.client_id);
          hasChanges = true;
          
          try {
            console.log(`Fetching client from: ${API_ENDPOINTS.AUTH_CLIENT_DETAIL(sub.client_id)}`);
            const response = await fetchClient(
              API_ENDPOINTS.AUTH_CLIENT_DETAIL(sub.client_id),
              'GET'
            );
            
            console.log('Client detail response:', response);
            
            const clientData = extractClientData(response);
            
            if (clientData) {
              console.log('Extracted client data:', clientData);
              newClientCache[sub.client_id] = clientData;
            } else {
              console.warn('No client data found in response, using fallback');
              newClientCache[sub.client_id] = { 
                name: `Client ${sub.client_id.slice(0, 8)}`,
                phone_number: '',
                error: true 
              };
            }
          } catch (error) {
            console.error(`Failed to fetch client ${sub.client_id}:`, error);
            newClientCache[sub.client_id] = { 
              name: `Client ${sub.client_id.slice(0, 8)}`,
              phone_number: '',
              error: true 
            };
          } finally {
            delete newLoading[`client_${sub.client_id}`];
          }
        }
        
        // Fetch plan details if not cached and not already fetched
        if (sub.internet_plan_id && 
            !planCache[sub.internet_plan_id] && 
            !fetchedPlansRef.current.has(sub.internet_plan_id) &&
            !newLoading[`plan_${sub.internet_plan_id}`]) {
          
          newLoading[`plan_${sub.internet_plan_id}`] = true;
          fetchedPlansRef.current.add(sub.internet_plan_id);
          hasChanges = true;
          
          try {
            const detailUrl = API_ENDPOINTS.INTERNET_PLAN_DETAIL(sub.internet_plan_id);
            console.log(`Fetching plan from: ${detailUrl}`);
            
            const response = await fetchPlan(detailUrl, 'GET');
            
            console.log('Plan detail response:', response);
            
            const planData = extractPlanData(response);
            
            if (planData) {
              console.log('Extracted plan data:', planData);
              newPlanCache[sub.internet_plan_id] = planData;
            } else {
              console.warn(`No plan data found for ${sub.internet_plan_id}, using fallback`);
              newPlanCache[sub.internet_plan_id] = { 
                name: `Plan ${sub.internet_plan_id.slice(0, 8)}`,
                category: 'Residential',
                price: 0,
                error: true 
              };
            }
          } catch (error) {
            console.error(`Failed to fetch plan ${sub.internet_plan_id}:`, error);
            newPlanCache[sub.internet_plan_id] = { 
              name: `Plan ${sub.internet_plan_id.slice(0, 8)}`,
              category: 'Residential',
              price: 0,
              error: true 
            };
          } finally {
            delete newLoading[`plan_${sub.internet_plan_id}`];
          }
        }
      }
      
      // Only update state if there were changes
      if (hasChanges) {
        setClientCache(newClientCache);
        setPlanCache(newPlanCache);
        setLoadingDetails(newLoading);
      }
      
      isFetchingRef.current = false;
    };
    
    fetchDetails();
    
    // Cleanup function
    return () => {
      isFetchingRef.current = false;
    };
  }, [subscriptions, fetchClient, fetchPlan]);
  
  // Transform subscriptions with enriched data
  const enrichedSubscriptions = useMemo(() => {
    if (!subscriptions) return [];
    
    return subscriptions.map(sub => {
      const client = clientCache[sub.client_id];
      const plan = planCache[sub.internet_plan_id];
      
      // Get plan name from cache or use fallback
      let planName = 'Unknown Plan';
      if (plan?.name) {
        planName = plan.name;
      } else if (plan?.plan_name) {
        planName = plan.plan_name;
      } else if (plan?.title) {
        planName = plan.title;
      } else if (plan?.summary?.name) {
        planName = plan.summary.name;
      } else if (sub.internet_plan_id) {
        planName = `Plan ${sub.internet_plan_id.slice(0, 8)}`;
      }
      
      // Get client name from cache or use fallback
      let clientName = 'Unknown Client';
      if (client?.name) {
        clientName = client.name;
      } else if (client?.username) {
        clientName = client.username;
      } else if (client?.full_name) {
        clientName = client.full_name;
      } else if (client?.first_name && client?.last_name) {
        clientName = `${client.first_name} ${client.last_name}`;
      } else if (sub.client_id) {
        clientName = `Client ${sub.client_id.slice(0, 8)}`;
      }
      
      // Get client phone
      let clientPhone = '';
      if (client?.phone_number_display) {
        clientPhone = client.phone_number_display;
      } else if (client?.phone_number) {
        clientPhone = client.phone_number;
      } else if (client?.phone) {
        clientPhone = client.phone;
      } else if (sub.metadata?.client_phone) {
        clientPhone = sub.metadata.client_phone;
      }
      
      // Get plan price
      let planPrice = 0;
      if (plan?.price) {
        planPrice = parseFloat(plan.price) || 0;
      } else if (plan?.price_formatted) {
        const match = String(plan.price_formatted).match(/[\d,]+(\.\d+)?/);
        if (match) {
          planPrice = parseFloat(match[0].replace(/,/g, ''));
        }
      } else if (plan?.summary?.price) {
        const match = String(plan.summary.price).match(/[\d,]+(\.\d+)?/);
        if (match) {
          planPrice = parseFloat(match[0].replace(/,/g, ''));
        }
      } else if (sub.metadata?.plan_price) {
        planPrice = parseFloat(sub.metadata.plan_price) || 0;
      }
      
      // Get plan category
      let planCategory = 'Standard';
      if (plan?.category) {
        planCategory = plan.category;
      } else if (plan?.plan_type) {
        planCategory = plan.plan_type === 'Free_trial' ? 'Free Trial' : plan.plan_type;
      } else if (plan?.planType) {
        planCategory = plan.planType === 'free_trial' ? 'Free Trial' : plan.planType;
      } else if (plan?.summary?.category) {
        planCategory = plan.summary.category;
      } else if (plan?.summary?.plan_type) {
        planCategory = plan.summary.plan_type === 'Free_trial' ? 'Free Trial' : plan.summary.plan_type;
      }
      
      // Get client connection type
      let clientConnectionType = client?.connection_type;
      if (!clientConnectionType && client?.user_type) {
        clientConnectionType = client.user_type === 'pppoe_client' ? 'pppoe' : 'hotspot';
      }
      
      // Get client date joined
      let clientDateJoined = client?.date_joined;
      if (!clientDateJoined && client?.created_at) {
        clientDateJoined = client.created_at;
      } else if (!clientDateJoined && client?.created) {
        clientDateJoined = client.created;
      }
      
      return {
        ...sub,
        // Client information
        client_name: clientName,
        client_phone: clientPhone,
        client_connection_type: clientConnectionType,
        client_date_joined: clientDateJoined,
        
        // Plan information
        plan_name: planName,
        plan_category: planCategory,
        plan_price: planPrice,
        
        // Status display
        status_display: sub.status_display || sub.status,
        
        // Loading state
        loading: loadingDetails[`client_${sub.client_id}`] || loadingDetails[`plan_${sub.internet_plan_id}`]
      };
    });
  }, [subscriptions, clientCache, planCache, loadingDetails]);
  
  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return enrichedSubscriptions
      .filter(sub => {
        // Search filter
        const matchesSearch = debouncedSearch === '' ||
          (sub.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (sub.plan_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
          (sub.client_phone?.includes(debouncedSearch)) ||
          (sub.id?.toLowerCase().includes(debouncedSearch.toLowerCase()));
        
        // Status filter
        const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
        
        // Access method filter
        const matchesAccess = filterAccessMethod === 'all' || 
          (filterAccessMethod === 'hotspot' && sub.access_method === 'hotspot') ||
          (filterAccessMethod === 'pppoe' && sub.access_method === 'pppoe');
        
        return matchesSearch && matchesStatus && matchesAccess;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        // Handle dates
        if (sortField === 'created_at' || sortField === 'start_date' || sortField === 'end_date') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }
        
        // Handle strings
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        // Handle undefined/null
        if (aVal === undefined || aVal === null) aVal = '';
        if (bVal === undefined || bVal === null) bVal = '';
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [enrichedSubscriptions, debouncedSearch, filterStatus, filterAccessMethod, sortField, sortDirection]);
  
  // Paginate results
  const paginatedSubscriptions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredSubscriptions.slice(start, end);
  }, [filteredSubscriptions, page, pageSize]);
  
  // Update total count
  useEffect(() => {
    setTotal(filteredSubscriptions.length);
  }, [filteredSubscriptions.length, setTotal]);
  
  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);
  
  // Handle single subscription action
  const handleAction = useCallback(async (id, action) => {
    setConfirmDialog({ open: true, id, action });
  }, []);
  
  const confirmAction = useCallback(async () => {
    const { id, action } = confirmDialog;
    setConfirmDialog({ open: false, id: null, action: null });
    
    try {
      let endpoint;
      let method = 'POST';
      
      switch(action) {
        case 'activate':
          endpoint = API_ENDPOINTS.SUBSCRIPTION_ACTIVATE(id);
          break;
        case 'deactivate':
          endpoint = API_ENDPOINTS.SUBSCRIPTION_DEACTIVATE(id);
          break;
        case 'refresh':
          endpoint = API_ENDPOINTS.SUBSCRIPTION_REFRESH(id);
          break;
        case 'delete':
          endpoint = API_ENDPOINTS.SUBSCRIPTION_DETAIL(id);
          method = 'DELETE';
          break;
        default:
          return;
      }
      
      const { fetchData } = useApi(endpoint, { manual: true });
      
      if (method === 'DELETE') {
        await fetchData({}, 'DELETE');
      } else {
        await fetchData({}, 'POST');
      }
      
      addNotification({ type: 'success', message: `Subscription ${action}d successfully` });
      onRefresh();
    } catch (err) {
      addNotification({ type: 'error', message: `Failed to ${action} subscription` });
    }
  }, [confirmDialog, onRefresh, addNotification]);
  
  // Handle rating
  const handleRating = useCallback(async (id, rating) => {
    setRatingLoading(prev => ({ ...prev, [id]: true }));
    
    try {
      const { fetchData } = useApi(API_ENDPOINTS.SUBSCRIPTION_DETAIL(id), { manual: true });
      await fetchData({ rating }, 'PATCH');
      addNotification({ type: 'success', message: 'Rating updated' });
      onRefresh();
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to update rating' });
    } finally {
      setRatingLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [onRefresh, addNotification]);
  
  // Render stars
  const renderStars = useCallback((rating = 0, id) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-500' : 'text-gray-400'}`}
          filled={star <= rating}
          onClick={() => handleRating(id, star)}
          disabled={ratingLoading[id]}
        />
      ))}
      {ratingLoading[id] && <span className="text-xs ml-2 animate-pulse">Saving...</span>}
    </div>
  ), [ratingLoading, handleRating]);
  
  // Get status badge
  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: Check },
      pending_activation: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: Clock },
      expired: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: X },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: RefreshCw },
      suspended: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: Pause },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: X },
    };
    
    const { color, icon: Icon } = statusMap[status] || statusMap.draft;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${color}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  }, []);
  
  // Get access icon
  const getAccessIcon = useCallback((method) => {
    if (method === 'hotspot') {
      return <Wifi className="w-5 h-5 text-blue-600" title="Hotspot" />;
    } else if (method === 'pppoe') {
      return <Cable className="w-5 h-5 text-green-600" title="PPPoE" />;
    }
    return null;
  }, []);
  
  // Options for EnhancedSelect
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending_activation', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'draft', label: 'Draft' },
    { value: 'expired', label: 'Expired' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'failed', label: 'Failed' }
  ];
  
  const accessOptions = [
    { value: 'all', label: 'All Access' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'pppoe', label: 'PPPoE' }
  ];
  
  const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS.map(size => ({
    value: size,
    label: `${size} / page`
  }));
  
  return (
    <div className={`space-y-6`}>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, id: null, action: null })}
        onConfirm={confirmAction}
        title={`Confirm ${confirmDialog.action}`}
        message={`Are you sure you want to ${confirmDialog.action} this subscription?`}
        confirmText={confirmDialog.action}
        cancelText="Cancel"
        theme={theme}
      />
      
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, plan, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
            />
          </div>
          
          {/* Status Filter - EnhancedSelect */}
          <div className="min-w-32">
            <EnhancedSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              placeholder="Filter by status"
              theme={theme}
            />
          </div>
          
          {/* Access Method Filter - EnhancedSelect */}
          <div className="min-w-32">
            <EnhancedSelect
              value={filterAccessMethod}
              onChange={setFilterAccessMethod}
              options={accessOptions}
              placeholder="Filter by access"
              theme={theme}
            />
          </div>
          
          {/* Page Size - EnhancedSelect */}
          <div className="min-w-28">
            <EnhancedSelect
              value={pageSize}
              onChange={(value) => changePageSize(Number(value))}
              options={pageSizeOptions}
              placeholder="Page size"
              theme={theme}
            />
          </div>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {selected.size} selected
              </span>
              <button
                onClick={() => executeBulkAction(API_ENDPOINTS.BULK_ACTIVATE, 'activate')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Activate
              </button>
              <button
                onClick={() => executeBulkAction(API_ENDPOINTS.BULK_DEACTIVATE, 'deactivate')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
              >
                Deactivate
              </button>
              <button
                onClick={() => executeBulkAction(API_ENDPOINTS.BULK_DELETE, 'delete')}
                disabled={bulkLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear
              </button>
            </>
          )}
          
          <button
            onClick={onRefresh}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
      
      {/* Results count */}
      <div className={`text-sm ${themeClasses.text.tertiary}`}>
        Showing {paginatedSubscriptions.length} of {filteredSubscriptions.length} subscriptions
        {selected.size > 0 && ` • ${selected.size} selected`}
      </div>
      
      {/* Selection Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleSelectAll(filteredSubscriptions)}
          className="flex items-center gap-2 text-sm font-medium hover:text-indigo-600"
        >
          {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
            <Check className="w-5 h-5 text-indigo-600" />
          ) : (
            <div className="w-5 h-5 border-2 border-gray-400 rounded" />
          )}
          {selected.size === filteredSubscriptions.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      {/* Table */}
      <div className={`rounded-xl overflow-hidden shadow-lg ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${themeClasses.bg.secondary}`}>
              <tr>
                <th className="p-4 text-left w-12">
                  <button 
                    onClick={() => toggleSelectAll(paginatedSubscriptions)}
                    className="flex items-center gap-2"
                  >
                    {selected.size === filteredSubscriptions.length && filteredSubscriptions.length > 0 ? (
                      <Check className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('client_name')}>
                  <div className="flex items-center gap-2">
                    Client
                    {sortField === 'client_name' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('plan_name')}>
                  <div className="flex items-center gap-2">
                    Plan
                    {sortField === 'plan_name' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left">Access</th>
                <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left">Rating</th>
                <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-2">
                    Created
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan="8" className={`p-8 text-center ${themeClasses.text.secondary}`}>
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                paginatedSubscriptions.map(sub => (
                  <tr key={sub.id} className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${themeClasses.border.light}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelect(sub.id)}>
                        {selected.has(sub.id) ? (
                          <Check className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      {sub.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                          <span className={`text-sm ${themeClasses.text.tertiary}`}>Loading...</span>
                        </div>
                      ) : (
                        <>
                          <div className={`font-medium ${themeClasses.text.primary}`}>
                            {sub.client_name}
                          </div>
                          <div className={`text-xs ${themeClasses.text.tertiary}`}>
                            {sub.client_phone || sub.client_id}
                          </div>
                          {sub.client_date_joined && (
                            <div className={`text-xs ${themeClasses.text.tertiary}`}>
                              Joined: {new Date(sub.client_date_joined).toLocaleDateString()}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="p-4">
                      {sub.loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                          <span className={`text-sm ${themeClasses.text.tertiary}`}>Loading...</span>
                        </div>
                      ) : (
                        <>
                          <div className={`font-medium ${themeClasses.text.primary}`}>
                            {sub.plan_name}
                          </div>
                          <div className={`text-xs ${themeClasses.text.tertiary}`}>
                            {sub.plan_category || ''}
                          </div>
                          {sub.plan_price > 0 && (
                            <div className={`text-xs ${themeClasses.text.tertiary}`}>
                              KES {sub.plan_price.toLocaleString()}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td className="p-4">
                      {getAccessIcon(sub.access_method)}
                    </td>
                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                    <td className="p-4">{renderStars(sub.rating || 0, sub.id)}</td>
                    <td className={`p-4 text-sm ${themeClasses.text.secondary}`}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction(sub.id, 'activate')}
                          className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                          title="Activate"
                          disabled={sub.status === 'active'}
                        >
                          <Play className={`w-4 h-4 ${sub.status === 'active' ? 'text-gray-400' : 'text-green-600'}`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction(sub.id, 'deactivate')}
                          className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30"
                          title="Suspend"
                          disabled={sub.status !== 'active'}
                        >
                          <Pause className={`w-4 h-4 ${sub.status !== 'active' ? 'text-gray-400' : 'text-orange-600'}`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction(sub.id, 'refresh')}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          title="Refresh"
                        >
                          <RefreshCw className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction(sub.id, 'delete')}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-4 py-3 border-t ${themeClasses.border.light} flex items-center justify-between`}>
            <div className={`text-sm ${themeClasses.text.tertiary}`}>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk operation results */}
      <AnimatePresence>
        {bulkResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg ${
              bulkResults.success 
                ? bulkResults.failed === 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Bulk Operation Results</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-xl font-bold">{bulkResults.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                <div className="text-xl font-bold text-green-600">{bulkResults.successful}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                <div className="text-xl font-bold text-red-600">{bulkResults.failed}</div>
              </div>
            </div>
            {bulkResults.errors?.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-sm">Errors:</p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  {bulkResults.errors.map((err, i) => (
                    <li key={i} className="text-red-600 dark:text-red-400">{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SubscriptionManagement.displayName = 'SubscriptionManagement';

export default SubscriptionManagement;