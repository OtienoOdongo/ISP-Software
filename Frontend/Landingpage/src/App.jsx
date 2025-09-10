





// // Updated App.jsx

// import React, { useState, useEffect } from "react";
// import NavBar from "./components/NavBar";
// import HeroSection from "./components/HeroSection";
// import Offers from "./components/Offers";
// import Features from "./components/Features";
// import Footer from "./components/Footer";
// import AuthModal from "./components/AuthModal";
// import api from "./api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [forcePlanSelection, setForcePlanSelection] = useState(false);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     fullName: localStorage.getItem("fullName") || "",
//     clientId: localStorage.getItem("clientId") || null,
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         toast.error("Failed to load plans. Please try again.");
//       }
//     };
//     fetchPlans();

//     const storedPhone = localStorage.getItem("phoneNumber");
//     if (storedPhone && localStorage.getItem("isLoggedIn") === "true") {
//       fetchClientData(storedPhone);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "", clientId: null });
//       localStorage.clear();
//     }
//   }, []);

//   const fetchClientData = async (phone) => {
//     try {
//       const response = await api.get(`/api/account/clients/?phonenumber=${phone}`);
//       if (response.data.length > 0) {
//         const client = response.data[0];
//         const displayPhone = client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber;
//         setClientData({
//           phoneNumber: displayPhone,
//           fullName: client.full_name,
//           clientId: client.id,
//         });
//         setIsLoggedIn(true);
//         localStorage.setItem("phoneNumber", displayPhone);
//         localStorage.setItem("fullName", client.full_name);
//         localStorage.setItem("clientId", client.id);
//         localStorage.setItem("isLoggedIn", "true");
//       } else {
//         throw new Error("No client found");
//       }
//     } catch (err) {
//       console.error("Error fetching client:", err);
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
//       localStorage.clear();
//     }
//   };

//   const handleBuyClick = (plan) => {
//     if (plan.category === "promotional" && plan.price === 0) {
//       handleFreePlanActivation(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthOpen(true);
//       setForcePlanSelection(false); // Plan is pre-selected
//     }
//   };

//   const handleFreePlanActivation = async (plan) => {
//     if (!isLoggedIn) {
//       setSelectedPlan(plan);
//       setIsAuthOpen(true);
//       setForcePlanSelection(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const macAddress = await getMacAddress();
//       await api.post("/api/network_management/routers/1/hotspot-users/", {
//         client_id: clientData.clientId,
//         plan_id: plan.id,
//         transaction_id: null, // No payment for free plans
//         mac: macAddress,
//       });
//       handlePaymentSuccess(plan.name, true);
//     } catch (err) {
//       toast.error("Failed to activate free plan. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGetStarted = () => {
//     setSelectedPlan(null);
//     setForcePlanSelection(true);
//     document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" }); // Show plans directly
//   };

//   const getMacAddress = async () => {
//     try {
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) {
//         return macFromUrl; // MikroTik Hotspot provides MAC via URL
//       }

//       // Fallback to server-side ARP lookup via API
//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00"; // Default fallback
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
//     setPaymentStatus({ message, success: true });
//     toast.success(message);
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//     setForcePlanSelection(false);
//   };

//   const handleLoginSuccess = (phoneNumber, fullName, clientId) => {
//     const displayPhone = phoneNumber.startsWith("+254") ? `0${phoneNumber.slice(4)}` : phoneNumber;
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: displayPhone, fullName, clientId });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", displayPhone);
//     localStorage.setItem("fullName", fullName);
//     localStorage.setItem("clientId", clientId);
//     toast.success(`Welcome, ${fullName}!`);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
//     localStorage.clear();
//     toast.info("Logged out successfully.");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar 
//         isLoggedIn={isLoggedIn} 
//         setIsLoggedIn={setIsLoggedIn} 
//         fullName={clientData.fullName} 
//         onLogout={handleLogout} 
//       />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection 
//           onGetStarted={handleGetStarted} 
//           fullName={clientData.fullName} 
//         />
//         <Offers 
//           onBuyClick={handleBuyClick} 
//           isLoggedIn={isLoggedIn} 
//           plans={plans} 
//         />
//         {paymentStatus && (
//           <div
//             className={`mt-6 p-4 rounded-lg text-center ${
//               paymentStatus.success ? "bg-green-500/20" : "bg-red-500/20"
//             }`}
//           >
//             <p className="text-lg">{paymentStatus.message}</p>
//             <button
//               onClick={() => setPaymentStatus(null)}
//               className="mt-2 text-sm underline hover:text-pink-300"
//             >
//               Close
//             </button>
//           </div>
//         )}
//         <Features />
//       </main>
//       <Footer />
//       {isAuthOpen && (
//         <AuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//             setForcePlanSelection(false);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           forcePlanSelection={forcePlanSelection}
//           getMacAddress={getMacAddress}
//         />
//       )}
//       <ToastContainer />
//     </div>
//   );
// };

// export default App;





// // App.jsx

// import React, { useState, useEffect } from "react";
// import NavBar from "./components/NavBar";
// import HeroSection from "./components/HeroSection";
// import Offers from "./components/Offers";
// import Features from "./components/Features";
// import Footer from "./components/Footer";
// import AuthModal from "./components/AuthModal";
// import api from "./api";
// import { Alert } from "@mui/material";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [forcePlanSelection, setForcePlanSelection] = useState(false);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     fullName: localStorage.getItem("fullName") || "",
//     clientId: localStorage.getItem("clientId") || null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         setError("Failed to load plans. Please try again.");
//       }
//     };
//     fetchPlans();

//     const storedPhone = localStorage.getItem("phoneNumber");
//     if (storedPhone && localStorage.getItem("isLoggedIn") === "true") {
//       fetchClientData(storedPhone);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "", clientId: null });
//       localStorage.clear();
//     }
//   }, []);

//   const fetchClientData = async (phone) => {
//     try {
//       const response = await api.get(`/api/account/clients/?phonenumber=${phone}`);
//       if (response.data.length > 0) {
//         const client = response.data[0];
//         const displayPhone = client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber;
//         setClientData({
//           phoneNumber: displayPhone,
//           fullName: client.full_name,
//           clientId: client.id,
//         });
//         setIsLoggedIn(true);
//         localStorage.setItem("phoneNumber", displayPhone);
//         localStorage.setItem("fullName", client.full_name);
//         localStorage.setItem("clientId", client.id);
//         localStorage.setItem("isLoggedIn", "true");
//       } else {
//         throw new Error("No client found");
//       }
//     } catch (err) {
//       console.error("Error fetching client:", err);
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
//       localStorage.clear();
//       setError("Failed to fetch client data.");
//     }
//   };

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//     setForcePlanSelection(false); // Plan is pre-selected
//   };

//   const handleGetStarted = () => {
//     setSelectedPlan(null);
//     setForcePlanSelection(true);
//     document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" }); // Show plans directly
//   };

//   const getMacAddress = async () => {
//     try {
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) {
//         return macFromUrl; // MikroTik Hotspot provides MAC via URL
//       }

//       // Fallback to server-side ARP lookup via API
//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00"; // Default fallback
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
//     setPaymentStatus({ message, success: true });
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//     setForcePlanSelection(false);
//   };

//   const handleLoginSuccess = (phoneNumber, fullName, clientId) => {
//     const displayPhone = phoneNumber.startsWith("+254") ? `0${phoneNumber.slice(4)}` : phoneNumber;
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: displayPhone, fullName, clientId });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", displayPhone);
//     localStorage.setItem("fullName", fullName);
//     localStorage.setItem("clientId", clientId);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
//     localStorage.clear();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar 
//         isLoggedIn={isLoggedIn} 
//         setIsLoggedIn={setIsLoggedIn} 
//         fullName={clientData.fullName} 
//         onLogout={handleLogout} 
//       />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection 
//           onGetStarted={handleGetStarted} 
//           fullName={clientData.fullName} 
//         />
//         <Offers 
//           onBuyClick={handleBuyClick} 
//           isLoggedIn={isLoggedIn} 
//           plans={plans} 
//         />
//         {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
//         {paymentStatus && (
//           <div
//             className={`mt-6 p-4 rounded-lg text-center ${
//               paymentStatus.success ? "bg-green-500/20" : "bg-red-500/20"
//             }`}
//           >
//             <p className="text-lg">{paymentStatus.message}</p>
//             <button
//               onClick={() => setPaymentStatus(null)}
//               className="mt-2 text-sm underline hover:text-pink-300"
//             >
//               Close
//             </button>
//           </div>
//         )}
//         <Features />
//       </main>
//       <Footer />
//       {isAuthOpen && (
//         <AuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//             setForcePlanSelection(false);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           forcePlanSelection={forcePlanSelection}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default App;








// import React, { useState, useEffect } from "react";
// import NavBar from "./components/NavBar";
// import HeroSection from "./components/HeroSection";
// import Offers from "./components/Offers";
// import Features from "./components/Features";
// import Footer from "./components/Footer";
// import AuthModal from "./components/AuthModal";
// import api from "./api";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [forcePlanSelection, setForcePlanSelection] = useState(false);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     clientId: localStorage.getItem("clientId") || null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         setError("Failed to load plans. Please try again.");
//       }
//     };
//     fetchPlans();

//     const storedPhone = localStorage.getItem("phoneNumber");
//     if (storedPhone && localStorage.getItem("isLoggedIn") === "true") {
//       fetchClientData(storedPhone);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", clientId: null });
//       localStorage.clear();
//     }
//   }, []);

//   const fetchClientData = async (phone) => {
//     try {
//       const response = await api.get(`/api/account/clients/?phonenumber=${phone}`);
//       if (response.data.length > 0) {
//         const client = response.data[0];
//         const displayPhone = client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber;
//         setClientData({
//           phoneNumber: displayPhone,
//           clientId: client.id,
//         });
//         setIsLoggedIn(true);
//         localStorage.setItem("phoneNumber", displayPhone);
//         localStorage.setItem("clientId", client.id);
//         localStorage.setItem("isLoggedIn", "true");
//       } else {
//         throw new Error("No client found");
//       }
//     } catch (err) {
//       console.error("Error fetching client:", err);
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", clientId: null });
//       localStorage.clear();
//       setError("Failed to fetch client data.");
//     }
//   };

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//     setForcePlanSelection(false);
//   };

//   const handleGetStarted = () => {
//     setSelectedPlan(null);
//     setForcePlanSelection(true);
//     document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
//   };

//   const getMacAddress = async () => {
//     try {
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) {
//         return macFromUrl;
//       }

//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00";
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
//     setPaymentStatus({ message, success: true });
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//     setForcePlanSelection(false);
//   };

//   const handleLoginSuccess = (phoneNumber, clientId) => {
//     const displayPhone = phoneNumber.startsWith("+254") ? `0${phoneNumber.slice(4)}` : phoneNumber;
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: displayPhone, clientId });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", displayPhone);
//     localStorage.setItem("clientId", clientId);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", clientId: null });
//     localStorage.clear();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar 
//         isLoggedIn={isLoggedIn} 
//         setIsLoggedIn={setIsLoggedIn} 
//         onLogout={handleLogout} 
//       />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={handleGetStarted} />
//         <Offers 
//           onBuyClick={handleBuyClick} 
//           isLoggedIn={isLoggedIn} 
//           plans={plans} 
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
//         {paymentStatus && (
//           <div className={`mt-4 p-4 rounded-lg text-center ${
//             paymentStatus.success ? "bg-green-500/20" : "bg-red-500/20"
//           }`}>
//             <p className="text-lg text-white">{paymentStatus.message}</p>
//             <button
//               onClick={() => setPaymentStatus(null)}
//               className="mt-2 text-sm text-gray-300 hover:text-white"
//             >
//               Close
//             </button>
//           </div>
//         )}
//         <Features />
//       </main>
//       <Footer />
//       {isAuthOpen && (
//         <AuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//             setForcePlanSelection(false);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           forcePlanSelection={forcePlanSelection}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default App;






// import React, { useState, useEffect } from "react";
// import NavBar from "./components/NavBar";
// import HeroSection from "./components/HeroSection";
// import Offers from "./components/Offers";
// import Features from "./components/Features";
// import Footer from "./components/Footer";
// import AuthModal from "./components/AuthModal";
// import api from "./api";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [forcePlanSelection, setForcePlanSelection] = useState(false);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     clientId: localStorage.getItem("clientId") || null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

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
//       throw new Error("Invalid phone number format.");
//     }
    
//     return formatted;
//   };

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         setError("Failed to load plans. Please try again.");
//       }
//     };
//     fetchPlans();

//     const storedPhone = localStorage.getItem("phoneNumber");
//     if (storedPhone && localStorage.getItem("isLoggedIn") === "true") {
//       fetchClientData(storedPhone);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", clientId: null });
//       localStorage.removeItem("phoneNumber");
//       localStorage.removeItem("clientId");
//       localStorage.removeItem("isLoggedIn");
//     }
//   }, []);

//   const fetchClientData = async (phone) => {
//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phone);
//       const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//       if (response.data.length > 0) {
//         const client = response.data[0];
//         const displayPhone = client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber;
//         setClientData({
//           phoneNumber: displayPhone,
//           clientId: client.id,
//         });
//         setIsLoggedIn(true);
//         localStorage.setItem("phoneNumber", displayPhone);
//         localStorage.setItem("clientId", client.id);
//         localStorage.setItem("isLoggedIn", "true");
//       } else {
//         throw new Error("No client found");
//       }
//     } catch (err) {
//       console.error("Error fetching client:", err);
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", clientId: null });
//       localStorage.removeItem("phoneNumber");
//       localStorage.removeItem("clientId");
//       localStorage.removeItem("isLoggedIn");
//       setError("Failed to fetch client data.");
//     }
//   };

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//     setForcePlanSelection(false);
//   };

//   const handleGetStarted = () => {
//     setSelectedPlan(null);
//     setForcePlanSelection(true);
//     document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
//   };

//   const getMacAddress = async () => {
//     try {
//       const urlParams = new URLSearchParams(window.location.search);
//       const macFromUrl = urlParams.get("mac");
//       if (macFromUrl) {
//         return macFromUrl;
//       }

//       const response = await api.get("/api/network_management/get-mac/");
//       return response.data.mac || "00:00:00:00:00:00";
//     } catch (error) {
//       console.error("Error fetching MAC address:", error);
//       return "00:00:00:00:00:00";
//     }
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
//     setPaymentStatus({ message, success: true });
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//     setForcePlanSelection(false);
//   };

//   const handleLoginSuccess = (phoneNumber, clientId) => {
//     const displayPhone = phoneNumber.startsWith("+254") ? `0${phoneNumber.slice(4)}` : phoneNumber;
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: displayPhone, clientId });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", displayPhone);
//     localStorage.setItem("clientId", clientId);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", clientId: null });
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("phoneNumber");
//     localStorage.removeItem("clientId");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar 
//         isLoggedIn={isLoggedIn} 
//         onLogout={handleLogout} 
//       />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={handleGetStarted} />
//         <Offers 
//           onBuyClick={handleBuyClick} 
//           isLoggedIn={isLoggedIn} 
//           plans={plans} 
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
//         {paymentStatus && (
//           <div className={`mt-4 p-4 rounded-lg text-center ${
//             paymentStatus.success ? "bg-green-500/20" : "bg-red-500/20"
//           }`}>
//             <p className="text-lg text-white">{paymentStatus.message}</p>
//             <button
//               onClick={() => setPaymentStatus(null)}
//               className="mt-2 text-sm text-gray-300 hover:text-white"
//             >
//               Close
//             </button>
//           </div>
//         )}
//         <Features />
//       </main>
//       <Footer />
//       {isAuthOpen && (
//         <AuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//             setForcePlanSelection(false);
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//           getMacAddress={getMacAddress}
//         />
//       )}
//     </div>
//   );
// };

// export default App;





import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import Offers from "./components/Offers";
import Features from "./components/Features";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import api from "./api";

const App = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [forcePlanSelection, setForcePlanSelection] = useState(false);
  const [clientData, setClientData] = useState({
    phoneNumber: localStorage.getItem("clientPhoneNumber") || "",
    clientId: localStorage.getItem("clientId") || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

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
      throw new Error("Invalid phone number format.");
    }
    
    return formatted;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/internet_plans/public/");
        setPlans(response.data);
      } catch (err) {
        setError("Failed to load plans. Please try again.");
      }
    };
    fetchPlans();

    const storedPhone = localStorage.getItem("clientPhoneNumber");
    if (storedPhone && localStorage.getItem("isLoggedIn") === "true") {
      fetchClientData(storedPhone);
    } else {
      setIsLoggedIn(false);
      setClientData({ phoneNumber: "", clientId: null });
      localStorage.removeItem("clientPhoneNumber");
      localStorage.removeItem("clientId");
      localStorage.removeItem("isLoggedIn");
    }
  }, []);

  const fetchClientData = async (phone) => {
    try {
      const formattedPhone = validateAndFormatPhoneNumber(phone);
      const response = await api.get("/api/account/clients/", {
        params: { phonenumber: formattedPhone }
      });
      if (response.data.length > 0) {
        const client = response.data[0];
        const displayPhone = client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber;
        setClientData({
          phoneNumber: displayPhone,
          clientId: client.id,
        });
        setIsLoggedIn(true);
        localStorage.setItem("clientPhoneNumber", displayPhone);
        localStorage.setItem("clientId", client.id);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        throw new Error("No client found");
      }
    } catch (err) {
      console.error("Error fetching client:", err);
      setIsLoggedIn(false);
      setClientData({ phoneNumber: "", clientId: null });
      localStorage.removeItem("clientPhoneNumber");
      localStorage.removeItem("clientId");
      localStorage.removeItem("isLoggedIn");
      setError("Failed to fetch client data.");
    }
  };

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setIsAuthOpen(true);
    setForcePlanSelection(false);
  };

  const handleGetStarted = () => {
    setSelectedPlan(null);
    setForcePlanSelection(true);
    document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
  };

  const getMacAddress = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const macFromUrl = urlParams.get("mac");
      if (macFromUrl) {
        return macFromUrl;
      }

      const response = await api.get("/api/network_management/get-mac/");
      return response.data.mac || "00:00:00:00:00:00";
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return "00:00:00:00:00:00";
    }
  };

  const handlePaymentSuccess = (planName, isFree = false) => {
    const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
    setPaymentStatus({ message, success: true });
    setIsAuthOpen(false);
    setSelectedPlan(null);
    setForcePlanSelection(false);
  };

  const handleLoginSuccess = (phoneNumber, clientId) => {
    const displayPhone = phoneNumber.startsWith("+254") ? `0${phoneNumber.slice(4)}` : phoneNumber;
    setIsLoggedIn(true);
    setClientData({ phoneNumber: displayPhone, clientId });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("clientPhoneNumber", displayPhone);
    localStorage.setItem("clientId", clientId);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setClientData({ phoneNumber: "", clientId: null });
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("clientPhoneNumber");
    localStorage.removeItem("clientId");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
      <NavBar 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout} 
      />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <HeroSection onGetStarted={handleGetStarted} />
        <Offers 
          onBuyClick={handleBuyClick} 
          isLoggedIn={isLoggedIn} 
          plans={plans} 
        />
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-center">
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => setError("")}
              className="mt-2 text-sm text-red-300 hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        )}
        {paymentStatus && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            paymentStatus.success ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            <p className="text-lg text-white">{paymentStatus.message}</p>
            <button
              onClick={() => setPaymentStatus(null)}
              className="mt-2 text-sm text-gray-300 hover:text-white"
            >
              Close
            </button>
          </div>
        )}
        <Features />
      </main>
      <Footer />
      {isAuthOpen && (
        <AuthModal
          onClose={() => {
            setIsAuthOpen(false);
            setSelectedPlan(null);
            setForcePlanSelection(false);
          }}
          onLoginSuccess={handleLoginSuccess}
          selectedPlan={selectedPlan}
          onPaymentSuccess={handlePaymentSuccess}
          existingClientData={clientData}
          getMacAddress={getMacAddress}
        />
      )}
    </div>
  );
};

export default App;