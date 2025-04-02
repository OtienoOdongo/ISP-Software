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






import React from "react";
import { PuffLoader } from "react-spinners";

const Offers = ({ onBuyClick, isLoggedIn, plans }) => {
  return (
    <section className="py-16" id="offers">
      <h2 className="text-4xl sm:text-5xl font-bold text-center text-white mb-12 animate-fade-in">
        Find Your Internet Plan
      </h2>
      <div className="space-y-12 sm:space-y-16">
        {plans.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-semibold text-pink-300 text-center mb-4">
              Available Plans
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center"
                >
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-white">{plan.name}</p>
                    <p className="text-base sm:text-lg text-pink-200 mt-2">Ksh {plan.price}</p>
                    <p className="text-sm text-gray-300 mt-1">
                      {plan.expiry.value} {plan.expiry.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => onBuyClick(plan)}
                    className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-md hover:from-pink-600 hover:to-purple-600 hover:shadow-lg transition-all duration-300 active:scale-95"
                  >
                    Buy Now - Ksh {plan.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center justify-center">
            <PuffLoader
              color="#EC4899" // Pink-500
              size={250}
              speedMultiplier={1}
            />
            <p className="mt-4 text-xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse">
              Crafting Your Perfect Plans...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Offers;