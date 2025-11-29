// import React from "react";
// import { motion } from "framer-motion";
// import { Network, Zap, Clock, CheckCircle2, Shield, Users } from "lucide-react";

// const PPPoEPlans = ({ plans, onPlanSelect, clientData }) => {
//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//     hover: { scale: 1.02, transition: { duration: 0.2 } }
//   };

//   const hasActivePlan = clientData?.current_plan;

//   const getPlanFeatures = (plan) => {
//     const features = [];
    
//     if (plan.access_methods?.pppoe?.enabled) {
//       if (plan.access_methods.pppoe.downloadSpeed) {
//         features.push({
//           icon: <Zap className="w-4 h-4 text-yellow-400" />,
//           text: `Download: ${plan.access_methods.pppoe.downloadSpeed.value} ${plan.access_methods.pppoe.downloadSpeed.unit}`,
//           highlight: true
//         });
//       }
      
//       if (plan.access_methods.pppoe.uploadSpeed) {
//         features.push({
//           icon: <Zap className="w-4 h-4 text-blue-400" />,
//           text: `Upload: ${plan.access_methods.pppoe.uploadSpeed.value} ${plan.access_methods.pppoe.uploadSpeed.unit}`
//         });
//       }
      
//       if (plan.access_methods.pppoe.dataLimit) {
//         features.push({
//           icon: <Shield className="w-4 h-4 text-green-400" />,
//           text: `Data: ${plan.access_methods.pppoe.dataLimit.value} ${plan.access_methods.pppoe.dataLimit.unit}`
//         });
//       }
      
//       if (plan.access_methods.pppoe.validityPeriod) {
//         features.push({
//           icon: <Clock className="w-4 h-4 text-purple-400" />,
//           text: `Valid: ${plan.access_methods.pppoe.validityPeriod.value} ${plan.access_methods.pppoe.validityPeriod.unit}`
//         });
//       }
//     }
    
//     return features;
//   };

//   const getPlanLevel = (plan) => {
//     if (plan.category === "Enterprise") return "enterprise";
//     if (plan.category === "Business") return "business";
//     if (plan.category === "Residential") return "residential";
//     return "standard";
//   };

//   const getPlanColor = (level) => {
//     switch (level) {
//       case "enterprise":
//         return "from-purple-500 to-indigo-600";
//       case "business":
//         return "from-blue-500 to-cyan-600";
//       case "residential":
//         return "from-green-500 to-emerald-600";
//       default:
//         return "from-gray-500 to-blue-600";
//     }
//   };

//   const getPlanBadge = (level) => {
//     switch (level) {
//       case "enterprise":
//         return { text: "ENTERPRISE", color: "bg-gradient-to-r from-purple-500 to-indigo-500" };
//       case "business":
//         return { text: "BUSINESS", color: "bg-gradient-to-r from-blue-500 to-cyan-500" };
//       case "residential":
//         return { text: "RESIDENTIAL", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
//       default:
//         return { text: "STANDARD", color: "bg-gradient-to-r from-gray-500 to-blue-500" };
//     }
//   };

//   return (
//     <section id="pppoe-plans" className="py-12">
//       <div className="text-center mb-12">
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl font-bold text-white mb-4"
//         >
//           PPPoE Internet Plans
//         </motion.h2>
//         <motion.p
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="text-blue-200 text-lg max-w-2xl mx-auto"
//         >
//           High-speed wired internet plans for reliable PPPoE connections. 
//           Perfect for homes, offices, and enterprises.
//         </motion.p>
//       </div>

//       {hasActivePlan && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-8 max-w-4xl mx-auto"
//         >
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
//               <CheckCircle2 className="w-6 h-6 text-green-400" />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-white font-semibold text-lg">Active Plan</h3>
//               <p className="text-green-200">
//                 You currently have the <strong className="text-white">{clientData.current_plan}</strong> active. 
//                 Purchase a new plan to extend or upgrade your PPPoE service.
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
//         {plans.map((plan, index) => {
//           const planLevel = getPlanLevel(plan);
//           const planColor = getPlanColor(planLevel);
//           const planBadge = getPlanBadge(planLevel);
//           const features = getPlanFeatures(plan);
//           const isCurrentPlan = hasActivePlan && clientData.current_plan === plan.name;

//           return (
//             <motion.div
//               key={plan.id}
//               variants={cardVariants}
//               initial="hidden"
//               animate="visible"
//               whileHover="hover"
//               transition={{ delay: index * 0.1 }}
//               className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 relative overflow-hidden ${
//                 isCurrentPlan ? 'ring-2 ring-green-400' : ''
//               }`}
//             >
//               {/* Plan Badge */}
//               <div className={`absolute top-0 right-0 ${planBadge.color} text-white px-4 py-1 rounded-bl-lg text-xs font-bold`}>
//                 {planBadge.text}
//               </div>

//               {/* Current Plan Indicator */}
//               {isCurrentPlan && (
//                 <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 rounded-br-lg text-xs font-bold flex items-center gap-1">
//                   <CheckCircle2 className="w-3 h-3" />
//                   CURRENT
//                 </div>
//               )}

//               <div className="text-center mb-6 pt-4">
//                 <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
//                   <Network className="w-6 h-6 text-blue-300" />
//                 </div>
//                 <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
//                 <p className="text-blue-200 text-sm">{plan.description}</p>
//               </div>

//               <div className="text-center mb-6">
//                 <span className="text-3xl font-bold text-white">
//                   KES {Number(plan.price).toLocaleString()}
//                 </span>
//                 <span className="text-blue-200 text-sm block mt-1">
//                   {plan.duration_display || 'Monthly'}
//                 </span>
//               </div>

//               {/* Plan Features */}
//               <div className="space-y-3 mb-6">
//                 {features.map((feature, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex items-center justify-between text-sm p-2 rounded-lg ${
//                       feature.highlight ? 'bg-white/5 border border-white/10' : ''
//                     }`}
//                   >
//                     <span className="text-blue-200 flex items-center gap-2">
//                       {feature.icon}
//                       {feature.text.split(':')[0]}:
//                     </span>
//                     <span className="text-white font-medium">
//                       {feature.text.split(':')[1]}
//                     </span>
//                   </div>
//                 ))}
                
//                 {/* Additional Features */}
//                 <div className="flex items-center justify-between text-sm p-2">
//                   <span className="text-blue-200 flex items-center gap-2">
//                     <Users className="w-4 h-4 text-gray-400" />
//                     Connection:
//                   </span>
//                   <span className="text-white font-medium flex items-center gap-1">
//                     <Network className="w-4 h-4 text-blue-300" />
//                     PPPoE
//                   </span>
//                 </div>
                
//                 <div className="flex items-center justify-between text-sm p-2">
//                   <span className="text-blue-200 flex items-center gap-2">
//                     <Shield className="w-4 h-4 text-green-400" />
//                     Support:
//                   </span>
//                   <span className="text-white font-medium">24/7</span>
//                 </div>
//               </div>

//               <button
//                 onClick={() => onPlanSelect(plan)}
//                 disabled={isCurrentPlan}
//                 className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
//                   isCurrentPlan
//                     ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
//                     : `bg-gradient-to-r ${planColor} text-white hover:shadow-lg hover:shadow-blue-500/25`
//                 }`}
//               >
//                 <CheckCircle2 className="w-4 h-4" />
//                 {isCurrentPlan ? 'Current Plan' : hasActivePlan ? 'Upgrade Plan' : 'Get Started'}
//               </button>

//               {/* M-Pesa Ready Badge */}
//               {!isCurrentPlan && plan.price > 0 && (
//                 <div className="text-center mt-3">
//                   <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
//                     ✓ M-Pesa & Bank Transfer
//                   </span>
//                 </div>
//               )}
//             </motion.div>
//           );
//         })}
//       </div>

//       {plans.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center py-12"
//         >
//           <Network className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
//           <h3 className="text-xl font-semibold text-white mb-2">No PPPoE Plans Available</h3>
//           <p className="text-blue-200 max-w-md mx-auto">
//             We're currently updating our PPPoE plan offerings. Please check back later or contact support for enterprise solutions.
//           </p>
//         </motion.div>
//       )}

//       {/* Support Information */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5 }}
//         className="text-center mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-4xl mx-auto"
//       >
//         <div className="flex items-center justify-center gap-3 text-gray-300 mb-3">
//           <Shield className="w-5 h-5 text-blue-400" />
//           <h4 className="text-white font-semibold">PPPoE Connection Support</h4>
//         </div>
//         <p className="text-blue-200 text-sm">
//           Need help with PPPoE configuration? Our support team can assist with router setup and connection issues. 
//           Contact us for dedicated PPPoE support.
//         </p>
//       </motion.div>
//     </section>
//   );
// };

// export default PPPoEPlans;













// import React from "react";
// import { motion } from "framer-motion";
// import { Network, Zap, Clock, CheckCircle2, Shield, Users } from "lucide-react";

// const PPPoEPlans = ({ plans, onPlanSelect, clientData }) => {
//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//     hover: { scale: 1.02, transition: { duration: 0.2 } }
//   };

//   const hasActivePlan = clientData?.current_plan;

//   const getPlanFeatures = (plan) => {
//     const features = [];
    
//     if (plan.speed) {
//       features.push({
//         icon: <Zap className="w-4 h-4 text-yellow-400" />,
//         text: `Speed: ${plan.speed}`,
//         highlight: true
//       });
//     }
    
//     if (plan.data_limit) {
//       features.push({
//         icon: <Shield className="w-4 h-4 text-green-400" />,
//         text: `Data: ${plan.data_limit}`
//       });
//     }
    
//     if (plan.duration_days) {
//       features.push({
//         icon: <Clock className="w-4 h-4 text-purple-400" />,
//         text: `Duration: ${plan.duration_days} days`
//       });
//     }
    
//     // Add PPPoE specific features
//     features.push({
//       icon: <Network className="w-4 h-4 text-blue-400" />,
//       text: 'PPPoE Connection'
//     });
    
//     if (plan.features && Array.isArray(plan.features)) {
//       plan.features.forEach(feature => {
//         features.push({
//           icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
//           text: feature
//         });
//       });
//     }
    
//     return features;
//   };

//   const getPlanLevel = (plan) => {
//     if (plan.category === "premium") return "enterprise";
//     if (plan.category === "business") return "business";
//     if (plan.category === "residential") return "residential";
//     return "standard";
//   };

//   const getPlanColor = (level) => {
//     switch (level) {
//       case "enterprise":
//         return "from-purple-500 to-indigo-600";
//       case "business":
//         return "from-blue-500 to-cyan-600";
//       case "residential":
//         return "from-green-500 to-emerald-600";
//       default:
//         return "from-gray-500 to-blue-600";
//     }
//   };

//   const getPlanBadge = (level) => {
//     switch (level) {
//       case "enterprise":
//         return { text: "PREMIUM", color: "bg-gradient-to-r from-purple-500 to-indigo-500" };
//       case "business":
//         return { text: "BUSINESS", color: "bg-gradient-to-r from-blue-500 to-cyan-500" };
//       case "residential":
//         return { text: "RESIDENTIAL", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
//       default:
//         return { text: "STANDARD", color: "bg-gradient-to-r from-gray-500 to-blue-500" };
//     }
//   };

//   return (
//     <section id="pppoe-plans" className="py-12">
//       <div className="text-center mb-12">
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl font-bold text-white mb-4"
//         >
//           PPPoE Internet Plans
//         </motion.h2>
//         <motion.p
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="text-blue-200 text-lg max-w-2xl mx-auto"
//         >
//           High-speed wired internet plans for reliable PPPoE connections. 
//           Perfect for homes, offices, and enterprises.
//         </motion.p>
//       </div>

//       {hasActivePlan && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-8 max-w-4xl mx-auto"
//         >
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
//               <CheckCircle2 className="w-6 h-6 text-green-400" />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-white font-semibold text-lg">Active Plan</h3>
//               <p className="text-green-200">
//                 You currently have an active PPPoE plan. 
//                 Purchase a new plan to extend or upgrade your PPPoE service.
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
//         {plans.map((plan, index) => {
//           const planLevel = getPlanLevel(plan);
//           const planColor = getPlanColor(planLevel);
//           const planBadge = getPlanBadge(planLevel);
//           const features = getPlanFeatures(plan);

//           return (
//             <motion.div
//               key={plan.id}
//               variants={cardVariants}
//               initial="hidden"
//               animate="visible"
//               whileHover="hover"
//               transition={{ delay: index * 0.1 }}
//               className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 relative overflow-hidden"
//             >
//               {/* Plan Badge */}
//               <div className={`absolute top-0 right-0 ${planBadge.color} text-white px-4 py-1 rounded-bl-lg text-xs font-bold`}>
//                 {planBadge.text}
//               </div>

//               <div className="text-center mb-6 pt-4">
//                 <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
//                   <Network className="w-6 h-6 text-blue-300" />
//                 </div>
//                 <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
//                 <p className="text-blue-200 text-sm">{plan.description}</p>
//               </div>

//               <div className="text-center mb-6">
//                 <span className="text-3xl font-bold text-white">
//                   KES {Number(plan.price).toLocaleString()}
//                 </span>
//                 <span className="text-blue-200 text-sm block mt-1">
//                   {plan.duration_days ? `Valid for ${plan.duration_days} days` : 'Monthly'}
//                 </span>
//               </div>

//               {/* Plan Features */}
//               <div className="space-y-3 mb-6">
//                 {features.slice(0, 6).map((feature, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex items-center gap-3 text-sm p-2 rounded-lg ${
//                       feature.highlight ? 'bg-white/5 border border-white/10' : ''
//                     }`}
//                   >
//                     {feature.icon}
//                     <span className="text-blue-200">{feature.text}</span>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => onPlanSelect(plan)}
//                 className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r ${planColor} text-white hover:shadow-lg hover:shadow-blue-500/25`}
//               >
//                 <CheckCircle2 className="w-4 h-4" />
//                 {hasActivePlan ? 'Upgrade Plan' : 'Get Started'}
//               </button>

//               {/* M-Pesa Ready Badge */}
//               {plan.price > 0 && (
//                 <div className="text-center mt-3">
//                   <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
//                     ✓ M-Pesa & Bank Transfer
//                   </span>
//                 </div>
//               )}
//             </motion.div>
//           );
//         })}
//       </div>

//       {plans.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center py-12"
//         >
//           <Network className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
//           <h3 className="text-xl font-semibold text-white mb-2">No PPPoE Plans Available</h3>
//           <p className="text-blue-200 max-w-md mx-auto">
//             We're currently updating our PPPoE plan offerings. Please check back later or contact support for enterprise solutions.
//           </p>
//         </motion.div>
//       )}

//       {/* Support Information */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5 }}
//         className="text-center mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-4xl mx-auto"
//       >
//         <div className="flex items-center justify-center gap-3 text-gray-300 mb-3">
//           <Shield className="w-5 h-5 text-blue-400" />
//           <h4 className="text-white font-semibold">PPPoE Connection Support</h4>
//         </div>
//         <p className="text-blue-200 text-sm">
//           Need help with PPPoE configuration? Our support team can assist with router setup and connection issues. 
//           Contact us for dedicated PPPoE support.
//         </p>
//       </motion.div>
//     </section>
//   );
// };

// export default PPPoEPlans;








// import React from "react";
// import { motion } from "framer-motion";
// import { Network, Zap, Clock, CheckCircle2, Shield, Users, Database, Wifi } from "lucide-react";

// const PPPoEPlans = ({ plans, onPlanSelect, clientData }) => {
//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//     hover: { scale: 1.02, transition: { duration: 0.2 } }
//   };

//   const hasActivePlan = clientData?.current_plan;

//   // Extract PPPoE-specific data from access_methods JSON
//   const getPPPoEPlanData = (plan) => {
//     if (!plan.access_methods?.pppoe) {
//       return {
//         enabled: false,
//         downloadSpeed: "0 Mbps",
//         uploadSpeed: "0 Mbps",
//         dataLimit: "Unlimited",
//         duration: "N/A",
//         maxDevices: 1
//       };
//     }

//     const pppoe = plan.access_methods.pppoe;
//     return {
//       enabled: pppoe.enabled,
//       downloadSpeed: `${pppoe.downloadSpeed?.value || "0"} ${pppoe.downloadSpeed?.unit || "Mbps"}`,
//       uploadSpeed: `${pppoe.uploadSpeed?.value || "0"} ${pppoe.uploadSpeed?.unit || "Mbps"}`,
//       dataLimit: pppoe.dataLimit?.value ? `${pppoe.dataLimit.value} ${pppoe.dataLimit.unit}` : "Unlimited",
//       duration: pppoe.validityPeriod?.value ? `${pppoe.validityPeriod.value} ${pppoe.validityPeriod.unit}` : "Flexible",
//       maxDevices: pppoe.maxDevices || 1,
//       usageLimit: pppoe.usageLimit?.value ? `${pppoe.usageLimit.value} ${pppoe.usageLimit.unit}` : "Unlimited",
//       mtu: pppoe.mtu || 1492,
//       dnsServers: pppoe.dnsServers || ["8.8.8.8", "1.1.1.1"]
//     };
//   };

//   const getPlanFeatures = (plan) => {
//     const pppoeData = getPPPoEPlanData(plan);
//     const features = [];
    
//     if (pppoeData.enabled) {
//       // Speed features
//       if (pppoeData.downloadSpeed !== "0 Mbps") {
//         features.push({
//           icon: <Zap className="w-4 h-4 text-yellow-400" />,
//           text: `Download: ${pppoeData.downloadSpeed}`,
//           highlight: true
//         });
//       }
      
//       if (pppoeData.uploadSpeed !== "0 Mbps") {
//         features.push({
//           icon: <Zap className="w-4 h-4 text-blue-400" />,
//           text: `Upload: ${pppoeData.uploadSpeed}`,
//           highlight: true
//         });
//       }
      
//       // Data limit
//       features.push({
//         icon: <Database className="w-4 h-4 text-green-400" />,
//         text: `Data: ${pppoeData.dataLimit}`
//       });
      
//       // Duration
//       features.push({
//         icon: <Clock className="w-4 h-4 text-purple-400" />,
//         text: `Duration: ${pppoeData.duration}`
//       });
      
//       // Devices
//       features.push({
//         icon: <Users className="w-4 h-4 text-indigo-400" />,
//         text: `Max Devices: ${pppoeData.maxDevices}`
//       });
      
//       // PPPoE specific
//       features.push({
//         icon: <Network className="w-4 h-4 text-blue-400" />,
//         text: 'PPPoE Connection'
//       });
      
//       // Usage limit if specified
//       if (pppoeData.usageLimit !== "Unlimited") {
//         features.push({
//           icon: <Shield className="w-4 h-4 text-amber-400" />,
//           text: `Usage: ${pppoeData.usageLimit}`
//         });
//       }
//     } else {
//       // Plan doesn't have PPPoE enabled
//       features.push({
//         icon: <Wifi className="w-4 h-4 text-gray-400" />,
//         text: 'Hotspot Only',
//         highlight: false
//       });
//     }
    
//     return features;
//   };

//   const getPlanLevel = (plan) => {
//     // Use the same logic as HotspotPlans
//     if (plan.category === "Enterprise") return "enterprise";
//     if (plan.category === "Business") return "business";
//     if (plan.category === "Residential") return "residential";
//     if (plan.category === "Promotional") return "promotional";
//     return "standard";
//   };

//   const getPlanColor = (level) => {
//     switch (level) {
//       case "enterprise":
//         return "from-purple-500 to-indigo-600";
//       case "business":
//         return "from-blue-500 to-cyan-600";
//       case "residential":
//         return "from-green-500 to-emerald-600";
//       case "promotional":
//         return "from-amber-500 to-orange-600";
//       default:
//         return "from-gray-500 to-blue-600";
//     }
//   };

//   const getPlanBadge = (level) => {
//     switch (level) {
//       case "enterprise":
//         return { text: "ENTERPRISE", color: "bg-gradient-to-r from-purple-500 to-indigo-500" };
//       case "business":
//         return { text: "BUSINESS", color: "bg-gradient-to-r from-blue-500 to-cyan-500" };
//       case "residential":
//         return { text: "RESIDENTIAL", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
//       case "promotional":
//         return { text: "PROMOTIONAL", color: "bg-gradient-to-r from-amber-500 to-orange-500" };
//       default:
//         return { text: "STANDARD", color: "bg-gradient-to-r from-gray-500 to-blue-500" };
//     }
//   };

//   // Filter plans to only show those with PPPoE enabled
//   const pppoePlans = plans.filter(plan => {
//     const pppoeData = getPPPoEPlanData(plan);
//     return pppoeData.enabled;
//   });

//   return (
//     <section id="pppoe-plans" className="py-12">
//       <div className="text-center mb-12">
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl font-bold text-white mb-4"
//         >
//           PPPoE Internet Plans
//         </motion.h2>
//         <motion.p
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="text-blue-200 text-lg max-w-2xl mx-auto"
//         >
//           High-speed wired internet plans for reliable PPPoE connections. 
//           Perfect for homes, offices, and enterprises.
//         </motion.p>
//       </div>

//       {hasActivePlan && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-8 max-w-4xl mx-auto"
//         >
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
//               <CheckCircle2 className="w-6 h-6 text-green-400" />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-white font-semibold text-lg">Active Plan</h3>
//               <p className="text-green-200">
//                 You currently have an active PPPoE plan. 
//                 Purchase a new plan to extend or upgrade your PPPoE service.
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
//         {pppoePlans.map((plan, index) => {
//           const planLevel = getPlanLevel(plan);
//           const planColor = getPlanColor(planLevel);
//           const planBadge = getPlanBadge(planLevel);
//           const features = getPlanFeatures(plan);
//           const pppoeData = getPPPoEPlanData(plan);
//           const isFree = plan.plan_type === "Free Trial" || parseFloat(plan.price || 0) === 0;

//           return (
//             <motion.div
//               key={plan.id}
//               variants={cardVariants}
//               initial="hidden"
//               animate="visible"
//               whileHover="hover"
//               transition={{ delay: index * 0.1 }}
//               className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 relative overflow-hidden"
//             >
//               {/* Plan Badge */}
//               <div className={`absolute top-0 right-0 ${planBadge.color} text-white px-4 py-1 rounded-bl-lg text-xs font-bold`}>
//                 {planBadge.text}
//               </div>

//               {/* Free Trial Badge */}
//               {isFree && (
//                 <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1 rounded-br-lg text-xs font-bold">
//                   FREE TRIAL
//                 </div>
//               )}

//               <div className="text-center mb-6 pt-4">
//                 <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
//                   <Network className="w-6 h-6 text-blue-300" />
//                 </div>
//                 <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
//                 <p className="text-blue-200 text-sm">{plan.description}</p>
//               </div>

//               <div className="text-center mb-6">
//                 <span className="text-3xl font-bold text-white">
//                   {isFree ? "FREE" : `KES ${Number(plan.price).toLocaleString()}`}
//                 </span>
//                 <span className="text-blue-200 text-sm block mt-1">
//                   {pppoeData.duration}
//                 </span>
//               </div>

//               {/* Speed Summary */}
//               <div className="flex justify-around mb-6 bg-white/5 rounded-lg py-3 px-2">
//                 <div className="text-center">
//                   <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
//                   <div className="text-sm font-semibold text-white">
//                     {pppoeData.downloadSpeed}
//                   </div>
//                   <div className="text-xs text-gray-400">Download</div>
//                 </div>
//                 <div className="text-center">
//                   <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
//                   <div className="text-sm font-semibold text-white">
//                     {pppoeData.uploadSpeed}
//                   </div>
//                   <div className="text-xs text-gray-400">Upload</div>
//                 </div>
//               </div>

//               {/* Plan Features */}
//               <div className="space-y-3 mb-6">
//                 {features.slice(0, 5).map((feature, idx) => (
//                   <div
//                     key={idx}
//                     className={`flex items-center gap-3 text-sm p-2 rounded-lg ${
//                       feature.highlight ? 'bg-white/5 border border-white/10' : ''
//                     }`}
//                   >
//                     {feature.icon}
//                     <span className="text-blue-200 text-xs">{feature.text}</span>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={() => onPlanSelect(plan)}
//                 className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
//                   isFree 
//                     ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
//                     : `bg-gradient-to-r ${planColor} hover:shadow-lg hover:shadow-blue-500/25`
//                 } text-white`}
//               >
//                 <CheckCircle2 className="w-4 h-4" />
//                 {isFree ? 'Activate Free' : (hasActivePlan ? 'Upgrade Plan' : 'Get Started')}
//               </button>

//               {/* Payment Methods */}
//               {!isFree && (
//                 <div className="text-center mt-3">
//                   <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
//                     ✓ M-Pesa & Bank Transfer
//                   </span>
//                 </div>
//               )}
//             </motion.div>
//           );
//         })}
//       </div>

//       {pppoePlans.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center py-12"
//         >
//           <Network className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
//           <h3 className="text-xl font-semibold text-white mb-2">No PPPoE Plans Available</h3>
//           <p className="text-blue-200 max-w-md mx-auto">
//             We're currently updating our PPPoE plan offerings. Please check back later or contact support for enterprise solutions.
//           </p>
//         </motion.div>
//       )}

//       {/* Support Information */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5 }}
//         className="text-center mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-4xl mx-auto"
//       >
//         <div className="flex items-center justify-center gap-3 text-gray-300 mb-3">
//           <Shield className="w-5 h-5 text-blue-400" />
//           <h4 className="text-white font-semibold">PPPoE Connection Support</h4>
//         </div>
//         <p className="text-blue-200 text-sm">
//           Need help with PPPoE configuration? Our support team can assist with router setup and connection issues. 
//           Contact us for dedicated PPPoE support.
//         </p>
//       </motion.div>
//     </section>
//   );
// };

// export default PPPoEPlans;








import React from "react";
import { motion } from "framer-motion";
import { Network, Zap, Clock, CheckCircle2, Shield, Users, Database, Wifi, Star } from "lucide-react";

const PPPoEPlans = ({ plans, onPlanSelect, clientData }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const hasActivePlan = clientData?.current_plan;

  const getPPPoEPlanData = (plan) => {
    if (!plan.access_methods?.pppoe) {
      return {
        enabled: false,
        downloadSpeed: "0 Mbps",
        uploadSpeed: "0 Mbps",
        dataLimit: "Unlimited",
        duration: "N/A",
        maxDevices: 1
      };
    }

    const pppoe = plan.access_methods.pppoe;
    return {
      enabled: pppoe.enabled,
      downloadSpeed: `${pppoe.downloadSpeed?.value || "0"} ${pppoe.downloadSpeed?.unit || "Mbps"}`,
      uploadSpeed: `${pppoe.uploadSpeed?.value || "0"} ${pppoe.uploadSpeed?.unit || "Mbps"}`,
      dataLimit: pppoe.dataLimit?.value ? `${pppoe.dataLimit.value} ${pppoe.dataLimit.unit}` : "Unlimited",
      duration: pppoe.validityPeriod?.value ? `${pppoe.validityPeriod.value} ${pppoe.validityPeriod.unit}` : "Flexible",
      maxDevices: pppoe.maxDevices || 1,
      usageLimit: pppoe.usageLimit?.value ? `${pppoe.usageLimit.value} ${pppoe.usageLimit.unit}` : "Unlimited"
    };
  };

  const getPlanFeatures = (plan) => {
    const pppoeData = getPPPoEPlanData(plan);
    const features = [];
    
    if (pppoeData.enabled) {
      features.push({
        icon: <Zap className="w-4 h-4 text-yellow-400" />,
        text: `Download: ${pppoeData.downloadSpeed}`,
        highlight: true
      });
      
      features.push({
        icon: <Zap className="w-4 h-4 text-blue-400" />,
        text: `Upload: ${pppoeData.uploadSpeed}`,
        highlight: true
      });
      
      features.push({
        icon: <Database className="w-4 h-4 text-green-400" />,
        text: `Data: ${pppoeData.dataLimit}`
      });
      
      features.push({
        icon: <Clock className="w-4 h-4 text-purple-400" />,
        text: `Duration: ${pppoeData.duration}`
      });
      
      features.push({
        icon: <Users className="w-4 h-4 text-indigo-400" />,
        text: `Max Devices: ${pppoeData.maxDevices}`
      });
      
      features.push({
        icon: <Network className="w-4 h-4 text-blue-400" />,
        text: 'PPPoE Connection'
      });
    }
    
    return features;
  };

  const getPlanLevel = (plan) => {
    if (plan.category === "Enterprise") return "enterprise";
    if (plan.category === "Business") return "business";
    if (plan.category === "Residential") return "residential";
    if (plan.category === "Promotional") return "promotional";
    return "standard";
  };

  const getPlanColor = (level) => {
    switch (level) {
      case "enterprise":
        return "from-purple-500 to-indigo-600";
      case "business":
        return "from-blue-500 to-cyan-600";
      case "residential":
        return "from-green-500 to-emerald-600";
      case "promotional":
        return "from-amber-500 to-orange-600";
      default:
        return "from-gray-500 to-blue-600";
    }
  };

  const getPlanBadge = (level) => {
    switch (level) {
      case "enterprise":
        return { text: "ENTERPRISE", color: "bg-gradient-to-r from-purple-500 to-indigo-500" };
      case "business":
        return { text: "BUSINESS", color: "bg-gradient-to-r from-blue-500 to-cyan-500" };
      case "residential":
        return { text: "RESIDENTIAL", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
      case "promotional":
        return { text: "PROMOTIONAL", color: "bg-gradient-to-r from-amber-500 to-orange-500" };
      default:
        return { text: "STANDARD", color: "bg-gradient-to-r from-gray-500 to-blue-500" };
    }
  };

  // Filter plans to only show those with PPPoE enabled
  const pppoePlans = plans.filter(plan => {
    const pppoeData = getPPPoEPlanData(plan);
    return pppoeData.enabled;
  });

  return (
    <section id="pppoe-plans" className="py-12">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-4"
        >
          PPPoE Internet Plans
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-blue-200 text-lg max-w-2xl mx-auto"
        >
          High-speed wired internet plans for reliable PPPoE connections. 
          Perfect for homes, offices, and enterprises.
        </motion.p>
      </div>

      {hasActivePlan && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/20 border border-green-400/30 rounded-2xl p-6 mb-8 max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg">Active Plan</h3>
              <p className="text-green-200">
                You currently have an active PPPoE plan. 
                Purchase a new plan to extend or upgrade your PPPoE service.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pppoePlans.map((plan, index) => {
          const planLevel = getPlanLevel(plan);
          const planColor = getPlanColor(planLevel);
          const planBadge = getPlanBadge(planLevel);
          const features = getPlanFeatures(plan);
          const pppoeData = getPPPoEPlanData(plan);
          const isFree = plan.plan_type === "Free Trial" || parseFloat(plan.price || 0) === 0;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 relative overflow-hidden"
            >
              {/* Plan Badge */}
              <div className={`absolute top-0 right-0 ${planBadge.color} text-white px-4 py-1 rounded-bl-lg text-xs font-bold`}>
                {planBadge.text}
              </div>

              {/* Free Trial Badge */}
              {isFree && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-1 rounded-br-lg text-xs font-bold">
                  FREE TRIAL
                </div>
              )}

              <div className="text-center mb-6 pt-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                  <Network className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-blue-200 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-white">
                  {isFree ? "FREE" : `KES ${Number(plan.price).toLocaleString()}`}
                </span>
                <span className="text-blue-200 text-sm block mt-1">
                  {pppoeData.duration}
                </span>
              </div>

              {/* Speed Summary */}
              <div className="flex justify-around mb-6 bg-white/5 rounded-lg py-3 px-2">
                <div className="text-center">
                  <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-white">
                    {pppoeData.downloadSpeed}
                  </div>
                  <div className="text-xs text-gray-400">Download</div>
                </div>
                <div className="text-center">
                  <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-white">
                    {pppoeData.uploadSpeed}
                  </div>
                  <div className="text-xs text-gray-400">Upload</div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="space-y-3 mb-6">
                {features.slice(0, 5).map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-sm p-2 rounded-lg ${
                      feature.highlight ? 'bg-white/5 border border-white/10' : ''
                    }`}
                  >
                    {feature.icon}
                    <span className="text-blue-200 text-xs">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onPlanSelect(plan)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isFree 
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                    : `bg-gradient-to-r ${planColor} hover:shadow-lg hover:shadow-blue-500/25`
                } text-white`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isFree ? 'Activate Free' : (hasActivePlan ? 'Upgrade Plan' : 'Get Started')}
              </button>

              {/* Payment Methods */}
              {!isFree && (
                <div className="text-center mt-3">
                  <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">
                    ✓ M-Pesa & Bank Transfer
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {pppoePlans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Network className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No PPPoE Plans Available</h3>
          <p className="text-blue-200 max-w-md mx-auto">
            We're currently updating our PPPoE plan offerings. Please check back later or contact support for enterprise solutions.
          </p>
        </motion.div>
      )}

      {/* Support Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3 text-gray-300 mb-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <h4 className="text-white font-semibold">PPPoE Connection Support</h4>
        </div>
        <p className="text-blue-200 text-sm">
          Need help with PPPoE configuration? Our support team can assist with router setup and connection issues. 
          Contact us for dedicated PPPoE support.
        </p>
      </motion.div>
    </section>
  );
};

export default PPPoEPlans;