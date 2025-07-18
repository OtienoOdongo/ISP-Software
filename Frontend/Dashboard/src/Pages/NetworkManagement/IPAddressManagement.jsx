import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, ChevronDown, ChevronUp,
  Server, HardDrive, Network, Wifi, CheckCircle, XCircle, Clock,
  AlertCircle, ArrowRight, Download, Upload, Activity, Router
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api'

const validateIp = (ip) => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ip ? ipRegex.test(ip) : false;
};

const validateSubnet = (subnet) => {
  const subnetRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-2]?[0-9]|3[0-2])$/;
  return subnet ? subnetRegex.test(subnet) : false;
};

const IPAddressManagement = ({ routerId: propRouterId }) => {
  const [ipAddresses, setIPAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'ip_address', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editIP, setEditIP] = useState(null);
  const [expandedIP, setExpandedIP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routers, setRouters] = useState([]);
  const [selectedRouterId, setSelectedRouterId] = useState(propRouterId || '');

  const [newIP, setNewIP] = useState({
    ip_address: '',
    status: 'available',
    assigned_to: '',
    description: '',
    subnet: '',
    bandwidth_limit: '',
    priority: 'medium',
    router: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchRouters = useCallback(async () => {
    try {
      const response = await api.get('/api/network_management/routers/');
      const routerList = Array.isArray(response.data) ? response.data : [];
      setRouters(routerList);

      if (propRouterId && !routerList.find(r => r.id === parseInt(propRouterId))) {
        toast.error(`Router ID ${propRouterId} is invalid. Please select a valid router.`);
        setSelectedRouterId('');
      } else if (!propRouterId && routerList.length > 0) {
        setSelectedRouterId(routerList[0].id.toString());
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch routers';
      toast.error(errorMessage);
    }
  }, [propRouterId]);

  const fetchIPAddresses = useCallback(async () => {
    if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
      setIPAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/network_management/ip-addresses/?router=${selectedRouterId}&page=${currentPage}&per_page=${itemsPerPage}`);
      setIPAddresses(Array.isArray(response.data.data) ? response.data.data : []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch IP addresses';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedRouterId, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  useEffect(() => {
    if (selectedRouterId) {
      fetchIPAddresses();
    }
  }, [fetchIPAddresses, selectedRouterId]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedIPAddresses = useMemo(() => {
    return [...ipAddresses].sort((a, b) => {
      const getValue = (obj, key) => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          return obj[parent]?.[child] || '';
        }
        return obj[key] || '';
      };
      
      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);
      
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [ipAddresses, sortConfig]);

  const filteredIPAddresses = useMemo(() => {
    return sortedIPAddresses.filter(
      (ip) =>
        (ip.ip_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ip.assigned_to?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ip.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ip.subnet || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedIPAddresses, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIPAddresses.slice(indexOfFirstItem, indexOfLastItem);

  const validateForm = () => {
    const errors = {};
    if (!validateIp(newIP.ip_address)) {
      errors.ip_address = 'Please enter a valid IP address (e.g., 192.168.1.1)';
    }
    if (!validateSubnet(newIP.subnet)) {
      errors.subnet = 'Please enter a valid subnet (e.g., 192.168.1.0/24)';
    }
    if (!newIP.status) {
      errors.status = 'Please select a status';
    }
    if (!newIP.priority) {
      errors.priority = 'Please select a priority';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOrEdit = async () => {
    if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
      toast.error('Please select a valid router');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix form errors');
      return;
    }

    try {
      const payload = {
        ...newIP,
        router: parseInt(selectedRouterId),
        assigned_to: newIP.assigned_to || null,
      };
      
      if (editIP) {
        await api.put(`/api/network_management/ip-addresses/${editIP.id}/`, payload);
        toast.success('IP address updated successfully');
      } else {
        await api.post('/api/network_management/ip-addresses/', payload);
        toast.success('IP address added successfully');
      }
      fetchIPAddresses();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error saving IP address';
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIP((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this IP address?')) return;
    
    try {
      await api.delete(`/api/network_management/ip-addresses/${id}/`);
      toast.success('IP address deleted');
      fetchIPAddresses();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error deleting IP address';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setNewIP({
      ip_address: '',
      status: 'available',
      assigned_to: '',
      description: '',
      subnet: '',
      bandwidth_limit: '',
      priority: 'medium',
      router: selectedRouterId,
    });
    setEditIP(null);
    setShowModal(false);
    setFormErrors({});
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const timeSince = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
    return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
  };

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gray-50 p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <Network className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">IP Address Management</h1>
            <p className="text-sm text-gray-500">
              {ipAddresses.length} IPs • {ipAddresses.filter(ip => ip.status === 'assigned').length} assigned
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {routers.length === 0 ? (
            <div className="flex-1 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded w-full">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>
                  No routers configured. Please{' '}
                  <button
                    onClick={() => toast.info('Navigate to Router Management and click "Add Router" to configure a new router.')}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    add a router
                  </button>{' '}
                  in the Router Management section to start managing IP addresses.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Router className="w-5 h-5 text-gray-500" />
                </div>
                <select
                  value={selectedRouterId}
                  onChange={(e) => setSelectedRouterId(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  aria-label="Select router"
                >
                  <option value="">Select a router</option>
                  {routers.map(router => (
                    <option key={router.id} value={router.id}>
                      {router.name} ({router.ip})
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:opacity-50"
                disabled={!selectedRouterId || isNaN(parseInt(selectedRouterId))}
                aria-label="Add new IP address"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add IP Address
              </button>
            </>
          )}
        </div>
      </header>

      {selectedRouterId && !isNaN(parseInt(selectedRouterId)) ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search by IP, assigned device, or description..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Search IP addresses"
              />
            </div>
            <select 
              className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
              onChange={(e) => handleSort(e.target.value)}
              aria-label="Sort IP addresses"
            >
              <option value="ip_address">Sort by IP</option>
              <option value="status">Sort by Status</option>
              <option value="assigned_to.full_name">Sort by Assigned To</option>
              <option value="subnet">Sort by Subnet</option>
              <option value="created_at">Sort by Creation Date</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredIPAddresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>No IP addresses found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('ip_address')}>
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('assigned_to.full_name')}>
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bandwidth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('subnet')}>
                        Subnet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((ip) => (
                      <React.Fragment key={ip.id}>
                        <tr 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setExpandedIP(expandedIP === ip.id ? null : ip.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setExpandedIP(expandedIP === ip.id ? null : ip.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Server className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{ip.ip_address}</div>
                                <div className="text-xs text-gray-500">{ip.description || 'No description'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ip.status)}`}>
                              {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ip.assigned_to?.full_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ip.bandwidth_limit || 'Unlimited'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ip.subnet}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {timeSince(ip.last_used)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditIP(ip);
                                  setNewIP({
                                    ...ip,
                                    assigned_to: ip.assigned_to?.full_name || '',
                                    router: selectedRouterId,
                                  });
                                  setShowModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-500"
                                title="Edit IP Address"
                                aria-label="Edit IP address"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(ip.id);
                                }}
                                className="text-red-600 hover:text-red-500"
                                title="Delete IP Address"
                                aria-label="Delete IP address"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <button 
                                className="text-gray-500 hover:text-gray-400"
                                aria-label={expandedIP === ip.id ? 'Collapse IP details' : 'Expand IP details'}
                              >
                                {expandedIP === ip.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedIP === ip.id && (
                          <tr className="bg-gray-50">
                            <td colSpan="7" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <HardDrive className="w-5 h-5 mr-2 text-indigo-600" />
                                    IP Address Details
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-500">Status</p>
                                      <p className={`text-gray-900 ${getStatusColor(ip.status)}`}>
                                        {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Assigned To</p>
                                      <p className="text-gray-900">{ip.assigned_to?.full_name || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Bandwidth Limit</p>
                                      <p className="text-gray-900">{ip.bandwidth_limit || 'Unlimited'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Priority</p>
                                      <p className={`text-gray-900 ${getPriorityColor(ip.priority)}`}>
                                        {ip.priority.charAt(0).toUpperCase() + ip.priority.slice(1)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Created</p>
                                      <p className="text-gray-900">{timeSince(ip.created_at)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Last Used</p>
                                      <p className="text-gray-900">{timeSince(ip.last_used)}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                                    Network Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-500">IP Address</p>
                                      <p className="text-gray-900">{ip.ip_address}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Subnet</p>
                                      <p className="text-gray-900">{ip.subnet}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Description</p>
                                      <p className="text-gray-900">{ip.description || 'No description'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <button 
                                        className="flex items-center text-indigo-600 hover:text-indigo-500"
                                        aria-label="View usage statistics"
                                      >
                                        <span>View Usage Statistics</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredIPAddresses.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 rounded-b-lg">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredIPAddresses.length)} of {filteredIPAddresses.length} IPs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-100 rounded-md disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200">
            <Router className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No router selected</h3>
          <p className="mt-1 text-gray-500">
            {routers.length > 0 
              ? "Please select a router from the dropdown above" 
              : "No routers available. Navigate to Router Management and click 'Add Router' to configure a new router."}
          </p>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
            >
              <div className="flex justify-between items-center border-b border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editIP ? 'Edit IP Address' : 'Add New IP Address'}
                </h3>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ip_address">IP Address</label>
                    <input
                      id="ip_address"
                      type="text"
                      name="ip_address"
                      value={newIP.ip_address}
                      onChange={handleInputChange}
                      placeholder="192.168.1.1"
                      className={`w-full p-2 bg-white border ${formErrors.ip_address ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      aria-invalid={!!formErrors.ip_address}
                      aria-describedby={formErrors.ip_address ? 'ip_address-error' : undefined}
                    />
                    {formErrors.ip_address && (
                      <p id="ip_address-error" className="text-red-500 text-xs mt-1">{formErrors.ip_address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={newIP.status}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-white border ${formErrors.status ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      aria-invalid={!!formErrors.status}
                      aria-describedby={formErrors.status ? 'status-error' : undefined}
                    >
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="reserved">Reserved</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    {formErrors.status && (
                      <p id="status-error" className="text-red-500 text-xs mt-1">{formErrors.status}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="assigned_to">Assigned To</label>
                    <input
                      id="assigned_to"
                      type="text"
                      name="assigned_to"
                      value={newIP.assigned_to}
                      onChange={handleInputChange}
                      placeholder="Device or service name"
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={newIP.priority}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-white border ${formErrors.priority ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      aria-invalid={!!formErrors.priority}
                      aria-describedby={formErrors.priority ? 'priority-error' : undefined}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    {formErrors.priority && (
                      <p id="priority-error" className="text-red-500 text-xs mt-1">{formErrors.priority}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
                    <input
                      id="description"
                      type="text"
                      name="description"
                      value={newIP.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of this IP assignment"
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="subnet">Subnet</label>
                    <input
                      id="subnet"
                      type="text"
                      name="subnet"
                      value={newIP.subnet}
                      onChange={handleInputChange}
                      placeholder="192.168.1.0/24"
                      className={`w-full p-2 bg-white border ${formErrors.subnet ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      aria-invalid={!!formErrors.subnet}
                      aria-describedby={formErrors.subnet ? 'subnet-error' : undefined}
                    />
                    {formErrors.subnet && (
                      <p id="subnet-error" className="text-red-500 text-xs mt-1">{formErrors.subnet}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bandwidth_limit">Bandwidth Limit (optional)</label>
                    <input
                      id="bandwidth_limit"
                      type="text"
                      name="bandwidth_limit"
                      value={newIP.bandwidth_limit}
                      onChange={handleInputChange}
                      placeholder="e.g. 100Mbps or 1Gbps"
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 border-t border-gray-200 p-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-md"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrEdit}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md"
                  aria-label={editIP ? 'Update IP address' : 'Add IP address'}
                >
                  {editIP ? 'Update IP Address' : 'Add IP Address'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IPAddressManagement;