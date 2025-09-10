




import React from "react";
import { PuffLoader } from "react-spinners";
import { motion } from "framer-motion";

const Offers = ({ onBuyClick, isLoggedIn, plans }) => {
  const groupedPlans = plans.reduce((acc, plan) => {
    const category = plan.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(plan);
    return acc;
  }, {});

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
                  {categoryPlans.map((plan) => {
                    const isPromotionalZero =
                      plan.category === "promotional" &&
                      (plan.price === 0 || plan.price === "0" || parseFloat(plan.price) === 0);

                    return (
                      <motion.div
                        key={plan.id}
                        variants={cardVariants}
                        whileHover={!isPromotionalZero ? "hover" : undefined}
                        className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-gray-700/50 transition-colors duration-300 flex flex-col relative"
                      >
                        {isPromotionalZero && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold animate-pulse">
                            FREE
                          </div>
                        )}
                        <div className="flex-grow text-center">
                          <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                          <p className="text-3xl font-extrabold text-indigo-300 mb-4">
                            {isPromotionalZero ? (
                              <span className="text-green-400">FREE</span>
                            ) : (
                              <>
                                KES {Number(plan.price).toLocaleString()}
                                <span className="text-sm font-normal text-gray-400">
                                  /{plan.expiry.value} {plan.expiry.unit}
                                </span>
                              </>
                            )}
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
                          className={`w-full py-3 px-6 rounded-full font-semibold text-lg shadow-md transition-all duration-300 ${
                            isPromotionalZero
                              ? "bg-green-500 text-white hover:bg-green-600 active:scale-95"
                              : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg active:scale-95"
                          }`}
                          title={
                            isPromotionalZero
                              ? "Activate this free promotional plan"
                              : "Get started with this plan"
                          }
                        >
                          {isPromotionalZero ? "Activate Now" : "BUY NOW"}
                        </button>
                      </motion.div>
                    );
                  })}
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


