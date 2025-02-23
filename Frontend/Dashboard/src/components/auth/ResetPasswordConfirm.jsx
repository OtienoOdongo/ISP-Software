



// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
// import api from "../../../api";
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



import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle } from "react-icons/fa";
import api from "../../../api";
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
    const navigate = useNavigate();
    const { uid, token } = useParams();
    const { isAuthenticated } = useAuth();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            setSuccess(false);

            if (formState.newPassword !== formState.confirmNewPassword) {
                setError("Passwords do not match.");
                setLoading(false);
                return;
            }

            try {
                await api.post("/api/auth/users/reset_password_confirm/", {
                    uid,
                    token,
                    new_password: formState.newPassword,
                });
                setSuccess(true);
                setTimeout(() => navigate("/login", { replace: true }), 3000);
            } catch (error) {
                setError(error.response?.data?.detail || "Failed to reset password.");
            } finally {
                setLoading(false);
            }
        },
        [formState, uid, token, navigate]
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
                <h2 className="text-4xl font-extrabold text-center text-white mb-8">Reset Password</h2>

                {!success ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={formState.newPassword}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="**********"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmNewPassword"
                                    value={formState.confirmNewPassword}
                                    onChange={handleChange}
                                    className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="**********"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={toggleConfirmPasswordVisibility}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                        <p className="text-white">Password reset successfully!</p>
                        <p className="text-gray-400 mt-2">Redirecting to login in 3 seconds...</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Back to{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-blue-400 hover:underline"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;