// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaSpinner, FaCheckCircle } from "react-icons/fa";
// import api from "../../api"
// import { useAuth } from "../../context/AuthContext";

// const ResetPassword = () => {
//     const [formState, setFormState] = useState({ email: "" });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const navigate = useNavigate();
//     const { isAuthenticated } = useAuth();

//     const handleChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setFormState((prev) => ({ ...prev, [name]: value }));
//     }, []);

//     const handleSubmit = useCallback(
//         async (e) => {
//             e.preventDefault();
//             setLoading(true);
//             setError("");
//             setSuccess(false);

//             try {
//                 await api.post("/api/auth/users/reset_password/", { email: formState.email });
//                 setSuccess(true);
//             } catch (error) {
//                 setError(error.response?.data?.detail || "Failed to send reset email.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState.email]
//     );

//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
//             <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
//                 <h2 className="text-4xl font-extrabold text-center text-white mb-8">Reset Password</h2>

//                 {!success ? (
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
//                             <div className="relative">
//                                 <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formState.email}
//                                     onChange={handleChange}
//                                     className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="example@mail.com"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                         >
//                             {loading ? <FaSpinner className="animate-spin" /> : "Send Reset Link"}
//                         </button>
//                     </form>
//                 ) : (
//                     <div className="text-center">
//                         <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
//                         <p className="text-white">Reset link sent!</p>
//                         <p className="text-gray-400 mt-2">Check your email to reset your password.</p>
//                         <button
//                             onClick={() => navigate("/login")}
//                             className="mt-4 text-blue-400 hover:underline"
//                         >
//                             Back to Login
//                         </button>
//                     </div>
//                 )}

//                 <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-400">
//                         Remembered your password?{" "}
//                         <button
//                             onClick={() => navigate("/login")}
//                             className="text-blue-400 hover:underline"
//                         >
//                             Login
//                         </button>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ResetPassword;



import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaSpinner, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { RiMailSendLine } from "react-icons/ri";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const ResetPassword = () => {
    const [formState, setFormState] = useState({ email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const debounceTimer = useRef(null);

    // Email validation with debounce
    const validateEmail = useCallback((email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }, []);

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            setEmailValid(validateEmail(formState.email));
        }, 300);

        return () => clearTimeout(debounceTimer.current);
    }, [formState.email, validateEmail]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!emailValid) return;
            
            setLoading(true);
            setError("");
            setSuccess(false);

            try {
                await api.post("/api/auth/users/reset_password/", { 
                    email: formState.email 
                });
                setSuccess(true);
            } catch (error) {
                setError(error.response?.data?.detail || 
                    "Failed to send reset email. Please try again.");
            } finally {
                setLoading(false);
            }
        },
        [formState.email, emailValid]
    );

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 p-4">
            <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <FaArrowLeft className="mr-2" />
                    Back
                </button>

                <div className="flex justify-center mb-6">
                    <RiMailSendLine className="text-purple-500 text-5xl" />
                </div>
                <h2 className="text-3xl font-bold text-center text-white mb-2">Reset Password</h2>
                <p className="text-center text-gray-400 mb-8">
                    Enter your email to receive a reset link
                </p>

                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleChange}
                                    className={`pl-10 pr-4 w-full py-3 rounded-lg bg-gray-700 border ${
                                        formState.email ? 
                                            (emailValid ? 'border-green-500' : 'border-red-500') 
                                            : 'border-gray-600'
                                    } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                                    placeholder="example@mail.com"
                                    required
                                />
                                {formState.email && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {emailValid ? (
                                            <span className="text-green-500">✓</span>
                                        ) : (
                                            <span className="text-red-500">✗</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            {formState.email && !emailValid && (
                                <p className="mt-1 text-xs text-red-400">
                                    Please enter a valid email address
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !emailValid}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Sending...
                                </span>
                            ) : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Reset Link Sent!
                        </h3>
                        <p className="text-gray-400 mb-6">
                            We've sent a password reset link to <span className="text-white font-medium">{formState.email}</span>. 
                            Please check your inbox.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3.5 px-4 rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300"
                        >
                            Return to Login
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Remember your password?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ResetPassword);