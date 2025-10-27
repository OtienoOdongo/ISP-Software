


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Plus, Edit, Trash2, Search, ChevronDown, ChevronUp,
//   Server, HardDrive, Network, Wifi, CheckCircle, XCircle, Clock,
//   AlertCircle, ArrowRight, Download, Upload, Activity, Router
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../api';
// import { useTheme } from '../../context/ThemeContext';

// const validateIp = (ip) => {
//   const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//   return ip ? ipRegex.test(ip) : false;
// };

// const validateSubnet = (subnet) => {
//   const subnetRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-2]?[0-9]|3[0-2])$/;
//   return subnet ? subnetRegex.test(subnet) : false;
// };

// const IPAddressManagement = ({ routerId: propRouterId }) => {
//   const [ipAddresses, setIPAddresses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: 'ip_address', direction: 'ascending' });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [editIP, setEditIP] = useState(null);
//   const [expandedIP, setExpandedIP] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [routers, setRouters] = useState([]);
//   const [selectedRouterId, setSelectedRouterId] = useState(propRouterId || '');
//   const [mobileDropdowns, setMobileDropdowns] = useState({});

//   const { theme } = useTheme();

//   const [newIP, setNewIP] = useState({
//     ip_address: '',
//     status: 'available',
//     assigned_to: '',
//     description: '',
//     subnet: '',
//     bandwidth_limit: '',
//     priority: 'medium',
//     router: '',
//   });

//   const [formErrors, setFormErrors] = useState({});

//   const toggleMobileDropdown = (dropdown) => {
//     setMobileDropdowns(prev => ({
//       ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
//       [dropdown]: !prev[dropdown]
//     }));
//   };

//   const fetchRouters = useCallback(async () => {
//     try {
//       const response = await api.get('/api/network_management/routers/');
//       const routerList = Array.isArray(response.data) ? response.data : [];
//       setRouters(routerList);

//       if (propRouterId && !routerList.find(r => r.id === parseInt(propRouterId))) {
//         toast.error(`Router ID ${propRouterId} is invalid. Please select a valid router.`);
//         setSelectedRouterId('');
//       } else if (!propRouterId && routerList.length > 0) {
//         setSelectedRouterId(routerList[0].id.toString());
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to fetch routers';
//       toast.error(errorMessage);
//     }
//   }, [propRouterId]);

//   const fetchIPAddresses = useCallback(async () => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
//       setIPAddresses([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await api.get(`/api/network_management/ip-addresses/?router=${selectedRouterId}&page=${currentPage}&per_page=${itemsPerPage}`);
//       setIPAddresses(Array.isArray(response.data.data) ? response.data.data : []);
//       setTotalPages(response.data.total_pages || 1);
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to fetch IP addresses';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedRouterId, currentPage, itemsPerPage]);

//   useEffect(() => {
//     fetchRouters();
//   }, [fetchRouters]);

//   useEffect(() => {
//     if (selectedRouterId) {
//       fetchIPAddresses();
//     }
//   }, [fetchIPAddresses, selectedRouterId]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleSort = (key) => {
//     let direction = 'ascending';
//     if (sortConfig.key === key && sortConfig.direction === 'ascending') {
//       direction = 'descending';
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedIPAddresses = useMemo(() => {
//     return [...ipAddresses].sort((a, b) => {
//       const getValue = (obj, key) => {
//         if (key.includes('.')) {
//           const [parent, child] = key.split('.');
//           return obj[parent]?.[child] || '';
//         }
//         return obj[key] || '';
//       };
      
//       const aValue = getValue(a, sortConfig.key);
//       const bValue = getValue(b, sortConfig.key);
      
//       if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
//       return 0;
//     });
//   }, [ipAddresses, sortConfig]);

//   const filteredIPAddresses = useMemo(() => {
//     return sortedIPAddresses.filter(
//       (ip) =>
//         (ip.ip_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (ip.assigned_to?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (ip.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (ip.subnet || '').toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [sortedIPAddresses, searchTerm]);

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredIPAddresses.slice(indexOfFirstItem, indexOfLastItem);

//   const validateForm = () => {
//     const errors = {};
//     if (!validateIp(newIP.ip_address)) {
//       errors.ip_address = 'Please enter a valid IP address (e.g., 192.168.1.1)';
//     }
//     if (!validateSubnet(newIP.subnet)) {
//       errors.subnet = 'Please enter a valid subnet (e.g., 192.168.1.0/24)';
//     }
//     if (!newIP.status) {
//       errors.status = 'Please select a status';
//     }
//     if (!newIP.priority) {
//       errors.priority = 'Please select a priority';
//     }
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleAddOrEdit = async () => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
//       toast.error('Please select a valid router');
//       return;
//     }

//     if (!validateForm()) {
//       toast.error('Please fix form errors');
//       return;
//     }

//     try {
//       const payload = {
//         ...newIP,
//         router: parseInt(selectedRouterId),
//         assigned_to: newIP.assigned_to || null,
//       };
      
//       if (editIP) {
//         await api.put(`/api/network_management/ip-addresses/${editIP.id}/`, payload);
//         toast.success('IP address updated successfully');
//       } else {
//         await api.post('/api/network_management/ip-addresses/', payload);
//         toast.success('IP address added successfully');
//       }
//       fetchIPAddresses();
//       resetForm();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Error saving IP address';
//       toast.error(errorMessage);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewIP((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setFormErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this IP address?')) return;
    
//     try {
//       await api.delete(`/api/network_management/ip-addresses/${id}/`);
//       toast.success('IP address deleted');
//       fetchIPAddresses();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Error deleting IP address';
//       toast.error(errorMessage);
//     }
//   };

//   const resetForm = () => {
//     setNewIP({
//       ip_address: '',
//       status: 'available',
//       assigned_to: '',
//       description: '',
//       subnet: '',
//       bandwidth_limit: '',
//       priority: 'medium',
//       router: selectedRouterId,
//     });
//     setEditIP(null);
//     setShowModal(false);
//     setFormErrors({});
//   };

//   const getStatusColor = (status) => {
//     const colors = theme === 'dark' ? {
//       assigned: "bg-blue-900 text-blue-300",
//       available: "bg-green-900 text-green-300",
//       reserved: "bg-yellow-900 text-yellow-300",
//       blocked: "bg-red-900 text-red-300",
//     } : {
//       assigned: "bg-blue-100 text-blue-800",
//       available: "bg-green-100 text-green-800",
//       reserved: "bg-yellow-100 text-yellow-800",
//       blocked: "bg-red-100 text-red-800",
//     };
//     return colors[status] || (theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800");
//   };

//   const getPriorityColor = (priority) => {
//     const colors = theme === 'dark' ? {
//       high: "bg-red-900 text-red-300",
//       medium: "bg-yellow-900 text-yellow-300",
//       low: "bg-green-900 text-green-300",
//     } : {
//       high: "bg-red-100 text-red-800",
//       medium: "bg-yellow-100 text-yellow-800",
//       low: "bg-green-100 text-green-800",
//     };
//     return colors[priority] || (theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800");
//   };

//   const timeSince = (dateString) => {
//     if (!dateString) return 'Never';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return 'Invalid Date';
    
//     const seconds = Math.floor((new Date() - date) / 1000);
    
//     let interval = Math.floor(seconds / 31536000);
//     if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
//     interval = Math.floor(seconds / 2592000);
//     if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
//     interval = Math.floor(seconds / 86400);
//     if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
//     interval = Math.floor(seconds / 3600);
//     if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
//     interval = Math.floor(seconds / 60);
//     if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
//     return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
//   };

//   const MobileActionButton = ({ onClick, icon, label }) => (
//     <button
//       onClick={onClick}
//       className={`w-full p-3 rounded-lg flex items-center space-x-3 text-sm theme-transition ${
//         theme === 'dark' 
//           ? 'bg-dark-background-secondary text-dark-text-primary hover:bg-dark-border-light' 
//           : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
//       }`}
//     >
//       {icon}
//       <span>{label}</span>
//     </button>
//   );

//   return (
//     <div className={`min-h-screen p-6 theme-transition ${
//       theme === 'dark' ? 'bg-dark-background-primary text-dark-text-primary' : 'bg-white text-gray-900'
//     }`}>
//       <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      
//       <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 rounded-lg shadow ${
//         theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-gray-50'
//       }`}>
//         <div className="flex items-center space-x-4 mb-4 sm:mb-0">
//           <Network className="w-8 h-8 text-indigo-600" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-600">IP Address Management</h1>
//             <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
//               {ipAddresses.length} IPs • {ipAddresses.filter(ip => ip.status === 'assigned').length} assigned
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-3 w-full sm:w-auto">
//           {routers.length === 0 ? (
//             <div className={`flex-1 border-l-4 p-3 rounded w-full ${
//               theme === 'dark' ? 'bg-yellow-900 border-yellow-500 text-yellow-300' : 'bg-yellow-100 border-yellow-500 text-yellow-700'
//             }`}>
//               <div className="flex items-center">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <p>
//                   No routers configured. Please{' '}
//                   <button
//                     onClick={() => toast.info('Navigate to Router Management and click "Add Router" to configure a new router.')}
//                     className="text-blue-600 underline hover:text-blue-800"
//                   >
//                     add a router
//                   </button>{' '}
//                   in the Router Management section to start managing IP addresses.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Router className="w-5 h-5 text-gray-500" />
//                 </div>
//                 <select
//                   value={selectedRouterId}
//                   onChange={(e) => setSelectedRouterId(e.target.value)}
//                   className={`pl-10 pr-4 py-2 border rounded-md theme-transition ${
//                     theme === 'dark'
//                       ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary'
//                       : 'bg-white border-gray-300 text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                   aria-label="Select router"
//                 >
//                   <option value="">Select a router</option>
//                   {routers.map(router => (
//                     <option key={router.id} value={router.id}>
//                       {router.name} ({router.ip})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <button 
//                 onClick={() => setShowModal(true)}
//                 className={`flex items-center px-4 py-2 rounded-md disabled:opacity-50 theme-transition ${
//                   theme === 'dark' 
//                     ? 'bg-dark-primary-600 hover:bg-dark-primary-500 text-white' 
//                     : 'bg-indigo-600 hover:bg-indigo-500 text-white'
//                 }`}
//                 disabled={!selectedRouterId || isNaN(parseInt(selectedRouterId))}
//                 aria-label="Add new IP address"
//               >
//                 <Plus className="w-5 h-5 mr-2" />
//                 Add IP Address
//               </button>
//             </>
//           )}
//         </div>
//       </header>

//       {selectedRouterId && !isNaN(parseInt(selectedRouterId)) ? (
//         <>
//           <div className="flex flex-col md:flex-row gap-4 mb-6">
//             <div className="relative flex-1">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="h-5 w-5 text-gray-500" />
//               </div>
//               <input
//                 type="text"
//                 className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
//                   theme === 'dark'
//                     ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary placeholder-dark-text-tertiary'
//                     : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
//                 } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                 placeholder="Search by IP, assigned device, or description..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 aria-label="Search IP addresses"
//               />
//             </div>
//             <select 
//               className={`p-2 border rounded-md text-sm theme-transition ${
//                 theme === 'dark'
//                   ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary'
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//               onChange={(e) => handleSort(e.target.value)}
//               aria-label="Sort IP addresses"
//             >
//               <option value="ip_address">Sort by IP</option>
//               <option value="status">Sort by Status</option>
//               <option value="assigned_to.full_name">Sort by Assigned To</option>
//               <option value="subnet">Sort by Subnet</option>
//               <option value="created_at">Sort by Creation Date</option>
//             </select>
//           </div>

//           <div className={`rounded-lg shadow overflow-hidden ${
//             theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
//           }`}>
//             {loading ? (
//               <div className="flex justify-center py-12">
//                 <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
//                   theme === 'dark' ? 'border-dark-primary-600' : 'border-indigo-500'
//                 }`}></div>
//               </div>
//             ) : filteredIPAddresses.length === 0 ? (
//               <div className={`text-center py-8 flex flex-col items-center ${
//                 theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//               }`}>
//                 <AlertCircle className="w-8 h-8 mb-2" />
//                 <p>No IP addresses found matching your criteria</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className={`min-w-full divide-y ${
//                   theme === 'dark' ? 'divide-dark-border-light' : 'divide-gray-200'
//                 }`}>
//                   <thead className={theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'}>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('ip_address')}>
//                         IP Address
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
//                         Status
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('assigned_to.full_name')}>
//                         Assigned To
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Bandwidth
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer" onClick={() => handleSort('subnet')}>
//                         Subnet
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
//                         Last Used
//                       </th>
//                       <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className={`divide-y ${
//                     theme === 'dark' ? 'divide-dark-border-light' : 'divide-gray-200'
//                   }`}>
//                     {currentItems.map((ip) => (
//                       <React.Fragment key={ip.id}>
//                         <tr 
//                           className={`cursor-pointer theme-transition ${
//                             theme === 'dark' ? 'hover:bg-dark-background-tertiary' : 'hover:bg-gray-50'
//                           }`}
//                           onClick={() => setExpandedIP(expandedIP === ip.id ? null : ip.id)}
//                           role="button"
//                           tabIndex={0}
//                           onKeyDown={(e) => e.key === 'Enter' && setExpandedIP(expandedIP === ip.id ? null : ip.id)}
//                         >
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
//                                 theme === 'dark' ? 'bg-dark-primary-900' : 'bg-indigo-100'
//                               }`}>
//                                 <Server className={`w-5 h-5 ${
//                                   theme === 'dark' ? 'text-dark-primary-300' : 'text-indigo-600'
//                                 }`} />
//                               </div>
//                               <div className="ml-4">
//                                 <div className={`text-sm font-medium ${
//                                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//                                 }`}>{ip.ip_address}</div>
//                                 <div className={`text-xs ${
//                                   theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                                 }`}>{ip.description || 'No description'}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ip.status)}`}>
//                               {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
//                             </span>
//                           </td>
//                           <td className={`px-6 py-4 whitespace-nowrap text-sm ${
//                             theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//                           }`}>
//                             {ip.assigned_to?.full_name || '-'}
//                           </td>
//                           <td className={`px-6 py-4 whitespace-nowrap text-sm ${
//                             theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//                           }`}>
//                             {ip.bandwidth_limit || 'Unlimited'}
//                           </td>
//                           <td className={`px-6 py-4 whitespace-nowrap text-sm ${
//                             theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//                           }`}>
//                             {ip.subnet}
//                           </td>
//                           <td className={`px-6 py-4 whitespace-nowrap text-sm ${
//                             theme === 'dark' ? 'text-dark-text-tertiary' : 'text-gray-500'
//                           }`}>
//                             {timeSince(ip.last_used)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                             <div className="flex justify-end items-center space-x-2">
//                               {/* Mobile Actions Dropdown */}
//                               <div className="lg:hidden">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     toggleMobileDropdown(`ip-${ip.id}`);
//                                   }}
//                                   className={`p-2 rounded ${
//                                     theme === 'dark' 
//                                       ? 'text-dark-text-tertiary hover:bg-dark-background-tertiary' 
//                                       : 'text-gray-500 hover:bg-gray-100'
//                                   }`}
//                                 >
//                                   <ChevronDown className={`w-4 h-4 transition-transform ${
//                                     mobileDropdowns[`ip-${ip.id}`] ? 'rotate-180' : ''
//                                   }`} />
//                                 </button>
                                
//                                 {mobileDropdowns[`ip-${ip.id}`] && (
//                                   <div className={`absolute right-4 mt-1 p-2 rounded-lg shadow-lg z-10 ${
//                                     theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
//                                   }`}>
//                                     <MobileActionButton
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         setEditIP(ip);
//                                         setNewIP({
//                                           ...ip,
//                                           assigned_to: ip.assigned_to?.full_name || '',
//                                           router: selectedRouterId,
//                                         });
//                                         setShowModal(true);
//                                       }}
//                                       icon={<Edit className="w-4 h-4" />}
//                                       label="Edit"
//                                     />
//                                     <MobileActionButton
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         handleDelete(ip.id);
//                                       }}
//                                       icon={<Trash2 className="w-4 h-4" />}
//                                       label="Delete"
//                                     />
//                                   </div>
//                                 )}
//                               </div>

//                               {/* Desktop Actions */}
//                               <div className="hidden lg:flex space-x-2">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setEditIP(ip);
//                                     setNewIP({
//                                       ...ip,
//                                       assigned_to: ip.assigned_to?.full_name || '',
//                                       router: selectedRouterId,
//                                     });
//                                     setShowModal(true);
//                                   }}
//                                   className={`p-2 rounded ${
//                                     theme === 'dark' 
//                                       ? 'text-dark-primary-400 hover:text-dark-primary-300 hover:bg-dark-background-tertiary' 
//                                       : 'text-indigo-600 hover:text-indigo-500 hover:bg-gray-100'
//                                   }`}
//                                   title="Edit IP Address"
//                                   aria-label="Edit IP address"
//                                 >
//                                   <Edit className="w-5 h-5" />
//                                 </button>
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleDelete(ip.id);
//                                   }}
//                                   className={`p-2 rounded ${
//                                     theme === 'dark' 
//                                       ? 'text-red-400 hover:text-red-300 hover:bg-dark-background-tertiary' 
//                                       : 'text-red-600 hover:text-red-500 hover:bg-gray-100'
//                                   }`}
//                                   title="Delete IP Address"
//                                   aria-label="Delete IP address"
//                                 >
//                                   <Trash2 className="w-5 h-5" />
//                                 </button>
//                               </div>
                              
//                               <button 
//                                 className={`p-2 rounded ${
//                                   theme === 'dark' 
//                                     ? 'text-dark-text-tertiary hover:text-dark-text-secondary hover:bg-dark-background-tertiary' 
//                                     : 'text-gray-500 hover:text-gray-400 hover:bg-gray-100'
//                                 }`}
//                                 aria-label={expandedIP === ip.id ? 'Collapse IP details' : 'Expand IP details'}
//                               >
//                                 {expandedIP === ip.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                         {expandedIP === ip.id && (
//                           <tr className={theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'}>
//                             <td colSpan="7" className="px-6 py-4">
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                   <h4 className={`font-medium mb-3 flex items-center ${
//                                     theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                                   }`}>
//                                     <HardDrive className="w-5 h-5 mr-2 text-indigo-600" />
//                                     IP Address Details
//                                   </h4>
//                                   <div className="grid grid-cols-2 gap-4 text-sm">
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status</p>
//                                       <p className={`${getStatusColor(ip.status)}`}>
//                                         {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
//                                       </p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Assigned To</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{ip.assigned_to?.full_name || 'Not assigned'}</p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Bandwidth Limit</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{ip.bandwidth_limit || 'Unlimited'}</p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Priority</p>
//                                       <p className={`${getPriorityColor(ip.priority)}`}>
//                                         {ip.priority.charAt(0).toUpperCase() + ip.priority.slice(1)}
//                                       </p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Created</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{timeSince(ip.created_at)}</p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Last Used</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{timeSince(ip.last_used)}</p>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <div>
//                                   <h4 className={`font-medium mb-3 flex items-center ${
//                                     theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                                   }`}>
//                                     <Activity className="w-5 h-5 mr-2 text-indigo-600" />
//                                     Network Information
//                                   </h4>
//                                   <div className="grid grid-cols-2 gap-4 text-sm">
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>IP Address</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{ip.ip_address}</p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Subnet</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{ip.subnet}</p>
//                                     </div>
//                                     <div>
//                                       <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Description</p>
//                                       <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{ip.description || 'No description'}</p>
//                                     </div>
//                                     <div className="col-span-2">
//                                       <button 
//                                         className={`flex items-center ${
//                                           theme === 'dark' ? 'text-dark-primary-400 hover:text-dark-primary-300' : 'text-indigo-600 hover:text-indigo-500'
//                                         }`}
//                                         aria-label="View usage statistics"
//                                       >
//                                         <span>View Usage Statistics</span>
//                                         <ArrowRight className="w-4 h-4 ml-1" />
//                                       </button>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </React.Fragment>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>

//           {filteredIPAddresses.length > itemsPerPage && (
//             <div className={`flex justify-between items-center mt-4 px-4 py-3 rounded-b-lg ${
//               theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//             }`}>
//               <div className={`text-sm ${
//                 theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//               }`}>
//                 Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredIPAddresses.length)} of {filteredIPAddresses.length} IPs
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                   className={`px-3 py-1 rounded-md disabled:opacity-50 theme-transition ${
//                     theme === 'dark' 
//                       ? 'bg-dark-background-primary text-dark-text-primary hover:bg-dark-border-light' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                   aria-label="Previous page"
//                 >
//                   Previous
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-3 py-1 rounded-md theme-transition ${
//                       currentPage === page 
//                         ? theme === 'dark' 
//                           ? 'bg-dark-primary-600 text-white' 
//                           : 'bg-indigo-600 text-white'
//                         : theme === 'dark'
//                           ? 'bg-dark-background-primary text-dark-text-primary hover:bg-dark-border-light'
//                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                     aria-label={`Page ${page}`}
//                     aria-current={currentPage === page ? 'page' : undefined}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage === totalPages}
//                   className={`px-3 py-1 rounded-md disabled:opacity-50 theme-transition ${
//                     theme === 'dark' 
//                       ? 'bg-dark-background-primary text-dark-text-primary hover:bg-dark-border-light' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                   aria-label="Next page"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className={`p-8 rounded-lg text-center ${
//           theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//         }`}>
//           <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
//             theme === 'dark' ? 'bg-dark-background-primary' : 'bg-gray-200'
//           }`}>
//             <Router className={`h-6 w-6 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`} />
//           </div>
//           <h3 className={`mt-2 text-lg font-medium ${
//             theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//           }`}>No router selected</h3>
//           <p className={`mt-1 ${
//             theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//           }`}>
//             {routers.length > 0 
//               ? "Please select a router from the dropdown above" 
//               : "No routers available. Navigate to Router Management and click 'Add Router' to configure a new router."}
//           </p>
//         </div>
//       )}

//       <AnimatePresence>
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//             <motion.div 
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               className={`rounded-lg shadow-xl w-full max-w-2xl theme-transition ${
//                 theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
//               }`}
//             >
//               <div className={`flex justify-between items-center border-b p-4 ${
//                 theme === 'dark' ? 'border-dark-border-light' : 'border-gray-200'
//               }`}>
//                 <h3 className={`text-lg font-semibold ${
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//                 }`}>
//                   {editIP ? 'Edit IP Address' : 'Add New IP Address'}
//                 </h3>
//                 <button 
//                   onClick={resetForm}
//                   className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-700'}
//                   aria-label="Close modal"
//                 >
//                   <XCircle className="w-6 h-6" />
//                 </button>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="ip_address">IP Address</label>
//                     <input
//                       id="ip_address"
//                       type="text"
//                       name="ip_address"
//                       value={newIP.ip_address}
//                       onChange={handleInputChange}
//                       placeholder="192.168.1.1"
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         formErrors.ip_address 
//                           ? 'border-red-500' 
//                           : theme === 'dark'
//                             ? 'border-dark-border-medium'
//                             : 'border-gray-300'
//                       } ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary text-dark-text-primary placeholder-dark-text-tertiary'
//                           : 'bg-white text-gray-900 placeholder-gray-500'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                       aria-invalid={!!formErrors.ip_address}
//                       aria-describedby={formErrors.ip_address ? 'ip_address-error' : undefined}
//                     />
//                     {formErrors.ip_address && (
//                       <p id="ip_address-error" className="text-red-500 text-xs mt-1">{formErrors.ip_address}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="status">Status</label>
//                     <select
//                       id="status"
//                       name="status"
//                       value={newIP.status}
//                       onChange={handleInputChange}
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         formErrors.status 
//                           ? 'border-red-500' 
//                           : theme === 'dark'
//                             ? 'border-dark-border-medium'
//                             : 'border-gray-300'
//                       } ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary text-dark-text-primary'
//                           : 'bg-white text-gray-900'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                       aria-invalid={!!formErrors.status}
//                       aria-describedby={formErrors.status ? 'status-error' : undefined}
//                     >
//                       <option value="available">Available</option>
//                       <option value="assigned">Assigned</option>
//                       <option value="reserved">Reserved</option>
//                       <option value="blocked">Blocked</option>
//                     </select>
//                     {formErrors.status && (
//                       <p id="status-error" className="text-red-500 text-xs mt-1">{formErrors.status}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="assigned_to">Assigned To</label>
//                     <input
//                       id="assigned_to"
//                       type="text"
//                       name="assigned_to"
//                       value={newIP.assigned_to}
//                       onChange={handleInputChange}
//                       placeholder="Device or service name"
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary placeholder-dark-text-tertiary'
//                           : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                     />
//                   </div>
                  
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="priority">Priority</label>
//                     <select
//                       id="priority"
//                       name="priority"
//                       value={newIP.priority}
//                       onChange={handleInputChange}
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         formErrors.priority 
//                           ? 'border-red-500' 
//                           : theme === 'dark'
//                             ? 'border-dark-border-medium'
//                             : 'border-gray-300'
//                       } ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary text-dark-text-primary'
//                           : 'bg-white text-gray-900'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                       aria-invalid={!!formErrors.priority}
//                       aria-describedby={formErrors.priority ? 'priority-error' : undefined}
//                     >
//                       <option value="high">High</option>
//                       <option value="medium">Medium</option>
//                       <option value="low">Low</option>
//                     </select>
//                     {formErrors.priority && (
//                       <p id="priority-error" className="text-red-500 text-xs mt-1">{formErrors.priority}</p>
//                     )}
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="description">Description</label>
//                     <input
//                       id="description"
//                       type="text"
//                       name="description"
//                       value={newIP.description}
//                       onChange={handleInputChange}
//                       placeholder="Brief description of this IP assignment"
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary placeholder-dark-text-tertiary'
//                           : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                     />
//                   </div>
                  
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="subnet">Subnet</label>
//                     <input
//                       id="subnet"
//                       type="text"
//                       name="subnet"
//                       value={newIP.subnet}
//                       onChange={handleInputChange}
//                       placeholder="192.168.1.0/24"
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         formErrors.subnet 
//                           ? 'border-red-500' 
//                           : theme === 'dark'
//                             ? 'border-dark-border-medium'
//                             : 'border-gray-300'
//                       } ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary text-dark-text-primary placeholder-dark-text-tertiary'
//                           : 'bg-white text-gray-900 placeholder-gray-500'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                       aria-invalid={!!formErrors.subnet}
//                       aria-describedby={formErrors.subnet ? 'subnet-error' : undefined}
//                     />
//                     {formErrors.subnet && (
//                       <p id="subnet-error" className="text-red-500 text-xs mt-1">{formErrors.subnet}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                     }`} htmlFor="bandwidth_limit">Bandwidth Limit (optional)</label>
//                     <input
//                       id="bandwidth_limit"
//                       type="text"
//                       name="bandwidth_limit"
//                       value={newIP.bandwidth_limit}
//                       onChange={handleInputChange}
//                       placeholder="e.g. 100Mbps or 1Gbps"
//                       className={`w-full p-2 border rounded-md theme-transition ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary placeholder-dark-text-tertiary'
//                           : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
//                       } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               <div className={`flex justify-end space-x-3 border-t p-4 ${
//                 theme === 'dark' ? 'border-dark-border-light' : 'border-gray-200'
//               }`}>
//                 <button
//                   onClick={resetForm}
//                   className={`px-4 py-2 rounded-md theme-transition ${
//                     theme === 'dark'
//                       ? 'bg-dark-background-primary text-dark-text-primary hover:bg-dark-border-light'
//                       : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
//                   }`}
//                   aria-label="Cancel"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddOrEdit}
//                   className={`px-4 py-2 rounded-md text-white theme-transition ${
//                     theme === 'dark' 
//                       ? 'bg-dark-primary-600 hover:bg-dark-primary-500' 
//                       : 'bg-indigo-600 hover:bg-indigo-500'
//                   }`}
//                   aria-label={editIP ? 'Update IP address' : 'Add IP address'}
//                 >
//                   {editIP ? 'Update IP Address' : 'Add IP Address'}
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default IPAddressManagement;









// src/components/NetworkManagement/IPAddressManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Search, ChevronDown, ChevronUp,
  Server, HardDrive, Network, Wifi, CheckCircle, XCircle, Clock,
  AlertCircle, ArrowRight, Download, Upload, Activity, Router
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import { useTheme } from '../../context/ThemeContext';

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
  const [mobileDropdowns, setMobileDropdowns] = useState({});

  const { theme } = useTheme();

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

  const toggleMobileDropdown = (dropdown) => {
    setMobileDropdowns(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [dropdown]: !prev[dropdown]
    }));
  };

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

  const getStatusColor = useCallback((status) => {
    const colors = theme === 'dark' ? {
      assigned: "bg-blue-900 text-blue-300",
      available: "bg-green-900 text-green-300",
      reserved: "bg-yellow-900 text-yellow-300",
      blocked: "bg-red-900 text-red-300",
    } : {
      assigned: "bg-blue-100 text-blue-800",
      available: "bg-green-100 text-green-800",
      reserved: "bg-yellow-100 text-yellow-800",
      blocked: "bg-red-100 text-red-800",
    };
    return `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || (theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800")}`;
  }, [theme]);

  const getPriorityColor = useCallback((priority) => {
    const colors = theme === 'dark' ? {
      high: "bg-red-900 text-red-300",
      medium: "bg-yellow-900 text-yellow-300",
      low: "bg-green-900 text-green-300",
    } : {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[priority] || (theme === 'dark' ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-800")}`;
  }, [theme]);

  const timeSince = useCallback((dateString) => {
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
  }, []);

  const MobileActionButton = ({ onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg flex items-center space-x-3 text-sm transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className={containerClass}>
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />
      
      <header className={`${cardClass} flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-6 transition-colors duration-300`}>
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <Network className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-500">IP Address Management</h1>
            <p className={`text-sm ${textSecondaryClass}`}>
              {ipAddresses.length} IPs • {ipAddresses.filter(ip => ip.status === 'assigned').length} assigned
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {routers.length === 0 ? (
            <div className={`flex-1 border-l-4 p-3 rounded-lg w-full transition-colors duration-300 ${
              theme === "dark" ? "bg-yellow-900 border-yellow-500 text-yellow-300" : "bg-yellow-100 border-yellow-500 text-yellow-700"
            }`}>
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>
                  No routers configured. Please{' '}
                  <button
                    onClick={() => toast.info('Navigate to Router Management and click "Add Router" to configure a new router.')}
                    className="text-indigo-400 underline hover:text-indigo-300"
                  >
                    add a router
                  </button>{' '}
                  in the Router Management section to start managing IP addresses.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Router className={`w-5 h-5 ${textTertiaryClass}`} />
                </div>
                <select
                  value={selectedRouterId}
                  onChange={(e) => setSelectedRouterId(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg w-full sm:w-auto ${inputClass} transition-colors duration-300`}
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
                className={`flex items-center px-4 py-2 rounded-lg disabled:opacity-50 transition-colors duration-300 ${
                  theme === "dark" 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
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
          <div className="flex flex-col md:flex-row gap-4 mb-6 transition-colors duration-300">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${textTertiaryClass}`} />
              </div>
              <input
                type="text"
                className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300`}
                placeholder="Search by IP, assigned device, or description..."
                value={searchTerm}
                onChange={handleSearch}
                aria-label="Search IP addresses"
              />
            </div>
            <select 
              className={`p-2 border rounded-lg text-sm ${inputClass} transition-colors duration-300`}
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

          <div className={`${cardClass} overflow-hidden transition-colors duration-300`}>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                  theme === "dark" ? "border-indigo-500" : "border-indigo-500"
                }`}></div>
              </div>
            ) : filteredIPAddresses.length === 0 ? (
              <div className={`text-center py-8 flex flex-col items-center ${textSecondaryClass}`}>
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>No IP addresses found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y transition-colors duration-300 ${
                  theme === "dark" ? "divide-gray-700" : "divide-gray-200"
                }`}>
                  <thead className={theme === "dark" ? "bg-gray-800/60" : "bg-white/80"}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === "dark" ? "text-gray-300" : "text-gray-500"} hover:opacity-80 transition-colors duration-300`} onClick={() => handleSort('ip_address')}>
                        IP Address
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === "dark" ? "text-gray-300" : "text-gray-500"} hover:opacity-80 transition-colors duration-300`} onClick={() => handleSort('status')}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === "dark" ? "text-gray-300" : "text-gray-500"} hover:opacity-80 transition-colors duration-300`} onClick={() => handleSort('assigned_to.full_name')}>
                        Assigned To
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
                        Bandwidth
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${theme === "dark" ? "text-gray-300" : "text-gray-500"} hover:opacity-80 transition-colors duration-300`} onClick={() => handleSort('subnet')}>
                        Subnet
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
                        Last Used
                      </th>
                      <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    theme === "dark" ? "divide-gray-700" : "divide-gray-200"
                  }`}>
                    {currentItems.map((ip) => (
                      <React.Fragment key={ip.id}>
                        <tr 
                          className={`cursor-pointer transition-colors duration-300 ${
                            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setExpandedIP(expandedIP === ip.id ? null : ip.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setExpandedIP(expandedIP === ip.id ? null : ip.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                theme === "dark" ? "bg-indigo-900" : "bg-indigo-100"
                              }`}>
                                <Server className={`w-5 h-5 ${
                                  theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                                }`} />
                              </div>
                              <div className="ml-4">
                                <div className={`text-sm font-medium ${
                                  theme === "dark" ? "text-white" : "text-gray-800"
                                }`}>{ip.ip_address}</div>
                                <div className={`text-xs ${textSecondaryClass}`}>{ip.description || 'No description'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusColor(ip.status)}>
                              {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>
                            {ip.assigned_to?.full_name || '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>
                            {ip.bandwidth_limit || 'Unlimited'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}>
                            {ip.subnet}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>
                            {timeSince(ip.last_used)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center space-x-2">
                              {/* Mobile Actions Dropdown */}
                              <div className="lg:hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMobileDropdown(`ip-${ip.id}`);
                                  }}
                                  className={`p-2 rounded-lg transition-colors duration-300 ${
                                    theme === "dark" 
                                      ? "text-gray-400 hover:bg-gray-700" 
                                      : "text-gray-500 hover:bg-gray-100"
                                  }`}
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform ${
                                    mobileDropdowns[`ip-${ip.id}`] ? 'rotate-180' : ''
                                  }`} />
                                </button>
                                
                                {mobileDropdowns[`ip-${ip.id}`] && (
                                  <div className={`absolute right-4 mt-1 p-2 rounded-lg shadow-xl z-10 ${
                                    theme === "dark" ? "bg-gray-800/80 backdrop-blur-md border border-gray-700" : "bg-white border border-gray-200"
                                  } transition-colors duration-300`}>
                                    <MobileActionButton
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
                                      icon={<Edit className="w-4 h-4" />}
                                      label="Edit"
                                    />
                                    <MobileActionButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(ip.id);
                                      }}
                                      icon={<Trash2 className="w-4 h-4" />}
                                      label="Delete"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Desktop Actions */}
                              <div className="hidden lg:flex space-x-2">
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
                                  className={`p-2 rounded-lg transition-colors duration-300 ${
                                    theme === "dark" 
                                      ? "text-indigo-400 hover:text-indigo-300 hover:bg-gray-700" 
                                      : "text-indigo-600 hover:text-indigo-500 hover:bg-gray-100"
                                  }`}
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
                                  className={`p-2 rounded-lg transition-colors duration-300 ${
                                    theme === "dark" 
                                      ? "text-red-400 hover:text-red-300 hover:bg-gray-700" 
                                      : "text-red-600 hover:text-red-500 hover:bg-gray-100"
                                  }`}
                                  title="Delete IP Address"
                                  aria-label="Delete IP address"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                              
                              <button 
                                className={`p-2 rounded-lg transition-colors duration-300 ${
                                  theme === "dark" 
                                    ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" 
                                    : "text-gray-500 hover:text-gray-400 hover:bg-gray-100"
                                }`}
                                aria-label={expandedIP === ip.id ? 'Collapse IP details' : 'Expand IP details'}
                              >
                                {expandedIP === ip.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedIP === ip.id && (
                          <tr className={theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"}>
                            <td colSpan="7" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className={`font-medium mb-3 flex items-center ${
                                    theme === "dark" ? "text-white" : "text-gray-800"
                                  }`}>
                                    <HardDrive className="w-5 h-5 mr-2 text-indigo-500" />
                                    IP Address Details
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className={textSecondaryClass}>Status</p>
                                      <p className={getStatusColor(ip.status)}>
                                        {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Assigned To</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{ip.assigned_to?.full_name || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Bandwidth Limit</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{ip.bandwidth_limit || 'Unlimited'}</p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Priority</p>
                                      <p className={getPriorityColor(ip.priority)}>
                                        {ip.priority.charAt(0).toUpperCase() + ip.priority.slice(1)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Created</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{timeSince(ip.created_at)}</p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Last Used</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{timeSince(ip.last_used)}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className={`font-medium mb-3 flex items-center ${
                                    theme === "dark" ? "text-white" : "text-gray-800"
                                  }`}>
                                    <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                                    Network Information
                                  </h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className={textSecondaryClass}>IP Address</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{ip.ip_address}</p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Subnet</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{ip.subnet}</p>
                                    </div>
                                    <div>
                                      <p className={textSecondaryClass}>Description</p>
                                      <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{ip.description || 'No description'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <button 
                                        className={`flex items-center transition-colors duration-300 ${
                                          theme === "dark" ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"
                                        }`}
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
            <div className={`flex justify-between items-center mt-4 px-4 py-3 rounded-b-lg transition-colors duration-300 ${
              theme === "dark" ? "bg-gray-800/60" : "bg-white/80"
            }`}>
              <div className={`text-sm ${textSecondaryClass}`}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredIPAddresses.length)} of {filteredIPAddresses.length} IPs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg disabled:opacity-50 transition-colors duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700 text-white hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors duration-300 ${
                      currentPage === page 
                        ? theme === "dark" 
                          ? "bg-indigo-600 text-white" 
                          : "bg-indigo-600 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg disabled:opacity-50 transition-colors duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700 text-white hover:bg-gray-600" 
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={`${cardClass} p-8 text-center transition-colors duration-300`}>
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <Router className={`h-6 w-6 ${textSecondaryClass}`} />
          </div>
          <h3 className={`mt-2 text-lg font-medium ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>No router selected</h3>
          <p className={`mt-1 ${textSecondaryClass}`}>
            {routers.length > 0 
              ? "Please select a router from the dropdown above" 
              : "No routers available. Navigate to Router Management and click 'Add Router' to configure a new router."}
          </p>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-colors duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${cardClass} w-full max-w-2xl transition-colors duration-300`}
            >
              <div className={`flex justify-between items-center border-b p-4 transition-colors duration-300 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}>
                <h3 className={`text-lg font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {editIP ? 'Edit IP Address' : 'Add New IP Address'}
                </h3>
                <button 
                  onClick={resetForm}
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"} transition-colors duration-300`}
                  aria-label="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="ip_address">IP Address</label>
                    <input
                      id="ip_address"
                      type="text"
                      name="ip_address"
                      value={newIP.ip_address}
                      onChange={handleInputChange}
                      placeholder="192.168.1.1"
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300 ${
                        formErrors.ip_address ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!formErrors.ip_address}
                      aria-describedby={formErrors.ip_address ? 'ip_address-error' : undefined}
                    />
                    {formErrors.ip_address && (
                      <p id="ip_address-error" className="text-red-400 text-xs mt-1">{formErrors.ip_address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={newIP.status}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300 ${
                        formErrors.status ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!formErrors.status}
                      aria-describedby={formErrors.status ? 'status-error' : undefined}
                    >
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="reserved">Reserved</option>
                      <option value="blocked">Blocked</option>
                    </select>
                    {formErrors.status && (
                      <p id="status-error" className="text-red-400 text-xs mt-1">{formErrors.status}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="assigned_to">Assigned To</label>
                    <input
                      id="assigned_to"
                      type="text"
                      name="assigned_to"
                      value={newIP.assigned_to}
                      onChange={handleInputChange}
                      placeholder="Device or service name"
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={newIP.priority}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300 ${
                        formErrors.priority ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!formErrors.priority}
                      aria-describedby={formErrors.priority ? 'priority-error' : undefined}
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    {formErrors.priority && (
                      <p id="priority-error" className="text-red-400 text-xs mt-1">{formErrors.priority}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="description">Description</label>
                    <input
                      id="description"
                      type="text"
                      name="description"
                      value={newIP.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of this IP assignment"
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="subnet">Subnet</label>
                    <input
                      id="subnet"
                      type="text"
                      name="subnet"
                      value={newIP.subnet}
                      onChange={handleInputChange}
                      placeholder="192.168.1.0/24"
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300 ${
                        formErrors.subnet ? "border-red-500" : ""
                      }`}
                      aria-invalid={!!formErrors.subnet}
                      aria-describedby={formErrors.subnet ? 'subnet-error' : undefined}
                    />
                    {formErrors.subnet && (
                      <p id="subnet-error" className="text-red-400 text-xs mt-1">{formErrors.subnet}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`} htmlFor="bandwidth_limit">Bandwidth Limit (optional)</label>
                    <input
                      id="bandwidth_limit"
                      type="text"
                      name="bandwidth_limit"
                      value={newIP.bandwidth_limit}
                      onChange={handleInputChange}
                      placeholder="e.g. 100Mbps or 1Gbps"
                      className={`w-full p-2 border rounded-lg ${inputClass} transition-colors duration-300`}
                    />
                  </div>
                </div>
              </div>
              
              <div className={`flex justify-end space-x-3 border-t p-4 transition-colors duration-300 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}>
                <button
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                  }`}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrEdit}
                  className={`px-4 py-2 rounded-lg text-white transition-colors duration-300 ${
                    theme === "dark" 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "bg-indigo-600 hover:bg-indigo-500"
                  }`}
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