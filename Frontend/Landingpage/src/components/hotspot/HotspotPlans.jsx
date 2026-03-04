





// import React, { useState, useMemo } from "react";
// import { motion } from "framer-motion";
// import { PuffLoader } from "react-spinners";
// import { 
//   Home, 
//   Briefcase, 
//   Star, 
//   Building, 
//   Zap, 
//   Clock, 
//   CheckCircle2, 
//   Crown, 
//   Users, 
//   Database 
// } from "lucide-react";

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

//   // Memoized data processing
//   const processedPlans = useMemo(() => 
//     plans.map(plan => ({
//       id: plan.id,
//       name: plan.name,
//       price: plan.price,
//       category: plan.category,
//       plan_type: plan.plan_type,
//       download_speed: plan.download_speed,
//       upload_speed: plan.upload_speed,
//       speed_unit: plan.speed_unit,
//       data_limit_display: plan.data_limit_display,
//       duration_display: plan.duration_display,
//       max_devices: plan.max_devices,
//       isFree: plan.plan_type === 'Free Trial' || parseFloat(plan.price || 0) === 0,
//       isPopular: plan.priority_level >= 6
//     }))
//   , [plans]);

//   const groupedPlans = useMemo(() => 
//     processedPlans.reduce((acc, plan) => {
//       const category = plan.category || "Other";
//       if (!acc[category]) acc[category] = [];
//       acc[category].push(plan);
//       return acc;
//     }, {})
//   , [processedPlans]);

//   const filteredPlans = useMemo(() => 
//     selectedCategory === "all" 
//       ? groupedPlans 
//       : { [selectedCategory]: groupedPlans[selectedCategory] || [] }
//   , [selectedCategory, groupedPlans]);

//   // Category configuration with unique colors and icons
//   const categories = [
//     { 
//       id: "all", 
//       name: "All Plans", 
//       color: "from-amber-500 to-orange-500",
//       icon: Star,
//       iconColor: "text-amber-400",
//       buttonColor: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
//     },
//     { 
//       id: "Residential", 
//       name: "Residential", 
//       color: "from-emerald-500 to-teal-500",
//       icon: Home,
//       iconColor: "text-emerald-400",
//       buttonColor: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
//     },
//     { 
//       id: "Business", 
//       name: "Business", 
//       color: "from-indigo-500 to-violet-500",
//       icon: Briefcase,
//       iconColor: "text-indigo-400",
//       buttonColor: "from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
//     },
//     { 
//       id: "Promotional", 
//       name: "Promotional", 
//       color: "from-rose-500 to-red-500",
//       icon: Star,
//       iconColor: "text-rose-400",
//       buttonColor: "from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
//     },
//     { 
//       id: "Enterprise", 
//       name: "Enterprise", 
//       color: "from-slate-600 to-gray-600",
//       icon: Building,
//       iconColor: "text-slate-400",
//       buttonColor: "from-slate-700 to-gray-700 hover:from-slate-800 hover:to-gray-800"
//     },
//   ];

//   const getCategoryDescription = (category) => {
//     const descriptions = {
//       "Residential": "Perfect for everyday browsing and streaming",
//       "Business": "Reliable connectivity for work and business",
//       "Promotional": "Special offers and limited-time deals",
//       "Enterprise": "High-performance plans for business needs"
//     };
//     return descriptions[category] || "Browse all available WiFi plans";
//   };

//   const getSpeedColor = (speed) => {
//     const num = parseInt(speed) || 0;
//     if (num >= 100) return "text-green-400";
//     if (num >= 50) return "text-yellow-400";
//     return "text-blue-400";
//   };

//   const formatDataLimit = (dataLimit) => {
//     if (!dataLimit || dataLimit.toLowerCase().includes('unlimited')) {
//       return "Unlimited";
//     }
//     return dataLimit;
//   };

//   const formatDuration = (duration) => {
//     if (!duration) return "N/A";
//     return duration.replace(/unlimited/gi, '').trim() || 'Flexible';
//   };

//   // Get category config
//   const getCategoryConfig = (category) => {
//     return categories.find(cat => cat.id === category) || categories[0];
//   };

//   return (
//     <section className="py-12 bg-black min-h-screen" id="hotspot-plans">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-10"
//         >
//           <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
//             Choose Your{" "}
//             <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
//               WiFi Plan
//             </span>
//           </h2>
//           <p className="text-base text-gray-300 max-w-2xl mx-auto">
//             Instant activation • Pay with M-Pesa • No contracts
//           </p>
//         </motion.div>

//         {/* Category Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="flex flex-wrap justify-center gap-2 mb-10"
//         >
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setSelectedCategory(cat.id)}
//               className={`px-4 py-2 rounded-full font-medium text-xs transition-all duration-300 ${
//                 selectedCategory === cat.id
//                   ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
//                   : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}
//         </motion.div>

//         {/* Plans Grid */}
//         {plans.length > 0 ? (
//           <div className="space-y-12">
//             {Object.entries(filteredPlans).map(([category, categoryPlans]) => {
//               const categoryConfig = getCategoryConfig(category);
//               const CategoryIcon = categoryConfig.icon;
              
//               return (
//                 <div key={category}>
//                   {/* Category Title */}
//                   <motion.div
//                     initial={{ opacity: 0, x: -30 }}
//                     whileInView={{ opacity: 1, x: 0 }}
//                     viewport={{ once: true }}
//                     className="text-center mb-8"
//                   >
//                     <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
//                       {category === "Promotional" ? "Special Offers" : `${category} Plans`}
//                     </h3>
//                     <p className="text-sm text-gray-400 max-w-xl mx-auto">
//                       {getCategoryDescription(category)}
//                     </p>
//                   </motion.div>

//                   {/* Cards Grid */}
//                   <motion.div
//                     variants={containerVariants}
//                     initial="hidden"
//                     whileInView="visible"
//                     viewport={{ once: true }}
//                     className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
//                   >
//                     {categoryPlans.map((plan) => (
//                       <motion.div
//                         key={plan.id}
//                         variants={cardVariants}
//                         whileHover={!plan.isFree ? "hover" : undefined}
//                         className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group overflow-hidden flex flex-col h-full"
//                       >
//                         {/* Badges */}
//                         {plan.isFree && (
//                           <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
//                             FREE TRIAL
//                           </div>
//                         )}
//                         {plan.isPopular && !plan.isFree && (
//                           <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold flex items-center gap-1">
//                             <Crown className="w-3 h-3" />
//                             POPULAR
//                           </div>
//                         )}

//                         {/* Card Content */}
//                         <div className="flex flex-col flex-1 space-y-4">
//                           {/* Header */}
//                           <div className="text-center">
//                             <div className={`w-12 h-12 bg-gradient-to-br ${categoryConfig.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
//                               <CategoryIcon className="w-6 h-6 text-white" />
//                             </div>
//                             <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
//                             <div className="text-2xl font-bold">
//                               {plan.isFree ? (
//                                 <span className="text-emerald-400">FREE</span>
//                               ) : (
//                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
//                                   KES {Number(plan.price).toLocaleString()}
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           {/* Speed Info */}
//                           <div className="flex items-center justify-around bg-black/20 rounded-lg py-2 px-3">
//                             <div className="text-center">
//                               <div className="flex items-center gap-1 justify-center mb-1">
//                                 <Zap className={`w-4 h-4 ${getSpeedColor(plan.download_speed)}`} />
//                                 <span className="text-base font-bold text-white">
//                                   {plan.download_speed || "0"}{plan.speed_unit}
//                                 </span>
//                               </div>
//                               <span className="text-xs text-gray-500">Download</span>
//                             </div>
//                             <div className="w-px h-6 bg-white/20"></div>
//                             <div className="text-center">
//                               <span className="text-base font-bold text-gray-300 block">
//                                 {plan.upload_speed || "0"}{plan.speed_unit}
//                               </span>
//                               <span className="text-xs text-gray-500">Upload</span>
//                             </div>
//                           </div>

//                           {/* Features Grid */}
//                           <div className="grid grid-cols-3 gap-2 text-center">
//                             <div className="bg-black/20 rounded-md py-2 px-1">
//                               <Database className="w-4 h-4 text-amber-400 mx-auto mb-1" />
//                               <div className="text-xs font-semibold text-white truncate">
//                                 {formatDataLimit(plan.data_limit_display)}
//                               </div>
//                               <div className="text-xs text-gray-500 mt-1">Data</div>
//                             </div>
//                             <div className="bg-black/20 rounded-md py-2 px-1">
//                               <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
//                               <div className="text-xs font-semibold text-white">
//                                 {plan.max_devices}
//                               </div>
//                               <div className="text-xs text-gray-500 mt-1">Devices</div>
//                             </div>
//                             <div className="bg-black/20 rounded-md py-2 px-1">
//                               <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
//                               <div className="text-xs font-semibold text-white truncate">
//                                 {formatDuration(plan.duration_display)}
//                               </div>
//                               <div className="text-xs text-gray-500 mt-1">Duration</div>
//                             </div>
//                           </div>

//                           {/* CTA Button */}
//                           <div className="mt-auto pt-1">
//                             <button
//                               onClick={() => onPlanSelect(plan)}
//                               className={`w-full py-2 rounded-lg font-semibold text-sm shadow-md transition-all duration-300 active:scale-95 ${
//                                 plan.isFree
//                                   ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
//                                   : `bg-gradient-to-r ${categoryConfig.buttonColor} text-white`
//                               }`}
//                             >
//                               {plan.isFree ? "Activate Free" : "BUY NOW"}
//                             </button>

//                             {!plan.isFree && (
//                               <p className="text-center mt-2 text-xs text-green-400 font-medium">
//                                 Instant M-Pesa Payment
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </motion.div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-16">
//             <PuffLoader color="#f59e0b" size={60} />
//             <p className="mt-4 text-lg font-bold text-amber-400">Loading Plans...</p>
//             <p className="text-gray-500 mt-1 text-xs">Please wait</p>
//           </div>
//         )}

//         {/* Footer Note */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           className="text-center mt-12 py-4 bg-white/5 rounded-xl border border-white/10"
//         >
//           <p className="text-sm text-gray-300">
//             <CheckCircle2 className="inline w-4 h-4 text-green-400 mr-1" />
//             All plans include <span className="text-amber-400 font-semibold">instant activation</span>
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

  // Memoized data processing - maps backend plan structure to frontend display
  const processedPlans = useMemo(() => 
    plans.map(plan => {
      // Extract hotspot-specific config from access_methods
      const hotspotConfig = plan.access_methods?.hotspot || {};
      
      return {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        category: plan.category,
        plan_type: plan.plan_type,
        
        // Speed information
        download_speed: hotspotConfig.download_speed?.value || plan.download_speed || '10',
        upload_speed: hotspotConfig.upload_speed?.value || plan.upload_speed || '5',
        speed_unit: hotspotConfig.download_speed?.unit || plan.speed_unit || 'mbps',
        
        // Data limit display
        data_limit_display: `${hotspotConfig.data_limit?.value || '10'} ${hotspotConfig.data_limit?.unit || 'gb'}`,
        
        // Duration display
        duration_display: `${hotspotConfig.validity_period?.value || '30'} ${hotspotConfig.validity_period?.unit || 'days'}`,
        
        // Device limit
        max_devices: hotspotConfig.max_devices || 1,
        
        // Plan flags
        isFree: plan.plan_type === 'Free_trial' || parseFloat(plan.price || 0) === 0,
        isPopular: plan.priority_level >= 6,
        
        // Keep full config for reference
        full_config: plan
      };
    })
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
        {Object.keys(filteredPlans).length > 0 ? (
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
                                  {plan.download_speed}{plan.speed_unit}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">Download</span>
                            </div>
                            <div className="w-px h-6 bg-white/20"></div>
                            <div className="text-center">
                              <span className="text-base font-bold text-gray-300 block">
                                {plan.upload_speed}{plan.speed_unit}
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