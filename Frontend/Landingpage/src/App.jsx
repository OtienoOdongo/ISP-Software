// import React from 'react'
// import NavBar from './components/NavBar'; 
// import HeroSection from './components/HeroSection';
// import Prices from './components/Prices';
// import Footer from './components/Footer';

// const App = () => {
//   return (
//     <div>
//      <NavBar />
//      <div className="mx-auto pt-20 px-6 max-w-7xl">
//       <HeroSection />
//       <Prices />
//       <Footer />
//      </div>
//     </div>
//   )
// }

// export default App



// import React from 'react';
// import NavBar from './components/NavBar';
// import HeroSection from './components/HeroSection';
// import Offers from './components/Offers';
// import Features from './components/Features';
// import Footer from './components/Footer';

// const App = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection />
//         <Offers />
//         <Features />
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default App;






// import React, { useState } from 'react';
// import NavBar from './components/NavBar';
// import HeroSection from './components/HeroSection';
// import Offers from './components/Offers';
// import Features from './components/Features';
// import Footer from './components/Footer';
// import AuthModal from './components/AuthModal';

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null); // Track the plan to buy
//   const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

//   const handleBuyClick = (plan) => {
//     if (!isLoggedIn) {
//       setSelectedPlan(plan);
//       setIsAuthOpen(true);
//     } else {
//       initiatePayment(plan);
//     }
//   };

//   const initiatePayment = async (plan) => {
//     try {
//       const response = await fetch('/payment/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'X-CSRFToken': getCookie('csrftoken'),
//         },
//         body: new URLSearchParams({
//           phone_number: localStorage.getItem('phoneNumber'), // Assume stored after login
//           amount: plan.price.replace('KES ', ''),
//         }).toString(),
//       });
//       const text = await response.text();
//       const data = JSON.parse(text.match(/{.*}/)?.[0] || '{}');
//       if (data.checkout_request_id) {
//         alert('Payment request sent! Check your phone.');
//         // Add polling logic here if needed, as in your MpesaPayment component
//       } else {
//         alert('Payment failed. Try again.');
//       }
//     } catch (err) {
//       alert('Error initiating payment. Check your connection.');
//     }
//   };

//   const getCookie = (name) => {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim();
//         if (cookie.substring(0, name.length + 1) === (name + '=')) {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//     return cookieValue;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} />
//         <Features />
//       </main>
//       <Footer />
//       {isAuthOpen && (
//         <AuthModal
//           onClose={() => {
//             setIsAuthOpen(false);
//             setSelectedPlan(null);
//           }}
//           onLoginSuccess={() => {
//             setIsLoggedIn(true);
//             if (selectedPlan) initiatePayment(selectedPlan);
//             setIsAuthOpen(false);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default App;




// import React, { useState } from 'react';
// import NavBar from './components/NavBar';
// import HeroSection from './components/HeroSection';
// import Offers from './components/Offers';
// import Features from './components/Features';
// import Footer from './components/Footer';
// import AuthModal from './components/AuthModal';

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null); // Track the selected plan
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true'); // Persist login state
//   const [paymentStatus, setPaymentStatus] = useState(null); // Track payment status

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     if (!isLoggedIn) {
//       setIsAuthOpen(true);
//     } else {
//       initiatePayment(plan);
//     }
//   };

//   const initiatePayment = async (plan) => {
//     try {
//       const response = await fetch('/payment/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'X-CSRFToken': getCookie('csrftoken'),
//         },
//         body: new URLSearchParams({
//           phone_number: localStorage.getItem('phoneNumber'),
//           amount: plan.price.replace('KES ', ''),
//         }).toString(),
//       });
//       const text = await response.text();
//       const data = JSON.parse(text.match(/{.*}/)?.[0] || '{}');
//       if (data.checkout_request_id) {
//         setPaymentStatus({
//           message: `Payment request sent for ${plan.data} (${plan.price})! Check your phone to complete it.`,
//           success: true,
//         });
//         setSelectedPlan(null); // Clear after initiation
//       } else {
//         setPaymentStatus({
//           message: 'Payment failed. Please try again.',
//           success: false,
//         });
//       }
//     } catch (err) {
//       setPaymentStatus({
//         message: 'Error initiating payment. Check your connection.',
//         success: false,
//       });
//     }
//   };

//   const getCookie = (name) => {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim();
//         if (cookie.substring(0, name.length + 1) === (name + '=')) {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//     return cookieValue;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} />
//         {paymentStatus && (
//           <div className={`mt-6 p-4 rounded-lg text-center ${paymentStatus.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
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
//           }}
//           onLoginSuccess={() => {
//             setIsLoggedIn(true);
//             localStorage.setItem('isLoggedIn', 'true');
//             if (selectedPlan) initiatePayment(selectedPlan);
//             setIsAuthOpen(false);
//           }}
//           selectedPlan={selectedPlan}
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber") || "");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         toast.error("Failed to load plans: " + (err.response?.data?.error || err.message));
//       }
//     };
//     fetchPlans();
//   }, []);

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     if (!isLoggedIn) {
//       setIsAuthOpen(true);
//     } else {
//       initiatePayment(plan);
//     }
//   };

//   const initiatePayment = async (plan) => {
//     try {
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: phoneNumber,
//         amount: plan.price,
//         plan_id: plan.id,
//       });
//       const checkoutRequestId = response.data.checkout_request_id;
//       setPaymentStatus({ message: "Payment request sent! Check your phone.", success: true });
//       toast.info("Payment initiated. Please check your phone for the STK Push.");

//       const interval = setInterval(async () => {
//         const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
//         const status = statusResponse.data.status;

//         if (status.ResultCode === 0) {
//           setPaymentStatus({ message: `Payment successful for ${plan.name}!`, success: true });
//           toast.success("Payment successful!");
//           clearInterval(interval);
//           setSelectedPlan(null);
//         } else if (status.ResultCode !== undefined && status.ResultCode !== 0) {
//           setPaymentStatus({ message: `Payment failed: ${status.ResultDesc}`, success: false });
//           toast.error("Payment failed.");
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       setPaymentStatus({
//         message: "Error initiating payment: " + (err.response?.data?.error || err.message),
//         success: false,
//       });
//       toast.error("Payment initiation failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={(phone) => {
//             setIsLoggedIn(true);
//             setPhoneNumber(phone);
//             localStorage.setItem("isLoggedIn", "true");
//             localStorage.setItem("phoneNumber", phone);
//             if (selectedPlan) initiatePayment(selectedPlan);
//             setIsAuthOpen(false);
//           }}
//           selectedPlan={selectedPlan}
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber") || "");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         toast.error("Failed to load plans: " + (err.response?.data?.error || err.message));
//       }
//     };
//     fetchPlans();
//   }, []);

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     if (!isLoggedIn) {
//       setIsAuthOpen(true);
//     } else {
//       initiatePayment(plan);
//     }
//   };

//   const formatPhoneNumberForBackend = (phone) => {
//     if (phone.startsWith("07") && phone.length === 10) {
//       return `+254${phone.slice(2)}`;
//     }
//     return phone; // If already in +254 format, use as-is
//   };

//   const initiatePayment = async (plan) => {
//     const formattedPhone = formatPhoneNumberForBackend(phoneNumber);
//     try {
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhone,
//         amount: plan.price,
//         plan_id: plan.id,
//       });
//       const checkoutRequestId = response.data.checkout_request_id;
//       setPaymentStatus({ message: "Payment request sent! Check your phone.", success: true });
//       toast.info("Payment initiated. Please check your phone for the STK Push.");

//       const interval = setInterval(async () => {
//         const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
//         const status = statusResponse.data.status;

//         if (status.ResultCode === 0) {
//           setPaymentStatus({ message: `Payment successful for ${plan.name}!`, success: true });
//           toast.success("Payment successful!");
//           clearInterval(interval);
//           setSelectedPlan(null);
//         } else if (status.ResultCode !== undefined && status.ResultCode !== 0) {
//           setPaymentStatus({ message: `Payment failed: ${status.ResultDesc}`, success: false });
//           toast.error("Payment failed.");
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       setPaymentStatus({
//         message: "Error initiating payment: " + (err.response?.data?.error || err.message),
//         success: false,
//       });
//       toast.error("Payment initiation failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={(phone) => {
//             setIsLoggedIn(true);
//             setPhoneNumber(phone); // Store as 07XXXXXXXX
//             localStorage.setItem("isLoggedIn", "true");
//             localStorage.setItem("phoneNumber", phone);
//             if (selectedPlan) initiatePayment(selectedPlan);
//             setIsAuthOpen(false);
//           }}
//           selectedPlan={selectedPlan}
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber") || "");

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         toast.error("Failed to load plans: " + (err.response?.data?.error || err.message));
//       }
//     };
//     fetchPlans();
//   }, []);

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     if (!isLoggedIn) {
//       setIsAuthOpen(true);
//     } else {
//       initiatePayment(plan);
//     }
//   };

//   const formatPhoneNumberForBackend = (phone) => {
//     if (phone.startsWith("07") && phone.length === 10) {
//       return `+254${phone.slice(2)}`;
//     }
//     return phone; // If already in +254 format, use as-is
//   };

//   const initiatePayment = async (plan) => {
//     const formattedPhone = formatPhoneNumberForBackend(phoneNumber);
//     try {
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhone,
//         amount: plan.price,
//         plan_id: plan.id,
//       });
//       const checkoutRequestId = response.data.checkout_request_id;
//       setPaymentStatus({ message: "Payment request sent! Check your phone.", success: true });
//       toast.info("Payment initiated. Please check your phone for the STK Push.");

//       const interval = setInterval(async () => {
//         try {
//           const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
//           const status = statusResponse.data.status;

//           if (status.ResultCode === "0") { // Success
//             setPaymentStatus({ message: `Payment successful for ${plan.name}!`, success: true });
//             toast.success("Payment successful!");
//             clearInterval(interval);
//             setSelectedPlan(null);
//           } else if (status.ResultCode && status.ResultCode !== "0") { // Failure
//             setPaymentStatus({ message: `Payment failed: ${status.ResultDesc || "Unknown error"}`, success: false });
//             toast.error("Payment failed.");
//             clearInterval(interval);
//           }
//         } catch (err) {
//           toast.error("Error checking payment status: " + (err.response?.data?.error || err.message));
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       setPaymentStatus({
//         message: "Error initiating payment: " + (err.response?.data?.error || err.message),
//         success: false,
//       });
//       toast.error("Payment initiation failed.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={(phone) => {
//             setIsLoggedIn(true);
//             setPhoneNumber(phone);
//             localStorage.setItem("isLoggedIn", "true");
//             localStorage.setItem("phoneNumber", phone);
//             if (selectedPlan) initiatePayment(selectedPlan);
//             setIsAuthOpen(false);
//           }}
//           selectedPlan={selectedPlan}
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     fullName: localStorage.getItem("fullName") || "",
//   });

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         toast.error("Failed to load plans: " + (err.response?.data?.error || err.message));
//       }
//     };
//     fetchPlans();
//   }, []);

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     if (!isLoggedIn) {
//       setIsAuthOpen(true);
//     } else {
//       initiatePayment(plan);
//     }
//   };

//   const formatPhoneNumberForBackend = (phone) => {
//     if (phone.startsWith("07") && phone.length === 10) {
//       return `+254${phone.slice(2)}`;
//     } else if (phone.startsWith("01") && phone.length === 10) {
//       return `+254${phone.slice(1)}`;
//     }
//     return phone; // Assume already in +254 format
//   };

//   const initiatePayment = async (plan) => {
//     const formattedPhone = formatPhoneNumberForBackend(clientData.phoneNumber);
//     try {
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: formattedPhone,
//         amount: plan.price,
//         plan_id: plan.id,
//       });
//       const checkoutRequestId = response.data.checkout_request_id;
//       setPaymentStatus({ message: "Payment request sent! Check your phone.", success: true });
//       toast.info("Payment initiated. Please check your phone for the STK Push.");

//       const interval = setInterval(async () => {
//         try {
//           const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
//           const status = statusResponse.data.status;

//           if (status.ResultCode === "0") { // Success
//             setPaymentStatus({ message: `Payment successful for ${plan.name}!`, success: true });
//             toast.success("Payment successful!");
//             clearInterval(interval);
//             setSelectedPlan(null);
//           } else if (status.ResultCode && status.ResultCode !== "0") { // Failure
//             setPaymentStatus({ message: `Payment failed: ${status.ResultDesc || "Unknown error"}`, success: false });
//             toast.error("Payment failed.");
//             clearInterval(interval);
//           }
//         } catch (err) {
//           toast.error("Error checking payment status: " + (err.response?.data?.error || err.message));
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       setPaymentStatus({
//         message: "Error initiating payment: " + (err.response?.data?.error || err.message),
//         success: false,
//       });
//       toast.error("Payment initiation failed.");
//     }
//   };

//   const handleLoginSuccess = (phone, fullName) => {
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: phone, fullName });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", phone);
//     localStorage.setItem("fullName", fullName);
//     if (selectedPlan) initiatePayment(selectedPlan);
//     setIsAuthOpen(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={handleLoginSuccess} // Updated to pass fullName too
//           selectedPlan={selectedPlan}
//         />
//       )}
//       <ToastContainer />
//     </div>
//   );
// };

// export default App;







// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "./components/NavBar";
// import HeroSection from "./components/HeroSection";
// import Offers from "./components/Offers";
// import Features from "./components/Features";
// import Footer from "./components/Footer";
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [plans, setPlans] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         toast.error("Failed to load plans. Please refresh.");
//       }
//     };
//     fetchPlans();
//   }, []);

//   const handleBuyClick = (plan) => {
//     navigate(`/pay?amount=${plan.price}&planId=${plan.id}`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => navigate("/pay")} />
//         <Offers onBuyClick={handleBuyClick} plans={plans} />
//         <Features />
//       </main>
//       <Footer />
//       <ToastContainer position="top-right" autoClose={3000} />
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     fullName: localStorage.getItem("fullName") || "",
//   });

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
//   }, []);

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const formatPhoneNumberForBackend = (phone) => {
//     if (phone.startsWith("07") && phone.length === 10) {
//       return `+254${phone.slice(2)}`;
//     } else if (phone.startsWith("01") && phone.length === 10) {
//       return `+254${phone.slice(1)}`;
//     }
//     return phone; // Assume already in +254 format
//   };

//   const handlePaymentSuccess = (planName) => {
//     setPaymentStatus({ message: `Payment successful for ${planName}!`, success: true });
//     toast.success("Payment successful! Your plan is active.");
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//   };

//   const handleLoginSuccess = (phone, fullName) => {
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: phone, fullName });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", phone);
//     localStorage.setItem("fullName", fullName);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} fullName={clientData.fullName} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     fullName: localStorage.getItem("fullName") || "",
//   });

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

//     // Check session persistence on load
//     if (localStorage.getItem("isLoggedIn") === "true" && clientData.fullName) {
//       setIsLoggedIn(true);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "" });
//       localStorage.removeItem("isLoggedIn");
//       localStorage.removeItem("phoneNumber");
//       localStorage.removeItem("fullName");
//       localStorage.removeItem("amount");
//     }
//   }, []);

//   const handleBuyClick = (plan) => {
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const handlePaymentSuccess = (planName) => {
//     setPaymentStatus({ message: `Payment successful for ${planName}!`, success: true });
//     toast.success("Payment successful! Your plan is active.");
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//   };

//   const handleLoginSuccess = (phone, fullName) => {
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: phone, fullName });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", phone);
//     localStorage.setItem("fullName", fullName);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", fullName: "" });
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("phoneNumber");
//     localStorage.removeItem("fullName");
//     localStorage.removeItem("amount");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} fullName={clientData.fullName} onLogout={handleLogout} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={() => setIsAuthOpen(true)} fullName={clientData.fullName} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const App = () => {
//   const [isAuthOpen, setIsAuthOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [plans, setPlans] = useState([]);
//   const [clientData, setClientData] = useState({
//     phoneNumber: localStorage.getItem("phoneNumber") || "",
//     fullName: localStorage.getItem("fullName") || "",
//   });

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

//     if (localStorage.getItem("isLoggedIn") === "true" && clientData.fullName) {
//       setIsLoggedIn(true);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "" });
//       localStorage.removeItem("isLoggedIn");
//       localStorage.removeItem("phoneNumber");
//       localStorage.removeItem("fullName");
//       localStorage.removeItem("amount");
//     }
//   }, []);

//   const handleBuyClick = (plan) => {
//     console.log("Selected Plan in App:", plan); // Debug log
//     setSelectedPlan(plan);
//     setIsAuthOpen(true);
//   };

//   const handleGetStarted = () => {
//     setSelectedPlan(null); // Explicitly no plan selected
//     setIsAuthOpen(true);
//   };

//   const handlePaymentSuccess = (planName) => {
//     setPaymentStatus({ message: `Payment successful for ${planName}!`, success: true });
//     toast.success("Payment successful! Your plan is active.");
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//   };

//   const handleLoginSuccess = (phone, fullName) => {
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: phone, fullName });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", phone);
//     localStorage.setItem("fullName", fullName);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", fullName: "" });
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("phoneNumber");
//     localStorage.removeItem("fullName");
//     localStorage.removeItem("amount");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} fullName={clientData.fullName} onLogout={handleLogout} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={handleGetStarted} fullName={clientData.fullName} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//           }}
//           onLoginSuccess={handleLoginSuccess}
//           selectedPlan={selectedPlan}
//           onPaymentSuccess={handlePaymentSuccess}
//           existingClientData={clientData}
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
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

//     if (localStorage.getItem("isLoggedIn") === "true" && clientData.fullName && clientData.clientId) {
//       setIsLoggedIn(true);
//     } else {
//       setIsLoggedIn(false);
//       setClientData({ phoneNumber: "", fullName: "", clientId: null });
//       localStorage.removeItem("isLoggedIn");
//       localStorage.removeItem("phoneNumber");
//       localStorage.removeItem("fullName");
//       localStorage.removeItem("clientId");
//       localStorage.removeItem("amount");
//     }
//   }, []);

//   const handleBuyClick = (plan) => {
//     if (plan.category === "promotional" && plan.price === 0) {
//       handleFreePlanActivation(plan);
//     } else {
//       setSelectedPlan(plan);
//       setIsAuthOpen(true);
//       setForcePlanSelection(false);
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
//       await api.post('/api/activate_plan/', { client_id: clientData.clientId, plan_id: plan.id });
//       handlePaymentSuccess(plan.name, true);
//     } catch (err) {
//       toast.error("Failed to activate plan. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGetStarted = () => {
//     setSelectedPlan(null);
//     setIsAuthOpen(true);
//     setForcePlanSelection(true);
//   };

//   const handlePaymentSuccess = (planName, isFree = false) => {
//     const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
//     setPaymentStatus({ message, success: true });
//     toast.success(message);
//     setIsAuthOpen(false);
//     setSelectedPlan(null);
//     setForcePlanSelection(false);

//     if (forcePlanSelection) {
//       document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const handleLoginSuccess = (phone, fullName, clientId) => {
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: phone, fullName, clientId });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", phone);
//     localStorage.setItem("fullName", fullName);
//     localStorage.setItem("clientId", clientId);

//     if (forcePlanSelection && !selectedPlan) {
//       setIsAuthOpen(false);
//       document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", fullName: "", clientId: null });
//     localStorage.removeItem("isLoggedIn");
//     localStorage.removeItem("phoneNumber");
//     localStorage.removeItem("fullName");
//     localStorage.removeItem("clientId");
//     localStorage.removeItem("amount");
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} fullName={clientData.fullName} onLogout={handleLogout} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={handleGetStarted} fullName={clientData.fullName} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
//         />
//       )}
//       <ToastContainer />
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
// import api from "../api";
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

//   const fetchClientData = async (phoneNumber) => {
//     try {
//       const response = await api.get(`/api/account/clients/?phonenumber=${phoneNumber}`);
//       if (response.data.length > 0) {
//         const client = response.data[0];
//         setClientData({
//           phoneNumber: client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber,
//           fullName: client.full_name,
//           clientId: client.id,
//         });
//         setIsLoggedIn(true);
//         localStorage.setItem("phoneNumber", phoneNumber);
//         localStorage.setItem("fullName", client.full_name);
//         localStorage.setItem("clientId", client.id);
//         localStorage.setItem("isLoggedIn", "true");
//       }
//     } catch (err) {
//       console.error("Error fetching client:", err);
//       setIsLoggedIn(false);
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

//       const clientIp = await fetch("https://api.ipify.org?format=json")
//         .then(res => res.json())
//         .then(data => data.ip);
//       const response = await api.get("/api/network_management/routers/1/hotspot-users/");
//       const activeUsers = response.data;
//       const matchingUser = activeUsers.find(user => user.ip === clientIp);
//       return matchingUser ? matchingUser.mac : "00:00:00:00:00:00"; // Fallback
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

//   const handleLoginSuccess = (phone, fullName, clientId) => {
//     setIsLoggedIn(true);
//     setClientData({ phoneNumber: phone, fullName, clientId });
//     localStorage.setItem("isLoggedIn", "true");
//     localStorage.setItem("phoneNumber", phone);
//     localStorage.setItem("fullName", fullName);
//     localStorage.setItem("clientId", clientId);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setClientData({ phoneNumber: "", fullName: "", clientId: null });
//     localStorage.clear();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
//       <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} fullName={clientData.fullName} onLogout={handleLogout} />
//       <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
//         <HeroSection onGetStarted={handleGetStarted} fullName={clientData.fullName} />
//         <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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










import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import Offers from "./components/Offers";
import Features from "./components/Features";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [forcePlanSelection, setForcePlanSelection] = useState(false);
  const [clientData, setClientData] = useState({
    phoneNumber: localStorage.getItem("phoneNumber") || "",
    fullName: localStorage.getItem("fullName") || "Guest",
    clientId: localStorage.getItem("clientId") || null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/internet_plans/public/");
        setPlans(response.data);
      } catch (err) {
        toast.error("Failed to load plans. Please try again.");
      }
    };
    fetchPlans();

    const storedPhone = localStorage.getItem("phoneNumber");
    if (storedPhone && localStorage.getItem("isLoggedIn") === "true") {
      fetchClientData(storedPhone);
    } else {
      setIsLoggedIn(false);
      setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
      localStorage.clear();
    }
  }, []);

  const fetchClientData = async (phoneNumber) => {
    try {
      // Standardize phone number to match backend format (+254XXXXXXXXX)
      const cleanedPhone = phoneNumber.replace(/[^\d+]/g, "");
      let formattedPhone = cleanedPhone;
      if (cleanedPhone.startsWith("07") && cleanedPhone.length === 10) {
        formattedPhone = `+254${cleanedPhone.slice(1)}`;
      } else if (cleanedPhone.startsWith("01") && cleanedPhone.length === 10) {
        formattedPhone = `+254${cleanedPhone.slice(1)}`;
      } else if (!cleanedPhone.startsWith("+") && cleanedPhone.length === 12) {
        formattedPhone = `+${cleanedPhone}`;
      }

      const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
      if (response.data.length > 0) {
        const client = response.data[0];
        const displayPhone = client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber;
        setClientData({
          phoneNumber: displayPhone,
          fullName: client.full_name,
          clientId: client.id,
        });
        setIsLoggedIn(true);
        localStorage.setItem("phoneNumber", displayPhone);
        localStorage.setItem("fullName", client.full_name);
        localStorage.setItem("clientId", client.id);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        throw new Error("No client found");
      }
    } catch (err) {
      console.error("Error fetching client:", err);
      setIsLoggedIn(false);
      setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
      localStorage.clear();
    }
  };

  const handleBuyClick = (plan) => {
    if (plan.category === "promotional" && plan.price === 0) {
      handleFreePlanActivation(plan);
    } else {
      setSelectedPlan(plan);
      setIsAuthOpen(true);
      setForcePlanSelection(false); // Plan is pre-selected
    }
  };

  const handleFreePlanActivation = async (plan) => {
    if (!isLoggedIn) {
      setSelectedPlan(plan);
      setIsAuthOpen(true);
      setForcePlanSelection(false);
      return;
    }

    setLoading(true);
    try {
      const macAddress = await getMacAddress();
      await api.post("/api/network_management/routers/1/hotspot-users/", {
        client_id: clientData.clientId,
        plan_id: plan.id,
        transaction_id: null, // No payment for free plans
        mac: macAddress,
      });
      handlePaymentSuccess(plan.name, true);
    } catch (err) {
      toast.error("Failed to activate free plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setSelectedPlan(null);
    setForcePlanSelection(true);
    document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" }); // Show plans directly
  };

  const getMacAddress = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const macFromUrl = urlParams.get("mac");
      if (macFromUrl) {
        return macFromUrl; // MikroTik Hotspot provides MAC via URL
      }

      const clientIp = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip);
      const response = await api.get("/api/network_management/routers/1/hotspot-users/");
      const activeUsers = response.data;
      const matchingUser = activeUsers.find(user => user.ip === clientIp);
      return matchingUser ? matchingUser.mac : "00:00:00:00:00:00"; // Fallback
    } catch (error) {
      console.error("Error fetching MAC address:", error);
      return "00:00:00:00:00:00"; // Default fallback
    }
  };

  const handlePaymentSuccess = (planName, isFree = false) => {
    const message = isFree ? `Plan ${planName} activated successfully!` : `Payment successful for ${planName}!`;
    setPaymentStatus({ message, success: true });
    toast.success(message);
    setIsAuthOpen(false);
    setSelectedPlan(null);
    setForcePlanSelection(false);
  };

  const handleLoginSuccess = (phoneNumber, fullName, clientId) => {
    const displayPhone = phoneNumber.startsWith("+254") ? `0${phoneNumber.slice(4)}` : phoneNumber;
    setIsLoggedIn(true);
    setClientData({ phoneNumber: displayPhone, fullName, clientId });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("phoneNumber", displayPhone);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("clientId", clientId);
    toast.success(`Welcome, ${fullName}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setClientData({ phoneNumber: "", fullName: "Guest", clientId: null });
    localStorage.clear();
    toast.info("Logged out successfully.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
      <NavBar 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        fullName={clientData.fullName} 
        onLogout={handleLogout} 
      />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <HeroSection 
          onGetStarted={handleGetStarted} 
          fullName={clientData.fullName} 
        />
        <Offers 
          onBuyClick={handleBuyClick} 
          isLoggedIn={isLoggedIn} 
          plans={plans} 
        />
        {paymentStatus && (
          <div
            className={`mt-6 p-4 rounded-lg text-center ${
              paymentStatus.success ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            <p className="text-lg">{paymentStatus.message}</p>
            <button
              onClick={() => setPaymentStatus(null)}
              className="mt-2 text-sm underline hover:text-pink-300"
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
          forcePlanSelection={forcePlanSelection}
          getMacAddress={getMacAddress}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default App;