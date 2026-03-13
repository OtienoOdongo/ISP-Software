// src/Pages/ServiceManagement/components/BulkOperations.jsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RefreshCw, Trash2, CheckSquare, Square,
  AlertTriangle, Check, X, Clock, Filter, Search,
  Download, Upload, Copy, Edit, Eye, ChevronDown, ChevronUp,
  Zap, Shield, Users, Wifi, Cable, Calendar
} from 'lucide-react';
import { API_ENDPOINTS, PAGINATION } from './constants';
import { useApi } from './hooks/useApi';
import { useBulkOperations } from './hooks/useBulkOperations';
import { useDebounce } from './hooks/useDebounce';
import { usePagination } from './hooks/usePagination';
import { getThemeClasses, EnhancedSelect } from '../../../components/ServiceManagement/Shared/components';
import { TableSkeleton } from './common/TableSkeleton';
import { ConfirmDialog } from './common/ConfirmDialog';
import { ErrorBoundary } from './common/ErrorBoundary';

const BulkOperations = ({ subscriptions = [], onRefresh, theme, addNotification }) => {
  const themeClasses = getThemeClasses(theme);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [actionPayload, setActionPayload] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Track when data is loaded
  
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
  
  // Bulk operations hook
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
        type: result.failed === 0 ? 'success' : 'warning',
        message: `Bulk action: ${result.successful} successful, ${result.failed} failed`,
      });
      onRefresh();
    } else {
      addNotification({ type: 'error', message: result.error });
    }
  });
  
  // Enhanced helper function to extract client data from various response formats
  const extractClientData = (response) => {
    if (!response) return null;
    
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
      setDataLoaded(false);
      
      const newLoading = { ...loadingDetails };
      const newClientCache = { ...clientCache };
      const newPlanCache = { ...planCache };
      let hasChanges = false;
      
      // Create arrays of unique IDs to fetch
      const uniqueClientIds = [...new Set(subscriptions.map(s => s.client_id).filter(Boolean))];
      const uniquePlanIds = [...new Set(subscriptions.map(s => s.internet_plan_id).filter(Boolean))];
      
      console.log('Unique client IDs to fetch:', uniqueClientIds);
      console.log('Unique plan IDs to fetch:', uniquePlanIds);
      
      // Fetch all client details first
      for (const clientId of uniqueClientIds) {
        if (!clientCache[clientId] && !fetchedClientsRef.current.has(clientId)) {
          newLoading[`client_${clientId}`] = true;
          fetchedClientsRef.current.add(clientId);
          hasChanges = true;
          
          try {
            console.log(`Fetching client from: ${API_ENDPOINTS.AUTH_CLIENT_DETAIL(clientId)}`);
            const response = await fetchClient(
              API_ENDPOINTS.AUTH_CLIENT_DETAIL(clientId),
              'GET'
            );
            
            console.log('Client detail response:', response);
            
            const clientData = extractClientData(response);
            
            if (clientData) {
              console.log('Extracted client data:', clientData);
              newClientCache[clientId] = clientData;
            } else {
              console.warn('No client data found in response, using fallback');
              newClientCache[clientId] = { 
                name: `Client ${clientId.slice(0, 8)}`,
                phone_number: '',
                error: true 
              };
            }
          } catch (error) {
            console.error(`Failed to fetch client ${clientId}:`, error);
            newClientCache[clientId] = { 
              name: `Client ${clientId.slice(0, 8)}`,
              phone_number: '',
              error: true 
            };
          } finally {
            delete newLoading[`client_${clientId}`];
          }
        }
      }
      
      // Fetch all plan details
      for (const planId of uniquePlanIds) {
        if (!planCache[planId] && !fetchedPlansRef.current.has(planId)) {
          newLoading[`plan_${planId}`] = true;
          fetchedPlansRef.current.add(planId);
          hasChanges = true;
          
          try {
            const detailUrl = API_ENDPOINTS.INTERNET_PLAN_DETAIL(planId);
            console.log(`Fetching plan from: ${detailUrl}`);
            
            const response = await fetchPlan(detailUrl, 'GET');
            
            console.log('Plan detail response:', response);
            
            const planData = extractPlanData(response);
            
            if (planData) {
              console.log('Extracted plan data:', planData);
              newPlanCache[planId] = planData;
            } else {
              console.warn(`No plan data found for ${planId}, using fallback`);
              newPlanCache[planId] = { 
                name: `Plan ${planId.slice(0, 8)}`,
                category: 'Residential',
                price: 0,
                error: true 
              };
            }
          } catch (error) {
            console.error(`Failed to fetch plan ${planId}:`, error);
            newPlanCache[planId] = { 
              name: `Plan ${planId.slice(0, 8)}`,
              category: 'Residential',
              price: 0,
              error: true 
            };
          } finally {
            delete newLoading[`plan_${planId}`];
          }
        }
      }
      
      // Only update state if there were changes
      if (hasChanges) {
        console.log('Updating caches:', { 
          newClientCache, 
          newPlanCache 
        });
        await setClientCache(newClientCache);
        await setPlanCache(newPlanCache);
        await setLoadingDetails(newLoading);
      }
      
      setDataLoaded(true);
      isFetchingRef.current = false;
    };
    
    fetchDetails();
    
    // Cleanup function
    return () => {
      isFetchingRef.current = false;
    };
  }, [subscriptions, fetchClient, fetchPlan]); // Removed clientCache and planCache from deps
  
  // Transform subscriptions with enriched data - now depends on dataLoaded to ensure cache is populated
  const enrichedSubscriptions = useMemo(() => {
    if (!subscriptions || !dataLoaded) return [];
    
    console.log('Current plan cache:', planCache);
    console.log('Current client cache:', clientCache);
    
    return subscriptions.map(sub => {
      const client = clientCache[sub.client_id];
      const plan = planCache[sub.internet_plan_id];
      
      console.log(`Processing sub ${sub.id}:`, { 
        clientId: sub.client_id, 
        planId: sub.internet_plan_id,
        hasClient: !!client,
        hasPlan: !!plan,
        planData: plan,
        clientData: client
      });
      
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
        id: sub.id,
        client_id: sub.client_id,
        client_name: clientName,
        client_phone: clientPhone,
        client_connection_type: clientConnectionType,
        client_date_joined: clientDateJoined,
        plan_id: sub.internet_plan_id,
        plan_name: planName,
        plan_category: planCategory,
        plan_price: planPrice,
        access_method: sub.access_method || 'hotspot',
        status: sub.status || 'unknown',
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        metadata: sub.metadata || {},
        loading: loadingDetails[`client_${sub.client_id}`] || loadingDetails[`plan_${sub.internet_plan_id}`]
      };
    });
  }, [subscriptions, clientCache, planCache, loadingDetails, dataLoaded]);
  
  // Get unique plans for filter
  const uniquePlans = useMemo(() => {
    const plans = new Map();
    enrichedSubscriptions.forEach(sub => {
      if (sub.plan_id && !plans.has(sub.plan_id)) {
        plans.set(sub.plan_id, {
          id: sub.plan_id,
          name: sub.plan_name || 'Unknown Plan',
        });
      }
    });
    return Array.from(plans.values());
  }, [enrichedSubscriptions]);
  
  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return enrichedSubscriptions.filter(sub => {
      // Search filter
      const matchesSearch = debouncedSearch === '' ||
        (sub.client_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (sub.client_phone?.includes(debouncedSearch)) ||
        (sub.plan_name?.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        (sub.id?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      
      // Status filter - map to your actual status values
      const statusMatches = (status) => {
        if (filterStatus === 'all') return true;
        
        const statusMap = {
          'active': ['active'],
          'pending': ['pending_activation', 'draft', 'processing'],
          'processing': ['processing'],
          'inactive': ['expired', 'suspended', 'cancelled'],
          'failed': ['failed']
        };
        
        const matchingStatuses = statusMap[filterStatus] || [filterStatus];
        return matchingStatuses.includes(status);
      };
      
      const matchesStatus = statusMatches(sub.status);
      
      // Access method filter
      const matchesAccess = filterAccess === 'all' || 
        (filterAccess === 'hotspot' && sub.access_method === 'hotspot') ||
        (filterAccess === 'pppoe' && sub.access_method === 'pppoe');
      
      // Plan filter
      const matchesPlan = filterPlan === 'all' || sub.plan_id === filterPlan;
      
      return matchesSearch && matchesStatus && matchesAccess && matchesPlan;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle dates
      if (sortField === 'created_at' || sortField === 'updated_at') {
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
  }, [enrichedSubscriptions, debouncedSearch, filterStatus, filterAccess, filterPlan, sortField, sortDirection]);
  
  // Update total count
  useEffect(() => {
    setTotal(filteredSubscriptions.length);
  }, [filteredSubscriptions.length, setTotal]);
  
  // Paginate results
  const paginatedSubscriptions = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredSubscriptions.slice(start, end);
  }, [filteredSubscriptions, page, pageSize]);
  
  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);
  
  // Handle bulk action confirmation
  const handleBulkAction = useCallback((action) => {
    if (selected.size === 0) {
      addNotification({ type: 'warning', message: 'No items selected' });
      return;
    }
    
    setConfirmDialog({ open: true, action });
  }, [selected.size, addNotification]);
  
  // Execute confirmed action
  const executeConfirmedAction = useCallback(async () => {
    const { action } = confirmDialog;
    let endpoint = '';
    let payload = { subscription_ids: Array.from(selected) };
    
    switch (action) {
      case 'activate':
        endpoint = API_ENDPOINTS.BULK_ACTIVATE;
        break;
      case 'deactivate':
        endpoint = API_ENDPOINTS.BULK_DEACTIVATE;
        break;
      case 'refresh':
        endpoint = API_ENDPOINTS.BULK_REFRESH;
        break;
      case 'delete':
        endpoint = API_ENDPOINTS.BULK_DELETE;
        break;
      case 'extend':
        endpoint = '/api/service_operations/subscriptions/bulk-extend/';
        payload = {
          subscription_ids: Array.from(selected),
          days: actionPayload.days || 30
        };
        break;
      case 'change_plan':
        endpoint = '/api/service_operations/subscriptions/bulk-change-plan/';
        payload = {
          subscription_ids: Array.from(selected),
          plan_id: actionPayload.plan_id
        };
        break;
      default:
        return;
    }
    
    await executeBulkAction(endpoint, action, payload);
    setConfirmDialog({ open: false, action: null });
    setActionPayload({});
  }, [confirmDialog, actionPayload, executeBulkAction, selected]);
  
  // Get status badge with proper status mapping
  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: Check },
      pending_activation: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: Clock },
      draft: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400', icon: Clock },
      processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', icon: RefreshCw },
      expired: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400', icon: X },
      suspended: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400', icon: Pause },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: X },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: AlertTriangle },
    };
    
    const { bg, text, icon: Icon } = statusMap[status] || statusMap.draft;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${bg} ${text}`}>
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
  
  // Preview selected items
  const selectedPreview = useMemo(() => {
    return Array.from(selected).map(id => 
      enrichedSubscriptions.find(s => s.id === id)
    ).filter(Boolean);
  }, [selected, enrichedSubscriptions]);
  
  // Options for EnhancedSelect
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'inactive', label: 'Inactive (Expired/Suspended)' },
    { value: 'failed', label: 'Failed' }
  ];
  
  const accessOptions = [
    { value: 'all', label: 'All Access' },
    { value: 'hotspot', label: 'Hotspot' },
    { value: 'pppoe', label: 'PPPoE' }
  ];
  
  const planOptions = [
    { value: 'all', label: 'All Plans' },
    ...uniquePlans.map(plan => ({
      value: plan.id,
      label: plan.name
    }))
  ];
  
  const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS.map(size => ({
    value: size,
    label: `${size} / page`
  }));
  
  if (!subscriptions.length) {
    return (
      <div className={`p-12 text-center rounded-xl ${themeClasses.bg.card} border ${themeClasses.border.light}`}>
        <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className={`text-lg ${themeClasses.text.primary}`}>Loading subscriptions...</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className={`space-y-6 ${themeClasses.bg.primary}`}>
        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: null })}
          onConfirm={executeConfirmedAction}
          title={`Confirm Bulk ${confirmDialog.action}`}
          message={`Are you sure you want to ${confirmDialog.action} ${selected.size} selected subscription(s)?`}
          confirmText={confirmDialog.action}
          cancelText="Cancel"
          theme={theme}
        />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Bulk Operations</h2>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
              Perform actions on multiple subscriptions at once
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              disabled={selected.size === 0}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear ({selected.size})</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Show'} Preview</span>
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('activate')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400'
                : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            <Play className="w-6 h-6" />
            <span>Activate</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('deactivate')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400'
                : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
          >
            <Pause className="w-6 h-6" />
            <span>Deactivate</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('refresh')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <RefreshCw className="w-6 h-6" />
            <span>Refresh</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBulkAction('delete')}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400'
                : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <Trash2 className="w-6 h-6" />
            <span>Delete</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const days = prompt('Enter number of days to extend:', '30');
              if (days && !isNaN(days) && parseInt(days) > 0) {
                setActionPayload({ days: parseInt(days) });
                handleBulkAction('extend');
              }
            }}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400'
                : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            <Calendar className="w-6 h-6" />
            <span>Extend</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const planId = prompt('Enter plan ID to change to:');
              if (planId) {
                setActionPayload({ plan_id: planId });
                handleBulkAction('change_plan');
              }
            }}
            disabled={bulkLoading || selected.size === 0}
            className={`p-4 rounded-lg flex flex-col items-center gap-2 font-medium
              ${bulkLoading || selected.size === 0
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-600 dark:text-gray-400'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <Copy className="w-6 h-6" />
            <span>Change Plan</span>
            {selected.size > 0 && <span className="text-xs">({selected.size})</span>}
          </motion.button>
        </div>
        
        {/* Selected Preview */}
        <AnimatePresence>
          {showPreview && selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.light} overflow-hidden`}
            >
              <h3 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
                <Eye className="w-4 h-4" />
                Selected Items ({selected.size})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedPreview.map(sub => (
                  <div key={sub.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <div className={`font-medium ${themeClasses.text.primary}`}>{sub.client_name || 'N/A'}</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>{sub.plan_name}</div>
                    </div>
                    {getAccessIcon(sub.access_method)}
                    {getStatusBadge(sub.status)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, plan, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-3 rounded-lg border ${themeClasses.input} w-full`}
            />
          </div>
          
          {/* Status Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              placeholder="Filter by status"
              theme={theme}
            />
          </div>
          
          {/* Access Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterAccess}
              onChange={setFilterAccess}
              options={accessOptions}
              placeholder="Filter by access"
              theme={theme}
            />
          </div>
          
          {/* Plan Filter - EnhancedSelect */}
          <div className="min-w-40">
            <EnhancedSelect
              value={filterPlan}
              onChange={setFilterPlan}
              options={planOptions}
              placeholder="Filter by plan"
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
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
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
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('client_name')}>
                    <div className="flex items-center gap-2">
                      Client
                      {sortField === 'client_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('plan_name')}>
                    <div className="flex items-center gap-2">
                      Plan
                      {sortField === 'plan_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left">Access</th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-2">
                      Created
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`p-8 text-center ${themeClasses.text.secondary}`}>
                      <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No subscriptions match your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSubscriptions.map(sub => (
                    <tr key={sub.id} className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${themeClasses.border.light}`}>
                      <td className="p-4">
                        <button onClick={() => toggleSelect(sub.id)}>
                          {selected.has(sub.id) ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500" />
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
                      <td className={`p-4 text-sm ${themeClasses.text.secondary}`}>
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${themeClasses.border.light}`}>
            <div className={`text-sm ${themeClasses.text.tertiary}`}>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
              >
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
        
        {/* Bulk Results */}
        <AnimatePresence>
          {bulkResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-xl ${
                bulkResults.success
                  ? bulkResults.failed === 0
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200'
                    : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-200'
              } border`}
            >
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${themeClasses.text.primary}`}>
                {bulkResults.success ? (
                  bulkResults.failed === 0 ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                Bulk Operation Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{bulkResults.total}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{bulkResults.successful}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{bulkResults.failed}</div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>Failed</div>
                </div>
              </div>
              
              {bulkResults.errors?.length > 0 && (
                <div className="mt-4">
                  <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Error Details:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {bulkResults.errors.map((err, i) => (
                      <div key={i} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-2 rounded">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default BulkOperations;