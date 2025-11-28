// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { PuffLoader } from "react-spinners";
// import { Wifi, Zap, Clock, CheckCircle2, Crown } from "lucide-react";

// const HotspotPlans = ({ onPlanSelect, isLoggedIn, plans, clientData }) => {
//   const [loading, setLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("all");

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
//     hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" },
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.2 },
//     },
//   };

//   // Group plans by category
//   const groupedPlans = plans.reduce((acc, plan) => {
//     const category = plan.category || "Other";
//     if (!acc[category]) acc[category] = [];
//     acc[category].push(plan);
//     return acc;
//   }, {});

//   // Filter plans based on selected category
//   const filteredPlans = selectedCategory === "all" 
//     ? groupedPlans 
//     : { [selectedCategory]: groupedPlans[selectedCategory] || [] };

//   const categories = [
//     { id: "all", name: "All Plans", color: "from-purple-500 to-pink-500" },
//     { id: "Residential", name: "Residential", color: "from-blue-500 to-cyan-500" },
//     { id: "Business", name: "Business", color: "from-green-500 to-emerald-500" },
//     { id: "Promotional", name: "Promotional", color: "from-orange-500 to-red-500" },
//     { id: "Enterprise", name: "Enterprise", color: "from-purple-500 to-indigo-500" },
//   ];

//   const getCategoryDescription = (category) => {
//     switch (category) {
//       case "Residential":
//         return "Perfect for everyday browsing, streaming, and staying connected at home";
//       case "Business":
//         return "Reliable connectivity for small businesses and remote work";
//       case "Promotional":
//         return "Special offers and limited-time deals for maximum value";
//       case "Enterprise":
//         return "High-performance plans for demanding business needs";
//       default:
//         return "Browse all available WiFi plans";
//     }
//   };

//   const getSpeedColor = (speed) => {
//     if (speed >= 100) return "text-green-400";
//     if (speed >= 50) return "text-yellow-400";
//     return "text-blue-400";
//   };

//   return (
//     <section className="py-20 bg-gradient-to-b from-purple-900/20 to-indigo-900/20" id="hotspot-plans">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-12"
//         >
//           <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
//             Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300">WiFi Plan</span>
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Flexible plans designed for every need. Pay with M-Pesa and get instant access.
//           </p>
//         </motion.div>

//         {/* Category Filter */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="flex flex-wrap justify-center gap-3 mb-12"
//         >
//           {categories.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => setSelectedCategory(category.id)}
//               className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
//                 selectedCategory === category.id
//                   ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
//                   : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
//               }`}
//             >
//               {category.name}
//             </button>
//           ))}
//         </motion.div>

//         {plans.length > 0 ? (
//           <div className="space-y-16">
//             {Object.entries(filteredPlans).map(([category, categoryPlans]) => (
//               <div key={category}>
//                 <motion.div
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   className="text-center mb-8"
//                 >
//                   <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3">
//                     {category} Plans
//                   </h3>
//                   <p className="text-gray-400 max-w-2xl mx-auto text-lg">
//                     {getCategoryDescription(category)}
//                   </p>
//                 </motion.div>

//                 <motion.div
//                   variants={containerVariants}
//                   initial="hidden"
//                   animate="visible"
//                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//                 >
//                   {categoryPlans.map((plan) => {
//                     const isPromotionalZero =
//                       plan.category === "promotional" &&
//                       (plan.price === 0 || plan.price === "0" || parseFloat(plan.price) === 0);

//                     const isPopular = plan.priority_level >= 6;

//                     return (
//                       <motion.div
//                         key={plan.id}
//                         variants={cardVariants}
//                         whileHover={!isPromotionalZero ? "hover" : undefined}
//                         className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:border-pink-400/30 transition-all duration-300 flex flex-col relative overflow-hidden"
//                       >
//                         {/* Popular Badge */}
//                         {isPopular && (
//                           <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold flex items-center gap-1">
//                             <Crown className="w-3 h-3" />
//                             POPULAR
//                           </div>
//                         )}

//                         {/* Free Badge */}
//                         {isPromotionalZero && (
//                           <div className="absolute top-0 right-0 bg-gradient-to-r from-green-400 to-emerald-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold animate-pulse">
//                             FREE TRIAL
//                           </div>
//                         )}

//                         <div className="flex-grow text-center">
//                           {/* Plan Icon */}
//                           <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <Wifi className="w-6 h-6 text-white" />
//                           </div>

//                           <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                          
//                           <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 mb-4">
//                             {isPromotionalZero ? (
//                               <span className="text-green-400">FREE</span>
//                             ) : (
//                               <>
//                                 KES {Number(plan.price).toLocaleString()}
//                                 <span className="text-sm font-normal text-gray-400 block">
//                                   /{plan.duration_display || 'month'}
//                                 </span>
//                               </>
//                             )}
//                           </p>

//                           {/* Speed Information */}
//                           <div className="flex justify-center items-center gap-4 mb-4">
//                             <div className="text-center">
//                               <div className="flex items-center gap-1">
//                                 <Zap className={`w-4 h-4 ${getSpeedColor(parseInt(plan.download_speed) || 10)}`} />
//                                 <span className="text-white font-semibold">
//                                   {plan.download_speed || '10'} Mbps
//                                 </span>
//                               </div>
//                               <span className="text-gray-400 text-xs">Download</span>
//                             </div>
                            
//                             <div className="w-px h-8 bg-white/20"></div>
                            
//                             <div className="text-center">
//                               <div className="flex items-center gap-1">
//                                 <Zap className="w-4 h-4 text-blue-400" />
//                                 <span className="text-white font-semibold">
//                                   {plan.upload_speed || '5'} Mbps
//                                 </span>
//                               </div>
//                               <span className="text-gray-400 text-xs">Upload</span>
//                             </div>
//                           </div>

//                           {/* Plan Features */}
//                           <ul className="text-gray-300 text-sm space-y-3 mb-6">
//                             <li className="flex items-center justify-between">
//                               <span className="text-gray-400">Data:</span>
//                               <span className="font-medium text-white">
//                                 {plan.data_limit_display || 'Unlimited'}
//                               </span>
//                             </li>
//                             <li className="flex items-center justify-between">
//                               <span className="text-gray-400">Devices:</span>
//                               <span className="font-medium text-white">
//                                 {plan.access_methods?.hotspot?.maxDevices || 1} device(s)
//                               </span>
//                             </li>
//                             <li className="flex items-center justify-between">
//                               <span className="text-gray-400">Validity:</span>
//                               <span className="font-medium text-white flex items-center gap-1">
//                                 <Clock className="w-3 h-3" />
//                                 {plan.duration_display || '30 Days'}
//                               </span>
//                             </li>
//                             {plan.description && (
//                               <li className="text-gray-400 italic text-xs border-t border-white/10 pt-2 mt-2">
//                                 {plan.description}
//                               </li>
//                             )}
//                           </ul>
//                         </div>

//                         <button
//                           onClick={() => onPlanSelect(plan)}
//                           className={`w-full py-3 px-6 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 ${
//                             isPromotionalZero
//                               ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
//                               : isPopular
//                               ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
//                               : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
//                           }`}
//                           title={
//                             isPromotionalZero
//                               ? "Activate this free promotional plan"
//                               : "Get started with this plan"
//                           }
//                         >
//                           <CheckCircle2 className="w-4 h-4" />
//                           {isPromotionalZero ? "Activate Free" : "BUY NOW"}
//                         </button>

//                         {/* M-Pesa Badge */}
//                         {!isPromotionalZero && (
//                           <div className="text-center mt-3">
//                             <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
//                               ✓ M-Pesa Ready
//                             </span>
//                           </div>
//                         )}
//                       </motion.div>
//                     );
//                   })}
//                 </motion.div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center flex flex-col items-center justify-center py-16">
//             <PuffLoader color="#A78BFA" size={150} speedMultiplier={1} />
//             <p className="mt-6 text-xl font-semibold text-gray-400">
//               Loading WiFi Plans...
//             </p>
//             <p className="text-gray-500 mt-2">Please wait while we fetch the latest plans</p>
//           </div>
//         )}

//         {/* Support Note */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.8 }}
//           className="text-center mt-12 p-6 bg-white/5 rounded-2xl border border-white/10"
//         >
//           <div className="flex items-center justify-center gap-3 text-gray-300">
//             <CheckCircle2 className="w-5 h-5 text-green-400" />
//             <p className="text-sm">
//               All plans include instant activation and 24/7 support. Need help?{" "}
//               <a href="#help" className="text-pink-300 hover:text-pink-200 font-medium">
//                 Contact Support
//               </a>
//             </p>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default HotspotPlans;













// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { PuffLoader } from "react-spinners";
// import { Wifi, Zap, Clock, CheckCircle2, Crown } from "lucide-react";

// const HotspotPlans = ({ onPlanSelect, isLoggedIn, plans, clientData }) => {
//   const [loading, setLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("all");

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
//     hover: { scale: 1.03, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" },
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.15 },
//     },
//   };

//   // Group plans by category
//   const groupedPlans = plans.reduce((acc, plan) => {
//     const category = plan.category || "Other";
//     if (!acc[category]) acc[category] = [];
//     acc[category].push(plan);
//     return acc;
//   }, {});

//   // Filter plans based on selected category
//   const filteredPlans = selectedCategory === "all"
//     ? groupedPlans
//     : { [selectedCategory]: groupedPlans[selectedCategory] || [] };

//   const categories = [
//     { id: "all", name: "All Plans", color: "from-purple-500 to-pink-500" },
//     { id: "Residential", name: "Residential", color: "from-blue-500 to-cyan-500" },
//     { id: "Business", name: "Business", color: "from-green-500 to-emerald-500" },
//     { id: "Promotional", name: "Promotional", color: "from-orange-500 to-red-500" },
//     { id: "Enterprise", name: "Enterprise", color: "from-purple-600 to-indigo-600" },
//   ];

//   const getCategoryDescription = (category) => {
//     switch (category) {
//       case "Residential":
//         return "Perfect for everyday browsing, streaming, and staying connected at home";
//       case "Business":
//         return "Reliable connectivity for small businesses and remote work";
//       case "Promotional":
//         return "Special offers and limited-time deals for maximum value";
//       case "Enterprise":
//         return "High-performance plans for demanding business needs";
//       default:
//         return "Browse all available WiFi plans";
//     }
//   };

//   const getSpeedColor = (speed) => {
//     const num = parseInt(speed) || 0;
//     if (num >= 100) return "text-green-400";
//     if (num >= 50) return "text-yellow-400";
//     return "text-blue-400";
//   };

//   return (
//     <section className="py-20 bg-black min-h-screen" id="hotspot-plans">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           className="text-center mb-14"
//         >
//           <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
//             Choose Your{" "}
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
//               WiFi Plan
//             </span>
//           </h2>
//           <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
//             Instant activation • Pay with M-Pesa • No contracts • 24/7 support
//           </p>
//         </motion.div>

//         {/* Category Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="flex flex-wrap justify-center gap-4 mb-16"
//         >
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setSelectedCategory(cat.id)}
//               className={`px-8 py-4 rounded-full font-bold text-sm md:text-base transition-all duration-300 shadow-lg ${
//                 selectedCategory === cat.id
//                   ? `bg-gradient-to-r ${cat.color} text-white scale-105`
//                   : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}
//         </motion.div>

//         {/* Plans Grid */}
//         {plans.length > 0 ? (
//           <div className="space-y-20">
//             {Object.entries(filteredPlans).map(([category, categoryPlans]) => (
//               <div key={category}>
//                 {/* Category Title */}
//                 <motion.div
//                   initial={{ opacity: 0, x: -50 }}
//                   whileInView={{ opacity: 1, x: 0 }}
//                   viewport={{ once: true }}
//                   className="text-center mb-12"
//                 >
//                   <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
//                     {category === "Promotional" ? "Special Offers" : `${category} Plans`}
//                   </h3>
//                   <p className="text-lg text-gray-400 max-w-3xl mx-auto">
//                     {getCategoryDescription(category)}
//                   </p>
//                 </motion.div>

//                 {/* Cards */}
//                 <motion.div
//                   variants={containerVariants}
//                   initial="hidden"
//                   whileInView="visible"
//                   viewport={{ once: true }}
//                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
//                 >
//                   {categoryPlans.map((plan) => {
//                     const isFree =
//                       plan.category === "promotional" &&
//                       (plan.price === 0 || plan.price === "0" || parseFloat(plan.price) === 0);

//                     const isPopular = plan.priority_level >= 6 || plan.name.toLowerCase().includes("popular");

//                     return (
//                       <motion.div
//                         key={plan.id}
//                         variants={cardVariants}
//                         whileHover={!isFree ? "hover" : undefined}
//                         className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/40 transition-all duration-500 group overflow-hidden"
//                       >
//                         {/* Badges */}
//                         {isFree && (
//                           <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-bl-2xl rounded-tr-2xl text-sm font-bold animate-pulse shadow-2xl">
//                             FREE TRIAL
//                           </div>
//                         )}
//                         {isPopular && !isFree && (
//                           <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-2 rounded-bl-2xl rounded-tr-2xl text-sm font-bold flex items-center gap-1 shadow-2xl">
//                             <Crown className="w-4 h-4" />
//                             MOST POPULAR
//                           </div>
//                         )}

//                         {/* Content */}
//                         <div className="text-center space-y-6">
//                           <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
//                             <Wifi className="w-10 h-10 text-white" />
//                           </div>

//                           <div>
//                             <h4 className="text-2xl font-bold text-white mb-3">{plan.name}</h4>

//                             <div className="text-4xl md:text-5xl font-extrabold">
//                               {isFree ? (
//                                 <span className="text-emerald-400">FREE</span>
//                               ) : (
//                                 <>
//                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
//                                     KES {Number(plan.price).toLocaleString()}
//                                   </span>
//                                   <span className="block text-sm font-medium text-gray-400 mt-2">
//                                     per {plan.duration_display || "month"}
//                                   </span>
//                                 </>
//                               )}
//                             </div>
//                           </div>

//                           {/* Speed */}
//                           <div className="flex items-center justify-center gap-6 py-4">
//                             <div className="text-center">
//                               <div className="flex items-center gap-2">
//                                 <Zap className={`w-6 h-6 ${getSpeedColor(plan.download_speed)}`} />
//                                 <span className="text-xl font-bold text-white">
//                                   {plan.download_speed || "10"} Mbps
//                                 </span>
//                               </div>
//                               <span className="text-xs text-gray-500">Download</span>
//                             </div>
//                             <div className="w-px h-12 bg-white/20"></div>
//                             <div className="text-center">
//                               <span className="text-xl font-bold text-gray-300">
//                                 {plan.upload_speed || "5"} Mbps
//                               </span>
//                               <span className="text-xs text-gray-500 block">Upload</span>
//                             </div>
//                           </div>

//                           {/* Features */}
//                           <ul className="text-left text-gray-300 space-y-3 text-sm">
//                             <li className="flex justify-between">
//                               <span className="text-gray-500">Data Limit</span>
//                               <span className="font-semibold text-white">
//                                 {plan.data_limit_display || "Unlimited"}
//                               </span>
//                             </li>
//                             <li className="flex justify-between">
//                               <span className="text-gray-500">Devices</span>
//                               <span className="font-semibold text-white">
//                                 {plan.access_methods?.hotspot?.maxDevices || "1"} device(s)
//                               </span>
//                             </li>
//                             <li className="flex justify-between items-center">
//                               <span className="text-gray-500">Validity</span>
//                               <span className="font-semibold text-white flex items-center gap-2">
//                                 <Clock className="w-4 h-4" />
//                                 {plan.duration_display || "30 Days"}
//                               </span>
//                             </li>
//                           </ul>

//                           {/* CTA Button */}
//                           <button
//                             onClick={() => onPlanSelect(plan)}
//                             className={`w-full py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 active:scale-95 mt-6 ${
//                               isFree
//                                 ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
//                                 : isPopular
//                                 ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
//                                 : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
//                             }`}
//                           >
//                             {isFree ? "Activate Free Plan" : "BUY NOW"}
//                           </button>

//                           {!isFree && (
//                             <p className="text-center mt-4 text-xs text-green-400 font-medium">
//                               Instant M-Pesa Payment • No Waiting
//                             </p>
//                           )}
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </motion.div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-32">
//             <PuffLoader color="#c084fc" size={120} />
//             <p className="mt-8 text-2xl font-bold text-purple-400">Loading Amazing Plans...</p>
//             <p className="text-gray-500 mt-2">Just a moment</p>
//           </div>
//         )}

//         {/* Footer Note */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           className="text-center mt-20 py-8 bg-white/5 rounded-3xl border border-white/10"
//         >
//           <p className="text-gray-300 text-lg">
//             <CheckCircle2 className="inline w-6 h-6 text-green-400 mr-2" />
//             All plans include{" "}
//             <span className="text-purple-400 font-bold">instant activation</span> and{" "}
//             <span className="text-purple-400 font-bold">24/7 support</span>
//           </p>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default HotspotPlans;







// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { PuffLoader } from "react-spinners";
// import { Wifi, Zap, Clock, CheckCircle2, Crown } from "lucide-react";

// const HotspotPlans = ({ onPlanSelect, plans, clientData }) => {
//   const [loading, setLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("all");

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
//     hover: { scale: 1.02, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" },
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1 },
//     },
//   };

//   // FIXED: Proper data extraction from backend structure
//   const extractPlanData = (plan) => {
//     const accessMethods = plan.access_methods || plan.accessMethods || {};
//     const hotspotConfig = accessMethods.hotspot || {};
    
//     // Get actual values from hotspot configuration
//     const downloadSpeed = hotspotConfig.downloadSpeed || {};
//     const uploadSpeed = hotspotConfig.uploadSpeed || {};
//     const dataLimit = hotspotConfig.dataLimit || {};
//     const usageLimit = hotspotConfig.usageLimit || {};
//     const validityPeriod = hotspotConfig.validityPeriod || {};

//     // FIXED: Use actual values from database, not defaults
//     const actualDownloadSpeed = downloadSpeed.value || "";
//     const actualUploadSpeed = uploadSpeed.value || "";
//     const actualSpeedUnit = downloadSpeed.unit || uploadSpeed.unit || "Mbps";
    
//     // FIXED: Handle data limits properly
//     const dataValue = dataLimit.value || "";
//     const dataUnit = dataLimit.unit || "";
//     const dataLimitDisplay = dataValue && dataUnit ? 
//       `${dataValue} ${dataUnit}` : 
//       (dataValue === "Unlimited" ? "Unlimited" : "Unlimited");

//     // FIXED: Handle duration properly
//     const durationValue = validityPeriod.value || usageLimit.value || "";
//     const durationUnit = validityPeriod.unit || usageLimit.unit || "";
//     const durationDisplay = durationValue && durationUnit ? 
//       `${durationValue} ${durationUnit}` : 
//       (usageLimit.value === "Unlimited" ? "Unlimited" : "Unlimited");

//     // FIXED: Get actual device limits
//     const maxDevices = hotspotConfig.maxDevices || 1;

//     return {
//       id: plan.id,
//       name: plan.name,
//       price: plan.price,
//       category: plan.category,
//       plan_type: plan.plan_type || plan.planType,
//       description: plan.description,
      
//       // ACTUAL values from database
//       download_speed: actualDownloadSpeed,
//       upload_speed: actualUploadSpeed,
//       speed_unit: actualSpeedUnit,
      
//       // FIXED: Proper data limit formatting
//       data_limit_display: dataLimitDisplay,
      
//       // FIXED: Proper duration formatting
//       duration_display: durationDisplay,
      
//       // FIXED: Actual device limits
//       max_devices: maxDevices,
      
//       isFree: plan.plan_type === 'Free Trial' || parseFloat(plan.price || 0) === 0,
//       isPopular: plan.priority_level >= 6
//     };
//   };

//   const processedPlans = plans.map(extractPlanData);

//   // Group plans by category
//   const groupedPlans = processedPlans.reduce((acc, plan) => {
//     const category = plan.category || "Other";
//     if (!acc[category]) acc[category] = [];
//     acc[category].push(plan);
//     return acc;
//   }, {});

//   // Filter plans based on selected category
//   const filteredPlans = selectedCategory === "all"
//     ? groupedPlans
//     : { [selectedCategory]: groupedPlans[selectedCategory] || [] };

//   const categories = [
//     { id: "all", name: "All Plans", color: "from-purple-500 to-pink-500" },
//     { id: "Residential", name: "Residential", color: "from-blue-500 to-cyan-500" },
//     { id: "Business", name: "Business", color: "from-green-500 to-emerald-500" },
//     { id: "Promotional", name: "Promotional", color: "from-orange-500 to-red-500" },
//     { id: "Enterprise", name: "Enterprise", color: "from-purple-600 to-indigo-600" },
//   ];

//   const getCategoryDescription = (category) => {
//     switch (category) {
//       case "Residential":
//         return "Perfect for everyday browsing and streaming";
//       case "Business":
//         return "Reliable connectivity for work and business";
//       case "Promotional":
//         return "Special offers and limited-time deals";
//       case "Enterprise":
//         return "High-performance plans for business needs";
//       default:
//         return "Browse all available WiFi plans";
//     }
//   };

//   const getSpeedColor = (speed) => {
//     const num = parseInt(speed) || 0;
//     if (num >= 100) return "text-green-400";
//     if (num >= 50) return "text-yellow-400";
//     return "text-blue-400";
//   };

//   return (
//     <section className="py-16 bg-black min-h-screen" id="hotspot-plans">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-12"
//         >
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             Choose Your{" "}
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
//               WiFi Plan
//             </span>
//           </h2>
//           <p className="text-lg text-gray-300 max-w-2xl mx-auto">
//             Instant activation • Pay with M-Pesa • No contracts
//           </p>
//         </motion.div>

//         {/* Category Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="flex flex-wrap justify-center gap-3 mb-12"
//         >
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setSelectedCategory(cat.id)}
//               className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
//                 selectedCategory === cat.id
//                   ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
//                   : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}
//         </motion.div>

//         {/* Plans Grid */}
//         {plans.length > 0 ? (
//           <div className="space-y-16">
//             {Object.entries(filteredPlans).map(([category, categoryPlans]) => (
//               <div key={category}>
//                 {/* Category Title */}
//                 <motion.div
//                   initial={{ opacity: 0, x: -30 }}
//                   whileInView={{ opacity: 1, x: 0 }}
//                   viewport={{ once: true }}
//                   className="text-center mb-10"
//                 >
//                   <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
//                     {category === "Promotional" ? "Special Offers" : `${category} Plans`}
//                   </h3>
//                   <p className="text-gray-400 max-w-xl mx-auto">
//                     {getCategoryDescription(category)}
//                   </p>
//                 </motion.div>

//                 {/* Cards */}
//                 <motion.div
//                   variants={containerVariants}
//                   initial="hidden"
//                   whileInView="visible"
//                   viewport={{ once: true }}
//                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//                 >
//                   {categoryPlans.map((plan) => (
//                     <motion.div
//                       key={plan.id}
//                       variants={cardVariants}
//                       whileHover={!plan.isFree ? "hover" : undefined}
//                       className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/40 transition-all duration-300 group overflow-hidden"
//                     >
//                       {/* Badges */}
//                       {plan.isFree && (
//                         <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl text-xs font-bold">
//                           FREE TRIAL
//                         </div>
//                       )}
//                       {plan.isPopular && !plan.isFree && (
//                         <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl text-xs font-bold flex items-center gap-1">
//                           <Crown className="w-3 h-3" />
//                           POPULAR
//                         </div>
//                       )}

//                       {/* Content */}
//                       <div className="text-center space-y-5">
//                         <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
//                           <Wifi className="w-8 h-8 text-white" />
//                         </div>

//                         <div>
//                           <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>

//                           <div className="text-3xl font-bold">
//                             {plan.isFree ? (
//                               <span className="text-emerald-400">FREE</span>
//                             ) : (
//                               <>
//                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
//                                   KES {Number(plan.price).toLocaleString()}
//                                 </span>
//                               </>
//                             )}
//                           </div>
//                         </div>

//                         {/* Speed - FIXED: Shows actual values */}
//                         <div className="flex items-center justify-center gap-4 py-3">
//                           <div className="text-center">
//                             <div className="flex items-center gap-1">
//                               <Zap className={`w-5 h-5 ${getSpeedColor(plan.download_speed)}`} />
//                               <span className="text-lg font-bold text-white">
//                                 {plan.download_speed || "0"} {plan.speed_unit}
//                               </span>
//                             </div>
//                             <span className="text-xs text-gray-500">Download</span>
//                           </div>
//                           <div className="w-px h-8 bg-white/20"></div>
//                           <div className="text-center">
//                             <span className="text-lg font-bold text-gray-300">
//                               {plan.upload_speed || "0"} {plan.speed_unit}
//                             </span>
//                             <span className="text-xs text-gray-500 block">Upload</span>
//                           </div>
//                         </div>

//                         {/* Features - FIXED: Shows actual values */}
//                         <ul className="text-left text-gray-300 space-y-2 text-sm">
//                           <li className="flex justify-between">
//                             <span className="text-gray-500">Data</span>
//                             <span className="font-semibold text-white">
//                               {plan.data_limit_display}
//                             </span>
//                           </li>
//                           <li className="flex justify-between">
//                             <span className="text-gray-500">Devices</span>
//                             <span className="font-semibold text-white">
//                               {plan.max_devices} device(s)
//                             </span>
//                           </li>
//                           <li className="flex justify-between items-center">
//                             <span className="text-gray-500">Duration</span>
//                             <span className="font-semibold text-white flex items-center gap-1">
//                               <Clock className="w-3 h-3" />
//                               {plan.duration_display}
//                             </span>
//                           </li>
//                         </ul>

//                         {/* CTA Button */}
//                         <button
//                           onClick={() => onPlanSelect(plan)}
//                           className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 active:scale-95 mt-4 ${
//                             plan.isFree
//                               ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
//                               : plan.isPopular
//                               ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//                               : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
//                           }`}
//                         >
//                           {plan.isFree ? "Activate Free" : "BUY NOW"}
//                         </button>

//                         {!plan.isFree && (
//                           <p className="text-center text-xs text-green-400 font-medium">
//                             Instant M-Pesa Payment
//                           </p>
//                         )}
//                       </div>
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-20">
//             <PuffLoader color="#c084fc" size={80} />
//             <p className="mt-6 text-xl font-bold text-purple-400">Loading Plans...</p>
//             <p className="text-gray-500 mt-2 text-sm">Please wait</p>
//           </div>
//         )}

//         {/* Footer Note */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           className="text-center mt-16 py-6 bg-white/5 rounded-2xl border border-white/10"
//         >
//           <p className="text-gray-300">
//             <CheckCircle2 className="inline w-5 h-5 text-green-400 mr-2" />
//             All plans include <span className="text-purple-400 font-semibold">instant activation</span>
//           </p>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default HotspotPlans;









// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { PuffLoader } from "react-spinners";
// import { Wifi, Zap, Clock, CheckCircle2, Crown } from "lucide-react";

// const HotspotPlans = ({ onPlanSelect, plans, clientData }) => {
//   const [loading, setLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("all");

//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
//     hover: { scale: 1.02, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" },
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1 },
//     },
//   };

  
//   const extractPlanData = (plan) => {
   
//     return {
//       id: plan.id,
//       name: plan.name,
//       price: plan.price,
//       category: plan.category,
//       plan_type: plan.plan_type,
      
//       // Direct from backend serializer
//       download_speed: plan.download_speed,
//       upload_speed: plan.upload_speed,
//       speed_unit: plan.speed_unit,
//       data_limit_display: plan.data_limit_display,
//       duration_display: plan.duration_display,
//       max_devices: plan.max_devices,
      
//       isFree: plan.plan_type === 'Free Trial' || parseFloat(plan.price || 0) === 0,
//       isPopular: plan.priority_level >= 6
//     };
//   };

//   const processedPlans = plans.map(extractPlanData);

//   // Group plans by category
//   const groupedPlans = processedPlans.reduce((acc, plan) => {
//     const category = plan.category || "Other";
//     if (!acc[category]) acc[category] = [];
//     acc[category].push(plan);
//     return acc;
//   }, {});

//   // Filter plans based on selected category
//   const filteredPlans = selectedCategory === "all"
//     ? groupedPlans
//     : { [selectedCategory]: groupedPlans[selectedCategory] || [] };

//   const categories = [
//     { id: "all", name: "All Plans", color: "from-purple-500 to-pink-500" },
//     { id: "Residential", name: "Residential", color: "from-blue-500 to-cyan-500" },
//     { id: "Business", name: "Business", color: "from-green-500 to-emerald-500" },
//     { id: "Promotional", name: "Promotional", color: "from-orange-500 to-red-500" },
//     { id: "Enterprise", name: "Enterprise", color: "from-purple-600 to-indigo-600" },
//   ];

//   const getCategoryDescription = (category) => {
//     switch (category) {
//       case "Residential":
//         return "Perfect for everyday browsing and streaming";
//       case "Business":
//         return "Reliable connectivity for work and business";
//       case "Promotional":
//         return "Special offers and limited-time deals";
//       case "Enterprise":
//         return "High-performance plans for business needs";
//       default:
//         return "Browse all available WiFi plans";
//     }
//   };

//   const getSpeedColor = (speed) => {
//     const num = parseInt(speed) || 0;
//     if (num >= 100) return "text-green-400";
//     if (num >= 50) return "text-yellow-400";
//     return "text-blue-400";
//   };

//   return (
//     <section className="py-16 bg-black min-h-screen" id="hotspot-plans">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-12"
//         >
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             Choose Your{" "}
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">
//               WiFi Plan
//             </span>
//           </h2>
//           <p className="text-lg text-gray-300 max-w-2xl mx-auto">
//             Instant activation • Pay with M-Pesa • No contracts
//           </p>
//         </motion.div>

//         {/* Category Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="flex flex-wrap justify-center gap-3 mb-12"
//         >
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setSelectedCategory(cat.id)}
//               className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
//                 selectedCategory === cat.id
//                   ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
//                   : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}
//         </motion.div>

//         {/* Plans Grid */}
//         {plans.length > 0 ? (
//           <div className="space-y-16">
//             {Object.entries(filteredPlans).map(([category, categoryPlans]) => (
//               <div key={category}>
//                 {/* Category Title */}
//                 <motion.div
//                   initial={{ opacity: 0, x: -30 }}
//                   whileInView={{ opacity: 1, x: 0 }}
//                   viewport={{ once: true }}
//                   className="text-center mb-10"
//                 >
//                   <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
//                     {category === "Promotional" ? "Special Offers" : `${category} Plans`}
//                   </h3>
//                   <p className="text-gray-400 max-w-xl mx-auto">
//                     {getCategoryDescription(category)}
//                   </p>
//                 </motion.div>

//                 {/* Cards */}
//                 <motion.div
//                   variants={containerVariants}
//                   initial="hidden"
//                   whileInView="visible"
//                   viewport={{ once: true }}
//                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//                 >
//                   {categoryPlans.map((plan) => (
//                     <motion.div
//                       key={plan.id}
//                       variants={cardVariants}
//                       whileHover={!plan.isFree ? "hover" : undefined}
//                       className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/40 transition-all duration-300 group overflow-hidden"
//                     >
//                       {/* Badges */}
//                       {plan.isFree && (
//                         <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl text-xs font-bold">
//                           FREE TRIAL
//                         </div>
//                       )}
//                       {plan.isPopular && !plan.isFree && (
//                         <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-bl-xl rounded-tr-xl text-xs font-bold flex items-center gap-1">
//                           <Crown className="w-3 h-3" />
//                           POPULAR
//                         </div>
//                       )}

//                       {/* Content */}
//                       <div className="text-center space-y-5">
//                         <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
//                           <Wifi className="w-8 h-8 text-white" />
//                         </div>

//                         <div>
//                           <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>

//                           <div className="text-3xl font-bold">
//                             {plan.isFree ? (
//                               <span className="text-emerald-400">FREE</span>
//                             ) : (
//                               <>
//                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
//                                   KES {Number(plan.price).toLocaleString()}
//                                 </span>
//                               </>
//                             )}
//                           </div>
//                         </div>

//                         {/* Speed - Now shows actual values from backend */}
//                         <div className="flex items-center justify-center gap-4 py-3">
//                           <div className="text-center">
//                             <div className="flex items-center gap-1">
//                               <Zap className={`w-5 h-5 ${getSpeedColor(plan.download_speed)}`} />
//                               <span className="text-lg font-bold text-white">
//                                 {plan.download_speed || "0"} {plan.speed_unit}
//                               </span>
//                             </div>
//                             <span className="text-xs text-gray-500">Download</span>
//                           </div>
//                           <div className="w-px h-8 bg-white/20"></div>
//                           <div className="text-center">
//                             <span className="text-lg font-bold text-gray-300">
//                               {plan.upload_speed || "0"} {plan.speed_unit}
//                             </span>
//                             <span className="text-xs text-gray-500 block">Upload</span>
//                           </div>
//                         </div>

//                         {/* Features - Now shows actual values from backend */}
//                         <ul className="text-left text-gray-300 space-y-2 text-sm">
//                           <li className="flex justify-between">
//                             <span className="text-gray-500">Data</span>
//                             <span className="font-semibold text-white">
//                               {plan.data_limit_display}
//                             </span>
//                           </li>
//                           <li className="flex justify-between">
//                             <span className="text-gray-500">Devices</span>
//                             <span className="font-semibold text-white">
//                               {plan.max_devices} device(s)
//                             </span>
//                           </li>
//                           <li className="flex justify-between items-center">
//                             <span className="text-gray-500">Duration</span>
//                             <span className="font-semibold text-white flex items-center gap-1">
//                               <Clock className="w-3 h-3" />
//                               {plan.duration_display}
//                             </span>
//                           </li>
//                         </ul>

//                         {/* CTA Button */}
//                         <button
//                           onClick={() => onPlanSelect(plan)}
//                           className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 active:scale-95 mt-4 ${
//                             plan.isFree
//                               ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
//                               : plan.isPopular
//                               ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//                               : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
//                           }`}
//                         >
//                           {plan.isFree ? "Activate Free" : "BUY NOW"}
//                         </button>

//                         {!plan.isFree && (
//                           <p className="text-center text-xs text-green-400 font-medium">
//                             Instant M-Pesa Payment
//                           </p>
//                         )}
//                       </div>
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-20">
//             <PuffLoader color="#c084fc" size={80} />
//             <p className="mt-6 text-xl font-bold text-purple-400">Loading Plans...</p>
//             <p className="text-gray-500 mt-2 text-sm">Please wait</p>
//           </div>
//         )}

//         {/* Footer Note */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           className="text-center mt-16 py-6 bg-white/5 rounded-2xl border border-white/10"
//         >
//           <p className="text-gray-300">
//             <CheckCircle2 className="inline w-5 h-5 text-green-400 mr-2" />
//             All plans include <span className="text-purple-400 font-semibold">instant activation</span>
//           </p>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default HotspotPlans;








import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PuffLoader } from "react-spinners";
import { 
  Home, 
  Briefcase, 
  Star, 
  Building, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Crown, 
  Users, 
  Database 
} from "lucide-react";

const HotspotPlans = ({ onPlanSelect, plans, clientData }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.02, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // Memoized data processing
  const processedPlans = useMemo(() => 
    plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      category: plan.category,
      plan_type: plan.plan_type,
      download_speed: plan.download_speed,
      upload_speed: plan.upload_speed,
      speed_unit: plan.speed_unit,
      data_limit_display: plan.data_limit_display,
      duration_display: plan.duration_display,
      max_devices: plan.max_devices,
      isFree: plan.plan_type === 'Free Trial' || parseFloat(plan.price || 0) === 0,
      isPopular: plan.priority_level >= 6
    }))
  , [plans]);

  const groupedPlans = useMemo(() => 
    processedPlans.reduce((acc, plan) => {
      const category = plan.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(plan);
      return acc;
    }, {})
  , [processedPlans]);

  const filteredPlans = useMemo(() => 
    selectedCategory === "all" 
      ? groupedPlans 
      : { [selectedCategory]: groupedPlans[selectedCategory] || [] }
  , [selectedCategory, groupedPlans]);

  // Category configuration with unique colors and icons
  const categories = [
    { 
      id: "all", 
      name: "All Plans", 
      color: "from-amber-500 to-orange-500",
      icon: Star,
      iconColor: "text-amber-400",
      buttonColor: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
    },
    { 
      id: "Residential", 
      name: "Residential", 
      color: "from-emerald-500 to-teal-500",
      icon: Home,
      iconColor: "text-emerald-400",
      buttonColor: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
    },
    { 
      id: "Business", 
      name: "Business", 
      color: "from-indigo-500 to-violet-500",
      icon: Briefcase,
      iconColor: "text-indigo-400",
      buttonColor: "from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
    },
    { 
      id: "Promotional", 
      name: "Promotional", 
      color: "from-rose-500 to-red-500",
      icon: Star,
      iconColor: "text-rose-400",
      buttonColor: "from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
    },
    { 
      id: "Enterprise", 
      name: "Enterprise", 
      color: "from-slate-600 to-gray-600",
      icon: Building,
      iconColor: "text-slate-400",
      buttonColor: "from-slate-700 to-gray-700 hover:from-slate-800 hover:to-gray-800"
    },
  ];

  const getCategoryDescription = (category) => {
    const descriptions = {
      "Residential": "Perfect for everyday browsing and streaming",
      "Business": "Reliable connectivity for work and business",
      "Promotional": "Special offers and limited-time deals",
      "Enterprise": "High-performance plans for business needs"
    };
    return descriptions[category] || "Browse all available WiFi plans";
  };

  const getSpeedColor = (speed) => {
    const num = parseInt(speed) || 0;
    if (num >= 100) return "text-green-400";
    if (num >= 50) return "text-yellow-400";
    return "text-blue-400";
  };

  const formatDataLimit = (dataLimit) => {
    if (!dataLimit || dataLimit.toLowerCase().includes('unlimited')) {
      return "Unlimited";
    }
    return dataLimit;
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    return duration.replace(/unlimited/gi, '').trim() || 'Flexible';
  };

  // Get category config
  const getCategoryConfig = (category) => {
    return categories.find(cat => cat.id === category) || categories[0];
  };

  return (
    <section className="py-12 bg-black min-h-screen" id="hotspot-plans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Choose Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
              WiFi Plan
            </span>
          </h2>
          <p className="text-base text-gray-300 max-w-2xl mx-auto">
            Instant activation • Pay with M-Pesa • No contracts
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium text-xs transition-all duration-300 ${
                selectedCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <div className="space-y-12">
            {Object.entries(filteredPlans).map(([category, categoryPlans]) => {
              const categoryConfig = getCategoryConfig(category);
              const CategoryIcon = categoryConfig.icon;
              
              return (
                <div key={category}>
                  {/* Category Title */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                  >
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                      {category === "Promotional" ? "Special Offers" : `${category} Plans`}
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xl mx-auto">
                      {getCategoryDescription(category)}
                    </p>
                  </motion.div>

                  {/* Cards Grid */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {categoryPlans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        variants={cardVariants}
                        whileHover={!plan.isFree ? "hover" : undefined}
                        className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group overflow-hidden flex flex-col h-full"
                      >
                        {/* Badges */}
                        {plan.isFree && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
                            FREE TRIAL
                          </div>
                        )}
                        {plan.isPopular && !plan.isFree && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            POPULAR
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="flex flex-col flex-1 space-y-4">
                          {/* Header */}
                          <div className="text-center">
                            <div className={`w-12 h-12 bg-gradient-to-br ${categoryConfig.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                              <CategoryIcon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                            <div className="text-2xl font-bold">
                              {plan.isFree ? (
                                <span className="text-emerald-400">FREE</span>
                              ) : (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                                  KES {Number(plan.price).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Speed Info */}
                          <div className="flex items-center justify-around bg-black/20 rounded-lg py-2 px-3">
                            <div className="text-center">
                              <div className="flex items-center gap-1 justify-center mb-1">
                                <Zap className={`w-4 h-4 ${getSpeedColor(plan.download_speed)}`} />
                                <span className="text-base font-bold text-white">
                                  {plan.download_speed || "0"}{plan.speed_unit}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">Download</span>
                            </div>
                            <div className="w-px h-6 bg-white/20"></div>
                            <div className="text-center">
                              <span className="text-base font-bold text-gray-300 block">
                                {plan.upload_speed || "0"}{plan.speed_unit}
                              </span>
                              <span className="text-xs text-gray-500">Upload</span>
                            </div>
                          </div>

                          {/* Features Grid */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-black/20 rounded-md py-2 px-1">
                              <Database className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                              <div className="text-xs font-semibold text-white truncate">
                                {formatDataLimit(plan.data_limit_display)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Data</div>
                            </div>
                            <div className="bg-black/20 rounded-md py-2 px-1">
                              <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                              <div className="text-xs font-semibold text-white">
                                {plan.max_devices}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Devices</div>
                            </div>
                            <div className="bg-black/20 rounded-md py-2 px-1">
                              <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                              <div className="text-xs font-semibold text-white truncate">
                                {formatDuration(plan.duration_display)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Duration</div>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="mt-auto pt-1">
                            <button
                              onClick={() => onPlanSelect(plan)}
                              className={`w-full py-2 rounded-lg font-semibold text-sm shadow-md transition-all duration-300 active:scale-95 ${
                                plan.isFree
                                  ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                                  : `bg-gradient-to-r ${categoryConfig.buttonColor} text-white`
                              }`}
                            >
                              {plan.isFree ? "Activate Free" : "BUY NOW"}
                            </button>

                            {!plan.isFree && (
                              <p className="text-center mt-2 text-xs text-green-400 font-medium">
                                Instant M-Pesa Payment
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <PuffLoader color="#f59e0b" size={60} />
            <p className="mt-4 text-lg font-bold text-amber-400">Loading Plans...</p>
            <p className="text-gray-500 mt-1 text-xs">Please wait</p>
          </div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 py-4 bg-white/5 rounded-xl border border-white/10"
        >
          <p className="text-sm text-gray-300">
            <CheckCircle2 className="inline w-4 h-4 text-green-400 mr-1" />
            All plans include <span className="text-amber-400 font-semibold">instant activation</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HotspotPlans;