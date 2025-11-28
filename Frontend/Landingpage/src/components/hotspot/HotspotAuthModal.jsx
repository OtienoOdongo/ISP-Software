




// import React, { useState, useEffect } from "react";
// import { 
//   Phone, CreditCard, CheckCircle, X, ArrowRight, 
//   Smartphone, Shield, Zap, RotateCw, Wifi,
//   History, Edit, AlertCircle
// } from "lucide-react";
// import mpesa from "../../assets/mpesa.png";
// import api from "../../api/index";

// const HotspotAuthModal = ({ 
//   onClose, 
//   onLoginSuccess, 
//   selectedPlan, 
//   onPaymentSuccess, 
//   existingClientData,
//   paymentMethods,
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

//   // ✅ PRODUCTION-READY: Safe payment methods extraction (same as above component)
//   const extractPaymentMethods = (data) => {
//     if (!data) return [];
    
//     if (Array.isArray(data)) return data;
    
//     if (data.results && Array.isArray(data.results)) return data.results;
//     if (data.data && Array.isArray(data.data)) return data.data;
//     if (data.payment_methods && Array.isArray(data.payment_methods)) return data.payment_methods;
    
//     if (typeof data === 'object') {
//       const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
//       if (arrayKeys.length > 0) return data[arrayKeys[0]];
//     }
    
//     return [];
//   };

//   const availablePaymentMethods = extractPaymentMethods(paymentMethods);
//   const isFreePlan = selectedPlan?.category === "promotional" && 
//                     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

//   // ✅ PRODUCTION-READY: Safe payment method selection
//   useEffect(() => {
//     if (availablePaymentMethods.length > 0) {
//       const mpesaMethod = availablePaymentMethods.find(method => {
//         const methodName = method?.name || method?.method_name || '';
//         return methodName.toLowerCase().includes('mpesa');
//       });
      
//       if (mpesaMethod) {
//         setSelectedPaymentMethod(mpesaMethod);
//       } else {
//         setSelectedPaymentMethod(availablePaymentMethods[0]);
//       }
//     }
//   }, [availablePaymentMethods]);

//   useEffect(() => {
//     const savedPhone = localStorage.getItem("hotspotClientPhone");
//     const savedClientId = localStorage.getItem("hotspotClientId");
    
//     if (existingClientData?.phoneNumber && existingClientData?.clientId) {
//       setPhoneNumber(existingClientData.phoneNumber);
//       setClientId(existingClientData.clientId);
//       setIsReturningClient(true);
//     } else if (savedPhone && savedClientId) {
//       setPhoneNumber(savedPhone);
//       setClientId(savedClientId);
//       setIsReturningClient(true);
//     }
//   }, [existingClientData]);

//   const validateAndFormatPhoneNumber = (phone) => {
//     const cleaned = phone.replace(/[^\d+]/g, "");
//     let formatted;
    
//     if (cleaned.startsWith("07") && cleaned.length === 10) {
//       formatted = `+254${cleaned.slice(1)}`;
//     } else if (cleaned.startsWith("01") && cleaned.length === 10) {
//       formatted = `+254${cleaned.slice(1)}`;
//     } else if (cleaned.startsWith("254") && cleaned.length === 12) {
//       formatted = `+${cleaned}`;
//     } else if (cleaned.startsWith("+254") && cleaned.length === 13) {
//       formatted = cleaned;
//     } else if (cleaned.length === 9 && (cleaned[0] === "7" || cleaned[0] === "1")) {
//       formatted = `+254${cleaned}`;
//     } else {
//       throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or 7XXXXXXXX");
//     }
    
//     return formatted;
//   };

//   const handlePhoneChange = (e) => {
//     const value = e.target.value;
//     const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
//     setPhoneNumber(cleanedValue);
//     setError("");
//   };

//   const findOrCreateClient = async (formattedPhone) => {
//     try {
//       const searchResponse = await api.get("/api/account/clients/search/", {
//         params: { phone_number: formattedPhone }
//       });
      
//       if (searchResponse.data && searchResponse.data.length > 0) {
//         return searchResponse.data[0];
//       }
      
//       const createResponse = await api.post("/api/account/clients/create-hotspot/", {
//         phone_number: formattedPhone,
//       });
      
//       return createResponse.data;
      
//     } catch (err) {
//       if (err.response?.status === 400) {
//         const retryResponse = await api.get("/api/account/clients/search/", {
//           params: { phone_number: formattedPhone }
//         });
//         if (retryResponse.data && retryResponse.data.length > 0) {
//           return retryResponse.data[0];
//         }
//         throw new Error("Unable to create or find client. Please verify your phone number and try again.");
//       }
//       throw err;
//     }
//   };

//   const handlePhoneSubmit = async (e) => {
//     if (e) e.preventDefault();
    
//     if (isReturningClient && clientId && !isEditingNumber) {
//       try {
//         const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
//         onLoginSuccess(formattedPhone, clientId);
        
//         if (isFreePlan) {
//           await activateFreePlan(clientId);
//         } else {
//           setStep(2);
//         }
//         return;
//       } catch (err) {
//         setError(err.message);
//         return;
//       }
//     }
    
//     setLoading(true);
//     setError("");

//     try {
//       if (!phoneNumber || phoneNumber.length < 9) {
//         throw new Error("Please enter a valid phone number");
//       }

//       const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
//       const displayPhone = `0${formattedPhone.slice(4)}`;
//       const client = await findOrCreateClient(formattedPhone);

//       if (client) {
//         setClientId(client.id);
//         onLoginSuccess(formattedPhone, client.id);
        
//         localStorage.setItem("hotspotClientPhone", displayPhone);
//         localStorage.setItem("hotspotClientId", client.id);
//         setIsReturningClient(true);
//         setIsEditingNumber(false);
        
//         if (isFreePlan) {
//           await activateFreePlan(client.id);
//         } else {
//           setStep(2);
//         }
//       }
//     } catch (err) {
//       console.error("Client error:", err);
//       setError(err.response?.data?.phone_number?.[0] || err.message || "Invalid phone number or server error.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const activateFreePlan = async (clientId) => {
//     setLoading(true);
//     try {
//       const macAddress = await getMacAddress();
//       await api.post("/api/internet_plans/purchase/", {
//         plan_id: selectedPlan.id,
//         phone_number: phoneNumber,
//         payment_method: "free",
//         access_type: "hotspot",
//         mac_address: macAddress
//       });
      
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(3);
//     } catch (err) {
//       setError("Failed to activate plan. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     if (!selectedPaymentMethod) {
//       setError("Please select a payment method");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setPaymentInProgress(true);

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
//       const paymentMethodId = selectedPaymentMethod.id || selectedPaymentMethod.method_id;
      
//       if (!paymentMethodId) {
//         throw new Error("Invalid payment method selected");
//       }

//       const paymentResponse = await api.post("/api/payments/initiate-payment/", {
//         gateway_id: paymentMethodId,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//         phone_number: formattedPhone,
//         access_type: "hotspot"
//       });

//       if (paymentResponse.data.success) {
//         const macAddress = await getMacAddress();
        
//         if (selectedPaymentMethod.name?.includes('mpesa')) {
//           await waitForMpesaPayment(paymentResponse.data.transaction_id, clientId, macAddress);
//         } else {
//           await completePaymentActivation(paymentResponse.data.transaction_id, clientId, macAddress);
//         }
//       } else {
//         throw new Error(paymentResponse.data.error || "Payment initiation failed");
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || err.message || "Payment failed. Please try again.");
//       setPaymentInProgress(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const waitForMpesaPayment = async (transactionId, clientId, macAddress) => {
//     const maxAttempts = 30;
//     let attempts = 0;

//     const checkInterval = setInterval(async () => {
//       attempts++;
//       try {
//         const statusResponse = await api.get(`/api/payments/transactions/${transactionId}/status/`);
        
//         if (statusResponse.data.status === 'completed') {
//           clearInterval(checkInterval);
//           await completePaymentActivation(transactionId, clientId, macAddress);
//         } else if (statusResponse.data.status === 'failed') {
//           clearInterval(checkInterval);
//           setError("Payment failed. Please try again.");
//           setPaymentInProgress(false);
//         } else if (attempts >= maxAttempts) {
//           clearInterval(checkInterval);
//           setError("Payment timeout. Please check your M-Pesa messages.");
//           setPaymentInProgress(false);
//         }
//       } catch (err) {
//         console.error("Payment status check failed:", err);
//       }
//     }, 5000);
//   };

//   const completePaymentActivation = async (transactionId, clientId, macAddress) => {
//     try {
//       await api.post("/api/internet_plans/activate/", {
//         plan_id: selectedPlan.id,
//         phone_number: phoneNumber,
//         payment_method: selectedPaymentMethod.name,
//         access_type: "hotspot",
//         mac_address: macAddress,
//         transaction_id: transactionId
//       });

//       localStorage.setItem("hotspotClientPhone", `0${validateAndFormatPhoneNumber(phoneNumber).slice(4)}`);
//       localStorage.setItem("hotspotClientId", clientId);
      
//       onPaymentSuccess(selectedPlan.name, false);
//       setPaymentInProgress(false);
//       setStep(3);
//     } catch (err) {
//       setError("Activation failed after payment. Please contact support.");
//       setPaymentInProgress(false);
//     }
//   };

//   const renderReturningClientUI = () => (
//     <div className="space-y-4">
//       <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//             <History className="w-5 h-5 text-green-600" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-800">Registered Number</p>
//             <p className="text-lg font-bold text-green-700">{phoneNumber}</p>
//           </div>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <button
//           onClick={() => handlePhoneSubmit()}
//           disabled={loading}
//           className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//         >
//           {loading ? (
//             <>
//               <RotateCw className="w-4 h-4 animate-spin" />
//               Continuing...
//             </>
//           ) : (
//             <>
//               Continue as {phoneNumber}
//               <ArrowRight className="w-4 h-4" />
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => setIsEditingNumber(true)}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
//         >
//           <Edit className="w-5 h-5" />
//           Use Different Number
//         </button>
//       </div>
//     </div>
//   );

//   const renderPhoneInput = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <Smartphone className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">
//           {isReturningClient && !isEditingNumber ? 'Welcome Back!' : 'Enter Your Phone Number'}
//         </h3>
//         <p className="text-sm text-gray-600">
//           {isReturningClient && !isEditingNumber 
//             ? 'We recognize your number from previous visits.' 
//             : 'We\'ll use this to process your payment and activate your plan'}
//         </p>
//       </div>

//       {isReturningClient && !isEditingNumber ? (
//         renderReturningClientUI()
//       ) : (
//         <form onSubmit={handlePhoneSubmit} className="space-y-4">
//           <div className="relative">
//             <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//               Phone Number
//             </label>
//             <div className="relative">
//               <input
//                 type="tel"
//                 value={phoneNumber}
//                 onChange={handlePhoneChange}
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white"
//                 placeholder="07XXXXXXXX or 7XXXXXXXX"
//                 required
//                 maxLength="10"
//               />
//               <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                 <Phone className="w-4 h-4 text-gray-400" />
//               </div>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number (e.g., 07XXXXXXXX)</p>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//               <p className="text-red-600 text-xs font-medium flex items-center gap-2">
//                 <AlertCircle className="w-4 h-4" />
//                 {error}
//               </p>
//             </div>
//           )}

//           <div className="space-y-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//             >
//               {loading ? (
//                 <>
//                   <RotateCw className="w-4 h-4 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   {isFreePlan ? 'Activate Now' : 'Continue to Payment'}
//                   <ArrowRight className="w-4 h-4" />
//                 </>
//               )}
//             </button>

//             {isReturningClient && isEditingNumber && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setIsEditingNumber(false);
//                   setPhoneNumber(localStorage.getItem("hotspotClientPhone") || "");
//                 }}
//                 className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       )}

//       <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
//         <div className="flex items-start gap-2">
//           <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
//           <div>
//             <p className="text-xs font-medium text-blue-800">Your data is secure</p>
//             <p className="text-xs text-blue-600">We use encryption to protect your personal information</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPaymentSelection = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <CreditCard className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Select Payment Method</h3>
//         <p className="text-sm text-gray-600">Choose how you'd like to pay for your plan</p>
//       </div>

//       {availablePaymentMethods.length === 0 ? (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
//           <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
//           <p className="text-yellow-800 text-sm">No payment methods available. Please try again later.</p>
//         </div>
//       ) : (
//         <>
//           <div className="space-y-3">
//             {availablePaymentMethods.map((method, index) => {
//               const methodId = method?.id || method?.method_id || `method-${index}`;
//               const methodName = method?.name || method?.method_name || method?.type || 'unknown';
//               const isActive = method?.is_active !== false;
              
//               if (!isActive) return null;

//               return (
//                 <div
//                   key={methodId}
//                   className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                     selectedPaymentMethod?.id === methodId
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                   onClick={() => setSelectedPaymentMethod(method)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {methodName.toLowerCase().includes('mpesa') ? (
//                         <img src={mpesa} alt="M-Pesa" className="w-8 h-8" />
//                       ) : (
//                         <CreditCard className="w-6 h-6 text-gray-600" />
//                       )}
//                       <div>
//                         <p className="font-medium text-gray-800">
//                           {methodName === 'mpesa_paybill' ? 'M-Pesa Paybill' :
//                            methodName === 'mpesa_till' ? 'M-Pesa Till' :
//                            methodName === 'bank_transfer' ? 'Bank Transfer' :
//                            methodName === 'paypal' ? 'PayPal' : 
//                            methodName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {methodName.includes('mpesa') 
//                             ? 'Pay with your M-Pesa account' 
//                             : methodName === 'bank_transfer'
//                             ? 'Bank transfer or deposit'
//                             : 'Secure online payment'}
//                         </p>
//                       </div>
//                     </div>
//                     {selectedPaymentMethod?.id === methodId && (
//                       <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
//                         <CheckCircle className="w-3 h-3 text-white" />
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {selectedPaymentMethod && (
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
//               <div className="text-center mb-4">
//                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
//                   <Zap className="w-5 h-5 text-white" />
//                 </div>
//                 <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
//                 <p className="text-2xl font-extrabold text-blue-600 mt-1">
//                   KES {Number(selectedPlan.price).toLocaleString()}
//                 </p>
//               </div>

//               <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Data Limit:</span>
//                   <span className="font-semibold text-gray-800">
//                     {selectedPlan.data_limit_display || 'Unlimited'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Download Speed:</span>
//                   <span className="font-semibold text-gray-800">
//                     {selectedPlan.download_speed || '10 Mbps'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Phone Number:</span>
//                   <span className="font-semibold text-gray-800">{phoneNumber}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">Payment Method:</span>
//                   <span className="font-semibold text-gray-800">
//                     {selectedPaymentMethod.name === 'mpesa_paybill' ? 'M-Pesa Paybill' :
//                      selectedPaymentMethod.name === 'mpesa_till' ? 'M-Pesa Till' :
//                      selectedPaymentMethod.name}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <p className="text-red-600 text-xs font-medium flex items-center gap-2">
//             <AlertCircle className="w-4 h-4" />
//             {error}
//           </p>
//         </div>
//       )}

//       <div className="space-y-2">
//         <button
//           onClick={handlePayment}
//           disabled={!selectedPaymentMethod || loading || paymentInProgress || availablePaymentMethods.length === 0}
//           className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm"
//         >
//           {paymentInProgress ? (
//             <>
//               <RotateCw className="w-5 h-5 animate-spin" />
//               Processing Payment...
//             </>
//           ) : selectedPaymentMethod?.name?.includes('mpesa') ? (
//             <>
//               <span>Pay with M-Pesa</span>
//               <img src={mpesa} alt="M-Pesa" className="h-6 w-6" />
//             </>
//           ) : (
//             <>
//               <span>Pay with {selectedPaymentMethod?.name}</span>
//               <CreditCard className="w-5 h-5" />
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => setStep(1)}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
//         >
//           <Edit className="w-5 h-5" />
//           Change Phone Number
//         </button>
//       </div>
//     </div>
//   );

//   const renderSuccess = () => (
//     <div className="text-center space-y-4">
//       <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
//         <CheckCircle className="w-8 h-8 text-white" />
//       </div>

//       <div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">You're Connected!</h3>
//         <p className="text-sm text-gray-600">Your internet plan has been activated successfully</p>
//       </div>

//       <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
//         <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name}</h4>
//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-600">Data:</span>
//             <span className="font-medium text-gray-800">
//               {selectedPlan.data_limit_display || 'Unlimited'}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Speed:</span>
//             <span className="font-medium text-gray-800">
//               {selectedPlan.download_speed || '10 Mbps'}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Payment:</span>
//             <span className="font-medium text-gray-800">
//               {isFreePlan ? 'FREE' : selectedPaymentMethod?.name?.includes('mpesa') ? 'M-Pesa' : selectedPaymentMethod?.name}
//             </span>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={onClose}
//         className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//       >
//         Start Browsing
//         <Wifi className="w-4 h-4" />
//       </button>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
//       <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border border-gray-100 relative">
//         {step !== 3 && (
//           <button 
//             onClick={onClose}
//             className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         )}
        
//         {step === 1 && renderPhoneInput()}
//         {step === 2 && renderPaymentSelection()}
//         {step === 3 && renderSuccess()}
//       </div>
//     </div>
//   );
// };

// export default HotspotAuthModal;









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
//   paymentMethods = {},
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

//   const isFreePlan = selectedPlan?.category === "promotional" || parseFloat(selectedPlan?.price || 0) === 0;

//   // Extract available methods safely
//   const availableMethods = React.useMemo(() => {
//     if (!paymentMethods) return [];
//     if (Array.isArray(paymentMethods)) return paymentMethods;
//     return paymentMethods.available_methods || paymentMethods.payment_methods || [];
//   }, [paymentMethods]);

//   // Auto-select M-Pesa if available
//   useEffect(() => {
//     if (availableMethods.length > 0 && !selectedPaymentMethod) {
//       const mpesa = availableMethods.find(m =>
//         (m.name || m.method_name || m.code || "").toLowerCase().includes("mpesa")
//       );
//       setSelectedPaymentMethod(mpesa || availableMethods[0]);
//     }
//   }, [availableMethods, selectedPaymentMethod]);

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
//       await api.post("/api/internet_plans/purchase/", {
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
//     if (!selectedPaymentMethod) return setError("Please select a payment method");

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
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pollMpesaStatus = (txId, clientId, mac) => {
//     let attempts = 0;
//     const maxAttempts = 36;

//     const interval = setInterval(async () => {
//       attempts++;
//       try {
//         const { data } = await api.get(`/api/payments/transactions/${txId}/status/`);
//         if (data.status === "completed") {
//           clearInterval(interval);
//           await completeActivation(txId, clientId, mac);
//         } else if (data.status === "failed" || attempts >= maxAttempts) {
//           clearInterval(interval);
//           setError(data.status === "failed" ? "Payment failed" : "Payment timed out. Check M-Pesa.");
//           setPaymentInProgress(false);
//         }
//       } catch {
//         if (attempts >= maxAttempts) {
//           clearInterval(interval);
//           setError("Connection lost. Please try again.");
//           setPaymentInProgress(false);
//         }
//       }
//     }, 5000);
//   };

//   const completeActivation = async (txId, clientId, mac) => {
//     try {
//       await api.post("/api/internet_plans/activate/", {
//         plan_id: selectedPlan.id,
//         phone_number: formatPhone(phoneNumber),
//         payment_method: selectedPaymentMethod.name || selectedPaymentMethod.code,
//         access_type: "hotspot",
//         mac_address: mac,
//         transaction_id: txId
//       });

//       localStorage.setItem("hotspotClientPhone", phoneNumber);
//       localStorage.setItem("hotspotClientId", clientId);

//       onPaymentSuccess(selectedPlan.name, false);
//       setStep(3);
//       setPaymentInProgress(false);
//     } catch (err) {
//       setError("Activation failed. Contact support.");
//       setPaymentInProgress(false);
//     }
//   };

//   // === RENDER FUNCTIONS ===

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
//         <div className="text-center py-8">
//           <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
//           <p className="text-gray-600">No payment methods available. Please try again later.</p>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {availableMethods
//             .filter(m => m?.is_active !== false && m?.enabled !== false)
//             .map((method) => {
//               const id = method.id || method.method_id || method.code;
//               const name = (method.name || method.method_name || method.code || "Unknown").toLowerCase();
//               const displayName = name.includes("mpesa_paybill") ? "M-Pesa Paybill" :
//                                 name.includes("mpesa_till") ? "M-Pesa Till" :
//                                 name.includes("mpesa") ? "M-Pesa" :
//                                 name.includes("bank") ? "Bank Transfer" :
//                                 name.includes("paypal") ? "PayPal" : method.name || "Payment";

//               const isMpesa = name.includes("mpesa");
//               const isSelected = selectedPaymentMethod?.id === id || selectedPaymentMethod?.method_id === id;

//               return (
//                 <div
//                   key={id}
//                   onClick={() => setSelectedPaymentMethod(method)}
//                   className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
//                     isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
//                   }`}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       {isMpesa ? (
//                         <img src={mpesa} alt="M-Pesa" className="w-12 h-12" />
//                       ) : (
//                         <CreditCard className="w-10 h-10 text-gray-600" />
//                       )}
//                       <div>
//                         <p className="font-semibold text-gray-800">{displayName}</p>
//                         <p className="text-sm text-gray-600">
//                           {isMpesa ? "Instant activation via M-Pesa" : "Secure payment"}
//                         </p>
//                       </div>
//                     </div>
//                     {isSelected && <CheckCircle className="w-7 h-7 text-blue-600" />}
//                   </div>
//                 </div>
//               );
//             })}
//         </div>
//       )}

//       {selectedPaymentMethod && (
//         <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
//           <div className="text-center mb-4">
//             <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
//             <h4 className="text-xl font-bold text-gray-800">{selectedPlan.name}</h4>
//             <p className="text-3xl font-extrabold text-blue-600 mt-2">
//               KES {Number(selectedPlan.price).toLocaleString()}
//             </p>
//           </div>
//           <div className="bg-white rounded-lg p-4 space-y-3 text-sm">
//             <div className="flex justify-between"><span className="text-gray-600">Data:</span> <span className="font-semibold">{selectedPlan.data_limit_display || "Unlimited"}</span></div>
//             <div className="flex justify-between"><span className="text-gray-600">Speed:</span> <span className="font-semibold">{selectedPlan.download_speed || "Up to 10Mbps"}</span></div>
//             <div className="flex justify-between"><span className="text-gray-600">Phone:</span> <span className="font-semibold">{phoneNumber}</span></div>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
//           <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//           <p className="text-sm text-red-700">{error}</p>
//         </div>
//       )}

//       <div className="space-y-3">
//         <button
//           onClick={handlePayment}
//           disabled={!selectedPaymentMethod || loading || paymentInProgress}
//           className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
//         >
//           {paymentInProgress ? (
//             <>
//               <RotateCw className="w-6 h-6 animate-spin" />
//               Processing Payment...
//             </>
//           ) : selectedPaymentMethod?.name?.toLowerCase().includes("mpesa") ? (
//             <>
//               Pay with M-Pesa
//               <img src={mpesa} alt="M-Pesa" className="h-8" />
//             </>
//           ) : (
//             "Complete Payment"
//           )}
//         </button>

//         <button
//           onClick={() => setStep(1)}
//           className="w-full py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-center gap-2"
//         >
//           <Edit className="w-5 h-5" />
//           Change Phone Number
//         </button>
//       </div>
//     </div>
//   );

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
//           <div className="flex justify-between"><span className="text-gray-600">Data</span> <span className="font-semibold">{selectedPlan.data_limit_display || "Unlimited"}</span></div>
//           <div className="flex justify-between"><span className="text-gray-600">Speed</span> <span className="font-semibold">{selectedPlan.download_speed || "10 Mbps"}</span></div>
//           <div className="flex justify-between"><span className="text-gray-600">Paid with</span> <span className="font-semibold">{isFreePlan ? "FREE Plan" : selectedPaymentMethod?.name?.includes("mpesa") ? "M-Pesa" : selectedPaymentMethod?.name}</span></div>
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
  const [isReturningClient, setIsReturningClient] = useState(false);
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [availableMethods, setAvailableMethods] = useState([]);

  const isFreePlan = selectedPlan?.plan_type === "Free Trial" || parseFloat(selectedPlan?.price || 0) === 0;

  // Improved payment methods extraction
  useEffect(() => {
    const extractMethods = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;

      // Handle different API response structures
      const keysToCheck = ["available_methods", "payment_methods", "results", "data", "methods"];
      for (const key of keysToCheck) {
        if (data[key] && Array.isArray(data[key])) {
          return data[key];
        }
      }

      // Fallback: return empty array if no methods found
      return [];
    };

    const methods = extractMethods(paymentMethods);
    setAvailableMethods(methods);

    // Auto-select first available method
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
    } else {
      const saved = localStorage.getItem("hotspotClientPhone");
      const savedId = localStorage.getItem("hotspotClientId");
      if (saved && savedId) {
        setPhoneNumber(saved);
        setClientId(savedId);
        setIsReturningClient(true);
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

  const findOrCreateClient = async (formatted) => {
    try {
      const { data } = await api.get("/api/account/clients/search/", { params: { phone_number: formatted } });
      if (data?.length > 0) return data[0];

      const createRes = await api.post("/api/account/clients/create-hotspot/", { phone_number: formatted });
      return createRes.data;
    } catch (err) {
      throw new Error("Failed to register. Please try again.");
    }
  };

  const handlePhoneSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formatted = formatPhone(phoneNumber);
      const display = `0${formatted.slice(4)}`;
      const client = await findOrCreateClient(formatted);

      setClientId(client.id);
      localStorage.setItem("hotspotClientPhone", display);
      localStorage.setItem("hotspotClientId", client.id);
      setIsReturningClient(true);
      onLoginSuccess(formatted, client.id);

      if (isFreePlan) {
        await activateFreePlan(client.id, formatted);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError(err.message || "Invalid phone number");
    } finally {
      setLoading(false);
    }
  };

  const activateFreePlan = async (id, phone) => {
    setLoading(true);
    try {
      const mac = await getMacAddress();
      await api.post("/api/internet_plans/client/purchase/", {
        plan_id: selectedPlan.id,
        phone_number: phone,
        payment_method: "free",
        access_type: "hotspot",
        mac_address: mac
      });
      onPaymentSuccess(selectedPlan.name, true);
      setStep(3);
    } catch {
      setError("Failed to activate free plan");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    if (availableMethods.length === 0) {
      setError("No payment methods available. Please try again later.");
      return;
    }

    setLoading(true);
    setPaymentInProgress(true);
    setError("");

    try {
      const formatted = formatPhone(phoneNumber);
      const gatewayId = selectedPaymentMethod.id || selectedPaymentMethod.method_id;

      const { data } = await api.post("/api/payments/initiate-payment/", {
        gateway_id: gatewayId,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
        phone_number: formatted,
        access_type: "hotspot"
      });

      if (!data.success) throw new Error(data.error || "Payment initiation failed");

      const mac = await getMacAddress();
      const methodName = (selectedPaymentMethod.name || selectedPaymentMethod.code || "").toLowerCase();

      if (methodName.includes("mpesa")) {
        pollMpesaStatus(data.transaction_id, clientId, mac);
      } else {
        await completeActivation(data.transaction_id, clientId, mac);
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
      setPaymentInProgress(false);
      setLoading(false);
    }
  };

  const pollMpesaStatus = (txId, clientId, mac) => {
    let attempts = 0;
    const maxAttempts = 30; // 2.5 minutes max

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await api.get(`/api/payments/transactions/${txId}/status/`);
        
        if (data.status === "completed") {
          clearInterval(interval);
          await completeActivation(txId, clientId, mac);
        } else if (data.status === "failed" || attempts >= maxAttempts) {
          clearInterval(interval);
          setError(data.status === "failed" ? "Payment failed. Please try again." : "Payment timed out. Please check your M-Pesa.");
          setPaymentInProgress(false);
          setLoading(false);
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError("Connection lost. Please try again.");
          setPaymentInProgress(false);
          setLoading(false);
        }
      }
    }, 5000);
  };

  const completeActivation = async (txId, clientId, mac) => {
    try {
      await api.post("/api/internet_plans/payment-callback/", {
        subscription_id: clientId, // This should be the actual subscription ID
        reference: txId,
        status: 'completed',
        plan_id: selectedPlan.id
      });

      localStorage.setItem("hotspotClientPhone", phoneNumber);
      localStorage.setItem("hotspotClientId", clientId);

      onPaymentSuccess(selectedPlan.name, false);
      setStep(3);
    } catch (err) {
      setError("Activation failed. Please contact support.");
      console.error("Activation error:", err);
    } finally {
      setPaymentInProgress(false);
      setLoading(false);
    }
  };

  // COMPLETED: Phone Input Form
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

  // COMPLETED: Payment Selection (already provided)
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
              const id = method.id || method.method_id || method.code;
              const name = (method.name || method.method_name || method.code || "Unknown").toLowerCase();
              const displayName = name.includes("mpesa_paybill") ? "M-Pesa Paybill" :
                                name.includes("mpesa_till") ? "M-Pesa Till" :
                                name.includes("mpesa") ? "M-Pesa" :
                                name.includes("bank") ? "Bank Transfer" :
                                name.includes("paypal") ? "PayPal" : 
                                method.name || "Payment";

              const isMpesa = name.includes("mpesa");
              const isSelected = selectedPaymentMethod?.id === id || 
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
              ) : selectedPaymentMethod?.name?.toLowerCase().includes("mpesa") ? (
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

  // COMPLETED: Success Screen
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
              {isFreePlan ? "FREE Plan" : selectedPaymentMethod?.name?.includes("mpesa") ? "M-Pesa" : selectedPaymentMethod?.name}
            </span>
          </div>
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

  // COMPLETED: Main Return Statement
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