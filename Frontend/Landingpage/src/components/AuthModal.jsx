// import React, { useState } from 'react';

// const AuthModal = ({ onClose }) => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [step, setStep] = useState(1); // 1: Signup/Login form, 2: OTP entry
//   const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', otp: '' });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Simulate API call to backend for signup and OTP generation
//       const response = await fetch('/api/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ full_name: formData.fullName, phone_number: formData.phoneNumber }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         setStep(2); // Move to OTP step
//       } else {
//         setError(data.error || 'Something went wrong. Try again.');
//       }
//     } catch (err) {
//       setError('Failed to connect. Check your network.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Simulate API call to backend for login OTP request
//       const response = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone_number: formData.phoneNumber }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         setStep(2); // Move to OTP step
//       } else {
//         setError(data.error || 'Phone number not found. Sign up first.');
//       }
//     } catch (err) {
//       setError('Failed to connect. Check your network.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Simulate API call to verify OTP
//       const response = await fetch('/api/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone_number: formData.phoneNumber, otp: formData.otp }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         alert('Welcome! You’re logged in.'); // Replace with actual redirect/logic
//         onClose();
//       } else {
//         setError(data.error || 'Invalid OTP. Try again.');
//       }
//     } catch (err) {
//       setError('Failed to verify. Check your network.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">
//             {step === 1 ? (isSignup ? 'Sign Up' : 'Log In') : 'Enter OTP'}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         {step === 1 ? (
//           <form onSubmit={isSignup ? handleSignup : handleLogin}>
//             {isSignup && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             )}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Phone Number</label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 0712345678"
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? 'Please Wait...' : isSignup ? 'Sign Up' : 'Log In'}
//             </button>
//             <p className="mt-4 text-center text-sm">
//               {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
//               <button
//                 type="button"
//                 onClick={() => setIsSignup(!isSignup)}
//                 className="text-pink-500 hover:underline"
//               >
//                 {isSignup ? 'Log In' : 'Sign Up'}
//               </button>
//             </p>
//           </form>
//         ) : (
//           <form onSubmit={handleOtpSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Enter OTP</label>
//               <input
//                 type="text"
//                 name="otp"
//                 value={formData.otp}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 123456"
//                 required
//               />
//               <p className="text-sm text-gray-600 mt-2">
//                 Check your phone ({formData.phoneNumber}) for the code.
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? 'Verifying...' : 'Verify OTP'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;




// import React, { useState } from 'react';

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan }) => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [step, setStep] = useState(1); // 1: Signup/Login, 2: OTP
//   const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', otp: '' });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ full_name: formData.fullName, phone_number: formData.phoneNumber }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('phoneNumber', formData.phoneNumber);
//         setStep(2);
//       } else {
//         setError(data.error || 'Something went wrong. Try again.');
//       }
//     } catch (err) {
//       setError('Failed to connect. Check your network.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone_number: formData.phoneNumber }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('phoneNumber', formData.phoneNumber);
//         setStep(2);
//       } else {
//         setError(data.error || 'Phone number not found. Sign up first.');
//       }
//     } catch (err) {
//       setError('Failed to connect. Check your network.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch('/api/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ phone_number: formData.phoneNumber, otp: formData.otp }),
//       });
//       const data = await response.json();

//       if (response.ok) {
//         onLoginSuccess();
//       } else {
//         setError(data.error || 'Invalid OTP. Try again.');
//       }
//     } catch (err) {
//       setError('Failed to verify. Check your network.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">
//             {step === 1 ? (isSignup ? 'Sign Up' : 'Log In') : 'Enter OTP'}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         {selectedPlan && (
//           <div className="mb-4 p-3 bg-indigo-100 rounded-lg text-center">
//             <p className="text-sm font-semibold">
//               Buying: {selectedPlan.data} for {selectedPlan.price} ({selectedPlan.validity})
//             </p>
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={isSignup ? handleSignup : handleLogin}>
//             {isSignup && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             )}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Phone Number</label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 0712345678"
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? 'Please Wait...' : isSignup ? 'Sign Up' : 'Log In'}
//             </button>
//             <p className="mt-4 text-center text-sm">
//               {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
//               <button
//                 type="button"
//                 onClick={() => setIsSignup(!isSignup)}
//                 className="text-pink-500 hover:underline"
//               >
//                 {isSignup ? 'Log In' : 'Sign Up'}
//               </button>
//             </p>
//           </form>
//         ) : (
//           <form onSubmit={handleOtpSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Enter OTP</label>
//               <input
//                 type="text"
//                 name="otp"
//                 value={formData.otp}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 123456"
//                 required
//               />
//               <p className="text-sm text-gray-600 mt-2">
//                 Check your phone ({formData.phoneNumber}) for the code.
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? 'Verifying...' : 'Verify OTP'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;





// import React, { useState } from "react";
// import api from "../../api";

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan }) => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [step, setStep] = useState(1); // 1: Signup/Login, 2: OTP
//   const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", otp: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSignupOrLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       // For simplicity, use OTP generation for both signup and login
//       await api.post("/api/otp/generate/", { phone_number: formData.phoneNumber });
//       setStep(2);
//     } catch (err) {
//       setError("Failed to send OTP: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await api.post("/api/otp/verify/", {
//         phone_number: formData.phoneNumber,
//         otp_code: formData.otp,
//       });
//       if (response.data.message === "OTP verified successfully") {
//         // Create client if signup
//         if (isSignup) {
//           await api.post("/api/account/clients/", {
//             full_name: formData.fullName,
//             phonenumber: formData.phoneNumber,
//           });
//         }
//         onLoginSuccess(formData.phoneNumber);
//       } else {
//         setError("Invalid OTP");
//       }
//     } catch (err) {
//       setError("Failed to verify OTP: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">
//             {step === 1 ? (isSignup ? "Sign Up" : "Log In") : "Enter OTP"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         {selectedPlan && (
//           <div className="mb-4 p-3 bg-indigo-100 rounded-lg text-center">
//             <p className="text-sm font-semibold">
//               Buying: {selectedPlan.name} for Ksh {selectedPlan.price}
//             </p>
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={handleSignupOrLogin}>
//             {isSignup && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             )}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Phone Number</label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 0712345678"
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? "Please Wait..." : "Send OTP"}
//             </button>
//             <p className="mt-4 text-center text-sm">
//               {isSignup ? "Already have an account?" : "Need an account?"}{" "}
//               <button
//                 type="button"
//                 onClick={() => setIsSignup(!isSignup)}
//                 className="text-pink-500 hover:underline"
//               >
//                 {isSignup ? "Log In" : "Sign Up"}
//               </button>
//             </p>
//           </form>
//         ) : (
//           <form onSubmit={handleOtpSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Enter OTP</label>
//               <input
//                 type="text"
//                 name="otp"
//                 value={formData.otp}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 123456"
//                 required
//               />
//               <p className="text-sm text-gray-600 mt-2">
//                 Check your phone ({formData.phoneNumber}) for the code.
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? "Verifying..." : "Verify OTP"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;



// import React, { useState } from "react";
// import api from "../../api";

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan }) => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [step, setStep] = useState(1); // 1: Signup/Login, 2: OTP
//   const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", otp: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const formatPhoneNumberForBackend = (phone) => {
//     if (phone.startsWith("07") && phone.length === 10) {
//       return `+254${phone.slice(2)}`;
//     }
//     return phone; // If already in +254 format, use as-is
//   };

//   const handleSignupOrLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const formattedPhone = formatPhoneNumberForBackend(formData.phoneNumber);
//     try {
//       await api.post("/api/otp/generate/", { phone_number: formattedPhone });
//       setStep(2);
//     } catch (err) {
//       setError("Failed to send OTP: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const formattedPhone = formatPhoneNumberForBackend(formData.phoneNumber);
//     try {
//       const response = await api.post("/api/otp/verify/", {
//         phone_number: formattedPhone,
//         otp_code: formData.otp,
//       });
//       if (response.data.message === "OTP verified successfully") {
//         if (isSignup) {
//           await api.post("/api/account/clients/", {
//             full_name: formData.fullName,
//             phonenumber: formattedPhone,
//           });
//         }
//         onLoginSuccess(formData.phoneNumber); // Pass 07XXXXXXXX to App.jsx
//       } else {
//         setError("Invalid OTP");
//       }
//     } catch (err) {
//       setError("Failed to verify OTP: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">
//             {step === 1 ? (isSignup ? "Sign Up" : "Log In") : "Enter OTP"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         {selectedPlan && (
//           <div className="mb-4 p-3 bg-indigo-100 rounded-lg text-center">
//             <p className="text-sm font-semibold">
//               Buying: {selectedPlan.name} for KES {selectedPlan.price}
//             </p>
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={handleSignupOrLogin}>
//             {isSignup && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             )}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Phone Number</label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 0712345678"
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? "Please Wait..." : "Send OTP"}
//             </button>
//             <p className="mt-4 text-center text-sm">
//               {isSignup ? "Already have an account?" : "Need an account?"}{" "}
//               <button
//                 type="button"
//                 onClick={() => setIsSignup(!isSignup)}
//                 className="text-pink-500 hover:underline"
//               >
//                 {isSignup ? "Log In" : "Sign Up"}
//               </button>
//             </p>
//           </form>
//         ) : (
//           <form onSubmit={handleOtpSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Enter OTP</label>
//               <input
//                 type="text"
//                 name="otp"
//                 value={formData.otp}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 123456"
//                 required
//               />
//               <p className="text-sm text-gray-600 mt-2">
//                 Check your phone ({formData.phoneNumber}) for the code.
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? "Verifying..." : "Verify OTP"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;




// import React, { useState } from "react";
// import api from "../../api";

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan }) => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [step, setStep] = useState(1); // 1: Signup/Login, 2: OTP
//   const [formData, setFormData] = useState({ fullName: "", phoneNumber: "", otp: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const formatPhoneNumberForBackend = (phone) => {
//     if (phone.startsWith("07") && phone.length === 10) {
//       return `+254${phone.slice(2)}`;
//     }
//     return phone; // If already in +254 format, use as-is
//   };

//   const handleSignupOrLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const formattedPhone = formatPhoneNumberForBackend(formData.phoneNumber);
//     try {
//       await api.post("/api/otp/generate/", { phone_number: formattedPhone });
//       setStep(2);
//     } catch (err) {
//       setError("Failed to send OTP: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const formattedPhone = formatPhoneNumberForBackend(formData.phoneNumber);
//     try {
//       const response = await api.post("/api/otp/verify/", {
//         phone_number: formattedPhone,
//         otp_code: formData.otp,
//       });
//       if (response.data.message === "OTP verified successfully") {
//         if (isSignup) {
//           await api.post("/api/account/clients/", {
//             full_name: formData.fullName,
//             phonenumber: formattedPhone,
//           });
//         }
//         onLoginSuccess(formData.phoneNumber); // Pass 07XXXXXXXX to App.jsx
//       } else {
//         setError("Invalid OTP");
//       }
//     } catch (err) {
//       setError("Failed to verify OTP: " + (err.response?.data?.error || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">
//             {step === 1 ? (isSignup ? "Sign Up" : "Log In") : "Enter OTP"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>

//         {selectedPlan && (
//           <div className="mb-4 p-3 bg-indigo-100 rounded-lg text-center">
//             <p className="text-sm font-semibold">
//               Buying: {selectedPlan.name} for KES {selectedPlan.price}
//             </p>
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={handleSignupOrLogin}>
//             {isSignup && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             )}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Phone Number</label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 0712345678"
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? "Please Wait..." : "Send OTP"}
//             </button>
//             <p className="mt-4 text-center text-sm">
//               {isSignup ? "Already have an account?" : "Need an account?"}{" "}
//               <button
//                 type="button"
//                 onClick={() => setIsSignup(!isSignup)}
//                 className="text-pink-500 hover:underline"
//               >
//                 {isSignup ? "Log In" : "Sign Up"}
//               </button>
//             </p>
//           </form>
//         ) : (
//           <form onSubmit={handleOtpSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-1">Enter OTP</label>
//               <input
//                 type="text"
//                 name="otp"
//                 value={formData.otp}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 123456"
//                 required
//               />
//               <p className="text-sm text-gray-600 mt-2">
//                 Check your phone ({formData.phoneNumber}) for the code.
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
//             >
//               {loading ? "Verifying..." : "Verify OTP"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;







import React, { useState } from "react";
import api from "../../api";

const AuthModal = ({ onClose, onLoginSuccess, selectedPlan }) => {
  const [isSignup, setIsSignup] = useState(true);
  const [step, setStep] = useState(1); // 1: Signup/Login, 2: OTP
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAndFormatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/[^\d+]/g, ""); // Remove non-digits except +
    console.log("Raw phone input:", cleaned);

    // Handle 07XXXXXXXX (10 digits) → +2547XXXXXXXX (13 digits)
    if (cleaned.startsWith("07") && cleaned.length === 10) {
      return `+254${cleaned.slice(1)}`; // 0713524066 → +254713524066
    }
    // Handle 01XXXXXXXX (10 digits) → +2541XXXXXXXX (13 digits)
    else if (cleaned.startsWith("01") && cleaned.length === 10) {
      return `+254${cleaned.slice(1)}`; // 0112345678 → +254112345678
    }
    // Handle 2547XXXXXXXX (12 digits) → +2547XXXXXXXX (13 digits)
    else if (cleaned.startsWith("254") && cleaned.length === 12) {
      return `+${cleaned}`; // 254713524066 → +254713524066
    }
    // Already in +2547XXXXXXXX or +2541XXXXXXXX (13 digits)
    else if (cleaned.startsWith("+254") && cleaned.length === 13) {
      return cleaned; // +254713524066 → +254713524066
    }
    // Handle 7XXXXXXXX (9 digits, assuming missing prefix) → +2547XXXXXXXX
    else if (cleaned.length === 9 && cleaned[0] === "7") {
      return `+254${cleaned}`; // 713524066 → +254713524066
    }
    // Handle 1XXXXXXXX (9 digits, assuming missing prefix) → +2541XXXXXXXX
    else if (cleaned.length === 9 && cleaned[0] === "1") {
      return `+254${cleaned}`; // 113524066 → +254113524066
    }
    throw new Error(
      "Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +2547XXXXXXXX, or +2541XXXXXXXX."
    );
  };

  const handleSignupOrLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber);
      console.log("Formatted phone:", formattedPhone);
      const response = await api.post("/api/otp/generate/", {
        phone_number: formattedPhone,
      });
      if (response.data.message === "OTP sent successfully") {
        setStep(2);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to send OTP: " + (err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber);
      console.log("Formatted phone for OTP verification:", formattedPhone);
      const response = await api.post("/api/otp/verify/", {
        phone_number: formattedPhone,
        otp_code: formData.otp,
      });
      if (response.data.message === "OTP verified successfully") {
        if (isSignup) {
          await api.post("/api/account/clients/", {
            full_name: formData.fullName,
            phonenumber: formattedPhone,
          });
        }
        onLoginSuccess(formattedPhone); // Pass formatted phone to parent
      } else {
        setError("Invalid OTP");
      }
    } catch (err) {
      setError("Failed to verify OTP: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-indigo-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 1 ? (isSignup ? "Sign Up" : "Log In") : "Enter OTP"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {selectedPlan && (
          <div className="mb-4 p-3 bg-indigo-100 rounded-lg text-center">
            <p className="text-sm font-semibold">
              Buying: {selectedPlan.name} for KES {selectedPlan.price}
            </p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignupOrLogin}>
            {isSignup && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., John Doe"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., 0712345678 or 0112345678"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX
              </p>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || !formData.phoneNumber}
              className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
            >
              {loading ? "Please Wait..." : "Send OTP"}
            </button>
            <p className="mt-4 text-center text-sm">
              {isSignup ? "Already have an account?" : "Need an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-pink-500 hover:underline"
              >
                {isSignup ? "Log In" : "Sign Up"}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., 123456"
                required
              />
              <p className="text-sm text-gray-600 mt-2">
                Check your phone ({formData.phoneNumber}) for the code.
              </p>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || !formData.otp}
              className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;