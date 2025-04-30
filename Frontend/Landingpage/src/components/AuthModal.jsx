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







// import React, { useState } from "react";
// import api from "../../api";

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan }) => {
//   const [isSignup, setIsSignup] = useState(true);
//   const [step, setStep] = useState(1); // 1: Signup/Login, 2: OTP
//   const [formData, setFormData] = useState({
//     fullName: "",
//     phoneNumber: "",
//     otp: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateAndFormatPhoneNumber = (phone) => {
//     const cleaned = phone.replace(/[^\d+]/g, ""); // Remove non-digits except +
//     console.log("Raw phone input:", cleaned);

//     // Handle 07XXXXXXXX (10 digits) → +2547XXXXXXXX (13 digits)
//     if (cleaned.startsWith("07") && cleaned.length === 10) {
//       return `+254${cleaned.slice(1)}`; // 0713524066 → +254713524066
//     }
//     // Handle 01XXXXXXXX (10 digits) → +2541XXXXXXXX (13 digits)
//     else if (cleaned.startsWith("01") && cleaned.length === 10) {
//       return `+254${cleaned.slice(1)}`; // 0112345678 → +254112345678
//     }
//     // Handle 2547XXXXXXXX (12 digits) → +2547XXXXXXXX (13 digits)
//     else if (cleaned.startsWith("254") && cleaned.length === 12) {
//       return `+${cleaned}`; // 254713524066 → +254713524066
//     }
//     // Already in +2547XXXXXXXX or +2541XXXXXXXX (13 digits)
//     else if (cleaned.startsWith("+254") && cleaned.length === 13) {
//       return cleaned; // +254713524066 → +254713524066
//     }
//     // Handle 7XXXXXXXX (9 digits, assuming missing prefix) → +2547XXXXXXXX
//     else if (cleaned.length === 9 && cleaned[0] === "7") {
//       return `+254${cleaned}`; // 713524066 → +254713524066
//     }
//     // Handle 1XXXXXXXX (9 digits, assuming missing prefix) → +2541XXXXXXXX
//     else if (cleaned.length === 9 && cleaned[0] === "1") {
//       return `+254${cleaned}`; // 113524066 → +254113524066
//     }
//     throw new Error(
//       "Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, 2541XXXXXXXX, +2547XXXXXXXX, or +2541XXXXXXXX."
//     );
//   };

//   const handleSignupOrLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber);
//       console.log("Formatted phone:", formattedPhone);
//       const response = await api.post("/api/otp/generate/", {
//         phone_number: formattedPhone,
//       });
//       if (response.data.message === "OTP sent successfully") {
//         setStep(2);
//       }
//     } catch (err) {
//       setError(
//         err.message ||
//           "Failed to send OTP: " + (err.response?.data?.error || err.message)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(formData.phoneNumber);
//       console.log("Formatted phone for OTP verification:", formattedPhone);
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
//         onLoginSuccess(formattedPhone); // Pass formatted phone to parent
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
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
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
//                 <label className="block text-sm font-medium mb-1">
//                   Full Name
//                 </label>
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
//               <label className="block text-sm font-medium mb-1">
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={handleChange}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                 placeholder="e.g., 0712345678 or 0112345678"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={loading || !formData.phoneNumber}
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
//               <label className="block text-sm font-medium mb-1">
//                 Enter OTP
//               </label>
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
//               disabled={loading || !formData.otp}
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










// import React, { useState, useEffect } from "react";
// import api from "../../api";
// import { toast } from "react-toastify";
// import { User, Phone, DollarSign, CreditCard, ArrowLeft, CheckCircle, Edit2 } from "lucide-react";

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan, onPaymentSuccess, existingClientData }) => {
//   const isGuest = !existingClientData.fullName && !existingClientData.phoneNumber;
//   const [step, setStep] = useState(isGuest ? 1 : 2);
//   const [formData, setFormData] = useState({
//     fullName: existingClientData.fullName || "",
//     phoneNumber: existingClientData.phoneNumber || "",
//     amount: selectedPlan ? selectedPlan.price : localStorage.getItem("amount") || "",
//     clientId: null,
//   });
//   const [isEditing, setIsEditing] = useState(isGuest); 
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (selectedPlan) {
//       setFormData((prev) => ({ ...prev, amount: selectedPlan.price }));
//     }
//     if (existingClientData.phoneNumber && !isGuest) {
//       checkClientExists(existingClientData.phoneNumber);
//     }
//   }, [selectedPlan, existingClientData.phoneNumber]);

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
//     } else if (cleaned.length === 9 && cleaned[0] === "7") {
//       formatted = `+254${cleaned}`;
//     } else if (cleaned.length === 9 && cleaned[0] === "1") {
//       formatted = `+254${cleaned}`;
//     } else {
//       throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.");
//     }
//     return forPayment ? formatted : `0${formatted.slice(4)}`;
//   };

//   const validateForm = () => {
//     try {
//       validateAndFormatPhoneNumber(formData.phoneNumber, false);
//       if (!formData.fullName) throw new Error("Full name is required.");
//       if (!formData.amount || formData.amount <= 0) throw new Error("Amount must be a positive number.");
//       return true;
//     } catch (err) {
//       setError(err.message);
//       return false;
//     }
//   };

//   const checkClientExists = async (phone) => {
//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phone, true);
//       const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//       if (response.data.length > 0) {
//         setFormData((prev) => ({ ...prev, clientId: response.data[0].id }));
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error("Error checking client:", err);
//       return false;
//     }
//   };

//   const handleDetailsSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (!validateForm()) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const formattedPhoneForClient = validateAndFormatPhoneNumber(formData.phoneNumber, true);
//       const formattedPhoneForPayment = validateAndFormatPhoneNumber(formData.phoneNumber, true);

//       const clientExists = await checkClientExists(formData.phoneNumber);
//       if (clientExists && formData.clientId) {
//         await api.patch(`/api/account/clients/${formData.clientId}/`, {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         toast.success("Details updated successfully!");
//       } else {
//         const response = await api.post("/api/account/clients/", {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         setFormData((prev) => ({ ...prev, clientId: response.data.id }));
//         toast.success("Welcome aboard!");
//       }

//       localStorage.setItem("fullName", formData.fullName);
//       localStorage.setItem("phoneNumber", formData.phoneNumber);
//       localStorage.setItem("amount", formData.amount);
//       localStorage.setItem("isLoggedIn", "true");
//       onLoginSuccess(formattedPhoneForPayment, formData.fullName);

//       setStep(2);
//       setIsEditing(false);
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//       toast.error("Failed to save details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePaymentSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

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
//             onPaymentSuccess(selectedPlan?.name || "your plan");
//             clearInterval(interval);
//           } else if (status.ResultCode && status.ResultCode !== "0") {
//             setError("Payment failed: " + (status.ResultDesc || "Unknown error"));
//             toast.error("Payment failed.");
//             clearInterval(interval);
//           }
//         } catch (err) {
//           setError("Error checking payment status.");
//           toast.error("Error checking payment status.");
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       setError("Payment initiation failed. Please check your details.");
//       toast.error("Payment initiation failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-indigo-200">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
//             {step === 1 ? "Your Details" : "Confirm Payment"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
//             ✕
//           </button>
//         </div>

//         {selectedPlan && (
//           <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-center flex items-center justify-center gap-2">
//             <CheckCircle size={20} className="text-indigo-500" />
//             <p className="text-sm font-semibold text-indigo-700">
//               Buying: {selectedPlan.name} for KES {selectedPlan.price}
//             </p>
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={handleDetailsSubmit} className="space-y-6">
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//                 <User size={20} className="ml-3 text-gray-400" />
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//               <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//                 <Phone size={20} className="ml-3 text-gray-400" />
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//                   placeholder="e.g., 0712345678"
//                   required
//                 />
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX</p>
//             </div>
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
//               <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//                 <DollarSign size={20} className="ml-3 text-gray-400" />
//                 <input
//                   type="number"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//                   placeholder="e.g., 500"
//                   required
//                 />
//               </div>
//             </div>
//             {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//             <div className="flex justify-between gap-4">
//               {!isGuest && (
//                 <button
//                   type="button"
//                   onClick={() => setIsEditing(!isEditing)}
//                   className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
//                 >
//                   <Edit2 size={18} />
//                   {isEditing ? "Lock" : "Edit"}
//                 </button>
//               )}
//               <button
//                 type="submit"
//                 disabled={loading || (!isGuest && isEditing)}
//                 className="flex-1 py-3 px-6 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300 flex items-center justify-center gap-2"
//               >
//                 {loading ? "Saving..." : "Next"}
//                 {!loading && <ArrowLeft size={18} className="rotate-180" />}
//               </button>
//             </div>
//           </form>
//         ) : (
//           <form onSubmit={handlePaymentSubmit} className="space-y-6">
//             <div className="text-center bg-indigo-50 p-6 rounded-lg">
//               <p className="text-xl font-semibold text-indigo-700 flex items-center justify-center gap-2">
//                 <CreditCard size={24} /> Pay KES {formData.amount}
//               </p>
//               <p className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium">To:</span> {formData.fullName} <br />
//                 <span className="font-medium">Phone:</span> {formData.phoneNumber}
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
//             >
//               {loading ? "Processing..." : "Pay with M-Pesa"}
//               {!loading && <CreditCard size={20} />}
//             </button>
//             <button
//               type="button"
//               onClick={() => setStep(1)}
//               className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
//             >
//               <ArrowLeft size={18} /> Back
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;
















// import React, { useState, useEffect } from "react";
// import api from "../../api";
// import { toast } from "react-toastify";
// import { User, Phone, DollarSign, CreditCard, ArrowLeft, CheckCircle, Edit2 } from "lucide-react";

// const AuthModal = ({ onClose, onLoginSuccess, selectedPlan, onPaymentSuccess, existingClientData }) => {
//   const isGuest = !existingClientData.fullName && !existingClientData.phoneNumber;
//   const [step, setStep] = useState(isGuest ? 1 : 2);
//   const [formData, setFormData] = useState({
//     fullName: existingClientData.fullName || "",
//     phoneNumber: existingClientData.phoneNumber || "",
//     amount: selectedPlan ? selectedPlan.price : "", // Empty if no plan selected
//     clientId: null,
//   });
//   const [isEditing, setIsEditing] = useState(isGuest);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (selectedPlan) {
//       setFormData((prev) => ({ ...prev, amount: selectedPlan.price }));
//     } else {
//       setFormData((prev) => ({ ...prev, amount: "" })); // Reset amount if no plan
//     }
//     if (existingClientData.phoneNumber && !isGuest) {
//       checkClientExists(existingClientData.phoneNumber);
//     }
//   }, [selectedPlan, existingClientData.phoneNumber]);

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
//     } else if (cleaned.length === 9 && cleaned[0] === "7") {
//       formatted = `+254${cleaned}`;
//     } else if (cleaned.length === 9 && cleaned[0] === "1") {
//       formatted = `+254${cleaned}`;
//     } else {
//       throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.");
//     }
//     return forPayment ? formatted : `0${formatted.slice(4)}`;
//   };

//   const validateForm = () => {
//     try {
//       validateAndFormatPhoneNumber(formData.phoneNumber, false);
//       if (!formData.fullName) throw new Error("Full name is required.");
//       if (!formData.amount || parseFloat(formData.amount) <= 0) throw new Error("Please enter a valid amount greater than 0.");
//       return true;
//     } catch (err) {
//       setError(err.message);
//       return false;
//     }
//   };

//   const checkClientExists = async (phone) => {
//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phone, true);
//       const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//       if (response.data.length > 0) {
//         setFormData((prev) => ({ ...prev, clientId: response.data[0].id }));
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error("Error checking client:", err);
//       return false;
//     }
//   };

//   const handleDetailsSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (!validateForm()) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const formattedPhoneForClient = validateAndFormatPhoneNumber(formData.phoneNumber, true);
//       const formattedPhoneForPayment = validateAndFormatPhoneNumber(formData.phoneNumber, true);

//       const clientExists = await checkClientExists(formData.phoneNumber);
//       if (clientExists && formData.clientId) {
//         await api.patch(`/api/account/clients/${formData.clientId}/`, {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         toast.success("Details updated successfully!");
//       } else {
//         const response = await api.post("/api/account/clients/", {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         setFormData((prev) => ({ ...prev, clientId: response.data.id }));
//         toast.success("Welcome aboard!");
//       }

//       localStorage.setItem("fullName", formData.fullName);
//       localStorage.setItem("phoneNumber", formData.phoneNumber);
//       localStorage.setItem("amount", formData.amount);
//       localStorage.setItem("isLoggedIn", "true");
//       onLoginSuccess(formattedPhoneForPayment, formData.fullName);

//       setStep(2);
//       setIsEditing(false);
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//       toast.error("Failed to save details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePaymentSubmit = async (e) => {
//     e.preventDefault();
//     if (parseFloat(formData.amount) === 0) {
//       setError("This amount is invalid. Please enter a value greater than 0.");
//       toast.info("Please specify a valid payment amount.");
//       return;
//     }
//     setLoading(true);
//     setError("");

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
//             onPaymentSuccess(selectedPlan?.name || "your custom amount");
//             clearInterval(interval);
//           } else if (status.ResultCode && status.ResultCode !== "0") {
//             setError("Payment failed: " + (status.ResultDesc || "Unknown error"));
//             toast.error("Payment failed.");
//             clearInterval(interval);
//           }
//         } catch (err) {
//           setError("Error checking payment status.");
//           toast.error("Error checking payment status.");
//           clearInterval(interval);
//         }
//       }, 5000);
//     } catch (err) {
//       setError("Payment initiation failed. Please check your details.");
//       toast.error("Payment initiation failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//       <div className="bg-white text-indigo-900 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-indigo-200">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
//             {step === 1 ? "Your Details" : "Confirm Payment"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
//             ✕
//           </button>
//         </div>

//         {selectedPlan && (
//           <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-center flex items-center justify-center gap-2">
//             <CheckCircle size={20} className="text-indigo-500" />
//             <p className="text-sm font-semibold text-indigo-700">
//               Buying: {selectedPlan.name} for KES {selectedPlan.price}
//             </p>
//           </div>
//         )}

//         {step === 1 ? (
//           <form onSubmit={handleDetailsSubmit} className="space-y-6">
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//                 <User size={20} className="ml-3 text-gray-400" />
//                 <input
//                   type="text"
//                   name="fullName"
//                   value={formData.fullName}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//                   placeholder="e.g., John Doe"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//               <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//                 <Phone size={20} className="ml-3 text-gray-400" />
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                   className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//                   placeholder="e.g., 0712345678"
//                   required
//                 />
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX</p>
//             </div>
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
//               <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//                 <DollarSign size={20} className="ml-3 text-gray-400" />
//                 <input
//                   type="number"
//                   name="amount"
//                   value={formData.amount}
//                   onChange={handleChange}
//                   disabled={!isEditing && selectedPlan} // Disable only if plan selected and not editing
//                   className={`w-full p-3 bg-transparent outline-none ${!isEditing && selectedPlan ? "text-gray-500" : ""}`}
//                   placeholder="e.g., 500"
//                   required
//                 />
//               </div>
//             </div>
//             {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//             <div className="flex justify-between gap-4">
//               {!isGuest && (
//                 <button
//                   type="button"
//                   onClick={() => setIsEditing(!isEditing)}
//                   className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
//                 >
//                   <Edit2 size={18} />
//                   {isEditing ? "Lock" : "Edit"}
//                 </button>
//               )}
//               <button
//                 type="submit"
//                 disabled={loading || (!isGuest && isEditing)}
//                 className="flex-1 py-3 px-6 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300 flex items-center justify-center gap-2"
//               >
//                 {loading ? "Saving..." : "Next"}
//                 {!loading && <ArrowLeft size={18} className="rotate-180" />}
//               </button>
//             </div>
//           </form>
//         ) : (
//           <form onSubmit={handlePaymentSubmit} className="space-y-6">
//             <div className="text-center bg-indigo-50 p-6 rounded-lg">
//               <p className="text-xl font-semibold text-indigo-700 flex items-center justify-center gap-2">
//                 <CreditCard size={24} /> Pay KES {formData.amount}
//               </p>
//               <p className="text-sm text-gray-600 mt-2">
//                 <span className="font-medium">To:</span> {formData.fullName} <br />
//                 <span className="font-medium">Phone:</span> {formData.phoneNumber}
//               </p>
//             </div>
//             {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
//             >
//               {loading ? "Processing..." : "Pay with M-Pesa"}
//               {!loading && <CreditCard size={20} />}
//             </button>
//             <button
//               type="button"
//               onClick={() => setStep(1)}
//               className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
//             >
//               <ArrowLeft size={18} /> Back
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;









// import React, { useState, useEffect } from "react";
// import api from "../../api";
// import { toast } from "react-toastify";
// import { 
//   User, 
//   Phone, 
//   DollarSign, 
//   CreditCard, 
//   ArrowLeft, 
//   CheckCircle, 
//   Edit2, 
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
//   forcePlanSelection 
// }) => {
//   const isGuest = !existingClientData.fullName && !existingClientData.phoneNumber;
//   const [step, setStep] = useState(isGuest ? 1 : 2);
//   const [formData, setFormData] = useState({
//     fullName: existingClientData.fullName || "",
//     phoneNumber: existingClientData.phoneNumber || "",
//     amount: selectedPlan ? selectedPlan.price : "",
//     clientId: existingClientData.clientId || null,
//   });
//   const [isEditing, setIsEditing] = useState(isGuest);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);

//   const isFreePlan = selectedPlan?.category === "promotional" && 
//                     (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

//   useEffect(() => {
//     if (selectedPlan) {
//       setFormData((prev) => ({ ...prev, amount: selectedPlan.price }));
//     } else {
//       setFormData((prev) => ({ ...prev, amount: "" }));
//     }
//     if (existingClientData.phoneNumber && !isGuest) {
//       checkClientExists(existingClientData.phoneNumber);
//     }
//   }, [selectedPlan, existingClientData.phoneNumber]);

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
//     } else if (cleaned.length === 9 && cleaned[0] === "7") {
//       formatted = `+254${cleaned}`;
//     } else if (cleaned.length === 9 && cleaned[0] === "1") {
//       formatted = `+254${cleaned}`;
//     } else {
//       throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.");
//     }
//     return forPayment ? formatted : `0${formatted.slice(4)}`;
//   };

//   const validateForm = () => {
//     try {
//       validateAndFormatPhoneNumber(formData.phoneNumber, false);
//       if (!formData.fullName) throw new Error("Full name is required.");
//       if (!isFreePlan && (!formData.amount || parseFloat(formData.amount) <= 0)) {
//         throw new Error("Please enter a valid amount greater than 0.");
//       }
//       return true;
//     } catch (err) {
//       setError(err.message);
//       return false;
//     }
//   };

//   const checkClientExists = async (phone) => {
//     try {
//       const formattedPhone = validateAndFormatPhoneNumber(phone, true);
//       const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
//       if (response.data.length > 0) {
//         setFormData((prev) => ({ ...prev, clientId: response.data[0].id }));
//         return true;
//       }
//       return false;
//     } catch (err) {
//       console.error("Error checking client:", err);
//       return false;
//     }
//   };

//   const handleFreePlanActivation = async () => {
//     setLoading(true);
//     try {
//       await api.post('/api/activate_plan/', { client_id: formData.clientId, plan_id: selectedPlan.id });
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(3);
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
//       const formattedPhoneForPayment = validateAndFormatPhoneNumber(formData.phoneNumber, true);

//       const clientExists = await checkClientExists(formData.phoneNumber);
//       if (clientExists && formData.clientId) {
//         await api.patch(`/api/account/clients/${formData.clientId}/`, {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         toast.success("Details updated successfully!");
//       } else {
//         const response = await api.post("/api/account/clients/", {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         setFormData((prev) => ({ ...prev, clientId: response.data.id }));
//         toast.success("Welcome aboard!");
//       }

//       localStorage.setItem("fullName", formData.fullName);
//       localStorage.setItem("phoneNumber", formData.phoneNumber);
//       localStorage.setItem("clientId", formData.clientId);
//       localStorage.setItem("isLoggedIn", "true");
//       onLoginSuccess(formattedPhoneForPayment, formData.fullName, formData.clientId);

//       if (forcePlanSelection && !selectedPlan) {
//         onClose();
//         return;
//       }

//       setStep(2);
//       setIsEditing(false);
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//       toast.error("Failed to save details.");
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
//             onPaymentSuccess(selectedPlan?.name || "your custom amount", false);
//             clearInterval(interval);
//             setPaymentInProgress(false);
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
//     <form onSubmit={handleDetailsSubmit} className="space-y-6">
//       <div className="relative">
//         <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//         <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//           <User size={20} className="ml-3 text-gray-400" />
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             disabled={!isEditing}
//             className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//             placeholder="e.g., John Doe"
//             required
//           />
//         </div>
//       </div>
//       <div className="relative">
//         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//         <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//           <Phone size={20} className="ml-3 text-gray-400" />
//           <input
//             type="tel"
//             name="phoneNumber"
//             value={formData.phoneNumber}
//             onChange={handleChange}
//             disabled={!isEditing}
//             className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//             placeholder="e.g., 0712345678"
//             required
//           />
//         </div>
//         <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX</p>
//       </div>
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
//               disabled={!isEditing && selectedPlan}
//               className={`w-full p-3 bg-transparent outline-none ${!isEditing && selectedPlan ? "text-gray-500" : ""}`}
//               placeholder="e.g., 500"
//               required={!isFreePlan}
//             />
//           </div>
//         </div>
//       )}
//       {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
//       <div className="flex justify-between gap-4">
//         {!isGuest && (
//           <button
//             type="button"
//             onClick={() => setIsEditing(!isEditing)}
//             className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
//           >
//             <Edit2 size={18} />
//             {isEditing ? "Lock" : "Edit"}
//           </button>
//         )}
//         <button
//           type="submit"
//           disabled={loading || (!isGuest && isEditing)}
//           className="flex-1 py-3 px-6 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300 flex items-center justify-center gap-2"
//         >
//           {loading ? "Saving..." : "Next"}
//           {!loading && <ChevronRight size={18} />}
//         </button>
//       </div>
//     </form>
//   );

//   const renderStep2 = () => (
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
//         onClick={() => setStep(1)}
//         className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
//       >
//         <ChevronLeft size={18} /> Back
//       </button>
//     </form>
//   );

//   const renderStep3 = () => (
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
//         {step !== 3 && (
//           <button 
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
//           >
//             <X size={24} />
//           </button>
//         )}
        
//         <div className="flex justify-center items-center mb-6">
//           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
//             {step === 1 ? "Your Details" : 
//              step === 2 ? (isFreePlan ? "Confirm Activation" : "Confirm Payment") : 
//              "Activation Successful!"}
//           </h2>
//         </div>

//         {selectedPlan && step !== 3 && (
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
//          renderStep3()}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;





// import React, { useState, useEffect } from "react";
// import api from "../../api";
// import { toast } from "react-toastify";
// import { 
//   User, 
//   Phone, 
//   DollarSign, 
//   CreditCard, 
//   ArrowLeft, 
//   CheckCircle, 
//   Edit2, 
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
//   forcePlanSelection 
// }) => {
//   const isGuest = !existingClientData.fullName && !existingClientData.phoneNumber;
//   const [step, setStep] = useState(1); // Always start at Step 1 for "Get Started"
//   const [formData, setFormData] = useState({
//     fullName: existingClientData.fullName || "",
//     phoneNumber: existingClientData.phoneNumber || "",
//     amount: selectedPlan ? selectedPlan.price : "",
//     clientId: existingClientData.clientId || null,
//   });
//   const [isEditing, setIsEditing] = useState(true); // Start editable for phone number entry
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentInProgress, setPaymentInProgress] = useState(false);
//   const [isReturningUser, setIsReturningUser] = useState(false);

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
//     if (name === "phoneNumber" && value.length >= 9) {
//       checkClientExists(value); // Check in real-time as user types
//     }
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
//       if (!formData.fullName) throw new Error("Full name is required.");
//       if (!isFreePlan && (!formData.amount || parseFloat(formData.amount) <= 0)) {
//         throw new Error("Please enter a valid amount greater than 0.");
//       }
//       return true;
//     } catch (err) {
//       setError(err.message);
//       return false;
//     }
//   };

//   const checkClientExists = async (phone) => {
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
//         setIsReturningUser(true);
//         setIsEditing(false); // Lock fields for returning users by default
//         return true;
//       } else {
//         setIsReturningUser(false);
//         setFormData((prev) => ({ ...prev, fullName: "", clientId: null }));
//         setIsEditing(true);
//         return false;
//       }
//     } catch (err) {
//       console.error("Error checking client:", err);
//       setIsReturningUser(false);
//       return false;
//     }
//   };

//   const handleFreePlanActivation = async () => {
//     setLoading(true);
//     try {
//       await api.post('/api/activate_plan/', { client_id: formData.clientId, plan_id: selectedPlan.id });
//       onPaymentSuccess(selectedPlan.name, true);
//       setStep(3);
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
//       const formattedPhoneForPayment = validateAndFormatPhoneNumber(formData.phoneNumber, true);

//       const clientExists = await checkClientExists(formData.phoneNumber);
//       if (clientExists && formData.clientId) {
//         await api.patch(`/api/account/clients/${formData.clientId}/`, {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         toast.success("Details updated successfully!");
//       } else {
//         const response = await api.post("/api/account/clients/", {
//           full_name: formData.fullName,
//           phonenumber: formattedPhoneForClient,
//         });
//         setFormData((prev) => ({ ...prev, clientId: response.data.id }));
//         toast.success("Welcome aboard!");
//       }

//       localStorage.setItem("fullName", formData.fullName);
//       localStorage.setItem("phoneNumber", formData.phoneNumber);
//       localStorage.setItem("clientId", formData.clientId);
//       localStorage.setItem("isLoggedIn", "true");
//       onLoginSuccess(formattedPhoneForPayment, formData.fullName, formData.clientId);

//       if (forcePlanSelection && !selectedPlan) {
//         onClose();
//         return;
//       }

//       setStep(2);
//       setIsEditing(false);
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//       toast.error("Failed to save details.");
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
//             onPaymentSuccess(selectedPlan?.name || "your custom amount", false);
//             clearInterval(interval);
//             setPaymentInProgress(false);
//             setStep(3); // Move to success step after payment
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
//     <form onSubmit={handleDetailsSubmit} className="space-y-6">
//       <div className="relative">
//         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//         <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//           <Phone size={20} className="ml-3 text-gray-400" />
//           <input
//             type="tel"
//             name="phoneNumber"
//             value={formData.phoneNumber}
//             onChange={handleChange}
//             className="w-full p-3 bg-transparent outline-none"
//             placeholder="e.g., 0712345678"
//             required
//           />
//         </div>
//         <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX</p>
//       </div>
//       <div className="relative">
//         <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//         <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
//           <User size={20} className="ml-3 text-gray-400" />
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             disabled={!isEditing}
//             className={`w-full p-3 bg-transparent outline-none ${!isEditing ? "text-gray-500" : ""}`}
//             placeholder="e.g., John Doe"
//             required
//           />
//         </div>
//       </div>
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
//               disabled={!isEditing && selectedPlan}
//               className={`w-full p-3 bg-transparent outline-none ${!isEditing && selectedPlan ? "text-gray-500" : ""}`}
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
//           className="w-full py-3 px-6 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition-all disabled:bg-pink-300 flex items-center justify-center gap-2"
//         >
//           {loading ? "Saving..." : "Next"}
//           {!loading && <ChevronRight size={18} />}
//         </button>
//         {isReturningUser && selectedPlan && (
//           <button
//             type="button"
//             onClick={() => setStep(2)}
//             disabled={loading || isEditing}
//             className="w-full py-3 px-6 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-all disabled:bg-blue-300 flex items-center justify-center gap-2"
//           >
//             Pay Now <CreditCard size={18} />
//           </button>
//         )}
//         {isReturningUser && (
//           <button
//             type="button"
//             onClick={() => setIsEditing(!isEditing)}
//             className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
//           >
//             <Edit2 size={18} />
//             {isEditing ? "Lock" : "Edit"}
//           </button>
//         )}
//       </div>
//     </form>
//   );

//   const renderStep2 = () => (
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
//         onClick={() => setStep(1)}
//         className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
//       >
//         <ChevronLeft size={18} /> Back
//       </button>
//     </form>
//   );

//   const renderStep3 = () => (
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
//         {step !== 3 && (
//           <button 
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
//           >
//             <X size={24} />
//           </button>
//         )}
        
//         <div className="flex justify-center items-center mb-6">
//           <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
//             {step === 1 ? "Your Details" : 
//              step === 2 ? (isFreePlan ? "Confirm Activation" : "Confirm Payment") : 
//              "Activation Successful!"}
//           </h2>
//         </div>

//         {selectedPlan && step !== 3 && (
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
//          renderStep3()}
//       </div>
//     </div>
//   );
// };

// export default AuthModal;










import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { 
  User, 
  Phone, 
  DollarSign, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Wifi, 
  Gift,
  X,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

const AuthModal = ({ 
  onClose, 
  onLoginSuccess, 
  selectedPlan, 
  onPaymentSuccess, 
  existingClientData,
  forcePlanSelection,
  getMacAddress
}) => {
  const isGuest = !existingClientData.fullName && !existingClientData.phoneNumber;
  const [step, setStep] = useState(1); // Start with user type selection
  const [formData, setFormData] = useState({
    fullName: existingClientData.fullName || "",
    phoneNumber: existingClientData.phoneNumber || "",
    amount: selectedPlan ? selectedPlan.price : "",
    clientId: existingClientData.clientId || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [userType, setUserType] = useState(null); // "new" or "existing"

  const isFreePlan = selectedPlan?.category === "promotional" && 
                    (selectedPlan.price === 0 || selectedPlan.price === "0" || parseFloat(selectedPlan.price) === 0);

  useEffect(() => {
    if (selectedPlan) {
      setFormData((prev) => ({ ...prev, amount: selectedPlan.price }));
    } else {
      setFormData((prev) => ({ ...prev, amount: "" }));
    }
  }, [selectedPlan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAndFormatPhoneNumber = (phone, forPayment = false) => {
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
      throw new Error("Invalid phone number format. Use 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX.");
    }
    return forPayment ? formatted : `0${formatted.slice(4)}`;
  };

  const validateForm = () => {
    try {
      validateAndFormatPhoneNumber(formData.phoneNumber, false);
      if (!formData.fullName && userType === "new") throw new Error("Full name is required.");
      if (!isFreePlan && (!formData.amount || parseFloat(formData.amount) <= 0)) {
        throw new Error("Please enter a valid amount greater than 0.");
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const fetchClientData = async (phone) => {
    try {
      const formattedPhone = validateAndFormatPhoneNumber(phone, true);
      const response = await api.get(`/api/account/clients/?phonenumber=${formattedPhone}`);
      if (response.data.length > 0) {
        const client = response.data[0];
        setFormData((prev) => ({
          ...prev,
          clientId: client.id,
          fullName: client.full_name,
          phoneNumber: client.phonenumber.startsWith("+254") ? `0${client.phonenumber.slice(4)}` : client.phonenumber,
        }));
        return client;
      } else {
        return null;
      }
    } catch (err) {
      setError(err.message || "Failed to fetch client data.");
      return null;
    }
  };

  const handleFreePlanActivation = async () => {
    setLoading(true);
    try {
      const macAddress = await getMacAddress();
      await api.post("/api/network_management/routers/1/hotspot-users/", {
        client_id: formData.clientId,
        plan_id: selectedPlan.id,
        transaction_id: null,
        mac: macAddress,
      });
      onPaymentSuccess(selectedPlan.name, true);
      setStep(4); // Success step
    } catch (err) {
      setError("Failed to activate plan. Please try again.");
      toast.error("Failed to activate plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    
    if (isFreePlan) {
      handleFreePlanActivation();
      return;
    }
    
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formattedPhoneForClient = validateAndFormatPhoneNumber(formData.phoneNumber, true);

      if (userType === "new") {
        const response = await api.post("/api/account/clients/", {
          full_name: formData.fullName,
          phonenumber: formattedPhoneForClient,
        });
        const clientData = response.data;
        setFormData((prev) => ({ ...prev, clientId: clientData.id }));
        toast.success(response.status === 201 ? "Welcome aboard!" : "Welcome back!");
        onLoginSuccess(formData.phoneNumber, clientData.full_name, clientData.id);
      } else if (userType === "existing") {
        const client = await fetchClientData(formData.phoneNumber);
        if (!client) {
          setError("No account found with this phone number. Please sign up as a new user.");
          setLoading(false);
          return;
        }
        onLoginSuccess(formData.phoneNumber, client.full_name, client.id);
        toast.success(`Welcome back, ${client.full_name}!`);
      }

      setStep(3); // Payment step
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      toast.error(err.response?.data?.error || "Failed to process your request.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!isFreePlan && parseFloat(formData.amount) === 0) {
      setError("This amount is invalid. Please enter a value greater than 0.");
      toast.info("Please specify a valid payment amount.");
      return;
    }
    
    if (isFreePlan) {
      handleFreePlanActivation();
      return;
    }

    setLoading(true);
    setError("");
    setPaymentInProgress(true);

    try {
      const formattedPhoneForPayment = validateAndFormatPhoneNumber(formData.phoneNumber, true);
      const response = await api.post("/api/payments/initiate/", {
        phone_number: formattedPhoneForPayment,
        amount: formData.amount,
        plan_id: selectedPlan?.id || null,
      });
      const checkoutRequestId = response.data.checkout_request_id;

      toast.info("Check your phone for the M-Pesa STK Push.");

      const interval = setInterval(async () => {
        try {
          const statusResponse = await api.post("/api/payments/stk-status/", {
            checkout_request_id: checkoutRequestId,
          });
          const status = statusResponse.data.status;

          if (status.ResultCode === "0") {
            const macAddress = await getMacAddress();
            await api.post("/api/network_management/routers/1/hotspot-users/", {
              client_id: formData.clientId,
              plan_id: selectedPlan?.id || null,
              transaction_id: checkoutRequestId,
              mac: macAddress,
            });
            onPaymentSuccess(selectedPlan?.name || "your custom amount", false);
            clearInterval(interval);
            setPaymentInProgress(false);
            setStep(4); // Success step
          } else if (status.ResultCode && status.ResultCode !== "0") {
            setError("Payment failed: " + (status.ResultDesc || "Unknown error"));
            toast.error("Payment failed.");
            clearInterval(interval);
            setPaymentInProgress(false);
          }
        } catch (err) {
          setError("Error checking payment status.");
          toast.error("Error checking payment status.");
          clearInterval(interval);
          setPaymentInProgress(false);
        }
      }, 5000);
    } catch (err) {
      setError("Payment initiation failed. Please check your details.");
      toast.error("Payment initiation failed.");
      setPaymentInProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 text-center">
      <p className="text-lg text-gray-700 font-medium">Let’s get you connected!</p>
      <div className="flex flex-col gap-6">
        <button
          onClick={() => {
            setUserType("new");
            setStep(2);
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-3 transform hover:scale-105"
        >
          <User size={22} />
          I’m New Here
        </button>
        <button
          onClick={() => {
            setUserType("existing");
            setStep(2);
          }}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-3 transform hover:scale-105"
        >
          <CreditCard size={22} />
          I’m Back!
        </button>
      </div>
      <p className="text-sm text-gray-500">Pick an option to start surfing.</p>
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleDetailsSubmit} className="space-y-6">
      {userType === "new" && (
        <>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
              <Phone size={20} className="ml-3 text-gray-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 bg-transparent outline-none"
                placeholder="e.g., 0712345678"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX, 01XXXXXXXX, or +254XXXXXXXXX</p>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
              <User size={20} className="ml-3 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 bg-transparent outline-none"
                placeholder="e.g., John Doe"
                required
              />
            </div>
          </div>
        </>
      )}
      {userType === "existing" && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
            <Phone size={20} className="ml-3 text-gray-400" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 bg-transparent outline-none"
              placeholder="e.g., 0712345678"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter your registered phone number</p>
        </div>
      )}
      {!isFreePlan && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
          <div className="flex items-center border rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-pink-500">
            <DollarSign size={20} className="ml-3 text-gray-400" />
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              disabled={selectedPlan}
              className={`w-full p-3 bg-transparent outline-none ${selectedPlan ? "text-gray-500" : ""}`}
              placeholder="e.g., 500"
              required={!isFreePlan}
            />
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : userType === "existing" ? "Pay Now" : "Next"}
          {!loading && <ChevronRight size={18} />}
        </button>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <div className="text-center bg-indigo-50 p-6 rounded-lg">
        <p className="text-xl font-semibold text-indigo-700 flex items-center justify-center gap-2">
          {isFreePlan ? (
            <>
              <Gift size={24} />
              <span>Activate Free Plan</span>
            </>
          ) : (
            <>
              <CreditCard size={24} />
              <span>Pay KES {formData.amount}</span>
            </>
          )}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium">From:</span> {formData.fullName} <br />
          <span className="font-medium">Phone:</span> {formData.phoneNumber}
        </p>
        {selectedPlan && (
          <div className="mt-4 bg-white p-3 rounded-md">
            <p className="text-sm font-medium text-gray-800">
              <span className="font-bold">Plan:</span> {selectedPlan.name}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-1">
              <span className="font-bold">Data:</span> {selectedPlan.dataLimit.value} {selectedPlan.dataLimit.unit}
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}
      <button
        type="submit"
        disabled={loading || paymentInProgress}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        {loading ? "Processing..." : 
         paymentInProgress ? "Waiting for payment..." :
         isFreePlan ? "Activate Now" : "Pay with M-Pesa"}
        {!loading && !paymentInProgress && (isFreePlan ? <Gift size={20} /> : <CreditCard size={20} />)}
      </button>
      <button
        type="button"
        onClick={() => setStep(2)}
        className="w-full py-3 bg-transparent border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <ChevronLeft size={18} /> Back
      </button>
    </form>
  );

  const renderStep4 = () => (
    <div className="text-center p-6">
      <div className="mb-6">
        <div className="relative inline-block">
          <Wifi size={80} className="text-green-500 animate-pulse" />
          <CheckCircle 
            size={32} 
            className="absolute -right-2 -top-2 text-white bg-green-500 rounded-full p-1 animate-bounce" 
          />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {selectedPlan?.name} Activated!
      </h3>
      <p className="text-gray-600 mb-4">
        {isFreePlan 
          ? "Your free promotional plan is now active. Enjoy your internet access!"
          : "Your internet plan is now active. Enjoy seamless browsing!"}
      </p>
      <div className="bg-indigo-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-indigo-700">
          <span className="font-bold">Data:</span> {selectedPlan?.dataLimit.value} {selectedPlan?.dataLimit.unit}
        </p>
        <p className="text-sm font-medium text-indigo-700 mt-1">
          <span className="font-bold">Valid for:</span> {selectedPlan?.expiry.value} {selectedPlan?.expiry.unit}
        </p>
        {selectedPlan?.description && (
          <p className="text-sm text-indigo-600 mt-2 italic">
            {selectedPlan.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
      >
        Start Browsing <Wifi size={18} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white text-indigo-900 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-indigo-200 relative">
        {step !== 4 && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        )}
        
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">
            {step === 1 ? "Welcome to SurfZone" : 
             step === 2 ? (userType === "new" ? "Your Details" : "I’m Back!") : 
             step === 3 ? (isFreePlan ? "Confirm Activation" : "Confirm Payment") : 
             `Welcome, ${formData.fullName || "Guest"}!`}
          </h2>
        </div>

        {selectedPlan && step !== 4 && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-center flex items-center justify-center gap-2">
            <CheckCircle size={20} className="text-indigo-500" />
            <p className="text-sm font-semibold text-indigo-700">
              {isFreePlan ? "Activating: " : "Buying: "} 
              {selectedPlan.name} {!isFreePlan && `for KES ${selectedPlan.price}`}
            </p>
          </div>
        )}

        {step === 1 ? renderStep1() : 
         step === 2 ? renderStep2() : 
         step === 3 ? renderStep3() : 
         renderStep4()}
      </div>
    </div>
  );
};

export default AuthModal;