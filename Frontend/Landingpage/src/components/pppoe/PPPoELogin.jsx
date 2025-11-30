






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

//     try {
//       // Use the correct PPPoE authentication endpoint
//       const response = await api.post("/api/auth/clients/pppoe-authenticate/", {
//         username: username.toLowerCase().trim(),
//         password: password.trim()
//       }, { timeout: 5000 });

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
//                   disabled={loading}
//                 />
//               </div>
//               <p className="text-blue-300 text-xs mt-1">Enter your PPPoE username</p>
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
import { Network, User, Lock, Eye, EyeOff, Wifi, AlertCircle, CheckCircle, Shield } from "lucide-react";
import api from "../../api/index";

const PPPoELogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);

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
      // Use the enhanced PPPoE authentication endpoint
      const response = await api.post("/api/auth/clients/pppoe-authenticate/", {
        username: username.toLowerCase().trim(),
        password: password.trim()
      }, { timeout: 5000 });

      if (response.data.authenticated) {
        const client = response.data.client;
        const isAdminUser = client.user_type === 'admin' || client.user_type === 'superadmin';
        
        // Store remember me preferences
        if (rememberMe) {
          localStorage.setItem("pppoeRememberMe", "true");
          localStorage.setItem("pppoeUsername", username);
        } else {
          localStorage.removeItem("pppoeRememberMe");
          localStorage.removeItem("pppoeUsername");
        }

        setSuccess(`PPPoE authentication successful! ${isAdminUser ? 'Admin access granted.' : 'Redirecting...'}`);
        
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
    if (isAdminLogin) {
      alert("Admin PPPoE password reset: Please use the admin dashboard or contact system administrator.");
    } else {
      alert("PPPoE password reset requires support assistance. Please contact our support team with your username.");
    }
  };

  const handleCreateAccount = () => {
    if (isAdminLogin) {
      alert("Admin PPPoE accounts are created through the admin panel. Contact system administrator for access.");
    } else {
      alert("PPPoE accounts are created by administrators. Please contact support to create a new PPPoE account.");
    }
  };

  const toggleLoginType = () => {
    setIsAdminLogin(!isAdminLogin);
    setUsername("");
    setPassword("");
    setError("");
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
          <div className={`w-20 h-20 ${isAdminLogin ? 'bg-purple-500/20 border-purple-300/30' : 'bg-blue-500/20 border-blue-300/30'} rounded-full flex items-center justify-center mx-auto mb-4 border`}>
            {isAdminLogin ? (
              <Shield className="w-10 h-10 text-purple-300" />
            ) : (
              <Network className="w-10 h-10 text-blue-300" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAdminLogin ? 'Admin PPPoE Login' : 'PPPoE Login'}
          </h1>
          <p className="text-blue-100">
            {isAdminLogin 
              ? 'Administrator access for PPPoE management'
              : 'Enter your PPPoE credentials to manage your connection'
            }
          </p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/5 rounded-lg p-1 flex border border-white/10">
            <button
              onClick={() => setIsAdminLogin(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isAdminLogin 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              Client Login
            </button>
            <button
              onClick={() => setIsAdminLogin(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isAdminLogin 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              Admin Login
            </button>
          </div>
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
                {isAdminLogin ? 'Admin PPPoE Username' : 'PPPoE Username'}
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
                  placeholder={isAdminLogin ? "admin_pppoe" : "pppoe_username"}
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-blue-300 text-xs mt-1">
                {isAdminLogin ? 'Enter your admin PPPoE username' : 'Enter your PPPoE username'}
              </p>
            </div>

            <div>
              <label className="block text-blue-100 text-sm font-medium mb-2">
                {isAdminLogin ? 'Admin PPPoE Password' : 'PPPoE Password'}
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
            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${
              isAdminLogin 
                ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isAdminLogin ? 'Admin Authentication...' : 'Authenticating...'}
              </>
            ) : (
              <>
                {isAdminLogin ? <Shield className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                {isAdminLogin ? 'Admin PPPoE Login' : 'Login to PPPoE Portal'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            {isAdminLogin ? "Need admin access?" : "Don't have a PPPoE account?"}{" "}
            <button
              onClick={handleCreateAccount}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {isAdminLogin ? 'Contact Administrator' : 'Contact Support'}
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-300/20">
          <div className="text-center">
            <h4 className="text-blue-100 font-medium mb-3">
              {isAdminLogin ? 'Admin PPPoE Access' : 'PPPoE Connection Information'}
            </h4>
            <div className="text-blue-200 text-sm space-y-2">
              {isAdminLogin ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Elevated administrative privileges</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Network className="w-4 h-4" />
                    <span>Full network management access</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <User className="w-4 h-4" />
                    <span>User and client management</span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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
                {isAdminLogin 
                  ? 'Admin access provides full system control. Ensure you are authorized to use these credentials.'
                  : 'Your PPPoE credentials are encrypted and secure. Never share your password with anyone.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPPoELogin;