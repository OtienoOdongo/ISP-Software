

// import React, { useState, useEffect, useCallback } from "react";
// import { 
//   Phone, CreditCard, CheckCircle, X, ArrowRight, 
//   User, Lock, Shield, Zap, RotateCw, Wifi,
//   Edit, AlertCircle, Mail
// } from "lucide-react";
// import mpesa from "../../assets/mpesa.png";
// import api from "../../api/index";

// const PPPoEAuthModal = ({ 
//   onClose, 
//   selectedPlan, 
//   onPaymentSuccess, 
//   onRegistrationSuccess,
//   clientData,
//   paymentMethods,
//   isAuthenticated
// }) => {
//   const [step, setStep] = useState(1);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const isFreePlan = selectedPlan?.price === 0 || selectedPlan?.plan_type === "Free Trial";

//   // Set default payment method
//   useEffect(() => {
//     const mpesaMethod = paymentMethods.find(method => 
//       method.name === 'mpesa_paybill' || method.name === 'mpesa_till'
//     );
//     if (mpesaMethod) {
//       setSelectedPaymentMethod(mpesaMethod);
//     } else if (paymentMethods.length > 0) {
//       setSelectedPaymentMethod(paymentMethods[0]);
//     }
//   }, [paymentMethods]);

//   // Pre-fill data if user is authenticated
//   useEffect(() => {
//     if (isAuthenticated && clientData) {
//       setPhoneNumber(clientData.phone_number || "");
//       if (clientData.pppoe_username) {
//         setUsername(clientData.pppoe_username);
//       }
//       setStep(2);
//     }
//   }, [isAuthenticated, clientData]);

//   const validateAndFormatPhoneNumber = useCallback((phone) => {
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
//   }, []);

//   const handlePhoneChange = useCallback((e) => {
//     const value = e.target.value;
//     const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
//     setPhoneNumber(cleanedValue);
//   }, []);

//   const generatePPPoEUsername = useCallback((phone) => {
//     const cleanPhone = phone.replace(/\D/g, '').slice(-8);
//     return `pppoe${cleanPhone}`;
//   }, []);

//   const handleRegistration = async (e) => {
//     if (e) e.preventDefault();
    
//     setLoading(true);
//     setError("");

//     try {
//       // Validation
//       if (!phoneNumber || phoneNumber.length < 9) {
//         throw new Error("Please enter a valid phone number");
//       }

//       if (!isAuthenticated) {
//         if (password.length < 6) {
//           throw new Error("Password must be at least 6 characters long");
//         }

//         if (password !== confirmPassword) {
//           throw new Error("Passwords do not match");
//         }
//       }

//       const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
//       const pppoeUsername = username || generatePPPoEUsername(phoneNumber);

//       if (isAuthenticated) {
//         // Existing user - proceed to payment
//         setStep(2);
//       } else {
//         // New user - register first
//         const response = await api.post("/api/auth/clients/pppoe/", {
//           phone_number: formattedPhone,
//           pppoe_username: pppoeUsername,
//           pppoe_password: password,
//           connection_type: "pppoe"
//         }, { timeout: 5000 });

//         if (response.data.id || response.data.success) {
//           const client = response.data.client || response.data;
//           onRegistrationSuccess(client);
          
//           if (isFreePlan) {
//             await activateFreePlan(client.id, pppoeUsername);
//           } else {
//             setStep(2);
//           }
//         } else {
//           throw new Error(response.data.error || "Registration failed");
//         }
//       }
//     } catch (err) {
//       console.error("Registration error:", err);
//       setError(err.response?.data?.error || err.message || "Registration failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const activateFreePlan = async (clientId, pppoeUsername) => {
//     setLoading(true);
//     try {
//       const response = await api.post("/api/internet_plans/client/purchase/", {
//         plan_id: selectedPlan.id,
//         phone_number: phoneNumber,
//         payment_method: "free",
//         access_type: "pppoe",
//         pppoe_username: pppoeUsername
//       }, { timeout: 5000 });

//       if (response.data.success) {
//         onPaymentSuccess(selectedPlan.name, true);
//         setStep(3);
//       } else {
//         throw new Error(response.data.error || "Failed to activate free plan");
//       }
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
//       const pppoeUsername = username || generatePPPoEUsername(phoneNumber);
      
//       // Initiate payment
//       const paymentResponse = await api.post("/api/payments/initiate/", {
//         gateway_id: selectedPaymentMethod.id,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//         phone_number: formattedPhone,
//         access_type: "pppoe",
//         pppoe_username: pppoeUsername
//       }, { timeout: 5000 });

//       if (paymentResponse.data.success) {
//         const transactionId = paymentResponse.data.transaction_id;
        
//         // For M-Pesa, wait for callback
//         if (selectedPaymentMethod.name.includes('mpesa')) {
//           await waitForMpesaPayment(transactionId, pppoeUsername);
//         } else {
//           await completePaymentActivation(transactionId, pppoeUsername);
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

//   const waitForMpesaPayment = async (transactionId, pppoeUsername) => {
//     const maxAttempts = 12;
//     let attempts = 0;

//     return new Promise((resolve, reject) => {
//       const interval = setInterval(async () => {
//         attempts++;
//         try {
//           const statusResponse = await api.get(`/api/payments/transaction-status/${transactionId}/`, { timeout: 3000 });
          
//           if (statusResponse.data.status === 'completed') {
//             clearInterval(interval);
//             await completePaymentActivation(transactionId, pppoeUsername);
//             resolve();
//           } else if (statusResponse.data.status === 'failed') {
//             clearInterval(interval);
//             setError("Payment failed. Please try again.");
//             setPaymentInProgress(false);
//             reject(new Error("Payment failed"));
//           } else if (attempts >= maxAttempts) {
//             clearInterval(interval);
//             setError("Payment timeout. Please check your M-Pesa messages.");
//             setPaymentInProgress(false);
//             reject(new Error("Payment timeout"));
//           }
//         } catch (err) {
//           console.error("Payment status check failed:", err);
//           if (attempts >= maxAttempts) {
//             clearInterval(interval);
//             setError("Payment status check failed. Please contact support.");
//             setPaymentInProgress(false);
//             reject(new Error("Payment status check failed"));
//           }
//         }
//       }, 5000);
//     });
//   };

//   const completePaymentActivation = async (transactionId, pppoeUsername) => {
//     try {
//       const response = await api.post("/api/internet_plans/client/purchase/", {
//         plan_id: selectedPlan.id,
//         phone_number: phoneNumber,
//         payment_method: selectedPaymentMethod.name,
//         access_type: "pppoe",
//         pppoe_username: pppoeUsername,
//         transaction_reference: transactionId
//       }, { timeout: 5000 });

//       if (response.data.success) {
//         onPaymentSuccess(selectedPlan.name, false);
//         setPaymentInProgress(false);
//         setStep(3);
//       } else {
//         throw new Error(response.data.error || "Activation failed after payment");
//       }
//     } catch (err) {
//       setError("Activation failed after payment. Please contact support.");
//       setPaymentInProgress(false);
//     }
//   };

//   const renderRegistrationForm = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <Wifi className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">
//           {isAuthenticated ? 'Upgrade PPPoE Plan' : 'Create PPPoE Account'}
//         </h3>
//         <p className="text-sm text-gray-600">
//           {isAuthenticated 
//             ? 'Upgrade your current PPPoE plan for better speeds and features'
//             : 'Create your PPPoE account to get started with wired internet'}
//         </p>
//       </div>

//       <form onSubmit={handleRegistration} className="space-y-4">
//         <div>
//           <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//             Phone Number
//           </label>
//           <div className="relative">
//             <input
//               type="tel"
//               value={phoneNumber}
//               onChange={handlePhoneChange}
//               className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
//               placeholder="07XXXXXXXX or 7XXXXXXXX"
//               required
//               maxLength="10"
//               disabled={isAuthenticated || loading}
//             />
//             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//               <Phone className="w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number</p>
//         </div>

//         <div>
//           <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//             PPPoE Username
//           </label>
//           <div className="relative">
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
//               placeholder="pppoe_username"
//               required
//               disabled={(isAuthenticated && clientData?.pppoe_username) || loading}
//             />
//             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//               <User className="w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             {!username && "Will be auto-generated if left empty"}
//           </p>
//         </div>

//         {!isAuthenticated && (
//           <>
//             <div>
//               <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//                 PPPoE Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   placeholder="Create a secure password"
//                   required
//                   minLength={6}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={loading}
//                 >
//                   {showPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showConfirmPassword ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   placeholder="Confirm your password"
//                   required
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   disabled={loading}
//                 >
//                   {showConfirmPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
//                 </button>
//               </div>
//             </div>
//           </>
//         )}

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//             <div className="flex items-start gap-2">
//               <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//               <p className="text-red-700 text-sm">{error}</p>
//             </div>
//           </div>
//         )}

//         <div className="space-y-2">
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <>
//                 <RotateCw className="w-4 h-4 animate-spin" />
//                 {isAuthenticated ? 'Processing...' : 'Creating Account...'}
//               </>
//             ) : (
//               <>
//                 {isFreePlan ? 'Activate Free Plan' : 'Continue to Payment'}
//                 <ArrowRight className="w-4 h-4" />
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );

//   const renderPaymentSelection = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <CreditCard className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Select Payment Method</h3>
//         <p className="text-sm text-gray-600">Choose how you'd like to pay for your PPPoE plan</p>
//       </div>

//       <div className="space-y-3">
//         {paymentMethods.map((method) => (
//           <div
//             key={method.id}
//             className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
//               selectedPaymentMethod?.id === method.id
//                 ? 'border-blue-500 bg-blue-50'
//                 : 'border-gray-200 hover:border-gray-300'
//             }`}
//             onClick={() => setSelectedPaymentMethod(method)}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 {method.name.includes('mpesa') ? (
//                   <img src={mpesa} alt="M-Pesa" className="w-8 h-8" />
//                 ) : (
//                   <CreditCard className="w-6 h-6 text-gray-600" />
//                 )}
//                 <div>
//                   <p className="font-medium text-gray-800">
//                     {method.display_name || method.name}
//                   </p>
//                   <p className="text-sm text-gray-600">{method.description}</p>
//                 </div>
//               </div>
//               {selectedPaymentMethod?.id === method.id && (
//                 <CheckCircle className="w-5 h-5 text-blue-500" />
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {selectedPaymentMethod && selectedPlan && (
//         <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
//           <div className="text-center mb-4">
//             <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
//             <p className="text-2xl font-extrabold text-blue-600 mt-1">
//               KES {Number(selectedPlan.price).toLocaleString()}
//             </p>
//           </div>

//           <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Connection Type:</span>
//               <span className="font-semibold text-gray-800">PPPoE</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Username:</span>
//               <span className="font-semibold text-gray-800">{username}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Phone Number:</span>
//               <span className="font-semibold text-gray-800">{phoneNumber}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//             <p className="text-red-700 text-sm">{error}</p>
//           </div>
//         </div>
//       )}

//       <div className="space-y-2">
//         <button
//           onClick={handlePayment}
//           disabled={!selectedPaymentMethod || loading || paymentInProgress}
//           className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm disabled:cursor-not-allowed"
//         >
//           {paymentInProgress ? (
//             <>
//               <RotateCw className="w-5 h-5 animate-spin" />
//               Processing Payment...
//             </>
//           ) : selectedPaymentMethod?.name.includes('mpesa') ? (
//             <>
//               <span>Pay with M-Pesa</span>
//               <img src={mpesa} alt="M-Pesa" className="h-6 w-6" />
//             </>
//           ) : (
//             <>
//               <span>Pay with {selectedPaymentMethod?.display_name}</span>
//               <CreditCard className="w-5 h-5" />
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => setStep(1)}
//           disabled={loading || paymentInProgress}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Edit className="w-5 h-5" />
//           Back to Details
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
//         <h3 className="text-xl font-bold text-gray-800 mb-1">
//           {isFreePlan ? 'PPPoE Account Created!' : 'Payment Successful!'}
//         </h3>
//         <p className="text-sm text-gray-600">
//           {isFreePlan 
//             ? 'Your free PPPoE plan has been activated successfully'
//             : 'Your PPPoE plan has been activated and payment processed'}
//         </p>
//       </div>

//       <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
//         <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name}</h4>
//         <div className="space-y-2 text-sm">
//           <div className="flex justify-between">
//             <span className="text-gray-600">PPPoE Username:</span>
//             <span className="font-medium text-gray-800">{username}</span>
//           </div>
//           {!isAuthenticated && (
//             <div className="flex justify-between">
//               <span className="text-gray-600">PPPoE Password:</span>
//               <span className="font-medium text-gray-800">••••••••</span>
//             </div>
//           )}
//           <div className="flex justify-between">
//             <span className="text-gray-600">Connection Type:</span>
//             <span className="font-medium text-gray-800">PPPoE</span>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={onClose}
//         className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//       >
//         {isAuthenticated ? 'Back to Dashboard' : 'Configure Router'}
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
//             disabled={loading || paymentInProgress}
//             className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         )}
        
//         {step === 1 && renderRegistrationForm()}
//         {step === 2 && renderPaymentSelection()}
//         {step === 3 && renderSuccess()}
//       </div>
//     </div>
//   );
// };

// export default PPPoEAuthModal;










import React, { useState, useEffect } from "react";
import { 
  Phone, CreditCard, CheckCircle, X, ArrowRight, 
  User, Lock, Shield, Zap, RotateCw, Wifi,
  Edit, AlertCircle, Mail, Crown
} from "lucide-react";
import mpesa from "../../assets/mpesa.png";
import api from "../../api/index";

const PPPoEAuthModal = ({ 
  onClose, 
  selectedPlan, 
  onPaymentSuccess, 
  onRegistrationSuccess,
  clientData,
  paymentMethods,
  isAuthenticated,
  isAdmin = false
}) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminSetup, setAdminSetup] = useState(isAdmin);

  const isFreePlan = selectedPlan?.price === 0 || selectedPlan?.plan_type === "Free Trial";

  // Set default payment method
  useEffect(() => {
    const mpesaMethod = paymentMethods.find(method => 
      method.name === 'mpesa_paybill' || method.name === 'mpesa_till'
    );
    if (mpesaMethod) {
      setSelectedPaymentMethod(mpesaMethod);
    } else if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0]);
    }
  }, [paymentMethods]);

  // Pre-fill data if user is authenticated
  useEffect(() => {
    if (isAuthenticated && clientData) {
      setPhoneNumber(clientData.phone_number || "");
      if (clientData.pppoe_username) {
        setUsername(clientData.pppoe_username);
      }
      setStep(2);
    }
    
    // If user is admin, show admin setup options
    if (isAdmin) {
      setAdminSetup(true);
    }
  }, [isAuthenticated, clientData, isAdmin]);

  const validateAndFormatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^\d+]/g, "");
    let formatted;
    
    if (cleaned.startsWith("07") && cleaned.length === 10) {
      formatted = `+254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("01") && cleaned.length === 10) {
      formatted = `+254${cleaned.slice(1)}`;
    } else if (cleaned.startsWith("254") && cleaned.length === 12) {
      formatted = `+${cleaned}`;
    } else if (cleaned.startsWith("+254") && cleaned.length === 13) {
      formatted = cleaned;
    } else if (cleaned.length === 9 && (cleaned[0] === "7" || cleaned[0] === "1")) {
      formatted = `+254${cleaned}`;
    } else {
      throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or 7XXXXXXXX");
    }
    
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanedValue);
  };

  const generatePPPoEUsername = (phone) => {
    if (adminSetup) {
      return `admin_${Math.random().toString(36).substr(2, 6)}`;
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-8);
    return `pppoe${cleanPhone}`;
  };

  const handleRegistration = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error("Please enter a valid phone number");
      }

      if (!isAuthenticated) {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const pppoeUsername = username || generatePPPoEUsername(phoneNumber);

      if (isAuthenticated) {
        // Existing user - proceed to payment
        setStep(2);
      } else {
        if (adminSetup) {
          // Admin PPPoE setup
          await handleAdminPPPoESetup(formattedPhone, pppoeUsername);
        } else {
          // New client user - register first
          await handleClientRegistration(formattedPhone, pppoeUsername);
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPPPoESetup = async (formattedPhone, pppoeUsername) => {
    try {
      const response = await api.post("/api/auth/admin/pppoe-setup/", {
        username: pppoeUsername,
        password: password,
        phone_number: formattedPhone
      }, { timeout: 5000 });

      if (response.data.success) {
        const adminData = {
          ...response.data.user,
          pppoe_username: pppoeUsername,
          user_type: 'admin',
          connection_type: 'pppoe'
        };
        
        onRegistrationSuccess(adminData);
        
        if (isFreePlan) {
          await activateFreePlan(adminData.id, pppoeUsername);
        } else {
          setStep(2);
        }
      } else {
        throw new Error(response.data.error || "Admin PPPoE setup failed");
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || "Admin setup failed");
    }
  };

  const handleClientRegistration = async (formattedPhone, pppoeUsername) => {
    const response = await api.post("/api/auth/clients/pppoe/", {
      phone_number: formattedPhone,
      pppoe_username: pppoeUsername,
      pppoe_password: password,
      connection_type: "pppoe"
    }, { timeout: 5000 });

    if (response.data.id || response.data.success) {
      const client = response.data.client || response.data;
      onRegistrationSuccess(client);
      
      if (isFreePlan) {
        await activateFreePlan(client.id, pppoeUsername);
      } else {
        setStep(2);
      }
    } else {
      throw new Error(response.data.error || "Registration failed");
    }
  };

  const activateFreePlan = async (clientId, pppoeUsername) => {
    setLoading(true);
    try {
      const response = await api.post("/api/internet_plans/client/purchase/", {
        plan_id: selectedPlan.id,
        phone_number: phoneNumber,
        payment_method: "free",
        access_type: "pppoe",
        pppoe_username: pppoeUsername,
        is_admin: adminSetup
      }, { timeout: 5000 });

      if (response.data.success) {
        onPaymentSuccess(selectedPlan.name, true);
        setStep(3);
      } else {
        throw new Error(response.data.error || "Failed to activate free plan");
      }
    } catch (err) {
      setError("Failed to activate plan. Please try again.");
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
    setError("");
    setPaymentInProgress(true);

    try {
      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const pppoeUsername = username || generatePPPoEUsername(phoneNumber);
      
      // Initiate payment
      const paymentResponse = await api.post("/api/payments/initiate/", {
        gateway_id: selectedPaymentMethod.id,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
        phone_number: formattedPhone,
        access_type: "pppoe",
        pppoe_username: pppoeUsername,
        is_admin: adminSetup
      }, { timeout: 5000 });

      if (paymentResponse.data.success) {
        const transactionId = paymentResponse.data.transaction_id;
        
        // For M-Pesa, wait for callback
        if (selectedPaymentMethod.name.includes('mpesa')) {
          await waitForMpesaPayment(transactionId, pppoeUsername);
        } else {
          await completePaymentActivation(transactionId, pppoeUsername);
        }
      } else {
        throw new Error(paymentResponse.data.error || "Payment initiation failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Payment failed. Please try again.");
      setPaymentInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const waitForMpesaPayment = async (transactionId, pppoeUsername) => {
    const maxAttempts = 12;
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusResponse = await api.get(`/api/payments/transaction-status/${transactionId}/`, { timeout: 3000 });
          
          if (statusResponse.data.status === 'completed') {
            clearInterval(interval);
            await completePaymentActivation(transactionId, pppoeUsername);
            resolve();
          } else if (statusResponse.data.status === 'failed') {
            clearInterval(interval);
            setError("Payment failed. Please try again.");
            setPaymentInProgress(false);
            reject(new Error("Payment failed"));
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            setError("Payment timeout. Please check your M-Pesa messages.");
            setPaymentInProgress(false);
            reject(new Error("Payment timeout"));
          }
        } catch (err) {
          console.error("Payment status check failed:", err);
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setError("Payment status check failed. Please contact support.");
            setPaymentInProgress(false);
            reject(new Error("Payment status check failed"));
          }
        }
      }, 5000);
    });
  };

  const completePaymentActivation = async (transactionId, pppoeUsername) => {
    try {
      const response = await api.post("/api/internet_plans/client/purchase/", {
        plan_id: selectedPlan.id,
        phone_number: phoneNumber,
        payment_method: selectedPaymentMethod.name,
        access_type: "pppoe",
        pppoe_username: pppoeUsername,
        transaction_reference: transactionId,
        is_admin: adminSetup
      }, { timeout: 5000 });

      if (response.data.success) {
        onPaymentSuccess(selectedPlan.name, false);
        setPaymentInProgress(false);
        setStep(3);
      } else {
        throw new Error(response.data.error || "Activation failed after payment");
      }
    } catch (err) {
      setError("Activation failed after payment. Please contact support.");
      setPaymentInProgress(false);
    }
  };

  const renderRegistrationForm = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`w-16 h-16 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-3 ${
          adminSetup 
            ? 'from-purple-500 to-indigo-600' 
            : 'from-blue-500 to-purple-600'
        }`}>
          {adminSetup ? (
            <Crown className="w-8 h-8 text-white" />
          ) : (
            <Wifi className="w-8 h-8 text-white" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {adminSetup ? 'Admin PPPoE Setup' : (
            isAuthenticated ? 'Upgrade PPPoE Plan' : 'Create PPPoE Account'
          )}
        </h3>
        <p className="text-sm text-gray-600">
          {adminSetup 
            ? 'Configure administrative PPPoE access with enhanced privileges'
            : isAuthenticated 
              ? 'Upgrade your current PPPoE plan for better speeds and features'
              : 'Create your PPPoE account to get started with wired internet'
          }
        </p>
        
        {adminSetup && (
          <div className="mt-2 bg-purple-100 border border-purple-200 rounded-lg p-2">
            <div className="flex items-center justify-center gap-2 text-purple-700 text-xs">
              <Shield className="w-3 h-3" />
              <span>Administrative access with enhanced bandwidth and priority</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleRegistration} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="07XXXXXXXX or 7XXXXXXXX"
              required
              maxLength="10"
              disabled={isAuthenticated || loading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Phone className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            PPPoE Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={adminSetup ? "admin_username" : "pppoe_username"}
              required
              disabled={(isAuthenticated && clientData?.pppoe_username) || loading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {!username && `Will be auto-generated as ${adminSetup ? 'admin_' : 'pppoe'}...`}
          </p>
        </div>

        {!isAuthenticated && (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                PPPoE Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Create a secure password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <Lock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Admin Setup Toggle */}
        {!isAuthenticated && isAdmin && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Admin PPPoE Setup</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adminSetup}
                onChange={(e) => setAdminSetup(e.target.checked)}
                className="sr-only peer"
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r hover:shadow-lg disabled:opacity-50 text-white font-medium rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed ${
              adminSetup
                ? 'from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800'
                : 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                {adminSetup ? 'Admin Setup...' : (
                  isAuthenticated ? 'Processing...' : 'Creating Account...'
                )}
              </>
            ) : (
              <>
                {isFreePlan ? 'Activate Free Plan' : 'Continue to Payment'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPaymentSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`w-16 h-16 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-3 ${
          adminSetup 
            ? 'from-green-500 to-teal-600' 
            : 'from-green-500 to-teal-600'
        }`}>
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Select Payment Method</h3>
        <p className="text-sm text-gray-600">Choose how you'd like to pay for your PPPoE plan</p>
        
        {adminSetup && (
          <div className="mt-2 bg-green-100 border border-green-200 rounded-lg p-2">
            <div className="flex items-center justify-center gap-2 text-green-700 text-xs">
              <Crown className="w-3 h-3" />
              <span>Admin plan includes enhanced bandwidth and priority support</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedPaymentMethod?.id === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPaymentMethod(method)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {method.name.includes('mpesa') ? (
                  <img src={mpesa} alt="M-Pesa" className="w-8 h-8" />
                ) : (
                  <CreditCard className="w-6 h-6 text-gray-600" />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {method.display_name || method.name}
                  </p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              {selectedPaymentMethod?.id === method.id && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPaymentMethod && selectedPlan && (
        <div className={`bg-gradient-to-r rounded-lg p-4 border ${
          adminSetup
            ? 'from-purple-50 to-indigo-50 border-purple-100'
            : 'from-blue-50 to-purple-50 border-blue-100'
        }`}>
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              KES {Number(selectedPlan.price).toLocaleString()}
            </p>
            {adminSetup && (
              <p className="text-sm text-purple-600 mt-1">✓ Administrative Access Included</p>
            )}
          </div>

          <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connection Type:</span>
              <span className="font-semibold text-gray-800">
                {adminSetup ? 'Admin PPPoE' : 'PPPoE'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Username:</span>
              <span className="font-semibold text-gray-800">{username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone Number:</span>
              <span className="font-semibold text-gray-800">{phoneNumber}</span>
            </div>
            {adminSetup && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Access Level:</span>
                <span className="font-semibold text-purple-600">Administrator</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handlePayment}
          disabled={!selectedPaymentMethod || loading || paymentInProgress}
          className={`w-full py-3 bg-gradient-to-r hover:shadow-lg disabled:opacity-50 text-white font-medium rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-3 text-sm disabled:cursor-not-allowed ${
            adminSetup
              ? 'from-green-600 to-green-800 hover:from-green-700 hover:to-green-900'
              : 'from-green-600 to-green-800 hover:from-green-700 hover:to-green-900'
          }`}
        >
          {paymentInProgress ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : selectedPaymentMethod?.name.includes('mpesa') ? (
            <>
              <span>Pay with M-Pesa</span>
              <img src={mpesa} alt="M-Pesa" className="h-6 w-6" />
            </>
          ) : (
            <>
              <span>Pay with {selectedPaymentMethod?.display_name}</span>
              <CreditCard className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={() => setStep(1)}
          disabled={loading || paymentInProgress}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit className="w-5 h-5" />
          Back to Details
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className={`w-16 h-16 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-3 ${
        adminSetup 
          ? 'from-green-400 to-emerald-600' 
          : 'from-green-400 to-emerald-600'
      }`}>
        <CheckCircle className="w-8 h-8 text-white" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {adminSetup ? 'Admin PPPoE Ready!' : (
            isFreePlan ? 'PPPoE Account Created!' : 'Payment Successful!'
          )}
        </h3>
        <p className="text-sm text-gray-600">
          {adminSetup 
            ? 'Administrative PPPoE access has been configured successfully'
            : isFreePlan 
              ? 'Your free PPPoE plan has been activated successfully'
              : 'Your PPPoE plan has been activated and payment processed'
          }
        </p>
      </div>

      <div className={`bg-gradient-to-r rounded-lg p-4 border ${
        adminSetup
          ? 'from-green-50 to-emerald-50 border-green-200'
          : 'from-green-50 to-emerald-50 border-green-200'
      }`}>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">PPPoE Username:</span>
            <span className="font-medium text-gray-800">{username}</span>
          </div>
          {!isAuthenticated && (
            <div className="flex justify-between">
              <span className="text-gray-600">PPPoE Password:</span>
              <span className="font-medium text-gray-800">••••••••</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Connection Type:</span>
            <span className="font-medium text-gray-800">
              {adminSetup ? 'Admin PPPoE' : 'PPPoE'}
            </span>
          </div>
          {adminSetup && (
            <div className="flex justify-between">
              <span className="text-gray-600">Access Level:</span>
              <span className="font-medium text-purple-600">Administrator</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className={`w-full py-3 bg-gradient-to-r text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
          adminSetup
            ? 'from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800'
            : 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
      >
        {isAuthenticated ? 'Back to Dashboard' : 'Configure Router'}
        <Wifi className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border border-gray-100 relative">
        {step !== 3 && (
          <button 
            onClick={onClose}
            disabled={loading || paymentInProgress}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {step === 1 && renderRegistrationForm()}
        {step === 2 && renderPaymentSelection()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
};

export default PPPoEAuthModal;