
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





import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, Server, UploadCloud, Globe, Lock, Zap, Settings, Menu, X, 
  Download, Upload, Activity, Shield, BarChart, FileText 
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BarLoader } from 'react-spinners';
import api from '../../../api'; 

const RouterManagement = () => {
  const [routers, setRouters] = useState([]);
  const [currentRouter, setCurrentRouter] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [routerConfig, setRouterConfig] = useState({ host: '', user: 'admin', initial_password: '', port: 22 });
  const [importFile, setImportFile] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({ cpu: 0, memory: 0, clients: 0 });

  // Fetch initial data
  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/internet_plans/');
      setPlans(response.data.results || response.data);
    } catch (err) {
      setError(`Failed to fetch plans: ${err.message}`);
      toast.error(`Plans fetch failed`);
    }
  };

  const fetchRouters = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/network_management/routers/');
      setRouters(response.data);
      if (response.data.length > 0 && !currentRouter) setCurrentRouter(response.data[0]);
    } catch (err) {
      setError(`Failed to fetch routers: ${err.message}`);
      toast.error(`Routers fetch failed`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchRouters();
    const interval = setInterval(() => currentRouter && fetchRealTimeStats(), 5000); // Real-time stats every 5s
    return () => clearInterval(interval);
  }, [currentRouter]);

  // Router actions
  const connectToRouter = async (routerId) => {
    try {
      setIsLoading(true);
      const response = await api.post(`/api/network_management/routers/${routerId}/connect/`);
      updateRouterState(response.data);
      toast.success(`Connected to ${response.data.name}`);
    } catch (err) {
      setError(`Connection failed: ${err.response?.data?.error || err.message}`);
      toast.error(`Connection failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectRouter = async () => {
    if (!currentRouter) return;
    try {
      setIsLoading(true);
      const response = await api.post(`/api/network_management/routers/${currentRouter.id}/disconnect/`);
      updateRouterState(response.data);
      toast.success(`Disconnected ${response.data.name}`);
    } catch (err) {
      setError(`Disconnect failed: ${err.response?.data?.error || err.message}`);
      toast.error(`Disconnect failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealTimeStats = async () => {
    if (!currentRouter || currentRouter.status !== 'Connected') return;
    try {
      const response = await api.get(`/api/network_management/routers/${currentRouter.id}/status/`);
      setRealTimeStats({
        cpu: response.data.cpu_usage || 0,
        memory: parseInt(response.data.bandwidth.split(' ')[0]) || 0,
        clients: response.data.active_clients || 0,
      });
      updateRouterState(response.data);
    } catch (err) {
      console.error('Real-time stats fetch failed:', err);
    }
  };

  const updateFirmware = async () => {
    if (!currentRouter || !firmwareVersion) {
      toast.warn('Select a router and enter a firmware version');
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.post(`/api/network_management/routers/${currentRouter.id}/firmware/`, { version: firmwareVersion });
      updateRouterState(response.data);
      setFirmwareVersion('');
      toast.success(`Firmware updated to ${response.data.version}`);
    } catch (err) {
      setError(`Firmware update failed: ${err.response?.data?.error || err.message}`);
      toast.error(`Firmware update failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const enableInternetSharing = async () => {
    if (!currentRouter) return;
    try {
      setIsLoading(true);
      const selectedPlanId = document.getElementById('planSelect')?.value;
      const response = await api.post(`/api/network_management/routers/${currentRouter.id}/share-internet/`, { plan_id: selectedPlanId || null });
      toast.success('Internet sharing enabled');
      if (selectedPlanId) {
        const plan = plans.find((p) => p.id === parseInt(selectedPlanId));
        toast.info(`Assigned "${plan.name}" to new client`);
      }
    } catch (err) {
      setError(`Internet sharing failed: ${err.response?.data?.error || err.message}`);
      toast.error(`Internet sharing failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRouterConfig = async () => {
    if (!routerConfig.host || !routerConfig.user || !routerConfig.initial_password) {
      toast.warn('Host, user, and initial password are required');
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.post('/api/network_management/routers/', {
        ...routerConfig,
        name: `Router-${Date.now()}`,
      });
      setRouters((prev) => [...prev, response.data]);
      setConfigModalOpen(false);
      setRouterConfig({ host: '', user: 'admin', initial_password: '', port: 22 }); // Reset form
      toast.success('Router added and SSH key deployed');
      await connectToRouter(response.data.id);
    } catch (err) {
      setError(`Failed to save router: ${err.response?.data?.error || err.message}`);
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportConfig = async () => {
    if (!currentRouter) return;
    try {
      const response = await api.get(`/api/network_management/routers/${currentRouter.id}/export/`);
      const blob = new Blob([response.data.config], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentRouter.name}_config.rsc`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Configuration exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const importConfig = async () => {
    if (!currentRouter || !importFile) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await api.post(`/api/network_management/routers/${currentRouter.id}/import/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateRouterState(response.data);
      setImportModalOpen(false);
      toast.success('Configuration imported');
    } catch (err) {
      setError(`Import failed: ${err.response?.data?.error || err.message}`);
      toast.error(`Import failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRouterState = (updatedRouter) => {
    setRouters((prev) => prev.map((r) => (r.id === updatedRouter.id ? updatedRouter : r)));
    setCurrentRouter(updatedRouter);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-2xl z-50 lg:relative lg:translate-x-0"
      >
        <div className="p-6 flex items-center justify-between border-b border-indigo-700">
          <h2 className="text-2xl font-bold flex items-center">
            <Server className="w-6 h-6 mr-2" /> Router Hub
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-3">
          {routers.map((router) => (
            <motion.button
              key={router.id}
              onClick={() => setCurrentRouter(router)}
              whileHover={{ scale: 1.05 }}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${
                currentRouter?.id === router.id ? 'bg-indigo-700' : 'hover:bg-indigo-600'
              }`}
            >
              <span className="flex items-center">
                <Wifi className="w-5 h-5 mr-2" /> {router.name}
              </span>
              <span className={`text-sm ${router.status === 'Connected' ? 'text-green-300' : 'text-red-300'}`}>
                {router.status}
              </span>
            </motion.button>
          ))}
          <motion.button
            onClick={() => setConfigModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center"
          >
            <Settings className="w-5 h-5 mr-2" /> Add Router
          </motion.button>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-indigo-600 text-white rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-800 flex items-center"
          >
            <Server className="w-8 h-8 mr-2 text-indigo-600" /> Router Control Center
          </motion.h1>
        </header>

        {isLoading && (
          <div className="flex justify-center py-12">
            <BarLoader color="#4F46E5" width={150} height={6} />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex items-center"
          >
            <AlertCircle className="w-6 h-6 mr-2" /> {error}
          </motion.div>
        )}

        {!isLoading && (
          <div className="space-y-8">
            {/* Overview Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Status" value={currentRouter?.status || 'N/A'} icon={<Wifi className="w-6 h-6 text-indigo-600" />} color={currentRouter?.status === 'Connected' ? 'text-green-600' : 'text-red-600'} />
              <StatCard title="Uptime" value={currentRouter?.uptime || 'N/A'} icon={<Activity className="w-6 h-6 text-indigo-600" />} />
              <StatCard title="Firmware" value={currentRouter?.version || 'Unknown'} icon={<Shield className="w-6 h-6 text-indigo-600" />} />
              <StatCard title="Clients" value={realTimeStats.clients} icon={<BarChart className="w-6 h-6 text-indigo-600" />} />
            </section>

            {/* Control Panel */}
            <section className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Control Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ControlButton
                  onClick={() => (currentRouter?.status === 'Connected' ? disconnectRouter() : connectToRouter(currentRouter?.id))}
                  label={currentRouter?.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  icon={<Lock className="w-5 h-5" />}
                  color={currentRouter?.status === 'Connected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  disabled={!currentRouter}
                />
                <ControlButton onClick={fetchRealTimeStats} label="Refresh Stats" icon={<Zap className="w-5 h-5" />} color="bg-indigo-600 hover:bg-indigo-700" disabled={!currentRouter} />
                <ControlButton onClick={exportConfig} label="Export Config" icon={<Download className="w-5 h-5" />} color="bg-gray-600 hover:bg-gray-700" disabled={!currentRouter} />
              </div>
            </section>

            {/* Firmware & Sharing */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <UploadCloud className="w-6 h-6 mr-2 text-green-600" /> Firmware Update
                </h2>
                <input
                  type="text"
                  value={firmwareVersion}
                  onChange={(e) => setFirmwareVersion(e.target.value)}
                  placeholder="e.g., 7.11"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
                />
                <ControlButton onClick={updateFirmware} label="Update Firmware" icon={<UploadCloud className="w-5 h-5" />} color="bg-green-600 hover:bg-green-700" disabled={!currentRouter} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-600" /> Internet Sharing
                </h2>
                <select id="planSelect" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4">
                  <option value="">Select a Plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} Ksh
                    </option>
                  ))}
                </select>
                <ControlButton onClick={enableInternetSharing} label="Enable Sharing" icon={<Globe className="w-5 h-5" />} color="bg-blue-600 hover:bg-blue-700" disabled={!currentRouter} />
              </div>
            </section>

            {/* Real-Time Monitoring */}
            <section className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-Time Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProgressBar label="CPU Usage" value={realTimeStats.cpu} color="bg-indigo-600" />
                <ProgressBar label="Memory Free" value={realTimeStats.memory} max={1000} color="bg-green-600" />
                <ProgressBar label="Active Clients" value={realTimeStats.clients} max={50} color="bg-blue-600" />
              </div>
            </section>
          </div>
        )}

        {/* Config Modal */}
        <Modal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} title="Add New Router">
          <div className="space-y-4">
            <InputField 
              label="Host" 
              value={routerConfig.host} 
              onChange={(e) => setRouterConfig({ ...routerConfig, host: e.target.value })} 
              placeholder="e.g., 192.168.1.1" 
            />
            <InputField 
              label="Username" 
              value={routerConfig.user} 
              onChange={(e) => setRouterConfig({ ...routerConfig, user: e.target.value })} 
              placeholder="admin" 
            />
            <InputField 
              label="Initial Password" 
              type="password" 
              value={routerConfig.initial_password} 
              onChange={(e) => setRouterConfig({ ...routerConfig, initial_password: e.target.value })} 
              placeholder="Temporary password" 
            />
            <InputField 
              label="Port" 
              type="number" 
              value={routerConfig.port} 
              onChange={(e) => setRouterConfig({ ...routerConfig, port: parseInt(e.target.value) || 22 })} 
              placeholder="22" 
            />
            <ControlButton onClick={saveRouterConfig} label="Save & Connect" icon={<Settings className="w-5 h-5" />} color="bg-indigo-600 hover:bg-indigo-700" />
          </div>
        </Modal>

        {/* Import Modal */}
        <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Configuration">
          <div className="space-y-4">
            <input type="file" accept=".rsc" onChange={(e) => setImportFile(e.target.files[0])} className="w-full p-3 border rounded-lg" />
            <ControlButton onClick={importConfig} label="Import Config" icon={<Upload className="w-5 h-5" />} color="bg-indigo-600 hover:bg-indigo-700" disabled={!importFile} />
          </div>
        </Modal>
      </main>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon, color = 'text-gray-800' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl shadow-lg flex items-center">
    {icon}
    <div className="ml-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-lg font-semibold ${color}`}>{value}</p>
    </div>
  </motion.div>
);

const ControlButton = ({ onClick, label, icon, color, disabled }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    onClick={onClick}
    disabled={disabled}
    className={`p-3 ${color} text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {icon} <span className="ml-2">{label}</span>
  </motion.button>
);

const ProgressBar = ({ label, value, max = 100, color }) => (
  <div>
    <p className="text-sm text-gray-600 mb-2">{label}: {value}/{max}</p>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        className={`${color} h-2.5 rounded-full`}
      />
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button onClick={onClose}><X className="w-6 h-6 text-gray-600" /></button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 mt-1"
    />
  </div>
);

export default RouterManagement;