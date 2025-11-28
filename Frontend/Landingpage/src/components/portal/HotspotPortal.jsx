// import React, { useState, useEffect } from "react";
// import HotspotNavBar from "../hotspot/HotspotNavBar"
// import HotspotHero from "../hotspot/HotspotHero";
// import HotspotPlans from "../hotspot/HotspotPlans";
// import HotspotAuthModal from "../hotspot/HotspotAuthModal";
// import HotspotPaymentMethods from "../hotspot/HotspotPaymentMethods";
// import api from "../../api/index"

// const HotspotPortal = () => {
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("hotspotClientPhone") || "",
//     clientId: localStorage.getItem("hotspotClientId") || null,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       const [plansResponse, paymentMethodsResponse] = await Promise.all([
//         api.get("/api/internet_plans/public/?access_type=hotspot"),
//         api.get("/api/payments/available-methods/")
//       ]);

//       setPlans(plansResponse.data);
//       setPaymentMethods(paymentMethodsResponse.data.available_methods || []);
//     } catch (err) {
//       setError("Failed to load portal data. Please refresh the page.");
//       console.error("Initial data fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlanSelect = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     // Show success message and potentially redirect
//     console.log(`Payment successful for ${planName}`);
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
    
//     // Show success notification
//     alert(`🎉 Success! Your ${planName} plan has been activated. You can now browse the internet.`);
//   };

//   const handleLoginSuccess = (phoneNumber, clientId) => {
//     setClientData({ phoneNumber, clientId });
//     localStorage.setItem("hotspotClientPhone", phoneNumber);
//     localStorage.setItem("hotspotClientId", clientId);
//   };

//   const getMacAddress = async () => {
//     try {
//       // Try to get MAC from URL parameters (common in hotspot systems)
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) return macFromUrl;

//       // Fallback: Try to get from API
//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading Hotspot Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600">
//       <HotspotNavBar />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HotspotHero onGetStarted={() => document.getElementById('hotspot-plans')?.scrollIntoView({ behavior: 'smooth' })} />
        
//         <HotspotPaymentMethods methods={paymentMethods} />
        
//         <HotspotPlans 
//           plans={plans} 
//           onPlanSelect={handlePlanSelect}
//           clientData={clientData}
//         />

//         {error && (
//           <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
//             <p className="text-red-200">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="mt-2 text-sm text-red-300 hover:text-red-100"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
//       </main>

//       {isAuthOpen && (
//         <HotspotAuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           paymentMethods={paymentMethods}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default HotspotPortal;








// import React, { useState, useEffect } from "react";
// import HotspotNavBar from "../hotspot/HotspotNavBar"
// import HotspotHero from "../hotspot/HotspotHero";
// import HotspotPlans from "../hotspot/HotspotPlans";
// import HotspotAuthModal from "../hotspot/HotspotAuthModal";
// import HotspotPaymentMethods from "../hotspot/HotspotPaymentMethods";
// import api from "../../api/index"

// const HotspotPortal = () => {
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("hotspotClientPhone") || "",
//     clientId: localStorage.getItem("hotspotClientId") || null,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       const [plansResponse, paymentMethodsResponse] = await Promise.all([
//         // ✅ CORRECTED: Using proper internet plans endpoint
//         api.get("/api/internet_plans/public-plans/?access_type=hotspot"),
//         // ✅ CORRECTED: Using proper payment methods endpoint
//         api.get("/api/payments/payment-methods/available/")
//       ]);

//       setPlans(plansResponse.data);
//       setPaymentMethods(paymentMethodsResponse.data || []);
//     } catch (err) {
//       setError("Failed to load portal data. Please refresh the page.");
//       console.error("Initial data fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlanSelect = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     console.log(`Payment successful for ${planName}`);
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
    
//     // Show success notification
//     alert(`🎉 Success! Your ${planName} plan has been activated. You can now browse the internet.`);
//   };

//   const handleLoginSuccess = (phoneNumber, clientId) => {
//     setClientData({ phoneNumber, clientId });
//     localStorage.setItem("hotspotClientPhone", phoneNumber);
//     localStorage.setItem("hotspotClientId", clientId);
//   };

//   const getMacAddress = async () => {
//     try {
//       // Try to get MAC from URL parameters (common in hotspot systems)
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) return macFromUrl;

//       // ✅ CORRECTED: Using proper MAC detection endpoint
//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac_address || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading Hotspot Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600">
//       <HotspotNavBar />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HotspotHero onGetStarted={() => document.getElementById('hotspot-plans')?.scrollIntoView({ behavior: 'smooth' })} />
        
//         <HotspotPaymentMethods methods={paymentMethods} />
        
//         <HotspotPlans 
//           plans={plans} 
//           onPlanSelect={handlePlanSelect}
//           clientData={clientData}
//         />

//         {error && (
//           <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
//             <p className="text-red-200">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="mt-2 text-sm text-red-300 hover:text-red-100"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
//       </main>

//       {isAuthOpen && (
//         <HotspotAuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           paymentMethods={paymentMethods}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default HotspotPortal;














// import React, { useState, useEffect } from "react";
// import HotspotNavBar from "../hotspot/HotspotNavBar"
// import HotspotHero from "../hotspot/HotspotHero";
// import HotspotPlans from "../hotspot/HotspotPlans";
// import HotspotAuthModal from "../hotspot/HotspotAuthModal";
// import HotspotPaymentMethods from "../hotspot/HotspotPaymentMethods";
// import api from "../../api/index"

// const HotspotPortal = () => {
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("hotspotClientPhone") || "",
//     clientId: localStorage.getItem("hotspotClientId") || null,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       const [plansResponse, paymentMethodsResponse] = await Promise.all([
//         // ✅ CORRECTED: Using existing Django endpoint
//         api.get("/api/internet_plans/public/?access_type=hotspot"),
//         // ✅ CORRECTED: Using existing Django endpoint
//         api.get("/api/payments/available-methods/")
//       ]);

//       setPlans(plansResponse.data);
//       setPaymentMethods(paymentMethodsResponse.data || []);
//     } catch (err) {
//       setError("Failed to load portal data. Please refresh the page.");
//       console.error("Initial data fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlanSelect = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     console.log(`Payment successful for ${planName}`);
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
    
//     // Show success notification
//     alert(`🎉 Success! Your ${planName} plan has been activated. You can now browse the internet.`);
//   };

//   const handleLoginSuccess = (phoneNumber, clientId) => {
//     setClientData({ phoneNumber, clientId });
//     localStorage.setItem("hotspotClientPhone", phoneNumber);
//     localStorage.setItem("hotspotClientId", clientId);
//   };

//   const getMacAddress = async () => {
//     try {
//       // Try to get MAC from URL parameters (common in hotspot systems)
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) return macFromUrl;

//       // ✅ CORRECTED: Using proper MAC detection endpoint
//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac_address || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading Hotspot Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600">
//       <HotspotNavBar />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HotspotHero onGetStarted={() => document.getElementById('hotspot-plans')?.scrollIntoView({ behavior: 'smooth' })} />
        
//         <HotspotPaymentMethods methods={paymentMethods} />
        
//         <HotspotPlans 
//           plans={plans} 
//           onPlanSelect={handlePlanSelect}
//           clientData={clientData}
//         />

//         {error && (
//           <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
//             <p className="text-red-200">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="mt-2 text-sm text-red-300 hover:text-red-100"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
//       </main>

//       {isAuthOpen && (
//         <HotspotAuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           paymentMethods={paymentMethods}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default HotspotPortal;










// import React, { useState, useEffect } from "react";
// import HotspotNavBar from "../hotspot/HotspotNavBar"
// import HotspotHero from "../hotspot/HotspotHero";
// import HotspotPlans from "../hotspot/HotspotPlans";
// import HotspotAuthModal from "../hotspot/HotspotAuthModal";
// import HotspotPaymentMethods from "../hotspot/HotspotPaymentMethods";
// import api from "../../api/index"

// const HotspotPortal = () => {
//   const [plans, setPlans] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("hotspotClientPhone") || "",
//     clientId: localStorage.getItem("hotspotClientId") || null,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       const [plansResponse, paymentMethodsResponse] = await Promise.all([
//         // Get all active plans with hotspot enabled
//         api.get("/api/internet_plans/public/"),
//         api.get("/api/payments/available-methods/")
//       ]);

//       // FIXED: Filter plans to only show those with hotspot enabled
//       const hotspotPlans = plansResponse.data.filter(plan => {
//         const accessMethods = plan.access_methods || plan.accessMethods || {};
//         const hotspotConfig = accessMethods.hotspot || {};
//         return hotspotConfig.enabled === true;
//       });

//       setPlans(hotspotPlans);
//       setPaymentMethods(paymentMethodsResponse.data || []);
//     } catch (err) {
//       setError("Failed to load portal data. Please refresh the page.");
//       console.error("Initial data fetch failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePlanSelect = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     console.log(`Payment successful for ${planName}`);
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
    
//     // Show success notification
//     alert(`🎉 Success! Your ${planName} plan has been activated. You can now browse the internet.`);
//   };

//   const handleLoginSuccess = (phoneNumber, clientId) => {
//     setClientData({ phoneNumber, clientId });
//     localStorage.setItem("hotspotClientPhone", phoneNumber);
//     localStorage.setItem("hotspotClientId", clientId);
//   };

//   const getMacAddress = async () => {
//     try {
//       // Try to get MAC from URL parameters (common in hotspot systems)
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) return macFromUrl;

//       // Using proper MAC detection endpoint
//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac_address || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-white text-lg">Loading Hotspot Portal...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600">
//       <HotspotNavBar />
      
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HotspotHero onGetStarted={() => document.getElementById('hotspot-plans')?.scrollIntoView({ behavior: 'smooth' })} />
        
//         <HotspotPaymentMethods methods={paymentMethods} />
        
//         <HotspotPlans 
//           plans={plans} 
//           onPlanSelect={handlePlanSelect}
//           clientData={clientData}
//         />

//         {error && (
//           <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
//             <p className="text-red-200">{error}</p>
//             <button
//               onClick={() => setError("")}
//               className="mt-2 text-sm text-red-300 hover:text-red-100"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
//       </main>

//       {isAuthOpen && (
//         <HotspotAuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           paymentMethods={paymentMethods}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default HotspotPortal;






import React, { useState, useEffect } from "react";
import HotspotNavBar from "../hotspot/HotspotNavBar"
import HotspotHero from "../hotspot/HotspotHero";
import HotspotPlans from "../hotspot/HotspotPlans";
import HotspotAuthModal from "../hotspot/HotspotAuthModal";
import HotspotPaymentMethods from "../hotspot/HotspotPaymentMethods";
import api from "../../api/index"

const HotspotPortal = () => {
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientData, setClientData] = useState({
    phoneNumber: localStorage.getItem("hotspotClientPhone") || "",
    clientId: localStorage.getItem("hotspotClientId") || null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      console.log("Starting to fetch initial data...");
      
      const [plansResponse, paymentMethodsResponse] = await Promise.all([
        // FIXED: Added /api prefix to match Django URL structure
        api.get("/api/internet_plans/public/"),
        api.get("/api/payments/available-methods/")
      ]);

      console.log("Data fetched successfully:", {
        plans: plansResponse.data,
        paymentMethods: paymentMethodsResponse.data
      });

      // Backend now returns only hotspot-enabled plans with proper data
      setPlans(plansResponse.data);
      setPaymentMethods(paymentMethodsResponse.data || []);
      
    } catch (err) {
      console.error("Initial data fetch failed:", err);
      
      let errorMessage = "Failed to load portal data. ";
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage += "Cannot connect to server. Please check if the backend is running on port 8000.";
      } else if (err.response) {
        // Server responded with error status
        errorMessage += `Server error: ${err.response.status} - ${err.response.statusText}`;
        
        // Provide specific guidance for 404 errors
        if (err.response.status === 404) {
          errorMessage += "\n\nAPI endpoint not found. Please check:";
          errorMessage += "\n• Backend URLs are correctly configured";
          errorMessage += "\n• Django server is running properly";
          errorMessage += "\n• API endpoints exist in urls.py";
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage += "No response from server. Please check your network connection.";
      } else {
        // Something else happened
        errorMessage += "Please refresh the page and try again.";
      }
      
      setError(errorMessage);
      
      // Set empty arrays to prevent further errors
      setPlans([]);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setIsAuthOpen(true);
  };

  const handlePaymentSuccess = (planName, isFree = false) => {
    console.log(`Payment successful for ${planName}`);
    setIsAuthOpen(false);
    setSelectedPlan(null);
    
    // Show success notification
    alert(`🎉 Success! Your ${planName} plan has been activated. You can now browse the internet.`);
  };

  const handleLoginSuccess = (phoneNumber, clientId) => {
    setClientData({ phoneNumber, clientId });
    localStorage.setItem("hotspotClientPhone", phoneNumber);
    localStorage.setItem("hotspotClientId", clientId);
  };

  const getMacAddress = async () => {
    try {
      // Try to get MAC from URL parameters (common in hotspot systems)
      const urlParams = new URLSearchParams(window.location.search);
      const macFromUrl = urlParams.get("mac");
      if (macFromUrl) return macFromUrl;

      // Using proper MAC detection endpoint
      const response = await api.get("/api/network_management/get-mac/");
      return response.data.mac_address || "00:00:00:00:00:00";
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return "00:00:00:00:00:00";
    }
  };

  const retryFetchData = () => {
    setLoading(true);
    setError("");
    fetchInitialData();
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await api.get("/api/");
      console.log("Backend connection test:", response.data);
      return true;
    } catch (error) {
      console.error("Backend connection test failed:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Hotspot Portal...</p>
          <p className="text-white text-sm mt-2">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600">
      <HotspotNavBar />
      
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <HotspotHero onGetStarted={() => document.getElementById('hotspot-plans')?.scrollIntoView({ behavior: 'smooth' })} />
        
        {error ? (
          <div className="mt-8 p-6 bg-red-500/20 rounded-lg text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-200 mb-2">Connection Error</h3>
            <p className="text-red-200 mb-4 whitespace-pre-line">{error}</p>
            <div className="space-y-3">
              <button
                onClick={retryFetchData}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <div className="text-sm text-red-300">
                <p className="font-semibold">Troubleshooting steps:</p>
                <ul className="list-disc list-inside text-left mt-2 space-y-1">
                  <li>Ensure Django server is running: <code className="bg-red-900 px-1 rounded">python manage.py runserver</code></li>
                  <li>Check if API is accessible: <a href="http://localhost:8000/api/internet_plans/public/" target="_blank" rel="noopener noreferrer" className="underline">Test this link</a></li>
                  <li>Verify your API base URL in api/index.js</li>
                  <li>Check browser console for detailed errors</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <HotspotPaymentMethods methods={paymentMethods} />
            
            <HotspotPlans 
              plans={plans} 
              onPlanSelect={handlePlanSelect}
              clientData={clientData}
            />
          </>
        )}
      </main>

      {isAuthOpen && (
        <HotspotAuthModal
          onClose={() => {
            setIsAuthOpen(false);
            setSelectedPlan(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          selectedPlan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
          existingClientData={clientData}
          paymentMethods={paymentMethods}
          getMacAddress={getMacAddress}
        />
      )}
    </div>
  );
};

export default HotspotPortal;