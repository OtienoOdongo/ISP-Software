// import React from "react";
// import { CreditCard, Smartphone, Bank, Globe } from "lucide-react";
// import mpesa from "../../assets/mpesa.png";

// const HotspotPaymentMethods = ({ methods }) => {
//   const getMethodIcon = (methodName) => {
//     switch (methodName) {
//       case 'mpesa_paybill':
//       case 'mpesa_till':
//         return <img src={mpesa} alt="M-Pesa" className="w-6 h-6" />;
//       case 'paypal':
//         return <Globe className="w-6 h-6 text-blue-500" />;
//       case 'bank_transfer':
//         return <Bank className="w-6 h-6 text-green-500" />;
//       default:
//         return <CreditCard className="w-6 h-6 text-gray-500" />;
//     }
//   };

//   const getMethodDisplayName = (methodName) => {
//     switch (methodName) {
//       case 'mpesa_paybill': return 'M-Pesa Paybill';
//       case 'mpesa_till': return 'M-Pesa Till';
//       case 'bank_transfer': return 'Bank Transfer';
//       case 'paypal': return 'PayPal';
//       default: return methodName;
//     }
//   };

//   const getMethodDescription = (methodName) => {
//     switch (methodName) {
//       case 'mpesa_paybill':
//       case 'mpesa_till':
//         return 'Instant payment via M-Pesa';
//       case 'bank_transfer':
//         return 'Bank deposit or transfer';
//       case 'paypal':
//         return 'Secure online payment';
//       default:
//         return 'Payment method';
//     }
//   };

//   if (!methods || methods.length === 0) {
//     return null;
//   }

//   return (
//     <section className="py-12">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-white mb-4">
//           Supported Payment Methods
//         </h2>
//         <p className="text-gray-300">
//           Choose your preferred payment method. M-Pesa recommended for instant activation.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
//         {methods.map((method) => (
//           <div
//             key={method.id}
//             className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 hover:border-purple-400/30 transition-all duration-300"
//           >
//             <div className="flex justify-center mb-4">
//               <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
//                 {getMethodIcon(method.name)}
//               </div>
//             </div>
            
//             <h3 className="text-white font-semibold mb-2">
//               {getMethodDisplayName(method.name)}
//             </h3>
            
//             <p className="text-gray-300 text-sm mb-4">
//               {getMethodDescription(method.name)}
//             </p>
            
//             <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//               method.name.includes('mpesa') 
//                 ? 'bg-green-500/20 text-green-300 border border-green-400/30'
//                 : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
//             }`}>
//               {method.name.includes('mpesa') ? 'Recommended' : 'Available'}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="text-center mt-8">
//         <p className="text-gray-400 text-sm">
//           💡 <strong>Tip:</strong> M-Pesa payments are processed instantly for immediate activation
//         </p>
//       </div>
//     </section>
//   );
// };

// export default HotspotPaymentMethods;



// import React from "react";
// import { CreditCard, Smartphone, Landmark, Globe } from "lucide-react";
// import mpesa from "../../assets/mpesa.png";

// const HotspotPaymentMethods = ({ methods }) => {
//   // ✅ PRODUCTION-READY: Safely extract payment methods from API response
//   const extractPaymentMethods = (data) => {
//     if (!data) return [];
    
//     // Handle array directly
//     if (Array.isArray(data)) return data;
    
//     // Handle object with results/data property (common API pattern)
//     if (data.results && Array.isArray(data.results)) return data.results;
//     if (data.data && Array.isArray(data.data)) return data.data;
//     if (data.payment_methods && Array.isArray(data.payment_methods)) return data.payment_methods;
    
//     // Handle object with nested array
//     if (typeof data === 'object') {
//       const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
//       if (arrayKeys.length > 0) return data[arrayKeys[0]];
//     }
    
//     return [];
//   };

//   const getMethodIcon = (methodName) => {
//     if (!methodName) return <CreditCard className="w-6 h-6 text-gray-500" />;
    
//     switch (methodName.toLowerCase()) {
//       case 'mpesa_paybill':
//       case 'mpesa_till':
//       case 'mpesa':
//         return <img src={mpesa} alt="M-Pesa" className="w-6 h-6" />;
//       case 'paypal':
//         return <Globe className="w-6 h-6 text-blue-500" />;
//       case 'bank_transfer':
//       case 'bank':
//         return <Landmark className="w-6 h-6 text-green-500" />;
//       case 'credit_card':
//       case 'card':
//         return <CreditCard className="w-6 h-6 text-blue-600" />;
//       case 'mobile_money':
//         return <Smartphone className="w-6 h-6 text-purple-500" />;
//       default:
//         return <CreditCard className="w-6 h-6 text-gray-500" />;
//     }
//   };

//   const getMethodDisplayName = (methodName) => {
//     if (!methodName) return 'Payment Method';
    
//     switch (methodName.toLowerCase()) {
//       case 'mpesa_paybill': return 'M-Pesa Paybill';
//       case 'mpesa_till': return 'M-Pesa Till';
//       case 'mpesa': return 'M-Pesa';
//       case 'bank_transfer': return 'Bank Transfer';
//       case 'paypal': return 'PayPal';
//       case 'credit_card': return 'Credit Card';
//       case 'mobile_money': return 'Mobile Money';
//       default: return methodName.split('_').map(word => 
//         word.charAt(0).toUpperCase() + word.slice(1)
//       ).join(' ');
//     }
//   };

//   const getMethodDescription = (methodName) => {
//     if (!methodName) return 'Secure payment method';
    
//     switch (methodName.toLowerCase()) {
//       case 'mpesa_paybill':
//       case 'mpesa_till':
//       case 'mpesa':
//         return 'Instant payment via M-Pesa';
//       case 'bank_transfer':
//         return 'Bank deposit or transfer';
//       case 'paypal':
//         return 'Secure online payment';
//       case 'credit_card':
//         return 'Pay with credit/debit card';
//       case 'mobile_money':
//         return 'Mobile money payment';
//       default:
//         return 'Secure payment method';
//     }
//   };

//   // ✅ PRODUCTION-READY: Safe data extraction and validation
//   const paymentMethods = extractPaymentMethods(methods);
  
//   // Development logging only
//   if (process.env.NODE_ENV === 'development' && !Array.isArray(methods)) {
//     console.warn('HotspotPaymentMethods: methods prop structure:', methods);
//   }

//   if (!paymentMethods || paymentMethods.length === 0) {
//     return (
//       <section className="py-12">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-white mb-4">
//             Supported Payment Methods
//           </h2>
//           <p className="text-gray-300">
//             Payment methods loading...
//           </p>
//         </div>
        
//         <div className="text-center">
//           <p className="text-gray-400 text-sm">
//             No payment methods available at the moment. Please try again later.
//           </p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-12">
//       <div className="text-center mb-8">
//         <h2 className="text-3xl font-bold text-white mb-4">
//           Supported Payment Methods
//         </h2>
//         <p className="text-gray-300 max-w-2xl mx-auto">
//           Choose your preferred payment method. M-Pesa recommended for instant activation.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
//         {paymentMethods.map((method, index) => {
//           // ✅ PRODUCTION-READY: Safe method property access
//           const methodId = method?.id || method?.method_id || `method-${index}`;
//           const methodName = method?.name || method?.method_name || method?.type || 'unknown';
//           const isActive = method?.is_active !== false;
//           const isRecommended = methodName.toLowerCase().includes('mpesa');
          
//           if (!isActive) return null;

//           return (
//             <div
//               key={methodId}
//               className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105"
//             >
//               <div className="flex justify-center mb-4">
//                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
//                   {getMethodIcon(methodName)}
//                 </div>
//               </div>
              
//               <h3 className="text-white font-semibold mb-2 text-lg">
//                 {getMethodDisplayName(methodName)}
//               </h3>
              
//               <p className="text-gray-300 text-sm mb-4 min-h-[40px]">
//                 {getMethodDescription(methodName)}
//               </p>
              
//               <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                 isRecommended 
//                   ? 'bg-green-500/20 text-green-300 border border-green-400/30'
//                   : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
//               }`}>
//                 {isRecommended ? 'Recommended' : 'Available'}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="text-center mt-8">
//         <p className="text-gray-400 text-sm">
//           💡 <strong>Tip:</strong> M-Pesa payments are processed instantly for immediate activation
//         </p>
//       </div>
//     </section>
//   );
// };

// export default HotspotPaymentMethods;




import React from "react";
import { CreditCard, Smartphone, Landmark, Globe } from "lucide-react";
import mpesa from "../../assets/mpesa.png";

const HotspotPaymentMethods = ({ methods }) => {
  // Robust extraction — handles any realistic API shape
  const extractMethods = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    const keysToCheck = ["available_methods", "payment_methods", "results", "data"];
    for (const key of keysToCheck) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key];
      }
    }

    // Fallback: find first array in object
    return Object.values(data).find(Array.isArray) || [];
  };

  const paymentMethods = extractMethods(methods);

  const getMethodIcon = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("mpesa")) return <img src={mpesa} alt="M-Pesa" className="w-8 h-8" />;
    if (lower.includes("paypal")) return <Globe className="w-8 h-8 text-blue-500" />;
    if (lower.includes("bank")) return <Landmark className="w-8 h-8 text-green-600" />;
    if (lower.includes("card") || lower.includes("visa") || lower.includes("mastercard"))
      return <CreditCard className="w-8 h-8 text-indigo-600" />;
    if (lower.includes("mobile")) return <Smartphone className="w-8 h-8 text-purple-600" />;
    return <CreditCard className="w-8 h-8 text-gray-500" />;
  };

  const getDisplayName = (name = "") => {
    const map = {
      mpesa_paybill: "M-Pesa Paybill",
      mpesa_till: "M-Pesa Till Number",
      mpesa: "M-Pesa",
      bank_transfer: "Bank Transfer",
      paypal: "PayPal",
      credit_card: "Credit/Debit Card",
      mobile_money: "Mobile Money",
    };
    return map[name.toLowerCase()] || name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const getDescription = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.includes("mpesa")) return "Instant payment via M-Pesa";
    if (lower.includes("bank")) return "Direct bank transfer or deposit";
    if (lower.includes("paypal")) return "Pay securely with PayPal";
    if (lower.includes("card")) return "Visa, Mastercard & more";
    return "Secure and reliable payment";
  };

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Supported Payment Methods</h2>
        <p className="text-gray-400">Loading payment options...</p>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">Supported Payment Methods</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Choose your preferred payment method. <strong>M-Pesa is recommended</strong> for instant activation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
        {paymentMethods
          .filter(m => m?.is_active !== false && m?.enabled !== false)
          .map((method, idx) => {
            const name = method.name || method.method_name || method.code || "Unknown";
            const id = method.id || method.method_id || idx;
            const isMpesa = name.toLowerCase().includes("mpesa");

            return (
              <div
                key={id}
                className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  {getMethodIcon(name)}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{getDisplayName(name)}</h3>
                <p className="text-gray-300 text-sm mb-4 min-h-10">{getDescription(name)}</p>

                {isMpesa && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    Recommended
                  </span>
                )}
              </div>
            );
          })}
      </div>

      <div className="text-center mt-10">
        <p className="text-gray-400 text-sm">
          <strong>Tip:</strong> M-Pesa payments activate instantly — perfect for immediate access!
        </p>
      </div>
    </section>
  );
};

export default React.memo(HotspotPaymentMethods);