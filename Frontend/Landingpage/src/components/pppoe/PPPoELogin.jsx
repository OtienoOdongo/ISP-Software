// import React, { useState } from "react";
// import { Ethernet, User, Lock, Eye, EyeOff, Wifi } from "lucide-react";

// const PPPoELogin = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (!username || !password) {
//       setError("Please enter both username and password");
//       setLoading(false);
//       return;
//     }

//     const result = await onLogin(username, password);
    
//     if (!result.success) {
//       setError(result.error);
//     }
    
//     setLoading(false);
//   };

//   const handleForgotPassword = () => {
//     // Redirect to password reset or show modal
//     alert("Please contact support to reset your PPPoE password.");
//   };

//   const handleCreateAccount = () => {
//     // Redirect to registration or show modal
//     alert("Please contact support to create a new PPPoE account.");
//   };

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4">
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
//             <Ethernet className="w-10 h-10 text-blue-300" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">PPPoE Login</h1>
//           <p className="text-blue-100">
//             Enter your PPPoE credentials to connect
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {error && (
//             <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
//               <p className="text-red-200 text-sm">{error}</p>
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Username
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                   placeholder="Enter your PPPoE username"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-10 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                   placeholder="Enter your PPPoE password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-blue-300" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-blue-300" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-blue-500 bg-white/5 border-blue-300/30 rounded focus:ring-blue-400 focus:ring-2"
//               />
//               <span className="ml-2 text-sm text-blue-100">Remember me</span>
//             </label>
            
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
//             >
//               Forgot Password?
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Connecting...
//               </>
//             ) : (
//               <>
//                 <Wifi className="w-4 h-4" />
//                 Connect to Internet
//               </>
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-blue-200 text-sm">
//             Don't have a PPPoE account?{" "}
//             <button
//               onClick={handleCreateAccount}
//               className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
//             >
//               Contact Support
//             </button>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t border-blue-300/20">
//           <div className="text-center">
//             <h4 className="text-blue-100 font-medium mb-2">PPPoE Connection Info</h4>
//             <div className="text-blue-200 text-sm space-y-1">
//               <p>• Use your provided PPPoE credentials</p>
//               <p>• Ensure Ethernet cable is properly connected</p>
//               <p>• Contact support for connection issues</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoELogin;





// import React, { useState } from "react";
// import { Network, User, Lock, Eye, EyeOff, Wifi, AlertCircle } from "lucide-react";
// import api from "../"

// const PPPoELogin = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     if (!username || !password) {
//       setError("Please enter both username and password");
//       setLoading(false);
//       return;
//     }

//     // Validate username format (typically starts with pppoe)
//     if (!username.toLowerCase().startsWith('pppoe')) {
//       setError("PPPoE username should start with 'pppoe'");
//       setLoading(false);
//       return;
//     }

//     try {
//       // ✅ CORRECTED: Using proper PPPoE authentication endpoint
//       const response = await api.post("/api/account/clients/pppoe-authenticate/", {
//         username,
//         password
//       });

//       if (response.data.authenticated) {
//         const client = response.data.client;
        
//         if (rememberMe) {
//           localStorage.setItem("pppoeRememberMe", "true");
//           localStorage.setItem("pppoeUsername", username);
//         } else {
//           localStorage.removeItem("pppoeRememberMe");
//           localStorage.removeItem("pppoeUsername");
//         }

//         const result = await onLogin(username, password, client);
        
//         if (!result.success) {
//           setError(result.error);
//         }
//       } else {
//         setError("Invalid PPPoE credentials. Please check your username and password.");
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       setError(error.response?.data?.error || "Login failed. Please check your credentials and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     // For PPPoE, password resets typically require support intervention
//     alert("PPPoE password reset requires support assistance. Please contact our support team with your username.");
//   };

//   const handleCreateAccount = () => {
//     // Redirect to registration or show information
//     alert("PPPoE accounts are created by administrators. Please contact support to create a new PPPoE account.");
//   };

//   // Load remembered username on component mount
//   React.useEffect(() => {
//     const remembered = localStorage.getItem("pppoeRememberMe");
//     const savedUsername = localStorage.getItem("pppoeUsername");
    
//     if (remembered === "true" && savedUsername) {
//       setUsername(savedUsername);
//       setRememberMe(true);
//     }
//   }, []);

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4">
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
//             <Network className="w-10 h-10 text-blue-300" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">PPPoE Login</h1>
//           <p className="text-blue-100">
//             Enter your PPPoE credentials to manage your connection
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {error && (
//             <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
//                 <p className="text-red-200 text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Username
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                   placeholder="pppoe_username"
//                   required
//                   pattern="pppoe.*"
//                   title="PPPoE username should start with 'pppoe'"
//                 />
//               </div>
//               <p className="text-blue-300 text-xs mt-1">Username typically starts with 'pppoe'</p>
//             </div>

//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-10 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//                   placeholder="Enter your PPPoE password"
//                   required
//                   minLength={6}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-blue-500 bg-white/5 border-blue-300/30 rounded focus:ring-blue-400 focus:ring-2"
//               />
//               <span className="ml-2 text-sm text-blue-100">Remember username</span>
//             </label>
            
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
//             >
//               Forgot Password?
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Authenticating...
//               </>
//             ) : (
//               <>
//                 <Wifi className="w-4 h-4" />
//                 Login to PPPoE Portal
//               </>
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-blue-200 text-sm">
//             Don't have a PPPoE account?{" "}
//             <button
//               onClick={handleCreateAccount}
//               className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
//             >
//               Contact Support
//             </button>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t border-blue-300/20">
//           <div className="text-center">
//             <h4 className="text-blue-100 font-medium mb-3">PPPoE Connection Information</h4>
//             <div className="text-blue-200 text-sm space-y-2">
//               <div className="flex items-center justify-center gap-2">
//                 <Network className="w-4 h-4" />
//                 <span>Wired Ethernet connection required</span>
//               </div>
//               <div className="flex items-center justify-center gap-2">
//                 <User className="w-4 h-4" />
//                 <span>Use provided PPPoE credentials</span>
//               </div>
//               <div className="flex items-center justify-center gap-2">
//                 <Lock className="w-4 h-4" />
//                 <span>Secure encrypted connection</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Security Notice */}
//         <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-yellow-200 text-sm font-medium">Security Notice</p>
//               <p className="text-yellow-300 text-xs">
//                 Your PPPoE credentials are encrypted and secure. Never share your password with anyone.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoELogin;










// import React, { useState, useEffect } from "react";
// import { Network, User, Lock, Eye, EyeOff, Wifi, AlertCircle, CheckCircle } from "lucide-react";
// import api from "../../api/index";

// const PPPoELogin = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     if (!username || !password) {
//       setError("Please enter both username and password");
//       setLoading(false);
//       return;
//     }

//     // Validate username format (typically starts with pppoe)
//     if (!username.toLowerCase().startsWith('pppoe')) {
//       setError("PPPoE username should start with 'pppoe'");
//       setLoading(false);
//       return;
//     }

//     try {
//       // ✅ CORRECTED: Using the proper PPPoE authentication endpoint
//       const response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//         username: username.toLowerCase().trim(),
//         password: password.trim()
//       });

//       if (response.data.authenticated) {
//         const client = response.data.client;
        
//         // Store remember me preferences
//         if (rememberMe) {
//           localStorage.setItem("pppoeRememberMe", "true");
//           localStorage.setItem("pppoeUsername", username);
//         } else {
//           localStorage.removeItem("pppoeRememberMe");
//           localStorage.removeItem("pppoeUsername");
//         }

//         setSuccess("PPPoE authentication successful! Redirecting...");
        
//         // Call the parent onLogin function
//         if (onLogin) {
//           const result = await onLogin(username, password, client);
          
//           if (result && !result.success) {
//             setError(result.error || "Login processing failed");
//             setSuccess("");
//           }
//         }
        
//         // Auto-redirect after success
//         setTimeout(() => {
//           window.location.href = "/dashboard";
//         }, 2000);
        
//       } else {
//         setError("Authentication failed. Please check your credentials.");
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       const errorMessage = error.response?.data?.error || 
//                           error.message || 
//                           "Login failed. Please check your credentials and try again.";
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     alert("PPPoE password reset requires support assistance. Please contact our support team with your username.");
//   };

//   const handleCreateAccount = () => {
//     alert("PPPoE accounts are created by administrators. Please contact support to create a new PPPoE account.");
//   };

//   // Load remembered username on component mount
//   useEffect(() => {
//     const remembered = localStorage.getItem("pppoeRememberMe");
//     const savedUsername = localStorage.getItem("pppoeUsername");
    
//     if (remembered === "true" && savedUsername) {
//       setUsername(savedUsername);
//       setRememberMe(true);
//     }
//   }, []);

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4">
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
//             <Network className="w-10 h-10 text-blue-300" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">PPPoE Login</h1>
//           <p className="text-blue-100">
//             Enter your PPPoE credentials to manage your connection
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {error && (
//             <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
//                 <p className="text-red-200 text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
//                 <p className="text-green-200 text-sm">{success}</p>
//               </div>
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Username
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
//                   placeholder="pppoe_username"
//                   required
//                   pattern="[Pp][Pp][Pp][Oo][Ee].*"
//                   title="PPPoE username should start with 'pppoe'"
//                   disabled={loading}
//                 />
//               </div>
//               <p className="text-blue-300 text-xs mt-1">Username typically starts with 'pppoe'</p>
//             </div>

//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-10 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter your PPPoE password"
//                   required
//                   minLength={6}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={loading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-blue-500 bg-white/5 border-blue-300/30 rounded focus:ring-blue-400 focus:ring-2 disabled:opacity-50"
//                 disabled={loading}
//               />
//               <span className="ml-2 text-sm text-blue-100">Remember username</span>
//             </label>
            
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               className="text-sm text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
//               disabled={loading}
//             >
//               Forgot Password?
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Authenticating...
//               </>
//             ) : (
//               <>
//                 <Wifi className="w-4 h-4" />
//                 Login to PPPoE Portal
//               </>
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-blue-200 text-sm">
//             Don't have a PPPoE account?{" "}
//             <button
//               onClick={handleCreateAccount}
//               className="text-blue-300 hover:text-blue-200 font-medium transition-colors disabled:opacity-50"
//               disabled={loading}
//             >
//               Contact Support
//             </button>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t border-blue-300/20">
//           <div className="text-center">
//             <h4 className="text-blue-100 font-medium mb-3">PPPoE Connection Information</h4>
//             <div className="text-blue-200 text-sm space-y-2">
//               <div className="flex items-center justify-center gap-2">
//                 <Network className="w-4 h-4" />
//                 <span>Wired Ethernet connection required</span>
//               </div>
//               <div className="flex items-center justify-center gap-2">
//                 <User className="w-4 h-4" />
//                 <span>Use provided PPPoE credentials</span>
//               </div>
//               <div className="flex items-center justify-center gap-2">
//                 <Lock className="w-4 h-4" />
//                 <span>Secure encrypted connection</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Security Notice */}
//         <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-yellow-200 text-sm font-medium">Security Notice</p>
//               <p className="text-yellow-300 text-xs">
//                 Your PPPoE credentials are encrypted and secure. Never share your password with anyone.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoELogin;











// import React, { useState, useEffect } from "react";
// import { Network, User, Lock, Eye, EyeOff, Wifi, AlertCircle, CheckCircle } from "lucide-react";
// import api from "../../api/index";

// const PPPoELogin = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     if (!username || !password) {
//       setError("Please enter both username and password");
//       setLoading(false);
//       return;
//     }

//     // Validate username format (typically starts with pppoe)
//     if (!username.toLowerCase().startsWith('pppoe')) {
//       setError("PPPoE username should start with 'pppoe'");
//       setLoading(false);
//       return;
//     }

//     try {
//       // Try authentication with fallback to demo mode
//       let response;
//       try {
//         response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//           username: username.toLowerCase().trim(),
//           password: password.trim()
//         }, { timeout: 3000 });
//       } catch (apiError) {
//         // If API fails, create demo client
//         console.warn("Authentication API failed, using demo mode:", apiError);
//         const mockClient = {
//           id: 2,
//           client_id: "CLT-PPPOE123",
//           phone_number: "+254712345678",
//           pppoe_username: username,
//           connection_type: "pppoe",
//           is_active: true,
//           date_joined: new Date().toISOString(),
//           username: username
//         };
        
//         setSuccess("PPPoE authentication successful! Redirecting...");
        
//         // Call the parent onLogin function with demo client
//         if (onLogin) {
//           await onLogin(username, password, mockClient);
//         }
        
//         setLoading(false);
//         return;
//       }

//       if (response.data.authenticated || response.data.success) {
//         const client = response.data.client || response.data;
        
//         // Store remember me preferences
//         if (rememberMe) {
//           localStorage.setItem("pppoeRememberMe", "true");
//           localStorage.setItem("pppoeUsername", username);
//         } else {
//           localStorage.removeItem("pppoeRememberMe");
//           localStorage.removeItem("pppoeUsername");
//         }

//         setSuccess("PPPoE authentication successful! Redirecting...");
        
//         // Call the parent onLogin function
//         if (onLogin) {
//           const result = await onLogin(username, password, client);
          
//           if (result && !result.success) {
//             setError(result.error || "Login processing failed");
//             setSuccess("");
//           }
//         }
        
//       } else {
//         setError("Authentication failed. Please check your credentials.");
//       }
//     } catch (error) {
//       console.error("PPPoE login failed:", error);
//       const errorMessage = error.response?.data?.error || 
//                           error.message || 
//                           "Login failed. Please check your credentials and try again.";
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     alert("PPPoE password reset requires support assistance. Please contact our support team with your username.");
//   };

//   const handleCreateAccount = () => {
//     alert("PPPoE accounts are created by administrators. Please contact support to create a new PPPoE account.");
//   };

//   // Load remembered username on component mount
//   useEffect(() => {
//     const remembered = localStorage.getItem("pppoeRememberMe");
//     const savedUsername = localStorage.getItem("pppoeUsername");
    
//     if (remembered === "true" && savedUsername) {
//       setUsername(savedUsername);
//       setRememberMe(true);
//     }
//   }, []);

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-4">
//       <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
//         <div className="text-center mb-8">
//           <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
//             <Network className="w-10 h-10 text-blue-300" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">PPPoE Login</h1>
//           <p className="text-blue-100">
//             Enter your PPPoE credentials to manage your connection
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {error && (
//             <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
//                 <p className="text-red-200 text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
//                 <p className="text-green-200 text-sm">{success}</p>
//               </div>
//             </div>
//           )}

//           <div className="space-y-4">
//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Username
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
//                   placeholder="pppoe_username"
//                   required
//                   pattern="[Pp][Pp][Pp][Oo][Ee].*"
//                   title="PPPoE username should start with 'pppoe'"
//                   disabled={loading}
//                 />
//               </div>
//               <p className="text-blue-300 text-xs mt-1">Username typically starts with 'pppoe'</p>
//             </div>

//             <div>
//               <label className="block text-blue-100 text-sm font-medium mb-2">
//                 PPPoE Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-blue-300" />
//                 </div>
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-10 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter your PPPoE password"
//                   required
//                   minLength={6}
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={loading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="w-4 h-4 text-blue-500 bg-white/5 border-blue-300/30 rounded focus:ring-blue-400 focus:ring-2 disabled:opacity-50"
//                 disabled={loading}
//               />
//               <span className="ml-2 text-sm text-blue-100">Remember username</span>
//             </label>
            
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               className="text-sm text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
//               disabled={loading}
//             >
//               Forgot Password?
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Authenticating...
//               </>
//             ) : (
//               <>
//                 <Wifi className="w-4 h-4" />
//                 Login to PPPoE Portal
//               </>
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center">
//           <p className="text-blue-200 text-sm">
//             Don't have a PPPoE account?{" "}
//             <button
//               onClick={handleCreateAccount}
//               className="text-blue-300 hover:text-blue-200 font-medium transition-colors disabled:opacity-50"
//               disabled={loading}
//             >
//               Contact Support
//             </button>
//           </p>
//         </div>

//         <div className="mt-8 pt-6 border-t border-blue-300/20">
//           <div className="text-center">
//             <h4 className="text-blue-100 font-medium mb-3">PPPoE Connection Information</h4>
//             <div className="text-blue-200 text-sm space-y-2">
//               <div className="flex items-center justify-center gap-2">
//                 <Network className="w-4 h-4" />
//                 <span>Wired Ethernet connection required</span>
//               </div>
//               <div className="flex items-center justify-center gap-2">
//                 <User className="w-4 h-4" />
//                 <span>Use provided PPPoE credentials</span>
//               </div>
//               <div className="flex items-center justify-center gap-2">
//                 <Lock className="w-4 h-4" />
//                 <span>Secure encrypted connection</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Security Notice */}
//         <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-yellow-200 text-sm font-medium">Security Notice</p>
//               <p className="text-yellow-300 text-xs">
//                 Your PPPoE credentials are encrypted and secure. Never share your password with anyone.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PPPoELogin;







import React, { useState, useEffect } from "react";
import { Network, User, Lock, Eye, EyeOff, Wifi, AlertCircle, CheckCircle } from "lucide-react";
import api from "../../api/index";

const PPPoELogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      // Use the correct PPPoE authentication endpoint
      const response = await api.post("/api/auth/clients/pppoe-authenticate/", {
        username: username.toLowerCase().trim(),
        password: password.trim()
      }, { timeout: 5000 });

      if (response.data.authenticated || response.data.success) {
        const client = response.data.client || response.data;
        
        // Store remember me preferences
        if (rememberMe) {
          localStorage.setItem("pppoeRememberMe", "true");
          localStorage.setItem("pppoeUsername", username);
        } else {
          localStorage.removeItem("pppoeRememberMe");
          localStorage.removeItem("pppoeUsername");
        }

        setSuccess("PPPoE authentication successful! Redirecting...");
        
        // Call the parent onLogin function
        if (onLogin) {
          const result = await onLogin(username, password, client);
          
          if (result && !result.success) {
            setError(result.error || "Login processing failed");
            setSuccess("");
          }
        }
        
      } else {
        setError("Authentication failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("PPPoE login failed:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("PPPoE password reset requires support assistance. Please contact our support team with your username.");
  };

  const handleCreateAccount = () => {
    alert("PPPoE accounts are created by administrators. Please contact support to create a new PPPoE account.");
  };

  // Load remembered username on component mount
  useEffect(() => {
    const remembered = localStorage.getItem("pppoeRememberMe");
    const savedUsername = localStorage.getItem("pppoeUsername");
    
    if (remembered === "true" && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-300/30">
            <Network className="w-10 h-10 text-blue-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">PPPoE Login</h1>
          <p className="text-blue-100">
            Enter your PPPoE credentials to manage your connection
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">
                PPPoE Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="pppoe_username"
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-blue-300 text-xs mt-1">Enter your PPPoE username</p>
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">
                PPPoE Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-blue-300/30 rounded-lg bg-white/5 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your PPPoE password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-white/5 border-blue-300/30 rounded focus:ring-blue-400 focus:ring-2 disabled:opacity-50"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-blue-100">Remember username</span>
            </label>
            
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                Login to PPPoE Portal
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            Don't have a PPPoE account?{" "}
            <button
              onClick={handleCreateAccount}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Contact Support
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-300/20">
          <div className="text-center">
            <h4 className="text-blue-100 font-medium mb-3">PPPoE Connection Information</h4>
            <div className="text-blue-200 text-sm space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Network className="w-4 h-4" />
                <span>Wired Ethernet connection required</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                <span>Use provided PPPoE credentials</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure encrypted connection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 text-sm font-medium">Security Notice</p>
              <p className="text-yellow-300 text-xs">
                Your PPPoE credentials are encrypted and secure. Never share your password with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPPoELogin;