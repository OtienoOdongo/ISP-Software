// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
// import api from "../../api"
// import { useAuth } from "../../context/AuthContext";

// const Activate = () => {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const navigate = useNavigate();
//     const { uid, token } = useParams();
//     const { isAuthenticated } = useAuth();

//     const handleActivation = useCallback(async () => {
//         setLoading(true);
//         setError("");
//         setSuccess(false);

//         try {
//             await api.post("/api/auth/users/activation/", { uid, token });
//             setSuccess(true);
//             setTimeout(() => navigate("/login", { replace: true }), 3000);
//         } catch (error) {
//             setError(error.response?.data?.detail || "Failed to activate account.");
//         } finally {
//             setLoading(false);
//         }
//     }, [uid, token, navigate]);

//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         } else if (uid && token) {
//             handleActivation();
//         } else {
//             setError("Invalid activation link.");
//             setLoading(false);
//         }
//     }, [uid, token, handleActivation, isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
//             <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
//                 <h2 className="text-4xl font-extrabold text-center text-white mb-8">Account Activation</h2>

//                 {loading && (
//                     <div className="text-center">
//                         <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
//                         <p className="text-gray-400">Activating your account...</p>
//                     </div>
//                 )}

//                 {success && (
//                     <div className="text-center">
//                         <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
//                         <p className="text-white">Account activated successfully!</p>
//                         <p className="text-gray-400 mt-2">Redirecting to login in 3 seconds...</p>
//                     </div>
//                 )}

//                 {error && (
//                     <div className="text-center">
//                         <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
//                         <p className="text-red-500">{error}</p>
//                         <button
//                             onClick={() => navigate("/signup")}
//                             className="mt-4 text-blue-400 hover:underline"
//                         >
//                             Try signing up again
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Activate;


// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaRedo } from "react-icons/fa";
// import { RiShieldCheckFill } from "react-icons/ri";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";

// const Activate = () => {
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);
//     const navigate = useNavigate();
//     const { uid, token } = useParams();
//     const { isAuthenticated } = useAuth();

//     const handleActivation = useCallback(async () => {
//         setLoading(true);
//         setError("");
//         setSuccess(false);

//         try {
//             await api.post("/api/auth/users/activation/", { uid, token });
//             setSuccess(true);
//             setTimeout(() => navigate("/login", { replace: true }), 3000);
//         } catch (error) {
//             setError(error.response?.data?.detail || 
//                 "Failed to activate account. The link may be invalid or expired.");
//             setRetryCount(prev => prev + 1);
//         } finally {
//             setLoading(false);
//         }
//     }, [uid, token, navigate]);

//     const handleRetry = useCallback(() => {
//         if (retryCount < 3) {
//             handleActivation();
//         } else {
//             navigate("/signup", { replace: true });
//         }
//     }, [handleActivation, retryCount, navigate]);

//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         } else if (uid && token) {
//             handleActivation();
//         } else {
//             setError("Invalid activation link.");
//             setLoading(false);
//         }
//     }, [uid, token, handleActivation, isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-teal-900 p-4">
//             <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
//                 <div className="flex justify-center mb-6">
//                     <RiShieldCheckFill className="text-teal-500 text-5xl" />
//                 </div>
//                 <h2 className="text-3xl font-bold text-center text-white mb-2">
//                     Account Activation
//                 </h2>

//                 {loading && (
//                     <div className="text-center py-8">
//                         <FaSpinner className="animate-spin text-teal-500 text-4xl mx-auto mb-4" />
//                         <p className="text-gray-400">Activating your account...</p>
//                     </div>
//                 )}

//                 {success && (
//                     <div className="text-center">
//                         <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
//                         <h3 className="text-xl font-bold text-white mb-2">
//                             Activation Successful!
//                         </h3>
//                         <p className="text-gray-400 mb-6">
//                             Your account has been activated. Redirecting to login...
//                         </p>
//                         <div className="w-full bg-gray-700 rounded-full h-1.5">
//                             <div 
//                                 className="bg-green-500 h-1.5 rounded-full animate-pulse" 
//                                 style={{ animationDuration: '3s' }}
//                             ></div>
//                         </div>
//                     </div>
//                 )}

//                 {error && (
//                     <div className="text-center">
//                         <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
//                         <h3 className="text-xl font-bold text-white mb-2">
//                             Activation Failed
//                         </h3>
//                         <p className="text-red-400 mb-4">{error}</p>
                        
//                         {retryCount < 3 ? (
//                             <button
//                                 onClick={handleRetry}
//                                 className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 mt-4"
//                             >
//                                 <span className="flex items-center justify-center">
//                                     <FaRedo className="mr-2" />
//                                     Try Again ({3 - retryCount} attempts left)
//                                 </span>
//                             </button>
//                         ) : (
//                             <button
//                                 onClick={handleRetry}
//                                 className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3.5 px-4 rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 mt-4"
//                             >
//                                 Go to Sign Up
//                             </button>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default React.memo(Activate);



import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaRedo } from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";
import { motion } from "framer-motion"; // Added for animations
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const Activate = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();
    const { uid, token } = useParams();
    const { isAuthenticated } = useAuth();

    const handleActivation = useCallback(async () => {
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await api.post("/api/auth/users/activation/", { uid, token });
            setSuccess(true);
            setTimeout(() => navigate("/login", { replace: true }), 3000);
        } catch (error) {
            setError(error.response?.data?.detail || 
                "Failed to activate account. The link may be invalid or expired.");
            setRetryCount(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    }, [uid, token, navigate]);

    const handleRetry = useCallback(() => {
        if (retryCount < 3) {
            handleActivation();
        } else {
            navigate("/signup", { replace: true });
        }
    }, [handleActivation, retryCount, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        } else if (uid && token) {
            handleActivation();
        } else {
            setError("Invalid activation link.");
            setLoading(false);
        }
    }, [uid, token, handleActivation, isAuthenticated, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50"
            >
                <div className="flex justify-center mb-6">
                    <RiShieldCheckFill className="text-gray-400 text-5xl" />
                </div>
                <h2 className="text-3xl font-bold text-center text-white mb-2">
                    Account Activation
                </h2>

                {loading && (
                    <div className="text-center py-8">
                        <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
                        <p className="text-gray-400">Activating your account...</p>
                    </div>
                )}

                {success && (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Activation Successful!
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Your account has been activated. Redirecting to login...
                        </p>
                        <div className="w-full bg-gray-900/50 rounded-full h-1.5">
                            <motion.div 
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 3, ease: "linear" }}
                                className="bg-green-500 h-1.5 rounded-full"
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center">
                        <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Activation Failed
                        </h3>
                        <p className="text-red-400 mb-4">{error}</p>
                        
                        {retryCount < 3 ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRetry}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                            >
                                <span className="flex items-center justify-center">
                                    <FaRedo className="mr-2" />
                                    Try Again ({3 - retryCount} attempts left)
                                </span>
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRetry}
                                className="w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white py-3.5 px-4 rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200"
                            >
                                Go to Sign Up
                            </motion.button>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default React.memo(Activate);