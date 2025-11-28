import React from "react";
import { motion } from "framer-motion";
import { Network, Zap, Clock, CheckCircle2, Shield, Users } from "lucide-react";

const PPPoEPlans = ({ plans, onPlanSelect, clientData }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
  };

  const hasActivePlan = clientData?.current_plan;

  const getPlanFeatures = (plan) => {
    const features = [];
    
    if (plan.access_methods?.pppoe?.enabled) {
      if (plan.access_methods.pppoe.downloadSpeed) {
        features.push({
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          text: `Download: ${plan.access_methods.pppoe.downloadSpeed.value} ${plan.access_methods.pppoe.downloadSpeed.unit}`,
          highlight: true
        });
      }
      
      if (plan.access_methods.pppoe.uploadSpeed) {
        features.push({
          icon: <Zap className="w-4 h-4 text-blue-400" />,
          text: `Upload: ${plan.access_methods.pppoe.uploadSpeed.value} ${plan.access_methods.pppoe.uploadSpeed.unit}`
        });
      }
      
      if (plan.access_methods.pppoe.dataLimit) {
        features.push({
          icon: <Shield className="w-4 h-4 text-green-400" />,
          text: `Data: ${plan.access_methods.pppoe.dataLimit.value} ${plan.access_methods.pppoe.dataLimit.unit}`
        });
      }
      
      if (plan.access_methods.pppoe.validityPeriod) {
        features.push({
          icon: <Clock className="w-4 h-4 text-purple-400" />,
          text: `Valid: ${plan.access_methods.pppoe.validityPeriod.value} ${plan.access_methods.pppoe.validityPeriod.unit}`
        });
      }
    }
    
    return features;
  };

  const getPlanLevel = (plan) => {
    if (plan.category === "Enterprise") return "enterprise";
    if (plan.category === "Business") return "business";
    if (plan.category === "Residential") return "residential";
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
      default:
        return { text: "STANDARD", color: "bg-gradient-to-r from-gray-500 to-blue-500" };
    }
  };

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
                You currently have the <strong className="text-white">{clientData.current_plan}</strong> active. 
                Purchase a new plan to extend or upgrade your PPPoE service.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const planLevel = getPlanLevel(plan);
          const planColor = getPlanColor(planLevel);
          const planBadge = getPlanBadge(planLevel);
          const features = getPlanFeatures(plan);
          const isCurrentPlan = hasActivePlan && clientData.current_plan === plan.name;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
              className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 relative overflow-hidden ${
                isCurrentPlan ? 'ring-2 ring-green-400' : ''
              }`}
            >
              {/* Plan Badge */}
              <div className={`absolute top-0 right-0 ${planBadge.color} text-white px-4 py-1 rounded-bl-lg text-xs font-bold`}>
                {planBadge.text}
              </div>

              {/* Current Plan Indicator */}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 rounded-br-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  CURRENT
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
                  KES {Number(plan.price).toLocaleString()}
                </span>
                <span className="text-blue-200 text-sm block mt-1">
                  {plan.duration_display || 'Monthly'}
                </span>
              </div>

              {/* Plan Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                      feature.highlight ? 'bg-white/5 border border-white/10' : ''
                    }`}
                  >
                    <span className="text-blue-200 flex items-center gap-2">
                      {feature.icon}
                      {feature.text.split(':')[0]}:
                    </span>
                    <span className="text-white font-medium">
                      {feature.text.split(':')[1]}
                    </span>
                  </div>
                ))}
                
                {/* Additional Features */}
                <div className="flex items-center justify-between text-sm p-2">
                  <span className="text-blue-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Connection:
                  </span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <Network className="w-4 h-4 text-blue-300" />
                    PPPoE
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm p-2">
                  <span className="text-blue-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    Support:
                  </span>
                  <span className="text-white font-medium">24/7</span>
                </div>
              </div>

              <button
                onClick={() => onPlanSelect(plan)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : `bg-gradient-to-r ${planColor} text-white hover:shadow-lg hover:shadow-blue-500/25`
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCurrentPlan ? 'Current Plan' : hasActivePlan ? 'Upgrade Plan' : 'Get Started'}
              </button>

              {/* M-Pesa Ready Badge */}
              {!isCurrentPlan && plan.price > 0 && (
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

      {plans.length === 0 && (
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