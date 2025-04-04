// import React, { useState } from 'react';
// import { offers } from '../constants';
// import { Plus, Minus } from 'lucide-react';

// const Offers = () => {
//   const [expanded, setExpanded] = useState({});

//   const toggleExpand = (category) => {
//     setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
//   };

//   return (
//     <section className="py-16" id="offers">
//       <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
//         Pick Your Internet Vibe
//       </h2>
//       <div className="space-y-6 sm:space-y-8">
//         {offers.map((offer, index) => (
//           <div
//             key={index}
//             className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl transition-all duration-300 mx-auto max-w-4xl"
//           >
//             {/* Header with Toggle */}
//             <div
//               className="flex items-center justify-between cursor-pointer"
//               onClick={() => toggleExpand(offer.category)}
//             >
//               <h3 className="text-2xl sm:text-3xl font-semibold text-pink-300">
//                 {offer.category}
//               </h3>
//               <span className="text-pink-300">
//                 {expanded[offer.category] ? <Minus size={24} /> : <Plus size={24} />}
//               </span>
//             </div>
//             <p className="text-gray-200 mt-2 text-sm sm:text-base">{offer.description}</p>

//             {/* Collapsible Plans */}
//             {expanded[offer.category] && (
//               <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
//                 {offer.plans.map((plan, idx) => (
//                   <div
//                     key={idx}
//                     className="bg-indigo-800/50 p-4 rounded-lg hover:bg-indigo-700/70 transition-all duration-300 flex flex-col justify-between"
//                   >
//                     <div>
//                       <p className="text-lg sm:text-xl font-medium text-white">{plan.data}</p>
//                       <p className="text-sm text-gray-300 mt-1">
//                         {plan.validity} • {plan.speed}
//                       </p>
//                       <p className="text-sm text-gray-300">
//                         Devices: {plan.devices === "Unlimited" ? "Unlimited" : plan.devices}
//                       </p>
//                     </div>
//                     <button
//                       className="mt-4 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-base sm:text-lg shadow-md hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
//                     >
//                       {plan.price}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Offers;


// import React from 'react';
// import { offers } from '../constants';

// const Offers = () => {
//   return (
//     <section className="py-16" id="offers">
//       <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
//         Find Your Internet Plan
//       </h2>
//       <div className="space-y-12 sm:space-y-16">
//         {offers.map((offer, index) => (
//           <div key={index} className="max-w-4xl mx-auto">
//             <h3 className="text-3xl sm:text-4xl font-semibold text-pink-300 text-center mb-4">
//               {offer.category}
//             </h3>
//             <p className="text-gray-200 text-center text-base sm:text-lg mb-6">
//               {offer.description}
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {offer.plans.map((plan, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-white/10 backdrop-blur-lg rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
//                 >
//                   <div className="text-center">
//                     <p className="text-2xl sm:text-3xl font-bold text-white">{plan.data}</p>
//                     <p className="text-sm sm:text-base text-gray-300 mt-1">
//                       {plan.validity}
//                     </p>
//                     <p className="text-base sm:text-lg text-pink-200 mt-2">
//                       {plan.use}
//                     </p>
//                   </div>
//                   <button
//                     className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-md hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300 active:scale-95"
//                   >
//                     {plan.price}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Offers;




// import React from 'react';
// import { offers } from '../constants';

// const Offers = ({ onBuyClick, isLoggedIn }) => {
//   return (
//     <section className="py-16" id="offers">
//       <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
//         Find Your Internet Plan
//       </h2>
//       <div className="space-y-12 sm:space-y-16">
//         {offers.map((offer, index) => (
//           <div key={index} className="max-w-4xl mx-auto">
//             <h3 className="text-3xl sm:text-4xl font-semibold text-pink-300 text-center mb-4">
//               {offer.category}
//             </h3>
//             <p className="text-gray-200 text-center text-base sm:text-lg mb-6">
//               {offer.description}
//             </p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {offer.plans.map((plan, idx) => (
//                 <div
//                   key={idx}
//                   className="bg-white/10 backdrop-blur-lg rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
//                 >
//                   <div className="text-center">
//                     <p className="text-2xl sm:text-3xl font-bold text-white">{plan.data}</p>
//                     <p className="text-sm sm:text-base text-gray-300 mt-1">
//                       {plan.validity}
//                     </p>
//                     <p className="text-base sm:text-lg text-pink-200 mt-2">
//                       {plan.use}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => onBuyClick(plan)}
//                     className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-md hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300 active:scale-95"
//                   >
//                     Buy Now - {plan.price}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default Offers;




// import React from "react";

// const Offers = ({ onBuyClick, isLoggedIn, plans }) => {
//   return (
//     <section className="py-16" id="offers">
//       <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
//         Find Your Internet Plan
//       </h2>
//       <div className="space-y-12 sm:space-y-16">
//         {plans.length > 0 ? (
//           <div className="max-w-4xl mx-auto">
//             <h3 className="text-3xl sm:text-4xl font-semibold text-pink-300 text-center mb-4">
//               Available Plans
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {plans.map((plan) => (
//                 <div
//                   key={plan.id}
//                   className="bg-white/10 backdrop-blur-lg rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
//                 >
//                   <div className="text-center">
//                     <p className="text-2xl sm:text-3xl font-bold text-white">{plan.name}</p>
//                     <p className="text-base sm:text-lg text-pink-200 mt-2">Ksh {plan.price}</p>
//                     <p className="text-sm text-gray-300 mt-1">
//                       {plan.expiry.value} {plan.expiry.unit}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => onBuyClick(plan)}
//                     className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-md hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300 active:scale-95"
//                   >
//                     Buy Now - Ksh {plan.price}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <p className="text-center text-gray-200">Loading plans...</p>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Offers;






// import React from "react";
// import { PuffLoader } from "react-spinners";

// const Offers = ({ onBuyClick, isLoggedIn, plans }) => {
//   return (
//     <section className="py-16" id="offers">
//       <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
//         Find Your Internet Plan
//       </h2>
//       <div className="space-y-12 sm:space-y-16">
//         {plans.length > 0 ? (
//           <div className="max-w-4xl mx-auto">
//             <h3 className="text-3xl sm:text-4xl font-semibold text-pink-300 text-center mb-4">
//               Available Plans
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {plans.map((plan) => (
//                 <div
//                   key={plan.id}
//                   className="bg-white/10 backdrop-blur-lg rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
//                 >
//                   <div className="text-center">
//                     <p className="text-2xl sm:text-3xl font-bold text-white">{plan.name}</p>
//                     <p className="text-base sm:text-lg text-pink-200 mt-2">Ksh {plan.price}</p>
//                     <p className="text-sm text-gray-300 mt-1">
//                       {plan.expiry.value} {plan.expiry.unit}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => onBuyClick(plan)}
//                     className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-md hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300 active:scale-95"
//                   >
//                     Buy Now - Ksh {plan.price}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="text-center flex flex-col items-center justify-center">
//             <PuffLoader
//               color="#EC4899" // Pink-500
//               size={250}
//               speedMultiplier={1}
//             />
//             <p className="mt-4 text-xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse">
//               Crafting Your Perfect Plans...
//             </p>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default Offers;



import React from "react";
import { PuffLoader } from "react-spinners";
import { motion } from "framer-motion"; 

const Offers = ({ onBuyClick, isLoggedIn, plans }) => {
  // Group plans by category
  const groupedPlans = plans.reduce((acc, plan) => {
    const category = plan.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(plan);
    return acc;
  }, {});

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <section className="py-20 bg-gray-900" id="offers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-center text-white mb-12 tracking-tight"
        >
          Choose Your Perfect Plan
        </motion.h2>

        {plans.length > 0 ? (
          <div className="space-y-16">
            {Object.entries(groupedPlans).map(([category, categoryPlans]) => (
              <div key={category}>
                <h3 className="text-2xl md:text-3xl font-semibold text-center text-indigo-300 mb-4">
                  {category}
                </h3>
                <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
                  {category === "Residential" && "Ideal for everyday browsing, streaming, and staying connected."}
                  {category === "Business" && "Designed for small teams and reliable business operations."}
                  {category === "Promotional" && "Limited-time offers for maximum value and performance."}
                  {category === "Enterprise" && "Robust solutions for large-scale, high-demand networks."}
                </p>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {categoryPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-gray-700/50 hover:border-indigo-500 transition-colors duration-300 flex flex-col"
                    >
                      <div className="flex-grow text-center">
                        <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                        <p className="text-3xl font-extrabold text-indigo-300 mb-4">
                          KES {Number(plan.price).toLocaleString()}
                          <span className="text-sm font-normal text-gray-400">
                            /{plan.expiry.value} {plan.expiry.unit}
                          </span>
                        </p>
                        <ul className="text-gray-300 text-sm space-y-3 mb-6">
                          <li>
                            <span className="text-indigo-200">Data:</span> {plan.dataLimit.value} {plan.dataLimit.unit}
                          </li>
                          <li>
                            <span className="text-indigo-200">Download:</span> {plan.downloadSpeed.value} {plan.downloadSpeed.unit}
                          </li>
                          <li>
                            <span className="text-indigo-200">Upload:</span> {plan.uploadSpeed.value} {plan.uploadSpeed.unit}
                          </li>
                          <li className="text-gray-400 italic">{plan.description}</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => onBuyClick(plan)}
                        className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold text-lg shadow-md hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg transition-all duration-300 active:scale-95"
                      >
                        Get Started
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center py-16">
            <PuffLoader color="#6366F1" size={150} speedMultiplier={1} />
            <p className="mt-6 text-xl font-semibold text-gray-400">
              Loading Your Plans...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Offers;