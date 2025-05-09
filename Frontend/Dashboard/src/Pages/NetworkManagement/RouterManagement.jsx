
// import React, { useState, useEffect } from 'react';
// import { RefreshCw, Wifi, UploadCloud, AlertCircle } from 'lucide-react';

// const RouterManagement = () => {
//   // Mock data for routers
//   const mockRouters = [
//     { id: 'router1', name: 'MikroTik-R1', status: 'Connected', bandwidth: '500Mbps', uptime: '1d 4h 23m', version: '6.49.7' },
//     { id: 'router2', name: 'MikroTik-R2', status: 'Disconnected', bandwidth: '1Gbps', uptime: 'N/A', version: '6.48.3' }
//   ];

//   const [routers, setRouters] = useState([]);
//   const [currentRouter, setCurrentRouter] = useState(null);
//   const [status, setStatus] = useState('');
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [firmwareVersion, setFirmwareVersion] = useState('');

//   useEffect(() => {
//     setTimeout(() => {
//       setRouters(mockRouters);
//       setCurrentRouter(mockRouters[0]); // Default to first router
//       setIsLoading(false);
//     }, 1000); // Simulate a delay for API response
//   }, []);

//   const fetchRouterStatus = () => {
//     setIsLoading(true);
//     setError(null);

//     setTimeout(() => {
//       setCurrentRouter(prev => ({
//         ...prev,
//         uptime: '1d 5h 12m',
//         version: '6.49.7',
//       }));
//       setIsLoading(false);
//     }, 2000);
//   };

//   const updateFirmware = () => {
//     if (!firmwareVersion) {
//       alert('Please enter a firmware version.');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     setTimeout(() => {
//       alert(`Firmware update to version ${firmwareVersion} initiated.`);
//       setCurrentRouter(prev => ({ ...prev, version: firmwareVersion }));
//       setFirmwareVersion('');
//       setIsLoading(false);
//     }, 2000);
//   };

//   const shareInternet = () => {
//     setIsLoading(true);
//     setError(null);

//     setTimeout(() => {
//       alert('Internet sharing enabled successfully.');
//       setIsLoading(false);
//     }, 2000);
//   };

//   const updateRouterStatus = (action) => {
//     setStatus(`Router ${action === 'connect' ? 'connected' : 'disconnected'}`);
//     setCurrentRouter({ ...currentRouter, status: action === 'connect' ? 'Connected' : 'Disconnected' });
//   };

//   const RouterSelector = () => (
//     <div className="mb-6">
//       <label htmlFor="routerSelector" className="block text-sm font-medium text-gray-700 mb-2">
//         Select Router:
//       </label>
//       <select
//         id="routerSelector"
//         value={currentRouter ? currentRouter.id : ''}
//         onChange={(e) => setCurrentRouter(routers.find(r => r.id === e.target.value) || null)}
//         className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
//          focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//       >
//         {Array.isArray(routers) && routers.length > 0 ?
//           routers.map(router => (
//             <option key={router.id} value={router.id}>
//               {router.name} - {router.status}
//             </option>
//           )) :
//           <option value="">No routers available</option>
//         }
//       </select>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-100 rounded-lg shadow-lg">
//       <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
//         Router Management 
//       </h2>

//       {/* Error Alert */}
//       {error && (
//         <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex items-center">
//           <AlertCircle className="w-6 h-6 mr-3" />
//           <p className="text-lg">{error}</p>
//         </div>
//       )}

//       {isLoading ? (
//         <div className="text-center">
//           <p className="text-2xl text-gray-600">Loading...</p>
//         </div>
//       ) : (
//         <>
//           <RouterSelector />
//           {currentRouter && (
//             <div className="bg-white p-6 rounded-lg shadow-xl mb-6">
//               <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Wifi className="w-8 h-8 mr-2 text-blue-500" />
//                 Router Status
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
//                 <div><strong>Identity:</strong> {currentRouter.name}</div>
//                 <div><strong>Uptime:</strong> {currentRouter.uptime}</div>
//                 <div><strong>Version:</strong> {currentRouter.version}</div>
//                 <div><strong>Status:</strong>
//                   <span className={`ml-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
//                      ${currentRouter.status === 'Connected' ? 'bg-green-100 text-green-800' 
//                      : 'bg-red-100 text-red-800'}`}>
//                     {currentRouter.status}
//                   </span>
//                 </div>
//                 <div><strong>Bandwidth:</strong> {currentRouter.bandwidth}</div>
//               </div>
//               <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
//                 <button
//                   onClick={fetchRouterStatus}
//                   disabled={isLoading}
//                   className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
//                    shadow-lg flex items-center justify-center"
//                 >
//                   <RefreshCw className="w-6 h-6 mr-2" />
//                   {isLoading ? 'Refreshing...' : 'Refresh Status'}
//                 </button>
//                 <button
//                   onClick={() => updateRouterStatus(currentRouter.status === 'Connected' ? 'disconnect' : 'connect')}
//                   className={`w-full sm:w-auto px-5 py-3 rounded-lg shadow-lg flex items-center 
//                     justify-center ${currentRouter.status === 'Connected' ? 'bg-red-600 hover:bg-red-700 text-white' : 
//                       'bg-green-600 hover:bg-green-700 text-white'}`}
//                 >
//                   <Wifi className="w-6 h-6 mr-2" />
//                   {currentRouter.status === 'Connected' ? 'Disconnect' : 'Connect'}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Firmware Update Section */}
//           <div className="bg-white p-6 rounded-lg shadow-xl mb-6">
//             <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
//               <UploadCloud className="w-8 h-8 mr-2 text-green-500" />
//               Firmware Update
//             </h3>
//             <div className="mb-4">
//               <label htmlFor="firmwareVersion" className="block text-sm font-medium text-gray-700 mb-2">
//                 Enter Firmware Version
//               </label>
//               <input
//                 type="text"
//                 id="firmwareVersion"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
//                 value={firmwareVersion}
//                 onChange={(e) => setFirmwareVersion(e.target.value)}
//                 placeholder="e.g., 6.47.9"
//               />
//             </div>
//             <button
//               onClick={updateFirmware}
//               disabled={isLoading}
//               className="w-full sm:w-auto px-5 py-3 bg-green-600 text-white rounded-lg shadow-lg 
//               flex items-center justify-center hover:bg-green-700"
//             >
//               <UploadCloud className="w-6 h-6 mr-2" />
//               {isLoading ? 'Updating...' : 'Update Firmware'}
//             </button>
//           </div>

//           {/* Internet Sharing Section */}
//           <div className="bg-white p-6 rounded-lg shadow-xl">
//             <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
//               <Wifi className="w-8 h-8 mr-2 text-indigo-500" />
//               Internet Sharing
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Configure the router to share internet with clients via NAT.
//             </p>
//             <button
//               onClick={shareInternet}
//               disabled={isLoading}
//               className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white rounded-lg shadow-lg
//                flex items-center justify-center hover:bg-indigo-700"
//             >
//               <Wifi className="w-6 h-6 mr-2" />
//               {isLoading ? 'Configuring...' : 'Enable Internet Sharing'}
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default RouterManagement;





// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Wifi, Server, UploadCloud, Globe, Lock, Zap, Settings, Menu, X, 
//   Download, Upload, Activity, Shield, BarChart, FileText 
// } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { BarLoader } from 'react-spinners';
// import api from '../../../api'; 

// const RouterManagement = () => {
//   const [routers, setRouters] = useState([]);
//   const [currentRouter, setCurrentRouter] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [configModalOpen, setConfigModalOpen] = useState(false);
//   const [importModalOpen, setImportModalOpen] = useState(false);
//   const [firmwareVersion, setFirmwareVersion] = useState('');
//   const [routerConfig, setRouterConfig] = useState({ host: '', user: 'admin', initial_password: '', port: 22 });
//   const [importFile, setImportFile] = useState(null);
//   const [realTimeStats, setRealTimeStats] = useState({ cpu: 0, memory: 0, clients: 0 });

//   // Fetch initial data
//   const fetchPlans = async () => {
//     try {
//       const response = await api.get('/api/internet_plans/');
//       setPlans(response.data.results || response.data);
//     } catch (err) {
//       setError(`Failed to fetch plans: ${err.message}`);
//       toast.error(`Plans fetch failed`);
//     }
//   };

//   const fetchRouters = async () => {
//     try {
//       setIsLoading(true);
//       const response = await api.get('/api/network_management/routers/');
//       setRouters(response.data);
//       if (response.data.length > 0 && !currentRouter) setCurrentRouter(response.data[0]);
//     } catch (err) {
//       setError(`Failed to fetch routers: ${err.message}`);
//       toast.error(`Routers fetch failed`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPlans();
//     fetchRouters();
//     const interval = setInterval(() => currentRouter && fetchRealTimeStats(), 5000); // Real-time stats every 5s
//     return () => clearInterval(interval);
//   }, [currentRouter]);

//   // Router actions
//   const connectToRouter = async (routerId) => {
//     try {
//       setIsLoading(true);
//       const response = await api.post(`/api/network_management/routers/${routerId}/connect/`);
//       updateRouterState(response.data);
//       toast.success(`Connected to ${response.data.name}`);
//     } catch (err) {
//       setError(`Connection failed: ${err.response?.data?.error || err.message}`);
//       toast.error(`Connection failed`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const disconnectRouter = async () => {
//     if (!currentRouter) return;
//     try {
//       setIsLoading(true);
//       const response = await api.post(`/api/network_management/routers/${currentRouter.id}/disconnect/`);
//       updateRouterState(response.data);
//       toast.success(`Disconnected ${response.data.name}`);
//     } catch (err) {
//       setError(`Disconnect failed: ${err.response?.data?.error || err.message}`);
//       toast.error(`Disconnect failed`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchRealTimeStats = async () => {
//     if (!currentRouter || currentRouter.status !== 'Connected') return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${currentRouter.id}/status/`);
//       setRealTimeStats({
//         cpu: response.data.cpu_usage || 0,
//         memory: parseInt(response.data.bandwidth.split(' ')[0]) || 0,
//         clients: response.data.active_clients || 0,
//       });
//       updateRouterState(response.data);
//     } catch (err) {
//       console.error('Real-time stats fetch failed:', err);
//     }
//   };

//   const updateFirmware = async () => {
//     if (!currentRouter || !firmwareVersion) {
//       toast.warn('Select a router and enter a firmware version');
//       return;
//     }
//     try {
//       setIsLoading(true);
//       const response = await api.post(`/api/network_management/routers/${currentRouter.id}/firmware/`, { version: firmwareVersion });
//       updateRouterState(response.data);
//       setFirmwareVersion('');
//       toast.success(`Firmware updated to ${response.data.version}`);
//     } catch (err) {
//       setError(`Firmware update failed: ${err.response?.data?.error || err.message}`);
//       toast.error(`Firmware update failed`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const enableInternetSharing = async () => {
//     if (!currentRouter) return;
//     try {
//       setIsLoading(true);
//       const selectedPlanId = document.getElementById('planSelect')?.value;
//       const response = await api.post(`/api/network_management/routers/${currentRouter.id}/share-internet/`, { plan_id: selectedPlanId || null });
//       toast.success('Internet sharing enabled');
//       if (selectedPlanId) {
//         const plan = plans.find((p) => p.id === parseInt(selectedPlanId));
//         toast.info(`Assigned "${plan.name}" to new client`);
//       }
//     } catch (err) {
//       setError(`Internet sharing failed: ${err.response?.data?.error || err.message}`);
//       toast.error(`Internet sharing failed`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveRouterConfig = async () => {
//     if (!routerConfig.host || !routerConfig.user || !routerConfig.initial_password) {
//       toast.warn('Host, user, and initial password are required');
//       return;
//     }
//     try {
//       setIsLoading(true);
//       const response = await api.post('/api/network_management/routers/', {
//         ...routerConfig,
//         name: `Router-${Date.now()}`,
//       });
//       setRouters((prev) => [...prev, response.data]);
//       setConfigModalOpen(false);
//       setRouterConfig({ host: '', user: 'admin', initial_password: '', port: 22 }); // Reset form
//       toast.success('Router added and SSH key deployed');
//       await connectToRouter(response.data.id);
//     } catch (err) {
//       setError(`Failed to save router: ${err.response?.data?.error || err.message}`);
//       toast.error(`Save failed: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const exportConfig = async () => {
//     if (!currentRouter) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${currentRouter.id}/export/`);
//       const blob = new Blob([response.data.config], { type: 'text/plain' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${currentRouter.name}_config.rsc`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//       toast.success('Configuration exported');
//     } catch (err) {
//       toast.error('Export failed');
//     }
//   };

//   const importConfig = async () => {
//     if (!currentRouter || !importFile) return;
//     try {
//       setIsLoading(true);
//       const formData = new FormData();
//       formData.append('file', importFile);
//       const response = await api.post(`/api/network_management/routers/${currentRouter.id}/import/`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       updateRouterState(response.data);
//       setImportModalOpen(false);
//       toast.success('Configuration imported');
//     } catch (err) {
//       setError(`Import failed: ${err.response?.data?.error || err.message}`);
//       toast.error(`Import failed`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateRouterState = (updatedRouter) => {
//     setRouters((prev) => prev.map((r) => (r.id === updatedRouter.id ? updatedRouter : r)));
//     setCurrentRouter(updatedRouter);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex font-sans">
//       <ToastContainer position="top-right" autoClose={3000} />

//       {/* Sidebar */}
//       <motion.aside
//         initial={{ x: -300 }}
//         animate={{ x: sidebarOpen ? 0 : -300 }}
//         transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//         className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-2xl z-50 lg:relative lg:translate-x-0"
//       >
//         <div className="p-6 flex items-center justify-between border-b border-indigo-700">
//           <h2 className="text-2xl font-bold flex items-center">
//             <Server className="w-6 h-6 mr-2" /> Router Hub
//           </h2>
//           <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
//             <X className="w-6 h-6" />
//           </button>
//         </div>
//         <nav className="p-4 space-y-3">
//           {routers.map((router) => (
//             <motion.button
//               key={router.id}
//               onClick={() => setCurrentRouter(router)}
//               whileHover={{ scale: 1.05 }}
//               className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${
//                 currentRouter?.id === router.id ? 'bg-indigo-700' : 'hover:bg-indigo-600'
//               }`}
//             >
//               <span className="flex items-center">
//                 <Wifi className="w-5 h-5 mr-2" /> {router.name}
//               </span>
//               <span className={`text-sm ${router.status === 'Connected' ? 'text-green-300' : 'text-red-300'}`}>
//                 {router.status}
//               </span>
//             </motion.button>
//           ))}
//           <motion.button
//             onClick={() => setConfigModalOpen(true)}
//             whileHover={{ scale: 1.05 }}
//             className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center"
//           >
//             <Settings className="w-5 h-5 mr-2" /> Add Router
//           </motion.button>
//         </nav>
//       </motion.aside>

//       {/* Main Content */}
//       <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
//         <header className="flex items-center justify-between mb-8">
//           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-indigo-600 text-white rounded-lg">
//             <Menu className="w-6 h-6" />
//           </button>
//           <motion.h1
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-3xl font-bold text-gray-800 flex items-center"
//           >
//             <Server className="w-8 h-8 mr-2 text-indigo-600" /> Router Control Center
//           </motion.h1>
//         </header>

//         {isLoading && (
//           <div className="flex justify-center py-12">
//             <BarLoader color="#4F46E5" width={150} height={6} />
//           </div>
//         )}

//         {error && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex items-center"
//           >
//             <AlertCircle className="w-6 h-6 mr-2" /> {error}
//           </motion.div>
//         )}

//         {!isLoading && (
//           <div className="space-y-8">
//             {/* Overview Section */}
//             <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <StatCard title="Status" value={currentRouter?.status || 'N/A'} icon={<Wifi className="w-6 h-6 text-indigo-600" />} color={currentRouter?.status === 'Connected' ? 'text-green-600' : 'text-red-600'} />
//               <StatCard title="Uptime" value={currentRouter?.uptime || 'N/A'} icon={<Activity className="w-6 h-6 text-indigo-600" />} />
//               <StatCard title="Firmware" value={currentRouter?.version || 'Unknown'} icon={<Shield className="w-6 h-6 text-indigo-600" />} />
//               <StatCard title="Clients" value={realTimeStats.clients} icon={<BarChart className="w-6 h-6 text-indigo-600" />} />
//             </section>

//             {/* Control Panel */}
//             <section className="bg-white p-6 rounded-xl shadow-lg">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">Control Panel</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <ControlButton
//                   onClick={() => (currentRouter?.status === 'Connected' ? disconnectRouter() : connectToRouter(currentRouter?.id))}
//                   label={currentRouter?.status === 'Connected' ? 'Disconnect' : 'Connect'}
//                   icon={<Lock className="w-5 h-5" />}
//                   color={currentRouter?.status === 'Connected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
//                   disabled={!currentRouter}
//                 />
//                 <ControlButton onClick={fetchRealTimeStats} label="Refresh Stats" icon={<Zap className="w-5 h-5" />} color="bg-indigo-600 hover:bg-indigo-700" disabled={!currentRouter} />
//                 <ControlButton onClick={exportConfig} label="Export Config" icon={<Download className="w-5 h-5" />} color="bg-gray-600 hover:bg-gray-700" disabled={!currentRouter} />
//               </div>
//             </section>

//             {/* Firmware & Sharing */}
//             <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-white p-6 rounded-xl shadow-lg">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <UploadCloud className="w-6 h-6 mr-2 text-green-600" /> Firmware Update
//                 </h2>
//                 <input
//                   type="text"
//                   value={firmwareVersion}
//                   onChange={(e) => setFirmwareVersion(e.target.value)}
//                   placeholder="e.g., 7.11"
//                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
//                 />
//                 <ControlButton onClick={updateFirmware} label="Update Firmware" icon={<UploadCloud className="w-5 h-5" />} color="bg-green-600 hover:bg-green-700" disabled={!currentRouter} />
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-lg">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <Globe className="w-6 h-6 mr-2 text-blue-600" /> Internet Sharing
//                 </h2>
//                 <select id="planSelect" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4">
//                   <option value="">Select a Plan</option>
//                   {plans.map((plan) => (
//                     <option key={plan.id} value={plan.id}>
//                       {plan.name} - {plan.price} Ksh
//                     </option>
//                   ))}
//                 </select>
//                 <ControlButton onClick={enableInternetSharing} label="Enable Sharing" icon={<Globe className="w-5 h-5" />} color="bg-blue-600 hover:bg-blue-700" disabled={!currentRouter} />
//               </div>
//             </section>

//             {/* Real-Time Monitoring */}
//             <section className="bg-white p-6 rounded-xl shadow-lg">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-Time Monitoring</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <ProgressBar label="CPU Usage" value={realTimeStats.cpu} color="bg-indigo-600" />
//                 <ProgressBar label="Memory Free" value={realTimeStats.memory} max={1000} color="bg-green-600" />
//                 <ProgressBar label="Active Clients" value={realTimeStats.clients} max={50} color="bg-blue-600" />
//               </div>
//             </section>
//           </div>
//         )}

//         {/* Config Modal */}
//         <Modal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} title="Add New Router">
//           <div className="space-y-4">
//             <InputField 
//               label="Host" 
//               value={routerConfig.host} 
//               onChange={(e) => setRouterConfig({ ...routerConfig, host: e.target.value })} 
//               placeholder="e.g., 192.168.1.1" 
//             />
//             <InputField 
//               label="Username" 
//               value={routerConfig.user} 
//               onChange={(e) => setRouterConfig({ ...routerConfig, user: e.target.value })} 
//               placeholder="admin" 
//             />
//             <InputField 
//               label="Initial Password" 
//               type="password" 
//               value={routerConfig.initial_password} 
//               onChange={(e) => setRouterConfig({ ...routerConfig, initial_password: e.target.value })} 
//               placeholder="Temporary password" 
//             />
//             <InputField 
//               label="Port" 
//               type="number" 
//               value={routerConfig.port} 
//               onChange={(e) => setRouterConfig({ ...routerConfig, port: parseInt(e.target.value) || 22 })} 
//               placeholder="22" 
//             />
//             <ControlButton onClick={saveRouterConfig} label="Save & Connect" icon={<Settings className="w-5 h-5" />} color="bg-indigo-600 hover:bg-indigo-700" />
//           </div>
//         </Modal>

//         {/* Import Modal */}
//         <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Configuration">
//           <div className="space-y-4">
//             <input type="file" accept=".rsc" onChange={(e) => setImportFile(e.target.files[0])} className="w-full p-3 border rounded-lg" />
//             <ControlButton onClick={importConfig} label="Import Config" icon={<Upload className="w-5 h-5" />} color="bg-indigo-600 hover:bg-indigo-700" disabled={!importFile} />
//           </div>
//         </Modal>
//       </main>
//     </div>
//   );
// };

// // Reusable Components
// const StatCard = ({ title, value, icon, color = 'text-gray-800' }) => (
//   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl shadow-lg flex items-center">
//     {icon}
//     <div className="ml-4">
//       <p className="text-sm text-gray-500">{title}</p>
//       <p className={`text-lg font-semibold ${color}`}>{value}</p>
//     </div>
//   </motion.div>
// );

// const ControlButton = ({ onClick, label, icon, color, disabled }) => (
//   <motion.button
//     whileHover={{ scale: disabled ? 1 : 1.05 }}
//     onClick={onClick}
//     disabled={disabled}
//     className={`p-3 ${color} text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
//   >
//     {icon} <span className="ml-2">{label}</span>
//   </motion.button>
// );

// const ProgressBar = ({ label, value, max = 100, color }) => (
//   <div>
//     <p className="text-sm text-gray-600 mb-2">{label}: {value}/{max}</p>
//     <div className="w-full bg-gray-200 rounded-full h-2.5">
//       <motion.div
//         initial={{ width: 0 }}
//         animate={{ width: `${(value / max) * 100}%` }}
//         className={`${color} h-2.5 rounded-full`}
//       />
//     </div>
//   </div>
// );

// const Modal = ({ isOpen, onClose, title, children }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//       >
//         <motion.div
//           initial={{ scale: 0.9 }}
//           animate={{ scale: 1 }}
//           exit={{ scale: 0.9 }}
//           className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//             <button onClick={onClose}><X className="w-6 h-6 text-gray-600" /></button>
//           </div>
//           {children}
//         </motion.div>
//       </motion.div>
//     )}
//   </AnimatePresence>
// );

// const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
//   <div>
//     <label className="text-sm text-gray-600">{label}</label>
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
//     />
//   </div>
// );

// export default RouterManagement;














// import React, { useReducer, useEffect, useState, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Wifi, Server, Upload, Settings, X, Activity, Users, 
//   BarChart2, RefreshCw, Plus, CheckCircle, AlertTriangle, 
//   Globe, Download, Signal, Clock, PieChart, UserPlus, Eye, 
//   EyeOff, Filter, HardDrive, Terminal, Shield, LogOut, 
//   LogIn, WifiOff, BatteryCharging, Cpu, MemoryStick, 
//   Router, Network, Gauge, Database, Bell, BellOff,
//   ChevronDown, ChevronUp, MoreHorizontal, Trash2, Edit
// } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { ThreeDots } from 'react-loader-spinner';
// import { Line, Bar } from 'react-chartjs-2';
// import { 
//   Chart as ChartJS, 
//   CategoryScale, 
//   LinearScale, 
//   PointElement, 
//   LineElement, 
//   BarElement,
//   Title, 
//   Tooltip, 
//   Legend, 
//   Filler,
//   ArcElement
// } from 'chart.js';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale, 
//   LinearScale, 
//   PointElement, 
//   LineElement,
//   BarElement,
//   Title, 
//   Tooltip, 
//   Legend, 
//   Filler,
//   ArcElement
// );

// // Types
// const RouterTypes = {
//   MIKROTIK: 'mikrotik',
//   OPENWRT: 'openwrt',
//   CISCO: 'cisco',
//   GENERIC: 'generic',
//   TP_LINK: 'tp-link',
//   UBIQUITI: 'ubiquiti'
// };

// const RouterStatus = {
//   CONNECTED: 'connected',
//   DISCONNECTED: 'disconnected',
//   UPDATING: 'updating',
//   ERROR: 'error'
// };

// // Mock Data
// const generateMockRouters = () => [
//   { 
//     id: 1, 
//     name: 'Office Router Alpha', 
//     ip: '192.168.88.1', 
//     type: RouterTypes.MIKROTIK, 
//     port: 8728, 
//     status: RouterStatus.CONNECTED,
//     firmware: 'v6.48.5',
//     model: 'RB4011iGS+',
//     location: 'Main Office',
//     lastSeen: new Date().toISOString()
//   },
//   { 
//     id: 2, 
//     name: 'Cafe Router Beta', 
//     ip: '192.168.1.1', 
//     type: RouterTypes.OPENWRT, 
//     port: 22, 
//     status: RouterStatus.DISCONNECTED,
//     firmware: 'OpenWrt 21.02.3',
//     model: 'Archer C7',
//     location: 'Downtown Cafe',
//     lastSeen: new Date(Date.now() - 86400000).toISOString()
//   },
//   { 
//     id: 3, 
//     name: 'Warehouse Router', 
//     ip: '192.168.2.1', 
//     type: RouterTypes.UBIQUITI, 
//     port: 443, 
//     status: RouterStatus.CONNECTED,
//     firmware: 'v6.0.21',
//     model: 'UniFi Dream Machine',
//     location: 'Warehouse',
//     lastSeen: new Date().toISOString()
//   }
// ];

// const generateMockStats = () => ({
//   cpu: Math.floor(Math.random() * 30) + 30,
//   memory: Math.floor(Math.random() * 50) + 100,
//   clients: Math.floor(Math.random() * 5) + 8,
//   uptime: `${(99 + Math.random()).toFixed(1)}%`,
//   signal: Math.floor(Math.random() * 30) - 80,
//   temperature: Math.floor(Math.random() * 15) + 45,
//   throughput: Math.floor(Math.random() * 50) + 50,
//   disk: Math.floor(Math.random() * 30) + 20
// });

// const generateMockHotspotUsers = () => [
//   { 
//     id: 1, 
//     name: 'john_doe', 
//     plan: 'Basic 5MBps', 
//     ip: '192.168.88.100', 
//     mac: '00:1A:2B:3C:4D:5E',
//     connectedAt: new Date(Date.now() - 3600000).toISOString(),
//     dataUsed: Math.floor(Math.random() * 500) + 100
//   },
//   { 
//     id: 2, 
//     name: 'jane_smith', 
//     plan: 'Premium 20MBps', 
//     ip: '192.168.88.101', 
//     mac: '00:1A:2B:3C:4D:5F',
//     connectedAt: new Date(Date.now() - 7200000).toISOString(),
//     dataUsed: Math.floor(Math.random() * 2000) + 500
//   }
// ];

// const generateStatsHistory = () => {
//   const now = Date.now();
//   return {
//     timestamps: Array(10).fill().map((_, i) => new Date(now - (9 - i) * 60000).toLocaleTimeString()),
//     cpu: Array(10).fill().map(() => Math.floor(Math.random() * 30) + 30),
//     memory: Array(10).fill().map(() => Math.floor(Math.random() * 50) + 100),
//     clients: Array(10).fill().map(() => Math.floor(Math.random() * 5) + 8),
//     throughput: Array(10).fill().map(() => Math.floor(Math.random() * 50) + 50)
//   };
// };

// // Reducer for state management
// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   isRefreshing: false,
//   modals: {
//     addRouter: false,
//     editRouter: false,
//     hotspotConfig: false,
//     users: false,
//     settings: false,
//     notifications: false,
//     bulkActions: false
//   },
//   visibleStats: { 
//     cpu: true, 
//     memory: true, 
//     clients: true, 
//     uptime: true, 
//     signal: true,
//     temperature: false,
//     throughput: true,
//     disk: false
//   },
//   showChart: true,
//   chartType: 'line',
//   routerForm: { 
//     name: '', 
//     ip: '', 
//     type: RouterTypes.MIKROTIK, 
//     port: '8728',
//     username: 'admin',
//     password: '',
//     location: '',
//     notes: ''
//   },
//   hotspotForm: { 
//     ssid: 'SurfZone-WiFi', 
//     landingPage: null, 
//     redirectUrl: 'http://captive.surfzone.local',
//     bandwidthLimit: '10M',
//     sessionTimeout: '60',
//     authMethod: 'mac'
//   },
//   stats: null,
//   hotspotUsers: [],
//   statsHistory: null,
//   filter: 'all',
//   selectedRouters: [],
//   notifications: [],
//   expandedRouter: null
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_ROUTERS':
//       return { ...state, routers: action.payload };
//     case 'SET_ACTIVE_ROUTER':
//       return { ...state, activeRouter: action.payload };
//     case 'SET_LOADING':
//       return { ...state, isLoading: action.payload };
//     case 'SET_REFRESHING':
//       return { ...state, isRefreshing: action.payload };
//     case 'TOGGLE_MODAL':
//       return { 
//         ...state, 
//         modals: { ...state.modals, [action.modal]: !state.modals[action.modal] }
//       };
//     case 'TOGGLE_CHART':
//       return { ...state, showChart: !state.showChart };
//     case 'SET_CHART_TYPE':
//       return { ...state, chartType: action.payload };
//     case 'UPDATE_ROUTER_FORM':
//       return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
//     case 'UPDATE_HOTSPOT_FORM':
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case 'SET_STATS':
//       return { ...state, stats: action.payload };
//     case 'SET_HOTSPOT_USERS':
//       return { ...state, hotspotUsers: action.payload };
//     case 'UPDATE_STATS_HISTORY':
//       return { ...state, statsHistory: action.payload };
//     case 'RESET_ROUTER_FORM':
//       return { ...state, routerForm: initialState.routerForm };
//     case 'SET_FILTER':
//       return { ...state, filter: action.payload };
//     case 'TOGGLE_SELECTED_ROUTER':
//       const selected = state.selectedRouters.includes(action.id)
//         ? state.selectedRouters.filter(id => id !== action.id)
//         : [...state.selectedRouters, action.id];
//       return { ...state, selectedRouters: selected };
//     case 'TOGGLE_STAT': 
//       return { 
//         ...state, 
//         visibleStats: { ...state.visibleStats, [action.stat]: !state.visibleStats[action.stat] } 
//       };
//     case 'ADD_NOTIFICATION':
//       return { 
//         ...state, 
//         notifications: [action.payload, ...state.notifications].slice(0, 50) 
//       };
//     case 'CLEAR_NOTIFICATIONS':
//       return { ...state, notifications: [] };
//     case 'TOGGLE_ROUTER_EXPANDED':
//       return { 
//         ...state, 
//         expandedRouter: state.expandedRouter === action.id ? null : action.id 
//       };
//     case 'UPDATE_ROUTER':
//       return {
//         ...state,
//         routers: state.routers.map(router => 
//           router.id === action.payload.id ? { ...router, ...action.payload.data } : router
//         ),
//         activeRouter: state.activeRouter?.id === action.payload.id ? 
//           { ...state.activeRouter, ...action.payload.data } : state.activeRouter
//       };
//     case 'DELETE_ROUTER':
//       return {
//         ...state,
//         routers: state.routers.filter(router => router.id !== action.id),
//         activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
//         selectedRouters: state.selectedRouters.filter(id => id !== action.id)
//       };
//     default: 
//       return state;
//   }
// };

// // Utility functions
// const getRouterStatusColor = (status) => {
//   switch (status) {
//     case RouterStatus.CONNECTED: return 'bg-green-500/20 text-green-400';
//     case RouterStatus.DISCONNECTED: return 'bg-red-500/20 text-red-400';
//     case RouterStatus.UPDATING: return 'bg-yellow-500/20 text-yellow-400';
//     case RouterStatus.ERROR: return 'bg-purple-500/20 text-purple-400';
//     default: return 'bg-gray-500/20 text-gray-400';
//   }
// };

// const getRouterStatusText = (status) => {
//   switch (status) {
//     case RouterStatus.CONNECTED: return 'Online';
//     case RouterStatus.DISCONNECTED: return 'Offline';
//     case RouterStatus.UPDATING: return 'Updating';
//     case RouterStatus.ERROR: return 'Error';
//     default: return 'Unknown';
//   }
// };

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// };

// const formatTime = (dateString) => {
//   const date = new Date(dateString);
//   return date.toLocaleString();
// };

// const timeSince = (dateString) => {
//   const date = new Date(dateString);
//   const seconds = Math.floor((new Date() - date) / 1000);
  
//   let interval = Math.floor(seconds / 31536000);
//   if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
  
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
  
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
  
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
  
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
  
//   return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
// };

// // Main Component
// const RouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const {
//     routers,
//     activeRouter,
//     isLoading,
//     isRefreshing,
//     modals,
//     visibleStats,
//     showChart,
//     chartType,
//     routerForm,
//     hotspotForm,
//     stats,
//     hotspotUsers,
//     statsHistory,
//     filter,
//     selectedRouters,
//     notifications,
//     expandedRouter
//   } = state;

//   // Simulate API calls with mock data
//   const fetchRouters = useCallback(() => {
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       const mockRouters = generateMockRouters();
//       dispatch({ type: 'SET_ROUTERS', payload: mockRouters });
//       if (!activeRouter && mockRouters.length > 0) {
//         dispatch({ type: 'SET_ACTIVE_ROUTER', payload: mockRouters[0] });
//       }
//       dispatch({ type: 'SET_LOADING', payload: false });
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'success', 
//           message: 'Router list updated', 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 1000);
//   }, [activeRouter]);

//   const fetchRouterStats = useCallback((routerId) => {
//     if (!routerId) return;
    
//     dispatch({ type: 'SET_REFRESHING', payload: true });
//     setTimeout(() => {
//       const newStats = generateMockStats();
//       dispatch({ type: 'SET_STATS', payload: newStats });
      
//       const newHistory = generateStatsHistory();
//       dispatch({ type: 'UPDATE_STATS_HISTORY', payload: newHistory });
      
//       dispatch({ type: 'SET_REFRESHING', payload: false });
//     }, 800);
//   }, []);

//   const fetchHotspotUsers = useCallback((routerId) => {
//     if (!routerId) return;
    
//     setTimeout(() => {
//       const mockUsers = generateMockHotspotUsers();
//       dispatch({ type: 'SET_HOTSPOT_USERS', payload: mockUsers });
//     }, 600);
//   }, []);

//   // Initial fetch and periodic updates
//   useEffect(() => {
//     fetchRouters();
    
//     const routerInterval = setInterval(fetchRouters, 30000);
//     return () => clearInterval(routerInterval);
//   }, [fetchRouters]);

//   useEffect(() => {
//     if (activeRouter) {
//       fetchRouterStats(activeRouter.id);
//       fetchHotspotUsers(activeRouter.id);
      
//       const statsInterval = setInterval(() => fetchRouterStats(activeRouter.id), 5000);
//       return () => clearInterval(statsInterval);
//     }
//   }, [activeRouter, fetchRouterStats, fetchHotspotUsers]);

//   // Actions
//   const addRouter = () => {
//     if (!routerForm.name || !routerForm.ip) {
//       toast.warn('Name and IP are required');
//       return;
//     }
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       const newRouter = { 
//         id: routers.length + 1, 
//         ...routerForm, 
//         port: parseInt(routerForm.port), 
//         status: RouterStatus.CONNECTED,
//         firmware: 'v1.0.0',
//         model: 'Generic',
//         lastSeen: new Date().toISOString()
//       };
      
//       dispatch({ type: 'SET_ROUTERS', payload: [...routers, newRouter] });
//       dispatch({ type: 'SET_ACTIVE_ROUTER', payload: newRouter });
//       dispatch({ type: 'TOGGLE_MODAL', modal: 'addRouter' });
//       dispatch({ type: 'RESET_ROUTER_FORM' });
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success('Router added successfully');
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'success', 
//           message: `Added router: ${newRouter.name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 1000);
//   };

//   const updateRouter = (id, data) => {
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       dispatch({ type: 'UPDATE_ROUTER', payload: { id, data } });
//       dispatch({ type: 'TOGGLE_MODAL', modal: 'editRouter' });
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success('Router updated successfully');
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'success', 
//           message: `Updated router: ${data.name || routers.find(r => r.id === id).name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 800);
//   };

//   const deleteRouter = (id) => {
//     const router = routers.find(r => r.id === id);
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       dispatch({ type: 'DELETE_ROUTER', id });
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success(`Router ${router.name} deleted`);
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'warning', 
//           message: `Deleted router: ${router.name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 800);
//   };

//   const connectToRouter = (routerId) => {
//     const router = routers.find(r => r.id === routerId);
//     if (!router) return;
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       const updatedRouter = { 
//         ...router, 
//         status: RouterStatus.CONNECTED,
//         lastSeen: new Date().toISOString()
//       };
      
//       dispatch({ type: 'UPDATE_ROUTER', payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) {
//         dispatch({ type: 'SET_ACTIVE_ROUTER', payload: updatedRouter });
//       }
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success(`Connected to ${updatedRouter.name}`);
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'success', 
//           message: `Connected to router: ${updatedRouter.name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 800);
//   };

//   const disconnectRouter = (routerId) => {
//     const router = routers.find(r => r.id === routerId);
//     if (!router) return;
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       const updatedRouter = { 
//         ...router, 
//         status: RouterStatus.DISCONNECTED,
//         lastSeen: new Date().toISOString()
//       };
      
//       dispatch({ type: 'UPDATE_ROUTER', payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) {
//         dispatch({ type: 'SET_ACTIVE_ROUTER', payload: updatedRouter });
//       }
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success(`Disconnected ${updatedRouter.name}`);
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'warning', 
//           message: `Disconnected from router: ${updatedRouter.name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 800);
//   };

//   const rebootRouter = (routerId) => {
//     const router = routers.find(r => r.id === routerId);
//     if (!router) return;
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       const updatedRouter = { 
//         ...router, 
//         status: RouterStatus.UPDATING,
//         lastSeen: new Date().toISOString()
//       };
      
//       dispatch({ type: 'UPDATE_ROUTER', payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) {
//         dispatch({ type: 'SET_ACTIVE_ROUTER', payload: updatedRouter });
//       }
      
//       setTimeout(() => {
//         const reconnectedRouter = { 
//           ...updatedRouter, 
//           status: RouterStatus.CONNECTED,
//           lastSeen: new Date().toISOString()
//         };
        
//         dispatch({ type: 'UPDATE_ROUTER', payload: { id: routerId, data: reconnectedRouter } });
//         if (activeRouter?.id === routerId) {
//           dispatch({ type: 'SET_ACTIVE_ROUTER', payload: reconnectedRouter });
//         }
//         dispatch({ type: 'SET_LOADING', payload: false });
        
//         toast.success(`${reconnectedRouter.name} rebooted successfully`);
//         dispatch({ 
//           type: 'ADD_NOTIFICATION', 
//           payload: { 
//             id: Date.now(), 
//             type: 'info', 
//             message: `Rebooted router: ${reconnectedRouter.name}`, 
//             timestamp: new Date().toISOString() 
//           } 
//         });
//       }, 2000);
//     }, 800);
//   };

//   const configureHotspot = () => {
//     if (!hotspotForm.landingPage) {
//       toast.warn('Please upload a landing page');
//       return;
//     }
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       dispatch({ type: 'TOGGLE_MODAL', modal: 'hotspotConfig' });
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success('Hotspot configured successfully');
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'success', 
//           message: `Configured hotspot on ${activeRouter.name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 1000);
//   };

//   const exportReport = () => {
//     if (!activeRouter) return;
    
//     const report = {
//       router: activeRouter.name,
//       status: activeRouter.status,
//       stats,
//       hotspotUsers: hotspotUsers.map(u => ({
//         name: u.name,
//         plan: u.plan,
//         connectedAt: u.connectedAt,
//         dataUsed: formatBytes(u.dataUsed * 1024 * 1024) // Convert MB to bytes
//       })),
//       timestamp: new Date().toISOString(),
//     };
    
//     const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${activeRouter.name.replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
    
//     toast.success('Report exported successfully');
//     dispatch({ 
//       type: 'ADD_NOTIFICATION', 
//       payload: { 
//         id: Date.now(), 
//         type: 'info', 
//         message: `Exported report for ${activeRouter.name}`, 
//         timestamp: new Date().toISOString() 
//       } 
//     });
//   };

//   const disconnectHotspotUser = (userId) => {
//     const user = hotspotUsers.find(u => u.id === userId);
//     if (!user) return;
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       dispatch({ 
//         type: 'SET_HOTSPOT_USERS', 
//         payload: hotspotUsers.filter(u => u.id !== userId) 
//       });
//       dispatch({ type: 'SET_LOADING', payload: false });
      
//       toast.success(`Disconnected user ${user.name}`);
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'warning', 
//           message: `Disconnected hotspot user: ${user.name}`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 600);
//   };

//   const performBulkAction = (action) => {
//     if (selectedRouters.length === 0) {
//       toast.warn('No routers selected');
//       return;
//     }
    
//     dispatch({ type: 'SET_LOADING', payload: true });
//     setTimeout(() => {
//       selectedRouters.forEach(id => {
//         const router = routers.find(r => r.id === id);
//         if (!router) return;
        
//         let updatedRouter;
//         switch (action) {
//           case 'connect':
//             updatedRouter = { ...router, status: RouterStatus.CONNECTED };
//             break;
//           case 'disconnect':
//             updatedRouter = { ...router, status: RouterStatus.DISCONNECTED };
//             break;
//           case 'reboot':
//             updatedRouter = { ...router, status: RouterStatus.UPDATING };
//             setTimeout(() => {
//               dispatch({ 
//                 type: 'UPDATE_ROUTER', 
//                 payload: { 
//                   id, 
//                   data: { ...updatedRouter, status: RouterStatus.CONNECTED } 
//                 } 
//               });
//             }, 2000);
//             break;
//           default:
//             return;
//         }
        
//         dispatch({ type: 'UPDATE_ROUTER', payload: { id, data: updatedRouter } });
//         if (activeRouter?.id === id) {
//           dispatch({ type: 'SET_ACTIVE_ROUTER', payload: updatedRouter });
//         }
//       });
      
//       dispatch({ type: 'SET_LOADING', payload: false });
//       dispatch({ type: 'TOGGLE_MODAL', modal: 'bulkActions' });
      
//       toast.success(`Bulk ${action} completed for ${selectedRouters.length} routers`);
//       dispatch({ 
//         type: 'ADD_NOTIFICATION', 
//         payload: { 
//           id: Date.now(), 
//           type: 'info', 
//           message: `Performed ${action} on ${selectedRouters.length} routers`, 
//           timestamp: new Date().toISOString() 
//         } 
//       });
//     }, 1000);
//   };

//   const filteredRouters = filter === 'all' 
//     ? routers 
//     : routers.filter(r => r.status === filter);

//   const chartData = {
//     labels: statsHistory?.timestamps || Array(10).fill().map((_, i) => `T-${9 - i}`),
//     datasets: [
//       { 
//         label: 'CPU (%)', 
//         data: statsHistory?.cpu || Array(10).fill(0), 
//         borderColor: '#8B5CF6', 
//         backgroundColor: 'rgba(139, 92, 246, 0.3)', 
//         fill: true, 
//         tension: 0.4,
//         yAxisID: 'y'
//       },
//       { 
//         label: 'Memory (MB)', 
//         data: statsHistory?.memory || Array(10).fill(0), 
//         borderColor: '#10B981', 
//         backgroundColor: 'rgba(16, 185, 129, 0.3)', 
//         fill: true, 
//         tension: 0.4,
//         yAxisID: 'y1'
//       },
//       { 
//         label: 'Clients', 
//         data: statsHistory?.clients || Array(10).fill(0), 
//         borderColor: '#F59E0B', 
//         backgroundColor: 'rgba(245, 158, 11, 0.3)', 
//         fill: true, 
//         tension: 0.4,
//         yAxisID: 'y2'
//       },
//       { 
//         label: 'Throughput (Mbps)', 
//         data: statsHistory?.throughput || Array(10).fill(0), 
//         borderColor: '#3B82F6', 
//         backgroundColor: 'rgba(59, 130, 246, 0.3)', 
//         fill: true, 
//         tension: 0.4,
//         yAxisID: 'y3'
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: {
//       mode: 'index',
//       intersect: false,
//     },
//     scales: {
//       y: { 
//         type: 'linear',
//         display: true,
//         position: 'left',
//         title: { display: true, text: 'CPU (%)' },
//         grid: { color: 'rgba(255, 255, 255, 0.1)' },
//         min: 0,
//         max: 100
//       },
//       y1: {
//         type: 'linear',
//         display: true,
//         position: 'right',
//         title: { display: true, text: 'Memory (MB)' },
//         grid: { drawOnChartArea: false },
//         min: 0,
//         max: 200
//       },
//       y2: {
//         type: 'linear',
//         display: false,
//         min: 0
//       },
//       y3: {
//         type: 'linear',
//         display: false,
//         min: 0,
//         max: 100
//       },
//       x: { 
//         grid: { color: 'rgba(255, 255, 255, 0.1)' },
//         ticks: {
//           maxRotation: 45,
//           minRotation: 45
//         }
//       },
//     },
//     plugins: {
//       legend: { 
//         labels: { 
//           color: '#E5E7EB',
//           usePointStyle: true,
//           pointStyle: 'circle',
//           padding: 20
//         },
//         position: 'bottom'
//       },
//       tooltip: { 
//         backgroundColor: '#1F2937', 
//         titleColor: '#fff', 
//         bodyColor: '#fff',
//         usePointStyle: true,
//         callbacks: {
//           label: (context) => {
//             let label = context.dataset.label || '';
//             if (label) {
//               label += ': ';
//             }
//             if (context.parsed.y !== null) {
//               label += context.dataset.label.includes('Throughput') 
//                 ? `${context.parsed.y} Mbps`
//                 : context.dataset.label.includes('Memory')
//                   ? `${context.parsed.y} MB`
//                   : context.parsed.y;
//             }
//             return label;
//           }
//         }
//       },
//     },
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 min-h-screen font-sans text-gray-200">
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         theme="dark" 
//         pauseOnHover
//         newestOnTop
//       />

//       {/* Header */}
//       <header className="flex justify-between items-center mb-8">
//         <div className="flex items-center space-x-4">
//           <div className="relative">
//             <Server className="w-10 h-10 text-indigo-400" />
//             {notifications.length > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                 {notifications.length}
//               </span>
//             )}
//           </div>
//           <div>
//             <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
//               Router Control Hub
//             </h1>
//             <p className="text-sm text-gray-400">
//               {routers.length} routers managed • {routers.filter(r => r.status === RouterStatus.CONNECTED).length} online
//             </p>
//           </div>
//         </div>
//         <div className="flex space-x-3">
//           <Button
//             onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'notifications' })}
//             label="Notifications"
//             icon={<Bell />}
//             color="bg-gray-700 hover:bg-gray-600"
//             badge={notifications.length}
//           />
//           <Button
//             onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'addRouter' })}
//             label="Add Router"
//             icon={<Plus />}
//             color="bg-indigo-600 hover:bg-indigo-500"
//           />
//           {selectedRouters.length > 0 && (
//             <Button
//               onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'bulkActions' })}
//               label="Bulk Actions"
//               icon={<MoreHorizontal />}
//               color="bg-purple-600 hover:bg-purple-500"
//             />
//           )}
//         </div>
//       </header>

//       {/* Main Layout */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Router Sidebar */}
//         <aside className="lg:col-span-3 bg-gray-800 rounded-2xl shadow-lg p-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-700">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold flex items-center">
//               <Wifi className="w-6 h-6 mr-2 text-indigo-400" /> Routers
//             </h2>
//             <div className="flex space-x-2">
//               <select
//                 value={filter}
//                 onChange={e => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
//                 className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
//               >
//                 <option value="all">All</option>
//                 <option value={RouterStatus.CONNECTED}>Online</option>
//                 <option value={RouterStatus.DISCONNECTED}>Offline</option>
//                 <option value={RouterStatus.UPDATING}>Updating</option>
//                 <option value={RouterStatus.ERROR}>Error</option>
//               </select>
//               <Button
//                 onClick={fetchRouters}
//                 icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
//                 color="bg-gray-700 hover:bg-gray-600"
//                 compact
//               />
//             </div>
//           </div>
          
//           {isLoading && (
//             <div className="flex justify-center py-6">
//               <ThreeDots color="#6366F1" height={50} width={50} />
//             </div>
//           )}
          
//           {!isLoading && filteredRouters.length === 0 && (
//             <p className="text-gray-400 text-center py-6 flex items-center justify-center">
//               <AlertTriangle className="w-5 h-5 mr-2" /> No routers found
//             </p>
//           )}
          
//           {!isLoading && filteredRouters.map(router => (
//             <motion.div
//               key={router.id}
//               onClick={() => dispatch({ type: 'SET_ACTIVE_ROUTER', payload: router })}
//               whileHover={{ scale: 1.03 }}
//               className={`p-4 mb-4 rounded-lg cursor-pointer transition-all duration-300 ${router.status === RouterStatus.CONNECTED ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'} ${
//                 activeRouter?.id === router.id ? 'border-l-4 border-indigo-500' : ''
//               }`}
//             >
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={selectedRouters.includes(router.id)}
//                   onChange={() => dispatch({ type: 'TOGGLE_SELECTED_ROUTER', id: router.id })}
//                   className="mr-3 accent-indigo-500"
//                   onClick={e => e.stopPropagation()}
//                 />
//                 <div className="flex-1 min-w-0">
//                   <p className="font-medium text-gray-200 truncate">{router.name}</p>
//                   <p className="text-xs text-gray-400 truncate">{router.ip}:{router.port}</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {router.model} • {router.firmware}
//                   </p>
//                 </div>
//                 <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRouterStatusColor(router.status)}`}>
//                   {getRouterStatusText(router.status)}
//                 </span>
//               </div>
              
//               {expandedRouter === router.id && (
//                 <motion.div 
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400"
//                 >
//                   <p><strong>Location:</strong> {router.location || 'Not specified'}</p>
//                   <p><strong>Last seen:</strong> {timeSince(router.lastSeen)}</p>
//                   <div className="flex space-x-2 mt-2">
//                     <button 
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         dispatch({ type: 'TOGGLE_MODAL', modal: 'editRouter' });
//                         dispatch({ 
//                           type: 'UPDATE_ROUTER_FORM', 
//                           payload: { 
//                             name: router.name,
//                             ip: router.ip,
//                             port: router.port.toString(),
//                             type: router.type,
//                             location: router.location,
//                             notes: router.notes
//                           } 
//                         });
//                       }}
//                       className="text-indigo-400 hover:text-indigo-300 flex items-center"
//                     >
//                       <Edit className="w-3 h-3 mr-1" /> Edit
//                     </button>
//                     <button 
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         deleteRouter(router.id);
//                       }}
//                       className="text-red-400 hover:text-red-300 flex items-center"
//                     >
//                       <Trash2 className="w-3 h-3 mr-1" /> Delete
//                     </button>
//                     {router.status === RouterStatus.CONNECTED && (
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           rebootRouter(router.id);
//                         }}
//                         className="text-yellow-400 hover:text-yellow-300 flex items-center"
//                       >
//                         <BatteryCharging className="w-3 h-3 mr-1" /> Reboot
//                       </button>
//                     )}
//                   </div>
//                 </motion.div>
//               )}
              
//               <button 
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   dispatch({ type: 'TOGGLE_ROUTER_EXPANDED', id: router.id });
//                 }}
//                 className="w-full text-center mt-2 text-gray-500 hover:text-gray-400 text-xs flex items-center justify-center"
//               >
//                 {expandedRouter === router.id ? (
//                   <ChevronUp className="w-4 h-4" />
//                 ) : (
//                   <ChevronDown className="w-4 h-4" />
//                 )}
//               </button>
//             </motion.div>
//           ))}
//         </aside>

//         {/* Router Dashboard */}
//         <main className="lg:col-span-9 bg-gray-800 rounded-2xl shadow-lg p-6">
//           {activeRouter ? (
//             <>
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h2 className="text-2xl font-semibold flex items-center">
//                     <Server className="w-6 h-6 mr-2 text-indigo-400" /> {activeRouter.name}
//                   </h2>
//                   <p className="text-sm text-gray-400">
//                     {activeRouter.model} • {activeRouter.firmware} • {activeRouter.location}
//                   </p>
//                 </div>
//                 <div className="flex space-x-3">
//                   <Button
//                     onClick={() => activeRouter.status === RouterStatus.CONNECTED ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id)}
//                     label={activeRouter.status === RouterStatus.CONNECTED ? 'Disconnect' : 'Connect'}
//                     icon={activeRouter.status === RouterStatus.CONNECTED ? <LogOut /> : <LogIn />}
//                     color={activeRouter.status === RouterStatus.CONNECTED ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}
//                   />
//                   <Button
//                     onClick={() => fetchRouterStats(activeRouter.id)}
//                     label="Refresh"
//                     icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
//                     color="bg-gray-600 hover:bg-gray-500"
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'hotspotConfig' })}
//                     label="Hotspot"
//                     icon={<Globe />}
//                     color="bg-indigo-600 hover:bg-indigo-500"
//                     disabled={activeRouter.status !== RouterStatus.CONNECTED}
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'users' })}
//                     label="Users"
//                     icon={<UserPlus />}
//                     color="bg-teal-600 hover:bg-teal-500"
//                     disabled={activeRouter.status !== RouterStatus.CONNECTED}
//                   />
//                   <Button
//                     onClick={exportReport}
//                     label="Export"
//                     icon={<Download />}
//                     color="bg-purple-600 hover:bg-purple-500"
//                   />
//                   <Button
//                     onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'settings' })}
//                     label="Settings"
//                     icon={<Settings />}
//                     color="bg-gray-600 hover:bg-gray-500"
//                   />
//                 </div>
//               </div>

//               {/* Stats Overview */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                 {visibleStats.cpu && (
//                   <StatCard 
//                     label="CPU Usage" 
//                     value={`${stats?.cpu?.toFixed(1) || 0}%`} 
//                     icon={<Cpu className="text-purple-400" />} 
//                     trend={statsHistory?.cpu ? statsHistory.cpu[statsHistory.cpu.length - 1] - statsHistory.cpu[0] : 0}
//                   />
//                 )}
//                 {visibleStats.memory && (
//                   <StatCard 
//                     label="Memory Free" 
//                     value={`${stats?.memory?.toFixed(0) || 0} MB`} 
//                     icon={<MemoryStick className="text-green-400" />} 
//                     trend={statsHistory?.memory ? statsHistory.memory[0] - statsHistory.memory[statsHistory.memory.length - 1] : 0}
//                   />
//                 )}
//                 {visibleStats.clients && (
//                   <StatCard 
//                     label="Active Clients" 
//                     value={stats?.clients || 0} 
//                     icon={<Users className="text-yellow-400" />} 
//                     trend={statsHistory?.clients ? statsHistory.clients[statsHistory.clients.length - 1] - statsHistory.clients[0] : 0}
//                   />
//                 )}
//                 {visibleStats.uptime && (
//                   <StatCard 
//                     label="Uptime" 
//                     value={stats?.uptime || '0%'} 
//                     icon={<Clock className="text-blue-400" />} 
//                   />
//                 )}
//                 {visibleStats.signal && (
//                   <StatCard 
//                     label="Signal" 
//                     value={`${stats?.signal || 0} dBm`} 
//                     icon={<Signal className="text-indigo-400" />} 
//                   />
//                 )}
//                 {visibleStats.throughput && (
//                   <StatCard 
//                     label="Throughput" 
//                     value={`${stats?.throughput || 0} Mbps`} 
//                     icon={<Network className="text-cyan-400" />} 
//                     trend={statsHistory?.throughput ? statsHistory.throughput[statsHistory.throughput.length - 1] - statsHistory.throughput[0] : 0}
//                   />
//                 )}
//                 {visibleStats.temperature && (
//                   <StatCard 
//                     label="Temperature" 
//                     value={`${stats?.temperature || 0}°C`} 
//                     icon={<Gauge className="text-red-400" />} 
//                   />
//                 )}
//                 {visibleStats.disk && (
//                   <StatCard 
//                     label="Disk Usage" 
//                     value={`${stats?.disk || 0}%`} 
//                     icon={<HardDrive className="text-orange-400" />} 
//                   />
//                 )}
//               </div>

//               {/* Real-Time Chart */}
//               <div className="bg-gray-700 p-4 rounded-xl mb-6 shadow-inner">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-medium flex items-center">
//                     <PieChart className="w-5 h-5 mr-2 text-indigo-400" /> Performance Trends
//                   </h3>
//                   <div className="flex space-x-2">
//                     <select
//                       value={chartType}
//                       onChange={e => dispatch({ type: 'SET_CHART_TYPE', payload: e.target.value })}
//                       className="p-2 bg-gray-600 border border-gray-500 rounded-md text-gray-200 text-sm"
//                     >
//                       <option value="line">Line Chart</option>
//                       <option value="bar">Bar Chart</option>
//                     </select>
//                     <Button
//                       onClick={() => dispatch({ type: 'TOGGLE_CHART' })}
//                       label={showChart ? 'Hide' : 'Show'}
//                       icon={showChart ? <EyeOff /> : <Eye />}
//                       color="bg-gray-600 hover:bg-gray-500"
//                     />
//                   </div>
//                 </div>
//                 {showChart && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     className="h-80"
//                   >
//                     {chartType === 'line' ? (
//                       <Line data={chartData} options={chartOptions} />
//                     ) : (
//                       <Bar data={chartData} options={chartOptions} />
//                     )}
//                   </motion.div>
//                 )}
//               </div>

//               {/* Router Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 <div className="bg-gray-700 p-4 rounded-xl shadow-inner">
//                   <h3 className="text-lg font-medium mb-3 flex items-center">
//                     <Terminal className="w-5 h-5 mr-2 text-indigo-400" /> Router Details
//                   </h3>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div>
//                       <p className="text-gray-400">IP Address</p>
//                       <p className="text-gray-200">{activeRouter.ip}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400">Port</p>
//                       <p className="text-gray-200">{activeRouter.port}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400">Type</p>
//                       <p className="text-gray-200 capitalize">{activeRouter.type}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400">Status</p>
//                       <p className={`inline-flex items-center ${getRouterStatusColor(activeRouter.status)} px-2 py-1 rounded-full text-xs`}>
//                         {getRouterStatusText(activeRouter.status)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400">Last Seen</p>
//                       <p className="text-gray-200">{timeSince(activeRouter.lastSeen)}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400">Firmware</p>
//                       <p className="text-gray-200">{activeRouter.firmware}</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-gray-700 p-4 rounded-xl shadow-inner">
//                   <h3 className="text-lg font-medium mb-3 flex items-center">
//                     <Shield className="w-5 h-5 mr-2 text-indigo-400" /> Hotspot Status
//                   </h3>
//                   {activeRouter.status === RouterStatus.CONNECTED ? (
//                     <div className="grid grid-cols-2 gap-2 text-sm">
//                       <div>
//                         <p className="text-gray-400">Active Users</p>
//                         <p className="text-gray-200">{hotspotUsers.length}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400">Data Usage</p>
//                         <p className="text-gray-200">
//                           {formatBytes(hotspotUsers.reduce((sum, user) => sum + user.dataUsed * 1024 * 1024, 0))}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400">Avg. Session</p>
//                         <p className="text-gray-200">
//                           {hotspotUsers.length > 0 
//                             ? Math.floor(hotspotUsers.reduce((sum, user) => {
//                                 const sessionTime = (new Date() - new Date(user.connectedAt)) / 3600000;
//                                 return sum + sessionTime;
//                               }, 0) / hotspotUsers.length * 10) / 10 + 'h'
//                             : 'N/A'}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400">Plans</p>
//                         <p className="text-gray-200">
//                           {[...new Set(hotspotUsers.map(u => u.plan))].join(', ') || 'None'}
//                         </p>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center py-4 text-gray-400 flex flex-col items-center">
//                       <WifiOff className="w-8 h-8 mb-2" />
//                       <p>Hotspot not available</p>
//                       <p className="text-sm">Connect to router to enable hotspot</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-12">
//               <AlertTriangle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
//               <p className="text-gray-400 text-lg">No router selected</p>
//               <p className="text-gray-500">Add or select a router to start managing</p>
//               <Button
//                 onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'addRouter' })}
//                 label="Add Router"
//                 icon={<Plus />}
//                 color="bg-indigo-600 hover:bg-indigo-500 mt-4"
//               />
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Add Router Modal */}
//       <Modal 
//         isOpen={modals.addRouter} 
//         title="Add New Router" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'addRouter' })}
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">Connect your router effortlessly.</p>
//           <InputField
//             label="Router Name"
//             value={routerForm.name}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { name: e.target.value } })}
//             placeholder="e.g., Office Router"
//             required
//           />
//           <InputField
//             label="IP Address"
//             value={routerForm.ip}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { ip: e.target.value } })}
//             placeholder="e.g., 192.168.88.1"
//             required
//           />
//           <InputField
//             label="Port"
//             type="number"
//             value={routerForm.port}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { port: e.target.value } })}
//             placeholder="8728"
//             required
//           />
//           <InputField
//             label="Username"
//             value={routerForm.username}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { username: e.target.value } })}
//             placeholder="admin"
//           />
//           <InputField
//             label="Password"
//             type="password"
//             value={routerForm.password}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { password: e.target.value } })}
//             placeholder="••••••••"
//           />
//           <SelectField
//             label="Router Type"
//             value={routerForm.type}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { type: e.target.value } })}
//             options={Object.entries(RouterTypes).map(([key, value]) => ({
//               value,
//               label: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
//             }))}
//           />
//           <InputField
//             label="Location"
//             value={routerForm.location}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { location: e.target.value } })}
//             placeholder="e.g., Main Office"
//           />
//           <Button
//             onClick={addRouter}
//             label={isLoading ? 'Adding...' : 'Add & Connect'}
//             icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />}
//             color="bg-indigo-600 hover:bg-indigo-500"
//             disabled={isLoading || !routerForm.name || !routerForm.ip}
//             fullWidth
//           />
//         </div>
//       </Modal>

//       {/* Edit Router Modal */}
//       <Modal 
//         isOpen={modals.editRouter} 
//         title="Edit Router" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'editRouter' })}
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">Update router configuration.</p>
//           <InputField
//             label="Router Name"
//             value={routerForm.name}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { name: e.target.value } })}
//             placeholder="e.g., Office Router"
//             required
//           />
//           <InputField
//             label="IP Address"
//             value={routerForm.ip}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { ip: e.target.value } })}
//             placeholder="e.g., 192.168.88.1"
//             required
//           />
//           <InputField
//             label="Port"
//             type="number"
//             value={routerForm.port}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { port: e.target.value } })}
//             placeholder="8728"
//             required
//           />
//           <InputField
//             label="Username"
//             value={routerForm.username}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { username: e.target.value } })}
//             placeholder="admin"
//           />
//           <InputField
//             label="Password"
//             type="password"
//             value={routerForm.password}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { password: e.target.value } })}
//             placeholder="••••••••"
//           />
//           <SelectField
//             label="Router Type"
//             value={routerForm.type}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { type: e.target.value } })}
//             options={Object.entries(RouterTypes).map(([key, value]) => ({
//               value,
//               label: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
//             }))}
//           />
//           <InputField
//             label="Location"
//             value={routerForm.location}
//             onChange={e => dispatch({ type: 'UPDATE_ROUTER_FORM', payload: { location: e.target.value } })}
//             placeholder="e.g., Main Office"
//           />
//           <div className="flex space-x-3">
//             <Button
//               onClick={() => {
//                 updateRouter(activeRouter.id, {
//                   name: routerForm.name,
//                   ip: routerForm.ip,
//                   port: parseInt(routerForm.port),
//                   type: routerForm.type,
//                   location: routerForm.location
//                 });
//               }}
//               label={isLoading ? 'Saving...' : 'Save Changes'}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
//               color="bg-indigo-600 hover:bg-indigo-500"
//               disabled={isLoading || !routerForm.name || !routerForm.ip}
//               fullWidth
//             />
//             <Button
//               onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'editRouter' })}
//               label="Cancel"
//               icon={<X />}
//               color="bg-gray-600 hover:bg-gray-500"
//               fullWidth
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Hotspot Configuration Modal */}
//       <Modal 
//         isOpen={modals.hotspotConfig} 
//         title="Configure Hotspot" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'hotspotConfig' })}
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">Set up a Wi-Fi hotspot for your clients.</p>
//           <InputField
//             label="Wi-Fi SSID"
//             value={hotspotForm.ssid}
//             onChange={e => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { ssid: e.target.value } })}
//             placeholder="e.g., SurfZone-WiFi"
//             required
//           />
//           <InputField
//             label="Redirect URL"
//             value={hotspotForm.redirectUrl}
//             onChange={e => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { redirectUrl: e.target.value } })}
//             placeholder="e.g., http://captive.surfzone.local"
//             required
//           />
//           <SelectField
//             label="Authentication Method"
//             value={hotspotForm.authMethod}
//             onChange={e => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { authMethod: e.target.value } })}
//             options={[
//               { value: 'mac', label: 'MAC Address' },
//               { value: 'voucher', label: 'Voucher' },
//               { value: 'sms', label: 'SMS' },
//               { value: 'social', label: 'Social Media' }
//             ]}
//           />
//           <InputField
//             label="Bandwidth Limit"
//             value={hotspotForm.bandwidthLimit}
//             onChange={e => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { bandwidthLimit: e.target.value } })}
//             placeholder="e.g., 10M"
//           />
//           <InputField
//             label="Session Timeout (minutes)"
//             type="number"
//             value={hotspotForm.sessionTimeout}
//             onChange={e => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { sessionTimeout: e.target.value } })}
//             placeholder="60"
//           />
//           <div>
//             <label className="block text-sm font-medium text-gray-300 mb-1">Landing Page</label>
//             <div className="flex items-center">
//               <label className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 cursor-pointer hover:bg-gray-600 transition">
//                 <input
//                   type="file"
//                   accept=".html,.htm"
//                   onChange={e => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { landingPage: e.target.files[0] } })}
//                   className="hidden"
//                 />
//                 {hotspotForm.landingPage ? hotspotForm.landingPage.name : 'Choose file...'}
//               </label>
//               {hotspotForm.landingPage && (
//                 <button
//                   onClick={() => dispatch({ type: 'UPDATE_HOTSPOT_FORM', payload: { landingPage: null } })}
//                   className="ml-2 p-2 text-red-400 hover:text-red-300"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               )}
//             </div>
//             <p className="text-xs text-gray-500 mt-1">HTML file for the captive portal</p>
//           </div>
//           <Button
//             onClick={configureHotspot}
//             label={isLoading ? 'Configuring...' : 'Setup Hotspot'}
//             icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />}
//             color="bg-indigo-600 hover:bg-indigo-500"
//             disabled={isLoading || !hotspotForm.landingPage}
//             fullWidth
//           />
//         </div>
//       </Modal>

//       {/* Hotspot Users Modal */}
//       <Modal 
//         isOpen={modals.users} 
//         title="Hotspot Users" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'users' })}
//         size="lg"
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">Active users on the hotspot.</p>
//           {hotspotUsers.length === 0 ? (
//             <div className="text-center py-8">
//               <Users className="w-12 h-12 mx-auto text-gray-500 mb-3" />
//               <p className="text-gray-400">No active users</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Connected</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Used</th>
//                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-gray-800 divide-y divide-gray-700">
//                   {hotspotUsers.map(user => (
//                     <tr key={user.id}>
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-200">{user.name}</div>
//                         <div className="text-xs text-gray-400">{user.mac}</div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.plan}</td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.ip}</td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{timeSince(user.connectedAt)}</td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{formatBytes(user.dataUsed * 1024 * 1024)}</td>
//                       <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
//                         <button
//                           onClick={() => disconnectHotspotUser(user.id)}
//                           className="text-red-400 hover:text-red-300"
//                           disabled={isLoading}
//                         >
//                           <LogOut className="w-5 h-5" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </Modal>

//       {/* Settings Modal */}
//       <Modal 
//         isOpen={modals.settings} 
//         title="Dashboard Settings" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'settings' })}
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">Customize visible stats and dashboard preferences.</p>
          
//           <div className="bg-gray-700 p-4 rounded-lg">
//             <h4 className="text-sm font-medium text-gray-300 mb-3">Visible Statistics</h4>
//             <div className="grid grid-cols-2 gap-3">
//               {Object.entries(visibleStats).map(([stat, isVisible]) => (
//                 <div key={stat} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={`stat-${stat}`}
//                     checked={isVisible}
//                     onChange={() => dispatch({ type: 'TOGGLE_STAT', stat })}
//                     className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
//                   />
//                   <label htmlFor={`stat-${stat}`} className="ml-2 block text-sm text-gray-200 capitalize">
//                     {stat.replace(/([A-Z])/g, ' $1')}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           <div className="bg-gray-700 p-4 rounded-lg">
//             <h4 className="text-sm font-medium text-gray-300 mb-3">Chart Preferences</h4>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">Default Chart Type</label>
//                 <select
//                   value={chartType}
//                   onChange={e => dispatch({ type: 'SET_CHART_TYPE', payload: e.target.value })}
//                   className="block w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-gray-200 text-sm"
//                 >
//                   <option value="line">Line Chart</option>
//                   <option value="bar">Bar Chart</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm text-gray-300 mb-1">Refresh Interval</label>
//                 <select
//                   defaultValue="5"
//                   className="block w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-gray-200 text-sm"
//                 >
//                   <option value="1">1 second</option>
//                   <option value="5">5 seconds</option>
//                   <option value="10">10 seconds</option>
//                   <option value="30">30 seconds</option>
//                 </select>
//               </div>
//             </div>
//           </div>
          
//           <Button
//             onClick={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'settings' })}
//             label="Save Settings"
//             icon={<CheckCircle />}
//             color="bg-indigo-600 hover:bg-indigo-500"
//             fullWidth
//           />
//         </div>
//       </Modal>

//       {/* Notifications Modal */}
//       <Modal 
//         isOpen={modals.notifications} 
//         title="Notifications" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'notifications' })}
//         size="lg"
//       >
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <p className="text-sm text-gray-400">Recent system notifications</p>
//             <button
//               onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
//               className="text-sm text-indigo-400 hover:text-indigo-300"
//             >
//               Clear All
//             </button>
//           </div>
          
//           {notifications.length === 0 ? (
//             <div className="text-center py-8">
//               <BellOff className="w-12 h-12 mx-auto text-gray-500 mb-3" />
//               <p className="text-gray-400">No notifications</p>
//             </div>
//           ) : (
//             <div className="max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-700">
//               {notifications.map(notification => (
//                 <div 
//                   key={notification.id} 
//                   className={`p-3 rounded-md flex items-start ${
//                     notification.type === 'error' ? 'bg-red-900/30' :
//                     notification.type === 'warning' ? 'bg-yellow-900/30' :
//                     notification.type === 'info' ? 'bg-blue-900/30' :
//                     'bg-green-900/30'
//                   }`}
//                 >
//                   <div className={`mr-3 mt-0.5 ${
//                     notification.type === 'error' ? 'text-red-400' :
//                     notification.type === 'warning' ? 'text-yellow-400' :
//                     notification.type === 'info' ? 'text-blue-400' :
//                     'text-green-400'
//                   }`}>
//                     {notification.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
//                      notification.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
//                      notification.type === 'info' ? <Info className="w-5 h-5" /> :
//                      <CheckCircle className="w-5 h-5" />}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-200">{notification.message}</p>
//                     <p className="text-xs text-gray-400">{timeSince(notification.timestamp)}</p>
//                   </div>
//                   <button 
//                     onClick={() => {
//                       dispatch({ 
//                         type: 'SET_NOTIFICATIONS', 
//                         payload: notifications.filter(n => n.id !== notification.id) 
//                       });
//                     }}
//                     className="text-gray-400 hover:text-gray-200 ml-2"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </Modal>

//       {/* Bulk Actions Modal */}
//       <Modal 
//         isOpen={modals.bulkActions} 
//         title="Bulk Actions" 
//         onClose={() => dispatch({ type: 'TOGGLE_MODAL', modal: 'bulkActions' })}
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">
//             Perform actions on {selectedRouters.length} selected routers
//           </p>
          
//           <div className="grid grid-cols-2 gap-3">
//             <Button
//               onClick={() => performBulkAction('connect')}
//               label="Connect All"
//               icon={<LogIn />}
//               color="bg-green-600 hover:bg-green-500"
//               fullWidth
//             />
//             <Button
//               onClick={() => performBulkAction('disconnect')}
//               label="Disconnect All"
//               icon={<LogOut />}
//               color="bg-red-600 hover:bg-red-500"
//               fullWidth
//             />
//             <Button
//               onClick={() => performBulkAction('reboot')}
//               label="Reboot All"
//               icon={<BatteryCharging />}
//               color="bg-yellow-600 hover:bg-yellow-500"
//               fullWidth
//             />
//             <Button
//               onClick={() => {
//                 selectedRouters.forEach(id => deleteRouter(id));
//                 dispatch({ type: 'TOGGLE_MODAL', modal: 'bulkActions' });
//               }}
//               label="Delete All"
//               icon={<Trash2 />}
//               color="bg-gray-600 hover:bg-gray-500"
//               fullWidth
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// // Reusable Components
// const StatCard = ({ label, value, icon, trend }) => (
//   <motion.div
//     whileHover={{ y: -5 }}
//     className="p-4 bg-gray-700 rounded-xl shadow-md transition-all duration-300 relative overflow-hidden"
//   >
//     <div className="flex items-center">
//       {React.cloneElement(icon, { className: 'w-8 h-8 mr-3' })}
//       <div className="flex-1 min-w-0">
//         <p className="text-sm text-gray-400 truncate">{label}</p>
//         <p className="text-xl font-semibold text-gray-200 truncate">{value}</p>
//       </div>
//     </div>
//     {trend !== undefined && (
//       <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${
//         trend > 0 ? 'bg-red-500/20 text-red-400' : 
//         trend < 0 ? 'bg-green-500/20 text-green-400' : 
//         'bg-gray-500/20 text-gray-400'
//       }`}>
//         {trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)}
//       </div>
//     )}
//   </motion.div>
// );

// const Button = ({ 
//   onClick, 
//   label, 
//   icon, 
//   color, 
//   disabled, 
//   compact, 
//   fullWidth, 
//   badge 
// }) => (
//   <motion.button
//     whileHover={{ scale: disabled ? 1 : 1.05 }}
//     whileTap={{ scale: disabled ? 1 : 0.95 }}
//     onClick={onClick}
//     disabled={disabled}
//     className={`${color} ${compact ? 'p-2' : 'px-4 py-2'} ${
//       fullWidth ? 'w-full' : ''
//     } text-white rounded-lg flex items-center justify-center text-sm font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed space-x-2 relative`}
//   >
//     {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? 'mr-1' : ''}` })}
//     {label && <span>{label}</span>}
//     {badge > 0 && (
//       <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//         {badge}
//       </span>
//     )}
//   </motion.button>
// );

// const Modal = ({ 
//   isOpen, 
//   title, 
//   onClose, 
//   children, 
//   size = 'md' 
// }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           className={`bg-gray-800 p-6 rounded-2xl shadow-2xl ${
//             size === 'sm' ? 'w-full max-w-md' :
//             size === 'md' ? 'w-full max-w-xl' :
//             'w-full max-w-4xl'
//           }`}
//         >
//           <div className="flex justify-between items-center mb-5">
//             <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
//             <button 
//               onClick={onClose} 
//               className="text-gray-400 hover:text-gray-200"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//           {children}
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// const InputField = ({ 
//   label, 
//   value, 
//   onChange, 
//   type = 'text', 
//   placeholder, 
//   required = false 
// }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-300 mb-1">
//       {label} {required && <span className="text-red-400">*</span>}
//     </label>
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-200"
//     />
//   </div>
// );

// const SelectField = ({ 
//   label, 
//   value, 
//   onChange, 
//   options, 
//   required = false 
// }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-300 mb-1">
//       {label} {required && <span className="text-red-400">*</span>}
//     </label>
//     <select
//       value={value}
//       onChange={onChange}
//       required={required}
//       className="block w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-200"
//     >
//       {options.map(opt => (
//         <option key={opt.value} value={opt.value} className="bg-gray-700">
//           {opt.label}
//         </option>
//       ))}
//     </select>
//   </div>
// );

// export default RouterManagement;






// import React, { useReducer, useEffect, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Wifi, Server, Upload, Settings, X, Activity, Users, 
//   BarChart2, RefreshCw, Plus, CheckCircle, AlertTriangle, 
//   Globe, Download, Signal, Clock, PieChart, UserPlus, Eye, 
//   EyeOff, Filter, HardDrive, Terminal, Shield, LogOut, 
//   LogIn, WifiOff, BatteryCharging, Cpu, MemoryStick, 
//   Router, Network, Gauge, Database, Bell, ChevronDown, 
//   ChevronUp, MoreHorizontal, Trash2, Edit
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ThreeDots } from "react-loader-spinner";
// import { Line, Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   ArcElement
// } from "chart.js";
// import api from "../../../api"

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   ArcElement
// );

// // Types
// const RouterTypes = {
//   MIKROTIK: "mikrotik",
//   OPENWRT: "openwrt",
//   CISCO: "cisco",
//   GENERIC: "generic",
//   TP_LINK: "tp-link",
//   UBIQUITI: "ubiquiti"
// };

// const RouterStatus = {
//   CONNECTED: "connected",
//   DISCONNECTED: "disconnected",
//   UPDATING: "updating",
//   ERROR: "error"
// };

// // Reducer
// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   isRefreshing: false,
//   modals: {
//     addRouter: false,
//     editRouter: false,
//     hotspotConfig: false,
//     users: false,
//     settings: false,
//     notifications: false,
//     bulkActions: false
//   },
//   visibleStats: {
//     cpu: true,
//     memory: true,
//     clients: true,
//     uptime: true,
//     signal: true,
//     temperature: false,
//     throughput: true,
//     disk: false
//   },
//   showChart: true,
//   chartType: "line",
//   routerForm: {
//     name: "",
//     ip: "",
//     type: RouterTypes.MIKROTIK,
//     port: "8728",
//     username: "admin",
//     password: "",
//     location: ""
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landingPage: null,
//     redirectUrl: "http://captive.surfzone.local",
//     bandwidthLimit: "10M",
//     sessionTimeout: "60",
//     authMethod: "mac"
//   },
//   stats: null,
//   hotspotUsers: [],
//   statsHistory: null,
//   filter: "all",
//   selectedRouters: [],
//   notifications: [],
//   expandedRouter: null
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS":
//       return { ...state, routers: action.payload };
//     case "SET_ACTIVE_ROUTER":
//       return { ...state, activeRouter: action.payload };
//     case "SET_LOADING":
//       return { ...state, isLoading: action.payload };
//     case "SET_REFRESHING":
//       return { ...state, isRefreshing: action.payload };
//     case "TOGGLE_MODAL":
//       return { ...state, modals: { ...state.modals, [action.modal]: !state.modals[action.modal] } };
//     case "TOGGLE_CHART":
//       return { ...state, showChart: !state.showChart };
//     case "SET_CHART_TYPE":
//       return { ...state, chartType: action.payload };
//     case "UPDATE_ROUTER_FORM":
//       return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
//     case "UPDATE_HOTSPOT_FORM":
//       return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case "SET_STATS":
//       return { ...state, stats: action.payload };
//     case "SET_HOTSPOT_USERS":
//       return { ...state, hotspotUsers: action.payload };
//     case "UPDATE_STATS_HISTORY":
//       return { ...state, statsHistory: action.payload };
//     case "RESET_ROUTER_FORM":
//       return { ...state, routerForm: initialState.routerForm };
//     case "SET_FILTER":
//       return { ...state, filter: action.payload };
//     case "TOGGLE_SELECTED_ROUTER":
//       const selected = state.selectedRouters.includes(action.id)
//         ? state.selectedRouters.filter(id => id !== action.id)
//         : [...state.selectedRouters, action.id];
//       return { ...state, selectedRouters: selected };
//     case "TOGGLE_STAT":
//       return { ...state, visibleStats: { ...state.visibleStats, [action.stat]: !state.visibleStats[action.stat] } };
//     case "ADD_NOTIFICATION":
//       return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 50) };
//     case "CLEAR_NOTIFICATIONS":
//       return { ...state, notifications: [] };
//     case "TOGGLE_ROUTER_EXPANDED":
//       return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
//     case "UPDATE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.map(router =>
//           router.id === action.payload.id ? { ...router, ...action.payload.data } : router
//         ),
//         activeRouter:
//           state.activeRouter?.id === action.payload.id
//             ? { ...state.activeRouter, ...action.payload.data }
//             : state.activeRouter
//       };
//     case "DELETE_ROUTER":
//       return {
//         ...state,
//         routers: state.routers.filter(router => router.id !== action.id),
//         activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
//         selectedRouters: state.selectedRouters.filter(id => id !== action.id)
//       };
//     default:
//       return state;
//   }
// };

// // Utility Functions
// const getRouterStatusColor = (status) => {
//   switch (status) {
//     case RouterStatus.CONNECTED: return "bg-green-500/20 text-green-400";
//     case RouterStatus.DISCONNECTED: return "bg-red-500/20 text-red-400";
//     case RouterStatus.UPDATING: return "bg-yellow-500/20 text-yellow-400";
//     case RouterStatus.ERROR: return "bg-purple-500/20 text-purple-400";
//     default: return "bg-gray-500/20 text-gray-400";
//   }
// };

// const getRouterStatusText = (status) => {
//   switch (status) {
//     case RouterStatus.CONNECTED: return "Online";
//     case RouterStatus.DISCONNECTED: return "Offline";
//     case RouterStatus.UPDATING: return "Updating";
//     case RouterStatus.ERROR: return "Error";
//     default: return "Unknown";
//   }
// };

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const timeSince = (dateString) => {
//   const date = new Date(dateString);
//   const seconds = Math.floor((new Date() - date) / 1000);
//   let interval = Math.floor(seconds / 31536000);
//   if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
//   return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
// };

// // Main Component
// const RouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const {
//     routers,
//     activeRouter,
//     isLoading,
//     isRefreshing,
//     modals,
//     visibleStats,
//     showChart,
//     chartType,
//     routerForm,
//     hotspotForm,
//     stats,
//     hotspotUsers,
//     statsHistory,
//     filter,
//     selectedRouters,
//     notifications,
//     expandedRouter
//   } = state;

//   // API Calls
//   const fetchRouters = useCallback(async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       dispatch({ type: "SET_ROUTERS", payload: response.data });
//       if (!activeRouter && response.data.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
//       }
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "success", message: "Router list updated", timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to fetch routers");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [activeRouter]);

//   const fetchRouterStats = useCallback(async (routerId) => {
//     if (!routerId) return;
//     dispatch({ type: "SET_REFRESHING", payload: true });
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
//       dispatch({ type: "SET_STATS", payload: response.data.latest });
//       dispatch({ type: "UPDATE_STATS_HISTORY", payload: response.data.history });
//     } catch (error) {
//       toast.error("Failed to fetch stats");
//     } finally {
//       dispatch({ type: "SET_REFRESHING", payload: false });
//     }
//   }, []);

//   const fetchHotspotUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch hotspot users");
//     }
//   }, []);

//   useEffect(() => {
//     fetchRouters();
//     const interval = setInterval(fetchRouters, 30000);
//     return () => clearInterval(interval);
//   }, [fetchRouters]);

//   useEffect(() => {
//     if (activeRouter) {
//       fetchRouterStats(activeRouter.id);
//       fetchHotspotUsers(activeRouter.id);
//       const statsInterval = setInterval(() => fetchRouterStats(activeRouter.id), 5000);
//       return () => clearInterval(statsInterval);
//     }
//   }, [activeRouter, fetchRouterStats, fetchHotspotUsers]);

//   // Actions
//   const addRouter = async () => {
//     if (!routerForm.name || !routerForm.ip) {
//       toast.warn("Name and IP are required");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/routers/", routerForm);
//       dispatch({ type: "SET_ROUTERS", payload: [...routers, response.data] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       toast.success("Router added successfully");
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "success", message: `Added router: ${response.data.name}`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to add router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const updateRouter = async (id, data) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${id}/`, data);
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       toast.success("Router updated successfully");
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "success", message: `Updated router: ${response.data.name}`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to update router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const deleteRouter = async (id) => {
//     const router = routers.find(r => r.id === id);
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${id}/`);
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success(`Router ${router.name} deleted`);
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "warning", message: `Deleted router: ${router.name}`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to delete router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const connectToRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "connect" });
//       const updatedRouter = { ...routers.find(r => r.id === routerId), status: RouterStatus.CONNECTED, lastSeen: new Date().toISOString() };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success(`Connected to ${updatedRouter.name}`);
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "success", message: `Connected to router: ${updatedRouter.name}`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to connect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "disconnect" });
//       const updatedRouter = { ...routers.find(r => r.id === routerId), status: RouterStatus.DISCONNECTED, lastSeen: new Date().toISOString() };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success(`Disconnected ${updatedRouter.name}`);
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "warning", message: `Disconnected from router: ${updatedRouter.name}`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to disconnect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const rebootRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post(`/api/network_management/routers/${routerId}/reboot/`);
//       const updatedRouter = { ...routers.find(r => r.id === routerId), status: RouterStatus.UPDATING, lastSeen: new Date().toISOString() };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       setTimeout(async () => {
//         const reconnectedRouter = { ...updatedRouter, status: RouterStatus.CONNECTED, lastSeen: new Date().toISOString() };
//         dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: reconnectedRouter } });
//         if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: reconnectedRouter });
//         toast.success(`${reconnectedRouter.name} rebooted successfully`);
//         dispatch({
//           type: "ADD_NOTIFICATION",
//           payload: { id: Date.now(), type: "info", message: `Rebooted router: ${reconnectedRouter.name}`, timestamp: new Date().toISOString() }
//         });
//       }, 2000);
//     } catch (error) {
//       toast.error("Failed to reboot router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const configureHotspot = async () => {
//     if (!hotspotForm.landingPage) {
//       toast.warn("Please upload a landing page");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(hotspotForm).forEach(([key, value]) => {
//         if (key === "landingPage" && value) formData.append("landingPage", value);
//         else if (value) formData.append(key, value);
//       });
//       await api.post(`/api/network_management/routers/${activeRouter.id}/hotspot-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully");
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "success", message: `Configured hotspot on ${activeRouter.name}`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to configure hotspot");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const exportReport = () => {
//     if (!activeRouter) return;
//     const report = {
//       router: activeRouter.name,
//       status: activeRouter.status,
//       stats,
//       hotspotUsers: hotspotUsers.map(u => ({
//         name: u.name,
//         plan: u.plan,
//         connectedAt: u.connectedAt,
//         dataUsed: formatBytes(u.dataUsed)
//       })),
//       timestamp: new Date().toISOString()
//     };
//     const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${activeRouter.name.replace(/\s+/g, "_")}_report_${new Date().toISOString().split("T")[0]}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success("Report exported successfully");
//     dispatch({
//       type: "ADD_NOTIFICATION",
//       payload: { id: Date.now(), type: "info", message: `Exported report for ${activeRouter.name}`, timestamp: new Date().toISOString() }
//     });
//   };

//   const disconnectHotspotUser = async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/hotspot-users/${userId}/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: hotspotUsers.filter(u => u.id !== userId) });
//       toast.success(`Disconnected user ${hotspotUsers.find(u => u.id === userId).name}`);
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "warning", message: `Disconnected hotspot user`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error("Failed to disconnect user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const performBulkAction = async (action) => {
//     if (selectedRouters.length === 0) {
//       toast.warn("No routers selected");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: selectedRouters, action });
//       selectedRouters.forEach(id => {
//         const router = routers.find(r => r.id === id);
//         let updatedRouter;
//         switch (action) {
//           case "connect":
//             updatedRouter = { ...router, status: RouterStatus.CONNECTED };
//             break;
//           case "disconnect":
//             updatedRouter = { ...router, status: RouterStatus.DISCONNECTED };
//             break;
//           case "reboot":
//             updatedRouter = { ...router, status: RouterStatus.UPDATING };
//             setTimeout(() => {
//               dispatch({ type: "UPDATE_ROUTER", payload: { id, data: { ...updatedRouter, status: RouterStatus.CONNECTED } } });
//             }, 2000);
//             break;
//           case "delete":
//             dispatch({ type: "DELETE_ROUTER", id });
//             return;
//           default:
//             return;
//         }
//         dispatch({ type: "UPDATE_ROUTER", payload: { id, data: updatedRouter } });
//         if (activeRouter?.id === id) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "bulkActions" });
//       toast.success(`Bulk ${action} completed for ${selectedRouters.length} routers`);
//       dispatch({
//         type: "ADD_NOTIFICATION",
//         payload: { id: Date.now(), type: "info", message: `Performed ${action} on ${selectedRouters.length} routers`, timestamp: new Date().toISOString() }
//       });
//     } catch (error) {
//       toast.error(`Failed to perform bulk ${action}`);
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const filteredRouters = filter === "all" ? routers : routers.filter(r => r.status === filter);

//   const chartData = {
//     labels: statsHistory?.timestamps || Array(10).fill().map((_, i) => `T-${9 - i}`),
//     datasets: [
//       { label: "CPU (%)", data: statsHistory?.cpu || Array(10).fill(0), borderColor: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.3)", fill: true, tension: 0.4, yAxisID: "y" },
//       { label: "Memory (MB)", data: statsHistory?.memory || Array(10).fill(0), borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.3)", fill: true, tension: 0.4, yAxisID: "y1" },
//       { label: "Clients", data: statsHistory?.clients || Array(10).fill(0), borderColor: "#F59E0B", backgroundColor: "rgba(245, 158, 11, 0.3)", fill: true, tension: 0.4, yAxisID: "y2" },
//       { label: "Throughput (Mbps)", data: statsHistory?.throughput || Array(10).fill(0), borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.3)", fill: true, tension: 0.4, yAxisID: "y3" }
//     ]
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: { mode: "index", intersect: false },
//     scales: {
//       y: { type: "linear", display: true, position: "left", title: { display: true, text: "CPU (%)" }, grid: { color: "rgba(255, 255, 255, 0.1)" }, min: 0, max: 100 },
//       y1: { type: "linear", display: true, position: "right", title: { display: true, text: "Memory (MB)" }, grid: { drawOnChartArea: false }, min: 0, max: 200 },
//       y2: { type: "linear", display: false, min: 0 },
//       y3: { type: "linear", display: false, min: 0, max: 100 },
//       x: { grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { maxRotation: 45, minRotation: 45 } }
//     },
//     plugins: {
//       legend: { labels: { color: "#E5E7EB", usePointStyle: true, pointStyle: "circle", padding: 20 }, position: "bottom" },
//       tooltip: {
//         backgroundColor: "#1F2937",
//         titleColor: "#fff",
//         bodyColor: "#fff",
//         usePointStyle: true,
//         callbacks: {
//           label: context => `${context.dataset.label}: ${context.parsed.y}${context.dataset.label.includes("Throughput") ? " Mbps" : context.dataset.label.includes("Memory") ? " MB" : ""}`
//         }
//       }
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 font-sans">
//       <ToastContainer position="top-right" autoClose={3000} theme="dark" pauseOnHover newestOnTop />

//       {/* Header */}
//       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gray-800 p-4 rounded-lg shadow">
//         <div className="flex items-center space-x-4 mb-4 sm:mb-0">
//           <Server className="w-8 h-8 text-indigo-400" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-400">Network Management</h1>
//             <p className="text-sm text-gray-400">{routers.length} routers • {routers.filter(r => r.status === RouterStatus.CONNECTED).length} online</p>
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "notifications" })} label="Notifications" icon={<Bell />} color="bg-gray-700 hover:bg-gray-600" badge={notifications.length} />
//           <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })} label="Add Router" icon={<Plus />} color="bg-indigo-600 hover:bg-indigo-500" />
//           {selectedRouters.length > 0 && (
//             <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "bulkActions" })} label="Bulk Actions" icon={<MoreHorizontal />} color="bg-purple-600 hover:bg-purple-500" />
//           )}
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="space-y-6">
//         {/* Router List */}
//         <section className="bg-gray-800 p-4 rounded-lg shadow">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold flex items-center"><Wifi className="w-5 h-5 mr-2 text-indigo-400" /> Routers</h2>
//             <div className="flex space-x-2">
//               <select value={filter} onChange={e => dispatch({ type: "SET_FILTER", payload: e.target.value })} className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 text-sm">
//                 <option value="all">All</option>
//                 <option value={RouterStatus.CONNECTED}>Online</option>
//                 <option value={RouterStatus.DISCONNECTED}>Offline</option>
//                 <option value={RouterStatus.UPDATING}>Updating</option>
//                 <option value={RouterStatus.ERROR}>Error</option>
//               </select>
//               <Button onClick={fetchRouters} icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />} color="bg-gray-700 hover:bg-gray-600" compact />
//             </div>
//           </div>
//           {isLoading ? (
//             <div className="flex justify-center py-4"><ThreeDots color="#6366F1" height={50} width={50} /></div>
//           ) : filteredRouters.length === 0 ? (
//             <p className="text-gray-400 text-center py-4 flex items-center justify-center"><AlertTriangle className="w-5 h-5 mr-2" /> No routers found</p>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredRouters.map(router => (
//                 <motion.div
//                   key={router.id}
//                   onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
//                   whileHover={{ scale: 1.03 }}
//                   className={`p-4 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 ${activeRouter?.id === router.id ? "ring-2 ring-indigo-500" : ""}`}
//                 >
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={selectedRouters.includes(router.id)}
//                       onChange={() => dispatch({ type: "TOGGLE_SELECTED_ROUTER", id: router.id })}
//                       className="mr-2 accent-indigo-500"
//                       onClick={e => e.stopPropagation()}
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-gray-200 truncate">{router.name}</p>
//                       <p className="text-xs text-gray-400">{router.ip}:{router.port}</p>
//                     </div>
//                     <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRouterStatusColor(router.status)}`}>{getRouterStatusText(router.status)}</span>
//                   </div>
//                   {expandedRouter === router.id && (
//                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-gray-400">
//                       <p>Location: {router.location || "N/A"}</p>
//                       <p>Last Seen: {timeSince(router.lastSeen)}</p>
//                       <div className="flex gap-2 mt-2">
//                         <button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" }); dispatch({ type: "UPDATE_ROUTER_FORM", payload: router }); }} className="text-indigo-400 hover:text-indigo-300"><Edit className="w-3 h-3" /></button>
//                         <button onClick={e => { e.stopPropagation(); deleteRouter(router.id); }} className="text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
//                         {router.status === RouterStatus.CONNECTED && (
//                           <button onClick={e => { e.stopPropagation(); rebootRouter(router.id); }} className="text-yellow-400 hover:text-yellow-300"><BatteryCharging className="w-3 h-3" /></button>
//                         )}
//                       </div>
//                     </motion.div>
//                   )}
//                   <button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id }); }} className="w-full mt-2 text-gray-500 hover:text-gray-400 text-xs flex justify-center">
//                     {expandedRouter === router.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                   </button>
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Router Dashboard */}
//         {activeRouter && (
//           <section className="bg-gray-800 p-4 rounded-lg shadow">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
//               <h2 className="text-lg font-semibold flex items-center mb-2 sm:mb-0"><Server className="w-5 h-5 mr-2 text-indigo-400" /> {activeRouter.name}</h2>
//               <div className="flex flex-wrap gap-2">
//                 <Button
//                   onClick={() => activeRouter.status === RouterStatus.CONNECTED ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id)}
//                   label={activeRouter.status === RouterStatus.CONNECTED ? "Disconnect" : "Connect"}
//                   icon={activeRouter.status === RouterStatus.CONNECTED ? <LogOut /> : <LogIn />}
//                   color={activeRouter.status === RouterStatus.CONNECTED ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"}
//                 />
//                 <Button onClick={() => fetchRouterStats(activeRouter.id)} label="Refresh" icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />} color="bg-gray-600 hover:bg-gray-500" />
//                 <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} label="Hotspot" icon={<Globe />} color="bg-indigo-600 hover:bg-indigo-500" disabled={activeRouter.status !== RouterStatus.CONNECTED} />
//                 <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} label="Users" icon={<UserPlus />} color="bg-teal-600 hover:bg-teal-500" disabled={activeRouter.status !== RouterStatus.CONNECTED} />
//                 <Button onClick={exportReport} label="Export" icon={<Download />} color="bg-purple-600 hover:bg-purple-500" />
//                 <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "settings" })} label="Settings" icon={<Settings />} color="bg-gray-600 hover:bg-gray-500" />
//               </div>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
//               {visibleStats.cpu && <StatCard label="CPU" value={`${stats?.cpu?.toFixed(1) || 0}%`} icon={<Cpu className="text-purple-400" />} />}
//               {visibleStats.memory && <StatCard label="Memory" value={`${stats?.memory?.toFixed(0) || 0} MB`} icon={<MemoryStick className="text-green-400" />} />}
//               {visibleStats.clients && <StatCard label="Clients" value={stats?.clients || 0} icon={<Users className="text-yellow-400" />} />}
//               {visibleStats.uptime && <StatCard label="Uptime" value={stats?.uptime || "0%"} icon={<Clock className="text-blue-400" />} />}
//               {visibleStats.signal && <StatCard label="Signal" value={`${stats?.signal || 0} dBm`} icon={<Signal className="text-indigo-400" />} />}
//               {visibleStats.throughput && <StatCard label="Throughput" value={`${stats?.throughput || 0} Mbps`} icon={<Network className="text-cyan-400" />} />}
//               {visibleStats.temperature && <StatCard label="Temp" value={`${stats?.temperature || 0}°C`} icon={<Gauge className="text-red-400" />} />}
//               {visibleStats.disk && <StatCard label="Disk" value={`${stats?.disk || 0}%`} icon={<HardDrive className="text-orange-400" />} />}
//             </div>

//             {/* Chart */}
//             <div className="bg-gray-700 p-4 rounded-lg mb-4">
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="text-lg font-medium flex items-center"><PieChart className="w-5 h-5 mr-2 text-indigo-400" /> Performance</h3>
//                 <div className="flex space-x-2">
//                   <select value={chartType} onChange={e => dispatch({ type: "SET_CHART_TYPE", payload: e.target.value })} className="p-1 bg-gray-600 border border-gray-500 rounded-md text-gray-200 text-sm">
//                     <option value="line">Line</option>
//                     <option value="bar">Bar</option>
//                   </select>
//                   <Button onClick={() => dispatch({ type: "TOGGLE_CHART" })} label={showChart ? "Hide" : "Show"} icon={showChart ? <EyeOff /> : <Eye />} color="bg-gray-600 hover:bg-gray-500" compact />
//                 </div>
//               </div>
//               {showChart && (
//                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="h-64">
//                   {chartType === "line" ? <Line data={chartData} options={chartOptions} /> : <Bar data={chartData} options={chartOptions} />}
//                 </motion.div>
//               )}
//             </div>

//             {/* Details */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-gray-700 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-2 flex items-center"><Terminal className="w-5 h-5 mr-2 text-indigo-400" /> Details</h3>
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <p className="text-gray-400">IP</p><p className="text-gray-200">{activeRouter.ip}</p>
//                   <p className="text-gray-400">Port</p><p className="text-gray-200">{activeRouter.port}</p>
//                   <p className="text-gray-400">Type</p><p className="text-gray-200 capitalize">{activeRouter.type}</p>
//                   <p className="text-gray-400">Status</p><p className={`text-xs ${getRouterStatusColor(activeRouter.status)}`}>{getRouterStatusText(activeRouter.status)}</p>
//                 </div>
//               </div>
//               <div className="bg-gray-700 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-2 flex items-center"><Shield className="w-5 h-5 mr-2 text-indigo-400" /> Hotspot</h3>
//                 {activeRouter.status === RouterStatus.CONNECTED ? (
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <p className="text-gray-400">Users</p><p className="text-gray-200">{hotspotUsers.length}</p>
//                     <p className="text-gray-400">Data</p><p className="text-gray-200">{formatBytes(hotspotUsers.reduce((sum, user) => sum + user.dataUsed, 0))}</p>
//                   </div>
//                 ) : (
//                   <p className="text-gray-400 text-center">Hotspot unavailable</p>
//                 )}
//               </div>
//             </div>
//           </section>
//         )}
//       </div>

//       {/* Modals */}
//       <Modal isOpen={modals.addRouter} title="Add Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}>
//         <div className="space-y-4">
//           <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
//           <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
//           <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
//           <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
//           <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
//           <SelectField label="Type" value={routerForm.type} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })} options={Object.values(RouterTypes).map(value => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))} />
//           <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
//           <Button onClick={addRouter} label={isLoading ? "Adding..." : "Add"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />} color="bg-indigo-600 hover:bg-indigo-500" disabled={isLoading || !routerForm.name || !routerForm.ip} fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.editRouter} title="Edit Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}>
//         <div className="space-y-4">
//           <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
//           <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
//           <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
//           <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
//           <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
//           <SelectField label="Type" value={routerForm.type} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })} options={Object.values(RouterTypes).map(value => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))} />
//           <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
//           <div className="flex gap-2">
//             <Button
//               onClick={() => updateRouter(activeRouter.id, { ...routerForm, port: parseInt(routerForm.port) })}
//               label={isLoading ? "Saving..." : "Save"}
//               icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />}
//               color="bg-indigo-600 hover:bg-indigo-500"
//               disabled={isLoading || !routerForm.name || !routerForm.ip}
//               fullWidth
//             />
//             <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })} label="Cancel" icon={<X />} color="bg-gray-600 hover:bg-gray-500" fullWidth />
//           </div>
//         </div>
//       </Modal>

//       <Modal isOpen={modals.hotspotConfig} title="Configure Hotspot" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}>
//         <div className="space-y-4">
//           <InputField label="SSID" value={hotspotForm.ssid} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { ssid: e.target.value } })} placeholder="SurfZone-WiFi" required />
//           <InputField label="Redirect URL" value={hotspotForm.redirectUrl} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { redirectUrl: e.target.value } })} placeholder="http://captive.surfzone.local" required />
//           <SelectField label="Auth Method" value={hotspotForm.authMethod} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { authMethod: e.target.value } })} options={[{ value: "mac", label: "MAC" }, { value: "voucher", label: "Voucher" }, { value: "sms", label: "SMS" }, { value: "social", label: "Social" }]} />
//           <InputField label="Bandwidth" value={hotspotForm.bandwidthLimit} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { bandwidthLimit: e.target.value } })} placeholder="10M" />
//           <InputField label="Timeout (min)" type="number" value={hotspotForm.sessionTimeout} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { sessionTimeout: e.target.value } })} placeholder="60" />
//           <div>
//             <label className="block text-sm text-gray-300 mb-1">Landing Page</label>
//             <input type="file" accept=".html,.htm" onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { landingPage: e.target.files[0] } })} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200" />
//           </div>
//           <Button onClick={configureHotspot} label={isLoading ? "Configuring..." : "Setup"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />} color="bg-indigo-600 hover:bg-indigo-500" disabled={isLoading || !hotspotForm.landingPage} fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.users} title="Hotspot Users" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} size="lg">
//         <div className="space-y-4">
//           {hotspotUsers.length === 0 ? (
//             <p className="text-center py-4 text-gray-400">No active users</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">User</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Plan</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">IP</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Connected</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Data</th>
//                     <th className="px-4 py-2 text-right text-xs text-gray-300">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-gray-800 divide-y divide-gray-700">
//                   {hotspotUsers.map(user => (
//                     <tr key={user.id}>
//                       <td className="px-4 py-2 text-sm text-gray-200">{user.name}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{user.plan}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{user.ip}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{timeSince(user.connectedAt)}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{formatBytes(user.dataUsed)}</td>
//                       <td className="px-4 py-2 text-right"><button onClick={() => disconnectHotspotUser(user.id)} className="text-red-400 hover:text-red-300"><LogOut className="w-5 h-5" /></button></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </Modal>

//       <Modal isOpen={modals.settings} title="Settings" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "settings" })}>
//         <div className="space-y-4">
//           <div className="bg-gray-700 p-4 rounded-lg">
//             <h4 className="text-sm text-gray-300 mb-2">Visible Stats</h4>
//             <div className="grid grid-cols-2 gap-2">
//               {Object.entries(visibleStats).map(([stat, isVisible]) => (
//                 <label key={stat} className="flex items-center"><input type="checkbox" checked={isVisible} onChange={() => dispatch({ type: "TOGGLE_STAT", stat })} className="mr-2 accent-indigo-500" />{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
//               ))}
//             </div>
//           </div>
//           <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "settings" })} label="Save" icon={<CheckCircle />} color="bg-indigo-600 hover:bg-indigo-500" fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.notifications} title="Notifications" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "notifications" })} size="lg">
//         <div className="space-y-4">
//           <div className="flex justify-between"><p className="text-sm text-gray-400">Recent</p><button onClick={() => dispatch({ type: "CLEAR_NOTIFICATIONS" })} className="text-indigo-400 hover:text-indigo-300 text-sm">Clear</button></div>
//           {notifications.length === 0 ? (
//             <p className="text-center py-4 text-gray-400">No notifications</p>
//           ) : (
//             <div className="max-h-64 overflow-y-auto space-y-2">
//               {notifications.map(n => (
//                 <div key={n.id} className={`p-2 rounded ${n.type === "success" ? "bg-green-900/30" : n.type === "warning" ? "bg-yellow-900/30" : "bg-red-900/30"} flex justify-between`}>
//                   <span className="text-sm">{n.message}</span>
//                   <span className="text-xs text-gray-400">{timeSince(n.timestamp)}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </Modal>

//       <Modal isOpen={modals.bulkActions} title="Bulk Actions" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "bulkActions" })}>
//         <div className="space-y-4">
//           <p className="text-sm text-gray-400">{selectedRouters.length} routers selected</p>
//           <div className="grid grid-cols-2 gap-2">
//             <Button onClick={() => performBulkAction("connect")} label="Connect" icon={<LogIn />} color="bg-green-600 hover:bg-green-500" fullWidth />
//             <Button onClick={() => performBulkAction("disconnect")} label="Disconnect" icon={<LogOut />} color="bg-red-600 hover:bg-red-500" fullWidth />
//             <Button onClick={() => performBulkAction("reboot")} label="Reboot" icon={<BatteryCharging />} color="bg-yellow-600 hover:bg-yellow-500" fullWidth />
//             <Button onClick={() => performBulkAction("delete")} label="Delete" icon={<Trash2 />} color="bg-gray-600 hover:bg-gray-500" fullWidth />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// // Reusable Components
// const StatCard = ({ label, value, icon }) => (
//   <motion.div whileHover={{ scale: 1.05 }} className="p-3 bg-gray-700 rounded-lg flex items-center">
//     {React.cloneElement(icon, { className: "w-6 h-6 mr-2" })}
//     <div>
//       <p className="text-xs text-gray-400">{label}</p>
//       <p className="text-sm font-medium text-gray-200">{value}</p>
//     </div>
//   </motion.div>
// );

// const Button = ({ onClick, label, icon, color, disabled, compact, fullWidth, badge }) => (
//   <motion.button whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }} onClick={onClick} disabled={disabled} className={`${color} ${compact ? "p-2" : "px-3 py-2"} ${fullWidth ? "w-full" : ""} text-white rounded-md flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed relative`}>
//     {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-1" : ""}` })}
//     {label && <span>{label}</span>}
//     {badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{badge}</span>}
//   </motion.button>
// );

// const Modal = ({ isOpen, title, onClose, children, size = "md" }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
//         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`bg-gray-800 p-4 rounded-lg ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} w-full`}>
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></button>
//           </div>
//           {children}
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// const InputField = ({ label, value, onChange, type = "text", placeholder, required }) => (
//   <div>
//     <label className="block text-sm text-gray-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
//     <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500" />
//   </div>
// );

// const SelectField = ({ label, value, onChange, options, required }) => (
//   <div>
//     <label className="block text-sm text-gray-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
//     <select value={value} onChange={onChange} required={required} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500">
//       {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//     </select>
//   </div>
// );

// export default RouterManagement;







// import React, { useReducer, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Wifi, Server, Upload, Settings, X, Users, RefreshCw, Plus, CheckCircle, Globe, Download, LogOut, LogIn, ChevronDown, ChevronUp, Trash2, Edit } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ThreeDots } from "react-loader-spinner";
// import api from "../../../api";

// const initialState = {
//   routers: [],
//   activeRouter: null,
//   isLoading: false,
//   modals: {
//     addRouter: false,
//     editRouter: false,
//     hotspotConfig: false,
//     users: false,
//   },
//   routerForm: {
//     name: "",
//     ip: "",
//     type: "mikrotik", // Fixed to MikroTik HEX RB760iGS
//     port: "8728",
//     username: "admin",
//     password: "",
//     location: "",
//   },
//   hotspotForm: {
//     ssid: "SurfZone-WiFi",
//     landingPage: null,
//     redirectUrl: "http://captive.surfzone.local",
//     bandwidthLimit: "10M",
//     sessionTimeout: "60",
//     authMethod: "universal",
//   },
//   hotspotUsers: [],
//   expandedRouter: null,
// };

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_ROUTERS": return { ...state, routers: action.payload };
//     case "SET_ACTIVE_ROUTER": return { ...state, activeRouter: action.payload };
//     case "SET_LOADING": return { ...state, isLoading: action.payload };
//     case "TOGGLE_MODAL": return { ...state, modals: { ...state.modals, [action.modal]: !state.modals[action.modal] } };
//     case "UPDATE_ROUTER_FORM": return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
//     case "UPDATE_HOTSPOT_FORM": return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
//     case "SET_HOTSPOT_USERS": return { ...state, hotspotUsers: action.payload };
//     case "RESET_ROUTER_FORM": return { ...state, routerForm: initialState.routerForm };
//     case "TOGGLE_ROUTER_EXPANDED": return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
//     case "UPDATE_ROUTER": return {
//       ...state,
//       routers: state.routers.map(r => r.id === action.payload.id ? { ...r, ...action.payload.data } : r),
//       activeRouter: state.activeRouter?.id === action.payload.id ? { ...state.activeRouter, ...action.payload.data } : state.activeRouter,
//     };
//     case "DELETE_ROUTER": return {
//       ...state,
//       routers: state.routers.filter(r => r.id !== action.id),
//       activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
//     };
//     default: return state;
//   }
// };

// const getRouterStatusColor = (status) => ({
//   "connected": "bg-green-500/20 text-green-400",
//   "disconnected": "bg-red-500/20 text-red-400",
//   "updating": "bg-yellow-500/20 text-yellow-400",
//   "error": "bg-purple-500/20 text-purple-400",
// }[status] || "bg-gray-500/20 text-gray-400");

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const timeSince = (dateString) => {
//   const date = new Date(dateString);
//   const seconds = Math.floor((new Date() - date) / 1000);
//   let interval = Math.floor(seconds / 31536000);
//   if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 2592000);
//   if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 86400);
//   if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 3600);
//   if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
//   interval = Math.floor(seconds / 60);
//   if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
//   return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
// };

// const RouterManagement = () => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const { routers, activeRouter, isLoading, modals, routerForm, hotspotForm, hotspotUsers, expandedRouter } = state;

//   const fetchRouters = useCallback(async () => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.get("/api/network_management/routers/");
//       dispatch({ type: "SET_ROUTERS", payload: response.data });
//       if (!activeRouter && response.data.length > 0) {
//         dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
//       }
//     } catch (error) {
//       toast.error("Failed to fetch routers");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   }, [activeRouter]);

//   const fetchHotspotUsers = useCallback(async (routerId) => {
//     if (!routerId) return;
//     try {
//       const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
//     } catch (error) {
//       toast.error("Failed to fetch hotspot users");
//     }
//   }, []);

//   useEffect(() => {
//     fetchRouters();
//     const interval = setInterval(fetchRouters, 30000);
//     return () => clearInterval(interval);
//   }, [fetchRouters]);

//   useEffect(() => {
//     if (activeRouter) {
//       fetchHotspotUsers(activeRouter.id);
//       const interval = setInterval(() => fetchHotspotUsers(activeRouter.id), 10000);
//       return () => clearInterval(interval);
//     }
//   }, [activeRouter, fetchHotspotUsers]);

//   const addRouter = async () => {
//     if (!routerForm.name || !routerForm.ip) {
//       toast.warn("Name and IP are required");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post("/api/network_management/routers/", routerForm);
//       dispatch({ type: "SET_ROUTERS", payload: [...routers, response.data] });
//       dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
//       dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
//       dispatch({ type: "RESET_ROUTER_FORM" });
//       toast.success("Router added successfully");
//     } catch (error) {
//       toast.error("Failed to add router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const updateRouter = async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.put(`/api/network_management/routers/${id}/`, routerForm);
//       dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
//       dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
//       toast.success("Router updated successfully");
//     } catch (error) {
//       toast.error("Failed to update router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const deleteRouter = async (id) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/routers/${id}/`);
//       dispatch({ type: "DELETE_ROUTER", id });
//       toast.success("Router deleted successfully");
//     } catch (error) {
//       toast.error("Failed to delete router");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const connectToRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "connect" });
//       const updatedRouter = { ...routers.find(r => r.id === routerId), status: "connected" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router connected");
//     } catch (error) {
//       toast.error("Failed to connect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectRouter = async (routerId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "disconnect" });
//       const updatedRouter = { ...routers.find(r => r.id === routerId), status: "disconnected" };
//       dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
//       if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
//       toast.success("Router disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const configureHotspot = async () => {
//     if (!hotspotForm.landingPage) {
//       toast.warn("Please upload the landing page");
//       return;
//     }
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const formData = new FormData();
//       Object.entries(hotspotForm).forEach(([key, value]) => {
//         if (key === "landingPage" && value) formData.append("landingPage", value);
//         else if (value) formData.append(key, value);
//       });
//       await api.post(`/api/network_management/routers/${activeRouter.id}/hotspot-config/`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
//       toast.success("Hotspot configured successfully");
//     } catch (error) {
//       toast.error("Failed to configure hotspot");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   const disconnectHotspotUser = async (userId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       await api.delete(`/api/network_management/hotspot-users/${userId}/`);
//       dispatch({ type: "SET_HOTSPOT_USERS", payload: hotspotUsers.filter(u => u.id !== userId) });
//       toast.success("User disconnected");
//     } catch (error) {
//       toast.error("Failed to disconnect user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 font-sans">
//       <ToastContainer position="top-right" autoClose={3000} theme="dark" pauseOnHover newestOnTop />

//       {/* Header */}
//       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gray-800 p-4 rounded-lg shadow">
//         <div className="flex items-center space-x-4 mb-4 sm:mb-0">
//           <Server className="w-8 h-8 text-indigo-400" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-400">Router Management</h1>
//             <p className="text-sm text-gray-400">{routers.length} routers • {routers.filter(r => r.status === "connected").length} online</p>
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })} label="Add Router" icon={<Plus />} color="bg-indigo-600 hover:bg-indigo-500" />
//         </div>
//       </header>

//       {/* Router List */}
//       <section className="bg-gray-800 p-4 rounded-lg shadow">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center"><Wifi className="w-5 h-5 mr-2 text-indigo-400" /> Routers</h2>
//           <Button onClick={fetchRouters} icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />} color="bg-gray-700 hover:bg-gray-600" compact />
//         </div>
//         {isLoading ? (
//           <div className="flex justify-center py-4"><ThreeDots color="#6366F1" height={50} width={50} /></div>
//         ) : routers.length === 0 ? (
//           <p className="text-gray-400 text-center py-4">No routers found</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {routers.map(router => (
//               <motion.div
//                 key={router.id}
//                 onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
//                 whileHover={{ scale: 1.03 }}
//                 className={`p-4 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 ${activeRouter?.id === router.id ? "ring-2 ring-indigo-500" : ""}`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium text-gray-200 truncate">{router.name}</p>
//                     <p className="text-xs text-gray-400">{router.ip}:{router.port}</p>
//                   </div>
//                   <span className={`px-2 py-1 rounded-full text-xs ${getRouterStatusColor(router.status)}`}>{router.status}</span>
//                 </div>
//                 {expandedRouter === router.id && (
//                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-gray-400">
//                     <p>Location: {router.location || "N/A"}</p>
//                     <div className="flex gap-2 mt-2">
//                       <Button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" }); dispatch({ type: "UPDATE_ROUTER_FORM", payload: router }); }} label="Edit" icon={<Edit />} color="bg-indigo-600 hover:bg-indigo-500" compact />
//                       <Button onClick={e => { e.stopPropagation(); deleteRouter(router.id); }} label="Delete" icon={<Trash2 />} color="bg-red-600 hover:bg-red-500" compact />
//                       <Button onClick={e => { e.stopPropagation(); router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id); }} label={router.status === "connected" ? "Disconnect" : "Connect"} icon={router.status === "connected" ? <LogOut /> : <LogIn />} color={router.status === "connected" ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} compact />
//                     </div>
//                   </motion.div>
//                 )}
//                 <button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id }); }} className="w-full mt-2 text-gray-500 hover:text-gray-400 text-xs flex justify-center">
//                   {expandedRouter === router.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                 </button>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Router Dashboard */}
//       {activeRouter && (
//         <section className="bg-gray-800 p-4 rounded-lg shadow mt-6">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
//             <h2 className="text-lg font-semibold flex items-center mb-2 sm:mb-0"><Server className="w-5 h-5 mr-2 text-indigo-400" /> {activeRouter.name}</h2>
//             <div className="flex flex-wrap gap-2">
//               <Button onClick={() => activeRouter.status === "connected" ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id)} label={activeRouter.status === "connected" ? "Disconnect" : "Connect"} icon={activeRouter.status === "connected" ? <LogOut /> : <LogIn />} color={activeRouter.status === "connected" ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} />
//               <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} label="Configure Hotspot" icon={<Globe />} color="bg-indigo-600 hover:bg-indigo-500" disabled={activeRouter.status !== "connected"} />
//               <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} label="Hotspot Users" icon={<Users />} color="bg-teal-600 hover:bg-teal-500" disabled={activeRouter.status !== "connected"} />
//             </div>
//           </div>

//           {/* Hotspot Details */}
//           <div className="bg-gray-700 p-4 rounded-lg">
//             <h3 className="text-lg font-medium mb-2 flex items-center"><Globe className="w-5 h-5 mr-2 text-indigo-400" /> Hotspot Status</h3>
//             {activeRouter.status === "connected" ? (
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <p className="text-gray-400">Users</p><p className="text-gray-200">{hotspotUsers.length}</p>
//                 <p className="text-gray-400">Data Used</p><p className="text-gray-200">{formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0))}</p>
//               </div>
//             ) : (
//               <p className="text-gray-400 text-center">Router must be connected to manage Hotspot</p>
//             )}
//           </div>
//         </section>
//       )}

//       {/* Modals */}
//       <Modal isOpen={modals.addRouter} title="Add MikroTik Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}>
//         <div className="space-y-4">
//           <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
//           <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
//           <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
//           <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
//           <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
//           <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
//           <Button onClick={addRouter} label={isLoading ? "Adding..." : "Add"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />} color="bg-indigo-600 hover:bg-indigo-500" disabled={isLoading || !routerForm.name || !routerForm.ip} fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.editRouter} title="Edit MikroTik Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}>
//         <div className="space-y-4">
//           <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
//           <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
//           <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
//           <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
//           <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
//           <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
//           <div className="flex gap-2">
//             <Button onClick={() => updateRouter(activeRouter.id)} label={isLoading ? "Saving..." : "Save"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />} color="bg-indigo-600 hover:bg-indigo-500" disabled={isLoading || !routerForm.name || !routerForm.ip} fullWidth />
//             <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })} label="Cancel" icon={<X />} color="bg-gray-600 hover:bg-gray-500" fullWidth />
//           </div>
//         </div>
//       </Modal>

//       <Modal isOpen={modals.hotspotConfig} title="Configure Hotspot" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}>
//         <div className="space-y-4">
//           <InputField label="SSID" value={hotspotForm.ssid} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { ssid: e.target.value } })} placeholder="SurfZone-WiFi" required />
//           <InputField label="Redirect URL" value={hotspotForm.redirectUrl} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { redirectUrl: e.target.value } })} placeholder="http://captive.surfzone.local" required />
//           <InputField label="Bandwidth Limit" value={hotspotForm.bandwidthLimit} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { bandwidthLimit: e.target.value } })} placeholder="10M" />
//           <InputField label="Session Timeout (min)" type="number" value={hotspotForm.sessionTimeout} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { sessionTimeout: e.target.value } })} placeholder="60" />
//           <div>
//             <label className="block text-sm text-gray-300 mb-1">Landing Page (App.js)</label>
//             <input type="file" accept=".js" onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { landingPage: e.target.files[0] } })} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200" />
//           </div>
//           <Button onClick={configureHotspot} label={isLoading ? "Configuring..." : "Setup"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />} color="bg-indigo-600 hover:bg-indigo-500" disabled={isLoading || !hotspotForm.landingPage} fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.users} title="Hotspot Users" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} size="lg">
//         <div className="space-y-4">
//           {hotspotUsers.length === 0 ? (
//             <p className="text-center py-4 text-gray-400">No active users</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-700">
//                 <thead className="bg-gray-700">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Client</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Plan</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">MAC</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Payment</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-300">Data Used</th>
//                     <th className="px-4 py-2 text-right text-xs text-gray-300">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-gray-800 divide-y divide-gray-700">
//                   {hotspotUsers.map(user => (
//                     <tr key={user.id}>
//                       <td className="px-4 py-2 text-sm text-gray-200">{user.client?.full_name || "Unknown"}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{user.plan?.name || "N/A"}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{user.mac}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{user.transaction?.status || "Pending"}</td>
//                       <td className="px-4 py-2 text-sm text-gray-300">{formatBytes(user.data_used)}</td>
//                       <td className="px-4 py-2 text-right">
//                         <Button onClick={() => disconnectHotspotUser(user.id)} label="Disconnect" icon={<LogOut />} color="bg-red-600 hover:bg-red-500" compact />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// // Reusable Components
// const Button = ({ onClick, label, icon, color, disabled, compact, fullWidth }) => (
//   <motion.button
//     whileHover={{ scale: disabled ? 1 : 1.05 }}
//     whileTap={{ scale: disabled ? 1 : 0.95 }}
//     onClick={onClick}
//     disabled={disabled}
//     className={`${color} ${compact ? "p-2" : "px-3 py-2"} ${fullWidth ? "w-full" : ""} text-white rounded-md flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
//   >
//     {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-1" : ""}` })}
//     {label && <span>{label}</span>}
//   </motion.button>
// );

// const Modal = ({ isOpen, title, onClose, children, size = "md" }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           className={`bg-gray-800 p-4 rounded-lg ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} w-full`}
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-200"><X className="w-5 h-5" /></button>
//           </div>
//           {children}
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// const InputField = ({ label, value, onChange, type = "text", placeholder, required }) => (
//   <div>
//     <label className="block text-sm text-gray-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500"
//     />
//   </div>
// );

// export default RouterManagement;






import React, { useReducer, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, Server, Upload, Settings, X, Users, RefreshCw, Plus, CheckCircle, Globe, Download, LogOut, LogIn, ChevronDown, ChevronUp, Trash2, Edit } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import api from "../../../api";

const initialState = {
  routers: [],
  activeRouter: null,
  isLoading: false,
  modals: {
    addRouter: false,
    editRouter: false,
    hotspotConfig: false,
    users: false,
  },
  routerForm: {
    name: "",
    ip: "",
    type: "mikrotik",
    port: "8728",
    username: "admin",
    password: "",
    location: "",
  },
  hotspotForm: {
    ssid: "SurfZone-WiFi",
    landingPage: null,
    redirectUrl: "http://captive.surfzone.local",
    bandwidthLimit: "10M",
    sessionTimeout: "60",
    authMethod: "universal",
  },
  hotspotUsers: [],
  expandedRouter: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ROUTERS": return { ...state, routers: action.payload };
    case "SET_ACTIVE_ROUTER": return { ...state, activeRouter: action.payload };
    case "SET_LOADING": return { ...state, isLoading: action.payload };
    case "TOGGLE_MODAL": return { ...state, modals: { ...state.modals, [action.modal]: !state.modals[action.modal] } };
    case "UPDATE_ROUTER_FORM": return { ...state, routerForm: { ...state.routerForm, ...action.payload } };
    case "UPDATE_HOTSPOT_FORM": return { ...state, hotspotForm: { ...state.hotspotForm, ...action.payload } };
    case "SET_HOTSPOT_USERS": return { ...state, hotspotUsers: action.payload };
    case "RESET_ROUTER_FORM": return { ...state, routerForm: initialState.routerForm };
    case "TOGGLE_ROUTER_EXPANDED": return { ...state, expandedRouter: state.expandedRouter === action.id ? null : action.id };
    case "UPDATE_ROUTER": return {
      ...state,
      routers: state.routers.map(r => r.id === action.payload.id ? { ...r, ...action.payload.data } : r),
      activeRouter: state.activeRouter?.id === action.payload.id ? { ...state.activeRouter, ...action.payload.data } : state.activeRouter,
    };
    case "DELETE_ROUTER": return {
      ...state,
      routers: state.routers.filter(r => r.id !== action.id),
      activeRouter: state.activeRouter?.id === action.id ? null : state.activeRouter,
    };
    default: return state;
  }
};

const getRouterStatusColor = (status) => ({
  "connected": "bg-green-100 text-green-600",
  "disconnected": "bg-red-100 text-red-600",
  "updating": "bg-yellow-100 text-yellow-600",
  "error": "bg-purple-100 text-purple-600",
}[status] || "bg-gray-100 text-gray-500");

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const timeSince = (dateString) => {
  const date = new Date(dateString);
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

const RouterManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { routers, activeRouter, isLoading, modals, routerForm, hotspotForm, hotspotUsers, expandedRouter } = state;

  const fetchRouters = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.get("/api/network_management/routers/");
      dispatch({ type: "SET_ROUTERS", payload: response.data });
      if (!activeRouter && response.data.length > 0) {
        dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data[0] });
      }
    } catch (error) {
      toast.error("Failed to fetch routers");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [activeRouter]);

  const fetchHotspotUsers = useCallback(async (routerId) => {
    if (!routerId) return;
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/hotspot-users/`);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: response.data });
    } catch (error) {
      toast.error("Failed to fetch hotspot users");
    }
  }, []);

  useEffect(() => {
    fetchRouters();
    const interval = setInterval(fetchRouters, 30000);
    return () => clearInterval(interval);
  }, [fetchRouters]);

  useEffect(() => {
    if (activeRouter) {
      fetchHotspotUsers(activeRouter.id);
      const interval = setInterval(() => fetchHotspotUsers(activeRouter.id), 10000);
      return () => clearInterval(interval);
    }
  }, [activeRouter, fetchHotspotUsers]);

  const addRouter = async () => {
    if (!routerForm.name || !routerForm.ip) {
      toast.warn("Name and IP are required");
      return;
    }
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post("/api/network_management/routers/", routerForm);
      dispatch({ type: "SET_ROUTERS", payload: [...routers, response.data] });
      dispatch({ type: "SET_ACTIVE_ROUTER", payload: response.data });
      dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" });
      dispatch({ type: "RESET_ROUTER_FORM" });
      toast.success("Router added successfully");
    } catch (error) {
      toast.error("Failed to add router");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateRouter = async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.put(`/api/network_management/routers/${id}/`, routerForm);
      dispatch({ type: "UPDATE_ROUTER", payload: { id, data: response.data } });
      dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" });
      toast.success("Router updated successfully");
    } catch (error) {
      toast.error("Failed to update router");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const deleteRouter = async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network trăm_management/routers/${id}/`);
      dispatch({ type: "DELETE_ROUTER", id });
      toast.success("Router deleted successfully");
    } catch (error) {
      toast.error("Failed to delete router");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const connectToRouter = async (routerId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "connect" });
      const updatedRouter = { ...routers.find(r => r.id === routerId), status: "connected" };
      dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
      if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
      toast.success("Router connected");
    } catch (error) {
      toast.error("Failed to connect");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const disconnectRouter = async (routerId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.post("/api/network_management/routers/bulk-action/", { router_ids: [routerId], action: "disconnect" });
      const updatedRouter = { ...routers.find(r => r.id === routerId), status: "disconnected" };
      dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
      if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
      toast.success("Router disconnected");
    } catch (error) {
      toast.error("Failed to disconnect");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const configureHotspot = async () => {
    if (!hotspotForm.landingPage) {
      toast.warn("Please upload the landing page");
      return;
    }
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const formData = new FormData();
      Object.entries(hotspotForm).forEach(([key, value]) => {
        if (key === "landingPage" && value) formData.append("landingPage", value);
        else if (value) formData.append(key, value);
      });
      await api.post(`/api/network_management/routers/${activeRouter.id}/hotspot-config/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" });
      toast.success("Hotspot configured successfully");
    } catch (error) {
      toast.error("Failed to configure hotspot");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const disconnectHotspotUser = async (userId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.delete(`/api/network_management/hotspot-users/${userId}/`);
      dispatch({ type: "SET_HOTSPOT_USERS", payload: hotspotUsers.filter(u => u.id !== userId) });
      toast.success("User disconnected");
    } catch (error) {
      toast.error("Failed to disconnect user");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="p-4 bg-gray-100 text-gray-900 font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="light" pauseOnHover newestOnTop />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <Server className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Router Management</h1>
            <p className="text-sm text-gray-500">{routers.length} routers • {routers.filter(r => r.status === "connected").length} online</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })} label="Add Router" icon={<Plus />} color="bg-indigo-600 hover:bg-indigo-700" />
        </div>
      </header>

      {/* Router List */}
      <section className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center"><Wifi className="w-5 h-5 mr-2 text-indigo-600" /> Routers</h2>
          <Button onClick={fetchRouters} icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />} color="bg-gray-200 hover:bg-gray-300" compact />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-4"><ThreeDots color="#6366F1" height={50} width={50} /></div>
        ) : routers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No routers found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routers.map(router => (
              <motion.div
                key={router.id}
                onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
                whileHover={{ scale: 1.03 }}
                className={`p-4 rounded-lg cursor-pointer bg-white hover:bg-gray-50 ${activeRouter?.id === router.id ? "ring-2 ring-indigo-500" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 truncate">{router.name}</p>
                    <p className="text-xs text-gray-500">{router.ip}:{router.port}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getRouterStatusColor(router.status)}`}>{router.status}</span>
                </div>
                {expandedRouter === router.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-gray-500">
                    <p>Location: {router.location || "N/A"}</p>
                    <div className="flex gap-2 mt-2">
                      <Button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" }); dispatch({ type: "UPDATE_ROUTER_FORM", payload: router }); }} label="Edit" icon={<Edit />} color="bg-indigo-600 hover:bg-indigo-700" compact />
                      <Button onClick={e => { e.stopPropagation(); deleteRouter(router.id); }} label="Delete" icon={<Trash2 />} color="bg-red-600 hover:bg-red-700" compact />
                      <Button onClick={e => { e.stopPropagation(); router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id); }} label={router.status === "connected" ? "Disconnect" : "Connect"} icon={router.status === "connected" ? <LogOut /> : <LogIn />} color={router.status === "connected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} compact />
                    </div>
                  </motion.div>
                )}
                <button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id }); }} className="w-full mt-2 text-gray-500 hover:text-gray-700 text-xs flex justify-center">
                  {expandedRouter === router.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Router Dashboard */}
      {activeRouter && (
        <section className="bg-white p-4 rounded-lg shadow mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center mb-2 sm:mb-0"><Server className="w-5 h-5 mr-2 text-indigo-600" /> {activeRouter.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => activeRouter.status === "connected" ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id)} label={activeRouter.status === "connected" ? "Disconnect" : "Connect"} icon={activeRouter.status === "connected" ? <LogOut /> : <LogIn />} color={activeRouter.status === "connected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} />
              <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} label="Configure Hotspot" icon={<Globe />} color="bg-indigo-600 hover:bg-indigo-700" disabled={activeRouter.status !== "connected"} />
              <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} label="Hotspot Users" icon={<Users />} color="bg-teal-600 hover:bg-teal-700" disabled={activeRouter.status !== "connected"} />
            </div>
          </div>

          {/* Hotspot Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 flex items-center"><Globe className="w-5 h-5 mr-2 text-indigo-600" /> Hotspot Status</h3>
            {activeRouter.status === "connected" ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-500">Users</p><p className="text-gray-900">{hotspotUsers.length}</p>
                <p className="text-gray-500">Data Used</p><p className="text-gray-900">{formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0))}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Router must be connected to manage Hotspot</p>
            )}
          </div>
        </section>
      )}

      {/* Modals */}
      <Modal isOpen={modals.addRouter} title="Add MikroTik Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}>
        <div className="space-y-4">
          <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
          <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
          <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
          <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
          <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
          <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
          <Button onClick={addRouter} label={isLoading ? "Adding..." : "Add"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !routerForm.name || !routerForm.ip} fullWidth />
        </div>
      </Modal>

      <Modal isOpen={modals.editRouter} title="Edit MikroTik Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}>
        <div className="space-y-4">
          <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
          <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
          <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
          <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
          <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
          <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
          <div className="flex gap-2">
            <Button onClick={() => updateRouter(activeRouter.id)} label={isLoading ? "Saving..." : "Save"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !routerForm.name || !routerForm.ip} fullWidth />
            <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })} label="Cancel" icon={<X />} color="bg-gray-200 hover:bg-gray-300" fullWidth />
          </div>
        </div>
      </Modal>

      <Modal isOpen={modals.hotspotConfig} title="Configure Hotspot" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })}>
        <div className="space-y-4">
          <InputField label="SSID" value={hotspotForm.ssid} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { ssid: e.target.value } })} placeholder="SurfZone-WiFi" required />
          <InputField label="Redirect URL" value={hotspotForm.redirectUrl} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { redirectUrl: e.target.value } })} placeholder="http://captive.surfzone.local" required />
          <InputField label="Bandwidth Limit" value={hotspotForm.bandwidthLimit} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { bandwidthLimit: e.target.value } })} placeholder="10M" />
          <InputField label="Session Timeout (min)" type="number" value={hotspotForm.sessionTimeout} onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { sessionTimeout: e.target.value } })} placeholder="60" />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Landing Page (App.js)</label>
            <input type="file" accept=".js" onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { landingPage: e.target.files[0] } })} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900" />
          </div>
          <Button onClick={configureHotspot} label={isLoading ? "Configuring..." : "Setup"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !hotspotForm.landingPage} fullWidth />
        </div>
      </Modal>

      <Modal isOpen={modals.users} title="Hotspot Users" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} size="lg">
        <div className="space-y-4">
          {hotspotUsers.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No active users</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Client</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Plan</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">MAC</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Payment</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Data Used</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hotspotUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.client?.full_name || "Unknown"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{user.plan?.name || "N/A"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{user.mac}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{user.transaction?.status || "Pending"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{formatBytes(user.data_used)}</td>
                      <td className="px-4 py-2 text-right">
                        <Button onClick={() => disconnectHotspotUser(user.id)} label="Disconnect" icon={<LogOut />} color="bg-red-600 hover:bg-red-700" compact />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// Reusable Components
const Button = ({ onClick, label, icon, color, disabled, compact, fullWidth }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`${color} ${compact ? "p-2" : "px-3 py-2"} ${fullWidth ? "w-full" : ""} text-white rounded-md flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {icon && React.cloneElement(icon, { className: `w-4 h-4 ${label ? "mr-1" : ""}` })}
    {label && <span>{label}</span>}
  </motion.button>
);

const Modal = ({ isOpen, title, onClose, children, size = "md" }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white p-4 rounded-lg ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} w-full`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const InputField = ({ label, value, onChange, type = "text", placeholder, required }) => (
  <div>
    <label className="block text-sm text-gray-700 mb-1">{label} {required && <span className="text-red-600">*</span>}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

export default RouterManagement;