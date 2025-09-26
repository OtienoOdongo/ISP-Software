// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Activity, Wifi, Server, Download, Upload,
//   Clock, AlertCircle, CheckCircle, XCircle,
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network, Router
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../api'
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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

//   const renderStatusIcon = (status) => {
//     const icons = {
//       running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" />,
//       success: <CheckCircle className="text-green-500 inline-block mr-2" />,
//       error: <XCircle className="text-red-500 inline-block mr-2" />,
//       idle: <Clock className="text-gray-500 inline-block mr-2" />,
//     };
//     return icons[status] || icons.idle;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       success: 'bg-green-100 text-green-800',
//       error: 'bg-red-100 text-red-800',
//       running: 'bg-yellow-100 text-yellow-800',
//       idle: 'bg-gray-100 text-gray-800',
//     };
//     return colors[status] || colors.idle;
//   };

//   const formatSpeed = (speed) => {
//     return speed != null ? `${speed.toFixed(2)} Mbps` : 'N/A';
//   };

//   const calculateEfficiency = (client, isp) => {
//     if (isp == null || isp === 0 || client == null) return 0;
//     return Math.min(100, Math.round((client / isp) * 100));
//   };

//   const toggleTestExpansion = useCallback((testName) => {
//     setExpandedTest(prev => (prev === testName ? null : testName));
//   }, []);

//   const chartData = {
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
//   };

//   return (
//     <div className="p-6 bg-white text-gray-900 rounded-lg" role="region" aria-label="Network Diagnostics">
//       <ToastContainer position="top-right" autoClose={3000} theme="light" />

//       <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-gray-50 p-4 rounded-lg shadow">
//         <div className="flex items-center space-x-4 mb-4 md:mb-0">
//           <Activity className="w-8 h-8 text-indigo-600" aria-hidden="true" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-600">Network Diagnostics</h1>
//             <p className="text-sm text-gray-500">Comprehensive network analysis and speed testing</p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           {routers.length === 0 ? (
//             <div className="flex-1 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded w-full">
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
//                   in the Router Management section to run diagnostics.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="relative flex-1">
//                 <label htmlFor="router-select" className="sr-only">Select Router</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Server className="h-5 w-5 text-gray-500" aria-hidden="true" />
//                 </div>
//                 <select
//                   id="router-select"
//                   value={selectedRouterId}
//                   onChange={(e) => setSelectedRouterId(e.target.value)}
//                   className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
//                   <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="target-domain"
//                   type="text"
//                   className={`pl-10 pr-4 py-2 w-full bg-white border ${isTargetValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
//                   <p id="target-domain-error" className="text-red-500 text-xs mt-1">Please enter a valid domain</p>
//                 )}
//               </div>
//               <div className="relative flex-1">
//                 <label htmlFor="client-ip" className="sr-only">Client IP</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="client-ip"
//                   type="text"
//                   className={`pl-10 pr-4 py-2 w-full bg-white border ${isClientIpValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
//                   <p id="client-ip-error" className="text-red-500 text-xs mt-1">Please enter a valid IP address</p>
//                 )}
//               </div>
//               <button
//                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
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
//           <div className="bg-white p-4 rounded-lg shadow mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold flex items-center">
//                 <Gauge className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
//                 Bandwidth Speed Test
//               </h2>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => runSpeedTest('full')}
//                   disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
//                   className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
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
//                   className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
//                   aria-label="Run quick speed test"
//                 >
//                   <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//                   Quick Test
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//                   {renderStatusIcon(diagnostics.bandwidth.status)}
//                   ISP Connection Speed
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-white p-3 rounded shadow-sm">
//                     <p className="text-sm text-gray-500">Download</p>
//                     <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.bandwidth.download)}</p>
//                   </div>
//                   <div className="bg-white p-3 rounded shadow-sm">
//                     <p className="text-sm text-gray-500">Upload</p>
//                     <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.bandwidth.upload)}</p>
//                   </div>
//                 </div>
//                 {diagnostics.bandwidth.status === 'success' && (
//                   <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                     <p>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
//                     <p>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
//                     <p>Latency: {diagnostics.bandwidth.latency != null ? `${diagnostics.bandwidth.latency.toFixed(2)} ms` : 'N/A'}</p>
//                     <p>Jitter: {diagnostics.bandwidth.jitter != null ? `${diagnostics.bandwidth.jitter.toFixed(2)} ms` : 'N/A'}</p>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//                   {renderStatusIcon(diagnostics.clientBandwidth.status)}
//                   Client Speed ({clientIp || 'N/A'})
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-white p-3 rounded shadow-sm">
//                     <p className="text-sm text-gray-500">Download</p>
//                     <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
//                   </div>
//                   <div className="bg-white p-3 rounded shadow-sm">
//                     <p className="text-sm text-gray-500">Upload</p>
//                     <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
//                   </div>
//                 </div>
//                 {diagnostics.clientBandwidth.status === 'success' && (
//                   <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                     <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                     <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//                 <h3 className="font-medium text-gray-700 mb-3">Bandwidth Comparison</h3>
//                 <div className="space-y-2">
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Download Efficiency</p>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5">
//                       <div
//                         className="bg-green-500 h-2.5 rounded-full"
//                         style={{
//                           width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
//                         }}
//                         role="progressbar"
//                         aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                       ></div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
//                       {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">Upload Efficiency</p>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5">
//                       <div
//                         className="bg-blue-500 h-2.5 rounded-full"
//                         style={{
//                           width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
//                         }}
//                         role="progressbar"
//                         aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                       ></div>
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">
//                       Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
//                       {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {historicalData.isp[timeFrame]?.length > 0 && (
//               <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
//                   <div>
//                     <label htmlFor="timeframe-select" className="sr-only">
//                       Select Time Frame
//                     </label>
//                     <select
//                       id="timeframe-select"
//                       value={timeFrame}
//                       onChange={(e) => setTimeFrame(e.target.value)}
//                       className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
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
//                   options={{
//                     responsive: true,
//                     plugins: {
//                       legend: { position: 'top' },
//                       title: { display: true, text: 'Speed Test History' },
//                     },
//                     scales: {
//                       y: {
//                         beginAtZero: true,
//                         title: { display: true, text: 'Speed (Mbps)' },
//                       },
//                       x: {
//                         title: { display: true, text: 'Time' },
//                       },
//                     },
//                   }}
//                 />
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             <div
//               className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
//               onClick={() => toggleTestExpansion('ping')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//               aria-expanded={expandedTest === 'ping'}
//               aria-label="Ping Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold text-gray-700 flex items-center">
//                   {renderStatusIcon(diagnostics.ping.status)}
//                   Ping Test ({diagnostics.ping.target})
//                 </h3>
//                 <button
//                   className="text-gray-500 hover:text-gray-400"
//                   aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
//                 >
//                   {expandedTest === 'ping' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className="mt-1 text-gray-500">
//                 {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg.toFixed(2)}ms` : 'No data yet.'}
//               </p>

//               {expandedTest === 'ping' && diagnostics.ping.result && (
//                 <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//                   <p className="text-gray-500">Measures the round-trip time for messages sent to the target</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className="text-gray-500">Status:</p>
//                     <p className={getStatusColor(diagnostics.ping.status)}>
//                       {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                     </p>
//                     <p className="text-gray-500">Target:</p>
//                     <p className="text-gray-900">{diagnostics.ping.target}</p>
//                     <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                     <p className="text-gray-900">{`${
//                       diagnostics.ping.result.min != null ? diagnostics.ping.result.min.toFixed(2) : 'N/A'
//                     }/${diagnostics.ping.result.avg != null ? diagnostics.ping.result.avg.toFixed(2) : 'N/A'}/${
//                       diagnostics.ping.result.max != null ? diagnostics.ping.result.max.toFixed(2) : 'N/A'
//                     } ms`}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div
//               className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
//               onClick={() => toggleTestExpansion('traceroute')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//               aria-expanded={expandedTest === 'traceroute'}
//               aria-label="Traceroute Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold text-gray-700 flex items-center">
//                   {renderStatusIcon(diagnostics.traceroute.status)}
//                   Traceroute ({diagnostics.traceroute.target})
//                 </h3>
//                 <button
//                   className="text-gray-500 hover:text-gray-400"
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
//                 <div className="mt-3 bg-gray-50 p-3 rounded">
//                   <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
//                     <div>Hop</div>
//                     <div>IP Address</div>
//                     <div>Time</div>
//                   </div>
//                   {diagnostics.traceroute.result.hops.map((hop, index) => (
//                     <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
//                       <div>{hop.hop ?? 'N/A'}</div>
//                       <div className="font-mono">{hop.ip || '*'}</div>
//                       <div>{hop.time != null ? `${hop.time.toFixed(2)} ms` : 'N/A'}</div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="mt-1 text-gray-500">{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
//               )}
//             </div>

//             <div
//               className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
//               onClick={() => toggleTestExpansion('health')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//               aria-expanded={expandedTest === 'health'}
//               aria-label="Router Health Check Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold text-gray-700 flex items-center">
//                   {renderStatusIcon(diagnostics.healthCheck.status)}
//                   Router Health Check
//                 </h3>
//                 <button
//                   className="text-gray-500 hover:text-gray-400"
//                   aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
//                 >
//                   {expandedTest === 'health' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className="mt-1 text-gray-500">
//                 {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
//                   ? `CPU: ${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'health' && diagnostics.healthCheck.result && (
//                 <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//                   <p className="text-gray-500">Monitors the router's resource usage and service status</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className="text-gray-500">Status:</p>
//                     <p className={getStatusColor(diagnostics.healthCheck.status)}>
//                       {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
//                     </p>
//                     <p className="text-gray-500">CPU Usage:</p>
//                     <p className="text-gray-900">{diagnostics.healthCheck.result.cpu_usage != null ? `${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%` : 'N/A'}</p>
//                     <p className="text-gray-500">Memory Usage:</p>
//                     <p className="text-gray-900">{diagnostics.healthCheck.result.memory_usage != null ? `${diagnostics.healthCheck.result.memory_usage.toFixed(2)}%` : 'N/A'}</p>
//                     <p className="text-gray-500">Disk Usage:</p>
//                     <p className="text-gray-900">{diagnostics.healthCheck.result.disk_usage != null ? `${diagnostics.healthCheck.result.disk_usage.toFixed(2)}%` : 'N/A'}</p>
//                   </div>
//                   {diagnostics.healthCheck.result.services?.length > 0 && (
//                     <div className="mt-3">
//                       <p className="text-gray-500 font-medium">Services:</p>
//                       {diagnostics.healthCheck.result.services.map((service, index) => (
//                         <div key={index} className="flex justify-between py-1">
//                           <span className="text-gray-900">{service.name ?? 'Unknown'}</span>
//                           <span className={service.status === 'running' ? 'text-green-600' : 'text-red-600'}>
//                             {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div
//               className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
//               onClick={() => toggleTestExpansion('dns')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//               aria-expanded={expandedTest === 'dns'}
//               aria-label="DNS Resolution Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold text-gray-700 flex items-center">
//                   {renderStatusIcon(diagnostics.dns.status)}
//                   DNS Resolution Test ({diagnostics.dns.target})
//                 </h3>
//                 <button
//                   className="text-gray-500 hover:text-gray-400"
//                   aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
//                 >
//                   {expandedTest === 'dns' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className="mt-1 text-gray-500">
//                 {diagnostics.dns.result && diagnostics.dns.result.addresses?.length > 0
//                   ? `Resolved: ${diagnostics.dns.result.addresses[0]}`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'dns' && diagnostics.dns.result && (
//                 <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//                   <p className="text-gray-500">Tests the resolution of domain names to IP addresses</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className="text-gray-500">Status:</p>
//                     <p className={getStatusColor(diagnostics.dns.status)}>
//                       {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
//                     </p>
//                     <p className="text-gray-500">Target:</p>
//                     <p className="text-gray-900">{diagnostics.dns.target}</p>
//                     <p className="text-gray-500">Resolved IPs:</p>
//                     <p className="text-gray-900">
//                       {diagnostics.dns.result.addresses?.length > 0
//                         ? diagnostics.dns.result.addresses.join(', ')
//                         : 'None'}
//                     </p>
//                     <p className="text-gray-500">Response Time:</p>
//                     <p className="text-gray-900">
//                       {diagnostics.dns.result.response_time != null
//                         ? `${diagnostics.dns.result.response_time.toFixed(2)} ms`
//                         : 'N/A'}
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div
//               className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packetLoss' ? 'ring-2 ring-indigo-500' : ''}`}
//               onClick={() => toggleTestExpansion('packetLoss')}
//               role="button"
//               tabIndex={0}
//               onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packetLoss')}
//               aria-expanded={expandedTest === 'packetLoss'}
//               aria-label="Packet Loss Test Section"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="font-semibold text-gray-700 flex items-center">
//                   {renderStatusIcon(diagnostics.packetLoss.status)}
//                   Packet Loss Test ({diagnostics.packetLoss.target})
//                 </h3>
//                 <button
//                   className="text-gray-500 hover:text-gray-400"
//                   aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
//                 >
//                   {expandedTest === 'packetLoss' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className="mt-1 text-gray-500">
//                 {diagnostics.packetLoss.result && diagnostics.packetLoss.result.loss != null
//                   ? `Loss: ${diagnostics.packetLoss.result.loss.toFixed(2)}%`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
//                 <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//                   <p className="text-gray-500">Measures the percentage of packets lost during transmission</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className="text-gray-500">Status:</p>
//                     <p className={getStatusColor(diagnostics.packetLoss.status)}>
//                       {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
//                     </p>
//                     <p className="text-gray-500">Target:</p>
//                     <p className="text-gray-900">{diagnostics.packetLoss.target}</p>
//                     <p className="text-gray-500">Packet Loss:</p>
//                     <p className="text-gray-900">
//                       {diagnostics.packetLoss.result.loss != null
//                         ? `${diagnostics.packetLoss.result.loss.toFixed(2)}%`
//                         : 'N/A'}
//                     </p>
//                     <p className="text-gray-500">Packets Sent/Received:</p>
//                     <p className="text-gray-900">
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
//         <div className="bg-gray-50 p-8 rounded-lg text-center">
//           <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200">
//             <Router className="h-6 w-6 text-gray-600" aria-hidden="true" />
//           </div>
//           <h3 className="mt-2 text-lg font-medium text-gray-900">No router selected</h3>
//           <p className="mt-1 text-gray-500">
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










// import React, { useState, useCallback, useEffect } from 'react';
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

//   const renderStatusIcon = (status) => {
//     const icons = {
//       running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" />,
//       success: <CheckCircle className="text-green-500 inline-block mr-2" />,
//       error: <XCircle className="text-red-500 inline-block mr-2" />,
//       idle: <Clock className="text-gray-500 inline-block mr-2" />,
//     };
//     return icons[status] || icons.idle;
//   };

//   const getStatusColor = (status) => {
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
//   };

//   const formatSpeed = (speed) => {
//     return speed != null ? `${speed.toFixed(2)} Mbps` : 'N/A';
//   };

//   const calculateEfficiency = (client, isp) => {
//     if (isp == null || isp === 0 || client == null) return 0;
//     return Math.min(100, Math.round((client / isp) * 100));
//   };

//   const toggleTestExpansion = useCallback((testName) => {
//     setExpandedTest(prev => (prev === testName ? null : testName));
//   }, []);

//   const chartData = {
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
//   };

//   return (
//     <div className={`p-6 rounded-lg theme-transition ${
//       theme === 'dark' ? 'bg-dark-background-primary text-dark-text-primary' : 'bg-white text-gray-900'
//     }`} role="region" aria-label="Network Diagnostics">
//       <ToastContainer position="top-right" autoClose={3000} theme={theme} />

//       <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-4 rounded-lg shadow ${
//         theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-gray-50'
//       }`}>
//         <div className="flex items-center space-x-4 mb-4 md:mb-0">
//           <Activity className="w-8 h-8 text-indigo-600" aria-hidden="true" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-600">Network Diagnostics</h1>
//             <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Comprehensive network analysis and speed testing</p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
//                   in the Router Management section to run diagnostics.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="relative flex-1">
//                 <label htmlFor="router-select" className="sr-only">Select Router</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Server className="h-5 w-5 text-gray-500" aria-hidden="true" />
//                 </div>
//                 <select
//                   id="router-select"
//                   value={selectedRouterId}
//                   onChange={(e) => setSelectedRouterId(e.target.value)}
//                   className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
//                     theme === 'dark'
//                       ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary'
//                       : 'bg-white border-gray-300 text-gray-900'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
//                   <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="target-domain"
//                   type="text"
//                   className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
//                     isTargetValid 
//                       ? theme === 'dark' 
//                         ? 'border-dark-border-medium' 
//                         : 'border-gray-300'
//                       : 'border-red-500'
//                   } ${
//                     theme === 'dark'
//                       ? 'bg-dark-background-primary text-dark-text-primary placeholder-dark-text-tertiary'
//                       : 'bg-white text-gray-900 placeholder-gray-500'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
//                   <p id="target-domain-error" className="text-red-500 text-xs mt-1">Please enter a valid domain</p>
//                 )}
//               </div>
//               <div className="relative flex-1">
//                 <label htmlFor="client-ip" className="sr-only">Client IP</label>
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
//                 </div>
//                 <input
//                   id="client-ip"
//                   type="text"
//                   className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
//                     isClientIpValid 
//                       ? theme === 'dark' 
//                         ? 'border-dark-border-medium' 
//                         : 'border-gray-300'
//                       : 'border-red-500'
//                   } ${
//                     theme === 'dark'
//                       ? 'bg-dark-background-primary text-dark-text-primary placeholder-dark-text-tertiary'
//                       : 'bg-white text-gray-900 placeholder-gray-500'
//                   } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
//                   <p id="client-ip-error" className="text-red-500 text-xs mt-1">Please enter a valid IP address</p>
//                 )}
//               </div>
//               <button
//                 className={`px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 theme-transition ${
//                   theme === 'dark' 
//                     ? 'bg-dark-primary-600 hover:bg-dark-primary-500 text-white' 
//                     : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
//           <div className={`p-4 rounded-lg shadow mb-6 ${
//             theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
//           }`}>
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold flex items-center text-indigo-600">
//                 <Gauge className="w-5 h-5 mr-2" aria-hidden="true" />
//                 Bandwidth Speed Test
//               </h2>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => runSpeedTest('full')}
//                   disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
//                   className={`px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50 theme-transition ${
//                     theme === 'dark' 
//                       ? 'bg-dark-primary-600 hover:bg-dark-primary-500 text-white' 
//                       : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
//                   className={`px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50 theme-transition ${
//                     theme === 'dark' 
//                       ? 'bg-dark-background-primary text-dark-text-primary hover:bg-dark-border-light' 
//                       : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
//                   }`}
//                   aria-label="Run quick speed test"
//                 >
//                   <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//                   Quick Test
//                 </button>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className={`p-4 rounded-lg ${
//                 theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//               }`}>
//                 <h3 className={`font-medium mb-3 flex items-center ${
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.bandwidth.status)}
//                   ISP Connection Speed
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className={`p-3 rounded shadow-sm ${
//                     theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
//                   }`}>
//                     <p className={`text-sm ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>Download</p>
//                     <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.bandwidth.download)}</p>
//                   </div>
//                   <div className={`p-3 rounded shadow-sm ${
//                     theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
//                   }`}>
//                     <p className={`text-sm ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>Upload</p>
//                     <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.bandwidth.upload)}</p>
//                   </div>
//                 </div>
//                 {diagnostics.bandwidth.status === 'success' && (
//                   <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Latency: {diagnostics.bandwidth.latency != null ? `${diagnostics.bandwidth.latency.toFixed(2)} ms` : 'N/A'}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Jitter: {diagnostics.bandwidth.jitter != null ? `${diagnostics.bandwidth.jitter.toFixed(2)} ms` : 'N/A'}</p>
//                   </div>
//                 )}
//               </div>

//               <div className={`p-4 rounded-lg ${
//                 theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//               }`}>
//                 <h3 className={`font-medium mb-3 flex items-center ${
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.clientBandwidth.status)}
//                   Client Speed ({clientIp || 'N/A'})
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className={`p-3 rounded shadow-sm ${
//                     theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
//                   }`}>
//                     <p className={`text-sm ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>Download</p>
//                     <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
//                   </div>
//                   <div className={`p-3 rounded shadow-sm ${
//                     theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
//                   }`}>
//                     <p className={`text-sm ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>Upload</p>
//                     <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
//                   </div>
//                 </div>
//                 {diagnostics.clientBandwidth.status === 'success' && (
//                   <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//               <div className={`mt-4 p-4 rounded-lg ${
//                 theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//               }`}>
//                 <h3 className={`font-medium mb-3 ${
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>Bandwidth Comparison</h3>
//                 <div className="space-y-2">
//                   <div>
//                     <p className={`text-sm mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>Download Efficiency</p>
//                     <div className={`w-full rounded-full h-2.5 ${
//                       theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
//                     }`}>
//                       <div
//                         className="bg-green-500 h-2.5 rounded-full"
//                         style={{
//                           width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
//                         }}
//                         role="progressbar"
//                         aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                       ></div>
//                     </div>
//                     <p className={`text-xs mt-1 ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>
//                       Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
//                       {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm mb-1 ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>Upload Efficiency</p>
//                     <div className={`w-full rounded-full h-2.5 ${
//                       theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
//                     }`}>
//                       <div
//                         className="bg-blue-500 h-2.5 rounded-full"
//                         style={{
//                           width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
//                         }}
//                         role="progressbar"
//                         aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
//                         aria-valuemin={0}
//                         aria-valuemax={100}
//                       ></div>
//                     </div>
//                     <p className={`text-xs mt-1 ${
//                       theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                     }`}>
//                       Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
//                       {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {historicalData.isp[timeFrame]?.length > 0 && (
//               <div className={`mt-4 p-4 rounded-lg ${
//                 theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//               }`}>
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className={`font-medium ${
//                     theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                   }`}>Historical Speed Data</h3>
//                   <div>
//                     <label htmlFor="timeframe-select" className="sr-only">
//                       Select Time Frame
//                     </label>
//                     <select
//                       id="timeframe-select"
//                       value={timeFrame}
//                       onChange={(e) => setTimeFrame(e.target.value)}
//                       className={`p-2 border rounded-md text-sm theme-transition ${
//                         theme === 'dark'
//                           ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary'
//                           : 'bg-white border-gray-300 text-gray-900'
//                       }`}
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
//                   options={{
//                     responsive: true,
//                     plugins: {
//                       legend: { 
//                         position: 'top',
//                         labels: {
//                           color: theme === 'dark' ? '#e5e7eb' : '#374151'
//                         }
//                       },
//                       title: { 
//                         display: true, 
//                         text: 'Speed Test History',
//                         color: theme === 'dark' ? '#e5e7eb' : '#374151'
//                       },
//                     },
//                     scales: {
//                       y: {
//                         beginAtZero: true,
//                         title: { 
//                           display: true, 
//                           text: 'Speed (Mbps)',
//                           color: theme === 'dark' ? '#9ca3af' : '#6b7280'
//                         },
//                         grid: { 
//                           color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
//                         },
//                         ticks: { 
//                           color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
//                         }
//                       },
//                       x: {
//                         grid: { 
//                           color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
//                         },
//                         ticks: { 
//                           color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
//                         }
//                       }
//                     },
//                   }}
//                 />
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             {/* Ping Test Section */}
//             <div
//               className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
//                 expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''
//               } ${
//                 theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.ping.status)}
//                   Ping Test ({diagnostics.ping.target})
//                 </h3>
//                 <button
//                   className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
//                   aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
//                 >
//                   {expandedTest === 'ping' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${
//                 theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//               }`}>
//                 {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg.toFixed(2)}ms` : 'No data yet.'}
//               </p>

//               {expandedTest === 'ping' && diagnostics.ping.result && (
//                 <div className={`mt-3 p-3 rounded text-sm ${
//                   theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                 }`}>
//                   <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Measures the round-trip time for messages sent to the target</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
//                     <p className={getStatusColor(diagnostics.ping.status)}>
//                       {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                     </p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Target:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.ping.target}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Min/Avg/Max RTT:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{`${
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
//               className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
//                 expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''
//               } ${
//                 theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.traceroute.status)}
//                   Traceroute ({diagnostics.traceroute.target})
//                 </h3>
//                 <button
//                   className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
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
//                 <div className={`mt-3 p-3 rounded ${
//                   theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                 }`}>
//                   <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-2">
//                     <div className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Hop</div>
//                     <div className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>IP Address</div>
//                     <div className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Time</div>
//                   </div>
//                   {diagnostics.traceroute.result.hops.map((hop, index) => (
//                     <div key={index} className={`grid grid-cols-3 gap-2 text-sm py-1 border-b ${
//                       theme === 'dark' ? 'border-dark-border-light' : 'border-gray-200'
//                     } last:border-0`}>
//                       <div className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{hop.hop ?? 'N/A'}</div>
//                       <div className={`font-mono ${
//                         theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//                       }`}>{hop.ip || '*'}</div>
//                       <div className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{hop.time != null ? `${hop.time.toFixed(2)} ms` : 'N/A'}</div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className={`mt-1 ${
//                   theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                 }`}>{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
//               )}
//             </div>

//             {/* Health Check Section */}
//             <div
//               className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
//                 expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''
//               } ${
//                 theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.healthCheck.status)}
//                   Router Health Check
//                 </h3>
//                 <button
//                   className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
//                   aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
//                 >
//                   {expandedTest === 'health' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${
//                 theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//               }`}>
//                 {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
//                   ? `CPU: ${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'health' && diagnostics.healthCheck.result && (
//                 <div className={`mt-3 p-3 rounded text-sm ${
//                   theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                 }`}>
//                   <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Monitors the router's resource usage and service status</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
//                     <p className={getStatusColor(diagnostics.healthCheck.status)}>
//                       {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
//                     </p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>CPU Usage:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.healthCheck.result.cpu_usage != null ? `${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%` : 'N/A'}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Memory Usage:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.healthCheck.result.memory_usage != null ? `${diagnostics.healthCheck.result.memory_usage.toFixed(2)}%` : 'N/A'}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Disk Usage:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.healthCheck.result.disk_usage != null ? `${diagnostics.healthCheck.result.disk_usage.toFixed(2)}%` : 'N/A'}</p>
//                   </div>
//                   {diagnostics.healthCheck.result.services?.length > 0 && (
//                     <div className="mt-3">
//                       <p className={`font-medium ${
//                         theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//                       }`}>Services:</p>
//                       {diagnostics.healthCheck.result.services.map((service, index) => (
//                         <div key={index} className="flex justify-between py-1">
//                           <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{service.name ?? 'Unknown'}</span>
//                           <span className={service.status === 'running' ? 'text-green-600' : 'text-red-600'}>
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
//               className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
//                 expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''
//               } ${
//                 theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.dns.status)}
//                   DNS Resolution Test ({diagnostics.dns.target})
//                 </h3>
//                 <button
//                   className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
//                   aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
//                 >
//                   {expandedTest === 'dns' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${
//                 theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//               }`}>
//                 {diagnostics.dns.result && diagnostics.dns.result.addresses?.length > 0
//                   ? `Resolved: ${diagnostics.dns.result.addresses[0]}`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'dns' && diagnostics.dns.result && (
//                 <div className={`mt-3 p-3 rounded text-sm ${
//                   theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                 }`}>
//                   <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Tests the resolution of domain names to IP addresses</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
//                     <p className={getStatusColor(diagnostics.dns.status)}>
//                       {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
//                     </p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Target:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.dns.target}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Resolved IPs:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
//                       {diagnostics.dns.result.addresses?.length > 0
//                         ? diagnostics.dns.result.addresses.join(', ')
//                         : 'None'}
//                     </p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Response Time:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
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
//               className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
//                 expandedTest === 'packetLoss' ? 'ring-2 ring-indigo-500' : ''
//               } ${
//                 theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
//                   theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
//                 }`}>
//                   {renderStatusIcon(diagnostics.packetLoss.status)}
//                   Packet Loss Test ({diagnostics.packetLoss.target})
//                 </h3>
//                 <button
//                   className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
//                   aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
//                 >
//                   {expandedTest === 'packetLoss' ? (
//                     <ChevronUp className="w-5 h-5" aria-hidden="true" />
//                   ) : (
//                     <ChevronDown className="w-5 h-5" aria-hidden="true" />
//                   )}
//                 </button>
//               </div>
//               <p className={`mt-1 ${
//                 theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//               }`}>
//                 {diagnostics.packetLoss.result && diagnostics.packetLoss.result.loss != null
//                   ? `Loss: ${diagnostics.packetLoss.result.loss.toFixed(2)}%`
//                   : 'No data yet.'}
//               </p>

//               {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
//                 <div className={`mt-3 p-3 rounded text-sm ${
//                   theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                 }`}>
//                   <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Measures the percentage of packets lost during transmission</p>
//                   <div className="grid grid-cols-2 gap-2 mt-2">
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
//                     <p className={getStatusColor(diagnostics.packetLoss.status)}>
//                       {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
//                     </p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Target:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.packetLoss.target}</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Packet Loss:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
//                       {diagnostics.packetLoss.result.loss != null
//                         ? `${diagnostics.packetLoss.result.loss.toFixed(2)}%`
//                         : 'N/A'}
//                     </p>
//                     <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Packets Sent/Received:</p>
//                     <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
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
//         <div className={`p-8 rounded-lg text-center ${
//           theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//         }`}>
//           <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
//             theme === 'dark' ? 'bg-dark-background-primary' : 'bg-gray-200'
//           }`}>
//             <Router className={`h-6 w-6 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`} aria-hidden="true" />
//           </div>
//           <h3 className={`mt-2 text-lg font-medium ${
//             theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
//           }`}>No router selected</h3>
//           <p className={`mt-1 ${
//             theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
//           }`}>
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








import React, { useState, useCallback, useEffect } from 'react';
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

  const renderStatusIcon = (status) => {
    const icons = {
      running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" />,
      success: <CheckCircle className="text-green-500 inline-block mr-2" />,
      error: <XCircle className="text-red-500 inline-block mr-2" />,
      idle: <Clock className="text-gray-500 inline-block mr-2" />,
    };
    return icons[status] || icons.idle;
  };

  const getStatusColor = (status) => {
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
  };

  const formatSpeed = (speed) => {
    return speed != null ? `${speed.toFixed(2)} Mbps` : 'N/A';
  };

  const calculateEfficiency = (client, isp) => {
    if (isp == null || isp === 0 || client == null) return 0;
    return Math.min(100, Math.round((client / isp) * 100));
  };

  const toggleTestExpansion = useCallback((testName) => {
    setExpandedTest(prev => (prev === testName ? null : testName));
  }, []);

  const chartData = {
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
  };

  return (
    <div className={`p-6 rounded-lg theme-transition ${
      theme === 'dark' ? 'bg-dark-background-primary text-dark-text-primary' : 'bg-white text-gray-900'
    }`} role="region" aria-label="Network Diagnostics">
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />

      <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-4 rounded-lg shadow ${
        theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <Activity className="w-8 h-8 text-indigo-600" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Network Diagnostics</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Comprehensive network analysis and speed testing</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {routers.length === 0 ? (
            <div className={`flex-1 border-l-4 p-3 rounded w-full ${
              theme === 'dark' ? 'bg-yellow-900 border-yellow-500 text-yellow-300' : 'bg-yellow-100 border-yellow-500 text-yellow-700'
            }`}>
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
                  in the Router Management section to run diagnostics.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative flex-1">
                <label htmlFor="router-select" className="sr-only">Select Router</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Server className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <select
                  id="router-select"
                  value={selectedRouterId}
                  onChange={(e) => setSelectedRouterId(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
                    theme === 'dark'
                      ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
                  <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="target-domain"
                  type="text"
                  className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
                    isTargetValid 
                      ? theme === 'dark' 
                        ? 'border-dark-border-medium' 
                        : 'border-gray-300'
                      : 'border-red-500'
                  } ${
                    theme === 'dark'
                      ? 'bg-dark-background-primary text-dark-text-primary placeholder-dark-text-tertiary'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
                  <p id="target-domain-error" className="text-red-500 text-xs mt-1">Please enter a valid domain</p>
                )}
              </div>
              <div className="relative flex-1">
                <label htmlFor="client-ip" className="sr-only">Client IP</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
                </div>
                <input
                  id="client-ip"
                  type="text"
                  className={`pl-10 pr-4 py-2 w-full border rounded-md theme-transition ${
                    isClientIpValid 
                      ? theme === 'dark' 
                        ? 'border-dark-border-medium' 
                        : 'border-gray-300'
                      : 'border-red-500'
                  } ${
                    theme === 'dark'
                      ? 'bg-dark-background-primary text-dark-text-primary placeholder-dark-text-tertiary'
                      : 'bg-white text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
                  <p id="client-ip-error" className="text-red-500 text-xs mt-1">Please enter a valid IP address</p>
                )}
              </div>
              <button
                className={`px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 theme-transition ${
                  theme === 'dark' 
                    ? 'bg-dark-primary-600 hover:bg-dark-primary-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
          <div className={`p-4 rounded-lg shadow mb-6 ${
            theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center text-indigo-600">
                <Gauge className="w-5 h-5 mr-2" aria-hidden="true" />
                Bandwidth Speed Test
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => runSpeedTest('full')}
                  disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
                  className={`px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50 theme-transition ${
                    theme === 'dark' 
                      ? 'bg-dark-primary-600 hover:bg-dark-primary-500 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
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
                  className={`px-3 py-1 rounded-md text-sm flex items-center disabled:opacity-50 theme-transition ${
                    theme === 'dark' 
                      ? 'bg-dark-background-primary text-dark-text-primary hover:bg-dark-border-light' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                  aria-label="Run quick speed test"
                >
                  <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
                  Quick Test
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
              }`}>
                <h3 className={`font-medium mb-3 flex items-center ${
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.bandwidth.status)}
                  ISP Connection Speed
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded shadow-sm ${
                    theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Download</p>
                    <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.bandwidth.download)}</p>
                  </div>
                  <div className={`p-3 rounded shadow-sm ${
                    theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Upload</p>
                    <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.bandwidth.upload)}</p>
                  </div>
                </div>
                {diagnostics.bandwidth.status === 'success' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Latency: {diagnostics.bandwidth.latency != null ? `${diagnostics.bandwidth.latency.toFixed(2)} ms` : 'N/A'}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Jitter: {diagnostics.bandwidth.jitter != null ? `${diagnostics.bandwidth.jitter.toFixed(2)} ms` : 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
              }`}>
                <h3 className={`font-medium mb-3 flex items-center ${
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.clientBandwidth.status)}
                  Client Speed ({clientIp || 'N/A'})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded shadow-sm ${
                    theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Download</p>
                    <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
                  </div>
                  <div className={`p-3 rounded shadow-sm ${
                    theme === 'dark' ? 'bg-dark-background-primary' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Upload</p>
                    <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
                  </div>
                </div>
                {diagnostics.clientBandwidth.status === 'success' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
                  </div>
                )}
              </div>
            </div>

            {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
              <div className={`mt-4 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
              }`}>
                <h3 className={`font-medium mb-3 ${
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>Bandwidth Comparison</h3>
                <div className="space-y-2">
                  <div>
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Download Efficiency</p>
                    <div className={`w-full rounded-full h-2.5 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>
                      Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
                      {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Upload Efficiency</p>
                    <div className={`w-full rounded-full h-2.5 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>
                      Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
                      {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {historicalData.isp[timeFrame]?.length > 0 && (
              <div className={`mt-4 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-medium ${
                    theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>Historical Speed Data</h3>
                  <div>
                    <label htmlFor="timeframe-select" className="sr-only">
                      Select Time Frame
                    </label>
                    <select
                      id="timeframe-select"
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                      className={`p-2 border rounded-md text-sm theme-transition ${
                        theme === 'dark'
                          ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
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
                  options={{
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
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Ping Test Section */}
            <div
              className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
                expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''
              } ${
                theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.ping.status)}
                  Ping Test ({diagnostics.ping.target})
                </h3>
                <button
                  className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
                  aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
                >
                  {expandedTest === 'ping' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
              }`}>
                {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg.toFixed(2)}ms` : 'No data yet.'}
              </p>

              {expandedTest === 'ping' && diagnostics.ping.result && (
                <div className={`mt-3 p-3 rounded text-sm ${
                  theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                }`}>
                  <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Measures the round-trip time for messages sent to the target</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
                    <p className={getStatusColor(diagnostics.ping.status)}>
                      {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
                    </p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Target:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.ping.target}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Min/Avg/Max RTT:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{`${
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
              className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
                expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''
              } ${
                theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.traceroute.status)}
                  Traceroute ({diagnostics.traceroute.target})
                </h3>
                <button
                  className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
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
                <div className={`mt-3 p-3 rounded ${
                  theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-2">
                    <div className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Hop</div>
                    <div className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>IP Address</div>
                    <div className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Time</div>
                  </div>
                  {diagnostics.traceroute.result.hops.map((hop, index) => (
                    <div key={index} className={`grid grid-cols-3 gap-2 text-sm py-1 border-b ${
                      theme === 'dark' ? 'border-dark-border-light' : 'border-gray-200'
                    } last:border-0`}>
                      <div className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{hop.hop ?? 'N/A'}</div>
                      <div className={`font-mono ${
                        theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
                      }`}>{hop.ip || '*'}</div>
                      <div className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{hop.time != null ? `${hop.time.toFixed(2)} ms` : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`mt-1 ${
                  theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                }`}>{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
              )}
            </div>

            {/* Health Check Section */}
            <div
              className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
                expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''
              } ${
                theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.healthCheck.status)}
                  Router Health Check
                </h3>
                <button
                  className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
                  aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
                >
                  {expandedTest === 'health' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
              }`}>
                {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
                  ? `CPU: ${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'health' && diagnostics.healthCheck.result && (
                <div className={`mt-3 p-3 rounded text-sm ${
                  theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                }`}>
                  <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Monitors the router's resource usage and service status</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
                    <p className={getStatusColor(diagnostics.healthCheck.status)}>
                      {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
                    </p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>CPU Usage:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.healthCheck.result.cpu_usage != null ? `${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%` : 'N/A'}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Memory Usage:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.healthCheck.result.memory_usage != null ? `${diagnostics.healthCheck.result.memory_usage.toFixed(2)}%` : 'N/A'}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Disk Usage:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.healthCheck.result.disk_usage != null ? `${diagnostics.healthCheck.result.disk_usage.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                  {diagnostics.healthCheck.result.services?.length > 0 && (
                    <div className="mt-3">
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
                      }`}>Services:</p>
                      {diagnostics.healthCheck.result.services.map((service, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{service.name ?? 'Unknown'}</span>
                          <span className={service.status === 'running' ? 'text-green-600' : 'text-red-600'}>
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
              className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
                expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''
              } ${
                theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.dns.status)}
                  DNS Resolution Test ({diagnostics.dns.target})
                </h3>
                <button
                  className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
                  aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
                >
                  {expandedTest === 'dns' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
              }`}>
                {diagnostics.dns.result && diagnostics.dns.result.addresses?.length > 0
                  ? `Resolved: ${diagnostics.dns.result.addresses[0]}`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'dns' && diagnostics.dns.result && (
                <div className={`mt-3 p-3 rounded text-sm ${
                  theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                }`}>
                  <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Tests the resolution of domain names to IP addresses</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
                    <p className={getStatusColor(diagnostics.dns.status)}>
                      {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
                    </p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Target:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.dns.target}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Resolved IPs:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
                      {diagnostics.dns.result.addresses?.length > 0
                        ? diagnostics.dns.result.addresses.join(', ')
                        : 'None'}
                    </p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Response Time:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
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
              className={`p-4 rounded-lg shadow cursor-pointer theme-transition ${
                expandedTest === 'packetLoss' ? 'ring-2 ring-indigo-500' : ''
              } ${
                theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white'
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
                  theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  {renderStatusIcon(diagnostics.packetLoss.status)}
                  Packet Loss Test ({diagnostics.packetLoss.target})
                </h3>
                <button
                  className={theme === 'dark' ? 'text-dark-text-tertiary hover:text-dark-text-secondary' : 'text-gray-500 hover:text-gray-400'}
                  aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
                >
                  {expandedTest === 'packetLoss' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className={`mt-1 ${
                theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
              }`}>
                {diagnostics.packetLoss.result && diagnostics.packetLoss.result.loss != null
                  ? `Loss: ${diagnostics.packetLoss.result.loss.toFixed(2)}%`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
                <div className={`mt-3 p-3 rounded text-sm ${
                  theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                }`}>
                  <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Measures the percentage of packets lost during transmission</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Status:</p>
                    <p className={getStatusColor(diagnostics.packetLoss.status)}>
                      {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
                    </p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Target:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>{diagnostics.packetLoss.target}</p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Packet Loss:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
                      {diagnostics.packetLoss.result.loss != null
                        ? `${diagnostics.packetLoss.result.loss.toFixed(2)}%`
                        : 'N/A'}
                    </p>
                    <p className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'}>Packets Sent/Received:</p>
                    <p className={theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'}>
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
        <div className={`p-8 rounded-lg text-center ${
          theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
        }`}>
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
            theme === 'dark' ? 'bg-dark-background-primary' : 'bg-gray-200'
          }`}>
            <Router className={`h-6 w-6 ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-600'}`} aria-hidden="true" />
          </div>
          <h3 className={`mt-2 text-lg font-medium ${
            theme === 'dark' ? 'text-dark-text-primary' : 'text-gray-900'
          }`}>No router selected</h3>
          <p className={`mt-1 ${
            theme === 'dark' ? 'text-dark-text-secondary' : 'text-gray-500'
          }`}>
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