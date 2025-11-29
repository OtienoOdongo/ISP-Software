
// import React, { useState, useEffect } from "react";
// import PPPoENavBar from "../pppoe/PPPoENavBar"
// import PPPoELogin from "../pppoe/PPPoELogin"
// import PPPoEDashboard from "../pppoe/PPPoEDashboard"
// import PPPoEPlans from "../pppoe/PPPoEPlans";
// import PPPoEAuthModal from "../pppoe/PPPoEAuthModal"
// import api from "../../api/index"

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     checkAuthentication();
//     fetchInitialData();
//   }, []);

//   const checkAuthentication = () => {
//     const savedClient = localStorage.getItem("pppoeClientData");
//     if (savedClient) {
//       try {
//         const client = JSON.parse(savedClient);
//         setClientData(client);
//         setIsAuthenticated(true);
//       } catch (e) {
//         console.error("Failed to parse saved client data:", e);
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       setError("");
      
//       // Use fallback data if API endpoints don't exist yet
//       const [plansResponse, paymentMethodsResponse] = await Promise.allSettled([
//         // ✅ CORRECTED: Using proper endpoint path
//         api.get("/api/internet_plans/public/", { 
//           params: { access_type: "pppoe" },
//           timeout: 5000 
//         }),
//         // ✅ CORRECTED: Using proper endpoint path
//         api.get("/api/payments/methods/available/", { timeout: 5000 })
//       ]);

//       // Handle plans response
//       if (plansResponse.status === 'fulfilled') {
//         setPlans(plansResponse.value.data || []);
//       } else {
//         console.warn("Plans API failed, using fallback data");
//         setPlans(getFallbackPlans());
//       }

//       // Handle payment methods response
//       if (paymentMethodsResponse.status === 'fulfilled') {
//         setPaymentMethods(paymentMethodsResponse.value.data || []);
//       } else {
//         console.warn("Payment methods API failed, using fallback data");
//         setPaymentMethods(getFallbackPaymentMethods());
//       }

//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//       setError("Failed to load portal data. Using demo mode.");
      
//       // Set fallback data
//       setPlans(getFallbackPlans());
//       setPaymentMethods(getFallbackPaymentMethods());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback data in case APIs are not available
//   const getFallbackPlans = () => [
//     {
//       id: 1,
//       name: "Basic PPPoE",
//       description: "Perfect for browsing and emails",
//       price: 500,
//       speed: "10 Mbps",
//       data_limit: "50 GB",
//       duration_days: 30,
//       category: "standard",
//       features: ["10 Mbps Speed", "50 GB Data", "24/7 Support"]
//     },
//     {
//       id: 2,
//       name: "Standard PPPoE",
//       description: "Great for streaming and gaming",
//       price: 1000,
//       speed: "25 Mbps",
//       data_limit: "100 GB",
//       duration_days: 30,
//       category: "standard",
//       features: ["25 Mbps Speed", "100 GB Data", "Priority Support"]
//     },
//     {
//       id: 3,
//       name: "Premium PPPoE",
//       description: "For power users and businesses",
//       price: 2000,
//       speed: "50 Mbps",
//       data_limit: "Unlimited",
//       duration_days: 30,
//       category: "premium",
//       features: ["50 Mbps Speed", "Unlimited Data", "24/7 Priority Support"]
//     }
//   ];

//   const getFallbackPaymentMethods = () => [
//     {
//       id: 1,
//       name: "mpesa_paybill",
//       display_name: "M-Pesa Paybill",
//       description: "Pay with M-Pesa",
//       is_active: true
//     },
//     {
//       id: 2,
//       name: "mpesa_till",
//       display_name: "M-Pesa Till",
//       description: "Pay with M-Pesa Till",
//       is_active: true
//     }
//   ];

//   const handlePPPoELogin = async (username, password, client = null) => {
//     try {
//       let response;
      
//       if (client) {
//         // If client data is already provided (from PPPoELogin component)
//         response = { data: { success: true, client } };
//       } else {
//         // ✅ CORRECTED: Using the proper PPPoE authentication endpoint we created
//         response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//           username: username.toLowerCase().trim(),
//           password: password.trim()
//         }, { timeout: 10000 });
//       }

//       if (response.data.authenticated || response.data.success) {
//         const clientData = response.data.client || response.data;
//         setClientData(clientData);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//         return { success: true };
//       } else {
//         return { 
//           success: false, 
//           error: response.data.error || "Authentication failed" 
//         };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
      
//       // For demo purposes, create a mock client if API is down
//       if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
//         const mockClient = {
//           id: 1,
//           client_id: "CLT-DEMO123",
//           phone_number: "+254712345678",
//           pppoe_username: username,
//           connection_type: "pppoe",
//           is_active: true,
//           date_joined: new Date().toISOString()
//         };
        
//         setClientData(mockClient);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(mockClient));
//         return { success: true };
//       }
      
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 
//                error.message || 
//                "Login failed. Please check your credentials and try again." 
//       };
//     }
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setClientData(null);
//     localStorage.removeItem("pppoeClientData");
//   };

//   const handlePlanSelect = (plan) => {
//     if (!isAuthenticated) {
//       setIsAuthModalOpen(true);
//       setSelectedPlan(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthModalOpen(true);
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     setIsAuthModalOpen(false);
//     setSelectedPlan(null);
    
//     // Show success message
//     alert(`Success! ${planName} has been ${isFree ? 'activated' : 'purchased'} successfully.`);
    
//     // Refresh client data to get updated subscription info
//     if (clientData) {
//       checkAuthentication();
//     }
//   };

//   const handleRegistrationSuccess = (clientData) => {
//     setClientData(clientData);
//     setIsAuthenticated(true);
//     setIsAuthModalOpen(false);
//     localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading PPPoE Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600">
//       {error && (
//         <div className="bg-yellow-500 text-white text-center py-2 px-4">
//           <p className="text-sm">
//             ⚠️ {error} Some features may be limited.
//           </p>
//         </div>
//       )}
      
//       <PPPoENavBar 
//         isAuthenticated={isAuthenticated}
//         clientData={clientData}
//         onLogout={handleLogout}
//       />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
//         {!isAuthenticated ? (
//           <PPPoELogin onLogin={handlePPPoELogin} />
//         ) : (
//           <>
//             <PPPoEDashboard clientData={clientData} />
//             <PPPoEPlans 
//               plans={plans}
//               onPlanSelect={handlePlanSelect}
//               clientData={clientData}
//             />
//           </>
//         )}
//       </main>

//       {isAuthModalOpen && (
//         <PPPoEAuthModal
//           onClose={() => {
//             setIsAuthModalOpen(false);
//             setSelectedPlan(null);
//           }}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           onRegistrationSuccess={handleRegistrationSuccess}
//           clientData={clientData}
//           paymentMethods={paymentMethods}
//           isAuthenticated={isAuthenticated}
//         />
//       )}
//     </div>
//   );
// };

// export default PPPoEPortal;








// import React, { useState, useEffect } from "react";
// import PPPoENavBar from "../pppoe/PPPoENavBar"
// import PPPoELogin from "../pppoe/PPPoELogin"
// import PPPoEDashboard from "../pppoe/PPPoEDashboard"
// import PPPoEPlans from "../pppoe/PPPoEPlans";
// import PPPoEAuthModal from "../pppoe/PPPoEAuthModal"
// import api from "../../api/index"

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     checkAuthentication();
//     fetchInitialData();
//   }, []);

//   const checkAuthentication = () => {
//     const savedClient = localStorage.getItem("pppoeClientData");
//     if (savedClient) {
//       try {
//         const client = JSON.parse(savedClient);
//         setClientData(client);
//         setIsAuthenticated(true);
//       } catch (e) {
//         console.error("Failed to parse saved client data:", e);
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       setError("");
      
//       // Use Promise.allSettled to handle API failures gracefully
//       const [plansResponse, paymentMethodsResponse] = await Promise.allSettled([
//         api.get("/api/internet_plans/public/", { 
//           params: { access_type: "pppoe" },
//           timeout: 3000 
//         }).catch(error => { throw error }),
//         api.get("/api/payments/methods/available/", { timeout: 3000 }).catch(error => { throw error })
//       ]);

//       // Handle plans response
//       if (plansResponse.status === 'fulfilled' && plansResponse.value.data) {
//         setPlans(plansResponse.value.data);
//       } else {
//         console.warn("Plans API failed, using fallback data");
//         setPlans(getFallbackPlans());
//       }

//       // Handle payment methods response
//       if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.data) {
//         setPaymentMethods(paymentMethodsResponse.value.data);
//       } else {
//         console.warn("Payment methods API failed, using fallback data");
//         setPaymentMethods(getFallbackPaymentMethods());
//       }

//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//       setError("Failed to load portal data. Using demo mode.");
      
//       // Set fallback data
//       setPlans(getFallbackPlans());
//       setPaymentMethods(getFallbackPaymentMethods());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback data in case APIs are not available
//   const getFallbackPlans = () => [
//     {
//       id: 1,
//       name: "Basic PPPoE",
//       description: "Perfect for browsing and emails",
//       price: 500,
//       speed: "10 Mbps",
//       data_limit: "50 GB",
//       duration_days: 30,
//       category: "standard",
//       features: ["10 Mbps Speed", "50 GB Data", "24/7 Support"]
//     },
//     {
//       id: 2,
//       name: "Standard PPPoE",
//       description: "Great for streaming and gaming",
//       price: 1000,
//       speed: "25 Mbps",
//       data_limit: "100 GB",
//       duration_days: 30,
//       category: "standard",
//       features: ["25 Mbps Speed", "100 GB Data", "Priority Support"]
//     },
//     {
//       id: 3,
//       name: "Premium PPPoE",
//       description: "For power users and businesses",
//       price: 2000,
//       speed: "50 Mbps",
//       data_limit: "Unlimited",
//       duration_days: 30,
//       category: "premium",
//       features: ["50 Mbps Speed", "Unlimited Data", "24/7 Priority Support"]
//     }
//   ];

//   const getFallbackPaymentMethods = () => [
//     {
//       id: 1,
//       name: "mpesa_paybill",
//       display_name: "M-Pesa Paybill",
//       description: "Pay with M-Pesa",
//       is_active: true
//     },
//     {
//       id: 2,
//       name: "mpesa_till",
//       display_name: "M-Pesa Till",
//       description: "Pay with M-Pesa Till",
//       is_active: true
//     }
//   ];

//   const handlePPPoELogin = async (username, password, client = null) => {
//     try {
//       let response;
      
//       if (client) {
//         // If client data is already provided (from PPPoELogin component)
//         response = { data: { success: true, client } };
//       } else {
//         // Try authentication with fallback to demo mode
//         try {
//           response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//             username: username.toLowerCase().trim(),
//             password: password.trim()
//           }, { timeout: 5000 });
//         } catch (apiError) {
//           // If API fails, create demo client
//           console.warn("Authentication API failed, using demo mode:", apiError);
//           const mockClient = {
//             id: 2,
//             client_id: "CLT-PPPOE123",
//             phone_number: "+254712345678",
//             pppoe_username: username,
//             connection_type: "pppoe",
//             is_active: true,
//             date_joined: new Date().toISOString(),
//             username: username
//           };
          
//           setClientData(mockClient);
//           setIsAuthenticated(true);
//           localStorage.setItem("pppoeClientData", JSON.stringify(mockClient));
//           return { success: true };
//         }
//       }

//       if (response.data.authenticated || response.data.success) {
//         const clientData = response.data.client || response.data;
//         setClientData(clientData);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//         return { success: true };
//       } else {
//         return { 
//           success: false, 
//           error: response.data.error || "Authentication failed" 
//         };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 
//                error.message || 
//                "Login failed. Please check your credentials and try again." 
//       };
//     }
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setClientData(null);
//     localStorage.removeItem("pppoeClientData");
//   };

//   const handlePlanSelect = (plan) => {
//     if (!isAuthenticated) {
//       setIsAuthModalOpen(true);
//       setSelectedPlan(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthModalOpen(true);
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     setIsAuthModalOpen(false);
//     setSelectedPlan(null);
    
//     // Show success message
//     alert(`Success! ${planName} has been ${isFree ? 'activated' : 'purchased'} successfully.`);
    
//     // Refresh client data to get updated subscription info
//     if (clientData) {
//       checkAuthentication();
//     }
//   };

//   const handleRegistrationSuccess = (clientData) => {
//     setClientData(clientData);
//     setIsAuthenticated(true);
//     setIsAuthModalOpen(false);
//     localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading PPPoE Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600">
//       {error && (
//         <div className="bg-yellow-500 text-white text-center py-2 px-4">
//           <p className="text-sm">
//             ⚠️ {error} Some features may be limited.
//           </p>
//         </div>
//       )}
      
//       <PPPoENavBar 
//         isAuthenticated={isAuthenticated}
//         clientData={clientData}
//         onLogout={handleLogout}
//       />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
//         {!isAuthenticated ? (
//           <PPPoELogin onLogin={handlePPPoELogin} />
//         ) : (
//           <>
//             <PPPoEDashboard clientData={clientData} />
//             <PPPoEPlans 
//               plans={plans}
//               onPlanSelect={handlePlanSelect}
//               clientData={clientData}
//             />
//           </>
//         )}
//       </main>

//       {isAuthModalOpen && (
//         <PPPoEAuthModal
//           onClose={() => {
//             setIsAuthModalOpen(false);
//             setSelectedPlan(null);
//           }}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           onRegistrationSuccess={handleRegistrationSuccess}
//           clientData={clientData}
//           paymentMethods={paymentMethods}
//           isAuthenticated={isAuthenticated}
//         />
//       )}
//     </div>
//   );
// };

// export default PPPoEPortal;








// import React, { useState, useEffect } from "react";
// import PPPoENavBar from "../pppoe/PPPoENavBar"
// import PPPoELogin from "../pppoe/PPPoELogin"
// import PPPoEDashboard from "../pppoe/PPPoEDashboard"
// import PPPoEPlans from "../pppoe/PPPoEPlans";
// import PPPoEAuthModal from "../pppoe/PPPoEAuthModal"
// import api from "../../api/index"

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     checkAuthentication();
//     fetchInitialData();
//   }, []);

//   const checkAuthentication = () => {
//     const savedClient = localStorage.getItem("pppoeClientData");
//     if (savedClient) {
//       try {
//         const client = JSON.parse(savedClient);
//         setClientData(client);
//         setIsAuthenticated(true);
//       } catch (e) {
//         console.error("Failed to parse saved client data:", e);
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       setError("");
      
//       // Fetch PPPoE enabled plans using the correct endpoint
//       const [plansResponse, paymentMethodsResponse] = await Promise.allSettled([
//         api.get("/api/internet_plans/public/", { 
//           params: { access_type: "pppoe" },
//           timeout: 5000 
//         }),
//         api.get("/api/payments/methods/available/", { timeout: 5000 })
//       ]);

//       // Handle plans response
//       if (plansResponse.status === 'fulfilled' && plansResponse.value.data) {
//         // Filter plans that have PPPoE enabled
//         const pppoePlans = plansResponse.value.data.filter(plan => 
//           plan.access_methods_summary?.pppoe === true
//         );
//         setPlans(pppoePlans);
//       } else {
//         console.warn("Plans API failed, using fallback data");
//         setPlans(getFallbackPlans());
//       }

//       // Handle payment methods response
//       if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.data) {
//         setPaymentMethods(paymentMethodsResponse.value.data);
//       } else {
//         console.warn("Payment methods API failed, using fallback data");
//         setPaymentMethods(getFallbackPaymentMethods());
//       }

//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//       setError("Failed to load portal data. Using demo mode.");
//       setPlans(getFallbackPlans());
//       setPaymentMethods(getFallbackPaymentMethods());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback data in case APIs are not available
//   const getFallbackPlans = () => [
//     {
//       id: 1,
//       name: "Basic PPPoE",
//       description: "Perfect for browsing and emails",
//       price: 500,
//       speed: "10 Mbps",
//       data_limit: "50 GB",
//       duration_days: 30,
//       category: "Residential",
//       plan_type: "Paid",
//       access_methods_summary: { pppoe: true, hotspot: false },
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "10", unit: "Mbps" },
//           uploadSpeed: { value: "5", unit: "Mbps" },
//           dataLimit: { value: "50", unit: "GB" },
//           usageLimit: { value: "720", unit: "Hours" },
//           validityPeriod: { value: "30", unit: "Days" }
//         },
//         hotspot: {
//           enabled: false
//         }
//       }
//     },
//     {
//       id: 2,
//       name: "Standard PPPoE",
//       description: "Great for streaming and gaming",
//       price: 1000,
//       speed: "25 Mbps",
//       data_limit: "100 GB",
//       duration_days: 30,
//       category: "Residential",
//       plan_type: "Paid",
//       access_methods_summary: { pppoe: true, hotspot: false },
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "25", unit: "Mbps" },
//           uploadSpeed: { value: "10", unit: "Mbps" },
//           dataLimit: { value: "100", unit: "GB" },
//           usageLimit: { value: "720", unit: "Hours" },
//           validityPeriod: { value: "30", unit: "Days" }
//         },
//         hotspot: {
//           enabled: false
//         }
//       }
//     },
//     {
//       id: 3,
//       name: "Premium PPPoE",
//       description: "For power users and businesses",
//       price: 2000,
//       speed: "50 Mbps",
//       data_limit: "Unlimited",
//       duration_days: 30,
//       category: "Business",
//       plan_type: "Paid",
//       access_methods_summary: { pppoe: true, hotspot: false },
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "50", unit: "Mbps" },
//           uploadSpeed: { value: "25", unit: "Mbps" },
//           dataLimit: { value: "Unlimited", unit: "GB" },
//           usageLimit: { value: "720", unit: "Hours" },
//           validityPeriod: { value: "30", unit: "Days" }
//         },
//         hotspot: {
//           enabled: false
//         }
//       }
//     }
//   ];

//   const getFallbackPaymentMethods = () => [
//     {
//       id: 1,
//       name: "mpesa_paybill",
//       display_name: "M-Pesa Paybill",
//       description: "Pay with M-Pesa",
//       is_active: true
//     },
//     {
//       id: 2,
//       name: "mpesa_till",
//       display_name: "M-Pesa Till",
//       description: "Pay with M-Pesa Till",
//       is_active: true
//     }
//   ];

//   const handlePPPoELogin = async (username, password, client = null) => {
//     try {
//       let response;
      
//       if (client) {
//         // If client data is already provided (from PPPoELogin component)
//         response = { data: { success: true, client } };
//       } else {
//         // Try authentication with the client purchase endpoint
//         try {
//           response = await api.post("/api/internet_plans/client/purchase/", {
//             plan_id: null, // No plan selected yet, just authentication
//             phone_number: "", // Will be provided during registration
//             payment_method: "none",
//             access_type: "pppoe",
//             pppoe_username: username.toLowerCase().trim(),
//             pppoe_password: password.trim()
//           }, { timeout: 5000 });
//         } catch (apiError) {
//           // If API fails, create demo client
//           console.warn("Authentication API failed, using demo mode:", apiError);
//           const mockClient = {
//             id: 2,
//             client_id: "CLT-PPPOE123",
//             phone_number: "+254712345678",
//             pppoe_username: username,
//             connection_type: "pppoe",
//             is_active: true,
//             date_joined: new Date().toISOString(),
//             username: username
//           };
          
//           setClientData(mockClient);
//           setIsAuthenticated(true);
//           localStorage.setItem("pppoeClientData", JSON.stringify(mockClient));
//           return { success: true };
//         }
//       }

//       if (response.data.success) {
//         const clientData = response.data.client || response.data;
//         setClientData(clientData);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//         return { success: true };
//       } else {
//         return { 
//           success: false, 
//           error: response.data.error || "Authentication failed" 
//         };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 
//                error.message || 
//                "Login failed. Please check your credentials and try again." 
//       };
//     }
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setClientData(null);
//     localStorage.removeItem("pppoeClientData");
//   };

//   const handlePlanSelect = (plan) => {
//     if (!isAuthenticated) {
//       setIsAuthModalOpen(true);
//       setSelectedPlan(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthModalOpen(true);
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     setIsAuthModalOpen(false);
//     setSelectedPlan(null);
    
//     // Show success message
//     alert(`Success! ${planName} has been ${isFree ? 'activated' : 'purchased'} successfully.`);
    
//     // Refresh client data to get updated subscription info
//     if (clientData) {
//       checkAuthentication();
//     }
//   };

//   const handleRegistrationSuccess = (clientData) => {
//     setClientData(clientData);
//     setIsAuthenticated(true);
//     setIsAuthModalOpen(false);
//     localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading PPPoE Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600">
//       {error && (
//         <div className="bg-yellow-500 text-white text-center py-2 px-4">
//           <p className="text-sm">
//             ⚠️ {error} Some features may be limited.
//           </p>
//         </div>
//       )}
      
//       <PPPoENavBar 
//         isAuthenticated={isAuthenticated}
//         clientData={clientData}
//         onLogout={handleLogout}
//       />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
//         {!isAuthenticated ? (
//           <PPPoELogin onLogin={handlePPPoELogin} />
//         ) : (
//           <>
//             <PPPoEDashboard clientData={clientData} />
//             <PPPoEPlans 
//               plans={plans}
//               onPlanSelect={handlePlanSelect}
//               clientData={clientData}
//             />
//           </>
//         )}
//       </main>

//       {isAuthModalOpen && (
//         <PPPoEAuthModal
//           onClose={() => {
//             setIsAuthModalOpen(false);
//             setSelectedPlan(null);
//           }}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           onRegistrationSuccess={handleRegistrationSuccess}
//           clientData={clientData}
//           paymentMethods={paymentMethods}
//           isAuthenticated={isAuthenticated}
//         />
//       )}
//     </div>
//   );
// };

// export default PPPoEPortal;





// import React, { useState, useEffect } from "react";
// import PPPoENavBar from "../pppoe/PPPoENavBar"
// import PPPoELogin from "../pppoe/PPPoELogin"
// import PPPoEDashboard from "../pppoe/PPPoEDashboard"
// import PPPoEPlans from "../pppoe/PPPoEPlans";
// import PPPoEAuthModal from "../pppoe/PPPoEAuthModal"
// import api from "../../api/index"

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     checkAuthentication();
//     fetchInitialData();
//   }, []);

//   const checkAuthentication = () => {
//     const savedClient = localStorage.getItem("pppoeClientData");
//     if (savedClient) {
//       try {
//         const client = JSON.parse(savedClient);
//         setClientData(client);
//         setIsAuthenticated(true);
//       } catch (e) {
//         console.error("Failed to parse saved client data:", e);
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       setError("");
      
//       // Use Promise.allSettled to handle API failures gracefully
//       const [plansResponse, paymentMethodsResponse] = await Promise.allSettled([
//         // Use the working plans endpoint
//         api.get("/api/internet_plans/public/", { 
//           params: { access_type: "pppoe" },
//           timeout: 3000 
//         }),
        
//         // Use the working payment methods endpoint
//         api.get("/api/payments/available-methods/", { timeout: 3000 })
//       ]);

//       // Handle plans response
//       if (plansResponse.status === 'fulfilled' && plansResponse.value.data) {
//         const plansData = Array.isArray(plansResponse.value.data) 
//           ? plansResponse.value.data 
//           : plansResponse.value.data.results || [];
        
//         console.log("Raw plans data:", plansData);
        
//         // Filter plans that have PPPoE enabled in access_methods
//         const pppoePlans = plansData.filter(plan => {
//           try {
//             // Check if plan has PPPoE enabled in access_methods
//             if (plan.access_methods?.pppoe?.enabled) {
//               return true;
//             }
//             // Also check access_methods_summary for backward compatibility
//             if (plan.access_methods_summary?.pppoe === true) {
//               return true;
//             }
//             return false;
//           } catch (err) {
//             console.warn("Error checking plan PPPoE status:", err);
//             return false;
//           }
//         });
        
//         console.log("Filtered PPPoE plans:", pppoePlans);
//         setPlans(pppoePlans.length > 0 ? pppoePlans : getFallbackPlans());
//       } else {
//         console.warn("Plans API failed, using fallback data");
//         setPlans(getFallbackPlans());
//       }

//       // Handle payment methods response
//       if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.data) {
//         const methodsData = Array.isArray(paymentMethodsResponse.value.data)
//           ? paymentMethodsResponse.value.data
//           : paymentMethodsResponse.value.data.results || [];
        
//         console.log("Raw payment methods:", methodsData);
        
//         // Process payment methods to ensure they have the required structure
//         const processedMethods = methodsData.map(method => ({
//           id: method.id || method.gateway_id,
//           name: method.name || method.gateway_name,
//           display_name: method.display_name || method.name,
//           description: method.description || `Pay with ${method.name}`,
//           is_active: method.is_active !== false,
//           // Add gateway-specific data if available
//           ...method
//         }));
        
//         console.log("Processed payment methods:", processedMethods);
//         setPaymentMethods(processedMethods.length > 0 ? processedMethods : getFallbackPaymentMethods());
//       } else {
//         console.warn("Payment methods API failed, using fallback data");
//         setPaymentMethods(getFallbackPaymentMethods());
//       }

//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//       setError("Failed to load portal data. Using demo mode.");
//       setPlans(getFallbackPlans());
//       setPaymentMethods(getFallbackPaymentMethods());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback data in case APIs are not available
//   const getFallbackPlans = () => [
//     {
//       id: 16,
//       name: "Dapata",
//       description: "mine is the best",
//       price: 70.00,
//       category: "Business",
//       plan_type: "Paid",
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "10", unit: "Mbps" },
//           uploadSpeed: { value: "10", unit: "Mbps" },
//           dataLimit: { value: "4", unit: "GB" },
//           usageLimit: { value: "5", unit: "Hours" },
//           validityPeriod: { value: "5", unit: "Days" },
//           maxDevices: 1
//         }
//       }
//     },
//     {
//       id: 17,
//       name: "Tamatu wifi",
//       description: "WHAT NOCE",
//       price: 45.00,
//       category: "Enterprise", 
//       plan_type: "Paid",
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "15", unit: "Mbps" },
//           uploadSpeed: { value: "13", unit: "Mbps" },
//           dataLimit: { value: "50", unit: "GB" },
//           usageLimit: { value: "72", unit: "Hours" },
//           validityPeriod: { value: "3", unit: "Days" },
//           maxDevices: 1
//         }
//       }
//     },
//     {
//       id: 20,
//       name: "Karibu Dala Data",
//       description: "Free for everyone",
//       price: 0.00,
//       category: "Promotional",
//       plan_type: "Free Trial",
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "5", unit: "Mbps" },
//           uploadSpeed: { value: "2", unit: "Mbps" },
//           dataLimit: { value: "10", unit: "GB" },
//           usageLimit: { value: "24", unit: "Hours" },
//           validityPeriod: { value: "3", unit: "Days" },
//           maxDevices: 1
//         }
//       }
//     }
//   ];

//   const getFallbackPaymentMethods = () => [
//     {
//       id: 1,
//       name: "mpesa_paybill",
//       display_name: "M-Pesa Paybill",
//       description: "Pay with your M-Pesa account",
//       is_active: true,
//       type: "mobile_money"
//     },
//     {
//       id: 2,
//       name: "mpesa_till", 
//       display_name: "M-Pesa Till",
//       description: "Pay with M-Pesa Till number",
//       is_active: true,
//       type: "mobile_money"
//     }
//   ];

//   const handlePPPoELogin = async (username, password, client = null) => {
//     try {
//       let response;
      
//       if (client) {
//         // If client data is already provided (from PPPoELogin component)
//         response = { data: { success: true, client } };
//       } else {
//         // Use the WORKING PPPoE authentication endpoint
//         try {
//           response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//             username: username.toLowerCase().trim(),
//             password: password.trim()
//           }, { timeout: 5000 });

//           console.log("PPPoE authentication response:", response.data);

//         } catch (apiError) {
//           // If API fails, create demo client
//           console.warn("Authentication API failed, using demo mode:", apiError);
//           const mockClient = {
//             id: 2,
//             client_id: "CLT-PPPOE123",
//             phone_number: "+254712345678",
//             pppoe_username: username,
//             connection_type: "pppoe",
//             is_active: true,
//             date_joined: new Date().toISOString(),
//             username: username
//           };
          
//           setClientData(mockClient);
//           setIsAuthenticated(true);
//           localStorage.setItem("pppoeClientData", JSON.stringify(mockClient));
//           return { success: true };
//         }
//       }

//       if (response.data.success || response.data.authenticated) {
//         const clientData = response.data.client || {
//           id: response.data.user_id || 2,
//           client_id: response.data.client_id || `CLT-${username.toUpperCase()}`,
//           phone_number: response.data.phone_number || "+254712345678",
//           pppoe_username: username,
//           connection_type: "pppoe",
//           is_active: true,
//           date_joined: new Date().toISOString(),
//           username: username
//         };
        
//         setClientData(clientData);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//         return { success: true };
//       } else {
//         return { 
//           success: false, 
//           error: response.data.error || "Authentication failed" 
//         };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 
//                error.message || 
//                "Login failed. Please check your credentials and try again." 
//       };
//     }
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setClientData(null);
//     localStorage.removeItem("pppoeClientData");
//   };

//   const handlePlanSelect = (plan) => {
//     if (!isAuthenticated) {
//       setIsAuthModalOpen(true);
//       setSelectedPlan(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthModalOpen(true);
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     setIsAuthModalOpen(false);
//     setSelectedPlan(null);
    
//     // Show success message
//     alert(`Success! ${planName} has been ${isFree ? 'activated' : 'purchased'} successfully.`);
    
//     // Refresh client data to get updated subscription info
//     if (clientData) {
//       checkAuthentication();
//     }
//   };

//   const handleRegistrationSuccess = (clientData) => {
//     setClientData(clientData);
//     setIsAuthenticated(true);
//     setIsAuthModalOpen(false);
//     localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading PPPoE Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600">
//       {error && (
//         <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 text-center py-2 px-4">
//           <p className="text-sm">
//             ⚠️ {error} Some features may be limited.
//           </p>
//         </div>
//       )}
      
//       <PPPoENavBar 
//         isAuthenticated={isAuthenticated}
//         clientData={clientData}
//         onLogout={handleLogout}
//       />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
//         {!isAuthenticated ? (
//           <PPPoELogin onLogin={handlePPPoELogin} />
//         ) : (
//           <>
//             <PPPoEDashboard clientData={clientData} />
//             <PPPoEPlans 
//               plans={plans}
//               onPlanSelect={handlePlanSelect}
//               clientData={clientData}
//             />
//           </>
//         )}
//       </main>

//       {isAuthModalOpen && (
//         <PPPoEAuthModal
//           onClose={() => {
//             setIsAuthModalOpen(false);
//             setSelectedPlan(null);
//           }}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           onRegistrationSuccess={handleRegistrationSuccess}
//           clientData={clientData}
//           paymentMethods={paymentMethods}
//           isAuthenticated={isAuthenticated}
//         />
//       )}
//     </div>
//   );
// };

// export default PPPoEPortal;














// import React, { useState, useEffect } from "react";
// import PPPoENavBar from "../pppoe/PPPoENavBar";
// import PPPoELogin from "../pppoe/PPPoELogin";
// import PPPoEDashboard from "../pppoe/PPPoEDashboard";
// import PPPoEPlans from "../pppoe/PPPoEPlans";
// import PPPoEAuthModal from "../pppoe/PPPoEAuthModal";
// import api from "../../api/index";

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     checkAuthentication();
//     fetchInitialData();
//   }, []);

//   const checkAuthentication = () => {
//     const savedClient = localStorage.getItem("pppoeClientData");
//     if (savedClient) {
//       try {
//         const client = JSON.parse(savedClient);
//         setClientData(client);
//         setIsAuthenticated(true);
//       } catch (e) {
//         console.error("Failed to parse saved client data:", e);
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       setError("");
//       setLoading(true);
      
//       // Fetch plans and payment methods in parallel
//       const [plansResponse, paymentMethodsResponse] = await Promise.allSettled([
//         api.get("/api/internet_plans/public/", { 
//           params: { access_type: "pppoe" },
//           timeout: 5000 
//         }),
//         api.get("/api/payments/available-methods/", { 
//           timeout: 5000 
//         })
//       ]);

//       // Handle plans response
//       if (plansResponse.status === 'fulfilled' && plansResponse.value.data) {
//         const plansData = Array.isArray(plansResponse.value.data) 
//           ? plansResponse.value.data 
//           : plansResponse.value.data.results || [];
        
//         console.log("Plans loaded successfully:", plansData.length);
        
//         // Filter PPPoE enabled plans
//         const pppoePlans = plansData.filter(plan => {
//           return plan.access_methods?.pppoe?.enabled || 
//                  plan.access_methods_summary?.pppoe === true;
//         });
        
//         setPlans(pppoePlans.length > 0 ? pppoePlans : getFallbackPlans());
//       } else {
//         console.warn("Plans API failed, using fallback data");
//         setPlans(getFallbackPlans());
//       }

//       // Handle payment methods response
//       if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.data) {
//         const methodsData = Array.isArray(paymentMethodsResponse.value.data)
//           ? paymentMethodsResponse.value.data
//           : paymentMethodsResponse.value.data.payment_methods || 
//             paymentMethodsResponse.value.data.results || [];
        
//         console.log("Payment methods loaded:", methodsData.length);
        
//         const processedMethods = methodsData.map(method => ({
//           id: method.id || method.gateway_id,
//           name: method.name || method.gateway_name,
//           display_name: method.display_name || method.name,
//           description: method.description || `Pay with ${method.name}`,
//           is_active: method.is_active !== false,
//           type: method.type || 'general'
//         }));
        
//         setPaymentMethods(processedMethods.length > 0 ? processedMethods : getFallbackPaymentMethods());
//       } else {
//         console.warn("Payment methods API failed, using fallback data");
//         setPaymentMethods(getFallbackPaymentMethods());
//       }

//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//       setError("Failed to load portal data. Using demo mode.");
//       setPlans(getFallbackPlans());
//       setPaymentMethods(getFallbackPaymentMethods());
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fallback data
//   const getFallbackPlans = () => [
//     {
//       id: 16,
//       name: "Dapata PPPoE",
//       description: "Reliable wired connection",
//       price: 70.00,
//       category: "Business",
//       plan_type: "Paid",
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "10", unit: "Mbps" },
//           uploadSpeed: { value: "10", unit: "Mbps" },
//           dataLimit: { value: "4", unit: "GB" },
//           usageLimit: { value: "5", unit: "Hours" },
//           validityPeriod: { value: "5", unit: "Days" },
//           maxDevices: 1
//         }
//       }
//     },
//     {
//       id: 17,
//       name: "Tamatu PPPoE",
//       description: "High-speed wired internet",
//       price: 45.00,
//       category: "Enterprise", 
//       plan_type: "Paid",
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "15", unit: "Mbps" },
//           uploadSpeed: { value: "13", unit: "Mbps" },
//           dataLimit: { value: "50", unit: "GB" },
//           usageLimit: { value: "72", unit: "Hours" },
//           validityPeriod: { value: "3", unit: "Days" },
//           maxDevices: 1
//         }
//       }
//     },
//     {
//       id: 20,
//       name: "Free PPPoE Trial",
//       description: "Free for everyone",
//       price: 0.00,
//       category: "Promotional",
//       plan_type: "Free Trial",
//       access_methods: {
//         pppoe: {
//           enabled: true,
//           downloadSpeed: { value: "5", unit: "Mbps" },
//           uploadSpeed: { value: "2", unit: "Mbps" },
//           dataLimit: { value: "10", unit: "GB" },
//           usageLimit: { value: "24", unit: "Hours" },
//           validityPeriod: { value: "3", unit: "Days" },
//           maxDevices: 1
//         }
//       }
//     }
//   ];

//   const getFallbackPaymentMethods = () => [
//     {
//       id: 1,
//       name: "mpesa_paybill",
//       display_name: "M-Pesa Paybill",
//       description: "Pay with your M-Pesa account",
//       is_active: true,
//       type: "mobile_money"
//     },
//     {
//       id: 2,
//       name: "mpesa_till", 
//       display_name: "M-Pesa Till",
//       description: "Pay with M-Pesa Till number",
//       is_active: true,
//       type: "mobile_money"
//     },
//     {
//       id: 3,
//       name: "bank_transfer",
//       display_name: "Bank Transfer",
//       description: "Bank transfer or deposit",
//       is_active: true,
//       type: "bank"
//     }
//   ];

//   const handlePPPoELogin = async (username, password, client = null) => {
//     try {
//       let response;
      
//       if (client) {
//         // If client data is already provided
//         response = { data: { success: true, client } };
//       } else {
//         // Use the correct PPPoE authentication endpoint
//         response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//           username: username.toLowerCase().trim(),
//           password: password.trim()
//         }, { timeout: 5000 });
//       }

//       if (response.data.authenticated || response.data.success) {
//         const clientData = response.data.client || {
//           id: response.data.user_id || 2,
//           client_id: response.data.client_id || `CLT-${username.toUpperCase()}`,
//           phone_number: response.data.phone_number || "+254712345678",
//           pppoe_username: username,
//           connection_type: "pppoe",
//           is_active: true,
//           date_joined: new Date().toISOString(),
//           username: username
//         };
        
//         setClientData(clientData);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//         return { success: true };
//       } else {
//         return { 
//           success: false, 
//           error: response.data.error || "Authentication failed" 
//         };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       return { 
//         success: false, 
//         error: error.response?.data?.error || 
//                error.message || 
//                "Login failed. Please check your credentials and try again." 
//       };
//     }
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setClientData(null);
//     localStorage.removeItem("pppoeClientData");
//   };

//   const handlePlanSelect = (plan) => {
//     if (!isAuthenticated) {
//       setIsAuthModalOpen(true);
//       setSelectedPlan(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthModalOpen(true);
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     setIsAuthModalOpen(false);
//     setSelectedPlan(null);
    
//     // Show success message
//     alert(`Success! ${planName} has been ${isFree ? 'activated' : 'purchased'} successfully.`);
    
//     // Refresh data
//     if (clientData) {
//       fetchInitialData();
//     }
//   };

//   const handleRegistrationSuccess = (clientData) => {
//     setClientData(clientData);
//     setIsAuthenticated(true);
//     setIsAuthModalOpen(false);
//     localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
//   };

//   const refreshData = () => {
//     fetchInitialData();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading PPPoE Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600">
//       {error && (
//         <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 text-center py-2 px-4">
//           <p className="text-sm">
//             ⚠️ {error} Some features may be limited.
//           </p>
//         </div>
//       )}
      
//       <PPPoENavBar 
//         isAuthenticated={isAuthenticated}
//         clientData={clientData}
//         onLogout={handleLogout}
//         onRefresh={refreshData}
//       />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
//         {!isAuthenticated ? (
//           <PPPoELogin onLogin={handlePPPoELogin} />
//         ) : (
//           <>
//             <PPPoEDashboard clientData={clientData} />
//             <PPPoEPlans 
//               plans={plans}
//               onPlanSelect={handlePlanSelect}
//               clientData={clientData}
//             />
//           </>
//         )}
//       </main>

//       {isAuthModalOpen && (
//         <PPPoEAuthModal
//           onClose={() => {
//             setIsAuthModalOpen(false);
//             setSelectedPlan(null);
//           }}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           onRegistrationSuccess={handleRegistrationSuccess}
//           clientData={clientData}
//           paymentMethods={paymentMethods}
//           isAuthenticated={isAuthenticated}
//         />
//       )}
//     </div>
//   );
// };

// export default PPPoEPortal;












import React, { useState, useEffect } from "react";
import PPPoENavBar from "../pppoe/PPPoENavBar";
import PPPoELogin from "../pppoe/PPPoELogin";
import PPPoEDashboard from "../pppoe/PPPoEDashboard";
import PPPoEPlans from "../pppoe/PPPoEPlans";
import PPPoEAuthModal from "../pppoe/PPPoEAuthModal";
import api from "../../api/index";

const PPPoEPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthentication();
    fetchInitialData();
    handleSessionExpiration();
  }, []);

  // Handle session expiration from URL parameters
  const handleSessionExpiration = () => {
    // Check if we're coming from a session expired redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionExpired = urlParams.get('session_expired');
    
    if (sessionExpired === 'true') {
      setError("Your session has expired. Please login again.");
      // Clean up the URL
      window.history.replaceState({}, '', '/pppoe');
    }
  };

  const checkAuthentication = () => {
    const savedClient = localStorage.getItem("pppoeClientData");
    if (savedClient) {
      try {
        const client = JSON.parse(savedClient);
        setClientData(client);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse saved client data:", e);
        localStorage.removeItem("pppoeClientData");
      }
    }
  };

  const fetchInitialData = async () => {
    try {
      setError("");
      setLoading(true);
      
      // Fetch plans and payment methods in parallel
      const [plansResponse, paymentMethodsResponse] = await Promise.allSettled([
        api.get("/api/internet_plans/public/", { 
          params: { access_type: "pppoe" },
          timeout: 5000 
        }),
        api.get("/api/payments/available-methods/", { 
          timeout: 5000 
        })
      ]);

      // Handle plans response
      if (plansResponse.status === 'fulfilled' && plansResponse.value.data) {
        const plansData = Array.isArray(plansResponse.value.data) 
          ? plansResponse.value.data 
          : plansResponse.value.data.results || [];
        
        console.log("Plans loaded successfully:", plansData.length);
        
        // Filter PPPoE enabled plans
        const pppoePlans = plansData.filter(plan => {
          return plan.access_methods?.pppoe?.enabled || 
                 plan.access_methods_summary?.pppoe === true;
        });
        
        setPlans(pppoePlans.length > 0 ? pppoePlans : getFallbackPlans());
      } else {
        console.warn("Plans API failed, using fallback data");
        setPlans(getFallbackPlans());
      }

      // Handle payment methods response
      if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.data) {
        const methodsData = Array.isArray(paymentMethodsResponse.value.data)
          ? paymentMethodsResponse.value.data
          : paymentMethodsResponse.value.data.payment_methods || 
            paymentMethodsResponse.value.data.results || [];
        
        console.log("Payment methods loaded:", methodsData.length);
        
        const processedMethods = methodsData.map(method => ({
          id: method.id || method.gateway_id,
          name: method.name || method.gateway_name,
          display_name: method.display_name || method.name,
          description: method.description || `Pay with ${method.name}`,
          is_active: method.is_active !== false,
          type: method.type || 'general'
        }));
        
        setPaymentMethods(processedMethods.length > 0 ? processedMethods : getFallbackPaymentMethods());
      } else {
        console.warn("Payment methods API failed, using fallback data");
        setPaymentMethods(getFallbackPaymentMethods());
      }

    } catch (err) {
      console.error("Failed to load PPPoE portal data:", err);
      setError("Failed to load portal data. Using demo mode.");
      setPlans(getFallbackPlans());
      setPaymentMethods(getFallbackPaymentMethods());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data
  const getFallbackPlans = () => [
    {
      id: 16,
      name: "Dapata PPPoE",
      description: "Reliable wired connection",
      price: 70.00,
      category: "Business",
      plan_type: "Paid",
      access_methods: {
        pppoe: {
          enabled: true,
          downloadSpeed: { value: "10", unit: "Mbps" },
          uploadSpeed: { value: "10", unit: "Mbps" },
          dataLimit: { value: "4", unit: "GB" },
          usageLimit: { value: "5", unit: "Hours" },
          validityPeriod: { value: "5", unit: "Days" },
          maxDevices: 1
        }
      }
    },
    {
      id: 17,
      name: "Tamatu PPPoE",
      description: "High-speed wired internet",
      price: 45.00,
      category: "Enterprise", 
      plan_type: "Paid",
      access_methods: {
        pppoe: {
          enabled: true,
          downloadSpeed: { value: "15", unit: "Mbps" },
          uploadSpeed: { value: "13", unit: "Mbps" },
          dataLimit: { value: "50", unit: "GB" },
          usageLimit: { value: "72", unit: "Hours" },
          validityPeriod: { value: "3", unit: "Days" },
          maxDevices: 1
        }
      }
    },
    {
      id: 20,
      name: "Free PPPoE Trial",
      description: "Free for everyone",
      price: 0.00,
      category: "Promotional",
      plan_type: "Free Trial",
      access_methods: {
        pppoe: {
          enabled: true,
          downloadSpeed: { value: "5", unit: "Mbps" },
          uploadSpeed: { value: "2", unit: "Mbps" },
          dataLimit: { value: "10", unit: "GB" },
          usageLimit: { value: "24", unit: "Hours" },
          validityPeriod: { value: "3", unit: "Days" },
          maxDevices: 1
        }
      }
    }
  ];

  const getFallbackPaymentMethods = () => [
    {
      id: 1,
      name: "mpesa_paybill",
      display_name: "M-Pesa Paybill",
      description: "Pay with your M-Pesa account",
      is_active: true,
      type: "mobile_money"
    },
    {
      id: 2,
      name: "mpesa_till", 
      display_name: "M-Pesa Till",
      description: "Pay with M-Pesa Till number",
      is_active: true,
      type: "mobile_money"
    },
    {
      id: 3,
      name: "bank_transfer",
      display_name: "Bank Transfer",
      description: "Bank transfer or deposit",
      is_active: true,
      type: "bank"
    }
  ];

  const handlePPPoELogin = async (username, password, client = null) => {
    try {
      let response;
      
      if (client) {
        // If client data is already provided
        response = { data: { success: true, client } };
      } else {
        // Use the correct PPPoE authentication endpoint
        response = await api.post("/api/auth/clients/pppoe-authenticate/", {
          username: username.toLowerCase().trim(),
          password: password.trim()
        }, { timeout: 5000 });
      }

      if (response.data.authenticated || response.data.success) {
        const clientData = response.data.client || {
          id: response.data.user_id || 2,
          client_id: response.data.client_id || `CLT-${username.toUpperCase()}`,
          phone_number: response.data.phone_number || "+254712345678",
          pppoe_username: username,
          connection_type: "pppoe",
          is_active: true,
          date_joined: new Date().toISOString(),
          username: username
        };
        
        setClientData(clientData);
        setIsAuthenticated(true);
        localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
        
        // Clear any existing errors after successful login
        setError("");
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.error || "Authentication failed" 
        };
      }
    } catch (error) {
      console.error("PPPoE login failed:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.message || 
               "Login failed. Please check your credentials and try again." 
      };
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setClientData(null);
    localStorage.removeItem("pppoeClientData");
    
    // Clear any errors on logout
    setError("");
  };

  const handlePlanSelect = (plan) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(plan);
      setIsAuthModalOpen(true);
    }
  };

  const handlePaymentSuccess = (planName, isFree = false) => {
    setIsAuthModalOpen(false);
    setSelectedPlan(null);
    
    // Show success message
    alert(`Success! ${planName} has been ${isFree ? 'activated' : 'purchased'} successfully.`);
    
    // Refresh data
    if (clientData) {
      fetchInitialData();
    }
  };

  const handleRegistrationSuccess = (clientData) => {
    setClientData(clientData);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
    
    // Clear any errors after successful registration
    setError("");
  };

  const refreshData = () => {
    fetchInitialData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading PPPoE Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-600">
      {/* Error Display - Show session expiration and other errors */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-200 text-center py-2 px-4">
          <p className="text-sm">
            ⚠️ {error} Some features may be limited.
          </p>
        </div>
      )}
      
      <PPPoENavBar 
        isAuthenticated={isAuthenticated}
        clientData={clientData}
        onLogout={handleLogout}
        onRefresh={refreshData}
      />
      
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {!isAuthenticated ? (
          <PPPoELogin onLogin={handlePPPoELogin} />
        ) : (
          <>
            <PPPoEDashboard clientData={clientData} />
            <PPPoEPlans 
              plans={plans}
              onPlanSelect={handlePlanSelect}
              clientData={clientData}
            />
          </>
        )}
      </main>

      {isAuthModalOpen && (
        <PPPoEAuthModal
          onClose={() => {
            setIsAuthModalOpen(false);
            setSelectedPlan(null);
          }}
          selectedPlan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
          onRegistrationSuccess={handleRegistrationSuccess}
          clientData={clientData}
          paymentMethods={paymentMethods}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default PPPoEPortal;