

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
//     handleSessionExpiration();
//   }, []);

//   // Handle session expiration from URL parameters
//   const handleSessionExpiration = () => {
//     // Check if we're coming from a session expired redirect
//     const urlParams = new URLSearchParams(window.location.search);
//     const sessionExpired = urlParams.get('session_expired');
    
//     if (sessionExpired === 'true') {
//       setError("Your session has expired. Please login again.");
//       // Clean up the URL
//       window.history.replaceState({}, '', '/pppoe');
//     }
//   };

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
        
//         // Clear any existing errors after successful login
//         setError("");
        
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
    
//     // Clear any errors on logout
//     setError("");
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
    
//     // Clear any errors after successful registration
//     setError("");
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
//       {/* Error Display - Show session expiration and other errors */}
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthentication();
    fetchInitialData();
    handleSessionExpiration();
  }, []);

  // Handle session expiration from URL parameters
  const handleSessionExpiration = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionExpired = urlParams.get('session_expired');
    
    if (sessionExpired === 'true') {
      setError("Your session has expired. Please login again.");
      window.history.replaceState({}, '', '/pppoe');
    }
  };

  const checkAuthentication = () => {
    const savedClient = localStorage.getItem("pppoeClientData");
    const savedToken = localStorage.getItem("accessToken");
    
    if (savedClient && savedToken) {
      try {
        const client = JSON.parse(savedClient);
        setClientData(client);
        setIsAuthenticated(true);
        setIsAdmin(client.user_type === 'admin' || client.user_type === 'superadmin');
        
        // Set authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (e) {
        console.error("Failed to parse saved client data:", e);
        localStorage.removeItem("pppoeClientData");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
        // If client data is already provided from authentication
        response = { data: { authenticated: true, client } };
      } else {
        // Use the enhanced PPPoE authentication endpoint
        response = await api.post("/api/auth/clients/pppoe-authenticate/", {
          username: username.toLowerCase().trim(),
          password: password.trim()
        }, { timeout: 5000 });
      }

      if (response.data.authenticated) {
        const clientData = response.data.client;
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        
        // Store tokens and client data
        setClientData(clientData);
        setIsAuthenticated(true);
        setIsAdmin(clientData.user_type === 'admin' || clientData.user_type === 'superadmin');
        
        localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        
        // Set authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Clear any existing errors after successful login
        setError("");
        
        return { success: true, isAdmin: clientData.user_type === 'admin' };
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
    setIsAdmin(false);
    
    // Clear all stored data
    localStorage.removeItem("pppoeClientData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("pppoeRememberMe");
    localStorage.removeItem("pppoeUsername");
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
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
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onRefresh={refreshData}
      />
      
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {!isAuthenticated ? (
          <PPPoELogin onLogin={handlePPPoELogin} />
        ) : (
          <>
            <PPPoEDashboard 
              clientData={clientData} 
              isAdmin={isAdmin}
            />
            <PPPoEPlans 
              plans={plans}
              onPlanSelect={handlePlanSelect}
              clientData={clientData}
              isAdmin={isAdmin}
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
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default PPPoEPortal;