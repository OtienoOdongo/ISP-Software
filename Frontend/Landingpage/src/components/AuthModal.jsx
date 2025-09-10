

// import React, { useState, useEffect } from "react";
// import api from "../api";
// import { toast } from "react-toastify";
// import { 
//   User, 
//   Phone, 
//   DollarSign, 
//   CreditCard, 
//   ArrowLeft, 
//   CheckCircle, 
//   Wifi, 
//   Gift,
//   X,
//   ChevronRight,
//   ChevronLeft
// } from "lucide-react";

// const AuthModal = ({ 
//   onClose, 
//   onLoginSuccess, 
//   selectedPlan, 
//   onPaymentSuccess, 
//   existingClientData,
//   forcePlanSelection,
//   getMacAddress
// }) => {
//   const isGuest = !existingClientData.fullName && !existingClientData.phoneNumber;
//   const [step, setStep] = useState(1); // Start with user type selection
//   const [formData, setFormData] = useState({
//     fullName: existingClientData.fullName || "",
//     phoneNumber: existingClientData.phoneNumber || "",
//     amount: selectedPlan ? selectedPlan.price : "",
//     clientId: existingClientData.clientId || null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [userType, setUserType] = useState(null); // "new" or "existing"

//   const isFreePlan = selectedPlan?.category === "promotional" && 
//                     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

//   useEffect(() => {
//     if (selectedPlan) {
//       setFormData((prev) => ({ ...prev, amount: selectedPlan.price }));
//     } else {
//       setFormData((prev) => ({ ...prev, amount: "" }));
//     }
//   }, [selectedPlan]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateAndFormatPhoneNumber = (phone, forPayment = false) => {
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
//       throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.");
//     }
//     return forPayment ? formatted : `0${formatted.slice(4)}`;
//   };

//   const validateForm = () => {
//     try {
//       validateAndFormatPhoneNumber(formData.phoneNumber, false);
//       if (!formData.fullName && userType === "new") throw new Error("Full name is required.");
//       if (!isFreePlan && (!formData.amount || parseFloat(formData.amount) <= 0)) {
//         throw new Error("Please enter a valid amount greater than 0.");
//       }
//       return true;
//     } catch (err) {
//       setError(err.message);
//       return false;
//     }
//   };

//   const fetchClientData = async (phone) => {
//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phone, true);
//       const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//       if (response.data.length > 0) {
//         const client = response.data[0];
//         setFormData((prev) => ({
//           ...prev,
//           clientId: client.id,
//           fullName: client.full_name,
//           phoneNumber: client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber,
//         }));
//         return client;
//       } else {
//         return null;
//       }
//     } catch (err) {
//       setError(err.message || "Failed to fetch client data.");
//       return null;
//     }
//   };

//   const handleFreePlanActivation = async () => {
//     setLoading(true);
//     try {
//       const macAddress = await getMacAddress();
//       await api.post("/api/network_management/routers/1/hotspot-users/", {
//         client_id: formData.clientId,
//         plan_id: selectedPlan.id,
//         transaction_id: null,
//         mac: macAddress,
//       });
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(4); // Success step
//     } catch (err) {
//       setError("Failed to activate plan. Please try again.");
//       toast.error("Failed to activate plan.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDetailsSubmit = async (e) => {
//     e.preventDefault();
    
//     if (isFreePlan) {
//       handleFreePlanActivation();
//       return;
//     }
    
//     setLoading(true);
//     setError("");

//     if (!validateForm()) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const formattedPhoneForClient = validateAndFormatPhoneNumber(formData.phoneNumber, true);

//       if (userType === "new") {
//         const response = await api.post("/api/account/clients/", {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         const clientData = response.data;
//         setFormData((prev) => ({ ...prev, clientId: clientData.id }));
//         toast.success(response.status === 201 ? "Welcome aboard!" : "Welcome back!");
//         onLoginSuccess(formData.phoneNumber, clientData.full_name, clientData.id);
//       } else if (userType === "existing") {
//         const client = await fetchClientData(formData.phoneNumber);
//         if (!client) {
//           setError("No account found with this phone number. Please sign up as a new user.");
//           setLoading(false);
//           return;
//         }
//         onLoginSuccess(formData.phoneNumber, client.full_name, client.id);
//         toast.success(`Welcome back, ${client.full_name}!`);
//       }

//       setStep(3); // Payment step
//     } catch (err) {
//       setError(err.response?.data?.error || "Something went wrong. Please try again.");
//       toast.error(err.response?.data?.error || "Failed to process your request.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePaymentSubmit = async (e) => {
//     e.preventDefault();
//     if (!isFreePlan && parseFloat(formData.amount) === 0) {
//       setError("This amount is invalid. Please enter a value greater than 0.");
//       toast.info("Please specify a valid payment amount.");
//       return;
//     }
    
//     if (isFreePlan) {
//       handleFreePlanActivation();
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setPaymentInProgress(true);

//     try {
//       const formattedPhoneForPayment = validateAndFormatPhoneNumber(formData.phoneNumber, true);
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhoneForPayment,
//         amount: formData.amount,
//         plan_id: selectedPlan?.id || null,
//       });
//       const checkoutRequestId = response.data.checkout_request_id;

//       toast.info("Check your phone for the M-Pesa STK Push.");

//       const interval = setInterval(async () => {
//         try {
//           const statusResponse = await api.post("/api/payments/stk-status/", {
//             checkout_request_id: checkoutRequestId,
//           });
//           const status = statusResponse.data.status;

//           if (status.ResultCode === "0") {
//             const macAddress = await getMacAddress();
//             await api.post("/api/network_management/routers/1/hotspot-users/", {
//               client_id: formData.clientId,
//               plan_id: selectedPlan?.id || null,
//               transaction_id: checkoutRequestId,
//               mac: macAddress,
//             });
//             onPaymentSuccess(selectedPlan?.name || "your custom amount", false);
//             clearInterval(interval);
//             setPaymentInProgress(false);
//             setStep(4); // Success step
//           } else if (status.ResultCode && status.ResultCode !== "0") {
//             setError("Payment failed: " + (status.ResultDesc || "Unknown error"));
//             toast.error("Payment failed.");
//             clearInterval(interval);
//             setPaymentInProgress(false);
//           }
//         } catch (err) {
//           setError("Error checking payment status.");
//           toast.error("Error checking payment status.");
//           clearInterval(interval);
//           setPaymentInProgress(false);
//         }
//       }, 5000);
//     } catch (err) {
//       setError("Payment initiation failed. Please check your details.");
//       toast.error("Payment initiation failed.");
//       setPaymentInProgress(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStep1 = () => (
//     <div className="space-y-6 text-center">
//       <p className="text-lg text-gray-700 font-medium">Let’s get you connected!</p>
//       <div className="flex flex-col gap-6">
//         <button
//           onClick={() => {
//             setUserType("new");
//             setStep(2);
//           }}
//           className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-3 transform hover:scale-105"
//         >
//           <User size={22} />
//           I’m New Here
//         </button>
//         <button
//           onClick={() => {
//             setUserType("existing");
//             setStep(2);
//           }}
//           className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-3 transform hover:scale-105"
//         >
//           <CreditCard size={22} />
//           I’m Back!
//         </button>
//       </div>
//       <p className="text-sm text-gray-500">Pick an option to start surfing.</p>
//     </div>
//   );

//   const renderStep2 = () => (
//     <form onSubmit={handleDetailsSubmit} className="space-y-6">
//       {userType === "new" && (
//         <>
//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//             <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//               <Phone size={20} className="ml-3 text-gray-400" />
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 bg-transparent outline-none"
//                 placeholder="e.g., 0712345678"
//                 required
//               />
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX</p>
//           </div>
//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//             <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//               <User size={20} className="ml-3 text-gray-400" />
//               <input
//                 type="text"
//                 name="fullName"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 className="w-full p-3 bg-transparent outline-none"
//                 placeholder="e.g., John Doe"
//                 required
//               />
//             </div>
//           </div>
//         </>
//       )}
//       {userType === "existing" && (
//         <div className="relative">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//           <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
//             <Phone size={20} className="ml-3 text-gray-400" />
//             <input
//               type="tel"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={handleChange}
//               className="w-full p-3 bg-transparent outline-none"
//               placeholder="e.g., 0712345678"
//               required
//             />
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Enter your registered phone number</p>
//         </div>
//       )}
//       {!isFreePlan && (
//         <div className="relative">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
//           <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//             <DollarSign size={20} className="ml-3 text-gray-400" />
//             <input
//               type="number"
//               name="amount"
//               value={formData.amount}
//               onChange={handleChange}
//               disabled={selectedPlan}
//               className={`w-full p-3 bg-transparent outline-none ${selectedPlan ? "text-gray-500" : ""}`}
//               placeholder="e.g., 500"
//               required={!isFreePlan}
//             />
//           </div>
//         </div>
//       )}
//       {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//       <div className="flex flex-col gap-4">
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
//         >
//           {loading ? "Processing..." : userType === "existing" ? "Pay Now" : "Next"}
//           {!loading && <ChevronRight size={18} />}
//         </button>
//         <button
//           type="button"
//           onClick={() => setStep(1)}
//           className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
//         >
//           <ChevronLeft size={18} /> Back
//         </button>
//       </div>
//     </form>
//   );

//   const renderStep3 = () => (
//     <form onSubmit={handlePaymentSubmit} className="space-y-6">
//       <div className="text-center bg-indigo-50 p-6 rounded-lg">
//         <p className="text-xl font-semibold text-indigo-700 flex items-center justify-center gap-2">
//           {isFreePlan ? (
//             <>
//               <Gift size={24} />
//               <span>Activate Free Plan</span>
//             </>
//           ) : (
//             <>
//               <CreditCard size={24} />
//               <span>Pay KES {formData.amount}</span>
//             </>
//           )}
//         </p>
//         <p className="text-sm text-gray-600 mt-2">
//           <span className="font-medium">From:</span> {formData.fullName} <br />
//           <span className="font-medium">Phone:</span> {formData.phoneNumber}
//         </p>
//         {selectedPlan && (
//           <div className="mt-4 bg-white p-3 rounded-md">
//             <p className="text-sm font-medium text-gray-800">
//               <span className="font-bold">Plan:</span> {selectedPlan.name}
//             </p>
//             <p className="text-sm font-medium text-gray-800 mt-1">
//               <span className="font-bold">Data:</span> {selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}
//             </p>
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//       <button
//         type="submit"
//         disabled={loading || paymentInProgress}
//         className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
//       >
//         {loading ? "Processing..." : 
//          paymentInProgress ? "Waiting for payment..." :
//          isFreePlan ? "Activate Now" : "Pay with M-Pesa"}
//         {!loading && !paymentInProgress && (isFreePlan ? <Gift size={20} /> : <CreditCard size={20} />)}
//       </button>
//       <button
//         type="button"
//         onClick={() => setStep(2)}
//         className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
//       >
//         <ChevronLeft size={18} /> Back
//       </button>
//     </form>
//   );

//   const renderStep4 = () => (
//     <div className="text-center p-6">
//       <div className="mb-6">
//         <div className="relative inline-block">
//           <Wifi size={80} className="text-green-500 animate-pulse" />
//           <CheckCircle 
//             size={32} 
//             className="absolute -right-2 -top-2 text-white bg-green-500 rounded-full p-1 animate-bounce" 
//           />
//         </div>
//       </div>
//       <h3 className="text-2xl font-bold text-gray-800 mb-2">
//         {selectedPlan?.name} Activated!
//       </h3>
//       <p className="text-gray-600 mb-4">
//         {isFreePlan 
//           ? "Your free promotional plan is now active. Enjoy your internet access!"
//           : "Your internet plan is now active. Enjoy seamless browsing!"}
//       </p>
//       <div className="bg-indigo-50 rounded-lg p-4 mb-6">
//         <p className="text-sm font-medium text-indigo-700">
//           <span className="font-bold">Data:</span> {selectedPlan?.dataLimit.value} {selectedPlan?.dataLimit.unit}
//         </p>
//         <p className="text-sm font-medium text-indigo-700 mt-1">
//           <span className="font-bold">Valid for:</span> {selectedPlan?.expiry.value} {selectedPlan?.expiry.unit}
//         </p>
//         {selectedPlan?.description && (
//           <p className="text-sm text-indigo-600 mt-2 italic">
//             {selectedPlan.description}
//           </p>
//         )}
//       </div>
//       <button
//         onClick={onClose}
//         className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
//       >
//         Start Browsing <Wifi size={18} />
//       </button>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-indigo-200 relative">
//         {step !== 4 && (
//           <button 
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
//           >
//             <X size={24} />
//           </button>
//         )}
        
//         <div className="flex justify-center items-center mb-6">
//           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
//             {step === 1 ? "Welcome to SurfZone" : 
//              step === 2 ? (userType === "new" ? "Your Details" : "I’m Back!") : 
//              step === 3 ? (isFreePlan ? "Confirm Activation" : "Confirm Payment") : 
//              `Welcome, ${formData.fullName || "Guest"}!`}
//           </h2>
//         </div>

//         {selectedPlan && step !== 4 && (
//           <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-center flex items-center justify-center gap-2">
//             <CheckCircle size={20} className="text-indigo-500" />
//             <p className="text-sm font-semibold text-indigo-700">
//               {isFreePlan ? "Activating: " : "Buying: "} 
//               {selectedPlan.name} {!isFreePlan && `for KES ${selectedPlan.price}`}
//             </p>
//           </div>
//         )}

//         {step === 1 ? renderStep1() : 
//          step === 2 ? renderStep2() : 
//          step === 3 ? renderStep3() : 
//          renderStep4()}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;










// import React, { useState, useEffect } from "react";
// import api from "../api";
// import { 
//   Phone, 
//   CreditCard, 
//   CheckCircle, 
//   X,
//   ArrowRight,
//   Smartphone,
//   Shield,
//   Zap,
//   RotateCw
// } from "lucide-react";

// const AuthModal = ({ 
//   onClose, 
//   onLoginSuccess, 
//   selectedPlan, 
//   onPaymentSuccess, 
//   existingClientData,
//   getMacAddress
// }) => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     phoneNumber: existingClientData.phoneNumber || "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [clientId, setClientId] = useState(existingClientData.clientId || null);

//   const isFreePlan = selectedPlan?.category === "promotional" && 
//                     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

//   const validateAndFormatPhoneNumber = (phone, forPayment = false) => {
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
    
//     return forPayment ? formatted : formatted;
//   };

//   const handlePhoneSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber, true);
      
//       let client;
//       try {
//         const response = await api.post("/api/account/clients/", {
//           phonenumber: formattedPhone,
//         });
//         client = response.data;
//       } catch (err) {
//         if (err.response?.status === 400 && err.response?.data?.phonenumber) {
//           const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//           if (response.data.length > 0) {
//             client = response.data[0];
//           }
//         } else {
//           throw err;
//         }
//       }

//       if (client) {
//         setClientId(client.id);
//         onLoginSuccess(formattedPhone, client.id);
        
//         if (isFreePlan) {
//           await activateFreePlan(client.id);
//         } else {
//           setStep(2);
//         }
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "Invalid phone number or server error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const activateFreePlan = async (clientId) => {
//     setLoading(true);
//     try {
//       const macAddress = await getMacAddress();
//       await api.post("/api/network_management/routers/1/hotspot-users/", {
//         client_id: clientId,
//         plan_id: selectedPlan.id,
//         transaction_id: null,
//         mac: macAddress,
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
//     setLoading(true);
//     setError("");
//     setPaymentInProgress(true);

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber, true);
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhone,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//       });
      
//       const checkoutRequestId = response.data.checkout_request_id;

//       const interval = setInterval(async () => {
//         try {
//           const statusResponse = await api.post("/api/payments/stk-status/", {
//             checkout_request_id: checkoutRequestId,
//           });
          
//           const status = statusResponse.data.status;
//           if (status.ResultCode === "0") {
//             const macAddress = await getMacAddress();
//             await api.post("/api/network_management/routers/1/hotspot-users/", {
//               client_id: clientId,
//               plan_id: selectedPlan.id,
//               transaction_id: checkoutRequestId,
//               mac: macAddress,
//             });
            
//             onPaymentSuccess(selectedPlan.name, false);
//             clearInterval(interval);
//             setPaymentInProgress(false);
//             setStep(3);
//           } else if (status.ResultCode && status.ResultCode !== "0") {
//             setError("Payment failed. Please try again.");
//             clearInterval(interval);
//             setPaymentInProgress(false);
//           }
//         } catch (err) {
//           setError("Error verifying payment. Please check your M-Pesa messages.");
//           clearInterval(interval);
//           setPaymentInProgress(false);
//         }
//       }, 3000);
//     } catch (err) {
//       setError("Payment initiation failed. Please check your phone number.");
//       setPaymentInProgress(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderPhoneInput = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <Smartphone className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Enter Your Phone Number</h3>
//         <p className="text-sm text-gray-600">We'll use this to process your payment and activate your plan</p>
//       </div>

//       <form onSubmit={handlePhoneSubmit} className="space-y-4">
//         <div className="relative">
//           <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//             Phone Number
//           </label>
//           <div className="relative">
//             <input
//               type="tel"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={(e) => setFormData({ phoneNumber: e.target.value })}
//               className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium"
//               placeholder="07XXXXXXXX or 7XXXXXXXX"
//               required
//               maxLength="12"
//             />
//             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//               <Phone className="w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Enter your 9-digit number (e.g., 07XXXXXXXX or 7XXXXXXXX)</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//             <p className="text-red-600 text-xs font-medium">{error}</p>
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//         >
//           {loading ? (
//             <>
//               <RotateCw className="w-4 h-4 animate-spin" />
//               Processing...
//             </>
//           ) : (
//             <>
//               Continue to Payment
//               <ArrowRight className="w-4 h-4" />
//             </>
//           )}
//         </button>
//       </form>

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

//   const renderPaymentConfirmation = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <CreditCard className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Confirm Payment</h3>
//         <p className="text-sm text-gray-600">Review your plan details before proceeding</p>
//       </div>

//       <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
//         <div className="text-center mb-4">
//           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
//             <Zap className="w-5 h-5 text-white" />
//           </div>
//           <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
//           <p className="text-2xl font-extrabold text-blue-600 mt-1">
//             KES {Number(selectedPlan.price).toLocaleString()}
//           </p>
//         </div>

//         <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Data Limit:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Download Speed:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Validity:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Phone Number:</span>
//             <span className="font-semibold text-gray-800">{formData.phoneNumber}</span>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <p className="text-red-600 text-xs font-medium">{error}</p>
//         </div>
//       )}

//       <div className="space-y-2">
//         <button
//           onClick={handlePayment}
//           disabled={loading || paymentInProgress}
//           className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//         >
//           {paymentInProgress ? (
//             <>
//               <RotateCw className="w-4 h-4 animate-spin" />
//               Processing Payment...
//             </>
//           ) : (
//             <>
//               Pay with M-Pesa
//               <CreditCard className="w-4 h-4" />
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => setStep(1)}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200Ruth
// 200) hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm"
//         >
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
//             <span className="font-medium text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Speed:</span>
//             <span className="font-medium text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Valid for:</span>
//             <span className="font-medium text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
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
//         {step === 2 && renderPaymentConfirmation()}
//         {step === 3 && renderSuccess()}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;








// import React, { useState, useEffect } from "react";
// import api from "../api";
// import { 
//   Phone, 
//   CreditCard, 
//   CheckCircle, 
//   X,
//   ArrowRight,
//   Smartphone,
//   Shield,
//   Zap,
//   RotateCw,
//   Wifi
// } from "lucide-react";
// import mpesa from "../assets/mpesa.png";

// const AuthModal = ({ 
//   onClose, 
//   onLoginSuccess, 
//   selectedPlan, 
//   onPaymentSuccess, 
//   existingClientData,
//   getMacAddress
// }) => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     phoneNumber: existingClientData.phoneNumber || "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [clientId, setClientId] = useState(existingClientData.clientId || null);

//   const isFreePlan = selectedPlan?.category === "promotional" && 
//                     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

//   const activateFreePlan = async (clientId) => {
//     setLoading(true);
//     try {
//       const macAddress = await getMacAddress();
//       await api.post("/api/network_management/routers/1/hotspot-users/", {
//         client_id: clientId,
//         plan_id: selectedPlan.id,
//         transaction_id: null,
//         mac: macAddress,
//       });
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(3);
//     } catch (err) {
//       setError("Failed to activate plan. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (existingClientData.phoneNumber && existingClientData.clientId) {
//       setFormData({ phoneNumber: existingClientData.phoneNumber });
//       setClientId(existingClientData.clientId);
//       onLoginSuccess(existingClientData.phoneNumber, existingClientData.clientId);
      
//       if (isFreePlan) {
//         activateFreePlan(existingClientData.clientId);
//       } else {
//         setStep(2);
//       }
//     }
//   }, [existingClientData, isFreePlan, onLoginSuccess, activateFreePlan, selectedPlan]);

//   const validateAndFormatPhoneNumber = (phone, forPayment = false) => {
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
    
//     return forPayment ? formatted : formatted;
//   };

//   const handlePhoneSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber, true);
      
//       let client;
//       try {
//         const response = await api.post("/api/account/clients/", {
//           phonenumber: formattedPhone,
//         });
//         client = response.data;
//       } catch (err) {
//         if (err.response?.status === 400 && err.response?.data?.phonenumber) {
//           const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//           if (response.data.length > 0) {
//             client = response.data[0];
//           }
//         } else {
//           throw err;
//         }
//       }

//       if (client) {
//         setClientId(client.id);
//         onLoginSuccess(formattedPhone, client.id);
        
//         if (isFreePlan) {
//           await activateFreePlan(client.id);
//         } else {
//           setStep(2);
//         }
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "Invalid phone number or server error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     setLoading(true);
//     setError("");
//     setPaymentInProgress(true);

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber, true);
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhone,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//       });
      
//       const checkoutRequestId = response.data.checkout_request_id;

//       const interval = setInterval(async () => {
//         try {
//           const statusResponse = await api.post("/api/payments/stk-status/", {
//             checkout_request_id: checkoutRequestId,
//           });
          
//           const status = statusResponse.data.status;
//           if (status.ResultCode === "0") {
//             const macAddress = await getMacAddress();
//             await api.post("/api/network_management/routers/1/hotspot-users/", {
//               client_id: clientId,
//               plan_id: selectedPlan.id,
//               transaction_id: checkoutRequestId,
//               mac: macAddress,
//             });
            
//             onPaymentSuccess(selectedPlan.name, false);
//             clearInterval(interval);
//             setPaymentInProgress(false);
//             setStep(3);
//           } else if (status.ResultCode && status.ResultCode !== "0") {
//             setError("Payment failed. Please try again.");
//             clearInterval(interval);
//             setPaymentInProgress(false);
//           }
//         } catch (err) {
//           setError("Error verifying payment. Please check your M-Pesa messages.");
//           clearInterval(interval);
//           setPaymentInProgress(false);
//         }
//       }, 3000);
//     } catch (err) {
//       setError("Payment initiation failed. Please check your phone number.");
//       setPaymentInProgress(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderPhoneInput = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <Smartphone className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Enter Your Phone Number</h3>
//         <p className="text-sm text-gray-600">We'll use this to process your payment and activate your plan</p>
//       </div>

//       <form onSubmit={handlePhoneSubmit} className="space-y-4">
//         <div className="relative">
//           <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
//             Phone Number
//           </label>
//           <div className="relative">
//             <input
//               type="tel"
//               name="phoneNumber"
//               value={formData.phoneNumber}
//               onChange={(e) => setFormData({ phoneNumber: e.target.value })}
//               className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium"
//               placeholder="07XXXXXXXX or 7XXXXXXXX"
//               required
//               maxLength="13"
//             />
//             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//               <Phone className="w-4 h-4 text-gray-400" />
//             </div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Enter your 9-digit number (e.g., 07XXXXXXXX or 7XXXXXXXX)</p>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//             <p className="text-red-600 text-xs font-medium">{error}</p>
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//         >
//           {loading ? (
//             <>
//               <RotateCw className="w-4 h-4 animate-spin" />
//               Processing...
//             </>
//           ) : (
//             <>
//               {isFreePlan ? 'Activate Now' : 'Continue to Payment'}
//               <ArrowRight className="w-4 h-4" />
//             </>
//           )}
//         </button>
//       </form>

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

//   const renderPaymentConfirmation = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <CreditCard className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Confirm Payment</h3>
//         <p className="text-sm text-gray-600">Review your plan details before proceeding</p>
//       </div>

//       <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
//         <div className="text-center mb-4">
//           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
//             <Zap className="w-5 h-5 text-white" />
//           </div>
//           <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
//           <p className="text-2xl font-extrabold text-blue-600 mt-1">
//             KES {Number(selectedPlan.price).toLocaleString()}
//           </p>
//         </div>

//         <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Data Limit:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Download Speed:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Validity:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Phone Number:</span>
//             <span className="font-semibold text-gray-800">{formData.phoneNumber}</span>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <p className="text-red-600 text-xs font-medium">{error}</p>
//         </div>
//       )}

//       <div className="space-y-2">
//         <button
//           onClick={handlePayment}
//           disabled={loading || paymentInProgress}
//           className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
//         >
//           {paymentInProgress ? (
//             <>
//               <RotateCw className="w-4 h-4 animate-spin" />
//               Processing Payment...
//             </>
//           ) : (
//             <>
//               Pay with M-Pesa
//               <img src={mpesa} alt="M-Pesa" className="h-5 w-auto" />
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => setStep(1)}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm"
//         >
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
//             <span className="font-medium text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Speed:</span>
//             <span className="font-medium text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Valid for:</span>
//             <span className="font-medium text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
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
//         {step === 2 && renderPaymentConfirmation()}
//         {step === 3 && renderSuccess()}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;






// import React, { useState, useEffect } from "react";
// import api from "../api";
// import { 
//   Phone, 
//   CreditCard, 
//   CheckCircle, 
//   X,
//   ArrowRight,
//   Smartphone,
//   Shield,
//   Zap,
//   RotateCw,
//   Wifi,
//   User,
//   History,
//   Edit
// } from "lucide-react";
// import mpesa from "../assets/mpesa.png";

// const AuthModal = ({ 
//   onClose, 
//   onLoginSuccess, 
//   selectedPlan, 
//   onPaymentSuccess, 
//   existingClientData,
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

//   const isFreePlan = selectedPlan?.category === "promotional" && 
//                     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

//   // Check if client is returning from localStorage or props
//   useEffect(() => {
//     const savedPhone = localStorage.getItem("clientPhone");
//     const savedClientId = localStorage.getItem("clientId");
    
//     // Prioritize existingClientData from props, then check localStorage
//     if (existingClientData.phoneNumber && existingClientData.clientId) {
//       setPhoneNumber(existingClientData.phoneNumber);
//       setClientId(existingClientData.clientId);
//       setIsReturningClient(true);
//     } else if (savedPhone && savedClientId) {
//       setPhoneNumber(savedPhone);
//       setClientId(savedClientId);
//       setIsReturningClient(true);
//     }
//   }, [existingClientData]);

//   const activateFreePlan = async (clientId) => {
//     setLoading(true);
//     try {
//       const macAddress = await getMacAddress();
//       await api.post("/api/network_management/routers/1/hotspot-users/", {
//         client_id: clientId,
//         plan_id: selectedPlan.id,
//         transaction_id: null,
//         mac: macAddress,
//       });
      
//       // Save to localStorage
//       localStorage.setItem("clientPhone", phoneNumber);
//       localStorage.setItem("clientId", clientId);
      
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(3);
//     } catch (err) {
//       setError("Failed to activate plan. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

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
//     // Only allow numbers and limit to 10 digits
//     const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
//     setPhoneNumber(cleanedValue);
//   };

//   const findOrCreateClient = async (formattedPhone) => {
//     try {
//       // First try to find existing client
//       const searchResponse = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
      
//       if (searchResponse.data.length > 0) {
//         return searchResponse.data[0]; // Return existing client
//       }
      
//       // If client doesn't exist, create a new one
//       const createResponse = await api.post("/api/account/clients/", {
//         phonenumber: formattedPhone,
//       });
      
//       return createResponse.data; // Return new client
      
//     } catch (err) {
//       if (err.response?.status === 400) {
//         // If creation failed due to duplicate (race condition), try to find again
//         const retryResponse = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//         if (retryResponse.data.length > 0) {
//           return retryResponse.data[0];
//         }
//         throw new Error("Client already exists but could not be found");
//       }
//       throw err;
//     }
//   };

//   const handlePhoneSubmit = async (e) => {
//     if (e) e.preventDefault();
    
//     // If we already have a client ID and it's a returning client, proceed directly
//     if (isReturningClient && clientId && !isEditingNumber) {
//       onLoginSuccess(validateAndFormatPhoneNumber(phoneNumber), clientId);
      
//       if (isFreePlan) {
//         await activateFreePlan(clientId);
//       } else {
//         setStep(2);
//       }
//       return;
//     }
    
//     setLoading(true);
//     setError("");

//     try {
//       if (!phoneNumber || phoneNumber.length < 9) {
//         throw new Error("Please enter a valid phone number");
//       }

//       const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
//       const client = await findOrCreateClient(formattedPhone);

//       if (client) {
//         setClientId(client.id);
//         onLoginSuccess(formattedPhone, client.id);
        
//         // Save to localStorage
//         localStorage.setItem("clientPhone", phoneNumber);
//         localStorage.setItem("clientId", client.id);
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
//       setError(err.response?.data?.phonenumber?.[0] || err.message || "Invalid phone number or server error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     setLoading(true);
//     setError("");
//     setPaymentInProgress(true);

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhone,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//       });
      
//       const checkoutRequestId = response.data.checkout_request_id;

//       const interval = setInterval(async () => {
//         try {
//           const statusResponse = await api.post("/api/payments/stk-status/", {
//             checkout_request_id: checkoutRequestId,
//           });
          
//           const status = statusResponse.data.status;
//           if (status.ResultCode === "0") {
//             const macAddress = await getMacAddress();
//             await api.post("/api/network_management/routers/1/hotspot-users/", {
//               client_id: clientId,
//               plan_id: selectedPlan.id,
//               transaction_id: checkoutRequestId,
//               mac: macAddress,
//             });
            
//             // Save to localStorage on successful payment
//             localStorage.setItem("clientPhone", phoneNumber);
//             localStorage.setItem("clientId", clientId);
            
//             onPaymentSuccess(selectedPlan.name, false);
//             clearInterval(interval);
//             setPaymentInProgress(false);
//             setStep(3);
//           } else if (status.ResultCode && status.ResultCode !== "0") {
//             setError("Payment failed. Please try again.");
//             clearInterval(interval);
//             setPaymentInProgress(false);
//           }
//         } catch (err) {
//           setError("Error verifying payment. Please check your M-Pesa messages.");
//           clearInterval(interval);
//           setPaymentInProgress(false);
//         }
//       }, 3000);
//     } catch (err) {
//       setError("Payment initiation failed. Please check your phone number.");
//       setPaymentInProgress(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditNumber = () => {
//     setIsEditingNumber(true);
//   };

//   const handleCancelEdit = () => {
//     const savedPhone = localStorage.getItem("clientPhone");
//     if (savedPhone) {
//       setPhoneNumber(savedPhone);
//     }
//     setIsEditingNumber(false);
//   };

//   const renderReturningClientUI = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <User className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Welcome Back!</h3>
//         <p className="text-sm text-gray-600">We recognize your number from previous visits</p>
//       </div>

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
//           onClick={handleEditNumber}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
//         >
//           <Edit className="w-4 h-4" />
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
//             ? 'Continue with your registered number or use a different one' 
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
//                 style={{ color: '#1f2937' }}
//               />
//               <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                 <Phone className="w-4 h-4 text-gray-400" />
//               </div>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number (e.g., 07XXXXXXXX)</p>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//               <p className="text-red-600 text-xs font-medium">{error}</p>
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
//                 onClick={handleCancelEdit}
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

//   const renderPaymentConfirmation = () => (
//     <div className="space-y-4">
//       <div className="text-center">
//         <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
//           <CreditCard className="w-8 h-8 text-white" />
//         </div>
//         <h3 className="text-xl font-bold text-gray-800 mb-1">Confirm Payment</h3>
//         <p className="text-sm text-gray-600">Review your plan details before proceeding</p>
//       </div>

//       <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
//         <div className="text-center mb-4">
//           <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
//             <Zap className="w-5 h-5 text-white" />
//           </div>
//           <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
//           <p className="text-2xl font-extrabold text-blue-600 mt-1">
//             KES {Number(selectedPlan.price).toLocaleString()}
//           </p>
//         </div>

//         <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Data Limit:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Download Speed:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Validity:</span>
//             <span className="font-semibold text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600">Phone Number:</span>
//             <span className="font-semibold text-gray-800">{phoneNumber}</span>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//           <p className="text-red-600 text-xs font-medium">{error}</p>
//         </div>
//       )}

//       <div className="space-y-2">
//         <button
//           onClick={handlePayment}
//           disabled={loading || paymentInProgress}
//           className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm"
//         >
//           {paymentInProgress ? (
//             <>
//               <RotateCw className="w-5 h-5 animate-spin" />
//               Processing Payment...
//             </>
//           ) : (
//             <>
//               <span>Pay with M-Pesa</span>
//               <img src={mpesa} alt="M-Pesa" className="h-7 w-auto" />
//             </>
//           )}
//         </button>

//         <button
//           onClick={() => {
//             setStep(1);
//             setIsEditingNumber(true);
//           }}
//           className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
//         >
//           <Edit className="w-4 h-4" />
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
//             <span className="font-medium text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Speed:</span>
//             <span className="font-medium text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-600">Valid for:</span>
//             <span className="font-medium text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
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
//         {step === 2 && renderPaymentConfirmation()}
//         {step === 3 && renderSuccess()}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;






import React, { useState, useEffect } from "react";
import api from "../api";
import { 
  Phone, 
  CreditCard, 
  CheckCircle, 
  X,
  ArrowRight,
  Smartphone,
  Shield,
  Zap,
  RotateCw,
  Wifi,
  User,
  History,
  Edit
} from "lucide-react";
import mpesa from "../assets/mpesa.png";

const AuthModal = ({ 
  onClose, 
  onLoginSuccess, 
  selectedPlan, 
  onPaymentSuccess, 
  existingClientData,
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

  const isFreePlan = selectedPlan?.category === "promotional" && 
                    (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

  // Check if client is returning from localStorage or props
  useEffect(() => {
    const savedPhone = localStorage.getItem("clientPhoneNumber");
    const savedClientId = localStorage.getItem("clientId");
    
    // Prioritize existingClientData from props, then check localStorage
    if (existingClientData.phoneNumber && existingClientData.clientId) {
      setPhoneNumber(existingClientData.phoneNumber);
      setClientId(existingClientData.clientId);
      setIsReturningClient(true);
    } else if (savedPhone && savedClientId) {
      setPhoneNumber(savedPhone);
      setClientId(savedClientId);
      setIsReturningClient(true);
    }
  }, [existingClientData]);

  const activateFreePlan = async (clientId) => {
    setLoading(true);
    try {
      const macAddress = await getMacAddress();
      await api.post("/api/network_management/routers/1/hotspot-users/", {
        client_id: clientId,
        plan_id: selectedPlan.id,
        transaction_id: null,
        mac: macAddress,
      });
      
      // Save to localStorage
      localStorage.setItem("clientPhoneNumber", phoneNumber);
      localStorage.setItem("clientId", clientId);
      
      onPaymentSuccess(selectedPlan.name, true);
      setStep(3);
    } catch (err) {
      setError("Failed to activate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    // Only allow numbers and limit to 10 digits
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanedValue);
  };

  const findOrCreateClient = async (formattedPhone, displayPhone) => {
    try {
      // First try to find existing client
      const searchResponse = await api.get("/api/account/clients/", {
        params: { phonenumber: formattedPhone }
      });
      
      if (searchResponse.data.length > 0) {
        return searchResponse.data[0]; // Return existing client
      }
      
      // If client doesn't exist, create a new one
      const createResponse = await api.post("/api/account/clients/", {
        phonenumber: formattedPhone,
      });
      
      return createResponse.data; // Return new client
      
    } catch (err) {
      if (err.response?.status === 400) {
        // If creation failed due to duplicate (race condition), try to find again
        const retryResponse = await api.get("/api/account/clients/", {
          params: { phonenumber: formattedPhone }
        });
        if (retryResponse.data.length > 0) {
          return retryResponse.data[0];
        }
        throw new Error("Unable to create or find client. Please verify your phone number and try again.");
      }
      throw err;
    }
  };

  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // If we already have a client ID and it's a returning client, proceed directly
    if (isReturningClient && clientId && !isEditingNumber) {
      onLoginSuccess(validateAndFormatPhoneNumber(phoneNumber), clientId);
      
      if (isFreePlan) {
        await activateFreePlan(clientId);
      } else {
        setStep(2);
      }
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      if (!phoneNumber || phoneNumber.length < 9) {
        throw new Error("Please enter a valid phone number");
      }

      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const displayPhone = `0${formattedPhone.slice(4)}`; // Standardize to 07XXXXXXXX format for display and storage
      const client = await findOrCreateClient(formattedPhone, displayPhone);

      if (client) {
        setClientId(client.id);
        onLoginSuccess(formattedPhone, client.id);
        
        // Save to localStorage using standardized display format
        localStorage.setItem("clientPhoneNumber", displayPhone);
        localStorage.setItem("clientId", client.id);
        setIsReturningClient(true);
        setIsEditingNumber(false);
        
        if (isFreePlan) {
          await activateFreePlan(client.id);
        } else {
          setStep(2);
        }
      }
    } catch (err) {
      console.error("Client error:", err);
      setError(err.response?.data?.phonenumber?.[0] || err.message || "Invalid phone number or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    setPaymentInProgress(true);

    try {
      const formattedPhone = validateAndFormatPhoneNumber(phoneNumber);
      const displayPhone = `0${formattedPhone.slice(4)}`; // Standardize for storage
      const response = await api.post("/api/payments/initiate/", {
        phone_number: formattedPhone,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
      });
      
      const checkoutRequestId = response.data.checkout_request_id;

      const interval = setInterval(async () => {
        try {
          const statusResponse = await api.post("/api/payments/stk-status/", {
            checkout_request_id: checkoutRequestId,
          });
          
          const status = statusResponse.data.status;
          if (status.ResultCode === "0") {
            const macAddress = await getMacAddress();
            await api.post("/api/network_management/routers/1/hotspot-users/", {
              client_id: clientId,
              plan_id: selectedPlan.id,
              transaction_id: checkoutRequestId,
              mac: macAddress,
            });
            
            // Save to localStorage on successful payment using standardized display format
            localStorage.setItem("clientPhoneNumber", displayPhone);
            localStorage.setItem("clientId", clientId);
            
            onPaymentSuccess(selectedPlan.name, false);
            clearInterval(interval);
            setPaymentInProgress(false);
            setStep(3);
          } else if (status.ResultCode && status.ResultCode !== "0") {
            setError("Payment failed. Please try again.");
            clearInterval(interval);
            setPaymentInProgress(false);
          }
        } catch (err) {
          setError("Error verifying payment. Please check your M-Pesa messages.");
          clearInterval(interval);
          setPaymentInProgress(false);
        }
      }, 3000);
    } catch (err) {
      setError("Payment initiation failed. Please check your phone number.");
      setPaymentInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNumber = () => {
    setIsEditingNumber(true);
  };

  const handleCancelEdit = () => {
    const savedPhone = localStorage.getItem("clientPhoneNumber");
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
    setIsEditingNumber(false);
  };

  const renderReturningClientUI = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <History className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Registered Number</p>
            <p className="text-lg font-bold text-green-700">{phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handlePhoneSubmit()}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Continuing...
            </>
          ) : (
            <>
              Continue as {phoneNumber}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={handleEditNumber}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Use Different Number
        </button>
      </div>
    </div>
  );

  const renderPhoneInput = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {isReturningClient && !isEditingNumber ? 'Welcome Back!' : 'Enter Your Phone Number'}
        </h3>
        <p className="text-sm text-gray-600">
          {isReturningClient && !isEditingNumber 
            ? 'We recognize your number from previous visits. Continue with your registered number or use a different one' 
            : 'We\'ll use this to process your payment and activate your plan'}
        </p>
      </div>

      {isReturningClient && !isEditingNumber ? (
        renderReturningClientUI()
      ) : (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all text-base font-medium text-gray-800 bg-white"
                placeholder="07XXXXXXXX or 7XXXXXXXX"
                required
                maxLength="10"
                style={{ color: '#1f2937' }}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter your 10-digit number (e.g., 07XXXXXXXX)</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isFreePlan ? 'Activate Now' : 'Continue to Payment'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isReturningClient && isEditingNumber && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-blue-800">Your data is secure</p>
            <p className="text-xs text-blue-600">We use encryption to protect your personal information</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentConfirmation = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Confirm Payment</h3>
        <p className="text-sm text-gray-600">Review your plan details before proceeding</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-800">{selectedPlan.name}</h4>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">
            KES {Number(selectedPlan.price).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2 bg-white rounded-lg p-3 border text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Data Limit:</span>
            <span className="font-semibold text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Download Speed:</span>
            <span className="font-semibold text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Validity:</span>
            <span className="font-semibold text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phone Number:</span>
            <span className="font-semibold text-gray-800">{phoneNumber}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handlePayment}
          disabled={loading || paymentInProgress}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 disabled:opacity-50 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm"
        >
          {paymentInProgress ? (
            <>
              <RotateCw className="w-7 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <span>Pay with M-Pesa</span>
              <img src={mpesa} alt="M-Pesa" className="h-9 w-9" />
            </>
          )}
        </button>

        <button
          onClick={() => {
            setStep(1);
            setIsEditingNumber(true);
          }}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <Edit className="w-5 h-5" />
          Change Phone Number
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">You're Connected!</h3>
        <p className="text-sm text-gray-600">Your internet plan has been activated successfully</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedPlan.name}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Data:</span>
            <span className="font-medium text-gray-800">{selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Speed:</span>
            <span className="font-medium text-gray-800">{selectedPlan.downloadSpeed.value} {selectedPlan.downloadSpeed.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valid for:</span>
            <span className="font-medium text-gray-800">{selectedPlan.expiry.value} {selectedPlan.expiry.unit}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
      >
        Start Browsing
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
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {step === 1 && renderPhoneInput()}
        {step === 2 && renderPaymentConfirmation()}
        {step === 3 && renderSuccess()}
      </div>
    </div>
  );
};

export default AuthModal;