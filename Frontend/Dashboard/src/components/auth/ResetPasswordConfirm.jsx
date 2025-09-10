// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
// import api from "../../api"
// import { useAuth } from "../../context/AuthContext";

// const ResetPasswordConfirm = () => {
//     const [formState, setFormState] = useState({
//         newPassword: "",
//         confirmNewPassword: "",
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const navigate = useNavigate();
//     const { uid, token } = useParams();
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

//             if (formState.newPassword !== formState.confirmNewPassword) {
//                 setError("Passwords do not match.");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 await api.post("/api/auth/users/reset_password_confirm/", {
//                     uid,
//                     token,
//                     new_password: formState.newPassword,
//                 });
//                 setSuccess(true);
//                 setTimeout(() => navigate("/login", { replace: true }), 3000);
//             } catch (error) {
//                 setError(error.response?.data?.detail || "Failed to reset password.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState, uid, token, navigate]
//     );

//     const togglePasswordVisibility = useCallback(() => {
//         setShowPassword(!showPassword);
//     }, [showPassword]);

//     const toggleConfirmPasswordVisibility = useCallback(() => {
//         setShowConfirmPassword(!showConfirmPassword);
//     }, [showConfirmPassword]);

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
//                             <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
//                             <div className="relative">
//                                 <FaLock className="absolute left-3 top-3 text-gray-500" />
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="newPassword"
//                                     value={formState.newPassword}
//                                     onChange={handleChange}
//                                     className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="**********"
//                                     required
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={togglePasswordVisibility}
//                                     className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
//                                 >
//                                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
//                             <div className="relative">
//                                 <FaLock className="absolute left-3 top-3 text-gray-500" />
//                                 <input
//                                     type={showConfirmPassword ? "text" : "password"}
//                                     name="confirmNewPassword"
//                                     value={formState.confirmNewPassword}
//                                     onChange={handleChange}
//                                     className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="**********"
//                                     required
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={toggleConfirmPasswordVisibility}
//                                     className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
//                                 >
//                                     {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </button>
//                             </div>
//                         </div>

//                         {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                         >
//                             {loading ? <FaSpinner className="animate-spin" /> : "Reset Password"}
//                         </button>
//                     </form>
//                 ) : (
//                     <div className="text-center">
//                         <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
//                         <p className="text-white">Password reset successfully!</p>
//                         <p className="text-gray-400 mt-2">Redirecting to login in 3 seconds...</p>
//                     </div>
//                 )}

//                 <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-400">
//                         Back to{" "}
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

// export default ResetPasswordConfirm;



// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
// import { RiLockPasswordLine } from "react-icons/ri";
// import zxcvbn from "zxcvbn";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";

// const ResetPasswordConfirm = () => {
//     const [formState, setFormState] = useState({
//         newPassword: "",
//         confirmNewPassword: "",
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [passwordMatch, setPasswordMatch] = useState(false);
//     const navigate = useNavigate();
//     const { uid, token } = useParams();
//     const { isAuthenticated } = useAuth();

//     // Password strength calculation
//     const passwordStrength = zxcvbn(formState.newPassword || '');
//     const strengthPercentage = (passwordStrength.score * 100) / 4;

//     useEffect(() => {
//         setPasswordMatch(
//             formState.newPassword === formState.confirmNewPassword && 
//             formState.newPassword.length > 0
//         );
//     }, [formState.newPassword, formState.confirmNewPassword]);

//     const handleChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setFormState((prev) => ({ ...prev, [name]: value }));
//     }, []);

//     const handleSubmit = useCallback(
//         async (e) => {
//             e.preventDefault();
//             if (!passwordMatch) return;
            
//             setLoading(true);
//             setError("");
//             setSuccess(false);

//             try {
//                 await api.post("/api/auth/users/reset_password_confirm/", {
//                     uid,
//                     token,
//                     new_password: formState.newPassword,
//                 });
//                 setSuccess(true);
//                 setTimeout(() => navigate("/login", { replace: true }), 3000);
//             } catch (error) {
//                 setError(error.response?.data?.detail || 
//                     "Failed to reset password. The link may have expired.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState.newPassword, passwordMatch, uid, token, navigate]
//     );

//     const togglePasswordVisibility = useCallback(() => {
//         setShowPassword(!showPassword);
//     }, [showPassword]);

//     const toggleConfirmPasswordVisibility = useCallback(() => {
//         setShowConfirmPassword(!showConfirmPassword);
//     }, [showConfirmPassword]);

//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 p-4">
//             <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
//                 <div className="flex justify-center mb-6">
//                     <RiLockPasswordLine className="text-indigo-500 text-5xl" />
//                 </div>
//                 <h2 className="text-3xl font-bold text-center text-white mb-2">Set New Password</h2>
//                 <p className="text-center text-gray-400 mb-8">
//                     Create a strong new password for your account
//                 </p>

//                 {!success ? (
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-5">
//                             <label className="block text-sm font-medium text-gray-400 mb-2">
//                                 New Password
//                             </label>
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <FaLock className="text-gray-500" />
//                                 </div>
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="newPassword"
//                                     value={formState.newPassword}
//                                     onChange={handleChange}
//                                     className="pl-10 pr-10 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
//                                     placeholder="**********"
//                                     required
//                                     minLength="8"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={togglePasswordVisibility}
//                                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
//                                 >
//                                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </button>
//                             </div>
//                             {formState.newPassword && (
//                                 <div className="mt-2">
//                                     <div className="w-full bg-gray-700 rounded-full h-2">
//                                         <div 
//                                             className={`h-2 rounded-full ${
//                                                 passwordStrength.score === 0 ? 'bg-red-500' :
//                                                 passwordStrength.score === 1 ? 'bg-orange-500' :
//                                                 passwordStrength.score === 2 ? 'bg-yellow-500' :
//                                                 passwordStrength.score === 3 ? 'bg-blue-400' :
//                                                 'bg-green-500'
//                                             }`}
//                                             style={{ width: `${strengthPercentage}%` }}
//                                         ></div>
//                                     </div>
//                                     <p className="text-xs mt-1 text-gray-400">
//                                         Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength.score]}
//                                         {passwordStrength.feedback.suggestions.length > 0 && (
//                                             <span className="block mt-1">
//                                                 {passwordStrength.feedback.suggestions[0]}
//                                             </span>
//                                         )}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-400 mb-2">
//                                 Confirm New Password
//                             </label>
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                     <FaLock className="text-gray-500" />
//                                 </div>
//                                 <input
//                                     type={showConfirmPassword ? "text" : "password"}
//                                     name="confirmNewPassword"
//                                     value={formState.confirmNewPassword}
//                                     onChange={handleChange}
//                                     className={`pl-10 pr-10 w-full py-3 rounded-lg bg-gray-700 border ${
//                                         formState.confirmNewPassword ?
//                                             (passwordMatch ? 'border-green-500' : 'border-red-500') 
//                                             : 'border-gray-600'
//                                     } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
//                                     placeholder="**********"
//                                     required
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={toggleConfirmPasswordVisibility}
//                                     className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
//                                 >
//                                     {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </button>
//                             </div>
//                             {formState.confirmNewPassword && !passwordMatch && (
//                                 <p className="mt-1 text-xs text-red-400">
//                                     Passwords do not match
//                                 </p>
//                             )}
//                         </div>

//                         {error && (
//                             <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-lg text-sm">
//                                 {error}
//                             </div>
//                         )}

//                         <button
//                             type="submit"
//                             disabled={loading || !passwordMatch}
//                             className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
//                         >
//                             {loading ? (
//                                 <span className="flex items-center justify-center">
//                                     <FaSpinner className="animate-spin mr-2" />
//                                     Resetting...
//                                 </span>
//                             ) : "Reset Password"}
//                         </button>
//                     </form>
//                 ) : (
//                     <div className="text-center">
//                         <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
//                         <h3 className="text-xl font-bold text-white mb-2">
//                             Password Reset Successful!
//                         </h3>
//                         <p className="text-gray-400 mb-6">
//                             You will be redirected to login in a few seconds...
//                         </p>
//                         <div className="w-full bg-gray-700 rounded-full h-1.5">
//                             <div 
//                                 className="bg-green-500 h-1.5 rounded-full animate-pulse" 
//                                 style={{ animationDuration: '3s' }}
//                             ></div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default React.memo(ResetPasswordConfirm);





import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { motion } from "framer-motion"; // Added for animations
import zxcvbn from "zxcvbn";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

const ResetPasswordConfirm = () => {
    const [formState, setFormState] = useState({
        newPassword: "",
        confirmNewPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);
    const navigate = useNavigate();
    const { uid, token } = useParams();
    const { isAuthenticated } = useAuth();

    const passwordStrength = zxcvbn(formState.newPassword || '');
    const strengthPercentage = (passwordStrength.score * 100) / 4;

    useEffect(() => {
        setPasswordMatch(
            formState.newPassword === formState.confirmNewPassword && 
            formState.newPassword.length > 0
        );
    }, [formState.newPassword, formState.confirmNewPassword]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!passwordMatch) return;
            
            setLoading(true);
            setError("");
            setSuccess(false);

            try {
                await api.post("/api/auth/users/reset_password_confirm/", {
                    uid,
                    token,
                    new_password: formState.newPassword,
                });
                setSuccess(true);
                setTimeout(() => navigate("/login", { replace: true }), 3000);
            } catch (error) {
                setError(error.response?.data?.detail || 
                    "Failed to reset password. The link may have expired.");
            } finally {
                setLoading(false);
            }
        },
        [formState.newPassword, passwordMatch, uid, token, navigate]
    );

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(!showConfirmPassword);
    }, [showConfirmPassword]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50"
            >
                <div className="flex justify-center mb-6">
                    <RiLockPasswordLine className="text-gray-400 text-5xl" />
                </div>
                <h2 className="text-3xl font-bold text-center text-white mb-2">Set New Password</h2>
                <p className="text-center text-gray-400 mb-8">
                    Create a strong new password for your account
                </p>

                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={formState.newPassword}
                                    onChange={handleChange}
                                    className={`pl-10 pr-10 w-full py-3 rounded-lg bg-gray-900/70 border ${
                                        formState.newPassword ? 
                                            (passwordStrength.score >= 2 ? 'border-green-500' : 'border-red-500') 
                                            : 'border-gray-700'
                                    } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="**********"
                                    required
                                    minLength="8"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formState.newPassword && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-900/50 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-200 ${
                                                passwordStrength.score === 0 ? 'bg-red-500' :
                                                passwordStrength.score === 1 ? 'bg-orange-500' :
                                                passwordStrength.score === 2 ? 'bg-yellow-500' :
                                                passwordStrength.score === 3 ? 'bg-blue-400' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${strengthPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1 text-gray-400">
                                        Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength.score]}
                                        {passwordStrength.feedback.suggestions.length > 0 && (
                                            <span className="block mt-1">
                                                {passwordStrength.feedback.suggestions[0]}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmNewPassword"
                                    value={formState.confirmNewPassword}
                                    onChange={handleChange}
                                    className={`pl-10 pr-10 w-full py-3 rounded-lg bg-gray-900/70 border ${
                                        formState.confirmNewPassword ?
                                            (passwordMatch ? 'border-green-500' : 'border-red-500') 
                                            : 'border-gray-700'
                                    } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="**********"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formState.confirmNewPassword && !passwordMatch && (
                                <p className="mt-1 text-xs text-red-400">
                                    Passwords do not match
                                </p>
                            )}
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800/50"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading || !passwordMatch}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <FaSpinner className="animate-spin mr-2" />
                                    Resetting...
                                </span>
                            ) : "Reset Password"}
                        </motion.button>
                    </form>
                ) : (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Password Reset Successful!
                        </h3>
                        <p className="text-gray-400 mb-6">
                            You will be redirected to login in a few seconds...
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
            </motion.div>
        </div>
    );
};

export default React.memo(ResetPasswordConfirm);