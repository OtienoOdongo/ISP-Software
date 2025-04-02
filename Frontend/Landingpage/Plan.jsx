// import React, { useState, useEffect } from "react";
// import api from "./api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const Plans = () => {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otpCode, setOtpCode] = useState("");
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [step, setStep] = useState("plans"); // "plans", "otp", "payment"

//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const response = await api.get("/api/internet_plans/public/");
//         setPlans(response.data);
//       } catch (err) {
//         setError("Failed to load plans");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   const handleBuyNow = (plan) => {
//     setSelectedPlan(plan);
//     setStep("otp");
//   };

//   const handleGenerateOTP = async () => {
//     if (!phoneNumber) {
//       toast.error("Please enter your phone number");
//       return;
//     }

//     try {
//       await api.post("/api/otp/generate/", { phone_number: phoneNumber });
//       toast.info("OTP sent to your phone");
//     } catch (err) {
//       toast.error("Failed to send OTP: " + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleVerifyOTP = async () => {
//     if (!otpCode) {
//       toast.error("Please enter the OTP code");
//       return;
//     }

//     try {
//       const response = await api.post("/api/otp/verify/", { phone_number: phoneNumber, otp_code: otpCode });
//       if (response.data.message === "OTP verified successfully") {
//         setStep("payment");
//         toast.success("OTP verified!");
//       }
//     } catch (err) {
//       toast.error("OTP verification failed: " + (err.response?.data?.error || err.message));
//     }
//   };

//   const initiatePayment = async () => {
//     try {
//       const response = await api.post("/api/payments/initiate/", {
//         phone_number: phoneNumber,
//         amount: selectedPlan.price,
//         plan_id: selectedPlan.id,
//       });

//       const checkoutRequestId = response.data.checkout_request_id;
//       toast.info("Payment initiated. Please check your phone for the STK Push.");

//       const interval = setInterval(async () => {
//         const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
//         const status = statusResponse.data.status;

//         if (status.ResultCode === "0") {
//           setPaymentStatus("Payment successful! Your subscription is active.");
//           toast.success("Payment successful!");
//           clearInterval(interval);
//           setStep("plans");
//           setSelectedPlan(null);
//           setPhoneNumber("");
//           setOtpCode("");
//         } else if (status.ResultCode) {
//           setPaymentStatus("Payment failed. Please try again.");
//           toast.error("Payment failed.");
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       toast.error("Failed to initiate payment: " + (err.response?.data?.error || err.message));
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       {step === "plans" && (
//         <>
//           <h1 className="text-3xl font-bold text-center mb-6">Available Plans</h1>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {plans.map((plan) => (
//               <div key={plan.id} className="bg-white p-4 rounded-lg shadow-md">
//                 <h2 className="text-xl font-semibold">{plan.name}</h2>
//                 <p>{plan.planType === "Paid" ? `Ksh ${plan.price}` : "Free Trial"}</p>
//                 <p>Download: {plan.downloadSpeed.value} {plan.downloadSpeed.unit}</p>
//                 <p>Upload: {plan.uploadSpeed.value} {plan.uploadSpeed.unit}</p>
//                 <p>Expiry: {plan.expiry.value} {plan.expiry.unit}</p>
//                 <p>Data: {plan.dataLimit.value} {plan.dataLimit.unit}</p>
//                 <button
//                   className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//                   onClick={() => handleBuyNow(plan)}
//                 >
//                   Buy Now
//                 </button>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {step === "otp" && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold mb-4">Verify Your Phone</h2>
//             <input
//               type="text"
//               value={phoneNumber}
//               onChange={(e) => setPhoneNumber(e.target.value)}
//               placeholder="Enter phone number (e.g., 254712345678)"
//               className="w-full p-2 mt-2 border rounded"
//             />
//             <button
//               className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//               onClick={handleGenerateOTP}
//             >
//               Send OTP
//             </button>
//             <input
//               type="text"
//               value={otpCode}
//               onChange={(e) => setOtpCode(e.target.value)}
//               placeholder="Enter OTP"
//               className="w-full p-2 mt-2 border rounded"
//             />
//             <button
//               className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//               onClick={handleVerifyOTP}
//             >
//               Verify OTP
//             </button>
//             <button
//               className="mt-2 text-red-500"
//               onClick={() => setStep("plans")}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {step === "payment" && (
//         <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold mb-4">Purchase {selectedPlan.name}</h2>
//             <p>Price: Ksh {selectedPlan.price}</p>
//             <p>Phone: {phoneNumber}</p>
//             <button
//               className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//               onClick={initiatePayment}
//             >
//               Pay with M-Pesa
//             </button>
//             {paymentStatus && <p className="mt-2">{paymentStatus}</p>}
//             <button
//               className="mt-2 text-red-500"
//               onClick={() => setStep("plans")}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       <ToastContainer />
//     </div>
//   );
// };

// export default Plans;


import React, { useState, useEffect } from "react";
import api from "./api"
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [step, setStep] = useState("plans"); // "plans", "otp", "payment"

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/api/internet_plans/public/");
        setPlans(response.data);
      } catch (err) {
        setError("Failed to load plans: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleBuyNow = (plan) => {
    setSelectedPlan(plan);
    setStep("otp");
  };

  const handleGenerateOTP = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      await api.post("/api/otp/generate/", { phone_number: phoneNumber });
      toast.info("OTP sent to your phone");
    } catch (err) {
      toast.error("Failed to send OTP: " + (err.response?.data?.error || err.message));
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      toast.error("Please enter the OTP code");
      return;
    }

    try {
      const response = await api.post("/api/otp/verify/", { phone_number: phoneNumber, otp_code: otpCode });
      if (response.data.message === "OTP verified successfully") {
        setStep("payment");
        toast.success("OTP verified!");
      }
    } catch (err) {
      toast.error("OTP verification failed: " + (err.response?.data?.error || err.message));
    }
  };

  const initiatePayment = async () => {
    try {
      const response = await api.post("/api/payments/initiate/", {
        phone_number: phoneNumber,
        amount: selectedPlan.price,
        plan_id: selectedPlan.id,
      });

      const checkoutRequestId = response.data.checkout_request_id;
      toast.info("Payment initiated. Please check your phone for the STK Push.");

      const interval = setInterval(async () => {
        try {
          const statusResponse = await api.post("/api/payments/stk-status/", { checkout_request_id: checkoutRequestId });
          const status = statusResponse.data.status;

          if (status.ResultCode === 0) {  // Numeric comparison
            setPaymentStatus("Payment successful! Your subscription is active.");
            toast.success("Payment successful!");
            clearInterval(interval);
            setStep("plans");
            setSelectedPlan(null);
            setPhoneNumber("");
            setOtpCode("");
            setPaymentStatus(null);
          } else if (status.ResultCode !== undefined && status.ResultCode !== 0) {
            setPaymentStatus("Payment failed. Please try again.");
            toast.error(`Payment failed: ${status.ResultDesc || "Unknown error"}`);
            clearInterval(interval);
            setStep("plans");  // Reset to plans on failure
          }
        } catch (err) {
          toast.error("Error checking payment status: " + (err.response?.data?.error || err.message));
          clearInterval(interval);
          setStep("plans");
        }
      }, 5000);
    } catch (err) {
      toast.error("Failed to initiate payment: " + (err.response?.data?.error || err.message));
      setStep("plans");  // Reset on error
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {step === "plans" && (
        <>
          <h1 className="text-3xl font-bold text-center mb-6">Available Plans</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p>{plan.planType === "Paid" ? `Ksh ${plan.price}` : "Free Trial"}</p>
                <p>Download: {plan.downloadSpeed.value} {plan.downloadSpeed.unit}</p>
                <p>Upload: {plan.uploadSpeed.value} {plan.uploadSpeed.unit}</p>
                <p>Expiry: {plan.expiry.value} {plan.expiry.unit}</p>
                <p>Data: {plan.dataLimit.value} {plan.dataLimit.unit}</p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => handleBuyNow(plan)}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {step === "otp" && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Verify Your Phone</h2>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number (e.g., 254712345678)"
              className="w-full p-2 mt-2 border rounded"
            />
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleGenerateOTP}
            >
              Send OTP
            </button>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 mt-2 border rounded"
            />
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </button>
            <button
              className="mt-2 text-red-500"
              onClick={() => setStep("plans")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Purchase {selectedPlan.name}</h2>
            <p>Price: Ksh {selectedPlan.price}</p>
            <p>Phone: {phoneNumber}</p>
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={initiatePayment}
            >
              Pay with M-Pesa
            </button>
            {paymentStatus && <p className="mt-2">{paymentStatus}</p>}
            <button
              className="mt-2 text-red-500"
              onClick={() => setStep("plans")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Plans;