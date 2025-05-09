



// import React, { useState, useEffect } from 'react';
// import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

// // Mock data for diagnostics
// const mockDiagnostics = {
//   ping: { result: '20ms', status: 'success', target: 'example.com' },
//   traceroute: {
//     result: [
//       { hop: 1, ip: '192.168.1.1', time: '2ms' },
//       { hop: 2, ip: '10.0.0.1', time: '4ms' },
//       { hop: 3, ip: 'isp.gateway', time: '10ms' },
//     ],
//     status: 'success',
//     target: 'example.com',
//   },
//   healthCheck: { status: 'All services are operational', result: true },
//   bandwidth: { download: '100 Mbps', upload: '50 Mbps', status: 'success' },
//   dns: { result: 'DNS resolution successful', status: 'success', target: 'example.com' },
// };

// const NetworkDiagnostics = () => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: 'example.com' },
//     traceroute: { result: null, status: 'idle', target: 'example.com' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { result: null, status: 'idle' },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');

//   const runDiagnostics = () => {
//     setLoading(true);
//     setError(null);

//     // Simulate API call with a delay
//     setTimeout(() => {
//       try {
//         setDiagnostics({
//           ...mockDiagnostics,
//           ping: { ...mockDiagnostics.ping, target: diagnosticsTarget },
//           traceroute: { ...mockDiagnostics.traceroute, target: diagnosticsTarget },
//           dns: { ...mockDiagnostics.dns, target: diagnosticsTarget },
//         });
//       } catch (err) {
//         setError('Failed to run diagnostics');
//       } finally {
//         setLoading(false);
//       }
//     }, 2000);
//   };

//   useEffect(() => {
//     // Here you could initialize or fetch initial diagnostic data if needed
//     return () => {
//       // Cleanup if necessary, like cancelling API calls
//     };
//   }, []);

//   const renderStatusIcon = (status) => {
//     if (loading) return <FaSpinner className="text-gray-500 animate-spin inline-block mr-2" />;
//     if (status === 'success') return <FaCheckCircle className="text-green-500 inline-block mr-2" />;
//     if (status === 'error') return <FaTimesCircle className="text-red-500 inline-block mr-2" />;
//     return null;
//   };

//   return (
//     <div className="p-6 bg-white rounded shadow-md">
//       <h2 className="text-lg font-bold text-gray-800 mb-4">Network Diagnostics</h2>
//       <div className="flex items-center mb-4">
//         <input
//           type="text"
//           className="border p-2 rounded-l w-64"
//           placeholder="Enter target (e.g., example.com)"
//           value={diagnosticsTarget}
//           onChange={(e) => setDiagnosticsTarget(e.target.value)}
//         />
//         <button
//           className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:opacity-50"
//           onClick={runDiagnostics}
//           disabled={loading}
//         >
//           {loading ? 'Running...' : 'Run Diagnostics'}
//         </button>
//       </div>

//       {error && (
//         <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
//           <p className="font-bold">Error:</p>
//           <p>{error}</p>
//         </div>
//       )}

//       <div className="mt-6">
//         <div className="mb-4">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.ping.status)}
//             Ping Test ({diagnostics.ping.target})
//           </h3>
//           <p>{diagnostics.ping.result ? `Latency: ${diagnostics.ping.result}` : 'No data yet.'}</p>
//         </div>

//         <div className="mb-4">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.traceroute.status)}
//             Traceroute ({diagnostics.traceroute.target})
//           </h3>
//           {diagnostics.traceroute.result ? (
//             <ul className="mt-2 bg-gray-100 p-2 rounded">
//               {diagnostics.traceroute.result.map((hop, index) => (
//                 <li key={index} className="mb-1">
//                   Hop {hop.hop}: {hop.ip} - {hop.time}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No data yet.</p>
//           )}
//         </div>

//         <div className="mb-4">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.healthCheck.status)}
//             Application Health Check
//           </h3>
//           <p>{diagnostics.healthCheck.result !== null ? diagnostics.healthCheck.status : 'No data yet.'}</p>
//         </div>

//         <div className="mb-4">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.bandwidth.status)}
//             Bandwidth Check
//           </h3>
//           <p>{diagnostics.bandwidth.result ? `Download: ${diagnostics.bandwidth.download} | Upload: ${diagnostics.bandwidth.upload}` : 'No data yet.'}</p>
//         </div>

//         <div className="mb-4">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.dns.status)}
//             DNS Resolution ({diagnostics.dns.target})
//           </h3>
//           <p>{diagnostics.dns.result ? diagnostics.dns.result : 'No data yet.'}</p>
//         </div>
//       </div>

//       <div className="text-sm text-gray-600 mt-4">
//         <p>Note: Diagnose network performance and service availability. Results will refresh each time you run diagnostics.</p>
//       </div>
//     </div>
//   );
// };

// export default NetworkDiagnostics;










// import React, { useState, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Activity, Wifi, Server, Download, Upload, 
//   Clock, AlertCircle, CheckCircle, XCircle, 
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Utility Functions
// const validateIp = (ip) => {
//   const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//   return ipRegex.test(ip);
// };

// const validateDomain = (domain) => {
//   const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
//   return domainRegex.test(domain);
// };

// // Mock Data - Replace with actual API in production
// const mockDiagnostics = {
//   ping: { 
//     result: '18ms', 
//     status: 'success', 
//     target: 'example.com' 
//   },
//   traceroute: {
//     result: [
//       { hop: 1, ip: '192.168.1.1', time: '1ms', location: 'Local Network' },
//       { hop: 2, ip: '10.0.0.1', time: '3ms', location: 'ISP Gateway' },
//       { hop: 3, ip: '203.0.113.1', time: '12ms', location: 'ISP Core' },
//       { hop: 4, ip: '198.51.100.1', time: '18ms', location: 'Peering Point' },
//     ],
//     status: 'success',
//     target: 'example.com',
//   },
//   healthCheck: { 
//     status: 'success',
//     result: 'All services operational',
//     details: [
//       { service: 'DHCP', status: 'operational' },
//       { service: 'DNS', status: 'operational' },
//       { service: 'NAT', status: 'operational' },
//       { service: 'Firewall', status: 'operational' },
//     ]
//   },
//   bandwidth: { 
//     download: '95.4 Mbps', 
//     upload: '47.2 Mbps', 
//     status: 'success',
//     server: 'New York, USA',
//     isp: 'Example ISP',
//     latency: '18ms',
//     jitter: '2ms'
//   },
//   clientBandwidth: {
//     download: '45.2 Mbps',
//     upload: '22.1 Mbps',
//     status: 'success',
//     clientIp: '192.168.1.100',
//     device: 'Desktop PC',
//     connectionType: 'Ethernet'
//   },
//   dns: { 
//     result: 'DNS resolution successful',
//     status: 'success',
//     target: 'example.com',
//     details: {
//       hostname: 'example.com',
//       resolvedIp: '93.184.216.34',
//       dnsServer: '1.1.1.1',
//       queryTime: '24ms'
//     }
//   },
//   packetLoss: { 
//     result: '0% packet loss',
//     status: 'success',
//     target: 'example.com',
//     details: {
//       packetsSent: 100,
//       packetsReceived: 100,
//       minRtt: '16ms',
//       maxRtt: '22ms',
//       avgRtt: '18ms'
//     }
//   },
// };

// const NetworkDiagnostics = ({ routerId }) => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: 'example.com' },
//     traceroute: { result: null, status: 'idle', target: 'example.com' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { download: null, upload: null, status: 'idle' },
//     clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//     packetLoss: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');
//   const [expandedTest, setExpandedTest] = useState(null);
//   const [speedTestRunning, setSpeedTestRunning] = useState(false);
//   const [clientIp, setClientIp] = useState('192.168.1.100');

//   // API call simulation - Replace with actual API calls
//   const fetchDiagnostics = useCallback(async (test, target) => {
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       return mockDiagnostics[test]; // Replace with actual API response
//     } catch (err) {
//       throw new Error(`Failed to fetch ${test} diagnostics`);
//     }
//   }, []);

//   const runDiagnostics = useCallback(async () => {
//     if (!validateDomain(diagnosticsTarget)) {
//       toast.error('Invalid target domain');
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     const tests = [
//       'ping', 'dns', 'traceroute', 'packetLoss', 
//       'healthCheck', 'bandwidth', 'clientBandwidth'
//     ];

//     try {
//       for (const test of tests) {
//         setDiagnostics(prev => ({
//           ...prev,
//           [test]: { ...prev[test], status: 'running' }
//         }));

//         const result = await fetchDiagnostics(test, diagnosticsTarget);
        
//         setDiagnostics(prev => ({
//           ...prev,
//           [test]: { 
//             ...result, 
//             status: 'success',
//             target: test === 'healthCheck' ? undefined : diagnosticsTarget,
//             clientIp: test === 'clientBandwidth' ? clientIp : undefined
//           }
//         }));

//         await new Promise(resolve => setTimeout(resolve, 500));
//       }
//     } catch (err) {
//       setError(err.message);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//       setSpeedTestRunning(false);
//     }
//   }, [diagnosticsTarget, clientIp, fetchDiagnostics]);

//   const runSpeedTest = useCallback(async (type) => {
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       return;
//     }

//     setSpeedTestRunning(true);
//     setDiagnostics(prev => ({
//       ...prev,
//       bandwidth: { ...prev.bandwidth, status: 'running' },
//       clientBandwidth: { ...prev.clientBandwidth, status: 'running' }
//     }));

//     try {
//       await new Promise(resolve => setTimeout(resolve, type === 'full' ? 5000 : 3000));
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: { ...mockDiagnostics.bandwidth, status: 'success' },
//         clientBandwidth: { ...mockDiagnostics.clientBandwidth, status: 'success', clientIp }
//       }));
//       toast.success('Speed test completed');
//     } catch (err) {
//       setError('Speed test failed');
//       toast.error('Speed test failed');
//     } finally {
//       setSpeedTestRunning(false);
//     }
//   }, [clientIp]);

//   const renderStatusIcon = (status) => {
//     const icons = {
//       running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" aria-hidden="true" />,
//       success: <CheckCircle className="text-green-500 inline-block mr-2" aria-hidden="true" />,
//       error: <XCircle className="text-red-500 inline-block mr-2" aria-hidden="true" />,
//       idle: <Clock className="text-gray-500 inline-block mr-2" aria-hidden="true" />
//     };
//     return icons[status];
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       success: 'bg-green-500/20 text-green-500',
//       error: 'bg-red-500/20 text-red-500',
//       running: 'bg-yellow-500/20 text-yellow-500',
//       idle: 'bg-gray-500/20 text-gray-500'
//     };
//     return colors[status];
//   };

//   const formatSpeed = (speed) => {
//     return speed || 'N/A';
//   };

//   const toggleTestExpansion = useCallback((testName) => {
//     setExpandedTest(prev => prev === testName ? null : testName);
//   }, []);

//   return (
//     <div className="p-6 bg-gray-900 text-gray-200 rounded-lg" role="region" aria-label="Network Diagnostics">
//       <ToastContainer position="top-right" autoClose={3000} theme="dark" />

//       <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-gray-800 p-4 rounded-lg shadow">
//         <div className="flex items-center space-x-4 mb-4 md:mb-0">
//           <Activity className="w-8 h-8 text-indigo-400" aria-hidden="true" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-400">Network Diagnostics</h1>
//             <p className="text-sm text-gray-400">Comprehensive network analysis and speed testing</p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-1">
//             <label htmlFor="target-domain" className="sr-only">Target Domain</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Network className="h-5 w-5 text-gray-400" aria-hidden="true" />
//             </div>
//             <input
//               id="target-domain"
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter target (e.g., example.com)"
//               value={diagnosticsTarget}
//               onChange={(e) => setDiagnosticsTarget(e.target.value)}
//               aria-label="Target domain for diagnostics"
//             />
//           </div>

//           <div className="relative flex-1">
//             <label htmlFor="client-ip" className="sr-only">Client IP</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Wifi className="h-5 w-5 text-gray-400" aria-hidden="true" />
//             </div>
//             <input
//               id="client-ip"
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Client IP (e.g., 192.168.1.100)"
//               value={clientIp}
//               onChange={(e) => setClientIp(e.target.value)}
//               aria-label="Client IP address"
//             />
//           </div>

//           <button
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
//             onClick={runDiagnostics}
//             disabled={loading}
//             aria-label="Run network diagnostics"
//           >
//             {loading ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-5 h-5 dilatationmr-2" aria-hidden="true" />
//                 Run Diagnostics
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       {error && (
//         <div className="mt-4 bg-red-900/30 border-l-4 border-red-500 text-red-300 p-4 rounded" role="alert">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
//             <strong>Error:</strong>
//           </div>
//           <p className="mt-1">{error}</p>
//         </div>
//       )}

//       {/* Speed Test Section */}
//       <div className="bg-gray-800 p-4 rounded-lg shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <Gauge className="w-5 h-5 mr-2 text-indigo-400" aria-hidden="true" />
//             Bandwidth Speed Test
//           </h2>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => runSpeedTest('full')}
//               disabled={speedTestRunning}
//               className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run full speed test"
//             >
//               {speedTestRunning ? (
//                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
//               ) : (
//                 <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               )}
//               Full Test
//             </button>
//             <button
//               onClick={() => runSpeedTest('quick')}
//               disabled={speedTestRunning}
//               className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run quick speed test"
//             >
//               <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               Quick Test
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* ISP Bandwidth */}
//           <div className="bg-gray-750 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-300 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.bandwidth.status)}
//               ISP Connection Speed
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-gray-800 p-3 rounded">
//                 <p className="text-sm text-gray-400">Download</p>
//                 <p className="text-xl font-bold text-green-400">
//                   {formatSpeed(diagnostics.bandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-gray-800 p-3 rounded">
//                 <p className="text-sm text-gray-400">Upload</p>
//                 <p className="text-xl font-bold text-blue-400">
//                   {formatSpeed(diagnostics.bandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.bandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
//                 <p>Server: {diagnostics.bandwidth.server}</p>
//                 <p>ISP: {diagnostics.bandwidth.isp}</p>
//                 <p>Latency: {diagnostics.bandwidth.latency}</p>
//                 <p>Jitter: {diagnostics.bandwidth.jitter}</p>
//               </div>
//             )}
//           </div>

//           {/* Client Bandwidth */}
//           <div className="bg-gray-750 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-300 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.clientBandwidth.status)}
//               Client Speed ({clientIp})
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-gray-800 p-3 rounded">
//                 <p className="text-sm text-gray-400">Download</p>
//                 <p className="text-xl font-bold text-green-400">
//                   {formatSpeed(diagnostics.clientBandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-gray-800 p-3 rounded">
//                 <p className="text-sm text-gray-400">Upload</p>
//                 <p className="text-xl font-bold text-blue-400">
//                   {formatSpeed(diagnostics.clientBandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
//                 <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                 <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Speed Comparison */}
//         {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//           <div className="mt-4 bg-gray-750 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-300 mb-3">Bandwidth Comparison</h3>
//             <div className="space-y-2">
//               <div>
//                 <p className="text-sm text-gray-400 mb-1">Download Efficiency</p>
//                 <div className="w-full bg-gray-700 rounded-full h-2.5">
//                   <div 
//                     className="bg-green-500 h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.round(
//                         (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                          parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                       )}%` 
//                     }}
//                     role="progressbar"
//                     aria-valuenow={Math.round(
//                       (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                        parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                     )}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">
//                   Client gets {diagnostics.clientBandwidth.download} of {diagnostics.bandwidth.download} ({Math.round(
//                     (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                      parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                   )}%)
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-400 mb-1">Upload Efficiency</p>
//                 <div className="w-full bg-gray-700 rounded-full h-2.5">
//                   <div 
//                     className="bg-blue-500 h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.round(
//                         (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                          parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                       )}%` 
//                     }}
//                     role="progressbar"
//                     aria-valuenow={Math.round(
//                       (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                        parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                     )}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-400 mt-1">
//                   Client gets {diagnostics.clientBandwidth.upload} of {diagnostics.bandwidth.upload} ({Math.round(
//                     (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                      parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                   )}%)
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Diagnostic Tests */}
//       <div className="space-y-4">
//         {/* Ping Test */}
//         <div 
//           className={`bg-gray-800 p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('ping')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//           aria-expanded={expandedTest === 'ping'}
//           aria-label="Ping Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-300 flex items-center">
//               {renderStatusIcon(diagnostics.ping.status)}
//               Ping Test ({diagnostics.ping.target})
//             </h3>
//             <button className="text-gray-400 hover:text-gray-300" aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}>
//               {expandedTest === 'ping' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-400">
//             {diagnostics.ping.result ? `Latency: ${diagnostics.ping.result}` : 'No data yet.'}
//           </p>
          
//           {expandedTest === 'ping' && (
//             <div className="mt-3 bg-gray-750 p-3 rounded text-sm">
//               <p className="text-gray-400">Measures the round-trip time for messages sent to the target</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-400">Status:</p>
//                 <p className={getStatusColor(diagnostics.ping.status)}>
//                   {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                 </p>
//                 <p className="text-gray-400">Target:</p>
//                 <p className="text-gray-200">{diagnostics.ping.target}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Traceroute Test */}
//         <div 
//           className={`bg-gray-800 p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('traceroute')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//           aria-expanded={expandedTest === 'traceroute'}
//           aria-label="Traceroute Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-300 flex items-center">
//               {renderStatusIcon(diagnostics.traceroute.status)}
//               Traceroute ({diagnostics.traceroute.target})
//             </h3>
//             <button className="text-gray-400 hover:text-gray-300" aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}>
//               {expandedTest === 'traceroute' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'traceroute' && diagnostics.traceroute.result ? (
//             <div className="mt-3 bg-gray-750 p-3 rounded">
//               <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-400 mb-2">
//                 <div>Hop</div>
//                 <div>IP Address</div>
//                 <div>Time</div>
//                 <div>Location</div>
//               </div>
//               {Array.isArray(diagnostics.traceroute.result) && diagnostics.traceroute.result.map((hop, index) => (
//                 <div key={index} className="grid grid-cols-4 gap-2 text-sm py-1 border-b border-gray-700 last:border-0">
//                   <div>{hop.hop}</div>
//                   <div className="font-mono">{hop.ip}</div>
//                   <div>{hop.time}</div>
//                   <div>{hop.location}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-400">
//               {diagnostics.traceroute.result ? 'View route path' : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         {/* Health Check */}
//         <div 
//           className={`bg-gray-800 p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('health')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//           aria-expanded={expandedTest === 'health'}
//           aria-label="Router Health Check Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-300 flex items-center">
//               {renderStatusIcon(diagnostics.healthCheck.status)}
//               Router Health Check
//             </h3>
//             <button className="text-gray-400 hover:text-gray-300" aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}>
//               {expandedTest === 'health' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'health' && diagnostics.healthCheck.result !== null ? (
//             <div className="mt-3 bg-gray-750 p-3 rounded">
//               <p className="text-gray-200 mb-2">{diagnostics.healthCheck.result}</p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {diagnostics.healthCheck.details?.map((service, index) => (
//                   <div key={index} className="flex items-center">
//                     {service.status === 'operational' ? (
//                       <CheckCircle className="w-4 h-4 text-green-500 mr-2" aria-hidden="true" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
//                     )}
//                     <span className="text-gray-300">{service.service}</span>
//                     <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
//                       {service.status}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-400">
//               {diagnostics.healthCheck.result !== null ? diagnostics.healthCheck.result : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         {/* DNS Test */}
//         <div 
//           className={`bg-gray-800 p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('dns')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//           aria-expanded={expandedTest === 'dns'}
//           aria-label="DNS Resolution Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-300 flex items-center">
//               {renderStatusIcon(diagnostics.dns.status)}
//               DNS Resolution ({diagnostics.dns.target})
//             </h3>
//             <button className="text-gray-400 hover:text-gray-300" aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}>
//               {expandedTest === 'dns' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'dns' && diagnostics.dns.result ? (
//             <div className="mt-3 bg-gray-750 p-3 rounded">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-400">Hostname</p>
//                   <p className="text-gray-200">{diagnostics.dns.details?.hostname}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400">Resolved IP</p>
//                   <p className="text-gray-200 font-mono">{diagnostics.dns.details?.resolvedIp}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400">DNS Server</p>
//                   <p className="text-gray-200">{diagnostics.dns.details?.dnsServer}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400">Query Time</p>
//                   <p className="text-gray-200">{diagnostics.dns.details?.queryTime}</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-400">
//               {diagnostics.dns.result ? diagnostics.dns.result : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         {/* Packet Loss Test */}
//         <div 
//           className={`bg-gray-800 p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packet' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('packet')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packet')}
//           aria-expanded={expandedTest === 'packet'}
//           aria-label="Packet Loss Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-300 flex items-center">
//               {renderStatusIcon(diagnostics.packetLoss.status)}
//               Packet Loss Test ({diagnostics.packetLoss.target})
//             </h3>
//             <button className="text-gray-400 hover:text-gray-300" aria-label={expandedTest === 'packet' ? 'Collapse packet loss test' : 'Expand packet loss test'}>
//               {expandedTest === 'packet' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'packet' && diagnostics.packetLoss.result ? (
//             <div className="mt-3 bg-gray-750 p-3 rounded">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-400">Packet Loss</p>
//                   <p className="text-gray-200 text-xl font-bold">{diagnostics.packetLoss.result}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400">Packets Sent/Received</p>
//                   <p className="text-gray-200">
//                     {diagnostics.packetLoss.details?.packetsSent} / {diagnostics.packetLoss.details?.packetsReceived}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400">Average RTT</p>
//                   <p className="text-gray-200">{diagnostics.packetLoss.details?.avgRtt}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-400">Jitter</p>
//                   <p className="text-gray-200">
//                     {diagnostics.packetLoss.details?.maxRtt && diagnostics.packetLoss.details?.minRtt
//                       ? `${Math.abs(
//                           parseFloat(diagnostics.packetLoss.details.maxRtt) - 
//                           parseFloat(diagnostics.packetLoss.details.minRtt)
//                         )}ms`
//                       : 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-400">
//               {diagnostics.packetLoss.result ? diagnostics.packetLoss.result : 'No data yet.'}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NetworkDiagnostics;








// import React, { useState, useCallback, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Activity, Wifi, Server, Download, Upload,
//   Clock, AlertCircle, CheckCircle, XCircle,
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network, BarChart
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../../api'
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// // Utility Functions
// const validateIp = (ip) => {
//   const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//   return ipRegex.test(ip);
// };

// const validateDomain = (domain) => {
//   const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
//   return domainRegex.test(domain);
// };

// const NetworkDiagnostics = ({ routerId }) => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: 'example.com' },
//     traceroute: { result: null, status: 'idle', target: 'example.com' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { download: null, upload: null, status: 'idle' },
//     clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//     packetLoss: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [historicalData, setHistoricalData] = useState({
//     isp: { minute: [], hour: [], day: [], month: [] },
//     client: { minute: [], hour: [], day: [], month: [] },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');
//   const [expandedTest, setExpandedTest] = useState(null);
//   const [speedTestRunning, setSpeedTestRunning] = useState(false);
//   const [clientIp, setClientIp] = useState('');
//   const [timeFrame, setTimeFrame] = useState('hour');

//   // Fetch Historical Speed Data
//   const fetchHistoricalData = useCallback(async () => {
//     try {
//       const response = await api.get(`/api/speed-test-history/?router=${routerId}&client_ip=${clientIp}`);
//       setHistoricalData(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch historical speed data');
//     }
//   }, [routerId, clientIp]);

//   useEffect(() => {
//     if (clientIp && validateIp(clientIp)) {
//       fetchHistoricalData();
//     }
//   }, [clientIp, fetchHistoricalData]);

//   // Run Diagnostics
//   const runDiagnostics = useCallback(async () => {
//     if (!validateDomain(diagnosticsTarget)) {
//       toast.error('Invalid target domain');
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await api.post('/api/tests/bulk/', {
//         router_id: routerId,
//         target: diagnosticsTarget,
//         client_ip: clientIp,
//       });

//       const updatedDiagnostics = response.data.reduce((acc, test) => {
//         const testType = test.test_type;
//         acc[testType] = {
//           result: test.result,
//           status: test.status,
//           target: test.target || diagnosticsTarget,
//           clientIp: testType === 'speedtest' ? clientIp : undefined,
//           details: testType === 'speedtest' ? test.speed_test : test.health_check,
//         };
//         return acc;
//       }, { ...diagnostics });

//       setDiagnostics(updatedDiagnostics);
//       fetchHistoricalData();
//     } catch (err) {
//       setError(err.message);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [diagnosticsTarget, clientIp, routerId, diagnostics, fetchHistoricalData]);

//   // Run Speed Test
//   const runSpeedTest = useCallback(async (type) => {
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       return;
//     }

//     setSpeedTestRunning(true);
//     setDiagnostics(prev => ({
//       ...prev,
//       bandwidth: { ...prev.bandwidth, status: 'running' },
//       clientBandwidth: { ...prev.clientBandwidth, status: 'running' },
//     }));

//     try {
//       const response = await api.post('/api/tests/', {
//         router_id: routerId,
//         test_type: 'speedtest',
//         target: '',
//         client_ip: clientIp,
//         test_mode: type,
//       });

//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: {
//           download: response.data.result.download,
//           upload: response.data.result.upload,
//           status: 'success',
//           server: response.data.result.server,
//           isp: response.data.result.isp,
//           latency: response.data.result.latency,
//           jitter: response.data.result.jitter,
//         },
//         clientBandwidth: {
//           download: response.data.result.client_download,
//           upload: response.data.result.client_upload,
//           status: 'success',
//           clientIp,
//           device: response.data.result.device || 'Unknown',
//           connectionType: response.data.result.connection_type || 'Unknown',
//         },
//       }));
//       toast.success('Speed test completed');
//       fetchHistoricalData();
//     } catch (err) {
//       setError('Speed test failed');
//       toast.error('Speed test failed');
//     } finally {
//       setSpeedTestRunning(false);
//     }
//   }, [clientIp, routerId, fetchHistoricalData]);

//   const renderStatusIcon = (status) => {
//     const icons = {
//       running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" aria-hidden="true" />,
//       success: <CheckCircle className="text-green-500 inline-block mr-2" aria-hidden="true" />,
//       error: <XCircle className="text-red-500 inline-block mr-2" aria-hidden="true" />,
//       idle: <Clock className="text-gray-500 inline-block mr-2" aria-hidden="true" />
//     };
//     return icons[status];
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       success: 'bg-green-100 text-green-800',
//       error: 'bg-red-100 text-red-800',
//       running: 'bg-yellow-100 text-yellow-800',
//       idle: 'bg-gray-100 text-gray-800'
//     };
//     return colors[status];
//   };

//   const formatSpeed = (speed) => {
//     return speed ? `${speed} Mbps` : 'N/A';
//   };

//   const toggleTestExpansion = useCallback((testName) => {
//     setExpandedTest(prev => prev === testName ? null : testName);
//   }, []);

//   // Historical Data Chart
//   const chartData = {
//     labels: historicalData[timeFrame === 'minute' ? 'minute' : timeFrame === 'hour' ? 'hour' : timeFrame === 'day' ? 'day' : 'month'].map(d => new Date(d.timestamp).toLocaleString()),
//     datasets: [
//       {
//         label: 'ISP Download',
//         data: historicalData.isp[timeFrame].map(d => d.download),
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//       {
//         label: 'ISP Upload',
//         data: historicalData.isp[timeFrame].map(d => d.upload),
//         borderColor: 'rgb(255, 99, 132)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Download',
//         data: historicalData.client[timeFrame].map(d => d.download),
//         borderColor: 'rgb(54, 162, 235)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Upload',
//         data: historicalData.client[timeFrame].map(d => d.upload),
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
//           <div className="relative flex-1">
//             <label htmlFor="target-domain" className="sr-only">Target Domain</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="target-domain"
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter target (e.g., example.com)"
//               value={diagnosticsTarget}
//               onChange={(e) => setDiagnosticsTarget(e.target.value)}
//               aria-label="Target domain for diagnostics"
//             />
//           </div>

//           <div className="relative flex-1">
//             <label htmlFor="client-ip" className="sr-only">Client IP</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="client-ip"
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Client IP (e.g., 192.168.1.100)"
//               value={clientIp}
//               onChange={(e) => setClientIp(e.target.value)}
//               aria-label="Client IP address"
//             />
//           </div>

//           <button
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
//             onClick={runDiagnostics}
//             disabled={loading}
//             aria-label="Run network diagnostics"
//           >
//             {loading ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-5 h-5 mr-2" aria-hidden="true" />
//                 Run Diagnostics
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       {error && (
//         <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
//             <strong>Error:</strong>
//           </div>
//           <p className="mt-1">{error}</p>
//         </div>
//       )}

//       {/* Speed Test Section */}
//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <Gauge className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
//             Bandwidth Speed Test
//           </h2>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => runSpeedTest('full')}
//               disabled={speedTestRunning}
//               className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run full speed test"
//             >
//               {speedTestRunning ? (
//                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
//               ) : (
//                 <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               )}
//               Full Test
//             </button>
//             <button
//               onClick={() => runSpeedTest('quick')}
//               disabled={speedTestRunning}
//               className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run quick speed test"
//             >
//               <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               Quick Test
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* ISP Bandwidth */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.bandwidth.status)}
//               ISP Connection Speed
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {formatSpeed(diagnostics.bandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">
//                   {formatSpeed(diagnostics.bandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.bandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Server: {diagnostics.bandwidth.server}</p>
//                 <p>ISP: {diagnostics.bandwidth.isp}</p>
//                 <p>Latency: {diagnostics.bandwidth.latency}</p>
//                 <p>Jitter: {diagnostics.bandwidth.jitter}</p>
//               </div>
//             )}
//           </div>

//           {/* Client Bandwidth */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.clientBandwidth.status)}
//               Client Speed ({clientIp})
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {formatSpeed(diagnostics.clientBandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">
//                   {formatSpeed(diagnostics.clientBandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                 <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Speed Comparison */}
//         {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3">Bandwidth Comparison</h3>
//             <div className="space-y-2">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Download Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className="bg-green-500 h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.round(
//                         (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                          parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                       )}%` 
//                     }}
//                     role="progressbar"
//                     aria-valuenow={Math.round(
//                       (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                        parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                     )}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {diagnostics.clientBandwidth.download} Mbps of {diagnostics.bandwidth.download} Mbps ({Math.round(
//                     (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                      parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                   )}%)
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Upload Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className="bg-blue-500 h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.round(
//                         (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                          parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                       )}%` 
//                     }}
//                     role="progressbar"
//                     aria-valuenow={Math.round(
//                       (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                        parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                     )}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {diagnostics.clientBandwidth.upload} Mbps of {diagnostics.bandwidth.upload} Mbps ({Math.round(
//                     (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                      parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                   )}%)
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Historical Data Chart */}
//         {historicalData.isp[timeFrame].length > 0 && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
//               <select
//                 value={timeFrame}
//                 onChange={(e) => setTimeFrame(e.target.value)}
//                 className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
//               >
//                 <option value="minute">Last Hour (Minutes)</option>
//                 <option value="hour">Last Day (Hours)</option>
//                 <option value="day">Last Month (Days)</option>
//                 <option value="month">Last Year (Months)</option>
//               </select>
//             </div>
//             <Line data={chartData} options={{
//               responsive: true,
//               plugins: {
//                 legend: { position: 'top' },
//                 title: { display: true, text: 'Speed Test History' },
//               },
//             }} />
//           </div>
//         )}
//       </div>

//       {/* Diagnostic Tests */}
//       <div className="space-y-4">
//         {/* Ping Test */}
//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('ping')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//           aria-expanded={expandedTest === 'ping'}
//           aria-label="Ping Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.ping.status)}
//               Ping Test ({diagnostics.ping.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}>
//               {expandedTest === 'ping' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.ping.result ? `Latency: ${diagnostics.ping.result.avg}ms` : 'No data yet.'}
//           </p>
          
//           {expandedTest === 'ping' && diagnostics.ping.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Measures the round-trip time for messages sent to the target</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.ping.status)}>
//                   {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Target:</p>
//                 <p className="text-gray-900">{diagnostics.ping.target}</p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">{`${diagnostics.ping.result.min}/${diagnostics.ping.result.avg}/${diagnostics.ping.result.max} ms`}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Traceroute Test */}
//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('traceroute')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//           aria-expanded={expandedTest === 'traceroute'}
//           aria-label="Traceroute Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.traceroute.status)}
//               Traceroute ({diagnostics.traceroute.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}>
//               {expandedTest === 'traceroute' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'traceroute' && diagnostics.traceroute.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
//                 <div>Hop</div>
//                 <div>IP Address</div>
//                 <div>Time</div>
//               </div>
//               {diagnostics.traceroute.result.hops.map((hop, index) => (
//                 <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
//                   <div>{hop.hop}</div>
//                   <div className="font-mono">{hop.ip || '*'}</div>
//                   <div>{hop.time}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.traceroute.result ? 'View route path' : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         {/* Health Check */}
//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('health')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//           aria-expanded={expandedTest === 'health'}
//           aria-label="Router Health Check Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.healthCheck.status)}
//               Router Health Check
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}>
//               {expandedTest === 'health' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'health' && diagnostics.healthCheck.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <p className="text-gray-900 mb-2">{diagnostics.healthCheck.result.message || 'Health check completed'}</p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {diagnostics.healthCheck.details?.services?.map((service, index) => (
//                   <div key={index} className="flex items-center">
//                     {service.status === 'running' ? (
//                       <CheckCircle className="w-4 h-4 text-green-500 mr-2" aria-hidden="true" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
//                     )}
//                     <span className="text-gray-700">{service.name}</span>
//                     <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
//                       {service.status}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
//                 <div>
//                   <p className="text-gray-500">CPU Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.details?.cpu_usage}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Memory Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.details?.memory_usage}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Disk Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.details?.disk_usage}%</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.healthCheck.result ? diagnostics.healthCheck.result.message : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         {/* DNS Test */}
//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('dns')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//           aria-expanded={expandedTest === 'dns'}
//           aria-label="DNS Resolution Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.dns.status)}
//               DNS Resolution ({diagnostics.dns.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}>
//               {expandedTest === 'dns' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'dns' && diagnostics.dns.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Hostname</p>
//                   <p className="text-gray-900">{diagnostics.dns.result.hostname}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Resolved IPs</p>
//                   <p className="text-gray-900 font-mono">{diagnostics.dns.result.addresses.join(', ')}</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.dns.result ? 'DNS resolution successful' : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         {/* Packet Loss Test */}
//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packet' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('packet')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packet')}
//           aria-expanded={expandedTest === 'packet'}
//           aria-label="Packet Loss Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.packetLoss.status)}
//               Packet Loss Test ({diagnostics.packetLoss.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'packet' ? 'Collapse packet loss test' : 'Expand packet loss test'}>
//               {expandedTest === 'packet' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'packet' && diagnostics.packetLoss.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Packet Loss</p>
//                   <p className="text-gray-900 text-xl font-bold">{diagnostics.packetLoss.result.packet_loss}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Average RTT</p>
//                   <p className="text-gray-900">{diagnostics.packetLoss.result.rtt.avg}ms</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.packetLoss.result ? `${diagnostics.packetLoss.result.packet_loss}% packet loss` : 'No data yet.'}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NetworkDiagnostics;










// import React, { useState, useCallback, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Activity, Wifi, Server, Download, Upload,
//   Clock, AlertCircle, CheckCircle, XCircle,
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network, BarChart
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../../api'
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const validateIp = (ip) => {
//   const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//   return ipRegex.test(ip);
// };

// const validateDomain = (domain) => {
//   const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
//   return domainRegex.test(domain);
// };

// const NetworkDiagnostics = ({ routerId }) => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: 'example.com' },
//     traceroute: { result: null, status: 'idle', target: 'example.com' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { download: null, upload: null, status: 'idle' },
//     clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//     packetLoss: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [historicalData, setHistoricalData] = useState({
//     isp: { minute: [], hour: [], day: [], month: [] },
//     client: { minute: [], hour: [], day: [], month: [] },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');
//   const [expandedTest, setExpandedTest] = useState(null);
//   const [speedTestRunning, setSpeedTestRunning] = useState(false);
//   const [clientIp, setClientIp] = useState('');
//   const [timeFrame, setTimeFrame] = useState('hour');

//   const fetchHistoricalData = useCallback(async () => {
//     try {
//       const response = await api.get(`/api/network_management/speed-test-history/?router=${routerId}&client_ip=${clientIp}`);
//       setHistoricalData(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch historical speed data');
//     }
//   }, [routerId, clientIp]);

//   useEffect(() => {
//     if (clientIp && validateIp(clientIp)) {
//       fetchHistoricalData();
//     }
//   }, [clientIp, fetchHistoricalData]);

//   const runDiagnostics = useCallback(async () => {
//     if (!validateDomain(diagnosticsTarget)) {
//       toast.error('Invalid target domain');
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await api.post('/api/network_management/tests/bulk/', {
//         router_id: routerId,
//         target: diagnosticsTarget,
//         client_ip: clientIp,
//       });

//       const updatedDiagnostics = response.data.reduce((acc, test) => {
//         const testType = test.test_type;
//         acc[testType] = {
//           result: test.result,
//           status: test.status,
//           target: test.target || diagnosticsTarget,
//           clientIp: testType === 'speedtest' ? clientIp : undefined,
//           details: testType === 'speedtest' ? test.speed_test : test.health_check,
//         };
//         return acc;
//       }, { ...diagnostics });

//       setDiagnostics(updatedDiagnostics);
//       fetchHistoricalData();
//     } catch (err) {
//       setError(err.message);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [diagnosticsTarget, clientIp, routerId, diagnostics, fetchHistoricalData]);

//   const runSpeedTest = useCallback(async (type) => {
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       return;
//     }

//     setSpeedTestRunning(true);
//     setDiagnostics(prev => ({
//       ...prev,
//       bandwidth: { ...prev.bandwidth, status: 'running' },
//       clientBandwidth: { ...prev.clientBandwidth, status: 'running' },
//     }));

//     try {
//       const response = await api.post('/api/network_management/tests/', {
//         router_id: routerId,
//         test_type: 'speedtest',
//         target: '',
//         client_ip: clientIp,
//         test_mode: type,
//       });

//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: {
//           download: response.data.result.download,
//           upload: response.data.result.upload,
//           status: 'success',
//           server: response.data.result.server,
//           isp: response.data.result.isp,
//           latency: response.data.result.latency,
//           jitter: response.data.result.jitter,
//         },
//         clientBandwidth: {
//           download: response.data.result.client_download,
//           upload: response.data.result.client_upload,
//           status: 'success',
//           clientIp,
//           device: response.data.result.device || 'Unknown',
//           connectionType: response.data.result.connection_type || 'Unknown',
//         },
//       }));
//       toast.success('Speed test completed');
//       fetchHistoricalData();
//     } catch (err) {
//       setError('Speed test failed');
//       toast.error('Speed test failed');
//     } finally {
//       setSpeedTestRunning(false);
//     }
//   }, [clientIp, routerId, fetchHistoricalData]);

//   const renderStatusIcon = (status) => {
//     const icons = {
//       running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" aria-hidden="true" />,
//       success: <CheckCircle className="text-green-500 inline-block mr-2" aria-hidden="true" />,
//       error: <XCircle className="text-red-500 inline-block mr-2" aria-hidden="true" />,
//       idle: <Clock className="text-gray-500 inline-block mr-2" aria-hidden="true" />
//     };
//     return icons[status];
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       success: 'bg-green-100 text-green-800',
//       error: 'bg-red-100 text-red-800',
//       running: 'bg-yellow-100 text-yellow-800',
//       idle: 'bg-gray-100 text-gray-800'
//     };
//     return colors[status];
//   };

//   const formatSpeed = (speed) => {
//     return speed ? `${speed} Mbps` : 'N/A';
//   };

//   const toggleTestExpansion = useCallback((testName) => {
//     setExpandedTest(prev => prev === testName ? null : testName);
//   }, []);

//   const chartData = {
//     labels: historicalData[timeFrame === 'minute' ? 'minute' : timeFrame === 'hour' ? 'hour' : timeFrame === 'day' ? 'day' : 'month'].map(d => new Date(d.timestamp).toLocaleString()),
//     datasets: [
//       {
//         label: 'ISP Download',
//         data: historicalData.isp[timeFrame].map(d => d.download),
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//       {
//         label: 'ISP Upload',
//         data: historicalData.isp[timeFrame].map(d => d.upload),
//         borderColor: 'rgb(255, 99, 132)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Download',
//         data: historicalData.client[timeFrame].map(d => d.download),
//         borderColor: 'rgb(54, 162, 235)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Upload',
//         data: historicalData.client[timeFrame].map(d => d.upload),
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
//           <div className="relative flex-1">
//             <label htmlFor="target-domain" className="sr-only">Target Domain</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="target-domain"
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter target (e.g., example.com)"
//               value={diagnosticsTarget}
//               onChange={(e) => setDiagnosticsTarget(e.target.value)}
//               aria-label="Target domain for diagnostics"
//             />
//           </div>

//           <div className="relative flex-1">
//             <label htmlFor="client-ip" className="sr-only">Client IP</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="client-ip"
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Client IP (e.g., 192.168.1.100)"
//               value={clientIp}
//               onChange={(e) => setClientIp(e.target.value)}
//               aria-label="Client IP address"
//             />
//           </div>

//           <button
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
//             onClick={runDiagnostics}
//             disabled={loading}
//             aria-label="Run network diagnostics"
//           >
//             {loading ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-5 h-5 mr-2" aria-hidden="true" />
//                 Run Diagnostics
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       {error && (
//         <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
//             <strong>Error:</strong>
//           </div>
//           <p className="mt-1">{error}</p>
//         </div>
//       )}

//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <Gauge className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
//             Bandwidth Speed Test
//           </h2>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => runSpeedTest('full')}
//               disabled={speedTestRunning}
//               className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run full speed test"
//             >
//               {speedTestRunning ? (
//                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
//               ) : (
//                 <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               )}
//               Full Test
//             </button>
//             <button
//               onClick={() => runSpeedTest('quick')}
//               disabled={speedTestRunning}
//               className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run quick speed test"
//             >
//               <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               Quick Test
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.bandwidth.status)}
//               ISP Connection Speed
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {formatSpeed(diagnostics.bandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">
//                   {formatSpeed(diagnostics.bandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.bandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Server: {diagnostics.bandwidth.server}</p>
//                 <p>ISP: {diagnostics.bandwidth.isp}</p>
//                 <p>Latency: {diagnostics.bandwidth.latency}</p>
//                 <p>Jitter: {diagnostics.bandwidth.jitter}</p>
//               </div>
//             )}
//           </div>

//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.clientBandwidth.status)}
//               Client Speed ({clientIp})
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {formatSpeed(diagnostics.clientBandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">
//                   {formatSpeed(diagnostics.clientBandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                 <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3">Bandwidth Comparison</h3>
//             <div className="space-y-2">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Download Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className="bg-green-500 h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.round(
//                         (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                          parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                       )}%` 
//                     }}
//                     role="progressbar"
//                     aria-valuenow={Math.round(
//                       (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                        parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                     )}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {diagnostics.clientBandwidth.download} Mbps of {diagnostics.bandwidth.download} Mbps ({Math.round(
//                     (parseFloat(diagnostics.clientBandwidth.download || '0') / 
//                      parseFloat(diagnostics.bandwidth.download || '1')) * 100
//                   )}%)
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Upload Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div 
//                     className="bg-blue-500 h-2.5 rounded-full" 
//                     style={{ 
//                       width: `${Math.round(
//                         (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                          parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                       )}%` 
//                     }}
//                     role="progressbar"
//                     aria-valuenow={Math.round(
//                       (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                        parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                     )}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {diagnostics.clientBandwidth.upload} Mbps of {diagnostics.bandwidth.upload} Mbps ({Math.round(
//                     (parseFloat(diagnostics.clientBandwidth.upload || '0') / 
//                      parseFloat(diagnostics.bandwidth.upload || '1')) * 100
//                   )}%)
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {historicalData.isp[timeFrame].length > 0 && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
//               <select
//                 value={timeFrame}
//                 onChange={(e) => setTimeFrame(e.target.value)}
//                 className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
//               >
//                 <option value="minute">Last Hour (Minutes)</option>
//                 <option value="hour">Last Day (Hours)</option>
//                 <option value="day">Last Month (Days)</option>
//                 <option value="month">Last Year (Months)</option>
//               </select>
//             </div>
//             <Line data={chartData} options={{
//               responsive: true,
//               plugins: {
//                 legend: { position: 'top' },
//                 title: { display: true, text: 'Speed Test History' },
//               },
//             }} />
//           </div>
//         )}
//       </div>

//       <div className="space-y-4">
//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('ping')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//           aria-expanded={expandedTest === 'ping'}
//           aria-label="Ping Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.ping.status)}
//               Ping Test ({diagnostics.ping.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}>
//               {expandedTest === 'ping' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.ping.result ? `Latency: ${diagnostics.ping.result.avg}ms` : 'No data yet.'}
//           </p>
          
//           {expandedTest === 'ping' && diagnostics.ping.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Measures the round-trip time for messages sent to the target</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.ping.status)}>
//                   {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Target:</p>
//                 <p className="text-gray-900">{diagnostics.ping.target}</p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">{`${diagnostics.ping.result.min}/${diagnostics.ping.result.avg}/${diagnostics.ping.result.max} ms`}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('traceroute')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//           aria-expanded={expandedTest === 'traceroute'}
//           aria-label="Traceroute Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.traceroute.status)}
//               Traceroute ({diagnostics.traceroute.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}>
//               {expandedTest === 'traceroute' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'traceroute' && diagnostics.traceroute.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
//                 <div>Hop</div>
//                 <div>IP Address</div>
//                 <div>Time</div>
//               </div>
//               {diagnostics.traceroute.result.hops.map((hop, index) => (
//                 <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
//                   <div>{hop.hop}</div>
//                   <div className="font-mono">{hop.ip || '*'}</div>
//                   <div>{hop.time}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.traceroute.result ? 'View route path' : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('health')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//           aria-expanded={expandedTest === 'health'}
//           aria-label="Router Health Check Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.healthCheck.status)}
//               Router Health Check
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}>
//               {expandedTest === 'health' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'health' && diagnostics.healthCheck.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <p className="text-gray-900 mb-2">{diagnostics.healthCheck.result.message || 'Health check completed'}</p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {diagnostics.healthCheck.details?.services?.map((service, index) => (
//                   <div key={index} className="flex items-center">
//                     {service.status === 'running' ? (
//                       <CheckCircle className="w-4 h-4 text-green-500 mr-2" aria-hidden="true" />
//                     ) : (
//                       <XCircle className="w-4 h-4 text-red-500 mr-2" aria-hidden="true" />
//                     )}
//                     <span className="text-gray-700">{service.name}</span>
//                     <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
//                       {service.status}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
//                 <div>
//                   <p className="text-gray-500">CPU Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.details?.cpu_usage}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Memory Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.details?.memory_usage}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Disk Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.details?.disk_usage}%</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.healthCheck.result ? diagnostics.healthCheck.result.message : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('dns')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//           aria-expanded={expandedTest === 'dns'}
//           aria-label="DNS Resolution Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.dns.status)}
//               DNS Resolution ({diagnostics.dns.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}>
//               {expandedTest === 'dns' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'dns' && diagnostics.dns.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Hostname</p>
//                   <p className="text-gray-900">{diagnostics.dns.result.hostname}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Resolved IPs</p>
//                   <p className="text-gray-900 font-mono">{diagnostics.dns.result.addresses.join(', ')}</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.dns.result ? 'DNS resolution successful' : 'No data yet.'}
//             </p>
//           )}
//         </div>

//         <div 
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packet' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('packet')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packet')}
//           aria-expanded={expandedTest === 'packet'}
//           aria-label="Packet Loss Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.packetLoss.status)}
//               Packet Loss Test ({diagnostics.packetLoss.target})
//             </h3>
//             <button className="text-gray-500 hover:text-gray-400" aria-label={expandedTest === 'packet' ? 'Collapse packet loss test' : 'Expand packet loss test'}>
//               {expandedTest === 'packet' ? <ChevronUp className="w-5 h-5" aria-hidden="true" /> : <ChevronDown className="w-5 h-5" aria-hidden="true" />}
//             </button>
//           </div>
          
//           {expandedTest === 'packet' && diagnostics.packetLoss.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Packet Loss</p>
//                   <p className="text-gray-900 text-xl font-bold">{diagnostics.packetLoss.result.packet_loss}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Average RTT</p>
//                   <p className="text-gray-900">{diagnostics.packetLoss.result.rtt.avg}ms</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">
//               {diagnostics.packetLoss.result ? `${diagnostics.packetLoss.result.packet_loss}% packet loss` : 'No data yet.'}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NetworkDiagnostics;





// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Activity, Wifi, Download, Upload, Clock, 
//   AlertCircle, CheckCircle, XCircle, RefreshCw, Gauge
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../../api';
// import { Line } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const NetworkDiagnostics = ({ routerId }) => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: '' },
//     traceroute: { result: null, status: 'idle', target: '' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { download: 0, upload: 0, status: 'idle' },
//     clientBandwidth: { download: 0, upload: 0, status: 'idle', clientIp: '' },
//   });
  
//   const [historicalData, setHistoricalData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('');
//   const [clientIp, setClientIp] = useState('');
//   const [timeFrame, setTimeFrame] = useState('hour');

//   const validateRouterId = (id) => {
//     if (id === null || id === 'undefined') return false;
//     return !isNaN(Number(id));
//   };

//   const validateIp = (ip) => {
//     const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
//     return ipRegex.test(ip);
//   };

//   const validateDomain = (domain) => {
//     const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
//     return domainRegex.test(domain);
//   };

//   const fetchHistoricalData = useCallback(async () => {
//     try {
//       if (!validateRouterId(routerId)) {
//         toast.error('Please select a valid router');
//         return;
//       }

//       if (!clientIp || !validateIp(clientIp)) {
//         toast.error('Please enter a valid client IP');
//         return;
//       }

//       const response = await api.get(
//         `/api/network_management/speed-test-history/?router=${routerId}&client_ip=${clientIp}&time_frame=${timeFrame}`
//       );
      
//       setHistoricalData(response.data.data || []);
//     } catch (error) {
//       console.error('Failed to fetch historical data:', error);
//       toast.error(error.response?.data?.error || 'Failed to fetch historical data');
//     }
//   }, [routerId, clientIp, timeFrame]);

//   const runDiagnostics = useCallback(async () => {
//     try {
//       if (!validateRouterId(routerId)) {
//         toast.error('Please select a valid router');
//         return;
//       }

//       if (!validateDomain(diagnosticsTarget)) {
//         toast.error('Please enter a valid target domain');
//         return;
//       }

//       if (!validateIp(clientIp)) {
//         toast.error('Please enter a valid client IP');
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       const response = await api.post('/api/network_management/tests/bulk/', {
//         router_id: routerId,
//         target: diagnosticsTarget,
//         client_ip: clientIp,
//       });

//       setDiagnostics(prev => ({
//         ...prev,
//         ...response.data.reduce((acc, test) => {
//           acc[test.test_type] = {
//             result: test.result,
//             status: test.status,
//             target: test.target || diagnosticsTarget,
//             clientIp: test.test_type === 'speedtest' ? clientIp : undefined,
//           };
//           return acc;
//         }, {})
//       }));

//       fetchHistoricalData();
//     } catch (error) {
//       console.error('Diagnostics error:', error);
//       setError(error.response?.data?.error || 'Diagnostics failed');
//       toast.error(error.response?.data?.error || 'Diagnostics failed');
//     } finally {
//       setLoading(false);
//     }
//   }, [routerId, diagnosticsTarget, clientIp, fetchHistoricalData]);

//   const runSpeedTest = useCallback(async (type) => {
//     try {
//       if (!validateRouterId(routerId)) {
//         toast.error('Please select a valid router');
//         return;
//       }

//       if (!validateIp(clientIp)) {
//         toast.error('Please enter a valid client IP');
//         return;
//       }

//       setLoading(true);
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: { ...prev.bandwidth, status: 'running' },
//         clientBandwidth: { ...prev.clientBandwidth, status: 'running' },
//       }));

//       const response = await api.post('/api/network_management/tests/', {
//         router_id: routerId,
//         test_type: 'speedtest',
//         target: '',
//         client_ip: clientIp,
//         test_mode: type,
//       });

//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: {
//           download: response.data.result.download,
//           upload: response.data.result.upload,
//           status: 'success',
//           server: response.data.result.server,
//           isp: response.data.result.isp,
//           latency: response.data.result.latency,
//           jitter: response.data.result.jitter,
//         },
//         clientBandwidth: {
//           download: response.data.result.client_download,
//           upload: response.data.result.client_upload,
//           status: 'success',
//           clientIp,
//           device: response.data.result.device || 'Unknown',
//           connectionType: response.data.result.connection_type || 'Unknown',
//         },
//       }));
      
//       toast.success('Speed test completed');
//       fetchHistoricalData();
//     } catch (error) {
//       console.error('Speed test error:', error);
//       toast.error(error.response?.data?.error || 'Speed test failed');
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: { ...prev.bandwidth, status: 'error' },
//         clientBandwidth: { ...prev.clientBandwidth, status: 'error' },
//       }));
//     } finally {
//       setLoading(false);
//     }
//   }, [routerId, clientIp, fetchHistoricalData]);

//   const renderStatusIcon = (status) => {
//     const icons = {
//       running: <RefreshCw className="text-yellow-500 inline-block mr-2 animate-spin" />,
//       success: <CheckCircle className="text-green-500 inline-block mr-2" />,
//       error: <XCircle className="text-red-500 inline-block mr-2" />,
//       idle: <Clock className="text-gray-500 inline-block mr-2" />
//     };
//     return icons[status];
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       success: 'bg-green-100 text-green-800',
//       error: 'bg-red-100 text-red-800',
//       running: 'bg-yellow-100 text-yellow-800',
//       idle: 'bg-gray-100 text-gray-800'
//     };
//     return colors[status];
//   };

//   const formatSpeed = (speed) => {
//     return speed ? `${speed.toFixed(2)} Mbps` : 'N/A';
//   };

//   const chartData = {
//     labels: historicalData.map(d => new Date(d.timestamp).toLocaleTimeString()),
//     datasets: [
//       {
//         label: 'ISP Download',
//         data: historicalData.map(d => d.download),
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//       {
//         label: 'ISP Upload',
//         data: historicalData.map(d => d.upload),
//         borderColor: 'rgb(255, 99, 132)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Download',
//         data: historicalData.map(d => d.client_download),
//         borderColor: 'rgb(54, 162, 235)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Upload',
//         data: historicalData.map(d => d.client_upload),
//         borderColor: 'rgb(255, 206, 86)',
//         tension: 0.1,
//       },
//     ],
//   };

//   return (
//     <div className="p-6 bg-white text-gray-900 rounded-lg">
//       <ToastContainer position="top-right" autoClose={3000} theme="light" />

//       <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-gray-50 p-4 rounded-lg shadow">
//         <div className="flex items-center space-x-4 mb-4 md:mb-0">
//           <Activity className="w-8 h-8 text-indigo-600" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-600">Network Diagnostics</h1>
//             <p className="text-sm text-gray-500">Comprehensive network analysis and speed testing</p>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Network className="h-5 w-5 text-gray-500" />
//             </div>
//             <input
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Enter target (e.g., example.com)"
//               value={diagnosticsTarget}
//               onChange={(e) => setDiagnosticsTarget(e.target.value)}
//             />
//           </div>

//           <div className="relative flex-1">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Wifi className="h-5 w-5 text-gray-500" />
//             </div>
//             <input
//               type="text"
//               className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="Client IP (e.g., 192.168.1.100)"
//               value={clientIp}
//               onChange={(e) => setClientIp(e.target.value)}
//             />
//           </div>

//           <button
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
//             onClick={runDiagnostics}
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-5 h-5 mr-2" />
//                 Run Diagnostics
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       {error && (
//         <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 mr-2" />
//             <strong>Error:</strong>
//           </div>
//           <p className="mt-1">{error}</p>
//         </div>
//       )}

//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <Gauge className="w-5 h-5 mr-2 text-indigo-600" />
//             Bandwidth Speed Test
//           </h2>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => runSpeedTest('full')}
//               disabled={loading}
//               className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//             >
//               {loading ? (
//                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
//               ) : (
//                 <Activity className="w-4 h-4 mr-1" />
//               )}
//               Full Test
//             </button>
//             <button
//               onClick={() => runSpeedTest('quick')}
//               disabled={loading}
//               className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
//             >
//               <Activity className="w-4 h-4 mr-1" />
//               Quick Test
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.bandwidth.status)}
//               ISP Connection Speed
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {formatSpeed(diagnostics.bandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">
//                   {formatSpeed(diagnostics.bandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.bandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Server: {diagnostics.bandwidth.server}</p>
//                 <p>ISP: {diagnostics.bandwidth.isp}</p>
//                 <p>Latency: {diagnostics.bandwidth.latency}ms</p>
//                 <p>Jitter: {diagnostics.bandwidth.jitter}ms</p>
//               </div>
//             )}
//           </div>

//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.clientBandwidth.status)}
//               Client Speed ({clientIp})
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">
//                   {formatSpeed(diagnostics.clientBandwidth.download)}
//                 </p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">
//                   {formatSpeed(diagnostics.clientBandwidth.upload)}
//                 </p>
//               </div>
//             </div>
//             {diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Device: {diagnostics.clientBandwidth.device}</p>
//                 <p>Connection: {diagnostics.clientBandwidth.connectionType}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {historicalData.length > 0 && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
//               <select
//                 value={timeFrame}
//                 onChange={(e) => setTimeFrame(e.target.value)}
//                 className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
//               >
//                 <option value="minute">Last Hour (Minutes)</option>
//                 <option value="hour">Last Day (Hours)</option>
//                 <option value="day">Last Month (Days)</option>
//                 <option value="month">Last Year (Months)</option>
//               </select>
//             </div>
//             <Line data={chartData} options={{
//               responsive: true,
//               plugins: {
//                 legend: { position: 'top' },
//                 title: { 
//                   display: true, 
//                   text: 'Speed Test History',
//                   font: { size: 16 }
//                 },
//               },
//               scales: {
//                 y: {
//                   title: {
//                     display: true,
//                     text: 'Speed (Mbps)'
//                   }
//                 },
//                 x: {
//                   title: {
//                     display: true,
//                     text: 'Time'
//                   }
//                 }
//               }
//             }} />
//           </div>
//         )}
//       </div>

//       <div className="space-y-4">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.ping.status)}
//             Ping Test ({diagnostics.ping.target || 'Not run'})
//           </h3>
//           {diagnostics.ping.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <div className="grid grid-cols-2 gap-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.ping.status)}>
//                   {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">
//                   {diagnostics.ping.result.min}/{diagnostics.ping.result.avg}/{diagnostics.ping.result.max} ms
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">No ping data available</p>
//           )}
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.traceroute.status)}
//             Traceroute ({diagnostics.traceroute.target || 'Not run'})
//           </h3>
//           {diagnostics.traceroute.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
//                 <div>Hop</div>
//                 <div>IP Address</div>
//                 <div>Time</div>
//               </div>
//               {diagnostics.traceroute.result.hops.map((hop, index) => (
//                 <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
//                   <div>{hop.hop}</div>
//                   <div className="font-mono">{hop.ip || '*'}</div>
//                   <div>{hop.time}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">No traceroute data available</p>
//           )}
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="font-semibold text-gray-700 flex items-center">
//             {renderStatusIcon(diagnostics.healthCheck.status)}
//             Router Health Check
//           </h3>
//           {diagnostics.healthCheck.result ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <p className="text-gray-900 mb-2">{diagnostics.healthCheck.result.message}</p>
//               <div className="grid grid-cols-3 gap-2 text-sm">
//                 <div>
//                   <p className="text-gray-500">CPU Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.result.health_check?.cpu_usage}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Memory Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.result.health_check?.memory_usage}%</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Disk Usage</p>
//                   <p className="text-gray-900">{diagnostics.healthCheck.result.health_check?.disk_usage}%</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">No health check data available</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NetworkDiagnostics;










// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Activity, Wifi, Server, Download, Upload,
//   Clock, AlertCircle, CheckCircle, XCircle,
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../../api';
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

// const NetworkDiagnostics = ({ routerId }) => {
//   const [diagnostics, setDiagnostics] = useState({
//     ping: { result: null, status: 'idle', target: 'example.com' },
//     traceroute: { result: null, status: 'idle', target: 'example.com' },
//     healthCheck: { result: null, status: 'idle' },
//     bandwidth: { download: null, upload: null, status: 'idle' },
//     clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//     packetLoss: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [historicalData, setHistoricalData] = useState({
//     isp: { minute: [], hour: [], day: [], month: [] },
//     client: { minute: [], hour: [], day: [], month: [] },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [diagnosticsTarget, setDiagnosticsTarget] = useState('example.com');
//   const [expandedTest, setExpandedTest] = useState(null);
//   const [speedTestRunning, setSpeedTestRunning] = useState(false);
//   const [clientIp, setClientIp] = useState('');
//   const [timeFrame, setTimeFrame] = useState('hour');
//   const [isClientIpValid, setIsClientIpValid] = useState(true);
//   const [isTargetValid, setIsTargetValid] = useState(true);

//   const fetchHistoricalData = useCallback(async () => {
//     if (!routerId || isNaN(parseInt(routerId))) {
//       setError('Invalid or missing router ID');
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       return;
//     }

//     try {
//       setError(null);
//       const response = await api.get(`/api/network_management/speed-test-history/?router=${routerId}&client_ip=${clientIp}`);
//       if (!response.data || typeof response.data !== 'object') {
//         throw new Error('Invalid historical data response');
//       }
//       setHistoricalData(response.data);
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to fetch historical speed data';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     }
//   }, [routerId, clientIp]);

//   useEffect(() => {
//     if (clientIp && validateIp(clientIp) && routerId && !isNaN(parseInt(routerId))) {
//       fetchHistoricalData();
//     }
//   }, [clientIp, routerId, fetchHistoricalData]);

//   const runDiagnostics = useCallback(async () => {
//     if (!routerId || isNaN(parseInt(routerId))) {
//       toast.error('Invalid router ID');
//       setError('Invalid or missing router ID');
//       return;
//     }
//     if (!validateDomain(diagnosticsTarget)) {
//       toast.error('Invalid target domain');
//       setIsTargetValid(false);
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       setIsClientIpValid(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setIsTargetValid(true);
//     setIsClientIpValid(true);

//     try {
//       const response = await api.post('/api/network_management/tests/bulk/', {
//         router_id: parseInt(routerId),
//         target: diagnosticsTarget,
//         client_ip: clientIp,
//       });

//       const updatedDiagnostics = response.data.reduce((acc, test) => {
//         const testType = test.test_type === 'health_check' ? 'healthCheck' : test.test_type;
//         if (!['ping', 'traceroute', 'healthCheck', 'speedtest', 'dns', 'packetLoss'].includes(testType)) {
//           return acc; // Skip unknown test types
//         }
//         acc[testType] = {
//           result: test.result || null,
//           status: test.status || 'error',
//           target: test.target || diagnosticsTarget,
//           clientIp: testType === 'speedtest' ? clientIp : undefined,
//           details: testType === 'speedtest' ? test.result?.speed_test : test.result?.[testType === 'healthCheck' ? 'health_check' : testType],
//         };
//         return acc;
//       }, { ...diagnostics });

//       setDiagnostics(updatedDiagnostics);
//       fetchHistoricalData();
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to run diagnostics';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [diagnosticsTarget, clientIp, routerId, diagnostics, fetchHistoricalData]);

//   const runSpeedTest = useCallback(async (type) => {
//     if (!routerId || isNaN(parseInt(routerId))) {
//       toast.error('Invalid router ID');
//       setError('Invalid or missing router ID');
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       setIsClientIpValid(false);
//       return;
//     }

//     setSpeedTestRunning(true);
//     setError(null);
//     setIsClientIpValid(true);
//     setDiagnostics(prev => ({
//       ...prev,
//       bandwidth: { ...prev.bandwidth, status: 'running' },
//       clientBandwidth: { ...prev.clientBandwidth, status: 'running' },
//     }));

//     try {
//       const response = await api.post('/api/network_management/tests/', {
//         router_id: parseInt(routerId),
//         test_type: 'speedtest',
//         target: '',
//         client_ip: clientIp,
//         test_mode: type,
//       });

//       if (!response.data?.result?.speed_test) {
//         throw new Error('Invalid speed test response');
//       }

//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: {
//           download: response.data.result.speed_test.download ?? null,
//           upload: response.data.result.speed_test.upload ?? null,
//           status: 'success',
//           server: response.data.result.speed_test.server || 'Unknown',
//           isp: response.data.result.speed_test.isp || 'Unknown',
//           latency: response.data.result.speed_test.latency ?? null,
//           jitter: response.data.result.speed_test.jitter ?? null,
//         },
//         clientBandwidth: {
//           download: response.data.result.speed_test.client_download ?? null,
//           upload: response.data.result.speed_test.client_upload ?? null,
//           status: 'success',
//           clientIp,
//           device: response.data.result.speed_test.device || 'Unknown',
//           connectionType: response.data.result.speed_test.connection_type || 'Unknown',
//         },
//       }));
//       toast.success('Speed test completed');
//       fetchHistoricalData();
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Speed test failed';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: { ...prev.bandwidth, status: 'error' },
//         clientBandwidth: { ...prev.clientBandwidth, status: 'error' },
//       }));
//     } finally {
//       setSpeedTestRunning(false);
//     }
//   }, [clientIp, routerId, fetchHistoricalData]);

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
//     return speed != null ? `${speed} Mbps` : 'N/A';
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
//         ? historicalData[timeFrame].map(d => new Date(d.timestamp).toLocaleString())
//         : [],
//     datasets: [
//       {
//         label: 'ISP Download',
//         data: historicalData.isp[timeFrame]?.map(d => d.download) || [],
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//       {
//         label: 'ISP Upload',
//         data: historicalData.isp[timeFrame]?.map(d => d.upload) || [],
//         borderColor: 'rgb(255, 99, 132)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Download',
//         data: historicalData.client[timeFrame]?.map(d => d.download) || [],
//         borderColor: 'rgb(54, 162, 235)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Upload',
//         data: historicalData.client[timeFrame]?.map(d => d.upload) || [],
//         borderColor: 'rgb(255, 206, 86)',
//         tension: 0.1,
//       },
//     ],
//   };

//   if (error && !loading) {
//     return (
//       <div className="p-6 bg-white text-gray-900 rounded-lg">
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 mr-2" />
//             <strong>Error:</strong>
//           </div>
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

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
//           <div className="relative flex-1">
//             <label htmlFor="target-domain" className="sr-only">Target Domain</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="target-domain"
//               type="text"
//               className={`pl-10 pr-4 py-2 w-full bg-white border ${isTargetValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//               placeholder="Enter target (e.g., example.com)"
//               value={diagnosticsTarget}
//               onChange={(e) => {
//                 setDiagnosticsTarget(e.target.value);
//                 setIsTargetValid(validateDomain(e.target.value));
//               }}
//               aria-label="Target domain for diagnostics"
//               aria-invalid={!isTargetValid}
//             />
//           </div>

//           <div className="relative flex-1">
//             <label htmlFor="client-ip" className="sr-only">Client IP</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="client-ip"
//               type="text"
//               className={`pl-10 pr-4 py-2 w-full bg-white border ${isClientIpValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//               placeholder="Client IP (e.g., 192.168.1.100)"
//               value={clientIp}
//               onChange={(e) => {
//                 setClientIp(e.target.value);
//                 setIsClientIpValid(validateIp(e.target.value));
//               }}
//               aria-label="Client IP address"
//               aria-invalid={!isClientIpValid}
//             />
//           </div>

//           <button
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
//             onClick={runDiagnostics}
//             disabled={loading || !routerId || isNaN(parseInt(routerId)) || !isClientIpValid || !isTargetValid}
//             aria-label="Run network diagnostics"
//           >
//             {loading ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-5 h-5 mr-2" aria-hidden="true" />
//                 Run Diagnostics
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <Gauge className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
//             Bandwidth Speed Test
//           </h2>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => runSpeedTest('full')}
//               disabled={speedTestRunning || !routerId || isNaN(parseInt(routerId)) || !isClientIpValid}
//               className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run full speed test"
//             >
//               {speedTestRunning ? (
//                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
//               ) : (
//                 <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               )}
//               Full Test
//             </button>
//             <button
//               onClick={() => runSpeedTest('quick')}
//               disabled={speedTestRunning || !routerId || isNaN(parseInt(routerId)) || !isClientIpValid}
//               className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run quick speed test"
//             >
//               <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               Quick Test
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.bandwidth.status)}
//               ISP Connection Speed
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.bandwidth.download)}</p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.bandwidth.upload)}</p>
//               </div>
//             </div>
//             {diagnostics.bandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
//                 <p>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
//                 <p>Latency: {diagnostics.bandwidth.latency ?? 'N/A'}</p>
//                 <p>Jitter: {diagnostics.bandwidth.jitter ?? 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.clientBandwidth.status)}
//               Client Speed ({clientIp || 'N/A'})
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
//               </div>
//             </div>
//             {diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                 <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3">Bandwidth Comparison</h3>
//             <div className="space-y-2">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Download Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-green-500 h-2.5 rounded-full"
//                     style={{
//                       width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
//                     }}
//                     role="progressbar"
//                     aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
//                   {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Upload Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-blue-500 h-2.5 rounded-full"
//                     style={{
//                       width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
//                     }}
//                     role="progressbar"
//                     aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
//                   {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {historicalData.isp[timeFrame]?.length > 0 && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
//               <div>
//                 <label htmlFor="timeframe-select" className="sr-only">
//                   Select Time Frame
//                 </label>
//                 <select
//                   id="timeframe-select"
//                   value={timeFrame}
//                   onChange={(e) => setTimeFrame(e.target.value)}
//                   className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
//                   aria-label="Select time frame for historical data"
//                 >
//                   <option value="minute">Last Hour (Minutes)</option>
//                   <option value="hour">Last Day (Hours)</option>
//                   <option value="day">Last Month (Days)</option>
//                   <option value="month">Last Year (Months)</option>
//                 </select>
//               </div>
//             </div>
//             <Line
//               data={chartData}
//               options={{
//                 responsive: true,
//                 plugins: {
//                   legend: { position: 'top' },
//                   title: { display: true, text: 'Speed Test History' },
//                 },
//               }}
//             />
//           </div>
//         )}
//       </div>

//       <div className="space-y-4">
//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('ping')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//           aria-expanded={expandedTest === 'ping'}
//           aria-label="Ping Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.ping.status)}
//               Ping Test ({diagnostics.ping.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
//             >
//               {expandedTest === 'ping' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.ping.result ? `Latency: ${diagnostics.ping.result.avg ?? 'N/A'}ms` : 'No data yet.'}
//           </p>

//           {expandedTest === 'ping' && diagnostics.ping.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Measures the round-trip time for messages sent to the target</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.ping.status)}>
//                   {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Target:</p>
//                 <p className="text-gray-900">{diagnostics.ping.target}</p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">{`${diagnostics.ping.result.min ?? 'N/A'}/${diagnostics.ping.result.avg ?? 'N/A'}/${
//                   diagnostics.ping.result.max ?? 'N/A'
//                 } ms`}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('traceroute')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//           aria-expanded={expandedTest === 'traceroute'}
//           aria-label="Traceroute Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.traceroute.status)}
//               Traceroute ({diagnostics.traceroute.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}
//             >
//               {expandedTest === 'traceroute' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>

//           {expandedTest === 'traceroute' && diagnostics.traceroute.result?.hops ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
//                 <div>Hop</div>
//                 <div>IP Address</div>
//                 <div>Time</div>
//               </div>
//               {diagnostics.traceroute.result.hops.map((hop, index) => (
//                 <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
//                   <div>{hop.hop ?? 'N/A'}</div>
//                   <div className="font-mono">{hop.ip || '*'}</div>
//                   <div>{hop.time ?? 'N/A'}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">{diagnostics.traceroute.result ? 'View route path' : 'No data yet.'}</p>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('health')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//           aria-expanded={expandedTest === 'health'}
//           aria-label="Router Health Check Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.healthCheck.status)}
//               Router Health Check
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
//             >
//               {expandedTest === 'health' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.healthCheck.result ? `CPU: ${diagnostics.healthCheck.result.cpu_usage ?? 'N/A'}%` : 'No data yet.'}
//           </p>

//           {expandedTest === 'health' && diagnostics.healthCheck.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Monitors the router's resource usage and service status</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.healthCheck.status)}>
//                   {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">CPU Usage:</p>
//                 <p className="text-gray-900">{diagnostics.healthCheck.result.cpu_usage ?? 'N/A'}%</p>
//                 <p className="text-gray-500">Memory Usage:</p>
//                 <p className="text-gray-900">{diagnostics.healthCheck.result.memory_usage ?? 'N/A'}%</p>
//                 <p className="text-gray-500">Disk Usage:</p>
//                 <p className="text-gray-900">{diagnostics.healthCheck.result.disk_usage ?? 'N/A'}%</p>
//               </div>
//               {diagnostics.healthCheck.result.services?.length > 0 && (
//                 <div className="mt-3">
//                   <p className="text-gray-500 font-medium">Services:</p>
//                   {diagnostics.healthCheck.result.services.map((service, index) => (
//                     <div key={index} className="flex justify-between py-1">
//                       <span className="text-gray-900">{service.name ?? 'Unknown'}</span>
//                       <span className={service.status === 'running' ? 'text-green-600' : 'text-red-600'}>
//                         {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('dns')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//           aria-expanded={expandedTest === 'dns'}
//           aria-label="DNS Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.dns.status)}
//               DNS Test ({diagnostics.dns.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
//             >
//               {expandedTest === 'dns' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.dns.result?.addresses ? `Resolved: ${diagnostics.dns.result.addresses.length} IPs` : 'No data yet.'}
//           </p>

//           {expandedTest === 'dns' && diagnostics.dns.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Resolves the domain name to IP addresses</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.dns.status)}>
//                   {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Hostname:</p>
//                 <p className="text-gray-900">{diagnostics.dns.result.hostname ?? 'N/A'}</p>
//                 <p className="text-gray-500">Resolved IPs:</p>
//                 <p className="text-gray-900">{diagnostics.dns.result.addresses?.join(', ') || 'None'}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packetLoss' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('packetLoss')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packetLoss')}
//           aria-expanded={expandedTest === 'packetLoss'}
//           aria-label="Packet Loss Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.packetLoss.status)}
//               Packet Loss Test ({diagnostics.packetLoss.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
//             >
//               {expandedTest === 'packetLoss' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.packetLoss.result ? `Packet Loss: ${diagnostics.packetLoss.result.packet_loss ?? 'N/A'}%` : 'No data yet.'}
//           </p>

//           {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Measures the percentage of packets lost during transmission</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.packetLoss.status)}>
//                   {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Target:</p>
//                 <p className="text-gray-900">{diagnostics.packetLoss.target}</p>
//                 <p className="text-gray-500">Packet Loss:</p>
//                 <p className="text-gray-900">{diagnostics.packetLoss.result.packet_loss ?? 'N/A'}%</p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">{`${
//                   diagnostics.packetLoss.result.rtt?.min ?? 'N/A'
//                 }/${diagnostics.packetLoss.result.rtt?.avg ?? 'N/A'}/${diagnostics.packetLoss.result.rtt?.max ?? 'N/A'} ms`}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NetworkDiagnostics;








// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Activity, Wifi, Server, Download, Upload,
//   Clock, AlertCircle, CheckCircle, XCircle,
//   RefreshCw, ChevronDown, ChevronUp, Gauge,
//   HardDrive, Network
// } from 'lucide-react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../../../api';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// // Add JWT token to API requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token'); // Adjust based on your auth storage
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

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
//     bandwidth: { download: null, upload: null, status: 'idle' },
//     clientBandwidth: { download: null, upload: null, status: 'idle', clientIp: null },
//     dns: { result: null, status: 'idle', target: 'example.com' },
//     packetLoss: { result: null, status: 'idle', target: 'example.com' },
//   });
//   const [historicalData, setHistoricalData] = useState({
//     isp: { minute: [], hour: [], day: [], month: [] },
//     client: { minute: [], hour: [], day: [], month: [] },
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
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
//       if (!routerList.length) {
//         setError('No routers configured in the system. Please add a router via the admin panel.');
//       } else if (propRouterId && !routerList.find(r => r.id === parseInt(propRouterId))) {
//         setError(`Router ID ${propRouterId} is invalid. Please select a valid router.`);
//         setSelectedRouterId('');
//       } else if (!propRouterId && routerList.length > 0) {
//         setSelectedRouterId(routerList[0].id.toString());
//       } else {
//         setSelectedRouterId(propRouterId || '');
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to fetch routers. Please try again.';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     }
//   }, [propRouterId]);

//   const fetchHistoricalData = useCallback(async () => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId)) || !routers.find(r => r.id === parseInt(selectedRouterId))) {
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       return;
//     }

//     try {
//       setError(null);
//       const response = await api.get(`/api/network_management/speed-test-history/?router=${selectedRouterId}&client_ip=${clientIp}`);
//       if (!response.data || typeof response.data !== 'object') {
//         throw new Error('Invalid historical data response');
//       }
//       setHistoricalData(response.data);
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Failed to fetch historical speed data';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     }
//   }, [selectedRouterId, clientIp, routers]);

//   useEffect(() => {
//     fetchRouters();
//   }, [fetchRouters]);

//   useEffect(() => {
//     if (clientIp && validateIp(clientIp) && selectedRouterId && !isNaN(parseInt(selectedRouterId)) && routers.find(r => r.id === parseInt(selectedRouterId))) {
//       fetchHistoricalData();
//     }
//   }, [clientIp, selectedRouterId, fetchHistoricalData, routers]);

//   const runDiagnostics = useCallback(async () => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId)) || !routers.find(r => r.id === parseInt(selectedRouterId))) {
//       toast.error('Please select a valid router');
//       setError('Please select a valid router');
//       return;
//     }
//     if (!validateDomain(diagnosticsTarget)) {
//       toast.error('Invalid target domain');
//       setIsTargetValid(false);
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       setIsClientIpValid(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);
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
//           clientIp: testType === 'speedtest' ? clientIp : undefined,
//           details: testType === 'speedtest' ? test.result?.speed_test : test.result?.[testType === 'healthCheck' ? 'health_check' : testType],
//         };
//         return acc;
//       }, { ...diagnostics });

//       setDiagnostics(updatedDiagnostics);
//       fetchHistoricalData();
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to run diagnostics';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [diagnosticsTarget, clientIp, selectedRouterId, diagnostics, fetchHistoricalData, routers]);

//   const runSpeedTest = useCallback(async (type) => {
//     if (!selectedRouterId || isNaN(parseInt(selectedRouterId)) || !routers.find(r => r.id === parseInt(selectedRouterId))) {
//       toast.error('Please select a valid router');
//       setError('Please select a valid router');
//       return;
//     }
//     if (!validateIp(clientIp)) {
//       toast.error('Invalid client IP');
//       setIsClientIpValid(false);
//       return;
//     }

//     setSpeedTestRunning(true);
//     setError(null);
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
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Speed test failed';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       setDiagnostics(prev => ({
//         ...prev,
//         bandwidth: { ...prev.bandwidth, status: 'error' },
//         clientBandwidth: { ...prev.clientBandwidth, status: 'error' },
//       }));
//     } finally {
//       setSpeedTestRunning(false);
//     }
//   }, [clientIp, selectedRouterId, fetchHistoricalData, routers]);

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
//     return speed != null ? `${speed} Mbps` : 'N/A';
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
//         data: historicalData.isp[timeFrame]?.map(d => Number(d.download)) || [],
//         borderColor: 'rgb(75, 192, 192)',
//         tension: 0.1,
//       },
//       {
//         label: 'ISP Upload',
//         data: historicalData.isp[timeFrame]?.map(d => Number(d.upload)) || [],
//         borderColor: 'rgb(255, 99, 132)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Download',
//         data: historicalData.client[timeFrame]?.map(d => Number(d.download)) || [],
//         borderColor: 'rgb(54, 162, 235)',
//         tension: 0.1,
//       },
//       {
//         label: 'Client Upload',
//         data: historicalData.client[timeFrame]?.map(d => Number(d.upload)) || [],
//         borderColor: 'rgb(255, 206, 86)',
//         tension: 0.1,
//       },
//     ],
//   };

//   if (error && !loading) {
//     return (
//       <div className="p-6 bg-white text-gray-900 rounded-lg">
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
//           <div className="flex items-center">
//             <AlertCircle className="w-5 h-5 mr-2" />
//             <strong>Error:</strong>
//           </div>
//           <p>{error}</p>
//           {routers.length === 0 && (
//             <p className="mt-2">Please add a router in the admin panel at <a href="/admin/network_management/router/add/" className="text-blue-600 underline">/admin/network_management/router/add/</a>.</p>
//           )}
//         </div>
//       </div>
//     );
//   }

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
//           {routers.length > 0 && (
//             <div className="relative flex-1">
//               <label htmlFor="router-select" className="sr-only">Select Router</label>
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Server className="h-5 w-5 text-gray-500" aria-hidden="true" />
//               </div>
//               <select
//                 id="router-select"
//                 value={selectedRouterId}
//                 onChange={(e) => setSelectedRouterId(e.target.value)}
//                 className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 aria-label="Select router for diagnostics"
//               >
//                 <option value="">Select a router</option>
//                 {routers.map(router => (
//                   <option key={router.id} value={router.id}>{router.name} ({router.ip_address})</option>
//                 ))}
//               </select>
//             </div>
//           )}
//           <div className="relative flex-1">
//             <label htmlFor="target-domain" className="sr-only">Target Domain</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Network className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="target-domain"
//               type="text"
//               className={`pl-10 pr-4 py-2 w-full bg-white border ${isTargetValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//               placeholder="Enter target (e.g., example.com)"
//               value={diagnosticsTarget}
//               onChange={(e) => {
//                 setDiagnosticsTarget(e.target.value);
//                 setIsTargetValid(validateDomain(e.target.value));
//               }}
//               aria-label="Target domain for diagnostics"
//               aria-invalid={!isTargetValid}
//             />
//           </div>
//           <div className="relative flex-1">
//             <label htmlFor="client-ip" className="sr-only">Client IP</label>
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Wifi className="h-5 w-5 text-gray-500" aria-hidden="true" />
//             </div>
//             <input
//               id="client-ip"
//               type="text"
//               className={`pl-10 pr-4 py-2 w-full bg-white border ${isClientIpValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
//               placeholder="Client IP (e.g., 192.168.1.100)"
//               value={clientIp}
//               onChange={(e) => {
//                 setClientIp(e.target.value);
//                 setIsClientIpValid(validateIp(e.target.value));
//               }}
//               aria-label="Client IP address"
//               aria-invalid={!isClientIpValid}
//             />
//           </div>
//           <button
//             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
//             onClick={runDiagnostics}
//             disabled={loading || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !isTargetValid || !routers.find(r => r.id === parseInt(selectedRouterId))}
//             aria-label="Run network diagnostics"
//           >
//             {loading ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
//                 Running...
//               </>
//             ) : (
//               <>
//                 <Activity className="w-5 h-5 mr-2" aria-hidden="true" />
//                 Run Diagnostics
//               </>
//             )}
//           </button>
//         </div>
//       </header>

//       <div className="bg-white p-4 rounded-lg shadow mb-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center">
//             <Gauge className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
//             Bandwidth Speed Test
//           </h2>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => runSpeedTest('full')}
//               disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !routers.find(r => r.id === parseInt(selectedRouterId))}
//               className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run full speed test"
//             >
//               {speedTestRunning ? (
//                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" />
//               ) : (
//                 <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               )}
//               Full Test
//             </button>
//             <button
//               onClick={() => runSpeedTest('quick')}
//               disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !routers.find(r => r.id === parseInt(selectedRouterId))}
//               className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
//               aria-label="Run quick speed test"
//             >
//               <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
//               Quick Test
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.bandwidth.status)}
//               ISP Connection Speed
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.bandwidth.download)}</p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.bandwidth.upload)}</p>
//               </div>
//             </div>
//             {diagnostics.bandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
//                 <p>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
//                 <p>Latency: {diagnostics.bandwidth.latency ?? 'N/A'}</p>
//                 <p>Jitter: {diagnostics.bandwidth.jitter ?? 'N/A'}</p>
//               </div>
//             )}
//           </div>

//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3 flex items-center">
//               {renderStatusIcon(diagnostics.clientBandwidth.status)}
//               Client Speed ({clientIp || 'N/A'})
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Download</p>
//                 <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
//               </div>
//               <div className="bg-white p-3 rounded shadow-sm">
//                 <p className="text-sm text-gray-500">Upload</p>
//                 <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
//               </div>
//             </div>
//             {diagnostics.clientBandwidth.status === 'success' && (
//               <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
//                 <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
//                 <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700 mb-3">Bandwidth Comparison</h3>
//             <div className="space-y-2">
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Download Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-green-500 h-2.5 rounded-full"
//                     style={{
//                       width: `${calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%`,
//                     }}
//                     role="progressbar"
//                     aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
//                   {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500 mb-1">Upload Efficiency</p>
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-blue-500 h-2.5 rounded-full"
//                     style={{
//                       width: `${calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%`,
//                     }}
//                     role="progressbar"
//                     aria-valuenow={calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}
//                     aria-valuemin={0}
//                     aria-valuemax={100}
//                   ></div>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
//                   {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {historicalData.isp[timeFrame]?.length > 0 && (
//           <div className="mt-4 bg-gray-50 p-4 rounded-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
//               <div>
//                 <label htmlFor="timeframe-select" className="sr-only">
//                   Select Time Frame
//                 </label>
//                 <select
//                   id="timeframe-select"
//                   value={timeFrame}
//                   onChange={(e) => setTimeFrame(e.target.value)}
//                   className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
//                   aria-label="Select time frame for historical data"
//                 >
//                   <option value="minute">Last Hour (Minutes)</option>
//                   <option value="hour">Last Day (Hours)</option>
//                   <option value="day">Last Month (Days)</option>
//                   <option value="month">Last Year (Months)</option>
//                 </select>
//               </div>
//             </div>
//             <Line
//               data={chartData}
//               options={{
//                 responsive: true,
//                 plugins: {
//                   legend: { position: 'top' },
//                   title: { display: true, text: 'Speed Test History' },
//                 },
//               }}
//             />
//           </div>
//         )}
//       </div>

//       <div className="space-y-4">
//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('ping')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
//           aria-expanded={expandedTest === 'ping'}
//           aria-label="Ping Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.ping.status)}
//               Ping Test ({diagnostics.ping.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
//             >
//               {expandedTest === 'ping' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg}ms` : 'No data yet.'}
//           </p>

//           {expandedTest === 'ping' && diagnostics.ping.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Measures the round-trip time for messages sent to the target</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.ping.status)}>
//                   {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Target:</p>
//                 <p className="text-gray-900">{diagnostics.ping.target}</p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">{`${
//                   diagnostics.ping.result.min ?? 'N/A'
//                 }/${diagnostics.ping.result.avg ?? 'N/A'}/${diagnostics.ping.result.max ?? 'N/A'} ms`}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('traceroute')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
//           aria-expanded={expandedTest === 'traceroute'}
//           aria-label="Traceroute Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.traceroute.status)}
//               Traceroute ({diagnostics.traceroute.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'traceroute' ? 'Collapse traceroute test' : 'Expand traceroute test'}
//             >
//               {expandedTest === 'traceroute' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>

//           {expandedTest === 'traceroute' && diagnostics.traceroute.result?.hops?.length > 0 ? (
//             <div className="mt-3 bg-gray-50 p-3 rounded">
//               <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
//                 <div>Hop</div>
//                 <div>IP Address</div>
//                 <div>Time</div>
//               </div>
//               {diagnostics.traceroute.result.hops.map((hop, index) => (
//                 <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
//                   <div>{hop.hop ?? 'N/A'}</div>
//                   <div className="font-mono">{hop.ip || '*'}</div>
//                   <div>{hop.time ?? 'N/A'}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="mt-1 text-gray-500">{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('health')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
//           aria-expanded={expandedTest === 'health'}
//           aria-label="Router Health Check Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.healthCheck.status)}
//               Router Health Check
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
//             >
//               {expandedTest === 'health' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
//               ? `CPU: ${diagnostics.healthCheck.result.cpu_usage}%`
//               : 'No data yet.'}
//           </p>

//           {expandedTest === 'health' && diagnostics.healthCheck.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Monitors the router's resource usage and service status</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.healthCheck.status)}>
//                   {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">CPU Usage:</p>
//                 <p className="text-gray-900">{diagnostics.healthCheck.result.cpu_usage ?? 'N/A'}%</p>
//                 <p className="text-gray-500">Memory Usage:</p>
//                 <p className="text-gray-900">{diagnostics.healthCheck.result.memory_usage ?? 'N/A'}%</p>
//                 <p className="text-gray-500">Disk Usage:</p>
//                 <p className="text-gray-900">{diagnostics.healthCheck.result.disk_usage ?? 'N/A'}%</p>
//               </div>
//               {diagnostics.healthCheck.result.services?.length > 0 && (
//                 <div className="mt-3">
//                   <p className="text-gray-500 font-medium">Services:</p>
//                   {diagnostics.healthCheck.result.services.map((service, index) => (
//                     <div key={index} className="flex justify-between py-1">
//                       <span className="text-gray-900">{service.name ?? 'Unknown'}</span>
//                       <span className={service.status === 'running' ? 'text-green-600' : 'text-red-600'}>
//                         {service.status ? service.status.charAt(0).toUpperCase() + service.status.slice(1) : 'N/A'}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('dns')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
//           aria-expanded={expandedTest === 'dns'}
//           aria-label="DNS Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.dns.status)}
//               DNS Test ({diagnostics.dns.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
//             >
//               {expandedTest === 'dns' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.dns.result?.addresses?.length > 0 ? `Resolved: ${diagnostics.dns.result.addresses.length} IPs` : 'No data yet.'}
//           </p>

//           {expandedTest === 'dns' && diagnostics.dns.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Resolves the domain name to IP addresses</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.dns.status)}>
//                   {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Hostname:</p>
//                 <p className="text-gray-900">{diagnostics.dns.result.hostname ?? 'N/A'}</p>
//                 <p className="text-gray-500">Resolved IPs:</p>
//                 <p className="text-gray-900">{diagnostics.dns.result.addresses?.join(', ') || 'None'}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div
//           className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packetLoss' ? 'ring-2 ring-indigo-500' : ''}`}
//           onClick={() => toggleTestExpansion('packetLoss')}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packetLoss')}
//           aria-expanded={expandedTest === 'packetLoss'}
//           aria-label="Packet Loss Test Section"
//         >
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-gray-700 flex items-center">
//               {renderStatusIcon(diagnostics.packetLoss.status)}
//               Packet Loss Test ({diagnostics.packetLoss.target})
//             </h3>
//             <button
//               className="text-gray-500 hover:text-gray-400"
//               aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
//             >
//               {expandedTest === 'packetLoss' ? (
//                 <ChevronUp className="w-5 h-5" aria-hidden="true" />
//               ) : (
//                 <ChevronDown className="w-5 h-5" aria-hidden="true" />
//               )}
//             </button>
//           </div>
//           <p className="mt-1 text-gray-500">
//             {diagnostics.packetLoss.result && diagnostics.packetLoss.result.packet_loss != null
//               ? `Packet Loss: ${diagnostics.packetLoss.result.packet_loss}%`
//               : 'No data yet.'}
//           </p>

//           {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
//             <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
//               <p className="text-gray-500">Measures the percentage of packets lost during transmission</p>
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <p className="text-gray-500">Status:</p>
//                 <p className={getStatusColor(diagnostics.packetLoss.status)}>
//                   {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
//                 </p>
//                 <p className="text-gray-500">Target:</p>
//                 <p className="text-gray-900">{diagnostics.packetLoss.target}</p>
//                 <p className="text-gray-500">Packet Loss:</p>
//                 <p className="text-gray-900">{diagnostics.packetLoss.result.packet_loss ?? 'N/A'}%</p>
//                 <p className="text-gray-500">Min/Avg/Max RTT:</p>
//                 <p className="text-gray-900">{`${
//                   diagnostics.packetLoss.result.rtt?.min ?? 'N/A'
//                 }/${diagnostics.packetLoss.result.rtt?.avg ?? 'N/A'}/${diagnostics.packetLoss.result.rtt?.max ?? 'N/A'} ms`}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
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
import api from '../../../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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
    const colors = {
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
    <div className="p-6 bg-white text-gray-900 rounded-lg" role="region" aria-label="Network Diagnostics">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-gray-50 p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <Activity className="w-8 h-8 text-indigo-600" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Network Diagnostics</h1>
            <p className="text-sm text-gray-500">Comprehensive network analysis and speed testing</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
                  className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className={`pl-10 pr-4 py-2 w-full bg-white border ${isTargetValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
                  className={`pl-10 pr-4 py-2 w-full bg-white border ${isClientIpValid ? 'border-gray-300' : 'border-red-500'} rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:opacity-50"
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
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-indigo-600" aria-hidden="true" />
                Bandwidth Speed Test
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => runSpeedTest('full')}
                  disabled={speedTestRunning || !selectedRouterId || isNaN(parseInt(selectedRouterId)) || !isClientIpValid || !clientIp}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm flex items-center disabled:opacity-50"
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
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-md text-sm flex items-center disabled:opacity-50"
                  aria-label="Run quick speed test"
                >
                  <Activity className="w-4 h-4 mr-1" aria-hidden="true" />
                  Quick Test
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  {renderStatusIcon(diagnostics.bandwidth.status)}
                  ISP Connection Speed
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Download</p>
                    <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.bandwidth.download)}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Upload</p>
                    <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.bandwidth.upload)}</p>
                  </div>
                </div>
                {diagnostics.bandwidth.status === 'success' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <p>Server: {diagnostics.bandwidth.server || 'N/A'}</p>
                    <p>ISP: {diagnostics.bandwidth.isp || 'N/A'}</p>
                    <p>Latency: {diagnostics.bandwidth.latency != null ? `${diagnostics.bandwidth.latency.toFixed(2)} ms` : 'N/A'}</p>
                    <p>Jitter: {diagnostics.bandwidth.jitter != null ? `${diagnostics.bandwidth.jitter.toFixed(2)} ms` : 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  {renderStatusIcon(diagnostics.clientBandwidth.status)}
                  Client Speed ({clientIp || 'N/A'})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Download</p>
                    <p className="text-xl font-bold text-green-600">{formatSpeed(diagnostics.clientBandwidth.download)}</p>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <p className="text-sm text-gray-500">Upload</p>
                    <p className="text-xl font-bold text-blue-600">{formatSpeed(diagnostics.clientBandwidth.upload)}</p>
                  </div>
                </div>
                {diagnostics.clientBandwidth.status === 'success' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <p>Device: {diagnostics.clientBandwidth.device || 'Unknown'}</p>
                    <p>Connection: {diagnostics.clientBandwidth.connectionType || 'Unknown'}</p>
                  </div>
                )}
              </div>
            </div>

            {diagnostics.bandwidth.status === 'success' && diagnostics.clientBandwidth.status === 'success' && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Bandwidth Comparison</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Download Efficiency</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
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
                    <p className="text-xs text-gray-500 mt-1">
                      Client gets {formatSpeed(diagnostics.clientBandwidth.download)} of {formatSpeed(diagnostics.bandwidth.download)} (
                      {calculateEfficiency(diagnostics.clientBandwidth.download, diagnostics.bandwidth.download)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Upload Efficiency</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
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
                    <p className="text-xs text-gray-500 mt-1">
                      Client gets {formatSpeed(diagnostics.clientBandwidth.upload)} of {formatSpeed(diagnostics.bandwidth.upload)} (
                      {calculateEfficiency(diagnostics.clientBandwidth.upload, diagnostics.bandwidth.upload)}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {historicalData.isp[timeFrame]?.length > 0 && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">Historical Speed Data</h3>
                  <div>
                    <label htmlFor="timeframe-select" className="sr-only">
                      Select Time Frame
                    </label>
                    <select
                      id="timeframe-select"
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                      className="p-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm"
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
                      legend: { position: 'top' },
                      title: { display: true, text: 'Speed Test History' },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Speed (Mbps)' },
                      },
                      x: {
                        title: { display: true, text: 'Time' },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div
              className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'ping' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => toggleTestExpansion('ping')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('ping')}
              aria-expanded={expandedTest === 'ping'}
              aria-label="Ping Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  {renderStatusIcon(diagnostics.ping.status)}
                  Ping Test ({diagnostics.ping.target})
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-400"
                  aria-label={expandedTest === 'ping' ? 'Collapse ping test' : 'Expand ping test'}
                >
                  {expandedTest === 'ping' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-gray-500">
                {diagnostics.ping.result && diagnostics.ping.result.avg != null ? `Latency: ${diagnostics.ping.result.avg.toFixed(2)}ms` : 'No data yet.'}
              </p>

              {expandedTest === 'ping' && diagnostics.ping.result && (
                <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                  <p className="text-gray-500">Measures the round-trip time for messages sent to the target</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-gray-500">Status:</p>
                    <p className={getStatusColor(diagnostics.ping.status)}>
                      {diagnostics.ping.status.charAt(0).toUpperCase() + diagnostics.ping.status.slice(1)}
                    </p>
                    <p className="text-gray-500">Target:</p>
                    <p className="text-gray-900">{diagnostics.ping.target}</p>
                    <p className="text-gray-500">Min/Avg/Max RTT:</p>
                    <p className="text-gray-900">{`${
                      diagnostics.ping.result.min != null ? diagnostics.ping.result.min.toFixed(2) : 'N/A'
                    }/${diagnostics.ping.result.avg != null ? diagnostics.ping.result.avg.toFixed(2) : 'N/A'}/${
                      diagnostics.ping.result.max != null ? diagnostics.ping.result.max.toFixed(2) : 'N/A'
                    } ms`}</p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'traceroute' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => toggleTestExpansion('traceroute')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('traceroute')}
              aria-expanded={expandedTest === 'traceroute'}
              aria-label="Traceroute Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  {renderStatusIcon(diagnostics.traceroute.status)}
                  Traceroute ({diagnostics.traceroute.target})
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-400"
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
                <div className="mt-3 bg-gray-50 p-3 rounded">
                  <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-500 mb-2">
                    <div>Hop</div>
                    <div>IP Address</div>
                    <div>Time</div>
                  </div>
                  {diagnostics.traceroute.result.hops.map((hop, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1 border-b border-gray-200 last:border-0">
                      <div>{hop.hop ?? 'N/A'}</div>
                      <div className="font-mono">{hop.ip || '*'}</div>
                      <div>{hop.time != null ? `${hop.time.toFixed(2)} ms` : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-gray-500">{diagnostics.traceroute.result ? 'No hops available' : 'No data yet.'}</p>
              )}
            </div>

            <div
              className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'health' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => toggleTestExpansion('health')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('health')}
              aria-expanded={expandedTest === 'health'}
              aria-label="Router Health Check Section"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  {renderStatusIcon(diagnostics.healthCheck.status)}
                  Router Health Check
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-400"
                  aria-label={expandedTest === 'health' ? 'Collapse health check' : 'Expand health check'}
                >
                  {expandedTest === 'health' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-gray-500">
                {diagnostics.healthCheck.result && diagnostics.healthCheck.result.cpu_usage != null
                  ? `CPU: ${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'health' && diagnostics.healthCheck.result && (
                <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                  <p className="text-gray-500">Monitors the router's resource usage and service status</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-gray-500">Status:</p>
                    <p className={getStatusColor(diagnostics.healthCheck.status)}>
                      {diagnostics.healthCheck.status.charAt(0).toUpperCase() + diagnostics.healthCheck.status.slice(1)}
                    </p>
                    <p className="text-gray-500">CPU Usage:</p>
                    <p className="text-gray-900">{diagnostics.healthCheck.result.cpu_usage != null ? `${diagnostics.healthCheck.result.cpu_usage.toFixed(2)}%` : 'N/A'}</p>
                    <p className="text-gray-500">Memory Usage:</p>
                    <p className="text-gray-900">{diagnostics.healthCheck.result.memory_usage != null ? `${diagnostics.healthCheck.result.memory_usage.toFixed(2)}%` : 'N/A'}</p>
                    <p className="text-gray-500">Disk Usage:</p>
                    <p className="text-gray-900">{diagnostics.healthCheck.result.disk_usage != null ? `${diagnostics.healthCheck.result.disk_usage.toFixed(2)}%` : 'N/A'}</p>
                  </div>
                  {diagnostics.healthCheck.result.services?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-gray-500 font-medium">Services:</p>
                      {diagnostics.healthCheck.result.services.map((service, index) => (
                        <div key={index} className="flex justify-between py-1">
                          <span className="text-gray-900">{service.name ?? 'Unknown'}</span>
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

            <div
              className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'dns' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => toggleTestExpansion('dns')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('dns')}
              aria-expanded={expandedTest === 'dns'}
              aria-label="DNS Resolution Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  {renderStatusIcon(diagnostics.dns.status)}
                  DNS Resolution Test ({diagnostics.dns.target})
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-400"
                  aria-label={expandedTest === 'dns' ? 'Collapse DNS test' : 'Expand DNS test'}
                >
                  {expandedTest === 'dns' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-gray-500">
                {diagnostics.dns.result && diagnostics.dns.result.addresses?.length > 0
                  ? `Resolved: ${diagnostics.dns.result.addresses[0]}`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'dns' && diagnostics.dns.result && (
                <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                  <p className="text-gray-500">Tests the resolution of domain names to IP addresses</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-gray-500">Status:</p>
                    <p className={getStatusColor(diagnostics.dns.status)}>
                      {diagnostics.dns.status.charAt(0).toUpperCase() + diagnostics.dns.status.slice(1)}
                    </p>
                    <p className="text-gray-500">Target:</p>
                    <p className="text-gray-900">{diagnostics.dns.target}</p>
                    <p className="text-gray-500">Resolved IPs:</p>
                    <p className="text-gray-900">
                      {diagnostics.dns.result.addresses?.length > 0
                        ? diagnostics.dns.result.addresses.join(', ')
                        : 'None'}
                    </p>
                    <p className="text-gray-500">Response Time:</p>
                    <p className="text-gray-900">
                      {diagnostics.dns.result.response_time != null
                        ? `${diagnostics.dns.result.response_time.toFixed(2)} ms`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`bg-white p-4 rounded-lg shadow cursor-pointer ${expandedTest === 'packetLoss' ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => toggleTestExpansion('packetLoss')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && toggleTestExpansion('packetLoss')}
              aria-expanded={expandedTest === 'packetLoss'}
              aria-label="Packet Loss Test Section"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  {renderStatusIcon(diagnostics.packetLoss.status)}
                  Packet Loss Test ({diagnostics.packetLoss.target})
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-400"
                  aria-label={expandedTest === 'packetLoss' ? 'Collapse packet loss test' : 'Expand packet loss test'}
                >
                  {expandedTest === 'packetLoss' ? (
                    <ChevronUp className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-gray-500">
                {diagnostics.packetLoss.result && diagnostics.packetLoss.result.loss != null
                  ? `Loss: ${diagnostics.packetLoss.result.loss.toFixed(2)}%`
                  : 'No data yet.'}
              </p>

              {expandedTest === 'packetLoss' && diagnostics.packetLoss.result && (
                <div className="mt-3 bg-gray-50 p-3 rounded text-sm">
                  <p className="text-gray-500">Measures the percentage of packets lost during transmission</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-gray-500">Status:</p>
                    <p className={getStatusColor(diagnostics.packetLoss.status)}>
                      {diagnostics.packetLoss.status.charAt(0).toUpperCase() + diagnostics.packetLoss.status.slice(1)}
                    </p>
                    <p className="text-gray-500">Target:</p>
                    <p className="text-gray-900">{diagnostics.packetLoss.target}</p>
                    <p className="text-gray-500">Packet Loss:</p>
                    <p className="text-gray-900">
                      {diagnostics.packetLoss.result.loss != null
                        ? `${diagnostics.packetLoss.result.loss.toFixed(2)}%`
                        : 'N/A'}
                    </p>
                    <p className="text-gray-500">Packets Sent/Received:</p>
                    <p className="text-gray-900">
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
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200">
            <Router className="h-6 w-6 text-gray-600" aria-hidden="true" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No router selected</h3>
          <p className="mt-1 text-gray-500">
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