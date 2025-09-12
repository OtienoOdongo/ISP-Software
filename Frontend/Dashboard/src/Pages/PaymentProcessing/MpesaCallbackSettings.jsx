// import React, { useState, useCallback, useMemo } from 'react';
// import {
//   IoAddCircleOutline as AddIcon,
//   IoSaveOutline as SaveIcon,
//   IoPencilOutline as EditIcon,
//   IoTrashOutline as DeleteIcon,
//   IoSearchOutline as SearchIcon
// } from 'react-icons/io5';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const useLocalStorage = (key, initialValue) => {
//   const [storedValue, setStoredValue] = useState(() => {
//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? JSON.parse(item) : initialValue;
//     } catch (error) {
//       console.error(`Error retrieving ${key} from localStorage:`, error);
//       return initialValue;
//     }
//   });

//   const setValue = useCallback((value) => {
//     try {
//       const valueToStore = value instanceof Function ? value(storedValue) : value;
//       setStoredValue(valueToStore);
//       window.localStorage.setItem(key, JSON.stringify(valueToStore));
//     } catch (error) {
//       console.error(`Error setting ${key} in localStorage:`, error);
//     }
//   }, [key, storedValue]);

//   return [storedValue, setValue];
// };

// const MpesaCallbackSettings = () => {
//   const [callbacks, setCallbacks] = useLocalStorage('mpesa-callbacks', []);
//   const [newCallback, setNewCallback] = useState({ event: '', url: '' });
//   const [editingId, setEditingId] = useState(null);
//   const [eventOptions] = useState([
//     'Payment Success', 'Payment Failure', 'Transaction Cancellation'
//   ]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeFilter, setActiveFilter] = useState('all');

//   const handleChange = useCallback((e, field) => {
//     setNewCallback(prev => ({ ...prev, [field]: e.target.value }));
//   }, []);

//   const addOrUpdateCallback = useCallback(() => {
//     if (newCallback.event && newCallback.url) {
//       if (editingId) {
//         updateCallback();
//       } else {
//         addCallback();
//       }
//     } else {
//       toast.error('Please fill in both event and URL fields.', {
//         autoClose: 3000,
//         position: toast.POSITION.TOP_RIGHT
//       });
//     }
//   }, [newCallback, editingId]);

//   const addCallback = useCallback(() => {
//     setCallbacks(prevCallbacks => [...prevCallbacks, { ...newCallback, id: Date.now() }]);
//     setNewCallback({ event: '', url: '' });
//     toast.success('New callback added successfully.', {
//       autoClose: 3000,
//       position: toast.POSITION.TOP_RIGHT
//     });
//   }, [newCallback]);

//   const updateCallback = useCallback(() => {
//     setCallbacks(prevCallbacks =>
//       prevCallbacks.map(cb => cb.id === editingId ? { ...newCallback, id: cb.id } : cb)
//     );
//     setNewCallback({ event: '', url: '' });
//     setEditingId(null);
//     toast.success('Callback updated successfully.', {
//       autoClose: 3000,
//       position: toast.POSITION.TOP_RIGHT
//     });
//   }, [newCallback, editingId]);

//   const editCallback = useCallback((id) => {
//     const callbackToEdit = callbacks.find(cb => cb.id === id);
//     if (callbackToEdit) {
//       setNewCallback(callbackToEdit);
//       setEditingId(id);
//     }
//   }, [callbacks]);

//   const deleteCallback = useCallback((id) => {
//     setCallbacks(prevCallbacks => prevCallbacks.filter(cb => cb.id !== id));
//     toast.info('Callback deleted successfully.', {
//       autoClose: 3000,
//       position: toast.POSITION.TOP_RIGHT
//     });
//   }, []);

//   const filteredCallbacks = useMemo(() => {
//     return callbacks.filter(callback =>
//       callback.event.toLowerCase().includes(searchTerm.toLowerCase()) &&
//       (activeFilter === 'all' || callback.event === activeFilter)
//     );
//   }, [callbacks, searchTerm, activeFilter]);

//   return (
//     <div className="bg-gray-100 min-h-screen p-8">
//       <h1 className="text-4xl font-extrabold mb-8 text-indigo-900">M-Pesa Callback Settings</h1>

//       {/* Search and Filter */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center w-full md:w-2/3">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//             placeholder="Search by event..."
//           />
//           <button
//             className="ml-3 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none"
//             onClick={() => { /* search logic if needed */ }}
//           >
//             <SearchIcon />
//           </button>
//         </div>
//         <select
//           value={activeFilter}
//           onChange={(e) => setActiveFilter(e.target.value)}
//           className="ml-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//         >
//           <option value="all">All Events</option>
//           {eventOptions.map((event, index) => (
//             <option key={index} value={event}>{event}</option>
//           ))}
//         </select>
//       </div>

//       {/* Callback Form */}
//       <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Callbacks</h2>
//         <div className="mb-4">
//           <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">Event</label>
//           <select
//             id="event"
//             value={newCallback.event}
//             onChange={(e) => handleChange(e, 'event')}
//             className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="">Select an event</option>
//             {eventOptions.map((event, index) => (
//               <option key={index} value={event}>{event}</option>
//             ))}
//           </select>
//         </div>
//         <div className="mb-4">
//           <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">Callback URL</label>
//           <input
//             id="url"
//             type="url"
//             value={newCallback.url}
//             onChange={(e) => handleChange(e, 'url')}
//             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
//             placeholder="Enter callback URL"
//           />
//         </div>
//         <div className="flex justify-end">
//           <button
//             onClick={addOrUpdateCallback}
//             className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none"
//           >
//             {editingId !== null ? <SaveIcon className="mr-2" /> : <AddIcon className="mr-2" />}
//             {editingId !== null ? 'Update Callback' : 'Add Callback'}
//           </button>
//         </div>
//       </div>

//       {/* Callbacks Table */}
//       <div className="bg-white shadow-lg rounded-lg p-8">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Callbacks</h2>
//         {filteredCallbacks.length === 0 ? (
//           <p className="text-center text-gray-500">No callbacks match your criteria.</p>
//         ) : (
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="border-b-2 border-gray-200">
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600">Event</th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600">URL</th>
//                 <th className="py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCallbacks.map(callback => (
//                 <tr key={callback.id} className="border-b">
//                   <td className="py-3 px-4">{callback.event}</td>
//                   <td className="py-3 px-4">
//                     <a href={callback.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
//                       {callback.url}
//                     </a>
//                   </td>
//                   <td className="py-3 px-4 flex space-x-2">
//                     <button
//                       onClick={() => editCallback(callback.id)}
//                       className="text-indigo-600 hover:text-indigo-800"
//                     >
//                       <EditIcon />
//                     </button>
//                     <button
//                       onClick={() => deleteCallback(callback.id)}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       <DeleteIcon />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default MpesaCallbackSettings;








import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  IoAddCircleOutline as AddIcon,
  IoSaveOutline as SaveIcon,
  IoPencilOutline as EditIcon,
  IoTrashOutline as DeleteIcon,
  IoSearchOutline as SearchIcon,
  IoServer as RouterIcon,
  IoShieldCheckmark as SecurityIcon,
  IoStatsChart as AnalyticsIcon,
  IoReload as RefreshIcon,
  IoWarning as WarningIcon
} from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Puff } from 'react-loading-icons';
import api from '../../api';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const MpesaCallbackSettings = () => {
  const [callbacks, setCallbacks] = useState([]);
  const [routers, setRouters] = useState([]);
  const [events, setEvents] = useState([]);
  const [securityProfiles, setSecurityProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [newCallback, setNewCallback] = useState({ 
    router: '', 
    event: '', 
    callback_url: '', 
    security_level: 'medium',
    security_profile: '',
    is_active: true,
    retry_enabled: true,
    max_retries: 3,
    timeout_seconds: 30
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRouter, setSelectedRouter] = useState('all');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testConfig, setTestConfig] = useState({ configuration_id: '', test_payload: '{}' });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        callbacksResponse, 
        routersResponse, 
        eventsResponse, 
        profilesResponse,
        statsResponse
      ] = await Promise.all([
        api.get('/api/payments/mpesa-callbacks/configurations/'),
        api.get('/api/network_management/routers/'),
        api.get('/api/payments/mpesa-callbacks/events/'),
        api.get('/api/payments/mpesa-callbacks/security-profiles/'),
        api.get('/api/payments/mpesa-callbacks/analytics/')
      ]);

      setCallbacks(callbacksResponse.data);
      setRouters(routersResponse.data);
      setEvents(eventsResponse.data);
      setSecurityProfiles(profilesResponse.data);
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load callback configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e, field) => {
    setNewCallback(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleCheckboxChange = useCallback((field, value) => {
    setNewCallback(prev => ({ ...prev, [field]: value }));
  }, []);

  const addOrUpdateCallback = useCallback(async () => {
    if (!newCallback.router || !newCallback.event || !newCallback.callback_url) {
      toast.error('Please fill in all required fields (Router, Event, URL).');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing callback
        const response = await api.put(
          `/api/payments/mpesa-callbacks/configurations/${editingId}/`,
          newCallback
        );
        setCallbacks(prev => prev.map(cb => cb.id === editingId ? response.data : cb));
        toast.success('Callback updated successfully!');
      } else {
        // Create new callback
        const response = await api.post(
          '/api/payments/mpesa-callbacks/configurations/',
          newCallback
        );
        setCallbacks(prev => [...prev, response.data]);
        toast.success('Callback added successfully!');
      }

      setNewCallback({ 
        router: '', 
        event: '', 
        callback_url: '', 
        security_level: 'medium',
        security_profile: '',
        is_active: true,
        retry_enabled: true,
        max_retries: 3,
        timeout_seconds: 30
      });
      setEditingId(null);
      
      // Reload stats
      const statsResponse = await api.get('/api/payments/mpesa-callbacks/analytics/');
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error saving callback:', error);
      toast.error('Failed to save callback configuration');
    } finally {
      setLoading(false);
    }
  }, [newCallback, editingId]);

  const editCallback = useCallback((callback) => {
    setNewCallback({
      router: callback.router,
      event: callback.event,
      callback_url: callback.callback_url,
      security_level: callback.security_level,
      security_profile: callback.security_profile || '',
      is_active: callback.is_active,
      retry_enabled: callback.retry_enabled,
      max_retries: callback.max_retries,
      timeout_seconds: callback.timeout_seconds
    });
    setEditingId(callback.id);
  }, []);

  const deleteCallback = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this callback configuration?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/payments/mpesa-callbacks/configurations/${id}/`);
      setCallbacks(prev => prev.filter(cb => cb.id !== id));
      toast.info('Callback deleted successfully!');
      
      // Reload stats
      const statsResponse = await api.get('/api/payments/mpesa-callbacks/analytics/');
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error deleting callback:', error);
      toast.error('Failed to delete callback configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCallbackStatus = useCallback(async (callback) => {
    try {
      const updatedCallback = { ...callback, is_active: !callback.is_active };
      const response = await api.put(
        `/api/payments/mpesa-callbacks/configurations/${callback.id}/`,
        updatedCallback
      );
      
      setCallbacks(prev => prev.map(cb => cb.id === callback.id ? response.data : cb));
      toast.success(`Callback ${updatedCallback.is_active ? 'enabled' : 'disabled'} successfully!');
      
    } catch (error) {
      console.error('Error toggling callback status:', error);
      toast.error('Failed to update callback status');
    }
  }, []);

  const testCallback = useCallback(async (callback) => {
    setTestConfig({
      configuration_id: callback.id,
      test_payload: JSON.stringify({
        TransactionType: 'Pay Bill',
        TransID: 'TEST123456789',
        TransTime: new Date().toISOString(),
        TransAmount: '100.00',
        BusinessShortCode: '123456',
        BillRefNumber: 'TEST001',
        InvoiceNumber: '',
        OrgAccountBalance: '5000.00',
        ThirdPartyTransID: '',
        MSISDN: '254712345678',
        FirstName: 'Test',
        MiddleName: 'User',
        LastName: 'Callback'
      }, null, 2)
    });
    setShowTestModal(true);
  }, []);

  const runTest = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        configuration_id: testConfig.configuration_id,
        test_payload: JSON.parse(testConfig.test_payload),
        validate_security: true
      };

      const response = await api.post('/api/payments/mpesa-callbacks/test/', payload);
      
      if (response.data.success) {
        toast.success('Test completed successfully!');
      } else {
        toast.error(`Test failed: ${response.data.message}`);
      }
      
      setShowTestModal(false);
      
    } catch (error) {
      console.error('Error testing callback:', error);
      toast.error('Failed to run test');
    } finally {
      setLoading(false);
    }
  }, [testConfig]);

  const filteredCallbacks = useMemo(() => {
    return callbacks.filter(callback => {
      const matchesSearch = callback.callback_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           callback.event_details?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           callback.router_details?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || 
                           (activeFilter === 'active' && callback.is_active) ||
                           (activeFilter === 'inactive' && !callback.is_active);
      
      const matchesRouter = selectedRouter === 'all' || callback.router === selectedRouter;
      
      return matchesSearch && matchesFilter && matchesRouter;
    });
  }, [callbacks, searchTerm, activeFilter, selectedRouter]);

  const getRouterName = (routerId) => {
    const router = routers.find(r => r.id === routerId);
    return router ? router.name : 'Unknown Router';
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.name === eventId);
    return event ? event.name : 'Unknown Event';
  };

  const getSecurityLevelBadge = (level) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[level] || colors.medium}`}>
        {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Puff stroke="#3B82F6" />
          <p className="mt-4 text-gray-600">Loading callback configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">M-Pesa Callback Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage callback configurations for different routers and events
              </p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <RefreshIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AnalyticsIcon className="w-6 h-6 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-blue-600">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {stats.success_rate}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <RouterIcon className="w-6 h-6 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-600">Total Callbacks</p>
                    <p className="text-2xl font-bold text-green-800">
                      {stats.total_callbacks}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <SecurityIcon className="w-6 h-6 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-purple-600">Active Configs</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {callbacks.filter(cb => cb.is_active).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <WarningIcon className="w-6 h-6 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-orange-600">Routers</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {new Set(callbacks.map(cb => cb.router)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Search callbacks..."
                />
                <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Router</label>
              <select
                value={selectedRouter}
                onChange={(e) => setSelectedRouter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Routers</option>
                {routers.map(router => (
                  <option key={router.id} value={router.id}>
                    {router.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Callback Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Callback Configuration' : 'Add New Callback'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Router <span className="text-red-500">*</span>
              </label>
              <select
                value={newCallback.router}
                onChange={(e) => handleChange(e, 'router')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Router</option>
                {routers.map(router => (
                  <option key={router.id} value={router.id}>
                    {router.name} ({router.ip})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                value={newCallback.event}
                onChange={(e) => handleChange(e, 'event')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Event</option>
                {events.map(event => (
                  <option key={event.name} value={event.name}>
                    {event.name} - {event.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Callback URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={newCallback.callback_url}
                onChange={(e) => handleChange(e, 'callback_url')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/api/callback"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Level
              </label>
              <select
                value={newCallback.security_level}
                onChange={(e) => handleChange(e, 'security_level')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Profile
              </label>
              <select
                value={newCallback.security_profile}
                onChange={(e) => handleChange(e, 'security_profile')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default Profile</option>
                {securityProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout (seconds)
              </label>
              <input
                type="number"
                value={newCallback.timeout_seconds}
                onChange={(e) => handleChange(e, 'timeout_seconds')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={newCallback.max_retries}
                onChange={(e) => handleChange(e, 'max_retries')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="10"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCallback.is_active}
                  onChange={(e) => handleCheckboxChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCallback.retry_enabled}
                  onChange={(e) => handleCheckboxChange('retry_enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enable Retries</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            {editingId && (
              <button
                onClick={() => {
                  setNewCallback({ 
                    router: '', 
                    event: '', 
                    callback_url: '', 
                    security_level: 'medium',
                    security_profile: '',
                    is_active: true,
                    retry_enabled: true,
                    max_retries: 3,
                    timeout_seconds: 30
                  });
                  setEditingId(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={addOrUpdateCallback}
              disabled={!newCallback.router || !newCallback.event || !newCallback.callback_url}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {editingId ? 'Update' : 'Add'} Callback
            </button>
          </div>
        </div>

        {/* Callbacks Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Callback Configurations ({filteredCallbacks.length})
            </h2>
          </div>

          {filteredCallbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <RouterIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>No callback configurations found</p>
              <p className="text-sm">Create your first callback configuration above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Router
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCallbacks.map(callback => (
                    <tr key={callback.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <RouterIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {callback.router_details?.name || getRouterName(callback.router)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900">
                          {callback.event_details?.name || getEventName(callback.event)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={callback.callback_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 break-all"
                        >
                          {callback.callback_url}
                        </a>
                      </td>
                      <td className="px-4 py-4">
                        {getSecurityLevelBadge(callback.security_level)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleCallbackStatus(callback)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            callback.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {callback.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => testCallback(callback)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Test Callback"
                          >
                            <SearchIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => editCallback(callback)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                            title="Edit"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCallback(callback.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">Test Callback Configuration</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Payload
              </label>
              <textarea
                value={testConfig.test_payload}
                onChange={(e) => setTestConfig(prev => ({ ...prev, test_payload: e.target.value }))}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Enter test payload in JSON format"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={runTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <SearchIcon className="w-4 h-4 mr-2" />
                Run Test
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default MpesaCallbackSettings;