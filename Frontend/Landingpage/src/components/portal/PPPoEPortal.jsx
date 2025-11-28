// import React, { useState, useEffect } from "react";
// import PPPoENavBar from "../ppoe/PPPoENavBar"
// import PPPoELogin from "../pppoe/PPPoELogin";
// import PPPoEDashboard from "../pppoe/PPPoEDashboard";
// import PPPoEPlans from "../pppoe/PPPoEPlans";
// import PPPoEAuthModal from "../pppoe/PPPoEAuthModal";
// import api from "../../api/index"

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);

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
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       const [plansResponse, paymentMethodsResponse] = await Promise.all([
//         api.get("/api/internet_plans/public/?access_type=pppoe"),
//         api.get("/api/payments/available-methods/")
//       ]);

//       setPlans(plansResponse.data);
//       setPaymentMethods(paymentMethodsResponse.data.available_methods || []);
//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePPPoELogin = async (username, password) => {
//     try {
//       // Verify PPPoE credentials with backend
//       const response = await api.post("/api/authentication/pppoe-login/", {
//         username,
//         password
//       });

//       if (response.data.success) {
//         const client = response.data.client;
//         setClientData(client);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(client));
//         return { success: true };
//       } else {
//         return { success: false, error: response.data.error };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       return { 
//         success: false, 
//         error: error.response?.data?.error || "Login failed. Please check your credentials." 
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
// import PPPoENavBar from "../ppoe/PPPoENavBar"
// import PPPoELogin from "../ppoe/PPPoELogin"
// import PPPoEDashboard from "../ppoe/PPPoEDashboard";
// import PPPoEPlans from "../ppoe/PPPoEPlans";
// import PPPoEAuthModal from "../ppoe/PPPoEAuthModal"
// import api from "../../api/index"

// const PPPoEPortal = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [clientData, setClientData] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(true);

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
//         localStorage.removeItem("pppoeClientData");
//       }
//     }
//   };

//   const fetchInitialData = async () => {
//     try {
//       const [plansResponse, paymentMethodsResponse] = await Promise.all([
//         // ✅ CORRECTED: Using proper PPPoE plans endpoint
//         api.get("/api/internet_plans/public-plans/?access_type=pppoe"),
//         // ✅ CORRECTED: Using proper payment methods endpoint
//         api.get("/api/payments/payment-methods/available/")
//       ]);

//       setPlans(plansResponse.data);
//       setPaymentMethods(paymentMethodsResponse.data || []);
//     } catch (err) {
//       console.error("Failed to load PPPoE portal data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePPPoELogin = async (username, password) => {
//     try {
//       // ✅ CORRECTED: Using proper PPPoE authentication endpoint
//       const response = await api.post("/api/account/clients/pppoe-login/", {
//         username,
//         password
//       });

//       if (response.data.success) {
//         const client = response.data.client;
//         setClientData(client);
//         setIsAuthenticated(true);
//         localStorage.setItem("pppoeClientData", JSON.stringify(client));
//         return { success: true };
//       } else {
//         return { success: false, error: response.data.error };
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       return { 
//         success: false, 
//         error: error.response?.data?.error || "Login failed. Please check your credentials." 
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






import React, { useState, useEffect } from "react";
import PPPoENavBar from "../pppoe/PPPoENavBar"
import PPPoELogin from "../pppoe/PPPoELogin"
import PPPoEDashboard from "../pppoe/PPPoEDashboard"
import PPPoEPlans from "../pppoe/PPPoEPlans";
import PPPoEAuthModal from "../pppoe/PPPoEAuthModal"
import api from "../../api/index"

const PPPoEPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
    fetchInitialData();
  }, []);

  const checkAuthentication = () => {
    const savedClient = localStorage.getItem("pppoeClientData");
    if (savedClient) {
      try {
        const client = JSON.parse(savedClient);
        setClientData(client);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("pppoeClientData");
      }
    }
  };

  const fetchInitialData = async () => {
    try {
      const [plansResponse, paymentMethodsResponse] = await Promise.all([
        // ✅ CORRECTED: Using existing Django endpoint
        api.get("/api/internet_plans/public/?access_type=pppoe"),
        // ✅ CORRECTED: Using existing Django endpoint
        api.get("/api/payments/available-methods/")
      ]);

      setPlans(plansResponse.data);
      setPaymentMethods(paymentMethodsResponse.data || []);
    } catch (err) {
      console.error("Failed to load PPPoE portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePPPoELogin = async (username, password) => {
    try {
      // ✅ CORRECTED: Using proper PPPoE authentication endpoint
      const response = await api.post("/api/account/clients/pppoe-login/", {
        username,
        password
      });

      if (response.data.success) {
        const client = response.data.client;
        setClientData(client);
        setIsAuthenticated(true);
        localStorage.setItem("pppoeClientData", JSON.stringify(client));
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error("PPPoE login failed:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || "Login failed. Please check your credentials." 
      };
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setClientData(null);
    localStorage.removeItem("pppoeClientData");
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
    // Refresh client data to get updated subscription info
    if (clientData) {
      checkAuthentication();
    }
  };

  const handleRegistrationSuccess = (clientData) => {
    setClientData(clientData);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    localStorage.setItem("pppoeClientData", JSON.stringify(clientData));
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
      <PPPoENavBar 
        isAuthenticated={isAuthenticated}
        clientData={clientData}
        onLogout={handleLogout}
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