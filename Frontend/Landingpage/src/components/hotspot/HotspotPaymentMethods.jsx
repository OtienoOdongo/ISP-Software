


// import React from "react";
// import { CreditCard, Smartphone, Landmark, Globe } from "lucide-react";
// import mpesa from "../../assets/mpesa.png";

// const HotspotPaymentMethods = ({ methods }) => {
//   // Robust extraction — handles any realistic API shape
//   const extractMethods = (data) => {
//     if (!data) return [];
//     if (Array.isArray(data)) return data;

//     const keysToCheck = ["available_methods", "payment_methods", "results", "data"];
//     for (const key of keysToCheck) {
//       if (data[key] && Array.isArray(data[key])) {
//         return data[key];
//       }
//     }

//     // Fallback: find first array in object
//     return Object.values(data).find(Array.isArray) || [];
//   };

//   const paymentMethods = extractMethods(methods);

//   const getMethodIcon = (name = "") => {
//     const lower = name.toLowerCase();
//     if (lower.includes("mpesa")) return <img src={mpesa} alt="M-Pesa" className="w-8 h-8" />;
//     if (lower.includes("paypal")) return <Globe className="w-8 h-8 text-blue-500" />;
//     if (lower.includes("bank")) return <Landmark className="w-8 h-8 text-green-600" />;
//     if (lower.includes("card") || lower.includes("visa") || lower.includes("mastercard"))
//       return <CreditCard className="w-8 h-8 text-indigo-600" />;
//     if (lower.includes("mobile")) return <Smartphone className="w-8 h-8 text-purple-600" />;
//     return <CreditCard className="w-8 h-8 text-gray-500" />;
//   };

//   const getDisplayName = (name = "") => {
//     const map = {
//       mpesa_paybill: "M-Pesa Paybill",
//       mpesa_till: "M-Pesa Till Number",
//       mpesa: "M-Pesa",
//       bank_transfer: "Bank Transfer",
//       paypal: "PayPal",
//       credit_card: "Credit/Debit Card",
//       mobile_money: "Mobile Money",
//     };
//     return map[name.toLowerCase()] || name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
//   };

//   const getDescription = (name = "") => {
//     const lower = name.toLowerCase();
//     if (lower.includes("mpesa")) return "Instant payment via M-Pesa";
//     if (lower.includes("bank")) return "Direct bank transfer or deposit";
//     if (lower.includes("paypal")) return "Pay securely with PayPal";
//     if (lower.includes("card")) return "Visa, Mastercard & more";
//     return "Secure and reliable payment";
//   };

//   if (!paymentMethods || paymentMethods.length === 0) {
//     return (
//       <section className="py-16 text-center">
//         <h2 className="text-3xl font-bold text-white mb-4">Supported Payment Methods</h2>
//         <p className="text-gray-400">Loading payment options...</p>
//       </section>
//     );
//   }

//   return (
//     <section className="py-16">
//       <div className="text-center mb-10">
//         <h2 className="text-3xl font-bold text-white mb-3">Supported Payment Methods</h2>
//         <p className="text-gray-300 max-w-2xl mx-auto">
//           Choose your preferred payment method. <strong>M-Pesa is recommended</strong> for instant activation.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
//         {paymentMethods
//           .filter(m => m?.is_active !== false && m?.enabled !== false)
//           .map((method, idx) => {
//             const name = method.name || method.method_name || method.code || "Unknown";
//             const id = method.id || method.method_id || idx;
//             const isMpesa = name.toLowerCase().includes("mpesa");

//             return (
//               <div
//                 key={id}
//                 className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105"
//               >
//                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
//                   {getMethodIcon(name)}
//                 </div>

//                 <h3 className="text-xl font-bold text-white mb-2">{getDisplayName(name)}</h3>
//                 <p className="text-gray-300 text-sm mb-4 min-h-10">{getDescription(name)}</p>

//                 {isMpesa && (
//                   <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
//                     Recommended
//                   </span>
//                 )}
//               </div>
//             );
//           })}
//       </div>

//       <div className="text-center mt-10">
//         <p className="text-gray-400 text-sm">
//           <strong>Tip:</strong> M-Pesa payments activate instantly — perfect for immediate access!
//         </p>
//       </div>
//     </section>
//   );
// };

// export default React.memo(HotspotPaymentMethods);






import React from "react";
import { CreditCard, Smartphone, Landmark, Globe } from "lucide-react";
import mpesa from "../../assets/mpesa.png";

const HotspotPaymentMethods = ({ methods }) => {
  // Robust extraction — handles any realistic API shape from payments app
  const extractMethods = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    const keysToCheck = [
      "available_methods", 
      "payment_methods", 
      "results", 
      "data",
      "gateways"
    ];
    
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
            const id = method.id || method.gateway_id || method.method_id || idx;
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