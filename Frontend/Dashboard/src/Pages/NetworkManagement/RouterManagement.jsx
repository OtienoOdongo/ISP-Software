

// // Updated router management frontend code (RouterManagement.jsx)

// import React, { useReducer, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Wifi, Server, Upload, Settings, X, Users, RefreshCw, Plus, CheckCircle, Globe, Download, LogOut, LogIn, ChevronDown, ChevronUp, Trash2, Edit } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { ThreeDots } from "react-loader-spinner";
// import api from "../../api"

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
//     type: "mikrotik",
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
//   "connected": "bg-green-100 text-green-600",
//   "disconnected": "bg-red-100 text-red-600",
//   "updating": "bg-yellow-100 text-yellow-600",
//   "error": "bg-purple-100 text-purple-600",
// }[status] || "bg-gray-100 text-gray-500");

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

// const routerTypes = [
//   { value: "mikrotik", label: "MikroTik" },
//   { value: "ubiquiti", label: "Ubiquiti" },
//   { value: "cisco", label: "Cisco" },
//   { value: "other", label: "Other" },
// ];

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
//     if (!routerForm.name || !routerForm.ip || !routerForm.type) {
//       toast.warn("Name, IP, and Type are required");
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

//   const activateUserOnRouter = async (routerId, mac, planId, clientId) => {
//     dispatch({ type: "SET_LOADING", payload: true });
//     try {
//       const response = await api.post(`/api/network_management/routers/${routerId}/activate-user/`, {
//         mac,
//         plan_id: planId,
//         client_id: clientId,
//       });
//       toast.success("User activated on router");
//       fetchHotspotUsers(routerId);
//     } catch (error) {
//       toast.error("Failed to activate user");
//     } finally {
//       dispatch({ type: "SET_LOADING", payload: false });
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-100 text-gray-900 font-sans">
//       <ToastContainer position="top-right" autoClose={3000} theme="light" pauseOnHover newestOnTop />

//       {/* Header */}
//       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow">
//         <div className="flex items-center space-x-4 mb-4 sm:mb-0">
//           <Server className="w-8 h-8 text-indigo-600" />
//           <div>
//             <h1 className="text-2xl font-bold text-indigo-600">Router Management</h1>
//             <p className="text-sm text-gray-500">{routers.length} routers • {routers.filter(r => r.status === "connected").length} online</p>
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })} label="Add Router" icon={<Plus />} color="bg-indigo-600 hover:bg-indigo-700" />
//         </div>
//       </header>

//       {/* Router List */}
//       <section className="bg-white p-4 rounded-lg shadow">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold flex items-center"><Wifi className="w-5 h-5 mr-2 text-indigo-600" /> Routers</h2>
//           <Button onClick={fetchRouters} icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />} color="bg-gray-200 hover:bg-gray-300" compact />
//         </div>
//         {isLoading ? (
//           <div className="flex justify-center py-4"><ThreeDots color="#6366F1" height={50} width={50} /></div>
//         ) : routers.length === 0 ? (
//           <p className="text-gray-500 text-center py-4">No routers found</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {routers.map(router => (
//               <motion.div
//                 key={router.id}
//                 onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
//                 whileHover={{ scale: 1.03 }}
//                 className={`p-4 rounded-lg cursor-pointer bg-white hover:bg-gray-50 ${activeRouter?.id === router.id ? "ring-2 ring-indigo-500" : ""}`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="font-medium text-gray-900 truncate">{router.name} ({router.type})</p>
//                     <p className="text-xs text-gray-500">{router.ip}:{router.port}</p>
//                   </div>
//                   <span className={`px-2 py-1 rounded-full text-xs ${getRouterStatusColor(router.status)}`}>{router.status}</span>
//                 </div>
//                 {expandedRouter === router.id && (
//                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-gray-500">
//                     <p>Location: {router.location || "N/A"}</p>
//                     <div className="flex gap-2 mt-2">
//                       <Button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" }); dispatch({ type: "UPDATE_ROUTER_FORM", payload: router }); }} label="Edit" icon={<Edit />} color="bg-indigo-600 hover:bg-indigo-700" compact />
//                       <Button onClick={e => { e.stopPropagation(); deleteRouter(router.id); }} label="Delete" icon={<Trash2 />} color="bg-red-600 hover:bg-red-700" compact />
//                       <Button onClick={e => { e.stopPropagation(); router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id); }} label={router.status === "connected" ? "Disconnect" : "Connect"} icon={router.status === "connected" ? <LogOut /> : <LogIn />} color={router.status === "connected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} compact />
//                     </div>
//                   </motion.div>
//                 )}
//                 <button onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id }); }} className="w-full mt-2 text-gray-500 hover:text-gray-700 text-xs flex justify-center">
//                   {expandedRouter === router.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//                 </button>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Router Dashboard */}
//       {activeRouter && (
//         <section className="bg-white p-4 rounded-lg shadow mt-6">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
//             <h2 className="text-lg font-semibold flex items-center mb-2 sm:mb-0"><Server className="w-5 h-5 mr-2 text-indigo-600" /> {activeRouter.name} ({activeRouter.type})</h2>
//             <div className="flex flex-wrap gap-2">
//               <Button onClick={() => activeRouter.status === "connected" ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id)} label={activeRouter.status === "connected" ? "Disconnect" : "Connect"} icon={activeRouter.status === "connected" ? <LogOut /> : <LogIn />} color={activeRouter.status === "connected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} />
//               <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} label="Configure Hotspot" icon={<Globe />} color="bg-indigo-600 hover:bg-indigo-700" disabled={activeRouter.status !== "connected"} />
//               <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} label="Hotspot Users" icon={<Users />} color="bg-teal-600 hover:bg-teal-700" disabled={activeRouter.status !== "connected"} />
//             </div>
//           </div>

//           {/* Hotspot Details */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="text-lg font-medium mb-2 flex items-center"><Globe className="w-5 h-5 mr-2 text-indigo-600" /> Hotspot Status</h3>
//             {activeRouter.status === "connected" ? (
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <p className="text-gray-500">Users</p><p className="text-gray-900">{hotspotUsers.length}</p>
//                 <p className="text-gray-500">Data Used</p><p className="text-gray-900">{formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0))}</p>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center">Router must be connected to manage Hotspot</p>
//             )}
//           </div>
//         </section>
//       )}

//       {/* Modals */}
//       <Modal isOpen={modals.addRouter} title="Add Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}>
//         <div className="space-y-4">
//           <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
//           <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
//           <div>
//             <label className="block text-sm text-gray-700 mb-1">Type <span className="text-red-600">*</span></label>
//             <select
//               value={routerForm.type}
//               onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
//               className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
//             >
//               {routerTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
//             </select>
//           </div>
//           <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
//           <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
//           <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
//           <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
//           <Button onClick={addRouter} label={isLoading ? "Adding..." : "Add"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !routerForm.name || !routerForm.ip || !routerForm.type} fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.editRouter} title="Edit Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}>
//         <div className="space-y-4">
//           <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
//           <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
//           <div>
//             <label className="block text-sm text-gray-700 mb-1">Type <span className="text-red-600">*</span></label>
//             <select
//               value={routerForm.type}
//               onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
//               className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
//             >
//               {routerTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
//             </select>
//           </div>
//           <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
//           <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
//           <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
//           <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
//           <div className="flex gap-2">
//             <Button onClick={() => updateRouter(activeRouter.id)} label={isLoading ? "Saving..." : "Save"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !routerForm.name || !routerForm.ip || !routerForm.type} fullWidth />
//             <Button onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })} label="Cancel" icon={<X />} color="bg-gray-200 hover:bg-gray-300" fullWidth />
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
//             <label className="block text-sm text-gray-700 mb-1">Landing Page (App.js)</label>
//             <input type="file" accept=".js" onChange={e => dispatch({ type: "UPDATE_HOTSPOT_FORM", payload: { landingPage: e.target.files[0] } })} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900" />
//           </div>
//           <Button onClick={configureHotspot} label={isLoading ? "Configuring..." : "Setup"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Upload />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !hotspotForm.landingPage} fullWidth />
//         </div>
//       </Modal>

//       <Modal isOpen={modals.users} title="Hotspot Users" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} size="lg">
//         <div className="space-y-4">
//           {hotspotUsers.length === 0 ? (
//             <p className="text-center py-4 text-gray-500">No active users</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs text-gray-700">Client</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-700">Plan</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-700">MAC</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-700">Payment</th>
//                     <th className="px-4 py-2 text-left text-xs text-gray-700">Data Used</th>
//                     <th className="px-4 py-2 text-right text-xs text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {hotspotUsers.map(user => (
//                     <tr key={user.id}>
//                       <td className="px-4 py-2 text-sm text-gray-900">{user.client?.user?.name || 'Unknown'}</td>
//                       <td className="px-4 py-2 text-sm text-gray-700">{user.plan?.name || "N/A"}</td>
//                       <td className="px-4 py-2 text-sm text-gray-700">{user.mac}</td>
//                       <td className="px-4 py-2 text-sm text-gray-700">{user.transaction?.status || "Pending"}</td>
//                       <td className="px-4 py-2 text-sm text-gray-700">{formatBytes(user.data_used)}</td>
//                       <td className="px-4 py-2 text-right">
//                         <Button onClick={() => disconnectHotspotUser(user.id)} label="Disconnect" icon={<LogOut />} color="bg-red-600 hover:bg-red-700" compact />
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
//       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           className={`bg-white p-4 rounded-lg ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} w-full`}
//         >
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
//           </div>
//           {children}
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// const InputField = ({ label, value, onChange, type = "text", placeholder, required }) => (
//   <div>
//     <label className="block text-sm text-gray-700 mb-1">{label} {required && <span className="text-red-600">*</span>}</label>
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
//     />
//   </div>
// );

// export default RouterManagement;








import React, { useReducer, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, Server, Upload, Settings, X, Users, RefreshCw, Plus, 
  CheckCircle, Globe, Download, LogOut, LogIn, ChevronDown, 
  ChevronUp, Trash2, Edit, Clock, MapPin, Activity, Zap,
  Shield, AlertCircle, History, RotateCcw, Battery, BatteryCharging
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThreeDots } from "react-loader-spinner";
import api from "../../api";

const initialState = {
  routers: [],
  activeRouter: null,
  isLoading: false,
  modals: {
    addRouter: false,
    editRouter: false,
    hotspotConfig: false,
    users: false,
    sessionHistory: false,
    healthStats: false,
  },
  routerForm: {
    name: "",
    ip: "",
    type: "mikrotik",
    port: "8728",
    username: "admin",
    password: "",
    location: "",
    is_default: false,
    captive_portal_enabled: true,
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
  sessionHistory: [],
  healthStats: [],
  expandedRouter: null,
  selectedUser: null,
  statsData: {
    latest: {},
    history: {}
  }
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
    case "SET_SESSION_HISTORY": return { ...state, sessionHistory: action.payload };
    case "SET_HEALTH_STATS": return { ...state, healthStats: action.payload };
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
    case "SET_STATS_DATA": return { ...state, statsData: action.payload };
    case "SET_SELECTED_USER": return { ...state, selectedUser: action.payload };
    default: return state;
  }
};

const getRouterStatusColor = (status) => ({
  "connected": "bg-green-100 text-green-600",
  "disconnected": "bg-red-100 text-red-600",
  "updating": "bg-yellow-100 text-yellow-600",
  "error": "bg-purple-100 text-purple-600",
}[status] || "bg-gray-100 text-gray-500");

const getRouterStatusIcon = (status) => {
  switch (status) {
    case "connected": return <Wifi className="w-4 h-4" />;
    case "disconnected": return <Wifi className="w-4 h-4" />;
    case "updating": return <RefreshCw className="w-4 h-4 animate-spin" />;
    case "error": return <AlertCircle className="w-4 h-4" />;
    default: return <Wifi className="w-4 h-4" />;
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const formatTime = (seconds) => {
  if (seconds <= 0) return "Expired";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
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

const routerTypes = [
  { value: "mikrotik", label: "MikroTik" },
  { value: "ubiquiti", label: "Ubiquiti" },
  { value: "cisco", label: "Cisco" },
  { value: "other", label: "Other" },
];

const RouterManagement = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { routers, activeRouter, isLoading, modals, routerForm, hotspotForm, hotspotUsers, sessionHistory, healthStats, expandedRouter, selectedUser, statsData } = state;
  const [statsLoading, setStatsLoading] = useState(false);

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

  const fetchSessionHistory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/network_management/hotspot-users/${userId}/session-history/`);
      dispatch({ type: "SET_SESSION_HISTORY", payload: response.data });
    } catch (error) {
      toast.error("Failed to fetch session history");
    }
  }, []);

  const fetchHealthStats = useCallback(async () => {
    try {
      const response = await api.get("/api/network_management/health-check/");
      dispatch({ type: "SET_HEALTH_STATS", payload: response.data });
    } catch (error) {
      toast.error("Failed to fetch health stats");
    }
  }, []);

  const fetchRouterStats = useCallback(async (routerId) => {
    if (!routerId) return;
    setStatsLoading(true);
    try {
      const response = await api.get(`/api/network_management/routers/${routerId}/stats/`);
      dispatch({ type: "SET_STATS_DATA", payload: response.data });
    } catch (error) {
      toast.error("Failed to fetch router stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRouters();
    fetchHealthStats();
    const interval = setInterval(() => {
      fetchRouters();
      fetchHealthStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchRouters, fetchHealthStats]);

  useEffect(() => {
    if (activeRouter) {
      fetchHotspotUsers(activeRouter.id);
      fetchRouterStats(activeRouter.id);
      const interval = setInterval(() => {
        fetchHotspotUsers(activeRouter.id);
        fetchRouterStats(activeRouter.id);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeRouter, fetchHotspotUsers, fetchRouterStats]);

  const addRouter = async () => {
    if (!routerForm.name || !routerForm.ip || !routerForm.type) {
      toast.warn("Name, IP, and Type are required");
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
      await api.delete(`/api/network_management/routers/${id}/`);
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

  const rebootRouter = async (routerId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await api.post(`/api/network_management/routers/${routerId}/reboot/`);
      const updatedRouter = { ...routers.find(r => r.id === routerId), status: "updating" };
      dispatch({ type: "UPDATE_ROUTER", payload: { id: routerId, data: updatedRouter } });
      if (activeRouter?.id === routerId) dispatch({ type: "SET_ACTIVE_ROUTER", payload: updatedRouter });
      toast.success("Router reboot initiated");
    } catch (error) {
      toast.error("Failed to reboot router");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const restoreSessions = async (routerId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post(`/api/network_management/routers/${routerId}/restore-sessions/`);
      toast.success(response.data.message);
      fetchHotspotUsers(routerId);
    } catch (error) {
      toast.error("Failed to restore sessions");
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

  const activateUserOnRouter = async (routerId, mac, planId, clientId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.post(`/api/network_management/routers/${routerId}/activate-user/`, {
        mac,
        plan_id: planId,
        client_id: clientId,
      });
      toast.success("User activated on router");
      fetchHotspotUsers(routerId);
    } catch (error) {
      toast.error("Failed to activate user");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const viewUserSessionHistory = async (user) => {
    dispatch({ type: "SET_SELECTED_USER", payload: user });
    await fetchSessionHistory(user.id);
    dispatch({ type: "TOGGLE_MODAL", modal: "sessionHistory" });
  };

  const StatsCard = ({ title, value, icon, unit = "", color = "bg-blue-500" }) => (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const HealthIndicator = ({ status, responseTime }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        status === "online" ? "bg-green-500" : "bg-red-500"
      }`} />
      <span className="text-sm">{status}</span>
      {responseTime && (
        <span className="text-xs text-gray-500">({responseTime}s)</span>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 text-gray-900 font-sans">
      <ToastContainer position="top-right" autoClose={3000} theme="light" pauseOnHover newestOnTop />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <Server className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Router Management</h1>
            <p className="text-sm text-gray-500">
              {routers.length} routers • {routers.filter(r => r.status === "connected").length} online
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })} 
            label="Add Router" 
            icon={<Plus />} 
            color="bg-indigo-600 hover:bg-indigo-700" 
          />
          <Button 
            onClick={fetchHealthStats} 
            label="Health Check" 
            icon={<Activity />} 
            color="bg-green-600 hover:bg-green-700" 
          />
        </div>
      </header>

      {/* Health Status Overview */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Routers" 
          value={routers.length} 
          icon={<Server className="w-6 h-6" />} 
          color="bg-indigo-500" 
        />
        <StatsCard 
          title="Online Routers" 
          value={routers.filter(r => r.status === "connected").length} 
          icon={<Wifi className="w-6 h-6" />} 
          color="bg-green-500" 
        />
        <StatsCard 
          title="Active Users" 
          value={hotspotUsers.filter(u => u.active).length} 
          icon={<Users className="w-6 h-6" />} 
          color="bg-blue-500" 
        />
        <StatsCard 
          title="Data Used" 
          value={formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0)).split(' ')[0]} 
          unit={formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0)).split(' ')[1]}
          icon={<Download className="w-6 h-6" />} 
          color="bg-purple-500" 
        />
      </section>

      {/* Router List */}
      <section className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Wifi className="w-5 h-5 mr-2 text-indigo-600" /> Routers
          </h2>
          <Button 
            onClick={fetchRouters} 
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />} 
            color="bg-gray-200 hover:bg-gray-300" 
            compact 
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <ThreeDots color="#6366F1" height={50} width={50} />
          </div>
        ) : routers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No routers found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {routers.map(router => (
              <motion.div
                key={router.id}
                onClick={() => dispatch({ type: "SET_ACTIVE_ROUTER", payload: router })}
                whileHover={{ scale: 1.03 }}
                className={`p-4 rounded-lg cursor-pointer bg-white hover:bg-gray-50 border ${
                  activeRouter?.id === router.id ? "border-2 border-indigo-500" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getRouterStatusIcon(router.status)}
                    <span className={`px-2 py-1 rounded-full text-xs ${getRouterStatusColor(router.status)}`}>
                      {router.status}
                    </span>
                    {router.is_default && (
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600">
                        Default
                      </span>
                    )}
                  </div>
                  {router.captive_portal_enabled && (
                    <Globe className="w-4 h-4 text-green-500" />
                  )}
                </div>
                
                <div className="mb-2">
                  <p className="font-medium text-gray-900 truncate">{router.name}</p>
                  <p className="text-xs text-gray-500">{router.type} • {router.ip}:{router.port}</p>
                  {router.location && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {router.location}
                    </p>
                  )}
                </div>

                {expandedRouter === router.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    className="mt-2 space-y-2"
                  >
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" }); dispatch({ type: "UPDATE_ROUTER_FORM", payload: router }); }} 
                        label="Edit" 
                        icon={<Edit className="w-3 h-3" />} 
                        color="bg-indigo-600 hover:bg-indigo-700" 
                        compact 
                      />
                      <Button 
                        onClick={e => { e.stopPropagation(); deleteRouter(router.id); }} 
                        label="Delete" 
                        icon={<Trash2 className="w-3 h-3" />} 
                        color="bg-red-600 hover:bg-red-700" 
                        compact 
                      />
                      <Button 
                        onClick={e => { e.stopPropagation(); router.status === "connected" ? disconnectRouter(router.id) : connectToRouter(router.id); }} 
                        label={router.status === "connected" ? "Disconnect" : "Connect"} 
                        icon={router.status === "connected" ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />} 
                        color={router.status === "connected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} 
                        compact 
                      />
                      {router.status === "connected" && (
                        <Button 
                          onClick={e => { e.stopPropagation(); rebootRouter(router.id); }} 
                          label="Reboot" 
                          icon={<Zap className="w-3 h-3" />} 
                          color="bg-yellow-600 hover:bg-yellow-700" 
                          compact 
                        />
                      )}
                    </div>
                  </motion.div>
                )}
                <button 
                  onClick={e => { e.stopPropagation(); dispatch({ type: "TOGGLE_ROUTER_EXPANDED", id: router.id }); }} 
                  className="w-full mt-2 text-gray-500 hover:text-gray-700 text-xs flex justify-center"
                >
                  {expandedRouter === router.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Router Dashboard */}
      {activeRouter && (
        <>
          <section className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center mb-2">
                  <Server className="w-5 h-5 mr-2 text-indigo-600" /> 
                  {activeRouter.name} ({activeRouter.type})
                </h2>
                <p className="text-sm text-gray-500">{activeRouter.ip}:{activeRouter.port} • {activeRouter.location}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Button 
                  onClick={() => activeRouter.status === "connected" ? disconnectRouter(activeRouter.id) : connectToRouter(activeRouter.id)} 
                  label={activeRouter.status === "connected" ? "Disconnect" : "Connect"} 
                  icon={activeRouter.status === "connected" ? <LogOut /> : <LogIn />} 
                  color={activeRouter.status === "connected" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} 
                />
                <Button 
                  onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "hotspotConfig" })} 
                  label="Configure Hotspot" 
                  icon={<Globe />} 
                  color="bg-indigo-600 hover:bg-indigo-700" 
                  disabled={activeRouter.status !== "connected"} 
                />
                <Button 
                  onClick={() => dispatch({ type: "TOGGLE_MODAL", modal: "users" })} 
                  label="Hotspot Users" 
                  icon={<Users />} 
                  color="bg-teal-600 hover:bg-teal-700" 
                  disabled={activeRouter.status !== "connected"} 
                />
                {activeRouter.status === "connected" && (
                  <Button 
                    onClick={() => restoreSessions(activeRouter.id)} 
                    label="Restore Sessions" 
                    icon={<RotateCcw />} 
                    color="bg-blue-600 hover:bg-blue-700" 
                  />
                )}
              </div>
            </div>

            {/* Router Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {statsLoading ? (
                <div className="col-span-full flex justify-center py-4">
                  <ThreeDots color="#6366F1" height={40} width={40} />
                </div>
              ) : statsData.latest && Object.keys(statsData.latest).length > 0 ? (
                <>
                  <StatsCard 
                    title="CPU Usage" 
                    value={statsData.latest.cpu} 
                    unit="%" 
                    icon={<Activity className="w-6 h-6" />} 
                    color="bg-red-500" 
                  />
                  <StatsCard 
                    title="Memory Usage" 
                    value={statsData.latest.memory.toFixed(1)} 
                    unit="MB" 
                    icon={<Server className="w-6 h-6" />} 
                    color="bg-blue-500" 
                  />
                  <StatsCard 
                    title="Connected Clients" 
                    value={statsData.latest.clients} 
                    icon={<Users className="w-6 h-6" />} 
                    color="bg-green-500" 
                  />
                  <StatsCard 
                    title="Throughput" 
                    value={statsData.latest.throughput.toFixed(1)} 
                    unit="MB/s" 
                    icon={<Download className="w-6 h-6" />} 
                    color="bg-purple-500" 
                  />
                </>
              ) : (
                <div className="col-span-full text-center py-4 text-gray-500">
                  No stats available
                </div>
              )}
            </div>

            {/* Hotspot Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-indigo-600" /> Hotspot Status
              </h3>
              {activeRouter.status === "connected" ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Active Users</p>
                    <p className="text-lg font-bold text-gray-900">{hotspotUsers.filter(u => u.active).length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Users</p>
                    <p className="text-lg font-bold text-gray-900">{hotspotUsers.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Data Used</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatBytes(hotspotUsers.reduce((sum, user) => sum + user.data_used, 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="text-lg font-bold text-gray-900">{timeSince(activeRouter.last_seen)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">Router must be connected to manage Hotspot</p>
              )}
            </div>
          </section>

          {/* Health Status */}
          <section className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" /> Router Health Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthStats.filter(stat => stat.router === activeRouter.id).map((stat, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Check</span>
                    <HealthIndicator status={stat.status} responseTime={stat.response_time} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {timeSince(stat.timestamp)}
                  </p>
                  {stat.error && (
                    <p className="text-sm text-red-500 mt-1 truncate">{stat.error}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Health Status Modal */}
      <Modal isOpen={modals.healthStats} title="System Health Status" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "healthStats" })} size="lg">
        <div className="space-y-4">
          {healthStats.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No health data available</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              {healthStats.map((stat, index) => (
                <div key={index} className="border-b border-gray-200 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{stat.router_name}</p>
                      <p className="text-sm text-gray-500">{stat.router_ip}</p>
                    </div>
                    <HealthIndicator status={stat.status} responseTime={stat.response_time} />
                  </div>
                  {stat.error && (
                    <p className="text-sm text-red-500 mt-1">{stat.error}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Last checked: {new Date(stat.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modals */}
      <Modal isOpen={modals.addRouter} title="Add Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "addRouter" })}>
        <div className="space-y-4">
          <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
          <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Type <span className="text-red-600">*</span></label>
            <select
              value={routerForm.type}
              onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
              {routerTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
          <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
          <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
          <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
          <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
          <CheckboxField 
            label="Set as default router" 
            checked={routerForm.is_default} 
            onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { is_default: e.target.checked } })} 
          />
          <CheckboxField 
            label="Enable captive portal" 
            checked={routerForm.captive_portal_enabled} 
            onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { captive_portal_enabled: e.target.checked } })} 
          />
          <Button onClick={addRouter} label={isLoading ? "Adding..." : "Add"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <Plus />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !routerForm.name || !routerForm.ip || !routerForm.type} fullWidth />
        </div>
      </Modal>

      <Modal isOpen={modals.editRouter} title="Edit Router" onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "editRouter" })}>
        <div className="space-y-4">
          <InputField label="Name" value={routerForm.name} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { name: e.target.value } })} placeholder="Office Router" required />
          <InputField label="IP" value={routerForm.ip} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { ip: e.target.value } })} placeholder="192.168.88.1" required />
          <div>
            <label className="block text-sm text-gray-700 mb-1">Type <span className="text-red-600">*</span></label>
            <select
              value={routerForm.type}
              onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { type: e.target.value } })}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-indigo-500"
            >
              {routerTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
          <InputField label="Port" type="number" value={routerForm.port} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { port: e.target.value } })} placeholder="8728" required />
          <InputField label="Username" value={routerForm.username} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { username: e.target.value } })} placeholder="admin" />
          <InputField label="Password" type="password" value={routerForm.password} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { password: e.target.value } })} placeholder="••••••••" />
          <InputField label="Location" value={routerForm.location} onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { location: e.target.value } })} placeholder="Main Office" />
          <CheckboxField 
            label="Set as default router" 
            checked={routerForm.is_default} 
            onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { is_default: e.target.checked } })} 
          />
          <CheckboxField 
            label="Enable captive portal" 
            checked={routerForm.captive_portal_enabled} 
            onChange={e => dispatch({ type: "UPDATE_ROUTER_FORM", payload: { captive_portal_enabled: e.target.checked } })} 
          />
          <div className="flex gap-2">
            <Button onClick={() => updateRouter(activeRouter.id)} label={isLoading ? "Saving..." : "Save"} icon={isLoading ? <ThreeDots color="#fff" height={20} width={40} /> : <CheckCircle />} color="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !routerForm.name || !routerForm.ip || !routerForm.type} fullWidth />
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
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Remaining Time</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Data Used</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Status</th>
                    <th className="px-4 py-2 text-right text-xs text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hotspotUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{user.client?.user?.username || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{user.client?.user?.phone_number || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{user.plan?.name || "N/A"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 font-mono">{user.mac}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-blue-500" />
                          {formatTime(user.remaining_time)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{formatBytes(user.data_used)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right space-x-2">
                        <Button 
                          onClick={() => viewUserSessionHistory(user)} 
                          label="History" 
                          icon={<History className="w-3 h-3" />} 
                          color="bg-blue-600 hover:bg-blue-700" 
                          compact 
                        />
                        {user.active && (
                          <Button 
                            onClick={() => disconnectHotspotUser(user.id)} 
                            label="Disconnect" 
                            icon={<LogOut className="w-3 h-3" />} 
                            color="bg-red-600 hover:bg-red-700" 
                            compact 
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={modals.sessionHistory} title={`Session History - ${selectedUser?.client?.user?.username || 'User'}`} onClose={() => dispatch({ type: "TOGGLE_MODAL", modal: "sessionHistory" })} size="lg">
        <div className="space-y-4">
          {sessionHistory.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No session history found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Router</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Start Time</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">End Time</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Duration</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Data Used</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-700">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessionHistory.map(session => (
                    <tr key={session.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{session.router?.name || 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{new Date(session.start_time).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{session.end_time ? new Date(session.end_time).toLocaleString() : 'Active'}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{formatTime(session.duration)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{formatBytes(session.data_used)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 capitalize">{session.disconnected_reason?.replace(/_/g, ' ') || 'Unknown'}</td>
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
          className={`bg-white p-4 rounded-lg ${size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-4xl" : "max-w-xl"} w-full max-h-[90vh] overflow-y-auto`}
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

const CheckboxField = ({ label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
    <label className="ml-2 block text-sm text-gray-700">{label}</label>
  </div>
);

export default RouterManagement;