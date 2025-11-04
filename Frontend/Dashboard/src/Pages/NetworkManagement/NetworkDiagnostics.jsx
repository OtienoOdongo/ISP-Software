

// // src/components/NetworkManagement/NetworkDiagnostics.jsx
// import React, { useState, useCallback, useEffect, useMemo } from 'react';
// import {
//   Activity, Wifi, Server, Download, Upload,
//   Clock, AlertCircle, CheckCircle, XCircle,
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network, Router
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../api';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
// import { useTheme } from '../../context/ThemeContext';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const validateIp = (ip) => {
//   const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//   return ip ? ipRegex.test(ip) : false;
// };

// const validateDomain = (domain) => {
//   const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
//   return domain ? domainRegex.test(domain) : false;
// };

// const NetworkDiagnostics = ({ routerId: propRouterId }) => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: 'example.com' },
//     traceroute: { result: null, status: 'idle', target: 'example.com' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { download: null, upload: null, status: 'idle', server: null, isp: null, latency: null, jitter: null },
//     clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null, device: null, connectionType: null },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//     packetLoss: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [historicalData, setHistoricalData] = useState({
//     isp: { minute: [], hour: [], day: [], month: [] },
//     client: { minute: [], hour: [], day: [], month: [] },
//   });
//   const [loading, setLoading] = useState(false);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');
//   const [expandedTest, setExpandedTest] = useState(null);
//   const [speedTestRunning, setSpeedTestRunning] = useState(false);
//   const [clientIp, setClientIp] = useState('');
//   const [timeFrame, setTimeFrame] = useState('hour');
//   const [isClientIpValid, setIsClientIpValid] = useState(true);
//   const [isTargetValid, setIsTargetValid] = useState(true);
//   const [routers, setRouters] = useState([]);
//   const [selectedRouterId, setSelectedRouterId] = useState(propRouterId || '');
//   const { theme } = useTheme();

//   // Theme-based styling variables
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

//   const fetchHistoricalData = useCallback(async () => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId)) || !clientIp || !validateIp(clientIp)) {
//       setHistoricalData({ isp: { minute: [], hour: [], day: [], month: [] }, client: { minute: [], hour: [], day: [], month: [] } });
//       return;
//     }

//     try {
//       const response = await api.get(`/api/network_management/speed-test-history/?router=${selectedRouterId}&client_ip=${clientIp}`);
//       if (!response.data || typeof response.data !== 'object') {
//         throw new Error('Invalid historical data response');
//       }
//       setHistoricalData(response.data);
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to fetch historical speed data';
//       toast.error(errorMessage);
//     }
//   }, [selectedRouterId, clientIp]);

//   useEffect(() => {
//     fetchRouters();
//   }, [fetchRouters]);

//   useEffect(() => {
//     if (clientIp && validateIp(clientIp)) {
//       fetchHistoricalData();
//     }
//   }, [clientIp, fetchHistoricalData]);

//   const runDiagnostics = useCallback(async () => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
//       toast.error('Please select a valid router');
//       return;
//     }
//     if (!diagnosticsTarget || !validateDomain(diagnosticsTarget)) {
//       toast.error('Invalid target domain');
//       setIsTargetValid(false);
//       return;
//     }
//     if (!clientIp || !validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       setIsClientIpValid(false);
//       return;
//     }

//     setLoading(true);
//     setIsTargetValid(true);
//     setIsClientIpValid(true);

//     try {
//       const response = await api.post('/api/network_management/tests/bulk/', {
//         router_id: parseInt(selectedRouterId),
//         target: diagnosticsTarget,
//         client_ip: clientIp,
//       });

//       if (!response.data || !Array.isArray(response.data)) {
//         throw new Error('Invalid diagnostics response');
//       }

//       const updatedDiagnostics = response.data.reduce((acc, test) => {
//         const testType = test.test_type === 'health_check' ? 'healthCheck' : test.test_type;
//         if (!['ping', 'traceroute', 'healthCheck', 'speedtest', 'dns', 'packetLoss'].includes(testType)) {
//           return acc;
//         }
//         acc[testType] = {
//           result: test.result || null,
//           status: test.status || 'error',
//           target: test.target || diagnosticsTarget,
//           ...(testType === 'speedtest' ? { clientIp } : {}),
//           details: testType === 'speedtest' ? test.result?.speed_test : test.result?.[testType === 'healthCheck' ? 'health_check' : testType],
//         };
//         return acc;
//       }, { ...diagnostics });

//       setDiagnostics(updatedDiagnostics);
//       fetchHistoricalData();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to run diagnostics';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [diagnosticsTarget, clientIp, selectedRouterId, diagnostics, fetchHistoricalData]);

//   const runSpeedTest = useCallback(async (type) => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
//       toast.error('Please select a valid router');
//       return;
//     }
//     if (!clientIp || !validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       setIsClientIpValid(false);
//       return;
//     }

//     setSpeedTestRunning(true);
//     setIsClientIpValid(true);
//     setDiagnostics(prev => ({
//       ...prev,
//       bandwidth: { ...prev.bandwidth, status: 'running' },
//       clientBandwidth: { ...prev.clientBandwidth, status: 'running' },
//     }));

//     try {
//       const response = await api.post('/api/network_management/tests/', {
//         router_id: parseInt(selectedRouterId),
//         test_type: 'speedtest',
//         target: '',
//         client_ip: clientIp,
//         test_mode: type,
//       });

//       if (!response.data?.result?.speed_test) {
//         throw new Error('Invalid speed test response');
//       }

//       const speedTest = response.data.result.speed_test;
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: {
//           download: Number(speedTest.download) || null,
//           upload: Number(speedTest.upload) || null,
//           status: 'success',
//           server: speedTest.server || 'Unknown',
//           isp: speedTest.isp || 'Unknown',
//           latency: Number(speedTest.latency) || null,
//           jitter: Number(speedTest.jitter) || null,
//         },
//         clientBandwidth: {
//           download: Number(speedTest.client_download) || null,
//           upload: Number(speedTest.client_upload) || null,
//           status: 'success',
//           clientIp,
//           device: speedTest.device || 'Unknown',
//           connectionType: speedTest.connection_type || 'Unknown',
//         },
//       }));
//       toast.success('Speed test completed');
//       fetchHistoricalData();
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Speed test failed';
//       toast.error(errorMessage);
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: { ...prev.bandwidth, status: 'error' },
//         clientBandwidth: { ...prev.clientBandwidth, status: 'error' },
//       }));
//     } finally {
//       setSpeedTestRunning(false);
//     }
//   }, [clientIp, selectedRouterId, fetchHistoricalData]);

//   const renderStatusIcon = useCallback((status) => {
//     const icons = {
//       running: <RefreshCw className={`${theme === "dark" ? "text-yellow-400" : "text-yellow-600"} inline-block mr-2 animate-spin`} />,
//       success: <CheckCircle className={`${theme === "dark" ? "text-green-400" : "text-green-600"} inline-block mr-2`} />,
//       error: <XCircle className={`${theme === "dark" ? "text-red-400" : "text-red-600"} inline-block mr-2`} />,
//       idle: <Clock className={`${textSecondaryClass} inline-block mr-2`} />,
//     };
//     return icons[status] || icons.idle;
//   }, [theme, textSecondaryClass]);

//   const getStatusColor = useCallback((status) => {
//     const colors = theme === 'dark' ? {
//       success: 'bg-green-900 text-green-300',
//       error: 'bg-red-900 text-red-300',
//       running: 'bg-yellow-900 text-yellow-300',
//       idle: 'bg-gray-800 text-gray-300',
//     } : {
//       success: 'bg-green-100 text-green-800',
//       error: 'bg-red-100 text-red-800',
//       running: 'bg-yellow-100 text-yellow-800',
//       idle: 'bg-gray-100 text-gray-800',
//     };
//     return colors[status] || colors.idle;
//   }, [theme]);

//   const formatSpeed = useCallback((speed) => {
//     return speed != null ? `${speed.toFixed(2)} Mbps` : 'N/A';
//   }, []);

//   const calculateEfficiency = useCallback((client, isp) => {
//     if (isp == null || isp === 0 || client == null) return 0;
//     return Math.min(100, Math.round((client / isp) * 100));
//   }, []);

//   const toggleTestExpansion = useCallback((testName) => {
//     setExpandedTest(prev => (prev === testName ? null : testName));
//   }, []);

//   const chartData = useMemo(() => ({
//     labels:
//       historicalData.isp[timeFrame]?.length > 0
//         ? historicalData.isp[timeFrame].map(d => new Date(d.timestamp).toLocaleString())
//         : [],
//     datasets: [
//       {
//         label: 'ISP Download',
//         data: historicalData.isp[timeFrame]?.map(d => Number(d.download) || 0) || [],
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//       {
//         label: 'ISP Upload',
//         data: historicalData.isp[timeFrame]?.map(d => Number(d.upload) || 0) || [],
//         borderColor: 'rgb(255, 99, 132)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Download',
//         data: historicalData.client[timeFrame]?.map(d => Number(d.download) || 0) || [],
//         borderColor: 'rgb(54, 162, 235)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Upload',
//         data: historicalData.client[timeFrame]?.map(d => Number(d.upload) || 0) || [],
//         borderColor: 'rgb(255, 206, 86)',
//         tension: 0.1,
//       },
//     ],
//   }), [historicalData, timeFrame]);

//   const chartOptions = useMemo(() => ({
//     responsive: true,
//     plugins: {
//       legend: { 
//         position: 'top',
//         labels: {
//           color: theme === 'dark' ? '#e5e7eb' : '#374151'
//         }
//       },
//       title: { 
//         display: true, 
//         text: 'Speed Test History',
//         color: theme === 'dark' ? '#e5e7eb' : '#374151'
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: { 
//           display: true, 
//           text: 'Speed (Mbps)',
//           color: theme === 'dark' ? '#9ca3af' : '#6b7280'
//         },
//         grid: { 
//           color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
//         },
//         ticks: { 
//           color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
//         }
//       },
//       x: {
//         grid: { 
//           color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
//         },
//         ticks: { 
//           color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
//         }
//       }
//     },
//   }), [theme]);

//   return (
//     <div className={containerClass} role="region" aria-label="Network Diagnostics">
//       <ToastContainer position="top-right" autoClose={3000} theme={theme} />

//       <header className={`${cardClass} flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-6 transition-colors duration-300`}>
//         <div className="flex items-center space-x-4 mb-4 md:mb-0">
//           <Activity className="w-8 h-8 text-indigo-500" aria-hidden="true" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-500">Network Diagnostics</h1>
//             <p className={`text-sm ${textSecondaryClass}`}>Comprehensive network analysis and speed testing</p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           {routers.length === 0 ? (
//             <div className={`flex-1 border-l-4 p-3 rounded-lg w-full transition-colors duration-300 ${
//               theme === "dark" ? "bg-yellow-900 border-yellow-500 text-yellow-300" : "bg-yellow-100 border-yellow-500 text-yellow-700"
//             }`}>
//               <div className="flex items-center">
//                 <AlertCircle className="w-5 h-5 mr-2" />
//                 <p>
//                   No routers configured. Please{' '}
//                   <button
//                     onClick={() => toast.info('Navigate to Router Management and click "Add Router" to configure a new router.')}
//                     className="text-indigo-400 underline hover:text-indigo-300"
//                   >
//                     add a router
//                   </button>{' '}
//                   in the Router Management section to run diagnostics.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="relative flex-1">
//                 <label htmlFor="router-select" className="sr-only">Select Router</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Server className={`h-5 w-5 ${textTertiaryClass}`} aria-hidden="true" />
//                 </div>
//                 <select
//                   id="router-select"
//                   value={selectedRouterId}
//                   onChange={(e) => setSelectedRouterId(e.target.value)}
//                   className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300`}
//                   aria-label="Select router for diagnostics"
//                 >
//                   <option value="">Select a router</option>
//                   {routers.map(router => (
//                     <option key={router.id} value={router.id}>
//                       {router.name} ({router.ip})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="relative flex-1">
//                 <label htmlFor="target-domain" className="sr-only">Target Domain</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Network className={`h-5 w-5 ${textTertiaryClass}`} aria-hidden="true" />
//                 </div>
//                 <input
//                   id="target-domain"
//                   type="text"
//                   className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300 ${
//                     isTargetValid ? "" : "border-red-500"
//                   }`}
//                   placeholder="Enter target (e.g., example.com)"
//                   value={diagnosticsTarget}
//                   onChange={(e) => {
//                     setDiagnosticsTarget(e.target.value);
//                     setIsTargetValid(e.target.value ? validateDomain(e.target.value) : true);
//                   }}
//                   disabled={!selectedRouterId || isNaN(parseInt(selectedRouterId))}
//                   aria-label="Target domain for diagnostics"
//                   aria-invalid={!isTargetValid}
//                   aria-describedby={isTargetValid ? undefined : 'target-domain-error'}
//                 />
//                 {!isTargetValid && (
//                   <p id="target-domain-error" className="text-red-400 text-xs mt-1">Please enter a valid domain</p>
//                 )}
//               </div>
//               <div className="relative flex-1">
//                 <label htmlFor="client-ip" className="sr-only">Client IP</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Wifi className={`h-5 w-5 ${textTertiaryClass}`} aria-hidden="true" />
//                 </div>
//                 <input
//                   id="client-ip"
//                   type="text"
//                   className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300 ${
//                     isClientIpValid ? "" : "border-red-500"
//                   }`}
//                   placeholder="Client IP (e.g., 192.168.1.100)"
//                   value={clientIp}
//                   onChange={(e) => {
//                     setClientIp(e.target.value);
//                     setIsClientIpValid(e.target.value ? validateIp(e.target.value) : true);
//                   }}
//                   disabled={!selectedRouterId || isNaN(parseInt(selectedRouterId))}
//                   aria-label="Client IP address"
//                   aria-invalid={!isClientIpValid}
//                   aria-describedby={isClientIpValid ? undefined : 'client-ip-error'}
//                 />
//                 {!isClientIpValid && (
//                   <p id="client-ip-error" className="text-red-400 text-xs mt-1">Please enter a valid IP address</p>
//                 )}
//               </div>
//               <button
//                 className={`px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors duration-300 ${
//                   theme === "dark" 
//                     ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
//                     : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                 }`}
//                 onClick={runDiagnostics}
//                 disabled={loading || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !isTargetValid || !diagnosticsTarget || !clientIp}
//                 aria-label="Run network diagnostics"
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
//                     Running...
//                   </>
//                 ) : (
//                   <>
//                     <Activity className="w-5 h-5 mr-2" aria-hidden="true" />
//                     Run Diagnostics
//                   </>
//                 )}
//               </button>
//             </>
//           )}
//         </div>
//       </header>

//       {selectedRouterId && !isNaN(parseInt(selectedRouterId)) ? (
//         <>
//           <div className={`${cardClass} p-6 mb-6 transition-colors duration-300`}>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold flex items-center text-indigo-500">
//                 <Gauge className="w-5 h-5 mr-2" aria-hidden="true" />
//                 Bandwidth Speed Test
//               </h2>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => runSpeedTest('full')}
//                   disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
//                   className={`px-3 py-1 rounded-lg text-sm flex items-center disabled:opacity-50 transition-colors duration-300 ${
//                     theme === "dark" 
//                       ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
//                       : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                   }`}
//                   aria-label="Run full speed test"
//                 >
//                   {speedTestRunning ? (
//                     <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
//                   ) : (
//                     <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//                   )}
//                   Full Test
//                 </button>
//                 <button
//                   onClick={() => runSpeedTest('quick')}
//                   disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
//                   className={`px-3 py-1 rounded-lg text-sm flex items-center disabled:opacity-50 transition-colors duration-300 ${
//                     theme === "dark" 
//                       ? "bg-gray-700 hover:bg-gray-600 text-white" 
//                       : "bg-gray-200 hover:bg-gray-300 text-gray-800"
//                   }`}
//                   aria-label="Run quick speed test"
//                 >
//                   <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//                   Quick Test
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className={`${cardClass} p-4 transition-colors duration-300`}>
//                 <h3 className={`font-medium mb-3 flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.bandwidth.status)}
//                   ISP Connection Speed
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className={`${cardClass} p-3 transition-colors duration-300`}>
//                     <p className={`text-sm ${textSecondaryClass}`}>Download</p>
//                     <p className="text-xl font-bold text-green-500">{formatSpeed(diagnostics.bandwidth.download)}</p>
//                   </div>
//                   <div className={`${cardClass} p-3 transition-colors duration-300`}>
//                     <p className={`text-sm ${textSecondaryClass}`}>Upload</p>
//                     <p className="text-xl font-bold text-blue-500">{formatSpeed(diagnostics.bandwidth.upload)}</p>
//                   </div>
//                 </div>
//                 {diagnostics.bandwidth.status === 'success' && (
//                   <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
//                     <p className={textSecondaryClass}>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
//                     <p className={textSecondaryClass}>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
//                     <p className={textSecondaryClass}>Latency: {diagnostics.bandwidth.latency != null ? `${diagnostics.bandwidth.latency.toFixed(2)} ms` : 'N/A'}</p>
//                     <p className={textSecondaryClass}>Jitter: {diagnostics.bandwidth.jitter != null ? `${diagnostics.bandwidth.jitter.toFixed(2)} ms` : 'N/A'}</p>
//                   </div>
//                 )}
//               </div>

//               <div className={`${cardClass} p-4 transition-colors duration-300`}>
//                 <h3 className={`font-medium mb-3 flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.clientBandwidth.status)}
//                   Client Speed ({clientIp || 'N/A'})
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className={`${cardClass} p-3 transition-colors duration-300`}>
//                     <p className={`text-sm ${textSecondaryClass}`}>Download</p>
//                     <p className="text-xl font-bold text-green-500">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
//                   </div>
//                   <div className={`${cardClass} p-3 transition-colors duration-300`}>
//                     <p className={`text-sm ${textSecondaryClass}`}>Upload</p>
//                     <p className="text-xl font-bold text-blue-500">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
//                   </div>
//                 </div>
//                 {diagnostics.clientBandwidth.status === 'success' && (
//                   <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
//                     <p className={textSecondaryClass}>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                     <p className={textSecondaryClass}>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//               <div className={`${cardClass} mt-4 p-4 transition-colors duration-300`}>
//                 <h3 className={`font-medium mb-3 ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>Bandwidth Comparison</h3>
//                 <div className="space-y-2">
//                   <div>
//                     <p className={`text-sm mb-1 ${textSecondaryClass}`}>Download Efficiency</p>
//                     <div className={`w-full rounded-full h-2.5 ${
//                       theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//                     } transition-colors duration-300`}>
//                       <div
//                         className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
//                         style={{
//                           width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
//                         }}
//                         role="progressbar"
//                         aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                       ></div>
//                     </div>
//                     <p className={`text-xs mt-1 ${textSecondaryClass}`}>
//                       Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
//                       {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm mb-1 ${textSecondaryClass}`}>Upload Efficiency</p>
//                     <div className={`w-full rounded-full h-2.5 ${
//                       theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//                     } transition-colors duration-300`}>
//                       <div
//                         className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
//                         style={{
//                           width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
//                         }}
//                         role="progressbar"
//                         aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                       ></div>
//                     </div>
//                     <p className={`text-xs mt-1 ${textSecondaryClass}`}>
//                       Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
//                       {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {historicalData.isp[timeFrame]?.length > 0 && (
//               <div className={`${cardClass} mt-4 p-4 transition-colors duration-300`}>
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className={`font-medium ${
//                     theme === "dark" ? "text-white" : "text-gray-800"
//                   }`}>Historical Speed Data</h3>
//                   <div>
//                     <label htmlFor="timeframe-select" className="sr-only">
//                       Select Time Frame
//                     </label>
//                     <select
//                       id="timeframe-select"
//                       value={timeFrame}
//                       onChange={(e) => setTimeFrame(e.target.value)}
//                       className={`p-2 border rounded-lg text-sm ${inputClass} transition-colors duration-300`}
//                       aria-label="Select time frame for historical data"
//                     >
//                       <option value="minute">Last Hour (Minutes)</option>
//                       <option value="hour">Last Day (Hours)</option>
//                       <option value="day">Last Month (Days)</option>
//                       <option value="month">Last Year (Months)</option>
//                     </select>
//                   </div>
//                 </div>
//                 <Line
//                   data={chartData}
//                   options={chartOptions}
//                 />
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             {/* Ping Test Section */}
//             <div
//               className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
//                 expandedTest === 'ping' ? "ring-2 ring-indigo-500" : ""
//               }`}
//               onClick={() => toggleTestExpansion('ping')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//               aria-expanded={expandedTest === 'ping'}
//               aria-label="Ping Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className={`font-semibold flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.ping.status)}
//                   Ping Test ({diagnostics.ping.target})
//                 </h3>
//                 <button
//                   className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
//                   aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
//                 >
//                   {expandedTest === 'ping' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${textSecondaryClass}`}>
//                 {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg.toFixed(2)}ms` : 'No data yet.'}
//               </p>

//               {expandedTest === 'ping' && diagnostics.ping.result && (
//                 <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
//                   theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
//                 }`}>
//                   <p className={textSecondaryClass}>Measures the round-trip time for messages sent to the target</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={textSecondaryClass}>Status:</p>
//                     <p className={getStatusColor(diagnostics.ping.status)}>
//                       {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                     </p>
//                     <p className={textSecondaryClass}>Target:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.ping.target}</p>
//                     <p className={textSecondaryClass}>Min/Avg/Max RTT:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{`${
//                       diagnostics.ping.result.min != null ? diagnostics.ping.result.min.toFixed(2) : 'N/A'
//                     }/${diagnostics.ping.result.avg != null ? diagnostics.ping.result.avg.toFixed(2) : 'N/A'}/${
//                       diagnostics.ping.result.max != null ? diagnostics.ping.result.max.toFixed(2) : 'N/A'
//                     } ms`}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Traceroute Test Section */}
//             <div
//               className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
//                 expandedTest === 'traceroute' ? "ring-2 ring-indigo-500" : ""
//               }`}
//               onClick={() => toggleTestExpansion('traceroute')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//               aria-expanded={expandedTest === 'traceroute'}
//               aria-label="Traceroute Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className={`font-semibold flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.traceroute.status)}
//                   Traceroute ({diagnostics.traceroute.target})
//                 </h3>
//                 <button
//                   className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
//                   aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}
//                 >
//                   {expandedTest === 'traceroute' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>

//               {expandedTest === 'traceroute' && diagnostics.traceroute.result?.hops?.length > 0 ? (
//                 <div className={`mt-3 p-3 rounded-lg transition-colors duration-300 ${
//                   theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
//                 }`}>
//                   <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-2">
//                     <div className={textSecondaryClass}>Hop</div>
//                     <div className={textSecondaryClass}>IP Address</div>
//                     <div className={textSecondaryClass}>Time</div>
//                   </div>
//                   {diagnostics.traceroute.result.hops.map((hop, index) => (
//                     <div key={index} className={`grid grid-cols-3 gap-2 text-sm py-1 border-b transition-colors duration-300 ${
//                       theme === "dark" ? "border-gray-700 last:border-0" : "border-gray-200 last:border-0"
//                     }`}>
//                       <div className={theme === "dark" ? "text-white" : "text-gray-800"}>{hop.hop ?? 'N/A'}</div>
//                       <div className={`font-mono ${
//                         theme === "dark" ? "text-white" : "text-gray-800"
//                       }`}>{hop.ip || '*'}</div>
//                       <div className={theme === "dark" ? "text-white" : "text-gray-800"}>{hop.time != null ? `${hop.time.toFixed(2)} ms` : 'N/A'}</div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className={`mt-1 ${textSecondaryClass}`}>{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
//               )}
//             </div>

//             {/* Health Check Section */}
//             <div
//               className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
//                 expandedTest === 'health' ? "ring-2 ring-indigo-500" : ""
//               }`}
//               onClick={() => toggleTestExpansion('health')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//               aria-expanded={expandedTest === 'health'}
//               aria-label="Router Health Check Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className={`font-semibold flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.healthCheck.status)}
//                   Router Health Check
//                 </h3>
//                 <button
//                   className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
//                   aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
//                 >
//                   {expandedTest === 'health' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${textSecondaryClass}`}>
//                 {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
//                   ? `CPU: ${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'health' && diagnostics.healthCheck.result && (
//                 <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
//                   theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
//                 }`}>
//                   <p className={textSecondaryClass}>Monitors the router's resource usage and service status</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={textSecondaryClass}>Status:</p>
//                     <p className={getStatusColor(diagnostics.healthCheck.status)}>
//                       {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
//                     </p>
//                     <p className={textSecondaryClass}>CPU Usage:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.healthCheck.result.cpu_usage != null ? `${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%` : 'N/A'}</p>
//                     <p className={textSecondaryClass}>Memory Usage:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.healthCheck.result.memory_usage != null ? `${diagnostics.healthCheck.result.memory_usage.toFixed(2)}%` : 'N/A'}</p>
//                     <p className={textSecondaryClass}>Disk Usage:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.healthCheck.result.disk_usage != null ? `${diagnostics.healthCheck.result.disk_usage.toFixed(2)}%` : 'N/A'}</p>
//                   </div>
//                   {diagnostics.healthCheck.result.services?.length > 0 && (
//                     <div className="mt-3">
//                       <p className={`font-medium ${textSecondaryClass}`}>Services:</p>
//                       {diagnostics.healthCheck.result.services.map((service, index) => (
//                         <div key={index} className="flex justify-between py-1">
//                           <span className={theme === "dark" ? "text-white" : "text-gray-800"}>{service.name ?? 'Unknown'}</span>
//                           <span className={service.status === 'running' ? "text-green-500" : "text-red-500"}>
//                             {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* DNS Test Section */}
//             <div
//               className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
//                 expandedTest === 'dns' ? "ring-2 ring-indigo-500" : ""
//               }`}
//               onClick={() => toggleTestExpansion('dns')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//               aria-expanded={expandedTest === 'dns'}
//               aria-label="DNS Resolution Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className={`font-semibold flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.dns.status)}
//                   DNS Resolution Test ({diagnostics.dns.target})
//                 </h3>
//                 <button
//                   className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
//                   aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
//                 >
//                   {expandedTest === 'dns' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${textSecondaryClass}`}>
//                 {diagnostics.dns.result && diagnostics.dns.result.addresses?.length > 0
//                   ? `Resolved: ${diagnostics.dns.result.addresses[0]}`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'dns' && diagnostics.dns.result && (
//                 <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
//                   theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
//                 }`}>
//                   <p className={textSecondaryClass}>Tests the resolution of domain names to IP addresses</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={textSecondaryClass}>Status:</p>
//                     <p className={getStatusColor(diagnostics.dns.status)}>
//                       {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
//                     </p>
//                     <p className={textSecondaryClass}>Target:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.dns.target}</p>
//                     <p className={textSecondaryClass}>Resolved IPs:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                       {diagnostics.dns.result.addresses?.length > 0
//                         ? diagnostics.dns.result.addresses.join(', ')
//                         : 'None'}
//                     </p>
//                     <p className={textSecondaryClass}>Response Time:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                       {diagnostics.dns.result.response_time != null
//                         ? `${diagnostics.dns.result.response_time.toFixed(2)} ms`
//                         : 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Packet Loss Test Section */}
//             <div
//               className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
//                 expandedTest === 'packetLoss' ? "ring-2 ring-indigo-500" : ""
//               }`}
//               onClick={() => toggleTestExpansion('packetLoss')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packetLoss')}
//               aria-expanded={expandedTest === 'packetLoss'}
//               aria-label="Packet Loss Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className={`font-semibold flex items-center ${
//                   theme === "dark" ? "text-white" : "text-gray-800"
//                 }`}>
//                   {renderStatusIcon(diagnostics.packetLoss.status)}
//                   Packet Loss Test ({diagnostics.packetLoss.target})
//                 </h3>
//                 <button
//                   className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
//                   aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
//                 >
//                   {expandedTest === 'packetLoss' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${textSecondaryClass}`}>
//                 {diagnostics.packetLoss.result && diagnostics.packetLoss.result.loss != null
//                   ? `Loss: ${diagnostics.packetLoss.result.loss.toFixed(2)}%`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
//                 <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
//                   theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
//                 }`}>
//                   <p className={textSecondaryClass}>Measures the percentage of packets lost during transmission</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={textSecondaryClass}>Status:</p>
//                     <p className={getStatusColor(diagnostics.packetLoss.status)}>
//                       {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
//                     </p>
//                     <p className={textSecondaryClass}>Target:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.packetLoss.target}</p>
//                     <p className={textSecondaryClass}>Packet Loss:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                       {diagnostics.packetLoss.result.loss != null
//                         ? `${diagnostics.packetLoss.result.loss.toFixed(2)}%`
//                         : 'N/A'}
//                     </p>
//                     <p className={textSecondaryClass}>Packets Sent/Received:</p>
//                     <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
//                       {diagnostics.packetLoss.result.sent != null && diagnostics.packetLoss.result.received != null
//                         ? `${diagnostics.packetLoss.result.sent}/${diagnostics.packetLoss.result.received}`
//                         : 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className={`${cardClass} p-8 text-center transition-colors duration-300`}>
//           <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-200"
//           }`}>
//             <Router className={`h-6 w-6 ${textSecondaryClass}`} aria-hidden="true" />
//           </div>
//           <h3 className={`mt-2 text-lg font-medium ${
//             theme === "dark" ? "text-white" : "text-gray-800"
//           }`}>No router selected</h3>
//           <p className={`mt-1 ${textSecondaryClass}`}>
//             {routers.length > 0
//               ? 'Please select a router from the dropdown above'
//               : 'No routers available. Navigate to Router Management and click "Add Router" to configure a new router.'}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NetworkDiagnostics;








// src/components/NetworkManagement/NetworkDiagnostics.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Activity, Wifi, Server, Download, Upload,
  Clock, AlertCircle, CheckCircle, XCircle,
  RefreshCw, ChevronDown, ChevronUp, Gauge,
  HardDrive, Network, Router
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const validateIp = (ip) => {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ip ? ipRegex.test(ip) : false;
};

const validateDomain = (domain) => {
  const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
  return domain ? domainRegex.test(domain) : false;
};

const NetworkDiagnostics = ({ routerId: propRouterId }) => {
  const [diagnostics, setDiagnostics] = useState({
    ping: { result: null, status: 'idle', target: 'example.com' },
    traceroute: { result: null, status: 'idle', target: 'example.com' },
    healthCheck: { result: null, status: 'idle' },
    bandwidth: { download: null, upload: null, status: 'idle', server: null, isp: null, latency: null, jitter: null },
    clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null, device: null, connectionType: null },
    dns: { result: null, status: 'idle', target: 'example.com' },
    packetLoss: { result: null, status: 'idle', target: 'example.com' },
  });
  const [historicalData, setHistoricalData] = useState({
    isp: { minute: [], hour: [], day: [], month: [] },
    client: { minute: [], hour: [], day: [], month: [] },
  });
  const [loading, setLoading] = useState(false);
  const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');
  const [expandedTest, setExpandedTest] = useState(null);
  const [speedTestRunning, setSpeedTestRunning] = useState(false);
  const [clientIp, setClientIp] = useState('');
  const [timeFrame, setTimeFrame] = useState('hour');
  const [isClientIpValid, setIsClientIpValid] = useState(true);
  const [isTargetValid, setIsTargetValid] = useState(true);
  const [routers, setRouters] = useState([]);
  const [selectedRouterId, setSelectedRouterId] = useState(propRouterId || '');
  const { theme } = useTheme();

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

  const fetchHistoricalData = useCallback(async () => {
    if (!selectedRouterId || isNaN(parseInt(selectedRouterId)) || !clientIp || !validateIp(clientIp)) {
      setHistoricalData({ isp: { minute: [], hour: [], day: [], month: [] }, client: { minute: [], hour: [], day: [], month: [] } });
      return;
    }

    try {
      const response = await api.get(`/api/network_management/speed-test-history/?router=${selectedRouterId}&client_ip=${clientIp}`);
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid historical data response');
      }
      setHistoricalData(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch historical speed data';
      toast.error(errorMessage);
    }
  }, [selectedRouterId, clientIp]);

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  useEffect(() => {
    if (clientIp && validateIp(clientIp)) {
      fetchHistoricalData();
    }
  }, [clientIp, fetchHistoricalData]);

  const runDiagnostics = useCallback(async () => {
    if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
      toast.error('Please select a valid router');
      return;
    }
    if (!diagnosticsTarget || !validateDomain(diagnosticsTarget)) {
      toast.error('Invalid target domain');
      setIsTargetValid(false);
      return;
    }
    if (!clientIp || !validateIp(clientIp)) {
      toast.error('Invalid client IP');
      setIsClientIpValid(false);
      return;
    }

    setLoading(true);
    setIsTargetValid(true);
    setIsClientIpValid(true);

    try {
      const response = await api.post('/api/network_management/tests/bulk/', {
        router_id: parseInt(selectedRouterId),
        target: diagnosticsTarget,
        client_ip: clientIp,
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid diagnostics response');
      }

      const updatedDiagnostics = response.data.reduce((acc, test) => {
        const testType = test.test_type === 'health_check' ? 'healthCheck' : test.test_type;
        if (!['ping', 'traceroute', 'healthCheck', 'speedtest', 'dns', 'packetLoss'].includes(testType)) {
          return acc;
        }
        acc[testType] = {
          result: test.result || null,
          status: test.status || 'error',
          target: test.target || diagnosticsTarget,
          ...(testType === 'speedtest' ? { clientIp } : {}),
          details: testType === 'speedtest' ? test.result?.speed_test : test.result?.[testType === 'healthCheck' ? 'health_check' : testType],
        };
        return acc;
      }, { ...diagnostics });

      setDiagnostics(updatedDiagnostics);
      fetchHistoricalData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to run diagnostics';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [diagnosticsTarget, clientIp, selectedRouterId, diagnostics, fetchHistoricalData]);

  const runSpeedTest = useCallback(async (type) => {
    if (!selectedRouterId || isNaN(parseInt(selectedRouterId))) {
      toast.error('Please select a valid router');
      return;
    }
    if (!clientIp || !validateIp(clientIp)) {
      toast.error('Invalid client IP');
      setIsClientIpValid(false);
      return;
    }

    setSpeedTestRunning(true);
    setIsClientIpValid(true);
    setDiagnostics(prev => ({
      ...prev,
      bandwidth: { ...prev.bandwidth, status: 'running' },
      clientBandwidth: { ...prev.clientBandwidth, status: 'running' },
    }));

    try {
      const response = await api.post('/api/network_management/tests/', {
        router_id: parseInt(selectedRouterId),
        test_type: 'speedtest',
        target: '',
        client_ip: clientIp,
        test_mode: type,
      });

      if (!response.data?.result?.speed_test) {
        throw new Error('Invalid speed test response');
      }

      const speedTest = response.data.result.speed_test;
      setDiagnostics(prev => ({
        ...prev,
        bandwidth: {
          download: Number(speedTest.download) || null,
          upload: Number(speedTest.upload) || null,
          status: 'success',
          server: speedTest.server || 'Unknown',
          isp: speedTest.isp || 'Unknown',
          latency: Number(speedTest.latency) || null,
          jitter: Number(speedTest.jitter) || null,
        },
        clientBandwidth: {
          download: Number(speedTest.client_download) || null,
          upload: Number(speedTest.client_upload) || null,
          status: 'success',
          clientIp,
          device: speedTest.device || 'Unknown',
          connectionType: speedTest.connection_type || 'Unknown',
        },
      }));
      toast.success('Speed test completed');
      fetchHistoricalData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Speed test failed';
      toast.error(errorMessage);
      setDiagnostics(prev => ({
        ...prev,
        bandwidth: { ...prev.bandwidth, status: 'error' },
        clientBandwidth: { ...prev.clientBandwidth, status: 'error' },
      }));
    } finally {
      setSpeedTestRunning(false);
    }
  }, [clientIp, selectedRouterId, fetchHistoricalData]);

  const renderStatusIcon = useCallback((status) => {
    const icons = {
      running: <RefreshCw className={`${theme === "dark" ? "text-yellow-400" : "text-yellow-600"} inline-block mr-2 animate-spin`} />,
      success: <CheckCircle className={`${theme === "dark" ? "text-green-400" : "text-green-600"} inline-block mr-2`} />,
      error: <XCircle className={`${theme === "dark" ? "text-red-400" : "text-red-600"} inline-block mr-2`} />,
      idle: <Clock className={`${textSecondaryClass} inline-block mr-2`} />,
    };
    return icons[status] || icons.idle;
  }, [theme, textSecondaryClass]);

  const getStatusColor = useCallback((status) => {
    const colors = theme === 'dark' ? {
      success: 'bg-green-900 text-green-300',
      error: 'bg-red-900 text-red-300',
      running: 'bg-yellow-900 text-yellow-300',
      idle: 'bg-gray-800 text-gray-300',
    } : {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      running: 'bg-yellow-100 text-yellow-800',
      idle: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.idle;
  }, [theme]);

  const formatSpeed = useCallback((speed) => {
    return speed != null ? `${speed.toFixed(2)} Mbps` : 'N/A';
  }, []);

  const calculateEfficiency = useCallback((client, isp) => {
    if (isp == null || isp === 0 || client == null) return 0;
    return Math.min(100, Math.round((client / isp) * 100));
  }, []);

  const toggleTestExpansion = useCallback((testName) => {
    setExpandedTest(prev => (prev === testName ? null : testName));
  }, []);

  const chartData = useMemo(() => ({
    labels:
      historicalData.isp[timeFrame]?.length > 0
        ? historicalData.isp[timeFrame].map(d => new Date(d.timestamp).toLocaleString())
        : [],
    datasets: [
      {
        label: 'ISP Download',
        data: historicalData.isp[timeFrame]?.map(d => Number(d.download) || 0) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'ISP Upload',
        data: historicalData.isp[timeFrame]?.map(d => Number(d.upload) || 0) || [],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Client Download',
        data: historicalData.client[timeFrame]?.map(d => Number(d.download) || 0) || [],
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Client Upload',
        data: historicalData.client[timeFrame]?.map(d => Number(d.upload) || 0) || [],
        borderColor: 'rgb(255, 206, 86)',
        tension: 0.1,
      },
    ],
  }), [historicalData, timeFrame]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151'
        }
      },
      title: { 
        display: true, 
        text: 'Speed Test History',
        color: theme === 'dark' ? '#e5e7eb' : '#374151'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { 
          display: true, 
          text: 'Speed (Mbps)',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: { 
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
        },
        ticks: { 
          color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
        }
      },
      x: {
        grid: { 
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
        },
        ticks: { 
          color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
        }
      }
    },
  }), [theme]);

  return (
    <div className={containerClass} role="region" aria-label="Network Diagnostics">
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />

      <header className={`${cardClass} flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-6 transition-colors duration-300`}>
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <Activity className="w-8 h-8 text-indigo-500" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-500">Network Diagnostics</h1>
            <p className={`text-sm ${textSecondaryClass}`}>Comprehensive network analysis and speed testing</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
                  in the Router Management section to run diagnostics.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex-1">
                <label htmlFor="router-select" className="sr-only">Select Router</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Server className={`h-5 w-5 ${textTertiaryClass}`} aria-hidden="true" />
                </div>
                <select
                  id="router-select"
                  value={selectedRouterId}
                  onChange={(e) => setSelectedRouterId(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300`}
                  aria-label="Select router for diagnostics"
                >
                  <option value="">Select a router</option>
                  {routers.map(router => (
                    <option key={router.id} value={router.id}>
                      {router.name} ({router.ip})
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative flex-1">
                <label htmlFor="target-domain" className="sr-only">Target Domain</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Network className={`h-5 w-5 ${textTertiaryClass}`} aria-hidden="true" />
                </div>
                <input
                  id="target-domain"
                  type="text"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300 ${
                    isTargetValid ? "" : "border-red-500"
                  }`}
                  placeholder="Enter target (e.g., example.com)"
                  value={diagnosticsTarget}
                  onChange={(e) => {
                    setDiagnosticsTarget(e.target.value);
                    setIsTargetValid(e.target.value ? validateDomain(e.target.value) : true);
                  }}
                  disabled={!selectedRouterId || isNaN(parseInt(selectedRouterId))}
                  aria-label="Target domain for diagnostics"
                  aria-invalid={!isTargetValid}
                  aria-describedby={isTargetValid ? undefined : 'target-domain-error'}
                />
                {!isTargetValid && (
                  <p id="target-domain-error" className="text-red-400 text-xs mt-1">Please enter a valid domain</p>
                )}
              </div>
              <div className="relative flex-1">
                <label htmlFor="client-ip" className="sr-only">Client IP</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wifi className={`h-5 w-5 ${textTertiaryClass}`} aria-hidden="true" />
                </div>
                <input
                  id="client-ip"
                  type="text"
                  className={`pl-10 pr-4 py-2 w-full border rounded-lg ${inputClass} transition-colors duration-300 ${
                    isClientIpValid ? "" : "border-red-500"
                  }`}
                  placeholder="Client IP (e.g., 192.168.1.100)"
                  value={clientIp}
                  onChange={(e) => {
                    setClientIp(e.target.value);
                    setIsClientIpValid(e.target.value ? validateIp(e.target.value) : true);
                  }}
                  disabled={!selectedRouterId || isNaN(parseInt(selectedRouterId))}
                  aria-label="Client IP address"
                  aria-invalid={!isClientIpValid}
                  aria-describedby={isClientIpValid ? undefined : 'client-ip-error'}
                />
                {!isClientIpValid && (
                  <p id="client-ip-error" className="text-red-400 text-xs mt-1">Please enter a valid IP address</p>
                )}
              </div>
              <button
                className={`px-4 py-2 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors duration-300 ${
                  theme === "dark" 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
                onClick={runDiagnostics}
                disabled={loading || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !isTargetValid || !diagnosticsTarget || !clientIp}
                aria-label="Run network diagnostics"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                    Running...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5 mr-2" aria-hidden="true" />
                    Run Diagnostics
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {selectedRouterId && !isNaN(parseInt(selectedRouterId)) ? (
        <>
          <div className={`${cardClass} p-6 mb-6 transition-colors duration-300`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center text-indigo-500">
                <Gauge className="w-5 h-5 mr-2" aria-hidden="true" />
                Bandwidth Speed Test
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => runSpeedTest('full')}
                  disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
                  className={`px-3 py-1 rounded-lg text-sm flex items-center disabled:opacity-50 transition-colors duration-300 ${
                    theme === "dark" 
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                  aria-label="Run full speed test"
                >
                  {speedTestRunning ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
                  ) : (
                    <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
                  )}
                  Full Test
                </button>
                <button
                  onClick={() => runSpeedTest('quick')}
                  disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
                  className={`px-3 py-1 rounded-lg text-sm flex items-center disabled:opacity-50 transition-colors duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700 hover:bg-gray-600 text-white" 
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                  aria-label="Run quick speed test"
                >
                  <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
                  Quick Test
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${cardClass} p-4 transition-colors duration-300`}>
                <h3 className={`font-medium mb-3 flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.bandwidth.status)}
                  ISP Connection Speed
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${cardClass} p-3 transition-colors duration-300`}>
                    <p className={`text-sm ${textSecondaryClass}`}>Download</p>
                    <p className="text-xl font-bold text-green-500">{formatSpeed(diagnostics.bandwidth.download)}</p>
                  </div>
                  <div className={`${cardClass} p-3 transition-colors duration-300`}>
                    <p className={`text-sm ${textSecondaryClass}`}>Upload</p>
                    <p className="text-xl font-bold text-blue-500">{formatSpeed(diagnostics.bandwidth.upload)}</p>
                  </div>
                </div>
                {diagnostics.bandwidth.status === 'success' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className={textSecondaryClass}>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
                    <p className={textSecondaryClass}>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
                    <p className={textSecondaryClass}>Latency: {diagnostics.bandwidth.latency != null ? `${diagnostics.bandwidth.latency.toFixed(2)} ms` : 'N/A'}</p>
                    <p className={textSecondaryClass}>Jitter: {diagnostics.bandwidth.jitter != null ? `${diagnostics.bandwidth.jitter.toFixed(2)} ms` : 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className={`${cardClass} p-4 transition-colors duration-300`}>
                <h3 className={`font-medium mb-3 flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.clientBandwidth.status)}
                  Client Speed ({clientIp || 'N/A'})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${cardClass} p-3 transition-colors duration-300`}>
                    <p className={`text-sm ${textSecondaryClass}`}>Download</p>
                    <p className="text-xl font-bold text-green-500">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
                  </div>
                  <div className={`${cardClass} p-3 transition-colors duration-300`}>
                    <p className={`text-sm ${textSecondaryClass}`}>Upload</p>
                    <p className="text-xl font-bold text-blue-500">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
                  </div>
                </div>
                {diagnostics.clientBandwidth.status === 'success' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className={textSecondaryClass}>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
                    <p className={textSecondaryClass}>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
                  </div>
                )}
              </div>
            </div>

            {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
              <div className={`${cardClass} mt-4 p-4 transition-colors duration-300`}>
                <h3 className={`font-medium mb-3 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>Bandwidth Comparison</h3>
                <div className="space-y-2">
                  <div>
                    <p className={`text-sm mb-1 ${textSecondaryClass}`}>Download Efficiency</p>
                    <div className={`w-full rounded-full h-2.5 ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } transition-colors duration-300`}>
                      <div
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${textSecondaryClass}`}>
                      Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
                      {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${textSecondaryClass}`}>Upload Efficiency</p>
                    <div className={`w-full rounded-full h-2.5 ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                    } transition-colors duration-300`}>
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${textSecondaryClass}`}>
                      Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
                      {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {historicalData.isp[timeFrame]?.length > 0 && (
              <div className={`${cardClass} mt-4 p-4 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>Historical Speed Data</h3>
                  <div>
                    <label htmlFor="timeframe-select" className="sr-only">
                      Select Time Frame
                    </label>
                    <select
                      id="timeframe-select"
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                      className={`p-2 border rounded-lg text-sm ${inputClass} transition-colors duration-300`}
                      aria-label="Select time frame for historical data"
                    >
                      <option value="minute">Last Hour (Minutes)</option>
                      <option value="hour">Last Day (Hours)</option>
                      <option value="day">Last Month (Days)</option>
                      <option value="month">Last Year (Months)</option>
                    </select>
                  </div>
                </div>
                <Line
                  data={chartData}
                  options={chartOptions}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Ping Test Section */}
            <div
              className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
                expandedTest === 'ping' ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => toggleTestExpansion('ping')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
              aria-expanded={expandedTest === 'ping'}
              aria-label="Ping Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.ping.status)}
                  Ping Test ({diagnostics.ping.target})
                </h3>
                <button
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
                  aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
                >
                  {expandedTest === 'ping' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${textSecondaryClass}`}>
                {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg.toFixed(2)}ms` : 'No data yet.'}
              </p>

              {expandedTest === 'ping' && diagnostics.ping.result && (
                <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
                  theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
                }`}>
                  <p className={textSecondaryClass}>Measures the round-trip time for messages sent to the target</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={textSecondaryClass}>Status:</p>
                    <p className={getStatusColor(diagnostics.ping.status)}>
                      {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
                    </p>
                    <p className={textSecondaryClass}>Target:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.ping.target}</p>
                    <p className={textSecondaryClass}>Min/Avg/Max RTT:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{`${
                      diagnostics.ping.result.min != null ? diagnostics.ping.result.min.toFixed(2) : 'N/A'
                    }/${diagnostics.ping.result.avg != null ? diagnostics.ping.result.avg.toFixed(2) : 'N/A'}/${
                      diagnostics.ping.result.max != null ? diagnostics.ping.result.max.toFixed(2) : 'N/A'
                    } ms`}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Traceroute Test Section */}
            <div
              className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
                expandedTest === 'traceroute' ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => toggleTestExpansion('traceroute')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
              aria-expanded={expandedTest === 'traceroute'}
              aria-label="Traceroute Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.traceroute.status)}
                  Traceroute ({diagnostics.traceroute.target})
                </h3>
                <button
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
                  aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}
                >
                  {expandedTest === 'traceroute' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {expandedTest === 'traceroute' && diagnostics.traceroute.result?.hops?.length > 0 ? (
                <div className={`mt-3 p-3 rounded-lg transition-colors duration-300 ${
                  theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
                }`}>
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-2">
                    <div className={textSecondaryClass}>Hop</div>
                    <div className={textSecondaryClass}>IP Address</div>
                    <div className={textSecondaryClass}>Time</div>
                  </div>
                  {diagnostics.traceroute.result.hops.map((hop, index) => (
                    <div key={index} className={`grid grid-cols-3 gap-2 text-sm py-1 border-b transition-colors duration-300 ${
                      theme === "dark" ? "border-gray-700 last:border-0" : "border-gray-200 last:border-0"
                    }`}>
                      <div className={theme === "dark" ? "text-white" : "text-gray-800"}>{hop.hop ?? 'N/A'}</div>
                      <div className={`font-mono ${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      }`}>{hop.ip || '*'}</div>
                      <div className={theme === "dark" ? "text-white" : "text-gray-800"}>{hop.time != null ? `${hop.time.toFixed(2)} ms` : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`mt-1 ${textSecondaryClass}`}>{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
              )}
            </div>

            {/* Health Check Section */}
            <div
              className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
                expandedTest === 'health' ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => toggleTestExpansion('health')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
              aria-expanded={expandedTest === 'health'}
              aria-label="Router Health Check Section"
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.healthCheck.status)}
                  Router Health Check
                </h3>
                <button
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
                  aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
                >
                  {expandedTest === 'health' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${textSecondaryClass}`}>
                {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
                  ? `CPU: ${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'health' && diagnostics.healthCheck.result && (
                <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
                  theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
                }`}>
                  <p className={textSecondaryClass}>Monitors the router's resource usage and service status</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={textSecondaryClass}>Status:</p>
                    <p className={getStatusColor(diagnostics.healthCheck.status)}>
                      {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
                    </p>
                    <p className={textSecondaryClass}>CPU Usage:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.healthCheck.result.cpu_usage != null ? `${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%` : 'N/A'}</p>
                    <p className={textSecondaryClass}>Memory Usage:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.healthCheck.result.memory_usage != null ? `${diagnostics.healthCheck.result.memory_usage.toFixed(2)}%` : 'N/A'}</p>
                    <p className={textSecondaryClass}>Disk Usage:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.healthCheck.result.disk_usage != null ? `${diagnostics.healthCheck.result.disk_usage.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                  {diagnostics.healthCheck.result.services?.length > 0 && (
                    <div className="mt-3">
                      <p className={`font-medium ${textSecondaryClass}`}>Services:</p>
                      {diagnostics.healthCheck.result.services.map((service, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className={theme === "dark" ? "text-white" : "text-gray-800"}>{service.name ?? 'Unknown'}</span>
                          <span className={service.status === 'running' ? "text-green-500" : "text-red-500"}>
                            {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DNS Test Section */}
            <div
              className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
                expandedTest === 'dns' ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => toggleTestExpansion('dns')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
              aria-expanded={expandedTest === 'dns'}
              aria-label="DNS Resolution Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.dns.status)}
                  DNS Resolution Test ({diagnostics.dns.target})
                </h3>
                <button
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
                  aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
                >
                  {expandedTest === 'dns' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${textSecondaryClass}`}>
                {diagnostics.dns.result && diagnostics.dns.result.addresses?.length > 0
                  ? `Resolved: ${diagnostics.dns.result.addresses[0]}`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'dns' && diagnostics.dns.result && (
                <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
                  theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
                }`}>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={textSecondaryClass}>Status:</p>
                    <p className={getStatusColor(diagnostics.dns.status)}>
                      {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
                    </p>
                    <p className={textSecondaryClass}>Target:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.dns.target}</p>
                    <p className={textSecondaryClass}>Resolved IPs:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                      {diagnostics.dns.result.addresses?.length > 0
                        ? diagnostics.dns.result.addresses.join(', ')
                        : 'None'}
                    </p>
                    <p className={textSecondaryClass}>Response Time:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                      {diagnostics.dns.result.response_time != null
                        ? `${diagnostics.dns.result.response_time.toFixed(2)} ms`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Packet Loss Test Section */}
            <div
              className={`${cardClass} p-4 cursor-pointer transition-all duration-300 ${
                expandedTest === 'packetLoss' ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => toggleTestExpansion('packetLoss')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packetLoss')}
              aria-expanded={expandedTest === 'packetLoss'}
              aria-label="Packet Loss Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold flex items-center ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}>
                  {renderStatusIcon(diagnostics.packetLoss.status)}
                  Packet Loss Test ({diagnostics.packetLoss.target})
                </h3>
                <button
                  className={`${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-400"} transition-colors duration-300`}
                  aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
                >
                  {expandedTest === 'packetLoss' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${textSecondaryClass}`}>
                {diagnostics.packetLoss.result && diagnostics.packetLoss.result.loss != null
                  ? `Loss: ${diagnostics.packetLoss.result.loss.toFixed(2)}%`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
                <div className={`mt-3 p-3 rounded-lg text-sm transition-colors duration-300 ${
                  theme === "dark" ? "bg-gray-800/60" : "bg-gray-50/80"
                }`}>
                  <p className={textSecondaryClass}>Measures the percentage of packets lost during transmission</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={textSecondaryClass}>Status:</p>
                    <p className={getStatusColor(diagnostics.packetLoss.status)}>
                      {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
                    </p>
                    <p className={textSecondaryClass}>Target:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>{diagnostics.packetLoss.target}</p>
                    <p className={textSecondaryClass}>Packet Loss:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                      {diagnostics.packetLoss.result.loss != null
                        ? `${diagnostics.packetLoss.result.loss.toFixed(2)}%`
                        : 'N/A'}
                    </p>
                    <p className={textSecondaryClass}>Packets Sent/Received:</p>
                    <p className={theme === "dark" ? "text-white" : "text-gray-800"}>
                      {diagnostics.packetLoss.result.sent != null && diagnostics.packetLoss.result.received != null
                        ? `${diagnostics.packetLoss.result.sent}/${diagnostics.packetLoss.result.received}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={`${cardClass} p-8 text-center transition-colors duration-300`}>
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <Router className={`h-6 w-6 ${textSecondaryClass}`} aria-hidden="true" />
          </div>
          <h3 className={`mt-2 text-lg font-medium ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>No router selected</h3>
          <p className={`mt-1 ${textSecondaryClass}`}>
            {routers.length > 0
              ? 'Please select a router from the dropdown above'
              : 'No routers available. Navigate to Router Management and click "Add Router" to configure a new router.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkDiagnostics;