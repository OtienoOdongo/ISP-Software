// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Copy,
//   Eye,
//   ChevronDown,
//   ChevronUp,
//   X,
//   Gift,
//   Wifi,
//   Star,
//   Home,
//   Briefcase,
//   Server,
//   Users,
//   Download,
//   Upload,
//   Calendar,
//   Zap,
//   Shield,
//   Clock,
//   Save,
//   Info,
//   Timer,
// } from "lucide-react";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Custom Hook for Form Management
// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// // Helper Functions
// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals,
//   });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// // Mock Data
// const mockPlans = [
//   {
//     id: 1,
//     planType: "Paid",
//     name: "Rural Starter",
//     price: 15.99,
//     active: true,
//     downloadSpeed: { value: "10", unit: "Mbps" },
//     uploadSpeed: { value: "2", unit: "Mbps" },
//     expiry: { value: "30", unit: "Days" },
//     dataLimit: { value: "100", unit: "GB" },
//     usageLimit: { value: "240", unit: "Hours" },
//     description: "Affordable Wi-Fi for small rural homes.",
//     category: "Residential",
//     purchases: 50,
//     features: ["Portable Router", "Multi-User Support"],
//     restrictions: ["Rural Use Only"],
//     createdAt: "2024-01-01",
//     clientSessions: {},
//   },
//   {
//     id: 2,
//     planType: "Paid",
//     name: "Village Pro",
//     price: 29.99,
//     active: true,
//     downloadSpeed: { value: "25", unit: "Mbps" },
//     uploadSpeed: { value: "5", unit: "Mbps" },
//     expiry: { value: "30", unit: "Days" },
//     dataLimit: { value: "250", unit: "GB" },
//     usageLimit: { value: "360", unit: "Hours" },
//     description: "Reliable Wi-Fi for rural businesses.",
//     category: "Business",
//     purchases: 30,
//     features: ["Extended Range", "24/7 Support"],
//     restrictions: ["No Refunds After Activation"],
//     createdAt: "2024-02-01",
//     clientSessions: {},
//   },
//   {
//     id: 3,
//     planType: "Free Trial",
//     name: "Rural Explorer",
//     price: 0,
//     active: true,
//     downloadSpeed: { value: "5", unit: "Mbps" },
//     uploadSpeed: { value: "1", unit: "Mbps" },
//     expiry: { value: "7", unit: "Days" },
//     dataLimit: { value: "50", unit: "GB" },
//     usageLimit: { value: "168", unit: "Hours" },
//     description: "Free trial to experience rural Wi-Fi.",
//     category: "Promotional",
//     purchases: 80,
//     features: ["Prepaid Access", "Low Latency"],
//     restrictions: ["Max 20 Users per Plan"],
//     createdAt: "2024-03-01",
//     clientSessions: {},
//   },
//   {
//     id: 4,
//     planType: "Paid",
//     name: "Community Hub",
//     price: 59.99,
//     active: true,
//     downloadSpeed: { value: "50", unit: "Mbps" },
//     uploadSpeed: { value: "10", unit: "Mbps" },
//     expiry: { value: "30", unit: "Days" },
//     dataLimit: { value: "Unlimited", unit: "GB" },
//     usageLimit: { value: "720", unit: "Hours" },
//     description: "High-speed Wi-Fi for community centers.",
//     category: "Enterprise",
//     purchases: 15,
//     features: ["Solar-Powered Option", "Extended Range"],
//     restrictions: ["Requires Signal Booster"],
//     createdAt: "2024-04-01",
//     clientSessions: {},
//   },
// ];

// const initialFormState = {
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
//   clientSessions: {},
// };

// // Options
// const speedUnits = ["Kbps", "Mbps", "Gbps"];
// const expiryUnits = ["Days", "Months"];
// const dataUnits = ["GB", "TB", "Unlimited"];
// const usageUnits = ["Hours", "Unlimited"];
// const categories = ["Residential", "Business", "Promotional", "Enterprise"];
// const planTypes = ["Paid", "Free Trial"];
// const featuresOptions = [
//   "Portable Router",
//   "Multi-User Support",
//   "Extended Range",
//   "Solar-Powered Option",
//   "24/7 Support",
//   "Low Latency",
//   "Prepaid Access",
// ];
// const restrictionsOptions = [
//   "Resale Only in Designated Area",
//   "No Refunds After Activation",
//   "Max 20 Users per Plan",
//   "Rural Use Only",
//   "Requires Signal Booster",
// ];

// // Usage Limit Presets with Descriptions
// const usageLimitPresets = [
//   {
//     hours: "168",
//     days: "7",
//     description: "Perfect for short trials or promotional offers.",
//     icon: <Gift className="w-4 h-4 text-purple-600" />,
//   },
//   {
//     hours: "240",
//     days: "10",
//     description: "Great for light residential use or testing.",
//     icon: <Home className="w-4 h-4 text-teal-600" />,
//   },
//   {
//     hours: "360",
//     days: "15",
//     description: "Ideal for small business or moderate use.",
//     icon: <Briefcase className="w-4 h-4 text-emerald-600" />,
//   },
//   {
//     hours: "720",
//     days: "30",
//     description: "Standard for monthly residential or enterprise plans.",
//     icon: <Calendar className="w-4 h-4 text-indigo-600" />,
//   },
//   {
//     hours: "1440",
//     days: "60",
//     description: "Extended duration for premium or heavy users.",
//     icon: <Server className="w-4 h-4 text-blue-600" />,
//   },
// ];

// const CreatePlans = () => {
//   const { form, setForm, handleChange, handleNestedChange } = useForm(initialFormState);
//   const [plans, setPlans] = useState([]);
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
//     try {
//       const savedPlans = JSON.parse(localStorage.getItem("isp-plans")) || mockPlans;
//       const normalizedPlans = savedPlans.map((plan) => ({
//         ...initialFormState,
//         ...plan,
//         downloadSpeed: { ...initialFormState.downloadSpeed, ...plan.downloadSpeed },
//         uploadSpeed: { ...initialFormState.uploadSpeed, ...plan.uploadSpeed },
//         expiry: { ...initialFormState.expiry, ...plan.expiry },
//         dataLimit: { ...initialFormState.dataLimit, ...plan.dataLimit },
//         usageLimit: { ...initialFormState.usageLimit, ...plan.usageLimit },
//         features: Array.isArray(plan.features) ? plan.features : [],
//         restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//         clientSessions: plan.clientSessions || {},
//       }));
//       setPlans(normalizedPlans);
//     } catch (error) {
//       console.error("Error loading plans:", error);
//       setPlans(deepClone(mockPlans));
//     }
//   }, []);

//   useEffect(() => {
//     if (plans.length > 0) {
//       try {
//         localStorage.setItem("isp-plans", JSON.stringify(plans));
//       } catch (error) {
//         console.error("Error saving plans:", error);
//         toast.error("Failed to save plans.");
//       }
//     }
//   }, [plans]);

//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   const validateAndSavePlan = () => {
//     const requiredFields = [
//       !form.planType && "Plan Type",
//       !form.name && "Plan Name",
//       !form.category && "Category",
//       form.planType === "Paid" && (!form.price || form.price === "") && "Price",
//       !form.downloadSpeed.value && "Download Speed",
//       !form.uploadSpeed.value && "Upload Speed",
//       !form.expiry.value && "Expiry Duration",
//       !form.dataLimit.value && "Data Limit",
//       !form.usageLimit.value && "Usage Limit",
//       !form.description && "Description",
//     ].filter(Boolean);

//     if (requiredFields.length > 0) {
//       toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
//       return;
//     }

//     if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
//       toast.error("Price must be a positive number for paid plans.");
//       return;
//     }

//     if (
//       parseFloat(form.downloadSpeed.value) <= 0 ||
//       parseFloat(form.uploadSpeed.value) <= 0 ||
//       parseInt(form.expiry.value) <= 0
//     ) {
//       toast.error("Speed and expiry values must be positive.");
//       return;
//     }

//     if (
//       form.usageLimit.unit === "Hours" &&
//       form.expiry.unit === "Days" &&
//       parseInt(form.usageLimit.value) > parseInt(form.expiry.value) * 24
//     ) {
//       toast.warn(
//         `Usage Limit (${form.usageLimit.value} hours) exceeds Expiry (${form.expiry.value} days × 24 = ${
//           form.expiry.value * 24
//         } hours). Adjust one or both.`
//       );
//     }

//     const planData = {
//       ...form,
//       id: editingPlan ? editingPlan.id : Date.now(),
//       price: parseFloat(form.price) || 0,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       clientSessions: editingPlan ? editingPlan.clientSessions : {},
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       features: Array.isArray(form.features) ? form.features : [],
//       restrictions: Array.isArray(form.restrictions) ? form.restrictions : [],
//     };

//     setPlans((prev) =>
//       editingPlan ? prev.map((p) => (p.id === planData.id ? planData : p)) : [...prev, planData]
//     );
//     toast.success(`${editingPlan ? "Updated" : "Created"} plan: ${planData.name}`);
//     setForm(deepClone(initialFormState));
//     setEditingPlan(null);
//     setViewMode("list");
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
//     setSortConfig({
//       key,
//       direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
//     });
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star
//             key={i}
//             className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
//           />
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

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => ({ ...prev, features: [...prev.features, newFeature] }));
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => ({ ...prev, restrictions: [...prev.restrictions, newRestriction] }));
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => ({ ...prev, [list]: prev[list].filter((i) => i !== item) }));
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
//         <motion.button
//           onClick={() => {
//             setForm(deepClone(initialFormState));
//             setEditingPlan(null);
//             setViewMode("form");
//           }}
//           className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <Plus className="w-5 h-5 mr-2" /> New Plan
//         </motion.button>
//       </div>

//       <div className="flex gap-4">
//         <select
//           value={filterCategory}
//           onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>
//         <input
//           type="text"
//           placeholder="Search plans..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex-1 bg-white"
//         />
//       </div>

//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-100">
//             <tr>
//               {[
//                 { key: "name", label: "Name" },
//                 { key: "planType", label: "Type" },
//                 { key: "category", label: "Category" },
//                 { key: "price", label: "Price" },
//                 { key: "purchases", label: "Subscribers" },
//                 { key: "actions", label: "Actions" },
//               ].map((column) => (
//                 <th
//                   key={column.key}
//                   onClick={() => column.key !== "actions" && requestSort(column.key)}
//                   className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${
//                     column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""
//                   }`}
//                 >
//                   <div className="flex items-center">
//                     {column.label}
//                     {sortConfig.key === column.key && (
//                       sortConfig.direction === "asc" ? (
//                         <ChevronUp className="ml-1 w-4 h-4" />
//                       ) : (
//                         <ChevronDown className="ml-1 w-4 h-4" />
//                       )
//                     )}
//                   </div>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sortedPlans.map((plan) => (
//               <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     {getCategoryIcon(plan.category)}
//                     <span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                   {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div className="flex items-center">
//                     <Users className="w-4 h-4 text-gray-400 mr-2" />
//                     {plan.purchases} {renderStars(plan.purchases)}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                   <div className="flex space-x-4">
//                     <motion.button
//                       onClick={() => {
//                         setSelectedPlan(deepClone(plan));
//                         setViewMode("details");
//                       }}
//                       className="focus:outline-none"
//                       whileHover={{ scale: 1.2 }}
//                       transition={{ type: "spring", stiffness: 300 }}
//                     >
//                       <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
//                     </motion.button>
//                     <motion.button
//                       onClick={() => {
//                         setForm(deepClone(plan));
//                         setEditingPlan(deepClone(plan));
//                         setViewMode("form");
//                       }}
//                       className="focus:outline-none"
//                       whileHover={{ rotate: 90 }}
//                       transition={{ type: "spring", stiffness: 300 }}
//                     >
//                       <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
//                     </motion.button>
//                     <motion.button
//                       onClick={() => {
//                         const copiedPlan = {
//                           ...deepClone(plan),
//                           name: `Copy of ${plan.name}`,
//                           id: Date.now(),
//                           purchases: 0,
//                           clientSessions: {},
//                           createdAt: new Date().toISOString().split("T")[0],
//                         };
//                         setForm(copiedPlan);
//                         setEditingPlan(null);
//                         setViewMode("form");
//                       }}
//                       className="focus:outline-none"
//                       animate={{ scale: [1, 1.1, 1] }}
//                       transition={{ repeat: Infinity, duration: 1.5 }}
//                     >
//                       <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
//                     </motion.button>
//                     <motion.button
//                       onClick={() => {
//                         if (window.confirm(`Delete "${plan.name}"?`)) {
//                           setPlans((prev) => prev.filter((p) => p.id !== plan.id));
//                           if (selectedPlan && selectedPlan.id === plan.id) {
//                             setSelectedPlan(null);
//                             setViewMode("list");
//                           }
//                           toast.success(`Deleted plan: ${plan.name}`);
//                         }
//                       }}
//                       className="focus:outline-none"
//                       whileHover={{ x: [0, -2, 2, -2, 0] }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
//                     </motion.button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   const renderPlanForm = () => (
//     <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
//           {editingPlan ? "Edit Plan" : "New Plan"}
//         </h2>
//         <motion.button
//           onClick={() => {
//             setViewMode("list");
//             setForm(deepClone(initialFormState));
//             setEditingPlan(null);
//           }}
//           className="p-2 text-gray-500 hover:text-gray-700"
//           whileHover={{ rotate: 90 }}
//         >
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       <div className="space-y-8">
//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Plan Type <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Paid or Free Trial
//                   </span>
//                 </label>
//                 <select
//                   name="planType"
//                   value={form.planType || ""}
//                   onChange={handleChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Plan Type
//                   </option>
//                   {planTypes.map((type) => (
//                     <option key={type} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Name <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Unique plan identifier
//                   </span>
//                 </label>
//                 <input
//                   name="name"
//                   value={form.name || ""}
//                   onChange={handleChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   placeholder="e.g., Rural Wi-Fi Pro"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Category <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Target user group
//                   </span>
//                 </label>
//                 <select
//                   name="category"
//                   value={form.category || ""}
//                   onChange={handleChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Category
//                   </option>
//                   {categories.map((cat) => (
//                     <option key={cat} value={cat}>
//                       {cat}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={form.price || ""}
//                   onChange={handleChange}
//                   disabled={form.planType !== "Paid"}
//                   className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
//                     form.planType !== "Paid"
//                       ? "bg-gray-100 cursor-not-allowed"
//                       : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"
//                   }`}
//                   placeholder="e.g., 29.99"
//                   step="0.01"
//                   min="0"
//                   required={form.planType === "Paid"}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center">
//               <label className="block text-sm font-medium text-gray-700 mr-4">
//                 Active
//                 <span className="ml-2 text-xs text-gray-500 flex items-center">
//                   <Info className="w-3 h-3 mr-1" /> Enable or disable plan
//                 </span>
//               </label>
//               <div
//                 onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     form.active ? "translate-x-6" : "translate-x-1"
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Download Speed <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.downloadSpeed?.value || ""}
//                   onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   min="0"
//                   placeholder="e.g., 10"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Speed measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.downloadSpeed?.unit || "Mbps"}
//                   onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {speedUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Upload Speed <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.uploadSpeed?.value || ""}
//                   onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   min="0"
//                   placeholder="e.g., 2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Speed measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.uploadSpeed?.unit || "Mbps"}
//                   onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {speedUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Expiry <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.expiry?.value || ""}
//                   onChange={(e) => handleNestedChange("expiry", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   min="1"
//                   placeholder="e.g., 30"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Duration type
//                   </span>
//                 </label>
//                 <select
//                   value={form.expiry?.unit || "Days"}
//                   onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {expiryUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Data Limit <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB)
//                   </span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.dataLimit?.value || ""}
//                   onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   placeholder="e.g., 100 or Unlimited"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Data measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.dataLimit?.unit || "GB"}
//                   onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {dataUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Usage Limit <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours)
//                   </span>
//                 </label>
//                 <div className="mt-1 flex items-center">
//                   <input
//                     type="text"
//                     value={form.usageLimit?.value || ""}
//                     onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                     placeholder="e.g., 240 or Unlimited"
//                     required
//                   />
//                   <motion.button
//                     onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)}
//                     className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none"
//                     whileHover={{ scale: 1.05 }}
//                   >
//                     <Timer className="w-5 h-5" />
//                   </motion.button>
//                 </div>
//                 <AnimatePresence>
//                   {isUsageMenuOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -10 }}
//                       className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
//                     >
//                       {usageLimitPresets.map((preset) => (
//                         <div
//                           key={preset.hours}
//                           onClick={() => handleUsagePresetSelect(preset.hours)}
//                           className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors"
//                         >
//                           {preset.icon}
//                           <div className="ml-2">
//                             <p className="text-sm font-medium text-gray-900">
//                               {preset.hours} Hours ({preset.days} Days)
//                             </p>
//                             <p className="text-xs text-gray-500">{preset.description}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Time measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.usageLimit?.unit || "Hours"}
//                   onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {usageUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
//           <div className="text-xs text-gray-500 flex items-center mb-2">
//             <Info className="w-3 h-3 mr-1" /> Detailed plan info for users
//           </div>
//           <MDEditor
//             value={form.description || ""}
//             onChange={(value) => setForm((prev) => ({ ...prev, description: value || "" }))}
//             preview="edit"
//             height={200}
//             className="shadow-sm"
//           />
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Features
//                 <span className="ml-2 text-xs text-gray-500 flex items-center">
//                   <Info className="w-3 h-3 mr-1" /> Benefits included in the plan
//                 </span>
//               </label>
//               <div className="mt-1 flex gap-3">
//                 <select
//                   value={newFeature}
//                   onChange={(e) => setNewFeature(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   <option value="">Select a feature</option>
//                   {featuresOptions.map((feature) => (
//                     <option key={feature} value={feature}>
//                       {feature}
//                     </option>
//                   ))}
//                 </select>
//                 <motion.button
//                   onClick={addFeature}
//                   className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Add
//                 </motion.button>
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {(form.features || []).map((feature) => (
//                   <li
//                     key={feature}
//                     className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm"
//                   >
//                     {feature}
//                     <motion.button
//                       onClick={() => removeListItem("features", feature)}
//                       className="text-red-600 hover:text-red-800"
//                       whileHover={{ scale: 1.2 }}
//                     >
//                       <X className="w-4 h-4" />
//                     </motion.button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Restrictions
//                 <span className="ml-2 text-xs text-gray-500 flex items-center">
//                   <Info className="w-3 h-3 mr-1" /> Limitations or conditions
//                 </span>
//               </label>
//               <div className="mt-1 flex gap-3">
//                 <select
//                   value={newRestriction}
//                   onChange={(e) => setNewRestriction(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   <option value="">Select a restriction</option>
//                   {restrictionsOptions.map((restriction) => (
//                     <option key={restriction} value={restriction}>
//                       {restriction}
//                     </option>
//                   ))}
//                 </select>
//                 <motion.button
//                   onClick={addRestriction}
//                   className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Add
//                 </motion.button>
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {(form.restrictions || []).map((restriction) => (
//                   <li
//                     key={restriction}
//                     className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm"
//                   >
//                     {restriction}
//                     <motion.button
//                       onClick={() => removeListItem("restrictions", restriction)}
//                       className="text-red-600 hover:text-red-800"
//                       whileHover={{ scale: 1.2 }}
//                     >
//                       <X className="w-4 h-4" />
//                     </motion.button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <motion.button
//             onClick={validateAndSavePlan}
//             className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Save className="w-5 h-5 mr-2" /> Save Plan
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => {
//     if (!selectedPlan) {
//       setViewMode("list");
//       return null;
//     }

//     return (
//       <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           className="max-w-4xl mx-auto"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
//               {selectedPlan.name || "Unnamed Plan"}
//             </h2>
//             <motion.button
//               onClick={() => {
//                 setSelectedPlan(null);
//                 setViewMode("list");
//               }}
//               className="p-2 text-gray-500 hover:text-gray-700"
//               whileHover={{ rotate: 90 }}
//             >
//               <X className="w-8 h-8" />
//             </motion.button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Zap className="w-6 h-6 text-teal-600 mr-2" /> Overview
//               </h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Price:</span>{" "}
//                   {selectedPlan.planType === "Paid" ? (
//                     <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span>
//                   ) : (
//                     <span className="text-green-600 font-semibold">Free</span>
//                   )}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Status:</span>{" "}
//                   <span
//                     className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
//                       selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {selectedPlan.active ? "Active" : "Inactive"}
//                   </span>
//                 </p>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications
//               </h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700">
//                   <Download className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Download:</span>{" "}
//                   {selectedPlan.downloadSpeed?.value || "N/A"} {selectedPlan.downloadSpeed?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Upload className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Upload:</span>{" "}
//                   {selectedPlan.uploadSpeed?.value || "N/A"} {selectedPlan.uploadSpeed?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Calendar className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Expiry:</span>{" "}
//                   {selectedPlan.expiry?.value || "N/A"} {selectedPlan.expiry?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Shield className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Data Limit:</span>{" "}
//                   {selectedPlan.dataLimit?.value || "N/A"} {selectedPlan.dataLimit?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Clock className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Usage Limit:</span>{" "}
//                   {selectedPlan.usageLimit?.value || "N/A"} {selectedPlan.usageLimit?.unit || ""}
//                   {selectedPlan.usageLimit?.unit === "Hours" && selectedPlan.usageLimit?.value && (
//                     <span className="text-xs text-gray-500 ml-2">
//                       (~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Gift className="w-6 h-6 text-teal-600 mr-2" /> Description
//               </h3>
//               <div className="prose prose-sm text-gray-700">
//                 <MDEditor.Markdown source={selectedPlan.description || "No description available"} />
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <Star className="w-6 h-6 text-teal-600 mr-2" /> Features
//                   </h3>
//                   <ul className="space-y-2">
//                     {(selectedPlan.features || []).length > 0 ? (
//                       selectedPlan.features.map((feature) => (
//                         <li key={feature} className="text-gray-700 flex items-center">
//                           <Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}
//                         </li>
//                       ))
//                     ) : (
//                       <li className="text-gray-500 italic">None</li>
//                     )}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions
//                   </h3>
//                   <ul className="space-y-2">
//                     {(selectedPlan.restrictions || []).length > 0 ? (
//                       selectedPlan.restrictions.map((restriction) => (
//                         <li key={restriction} className="text-gray-700 flex items-center">
//                           <Shield className="w-4 h-4 text-teal-600 mr-2" /> {restriction}
//                         </li>
//                       ))
//                     ) : (
//                       <li className="text-gray-500 italic">None</li>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.5 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Users className="w-6 h-6 text-teal-600 mr-2" /> Stats
//               </h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Subscribers:</span>{" "}
//                   {selectedPlan.purchases || 0} {renderStars(selectedPlan.purchases)}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Created At:</span>{" "}
//                   {selectedPlan.createdAt
//                     ? new Date(selectedPlan.createdAt).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })
//                     : "N/A"}
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && (
//           <motion.div
//             key="list"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             {renderPlanList()}
//           </motion.div>
//         )}
//         {viewMode === "form" && (
//           <motion.div
//             key="form"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             {renderPlanForm()}
//           </motion.div>
//         )}
//         {viewMode === "details" && (
//           <motion.div
//             key="details"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             {renderPlanDetails()}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;







// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Copy,
//   Eye,
//   ChevronDown,
//   ChevronUp,
//   X,
//   Gift,
//   Wifi,
//   Star,
//   Home,
//   Briefcase,
//   Server,
//   Users,
//   Download,
//   Upload,
//   Calendar,
//   Zap,
//   Shield,
//   Clock,
//   Save,
//   Info,
//   Timer,
// } from "lucide-react";
// import { FaSpinner } from "react-icons/fa";
// import MDEditor from "@uiw/react-md-editor";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import api from "../../../api"

// // Custom Hook for Form Management
// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// // Helper Functions
// const formatNumber = (value, decimals = 2) => {
//   const num = typeof value === "number" ? value : parseFloat(value) || 0;
//   return num.toLocaleString(undefined, {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals,
//   });
// };

// const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

// const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// const initialFormState = {
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
//   clientSessions: {},
// };

// // Options
// const speedUnits = ["Kbps", "Mbps", "Gbps"];
// const expiryUnits = ["Days", "Months"];
// const dataUnits = ["GB", "TB", "Unlimited"];
// const usageUnits = ["Hours", "Unlimited"];
// const categories = ["Residential", "Business", "Promotional", "Enterprise"];
// const planTypes = ["Paid", "Free Trial"];
// const featuresOptions = [
//   "Portable Router",
//   "Multi-User Support",
//   "Extended Range",
//   "Solar-Powered Option",
//   "24/7 Support",
//   "Low Latency",
//   "Prepaid Access",
// ];
// const restrictionsOptions = [
//   "Resale Only in Designated Area",
//   "No Refunds After Activation",
//   "Max 20 Users per Plan",
//   "Rural Use Only",
//   "Requires Signal Booster",
// ];

// // Usage Limit Presets with Descriptions
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
//   const [isFetching, setIsFetching] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);

//   // Fetch plans from backend
//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const normalizedPlans = response.data.map((plan) => ({
//           ...initialFormState,
//           ...plan,
//           planType: plan.planType || plan.plan_type,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           clientSessions: plan.clientSessions || {},
//           createdAt: plan.createdAt || plan.created_at,
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

//   // Adjust price for Free Trial
//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   // Save or update plan
//   const validateAndSavePlan = async () => {
//     const requiredFields = [
//       !form.planType && "Plan Type",
//       !form.name && "Plan Name",
//       !form.category && "Category",
//       form.planType === "Paid" && (!form.price || form.price === "") && "Price",
//       !form.downloadSpeed.value && "Download Speed",
//       !form.uploadSpeed.value && "Upload Speed",
//       !form.expiry.value && "Expiry Duration",
//       !form.dataLimit.value && "Data Limit",
//       !form.usageLimit.value && "Usage Limit",
//       !form.description && "Description",
//     ].filter(Boolean);

//     if (requiredFields.length > 0) {
//       toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
//       return;
//     }

//     if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
//       toast.error("Price must be a positive number for paid plans.");
//       return;
//     }

//     if (
//       parseFloat(form.downloadSpeed.value) <= 0 ||
//       parseFloat(form.uploadSpeed.value) <= 0 ||
//       parseInt(form.expiry.value) <= 0
//     ) {
//       toast.error("Speed and expiry values must be positive.");
//       return;
//     }

//     if (
//       form.usageLimit.unit === "Hours" &&
//       form.expiry.unit === "Days" &&
//       parseInt(form.usageLimit.value) > parseInt(form.expiry.value) * 24
//     ) {
//       toast.warn(
//         `Usage Limit (${form.usageLimit.value} hours) exceeds Expiry (${form.expiry.value} days × 24 = ${
//           form.expiry.value * 24
//         } hours). Adjust one or both.`
//       );
//     }

//     const planData = {
//       ...form,
//       price: parseFloat(form.price) || 0,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       clientSessions: editingPlan ? editingPlan.clientSessions : {},
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       features: Array.isArray(form.features) ? form.features : [],
//       restrictions: Array.isArray(form.restrictions) ? form.restrictions : [],
//     };

//     try {
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? response.data : p)));
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
//       console.error("Error saving plan:", error);
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${error.response?.data?.detail || error.message}`);
//     }
//   };

//   // Delete plan
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
//     setSortConfig({
//       key,
//       direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
//     });
//   };

//   const renderStars = (purchases) => {
//     const rating = calculateRating(purchases);
//     return (
//       <div className="flex items-center">
//         {[...Array(5)].map((_, i) => (
//           <Star
//             key={i}
//             className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
//           />
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

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => ({ ...prev, features: [...prev.features, newFeature] }));
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => ({ ...prev, restrictions: [...prev.restrictions, newRestriction] }));
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => ({ ...prev, [list]: prev[list].filter((i) => i !== item) }));
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
//         <motion.button
//           onClick={() => {
//             setForm(deepClone(initialFormState));
//             setEditingPlan(null);
//             setViewMode("form");
//           }}
//           className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <Plus className="w-5 h-5 mr-2" /> New Plan
//         </motion.button>
//       </div>

//       <div className="flex gap-4">
//         <select
//           value={filterCategory}
//           onChange={(e) => setFilterCategory(e.target.value)}
//           className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
//         >
//           <option value="All">All Categories</option>
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>
//         <input
//           type="text"
//           placeholder="Search plans..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
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
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
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
//                   { key: "name", label: "Name" },
//                   { key: "planType", label: "Type" },
//                   { key: "category", label: "Category" },
//                   { key: "price", label: "Price" },
//                   { key: "purchases", label: "Subscribers" },
//                   { key: "actions", label: "Actions" },
//                 ].map((column) => (
//                   <th
//                     key={column.key}
//                     onClick={() => column.key !== "actions" && requestSort(column.key)}
//                     className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${
//                       column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       {column.label}
//                       {sortConfig.key === column.key && (
//                         sortConfig.direction === "asc" ? (
//                           <ChevronUp className="ml-1 w-4 h-4" />
//                         ) : (
//                           <ChevronDown className="ml-1 w-4 h-4" />
//                         )
//                       )}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {sortedPlans.map((plan) => (
//                 <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       {getCategoryIcon(plan.category)}
//                       <span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                     {plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <Users className="w-4 h-4 text-gray-400 mr-2" />
//                       {plan.purchases} {renderStars(plan.purchases)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-4">
//                       <motion.button
//                         onClick={() => {
//                           setSelectedPlan(deepClone(plan));
//                           setViewMode("details");
//                         }}
//                         className="focus:outline-none"
//                         whileHover={{ scale: 1.2 }}
//                         transition={{ type: "spring", stiffness: 300 }}
//                       >
//                         <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           setForm(deepClone(plan));
//                           setEditingPlan(deepClone(plan));
//                           setViewMode("form");
//                         }}
//                         className="focus:outline-none"
//                         whileHover={{ rotate: 90 }}
//                         transition={{ type: "spring", stiffness: 300 }}
//                       >
//                         <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => {
//                           const copiedPlan = {
//                             ...deepClone(plan),
//                             name: `Copy of ${plan.name}`,
//                             id: null,
//                             purchases: 0,
//                             clientSessions: {},
//                             createdAt: new Date().toISOString().split("T")[0],
//                           };
//                           setForm(copiedPlan);
//                           setEditingPlan(null);
//                           setViewMode("form");
//                         }}
//                         className="focus:outline-none"
//                         animate={{ scale: [1, 1.1, 1] }}
//                         transition={{ repeat: Infinity, duration: 1.5 }}
//                       >
//                         <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
//                       </motion.button>
//                       <motion.button
//                         onClick={() => deletePlan(plan.id, plan.name)}
//                         className="focus:outline-none"
//                         whileHover={{ x: [0, -2, 2, -2, 0] }}
//                         transition={{ duration: 0.3 }}
//                       >
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
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
//           {editingPlan ? "Edit Plan" : "New Plan"}
//         </h2>
//         <motion.button
//           onClick={() => {
//             setViewMode("list");
//             setForm(deepClone(initialFormState));
//             setEditingPlan(null);
//           }}
//           className="p-2 text-gray-500 hover:text-gray-700"
//           whileHover={{ rotate: 90 }}
//         >
//           <X className="w-6 h-6" />
//         </motion.button>
//       </div>

//       <div className="space-y-8">
//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Plan Type <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Paid or Free Trial
//                   </span>
//                 </label>
//                 <select
//                   name="planType"
//                   value={form.planType || ""}
//                   onChange={handleChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Plan Type
//                   </option>
//                   {planTypes.map((type) => (
//                     <option key={type} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Name <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Unique plan identifier
//                   </span>
//                 </label>
//                 <input
//                   name="name"
//                   value={form.name || ""}
//                   onChange={handleChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   placeholder="e.g., Rural Wi-Fi Pro"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Category <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Target user group
//                   </span>
//                 </label>
//                 <select
//                   name="category"
//                   value={form.category || ""}
//                   onChange={handleChange}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   required
//                 >
//                   <option value="" disabled>
//                     Select Category
//                   </option>
//                   {categories.map((cat) => (
//                     <option key={cat} value={cat}>
//                       {cat}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={form.price || ""}
//                   onChange={handleChange}
//                   disabled={form.planType !== "Paid"}
//                   className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
//                     form.planType !== "Paid"
//                       ? "bg-gray-100 cursor-not-allowed"
//                       : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"
//                   }`}
//                   placeholder="e.g., 29.99"
//                   step="0.01"
//                   min="0"
//                   required={form.planType === "Paid"}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center">
//               <label className="block text-sm font-medium text-gray-700 mr-4">
//                 Active
//                 <span className="ml-2 text-xs text-gray-500 flex items-center">
//                   <Info className="w-3 h-3 mr-1" /> Enable or disable plan
//                 </span>
//               </label>
//               <div
//                 onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
//                 className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
//                   form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
//                     form.active ? "translate-x-6" : "translate-x-1"
//                   }`}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Download Speed <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.downloadSpeed?.value || ""}
//                   onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   min="0"
//                   placeholder="e.g., 10"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Speed measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.downloadSpeed?.unit || "Mbps"}
//                   onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {speedUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Upload Speed <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.uploadSpeed?.value || ""}
//                   onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   min="0"
//                   placeholder="e.g., 2"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Speed measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.uploadSpeed?.unit || "Mbps"}
//                   onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {speedUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Expiry <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)
//                   </span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.expiry?.value || ""}
//                   onChange={(e) => handleNestedChange("expiry", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   min="1"
//                   placeholder="e.g., 30"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Duration type
//                   </span>
//                 </label>
//                 <select
//                   value={form.expiry?.unit || "Days"}
//                   onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {expiryUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Data Limit <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB)
//                   </span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.dataLimit?.value || ""}
//                   onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                   placeholder="e.g., 100 or Unlimited"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Data measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.dataLimit?.unit || "GB"}
//                   onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {dataUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Usage Limit <span className="text-red-500">*</span>
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours)
//                   </span>
//                 </label>
//                 <div className="mt-1 flex items-center">
//                   <input
//                     type="text"
//                     value={form.usageLimit?.value || ""}
//                     onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                     placeholder="e.g., 240 or Unlimited"
//                     required
//                   />
//                   <motion.button
//                     onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)}
//                     className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none"
//                     whileHover={{ scale: 1.05 }}
//                   >
//                     <Timer className="w-5 h-5" />
//                   </motion.button>
//                 </div>
//                 <AnimatePresence>
//                   {isUsageMenuOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -10 }}
//                       className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
//                     >
//                       {usageLimitPresets.map((preset) => (
//                         <div
//                           key={preset.hours}
//                           onClick={() => handleUsagePresetSelect(preset.hours)}
//                           className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors"
//                         >
//                           {preset.icon}
//                           <div className="ml-2">
//                             <p className="text-sm font-medium text-gray-900">
//                               {preset.hours} Hours ({preset.days} Days)
//                             </p>
//                             <p className="text-xs text-gray-500">{preset.description}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Unit
//                   <span className="ml-2 text-xs text-gray-500 flex items-center">
//                     <Info className="w-3 h-3 mr-1" /> Time measurement
//                   </span>
//                 </label>
//                 <select
//                   value={form.usageLimit?.unit || "Hours"}
//                   onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)}
//                   className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   {usageUnits.map((unit) => (
//                     <option key={unit} value={unit}>
//                       {unit}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
//           <div className="text-xs text-gray-500 flex items-center mb-2">
//             <Info className="w-3 h-3 mr-1" /> Detailed plan info for users
//           </div>
//           <MDEditor
//             value={form.description || ""}
//             onChange={(value) => setForm((prev) => ({ ...prev, description: value || "" }))}
//             preview="edit"
//             height={200}
//             className="shadow-sm"
//           />
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Features
//                 <span className="ml-2 text-xs text-gray-500 flex items-center">
//                   <Info className="w-3 h-3 mr-1" /> Benefits included in the plan
//                 </span>
//               </label>
//               <div className="mt-1 flex gap-3">
//                 <select
//                   value={newFeature}
//                   onChange={(e) => setNewFeature(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   <option value="">Select a feature</option>
//                   {featuresOptions.map((feature) => (
//                     <option key={feature} value={feature}>
//                       {feature}
//                     </option>
//                   ))}
//                 </select>
//                 <motion.button
//                   onClick={addFeature}
//                   className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Add
//                 </motion.button>
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {(form.features || []).map((feature) => (
//                   <li
//                     key={feature}
//                     className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm"
//                   >
//                     {feature}
//                     <motion.button
//                       onClick={() => removeListItem("features", feature)}
//                       className="text-red-600 hover:text-red-800"
//                       whileHover={{ scale: 1.2 }}
//                     >
//                       <X className="w-4 h-4" />
//                     </motion.button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Restrictions
//                 <span className="ml-2 text-xs text-gray-500 flex items-center">
//                   <Info className="w-3 h-3 mr-1" /> Limitations or conditions
//                 </span>
//               </label>
//               <div className="mt-1 flex gap-3">
//                 <select
//                   value={newRestriction}
//                   onChange={(e) => setNewRestriction(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm"
//                 >
//                   <option value="">Select a restriction</option>
//                   {restrictionsOptions.map((restriction) => (
//                     <option key={restriction} value={restriction}>
//                       {restriction}
//                     </option>
//                   ))}
//                 </select>
//                 <motion.button
//                   onClick={addRestriction}
//                   className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   Add
//                 </motion.button>
//               </div>
//               <ul className="mt-3 space-y-2">
//                 {(form.restrictions || []).map((restriction) => (
//                   <li
//                     key={restriction}
//                     className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm"
//                   >
//                     {restriction}
//                     <motion.button
//                       onClick={() => removeListItem("restrictions", restriction)}
//                       className="text-red-600 hover:text-red-800"
//                       whileHover={{ scale: 1.2 }}
//                     >
//                       <X className="w-4 h-4" />
//                     </motion.button>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <motion.button
//             onClick={validateAndSavePlan}
//             className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Save className="w-5 h-5 mr-2" /> Save Plan
//           </motion.button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPlanDetails = () => {
//     if (!selectedPlan) {
//       setViewMode("list");
//       return null;
//     }

//     return (
//       <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           className="max-w-4xl mx-auto"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
//               {selectedPlan.name || "Unnamed Plan"}
//             </h2>
//             <motion.button
//               onClick={() => {
//                 setSelectedPlan(null);
//                 setViewMode("list");
//               }}
//               className="p-2 text-gray-500 hover:text-gray-700"
//               whileHover={{ rotate: 90 }}
//             >
//               <X className="w-8 h-8" />
//             </motion.button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Zap className="w-6 h-6 text-teal-600 mr-2" /> Overview
//               </h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Price:</span>{" "}
//                   {selectedPlan.planType === "Paid" ? (
//                     <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span>
//                   ) : (
//                     <span className="text-green-600 font-semibold">Free</span>
//                   )}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Status:</span>{" "}
//                   <span
//                     className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
//                       selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {selectedPlan.active ? "Active" : "Inactive"}
//                   </span>
//                 </p>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications
//               </h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700">
//                   <Download className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Download:</span>{" "}
//                   {selectedPlan.downloadSpeed?.value || "N/A"} {selectedPlan.downloadSpeed?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Upload className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Upload:</span>{" "}
//                   {selectedPlan.uploadSpeed?.value || "N/A"} {selectedPlan.uploadSpeed?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Calendar className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Expiry:</span>{" "}
//                   {selectedPlan.expiry?.value || "N/A"} {selectedPlan.expiry?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Shield className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Data Limit:</span>{" "}
//                   {selectedPlan.dataLimit?.value || "N/A"} {selectedPlan.dataLimit?.unit || ""}
//                 </p>
//                 <p className="text-gray-700">
//                   <Clock className="w-4 h-4 inline mr-2 text-teal-600" />
//                   <span className="font-medium">Usage Limit:</span>{" "}
//                   {selectedPlan.usageLimit?.value || "N/A"} {selectedPlan.usageLimit?.unit || ""}
//                   {selectedPlan.usageLimit?.unit === "Hours" && selectedPlan.usageLimit?.value && (
//                     <span className="text-xs text-gray-500 ml-2">
//                       (~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Gift className="w-6 h-6 text-teal-600 mr-2" /> Description
//               </h3>
//               <div className="prose prose-sm text-gray-700">
//                 <MDEditor.Markdown source={selectedPlan.description || "No description available"} />
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <Star className="w-6 h-6 text-teal-600 mr-2" /> Features
//                   </h3>
//                   <ul className="space-y-2">
//                     {(selectedPlan.features || []).length > 0 ? (
//                       selectedPlan.features.map((feature) => (
//                         <li key={feature} className="text-gray-700 flex items-center">
//                           <Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}
//                         </li>
//                       ))
//                     ) : (
//                       <li className="text-gray-500 italic">None</li>
//                     )}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions
//                   </h3>
//                   <ul className="space-y-2">
//                     {(selectedPlan.restrictions || []).length > 0 ? (
//                       selectedPlan.restrictions.map((restriction) => (
//                         <li key={restriction} className="text-gray-700 flex items-center">
//                           <Shield className="w-4 h-4 text-teal-600 mr-2" /> {restriction}
//                         </li>
//                       ))
//                     ) : (
//                       <li className="text-gray-500 italic">None</li>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div
//               className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.5 }}
//             >
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                 <Users className="w-6 h-6 text-teal-600 mr-2" /> Stats
//               </h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Subscribers:</span>{" "}
//                   {selectedPlan.purchases || 0} {renderStars(selectedPlan.purchases)}
//                 </p>
//                 <p className="text-gray-700">
//                   <span className="font-medium text-gray-900">Created At:</span>{" "}
//                   {selectedPlan.createdAt
//                     ? new Date(selectedPlan.createdAt).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })
//                     : "N/A"}
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && (
//           <motion.div
//             key="list"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             {renderPlanList()}
//           </motion.div>
//         )}
//         {viewMode === "form" && (
//           <motion.div
//             key="form"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             {renderPlanForm()}
//           </motion.div>
//         )}
//         {viewMode === "details" && (
//           <motion.div
//             key="details"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             {renderPlanDetails()}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;







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
// import api from "../../../api";

// // Custom Hook for Form Management
// const useForm = (initialState) => {
//   const [form, setForm] = useState(initialState);
//   const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   const handleNestedChange = (field, key, value) =>
//     setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
//   return { form, setForm, handleChange, handleNestedChange };
// };

// // Helper Functions
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
//   client_sessions: {}, // Updated to snake_case to match backend
// };

// // Options
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

// // Usage Limit Presets
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
//   const [isFetching, setIsFetching] = useState(false);
//   const [viewMode, setViewMode] = useState("list");
//   const [editingPlan, setEditingPlan] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [newFeature, setNewFeature] = useState("");
//   const [newRestriction, setNewRestriction] = useState("");
//   const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);

//   // Fetch plans from backend
//   useEffect(() => {
//     const fetchPlans = async () => {
//       setIsFetching(true);
//       try {
//         const response = await api.get("/api/internet_plans/");
//         const plansData = response.data.results || response.data;
//         if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
//         const normalizedPlans = plansData.map((plan) => ({
//           ...initialFormState, ...plan, planType: plan.planType || plan.plan_type,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           client_sessions: plan.client_sessions || {},
//           createdAt: plan.createdAt || plan.created_at, id: plan.id,
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

//   // Adjust price for Free Trial
//   useEffect(() => {
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

//   // Save or update plan
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

//     if (
//       parseFloat(form.downloadSpeed.value) <= 0 ||
//       parseFloat(form.uploadSpeed.value) <= 0 ||
//       parseInt(form.expiry.value) <= 0
//     ) {
//       toast.error("Speed and expiry values must be positive.");
//       return;
//     }

//     if (
//       form.usageLimit.unit === "Hours" &&
//       form.expiry.unit === "Days" &&
//       parseInt(form.usageLimit.value) > parseInt(form.expiry.value) * 24
//     ) {
//       toast.warn(
//         `Usage Limit (${form.usageLimit.value} hours) exceeds Expiry (${form.expiry.value} days × 24 = ${
//           form.expiry.value * 24
//         } hours). Adjust one or both.`
//       );
//     }

//     const planData = {
//       ...form, price: parseFloat(form.price) || 0,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       features: Array.isArray(form.features) ? form.features : [],
//       restrictions: Array.isArray(form.restrictions) ? form.restrictions : [],
//     };

//     try {
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? response.data : p)));
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
//       console.error("Error saving plan:", error);
//       toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${error.response?.data?.error || error.message}`);
//     }
//   };

//   // Delete plan
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

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => ({ ...prev, features: [...prev.features, newFeature] }));
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => ({ ...prev, restrictions: [...prev.restrictions, newRestriction] }));
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => ({ ...prev, [list]: prev[list].filter((i) => i !== item) }));
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
//         <motion.button
//           onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
//           className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Plus className="w-5 h-5 mr-2" /> New Plan
//         </motion.button>
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
//                 <input type="number" value={form.downloadSpeed?.value || ""} onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" min="0" placeholder="e.g., 10" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                 <select value={form.downloadSpeed?.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
//                 <input type="number" value={form.uploadSpeed?.value || ""} onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" min="0" placeholder="e.g., 2" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
//                 <select value={form.uploadSpeed?.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
//                 <input type="number" value={form.expiry?.value || ""} onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" min="1" placeholder="e.g., 30" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration type</span></label>
//                 <select value={form.expiry?.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB)</span></label>
//                 <input type="text" value={form.dataLimit?.value || ""} onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 100 or Unlimited" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
//                 <select value={form.dataLimit?.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours)</span></label>
//                 <div className="mt-1 flex items-center">
//                   <input type="text" value={form.usageLimit?.value || ""} onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 240 or Unlimited" required />
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
//                 <select value={form.usageLimit?.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
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
//                 {(form.features || []).map((feature) => (
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
//                 {(form.restrictions || []).map((restriction) => (
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
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> {selectedPlan.planType === "Paid" ? <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span> : <span className="text-green-600 font-semibold">Free</span>}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>{selectedPlan.active ? "Active" : "Inactive"}</span></p>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><Download className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Download:</span> {selectedPlan.downloadSpeed?.value || "N/A"} {selectedPlan.downloadSpeed?.unit || ""}</p>
//                 <p className="text-gray-700"><Upload className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Upload:</span> {selectedPlan.uploadSpeed?.value || "N/A"} {selectedPlan.uploadSpeed?.unit || ""}</p>
//                 <p className="text-gray-700"><Calendar className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Expiry:</span> {selectedPlan.expiry?.value || "N/A"} {selectedPlan.expiry?.unit || ""}</p>
//                 <p className="text-gray-700"><Shield className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Data Limit:</span> {selectedPlan.dataLimit?.value || "N/A"} {selectedPlan.dataLimit?.unit || ""}</p>
//                 <p className="text-gray-700"><Clock className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Usage Limit:</span> {selectedPlan.usageLimit?.value || "N/A"} {selectedPlan.usageLimit?.unit || ""}
//                   {selectedPlan.usageLimit?.unit === "Hours" && selectedPlan.usageLimit?.value && <span className="text-xs text-gray-500 ml-2">(~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)</span>}
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
//                     {(selectedPlan.features || []).length > 0 ? selectedPlan.features.map((feature) => (
//                       <li key={feature} className="text-gray-700 flex items-center"><Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions</h3>
//                   <ul className="space-y-2">
//                     {(selectedPlan.restrictions || []).length > 0 ? selectedPlan.restrictions.map((restriction) => (
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

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPlanList()}</motion.div>}
//         {viewMode === "form" && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanForm()}</motion.div>}
//         {viewMode === "details" && <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanDetails()}</motion.div>}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;











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
// import api from "../../../api";

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
//   const [isFetching, setIsFetching] = useState(false);
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
//           ...initialFormState, ...plan, planType: plan.planType || plan.plan_type,
//           downloadSpeed: { value: plan.downloadSpeed?.value || "", unit: plan.downloadSpeed?.unit || "Mbps" },
//           uploadSpeed: { value: plan.uploadSpeed?.value || "", unit: plan.uploadSpeed?.unit || "Mbps" },
//           expiry: { value: plan.expiry?.value || "", unit: plan.expiry?.unit || "Days" },
//           dataLimit: { value: plan.dataLimit?.value || "", unit: plan.dataLimit?.unit || "GB" },
//           usageLimit: { value: plan.usageLimit?.value || "", unit: plan.usageLimit?.unit || "Hours" },
//           features: Array.isArray(plan.features) ? plan.features : [],
//           restrictions: Array.isArray(plan.restrictions) ? plan.restrictions : [],
//           client_sessions: plan.client_sessions || {},
//           createdAt: plan.createdAt || plan.created_at, id: plan.id,
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
//     if (form.planType === "Free Trial" && form.price !== "0") {
//       setForm((prev) => ({ ...prev, price: "0" }));
//     }
//   }, [form.planType]);

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

//     // Improved validation with specific error messages
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

//     console.log("Validated form data before submission:", form); // Debug log

//     const planData = {
//       ...form,
//       price: parseFloat(form.price) || 0,
//       purchases: editingPlan ? editingPlan.purchases : 0,
//       client_sessions: editingPlan ? editingPlan.client_sessions : {},
//       createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
//       features: Array.isArray(form.features) ? form.features : [],
//       restrictions: Array.isArray(form.restrictions) ? form.restrictions : [],
//     };

//     try {
//       console.log("Sending plan data:", JSON.stringify(planData, null, 2));
//       let response;
//       if (editingPlan) {
//         response = await api.put(`/api/internet_plans/${editingPlan.id}/`, planData);
//         setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? response.data : p)));
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

//   const addFeature = () => {
//     if (newFeature && !form.features.includes(newFeature)) {
//       setForm((prev) => ({ ...prev, features: [...prev.features, newFeature] }));
//       setNewFeature("");
//     }
//   };

//   const addRestriction = () => {
//     if (newRestriction && !form.restrictions.includes(newRestriction)) {
//       setForm((prev) => ({ ...prev, restrictions: [...prev.restrictions, newRestriction] }));
//       setNewRestriction("");
//     }
//   };

//   const removeListItem = (list, item) => {
//     setForm((prev) => ({ ...prev, [list]: prev[list].filter((i) => i !== item) }));
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
//         <motion.button
//           onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
//           className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//         >
//           <Plus className="w-5 h-5 mr-2" /> New Plan
//         </motion.button>
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
//                   value={form.downloadSpeed?.value || ""} 
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
//                 <select value={form.downloadSpeed?.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
//                 <input 
//                   type="number" 
//                   value={form.uploadSpeed?.value || ""} 
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
//                 <select value={form.uploadSpeed?.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
//                 <input 
//                   type="number" 
//                   value={form.expiry?.value || ""} 
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
//                 <select value={form.expiry?.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB)</span></label>
//                 <input type="text" value={form.dataLimit?.value || ""} onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 100 or Unlimited" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
//                 <select value={form.dataLimit?.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
//                   {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
//                 </select>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               <div className="relative">
//                 <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours)</span></label>
//                 <div className="mt-1 flex items-center">
//                   <input type="text" value={form.usageLimit?.value || ""} onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 240 or Unlimited" required />
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
//                 <select value={form.usageLimit?.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
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
//                 {(form.features || []).map((feature) => (
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
//                 {(form.restrictions || []).map((restriction) => (
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
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> {selectedPlan.planType === "Paid" ? <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span> : <span className="text-green-600 font-semibold">Free</span>}</p>
//                 <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>{selectedPlan.active ? "Active" : "Inactive"}</span></p>
//               </div>
//             </motion.div>

//             <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications</h3>
//               <div className="space-y-3">
//                 <p className="text-gray-700"><Download className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Download:</span> {selectedPlan.downloadSpeed?.value || "N/A"} {selectedPlan.downloadSpeed?.unit || ""}</p>
//                 <p className="text-gray-700"><Upload className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Upload:</span> {selectedPlan.uploadSpeed?.value || "N/A"} {selectedPlan.uploadSpeed?.unit || ""}</p>
//                 <p className="text-gray-700"><Calendar className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Expiry:</span> {selectedPlan.expiry?.value || "N/A"} {selectedPlan.expiry?.unit || ""}</p>
//                 <p className="text-gray-700"><Shield className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Data Limit:</span> {selectedPlan.dataLimit?.value || "N/A"} {selectedPlan.dataLimit?.unit || ""}</p>
//                 <p className="text-gray-700"><Clock className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Usage Limit:</span> {selectedPlan.usageLimit?.value || "N/A"} {selectedPlan.usageLimit?.unit || ""}
//                   {selectedPlan.usageLimit?.unit === "Hours" && selectedPlan.usageLimit?.value && <span className="text-xs text-gray-500 ml-2">(~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)</span>}
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
//                     {(selectedPlan.features || []).length > 0 ? selectedPlan.features.map((feature) => (
//                       <li key={feature} className="text-gray-700 flex items-center"><Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}</li>
//                     )) : <li className="text-gray-500 italic">None</li>}
//                   </ul>
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions</h3>
//                   <ul className="space-y-2">
//                     {(selectedPlan.restrictions || []).length > 0 ? selectedPlan.restrictions.map((restriction) => (
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

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <AnimatePresence mode="wait">
//         {viewMode === "list" && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPlanList()}</motion.div>}
//         {viewMode === "form" && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanForm()}</motion.div>}
//         {viewMode === "details" && <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanDetails()}</motion.div>}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default CreatePlans;





import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Copy, Eye, ChevronDown, ChevronUp, X, Gift, Wifi, Star, Home, Briefcase,
  Server, Users, Download, Upload, Calendar, Zap, Shield, Clock, Save, Info, Timer,
} from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../api";

const useForm = (initialState) => {
  const [form, setForm] = useState(initialState);
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNestedChange = (field, key, value) =>
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
  return { form, setForm, handleChange, handleNestedChange };
};

const formatNumber = (value, decimals = 2) => {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const calculateRating = (purchases) => Math.min(5, Math.log10((purchases || 0) + 1) * 1.5);

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const initialFormState = {
  planType: "Paid", name: "", price: "", active: true,
  downloadSpeed: { value: "", unit: "Mbps" }, uploadSpeed: { value: "", unit: "Mbps" },
  expiry: { value: "", unit: "Days" }, dataLimit: { value: "", unit: "GB" },
  usageLimit: { value: "", unit: "Hours" }, description: "", category: "Residential",
  purchases: 0, features: [], restrictions: [], createdAt: new Date().toISOString().split("T")[0],
  client_sessions: {},
};

const speedUnits = ["Kbps", "Mbps", "Gbps"];
const expiryUnits = ["Days", "Months"];
const dataUnits = ["GB", "TB", "Unlimited"];
const usageUnits = ["Hours", "Unlimited"];
const categories = ["Residential", "Business", "Promotional", "Enterprise"];
const planTypes = ["Paid", "Free Trial"];
const featuresOptions = [
  "Portable Router", "Multi-User Support", "Extended Range", "Solar-Powered Option",
  "24/7 Support", "Low Latency", "Prepaid Access",
];
const restrictionsOptions = [
  "Resale Only in Designated Area", "No Refunds After Activation", "Max 20 Users per Plan",
  "Rural Use Only", "Requires Signal Booster",
];

const usageLimitPresets = [
  { hours: "168", days: "7", description: "Perfect for short trials or promotional offers.", icon: <Gift className="w-4 h-4 text-purple-600" /> },
  { hours: "240", days: "10", description: "Great for light residential use or testing.", icon: <Home className="w-4 h-4 text-teal-600" /> },
  { hours: "360", days: "15", description: "Ideal for small business or moderate use.", icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
  { hours: "720", days: "30", description: "Standard for monthly residential or enterprise plans.", icon: <Calendar className="w-4 h-4 text-indigo-600" /> },
  { hours: "1440", days: "60", description: "Extended duration for premium or heavy users.", icon: <Server className="w-4 h-4 text-blue-600" /> },
];

const CreatePlans = () => {
  const { form, setForm, handleChange, handleNestedChange } = useForm(initialFormState);
  const [plans, setPlans] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newRestriction, setNewRestriction] = useState("");
  const [isUsageMenuOpen, setIsUsageMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsFetching(true);
      try {
        const response = await api.get("/api/internet_plans/");
        const plansData = response.data.results || response.data;
        if (!Array.isArray(plansData)) throw new Error("Expected an array of plans");
        const normalizedPlans = plansData.map((plan) => ({
          ...initialFormState,
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
    if (form.planType === "Free Trial" && form.price !== "0") {
      setForm((prev) => ({ ...prev, price: "0" }));
    }
  }, [form.planType]);

  const addFeature = () => {
    if (newFeature && !form.features.includes(newFeature)) {
      console.log("Adding feature:", newFeature);
      setForm((prev) => {
        const updatedFeatures = [...prev.features, newFeature];
        console.log("Updated features:", updatedFeatures);
        return { ...prev, features: updatedFeatures };
      });
      setNewFeature("");
    }
  };

  const addRestriction = () => {
    if (newRestriction && !form.restrictions.includes(newRestriction)) {
      console.log("Adding restriction:", newRestriction);
      setForm((prev) => {
        const updatedRestrictions = [...prev.restrictions, newRestriction];
        console.log("Updated restrictions:", updatedRestrictions);
        return { ...prev, restrictions: updatedRestrictions };
      });
      setNewRestriction("");
    }
  };

  const removeListItem = (list, item) => {
    console.log(`Removing ${list} item:`, item);
    setForm((prev) => {
      const updatedList = prev[list].filter((i) => i !== item);
      console.log(`Updated ${list}:`, updatedList);
      return { ...prev, [list]: updatedList };
    });
  };

  const validateAndSavePlan = async () => {
    const requiredFields = [
      !form.planType && "Plan Type", !form.name && "Plan Name", !form.category && "Category",
      form.planType === "Paid" && (!form.price || form.price === "") && "Price",
      !form.downloadSpeed.value && "Download Speed", !form.uploadSpeed.value && "Upload Speed",
      !form.expiry.value && "Expiry Duration", !form.dataLimit.value && "Data Limit",
      !form.usageLimit.value && "Usage Limit", !form.description && "Description",
    ].filter(Boolean);

    if (requiredFields.length > 0) {
      toast.error(`Missing required fields: ${requiredFields.join(", ")}`);
      return;
    }

    if (form.planType === "Paid" && (parseFloat(form.price) <= 0 || isNaN(parseFloat(form.price)))) {
      toast.error("Price must be a positive number for paid plans.");
      return;
    }

    const downloadSpeed = parseFloat(form.downloadSpeed.value);
    const uploadSpeed = parseFloat(form.uploadSpeed.value);
    const expiry = parseInt(form.expiry.value, 10);

    if (isNaN(downloadSpeed) || downloadSpeed <= 0) {
      toast.error("Download speed must be a positive number.");
      return;
    }
    if (isNaN(uploadSpeed) || uploadSpeed <= 0) {
      toast.error("Upload speed must be a positive number.");
      return;
    }
    if (isNaN(expiry) || expiry <= 0) {
      toast.error("Expiry duration must be a positive integer.");
      return;
    }

    const planData = {
      planType: form.planType,
      name: form.name,
      price: parseFloat(form.price) || 0,
      active: form.active,
      downloadSpeed: form.downloadSpeed,
      uploadSpeed: form.uploadSpeed,
      expiry: form.expiry,
      dataLimit: form.dataLimit,
      usageLimit: form.usageLimit,
      description: form.description,
      category: form.category,
      purchases: editingPlan ? editingPlan.purchases : 0,
      features: form.features,
      restrictions: form.restrictions,
      createdAt: editingPlan ? editingPlan.createdAt : new Date().toISOString().split("T")[0],
      client_sessions: editingPlan ? editingPlan.client_sessions : {},
    };

    try {
      console.log("Sending plan data to API:", JSON.stringify(planData, null, 2));
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
      console.log("API response:", JSON.stringify(response.data, null, 2));
      setForm(deepClone(initialFormState));
      setEditingPlan(null);
      setViewMode("list");
    } catch (error) {
      console.error("Error saving plan:", error.response?.data || error.message);
      toast.error(`Failed to ${editingPlan ? "update" : "create"} plan: ${error.response?.data?.error || error.message}`);
    }
  };

  const deletePlan = async (planId, planName) => {
    if (window.confirm(`Delete "${planName}"?`)) {
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

  const sortedPlans = [...plans]
    .filter(
      (plan) =>
        (filterCategory === "All" || plan.category === filterCategory) &&
        (plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
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

  const requestSort = (key) => {
    setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc" });
  };

  const renderStars = (purchases) => {
    const rating = calculateRating(purchases);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`} />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Residential: <Home className="w-4 h-4 text-teal-600" />,
      Business: <Briefcase className="w-4 h-4 text-emerald-600" />,
      Promotional: <Gift className="w-4 h-4 text-purple-600" />,
      Enterprise: <Server className="w-4 h-4 text-indigo-600" />,
    };
    return icons[category] || null;
  };

  const handleUsagePresetSelect = (hours) => {
    handleNestedChange("usageLimit", "value", hours);
    handleNestedChange("usageLimit", "unit", "Hours");
    setIsUsageMenuOpen(false);
  };

  const renderPlanList = () => (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">ConnectSphere Packages</h2>
        <motion.button
          onClick={() => { setForm(deepClone(initialFormState)); setEditingPlan(null); setViewMode("form"); }}
          className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5 mr-2" /> New Plan
        </motion.button>
      </div>

      <div className="flex gap-4">
        <select
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input
          type="text" placeholder="Search plans..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 flex-1 bg-white"
        />
      </div>

      {isFetching ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Plans Available</h3>
          <p className="text-gray-600 mt-2">Create a new plan to get started!</p>
          <motion.button
            onClick={() => setViewMode("form")}
            className="mt-4 px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all"
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          >
            Create Plan
          </motion.button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  { key: "name", label: "Name" }, { key: "planType", label: "Type" },
                  { key: "category", label: "Category" }, { key: "price", label: "Price" },
                  { key: "purchases", label: "Subscribers" }, { key: "actions", label: "Actions" },
                ].map((column) => (
                  <th
                    key={column.key} onClick={() => column.key !== "actions" && requestSort(column.key)}
                    className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${column.key !== "actions" ? "cursor-pointer hover:text-teal-600" : ""}`}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {sortConfig.key === column.key && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">{getCategoryIcon(plan.category)}<span className="ml-2 text-sm font-medium text-gray-900">{plan.name}</span></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{plan.planType === "Paid" ? `Ksh ${formatNumber(plan.price)}` : "Free"}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><Users className="w-4 h-4 text-gray-400 mr-2" />{plan.purchases} {renderStars(plan.purchases)}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <motion.button onClick={() => { setSelectedPlan(deepClone(plan)); setViewMode("details"); }} className="focus:outline-none" whileHover={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Eye className="w-5 h-5 text-indigo-600 hover:text-indigo-800" />
                      </motion.button>
                      <motion.button onClick={() => { setForm(deepClone(plan)); setEditingPlan(deepClone(plan)); setViewMode("form"); }} className="focus:outline-none" whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Pencil className="w-5 h-5 text-emerald-600 hover:text-emerald-800" />
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          const copiedPlan = { ...deepClone(plan), name: `Copy of ${plan.name}`, id: null, purchases: 0, client_sessions: {}, createdAt: new Date().toISOString().split("T")[0] };
                          setForm(copiedPlan); setEditingPlan(null); setViewMode("form");
                        }}
                        className="focus:outline-none" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Copy className="w-5 h-5 text-orange-600 hover:text-orange-800" />
                      </motion.button>
                      <motion.button onClick={() => deletePlan(plan.id, plan.name)} className="focus:outline-none" whileHover={{ x: [0, -2, 2, -2, 0] }} transition={{ duration: 0.3 }}>
                        <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPlanForm = () => (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{editingPlan ? "Edit Plan" : "New Plan"}</h2>
        <motion.button onClick={() => { setViewMode("list"); setForm(deepClone(initialFormState)); setEditingPlan(null); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}>
          <X className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Type <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Paid or Free Trial</span></label>
                <select name="planType" value={form.planType || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
                  <option value="" disabled>Select Plan Type</option>
                  {planTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Unique plan identifier</span></label>
                <input name="name" value={form.name || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., Rural Wi-Fi Pro" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Target user group</span></label>
                <select name="category" value={form.category || ""} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" required>
                  <option value="" disabled>Select Category</option>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (Ksh) {form.planType === "Paid" && <span className="text-red-500">*</span>}<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Cost in Kenyan Shillings</span></label>
                <input
                  type="number" name="price" value={form.price || ""} onChange={handleChange} disabled={form.planType !== "Paid"}
                  className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${form.planType !== "Paid" ? "bg-gray-100 cursor-not-allowed" : "border-gray-200 focus:border-teal-500 bg-white shadow-sm"}`}
                  placeholder="e.g., 29.99" step="0.01" min="0" required={form.planType === "Paid"}
                />
              </div>
            </div>
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-4">Active<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Enable or disable plan</span></label>
              <div onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))} className={`relative inline-flex items-center h-6 w-11 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.active ? "bg-gradient-to-r from-teal-500 to-teal-600" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${form.active ? "translate-x-6" : "translate-x-1"}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Download Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max download rate (e.g., 10 Mbps)</span></label>
                <input 
                  type="number" 
                  value={form.downloadSpeed.value || ""} 
                  onChange={(e) => handleNestedChange("downloadSpeed", "value", e.target.value)} 
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
                  min="0.01" 
                  step="0.01" 
                  placeholder="e.g., 10" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
                <select value={form.downloadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("downloadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Speed <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max upload rate (e.g., 2 Mbps)</span></label>
                <input 
                  type="number" 
                  value={form.uploadSpeed.value || ""} 
                  onChange={(e) => handleNestedChange("uploadSpeed", "value", e.target.value)} 
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
                  min="0.01" 
                  step="0.01" 
                  placeholder="e.g., 2" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Speed measurement</span></label>
                <select value={form.uploadSpeed.unit || "Mbps"} onChange={(e) => handleNestedChange("uploadSpeed", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  {speedUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration plan is valid (e.g., 30 days)</span></label>
                <input 
                  type="number" 
                  value={form.expiry.value || ""} 
                  onChange={(e) => handleNestedChange("expiry", "value", e.target.value)} 
                  className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" 
                  min="1" 
                  step="1" 
                  placeholder="e.g., 30" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Duration type</span></label>
                <select value={form.expiry.unit || "Days"} onChange={(e) => handleNestedChange("expiry", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  {expiryUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max data allowance (e.g., 100 GB)</span></label>
                <input type="text" value={form.dataLimit.value || ""} onChange={(e) => handleNestedChange("dataLimit", "value", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 100 or Unlimited" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Data measurement</span></label>
                <select value={form.dataLimit.unit || "GB"} onChange={(e) => handleNestedChange("dataLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  {dataUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Usage Limit <span className="text-red-500">*</span><span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Max active time (e.g., 240 hours)</span></label>
                <div className="mt-1 flex items-center">
                  <input type="text" value={form.usageLimit.value || ""} onChange={(e) => handleNestedChange("usageLimit", "value", e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm" placeholder="e.g., 240 or Unlimited" required />
                  <motion.button onClick={() => setIsUsageMenuOpen(!isUsageMenuOpen)} className="px-3 py-2 bg-teal-600 text-white rounded-r-lg hover:bg-teal-700 focus:outline-none" whileHover={{ scale: 1.05 }}>
                    <Timer className="w-5 h-5" />
                  </motion.button>
                </div>
                <AnimatePresence>
                  {isUsageMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      {usageLimitPresets.map((preset) => (
                        <div key={preset.hours} onClick={() => handleUsagePresetSelect(preset.hours)} className="px-4 py-2 flex items-center cursor-pointer hover:bg-teal-50 transition-colors">
                          {preset.icon}
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900">{preset.hours} Hours ({preset.days} Days)</p>
                            <p className="text-xs text-gray-500">{preset.description}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Time measurement</span></label>
                <select value={form.usageLimit.unit || "Hours"} onChange={(e) => handleNestedChange("usageLimit", "unit", e.target.value)} className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  {usageUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
          <div className="text-xs text-gray-500 flex items-center mb-2"><Info className="w-3 h-3 mr-1" /> Detailed plan info for users</div>
          <MDEditor value={form.description || ""} onChange={(value) => setForm((prev) => ({ ...prev, description: value || "" }))} preview="edit" height={200} className="shadow-sm" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Restrictions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Features<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Benefits included in the plan</span></label>
              <div className="mt-1 flex gap-3">
                <select value={newFeature} onChange={(e) => setNewFeature(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  <option value="">Select a feature</option>
                  {featuresOptions.map((feature) => <option key={feature} value={feature}>{feature}</option>)}
                </select>
                <motion.button onClick={addFeature} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
              </div>
              <ul className="mt-3 space-y-2">
                {form.features.map((feature) => (
                  <li key={feature} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
                    {feature}
                    <motion.button onClick={() => removeListItem("features", feature)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Restrictions<span className="ml-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> Limitations or conditions</span></label>
              <div className="mt-1 flex gap-3">
                <select value={newRestriction} onChange={(e) => setNewRestriction(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm">
                  <option value="">Select a restriction</option>
                  {restrictionsOptions.map((restriction) => <option key={restriction} value={restriction}>{restriction}</option>)}
                </select>
                <motion.button onClick={addRestriction} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700" whileHover={{ scale: 1.05 }}>Add</motion.button>
              </div>
              <ul className="mt-3 space-y-2">
                {form.restrictions.map((restriction) => (
                  <li key={restriction} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded-lg shadow-sm">
                    {restriction}
                    <motion.button onClick={() => removeListItem("restrictions", restriction)} className="text-red-600 hover:text-red-800" whileHover={{ scale: 1.2 }}><X className="w-4 h-4" /></motion.button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button onClick={validateAndSavePlan} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Save className="w-5 h-5 mr-2" /> Save Plan
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderPlanDetails = () => {
    if (!selectedPlan) { setViewMode("list"); return null; }
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{selectedPlan.name || "Unnamed Plan"}</h2>
            <motion.button onClick={() => { setSelectedPlan(null); setViewMode("list"); }} className="p-2 text-gray-500 hover:text-gray-700" whileHover={{ rotate: 90 }}><X className="w-8 h-8" /></motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Zap className="w-6 h-6 text-teal-600 mr-2" /> Overview</h3>
              <div className="space-y-3">
                <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {selectedPlan.planType || "N/A"}</p>
                <p className="text-gray-700"><span className="font-medium text-gray-900">Category:</span> {selectedPlan.category || "N/A"}</p>
                <p className="text-gray-700"><span className="font-medium text-gray-900">Price:</span> {selectedPlan.planType === "Paid" ? <span className="text-teal-600 font-semibold">Ksh {formatNumber(selectedPlan.price || 0)}</span> : <span className="text-green-600 font-semibold">Free</span>}</p>
                <p className="text-gray-700"><span className="font-medium text-gray-900">Status:</span> <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedPlan.active ? "bg-teal-100 text-teal-800" : "bg-gray-100 text-gray-800"}`}>{selectedPlan.active ? "Active" : "Inactive"}</span></p>
              </div>
            </motion.div>

            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Wifi className="w-6 h-6 text-teal-600 mr-2" /> Specifications</h3>
              <div className="space-y-3">
                <p className="text-gray-700"><Download className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Download:</span> {selectedPlan.downloadSpeed.value || "N/A"} {selectedPlan.downloadSpeed.unit || ""}</p>
                <p className="text-gray-700"><Upload className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Upload:</span> {selectedPlan.uploadSpeed.value || "N/A"} {selectedPlan.uploadSpeed.unit || ""}</p>
                <p className="text-gray-700"><Calendar className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Expiry:</span> {selectedPlan.expiry.value || "N/A"} {selectedPlan.expiry.unit || ""}</p>
                <p className="text-gray-700"><Shield className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Data Limit:</span> {selectedPlan.dataLimit.value || "N/A"} {selectedPlan.dataLimit.unit || ""}</p>
                <p className="text-gray-700"><Clock className="w-4 h-4 inline mr-2 text-teal-600" /><span className="font-medium">Usage Limit:</span> {selectedPlan.usageLimit.value || "N/A"} {selectedPlan.usageLimit.unit || ""}
                  {selectedPlan.usageLimit.unit === "Hours" && selectedPlan.usageLimit.value && <span className="text-xs text-gray-500 ml-2">(~{(parseInt(selectedPlan.usageLimit.value) / 24).toFixed(1)} days)</span>}
                </p>
              </div>
            </motion.div>

            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Gift className="w-6 h-6 text-teal-600 mr-2" /> Description</h3>
              <div className="prose prose-sm text-gray-700"><MDEditor.Markdown source={selectedPlan.description || "No description available"} /></div>
            </motion.div>

            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Star className="w-6 h-6 text-teal-600 mr-2" /> Features</h3>
                  <ul className="space-y-2">
                    {selectedPlan.features.length > 0 ? selectedPlan.features.map((feature) => (
                      <li key={feature} className="text-gray-700 flex items-center"><Zap className="w-4 h-4 text-teal-600 mr-2" /> {feature}</li>
                    )) : <li className="text-gray-500 italic">None</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-6 h-6 text-teal-600 mr-2" /> Restrictions</h3>
                  <ul className="space-y-2">
                    {selectedPlan.restrictions.length > 0 ? selectedPlan.restrictions.map((restriction) => (
                      <li key={restriction} className="text-gray-700 flex items-center"><Shield className="w-4 h-4 text-teal-600 mr-2" /> {restriction}</li>
                    )) : <li className="text-gray-500 italic">None</li>}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><Users className="w-6 h-6 text-teal-600 mr-2" /> Stats</h3>
              <div className="space-y-3">
                <p className="text-gray-700"><span className="font-medium text-gray-900">Subscribers:</span> {selectedPlan.purchases || 0} {renderStars(selectedPlan.purchases)}</p>
                <p className="text-gray-700"><span className="font-medium text-gray-900">Created At:</span> {selectedPlan.createdAt ? new Date(selectedPlan.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <AnimatePresence mode="wait">
        {viewMode === "list" && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderPlanList()}</motion.div>}
        {viewMode === "form" && <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanForm()}</motion.div>}
        {viewMode === "details" && <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>{renderPlanDetails()}</motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default CreatePlans;