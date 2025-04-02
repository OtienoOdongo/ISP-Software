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
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber") || "");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/internet_plans/public/");
        setPlans(response.data);
      } catch (err) {
        toast.error("Failed to load plans: " + (err.response?.data?.error || err.message));
      }
    };
    fetchPlans();
  }, []);

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    if (!isLoggedIn) {
      setIsAuthOpen(true);
    } else {
      initiatePayment(plan);
    }
  };

  const initiatePayment = async (plan) => {
    try {
      const response = await api.post("/api/payments/initiate/", {
        phone_number: phoneNumber,
        amount: plan.price,
        plan_id: plan.id,
      });
      const checkoutRequestId = response.data.checkout_request_id;
      setPaymentStatus({ message: "Payment request sent! Check your phone.", success: true });
      toast.info("Payment initiated. Please check your phone for the STK Push.");

      const interval = setInterval(async () => {
        const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
        const status = statusResponse.data.status;

        if (status.ResultCode === 0) {
          setPaymentStatus({ message: `Payment successful for ${plan.name}!`, success: true });
          toast.success("Payment successful!");
          clearInterval(interval);
          setSelectedPlan(null);
        } else if (status.ResultCode !== undefined && status.ResultCode !== 0) {
          setPaymentStatus({ message: `Payment failed: ${status.ResultDesc}`, success: false });
          toast.error("Payment failed.");
          clearInterval(interval);
        }
      }, 5000);
    } catch (err) {
      setPaymentStatus({
        message: "Error initiating payment: " + (err.response?.data?.error || err.message),
        success: false,
      });
      toast.error("Payment initiation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-600 text-white">
      <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <HeroSection onGetStarted={() => setIsAuthOpen(true)} />
        <Offers onBuyClick={handleBuyClick} isLoggedIn={isLoggedIn} plans={plans} />
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
          }}
          onLoginSuccess={(phone) => {
            setIsLoggedIn(true);
            setPhoneNumber(phone);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("phoneNumber", phone);
            if (selectedPlan) initiatePayment(selectedPlan);
            setIsAuthOpen(false);
          }}
          selectedPlan={selectedPlan}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default App;