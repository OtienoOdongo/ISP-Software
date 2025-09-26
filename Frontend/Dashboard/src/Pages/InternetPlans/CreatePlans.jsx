

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
//   Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer,
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../api"

// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// const initialFormState = {
//   planType: "Paid", name: "", price: "", active: true,
//   downloadSpeed: { value: "", unit: "Mbps" }, uploadSpeed: { value: "", unit: "Mbps" },
//   expiry: { value: "", unit: "Days" }, dataLimit: { value: "", unit: "GB" },
//   usageLimit: { value: "", unit: "Hours" }, description: "", category: "Residential",
//   purchases: 0, features: [], restrictions: [], createdAt: new Date().toISOString().split("T")[0],
//   client_sessions: {},
// };

// const speedUnits = ["Kbps", "Mbps", "Gbps"];
// const expiryUnits = ["Days", "Months"];
// const dataUnits = ["GB", "TB", "Unlimited"];
// const usageUnits = ["Hours", "Unlimited"];
// const categories = ["Residential", "Business", "Promotional", "Enterprise"];
// const planTypes = ["Paid", "Free Trial"];
// const featuresOptions = [
//   "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
//   "24/7 Support", "Low Latency", "Prepaid Access",
// ];
// const restrictionsOptions = [
//   "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
//   "Rural Use Only", "Requires Signal Booster",
// ];

// const usageLimitPresets = [
//   { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: <Gift className="w-4 h-4 text-purple-600" /> },
//   { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: <Home className="w-4 h-4 text-teal-600" /> },
//   { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
//   { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: <Calendar className="w-4 h-4 text-indigo-600" /> },
//   { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: <Server className="w-4 h-4 text-blue-600" /> },
// ];

// const CreatePlans = () => {
//   const { form, setForm, handleChange, handleNestedChange } = useForm(initialFormState);
//   const [plans, setPlans] = useState([]);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isFetchingSubs, setIsFetchingSubs] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);

//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         const normalizedPlans = plansData.map((plan) => ({
//           ...initialFormState,
//           id: plan.id,
//           planType: plan.planType || plan.plan_type,
//           name: plan.name,
//           price: plan.price.toString(),
//           active: plan.active,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           description: plan.description,
//           category: plan.category,
//           purchases: plan.purchases,
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           createdAt: plan.created_at || plan.createdAt,
//           client_sessions: plan.client_sessions || {},
//         }));
//         setPlans(normalizedPlans);
//       } catch (error) {
//         console.error("Error fetching plans:", error);
//         toast.error("Failed to load plans from server.");
//         setPlans([]);
//       } finally {
//         setIsFetching(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   useEffect(() => {
//     const fetchSubscriptions = async () => {
//       setIsFetchingSubs(true);
//       try {
//         const response = await api.get("/api/internet_plans/subscriptions/");
//         const subsData = response.data;
//         if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
//         setSubscriptions(subsData);
//       } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         toast.error("Failed to load subscriptions from server.");
//         setSubscriptions([]);
//       } finally {
//         setIsFetchingSubs(false);
//       }
//     };
//     if (viewMode === "subscriptions") {
//       fetchSubscriptions();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       console.log("Adding feature:", newFeature);
//       setForm((prev) => {
//         const updatedFeatures = [...prev.features, newFeature];
//         console.log("Updated features:", updatedFeatures);
//         return { ...prev, features: updatedFeatures };
//       });
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       console.log("Adding restriction:", newRestriction);
//       setForm((prev) => {
//         const updatedRestrictions = [...prev.restrictions, newRestriction];
//         console.log("Updated restrictions:", updatedRestrictions);
//         return { ...prev, restrictions: updatedRestrictions };
//       });
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     console.log(`Removing ${list} item:`, item);
//     setForm((prev) => {
//       const updatedList = prev[list].filter((i) => i !== item);
//       console.log(`Updated ${list}:`, updatedList);
//       return { ...prev, [list]: updatedList };
//     });
//   };

//   const validateAndSavePlan = async () => {
//     const requiredFields = [
//       !form.planType && "Plan Type", !form.name && "Plan Name", !form.category && "Category",
//       form.planType === "Paid" && (!form.price || form.price === "") && "Price",
//       !form.downloadSpeed.value && "Download Speed", !form.uploadSpeed.value && "Upload Speed",
//       !form.expiry.value && "Expiry Duration", !form.dataLimit.value && "Data Limit",
//       !form.usageLimit.value && "Usage Limit", !form.description && "Description",
//     ].filter(Boolean);

//     if (requiredFields.length > 0) {
//       toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
//       return;
//     }

//     if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
//       toast.error("Price must be a positive number for paid plans.");
//       return;
//     }

//     const downloadSpeed = parseFloat(form.downloadSpeed.value);
//     const uploadSpeed = parseFloat(form.uploadSpeed.value);
//     const expiry = parseInt(form.expiry.value, 10);

//     if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
//       toast.error("Download speed must be a positive number.");
//       return;
//     }
//     if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
//       toast.error("Upload speed must be a positive number.");
//       return;
//     }
//     if (isNaN(expiry) || expiry <= 0) {
//       toast.error("Expiry duration must be a positive integer.");
//       return;
//     }

//     if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
//       toast.error("When data unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }
//     if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
//       toast.error("When usage unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }

//     const planData = {
//       planType: form.planType,
//       name: form.name,
//       price: parseFloat(form.price) || 0,
//       active: form.active,
//       downloadSpeed: form.downloadSpeed,
//       uploadSpeed: form.uploadSpeed,
//       expiry: form.expiry,
//       dataLimit: form.dataLimit,
//       usageLimit: form.usageLimit,
//       description: form.description,
//       category: form.category,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       features: form.features,
//       restrictions: form.restrictions,
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//     };

//     try {
//       console.log("Sending plan data to API:", JSON.stringify(planData, null, 2));
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
//         toast.success(`Updated plan: ${planData.name}`);
//       } else {
//         response = await api.post("/api/internet_plans/", planData);
//         setPlans((prev) => [...prev, response.data]);
//         toast.success(`Created plan: ${planData.name}`);
//       }
//       console.log("API response:", JSON.stringify(response.data, null, 2));
//       setForm(deepClone(initialFormState));
//       setEditingPlan(null);
//       setViewMode("list");
//     } catch (error) {
//       console.error("Error saving plan:", error.response?.data || error.message);
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   const deletePlan = async (planId, planName) => {
//     if (window.confirm(`Delete "${planName}"?`)) {
//       try {
//         await api.delete(`/api/internet_plans/${planId}/`);
//         setPlans((prev) => prev.filter((p) => p.id !== planId));
//         if (selectedPlan && selectedPlan.id === planId) {
//           setSelectedPlan(null);
//           setViewMode("list");
//         }
//         toast.success(`Deleted plan: ${planName}`);
//       } catch (error) {
//         console.error("Error deleting plan:", error);
//         toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
//       }
//     }
//   };

//   const sortedPlans = [...plans]
//     .filter(
//       (plan) =>
//         (filterCategory === "All" || plan.category === filterCategory) &&
//         (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//     .sort((a, b) => {
//       let aValue, bValue;
//       if (sortConfig.key.includes(".")) {
//         const [parent, child] = sortConfig.key.split(".");
//         aValue = a[parent] ? a[parent][child] : "";
//         bValue = b[parent] ? b[parent][child] : "";
//       } else {
//         aValue = a[sortConfig.key] || "";
//         bValue = b[sortConfig.key] || "";
//       }
//       if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
//         aValue = parseFloat(aValue);
//         bValue = parseFloat(bValue);
//       }
//       return sortConfig.direction === "asc"
//         ? typeof aValue === "string"
//           ? aValue.localeCompare(bValue)
//           : aValue - bValue
//         : typeof bValue === "string"
//           ? bValue.localeCompare(aValue)
//           : bValue - aValue;
//     });

//   const requestSort = (key) => {
//     setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
//         ))}
//         <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
//       </div>
//     );
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       Residential: <Home className="w-4 h-4 text-teal-600" />,
//       Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Gift className="w-4 h-4 text-purple-600" />,
//       Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
//     };
//     return icons[category] || null;
//   };

//   const handleUsagePresetSelect = (hours) => {
//     handleNestedChange("usageLimit", "value", hours);
//     handleNestedChange("usageLimit", "unit", "Hours");
//     setIsUsageMenuOpen(false);
//   };

//   const renderPlanList = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ConnectSphere Packages</h2>
//         <div className="flex space-x-4">
//           <motion.button
//             onClick={() => setViewMode("subscriptions")}
//             className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Users className="w-5 h-5 mr-2" /> View Subscriptions
//           </motion.button>
//           <motion.button
//             onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
//             className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Plus className="w-5 h-5 mr-2" /> New Plan
//           </motion.button>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <select
//           value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//         </select>
//         <input
//           type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex-1 bg-white"
//         />
//       </div>

//       {isFetching ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : plans.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Plans Available</h3>
//           <p className="text-gray-600 mt-2">Create a new plan to get started!</p>
//           <motion.button
//             onClick={() => setViewMode("form")}
//             className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             Create Plan
//           </motion.button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   { key: "name", label: "Name" }, { key: "planType", label: "Type" },
//                   { key: "category", label: "Category" }, { key: "price", label: "Price" },
//                   { key: "purchases", label: "Subscribers" }, { key: "actions", label: "Actions" },
//                 ].map((column) => (
//                   <th
//                     key={column.key} onClick={() => column.key !== "actions" && requestSort(column.key)}
//                     className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""}`}
//                   >
//                     <div className="flex items-center">
//                       {column.label}
//                       {sortConfig.key === column.key && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />)}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedPlans.map((plan) => (
//                 <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">{getCategoryIcon(plan.category)}<span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span></div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><Users className="w-4 h-4 text-gray-400 mr-2" />{plan.purchases} {renderStars(plan.purchases)}</div></td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-4">
//                       <motion.button onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} className="focus:outline-none" whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
//                       </motion.button>
//                       <motion.button onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} className="focus:outline-none" whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           const copiedPlan = { ...deepClone(plan), name: `Copy of ${plan.name}`, id: null, purchases: 0, client_sessions: {}, createdAt: new Date().toISOString().split("T")[0] };
//                           setForm(copiedPlan); setEditingPlan(null); setViewMode("form");
//                         }}
//                         className="focus:outline-none" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
//                       >
//                         <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
//                       </motion.button>
//                       <motion.button onClick={() => deletePlan(plan.id, plan.name)} className="focus:outline-none" whileHover={{ x: [0, -2, 2, -2, 0] }} transition={{ duration: 0.3 }}>
//                         <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
//                       </motion.button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderPlanForm = () => (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{editingPlan ? "Edit Plan" : "New Plan"}</h2>
//         <motion.button onClick={() => { setViewMode("list"); setForm(deepClone(initialFormState)); setEditingPlan(null); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       <div className="space-y-8">
//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Plan Type <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Paid or Free Trial</span></label>
//                 <select name="planType" value={form.planType || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                   <option value="" disabled>Select Plan Type</option>
//                   {planTypes.map((type) => <option key={type} value={type}>{type}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Unique plan identifier</span></label>
//                 <input name="name" value={form.name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., Rural Wi-Fi Pro" required />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Target user group</span></label>
//                 <select name="category" value={form.category || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                   <option value="" disabled>Select Category</option>
//                   {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings</span></label>
//                 <input
//                   type="number" name="price" value={form.price || ""} onChange={handleChange} disabled={form.planType !== "Paid"}
//                   className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${form.planType !== "Paid" ? "bg-gray-100 cursor-not-allowed" : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"}`}
//                   placeholder="e.g., 29.99" step="0.01" min="0" required={form.planType === "Paid"}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center">
//               <label className="block text-sm font-medium text-gray-700 mr-4">Active<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Enable or disable plan</span></label>
//               <div onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                 <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.active ? "translate-x-6" : "translate-x-1"}`} />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Download Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)</span></label>
//                 <input 
//                   type="number" 
//                   value={form.downloadSpeed.value || ""} 
//                   onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   min="0.01" 
//                   step="0.01" 
//                   placeholder="e.g., 10" 
//                   required 
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                 <select value={form.downloadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
//                 <input 
//                   type="number" 
//                   value={form.uploadSpeed.value || ""} 
//                   onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   min="0.01" 
//                   step="0.01" 
//                   placeholder="e.g., 2" 
//                   required 
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                 <select value={form.uploadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
//                 <input 
//                   type="number" 
//                   value={form.expiry.value || ""} 
//                   onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   min="1" 
//                   step="1" 
//                   placeholder="e.g., 30" 
//                   required 
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration type</span></label>
//                 <select value={form.expiry.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB or Unlimited)</span></label>
//                 <input type="text" value={form.dataLimit.value || ""} onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 100 or Unlimited" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
//                 <select value={form.dataLimit.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours or Unlimited)</span></label>
//                 <div className="mt-1 flex items-center">
//                   <input type="text" value={form.usageLimit.value || ""} onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 240 or Unlimited" required />
//                   <motion.button onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)} className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none" whileHover={{ scale: 1.05 }}>
//                     <Timer className="w-5 h-5" />
//                   </motion.button>
//                 </div>
//                 <AnimatePresence>
//                   {isUsageMenuOpen && (
//                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//                       {usageLimitPresets.map((preset) => (
//                         <div key={preset.hours} onClick={() => handleUsagePresetSelect(preset.hours)} className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors">
//                           {preset.icon}
//                           <div className="ml-2">
//                             <p className="text-sm font-medium text-gray-900">{preset.hours} Hours ({preset.days} Days)</p>
//                             <p className="text-xs text-gray-500">{preset.description}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Time measurement</span></label>
//                 <select value={form.usageLimit.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {usageUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
//           <div className="text-xs text-gray-500 flex items-center mb-2"><Info className="w-3 h-3 mr-1" /> Detailed plan info for users</div>
//           <MDEditor value={form.description || ""} onChange={(value) => setForm((prev) => ({ ...prev, description: value || "" }))} preview="edit" height={200} className="shadow-sm" />
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Features<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Benefits included in the plan</span></label>
//               <div className="mt-1 flex gap-3">
//                 <select value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   <option value="">Select a feature</option>
//                   {featuresOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
//                 </select>
//                 <motion.button onClick={addFeature} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {form.features.map((feature) => (
//                   <li key={feature} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
//                     {feature}
//                     <motion.button onClick={() => removeListItem("features", feature)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Restrictions<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limitations or conditions</span></label>
//               <div className="mt-1 flex gap-3">
//                 <select value={newRestriction} onChange={(e) => setNewRestriction(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   <option value="">Select a restriction</option>
//                   {restrictionsOptions.map((restriction) => <option key={restriction} value={restriction}>{restriction}</option>)}
//                 </select>
//                 <motion.button onClick={addRestriction} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {form.restrictions.map((restriction) => (
//                   <li key={restriction} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
//                     {restriction}
//                     <motion.button onClick={() => removeListItem("restrictions", restriction)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <motion.button onClick={validateAndSavePlan} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//             <Save className="w-5 h-5 mr-2" /> Save Plan
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => {
//     if (!selectedPlan) { setViewMode("list"); return null; }
//     return (
//       <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{selectedPlan.name || "Unnamed Plan"}</h2>
//             <motion.button onClick={() => { setSelectedPlan(null); setViewMode("list"); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}><X className="w-8 h-8" /></motion.button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Zap className="w-6 h-6 text-teal-600 mr-2" /> Overview</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> {selectedPlan.planType === "Paid" ? <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span> : <span className="text-green-600 font-semibold">Free</span>}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>{selectedPlan.active ? "Active" : "Inactive"}</span></p>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><Download className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Download:</span> {selectedPlan.downloadSpeed.value === "Unlimited" ? "Unlimited" : (selectedPlan.downloadSpeed.value || "N/A")} {selectedPlan.downloadSpeed.unit || ""}</p>
//                 <p className="text-gray-700"><Upload className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Upload:</span> {selectedPlan.uploadSpeed.value === "Unlimited" ? "Unlimited" : (selectedPlan.uploadSpeed.value || "N/A")} {selectedPlan.uploadSpeed.unit || ""}</p>
//                 <p className="text-gray-700"><Calendar className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Expiry:</span> {selectedPlan.expiry.value || "N/A"} {selectedPlan.expiry.unit || ""}</p>
//                 <p className="text-gray-700"><Shield className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Data Limit:</span> {selectedPlan.dataLimit.value === "Unlimited" ? "Unlimited" : (selectedPlan.dataLimit.value || "N/A")} {selectedPlan.dataLimit.unit === "Unlimited" ? "" : selectedPlan.dataLimit.unit || ""}</p>
//                 <p className="text-gray-700"><Clock className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Usage Limit:</span> {selectedPlan.usageLimit.value === "Unlimited" ? "Unlimited" : (selectedPlan.usageLimit.value || "N/A")} {selectedPlan.usageLimit.unit === "Unlimited" ? "" : selectedPlan.usageLimit.unit || ""}
//                   {selectedPlan.usageLimit.unit === "Hours" && selectedPlan.usageLimit.value && selectedPlan.usageLimit.value !== "Unlimited" && <span className="text-xs text-gray-500 ml-2">(~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)</span>}
//                 </p>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Gift className="w-6 h-6 text-teal-600 mr-2" /> Description</h3>
//               <div className="prose prose-sm text-gray-700"><MDEditor.Markdown source={selectedPlan.description || "No description available"} /></div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Star className="w-6 h-6 text-teal-600 mr-2" /> Features</h3>
//                   <ul className="space-y-2">
//                     {selectedPlan.features.length > 0 ? selectedPlan.features.map((feature) => (
//                       <li key={feature} className="text-gray-700 flex items-center"><Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions</h3>
//                   <ul className="space-y-2">
//                     {selectedPlan.restrictions.length > 0 ? selectedPlan.restrictions.map((restriction) => (
//                       <li key={restriction} className="text-gray-700 flex items-center"><Shield className="w-4 h-4 text-teal-600 mr-2" /> {restriction}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Users className="w-6 h-6 text-teal-600 mr-2" /> Stats</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Subscribers:</span> {selectedPlan.purchases || 0} {renderStars(selectedPlan.purchases)}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Created At:</span> {selectedPlan.createdAt ? new Date(selectedPlan.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p>
//               </div>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   const renderSubscriptions = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Subscriptions</h2>
//         <motion.button
//           onClick={() => setViewMode("list")}
//           className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Wifi className="w-5 h-5 mr-2" /> Back to Plans
//         </motion.button>
//       </div>

//       {isFetchingSubs ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : subscriptions.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Subscriptions</h3>
//           <p className="text-gray-600 mt-2">No active subscriptions yet.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Client</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Active</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Transaction</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {subscriptions.map((sub) => (
//                 <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.client.user.name || sub.client.user.phonenumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.internet_plan.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sub.start_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sub.end_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${sub.is_active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>
//                       {sub.is_active ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.transaction ? sub.transaction.reference : "Free Plan"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPlanList()}</motion.div>}
//         {viewMode === "form" && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanForm()}</motion.div>}
//         {viewMode === "details" && <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanDetails()}</motion.div>}
//         {viewMode === "subscriptions" && <motion.div key="subscriptions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderSubscriptions()}</motion.div>}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;








// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
//   Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer, Crown,
//   Cpu, HardDrive, Network, BarChart3, Gauge, Cable, UserCheck, Cloud, CloudRain, CloudSnow,
//   CloudDrizzle, CloudLightning, CloudOff, Router, Check, Filter
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../api"

// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// const initialFormState = {
//   planType: "Paid", name: "", price: "", active: true,
//   downloadSpeed: { value: "", unit: "Mbps" }, uploadSpeed: { value: "", unit: "Mbps" },
//   expiry: { value: "", unit: "Days" }, dataLimit: { value: "", unit: "GB" },
//   usageLimit: { value: "", unit: "Hours" }, description: "", category: "Residential",
//   purchases: 0, features: [], restrictions: [], createdAt: new Date().toISOString().split("T")[0],
//   client_sessions: {},
//   bandwidth_limit: 0,
//   concurrent_connections: 1,
//   priority_level: 4,
//   router_specific: false,
//   allowed_routers_ids: [],
//   FUP_policy: "",
//   FUP_threshold: 80,
// };

// const speedUnits = ["Kbps", "Mbps", "Gbps"];
// const expiryUnits = ["Days", "Months"];
// const dataUnits = ["GB", "TB", "Unlimited"];
// const usageUnits = ["Hours", "Unlimited"];
// const categories = ["Residential", "Business", "Promotional", "Enterprise"];
// const planTypes = ["Paid", "Free Trial"];
// const featuresOptions = [
//   "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
//   "24/7 Support", "Low Latency", "Prepaid Access", "High Priority Bandwidth", 
//   "Multiple Device Support", "Static IP Address", "VPN Access", "Gaming Optimized", 
//   "Streaming Optimized", "No Throttling", "Premium Routing"
// ];
// const restrictionsOptions = [
//   "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
//   "Rural Use Only", "Requires Signal Booster", "Speed may be reduced after fair use threshold", 
//   "Limited to specific router locations", "No torrenting or P2P allowed", 
//   "Streaming limited to SD quality", "Business use only", "Non-transferable", 
//   "Subject to fair usage policy", "Speed varies by location"
// ];

// const priorityOptions = [
//   { value: 1, label: "Lowest", icon: <CloudOff className="w-4 h-4" />, color: "text-gray-500" },
//   { value: 2, label: "Low", icon: <CloudDrizzle className="w-4 h-4" />, color: "text-blue-500" },
//   { value: 3, label: "Medium", icon: <CloudRain className="w-4 h-4" />, color: "text-green-500" },
//   { value: 4, label: "High", icon: <Cloud className="w-4 h-4" />, color: "text-yellow-500" },
//   { value: 5, label: "Highest", icon: <CloudSnow className="w-4 h-4" />, color: "text-orange-500" },
//   { value: 6, label: "Critical", icon: <CloudLightning className="w-4 h-4" />, color: "text-red-500" },
//   { value: 7, label: "Premium", icon: <Server className="w-4 h-4" />, color: "text-purple-500" },
//   { value: 8, label: "VIP", icon: <Crown className="w-4 h-4" />, color: "text-pink-500" },
// ];

// const bandwidthPresets = [
//   { value: 1024, label: "1 Mbps" },
//   { value: 2048, label: "2 Mbps" },
//   { value: 5120, label: "5 Mbps" },
//   { value: 10240, label: "10 Mbps" },
//   { value: 20480, label: "20 Mbps" },
//   { value: 51200, label: "50 Mbps" },
//   { value: 102400, label: "100 Mbps" },
//   { value: 0, label: "Unlimited" },
// ];

// const usageLimitPresets = [
//   { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: <Gift className="w-4 h-4 text-purple-600" /> },
//   { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: <Home className="w-4 h-4 text-teal-600" /> },
//   { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
//   { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: <Calendar className="w-4 h-4 text-indigo-600" /> },
//   { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: <Server className="w-4 h-4 text-blue-600" /> },
// ];

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const formatTime = (seconds) => {
//   if (seconds <= 0) return "Expired";
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

// const formatBandwidth = (kbps) => {
//   if (kbps === 0) return "Unlimited";
//   if (kbps >= 1000) {
//     return `${(kbps / 1000).toFixed(1)} Mbps`;
//   }
//   return `${kbps} Kbps`;
// };

// const CreatePlans = () => {
//   const { form, setForm, handleChange, handleNestedChange } = useForm(initialFormState);
//   const [plans, setPlans] = useState([]);
//   const [routers, setRouters] = useState([]);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isFetchingSubs, setIsFetchingSubs] = useState(false);
//   const [isFetchingRouters, setIsFetchingRouters] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);
//   const [isBandwidthMenuOpen, setIsBandwidthMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [subscriptionFilters, setSubscriptionFilters] = useState({
//     status: "",
//     plan: "",
//     router: ""
//   });

//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         const normalizedPlans = plansData.map((plan) => ({
//           ...initialFormState,
//           id: plan.id,
//           planType: plan.planType || plan.plan_type,
//           name: plan.name,
//           price: plan.price.toString(),
//           active: plan.active,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           description: plan.description,
//           category: plan.category,
//           purchases: plan.purchases,
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           createdAt: plan.created_at || plan.createdAt,
//           client_sessions: plan.client_sessions || {},
//           bandwidth_limit: plan.bandwidth_limit || 0,
//           concurrent_connections: plan.concurrent_connections || 1,
//           priority_level: plan.priority_level || 4,
//           router_specific: plan.router_specific || false,
//           allowed_routers_ids: plan.allowed_routers_ids || [],
//           FUP_policy: plan.FUP_policy || "",
//           FUP_threshold: plan.FUP_threshold || 80,
//           bandwidth_limit_display: plan.bandwidth_limit_display || formatBandwidth(plan.bandwidth_limit || 0),
//           is_unlimited_data: plan.is_unlimited_data || false,
//           is_unlimited_time: plan.is_unlimited_time || false,
//         }));
//         setPlans(normalizedPlans);
//       } catch (error) {
//         console.error("Error fetching plans:", error);
//         toast.error("Failed to load plans from server.");
//         setPlans([]);
//       } finally {
//         setIsFetching(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   useEffect(() => {
//     const fetchRouters = async () => {
//       setIsFetchingRouters(true);
//       try {
//         const response = await api.get("/api/network_management/routers/");
//         setRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching routers:", error);
//         toast.error("Failed to load routers from server.");
//         setRouters([]);
//       } finally {
//         setIsFetchingRouters(false);
//       }
//     };
    
//     if (viewMode === "form" || viewMode === "subscriptions") {
//       fetchRouters();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchSubscriptions = async () => {
//       setIsFetchingSubs(true);
//       try {
//         let url = "/api/internet_plans/subscriptions/";
//         const params = new URLSearchParams();
        
//         if (subscriptionFilters.status) params.append('status', subscriptionFilters.status);
//         if (subscriptionFilters.plan) params.append('plan', subscriptionFilters.plan);
//         if (subscriptionFilters.router) params.append('router', subscriptionFilters.router);
        
//         if (params.toString()) url += `?${params.toString()}`;
        
//         const response = await api.get(url);
//         const subsData = response.data;
//         if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
//         setSubscriptions(subsData);
//       } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         toast.error("Failed to load subscriptions from server.");
//         setSubscriptions([]);
//       } finally {
//         setIsFetchingSubs(false);
//       }
//     };
//     if (viewMode === "subscriptions") {
//       fetchSubscriptions();
//     }
//   }, [viewMode, subscriptionFilters]);

//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => {
//         const updatedFeatures = [...prev.features, newFeature];
//         return { ...prev, features: updatedFeatures };
//       });
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => {
//         const updatedRestrictions = [...prev.restrictions, newRestriction];
//         return { ...prev, restrictions: updatedRestrictions };
//       });
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => {
//       const updatedList = prev[list].filter((i) => i !== item);
//       return { ...prev, [list]: updatedList };
//     });
//   };

//   const toggleRouterSelection = (routerId) => {
//     setForm((prev) => {
//       const currentRouters = [...prev.allowed_routers_ids];
//       const index = currentRouters.indexOf(routerId);
      
//       if (index > -1) {
//         currentRouters.splice(index, 1);
//       } else {
//         currentRouters.push(routerId);
//       }
      
//       return { ...prev, allowed_routers_ids: currentRouters };
//     });
//   };

//   const validateAndSavePlan = async () => {
//     const requiredFields = [
//       !form.planType && "Plan Type", !form.name && "Plan Name", !form.category && "Category",
//       form.planType === "Paid" && (!form.price || form.price === "") && "Price",
//       !form.downloadSpeed.value && "Download Speed", !form.uploadSpeed.value && "Upload Speed",
//       !form.expiry.value && "Expiry Duration", !form.dataLimit.value && "Data Limit",
//       !form.usageLimit.value && "Usage Limit", !form.description && "Description",
//     ].filter(Boolean);

//     if (requiredFields.length > 0) {
//       toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
//       return;
//     }

//     if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
//       toast.error("Price must be a positive number for paid plans.");
//       return;
//     }

//     const downloadSpeed = parseFloat(form.downloadSpeed.value);
//     const uploadSpeed = parseFloat(form.uploadSpeed.value);
//     const expiry = parseInt(form.expiry.value, 10);

//     if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
//       toast.error("Download speed must be a positive number.");
//       return;
//     }
//     if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
//       toast.error("Upload speed must be a positive number.");
//       return;
//     }
//     if (isNaN(expiry) || expiry <= 0) {
//       toast.error("Expiry duration must be a positive integer.");
//       return;
//     }

//     if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
//       toast.error("When data unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }
//     if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
//       toast.error("When usage unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }

//     const planData = {
//       planType: form.planType,
//       name: form.name,
//       price: parseFloat(form.price) || 0,
//       active: form.active,
//       downloadSpeed: form.downloadSpeed,
//       uploadSpeed: form.uploadSpeed,
//       expiry: form.expiry,
//       dataLimit: form.dataLimit,
//       usageLimit: form.usageLimit,
//       description: form.description,
//       category: form.category,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       features: form.features,
//       restrictions: form.restrictions,
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//       bandwidth_limit: form.bandwidth_limit,
//       concurrent_connections: form.concurrent_connections,
//       priority_level: form.priority_level,
//       router_specific: form.router_specific,
//       allowed_routers_ids: form.allowed_routers_ids,
//       FUP_policy: form.FUP_policy,
//       FUP_threshold: form.FUP_threshold,
//     };

//     try {
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
//         toast.success(`Updated plan: ${planData.name}`);
//       } else {
//         response = await api.post("/api/internet_plans/", planData);
//         setPlans((prev) => [...prev, response.data]);
//         toast.success(`Created plan: ${planData.name}`);
//       }
//       setForm(deepClone(initialFormState));
//       setEditingPlan(null);
//       setViewMode("list");
//     } catch (error) {
//       console.error("Error saving plan:", error.response?.data || error.message);
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   const deletePlan = async (planId, planName) => {
//     if (window.confirm(`Delete "${planName}"?`)) {
//       try {
//         await api.delete(`/api/internet_plans/${planId}/`);
//         setPlans((prev) => prev.filter((p) => p.id !== planId));
//         if (selectedPlan && selectedPlan.id === planId) {
//           setSelectedPlan(null);
//           setViewMode("list");
//         }
//         toast.success(`Deleted plan: ${planName}`);
//       } catch (error) {
//         console.error("Error deleting plan:", error);
//         toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
//       }
//     }
//   };

//   const sortedPlans = [...plans]
//     .filter(
//       (plan) =>
//         (filterCategory === "All" || plan.category === filterCategory) &&
//         (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//     .sort((a, b) => {
//       let aValue, bValue;
//       if (sortConfig.key.includes(".")) {
//         const [parent, child] = sortConfig.key.split(".");
//         aValue = a[parent] ? a[parent][child] : "";
//         bValue = b[parent] ? b[parent][child] : "";
//       } else {
//         aValue = a[sortConfig.key] || "";
//         bValue = b[sortConfig.key] || "";
//       }
//       if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
//         aValue = parseFloat(aValue);
//         bValue = parseFloat(bValue);
//       }
//       return sortConfig.direction === "asc"
//         ? typeof aValue === "string"
//           ? aValue.localeCompare(bValue)
//           : aValue - bValue
//         : typeof bValue === "string"
//           ? bValue.localeCompare(aValue)
//           : bValue - aValue;
//     });

//   const requestSort = (key) => {
//     setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
//         ))}
//         <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
//       </div>
//     );
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       Residential: <Home className="w-4 h-4 text-teal-600" />,
//       Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Gift className="w-4 h-4 text-purple-600" />,
//       Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
//     };
//     return icons[category] || null;
//   };

//   const handleUsagePresetSelect = (hours) => {
//     handleNestedChange("usageLimit", "value", hours);
//     handleNestedChange("usageLimit", "unit", "Hours");
//     setIsUsageMenuOpen(false);
//   };

//   const handleBandwidthPresetSelect = (value) => {
//     setForm((prev) => ({ ...prev, bandwidth_limit: value }));
//     setIsBandwidthMenuOpen(false);
//   };

//   const handleSubscriptionFilterChange = (filter, value) => {
//     setSubscriptionFilters((prev) => ({ ...prev, [filter]: value }));
//   };

//   const renderPlanList = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ConnectSphere Packages</h2>
//         <div className="flex space-x-4">
//           <motion.button
//             onClick={() => setViewMode("subscriptions")}
//             className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Users className="w-5 h-5 mr-2" /> View Subscriptions
//           </motion.button>
//           <motion.button
//             onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
//             className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Plus className="w-5 h-5 mr-2" /> New Plan
//           </motion.button>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <select
//           value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//         </select>
//         <input
//           type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex-1 bg-white"
//         />
//       </div>

//       {isFetching ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : plans.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Plans Available</h3>
//           <p className="text-gray-600 mt-2">Create a new plan to get started!</p>
//           <motion.button
//             onClick={() => setViewMode("form")}
//             className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             Create Plan
//           </motion.button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   { key: "name", label: "Name" }, { key: "planType", label: "Type" },
//                   { key: "category", label: "Category" }, { key: "price", label: "Price" },
//                   { key: "bandwidth_limit", label: "Bandwidth" }, { key: "purchases", label: "Subscribers" },
//                   { key: "actions", label: "Actions" },
//                 ].map((column) => (
//                   <th
//                     key={column.key} onClick={() => column.key !== "actions" && requestSort(column.key)}
//                     className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""}`}
//                   >
//                     <div className="flex items-center">
//                       {column.label}
//                       {sortConfig.key === column.key && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />)}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedPlans.map((plan) => (
//                 <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">{getCategoryIcon(plan.category)}<span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span></div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.bandwidth_limit_display}</td>
//                   <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><Users className="w-4 h-4 text-gray-400 mr-2" />{plan.purchases} {renderStars(plan.purchases)}</div></td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-4">
//                       <motion.button onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} className="focus:outline-none" whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
//                       </motion.button>
//                       <motion.button onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} className="focus:outline-none" whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           const copiedPlan = { ...deepClone(plan), name: `Copy of ${plan.name}`, id: null, purchases: 0, client_sessions: {}, createdAt: new Date().toISOString().split("T")[0] };
//                           setForm(copiedPlan); setEditingPlan(null); setViewMode("form");
//                         }}
//                         className="focus:outline-none" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
//                       >
//                         <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
//                       </motion.button>
//                       <motion.button onClick={() => deletePlan(plan.id, plan.name)} className="focus:outline-none" whileHover={{ x: [0, -2, 2, -2, 0] }} transition={{ duration: 0.3 }}>
//                         <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
//                       </motion.button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderPlanForm = () => (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{editingPlan ? "Edit Plan" : "New Plan"}</h2>
//         <motion.button onClick={() => { setViewMode("list"); setForm(deepClone(initialFormState)); setEditingPlan(null); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100">
//         <div className="flex space-x-2">
//           {["basic", "specifications", "advanced", "description", "features"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 activeTab === tab 
//                   ? "bg-teal-600 text-white" 
//                   : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-8">
//         {/* Basic Details Tab */}
//         {activeTab === "basic" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Plan Type <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Paid or Free Trial</span></label>
//                   <select name="planType" value={form.planType || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                     <option value="" disabled>Select Plan Type</option>
//                     {planTypes.map((type) => <option key={type} value={type}>{type}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Unique plan identifier</span></label>
//                   <input name="name" value={form.name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., Rural Wi-Fi Pro" required />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Target user group</span></label>
//                   <select name="category" value={form.category || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                     <option value="" disabled>Select Category</option>
//                     {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings</span></label>
//                   <input
//                     type="number" name="price" value={form.price || ""} onChange={handleChange} disabled={form.planType !== "Paid"}
//                     className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${form.planType !== "Paid" ? "bg-gray-100 cursor-not-allowed" : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"}`}
//                     placeholder="e.g., 29.99" step="0.01" min="0" required={form.planType === "Paid"}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <label className="block text-sm font-medium text-gray-700 mr-4">Active<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Enable or disable plan</span></label>
//                 <div onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.active ? "translate-x-6" : "translate-x-1"}`} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Specifications Tab */}
//         {activeTab === "specifications" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Download Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.downloadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 10" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                   <select value={form.downloadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.uploadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 2" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                   <select value={form.uploadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.expiry.value || ""} 
//                     onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="1" 
//                     step="1" 
//                     placeholder="e.g., 30" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration type</span></label>
//                   <select value={form.expiry.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB or Unlimited)</span></label>
//                   <input type="text" value={form.dataLimit.value || ""} onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 100 or Unlimited" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
//                   <select value={form.dataLimit.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours or Unlimited)</span></label>
//                   <div className="mt-1 flex items-center">
//                     <input type="text" value={form.usageLimit.value || ""} onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 240 or Unlimited" required />
//                     <motion.button onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)} className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none" whileHover={{ scale: 1.05 }}>
//                       <Timer className="w-5 h-5" />
//                     </motion.button>
//                   </div>
//                   <AnimatePresence>
//                     {isUsageMenuOpen && (
//                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//                         {usageLimitPresets.map((preset) => (
//                           <div key={preset.hours} onClick={() => handleUsagePresetSelect(preset.hours)} className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors">
//                             {preset.icon}
//                             <div className="ml-2">
//                               <p className="text-sm font-medium text-gray-900">{preset.hours} Hours ({preset.days} Days)</p>
//                               <p className="text-xs text-gray-500">{preset.description}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Time measurement</span></label>
//                   <select value={form.usageLimit.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {usageUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Advanced Settings Tab */}
//         {activeTab === "advanced" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Settings</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700">Bandwidth Limit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Maximum bandwidth for router QoS</span></label>
//                   <div className="mt-1 flex items-center">
//                     <input 
//                       type="number" 
//                       value={form.bandwidth_limit} 
//                       onChange={(e) => setForm((prev) => ({ ...prev, bandwidth_limit: parseInt(e.target.value) || 0 }))} 
//                       className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                       placeholder="e.g., 10240" 
//                     />
//                     <motion.button onClick={() => setIsBandwidthMenuOpen(!isBandwidthMenuOpen)} className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none" whileHover={{ scale: 1.05 }}>
//                       <Gauge className="w-5 h-5" />
//                     </motion.button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Current: {formatBandwidth(form.bandwidth_limit)}</p>
//                   <AnimatePresence>
//                     {isBandwidthMenuOpen && (
//                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//                         {bandwidthPresets.map((preset) => (
//                           <div key={preset.value} onClick={() => handleBandwidthPresetSelect(preset.value)} className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors">
//                             <div>
//                               <p className="text-sm font-medium text-gray-900">{preset.label}</p>
//                               <p className="text-xs text-gray-500">{preset.value === 0 ? "No limit" : `${preset.value} Kbps`}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Concurrent Connections<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max simultaneous devices</span></label>
//                   <input 
//                     type="number" 
//                     value={form.concurrent_connections} 
//                     onChange={(e) => setForm((prev) => ({ ...prev, concurrent_connections: parseInt(e.target.value) || 1 }))} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="1" 
//                     placeholder="e.g., 5" 
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Priority Level<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> QoS priority for network traffic</span></label>
//                   <select 
//                     value={form.priority_level} 
//                     onChange={(e) => setForm((prev) => ({ ...prev, priority_level: parseInt(e.target.value) }))} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   >
//                     {priorityOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="mt-2 flex items-center">
//                     {priorityOptions.find(opt => opt.value === form.priority_level)?.icon}
//                     <span className={`ml-2 text-sm ${priorityOptions.find(opt => opt.value === form.priority_level)?.color}`}>
//                       {priorityOptions.find(opt => opt.value === form.priority_level)?.label}
//                     </span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Fair Usage Policy<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Policy description for users</span></label>
//                   <textarea 
//                     value={form.FUP_policy} 
//                     onChange={(e) => setForm((prev) => ({ ...prev, FUP_policy: e.target.value }))} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     rows="3"
//                     placeholder="Describe the fair usage policy for this plan..."
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">FUP Threshold<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Usage % before speed reduction</span></label>
//                   <div className="flex items-center mt-1">
//                     <input 
//                       type="range" 
//                       min="1" 
//                       max="100" 
//                       value={form.FUP_threshold} 
//                       onChange={(e) => setForm((prev) => ({ ...prev, FUP_threshold: parseInt(e.target.value) }))} 
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                     <span className="ml-3 text-sm font-medium text-gray-700">{form.FUP_threshold}%</span>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center">
//                   <label className="block text-sm font-medium text-gray-700 mr-4">Router Specific<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limit to specific routers</span></label>
//                   <div onClick={() => setForm((prev) => ({ ...prev, router_specific: !prev.router_specific }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.router_specific ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                     <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.router_specific ? "translate-x-6" : "translate-x-1"}`} />
//                   </div>
//                 </div>
//               </div>
              
//               {form.router_specific && (
//                 <div className="grid grid-cols-1 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Allowed Routers<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Select routers where this plan can be activated</span></label>
//                     {isFetchingRouters ? (
//                       <div className="flex justify-center py-4">
//                         <FaSpinner className="w-5 h-5 text-teal-600 animate-spin" />
//                       </div>
//                     ) : (
//                       <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
//                         {routers.filter(r => r.status === "connected").map((router) => (
//                           <div 
//                             key={router.id} 
//                             onClick={() => toggleRouterSelection(router.id)}
//                             className={`p-3 border rounded-lg cursor-pointer transition-colors ${
//                               form.allowed_routers_ids.includes(router.id) 
//                                 ? "border-teal-500 bg-teal-50" 
//                                 : "border-gray-200 hover:border-teal-300"
//                             }`}
//                           >
//                             <div className="flex items-center">
//                               <div className={`w-3 h-3 rounded-full mr-2 ${
//                                 router.status === "connected" ? "bg-green-500" : "bg-red-500"
//                               }`} />
//                               <div className="flex-1">
//                                 <p className="text-sm font-medium text-gray-900">{router.name}</p>
//                                 <p className="text-xs text-gray-500">{router.ip} • {router.location}</p>
//                               </div>
//                               {form.allowed_routers_ids.includes(router.id) && (
//                                 <Check className="w-4 h-4 text-teal-600" />
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Description Tab */}
//         {activeTab === "description" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
//             <div className="text-xs text-gray-500 flex items-center mb-2"><Info className="w-3 h-3 mr-1" /> Detailed plan info for users</div>
//             <MDEditor value={form.description || ""} onChange={(value) => setForm((prev) => ({ ...prev, description: value || "" }))} preview="edit" height={200} className="shadow-sm" />
//           </div>
//         )}

//         {/* Features & Restrictions Tab */}
//         {activeTab === "features" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Features<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Benefits included in the plan</span></label>
//                 <div className="mt-1 flex gap-3">
//                   <select value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     <option value="">Select a feature</option>
//                     {featuresOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
//                   </select>
//                   <motion.button onClick={addFeature} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
//                 </div>
//                 <ul className="mt-3 space-y-2">
//                   {form.features.map((feature) => (
//                     <li key={feature} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
//                       {feature}
//                       <motion.button onClick={() => removeListItem("features", feature)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Restrictions<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limitations or conditions</span></label>
//                 <div className="mt-1 flex gap-3">
//                   <select value={newRestriction} onChange={(e) => setNewRestriction(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     <option value="">Select a restriction</option>
//                     {restrictionsOptions.map((restriction) => <option key={restriction} value={restriction}>{restriction}</option>)}
//                   </select>
//                   <motion.button onClick={addRestriction} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
//                 </div>
//                 <ul className="mt-3 space-y-2">
//                   {form.restrictions.map((restriction) => (
//                     <li key={restriction} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
//                       {restriction}
//                       <motion.button onClick={() => removeListItem("restrictions", restriction)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex justify-end">
//           <motion.button onClick={validateAndSavePlan} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//             <Save className="w-5 h-5 mr-2" /> Save Plan
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => {
//     if (!selectedPlan) { setViewMode("list"); return null; }
//     return (
//       <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{selectedPlan.name || "Unnamed Plan"}</h2>
//             <motion.button onClick={() => { setSelectedPlan(null); setViewMode("list"); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}><X className="w-8 h-8" /></motion.button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Zap className="w-6 h-6 text-teal-600 mr-2" /> Overview</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> {selectedPlan.planType === "Paid" ? <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span> : <span className="text-green-600 font-semibold">Free</span>}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>{selectedPlan.active ? "Active" : "Inactive"}</span></p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Bandwidth Limit:</span> {selectedPlan.bandwidth_limit_display || formatBandwidth(selectedPlan.bandwidth_limit || 0)}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Concurrent Connections:</span> {selectedPlan.concurrent_connections || 1}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Priority Level:</span> 
//                   <span className="ml-2 inline-flex items-center">
//                     {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.icon}
//                     <span className={`ml-1 ${priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.color}`}>
//                       {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.label}
//                     </span>
//                   </span>
//                 </p>
//                 {selectedPlan.router_specific && (
//                   <p className="text-gray-700"><span className="font-medium text-gray-900">Router Specific:</span> Yes ({selectedPlan.allowed_routers_ids?.length || 0} routers)</p>
//                 )}
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><Download className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Download:</span> {selectedPlan.downloadSpeed.value === "Unlimited" ? "Unlimited" : (selectedPlan.downloadSpeed.value || "N/A")} {selectedPlan.downloadSpeed.unit || ""}</p>
//                 <p className="text-gray-700"><Upload className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Upload:</span> {selectedPlan.uploadSpeed.value === "Unlimited" ? "Unlimited" : (selectedPlan.uploadSpeed.value || "N/A")} {selectedPlan.uploadSpeed.unit || ""}</p>
//                 <p className="text-gray-700"><Calendar className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Expiry:</span> {selectedPlan.expiry.value || "N/A"} {selectedPlan.expiry.unit || ""}</p>
//                 <p className="text-gray-700"><Shield className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Data Limit:</span> {selectedPlan.dataLimit.value === "Unlimited" ? "Unlimited" : (selectedPlan.dataLimit.value || "N/A")} {selectedPlan.dataLimit.unit === "Unlimited" ? "" : selectedPlan.dataLimit.unit || ""}</p>
//                 <p className="text-gray-700"><Clock className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Usage Limit:</span> {selectedPlan.usageLimit.value === "Unlimited" ? "Unlimited" : (selectedPlan.usageLimit.value || "N/A")} {selectedPlan.usageLimit.unit === "Unlimited" ? "" : selectedPlan.usageLimit.unit || ""}
//                   {selectedPlan.usageLimit.unit === "Hours" && selectedPlan.usageLimit.value && selectedPlan.usageLimit.value !== "Unlimited" && <span className="text-xs text-gray-500 ml-2">(~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)</span>}
//                 </p>
//                 {selectedPlan.FUP_policy && (
//                   <p className="text-gray-700"><span className="font-medium text-gray-900">FUP Policy:</span> {selectedPlan.FUP_policy}</p>
//                 )}
//                 {selectedPlan.FUP_threshold && (
//                   <p className="text-gray-700"><span className="font-medium text-gray-900">FUP Threshold:</span> {selectedPlan.FUP_threshold}%</p>
//                 )}
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Gift className="w-6 h-6 text-teal-600 mr-2" /> Description</h3>
//               <div className="prose prose-sm text-gray-700"><MDEditor.Markdown source={selectedPlan.description || "No description available"} /></div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Star className="w-6 h-6 text-teal-600 mr-2" /> Features</h3>
//                   <ul className="space-y-2">
//                     {selectedPlan.features.length > 0 ? selectedPlan.features.map((feature) => (
//                       <li key={feature} className="text-gray-700 flex items-center"><Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions</h3>
//                   <ul className="space-y-2">
//                     {selectedPlan.restrictions.length > 0 ? selectedPlan.restrictions.map((restriction) => (
//                       <li key={restriction} className="text-gray-700 flex items-center"><Shield className="w-4 h-4 text-teal-600 mr-2" /> {restriction}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Users className="w-6 h-6 text-teal-600 mr-2" /> Stats</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Subscribers:</span> {selectedPlan.purchases || 0} {renderStars(selectedPlan.purchases)}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Created At:</span> {selectedPlan.createdAt ? new Date(selectedPlan.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p>
//               </div>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   const renderSubscriptions = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Subscriptions</h2>
//         <motion.button
//           onClick={() => setViewMode("list")}
//           className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Wifi className="w-5 h-5 mr-2" /> Back to Plans
//         </motion.button>
//       </div>

//       {/* Subscription Filters */}
//       <div className="bg-white p-4 rounded-xl shadow-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//           <Filter className="w-5 h-5 mr-2 text-teal-600" /> Filter Subscriptions
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select 
//               value={subscriptionFilters.status} 
//               onChange={(e) => handleSubscriptionFilterChange('status', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             >
//               <option value="">All Statuses</option>
//               <option value="active">Active</option>
//               <option value="expired">Expired</option>
//               <option value="suspended">Suspended</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
//             <select 
//               value={subscriptionFilters.plan} 
//               onChange={(e) => handleSubscriptionFilterChange('plan', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             >
//               <option value="">All Plans</option>
//               {plans.map(plan => (
//                 <option key={plan.id} value={plan.id}>{plan.name}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Router</label>
//             <select 
//               value={subscriptionFilters.router} 
//               onChange={(e) => handleSubscriptionFilterChange('router', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             >
//               <option value="">All Routers</option>
//               {routers.filter(r => r.status === "connected").map(router => (
//                 <option key={router.id} value={router.id}>{router.name} ({router.location})</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {isFetchingSubs ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : subscriptions.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Subscriptions</h3>
//           <p className="text-gray-600 mt-2">No active subscriptions yet.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Client</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Router</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Remaining Data</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Remaining Time</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {subscriptions.map((sub) => (
//                 <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.client.name || sub.client.phonenumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.internet_plan?.name || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.router?.name || 'N/A'} {sub.router?.location ? `(${sub.router.location})` : ''}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sub.start_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sub.end_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.remaining_data_display || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.remaining_time_display || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
//                       sub.status === 'active' ? "bg-teal-100 text-teal-800" :
//                       sub.status === 'expired' ? "bg-gray-100 text-gray-800" :
//                       sub.status === 'suspended' ? "bg-yellow-100 text-yellow-800" :
//                       "bg-red-100 text-red-800"
//                     }`}>
//                       {sub.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPlanList()}</motion.div>}
//         {viewMode === "form" && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanForm()}</motion.div>}
//         {viewMode === "details" && <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanDetails()}</motion.div>}
//         {viewMode === "subscriptions" && <motion.div key="subscriptions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderSubscriptions()}</motion.div>}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;







// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
//   Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer, Crown,
//   Cpu, HardDrive, Network, BarChart3, Gauge, Cable, UserCheck, Cloud, CloudRain, CloudSnow,
//   CloudDrizzle, CloudLightning, CloudOff, Router, Check, Filter, AlertTriangle, DollarSign
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../api"

// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// const initialFormState = {
//   planType: "Paid", name: "", price: "", active: true,
//   downloadSpeed: { value: "", unit: "Mbps" }, uploadSpeed: { value: "", unit: "Mbps" },
//   expiry: { value: "", unit: "Days" }, dataLimit: { value: "", unit: "GB" },
//   usageLimit: { value: "", unit: "Hours" }, description: "", category: "Residential",
//   purchases: 0, features: [], restrictions: [], createdAt: new Date().toISOString().split("T")[0],
//   client_sessions: {},
//   bandwidth_limit: 0,
//   concurrent_connections: 1,
//   priority_level: 4,
//   router_specific: false,
//   allowed_routers_ids: [],
//   FUP_policy: "",
//   FUP_threshold: 80,
// };

// const speedUnits = ["Kbps", "Mbps", "Gbps"];
// const expiryUnits = ["Days", "Months"];
// const dataUnits = ["GB", "TB", "Unlimited"];
// const usageUnits = ["Hours", "Unlimited"];
// const categories = ["Residential", "Business", "Promotional", "Enterprise"];
// const planTypes = ["Paid", "Free Trial"];
// const featuresOptions = [
//   "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
//   "24/7 Support", "Low Latency", "Prepaid Access", "High Priority Bandwidth", 
//   "Multiple Device Support", "Static IP Address", "VPN Access", "Gaming Optimized", 
//   "Streaming Optimized", "No Throttling", "Premium Routing"
// ];
// const restrictionsOptions = [
//   "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
//   "Rural Use Only", "Requires Signal Booster", "Speed may be reduced after fair use threshold", 
//   "Limited to specific router locations", "No torrenting or P2P allowed", 
//   "Streaming limited to SD quality", "Business use only", "Non-transferable", 
//   "Subject to fair usage policy", "Speed varies by location"
// ];

// const priorityOptions = [
//   { value: 1, label: "Lowest", icon: <CloudOff className="w-4 h-4" />, color: "text-gray-500" },
//   { value: 2, label: "Low", icon: <CloudDrizzle className="w-4 h-4" />, color: "text-blue-500" },
//   { value: 3, label: "Medium", icon: <CloudRain className="w-4 h-4" />, color: "text-green-500" },
//   { value: 4, label: "High", icon: <Cloud className="w-4 h-4" />, color: "text-yellow-500" },
//   { value: 5, label: "Highest", icon: <CloudSnow className="w-4 h-4" />, color: "text-orange-500" },
//   { value: 6, label: "Critical", icon: <CloudLightning className="w-4 h-4" />, color: "text-red-500" },
//   { value: 7, label: "Premium", icon: <Server className="w-4 h-4" />, color: "text-purple-500" },
//   { value: 8, label: "VIP", icon: <Crown className="w-4 h-4" />, color: "text-pink-500" },
// ];

// const bandwidthPresets = [
//   { value: 1024, label: "1 Mbps" },
//   { value: 2048, label: "2 Mbps" },
//   { value: 5120, label: "5 Mbps" },
//   { value: 10240, label: "10 Mbps" },
//   { value: 20480, label: "20 Mbps" },
//   { value: 51200, label: "50 Mbps" },
//   { value: 102400, label: "100 Mbps" },
//   { value: 0, label: "Unlimited" },
// ];

// const usageLimitPresets = [
//   { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: <Gift className="w-4 h-4 text-purple-600" /> },
//   { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: <Home className="w-4 h-4 text-teal-600" /> },
//   { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
//   { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: <Calendar className="w-4 h-4 text-indigo-600" /> },
//   { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: <Server className="w-4 h-4 text-blue-600" /> },
// ];

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const formatTime = (seconds) => {
//   if (seconds <= 0) return "Expired";
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

// const formatBandwidth = (kbps) => {
//   if (kbps === 0) return "Unlimited";
//   if (kbps >= 1000) {
//     return `${(kbps / 1000).toFixed(1)} Mbps`;
//   }
//   return `${kbps} Kbps`;
// };

// const CreatePlans = () => {
//   const { form, setForm, handleChange, handleNestedChange } = useForm(initialFormState);
//   const [plans, setPlans] = useState([]);
//   const [routers, setRouters] = useState([]);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [analytics, setAnalytics] = useState(null);
//   const [compatibleRouters, setCompatibleRouters] = useState([]);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isFetchingSubs, setIsFetchingSubs] = useState(false);
//   const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);
//   const [isFetchingRouters, setIsFetchingRouters] = useState(false);
//   const [isFetchingCompatible, setIsFetchingCompatible] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);
//   const [isBandwidthMenuOpen, setIsBandwidthMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [subscriptionFilters, setSubscriptionFilters] = useState({
//     status: "",
//     plan: "",
//     router: ""
//   });

//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         const normalizedPlans = plansData.map((plan) => ({
//           ...initialFormState,
//           id: plan.id,
//           planType: plan.planType || plan.plan_type,
//           name: plan.name,
//           price: plan.price.toString(),
//           active: plan.active,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           description: plan.description,
//           category: plan.category,
//           purchases: plan.purchases,
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           createdAt: plan.created_at || plan.createdAt,
//           client_sessions: plan.client_sessions || {},
//           bandwidth_limit: plan.bandwidth_limit || 0,
//           concurrent_connections: plan.concurrent_connections || 1,
//           priority_level: plan.priority_level || 4,
//           router_specific: plan.router_specific || false,
//           allowed_routers_ids: plan.allowed_routers_ids || [],
//           FUP_policy: plan.FUP_policy || "",
//           FUP_threshold: plan.FUP_threshold || 80,
//           bandwidth_limit_display: plan.bandwidth_limit_display || formatBandwidth(plan.bandwidth_limit || 0),
//           is_unlimited_data: plan.is_unlimited_data || false,
//           is_unlimited_time: plan.is_unlimited_time || false,
//         }));
//         setPlans(normalizedPlans);
//       } catch (error) {
//         console.error("Error fetching plans:", error);
//         toast.error("Failed to load plans from server.");
//         setPlans([]);
//       } finally {
//         setIsFetching(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   useEffect(() => {
//     const fetchRouters = async () => {
//       setIsFetchingRouters(true);
//       try {
//         const response = await api.get("/api/network_management/routers/");
//         setRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching routers:", error);
//         toast.error("Failed to load routers from server.");
//         setRouters([]);
//       } finally {
//         setIsFetchingRouters(false);
//       }
//     };
    
//     if (viewMode === "form" || viewMode === "subscriptions" || viewMode === "details") {
//       fetchRouters();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchSubscriptions = async () => {
//       setIsFetchingSubs(true);
//       try {
//         let url = "/api/internet_plans/subscriptions/";
//         const params = new URLSearchParams();
        
//         if (subscriptionFilters.status) params.append('status', subscriptionFilters.status);
//         if (subscriptionFilters.plan) params.append('plan', subscriptionFilters.plan);
//         if (subscriptionFilters.router) params.append('router', subscriptionFilters.router);
        
//         if (params.toString()) url += `?${params.toString()}`;
        
//         const response = await api.get(url);
//         const subsData = response.data;
//         if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
//         setSubscriptions(subsData);
//       } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         toast.error("Failed to load subscriptions from server.");
//         setSubscriptions([]);
//       } finally {
//         setIsFetchingSubs(false);
//       }
//     };
//     if (viewMode === "subscriptions") {
//       fetchSubscriptions();
//     }
//   }, [viewMode, subscriptionFilters]);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       setIsFetchingAnalytics(true);
//       try {
//         const response = await api.get("/api/internet_plans/subscription-analytics/");
//         setAnalytics(response.data);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//         toast.error("Failed to load analytics from server.");
//         setAnalytics(null);
//       } finally {
//         setIsFetchingAnalytics(false);
//       }
//     };
//     if (viewMode === "analytics") {
//       fetchAnalytics();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchCompatibleRouters = async () => {
//       if (!selectedPlan?.id || !selectedPlan.router_specific) return;
//       setIsFetchingCompatible(true);
//       try {
//         const response = await api.get(`/api/internet_plans/${selectedPlan.id}/compatible-routers/`);
//         setCompatibleRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching compatible routers:", error);
//         toast.error("Failed to load compatible routers.");
//         setCompatibleRouters([]);
//       } finally {
//         setIsFetchingCompatible(false);
//       }
//     };
//     if (viewMode === "details") {
//       fetchCompatibleRouters();
//     }
//   }, [viewMode, selectedPlan]);

//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   useEffect(() => {
//     if (form.dataLimit.unit === "Unlimited") {
//       handleNestedChange("dataLimit", "value", "Unlimited");
//     }
//   }, [form.dataLimit.unit]);

//   useEffect(() => {
//     if (form.usageLimit.unit === "Unlimited") {
//       handleNestedChange("usageLimit", "value", "Unlimited");
//     }
//   }, [form.usageLimit.unit]);

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => {
//         const updatedFeatures = [...prev.features, newFeature];
//         return { ...prev, features: updatedFeatures };
//       });
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => {
//         const updatedRestrictions = [...prev.restrictions, newRestriction];
//         return { ...prev, restrictions: updatedRestrictions };
//       });
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => {
//       const updatedList = prev[list].filter((i) => i !== item);
//       return { ...prev, [list]: updatedList };
//     });
//   };

//   const toggleRouterSelection = (routerId) => {
//     setForm((prev) => {
//       const currentRouters = [...prev.allowed_routers_ids];
//       const index = currentRouters.indexOf(routerId);
      
//       if (index > -1) {
//         currentRouters.splice(index, 1);
//       } else {
//         currentRouters.push(routerId);
//       }
      
//       return { ...prev, allowed_routers_ids: currentRouters };
//     });
//   };

//   const validateAndSavePlan = async () => {
//     const requiredFields = [
//       !form.planType && "Plan Type", !form.name && "Plan Name", !form.category && "Category",
//       form.planType === "Paid" && (!form.price || form.price === "") && "Price",
//       !form.downloadSpeed.value && "Download Speed", !form.uploadSpeed.value && "Upload Speed",
//       !form.expiry.value && "Expiry Duration", !form.dataLimit.value && "Data Limit",
//       !form.usageLimit.value && "Usage Limit", !form.description && "Description",
//     ].filter(Boolean);

//     if (requiredFields.length > 0) {
//       toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
//       return;
//     }

//     if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
//       toast.error("Price must be a positive number for paid plans.");
//       return;
//     }

//     const downloadSpeed = parseFloat(form.downloadSpeed.value);
//     const uploadSpeed = parseFloat(form.uploadSpeed.value);
//     const expiry = parseInt(form.expiry.value, 10);

//     if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
//       toast.error("Download speed must be a positive number.");
//       return;
//     }
//     if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
//       toast.error("Upload speed must be a positive number.");
//       return;
//     }
//     if (isNaN(expiry) || expiry <= 0) {
//       toast.error("Expiry duration must be a positive integer.");
//       return;
//     }

//     if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
//       toast.error("When data unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }
//     if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
//       toast.error("When usage unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }

//     if (form.dataLimit.unit !== "Unlimited") {
//       const dataValue = parseFloat(form.dataLimit.value);
//       if (isNaN(dataValue) || dataValue <= 0 || form.dataLimit.value.toLowerCase() === "unlimited") {
//         toast.error("Data limit must be a positive number when unit is not Unlimited.");
//         return;
//       }
//     }

//     if (form.usageLimit.unit !== "Unlimited") {
//       const usageValue = parseFloat(form.usageLimit.value);
//       if (isNaN(usageValue) || usageValue <= 0 || form.usageLimit.value.toLowerCase() === "unlimited") {
//         toast.error("Usage limit must be a positive number when unit is not Unlimited.");
//         return;
//       }
//     }

//     if (form.planType === "Free Trial") {
//       if (parseFloat(form.price) !== 0) {
//         toast.error("Free Trial plans must have price set to 0.");
//         return;
//       }
//       if (form.router_specific) {
//         toast.error("Free Trial plans cannot be router-specific.");
//         return;
//       }
//       if (form.priority_level > 4) {
//         toast.error("Free Trial plans cannot have premium priority levels.");
//         return;
//       }
//     }

//     const planData = {
//       planType: form.planType,
//       name: form.name,
//       price: parseFloat(form.price) || 0,
//       active: form.active,
//       downloadSpeed: form.downloadSpeed,
//       uploadSpeed: form.uploadSpeed,
//       expiry: form.expiry,
//       dataLimit: form.dataLimit,
//       usageLimit: form.usageLimit,
//       description: form.description,
//       category: form.category,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       features: form.features,
//       restrictions: form.restrictions,
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//       bandwidth_limit: form.bandwidth_limit,
//       concurrent_connections: form.concurrent_connections,
//       priority_level: form.priority_level,
//       router_specific: form.router_specific,
//       allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
//       FUP_policy: form.FUP_policy,
//       FUP_threshold: form.FUP_threshold,
//     };

//     try {
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
//         toast.success(`Updated plan: ${planData.name}`);
//       } else {
//         response = await api.post("/api/internet_plans/", planData);
//         setPlans((prev) => [...prev, response.data]);
//         toast.success(`Created plan: ${planData.name}`);
//       }
//       setForm(deepClone(initialFormState));
//       setEditingPlan(null);
//       setViewMode("list");
//     } catch (error) {
//       console.error("Error saving plan:", error.response?.data || error.message);
//       const errorDetails = error.response?.data?.details || error.response?.data || error.message;
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${JSON.stringify(errorDetails)}`);
//     }
//   };

//   const deletePlan = async (planId, planName) => {
//     if (window.confirm(`Delete "${planName}"?`)) {
//       try {
//         await api.delete(`/api/internet_plans/${planId}/`);
//         setPlans((prev) => prev.filter((p) => p.id !== planId));
//         if (selectedPlan && selectedPlan.id === planId) {
//           setSelectedPlan(null);
//           setViewMode("list");
//         }
//         toast.success(`Deleted plan: ${planName}`);
//       } catch (error) {
//         console.error("Error deleting plan:", error);
//         toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
//       }
//     }
//   };

//   const activatePlanOnRouter = async (planId, routerId) => {
//     try {
//       const response = await api.post(`/api/internet_plans/${planId}/activate-on-router/${routerId}/`);
//       toast.success(response.data.message);
//     } catch (error) {
//       console.error("Error activating plan on router:", error);
//       toast.error(`Failed to activate: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   const sortedPlans = [...plans]
//     .filter(
//       (plan) =>
//         (filterCategory === "All" || plan.category === filterCategory) &&
//         (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//     .sort((a, b) => {
//       let aValue, bValue;
//       if (sortConfig.key.includes(".")) {
//         const [parent, child] = sortConfig.key.split(".");
//         aValue = a[parent] ? a[parent][child] : "";
//         bValue = b[parent] ? b[parent][child] : "";
//       } else {
//         aValue = a[sortConfig.key] || "";
//         bValue = b[sortConfig.key] || "";
//       }
//       if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
//         aValue = parseFloat(aValue);
//         bValue = parseFloat(bValue);
//       }
//       return sortConfig.direction === "asc"
//         ? typeof aValue === "string"
//           ? aValue.localeCompare(bValue)
//           : aValue - bValue
//         : typeof bValue === "string"
//           ? bValue.localeCompare(aValue)
//           : bValue - aValue;
//     });

//   const requestSort = (key) => {
//     setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
//         ))}
//         <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
//       </div>
//     );
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       Residential: <Home className="w-4 h-4 text-teal-600" />,
//       Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Gift className="w-4 h-4 text-purple-600" />,
//       Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
//     };
//     return icons[category] || null;
//   };

//   const handleUsagePresetSelect = (hours) => {
//     handleNestedChange("usageLimit", "value", hours);
//     handleNestedChange("usageLimit", "unit", "Hours");
//     setIsUsageMenuOpen(false);
//   };

//   const handleBandwidthPresetSelect = (value) => {
//     setForm((prev) => ({ ...prev, bandwidth_limit: value }));
//     setIsBandwidthMenuOpen(false);
//   };

//   const handleSubscriptionFilterChange = (filter, value) => {
//     setSubscriptionFilters((prev) => ({ ...prev, [filter]: value }));
//   };

//   const renderPlanList = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ConnectSphere Packages</h2>
//         <div className="flex space-x-4">
//           <motion.button
//             onClick={() => setViewMode("analytics")}
//             className="px-5 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <BarChart3 className="w-5 h-5 mr-2" /> Analytics
//           </motion.button>
//           <motion.button
//             onClick={() => setViewMode("subscriptions")}
//             className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Users className="w-5 h-5 mr-2" /> View Subscriptions
//           </motion.button>
//           <motion.button
//             onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
//             className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Plus className="w-5 h-5 mr-2" /> New Plan
//           </motion.button>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <select
//           value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//         </select>
//         <input
//           type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex-1 bg-white"
//         />
//       </div>

//       {isFetching ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : plans.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Plans Available</h3>
//           <p className="text-gray-600 mt-2">Create a new plan to get started!</p>
//           <motion.button
//             onClick={() => setViewMode("form")}
//             className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             Create Plan
//           </motion.button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   { key: "name", label: "Name" }, { key: "planType", label: "Type" },
//                   { key: "category", label: "Category" }, { key: "price", label: "Price" },
//                   { key: "bandwidth_limit", label: "Bandwidth" }, { key: "purchases", label: "Subscribers" },
//                   { key: "actions", label: "Actions" },
//                 ].map((column) => (
//                   <th
//                     key={column.key} onClick={() => column.key !== "actions" && requestSort(column.key)}
//                     className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""}`}
//                   >
//                     <div className="flex items-center">
//                       {column.label}
//                       {sortConfig.key === column.key && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />)}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedPlans.map((plan) => (
//                 <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">{getCategoryIcon(plan.category)}<span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span></div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.bandwidth_limit_display}</td>
//                   <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><Users className="w-4 h-4 text-gray-400 mr-2" />{plan.purchases} {renderStars(plan.purchases)}</div></td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-4">
//                       <motion.button onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} className="focus:outline-none" whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
//                       </motion.button>
//                       <motion.button onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} className="focus:outline-none" whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           const copiedPlan = { ...deepClone(plan), name: `Copy of ${plan.name}`, id: null, purchases: 0, client_sessions: {}, createdAt: new Date().toISOString().split("T")[0] };
//                           setForm(copiedPlan); setEditingPlan(null); setViewMode("form");
//                         }}
//                         className="focus:outline-none" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
//                       >
//                         <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
//                       </motion.button>
//                       <motion.button onClick={() => deletePlan(plan.id, plan.name)} className="focus:outline-none" whileHover={{ x: [0, -2, 2, -2, 0] }} transition={{ duration: 0.3 }}>
//                         <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
//                       </motion.button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderPlanForm = () => (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{editingPlan ? "Edit Plan" : "New Plan"}</h2>
//         <motion.button onClick={() => { setViewMode("list"); setForm(deepClone(initialFormState)); setEditingPlan(null); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100">
//         <div className="flex space-x-2">
//           {["basic", "specifications", "advanced", "description", "features"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 activeTab === tab 
//                   ? "bg-teal-600 text-white" 
//                   : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-8">
//         {/* Basic Details Tab */}
//         {activeTab === "basic" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Plan Type <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Paid or Free Trial</span></label>
//                   <select name="planType" value={form.planType || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                     <option value="" disabled>Select Plan Type</option>
//                     {planTypes.map((type) => <option key={type} value={type}>{type}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Unique plan identifier</span></label>
//                   <input name="name" value={form.name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., Rural Wi-Fi Pro" required />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Target user group</span></label>
//                   <select name="category" value={form.category || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                     <option value="" disabled>Select Category</option>
//                     {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings</span></label>
//                   <input
//                     type="number" name="price" value={form.price || ""} onChange={handleChange} disabled={form.planType !== "Paid"}
//                     className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${form.planType !== "Paid" ? "bg-gray-100 cursor-not-allowed" : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"}`}
//                     placeholder="e.g., 29.99" step="0.01" min="0" required={form.planType === "Paid"}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <label className="block text-sm font-medium text-gray-700 mr-4">Active<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Enable or disable plan</span></label>
//                 <div onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.active ? "translate-x-6" : "translate-x-1"}`} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Specifications Tab */}
//         {activeTab === "specifications" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Download Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.downloadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 10" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                   <select value={form.downloadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.uploadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 2" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                   <select value={form.uploadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.expiry.value || ""} 
//                     onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="1" 
//                     step="1" 
//                     placeholder="e.g., 30" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration type</span></label>
//                   <select value={form.expiry.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB or Unlimited)</span></label>
//                   <input type="text" value={form.dataLimit.value || ""} onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 100 or Unlimited" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
//                   <select value={form.dataLimit.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours or Unlimited)</span></label>
//                   <div className="mt-1 flex items-center">
//                     <input type="text" value={form.usageLimit.value || ""} onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 240 or Unlimited" required />
//                     <motion.button onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)} className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none" whileHover={{ scale: 1.05 }}>
//                       <Timer className="w-5 h-5" />
//                     </motion.button>
//                   </div>
//                   <AnimatePresence>
//                     {isUsageMenuOpen && (
//                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//                         {usageLimitPresets.map((preset) => (
//                           <div key={preset.hours} onClick={() => handleUsagePresetSelect(preset.hours)} className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors">
//                             {preset.icon}
//                             <div className="ml-2">
//                               <p className="text-sm font-medium text-gray-900">{preset.hours} Hours ({preset.days} Days)</p>
//                               <p className="text-xs text-gray-500">{preset.description}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Time measurement</span></label>
//                   <select value={form.usageLimit.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {usageUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Advanced Settings Tab */}
//         {activeTab === "advanced" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Settings</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700">Bandwidth Limit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Maximum bandwidth for router QoS</span></label>
//                   <div className="mt-1 flex items-center">
//                     <input 
//                       type="number" 
//                       value={form.bandwidth_limit} 
//                       onChange={(e) => setForm((prev) => ({ ...prev, bandwidth_limit: parseInt(e.target.value) || 0 }))} 
//                       className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                       placeholder="e.g., 10240" 
//                     />
//                     <motion.button onClick={() => setIsBandwidthMenuOpen(!isBandwidthMenuOpen)} className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none" whileHover={{ scale: 1.05 }}>
//                       <Gauge className="w-5 h-5" />
//                     </motion.button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Current: {formatBandwidth(form.bandwidth_limit)}</p>
//                   <AnimatePresence>
//                     {isBandwidthMenuOpen && (
//                       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//                         {bandwidthPresets.map((preset) => (
//                           <div key={preset.value} onClick={() => handleBandwidthPresetSelect(preset.value)} className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors">
//                             <div>
//                               <p className="text-sm font-medium text-gray-900">{preset.label}</p>
//                               <p className="text-xs text-gray-500">{preset.value === 0 ? "No limit" : `${preset.value} Kbps`}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Concurrent Connections<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max simultaneous devices</span></label>
//                   <input 
//                     type="number" 
//                     value={form.concurrent_connections} 
//                     onChange={(e) => setForm((prev) => ({ ...prev, concurrent_connections: parseInt(e.target.value) || 1 }))} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="1" 
//                     placeholder="e.g., 5" 
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Priority Level<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> QoS priority for network traffic</span></label>
//                   <select 
//                     value={form.priority_level} 
//                     onChange={(e) => setForm((prev) => ({ ...prev, priority_level: parseInt(e.target.value) }))} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   >
//                     {priorityOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="mt-2 flex items-center">
//                     {priorityOptions.find(opt => opt.value === form.priority_level)?.icon}
//                     <span className={`ml-2 text-sm ${priorityOptions.find(opt => opt.value === form.priority_level)?.color}`}>
//                       {priorityOptions.find(opt => opt.value === form.priority_level)?.label}
//                     </span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Fair Usage Policy<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Policy description for users</span></label>
//                   <textarea 
//                     value={form.FUP_policy} 
//                     onChange={(e) => setForm((prev) => ({ ...prev, FUP_policy: e.target.value }))} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     rows="3"
//                     placeholder="Describe the fair usage policy for this plan..."
//                   />
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">FUP Threshold<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Usage % before speed reduction</span></label>
//                   <div className="flex items-center mt-1">
//                     <input 
//                       type="range" 
//                       min="1" 
//                       max="100" 
//                       value={form.FUP_threshold} 
//                       onChange={(e) => setForm((prev) => ({ ...prev, FUP_threshold: parseInt(e.target.value) }))} 
//                       className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                     />
//                     <span className="ml-3 text-sm font-medium text-gray-700">{form.FUP_threshold}%</span>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center">
//                   <label className="block text-sm font-medium text-gray-700 mr-4">Router Specific<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limit to specific routers</span></label>
//                   <div onClick={() => setForm((prev) => ({ ...prev, router_specific: !prev.router_specific }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.router_specific ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                     <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.router_specific ? "translate-x-6" : "translate-x-1"}`} />
//                   </div>
//                 </div>
//               </div>
              
//               {form.router_specific && (
//                 <div className="grid grid-cols-1 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Allowed Routers<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Select routers where this plan can be activated</span></label>
//                     {isFetchingRouters ? (
//                       <div className="flex justify-center py-4">
//                         <FaSpinner className="w-5 h-5 text-teal-600 animate-spin" />
//                       </div>
//                     ) : (
//                       <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
//                         {routers.filter(r => r.status === "connected").map((router) => (
//                           <div 
//                             key={router.id} 
//                             onClick={() => toggleRouterSelection(router.id)}
//                             className={`p-3 border rounded-lg cursor-pointer transition-colors ${
//                               form.allowed_routers_ids.includes(router.id) 
//                                 ? "border-teal-500 bg-teal-50" 
//                                 : "border-gray-200 hover:border-teal-300"
//                             }`}
//                           >
//                             <div className="flex items-center">
//                               <div className={`w-3 h-3 rounded-full mr-2 ${
//                                 router.status === "connected" ? "bg-green-500" : "bg-red-500"
//                               }`} />
//                               <div className="flex-1">
//                                 <p className="text-sm font-medium text-gray-900">{router.name}</p>
//                                 <p className="text-xs text-gray-500">{router.ip} • {router.location}</p>
//                               </div>
//                               {form.allowed_routers_ids.includes(router.id) && (
//                                 <Check className="w-4 h-4 text-teal-600" />
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Description Tab */}
//         {activeTab === "description" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
//             <div className="text-xs text-gray-500 flex items-center mb-2"><Info className="w-3 h-3 mr-1" /> Detailed plan info for users</div>
//             <MDEditor value={form.description || ""} onChange={(value) => setForm((prev) => ({ ...prev, description: value || "" }))} preview="edit" height={200} className="shadow-sm" />
//           </div>
//         )}

//         {/* Features & Restrictions Tab */}
//         {activeTab === "features" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Features<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Benefits included in the plan</span></label>
//                 <div className="mt-1 flex gap-3">
//                   <select value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     <option value="">Select a feature</option>
//                     {featuresOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
//                   </select>
//                   <motion.button onClick={addFeature} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
//                 </div>
//                 <ul className="mt-3 space-y-2">
//                   {form.features.map((feature) => (
//                     <li key={feature} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
//                       {feature}
//                       <motion.button onClick={() => removeListItem("features", feature)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Restrictions<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limitations or conditions</span></label>
//                 <div className="mt-1 flex gap-3">
//                   <select value={newRestriction} onChange={(e) => setNewRestriction(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     <option value="">Select a restriction</option>
//                     {restrictionsOptions.map((restriction) => <option key={restriction} value={restriction}>{restriction}</option>)}
//                   </select>
//                   <motion.button onClick={addRestriction} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
//                 </div>
//                 <ul className="mt-3 space-y-2">
//                   {form.restrictions.map((restriction) => (
//                     <li key={restriction} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
//                       {restriction}
//                       <motion.button onClick={() => removeListItem("restrictions", restriction)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex justify-end">
//           <motion.button onClick={validateAndSavePlan} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//             <Save className="w-5 h-5 mr-2" /> Save Plan
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => {
//     if (!selectedPlan) { setViewMode("list"); return null; }
//     return (
//       <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{selectedPlan.name || "Unnamed Plan"}</h2>
//             <motion.button onClick={() => { setSelectedPlan(null); setViewMode("list"); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}><X className="w-8 h-8" /></motion.button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Zap className="w-6 h-6 text-teal-600 mr-2" /> Overview</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> {selectedPlan.planType === "Paid" ? <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span> : <span className="text-green-600 font-semibold">Free</span>}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>{selectedPlan.active ? "Active" : "Inactive"}</span></p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Bandwidth Limit:</span> {selectedPlan.bandwidth_limit_display || formatBandwidth(selectedPlan.bandwidth_limit || 0)}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Concurrent Connections:</span> {selectedPlan.concurrent_connections || 1}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Priority Level:</span> 
//                   <span className="ml-2 inline-flex items-center">
//                     {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.icon}
//                     <span className={`ml-1 ${priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.color}`}>
//                       {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.label}
//                     </span>
//                   </span>
//                 </p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Router Specific:</span> {selectedPlan.router_specific ? `Yes (${selectedPlan.allowed_routers_ids?.length || 0} routers)` : "No"}</p>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><Download className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Download:</span> {selectedPlan.downloadSpeed.value === "Unlimited" ? "Unlimited" : (selectedPlan.downloadSpeed.value || "N/A")} {selectedPlan.downloadSpeed.unit || ""}</p>
//                 <p className="text-gray-700"><Upload className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Upload:</span> {selectedPlan.uploadSpeed.value === "Unlimited" ? "Unlimited" : (selectedPlan.uploadSpeed.value || "N/A")} {selectedPlan.uploadSpeed.unit || ""}</p>
//                 <p className="text-gray-700"><Calendar className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Expiry:</span> {selectedPlan.expiry.value || "N/A"} {selectedPlan.expiry.unit || ""}</p>
//                 <p className="text-gray-700"><Shield className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Data Limit:</span> {selectedPlan.dataLimit.value === "Unlimited" ? "Unlimited" : (selectedPlan.dataLimit.value || "N/A")} {selectedPlan.dataLimit.unit === "Unlimited" ? "" : selectedPlan.dataLimit.unit || ""}</p>
//                 <p className="text-gray-700"><Clock className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Usage Limit:</span> {selectedPlan.usageLimit.value === "Unlimited" ? "Unlimited" : (selectedPlan.usageLimit.value || "N/A")} {selectedPlan.usageLimit.unit === "Unlimited" ? "" : selectedPlan.usageLimit.unit || ""}
//                   {selectedPlan.usageLimit.unit === "Hours" && selectedPlan.usageLimit.value && selectedPlan.usageLimit.value !== "Unlimited" && <span className="text-xs text-gray-500 ml-2">(~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)</span>}
//                 </p>
//                 {selectedPlan.FUP_policy && (
//                   <p className="text-gray-700"><AlertTriangle className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">FUP Policy:</span> {selectedPlan.FUP_policy}</p>
//                 )}
//                 {selectedPlan.FUP_threshold && (
//                   <p className="text-gray-700"><Gauge className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">FUP Threshold:</span> {selectedPlan.FUP_threshold}%</p>
//                 )}
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Gift className="w-6 h-6 text-teal-600 mr-2" /> Description</h3>
//               <div className="prose prose-sm text-gray-700"><MDEditor.Markdown source={selectedPlan.description || "No description available"} /></div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Star className="w-6 h-6 text-teal-600 mr-2" /> Features</h3>
//                   <ul className="space-y-2">
//                     {selectedPlan.features.length > 0 ? selectedPlan.features.map((feature) => (
//                       <li key={feature} className="text-gray-700 flex items-center"><Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions</h3>
//                   <ul className="space-y-2">
//                     {selectedPlan.restrictions.length > 0 ? selectedPlan.restrictions.map((restriction) => (
//                       <li key={restriction} className="text-gray-700 flex items-center"><Shield className="w-4 h-4 text-teal-600 mr-2" /> {restriction}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Users className="w-6 h-6 text-teal-600 mr-2" /> Stats</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Subscribers:</span> {selectedPlan.purchases || 0} {renderStars(selectedPlan.purchases)}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Created At:</span> {selectedPlan.createdAt ? new Date(selectedPlan.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p>
//               </div>
//             </motion.div>

//             {selectedPlan.router_specific && (
//               <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Router className="w-6 h-6 text-teal-600 mr-2" /> Compatible Routers</h3>
//                 {isFetchingCompatible ? (
//                   <div className="flex justify-center py-4">
//                     <FaSpinner className="w-5 h-5 text-teal-600 animate-spin" />
//                   </div>
//                 ) : compatibleRouters.length === 0 ? (
//                   <p className="text-gray-500 italic">No compatible routers found.</p>
//                 ) : (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                     {compatibleRouters.map((router) => (
//                       <div key={router.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-sm font-medium text-gray-900">{router.name}</p>
//                             <p className="text-xs text-gray-500">{router.ip} • {router.location}</p>
//                             <p className="text-xs text-gray-500">Status: {router.status}</p>
//                           </div>
//                           <motion.button
//                             onClick={() => activatePlanOnRouter(selectedPlan.id, router.id)}
//                             className="px-3 py-1 bg-teal-600 text-white rounded-md text-xs hover:bg-teal-700"
//                             whileHover={{ scale: 1.05 }}
//                           >
//                             Activate
//                           </motion.button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </motion.div>
//             )}
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   const renderSubscriptions = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Subscriptions</h2>
//         <motion.button
//           onClick={() => setViewMode("list")}
//           className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Wifi className="w-5 h-5 mr-2" /> Back to Plans
//         </motion.button>
//       </div>

//       {/* Subscription Filters */}
//       <div className="bg-white p-4 rounded-xl shadow-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
//           <Filter className="w-5 h-5 mr-2 text-teal-600" /> Filter Subscriptions
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select 
//               value={subscriptionFilters.status} 
//               onChange={(e) => handleSubscriptionFilterChange('status', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             >
//               <option value="">All Statuses</option>
//               <option value="active">Active</option>
//               <option value="expired">Expired</option>
//               <option value="suspended">Suspended</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
//             <select 
//               value={subscriptionFilters.plan} 
//               onChange={(e) => handleSubscriptionFilterChange('plan', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             >
//               <option value="">All Plans</option>
//               {plans.map(plan => (
//                 <option key={plan.id} value={plan.id}>{plan.name}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Router</label>
//             <select 
//               value={subscriptionFilters.router} 
//               onChange={(e) => handleSubscriptionFilterChange('router', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             >
//               <option value="">All Routers</option>
//               {routers.filter(r => r.status === "connected").map(router => (
//                 <option key={router.id} value={router.id}>{router.name} ({router.location})</option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>

//       {isFetchingSubs ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : subscriptions.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Subscriptions</h3>
//           <p className="text-gray-600 mt-2">No active subscriptions yet.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Client</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Router</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Remaining Data</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Remaining Time</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {subscriptions.map((sub) => (
//                 <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.client.name || sub.client.phonenumber}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.internet_plan?.name || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.router?.name || 'N/A'} {sub.router?.location ? `(${sub.router.location})` : ''}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sub.start_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sub.end_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.remaining_data_display || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sub.remaining_time_display || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
//                       sub.status === 'active' ? "bg-teal-100 text-teal-800" :
//                       sub.status === 'expired' ? "bg-gray-100 text-gray-800" :
//                       sub.status === 'suspended' ? "bg-yellow-100 text-yellow-800" :
//                       "bg-red-100 text-red-800"
//                     }`}>
//                       {sub.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderAnalytics = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Plan Analytics</h2>
//         <motion.button
//           onClick={() => setViewMode("list")}
//           className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Wifi className="w-5 h-5 mr-2" /> Back to Plans
//         </motion.button>
//       </div>

//       {isFetchingAnalytics ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : !analytics ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Analytics Data</h3>
//           <p className="text-gray-600 mt-2">Unable to load analytics data.</p>
//         </div>
//       ) : (
//         <div className="space-y-8">
//           {/* Summary Stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <h3 className="text-lg font-semibold mb-2 flex items-center"><Users className="w-5 h-5 mr-2 text-teal-600" /> Total Subscriptions</h3>
//               <p className="text-3xl font-bold">{analytics.total_subscriptions}</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <h3 className="text-lg font-semibold mb-2 flex items-center"><Check className="w-5 h-5 mr-2 text-teal-600" /> Active Subscriptions</h3>
//               <p className="text-3xl font-bold">{analytics.active_subscriptions}</p>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//               <h3 className="text-lg font-semibold mb-2 flex items-center"><DollarSign className="w-5 h-5 mr-2 text-teal-600" /> Total Revenue</h3>
//               <p className="text-3xl font-bold">Ksh {formatNumber(analytics.total_revenue)}</p>
//             </div>
//           </div>

//           {/* Status Counts */}
//           <div className="bg-white p-6 rounded-xl shadow-lg">
//             <h3 className="text-xl font-semibold mb-4 flex items-center"><BarChart3 className="w-6 h-6 mr-2 text-teal-600" /> Subscription Status Distribution</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {Object.entries(analytics.status_counts).map(([status, count]) => (
//                 <div key={status} className="p-4 border border-gray-200 rounded-lg text-center">
//                   <p className="text-sm font-medium text-gray-700 capitalize">{status}</p>
//                   <p className="text-2xl font-bold">{count}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Plan Stats */}
//           <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//             <h3 className="text-xl font-semibold p-6 flex items-center"><Server className="w-6 h-6 mr-2 text-teal-600" /> Plan Performance</h3>
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Subs</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Subs</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {analytics.plans.map((plan) => (
//                   <tr key={plan.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.active_subscriptions}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.total_subscriptions}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {formatNumber(plan.total_revenue)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Recent Subscriptions */}
//           <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//             <h3 className="text-xl font-semibold p-6 flex items-center"><Clock className="w-6 h-6 mr-2 text-teal-600" /> Recent Subscriptions</h3>
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {analytics.recent_subscriptions.map((sub) => (
//                   <tr key={sub.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.client.name || sub.client.phonenumber}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.internet_plan.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.start_date).toLocaleDateString()}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         sub.status === 'active' ? 'bg-green-100 text-green-800' :
//                         sub.status === 'expired' ? 'bg-gray-100 text-gray-800' :
//                         sub.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>
//                         {sub.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPlanList()}</motion.div>}
//         {viewMode === "form" && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanForm()}</motion.div>}
//         {viewMode === "details" && <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanDetails()}</motion.div>}
//         {viewMode === "subscriptions" && <motion.div key="subscriptions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderSubscriptions()}</motion.div>}
//         {viewMode === "analytics" && <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderAnalytics()}</motion.div>}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;








// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
//   Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer, Crown,
//   Cpu, HardDrive, Network, BarChart3, Gauge, Cable, UserCheck, Cloud, CloudRain, CloudSnow,
//   CloudDrizzle, CloudLightning, CloudOff, Router, Check, Filter, AlertTriangle, DollarSign
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../api";

// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// const initialFormState = {
//   planType: "Paid", name: "", price: "", active: true,
//   downloadSpeed: { value: "", unit: "Mbps" }, uploadSpeed: { value: "", unit: "Mbps" },
//   expiry: { value: "", unit: "Days" }, dataLimit: { value: "", unit: "GB" },
//   usageLimit: { value: "", unit: "Hours" }, description: "", category: "Residential",
//   purchases: 0, features: [], restrictions: [], createdAt: new Date().toISOString().split("T")[0],
//   client_sessions: {},
//   bandwidth_limit: 0,
//   concurrent_connections: 1,
//   priority_level: 4,
//   router_specific: false,
//   allowed_routers_ids: [],
//   FUP_policy: "",
//   FUP_threshold: 80,
// };

// const speedUnits = ["Kbps", "Mbps", "Gbps"];
// const expiryUnits = ["Days", "Months"];
// const dataUnits = ["GB", "TB", "Unlimited"];
// const usageUnits = ["Hours", "Unlimited"];
// const categories = ["Residential", "Business", "Promotional", "Enterprise"];
// const planTypes = ["Paid", "Free Trial"];
// const featuresOptions = [
//   "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
//   "24/7 Support", "Low Latency", "Prepaid Access", "High Priority Bandwidth", 
//   "Multiple Device Support", "Static IP Address", "VPN Access", "Gaming Optimized", 
//   "Streaming Optimized", "No Throttling", "Premium Routing"
// ];
// const restrictionsOptions = [
//   "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
//   "Rural Use Only", "Requires Signal Booster", "Speed may be reduced after fair use threshold", 
//   "Limited to specific router locations", "No torrenting or P2P allowed", 
//   "Streaming limited to SD quality", "Business use only", "Non-transferable", 
//   "Subject to fair usage policy", "Speed varies by location"
// ];

// const priorityOptions = [
//   { value: 1, label: "Lowest", icon: <CloudOff className="w-4 h-4" />, color: "text-gray-500" },
//   { value: 2, label: "Low", icon: <CloudDrizzle className="w-4 h-4" />, color: "text-blue-500" },
//   { value: 3, label: "Medium", icon: <CloudRain className="w-4 h-4" />, color: "text-green-500" },
//   { value: 4, label: "High", icon: <Cloud className="w-4 h-4" />, color: "text-yellow-500" },
//   { value: 5, label: "Highest", icon: <CloudSnow className="w-4 h-4" />, color: "text-orange-500" },
//   { value: 6, label: "Critical", icon: <CloudLightning className="w-4 h-4" />, color: "text-red-500" },
//   { value: 7, label: "Premium", icon: <Server className="w-4 h-4" />, color: "text-purple-500" },
//   { value: 8, label: "VIP", icon: <Crown className="w-4 h-4" />, color: "text-pink-500" },
// ];

// const bandwidthPresets = [
//   { value: 1024, label: "1 Mbps" },
//   { value: 2048, label: "2 Mbps" },
//   { value: 5120, label: "5 Mbps" },
//   { value: 10240, label: "10 Mbps" },
//   { value: 20480, label: "20 Mbps" },
//   { value: 51200, label: "50 Mbps" },
//   { value: 102400, label: "100 Mbps" },
//   { value: 0, label: "Unlimited" },
// ];

// const usageLimitPresets = [
//   { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: <Gift className="w-4 h-4 text-purple-600" /> },
//   { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: <Home className="w-4 h-4 text-teal-600" /> },
//   { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
//   { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: <Calendar className="w-4 h-4 text-indigo-600" /> },
//   { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: <Server className="w-4 h-4 text-blue-600" /> },
// ];

// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const formatTime = (seconds) => {
//   if (seconds <= 0) return "Expired";
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

// const formatBandwidth = (kbps) => {
//   if (kbps === 0) return "Unlimited";
//   if (kbps >= 1000) {
//     return `${(kbps / 1000).toFixed(1)} Mbps`;
//   }
//   return `${kbps} Kbps`;
// };

// // Safe Object.entries utility function
// const safeObjectEntries = (obj) => {
//   if (!obj || typeof obj !== 'object') {
//     return [];
//   }
//   return Object.entries(obj);
// };

// const CreatePlans = () => {
//   const { form, setForm, handleChange, handleNestedChange } = useForm(initialFormState);
//   const [plans, setPlans] = useState([]);
//   const [routers, setRouters] = useState([]);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [analytics, setAnalytics] = useState({
//     total_subscriptions: 0,
//     active_subscriptions: 0,
//     total_revenue: 0,
//     status_counts: {},
//     plans: [],
//     recent_subscriptions: []
//   });
//   const [compatibleRouters, setCompatibleRouters] = useState([]);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isFetchingSubs, setIsFetchingSubs] = useState(false);
//   const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);
//   const [isFetchingRouters, setIsFetchingRouters] = useState(false);
//   const [isFetchingCompatible, setIsFetchingCompatible] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);
//   const [isBandwidthMenuOpen, setIsBandwidthMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [subscriptionFilters, setSubscriptionFilters] = useState({
//     status: "",
//     plan: "",
//     router: ""
//   });

//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         const normalizedPlans = plansData.map((plan) => ({
//           ...initialFormState,
//           id: plan.id,
//           planType: plan.planType || plan.plan_type,
//           name: plan.name,
//           price: plan.price.toString(),
//           active: plan.active,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           description: plan.description,
//           category: plan.category,
//           purchases: plan.purchases,
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           createdAt: plan.created_at || plan.createdAt,
//           client_sessions: plan.client_sessions || {},
//           bandwidth_limit: plan.bandwidth_limit || 0,
//           concurrent_connections: plan.concurrent_connections || 1,
//           priority_level: plan.priority_level || 4,
//           router_specific: plan.router_specific || false,
//           allowed_routers_ids: plan.allowed_routers_ids || [],
//           FUP_policy: plan.FUP_policy || "",
//           FUP_threshold: plan.FUP_threshold || 80,
//           bandwidth_limit_display: plan.bandwidth_limit_display || formatBandwidth(plan.bandwidth_limit || 0),
//           is_unlimited_data: plan.is_unlimited_data || false,
//           is_unlimited_time: plan.is_unlimited_time || false,
//         }));
//         setPlans(normalizedPlans);
//       } catch (error) {
//         console.error("Error fetching plans:", error);
//         toast.error("Failed to load plans from server.");
//         setPlans([]);
//       } finally {
//         setIsFetching(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   useEffect(() => {
//     const fetchRouters = async () => {
//       setIsFetchingRouters(true);
//       try {
//         const response = await api.get("/api/network_management/routers/");
//         setRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching routers:", error);
//         toast.error("Failed to load routers from server.");
//         setRouters([]);
//       } finally {
//         setIsFetchingRouters(false);
//       }
//     };
    
//     if (viewMode === "form" || viewMode === "subscriptions" || viewMode === "details") {
//       fetchRouters();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchSubscriptions = async () => {
//       setIsFetchingSubs(true);
//       try {
//         let url = "/api/internet_plans/subscriptions/";
//         const params = new URLSearchParams();
        
//         if (subscriptionFilters.status) params.append('status', subscriptionFilters.status);
//         if (subscriptionFilters.plan) params.append('plan', subscriptionFilters.plan);
//         if (subscriptionFilters.router) params.append('router', subscriptionFilters.router);
        
//         if (params.toString()) url += `?${params.toString()}`;
        
//         const response = await api.get(url);
//         const subsData = response.data;
//         if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
//         setSubscriptions(subsData);
//       } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         toast.error("Failed to load subscriptions from server.");
//         setSubscriptions([]);
//       } finally {
//         setIsFetchingSubs(false);
//       }
//     };
//     if (viewMode === "subscriptions") {
//       fetchSubscriptions();
//     }
//   }, [viewMode, subscriptionFilters]);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       setIsFetchingAnalytics(true);
//       try {
//         const response = await api.get("/api/internet_plans/subscription-analytics/");
//         setAnalytics(response.data);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//         toast.error("Failed to load analytics from server.");
//         setAnalytics({
//           total_subscriptions: 0,
//           active_subscriptions: 0,
//           total_revenue: 0,
//           status_counts: {},
//           plans: [],
//           recent_subscriptions: []
//         });
//       } finally {
//         setIsFetchingAnalytics(false);
//       }
//     };
//     if (viewMode === "analytics") {
//       fetchAnalytics();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchCompatibleRouters = async () => {
//       if (!selectedPlan?.id || !selectedPlan.router_specific) return;
//       setIsFetchingCompatible(true);
//       try {
//         const response = await api.get(`/api/internet_plans/${selectedPlan.id}/compatible-routers/`);
//         setCompatibleRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching compatible routers:", error);
//         toast.error("Failed to load compatible routers.");
//         setCompatibleRouters([]);
//       } finally {
//         setIsFetchingCompatible(false);
//       }
//     };
//     if (viewMode === "details") {
//       fetchCompatibleRouters();
//     }
//   }, [viewMode, selectedPlan]);

//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   useEffect(() => {
//     if (form.dataLimit.unit === "Unlimited") {
//       handleNestedChange("dataLimit", "value", "Unlimited");
//     }
//   }, [form.dataLimit.unit]);

//   useEffect(() => {
//     if (form.usageLimit.unit === "Unlimited") {
//       handleNestedChange("usageLimit", "value", "Unlimited");
//     }
//   }, [form.usageLimit.unit]);

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => {
//         const updatedFeatures = [...prev.features, newFeature];
//         return { ...prev, features: updatedFeatures };
//       });
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => {
//         const updatedRestrictions = [...prev.restrictions, newRestriction];
//         return { ...prev, restrictions: updatedRestrictions };
//       });
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => {
//       const updatedList = prev[list].filter((i) => i !== item);
//       return { ...prev, [list]: updatedList };
//     });
//   };

//   const toggleRouterSelection = (routerId) => {
//     setForm((prev) => {
//       const currentRouters = [...prev.allowed_routers_ids];
//       const index = currentRouters.indexOf(routerId);
      
//       if (index > -1) {
//         currentRouters.splice(index, 1);
//       } else {
//         currentRouters.push(routerId);
//       }
      
//       return { ...prev, allowed_routers_ids: currentRouters };
//     });
//   };

//   const validateAndSavePlan = async () => {
//     const requiredFields = [
//       !form.planType && "Plan Type", !form.name && "Plan Name", !form.category && "Category",
//       form.planType === "Paid" && (!form.price || form.price === "") && "Price",
//       !form.downloadSpeed.value && "Download Speed", !form.uploadSpeed.value && "Upload Speed",
//       !form.expiry.value && "Expiry Duration", !form.dataLimit.value && "Data Limit",
//       !form.usageLimit.value && "Usage Limit", !form.description && "Description",
//     ].filter(Boolean);

//     if (requiredFields.length > 0) {
//       toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
//       return;
//     }

//     if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
//       toast.error("Price must be a positive number for paid plans.");
//       return;
//     }

//     const downloadSpeed = parseFloat(form.downloadSpeed.value);
//     const uploadSpeed = parseFloat(form.uploadSpeed.value);
//     const expiry = parseInt(form.expiry.value, 10);

//     if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
//       toast.error("Download speed must be a positive number.");
//       return;
//     }
//     if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
//       toast.error("Upload speed must be a positive number.");
//       return;
//     }
//     if (isNaN(expiry) || expiry <= 0) {
//       toast.error("Expiry duration must be a positive integer.");
//       return;
//     }

//     if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
//       toast.error("When data unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }
//     if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
//       toast.error("When usage unit is Unlimited, value must be 'Unlimited'.");
//       return;
//     }

//     if (form.dataLimit.unit !== "Unlimited") {
//       const dataValue = parseFloat(form.dataLimit.value);
//       if (isNaN(dataValue) || dataValue <= 0 || form.dataLimit.value.toLowerCase() === "unlimited") {
//         toast.error("Data limit must be a positive number when unit is not Unlimited.");
//         return;
//       }
//     }

//     if (form.usageLimit.unit !== "Unlimited") {
//       const usageValue = parseFloat(form.usageLimit.value);
//       if (isNaN(usageValue) || usageValue <= 0 || form.usageLimit.value.toLowerCase() === "unlimited") {
//         toast.error("Usage limit must be a positive number when unit is not Unlimited.");
//         return;
//       }
//     }

//     if (form.planType === "Free Trial") {
//       if (parseFloat(form.price) !== 0) {
//         toast.error("Free Trial plans must have price set to 0.");
//         return;
//       }
//       if (form.router_specific) {
//         toast.error("Free Trial plans cannot be router-specific.");
//         return;
//       }
//       if (form.priority_level > 4) {
//         toast.error("Free Trial plans cannot have premium priority levels.");
//         return;
//       }
//     }

//     const planData = {
//       planType: form.planType,
//       name: form.name,
//       price: parseFloat(form.price) || 0,
//       active: form.active,
//       downloadSpeed: form.downloadSpeed,
//       uploadSpeed: form.uploadSpeed,
//       expiry: form.expiry,
//       dataLimit: form.dataLimit,
//       usageLimit: form.usageLimit,
//       description: form.description,
//       category: form.category,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       features: form.features,
//       restrictions: form.restrictions,
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//       bandwidth_limit: form.bandwidth_limit,
//       concurrent_connections: form.concurrent_connections,
//       priority_level: form.priority_level,
//       router_specific: form.router_specific,
//       allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
//       FUP_policy: form.FUP_policy,
//       FUP_threshold: form.FUP_threshold,
//     };

//     try {
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
//         toast.success(`Updated plan: ${planData.name}`);
//       } else {
//         response = await api.post("/api/internet_plans/", planData);
//         setPlans((prev) => [...prev, response.data]);
//         toast.success(`Created plan: ${planData.name}`);
//       }
//       setForm(deepClone(initialFormState));
//       setEditingPlan(null);
//       setViewMode("list");
//     } catch (error) {
//       console.error("Error saving plan:", error.response?.data || error.message);
//       const errorDetails = error.response?.data?.details || error.response?.data || error.message;
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${JSON.stringify(errorDetails)}`);
//     }
//   };

//   const deletePlan = async (planId, planName) => {
//     if (window.confirm(`Delete "${planName}"?`)) {
//       try {
//         await api.delete(`/api/internet_plans/${planId}/`);
//         setPlans((prev) => prev.filter((p) => p.id !== planId));
//         if (selectedPlan && selectedPlan.id === planId) {
//           setSelectedPlan(null);
//           setViewMode("list");
//         }
//         toast.success(`Deleted plan: ${planName}`);
//       } catch (error) {
//         console.error("Error deleting plan:", error);
//         toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
//       }
//     }
//   };

//   const activatePlanOnRouter = async (planId, routerId) => {
//     try {
//       const response = await api.post(`/api/internet_plans/${planId}/activate-on-router/${routerId}/`);
//       toast.success(response.data.message);
//     } catch (error) {
//       console.error("Error activating plan on router:", error);
//       toast.error(`Failed to activate: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   const sortedPlans = [...plans]
//     .filter(
//       (plan) =>
//         (filterCategory === "All" || plan.category === filterCategory) &&
//         (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
//     )
//     .sort((a, b) => {
//       let aValue, bValue;
//       if (sortConfig.key.includes(".")) {
//         const [parent, child] = sortConfig.key.split(".");
//         aValue = a[parent] ? a[parent][child] : "";
//         bValue = b[parent] ? b[parent][child] : "";
//       } else {
//         aValue = a[sortConfig.key] || "";
//         bValue = b[sortConfig.key] || "";
//       }
//       if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
//         aValue = parseFloat(aValue);
//         bValue = parseFloat(bValue);
//       }
//       return sortConfig.direction === "asc"
//         ? typeof aValue === "string"
//           ? aValue.localeCompare(bValue)
//           : aValue - bValue
//         : typeof bValue === "string"
//           ? bValue.localeCompare(aValue)
//           : bValue - aValue;
//     });

//   const requestSort = (key) => {
//     setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
//         ))}
//         <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
//       </div>
//     );
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       Residential: <Home className="w-4 h-4 text-teal-600" />,
//       Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Gift className="w-4 h-4 text-purple-600" />,
//       Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
//     };
//     return icons[category] || null;
//   };

//   const handleUsagePresetSelect = (hours) => {
//     handleNestedChange("usageLimit", "value", hours);
//     handleNestedChange("usageLimit", "unit", "Hours");
//     setIsUsageMenuOpen(false);
//   };

//   const handleBandwidthPresetSelect = (value) => {
//     setForm((prev) => ({ ...prev, bandwidth_limit: value }));
//     setIsBandwidthMenuOpen(false);
//   };

//   const handleSubscriptionFilterChange = (filter, value) => {
//     setSubscriptionFilters((prev) => ({ ...prev, [filter]: value }));
//   };

//   const renderPlanList = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ConnectSphere Packages</h2>
//         <div className="flex space-x-4">
//           <motion.button
//             onClick={() => setViewMode("analytics")}
//             className="px-5 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <BarChart3 className="w-5 h-5 mr-2" /> Analytics
//           </motion.button>
//           <motion.button
//             onClick={() => setViewMode("subscriptions")}
//             className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Users className="w-5 h-5 mr-2" /> View Subscriptions
//           </motion.button>
//           <motion.button
//             onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
//             className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             <Plus className="w-5 h-5 mr-2" /> New Plan
//           </motion.button>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <select
//           value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//         </select>
//         <input
//           type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex-1 bg-white"
//         />
//       </div>

//       {isFetching ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : plans.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Plans Available</h3>
//           <p className="text-gray-600 mt-2">Create a new plan to get started!</p>
//           <motion.button
//             onClick={() => setViewMode("form")}
//             className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all"
//             whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           >
//             Create Plan
//           </motion.button>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 {[
//                   { key: "name", label: "Name" }, { key: "planType", label: "Type" },
//                   { key: "category", label: "Category" }, { key: "price", label: "Price" },
//                   { key: "bandwidth_limit", label: "Bandwidth" }, { key: "purchases", label: "Subscribers" },
//                   { key: "actions", label: "Actions" },
//                 ].map((column) => (
//                   <th
//                     key={column.key} onClick={() => column.key !== "actions" && requestSort(column.key)}
//                     className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""}`}
//                   >
//                     <div className="flex items-center">
//                       {column.label}
//                       {sortConfig.key === column.key && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />)}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedPlans.map((plan) => (
//                 <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">{getCategoryIcon(plan.category)}<span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span></div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.bandwidth_limit_display}</td>
//                   <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><Users className="w-4 h-4 text-gray-400 mr-2" />{plan.purchases} {renderStars(plan.purchases)}</div></td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-4">
//                       <motion.button onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} className="focus:outline-none" whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
//                       </motion.button>
//                       <motion.button onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} className="focus:outline-none" whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 300 }}>
//                         <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           const copiedPlan = { ...deepClone(plan), name: `Copy of ${plan.name}`, id: null, purchases: 0, client_sessions: {}, createdAt: new Date().toISOString().split("T")[0] };
//                           setForm(copiedPlan); setEditingPlan(null); setViewMode("form");
//                         }}
//                         className="focus:outline-none" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
//                       >
//                         <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
//                       </motion.button>
//                       <motion.button onClick={() => deletePlan(plan.id, plan.name)} className="focus:outline-none" whileHover={{ x: [0, -2, 2, -2, 0] }} transition={{ duration: 0.3 }}>
//                         <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
//                       </motion.button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderPlanForm = () => (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{editingPlan ? "Edit Plan" : "New Plan"}</h2>
//         <motion.button onClick={() => { setViewMode("list"); setForm(deepClone(initialFormState)); setEditingPlan(null); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100">
//         <div className="flex space-x-2">
//           {["basic", "specifications", "advanced", "description", "features"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 activeTab === tab 
//                   ? "bg-teal-600 text-white" 
//                   : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-8">
//         {/* Basic Details Tab */}
//         {activeTab === "basic" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Plan Type <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Paid or Free Trial</span></label>
//                   <select name="planType" value={form.planType || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                     <option value="" disabled>Select Plan Type</option>
//                     {planTypes.map((type) => <option key={type} value={type}>{type}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Unique plan identifier</span></label>
//                   <input name="name" value={form.name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., Rural Wi-Fi Pro" required />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Target user group</span></label>
//                   <select name="category" value={form.category || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
//                     <option value="" disabled>Select Category</option>
//                     {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings</span></label>
//                   <input
//                     type="number" name="price" value={form.price || ""} onChange={handleChange} disabled={form.planType !== "Paid"}
//                     className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${form.planType !== "Paid" ? "bg-gray-100 cursor-not-allowed" : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"}`}
//                     placeholder="e.g., 29.99" step="0.01" min="0" required={form.planType === "Paid"}
//                   />
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <label className="block text-sm font-medium text-gray-700 mr-4">Active<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Enable or disable plan</span></label>
//                 <div onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.active ? "translate-x-6" : "translate-x-1"}`} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Specifications Tab */}
//         {activeTab === "specifications" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Download Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.downloadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 10" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                   <select value={form.downloadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.uploadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 2" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                   <select value={form.uploadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
//                   <input 
//                     type="number" 
//                     value={form.expiry.value || ""} 
//                     onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     min="1" 
//                     step="1" 
//                     placeholder="e.g., 30" 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration type</span></label>
//                   <select value={form.expiry.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Total data allowance (e.g., 50 GB)</span></label>
//                   <input 
//                     value={form.dataLimit.value || ""} 
//                     onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     placeholder={form.dataLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 50"} 
//                     disabled={form.dataLimit.unit === "Unlimited"} 
//                     required 
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
//                   <select value={form.dataLimit.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max usage time (e.g., 720 hours)</span></label>
//                   <input 
//                     value={form.usageLimit.value || ""} 
//                     onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} 
//                     className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                     placeholder={form.usageLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 720"} 
//                     disabled={form.usageLimit.unit === "Unlimited"} 
//                     required 
//                   />
//                   <motion.button 
//                     onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)} 
//                     className="absolute right-2 top-8 px-2 py-1 text-xs text-teal-600 hover:text-teal-800"
//                     whileHover={{ scale: 1.05 }}
//                   >
//                     Presets
//                   </motion.button>
//                   <AnimatePresence>
//                     {isUsageMenuOpen && (
//                       <motion.div 
//                         initial={{ opacity: 0, y: -10 }} 
//                         animate={{ opacity: 1, y: 0 }} 
//                         exit={{ opacity: 0, y: -10 }} 
//                         className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200"
//                       >
//                         {usageLimitPresets.map((preset) => (
//                           <div 
//                             key={preset.hours} 
//                             onClick={() => handleUsagePresetSelect(preset.hours)} 
//                             className="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
//                           >
//                             {preset.icon}
//                             <div>
//                               <p className="text-sm font-medium text-gray-900">{preset.days} Days ({preset.hours} Hours)</p>
//                               <p className="text-xs text-gray-600">{preset.description}</p>
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Usage measurement</span></label>
//                   <select value={form.usageLimit.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                     {usageUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Advanced Settings Tab */}
//         {activeTab === "advanced" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Settings</h3>
//             <div className="space-y-6">
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">Bandwidth Limit (Kbps)<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max bandwidth in Kbps (0 for unlimited)</span></label>
//                 <input 
//                   type="number" 
//                   value={form.bandwidth_limit || 0} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, bandwidth_limit: parseInt(e.target.value, 10) || 0 }))} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   min="0" 
//                   step="1" 
//                   placeholder="e.g., 10240" 
//                 />
//                 <motion.button 
//                   onClick={() => setIsBandwidthMenuOpen(!isBandwidthMenuOpen)} 
//                   className="absolute right-2 top-8 px-2 py-1 text-xs text-teal-600 hover:text-teal-800"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Presets
//                 </motion.button>
//                 <AnimatePresence>
//                   {isBandwidthMenuOpen && (
//                     <motion.div 
//                       initial={{ opacity: 0, y: -10 }} 
//                       animate={{ opacity: 1, y: 0 }} 
//                       exit={{ opacity: 0, y: -10 }} 
//                       className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200"
//                     >
//                       {bandwidthPresets.map((preset) => (
//                         <div 
//                           key={preset.value} 
//                           onClick={() => handleBandwidthPresetSelect(preset.value)} 
//                           className="p-3 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
//                         >
//                           <Gauge className="w-4 h-4 text-teal-600" />
//                           <p className="text-sm font-medium text-gray-900">{preset.label} ({preset.value} Kbps)</p>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Concurrent Connections<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max simultaneous devices</span></label>
//                 <input 
//                   type="number" 
//                   value={form.concurrent_connections || 1} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, concurrent_connections: parseInt(e.target.value, 10) || 1 }))} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   min="1" 
//                   step="1" 
//                   placeholder="e.g., 5" 
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Priority Level<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> QoS priority (higher = better)</span></label>
//                 <select 
//                   value={form.priority_level || 4} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, priority_level: parseInt(e.target.value, 10) }))} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {priorityOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex items-center">
//                 <label className="block text-sm font-medium text-gray-700 mr-4">Router Specific<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limit to specific routers</span></label>
//                 <div onClick={() => setForm((prev) => ({ ...prev, router_specific: !prev.router_specific }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.router_specific ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.router_specific ? "translate-x-6" : "translate-x-1"}`} />
//                 </div>
//               </div>
//               {form.router_specific && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Routers<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Select compatible routers</span></label>
//                   {isFetchingRouters ? (
//                     <FaSpinner className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
//                   ) : routers.length === 0 ? (
//                     <p className="text-sm text-gray-600">No routers available.</p>
//                   ) : (
//                     <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
//                       {routers.map((router) => (
//                         <div key={router.id} className="flex items-center">
//                           <input 
//                             type="checkbox" 
//                             checked={form.allowed_routers_ids.includes(router.id)} 
//                             onChange={() => toggleRouterSelection(router.id)} 
//                             className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" 
//                           />
//                           <label className="ml-2 text-sm text-gray-900">{router.name || `Router ${router.id}`}</label>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">FUP Policy<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Fair Usage Policy description</span></label>
//                 <input 
//                   value={form.FUP_policy || ""} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, FUP_policy: e.target.value }))} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   placeholder="e.g., Speed reduced to 1Mbps after threshold" 
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">FUP Threshold (%)<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Percentage of data limit for FUP</span></label>
//                 <input 
//                   type="number" 
//                   value={form.FUP_threshold || 80} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, FUP_threshold: parseInt(e.target.value, 10) || 80 }))} 
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
//                   min="0" 
//                   max="100" 
//                   step="1" 
//                   placeholder="e.g., 80" 
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Description Tab */}
//         {activeTab === "description" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Plan Description</h3>
//             <div data-color-mode="light">
//               <MDEditor 
//                 value={form.description || ""} 
//                 onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} 
//                 height={400} 
//                 preview="edit" 
//               />
//             </div>
//           </div>
//         )}

//         {/* Features & Restrictions Tab */}
//         {activeTab === "features" && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//             <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Features<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Key benefits</span></label>
//                 <div className="space-y-2">
//                   <div className="flex space-x-2">
//                     <select 
//                       value={newFeature} 
//                       onChange={(e) => setNewFeature(e.target.value)} 
//                       className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                     >
//                       <option value="">Select or type custom</option>
//                       {featuresOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
//                     </select>
//                     <motion.button onClick={addFeature} className="px-4 py-2 bg-teal-600 text-white rounded-lg" whileHover={{ scale: 1.05 }}>
//                       <Plus className="w-4 h-4" />
//                     </motion.button>
//                   </div>
//                   <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
//                     {form.features.map((feature) => (
//                       <div key={feature} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
//                         <span className="text-sm text-gray-900">{feature}</span>
//                         <button onClick={() => removeListItem("features", feature)} className="text-red-600 hover:text-red-800">
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Restrictions<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Usage limitations</span></label>
//                 <div className="space-y-2">
//                   <div className="flex space-x-2">
//                     <select 
//                       value={newRestriction} 
//                       onChange={(e) => setNewRestriction(e.target.value)} 
//                       className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                     >
//                       <option value="">Select or type custom</option>
//                       {restrictionsOptions.map((restriction) => <option key={restriction} value={restriction}>{restriction}</option>)}
//                     </select>
//                     <motion.button onClick={addRestriction} className="px-4 py-2 bg-teal-600 text-white rounded-lg" whileHover={{ scale: 1.05 }}>
//                       <Plus className="w-4 h-4" />
//                     </motion.button>
//                   </div>
//                   <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
//                     {form.restrictions.map((restriction) => (
//                       <div key={restriction} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
//                         <span className="text-sm text-gray-900">{restriction}</span>
//                         <button onClick={() => removeListItem("restrictions", restriction)} className="text-red-600 hover:text-red-800">
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex justify-end space-x-4">
//         <motion.button 
//           onClick={() => { setViewMode("list"); setForm(deepClone(initialFormState)); setEditingPlan(null); }} 
//           className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-all"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           Cancel
//         </motion.button>
//         <motion.button 
//           onClick={validateAndSavePlan} 
//           className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Save className="w-5 h-5 mr-2" /> {editingPlan ? "Update Plan" : "Create Plan"}
//         </motion.button>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedPlan.name} Details</h2>
//         <motion.button onClick={() => { setViewMode("list"); setSelectedPlan(null); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
//           <h3 className="text-xl font-semibold text-gray-900">Plan Overview</h3>
//           <div className="space-y-4">
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Type:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.planType}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Category:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.category}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Price:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.planType === "Paid" ? `Ksh ${formatNumber(selectedPlan.price)}` : "Free"}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Active:</span>
//               <span className={`text-sm ${selectedPlan.active ? "text-green-600" : "text-red-600"}`}>{selectedPlan.active ? "Yes" : "No"}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Subscribers:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.purchases} {renderStars(selectedPlan.purchases)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Created:</span>
//               <span className="text-sm text-gray-900">{new Date(selectedPlan.createdAt).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
//           <h3 className="text-xl font-semibold text-gray-900">Technical Specs</h3>
//           <div className="space-y-4">
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Download Speed:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Upload Speed:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.uploadSpeed.value} {selectedPlan.uploadSpeed.unit}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Bandwidth Limit:</span>
//               <span className="text-sm text-gray-900">{formatBandwidth(selectedPlan.bandwidth_limit)}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Expiry:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Data Limit:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Usage Limit:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.usageLimit.value} {selectedPlan.usageLimit.unit}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Concurrent Connections:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.concurrent_connections}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Priority Level:</span>
//               <span className="text-sm text-gray-900">{priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.label || "Unknown"}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">Router Specific:</span>
//               <span className={`text-sm ${selectedPlan.router_specific ? "text-green-600" : "text-red-600"}`}>{selectedPlan.router_specific ? "Yes" : "No"}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">FUP Threshold:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.FUP_threshold}%</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-sm font-medium text-gray-700">FUP Policy:</span>
//               <span className="text-sm text-gray-900">{selectedPlan.FUP_policy || "None"}</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 lg:col-span-2">
//           <h3 className="text-xl font-semibold text-gray-900">Description</h3>
//           <div data-color-mode="light">
//             <MDEditor.Markdown source={selectedPlan.description} />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
//           <h3 className="text-xl font-semibold text-gray-900">Features</h3>
//           {selectedPlan.features.length > 0 ? (
//             <ul className="space-y-2">
//               {selectedPlan.features.map((feature) => (
//                 <li key={feature} className="flex items-center text-sm text-gray-900">
//                   <Check className="w-4 h-4 text-green-600 mr-2" /> {feature}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-sm text-gray-600">No features listed.</p>
//           )}
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
//           <h3 className="text-xl font-semibold text-gray-900">Restrictions</h3>
//           {selectedPlan.restrictions.length > 0 ? (
//             <ul className="space-y-2">
//               {selectedPlan.restrictions.map((restriction) => (
//                 <li key={restriction} className="flex items-center text-sm text-gray-900">
//                   <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" /> {restriction}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-sm text-gray-600">No restrictions listed.</p>
//           )}
//         </div>

//         {selectedPlan.router_specific && (
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 lg:col-span-2">
//             <h3 className="text-xl font-semibold text-gray-900">Compatible Routers</h3>
//             {isFetchingCompatible ? (
//               <FaSpinner className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
//             ) : compatibleRouters.length === 0 ? (
//               <p className="text-sm text-gray-600">No compatible routers found.</p>
//             ) : (
//               <div className="space-y-4">
//                 {compatibleRouters.map((router) => (
//                   <div key={router.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center space-x-3">
//                       <Router className="w-5 h-5 text-teal-600" />
//                       <span className="text-sm font-medium text-gray-900">{router.name || `Router ${router.id}`}</span>
//                     </div>
//                     <motion.button 
//                       onClick={() => activatePlanOnRouter(selectedPlan.id, router.id)} 
//                       className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center"
//                       whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//                     >
//                       <Zap className="w-4 h-4 mr-2" /> Activate
//                     </motion.button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-6 lg:col-span-2">
//           <h3 className="text-xl font-semibold text-gray-900">Active Sessions</h3>
//           {Object.keys(selectedPlan.client_sessions).length > 0 ? (
//             <div className="space-y-4">
//               {safeObjectEntries(selectedPlan.client_sessions).map(([clientId, session]) => (
//                 <div key={clientId} className="p-4 bg-gray-50 rounded-lg space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm font-medium text-gray-700">Client ID:</span>
//                     <span className="text-sm text-gray-900">{clientId}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm font-medium text-gray-700">Remaining Time:</span>
//                     <span className="text-sm text-gray-900">{formatTime(session.remaining_time)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm font-medium text-gray-700">Data Used:</span>
//                     <span className="text-sm text-gray-900">{formatBytes(session.data_used)}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-600">No active sessions.</p>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-end space-x-4">
//         <motion.button 
//           onClick={() => { setForm(deepClone(selectedPlan)); setEditingPlan(selectedPlan); setViewMode("form"); }} 
//           className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Pencil className="w-5 h-5 mr-2" /> Edit Plan
//         </motion.button>
//         <motion.button 
//           onClick={() => deletePlan(selectedPlan.id, selectedPlan.name)} 
//           className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Trash2 className="w-5 h-5 mr-2" /> Delete Plan
//         </motion.button>
//       </div>
//     </div>
//   );

//   const renderSubscriptions = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Subscriptions</h2>
//         <motion.button onClick={() => setViewMode("list")} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       <div className="flex gap-4">
//         <select 
//           value={subscriptionFilters.status} 
//           onChange={(e) => handleSubscriptionFilterChange("status", e.target.value)} 
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="">All Statuses</option>
//           <option value="active">Active</option>
//           <option value="expired">Expired</option>
//           <option value="suspended">Suspended</option>
//         </select>
//         <select 
//           value={subscriptionFilters.plan} 
//           onChange={(e) => handleSubscriptionFilterChange("plan", e.target.value)} 
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="">All Plans</option>
//           {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
//         </select>
//         <select 
//           value={subscriptionFilters.router} 
//           onChange={(e) => handleSubscriptionFilterChange("router", e.target.value)} 
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="">All Routers</option>
//           {routers.map((router) => <option key={router.id} value={router.id}>{router.name || `Router ${router.id}`}</option>)}
//         </select>
//       </div>

//       {isFetchingSubs ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : subscriptions.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-lg p-6 text-center">
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-900">No Subscriptions Found</h3>
//           <p className="text-gray-600 mt-2">Try adjusting the filters.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 {["ID", "User", "Plan", "Router", "Status", "Start Date", "End Date", "Data Used", "Time Remaining"].map((header) => (
//                   <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {subscriptions.map((sub) => (
//                 <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.id}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.user?.username || "Unknown"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.plan?.name || "Unknown"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.router?.name || "Unknown"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${sub.status === "active" ? "bg-green-100 text-green-800" : sub.status === "expired" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
//                       {sub.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(sub.start_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(sub.end_date).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatBytes(sub.data_used)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(sub.remaining_time)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );

//   const renderAnalytics = () => (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Subscription Analytics</h2>
//         <motion.button onClick={() => setViewMode("list")} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {isFetchingAnalytics ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
//             <Users className="w-12 h-12 text-teal-600 mb-4" />
//             <h3 className="text-2xl font-bold text-gray-900">{analytics.total_subscriptions}</h3>
//             <p className="text-sm text-gray-600">Total Subscriptions</p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
//             <Shield className="w-12 h-12 text-green-600 mb-4" />
//             <h3 className="text-2xl font-bold text-gray-900">{analytics.active_subscriptions}</h3>
//             <p className="text-sm text-gray-600">Active Subscriptions</p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
//             <DollarSign className="w-12 h-12 text-purple-600 mb-4" />
//             <h3 className="text-2xl font-bold text-gray-900">Ksh {formatNumber(analytics.total_revenue)}</h3>
//             <p className="text-sm text-gray-600">Total Revenue</p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
//             <BarChart3 className="w-12 h-12 text-indigo-600 mb-4" />
//             <h3 className="text-2xl font-bold text-gray-900">{(analytics.plans || []).length}</h3>
//             <p className="text-sm text-gray-600">Plans Analyzed</p>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Status Distribution</h3>
//           {Object.keys(analytics.status_counts || {}).length > 0 ? (
//             <div className="space-y-4">
//               {safeObjectEntries(analytics.status_counts || {}).map(([status, count]) => (
//                 <div key={status} className="flex items-center justify-between">
//                   <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
//                   <span className="text-sm text-gray-900">{count}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-600">No status data available.</p>
//           )}
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Plans</h3>
//           {(analytics.plans || []).length > 0 ? (
//             <div className="space-y-4">
//               {(analytics.plans || []).map((plan) => (
//                 <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <span className="text-sm font-medium text-gray-900">{plan.name}</span>
//                   <span className="text-sm text-gray-600">{plan.subscriptions} subs | Ksh {formatNumber(plan.revenue)}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-600">No plan data available.</p>
//           )}
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 lg:col-span-2">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Subscriptions</h3>
//           {(analytics.recent_subscriptions || []).length > 0 ? (
//             <div className="space-y-4">
//               {(analytics.recent_subscriptions || []).map((sub) => (
//                 <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     <UserCheck className="w-5 h-5 text-teal-600" />
//                     <span className="text-sm text-gray-900">{sub.user?.username || "Unknown"} - {sub.plan?.name || "Unknown"}</span>
//                   </div>
//                   <span className="text-sm text-gray-600">{new Date(sub.start_date).toLocaleDateString()}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-600">No recent subscriptions.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {viewMode === "list" && renderPlanList()}
//       {viewMode === "form" && renderPlanForm()}
//       {viewMode === "details" && selectedPlan && renderPlanDetails()}
//       {viewMode === "subscriptions" && renderSubscriptions()}
//       {viewMode === "analytics" && renderAnalytics()}
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
//     </>
//   );
// };

// export default CreatePlans;













// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
//   Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer, Crown,
//   Cpu, HardDrive, Network, BarChart3, Gauge, Cable, UserCheck, Cloud, CloudRain, CloudSnow,
//   CloudDrizzle, CloudLightning, CloudOff, Router, Check, Filter, AlertTriangle, DollarSign,
//   Sun, Moon
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../api";
// import { useTheme } from "../../context/ThemeContext";

// // Custom hook for form management with theme support
// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const [errors, setErrors] = useState({});
  
//   const handleChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   }, [errors]);

//   const handleNestedChange = useCallback((field, key, value) => {
//     setForm(prev => ({ 
//       ...prev, 
//       [field]: { ...prev[field], [key]: value } 
//     }));
//   }, []);

//   const validateField = useCallback((name, value) => {
//     const newErrors = { ...errors };
    
//     switch (name) {
//       case 'name':
//         if (!value.trim()) newErrors[name] = 'Plan name is required';
//         else if (value.trim().length < 2) newErrors[name] = 'Plan name must be at least 2 characters';
//         break;
//       case 'price':
//         if (form.planType === 'Paid' && (!value || parseFloat(value) <= 0)) {
//           newErrors[name] = 'Price must be a positive number for paid plans';
//         }
//         break;
//       default:
//         break;
//     }
    
//     setErrors(newErrors);
//     return !newErrors[name];
//   }, [errors, form.planType]);

//   return { 
//     form, 
//     setForm, 
//     errors,
//     setErrors,
//     handleChange, 
//     handleNestedChange,
//     validateField
//   };
// };

// // Utility functions with theme consideration
// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, { 
//     minimumFractionDigits: decimals, 
//     maximumFractionDigits: decimals 
//   });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => {
//   if (!obj || typeof obj !== 'object') return obj;
//   return JSON.parse(JSON.stringify(obj));
// };

// // Memoized initial state to prevent unnecessary recreations
// const getInitialFormState = () => ({
//   planType: "Paid", 
//   name: "", 
//   price: "", 
//   active: true,
//   downloadSpeed: { value: "", unit: "Mbps" }, 
//   uploadSpeed: { value: "", unit: "Mbps" },
//   expiry: { value: "", unit: "Days" }, 
//   dataLimit: { value: "", unit: "GB" },
//   usageLimit: { value: "", unit: "Hours" }, 
//   description: "", 
//   category: "Residential",
//   purchases: 0, 
//   features: [], 
//   restrictions: [], 
//   createdAt: new Date().toISOString().split("T")[0],
//   client_sessions: {},
//   bandwidth_limit: 0,
//   concurrent_connections: 1,
//   priority_level: 4,
//   router_specific: false,
//   allowed_routers_ids: [],
//   FUP_policy: "",
//   FUP_threshold: 80,
// });

// // Memoized constants for better performance
// const speedUnits = Object.freeze(["Kbps", "Mbps", "Gbps"]);
// const expiryUnits = Object.freeze(["Days", "Months"]);
// const dataUnits = Object.freeze(["GB", "TB", "Unlimited"]);
// const usageUnits = Object.freeze(["Hours", "Unlimited"]);
// const categories = Object.freeze(["Residential", "Business", "Promotional", "Enterprise"]);
// const planTypes = Object.freeze(["Paid", "Free Trial"]);

// const featuresOptions = Object.freeze([
//   "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
//   "24/7 Support", "Low Latency", "Prepaid Access", "High Priority Bandwidth", 
//   "Multiple Device Support", "Static IP Address", "VPN Access", "Gaming Optimized", 
//   "Streaming Optimized", "No Throttling", "Premium Routing"
// ]);

// const restrictionsOptions = Object.freeze([
//   "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
//   "Rural Use Only", "Requires Signal Booster", "Speed may be reduced after fair use threshold", 
//   "Limited to specific router locations", "No torrenting or P2P allowed", 
//   "Streaming limited to SD quality", "Business use only", "Non-transferable", 
//   "Subject to fair usage policy", "Speed varies by location"
// ]);

// const priorityOptions = Object.freeze([
//   { value: 1, label: "Lowest", icon: CloudOff, color: "text-gray-500" },
//   { value: 2, label: "Low", icon: CloudDrizzle, color: "text-blue-500" },
//   { value: 3, label: "Medium", icon: CloudRain, color: "text-green-500" },
//   { value: 4, label: "High", icon: Cloud, color: "text-yellow-500" },
//   { value: 5, label: "Highest", icon: CloudSnow, color: "text-orange-500" },
//   { value: 6, label: "Critical", icon: CloudLightning, color: "text-red-500" },
//   { value: 7, label: "Premium", icon: Server, color: "text-purple-500" },
//   { value: 8, label: "VIP", icon: Crown, color: "text-pink-500" },
// ]);

// const bandwidthPresets = Object.freeze([
//   { value: 1024, label: "1 Mbps" },
//   { value: 2048, label: "2 Mbps" },
//   { value: 5120, label: "5 Mbps" },
//   { value: 10240, label: "10 Mbps" },
//   { value: 20480, label: "20 Mbps" },
//   { value: 51200, label: "50 Mbps" },
//   { value: 102400, label: "100 Mbps" },
//   { value: 0, label: "Unlimited" },
// ]);

// const usageLimitPresets = Object.freeze([
//   { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: Gift },
//   { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: Home },
//   { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: Briefcase },
//   { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: Calendar },
//   { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: Server },
// ]);

// // Utility functions
// const formatBytes = (bytes, decimals = 2) => {
//   if (bytes === 0) return "0 Bytes";
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
// };

// const formatTime = (seconds) => {
//   if (seconds <= 0) return "Expired";
  
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;
  
//   if (hours > 0) {
//     return `${hours}h ${minutes}m ${secs}s`;
//   } else if (minutes > 0) {
//     return `${minutes}m ${secs}s`;
//   } else {
//     return `${secs}s`;
//   }
// };

// const formatBandwidth = (kbps) => {
//   if (kbps === 0) return "Unlimited";
//   if (kbps >= 1000) {
//     return `${(kbps / 1000).toFixed(1)} Mbps`;
//   }
//   return `${kbps} Kbps`;
// };

// const safeObjectEntries = (obj) => {
//   if (!obj || typeof obj !== 'object') {
//     return [];
//   }
//   return Object.entries(obj);
// };

// // Theme-aware styling functions
// const getThemeClasses = (theme) => ({
//   // Background classes
//   bg: {
//     primary: theme === 'dark' ? 'bg-dark-background-primary' : 'bg-light-background-primary',
//     secondary: theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-light-background-secondary',
//     tertiary: theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-light-background-tertiary',
//     card: theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white',
//   },
//   // Text classes
//   text: {
//     primary: theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary',
//     secondary: theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary',
//     tertiary: theme === 'dark' ? 'text-dark-text-tertiary' : 'text-light-text-tertiary',
//   },
//   // Border classes
//   border: {
//     light: theme === 'dark' ? 'border-dark-border-light' : 'border-light-border-light',
//     medium: theme === 'dark' ? 'border-dark-border-medium' : 'border-light-border-medium',
//     dark: theme === 'dark' ? 'border-dark-border-dark' : 'border-light-border-dark',
//   },
//   // Input classes
//   input: theme === 'dark' 
//     ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary placeholder-dark-text-tertiary focus:border-dark-primary-400 focus:ring-dark-primary-900'
//     : 'bg-white border-light-border-medium text-light-text-primary placeholder-light-text-tertiary focus:border-light-primary-500 focus:ring-light-primary-100',
//   // Button classes
//   button: {
//     primary: theme === 'dark' 
//       ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white' 
//       : 'bg-light-primary-600 hover:bg-light-primary-700 text-white',
//     secondary: theme === 'dark'
//       ? 'bg-dark-background-tertiary hover:bg-dark-border-light text-dark-text-primary'
//       : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
//   }
// });

// const CreatePlans = () => {
//   const { theme, toggleTheme } = useTheme();
//   const themeClasses = getThemeClasses(theme);
  
//   const { form, setForm, errors, setErrors, handleChange, handleNestedChange, validateField } = useForm(getInitialFormState());
//   const [plans, setPlans] = useState([]);
//   const [routers, setRouters] = useState([]);
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [analytics, setAnalytics] = useState({
//     total_subscriptions: 0,
//     active_subscriptions: 0,
//     total_revenue: 0,
//     status_counts: {},
//     plans: [],
//     recent_subscriptions: []
//   });
//   const [compatibleRouters, setCompatibleRouters] = useState([]);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isFetchingSubs, setIsFetchingSubs] = useState(false);
//   const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);
//   const [isFetchingRouters, setIsFetchingRouters] = useState(false);
//   const [isFetchingCompatible, setIsFetchingCompatible] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);
//   const [isBandwidthMenuOpen, setIsBandwidthMenuOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [subscriptionFilters, setSubscriptionFilters] = useState({
//     status: "",
//     plan: "",
//     router: ""
//   });

//   // Memoized filtered and sorted plans for better performance
//   const sortedPlans = useMemo(() => {
//     if (!plans.length) return [];
    
//     const filtered = plans.filter(
//       (plan) =>
//         (filterCategory === "All" || plan.category === filterCategory) &&
//         (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     return filtered.sort((a, b) => {
//       let aValue, bValue;
//       if (sortConfig.key.includes(".")) {
//         const [parent, child] = sortConfig.key.split(".");
//         aValue = a[parent] ? a[parent][child] : "";
//         bValue = b[parent] ? b[parent][child] : "";
//       } else {
//         aValue = a[sortConfig.key] || "";
//         bValue = b[sortConfig.key] || "";
//       }
      
//       if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
//         aValue = parseFloat(aValue);
//         bValue = parseFloat(bValue);
//       }
      
//       return sortConfig.direction === "asc"
//         ? typeof aValue === "string"
//           ? aValue.localeCompare(bValue)
//           : aValue - bValue
//         : typeof bValue === "string"
//           ? bValue.localeCompare(aValue)
//           : bValue - aValue;
//     });
//   }, [plans, filterCategory, searchTerm, sortConfig]);

//   // Data fetching effects
//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         const normalizedPlans = plansData.map((plan) => ({
//           ...getInitialFormState(),
//           id: plan.id,
//           planType: plan.planType || plan.plan_type,
//           name: plan.name,
//           price: plan.price.toString(),
//           active: plan.active,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           description: plan.description,
//           category: plan.category,
//           purchases: plan.purchases,
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           createdAt: plan.created_at || plan.createdAt,
//           client_sessions: plan.client_sessions || {},
//           bandwidth_limit: plan.bandwidth_limit || 0,
//           concurrent_connections: plan.concurrent_connections || 1,
//           priority_level: plan.priority_level || 4,
//           router_specific: plan.router_specific || false,
//           allowed_routers_ids: plan.allowed_routers_ids || [],
//           FUP_policy: plan.FUP_policy || "",
//           FUP_threshold: plan.FUP_threshold || 80,
//           bandwidth_limit_display: plan.bandwidth_limit_display || formatBandwidth(plan.bandwidth_limit || 0),
//           is_unlimited_data: plan.is_unlimited_data || false,
//           is_unlimited_time: plan.is_unlimited_time || false,
//         }));
//         setPlans(normalizedPlans);
//       } catch (error) {
//         console.error("Error fetching plans:", error);
//         toast.error("Failed to load plans from server.");
//         setPlans([]);
//       } finally {
//         setIsFetching(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   useEffect(() => {
//     const fetchRouters = async () => {
//       setIsFetchingRouters(true);
//       try {
//         const response = await api.get("/api/network_management/routers/");
//         setRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching routers:", error);
//         toast.error("Failed to load routers from server.");
//         setRouters([]);
//       } finally {
//         setIsFetchingRouters(false);
//       }
//     };
    
//     if (viewMode === "form" || viewMode === "subscriptions" || viewMode === "details") {
//       fetchRouters();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchSubscriptions = async () => {
//       setIsFetchingSubs(true);
//       try {
//         let url = "/api/internet_plans/subscriptions/";
//         const params = new URLSearchParams();
        
//         if (subscriptionFilters.status) params.append('status', subscriptionFilters.status);
//         if (subscriptionFilters.plan) params.append('plan', subscriptionFilters.plan);
//         if (subscriptionFilters.router) params.append('router', subscriptionFilters.router);
        
//         if (params.toString()) url += `?${params.toString()}`;
        
//         const response = await api.get(url);
//         const subsData = response.data;
//         if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
//         setSubscriptions(subsData);
//       } catch (error) {
//         console.error("Error fetching subscriptions:", error);
//         toast.error("Failed to load subscriptions from server.");
//         setSubscriptions([]);
//       } finally {
//         setIsFetchingSubs(false);
//       }
//     };
//     if (viewMode === "subscriptions") {
//       fetchSubscriptions();
//     }
//   }, [viewMode, subscriptionFilters]);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       setIsFetchingAnalytics(true);
//       try {
//         const response = await api.get("/api/internet_plans/subscription-analytics/");
//         setAnalytics(response.data);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//         toast.error("Failed to load analytics from server.");
//         setAnalytics({
//           total_subscriptions: 0,
//           active_subscriptions: 0,
//           total_revenue: 0,
//           status_counts: {},
//           plans: [],
//           recent_subscriptions: []
//         });
//       } finally {
//         setIsFetchingAnalytics(false);
//       }
//     };
//     if (viewMode === "analytics") {
//       fetchAnalytics();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     const fetchCompatibleRouters = async () => {
//       if (!selectedPlan?.id || !selectedPlan.router_specific) return;
//       setIsFetchingCompatible(true);
//       try {
//         const response = await api.get(`/api/internet_plans/${selectedPlan.id}/compatible-routers/`);
//         setCompatibleRouters(response.data);
//       } catch (error) {
//         console.error("Error fetching compatible routers:", error);
//         toast.error("Failed to load compatible routers.");
//         setCompatibleRouters([]);
//       } finally {
//         setIsFetchingCompatible(false);
//       }
//     };
//     if (viewMode === "details") {
//       fetchCompatibleRouters();
//     }
//   }, [viewMode, selectedPlan]);

//   // Form validation effects
//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType, setForm]);

//   useEffect(() => {
//     if (form.dataLimit.unit === "Unlimited") {
//       handleNestedChange("dataLimit", "value", "Unlimited");
//     }
//   }, [form.dataLimit.unit, handleNestedChange]);

//   useEffect(() => {
//     if (form.usageLimit.unit === "Unlimited") {
//       handleNestedChange("usageLimit", "value", "Unlimited");
//     }
//   }, [form.usageLimit.unit, handleNestedChange]);

//   // Event handlers with useCallback for performance
//   const addFeature = useCallback(() => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => {
//         const updatedFeatures = [...prev.features, newFeature];
//         return { ...prev, features: updatedFeatures };
//       });
//       setNewFeature("");
//     }
//   }, [newFeature, form.features, setForm]);

//   const addRestriction = useCallback(() => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => {
//         const updatedRestrictions = [...prev.restrictions, newRestriction];
//         return { ...prev, restrictions: updatedRestrictions };
//       });
//       setNewRestriction("");
//     }
//   }, [newRestriction, form.restrictions, setForm]);

//   const removeListItem = useCallback((list, item) => {
//     setForm((prev) => {
//       const updatedList = prev[list].filter((i) => i !== item);
//       return { ...prev, [list]: updatedList };
//     });
//   }, [setForm]);

//   const toggleRouterSelection = useCallback((routerId) => {
//     setForm((prev) => {
//       const currentRouters = [...prev.allowed_routers_ids];
//       const index = currentRouters.indexOf(routerId);
      
//       if (index > -1) {
//         currentRouters.splice(index, 1);
//       } else {
//         currentRouters.push(routerId);
//       }
      
//       return { ...prev, allowed_routers_ids: currentRouters };
//     });
//   }, [setForm]);

//   const requestSort = useCallback((key) => {
//     setSortConfig({ 
//       key, 
//       direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" 
//     });
//   }, [sortConfig]);

//   const validateAndSavePlan = async () => {
//     const newErrors = {};
    
//     // Comprehensive validation
//     if (!form.planType) newErrors.planType = "Plan type is required";
//     if (!form.name?.trim()) newErrors.name = "Plan name is required";
//     if (!form.category) newErrors.category = "Category is required";
    
//     if (form.planType === "Paid") {
//       const price = parseFloat(form.price);
//       if (!form.price || isNaN(price) || price <= 0) {
//         newErrors.price = "Price must be a positive number for paid plans";
//       }
//     }
    
//     if (!form.downloadSpeed.value) newErrors.downloadSpeed = "Download speed is required";
//     if (!form.uploadSpeed.value) newErrors.uploadSpeed = "Upload speed is required";
//     if (!form.expiry.value) newErrors.expiry = "Expiry duration is required";
//     if (!form.dataLimit.value) newErrors.dataLimit = "Data limit is required";
//     if (!form.usageLimit.value) newErrors.usageLimit = "Usage limit is required";
//     if (!form.description?.trim()) newErrors.description = "Description is required";

//     // Numeric validations
//     const downloadSpeed = parseFloat(form.downloadSpeed.value);
//     const uploadSpeed = parseFloat(form.uploadSpeed.value);
//     const expiry = parseInt(form.expiry.value, 10);

//     if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
//       newErrors.downloadSpeed = "Download speed must be a positive number";
//     }
//     if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
//       newErrors.uploadSpeed = "Upload speed must be a positive number";
//     }
//     if (isNaN(expiry) || expiry <= 0) {
//       newErrors.expiry = "Expiry duration must be a positive integer";
//     }

//     // Data limit validation
//     if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
//       newErrors.dataLimit = "When data unit is Unlimited, value must be 'Unlimited'";
//     } else if (form.dataLimit.unit !== "Unlimited") {
//       const dataValue = parseFloat(form.dataLimit.value);
//       if (isNaN(dataValue) || dataValue <= 0) {
//         newErrors.dataLimit = "Data limit must be a positive number";
//       }
//     }

//     // Usage limit validation
//     if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
//       newErrors.usageLimit = "When usage unit is Unlimited, value must be 'Unlimited'";
//     } else if (form.usageLimit.unit !== "Unlimited") {
//       const usageValue = parseFloat(form.usageLimit.value);
//       if (isNaN(usageValue) || usageValue <= 0) {
//         newErrors.usageLimit = "Usage limit must be a positive number";
//       }
//     }

//     // Free trial specific validations
//     if (form.planType === "Free Trial") {
//       if (parseFloat(form.price) !== 0) {
//         newErrors.price = "Free Trial plans must have price set to 0";
//       }
//       if (form.router_specific) {
//         newErrors.router_specific = "Free Trial plans cannot be router-specific";
//       }
//       if (form.priority_level > 4) {
//         newErrors.priority_level = "Free Trial plans cannot have premium priority levels";
//       }
//     }

//     setErrors(newErrors);

//     if (Object.keys(newErrors).length > 0) {
//       toast.error("Please fix the validation errors before saving.");
//       return;
//     }

//     // Prepare data for API
//     const planData = {
//       planType: form.planType,
//       name: form.name.trim(),
//       price: parseFloat(form.price) || 0,
//       active: form.active,
//       downloadSpeed: form.downloadSpeed,
//       uploadSpeed: form.uploadSpeed,
//       expiry: form.expiry,
//       dataLimit: form.dataLimit,
//       usageLimit: form.usageLimit,
//       description: form.description.trim(),
//       category: form.category,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       features: form.features,
//       restrictions: form.restrictions,
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//       bandwidth_limit: form.bandwidth_limit,
//       concurrent_connections: form.concurrent_connections,
//       priority_level: form.priority_level,
//       router_specific: form.router_specific,
//       allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
//       FUP_policy: form.FUP_policy,
//       FUP_threshold: form.FUP_threshold,
//     };

//     try {
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
//         toast.success(`Updated plan: ${planData.name}`);
//       } else {
//         response = await api.post("/api/internet_plans/", planData);
//         setPlans((prev) => [...prev, response.data]);
//         toast.success(`Created plan: ${planData.name}`);
//       }
//       setForm(deepClone(getInitialFormState()));
//       setEditingPlan(null);
//       setViewMode("list");
//       setErrors({});
//     } catch (error) {
//       console.error("Error saving plan:", error.response?.data || error.message);
//       const errorDetails = error.response?.data?.details || error.response?.data || error.message;
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${JSON.stringify(errorDetails)}`);
//     }
//   };

//   const deletePlan = async (planId, planName) => {
//     if (window.confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
//       try {
//         await api.delete(`/api/internet_plans/${planId}/`);
//         setPlans((prev) => prev.filter((p) => p.id !== planId));
//         if (selectedPlan && selectedPlan.id === planId) {
//           setSelectedPlan(null);
//           setViewMode("list");
//         }
//         toast.success(`Deleted plan: ${planName}`);
//       } catch (error) {
//         console.error("Error deleting plan:", error);
//         toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
//       }
//     }
//   };

//   const activatePlanOnRouter = async (planId, routerId) => {
//     try {
//       const response = await api.post(`/api/internet_plans/${planId}/activate-on-router/${routerId}/`);
//       toast.success(response.data.message);
//     } catch (error) {
//       console.error("Error activating plan on router:", error);
//       toast.error(`Failed to activate: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   const handleUsagePresetSelect = useCallback((hours) => {
//     handleNestedChange("usageLimit", "value", hours);
//     handleNestedChange("usageLimit", "unit", "Hours");
//     setIsUsageMenuOpen(false);
//   }, [handleNestedChange]);

//   const handleBandwidthPresetSelect = useCallback((value) => {
//     setForm((prev) => ({ ...prev, bandwidth_limit: value }));
//     setIsBandwidthMenuOpen(false);
//   }, [setForm]);

//   const handleSubscriptionFilterChange = useCallback((filter, value) => {
//     setSubscriptionFilters((prev) => ({ ...prev, [filter]: value }));
//   }, []);

//   // Helper functions
//   const renderStars = useCallback((purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star 
//             key={i} 
//             className={`w-4 h-4 ${i < Math.round(rating) 
//               ? "text-amber-400 fill-current" 
//               : theme === 'dark' ? "text-gray-600" : "text-gray-300"}`} 
//           />
//         ))}
//         <span className={`ml-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//           {rating.toFixed(1)}
//         </span>
//       </div>
//     );
//   }, [theme]);

//   const getCategoryIcon = useCallback((category) => {
//     const icons = {
//       Residential: <Home className="w-4 h-4 text-teal-600" />,
//       Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
//       Promotional: <Gift className="w-4 h-4 text-purple-600" />,
//       Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
//     };
//     return icons[category] || null;
//   }, []);

//   const getPriorityIcon = useCallback((level) => {
//     const option = priorityOptions.find(opt => opt.value === level);
//     if (!option) return null;
//     const IconComponent = option.icon;
//     return <IconComponent className={`w-4 h-4 ${option.color}`} />;
//   }, []);

//   // Main render functions
//   const renderPlanList = () => (
//     <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div className="flex items-center space-x-4">
//           <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
//             ConnectSphere Packages
//           </h2>
//           <motion.button
//             onClick={toggleTheme}
//             className={`p-2 rounded-lg theme-transition ${
//               theme === 'dark' 
//                 ? 'bg-dark-primary-600 text-white' 
//                 : 'bg-light-primary-100 text-light-primary-700'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//           </motion.button>
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//           <motion.button
//             onClick={() => setViewMode("analytics")}
//             className={`px-4 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
//               theme === 'dark' 
//                 ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white' 
//                 : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//             <span className="text-sm sm:text-base">Analytics</span>
//           </motion.button>
          
//           <motion.button
//             onClick={() => setViewMode("subscriptions")}
//             className={`px-4 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
//               theme === 'dark'
//                 ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
//                 : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//             <span className="text-sm sm:text-base">Subscriptions</span>
//           </motion.button>
          
//           <motion.button
//             onClick={() => { setForm(deepClone(getInitialFormState())); setEditingPlan(null); setViewMode("form"); }}
//             className={`px-4 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
//               theme === 'dark'
//                 ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
//                 : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//             <span className="text-sm sm:text-base">New Plan</span>
//           </motion.button>
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <select
//           value={filterCategory} 
//           onChange={(e) => setFilterCategory(e.target.value)}
//           className={`px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>{cat}</option>
//           ))}
//         </select>
        
//         <input
//           type="text" 
//           placeholder="Search plans..." 
//           value={searchTerm} 
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={`px-4 py-2 rounded-lg shadow-sm theme-transition flex-1 ${themeClasses.input}`}
//         />
//       </div>

//       {/* Plans Table */}
//       {isFetching ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : plans.length === 0 ? (
//         <div className={`rounded-xl shadow-lg p-6 text-center theme-transition ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
//           <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold theme-transition">No Plans Available</h3>
//           <p className={`mt-2 theme-transition ${themeClasses.text.secondary}`}>
//             Create a new plan to get started!
//           </p>
//           <motion.button
//             onClick={() => setViewMode("form")}
//             className={`mt-4 px-5 py-2 rounded-lg shadow-md theme-transition ${
//               theme === 'dark'
//                 ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
//                 : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             Create Plan
//           </motion.button>
//         </div>
//       ) : (
//         <div className={`rounded-xl shadow-lg overflow-hidden theme-transition ${themeClasses.bg.card}`}>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y theme-transition" style={{ borderColor: 'inherit' }}>
//               <thead className={`theme-transition ${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-100'}`}>
//                 <tr>
//                   {[
//                     { key: "name", label: "Name" }, 
//                     { key: "planType", label: "Type" },
//                     { key: "category", label: "Category" }, 
//                     { key: "price", label: "Price" },
//                     { key: "bandwidth_limit", label: "Bandwidth" }, 
//                     { key: "purchases", label: "Subscribers" },
//                     { key: "actions", label: "Actions" },
//                   ].map((column) => (
//                     <th
//                       key={column.key} 
//                       onClick={() => column.key !== "actions" && requestSort(column.key)}
//                       className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-transition ${
//                         column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""
//                       } ${themeClasses.text.secondary}`}
//                     >
//                       <div className="flex items-center">
//                         {column.label}
//                         {sortConfig.key === column.key && (
//                           sortConfig.direction === "asc" ? 
//                             <ChevronUp className="ml-1 w-4 h-4" /> : 
//                             <ChevronDown className="ml-1 w-4 h-4" />
//                         )}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className={`divide-y theme-transition ${theme === 'dark' ? 'divide-dark-border-light' : 'divide-gray-200'}`}>
//                 {sortedPlans.map((plan) => (
//                   <tr 
//                     key={plan.id} 
//                     className={`theme-transition hover:${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'}`}
//                   >
//                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         {getCategoryIcon(plan.category)}
//                         <span className={`ml-2 text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
//                           {plan.name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
//                       {plan.planType}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
//                       {plan.category}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
//                       {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
//                       {plan.bandwidth_limit_display}
//                     </td>
//                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
//                         <span className={`text-sm theme-transition ${themeClasses.text.secondary}`}>
//                           {plan.purchases}
//                         </span>
//                         {renderStars(plan.purchases)}
//                       </div>
//                     </td>
//                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2 sm:space-x-4">
//                         <motion.button 
//                           onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} 
//                           className="focus:outline-none" 
//                           whileHover={{ scale: 1.2 }} 
//                           transition={{ type: "spring", stiffness: 300 }}
//                         >
//                           <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 hover:text-indigo-800" />
//                         </motion.button>
//                         <motion.button 
//                           onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} 
//                           className="focus:outline-none" 
//                           whileHover={{ rotate: 90 }} 
//                           transition={{ type: "spring", stiffness: 300 }}
//                         >
//                           <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 hover:text-emerald-800" />
//                         </motion.button>
//                         <motion.button
//                           onClick={() => {
//                             const copiedPlan = { 
//                               ...deepClone(plan), 
//                               name: `Copy of ${plan.name}`, 
//                               id: null, 
//                               purchases: 0, 
//                               client_sessions: {}, 
//                               createdAt: new Date().toISOString().split("T")[0] 
//                             };
//                             setForm(copiedPlan); 
//                             setEditingPlan(null); 
//                             setViewMode("form");
//                           }}
//                           className="focus:outline-none" 
//                           animate={{ scale: [1, 1.1, 1] }} 
//                           transition={{ repeat: Infinity, duration: 1.5 }}
//                         >
//                           <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 hover:text-orange-800" />
//                         </motion.button>
//                         <motion.button 
//                           onClick={() => deletePlan(plan.id, plan.name)} 
//                           className="focus:outline-none" 
//                           whileHover={{ x: [0, -2, 2, -2, 0] }} 
//                           transition={{ duration: 0.3 }}
//                         >
//                           <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 hover:text-red-800" />
//                         </motion.button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderPlanForm = () => (
//     <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
//           {editingPlan ? "Edit Plan" : "New Plan"}
//         </h2>
//         <motion.button 
//           onClick={() => { setViewMode("list"); setForm(deepClone(getInitialFormState())); setEditingPlan(null); }} 
//           className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
//           whileHover={{ rotate: 90 }}
//         >
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {/* Tab Navigation */}
//       <div className={`p-2 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//         <div className="flex flex-wrap gap-2">
//           {["basic", "specifications", "advanced", "description", "features"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 activeTab === tab 
//                   ? "bg-teal-600 text-white" 
//                   : `${themeClasses.text.secondary} hover:${themeClasses.text.primary} hover:${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-100'}`
//               }`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="space-y-6">
//         {/* Basic Details Tab */}
//         {activeTab === "basic" && (
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Basic Details</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Plan Type <span className="text-red-500">*</span>
//                   </label>
//                   <select 
//                     name="planType" 
//                     value={form.planType || ""} 
//                     onChange={handleChange} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     required
//                   >
//                     <option value="" disabled>Select Plan Type</option>
//                     {planTypes.map((type) => <option key={type} value={type}>{type}</option>)}
//                   </select>
//                   {errors.planType && <p className="text-red-500 text-sm mt-1">{errors.planType}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Name <span className="text-red-500">*</span>
//                   </label>
//                   <input 
//                     name="name" 
//                     value={form.name || ""} 
//                     onChange={handleChange} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     placeholder="e.g., Rural Wi-Fi Pro" 
//                     required 
//                   />
//                   {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <select 
//                     name="category" 
//                     value={form.category || ""} 
//                     onChange={handleChange} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     required
//                   >
//                     <option value="" disabled>Select Category</option>
//                     {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
//                   </select>
//                   {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
//                   </label>
//                   <input
//                     type="number" 
//                     name="price" 
//                     value={form.price || ""} 
//                     onChange={handleChange} 
//                     disabled={form.planType !== "Paid"}
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${
//                       form.planType !== "Paid" 
//                         ? "bg-gray-100 cursor-not-allowed border-gray-300" 
//                         : themeClasses.input
//                     }`}
//                     placeholder="e.g., 29.99" 
//                     step="0.01" 
//                     min="0" 
//                     required={form.planType === "Paid"}
//                   />
//                   {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <label className={`block text-sm font-medium theme-transition mr-4 ${themeClasses.text.primary}`}>
//                   Active
//                 </label>
//                 <div 
//                   onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                     form.active 
//                       ? theme === 'dark' ? 'bg-dark-primary-600' : 'bg-teal-600'
//                       : theme === 'dark' ? 'bg-dark-border-medium' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     form.active ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Specifications Tab */}
//         {activeTab === "specifications" && (
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Specifications</h3>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Download Speed <span className="text-red-500">*</span>
//                   </label>
//                   <input 
//                     type="number" 
//                     value={form.downloadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 10" 
//                     required 
//                   />
//                   {errors.downloadSpeed && <p className="text-red-500 text-sm mt-1">{errors.downloadSpeed}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Unit
//                   </label>
//                   <select 
//                     value={form.downloadSpeed.unit || "Mbps"} 
//                     onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   >
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Upload Speed <span className="text-red-500">*</span>
//                   </label>
//                   <input 
//                     type="number" 
//                     value={form.uploadSpeed.value || ""} 
//                     onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     min="0.01" 
//                     step="0.01" 
//                     placeholder="e.g., 2" 
//                     required 
//                   />
//                   {errors.uploadSpeed && <p className="text-red-500 text-sm mt-1">{errors.uploadSpeed}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Unit
//                   </label>
//                   <select 
//                     value={form.uploadSpeed.unit || "Mbps"} 
//                     onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   >
//                     {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Expiry <span className="text-red-500">*</span>
//                   </label>
//                   <input 
//                     type="number" 
//                     value={form.expiry.value || ""} 
//                     onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     min="1" 
//                     step="1" 
//                     placeholder="e.g., 30" 
//                     required 
//                   />
//                   {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Unit
//                   </label>
//                   <select 
//                     value={form.expiry.unit || "Days"} 
//                     onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   >
//                     {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="sm:col-span-2">
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Data Limit <span className="text-red-500">*</span>
//                   </label>
//                   <input 
//                     value={form.dataLimit.value || ""} 
//                     onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     placeholder={form.dataLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 50"} 
//                     disabled={form.dataLimit.unit === "Unlimited"} 
//                     required 
//                   />
//                   {errors.dataLimit && <p className="text-red-500 text-sm mt-1">{errors.dataLimit}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Unit
//                   </label>
//                   <select 
//                     value={form.dataLimit.unit || "GB"} 
//                     onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   >
//                     {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 <div className="sm:col-span-2 relative">
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Usage Limit <span className="text-red-500">*</span>
//                   </label>
//                   <input 
//                     value={form.usageLimit.value || ""} 
//                     onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     placeholder={form.usageLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 720"} 
//                     disabled={form.usageLimit.unit === "Unlimited"} 
//                     required 
//                   />
//                   <motion.button 
//                     onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)} 
//                     className="absolute right-2 top-8 px-2 py-1 text-xs text-teal-600 hover:text-teal-800"
//                     whileHover={{ scale: 1.05 }}
//                   >
//                     Presets
//                   </motion.button>
//                   <AnimatePresence>
//                     {isUsageMenuOpen && (
//                       <motion.div 
//                         initial={{ opacity: 0, y: -10 }} 
//                         animate={{ opacity: 1, y: 0 }} 
//                         exit={{ opacity: 0, y: -10 }} 
//                         className={`absolute z-10 mt-2 w-full rounded-lg shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}
//                       >
//                         {usageLimitPresets.map((preset) => {
//                           const IconComponent = preset.icon;
//                           return (
//                             <div 
//                               key={preset.hours} 
//                               onClick={() => handleUsagePresetSelect(preset.hours)} 
//                               className="p-3 hover:bg-opacity-50 hover:bg-gray-200 cursor-pointer flex items-center space-x-3"
//                             >
//                               <IconComponent className="w-4 h-4 text-purple-600" />
//                               <div>
//                                 <p className={`text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
//                                   {preset.days} Days ({preset.hours} Hours)
//                                 </p>
//                                 <p className={`text-xs theme-transition ${themeClasses.text.secondary}`}>
//                                   {preset.description}
//                                 </p>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                   {errors.usageLimit && <p className="text-red-500 text-sm mt-1">{errors.usageLimit}</p>}
//                 </div>
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                     Unit
//                   </label>
//                   <select 
//                     value={form.usageLimit.unit || "Hours"} 
//                     onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} 
//                     className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   >
//                     {usageUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Advanced Settings Tab */}
//         {activeTab === "advanced" && (
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Advanced Settings</h3>
//             <div className="space-y-6">
//               <div className="relative">
//                 <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                   Bandwidth Limit (Kbps)
//                 </label>
//                 <input 
//                   type="number" 
//                   value={form.bandwidth_limit || 0} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, bandwidth_limit: parseInt(e.target.value, 10) || 0 }))} 
//                   className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   min="0" 
//                   step="1" 
//                   placeholder="e.g., 10240" 
//                 />
//                 <motion.button 
//                   onClick={() => setIsBandwidthMenuOpen(!isBandwidthMenuOpen)} 
//                   className="absolute right-2 top-8 px-2 py-1 text-xs text-teal-600 hover:text-teal-800"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Presets
//                 </motion.button>
//                 <AnimatePresence>
//                   {isBandwidthMenuOpen && (
//                     <motion.div 
//                       initial={{ opacity: 0, y: -10 }} 
//                       animate={{ opacity: 1, y: 0 }} 
//                       exit={{ opacity: 0, y: -10 }} 
//                       className={`absolute z-10 mt-2 w-full rounded-lg shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}
//                     >
//                       {bandwidthPresets.map((preset) => (
//                         <div 
//                           key={preset.value} 
//                           onClick={() => handleBandwidthPresetSelect(preset.value)} 
//                           className="p-3 hover:bg-opacity-50 hover:bg-gray-200 cursor-pointer flex items-center space-x-3"
//                         >
//                           <Gauge className="w-4 h-4 text-teal-600" />
//                           <p className={`text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
//                             {preset.label} ({preset.value} Kbps)
//                           </p>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                   Concurrent Connections
//                 </label>
//                 <input 
//                   type="number" 
//                   value={form.concurrent_connections || 1} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, concurrent_connections: parseInt(e.target.value, 10) || 1 }))} 
//                   className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   min="1" 
//                   step="1" 
//                   placeholder="e.g., 5" 
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                   Priority Level
//                 </label>
//                 <select 
//                   value={form.priority_level || 4} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, priority_level: parseInt(e.target.value, 10) }))} 
//                   className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                 >
//                   {priorityOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.priority_level && <p className="text-red-500 text-sm mt-1">{errors.priority_level}</p>}
//               </div>
              
//               <div className="flex items-center">
//                 <label className={`block text-sm font-medium theme-transition mr-4 ${themeClasses.text.primary}`}>
//                   Router Specific
//                 </label>
//                 <div 
//                   onClick={() => setForm((prev) => ({ ...prev, router_specific: !prev.router_specific }))} 
//                   className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                     form.router_specific 
//                       ? theme === 'dark' ? 'bg-dark-primary-600' : 'bg-teal-600'
//                       : theme === 'dark' ? 'bg-dark-border-medium' : 'bg-gray-300'
//                   }`}
//                 >
//                   <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     form.router_specific ? "translate-x-6" : "translate-x-1"
//                   }`} />
//                 </div>
//                 {errors.router_specific && <p className="text-red-500 text-sm ml-2">{errors.router_specific}</p>}
//               </div>
              
//               {form.router_specific && (
//                 <div>
//                   <label className={`block text-sm font-medium theme-transition mb-2 ${themeClasses.text.primary}`}>
//                     Allowed Routers
//                   </label>
//                   {isFetchingRouters ? (
//                     <div className="flex justify-center py-4">
//                       <FaSpinner className="w-6 h-6 text-teal-600 animate-spin" />
//                     </div>
//                   ) : routers.length === 0 ? (
//                     <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No routers available.</p>
//                   ) : (
//                     <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 theme-transition ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
//                       {routers.map((router) => (
//                         <div key={router.id} className="flex items-center">
//                           <input 
//                             type="checkbox" 
//                             checked={form.allowed_routers_ids.includes(router.id)} 
//                             onChange={() => toggleRouterSelection(router.id)} 
//                             className={`h-4 w-4 focus:ring-teal-500 border rounded ${
//                               theme === 'dark' 
//                                 ? 'bg-dark-background-primary border-dark-border-medium text-dark-primary-600' 
//                                 : 'text-teal-600 border-gray-300'
//                             }`}
//                           />
//                           <label className={`ml-2 text-sm theme-transition ${themeClasses.text.primary}`}>
//                             {router.name || `Router ${router.id}`}
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
              
//               <div>
//                 <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                   FUP Policy
//                 </label>
//                 <input 
//                   value={form.FUP_policy || ""} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, FUP_policy: e.target.value }))} 
//                   className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   placeholder="e.g., Speed reduced to 1Mbps after threshold" 
//                 />
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
//                   FUP Threshold (%)
//                 </label>
//                 <input 
//                   type="number" 
//                   value={form.FUP_threshold || 80} 
//                   onChange={(e) => setForm((prev) => ({ ...prev, FUP_threshold: parseInt(e.target.value, 10) || 80 }))} 
//                   className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                   min="0" 
//                   max="100" 
//                   step="1" 
//                   placeholder="e.g., 80" 
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Description Tab */}
//         {activeTab === "description" && (
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Plan Description</h3>
//             <div data-color-mode={theme}>
//               <MDEditor 
//                 value={form.description || ""} 
//                 onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} 
//                 height={400} 
//                 preview="edit" 
//               />
//             </div>
//             {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
//           </div>
//         )}

//         {/* Features & Restrictions Tab */}
//         {activeTab === "features" && (
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Features & Restrictions</h3>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
//               <div>
//                 <label className={`block text-sm font-medium theme-transition mb-2 ${themeClasses.text.primary}`}>
//                   Features
//                 </label>
//                 <div className="space-y-2">
//                   <div className="flex space-x-2">
//                     <select 
//                       value={newFeature} 
//                       onChange={(e) => setNewFeature(e.target.value)} 
//                       className={`flex-1 px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     >
//                       <option value="">Select or type custom</option>
//                       {featuresOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
//                     </select>
//                     <motion.button 
//                       onClick={addFeature} 
//                       className={`px-4 py-2 rounded-lg theme-transition ${themeClasses.button.primary}`}
//                       whileHover={{ scale: 1.05 }}
//                     >
//                       <Plus className="w-4 h-4" />
//                     </motion.button>
//                   </div>
//                   <div className={`space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 theme-transition ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
//                     {form.features.map((feature) => (
//                       <div key={feature} className={`flex items-center justify-between p-2 hover:bg-opacity-50 hover:bg-gray-200 rounded theme-transition`}>
//                         <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{feature}</span>
//                         <button 
//                           onClick={() => removeListItem("features", feature)} 
//                           className="text-red-600 hover:text-red-800 transition-colors"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                     {form.features.length === 0 && (
//                       <p className={`text-sm text-center py-2 theme-transition ${themeClasses.text.secondary}`}>
//                         No features added yet
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               <div>
//                 <label className={`block text-sm font-medium theme-transition mb-2 ${themeClasses.text.primary}`}>
//                   Restrictions
//                 </label>
//                 <div className="space-y-2">
//                   <div className="flex space-x-2">
//                     <select 
//                       value={newRestriction} 
//                       onChange={(e) => setNewRestriction(e.target.value)} 
//                       className={`flex-1 px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//                     >
//                       <option value="">Select or type custom</option>
//                       {restrictionsOptions.map((restriction) => <option key={restriction} value={restriction}>{restriction}</option>)}
//                     </select>
//                     <motion.button 
//                       onClick={addRestriction} 
//                       className={`px-4 py-2 rounded-lg theme-transition ${themeClasses.button.primary}`}
//                       whileHover={{ scale: 1.05 }}
//                     >
//                       <Plus className="w-4 h-4" />
//                     </motion.button>
//                   </div>
//                   <div className={`space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 theme-transition ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
//                     {form.restrictions.map((restriction) => (
//                       <div key={restriction} className={`flex items-center justify-between p-2 hover:bg-opacity-50 hover:bg-gray-200 rounded theme-transition`}>
//                         <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{restriction}</span>
//                         <button 
//                           onClick={() => removeListItem("restrictions", restriction)} 
//                           className="text-red-600 hover:text-red-800 transition-colors"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                     {form.restrictions.length === 0 && (
//                       <p className={`text-sm text-center py-2 theme-transition ${themeClasses.text.secondary}`}>
//                         No restrictions added yet
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Form Actions */}
//       <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
//         <motion.button 
//           onClick={() => { setViewMode("list"); setForm(deepClone(getInitialFormState())); setEditingPlan(null); }} 
//           className={`px-6 py-2 rounded-lg shadow-md theme-transition ${themeClasses.button.secondary}`}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           Cancel
//         </motion.button>
//         <motion.button 
//           onClick={validateAndSavePlan} 
//           className={`px-6 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${themeClasses.button.primary}`}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <Save className="w-5 h-5 mr-2" />
//           {editingPlan ? "Update Plan" : "Create Plan"}
//         </motion.button>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => {
//     if (!selectedPlan) return null;

//     return (
//       <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
//             {selectedPlan.name} Details
//           </h2>
//           <motion.button 
//             onClick={() => { setViewMode("list"); setSelectedPlan(null); }} 
//             className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
//             whileHover={{ rotate: 90 }}
//           >
//             <X className="w-6 h-6" />
//           </motion.button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Plan Overview */}
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Plan Overview</h3>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Type:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{selectedPlan.planType}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Category:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{selectedPlan.category}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Price:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.planType === "Paid" ? `Ksh ${formatNumber(selectedPlan.price)}` : "Free"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Active:</span>
//                 <span className={`text-sm ${selectedPlan.active ? "text-green-600" : "text-red-600"}`}>
//                   {selectedPlan.active ? "Yes" : "No"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Subscribers:</span>
//                 <div className="flex items-center">
//                   <span className={`text-sm mr-2 theme-transition ${themeClasses.text.primary}`}>
//                     {selectedPlan.purchases}
//                   </span>
//                   {renderStars(selectedPlan.purchases)}
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Created:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {new Date(selectedPlan.createdAt).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Technical Specs */}
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Technical Specs</h3>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Download Speed:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Upload Speed:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.uploadSpeed.value} {selectedPlan.uploadSpeed.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Bandwidth Limit:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {formatBandwidth(selectedPlan.bandwidth_limit)}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Expiry:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.expiry.value} {selectedPlan.expiry.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Data Limit:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Usage Limit:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.usageLimit.value} {selectedPlan.usageLimit.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Concurrent Connections:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.concurrent_connections}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Priority Level:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.label || "Unknown"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Router Specific:</span>
//                 <span className={`text-sm ${selectedPlan.router_specific ? "text-green-600" : "text-red-600"}`}>
//                   {selectedPlan.router_specific ? "Yes" : "No"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>FUP Threshold:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.FUP_threshold}%
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>FUP Policy:</span>
//                 <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                   {selectedPlan.FUP_policy || "None"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Description */}
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Description</h3>
//             <div data-color-mode={theme}>
//               <MDEditor.Markdown source={selectedPlan.description || "No description provided."} />
//             </div>
//           </div>

//           {/* Features */}
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Features</h3>
//             {selectedPlan.features.length > 0 ? (
//               <ul className="space-y-2">
//                 {selectedPlan.features.map((feature) => (
//                   <li key={feature} className="flex items-center text-sm theme-transition">
//                     <Check className="w-4 h-4 text-green-600 mr-2" />
//                     <span className={themeClasses.text.primary}>{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No features listed.</p>
//             )}
//           </div>

//           {/* Restrictions */}
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Restrictions</h3>
//             {selectedPlan.restrictions.length > 0 ? (
//               <ul className="space-y-2">
//                 {selectedPlan.restrictions.map((restriction) => (
//                   <li key={restriction} className="flex items-center text-sm theme-transition">
//                     <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
//                     <span className={themeClasses.text.primary}>{restriction}</span>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No restrictions listed.</p>
//             )}
//           </div>

//           {/* Compatible Routers */}
//           {selectedPlan.router_specific && (
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-xl font-semibold theme-transition mb-4">Compatible Routers</h3>
//               {isFetchingCompatible ? (
//                 <div className="flex justify-center py-4">
//                   <FaSpinner className="w-6 h-6 text-teal-600 animate-spin" />
//                 </div>
//               ) : compatibleRouters.length === 0 ? (
//                 <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No compatible routers found.</p>
//               ) : (
//                 <div className="space-y-4">
//                   {compatibleRouters.map((router) => (
//                     <div key={router.id} className={`flex items-center justify-between p-4 rounded-lg theme-transition ${
//                       theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                     }`}>
//                       <div className="flex items-center space-x-3">
//                         <Router className="w-5 h-5 text-teal-600" />
//                         <span className={`text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
//                           {router.name || `Router ${router.id}`}
//                         </span>
//                       </div>
//                       <motion.button 
//                         onClick={() => activatePlanOnRouter(selectedPlan.id, router.id)} 
//                         className={`px-4 py-2 rounded-lg text-sm flex items-center theme-transition ${themeClasses.button.primary}`}
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                       >
//                         <Zap className="w-4 h-4 mr-2" /> Activate
//                       </motion.button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Active Sessions */}
//           <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//             <h3 className="text-xl font-semibold theme-transition mb-4">Active Sessions</h3>
//             {Object.keys(selectedPlan.client_sessions).length > 0 ? (
//               <div className="space-y-4">
//                 {safeObjectEntries(selectedPlan.client_sessions).map(([clientId, session]) => (
//                   <div key={clientId} className={`p-4 rounded-lg theme-transition ${
//                     theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                   }`}>
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                       <div>
//                         <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Client ID:</span>
//                         <p className={`text-sm theme-transition ${themeClasses.text.primary}`}>{clientId}</p>
//                       </div>
//                       <div>
//                         <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Remaining Time:</span>
//                         <p className={`text-sm theme-transition ${themeClasses.text.primary}`}>{formatTime(session.remaining_time)}</p>
//                       </div>
//                       <div>
//                         <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Data Used:</span>
//                         <p className={`text-sm theme-transition ${themeClasses.text.primary}`}>{formatBytes(session.data_used)}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No active sessions.</p>
//             )}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
//           <motion.button 
//             onClick={() => { setForm(deepClone(selectedPlan)); setEditingPlan(selectedPlan); setViewMode("form"); }} 
//             className={`px-6 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
//               theme === 'dark' 
//                 ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
//                 : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Pencil className="w-5 h-5 mr-2" /> Edit Plan
//           </motion.button>
//           <motion.button 
//             onClick={() => deletePlan(selectedPlan.id, selectedPlan.name)} 
//             className={`px-6 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
//               theme === 'dark'
//                 ? 'bg-red-600 hover:bg-red-700 text-white'
//                 : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
//             }`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Trash2 className="w-5 h-5 mr-2" /> Delete Plan
//           </motion.button>
//         </div>
//       </div>
//     );
//   };

//   const renderSubscriptions = () => (
//     <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">Subscriptions</h2>
//         <motion.button 
//           onClick={() => setViewMode("list")} 
//           className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
//           whileHover={{ rotate: 90 }}
//         >
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {/* Subscription Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <select 
//           value={subscriptionFilters.status} 
//           onChange={(e) => handleSubscriptionFilterChange("status", e.target.value)} 
//           className={`px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//         >
//           <option value="">All Statuses</option>
//           <option value="active">Active</option>
//           <option value="expired">Expired</option>
//           <option value="suspended">Suspended</option>
//         </select>
//         <select 
//           value={subscriptionFilters.plan} 
//           onChange={(e) => handleSubscriptionFilterChange("plan", e.target.value)} 
//           className={`px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//         >
//           <option value="">All Plans</option>
//           {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
//         </select>
//         <select 
//           value={subscriptionFilters.router} 
//           onChange={(e) => handleSubscriptionFilterChange("router", e.target.value)} 
//           className={`px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
//         >
//           <option value="">All Routers</option>
//           {routers.map((router) => <option key={router.id} value={router.id}>{router.name || `Router ${router.id}`}</option>)}
//         </select>
//       </div>

//       {/* Subscriptions Table */}
//       {isFetchingSubs ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : subscriptions.length === 0 ? (
//         <div className={`rounded-xl shadow-lg p-6 text-center theme-transition ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
//           <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold theme-transition">No Subscriptions Found</h3>
//           <p className={`mt-2 theme-transition ${themeClasses.text.secondary}`}>Try adjusting the filters.</p>
//         </div>
//       ) : (
//         <div className={`rounded-xl shadow-lg overflow-hidden theme-transition ${themeClasses.bg.card}`}>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y theme-transition">
//               <thead className={`theme-transition ${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-100'}`}>
//                 <tr>
//                   {["ID", "User", "Plan", "Router", "Status", "Start Date", "End Date", "Data Used", "Time Remaining"].map((header) => (
//                     <th key={header} className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-transition ${themeClasses.text.secondary}`}>
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className={`divide-y theme-transition ${theme === 'dark' ? 'divide-dark-border-light' : 'divide-gray-200'}`}>
//                 {subscriptions.map((sub) => (
//                   <tr key={sub.id} className={`theme-transition hover:${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'}`}>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {sub.id}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {sub.user?.username || "Unknown"}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {sub.plan?.name || "Unknown"}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {sub.router?.name || "Unknown"}
//                     </td>
//                     <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                         sub.status === "active" 
//                           ? "bg-green-100 text-green-800" 
//                           : sub.status === "expired" 
//                             ? "bg-red-100 text-red-800" 
//                             : "bg-yellow-100 text-yellow-800"
//                       }`}>
//                         {sub.status}
//                       </span>
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {new Date(sub.start_date).toLocaleDateString()}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {new Date(sub.end_date).toLocaleDateString()}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {formatBytes(sub.data_used)}
//                     </td>
//                     <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
//                       {formatTime(sub.remaining_time)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderAnalytics = () => (
//     <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">Subscription Analytics</h2>
//         <motion.button 
//           onClick={() => setViewMode("list")} 
//           className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
//           whileHover={{ rotate: 90 }}
//         >
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       {isFetchingAnalytics ? (
//         <div className="flex justify-center items-center py-12">
//           <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
//         </div>
//       ) : (
//         <>
//           {/* Analytics Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <Users className="w-8 h-8 sm:w-12 sm:h-12 text-teal-600 mb-4" />
//               <h3 className="text-2xl font-bold theme-transition mb-2">{analytics.total_subscriptions}</h3>
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Total Subscriptions</p>
//             </div>
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mb-4" />
//               <h3 className="text-2xl font-bold theme-transition mb-2">{analytics.active_subscriptions}</h3>
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Active Subscriptions</p>
//             </div>
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 mb-4" />
//               <h3 className="text-2xl font-bold theme-transition mb-2">Ksh {formatNumber(analytics.total_revenue)}</h3>
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Total Revenue</p>
//             </div>
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600 mb-4" />
//               <h3 className="text-2xl font-bold theme-transition mb-2">{(analytics.plans || []).length}</h3>
//               <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Plans Analyzed</p>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Status Distribution */}
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-xl font-semibold theme-transition mb-4">Status Distribution</h3>
//               {Object.keys(analytics.status_counts || {}).length > 0 ? (
//                 <div className="space-y-4">
//                   {safeObjectEntries(analytics.status_counts || {}).map(([status, count]) => (
//                     <div key={status} className="flex items-center justify-between">
//                       <span className={`text-sm font-medium theme-transition capitalize ${themeClasses.text.secondary}`}>
//                         {status}
//                       </span>
//                       <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{count}</span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No status data available.</p>
//               )}
//             </div>

//             {/* Top Plans */}
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-xl font-semibold theme-transition mb-4">Top Plans</h3>
//               {(analytics.plans || []).length > 0 ? (
//                 <div className="space-y-4">
//                   {(analytics.plans || []).map((plan) => (
//                     <div key={plan.id} className={`flex items-center justify-between p-4 rounded-lg theme-transition ${
//                       theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                     }`}>
//                       <span className={`text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
//                         {plan.name}
//                       </span>
//                       <span className={`text-sm theme-transition ${themeClasses.text.secondary}`}>
//                         {plan.subscriptions} subs | Ksh {formatNumber(plan.revenue)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No plan data available.</p>
//               )}
//             </div>

//             {/* Recent Subscriptions */}
//             <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
//               <h3 className="text-xl font-semibold theme-transition mb-4">Recent Subscriptions</h3>
//               {(analytics.recent_subscriptions || []).length > 0 ? (
//                 <div className="space-y-4">
//                   {(analytics.recent_subscriptions || []).map((sub) => (
//                     <div key={sub.id} className={`flex items-center justify-between p-4 rounded-lg theme-transition ${
//                       theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
//                     }`}>
//                       <div className="flex items-center space-x-3">
//                         <UserCheck className="w-5 h-5 text-teal-600" />
//                         <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
//                           {sub.user?.username || "Unknown"} - {sub.plan?.name || "Unknown"}
//                         </span>
//                       </div>
//                       <span className={`text-sm theme-transition ${themeClasses.text.secondary}`}>
//                         {new Date(sub.start_date).toLocaleDateString()}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No recent subscriptions.</p>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   return (
//     <>
//       {viewMode === "list" && renderPlanList()}
//       {viewMode === "form" && renderPlanForm()}
//       {viewMode === "details" && selectedPlan && renderPlanDetails()}
//       {viewMode === "subscriptions" && renderSubscriptions()}
//       {viewMode === "analytics" && renderAnalytics()}
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000} 
//         hideProgressBar={false} 
//         newestOnTop 
//         closeOnClick 
//         rtl={false} 
//         pauseOnFocusLoss 
//         draggable 
//         pauseOnHover 
//         theme={theme}
//       />
//     </>
//   );
// };

// export default CreatePlans;












import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
  Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer, Crown,
  Cpu, HardDrive, Network, BarChart3, Gauge, Cable, UserCheck, Cloud, CloudRain, CloudSnow,
  CloudDrizzle, CloudLightning, CloudOff, Router, Check, Filter, AlertTriangle, DollarSign,
  Menu, Search
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

// Custom hook for form management with theme support
const useForm = (initialState) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleNestedChange = useCallback((field, key, value) => {
    setForm(prev => ({ 
      ...prev, 
      [field]: { ...prev[field], [key]: value } 
    }));
  }, []);

  const validateField = useCallback((name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) newErrors[name] = 'Plan name is required';
        else if (value.trim().length < 2) newErrors[name] = 'Plan name must be at least 2 characters';
        break;
      case 'price':
        if (form.planType === 'Paid' && (!value || parseFloat(value) <= 0)) {
          newErrors[name] = 'Price must be a positive number for paid plans';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name];
  }, [errors, form.planType]);

  return { 
    form, 
    setForm, 
    errors,
    setErrors,
    handleChange, 
    handleNestedChange,
    validateField
  };
};

// Utility functions with theme consideration
const formatNumber = (value, decimals = 2) => {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

const deepClone = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

// Memoized initial state to prevent unnecessary recreations
const getInitialFormState = () => ({
  planType: "Paid", 
  name: "", 
  price: "", 
  active: true,
  downloadSpeed: { value: "", unit: "Mbps" }, 
  uploadSpeed: { value: "", unit: "Mbps" },
  expiry: { value: "", unit: "Days" }, 
  dataLimit: { value: "", unit: "GB" },
  usageLimit: { value: "", unit: "Hours" }, 
  description: "", 
  category: "Residential",
  purchases: 0, 
  features: [], 
  restrictions: [], 
  createdAt: new Date().toISOString().split("T")[0],
  client_sessions: {},
  bandwidth_limit: 0,
  concurrent_connections: 1,
  priority_level: 4,
  router_specific: false,
  allowed_routers_ids: [],
  FUP_policy: "",
  FUP_threshold: 80,
});

// Memoized constants for better performance
const speedUnits = Object.freeze(["Kbps", "Mbps", "Gbps"]);
const expiryUnits = Object.freeze(["Days", "Months"]);
const dataUnits = Object.freeze(["GB", "TB", "Unlimited"]);
const usageUnits = Object.freeze(["Hours", "Unlimited"]);
const categories = Object.freeze(["Residential", "Business", "Promotional", "Enterprise"]);
const planTypes = Object.freeze(["Paid", "Free Trial"]);

const featuresOptions = Object.freeze([
  "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
  "24/7 Support", "Low Latency", "Prepaid Access", "High Priority Bandwidth", 
  "Multiple Device Support", "Static IP Address", "VPN Access", "Gaming Optimized", 
  "Streaming Optimized", "No Throttling", "Premium Routing"
]);

const restrictionsOptions = Object.freeze([
  "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
  "Rural Use Only", "Requires Signal Booster", "Speed may be reduced after fair use threshold", 
  "Limited to specific router locations", "No torrenting or P2P allowed", 
  "Streaming limited to SD quality", "Business use only", "Non-transferable", 
  "Subject to fair usage policy", "Speed varies by location"
]);

const priorityOptions = Object.freeze([
  { value: 1, label: "Lowest", icon: CloudOff, color: "text-gray-500" },
  { value: 2, label: "Low", icon: CloudDrizzle, color: "text-blue-500" },
  { value: 3, label: "Medium", icon: CloudRain, color: "text-green-500" },
  { value: 4, label: "High", icon: Cloud, color: "text-yellow-500" },
  { value: 5, label: "Highest", icon: CloudSnow, color: "text-orange-500" },
  { value: 6, label: "Critical", icon: CloudLightning, color: "text-red-500" },
  { value: 7, label: "Premium", icon: Server, color: "text-purple-500" },
  { value: 8, label: "VIP", icon: Crown, color: "text-pink-500" },
]);

const bandwidthPresets = Object.freeze([
  { value: 1024, label: "1 Mbps" },
  { value: 2048, label: "2 Mbps" },
  { value: 5120, label: "5 Mbps" },
  { value: 10240, label: "10 Mbps" },
  { value: 20480, label: "20 Mbps" },
  { value: 51200, label: "50 Mbps" },
  { value: 102400, label: "100 Mbps" },
  { value: 0, label: "Unlimited" },
]);

const usageLimitPresets = Object.freeze([
  { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: Gift },
  { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: Home },
  { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: Briefcase },
  { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: Calendar },
  { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: Server },
]);

// Utility functions
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

const formatBandwidth = (kbps) => {
  if (kbps === 0) return "Unlimited";
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} Kbps`;
};

const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return [];
  }
  return Object.entries(obj);
};

// Theme-aware styling functions
const getThemeClasses = (theme) => ({
  // Background classes
  bg: {
    primary: theme === 'dark' ? 'bg-dark-background-primary' : 'bg-light-background-primary',
    secondary: theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-light-background-secondary',
    tertiary: theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-light-background-tertiary',
    card: theme === 'dark' ? 'bg-dark-background-secondary' : 'bg-white',
  },
  // Text classes
  text: {
    primary: theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary',
    secondary: theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary',
    tertiary: theme === 'dark' ? 'text-dark-text-tertiary' : 'text-light-text-tertiary',
  },
  // Border classes
  border: {
    light: theme === 'dark' ? 'border-dark-border-light' : 'border-light-border-light',
    medium: theme === 'dark' ? 'border-dark-border-medium' : 'border-light-border-medium',
    dark: theme === 'dark' ? 'border-dark-border-dark' : 'border-light-border-dark',
  },
  // Input classes
  input: theme === 'dark' 
    ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary placeholder-dark-text-tertiary focus:border-dark-primary-400 focus:ring-dark-primary-900'
    : 'bg-white border-light-border-medium text-light-text-primary placeholder-light-text-tertiary focus:border-light-primary-500 focus:ring-light-primary-100',
  // Button classes
  button: {
    primary: theme === 'dark' 
      ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white' 
      : 'bg-light-primary-600 hover:bg-light-primary-700 text-white',
    secondary: theme === 'dark'
      ? 'bg-dark-background-tertiary hover:bg-dark-border-light text-dark-text-primary'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  }
});

// Responsive Dropdown Component
const ResponsiveDropdown = ({ 
  isOpen, 
  onToggle, 
  children, 
  trigger, 
  position = "left",
  className = "",
  mobileFullWidth = true
}) => {
  const { theme } = useTheme();
  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={onToggle}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute z-50 mt-2 rounded-lg shadow-lg border
                ${theme === 'dark' 
                  ? 'bg-dark-background-secondary border-dark-border-medium' 
                  : 'bg-white border-gray-200'
                }
                ${position === 'right' ? 'right-0' : 'left-0'}
                ${mobileFullWidth 
                  ? 'w-screen max-w-xs sm:max-w-md md:max-w-lg lg:w-auto lg:min-w-[200px]' 
                  : 'min-w-[200px]'
                }
                lg:max-h-96 overflow-y-auto
              `}
              style={{
                maxHeight: 'calc(100vh - 200px)'
              }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Select Component
const EnhancedSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const selectedOption = options.find(opt => opt.value === value) || 
                       options.find(opt => opt === value);

  return (
    <ResponsiveDropdown
      isOpen={isOpen}
      onToggle={() => !disabled && setIsOpen(!isOpen)}
      trigger={
        <div className={`
          flex items-center justify-between w-full px-4 py-2 rounded-lg border
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${themeClasses.input} ${className}
        `}>
          <span className="truncate">
            {selectedOption ? (selectedOption.label || selectedOption) : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      }
      mobileFullWidth={true}
    >
      <div className="py-1 max-h-60 overflow-y-auto">
        {options.map((option, index) => {
          const optionValue = option.value || option;
          const optionLabel = option.label || option;
          const isSelected = value === optionValue;
          
          return (
            <div
              key={index}
              onClick={() => {
                onChange(optionValue);
                setIsOpen(false);
              }}
              className={`
                px-4 py-2 cursor-pointer transition-colors
                ${isSelected 
                  ? theme === 'dark' 
                    ? 'bg-dark-primary-600 text-white' 
                    : 'bg-teal-600 text-white'
                  : theme === 'dark'
                    ? 'hover:bg-dark-background-tertiary'
                    : 'hover:bg-gray-100'
                }
              `}
            >
              {optionLabel}
            </div>
          );
        })}
      </div>
    </ResponsiveDropdown>
  );
};

const CreatePlans = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  
  const { form, setForm, errors, setErrors, handleChange, handleNestedChange, validateField } = useForm(getInitialFormState());
  const [plans, setPlans] = useState([]);
  const [routers, setRouters] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_subscriptions: 0,
    active_subscriptions: 0,
    total_revenue: 0,
    status_counts: {},
    plans: [],
    recent_subscriptions: []
  });
  const [compatibleRouters, setCompatibleRouters] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingSubs, setIsFetchingSubs] = useState(false);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);
  const [isFetchingRouters, setIsFetchingRouters] = useState(false);
  const [isFetchingCompatible, setIsFetchingCompatible] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newRestriction, setNewRestriction] = useState("");
  const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);
  const [isBandwidthMenuOpen, setIsBandwidthMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    status: "",
    plan: "",
    router: ""
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoized filtered and sorted plans for better performance
  const sortedPlans = useMemo(() => {
    if (!plans.length) return [];
    
    const filtered = plans.filter(
      (plan) =>
        (filterCategory === "All" || plan.category === filterCategory) &&
        (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key.includes(".")) {
        const [parent, child] = sortConfig.key.split(".");
        aValue = a[parent] ? a[parent][child] : "";
        bValue = b[parent] ? b[parent][child] : "";
      } else {
        aValue = a[sortConfig.key] || "";
        bValue = b[sortConfig.key] || "";
      }
      
      if (!isNaN(parseFloat(aValue)) && !isNaN(parseFloat(bValue))) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      return sortConfig.direction === "asc"
        ? typeof aValue === "string"
          ? aValue.localeCompare(bValue)
          : aValue - bValue
        : typeof bValue === "string"
          ? bValue.localeCompare(aValue)
          : bValue - aValue;
    });
  }, [plans, filterCategory, searchTerm, sortConfig]);

  // Data fetching effects
  useEffect(() => {
    const fetchPlans = async () => {
      setIsFetching(true);
      try {
        const response = await api.get("/api/internet_plans/");
        const plansData = response.data.results || response.data;
        if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
        const normalizedPlans = plansData.map((plan) => ({
          ...getInitialFormState(),
          id: plan.id,
          planType: plan.planType || plan.plan_type,
          name: plan.name,
          price: plan.price.toString(),
          active: plan.active,
          downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
          uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
          expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
          dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
          usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
          description: plan.description,
          category: plan.category,
          purchases: plan.purchases,
          features: Array.isArray(plan.features) ? plan.features : [],
          restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
          createdAt: plan.created_at || plan.createdAt,
          client_sessions: plan.client_sessions || {},
          bandwidth_limit: plan.bandwidth_limit || 0,
          concurrent_connections: plan.concurrent_connections || 1,
          priority_level: plan.priority_level || 4,
          router_specific: plan.router_specific || false,
          allowed_routers_ids: plan.allowed_routers_ids || [],
          FUP_policy: plan.FUP_policy || "",
          FUP_threshold: plan.FUP_threshold || 80,
          bandwidth_limit_display: plan.bandwidth_limit_display || formatBandwidth(plan.bandwidth_limit || 0),
          is_unlimited_data: plan.is_unlimited_data || false,
          is_unlimited_time: plan.is_unlimited_time || false,
        }));
        setPlans(normalizedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load plans from server.");
        setPlans([]);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchRouters = async () => {
      setIsFetchingRouters(true);
      try {
        const response = await api.get("/api/network_management/routers/");
        setRouters(response.data);
      } catch (error) {
        console.error("Error fetching routers:", error);
        toast.error("Failed to load routers from server.");
        setRouters([]);
      } finally {
        setIsFetchingRouters(false);
      }
    };
    
    if (viewMode === "form" || viewMode === "subscriptions" || viewMode === "details") {
      fetchRouters();
    }
  }, [viewMode]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsFetchingSubs(true);
      try {
        let url = "/api/internet_plans/subscriptions/";
        const params = new URLSearchParams();
        
        if (subscriptionFilters.status) params.append('status', subscriptionFilters.status);
        if (subscriptionFilters.plan) params.append('plan', subscriptionFilters.plan);
        if (subscriptionFilters.router) params.append('router', subscriptionFilters.router);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await api.get(url);
        const subsData = response.data;
        if (!Array.isArray(subsData)) throw new Error("Expected an array of subscriptions");
        setSubscriptions(subsData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        toast.error("Failed to load subscriptions from server.");
        setSubscriptions([]);
      } finally {
        setIsFetchingSubs(false);
      }
    };
    if (viewMode === "subscriptions") {
      fetchSubscriptions();
    }
  }, [viewMode, subscriptionFilters]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsFetchingAnalytics(true);
      try {
        const response = await api.get("/api/internet_plans/subscription-analytics/");
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to load analytics from server.");
        setAnalytics({
          total_subscriptions: 0,
          active_subscriptions: 0,
          total_revenue: 0,
          status_counts: {},
          plans: [],
          recent_subscriptions: []
        });
      } finally {
        setIsFetchingAnalytics(false);
      }
    };
    if (viewMode === "analytics") {
      fetchAnalytics();
    }
  }, [viewMode]);

  useEffect(() => {
    const fetchCompatibleRouters = async () => {
      if (!selectedPlan?.id || !selectedPlan.router_specific) return;
      setIsFetchingCompatible(true);
      try {
        const response = await api.get(`/api/internet_plans/${selectedPlan.id}/compatible-routers/`);
        setCompatibleRouters(response.data);
      } catch (error) {
        console.error("Error fetching compatible routers:", error);
        toast.error("Failed to load compatible routers.");
        setCompatibleRouters([]);
      } finally {
        setIsFetchingCompatible(false);
      }
    };
    if (viewMode === "details") {
      fetchCompatibleRouters();
    }
  }, [viewMode, selectedPlan]);

  // Form validation effects
  useEffect(() => {
    if (form.planType === "Free Trial" && form.price !== "0") {
      setForm((prev) => ({ ...prev, price: "0" }));
    }
  }, [form.planType, setForm]);

  useEffect(() => {
    if (form.dataLimit.unit === "Unlimited") {
      handleNestedChange("dataLimit", "value", "Unlimited");
    }
  }, [form.dataLimit.unit, handleNestedChange]);

  useEffect(() => {
    if (form.usageLimit.unit === "Unlimited") {
      handleNestedChange("usageLimit", "value", "Unlimited");
    }
  }, [form.usageLimit.unit, handleNestedChange]);

  // Event handlers with useCallback for performance
  const addFeature = useCallback(() => {
    if (newFeature && !form.features.includes(newFeature)) {
      setForm((prev) => {
        const updatedFeatures = [...prev.features, newFeature];
        return { ...prev, features: updatedFeatures };
      });
      setNewFeature("");
    }
  }, [newFeature, form.features, setForm]);

  const addRestriction = useCallback(() => {
    if (newRestriction && !form.restrictions.includes(newRestriction)) {
      setForm((prev) => {
        const updatedRestrictions = [...prev.restrictions, newRestriction];
        return { ...prev, restrictions: updatedRestrictions };
      });
      setNewRestriction("");
    }
  }, [newRestriction, form.restrictions, setForm]);

  const removeListItem = useCallback((list, item) => {
    setForm((prev) => {
      const updatedList = prev[list].filter((i) => i !== item);
      return { ...prev, [list]: updatedList };
    });
  }, [setForm]);

  const toggleRouterSelection = useCallback((routerId) => {
    setForm((prev) => {
      const currentRouters = [...prev.allowed_routers_ids];
      const index = currentRouters.indexOf(routerId);
      
      if (index > -1) {
        currentRouters.splice(index, 1);
      } else {
        currentRouters.push(routerId);
      }
      
      return { ...prev, allowed_routers_ids: currentRouters };
    });
  }, [setForm]);

  const requestSort = useCallback((key) => {
    setSortConfig({ 
      key, 
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" 
    });
  }, [sortConfig]);

  const validateAndSavePlan = async () => {
    const newErrors = {};
    
    // Comprehensive validation
    if (!form.planType) newErrors.planType = "Plan type is required";
    if (!form.name?.trim()) newErrors.name = "Plan name is required";
    if (!form.category) newErrors.category = "Category is required";
    
    if (form.planType === "Paid") {
      const price = parseFloat(form.price);
      if (!form.price || isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number for paid plans";
      }
    }
    
    if (!form.downloadSpeed.value) newErrors.downloadSpeed = "Download speed is required";
    if (!form.uploadSpeed.value) newErrors.uploadSpeed = "Upload speed is required";
    if (!form.expiry.value) newErrors.expiry = "Expiry duration is required";
    if (!form.dataLimit.value) newErrors.dataLimit = "Data limit is required";
    if (!form.usageLimit.value) newErrors.usageLimit = "Usage limit is required";
    if (!form.description?.trim()) newErrors.description = "Description is required";

    // Numeric validations
    const downloadSpeed = parseFloat(form.downloadSpeed.value);
    const uploadSpeed = parseFloat(form.uploadSpeed.value);
    const expiry = parseInt(form.expiry.value, 10);

    if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
      newErrors.downloadSpeed = "Download speed must be a positive number";
    }
    if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
      newErrors.uploadSpeed = "Upload speed must be a positive number";
    }
    if (isNaN(expiry) || expiry <= 0) {
      newErrors.expiry = "Expiry duration must be a positive integer";
    }

    // Data limit validation
    if (form.dataLimit.unit === "Unlimited" && form.dataLimit.value !== "Unlimited") {
      newErrors.dataLimit = "When data unit is Unlimited, value must be 'Unlimited'";
    } else if (form.dataLimit.unit !== "Unlimited") {
      const dataValue = parseFloat(form.dataLimit.value);
      if (isNaN(dataValue) || dataValue <= 0) {
        newErrors.dataLimit = "Data limit must be a positive number";
      }
    }

    // Usage limit validation
    if (form.usageLimit.unit === "Unlimited" && form.usageLimit.value !== "Unlimited") {
      newErrors.usageLimit = "When usage unit is Unlimited, value must be 'Unlimited'";
    } else if (form.usageLimit.unit !== "Unlimited") {
      const usageValue = parseFloat(form.usageLimit.value);
      if (isNaN(usageValue) || usageValue <= 0) {
        newErrors.usageLimit = "Usage limit must be a positive number";
      }
    }

    // Free trial specific validations
    if (form.planType === "Free Trial") {
      if (parseFloat(form.price) !== 0) {
        newErrors.price = "Free Trial plans must have price set to 0";
      }
      if (form.router_specific) {
        newErrors.router_specific = "Free Trial plans cannot be router-specific";
      }
      if (form.priority_level > 4) {
        newErrors.priority_level = "Free Trial plans cannot have premium priority levels";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    // Prepare data for API
    const planData = {
      planType: form.planType,
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      active: form.active,
      downloadSpeed: form.downloadSpeed,
      uploadSpeed: form.uploadSpeed,
      expiry: form.expiry,
      dataLimit: form.dataLimit,
      usageLimit: form.usageLimit,
      description: form.description.trim(),
      category: form.category,
      purchases: editingPlan ? editingPlan.purchases : 0,
      features: form.features,
      restrictions: form.restrictions,
      createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
      client_sessions: editingPlan ? editingPlan.client_sessions : {},
      bandwidth_limit: form.bandwidth_limit,
      concurrent_connections: form.concurrent_connections,
      priority_level: form.priority_level,
      router_specific: form.router_specific,
      allowed_routers_ids: form.router_specific ? form.allowed_routers_ids : [],
      FUP_policy: form.FUP_policy,
      FUP_threshold: form.FUP_threshold,
    };

    try {
      let response;
      if (editingPlan) {
        response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, ...response.data } : p)));
        toast.success(`Updated plan: ${planData.name}`);
      } else {
        response = await api.post("/api/internet_plans/", planData);
        setPlans((prev) => [...prev, response.data]);
        toast.success(`Created plan: ${planData.name}`);
      }
      setForm(deepClone(getInitialFormState()));
      setEditingPlan(null);
      setViewMode("list");
      setErrors({});
    } catch (error) {
      console.error("Error saving plan:", error.response?.data || error.message);
      const errorDetails = error.response?.data?.details || error.response?.data || error.message;
      toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${JSON.stringify(errorDetails)}`);
    }
  };

  const deletePlan = async (planId, planName) => {
    if (window.confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/internet_plans/${planId}/`);
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        if (selectedPlan && selectedPlan.id === planId) {
          setSelectedPlan(null);
          setViewMode("list");
        }
        toast.success(`Deleted plan: ${planName}`);
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error(`Failed to delete plan: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const activatePlanOnRouter = async (planId, routerId) => {
    try {
      const response = await api.post(`/api/internet_plans/${planId}/activate-on-router/${routerId}/`);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error activating plan on router:", error);
      toast.error(`Failed to activate: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUsagePresetSelect = useCallback((hours) => {
    handleNestedChange("usageLimit", "value", hours);
    handleNestedChange("usageLimit", "unit", "Hours");
    setIsUsageMenuOpen(false);
  }, [handleNestedChange]);

  const handleBandwidthPresetSelect = useCallback((value) => {
    setForm((prev) => ({ ...prev, bandwidth_limit: value }));
    setIsBandwidthMenuOpen(false);
  }, [setForm]);

  const handleSubscriptionFilterChange = useCallback((filter, value) => {
    setSubscriptionFilters((prev) => ({ ...prev, [filter]: value }));
  }, []);

  // Helper functions
  const renderStars = useCallback((purchases) => {
    const rating = calculateRating(purchases);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < Math.round(rating) 
              ? "text-amber-400 fill-current" 
              : theme === 'dark' ? "text-gray-600" : "text-gray-300"}`} 
          />
        ))}
        <span className={`ml-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  }, [theme]);

  const getCategoryIcon = useCallback((category) => {
    const icons = {
      Residential: <Home className="w-4 h-4 text-teal-600" />,
      Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
      Promotional: <Gift className="w-4 h-4 text-purple-600" />,
      Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
    };
    return icons[category] || null;
  }, []);

  const getPriorityIcon = useCallback((level) => {
    const option = priorityOptions.find(opt => opt.value === level);
    if (!option) return null;
    const IconComponent = option.icon;
    return <IconComponent className={`w-4 h-4 ${option.color}`} />;
  }, []);

  // Enhanced dropdown components for mobile responsiveness
  const renderUnitDropdown = (field, value, onChange, units, className = "") => (
    <EnhancedSelect
      value={value}
      onChange={(newValue) => onChange(field, "unit", newValue)}
      options={units.map(unit => ({ value: unit, label: unit }))}
      className={className}
    />
  );

  const renderPresetDropdown = (isOpen, onToggle, presets, onSelect, triggerText) => (
    <ResponsiveDropdown
      isOpen={isOpen}
      onToggle={onToggle}
      trigger={
        <motion.button 
          className={`px-3 py-2 text-sm rounded-lg border flex items-center space-x-2 ${
            theme === 'dark' 
              ? 'bg-dark-background-primary border-dark-border-medium text-dark-text-primary' 
              : 'bg-white border-gray-300 text-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          <span>{triggerText}</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      }
      mobileFullWidth={true}
    >
      <div className="p-2 max-h-60 overflow-y-auto">
        {presets.map((preset, index) => {
          const IconComponent = preset.icon;
          return (
            <div
              key={index}
              onClick={() => onSelect(preset.hours || preset.value)}
              className="p-3 hover:bg-opacity-50 hover:bg-gray-200 cursor-pointer flex items-center space-x-3 rounded-lg"
            >
              <IconComponent className="w-4 h-4 text-purple-600" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${themeClasses.text.primary}`}>
                  {preset.days ? `${preset.days} Days (${preset.hours} Hours)` : preset.label}
                </p>
                {preset.description && (
                  <p className={`text-xs truncate ${themeClasses.text.secondary}`}>
                    {preset.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ResponsiveDropdown>
  );

  // Main render functions
  const renderPlanList = () => (
    <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
              ConnectSphere Packages
            </h2>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg border"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Action Buttons - Desktop */}
        <div className={`flex-col sm:flex-row gap-3 w-full sm:w-auto ${
          isMobileMenuOpen ? 'flex' : 'hidden sm:flex'
        }`}>
          <motion.button
            onClick={() => { setViewMode("analytics"); setIsMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center mb-2 sm:mb-0 ${
              theme === 'dark' 
                ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Analytics</span>
          </motion.button>
          
          <motion.button
            onClick={() => { setViewMode("subscriptions"); setIsMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center mb-2 sm:mb-0 ${
              theme === 'dark'
                ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Subscriptions</span>
          </motion.button>
          
          <motion.button
            onClick={() => { setForm(deepClone(getInitialFormState())); setEditingPlan(null); setViewMode("form"); setIsMobileMenuOpen(false); }}
            className={`px-4 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">New Plan</span>
          </motion.button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <EnhancedSelect
            value={filterCategory}
            onChange={setFilterCategory}
            options={[{ value: "All", label: "All Categories" }, ...categories.map(cat => ({ value: cat, label: cat }))]}
          />
        </div>
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" 
            placeholder="Search plans..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Plans Table */}
      {isFetching ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className={`rounded-xl shadow-lg p-6 text-center theme-transition ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
          <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold theme-transition">No Plans Available</h3>
          <p className={`mt-2 theme-transition ${themeClasses.text.secondary}`}>
            Create a new plan to get started!
          </p>
          <motion.button
            onClick={() => setViewMode("form")}
            className={`mt-4 px-5 py-2 rounded-lg shadow-md theme-transition ${
              theme === 'dark'
                ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
                : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Plan
          </motion.button>
        </div>
      ) : (
        <div className={`rounded-xl shadow-lg overflow-hidden theme-transition ${themeClasses.bg.card}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y theme-transition" style={{ borderColor: 'inherit' }}>
              <thead className={`theme-transition ${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-100'}`}>
                <tr>
                  {[
                    { key: "name", label: "Name" }, 
                    { key: "planType", label: "Type" },
                    { key: "category", label: "Category" }, 
                    { key: "price", label: "Price" },
                    { key: "bandwidth_limit", label: "Bandwidth" }, 
                    { key: "purchases", label: "Subscribers" },
                    { key: "actions", label: "Actions" },
                  ].map((column) => (
                    <th
                      key={column.key} 
                      onClick={() => column.key !== "actions" && requestSort(column.key)}
                      className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-transition ${
                        column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""
                      } ${themeClasses.text.secondary}`}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {sortConfig.key === column.key && (
                          sortConfig.direction === "asc" ? 
                            <ChevronUp className="ml-1 w-4 h-4" /> : 
                            <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y theme-transition ${theme === 'dark' ? 'divide-dark-border-light' : 'divide-gray-200'}`}>
                {sortedPlans.map((plan) => (
                  <tr 
                    key={plan.id} 
                    className={`theme-transition hover:${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getCategoryIcon(plan.category)}
                        <span className={`ml-2 text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
                          {plan.name}
                        </span>
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
                      {plan.planType}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
                      {plan.category}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
                      {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.secondary}`}>
                      {plan.bandwidth_limit_display}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                        <span className={`text-sm theme-transition ${themeClasses.text.secondary}`}>
                          {plan.purchases}
                        </span>
                        {renderStars(plan.purchases)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 sm:space-x-4">
                        <motion.button 
                          onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} 
                          className="focus:outline-none" 
                          whileHover={{ scale: 1.2 }} 
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 hover:text-indigo-800" />
                        </motion.button>
                        <motion.button 
                          onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} 
                          className="focus:outline-none" 
                          whileHover={{ rotate: 90 }} 
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 hover:text-emerald-800" />
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            const copiedPlan = { 
                              ...deepClone(plan), 
                              name: `Copy of ${plan.name}`, 
                              id: null, 
                              purchases: 0, 
                              client_sessions: {}, 
                              createdAt: new Date().toISOString().split("T")[0] 
                            };
                            setForm(copiedPlan); 
                            setEditingPlan(null); 
                            setViewMode("form");
                          }}
                          className="focus:outline-none" 
                          animate={{ scale: [1, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 hover:text-orange-800" />
                        </motion.button>
                        <motion.button 
                          onClick={() => deletePlan(plan.id, plan.name)} 
                          className="focus:outline-none" 
                          whileHover={{ x: [0, -2, 2, -2, 0] }} 
                          transition={{ duration: 0.3 }}
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 hover:text-red-800" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanForm = () => (
    <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
          {editingPlan ? "Edit Plan" : "New Plan"}
        </h2>
        <motion.button 
          onClick={() => { setViewMode("list"); setForm(deepClone(getInitialFormState())); setEditingPlan(null); }} 
          className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
          whileHover={{ rotate: 90 }}
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <div className={`p-2 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
        <div className="flex flex-wrap gap-2">
          {["basic", "specifications", "advanced", "description", "features"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? "bg-teal-600 text-white" 
                  : `${themeClasses.text.secondary} hover:${themeClasses.text.primary} hover:${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-100'}`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Details Tab */}
        {activeTab === "basic" && (
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Basic Details</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Plan Type <span className="text-red-500">*</span>
                  </label>
                  <EnhancedSelect
                    value={form.planType}
                    onChange={(value) => setForm(prev => ({ ...prev, planType: value }))}
                    options={planTypes.map(type => ({ value: type, label: type }))}
                    placeholder="Select Plan Type"
                  />
                  {errors.planType && <p className="text-red-500 text-sm mt-1">{errors.planType}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="name" 
                    value={form.name || ""} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                    placeholder="e.g., Rural Wi-Fi Pro" 
                    required 
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <EnhancedSelect
                    value={form.category}
                    onChange={(value) => setForm(prev => ({ ...prev, category: value }))}
                    options={categories.map(cat => ({ value: cat, label: cat }))}
                    placeholder="Select Category"
                  />
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number" 
                    name="price" 
                    value={form.price || ""} 
                    onChange={handleChange} 
                    disabled={form.planType !== "Paid"}
                    className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${
                      form.planType !== "Paid" 
                        ? "bg-gray-100 cursor-not-allowed border-gray-300" 
                        : themeClasses.input
                    }`}
                    placeholder="e.g., 29.99" 
                    step="0.01" 
                    min="0" 
                    required={form.planType === "Paid"}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              </div>
              <div className="flex items-center">
                <label className={`block text-sm font-medium theme-transition mr-4 ${themeClasses.text.primary}`}>
                  Active
                </label>
                <div 
                  onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} 
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    form.active 
                      ? theme === 'dark' ? 'bg-dark-primary-600' : 'bg-teal-600'
                      : theme === 'dark' ? 'bg-dark-border-medium' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    form.active ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specifications" && (
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Specifications</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Download Speed <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={form.downloadSpeed.value || ""} 
                    onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
                    className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 10" 
                    required 
                  />
                  {errors.downloadSpeed && <p className="text-red-500 text-sm mt-1">{errors.downloadSpeed}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Unit
                  </label>
                  {renderUnitDropdown("downloadSpeed", form.downloadSpeed.unit, handleNestedChange, speedUnits)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Upload Speed <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={form.uploadSpeed.value || ""} 
                    onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
                    className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                    min="0.01" 
                    step="0.01" 
                    placeholder="e.g., 2" 
                    required 
                  />
                  {errors.uploadSpeed && <p className="text-red-500 text-sm mt-1">{errors.uploadSpeed}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Unit
                  </label>
                  {renderUnitDropdown("uploadSpeed", form.uploadSpeed.unit, handleNestedChange, speedUnits)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Expiry <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={form.expiry.value || ""} 
                    onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
                    className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                    min="1" 
                    step="1" 
                    placeholder="e.g., 30" 
                    required 
                  />
                  {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Unit
                  </label>
                  {renderUnitDropdown("expiry", form.expiry.unit, handleNestedChange, expiryUnits)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Data Limit <span className="text-red-500">*</span>
                  </label>
                  <input 
                    value={form.dataLimit.value || ""} 
                    onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} 
                    className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                    placeholder={form.dataLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 50"} 
                    disabled={form.dataLimit.unit === "Unlimited"} 
                    required 
                  />
                  {errors.dataLimit && <p className="text-red-500 text-sm mt-1">{errors.dataLimit}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Unit
                  </label>
                  {renderUnitDropdown("dataLimit", form.dataLimit.unit, handleNestedChange, dataUnits)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 relative">
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Usage Limit <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input 
                      value={form.usageLimit.value || ""} 
                      onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} 
                      className={`flex-1 px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                      placeholder={form.usageLimit.unit === "Unlimited" ? "Unlimited" : "e.g., 720"} 
                      disabled={form.usageLimit.unit === "Unlimited"} 
                      required 
                    />
                    {renderPresetDropdown(
                      isUsageMenuOpen,
                      () => setIsUsageMenuOpen(!isUsageMenuOpen),
                      usageLimitPresets,
                      handleUsagePresetSelect,
                      "Presets"
                    )}
                  </div>
                  {errors.usageLimit && <p className="text-red-500 text-sm mt-1">{errors.usageLimit}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                    Unit
                  </label>
                  {renderUnitDropdown("usageLimit", form.usageLimit.unit, handleNestedChange, usageUnits)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings Tab */}
        {activeTab === "advanced" && (
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Advanced Settings</h3>
            <div className="space-y-6">
              <div className="relative">
                <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                  Bandwidth Limit (Kbps)
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    value={form.bandwidth_limit || 0} 
                    onChange={(e) => setForm((prev) => ({ ...prev, bandwidth_limit: parseInt(e.target.value, 10) || 0 }))} 
                    className={`flex-1 px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                    min="0" 
                    step="1" 
                    placeholder="e.g., 10240" 
                  />
                  {renderPresetDropdown(
                    isBandwidthMenuOpen,
                    () => setIsBandwidthMenuOpen(!isBandwidthMenuOpen),
                    bandwidthPresets,
                    handleBandwidthPresetSelect,
                    "Presets"
                  )}
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                  Concurrent Connections
                </label>
                <input 
                  type="number" 
                  value={form.concurrent_connections || 1} 
                  onChange={(e) => setForm((prev) => ({ ...prev, concurrent_connections: parseInt(e.target.value, 10) || 1 }))} 
                  className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                  min="1" 
                  step="1" 
                  placeholder="e.g., 5" 
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                  Priority Level
                </label>
                <EnhancedSelect
                  value={form.priority_level}
                  onChange={(value) => setForm(prev => ({ ...prev, priority_level: parseInt(value, 10) }))}
                  options={priorityOptions.map(opt => ({ 
                    value: opt.value, 
                    label: (
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(opt.value)}
                        <span>{opt.label}</span>
                      </div>
                    )
                  }))}
                />
                {errors.priority_level && <p className="text-red-500 text-sm mt-1">{errors.priority_level}</p>}
              </div>
              
              <div className="flex items-center">
                <label className={`block text-sm font-medium theme-transition mr-4 ${themeClasses.text.primary}`}>
                  Router Specific
                </label>
                <div 
                  onClick={() => setForm((prev) => ({ ...prev, router_specific: !prev.router_specific }))} 
                  className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                    form.router_specific 
                      ? theme === 'dark' ? 'bg-dark-primary-600' : 'bg-teal-600'
                      : theme === 'dark' ? 'bg-dark-border-medium' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                    form.router_specific ? "translate-x-6" : "translate-x-1"
                  }`} />
                </div>
                {errors.router_specific && <p className="text-red-500 text-sm ml-2">{errors.router_specific}</p>}
              </div>
              
              {form.router_specific && (
                <div>
                  <label className={`block text-sm font-medium theme-transition mb-2 ${themeClasses.text.primary}`}>
                    Allowed Routers
                  </label>
                  {isFetchingRouters ? (
                    <div className="flex justify-center py-4">
                      <FaSpinner className="w-6 h-6 text-teal-600 animate-spin" />
                    </div>
                  ) : routers.length === 0 ? (
                    <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No routers available.</p>
                  ) : (
                    <div className={`space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 theme-transition ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
                      {routers.map((router) => (
                        <div key={router.id} className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={form.allowed_routers_ids.includes(router.id)} 
                            onChange={() => toggleRouterSelection(router.id)} 
                            className={`h-4 w-4 focus:ring-teal-500 border rounded ${
                              theme === 'dark' 
                                ? 'bg-dark-background-primary border-dark-border-medium text-dark-primary-600' 
                                : 'text-teal-600 border-gray-300'
                            }`}
                          />
                          <label className={`ml-2 text-sm theme-transition ${themeClasses.text.primary}`}>
                            {router.name || `Router ${router.id}`}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                  FUP Policy
                </label>
                <input 
                  value={form.FUP_policy || ""} 
                  onChange={(e) => setForm((prev) => ({ ...prev, FUP_policy: e.target.value }))} 
                  className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                  placeholder="e.g., Speed reduced to 1Mbps after threshold" 
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium theme-transition mb-1 ${themeClasses.text.primary}`}>
                  FUP Threshold (%)
                </label>
                <input 
                  type="number" 
                  value={form.FUP_threshold || 80} 
                  onChange={(e) => setForm((prev) => ({ ...prev, FUP_threshold: parseInt(e.target.value, 10) || 80 }))} 
                  className={`w-full px-4 py-2 rounded-lg shadow-sm theme-transition ${themeClasses.input}`}
                  min="0" 
                  max="100" 
                  step="1" 
                  placeholder="e.g., 80" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === "description" && (
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Plan Description</h3>
            <div data-color-mode={theme}>
              <MDEditor 
                value={form.description || ""} 
                onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} 
                height={400} 
                preview="edit" 
              />
            </div>
            {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
          </div>
        )}

        {/* Features & Restrictions Tab */}
        {activeTab === "features" && (
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Features & Restrictions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className={`block text-sm font-medium theme-transition mb-2 ${themeClasses.text.primary}`}>
                  Features
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <EnhancedSelect
                      value={newFeature}
                      onChange={setNewFeature}
                      options={featuresOptions.map(feature => ({ value: feature, label: feature }))}
                      placeholder="Select or type custom"
                    />
                    <motion.button 
                      onClick={addFeature} 
                      className={`px-4 py-2 rounded-lg theme-transition ${themeClasses.button.primary}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className={`space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 theme-transition ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
                    {form.features.map((feature) => (
                      <div key={feature} className={`flex items-center justify-between p-2 hover:bg-opacity-50 hover:bg-gray-200 rounded theme-transition`}>
                        <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{feature}</span>
                        <button 
                          onClick={() => removeListItem("features", feature)} 
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.features.length === 0 && (
                      <p className={`text-sm text-center py-2 theme-transition ${themeClasses.text.secondary}`}>
                        No features added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium theme-transition mb-2 ${themeClasses.text.primary}`}>
                  Restrictions
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <EnhancedSelect
                      value={newRestriction}
                      onChange={setNewRestriction}
                      options={restrictionsOptions.map(restriction => ({ value: restriction, label: restriction }))}
                      placeholder="Select or type custom"
                    />
                    <motion.button 
                      onClick={addRestriction} 
                      className={`px-4 py-2 rounded-lg theme-transition ${themeClasses.button.primary}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className={`space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2 theme-transition ${themeClasses.border.light} ${themeClasses.bg.primary}`}>
                    {form.restrictions.map((restriction) => (
                      <div key={restriction} className={`flex items-center justify-between p-2 hover:bg-opacity-50 hover:bg-gray-200 rounded theme-transition`}>
                        <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{restriction}</span>
                        <button 
                          onClick={() => removeListItem("restrictions", restriction)} 
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.restrictions.length === 0 && (
                      <p className={`text-sm text-center py-2 theme-transition ${themeClasses.text.secondary}`}>
                        No restrictions added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        <motion.button 
          onClick={() => { setViewMode("list"); setForm(deepClone(getInitialFormState())); setEditingPlan(null); }} 
          className={`px-6 py-2 rounded-lg shadow-md theme-transition ${themeClasses.button.secondary}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
        <motion.button 
          onClick={validateAndSavePlan} 
          className={`px-6 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${themeClasses.button.primary}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save className="w-5 h-5 mr-2" />
          {editingPlan ? "Update Plan" : "Create Plan"}
        </motion.button>
      </div>
    </div>
  );

  const renderPlanDetails = () => {
    if (!selectedPlan) return null;

    return (
      <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">
            {selectedPlan.name} Details
          </h2>
          <motion.button 
            onClick={() => { setViewMode("list"); setSelectedPlan(null); }} 
            className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
            whileHover={{ rotate: 90 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Overview */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Plan Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Type:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{selectedPlan.planType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Category:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{selectedPlan.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Price:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.planType === "Paid" ? `Ksh ${formatNumber(selectedPlan.price)}` : "Free"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Active:</span>
                <span className={`text-sm ${selectedPlan.active ? "text-green-600" : "text-red-600"}`}>
                  {selectedPlan.active ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Subscribers:</span>
                <div className="flex items-center">
                  <span className={`text-sm mr-2 theme-transition ${themeClasses.text.primary}`}>
                    {selectedPlan.purchases}
                  </span>
                  {renderStars(selectedPlan.purchases)}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Created:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {new Date(selectedPlan.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Technical Specs</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Download Speed:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Upload Speed:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.uploadSpeed.value} {selectedPlan.uploadSpeed.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Bandwidth Limit:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {formatBandwidth(selectedPlan.bandwidth_limit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Expiry:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.expiry.value} {selectedPlan.expiry.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Data Limit:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Usage Limit:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.usageLimit.value} {selectedPlan.usageLimit.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Concurrent Connections:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.concurrent_connections}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Priority Level:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {priorityOptions.find(opt => opt.value === selectedPlan.priority_level)?.label || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Router Specific:</span>
                <span className={`text-sm ${selectedPlan.router_specific ? "text-green-600" : "text-red-600"}`}>
                  {selectedPlan.router_specific ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>FUP Threshold:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.FUP_threshold}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>FUP Policy:</span>
                <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                  {selectedPlan.FUP_policy || "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Description</h3>
            <div data-color-mode={theme}>
              <MDEditor.Markdown source={selectedPlan.description || "No description provided."} />
            </div>
          </div>

          {/* Features */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Features</h3>
            {selectedPlan.features.length > 0 ? (
              <ul className="space-y-2">
                {selectedPlan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm theme-transition">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className={themeClasses.text.primary}>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No features listed.</p>
            )}
          </div>

          {/* Restrictions */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Restrictions</h3>
            {selectedPlan.restrictions.length > 0 ? (
              <ul className="space-y-2">
                {selectedPlan.restrictions.map((restriction) => (
                  <li key={restriction} className="flex items-center text-sm theme-transition">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className={themeClasses.text.primary}>{restriction}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No restrictions listed.</p>
            )}
          </div>

          {/* Compatible Routers */}
          {selectedPlan.router_specific && (
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-xl font-semibold theme-transition mb-4">Compatible Routers</h3>
              {isFetchingCompatible ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
              ) : compatibleRouters.length === 0 ? (
                <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No compatible routers found.</p>
              ) : (
                <div className="space-y-4">
                  {compatibleRouters.map((router) => (
                    <div key={router.id} className={`flex items-center justify-between p-4 rounded-lg theme-transition ${
                      theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Router className="w-5 h-5 text-teal-600" />
                        <span className={`text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
                          {router.name || `Router ${router.id}`}
                        </span>
                      </div>
                      <motion.button 
                        onClick={() => activatePlanOnRouter(selectedPlan.id, router.id)} 
                        className={`px-4 py-2 rounded-lg text-sm flex items-center theme-transition ${themeClasses.button.primary}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Zap className="w-4 h-4 mr-2" /> Activate
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Active Sessions */}
          <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
            <h3 className="text-xl font-semibold theme-transition mb-4">Active Sessions</h3>
            {Object.keys(selectedPlan.client_sessions).length > 0 ? (
              <div className="space-y-4">
                {safeObjectEntries(selectedPlan.client_sessions).map(([clientId, session]) => (
                  <div key={clientId} className={`p-4 rounded-lg theme-transition ${
                    theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Client ID:</span>
                        <p className={`text-sm theme-transition ${themeClasses.text.primary}`}>{clientId}</p>
                      </div>
                      <div>
                        <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Remaining Time:</span>
                        <p className={`text-sm theme-transition ${themeClasses.text.primary}`}>{formatTime(session.remaining_time)}</p>
                      </div>
                      <div>
                        <span className={`text-sm font-medium theme-transition ${themeClasses.text.secondary}`}>Data Used:</span>
                        <p className={`text-sm theme-transition ${themeClasses.text.primary}`}>{formatBytes(session.data_used)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No active sessions.</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <motion.button 
            onClick={() => { setForm(deepClone(selectedPlan)); setEditingPlan(selectedPlan); setViewMode("form"); }} 
            className={`px-6 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-dark-primary-600 hover:bg-dark-primary-700 text-white'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pencil className="w-5 h-5 mr-2" /> Edit Plan
          </motion.button>
          <motion.button 
            onClick={() => deletePlan(selectedPlan.id, selectedPlan.name)} 
            className={`px-6 py-2 rounded-lg shadow-md theme-transition flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-5 h-5 mr-2" /> Delete Plan
          </motion.button>
        </div>
      </div>
    );
  };

  const renderSubscriptions = () => (
    <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">Subscriptions</h2>
        <motion.button 
          onClick={() => setViewMode("list")} 
          className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
          whileHover={{ rotate: 90 }}
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Subscription Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <EnhancedSelect
            value={subscriptionFilters.status}
            onChange={(value) => handleSubscriptionFilterChange("status", value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
              { value: "suspended", label: "Suspended" }
            ]}
          />
        </div>
        <div className="w-full sm:w-48">
          <EnhancedSelect
            value={subscriptionFilters.plan}
            onChange={(value) => handleSubscriptionFilterChange("plan", value)}
            options={[
              { value: "", label: "All Plans" },
              ...plans.map(plan => ({ value: plan.id, label: plan.name }))
            ]}
          />
        </div>
        <div className="w-full sm:w-48">
          <EnhancedSelect
            value={subscriptionFilters.router}
            onChange={(value) => handleSubscriptionFilterChange("router", value)}
            options={[
              { value: "", label: "All Routers" },
              ...routers.map(router => ({ value: router.id, label: router.name || `Router ${router.id}` }))
            ]}
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      {isFetchingSubs ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className={`rounded-xl shadow-lg p-6 text-center theme-transition ${themeClasses.bg.card} ${themeClasses.border.medium}`}>
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold theme-transition">No Subscriptions Found</h3>
          <p className={`mt-2 theme-transition ${themeClasses.text.secondary}`}>Try adjusting the filters.</p>
        </div>
      ) : (
        <div className={`rounded-xl shadow-lg overflow-hidden theme-transition ${themeClasses.bg.card}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y theme-transition">
              <thead className={`theme-transition ${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-100'}`}>
                <tr>
                  {["ID", "User", "Plan", "Router", "Status", "Start Date", "End Date", "Data Used", "Time Remaining"].map((header) => (
                    <th key={header} className={`px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-transition ${themeClasses.text.secondary}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y theme-transition ${theme === 'dark' ? 'divide-dark-border-light' : 'divide-gray-200'}`}>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className={`theme-transition hover:${theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'}`}>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {sub.id}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {sub.user?.username || "Unknown"}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {sub.plan?.name || "Unknown"}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {sub.router?.name || "Unknown"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sub.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : sub.status === "expired" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {new Date(sub.start_date).toLocaleDateString()}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {new Date(sub.end_date).toLocaleDateString()}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {formatBytes(sub.data_used)}
                    </td>
                    <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-sm theme-transition ${themeClasses.text.primary}`}>
                      {formatTime(sub.remaining_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className={`p-4 sm:p-6 space-y-6 min-h-screen theme-transition ${themeClasses.bg.primary}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold theme-transition tracking-tight">Subscription Analytics</h2>
        <motion.button 
          onClick={() => setViewMode("list")} 
          className="p-2 theme-transition hover:bg-opacity-20 hover:bg-gray-500 rounded-lg"
          whileHover={{ rotate: 90 }}
        >
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      {isFetchingAnalytics ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-teal-600 mb-4" />
              <h3 className="text-2xl font-bold theme-transition mb-2">{analytics.total_subscriptions}</h3>
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Total Subscriptions</p>
            </div>
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold theme-transition mb-2">{analytics.active_subscriptions}</h3>
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Active Subscriptions</p>
            </div>
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold theme-transition mb-2">Ksh {formatNumber(analytics.total_revenue)}</h3>
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Total Revenue</p>
            </div>
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition flex flex-col items-center text-center ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600 mb-4" />
              <h3 className="text-2xl font-bold theme-transition mb-2">{(analytics.plans || []).length}</h3>
              <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>Plans Analyzed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-xl font-semibold theme-transition mb-4">Status Distribution</h3>
              {Object.keys(analytics.status_counts || {}).length > 0 ? (
                <div className="space-y-4">
                  {safeObjectEntries(analytics.status_counts || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`text-sm font-medium theme-transition capitalize ${themeClasses.text.secondary}`}>
                        {status}
                      </span>
                      <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No status data available.</p>
              )}
            </div>

            {/* Top Plans */}
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-xl font-semibold theme-transition mb-4">Top Plans</h3>
              {(analytics.plans || []).length > 0 ? (
                <div className="space-y-4">
                  {(analytics.plans || []).map((plan) => (
                    <div key={plan.id} className={`flex items-center justify-between p-4 rounded-lg theme-transition ${
                      theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                    }`}>
                      <span className={`text-sm font-medium theme-transition ${themeClasses.text.primary}`}>
                        {plan.name}
                      </span>
                      <span className={`text-sm theme-transition ${themeClasses.text.secondary}`}>
                        {plan.subscriptions} subs | Ksh {formatNumber(plan.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No plan data available.</p>
              )}
            </div>

            {/* Recent Subscriptions */}
            <div className={`p-4 sm:p-6 rounded-xl shadow-lg border theme-transition lg:col-span-2 ${themeClasses.bg.card} ${themeClasses.border.light}`}>
              <h3 className="text-xl font-semibold theme-transition mb-4">Recent Subscriptions</h3>
              {(analytics.recent_subscriptions || []).length > 0 ? (
                <div className="space-y-4">
                  {(analytics.recent_subscriptions || []).map((sub) => (
                    <div key={sub.id} className={`flex items-center justify-between p-4 rounded-lg theme-transition ${
                      theme === 'dark' ? 'bg-dark-background-tertiary' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-teal-600" />
                        <span className={`text-sm theme-transition ${themeClasses.text.primary}`}>
                          {sub.user?.username || "Unknown"} - {sub.plan?.name || "Unknown"}
                        </span>
                      </div>
                      <span className={`text-sm theme-transition ${themeClasses.text.secondary}`}>
                        {new Date(sub.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm theme-transition ${themeClasses.text.secondary}`}>No recent subscriptions.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {viewMode === "list" && renderPlanList()}
      {viewMode === "form" && renderPlanForm()}
      {viewMode === "details" && selectedPlan && renderPlanDetails()}
      {viewMode === "subscriptions" && renderSubscriptions()}
      {viewMode === "analytics" && renderAnalytics()}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme={theme}
      />
    </>
  );
};

export default CreatePlans;