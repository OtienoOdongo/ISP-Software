


// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Phone, CreditCard, CheckCircle, X, ArrowRight,
//   Smartphone, Shield, Zap, RotateCw, Wifi, History, Edit, AlertCircle
// } from "lucide-react";
// import mpesa from "../../assets/mpesa.png";
// import api from "../../api/index";

// const HotspotAuthModal = ({
//   onClose,
//   onLoginSuccess,
//   selectedPlan,
//   onPaymentSuccess,
//   existingClientData,
//   paymentMethods = [],
//   getMacAddress
// }) => {
//   const [step, setStep] = useState(1);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [clientId, setClientId] = useState(null);
//   const [isReturningClient, setIsReturningClient] = useState(false);
//   const [isEditingNumber, setIsEditingNumber] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const [availableMethods, setAvailableMethods] = useState([]);

//   const isFreePlan = selectedPlan?.plan_type === "Free Trial" || parseFloat(selectedPlan?.price || 0) === 0;

//   // Improved payment methods extraction
//   useEffect(() => {
//     const extractMethods = (data) => {
//       if (!data) return [];
//       if (Array.isArray(data)) return data;

//       // Handle different API response structures
//       const keysToCheck = ["available_methods", "payment_methods", "results", "data", "methods"];
//       for (const key of keysToCheck) {
//         if (data[key] && Array.isArray(data[key])) {
//           return data[key];
//         }
//       }

//       // Fallback: return empty array if no methods found
//       return [];
//     };

//     const methods = extractMethods(paymentMethods);
//     setAvailableMethods(methods);

//     // Auto-select first available method
//     if (methods.length > 0 && !selectedPaymentMethod) {
//       setSelectedPaymentMethod(methods[0]);
//     }
//   }, [paymentMethods, selectedPaymentMethod]);

//   // Restore saved client
//   useEffect(() => {
//     if (existingClientData?.phoneNumber && existingClientData?.clientId) {
//       setPhoneNumber(existingClientData.phoneNumber.replace("+254", "0"));
//       setClientId(existingClientData.clientId);
//       setIsReturningClient(true);
//     } else {
//       const saved = localStorage.getItem("hotspotClientPhone");
//       const savedId = localStorage.getItem("hotspotClientId");
//       if (saved && savedId) {
//         setPhoneNumber(saved);
//         setClientId(savedId);
//         setIsReturningClient(true);
//       }
//     }
//   }, [existingClientData]);

//   const formatPhone = useCallback((input) => {
//     const digits = input.replace(/\D/g, "");
//     if (/^(07|01)\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
//     if (/^7\d{8}$/.test(digits)) return `+254${digits}`;
//     if (/^254\d{9}$/.test(digits)) return `+${digits}`;
//     if (/^\+254\d{9}$/.test(digits)) return digits;
//     throw new Error("Invalid Kenyan phone number. Use 07XXXXXXXX or 7XXXXXXXX");
//   }, []);

//   const findOrCreateClient = async (formatted) => {
//     try {
//       const { data } = await api.get("/api/account/clients/search/", { params: { phone_number: formatted } });
//       if (data?.length > 0) return data[0];

//       const createRes = await api.post("/api/account/clients/create-hotspot/", { phone_number: formatted });
//       return createRes.data;
//     } catch (err) {
//       throw new Error("Failed to register. Please try again.");
//     }
//   };

//   const handlePhoneSubmit = async (e) => {
//     e?.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const formatted = formatPhone(phoneNumber);
//       const display = `0${formatted.slice(4)}`;
//       const client = await findOrCreateClient(formatted);

//       setClientId(client.id);
//       localStorage.setItem("hotspotClientPhone", display);
//       localStorage.setItem("hotspotClientId", client.id);
//       setIsReturningClient(true);
//       onLoginSuccess(formatted, client.id);

//       if (isFreePlan) {
//         await activateFreePlan(client.id, formatted);
//       } else {
//         setStep(2);
//       }
//     } catch (err) {
//       setError(err.message || "Invalid phone number");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const activateFreePlan = async (id, phone) => {
//     setLoading(true);
//     try {
//       const mac = await getMacAddress();
//       await api.post("/api/internet_plans/client/purchase/", {
//         plan_id: selectedPlan.id,
//         phone_number: phone,
//         payment_method: "free",
//         access_type: "hotspot",
//         mac_address: mac
//       });
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(3);
//     } catch {
//       setError("Failed to activate free plan");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     if (!selectedPaymentMethod) {
//       setError("Please select a payment method");
//       return;
//     }

//     if (availableMethods.length === 0) {
//       setError("No payment methods available. Please try again later.");
//       return;
//     }

//     setLoading(true);
//     setPaymentInProgress(true);
//     setError("");

//     try {
//       const formatted = formatPhone(phoneNumber);
//       const gatewayId = selectedPaymentMethod.id || selectedPaymentMethod.method_id;

//       const { data } = await api.post("/api/payments/initiate-payment/", {
//         gateway_id: gatewayId,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//         phone_number: formatted,
//         access_type: "hotspot"
//       });

//       if (!data.success) throw new Error(data.error || "Payment initiation failed");

//       const mac = await getMacAddress();
//       const methodName = (selectedPaymentMethod.name || selectedPaymentMethod.code || "").toLowerCase();

//       if (methodName.includes("mpesa")) {
//         pollMpesaStatus(data.transaction_id, clientId, mac);
//       } else {
//         await completeActivation(data.transaction_id, clientId, mac);
//       }
//     } catch (err) {
//       setError(err.message || "Payment failed. Please try again.");
//       setPaymentInProgress(false);
//       setLoading(false);
//     }
//   };

//   const pollMpesaStatus = (txId, clientId, mac) => {
//     let attempts = 0;
//     const maxAttempts = 30; // 2.5 minutes max

//     const interval = setInterval(async () => {
//       attempts++;
//       try {
//         const { data } = await api.get(`/api/payments/transactions/${txId}/status/`);
        
//         if (data.status === "completed") {
//           clearInterval(interval);
//           await completeActivation(txId, clientId, mac);
//         } else if (data.status === "failed" || attempts >= maxAttempts) {
//           clearInterval(interval);
//           setError(data.status === "failed" ? "Payment failed. Please try again." : "Payment timed out. Please check your M-Pesa.");
//           setPaymentInProgress(false);
//           setLoading(false);
//         }
//       } catch {
//         if (attempts >= maxAttempts) {
//           clearInterval(interval);
//           setError("Connection lost. Please try again.");
//           setPaymentInProgress(false);
//           setLoading(false);
//         }
//       }
//     }, 5000);
//   };

//   const completeActivation = async (txId, clientId, mac) => {
//     try {
//       await api.post("/api/internet_plans/payment-callback/", {
//         subscription_id: clientId, // This should be the actual subscription ID
//         reference: txId,
//         status: 'completed',
//         plan_id: selectedPlan.id
//       });

//       localStorage.setItem("hotspotClientPhone", phoneNumber);
//       localStorage.setItem("hotspotClientId", clientId);

//       onPaymentSuccess(selectedPlan.name, false);
//       setStep(3);
//     } catch (err) {
//       setError("Activation failed. Please contact support.");
//       console.error("Activation error:", err);
//     } finally {
//       setPaymentInProgress(false);
//       setLoading(false);
//     }
//   };

//   // COMPLETED: Phone Input Form
//   const renderPhoneInput = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//           <Smartphone className="w-9 h-9 text-white" />
//         </div>
//         <h3 className="text-2xl font-bold text-gray-800">
//           {isReturningClient && !isEditingNumber ? "Welcome Back!" : "Enter Phone Number"}
//         </h3>
//         <p className="text-sm text-gray-600 mt-2">
//           {isReturningClient && !isEditingNumber
//             ? "We recognize you from a previous visit"
//             : "We'll use this to activate your internet plan"}
//         </p>
//       </div>

//       {isReturningClient && !isEditingNumber ? (
//         <div className="space-y-4">
//           <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
//             <div className="flex items-center gap-4">
//               <History className="w-10 h-10 text-green-600" />
//               <div>
//                 <p className="text-sm font-medium text-gray-700">Your Number</p>
//                 <p className="text-xl font-bold text-green-700">{phoneNumber}</p>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handlePhoneSubmit}
//             disabled={loading}
//             className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
//           >
//             {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
//             Continue as {phoneNumber}
//           </button>

//           <button
//             onClick={() => setIsEditingNumber(true)}
//             className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
//           >
//             <Edit className="w-5 h-5" />
//             Use Different Number
//           </button>
//         </div>
//       ) : (
//         <form onSubmit={handlePhoneSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
//             <div className="relative">
//               <input
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
//                 className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-lg font-medium"
//                 placeholder="0712345678"
//                 required
//                 autoFocus
//               />
//               <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
//             </div>
//             <p className="text-xs text-gray-500 mt-2">Enter your Safaricom number (10 digits)</p>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-red-700">{error}</p>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading || phoneNumber.length < 9}
//             className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
//           >
//             {loading ? <RotateCw className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
//             {isFreePlan ? "Activate Free Plan" : "Continue to Payment"}
//           </button>

//           <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
//             <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-blue-900">Your data is safe</p>
//               <p className="text-xs text-blue-700">We use encryption and never share your information</p>
//             </div>
//           </div>
//         </form>
//       )}
//     </div>
//   );

//   // COMPLETED: Payment Selection (already provided)
//   const renderPaymentSelection = () => (
//     <div className="space-y-6">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
//           <CreditCard className="w-9 h-9 text-white" />
//         </div>
//         <h3 className="text-2xl font-bold text-gray-800">Choose Payment Method</h3>
//         <p className="text-sm text-gray-600 mt-2">Select how you'd like to pay</p>
//       </div>

//       {availableMethods.length === 0 ? (
//         <div className="text-center py-6">
//           <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
//           <p className="text-gray-600 mb-4">No payment methods available at the moment.</p>
//           <button
//             onClick={() => setStep(1)}
//             className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       ) : (
//         <>
//           <div className="space-y-3">
//             {availableMethods.map((method) => {
//               const id = method.id || method.method_id || method.code;
//               const name = (method.name || method.method_name || method.code || "Unknown").toLowerCase();
//               const displayName = name.includes("mpesa_paybill") ? "M-Pesa Paybill" :
//                                 name.includes("mpesa_till") ? "M-Pesa Till" :
//                                 name.includes("mpesa") ? "M-Pesa" :
//                                 name.includes("bank") ? "Bank Transfer" :
//                                 name.includes("paypal") ? "PayPal" : 
//                                 method.name || "Payment";

//               const isMpesa = name.includes("mpesa");
//               const isSelected = selectedPaymentMethod?.id === id || 
//                                selectedPaymentMethod?.method_id === id;

//               return (
//                 <div
//                   key={id}
//                   onClick={() => setSelectedPaymentMethod(method)}
//                   className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                     isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {isMpesa ? (
//                         <img src={mpesa} alt="M-Pesa" className="w-10 h-10" />
//                       ) : (
//                         <CreditCard className="w-8 h-8 text-gray-600" />
//                       )}
//                       <div>
//                         <p className="font-semibold text-gray-800">{displayName}</p>
//                         <p className="text-sm text-gray-600">
//                           {isMpesa ? "Instant activation" : "Secure payment"}
//                         </p>
//                       </div>
//                     </div>
//                     {isSelected && <CheckCircle className="w-6 h-6 text-blue-600" />}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {selectedPaymentMethod && (
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
//               <div className="text-center mb-3">
//                 <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
//                 <p className="text-2xl font-extrabold text-blue-600 mt-1">
//                   KES {Number(selectedPlan.price).toLocaleString()}
//                 </p>
//               </div>
//               <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Data:</span> 
//                   <span className="font-semibold">{selectedPlan.data_limit_display}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Speed:</span> 
//                   <span className="font-semibold">{selectedPlan.download_speed} {selectedPlan.speed_unit}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Phone:</span> 
//                   <span className="font-semibold">{phoneNumber}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-red-700">{error}</p>
//             </div>
//           )}

//           <div className="space-y-3">
//             <button
//               onClick={handlePayment}
//               disabled={!selectedPaymentMethod || loading || paymentInProgress}
//               className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
//             >
//               {paymentInProgress ? (
//                 <>
//                   <RotateCw className="w-5 h-5 animate-spin" />
//                   Processing...
//                 </>
//               ) : selectedPaymentMethod?.name?.toLowerCase().includes("mpesa") ? (
//                 <>
//                   Pay with M-Pesa
//                   <img src={mpesa} alt="M-Pesa" className="h-6" />
//                 </>
//               ) : (
//                 "Complete Payment"
//               )}
//             </button>

//             <button
//               onClick={() => setStep(1)}
//               className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center gap-2"
//             >
//               <Edit className="w-4 h-4" />
//               Change Phone Number
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );

//   // COMPLETED: Success Screen
//   const renderSuccess = () => (
//     <div className="text-center space-y-6 py-8">
//       <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
//         <CheckCircle className="w-12 h-12 text-white" />
//       </div>

//       <div>
//         <h3 className="text-2xl font-bold text-gray-800 mb-2">You're Connected!</h3>
//         <p className="text-gray-600">Your internet plan is now active</p>
//       </div>

//       <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
//         <h4 className="text-xl font-bold text-gray-800 mb-4">{selectedPlan.name}</h4>
//         <div className="space-y-3 text-left">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Data</span> 
//             <span className="font-semibold">{selectedPlan.data_limit_display}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Speed</span> 
//             <span className="font-semibold">{selectedPlan.download_speed} {selectedPlan.speed_unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Paid with</span> 
//             <span className="font-semibold">
//               {isFreePlan ? "FREE Plan" : selectedPaymentMethod?.name?.includes("mpesa") ? "M-Pesa" : selectedPaymentMethod?.name}
//             </span>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={onClose}
//         className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
//       >
//         Start Browsing
//         <Wifi className="w-6 h-6" />
//       </button>
//     </div>
//   );

//   // COMPLETED: Main Return Statement
//   return (
//     <div
//       className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
//       onClick={(e) => e.target === e.currentTarget && step !== 3 && onClose()}
//     >
//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
//         {step !== 3 && (
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white/80 rounded-full p-2 hover:bg-gray-100 transition-all"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         )}

//         <div className="p-6 pt-12">
//           {step === 1 && renderPhoneInput()}
//           {step === 2 && renderPaymentSelection()}
//           {step === 3 && renderSuccess()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default React.memo(HotspotAuthModal);





import React, { useState, useEffect, useCallback } from "react";
import {
  Phone, CreditCard, CheckCircle, X, ArrowRight,
  Smartphone, Shield, Zap, RotateCw, Wifi, History, Edit, AlertCircle
} from "lucide-react";
import mpesa from "../../assets/mpesa.png";
import api from "../../api/index";

const HotspotAuthModal = ({
  onClose,
  onLoginSuccess,
  selectedPlan,
  onPaymentSuccess,
  existingClientData,
  paymentMethods = [],
  getMacAddress
}) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  const [isReturningClient, setIsReturningClient] = useState(false);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [availableMethods, setAvailableMethods] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);

  const isFreePlan = selectedPlan?.plan_type === "Free Trial" || parseFloat(selectedPlan?.price || 0) === 0;

  // Helper function to map payment method to backend expected values
  const getPaymentMethodValue = useCallback((method) => {
    if (!method) return "mpesa_till"; // Default
    
    const methodName = (method.name || method.code || method.method_name || "").toLowerCase();
    
    // Map to backend expected values
    if (methodName.includes("paybill")) {
      return "mpesa_paybill";
    } else if (methodName.includes("till")) {
      return "mpesa_till";
    } else if (methodName.includes("bank")) {
      return "bank_transfer";
    } else if (methodName.includes("paypal")) {
      return "paypal";
    } else if (methodName.includes("mpesa")) {
      return "mpesa_till"; // Default M-Pesa to till
    }
    
    // If method has a code that matches backend values directly
    if (method.code && ["mpesa_till", "mpesa_paybill", "bank_transfer", "paypal"].includes(method.code)) {
      return method.code;
    }
    
    return "mpesa_till"; // Fallback
  }, []);

  // Extract payment methods from props
  useEffect(() => {
    const extractMethods = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;

      const keysToCheck = [
        "available_methods", 
        "payment_methods", 
        "results", 
        "data", 
        "methods",
        "gateways"
      ];
      
      for (const key of keysToCheck) {
        if (data[key] && Array.isArray(data[key])) {
          return data[key];
        }
      }

      const arrayValue = Object.values(data).find(Array.isArray);
      return arrayValue || [];
    };

    const methods = extractMethods(paymentMethods);
    setAvailableMethods(methods);

    // Auto-select first available method and ensure it has proper mapping
    if (methods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(methods[0]);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  // Restore saved client
  useEffect(() => {
    if (existingClientData?.phoneNumber && existingClientData?.clientId) {
      setPhoneNumber(existingClientData.phoneNumber.replace("+254", "0"));
      setClientId(existingClientData.clientId);
      setIsReturningClient(true);
      if (existingClientData.clientInfo) {
        setClientInfo(existingClientData.clientInfo);
      }
    } else {
      const saved = localStorage.getItem("hotspotClientPhone");
      const savedId = localStorage.getItem("hotspotClientId");
      const savedInfo = localStorage.getItem("hotspotClientInfo");
      
      if (saved && savedId) {
        setPhoneNumber(saved);
        setClientId(savedId);
        setIsReturningClient(true);
        
        if (savedInfo) {
          try {
            setClientInfo(JSON.parse(savedInfo));
          } catch (e) {
            console.error("Failed to parse saved client info:", e);
          }
        }
      }
    }
  }, [existingClientData]);

  const formatPhone = useCallback((input) => {
    const digits = input.replace(/\D/g, "");
    if (/^(07|01)\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
    if (/^7\d{8}$/.test(digits)) return `+254${digits}`;
    if (/^254\d{9}$/.test(digits)) return `+${digits}`;
    if (/^\+254\d{9}$/.test(digits)) return digits;
    throw new Error("Invalid Kenyan phone number. Use 07XXXXXXXX or 7XXXXXXXX");
  }, []);

  // ==================== AUTHENTICATION APP ENDPOINTS ====================
  const findOrCreateClient = async (formatted) => {
    try {
      const searchResponse = await api.get("/api/auth/clients/search/", { 
        params: { phone_number: formatted } 
      });
      
      if (searchResponse.data.found && searchResponse.data.client?.length > 0) {
        const clientData = searchResponse.data.client[0];
        setClientInfo(clientData);
        localStorage.setItem("hotspotClientInfo", JSON.stringify(clientData));
        return clientData;
      }

      const createResponse = await api.post("/api/auth/clients/create-hotspot/", { 
        phone_number: formatted 
      });
      
      const clientData = createResponse.data.client;
      setClientInfo({
        ...clientData,
        date_joined: clientData.date_joined || new Date().toISOString()
      });
      localStorage.setItem("hotspotClientInfo", JSON.stringify(clientData));
      
      return clientData;
    } catch (err) {
      console.error("Client operation failed:", err);
      throw new Error(err.response?.data?.error || "Failed to register. Please try again.");
    }
  };

  // ==================== SERVICE OPERATIONS ENDPOINTS ====================
  const createSubscription = async (clientId, formattedPhone, macAddress) => {
    try {
      // Get the correct payment method value for backend
      const paymentMethodValue = getPaymentMethodValue(selectedPaymentMethod);
      
      const response = await api.post("/api/service_operations/client/portal/subscription/", {
        client_id: clientId,
        client_type: "hotspot_client",
        internet_plan_id: selectedPlan.id,
        payment_method: paymentMethodValue, // Now using mapped value
        hotspot_mac_address: macAddress,
        duration_hours: 24,
        metadata: {
          source: "hotspot_portal",
          phone_number: formattedPhone,
          plan_name: selectedPlan.name,
          plan_price: selectedPlan.price,
          user_agent: navigator.userAgent,
          client_info: clientInfo
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to create subscription");
      }

      return response.data.subscription_id;
    } catch (err) {
      console.error("Subscription creation error:", err);
      throw new Error(err.response?.data?.error || "Failed to create subscription");
    }
  };

  const initiatePayment = async (subscriptionId, formattedPhone) => {
    try {
      // Get the correct payment method value for backend
      const paymentMethodValue = getPaymentMethodValue(selectedPaymentMethod);
      
      const response = await api.post(
        `/api/service_operations/client/portal/subscription/${subscriptionId}/purchase/`,
        {
          payment_method: paymentMethodValue, // Now using mapped value
          customer_phone: formattedPhone,
          callback_url: window.location.origin + "/api/service_operations/client/payment/callback/",
          metadata: {
            client_joined: clientInfo?.date_joined
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Payment initiation failed");
      }

      return response.data.payment_reference;
    } catch (err) {
      console.error("Payment initiation error:", err);
      throw new Error(err.response?.data?.error || "Payment initiation failed");
    }
  };

  const activateFreePlan = async (subscriptionId) => {
    try {
      const response = await api.post(
        `/api/service_operations/subscriptions/${subscriptionId}/activate/`,
        {
          payment_reference: "free_trial",
          payment_method: "free",
          activate_immediately: true,
          metadata: {
            client_joined: clientInfo?.date_joined
          }
        }
      );

      return response.data.success;
    } catch (err) {
      console.error("Free plan activation error:", err);
      throw new Error(err.response?.data?.error || "Failed to activate free plan");
    }
  };

  const checkSubscriptionStatus = async (subscriptionId) => {
    try {
      const response = await api.get(
        `/api/service_operations/client/portal/status/?subscription_id=${subscriptionId}`
      );
      
      return response.data.subscription;
    } catch (err) {
      console.error("Status check error:", err);
      throw err;
    }
  };

  const pollSubscriptionStatus = async (subscriptionId, maxAttempts = 30) => {
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        const subscription = await checkSubscriptionStatus(subscriptionId);
        
        if (subscription?.status === 'active') {
          return { success: true, status: 'active' };
        }
        
        if (subscription?.status === 'failed') {
          return { success: false, status: 'failed', error: subscription.activation_error };
        }
        
        if (attempts >= maxAttempts) {
          return { success: false, status: 'timeout' };
        }
        
        attempts++;
        return null;
      } catch (err) {
        return { success: false, status: 'error', error: err.message };
      }
    };

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const result = await checkStatus();
        if (result) {
          clearInterval(interval);
          resolve(result);
        }
      }, 5000);
    });
  };

  // ==================== PAYMENTS APP ENDPOINTS ====================
  const initiateMpesaPayment = async (subscriptionId, formattedPhone) => {
    try {
      const gatewayId = selectedPaymentMethod.id || selectedPaymentMethod.gateway_id || selectedPaymentMethod.method_id;
      
      const response = await api.post("/api/payments/initiate/", {
        gateway_id: gatewayId,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
        phone_number: formattedPhone,
        access_type: "hotspot",
        metadata: {
          subscription_id: subscriptionId,
          client_id: clientId,
          client_joined: clientInfo?.date_joined
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Payment initiation failed");
      }

      return response.data.transaction_id || response.data.reference;
    } catch (err) {
      console.error("M-Pesa payment error:", err);
      throw err;
    }
  };

  const checkMpesaStatus = async (transactionId) => {
    try {
      const response = await api.get(`/api/payments/transaction-status/${transactionId}/`);
      return response.data;
    } catch (err) {
      console.error("Status check error:", err);
      throw err;
    }
  };

  const pollMpesaStatus = async (transactionId, subscriptionId) => {
    let attempts = 0;
    const maxAttempts = 30;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const data = await checkMpesaStatus(transactionId);
          
          if (data.status === "completed") {
            clearInterval(interval);
            
            const subStatus = await checkSubscriptionStatus(subscriptionId);
            if (subStatus?.status === 'active') {
              resolve({ success: true });
            } else {
              resolve({ success: true, pending_activation: true });
            }
          } else if (data.status === "failed" || attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error(data.status === "failed" ? "Payment failed" : "Payment timeout"));
          }
        } catch (err) {
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error("Connection lost"));
          }
        }
      }, 5000);
    });
  };

  // ==================== MAIN HANDLERS ====================
  const handlePhoneSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formatted = formatPhone(phoneNumber);
      const display = `0${formatted.slice(4)}`;
      const macAddress = await getMacAddress();

      const client = await findOrCreateClient(formatted);
      setClientId(client.id);
      
      localStorage.setItem("hotspotClientPhone", display);
      localStorage.setItem("hotspotClientId", client.id);
      
      setIsReturningClient(true);
      
      onLoginSuccess(formatted, client.id, {
        date_joined: client.date_joined,
        source: client.source,
        connection_type: client.connection_type
      });

      const subId = await createSubscription(client.id, formatted, macAddress);
      setSubscriptionId(subId);

      if (isFreePlan) {
        await activateFreePlan(subId);
        
        const statusResult = await pollSubscriptionStatus(subId);
        
        if (statusResult.success) {
          onPaymentSuccess(selectedPlan.name, true, {
            client_joined: client.date_joined
          });
          setStep(3);
        } else {
          throw new Error(statusResult.error || "Activation failed");
        }
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setPaymentInProgress(true);
    setError("");

    try {
      const formatted = formatPhone(phoneNumber);
      const methodName = (selectedPaymentMethod.name || selectedPaymentMethod.code || "").toLowerCase();
      
      if (methodName.includes("mpesa")) {
        const transactionId = await initiateMpesaPayment(subscriptionId, formatted);
        setPaymentReference(transactionId);
        
        await pollMpesaStatus(transactionId, subscriptionId);
        
        const finalStatus = await checkSubscriptionStatus(subscriptionId);
        
        if (finalStatus?.status === 'active') {
          onPaymentSuccess(selectedPlan.name, false, {
            client_joined: clientInfo?.date_joined
          });
          setStep(3);
        } else {
          throw new Error("Activation pending. You'll be connected shortly.");
        }
      } else {
        setError("Selected payment method not available for hotspot");
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentInProgress(false);
      setLoading(false);
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderPhoneInput = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-9 h-9 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          {isReturningClient && !isEditingNumber ? "Welcome Back!" : "Enter Phone Number"}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {isReturningClient && !isEditingNumber
            ? "We recognize you from a previous visit"
            : "We'll use this to activate your internet plan"}
        </p>
        
        {clientInfo?.date_joined && (
          <p className="text-xs text-blue-600 mt-2">
            Member since {new Date(clientInfo.date_joined).toLocaleDateString()}
          </p>
        )}
      </div>

      {isReturningClient && !isEditingNumber ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center gap-4">
              <History className="w-10 h-10 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-700">Your Number</p>
                <p className="text-xl font-bold text-green-700">{phoneNumber}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePhoneSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
          >
            {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            Continue as {phoneNumber}
          </button>

          <button
            onClick={() => setIsEditingNumber(true)}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Use Different Number
          </button>
        </div>
      ) : (
        <form onSubmit={handlePhoneSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-lg font-medium"
                placeholder="0712345678"
                required
                autoFocus
              />
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter your Safaricom number (10 digits)</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phoneNumber.length < 9}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
          >
            {loading ? <RotateCw className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
            {isFreePlan ? "Activate Free Plan" : "Continue to Payment"}
          </button>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Your data is safe</p>
              <p className="text-xs text-blue-700">We use encryption and never share your information</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  const renderPaymentSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-9 h-9 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Choose Payment Method</h3>
        <p className="text-sm text-gray-600 mt-2">Select how you'd like to pay</p>
      </div>

      {availableMethods.length === 0 ? (
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No payment methods available at the moment.</p>
          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {availableMethods.map((method) => {
              const id = method.id || method.gateway_id || method.method_id || method.code;
              const name = (method.name || method.method_name || method.code || "Unknown").toLowerCase();
              
              // Get the correct display name
              const paymentMethodValue = getPaymentMethodValue(method);
              let displayName = "Payment";
              
              switch(paymentMethodValue) {
                case "mpesa_paybill":
                  displayName = "M-Pesa Paybill";
                  break;
                case "mpesa_till":
                  displayName = "M-Pesa Till Number";
                  break;
                case "bank_transfer":
                  displayName = "Bank Transfer";
                  break;
                case "paypal":
                  displayName = "PayPal";
                  break;
                default:
                  displayName = name.includes("mpesa") ? "M-Pesa" : 
                               name.includes("bank") ? "Bank Transfer" : 
                               name.includes("paypal") ? "PayPal" : 
                               method.name || "Payment";
              }

              const isMpesa = paymentMethodValue.includes("mpesa");
              const isSelected = selectedPaymentMethod?.id === id || 
                               selectedPaymentMethod?.gateway_id === id ||
                               selectedPaymentMethod?.method_id === id;

              return (
                <div
                  key={id}
                  onClick={() => setSelectedPaymentMethod(method)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isMpesa ? (
                        <img src={mpesa} alt="M-Pesa" className="w-10 h-10" />
                      ) : (
                        <CreditCard className="w-8 h-8 text-gray-600" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{displayName}</p>
                        <p className="text-sm text-gray-600">
                          {isMpesa ? "Instant activation" : "Secure payment"}
                        </p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-6 h-6 text-blue-600" />}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPaymentMethod && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="text-center mb-3">
                <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">
                  KES {Number(selectedPlan.price).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span> 
                  <span className="font-semibold">{selectedPlan.data_limit_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span> 
                  <span className="font-semibold">{selectedPlan.download_speed} {selectedPlan.speed_unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span> 
                  <span className="font-semibold">{phoneNumber}</span>
                </div>
                {clientInfo?.date_joined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span> 
                    <span className="font-semibold">{new Date(clientInfo.date_joined).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={!selectedPaymentMethod || loading || paymentInProgress}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {paymentInProgress ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : getPaymentMethodValue(selectedPaymentMethod).includes("mpesa") ? (
                <>
                  Pay with M-Pesa
                  <img src={mpesa} alt="M-Pesa" className="h-6" />
                </>
              ) : (
                "Complete Payment"
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Change Phone Number
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">You're Connected!</h3>
        <p className="text-gray-600">Your internet plan is now active</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h4 className="text-xl font-bold text-gray-800 mb-4">{selectedPlan.name}</h4>
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-gray-600">Data</span> 
            <span className="font-semibold">{selectedPlan.data_limit_display}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Speed</span> 
            <span className="font-semibold">{selectedPlan.download_speed} {selectedPlan.speed_unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paid with</span> 
            <span className="font-semibold">
              {isFreePlan ? "FREE Plan" : selectedPaymentMethod ? getPaymentMethodValue(selectedPaymentMethod).includes("mpesa") ? "M-Pesa" : "Selected Payment" : "Payment"}
            </span>
          </div>
          {clientInfo?.date_joined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Member since</span> 
              <span className="font-semibold">{new Date(clientInfo.date_joined).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
      >
        Start Browsing
        <Wifi className="w-6 h-6" />
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && step !== 3 && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {step !== 3 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white/80 rounded-full p-2 hover:bg-gray-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-6 pt-12">
          {step === 1 && renderPhoneInput()}
          {step === 2 && renderPaymentSelection()}
          {step === 3 && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(HotspotAuthModal);